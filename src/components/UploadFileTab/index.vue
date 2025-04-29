<!--
 * @Author: bekon
 * @Date: 2025-04-26 13:52:52
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-29 19:23:20
 * @FilePath: /report-background-system/src/components/UploadFileTab/index.vue
 * @Description: 
 * 
-->
<template>
  <div>
    <div class="step-tab">
      <div class="tab-item flex-1" :class="{ 'tab-active': selectTab == item }" v-for="item in tabType" :key="item">
        {{ item }}
      </div>
    </div>
    <a-spin :spinning="tabLoading">
      <div class="pop-box" v-if="selectTab == tabType[0]">
        <div class="tab-content">
          <a-upload
            :name="clickItem?.dataItem || ''"
            :customRequest="uploadFile"
            :showUploadList="false"
            :multiple="true"
            accept=".xlsx,.xls"
          >
            <div class="table-upload-btn">
              <a-icon type="upload" style="color: #3b82f6; font-size: 24px" />
              <div class="upload-txt-1">点击或拖拽文件到此处上传</div>
              <div class="upload-txt-2">支持 Excel 格式</div>
            </div>
          </a-upload>
          <div class="upload-list-show" v-if="fileList.length">
            <div class="name-title">已选择文件(仅保留最新文件)：</div>
            <div class="uploaded-file" v-for="(i, index) in fileList" :key="index">
              <div class="ppp">
                <a-icon type="upload" style="color: #3b82f6; font-size: 18px" /><span>{{ i.name }}</span>
              </div>
              <a-popconfirm
                title="是否确定删除已上传文件?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteUploadFile(i)"
              >
                <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                  <img style="width: 16px; height: 18px" src="@/assets/images/delete.png" alt="dark" />
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="closePop"> 取消 </a-button>
          <a-button class="pop-btn black-style" @click="analysisFile"> 文件解析 </a-button>
        </div>
      </div>
      <div v-else-if="selectTab == tabType[1]">
        <div class="desc-step-2">
          <a-icon style="margin-right: 5px" type="info-circle" />
          请将导入文件中的字段与系统字段进行匹配。系统已自动匹配相似字段，您可以根据需要调整。
        </div>
        <div class="tab-content">
          <div v-for="(item, index) in uploadTableFiedls" :key="index">
            <div class="big-title">{{ item.fieldNameCh }} <span class="must">*</span></div>
            <a-row class="row-show" :gutter="[10]">
              <a-col :span="10">
                <div class="mini-title">{{ item.fieldNameCh }}</div>
              </a-col>
              <a-col :span="4" class="item-center">
                <a-icon type="arrow-right" />
              </a-col>
              <a-col :span="10">
                <a-select
                  style="width: 100%"
                  v-model="mapping[item.fieldNameCh]"
                  placeholder="请选择匹配字段"
                  @change="pickFields"
                >
                  <a-select-option
                    v-for="(data, i) in excelData"
                    :data-fields="item.fieldNameCh"
                    :value="data.fieldNameCh"
                    :key="i"
                  >
                    {{ data.fieldNameCh }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </div>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="preStep"> 上一步 </a-button>
          <a-button class="pop-btn black-style" @click="pickEndFields"> 验证匹配 </a-button>
        </div>
      </div>
      <div v-else-if="selectTab == tabType[2]">
        <div class="desc-step-3">
          <a-icon style="margin-right: 5px" type="info-circle" />
          若部分字段匹配存在问题，请检查下方标记的字段。您可以返回上一步调整匹配，或者继续导入（系统将忽略有问题的字段）。
        </div>
        <div class="tab-content">
          <a-table class="tab-table" :columns="columns" :data-source="pickFieldsData" :pagination="false" size="small">
            <template slot="tableNameZhSource" slot-scope="text">
              <div class="sys-text">{{ text }}<span class="must">*</span></div>
            </template>
            <template slot="tableNameZh" slot-scope="text">
              <div class="sys-text">{{ text }}</div>
            </template>
            <template slot="status" slot-scope="text">
              <div class="simo" v-if="text"><a-icon type="check-circle" />一致</div>
              <div class="unsimo" v-else><a-icon type="close-circle" />不一致</div>
            </template>
          </a-table>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="preStep"> 返回调整 </a-button>
          <a-button class="pop-btn green-style" @click="importToDatabase"> 确定导入数据库 </a-button>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getFields, pullTableData } from '@/api/report'
