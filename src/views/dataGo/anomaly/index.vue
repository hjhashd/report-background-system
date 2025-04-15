<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-15 11:33:01
 * @FilePath: /report-background-system/src/views/dataGo/anomaly/index.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <div class="flex top-card-content">
        <data-go-tabs :tab="reportTypeList" @changeTab="changeTab" :hasRightContant="true">
          <template slot="rightContant">
            <div class="search-item" style="flex: 1">
              <!-- <img style="" src="@/assets/images/customers.png" alt="dark" /> -->
              <a-icon type="team" style="color: #7fbbf1; margin-right: 10px; font-size: 22px" />
              <a-select style="flex: 1" placeholder="选择查询客户" v-model="selectedCustomer" @change="selectCu">
                <a-select-option v-for="(customer, index) in customers" :value="customer.userId" :key="index">
                  {{ customer.enterprise.enterpriseName }}
                </a-select-option>
              </a-select>
            </div>
          </template>
        </data-go-tabs>
      </div>
      <div class="p-20">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :bordered="true"
          :pagination="false"
          :loading="tableLoading"
        >
          <template slot="yoy" slot-scope="text">
            <!-- <div class="up" v-if="text > 0">{{ text }}</div>
            <div class="down" v-else-if="text < 0">{{ text }}</div>
            <div v-else>{{ text }}</div> -->
            <div>{{ text }}</div>
          </template>
          <template slot="yclevel" slot-scope="text">
            <a-tag color="#fae450" v-if="text == '等级1'">
              {{ text }}
            </a-tag>
            <a-tag color="#f3ae44" v-else-if="text == '等级2'">
              {{ text }}
            </a-tag>
            <a-tag color="#f50" v-else-if="text == '等级3'">
              {{ text }}
            </a-tag>
            <a-tag v-else>
              {{ text }}
            </a-tag>
          </template>
        </a-table>
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
const reportTypeList = [
  {
    type: 1,
    name: '财务基础指标',
  },
  {
    type: 2,
    name: '财务异常指标',
  },
  {
    type: 3,
    name: '衍生异常指标',
  },
]
import { getCustomerAbnormalList, getCustomerList } from '@/api/report'
import { DataGoTabs } from '@/components'
import { dealColumns } from './util'
export default {
  components: { DataGoTabs },
  data() {
    return {
      reportTypeList,
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
    changeTab(v) {
      switch (v) {
        case 1:
          this.tabSelected = '财务基础指标'
          break
        case 2:
          this.tabSelected = '财务异常指标'
          break
        case 3:
          this.tabSelected = '衍生异常指标'
          break
      }
      this.getAbnormalData()
    },
    tabsChange(tab) {
      this.tabSelected = tab
      this.getAbnormalData()
    },
    selectCu(v) {
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
/deep/ .ant-table-thead > tr > th,
/deep/ .ant-table-tbody > tr > td {
  padding: 6.5px !important;
}
.page-content {
  width: 100%;
  height: 100%;
  min-height: 70vh;
  padding: 0;
  background-color: #fff;
}
.top-card-content {
  width: 100%;
  align-items: center;
  justify-content: space-between;
}
.search-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
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
.p-20 {
  padding: 20px;
}
</style>