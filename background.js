function sendPopup(tab, status, message) {
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "showPopup", status, message });
  }
}

// Settings and authentication
const API_BASE_URL = "http://localhost:3000/api/external";
let userToken = null;
let userID = null;

// Load saved auth data on startup
chrome.storage.local.get(["userToken", "userID"], (result) => {
  if (result.userToken && result.userID) {
    userToken = result.userToken;
    userID = result.userID;
    validateToken();
  }
});

// Function to validate token
async function validateToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: userToken }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      // Clear invalid token
      userToken = null;
      userID = null;
      chrome.storage.local.remove(["userToken", "userID"]);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

// Connect with token code
async function connectWithToken(tokenCode) {
  try {
    // Search for token by display code
    const response = await fetch(`${API_BASE_URL}/auth/token-lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayCode: tokenCode }),
    });
    
    if (!response.ok) {
      throw new Error("Invalid token code");
    }
    
    const data = await response.json();
    userToken = data.token;
    userID = data.userId;
    
    // Save to storage
    chrome.storage.local.set({ 
      userToken: data.token,
      userID: data.userId
    });
    
    return { success: true, userId: data.userId };
  } catch (error) {
    console.error("Connect error:", error);
    return { success: false, error: error.message };
  }
}

// Disconnect function
async function disconnect() {
  try {
    if (userToken) {
      await fetch(`${API_BASE_URL}/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: userToken }),
      });
    }
  } catch (error) {
    console.error("Disconnect error:", error);
  } finally {
    userToken = null;
    userID = null;
    chrome.storage.local.remove(["userToken", "userID"]);
  }
}

// Expose auth functions to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "connect") {
    connectWithToken(message.tokenCode)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicate async response
  } else if (message.action === "disconnect") {
    disconnect()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicate async response
  } else if (message.action === "checkAuth") {
    sendResponse({ 
      isLoggedIn: !!userToken,
      userID: userID
    });
    return true; // Important for synchronous responses as well
  }
});

chrome.contextMenus.create({
  id: "addToImgs",
  title: "Add to Imgs",
  contexts: ["image", "video"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToImgs") {
    // Check authentication first
    const isValid = await validateToken();
    if (!isValid) {
      sendPopup(tab, "error", "Please connect to Imgs first");
      return;
    }

    console.log("Fetching image from:", info.srcUrl);
    sendPopup(tab, "start", "Fetching image...");
    try {
      const imageResponse = await fetch(info.srcUrl);
      const imageBlob = await imageResponse.blob();

      const formData = new FormData();
      formData.append("file", imageBlob);
      formData.append("userID", userID);
      formData.append("sourceUrl", tab.url || "");
      formData.append(
        "sourceName",
        tab.url ? new URL(tab.url).hostname.split(".").slice(-2).join(".") : ""
      );

      const response = await fetch(
        `${API_BASE_URL}/addItem`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Upload successful:", data);
      sendPopup(tab, "success", "Upload successful");
    } catch (error) {
      console.error("Upload failed:", error);
      sendPopup(tab, "error", "Upload failed: " + error.message);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "save_media") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || !tabs.length) return;
      const currentTab = tabs[0];
      
      // Check authentication first
      const isValid = await validateToken();
      if (!isValid) {
        sendPopup(currentTab, "error", "Please connect to Imgs first");
        return;
      }
      
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "getHoveredMedia" },
        async (response) => {
          if (response && response.srcUrl) {
            console.log(
              "Hotkey activated. Fetched hovered media URL:",
              response.srcUrl
            );
            sendPopup(currentTab, "start", "Fetching image...");
            try {
              const imageResponse = await fetch(response.srcUrl);
              const imageBlob = await imageResponse.blob();

              const formData = new FormData();
              formData.append("file", imageBlob);
              formData.append("userID", userID);
              formData.append("sourceUrl", currentTab.url || "");
              formData.append(
                "sourceName",
                currentTab.url
                  ? new URL(currentTab.url).hostname
                      .split(".")
                      .slice(-2)
                      .join(".")
                  : ""
              );

              const resp = await fetch(
                `${API_BASE_URL}/addItem`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                  },
                  body: formData,
                }
              );
              const data = await resp.json();
              console.log("Upload successful via hotkey:", data);
              sendPopup(currentTab, "success", "Upload successful");
            } catch (error) {
              console.error("Upload failed via hotkey:", error);
              sendPopup(currentTab, "error", "Upload failed: " + error.message);
            }
          } else {
            console.error("No hovered media found");
            sendPopup(currentTab, "error", "No hovered media found");
          }
        }
      );
    });
  }
});
