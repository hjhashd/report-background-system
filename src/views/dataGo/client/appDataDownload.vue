<!--
 * @Author: bekon
 * @Date: 2025-02-21 16:45:11
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-23 16:52:12
 * @FilePath: /report-background-system/src/views/dataGo/client/appDataDownload.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="uploading">
    <div class="mutil-box">
      <a-checkbox-group v-model="checklist" style="width: 100%" @change="onChange">
        <div v-for="item in showAppList" :key="item.name" class="item-content">
          <div v-if="item.data && item.data.length">
            <div class="class-name">{{ item.name }}</div>
            <a-row v-for="sonI in item.data" :key="sonI.id">
              <a-col :span="24">
                <a-checkbox :value="sonI.id" class="flex checkbox-line">
                  <div class="modal-name">{{ sonI.fileName }}</div>
                </a-checkbox>
              </a-col>
            </a-row>
          </div>
        </div>
      </a-checkbox-group>
    </div>
    <div class="flex-row-spacebetween extra-line">
      <a-checkbox @change="allCheck" :indeterminate="indeterminate" :checked="checkAll" class="table-name-zh">
        全选
      </a-checkbox>
    </div>
    <div class="flex">
      <a-button :disabled="!checklist.length" class="flex-1 upload-btn" @click="mutilDownload"> 下载数据 </a-button>
      <a-button class="flex-1 upload-btn" @click="cancelPop"> 取消 </a-button>
    </div>
  </a-spin>
</template>

<script>
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { mapActions, mapState } from 'vuex'
import { appUploadFile } from '@/api/report'
export default {
  name: 'mutilDownloadModal',
  props: {
    customerInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      clickItem: null,
      uploading: false,
      disabledList: [],
      checklist: [],
      plaintOptions: [],
      indeterminate: true,
      checkAll: false,
      showCustomerList: [],
      showAppList: [],
    }
  },
  computed: {
    ...mapState({ userInfo: (state) => state.user.info }),
  },
  mounted() {
    this.initData()
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    initData() {
      const { $notification } = this
      appUploadFile({
        appUserId: this.customerInfo.appUserId,
        agentUserId: this.userInfo.userId,
      })
        .then((result) => {
          if (result.code == 200) {
            if (result.data.reportDataAccreditFile && result.data.reportDataAccreditFile.length) {
              const type1 = {
                name: '利润表数据',
                data: result.data.reportDataAccreditFile.filter((v) => v.fileType == 1),
              }
              const type2 = {
                name: '负债表数据',
                data: result.data.reportDataAccreditFile.filter((v) => v.fileType == 2),
              }
              const type3 = {
                name: '现金流量数据',
                data: result.data.reportDataAccreditFile.filter((v) => v.fileType == 3),
              }
              const otherlist = result.data.reportDataAccreditFile.filter((v) => ![1, 2, 3].includes(v.fileType))
              const type4 = {
                name: '其他数据',
                data: otherlist,
              }
              this.showAppList = [type1, type2, type3, type4]
              let options = []
              this.showAppList.forEach((v) => {
                v.data.forEach((sv) => {
                  options.push(sv.id)
                })
              })
              this.plaintOptions = options
            }
          } else {
            $notification['error']({
              message: '错误：',
              description: `${result.msg}`,
              duration: 6,
            })
          }
        })
        .catch((err) => {
          $notification['error']({
            message: '错误：',
            description: `${err}`,
            duration: 6,
          })
        })
    },
    onChange(v) {
      this.checklist = v
      this.indeterminate = !!v.length && v.length < this.plaintOptions.length
      this.checkAll = v.length === this.plaintOptions.length
    },
    allCheck(e) {
      Object.assign(this, {
        checklist: e.target.checked ? this.plaintOptions : [],
        indeterminate: false,
        checkAll: e.target.checked,
      })
    },
    cancelPop() {
      this.$emit('cancelPop')
    },
    async mutilDownload() {
      const { $notification } = this
      // 整理要下载的链接
      let fileUrls = []
      this.showAppList.forEach((v) => {
        v.data.forEach((sv) => {
          if (this.checklist.includes(sv.id)) {
            fileUrls.push(sv.fileUrl)
          }
        })
      })

      const zip = new JSZip()
      const promises = fileUrls.map(async (url) => {
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          // 获取文件名
          const fileName = url.split('/').pop()
          zip.file(fileName, blob)
        } catch (error) {
          console.error(`下载文件 ${url} 时出错:`, error)
        }
      })

      try {
        await Promise.all(promises)
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, 'downloaded_files.zip')
      } catch (error) {
        $notification['error']({
          message: '上传错误：',
          description: `创建 ZIP 文件时出错:${error}`,
          duration: 6,
        })
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
  },
}
</script>

<style lang="less" scoped>
.class-name {
  font-family: PingFangSC-Semibold;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px dotted #1b69ff;
  font-size: 24px;
  color: #6cbdf6;
  font-weight: 600;
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
.mutil-box {
  max-height: 60vh;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
.item-content {
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
}
.table-name-zh {
  margin-top: -3px;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #3d4566;
  letter-spacing: 0;
  line-height: 25px;
  font-weight: 400;
}
.upload-btn {
  margin: 20px;
  background-color: #6cbdf6;
  color: #fff;
  border: none;
  padding: 0;
  border-radius: 20px;
}
.modal-name {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #3d4566;
  letter-spacing: 0;
  line-height: 25px;
  font-weight: 400;
  margin-left: 24px;
  margin-top: -10px;
}
.upload-name {
  align-items: center;
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: #3d4566;
  letter-spacing: 0;
  font-weight: 400;
}
.extra-line {
  margin-top: 20px;
  .tuozhan {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.38);
    letter-spacing: 0;
    font-weight: 400;
  }
}
.checkbox-line {
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
}
</style>