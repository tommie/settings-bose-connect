<script setup lang="ts">
import { getCurrentScope, onMounted, onScopeDispose, onUnmounted, ref, shallowRef } from 'vue'

import { BoseConnectDevice, type BoseConnectEvents, ButtonAction, Command, Language, PairedDeviceStatusMask, PlaybackStatus } from './boseconnect'

const BOSE_CONNECT_SERVICE_CLASS_ID = '00001101-0000-1000-8000-00805f9b34fb'

// The device will normally send updates on its own. This is a fallback.
const UPDATE_INTERVAL = 5 * 60000

function makeDeviceInfo(dev: BoseConnectDevice) {
  const scope = getCurrentScope()

  const deviceId = shallowRef<Awaited<ReturnType<BoseConnectDevice['getDeviceId']>>>()
  const deviceVersion = shallowRef<string>()
  const firmwareVersion = shallowRef<string>()
  const deviceSettings = ref<Awaited<ReturnType<BoseConnectDevice['getDeviceSettings']>>>()
  const serialNumber = shallowRef<string>()
  const batteryLevel = shallowRef<number>()
  const pairedDevices =
    shallowRef<Awaited<ReturnType<BoseConnectDevice['getPairedDeviceInfo']>>[]>()
  const activeDevice = shallowRef<Awaited<ReturnType<BoseConnectDevice['getActiveDevice']>>>()
  const audioStatus = ref<Awaited<ReturnType<BoseConnectDevice['getAudioStatus']>>>()

  let updating = false

  async function update() {
    if (updating) return

    updating = true

    try {
      if (!deviceId.value) deviceId.value = await dev.getDeviceId()
      if (!deviceVersion.value) deviceVersion.value = await dev.getDeviceVersion()
      if (!firmwareVersion.value) firmwareVersion.value = await dev.getFirmwareVersion()

      deviceSettings.value = await dev.getDeviceSettings()
      serialNumber.value = await dev.getSerialNumber()
      batteryLevel.value = await dev.getBatteryLevel()

      const newPairedDevices: Awaited<ReturnType<BoseConnectDevice['getPairedDeviceInfo']>>[] = []
      for (const address of (await dev.getPairedDevices())) {
        newPairedDevices.push(await dev.getPairedDeviceInfo(address))
      }
      pairedDevices.value = newPairedDevices
      activeDevice.value = await dev.getActiveDevice()
      audioStatus.value = await dev.getAudioStatus()
    } finally {
      updating = false
    }
  }

  update().then(() => {
    scope?.run(() => {
      const interval = setInterval(async () => {
        try {
          await update()
        } catch (ex) {
          clearInterval(interval)
          throw ex
        }
      }, UPDATE_INTERVAL)

      onScopeDispose(async () => {
        clearInterval(interval)
      })


      function onReceive(e: BoseConnectEvents['receive']) {
        if (updating) return

        switch (e.detail.id) {
          case Command.BATTERY_LEVEL:
            batteryLevel.value = e.detail.payload
            break

          case Command.VOLUME:
            if (audioStatus.value) audioStatus.value.volume = e.detail.payload
            break

          case Command.ACTIVE_DEVICE:
            activeDevice.value = e.detail.payload
            updating = true
            audioStatus.value = undefined
            dev.getAudioStatus().then(status => {
              if (!audioStatus.value) {
                audioStatus.value = status
              }
            }).finally(() => {
              updating = false
            })
            break

          case Command.PLAYBACK_STATUS:
            if (audioStatus.value) audioStatus.value.playback = e.detail.payload
            break

          case Command.PLAYBACK_TITLE:
            if (audioStatus.value) audioStatus.value.title = e.detail.payload
            break
        }
      }

      dev.addEventListener('receive', onReceive)
      onScopeDispose(() => dev.removeEventListener('receive', onReceive))
    })
  })

  return {
    dev,

    deviceId,
    deviceVersion,
    firmwareVersion,
    serialNumber,

    deviceSettings,
    batteryLevel,
    pairedDevices,
    activeDevice,
    audioStatus,
  }
}

