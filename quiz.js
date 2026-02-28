/**
 * GameTestersHub - Quiz Funnel
 * 5-step engagement quiz + contact form
 */

// Configuration - UPDATE THESE VALUES
const SUPABASE_FUNCTION_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/submit-lead';
const REDIRECT_URL = 'https://YOUR_BEMOB_CAMPAIGN_URL'; // BeMob campaign link

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
 * Open quiz modal
 */
function openQuiz() {
  const modal = document.getElementById('quiz-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Track quiz start
  if (window.GameTestersTracking) {
    window.GameTestersTracking.trackEvent('InitiateCheckout');
  }
  
  renderStep();
}

/**
 * Close quiz modal
 */
function closeQuiz() {
  const modal = document.getElementById('quiz-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset quiz state
  currentStep = 1;
  Object.keys(quizAnswers).forEach(key => delete quizAnswers[key]);
  updateProgress();
}

/**
 * Update progress bar
 */
function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const stepIndicator = document.getElementById('current-step');
  
  const progress = (currentStep / totalSteps) * 100;
  progressBar.style.width = `${progress}%`;
  stepIndicator.textContent = currentStep;
}

/**
 * Render current step
 */
function renderStep() {
  const container = document.getElementById('quiz-content');
  updateProgress();
  
  if (currentStep <= quizSteps.length) {
    // Render quiz question
    const step = quizSteps[currentStep - 1];
    container.innerHTML = `
      <div class="quiz-step">
        <h3>${step.question}</h3>
        <div class="quiz-options">
          ${step.options.map(opt => `
            <button class="quiz-option" onclick="selectOption('${step.id}', '${opt.value}')">
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
}

/**
 * Select quiz option and advance
 */
function selectOption(questionId, value) {
  quizAnswers[questionId] = value;
  
  // Visual feedback
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(opt => opt.classList.remove('selected'));
  event.target.classList.add('selected');
  
  // Advance after brief delay
  setTimeout(() => {
    currentStep++;
    renderStep();
  }, 200);
}

/**
 * Render contact form (final step)
 */
function renderContactForm() {
  const container = document.getElementById('quiz-content');
  
  container.innerHTML = `
    <div class="quiz-step">
      <h3>Great news! You qualify.</h3>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">
        Enter your details to receive game testing opportunities
      </p>
      <form class="contact-form" onsubmit="submitForm(event)">
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
        <button type="submit" class="quiz-submit" id="submit-btn">
          Get My Testing Opportunities
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
  const originalText = submitBtn.innerHTML;
  
  // Get form data
  const formData = {
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    source: 'gametestershub'
  };
  
  // Get tracking data
  let trackingInfo = {};
  if (window.GameTestersTracking) {
    trackingInfo = window.GameTestersTracking.getTrackingData();
  }
  
  // Merge data
  const payload = {
    ...formData,
    uuid: trackingInfo.uuid || generateFallbackUUID(),
    fbc: trackingInfo.fbc || null,
    fbclid: trackingInfo.fbclid || null
  };
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span>Submitting...';
  
  try {
    // Submit to Supabase
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    // Track Lead event
    if (window.GameTestersTracking) {
      window.GameTestersTracking.trackEvent('Lead', {
        content_name: 'GameTestersHub Quiz',
        status: 'submitted'
      });
    }
    
    // Redirect to offer
    const redirectUrl = result.redirect_url || REDIRECT_URL;
    window.location.href = redirectUrl;
    
  } catch (error) {
    console.error('Submission error:', error);
    
    // Still redirect on error (don't lose the lead)
    window.location.href = REDIRECT_URL;
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
 * Toggle FAQ accordion
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

// Close modal on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeQuiz();
  }
});

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('quiz-modal')) {
    closeQuiz();
  }
});
