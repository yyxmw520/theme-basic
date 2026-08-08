<script setup>
const { locale } = useI18n()
const translate = useNuxtApp().$i18n.t

const selectedCate = ref({ name: translate('All'), code: 'all' })
const cates = ref([])
const skus = ref([])
const keyword = ref('')
const selectedSKU = useState('SelectedSKU', () => { return {} })

const filterSkus = (projects, keyword = '') => {
  const allCates = [{ name: translate('All'), code: 'all' }]
  const showSkus = []

  projects.forEach((project) => {
    if (!['DIGITAL', 'MANUAL', 'LICENSE', 'GROUP', 'VPN'].includes(project.type)) {
      return
    }

    allCates.push({
      'name': nameI18n(locale, project),
      'code': project.slug,
    })

    const curSkus = project.skus || []
    curSkus.forEach((sku) => {
      if (selectedCate.value.code != 'all' && selectedCate.value.code != project.slug) { return }

      const searchContent = `${nameI18n(locale, project)} ${nameI18n(locale, sku)}`.toLowerCase()
      if (keyword && !searchContent.includes(keyword.toLowerCase())) { return }

      sku.projectSlug = project.slug
      sku.cover = project.cover
      sku.project = {
        id: project.id,
        type: project.type,
        name: project.name,
        nameI18n: project.nameI18n,
        desc: project.desc,
        descI18n: project.descI18n,
        hasCoupons: project.hasCoupons,
      }
      sku.order.affCode = project.aff
      showSkus.push(sku)
    })
  })

  cates.value = allCates
  skus.value = showSkus
}

const props = defineProps(['merchant'])
const merchant = useDataMerchantInfo()
merchant.value = props.merchant
const siteSettings = merchant.value.website ? merchant.value.website.settings : {}

filterSkus(merchant.value.projects)

watch(merchant, () => {
  const merchantInfo = merchant.value
  if (!isNotEmptyObj(merchantInfo)) { return }
  filterSkus(merchantInfo.projects)
})

watch(keyword, () => {
  filterSkus(merchant.value.projects, keyword.value)
})

const changeCate = (code) => {
  cates.value.forEach((cate) => {
    if (cate.code == code) {
      selectedCate.value = cate
    }
  })
  filterSkus(merchant.value.projects)
}

const selectSKU = (sku) => {
  selectedSKU.value = sku
}

const openMangaDirect = async (e) => {
  if (e) e.preventDefault()
  try {
    const res = await fetch('https://jsonblob.com/api/jsonBlob/019fe139-7dca-7555-9ee0-3fce11b7810f').then(r => r.json())
    if (res && (res.pagesUrl || res.url)) {
      window.location.href = res.pagesUrl || res.url
      return
    }
  } catch(err) {}
  window.location.href = 'https://520menghuan.pages.dev'
}

onMounted(() => {
  stateMerchant.info(false);
});
</script>


<template>
  <section class="flex justify-center">
    <div v-if="isNotEmptyObj(merchant)" class="w-full max-w-screen-xl space-y-4 px-4 my-2">

      <div class="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-start">
          <BtnMerchantIntro :intro="descI18n(locale, merchant)" :siteSettings="siteSettings" />

          <a 
            href="/go.html" 
            @click="openMangaDirect"
            class="btn text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            style="background-color: #fb7299; border: none; padding: 6px 16px; font-size: 0.88rem;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>🌸 进入梦幻漫画</span>
          </a>
        </div>

        <div class="flex items-center gap-x-2 w-full sm:w-auto">
          <div v-if="!isNotEmptyObj(selectedSKU)" class="flex-1 sm:w-64">
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="search" v-model="keyword"
                class="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-gray-800"
                :placeholder="$t('Search')" />
            </div>
          </div>
          <BtnMerchantContact :contacts="merchant.contacts" :vertical="true" class="flex-shrink-0" />
        </div>
      </div>

      <ClientOnly v-if="!isNotEmptyObj(selectedSKU)">
        <Carousel :siteSettings="siteSettings" />
      </ClientOnly>

      <div v-if="!isNotEmptyObj(selectedSKU)" id="skus" class="space-y-4">
        <div class="space-y-2">
          <button v-for="cate in cates" @click="changeCate(cate.code)" class="mr-2 btn btn-xs btn-outline rounded-md"
            :class="{ 'btn-active': selectedCate.code == cate.code }">
            {{ cate.name }}
          </button>
        </div>

        <div v-if="selectedCate.code != 'all'" class="sku-name text-md text-gray-600 font-medium">
          {{ selectedCate.name }}
        </div>

        <!--skus-->
        <div
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 gap-y-4">
          <div v-for=" sku in skus" @click="selectSKU(sku)"
            class="relative w-full card bg-base-100 shadow-xl rounded-md card-compact cursor-pointer">
            <span v-if="sku.stock == 0"
              class="z-10 absolute -right-px -top-px rounded-bl-2xl rounded-tr-md bg-gray-600 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white">
              {{ $t('Sold_out') }}
            </span>

            <figure>
              <NuxtImg loading="lazy" format="webp" :src="sku.cover" :alt="nameI18n(locale, sku)"
                class="p-2 h-[120px] w-[120px] object-cover" />
            </figure>

            <div class="card-body">

              <div class="project-name text-xs text-gray-400 text-center">
                {{ nameI18n(locale, sku.project) }}
              </div>

              <div class="sku-name h-14 text-center">
                <span class="text-lg font-medium">
                  {{ nameI18n(locale, sku) }}
                </span>
              </div>

              <div class="flex items-center justify-center">
                <PriceTag :key="'price-tag-' + sku.id" :price-desc="sku.priceDesc" class="flex items-center gap-x-1" />
              </div>
            </div>
          </div>
        </div>
        <EmptyContent v-if="skus.length === 0" class="pt-40">{{ $t('No_Skus') }}</EmptyContent>
      </div>
      <div v-else>
        <PlaceOrder />
      </div>

    </div>
    <div v-else class="flex items-center justify-center pt-40">
      <span class="loading loading-infinity loading-lg mt-40"></span>
    </div>
  </section>
</template>



<style>
.project-name {
  display: -webkit-box;
  /* 将元素作为弹性伸缩盒子展示 */
  -webkit-line-clamp: 1;
  /* 限制文本行数为 1 行 */
  -webkit-box-orient: vertical;
  /* 设置伸缩盒子为垂直方向 */
  overflow: hidden;
  /* 隐藏溢出文本 */
  text-overflow: ellipsis;
  /* 使用省略号截断溢出文本 */
}

.sku-name {
  display: -webkit-box;
  /* 将元素作为弹性伸缩盒子展示 */
  -webkit-line-clamp: 2;
  /* 限制文本行数为 2 行 */
  -webkit-box-orient: vertical;
  /* 设置伸缩盒子为垂直方向 */
  overflow: hidden;
  /* 隐藏溢出文本 */
  text-overflow: ellipsis;
  /* 使用省略号截断溢出文本 */
}
</style>