<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-input v-model="queryParams.stockCode" placeholder="请输入股票代码" clearable @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="股票名称" prop="stockName">
        <el-input v-model="queryParams.stockName" placeholder="请输入股票名称" clearable @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="市场" prop="market">
        <el-select v-model="queryParams.market" placeholder="请选择市场" clearable>
          <el-option label="深市" value="0" />
          <el-option label="沪市" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="favoriteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" width="80" />
      <el-table-column label="股票代码" align="center" prop="stockCode" width="120" />
      <el-table-column label="股票名称" align="center" prop="stockName" width="120" />
      <el-table-column label="市场" align="center" prop="market" width="80">
        <template #default="scope">
          <span>{{ scope.row.market == '1' ? '沪市' : '深市' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="股票代码" prop="stockCode">
          <el-input v-model="form.stockCode" placeholder="请输入股票代码，如 600519" />
        </el-form-item>
        <el-form-item label="股票名称" prop="stockName">
          <el-input v-model="form.stockName" placeholder="请输入股票名称" />
        </el-form-item>
        <el-form-item label="市场" prop="market">
          <el-select v-model="form.market" placeholder="请选择市场">
            <el-option label="深市" value="0" />
            <el-option label="沪市" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属分组" prop="groupIds">
          <el-select v-model="form.groupIds" multiple placeholder="请选择所属分组">
            <el-option v-for="g in groupOptions" :key="g.id" :label="g.groupName" :value="g.id" />
          </el-select>
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
  </div>
</template>

<script>
import { listFavorite, getFavorite, delFavorite, addFavorite, updateFavorite } from "@/api/stock/favorite"
import { listGroupAll } from "@/api/stock/group"

export default {
  name: "StockFavorite",
  data() {
    return {
      loading: true, ids: [], single: true, multiple: true, showSearch: true, total: 0,
      favoriteList: [], title: "", open: false, groupOptions: [],
      queryParams: { pageNum: 1, pageSize: 10, stockCode: undefined, stockName: undefined, market: undefined },
      form: {},
      rules: {
        stockCode: [{ required: true, message: "股票代码不能为空", trigger: "blur" }],
        stockName: [{ required: true, message: "股票名称不能为空", trigger: "blur" }],
        market: [{ required: true, message: "市场不能为空", trigger: "change" }]
      }
    }
  },
  created() { this.getList(); this.getGroups() },
  methods: {
    getList() {
      this.loading = true
      listFavorite(this.queryParams).then(response => {
        this.favoriteList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getGroups() {
      listGroupAll().then(response => { this.groupOptions = response.data })
    },
    cancel() { this.open = false; this.reset() },
    reset() {
      this.form = { id: undefined, stockCode: undefined, stockName: undefined, market: undefined, groupIds: [], remark: undefined }
      this.resetForm("form")
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery() },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleAdd() { this.reset(); this.open = true; this.title = "添加自选股" },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getFavorite(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改自选股"
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateFavorite(this.form).then(() => { this.$modal.msgSuccess("修改成功"); this.open = false; this.getList() })
          } else {
            addFavorite(this.form).then(() => { this.$modal.msgSuccess("新增成功"); this.open = false; this.getList() })
          }
        }
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除自选股编号为"' + ids + '"的数据项？').then(function() {
        return delFavorite(ids)
      }).then(() => { this.getList(); this.$modal.msgSuccess("删除成功") }).catch(() => {})
    }
  }
}
</script>