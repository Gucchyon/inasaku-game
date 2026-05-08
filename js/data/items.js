// 消費アイテム / 道具マスタ
// effect.type: "buff_gp"(GP倍率) | "cure_event"(イベント解除) | "prevent_event"(イベント予防) | "combo_save"
window.ITEMS = [
  // 肥料
  { id: "fertilizer_basic", name: "基本肥料", icon: "🌱", price: 50, desc: "次の10問の獲得GPを×1.5に。",
    effect: { type: "buff_gp", multiplier: 1.5, questions: 10 } },
  { id: "fertilizer_quick", name: "速効肥料", icon: "⚡", price: 120, desc: "次の5問の獲得GPを×2.0に。",
    effect: { type: "buff_gp", multiplier: 2.0, questions: 5 } },
  { id: "fertilizer_premium", name: "高級肥料", icon: "✨", price: 300, desc: "次の20問の獲得GPを×1.7に。",
    effect: { type: "buff_gp", multiplier: 1.7, questions: 20 } },
  // 殺菌剤
  { id: "fungicide_basic", name: "殺菌剤", icon: "🧪", price: 80, desc: "発病中の病気イベントを解除する。",
    effect: { type: "cure_event", targets: ["leaf_blast", "panicle_blast", "blast_disease", "sheath_blight"] } },
  // 殺虫剤
  { id: "insecticide_basic", name: "殺虫剤", icon: "🪲", price: 80, desc: "害虫イベントを解除する。",
    effect: { type: "cure_event", targets: ["stink_bug", "planthopper"] } },
  // 除草剤
  { id: "herbicide_basic", name: "除草剤", icon: "🌿", price: 60, desc: "雑草イベントを解除する。",
    effect: { type: "cure_event", targets: ["weeds"] } },
  // 防災
  { id: "windnet", name: "防風ネット", icon: "🛡️", price: 200, desc: "次の台風イベント1回を無効化。",
    effect: { type: "prevent_event", targets: ["typhoon"] } },
  { id: "warmsheet", name: "保温シート", icon: "🧥", price: 150, desc: "次の冷夏イベント1回を無効化。",
    effect: { type: "prevent_event", targets: ["cool_summer"] } },
  { id: "irrigation_pro", name: "灌漑強化セット", icon: "💧", price: 180, desc: "次の干ばつ・高温障害1回を無効化。",
    effect: { type: "prevent_event", targets: ["drought", "heat_wave"] } },
  // ユーティリティ
  { id: "omusubi", name: "おむすび", icon: "🍙", price: 40, desc: "1度だけ不正解でもコンボが切れない。",
    effect: { type: "combo_save", uses: 1 } },
  { id: "scarecrow_ticket", name: "案山子チケット", icon: "🎫", price: 100, desc: "次のネガティブイベント1回を無効化。",
    effect: { type: "prevent_event", targets: ["any_negative"] } }
];
