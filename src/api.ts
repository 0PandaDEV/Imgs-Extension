import { UploadResponse } from "./types";
import { ConnectResponse } from "./types";
import { showToast } from "./toast";

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
    const browserInfo = getBrowserInfo() + ` (${navigator.userAgent.includes('x64') || navigator.userAgent.includes('Win64') ? '64-bit' : '32-bit'})`;
    
    const response = await fetch(`${API_BASE_URL}/auth/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        displayCode,
        browserInfo
      }),
    });

    const data = await response.json();
    if (data.tokenHash && (data.userID || data.userId)) {
      return {
        success: true,
        token: data.tokenHash,
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

function getBrowserInfo(): string {
  const browserData = {
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform,
    language: navigator.language
  };
  
  let browserName = "Unknown Browser";
  const ua = navigator.userAgent;
  
  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
    browserName = "Chrome";
  } else if (ua.includes("Firefox")) {
    browserName = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browserName = "Safari";
  } else if (ua.includes("Edg")) {
    browserName = "Edge";
  } else if (ua.includes("OPR") || ua.includes("Opera")) {
    browserName = "Opera";
  }
  
  return `${browserName} on ${navigator.platform}`;
}

export async function uploadMedia(
  token: string,
  blob: Blob,
  fileName: string,
  source: string,
  sourceLink: string,
  userID: string
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("source", source);
    formData.append("sourceLink", sourceLink);
    formData.append("userID", userID);

    const response = await fetch(`${API_BASE_URL}/addItem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    showToast({
      message: "Media upload successful",
      type: "success"
    });
    return result;
  } catch (error) {
    showToast({
      message: `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      type: "error"
    });
    throw error;
  }
}

export { API_BASE_URL };
