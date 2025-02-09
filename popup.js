(function() {
  const style = document.createElement("style");
  style.textContent = `.noise{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;opacity:0.5;pointer-events:none;mix-blend-mode:multiply;background-image:url("/paper.webp");background-position:0 0;background-repeat:repeat;display:block}`;
  document.head.appendChild(style);
  const noiseEl = document.createElement("div");
  noiseEl.className = "noise";
  document.body.insertBefore(noiseEl, document.body.firstChild);
  let popupEl = null;

  const fontFace = new FontFace('DepartureMono', `url(${chrome.runtime.getURL('fonts/DepartureMono.woff2')})`);
  fontFace.load().then(font => {
    document.fonts.add(font);
  });

  function createPopup(message) {
    removePopup();
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

  function updatePopup(message) {
    if (popupEl) {
      popupEl.textContent = message;
    }
  }

  function removePopup() {
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
        createPopup(msg.message);
      } else if (msg.status === "success") {
        updatePopup(msg.message);
        setTimeout(removePopup, 2000);
      } else if (msg.status === "error") {
        updatePopup(msg.message);
        setTimeout(removePopup, 2000);
      }
    }
  });
})();