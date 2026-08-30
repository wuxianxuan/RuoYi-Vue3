import request from '@/utils/request'

// 查询股票基础列表
export function listStock(query) {
  return request({
    url: '/stock/base/list',
    method: 'get',
    params: query
  })
}

// 查询股票基础详细
export function getStock(id) {
  return request({
    url: '/stock/base/' + id,
    method: 'get'
  })
}

// 新增股票基础
export function addStock(data) {
  return request({
    url: '/stock/base',
    method: 'post',
    data: data
  })
}

// 修改股票基础
export function updateStock(data) {
  return request({
    url: '/stock/base',
    method: 'put',
    data: data
  })
}

// 删除股票基础
export function delStock(id) {
  return request({
    url: '/stock/base/' + id,
    method: 'delete'
  })
}

// 获取股票所属分组
export function getStockGroups(stockCode) {
  return request({
    url: '/stock/base/' + stockCode + '/groups',
    method: 'get'
  })
}

// 关联股票到分组
export function bindStockGroups(stockCode, groupIds) {
  return request({
    url: '/stock/base/' + stockCode + '/groups',
    method: 'post',
    data: groupIds
  })
}
