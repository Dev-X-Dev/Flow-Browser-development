const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');
const path = require('path');
const { URL } = require('url');

let mainWindow;
let currentView;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false
    },
    backgroundColor: '#0f172a',
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  // Load the React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (currentView) {
      currentView.webContents.destroy();
      currentView = null;
    }
  });

  // Set up security headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:"]
      }
    });
  });
}

// Handle navigation requests from renderer
ipcMain.handle('navigate', async (event, url, options = {}) => {
  try {
    if (!url || url === 'about:blank') {
      if (currentView) {
        mainWindow.removeBrowserView(currentView);
        currentView.webContents.destroy();
        currentView = null;
      }
      return { success: true, url: 'about:blank' };
    }

    // Validate and sanitize URL
    let finalUrl = url.trim();
    
    // Check if it's a search query or URL
    const isUrl = /^(https?:\/\/)|(www\.)|(\w+\.\w+)/.test(finalUrl);
    
    if (!isUrl) {
      // It's a search query - use Google
      finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Apply proxy/VPN if enabled
    if (options.proxyEnabled || options.vpnEnabled) {
      const proxy = options.proxyUrl || 'https://api.allorigins.win/raw?url=';
      if (options.proxyEnabled && !finalUrl.includes(proxy)) {
        finalUrl = proxy + encodeURIComponent(finalUrl);
      }
    }

    // Create or reuse BrowserView
    if (!currentView) {
      currentView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          partition: options.vpnEnabled ? 'persist:vpn' : 'persist:default',
          webSecurity: true,
          allowRunningInsecureContent: false
        }
      });
      mainWindow.addBrowserView(currentView);
    }

    // Set bounds for the view (below the UI header)
    const bounds = mainWindow.getContentBounds();
    const headerHeight = 120; // Adjust based on your UI
    currentView.setBounds({
      x: 0,
      y: headerHeight,
      width: bounds.width,
      height: bounds.height - headerHeight
    });

    currentView.setAutoResize({
      width: true,
      height: true,
      horizontal: false,
      vertical: false
    });

    // Configure session for privacy
    const viewSession = currentView.webContents.session;
    
    if (options.blockTrackers) {
      await viewSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const deniedPermissions = ['notifications', 'geolocation', 'media', 'midi', 'midiSysex'];
        callback(!deniedPermissions.includes(permission));
      });
    }

    if (options.antiFingerprint) {
      // Randomize user agent slightly
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      viewSession.setUserAgent(randomUA);
    }

    // Block ads and trackers
    if (options.blockTrackers) {
      viewSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
        const blocklist = [
          'doubleclick.net', 'googlesyndication.com', 'google-analytics.com',
          'facebook.com/tr', 'connect.facebook.net', 'twitter.com/i/adsct',
          'ads.', 'ad.', 'analytics.', 'tracking.', 'tracker.'
        ];
        
        const shouldBlock = blocklist.some(domain => details.url.includes(domain));
        callback({ cancel: shouldBlock });
      });
    }

    // Set up navigation handlers
    currentView.webContents.on('will-navigate', (event, navUrl) => {
      // Allow navigation but send update to renderer
      mainWindow.webContents.send('page-navigated', navUrl);
    });

    currentView.webContents.on('did-navigate', (event, navUrl) => {
      mainWindow.webContents.send('page-loaded', {
        url: navUrl,
        title: currentView.webContents.getTitle()
      });
    });

    currentView.webContents.on('page-title-updated', (event, title) => {
      mainWindow.webContents.send('page-title-updated', title);
    });

    currentView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      mainWindow.webContents.send('page-load-failed', {
        error: errorDescription,
        url: finalUrl
      });
    });

    // Load the URL
    await currentView.webContents.loadURL(finalUrl);

    return {
      success: true,
      url: finalUrl,
      title: currentView.webContents.getTitle()
    };

  } catch (error) {
    console.error('Navigation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle going back
ipcMain.handle('go-back', async () => {
  if (currentView && currentView.webContents.canGoBack()) {
    currentView.webContents.goBack();
    return { success: true };
  }
  return { success: false };
});

// Handle going forward
ipcMain.handle('go-forward', async () => {
  if (currentView && currentView.webContents.canGoForward()) {
    currentView.webContents.goForward();
    return { success: true };
  }
  return { success: false };
});

// Handle reload
ipcMain.handle('reload', async () => {
  if (currentView) {
    currentView.webContents.reload();
    return { success: true };
  }
  return { success: false };
});

// Handle stop loading
ipcMain.handle('stop', async () => {
  if (currentView) {
    currentView.webContents.stop();
    return { success: true };
  }
  return { success: false };
});

// Get page content for AI features
ipcMain.handle('get-page-content', async () => {
  if (currentView) {
    try {
      const content = await currentView.webContents.executeJavaScript(`
        (function() {
          const title = document.title;
          const text = document.body.innerText.slice(0, 5000);
          const url = window.location.href;
          return { title, text, url };
        })();
      `);
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'No page loaded' };
});

// Handle window resize
mainWindow?.on('resize', () => {
  if (currentView) {
    const bounds = mainWindow.getContentBounds();
    const headerHeight = 120;
    currentView.setBounds({
      x: 0,
      y: headerHeight,
      width: bounds.width,
      height: bounds.height - headerHeight
    });
  }
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
