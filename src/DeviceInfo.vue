<script setup lang="ts">
import { ref } from 'vue'

  defineProps<{
    serialNumber: string;
    deviceId: number;
    deviceVersion: string;
    firmwareVersion: string;
  }>()

  const DEVICE_TYPES = new Map([
    [0x4020, "Bose QC35 II"],
  ])
</script>

<template>
  <div class="card bg-dark border-0 mb-3">
    <div class="card-body p-4">
      <div class="d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-headphones"></i>
            <h2 class="h6 my-0">{{ DEVICE_TYPES.get(deviceId) ?? `Unknown (${deviceId.toString(16)})` }}</h2>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-123"></i>
            <span>Serial Number</span>
          </div>
          <div class="user-select-all">{{ serialNumber }}</div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-motherboard"></i>
            <span>Hardware Version</span>
          </div>
          <div>{{ deviceVersion }}</div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <i class="bi bi-code"></i>
            <span>Firmware Version</span>
          </div>
          <div>{{ firmwareVersion }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
