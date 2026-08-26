<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-input
          v-model="queryParams.stockCode"
          placeholder="请输入股票代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="股票名称" prop="stockName">
        <el-input
          v-model="queryParams.stockName"
          placeholder="请输入股票名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="市场" prop="market">
        <el-select v-model="queryParams.market" placeholder="请选择市场" clearable>
          <el-option v-for="m in marketOptions" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="行业" prop="industryIds">
          <el-tree-select
            v-model="queryParams.industryIds"
            :data="industryTreeData"
            :props="{ label: 'plateName', value: 'id', children: 'children' }"
            placeholder="请选择行业"
            clearable
            multiple
            check-strictly
            :render-after-expand="false"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="概念" prop="conceptIds">
          <el-select v-model="queryParams.conceptIds" multiple placeholder="请选择概念" clearable style="width: 200px">
            <el-option v-for="c in conceptOptions" :key="c.id" :label="c.plateName" :value="c.id" />
          </el-select>
        </el-form-item>
      <el-form-item label="所属分组" prop="groupIds">
          <el-select v-model="queryParams.groupIds" multiple placeholder="请选择分组" clearable style="width: 200px">
            <el-option v-for="g in groupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
          </el-select>
        </el-form-item>
      <el-form-item label="涨停数" prop="minLimitUpCount">
          <el-input-number v-model="queryParams.minLimitUpCount" :min="0" :controls="false" placeholder="涨停数下限" style="width: 150px" />
        </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Connection" :disabled="multiple" @click="handleGroupAssign">关联分组</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Document" @click="handleExportTxt">导出TXT</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="stockList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="股票代码" align="center" prop="stockCode" />
      <el-table-column label="股票名称" align="center" prop="stockName" />
      <el-table-column label="市场" align="center" prop="market" />
      <el-table-column label="行业" align="center" prop="industryName" :show-overflow-tooltip="true" />
      <el-table-column label="现价" align="center" prop="currentPrice" width="90">
        <template #default="scope">
          {{ scope.row.currentPrice != null ? scope.row.currentPrice : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="涨跌幅" align="center" prop="changeRate" width="90">
        <template #default="scope">
          <span v-if="scope.row.changeRate != null"
                :style="{ color: scope.row.changeRate > 0 ? '#e4393c' : scope.row.changeRate < 0 ? '#1ca01c' : '' }">
            {{ scope.row.changeRate > 0 ? '+' : '' }}{{ scope.row.changeRate }}%
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="市盈率(PE)" align="center" prop="peRatio" width="110">
        <template #default="scope">
          {{ scope.row.peRatio != null ? scope.row.peRatio : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="总市值" align="center" prop="totalMarketCap" width="130">
        <template #default="scope">
          {{ scope.row.totalMarketCap != null ? (scope.row.totalMarketCap / 100000000).toFixed(2) + '亿' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="换手率" align="center" prop="turnoverRate" width="90">
        <template #default="scope">
          {{ scope.row.turnoverRate != null ? scope.row.turnoverRate + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="量比" align="center" prop="volumeRatio" width="80">
        <template #default="scope">
          {{ scope.row.volumeRatio != null ? scope.row.volumeRatio : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="涨停数" align="center" prop="limitUpCount" width="80">
        <template #default="scope">
          {{ scope.row.limitUpCount != null ? scope.row.limitUpCount : 0 }}
        </template>
      </el-table-column>
<el-table-column label="概念" align="center" :show-overflow-tooltip="true" min-width="150">
          <template #default="scope">
            <template v-if="scope.row.conceptNames && scope.row.conceptNames.length">
              <span v-if="scope.row.conceptNames.length <= 2">
                {{ scope.row.conceptNames.join('、') }}
              </span>
              <el-tooltip v-else :content="scope.row.conceptNames.join('、')" placement="top">
                <span>{{ scope.row.conceptNames.slice(0, 2).join('、') }} ...</span>
              </el-tooltip>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
      <el-table-column label="所属分组" align="center" prop="groupNames" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-tag v-for="g in scope.row.groupIds" :key="g" size="small" style="margin: 2px">{{ getGroupName(g) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="TrendCharts" @click="handleGoKline(scope.row)">K线</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改股票基础对话框 -->
    <el-dialog :title="title" v-model="open" width="550px" append-to-body>
      <el-form ref="stockRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="股票代码" prop="stockCode">
              <el-input v-model="form.stockCode" placeholder="请输入股票代码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="股票名称" prop="stockName">
              <el-input v-model="form.stockName" placeholder="请输入股票名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="市场" prop="market">
              <el-input v-model="form.market" placeholder="请输入市场：SH（沪市）/ SZ（深市）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现价" prop="currentPrice">
              <el-input-number v-model="form.currentPrice" :precision="4" :controls="false" placeholder="现价" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="涨跌幅(%)" prop="changeRate">
              <el-input-number v-model="form.changeRate" :precision="4" :controls="false" placeholder="涨跌幅" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="市盈率(PE)" prop="peRatio">
              <el-input-number v-model="form.peRatio" :precision="4" :controls="false" placeholder="市盈率" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总市值" prop="totalMarketCap">
              <el-input-number v-model="form.totalMarketCap" :precision="4" :controls="false" placeholder="总市值" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="换手率(%)" prop="turnoverRate">
              <el-input-number v-model="form.turnoverRate" :precision="4" :controls="false" placeholder="换手率" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="量比" prop="volumeRatio">
              <el-input-number v-model="form.volumeRatio" :precision="4" :controls="false" placeholder="量比" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属分组" prop="groupIds">
              <el-select v-model="form.groupIds" multiple placeholder="请选择所属分组" style="width: 100%">
                <el-option v-for="g in groupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关联分组对话框 -->
    <el-dialog title="关联分组" v-model="groupOpen" width="400px" append-to-body>
      <el-form ref="groupFormRef" :model="groupForm" label-width="80px">
        <el-form-item label="选择分组" prop="groupId">
          <el-select v-model="groupForm.groupId" placeholder="请选择要关联的分组" style="width: 100%">
            <el-option v-for="g in groupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGroupAssign">确 定</el-button>
          <el-button @click="groupOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Stock">
import { listStock, getStock, delStock, addStock, updateStock, getStockGroups, bindStockGroups } from "@/api/stock/base"
import { listGroupAll } from "@/api/stock/group"
import { useStock } from "@/composables/useStock"

const { proxy } = getCurrentInstance()
const { industryTreeData, conceptOptions, loadFilters, goKline, MARKET_OPTIONS } = useStock()

const stockList = ref([])
const open = ref(false)
const groupOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const groupOptions = ref([])
const marketOptions = MARKET_OPTIONS

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    stockCode: undefined,
    stockName: undefined,
    market: undefined,
    industryIds: [],
    conceptIds: [],
    groupIds: [],
    minLimitUpCount: undefined,
  },
  rules: {
    stockCode: [
      { required: true, message: "股票代码不能为空", trigger: "blur" }
    ],
    stockName: [
      { required: true, message: "股票名称不能为空", trigger: "blur" }
    ],
  },
  groupForm: {
    groupId: undefined
  }
})

const { queryParams, form, rules, groupForm } = toRefs(data)

/** 根据分组ID获取分组名称 */
function getGroupName(groupId) {
  const g = groupOptions.value.find(item => item.id === groupId)
  return g ? g.groupName : ''
}

/** 加载所有分组 */
function loadGroups() {
  listGroupAll().then(response => {
    groupOptions.value = response.data
  })
}

/** 查询股票基础列表 */
function getList() {
  loading.value = true
  listStock(queryParams.value).then(response => {
    stockList.value = response.rows
    total.value = response.total
    // 加载每支股票的分组
    stockList.value.forEach(stock => {
      getStockGroups(stock.id).then(res => {
        stock.groupIds = res.data || []
      })
    })
  }).finally(() => {
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    stockCode: null,
    stockName: null,
    market: null,
    currentPrice: null,
    changeRate: null,
    priceChange: null,
    peRatio: null,
    totalMarketCap: null,
    circMarketCap: null,
    turnoverRate: null,
    volumeRatio: null,
    amplitude: null,
    turnoverAmount: null,
    circulatingShares: null,
    groupIds: [],
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("stockRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 跳转K线页面 */
function handleGoKline(row) {
  goKline(row)
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加股票基础"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getStock(_id).then(response => {
    form.value = response.data
    // 加载股票当前分组
    getStockGroups(_id).then(res => {
      form.value.groupIds = res.data || []
    })
    open.value = true
    title.value = "修改股票基础"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["stockRef"].validate(valid => {
    if (valid) {
      const groupIds = form.value.groupIds || []
      delete form.value.groupIds
      if (form.value.id != null) {
        updateStock(form.value).then(() => {
          // 更新分组关联
          bindStockGroups(form.value.id, groupIds).then(() => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            getList()
          })
        })
      } else {
        addStock(form.value).then(response => {
          // 新增后关联分组
          const newId = response.data || form.value.id
          if (newId && groupIds.length > 0) {
            bindStockGroups(newId, groupIds).then(() => {
              proxy.$modal.msgSuccess("新增成功")
              open.value = false
              getList()
            })
          } else {
            proxy.$modal.msgSuccess("新增成功")
            open.value = false
            getList()
          }
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除股票基础编号为"' + _ids + '"的数据项？').then(function() {
    return delStock(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 关联分组按钮操作 */
function handleGroupAssign() {
  groupForm.value.groupId = undefined
  groupOpen.value = true
}

/** 提交关联分组 */
function submitGroupAssign() {
  if (!groupForm.value.groupId) {
    proxy.$modal.msgError("请选择分组")
    return
  }
  // 逐个将选中的股票关联到分组
  const promises = ids.value.map(stockId =>
    getStockGroups(stockId).then(res => {
      const existing = res.data || []
      if (!existing.includes(groupForm.value.groupId)) {
        existing.push(groupForm.value.groupId)
      }
      return bindStockGroups(stockId, existing)
    })
  )
  Promise.all(promises).then(() => {
    proxy.$modal.msgSuccess("关联成功")
    groupOpen.value = false
    getList()
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('stock/base/export', {
    ...queryParams.value
  }, `stock_${new Date().getTime()}.xlsx`)
}

/** 导出股票代码TXT */
function handleExportTxt() {
  proxy.download('stock/base/exportTxt', {
    ...queryParams.value
  }, `stock_codes_${new Date().getTime()}.txt`)
}

loadGroups()
loadFilters()
getList()
</script>
