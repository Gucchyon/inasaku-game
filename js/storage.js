// localStorage 入出力
window.Storage = (function () {
  const KEY = "cswb.save.v1";
  let saveTimer = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return migrate(data);
    } catch (e) {
      console.warn("save load failed", e);
      return null;
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("save failed", e);
    }
  }

  function scheduleSave(state) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(state), 250);
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function migrate(data) {
    if (!data || typeof data !== "object") return null;
    if (!data.schemaVersion) data.schemaVersion = 1;
    // 将来のバージョンアップに備えた分岐
    // if (data.schemaVersion < 2) { ... }
    return data;
  }

  return { load, save, scheduleSave, clear, KEY };
})();
