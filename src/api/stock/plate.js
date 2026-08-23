import request from '@/utils/request'

// 查询板块列表
export function listPlate(query) {
  return request({
    url: '/stock/plate/list',
    method: 'get',
    params: query
  })
}

// 查询板块详细
export function getPlate(id) {
  return request({
    url: '/stock/plate/' + id,
    method: 'get'
  })
}

// 新增板块
export function addPlate(data) {
  return request({
    url: '/stock/plate',
    method: 'post',
    data: data
  })
}

// 修改板块
export function updatePlate(data) {
  return request({
    url: '/stock/plate',
    method: 'put',
    data: data
  })
}

// 删除板块
export function delPlate(id) {
  return request({
    url: '/stock/plate/' + id,
    method: 'delete'
  })
}

// 查询行业板块树
export function listIndustryTree() {
  return request({
    url: '/stock/plate/tree',
    method: 'get'
  })
}

// 查询概念板块列表（不分页）
export function listConceptList() {
  return request({
    url: '/stock/plate/concept/list',
    method: 'get'
  })
}

// 获取板块下的股票列表（分页）
export function getPlateStocks(query) {
  return request({
    url: '/stock/plate/' + query.plateId + '/stocks',
    method: 'get',
    params: query
  })
}

// 批量添加股票到板块
export function addPlateStocks(plateId, stockIds) {
  return request({
    url: '/stock/plate/' + plateId + '/stocks',
    method: 'post',
    data: stockIds
  })
}

// 从板块移除股票
export function delPlateStocks(plateId, stockIds) {
  return request({
    url: '/stock/plate/' + plateId + '/stocks',
    method: 'delete',
    data: stockIds
  })
}

// 解析粘贴的股票代码
export function parseStockCodes(text) {
  return request({
    url: '/stock/plate/parse-codes',
    method: 'post',
    data: { text }
  })
}
