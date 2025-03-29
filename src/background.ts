import {
  validateToken,
  connectWithToken,
  uploadMedia,
} from "./api";
import {
  ConnectMessage,
  ShowPopupMessage,
  AuthCheckResponse,
  PopupStatus,
} from "./types";
import { showToast, createToastContainer } from "./toast";

let userToken: string | null = null;
let userID: string | null = null;

createToastContainer();

function sendPopup(tab: chrome.tabs.Tab, status: PopupStatus, message: string) {
  if (tab && tab.id) {
    const popupMessage: ShowPopupMessage = {
      action: "showPopup",
      status,
      message,
    };
    chrome.tabs.sendMessage(tab.id, popupMessage);
    
    showToast({
      message,
      type: status === "success" ? "success" : "error"
    });
  }
}

chrome.storage.local.get(["userToken", "userID"], (result) => {
  if (result.userToken && result.userID) {
    userToken = result.userToken;
    userID = result.userID;
    if (userToken) {
      validateToken(userToken);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "connect") {
    const connectMsg = message as ConnectMessage;
    connectWithToken(connectMsg.displayCode)
      .then((result) => {
        if (result.success && result.token && result.userID) {
          userToken = result.token;
          userID = result.userID;
          chrome.storage.local.set({ userToken, userID });
        }
        sendResponse(result);
      })
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (message.action === "disconnect") {
    userToken = null;
    userID = null;
    chrome.storage.local.remove(["userToken", "userID"]);

    sendResponse({ success: true });
    return false;
  } else if (message.action === "checkAuth") {
    const response: AuthCheckResponse = {
      isLoggedIn: !!userToken,
      userID: userID,
    };
    sendResponse(response);
    return false;
  }
});

chrome.contextMenus.create({
  id: "save-to-imgs",
  title: "Save to Imgs",
  contexts: ["image", "video"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-imgs" && tab) {
    try {
      if (!userToken) {
        sendPopup(tab, "error", "Please connect to Imgs first");
        return;
      }

      const isValid = await validateToken(userToken);
      if (!isValid) {
        userToken = null;
        userID = null;
        chrome.storage.local.remove(["userToken", "userID"]);
        sendPopup(tab, "error", "Session expired. Please reconnect");
        return;
      }

      const mediaUrl = info.srcUrl;
      if (!mediaUrl) {
        sendPopup(tab, "error", "No media URL found");
        return;
      }

      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const fileName = mediaUrl.split("/").pop() || "image";

      await uploadMedia(
        userToken,
        blob,
        fileName,
        new URL(tab.url || "").hostname,
        tab.url || "unknown",
        userID || ""
      );

      sendPopup(tab, "success", "Upload successful");
    } catch (error) {
      const err = error as Error;
      console.error("Upload failed:", err);
      sendPopup(tab, "error", "Upload failed: " + err.message);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "save_media") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || !tabs.length) return;
      const currentTab = tabs[0];

      if (!userToken) {
        sendPopup(currentTab, "error", "Please connect to Imgs first");
        return;
      }

      const isValid = await validateToken(userToken);
      if (!isValid) {
        userToken = null;
        userID = null;
        chrome.storage.local.remove(["userToken", "userID"]);
        sendPopup(currentTab, "error", "Session expired. Please reconnect");
        return;
      }

      chrome.tabs.sendMessage(
        currentTab.id!,
        { action: "getHoveredMedia" },
        async (response) => {
          if (response && response.srcUrl) {
            try {
              const mediaUrl = response.srcUrl;
              const mediaResponse = await fetch(mediaUrl);
              const blob = await mediaResponse.blob();
              const fileName = mediaUrl.split("/").pop() || "image";

              await uploadMedia(
                userToken!,
                blob,
                fileName,
                new URL(currentTab.url || "").hostname,
                currentTab.url || "unknown",
                userID || ""
              );

              sendPopup(currentTab, "success", "Upload successful");
            } catch (error) {
              const err = error as Error;
              console.error("Upload failed via hotkey:", err);
              sendPopup(currentTab, "error", "Upload failed: " + err.message);
            }
          } else {
            sendPopup(currentTab, "error", "No hovered media found");
          }
        }
      );
    });
  }
});
