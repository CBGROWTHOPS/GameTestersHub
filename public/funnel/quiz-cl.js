/**
 * GameTestersHub - Craigslist-Traffic Quiz Funnel
 * Separate version for /start-cl. Framed as a gig / part-time job intake to
 * match the expectations of users arriving from Craigslist classified ads.
 * Flow: Q1 availability -> Q2 work type -> Q3 payment method -> matching -> offers
 */

let currentStep = 1;
const totalSteps = 3;
const quizAnswers = {};

const quizSteps = [
  {
    id: 'hours_available',
    question: 'How many hours per week are you available?',
    subtext: 'We match you to gigs that fit your schedule.',
    progressLabel: 'Availability',
    options: [
      { value: 'under_5',  label: 'Under 5 hours (evenings/weekends)' },
      { value: '5_10',     label: '5-10 hours' },
      { value: '10_20',    label: '10-20 hours' },
      { value: '20_plus',  label: '20+ hours' }
    ]
  },
  {
    id: 'work_type',
    question: 'What type of remote gig interests you most?',
    subtext: 'Pick the one that fits best. You can take others later.',
    progressLabel: 'Work preference',
    options: [
      { value: 'app_testing',  label: 'App & software testing' },
      { value: 'game_testing', label: 'Game testing' },
      { value: 'reviews',      label: 'Product reviews & surveys' },
      { value: 'any',          label: 'Open to any paid gig' }
    ]
  },
  {
    id: 'payout_method',
    question: 'How would you like to be paid?',
    subtext: 'Standard payout options. All free.',
    progressLabel: 'Almost done',
    options: [
      { value: 'paypal',          label: 'PayPal' },
      { value: 'cashapp',         label: 'Cash App' },
      { value: 'amazon',          label: 'Amazon Gift Card' },
      { value: 'direct_deposit',  label: 'Direct deposit' }
    ]
  }
];

function initFunnel() {
  const container = document.getElementById('funnel-content');
  if (!container) return;

  if (window.GameTestersTracking) {
    window.GameTestersTracking.trackEvent('InitiateCheckout');
  }

  renderStep();
}

function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const backNav = document.getElementById('funnel-nav');

  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }

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

function goBack() {
  if (currentStep > 1) {
    currentStep--;
    renderStep();
  }
}

function renderStep() {
  const container = document.getElementById('funnel-content');
  if (!container) return;

  updateProgress();

  container.classList.add('fade-out');

  setTimeout(() => {
    if (currentStep <= quizSteps.length) {
      const step = quizSteps[currentStep - 1];
      container.innerHTML = `
        <div class="funnel-step">
          <h2 class="funnel-question">${step.question}</h2>
          ${step.subtext ? `<p class="funnel-subtext">${step.subtext}</p>` : ''}
          <div class="funnel-options">
            ${step.options.map(opt => `
              <button class="funnel-option" onclick="selectOption('${step.id}', '${opt.value}', this)">
                ${opt.label}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      renderMatching();
    }

    container.classList.remove('fade-out');
    container.classList.add('fade-in');

    setTimeout(() => {
      container.classList.remove('fade-in');
    }, 300);
  }, 150);
}

function selectOption(questionId, value, button) {
  quizAnswers[questionId] = value;

  const options = document.querySelectorAll('.funnel-option');
  options.forEach(opt => opt.classList.remove('selected'));
  button.classList.add('selected');

  if (typeof gtag !== 'undefined') {
    gtag('event', 'funnel_step_complete', {
      funnel_name: 'gth_quiz_cl',
      step_number: currentStep,
      step_name: questionId,
      step_value: value,
    });
  }

  setTimeout(() => {
    currentStep++;
    renderStep();
  }, 250);
}

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
      <h2 class="funnel-question" id="matching-text">Matching you with the best opportunity...</h2>
      <p class="funnel-subtext" id="matching-sub" style="margin-top:12px;">
        Checking based on your availability and preferences
      </p>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `;

  const messages = [
    { delay: 0,    text: 'Matching you with the best opportunity...', sub: 'Checking based on your availability and preferences' },
    { delay: 1200, text: 'Found a match.',                            sub: 'Finalizing your placement' },
    { delay: 2400, text: 'You\'re matched.',                          sub: 'Redirecting...' }
  ];

  messages.forEach(m => {
    setTimeout(() => {
      const t = document.getElementById('matching-text');
      const s = document.getElementById('matching-sub');
      if (t) t.textContent = m.text;
      if (s) s.textContent = m.sub;
    }, m.delay);
  });

  if (typeof gtag !== 'undefined') {
    gtag('event', 'quiz_complete', {
      funnel_name: 'gth_quiz_cl',
      hours_available: quizAnswers.hours_available,
      work_type: quizAnswers.work_type,
      payout_method: quizAnswers.payout_method,
    });
  }

  setTimeout(() => {
    const trackingInfo = window.GameTestersTracking
      ? (window.GameTestersTracking.getTrackingData() || {})
      : {};
    window.location.href = buildOffersUrl(trackingInfo);
  }, 3200);
}

function buildOffersUrl(trackingInfo) {
  const params = new URLSearchParams();
  if (trackingInfo.fbclid)   params.set('fbclid', trackingInfo.fbclid);
  if (trackingInfo.fbc)      params.set('fbc', trackingInfo.fbc);
  if (trackingInfo.fbp)      params.set('fbp', trackingInfo.fbp);
  if (trackingInfo.uuid)     params.set('uuid', trackingInfo.uuid);
  if (trackingInfo.event_id) params.set('event_id', trackingInfo.event_id);
  params.set('utm_source', 'craigslist');

  const qs = params.toString();
  return qs ? `/offers?${qs}` : '/offers';
}

document.addEventListener('DOMContentLoaded', initFunnel);
