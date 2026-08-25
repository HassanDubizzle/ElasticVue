<template>
  <div v-if="newVersion" class="inline-block">
    <a class="decoration-none" href="https://github.com/HassanDubizzle/ElasticVue/releases" target="_blank"> Update
      {{ newVersion }} </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const version = __APP_VERSION__

const newVersion = ref(null)

const check = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/HassanDubizzle/ElasticVue/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (response.status === 200) {
      const json = await response.json()
      const latestVersion = json.tag_name?.replace(/^v/, '')
      if (latestVersion && latestVersion !== version) {
        newVersion.value = latestVersion
      }
    }
  } catch (_e) {}
}
onMounted(check)
</script>
