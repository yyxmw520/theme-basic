<script setup>
definePageMeta({
  layout: false
})

const OBJECT_ID = 'ff8081819f7e10ae019fcf6497ae7500'

const bannerText = ref('正在并行测速匹配国内直连低延迟节点...')
const statusDotVercel = ref('bg-gray-300')
const pingVercel = ref('测速中...')
const btnVercelDisabled = ref(true)

const statusDotCf = ref('bg-gray-300')
const pingCf = ref('测速中...')
const btnCfDisabled = ref(true)

const nodeUrls = reactive({
  vercel: 'https://theme-basic-delta-one.vercel.app/zh-cn',
  cf: ''
})

const fetchDynamicNode = async () => {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${OBJECT_ID}?t=${Date.now()}`)
    if (res.ok) {
      const data = await res.json()
      if (data && data.data && data.data.url) {
        nodeUrls.cf = data.data.url
      }
    }
  } catch(e) {}
}

const testNode = async (key, url) => {
  const start = Date.now()
  if (!url) {
    if (key === 'vercel') {
      statusDotVercel.value = 'bg-amber-400'
      pingVercel.value = '无节点'
      btnVercelDisabled.value = true
    } else {
      statusDotCf.value = 'bg-amber-400'
      pingCf.value = '离线 / 未开启'
      btnCfDisabled.value = true
    }
    return { key, latency: 9999, ok: false }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    await fetch(url, { mode: 'no-cors', signal: controller.signal })
    clearTimeout(timeoutId)

    const latency = Date.now() - start
    if (key === 'vercel') {
      statusDotVercel.value = 'bg-emerald-500'
      pingVercel.value = `延迟: ${latency} ms (直连通道)`
      btnVercelDisabled.value = false
    } else {
      statusDotCf.value = 'bg-emerald-500'
      pingCf.value = `延迟: ${latency} ms (完美免翻墙)`
      btnCfDisabled.value = false
    }
    return { key, latency, ok: true, url }
  } catch(e) {
    if (key === 'vercel') {
      statusDotVercel.value = 'bg-red-400'
      pingVercel.value = '连接超时 (遭国内阻断)'
      btnVercelDisabled.value = false
    } else {
      statusDotCf.value = 'bg-red-400'
      pingCf.value = '连接超时'
      btnCfDisabled.value = false
    }
    return { key, latency: 9999, ok: false, url }
  }
}

const runSpeedTest = async () => {
  bannerText.value = '正在测速匹配最佳节点...'
  await fetchDynamicNode()

  const results = await Promise.all([
    testNode('vercel', nodeUrls.vercel),
    testNode('cf', nodeUrls.cf)
  ])

  const available = results.filter(r => r.ok).sort((a, b) => a.latency - b.latency)

  if (available.length > 0) {
    const best = available[0]
    bannerText.value = `已为您成功锁定最佳全平高速线路 (${best.key === 'vercel' ? 'Vercel 节点' : 'Cloudflare 亚洲加速节点'})，正在接入...`
    setTimeout(() => {
      window.location.href = best.url
    }, 400)
  } else if (nodeUrls.cf) {
    bannerText.value = '默认 Vercel 节点受到运营商干扰，自动切换至 Cloudflare 免翻墙加速节点...'
    setTimeout(() => {
      window.location.href = nodeUrls.cf
    }, 600)
  } else {
    bannerText.value = '暂未检测到存活的远端节点，您可以尝试刷新或开启服务。'
  }
}

const directGo = (key) => {
  if (nodeUrls[key]) {
    window.location.href = nodeUrls[key]
  }
}

onMounted(() => {
  runSpeedTest()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
    <div class="max-w-lg w-full bg-white rounded-2xl p-6 shadow-xl border border-pink-100">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-pink-50 flex items-center justify-center text-[#fb7299]">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">梦幻发卡网 · 智能高速网关</h1>
        <p class="text-xs text-gray-500 mt-1">自动检测您当前网络（移动/电信/联通/海外）最佳直连线路</p>
      </div>

      <!-- Status Banner -->
      <div class="mb-6 p-4 rounded-xl bg-pink-50 border border-pink-100 flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-[#fb7299] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        <div class="text-xs text-gray-700 font-medium">{{ bannerText }}</div>
      </div>

      <!-- Nodes List -->
      <div class="space-y-3 mb-6">
        <!-- Node 1: Vercel CDN -->
        <div class="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="statusDotVercel"></div>
            <div>
              <div class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>节点 1：Vercel 国际主节点</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-normal">默认路线</span>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ pingVercel }}</div>
            </div>
          </div>
          <button @click="directGo('vercel')" :disabled="btnVercelDisabled" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all" :class="btnVercelDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-50 text-[#fb7299] hover:bg-pink-100'">
            手动接入
          </button>
        </div>

        <!-- Node 2: Cloudflare Fast Edge -->
        <div class="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :class="statusDotCf"></div>
            <div>
              <div class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>节点 2：Cloudflare 亚洲免翻墙节点</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-normal">国内推荐</span>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ pingCf }}</div>
            </div>
          </div>
          <button @click="directGo('cf')" :disabled="btnCfDisabled" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all" :class="btnCfDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-50 text-[#fb7299] hover:bg-pink-100'">
            手动接入
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2.5">
        <button 
          @click="runSpeedTest" 
          class="w-full py-2.5 px-4 bg-[#fb7299] hover:bg-[#f06288] text-white font-medium rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>重新测试线路网速</span>
        </button>

        <a 
          href="/zh-cn" 
          class="block w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-medium rounded-xl text-sm transition-all"
        >
          🛒 直接尝试进入默认商城
        </a>
      </div>

      <div class="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Dream Store Gateway · 多网络自适应路由引擎
      </div>
    </div>
  </div>
</template>
