<template>
  <div class="min-h-screen bg-[#0f172a] flex items-center justify-center">
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const checkAndRedirect = async () => {
  const fallbackUrl = 'https://520menghuan.pages.dev'
  try {
    const res = await fetch('https://jsonblob.com/api/jsonBlob/019fe139-7dca-7555-9ee0-3fce11b7810f').then(r => r.json())
    const targetUrl = (res && (res.pagesUrl || res.url)) ? (res.pagesUrl || res.url) : fallbackUrl
    window.location.replace(targetUrl)
  } catch(err) {
    window.location.replace(fallbackUrl)
  }
}

onMounted(() => {
  checkAndRedirect()
})
</script>
