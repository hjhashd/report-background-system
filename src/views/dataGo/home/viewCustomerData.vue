<!--
 * @Author: bekon
 * @Date: 2025-02-26 11:22:54
 * @LastEditors: bekon
 * @LastEditTime: 2025-05-06 14:36:32
 * @FilePath: /report-background-system/src/views/dataGo/home/viewCustomerData.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div>
      <!-- <div class="page-title">客户数据详情</div> -->
      <div class="search-item item-content">
        <div class="flex ll">
          <div style="margin-right: 20px">
            <img style="width: 18px; height: 18px; margin-right: 5px" src="@/assets/images/customers.png" alt="dark" />
            <span>当前企业： {{ queryParams.enterpriseName }}</span>
          </div>
          <div>
            <img
              style="width: 18px; height: 18px; margin-right: 5px"
              src="@/assets/images/report-type.png"
              alt="dark"
            />
            <span>所选报告类型： {{ queryParams.reportType | showReportName }}</span>
          </div>
        </div>
        <div style="display: flex">
          <div>
            <img style="width: 18px; height: 18px; margin-right: 5px" src="@/assets/images/modal.png" alt="dark" />
            <span>所选模板：</span>
          </div>
          <div style="flex: 1">
            <span v-for="(item, index) in modalList" :key="item"
              >{{ item }}{{ index < modalList.length - 1 ? '、' : '' }}</span
            >
          </div>
        </div>
      </div>
      <div class="type-tab" v-if="customerUploadList">
        <div
          class="tab-item flex-1"
          :class="{ 'tab-active': selectTab == item.value }"
          v-for="item in tableType"
          :key="item.value"
          @click="changeTab(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="upload-data-box" :style="{ height: '58vh' }" v-if="customerUploadList">
        <customer-upload-detail-new
          :customerUploadList="customerUploadList"
          :customerInfo="queryParams"
        ></customer-upload-detail-new>
      </div>
      <div class="button-group">
        <a-button
          v-if="!buildReportId"
          :loading="buildLoading"
          style="width: 25%; height: 40px"
          @click="setReportName = true"
          >生成报告</a-button
        >
        <a-button v-if="buildReportId" style="width: 25%; height: 40px" @click="reviewReport">报告预览</a-button>
      </div>
    </div>
    <a-modal
      class="qr-modal"
      v-model="setReportName"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @ok="buildReport"
      @cancel="setReportName = false"
    >
      <div class="set-name">
        <div class="set-name-title">报告名称</div>
        <a-input allowClear size="large" v-model="reportName"></a-input>
      </div>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { customerData } from '@/api/report'
import CustomerUploadDetailNew from '../client/customerUploadDetail_new.vue'
import { buildReport } from '@/api/report'
import { getCurrentDate, getCurrentTime } from './util'
const tableType = [
  // 新增dataType字段，crwal 自动采集 upload 上传数据 other 其他授权
  {
    name: '上传数据',
    value: 'upload',
  },
  {
    name: '自动采集',
    value: 'crwal',
  },
  {
    name: '其他授权',
    value: 'other',
  },
]
export default {
  name: 'viewCustomerData',
  components: { CustomerUploadDetailNew },
  data() {
    return {
      tableType,
      selectTab: tableType[0].value,
      customers: [],
      customerUploadList: null,
      queryParams: null,
      modalList: null,
      buildLoading: false,
      setReportName: false,
      buildReportId: null,
      reportName: '',
    }
  },
  created() {
    this.queryParams = this.$route.query
    this.modalList = JSON.parse(this.$route.query.template)
    this.initData()

    const reportTypeName =
      this.queryParams.reportType == 1
        ? '授信调查报告'
        : this.queryParams.reportType == 2
        ? '财务分析报告'
        : '能耗分析报告'
    const nowTime = getCurrentDate()
    this.reportName = `${this.queryParams.enterpriseName}_${reportTypeName}_${nowTime}`
  },
  methods: {
    changeTab(v) {
      this.selectTab = v.value
      this.initData()
    },
    initData() {
      const query = {
        dataType: this.selectTab,
        creditCode: this.queryParams.creditCode,
        reportType: this.$route.query && this.$route.query.reportType ? parseInt(this.$route.query.reportType) : null,
        template: this.$route.query && this.$route.query.template ? JSON.parse(this.$route.query.template) : null,
      }
      customerData(query)
        .then((res) => {
          this.customerUploadList = res.data
        })
        .catch((err) => {
          this.$message.error('获取客户数据:' + err)
        })
    },
    buildReport() {
      const { $notification, $message } = this

      if (!this.reportName) {
        $message.warning('报告名称不能为空！')
        return
      }

      const paramsRequest = {
        appUserId: parseInt(this.queryParams.appUserId),
        reportType: parseInt(this.queryParams.reportType),
        enterpriseName: this.queryParams.enterpriseName,
        template: this.queryParams.template,
        reportName: this.reportName,
      }

      this.buildLoading = true
      // 去往查看数据页面
      buildReport(paramsRequest)
        .then((res) => {
          if (res.code != 200) {
            this.buildLoading = false
            $notification['error']({
              message: '错误通知：',
              description: res.msg,
              duration: 8,
            })
          } else {
            const { $router } = this
            $notification['info']({
              message: '消息提示：',
              description: `详情信息：${this.reportName}。
              \n 正在用行业小模型生成报告，需要等待几分钟。`,
              duration: 8,
            })
            $router.push({ path: `/homePage/draftList` })
            this.buildReportId = res.data
            this.buildLoading = false
          }
        })
        .catch((err) => {
          $notification.close('addReportNotification')
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
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
    letter-spacing: 0;
    font-weight: 400;
  }
}
.button-group {
  margin-top: 20px;
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
.page-title {
  opacity: 0.8;
  font-family: PingFangSC-Medium;
  font-size: 32px;
  color: #154291;
  letter-spacing: 0;
  line-height: 61.83px;
  font-weight: 500;
}
.upload-data-box {
  overflow-x: hidden;
  overflow-y: scroll;
}
.set-name {
  padding: 80px 20px 40px;
  .set-name-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
}
.type-tab {
  display: flex;
  text-align: center;
  border-radius: 8px 8px 0 0;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  cursor: pointer;
  .tab-active {
    height: 100%;
    line-height: 40px;
    background-color: #fff;
  }
}
</style>