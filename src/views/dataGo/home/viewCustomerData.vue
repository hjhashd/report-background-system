<!--
 * @Author: bekon
 * @Date: 2025-02-26 11:22:54
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-12 13:41:24
 * @FilePath: /report-background-system/src/views/dataGo/home/viewCustomerData.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div>
      <div class="search-item item-content">
        <div>
          <img style="width: 18px; height: 18px" src="@/assets/images/customer.png" alt="dark" />
          <span>当前企业： {{ queryParams.enterpriseName }}</span>
        </div>
        <div>
          <a-icon style="width: 18px; height: 18px" type="bank" theme="filled" />
          <span>所选报告类型： {{ queryParams.reportType | showReportName }}</span>
        </div>
        <div style="display: flex">
          <div>
            <a-icon style="width: 18px; height: 18px" type="book" theme="filled" />
            <span>所选模板：</span>
          </div>
          <div style="flex: 1">
            <span v-for="item in modalList" :key="item">{{ item }}、</span>
          </div>
        </div>
      </div>
      <div class="upload-data-box" v-if="customerUploadList">
        <customer-upload-detail
          :customerUploadList="customerUploadList"
          :customerInfo="queryParams"
        ></customer-upload-detail>
      </div>
      <div class="button-group">
        <a-button v-if="!buildReportId" :loading="buildLoading" style="width: 25%; height: 40px" @click="buildReport"
          >生产报告</a-button
        >
        <a-button v-if="buildReportId" style="width: 25%; height: 40px" @click="reviewReport">报告预览</a-button>
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
import { customerData } from '@/api/report'
import { classifyDataByClassName } from '../client/util'
import customerUploadDetail from '../client/customerUploadDetail.vue'
import { buildReport } from '@/api/report'
export default {
  name: 'viewCustomerData',
  components: { customerUploadDetail },
  data() {
    return {
      customers: [],
      customerUploadList: null,
      queryParams: null,
      modalList: null,
      buildLoading: false,
      buildReportId: null,
    }
  },
  created() {
    this.queryParams = this.$route.query
    this.modalList = JSON.parse(this.$route.query.template)
    this.initData()
  },
  methods: {
    initData() {
      customerData({ creditCode: this.queryParams.creditCode })
        .then((res) => {
          this.customerUploadList = classifyDataByClassName(res.data)
        })
        .catch((err) => {
          this.$message.error('获取客户数据:' + err)
        })
    },
    buildReport() {
      const { $notification } = this
      const paramsRequest = {
        appUserId: parseInt(this.queryParams.appUserId),
        reportType: parseInt(this.queryParams.reportType),
        enterpriseName: this.queryParams.enterpriseName,
        template: this.queryParams.template,
      }
      this.buildLoading = true
      // 去往查看数据页面
      buildReport(paramsRequest)
        .then((res) => {
          this.buildReportId = res.data
          this.buildLoading = false
          $notification['success']({
            message: '通知：',
            description: '生成报告成功',
            duration: 8,
          })
        })
        .catch((err) => {
          this.buildLoading = false
          $notification['error']({
            message: '错误通知：',
            description: '错误内容：' + JSON.stringify(err),
            duration: 8,
          })
        })
    },
    reviewReport() {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + this.buildReportId })
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
  flex-direction: column;
  span {
    margin: 0 10px 0 5px;
    font-size: 16px;
  }
}
.button-group {
  margin-top: 40px;
  text-align: center;
}
.button-group button {
  padding: 0 30px;
  margin-right: 10px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}
</style>