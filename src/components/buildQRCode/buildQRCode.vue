<!--
 * @Author: bekon
 * @Date: 2025-02-19 16:51:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-05-08 14:57:49
 * @FilePath: /report-background-system/src/components/buildQRCode/buildQRCode.vue
 * @Description: 
 * 
-->
<template>
  <div class="data-application">
    <!-- 申请数据 -->
    <div v-if="!reD">
      <data-go-tabs :tab="tabs" @changeTab="changeTab">
        <div v-if="activeTab !== 3">
          <div class="form-item">
            <label>营业员</label>
            <span>{{ userInfo.userName }}</span>
          </div>
          <div class="form-item">
            <label>员工号</label>
            <span>{{ userInfo.jobNumber }}</span>
          </div>
          <div class="form-item">
            <label>银行</label>
            <span>{{ userInfo.bankName1 }} - {{ userInfo.bankName2 }}</span>
          </div>
          <div class="form-item">
            <a-select style="width: 80%" placeholder="用途" @change="usageHandle">
              <a-select-option :value="item.id" v-for="item in yongtu" :key="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
          <div v-if="activeTab === 1" class="tab-content">
            <div class="form-item">
              <a-input class="ant-select-selection" style="width: 80%" placeholder="输入企业名称" v-model="showCompany">
              </a-input>
            </div>
            <div class="data-need">
              <label>需求数据：</label>
              <div>
                <a-checkbox-group :options="dataTypes" v-model="selectedDataTypes">
                  <span slot="label" slot-scope="{ value }">{{ value }}</span>
                </a-checkbox-group>
              </div>
            </div>
          </div>
          <div v-if="activeTab === 2" class="tab-content">
            <div class="form-item">
              <a-select
                showSearch
                style="width: 80%"
                placeholder="选择客户"
                @change="uploadCustomerHandle"
                :filter-option="filterOption"
              >
                <a-select-option :value="item.userId" v-for="item in customerList" :key="item.userId">
                  {{ item.userName }}
                </a-select-option>
              </a-select>
            </div>
            <div class="form-item">
              <a-select style="width: 80%" placeholder="选择上传数据" @change="uploadTypeHandle" mode="multiple">
                <a-select-option :value="item.id" v-for="item in dataType" :key="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="button-group">
            <a-button :loading="applyLoading" class="apply-btn" @click="generateQrCode">申请数据</a-button>
          </div>
        </div>
        <div v-else>
          <div class="qr-line-box">
            <div
              class="qr-line"
              :class="{ active: item.id == activeQr }"
              v-for="(item, index) in qrList"
              :key="item.id"
              @click="qrlinkClick(item)"
            >
              <div class="title single-line-text">
                <span>{{ index + 1 }}</span
                >{{ item | dealQrCodeTitle }}
              </div>
              <div class="time">{{ item.createTime.split(' ')[0].replaceAll('-', '/') }}</div>
            </div>
            <a-button type="link" @click="toQrList">前往查看完成列表></a-button>
          </div>
          <div class="button-group">
            <a-button :disabled="!activeQr" class="apply-btn" @click="lookQrCode">查看二维码</a-button>
          </div>
        </div>
      </data-go-tabs>
    </div>
    <!-- 申请完成 -->
    <div v-else>
      <ul class="tab-nav">
        <li class="active" @click="activeTab = 'apply'">数据申请成功</li>
      </ul>
      <a-row>
        <a-col :span="12" class="qr-info-item">
          <label>营业员</label>
          <span>{{ userInfo.userName }}</span>
        </a-col>
        <a-col :span="12" class="qr-info-item">
          <label>员工号</label>
          <span>{{ userInfo.jobNumber }}</span>
        </a-col>
        <a-col :span="24" class="qr-info-item">
          <label>银行</label>
          <span>{{ reD.bankName1 }}-{{ reD.bankName2 }}</span>
        </a-col>
        <a-col :span="24" class="qr-info-item" v-if="reD.showCompany">
          <label>企业名称</label>
          <span>{{ reD.showCompany }}</span>
        </a-col>
        <a-col :span="24" class="qr-info-item">
          <label>用途</label>
          <span>{{ reD.useRemark | yongtuShow(this) }}</span>
        </a-col>
      </a-row>
      <img :src="reD.codeUrl" alt="" />
      <div class="button-group" style="margin-top: 10px">
        <a-button class="apply-btn" @click="finishClose">完成</a-button>
      </div>
    </div>
    <a-modal class="qr-modal" v-model="qrCodePop" :footer="null">
      <div style="text-align: center; padding: 20px" v-if="checkQrLine">
        <img style="width: 200px; height: 200px" :src="checkQrLine.codeUrl" alt="dark" />
      </div>
    </a-modal>
  </div>
</template>
  
