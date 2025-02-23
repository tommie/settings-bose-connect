<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { Language, NoiseCancellation } from './boseconnect'
import { useDeviceStore } from './stores/device'

import AudioControls from './AudioControls.vue'
import DeviceInfo from './DeviceInfo.vue'
import DeviceSettings from './DeviceSettings.vue'
import Header from './Header.vue'
import NowPlaying from './NowPlaying.vue'
import PairedDevices from './PairedDevices.vue'

const BOSE_CONNECT_SERVICE_CLASS_ID = '00001101-0000-1000-8000-00805f9b34fb'

const device = useDeviceStore()

async function openAvailablePort() {
  const ports = (await navigator.serial.getPorts()).filter(
    (port) =>
      port.getInfo().bluetoothServiceClassId === BOSE_CONNECT_SERVICE_CLASS_ID && port.connected,
  )

  if (ports.length !== 1) return

  await device.openPort(ports[0])
}

async function onConnect() {
  await openAvailablePort()
}

onMounted(async () => {
  navigator.serial.addEventListener('connect', onConnect)

  await openAvailablePort()
})

onUnmounted(() => {
  navigator.serial.removeEventListener('connect', onConnect)
})

const writing = ref(false)
async function doWriting(fun: () => Promise<void> | void) {
  if (writing.value) return

  writing.value = true

  try {
    await fun()
  } finally {
    writing.value = false
  }
}

async function onUpdateDeviceName(value: string) {
  await doWriting(() => device.dev?.setProductName(value))
}

async function onUpdateVolume(value: number) {
  await doWriting(() => device.dev?.setVolume(value))
}

async function onUpdateVoicePrompts(value: boolean) {
  if (!device.deviceSettings?.language) return
  const lang = device.deviceSettings?.language

  await doWriting(() => device.dev?.setVoicePrompts(lang.language, value))
}

async function onUpdateLanguage(value: Language) {
  if (!device.deviceSettings?.language) return
  const lang = device.deviceSettings?.language

  await doWriting(() => device.dev?.setVoicePrompts(value, lang.prompt))
}

async function onUpdateAutoOffTimer(value: number) {
  await doWriting(() => device.dev?.setStandbyTimer(value))
}

async function onUpdateNoiseReduction(value: NoiseCancellation) {
  await doWriting(() => device.dev?.setNoiseReduction(value))
}

async function onPairing() {
  await doWriting(() => device.dev?.setPairingMode(true))
}

async function onDisconnectDevice(addr: Uint8Array) {
  await doWriting(() => device.dev?.disconnectDevice(addr))
}

async function onRemoveDevice(addr: Uint8Array) {
  await doWriting(() => device.dev?.removeDevice(addr))
}

function getSource() {
  if (!device.activeDevice) return undefined

  const addr = device.activeDevice.address.toString()

  for (const dev of device.pairedDevices ?? []) {
    if (dev.address.toString() === addr) return dev.name
  }

  return undefined
}
</script>

<template>
  <div class="p-3">
    <Header :deviceName="device.deviceSettings.name.name" :batteryLevel="device.batteryLevel"
      @update:deviceName="onUpdateDeviceName" v-if="device.deviceSettings?.name && device.batteryLevel !== undefined" />
    <NowPlaying :status="device.audioStatus.playback" :data="device.audioStatus.title" :source="getSource()"
      v-if="device.audioStatus?.playback !== undefined && device.activeDevice !== undefined" />
    <AudioControls :maxVolume="device.audioStatus.volume.max" :volume="device.audioStatus.volume.current"
      @update:volume="onUpdateVolume"
      v-if="device.audioStatus?.volume?.current !== undefined && device.audioStatus?.volume?.max !== undefined" />
    <DeviceSettings :voicePrompts="device.deviceSettings.language.prompt"
      :language="device.deviceSettings.language.language" :autoOffTimer="device.deviceSettings.autoOff"
      :noiseReduction="device.deviceSettings.anc" @update:voicePrompts="onUpdateVoicePrompts"
      @update:language="onUpdateLanguage" @update:autoOffTimer="onUpdateAutoOffTimer"
      @update:noiseReduction="onUpdateNoiseReduction"
      v-if="device.deviceSettings?.language && device.deviceSettings?.autoOff !== undefined && device.deviceSettings.anc !== undefined" />
    <PairedDevices :devices="device.pairedDevices" @pairing="onPairing" @disconnect="onDisconnectDevice"
      @remove="onRemoveDevice" v-if="device.pairedDevices" />
    <DeviceInfo :serialNumber="device.serialNumber" :deviceId="device.productId.productId"
      :deviceVersion="device.productVersion" :firmwareVersion="device.firmwareVersion"
      v-if="device.serialNumber && device.productId && device.productVersion && device.firmwareVersion" />
  </div>
</template>

<style scoped>
</style>
