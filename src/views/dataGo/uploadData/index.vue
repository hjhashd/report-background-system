<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-24 18:27:10
 * @FilePath: /report-background-system/src/views/dataGo/uploadData/index.vue
 * @Description: 数据上传
 * 
-->
<template>
  <!-- <page-header-wrapper> -->
  <a-spin :spinning="pageLoading">
    <div class="page-title">客户数据详情</div>
    <div class="item-content search-item">
      <div>
        <img style="width: 22px; height: 22px" src="@/assets/images/customers.png" alt="dark" />
        <span>选择查询企业</span>
        <a-select style="width: 300px" placeholder="选择查询企业" @change="customerHandle">
          <a-select-option v-for="(cu, index) in customers" :value="index" :key="index">
            {{ cu.enterpriseName }}
          </a-select-option>
        </a-select>
      </div>
      <!-- <div v-if="customerInfo">
        <a-button style="margin-right: 20px" type="primary" @click="refreshPage">
          <a-icon type="redo" />刷新页面</a-button
        >
        <a-button type="primary" @click="authData"> <a-icon type="audit" />批量数据授权</a-button>
      </div> -->
    </div>
    <div class="upload-data-box" v-if="customerUploadList">
      <customer-upload-detail-new
        :customerUploadList="customerUploadList"
        :customerInfo="customerInfo"
      ></customer-upload-detail-new>
    </div>
  </a-spin>
  <!-- </page-header-wrapper> -->
</template>

<script>
import { getCustomerList, customerData } from '@/api/report'
import { mapActions } from 'vuex'
import CustomerUploadDetailNew from '../client/customerUploadDetail_new.vue'
export default {
  components: { CustomerUploadDetailNew },
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
      this.customerInfo = this.customers[v]
      customerData({ creditCode: this.customerInfo.creditCode })
        .then((res) => {
          this.pageLoading = false
          this.customerUploadList = res.data
          // this.customerUploadList = classifyDataByClassName(res.data)
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
.page-title {
  opacity: 0.8;
  font-family: PingFangSC-Medium;
  font-size: 32px;
  color: #154291;
  letter-spacing: 0;
  line-height: 61.83px;
  font-weight: 500;
}
</style>