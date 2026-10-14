// Fail loudly: any uncaught error, on the page or in the server, shows its stack in a red banner over the page.
// Imported first by main.js, so it catches errors in the other modules as they load.
export const showError = (text) => {
  const banner = document.createElement("pre");
  banner.className = "error-banner";
  banner.textContent = text;
  document.body.append(banner);
};

window.addEventListener("error", (e) => showError(e.error?.stack ?? e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack ?? String(e.reason)));
