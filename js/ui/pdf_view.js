// PDFインポート画面
window.PdfView = (function () {

  function render(container) {
    container.innerHTML = "";
    const s = State.get();

    // イントロ
    const intro = document.createElement("div");
    intro.className = "card fade-in";
    intro.innerHTML = `
      <div class="section-title">📄 論文を取り込む</div>
      <div style="font-size:13px; color:#6b5a1e; margin-bottom:12px;">
        手元の論文PDFをアップロードすると、本文中の英単語と語彙データベースを照合し、その論文に出てくる作物学用語に絞ったクイズができます。
      </div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <input type="file" id="pdf-file-input" accept="application/pdf" multiple style="display:none;">
        <button class="btn" id="pdf-pick">📁 PDFを選ぶ</button>
        <span id="pdf-status" style="font-size:13px; color:#6b5a1e;"></span>
      </div>
    `;
    container.appendChild(intro);

    // 取り込み済み一覧
    const histTitle = document.createElement("div");
    histTitle.className = "section-title";
    histTitle.style.marginTop = "16px";
    histTitle.textContent = "📚 取り込み済み論文";
    container.appendChild(histTitle);

    const imports = s.pdfImports || [];
    if (imports.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "まだ取り込んだ論文はありません。";
      container.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.style.cssText = "display:flex; flex-direction:column; gap:10px;";
      imports.forEach(imp => list.appendChild(importCard(imp)));
      container.appendChild(list);
    }

    // ファイル選択ハンドラ
    const fileInput = document.getElementById("pdf-file-input");
    document.getElementById("pdf-pick").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async e => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      await handleFiles(files);
    });
  }

  async function handleFiles(files) {
    const status = document.getElementById("pdf-status");
    if (status) status.textContent = `処理中… (${files.length} ファイル)`;
    let processed = 0;
    for (const f of files) {
      try {
        if (status) status.textContent = `処理中… ${f.name} (${processed + 1}/${files.length})`;
        const result = await window.PdfImport.processFile(f);
        const id = window.PdfImport.saveImport(result);
        // 結果モーダル
        showResultModal(result, id);
        processed++;
      } catch (err) {
        console.error("PDF処理エラー", err);
        if (status) status.textContent = `エラー: ${err.message || err}`;
        window.Toast.show(`PDF処理失敗: ${f.name}`, "warn");
      }
    }
    window.Storage.scheduleSave(State.get());
    if (window.UI) window.UI.show("pdf");
    if (status) status.textContent = `完了: ${processed} / ${files.length} ファイル`;
  }

  function showResultModal(result, id) {
    const sample = result.hits.slice(0, 8).map(h => `${h.en} (${h.count}回) → ${h.ja[0]}`).join("<br>");
    const more = result.hits.length > 8 ? `<div style="margin-top:6px; color:#6b5a1e; font-size:12px;">... 他 ${result.hits.length - 8} 件</div>` : "";
    window.Modal.open({
      title: `📄 ${result.filename}`,
      html: `
        <div style="font-size:13px; line-height:1.6;">
          <div>📊 抽出英単語: ${result.totalWords} (ユニーク ${result.uniqueWords})</div>
          <div>🎯 辞書ヒット: <strong>${result.hitCount} 単語</strong></div>
          ${result.hitCount === 0 ? '<div style="color:#c2410c; margin-top:6px;">残念ながら一致する語がありませんでした。</div>' : ""}
          ${result.hitCount > 0 ? `<div style="margin-top:8px; padding:8px; background:#fff8df; border-radius:6px; font-size:12px;">${sample}${more}</div>` : ""}
        </div>
      `,
      buttons: result.hitCount > 0 ? [
        { label: "集中モードで学ぶ", primary: true, value: "focus", onClick: () => {
          window.PdfImport.setActiveFocus(id);
          window.Toast.show("📚 集中モード ON", "event");
          if (window.UI) window.UI.show("quiz");
        }},
        { label: "閉じる", value: "close" }
      ] : [
        { label: "了解", primary: true }
      ]
    });
  }

  function importCard(imp) {
    const s = State.get();
    const isActive = s.activePdfFocus === imp.id;
    const card = document.createElement("div");
    card.className = "card";
    card.style.cssText = `padding:12px; ${isActive ? "border-color: #2f7d32; background: #e8f5e9;" : ""}`;
    const date = new Date(imp.uploadedAt).toLocaleString();
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div style="flex:1;">
          <div style="font-weight:700;">${escapeHTML(imp.title)}</div>
          <div style="font-size:11px; color:#6b5a1e;">${date}</div>
          <div style="font-size:13px; margin-top:4px;">
            🎯 <strong>${imp.hitCount}</strong> 単語ヒット (全 ${imp.uniqueWordsInPdf} ユニーク中)
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-direction:column;">
          ${isActive
            ? `<button class="btn warn" data-act="clear">集中モード解除</button>`
            : `<button class="btn" data-act="focus">📚 集中モード</button>`}
          <button class="btn secondary" data-act="delete" style="font-size:12px;">🗑️ 削除</button>
        </div>
      </div>
    `;
    card.querySelector('[data-act="focus"]')?.addEventListener("click", () => {
      window.PdfImport.setActiveFocus(imp.id);
      window.Toast.show("📚 集中モード ON", "event");
      window.Storage.scheduleSave(State.get());
      if (window.UI) window.UI.show("quiz");
    });
    card.querySelector('[data-act="clear"]')?.addEventListener("click", () => {
      window.PdfImport.clearActiveFocus();
      window.Toast.show("通常モードに戻しました", "event");
      window.Storage.scheduleSave(State.get());
      if (window.UI) window.UI.show("pdf");
    });
    card.querySelector('[data-act="delete"]').addEventListener("click", () => {
      window.Modal.open({
        title: "削除しますか？",
        text: imp.title + " を削除します。",
        buttons: [
          { label: "キャンセル", value: false },
          { label: "削除", value: true, kind: "warn", onClick: () => {
            window.PdfImport.deleteImport(imp.id);
            window.Storage.scheduleSave(State.get());
            if (window.UI) window.UI.show("pdf");
          }}
        ]
      });
    });
    return card;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  return { render };
})();
