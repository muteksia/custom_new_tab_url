# Custom New Tab URL

A lightweight, privacy-focused Chromium browser extension (Manifest V3) that automatically redirects every newly opened tab to your chosen custom URL (dashboards, search engines, productivity tools, or internal links).

When no custom URL is configured, a clean onboarding screen is presented with a one-click button to configure your settings.

---

## Features

- **Manifest V3 Compliant**: Built following current Chromium security and performance guidelines.
- **Minimal Permissions**: Requests only the `storage` permission to sync user settings. Does not monitor web history, intercept requests, or access tab content.
- **Seamless Fast Redirect**: Uses `window.location.replace()` so the intermediate new tab URL does not clutter the browser navigation back-history.
- **Smart Protocol Handling**: Automatically prepends `https://` if a user enters a bare domain (e.g. `github.com` becomes `https://github.com`).
- **Loop & Scheme Protection**: Blocks infinite redirect loops (e.g. pointing back to `chrome://newtab`) and prevents dangerous URI schemes.
- **Dark Mode Support**: Beautiful, modern UI that honors system dark and light modes.
- **Cross-Device Sync**: Settings are automatically synced across signed-in Chromium browsers using `chrome.storage.sync` with automatic fallback to `chrome.storage.local`.

---

## Directory Structure

```text
custom_new_tab_url/
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── src/
│   ├── common/
│   │   └── styles.css
│   ├── newtab/
│   │   ├── newtab.html
│   │   ├── newtab.css
│   │   └── newtab.js
│   └── options/
│       ├── options.html
│       ├── options.css
│       └── options.js
├── issue.md
├── LICENSE
├── manifest.json
└── README.md
```

---

## Installation & Developer Testing Guide

### Prerequisites
- Any modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi).

### Step-by-Step Setup

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/muteksia/custom_new_tab_url.git
   cd custom_new_tab_url
   ```

2. **Open Extension Management in Browser**:
   - In Google Chrome or Brave: Navigate to `chrome://extensions`
   - In Microsoft Edge: Navigate to `edge://extensions`

3. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch (usually located in the top-right corner of the Extensions page).

4. **Load the Extension**:
   - Click **Load unpacked** (or **Load unpacked extension**).
   - Select the root directory of this repository (`custom_new_tab_url` where `manifest.json` is located).

5. **Verify Installation**:
   - The extension **Custom New Tab URL** will appear in the extensions list with version `0.1.0`.

---

## How to Test

### 1. First Run (Unconfigured State)
1. Open a new tab (`Ctrl + T` on Windows/Linux or `Cmd + T` on macOS).
2. The clean welcome screen will display: *"You haven't configured a custom destination yet"*.
3. Click **Configure Destination URL** — this will open the extension settings page.

### 2. Setting a Destination URL
1. In the **Destination URL** input field, enter any valid address:
   - Example 1 (with protocol): `https://news.ycombinator.com`
   - Example 2 (without protocol): `github.com` (automatically saved as `https://github.com`)
2. Click **Save Changes**. A confirmation toast will indicate that settings were successfully saved.
3. Open a new tab (`Ctrl + T`) and verify that it immediately navigates to your chosen website.
4. Try clicking the browser's Back button to verify that the intermediate new tab page is omitted from navigation history.

### 3. Testing Settings & Validation
- **Test URL Button**: Click **Test URL** in the options page to verify that the specified address opens in a separate tab without saving.
- **Loop Prevention**: Attempt to set `chrome://newtab`. The form will reject the input with an error to prevent redirect loops.
- **Reset to Default**: Click **Reset to Default** to clear settings. Opening a new tab will return to the welcome onboarding screen.

---

## License

Copyright (c) 2026 Muteksia. All Rights Reserved. See the [LICENSE](LICENSE) file for details.
