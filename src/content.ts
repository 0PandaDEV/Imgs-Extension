import {
  ShowPopupMessage,
  HoveredMediaResponse,
  PopupStatus,
} from "./types";

let hoveredMediaUrl: string | null = null;

function updateHoveredMedia(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (
    target &&
    (target.tagName.toLowerCase() === "img" ||
      target.tagName.toLowerCase() === "video")
  ) {
    const mediaElement = target as HTMLImageElement | HTMLVideoElement;
    hoveredMediaUrl = mediaElement.currentSrc || mediaElement.src || null;
  }
}

function clearHoveredMedia(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (
    target &&
    (target.tagName.toLowerCase() === "img" ||
      target.tagName.toLowerCase() === "video")
  ) {
    hoveredMediaUrl = null;
  }
}

function createPopup(status: PopupStatus, message: string): void {
  const existingPopup = document.getElementById("imgs-extension-popup");
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }

  const popup = document.createElement("div");
  popup.id = "imgs-extension-popup";
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.backgroundColor = status === "success" ? "#4CAF50" : "#F44336";
  popup.style.color = "white";
  popup.style.padding = "12px 24px";
  popup.style.borderRadius = "4px";
  popup.style.zIndex = "10000";
  popup.style.fontFamily = "'DepartureMono', monospace";
  popup.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
  popup.textContent = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 3000);
}

document.addEventListener("mouseover", updateHoveredMedia, true);
document.addEventListener("mouseout", clearHoveredMedia, true);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getHoveredMedia") {
    const response: HoveredMediaResponse = { srcUrl: hoveredMediaUrl };
    sendResponse(response);
  } else if (message.action === "showPopup") {
    const popupMsg = message as ShowPopupMessage;
    createPopup(popupMsg.status, popupMsg.message);
  }
});
