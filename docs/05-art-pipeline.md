# 05 アートパイプライン — ドット絵

## 方針

- **ベース**: Kenney.nl の CC0 ファーム/RPGパックを流用（クレジット不要だが LICENSES.md で記録）
- **稲の成長段階のみ自作SVG** で生成（ゲームの中核ビジュアルなので独自感を確保）
- **将来のリプレース可能性**: ユーザーがオリジナル素材を作ったら差し替えられる構造に

## 共通仕様

- **ベースタイル**: 16×16 px
- **キャラ**: 16×24 px
- **アイコン (UI)**: 16×16 px
- **拡大倍率**: 表示時は CSS で `image-rendering: pixelated` + 整数倍 (×2 / ×3) スケール
- **カラーパレット**: 32色程度に抑える（DB32 風 or 自作の和風パレット）
  - 緑系: 田んぼ・稲の各段階で違いがわかる4-5階調
  - 茶系: 土・木材
  - 青系: 水・空
  - 黄金: 登熟期・米粒
  - アクセント: 赤（神社・彼岸花）

## ファイル構成

```
assets/
  sprites/
    rice/                  自作（成長6段階分）
      stage_0_seed.svg
      stage_1_seedling.svg
      stage_2_tillering.svg
      stage_3_heading.svg
      stage_4_ripening.svg
      stage_5_harvestable.svg
    field/                 Kenney 由来
      paddy_water.png      水田タイル
      paddy_dry.png        落水田タイル
      ridge.png            あぜ道
    decorations/           Kenney + 和風カスタム
      scarecrow.png
      torii.png
      windmill.png
      ...
    characters/            Kenney 由来
      farmer_idle.png
      farmer_walk_*.png   (4方向×3フレーム)
    ui/
      coin.png
      heart.png
      icons_inventory_*.png
  tilesheets/
    farm_tileset.png       Kenney 由来のオリジナルシートをそのまま
    ui_iconset.png
LICENSES.md                各素材の出典・ライセンス記録
```

## ライセンス管理

`LICENSES.md` を別途作成し、各素材ごとに：

```md
## Kenney Farm Pack (CC0)
- URL: https://kenney.nl/assets/farm-pack
- License: CC0 1.0 Universal
- Used: paddy_water.png, paddy_dry.png, ridge.png, scarecrow.png

## 稲スプライト (オリジナル)
- License: 本プロジェクトと同じ
- 作成: Claude (生成) + 開発者 (調整)
```

CC0 のものはクレジット任意だが、必ず記録する（後で追跡できるよう）。

## 描画戦略

### 静的タイル
`<img>` をそのまま貼る or CSS background-image。
`image-rendering: pixelated` で整数倍に拡大。

### 田んぼ
タイルベースで合成。1区画は 6×4 タイル程度（96×64 px）。
- 背景: paddy_water タイルを並べる
- 中央: 稲スプライトを 3-5 個配置
- 装飾: あれば overlay

### 稲の成長（自作SVG）
各段階で 16×16 のSVG 1つ。inline SVG で挿入し、CSS animation で揺らす。

```svg
<!-- stage_2_tillering.svg の例 (簡略) -->
<svg viewBox="0 0 16 16" shape-rendering="crispEdges">
  <rect x="7" y="14" width="2" height="2" fill="#4a3924"/>  <!-- 根 -->
  <rect x="7" y="6" width="1" height="8" fill="#3a7d2a"/>   <!-- 茎 -->
  <rect x="6" y="3" width="1" height="3" fill="#5fa83a"/>   <!-- 葉 -->
  <rect x="9" y="4" width="1" height="2" fill="#5fa83a"/>
  <!-- ... -->
</svg>
```

整数座標のみ使用、`shape-rendering="crispEdges"` で輪郭をピクセル化。

### キャラ
将来 idle / walk アニメーションを追加するときは sprite-sheet + CSS keyframes で。

## CSS の基本ルール

```css
img.pixel, .pixel-bg {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 整数倍スケール */
.pixel-2x { transform: scale(2); transform-origin: top left; }
.pixel-3x { transform: scale(3); transform-origin: top left; }
```

## フェーズ展開（実装順）

### Phase A: 稲スプライトのみ自作
- 既存の絵文字 🌰🌱🌿🌾 を置き換え
- 既に CSS で揺れアニメは動いている

### Phase B: 田んぼタイル化
- 平面の緑グラデーションを Kenney タイルで置換
- 1区画＝タイルマップに

### Phase C: UI ピクセル化
- ボタン枠・カード枠を 9-slice 風に（CSS border-image）
- フォントは「Pixel Mplus」など日本語ピクセルフォントを検討（Web Font）
  - PxPlus / Misaki Gothic などライセンス確認の上採用
- 数字フォントは別途ピクセル数字を用意（米粒残高など）

### Phase D: キャラ追加
- 「農夫さん」キャラがホーム画面に立つ
- 収穫アニメ（鎌を振る）

### Phase E: 装飾・季節背景
- 装飾アイテム（カカシ・鳥居等）をピクセル化
- 季節（春夏秋冬）の田んぼ背景バリエーション

各 Phase は独立してリリース可能。途中で止めても破綻しない。

## バグ防止チェック

- [ ] 全画像に `image-rendering: pixelated` が効いている（ぼやけない）
- [ ] 整数倍スケール以外を避ける（×1.5 はダメ）
- [ ] レスポンシブで縮小されない（max-width: 100% を解除する場面あり）
- [ ] 高DPI ディスプレイでもクリスプ
- [ ] Safari / Firefox で同じ見た目（image-rendering の互換性）
