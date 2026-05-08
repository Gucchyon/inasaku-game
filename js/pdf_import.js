// PDF論文インポート: PDF→英語テキスト抽出 → 既存vocabulary.js とのマッチング
window.PdfImport = (function () {

  // pdf.js の workerSrc を設定（local 同梱版）
  function configurePdfJs() {
    if (typeof pdfjsLib !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/lib/pdf.worker.min.js";
      return true;
    }
    return false;
  }

  // PDF File オブジェクトからテキスト抽出
  async function extractText(file) {
    if (!configurePdfJs()) {
      throw new Error("pdf.js が読み込まれていません");
    }
    const arrayBuf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(it => it.str).join(" ");
      pages.push(pageText);
    }
    return pages.join("\n");
  }

  // テキスト正規化
  function normalizeText(text) {
    return text
      // ハイフンによる行末分割を解除 ("germi-\nnation" → "germination")
      .replace(/-\s*\n\s*/g, "")
      // 改行・タブを空白に
      .replace(/\s+/g, " ")
      // 小文字化
      .toLowerCase();
  }

  // 簡易ステミング: 末尾変化を削除して見出し形を返す候補リストを生成
  function stemCandidates(word) {
    const w = word.toLowerCase();
    const cands = [w];
    if (w.length > 4) {
      // ies → y
      if (w.endsWith("ies")) cands.push(w.slice(0, -3) + "y");
      // es → (削除)
      if (w.endsWith("es")) cands.push(w.slice(0, -2));
      // s → (削除)
      if (w.endsWith("s") && !w.endsWith("ss")) cands.push(w.slice(0, -1));
      // ed → (削除)
      if (w.endsWith("ed")) {
        cands.push(w.slice(0, -2));
        cands.push(w.slice(0, -1)); // -d only
      }
      // ing → (削除)
      if (w.endsWith("ing")) {
        cands.push(w.slice(0, -3));
        cands.push(w.slice(0, -3) + "e");
      }
      // ation → ate
      if (w.endsWith("ation") && w.length > 5) cands.push(w.slice(0, -3) + "e");
    }
    return cands;
  }

  // テキストから単語/2-gram の頻度マップを作成
  function tokenize(text) {
    const norm = normalizeText(text);
    // 句読点を空白に
    const cleaned = norm.replace(/[^\w\s\-]/g, " ");
    const words = cleaned.split(/\s+/).filter(w => w.length >= 3);
    return words;
  }

  function buildFreqMap(words) {
    const freq = new Map();
    // 1-gram
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    // 2-gram (連続2語)
    for (let i = 0; i + 1 < words.length; i++) {
      const bg = words[i] + " " + words[i + 1];
      freq.set(bg, (freq.get(bg) || 0) + 1);
    }
    return freq;
  }

  // VOCAB と照合
  function matchVocab(text) {
    const words = tokenize(text);
    const totalWords = words.length;
    const uniqueWords = new Set(words).size;
    const freq = buildFreqMap(words);

    const hits = [];
    const seenIds = new Set();
    for (const v of (window.VOCAB || [])) {
      if (seenIds.has(v.id)) continue;
      const enKey = (v.en || "").toLowerCase().trim();
      if (!enKey) continue;
      let count = 0;

      if (enKey.includes(" ")) {
        // 複合語: そのまま2-gram(またはそれ以上)で照合
        // freq map には 2-gram もある
        if (freq.has(enKey)) count = freq.get(enKey);
        // テキスト全体で substring 検索（より長い複合語）
        if (count === 0) {
          const norm = words.join(" ");
          const occurrences = (norm.match(new RegExp("\\b" + enKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g")) || []).length;
          if (occurrences > 0) count = occurrences;
        }
      } else {
        // 単独語: stem candidates すべてで頻度確認
        const cands = stemCandidates(enKey);
        for (const c of cands) {
          if (freq.has(c)) count += freq.get(c);
        }
      }
      if (count > 0) {
        hits.push({ id: v.id, en: v.en, ja: v.ja, count, category: v.category, source: v.source });
        seenIds.add(v.id);
      }
    }
    // 頻度順ソート
    hits.sort((a, b) => b.count - a.count);
    return { totalWords, uniqueWords, hits };
  }

  // メイン: ファイルを処理して結果を返す
  async function processFile(file) {
    const text = await extractText(file);
    const result = matchVocab(text);
    return {
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      totalWords: result.totalWords,
      uniqueWords: result.uniqueWords,
      hits: result.hits,
      hitCount: result.hits.length
    };
  }

  // セーブ用 ID 生成
  function generateId() {
    const d = new Date();
    return "pdf_" + d.toISOString().replace(/[:.\-T]/g, "").slice(0, 14) + "_" + Math.random().toString(36).slice(2, 6);
  }

  // セーブ追加
  function saveImport(result, customTitle) {
    const id = generateId();
    State.set(s => {
      if (!Array.isArray(s.pdfImports)) s.pdfImports = [];
      s.pdfImports.push({
        id,
        title: customTitle || result.filename || "untitled",
        filename: result.filename,
        uploadedAt: result.uploadedAt,
        hitWordIds: result.hits.map(h => h.id),
        totalWordsInPdf: result.totalWords,
        uniqueWordsInPdf: result.uniqueWords,
        hitCount: result.hitCount,
        lastQuizzedAt: null
      });
      return s;
    });
    return id;
  }

  function deleteImport(pdfId) {
    State.set(s => {
      if (!Array.isArray(s.pdfImports)) return s;
      s.pdfImports = s.pdfImports.filter(p => p.id !== pdfId);
      if (s.activePdfFocus === pdfId) s.activePdfFocus = null;
      return s;
    });
  }

  function setActiveFocus(pdfId) {
    State.set(s => { s.activePdfFocus = pdfId; return s; });
  }

  function clearActiveFocus() {
    State.set(s => { s.activePdfFocus = null; return s; });
  }

  function listImports() {
    return State.get().pdfImports || [];
  }

  return {
    processFile, saveImport, deleteImport,
    setActiveFocus, clearActiveFocus, listImports,
    matchVocab, // exposed for testing
    extractText // exposed for testing
  };
})();
