<template>
  <div class="ai-content-generate" :style="{ height: editorHeight }">
    <!-- 标题和关闭按钮区域 -->
    <div class="header">
      <div class="flex">
        <img style="width: 22px; height: 25px" src="@/assets/images/AISave.png" alt="dark" />
        <h2 class="title">AI内容生成</h2>
      </div>
      <a-icon type="close" class="close-icon" @click="handleClose" />
    </div>
    <div class="p-16 inner-content" :class="{ 'close-body': saveBS }">
      <!-- 选择报告内容项 -->
      <div class="content-item-select">
        <span>选择报告内容项</span>
        <a-select v-model="selectedContent" placeholder="请选择" style="width: 200px; margin-left: 8px">
          <a-select-option v-for="(item, index) in templateList" :key="index" :value="item">{{ item }}</a-select-option>
        </a-select>
      </div>

      <!-- 自定义提示词区域 -->
      <div class="custom-prompt" v-if="quickSelectList.length">
        <span>自定义提示词</span>
        <a-textarea v-model="prompt" placeholder="请输入您的分析需求和具体要求..." rows="2" style="width: 100%" />
      </div>

      <!-- 预设提示词相关 -->
      <a-divider class="preset-tip" orientation="center">或选择预设提示词</a-divider>
      <div class="quick-select" v-if="quickSelectList.length">
        <span>快速选择</span>
        <div style="margin-top: 6px">
          <a-button
            size="small"
            class="quick-select-item"
            :class="{ active: item == quickSelected }"
            v-for="(item, index) in quickSelectList"
            :key="index"
            type="default"
            @click="handleQuickSelect(item)"
          >
            {{ item }}
          </a-button>

          <a-dropdown v-if="quickReList.length">
            <a-radio-group
              style="background-color: #fff; padding: 5px; border: 1px solid #f5f5f5"
              slot="overlay"
              v-model="quickSelected"
              @change="chooseQuickAI"
            >
              <div style="padding: 5px 0">
                <a-input placeholder="准确搜索快速选择" @change="sortRs" />
              </div>
              <div style="max-height: 40vh; overflow-y: scroll; overflow-x: hidden">
                <a-row v-for="(item, index) in showRsList" :key="index" :value="item">
                  <a-radio :value="item">{{ item }}</a-radio>
                </a-row>
              </div>
            </a-radio-group>
            <a-button class="quick-select-item more-btn" style="margin-left: 8px">
              <img style="width: 15px; height: 15px" src="@/assets/images/more-sort.png" alt="dark" /> <span>更多</span>
            </a-button>
          </a-dropdown>
        </div>
      </div>

      <!-- 生成内容按钮 -->
      <a-button
        :loading="buildContent"
        :disabled="!aiSaveBtn"
        type="primary"
        class="generate-btn"
        @click="handleGenerate"
      >
        <a-icon type="star" /> 生成内容
      </a-button>
    </div>
    <!-- 已生成内容 -->
    <div v-if="tounchContent" class="flex-1 ai-content-generate">
      <!-- 展开/关闭 -->
      <div class="turn-roge" @click="() => (saveBS = !saveBS)">
        <a-icon class="ii-icon" :class="{ 'ic-icon': saveBS }" type="double-right" />
      </div>
      <div class="result-content flex felx-1">
        <img style="width: 22px; height: 25px" src="@/assets/images/AISave.png" alt="dark" />
        <h2 class="title">生成结果</h2>
      </div>
      <div class="flex down-content flex-1">
        <div class="ai-content-body flex-1 p-8-16">
          <div class="flex">
            <div class="flex">
              <img style="width: 16px; height: 18px" src="@/assets/images/AITounch.png" alt="dark" />
              <h2 class="inner-title">AI润色结果</h2>
            </div>
            <a-select allowClear style="margin-left: 10px" size="small" class="flex-1" @change="versionChange">
              <a-select-option v-for="item in reportVersionList" :key="item.id" :value="item.id">
                {{ item.versionName }}
              </a-select-option>
            </a-select>
          </div>
          <a-textarea class="flex-1 m-h-4" v-model="tounchContent" style="width: 100%" />
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="flex p-8-16 footer-body">
        <a-dropdown>
          <a-checkbox-group
            style="background-color: #fff; padding: 5px; border: 1px solid #f5f5f5"
            slot="overlay"
            v-model="retounchChose"
          >
            <div style="padding: 5px 0">选择润色类型 (可多选)</div>
            <div style="max-height: 40vh; overflow-y: scroll; overflow-x: hidden">
              <a-row v-for="(item, index) in retounchTypeList" :key="index" :value="item">
                <a-checkbox :value="item">{{ item }}</a-checkbox>
              </a-row>
            </div>
            <a-button
              type="primary"
              :loading="tounchBtnStatus"
              style="color: #000; background-color: #fff; border-color: #e8e8e8; margin-top: 12px; width: 100%"
              @click="starTounch"
            >
              <img style="width: 16px; height: 16px" src="@/assets/images/AITounch0.png" alt="dark" /> 开始润色
            </a-button>
          </a-checkbox-group>
          <a-button type="primary" class="footer-btn flex-1">
            <img style="width: 16px; height: 16px" src="@/assets/images/AITounch-w.png" alt="dark" /> AI润色
          </a-button>
        </a-dropdown>
        <div style="width: 16px"></div>
        <a-button type="primary" class="footer-btn flex-1" @click="() => (modalShow = true)">
          <a-icon type="save" /> 保存版本
        </a-button>
        <div style="width: 16px"></div>
        <a-button type="primary" class="flex-1" @click="applyReport">
          <a-icon type="check-circle" /> 应用到报告
        </a-button>
      </div>
    </div>

    <a-modal
      title="保存润色版本"
      v-model="modalShow"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @ok="resetReportFun"
      @cancel="modalShow = false"
    >
      <div class="set-name">
        <div class="set-name-title">版本名称</div>
        <a-input :loading="savingStauts" allowClear size="large" v-model="otherSaveReportName"></a-input>
      </div>
    </a-modal>
  </div>
