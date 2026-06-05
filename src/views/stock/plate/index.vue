<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- ==================== 行业板块 Tab ==================== -->
      <el-tab-pane label="行业板块" name="industry">
        <el-row :gutter="20">
          <!-- 左侧：行业树 -->
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>行业板块</span>
                  <el-button type="primary" size="small" icon="Plus" @click="handleAddPlate('INDUSTRY')">新增</el-button>
                </div>
              </template>
              <el-tree
                ref="industryTreeRef"
                :data="industryTreeData"
                :props="{ label: 'plateName', children: 'children' }"
                node-key="id"
                highlight-current
                default-expand-all
                @node-click="handleIndustryNodeClick"
              >
                <template #default="{ node, data }">
                  <span style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span>{{ data.plateName }}</span>
                    <span>
                      <el-button link type="primary" size="small" icon="Plus" @click.stop="handleAddChild(data)" title="新增子级" />
                      <el-button link type="primary" size="small" icon="Edit" @click.stop="handleEditPlate(data)" title="编辑" />
                      <el-button link type="danger" size="small" icon="Delete" @click.stop="handleDeletePlate(data)" :disabled="data.children && data.children.length > 0" title="删除" />
                    </span>
                  </span>
                </template>
              </el-tree>
            </el-card>
          </el-col>

          <!-- 右侧：板块详情 + 关联股票 -->
          <el-col :span="16">
            <el-card shadow="never" v-if="currentPlate">
              <template #header>
                <span>{{ currentPlate.plateName }} - 详情</span>
              </template>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="板块名称">{{ currentPlate.plateName }}</el-descriptions-item>
                <el-descriptions-item label="板块类型">行业板块</el-descriptions-item>
                <el-descriptions-item label="层级">{{ currentPlate.level }}</el-descriptions-item>
                <el-descriptions-item label="排序">{{ currentPlate.sortOrder }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ currentPlate.remark || '-' }}</el-descriptions-item>
              </el-descriptions>

              <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">关联股票</span>
                <el-button type="primary" size="small" icon="Plus" @click="handleBatchAddStocks">批量添加</el-button>
              </div>

              <el-table v-loading="plateStockLoading" :data="plateStockList" max-height="400" style="margin-top: 8px;">
                <el-table-column label="股票代码" align="center" prop="stockCode" width="120" />
                <el-table-column label="股票名称" align="center" prop="stockName" width="150" />
                <el-table-column label="市场" align="center" prop="market" width="100" />
                <el-table-column label="操作" align="center" width="100">
                  <template #default="scope">
                    <el-button link type="danger" icon="Delete" @click="handleRemovePlateStock(scope.row)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <pagination
                v-show="plateStockTotal > 0"
                :total="plateStockTotal"
                v-model:page="plateStockQuery.pageNum"
                v-model:limit="plateStockQuery.pageSize"
                @pagination="loadPlateStocks"
              />
            </el-card>
            <el-card shadow="never" v-else>
              <el-empty description="请在左侧选择一个行业板块" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- ==================== 概念板块 Tab ==================== -->
      <el-tab-pane label="概念板块" name="concept">
        <el-row :gutter="20">
          <!-- 左侧：概念列表 -->
          <el-col :span="8">
            <el-card shadow="never">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>概念板块</span>
                  <el-button type="primary" size="small" icon="Plus" @click="handleAddPlate('CONCEPT')">新增</el-button>
                </div>
              </template>
              <el-table
                :data="conceptList"
                highlight-current-row
                @current-change="handleConceptRowClick"
                max-height="500"
                size="small"
              >
                <el-table-column label="概念名称" prop="plateName" :show-overflow-tooltip="true" />
                <el-table-column label="排序" prop="sortOrder" width="60" align="center" />
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button link type="primary" size="small" icon="Edit" @click.stop="handleEditPlate(scope.row)" />
                    <el-button link type="danger" size="small" icon="Delete" @click.stop="handleDeletePlate(scope.row)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <!-- 右侧：板块详情 + 关联股票 -->
          <el-col :span="16">
            <el-card shadow="never" v-if="currentPlate && currentPlate.plateType === 'CONCEPT'">
              <template #header>
                <span>{{ currentPlate.plateName }} - 详情</span>
              </template>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="板块名称">{{ currentPlate.plateName }}</el-descriptions-item>
                <el-descriptions-item label="板块类型">概念板块</el-descriptions-item>
                <el-descriptions-item label="排序">{{ currentPlate.sortOrder }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{ currentPlate.remark || '-' }}</el-descriptions-item>
              </el-descriptions>

              <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">关联股票</span>
                <el-button type="primary" size="small" icon="Plus" @click="handleBatchAddStocks">批量添加</el-button>
              </div>

              <el-table v-loading="plateStockLoading" :data="plateStockList" max-height="400" style="margin-top: 8px;">
                <el-table-column label="股票代码" align="center" prop="stockCode" width="120" />
                <el-table-column label="股票名称" align="center" prop="stockName" width="150" />
                <el-table-column label="市场" align="center" prop="market" width="100" />
                <el-table-column label="操作" align="center" width="100">
                  <template #default="scope">
                    <el-button link type="danger" icon="Delete" @click="handleRemovePlateStock(scope.row)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <pagination
                v-show="plateStockTotal > 0"
                :total="plateStockTotal"
                v-model:page="plateStockQuery.pageNum"
                v-model:limit="plateStockQuery.pageSize"
                @pagination="loadPlateStocks"
              />
            </el-card>
            <el-card shadow="never" v-else>
              <el-empty description="请在左侧选择一个概念板块" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- ==================== 板块新增/编辑对话框 ==================== -->
    <el-dialog :title="plateDialogTitle" v-model="plateDialogOpen" width="500px" append-to-body>
      <el-form ref="plateFormRef" :model="plateForm" :rules="plateFormRules" label-width="100px">
        <el-form-item label="板块名称" prop="plateName">
          <el-input v-model="plateForm.plateName" placeholder="请输入板块名称" />
        </el-form-item>
        <el-form-item label="父级板块" prop="parentId" v-if="plateForm.plateType === 'INDUSTRY'">
          <el-tree-select
            v-model="plateForm.parentId"
            :data="industryTreeData"
            :props="{ label: 'plateName', value: 'id', children: 'children' }"
            placeholder="无（顶级板块）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="plateForm.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="plateForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPlateForm">确 定</el-button>
          <el-button @click="plateDialogOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ==================== 批量添加股票对话框 ==================== -->
    <el-dialog title="批量添加股票" v-model="batchAddOpen" width="700px" append-to-body>
      <el-input
        v-model="batchAddText"
        type="textarea"
        :rows="6"
        placeholder="粘贴股票代码，支持多种格式：&#10;纯代码: 600026&#10;代码+名称: 600026&#9;XX银行&#10;带前缀: sh600026&#10;逗号分隔: 600026,601128,601169"
      />
      <el-button type="primary" style="margin-top: 10px;" @click="handleParseCodes" :loading="parseLoading">解析代码</el-button>

      <div v-if="parsedResult" style="margin-top: 16px;">
        <h4>匹配结果（{{ parsedResult.matched.length }} 只）</h4>
        <el-table :data="parsedResult.matched" max-height="200" size="small" border>
          <el-table-column label="股票代码" prop="stockCode" width="120" />
          <el-table-column label="股票名称" prop="stockName" />
        </el-table>

        <h4 v-if="parsedResult.unmatched.length > 0" style="margin-top: 10px; color: #f56c6c;">未匹配代码（{{ parsedResult.unmatched.length }} 个）</h4>
        <p v-if="parsedResult.unmatched.length > 0" style="color: #909399;">{{ parsedResult.unmatched.join(', ') }}</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBatchAdd" :disabled="!parsedResult || parsedResult.matched.length === 0">确认添加</el-button>
          <el-button @click="batchAddOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StockPlate">
