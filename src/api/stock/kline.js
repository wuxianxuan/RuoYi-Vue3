import request from '@/utils/request'

// 查询K线数据
export function queryKline(query) {
  return request({
    url: '/stock/kline/query',
    method: 'get',
    params: query
  })
}
