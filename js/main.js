// 起動・ルーター
(function () {
  function init() {
    // セーブ読込
    const saved = window.Storage.load();
    if (saved) {
      window.State.load(saved);
    }
    // 起動時の各種チェック
    window.Shop.checkVarietyUnlocks();
    const daily = window.Daily.checkAndClaim();
    window.AchievementsMod.checkAll();

    // 設定反映
    if (State.get().settings.reducedMotion) {
      document.body.classList.add("reduce-motion");
    }

    // ナビゲーション
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.UI.show(btn.dataset.view);
      });
    });

    // キーボード
    document.addEventListener("keydown", onKey);

    // 初回更新
    window.UI.refreshTopbar();
    window.UI.show("title");

    if (daily) {
      window.Modal.open({
        title: "📅 デイリーボーナス",
        html: `<p style="margin:0 0 8px;">連続ログイン <strong>${daily.streak}</strong> 日目！</p>
               <p style="margin:0; font-size:14px;">🍚 <strong>${daily.bonus}</strong> 獲得</p>`,
        buttons: [{ label: "ありがとう", primary: true, onClick: maybeShowTutorial }]
      });
      window.UI.refreshTopbar();
    } else {
      maybeShowTutorial();
    }

    // セーブ自動化
    State.subscribe(s => {
      window.Storage.scheduleSave(s);
      window.UI.refreshTopbar();
    });

    // 起動時にも一度セーブ（初回のとき）
    window.Storage.scheduleSave(State.get());
  }

  function maybeShowTutorial() {
    const s = State.get();
    // 初回(累計問題数 0 かつ 収穫 0)のみチュートリアルを出す
    if (s.player.totalQuestions > 0) return;
    if (s.flags && s.flags.tutorial_shown) return;

    let step = 0;
    const steps = [
      {
        title: "🌾 ようこそ稲作のことばへ",
        html: `<p style="line-height:1.7;">作物学の英語を、田んぼを育てながら覚えるゲームです。</p>
               <p style="line-height:1.7; margin-top:6px;">3分のチュートリアルで基本を学びましょう。</p>`
      },
      {
        title: "1️⃣ 田植えから始める",
        html: `<p style="line-height:1.7;">「🌱 田んぼ」タブで品種を選んで田植えします。</p>
               <p style="line-height:1.7; margin-top:6px;">最初は <strong>コシヒカリ</strong> が選べます。</p>`
      },
      {
        title: "2️⃣ クイズで稲を育てる",
        html: `<p style="line-height:1.7;">「📖 学ぶ」タブで英単語クイズに挑戦。</p>
               <p style="line-height:1.7; margin-top:6px;">正解するごとに <strong>GP</strong> がたまり、稲が成長します (種→苗→分げつ→出穂→登熟→収穫可)。</p>
               <p style="line-height:1.7; margin-top:6px;">連続正解でコンボ倍率がつきます🔥</p>`
      },
      {
        title: "3️⃣ 収穫して米粒(🍚)を稼ぐ",
        html: `<p style="line-height:1.7;">完熟したら田んぼ画面で収穫。米粒（🍚）が獲得できます。</p>
               <p style="line-height:1.7; margin-top:6px;">米粒は <strong>🏪 ショップ</strong> で道具・新品種・恒久アップグレードに使えます。</p>`
      },
      {
        title: "4️⃣ 恒久アップグレードに投資",
        html: `<p style="line-height:1.7;">ショップの <strong>🛠️ アップグレード</strong> タブから、田んぼ別に強化できます：</p>
               <ul style="padding-left:20px; line-height:1.7;">
                 <li>🪴 肥沃度: GP獲得 +5%/Lv</li>
                 <li>💧 水路整備: 干ばつ・冷夏 -10%/Lv</li>
                 <li>🌳 防風林: 台風 -15%/Lv</li>
                 <li>🕸️ 害虫網: 害虫発生率 -10%/Lv</li>
                 <li>🌱 苗床品質: 田植え時GP +10/Lv</li>
               </ul>
               <p style="line-height:1.7; margin-top:6px; font-size:13px; color:#6b5a1e;">全体アップグレード(鎌の品質・農学知識など)もあります。投資した強化は永続的に有効。</p>`
      },
      {
        title: "5️⃣ 累計実績ボーナス",
        html: `<p style="line-height:1.7;">遊び続けると累計問題数・収穫数で永続効果が解放されます：</p>
               <ul style="padding-left:20px; line-height:1.7;">
                 <li>累計100問: 米粒+5%</li>
                 <li>累計500問: コンボ最大値が30に</li>
                 <li>累計1000問: GP+10%</li>
                 <li>累計収穫10回: 田植え時に肥料1付与</li>
                 <li>累計収穫50回: イベント発生率-15%</li>
               </ul>`
      },
      {
        title: "6️⃣ 論文を取り込む(任意)",
        html: `<p style="line-height:1.7;"><strong>📄 論文</strong>からPDFをアップすると、その論文に出てくる作物学用語を集中的にクイズで覚えられます。</p>
               <p style="line-height:1.7; margin-top:6px;">日本作物学会紀事・国際誌・教科書から <strong>1300語以上</strong> を出典付きで収録。</p>`
      },
      {
        title: "✅ 準備完了",
        html: `<p style="line-height:1.7;">困ったときは右上の <strong>❓</strong> ボタンでヘルプを見られます。</p>
               <p style="line-height:1.7; margin-top:8px;">それでは、田植えから始めましょう！</p>`
      }
    ];

    function showStep() {
      const last = step === steps.length - 1;
      const cur = steps[step];
      window.Modal.open({
        title: cur.title,
        html: cur.html,
        buttons: last
          ? [
              { label: "🌱 田んぼへ", primary: true, onClick: () => {
                State.set(s2 => { s2.flags.tutorial_shown = true; return s2; });
                window.Storage.scheduleSave(State.get());
                window.UI.show("farm");
              } }
            ]
          : [
              { label: "スキップ", value: false, onClick: () => {
                State.set(s2 => { s2.flags.tutorial_shown = true; return s2; });
                window.Storage.scheduleSave(State.get());
              } },
              { label: `次へ (${step + 1}/${steps.length})`, primary: true, onClick: () => {
                step++;
                setTimeout(showStep, 100);
              } }
            ]
      });
    }
    showStep();
  }

  function onKey(e) {
    // 入力欄ではキーボードショートカットを抑止
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) return;
    const key = e.key;
    // 1-4 で選択肢
    if (/^[1-4]$/.test(key)) {
      const choices = document.querySelectorAll(".choice");
      const idx = parseInt(key, 10) - 1;
      if (choices[idx] && !document.getElementById("quiz-next")) {
        choices[idx].click();
      }
    } else if (key === "Enter") {
      const next = document.getElementById("quiz-next");
      if (next) next.click();
    } else if (key === "m" || key === "M") {
      // モード切替
      State.set(s => {
        s.settings.answerMode = s.settings.answerMode === "choice" ? "input" : "choice";
        return s;
      });
      window.Toast.show("回答モード: " + (State.get().settings.answerMode === "choice" ? "4択" : "入力"), "event");
      const screenName = document.querySelector(".nav-btn.active");
      if (screenName && screenName.dataset.view === "quiz") window.UI.show("quiz");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // === PWA: Service Worker 登録 ===
  // file:// では動かないが、http(s) ホスティング/PyInstaller経由なら有効
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").then(reg => {
        console.log("[sw] registered, scope:", reg.scope);
      }).catch(err => {
        console.warn("[sw] register failed:", err);
      });
    });
  }
})();
