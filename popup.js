document.addEventListener('DOMContentLoaded', async () => {
  // Style and UI setup
  const style = document.createElement("style");
  style.textContent = `
    body { font-family: 'DepartureMono', monospace; background-color: #e3e2db; color: #262625; margin: 0; padding: 20px; min-width: 350px; }
    .noise { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; opacity: 0.5; pointer-events: none; mix-blend-mode: multiply; background-position: 0 0; background-repeat: repeat; display: block; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    button { background-color: #383836; color: #e3e2db; border: none; padding: 10px 15px; cursor: pointer; font-family: inherit; margin-top: 10px; width: 100%; }
    button:hover { background-color: #262625; }
    input { display: block; width: 100%; padding: 10px; margin-bottom: 15px; background-color: #ffffff80; border: 1px solid #262625; font-family: inherit; box-sizing: border-box; }
    label { display: block; margin-bottom: 5px; }
    .token-form { position: relative; z-index: 1; }
    .error { color: #b33a3a; margin-bottom: 15px; }
    .info { color: #3a5fb3; margin-bottom: 15px; }
    .hidden { display: none; }
    .code-input { font-size: 20px; letter-spacing: 2px; text-align: center; text-transform: uppercase; }
    .steps { margin: 15px 0; font-size: 14px; line-height: 1.5; }
    .steps ol { padding-left: 20px; }
  `;
  
  document.head.appendChild(style);
  
  // Load font
  try {
    const fontFace = new FontFace('DepartureMono', `url(${chrome.runtime.getURL('fonts/DepartureMono.woff2')})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (error) {
    console.error('Failed to load font:', error);
  }
  
  // Create noise background
  const noiseEl = document.createElement("div");
  noiseEl.className = "noise";
  try {
    noiseEl.style.backgroundImage = `url(${chrome.runtime.getURL('paper.webp')})`;
  } catch (error) {
    console.error('Failed to load texture:', error);
  }
  document.body.appendChild(noiseEl);
  
  // Create UI elements
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.zIndex = "2";
  container.innerHTML = `
    <h1>Imgs Extension</h1>
    
    <div id="token-section">
      <div id="token-form" class="token-form">
        <div id="error-message" class="error hidden"></div>
        <div id="info-message" class="info hidden"></div>
        
        <div class="steps">
          <ol>
            <li>Log in to your Imgs account in the web app</li>
            <li>Go to Settings > Extensions</li>
            <li>Click "Generate Token" and copy the code</li>
            <li>Paste the code below to connect this extension</li>
          </ol>
        </div>
        
        <label for="token-code">Enter authorization code</label>
        <input type="text" id="token-code" class="code-input" placeholder="XXXXXXXX" maxlength="8">
        <button id="connect-btn">Connect</button>
      </div>
      
      <div id="logout-section" class="hidden">
        <p id="user-info">Connected to Imgs</p>
        <button id="logout-btn">Disconnect</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Add event listeners
  document.getElementById('connect-btn').addEventListener('click', handleConnect);
  document.getElementById('logout-btn').addEventListener('click', handleDisconnect);
  
  // Format token input
  const tokenInput = document.getElementById('token-code');
  tokenInput.addEventListener('input', () => {
    tokenInput.value = tokenInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  
  // Check authentication status
  checkAuthStatus();
});

// Authentication functions
function checkAuthStatus() {
  chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
    if (response && response.isLoggedIn) {
      showConnectedState(response.userID);
    } else {
      showTokenForm();
    }
  });
}

function handleConnect() {
  const tokenCode = document.getElementById('token-code').value.trim().toUpperCase();
  
  if (!tokenCode || tokenCode.length < 8) {
    showError("Please enter a valid 8-character code");
    return;
  }
  
  showInfo("Connecting to Imgs...");
  
  chrome.runtime.sendMessage(
    { action: "connect", tokenCode },
    (response) => {
      if (response && response.success) {
        showConnectedState(response.userId);
        showInfo("Successfully connected to Imgs!");
      } else {
        showError(response?.error || "Connection failed. Please try again with a valid code.");
      }
    }
  );
}

function handleDisconnect() {
  chrome.runtime.sendMessage({ action: "disconnect" }, (response) => {
    if (response && response.success) {
      showTokenForm();
      showInfo("Successfully disconnected");
    }
  });
}

function showConnectedState(userID) {
  document.getElementById('token-form').classList.add('hidden');
  document.getElementById('logout-section').classList.remove('hidden');
  document.getElementById('user-info').textContent = userID ? 
    `Connected to Imgs account (${userID.substring(0, 6)}...)` : 
    'Connected to Imgs';
}

function showTokenForm() {
  document.getElementById('token-form').classList.remove('hidden');
  document.getElementById('logout-section').classList.add('hidden');
  document.getElementById('token-code').value = '';
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  document.getElementById('info-message').classList.add('hidden');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => {
    errorEl.classList.add('hidden');
  }, 5000);
}

function showInfo(message) {
  const infoEl = document.getElementById('info-message');
  document.getElementById('error-message').classList.add('hidden');
  infoEl.textContent = message;
  infoEl.classList.remove('hidden');
  setTimeout(() => {
    infoEl.classList.add('hidden');
  }, 5000);
}

// Content script notification popup functionality
if (window.location.protocol !== 'chrome-extension:') {
  let popupEl = null;

  function createNotificationPopup(message) {
    removeNotificationPopup();
    popupEl = document.createElement("div");
    popupEl.style.position = "fixed";
    popupEl.style.top = "20px";
    popupEl.style.right = "20px";
    popupEl.style.padding = "28px 28px";
    popupEl.style.backgroundColor = "#e3e2db";
    popupEl.style.color = "#262625";
    popupEl.style.fontSize = "15px";
    popupEl.style.zIndex = "10000";
    popupEl.style.border = "2px solid #ffffff4d";
    popupEl.style.fontFamily = "DepartureMono";
    popupEl.style.outline = "none";
    popupEl.style.transition = "transform 0.2s ease-out, opacity 0.2s ease-out";
    popupEl.style.transform = "translateY(15px)";
    popupEl.style.opacity = "0";
    popupEl.textContent = message;
    document.body.appendChild(popupEl);
    setTimeout(() => {
      popupEl.style.transform = "translateY(0)";
      popupEl.style.opacity = "1";
    }, 150);
  }

  function updateNotificationPopup(message) {
    if (popupEl) {
      popupEl.textContent = message;
    }
  }

  function removeNotificationPopup() {
    if (popupEl) {
      popupEl.style.transform = "translateY(15px)";
      popupEl.style.opacity = "0";
      setTimeout(() => {
        if (popupEl) {
          popupEl.remove();
          popupEl = null;
        }
      }, 150);
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "showPopup") {
      if (msg.status === "start") {
        createNotificationPopup(msg.message);
      } else if (msg.status === "success") {
        updateNotificationPopup(msg.message);
        setTimeout(removeNotificationPopup, 2000);
      } else if (msg.status === "error") {
        updateNotificationPopup(msg.message);
        setTimeout(removeNotificationPopup, 2000);
      }
    }
  });
}