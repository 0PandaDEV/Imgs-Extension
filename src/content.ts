import {
  ShowPopupMessage,
  HoveredMediaResponse,
  PopupStatus,
} from "./types";
import { showToast, createToastContainer } from "./toast";

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
  showToast({
    message,
    type: status === "success" ? "success" : "error"
  });
}

createToastContainer();

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
