<!--
 * @Author: bekon
 * @Date: 2025-02-25 15:23:20
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-12 09:53:58
 * @FilePath: /report-background-system/src/views/dataGo/home/viewReport.vue
 * @Description: 报告预览
 * 
-->
<template>
  <page-header-wrapper>
    <a-spin :spinning="pageLoading">
      <div class="page-content flex-col" style="padding: 0; width: 100%">
        <div class="report-view">
          <div class="flex-row-spacebetween tools">
            <div class="sys-title">企业信息查询系统</div>
            <div class="flex">
              <div class="btn-item" @click="updateReportData">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="redo" /></div>
                <span>更新数据</span>
              </div>
              <div class="btn-item" @click="isListCollapsed = false">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="eye" /></div>
                <span>查看数据</span>
              </div>
              <div class="btn-item" @click="showDrawer">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="edit" /></div>
                <span>编辑</span>
              </div>
              <div class="btn-item" @click="saveAsDraft">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="save" /></div>
                <span>另存草稿</span>
              </div>
              <div class="btn-item" @click="applyReport">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="appstore" /></div>
                <span>发布应用</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex">
          <div ref="editorContainerRef" class="editor-container" v-if="reportId">
            <OnlyOfficeEditor :reportId="reportId" :editorHeight="editorHeight" />
          </div>
          <div class="container-detail right-content" :class="{ 'list-collapsed': isListCollapsed }">
            <div class="flex-row-spacebetween content-item">
              <div class="title">企业详情信息</div>
              <a-button icon="close" type="link" style="color: #ea3425" @click="isListCollapsed = true"></a-button>
            </div>
            <div class="content-item">
              <div class="limit-title"><a-icon type="user" />客户信息</div>
              <div class="detail-content">
                <div class="flex card-box">
                  <a-avatar style="color: #5380ea; background-color: #dde8fc">
                    {{ customerDetail?.logoName || '' }}
                  </a-avatar>
                  <div class="customer-info flex-1 single-line-text">
                    <a-tooltip placement="top">
                      <template slot="title">
                        <div class="limit-title">{{ customerDetail?.enterpriseName || '' }}</div>
                      </template>
                      <div class="limit-title single-line-text">{{ customerDetail?.enterpriseName || '' }}</div>
                    </a-tooltip>
                    <a-tooltip placement="top">
                      <template slot="title">
                        <div class="code">统一社会信用代码：{{ customerDetail?.enterpriseCreditCode || '' }}</div>
                      </template>
                      <div class="code single-line-text">
                        统一社会信用代码：{{ customerDetail?.enterpriseCreditCode || '' }}
                      </div>
                    </a-tooltip>
                  </div>
                </div>
                <div class="flex customer-data-info" v-if="customerDetail">
                  <div class="flex-1 d-info">
                    <div class="num">{{ customerDetail.authCount }}个</div>
                    <div class="name">授权数量</div>
                  </div>
                  <div class="flex-1 d-info">
                    <div class="num">{{ customerDetail.uploadCount }}个</div>
                    <div class="name">上传数据</div>
                  </div>
                  <div class="flex-1 d-info">
                    <div class="num">4份</div>
                    <div class="name">报告+草稿</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="content-item">
              <div class="limit-title"><a-icon type="database" />授权数据</div>
              <div class="detail-content">
                <div
                  :class="{ 'finished-content': item.status == 1 }"
                  class="table-show"
                  v-for="item in customerReportDetail"
                  :key="item.id"
                >
                  <div class="flex-row-spacebetween" style="margin-bottom: 4px">
                    <div class="table-name single-line-text">{{ item.tableNameZh }}</div>
                    <a-icon style="color: #9d59ef" v-if="item.status == 0" type="question-circle" />
                    <a-icon style="color: #5ec269" v-if="item.status == 1" type="check-circle" />
                  </div>
                  <div class="flex-row-spacebetween">
                    <div class="time">
                      {{ item.status == 1 ? '已完成' : '未授权' }} {{ item.createTime | dealCreateTime }}
                    </div>
                    <a-button class="update-btn" type="primary" size="small" @click="updateTable(item)">更新</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a-upload
          ref="uploadRef"
          name="tableUpload"
          :customRequest="uploadFile"
          :showUploadList="false"
          :openFileDialogOnClick="openFileDialogOnClick"
        ></a-upload>
        <a-drawer
          title="报告结论编辑"
          placement="right"
          :closable="true"
          :visible="visible"
          :maskClosable="false"
          width="85vw"
          @close="onClose"
        >
          <edit-modal :reportDetail="reportDetail"></edit-modal>
        </a-drawer>
      </div>
    </a-spin>
  </page-header-wrapper>
