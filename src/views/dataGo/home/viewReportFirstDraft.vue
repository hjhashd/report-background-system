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
  <a-spin :spinning="pageLoading">
    <div ref="reportViewDetail" class="page-content flex-col" style="padding: 0; width: 100%">
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
              <span>{{ editableMode ? '退出编辑' : '进入编辑' }}</span>
            </template>
            <div class="btn-item" @click="toggleEditMode">
              <div class="icon-box">
                <a-icon style="color: #5787ee" :type="editableMode ? 'lock' : 'edit'" />
              </div>
            </div>
          </a-tooltip>
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
          <div v-if="showRightType == 'ai-save'">
            <AiContentGenerate
              :firstDraftId="currentChose"
              :templateId="templateId"
              :chapterId="reportId"
              :editorHeight="editorHeight"
              @close="() => (showRightType = '')"
              @updateTemplateContent="updateEdit"
            ></AiContentGenerate>
          </div>
          <div v-else-if="showRightType == 'ai-search'">
            <DraftRightAISearch
              :firstDraftId="currentChose"
              :templateId="templateId"
              :chapterId="reportId"
              :editorHeight="editorHeight"
              :categoryId="categoryId"
              :reportType="reportType"
              @close="() => (showRightType = '')"
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
            />
          </div>
        </div>
      </div>

      <a-modal
        class="qr-modal"
        v-model="setReportName"
        :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
        :maskClosable="false"
        @ok="resetReportFun"
        @cancel="setReportName = false"
      >
        <div class="set-name">
          <div class="set-name-title">{{ popTitle }}</div>
          <a-input allowClear size="large" v-model="otherSaveReportName"></a-input>
        </div>
      </a-modal>
      <!-- 打开弹窗 -->
      <a-modal
        class="view-page-pop"
        v-model="openDataYC"
        width="80vw"
        :bodyStyle="{ height: '80vh', padding: 0, backgroundColor: 'transparent' }"
        :footer="null"
      >
        <anomaly-content :customerDetail="customerDetail"></anomaly-content>
      </a-modal>
      <a-modal :footer="null" v-model="udt" title="数据更新提醒">
        <div class="update-item-line" v-for="item in uploadTableList" :key="item.id">
          <span class="update-item-title">{{ item.tableNameC }}</span>
          <span class="update-item-time">{{ item.changeTime }}</span>
        </div>
      </a-modal>
    </div>
  </a-spin>
  <!-- </page-header-wrapper> -->
</template>

<script>
import { mapActions } from 'vuex'
import { OnlyOfficeEditorFD } from '@/components'
import { debounce } from '@/utils/util'
import AiContentGenerate from './components/draftRightAISave.vue'
import DraftRightAISearch from './components/draftRightAISearch.vue'
import FileSelectPanel from './components/fileSelectPanel.vue'
import { mergeTemplate } from '@/api/report'

export default {
  name: 'addReport',
  components: {
    OnlyOfficeEditorFD,
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
    this.docUrl = (this.$route.query && this.$route.query.docUrl) || ''
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
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        this.editorHeight = viewportHeight - 170 + 'px'
      })
    },
    openRight(type) {
      this.showRightType = type
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
          mergeTemplate(this.reportId).then((res) => {
            if (res.code != 200) {
              this.pageLoading = false
              $notification['error']({
                message: '错误通知：',
                description: res.msg,
                duration: 8,
              })
            } else {
              $notification['success']({
                message: '通知：',
                description: `正在生成，请在草稿列表查看进度`,
                duration: 6,
              })
              this.pageLoading = false
              setTimeout(() => {
                $router.push({ path: '/homePage/reportList' })
              }, 500)
            }
          })
        },
      })
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
          description: `已保存为 ${info.meta.physicalName}（仅保存在浏览器）`,
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
      this.diagResult = '...'
      try {
        const host = window.location.host
        const urlHost = `http://${host}${this.docUrl}`
        const r = await fetch(urlHost, { method: 'HEAD' })
        const ok1 = r.ok
        const txt = ok1 ? '前端可访问文件（HEAD 200）' : `前端访问失败 (状态 ${r.status})`
        this.diagResult = `[前端可达测试] ${txt}；[DocServer内部URL] ${this.internalBase}${this.docUrl}`
      } catch (e) {
        this.diagResult = `诊断失败：${e && e.message ? e.message : e}`
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
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0px;
  }
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
}
.open-right {
  width: calc(50% - 150px) !important;
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
