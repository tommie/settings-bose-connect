<script setup lang="ts">
import { ProductId } from './boseconnect'

defineProps<{
  serialNumber: string;
  deviceId: number;
  deviceVersion: string;
  firmwareVersion: string;
}>()

const DEVICE_TYPES = new Map([
  [ProductId.BRUSSELS, "Bose QuietComfort Earbuds"],
  [ProductId.EDELMAN, "Bose SoundLink Max"],

  [ProductId.ISAAC, "Bose AE2 SoundLink"],
  [ProductId.WOLFCASTLE, "Bose QuietComfort 35"],
  [ProductId.FOREMAN, "Bose SoundLink Color II"],
  [ProductId.FOLGERS, "Bose Revolve Soundlink"],
  [ProductId.HARVEY, "Bose Revolve+ Soundlink"],
  [ProductId.ICE, "Bose SoundSport"],
  [ProductId.FLURRY, "Bose SoundSport Pulse"],
  [ProductId.STETSON, "Bose Hearphones"],
  [ProductId.POWDER, "Bose QuietControl 30"],
  [ProductId.KLEOS, "Bose SoundWear"],
  [ProductId.LEVI, "Bose SoundSport Free"],
  [ProductId.LEVI_SLAVE, "Bose SoundSport Free"],
  [ProductId.LEVI_CASE, "Levi Case"],
  [ProductId.BAYWOLF, "Bose QuietComfort 35 Series 2"],
  [ProductId.ATLAS, "Bose ProFlight"],
  [ProductId.MINNOW, "Bose SoundLink Micro"],
  [ProductId.GOODYEAR, "Bose Noise Cancelling Headphones 700"],
  [ProductId.BEANIE, "Bose Hearphones II"],
  [ProductId.CELINE, "Bose Frames"],
  [ProductId.REVEL, "Bose Sport Earbuds"],
  [ProductId.LANDO, "Bose QuietComfort Earbuds"],
  [ProductId.BUDLITE, "Bose Budlite"],
  [ProductId.DURAN, "Bose QuietComfort 45"],
  [ProductId.GWEN, "Bose Sport Open Earbuds"],
  [ProductId.CELINE_II, "Bose Frames"],
  [ProductId.OLIVIA, "Bose Frames Tempo"],
  [ProductId.VEDDER, "Bose Frames"],
  [ProductId.SMALLS, "Bose QC Earbuds II"],
  [ProductId.SMALLS_CASE, "Bose QC Earbuds II Case"],
  [ProductId.LONESTARR, "Bose QC Ultra Headphones"],
  [ProductId.SERENA_CASE, "Bose Ultra Open Earbuds Case"],
  [ProductId.SERENA, "Bose Ultra Open Earbuds"],
  [ProductId.SCOTTY, "Bose QC Ultra Earbuds"],
  [ProductId.SCOTTY_CHARGING_CASE, "Bose QC Ultra Earbuds Case"],
  [ProductId.PRINCE, "Bose QuietComfort Headphones"],

  [ProductId.CHIBI, "Bose S1 Pro"],
  [ProductId.PHELPS, "Bose SoundLink Flex"],
  [ProductId.PHELPS_II, "Bose SoundLink Flex"],
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
