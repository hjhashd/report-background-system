<template>
  <div class="edit-modal-body">
    <div class="drawer-container">
      <div class="select-item">
        选择模块<a-select v-model="currentModalSelect" style="width: 250px; margin-left: 20px" @change="changModalShow">
          <a-select-option v-for="(i, index) in modalList" :key="index" :value="i">
            {{ i }}
          </a-select-option>
        </a-select>
      </div>
    </div>
    <div class="report-container">
      <a-row class="grid-box">
        <a-col :span="9">
          <div class="flex-row-spacebetween cant-edit-box">
            <span class="red-dot status-tag">原报告内容</span>
            <span>不可编辑</span>
          </div>
        </a-col>
        <a-col :span="9">
          <span class="status-tag green-tag">修改编辑</span>
        </a-col>
        <a-col :span="6" class="flex flex-end">
          <a-button
            style="color: #fff; background-color: #4e80ee"
            size="small"
            icon="check"
            type="primary"
            :loading="applyLoading"
            @click="applyChanges"
            >应用</a-button
          >
          <a-button
            :loading="saveLoading"
            style="color: #fff; background-color: #5ec269"
            size="small"
            icon="save"
            @click="saveAs"
            >另存</a-button
          >
        </a-col>
      </a-row>
      <a-row :gutter="[10]" v-if="modalContentList">
        <a-col :span="9">
          <a-textarea v-model="useContent.content" :auto-size="true" :disabled="true" />
        </a-col>
        <a-col :span="9">
          <a-textarea v-model="changeContent" :auto-size="true" />
        </a-col>
        <a-col :span="6" class="history-box">
          <div class="history-title">历史版本</div>
          <div
            v-for="(version, index) in modalContentList"
            :key="index"
            class="version-item"
            :class="{ 'version-active': version.id == selectModal.id }"
            @click="changeSelect(version)"
          >
            <div class="version-id" :style="{ 'background-color': colorList[index] }">{{ index }}</div>
            <div class="version-number">版本{{ version.version }}</div>
            <div class="version-date">{{ version.updateTime.split(' ')[0] }}</div>
            <a-popconfirm
              title="是否确定该模块结论?"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteVersion(version)"
            >
              <a-button style="color: #ec6342" type="link" size="small" icon="delete"></a-button>
            </a-popconfirm>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
  
