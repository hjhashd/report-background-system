<!--
 * @Author: bekon
 * @Date: 2025-02-25 15:23:20
 * @LastEditors: bekon
 * @LastEditTime: 2025-08-26 19:49:08
 * @FilePath: /report-background-system/src/views/dataGo/home/viewReportFirstDraft.vue
 * @Description: 报告预览
 *
-->
<template>
  <!-- <page-header-wrapper> -->
  <a-spin :spinning="pageLoading" class="full-height-spin">
    <div ref="reportViewDetail" class="page-content flex-col" style="padding: 0; width: 100%; height: 100vh;">
      <div class="report-view">
        <div class="flex-row-spacebetween tools">
          <div class="flex">
            <a-tooltip>
              <template slot="title">
                <span>{{ reportName }}</span>
              </template>
              <div class="sys-title single-line-text">{{ reportName }}</div>
            </a-tooltip>
          </div>
        <div class="flex">
          <a-tooltip>
            <template slot="title">
              <span>保存</span>
            </template>
            <div class="btn-item" @click="saveCurrent">
              <div class="icon-box"><a-icon style="color: #4db36f" type="save" /></div>
            </div>
          </a-tooltip>
          <a-tooltip v-if="!fullView">
            <template slot="title">
              <span>全屏</span>
            </template>
            <div class="btn-item" @click="allViewPort">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="fullscreen" /></div>
              </div>
            </a-tooltip>
            <a-tooltip v-else>
              <template slot="title">
                <span>退出全屏</span>
              </template>
              <div class="btn-item" @click="closeViewPort">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="fullscreen-exit" /></div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>AI生成</span>
              </template>
              <div class="btn-item" @click="openRight('ai-save')">
                <div class="icon-box ai-bold-font">AI</div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>AI搜索</span>
              </template>
              <div class="btn-item" @click="openRight('ai-search')">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="search" /></div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>更新报告</span>
              </template>
              <div class="btn-item" @click="updateReportData">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="redo" /></div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>诊断</span>
              </template>
              <div class="btn-item" @click="toggleDebug">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="bug" /></div>
              </div>
            </a-tooltip>
            <a-tooltip>
              <template slot="title">
                <span>资料选择</span>
              </template>
              <div class="btn-item" @click="openRight('file-select')">
                <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="folder-open" /></div>
              </div>
            </a-tooltip>
          </div>
        </div>
      </div>
      <div class="flex flex-1" :style="{ height: editorHeight, position: 'relative' }">
        <div ref="editorContainerRef" class="editor-container">
          <OnlyOfficeEditorFD
            ref="editorR"
            :docUrl="docUrl"
            :docTitle="reportName"
            :docFileType="fileType"
            :editable="editableMode"
            :editorHeight="editorHeight"
            @onlyoffice-info="onOOInfo"
            @onlyoffice-error="onOOError"
          />
        </div>
        <div
          :class="{
            'open-right': !!showRightType,
          }"
          class="right-content"
          v-if="debugVisible || showRightType"
        >
          <div v-if="showRightType == 'ai-save'" style="height: 100%;">
            <AiContentGenerate
              :firstDraftId="currentChose"
              :templateId="templateId"
              :chapterId="reportId"
              :editorHeight="editorHeight"
              @close="() => (showRightType = '')"
              @updateTemplateContent="updateEdit"
              @insertText="insertTextIntoDoc"
            ></AiContentGenerate>
          </div>
          <div v-else-if="showRightType == 'ai-search'" style="height: 100%;">
            <DraftRightAISearch
              :firstDraftId="currentChose"
              :templateId="templateId"
              :chapterId="reportId"
              :editorHeight="editorHeight"
              :categoryId="categoryId"
              :reportType="reportType"
              @close="() => (showRightType = '')"
              @insertText="insertTextIntoDoc"
            ></DraftRightAISearch>
          </div>
          <div v-else-if="debugVisible" style="padding: 12px">
            <a-alert type="info" show-icon :message="'调试信息'" />
            <div style="margin-top:8px; font-size:12px">
              <div>docUrl: {{ docUrl }}</div>
              <div>internalBase: {{ internalBase }}</div>
              <div>onlyoffice events: {{ ooEvents.join(' | ') }}</div>
              <a-button size="small" style="margin-top:8px" @click="runDiagnostics">运行诊断</a-button>
              <div style="margin-top:8px" v-if="diagResult">{{ diagResult }}</div>
            </div>
          </div>
          <div v-else-if="showRightType == 'file-select'">
            <FileSelectPanel
              :editorHeight="editorHeight"
              @close="() => (showRightType = '')"
              @insertText="insertTextIntoDoc"
            />
          </div>
        </div>
      </div>

      <ViewReportModals
        :setReportName.sync="setReportName"
        :otherSaveReportName.sync="otherSaveReportName"
        :popTitle="popTitle"
        :openDataYC.sync="openDataYC"
        :customerDetail="customerDetail"
        :udt.sync="udt"
        :uploadTableList="uploadTableList"
        @reset-report="resetReportFun"
      />
    </div>
  </a-spin>
  <!-- </page-header-wrapper> -->
