# 研究ログ — 日本作物学会紀事 読破記録

このファイルは、ゲーム内語彙の学術的正確性を担保するために、日本作物学会紀事（Japanese Journal of Crop Science）から読んだ論文を体系的に記録するものです。

## 全体把握（2026-05-08 時点）

- 紀事は 1928年創刊、2026年現在 **第95巻** まで刊行
- オープンアクセス（査読フリー）、Scopus索引
- 各巻に通常 4 issue（年4回刊）
- URL形式: `https://www.jstage.jst.go.jp/article/jcs/{vol}/{issue}/{vol}_{article_id}/_article/-char/ja`
- 目次URL: `https://www.jstage.jst.go.jp/browse/jcs/{vol}/{issue}/_contents/-char/ja`

## 読破した巻号の一覧

### 95巻 (2026)

#### 95巻1号 — 全16記事中、水稲関連 6本を識別
| 論文ID | タイトル | 種別 | 状態 |
|---|---|---|---|
| 95_1 | 水稲品種『ハイブリッドとうごう3号』の減窒素栽培における乾物生産および収量・品質 | 研究論文 | ✅ 読了 |
| 95_28 | 温暖地の中山間地域における水田用自動抑草ロボットの雑草抑制効果とイネの生育・収量に及ぼす影響 | 研究論文 | ✅ 読了 |
| 95_36 | 水稲高密度播種と育苗箱全量基肥の技術融合に関する研究 | 研究論文 | ✅ 読了 |
| 95_48 | コシヒカリの胴割粒発生に及ぼす環境要因の解析 | 研究論文 | ✅ 読了 |
| 95_85 | shinyを利用して大規模水稲作を『見える化』するWebアプリケーションの作成 | 研究・技術ノート | ⏸ 用語密度低そうで保留 |
| 95_91 | 高知県酒米品種『吟の夢』の各生産地域における高品質米生産のための移植適期の推定 | 研究・技術ノート | ✅ 読了 (2回目) |

#### 95巻2号 — 水稲関連 2本を識別
| 論文ID | タイトル | 種別 | 状態 |
|---|---|---|---|
| 95_190 | 福島県における水稲品種『天のつぶ』の疎播疎植ペースト2段施肥栽培 | 速報 | ✅ 読了 |
| 95_195 | 温室効果ガス排出を低減した新たな水稲栽培法の開発に向けて | 会員の広場 | ⚠️ 本文取得失敗、PDFは別途 |

### 90巻 (2021)
| 論文ID | タイトル | 状態 |
|---|---|---|
| 90_1 | 水稲の初冬直播き栽培における出芽率に及ぼす種子への薬剤処理と採種年の効果 | ⏸ 次回 |
| 90_10 | 北海道の直播向け品種「さんさんまる」を含む北海道水稲品種の低温発芽および低温出芽に対するプライミング処理の影響 | ✅ 読了 |
| 90_52 | 中国上海市で市販されている精米の理化学的・形態学的特性 | ⏸ 次回 |
| 90_64 | 近接リモートセンシングによる「山田錦」の生育量と適正穂肥量の推定 | ✅ 読了 |

## 2026-05-09 ユーザー提供PDFを取り込み (5回目)

### 論文
- **Li, T., Angeles, O., Marcaida III, M., Manalo, E., Manalili, M.P., Radanielson, A., Mohanty, S. (2017)**
  "From ORYZA2000 to ORYZA (v3): An improved simulation model for rice in drought and nitrogen-deficient environments."
  *Agricultural and Forest Meteorology* 237-238: 246-256.
  https://doi.org/10.1016/j.agrformet.2017.02.025
- IRRI 所属研究者によるイネシミュレーションモデルの解説。乾燥・窒素欠乏環境への対応を強化。
- ファイル: `C:\Users\speci\Downloads\1-s2.0-S0168192317300680-main.pdf` (24 pages, 2.3MB)

