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
            <a-badge
              :offset="[-3, 5]"
              v-if="reportDetail && reportDetail.tableChangeInfos && reportDetail.tableChangeInfos.length"
              :count="reportDetail.tableChangeInfos.length"
            >
              <a-button style="margin-left: 5px" icon="bell" type="link" @click="lookUploadModal(scoped)"></a-button>
            </a-badge>
          </div>
          <div class="flex" v-if="typeFrom !== 'industryReport'">
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
          </div>
        </div>
      </div>
      <div class="flex flex-1" :style="{ height: editorHeight, position: 'relative' }">
        <div
          class="left-content"
          :class="{ 'close-body': isListCollapsed }"
          :style="{ height: editorHeight }"
          v-if="draftTemplateList.length"
        >
          <a-menu mode="inline" :open-keys="templateOptions" :selectedKeys="currentOption" @openChange="onOpenChange">
            <template v-for="item in draftTemplateList">
              <a-menu-item v-if="!item.children.length" :key="item.id" @click="templateChose(item)">
                {{ item.chapterTitle }}
              </a-menu-item>
              <sub-menu v-else :key="item.key" :menu-info="item" @templateChose="templateChose" />
            </template>
          </a-menu>
        </div>
        <div ref="editorContainerRef" class="editor-container" v-if="currentChose">
          <OnlyOfficeEditorFD ref="editorR" :reportId="currentChose" :editorHeight="editorHeight" />
          <div
            @click="() => (isListCollapsed = !isListCollapsed)"
            class="collpase-icon"
            :class="{ 'turn-around': isListCollapsed }"
          >
            <a-icon type="left-circle" theme="filled" />
          </div>
        </div>
        <div
          :class="{
            'open-right': !!showRightType && !isListCollapsed,
            'open-right-five': !!showRightType && isListCollapsed,
          }"
          class="right-content"
          v-if="draftTemplateList.length"
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
              :chapterId="reportId"
              :editorHeight="editorHeight"
              :categoryId="categoryId"
              :reportType="reportType"
              @close="() => (showRightType = '')"
            ></DraftRightAISearch>
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
import AnomalyContent from '../anomaly/innerContent.vue'
import { setDraftStatus, getFirstDraftChapter, mergeTemplate } from '@/api/report'
import { OnlyOfficeEditorFD } from '@/components'
import AiContentGenerate from './components/draftRightAISave.vue'
import DraftRightAISearch from './components/draftRightAISearch.vue'
import EditModal from './editModal.vue'
import { debounce } from '@/utils/util'
import { Menu } from 'ant-design-vue'
import { findFirstTemplateId } from './util'
const SubMenu = {
  template: `
    <a-sub-menu :key="menuInfo.key" v-bind="$props" v-on="$listeners">
      <span slot="title">
        <span>{{ menuInfo.chapterTitle }}</span>
      </span>
      <template v-for="item in menuInfo.children">
        <a-menu-item v-if="!item.children.length" :key="item.id" @click="templateChose(item)">
          <span>{{ item.chapterTitle }}</span>
        </a-menu-item>
        <sub-menu v-else :key="item.id" :menu-info="item"  @templateChose="templateChose"/>
      </template>
    </a-sub-menu>
  `,
  name: 'SubMenu',
  isSubMenu: true,
  props: {
    ...Menu.SubMenu.props,
    menuInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    templateChose(v) {
      this.$emit('templateChose', v)
    },
  },
}

export default {
  name: 'addReport',
  components: {
    OnlyOfficeEditorFD,
    EditModal,
    AnomalyContent,
    AiContentGenerate,
    DraftRightAISearch,
    'sub-menu': SubMenu,
  },
  data() {
    return {
      pageLoading: false,
      editorHeight: null,
      reportId: null,
      reportDetail: null,
      customerDetail: null,
      fullView: false,
      typeFrom: null,
      reportName: null,
      categoryId: null,
      reportType: null,
      setType: null,
      otherSaveReportName: '',
      setReportName: false,
      openDataYC: false,
      popTitle: null,
      udt: false,
      uploadTableList: [],

      // 初稿
      draftTemplateList: [],
      templateOptions: [],
      currentChose: null,
      currentOption: [],
      showRightType: null,
      templateId: null,
      isListCollapsed: false,
    }
  },
  created() {
    this.typeFrom = (this.$route.query && this.$route.query.typeFrom) || ''
    this.reportName = (this.$route.query && this.$route.query.reportName) || ''
    this.categoryId = (this.$route.query && this.$route.query.categoryId) || ''
    this.reportType = (this.$route.query && this.$route.query.reportType) || ''
    this.reportId = this.$route.params.reportId
    this.init()
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
    init() {
      getFirstDraftChapter(this.reportId).then((res) => {
        this.draftTemplateList = res.data
        // 判断树下的第一个templateId
        const firstItem = findFirstTemplateId(res.data)
        this.templateOptions = [firstItem.id]
        this.currentOption = [firstItem.id]
        this.currentChose = firstItem.id
        this.templateId = firstItem.templateId
        this.getinnerBodyHeight()
      })
    },
    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find((key) => this.templateOptions.indexOf(key) === -1)
      if (this.draftTemplateList.findIndex((v) => v.id == latestOpenKey) === -1) {
        this.templateOptions = openKeys
      } else {
        this.templateOptions = latestOpenKey ? [latestOpenKey] : []
      }
    },
    templateChose(item) {
      // 选择模块
      this.currentOption = [item.id]
      this.currentChose = item.id
      this.templateId = item.templateId
    },
    openRight(type) {
      // 右侧抽屉展示内容
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
    updateReportData() {
      // 更新数据
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
              // this.init()
              // this.$refs.editorR.refreshEditor()
              setTimeout(() => {
                // 去草稿
                $router.push({ path: '/homePage/draftList' })
              }, 500)
            }
          })
        },
      })
    },
    resetReportFun() {
      if (this.setType === 'draft') {
        this.saveAsDraft()
      }
    },
    openDataYCFun(v) {
      this.openDataYC = true
    },
    saveAsDraft() {
      const { $notification, $router } = this
      this.pageLoading = true
      this.reportName = null
      setDraftStatus(this.reportDetail.id, this.otherSaveReportName)
        .then((res) => {
          this.pageLoading = false
          this.setReportName = false
          this.$nextTick(() => {
            this.reportName = this.otherSaveReportName
          })
          this.$refs.editorR.refreshEditor()
          $notification['success']({
            message: '通知：',
            description: `${this.otherSaveReportName}，另存为草稿成功`,
            duration: 6,
          })
          setTimeout(() => {
            // 去草稿
            $router.push({ path: '/homePage/draftList' })
          }, 500)
        })
        .catch((err) => {
          this.pageLoading = false
          $notification['error']({
            message: '通知：',
            description: `操作失败：${err}`,
            duration: 6,
          })
        })
    },
    updateEdit() {
      this.$refs.editorR.refreshEditor()
    },
    lookUploadModal(v) {
      this.uploadTableList = this.reportDetail.tableChangeInfos
      this.udt = true
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