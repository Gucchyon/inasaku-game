# 02 コンテンツ調達 — 学会紀事キュレーション運用

## 目的

ゲーム内の英単語・和訳・例文・解説・難易度・カテゴリ分類を、**日本作物学会紀事 (Japanese Journal of Crop Science)** を中心とする一次/準一次資料に基いて常時アップデートしていくための運用ルール。

## 主要ソース

| 種別 | URL / 名称 | アクセス | 主な用途 |
|---|---|---|---|
| 学会紀事 (J-STAGE) | https://www.jstage.jst.go.jp/browse/jcs/-char/ja | オープンアクセス（査読フリー、Scopus索引） | 用語の正確な使い方、最新研究テーマ、分野横断的な総説 |
| 学会論文URL形式 | `https://www.jstage.jst.go.jp/article/jcs/{vol}/{issue}/{vol}_{article_id}/_article/-char/ja` | 同上 | 個別論文への直接参照（語彙のsourceに記録） |
| 文部科学省「学術用語集 農学編」 | 国立国会図書館等で参照 | 図書館経由 | 標準和訳の確認 |
| 農林水産省 普及解説サイト | https://www.maff.go.jp/ | フリー | 一般語の簡潔解説 |
| JIS農業関連用語 | https://www.jisc.go.jp/ | フリー | 工業規格用語・計測用語 |
| IRRI Rice Knowledge Bank | http://www.knowledgebank.irri.org/ | フリー | 国際的な英語表記の確認 |

## キュレーション・ワークフロー（手動）

ユーザーが「学会紀事から追加して」と指示した時、Claude (本AI) が以下のステップで進める：

1. **論文選定**
   - 直近10年の総説 (review article) を優先
   - 水稲生産関連を first priority、次に育種・土壌・気候・病害虫
   - 新しい巻号から遡って読む（最新動向の反映を優先）

2. **読解とメモ取り**
   - WebFetch で該当URLを取得
   - 英語要旨・図表のキャプション・専門用語を中心に抽出
   - 同じ単語が異なる文脈で使われていないか確認（例: tiller = 分げつ茎 / 分げつ動詞）

3. **語彙追加候補の精査**
   - 既存 `js/data/vocabulary.js` に未収録か確認
   - 和訳が複数候補あるとき、紀事内の用法を優先
   - 例文は紀事から引用（または紀事に基いた言い換え）

4. **データ追加 (PR形式で)**
   - Plan Mode で追加内容を提示 → ユーザー承認
   - `vocabulary.js` の該当カテゴリ末尾に追加
   - 各語に `source` フィールドを必ず記入

5. **整合性チェック**
   - カテゴリ分類が既存と整合
   - difficulty の付与が学習者目線で妥当（普通の植物学教科書に出るか／専門分野のみか）

## 語彙データ拡張スキーマ

現在の `vocabulary.js` を以下のように拡張する。

```js
{
  id: "growth_011",                      // 既存規約 <category>_<NNN>
  en: "panicle initiation",
  ja: ["幼穂形成期"],
  altJa: ["ようすいけいせいき"],
  pos: "n.",
  category: "growth_stage",
  difficulty: 3,                          // 1: 普通教科書 / 2: 専門教科書 / 3: 論文・最新研究
  example: "Panicle initiation is identified by..." ,
  exampleJa: "幼穂形成期は…で同定される。",
  tags: ["rice", "morphology", "reproductive"],

  // === 拡張フィールド (新規) ===
  source: {
    type: "jcs_journal",                  // "jcs_journal" | "jis" | "maff" | "irri" | "user_pdf" | "claude_curated"
    citation: "佐藤ら (2023) 日作紀 92(1): 12-18",
    url: "https://www.jstage.jst.go.jp/article/jcs/92/1/92_12/_article/-char/ja",
    notes: "栄養成長期と区別する重要時期"
  },
  synonyms: ["幼穂分化期"],                  // 関連語（出題の重複を避けるため）
  relatedIds: ["growth_009"]               // 関連語のID
}
```

### 既存データのマイグレーション

- 既存100語は `source: { type: "claude_curated", notes: "初期収録" }` を一括付与
- 紀事を読んで内容を高めたものは `source` を `jcs_journal` に書き換え

## 「私 (Claude) が紀事を読む」ときの作業手順

ユーザーが「紀事の最新号を読んで作物学に関わる単語を5個追加して」と頼んだら、Claude は以下を実行：

```
1. WebFetch https://www.jstage.jst.go.jp/browse/jcs/-char/ja で最新号を確認
2. 興味深いタイトルを2-3本選んで WebFetch で要旨を取得
3. 既存vocabulary.jsを Read で確認し、未収録の専門語を5つピック
4. Plan Mode に入り、追加内容を表形式で提示
5. ユーザーが承認したら Edit で vocabulary.js に追加
6. Storage 互換性は壊さない（schemaVersion 1 据え置き）
```

## 品質管理

### 必須レビュー項目（追加時）
- [ ] 出典の確認可能性 (URL or 引用文献)
- [ ] 和訳の主要・副次の使い分け（`ja[0]` がもっとも一般的）
- [ ] altJa にひらがな読みが入っているか（入力モード対応）
- [ ] 例文と exampleJa が対応している
- [ ] 同名同意義の重複がない（既存検索）
- [ ] difficulty が既存品とのバランスで妥当
- [ ] tags が他語と整合（rice / soybean / wheat / general など）

### 月次メンテナンス（任意）
- 累計収録語の「正答率分布」を見て難易度を再調整
- 全く出題されない死語が出ていないか（SRS重みのバグチェック）
- 学会紀事の最新号を1本以上消化

## 将来の拡張

- **作物別のフィルタ**: 水稲以外（大豆・小麦・トウモロコシ）も将来追加可能。`tags` で `crop:rice` / `crop:soybean` を区別
- **季語マッピング**: 出題時に「現実の暦」と紐付けて『今は出穂期だから heading の出題確率UP』みたいな演出
- **論文リンクボタン**: 図鑑画面に「この語の出典を読む」ボタン → 該当J-STAGE記事を開く
