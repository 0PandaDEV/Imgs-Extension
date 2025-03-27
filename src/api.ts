import { UploadResponse } from "./types";
import { ConnectResponse } from "./types";

let API_BASE_URL = "https://imgs.pandadev.net/api/external";

if (chrome.management) {
  chrome.management.getSelf((self) => {
    if (self.installType === "development") {
      API_BASE_URL = "http://localhost:3000/api/external";
      console.log("Running in development mode");
    }
  });
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    if (!token) return false;
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export async function connectWithToken(
  displayCode: string
): Promise<ConnectResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayCode }),
    });

    const data = await response.json();
    if (data.token && (data.userID || data.userId)) {
      return {
        success: true,
        token: data.token,
        userID: data.userID || data.userId,
      };
    } else {
      return { success: false, error: data.error || "Failed to connect" };
    }
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function disconnect(token: string): Promise<void> {
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/auth/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
    }
  } catch (error) {
    console.error("Disconnect error:", error);
  }
}

export async function uploadMedia(
  token: string,
  blob: Blob,
  fileName: string,
  source: string,
  userID: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("source", source);
  formData.append("userID", userID);

  const response = await fetch(`${API_BASE_URL}/addItem`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
}

export { API_BASE_URL };