### 取り込み手段
PDF の Read ツールが pdftoppm 不足で動作しなかったため、Python の `pypdf` で抽出。`launcher.py` に同梱の pdf.js 経由でも取り込み可能なため、ゲーム内 PDF 機能でも同様の結果が得られる想定。

### 追加した語彙: 32語
モデリング・水管理・窒素動態・炭素動態の専門用語を中心に。`vocabulary_papers_en.js` 末尾に出典付きで追加。

主な追加語:
- ORYZAモデル、生態生理学モデル、モデル校正、モデル検証、モデル効率、RMSE
- 好気的水稲、好気的生態系、常時湛水
- 土壌水ポテンシャル、抽出可能水
- 窒素無機化、窒素有機化、尿素加水分解、硝化、脱窒、アンモニア揮散、窒素沈着、無機態窒素
- 土壌有機炭素、亜酸化窒素排出、炭素分解、新鮮有機物
- 地上部バイオマス、乾燥ストレス指数、乾燥耐性係数
- 可能蒸散量、可能光合成、吸水、土壌層、根の老化、土壌熱流

## 2026-05-08 (4回目) 国際誌追加 + dedup + 再分類ツール

### 追加した語彙: 46語 (Field Crops Research, Annals of Botany, Frontiers, Plant Cell & Environment)

`vocabulary_papers_en.js` に追記:
- Field Crops Research: 10 (crop ecology, resource-use efficiency, intensification, climate-smart, intercropping, double rice cropping 他)
- Annals of Botany: 9 (stress physiology, root system architecture, ecophysiology, oxidative damage, photosynthetic acclimation, phenotypic plasticity 他)
- Frontiers (water use efficiency): 8 (WUE, stomatal density, AWD, irrigation regime, root vigor, leaf water potential, VPD, intrinsic WUE)
- Frontiers (nitrogen use efficiency): 10 (NUE, nitrate, ammonium, controlled-release urea, nitrogen leaching, peptide transporter, NNI 他)
- Plant Cell & Environment 関連: 9 (gas exchange, mesophyll conductance, photoinhibition, Rubisco activity, NPQ, PSII, carboxylation rate 他)

### dedup ツール `vocab_dedup.js`

ランタイム重複統合スクリプト。データファイル全読み込み後に実行され、重複を統合。

**機能**:
- 重複判定: 英語名を NFKC 正規化＋小文字化＋空白統一
- 統合ルール:
  - source 優先順位: jcs_journal > international_paper > textbook > maff > irri > user_dictionary
  - ja, altJa, tags は和集合
  - example, exampleJa は最初の存在エントリを採用
  - difficulty は平均（四捨五入）
  - 統合元のIDは `_mergedFrom` 配列に保存（デバッグ用）

**結果**: 22 duplicate groups 統合 → user_dictionary が 961→939、重複0件達成。

### 再分類UI `tools/recategorize.html`

general カテゴリの手動振り分け用スタンドアロン HTML ツール。

**機能**:
- vocabulary_dict_import.js を読み込み、general カテゴリの全エントリを表形式で表示
- 各行にカテゴリ選択ドロップダウン
- 英語/日本語のフィルタ機能
- 変更件数のリアルタイムカウント
- 「適用JSコード生成」ボタンで `recategorize_overrides.js` を生成（textarea にコピペ用）

**動作確認**: 192件レンダリング、変更追跡、JSコード出力すべて正常。
ブラウザで `tools/recategorize.html` を開けばすぐ使える。

## 2026-05-08 (3回目) 英文国際誌の活用

### 試行・確認したソース
| ソース | アクセス | 状況 |
|---|---|---|
| Plant Production Science (J-STAGE 1998-2015) | OA | ✅ 一覧取得成功、個別論文は500エラー多発 |
| Plant Production Science (T&F 2016-) | 制限あり | ⚠️ 403 |
| Rice (BMC, Springer Open) | OA | ⚠️ 303 リダイレクトエラー |
| Frontiers in Plant Science | OA | ✅ 検索クエリ経由で用語抽出に成功 |
| IRRI 公式 | OA | ✅ 13用語取得済 |
| Field Crops Research | 一部OA | 未試行 |

