export interface ToastOptions {
  message: string;
  type: "success" | "error";
  duration?: number;
}

export function createToastContainer(): HTMLDivElement {
  let toastContainer = document.querySelector(
    ".toast-container"
  ) as HTMLDivElement;
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);

    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: DepartureMono;
        src: url('/fonts/DepartureMono.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
      
      .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column-reverse;
        gap: 8px;
        z-index: 2000;
      }
      
      .toast {
        padding: 4px 9px;
        font-family: DepartureMono;
        font-weight: 500;
        cursor: pointer;
      }
      
      .toast.error {
        background-color: #dcc2bc;
        color: #ff5555;
      }
      
      .toast.success {
        background-color: #c2c2dc;
        color: #1c00ca;
      }
    `;
    document.head.appendChild(style);
  }
  return toastContainer;
}

export function showToast({
  message,
  type,
  duration = 3000,
}: ToastOptions): void {
  const toastContainer = createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.addEventListener("click", () => {
    toast.remove();
  });
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}