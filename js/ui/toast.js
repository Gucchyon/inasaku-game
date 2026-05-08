// 一時通知
window.Toast = (function () {
  function show(text, kind = "default") {
    const root = document.getElementById("toasts");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = text;
    root.appendChild(el);
    setTimeout(() => { el.remove(); }, 1800);
  }
  return { show };
})();
