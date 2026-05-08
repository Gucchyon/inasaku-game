# 06 配布 — Windows .exe / iOS / Android

## TL;DR

| 方式 | サイズ / 形態 | 受け手の必要環境 | 作る手間 | 配布範囲 |
|---|---|---|---|---|
| **A. Windows .exe (PyInstaller)** | **約8MB 単一exe** | なし（Win） | 1コマンド | 完了 ✅ |
| B. ZIP + start.bat | 約4MB | Python 3 (Win/Mac/Linux) | 0 | 完了 ✅ |
| **C. PWA (iOS/Android対応)** | URL を共有 | スマホブラウザ | 公開ホスティング要 | 設定済 ✅ |
| D. iOS App Store (Capacitor) | ~30MB ipa | なし | Mac+Xcode+$99/年 | 未着手 |
| E. Android Play (Capacitor) | ~15MB apk | なし | Android Studio | 未着手 |
| F. Tauri / Electron | 10-150MB | なし (クロスプラットフォーム) | セットアップ要 | 未着手 |

**Windows なら A、iPhone/iPad/Android なら C (PWA) を推奨**。
本格的にAppStoreに出すなら D が必要。

---

## A. 単一 .exe (PyInstaller) — 推奨

### ビルド済みファイル
- `dist/InasakuGame.exe`
- ダブルクリックで起動 → コンソールが開き、自動で既定ブラウザが起動してゲームが始まる
- Python の同梱、http.server、ゲーム一式 を1ファイルに圧縮済

### 受け手への渡し方
1. `dist/InasakuGame.exe` を ZIP/メール/USB で渡す
2. 受け手はダブルクリックするだけ
3. 起動後に SmartScreen 警告が出ることがある（コード署名なしのため）→「詳細情報」→「実行」

### 再ビルド方法
ゲームのコードを変更したら以下で再生成：

```bash
python -m pip install --user pyinstaller   # 初回のみ
python -m PyInstaller --clean InasakuGame.spec
```

成果物は `dist/InasakuGame.exe` に出る。`build/` は削除して構わない。

### 仕組み (`launcher.py`)

1. ループバック (127.0.0.1) で空きポート (53151〜) を探す
2. http.server で同梱したゲームを配信
3. 既定のブラウザで `http://127.0.0.1:<port>/index.html` を開く
4. コンソールウィンドウを閉じるとサーバ停止

### ハマりどころ
- **SmartScreen警告**: コード署名がないため初回起動時に警告。署名するには Authenticode 証明書 (有料) が必要
- **アンチウイルス偽陽性**: PyInstaller 製の exe は誤検知されやすい。ビルド時 `upx=False` を維持し、配布前に VirusTotal で確認するのが無難
- **絵文字エンコーディング**: コンソールが cp932 でも落ちないよう `safe_print()` で対処済
- **OneDrive 同期**: `dist/` を OneDrive 配下に置くと同期中ロックでビルド失敗することあり

---

## B. ZIP + start.bat — Python ユーザー向け

Python 3 が入っている人向け。サイズは小さい。

### 渡し方
1. プロジェクト全体を ZIP 化（除外: `dist/`, `build/`, `__pycache__/`, `.git/`）
2. 受け手は展開後 `start.bat` をダブルクリック
3. ブラウザが自動で開く

### `start.bat` の中身
- `python -m http.server 53151 --bind 127.0.0.1`
- 同時にブラウザを `start "" http://127.0.0.1:53151/index.html` で起動

---

## C. PWA — iPhone/iPad/Android からホーム画面に追加

iOS でアプリ的に動かす一番手早い方法。ネイティブアプリではないが、フルスクリーン・アイコン・スプラッシュ・オフライン動作が可能。

### 既に実装済み
- `manifest.webmanifest` (PWA定義)
- `sw.js` (Service Worker — オフラインキャッシュ・stale-while-revalidate)
- `assets/icons/` (192/256/384/512 PNG + apple-touch-icon 4種 + favicon)
- `index.html` の `<head>` に iOS用メタタグ・apple-touch-icon・manifest 参照を追加
- `js/main.js` で Service Worker を登録
- `css/layout.css` で iOS safe-area / タップハイライト抑制 / 100dvh 対応

### 公開手順

