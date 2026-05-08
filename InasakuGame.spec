# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for 稲作のことば
# 使い方: pyinstaller --clean InasakuGame.spec
import os

block_cipher = None

# ゲームのルートディレクトリ
ROOT = os.path.abspath(os.path.dirname("__file__"))

# game/ サブディレクトリ配下に同梱するファイル群
# (src_path, dest_path)
DATAS = [
    ("index.html",         "game"),
    ("README.md",          "game"),
    ("css",                "game/css"),
    ("js",                 "game/js"),
    ("assets",             "game/assets"),
]

a = Analysis(
    ["launcher.py"],
    pathex=[],
    binaries=[],
    datas=DATAS,
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="InasakuGame",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,         # ターミナルが見える方が「サーバ動作中」と分かりやすい
    icon=None,            # アイコンは将来対応
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
