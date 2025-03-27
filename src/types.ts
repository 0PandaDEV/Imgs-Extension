export interface AuthState {
  userToken: string | null;
  userID: string | null;
}

export interface TokenValidationResponse {
  valid: boolean;
  userID?: string;
}

export interface ConnectResponse {
  success: boolean;
  token?: string;
  userID?: string;
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export interface UploadResponse extends ApiResponse {
  itemID?: string;
  url?: string;
}

export interface Message {
  action: string;
  [key: string]: any;
}

export interface ConnectMessage extends Message {
  action: "connect";
  displayCode: string;
}

export interface DisconnectMessage extends Message {
  action: "disconnect";
}

export interface CheckAuthMessage extends Message {
  action: "checkAuth";
}

export interface GetHoveredMediaMessage extends Message {
  action: "getHoveredMedia";
}

export interface ShowPopupMessage extends Message {
  action: "showPopup";
  status: PopupStatus;
  message: string;
}

export interface AuthCheckResponse {
  isLoggedIn: boolean;
  userID: string | null;
}

export interface HoveredMediaResponse {
  srcUrl: string | null;
}

export interface MediaInfo {
  url: string;
  fileName: string;
  type: "image" | "video";
  source: string;
}

export type PopupStatus = "success" | "error" | "info";

export interface EnvironmentConfig {
  IS_DEV: boolean;
  API_BASE_URL: string;
} 