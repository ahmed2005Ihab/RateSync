<script setup>
import { ref, computed } from "vue";
import { store } from "../store.js";
import CurrencySelector from "./CurrencySelector.vue";

const convertedAmount = computed({
  get() {
    if (!store.rates || !store.amount) return "";
    const baseRate =
      store.baseCurrency === "USD" ? 1 : store.rates[store.baseCurrency];
    const targetRate =
      store.targetCurrency === "USD" ? 1 : store.rates[store.targetCurrency];
    if (!baseRate || !targetRate) return "";
    return Number(((store.amount / baseRate) * targetRate).toFixed(4));
  },
  set(newValue) {
    if (!store.rates || newValue === "" || newValue === null) {
      store.amount = "";
      return;
    }
    const baseRate =
      store.baseCurrency === "USD" ? 1 : store.rates[store.baseCurrency];
    const targetRate =
      store.targetCurrency === "USD" ? 1 : store.rates[store.targetCurrency];
    if (!baseRate || !targetRate) return;
    store.amount = Number(((newValue / targetRate) * baseRate).toFixed(4));
  },
});

const exchangeRateText = computed(() => {
  if (!store.rates) return "Loading rates...";
  const baseRate =
    store.baseCurrency === "USD" ? 1 : store.rates[store.baseCurrency];
  const targetRate =
    store.targetCurrency === "USD" ? 1 : store.rates[store.targetCurrency];
  if (!baseRate || !targetRate) return "";
  return `1 ${store.baseCurrency} = ${(targetRate / baseRate).toFixed(4)} ${store.targetCurrency}`;
});

const swapCurrencies = () => {
  const temp = store.baseCurrency;
  store.baseCurrency = store.targetCurrency;
  store.targetCurrency = temp;
};

const showFavToast = ref(false);
const favToastMsg = ref("");

const showLogToast = ref(false);
const logToastMsg = ref("");

const addToFavorites = () => {
  const existsIndex = store.favorites.findIndex(
    (f) => f.base === store.baseCurrency && f.quote === store.targetCurrency,
  );

  if (existsIndex !== -1) {
    store.favorites.splice(existsIndex, 1);
    favToastMsg.value = "Removed from favorites.";
  } else {
    const baseRate =
      store.baseCurrency === "USD" ? 1 : store.rates[store.baseCurrency];
    const targetRate =
      store.targetCurrency === "USD" ? 1 : store.rates[store.targetCurrency];
    const rate = (targetRate / baseRate).toFixed(4);

    store.favorites.push({
      id: Date.now(),
      base: store.baseCurrency,
      quote: store.targetCurrency,
      rate: rate,
      change: "▲ +0.16%",
      direction: "positive",
    });
    favToastMsg.value = "Added to favorites.";
  }

  showFavToast.value = true;
  setTimeout(() => (showFavToast.value = false), 2000);
};

const logConversion = () => {
  const sendAmountStr = store.amount.toLocaleString();

  const exists = store.logs.find(
    (l) =>
      l.base === store.baseCurrency &&
      l.quote === store.targetCurrency &&
      l.sendAmount === sendAmountStr,
  );

  if (exists) {
    logToastMsg.value = "This conversion is already in your log.";
  } else {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    store.logs.push({
      id: Date.now(),
      date: date,
      base: store.baseCurrency,
      quote: store.targetCurrency,
      sendAmount: sendAmountStr,
      receiveAmount: convertedAmount.value.toLocaleString(),
    });
    logToastMsg.value = "Conversion saved.";
  }

  showLogToast.value = true;
  setTimeout(() => (showLogToast.value = false), 2500);
};
</script>

<template>
  <div class="converter-wraper">
    <span class="converter-title">CHECK THE RATE</span>
    <div class="converter-section">
      <div class="top-container">
        <div class="converter-container">
          <span class="text-converter">SEND</span>
          <div class="amount-container">
            <div class="input-section">
              <input
                v-model.number="store.amount"
                class="send-input convert-input"
                type="number"
                placeholder="0.00"
              />
              <div class="underline"></div>
            </div>
            <CurrencySelector
              v-model="store.baseCurrency"
              dropdownType="send"
            />
          </div>
        </div>

        <div class="exchange-btn" @click="swapCurrencies">
          <button class="exchnge-btn" type="button"></button>
        </div>

        <div class="converter-container">
          <span class="text-converter">RECEIVE</span>
          <div class="amount-container">
            <div class="input-section">
              <input
                v-model.number="convertedAmount"
                class="receive-input convert-input"
                type="number"
                placeholder="0.00"
              />
              <div class="underline"></div>
            </div>
            <CurrencySelector
              v-model="store.targetCurrency"
              dropdownType="receive"
            />
          </div>
        </div>
      </div>

      <div class="converter-bottom">
        <span class="exchange-rates">{{ exchangeRateText }}</span>
        <div class="btn-bottom" style="display: flex; gap: 15px">
          <div style="position: relative">
            <button class="fav-btn" @click="addToFavorites">
              <img class="star-img" src="/assets/images/icon-star.svg" />
              <span class="fav-text">FAVORITED</span>
            </button>
            <transition name="fade">
              <div v-if="showFavToast" class="toast-msg">{{ favToastMsg }}</div>
            </transition>
          </div>

          <div style="position: relative">
            <button class="btn-log-conversion" @click="logConversion">
              <span class="log-text">LOG CONVERSION</span>
            </button>
            <transition name="fade">
              <div v-if="showLogToast" class="toast-msg">{{ logToastMsg }}</div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.fav-btn {
  background-color: transparent !important;
  border: 1px solid #444 !important;
  color: #fff !important;
  transition: all 0.3s ease !important;
}
.fav-btn:hover {
  background-color: #d4e932 !important;
  border-color: #d4e932 !important;
  color: #111 !important;
}
.fav-btn:hover .star-img {
  filter: brightness(0) !important;
}
.fav-btn:active {
  transform: scale(0.95) !important;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

.btn-log-conversion {
  background-color: #d4e932 !important;
  border: 1px solid #d4e932 !important;
  color: #111 !important;
  transition: all 0.3s ease !important;
}
.btn-log-conversion:hover {
  background-color: transparent !important;
  color: #d4e932 !important;
}
.btn-log-conversion:active {
  transform: scale(0.95) !important;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3) !important;
}

.exchange-btn:hover .exchnge-btn {
  border-color: #d4e932 !important;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.4) !important;
  cursor: pointer;
}
.exchange-btn:active .exchnge-btn {
  transform: scale(0.9) !important;
}

.toast-msg {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(30, 35, 41, 0.9);
  border: 1px solid #d4e932;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}
</style>
