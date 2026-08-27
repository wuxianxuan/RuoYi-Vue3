/**
 * 股票模块共享 composable
 *
 * 提供：
 * - filterOptions: 行业树 / 概念列表（响应式）
 * - loadFilters():  加载行业树和概念列表
 * - goKline():      跳转到K线页面
 * - MARKET_OPTIONS: 市场选项
 */
import { ref } from 'vue'
import { listIndustryTree, listConceptList } from '@/api/stock/plate'
import { useRouter } from 'vue-router'
import { MARKET_OPTIONS } from '@/utils/stock/constants'

export function useStock() {
  const industryTreeData = ref([])
  const conceptOptions = ref([])
  const router = useRouter()

  /** 加载行业树 */
  function loadIndustryTree() {
    listIndustryTree().then(response => {
      industryTreeData.value = response.data
    })
  }

  /** 加载概念列表 */
  function loadConcepts() {
    listConceptList().then(response => {
      conceptOptions.value = response.data || []
    })
  }

  /** 加载行业树 + 概念列表（用于筛选条件） */
  function loadFilters() {
    loadIndustryTree()
    loadConcepts()
  }

  /** 跳转K线页面 */
  function goKline(row) {
    const route = router.resolve({
      path: '/stock/kline',
      query: { stockCode: row.stockCode, stockName: row.stockName }
    })
    window.open(route.href, '_blank')
  }

  return {
    industryTreeData,
    conceptOptions,
    loadIndustryTree,
    loadConcepts,
    loadFilters,
    goKline,
    MARKET_OPTIONS
  }
}
