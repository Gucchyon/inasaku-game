// 品種マスタ
// rarity: N(普通) / R(レア) / SR(スーパーレア) / UR(ウルトラレア)
// baseYield: 収穫時の基本米粒
// growthSpeed: GP閾値の倍率(高いほど早く育つ)
// eventResistance: 病害虫イベント効果軽減率(0-1)
// unlockCondition: { type, value, ... } または null(初期解放)
window.VARIETIES = [
  // ==== 基幹品種 ====
  { id: "koshihikari", name: "コシヒカリ", icon: "🌾", rarity: "N", baseYield: 80, growthSpeed: 1.0, eventResistance: -0.05, price: 0, group: "japan_main",
    unlock: null, flavor: "全国シェア No.1。粘りと甘みのバランスが抜群だが、いもち病・倒伏に弱い。" },
  { id: "akitakomachi", name: "あきたこまち", icon: "🌾", rarity: "N", baseYield: 85, growthSpeed: 1.05, eventResistance: -0.05, price: 200, group: "japan_main",
    unlock: { type: "shop" }, flavor: "あっさりした甘み。冷めても美味しいが、いもち病・倒伏にやや弱い。" },
  { id: "hitomebore", name: "ひとめぼれ", icon: "🌾", rarity: "N", baseYield: 90, growthSpeed: 1.0, eventResistance: 0.0, price: 350, group: "japan_main",
    unlock: { type: "shop" }, flavor: "ひと目惚れする見た目と味。耐冷性に優れ東北で広く作付け。" },
  { id: "sasanishiki", name: "ササニシキ", icon: "🌾", rarity: "R", baseYield: 95, growthSpeed: 0.95, eventResistance: -0.10, price: 600, group: "japan_main",
    unlock: { type: "shop" }, flavor: "粘りが少なく寿司に最適。冷害・いもち病に弱く栽培難度高め。" },
  { id: "hinohikari", name: "ヒノヒカリ", icon: "🌾", rarity: "N", baseYield: 85, growthSpeed: 1.05, eventResistance: 0.0, price: 250, group: "japan_main",
    unlock: { type: "shop" }, flavor: "西日本の主力品種。耐倒伏中、いもち病耐性中。" },
  { id: "tsuyahime", name: "つや姫", icon: "✨", rarity: "R", baseYield: 110, growthSpeed: 1.0, eventResistance: 0.10, price: 0, group: "japan_main",
    unlock: { type: "achievement", value: "harvest_5" }, flavor: "山形県のブランド米。いもち病耐性やや強、粒が大きくつやが美しい。" },
  { id: "yumepirika", name: "ゆめぴりか", icon: "✨", rarity: "R", baseYield: 115, growthSpeed: 1.0, eventResistance: 0.05, price: 0, group: "japan_main",
    unlock: { type: "achievement", value: "harvest_10" }, flavor: "北海道の最高峰。低アミロースで粘り強い。耐冷性中。" },

  // ==== 地域名産 ====
  { id: "ginganoshizuku", name: "銀河のしずく", icon: "💧", rarity: "R", baseYield: 105, growthSpeed: 1.0, eventResistance: 0.05, price: 800, group: "japan_local",
    unlock: { type: "shop" }, flavor: "岩手の星。透き通る粒の美しさ。" },
  { id: "datemasayume", name: "だて正夢", icon: "🌙", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.05, price: 800, group: "japan_local",
    unlock: { type: "shop" }, flavor: "宮城の伊達男。もちもち食感。" },
  { id: "seitennohekireki", name: "青天の霹靂", icon: "⚡", rarity: "R", baseYield: 105, growthSpeed: 0.95, eventResistance: 0.0, price: 900, group: "japan_local",
    unlock: { type: "shop" }, flavor: "青森の衝撃。突き抜ける旨さ。" },
  { id: "oborodzuki", name: "おぼろづき", icon: "🌕", rarity: "N", baseYield: 90, growthSpeed: 1.05, eventResistance: 0.1, price: 400, group: "japan_local",
    unlock: { type: "shop" }, flavor: "北の朧月。低アミロースでもちもち。" },
  { id: "morinokumasan", name: "森のくまさん", icon: "🐻", rarity: "N", baseYield: 90, growthSpeed: 1.0, eventResistance: 0.1, price: 350, group: "japan_local",
    unlock: { type: "shop" }, flavor: "熊本生まれ。森を歩く熊のように力強い。" },
  { id: "sagabiyori", name: "さがびより", icon: "☀️", rarity: "N", baseYield: 95, growthSpeed: 1.0, eventResistance: 0.05, price: 400, group: "japan_local",
    unlock: { type: "shop" }, flavor: "佐賀のびより。一等米率の高さで知られる。" },
  { id: "genkitsukushi", name: "元気つくし", icon: "💪", rarity: "N", baseYield: 90, growthSpeed: 1.1, eventResistance: 0.15, price: 350, group: "japan_local",
    unlock: { type: "shop" }, flavor: "福岡の元気者。高温に強い。" },

  // ==== 古代米 ====
  { id: "akamai", name: "赤米", icon: "🍂", rarity: "R", baseYield: 70, growthSpeed: 0.85, eventResistance: 0.2, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "morphology", count: 10 } }, flavor: "古代から続く赤い米。野生味あふれる風味。" },
  { id: "kuromai", name: "黒米", icon: "🌑", rarity: "R", baseYield: 75, growthSpeed: 0.85, eventResistance: 0.2, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "physiology", count: 10 } }, flavor: "アントシアニン豊富。神事に用いられた。" },
  { id: "midorimai", name: "緑米", icon: "🍀", rarity: "SR", baseYield: 85, growthSpeed: 0.85, eventResistance: 0.2, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "breeding", count: 8 } }, flavor: "希少な緑色の古代米。香り高い。" },
  { id: "kaorimai", name: "香り米", icon: "🌸", rarity: "R", baseYield: 80, growthSpeed: 0.95, eventResistance: 0.1, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "cultivation", count: 12 } }, flavor: "炊くと芳ばしい香り。少量を混ぜて使う。" },
  { id: "asamurasaki", name: "朝紫", icon: "🌅", rarity: "R", baseYield: 75, growthSpeed: 0.9, eventResistance: 0.15, price: 0, group: "ancient",
    unlock: { type: "category_correct", value: { category: "growth_stage", count: 8 } }, flavor: "夜明けの紫。古来から伝わる赤紫米。" },
  { id: "kandaho", name: "神丹穂", icon: "🔥", rarity: "SR", baseYield: 95, growthSpeed: 0.85, eventResistance: 0.25, price: 0, group: "ancient",
    unlock: { type: "achievement", value: "ancient_master" }, flavor: "炎のような赤い穂。古代米のなかでも別格。" },

  // ==== 海外品種 ====
  { id: "basmati", name: "バスマティ", icon: "🇮🇳", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.0, price: 0, group: "world",
    unlock: { type: "total_correct", value: 50 }, flavor: "インドの長粒種。香り高くカレーに合う。" },
  { id: "jasmine", name: "ジャスミン", icon: "🇹🇭", rarity: "R", baseYield: 100, growthSpeed: 1.05, eventResistance: 0.0, price: 0, group: "world",
    unlock: { type: "total_correct", value: 80 }, flavor: "タイの香り米。花のような芳香。" },
  { id: "arborio", name: "アルボリオ", icon: "🇮🇹", rarity: "R", baseYield: 105, growthSpeed: 1.0, eventResistance: 0.05, price: 0, group: "world",
    unlock: { type: "total_correct", value: 120 }, flavor: "リゾット用の中粒種。デンプンが多い。" },
  { id: "carnaroli", name: "カルナローリ", icon: "🇮🇹", rarity: "SR", baseYield: 120, growthSpeed: 1.0, eventResistance: 0.1, price: 0, group: "world",
    unlock: { type: "total_correct", value: 180 }, flavor: "リゾット米の王様。粒が崩れにくい。" },
  { id: "calrose", name: "カリフォルニア中粒種", icon: "🇺🇸", rarity: "R", baseYield: 105, growthSpeed: 1.05, eventResistance: 0.05, price: 0, group: "world",
    unlock: { type: "total_correct", value: 100 }, flavor: "カリフォルニアで栽培される中粒。寿司にも。" },
  { id: "kokuryu", name: "黒龍江珍珠米", icon: "🇨🇳", rarity: "R", baseYield: 100, growthSpeed: 1.0, eventResistance: 0.1, price: 0, group: "world",
    unlock: { type: "total_correct", value: 150 }, flavor: "中国東北の真珠米。粒が小さく光沢がある。" },

  // ==== 酒米 ====
  { id: "yamadanishiki", name: "山田錦", icon: "🍶", rarity: "SR", baseYield: 130, growthSpeed: 0.85, eventResistance: -0.10, price: 3000, group: "sake",
    unlock: { type: "shop_after", value: { harvest: 10 } }, flavor: "酒米の王。大粒で心白率が高いが、長稈で倒伏しやすい。" },
  { id: "omachi", name: "雄町", icon: "🍶", rarity: "SR", baseYield: 125, growthSpeed: 0.85, eventResistance: -0.05, price: 2500, group: "sake",
    unlock: { type: "shop_after", value: { harvest: 8 } }, flavor: "山田錦の祖父。野趣あふれる酒造好適米。" },

  // ==== 伝説 ====
  { id: "horaimai", name: "蓬莱米", icon: "🏔️", rarity: "UR", baseYield: 200, growthSpeed: 0.8, eventResistance: 0.3, price: 0, group: "legend",
    unlock: { type: "achievement", value: "legendary_farmer" }, flavor: "台湾でジャポニカを成功させた歴史的品種。" },
  { id: "shinwanoine", name: "神話の稲", icon: "🌟", rarity: "UR", baseYield: 300, growthSpeed: 0.7, eventResistance: 0.5, price: 0, group: "legend",
    unlock: { type: "achievement", value: "all_master" }, flavor: "伝説の稲。手にした農夫は永遠に語り継がれる。" }
];
