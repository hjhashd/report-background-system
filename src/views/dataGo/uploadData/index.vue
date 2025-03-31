<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-31 19:44:02
 * @FilePath: /report-background-system/src/views/dataGo/uploadData/index.vue
 * @Description: 数据上传
 * 
-->
<template>
  <page-header-wrapper>
    <a-spin :spinning="pageLoading">
      <!-- <div class="page-title">客户数据详情</div> -->
      <div class="item-content search-item">
        <div>
          <img style="width: 22px; height: 22px" src="@/assets/images/customers.png" alt="dark" />
          <span>选择查询企业</span>
          <a-select
            show-search
            style="width: 250px"
            placeholder="选择查询企业"
            @change="customerHandle"
            :filter-option="filterOption"
            option-filter-prop="children"
          >
            <a-select-option v-for="(cu, index) in customers" :value="index" :key="index">
              {{ cu.enterpriseName }}
            </a-select-option>
          </a-select>
        </div>
        <div style="margin-left: 20px" v-if="customerInfo">
          <img style="width: 22px; height: 22px" src="@/assets/images/customers.png" alt="dark" />
          <span>数据采集类型</span>
          <a-select
            style="width: 200px"
            v-model="selectTab"
            placeholder="选择采集类型"
            :allowClear="true"
            @change="getCustomerData"
          >
            <a-select-option v-for="(table, index) in tableType" :value="table.value" :key="index">
              {{ table.name }}
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
  </page-header-wrapper>
</template>

<script>
import { getCustomerList, customerData } from '@/api/report'
import { mapActions } from 'vuex'
import CustomerUploadDetailNew from '../client/customerUploadDetail_new.vue'
const tableType = [
  {
    name: '数据采集',
    value: 'crawl',
  },
  {
    name: '数据上传',
    value: 'upload',
  },
]

export default {
  components: { CustomerUploadDetailNew },
  data() {
    return {
      tableType,
      selectTab: null,
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
      this.getCustomerData()
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    getCustomerData() {
      this.pageLoading = true
      customerData({ creditCode: this.customerInfo.creditCode, type: this.selectTab })
        .then((res) => {
          setTimeout(() => {
            this.pageLoading = false
          }, 200)
          this.customerUploadList = res.data
          // this.customerUploadList = classifyDataByClassName(res.data)
        })
        .catch((err) => {
          setTimeout(() => {
            this.pageLoading = false
          }, 200)
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