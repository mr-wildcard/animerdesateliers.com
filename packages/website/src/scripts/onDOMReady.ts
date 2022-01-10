export function onDOMReady(callback) {
  if (document.readyState !== "loading") {
    callback();
  } else {
    window.addEventListener("DOMContentLoaded", function () {
      callback();
    });
  }
}
