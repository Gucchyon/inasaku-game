// デイリーボーナス：連続ログイン
window.Daily = (function () {
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function checkAndClaim() {
    const today = todayStr();
    const s = State.get();
    if (s.daily.lastClaimDate === today) return null; // 今日は受領済み

    let bonus = 0;
    let streak = 0;
    State.set(state => {
      const last = state.daily.lastClaimDate;
      if (!last) {
        state.daily.streak = 1;
      } else {
        // 連続判定: 昨日の日付かどうか
        const lastDate = new Date(last);
        const todayDate = new Date(today);
        const diffDays = Math.round((todayDate - lastDate) / 86400000);
        if (diffDays === 1) {
          state.daily.streak = (state.daily.streak || 0) + 1;
        } else {
          state.daily.streak = 1;
        }
      }
      state.daily.lastClaimDate = today;
      streak = state.daily.streak;
      bonus = 50 * Math.min(streak, 7);
      state.player.grain += bonus;
      state.player.lifetimeGrain = (state.player.lifetimeGrain || 0) + bonus;
      return state;
    });
    return { bonus, streak };
  }

  return { checkAndClaim };
})();
