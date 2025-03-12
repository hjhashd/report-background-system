<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-12 18:31:05
 * @FilePath: /report-background-system/src/views/dataGo/anomaly/index.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <div class="flex top-card-content">
        <div class="search-item">
          <img style="width: 18px; height: 18px" src="@/assets/images/customer.png" alt="dark" />
          <span>选择查询客户</span>
          <a-select style="width: 300px" placeholder="选择查询客户" v-model="selectedCustomer">
            <a-select-option v-for="(customer, index) in customers" :value="customer.userId" :key="index">
              {{ customer.enterprise.enterpriseName }}
            </a-select-option>
          </a-select>
        </div>
        <a-tabs style="flex-1" @change="tabsChange" v-model="tabSelected">
          <a-tab-pane key="财务基础指标" tab="财务基础指标"> </a-tab-pane>
          <a-tab-pane key="财务异常指标" tab="财务异常指标"> </a-tab-pane>
          <a-tab-pane key="衍生异常指标" tab="衍生异常指标"> </a-tab-pane>
        </a-tabs>
      </div>
      <a-table :columns="columns" :data-source="tableData" :bordered="true" :pagination="false" :loading="tableLoading">
        <template slot="yoy" slot-scope="text">
          <div class="up" v-if="text > 0">{{ text }}</div>
          <div class="down" v-else-if="text < 0">{{ text }}</div>
          <div v-else>{{ text }}</div>
        </template>
      </a-table>
    </div>
  </page-header-wrapper>
</template>

<script>
import { getCustomerAbnormalList, getCustomerList } from '@/api/report'
import { dealColumns } from './util'
export default {
  data() {
    return {
      selectedCustomer: null,
      tableLoading: true,
      customers: [],
      tabSelected: '财务基础指标',
      columns: [],
      tableData: [],
    }
  },
  created() {
    getCustomerList({
      enterpriseAuth: 1,
    }).then((res) => {
      this.customers = res.data
      this.selectedCustomer = res.data[0].userId
      this.getAbnormalData()
    })
  },
  methods: {
    tabsChange(tab) {
      this.tabSelected = tab
      this.getAbnormalData()
    },
    getAbnormalData() {
      this.tableLoading = true
      getCustomerAbnormalList(this.selectedCustomer, this.tabSelected).then((res) => {
        const reObj = dealColumns(res.data, this.tabSelected)
        this.columns = reObj.columns
        this.tableData = reObj.reData
        this.tableLoading = false
      })
    },
  },
}
</script>

<style scoped lang="less">
.page-content {
  width: 100%;
  height: 100%;
  min-height: 70vh;
  padding: 10px 24px;
  background-color: #fff;
}
.top-card-content {
  width: 100%;
  align-items: center;
  justify-content: space-between;
}
.search-item {
  span {
    margin: 0 5px;
    font-size: 16px;
  }
}
.down {
  color: green;
}
.up {
  color: red;
}
</style>