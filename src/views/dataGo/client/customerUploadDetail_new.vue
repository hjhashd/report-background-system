<!--
 * @Author: bekon
 * @Date: 2025-02-21 16:45:11
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-23 16:32:21
 * @FilePath: /report-background-system/src/views/dataGo/client/customerUploadDetail_new.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="!customerUploadList">
    <div class="item-content">
      <div class="class-name">
        <div class="icon-btn flex" @click="toDealFun('redo')">
          <img style="width: 18px; height: 20px" src="@/assets/images/dun.jpg" alt="dark" />
          批量授权
        </div>
        <div class="icon-btn flex" @click="mutilUploads">
          <img style="width: 18px; height: 20px; margin-left: 15px" src="@/assets/images/mutil-upload.png" alt="dark" />
          批量上传
        </div>
        <div class="icon-btn flex" @click="mutilDownLoadModalPop = true">
          <img
            style="width: 18px; height: 20px; margin-left: 15px"
            src="@/assets/images/download-modal.png"
            alt="dark"
          />
          下载模板
        </div>
        <div class="icon-btn flex" @click="appDownloadPop = true">
          <img
            style="width: 100px; height: 20px; margin-left: 15px"
            src="@/assets/images/download-app-data.png"
            alt="dark"
          />
        </div>
      </div>
      <a-table
        class="tab-table"
        :columns="newColumns"
        :data-source="customerUploadList"
        :pagination="false"
        size="small"
      >
        <div slot="operateTime" slot-scope="i">{{ i ? i.split(' ')[0] : '' }}</div>
        <div slot="status" slot-scope="i, scoped">
          <div v-if="scoped.type === 'crawl'" :class="'type' + i">
            {{ i ? '已采集' : '未授权' }}
          </div>
          <div v-else-if="scoped.type === 'upload'" :class="'type' + i">
            {{ i ? '已上传' : '待上传' }}
          </div>
        </div>
        <div slot="tool" slot-scope="text, scope">
          <div class="flex">
            <a-upload
              v-if="scope.type === 'upload'"
              :name="scope.tableName"
              :customRequest="uploadFile"
              :showUploadList="false"
            >
              <a-tooltip style="margin-right: 10px">
                <template slot="title">
                  <span v-if="scope.status == 1">重新上传</span>
                  <span v-else>上传</span>
                </template>
                <a-button @click="uploadItem(scope)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                  <img
                    v-if="scope.status == 1"
                    style="width: 27px; height: 22px"
                    src="@/assets/images/re-upload.png"
                    alt="dark"
                  />
                  <img v-else style="width: 27px; height: 22px" src="@/assets/images/upload.png" alt="dark" />
                </a-button>
              </a-tooltip>
            </a-upload>
            <a-tooltip v-else-if="scope.type === 'crawl'" style="margin-right: 10px">
              <template slot="title">
                <span>采集</span>
              </template>
              <a-button @click="toDealFun('redo')" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                <img style="width: 25px; height: 22px" src="@/assets/images/caiji.png" alt="dark" />
              </a-button>
            </a-tooltip>
            <a-tooltip style="margin-right: 10px">
              <template slot="title">
                <span>下载模板</span>
              </template>
              <a-button @click="downloadModal(scope)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                <img style="width: 20px; height: 22px" src="@/assets/images/download-modal.png" alt="dark" />
              </a-button>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>查看</span>
              </template>
              <a-button @click="toSeeTable(scope)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                <img style="width: 28px; height: 14px" src="@/assets/images/see.png" alt="dark" />
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </a-table>
    </div>

    <!-- 查看数据 -->
    <a-modal v-model="dataSeeStatus" width="80vw" :title="'<<' + chooseTableName + '>>数据查看'" :footer="null">
      <data-go-table :seeQuery="seeQuery"></data-go-table>
    </a-modal>
    <!-- 批量上传 -->
    <a-modal :dialogStyle="{ top: '5vh' }" v-model="mutilUploading" width="85vw" title="批量上传" :footer="null">
      <mutil-upload
        :customerInfo="customerInfo"
        :customerUploadList="uploadMutilData"
        @cancelPop="mutilUploading = false"
      ></mutil-upload>
    </a-modal>
    <!-- 批量下载模板 -->
    <a-modal
      :dialogStyle="{ top: '5vh' }"
      v-model="mutilDownLoadModalPop"
      width="50vw"
      title="批量下载模板"
      :footer="null"
    >
      <mutil-download-modal
        :customerInfo="customerInfo"
        :customerUploadList="uploadMutilData"
        @cancelPop="mutilDownLoadModalPop = false"
      ></mutil-download-modal>
    </a-modal>
    <!-- app数据下载 -->
    <a-modal :dialogStyle="{ top: '5vh' }" v-model="appDownloadPop" width="50vw" title="app上传数据下载" :footer="null">
      <app-data-download
        :customerInfo="customerInfo"
        @cancelPop="appDownloadPop = false"
      ></app-data-download>
    </a-modal>
  </a-spin>
