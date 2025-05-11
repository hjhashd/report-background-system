<template>
  <div class="change-content">
    <a-spin :spinning="loadingb">
      <div class="upload-box flex">
        <div class="lock-border">
          <a-icon type="lock" />
        </div>
        <div class="flex-1">
          <div class="p-1">数据编辑需要先上传证明材料</div>
          <div class="p-1 p-2">为确保数据的真实性和可靠性，编辑自动采集的数据需要先上传相关证明材料。</div>
          <div class="flex-row-spacebetween p-1 p-2">
            <span>支持的文件格式：PDF、Word文档、JPG/PNG图片（最大100MB）</span>
            <a-button
              :class="{ inouticon: !collapseCard }"
              type="link"
              icon="up"
              style="color: #3149ad"
              @click="collapseCard = !collapseCard"
            />
          </div>
          <div :class="{ closeCard: !collapseCard }">
            <a-upload
              :name="clickItem?.dataItem || ''"
              :customRequest="uploadFile"
              :showUploadList="false"
              :multiple="true"
              accept=".doc,.docx,image/*,.pdf,.xlsx,.xls"
            >
              <div class="table-upload-btn">
                <img
                  style="width: 38px; height: 36px; margin-bottom: 10px"
                  src="@/assets/images/upload-file.png"
                  alt="dark"
                />
                <div class="upload-txt-1">点击选择证明材料</div>
                <div class="upload-txt-2">或拖放文件到此处</div>
              </div>
            </a-upload>
            <div class="flex uploaded-show" :class="{ closeCard: !collapseCard }" v-if="fileList.length">
              <div class="flex-1">
                <div class="uploaded-file" v-for="(i, index) in fileList" :key="index">
                  <div class="ppp">
                    <a-icon type="file-text" style="color: #3b82f6; font-size: 18px" /><span>{{
                      i.name || i.fileName
                    }}</span>
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
              <a-button type="primary" icon="upload" :style="{ border: 'none' }" @click="confirmUpload">
                确定上传
              </a-button>
            </div>
            <div v-if="hasUploadFile">
              <div class="show-sue">
                <a-icon
                  type="check-circle"
                  style="color: #5c9463; font-size: 18px; margin-right: 10px"
                />证明材料已上传，现在您可以编辑数据了
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <div class="show-sue" style="margin: 0 0 10px" v-if="hasUploadFile">
      <a-icon
        type="info-circle"
        style="color: #5c9463; font-size: 18px; margin-right: 10px"
      />证明材料已上传，现在您可以编辑数据了
    </div>
    <data-go-table ref="aaa" :customerInfo="customerInfo" :seeQuery="seeQuery" :canEdit="hasUploadFile"></data-go-table>
    <div class="flex footer-btn">
      <a-button class="pop-btn black-style" @click="closePop"> 确定 </a-button>
    </div>
  </div>
</template>

<script>
import { DataGoTable } from '@/components'
import { getProofFile, uploadProof, deleteProofFile } from '@/api/report'
export default {
  name: 'ScanEdit',
  components: { DataGoTable },
  props: {
    showPop: {
      type: Boolean,
      default: false,
    },
    customerInfo: {
      type: Object,
      default: null,
    },
    changeItem: {
      type: Object,
      default: null,
    },
    seeQuery: {
      type: Object,
      default: null,
    },
  },
  watch: {
    showPop: {
      handler(v) {
        if (v) {
          getProofFile({
            appUserId: this.customerInfo.appUserId,
            tableId: this.changeItem.id,
          }).then((res) => {
            if (res.data.length) this.hasUploadFile = true
            this.fileList = res.data
          })
        }
      },
    },
  },
  created() {
    getProofFile({
      appUserId: this.customerInfo.appUserId,
      tableId: this.changeItem.id,
    }).then((res) => {
      if (res.data.length) this.hasUploadFile = true
      this.fileList = res.data
    })
  },
  data() {
    return {
      loadingb: false,
      clickItem: null,
      hasUploadFile: false,
      collapseCard: false,
      fileList: [],
      uploadedList: [],
      showFileList: [],
    }
  },
  methods: {
    uploadFile(options) {
      const { $notification } = this
      const { file, filename, onSuccess, onError } = options
      if (file) {
        const maxSize = 100 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          $notification['warning']({
            message: '消息提示：',
            description: `您上传的文件${filename}大小超过了100M`,
            duration: 8,
          })
        } else {
          this.fileList.push(file)
        }
      }
    },
    closePop() {
      this.$emit('closePop')
    },
    deleteUploadFile(i) {
      this.fileList = this.fileList.filter((v) => (i.uid ? v.uid !== i.uid : i.id !== v.id))
      if (!this.fileList.length || !this.fileList.filter((b) => !!b.id).length) {
        this.$refs.aaa.getViewTable()
        this.hasUploadFile = false
      }
      if (!i.uid) {
        this.loadingb = true
        deleteProofFile(i.id).then((res) => {
          this.loadingb = false
        })
      }
    },
    confirmUpload() {
      const { $notification } = this
      const formData = new FormData()
      formData.append('tableId', this.changeItem.id)
      formData.append('appUserId', this.customerInfo.appUserId)
      let hasNewFile = false
      this.fileList.forEach((fileItem) => {
        if (fileItem.uid) {
          formData.append('file', fileItem)
          hasNewFile = true
        }
      })
      if (!hasNewFile) {
        $notification['warning']({
          message: '消息提示：',
          description: `没有获取到新上传文件`,
          duration: 8,
        })
      }
      this.loadingb = true
      uploadProof(formData).then((res) => {
        this.loadingb = false
        this.hasUploadFile = true
      })
    },
  },
}
</script>

<style lang="less" scoped>
/deep/.ant-upload.ant-upload-select {
  display: block;
}
.upload-box {
  margin-bottom: 10px;
  padding: 20px;
  border: 1px solid #dee9fc;
  border-radius: 10px;
  background-color: #f0f6fe;
  .lock-border {
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 36px;
    font-size: 18px;
    color: #3662e3;
    padding: 10px;
    border-radius: 50%;
    background-color: #dee9fc;
  }
}
.p-1 {
  font-size: 14px;
  color: #3149ad;
  font-weight: bold;
  padding-bottom: 10px;
}
.p-2 {
  font-weight: normal;
  padding-bottom: 5px;
}
.table-upload-btn {
  margin-top: 10px;
  width: 100%;
  display: block;
  border: 2px dashed #c4dafb;
  border-radius: 10px;
  background-color: #f0f6fe;
  padding: 25px;
  text-align: center;
  .choose-file {
    border-radius: 10px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
  .upload-txt-1 {
    font-size: 16px;
    font-weight: bold;
    color: #2a4dd0;
  }
  .upload-txt-2 {
    font-size: 12px;
    color: #2a4dd0;
  }
}
.footer-btn {
  margin-top: 20px;
  width: 100%;
  justify-content: flex-end;
  .black-style {
    margin-left: 20px;
    background-color: #f1f6fd;
    color: #5b71d4;
    border: 1px solid #e0e9fa;
  }
}
.uploaded-show {
  align-items: flex-end;
}
.uploaded-file {
  margin-right: 20px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
}
.show-sue {
  margin-top: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  background-color: #f2fdf5;
}
.inouticon {
  transform: rotate(-180deg);
  transition: 0.5s ease-in-out;
}
.closeCard {
  overflow: hidden;
  height: 0;
  transition: 0.5s ease-in-out;
}
</style>