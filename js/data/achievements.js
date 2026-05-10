// アチーブメント定義
// condition(state) → bool で達成判定
// reward は achievements.js が処理
window.ACHIEVEMENTS = [
  // 学習系
  { id: "first_correct", name: "最初の一歩", icon: "🌱", desc: "1問正解する。",
    condition: s => s.player.totalCorrect >= 1, reward: { grain: 30 } },
  { id: "combo_10", name: "コンボ十番", icon: "🔥", desc: "10連続正解。",
    condition: s => s.player.bestCombo >= 10, reward: { grain: 100 } },
  { id: "combo_30", name: "怒涛の連撃", icon: "🔥🔥", desc: "30連続正解。",
    condition: s => s.player.bestCombo >= 30, reward: { grain: 400 } },
  { id: "combo_100", name: "百連覇", icon: "🔥🔥🔥", desc: "100連続正解。",
    condition: s => s.player.bestCombo >= 100, reward: { grain: 2000 } },
  { id: "questions_100", name: "百問先生", icon: "📖", desc: "累計100問挑戦。",
    condition: s => s.player.totalQuestions >= 100, reward: { grain: 200 } },
  { id: "questions_500", name: "勉学の徒", icon: "📚", desc: "累計500問挑戦。",
    condition: s => s.player.totalQuestions >= 500, reward: { grain: 800 } },
  { id: "questions_1000", name: "千問の達人", icon: "🎓", desc: "累計1000問挑戦。",
    condition: s => s.player.totalQuestions >= 1000, reward: { grain: 2000 } },
  { id: "all_categories", name: "全方位農学者", icon: "🌐", desc: "全カテゴリで1問以上正解。",
    condition: s => {
      const cats = new Set();
      for (const id in s.srs) {
        const w = s.srs[id];
        if (w.correctCount > 0) {
          const v = window.VOCAB.find(x => x.id === id);
          if (v) cats.add(v.category);
        }
      }
      return cats.size >= 10;
    }, reward: { grain: 500 } },

  // 栽培系
  { id: "first_plant", name: "初田植え", icon: "🌱", desc: "初めて田植えする。",
    condition: s => s.fields.some(f => f.varietyId), reward: { grain: 30 } },
  { id: "first_harvest", name: "初収穫", icon: "🌾", desc: "初めて収穫する。",
    condition: s => s.fields.some(f => f.harvestCount > 0), reward: { grain: 100 } },
  { id: "harvest_5", name: "5回の実り", icon: "🌾", desc: "通算5回収穫。",
    condition: s => totalHarvests(s) >= 5, reward: { grain: 250, varietyId: "gekka" } },
  { id: "harvest_10", name: "10回の実り", icon: "🌾", desc: "通算10回収穫。",
    condition: s => totalHarvests(s) >= 10, reward: { grain: 500, varietyId: "setsurei" } },
  { id: "harvest_25", name: "25回の実り", icon: "🌾", desc: "通算25回収穫。",
    condition: s => totalHarvests(s) >= 25, reward: { grain: 1500 } },
  { id: "harvest_50", name: "豊穣の達人", icon: "🌾✨", desc: "通算50回収穫。",
    condition: s => totalHarvests(s) >= 50, reward: { grain: 3000 } },
  { id: "all_fields", name: "大規模農家", icon: "🏞️", desc: "4区画すべて解放。",
    condition: s => s.fields.filter(f => f.unlocked).length >= 4, reward: { grain: 1000 } },

  // コレクション系
  { id: "varieties_5", name: "5品種コレクター", icon: "🎴", desc: "5品種を解放。",
    condition: s => Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length >= 5, reward: { grain: 300 } },
  { id: "varieties_10", name: "10品種コレクター", icon: "🎴", desc: "10品種を解放。",
    condition: s => Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length >= 10, reward: { grain: 700 } },
  { id: "varieties_20", name: "20品種コレクター", icon: "🎴✨", desc: "20品種を解放。",
    condition: s => Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length >= 20, reward: { grain: 2000 } },
  { id: "ancient_master", name: "古代米マスター", icon: "🏺", desc: "古代米を5種解放。",
    condition: s => countGroup(s, "ancient") >= 5, reward: { grain: 1000, varietyId: "shinkaho" } },
  { id: "world_master", name: "世界の米", icon: "🌍", desc: "海外品種を5種解放。",
    condition: s => countGroup(s, "world") >= 5, reward: { grain: 1500 } },

  // イベント系
  { id: "typhoon_survivor", name: "台風サバイバー", icon: "🌀", desc: "台風が起きた田で収穫成功。",
    condition: s => !!s.flags.typhoon_survived, reward: { grain: 400 } },
  { id: "blast_defender", name: "病魔退散", icon: "💊", desc: "いもち病を3回治療。",
    condition: s => (s.flags.blast_cured || 0) >= 3, reward: { grain: 300 } },
  { id: "daily_7", name: "週間皆勤", icon: "📅", desc: "7日連続ログイン。",
    condition: s => (s.daily.streak || 0) >= 7, reward: { grain: 500 } },
  { id: "daily_30", name: "月間皆勤", icon: "🏅", desc: "30日連続ログイン。",
    condition: s => (s.daily.streak || 0) >= 30, reward: { grain: 3000 } },

  // 経済系
  { id: "rich_1k", name: "千粒長者", icon: "💰", desc: "累計1000粒獲得。",
    condition: s => (s.player.lifetimeGrain || 0) >= 1000, reward: { grain: 200 } },
  { id: "rich_5k", name: "五千粒長者", icon: "💰💰", desc: "累計5000粒獲得。",
    condition: s => (s.player.lifetimeGrain || 0) >= 5000, reward: { grain: 800 } },
  { id: "rich_30k", name: "豪農", icon: "💰💰💰", desc: "累計30000粒獲得。",
    condition: s => (s.player.lifetimeGrain || 0) >= 30000, reward: { grain: 5000 } },

  // チャレンジ
  { id: "all_correct_each_word", name: "全単語通過", icon: "🌟", desc: "全単語を1度は正解。",
    condition: s => {
      let total = 0, correct = 0;
      for (const v of window.VOCAB) {
        total++;
        if (s.srs[v.id] && s.srs[v.id].correctCount > 0) correct++;
      }
      return total > 0 && correct === total;
    }, reward: { grain: 5000 } },
  { id: "legendary_farmer", name: "伝説の農夫", icon: "👑", desc: "通算100回収穫。",
    condition: s => totalHarvests(s) >= 100, reward: { grain: 10000, varietyId: "senkyo" } },
  { id: "all_master", name: "全制覇", icon: "🏆", desc: "他のアチーブメントを20個以上解放。",
    condition: s => Object.keys(s.collection.achievements || {}).length >= 20, reward: { grain: 10000, varietyId: "shinwanoine" } },

  // === 検査等級系 (新規) ===
  { id: "grade1_first", name: "初の1等米", icon: "🥇", desc: "1等米の収穫を達成。",
    condition: s => (s.flags.grade_1 || 0) >= 1, reward: { grain: 200 } },
  { id: "grade1_5", name: "1等米5回", icon: "🥇🥇", desc: "1等米を通算5回収穫。",
    condition: s => (s.flags.grade_1 || 0) >= 5, reward: { grain: 800 } },
  { id: "grade1_20", name: "1等米マスター", icon: "🏅", desc: "1等米を通算20回収穫。",
    condition: s => (s.flags.grade_1 || 0) >= 20, reward: { grain: 3000 } },

  // === 栽培アクション系 (新規) ===
  { id: "midseason_first", name: "初の中干し", icon: "💧", desc: "中干しを実施して収穫まで到達。",
    condition: s => !!s.flags.midseason_done, reward: { grain: 150 } },
  { id: "panicle_first", name: "初の穂肥施用", icon: "🌾", desc: "穂肥を施して収穫まで到達。",
    condition: s => !!s.flags.panicle_done, reward: { grain: 150 } }
];

function totalHarvests(s) {
  return s.fields.reduce((acc, f) => acc + (f.harvestCount || 0), 0);
}
function countGroup(s, group) {
  const ids = window.VARIETIES.filter(v => v.group === group).map(v => v.id);
  let n = 0;
  for (const id of ids) {
    if (s.collection.varieties && s.collection.varieties[id] && s.collection.varieties[id].unlocked) n++;
  }
  return n;
}
