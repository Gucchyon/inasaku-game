"""PWA / iOS / Android で使う各種アイコンを生成する.

ピクセルアート風の稲穂を描画 (assets/sprites/rice/ の Stage 5 に近いデザイン).
出力先: assets/icons/icon-{size}.png
"""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).parent.parent / "assets" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

# 16x16 のドット絵としてデザインしてからスケール
# (色は farm.css と整合)
PALETTE = {
    'bg':       (224, 240, 195),    # 淡い緑（背景）
    'bg_dark':  (164, 200, 135),    # 濃い緑(影)
    'rim':      (47, 125, 50),      # 緑の縁
    'soil':     (140, 90, 40),      # 土
    'stem':     (160, 136, 32),     # 茎(黄金色になりかけ)
    'stem_dk':  (138, 114, 24),
    'grain':    (251, 191, 36),     # 籾(金色)
    'grain_lo': (226, 168, 17),
    'grain_hl': (254, 243, 199),    # ハイライト
    'sparkle':  (255, 255, 255),    # キラキラ
    'shadow':   (60, 80, 40),
}

# 16x16 グリッドで稲穂を描画 (assets/sprites/rice の stage 5 を参考)
GRID = [
    "................",
    "..s.............",
    "..............s.",
    "....g g....g g..",
    "...gGGgg..gGGgg.",
    "...gGGg G gGGg..",
    "....gg ggg gg...",
    "......gMMg......",
    "......gMMg.....s",
    "......gMMg......",
    ".s....gMMg......",
    "......gMMg......",
    "......gMMg......",
    "...DDDgMMgDDD...",
    "...d d d d d d..",
    "................",
]

COLOR_MAP = {
    '.': PALETTE['bg'],
    's': PALETTE['sparkle'],
    'g': PALETTE['grain_lo'],
    'G': PALETTE['grain'],
    'H': PALETTE['grain_hl'],
    'M': PALETTE['stem'],
    'm': PALETTE['stem_dk'],
    'D': PALETTE['soil'],
    'd': PALETTE['shadow'],
}


def make_logical_image(grid, with_bg=True):
    """16x16 のロジカル画像を返す."""
    img = Image.new('RGBA', (16, 16), PALETTE['bg'] if with_bg else (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            if ch == '.' and not with_bg:
                continue
            color = COLOR_MAP.get(ch, PALETTE['bg'])
            if len(color) == 3:
                color = color + (255,)
            px[x, y] = color
    return img


def add_rounded_corners(img, radius_ratio=0.18):
    """iOS 風の角丸を当てる."""
    w, h = img.size
    radius = int(min(w, h) * radius_ratio)
    mask = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def render_size(size, rounded=False):
    base = make_logical_image(GRID, with_bg=True)
    # 整数倍スケールにできるサイズへ最近傍で拡大 (16の倍数を目指す)
    img = base.resize((size, size), Image.NEAREST)
    if rounded:
        img = add_rounded_corners(img, 0.22)
    return img


# === 出力 ===
sizes = [
    (192, "icon-192.png", False),
    (256, "icon-256.png", False),
    (384, "icon-384.png", False),
    (512, "icon-512.png", False),
    # iOS apple-touch-icon (角丸はiOS側でかかるので不要、ただし用意)
    (180, "apple-touch-icon.png", False),
    (167, "apple-touch-icon-167.png", False),
    (152, "apple-touch-icon-152.png", False),
    (120, "apple-touch-icon-120.png", False),
    # マスカブル (背景あり、安全領域確保)
    (512, "icon-maskable-512.png", False),
    # favicon
    (32, "favicon-32.png", False),
    (16, "favicon-16.png", False),
]

for size, name, rounded in sizes:
    img = render_size(size, rounded)
    img.save(OUT / name, "PNG")
    print(f"saved {name} ({size}x{size})")

print("Done.")
