function sendPopup(tab, status, message) {
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "showPopup", status, message });
  }
}

chrome.contextMenus.create({
  id: "addToImgs",
  title: "Add to Imgs",
  contexts: ["image", "video"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToImgs") {
    console.log("Fetching image from:", info.srcUrl);
    sendPopup(tab, "start", "Fetching image...");
    try {
      const imageResponse = await fetch(info.srcUrl);
      const imageBlob = await imageResponse.blob();

      const formData = new FormData();
      formData.append("file", imageBlob);
      formData.append("userID", "67a674db003cf232dd24");
      formData.append("sourceUrl", tab.url || "");
      formData.append(
        "sourceName",
        tab.url ? new URL(tab.url).hostname.split(".").slice(-2).join(".") : ""
      );

      const response = await fetch(
        "http://localhost:3000/api/external/addItem",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer fc788af08cc522e94a3ba2943b1524909358e38abde43bcac3a9905cc570836b",
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs.length) return;
      const currentTab = tabs[0];
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
              formData.append("userID", "67a674db003cf232dd24");
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
                "http://localhost:3000/api/external/addItem",
                {
                  method: "POST",
                  headers: {
                    Authorization:
                      "Bearer fc788af08cc522e94a3ba2943b1524909358e38abde43bcac3a9905cc570836b",
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
