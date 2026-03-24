/**
 * GameTestersHub - Continue Page
 * Phased scanning animation before showing offer CTA
 */

// ClickMagick Rotator — handles offer rotation + referrer blanking server-side
// Weights: FreeCash 4x, InboxDollars 2x, Klink 1x (configured in ClickMagick)
// Flow: Rotator → Smart Link (blank_referrer) → MaxBounty offer (s2=cmc_vid)
const ROTATOR_URL = 'https://rot.ssaff.link/gth-offers';

const CYCLING_TEXTS = [
  'Scanning game database',
  'Matching your preferences',
  'Filtering testing opportunities',
  'Checking availability'
];

const PHASE_TIMING = {
  phase1End: 2,
  phase2End: 5,
  phase3End: 7,
  ctaDelay: 7.3
};

const TARGET_STATS = {
  testers: 4521,
  opportunities: 287,
  highpay: 23
};

let startTime = null;
let animationFrame = null;

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    fbclid: params.get('fbclid') || null,
    fbc: params.get('fbc') || null,
    fbp: params.get('fbp') || null,
    uuid: params.get('uuid') || null,
    event_id: params.get('event_id') || null
  };
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 1.5);
}

function countUp(elapsed, target, startSec, durationSec) {
  if (elapsed < startSec) return 0;
  const t = Math.min((elapsed - startSec) / durationSec, 1);
  return Math.floor(target * easeOut(t));
}

function getProgress(elapsed) {
  const { phase1End, phase2End, phase3End } = PHASE_TIMING;
  if (elapsed < phase1End) return 0;
  if (elapsed < phase2End) {
    return 82 * ((elapsed - phase1End) / (phase2End - phase1End));
  }
  if (elapsed < phase3End) {
    return 82 + 18 * ((elapsed - phase2End) / (phase3End - phase2End));
  }
  return 100;
}

function updateAnimation() {
  const elapsed = (Date.now() - startTime) / 1000;
  const { phase1End, phase2End, phase3End, ctaDelay } = PHASE_TIMING;

  const phase1 = document.getElementById('phase1');
  const phase2 = document.getElementById('phase2');
  const phase3 = document.getElementById('phase3');
  const phaseComplete = document.getElementById('phase-complete');
  const ctaSection = document.getElementById('cta-section');
  const cyclingText = document.getElementById('cycling-text');

  if (elapsed < phase1End) {
    phase1.style.display = 'block';
    phase2.style.display = 'none';
    phase3.style.display = 'none';
    phaseComplete.style.display = 'none';
    ctaSection.style.display = 'none';

    const idx = Math.min(Math.floor(elapsed / 0.5), CYCLING_TEXTS.length - 1);
    cyclingText.textContent = CYCLING_TEXTS[idx];

  } else if (elapsed < phase2End) {
    phase1.style.display = 'none';
    phase2.style.display = 'block';
    phase3.style.display = 'none';
    phaseComplete.style.display = 'none';
    ctaSection.style.display = 'none';

    const progress = getProgress(elapsed);
    document.getElementById('progress-fill').style.width = `${progress}%`;

    document.getElementById('stat-testers').textContent = 
      countUp(elapsed, TARGET_STATS.testers, phase1End, 1.2).toLocaleString();
    document.getElementById('stat-opportunities').textContent = 
      countUp(elapsed, TARGET_STATS.opportunities, phase1End + 0.5, 1.2).toLocaleString();
    document.getElementById('stat-highpay').textContent = 
      countUp(elapsed, TARGET_STATS.highpay, phase1End + 1, 1).toLocaleString();

  } else if (elapsed < phase3End) {
    phase1.style.display = 'none';
    phase2.style.display = 'none';
    phase3.style.display = 'block';
    phaseComplete.style.display = 'none';
    ctaSection.style.display = 'none';

    const progress = getProgress(elapsed);
    document.getElementById('progress-fill-final').style.width = `${progress}%`;

  } else {
    phase1.style.display = 'none';
    phase2.style.display = 'none';
    phase3.style.display = 'none';
    phaseComplete.style.display = 'block';

    document.getElementById('result-count').textContent = TARGET_STATS.highpay;

    if (elapsed >= ctaDelay) {
      ctaSection.style.display = 'block';
      cancelAnimationFrame(animationFrame);
      return;
    }
  }

  animationFrame = requestAnimationFrame(updateAnimation);
}

function handleContinue() {
  // Get ClickMagick visitor ID (replaced by tracking code in the hidden span)
  const cmcVidEl = document.getElementById('cmc-vid');
  const cmcVid = cmcVidEl ? cmcVidEl.textContent.trim() : '';

  // Pass cmc_vid as Sub-ID 1 to rotator → flows through to Smart Link → MaxBounty s2
  let url = ROTATOR_URL;
  if (cmcVid && cmcVid !== '[cmc_vid]') {
    url += '/' + encodeURIComponent(cmcVid);
  }

  console.log(`[GTH] Redirecting to rotator with cmc_vid: ${cmcVid}`);
  window.location.href = url;
}

function init() {
  // Fire Lead on page load (backup when quiz redirect cancels the first send)
  const params = getUrlParams();
  const trackingFromStorage = window.GameTestersTracking ? window.GameTestersTracking.getTrackingData() : {};
  const eventId = params.event_id || trackingFromStorage.event_id;
  if (eventId && window.GameTestersTracking) {
    window.GameTestersTracking.trackEvent('Lead', {
      content_name: 'GameTestersHub Continue',
      status: 'landed'
    }, eventId);
  }

  startTime = Date.now();
  updateAnimation();

  const ctaButton = document.getElementById('cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', handleContinue);
  }
}

document.addEventListener('DOMContentLoaded', init);