</template>
  
<script>
import {
  getTemplateDetail,
  getDraftQuickChose,
  draftAIContent,
  getAIRetouchType,
  contentRetouch,
  saveDraftPolishing,
  getPolishingList,
  applyAIContent,
} from '@/api/report'
export default {
  name: 'AiContentGenerate',
  props: {
    templateId: {
      type: String / Number,
      required: true,
    },
    chapterId: {
      type: String / Number,
      required: true,
    },
    firstDraftId: {
      type: String / Number,
      required: true,
    },
    editorHeight: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      retounchTypeList: [],
      retounchChose: [],
      templateList: [],
      selectedContent: '', // 默认选中项
      prompt: '', // 自定义提示词
      quickReList: [],
      quickSelectList: [],
      aiSaveBtn: true,
      quickSelected: null,
      showRsList: [],
      buildContent: false, // 生成内容按钮状态
      tounchContent: '',
      tounchBtnStatus: false,
      savingStauts: false,
      modalShow: false,
      otherSaveReportName: '',
      reportVersionList: [],
      versionDetail: null,
      saveBS: false,
    }
  },
  watch: {
    firstDraftId: {
      handler() {
        // 清除场景内部ai生成的内容
        this.prompt = ''
        this.tounchContent = ''
        this.saveBS = false
        this.initTemplateList()
      },
      deep: true,
    },
  },
  mounted() {
    this.initTemplateList()
    this.getAIRetouchType()
  },
  methods: {
    getAIRetouchType() {
      getAIRetouchType().then((res) => {
        this.retounchTypeList = res.data
      })
    },
    initTemplateList() {
      // 获取选择报告内容项列表
      if (!this.firstDraftId) return
      getTemplateDetail({ templateId: this.templateId }).then((res) => {
        this.templateList = res.data
        this.selectedContent = res.data[0]
        this.getQuickChoseList()
        this.getReportVersionList()
      })
    },
    getQuickChoseList() {
      getDraftQuickChose({
        templateId: this.templateId,
        choseReportContent: this.selectedContent,
      }).then((res) => {
        if (res.data[0] === '无') {
          this.quickReList = []
          this.quickSelectList = []
          this.aiSaveBtn = false
          this.showRsList = []
        } else {
          this.aiSaveBtn = true
          if (res.data.length > 3) {
            this.quickReList = res.data
            this.quickSelectList = [res.data[0], res.data[1], res.data[2]]
            this.showRsList = res.data
          } else {
            this.quickSelectList = res.data
          }
        }
      })
    },
    handleClose() {
      // 这里可实现关闭当前组件或弹窗等逻辑，比如向父组件传递事件
      this.$emit('close')
    },
    handleQuickSelect(text) {
      this.quickSelected = this.quickSelected == text ? '' : text
    },
    chooseQuickAI(value) {
      this.quickSelected = value.target.value
    },
    sortRs(es) {
      const e = es.target.value
      if (!e.trim()) {
        this.showRsList = [...this.quickReList]
        return
      }
      const searchTerm = e.toLowerCase().trim()
      this.showRsList = this.quickReList.filter((option) => {
        const valueToMatch = option.toString()?.toLowerCase() || ''
        return valueToMatch.includes(searchTerm)
      })
    },
    handleGenerate() {
      const { $notification } = this
      if (!this.quickSelected && !this.prompt) {
        $notification['warn']({
          message: '通知：',
          description: `自定义提示词或快速选择不可均为空`,
          duration: 6,
        })
        return
      }
      const parameter = {
        chapterId: this.firstDraftId, // 章节id
        draftId: this.chapterId, // 初稿id
        customePrompt: this.prompt, // 用户自己编写的提示词
        templateNameFilter: this.selectedContent, // 上面的选择报告内容项
        presetPrompt: this.quickSelected, // 页面上快速选择的提示词
      }
      this.buildContent = true
      draftAIContent(parameter).then((res) => {
        this.buildContent = false
        if (res.code !== 200) {
          $notification['error']({
            message: '通知：',
            description: `错误：${res.msg}`,
            duration: 6,
          })
        } else {
          this.tounchContent = res.data
          this.saveBS = true
        }
      })
    },
    starTounch() {
      const parameter = {
        content: this.tounchContent,
        types: this.retounchChose,
      }
      this.tounchBtnStatus = true
      contentRetouch(parameter).then((res) => {
        this.tounchBtnStatus = false
        this.tounchContent = res.data
      })
    },
    resetReportFun() {
      // 保存版本
      const { $notification } = this
      const parameter = {
        draftId: this.chapterId, // 初稿id
        versionName: this.otherSaveReportName, // 版本名称
        chapterId: this.firstDraftId, // 章节id
        content: this.tounchContent, // 润色内容,
        templateNameFilter: this.selectedContent, // 上面选择的报告内容项
      }
      this.savingStauts = true
      saveDraftPolishing(parameter).then((res) => {
        this.savingStauts = false
        this.modalShow = false
        $notification['success']({
          message: '通知：',
          description: `保存版本成功：${this.otherSaveReportName}`,
          duration: 6,
        })
        // 更新获取版本列表
        this.getReportVersionList()
      })
    },
    getReportVersionList() {
      const parameter = {
        draftId: this.chapterId, // 初稿id
        chapterId: this.firstDraftId, // 章节id
        templateNameFilter: this.selectedContent, // 上面选择的报告内容项
      }
      getPolishingList(parameter).then((res) => {
        this.reportVersionList = res.data
      })
    },
    versionChange(item) {
      if (!item) return
      this.versionDetail = this.reportVersionList.find((v) => v.id == item)
      this.tounchContent = this.versionDetail.content
    },
    applyReport() {
      const { $notification } = this
      if (!this.tounchContent) {
        $notification['warn']({
          message: '通知：',
          description: `更新内容不能为空`,
          duration: 6,
        })
        return
      }
      // 应用内容到初稿
      const parameter = {
        chapterId: this.firstDraftId,
        templateNameFilter: this.selectedContent,
        content: this.tounchContent,
      }
      applyAIContent(parameter).then((res) => {
        $notification['success']({
          message: '通知：',
          description: `成功应用到报告`,
          duration: 6,
        })
        // 成功、更新章节内容
        this.$emit('updateTemplateContent')
      })
    },
  },
}
</script>
  
