<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 14:46:52
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
          <a-select-option v-for="(cu, index) in customers" :value="cu" :key="index">
            {{ cu }}
          </a-select-option>
        </a-select>
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
import { getCustomerList } from '@/api/report'
export default {
  data() {
    return {
      customers: ['广州**香料有限公司'],
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      getCustomerList()
        .then((res) => {
          console.log('res :>> ', res);
        })
        .catch((err) => {
          this.$message.error('获取客户列表失败:' + err)
        })
    },
    customerHandle(v) {
      console.log('object :>> ', v)
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
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