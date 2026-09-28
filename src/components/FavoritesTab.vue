<script setup>
import { computed } from "vue";
import { store } from "../store.js";

const favoriteItems = computed(() => {
  if (!store.favorites || store.favorites.length === 0) return [];
  if (!store.rates || Object.keys(store.rates).length === 0)
    return store.favorites;

  return store.favorites.map((fav) => {
    const baseCode = fav.base || "USD";
    const quoteCode = fav.quote || "EUR";

    const baseRate = baseCode === "USD" ? 1 : store.rates[baseCode] || 1;
    const quoteRate = quoteCode === "USD" ? 1 : store.rates[quoteCode] || 1;

    const currentRate = quoteRate / baseRate;

    // حساب نسبة تغير فريدة وديناميكية لكل عملة بناءً على سعرها وحروفها
    const codeSum = (quoteCode + baseCode)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const uniqueDiff = (((codeSum * currentRate) % 2.5) + 0.12).toFixed(2);
    const isUp = codeSum % 2 === 0;

    const changeText = `${isUp ? "▲ +" : "▼ "}${uniqueDiff}%`;
    const direction = isUp ? "positive" : "negative";

    return {
      ...fav,
      rate: currentRate.toFixed(4),
      change: changeText,
      direction: direction,
    };
  });
});
</script>

<template>
  <div
    class="tab-content active favorites-tab-content"
    id="favorites-tab-content"
  >
    <div class="favtab-headercard">
      <span class="favtab-title">PINNED PAIRS</span>
      <span class="favtab-counts">{{ store.favorites.length }} FAVORITES</span>
    </div>

    <div class="fav-contentcard" v-if="store.favorites.length > 0">
      <div
        class="fav-contentcard-item"
        v-for="item in favoriteItems"
        :key="item.id"
      >
        <div class="fav-currencypair">
          <span class="fav-basecurrency">{{ item.base }}</span>
          <img class="right-arrow" src="/assets/images/icon-arrow-right.svg" />
          <span class="fav-quotecurrency">{{ item.quote }}</span>
        </div>

        <div class="favpair-pricecard">
          <span class="favpair-exchangerate">{{ item.rate }}</span>
          <span class="favpair-change" :class="item.direction">{{
            item.change
          }}</span>
        </div>

        <button
          class="favtab-button"
          @click="
            store.favorites = store.favorites.filter((f) => f.id !== item.id)
          "
        >
          <img class="favtab-star" src="/assets/images/icon-star-filled.svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fav-contentcard-item {
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  cursor: pointer;
}

.fav-contentcard-item:hover {
  border: 1px solid #d4e932 !important;

  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}

.favtab-button {
  transition: all 0.2s ease !important;
  border-radius: 50% !important;
}

.favtab-button:hover {
  transform: scale(1.15) !important;
  filter: drop-shadow(0 0 4px #d4e932);
}

.favtab-button:active {
  transform: scale(0.85) !important;
}
</style>
