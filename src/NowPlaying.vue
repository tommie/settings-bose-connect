<script setup lang="ts">
import { computed } from 'vue'

import { PlaybackStatus, PlaybackTitleKind } from './boseconnect'

const props = defineProps<{
  status: PlaybackStatus
  data: { kind: PlaybackTitleKind; text: string }[]
  source?: string
}>()

function takeKind(kind: PlaybackTitleKind) {
  return props.data.find((item) => item.kind === kind)?.text ?? ''
}

const track = computed(() => takeKind(PlaybackTitleKind.SONG_TITLE))
const artist = computed(() => takeKind(PlaybackTitleKind.ARTIST))
const album = computed(() => takeKind(PlaybackTitleKind.ALBUM))
</script>

<template>
  <div class="card bg-transparent border-0 my-3">
    <div class="card-body d-flex align-items-center">
      <i
        class="bi bi-play-circle-fill text-primary fs-4 me-3"
        v-if="status === PlaybackStatus.PLAYING"
      />
      <i class="bi bi-stop-circle text-secondary fs-4 me-3" v-else />
      <div class="flex-grow-1 text-center">
        <div class="mb-1" v-if="track">{{ track }}</div>
        <div class="text-secondary small" v-if="artist || album">
          {{ artist }}{{ artist && album ? ' • ' : '' }}{{ album }}
        </div>
        <div class="text-secondary small" v-if="source">From: {{ source }}</div>
      </div>
      <i class="bi bi-play-circle-fill text-primary fs-4 ms-3 invisible"></i>
    </div>
  </div>
</template>
