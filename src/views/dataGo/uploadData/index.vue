<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-27 16:04:51
 * @FilePath: /report-background-system/src/views/dataGo/uploadData/index.vue
 * @Description: 数据上传
 * 
-->
<template>
  <page-header-wrapper>
    <a-spin :spinning="pageLoading">
      <div class="item-content search-item">
        <div>
          <img style="width: 18px; height: 18px" src="@/assets/images/customer.png" alt="dark" />
          <span>选择查询企业</span>
          <a-select style="width: 200px" placeholder="选择查询企业" @change="customerHandle">
            <a-select-option v-for="(cu, index) in customers" :value="cu.creditCode" :key="index">
              {{ cu.enterpriseName }}
            </a-select-option>
          </a-select>
        </div>
        <div v-if="customerInfo">
          <a-button style="margin-right: 20px" type="primary" @click="refreshPage">
            <a-icon type="redo" />刷新页面</a-button
          >
          <a-button type="primary" @click="authData"> <a-icon type="audit" />批量数据授权</a-button>
        </div>
      </div>
      <div class="upload-data-box" v-if="customerUploadList">
        <customer-upload-detail
          :customerUploadList="customerUploadList"
          :customerInfo="customerInfo"
        ></customer-upload-detail>
      </div>
    </a-spin>
  </page-header-wrapper>
</template>

<script>
import { getCustomerList, customerData } from '@/api/report'
import { classifyDataByClassName } from '../client/util'
import { mapActions } from 'vuex'
import customerUploadDetail from '../client/customerUploadDetail.vue'
export default {
  components: { customerUploadDetail },
  data() {
    return {
      customers: [],
      customerUploadList: null,
      customerInfo: null,
      pageLoading: true,
    }
  },
  created() {
    this.initData()
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    initData() {
      getCustomerList({})
        .then((res) => {
          const reD = res.data
          this.customers = reD.map((item) => {
            const { userName, enterprise, userId } = item
            return {
              userName,
              creditCode: (enterprise && enterprise.enterpriseCreditCode) || '',
              enterpriseName: (enterprise && enterprise.enterpriseName) || '',
              appUserId: userId,
            }
          })
          this.pageLoading = false
        })
        .catch((err) => {
          this.$message.error('获取客户列表失败:' + err)
        })
    },
    customerHandle(v) {
      this.customerInfo = this.customers.find((iu) => iu.creditCode == v)
      customerData({ creditCode: v })
        .then((res) => {
          this.pageLoading = false
          this.customerUploadList = classifyDataByClassName(res.data)
        })
        .catch((err) => {
          this.$message.error('获取客户数据:' + err)
        })
    },
    refreshPage() {
      this.pageLoading = true
      this.customerHandle(this.customerInfo.creditCode)
    },
    authData() {
      this.changeBuildQrCodePop(true)
    },
  },
}
</script>

<style lang="less" scoped>
.item-content {
  padding: 12px;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 8px;
}
.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    margin: 0 10px 0 5px;
    font-size: 16px;
  }
}
</style>