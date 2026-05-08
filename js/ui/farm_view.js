// 田んぼ画面
window.FarmView = (function () {
  function render(container) {
    const s = State.get();
    container.innerHTML = "";

    const intro = document.createElement("div");
    intro.className = "card fade-in";
    intro.innerHTML = `
      <div class="section-title">🌾 あなたの田んぼ</div>
      <div style="font-size:13px; color:#6b5a1e;">区画を選んで田植え→クイズに正解で稲が育ちます。完熟したら収穫しましょう。</div>`;
    container.appendChild(intro);

    const grid = document.createElement("div");
    grid.className = "fields-grid";
    s.fields.forEach(f => grid.appendChild(renderField(f)));
    container.appendChild(grid);

    // 詳細パネル
    const panel = document.createElement("div");
    panel.className = "farm-detail-panel";
    panel.id = "farm-detail";
    panel.appendChild(renderDetail(window.Farm.getActiveField()));
    container.appendChild(panel);
  }

  function renderField(field) {
    const el = document.createElement("div");
    const s = State.get();
    el.className = "field" + (field.unlocked ? "" : " locked") + (field.id === s.activeFieldId ? " active" : "") + (window.Farm.isHarvestable(field) ? " harvestable" : "");
    el.dataset.fid = field.id;

    if (!field.unlocked) {
      const cond = lockCondition(field);
      el.innerHTML = `<div class="lock-overlay"><div class="padlock">🔒</div><div>${cond}</div></div>`;
      return el;
    }

    el.addEventListener("click", () => {
      window.Farm.setActiveField(field.id);
      const panel = document.getElementById("farm-detail");
      if (panel) {
        panel.innerHTML = "";
        panel.appendChild(renderDetail(field));
      }
      // ハイライト更新
      document.querySelectorAll(".field").forEach(e => e.classList.remove("active"));
      el.classList.add("active");
    });

    const variety = field.varietyId ? window.VARIETIES.find(v => v.id === field.varietyId) : null;
    const stage = field.stage || 0;
    const stageName = window.Farm.STAGE_NAMES[stage] || "";
    const nextThr = window.Farm.STAGE_THRESHOLDS[Math.min(stage + 1, 5)] || 380;
    const prevThr = window.Farm.STAGE_THRESHOLDS[stage] || 0;
    const span = Math.max(1, nextThr - prevThr);
    const into = field.growthPoints - prevThr;
    const pct = Math.min(100, Math.max(0, (into / span) * 100));

    // アップグレードバッジを生成
    const upgradeBadges = renderUpgradeBadges(field);

    el.innerHTML = `
      <div class="field-header">
        <span class="field-no">田 ${field.id}</span>
        <span class="field-stage">${stageName}</span>
      </div>
      ${upgradeBadges}
      <div class="field-art">
        ${variety ? riceArt(stage) : `<div style="font-size:30px; color:white; text-shadow:0 1px 2px rgba(0,0,0,0.5);">空き地</div>`}
      </div>
      <div class="field-footer">
        <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
        <div class="label">
          <span>${variety ? variety.name : "未植え"}</span>
          <span>${field.growthPoints} / ${nextThr} GP</span>
        </div>
      </div>
      ${field.activeEvent && field.activeEvent.overlay ? `<div class="event-overlay ${field.activeEvent.overlay}"></div>` : ""}
    `;
    return el;
  }

  function renderUpgradeBadges(field) {
    if (!field.upgrades || !window.FIELD_UPGRADES) return "";
    const badges = [];
    for (const u of window.FIELD_UPGRADES) {
      const lvl = field.upgrades[u.id] || 0;
      if (lvl > 0) {
        badges.push(`<span class="field-up-badge" title="${u.name} Lv${lvl}">${u.icon}<sup>${lvl}</sup></span>`);
      }
    }
    if (badges.length === 0) return "";
    return `<div class="field-upgrades">${badges.join("")}</div>`;
  }

  function riceArt(stage) {
    // 利用可能ならピクセルアートSVGスプライトを使用
    if (window.RICE_SPRITES && window.RICE_SPRITES[stage]) {
      const svg = window.RICE_SPRITES[stage];
      // 3株を並べる(成長段階1以降)、種は1個
      if (stage === 0) {
        return `<span class="rice-stalk pixel-rice">${svg}</span>`;
      }
      return `
        <span class="rice-stalk pixel-rice">${svg}</span>
        <span class="rice-stalk pixel-rice s2">${svg}</span>
        <span class="rice-stalk pixel-rice s3">${svg}</span>`;
    }
    // フォールバック: 絵文字
    if (stage <= 0) return `<span class="rice-stalk">🌰</span>`;
    if (stage === 1) return `<span class="rice-stalk">🌱</span><span class="rice-stalk s2">🌱</span><span class="rice-stalk s3">🌱</span>`;
    if (stage === 2) return `<span class="rice-stalk">🌿</span><span class="rice-stalk s2">🌿</span><span class="rice-stalk s3">🌿</span>`;
    if (stage === 3) return `<span class="rice-stalk">🌾</span><span class="rice-stalk s2">🌾</span><span class="rice-stalk s3">🌾</span>`;
    if (stage === 4) return `<span class="rice-stalk" style="color:gold;">🌾</span><span class="rice-stalk s2" style="color:gold;">🌾</span><span class="rice-stalk s3" style="color:gold;">🌾</span>`;
    return `<span class="rice-stalk">🌾</span><span class="rice-stalk s2">✨</span><span class="rice-stalk s3">🌾</span>`;
  }

  function renderDetail(field) {
    const wrap = document.createElement("div");
    wrap.className = "card fade-in";
    if (!field || !field.unlocked) {
      wrap.innerHTML = `<div class="empty">この区画はまだ解放されていません。</div>`;
      return wrap;
    }
    if (!field.varietyId) {
      // 田植え選択
      const title = document.createElement("div");
      title.className = "section-title";
      title.textContent = `🌱 田${field.id} に田植えする品種を選ぶ`;
      wrap.appendChild(title);

      const pick = document.createElement("div");
      pick.className = "variety-pick";
      window.VARIETIES.forEach(v => {
        const card = document.createElement("button");
        const unlocked = window.Shop.isVarietyUnlocked(v.id);
        card.className = "variety-card" + (unlocked ? "" : " locked");
        card.disabled = !unlocked;
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="name">${v.icon} ${v.name}</span>
            <span class="badge rarity-${v.rarity}">${v.rarity}</span>
          </div>
          <div class="stats">基本収量 ${v.baseYield} / 速度 ${v.growthSpeed}x / 耐性 ${Math.round(v.eventResistance*100)}%</div>
          <div style="font-size:11px; color:#94886a; margin-top:4px;">${v.flavor || ""}</div>`;
        if (unlocked) {
          card.addEventListener("click", () => {
            window.Farm.plant(field.id, v.id);
            window.AchievementsMod.checkAll();
            window.Toast.show(`🌱 ${v.name} を田植え！`, "event");
            window.Storage.scheduleSave(State.get());
            if (window.UI) window.UI.show("farm");
          });
        }
        pick.appendChild(card);
      });
      wrap.appendChild(pick);
      return wrap;
    }

    // 田植え済みの詳細
    const v = window.VARIETIES.find(x => x.id === field.varietyId);
    const stage = field.stage || 0;
    const harvestable = window.Farm.isHarvestable(field);

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = `🌾 田${field.id}: ${v ? v.name : "?"}`;
    wrap.appendChild(title);

    const info = document.createElement("div");
    info.style.fontSize = "13px";
    info.style.color = "#4a4a3f";
    info.style.marginBottom = "10px";
    info.innerHTML = `
      <div>段階: <strong>${window.Farm.STAGE_NAMES[stage]}</strong> (${field.growthPoints} GP)</div>
      <div>収穫回数: ${field.harvestCount || 0}</div>
      ${field.activeEvent ? `<div style="color:${field.activeEvent.kind === 'positive' ? '#2f7d32' : '#c2410c'}; margin-top:4px;">${field.activeEvent.icon} ${field.activeEvent.name} ${field.activeEvent.questionsLeft != null ? `(残${field.activeEvent.questionsLeft}問)` : "（持続中）"}</div>` : ""}
      ${field.activeBuffs && field.activeBuffs.length ? `<div style="color:#2f7d32; margin-top:4px;">バフ: ${field.activeBuffs.map(b => b.type === "buff_gp" ? `肥料×${b.multiplier}(${b.questions ?? "?"}問)` : "予防済").join(", ")}</div>` : ""}
    `;
    wrap.appendChild(info);

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";
    btnRow.style.flexWrap = "wrap";

    if (harvestable) {
      const harvestBtn = document.createElement("button");
      harvestBtn.className = "btn gold";
      harvestBtn.textContent = "🌾 収穫する";
      harvestBtn.addEventListener("click", () => {
        const result = window.Farm.harvest(field.id);
        window.AchievementsMod.checkAll();
        window.Shop.checkVarietyUnlocks();
        window.Toast.show(`🍚 +${result.yield} 収穫!`, "harvest");
        if (window.Prestige) window.Prestige.checkAndCelebrate();
        window.Storage.scheduleSave(State.get());
        if (window.UI) {
          window.UI.refreshTopbar();
          window.UI.show("farm");
        }
      });
      btnRow.appendChild(harvestBtn);
    } else {
      const goQuiz = document.createElement("button");
      goQuiz.className = "btn";
      goQuiz.textContent = "📖 クイズで育てる";
      goQuiz.addEventListener("click", () => window.UI.show("quiz"));
      btnRow.appendChild(goQuiz);
    }

    // アイテム使用
    const s = State.get();
    const ownedItems = Object.entries(s.inventory || {}).filter(([id, n]) => n > 0);
    if (ownedItems.length > 0) {
      const itemBtn = document.createElement("button");
      itemBtn.className = "btn secondary";
      itemBtn.textContent = "🎒 アイテム使用";
      itemBtn.addEventListener("click", () => openItemModal(field.id));
      btnRow.appendChild(itemBtn);
    }

    wrap.appendChild(btnRow);

    return wrap;
  }

  function openItemModal(fieldId) {
    const s = State.get();
    const owned = Object.entries(s.inventory || {}).filter(([id, n]) => n > 0);
    if (owned.length === 0) {
      window.Toast.show("アイテムを持っていません", "warn");
      return;
    }
    const html = owned.map(([id, n]) => {
      const it = window.ITEMS.find(x => x.id === id);
      if (!it) return "";
      return `<button class="shop-card" data-iid="${id}" style="text-align:left; cursor:pointer; width:100%; margin-bottom:6px; padding:8px;">
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="font-size:28px;">${it.icon}</div>
          <div style="flex:1;">
            <div style="font-weight:700;">${it.name} <span class="badge">×${n}</span></div>
            <div style="font-size:11px; color:#6b5a1e;">${it.desc}</div>
          </div>
        </div>
      </button>`;
    }).join("");

    window.Modal.open({
      title: "🎒 アイテムを使う",
      html: `<div style="max-height:340px; overflow-y:auto;">${html}</div>`,
      buttons: [{ label: "閉じる", primary: false }]
    });

    // モーダル内のボタンに後付けバインド
    setTimeout(() => {
      document.querySelectorAll("[data-iid]").forEach(btn => {
        btn.addEventListener("click", () => {
          const iid = btn.dataset.iid;
          const result = window.Farm.applyItem(iid, fieldId);
          if (result.ok) {
            window.Toast.show("✨ アイテム使用!", "event");
            window.Modal.close();
            window.Storage.scheduleSave(State.get());
            if (window.UI) window.UI.show("farm");
          } else {
            window.Toast.show("使用できません", "warn");
          }
        });
      });
    }, 50);
  }

  function lockCondition(field) {
    if (field.id === 2) return "通算3回 収穫で解放";
    if (field.id === 3) return "通算10回収穫＋🍚500で解放";
    if (field.id === 4) return "通算25回収穫＋🍚2000＋5品種";
    return "?";
  }

  return { render };
})();
