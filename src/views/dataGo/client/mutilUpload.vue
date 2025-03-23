<!--
 * @Author: bekon
 * @Date: 2025-02-21 16:45:11
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-23 16:22:53
 * @FilePath: /report-background-system/src/views/dataGo/client/mutilUpload.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="uploading">
    <div class="mutil-box">
      <a-checkbox-group v-model="checklist" style="width: 100%" @change="onChange">
        <div v-for="item in showCustomerList" :key="item.name" class="item-content">
          <div class="class-name">{{ item.name }}</div>
          <a-row v-for="sonI in item.data" :key="sonI.id">
            <a-col :span="8">
              <a-checkbox :value="sonI.id"
                ><span class="table-name-zh">{{ sonI.tableNameZh }}</span></a-checkbox
              >
            </a-col>
            <a-col :span="12">
              <div class="flex upload-name" v-if="sonI.fileObj">已上传文件名称：{{ sonI.fileObj.name }}</div>
            </a-col>
            <a-col :span="4">
              <div class="flex">
                <a-tooltip style="margin-right: 10px">
                  <template slot="title">
                    <span>上传文件</span>
                  </template>
                  <a-upload :name="sonI.tableName" :customRequest="uploadFile" :showUploadList="false">
                    <a-button
                      @click="uploadItem(item.name, sonI)"
                      :style="{ color: '#7fbbf1', border: 'none', padding: 0 }"
                    >
                      <img style="width: 27px; height: 22px" src="@/assets/images/upload.png" alt="dark" />
                    </a-button>
                  </a-upload>
                </a-tooltip>
                <a-tooltip style="margin-right: 10px">
                  <template slot="title">
                    <span>下载模板</span>
                  </template>
                  <a-button @click="downloadModal(sonI)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                    <img style="width: 20px; height: 22px" src="@/assets/images/download-modal.png" alt="dark" />
                  </a-button>
                </a-tooltip>
                <a-tooltip style="margin-right: 10px" v-if="sonI.fileObj">
                  <template slot="title">
                    <span>删除已上传文件</span>
                  </template>
                  <a-popconfirm
                    title="是否确定删除已上传文件?"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="deleteUploadFile(item.name, sonI)"
                  >
                    <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                      <img style="width: 20px; height: 22px" src="@/assets/images/delete.png" alt="dark" />
                    </a-button>
                  </a-popconfirm>
                </a-tooltip>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-checkbox-group>
    </div>
    <div class="flex-row-spacebetween extra-line">
      <a-checkbox @change="allCheck" :indeterminate="indeterminate" :checked="checkAll" class="table-name-zh">
        全选
      </a-checkbox>
      <span class="tuozhan">支持扩展名：.xlsx</span>
    </div>
    <div class="flex">
      <a-button :disabled="!checklist.length" class="flex-1 upload-btn" @click="mutilUpload"> 确认上传 </a-button>
      <a-button class="flex-1 upload-btn" @click="cancelPop"> 取消 </a-button>
    </div>
  </a-spin>
</template>

<script>
import { uploadFile } from '@/api/report'
import { graftFun, coopFun, columns } from './util'
import { mapActions } from 'vuex'
export default {
  name: 'CustomerUploadDetail',
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
      coopFun,
      columns,
      clickItem: null,
      uploading: false,
      disabledList: [],
      checklist: [],
      plaintOptions: [],
      indeterminate: true,
      checkAll: false,
      showCustomerList: [],
    }
  },
  mounted() {
    this.showCustomerList = this.customerUploadList
    let options = []
    this.showCustomerList.forEach((v) => {
      v.data.forEach((sv) => {
        options.push(sv.id)
      })
    })
    this.plaintOptions = options
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
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
    mutilUpload() {
      const { $notification } = this
      try {
        // 整理上传参数
        this.uploading = true
        const formData = new FormData()
        this.showCustomerList.forEach((v) => {
          v.data.forEach((sv) => {
            if (this.checklist.includes(sv.id)) {
              formData.append(sv.tableName, sv.fileObj)
            }
          })
        })
        // 开始批量上传
        uploadFile(formData, this.customerInfo.appUserId).then((res) => {
          this.uploading = false
          if (res.code && res.code == 200) {
            $notification['success']({
              message: '上传通知：',
              description: `上传文件成功：${file.name}`,
              duration: 6,
            })
          } else {
            $notification['error']({
              message: '上传错误：',
              description: `${res.msg}`,
              duration: 6,
            })
          }
        })
      } catch (error) {
        $notification['error']({
          message: '上传错误：',
          description: `${error}`,
          duration: 6,
        })
      }
    },
    cancelPop() {
      this.$emit('cancelPop')
    },
    deleteUploadFile(name, deleteItem) {
      this.showCustomerList = this.showCustomerList.map((pv) => {
        const pvObj = pv
        if (pv.name == name) {
          pvObj.data = pv.data.map((v) => {
            if (v.id == deleteItem.id) {
              delete v.fileObj
            }
            return v
          })
        }
        return pvObj
      })
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
    uploadFile(options) {
      const { file, onSuccess, onError } = options
      this.showCustomerList = this.showCustomerList.map((pv) => {
        const pvObj = pv
        if (pv.name == this.parentsItem) {
          pvObj.data = pv.data.map((v) => {
            if (v.id == this.clickItem.id) {
              return Object.assign(v, { fileObj: file })
            } else {
              return v
            }
          })
        }
        return pvObj
      })
    },
    uploadItem(pv, v) {
      this.parentsItem = pv
      this.clickItem = v
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
</style>