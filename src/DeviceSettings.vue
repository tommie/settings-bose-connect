<script setup lang="ts">
import { ref } from 'vue'

import { NoiseReduction, Language } from './boseconnect'

const props = defineProps<{
  voicePrompts: boolean;
  language: Language;
  autoOffTimer: number; // In minutes.
  noiseLevel: NoiseReduction;
}>()

const emit = defineEmits<{
  (e: 'update:voicePrompts', value: boolean): void;
  (e: 'update:language', value: Language): void;
  (e: 'update:autoOffTimer', value: number): void;
  (e: 'update:noiseLevel', value: NoiseReduction): void;
}>()

function onChangeVoicePrompts(e: Event) {
  emit('update:voicePrompts', (e.target as HTMLInputElement).checked)
}

function onChangeLanguage(e: Event) {
  emit('update:language', Language[(e.target as HTMLSelectElement).value] ?? props.language)
}

function onChangeAutoOffTimer(e: Event) {
  emit('update:autoOffTimer', parseInt((e.target as HTMLSelectElement).value))
}

function onChangeNoiseCancellation(e: Event) {
  emit('update:noiseLevel', NoiseReduction[(e.target as HTMLSelectElement).value] ?? props.noiseLevel)
}
</script>

<template>
  <div class="card bg-dark border-0 mb-3">
    <div class="card-body p-4">
      <div class="d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3 rounded">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-bell"></i>
            <span>Voice Prompts</span>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" :checked="voicePrompts" @change="onChangeVoicePrompts">
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-globe"></i>
            <span>Language</span>
          </div>
          <select class="form-select form-select-sm bg-dark text-white border-secondary" style="width: 100px"
            :value="Language[language]" @change="onChangeLanguage">
            <option :value="Language[Language.EN]">English</option>
            <option :value="Language[Language.FR]">French</option>
            <option :value="Language[Language.IT]">Italian</option>
            <option :value="Language[Language.DE]">German</option>
            <option :value="Language[Language.ES]">Spanish</option>
            <option :value="Language[Language.PT]">Portuguese</option>
            <option :value="Language[Language.ZH]">Chinese</option>
            <option :value="Language[Language.KO]">Korean</option>
            <option :value="Language[Language.NL]">Dutch</option>
            <option :value="Language[Language.JA]">Japanese</option>
            <option :value="Language[Language.SV]">Swedish</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-clock"></i>
            <span>Auto-off Timer</span>
          </div>
          <select class="form-select form-select-sm bg-dark text-white border-secondary" style="width: 100px"
            :value="autoOffTimer" @change="onChangeAutoOffTimer">
            <option value="0">Off</option>
            <option value="5">5 min</option>
            <option value="20">20 min</option>
            <option value="40">40 min</option>
            <option value="60">60 min</option>
            <option value="180">180 min</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-shield"></i>
            <span>Noise Cancellation</span>
          </div>
          <select class="form-select form-select-sm bg-dark text-white border-secondary" style="width: 100px"
            :value="NoiseReduction[noiseLevel]" @change="onChangeNoiseCancellation">
            <option :value="NoiseReduction[NoiseReduction.OFF]">Off</option>
            <option :value="NoiseReduction[NoiseReduction.LOW]">Low</option>
            <option :value="NoiseReduction[NoiseReduction.HIGH]">High</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
