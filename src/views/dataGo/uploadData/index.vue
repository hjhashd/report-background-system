<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-09-05 17:17:48
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
        <!-- <div style="margin-left: 20px" v-if="customerInfo">
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
        </div> -->

        <!-- <div v-if="customerInfo">
        <a-button style="margin-right: 20px" type="primary" @click="refreshPage">
          <a-icon type="redo" />刷新页面</a-button
        >
        <a-button type="primary" @click="authData"> <a-icon type="audit" />批量数据授权</a-button>
      </div> -->
      </div>
      <div class="upload-data-box" v-if="customerUploadList">
        <div class="type-tab">
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
        <customer-upload-detail-new
          v-if="selectTab !== 'materialList'"
          @updateData="getCustomerData"
          :selectTab="selectTab"
          :customerUploadList="customerUploadList"
          :customerInfo="customerInfo"
        ></customer-upload-detail-new>
        <div class="item-content" v-else>
          <metiral-list :customerInfo="customerInfo"></metiral-list>
        </div>
      </div>
    </a-spin>
  </page-header-wrapper>
</template>

<script>
import { getCustomerList, customerData } from '@/api/report'
import { mapActions } from 'vuex'
import CustomerUploadDetailNew from '../client/customerUploadDetail_new.vue'
import MetiralList from './metiralList.vue'
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
  {
    name: '材料列表',
    value: 'materialList',
  },
]

export default {
  components: { CustomerUploadDetailNew, MetiralList },
  data() {
    return {
      tableType,
      selectTab: tableType[0].value,
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
    ...mapActions(['changeBuildQrCodePop', 'chooseEnter']),
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
    changeTab(v) {
      this.selectTab = v.value
      if (v.value !== 'materialList') {
        this.getCustomerData()
      }
    },
    customerHandle(v) {
      //  存vuex
      this.chooseEnter(this.customers[v])
      this.customerInfo = this.customers[v]
      this.getCustomerData()
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    getCustomerData() {
      this.pageLoading = true
      customerData({ creditCode: this.customerInfo.creditCode, dataType: this.selectTab })
        .then((res) => {
          setTimeout(() => {
            this.pageLoading = false
          }, 200)
          // this.customerUploadList = res.data.filter(
          //   (item) =>
          //     item.className !== '企业基础信息' || (item.className == '企业基础信息' && item.tableNameZh == '基本情况')
          // )
          // this.customerUploadList = classifyDataByClassName(res.data)
          this.customerUploadList = res.data
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