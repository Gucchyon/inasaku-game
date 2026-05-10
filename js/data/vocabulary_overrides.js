// 既存語彙の精度向上オーバーライド
// 関川村「岩船まいすたあ塾」テキスト・大阪府「水稲栽培の手引き」など、
// 産地の現場手引きで使われる、より自然で精確な日本語訳・読みに補正する。
// 全データ読み込み後・dedup の前に評価する。
(function () {
  if (!window.VOCAB || window.VOCAB.length === 0) return;

  // en (lowercase normalized) → 改善されたエントリ部分
  const OVERRIDES = {
    // === 形態 ===
    "panicle": { ja: ["穂"], altJa: ["ほ"] },
    "spikelet": { ja: ["穎花", "小穂"], altJa: ["えいか", "しょうすい"] },
    "tiller": { ja: ["分げつ", "分げつ茎"], altJa: ["ぶんげつ", "ぶんげつけい"] },
    "leaf blade": { ja: ["葉身"], altJa: ["ようしん"] },
    "leaf sheath": { ja: ["葉鞘"], altJa: ["ようしょう"] },
    "panicle weight": { ja: ["穂重"], altJa: ["ほじゅう", "すいじゅう"] },
    "panicle number": { ja: ["穂数"], altJa: ["ほすう"] },
    "spikelets per panicle": { ja: ["1穂籾数", "1穂穎花数"], altJa: ["いっすいもみすう", "いっすいえいかすう"] },
    "total spikelet number": { ja: ["総籾数", "総穎花数"], altJa: ["そうもみすう", "そうえいかすう"] },

    // === 生育段階 ===
    "germination": { ja: ["発芽"], altJa: ["はつが"] },
    "seedling": { ja: ["苗"], altJa: ["なえ"] },
    "tillering": { ja: ["分げつ", "分げつ期"], altJa: ["ぶんげつ", "ぶんげつき"] },
    "heading": { ja: ["出穂"], altJa: ["しゅっすい"] },
    "flowering": { ja: ["開花"], altJa: ["かいか"] },
    "ripening": { ja: ["登熟", "成熟"], altJa: ["とうじゅく", "せいじゅく"] },
    "panicle initiation": { ja: ["幼穂形成期"], altJa: ["ようすいけいせいき"] },
    "booting": { ja: ["穂ばらみ期"], altJa: ["ほばらみき"] },
    "anthesis": { ja: ["開花期"], altJa: ["かいかき"] },
    "vegetative stage": { ja: ["栄養成長期"], altJa: ["えいようせいちょうき"] },
    "reproductive stage": { ja: ["生殖成長期"], altJa: ["せいしょくせいちょうき"] },

    // === 栽培管理 ===
    "transplanting": { ja: ["移植", "田植え"], altJa: ["いしょく", "たうえ"] },
    "direct seeding": { ja: ["直播"], altJa: ["じかまき", "ちょくはん"] },
    "irrigation": { ja: ["灌漑", "灌水"], altJa: ["かんがい", "かんすい"] },
    "drainage": { ja: ["排水", "落水"], altJa: ["はいすい", "らくすい"] },
    "fertilization": { ja: ["施肥"], altJa: ["せひ"] },
    "puddling": { ja: ["代掻き", "代かき"], altJa: ["しろかき"] },
    "weeding": { ja: ["除草"], altJa: ["じょそう"] },
    "topdressing": { ja: ["追肥"], altJa: ["ついひ", "おいごえ"] },
    "basal fertilizer": { ja: ["基肥", "元肥"], altJa: ["きひ", "もとごえ"] },
    "panicle dressing": { ja: ["穂肥"], altJa: ["ほごえ", "ほひ"] },
    "grain dressing": { ja: ["実肥"], altJa: ["みごえ", "みひ"] },

    // === 土壌・肥料 ===
    "paddy field": { ja: ["水田"], altJa: ["すいでん"] },
    "nitrogen": { ja: ["窒素"], altJa: ["ちっそ"] },
    "phosphorus": { ja: ["リン酸", "燐酸"], altJa: ["りんさん"] },
    "potassium": { ja: ["カリ", "加里", "カリウム"], altJa: ["かり", "かりうむ"] },
    "compost": { ja: ["堆肥"], altJa: ["たいひ"] },
    "soil ph": { ja: ["土壌pH", "土壌酸度"], altJa: ["どじょうさんど"] },
    "controlled-release fertilizer": { ja: ["緩効性肥料", "肥効調節型肥料"], altJa: ["かんこうせいひりょう", "ひこうちょうせつがたひりょう"] },

    // === 病害虫 ===
    "blast": { ja: ["いもち病", "稲熱病"], altJa: ["いもちびょう", "いねねつびょう"] },
    "leaf blast": { ja: ["葉いもち", "葉いもち病"], altJa: ["はいもち"] },
    "panicle blast": { ja: ["穂いもち", "首いもち"], altJa: ["ほいもち", "くびいもち"] },
    "sheath blight": { ja: ["紋枯病"], altJa: ["もんがれびょう"] },
    "bacterial blight": { ja: ["白葉枯病"], altJa: ["しらはがれびょう"] },
    "stink bug": { ja: ["カメムシ", "斑点米カメムシ類"], altJa: ["かめむし", "はんてんまいかめむしるい"] },
    "planthopper": { ja: ["ウンカ"], altJa: ["うんか"] },
    "fungicide": { ja: ["殺菌剤"], altJa: ["さっきんざい"] },
    "insecticide": { ja: ["殺虫剤"], altJa: ["さっちゅうざい"] },
    "herbicide": { ja: ["除草剤"], altJa: ["じょそうざい"] },
    "weed": { ja: ["雑草"], altJa: ["ざっそう"] },

    // === 収量・品質 ===
    "yield": { ja: ["収量"], altJa: ["しゅうりょう"] },
    "harvest": { ja: ["収穫"], altJa: ["しゅうかく"] },
    "threshing": { ja: ["脱穀"], altJa: ["だっこく"] },
    "milling": { ja: ["精米", "搗精"], altJa: ["せいまい", "とうせい"] },
    "brown rice": { ja: ["玄米"], altJa: ["げんまい"] },
    "white rice": { ja: ["白米", "精米"], altJa: ["はくまい", "せいまい"] },
    "grain": { ja: ["粒", "穀粒", "籾"], altJa: ["つぶ", "こくりゅう", "もみ"] },
    "hull": { ja: ["籾殻"], altJa: ["もみがら"] },
    "thousand grain weight": { ja: ["千粒重"], altJa: ["せんりゅうじゅう"] },
    "ripened grain ratio": { ja: ["登熟歩合"], altJa: ["とうじゅくぶあい"] },
    "yield component": { ja: ["収量構成要素"], altJa: ["しゅうりょうこうせいようそ"] },
    "whole grain percentage": { ja: ["整粒歩合"], altJa: ["せいりゅうぶあい"] },
    "head rice yield": { ja: ["整粒歩合", "整粒歩留り"], altJa: ["せいりゅうぶあい", "せいりゅうぶどまり"] },
    "cracked grain": { ja: ["胴割粒", "胴割れ粒"], altJa: ["どうわれりゅう", "どうわれつぶ"] },
    "chalky grain": { ja: ["白未熟粒"], altJa: ["しろみじゅくりゅう"] },
    "milky white kernel": { ja: ["乳白粒"], altJa: ["にゅうはくりゅう"] },
    "white-core kernel": { ja: ["心白粒"], altJa: ["しんぱくりゅう"] },
    "white-base kernel": { ja: ["基白粒"], altJa: ["きはくりゅう"] },
    "white-belly kernel": { ja: ["腹白粒"], altJa: ["ふくはくりゅう"] },
    "pecky rice": { ja: ["斑点米"], altJa: ["はんてんまい"] },
    "moisture content": { ja: ["水分含有率", "水分含量"], altJa: ["すいぶんがんゆうりつ", "すいぶんがんりょう"] },
    "amylose content": { ja: ["アミロース含有率"], altJa: ["あみろーすがんゆうりつ"] },
    "protein content": { ja: ["タンパク質含有率"], altJa: ["たんぱくしつがんゆうりつ"] },
    "inspection grade": { ja: ["検査等級"], altJa: ["けんさとうきゅう"] },

    // === 気候 ===
    "drought": { ja: ["干ばつ", "乾燥害"], altJa: ["かんばつ"] },
    "flood": { ja: ["洪水", "湛水"], altJa: ["こうずい", "たんすい"] },
    "typhoon": { ja: ["台風"], altJa: ["たいふう"] },
    "cool summer": { ja: ["冷夏"], altJa: ["れいか"] },
    "heat injury": { ja: ["高温障害"], altJa: ["こうおんしょうがい"] },
    "lodging": { ja: ["倒伏"], altJa: ["とうふく"] },
    "frost": { ja: ["霜害"], altJa: ["そうがい"] },

    // === 育種 ===
    "cultivar": { ja: ["品種"], altJa: ["ひんしゅ"] },
    "variety": { ja: ["品種", "栽培品種"], altJa: ["ひんしゅ", "さいばいひんしゅ"] },
    "hybrid": { ja: ["雑種", "F1"], altJa: ["ざっしゅ"] },
    "japonica": { ja: ["ジャポニカ"], altJa: ["じゃぽにか"] },
    "indica": { ja: ["インディカ"], altJa: ["いんでぃか"] },
    "heterosis": { ja: ["雑種強勢"], altJa: ["ざっしゅきょうせい"] },

    // === 一般 ===
    "rice": { ja: ["イネ", "米", "稲"], altJa: ["いね", "こめ"] },
    "paddy": { ja: ["水田"], altJa: ["すいでん"] },
    "agronomy": { ja: ["作物学", "農学"], altJa: ["さくもつがく", "のうがく"] },
    "crop rotation": { ja: ["輪作"], altJa: ["りんさく"] },

    // === MAFF 教科書 (suitou-2.pdf) 準拠の精緻化 ===
    "maximum tillering stage": { ja: ["最高分げつ期"], altJa: ["さいこうぶんげつき"] },
    "soil reduction": { ja: ["土壌還元"], altJa: ["どじょうかんげん"] },
    "rooting": { ja: ["活着"], altJa: ["かっちゃく"] },
    "establishment": { ja: ["活着"], altJa: ["かっちゃく"] },
    "yellow ripe stage": { ja: ["黄熟期"], altJa: ["おうじゅくき"] },
    "deep water management": { ja: ["深水管理"], altJa: ["ふかみずかんり"] },
    "shallow water management": { ja: ["浅水管理"], altJa: ["あさみずかんり"] }
  };

  // 適用
  let applied = 0;
  for (const v of window.VOCAB) {
    const key = (v.en || "").trim().toLowerCase();
    const ov = OVERRIDES[key];
    if (!ov) continue;
    if (ov.ja) v.ja = ov.ja;
    if (ov.altJa) v.altJa = ov.altJa;
    if (ov.example) v.example = ov.example;
    applied++;
  }
  if (applied > 0) {
    console.log(`[vocabulary_overrides] applied ${applied} translation refinements`);
  }
})();
