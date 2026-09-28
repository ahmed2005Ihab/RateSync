<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { store } from '../store.js'

const activeTf = ref('1M')
const timeframes = ['1W', '1M', '3M', '6M', '1Y', '5Y']

const chartData = ref([])
const chartDates = ref([])
const minRate = ref(0)
const maxRate = ref(0)
const firstRate = ref(0)
const lastRate = ref(0)

const fullHistoryData = ref([])
const fullHistoryDates = ref([])
const currentPair = ref('')

const generateFullHistory = () => {
  if (!store.rates || Object.keys(store.rates).length === 0) return

  const base = store.baseCurrency || 'USD'
  const target = store.targetCurrency || 'EUR'
  const pair = `${base}-${target}`
  
  const baseRate = base === 'USD' ? 1 : store.rates[base]
  const targetRate = target === 'USD' ? 1 : store.rates[target]
  if (!baseRate || !targetRate) return

  const currentRate = targetRate / baseRate

  if (base === target) {
    chartData.value = [1, 1]; chartDates.value = [new Date(), new Date()]
    firstRate.value = 1; lastRate.value = 1; minRate.value = 1; maxRate.value = 1
    return
  }

  if (currentPair.value === pair && fullHistoryData.value.length > 0) {
    updateChartSlice()
    return
  }

  currentPair.value = pair
  const data = new Array(1825)
  const dates = new Array(1825)
  const today = new Date()

  let tempRate = currentRate
  data[1824] = tempRate
  dates[1824] = today

  for (let i = 1823; i >= 0; i--) {
    const randomShift = (Math.random() - 0.5) * (currentRate * 0.008) 
    tempRate = tempRate - randomShift 
    data[i] = tempRate

    const d = new Date(today)
    d.setDate(today.getDate() - (1824 - i))
    dates[i] = d
  }

  fullHistoryData.value = data
  fullHistoryDates.value = dates
  updateChartSlice()
}

const updateChartSlice = () => {
  if (fullHistoryData.value.length === 0) return

  let days = 30
  if (activeTf.value === '1W') days = 7
  else if (activeTf.value === '1M') days = 30
  else if (activeTf.value === '3M') days = 90
  else if (activeTf.value === '6M') days = 180
  else if (activeTf.value === '1Y') days = 365
  else if (activeTf.value === '5Y') days = 1825

  const slicedData = fullHistoryData.value.slice(-days)
  const slicedDates = fullHistoryDates.value.slice(-days)

  chartData.value = slicedData
  chartDates.value = slicedDates
  minRate.value = Math.min(...slicedData)
  maxRate.value = Math.max(...slicedData)
  firstRate.value = slicedData[0]
  lastRate.value = slicedData[slicedData.length - 1]
}

watch([() => store.baseCurrency, () => store.targetCurrency, () => store.rates], generateFullHistory, { deep: true })
watch(activeTf, updateChartSlice)
onMounted(generateFullHistory)

const changeValue = computed(() => lastRate.value - firstRate.value)
const percentChange = computed(() => firstRate.value ? (changeValue.value / firstRate.value) * 100 : 0)

const xAxisLabels = computed(() => {
  if (chartDates.value.length === 0) return ['', '', '', '', '']
  const len = chartDates.value.length
  const indices = [0, Math.floor(len * 0.25), Math.floor(len * 0.5), Math.floor(len * 0.75), len - 1]
  
  return indices.map(i => {
    return chartDates.value[i].toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  })
})

const lastDateFormatted = computed(() => {
  if (chartDates.value.length === 0) return ''
  return chartDates.value[chartDates.value.length - 1].toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()
})

const svgLinePath = computed(() => {
  if (chartData.value.length === 0) return ''
  const range = maxRate.value - minRate.value || 0.0001
  const maxIndex = chartData.value.length - 1
  
  const points = chartData.value.map((rate, index) => {
    const x = (index / maxIndex) * 500
    const y = 200 - ((rate - minRate.value) / range) * 180 - 10
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
  })
  return points.join(' ')
})

const svgAreaPath = computed(() => {
  if (!svgLinePath.value) return ''
  return `${svgLinePath.value} L 500,200 L 0,200 Z`
})
</script>

