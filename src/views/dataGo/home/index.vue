<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-25 15:31:43
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
          <div class="card" v-for="item in newAddReport" :key="item.type" @click="addReport(item)">
            <div class="add-card" v-if="!item.src">
              <img class="plus-icon" src="@/assets/images/plus.png" alt="dark" />
            </div>
            <div class="add-card" v-else>
              <img class="repoert-image" :src="item.src" alt="dark" />
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
                @blur="finishedReportSearchChange"
              />
            </div>
          </div>
        </div>
        <ReportCardSlider :cards="finishedReportList" @getNextPage="getReportFinishedList" />
      </div>
      <div class="home-part-box">
        <div class="flex flex-center home-part-title">
          <h1>草稿箱</h1>
          <div class="flex home-part-title-right flex-1">
            <div class="flex flex-center">
              <div class="right-item-title">报告类型：</div>
              <a-select v-model="draftTypeSelected" style="width: 200px" @change="draftTypeChange">
                <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="flex flex-center">
              <div class="right-item-title">草稿箱查询：</div>
              <a-input
                v-model="draftSearch"
                style="width: 200px"
                placeholder="输入草稿名称"
                @blur="draftSearchChange"
              />
            </div>
          </div>
        </div>
        <ReportCardSlider :cards="draftList" @getNextPage="getDraftList" />
      </div>
    </div>
    <a-modal v-model="visible" title="新增报告" @ok="handleOk">
      <div class="flex flex-center">
        <div class="right-item-title">选择新增报告类型：</div>
        <a-select v-model="addReportType" style="width: 200px">
          <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>
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

import { ReportCardSlider } from '@/components'
import { reportList } from '@/api/report'
export default {
  components: { ReportCardSlider },
  data() {
    return {
      firstLoading: true,
      reportTypeList,
      finishedReportTypeSelected: null,
      finishedReportSearch: null,
      draftTypeSelected: null,
      draftSearch: null,
      addReportType: null,
      visible: false,
      newAddReport: [
        {
          name: '标准化报告',
          type: 'addReport',
        },
        {
          name: '授信调查报告',
          type: 'addCreditReport',
          src: require('@/assets/images/auth.png'),
        },
        {
          name: '财务分析报告',
          type: 'addFinanceReport',
          src: require('@/assets/images/finance.png'),
        },
        {
          name: '能耗分析报告',
          type: 'addEnergyReport',
          src: require('@/assets/images/energy.png'),
        },
      ],
      finishedRequest: {
        status: 1,
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },
      draftRequest: {
        status: 0,
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },
      finishedReportList: [],
      draftList: [],
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      Promise.all([this.getReportFinishedList(), this.getDraftList()]).then((res) => {
        // 完成初始化请求
        this.firstLoading = false
      })
    },
    addReport(v) {
      if (v.type == 'addReport') {
        // 弹窗选择模板类型
        this.visible = true
      } else {
        // 前往新建模板内页
        let typeid = v.type == 'addCreditReport' ? 1 : v.type == 'addFinanceReport' ? 2 : 3
        this.toPage(typeid)
      }
    },
    handleOk() {
      this.toPage(this.addReportType)
      this.visible = false
    },
    toPage(type) {
      console.log('typeid :>> ', type)
      this.$router.push({ path: '/homePage/addReport/' + type })
    },
    // 获取已完成报告列表
    getReportFinishedList() {
      return new Promise((resolve, reject) => {
        if (
          this.firstLoading ||
          this.finishedRequest.total > this.finishedRequest.pageNum * this.finishedRequest.pageSize
        ) {
          reportList(this.finishedRequest)
            .then((res) => {
              this.finishedReportList = res.rows
              this.finishedRequest.total = res.total
              resolve(true)
            })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },
    // 获取草稿箱列表
    getDraftList() {
      return new Promise((resolve, reject) => {
        if (this.firstLoading || this.draftRequest.total > this.draftRequest.pageNum * this.draftRequest.pageSize) {
          reportList(this.draftRequest)
            .then((res) => {
              this.draftList = res.rows
              this.draftRequest.total = res.total
              resolve(true)
            })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },
    finishedReportTypeChange(v) {
      console.log(v)
    },
    finishedReportSearchChange(v) {
      console.log(v)
    },
    draftTypeChange(v) {
      console.log(v)
    },
    draftSearchChange(v) {
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
  overflow: hidden;
  .plus-icon {
    width: 24px;
  }
  .repoert-image {
    width: 100%;
    height: 100%;
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