// ショップ画面 (タブ式)
window.ShopView = (function () {
  let currentTab = "items"; // "items" | "varieties" | "upgrades"

  function render(container) {
    container.innerHTML = "";
    const intro = document.createElement("div");
    intro.className = "card fade-in";
    intro.innerHTML = `
      <div class="section-title">🏪 ショップ</div>
      <div style="font-size:13px; color:#6b5a1e;">米粒（🍚）でアイテム・新品種・恒久アップグレードを入手しましょう。</div>`;
    container.appendChild(intro);

    // タブ切り替え
    const tabs = document.createElement("div");
    tabs.style.cssText = "display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;";
    [
      { key: "items", label: "🧰 道具・肥料" },
      { key: "varieties", label: "🌾 品種" },
      { key: "upgrades", label: "🛠️ アップグレード" }
    ].forEach(t => {
      const btn = document.createElement("button");
      btn.className = "btn " + (currentTab === t.key ? "" : "secondary");
      btn.textContent = t.label;
      btn.style.padding = "8px 14px";
      btn.style.fontSize = "13px";
      btn.addEventListener("click", () => {
        currentTab = t.key;
        render(container);
      });
      tabs.appendChild(btn);
    });
    container.appendChild(tabs);

    if (currentTab === "items") renderItems(container);
    else if (currentTab === "varieties") renderVarieties(container);
    else if (currentTab === "upgrades") renderUpgrades(container);
  }

  function renderItems(container) {
    const itemsGrid = document.createElement("div");
    itemsGrid.className = "shop-grid";
    window.ITEMS.forEach(item => {
      itemsGrid.appendChild(itemCard(item));
    });
    container.appendChild(itemsGrid);
  }

  function renderVarieties(container) {
    const shopVarieties = window.Shop.listShopVarieties();
    if (shopVarieties.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "解放可能な品種はまだありません。";
      container.appendChild(empty);
    } else {
      const vGrid = document.createElement("div");
      vGrid.className = "shop-grid";
      shopVarieties.forEach(v => vGrid.appendChild(varietyCard(v)));
      container.appendChild(vGrid);
    }
  }

  function renderUpgrades(container) {
    if (window.UpgradeView && window.UpgradeView.render) {
      window.UpgradeView.render(container);
    } else {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "アップグレードシステム読み込み失敗";
      container.appendChild(empty);
    }
  }

  function itemCard(item) {
    const s = State.get();
    const card = document.createElement("div");
    card.className = "shop-card";
    const owned = s.inventory[item.id] || 0;
    card.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="name">${item.name} <span class="badge">所持 ${owned}</span></div>
      <div class="desc">${item.desc}</div>
      <div class="price">
        <span>🍚 ${item.price}</span>
        <button class="btn ${s.player.grain >= item.price ? "" : ""}" ${s.player.grain < item.price ? "disabled" : ""}>買う</button>
      </div>`;
    card.querySelector("button").addEventListener("click", () => {
      const r = window.Shop.buyItem(item.id);
      if (r.ok) {
        window.Toast.show(`🛒 ${item.name} 購入!`, "event");
        window.Storage.scheduleSave(State.get());
        if (window.UI) {
          window.UI.refreshTopbar();
          window.UI.show("shop");
        }
      } else {
        window.Toast.show("米粒が足りません", "warn");
      }
    });
    return card;
  }

  function varietyCard(v) {
    const s = State.get();
    const unlocked = window.Shop.isVarietyUnlocked(v.id);
    const card = document.createElement("div");
    card.className = "shop-card";
    card.innerHTML = `
      <div class="icon">${v.icon}</div>
      <div class="name">${v.name} <span class="badge rarity-${v.rarity}">${v.rarity}</span></div>
      <div class="desc" style="font-size:11px;">${v.flavor || ""}</div>
      <div class="desc" style="font-size:11px; color:#6b5a1e;">基本収量 ${v.baseYield} / 速度 ${v.growthSpeed}x / 耐性 ${Math.round(v.eventResistance*100)}%</div>
      <div class="price">
        <span>${unlocked ? "✅ 入手済" : `🍚 ${v.price}`}</span>
        ${unlocked ? "" : `<button class="btn" ${s.player.grain < v.price ? "disabled" : ""}>買う</button>`}
      </div>`;
    if (!unlocked) {
      const btn = card.querySelector("button");
      if (btn) {
        btn.addEventListener("click", () => {
          const r = window.Shop.buyVariety(v.id);
          if (r.ok) {
            window.Toast.show(`🌾 ${v.name} 入手!`, "harvest");
            window.AchievementsMod.checkAll();
            window.Storage.scheduleSave(State.get());
            if (window.UI) {
              window.UI.refreshTopbar();
              window.UI.show("shop");
            }
          } else {
            window.Toast.show("購入できません", "warn");
          }
        });
      }
    }
    return card;
  }

  return { render };
})();
