<script setup lang="ts">
import { NoiseReduction, Language } from './boseconnect'

const props = defineProps<{
  voicePrompts: boolean
  language: Language
  autoOffTimer: number // In minutes.
  noiseReduction: NoiseReduction
}>()

const emit = defineEmits<{
  (e: 'update:voicePrompts', value: boolean): void
  (e: 'update:language', value: Language): void
  (e: 'update:autoOffTimer', value: number): void
  (e: 'update:noiseReduction', value: NoiseReduction): void
}>()

function onChangeVoicePrompts(e: Event) {
  emit('update:voicePrompts', (e.target as HTMLInputElement).checked)
}

function onChangeLanguage(e: Event) {
  emit(
    'update:language',
    Reflect.get(Language, (e.target as HTMLSelectElement).value) ?? props.language,
  )
}

function onChangeAutoOffTimer(e: Event) {
  emit('update:autoOffTimer', parseInt((e.target as HTMLSelectElement).value))
}

function onChangeNoiseReduction(e: Event) {
  emit(
    'update:noiseReduction',
    Reflect.get(NoiseReduction, (e.target as HTMLSelectElement).value) ?? props.noiseReduction,
  )
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
            <input
              class="form-check-input"
              type="checkbox"
              :checked="voicePrompts"
              @change="onChangeVoicePrompts"
            />
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-globe"></i>
            <span>Language</span>
          </div>
          <select
            class="form-select form-select-sm bg-dark text-white border-secondary"
            style="width: 100px"
            :value="Language[language]"
            @change="onChangeLanguage"
          >
            <option :value="Language[Language.AR]">Arabic</option>
            <option :value="Language[Language.ZH_CA]">Chinese (Cantonese)</option>
            <option :value="Language[Language.ZH_MA]">Chinese (Mandarin)</option>
            <option :value="Language[Language.DA]">Danish</option>
            <option :value="Language[Language.NL]">Dutch</option>
            <option :value="Language[Language.EN_UK]">English (UK)</option>
            <option :value="Language[Language.EN_US]">English (US)</option>
            <option :value="Language[Language.FI]">Finnish</option>
            <option :value="Language[Language.FR]">French</option>
            <option :value="Language[Language.DE]">German</option>
            <option :value="Language[Language.HE]">Hebrew</option>
            <option :value="Language[Language.IT]">Italian</option>
            <option :value="Language[Language.JA]">Japanese</option>
            <option :value="Language[Language.KO]">Korean</option>
            <option :value="Language[Language.NO]">Norwegian</option>
            <option :value="Language[Language.PL]">Polish</option>
            <option :value="Language[Language.PT_BR]">Portuguese (Brasil)</option>
            <option :value="Language[Language.RU]">Russian</option>
            <option :value="Language[Language.ES_ES]">Spanish (Spain)</option>
            <option :value="Language[Language.ES_MX]">Spanish (Mexico)</option>
            <option :value="Language[Language.SV]">Swedish</option>
            <option :value="Language[Language.TR]">Turkish</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-clock"></i>
            <span>Auto-off</span>
          </div>
          <select
            class="form-select form-select-sm bg-dark text-white border-secondary"
            style="width: 100px"
            :value="autoOffTimer"
            @change="onChangeAutoOffTimer"
          >
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
            <span>Noise Reduction</span>
          </div>
          <select
            class="form-select form-select-sm bg-dark text-white border-secondary"
            style="width: 100px"
            :value="NoiseReduction[noiseReduction]"
            @change="onChangeNoiseReduction"
          >
            <option :value="NoiseReduction[NoiseReduction.OFF]">Off</option>
            <option :value="NoiseReduction[NoiseReduction.LOW]">Low</option>
            <!-- TODO: not supported by 0x4020 <option :value="NoiseReduction[NoiseReduction.WIND]">Wind</option>-->
            <option :value="NoiseReduction[NoiseReduction.HIGH]">High</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
