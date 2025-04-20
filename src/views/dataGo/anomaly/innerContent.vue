<!--
 * @Author: bekon
 * @Date: 2025-02-18 16:37:26
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-20 17:55:33
 * @FilePath: \report-background-system\src\views\dataGo\anomaly\innerContent.vue
 * @Description: 
 * 
-->
<template>
  <div>
    <div class="page-content flex-col">
      <div class="flex top-card-content">
        <data-go-tabs :tab="reportTypeList" @changeTab="changeTab" :hasRightContant="true">
          <template slot="rightContant" v-if="!customerDetail">
            <div class="search-item" style="flex: 1">
              <!-- <img style="" src="@/assets/images/customers.png" alt="dark" /> -->
              <a-icon type="team" style="color: #7fbbf1; margin-right: 10px; font-size: 22px" />
              <a-select style="flex: 1" placeholder="选择查询客户" v-model="selectedCustomer" @change="selectCu">
                <a-select-option v-for="(customer, index) in customers" :value="customer.userId" :key="index">
                  {{ customer.enterprise.enterpriseName }}
                </a-select-option>
              </a-select>
            </div>
          </template>
        </data-go-tabs>
      </div>
      <div class="p-20">
        <div v-if="tabSelected === '财务基础指标'">
          <div class="tab-list flex">
            <div
              :class="{ 'one-tab': true, 'tab-active': item.value == secondLevel }"
              v-for="(item, index) in caiwuList"
              :key="index"
              @click="secondLevel = item.value"
            >
              <a-icon :type="item.icon" /><span>{{ item.name }}</span>
            </div>
          </div>
          <a-table
            :columns="columns"
            :data-source="tableData"
            :bordered="true"
            :pagination="false"
            :loading="tableLoading"
          >
            <template slot="yoy" slot-scope="text">
              <!-- <div class="up" v-if="text > 0">{{ text }}</div>
              <div class="down" v-else-if="text < 0">{{ text }}</div>
              <div v-else>{{ text }}</div> -->
              <div>{{ text }}</div>
            </template>
            <template slot="yclevel" slot-scope="text">
              <a-tag color="#fae450" v-if="text == '等级1'">
                {{ text }}
              </a-tag>
              <a-tag color="#f3ae44" v-else-if="text == '等级2'">
                {{ text }}
              </a-tag>
              <a-tag color="#f50" v-else-if="text == '等级3'">
                {{ text }}
              </a-tag>
            </template>
          </a-table>
        </div>
        <div class="flex-col" v-else>
          <div class="table-title" v-if="tabSelected === '财务异常指标'">资产负债表重点数据</div>
          <a-collapse v-model="activeKey" expand-icon-position="right">
            <a-collapse-panel v-for="(item, index) in columns" :key="item.year">
              <template slot="header">
                <div class="flex">
                  <span>{{ item.year }}年数据</span>
                  <div class="icon" v-if="!index">最新</div>
                </div>
              </template>
              <a-table
                v-if="tableData && tableData[index]"
                :columns="item.columns"
                :data-source="tableData[index].reData"
                :bordered="true"
                :pagination="false"
                :loading="tableLoading"
              >
                <template slot="yoy" slot-scope="text">
                  <!-- <div class="up" v-if="text > 0">{{ text }}</div>
                <div class="down" v-else-if="text < 0">{{ text }}</div>
                <div v-else>{{ text }}</div> -->
                  <!-- <div v-if="text == 'NaN' || !text"></div>
                    <div v-else>{{ parseInt(parseFloat(text) * 10000) / 100 }}%</div> -->
                  <div>{{ text }}</div>
                </template>
                <template slot="yclevel" slot-scope="text">
                  <a-tag color="#fae450" v-if="text == '等级1'">
                    {{ text }}
                  </a-tag>
                  <a-tag color="#f3ae44" v-else-if="text == '等级2'">
                    {{ text }}
                  </a-tag>
                  <a-tag color="#f50" v-else-if="text == '等级3'">
                    {{ text }}
                  </a-tag>
                </template>
                <template slot="searchResult" slot-scope="text, scoped">
                  <div class="text-show">
                    <span v-if="scoped.searchInfo && scoped.searchInfo.content">{{ scoped.searchInfo.content }}</span
                    ><a-button class="table-btn" size="small" @click="updateReasult(scoped)">添加</a-button>
                  </div>
                </template>
                <template slot="uploadFile" slot-scope="text, scoped">
                  <a-button icon="upload" class="table-btn" size="small" @click="uploadItem(scoped)">
                    上传文件
                  </a-button>
                </template>
              </a-table>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </div>
    <a-modal v-model="tableUploadPop" width="50vw" title="上传文件" :footer="null">
      <div class="pop-box">
        <a-upload
          :name="clickItem?.dataItem || ''"
          :customRequest="uploadFile"
          :showUploadList="false"
          :multiple="true"
          accept=".doc,.docx,image/*,.pdf,.xlsx,.xls"
        >
          <div class="table-upload-btn">
            <a-icon type="upload" style="color: #9ca3af; font-size: 22px" />
            <div style="padding: 15px">拖拽文件到此处或点击上传</div>
            <a-button class="choose-file">选择文件</a-button>
          </div>
        </a-upload>
        <div class="upload-list-show" v-if="fileList.length">
          <div class="name-title">已上传文件列表：</div>
          <div v-for="(i, index) in fileList" :key="index">
            <span>{{ i.name }}</span
            ><a-popconfirm
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
        <a-button class="pop-btn" @click="dUploadFileFun"> 完成 </a-button>
      </div>
    </a-modal>
    <a-modal v-model="changeResearch" width="50vw" title="编辑现场调研结果" :footer="null">
      <a-textarea :style="{ height: '200px' }" v-model="searchInfoContent" :auto-size="true" />
      <div style="text-align: right; margin-top: 16px">
        <a-button class="pop-btn" @click="changeResearch = false"> 取消 </a-button>
        <a-button class="pop-btn new-record ml-10" @click="updateSearchInfo"> 保存为新记录 </a-button>
      </div>
    </a-modal>
  </div>