</template>

<script>
import {
  getReportDetail,
  customerData,
  getCustomerDetail,
  updateReportDate,
  updateReport,
  applyReport,
  setDraftStatus
} from '@/api/report'
import { OnlyOfficeEditor } from '@/components'
import EditModal from './editModal.vue'
export default {
  name: 'addReport',
  components: { OnlyOfficeEditor, EditModal },
  data() {
    return {
      pageLoading: false,
      visible: false,
      getChangeHeight: true,
      editorHeight: null,
      config: null,
      reportId: null,
      isListCollapsed: true,
      reportDetail: null,
      customerReportDetail: null,
      customerDetail: null,
      clickItem: null,
      disabledList: [],
      openFileDialogOnClick: false,
    }
  },
  created() {
    this.reportId = this.$route.params.reportId
    this.init()
  },
  filters: {
    dealCreateTime(v) {
      if (v) {
        return v.split(' ')[0]
      } else {
        return ''
      }
    },
  },
  watch: {
    isListCollapsed: {
      handler(v) {
        if (!v && this.getChangeHeight) {
          // 获取页面高度
          this.$nextTick(() => {
            const editors = this.$refs.editorContainerRef
            this.editorHeight = editors.offsetHeight + 'px'
            this.getChangeHeight = false
          })
        }
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      const editors = this.$refs.editorContainerRef
      this.editorHeight = editors.offsetHeight + 'px'
    })
  },
  methods: {
    init() {
      getReportDetail(this.reportId).then((res) => {
        this.reportDetail = res.data
        getCustomerDetail(res.data.appUserId).then((result) => {
          this.customerDetail = Object.assign(result.data, {
            logoName: result.data.enterpriseName.substring(0, 1),
          })
          this.getData()
        })
      })
    },
    updateReportData() {
      // 更新数据
      const { $notification, $confirm } = this
      $confirm({
        title: '更新报告提醒',
        content: `是否对当前报告进行更新，更新后内容可能较之前发生变化。`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.pageLoading = true
          updateReport(this.reportDetail.id).then((res) => {
            $notification['success']({
              message: '通知：',
              description: `更新报告数据成功`,
              duration: 6,
            })
            this.pageLoading = false
            this.init()
          })
        },
      })
    },
    getData() {
      customerData({
        creditCode: this.customerDetail.enterpriseCreditCode,
        reportType: this.reportDetail.reportType,
        template: JSON.parse(this.reportDetail.template),
      }).then((response) => {
        this.customerReportDetail = response.data
      })
    },
    saveAsDraft() {
      const { $notification } = this
      this.pageLoading = true
      setDraftStatus(this.reportDetail.id).then((res) => {
        this.pageLoading = false
        $notification['success']({
          message: '通知：',
          description: `另存为草稿成功`,
          duration: 6,
        })
      })
    },
    applyReport() {
      const { $notification } = this
      this.pageLoading = true
      applyReport(this.reportDetail.id).then((res) => {
        this.pageLoading = false
        $notification['success']({
          message: '通知：',
          description: `发布成功`,
          duration: 6,
        })
      })
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
    },
    updateTable(v) {
      // 获取a-upload组件实例
      if (!this.openFileDialogOnClick) {
        this.$confirm({
          title: '更新文件数据提醒',
          content: `是否确认进行（${v.tableNameZh}）文件数据更新，该操作会更新原有的（${v.tableNameZh}）数据信息。`,
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.clickItem = v
            this.openFileDialogOnClick = true
            setTimeout(() => {
              this.$refs.uploadRef.$el.querySelector('input[type="file"]').click()
              this.openFileDialogOnClick = false
            }, 50)
          },
          onCancel: () => {
            this.openFileDialogOnClick = false
          },
        })
      }
    },
    uploadFile(options) {
      const { $notification } = this
      const { file, onSuccess, onError } = options
      const formData = new FormData()
      const item = this.clickItem
      if (this.disabledList.findIndex((i) => i.tableName == item.tableName) != -1) {
        $notification['info']({
          message: '上传通知：',
          description: `该文档文件正在上传，请稍后再试`,
          duration: 6,
        })
        return
      }
      formData.append(item.tableName, file)
      this.uploading = true
      this.pageLoading = true
      this.disabledList.push(item.tableName)
      updateReportDate(formData, this.reportDetail.id).then((res) => {
        this.pageLoading = false
        this.uploading = false
        this.disabledList = this.disabledList.filter((item) => item != item.tableName)
        if (res.code && res.code == 200) {
          $notification['success']({
            message: '上传通知：',
            description: `上传文件成功：${file.name}`,
            duration: 6,
          })
          this.getData()
        } else {
          $notification['error']({
            message: '上传通知：',
            description: `${res.msg}`,
            duration: 6,
          })
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .ant-page-header-heading {
  display: none;
}
/deep/ .ant-pro-page-header-wrap-children-content {
  margin: 0;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.tools {
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
}
.sys-title {
  font-size: 22px;
  font-weight: bold;
  color: #000;
}
.btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(240, 246, 254);
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  span {
    margin-top: 4px;
    font-size: 12px;
  }
}
.editor-container {
  flex: 1;
  width: 100%;
}
.right-content {
  height: 100%;
  width: 300px;
  transition: width 0.3s ease;
  border-right: 1px solid #e8e8e8;
  position: relative;
}

.list-collapsed {
  width: 0px;
}
.content-item {
  margin: 10px 12px;
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .limit-title {
    font-size: 16px;
    font-weight: bold;
  }
  .code {
    font-size: 12px;
    color: #999;
  }
}
.detail-content {
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px;
  .customer-info {
    margin-left: 8px;
  }
  .card-box {
    align-items: center;
    padding-bottom: 4px;
    margin-bottom: 4px;
    border-bottom: 1px solid #ccc;
  }
}
.customer-data-info {
  align-items: center;

  .d-info {
    text-align: center;
    font-size: 12px;
    color: #797e87;
    padding: 8px 0;
    &:first-of-type {
      background-color: #f1f6fe;
      .num {
        font-size: 14px;
        color: #4a7ce2;
        font-weight: bold;
      }
    }
    &:nth-of-type(2) {
      background-color: #f2fdf5;
      .num {
        font-size: 14px;
        color: #62ba6f;
        font-weight: bold;
      }
    }
    &:last-of-type {
      background-color: #faf5fe;
      .num {
        font-size: 14px;
        color: #9c59ee;
        font-weight: bold;
      }
    }
  }
}
.table-show {
  margin: 10px 0;
  background-color: #f9f5fe;
  border: 1px solid #e6d6fc;
  border-radius: 5px;
  padding: 8px;

  &:first-of-type {
    margin-top: 0;
  }
  &:last-of-type {
    margin-bottom: 0;
  }
  .table-name {
    font-size: 14px;
    font-weight: bold;
    color: #000;
  }
  .time {
    color: #717682;
    font-size: 12px;
  }
}
.finished-content {
  background-color: #f2fdf5;
  border: 1px solid #c7f5d3;
}
.update-btn {
  border-radius: 5px;
  font-size: 12px;
  background-color: #4781ea;
  letter-spacing: 0;
  word-spacing: 0;
}
</style>