import { specialTableDeal, normalTableDeal, columns } from './util'
const tabType = ['1.上传文件', '2.字段匹配', '3.验证结果']
export default {
  name: 'uploadFileTab',
  props: {
    clickItem: {
      type: Object,
      default: null,
    },
    customerInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabType,
      tabLoading: false,
      selectTab: tabType[0],
      fileList: [],
      columns,
      pickFieldsData: [],
      uploadTableFiedls: [],
      excelData: [],
      mapping: {},
    }
  },
  methods: {
    uploadFile(options) {
      const { file, filename, onSuccess, onError } = options
      this.fileList = [file]
    },
    deleteUploadFile(i) {
      this.fileList = this.fileList.filter((v) => v.uid !== i.uid)
    },
    dUploadFileFun() {
      const { $notification } = this
      const formData = new FormData()
      formData.append('indicatorsName', this.clickItem.dataItem)
      formData.append('creditCode', this.clickItem.creditCode)
      this.fileList.forEach((fileItem) => {
        formData.append('files', fileItem)
      })
    },
    preStep() {
      const currentStep = this.tabType.findIndex((ui) => ui === this.selectTab)
      this.selectTab = this.tabType[currentStep - 1]
    },
    pickEndFields() {
      // 最后一步
      this.selectTab = this.tabType[2]
      let pickFieldsData = []
      for (const key in this.mapping) {
        if (Object.prototype.hasOwnProperty.call(this.mapping, key)) {
          const sysEn = this.uploadTableFiedls.find((u) => u.fieldNameCh == key)
            ? this.uploadTableFiedls.find((u) => u.fieldNameCh == key).fieldName
            : null
          const excelEn = this.excelData.find((u) => u.fieldNameCh == key)
            ? this.excelData.find((u) => u.fieldNameCh == key).fieldName
            : null
          const element = this.mapping[key]
          pickFieldsData.push({
            sysEn,
            excelEn,
            tableNameZhSource: key,
            tableNameZh: element,
            status: key == element,
          })
        }
      }
      this.pickFieldsData = pickFieldsData
    },
    pickFields(v, item) {
      const key = item.data.attrs['data-fields']
      // 赋值
      this.mapping[key] = v
    },
    async analysisFile() {
      if (this.fileList.length) {
        this.tabLoading = true
        await this.readXLSXcontent(this.fileList, this.clickItem)
        // 获取表格字段
        getFields(this.clickItem)
          .then((res) => {
            const reD = JSON.parse(JSON.stringify(res.data))
            const uploadTableFiedls = []
            this.tabLoading = false
            const mapping = {}
            reD.forEach((item) => {
              if (typeof item == 'object') {
                const fE = this.excelData.find((i) => i.fieldNameCh == item.fieldNameCh)
                mapping[item.fieldNameCh] = fE ? fE.fieldNameCh : this.excelData[0].fieldNameCh
                uploadTableFiedls.push(item)
              } else {
                const fE = this.excelData.find((i) => i.fieldNameCh == item)
                mapping[item] = fE ? fE.fieldNameCh : this.excelData[0].fieldNameCh
                uploadTableFiedls.push({
                  fieldName: item,
                  fieldNameCh: item,
                })
              }
            })
            this.uploadTableFiedls = uploadTableFiedls
            this.mapping = mapping
            this.selectTab = tabType[1]
          })
          .catch((err) => {
            this.tabLoading = false
          })
      } else {
        this.$message.warning('未获取到有效文件')
      }
    },
    importToDatabase() {
      const { $notification } = this
      const formData = new FormData()
      const item = this.clickItem
      formData.append('file', this.fileList[0])
      formData.append('appUserId', this.customerInfo.appUserId)
      pullTableData(item, formData, this.pickFieldsData, this.mapping)
        .then((res) => {
          if (res.code == 200) {
            $notification['success']({
              message: '通知：',
              description: '导入数据库成功',
              duration: 8,
            })
            this.resetData()
            this.closePop()
            this.update()
          } else {
            $notification['error']({
              message: '提醒：',
              description: res.msg,
              duration: 8,
            })
          }
        })
        .catch((err) => {
          $notification['error']({
            message: '提醒：',
            description: err,
            duration: 8,
          })
        })
    },
    resetData() {
      this.selectTab = tabType[0]
      this.fileList = []
      this.pickFieldsData = []
      this.uploadTableFiedls = []
      this.excelData = []
      this.mapping = {}
    },
    closePop() {
      this.resetData()
      this.$emit('closePop')
    },
    update() {
      this.$emit('update')
    },
    async readXLSXcontent(event, clickItem) {
      const specialTable = ['现金流量表', '利润表', '资产负债表']
      const { tableNameZh } = clickItem
      let excelData = null
      if (event.length > 0) {
        const file = event[0]
        const reader = new FileReader()
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          excelData = JSON.stringify(jsonData, null, 2)
          if (specialTable.includes(tableNameZh)) {
            // 特殊化处理
            this.excelData = await specialTableDeal(excelData)
          } else {
            this.excelData = await normalTableDeal(excelData)
          }
        }
        reader.readAsArrayBuffer(file)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.tab-content {
  max-height: 70vh;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}
.step-tab {
  background-color: #f4f4f5;
  display: flex;
  text-align: center;
  border-radius: 8px 8px 0 0;
  line-height: 2;
  overflow: hidden;
  .tab-item {
    margin: 3px;
  }
  .tab-active {
    background-color: #fff;
    cursor: pointer;
  }
}
.pop-box {
  display: flex;
  flex-direction: column;
}
/deep/.ant-upload.ant-upload-select {
  display: block;
}
.table-upload-btn {
  margin: 20px 0;
  width: 100%;
  display: block;
  border: 1px dashed #e4e4e7;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  .choose-file {
    border-radius: 10px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
  .upload-txt-1 {
    font-weight: bold;
    color: #000;
  }
}
.upload-list-show {
  text-align: left;
  .name-title {
    margin-top: 5px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
}
.ppp {
  display: flex;
  align-items: center;
}
.pop-btn {
  border-radius: 5px;
}
.uploaded-file {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9fafb;
}
.footer-btn {
  margin-top: 20px;
  width: 100%;
  justify-content: flex-end;
  .black-style {
    margin-left: 20px;
    background-color: #374151;
    color: #fff;
  }
  .green-style {
    margin-left: 20px;
    background-color: #16a34a;
    color: #fff;
  }
}
.desc-step-2 {
  margin: 12px 0;
  font-size: 14px;
  color: #416ade;
  background-color: #eff6ff;
  border-radius: 5px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
}
.desc-step-3 {
  margin: 12px 0;
  font-size: 14px;
  color: #aa721e;
  background-color: #fefce8;
  border-radius: 5px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
}
.big-title {
  font-size: 16px;
  font-weight: bold;
  .must {
    color: #bb1515;
  }
}
.row-show {
  display: flex;
  align-items: center;
}
.item-center {
  display: flex;
  justify-content: center;
}
.simo {
  color: #3eb269;
  font-size: 14px;
  & i {
    margin-right: 5px;
  }
}
.unsimo {
  color: #bb1515;
  font-size: 14px;
  & i {
    margin-right: 5px;
  }
}
.sys-text {
  font-size: 14px;
  color: #000;
  .must {
    margin-left: 5px;
    color: #bb1515;
  }
}
</style>