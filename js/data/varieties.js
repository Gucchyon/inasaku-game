// 品種マスタ (架空品種)
//
// 注意: 本ゲームに登場する品種は全て架空のオリジナル品種です。実在する登録品種・
// 商標品種とは無関係です。各品種の特性記述 (耐冷性・倒伏性・食味傾向等) は作物学
// 一般の知見に基づくフィクションです。
//
// rarity: N(普通) / R(レア) / SR(スーパーレア) / UR(ウルトラレア)
// baseYield: 収穫時の基本米粒
// growthSpeed: GP閾値の倍率(高いほど早く育つ)
// eventResistance: 病害虫イベント効果軽減率(-1〜1, 負値は弱い品種)
// unlockCondition: { type, value, ... } または null(初期解放)
window.VARIETIES = [
  // ==== 基幹品種 7種 ====
  { id: "asagiri", name: "朝霧米", icon: "🌾", rarity: "N", baseYield: 80, growthSpeed: 1.0, eventResistance: -0.05, price: 0, group: "japan_main",
    unlock: null, flavor: "朝霧をまとう瑞々しい良食味種。粘りと甘みのバランスが抜群だが、いもち病・倒伏に弱い。" },
  { id: "ryogetsu", name: "涼月米", icon: "🌾", rarity: "N", baseYield: 85, growthSpeed: 1.05, eventResistance: -0.05, price: 200, group: "japan_main",
    unlock: { type: "shop" }, flavor: "涼やかな月のような甘み。冷めても美味しいが、いもち病・倒伏にやや弱い。" },
  { id: "shungyo", name: "春暁米", icon: "🌾", rarity: "N", baseYield: 90, growthSpeed: 1.0, eventResistance: 0.0, price: 350, group: "japan_main",
    unlock: { type: "shop" }, flavor: "春の暁を映す端正な姿。耐冷性に優れ寒冷地で広く作付け。" },
  { id: "akizora", name: "秋空米", icon: "🌾", rarity: "R", baseYield: 95, growthSpeed: 0.95, eventResistance: -0.10, price: 600, group: "japan_main",
    unlock: { type: "shop" }, flavor: "粘りが少なく寿司や酢飯に最適。冷害・いもち病に弱く栽培難度高め。" },
  { id: "kagero", name: "陽炎米", icon: "🌾", rarity: "N", baseYield: 85, growthSpeed: 1.05, eventResistance: 0.0, price: 250, group: "japan_main",
    unlock: { type: "shop" }, flavor: "夏の陽炎のような輝き。耐倒伏・いもち病耐性ともに中程度の優等生。" },
  { id: "gekka", name: "月華米", icon: "✨", rarity: "R", baseYield: 110, growthSpeed: 1.0, eventResistance: 0.10, price: 0, group: "japan_main",
    unlock: { type: "achievement", value: "harvest_5" }, flavor: "月の光を凝らせた銘米。いもち病耐性やや強、粒が大きくつやが美しい。" },
  { id: "setsurei", name: "雪嶺米", icon: "✨", rarity: "R", baseYield: 115, growthSpeed: 1.0, eventResistance: 0.05, price: 0, group: "japan_main",
    unlock: { type: "achievement", value: "harvest_10" }, flavor: "雪嶺を望む北方の銘米。低アミロースで粘り強く、耐冷性も中程度。" },

  // ==== 地域名産 7種 ====
  { id: "hoshishizuku", name: "星雫米", icon: "💧", rarity: "R", baseYield: 105, growthSpeed: 1.0, eventResistance: 0.05, price: 800, group: "japan_local",
    unlock: { type: "shop" }, flavor: "夜空の星雫を集めたような透き通る粒の美しさ。" },
  { id: "oboroyume", name: "朧夢米", icon: "🌙", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.05, price: 800, group: "japan_local",
    unlock: { type: "shop" }, flavor: "朧月夜の夢のように、もちもちとした優しい食感。" },
  { id: "sorai", name: "蒼雷米", icon: "⚡", rarity: "R", baseYield: 105, growthSpeed: 0.95, eventResistance: 0.0, price: 900, group: "japan_local",
    unlock: { type: "shop" }, flavor: "晴れた青空に走る雷光のような、突き抜ける旨さ。" },
  { id: "asamoya", name: "朝靄米", icon: "🌫️", rarity: "N", baseYield: 90, growthSpeed: 1.05, eventResistance: 0.10, price: 400, group: "japan_local",
    unlock: { type: "shop" }, flavor: "朝靄の中の田んぼを思わせる、もちもち系の低アミロース米。" },
  { id: "ryokuin", name: "緑陰米", icon: "🌳", rarity: "N", baseYield: 90, growthSpeed: 1.0, eventResistance: 0.10, price: 350, group: "japan_local",
    unlock: { type: "shop" }, flavor: "山あいの緑陰で育つ、力強い味わいの中粒種。" },
  { id: "nagibiyori", name: "凪日和米", icon: "☀️", rarity: "N", baseYield: 95, growthSpeed: 1.0, eventResistance: 0.05, price: 400, group: "japan_local",
    unlock: { type: "shop" }, flavor: "凪のような穏やかな日和に育つ、一等米率の高さで知られる安定品種。" },
  { id: "daichi", name: "大地米", icon: "💪", rarity: "N", baseYield: 90, growthSpeed: 1.1, eventResistance: 0.15, price: 350, group: "japan_local",
    unlock: { type: "shop" }, flavor: "大地に根を張る元気者。高温障害に強く生育が早い。" },

  // ==== 古代米 6種 ====
  { id: "akaho", name: "紅穂米", icon: "🍂", rarity: "R", baseYield: 70, growthSpeed: 0.85, eventResistance: 0.20, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "morphology", count: 10 } }, flavor: "古代から続く赤い穂の米。野生味あふれる風味。" },
  { id: "kurodama", name: "玄玉米", icon: "🌑", rarity: "R", baseYield: 75, growthSpeed: 0.85, eventResistance: 0.20, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "physiology", count: 10 } }, flavor: "アントシアニン豊富な黒い玉のような粒。神事に用いられたとも。" },
  { id: "suidama", name: "翠玉米", icon: "🍀", rarity: "SR", baseYield: 85, growthSpeed: 0.85, eventResistance: 0.20, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "breeding", count: 8 } }, flavor: "希少な緑色の古代米。翠玉のような輝きと豊かな香り。" },
  { id: "koun", name: "香雲米", icon: "🌸", rarity: "R", baseYield: 80, growthSpeed: 0.95, eventResistance: 0.10, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "cultivation", count: 12 } }, flavor: "炊くと雲のように香り立つ。少量を混ぜて使う伝来の香り米。" },
  { id: "shisei", name: "紫宵米", icon: "🌅", rarity: "R", baseYield: 75, growthSpeed: 0.9, eventResistance: 0.15, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "growth_stage", count: 8 } }, flavor: "夜明け前の紫宵を映す、古来から伝わる赤紫米。" },
  { id: "shinkaho", name: "神火穂", icon: "🔥", rarity: "SR", baseYield: 95, growthSpeed: 0.85, eventResistance: 0.25, price: 0, group: "ancient",
    unlock: { type: "achievement", value: "ancient_master" }, flavor: "炎のような赤い穂。古代米のなかでも別格の貫禄。" },

  // ==== 海外風 6種 (架空) ====
  { id: "kaori_hana", name: "香り華米", icon: "🌺", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.0, price: 0, group: "world",
    unlock: { type: "total_correct", value: 50 }, flavor: "南国生まれの長粒種。香り高くスパイシーな料理に合う。" },
  { id: "akehana", name: "暁花米", icon: "🌼", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.0, price: 0, group: "world",
    unlock: { type: "total_correct", value: 80 }, flavor: "暁の花のような芳香を放つ香り米。" },
  { id: "yukitsubu", name: "雪粒米", icon: "❄️", rarity: "R", baseYield: 105, growthSpeed: 1.0, eventResistance: 0.05, price: 0, group: "world",
    unlock: { type: "total_correct", value: 120 }, flavor: "粒が雪のように真っ白で大きい中粒種。リゾット向き。" },
  { id: "shinju", name: "真珠米", icon: "🦪", rarity: "SR", baseYield: 120, growthSpeed: 1.0, eventResistance: 0.10, price: 0, group: "world",
    unlock: { type: "total_correct", value: 180 }, flavor: "粒が崩れにくい真珠のような中粒種。最高級リゾット米。" },
  { id: "taiyo", name: "太陽米", icon: "🌞", rarity: "R", baseYield: 105, growthSpeed: 1.05, eventResistance: 0.05, price: 0, group: "world",
    unlock: { type: "total_correct", value: 100 }, flavor: "太陽をたっぷり浴びて育つ中粒種。和洋折衷向き。" },
  { id: "hokuju", name: "北珠米", icon: "🐚", rarity: "R", baseYield: 100, growthSpeed: 1.0, eventResistance: 0.10, price: 0, group: "world",
    unlock: { type: "total_correct", value: 150 }, flavor: "北の海の珠のように小さく光沢のある粒。" },

  // ==== 酒米 2種 ====
  { id: "shuteki", name: "酒滴米", icon: "🍶", rarity: "SR", baseYield: 130, growthSpeed: 0.85, eventResistance: -0.10, price: 3000, group: "sake",
    unlock: { type: "shop_after", value: { harvest: 10 } }, flavor: "酒造好適米の王。大粒で心白率が高いが、長稈で倒伏しやすい。" },
  { id: "kuramoto", name: "蔵元米", icon: "🍶", rarity: "SR", baseYield: 125, growthSpeed: 0.85, eventResistance: -0.05, price: 2500, group: "sake",
    unlock: { type: "shop_after", value: { harvest: 8 } }, flavor: "古来から蔵元に愛される野趣あふれる酒造好適米。" },

  // ==== 伝説 2種 ====
  { id: "senkyo", name: "仙境の奇跡", icon: "🏔️", rarity: "UR", baseYield: 200, growthSpeed: 0.8, eventResistance: 0.30, price: 0, group: "legend",
    unlock: { type: "achievement", value: "legendary_farmer" }, flavor: "仙境に咲くと言われる伝説の稲。育てた者は名を残す。" },
  { id: "shinwanoine", name: "神話の稲", icon: "🌟", rarity: "UR", baseYield: 300, growthSpeed: 0.7, eventResistance: 0.50, price: 0, group: "legend",
    unlock: { type: "achievement", value: "all_master" }, flavor: "神話に語られる究極の稲。手にした農夫は永遠に語り継がれる。" }
];
