<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 16:20:20
 * @FilePath: /report-background-system/src/views/dataGo/client/index.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <customer-com></customer-com>
    </div>
  </page-header-wrapper>
</template>

<script>
import customerCom from './customerCom.vue'
export default {
  components: { customerCom },
}
</script>

<style lang="less" scoped>
.page-content{
  padding: 0;
}
</style>