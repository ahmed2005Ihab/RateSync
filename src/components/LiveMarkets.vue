<script setup>
import { computed } from "vue";
import { store } from "../store.js";

const marketList = computed(() => {
  if (!store.rates || Object.keys(store.rates).length === 0) return [];

  const codes = ["EUR", "JPY", "GBP", "CHF", "AUD", "CAD", "CNY", "NZD"];

  return codes
    .map((code) => {
      const rate = store.rates[code] || 0;

      const change = (Math.random() * 0.5 - 0.25).toFixed(2);
      const direction = change >= 0 ? "positive" : "negative";

      return {
        pair: `USD/${code}`,
        rate: rate > 0 ? rate.toFixed(4) : "--",
        changes: change,
        direction: direction,
      };
    })
    .filter((item) => item.rate !== "--");
});
</script>

<template>
  <div class="livemarkets">
    <div class="livemarket-box">
      <div class="dot"></div>
      <span class="live-text live-font">LIVE MARKETS</span>
    </div>

    <div class="livemarket-container">
      <div
        class="live-container-wraper marquee-animation"
        v-if="marketList.length > 0"
      >
        <div
          class="liverates"
          v-for="(item, index) in marketList"
          :key="'a-' + index"
        >
          <span class="currency-pair live-font">{{ item.pair }}</span>
          <span class="exchange-rate live-font">{{ item.rate }}</span>
          <span class="exchange-rate-change live-font" :class="item.direction">
            {{ item.direction === "positive" ? "▲ +" : "▼ "
            }}{{ item.changes }}%
          </span>
        </div>

        <div
          class="liverates"
          v-for="(item, index) in marketList"
          :key="'b-' + index"
        >
          <span class="currency-pair live-font">{{ item.pair }}</span>
          <span class="exchange-rate live-font">{{ item.rate }}</span>
          <span class="exchange-rate-change live-font" :class="item.direction">
            {{ item.direction === "positive" ? "▲ +" : "▼ "
            }}{{ item.changes }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.marquee-animation {
  display: flex;
  gap: 15px;
  white-space: nowrap;
  width: max-content;
  animation: ticker-move 60s linear infinite;
}

@keyframes ticker-move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