<script>
import { reportContentList, deleteReportContent, saveReportContent, useReportContent, getModalList } from '@/api/report'
import { colorList } from '@/config/constants'
export default {
  props: {
    reportDetail: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      applyLoading: false,
      saveLoading: false,
      modalList: [],
      colorList,
      currentModalSelect: null,
      modalContentList: [],
      selectModal: null,
      useContent: {
        content: '',
      },
      changeContent: null,
    }
  },
  mounted() {
    const { $notification } = this
    getModalList(this.reportDetail.id).then((res) => {
      if (res.data.length) {
        this.modalList = res.data
        this.currentModalSelect = res.data[0]
        this.getModalContent()
        return
      }
      $notification['warn']({
        message: '通知：',
        description: '无结论数据',
        duration: 8,
      })
    })
  },
  watch: {
    selectModal: {
      handler(v) {
        this.changeContent = v.content
      },
      deep: true,
    },
  },
  methods: {
    changModalShow(v) {
      this.currentModalSelect = v
      this.getModalContent()
    },
    getModalContent() {
      // 获取对应modal内容
      const query = {
        reportId: this.reportDetail.id,
        title: this.currentModalSelect,
      }
      reportContentList(query).then((res) => {
        this.modalContentList = res.data
        res.data.forEach((v) => {
          if (v.isUse == 1) {
            this.useContent = v
            return
          }
        })
        this.selectModal = this.useContent
      })
    },
    changeSelect(version) {
      if (version.id == this.selectModal.id) return
      this.selectModal = version
    },
    applyChanges() {
      // 应用修改的逻辑，例如发送请求到后端保存修改
      const { $notification } = this
      // 现判断是否有修改？
      if (this.changeContent == this.useContent.content) {
        // 若相等，则没有更改，不进行接口调用
        $notification['info']({
          message: '通知：',
          description: '请对结论进行编辑后再保存',
          duration: 8,
        })
        return
      }
      const query = {
        id: this.selectModal.id,
        content: this.changeContent,
      }
      this.applyLoading = true
      useReportContent(query)
        .then((res) => {
          if (res.code != 200) {
            $notification['error']({
              message: '错误通知：',
              description: `${res.msg}`,
              duration: 8,
            })
            this.applyLoading = false
            this.getModalContent()
          } else {
            this.$emit('refreshEdit')
            $notification['success']({
              message: '通知：',
              description: '操作成功',
              duration: 8,
            })
            this.applyLoading = false
            this.getModalContent()
          }
        })
        .catch((err) => {
          $notification['error']({
            message: '通知：',
            description: `操作失败：${err}`,
            duration: 8,
          })
          this.applyLoading = false
          this.getModalContent()
        })
    },
    saveAs() {
      // 另存的逻辑，例如创建新的版本记录
      const { $notification } = this
      // 现判断是否有修改？
      if (this.changeContent == this.selectModal.content) {
        // 若相等，则没有更改，不进行接口调用
        $notification['info']({
          message: '通知：',
          description: '请对结论进行编辑后再保存',
          duration: 8,
        })
        return
      }
      const query = {
        reportId: this.reportDetail.id,
        title: this.currentModalSelect,
        content: this.changeContent,
      }
      this.saveLoading = true
      saveReportContent(query)
        .then((res) => {
          $notification['success']({
            message: '通知：',
            description: '操作成功',
            duration: 8,
          })
          this.saveLoading = false
          this.getModalContent()
        })
        .catch((err) => {
          $notification['error']({
            message: '通知：',
            description: `操作失败：${err}`,
            duration: 8,
          })
          this.saveLoading = false
          this.getModalContent()
        })
    },
    deleteVersion(item) {
      const { $notification } = this
      if (item.isUse) {
        $notification['info']({
          message: '通知：',
          description: '当前正在被应用的结论无法删除',
          duration: 8,
        })
        return
      }
      deleteReportContent(item.id)
        .then((res) => {
          $notification['success']({
            message: '通知：',
            description: '删除成功',
            duration: 8,
          })
          this.getModalContent()
        })
        .catch((err) => {
          $notification['error']({
            message: '通知：',
            description: `删除失败：${err}`,
            duration: 8,
          })
          this.getModalContent()
        })
    },
  },
}
</script>
  
<style lang="less" scoped>
.drawer-container {
  padding-left: 4px;
  margin-bottom: 20px;
  background-color: #4e80ee;
  border-radius: 10px;
  .select-item {
    background-color: #fff;
    padding: 14px 0 14px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: bold;
  }
}
.edit-modal-body {
  /deep/ .ant-input-disabled {
    color: rgba(0, 0, 0, 0.75);
    background-color: #f5f5f5;
  }
}
.grid-box {
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  .cant-edit-box {
    padding-right: 10px;
    border-right: 1px solid #e5e7eb;
  }
}
.status-tag {
  position: relative;
  padding-left: 15px;
  font-size: 14px;
  font-weight: bold;
  &::before {
    position: absolute;
    content: '';
    width: 8px;
    height: 14px;
    border-radius: 4px;
    background-color: #dd524c;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
.green-tag {
  padding-left: 25px;
  &::before {
    left: 10px;
    background-color: #5ec269;
  }
}
.flex-end {
  align-items: flex-end;
  justify-content: flex-end;
  /deep/ .ant-btn {
    margin: 0 4px;
  }
}
.history-box {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.history-title {
  position: relative;
  font-weight: bold;
  font-size: 18px;
  padding: 10px;
  padding-left: 24px;
  border-bottom: 1px solid #e5e7eb;
  &::before {
    position: absolute;
    content: '';
    width: 5px;
    border-radius: 3px;
    background-color: #9d59ef;
    height: 30px;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.version-item {
  display: flex;
  align-items: center;
  padding: 10px 4px;
  cursor: pointer;
  .version-id {
    display: flex;
    align-items: center;
    color: #fff;
    padding: 2px 4px;
    border-radius: 2px;
    font-weight: bold;
  }
  .version-number {
    flex: 1;
    padding: 0 4px;
    font-size: 13px;
    font-weight: bold;
  }
  .version-date {
    flex: 1;
    font-size: 12px;
  }
}
.version-active {
  background-color: #f9f5fe;
}
</style>