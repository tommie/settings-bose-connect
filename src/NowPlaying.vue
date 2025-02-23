<script setup lang="ts">
import { PlaybackStatus, PlaybackTitleKind } from './boseconnect'

const props = defineProps<{
  status: PlaybackStatus,
  data: { kind: PlaybackTitleKind, text: string }[],
  source?: string,
}>()

function takeKind(kind: PlaybackTitleKind) {
  return props.data.find(item => item.kind === kind)?.text ?? ''
}
</script>

<template>
  <div class="card bg-transparent border-0 my-3">
    <div class="card-body d-flex align-items-center">
      <i class="bi bi-play-circle-fill text-primary fs-4 me-3" v-if="status === PlaybackStatus.PLAYING" />
      <i class="bi bi-stop-circle text-secondary fs-4 me-3" v-else />
      <div class="flex-grow-1 text-center">
        <div class="mb-1" v-if="data.length">{{ takeKind(PlaybackTitleKind.TRACK) }}</div>
        <div class="text-secondary small" v-if="data.length">{{ takeKind(PlaybackTitleKind.ARTIST) }} • {{ takeKind(PlaybackTitleKind.ALBUM)
        }}</div>
        <div class="text-secondary small" v-if="source">From: {{ source }}</div>
      </div>
      <i class="bi bi-play-circle-fill text-primary fs-4 ms-3 invisible"></i>
    </div>
  </div>
</template>