import { listPlate, getPlate, addPlate, updatePlate, delPlate, listIndustryTree, getPlateStocks, addPlateStocks, delPlateStocks, parseStockCodes } from "@/api/stock/plate"
import { handleTree } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const activeTab = ref('industry')
const industryTreeData = ref([])
const conceptList = ref([])
const currentPlate = ref(null)

// 关联股票相关
const plateStockLoading = ref(false)
const plateStockList = ref([])
const plateStockTotal = ref(0)
const plateStockQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  plateId: null
})

// 板块新增/编辑对话框
const plateDialogOpen = ref(false)
const plateDialogTitle = ref('')
const plateForm = ref({})
const plateFormRules = {
  plateName: [{ required: true, message: '板块名称不能为空', trigger: 'blur' }]
}

// 批量添加
const batchAddOpen = ref(false)
const batchAddText = ref('')
const parseLoading = ref(false)
const parsedResult = ref(null)

// ==================== 数据加载 ====================

function loadIndustryTree() {
  listIndustryTree().then(response => {
    const list = response.data || []
    industryTreeData.value = handleTree(list, 'id', 'parentId', 'children')
  })
}

function loadConceptList() {
  listPlate({ plateType: 'CONCEPT' }).then(response => {
    conceptList.value = response.rows || []
  })
}

