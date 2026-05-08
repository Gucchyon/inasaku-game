// モーダル
window.Modal = (function () {
  function open(opts) {
    const root = document.getElementById("modal-root");
    root.innerHTML = "";
    root.classList.add("active");

    const box = document.createElement("div");
    box.className = "modal-box pop-in";

    if (opts.title) {
      const h = document.createElement("h3");
      h.textContent = opts.title;
      box.appendChild(h);
    }
    if (opts.html) {
      const body = document.createElement("div");
      body.innerHTML = opts.html;
      box.appendChild(body);
    } else if (opts.text) {
      const body = document.createElement("p");
      body.textContent = opts.text;
      box.appendChild(body);
    }

    const actions = document.createElement("div");
    actions.className = "modal-actions";
    (opts.buttons || [{ label: "OK", value: true }]).forEach(b => {
      const btn = document.createElement("button");
      btn.className = "btn " + (b.kind || (b.primary ? "" : "secondary"));
      btn.textContent = b.label;
      btn.addEventListener("click", () => {
        close();
        if (b.onClick) b.onClick();
        if (opts.onResult) opts.onResult(b.value);
      });
      actions.appendChild(btn);
    });
    box.appendChild(actions);
    root.appendChild(box);
  }
  function close() {
    const root = document.getElementById("modal-root");
    root.classList.remove("active");
    root.innerHTML = "";
  }
  return { open, close };
})();
