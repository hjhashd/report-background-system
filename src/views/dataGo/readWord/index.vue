<!--
 * @Author: bekon
 * @Date: 2025-02-18 17:10:43
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-27 17:09:20
 * @FilePath: /report-background-system/src/views/dataGo/readWord/index.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content" ref="pageContent">
      <iframe ref="myIframe" :src="url" :width="width" :height="height" frameborder="0"></iframe>
    </div>
  </page-header-wrapper>
</template>

<script>
export default {
  data() {
    return {
      url: `http://47.107.173.5:5559/`,
      width: 0,
      height: 0,
    }
  },
  mounted() {
    const page = this.$refs.pageContent
    this.width = page.offsetWidth - 48
    this.height = page.offsetHeight - 48
  },
}
</script>

<style lang="less" scoped>
</style>