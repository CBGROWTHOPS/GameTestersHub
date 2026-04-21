/**
 * GameTestersHub - Quiz Funnel
 * 3-step micro-commitment quiz, no lead capture.
 * Flow: Q1 -> Q2 -> Q3 -> matching animation -> offers page
 */

// Quiz state
let currentStep = 1;
const totalSteps = 3;
const quizAnswers = {};

// Quiz data
const quizSteps = [
  {
    id: 'interest',
    question: 'Would you use an app that pays for your lunch every day?',
    subtext: '100% free. No credit card, no downloads.',
    progressLabel: 'Quick start',
    options: [
      { value: 'yes_show', label: 'Yes, show me how' },
      { value: 'obviously', label: 'Obviously' },
      { value: 'if_works', label: 'If it actually works, yeah' },
      { value: 'try', label: 'I\'d try it' }
    ]
  },
  {
    id: 'payout_method',
    question: 'How do you want to get paid?',
    subtext: 'Real cashouts. Over 2 million users have been paid out.',
    progressLabel: 'Halfway there',
    options: [
      { value: 'paypal', label: 'PayPal' },
      { value: 'amazon', label: 'Amazon Gift Card' },
      { value: 'crypto', label: 'Crypto' },
      { value: 'cashapp', label: 'Cash App' }
    ]
  },
  {
    id: 'time_available',
    question: 'How much time per day can you spend?',
    subtext: 'Even 10 minutes a day adds up &mdash; use it on breaks or while watching TV.',
    progressLabel: 'Almost done',
    options: [
      { value: 'under_15', label: 'Under 15 minutes' },
      { value: '15_30', label: '15 - 30 minutes' },
      { value: '30_60', label: '30 - 60 minutes' },
      { value: '60_plus', label: '1+ hours' }
    ]
  }
];

/**
 * Initialize funnel on page load
 */
function initFunnel() {
  const container = document.getElementById('funnel-content');
  if (!container) return; // Not on funnel page
  
  // Track quiz start
  if (window.GameTestersTracking) {
    window.GameTestersTracking.trackEvent('InitiateCheckout');
  }
  
  renderStep();
}

/**
 * Update progress bar
 */
function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const backNav = document.getElementById('funnel-nav');

  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Warmer per-step labels
  if (progressLabel) {
    let label = `Step ${currentStep} of ${totalSteps}`;
    if (currentStep <= quizSteps.length && quizSteps[currentStep - 1].progressLabel) {
      label = quizSteps[currentStep - 1].progressLabel;
    } else if (currentStep > quizSteps.length) {
      label = 'Finding your match';
    }
    progressLabel.textContent = label;
  }

  if (backNav) {
    backNav.style.display = currentStep > 1 ? 'flex' : 'none';
  }
}

/**
 * Go back one step
 */
function goBack() {
  if (currentStep > 1) {
    currentStep--;
    renderStep();
  }
}

/**
 * Render current step
 */
function renderStep() {
  const container = document.getElementById('funnel-content');
  if (!container) return;
  
  updateProgress();
  
  // Add fade-out animation
  container.classList.add('fade-out');
  
  setTimeout(() => {
    if (currentStep <= quizSteps.length) {
      // Render quiz question
      const step = quizSteps[currentStep - 1];
      container.innerHTML = `
        <div class="funnel-step">
          <h2 class="funnel-question">${step.question}</h2>
          ${step.subtext ? `<p class="funnel-subtext">${step.subtext}</p>` : ''}
          ${step.showTestimonial ? renderTestimonial() : ''}
          <div class="funnel-options">
            ${step.options.map(opt => `
              <button class="funnel-option" onclick="selectOption('${step.id}', '${opt.value}', this)">
                ${opt.icon ? `<span class="option-icon" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${opt.iconBg};color:#fff;font-weight:700;font-size:15px;margin-right:12px;vertical-align:middle;">${opt.icon}</span>` : ''}
                ${opt.label}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      renderMatching();
    }
    
    // Fade in
    container.classList.remove('fade-out');
    container.classList.add('fade-in');
    
    setTimeout(() => {
      container.classList.remove('fade-in');
    }, 300);
  }, 150);
}

/**
 * Rotating testimonial card. Displayed on steps that have showTestimonial: true.
 * Picks a random testimonial per render so repeat visitors see variety.
 */
const TESTIMONIALS = [
  { stars: 5, text: 'Cashed out $47 my first week just playing games on my breaks.', author: 'Jake R.' },
  { stars: 5, text: 'Didn\'t believe it at first but I\'ve been eating out on this for a month now.', author: 'Marcus T.' },
  { stars: 5, text: 'Easiest signup ever. Got my first payout to PayPal in 3 days.', author: 'Dani K.' }
];

