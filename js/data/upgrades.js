// アップグレード定義（field 単位、player 単位で別建て）
// effect.type で判別：
//   "gp_mult" — GP獲得倍率
//   "yield_mult" — 収穫時米粒倍率
//   "event_resist" — 特定イベントの効果軽減（負イベントの value を係数で減衰）
//   "event_rate" — イベント発生率の減少（pest 系）
//   "start_gp" — 田植え時の初期GP（苗床品質）
//   "combo_extra" — コンボ最大値の追加（プレステージのみ）
//   "carryover_max" — 米粒上限の拡張（倉庫）
//   "shop_slots" — ショップ品種枠の追加（種苗カタログ）

// 田んぼ単位のアップグレード（fields[i].upgrades[id] = level）
window.FIELD_UPGRADES = [
  { id: "soil_fertility", name: "肥沃度", icon: "🪴",
    desc: "土を肥やす。1レベルにつきGP獲得 +5%。",
    effect: { type: "gp_mult", perLevel: 0.05 } },
  { id: "irrigation", name: "水路整備", icon: "💧",
    desc: "灌漑を強化。干ばつ・冷夏の効果を1レベルにつき10%軽減。",
    effect: { type: "event_resist", targets: ["drought", "cool_summer", "heat_wave"], perLevel: 0.10 } },
  { id: "windbreak", name: "防風林", icon: "🌳",
    desc: "風を遮る。台風・大雨の効果を1レベルにつき15%軽減。",
    effect: { type: "event_resist", targets: ["typhoon", "heavy_rain"], perLevel: 0.15 } },
  { id: "pest_net", name: "害虫網", icon: "🕸️",
    desc: "害虫の侵入を防ぐ。病害虫イベント発生率を1レベルにつき10%減少。",
    effect: { type: "event_rate", targets: ["leaf_blast", "panicle_blast", "sheath_blight", "stink_bug", "planthopper", "weeds"], perLevel: 0.10 } },
  { id: "nursery", name: "苗床品質", icon: "🌱",
    desc: "良苗で育苗。田植え時の初期GP +10/Lv。",
    effect: { type: "start_gp", perLevel: 10 } }
];

// プレイヤー全体アップグレード（state.upgrades[id] = level）
window.PLAYER_UPGRADES = [
  { id: "sickle", name: "鎌の品質", icon: "🔪",
    desc: "鋭い鎌で収穫。収穫量 +5%/Lv。",
    effect: { type: "yield_mult", perLevel: 0.05 } },
  { id: "knowledge", name: "農学知識", icon: "📖",
    desc: "学問の力でGP増。難易度ボーナス +0.1×Lv。",
    effect: { type: "knowledge_bonus", perLevel: 0.10 } },
  { id: "inventory", name: "倉の拡張", icon: "📦",
    desc: "アイテム所持上限 +5/Lv。",
    effect: { type: "inventory_max", perLevel: 5 } },
  { id: "warehouse", name: "備蓄倉庫", icon: "🏚️",
    desc: "米粒上限 +1000/Lv (現状ハード上限なし、将来用)。",
    effect: { type: "carryover_max", perLevel: 1000 } },
  { id: "catalog", name: "種苗カタログ", icon: "📚",
    desc: "ショップに新品種枠 +1/Lv。",
    effect: { type: "shop_slots", perLevel: 1 } }
];

// プレステージ報酬（自動取得、レベルなし）
// 各効果は upgrades.js のロジックで実時間判定
window.PRESTIGE_REWARDS = [
  { id: "p_grain_5pct_100q",   trigger: { type: "totalQuestions", threshold: 100 },
    icon: "🌟", name: "米粒+5% (累計100問)" },
  { id: "p_combo_30",          trigger: { type: "totalQuestions", threshold: 500 },
    icon: "🔥", name: "コンボ最大値 30 (累計500問)" },
  { id: "p_grain_5pct_500q",   trigger: { type: "totalQuestions", threshold: 500 },
    icon: "🌟", name: "米粒+5% (累計500問)" },
  { id: "p_gp_10pct",          trigger: { type: "totalQuestions", threshold: 1000 },
    icon: "💯", name: "GP+10% (累計1000問)" },
  { id: "p_grain_5pct_2000q",  trigger: { type: "totalQuestions", threshold: 2000 },
    icon: "🌟", name: "米粒+5% (累計2000問)" },
  { id: "p_auto_fertilizer",   trigger: { type: "totalHarvests", threshold: 10 },
    icon: "🎁", name: "田植え時に肥料1付与 (累計収穫10回)" },
  { id: "p_event_rate_15pct",  trigger: { type: "totalHarvests", threshold: 50 },
    icon: "🛡️", name: "イベント発生率-15% (累計収穫50回)" }
];
