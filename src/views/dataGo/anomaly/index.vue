<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 11:10:54
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
          <a-select style="width: 200px" placeholder="选择查询客户" v-model="selectedCustomer">
            <a-select-option v-for="(customer, index) in customers" :value="customer" :key="index">
              {{ customer }}
            </a-select-option>
          </a-select>
        </div>
        <a-tabs style="flex-1">
          <a-tab-pane key="financialBasic" tab="财务基础指标"> </a-tab-pane>
          <a-tab-pane key="financialAbnormal" tab="财务异常指标"> </a-tab-pane>
          <a-tab-pane key="derivedAbnormal" tab="衍生异常指标"> </a-tab-pane>
        </a-tabs>
        <div class="search-item">
          <a-icon type="eye" theme="filled" />
          <span>选择预览报告</span>
          <a-select style="width: 200px" placeholder="选择报告预览" v-model="selectedReport">
            <a-select-option v-for="(report, index) in reports" :value="report" :key="index">
              {{ report }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <a-table :columns="columns" :data-source="tableData">
        <template slot-scope="text, record, index" slot="relativeChange">
          <span v-for="(change, yearIndex) in record.relativeChange" :key="yearIndex">{{ change }}%</span>
        </template>
      </a-table>
    </div>
  </page-header-wrapper>
</template>

<script>
export default {
  data() {
    return {
      selectedCustomer: '广州**香料有限公司',
      selectedReport: '广州**银行/20241201',
      customers: ['广州**香料有限公司'],
      reports: ['广州**银行/20241201'],
      columns: [
        {
          title: '指标类型',
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: '指标名',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '2020',
          dataIndex: '2020',
          key: '2020',
        },
        {
          title: '2021',
          dataIndex: '2021',
          key: '2021',
        },
        {
          title: '2022',
          dataIndex: '2022',
          key: '2022',
        },
        {
          title: '2023',
          dataIndex: '2023',
          key: '2023',
        },
        {
          title: '2024',
          dataIndex: '2024',
          key: '2024',
        },
        {
          title: '2021',
          dataIndex: 'relativeChange.0',
          key: 'relativeChange.0',
          scopedSlots: { customRender: 'relativeChange' },
        },
        {
          title: '2022',
          dataIndex: 'relativeChange.1',
          key: 'relativeChange.1',
          scopedSlots: { customRender: 'relativeChange' },
        },
        {
          title: '2023',
          dataIndex: 'relativeChange.2',
          key: 'relativeChange.2',
          scopedSlots: { customRender: 'relativeChange' },
        },
        {
          title: '2024',
          dataIndex: 'relativeChange.3',
          key: 'relativeChange.3',
          scopedSlots: { customRender: 'relativeChange' },
        },
      ],
      tableData: [
        {
          type: '营运能',
          name: '存货比',
          2020: -0.72,
          2021: -0.36,
          2022: 0.13,
          2023: 0.11,
          2024: 0.22,
          relativeChange: [-51, -63, -15, 96],
        },
        // 此处需补充完整其他数据行
      ],
    }
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
</style>