### Frontiers in Plant Science での3トピック検索
1. "rice heat tolerance" → 15用語抽出
2. "rice yield physiology" → 15用語抽出
3. "rice breeding gene" → 15用語抽出

### 追加した英文論文ベース語彙: 60語
新規ファイル: `js/data/vocabulary_papers_en.js`
- 高温・耐熱性: 6語 (heat tolerance, canopy temperature, pollen viability, anther dehiscence, spikelet sterility 他)
- 育種・遺伝: 17語 (QTL, GWAS, MAS, candidate gene, SSR/SNP marker, CRISPR/Cas9, doubled haploid, GMS, hybrid breakdown, Pigm/Xa gene, weedy rice 他)
- 収量生理: 9語 (panicle architecture, post-heading dry matter transport, harvest index, head rice yield, grain chalkiness, ratooning, mesocotyl elongation 他)
- ストレス・生理: 7語 (ionic homeostasis, ROS, salinity tolerance, iron toxicity, submergence tolerance, Sub1A gene 他)
- オミクス: 4語 (transcriptomics, proteomic changes, metabolomics, phenomics)
- ホルモン: 6語 (cytokinin, ABA, jasmonic acid, salicylic acid, brassinosteroid, flavonoid metabolism)
- デジタル農業: 4語 (high-throughput phenotyping, computer vision, panicle counting, CNN)
- 営農・社会経済: 3語 (rice trade dynamics, spatio-temporal analysis, production patterns)
- 加工品質: 4語 (wet rice noodle, multivariate statistical analysis, gel consistency, amylopectin)
- 緑肥・養分循環: 4語 (green manure, rice straw return, secondary nutrient, grain enrichment)
- 雑草管理: 2語 (herbicide-resistant weed, integrated weed management)
- 直播・機械化: 2語 (machine-direct seeding, drone seeding)

すべての語に `source.type: "international_paper"` を付与、関連誌名を citation に記録。

## 2026-05-08 (2回目) 追加読破

新規読破した論文 (3本): 95_91, 90_64, 90_10
- 抽出語: 14語 (vocabulary.js に追加済)
- 出典タイプ: jcs_journal が 30 → **44語** に増加
- 教科書追加: 25語 (vocabulary_textbooks.js を 46 → **71語** に拡張)
- IRRI から: 2語 追加
- 総語彙: 1147 → **1186語**

### 第2回バッチで追加された主な用語
- 移植時期、出穂予測モデル、メッシュ農業気象データ、DVR法、酒造好適米
- 近接リモートセンシング、窒素蓄積量、穂揃期、生育センサー
- プライミング処理、低温発芽性、低温出芽性、ハイドロプライミング
- 葉色板、SPAD値、植生指数、茎葉診断
- 湛水直播、乾田直播、カルパー処理、鉄コーティング、初冬直播
- コブノメイガ、イネクロカメムシ、セジロウンカ、トビイロウンカ、ヒメトビウンカ、イネタマバエ
- CEC、置換性塩基、塩基飽和度、土壌容積重、土壌孔隙率、作土層、心土、グライ土壌

## 学術機構の修正履歴

### 2026-05-08 第2回 (今回)
- ✅ blast_disease を **leaf_blast (葉いもち)** と **panicle_blast (穂いもち)** に分離 (events_table.js, items.js, farm.js, achievements.js 連動更新)
- ✅ あきたこまち eventResistance: 0.05 → **-0.05** (いもち病・倒伏弱を反映)
- ✅ ひとめぼれ eventResistance: 0.05 → **0.0** (耐冷性中等)
- ✅ ササニシキ eventResistance: -0.05 → **-0.10** (冷害強脆弱性)
- ✅ ヒノヒカリ eventResistance: 0.05 → **0.0** (西日本主力、平均的)
- ✅ ゆめぴりか eventResistance: 0.10 → **0.05** (耐冷性中、過大気味だった)
- ✅ つや姫 はそのまま 0.10 (いもち病やや強で妥当)
- ✅ カテゴリ判定の単語境界マッチで誤分類削減 (general 237 → 192)

