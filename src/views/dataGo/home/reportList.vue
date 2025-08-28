<!--
 * @Author: bekon
 * @Date: 2025-05-14 13:58:53
 * @LastEditors: bekon
 * @LastEditTime: 2025-08-28 14:35:03
 * @FilePath: /report-background-system/src/views/dataGo/home/reportList.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <a-tabs type="card" @change="callback">
      <a-tab-pane v-for="item in tabs" :key="item.type" :tab="item.name">
        <div class="white">
          <draft-list v-if="item.type == 1"></draft-list>
          <report-lists v-else-if="item.type == 2"></report-lists>
        </div>
      </a-tab-pane>
    </a-tabs>
  </page-header-wrapper>
</template>

<script>
import draftList from './draftList.vue'
import reportLists from './components/reportLists.vue'
export default {
  name: 'listTab',
  components: { draftList, reportLists },
  data() {
    return {
      tabs: [
        {
          type: 1,
          name: '草稿列表',
        },
        {
          type: 2,
          name: '财务分析报告',
        },
      ],
    }
  },
}
</script>

<style lang="less" scoped>
/deep/ .ant-tabs-bar{
  margin-bottom: 0 !important;
}
.white{
  background-color: #fff;
}
</style>