1. **公開ホスティングが必要** (PWAは https 必須、file:// では動かない)
   - 推奨: **GitHub Pages** (無料、簡単)
   - 代替: Netlify / Vercel / Cloudflare Pages (すべて無料枠あり)

2. **GitHub Pages の例** (Mac不要、Windowsだけで完結):
   ```bash
   # GitHubでpublic repoを作成 (例: inasaku-game)
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/<user>/inasaku-game.git
   git push -u origin main
   # GitHub.com でリポジトリ → Settings → Pages → Branch: main / (root) → Save
   ```
   数分で `https://<user>.github.io/inasaku-game/` で公開される。

3. **iPhone から:**
   - Safari でそのURLを開く
   - 共有ボタン → 「ホーム画面に追加」
   - アイコンが追加され、タップで全画面起動

4. **Android から:**
   - Chrome でURLを開く
   - 「アプリをインストール」のバナーが出るか、メニュー → 「アプリをインストール」
   - ホーム画面に追加され、ネイティブ風にウィンドウ起動

### PWAでできること / できないこと

| できる | 制限あり |
|---|---|
| ✅ ホーム画面アイコン | ❌ プッシュ通知 (iOS の制限) |
| ✅ オフラインプレイ (sw.js キャッシュ) | ❌ App Store 検索ヒット |
| ✅ localStorage によるセーブ | ❌ 50MB超のキャッシュは不安定 |
| ✅ PDF 取り込み機能 | ⚠️ iOS は Safari ベースなので Chrome 機能の一部不可 |
| ✅ クイズ・収穫・アップグレード全機能 | ⚠️ "Add to Home Screen" は手動操作 |

### 動作確認方法 (公開前)

ローカルでテストする場合は HTTPS が必要。`mkcert` で自己証明書を立てるか、
PyInstaller製 .exe からアクセスし、Service Worker のコンソールログを確認:
```
[sw] registered, scope: http://127.0.0.1:53151/
```

---

## D. iOS App Store 配布 (Capacitor + Mac)

App Store に出すならネイティブシェルが必要。**Capacitor** で既存のWebコードをそのまま包める。

### 必要環境
- **Mac** (macOS) — App Store ビルドはMac必須
- **Xcode** (App Store 無料)
- **Apple Developer Program** ($99/年) — 配布する場合に必要
- **Node.js** + **npm**
- **CocoaPods** (`sudo gem install cocoapods`)

### セットアップ手順 (Mac で実行)

```bash
# プロジェクトルートで
npm init -y
npm install --save @capacitor/core @capacitor/cli
npm install --save @capacitor/ios

# Capacitor 初期化
npx cap init "稲作のことば" com.example.inasaku --web-dir=.

# 既存 index.html などはそのまま使う
# capacitor.config.json を編集して webDir を "." に

# iOS プロジェクト追加
npx cap add ios

# Web 資産を iOS プロジェクトに同期
npx cap sync ios

# Xcode を開く
npx cap open ios
# → Xcode で署名設定 (Team) → 実機 or シミュレータで Run
```

### App Store 提出時の追加作業
- アプリアイコン (1024x1024 必須) — 既存の `icon-512.png` から拡大生成
- スプラッシュスクリーン (`@capacitor/splash-screen` プラグイン)
- プライバシーポリシーURL
- スクリーンショット数枚 (iPhone/iPad サイズ)
- App Store Connect で説明文・カテゴリ等
- レビュー (通常 24-72 時間)

### サイドロード (個人利用、Apple Developer 不要)

App Store には出さず手元の iPhone で遊ぶだけなら:
- Free Apple ID で Xcode 経由でビルド・実機転送可能
- ただし **7日で署名失効**、その都度再インストール
- 自分や家族用には十分

---

## E. Android Play Store (Capacitor)

iOS と同じ Capacitor 構成。Mac 不要、Windows でビルド可能。

```bash
npm install --save @capacitor/android
npx cap add android
npx cap sync android
npx cap open android  # Android Studio が開く
```

- Android Studio で APK / AAB をビルド
- Google Play Console (一回 $25) で公開
- もしくはサイドロード可能 (apk直接配布)

---

## F. Tauri / Electron (将来検討)

### Tauri (推奨だが Rust 必須)

軽量 (5-15MB) で見た目もネイティブアプリ。WebView2 (Windows) を使う。

```bash
# 前提: rustup で Rust toolchain インストール済み + Node.js
npm create tauri-app
# tauri.conf.json で distDir を ../ に、devPath を ../index.html に設定
npm run tauri build
```

成果物は MSI/EXE インストーラ。

### Electron (簡単だが重い)

Chrome 同梱で 100-200MB。マルチプラットフォーム配布が容易。

```bash
npm init -y
npm install electron --save-dev
# main.js を作成し BrowserWindow で index.html をロード
npx electron-packager . InasakuGame --platform=win32 --arch=x64
```

### Pake (Tauri ベースのお手軽 CLI)

URL や ローカルディレクトリから即 .exe を作る。Rust と Node が必要。

```bash
npm install -g pake-cli
pake ./index.html --name InasakuGame --icon icon.ico
```

これらは将来「ちゃんとアプリ感」を出したいときに検討。

---

## 配布前チェックリスト

- [ ] localStorage はプレイヤーごとに分離される (PC共有ならOK)
- [ ] dist/InasakuGame.exe が起動して自動でブラウザが開く
- [ ] PDF インポート機能が動く (`pdf.js worker` が同梱されているか)
- [ ] 主要画面 (タイトル/学ぶ/田んぼ/ショップ/図鑑/PDF/ヘルプ/設定) すべて遷移可能
- [ ] チュートリアルが初回のみ表示される
- [ ] アンチウイルスで誤検知されないか VirusTotal で確認

## 受け手への README 文例

> 🌾 稲作のことば(.exe版) を入れていただきありがとうございます。
>
> **遊び方:**
> 1. `InasakuGame.exe` をダブルクリック
> 2. 黒いコンソールウィンドウが開きます (閉じないでください)
> 3. ブラウザが自動で開いてゲームが始まります
> 4. やめるときはコンソールウィンドウを閉じてください
>
> **初回起動で警告が出たら:**
> Windows SmartScreen で「Windows によって PC が保護されました」と出る場合、
> 「詳細情報」 → 「実行」 をクリックしてください。
> 私が個人で作ったため、Microsoft への署名登録（年間数万円）をしていません。
>
> **データは `C:\Users\<あなたの名前>\AppData\Local\...` に保存されます (ブラウザのlocalStorage経由)。**
> ブラウザを変えると進行状況も変わります。

