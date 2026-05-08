/* eslint-disable */
// Service Worker — 稲作のことば
// オフラインで遊べるよう、初回ロード時に主要アセットをプリキャッシュする。
// 更新時は CACHE_NAME を変えれば古いキャッシュを破棄する。

const CACHE_NAME = "cswb-v3-2026-05-09";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  // CSS
  "./css/reset.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/farm.css",
  "./css/animations.css",
  // データ
  "./js/data/vocabulary.js",
  "./js/data/vocabulary_dict_import.js",
  "./js/data/vocabulary_textbooks.js",
  "./js/data/vocabulary_papers_en.js",
  "./js/data/vocab_dedup.js",
  "./js/data/varieties.js",
  "./js/data/items.js",
  "./js/data/events_table.js",
  "./js/data/achievements.js",
  "./js/data/balance.js",
  "./js/data/upgrades.js",
  "./js/data/rice_sprites.js",
  // コアロジック
  "./js/state.js",
  "./js/storage.js",
  "./js/upgrades.js",
  "./js/prestige.js",
  "./js/quiz.js",
  "./js/farm.js",
  "./js/events.js",
  "./js/shop.js",
  "./js/achievements.js",
  "./js/daily.js",
  "./js/pdf_import.js",
  // pdf.js
  "./assets/lib/pdf.min.js",
  "./assets/lib/pdf.worker.min.js",
  // UI
  "./js/ui/toast.js",
  "./js/ui/modal.js",
  "./js/ui/quiz_view.js",
  "./js/ui/farm_view.js",
  "./js/ui/upgrade_view.js",
  "./js/ui/shop_view.js",
  "./js/ui/collection_view.js",
  "./js/ui/pdf_view.js",
  "./js/ui/render.js",
  "./js/main.js",
  // アイコン
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
  // すぐ新しい SW を有効化
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE).catch(err => {
        // 一部ファイルが取れなくても、取れたものはキャッシュする
        console.warn("[sw] partial precache failure:", err);
      })
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // GET 以外はパス
  if (req.method !== "GET") return;
  // 同一オリジンのみキャッシュ戦略を適用
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // バックグラウンドで更新も試みる (stale-while-revalidate)
        fetch(req).then((res) => {
          if (res && res.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      // キャッシュ無し: ネットワーク → 成功したらキャッシュ
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => {
        // 完全オフラインで、キャッシュも無い場合
        return new Response("オフラインです。ネット接続後に再読み込みしてください。", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      });
    })
  );
});
