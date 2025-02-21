<!--
 * @Author: bekon
 * @Date: 2025-02-19 16:51:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 18:28:30
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
        <span>{{ salesperson }}</span>
      </div>
      <div class="form-item">
        <label>员工号</label>
        <span>{{ employeeId }}</span>
      </div>
      <div class="form-item">
        <label>银行</label>
        <span>{{ bank }}</span>
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
          <a-select style="width: 80%" placeholder="选择上传数据" @change="uploadTypeHandle">
            <a-select-option :value="item.id" v-for="item in dataType" :key="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="button-group">
        <button style="width: 80%" @click="generateQrCode">申请数据</button>
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
          <span>{{ salesperson }}</span>
        </a-col>
        <a-col :span="12" class="qr-info-item">
          <label>员工号</label>
          <span>{{ salesperson }}</span>
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
import { uploadType, yongtu, dataTypes } from '@/config/constants'
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
      salesperson: '张三',
      employeeId: '4001214',
      bank: '工商银行',
      usage: '',
      uploadData: null,
      dataTypes,
      selectedDataTypes: [],
      yongtu,
      reD: null,
      dataType: null,
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
  },
  methods: {
    generateQrCode() {
      // 这里可以添加生成二维码的逻辑，比如调用后端接口等
      console.log('生成二维码操作')
      console.log('object :>> ', this.selectedDataTypes, this.usage)

      // const params = {
      //   useRemark: 1,
      //   needTypes: '[1,2,3]',
      //   codeType: 1,
      //   bankName1: '中国农业银行',
      //   bankName2: '北京潞阳支行',
      //   bankId1: 2,
      //   bankId2: 10002,
      // }
      // buildQRCode(params)
      //   .then((res) => {
      //     console.log('res :>> ', res)
      //   })
      //   .catch((err) => {
      //     this.$message.error('申请失败：' + err)
      //   })
    },
    finishClose() {
      this.reD = null
      this.$emit('close')
    },
    uploadTypeHandle(v) {
      console.log('v :>> ', v)
      this.uploadData = v
    },
    usageHandle(v) {
      console.log('v :>> ', v)
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