<template>
  <div class="tab-content active" id="history-tab-content">
    
    <div class="stats-container">
      <div class="convertion-stats">
        <div class="CS-open CS-box d-flex flex-column">
          <span class="open-label">OPEN</span>
          <span class="open-value">{{ firstRate.toFixed(4) }}</span>
        </div>
        <div class="CS-last CS-box d-flex flex-column">
          <span class="last-label">LAST</span>
          <span class="last-value">{{ lastRate.toFixed(4) }}</span>
        </div>
        <div class="CS-change CS-box d-flex flex-column">
          <span class="change-label">CHANGE</span>
          <span class="change-value" :style="{ color: changeValue < 0 ? '#ff4d4d' : '#d4e932' }">
            {{ changeValue >= 0 ? '+' : '' }}{{ changeValue.toFixed(4) }}
          </span>
        </div>
        <div class="CS-percent CS-box d-flex flex-column">
          <span class="percent-label">% CHANGE</span>
          <span class="percent-value" :style="{ color: percentChange < 0 ? '#ff4d4d' : '#d4e932' }">
            {{ percentChange >= 0 ? '▲' : '▼' }} {{ Math.abs(percentChange).toFixed(2) }}%
          </span>
        </div>
      </div>
      
      <div class="timeframe-btn-container">
        <button 
          v-for="tf in timeframes" 
          :key="tf"
          class="timeframe-btn" 
          :class="{ 'active-tf': activeTf === tf }"
          @click="activeTf = tf"
        >
          {{ tf }}
        </button>
      </div>
    </div>

    <div class="chart-component">
      <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span class="title" style="font-size: 20px; font-weight: bold; color: #fff;">{{ store.baseCurrency }}/{{ store.targetCurrency }}</span>
        <span class="meta" style="color: #9d9d9d; font-size: 12px; font-family: 'JetBrains Mono', monospace;">{{ lastRate.toFixed(4) }} • {{ lastDateFormatted }}</span>
      </div>

      <div class="chart-card">
        <div class="chart-container" style="position: relative; width: 100%; height: 272px;">
          
          <div class="y-axis-container" style="position: absolute; left: 0; top: 0; height: 100%; display: flex; flex-direction: column; justify-content: space-between; color: #9d9d9d; font-family: 'JetBrains Mono'; font-size: 11px; padding: 10px 0; z-index: 2;">
            <span class="y-value">{{ maxRate.toFixed(4) }}</span>
            <span class="y-value">{{ ((maxRate + minRate) / 2).toFixed(4) }}</span>
            <span class="y-value">{{ minRate.toFixed(4) }}</span>
          </div>

          <div class="chart-line-container" style="width: calc(100% - 60px); height: 100%; margin-left: 60px;">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d4e932" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#d4e932" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="svgAreaPath" fill="url(#chart-gradient)" />
              <path :d="svgLinePath" fill="none" stroke="#d4e932" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="x-axis-container" style="display: flex; justify-content: space-between; margin-left: 60px; margin-top: 15px; color: #9d9d9d; font-family: 'JetBrains Mono'; font-size: 11px; font-weight: bold;">
          <span class="x-axis-txt">{{ xAxisLabels[0] }}</span>
          <span class="x-axis-txt">{{ xAxisLabels[1] }}</span>
          <span class="x-axis-txt">{{ xAxisLabels[2] }}</span>
          <span class="x-axis-txt">{{ xAxisLabels[3] }}</span>
          <span class="x-axis-txt">{{ xAxisLabels[4] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeframe-btn {
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
  border-radius: 6px !important;
  cursor: pointer;
}
.timeframe-btn:hover {
  border: 1px solid #d4e932 !important;
  background-color: rgba(212, 233, 50, 0.08) !important;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
  color: #d4e932 !important;
}
.timeframe-btn:active {
  transform: scale(0.92) !important;
  background-color: rgba(212, 233, 50, 0.15) !important;
}
.timeframe-btn.active-tf {
  border: 1px solid #d4e932 !important;
  color: #d4e932 !important;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}
</style>
