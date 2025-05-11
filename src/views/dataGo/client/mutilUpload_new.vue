<template>
  <a-spin :spinning="tableUploadPop">
    <a-upload
      :customRequest="uploadFile"
      :showUploadList="false"
      :multiple="true"
      accept=".doc,.docx,image/*,.pdf,.xlsx,.xls"
    >
      <div class="table-upload-btn">
        <a-icon type="upload" style="color: #9ca3af; font-size: 22px" />
        <div style="padding: 15px">拖拽文件到此处或点击上传</div>
        <div style="padding: 15px">支持.doc,.docx,image/*,.pdf,.xlsx,.xls</div>
        <a-button class="choose-file">选择文件</a-button>
      </div>
    </a-upload>
    <div class="upload-list-show" v-if="fileList.length">
      <div class="name-title">已上传文件列表：</div>
      <div v-for="(i, index) in fileList" :key="index">
        <span>{{ i.name }}</span
        ><a-popconfirm title="是否确定删除已上传文件?" ok-text="确定" cancel-text="取消" @confirm="deleteUploadFile(i)">
          <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
            <img style="width: 16px; height: 18px" src="@/assets/images/delete.png" alt="dark" />
          </a-button>
        </a-popconfirm>
      </div>
    </div>
    <div class="footer">
      <a-button class="pop-btn" @click="cancelPop"> 取消 </a-button>
      <a-button
        style="margin-left: 20px; background-color: #528bfb; color: #fff"
        class="pop-btn"
        @click="dUploadFileFun"
      >
        确定上传
      </a-button>
    </div>
  </a-spin>
</template>

<script>
import { uploadTableUpload } from '@/api/report'
export default {
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
      fileList: [],
      tableUploadPop: false,
    }
  },
  methods: {
    uploadFile(options) {
      const { file, filename, onSuccess, onError } = options
      this.fileList.push(file)
    },
    deleteUploadFile(i) {
      this.fileList = this.fileList.filter((v) => v.uid !== i.uid)
    },
    cancelPop() {
      this.fileList = []
      this.$emit('cancelPop')
    },
    dUploadFileFun() {
      const { $notification } = this
      const formData = new FormData()
      formData.append('appUserId', this.customerInfo.appUserId)
      if (!this.fileList.length) {
        $notification['info']({
          message: '消息提示：',
          description: `未获取到有上传文件`,
          duration: 6,
        })
        return
      }
      this.fileList.forEach((fileItem) => {
        formData.append('file', fileItem)
      })
      this.tableUploadPop = true
      uploadTableUpload(formData).then((res) => {
        this.tableUploadPop = false
        if (res.code && res.code == 200) {
          $notification['success']({
            message: '上传通知：',
            description: `上传文件成功`,
            duration: 6,
          })
          this.fileList = []
          this.$emit('cancelPop')
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
/deep/.ant-upload.ant-upload-select {
  display: block;
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
.footer {
  margin-top: 20px;
  text-align: right;
}
</style>