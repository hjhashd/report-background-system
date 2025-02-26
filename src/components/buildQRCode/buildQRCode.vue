<!--
 * @Author: bekon
 * @Date: 2025-02-19 16:51:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 17:28:57
 * @FilePath: /report-background-system/src/components/buildQRCode/buildQRCode.vue
 * @Description: 
 * 
-->
<template>
  <div class="data-application">
    <!-- 申请数据 -->
    <div v-if="!reD">
      <ul class="tab-nav">
        <li :class="{ active: activeTab === 'apply' }" @click="activeTab = 'apply'">数据申请</li>
        |
        <li :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">上传数据</li>
      </ul>
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
          <a-select-option :value="item.id" v-for="item in yongtu" :key="item.id"> {{ item.name }} </a-select-option>
        </a-select>
      </div>
      <div v-if="activeTab === 'apply'" class="tab-content">
        <div class="data-need">
          <label>需求数据：</label>
          <div>
            <a-checkbox-group :options="dataTypes" v-model="selectedDataTypes">
              <span slot="label" slot-scope="{ value }">{{ value }}</span>
            </a-checkbox-group>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'upload'" class="tab-content">
        <div class="form-item">
          <a-select style="width: 80%" placeholder="选择客户" @change="uploadCustomerHandle">
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
        <a-button :loading="applyLoading" style="width: 80%; height: 48px" @click="generateQrCode">申请数据</a-button>
      </div>
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
        <a-col :span="24" class="qr-info-item">
          <label>用途</label>
          <span>{{ reD.useRemark | yongtuShow(this) }}</span>
        </a-col>
      </a-row>
      <img :src="reD.codeUrl" alt="" />
      <div class="button-group" style="margin-top: 10px">
        <button style="width: 80%" @click="finishClose">完成</button>
      </div>
    </div>
  </div>
</template>
  
<script>
import { buildQRCode } from '@/api/qrcode'
import { getCustomerList } from '@/api/report'
import { uploadType, yongtu, dataTypes } from '@/config/constants'
import { mapState } from 'vuex'
export default {
  props: {
    userInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeTab: 'apply',
      bank: '',
      usage: '',
      uploadData: [],
      dataTypes,
      selectedDataTypes: [],
      yongtu,
      reD: null,
      dataType: null,
      customerList: [],
      customer: null,
      applyLoading: false,
    }
  },
  filters: {
    yongtuShow(v, that) {
      const i = that.yongtu.find((item) => item.id == v)
      return i.name
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
  },
  ...mapState({
    userInfo: (state) => state.user.info,
  }),
  methods: {
    getCustomerList() {
      getCustomerList({}).then((res) => {
        this.customerList = res.data
      })
    },
    generateQrCode() {
      const { $notification } = this
      let params = {
        useRemark: this.usage,
        needTypes:
          this.activeTab === 'apply' ? JSON.stringify(this.selectedDataTypes) : JSON.stringify(this.uploadData),
        codeType: this.activeTab === 'apply' ? 1 : 2,
        bankName1: this.userInfo.bankName1,
        bankName2: this.userInfo.bankName2,
        bankId1: this.userInfo.bankId1,
        bankId2: this.userInfo.bankId2,
      }
      if (this.activeTab === 'upload') {
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
        if (!(this.usage || this.selectedDataTypes.length)) {
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
          if (this.activeTab === 'upload') {
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
  margin-top: 40px;
}
.button-group button {
  padding: 10px 30px;
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
</style>