<script>
import { buildQRCode, getQRCodeList } from '@/api/qrcode'
import { getCustomerList } from '@/api/report'
import { uploadType, yongtu, dataTypes } from '@/config/constants'
import { mapState } from 'vuex'
import DataGoTabs from '@/components/DataGoTabs/DataGoTabs.vue'
export default {
  components: { DataGoTabs },
  props: {
    userInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabs: [
        {
          type: 1,
          name: '数据申请',
        },
        {
          type: 2,
          name: '上传数据',
        },
        {
          type: 3,
          name: '申请历史',
        },
      ],
      activeTab: 1,
      bank: '',
      usage: '',
      showCompany: '',
      uploadData: [],
      dataTypes,
      selectedDataTypes: [],
      qrList: [],
      yongtu,
      reD: null,
      dataType: null,
      customerList: [],
      customer: null,
      applyLoading: false,
      checkQrLine: null,
      activeQr: null,
      qrCodePop: false,
    }
  },
  filters: {
    yongtuShow(v, that) {
      const i = that.yongtu.find((item) => item.id == v)
      return i.name
    },
    dealQrCodeTitle(v) {
      let usea = v.useRemark == 1 ? '信贷调查报告' : v.useRemark == 2 ? '财务分析报告' : '能耗分析报告'
      let qrcodeType = v.codeType == 1 ? '数据申请' : '上传数据'
      return `.${usea}-${qrcodeType}`
    },
  },
  created() {
    this.dataType = uploadType()
    this.dataTypes = this.dataTypes.map((i) => {
      return Object.assign(i, {
        label: i.name,
        value: i.id,
      })
    })
    this.getCustomerList()
    this.getQrcodeList()
  },
  ...mapState({
    userInfo: (state) => state.user.info,
  }),
  methods: {
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    qrlinkClick(v) {
      this.checkQrLine = v
      this.activeQr = v.id
    },
    lookQrCode() {
      this.qrCodePop = true
    },
    getQrcodeList() {
      getQRCodeList({
        pageNum: 1,
        pageSize: 20,
      }).then((res) => {
        this.qrList = res.rows
      })
    },
    changeTab(type) {
      this.activeTab = type
    },
    getCustomerList() {
      getCustomerList({}).then((res) => {
        this.customerList = res.data
      })
    },
    generateQrCode() {
      const { $notification } = this
      let params = {
        useRemark: this.usage,
        needTypes: this.activeTab === 1 ? JSON.stringify(this.selectedDataTypes) : JSON.stringify(this.uploadData),
        codeType: this.activeTab,
        bankName1: this.userInfo.bankName1,
        bankName2: this.userInfo.bankName2,
        bankId1: this.userInfo.bankId1,
        bankId2: this.userInfo.bankId2,
        showCompany: this.showCompany || '',
      }
      if (this.activeTab === 2) {
        if (!(this.customer || this.usage || this.uploadData.length)) {
          $notification['info']({
            message: '通知：',
            description: '请完成所有选项选择/填写',
            duration: 8,
          })
          return
        }
        // 新增客户项
        params.appUserId = this.customer
      } else {
        if (!this.usage || !this.selectedDataTypes.length) {
          $notification['info']({
            message: '通知：',
            description: '请完成所有选项选择/填写',
            duration: 8,
          })
          return
        }
      }
      this.applyLoading = true
      // 这里可以添加生成二维码的逻辑，比如调用后端接口等
      buildQRCode(params)
        .then((res) => {
          if (this.activeTab === 2) {
            $notification['success']({
              message: '通知：',
              description: '已成功发送上传数据请求至客户',
              duration: 8,
            })
            this.applyLoading = false
          } else {
            this.reD = res.data
            this.applyLoading = false
          }
        })
        .catch((err) => {
          this.applyLoading = false
          this.$message.error('申请失败：' + err)
        })
    },
    finishClose() {
      this.reD = null
      this.$emit('close')
    },
    uploadTypeHandle(v) {
      this.uploadData = v
    },
    uploadCustomerHandle(v) {
      this.customer = v
    },
    usageHandle(v) {
      this.usage = v
    },
    toQrList() {
      const { $router } = this
      $router.push({ path: `/homePage/qrCodeList` })
      this.$emit('close')
    },
  },
}
</script>

<style scoped lang="less">
.data-application {
  padding: 60px 20px 40px;
  text-align: center;
}
.tab-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
}
.tab-nav li {
  display: inline-block;
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: none;
  margin-right: 5px;
  font-weight: bold;
  font-family: PingFangSC-Semibold;
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: 0;
}
.tab-nav li.active {
  color: #007bff;
}
.tab-content {
  width: 100%;
}
.form-item {
  font-size: 16px;
  color: #000;
  margin-top: 25px;
  margin-bottom: 25px;
  text-align: left;
  display: flex;
  justify-content: center;
  & /deep/ .ant-select-selection {
    display: flex;
    align-items: center;
    height: 40px;
    width: 100%;
    border-radius: 8px;
    background-color: #f2f7ff;
  }
  & /deep/ .ant-select-selection__rendered {
    width: 100%;
    .ant-select-selection__placeholder {
      font-size: 16px;
    }
  }
}
.data-need {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  font-size: 16px;
  label {
    margin-right: 8px;
  }
}
.form-item label {
  width: 150px;
  text-align: right;
  margin-right: 10px;
}
.form-item span {
  flex: 1;
  text-align: center;
}
.select-box {
  height: 56px;
}
.button-group {
  margin-top: 20px;
}
.qr-info-item {
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #3d4566;
  letter-spacing: 0;
  font-weight: 400;
  display: flex;
  margin: 10px 0;
  label {
    width: 100px;
    margin-right: 15px;
    text-align: right;
  }
}
.apply-btn {
  width: 80%;
  height: 45px;
  background-color: #6cbdf6 !important;
  opacity: 0.71;
  font-family: PingFangSC-Medium;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.98) !important;
  letter-spacing: 0;
  text-align: center;
  font-weight: 500;
  border-radius: 21px;
  margin-bottom: 20px;
}
.qr-line-box {
  max-height: 320px;
  overflow-x: hidden;
  overflow-y: scroll;
}
.qr-line {
  display: flex;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #3d4566;
  letter-spacing: 0;
  line-height: 53px;
  font-weight: 400;
  justify-content: space-between;
  padding: 0 20px;
  cursor: pointer;
  &.active {
    background-color: #f6bd79;
  }
}
</style>