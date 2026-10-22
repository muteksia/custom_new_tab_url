/**
 * New Tab controller and fast redirection handler
 */

const STORAGE_KEY = 'customNewTabUrl';
const ALLOWED_PROTOCOLS = ['https:', 'http:', 'chrome-extension:'];

const loaderState = document.getElementById('loader-state');
const welcomeState = document.getElementById('welcome-state');
const openSettingsBtn = document.getElementById('open-settings-btn');

/**
 * Validates the retrieved URL to prevent infinite loops and unsafe protocols.
 * @param {string} urlString
 * @returns {boolean}
 */
function isSafeAndValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;

  const trimmed = urlString.trim();
  if (!trimmed) return false;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return false;
  }

  // Prevent redirect loops
  const extensionId = chrome.runtime.id;
  if (
    parsed.href.includes('chrome://newtab') ||
    (parsed.protocol === 'chrome-extension:' && parsed.hostname === extensionId && parsed.pathname.includes('newtab'))
  ) {
    return false;
  }

  return true;
}

/**
 * Retrieves the stored destination URL from Chrome storage.
 * @returns {Promise<string>}
 */
async function getStoredUrl() {
  if (chrome.storage && chrome.storage.sync) {
    try {
      const data = await chrome.storage.sync.get(STORAGE_KEY);
      if (data && typeof data[STORAGE_KEY] === 'string' && data[STORAGE_KEY].trim()) {
        return data[STORAGE_KEY].trim();
      }
    } catch {
      // Fallback to local storage
    }
  }

  if (chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    if (data && typeof data[STORAGE_KEY] === 'string') {
      return data[STORAGE_KEY].trim();
    }
  }

  return '';
}

/**
 * Show the onboarding / welcome view
 */
function showWelcomeState() {
  if (loaderState) loaderState.classList.add('hidden');
  if (welcomeState) welcomeState.classList.remove('hidden');
}

/**
 * Main execution routine
 */
async function handleNewTab() {
  try {
    const destinationUrl = await getStoredUrl();

    if (destinationUrl && isSafeAndValidUrl(destinationUrl)) {
      // Perform immediate location replacement so newtab page is not stored in history stack
      window.location.replace(destinationUrl);
      return;
    }
  } catch {
    // In case of error, show welcome state
  }

  showWelcomeState();
}

// Bind button to open the extension settings page
if (openSettingsBtn) {
  openSettingsBtn.addEventListener('click', () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.location.href = '../options/options.html';
    }
  });
}

// Execute immediately without waiting for full media assets
handleNewTab();

