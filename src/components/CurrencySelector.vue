<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { store } from "../store.js";

const props = defineProps({
  modelValue: String,
  dropdownType: String,
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const searchQuery = ref("");
const popularCodes = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "NZD",
  "SGD",
];
const getLocalFlag = (country) => {
  if (!country) return "";
  if (typeof country === "object" && country.flagUrl) {
    return country.flagUrl;
  }
  const found = store.countries.find(
    (c) => c.currency === country || c.name === country,
  );
  return found ? found.flagUrl : "";
};

const currentFlag = computed(() => getLocalFlag(props.modelValue));

const filteredCurrencies = computed(() => {
  if (!store.countries) return [];
  let list = store.countries;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    return list.filter(
      (c) =>
        c.currency.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)),
    );
  }
  return list;
});

const popularCurrenciesList = computed(() => {
  return filteredCurrencies.value.filter((c) =>
    popularCodes.includes(c.currency),
  );
});

const otherCurrenciesList = computed(() => {
  return filteredCurrencies.value.filter(
    (c) => !popularCodes.includes(c.currency),
  );
});

const selectCurrency = (code) => {
  emit("update:modelValue", code);
  isOpen.value = false;
  searchQuery.value = "";
};

const closeDropdown = (e) => {
  if (!e.target.closest(".convert-dropdown-container")) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", closeDropdown));
onUnmounted(() => document.removeEventListener("click", closeDropdown));
</script>

<template>
  <div class="dropdown convert-dropdown-container" @click.stop>
    <button class="btn btn-section" type="button" @click="isOpen = !isOpen">
      <img
        :src="currentFlag"
        class="img-setting"
        @error="$event.target.style.display = 'none'"
      />
      <span class="currency-code">{{ modelValue }}</span>
      <img src="/assets/images/icon-chevron-down.svg" class="chevron-img" />
    </button>

    <ul class="convert-dropdown" :class="{ show: isOpen }" v-if="isOpen">
      <li class="search-box-wrapper">
        <img class="search-icon" src="/assets/images/icon-search.svg" />
        <input
          v-model="searchQuery"
          class="dropdown-search-input"
          type="search"
          placeholder="Search currencies..."
        />
      </li>

      <li
        class="popular-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
        v-if="popularCurrenciesList.length"
      >
        <span class="text-setting">POPULAR</span>
        <span class="text-setting popular-curr-count">{{
          popularCurrenciesList.length
        }}</span>
      </li>

      <div class="popular-container" v-if="popularCurrenciesList.length">
        <li
          class="li-setting"
          v-for="country in popularCurrenciesList"
          :key="country.currency"
        >
          <a class="dropdown-item" @click="selectCurrency(country.currency)">
            <img
              class="img-setting"
              :src="getLocalFlag(country.currency)"
              @error="$event.target.style.display = 'none'"
            />
            <span class="currency-code">{{ country.currency }}</span>
            <span class="currency-name">{{ country.name }}</span>
            <img
              v-if="modelValue === country.currency"
              class="check-icon"
              src="/assets/images/icon-check.svg"
            />
          </a>
        </li>
      </div>

      <li
        class="popular-header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
        v-if="otherCurrenciesList.length"
      >
        <span class="text-setting">OTHER CURRENCIES</span>
        <span class="text-setting other-curr-count">{{
          otherCurrenciesList.length
        }}</span>
      </li>

      <div class="other-container" v-if="otherCurrenciesList.length">
        <li
          class="li-setting"
          v-for="country in otherCurrenciesList"
          :key="country.currency"
        >
          <a class="dropdown-item" @click="selectCurrency(country.currency)">
            <img
              class="img-setting"
              :src="getLocalFlag(country.currency)"
              @error="$event.target.style.display = 'none'"
            />
            <span class="currency-code">{{ country.currency }}</span>
            <span class="currency-name">{{ country.name }}</span>
            <img
              v-if="modelValue === country.currency"
              class="check-icon"
              src="/assets/images/icon-check.svg"
            />
          </a>
        </li>
      </div>
    </ul>
  </div>
</template>

<style scoped>
.convert-dropdown-container {
  position: relative !important;
}

.convert-dropdown {
  position: absolute !important;
  top: calc(
    100% + 5px
  ) !important;
  right: 0 !important;
  left: auto !important;
  transform: none !important;
  z-index: 99999 !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
  list-style: none !important;
}

.dropdown-item {
  cursor: pointer;
}

.btn-section {
  transition:
    all 0.2s ease,
    outline-offset 0.2s ease !important;
  border: 1px solid transparent !important;
  outline: 1px solid transparent !important;
  border-radius: 8px !important;
  margin-left: 12px !important;
}

.btn-section:hover,
.convert-dropdown-container:hover .btn-section {
  border: 1px solid #d4e932 !important;
  outline: 1px solid #d4e932 !important;
  outline-offset: 2px !important;
  box-shadow: none !important;
}

.btn-section:active {
  outline-offset: 0px !important;
  background-color: rgba(212, 233, 50, 0.1) !important;
}

.dropdown-item {
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  margin-bottom: 2px !important;
}

.dropdown-item:hover {
  border: 1px solid #d4e932 !important;
  background-color: rgba(
    212,
    233,
    50,
    0.08
  ) !important; 
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}

.dropdown-item:active {
  transform: scale(0.98) !important;
  background-color: rgba(
    212,
    233,
    50,
    0.15
  ) !important;
}

.search-box-wrapper {
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.search-box-wrapper:focus-within {
  border: 1px solid #d4e932 !important;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}
</style>
