// 稲の成長段階スプライト（16×16 pixel-art SVG, インライン）
// shape-rendering="crispEdges" + 整数座標でドット感を保つ
// CSS で transform: scale() してサイズ調整可能
window.RICE_SPRITES = {
  // Stage 0 — 種 (seed): 茶色の籾 in 水面
  0: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="9" width="4" height="2" fill="#7a4a1f"/>
    <rect x="5" y="10" width="6" height="2" fill="#8a5527"/>
    <rect x="6" y="11" width="4" height="1" fill="#5a3915"/>
    <rect x="7" y="9" width="2" height="1" fill="#a36b30"/>
  </svg>`,

  // Stage 1 — 苗 (seedling): 小さな緑芽
  1: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="13" width="2" height="2" fill="#5c3a18"/>
    <rect x="7" y="6" width="1" height="7" fill="#5fa83a"/>
    <rect x="8" y="6" width="1" height="7" fill="#4a8a2a"/>
    <rect x="6" y="4" width="1" height="3" fill="#7bc24f"/>
    <rect x="9" y="3" width="1" height="3" fill="#7bc24f"/>
    <rect x="7" y="2" width="1" height="2" fill="#a8de75"/>
  </svg>`,

  // Stage 2 — 分げつ (tillering): 複数の茎
  2: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="3" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="11" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="7" y="5" width="1" height="9" fill="#4a8a2a"/>
    <rect x="8" y="5" width="1" height="9" fill="#3a7d2a"/>
    <rect x="3" y="7" width="1" height="7" fill="#4a8a2a"/>
    <rect x="4" y="7" width="1" height="7" fill="#3a7d2a"/>
    <rect x="11" y="7" width="1" height="7" fill="#4a8a2a"/>
    <rect x="12" y="7" width="1" height="7" fill="#3a7d2a"/>
    <rect x="6" y="3" width="1" height="3" fill="#5fa83a"/>
    <rect x="9" y="2" width="1" height="3" fill="#5fa83a"/>
    <rect x="2" y="5" width="1" height="3" fill="#5fa83a"/>
    <rect x="13" y="5" width="1" height="3" fill="#5fa83a"/>
  </svg>`,

  // Stage 3 — 出穂 (heading): 穂が出てきた
  3: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="3" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="11" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="7" y="3" width="1" height="11" fill="#4a8a2a"/>
    <rect x="8" y="3" width="1" height="11" fill="#3a7d2a"/>
    <rect x="3" y="5" width="1" height="9" fill="#4a8a2a"/>
    <rect x="4" y="5" width="1" height="9" fill="#3a7d2a"/>
    <rect x="11" y="5" width="1" height="9" fill="#4a8a2a"/>
    <rect x="12" y="5" width="1" height="9" fill="#3a7d2a"/>
    <!-- 穂 -->
    <rect x="6" y="1" width="1" height="2" fill="#9bc858"/>
    <rect x="7" y="0" width="2" height="3" fill="#bcd87a"/>
    <rect x="9" y="1" width="1" height="2" fill="#9bc858"/>
    <rect x="2" y="3" width="1" height="2" fill="#9bc858"/>
    <rect x="3" y="2" width="2" height="3" fill="#bcd87a"/>
    <rect x="5" y="3" width="1" height="2" fill="#9bc858"/>
    <rect x="10" y="3" width="1" height="2" fill="#9bc858"/>
    <rect x="11" y="2" width="2" height="3" fill="#bcd87a"/>
    <rect x="13" y="3" width="1" height="2" fill="#9bc858"/>
  </svg>`,

  // Stage 4 — 登熟 (ripening): 黄金色に染まりつつある
  4: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="3" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="11" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="7" y="3" width="1" height="11" fill="#7a8330"/>
    <rect x="8" y="3" width="1" height="11" fill="#6a7028"/>
    <rect x="3" y="5" width="1" height="9" fill="#7a8330"/>
    <rect x="4" y="5" width="1" height="9" fill="#6a7028"/>
    <rect x="11" y="5" width="1" height="9" fill="#7a8330"/>
    <rect x="12" y="5" width="1" height="9" fill="#6a7028"/>
    <!-- 黄金の穂 -->
    <rect x="6" y="2" width="1" height="2" fill="#d4a82d"/>
    <rect x="7" y="0" width="2" height="3" fill="#f5c544"/>
    <rect x="9" y="2" width="1" height="2" fill="#d4a82d"/>
    <rect x="2" y="4" width="1" height="2" fill="#d4a82d"/>
    <rect x="3" y="2" width="2" height="3" fill="#f5c544"/>
    <rect x="5" y="4" width="1" height="2" fill="#d4a82d"/>
    <rect x="10" y="4" width="1" height="2" fill="#d4a82d"/>
    <rect x="11" y="2" width="2" height="3" fill="#f5c544"/>
    <rect x="13" y="4" width="1" height="2" fill="#d4a82d"/>
    <!-- 籾粒 -->
    <rect x="7" y="3" width="1" height="1" fill="#fde890"/>
    <rect x="3" y="3" width="1" height="1" fill="#fde890"/>
    <rect x="11" y="3" width="1" height="1" fill="#fde890"/>
  </svg>`,

  // Stage 5 — 収穫可 (harvestable): 完熟、輝き
  5: `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="3" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="11" y="14" width="2" height="1" fill="#5c3a18"/>
    <rect x="7" y="4" width="1" height="10" fill="#a08820"/>
    <rect x="8" y="4" width="1" height="10" fill="#8a7218"/>
    <rect x="3" y="6" width="1" height="8" fill="#a08820"/>
    <rect x="4" y="6" width="1" height="8" fill="#8a7218"/>
    <rect x="11" y="6" width="1" height="8" fill="#a08820"/>
    <rect x="12" y="6" width="1" height="8" fill="#8a7218"/>
    <!-- 重く垂れた金穂 -->
    <rect x="6" y="3" width="1" height="2" fill="#e2a811"/>
    <rect x="7" y="1" width="2" height="3" fill="#fbbf24"/>
    <rect x="9" y="3" width="1" height="2" fill="#e2a811"/>
    <rect x="2" y="5" width="1" height="2" fill="#e2a811"/>
    <rect x="3" y="3" width="2" height="3" fill="#fbbf24"/>
    <rect x="5" y="5" width="1" height="2" fill="#e2a811"/>
    <rect x="10" y="5" width="1" height="2" fill="#e2a811"/>
    <rect x="11" y="3" width="2" height="3" fill="#fbbf24"/>
    <rect x="13" y="5" width="1" height="2" fill="#e2a811"/>
    <!-- ハイライト -->
    <rect x="7" y="2" width="1" height="1" fill="#fef3c7"/>
    <rect x="3" y="4" width="1" height="1" fill="#fef3c7"/>
    <rect x="11" y="4" width="1" height="1" fill="#fef3c7"/>
    <!-- キラキラ -->
    <rect x="1" y="1" width="1" height="1" fill="#ffffff"/>
    <rect x="14" y="2" width="1" height="1" fill="#ffffff"/>
    <rect x="0" y="8" width="1" height="1" fill="#ffffff"/>
    <rect x="15" y="9" width="1" height="1" fill="#ffffff"/>
  </svg>`
};
