<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { useDeviceStore } from './stores/device'
import Toast from './components/Toast.vue'
import MainView from './MainView.vue'

const BOSE_CONNECT_SERVICE_CLASS_ID = '00001101-0000-1000-8000-00805f9b34fb'

const device = useDeviceStore()
const error = ref('')
const errorShown = ref(false)

async function openAvailablePort() {
  const ports = (await navigator.serial.getPorts()).filter(
    (port) =>
      port.getInfo().bluetoothServiceClassId === BOSE_CONNECT_SERVICE_CLASS_ID && port.connected,
  )

  if (ports.length !== 1) return

  try {
    errorShown.value = false
    await device.openPort(ports[0])
  } catch (ex) {
    console.error(ex)
    error.value = String(ex)
    errorShown.value = true
  }
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

async function onClickOpen() {
  try {
    const port = await navigator.serial.requestPort({
      filters: [
        {
          bluetoothServiceClassId: BOSE_CONNECT_SERVICE_CLASS_ID,
        },
      ],
      allowedBluetoothServiceClassIds: [BOSE_CONNECT_SERVICE_CLASS_ID],
    })

    await device.openPort(port)
  } catch (ex) {
    if (ex instanceof DOMException && ex.name === 'NotFoundError') return

    throw ex
  }
}

async function onClickDisconnect() {
  await device.dev?.close()
}
</script>

<template>
  <div class="min-vh-100">
    <div class="d-flex min-vh-100 align-items-center justify-content-center" v-if="device.opening">
      <div class="text-center my-5">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="mt-3">Opening&hellip;</div>
      </div>
    </div>
    <MainView class="my-3" v-else-if="device.dev" />
    <div class="d-flex min-vh-100 align-items-center justify-content-center" v-else>
      <button class="btn btn-primary" @click="onClickOpen">Open device&hellip;</button>
    </div>
    <!--<button class="btn btn-secondary" @click="onClickDisconnect">Disconnect</button>-->

    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <Toast :show="errorShown" @hidetoast="errorShown = false">
        <div class="toast-header">
          <i class="bi bi-exclamation-circle-fill text-danger me-3" />
          <strong class="me-auto text-danger">Failed to connect</strong>
          <button class="btn btn-sm btn-link btn-secondary" @click="errorShown = false">
            <i class="bi bi-x" />
          </button>
        </div>

        <div class="toast-body">
          {{ error }}
        </div>
      </Toast>
    </div>
  </div>
</template>
