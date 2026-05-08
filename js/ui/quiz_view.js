// クイズ画面
window.QuizView = (function () {
  let currentWord = null;
  let answeredThisRound = false;
  let cachedChoices = null;

  function render(container) {
    const s = State.get();
    container.innerHTML = "";

    // PDF集中モードバッジ
    if (s.activePdfFocus && Array.isArray(s.pdfImports)) {
      const pdf = s.pdfImports.find(p => p.id === s.activePdfFocus);
      if (pdf) {
        const badge = document.createElement("div");
        badge.style.cssText = "background:#fff8df; border:1px solid #f59e0b; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;";
        badge.innerHTML = `
          <div style="font-size:13px;">📚 集中モード: <strong>${escapeHTML(pdf.title)}</strong> (${pdf.hitCount}語)</div>
          <button class="btn secondary" style="padding:4px 10px; font-size:12px;" id="quiz-clear-focus">✕ 通常に戻す</button>
        `;
        container.appendChild(badge);
        setTimeout(() => {
          const btn = document.getElementById("quiz-clear-focus");
          if (btn) btn.addEventListener("click", () => {
            window.PdfImport.clearActiveFocus();
            window.Toast.show("通常モードに戻しました", "event");
            window.Storage.scheduleSave(State.get());
            if (window.UI) window.UI.show("quiz");
          });
        }, 0);
      }
    }

    // 田植え必須チェック
    const field = window.Farm.getActiveField();
    const fieldHint = document.createElement("div");
    fieldHint.className = "card";
    if (!field || !field.varietyId) {
      fieldHint.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:38px; margin-bottom:8px;">🌱</div>
          <div style="font-weight:700; margin-bottom:6px;">まずは田植えから</div>
          <div style="font-size:13px; color:#6b5a1e; margin-bottom:14px;">「田んぼ」タブで品種を選んで田植えしましょう。<br>クイズに正解すると稲が育ちます。</div>
        </div>`;
      container.appendChild(fieldHint);
    } else {
      const variety = window.VARIETIES.find(v => v.id === field.varietyId);
      const stage = field.stage || 0;
      const nextThr = window.Farm.STAGE_THRESHOLDS[Math.min(stage + 1, 5)] || 380;
      const prevThr = window.Farm.STAGE_THRESHOLDS[stage] || 0;
      const span = Math.max(1, nextThr - prevThr);
      const into = field.growthPoints - prevThr;
      const pct = Math.min(100, Math.max(0, (into / span) * 100));
      fieldHint.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:32px;">${window.Farm.STAGE_ICONS[stage]}</div>
          <div style="flex:1;">
            <div style="font-weight:700;">田${field.id}: ${variety ? variety.name : "?"} <span class="badge rarity-${variety ? variety.rarity : "N"}">${variety ? variety.rarity : ""}</span></div>
            <div style="font-size:12px; color:#6b5a1e; margin:2px 0 6px;">${window.Farm.STAGE_NAMES[stage]} (GP ${field.growthPoints}/${nextThr})</div>
            <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
          </div>
        </div>`;
      container.appendChild(fieldHint);
    }

    // クイズカード
    const card = document.createElement("div");
    card.className = "card quiz-card fade-in";

    // 他画面から戻ってきた直後に「回答済み」状態が残っていると
    // 選択肢をクリックしても何も起きないので、ここでリセットして次の問題に切り替える
    if (answeredThisRound) {
      currentWord = null;
      cachedChoices = null;
      answeredThisRound = false;
    }

    if (!currentWord) {
      currentWord = window.Quiz.pickNext();
      cachedChoices = null;
      answeredThisRound = false;
    }

    const w = currentWord;
    const meta = document.createElement("div");
    meta.className = "quiz-meta";
    meta.innerHTML = `
      <span>カテゴリ: ${categoryLabel(w.category)}</span>
      <span>難易度: ${"★".repeat(w.difficulty)}${"☆".repeat(3 - w.difficulty)}</span>`;
    card.appendChild(meta);

    const en = document.createElement("div");
    en.className = "quiz-en";
    en.textContent = w.en;
    card.appendChild(en);

    if (w.pos) {
      const pos = document.createElement("div");
      pos.className = "quiz-pos";
      pos.textContent = posLabel(w.pos);
      card.appendChild(pos);
    }

    if (w.example) {
      const ex = document.createElement("div");
      ex.className = "quiz-example";
      ex.innerHTML = "<em>例:</em> " + escapeHTML(w.example);
      card.appendChild(ex);
    }

    if (s.settings.answerMode === "input") {
      renderInput(card, w);
    } else {
      renderChoices(card, w);
    }

    const result = document.createElement("div");
    result.className = "quiz-result";
    result.id = "quiz-result";
    card.appendChild(result);

    container.appendChild(card);

    // ヒント
    const hint = document.createElement("div");
    hint.className = "empty";
    hint.innerHTML = `<span class="kbd">1-4</span>で回答 / <span class="kbd">Enter</span>で次へ / <span class="kbd">M</span>でモード切替`;
    container.appendChild(hint);
  }

  function renderChoices(card, word) {
    if (!cachedChoices) cachedChoices = window.Quiz.buildChoices(word);
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    cachedChoices.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.dataset.idx = i;
      btn.dataset.value = choice;
      btn.innerHTML = `<span class="choice-num">${i + 1}</span>${escapeHTML(choice)}`;
      btn.addEventListener("click", () => onChoiceClick(btn, choice, word));
      grid.appendChild(btn);
    });
    card.appendChild(grid);
  }

  function renderInput(card, word) {
    const row = document.createElement("div");
    row.className = "input-row";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "日本語で入力";
    input.id = "quiz-input";
    input.autocomplete = "off";
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !answeredThisRound) {
        submit(input.value, word);
      } else if (e.key === "Enter" && answeredThisRound) {
        nextQuestion();
      }
    });
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "回答";
    btn.addEventListener("click", () => {
      if (!answeredThisRound) submit(input.value, word);
      else nextQuestion();
    });
    row.appendChild(input);
    row.appendChild(btn);
    card.appendChild(row);
    setTimeout(() => input.focus(), 50);
  }

  function onChoiceClick(btn, value, word) {
    if (answeredThisRound) return;
    answeredThisRound = true;
    const isCorrect = value === cachedChoices.correctAnswer;
    btn.classList.add(isCorrect ? "correct" : "wrong");
    if (!isCorrect) {
      // 正解を見せる
      document.querySelectorAll(".choice").forEach(c => {
        if (c.dataset.value === cachedChoices.correctAnswer) c.classList.add("correct");
      });
    }
    finishAnswer(isCorrect, word);
  }

  function submit(input, word) {
    if (answeredThisRound) return;
    answeredThisRound = true;
    const isCorrect = window.Quiz.checkInput(input, word);
    finishAnswer(isCorrect, word);
  }

  function finishAnswer(isCorrect, word) {
    window.Quiz.recordResult(word.id, isCorrect);
    const res = window.Farm.applyAnswer(isCorrect, word.difficulty);

    const resEl = document.getElementById("quiz-result");
    if (resEl) {
      const correctLabel = (word.ja || []).join(" / ");
      if (isCorrect) {
        resEl.className = "quiz-result correct";
        resEl.innerHTML = `⭕ 正解！ +${res.gpGain} GP${res.grainDrop ? ` / +🍚${res.grainDrop}` : ""}`;
      } else {
        resEl.className = "quiz-result wrong";
        resEl.innerHTML = `❌ 不正解。正解は「${escapeHTML(correctLabel)}」`;
      }
    }

    // コンボ通知
    const s = State.get();
    if (isCorrect && s.player.currentCombo > 0 && s.player.currentCombo % 5 === 0) {
      window.Toast.show(`🔥 ${s.player.currentCombo}連続！`, "combo");
    }
    if (res.comboSaved) {
      window.Toast.show("🍙 おむすびがコンボを守った!", "harvest");
    }

    // ステージ進行通知
    if (res.newStage > 0) {
      const before = s.fields.find(f => f.id === s.activeFieldId).stage;
      // 簡易: gpGain正なら段階の境界をまたいだか確認したいが、currentCombo計算後の状態は更新済
      // ここでは Farm 側で newStage を受けているので変化検出は次回render時に視覚で分かる
    }

    // イベント発生時の演出
    if (res.fieldEvent) {
      handleFieldEvent(res.fieldEvent);
    }

    // アチーブメント・品種解放チェック
    const newAchs = window.AchievementsMod.checkAll();
    window.Shop.checkVarietyUnlocks();
    newAchs.forEach(a => {
      window.Toast.show(`🏅 ${a.name} 達成！`, "harvest");
    });
    // プレステージ閾値チェック
    if (window.Prestige) window.Prestige.checkAndCelebrate();

    // 次の問題への進行
    setTimeout(() => {
      addContinueButton();
    }, 200);

    // セーブ
    window.Storage.scheduleSave(State.get());
    // トップバーを更新
    if (window.UI && window.UI.refreshTopbar) window.UI.refreshTopbar();
  }

  function addContinueButton() {
    if (document.getElementById("quiz-next")) return;
    const card = document.querySelector(".quiz-card");
    if (!card) return;
    const btn = document.createElement("button");
    btn.id = "quiz-next";
    btn.className = "btn";
    btn.style.marginTop = "10px";
    btn.textContent = "次の問題 →";
    btn.addEventListener("click", nextQuestion);
    card.appendChild(btn);
    btn.focus();
  }

  function nextQuestion() {
    currentWord = null;
    cachedChoices = null;
    answeredThisRound = false;
    if (window.UI && window.UI.show) window.UI.show("quiz");
  }

  function handleFieldEvent(ev) {
    if (ev.type === "prevented") {
      window.Toast.show(`🛡️ ${ev.event.name} を防いだ！`, "event");
      return;
    }
    if (ev.type === "occurred" && ev.event) {
      const e = ev.event;
      const tone = e.kind === "positive" ? "event" : "warn";
      window.Toast.show(`${e.icon} ${e.name}`, tone);
      window.Modal.open({
        title: `${e.icon} ${e.name}`,
        html: `<p style="margin:0 0 8px;">${e.desc}</p>` +
              (e.kind === "negative" ? `<p style="font-size:12px; color:#6b5a1e; margin:0;">対処: ${
                (e.cure && e.cure.length) ? e.cure.map(id => itemName(id)).join("、") + " で治療" : (e.prevent && e.prevent.length ? "次回は " + e.prevent.map(id => itemName(id)).join("、") + " で予防可" : "対処不可")
              }</p>` : ""),
        buttons: [{ label: "了解", primary: true }]
      });
    }
  }

  function itemName(id) {
    const it = window.ITEMS.find(x => x.id === id);
    return it ? it.icon + it.name : id;
  }

  // 品詞略記を日本語ラベルに変換 (n. → 名詞 など)
  function posLabel(pos) {
    if (!pos) return "";
    const map = {
      "n.": "名詞",
      "v.": "動詞",
      "adj.": "形容詞",
      "adv.": "副詞",
      "prep.": "前置詞",
      "conj.": "接続詞",
      "phr.": "句"
    };
    return map[pos] || pos;
  }

  function categoryLabel(cat) {
    const map = {
      growth_stage: "生育段階",
      morphology: "形態",
      physiology: "生理",
      cultivation: "栽培管理",
      pest_disease: "病害虫",
      soil_fertilizer: "土壌・肥料",
      breeding: "育種",
      harvest_postharvest: "収穫・調製",
      climate: "気候",
      general: "一般"
    };
    return map[cat] || cat;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function reset() {
    currentWord = null;
    cachedChoices = null;
    answeredThisRound = false;
  }

  return { render, reset };
})();
