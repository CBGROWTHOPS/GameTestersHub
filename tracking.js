/**
 * GameTestersHub - Facebook Tracking
 * Handles FB Pixel, fbclid capture, and fbc cookie generation
 */

// Configuration
const FB_PIXEL_ID = '1635681097458226';

// Initialize tracking data
const trackingData = {
  fbclid: null,
  fbc: null,
  fbp: null
};

/**
 * Initialize Facebook Pixel
 */
function initFacebookPixel() {
  if (FB_PIXEL_ID === 'YOUR_PIXEL_ID') {
    console.warn('GameTestersHub: Facebook Pixel ID not configured');
    return;
  }

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', FB_PIXEL_ID);
  fbq('track', 'PageView');
}

/**
 * Capture fbclid from URL parameters
 */
function captureFbclid() {
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  if (fbclid) {
    trackingData.fbclid = fbclid;

    // Store in sessionStorage for persistence across page refreshes
    sessionStorage.setItem('gth_fbclid', fbclid);

    // Prefer the _fbc cookie set by Meta's pixel (has correct click timestamp).
    // Only generate a new fbc if Meta pixel hasn't set one — overwriting with
    // Date.now() causes Facebook to flag "Server sending modified fbclid value"
    const existingFbc = getCookie('_fbc');
    if (existingFbc) {
      trackingData.fbc = existingFbc;
    } else {
      const timestamp = Date.now();
      trackingData.fbc = `fb.1.${timestamp}.${fbclid}`;
      setCookie('_fbc', trackingData.fbc, 90);
    }
    sessionStorage.setItem('gth_fbc', trackingData.fbc);
  } else {
    // Try to retrieve from sessionStorage
    trackingData.fbclid = sessionStorage.getItem('gth_fbclid');
    trackingData.fbc = sessionStorage.getItem('gth_fbc') || getCookie('_fbc');
  }
}

/**
 * Capture fbp (Facebook browser ID) from cookie
 */
function captureFbp() {
  trackingData.fbp = getCookie('_fbp');
}

/**
 * Set a cookie
 */
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets or creates a unique event_id for the current lead submission.
 * Used for CAPI event deduplication - same event_id prevents duplicate Lead events.
 * Stored in sessionStorage so it persists across page refreshes but not sessions.
 */
function getLeadEventId() {
  let id = sessionStorage.getItem('gth_lead_event_id');
  if (!id) {
    id = 'lead_' + generateUUID();
    sessionStorage.setItem('gth_lead_event_id', id);
  }
  return id;
}

/**
 * Clears the event_id after successful submission (for next lead)
 */
function clearLeadEventId() {
  sessionStorage.removeItem('gth_lead_event_id');
}

// Stable uuid for this session (MailerLite, BeMob s1)
let sessionUuid = null;
function getOrCreateSessionUuid() {
  if (!sessionUuid) {
    sessionUuid = sessionStorage.getItem('gth_uuid') || generateUUID();
    sessionStorage.setItem('gth_uuid', sessionUuid);
  }
  return sessionUuid;
}

/**
 * Get tracking data for form submission
 */
function getTrackingData() {
  return {
    fbclid: trackingData.fbclid,
    fbc: trackingData.fbc,
    fbp: trackingData.fbp,
    uuid: getOrCreateSessionUuid(),
    event_id: getLeadEventId(),
    user_agent: navigator.userAgent,
    page_url: window.location.href
  };
}

/**
 * Track custom event with Facebook Pixel
 * @param {string} eventName - e.g. 'Lead', 'PageView'
 * @param {object} params - event parameters
 * @param {string} [eventID] - optional, for deduplication (e.g. same event from quiz + continue)
 */
function trackEvent(eventName, params = {}, eventID = null) {
  if (typeof fbq !== 'undefined') {
    const options = eventID ? { eventID: eventID } : undefined;
    fbq('track', eventName, params, options);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  captureFbclid();
  captureFbp();
  initFacebookPixel();
});

// Export for use in other scripts
window.GameTestersTracking = {
  getTrackingData,
  trackEvent,
  generateUUID,
  getLeadEventId,
  clearLeadEventId,
  getOrCreateSessionUuid
};
