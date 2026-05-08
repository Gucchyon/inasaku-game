// アップグレード画面（ショップから呼ばれるサブビュー）
window.UpgradeView = (function () {

  function render(container) {
    container.innerHTML = "";
    const s = State.get();

    // 田んぼアップグレード
    const fieldTitle = document.createElement("div");
    fieldTitle.className = "section-title";
    fieldTitle.textContent = "🪴 田んぼ別アップグレード（区画を選択）";
    container.appendChild(fieldTitle);

    const fieldSelect = document.createElement("div");
    fieldSelect.style.cssText = "display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;";
    s.fields.forEach(f => {
      const btn = document.createElement("button");
      btn.className = "btn " + (f.id === s.activeFieldId ? "" : "secondary");
      btn.disabled = !f.unlocked;
      btn.textContent = f.unlocked ? `田${f.id}` : `田${f.id} 🔒`;
      btn.style.padding = "6px 12px";
      btn.style.fontSize = "13px";
      btn.addEventListener("click", () => {
        if (!f.unlocked) return;
        State.set(state => { state.activeFieldId = f.id; return state; });
        if (window.UI) window.UI.show("shop");
      });
      fieldSelect.appendChild(btn);
    });
    container.appendChild(fieldSelect);

    const activeField = s.fields.find(f => f.id === s.activeFieldId);
    if (activeField && activeField.unlocked) {
      const fieldGrid = document.createElement("div");
      fieldGrid.className = "shop-grid";
      window.FIELD_UPGRADES.forEach(u => {
        fieldGrid.appendChild(fieldUpgradeCard(u, activeField));
      });
      container.appendChild(fieldGrid);
    } else {
      const note = document.createElement("div");
      note.className = "empty";
      note.textContent = "解放済みの田を選択してください。";
      container.appendChild(note);
    }

    // プレイヤー全体アップグレード
    const playerTitle = document.createElement("div");
    playerTitle.className = "section-title";
    playerTitle.style.marginTop = "20px";
    playerTitle.textContent = "🛠️ 全体アップグレード（永続）";
    container.appendChild(playerTitle);

    const playerGrid = document.createElement("div");
    playerGrid.className = "shop-grid";
    window.PLAYER_UPGRADES.forEach(u => {
      playerGrid.appendChild(playerUpgradeCard(u));
    });
    container.appendChild(playerGrid);

    // プレステージ報酬
    const prestigeTitle = document.createElement("div");
    prestigeTitle.className = "section-title";
    prestigeTitle.style.marginTop = "20px";
    prestigeTitle.textContent = "🌟 累計実績ボーナス（自動取得）";
    container.appendChild(prestigeTitle);

    const prestigeGrid = document.createElement("div");
    prestigeGrid.style.cssText = "display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;";
    const prestigeStatus = window.Upgrades.getPrestigeStatus();
    prestigeStatus.forEach(p => {
      const card = document.createElement("div");
      card.style.cssText = `padding:10px 12px; border:1px solid ${p.unlocked ? "#2f7d32" : "#e6dfc4"}; border-radius:8px; background:${p.unlocked ? "#e8f5e9" : "#fffdf7"};`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong>${p.icon} ${p.name}</strong>
          <span class="badge">${p.unlocked ? "✅" : "未"}</span>
        </div>
        <div class="progress" style="margin:4px 0 4px 0;"><div class="bar" style="width:${Math.round(p.progress*100)}%"></div></div>
        <div style="font-size:11px; color:#6b5a1e;">${p.current} / ${p.threshold}</div>`;
      prestigeGrid.appendChild(card);
    });
    container.appendChild(prestigeGrid);
  }

  function fieldUpgradeCard(u, field) {
    const card = document.createElement("div");
    card.className = "shop-card";
    const lvl = window.Upgrades.fieldLevel(field, u.id);
    const max = (window.BALANCE.FIELD_UPGRADE_PRICE[u.id] || {}).max || 1;
    const price = window.Upgrades.fieldPriceForNextLevel(u.id, lvl);
    const isMax = price === null;
    const s = State.get();
    const canBuy = !isMax && s.player.grain >= price;

    card.innerHTML = `
      <div class="icon">${u.icon}</div>
      <div class="name">${u.name} <span class="badge">Lv ${lvl} / ${max}</span></div>
      <div class="desc">${u.desc}</div>
      <div class="progress" style="margin:4px 0;"><div class="bar" style="width:${Math.round(lvl/max*100)}%"></div></div>
      <div class="price">
        <span>${isMax ? "MAX" : `🍚 ${price}`}</span>
        ${isMax ? "" : `<button class="btn" ${canBuy ? "" : "disabled"}>強化</button>`}
      </div>`;
    if (!isMax) {
      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        const r = window.Upgrades.buyFieldUpgrade(field.id, u.id);
        if (r.ok) {
          flashUpgrade(card, `${u.icon} Lv ${r.level}!`);
          window.Toast.show(`✨ ${u.name} Lv ${r.level}!`, "harvest");
          window.Storage.scheduleSave(State.get());
          setTimeout(() => {
            if (window.UI) {
              window.UI.refreshTopbar();
              window.UI.show("shop");
            }
          }, 600);
        } else {
          window.Toast.show(r.reason === "no_grain" ? "米粒が足りません" : "強化できません", "warn");
        }
      });
    }
    return card;
  }

  function flashUpgrade(card, label) {
    card.style.animation = "upgrade-pulse 0.6s ease-out";
    // sparkle overlay
    const sparkle = document.createElement("div");
    sparkle.textContent = "✨";
    sparkle.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:48px; pointer-events:none; animation: sparkle-burst 0.7s ease-out forwards; z-index:5;";
    card.style.position = "relative";
    card.appendChild(sparkle);
    // floating label
    const lbl = document.createElement("div");
    lbl.textContent = label;
    lbl.style.cssText = "position:absolute; top:30%; left:50%; transform:translate(-50%,-50%); font-weight:700; color:#9a3412; font-size:14px; pointer-events:none; --dx:0px; --dy:-40px; animation: coin-flow 0.8s ease-out forwards; z-index:6;";
    card.appendChild(lbl);
    setTimeout(() => { sparkle.remove(); lbl.remove(); card.style.animation = ""; }, 900);
  }

  function playerUpgradeCard(u) {
    const card = document.createElement("div");
    card.className = "shop-card";
    const lvl = window.Upgrades.playerLevel(u.id);
    const max = (window.BALANCE.PLAYER_UPGRADE_PRICE[u.id] || {}).max || 1;
    const price = window.Upgrades.playerPriceForNextLevel(u.id, lvl);
    const isMax = price === null;
    const s = State.get();
    const canBuy = !isMax && s.player.grain >= price;

    card.innerHTML = `
      <div class="icon">${u.icon}</div>
      <div class="name">${u.name} <span class="badge">Lv ${lvl} / ${max}</span></div>
      <div class="desc">${u.desc}</div>
      <div class="progress" style="margin:4px 0;"><div class="bar" style="width:${Math.round(lvl/max*100)}%"></div></div>
      <div class="price">
        <span>${isMax ? "MAX" : `🍚 ${price}`}</span>
        ${isMax ? "" : `<button class="btn" ${canBuy ? "" : "disabled"}>強化</button>`}
      </div>`;
    if (!isMax) {
      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        const r = window.Upgrades.buyPlayerUpgrade(u.id);
        if (r.ok) {
          flashUpgrade(card, `${u.icon} Lv ${r.level}!`);
          window.Toast.show(`✨ ${u.name} Lv ${r.level}!`, "harvest");
          window.Storage.scheduleSave(State.get());
          setTimeout(() => {
            if (window.UI) {
              window.UI.refreshTopbar();
              window.UI.show("shop");
            }
          }, 600);
        } else {
          window.Toast.show(r.reason === "no_grain" ? "米粒が足りません" : "強化できません", "warn");
        }
      });
    }
    return card;
  }

  return { render };
})();
