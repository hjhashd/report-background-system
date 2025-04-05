<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-06 02:44:22
 * @FilePath: /report-background-system/src/views/dataGo/home/index.vue
 * @Description: 主页
 * 
-->
<template>
  <page-header-wrapper>
    <div>
      <!-- <div class="page-title">报告管理系统</div> -->
      <div class="home-part-box">
        <h1 class="mini-title">新建</h1>
        <div class="flex-row-spacearound">
          <div class="card" v-for="item in newAddReport" :key="item.type" @click="addReport(item)">
            <div :class="{ 'add-card': true, bz: item.type == 'addReport' }">
              <img class="plus-icon repoert-image" :src="item.src" alt="dark" />
            </div>
            <div class="add-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <data-go-tabs :tab="reportTypeList" @changeTab="changeTab">
        <div class="p-20">
          <s-table ref="table" rowKey="key" :data="loadData" :columns="tabColumns">
            <div slot="reportName" slot-scope="text, scoped">
              <span class="report-name" @click="handleChat(scoped)">{{ text }}</span>
              <a-tooltip placement="right" v-if="scoped.status != 1">
                <template slot="title">
                  <span v-if="scoped.dataStatus == 2">未完成数据授权，数据上传</span>
                  <span v-else-if="scoped.dataStatus == 3">已完成数据授权，数据上传，正在制作报告</span>
                </template>
                <a-icon type="bell" theme="filled" style="color: #c92c1f" />
              </a-tooltip>
            </div>
            <span slot="status" slot-scope="text">
              <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
              <span v-if="text == 1" :class="['table-status', 'status' + text]">已完成</span>
              <span v-else class="table-status status0">草稿</span>
            </span>
          </s-table>
        </div>
      </data-go-tabs>
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

import { DataGoTabs, STable } from '@/components'
import { reportList } from '@/api/report'
import { tabColumns } from './util'
export default {
  components: { DataGoTabs, STable },
  data() {
    return {
      reportTypeList,
      addReportType: null,
      visible: false,
      activeNow: reportTypeList[0].type,
      tabChangeStatuas: true,
      newAddReport: [
        {
          name: '标准化报告',
          type: 'addReport',
          src: require('@/assets/images/bz-report.png'),
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
      tabColumns,
      // 查询参数
      queryParam: {
        pageSize: 6,
        status: '',
      },
      loadData: (parameter) => {
        if (parameter.sortOrder && this.queryParam.status != parameter.sortOrder) {
          this.queryParam.status = parameter.sortOrder
          this.tabChangeStatuas = true
        }
        const requestParameters = Object.assign({}, parameter, this.queryParam, {
          pageNum: this.tabChangeStatuas ? 1 : parameter.pageNo,
          reportType: this.activeNow,
          status:
            parameter.sortOrder && parameter.sortOrder == 'ascend'
              ? 1
              : parameter.sortOrder && parameter.sortOrder == 'descend'
              ? 0
              : '',
        })
        return new Promise((resolve, reject) => {
          reportList(requestParameters).then((res) => {
            this.tabChangeStatuas = false
            const reD = {
              pageSize: requestParameters.pageSize,
              pageNo: requestParameters.pageNo,
              totalCount: res.total,
              totalPage: Math.ceil(res.total / requestParameters.pageSize),
              data: res.rows,
            }
            resolve(reD)
          })
        })
      },
    }
  },
  filters: {
    dealTime(v) {
      let time = parseInt(v)
      return Math.ceil(time / 3600)
    },
  },
  methods: {
    changeTab(type) {
      this.tabChangeStatuas = true
      this.activeNow = type
      this.queryParam = {
        pageSize: 6,
        status: '',
      }
      this.selectChange()
    },
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + v.id })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    addReport(v) {
      // if (v.type == 'addReport') {
      //   // 弹窗选择模板类型
      //   this.visible = true
      // } else {
      // 前往新建模板内页
      let typeid =
        v.type == 'addCreditReport' ? 1 : v.type == 'addFinanceReport' ? 2 : v.type == 'addEnergyReport' ? 3 : 1
      this.toPage(typeid)
      // }
    },
    handleOk() {
      this.toPage(this.addReportType)
      this.visible = false
    },
    toPage(type) {
      this.$router.push({ path: '/homePage/addReport/' + type })
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
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
  width: 12.8vw;
  height: 25vh;
  margin-bottom: 4px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
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
.add-name {
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #000000;
  text-align: center;
  font-weight: 400;
}
.home-part-title {
  justify-content: space-between;
  margin-bottom: 20px;
}
.right-item-title {
  white-space: nowrap;
  margin-left: 10px;
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
.mini-title {
  font-family: PingFangSC-Semibold;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 600;
  border-bottom: 1px solid #d6e1e5;
}
.bz {
  .plus-icon {
    width: 60px;
    height: 67px;
  }
}
.table-status {
  font-size: 12px;
  &.status0 {
    color: #666666;
  }
  &.status1 {
    color: #25f021;
  }
  &.status2 {
    color: #15dff1;
  }
  &.status3 {
    color: #0a69ef;
  }
}
.p-20 {
  padding: 20px;
}
.report-name {
  cursor: pointer;
  &:hover {
    color: #0a69ef;
    border-bottom: 1px solid #0a69ef;
  }
}
</style>