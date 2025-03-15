<!--
 * @Author: bekon
 * @Date: 2025-02-25 15:23:20
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-15 16:23:51
 * @FilePath: /report-background-system/src/views/dataGo/home/addReport.vue
 * @Description: 
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content">
      <a-row>
        <a-col :span="16">
          <div v-if="currentModalInfo" class="modal-port">
            <img :src="currentModalInfo.typeImage" alt="" />
          </div>
        </a-col>
        <a-col :span="8">
          <div class="model-choose">
            <div class="flex-row-spacebetween">
              <h2>客户</h2>
              <a-button icon="user-add" :loading="addLoading" style="width: 120px" @click="addCustomer"
                >新增客户</a-button
              >
            </div>
            <div class="search-item">
              <img style="width: 18px; height: 18px" src="@/assets/images/customer.png" alt="dark" />
              <span>选择客户：</span>
              <a-select style="width: 60%" placeholder="选择查询客户" @change="customerHandle">
                <a-select-option v-for="(cu, index) in customers" :value="cu.creditCode" :key="index">
                  {{ cu.enterpriseName }}
                </a-select-option>
              </a-select>
            </div>
            <h2>报告模板</h2>
            <a-checkbox-group v-model="chooseModal" @change="onChange">
              <a-row>
                <a-col :span="24" v-for="item in modalList" :key="item.templateName" style="margin-bottom: 10px">
                  <a-checkbox :value="item.templateName">
                    <span class="modal-title">{{ item.templateName }}</span>
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
            <div class="button-group">
              <a-button :loading="applyLoading" style="width: 80%; height: 40px" @click="buildReport"
                >新建报告</a-button
              >
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-modal :footer="null" v-model="addCustomerPop" title="企业信息查询" @ok="confirmCustomer" @cancel="cancelPop">
      <AddCustomer @cancelPop="cancelPop"></AddCustomer>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { AddCustomer } from '@/components'
import { getCustomerList, getReportModal, getModalInfo } from '@/api/report'
export default {
  name: 'addReport',
  components: { AddCustomer },
  data() {
    return {
      reportType: null,
      applyLoading: false,
      customers: [],
      modalInfo: [],
      modalList: [],
      currentModalInfo: null,
      chooseModal: [],
      chooseCustomer: null,
      addLoading: false,
      addCustomerPop: false,
    }
  },
  created() {
    // 获取路由参数
    this.reportType = this.$route.params.reportType
    this.initData()
  },
  methods: {
    initData() {
      this.getReportModal()
      this.getCustomerList()
      this.getModalInfo()
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
      getReportModal({ type: this.reportType }).then((res) => {
        // 默认全选
        this.modalList = res.data.map((v) => {
          this.chooseModal.push(v.templateName)
          return v
        })
      })
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
    customerHandle(v) {
      this.chooseCustomer = this.customers.find((item) => item.creditCode == v)
    },
    buildReport() {
      const { $notification, $router } = this
      // 生产报告
      if (!this.chooseModal || !this.chooseCustomer) {
        $notification['warning']({
          message: '提醒：',
          description: '请选择生产报告客户及报告模板信息',
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

<style lang="less" scoped>
.model-choose {
  padding-left: 20px;
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
  border-right: 1px solid #000;
  width: 100%;
  img {
    width: 100%;
  }
}
</style>