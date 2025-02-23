import { defineStore } from 'pinia'
import { getCurrentScope, onScopeDispose, ref, shallowRef } from 'vue'

import { BoseConnectDevice, type BoseConnectEvents, Function } from '../boseconnect'

// The device will normally send updates on its own. This is a fallback.
const UPDATE_INTERVAL = 5 * 60000

export const useDeviceStore = defineStore('device', () => {
  const scope = getCurrentScope()
  if (!scope) throw new Error()

  const productId = shallowRef<Awaited<ReturnType<BoseConnectDevice['getProductIdVariant']>>>()
  const productVersion = shallowRef<string>()
  const firmwareVersion = shallowRef<string>()
  const deviceSettings = ref<Awaited<ReturnType<BoseConnectDevice['getAllSettings']>>>()
  const serialNumber = shallowRef<string>()
  const batteryLevel = shallowRef<number>()
  const pairedDevices =
    shallowRef<Awaited<ReturnType<BoseConnectDevice['getPairedDeviceInfo']>>[]>()
  const activeDevice = shallowRef<Awaited<ReturnType<BoseConnectDevice['getSource']>>>()
  const audioStatus = ref<Awaited<ReturnType<BoseConnectDevice['getAllAudio']>>>()

  const dev = shallowRef<BoseConnectDevice>()
  const opening = ref(false)
  async function openPort(port: SerialPort) {
    if (dev.value) return
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

      const newDev = new BoseConnectDevice(port)
      if (import.meta.hot) import.meta.hot.data.boseConnectDevice = newDev

      update(newDev).then(() => {
        scope!.run(() => {
          const interval = setInterval(async () => {
            try {
              await update(newDev)
            } catch (ex) {
              clearInterval(interval)
              throw ex
            }
          }, UPDATE_INTERVAL)

          onScopeDispose(async () => {
            clearInterval(interval)
          })

          dev.value = newDev
          newDev.addEventListener('receive', onReceive)
          onScopeDispose(() => newDev.removeEventListener('receive', onReceive))
        })
      }).finally(() => {
        opening.value = false
      })
    } catch (ex) {
      opening.value = false
      throw ex
    }
  }

  const updating = ref(false)

  async function update(dev: BoseConnectDevice) {
    if (updating.value) return

    updating.value = true

    // On connection, the app does getAllSettings, getBatteryLevel, getSerialNumber, getAllFunctionBlocks, getPairedDeviceList, getComponentDevices, getProductIdAndVariant
    try {
      if (!productId.value) productId.value = await dev.getProductIdVariant()
      if (!productVersion.value) productVersion.value = await dev.getProductVersion()
      if (!firmwareVersion.value) firmwareVersion.value = await dev.getFirmwareVersion()

      deviceSettings.value = await dev.getAllSettings()
      serialNumber.value = await dev.getSerialNumber()
      batteryLevel.value = await dev.getBatteryLevel()

      const newPairedDevices: Awaited<ReturnType<BoseConnectDevice['getPairedDeviceInfo']>>[] = []
      for (const address of (await dev.getPairedDeviceList())) {
        newPairedDevices.push(await dev.getPairedDeviceInfo(address))
      }
      pairedDevices.value = newPairedDevices
      activeDevice.value = await dev.getSource()
      audioStatus.value = await dev.getAllAudio()
    } finally {
      updating.value = false
    }
  }

  function onReceive(e: BoseConnectEvents['receive']) {
    if (!dev.value) return
    if (updating.value) return

    switch (e.detail.id) {
      case Function.BATTERY_LEVEL:
        batteryLevel.value = e.detail.payload
        break

      case Function.PRODUCT_NAME:
        if (deviceSettings.value) deviceSettings.value.name = e.detail.payload
        break

      case Function.VOICE_PROMPTS:
        if (deviceSettings.value) deviceSettings.value.language = e.detail.payload
        break

      case Function.STANDBY_TIMER:
        if (deviceSettings.value) deviceSettings.value.autoOff = e.detail.payload
        break

      case Function.ANR:
        if (deviceSettings.value) deviceSettings.value.anc = e.detail.payload
        break

      case Function.VOLUME:
        if (audioStatus.value) audioStatus.value.volume = e.detail.payload
        break

      case Function.SOURCE:
        activeDevice.value = e.detail.payload
        updating.value = true
        audioStatus.value = undefined
        dev.value.getAllAudio().then(status => {
          if (!audioStatus.value) {
            audioStatus.value = status
          }
        }).finally(() => {
          updating.value = false
        })
        break

      case Function.PLAYBACK_STATUS:
        if (audioStatus.value) audioStatus.value.playback = e.detail.payload
        break

      case Function.NOW_PLAYING:
        if (audioStatus.value) audioStatus.value.title = e.detail.payload
        break
    }
  }

  function onDisconnect() {
    if (dev.value?.port.connected) return

    dev.value = undefined
  }

  navigator.serial.addEventListener('disconnect', onDisconnect)

  onScopeDispose(async () => {
    await dev.value?.close()
    if (import.meta.hot) delete import.meta.hot.data.boseConnectDevice
    navigator.serial.removeEventListener('disconnect', onDisconnect)
  })

  return {
    dev,
    opening,
    updating,

    openPort,

    productId,
    productVersion,
    firmwareVersion,
    serialNumber,

    deviceSettings,
    batteryLevel,
    pairedDevices,
    activeDevice,
    audioStatus,
  }
})
