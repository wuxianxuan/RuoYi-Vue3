<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-autocomplete
          v-model="stockDisplay"
          :fetch-suggestions="fetchStockSuggestions"
          placeholder="请输入股票代码"
          clearable
          style="width:220px"
          @select="handleStockSelect"
          @clear="handleStockClear"
        />
      </el-form-item>
      <el-form-item label="周期" prop="klineType">
        <el-select v-model="queryParams.klineType" placeholder="请选择周期" style="width:100px">
          <el-option label="日K" value="D" />
          <el-option label="周K" value="W" />
          <el-option label="月K" value="M" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
          style="width:240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
      </el-form-item>
    </el-form>

    <div v-if="klineData.length > 0">
      <div ref="chart" style="width:100%;height:450px;margin-bottom:20px;"></div>
      <el-table :data="klineData" border stripe max-height="400">
        <el-table-column label="时间" prop="tradeTime" width="160" align="center" />
        <el-table-column label="开盘" prop="openPrice" width="100" align="center" />
        <el-table-column label="收盘" prop="closePrice" width="100" align="center" />
        <el-table-column label="最高" prop="highPrice" width="100" align="center" />
        <el-table-column label="最低" prop="lowPrice" width="100" align="center" />
        <el-table-column label="成交量" prop="volume" width="120" align="center" />
        <el-table-column label="成交额" prop="amount" width="140" align="center" />
      </el-table>
    </div>
    <el-empty v-else description="请选择股票和周期后查询" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { queryKline, autocompleteStock } from "@/api/stock/kline"

export default {
  name: "StockKline",
  data() {
    // 默认日期范围：当前往前60天
    const today = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 60)
    const fmt = d => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return y + '-' + m + '-' + day
    }
    return {
      stockDisplay: '',              // autocomplete 显示值
      selectedStockCode: '',         // 用户选中后的股票代码（用于查询）
      selectedStockName: '',         // 用户选中后的股票名称
      queryParams: { stockCode: undefined, klineType: 'D' },
      dateRange: [fmt(start), fmt(today)],
      klineData: [],
      chart: null,
      suggestTimer: null             // autocomplete 防抖计时器
    }
  },
  mounted() {
    // 组件挂载时无需额外操作
  },
  watch: {
    '$route.query': {
      handler(query) {
        if (query && query.stockCode) {
          this.selectedStockCode = query.stockCode
          this.selectedStockName = query.stockName || ''
          this.stockDisplay = this.selectedStockCode + (this.selectedStockName ? ' ' + this.selectedStockName : '')
          this.queryKlineData()
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    /** 股票代码输入联想（300ms 防抖） */
    fetchStockSuggestions(queryString, callback) {
      if (this.suggestTimer) clearTimeout(this.suggestTimer)
      if (!queryString || queryString.trim() === '') {
        callback([])
        return
      }
      this.suggestTimer = setTimeout(() => {
        autocompleteStock(queryString.trim()).then(response => {
          const list = response.data || []
          const suggestions = list.map(item => ({
            value: item.stockCode + ' ' + item.stockName,
            stockCode: item.stockCode,
            stockName: item.stockName,
            market: item.market
          }))
          callback(suggestions)
        }).catch(() => {
          callback([])
        })
      }, 300)
    },
    /** 选中联想项：显示"代码 名称"，避免选错 */
    handleStockSelect(item) {
      this.selectedStockCode = item.stockCode
      this.selectedStockName = item.stockName
      this.stockDisplay = item.stockCode + ' ' + item.stockName
    },
    /** 清空已选股票 */
    handleStockClear() {
      this.selectedStockCode = ''
      this.selectedStockName = ''
      this.stockDisplay = ''
    },
    handleQuery() {
      // 必须从下拉列表中选择股票代码
      if (!this.selectedStockCode) {
        this.$message.warning('请从下拉列表中选取股票代码')
        return
      }
      this.queryKlineData()
    },
    queryKlineData() {
      const params = {
        stockCode: this.selectedStockCode,
        klineType: this.queryParams.klineType
      }
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.dateRange[0]
        params.endDate = this.dateRange[1]
      }
      queryKline(params).then(response => {
        this.klineData = response.data
        this.$nextTick(() => { this.renderChart() })
      })
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart)
        window.addEventListener('resize', this.handleResize)
      }
      const data = this.klineData
      const dates = data.map(d => d.tradeTime)
      const values = data.map(d => [d.openPrice, d.closePrice, d.lowPrice, d.highPrice])
      const volumes = data.map(d => d.volume)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        grid: [
          { left: '10%', right: '8%', top: '5%', height: '60%' },
          { left: '10%', right: '8%', top: '72%', height: '20%' }
        ],
        xAxis: [
          { type: 'category', data: dates, gridIndex: 0, axisLabel: { show: false } },
          { type: 'category', data: dates, gridIndex: 1 }
        ],
        yAxis: [
          { gridIndex: 0, scale: true },
          { gridIndex: 1, scale: true }
        ],
        dataZoom: [
          { type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 },
          { type: 'slider', xAxisIndex: [0, 1], start: 0, end: 100, bottom: 10 }
        ],
        series: [
          {
            name: 'K线',
            type: 'candlestick',
            data: values,
            xAxisIndex: 0,
            yAxisIndex: 0,
            barMaxWidth: 30,
            barMinWidth: 4,
            itemStyle: { color: '#ef232a', color0: '#14b143', borderColor: '#ef232a', borderColor0: '#14b143' }
          },
          {
            name: '成交量',
            type: 'bar',
            data: volumes,
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              color: function(params) {
                const idx = params.dataIndex
                return data[idx].closePrice >= data[idx].openPrice ? '#ef232a' : '#14b143'
              }
            }
          }
        ]
      }
      this.chart.setOption(option)
    }
  }
}
</script>