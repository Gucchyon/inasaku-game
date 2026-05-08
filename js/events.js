// イベント抽選・適用
window.Events = (function () {
  // 「無事」枠の比重
  const SAFE_WEIGHT = 65;

  function rollEvent(fieldId) {
    const s = State.get();
    const field = s.fields.find(f => f.id === fieldId);
    if (!field || !field.varietyId) return null;

    // 抽選後にカウンタリセット
    State.set(state => {
      const f = state.fields.find(x => x.id === fieldId);
      if (f) f.questionsSinceEvent = 0;
      return state;
    });

    // 候補をstageでフィルタ
    const candidates = window.EVENTS.filter(e => e.stages.includes(field.stage));
    if (candidates.length === 0) return null;

    // 品種の耐性
    const variety = window.VARIETIES.find(v => v.id === field.varietyId);
    const resist = variety ? (variety.eventResistance || 0) : 0;

    // 加重計算（品種耐性 + アップグレードレート効果）
    const entries = candidates.map(e => {
      let w = e.weight;
      if (e.kind === "negative") w *= Math.max(0.1, 1 - resist);
      // 田アップグレード(pest_net) + プレステージのイベント発生率減
      if (window.Upgrades && window.Upgrades.getEventRateMultiplier) {
        w *= window.Upgrades.getEventRateMultiplier(field, e.id);
      }
      return { e, w };
    });
    const totalNeg = entries.reduce((a, x) => a + x.w, 0);
    // 「無事」も含める
    entries.push({ e: null, w: SAFE_WEIGHT });

    let r = Math.random() * (totalNeg + SAFE_WEIGHT);
    let chosen = null;
    for (const x of entries) {
      r -= x.w;
      if (r <= 0) { chosen = x.e; break; }
    }
    if (!chosen) return null;

    // 予防アイテムチェック
    const prevented = checkPrevent(field, chosen);
    if (prevented) return { type: "prevented", event: chosen, by: prevented };

    // 適用
    State.set(state => {
      const f = state.fields.find(x => x.id === fieldId);
      // 田アップグレードによる効果軽減（負イベントのみ）
      let mitigation = 0;
      if (chosen.kind === "negative" && window.Upgrades && window.Upgrades.getEventValueReduction) {
        mitigation = window.Upgrades.getEventValueReduction(f, chosen.id);
      }
      // value, penaltyGP に軽減を適用
      let valueAdj = chosen.effect.value != null ? chosen.effect.value : null;
      let penaltyAdj = chosen.effect.penaltyGP != null ? chosen.effect.penaltyGP : null;
      if (mitigation > 0 && chosen.kind === "negative") {
        if (valueAdj != null && chosen.effect.type === "yield_penalty") valueAdj *= (1 - mitigation);
        if (valueAdj != null && chosen.effect.type === "quality_penalty") valueAdj *= (1 - mitigation);
        // gp_mult/combo_mult は1に近づける
        if (valueAdj != null && (chosen.effect.type === "gp_mult" || chosen.effect.type === "combo_mult")) {
          valueAdj = valueAdj + (1 - valueAdj) * mitigation;
        }
        if (valueAdj != null && chosen.effect.type === "gp_offset") valueAdj *= (1 - mitigation);
        if (penaltyAdj != null) penaltyAdj *= (1 - mitigation);
      }
      const ae = {
        id: chosen.id,
        name: chosen.name,
        icon: chosen.icon,
        effectType: chosen.effect.type,
        value: valueAdj,
        penaltyGP: penaltyAdj,
        questionsLeft: chosen.effect.questions != null ? chosen.effect.questions : null,
        persistent: !!chosen.effect.persistent,
        qualityLabel: chosen.effect.qualityLabel || null,
        mitigation,
        kind: chosen.kind,
        overlay: chosen.overlay,
        startedAt: new Date().toISOString()
      };
      // ポジティブイベントは buff として扱い、activeBuffs に追加
      if (chosen.kind === "positive") {
        f.activeBuffs.push({ type: "buff_gp", multiplier: chosen.effect.value, questions: chosen.effect.questions, fromEvent: chosen.id });
      }
      // 表示用に activeEvent も入れる（持続イベント or 永続）
      if (chosen.kind === "negative" || chosen.kind === "positive") {
        f.activeEvent = ae;
      }
      return state;
    });

    return { type: "occurred", event: chosen };
  }

  // バフから予防チェック
  function checkPrevent(field, ev) {
    if (!field.activeBuffs) return null;
    for (let i = 0; i < field.activeBuffs.length; i++) {
      const b = field.activeBuffs[i];
      if (b.type === "prevent_event" && b.targets) {
        if (b.targets.includes(ev.id) || (ev.kind === "negative" && b.targets.includes("any_negative"))) {
          State.set(state => {
            const f = state.fields.find(x => x.id === field.id);
            f.activeBuffs.splice(i, 1);
            return state;
          });
          return b;
        }
      }
    }
    return null;
  }

  return { rollEvent };
})();
