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
    const stageDesc = (window.Farm.STAGE_DESCRIPTIONS && window.Farm.STAGE_DESCRIPTIONS[stage]) || "";
    info.innerHTML = `
      <div>段階: <strong>${window.Farm.STAGE_NAMES[stage]}</strong> (${field.growthPoints} GP)</div>
      ${stageDesc ? `<div style="font-size:12px; color:#6b5a1e; padding:6px 10px; background:#fff8df; border-left:3px solid #2f7d32; border-radius:4px; margin:6px 0; line-height:1.5;">📖 ${stageDesc}</div>` : ""}
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
        if (window.Prestige) window.Prestige.checkAndCelebrate();
        window.Storage.scheduleSave(State.get());
        // 収穫結果モーダル (等級・構成要素・収量内訳)
        showHarvestModal(result);
      });
      btnRow.appendChild(harvestBtn);
    } else {
      const goQuiz = document.createElement("button");
      goQuiz.className = "btn";
      goQuiz.textContent = "📖 クイズで育てる";
      goQuiz.addEventListener("click", () => window.UI.show("quiz"));
      btnRow.appendChild(goQuiz);

      // 中干しボタン (分げつ期のみ、1回のみ)
      if (stage === 2 && !field.midSeasonDried) {
        const midBtn = document.createElement("button");
        midBtn.className = "btn secondary";
        midBtn.innerHTML = "💧 中干し開始";
        midBtn.title = "目標穂数の80%確保時に田面を一時的に乾かす作業。雑草・病害を抑制し品質を向上。";
        midBtn.addEventListener("click", () => {
          const r = window.Farm.applyMidSeasonDrying(field.id);
          if (r.ok) {
            window.Toast.show("💧 中干しを開始 (5問GP×1.15)", "event");
            window.Storage.scheduleSave(State.get());
            if (window.UI) window.UI.show("farm");
          } else {
            window.Toast.show(r.reason === "wrong_stage" ? "分げつ期のみ実施可" : "実施できません", "warn");
          }
        });
        btnRow.appendChild(midBtn);
      } else if (field.midSeasonDried) {
        const doneBadge = document.createElement("span");
        doneBadge.className = "badge";
        doneBadge.style.cssText = "background:#e8f5e9; color:#2f5d2f; padding:6px 10px;";
        doneBadge.textContent = "✅ 中干し済";
        btnRow.appendChild(doneBadge);
      }

      // 穂肥ボタン (出穂期のみ、1回のみ、米粒30消費)
      if (stage === 3 && !field.panicleDressed) {
        const panBtn = document.createElement("button");
        panBtn.className = "btn secondary";
        panBtn.innerHTML = "🌾 穂肥を施す (🍚30)";
        panBtn.title = "出穂20-25日前の追肥。穎花数と登熟を向上させる。収量+10%。";
        panBtn.addEventListener("click", () => {
          const r = window.Farm.applyPanicleDressing(field.id);
          if (r.ok) {
            window.Toast.show("🌾 穂肥を施した (8問GP×1.20)", "event");
            window.Storage.scheduleSave(State.get());
            window.UI.refreshTopbar();
            if (window.UI) window.UI.show("farm");
          } else if (r.reason === "no_grain") {
            window.Toast.show("米粒が足りません (30必要)", "warn");
          } else {
            window.Toast.show("実施できません", "warn");
          }
        });
        btnRow.appendChild(panBtn);
      } else if (field.panicleDressed) {
        const doneBadge = document.createElement("span");
        doneBadge.className = "badge";
        doneBadge.style.cssText = "background:#e8f5e9; color:#2f5d2f; padding:6px 10px;";
        doneBadge.textContent = "✅ 穂肥済";
        btnRow.appendChild(doneBadge);
      }
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

  // 収穫結果モーダル (等級・収量構成要素・換算)
  function showHarvestModal(result) {
    if (!result || !result.grade) {
      window.Toast.show("🍚 収穫!", "harvest");
      if (window.UI) { window.UI.refreshTopbar(); window.UI.show("farm"); }
      return;
    }
    const g = result.grade;
    const c = result.components || {};
    const yieldKgPer10a = Math.round((c.panicleNumber || 380) * (c.grainsPerPanicle || 75) * (c.ripeningRate || 0.88) * (c.thousandGrainWeight || 22) / 1000 / 1000 * 10 * 10) / 10;
    const labels = (result.qualityLabels || []).filter(Boolean);
    const html = `
      <div style="text-align:center; padding:6px 0 12px;">
        <div style="font-size:14px; color:#6b5a1e; margin-bottom:4px;">${result.varietyName || ""} 収穫完了</div>
        <div style="font-size:32px; font-weight:700; color:${g.color}; padding:6px 18px; display:inline-block; border:3px solid ${g.color}; border-radius:10px; background:#fff8df;">
          ${g.label}
        </div>
        <div style="font-size:11px; color:#6b5a1e; margin-top:6px;">${g.note}</div>
      </div>
      <div style="background:#fff8df; padding:10px 12px; border-radius:8px; font-size:12px; line-height:1.7; margin-bottom:8px;">
        <div style="font-weight:700; color:#2f5d2f; margin-bottom:4px;">📊 収量構成要素</div>
        <table style="width:100%; font-size:11px;">
          <tr><td>穂数</td><td style="text-align:right; font-weight:700;">${c.panicleNumber || "-"} 本/m²</td></tr>
          <tr><td>1穂籾数</td><td style="text-align:right; font-weight:700;">${c.grainsPerPanicle || "-"} 粒</td></tr>
          <tr><td>登熟歩合</td><td style="text-align:right; font-weight:700;">${Math.round((c.ripeningRate || 0) * 100)}%</td></tr>
          <tr><td>千粒重</td><td style="text-align:right; font-weight:700;">${c.thousandGrainWeight || "-"} g</td></tr>
        </table>
        <div style="margin-top:6px; padding-top:6px; border-top:1px dashed #cbb878; font-size:11px; color:#6b5a1e;">
          推定収量: <strong>${yieldKgPer10a.toFixed(0)} kg/10a</strong>
        </div>
      </div>
      ${labels.length > 0 ? `<div style="font-size:11px; color:#6b5a1e; margin-bottom:8px;">${labels.map(l => `<div>• ${l}</div>`).join("")}</div>` : ""}
      <div style="text-align:center; padding:10px; background:linear-gradient(90deg,#fbbf24,#fde890,#fbbf24); border-radius:8px;">
        <span style="font-size:14px;">獲得</span>
        <span style="font-size:24px; font-weight:700; color:#9a3412;"> 🍚 ${result.yield}</span>
      </div>
    `;
    window.Modal.open({
      title: "🌾 収穫結果",
      html,
      buttons: [{ label: "ありがとう！", primary: true, onClick: () => {
        if (window.UI) { window.UI.refreshTopbar(); window.UI.show("farm"); }
      } }]
    });
  }

  function lockCondition(field) {
    if (field.id === 2) return "通算3回 収穫で解放";
    if (field.id === 3) return "通算10回収穫＋🍚500で解放";
    if (field.id === 4) return "通算25回収穫＋🍚2000＋5品種";
    return "?";
  }

  return { render };
})();
