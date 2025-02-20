<!--
 * @Author: bekon
 * @Date: 2025-02-19 16:51:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-20 18:46:26
 * @FilePath: /report-background-system/src/components/buildQRCode/buildQRCode.vue
 * @Description: 
 * 
-->
<template>
  <div class="data-application">
    <ul class="tab-nav">
      <li :class="{ active: activeTab === 'apply' }" @click="activeTab = 'apply'">数据申请</li>
      |
      <li :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">上传数据</li>
    </ul>
    <div v-if="activeTab === 'apply'" class="tab-content">
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
        <a-select style="width: 80%" placeholder="用途">
          <a-select-option value="lucy1"> 用途1 </a-select-option>
          <a-select-option value="lucy2"> 用途2 </a-select-option>
        </a-select>
      </div>
      <div class="data-need">
        <label>需求数据：</label>
        <div>
          <span v-for="(dataType, index) in dataTypes" :key="index">
            <input type="checkbox" v-model="selectedDataTypes" :value="dataType" />
            {{ dataType }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="activeTab === 'upload'" class="tab-content">
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
        <a-select style="width: 80%" placeholder="用途">
          <a-select-option value="lucy1"> 用途1 </a-select-option>
          <a-select-option value="lucy2"> 用途2 </a-select-option>
        </a-select>
      </div>
      <div class="form-item">
        <a-select style="width: 80%" placeholder="选择上传数据">
          <a-select-option value="data1"> 数据1 </a-select-option>
          <a-select-option value="data2"> 数据2 </a-select-option>
        </a-select>
      </div>
    </div>
    <div class="button-group">
      <button @click="generateQrCode">生成二维码</button>
    </div>
  </div>
</template>
  
  <script>
export default {
  data() {
    return {
      activeTab: 'apply',
      salesperson: '张三',
      employeeId: '4001214',
      bank: '工商银行',
      usage: '',
      uploadData: '',
      dataTypes: ['财务数据', '企业基础数据', '电力数据'],
      selectedDataTypes: [],
    }
  },
  methods: {
    goBack() {
      // 这里可以添加返回逻辑，比如路由跳转等
      console.log('返回操作')
    },
    generateQrCode() {
      // 这里可以添加生成二维码的逻辑，比如调用后端接口等
      console.log('生成二维码操作')
    },
  },
}
</script>
  
  <style scoped lang="less">
.data-application {
  padding: 60px 20px 40px;
  background-color: #f9f9f9;
  border-radius: 20px;
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
  color: #000;
  font-size: 16px;
  font-weight: bold;
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
</style>