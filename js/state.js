// 単一ストア。サブスクライブ可能。
// 使い方: State.get(), State.set(updaterFn), State.subscribe(fn)
window.State = (function () {
  const subscribers = new Set();
  let current = defaultState();

  function defaultState() {
    return {
      schemaVersion: 1,
      player: {
        name: "Farmer",
        createdAt: new Date().toISOString(),
        lastPlayedAt: new Date().toISOString(),
        grain: 100, // スタート資金
        lifetimeGrain: 100,
        totalGP: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        bestCombo: 0,
        currentCombo: 0
      },
      fields: [
        { id: 1, unlocked: true, varietyId: null, growthPoints: 0, stage: 0, plantedAt: null, activeBuffs: [], activeEvent: null, harvestCount: 0, questionsSinceEvent: 0, upgrades: {}, midSeasonDried: false, panicleDressed: false },
        { id: 2, unlocked: false, varietyId: null, growthPoints: 0, stage: 0, plantedAt: null, activeBuffs: [], activeEvent: null, harvestCount: 0, questionsSinceEvent: 0, upgrades: {}, midSeasonDried: false, panicleDressed: false },
        { id: 3, unlocked: false, varietyId: null, growthPoints: 0, stage: 0, plantedAt: null, activeBuffs: [], activeEvent: null, harvestCount: 0, questionsSinceEvent: 0, upgrades: {}, midSeasonDried: false, panicleDressed: false },
        { id: 4, unlocked: false, varietyId: null, growthPoints: 0, stage: 0, plantedAt: null, activeBuffs: [], activeEvent: null, harvestCount: 0, questionsSinceEvent: 0, upgrades: {}, midSeasonDried: false, panicleDressed: false }
      ],
      activeFieldId: 1,
      upgrades: {},        // プレイヤー全体のアップグレード { id: level }
      pdfImports: [],      // PDFインポート履歴
      activePdfFocus: null,// 集中モードで対象とするPDF id
      inventory: { fertilizer_basic: 1, omusubi: 1 },
      collection: {
        varieties: { asagiri: { unlocked: true, harvests: 0 } },
        achievements: {}
      },
      srs: {},
      daily: { lastClaimDate: null, streak: 0 },
      flags: {}, // ad-hoc flags (e.g. typhoon_survived)
      settings: {
        answerMode: "choice", // "choice" | "input"
        soundEnabled: false,
        reducedMotion: false,
        difficulty: "normal" // "normal" | "hard"
      }
    };
  }

  function get() { return current; }

  function set(updater) {
    if (typeof updater === "function") {
      current = updater(current) || current;
    } else {
      current = updater;
    }
    notify();
  }

  function notify() {
    subscribers.forEach(fn => {
      try { fn(current); } catch (e) { console.error("subscriber error", e); }
    });
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  function reset() {
    current = defaultState();
    notify();
  }

  function load(state) {
    current = mergeWithDefault(state);
    notify();
  }

  // 不足キーをデフォルト値で補完（マイグレーション）
  function mergeWithDefault(saved) {
    const def = defaultState();
    const out = JSON.parse(JSON.stringify(def));
    if (!saved || typeof saved !== "object") return out;
    deepMerge(out, saved);
    // fields は配列で、長さが異なる可能性があるので注意
    if (Array.isArray(saved.fields)) {
      for (let i = 0; i < out.fields.length; i++) {
        if (saved.fields[i]) {
          // デフォルトを保持してから上書き、最後に欠落キーを補完
          const defaultField = JSON.parse(JSON.stringify(def.fields[i]));
          Object.assign(defaultField, saved.fields[i]);
          // 不足しているキーを補完
          for (const k in def.fields[i]) {
            if (defaultField[k] === undefined) {
              defaultField[k] = def.fields[i][k];
            }
          }
          // upgrades は必ずオブジェクトに
          if (!defaultField.upgrades || typeof defaultField.upgrades !== "object") {
            defaultField.upgrades = {};
          }
          out.fields[i] = defaultField;
        }
      }
    }
    // ルートレベルの追加キーも保証
    if (!out.upgrades || typeof out.upgrades !== "object") out.upgrades = {};
    return out;
  }

  function deepMerge(target, src) {
    for (const k in src) {
      if (Array.isArray(src[k])) {
        target[k] = src[k];
      } else if (src[k] && typeof src[k] === "object") {
        if (!target[k] || typeof target[k] !== "object") target[k] = {};
        deepMerge(target[k], src[k]);
      } else {
        target[k] = src[k];
      }
    }
  }

  return { get, set, subscribe, reset, load, defaultState };
})();