const device = ref<ReturnType<typeof makeDeviceInfo>>()
const opening = ref(false)
async function openPort(port: SerialPort) {
  const scope = getCurrentScope()

  if (!scope) throw new Error()
  if (opening.value) return
  if (!port.connected) return

  opening.value = true

  if (import.meta.hot) {
    if (import.meta.hot.data.boseConnectDevice) {
      // Add a delay to let the old version close.
      await new Promise(done => setTimeout(done, 10))
    }
  }

  try {
    if (!port.writable && !port.readable) {
      await port.open({
        baudRate: 115200,
      })
    }

    scope.run(() => {
      device.value = makeDeviceInfo(new BoseConnectDevice(port))
      if (import.meta.hot) import.meta.hot.data.boseConnectDevice = device
    })
  } finally {
    opening.value = false
  }
}

async function openAvailablePort() {
  const scope = getCurrentScope()
  const ports = (await navigator.serial.getPorts()).filter(
    (port) =>
      port.getInfo().bluetoothServiceClassId === BOSE_CONNECT_SERVICE_CLASS_ID && port.connected,
  )

  if (ports.length !== 1) return

  await scope?.run(() => openPort(ports[0]))
}

const scope = getCurrentScope()
function onConnect() {
  if (device.value?.dev.port.connected) return

  scope?.run(openAvailablePort)
}

function onDisconnect() {
  if (device.value?.dev.port.connected) return

  scope?.run(() => {
    device.value = undefined
  })
}

onMounted(async () => {
  navigator.serial.addEventListener('connect', onConnect)
  navigator.serial.addEventListener('disconnect', onDisconnect)

  await openAvailablePort()
})

onUnmounted(async () => {
  navigator.serial.removeEventListener('disconnect', onDisconnect)
  navigator.serial.removeEventListener('connect', onConnect)
  await device.value?.dev.close()
  if (import.meta.hot) delete import.meta.hot.data.boseConnectDevice
})

async function onClickOpen() {
  const scope = getCurrentScope()

  try {
    const port = await navigator.serial.requestPort({
      filters: [
        {
          bluetoothServiceClassId: BOSE_CONNECT_SERVICE_CLASS_ID,
        },
      ],
      allowedBluetoothServiceClassIds: [BOSE_CONNECT_SERVICE_CLASS_ID],
    })

    await scope?.run(() => openPort(port))
  } catch (ex) {
    if (ex instanceof DOMException && ex.name === 'NotFoundError') return

    throw ex
  }
}

async function onClickDisconnect() {
  await device.value?.dev.close()
  device.value = undefined
}
</script>

<template>
  <header>
    <div v-if="opening">Opening</div>
    <div v-else-if="device">
      <div>Device: {{ device.deviceId?.deviceId.toString(0x10) }}, {{ device.deviceVersion }}, {{ device.firmwareVersion }}</div>
      <div>Serial: {{ device.serialNumber }}</div>
      <div>Battery: {{ device.batteryLevel }}%</div>
      <div v-if="device.deviceSettings">
        <div>Name: {{ device.deviceSettings.name.name }}</div>
        <div>Language: {{ Language[device.deviceSettings.language.language] ?? device.deviceSettings.language.language }}</div>
        <div>Auto-Off: {{ device.deviceSettings.autoOff }} min</div>
        <div>ANC: {{ device.deviceSettings.anc }}</div>
        <div>Button: {{ ButtonAction[device.deviceSettings.buttons.action] ?? device.deviceSettings.buttons.action }}</div>
      </div>

      <div>
        Paired
        <ul>
          <li v-for="dev in device.pairedDevices" :key="dev.address">
            {{ dev.name }},
            <span v-if="dev.status & PairedDeviceStatusMask.CONNECTED">Connected</span>
            <span v-if="dev.status & PairedDeviceStatusMask.REQUESTER">(this device)</span>,
            {{ dev.unknown }}
          </li>
        </ul>
      </div>

      <div v-if="device.activeDevice">Active: {{ device.activeDevice.address }}</div>

      <div v-if="device.audioStatus">
        <div>Control: {{ device.audioStatus.control }}</div>
        <div>Status: {{ PlaybackStatus[device.audioStatus.playback] ?? device.audioStatus.playback }}</div>
        <div>Now playing: {{ device.audioStatus.title }}</div>

        <label>
          Volume:
          <input type="range" min="0" :max="device.audioStatus.volume.max" :value="device.audioStatus.volume.current" @input="(e) => device?.dev.setVolume(e.target!.value)" />
        </label>
      </div>

      <button @click="onClickDisconnect">Disconnect</button>
    </div>
    <div v-else>
      <button @click="onClickOpen">Open device</button>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
</style>