## 抽出した用語（出典付き）

### 95_1 から
| en | ja | difficulty | 文脈 |
|---|---|---|---|
| dry matter production | 乾物生産 | 2 | 出穂後の植物体全体の乾物蓄積量を測定 |
| panicle weight | 穂重 | 2 | 穀粒を含む穂全体の重量 |
| brown rice yield | 粗玄米重 | 2 | 精選前の玄米重量 |
| milled rice yield | 精玄米重 | 2 | 商品化後の玄米重量 |
| reduced nitrogen cultivation | 減窒素栽培 | 2 | 窒素肥料を削減した栽培 |
| early-season fertilizer reduction | 前期型減肥 | 3 | 生育初期の窒素削減 |
| late-season fertilizer reduction | 後期型減肥 | 3 | 出穂後の窒素削減 |
| whole grain percentage | 整粒歩合 | 2 | 完全な穀粒の割合 |
| hybrid rice | ハイブリッド水稲 | 1 | F1雑種水稲 |

### 95_48 から
| en | ja | difficulty | 文脈 |
|---|---|---|---|
| chalky grain | 胴割粒 | 2 | 玄米胚乳部に亀裂のある粒（※修正：胴割粒=cracked grain、白未熟粒=chalky grainが厳密） |
| cracked grain | 胴割粒 | 2 | 玄米胚乳に亀裂が生じる現象 |
| grain moisture | 籾水分 | 2 | 22%以下で重胴割粒が多発 |
| post-heading temperature | 出穂後気温 | 3 | 出穂後の気温が品質に影響 |
| accumulated temperature | 積算気温 | 2 | 800℃〜900℃時点で胴割粒判定 |
| inspection grade | 検査等級 | 2 | 玄米の品質格付け |

### 95_36 から
| en | ja | difficulty | 文脈 |
|---|---|---|---|
| high-density seeding | 高密度播種 | 2 | 育苗箱への高密度播種技術 |
| seedling tray | 育苗箱 | 1 | 苗を育てる箱 |
| controlled-release fertilizer | 肥効調節型肥料 | 2 | 緩効性の肥料総称 |
| mat strength | マット強度 | 3 | 機械移植可否の判定 |
| amylose content | アミロース含有率 | 2 | 食味関連の品質指標 |
| panicle number | 穂数 | 1 | 収量構成要素 |
| labor-saving cultivation | 省力栽培 | 2 | 作業効率化された栽培 |

### 95_28 から
| en | ja | difficulty | 文脈 |
|---|---|---|---|
| weed suppression | 雑草抑制 | 1 | 雑草の発生を抑える管理 |
| automatic weeding robot | 自動抑草ロボット | 2 | 水田内を自走する除草機 |
| organic rice farming | 有機水稲栽培 | 1 | 化学農薬・肥料を使わない栽培 |
| hilly and mountainous area | 中山間地域 | 2 | 山間部の農業地 |
| agronomic traits | 農業形質 | 2 | 栽培上重要な形質群 |

### 95_190 から
| en | ja | difficulty | 文脈 |
|---|---|---|---|
| sparse seeding | 疎播 | 2 | 種子を疎らに播く |
| sparse planting | 疎植 | 2 | 株間を広くとる栽植 |
| paste fertilizer | ペースト肥料 | 2 | ペースト状の液状肥料 |
| two-stage fertilization | 2段施肥 | 3 | 2段階に分けて施肥する技術 |
| spikelets per panicle | 1穂籾数 | 2 | 1つの穂に着く籾の数 |
| total spikelet number | 総籾数 | 2 | 単位面積あたりの全籾数 |
| leaf color | 葉色 | 1 | 葉の色（生育診断指標） |

## 重要メモ

### 用語の正確性に関する補足
- **chalky grain と cracked grain の違い**:
  - chalky grain = 白未熟粒（登熟不良で胚乳が白濁）
  - cracked grain (= cracking) = 胴割粒（胚乳に亀裂）
  - 元の vocabulary.js の `chalky grain → 胴割粒` 対応は誤り。修正が必要
