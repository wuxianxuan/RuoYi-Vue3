<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-input v-model="queryParams.stockCode" placeholder="如 600519" clearable style="width:140px"/>
      </el-form-item>
      <el-form-item label="市场" prop="market">
        <el-select v-model="queryParams.market" placeholder="市场" clearable style="width:100px">
          <el-option label="深市" value="0" />
          <el-option label="沪市" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="周期" prop="klineType">
        <el-select v-model="queryParams.klineType" placeholder="请选择周期" style="width:120px">
          <el-option label="日K" value="D" />
          <el-option label="周K" value="W" />
          <el-option label="月K" value="M" />
          <el-option label="1分钟" value="1" />
          <el-option label="5分钟" value="5" />
          <el-option label="15分钟" value="15" />
          <el-option label="30分钟" value="30" />
          <el-option label="60分钟" value="60" />
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
import { queryKline } from "@/api/stock/kline"

export default {
  name: "StockKline",
  data() {
    return {
      queryParams: { stockCode: undefined, market: undefined, klineType: 'D' },
      dateRange: [],
      klineData: [],
      chart: null
    }
  },
  methods: {
    handleQuery() {
      this.queryKlineData()
    },
    queryKlineData() {
      const params = {
        stockCode: this.queryParams.stockCode,
        market: this.queryParams.market,
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
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart)
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