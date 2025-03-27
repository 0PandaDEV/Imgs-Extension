document.addEventListener("DOMContentLoaded", async () => {
  const connectButton = document.getElementById("connect-button");
  const disconnectButton = document.getElementById("disconnect-button");
  const statusElement = document.getElementById("status");
  const tokenInput = document.getElementById("token-input") as HTMLInputElement;

  function updateUI(isLoggedIn: boolean, userID?: string): void {
    if (isLoggedIn && userID) {
      if (statusElement) statusElement.textContent = `Connected as: ${userID}`;
      if (connectButton) connectButton.style.display = "none";
      if (disconnectButton) disconnectButton.style.display = "block";
      if (tokenInput) tokenInput.style.display = "none";
    } else {
      if (statusElement) statusElement.textContent = "Not connected";
      if (connectButton) connectButton.style.display = "block";
      if (disconnectButton) disconnectButton.style.display = "none";
      if (tokenInput) tokenInput.style.display = "block";
    }
  }

  chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
    updateUI(response.isLoggedIn, response.userID);
  });

  if (connectButton) {
    connectButton.addEventListener("click", () => {
      const displayCode = tokenInput ? tokenInput.value : "";
      if (!displayCode) {
        if (statusElement) statusElement.textContent = "Please enter a token code";
        return;
      }

      chrome.runtime.sendMessage(
        { action: "connect", displayCode },
        (response) => {
          if (response.success) {
            updateUI(true, response.userID);
          } else {
            if (statusElement) statusElement.textContent = `Error: ${response.error || "Failed to connect"}`;
          }
        }
      );
    });
  }

  if (disconnectButton) {
    disconnectButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "disconnect" }, (response) => {
        if (response.success) {
          updateUI(false);
        } else {
          if (statusElement) statusElement.textContent = `Error: ${response.error || "Failed to disconnect"}`;
        }
      });
    });
  }
}); 