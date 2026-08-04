<template>
  <div class="min-h-screen bg-[#f4f5f9] flex items-center justify-center p-4 font-sans text-gray-800">
    <div class="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-pink-100 text-center">
      
      <!-- Icon & Logo Header -->
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 flex items-center justify-center text-[#fb7299]">
        <svg class="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h1 class="text-xl font-bold text-gray-900 mb-2">哨兵漫画数据库</h1>

      <!-- Status Message -->
      <div v-if="isChecking" class="py-6 text-gray-500 text-sm flex flex-col items-center gap-2">
        <div class="w-6 h-6 border-2 border-[#fb7299] border-t-transparent rounded-full animate-spin"></div>
        <span>正在接入最新哨兵高频节点...</span>
      </div>

      <div v-else-if="isOnline" class="py-6 text-emerald-600 text-sm font-medium">
        ✅ 节点连接正常！正在为您平滑跳转...
      </div>

      <div v-else class="py-4">
        <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 mb-3 border border-amber-200">
          🌙 服务器休眠 / 维护中
        </div>
        <p class="text-sm text-gray-600 leading-relaxed mb-6">
          当前数据库主节点正处于关机休眠或维护状态。<br />
          管理者启动电脑服务后，系统将自动无缝接入！
        </p>

        <!-- Buttons -->
        <div class="space-y-3">
          <button 
            @click="checkAndRedirect" 
            class="w-full py-2.5 px-4 bg-[#fb7299] hover:bg-[#f06288] text-white font-medium rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重新检测节点状态</span>
          </button>

          <NuxtLink 
            to="/" 
            class="block w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-all"
          >
            🛒 返回 VIP 发卡卡密商城
          </NuxtLink>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
        Sentinel Archive Node Gateway · 哔哩哔哩主题适配
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isChecking = ref(true)
const isOnline = ref(false)
const targetUrl = ref('')

const checkAndRedirect = async () => {
  isChecking.value = true
  isOnline.value = false

  try {
    const route = useRoute()
    if (route.query.node) {
      targetUrl.value = String(route.query.node)
    } else {
      // Try fetching static json or api
      try {
        const res = await $fetch('/sentinel-node.json?' + Date.now())
        if (res && res.url) {
          targetUrl.value = res.url
        }
      } catch(e) {
        const res = await $fetch('/api/sentinel-node')
        if (res && res.url) {
          targetUrl.value = res.url
        }
      }
    }

    if (targetUrl.value) {
      // Test ping to target node
      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 2000)
        await fetch(targetUrl.value, { mode: 'no-cors', signal: controller.signal })
        clearTimeout(id)
        
        isOnline.value = true
        setTimeout(() => {
          window.location.href = targetUrl.value
        }, 400)
        return
      } catch(e) {
        // Ping failed
      }
    }
  } catch(err) {
    console.error('Error checking node status:', err)
  } finally {
    isChecking.value = false
  }
}

onMounted(() => {
  checkAndRedirect()
})
</script>
