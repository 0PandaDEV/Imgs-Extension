let hoveredMediaUrl = null;

function updateHoveredMedia(e) {
  const target = e.target;
  if (target && (target.tagName.toLowerCase() === "img" || target.tagName.toLowerCase() === "video")) {
    hoveredMediaUrl = target.currentSrc || target.src || null;
  }
}

function clearHoveredMedia(e) {
  const target = e.target;
  if (target && (target.tagName.toLowerCase() === "img" || target.tagName.toLowerCase() === "video")) {
    hoveredMediaUrl = null;
  }
}

document.addEventListener("mouseover", updateHoveredMedia, true);
document.addEventListener("mouseout", clearHoveredMedia, true);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getHoveredMedia") {
    sendResponse({ srcUrl: hoveredMediaUrl });
  }
}); 