function loadPlateStocks() {
  if (!currentPlate.value) return
  plateStockLoading.value = true
  plateStockQuery.plateId = currentPlate.value.id
  getPlateStocks(plateStockQuery).then(response => {
    plateStockList.value = response.rows || []
    plateStockTotal.value = response.total || 0
  }).finally(() => {
    plateStockLoading.value = false
  })
}

// ==================== Tab 切换 ====================

function handleTabClick() {
  currentPlate.value = null
  plateStockList.value = []
  plateStockTotal.value = 0
}

// ==================== 行业树点击 ====================

function handleIndustryNodeClick(data) {
  currentPlate.value = data
  plateStockQuery.pageNum = 1
  loadPlateStocks()
}

// ==================== 概念行点击 ====================

function handleConceptRowClick(row) {
  if (row) {
    currentPlate.value = row
    plateStockQuery.pageNum = 1
    loadPlateStocks()
  }
}

// ==================== 板块新增/编辑 ====================

function handleAddPlate(plateType) {
  plateForm.value = {
    id: undefined,
    plateName: undefined,
    plateType: plateType,
    parentId: plateType === 'CONCEPT' ? 0 : undefined,
    sortOrder: 0,
    remark: undefined
  }
  plateDialogTitle.value = plateType === 'INDUSTRY' ? '新增行业板块' : '新增概念板块'
  plateDialogOpen.value = true
}

function handleAddChild(parentData) {
  plateForm.value = {
    id: undefined,
    plateName: undefined,
    plateType: 'INDUSTRY',
    parentId: parentData.id,
    sortOrder: 0,
    remark: undefined
  }
  plateDialogTitle.value = '新增子级板块'
  plateDialogOpen.value = true
}

function handleEditPlate(data) {
  plateForm.value = {
    id: data.id,
    plateName: data.plateName,
    plateType: data.plateType,
    parentId: data.parentId,
    sortOrder: data.sortOrder,
    remark: data.remark
  }
  plateDialogTitle.value = '编辑板块'
  plateDialogOpen.value = true
}

function submitPlateForm() {
  proxy.$refs["plateFormRef"].validate(valid => {
    if (valid) {
      if (plateForm.value.id != undefined) {
        updatePlate(plateForm.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          plateDialogOpen.value = false
          refreshData()
        })
      } else {
        addPlate(plateForm.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          plateDialogOpen.value = false
          refreshData()
        })
      }
    }
  })
}

function handleDeletePlate(data) {
  proxy.$modal.confirm('是否确认删除板块"' + data.plateName + '"？').then(function() {
    return delPlate(data.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    currentPlate.value = null
    refreshData()
  }).catch(() => {})
}

// ==================== 关联股票管理 ====================

function handleBatchAddStocks() {
  batchAddText.value = ''
  parsedResult.value = null
  batchAddOpen.value = true
}

function handleParseCodes() {
  if (!batchAddText.value.trim()) {
    proxy.$modal.msgWarning("请输入股票代码")
    return
  }
  parseLoading.value = true
  parseStockCodes(batchAddText.value).then(response => {
    parsedResult.value = response.data
    parseLoading.value = false
  }).catch(() => {
    parseLoading.value = false
  })
}

function submitBatchAdd() {
  if (!parsedResult.value || parsedResult.value.matched.length === 0) return
  const stockIds = parsedResult.value.matched.map(s => s.id)
  addPlateStocks(currentPlate.value.id, stockIds).then(() => {
    proxy.$modal.msgSuccess("添加成功")
    batchAddOpen.value = false
    loadPlateStocks()
  })
}

function handleRemovePlateStock(row) {
  proxy.$modal.confirm('是否确认将股票"' + row.stockName + '(' + row.stockCode + ')"从该板块中移除？').then(function() {
    return delPlateStocks(currentPlate.value.id, [row.id])
  }).then(() => {
    proxy.$modal.msgSuccess("移除成功")
    loadPlateStocks()
  }).catch(() => {})
}

// ==================== 刷新数据 ====================

function refreshData() {
  loadIndustryTree()
  loadConceptList()
  if (currentPlate.value) {
    loadPlateStocks()
  }
}

// 初始化
loadIndustryTree()
loadConceptList()
</script>
