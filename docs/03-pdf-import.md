# 03 PDF アップロード機能

## 目的

ユーザーが手元の論文PDFをアップすると、その論文に出てくる作物学関連用語を中心にクイズが出題される。

## 実装方式

**方式A: ローカル辞書マッチ（採用）**

- 完全ブラウザ内処理
- 外部API呼出しなし、APIキー不要
- ネット不要
- 精度は「現状の vocabulary.js に収録された英単語」のサイズに依存

将来B (Claude API)、C (ハイブリッド) に拡張する余地は残す。

## ユーザーフロー

1. 「📄 論文を取り込む」ボタンを押す（ヘッダーの新タブ or 設定内）
2. ファイル選択ダイアログでPDFを選ぶ（複数選択可）
3. ブラウザ内で PDF からテキストを抽出（pdf.js を CDN ではなくローカル同梱）
4. テキストを正規化し、現行 vocabulary.js の英単語と一致するものを抽出
5. ヒット結果を「**📚 今日の論文**」モードとして提示：
   - ヒット語数 / 全体語数
   - ヒット語のリスト（クリックで詳細）
   - 「このセットでクイズする」ボタン
6. クイズモード切替: 通常モードのSRSとは別に、当該論文ヒット語のみを優先出題する一時セッションを開始

## ヒット判定アルゴリズム

```
1. PDF抽出テキストを normalize:
   - 改行・ハイフネーション解除 ("germi-\nnation" → "germination")
   - 小文字化
   - 句読点除去
   - 数字・短い語(<3文字)除去

2. 単語境界で分割し、unique 化 + 出現頻度カウント

3. vocabulary.js を走査:
   for (word of vocab) {
     検索キー1 = word.en (lowercase)
     検索キー2 = lemmatize(word.en)  // 簡易ステミング: 末尾 "s/es/ed/ing/ies"
     if (text に 検索キー1 / 検索キー2 が含まれる) hit
   }

4. ヒット結果をスコア順 (出現頻度) で返す
```

## 簡易ステミング規則（自前実装）

- `tillers` → `tiller`（s 削除）
- `flowering` → `flower`（ing 削除）→ vocabに `flowering` 自体があれば優先
- `flowered` → `flower`（ed 削除）
- `varieties` → `variety`（ies → y）
- `germinating` → `germinate`（ate を保持）

ロジックは `js/pdf_import.js` に独立、テスト可能な純関数として実装。

## データ構造

セーブに以下を追加：

```js
{
  pdfImports: [
    {
      id: "pdf_2026_05_08_001",          // タイムスタンプベース
      title: "Sato et al. 2023 (rice growth)", // ユーザー編集可
      uploadedAt: "2026-05-08T10:15:00Z",
      hitWordIds: ["growth_001", "growth_004", "morph_001", ...],
      totalWordsInPdf: 1250,
      uniqueWordsInPdf: 420,
      hitCount: 18,
      lastQuizzedAt: null
    }
  ],
  activePdfFocus: "pdf_2026_05_08_001" | null  // 集中モードで出題するPDF
}
```

PDFテキスト本体はセーブに保存しない（5MB制限を圧迫するため）。語彙IDのリストのみ持つ。

## UI

### 取り込み画面（モーダル or 新タブ）

- ファイル選択ボタン（drag&drop 対応）
- 取り込み中のスピナー
- 結果表示:
  ```
  📄 取り込み完了
  ファイル: paper.pdf
  抽出した英単語: 1250 単語 (ユニーク 420)
  辞書ヒット: 18 単語
  
  [このセットでクイズ開始] [語彙詳細を見る] [キャンセル]
  ```
- ヒット語が極端に少ない場合（<5語）は警告:
  「あまり一致しませんでした。語彙を増やすか、別の論文をお試しください。」

### クイズ画面の「集中モード」表示

通常クイズ画面の上部に：
- 「📚 集中: paper.pdf (18語)」のバッジ
- ✕ ボタンで通常モードに戻る
- 進捗バー: 18語のうち何語に正解したか

## 出題ロジックの修正

`js/quiz.js` の `pickNext()` を以下に拡張：

```js
function pickNext() {
  const s = State.get();
  const focus = s.activePdfFocus;
  if (focus) {
    const pdf = s.pdfImports.find(p => p.id === focus);
    if (pdf && pdf.hitWordIds.length > 0) {
      // 80% は当該PDFヒット語、20% は通常SRSプール
      if (Math.random() < 0.8) {
        return pickFromPool(pdf.hitWordIds);
      }
    }
  }
  // 通常SRSロジック
  return pickByWeight(...);
}
```

## ライブラリ選定

### pdf.js
- Mozilla 公式、MIT
- ブラウザ内で完結
- ローカル同梱（`assets/lib/pdf.min.js` + `pdf.worker.min.js`）
- file:// 起動でも動作確認すること（worker は same-origin 制約あり）
- バンドルサイズ ~700KB（許容範囲）

### CDN利用は避ける
- file:// 起動 + オフライン要件のため CDN ロードは不可
- ダウンロードして `assets/lib/` に配置

## エラー処理

- 暗号化PDF: 「このPDFは暗号化されています。パスワードを外してから再試行してください」
- 画像のみPDF (OCRなし): テキスト抽出は0語に近い → 警告表示。OCR は将来課題
- 100MB 超: 「ファイルが大きすぎます」（実装で上限チェック）
- 不正な PDF: pdf.js のエラーをキャッチして「読み込めませんでした」

## バグになりやすい箇所（要注意）

- 改行/ハイフネーション結合: 単語境界判定ミスで誤マッチ
- 大文字小文字: vocab 側は lowercase 統一が前提
- 複合語 (sheath blight): 単語ベース分割では引っかからない → ngram (2-gram) も試行する
- 略語 (e.g., DNA, RNA): 短すぎてフィルタ対象になりがち → 既知略語は通す例外リスト
- 著者名・地名: 同じ綴りの一般単語が誤ヒット → 単語頻度の上位N件は手動確認可能なUIに

## マイルストーン

| M | 内容 |
|---|---|
| M1 | pdf.js 同梱、PDFテキスト抽出が動く（コンソール出力） |
| M2 | ヒット判定が動く（モーダルで結果表示） |
| M3 | 集中モードでクイズが出題される |
| M4 | 履歴 (pdfImports) の管理画面（リネーム・削除） |
| M5 | 2-gram 拡張、誤ヒットの除外UI |
| M6 (将来) | 方式B (Claude API) を有効化するオプション設定 |

## ファイル

- `js/pdf_import.js` — PDF抽出+ヒット判定ロジック
- `js/ui/pdf_view.js` — 取り込み画面UI
- `assets/lib/pdf.min.js`, `pdf.worker.min.js` — pdf.js本体
- `js/data/stem_exceptions.js` — 略語ホワイトリスト・ステミング例外