</template>
  
  <script>
const reportTypeList = [
  {
    type: 1,
    name: '财务基础指标',
  },
  {
    type: 2,
    name: '财务异常指标',
  },
  {
    type: 3,
    name: '衍生异常指标',
  },
]
//负债表、利润表、现金流量表
const caiwuList = [
  {
    value: '负债表',
    name: '负债表',
    icon: 'credit-card',
  },
  {
    value: '利润表',
    name: '利润表',
    icon: 'rise',
  },
  {
    value: '现金流量表',
    name: '现金流量表',
    icon: 'bar-chart',
  },
  {
    value: '',
    name: '财务报表',
    icon: 'file-text',
  },
]
import { getAbnormalNew, getCustomerList, dUploadFile, updateSearchContent } from '@/api/report'
import { DataGoTabs } from '@/components'
import { dealColumnsNew } from './util'
export default {
  components: { DataGoTabs },
  props: {
    customerDetail: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      reportTypeList,
      selectedCustomer: null,
      tableLoading: true,
      customers: [],
      tabSelected: '财务基础指标',
      caiwuList,
      secondLevel: '负债表',
      currentChangeItem: null,
      tableUploadPop: false,
      changeResearch: false,
      clickItem: null,
      searchInfoContent: '',
      activeKey: [],
      columns: [],
      tableData: [],
      fileList: [],
    }
  },
  created() {
    getCustomerList({
      enterpriseAuth: 1,
    }).then((res) => {
      const responseData = res.data
      this.customers = responseData
      if (this.customerDetail) {
        this.selectedCustomer = responseData.find((i) => i.userId == this.customerDetail.userId).userId
      } else {
        this.selectedCustomer = responseData[0].userId
      }
      this.getAbnormalData()
    })
  },
  watch: {
    secondLevel: {
      handler() {
        this.getAbnormalData()
      },
    },
  },
  methods: {
    updateReasult(v) {
      this.currentChangeItem = v
      this.searchInfoContent = v.searchInfo?.content || ''
      this.changeResearch = true
    },
    changeTab(v) {
      switch (v) {
        case 1:
          this.tabSelected = '财务基础指标'
          break
        case 2:
          this.tabSelected = '财务异常指标'
          break
        case 3:
          this.tabSelected = '衍生异常指标'
          break
      }
      this.getAbnormalData()
    },
    tabsChange(tab) {
      this.tabSelected = tab
      this.getAbnormalData()
    },
    selectCu(v) {
      this.getAbnormalData()
    },
    getAbnormalData() {
      this.tableLoading = true
      const query = {
        firstLevel: this.tabSelected,
        secondLevel: this.tabSelected === '财务基础指标' ? this.secondLevel : null,
        year: null,
      }
      getAbnormalNew(this.selectedCustomer, query).then((res) => {
        const reObjN = dealColumnsNew(res.data, this.tabSelected, this.secondLevel)
        if (this.tabSelected !== '财务基础指标') {
          const cc = []
          this.tableData = reObjN.reData.filter((v, ii) => {
            if (v.reData.length) {
              cc.push(reObjN.columns[ii])
            }
            return v.reData.length
          })
          this.columns = cc
        } else {
          this.tableData = reObjN.reData
          this.columns = reObjN.columns
        }
        if (this.tabSelected !== '财务基础指标') {
          this.activeKey = [this.columns[0].year]
        }
        this.tableLoading = false
      })
    },
    uploadFile(options) {
      const { file, filename, onSuccess, onError } = options
      this.fileList.push(file)
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
      dUploadFile(formData).then((res) => {
        this.tableUploadPop = false
        if (res.code && res.code == 200) {
          $notification['success']({
            message: '上传通知：',
            description: `上传文件成功`,
            duration: 6,
          })
          this.fileList = []
        } else {
          $notification['error']({
            message: '上传通知：',
            description: `${res.msg}`,
            duration: 6,
          })
        }
      })
    },
    uploadItem(v) {
      this.tableUploadPop = true
      this.clickItem = v
    },
    updateSearchInfo() {
      const { $notification } = this
      const query = {
        indicatorsName: this.currentChangeItem.dataItem,
        creditCode: this.currentChangeItem.creditCode,
        content: this.searchInfoContent,
      }
      updateSearchContent(query)
        .then((res) => {
          $notification['success']({
            message: '消息通知：',
            description: '保存成功',
            duration: 8,
          })
          this.changeResearch = false
          this.searchInfoContent = ''
          this.getAbnormalData()
          return
        })
        .catch((err) => {
          this.changeResearch = false
          this.searchInfoContent = ''
          $notification['error']({
            message: '错误信息：',
            description: `${err}`,
            duration: 8,
          })
          return
        })
    },
  },
}
</script>
  
  <style scoped lang="less">
