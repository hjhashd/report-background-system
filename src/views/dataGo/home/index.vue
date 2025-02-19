<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-19 14:24:11
 * @FilePath: /report-background-system/src/views/dataGo/home/index.vue
 * @Description: 主页
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <div class="home-part-box">
        <h1>新建报告</h1>
        <div class="flex-row-spacearound">
          <div class="card" v-for="item in newAddReport" :key="item.type">
            <div class="add-card">
              <img class="plus-icon" src="@/assets/images/plus.png" alt="dark" />
            </div>
            <div class="add-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="home-part-box">
        <div class="flex flex-center home-part-title">
          <h1>已完成报告</h1>
          <div class="flex home-part-title-right flex-1">
            <div class="flex flex-center">
              <div class="right-item-title">报告类型：</div>
              <a-select v-model="finishedReportTypeSelected" style="width: 200px" @change="finishedReportTypeChange">
                <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="flex flex-center">
              <div class="right-item-title">报告查询：</div>
              <a-input
                v-model="finishedReportSearch"
                style="width: 200px"
                placeholder="输入报告名称"
                @change="finishedReportSearchChange"
              />
            </div>
          </div>
        </div>
        <ReportCardSlider :cards="reportCards" />
      </div>
      <div class="home-part-box">
        <div class="flex flex-center home-part-title">
          <h1>草稿箱</h1>
          <div class="flex home-part-title-right flex-1">
            <div class="flex flex-center">
              <div class="right-item-title">报告类型：</div>
              <a-select v-model="finishedReportTypeSelected" style="width: 200px" @change="finishedReportTypeChange">
                <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="flex flex-center">
              <div class="right-item-title">草稿箱查询：</div>
              <a-input
                v-model="finishedReportSearch"
                style="width: 200px"
                placeholder="输入报告名称"
                @change="finishedReportSearchChange"
              />
            </div>
          </div>
        </div>
        <ReportCardSlider :cards="reportCards" />
      </div>
    </div>
  </page-header-wrapper>
</template>

<script>
const reportTypeList = [
  {
    type: 1,
    name: '授信调查报告',
  },
  {
    type: 2,
    name: '财务分析报告',
  },
  {
    type: 3,
    name: '能耗分析报告',
  },
]
const newAddReport = [
  {
    name: '标准化报告',
    type: 'addReport',
  },
  {
    name: '授信调查报告',
    type: 'addCreditReport',
  },
  {
    name: '财务分析报告',
    type: 'addFinanceReport',
  },
  {
    name: '能耗分析报告',
    type: 'addEnergyReport',
  },
]

import { ReportCardSlider } from '@/components'
export default {
  components: { ReportCardSlider },
  data() {
    return {
      reportTypeList,
      finishedReportTypeSelected: null,
      finishedReportSearch: null,
      newAddReport,
      reportCards: [
        {
          title: '报告 1',
          description: '这是报告 1 的详细描述',
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述',
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述',
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述',
        },
        {
          title: '报告 1',
          description: '这是报告 1 的详细描述',
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述',
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述',
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述',
        },
        {
          title: '报告 1',
          description: '这是报告 1 的详细描述',
        },
        {
          title: '报告 2',
          description: '这是报告 2 的详细描述',
        },
        {
          title: '报告 3',
          description: '这是报告 3 的详细描述',
        },
        {
          title: '报告 4',
          description: '这是报告 4 的详细描述',
        },
      ],
    }
  },
  created() {},
  methods: {
    finishedReportTypeChange(v) {
      console.log(v)
    },
    finishedReportSearchChange(v) {
      console.log(v)
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  background-color: #fff;
  padding: 20px;
}
.home-part-box {
  margin-bottom: 30px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 180px;
  margin-bottom: 4px;
  border: 1px solid #015dea;
  border-radius: 5px;
  cursor: pointer;
  .plus-icon {
    width: 24px;
  }
  &:hover {
    border: 2px solid #015dea;
  }
}
.home-part-title {
  justify-content: space-between;
  margin-bottom: 20px;
}
.right-item-title {
  white-space: nowrap;
  margin-left: 10px;
}
</style>