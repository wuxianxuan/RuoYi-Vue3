<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分组名称" prop="groupName">
        <el-input v-model="queryParams.groupName" placeholder="请输入分组名称" clearable @keyup.enter="handleQuery"/>
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分组名称" align="center" prop="groupName" :show-overflow-tooltip="true" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAddStocks(scope.row)">新增股票</el-button>
          <el-button link type="primary" icon="List" @click="handleStockList(scope.row)">股票列表</el-button>
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

    <!-- 添加或修改分组对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="groupRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增股票弹窗 -->
    <el-dialog :title="'新增股票 - ' + currentGroupName" v-model="addStockOpen" width="900px" append-to-body @opened="loadAddStocks">
      <el-form :model="addStockQuery" :inline="true" label-width="68px">
        <el-form-item label="股票代码" prop="stockCode">
          <el-input v-model="addStockQuery.stockCode" placeholder="请输入股票代码" clearable @keyup.enter="handleAddStockQuery"/>
        </el-form-item>
        <el-form-item label="股票名称" prop="stockName">
          <el-input v-model="addStockQuery.stockName" placeholder="请输入股票名称" clearable @keyup.enter="handleAddStockQuery"/>
        </el-form-item>
        <el-form-item label="市场" prop="market">
          <el-input v-model="addStockQuery.market" placeholder="SH/SZ/BJ/HK/US" clearable @keyup.enter="handleAddStockQuery"/>
        </el-form-item>
        <el-form-item label="行业" prop="industryId">
          <el-tree-select
            v-model="addStockQuery.industryId"
            :data="industryTreeData"
            :props="{ label: 'plateName', value: 'id', children: 'children' }"
            placeholder="请选择行业"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="概念" prop="conceptIds">
          <el-select v-model="addStockQuery.conceptIds" multiple placeholder="请选择概念" clearable style="width: 200px">
            <el-option v-for="c in conceptOptions" :key="c.id" :label="c.plateName" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleAddStockQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetAddStockQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table ref="addStockTableRef" v-loading="addStockLoading" :data="addStockList" @selection-change="handleAddStockSelect" max-height="400">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="股票代码" align="center" prop="stockCode" width="120" />
        <el-table-column label="股票名称" align="center" prop="stockName" width="150" />
        <el-table-column label="市场" align="center" prop="market" width="120" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      </el-table>

      <pagination
        v-show="addStockTotal>0"
        :total="addStockTotal"
        v-model:page="addStockQuery.pageNum"
        v-model:limit="addStockQuery.pageSize"
        @pagination="loadAddStocks"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAddStocks" :disabled="addSelectedIds.length === 0">确 定</el-button>
          <el-button @click="addStockOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 股票列表弹窗 -->
    <el-dialog :title="currentGroupName + ' - 股票列表'" v-model="detailStockOpen" width="900px" append-to-body @opened="loadDetailStocks">
      <el-table v-loading="detailStockLoading" :data="detailStockList" max-height="400">
        <el-table-column label="股票代码" align="center" prop="stockCode" width="120" />
        <el-table-column label="股票名称" align="center" prop="stockName" width="150" />
        <el-table-column label="市场" align="center" prop="market" width="120" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
          <template #default="scope">
            <el-button link type="primary" icon="TrendCharts" @click="handleGoKline(scope.row)">K线</el-button>
            <el-button link type="danger" icon="Delete" @click="handleRemoveStock(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="detailStockTotal>0"
        :total="detailStockTotal"
        v-model:page="detailStockQuery.pageNum"
        v-model:limit="detailStockQuery.pageSize"
        @pagination="loadDetailStocks"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailStockOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StockGroup">
import { listGroup, getGroup, delGroup, addGroup, updateGroup, getGroupStocks, addGroupStocks, delGroupStocks, listExcludeStocks } from "@/api/stock/group"
import { useStock } from "@/composables/useStock"

const { proxy } = getCurrentInstance()
const { industryTreeData, conceptOptions, loadFilters, goKline } = useStock()

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const groupList = ref([])
const title = ref("")
const open = ref(false)

