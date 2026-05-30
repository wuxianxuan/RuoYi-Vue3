import request from '@/utils/request'

// 查询K线数据
export function queryKline(query) {
  return request({
    url: '/stock/kline/query',
    method: 'get',
    params: query
  })
}

// 股票代码前缀匹配（仅SH/SZ市场）
export function autocompleteStock(keyword) {
  return request({
    url: '/stock/base/autocomplete',
    method: 'get',
    params: { keyword }
  })
}
