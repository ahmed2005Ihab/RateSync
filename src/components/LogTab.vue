<script setup>
import { store } from '../store.js'

const clearAllLogs = () => { store.logs = [] }
const deleteLog = (id) => { store.logs = store.logs.filter(log => log.id !== id) }
</script>

<template>
  <div class="tab-content active log-tab-content" id="log-tab-content">
    <div class="log-headercard">
      <span class="log-title">CONVERSION LOG</span>
      <div class="log-countcard">
        <span class="log-counts">{{ store.logs.length }} LOGGED</span>
        <button class="log-clearbtn" @click="clearAllLogs">CLEAR ALL</button>
      </div>
    </div>

    <div class="log-contentcard" v-if="store.logs.length > 0">
      <div class="log-contentitem" v-for="log in store.logs" :key="log.id">
        <div class="logtime-paircard">
          <span class="log-time">{{ log.date }}</span>
          <div class="log-paircard">
            <span class="log-basecurrency">{{ log.base }}</span>
            <img class="log-rigtharrow" src="/assets/images/icon-arrow-right.svg">
            <span class="log-quotecurrency">{{ log.quote }}</span>
          </div>
        </div>
        
        <div class="log-amountcard">
          <span class="log-send-amount">{{ log.sendAmount }}</span>
          <span class="log-receive-amount">{{ log.receiveAmount }}</span>
        </div>
        
        <button class="log-deletebtn" @click="deleteLog(log.id)">
          <img class="delete-img" src="/assets/images/icon-delete.svg">
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.log-contentitem {
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  cursor: pointer;
}

.log-contentitem:hover {
  border: 1px solid #d4e932 !important;
  box-shadow: 0 0 8px rgba(212, 233, 50, 0.2) !important;
}

.log-deletebtn {
  transition: all 0.2s ease !important;
  border-radius: 50% !important;
}

.log-deletebtn:hover {
  transform: scale(1.15) !important; 
  filter: drop-shadow(0 0 4px #ff4d4d); 
}

.log-deletebtn:active {
  transform: scale(0.85) !important;
}

.log-clearbtn {
  transition: all 0.2s ease !important;
  cursor: pointer;
  background: transparent;
  border: none;
}

.log-clearbtn:hover {
  color: #ff4d4d !important;
  text-shadow: 0 0 8px rgba(255, 77, 77, 0.4) !important;
  transform: scale(1.05) !important; 
}

.log-clearbtn:active {
  transform: scale(0.92) !important;
  opacity: 0.7 !important;
}

</style>