<style lang="less" scoped>
.h100 {
  height: 100%;
}
.ai-content-generate {
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.ai-content-body {
  display: flex;
  flex-direction: column;
}
.header {
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  border-bottom: 1px solid #e8e8e8;
}
.result-content {
  padding: 0 16px 8px;
  border-bottom: 1px solid #e8e8e8;
}
.title {
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}
.inner-title {
  margin-left: 10px;
  font-size: 12px;
  line-height: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
  box-sizing: border-box;
}
.down-content,
.footer-body {
  background-color: #f9fafb;
  box-sizing: border-box;
}
.p-8-16 {
  padding: 8px 16px 0;
}
.m-h-4 {
  margin: 4px 0;
}
.left-content {
  border-right: 1px solid #e8e8e8;
}
.close-icon {
  cursor: pointer;
  color: #999;
  font-size: 18px;
}
.p-16 {
  padding: 16px;
  font-weight: bold;
  .content-item-select {
    margin-bottom: 8px;
  }
  .content-item-select span {
    color: #333;
  }
  .custom-prompt {
    margin-bottom: 8px;
  }
  .custom-prompt span {
    display: block;
    margin-bottom: 8px;
    color: #333;
  }
  .preset-tip {
    color: #999;
    margin-top: 4px;
    margin-bottom: 4px;
    font-size: 12px;
    /deep/ .ant-divider-inner-text {
      padding: 0 12px;
    }
  }
  .quick-select {
    margin-bottom: 12px;
    .quick-select-item {
      font-size: 12px;
      font-weight: bold;
      background-color: #f3f4f6;
      border: none;
      padding: 4px 8px;
      line-height: 1;
      margin-right: 8px;
      &.more-btn {
        background-color: #eff6ff;
        span {
          margin-left: 2px;
          color: #2b6dfc;
        }
      }
      &.active {
        color: #096dd9;
        border: 1px solid #096dd9;
      }
    }
  }
  .quick-select span {
    margin-right: 8px;
    color: #333;
  }
  .generate-btn {
    width: 100%;
  }
  .footer-btn {
    background-color: #fff;
    color: #000;
    border-color: #e8e8e8;
    font-size: 14px;
  }
}
.close-body {
  padding: 0 !important;
  height: 0 !important;
  transition: all 0.3s ease-in-out;
}
.turn-roge {
  width: 100%;
  height: 12px;
  text-align: center;
  cursor: pointer;
  .ii-icon {
    height: 12px;
    width: 30px;
    transform: rotate(270deg);
    transition: all 0.3s ease-in-out;
    &.ic-icon {
      transform: rotate(90deg);
      transition: all 0.3s ease-in-out;
    }
  }
}
.inner-content {
  position: relative;
  padding-bottom: 8px;
  overflow: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0px;
  }
}
.set-name {
  padding: 16px;
}
</style>