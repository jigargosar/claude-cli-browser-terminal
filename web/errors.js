// Fail loudly: any uncaught error, on the page or in the server, shows its stack in a red banner over the page.
// The banner collects every error until Dismiss removes it; the next error brings it back.
// Imported first by main.js, so it catches errors in the other modules as they load.
let banner = null;
export const showError = (text) => {
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "error-banner";
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.textContent = "Dismiss";
    dismiss.addEventListener("click", () => {
      banner.remove();
      banner = null;
    });
    banner.append(dismiss);
    document.body.append(banner);
  }
  const stack = document.createElement("pre");
  stack.textContent = text;
  banner.append(stack);
};

window.addEventListener("error", (e) => showError(e.error?.stack ?? e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack ?? String(e.reason)));
