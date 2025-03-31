<template>
  <div class="edit-modal-body">
    <div class="drawer-container">
      <div class="select-item flex-row-spacebetween">
        <div>
          选择模块<a-select
            v-model="currentModalSelect"
            style="width: 250px; margin-left: 20px"
            @change="changModalShow"
          >
            <a-select-option v-for="(i, index) in modalList" :key="index" :value="i">
              {{ i }}
            </a-select-option>
          </a-select>
          历史版本<a-select v-model="selectModalId" style="width: 250px; margin-left: 20px" @change="changeSelect">
            <a-select-option v-for="(i, index) in modalContentList" :key="index" :value="i.id">
              版本{{ i.version }}-{{ i.updateTime.split(' ')[0] }}
            </a-select-option>
          </a-select>
        </div>
        <div>
          <a-tooltip placement="top">
            <template slot="title">
              <span>AI优化</span>
            </template>
            <a-popconfirm :disabled="editLoading" placement="left" ok-text="AI优化" cancel-text="取消" @confirm="toAI">
              <template slot="title">
                <div>是否通过AI对模板结论进行优化?</div>
                <div>注意：进行AI优化会修改当前编辑框内容。</div>
              </template>
              <img class="ai-png" src="@/assets/images/ai.png" alt="dark" />
            </a-popconfirm>
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title">
              <span>新增结论</span>
            </template>
            <a-popconfirm
              :disabled="editLoading"
              placement="left"
              ok-text="新增结论"
              cancel-text="取消"
              @confirm="addModalResult"
            >
              <template slot="title">
                <div>是否新增模板结论?</div>
                <div>注意：进行新增模板结论会清空当前编辑框内容。</div>
              </template>
              <a-button style="color: #6cbdf6; border: none; background-color: transparent" icon="plus" />
            </a-popconfirm>
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title">
              <span>另存为</span>
            </template>
            <a-popconfirm :disabled="editLoading" placement="left" ok-text="保存" cancel-text="取消" @confirm="saveAs">
              <template slot="title">
                <div>是否另存结论?</div>
              </template>
              <a-button
                :loading="saveLoading"
                style="color: #6cbdf6; border: none; background-color: transparent"
                icon="save"
              />
            </a-popconfirm>
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title">
              <span>应用</span>
            </template>
            <a-popconfirm
              :disabled="editLoading"
              placement="left"
              ok-text="应用结论"
              cancel-text="取消"
              @confirm="applyChanges"
            >
              <template slot="title">
                <div>是否应用?</div>
              </template>
              <a-button
                style="color: #6cbdf6; border: none; background-color: transparent"
                icon="check-circle"
                :loading="applyLoading"
              />
            </a-popconfirm>
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="report-container">
      <a-row class="grid-box">
        <a-col :span="11">
          <div class="flex-row-spacebetween cant-edit-box">
            <span class="red-dot status-tag">原报告内容</span>
            <span>不可编辑</span>
          </div>
        </a-col>
        <a-col :span="11">
          <span class="status-tag green-tag">修改编辑</span>
        </a-col>
        <!-- <a-col :span="6" class="flex flex-end"> </a-col> -->
      </a-row>
      <a-row :gutter="[10]" v-if="modalContentList">
        <a-col :span="11">
          <a-textarea style="height: 70vh" v-model="useContent.content" :auto-size="true" :disabled="true" />
        </a-col>
        <a-col :span="11">
          <a-spin :spinning="editLoading">
            <a-textarea style="height: 70vh" v-model="changeContent" :auto-size="true" />
          </a-spin>
        </a-col>
        <!-- <a-col :span="6" class="history-box">
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
        </a-col> -->
      </a-row>
    </div>
  </div>
</template>
  
<script>
import {
  reportContentList,
  deleteReportContent,
  saveReportContent,
  useReportContent,
  getModalList,
  toAi,
} from '@/api/report'
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
      editLoading: false,
      modalList: [],
      colorList,
      currentModalSelect: null,
      modalContentList: [],
      selectModal: null,
      selectModalId: null,
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
    toAI() {
      const { $notification } = this
      // ai
      this.editLoading = true
      toAi({ content: this.changeContent }).then((result) => {
        this.editLoading = false
        if (result.code != 200) {
          $notification['error']({
            message: '错误通知：',
            description: `${result.msg}`,
            duration: 8,
          })
          return
        } else {
          this.changeContent = result.data
        }
      })
    },
    addModalResult() {
      this.changeContent = ''
    },
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
        this.selectModalId = this.useContent.id
      })
    },
    changeSelect(version) {
      if (version == this.selectModal.id) return
      this.selectModalId = version
      this.selectModal = this.modalContentList.filter((v) => v.id == version)[0]
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
  .select-item {
    padding-bottom: 10px;
    border-bottom: 1px solid #979797;
    font-size: 16px;
    font-weight: bold;
    color: #1789ff;
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
.ai-png {
  width: 17px;
  height: 20px;
  cursor: pointer;
}
</style>