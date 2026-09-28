# RateSync

A dark-mode currency dashboard for checking live exchange rates, converting amounts, comparing a base currency across the market, and keeping a personal watchlist and conversion log.

RateSync is a single-page Vue 3 app. It loads daily USD-based rates from [ExchangeRate-API](https://www.exchangerate-api.com/), maps them to a local country/currency catalog with flag assets, and keeps converter state, favorites, and logs in a shared reactive store.

**Live rates · 150+ currencies · dark UI · no backend**

---

## What it does

| Surface | Purpose |
| --- | --- |
| **Converter** | Send/receive amounts with searchable currency pickers and a one-click swap. Conversion works in both directions. |
| **Live markets ticker** | Scrolling USD pairs (EUR, JPY, GBP, CHF, AUD, CAD, CNY, NZD) with the latest fetched rates. |
| **History** | Pair stats (open, last, change, % change) and an SVG line chart with timeframes: 1W, 1M, 3M, 6M, 1Y, 5Y. |
| **Compare** | Converts the current send amount from the base currency into every other rate in the feed, with flags and favorite stars. |
| **Favorites** | Pinned pairs from the converter or compare list, with live rates and the option to unpin. |
| **Log** | Saved conversions (date, pair, send/receive amounts) with per-item delete and clear all. |

The header marks the product as covering **150 currencies**, using **daily** updates sourced from **ECB and market data** via the public rates API.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | [Vue 3](https://vuejs.org/) (`<script setup>`) |
| Bundler | [Vite 6](https://vite.dev/) |
| State | Shared `reactive` store (`src/store.js`) — no Vuex/Pinia |
| Rates | `https://open.er-api.com/v6/latest/USD` |
| Charts | Inline SVG paths (no Chart.js) |
| Styling | Global CSS in `src/style.css` plus scoped component styles |
| Type | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (bundled) |
| Flags | Local SVGs under `public/assets/images/flags/` |

There is no router, no backend, and no extra runtime npm packages beyond Vue.

---

## Quick start

**Requirements:** Node.js 18+ and npm.

```bash
git clone https://github.com/ahmed2005Ihab/RateSync.git
cd RateSync
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in the browser.

| Script | Command | What it does |
| --- | --- | --- |
| Dev server | `npm run dev` | Hot-reload development |
| Production build | `npm run build` | Output to `dist/` |
| Preview build | `npm run preview` | Serve the production build locally |

Rates are fetched in the browser. If the API is unreachable, the store falls back to a small hardcoded set (USD, EUR, EGP, GBP, JPY) so the converter still runs.

---

## How the app is structured

```
RateSync/
├── index.html                 # HTML shell, favicon, mounts #app
├── vite.config.js             # Vue plugin for Vite
├── package.json
├── src/
│   ├── main.js                # createApp, global CSS, mount App
│   ├── App.vue                # Layout: header, ticker, converter, tabs
│   ├── store.js               # Rates, currencies, converter, favorites, logs
│   ├── style.css              # Layout, ticker, converter, tabs, theme
│   ├── data/
│   │   └── countries.json     # Name, ISO code, symbol, local flag path
│   └── components/
│       ├── LiveMarkets.vue    # Scrolling market strip
│       ├── ConverterCard.vue  # Send / receive, swap, favorite, log
│       ├── CurrencySelector.vue
│       ├── HistoryTab.vue
│       ├── CompareTab.vue
│       ├── FavoritesTab.vue
│       └── LogTab.vue
└── public/
    └── assets/
        ├── fonts/jetbrains-mono/
        └── images/
            ├── logo.svg
            ├── favicon.svg
            ├── icon-*.svg
            └── flags/         # Country flag SVGs
```

### Entry and layout

1. `index.html` loads `/src/main.js`.
2. `main.js` applies `style.css` and mounts `App.vue` on `#app`.
3. On mount, `App.vue` calls `store.fetchLiveRates()`.
4. Tab state (`history` | `compare` | `favorites` | `log`) lives in `App.vue`. Favorites and log tab badges read `store.favorites` and `store.logs`.

### Shared store (`src/store.js`)

The store is a Vue `reactive` object imported by the shell and every feature component:

- **`rates` / `todayRates` / `oneWeekAgoRates`** — maps of currency code → USD-based rate from the API.
- **`countries`** — unique currencies derived from `countries.json` (first country per code).
- **`baseCurrency` / `targetCurrency` / `amount`** — converter inputs (default USD → EUR, amount `1`).
- **`favorites` / `logs`** — in-memory lists (reset on refresh; not written to `localStorage`).

`fetchLiveRates()` requests the latest USD book. On HTTP or network failure it logs an error and uses the fallback rates above.

All conversions treat **USD as the pivot**:  
`targetAmount = amount / rate(base) * rate(target)`.

### Components

**`ConverterCard`**  
Bidirectional amount fields. Changing receive recalculates send. Swap exchanges base and quote. Favorite toggles the current pair. Log conversion appends a row (duplicate pair + send amount is rejected with a toast).

**`CurrencySelector`**  
Searchable dropdown (code or country name). Popular codes (USD, EUR, GBP, JPY, CNY, CAD, AUD, CHF, NZD, SGD) sit above the rest. Flags come from `flagUrl` in `countries.json`.

**`LiveMarkets`**  
Builds a short USD pair list from live rates and duplicates it for a CSS marquee.

**`HistoryTab`**  
Builds a multi-year series from the current spot rate for the selected pair, then slices it by timeframe and draws min/max/open/last plus an area+line SVG. The series is generated in the client for the chart UI; it is not a historical time-series API.

**`CompareTab`**  
One card per rate except the base currency: converted total, unit rate, flag, star to pin/unpin.

**`FavoritesTab` / `LogTab`**  
Read and mutate `store.favorites` and `store.logs`. Log supports delete one or clear all.

### Styling and assets

The UI is a high-contrast dark theme (`#0a0a0a` background, lime accents around `#d4e932` / `#cef739`). Layout for the dashboard (header, ticker, converter grid, desktop tabs) lives mainly in `src/style.css`. Interaction states (hover, toasts, tab underline) are mostly scoped on each component.

Static files in `public/` are served from `/` (for example `/assets/images/logo.svg`).

---

## Data flow

```text
countries.json  ──►  store.countries  ──►  CurrencySelector, Compare flags
                         ▲
open.er-api.com  ──►  store.rates     ──►  converter, ticker, compare, favorites
                         ▲
App.vue (onMounted) ─────┘

store.base / target / amount  ──►  ConverterCard, HistoryTab, CompareTab
store.favorites / logs        ──►  FavoritesTab, LogTab, tab badges
```

No API keys are required for the public `open.er-api.com` endpoint used here.

---

## Design notes

- **Single page** — converter and analysis tabs share one store so changing the pair updates history and compare immediately.
- **Offline-ish fallback** — a tiny rate table keeps the converter usable if the live request fails.
- **Session-only lists** — favorites and the conversion log exist only in memory for this session.
- **Chart series** — history visualization is synthesized from the current rate so the UI can show timeframes without a second historical endpoint.

---

## Repository

- GitHub: [ahmed2005Ihab/RateSync](https://github.com/ahmed2005Ihab/RateSync)

---

## License

This project does not include a license file yet. All rights reserved unless the author adds one.
