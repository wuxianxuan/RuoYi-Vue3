/**
 * 股票模块共享常量
 */
export const MARKET_OPTIONS = [
  { label: '上证 (SH)', value: 'SH' },
  { label: '深证 (SZ)', value: 'SZ' },
  { label: '北证 (BJ)', value: 'BJ' },
]

/**
 * 跳转到K线页面
 */
export function goKline(router, row) {
  const route = router.resolve({
    path: '/stock/kline',
    query: { stockCode: row.stockCode, stockName: row.stockName }
  })
  window.open(route.href, '_blank')
}