function renderTestimonial() {
  const t = TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)];
  return `
    <div class="funnel-testimonial" style="background:#1a1a25;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 16px;margin:16px 0 20px;display:flex;gap:12px;align-items:flex-start;">
      <div style="flex-shrink:0;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px;">${t.author.charAt(0)}</div>
      <div style="flex:1;min-width:0;">
        <div style="color:#fbbf24;font-size:13px;letter-spacing:1px;">${'&#9733;'.repeat(t.stars)}</div>
        <p style="font-size:14px;color:#e5e5e5;line-height:1.4;margin:4px 0 2px;">&ldquo;${t.text}&rdquo;</p>
        <p style="font-size:12px;color:#a0a0b0;">&mdash; ${t.author}</p>
      </div>
    </div>
  `;
}

/**
 * Select quiz option and advance
 */
function selectOption(questionId, value, button) {
  quizAnswers[questionId] = value;
  
  // Visual feedback
  const options = document.querySelectorAll('.funnel-option');
  options.forEach(opt => opt.classList.remove('selected'));
  button.classList.add('selected');
  
  // GA4: track quiz step completion
  if (typeof gtag !== 'undefined') {
    gtag('event', 'funnel_step_complete', {
      funnel_name: 'gth_quiz',
      step_number: currentStep,
      step_name: questionId,
      step_value: value,
    });
  }

  // Advance after brief delay
  setTimeout(() => {
    currentStep++;
    renderStep();
  }, 250);
}

/**
 * After the final quiz question, play a 3s matching animation and redirect
 * to the offers page. Sunk-cost design: the animation + quiz progress carry
 * the user past Freecash's own first-question drop-off.
 */
function renderMatching() {
  const container = document.getElementById('funnel-content');
  const backNav = document.getElementById('funnel-nav');
  if (backNav) backNav.style.display = 'none';

  container.innerHTML = `
    <div class="funnel-step" style="text-align:center;padding:40px 20px;">
      <div class="matching-spinner" style="
        width:56px;height:56px;
        border:4px solid rgba(139,92,246,0.2);
        border-top-color:#8b5cf6;
        border-radius:50%;
        margin:0 auto 24px;
        animation:spin 0.8s linear infinite;
      "></div>
      <h2 class="funnel-question" id="matching-text">Matching you with the best offer...</h2>
      <p class="funnel-subtext" id="matching-sub" style="margin-top:12px;">
        Checking based on your answers
      </p>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `;

  const messages = [
    { delay: 0,    text: 'Matching you with the best offer...', sub: 'Checking based on your answers' },
    { delay: 1200, text: 'Found a match.',                      sub: 'Finalizing your recommendation' },
    { delay: 2400, text: 'You\'re matched.',                    sub: 'Redirecting...' }
  ];

  messages.forEach(m => {
    setTimeout(() => {
      const t = document.getElementById('matching-text');
      const s = document.getElementById('matching-sub');
      if (t) t.textContent = m.text;
      if (s) s.textContent = m.sub;
    }, m.delay);
  });

  // GA4: quiz completion (Lead pixel still fires on offer click, not here)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'quiz_complete', {
      funnel_name: 'gth_quiz',
      interest: quizAnswers.interest,
      payout_method: quizAnswers.payout_method,
      time_available: quizAnswers.time_available,
    });
  }

  setTimeout(() => {
    const trackingInfo = window.GameTestersTracking
      ? (window.GameTestersTracking.getTrackingData() || {})
      : {};
    window.location.href = buildOffersUrl(trackingInfo);
  }, 3200);
}

/**
 * Build offers URL with tracking params. No PII (no form capture).
 */
function buildOffersUrl(trackingInfo) {
  const params = new URLSearchParams();
  if (trackingInfo.fbclid)   params.set('fbclid', trackingInfo.fbclid);
  if (trackingInfo.fbc)      params.set('fbc', trackingInfo.fbc);
  if (trackingInfo.fbp)      params.set('fbp', trackingInfo.fbp);
  if (trackingInfo.uuid)     params.set('uuid', trackingInfo.uuid);
  if (trackingInfo.event_id) params.set('event_id', trackingInfo.event_id);

  const qs = params.toString();
  return qs ? `/offers?${qs}` : '/offers';
}

/**
 * Toggle FAQ accordion (for landing page)
 */
function toggleFaq(button) {
  const faqItem = button.parentElement;
  const isActive = faqItem.classList.contains('active');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Toggle current
  if (!isActive) {
    faqItem.classList.add('active');
  }
}

// Initialize funnel when DOM is ready
document.addEventListener('DOMContentLoaded', initFunnel);
