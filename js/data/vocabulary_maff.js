// 農林水産省「水稲の基本的な栽培技術」(技術情報) 由来の語彙
// 出典:
// - 農林水産省 水稲技術情報 (https://www.maff.go.jp/j/seisan/gijutsuhasshin/techinfo/suitou.html)
// - MAFF PDF「水稲の生育ステージと主な農作業」(suitou-2.pdf, 10頁)
//   https://www.maff.go.jp/j/seisan/gijutsuhasshin/techinfo/attach/pdf/suitou-2.pdf
//   ＜参考資料＞: 新潟県「水稲栽培指針」、青森県「稲作改善指導要領」、宮城県「宮城の稲作指導指針」
//
// 国の標準的な指針に基づく語彙。県・市町村の手引きの基礎になる。
(function () {
  if (!window.VOCAB) window.VOCAB = [];
  const ADD = [
    // ===== 7つの栽培ポイント (栽培哲学) =====
    { id: "maff_001", en: "vigorous seedling", ja: ["健苗"], altJa: ["けんびょう"], pos: "n.", category: "morphology", difficulty: 2,
      example: "Vigorous seedlings ensure good rooting and a stable yield in the main field.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント２＞" } },
    { id: "maff_002", en: "vigorous seedling raising", ja: ["健苗育成"], altJa: ["けんびょういくせい"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Vigorous seedling raising determines half of the final yield (nae-hansaku).",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント２＞" } },
    { id: "maff_003", en: "nae-hansaku principle", ja: ["苗半作"], altJa: ["なえはんさく"], pos: "n.", category: "cultivation", difficulty: 3,
      example: "The nae-hansaku principle teaches that nursery quality determines half the harvest.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術" } },
    { id: "maff_004", en: "field leveling", ja: ["ほ場の均平化", "圃場均平"], altJa: ["ほじょうのきんぺいか", "ほじょうきんぺい"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Field leveling reduces weed emergence from raised areas.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント３＞" } },
    { id: "maff_005", en: "timely control", ja: ["適期防除"], altJa: ["てききぼうじょ"], pos: "n.", category: "pest_disease", difficulty: 2,
      example: "Timely control of weeds and pests minimizes pesticide use and yield loss.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント３＞" } },
    { id: "maff_006", en: "pest forecasting", ja: ["病害虫発生予察"], altJa: ["びょうがいちゅうはっせいよさつ"], pos: "n.", category: "pest_disease", difficulty: 2,
      example: "Pest forecasting systems guide farmers on when and what to spray.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント４＞" } },
    { id: "maff_007", en: "appropriate harvest timing", ja: ["適期収穫"], altJa: ["てっきしゅうかく", "てききしゅうかく"], pos: "n.", category: "harvest_postharvest", difficulty: 2,
      example: "Appropriate harvest timing prevents both immature and over-ripe grain issues.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント６＞" } },
    { id: "maff_008", en: "cropping plan", ja: ["作付設計"], altJa: ["さくつけせっけい"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "A cropping plan combines varieties to spread the harvest peak.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント６＞" } },
    { id: "maff_009", en: "fertilization and cultivation management", ja: ["肥培管理"], altJa: ["ひばいかんり"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Sound fertilization and cultivation management is the foundation of high yield.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜栽培ポイント７＞" } },

    // ===== ほ場・土壌 =====
    { id: "maff_010", en: "groundwater level", ja: ["地下水位"], altJa: ["ちかすいい"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Ideal paddy soils have a groundwater level below 50-70 cm.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_011", en: "hardpan", ja: ["耕盤", "硬盤"], altJa: ["こうばん"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "A hardpan within 50 cm restricts root growth and water infiltration.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_012", en: "daily water depth reduction", ja: ["減水深"], altJa: ["げんすいしん"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "Daily water depth reduction of 10 mm/day indicates good paddy permeability.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_013", en: "plow layer depth", ja: ["作土の深さ", "作土深"], altJa: ["さくどのふかさ", "さくどしん"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Plow layer depth of 15-20 cm provides adequate root volume.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_014", en: "soil-derived nitrogen", ja: ["地力窒素"], altJa: ["ちりょくちっそ"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "Over half of rice nitrogen uptake comes from soil-derived nitrogen.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_015", en: "available phosphate", ja: ["有効態りん酸"], altJa: ["ゆうこうたいりんさん"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "High available phosphate supports early root development.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_016", en: "silicate", ja: ["けい酸", "ケイ酸"], altJa: ["けいさん"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Silicate strengthens stems and improves disease resistance in rice.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },
    { id: "maff_017", en: "water leakage", ja: ["漏水"], altJa: ["ろうすい"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Water leakage in sandy soils requires meticulous puddling.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜代かき＞" } },
    { id: "maff_018", en: "volunteer rice", ja: ["漏生イネ"], altJa: ["ろうせいいね"], pos: "n.", category: "pest_disease", difficulty: 3,
      example: "Volunteer rice from feed-rice fields contaminates table-rice harvests.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜ほ場選定＞" } },

    // ===== 育苗 =====
    { id: "maff_019", en: "milky seedling", ja: ["乳苗"], altJa: ["にゅうびょう"], pos: "n.", category: "morphology", difficulty: 3,
      example: "Milky seedlings (1.0-1.5 leaves) reduce nursery period to 10 days.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜育苗準備＞" } },
    { id: "maff_020", en: "smothered seedling", ja: ["ムレ苗"], altJa: ["むれなえ"], pos: "n.", category: "pest_disease", difficulty: 3,
      example: "Smothered seedlings result from high pH or poor ventilation in nursery.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜育苗準備＞" } },
    { id: "maff_021", en: "covering soil", ja: ["覆土"], altJa: ["ふくど"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Covering soil should be sieved to ensure uniform emergence.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜育苗準備＞" } },

    // ===== 移植・栽植 =====
    { id: "maff_022", en: "hill spacing", ja: ["株間"], altJa: ["かぶま"], pos: "n.", category: "cultivation", difficulty: 1,
      example: "Standard hill spacing is 60-70 hills per tsubo (3.3 m²).",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜移植＞" } },
    { id: "maff_023", en: "seedlings per hill", ja: ["1株苗数"], altJa: ["いっかぶなえすう"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Use 2-4 seedlings per hill; too many causes thin tillers and lodging.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜移植＞" } },
    { id: "maff_024", en: "planting depth", ja: ["植え付け深さ"], altJa: ["うえつけふかさ"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Planting depth of 3 cm balances tillering and missing-hill rate.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜移植＞" } },
    { id: "maff_025", en: "missing hill", ja: ["欠株"], altJa: ["けっかぶ"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Excessive shallow planting leads to missing hills due to floating seedlings.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜移植＞" } },

    // ===== 雑草・除草 =====
    { id: "maff_026", en: "one-shot herbicide treatment", ja: ["一発処理除草"], altJa: ["いっぱつしょりじょそう"], pos: "n.", category: "pest_disease", difficulty: 3,
      example: "One-shot herbicide treatment within 10-20 days after transplanting controls both annual and perennial weeds.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜活着期＞" } },
    { id: "maff_027", en: "bund plastering", ja: ["畦塗り"], altJa: ["あぜぬり"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Bund plastering before transplanting prevents water leakage and herbicide loss.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜活着期＞" } },
    { id: "maff_028", en: "water retention capacity", ja: ["保水力"], altJa: ["ほすいりょく"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Sandy soils have low water retention capacity and need careful irrigation.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜活着期＞" } },

    // ===== 害虫 =====
    { id: "maff_029", en: "rice leaf beetle", ja: ["イネドロオイムシ"], altJa: ["いねどろおいむし"], pos: "n.", category: "pest_disease", difficulty: 3,
      example: "Rice leaf beetle larvae scrape leaf surfaces during early tillering.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜分げつ期(後期)＞" } },

    // ===== 登熟・収穫 =====
    { id: "maff_030", en: "yellow-grain ratio", ja: ["黄化籾割合"], altJa: ["おうかもみわりあい"], pos: "n.", category: "harvest_postharvest", difficulty: 3,
      example: "Yellow-grain ratio of 85-90% indicates optimal harvest timing.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },
    { id: "maff_031", en: "early drainage", ja: ["早期落水"], altJa: ["そうきらくすい"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Early drainage reduces ripening and increases protein content, lowering palatability.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜登熟期＞" } },
    { id: "maff_032", en: "early harvesting", ja: ["早刈り"], altJa: ["はやかり"], pos: "n.", category: "harvest_postharvest", difficulty: 1,
      example: "Early harvesting causes immature green grains and yield loss.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },
    { id: "maff_033", en: "immature green grain", ja: ["青米", "青未熟粒"], altJa: ["あおまい", "あおみじゅくりゅう"], pos: "n.", category: "harvest_postharvest", difficulty: 2,
      example: "Immature green grains downgrade brown rice inspection results.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },
    { id: "maff_034", en: "standing-crop cracking", ja: ["立毛胴割れ"], altJa: ["たちげどうわれ"], pos: "n.", category: "harvest_postharvest", difficulty: 3,
      example: "Standing-crop cracking occurs in fields where ripening proceeds under high temperature.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },
    { id: "maff_035", en: "panicle axis", ja: ["穂軸"], altJa: ["ほじく"], pos: "n.", category: "morphology", difficulty: 2,
      example: "The panicle axis remains green even after grains have matured in some conditions.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },

    // ===== 高温対策・カドミウム対策 =====
    { id: "maff_036", en: "heat-tolerant variety", ja: ["高温耐性品種"], altJa: ["こうおんたいせいひんしゅ"], pos: "n.", category: "breeding", difficulty: 2,
      example: "Heat-tolerant varieties like Nikomaru reduce chalky grain in hot summers.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜コラム③＞" } },
    { id: "maff_037", en: "cadmium translocation", ja: ["カドミウム移行"], altJa: ["かどみうむいこう"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "Cadmium translocation to grain depends on soil pH and redox state.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜幼穂形成期＞" } },
    { id: "maff_038", en: "cadmium uptake suppression", ja: ["カドミウム吸収抑制"], altJa: ["かどみうむきゅうしゅうよくせい"], pos: "n.", category: "soil_fertilizer", difficulty: 3,
      example: "Cadmium uptake suppression by flooding around heading reduces grain Cd.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜幼穂形成期＞" } },

    // ===== 補助 =====
    { id: "maff_039", en: "deep water management", ja: ["深水管理"], altJa: ["ふかみずかんり"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Deep water management of 20 cm at booting protects panicles from cold injury.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜幼穂形成期＞" } },
    { id: "maff_040", en: "shallow water management", ja: ["浅水管理"], altJa: ["あさみずかんり"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Shallow water management of 2-3 cm after rooting promotes early tillering.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜活着期＞" } },
    { id: "maff_041", en: "thinning culm", ja: ["細茎化"], altJa: ["さいけいか"], pos: "n.", category: "morphology", difficulty: 3,
      example: "Excess seedlings per hill cause thinning culms and lodging risk.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜移植＞" } },
    { id: "maff_042", en: "high-fertilizer cultivation", ja: ["多肥栽培"], altJa: ["たひさいばい"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "High-fertilizer cultivation can mask true grain ripening behind green stems.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫＞" } },
    { id: "maff_043", en: "rice straw incorporation", ja: ["稲わらすき込み", "稲わら鋤込み"], altJa: ["いなわらすきこみ"], pos: "n.", category: "soil_fertilizer", difficulty: 2,
      example: "Autumn rice straw incorporation suppresses methane emissions next season.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫後の土づくり＞" } },
    { id: "maff_044", en: "shallow tillage", ja: ["浅耕"], altJa: ["せんこう"], pos: "n.", category: "cultivation", difficulty: 2,
      example: "Shallow tillage of 5-10 cm accelerates rice straw decomposition.",
      source: { type: "maff", citation: "MAFF 水稲の基本的な栽培技術 ＜収穫後の土づくり＞" } }
  ];
  Array.prototype.push.apply(window.VOCAB, ADD);
})();
