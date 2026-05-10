// 田んぼ・成長・収穫
window.Farm = (function () {
  // 段階閾値（GP累計） — 関川村テキスト・大阪府手引きの段階区分に準拠
  const STAGE_THRESHOLDS = [0, 30, 80, 160, 260, 380];
  // 正式な生育段階名 (教科書準拠)
  const STAGE_NAMES = ["播種期", "苗期", "分げつ期", "出穂期", "登熟期", "成熟期"];
  const STAGE_ICONS = ["🌰", "🌱", "🌿", "🌾", "🌾", "🌾✨"];
  // 各段階の簡単な解説 (図鑑・ヒント表示用)
  const STAGE_DESCRIPTIONS = [
    "播種・出芽期。種子が水分と温度を得て発芽する段階。",
    "苗期。緑化期・硬化期を経て移植可能な苗となる。",
    "分げつ期。茎数が増え、最高分げつ期を迎えると中干しを開始。",
    "出穂期。穂が止葉から抽出し、開花・受精が始まる。",
    "登熟期。乳熟・糊熟・黄熟を経て籾が充実する。",
    "成熟期。穂の根元に1〜1.5割の帯緑色籾が残る頃が収穫適期。"
  ];

  function getActiveField() {
    const s = State.get();
    return s.fields.find(f => f.id === s.activeFieldId) || s.fields[0];
  }

  function setActiveField(id) {
    State.set(s => { s.activeFieldId = id; return s; });
  }

  function plant(fieldId, varietyId) {
    State.set(s => {
      const f = s.fields.find(x => x.id === fieldId);
      if (!f || !f.unlocked) return s;
      f.varietyId = varietyId;
      // 苗床品質アップグレードによる初期GP
      const startGp = (window.Upgrades && window.Upgrades.getStartGp) ? window.Upgrades.getStartGp(f) : 0;
      f.growthPoints = startGp;
      f.stage = computeStage(f.growthPoints);
      f.plantedAt = new Date().toISOString();
      f.activeBuffs = [];
      f.activeEvent = null;
      f.questionsSinceEvent = 0;
      // プレステージ：累計収穫10回以上で田植え時に肥料1付与
      const totalH = s.fields.reduce((a, x) => a + (x.harvestCount || 0), 0);
      if (totalH >= (window.BALANCE.PRESTIGE.autoFertilizerHarvest || 999) && !s._autoFertGivenThisPlant) {
        s.inventory.fertilizer_basic = (s.inventory.fertilizer_basic || 0) + 1;
      }
      return s;
    });
  }

  // 1問あたりの成長計算
  // 戻り値: { gpGain, grainDrop, comboSaved, fieldEvent, fieldResults: [{fieldId, gpGain, grainDrop, newStage}] }
  // 仕様: 1問正解で植えられている全ての田んぼが同時に成長する。
  function applyAnswer(isCorrect, difficulty) {
    const s = State.get();
    const plantedFields = s.fields.filter(f => f.unlocked && f.varietyId);

    // === コンボ・統計の更新 (1問につき1度のみ) ===
    let comboSaved = false;
    State.set(state => {
      state.player.totalQuestions++;
      if (isCorrect) {
        state.player.totalCorrect++;
        state.player.currentCombo++;
        if (state.player.currentCombo > state.player.bestCombo) {
          state.player.bestCombo = state.player.currentCombo;
        }
      } else {
        // おむすびでコンボ保護 (1問につき1回)
        if (state.inventory.omusubi && state.inventory.omusubi > 0 && state.player.currentCombo >= 5) {
          state.inventory.omusubi--;
          comboSaved = true;
        } else {
          state.player.currentCombo = 0;
        }
      }
      return state;
    });

    if (plantedFields.length === 0) {
      // 田植え前は統計のみ更新して終わり
      return { gpGain: 0, grainDrop: 0, fieldEvent: null, fieldResults: [], comboSaved };
    }

    // === 各田んぼについてGP / 米粒を計算 (バフ・イベントは田毎に異なる) ===
    const combo = State.get().player.currentCombo;
    const baseGP = (window.BALANCE && window.BALANCE.GP.base) || 10;
    const comboLimit = (window.Upgrades && window.Upgrades.getComboLimit) ? window.Upgrades.getComboLimit() : 20;
    const comboMult = 1 + Math.min(combo, comboLimit) * 0.05;
    const knowledgeBonus = (window.Upgrades && window.Upgrades.getKnowledgeBonus) ? window.Upgrades.getKnowledgeBonus() : 0;
    const baseDiffBonus = difficulty === 3 ? 1.5 : difficulty === 2 ? 1.2 : 1.0;
    const diffBonus = baseDiffBonus + knowledgeBonus;
    const playerUpMult = (window.Upgrades && window.Upgrades.getPlayerGpMultiplier) ? window.Upgrades.getPlayerGpMultiplier() : 1;
    const dropBase = (window.BALANCE && window.BALANCE.GRAIN.dropBase) || 0.1;
    const chanceLuckyDrop = (window.BALANCE && window.BALANCE.GRAIN.chanceLuckyDrop) || 0.1;

    const fieldResults = plantedFields.map(field => {
      let gpGain = 0;
      let grainDrop = 0;
      if (isCorrect) {
        const buffMult = computeBuffMult(field);
        const eventMult = computeEventGpMult(field);
        const eventOffset = computeEventGpOffset(field);
        const fieldUpMult = (window.Upgrades && window.Upgrades.getFieldGpMultiplier) ? window.Upgrades.getFieldGpMultiplier(field) : 1;
        gpGain = Math.floor(baseGP * comboMult * diffBonus * buffMult * eventMult * fieldUpMult * playerUpMult) + eventOffset;
        gpGain = Math.max(gpGain, 0);
        // 米粒は田毎にロール
        grainDrop = Math.floor(gpGain * dropBase);
        if (Math.random() < chanceLuckyDrop) grainDrop += 1 + Math.floor(combo / 5);
      } else {
        // 不正解時のペナルティイベント (田固有)
        const ev = field.activeEvent;
        if (ev && ev.effectType === "wrong_penalty") {
          gpGain = ev.penaltyGP || 0;
        }
      }
      return { fieldId: field.id, gpGain, grainDrop };
    });

    // === 状態適用 ===
    let totalGpGain = 0;
    let totalGrainDrop = 0;
    State.set(state => {
      for (const r of fieldResults) {
        const f = state.fields.find(x => x.id === r.fieldId);
        if (!f) continue;
        f.growthPoints = Math.max(0, (f.growthPoints || 0) + r.gpGain);
        f.stage = computeStage(f.growthPoints);
        r.newStage = f.stage;

        // バフのカウントダウン (田毎)
        if (f.activeBuffs && f.activeBuffs.length) {
          f.activeBuffs.forEach(b => { if (b.questions != null) b.questions--; });
          f.activeBuffs = f.activeBuffs.filter(b => b.questions == null || b.questions > 0);
        }
        // イベントのカウントダウン
        if (f.activeEvent && f.activeEvent.questionsLeft != null) {
          f.activeEvent.questionsLeft--;
          if (f.activeEvent.questionsLeft <= 0 && !f.activeEvent.persistent) {
            f.activeEvent = null;
          }
        }
        f.questionsSinceEvent = (f.questionsSinceEvent || 0) + 1;

        totalGpGain += Math.max(0, r.gpGain);
        totalGrainDrop += r.grainDrop;
      }
      state.player.totalGP += totalGpGain;
      state.player.grain += totalGrainDrop;
      state.player.lifetimeGrain = (state.player.lifetimeGrain || 0) + totalGrainDrop;
      return state;
    });

    // === イベント抽選 (各田、5問経過していれば) ===
    // 一画面の混乱を避けるため、表示は最初に発生した1件のみ。残りは背景でstateに反映済。
    let triggeredEvent = null;
    if (window.Events) {
      for (const r of fieldResults) {
        const field = State.get().fields.find(f => f.id === r.fieldId);
        if (field && field.questionsSinceEvent >= 5) {
          const ev = window.Events.rollEvent(r.fieldId);
          if (ev && !triggeredEvent) triggeredEvent = ev;
        }
      }
    }

    return {
      gpGain: totalGpGain,
      grainDrop: totalGrainDrop,
      fieldEvent: triggeredEvent,
      comboSaved,
      fieldResults
    };
  }

  function computeStage(gp) {
    let stage = 0;
    for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (gp >= STAGE_THRESHOLDS[i]) { stage = i; break; }
    }
    return stage;
  }

  function computeBuffMult(field) {
    if (!field.activeBuffs || !field.activeBuffs.length) return 1;
    let m = 1;
    field.activeBuffs.forEach(b => {
      if (b.type === "buff_gp" && b.multiplier) m *= b.multiplier;
    });
    return m;
  }

  function computeEventGpMult(field) {
    const ev = field.activeEvent;
    if (!ev) return 1;
    if (ev.effectType === "gp_mult" && ev.value != null) return ev.value;
    if (ev.effectType === "combo_mult" && ev.value != null) return ev.value;
    return 1;
  }

  function computeEventGpOffset(field) {
    const ev = field.activeEvent;
    if (!ev) return 0;
    if (ev.effectType === "gp_offset") return ev.value || 0;
    return 0;
  }

  function isHarvestable(field) {
    return field && field.varietyId && field.stage >= 5;
  }

  function harvest(fieldId) {
    let yieldAmount = 0;
    let varietyId = null;
    State.set(s => {
      const f = s.fields.find(x => x.id === fieldId);
      if (!f || !isHarvestable(f)) return s;
      const variety = window.VARIETIES.find(v => v.id === f.varietyId);
      if (!variety) return s;

      let base = variety.baseYield;
      let yieldMod = 1;
      let qualityMod = 1;
      let qualityLabel = null;
      // イベントによる収量・品質補正
      if (f.activeEvent && f.activeEvent.effectType === "yield_penalty") {
        yieldMod -= f.activeEvent.value || 0;
      }
      if (f.activeEvent && f.activeEvent.effectType === "quality_penalty") {
        qualityMod -= f.activeEvent.value || 0;
        qualityLabel = f.activeEvent.qualityLabel || "品質劣化";
      }
      // 品質劣化は検査等級下落として収量金額に反映（数量は減らないが米粒換金額が下がる）
      // 鎌の品質＋プレステージによる収量倍率
      const yieldMult = (window.Upgrades && window.Upgrades.getYieldMultiplier) ? window.Upgrades.getYieldMultiplier() : 1;
      yieldAmount = Math.max(0, Math.floor(base * yieldMod * qualityMod * yieldMult));

      s.player.grain += yieldAmount;
      s.player.lifetimeGrain = (s.player.lifetimeGrain || 0) + yieldAmount;

      f.harvestCount = (f.harvestCount || 0) + 1;
      varietyId = f.varietyId;

      // 品種コレクション更新
      if (!s.collection.varieties[variety.id]) {
        s.collection.varieties[variety.id] = { unlocked: true, harvests: 0 };
      }
      s.collection.varieties[variety.id].harvests = (s.collection.varieties[variety.id].harvests || 0) + 1;

      // 台風サバイバルフラグ
      if (f.activeEvent && f.activeEvent.id === "typhoon") {
        s.flags.typhoon_survived = true;
      }

      // 田んぼリセット
      f.varietyId = null;
      f.growthPoints = 0;
      f.stage = 0;
      f.plantedAt = null;
      f.activeBuffs = [];
      f.activeEvent = null;
      f.questionsSinceEvent = 0;

      return s;
    });

    // 田んぼ拡張アンロック判定
    checkFieldUnlocks();
    return { yield: yieldAmount, varietyId };
  }

  function checkFieldUnlocks() {
    State.set(s => {
      const totalHarvests = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
      const f2 = s.fields.find(x => x.id === 2);
      const f3 = s.fields.find(x => x.id === 3);
      const f4 = s.fields.find(x => x.id === 4);
      if (f2 && !f2.unlocked && totalHarvests >= 3) f2.unlocked = true;
      if (f3 && !f3.unlocked && totalHarvests >= 10 && s.player.grain >= 500) {
        f3.unlocked = true;
        s.player.grain -= 500;
      }
      const varietyCount = Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length;
      if (f4 && !f4.unlocked && totalHarvests >= 25 && s.player.grain >= 2000 && varietyCount >= 5) {
        f4.unlocked = true;
        s.player.grain -= 2000;
      }
      return s;
    });
  }

  function applyItem(itemId, fieldId) {
    const item = window.ITEMS.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: "item_not_found" };
    const s = State.get();
    if (!s.inventory[itemId] || s.inventory[itemId] < 1) return { ok: false, reason: "no_stock" };
    const field = s.fields.find(f => f.id === fieldId);
    if (!field || !field.varietyId) return { ok: false, reason: "no_field" };

    let usedNow = false;
    let cleared = null;

    State.set(state => {
      const f = state.fields.find(x => x.id === fieldId);
      if (item.effect.type === "buff_gp") {
        f.activeBuffs.push({ type: "buff_gp", multiplier: item.effect.multiplier, questions: item.effect.questions });
        usedNow = true;
      } else if (item.effect.type === "cure_event") {
        if (f.activeEvent && (item.effect.targets || []).includes(f.activeEvent.id)) {
          cleared = f.activeEvent.id;
          if (cleared === "leaf_blast" || cleared === "panicle_blast" || cleared === "blast_disease") {
            state.flags.blast_cured = (state.flags.blast_cured || 0) + 1;
          }
          f.activeEvent = null;
          usedNow = true;
        }
      } else if (item.effect.type === "prevent_event") {
        f.activeBuffs.push({ type: "prevent_event", targets: item.effect.targets, persistent: true });
        usedNow = true;
      }
      if (usedNow) state.inventory[itemId]--;
      return state;
    });

    return { ok: usedNow, cleared, item };
  }

  return {
    STAGE_NAMES, STAGE_ICONS, STAGE_THRESHOLDS, STAGE_DESCRIPTIONS,
    getActiveField, setActiveField, plant, applyAnswer,
    isHarvestable, harvest, applyItem, checkFieldUnlocks
  };
})();
