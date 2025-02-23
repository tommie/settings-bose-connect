<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  volume: number
  maxVolume: number
}>()

const emit = defineEmits<{
  (e: 'update:volume', value: number): void
}>()

const previousVolume = ref(props.volume)
watch(
  () => props.volume,
  (volume) => {
    if (volume) previousVolume.value = volume
  },
)

function onClickMute() {
  emit('update:volume', props.volume ? 0 : previousVolume.value)
}

function onChangeVolume(e: Event) {
  emit('update:volume', parseInt((e.target as HTMLInputElement).value))
}

function getVolumeIcon() {
  if (props.volume === 0) return 'bi bi-volume-mute'
  else if (props.volume < props.maxVolume / 2) return 'bi bi-volume-down'
  else if (props.volume < props.maxVolume) return 'bi bi-volume-up'
  else return 'bi bi-volume-up-fill'
}
</script>

<template>
  <div class="card bg-dark border-0 mb-3">
    <div class="card-body pe-4">
      <div class="d-flex align-items-center gap-3">
        <button class="btn" aria-label="Mute or unmute" @click="onClickMute">
          <i :class="getVolumeIcon()" aria-hidden />
        </button>
        <div class="flex-grow-1">
          <input
            type="range"
            class="form-range"
            min="0"
            :max="maxVolume"
            step="1"
            :value="volume"
            @change="onChangeVolume"
          />
        </div>
      </div>
    </div>
  </div>
</template>
