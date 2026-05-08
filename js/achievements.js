// アチーブメント判定・付与
window.AchievementsMod = (function () {
  function checkAll() {
    const newly = [];
    State.set(s => {
      for (const ach of window.ACHIEVEMENTS) {
        if (s.collection.achievements[ach.id]) continue;
        let met = false;
        try { met = ach.condition(s); } catch (e) { met = false; }
        if (met) {
          s.collection.achievements[ach.id] = { unlockedAt: new Date().toISOString() };
          if (ach.reward) {
            if (ach.reward.grain) {
              s.player.grain += ach.reward.grain;
              s.player.lifetimeGrain = (s.player.lifetimeGrain || 0) + ach.reward.grain;
            }
            if (ach.reward.varietyId) {
              if (!s.collection.varieties[ach.reward.varietyId]) {
                s.collection.varieties[ach.reward.varietyId] = { unlocked: true, harvests: 0 };
              } else {
                s.collection.varieties[ach.reward.varietyId].unlocked = true;
              }
            }
            if (ach.reward.itemId) {
              s.inventory[ach.reward.itemId] = (s.inventory[ach.reward.itemId] || 0) + 1;
            }
          }
          newly.push(ach);
        }
      }
      return s;
    });
    return newly;
  }

  return { checkAll };
})();