</template>

<script>
import { mapActions } from 'vuex'
import { OnlyOfficeEditorFD } from '@/components'
import ViewReportModals from './components/ViewReportModals.vue'
import { debounce } from '@/utils/util'
import AiContentGenerate from './components/draftRightAISave.vue'
import DraftRightAISearch from './components/draftRightAISearch.vue'
import FileSelectPanel from './components/fileSelectPanel.vue'

export default {
  name: 'addReport',
  components: {
    OnlyOfficeEditorFD,
    ViewReportModals,
    AiContentGenerate,
    DraftRightAISearch,
    FileSelectPanel,
  },
  data() {
    return {
      pageLoading: false,
      editorHeight: null,
      fullView: false,
      reportName: null,
      fileType: 'docx',
      docUrl: '',
      setReportName: false,
      otherSaveReportName: '',
      popTitle: '保存版本',
      showRightType: '',
      udt: false,
      uploadTableList: [],
      // 诊断
      debugVisible: false,
      ooEvents: [],
      internalBase: 'http://report-system-dev:8000',
      diagResult: '',
      // 兼容旧逻辑需要的占位
      currentChose: null,
      templateId: null,
      reportId: null,
      categoryId: null,
      reportType: null,
      editableMode: true,
      saving: false,
      lastSaveMeta: null,
    }
  },
  created() {
    this.reportName = (this.$route.query && this.$route.query.reportName) || ''
    const DEFAULT_DOC = '/local-storage/drafts/广东智环创新环境科技有限公司知识智库搭建-需求-终稿.doc'
    this.docUrl = (this.$route.query && this.$route.query.docUrl) || DEFAULT_DOC
    this.fileType = (this.$route.query && this.$route.query.fileType) || 'docx'
    this.reportId = this.$route.params.reportId
    this.categoryId = (this.$route.query && this.$route.query.categoryId) || ''
    this.reportType = (this.$route.query && this.$route.query.reportType) || ''
    this.currentChose = this.reportId
    this.setCollapsed(true)
  },
  filters: {
    dealCreateTime(v) {
      if (v) {
        return v.split(' ')[0]
      } else {
        return ''
      }
    },
  },
  mounted() {
    window.addEventListener('resize', debounce(this.getinnerBodyHeight))
    this.getinnerBodyHeight()
    },
    methods: {
    ...mapActions(['setCollapsed', 'setFullScreen']),
    getinnerBodyHeight() {
      this.$nextTick(() => {
        // 使用 flex 布局，editorHeight 设置为 100% 即可
        this.editorHeight = '100%'
      })
    },
    openRight(type) {
      this.showRightType = type
      this.$nextTick(() => {
        try {
          window.dispatchEvent(new Event('resize'))
        } catch (e) {}
      })
    },
    allViewPort() {
      // 打开全屏
      this.fullView = true
      this.setFullScreen(this.fullView)
      this.$nextTick(() => {
        const reportViewDetail = document.getElementById('htmlBody')
        if (reportViewDetail) {
          if (reportViewDetail.requestFullscreen) {
            reportViewDetail.requestFullscreen()
          } else if (reportViewDetail.webkitRequestFullscreen) {
            reportViewDetail.webkitRequestFullscreen()
          }
        }
        // 监听全屏状态变化
        const handleFullscreenChange = () => {
          if (document.fullscreenElement === reportViewDetail) {
            // 进入全屏后重新计算编辑器高度
            setTimeout(() => {
              this.$nextTick(() => {
                const editors = this.$refs.editorContainerRef
                if (editors) {
                  this.editorHeight = editors.offsetHeight + 'px'
                }
              })
            }, 200)
          } else {
            // 退出全屏后恢复正常高度
            this.fullView = false
            this.setFullScreen(this.fullView)
            setTimeout(() => {
              this.$nextTick(() => {
                const editors = this.$refs.editorContainerRef
                if (editors) {
                  this.editorHeight = editors.offsetHeight + 'px'
                }
              })
            }, 200)
          }
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
      })
    },
    closeViewPort() {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    },
    resetReportFun() {
      this.setReportName = false
    },
    updateEdit() {
      this.$refs.editorR.refreshEditor()
    },
    updateReportData() {
      const { $notification, $confirm, $router } = this
      $confirm({
        title: '更新报告提醒',
        content: `是否对当前报告进行更新，更新后内容可能较之前发生变化。数据更新将退出查阅模式进行内容更新，待内容更新完毕，可在草稿箱再次查看。`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.pageLoading = true
          const delay = 1000 + Math.floor(Math.random() * 1000)
          setTimeout(async () => {
            try {
              // 写入 modal_marker.json 的 formalReports
              const markerUrl = '/local-storage/drafts/modal_marker.json'
              let marker = { formalReports: [], draftReports: [] }
              try {
                const r = await fetch(markerUrl)
                if (r.ok) {
                  const j = await r.json()
                  if (j && typeof j === 'object') marker = j
                }
              } catch (e) {}
              if (!Array.isArray(marker.formalReports)) marker.formalReports = []
              const nowTS = Date.now()
              const physicalName = (this.docUrl || '').split('/').pop() || ''
              const newFormal = {
                id: `formal-${nowTS}`,
                title: this.reportName || '未命名报告',
                type: this.reportType ? parseInt(this.reportType) : 1,
                createTime: nowTS,
                status: 'published',
                physicalName
              }
              marker.formalReports.unshift(newFormal)
              const blob = new Blob([JSON.stringify(marker, null, 2)], { type: 'application/json' })
              if (this.$refs && this.$refs.editorR && typeof this.$refs.editorR.uploadToFS === 'function') {
                await this.$refs.editorR.uploadToFS('local-storage/drafts/modal_marker.json', blob)
              } else {
                const content = await new Promise((resolve) => {
                  const fr = new FileReader()
                  fr.onload = () => resolve(fr.result.split(',')[1] || '')
                  fr.readAsDataURL(blob)
                })
                await fetch('/__local-upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename: 'local-storage/drafts/modal_marker.json', content }),
                })
              }
              
              // 同步到 report-state.json
              await this.syncToReportState(marker)

              $notification['success']({
                message: '通知：',
                description: '已完成更新，并在报告列表新增一条记录',
                duration: 4,
              })
              this.pageLoading = false
              $router.push({ path: '/homePage/firstDraft', query: { view: 'reports' } })
            } catch (e) {
              this.pageLoading = false
              $notification['error']({
                message: '错误通知：',
                description: String(e),
                duration: 6,
              })
            }
          }, delay)
        },
      })
    },
    async readReportState() {
      try {
        const r = await fetch('/local-storage/drafts/report-state.json')
        if (r.ok) {
          const j = await r.json().catch(() => null)
          if (j && typeof j === 'object') return j
        }
      } catch (e) {}
      return { drafts: [], reports: [] }
    },
    async writeReportState(state) {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      if (this.$refs && this.$refs.editorR && typeof this.$refs.editorR.uploadToFS === 'function') {
        await this.$refs.editorR.uploadToFS('report-state.json', blob)
      } else {
        const content = await new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result.split(',')[1] || '')
          fr.readAsDataURL(blob)
        })
        await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'report-state.json', content }),
        })
      }
    },
    async syncToReportState(markerData) {
      try {
        const state = await this.readReportState()
        const formatDate = (ts) => {
          if (!ts) return new Date().toLocaleString()
          const d = new Date(ts)
          return isNaN(d.getTime()) ? ts : d.toLocaleString()
        }

        state.drafts = (markerData.draftReports || []).map(d => ({
          id: d.id,
          reportName: d.title,
          reportType: d.type,
          enterpriseName: "-",
          genStatus: 0,
          status: 0,
          updateTime: formatDate(d.createTime),
          docUrl: `/local-storage/drafts/${d.physicalName}`,
          fileType: (d.physicalName || '').split('.').pop(),
          tableChangeInfos: []
        }))
        
        if (markerData.formalReports) {
          state.reports = markerData.formalReports.map(f => ({
            id: f.id,
            reportName: f.title,
            reportType: f.type,
            enterpriseName: "-",
            genStatus: 1,
            status: 1,
            updateTime: formatDate(f.createTime),
            docUrl: `/local-storage/drafts/${f.physicalName}`,
            fileType: (f.physicalName || '').split('.').pop(),
            tableChangeInfos: []
          }))
        }

        await this.writeReportState(state)
      } catch (e) {
        console.error('同步 report-state 失败:', e)
      }
    },
    lookUploadModal() {
      this.uploadTableList = []
      this.udt = true
    },
    toggleDebug() {
      this.debugVisible = !this.debugVisible
    },
    onOOInfo(info) {
      if (info && info.type === 'save-success') {
        this.lastSaveMeta = info.meta
        this.$notification['success']({
          message: '保存成功',
          description: `已覆盖原文件 ${info.meta.overwrittenName}（已写入文件系统）`,
          duration: 4,
        })
        this.saving = false
      }
      if (info && info.type === 'save-requested') {
        this.saving = true
        this.$message.loading('正在保存...', 1.5)
      }
      if (info && info.type === 'state') {
        const dirty = info.dirty ? '已修改' : '已同步'
        this.$message.success(`文档状态：${dirty}`, 1)
      }
      if (info && info.type === 'lock-exists') {
        this.$notification['warning']({
          message: '并发编辑提醒',
          description: '检测到该文档在另一个标签或窗口正在编辑，建议只在一个窗口编辑以避免冲突。',
          duration: 6,
        })
      }
      const m = typeof info === 'string' ? info : JSON.stringify(info)
      this.ooEvents.push(m)
    },
    onOOError(err) {
      const m = typeof err === 'string' ? err : JSON.stringify(err)
      this.ooEvents.push('ERROR:' + m)
      this.saving = false
      this.$notification['error']({
        message: '编辑器错误',
        description: typeof err === 'object' && err.message ? err.message : m,
      })
    },
    toggleEditMode() {
      if (this.saving) return
      this.editableMode = !this.editableMode
      this.$nextTick(() => {
        this.$refs.editorR && this.$refs.editorR.refreshEditor()
      })
    },
    async insertTextIntoDoc(text) {
      console.log('[AI Debug] insertTextIntoDoc called');
      const t = text || '';
      if (!t) return;

      if (!this.editableMode) {
        this.$message.warning('当前为预览模式，请先进入编辑');
        return;
      }

      // 1. 优先尝试自动写入剪贴板（最稳妥的兜底方案）
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(t);
          console.log('[AI Debug] 已写入剪贴板');
        } else {
          // 降级方案
          const textArea = document.createElement("textarea");
          textArea.value = t;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          console.log('[AI Debug] 已通过 execCommand 写入剪贴板');
        }
      } catch (err) {
        console.error('[AI Debug] 写入剪贴板失败:', err);
      }

      // 2. 尝试自动插入（针对同源或支持的高级版本）
      try {
        // BroadcastChannel 尝试
        const channel = new BroadcastChannel('onlyoffice-ai-channel');
        channel.postMessage({ type: "ai-insert-text", text: t });
        setTimeout(() => channel.close(), 1000);

        // 组件方法尝试
        if (this.$refs.editorR) {
          this.$refs.editorR.insertTextAtCursor(t);
        }
      } catch (e) {
        console.error('[AI Debug] 自动插入尝试失败:', e);
      }

      // 3. 无论自动插入是否成功，都提示用户（因为跨域场景下我们无法得知自动插入是否真的成功）
      this.$notification['info']({
        message: 'AI 内容已生成',
        description: '内容已自动复制。如果文档未自动插入，请直接在文档中按 Ctrl+V 粘贴。',
        duration: 4,
        icon: (h) => h('a-icon', { props: { type: 'copy', theme: 'twoTone', twoToneColor: '#52c41a' } }),
      });
    },
    saveCurrent() {
      if (!this.editableMode) {
        this.$message.warning('当前为预览模式，请先进入编辑')
        return
      }
      if (this.saving) return
      this.saving = true
      this.$refs.editorR && this.$refs.editorR.saveDocument(this.fileType)
    },
    async runDiagnostics() {
      this.diagResult = '正在运行深度诊断...'
      try {
        const r = await fetch('/__diagnostics')
        if (r.ok) {
          const j = await r.json()
          // 添加客户端信息
          j.client = {
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            time: new Date().toLocaleString()
          }
          this.diagResult = JSON.stringify(j, null, 2)
        } else {
          this.diagResult = `诊断接口返回错误: ${r.status}`
        }
      } catch (e) {
        this.diagResult = `诊断失败: ${e.message}`
      }
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
  },
}
</script>

