<!--
 * @Author: bekon
 * @Date: 2025-03-15 14:52:33
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-15 16:17:33
 * @FilePath: /report-background-system/src/components/AddCustomer/addCustomer.vue
 * @Description: 
 * 
-->
<template>
  <div class="add-customer-container">
    <div class="flex top-search-box">
      <div class="flex-1" style="margin-right: 5px">
        <div class="search-title">
          <a-icon style="color: #68a4f8; margin-right: 5px" size="16" type="credit-card" />统一社会信用代码
        </div>
        <a-input
          @blur="searchCustomer"
          v-model="creditCode"
          placeholder="输入统一社会信用代码"
          style="width: 100%; margin-top: 8px"
        />
      </div>
      <div class="flex-1" style="margin-left: 5px">
        <div class="search-title">
          <a-icon size="16" type="bank" style="margin-right: 5px; color: #86d6d3" />企业名称
        </div>
        <a-input
          @blur="searchCustomer"
          v-model="enterpriseName"
          placeholder="输入企业名称"
          style="width: 100%; margin-top: 8px"
        />
      </div>
    </div>
    <div class="customer-info-line">
      <div class="search-title">
        <a-icon style="color: #875ad4; margin-right: 5px" size="16" type="project" />查询结果
      </div>
      <empty v-if="!loadingList && !resultList.length"></empty>
      <a-radio-group v-else v-model="selectedItem" @change="onChange">
        <a-radio class="company" v-for="(item, index) in resultList" :key="index" :value="item">
          {{ item.enterpriseName }}
        </a-radio>
      </a-radio-group>
    </div>
    <div style="text-align: center; margin-top: 16px">
      <a-button style="margin-right: 20px" @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm">新增客户</a-button>
    </div>
  </div>
</template>
  
<script>
import { Empty } from 'ant-design-vue'
import { searchCustomer, addCustomerQ } from '@/api/qrcode'
export default {
  data() {
    return {
      creditCode: null,
      enterpriseName: null,
      resultList: [],
      selectedItem: null,
      loadingList: false,
      queryItem: {
        creditCode: null,
        enterpriseName: null,
      },
    }
  },
  components: { Empty },
  methods: {
    searchCustomer() {
      const { $notification, $message } = this
      if (!this.creditCode) {
        $message.warn('请输入统一信用编码')
        return
      }
      const query = {
        creditCode: this.creditCode,
        enterpriseName: this.enterpriseName,
      }
      this.loadingList = true
      searchCustomer(query).then((result) => {
        this.resultList = result.data
        this.loadingList = false
      })
    },
    onChange(v) {
      const item = v.target.value
      this.queryItem.creditCode = item.enterpriseCreditCode
      this.queryItem.enterpriseName = item.enterpriseName
    },
    handleCancel(v) {
      this.$emit('cancelPop', v)
    },
    handleConfirm() {
      const { $notification } = this
      console.log(this.queryItem)
      addCustomerQ(this.queryItem).then((result) => {
        if (result.code == 200) {
          $notification['success']({
            message: '通知：',
            description: '新增客户成功',
            duration: 8,
          })
          this.handleCancel('update')
        } else {
          $notification['error']({
            message: '提醒：',
            description: result.msg,
            duration: 8,
          })
        }
      })
    },
  },
}
</script>
  
<style lang="less" scoped>
.top-search-box {
  padding: 20px 12px;
  border-radius: 8px;
  border: 1px solid #e9eef2;
  background-color: #fbfcfe;
}
.search-title {
  font-size: 16px;
  font-weight: bold;
}
.customer-info-line {
  margin-top: 16px;
  padding: 20px 12px;
  border-radius: 8px;
  border: 1px solid #e9eef2;
  background-color: #fbfcfe;
}
.company {
  margin-top: 10px;
}
</style>