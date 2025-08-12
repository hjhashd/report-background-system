<!--
 * @Author: bekon
 * @Date: 2025-02-25 15:23:20
 * @LastEditors: bekon
 * @LastEditTime: 2025-08-12 18:42:40
 * @FilePath: /report-background-system/src/views/dataGo/home/addReport.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <data-go-tabs :tab="reportTypeList" :activeTab="reportType" @changeTab="changeTab">
        <div class="flex add-report-page">
          <div class="left-box">
            <h1 style="text-align: center; font-size: 32px">报告目录</h1>
            <div class="flex">
              <div
                class="mini-tab flex-1"
                :class="{ active: tabA == item.type }"
                v-for="item in tabs"
                :key="item.type"
                @click="changeType(item)"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="model-choose">
              <div v-if="tabA == 2" style="margin-top: 20px">
                <div class="flex-row-spacebetween">
                  <a-input-search
                    @change="searchCustomer"
                    placeholder="输入统一社会信用代码/企业名称"
                    style="width: 100%"
                  />
                  <a-tooltip placement="top">
                    <template slot="title">
                      <span>新建客户</span>
                    </template>
                    <a-button icon="user-add" :loading="addLoading" @click="addCustomer"></a-button>
                  </a-tooltip>
                </div>
                <div style="margin-top: 20px; max-height: 360px; overflow-x: hidden; overflow-y: scroll">
                  <a-radio-group v-model="chooseCustomer" @change="chooseChange">
                    <a-radio v-for="(cu, index) in customers" :value="cu" :key="index">
                      <a-tooltip placement="top">
                        <template slot="title">
                          <span>
                            {{ cu.enterpriseName }}
                          </span>
                        </template>
                        <span class="hh single-line-text">
                          {{ cu.enterpriseName }}
                        </span>
                      </a-tooltip>
                    </a-radio>
                  </a-radio-group>
                </div>
              </div>
              <div v-else style="margin-top: 10px">
                <div>
                  <a-tabs :active-key="reportTemplateClassify" @change="reportTemplateChange">
                    <a-tab-pane
                      v-for="item in reportTemplateClassifyList"
                      :value="item.id"
                      :key="item.id"
                      :tab="item.classifyName"
                    ></a-tab-pane>
                  </a-tabs>
                </div>
                <a-checkbox-group v-model="chooseModal" @change="onChange">
                  <a-row>
                    <a-col :span="24" v-for="item in modalList" :key="item.templateName" style="margin-bottom: 10px">
                      <a-checkbox :value="item.templateName">
                        <span class="modal-title hh">{{ item.templateNameJc }}</span>
                      </a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </div>
              <div class="button-group">
                <a-button :loading="applyLoading" style="width: 80%; height: 40px" @click="buildReport"
                  >生成报告</a-button
                >
              </div>
            </div>
          </div>
          <div class="right-box">
            <div v-if="currentModalInfo" class="modal-port">
              <img :src="currentModalInfo.typeImage" alt="" />
            </div>
          </div>
        </div>
      </data-go-tabs>
    </div>
    <a-modal :footer="null" v-model="addCustomerPop" title="新建企业信息" @ok="confirmCustomer" @cancel="cancelPop">
      <AddCustomer @cancelPop="cancelPop"></AddCustomer>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
