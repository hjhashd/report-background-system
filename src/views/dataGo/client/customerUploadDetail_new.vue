<!--
 * @Author: bekon
 * @Date: 2025-04-27 11:52:54
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-29 20:07:43
 * @FilePath: /report-background-system/src/views/dataGo/client/customerUploadDetail_new.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="!customerUploadList">
    <div class="item-content">
      <div class="class-name">
        <div class="icon-btn flex" @click="toDealFun('redo')">
          <img style="width: 18px; height: 20px; margin-right: 3px" src="@/assets/images/dun.jpg" alt="dark" />批量授权
        </div>
        <!-- <div class="icon-btn flex" @click="mutilUploads">
          <img style="width: 18px; height: 20px; margin-right: 3px" src="@/assets/images/mutil-upload.png" alt="dark" />
          批量上传
        </div> -->
        <div class="icon-btn flex" @click="mutilDownLoadModalPop = true">
          <img
            style="width: 18px; height: 20px; margin-right: 3px"
            src="@/assets/images/download-modal.png"
            alt="dark"
          />下载模板
        </div>
        <div class="icon-btn flex" @click="openAppPop">
          <img style="width: 18px; height: 20px; margin-right: 3px" src="@/assets/images/app.png" alt="dark" />数据下载
        </div>
      </div>
      <a-table
        class="tab-table"
        :columns="newColumns"
        :data-source="customerUploadList"
        :pagination="false"
        size="small"
      >
        <div slot="id" slot-scope="i, scoped, index">{{ index + 1 }}</div>
        <div slot="operateTime" slot-scope="i">{{ i ? i.split(' ')[0] : '' }}</div>
        <div slot="status" slot-scope="i, scoped">
          <div v-if="scoped.dataType === 'crwal'" :class="'type' + i">
            {{ i ? '已采集' : '未采集' }}
          </div>
          <div v-else-if="scoped.dataType === 'upload'" :class="'type' + i">
            {{ i ? '已上传' : '待上传' }}
          </div>
          <div v-else-if="scoped.dataType === 'other'" :class="'type' + i">
            {{ i ? '已授权' : '未授权' }}
          </div>
        </div>
        <div slot="tool" slot-scope="text, scope">
          <div class="flex">
            <a-tooltip v-if="scope.status === 1 && scope.dataType == 'crwal'">
              <template slot="title">
                <span>查看编辑</span>
              </template>
              <a-button
                @click="toSeeChangeTable(scope)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img style="width: 28px; height: 28px" src="@/assets/images/see.png" alt="dark" /><span>查看编辑</span>
              </a-button>
            </a-tooltip>
            <a-tooltip v-else-if="scope.status === 1">
              <template slot="title">
                <span>查看</span>
              </template>
              <a-button
                @click="toSeeTable(scope)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img style="width: 28px; height: 28px" src="@/assets/images/see.png" alt="dark" /><span>查看</span>
              </a-button>
            </a-tooltip>
            <a-tooltip v-if="scope.dataType === 'upload'" style="margin-right: 10px">
              <template slot="title">
                <span v-if="scope.status == 1">重新上传</span>
                <span v-else>上传</span>
              </template>
              <a-button
                @click="uploadItem(scope)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img
                  v-if="scope.status == 1"
                  style="width: 27px; height: 22px"
                  src="@/assets/images/re-upload.png"
                  alt="dark"
                />
                <img v-else style="width: 27px; height: 22px" src="@/assets/images/upload.png" alt="dark" />
                <span v-if="scope.status == 1">重新上传</span>
                <span v-else>上传</span>
              </a-button>
            </a-tooltip>
            <a-tooltip v-else-if="scope.dataType !== 'upload' && scope.status == 0" style="margin-right: 10px">
              <template slot="title">
                <span>授权</span>
              </template>
              <a-button
                @click="toDealFun('redo')"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img
                  style="width: 25px; height: 22px; margin-right: 5px"
                  src="@/assets/images/caiji.png"
                  alt="dark"
                /><span>授权</span>
              </a-button>
            </a-tooltip>
            <a-tooltip v-if="scope.dataType === 'upload'" style="margin-right: 10px">
              <template slot="title">
                <span>下载模板</span>
              </template>
              <a-button
                @click="downloadModal(scope)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img style="width: 20px; height: 22px" src="@/assets/images/download-modal.png" alt="dark" /><span
                  >下载模板</span
                >
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </a-table>
    </div>

    <!-- 重新上传 -->
    <a-modal v-model="uploadStatus" width="80vw" :title="'更新' + clickItem?.tableNameZh" :footer="null">
      <upload-file-tab
        ref="uploadPop"
        :customerInfo="customerInfo"
        :clickItem="clickItem"
        @closePop="uploadStatus = false"
        @update="updateData"
      ></upload-file-tab>
    </a-modal>
    <!-- 查看数据 -->
    <a-modal v-model="dataSeeStatus" width="80vw" :title="'<<' + chooseTableName + '>>数据查看'" :footer="null">
      <data-go-table :seeQuery="seeQuery"></data-go-table>
    </a-modal>
    <!-- 查看编辑 -->
    <a-modal v-model="changeItemStatus" width="80vw" :footer="null">
      <template slot="title">
        <div class="change-title">{{ changeItem?.tableNameZh }} <span class="mini-title">数据查看与编辑</span></div>
      </template>
      <scan-edit
        ref="scanEdit"
        :showPop="changeItemStatus"
        :customerInfo="customerInfo"
        :changeItem="changeItem"
        :seeQuery="seeQuery"
        @closePop="changeItemStatus = false"
      ></scan-edit>
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
        ref="appD"
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
import { DataGoTable, UploadFileTab, ScanEdit } from '@/components'
import { graftFun, newColumns, classifyDataByClassName } from './util'
import { mapActions } from 'vuex'
export default {
  name: 'CustomerUploadDetailNew',
  components: { DataGoTable, MutilUpload, MutilDownloadModal, AppDataDownload, UploadFileTab, ScanEdit },
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
      appFirstLoad: true,
      appDownloadPop: false,
      dataSeeStatus: false,
      uploadStatus: false,
      uploadMutilData: [],
      seeQuery: {},
      chooseTableName: null,
      changeItem: null,
      changeItemStatus: false,
    }
  },
  mounted() {
    this.uploadMutilData = classifyDataByClassName(this.customerUploadList)
  },
  watch: {
    uploadStatus: {
      handler(v) {
        if (!v) {
          this.$refs.uploadPop.resetData()
        }
      },
    },
    changeItemStatus: {
      handler(v) {
        if (!v) {
          this.$refs.scanEdit.hasUploadFile = false
        }
      },
    },
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    mutilUploads() {
      // 批量上传
      this.mutilUploading = true
    },
    openAppPop() {
      this.appDownloadPop = true
      if (!this.appFirstLoad) {
        this.$refs.appD.initData()
      }
      this.appFirstLoad = false
    },
    toSeeChangeTable(item) {
      this.seeQuery = {
        id: item.id,
        tableName: item.tableName,
        creditCode: this.customerInfo.creditCode,
        pageNum: 1,
        pageSize: 10,
      }
      this.changeItemStatus = true
      this.changeItem = item
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
    uploadItem(v) {
      this.clickItem = v
      this.uploadStatus = true
    },
    updateData() {
      this.$emit('updateData')
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
    margin-right: 22px;
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
  border-radius: 0 0 8px 8px;
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
.app-icon {
  padding: 4px;
  border-radius: 2px;
  background-color: #86c8f5;
  color: #fff;
  font-size: 12px;
  margin-left: 15px;
  margin-right: 2px;
  line-height: 1;
}
.change-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  .mini-title {
    font-weight: normal;
    font-size: 14px;
    color: #6c727f;
  }
}
</style>