<script setup lang="ts">
import { Toast } from 'bootstrap'
import { onMounted, shallowRef, watch } from 'vue'

const props = withDefaults(defineProps<{
  show: boolean;

  animation?: boolean;
  autohide?: boolean;
  delay?: number;
}>(), {
  // Bootstrap defaults, but they all have to be passed if options is provided.
  animation: true,
  autohide: true,
  delay: 5000,
})

const emit = defineEmits<{
  (e: 'showtoast'): void;
  (e: 'hidetoast'): void;
}>()

function onShow() {
  emit('showtoast')
}

function onHide() {
  emit('hidetoast')
}

const toastRef = shallowRef<HTMLDivElement>()
watch(toastRef, (toastRef, prevToastRef) => {
  if (prevToastRef) {
    prevToastRef.removeEventListener("show.bs.toast", onShow)
    prevToastRef.removeEventListener("hide.bs.toast", onHide)
  }

  if (toastRef) {
    toastRef.addEventListener("show.bs.toast", onShow)
    toastRef.addEventListener("hide.bs.toast", onHide)
  }
})

const toast = shallowRef<Toast>()
onMounted(() => {
  if (!toastRef.value) return

  toast.value = Toast.getOrCreateInstance(toastRef.value, {
    animation: props.animation,
    autohide: props.autohide,
    delay: props.delay,
  })

  if (props.show) toast.value.show()
})

watch(() => props.show, (show) => {
  if (show) toast.value?.show()
  else toast.value?.hide()
})

defineExpose({
  isShown() {
    return toast.value?.isShown() ?? false
  },
})
</script>

<template>
  <div ref="toastRef" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <slot />
  </div>
</template>
