// VOCAB の重複統合（ランタイム実行）
// 全データファイル読込後にこのファイルを呼ぶことで window.VOCAB を正規化する。
// - 重複判定キー: en (NFKC正規化＋小文字＋空白除去)
// - 統合ルール: 最良エントリを基準にし、不足フィールドを他から補完
//   - ja, altJa: 全エントリの和集合
//   - example, exampleJa: 既存にあれば残す、無ければ追加
//   - source: 優先順 jcs_journal > international_paper > textbook > maff > irri > user_dictionary > なし
//   - category: 出典が信頼できるエントリ(jcs_journal/textbook/international_paper)を優先、なければ最初に出現
//   - difficulty: 平均値 (round)
// - 統合された ID は配列 _mergedFrom に記録（デバッグ用）
(function () {
  if (!window.VOCAB || window.VOCAB.length === 0) return;

  const SOURCE_RANK = {
    jcs_journal: 6,
    international_paper: 5,
    textbook: 4,
    maff: 3,
    irri: 3,
    user_dictionary: 2,
    claude_curated: 1
  };

  function rank(src) {
    if (!src) return 0;
    return SOURCE_RANK[src.type] || 0;
  }

  function normKey(en) {
    return (en || "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function uniq(arr) {
    return Array.from(new Set((arr || []).filter(x => x != null && x !== "")));
  }

  // グルーピング
  const groups = new Map();
  for (const v of window.VOCAB) {
    const k = normKey(v.en);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(v);
  }

  let mergedCount = 0;
  let removedCount = 0;
  const merged = [];
  for (const [, arr] of groups) {
    if (arr.length === 1) {
      merged.push(arr[0]);
      continue;
    }
    // 重複あり: 最良エントリを選び、他から不足を補完
    arr.sort((a, b) => {
      const r = rank(b.source) - rank(a.source);
      if (r !== 0) return r;
      // 同ランクなら example の有無、altJa の有無、長さで判定
      const sa = (a.example ? 1 : 0) + (a.altJa ? 1 : 0);
      const sb = (b.example ? 1 : 0) + (b.altJa ? 1 : 0);
      return sb - sa;
    });
    const head = JSON.parse(JSON.stringify(arr[0])); // copy
    head._mergedFrom = arr.slice(1).map(x => x.id);

    // ja / altJa は和集合
    let allJa = [];
    let allAltJa = [];
    for (const e of arr) {
      allJa = allJa.concat(e.ja || []);
      allAltJa = allAltJa.concat(e.altJa || []);
    }
    head.ja = uniq(allJa);
    head.altJa = uniq(allAltJa);
    if (head.altJa.length === 0) delete head.altJa;

    // example/exampleJa の補完
    if (!head.example) {
      const ex = arr.find(e => e.example);
      if (ex) head.example = ex.example;
    }
    if (!head.exampleJa) {
      const ex = arr.find(e => e.exampleJa);
      if (ex) head.exampleJa = ex.exampleJa;
    }

    // difficulty: 平均
    const diffs = arr.map(e => e.difficulty || 2);
    head.difficulty = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);

    // tags の和集合
    let allTags = [];
    for (const e of arr) allTags = allTags.concat(e.tags || []);
    if (allTags.length > 0) head.tags = uniq(allTags);

    merged.push(head);
    mergedCount++;
    removedCount += arr.length - 1;
  }

  if (removedCount > 0) {
    console.log(`[vocab_dedup] ${mergedCount} duplicate groups merged, ${removedCount} entries consolidated. Final size: ${merged.length}`);
  }
  window.VOCAB = merged;
})();
