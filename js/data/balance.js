// バランス値の集約。数値調整はここだけを触る。
window.BALANCE = {
  // === GP獲得式 ===
  GP: {
    base: 10,                      // 正解1問あたり基本GP
    comboMaxBonus: 20,             // コンボ上限 (素のまま)
    comboMaxBonusWithPrestige: 30, // 累計500問達成後の上限
    comboPerStep: 0.05,            // コンボ1段階あたりの倍率追加
    difficultyBonus: { 1: 1.0, 2: 1.2, 3: 1.5 }
  },

  // === 米粒獲得 ===
  GRAIN: {
    dropBase: 0.10,                // gpGain × 0.10 を切り捨て
    chanceLuckyDrop: 0.12          // 12% (10%→12%にゆるく強化、序盤の手応えUP)
  },

  // === 田んぼアップグレード (per-field) ===
  // priceCurve: base * growth^level （level は次レベル相対：lvl 0→1, 1→2, ...）
  FIELD_UPGRADE_PRICE: {
    soil_fertility: { base: 150, growth: 1.55, max: 10 }, // 200→150 (序盤のとっかかりを早く)
    irrigation:     { base: 350, growth: 1.7,  max: 5 },
    windbreak:      { base: 450, growth: 1.7,  max: 5 },
    pest_net:       { base: 400, growth: 1.7,  max: 5 },
    nursery:        { base: 250, growth: 1.65, max: 5 }
  },

  // === プレイヤー全体アップグレード ===
  PLAYER_UPGRADE_PRICE: {
    sickle:    { base: 400,  growth: 1.55, max: 10 }, // 500→400
    knowledge: { base: 800,  growth: 1.85, max: 5 },  // 1000→800、growth 2.0→1.85 (Lv5までの累計を抑える)
    inventory: { base: 250,  growth: 1.5,  max: 5 },  // 300→250
    warehouse: { base: 600,  growth: 1.65, max: 10 }, // 800→600
    catalog:   { base: 1200, growth: 1.85, max: 5 }   // 1500→1200
  },

  // === プレステージ系（累計実績） ===
  PRESTIGE: {
    // 米粒獲得倍率 (累計問題数のしきい値)
    grainMultPerThreshold: [
      { threshold: 100,  bonus: 0.05 },
      { threshold: 500,  bonus: 0.05 },
      { threshold: 2000, bonus: 0.05 }
    ],
    // GP倍率
    gpMultPerThreshold: [
      { threshold: 1000, bonus: 0.10 }
    ],
    // コンボ最大値解放しきい値
    comboLimitUnlock: 500,
    // 田植え時の自動肥料付与しきい値（累計収穫数）
    autoFertilizerHarvest: 10,
    // イベント発生率減少（累計収穫数しきい値）
    eventRateReduction: { threshold: 50, bonus: 0.15 }
  }
};

// 価格を計算: 次のレベルへ上げるためのコスト
window.BALANCE.priceForNextLevel = function (curve, currentLevel) {
  if (currentLevel >= curve.max) return null; // MAX
  return Math.floor(curve.base * Math.pow(curve.growth, currentLevel));
};
