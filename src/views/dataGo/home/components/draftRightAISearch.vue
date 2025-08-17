<template>
  <div class="ai-content-generate" :style="{ height: editorHeight }">
    <!-- 标题和关闭按钮区域 -->
    <div class="header">
      <div class="flex" style="align-items: center">
        <a-icon style="color: rgb(87, 135, 238)" type="search" />
        <h2 class="title">AI搜索</h2>
      </div>
      <a-icon type="close" class="close-icon" @click="handleClose" />
    </div>
    <div class="p-16 inner-content">
      <div class="content-item-select">
        <span>搜索关键词</span>
        <div style="margin-top: 4px">
          <a-select v-model="currentEngine" placeholder="请选择" style="width: 100px">
            <div slot="dropdownRender" slot-scope="menu">
              <v-nodes :vnodes="menu" />
              <a-divider style="margin: 4px 0" />
              <div
                style="padding: 4px 8px; cursor: pointer"
                @mousedown="(e) => e.preventDefault()"
                @click="() => (addEngineModal = true)"
              >
                <a-icon type="plus" /> 添加API
              </div>
            </div>
            <a-select-option v-for="(item, index) in engineList" :key="index" :value="item.id">{{
              item.modelName
            }}</a-select-option>
          </a-select>
          <a-select v-model="selectedContent" placeholder="请选择" style="width: 200px; margin-left: 8px">
            <a-select-option v-for="(item, index) in templateList" :key="index" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 预设提示词相关 -->
      <a-divider class="preset-tip" orientation="center">或选择预设提示词</a-divider>
      <div class="quick-select" v-if="quickSelectList.length">
        <span>快速选择</span>
        <div style="margin-top: 6px">
          <a-button
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
        <a-icon type="search" /> 确定搜索
      </a-button>
    </div>
    <!-- 已生成内容 -->
    <div v-if="aiContent" class="flex-1 ai-content-generate">
      <div class="result-content flex">
        <img style="width: 22px; height: 25px" src="@/assets/images/AISave.png" alt="dark" />
        <h2 class="title">生成结果</h2>
      </div>
      <div class="flex down-content flex-1">
        <div class="ai-content-body flex-1 h100 left-content p-12-16">
          <div class="flex">
            <img style="width: 16px; height: 18px" src="@/assets/images/AISave.png" alt="dark" />
            <h2 class="inner-title">原始生成内容</h2>
          </div>
          <a-textarea class="flex-1 m-h-4" v-model="aiContent" style="width: 100%" />
        </div>
        <div class="ai-content-body flex-1 p-12-16">
          <div class="flex">
            <div class="flex">
              <img style="width: 16px; height: 18px" src="@/assets/images/AITounch.png" alt="dark" />
              <h2 class="inner-title">AI润色结果</h2>
            </div>
            <a-select style="margin-left: 10px" size="small" class="flex-1" @change="versionChange">
              <a-select-option v-for="item in reportVersionList" :key="item.id" :value="item.id">
                {{ item.versionName }}
              </a-select-option>
            </a-select>
          </div>
          <a-textarea class="flex-1 m-h-4" v-model="tounchContent" style="width: 100%" />
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="flex p-16 footer-body">
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
            <img style="width: 16px; height: 16px" src="@/assets/images/AITounch0.png" alt="dark" /> AI润色
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

    <a-modal
      title="添加自定义搜索引擎API"
      v-model="addEngineModal"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @ok="addEngine"
      @cancel="addEngineModal = false"
    >
      <template slot="okText"> <a-icon type="plus"></a-icon>添加引擎 </template>
      <div class="add-engine-area">
        <div class="flex input-set">
          <div class="set-name-title">引擎名称：</div>
          <a-input
            :style="{ width: '200px' }"
            placeholder="例如：自定义搜索"
            :loading="savingStauts"
            allowClear
            v-model="engineName"
          ></a-input>
        </div>
        <div class="flex input-set">
          <div class="set-name-title">API地址：</div>
          <a-input
            :style="{ width: '200px' }"
            placeholder="https://api.example.com/search"
            :loading="savingStauts"
            allowClear
            v-model="APIAdress"
          ></a-input>
        </div>
        <div class="flex input-set">
          <div class="set-name-title">API密钥：</div>
          <a-input
            :style="{ width: '200px' }"
            placeholder="可选：API密钥"
            :loading="savingStauts"
            allowClear
            v-model="APISercet"
          ></a-input>
        </div>
        <div class="desc">提示：API地址中可以使用 {query} 作为搜索关键词的占位符</div>
        <div class="desc">例如：https://api.example.com/search?q={query}&key={apikey}</div>
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
  getAIEngineList,
  addAIEngine,
} from '@/api/report'
export default {
  name: 'DraftRightAISearch',
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  props: {
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
      quickReList: [],
      quickSelectList: [],
      aiSaveBtn: true,
      quickSelected: null,
      showRsList: [],
      buildContent: false, // 生成内容按钮状态
      aiContent: '',
      tounchContent: '',
      tounchBtnStatus: false,
      savingStauts: false,
      modalShow: false,
      otherSaveReportName: '',
      reportVersionList: [],
      versionDetail: null,
      engineList: [],
      addEngineModal: false,
      addEngineStatus: false,
      engineName: '',
      APIAdress: '',
      APISercet: '',
      currentEngine: null,
    }
  },
  watch: {
    firstDraftId: {
      handler() {
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
      getTemplateDetail({ templateId: this.firstDraftId }).then((res) => {
        this.templateList = res.data
        this.selectedContent = res.data[0]
        this.getQuickChoseList()
        this.getReportVersionList()
      })
      this.getEngineList()
    },
    getEngineList() {
      getAIEngineList().then((res) => {
        if (res.data.length) {
          this.engineList = res.data
          this.currentEngine = res.data[0].id
        }
      })
    },
    addEngine() {
      const { $notification } = this
      if (!this.engineName || !this.APIAdress || !this.APISercet) {
        $notification['warn']({
          message: '通知：',
          description: `添加自定义搜索引擎API，内容填写不能为空`,
          duration: 6,
        })
        return
      }
      if (this.addEngineStatus) {
        $notification['warn']({
          message: '通知：',
          description: `正在新增引擎，请等待`,
          duration: 6,
        })
        return
      }
      const parameter = {
        modelName: this.engineName,
        baseUrl: this.APIAdress, // AI模型接口地址
        apiKey: this.APISercet,
      }
      this.addEngineStatus = true
      addAIEngine(parameter).then(() => {
        $notification['success']({
          message: '通知：',
          description: `添加自定义搜索引擎API成功`,
          duration: 6,
        })
        this.$nextTick(() => {
          this.addEngineStatus = false
          this.addEngineModal = false
        })
        this.getEngineList()
      })
    },
    getQuickChoseList() {
      getDraftQuickChose({
        // templateId: 100,
        // choseReportContent: '公司治理情况',
        templateId: this.firstDraftId,
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
      if (!this.quickSelected) {
        $notification['warn']({
          message: '通知：',
          description: `快速选择不可为空`,
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
      //   this.aiContent = '对集团采用的授信管理模式进行分析'
      //   this.tounchContent = '对集团采用的授信管理模式进行分析'
      this.buildContent = true
      draftAIContent(parameter).then((res) => {
        this.buildContent = false
        this.aiContent = res.data
        this.tounchContent = res.data
      })
    },
    starTounch() {
      const parameter = {
        content: this.aiContent,
        types: this.retounchChose,
      }
      //   this.tounchContent = '润色后的结果'
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
      this.versionDetail = this.reportVersionList.find((v) => v.id == item)
      this.tounchContent = this.versionDetail.content
    },
    applyReport() {
      const parameter = {
        chapterId: this.firstDraftId,
        templateNameFilter: this.selectedContent,
        content: this.tounchContent,
      }
      applyAIContent(parameter).then((res) => {
        console.log(res)
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
.p-12-16 {
  padding: 12px 16px 0;
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
    margin-bottom: 16px;
  }
  .custom-prompt span {
    display: block;
    margin-bottom: 8px;
    color: #333;
  }
  .preset-tip {
    color: #999;
    margin-bottom: 8px;
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
  .inner-content {
    height: 100%;
    overflow: hidden;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 0px;
    }
  }
}
.set-name {
  padding: 16px;
}
.add-engine-area {
  padding: 12px 24px;
  .input-set {
    align-items: center;
    margin-bottom: 12px;
  }
  .set-name-title {
    width: 80px;
    text-align: right;
    margin-right: 20px;
    font-weight: bold;
  }
  .desc {
    font-size: 12px;
    color: #999;
  }
}
</style>