/deep/ .ant-table-thead > tr > th,
/deep/ .ant-table-tbody > tr > td {
  padding: 6.5px !important;
}
/deep/ .ant-upload {
  width: 100%;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.page-content {
  width: 100%;
  height: 100%;
  min-height: 70vh;
  padding: 0;
  background-color: #fff;
}
.top-card-content {
  width: 100%;
  align-items: center;
  justify-content: space-between;
}
.search-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
  span {
    margin: 0 5px;
    font-size: 16px;
  }
}
.down {
  color: green;
}
.up {
  color: red;
}
.p-20 {
  padding: 20px;
}
.tab-list {
  padding-bottom: 20px;
  .one-tab {
    margin-right: 20px;
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid #e3e2e7;
    cursor: pointer;
    span {
      margin-left: 10px;
    }
    &.tab-active {
      position: relative;
      background-color: #3965e4;
      color: #fff;
      font-weight: bold;
    }
  }
}
.table-title {
  padding: 10px;
  text-align: center;
  background-color: #e8eef7;
  color: rgba(0, 0, 0, 0.85);
}
.table-btn {
  margin-left: 5px;
  background-color: #dbeafe;
  color: #1d64e2;
  font-size: 12px;
  letter-spacing: -1px;
}
.table-upload-btn {
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
}
.pop-box {
  text-align: right;
}
.pop-btn {
  margin-top: 20px;
}
.new-record {
  background-color: #18181b;
  color: #fff;
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
</style>