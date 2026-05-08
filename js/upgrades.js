// アップグレード購入と効果計算
window.Upgrades = (function () {

  // === 価格 ===
  function fieldPriceForNextLevel(upgradeId, currentLevel) {
    const curve = window.BALANCE.FIELD_UPGRADE_PRICE[upgradeId];
    if (!curve) return null;
    return window.BALANCE.priceForNextLevel(curve, currentLevel);
  }

  function playerPriceForNextLevel(upgradeId, currentLevel) {
    const curve = window.BALANCE.PLAYER_UPGRADE_PRICE[upgradeId];
    if (!curve) return null;
    return window.BALANCE.priceForNextLevel(curve, currentLevel);
  }

  // === 購入 ===
  function buyFieldUpgrade(fieldId, upgradeId) {
    const def = window.FIELD_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return { ok: false, reason: "not_found" };
    const s = State.get();
    const f = s.fields.find(x => x.id === fieldId);
    if (!f || !f.unlocked) return { ok: false, reason: "no_field" };
    const lvl = (f.upgrades && f.upgrades[upgradeId]) || 0;
    const price = fieldPriceForNextLevel(upgradeId, lvl);
    if (price === null) return { ok: false, reason: "max_level" };
    if (s.player.grain < price) return { ok: false, reason: "no_grain" };
    State.set(state => {
      const target = state.fields.find(x => x.id === fieldId);
      if (!target.upgrades) target.upgrades = {};
      target.upgrades[upgradeId] = (target.upgrades[upgradeId] || 0) + 1;
      state.player.grain -= price;
      return state;
    });
    return { ok: true, level: lvl + 1, paid: price };
  }

  function buyPlayerUpgrade(upgradeId) {
    const def = window.PLAYER_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return { ok: false, reason: "not_found" };
    const s = State.get();
    const lvl = (s.upgrades && s.upgrades[upgradeId]) || 0;
    const price = playerPriceForNextLevel(upgradeId, lvl);
    if (price === null) return { ok: false, reason: "max_level" };
    if (s.player.grain < price) return { ok: false, reason: "no_grain" };
    State.set(state => {
      if (!state.upgrades) state.upgrades = {};
      state.upgrades[upgradeId] = (state.upgrades[upgradeId] || 0) + 1;
      state.player.grain -= price;
      return state;
    });
    return { ok: true, level: lvl + 1, paid: price };
  }

  // === レベル取得ヘルパー ===
  function fieldLevel(field, upgradeId) {
    return (field && field.upgrades && field.upgrades[upgradeId]) || 0;
  }
  function playerLevel(upgradeId) {
    const s = State.get();
    return (s.upgrades && s.upgrades[upgradeId]) || 0;
  }

  // === 効果計算 ===
  // 田んぼのGP倍率（肥沃度）
  function getFieldGpMultiplier(field) {
    let m = 1;
    const lvl = fieldLevel(field, "soil_fertility");
    if (lvl > 0) m *= 1 + 0.05 * lvl;
    return m;
  }

  // プレイヤー全体のGP倍率（プレステージ累計1000問）
  function getPlayerGpMultiplier() {
    let m = 1;
    const s = State.get();
    for (const r of (window.BALANCE.PRESTIGE.gpMultPerThreshold || [])) {
      if (s.player.totalQuestions >= r.threshold) m *= 1 + r.bonus;
    }
    return m;
  }

  // 知識ボーナス（難易度ボーナスに足す）
  function getKnowledgeBonus() {
    return playerLevel("knowledge") * 0.10;
  }

  // 米粒倍率（鎌＋プレステージ）
  function getYieldMultiplier() {
    let m = 1;
    m *= 1 + 0.05 * playerLevel("sickle");
    const s = State.get();
    for (const r of (window.BALANCE.PRESTIGE.grainMultPerThreshold || [])) {
      if (s.player.totalQuestions >= r.threshold) m *= 1 + r.bonus;
    }
    return m;
  }

  // 田植え時の初期GP
  function getStartGp(field) {
    return 10 * fieldLevel(field, "nursery");
  }

  // コンボ最大値
  function getComboLimit() {
    const s = State.get();
    if (s.player.totalQuestions >= window.BALANCE.PRESTIGE.comboLimitUnlock) {
      return window.BALANCE.GP.comboMaxBonusWithPrestige;
    }
    return window.BALANCE.GP.comboMaxBonus;
  }

  // イベント効果軽減（field の water/wind 系アップグレード）
  // 戻り値: 0.0〜1.0 の係数（負イベントの値にこれを掛けて軽減）
  function getEventValueReduction(field, eventId) {
    let reduction = 0;
    for (const u of window.FIELD_UPGRADES) {
      if (u.effect.type !== "event_resist") continue;
      if (!u.effect.targets.includes(eventId)) continue;
      const lvl = fieldLevel(field, u.id);
      reduction += u.effect.perLevel * lvl;
    }
    return Math.min(reduction, 0.9); // 上限90%
  }

  // イベント発生率（pest_net + プレステージ）
  function getEventRateMultiplier(field, eventId) {
    let m = 1;
    // 田単位 pest_net
    for (const u of window.FIELD_UPGRADES) {
      if (u.effect.type !== "event_rate") continue;
      if (!u.effect.targets.includes(eventId)) continue;
      const lvl = fieldLevel(field, u.id);
      m *= Math.max(0.1, 1 - u.effect.perLevel * lvl);
    }
    // プレステージ：累計収穫50回以上で全イベントレート低下
    const s = State.get();
    const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
    const er = window.BALANCE.PRESTIGE.eventRateReduction;
    if (er && totalH >= er.threshold) {
      m *= Math.max(0.1, 1 - er.bonus);
    }
    return m;
  }

  // プレステージ報酬の取得状況リスト
  function getPrestigeStatus() {
    const s = State.get();
    const totalQ = s.player.totalQuestions;
    const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
    return (window.PRESTIGE_REWARDS || []).map(r => {
      const v = r.trigger.type === "totalQuestions" ? totalQ : totalH;
      return {
        id: r.id, icon: r.icon, name: r.name,
        threshold: r.trigger.threshold,
        current: v,
        unlocked: v >= r.trigger.threshold,
        progress: Math.min(1, v / r.trigger.threshold)
      };
    });
  }

  return {
    // 価格
    fieldPriceForNextLevel, playerPriceForNextLevel,
    // 購入
    buyFieldUpgrade, buyPlayerUpgrade,
    // レベル
    fieldLevel, playerLevel,
    // 効果計算
    getFieldGpMultiplier, getPlayerGpMultiplier, getKnowledgeBonus,
    getYieldMultiplier, getStartGp, getComboLimit,
    getEventValueReduction, getEventRateMultiplier,
    getPrestigeStatus
  };
})();
