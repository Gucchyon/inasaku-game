// 画面ディスパッチャ。タイトルと設定もここで描画。
window.UI = (function () {
  let currentView = "title";

  function show(view) {
    currentView = view;
    const container = document.getElementById("screen");
    container.innerHTML = "";

    // ナビハイライト
    document.querySelectorAll(".nav-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.view === view);
    });

    if (view === "title") return renderTitle(container);
    if (view === "quiz") return window.QuizView.render(container);
    if (view === "farm") return window.FarmView.render(container);
    if (view === "shop") return window.ShopView.render(container);
    if (view === "collection") return window.CollectionView.render(container);
    if (view === "pdf" && window.PdfView) return window.PdfView.render(container);
    if (view === "help") return renderHelp(container);
    if (view === "settings") return renderSettings(container);
  }

  function renderHelp(container) {
    const wrap = document.createElement("div");
    wrap.className = "card fade-in";
    wrap.innerHTML = `
      <div class="section-title">❓ 遊び方ヘルプ</div>
      <div style="font-size:14px; line-height:1.7;">
        <h4 style="margin-top:8px;">基本ループ</h4>
        <ol style="padding-left:20px;">
          <li><strong>🌱 田んぼ</strong>で品種を選んで田植え</li>
          <li><strong>📖 学ぶ</strong>でクイズに正解 → 稲が育つ (GP獲得)</li>
          <li>完熟したら<strong>🌾 収穫</strong> → 米粒（🍚）を獲得</li>
          <li><strong>🏪 ショップ</strong>でアイテム・新品種・恒久アップグレードを購入</li>
        </ol>
        <h4 style="margin-top:14px;">アップグレード（新機能）</h4>
        <p>ショップの「🛠️ アップグレード」タブから、田んぼ別 (肥沃度・水路・防風林・害虫網・苗床) と全体 (鎌・知識・倉) を強化できます。投資が永続的に効きます。</p>
        <h4 style="margin-top:10px;">PDF論文の取り込み</h4>
        <p><strong>📄 論文</strong>からPDFをアップすると、その論文に出てくる作物学用語を集中的にクイズで学べます。</p>
        <h4 style="margin-top:10px;">キーボード操作</h4>
        <ul style="padding-left:20px;">
          <li><span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> <span class="kbd">4</span> 選択肢</li>
          <li><span class="kbd">Enter</span> 次の問題へ</li>
          <li><span class="kbd">M</span> 4択 ⇄ 入力モード切替</li>
        </ul>
        <h4 style="margin-top:10px;">プレステージ報酬（自動）</h4>
        <p>累計問題数・収穫数で永続効果が解放されます。詳細はショップの「🛠️ アップグレード」→ 累計実績ボーナス で確認。</p>

        <h4 style="margin-top:14px;">🌾 稲作 7つの栽培ポイント</h4>
        <ol style="padding-left:20px; line-height:1.7;">
          <li><strong>積極的な土づくり</strong>で異常気象に強い稲に。土壌診断と有機物確保が重要。</li>
          <li><strong>健苗育成</strong>で収量・品質の向上。「苗半作」と言われ、苗の良否が本田での生育を左右する。</li>
          <li><strong>ほ場の均平化と適期防除</strong>で効率的な雑草防除。凹凸があると凸部から雑草が繁茂する。</li>
          <li><strong>病害虫発生予察の活用</strong>で効果的な病害虫防除。日頃から稲を観察。</li>
          <li><strong>水管理の徹底</strong>で収量・品質の向上。出穂直後は最も水を必要とする時期。早期落水は収量・品質に悪影響。</li>
          <li><strong>作付設計と適期収穫</strong>。品種や作付時期の組み合わせで収穫時期を分散。</li>
          <li><strong>低コスト化＋省力化で収益アップ</strong>。基本技術の徹底がコスト削減につながる。</li>
        </ol>

        <h4 style="margin-top:14px; color:#6b5a1e;">📜 免責 (品種について)</h4>
        <p style="font-size:12px; color:#6b5a1e; line-height:1.6;">
          本ゲームに登場する水稲品種は<strong>すべて架空のオリジナル品種</strong>であり、実在する登録品種・商標品種・地域ブランド米とは無関係です。特性記述は作物学一般の知見に基づくフィクションです。
        </p>
        <p style="font-size:12px; color:#6b5a1e; line-height:1.6; margin-top:6px;">
          記述に誤り・専門的観点からの修正提案があれば GitHub Issues でご連絡ください。
        </p>
      </div>
    `;
    container.appendChild(wrap);
  }

  function renderTitle(container) {
    const s = State.get();
    const wrap = document.createElement("div");
    wrap.className = "card title-screen fade-in";
    const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
    wrap.innerHTML = `
      <h1>🌾 稲作のことば</h1>
      <div class="tagline">作物学のえいごを覚えながら、田んぼを育てよう。</div>
      <div class="quick-stats">
        <div><div class="num">${s.player.totalCorrect}</div><div>累計正解</div></div>
        <div><div class="num">${totalH}</div><div>収穫回数</div></div>
        <div><div class="num">${Object.values(s.collection.varieties || {}).filter(v => v.unlocked).length}</div><div>品種</div></div>
      </div>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button class="btn" id="btn-go-quiz">📖 クイズで育てる</button>
        <button class="btn secondary" id="btn-go-farm">🌱 田んぼを見る</button>
      </div>
    `;
    container.appendChild(wrap);
    document.getElementById("btn-go-quiz").addEventListener("click", () => show("quiz"));
    document.getElementById("btn-go-farm").addEventListener("click", () => show("farm"));
  }

  function renderSettings(container) {
    const s = State.get();
    const wrap = document.createElement("div");
    wrap.className = "card fade-in";
    wrap.innerHTML = `
      <div class="section-title">⚙️ 設定</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <label style="display:flex; justify-content:space-between; align-items:center;">
          <span>回答方式</span>
          <select id="set-answer-mode">
            <option value="choice" ${s.settings.answerMode === "choice" ? "selected" : ""}>4択</option>
            <option value="input" ${s.settings.answerMode === "input" ? "selected" : ""}>入力</option>
          </select>
        </label>
        <label style="display:flex; justify-content:space-between; align-items:center;">
          <span>モーション軽減</span>
          <input type="checkbox" id="set-reduced-motion" ${s.settings.reducedMotion ? "checked" : ""} />
        </label>
        <div style="border-top:1px solid #e6dfc4; margin-top:8px; padding-top:12px;">
          <button class="btn warn" id="btn-reset">⚠️ セーブを削除して最初から</button>
        </div>
      </div>
    `;
    container.appendChild(wrap);

    document.getElementById("set-answer-mode").addEventListener("change", e => {
      State.set(s => { s.settings.answerMode = e.target.value; return s; });
      window.Storage.scheduleSave(State.get());
    });
    document.getElementById("set-reduced-motion").addEventListener("change", e => {
      State.set(s => { s.settings.reducedMotion = e.target.checked; return s; });
      window.Storage.scheduleSave(State.get());
      document.body.classList.toggle("reduce-motion", e.target.checked);
    });
    document.getElementById("btn-reset").addEventListener("click", () => {
      window.Modal.open({
        title: "本当にリセット？",
        text: "すべての進行状況が失われます。",
        buttons: [
          { label: "キャンセル", value: false, primary: false },
          { label: "削除する", value: true, primary: true, kind: "warn" }
        ],
        onResult: (v) => {
          if (v) {
            window.Storage.clear();
            State.reset();
            refreshTopbar();
            show("title");
            window.Toast.show("リセットしました", "warn");
          }
        }
      });
    });
  }

  function refreshTopbar() {
    const s = State.get();
    const grain = document.getElementById("grain");
    const combo = document.getElementById("combo");
    const acc = document.getElementById("accuracy");
    if (grain) grain.textContent = s.player.grain;
    if (combo) combo.textContent = s.player.currentCombo;
    if (acc) {
      if (s.player.totalQuestions > 0) {
        const pct = Math.round((s.player.totalCorrect / s.player.totalQuestions) * 100);
        acc.textContent = pct + "%";
      } else {
        acc.textContent = "--";
      }
    }
  }

  return { show, refreshTopbar };
})();
