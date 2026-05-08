# 稲作のことば — 作物学えいご田んぼ

水稲生産をモチーフにした、作物学の英単語学習ゲームです。

## 遊び方

1. `index.html` をダブルクリックでブラウザ起動
2. 「🌱 田んぼ」で品種を選んで田植え
3. 「📖 学ぶ」で英単語クイズに挑戦
4. 正解するごとに稲が育ち、完熟したら「🌾 収穫」で米粒（🍚）を獲得
5. 米粒で新品種・肥料・農薬を購入して、より大きな農場へ

## キーボード

- `1-4` … 選択肢を選ぶ
- `Enter` … 次の問題へ
- `M` … 4択 / 入力 モード切替

## 単語追加

`js/data/vocabulary.js` に同じ形式で追加するだけ。

```js
{
  id: "growth_011",
  en: "panicle initiation",
  ja: ["幼穂形成期"],
  altJa: ["ようすいけいせいき"],
  pos: "n.",
  category: "growth_stage",
  difficulty: 3,
  example: "..."
}
```

カテゴリは `growth_stage / morphology / physiology / cultivation / pest_disease / soil_fertilizer / breeding / harvest_postharvest / climate / general` のいずれか。

## セーブデータ

`localStorage` の `cswb.save.v1` キーに保存されます。設定画面の「セーブを削除して最初から」でリセット可能。
