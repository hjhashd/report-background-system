<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 16:47:35
 * @FilePath: /report-background-system/src/views/dataGo/uploadData/index.vue
 * @Description: 数据上传
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <div class="search-item">
        <img style="width: 18px; height: 18px" src="@/assets/images/customer.png" alt="dark" />
        <span>选择查询客户</span>
        <a-select style="width: 200px" placeholder="选择查询客户" @change="customerHandle">
          <a-select-option v-for="(cu, index) in customers" :value="cu.creditCode" :key="index">
            {{ cu.userName }}
          </a-select-option>
        </a-select>
      </div>
      <div class="upload-data-box" v-if="customerUploadList">
        <customer-upload-detail :customerUploadList="customerUploadList"></customer-upload-detail>
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
import { getCustomerList, customerData } from '@/api/report'
import { classifyDataByClassName } from '../client/util'
import customerUploadDetail from '../client/customerUploadDetail.vue'
export default {
  components: { customerUploadDetail },
  data() {
    return {
      customers: [],
      customerUploadList: null,
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      getCustomerList({})
        .then((res) => {
          const reD = res.data
          this.customers = reD.map((item) => {
            const { userName, enterprise } = item
            return {
              userName,
              creditCode: (enterprise && enterprise.enterpriseCreditCode) || '',
              enterpriseName: (enterprise && enterprise.enterpriseName) || '',
            }
          })
        })
        .catch((err) => {
          this.$message.error('获取客户列表失败:' + err)
        })
    },
    customerHandle(v) {
      customerData({ creditCode: v })
        .then((res) => {
          this.customerUploadList = classifyDataByClassName(res.data)
        })
        .catch((err) => {
          this.$message.error('获取客户数据:' + err)
        })
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  min-height: 65vh;
  background-color: #fff;
  padding: 24px;
}
.search-item {
  display: flex;
  align-items: center;
  span {
    margin: 0 10px 0 5px;
    font-size: 16px;
  }
}
</style>