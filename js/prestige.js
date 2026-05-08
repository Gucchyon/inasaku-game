// プレステージ閾値到達のチェックとモーダル表示
window.Prestige = (function () {

  // フラグ未保存のものを検出して通知。flags.prestige_celebrated[id] = true で既出。
  function checkAndCelebrate() {
    const s = State.get();
    if (!window.PRESTIGE_REWARDS) return [];
    if (!s.flags) {
      State.set(state => { state.flags = {}; return state; });
    }
    const celebrated = (s.flags.prestige_celebrated) || {};
    const newly = [];
    const totalQ = s.player.totalQuestions;
    const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);

    for (const r of window.PRESTIGE_REWARDS) {
      if (celebrated[r.id]) continue;
      const v = r.trigger.type === "totalQuestions" ? totalQ : totalH;
      if (v >= r.trigger.threshold) {
        newly.push(r);
      }
    }

    if (newly.length > 0) {
      State.set(state => {
        if (!state.flags.prestige_celebrated) state.flags.prestige_celebrated = {};
        for (const r of newly) state.flags.prestige_celebrated[r.id] = true;
        return state;
      });
      // 表示は順次（最初のものを表示し、続きはチェーン）
      showCelebrationChain(newly);
    }
    return newly;
  }

  function showCelebrationChain(rewards) {
    if (!window.Modal) return;
    let i = 0;
    function next() {
      if (i >= rewards.length) return;
      const r = rewards[i++];
      window.Modal.open({
        title: `🎉 ${r.icon} 累計実績解放！`,
        html: `
          <div style="text-align:center; padding:8px 0;">
            <div style="font-size:48px; margin-bottom:8px; animation: prestige-celebrate 1.2s ease-in-out infinite;">${r.icon}</div>
            <div style="font-size:16px; font-weight:700; color:#2f5d2f; margin-bottom:6px;">${r.name}</div>
            <div style="font-size:13px; color:#6b5a1e;">この効果は永続的に有効です。</div>
          </div>
        `,
        buttons: [
          { label: rewards.length > 1 && i < rewards.length ? `次へ (${i}/${rewards.length})` : "やった！", primary: true,
            onClick: () => setTimeout(next, 200) }
        ]
      });
    }
    next();
  }

  return { checkAndCelebrate };
})();
