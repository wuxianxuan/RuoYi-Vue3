import request from '@/utils/request'

/**
 * 查询推荐结果列表
 * @param {Object} query - { recommendDate: 'yyyy-MM-dd' }
 */
export function listRecommend(query) {
  return request({
    url: '/stock/recommend/list',
    method: 'get',
    params: query
  })
}

/**
 * 手动触发推荐引擎
 * @param {number} topN - 推荐数量
 */
export function executeRecommend(topN) {
  return request({
    url: '/stock/recommend/execute',
    method: 'post',
    params: { topN }
  })
}
