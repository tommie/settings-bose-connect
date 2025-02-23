<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  deviceName: string,
  batteryLevel: number,
}>()

const emit = defineEmits<{
  (e: 'update:deviceName', name: string): void,
}>()

const deviceName = ref(props.deviceName)
watch(() => props.deviceName, (value) => {
  deviceName.value = value
})

const isEditing = ref(false)
const nameInputRef = ref<HTMLInputElement>()

function onClickEditName() {
  isEditing.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

function onChangeName() {
  isEditing.value = false
  emit('update:deviceName', nameInputRef.value?.value ?? props.deviceName)
}

function onBlurName() {
  isEditing.value = false
  deviceName.value = props.deviceName
}

function onKeyDownName(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    isEditing.value = false
    deviceName.value = props.deviceName
  }
  }

  function getBatteryIcon() {
    if (props.batteryLevel < 25) return 'bi bi-battery text-danger'
    else if (props.batteryLevel < 90) return 'bi bi-battery-half text-secondary'
    else return 'bi bi-battery-full text-success'
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <div class="d-flex align-items-center gap-2">
      <input v-if="isEditing" ref="nameInputRef" :value="deviceName" @blur="onBlurName" @change="onChangeName"
        @keydown="onKeyDownName" class="border-0 rounded px-2 py-1 text-white" style="outline: none;">
      <h1 v-else class="h5 mb-0">{{ deviceName }}</h1>
      <button @click="onClickEditName" class="btn btn-link text-secondary p-1">
        <i class="bi bi-pencil-square" />
      </button>
    </div>
    <div class="d-flex align-items-center gap-2">
      <i :class="getBatteryIcon()"></i>
      <span>{{ batteryLevel }}%</span>
    </div>
  </div>
</template>
