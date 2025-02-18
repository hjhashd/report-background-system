<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-18 18:19:03
 * @FilePath: /report-background-system/src/views/dataGo/home/index.vue
 * @Description: 主页
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <div class="home-part-box">
        <h1>新建报告</h1>
        <ReportCardSlider :cards="reportCards" />
      </div>
      <div class="home-part-box">
        <h1>已完成报告</h1>
        <ReportCardSlider :cards="reportCards" />
      </div>
      <div class="home-part-box">
        <h1>草稿箱</h1>
        <ReportCardSlider :cards="reportCards" />
      </div>

    </div>
  </page-header-wrapper>
</template>

<script>
import { ReportCardSlider } from '@/components';
export default {
  components: { ReportCardSlider },
  data() {
    return {
      reportCards: [
        {
          title: '报告 1',
          description: '这是报告 1 的详细描述'
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述'
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述'
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述'
        }, {
          title: '报告 1',
          description: '这是报告 1 的详细描述'
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述'
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述'
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述'
        }, {
          title: '报告 1',
          description: '这是报告 1 的详细描述'
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述'
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述'
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述'
        },
      ]
    }
  },
  created() { },
  methods: {}
}
</script>

<style lang="less" scoped>
.page-content {
  background-color: #fff;
  padding: 20px;
}
.home-part-box{
  margin-bottom: 30px;
}
</style>