const reportTypeList = [
  {
    type: 1,
    icon: require('@/assets/images/sx.png'),
    iconActive: require('@/assets/images/sx-active.png'),
    name: '授信调查报告',
  },
  {
    type: 2,
    icon: require('@/assets/images/cw.png'),
    iconActive: require('@/assets/images/cw-active.png'),
    name: '财务分析报告',
  },
  {
    type: 3,
    icon: require('@/assets/images/nh.png'),
    iconActive: require('@/assets/images/nh-active.png'),
    name: '能耗分析报告',
  },
]
import { AddCustomer, DataGoTabs } from '@/components'
import { getCustomerList, getReportModal, getModalInfo, getReportTemplateClassify } from '@/api/report'
export default {
  name: 'addReport',
  components: { AddCustomer, DataGoTabs },
  data() {
    return {
      tabs: [
        { type: 2, name: '选择客户' },
        { type: 1, name: '选择模块' },
      ],
      tabA: 2,
      reportType: null,
      applyLoading: false,
      reportTypeList,
      preCustomers: [],
      customers: [],
      modalInfo: [],
      modalList: [],
      currentModalInfo: null,
      chooseModal: [],
      chooseCustomer: null,
      addLoading: false,
      addCustomerPop: false,
      reportTemplateClassifyList: [],
      reportTemplateClassify: null,
      reportTemplateClassifyName: '',
    }
  },
  created() {
    // 获取路由参数
    this.reportType = this.$route.params.reportType || 1
    this.initData()
  },
  methods: {
    initData() {
      this.getCustomerList()
      this.getModalInfo()
      this.getReportTemplateClassify()
    },
    getReportTemplateClassify() {
      getReportTemplateClassify({ type: parseInt(this.reportType) }).then((res) => {
        this.reportTemplateClassifyList = res.data
        this.reportTemplateClassify = res.data[0].id
        this.reportTemplateClassifyName = res.data[0].classifyName
      })
    },
    reportTemplateChange(v) {
      this.reportTemplateClassify = v
      this.reportTemplateClassifyName = this.reportTemplateClassifyList.find((item) => item.id == v).classifyName
      this.getReportModal()
    },
    changeType(item) {
      const { $notification, $message } = this
      if (this.tabA == item.type) return
      if (item.type == 1 && !this.chooseCustomer) {
        // 未选中客户不给跳转
        $message.warn('请先选择客户')
        return
      }
      this.tabA = item.type
    },
    chooseChange(v) {
      setTimeout(() => {
        this.tabA = 1
        this.getReportModal()
      }, 500)
    },
    changeTab(v) {
      this.chooseModal = []
      this.reportType = v
      this.getReportModal()
      this.currentModalInfo = this.modalInfo.find((v) => v.typeEnum == this.reportType)
    },
    getCustomerList() {
      this.customers = []
      getCustomerList({})
        .then((res) => {
          const reD = res.data
          this.customers = reD.map((item) => {
            const { userName, enterprise, userId } = item
            return {
              userName,
              creditCode: (enterprise && enterprise.enterpriseCreditCode) || '',
              enterpriseName: (enterprise && enterprise.enterpriseName) || '',
              appUserId: userId,
            }
          })
          this.preCustomers = JSON.parse(JSON.stringify(this.customers))
        })
        .catch((err) => {
          this.$message.error('获取客户列表失败:' + err)
        })
    },
    getModalInfo() {
      getModalInfo().then((res) => {
        this.modalInfo = res.data
        this.currentModalInfo = res.data.find((v) => v.typeEnum == this.reportType)
      })
    },
    getReportModal() {
      this.chooseModal = []
      getReportModal({
        type: this.reportType,
        creditCode: this.chooseCustomer.creditCode,
        classifyId: this.reportTemplateClassify,
      }).then((res) => {
        // 默认全选
        this.modalList = res.data.map((v) => {
          this.chooseModal.push(v.templateName)
          return v
        })
      })
    },
    searchCustomer(v) {
      const s = v.target.value
      const preList = JSON.parse(JSON.stringify(this.preCustomers))
      if (s) {
        this.customers = preList.filter((v) => v.enterpriseName.includes(s))
      } else {
        this.customers = JSON.parse(JSON.stringify(this.preCustomers))
      }
    },
    onChange(v) {
      this.chooseModal = v
    },
    cancelPop(v) {
      if (v == 'update') {
        this.getCustomerList()
      }
      this.addCustomerPop = false
      this.addLoading = false
    },
    buildReport() {
      const { $notification, $router } = this
      //生成报告
      if (!this.chooseModal || !this.chooseModal.length || !this.chooseCustomer) {
        $notification['warning']({
          message: '提醒：',
          description: '请选择生成报告客户及报告模板信息',
          duration: 8,
        })
        return
      }

      const paramsRequest = {
        appUserId: this.chooseCustomer.appUserId,
        reportType: parseInt(this.reportType),
        enterpriseName: this.chooseCustomer.enterpriseName,
        template: JSON.stringify(this.chooseModal),
        creditCode: this.chooseCustomer.creditCode,
        category: this.reportTemplateClassifyName,
      }
      // 去往查看数据页面
      $router.push({ path: '/homePage/viewCustomerData', query: paramsRequest })
    },
    // 新增客户
    addCustomer() {
      this.addCustomerPop = true
      this.addLoading = true
    },
    confirmCustomer() {},
  },
}
</script>

<style>
::-webkit-scrollbar {
  width: 4px;
}
</style>
<style lang="less" scoped>
.model-choose {
  padding: 0 20px;
  h2 {
    margin-top: 20px;
  }
}
.button-group {
  margin-top: 40px;
  text-align: center;
}
.button-group button {
  padding: 0 30px;
  margin-right: 10px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.button-group button:last-child {
  background-color: #007bff;
  color: white;
}
.modal-title {
  font-size: 16px;
  color: #000;
}
.modal-port {
  width: 100%;
  img {
    width: 100%;
  }
}
.add-report-page {
  justify-content: space-around;
  padding: 20px 0;
}
.left-box {
  padding-top: 20px;
  width: 23vw;
  background: #ffffff;
  border: 2px solid rgba(177, 188, 199, 0.59);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  border-radius: 15px;
}
.right-box {
  width: 42.8vw;
  background: #ffffff;
  border: 2px solid rgba(177, 188, 199, 0.59);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  border-radius: 15px;
}
.mini-tab {
  font-family: PingFangSC-Semibold;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.25);
  letter-spacing: 0;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  &:first-of-type {
    border-right: 1px solid #bbc0d5;
  }
  &.active {
    color: #6cbdf6;
  }
}
.hh {
  width: 100%;
  font-family: PingFangSC-Semibold;
  font-size: 18px;
  color: #3d4566;
  letter-spacing: 0;
  line-height: 30px;
  font-weight: 600;
  white-space: pre-wrap;
}
</style>