<script setup lang="ts">
import { PairedDeviceStatusMask } from './boseconnect'

defineProps<{
  devices: { address: Uint8Array, name: string, status: PairedDeviceStatusMask }[];
}>()

const emit = defineEmits<{
  (e: 'pairing'): void;
  (e: 'disconnect', address: Uint8Array): void;
  (e: 'remove', address: Uint8Array): void;
}>()

function onClickDisconnect(address: Uint8Array) {
  emit('disconnect', address)
}

function onClickRemove(address: Uint8Array) {
  emit('remove', address)
}

function onClickPair() {
  emit('pairing')
}
</script>

<template>
  <div class="card bg-dark border-0 mb-3">
    <div class="card-body">
      <div class="mb-3 d-flex align-items-center justify-content-between">
        <h2 class="h6 my-0">Paired Devices</h2>
        <button :class="['btn btn-sm', devices.length ? 'btn-secondary' : 'btn-primary']" @click="onClickPair">
          <i class="bi bi-plus" />
        </button>
      </div>
      <div class="d-flex flex-column gap-2">
        <div v-for="device in devices" :key="device.address.toString()"
          class="device-item d-flex align-items-center justify-content-between p-2 rounded">
          <div :class="['d-flex align-items-center gap-3', { 'current': device.status & PairedDeviceStatusMask.LOCAL_DEVICE }]">
            <i class="bi bi-bluetooth" />
            <div>
              <p class="mb-0">{{ device.name }}</p>
              <p class="text-secondary small mb-0" v-if="device.status & PairedDeviceStatusMask.LOCAL_DEVICE">This device</p>
              <p class="text-secondary small mb-0" v-else-if="device.status & PairedDeviceStatusMask.CONNECTED">Connected</p>
              <p class="text-secondary small mb-0" v-else>Disconnected</p>
            </div>
          </div>
          <div class="device-actions">
            <button class="btn text-white" @click="onClickDisconnect(device.address)">
              <i class="bi bi-x-lg" />
            </button>
            <button class="btn text-danger" @click="onClickRemove(device.address)">
              <i class="bi bi-trash" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-item {
  transition: border 0.2s;
  border: 1px solid transparent;
}

.device-item:hover {
  border: 1px solid var(--bs-secondary);
}

.device-item .device-actions {
  transition: opacity 0.2s;
}

.device-item:not(:hover) .device-actions {
  opacity: 0;
}

.current i {
  color: var(--bs-primary);
}
</style>
