// ショップ：アイテム・品種購入
window.Shop = (function () {
  function buyItem(itemId) {
    const item = window.ITEMS.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: "not_found" };
    const s = State.get();
    if (s.player.grain < item.price) return { ok: false, reason: "no_grain" };
    State.set(state => {
      state.player.grain -= item.price;
      state.inventory[itemId] = (state.inventory[itemId] || 0) + 1;
      return state;
    });
    return { ok: true, item };
  }

  function buyVariety(varietyId) {
    const v = window.VARIETIES.find(x => x.id === varietyId);
    if (!v) return { ok: false, reason: "not_found" };
    const s = State.get();
    if (s.collection.varieties[varietyId] && s.collection.varieties[varietyId].unlocked) {
      return { ok: false, reason: "already_unlocked" };
    }
    if (!v.price || v.price <= 0) return { ok: false, reason: "not_for_sale" };
    if (s.player.grain < v.price) return { ok: false, reason: "no_grain" };
    State.set(state => {
      state.player.grain -= v.price;
      if (!state.collection.varieties[varietyId]) {
        state.collection.varieties[varietyId] = { unlocked: true, harvests: 0 };
      } else {
        state.collection.varieties[varietyId].unlocked = true;
      }
      return state;
    });
    return { ok: true, variety: v };
  }

  function isVarietyUnlocked(varietyId) {
    const s = State.get();
    return !!(s.collection.varieties[varietyId] && s.collection.varieties[varietyId].unlocked);
  }

  // condition判定（achievementから自動アンロックされる用）
  function checkVarietyUnlocks() {
    State.set(s => {
      for (const v of window.VARIETIES) {
        if (s.collection.varieties[v.id] && s.collection.varieties[v.id].unlocked) continue;
        if (!v.unlock) {
          // null = 初期解放
          s.collection.varieties[v.id] = { unlocked: true, harvests: 0 };
          continue;
        }
        const u = v.unlock;
        let met = false;
        if (u.type === "total_correct" && s.player.totalCorrect >= u.value) met = true;
        if (u.type === "category_correct") {
          const target = u.value;
          let n = 0;
          for (const id in s.srs) {
            const w = window.VOCAB.find(x => x.id === id);
            if (w && w.category === target.category && s.srs[id].correctCount > 0) {
              n += s.srs[id].correctCount;
            }
          }
          if (n >= target.count) met = true;
        }
        if (u.type === "achievement") {
          if (s.collection.achievements && s.collection.achievements[u.value]) met = true;
        }
        if (u.type === "shop_after") {
          const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
          if (totalH >= (u.value.harvest || 0)) {
            // ショップに表示されるが unlock 済みではなく、購入可能フラグだけ立てる
            // 実装簡略のため何もしない（shop_view 側で判定）
          }
        }
        if (met) {
          s.collection.varieties[v.id] = { unlocked: true, harvests: 0 };
        }
      }
      return s;
    });
  }

  function listShopVarieties() {
    const s = State.get();
    return window.VARIETIES.filter(v => {
      if (!v.unlock) return false;
      if (v.unlock.type === "shop") return true;
      if (v.unlock.type === "shop_after") {
        const totalH = s.fields.reduce((a, f) => a + (f.harvestCount || 0), 0);
        return totalH >= (v.unlock.value.harvest || 0);
      }
      return false;
    });
  }

  return { buyItem, buyVariety, isVarietyUnlocked, checkVarietyUnlocks, listShopVarieties };
})();
