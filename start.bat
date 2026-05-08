@echo off
REM ===========================================================
REM  稲作のことば — Python が入っているマシン用の起動スクリプト
REM ===========================================================
REM Python 3 が PATH にあれば、これをダブルクリックするだけで
REM ローカルサーバが立ち上がってブラウザでゲームが開きます。
REM Python が無い人には dist/InasakuGame.exe を渡してください。
REM ===========================================================

cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python が見つかりません。dist/InasakuGame.exe を使ってください。
  pause
  exit /b 1
)

echo === 稲作のことば 起動中 ===
echo  ブラウザで http://127.0.0.1:53151/index.html を開きます
echo  このウィンドウを閉じると停止します。
echo ============================

start "" http://127.0.0.1:53151/index.html
python -m http.server 53151 --bind 127.0.0.1