- **panicle initiation の和訳**:
  - 一般には「幼穂形成期」、ただし「出穂」とは別概念。要修正

### 既存vocabulary.jsで修正が必要な箇所
| ID | 現状 | 修正提案 | 根拠 |
|---|---|---|---|
| growth_008 | panicle initiation = 幼穂形成期 | OK（既に正しい） | 95_190 |
| morph_003 | grain = 穀粒/籾 | "grain" は精玄米/玄米/籾を文脈で使い分け。複数和訳で対応中なのでOK | 95_1 |
| harv_003 | threshing = 脱穀 | OK | — |

### 次回以降に読むべき優先論文
1. **90_64** リモートセンシング: 山田錦の生育診断 → センシング系用語
2. **90_10** 低温発芽プライミング → 種子処理の用語
3. **94巻以前のシンポジウム記事** → 総説的記述で用語密度高
4. **89巻以前の英文Abstract付き論文** → 公式英訳が確認できる

### 読み方の改善点
- 本文取得が失敗するケース（95_195）はPDFを直接ダウンロードしてユーザーが処理する必要あり
- 速報・会員の広場は本文短い場合が多い、原著論文を優先
- 各論文の英文Abstract(あれば)を最初に確認し、公式な英訳語彙を取得するのが最も正確

## 達成度

| 指標 | 現状 | 目標 (v0.2) |
|---|---|---|
| 巻号確認 | 95(1,2), 90(1) | 95巻全号 + 90-94巻からサンプリング |
| 読了論文数 | 5本 | 30本 |
| 抽出用語数 | 約45語（重複除く） | 200語 |
| vocabulary.js 反映済 | 30語 (紀事出典付き) | 全抽出語 |
| **総語彙数** | **1099語** (138手動 + 961 TSV取り込み) | **2000語** |

## 2026-05-08 大量取り込み記録

ユーザーから提供された `dictionary.tsv` (1011語) を `tools/import_dictionary.py` で取り込み：

- 既存と重複: 51語スキップ
- 新規取り込み: 961語 → `js/data/vocabulary_dict_import.js`
- 全語に `source: { type: "user_dictionary" }` を付与
- カテゴリは英語キーワードでヒューリスティック自動判定
- 課題：誤分類が発生している（例: "grain size" が `climate` に → "rain" 部分文字列でヒット、"chalky grain" が `climate` に）
- altJa（かな読み）と example は未生成
- 修正は次回バッチで（`tools/import_dictionary.py` のルール強化 or 個別エントリ手動修正）

### chalky grain ≠ 胴割粒 問題の決着
- 過去の懸念: 95_48論文の用語抽出時に "chalky grain = 胴割粒" としていた
- 実際には `vocabulary.js` には `cracked grain = 胴割粒` (harv_016) として正しく登録
- TSV取り込みで `chalky grain = 白未熟粒` (imp_0118) も追加済
- 両者は明確に異なる概念であり、**現状は正しく区別されている** ✅

### 学術監修対象として記録した既知の問題
詳細は `docs/09-academic-accuracy.md` を参照。要点：
- イベント `heat_wave` の効果が yield_penalty になっているが、本来は **品質劣化**（白未熟粒）が主
- イベント `stink_bug` (カメムシ) の収量-25%は過大、本来は **検査等級下落**
- 品種コシヒカリの eventResistance を 0.0 → -0.05 に修正済（いもち病・倒伏弱を反映）
- 品種山田錦の eventResistance を 0.0 → -0.10 に修正済（長稈倒伏弱を反映）
- 葉いもち vs 穂いもちの分離など、未対応項目多数

## 永続化ポリシー

- 紀事を読むたびにこのファイルを更新する
- 抽出した語は `vocabulary.js` に追加し、`source` フィールドに該当論文のURL/引用を記録
- 既存語の修正が必要な場合は本ログ「重要メモ」に記載してから vocabulary.js に反映