</template>

<script>
import MutilUpload from '../client/mutilUpload.vue'
import MutilDownloadModal from '../client/mutilDownloadModal.vue'
import AppDataDownload from '../client/appDataDownload.vue'
import { DataGoTable } from '@/components'
import { uploadFile } from '@/api/report'
import { graftFun, newColumns, classifyDataByClassName } from './util'
import { mapActions } from 'vuex'
export default {
  name: 'CustomerUploadDetailNew',
  components: { DataGoTable, MutilUpload, MutilDownloadModal, AppDataDownload },
  props: {
    customerInfo: {
      type: Object,
      required: true,
    },
    customerUploadList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      graftFun,
      newColumns,
      clickItem: null,
      uploading: false,
      mutilUploading: false,
      mutilDownLoadModalPop: false,
      appDownloadPop: false,
      dataSeeStatus: false,
      disabledList: [],
      uploadMutilData: [],
      seeQuery: {},
      chooseTableName: null,
    }
  },
  mounted() {
    this.uploadMutilData = classifyDataByClassName(this.customerUploadList)
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    mutilUploads() {
      // 批量上传
      this.mutilUploading = true
    },
    toSeeTable(item) {
      this.seeQuery = {
        id: item.id,
        tableName: item.tableName,
        creditCode: this.customerInfo.creditCode,
        pageNum: 1,
        pageSize: 10,
      }
      this.chooseTableName = item.tableNameZh
      this.dataSeeStatus = true
    },
    toDealFun(icon) {
      switch (icon) {
        case 'redo':
          // 重新采集
          this.changeBuildQrCodePop(true)
          break
        case 'upload':
          // 上传文件
          break
        case 'file-pdf':
          // 识别文件
          this.$router.push({ path: '/readWordPage/index' })
          break
      }
    },
    downloadModal(v) {
      const url = v.templateUrl
      const filename = `${v.tableNameZh}模板`
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        if (xhr.status === 200) {
          const blob = xhr.response
          const urlObject = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = urlObject
          a.download = filename
          a.click()
          URL.revokeObjectURL(urlObject)
        }
      }
      xhr.send()
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
      this.disabledList.push(item.tableName)
      uploadFile(formData, this.customerInfo.appUserId).then((res) => {
        this.uploading = false
        this.disabledList = this.disabledList.filter((item) => item != item.tableName)
        if (res.code && res.code == 200) {
          $notification['success']({
            message: '上传通知：',
            description: `上传文件成功：${file.name}`,
            duration: 6,
          })
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
      this.clickItem = v
    },
  },
}
</script>

<style lang="less" scoped>
.class-name {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
  .icon-btn {
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #6cbdf6;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 500;
    cursor: pointer;
  }
}
.detail-files {
  margin: 20px 0;
}
.row-box {
  /deep/ .ant-col {
    font-family: PingFangSC-Semibold;
    font-size: 16px;
    letter-spacing: 0;
    font-weight: 600;
  }
}
.type1 {
  color: green;
}
.type0 {
  color: grey;
}
.item-content {
  padding: 12px;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 8px;
}
.dotted {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin: 0 5px;
}
.const-show {
  align-items: center;
}
/* 去除表格行的鼠标悬停高亮效果 */
.tab-table {
  /deep/ .ant-table-tbody > tr:hover > td {
    background: inherit !important;
  }
  /deep/ .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
}
</style>