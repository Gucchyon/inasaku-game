// 図鑑（品種・アチーブメント）
window.CollectionView = (function () {
  function render(container) {
    container.innerHTML = "";
    const s = State.get();

    // ヘッダー
    const head = document.createElement("div");
    head.className = "card fade-in";
    const totalV = window.VARIETIES.length;
    const ownedV = Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length;
    const totalA = window.ACHIEVEMENTS.length;
    const ownedA = Object.keys(s.collection.achievements || {}).length;
    head.innerHTML = `
      <div class="section-title">📚 図鑑</div>
      <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:14px;">
        <div>品種 <strong>${ownedV}/${totalV}</strong></div>
        <div>アチーブメント <strong>${ownedA}/${totalA}</strong></div>
        <div>累計問題数 <strong>${s.player.totalQuestions}</strong></div>
        <div>累計正解 <strong>${s.player.totalCorrect}</strong></div>
        <div>最高コンボ <strong>${s.player.bestCombo}</strong></div>
      </div>`;
    container.appendChild(head);

    // 品種図鑑
    const vTitle = document.createElement("div");
    vTitle.className = "section-title";
    vTitle.textContent = "🌾 品種図鑑";
    container.appendChild(vTitle);

    const grid = document.createElement("div");
    grid.className = "collection-grid";
    window.VARIETIES.forEach(v => {
      const card = document.createElement("div");
      const own = s.collection.varieties[v.id];
      const unlocked = own && own.unlocked;
      card.className = "collection-card" + (unlocked ? "" : " locked");
      const harvests = own && own.harvests ? own.harvests : 0;
      card.innerHTML = `
        <div class="ico">${unlocked ? v.icon : "❓"}</div>
        <div class="name">${unlocked ? v.name : "？？？"} <span class="badge rarity-${v.rarity}">${v.rarity}</span></div>
        <div class="desc">${unlocked ? (v.flavor || "") : (v.unlock ? unlockHint(v.unlock) : "")}</div>
        ${unlocked ? `<div style="margin-top:6px; font-size:11px; color:#6b5a1e;">収穫 ${harvests} 回</div>` : ""}
      `;
      grid.appendChild(card);
    });
    container.appendChild(grid);

    // アチーブメント
    const aTitle = document.createElement("div");
    aTitle.className = "section-title";
    aTitle.textContent = "🏅 アチーブメント";
    container.appendChild(aTitle);

    const aGrid = document.createElement("div");
    aGrid.className = "collection-grid";
    window.ACHIEVEMENTS.forEach(a => {
      const got = s.collection.achievements[a.id];
      const card = document.createElement("div");
      card.className = "collection-card" + (got ? "" : " locked");
      card.innerHTML = `
        <div class="ico">${got ? a.icon : "🔒"}</div>
        <div class="name">${a.name}</div>
        <div class="desc">${a.desc}</div>
        ${a.reward ? `<div style="margin-top:6px; font-size:11px; color:#a07b1c;">${rewardLabel(a.reward)}</div>` : ""}
      `;
      aGrid.appendChild(card);
    });
    container.appendChild(aGrid);
  }

  function unlockHint(u) {
    if (u.type === "shop") return "ショップで購入";
    if (u.type === "shop_after") return `通算${u.value.harvest}回収穫後にショップ`;
    if (u.type === "achievement") return "特定アチーブで解放";
    if (u.type === "total_correct") return `累計${u.value}問正解で解放`;
    if (u.type === "category_correct") return `${u.value.category}を${u.value.count}回正解`;
    return "？";
  }

  function rewardLabel(r) {
    const parts = [];
    if (r.grain) parts.push("🍚" + r.grain);
    if (r.varietyId) {
      const v = window.VARIETIES.find(x => x.id === r.varietyId);
      parts.push("🌾" + (v ? v.name : r.varietyId));
    }
    if (r.itemId) {
      const i = window.ITEMS.find(x => x.id === r.itemId);
      parts.push((i ? i.icon : "") + (i ? i.name : r.itemId));
    }
    return parts.length ? "報酬: " + parts.join(" / ") : "";
  }

  return { render };
})();
