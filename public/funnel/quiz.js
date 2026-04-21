/**
 * GameTestersHub - Quiz Funnel
 * 5-step engagement quiz + contact form
 * Page-based funnel (not modal)
 */

// Same-origin proxy = no CORS, no external deps
const SUBMIT_URL = '/api/submit-lead';


// Quiz state
let currentStep = 1;
const totalSteps = 4;
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
    showTestimonial: true,
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
      label = 'Just your info';
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
      // Render contact form
      renderContactForm();
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
 * Render contact form (final step)
 */
function renderContactForm() {
  const container = document.getElementById('funnel-content');
  
  container.innerHTML = `
    <div class="funnel-step">
      <h2 class="funnel-question">Last step &mdash; where should we send your match?</h2>
      <p class="funnel-subtext">No spam. No credit card. Unsubscribe anytime.</p>

      <form class="funnel-form" onsubmit="submitForm(event)">
        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name</label>
            <input type="text" id="first_name" name="first_name" placeholder="John" required>
          </div>
          <div class="form-group">
            <label for="last_name">Last Name</label>
            <input type="text" id="last_name" name="last_name" placeholder="Smith" required>
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="john@example.com" required>
        </div>
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567" required>
        </div>
        <div class="form-group">
          <label for="zip">Zip Code</label>
          <input type="text" id="zip" name="zip" placeholder="12345" required pattern="[0-9]{5}" maxlength="5">
        </div>
        <button type="submit" class="funnel-submit" id="submit-btn">
          Show My Match
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <p class="form-disclaimer">
          By submitting, you agree to receive emails about this offer. Unsubscribe anytime.
        </p>
      </form>
    </div>
  `;
}

/**
 * Ensure tracking is ready (event_id exists). No fallback UUID - prevents dedup mismatch.
 * @returns {{ trackingInfo: object, eventId: string } | null} - null if not ready
 */
function ensureTrackingReady() {
  if (!window.GameTestersTracking) return null;
  var trackingInfo = window.GameTestersTracking.getTrackingData();
  if (!trackingInfo || !trackingInfo.event_id) return null;
  return { trackingInfo: trackingInfo, eventId: trackingInfo.event_id };
}

/**
 * Submit form
 */
async function submitForm(event) {
  event.preventDefault();

  var submitBtn = document.getElementById('submit-btn');
  var originalHTML = submitBtn.innerHTML;

  // Wait for tracking.event_id — no fallback UUID (root cause of dedup mismatch)
  var ready = ensureTrackingReady();
  if (!ready) {
    console.error('[GTH Lead] Tracking not ready - event_id missing. Blocking submit.');
    submitBtn.innerHTML = 'Loading... please try again';
    submitBtn.disabled = false;
    setTimeout(function() {
      submitBtn.innerHTML = originalHTML;
    }, 2000);
    return;
  }

  var trackingInfo = ready.trackingInfo;
  var eventId = ready.eventId;

  // uuid always from getOrCreateSessionUuid (never undefined)
  var uuid = trackingInfo.uuid;
  if (!uuid && window.GameTestersTracking.getOrCreateSessionUuid) {
    uuid = window.GameTestersTracking.getOrCreateSessionUuid();
  }

  // GA4: quiz completion (not Lead — Lead fires on offer wall click)
  if (typeof gtag !== 'undefined') {
    gtag('set', 'user_properties', {
      user_game_preference: quizAnswers.game_preference || '',
      user_platform: quizAnswers.platform || '',
      user_availability: quizAnswers.availability || '',
    });
    gtag('event', 'quiz_complete', {
      funnel_name: 'gth_quiz',
      game_preference: quizAnswers.game_preference,
      platform: quizAnswers.platform,
      event_id: eventId,
    });
  }

  // Lead pixel moved to offer wall page — fires on offer click, not quiz submit

  console.log('[GTH Lead] PIXEL event_id:', JSON.stringify(eventId), 'length:', eventId.length, 'bytes:', new TextEncoder().encode(eventId).length);
  console.log('[GTH Lead] uuid for external_id:', uuid ? 'present' : 'MISSING', uuid);

  var payload = {
    email: document.getElementById('email').value.trim(),
    firstName: document.getElementById('first_name').value.trim(),
    lastName: document.getElementById('last_name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    uuid: uuid,
    fbc: trackingInfo.fbc || null,
    fbclid: trackingInfo.fbclid || null,
    fbp: trackingInfo.fbp || null,
    source: 'gametestershub',
    event_id: eventId,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };

  console.log('[GTH Lead] CAPI payload event_id:', JSON.stringify(payload.event_id), 'uuid:', JSON.stringify(payload.uuid));

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span>Submitting...';

  try {
    var res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('submit-lead:', res.status, await res.text());

    if (window.GameTestersTracking && window.GameTestersTracking.clearLeadEventId) {
      window.GameTestersTracking.clearLeadEventId();
    }
    window.location.href = buildContinueUrl(trackingInfo, payload);
  } catch (err) {
    console.error('Submission error:', err);
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    var fallbackInfo = window.GameTestersTracking ? window.GameTestersTracking.getTrackingData() : {};
    window.location.href = buildContinueUrl(fallbackInfo, payload);
  }
}

/**
 * Build continue page URL with tracking parameters
 * Continue page handles the scanning animation before showing the offer
 * Passes cmc_ parameters for ClickMagick cross-device tracking
 */
function buildContinueUrl(trackingInfo, formData) {
  const params = new URLSearchParams();

  if (trackingInfo.fbclid) params.set('fbclid', trackingInfo.fbclid);
  if (trackingInfo.fbc) params.set('fbc', trackingInfo.fbc);
  if (trackingInfo.fbp) params.set('fbp', trackingInfo.fbp);
  if (trackingInfo.uuid) params.set('uuid', trackingInfo.uuid);
  if (trackingInfo.event_id) params.set('event_id', trackingInfo.event_id);

  // ClickMagick cross-device tracking: cmc_ params picked up by cmc.js on continue page
  if (formData) {
    if (formData.email) params.set('cmc_email', formData.email);
    if (formData.firstName) params.set('cmc_firstname', formData.firstName);
    if (formData.lastName) params.set('cmc_lastname', formData.lastName);
    if (formData.phone) params.set('cmc_phone', formData.phone);
    if (formData.zip) params.set('cmc_postal_code', formData.zip);
  }

  const queryString = params.toString();
  return queryString ? `/offers?${queryString}` : '/offers';
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
