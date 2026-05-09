// クイズ出題ロジック（簡易Leitner SRS）
window.Quiz = (function () {
  // 簡易Leitner: 5ボックス
  const BOX_WEIGHT = { 1: 5, 2: 3, 3: 2, 4: 1, 5: 0.5 };
  // 例文(English example)を持つ語の出題確率を底上げする倍率。
  // ユーザー要望「なるべく出題には英文例を付ける」を反映。
  const EXAMPLE_BOOST = 10;

  // 例文を持っているか (空文字や undefined は false)
  function hasExample(word) {
    return !!(word && word.example && String(word.example).trim().length > 0);
  }

  function pickNext() {
    const s = State.get();
    let allWords = window.VOCAB;

    // PDF集中モード: 80%は当該PDFのヒット語、20%は通常SRS
    if (s.activePdfFocus && Array.isArray(s.pdfImports)) {
      const pdf = s.pdfImports.find(p => p.id === s.activePdfFocus);
      if (pdf && Array.isArray(pdf.hitWordIds) && pdf.hitWordIds.length > 0) {
        if (Math.random() < 0.8) {
          const hitSet = new Set(pdf.hitWordIds);
          const focused = allWords.filter(w => hitSet.has(w.id));
          if (focused.length > 0) allWords = focused;
        }
      }
    }

    // 未出題語(SRSに無い)を優先5枠 — 例文付きの未出題語があればそちらを優先
    const unseen = allWords.filter(w => !s.srs[w.id]);
    if (unseen.length > 0 && Math.random() < 0.35) {
      const unseenWithExample = unseen.filter(hasExample);
      const pool = unseenWithExample.length > 0 ? unseenWithExample : unseen;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const now = Date.now();
    const weighted = allWords.map(w => {
      const r = s.srs[w.id];
      let weight;
      if (!r) {
        weight = 6; // 未出題は最高優先
      } else {
        const baseW = BOX_WEIGHT[r.box || 1] || 1;
        const lastSeen = r.lastSeenAt ? new Date(r.lastSeenAt).getTime() : 0;
        const daysSince = lastSeen > 0 ? (now - lastSeen) / (1000 * 60 * 60 * 24) : 30;
        const recency = Math.min(1 + daysSince * 0.4, 4);
        const wrongBoost = r.lastResult === "wrong" ? 1.8 : 1.0;
        weight = baseW * recency * wrongBoost;
      }
      // 例文付きの語を強く優先 (ユーザー要望)
      if (hasExample(w)) weight *= EXAMPLE_BOOST;
      return { w, weight };
    });

    return pickWeighted(weighted);
  }

  function pickWeighted(arr) {
    const total = arr.reduce((a, x) => a + x.weight, 0);
    let r = Math.random() * total;
    for (const x of arr) {
      r -= x.weight;
      if (r <= 0) return x.w;
    }
    return arr[arr.length - 1].w;
  }

  function buildChoices(word) {
    const sameCategory = window.VOCAB.filter(v => v.category === word.category && v.id !== word.id);
    const others = window.VOCAB.filter(v => v.id !== word.id);
    const pool = sameCategory.length >= 3 ? sameCategory : others;
    const distractors = sample(pool, 3).map(w => w.ja[0]);
    const correct = word.ja[0];
    const choices = shuffle([correct, ...distractors]);
    return { choices, correctAnswer: correct };
  }

  function checkInput(input, word) {
    const norm = s => (s || "").normalize("NFKC").replace(/\s/g, "").toLowerCase();
    const tries = [...word.ja, ...(word.altJa || [])].map(norm);
    return tries.includes(norm(input));
  }

  function recordResult(wordId, isCorrect) {
    State.set(state => {
      const cur = state.srs[wordId] || { box: 1, seenCount: 0, correctCount: 0 };
      cur.seenCount = (cur.seenCount || 0) + 1;
      cur.lastSeenAt = new Date().toISOString();
      cur.lastResult = isCorrect ? "correct" : "wrong";
      if (isCorrect) {
        cur.correctCount = (cur.correctCount || 0) + 1;
        cur.box = Math.min((cur.box || 1) + 1, 5);
      } else {
        cur.box = Math.max((cur.box || 1) - 1, 1);
      }
      state.srs[wordId] = cur;
      return state;
    });
  }

  function sample(arr, n) {
    const a = arr.slice();
    const out = [];
    while (a.length && out.length < n) {
      const i = Math.floor(Math.random() * a.length);
      out.push(a.splice(i, 1)[0]);
    }
    return out;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { pickNext, buildChoices, checkInput, recordResult };
})();
