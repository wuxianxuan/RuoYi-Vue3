import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询分组列表
export function listGroup(query) {
  return request({
    url: '/stock/group/list',
    method: 'get',
    params: query
  })
}

// 查询所有分组（下拉列表用）
export function listGroupAll() {
  return request({
    url: '/stock/group/all',
    method: 'get'
  })
}

// 查询分组详细
export function getGroup(id) {
  return request({
    url: '/stock/group/' + parseStrEmpty(id),
    method: 'get'
  })
}

// 新增分组
export function addGroup(data) {
  return request({
    url: '/stock/group',
    method: 'post',
    data: data
  })
}

// 修改分组
export function updateGroup(data) {
  return request({
    url: '/stock/group',
    method: 'put',
    data: data
  })
}

// 删除分组
export function delGroup(id) {
  return request({
    url: '/stock/group/' + id,
    method: 'delete'
  })
}

// 获取分组下的股票列表（分页）
export function getGroupStocks(query) {
  return request({
    url: '/stock/group/' + query.groupId + '/stocks',
    method: 'get',
    params: query
  })
}

// 批量添加股票到分组
export function addGroupStocks(groupId, stockCodes) {
  return request({
    url: '/stock/group/' + groupId + '/stocks',
    method: 'post',
    data: stockCodes
  })
}

// 从分组移除股票
export function delGroupStocks(groupId, stockCodes) {
  return request({
    url: '/stock/group/' + groupId + '/stocks',
    method: 'delete',
    data: stockCodes
  })
}

// 查询不在该分组的股票（用于新增弹窗）
export function listExcludeStocks(groupId, query) {
  return request({
    url: '/stock/group/' + groupId + '/stocks/exclude',
    method: 'get',
    params: query
  })
}