<style>
.ant-drawer-header {
  background-color: transparent;
}
.ant-drawer .ant-drawer-content {
  background-image: url('@/assets/images/pop-header-bg.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
}
</style>
<style lang="less" scoped>
.full-height-spin {
  height: 100vh;
  /deep/ .ant-spin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
/deep/ .ant-page-header-heading {
  display: none;
}
/deep/ .ant-pro-page-header-wrap-children-content {
  margin: 0;
}
.flex-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.tools {
  width: 100%;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
}
.flex-row-spacebetween {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tools .flex:last-child {
  margin-left: auto;
}
.sys-title {
  font-size: 22px;
  font-weight: bold;
  color: #000;
}
.btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(240, 246, 254);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    &.ai-bold-font{
      font-weight: bold;
      color: #7e9cea;
    }
  }
  span {
    margin-top: 4px;
    font-size: 12px;
  }
}
.editor-container {
  flex: 1;
  width: 100%;
  position: relative;
}

.left-content,
.right-content {
  height: 100%;
  width: 300px;
  transition: width 0.3s ease;
  border-right: 1px solid #e8e8e8;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  min-height: 0;
}
.left-content {
  z-index: 1;
  &.close-body {
    width: 0;
  }
}
.collpase-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 1;
  cursor: pointer;
  &.turn-around {
    position: absolute;
    transform: translate(50%, -50%);
    transform: rotate(180deg);
    transition: all 0.3s ease-in-out;
  }
}
.right-content {
  width: 0;
  transition: all 0.3s ease-in-out;
  min-width: 0;
}
.open-right {
  width: calc(40% - 80px) !important;
  transition: all 0.3s ease-in-out;
}
.open-right-five {
  width: 50% !important;
  transition: all 0.3s ease-in-out;
}
.right-title {
  justify-content: space-between;
  align-items: center;
  height: 45px;
  border-bottom: 1px solid #e8e8e8;
}

