/**
 * GameTestersHub - Quiz Funnel
 * 5-step engagement quiz + contact form
 * Page-based funnel (not modal)
 */

// Same-origin proxy = no CORS, no external deps
const SUBMIT_URL = '/api/submit-lead';
const BEMOB_CAMPAIGN_URL = 'https://s5ljw.bemobtrcks.com/go/70033a3a-1ac6-425e-9525-725a7d39d6ad';

// Quiz state
let currentStep = 1;
const totalSteps = 6;
const quizAnswers = {};

// Quiz data
const quizSteps = [
  {
    id: 'game_preference',
    question: 'What type of games do you enjoy most?',
    options: [
      { value: 'action', label: 'Action / Shooter' },
      { value: 'rpg', label: 'RPG / Adventure' },
      { value: 'sports', label: 'Sports / Racing' },
      { value: 'puzzle', label: 'Puzzle / Strategy' },
      { value: 'casino', label: 'Casino / Slots' },
      { value: 'all', label: 'I love all types!' }
    ]
  },
  {
    id: 'platform',
    question: 'What device do you primarily game on?',
    options: [
      { value: 'pc', label: 'PC / Desktop' },
      { value: 'playstation', label: 'PlayStation' },
      { value: 'xbox', label: 'Xbox' },
      { value: 'switch', label: 'Nintendo Switch' },
      { value: 'mobile', label: 'Mobile (iOS/Android)' },
      { value: 'multiple', label: 'Multiple platforms' }
    ]
  },
  {
    id: 'availability',
    question: 'How many hours per week can you dedicate?',
    options: [
      { value: '5-10', label: '5-10 hours' },
      { value: '10-20', label: '10-20 hours' },
      { value: '20-40', label: '20-40 hours' },
      { value: '40+', label: '40+ hours (full-time)' }
    ]
  },
  {
    id: 'experience',
    question: 'Have you tested games before?',
    options: [
      { value: 'professional', label: 'Yes, professionally' },
      { value: 'beta', label: 'Yes, beta tests for fun' },
      { value: 'interested', label: 'No, but I\'m interested' },
      { value: 'none', label: 'No experience' }
    ]
  },
  {
    id: 'motivation',
    question: 'What\'s most important to you?',
    options: [
      { value: 'income', label: 'Earning extra income' },
      { value: 'early_access', label: 'Playing games before anyone else' },
      { value: 'improve', label: 'Helping improve games I love' },
      { value: 'career', label: 'Building a career in gaming' },
      { value: 'all', label: 'All of the above!' }
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
  const stepIndicator = document.getElementById('current-step');
  const totalIndicator = document.getElementById('total-steps');
  const backNav = document.getElementById('funnel-nav');
  
  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
  
  if (stepIndicator) {
    stepIndicator.textContent = currentStep;
  }
  
  if (totalIndicator) {
    totalIndicator.textContent = totalSteps;
  }
  
  // Show back button after first step
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
 * Select quiz option and advance
 */
function selectOption(questionId, value, button) {
  quizAnswers[questionId] = value;
  
  // Visual feedback
  const options = document.querySelectorAll('.funnel-option');
  options.forEach(opt => opt.classList.remove('selected'));
  button.classList.add('selected');
  
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
      <div class="funnel-success-badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        You Qualify!
      </div>
      <h2 class="funnel-question">Great news! You're eligible for testing opportunities.</h2>
      <p class="funnel-subtext">Enter your details below to receive game testing offers matched to your profile.</p>
      
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
          Get My Testing Opportunities
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <p class="form-disclaimer">
          By submitting, you agree to receive emails about game testing opportunities. 
          Unsubscribe anytime.
        </p>
      </form>
    </div>
  `;
}

/**
 * Submit form
 */
async function submitForm(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  const originalHTML = submitBtn.innerHTML;
  
  // Get form data
  const firstName = document.getElementById('first_name').value.trim();
  const lastName = document.getElementById('last_name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const zip = document.getElementById('zip').value.trim();
  
  // Get tracking data
  let trackingInfo = {};
  if (window.GameTestersTracking) {
    trackingInfo = window.GameTestersTracking.getTrackingData();
  }

  // Unique event_id per submit for pixel + CAPI deduplication (must match in both)
  const eventId = trackingInfo.event_id || 'lead_' + generateFallbackUUID();

  // eventID in 4th arg; value/currency for valid price (Facebook requires for Lead)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', { value: 1, currency: 'USD' }, { eventID: eventId });
  }

  // Build payload matching Supabase edge function schema
  const payload = {
    email,
    firstName,
    lastName,
    phone,
    zip,
    uuid: trackingInfo.uuid || generateFallbackUUID(),
    fbc: trackingInfo.fbc || null,
    fbclid: trackingInfo.fbclid || null,
    fbp: trackingInfo.fbp || null,
    source: 'gametestershub',
    event_id: eventId,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span>Submitting...';
  
  try {
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('submit-lead:', res.status, await res.text());

    if (window.GameTestersTracking && window.GameTestersTracking.clearLeadEventId) {
      window.GameTestersTracking.clearLeadEventId();
    }
    window.location.href = buildContinueUrl(trackingInfo);

  } catch (error) {
    console.error('Submission error:', error);
    
    // Still redirect on error (don't lose the lead)
    const trackingInfo = window.GameTestersTracking ? window.GameTestersTracking.getTrackingData() : {};
    window.location.href = buildContinueUrl(trackingInfo);
  }
}

/**
 * Fallback UUID generator
 */
function generateFallbackUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Build continue page URL with tracking parameters
 * Continue page handles the scanning animation before showing BeMob offer
 */
function buildContinueUrl(trackingInfo) {
  const params = new URLSearchParams();
  
  if (trackingInfo.fbclid) params.set('fbclid', trackingInfo.fbclid);
  if (trackingInfo.fbc) params.set('fbc', trackingInfo.fbc);
  if (trackingInfo.fbp) params.set('fbp', trackingInfo.fbp);
  if (trackingInfo.uuid) params.set('uuid', trackingInfo.uuid);
  if (trackingInfo.event_id) params.set('event_id', trackingInfo.event_id);
  
  const queryString = params.toString();
  return queryString ? `/continue?${queryString}` : '/continue';
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
