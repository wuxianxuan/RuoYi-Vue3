<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="推荐日期" prop="recommendDate">
        <el-date-picker
          v-model="queryParams.recommendDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="VideoPlay" @click="handleExecute">手动触发推荐</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recommendList">
      <el-table-column type="index" width="55" align="center" label="排名" />
      <el-table-column label="推荐日期" align="center" prop="recommendDate" width="110">
        <template #default="scope">
          {{ scope.row.recommendDate ? scope.row.recommendDate.substring(0, 10) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="股票代码" align="center" prop="stockCode" width="100" />
      <el-table-column label="股票名称" align="center" prop="stockName" width="100" />
      <el-table-column label="综合得分" align="center" prop="totalScore" width="100" sortable />
      <el-table-column label="趋势得分" align="center" prop="trendScore" width="100" />
      <el-table-column label="板块得分" align="center" prop="plateScore" width="100" />
      <el-table-column label="推荐理由" align="center" prop="reason" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning" size="small">待确认</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success" size="small">已确认</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="info" size="small">已驳回</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template #default="scope">
          <el-button link type="primary" icon="TrendCharts" @click="handleGoKline(scope.row)">K线</el-button>
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
  </div>
</template>

<script setup name="StockRecommend">
import { listRecommend, executeRecommend } from "@/api/stock/recommend"
import { ref, reactive, toRefs, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()

const recommendList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    recommendDate: new Date().toISOString().substring(0, 10)
  }
})

const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  listRecommend(queryParams.value).then(response => {
    recommendList.value = response.rows || []
    total.value = response.total || 0
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.recommendDate = new Date().toISOString().substring(0, 10)
  handleQuery()
}

function handleExecute() {
  proxy.$modal.confirm('确认触发推荐引擎？（将生成今日推荐结果）').then(() => {
    executeRecommend(20).then(response => {
      proxy.$modal.msgSuccess(response.msg || "推荐完成")
      getList()
    })
  }).catch(() => {})
}

function handleGoKline(row) {
  const route = proxy.$router.resolve({
    path: '/stock/kline',
    query: { stockCode: row.stockCode, stockName: row.stockName }
  })
  window.open(route.href, '_blank')
}

getList()
</script>
