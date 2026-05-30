import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询自选股列表
export function listFavorite(query) {
  return request({
    url: '/stock/favorite/list',
    method: 'get',
    params: query
  })
}

// 查询自选股详细
export function getFavorite(id) {
  return request({
    url: '/stock/favorite/' + parseStrEmpty(id),
    method: 'get'
  })
}

// 新增自选股
export function addFavorite(data) {
  return request({
    url: '/stock/favorite',
    method: 'post',
    data: data
  })
}

// 修改自选股
export function updateFavorite(data) {
  return request({
    url: '/stock/favorite',
    method: 'put',
    data: data
  })
}

// 删除自选股
export function delFavorite(id) {
  return request({
    url: '/stock/favorite/' + id,
    method: 'delete'
  })
}
