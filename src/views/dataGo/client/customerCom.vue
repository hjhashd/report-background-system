<!--
 * @Author: bekon
 * @Date: 2025-02-21 16:15:56
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-27 21:11:13
 * @FilePath: /report-background-system/src/views/dataGo/client/customerCom.vue
 * @Description: 
 * 
-->
<template>
  <div class="list-detail-container">
    <!-- 左侧列表区域 -->
    <div>
      <div :class="{ 'list-collapsed': isListCollapsed }" class="left-list">
        <div class="search-item">
          <span v-if="!isListCollapsed">客户列表</span>
        </div>
        <a-button
          @click="toggleList"
          :icon="isListCollapsed ? 'menu-unfold' : 'menu-fold'"
          shape="circle"
          class="toggle-button"
        ></a-button>
        <a-menu style="overflow: hidden" mode="inline" :selectedKeys="[selectedItem]" @select="handleSelect">
          <a-menu-item v-for="(item, index) in customers" :key="index + 1" :value="item.creditCode">
            {{ item.userName }}
          </a-menu-item>
        </a-menu>
      </div>
    </div>
    <!-- 右侧详情区域 -->
    <div :class="{ 'detail-expanded': isListCollapsed }" class="right-detail">
      <a-spin v-if="customerUploadList" :spinning="spinningLoad">
        <customer-upload-detail
          :customerUploadList="customerUploadList"
          :customerInfo="chooseCustomer"
        ></customer-upload-detail>
      </a-spin>
      <div v-else>
        <p>请选择一个客户查看详情。</p>
      </div>
    </div>
  </div>
</template>
  
<script>
import { getCustomerList, customerData } from '@/api/report'
import CustomerUploadDetail from './customerUploadDetail.vue'
import { classifyDataByClassName } from './util'
export default {
  components: { CustomerUploadDetail },
  data() {
    return {
      customers: [],
      selectedItem: '',
      chooseCustomer: {},
      customerUploadList: null,
      isListCollapsed: false,
      spinningLoad: true,
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      // 获取客户列表
      getCustomerList({})
        .then((res) => {
          const reD = res.data
          let firGet = true
          this.customers = reD.map((item) => {
            const { userName, enterprise } = item
            if (firGet) {
              firGet = false
              this.selectedItem = 1
              this.getCustomerData({ creditCode: enterprise.enterpriseCreditCode })
            }
            return {
              userName,
              creditCode: (enterprise && enterprise.enterpriseCreditCode) || '',
              enterpriseName: (enterprise && enterprise.enterpriseName) || '',
            }
          })
          this.chooseCustomer = this.getSelectedItem()
        })
        .catch((err) => {
          this.$message.error('获取客户列表失败:' + err)
        })
    },
    handleSelect(e) {
      this.selectedItem = e.key
      this.getCustomerData({ creditCode: e.item.value })
    },
    getCustomerData(params) {
      this.spinningLoad = true
      customerData(params)
        .then((res) => {
          this.customerUploadList = classifyDataByClassName(res.data)
          this.spinningLoad = false
        })
        .catch((err) => {
          this.$message.error('获取客户数据:' + err)
        })
    },
    toggleList() {
      this.isListCollapsed = !this.isListCollapsed
    },
    getSelectedItem() {
      return this.customers[this.selectedItem - 1]
    },
  },
}
</script>
  
  <style lang="less" scoped>
.list-detail-container {
  position: relative;
  display: flex;
  min-height: 100vh;
}

.left-list {
  height: 100%;
  width: 200px;
  transition: width 0.3s ease;
  border-right: 1px solid #e8e8e8;
  position: relative;
}
.search-item {
  padding: 12px;
  font-size: 20px;
  font-weight: bold;
}

.list-collapsed {
  width: 0px;
}

.toggle-button {
  position: absolute;
  right: 0;
  top: 200px;
  transform: translate(50%, -50%);
}

.right-detail {
  flex: 1;
  padding: 20px;
  transition: flex 0.3s ease;
}

.detail-expanded {
  flex: calc(100% - 40px);
}
</style>