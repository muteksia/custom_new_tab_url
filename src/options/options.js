/**
 * Options page controller
 */

const STORAGE_KEY = 'customNewTabUrl';
const ALLOWED_PROTOCOLS = ['https:', 'http:', 'chrome-extension:'];

const form = document.getElementById('options-form');
const urlInput = document.getElementById('url-input');
const statusMessage = document.getElementById('status-message');
const testBtn = document.getElementById('test-btn');
const resetBtn = document.getElementById('reset-btn');

let feedbackTimeout = null;

/**
 * Display a user feedback message (success or error).
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showStatus(message, type) {
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }

  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  if (type === 'success') {
    feedbackTimeout = setTimeout(() => {
      statusMessage.className = 'status-message hidden';
      statusMessage.textContent = '';
    }, 3000);
  }
}

/**
 * Normalizes input URL string, auto-prepending https:// if needed.
 * @param {string} rawInput
 * @returns {string}
 */
function normalizeUrl(rawInput) {
  let url = rawInput.trim();
  if (!url) return '';

  // If input doesn't start with protocol (letters followed by ://)
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Validates the target URL.
 * Checks for valid URL structure, allowed protocols, and disallows redirect loops.
 * @param {string} urlString
 * @returns {{ valid: boolean, error?: string, normalizedUrl?: string }}
 */
function validateUrl(urlString) {
  if (!urlString || urlString.trim() === '') {
    return { valid: true, normalizedUrl: '' }; // Allowed: empty means default / unconfigured
  }

  const normalized = normalizeUrl(urlString);

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return { valid: false, error: 'Please enter a valid web address (e.g., https://example.com).' };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { 
      valid: false, 
      error: `Protocol "${parsed.protocol}" is not supported. Use HTTPS or HTTP.` 
    };
  }

  // Prevent infinite loops (e.g. pointing to chrome://newtab or extension's newtab page)
  const currentExtensionId = chrome.runtime.id;
  if (
    parsed.href.includes('chrome://newtab') ||
    (parsed.protocol === 'chrome-extension:' && parsed.hostname === currentExtensionId && parsed.pathname.includes('newtab'))
  ) {
    return { 
      valid: false, 
      error: 'Cannot set destination to the new tab page itself to avoid infinite redirect loops.' 
    };
  }

  return { valid: true, normalizedUrl: normalized };
}

/**
 * Saves URL setting to Chrome storage (sync with local fallback).
 * @param {string} url
 */
async function saveToStorage(url) {
  const payload = { [STORAGE_KEY]: url };
  if (chrome.storage && chrome.storage.sync) {
    try {
      await chrome.storage.sync.set(payload);
      return;
    } catch {
      // Fallback to local storage if sync fails or hits quota
      await chrome.storage.local.set(payload);
      return;
    }
  }

  if (chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set(payload);
  }
}

/**
 * Retrieves the stored URL from storage.
 * @returns {Promise<string>}
 */
async function loadFromStorage() {
  if (chrome.storage && chrome.storage.sync) {
    try {
      const data = await chrome.storage.sync.get(STORAGE_KEY);
      if (data && typeof data[STORAGE_KEY] === 'string') {
        return data[STORAGE_KEY];
      }
    } catch {
      // Continue to local storage check
    }
  }

  if (chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data && typeof data[STORAGE_KEY] === 'string' ? data[STORAGE_KEY] : '';
  }

  return '';
}

/**
 * Initialize options view and populate current settings.
 */
async function initialize() {
  try {
    const savedUrl = await loadFromStorage();
    if (savedUrl) {
      urlInput.value = savedUrl;
    }
  } catch (err) {
    showStatus('Failed to load current settings.', 'error');
  }
  urlInput.focus();
}

// Handle Form Submission / Save
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const raw = urlInput.value;
  const result = validateUrl(raw);

  if (!result.valid) {
    showStatus(result.error, 'error');
    return;
  }

  try {
    await saveToStorage(result.normalizedUrl);
    urlInput.value = result.normalizedUrl;
    showStatus('Settings saved successfully!', 'success');
  } catch (err) {
    showStatus('Failed to save settings to storage.', 'error');
  }
});

// Handle Test Button
testBtn.addEventListener('click', () => {
  const raw = urlInput.value;
  const result = validateUrl(raw);

  if (!result.valid) {
    showStatus(result.error, 'error');
    return;
  }

  if (!result.normalizedUrl) {
    showStatus('Enter a URL first before testing.', 'error');
    return;
  }

  window.open(result.normalizedUrl, '_blank', 'noopener,noreferrer');
});

// Handle Reset Button
resetBtn.addEventListener('click', async () => {
  try {
    await saveToStorage('');
    urlInput.value = '';
    showStatus('Configuration reset to default.', 'success');
  } catch (err) {
    showStatus('Failed to reset configuration.', 'error');
  }
});

// Run initialization
document.addEventListener('DOMContentLoaded', initialize);