.list-collapsed {
  width: 0px;
}
.content-item {
  margin: 10px 12px;
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .limit-title {
    font-size: 16px;
    font-weight: bold;
    img {
      margin-right: 10px;
      width: 22px;
      height: 22px;
    }
  }
  .code {
    font-size: 12px;
    color: #999;
  }
}
.detail-content {
  margin: 10px 0;
  border-radius: 5px;
  background-color: #fff;
  .customer-info {
    margin-left: 8px;
  }
  .card-box {
    align-items: center;
    padding-bottom: 4px;
    margin-bottom: 4px;
    border-bottom: 1px solid #ccc;
  }
}
.customer-data-info {
  align-items: center;

  .d-info {
    text-align: center;
    font-size: 12px;
    color: #797e87;
    padding: 8px 0;
    &:first-of-type {
      background-color: #f1f6fe;
      .num {
        font-size: 14px;
        color: #4a7ce2;
        font-weight: bold;
      }
    }
    &:nth-of-type(2) {
      background-color: #f2fdf5;
      .num {
        font-size: 14px;
        color: #62ba6f;
        font-weight: bold;
      }
    }
    &:last-of-type {
      background-color: #faf5fe;
      .num {
        font-size: 14px;
        color: #9c59ee;
        font-weight: bold;
      }
    }
  }
}
.table-show {
  margin: 10px 0;
  background-color: #f9f5fe;
  border: 1px solid #e6d6fc;
  border-radius: 5px;
  padding: 8px;

  &:first-of-type {
    margin-top: 0;
  }
  &:last-of-type {
    margin-bottom: 0;
  }
  .table-name {
    font-size: 14px;
    font-weight: bold;
    color: #000;
  }
  .time {
    color: #717682;
    font-size: 12px;
  }
}
.finished-content {
  background-color: #f2fdf5;
  border: 1px solid #c7f5d3;
}
.update-btn {
  border-radius: 5px;
  font-size: 12px;
  background-color: #4781ea;
  letter-spacing: 0;
  word-spacing: 0;
  &.org-btn {
    margin-left: 5px;
    background-color: #ff9800;
    border: 1px solid #ff9800;
  }
}
.container-detail {
  position: relative;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  .close-item {
    position: absolute;
    right: 10px;
    top: 10px;
  }
}
.config-title {
  font-family: PingFangSC-Semibold;
  font-size: 16px;
  color: #000103;
  letter-spacing: 0;
  font-weight: 600;
}

.set-name {
  padding: 80px 20px 40px;
  .set-name-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
}
/deep/.ant-collapse-content > .ant-collapse-content-box {
  padding: 5px;
}
.view-page-pop {
  width: 80vw;
  height: 80vh;
  background-color: #fff;
}
</style>
