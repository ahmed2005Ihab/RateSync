<script setup>
import { ref, onMounted } from "vue";
import { store } from "./store.js";

import LiveMarkets from "./components/LiveMarkets.vue";
import ConverterCard from "./components/ConverterCard.vue";
import HistoryTab from "./components/HistoryTab.vue";
import CompareTab from "./components/CompareTab.vue";
import FavoritesTab from "./components/FavoritesTab.vue";
import LogTab from "./components/LogTab.vue";

const activeTab = ref("history");
const setTab = (tabName) => {
  activeTab.value = tabName;
};

onMounted(() => {
  store.fetchLiveRates();
});
</script>

<template>
  <div class="app-container">
    <div class="header">
      <img class="logo" src="/assets/images/logo.svg" />
      <span class="header-text"
        >150 CURRENCIES · DAILY · ECB & MARKET DATA</span
      >
    </div>

    <LiveMarkets />

    <div class="content">
      <ConverterCard />

      <div class="details-container">
        <div class="desktop-tab">
          <div
            class="desktop-btn-box"
            :class="{ active: activeTab === 'history' }"
            @click="setTab('history')"
          >
            <button class="destopk-btn-setting">
              <span class="btn-label">HISTORY</span>
            </button>
            <div class="underline-btn"></div>
          </div>

          <div
            class="desktop-btn-box"
            :class="{ active: activeTab === 'compare' }"
            @click="setTab('compare')"
          >
            <button class="destopk-btn-setting">
              <span class="btn-label">COMPARE</span>
            </button>
            <div class="underline-btn"></div>
          </div>

          <div
            class="desktop-btn-box"
            :class="{ active: activeTab === 'favorites' }"
            @click="setTab('favorites')"
          >
            <button class="destopk-btn-setting">
              <span class="btn-label">FAVORITES</span>
              <span v-if="store.favorites.length > 0" class="tab-badge">{{
                store.favorites.length
              }}</span>
            </button>
            <div class="underline-btn"></div>
          </div>

          <div
            class="desktop-btn-box"
            :class="{ active: activeTab === 'log' }"
            @click="setTab('log')"
          >
            <button class="destopk-btn-setting">
              <span class="btn-label">LOG</span>
              <span v-if="store.logs.length > 0" class="tab-badge">{{
                store.logs.length
              }}</span>
            </button>
            <div class="underline-btn"></div>
          </div>
        </div>

        <div class="tabs-content-area" style="width: 100%">
          <HistoryTab v-if="activeTab === 'history'" />
          <CompareTab v-if="activeTab === 'compare'" />
          <FavoritesTab v-if="activeTab === 'favorites'" />
          <LogTab v-if="activeTab === 'log'" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.desktop-btn-box {
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  cursor: pointer;
  padding: 4px 8px !important;
  margin: 0 2px !important;
}

.desktop-btn-box:hover {
  border: 1px solid #d4e932 !important;

  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}

.desktop-btn-box:active {
  transform: scale(0.95) !important;
}

.desktop-btn-box:hover .underline-btn {
  opacity: 0.5;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #d4e932;
  color: #111;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 8px;
}
</style>
