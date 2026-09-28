import { reactive } from "vue";
import countriesData from "./data/countries.json";

const uniqueCurrenciesMap = new Map();
countriesData.forEach((country) => {
  if (country.currency && !uniqueCurrenciesMap.has(country.currency)) {
    uniqueCurrenciesMap.set(country.currency, country);
  }
});
const uniqueCurrencies = Array.from(uniqueCurrenciesMap.values());

export const store = reactive({
  rates: {},
  countries: uniqueCurrencies,
  todayRates: {},
  oneWeekAgoRates: {},

  baseCurrency: "USD",
  targetCurrency: "EUR",
  amount: 1,

  favorites: [],
  logs: [],

  async fetchLiveRates() {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!response.ok) throw new Error("Unable to fetch live markets");
      const data = await response.json();

      const ratesMap = data.rates || {};
      this.rates = ratesMap;
      this.todayRates = ratesMap;
      this.oneWeekAgoRates = ratesMap;

      return this.rates;
    } catch (error) {
      console.error("Market fetch failed.", error);
      this.rates = { USD: 1, EUR: 0.853, EGP: 50.31, GBP: 0.73, JPY: 159.32 };
      this.todayRates = this.rates;
      this.oneWeekAgoRates = this.rates;
      return this.rates;
    }
  },
});