// 新增股票相关
const addStockOpen = ref(false)
const addStockLoading = ref(false)
const addStockTotal = ref(0)
const addStockList = ref([])
const addSelectedIds = ref([])
const currentGroupId = ref(null)
const currentGroupName = ref('')

const addStockQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  stockCode: undefined,
  stockName: undefined,
  market: undefined,
  industryId: undefined,
  conceptIds: []
})

// 详情列表相关
const detailStockOpen = ref(false)
const detailStockLoading = ref(false)
const detailStockTotal = ref(0)
const detailStockList = ref([])

const detailStockQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  groupId: null
})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupName: undefined
  },
  form: {},
  rules: {
    groupName: [{ required: true, message: "分组名称不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询分组列表 */
function getList() {
  loading.value = true
  listGroup(queryParams.value).then(response => {
    groupList.value = response.rows
    total.value = response.total
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
    id: undefined,
    groupName: undefined,
    sortOrder: 0,
    remark: undefined
  }
  proxy.resetForm("groupRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
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
  title.value = "添加分组"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getGroup(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改分组"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["groupRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateGroup(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addGroup(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除分组编号为"' + _ids + '"的数据项？').then(function() {
    return delGroup(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

// ==================== 新增股票 ====================

/** 打开新增股票对话框 */
function handleAddStocks(row) {
  currentGroupId.value = row.id
  currentGroupName.value = row.groupName
  addStockQuery.pageNum = 1
  addStockQuery.stockCode = undefined
  addStockQuery.stockName = undefined
  addStockQuery.market = undefined
  addStockQuery.industryId = undefined
  addStockQuery.conceptIds = []
  addSelectedIds.value = []
  addStockOpen.value = true
}

/** 加载可选股票列表（排除已添加的） */
function loadAddStocks() {
  addStockLoading.value = true
  listExcludeStocks(currentGroupId.value, addStockQuery).then(response => {
    addStockList.value = response.rows
    addStockTotal.value = response.total
  }).finally(() => {
    addStockLoading.value = false
  })
}

/** 搜索新增股票 */
function handleAddStockQuery() {
  addStockQuery.pageNum = 1
  loadAddStocks()
}

/** 重置新增股票搜索 */
function resetAddStockQuery() {
  addStockQuery.stockCode = undefined
  addStockQuery.stockName = undefined
  addStockQuery.market = undefined
  addStockQuery.industryId = undefined
  addStockQuery.conceptIds = []
  handleAddStockQuery()
}

/** 新增股票选中 */
function handleAddStockSelect(selection) {
  addSelectedIds.value = selection.map(item => item.stockCode)
}

/** 提交新增 */
function submitAddStocks() {
  if (addSelectedIds.value.length === 0) {
    proxy.$modal.msgWarning("请至少选择一只股票")
    return
  }
  addGroupStocks(currentGroupId.value, addSelectedIds.value).then(() => {
    proxy.$modal.msgSuccess("新增成功")
    addStockOpen.value = false
    getList()
  })
}

// ==================== 股票列表 ====================

/** 打开股票列表对话框 */
function handleStockList(row) {
  currentGroupId.value = row.id
  currentGroupName.value = row.groupName
  detailStockQuery.pageNum = 1
  detailStockQuery.groupId = row.id
  detailStockOpen.value = true
}

/** 加载分组下的股票列表 */
function loadDetailStocks() {
  detailStockLoading.value = true
  getGroupStocks(detailStockQuery).then(response => {
    detailStockList.value = response.rows || []
    detailStockTotal.value = response.total || 0
  }).finally(() => {
    detailStockLoading.value = false
  })
}

/** 在新标签页打开K线查询 */
function handleGoKline(row) {
  goKline(row)
}

/** 移除股票 */
function handleRemoveStock(row) {
  proxy.$modal.confirm('是否确认将股票"' + row.stockName + '(' + row.stockCode + ')' + '"从该分组中移除？').then(function() {
    return delGroupStocks(currentGroupId.value, [row.stockCode])
  }).then(() => {
    proxy.$modal.msgSuccess("移除成功")
    loadDetailStocks()
    getList()
  }).catch(() => {})
}

loadFilters()
getList()
</script>
