<template>
  <div class="report-management-container">
    <div class="header">
      <div class="header-title">🌿 智能报告生成系统</div>
      <div class="header-user">
        <span>👤 {{ overview.userName || '用户' }}</span>
      </div>
    </div>

    <div class="breadcrumb">
      智能报告生成 <span>/</span> 撰写报告 <span>/</span> 草稿列表
    </div>

    <!-- 主容器 -->
    <div class="main-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-radio-group
            v-model="currentView"
            @change="onViewChange"
            style="margin-right: 12px"
          >
            <a-radio-button value="drafts">草稿箱</a-radio-button>
            <a-radio-button value="reports">报告列表</a-radio-button>
          </a-radio-group>
          <a-select
            v-model="draftTypeSelected"
            placeholder="报告类型"
            class="styled-select"
            style="width: 180px"
            @change="selectChange"
            :allowClear="true"
          >
            <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
              {{ item.name }}
            </a-select-option>
          </a-select>

          <a-select
            v-model="draftStatus"
            placeholder="报告状态"
            class="styled-select"
            style="width: 180px"
            @change="selectChange"
            :allowClear="true"
          >
            <a-select-option v-for="item in draftStatusList" :key="item.type" :value="item.type">
              {{ item.name }}
            </a-select-option>
          </a-select>

          <a-range-picker
            v-model="dateRange"
            style="margin-left: 12px; width: 280px"
            @change="selectChange"
          />

          <a-select
            v-model="sortBy"
            placeholder="排序字段"
            class="styled-select"
            style="width: 160px; margin-left: 12px"
            @change="selectChange"
          >
            <a-select-option value="createdAt">时间</a-select-option>
            <a-select-option value="reportName">名称</a-select-option>
            <a-select-option value="reportType">类型</a-select-option>
            <a-select-option value="genStatus">状态</a-select-option>
          </a-select>
          <a-select
            v-model="sortOrder"
            placeholder="排序顺序"
            class="styled-select"
            style="width: 140px"
            @change="selectChange"
          >
            <a-select-option value="asc">升序</a-select-option>
            <a-select-option value="desc">降序</a-select-option>
          </a-select>

          <div class="search-wrapper">
            <a-input
              v-model="search"
              placeholder="输入报告名称"
              class="styled-input"
              style="width: 240px"
              @blur="selectChange"
              @pressEnter="selectChange"
              :allowClear="true"
            />
          </div>
        </div>
        <div class="toolbar-right">
          <a-button @click="runDiagnostics" class="btn-default" style="margin-right: 8px">🔍 系统诊断</a-button>
          <a-button type="primary" class="btn-primary" @click="newReport" :disabled="uiDisabled" style="margin-right: 8px">
            ➕ 新建报告
          </a-button>
          <a-button @click="triggerUpload" class="btn-default" style="margin-right: 8px">
            📤 上传 Word 报告
          </a-button>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".doc,.docx"
            @change="handleFileUpload"
          />
          <a-popconfirm title="是否删除已选中的草稿报告?" ok-text="是" cancel-text="否" @confirm="deleteMutil">
            <a-button class="btn-danger">🗑️ 批量删除</a-button>
          </a-popconfirm>
        </div>
      </div>

      <div class="table-container">
        <s-table
          ref="table"
          :rowKey="(record) => record.recordId || record.physicalName"
          :data="loadData"
          :columns="columns"
          :row-selection="{
            selectedRowKeys: expandedRowKeys,
            onChange: rowChange,
          }"
          size="middle"
        >
          <template slot="id" slot-scope="txt, scoped, index">
            {{ (queryParam.pageNum - 1) * queryParam.pageSize + index + 1 }}
          </template>

          <div slot="reportName" slot-scope="text">
            <span class="report-name-text">{{ text }}</span>
          </div>

          <span slot="status" slot-scope="text">
            <span :class="['status-badge', 'status-' + text]">
              {{ text == 0 ? '草稿' : text == 1 ? '已完成' : text == 2 ? '数据未授权' : '数据已授权' }}
            </span>
          </span>

          <template slot="genStatus" slot-scope="text, scoped">
            <div class="status-cell">
              <span v-if="text == 1" class="status-badge status-completed">已完成</span>
              <span v-else-if="text == 0" class="status-badge status-processing">生成中</span>
              <span v-else-if="text == 3" class="status-badge status-updating">更新中</span>
              <span v-else-if="text == 4" class="status-badge status-pending">待配置</span>
              <span class="status-badge status-failed" v-else>生成失败</span>

              <a-badge
                :offset="[-3, 5]"
                v-if="scoped.tableChangeInfos && scoped.tableChangeInfos.length"
                :count="scoped.tableChangeInfos.length"
              >
                <a-button size="small" icon="bell" type="link" @click="lookUploadModal(scoped)"></a-button>
              </a-badge>
              <a-progress v-if="text == 0" :percent="scoped.process" size="small" :strokeColor="primaryColor" />
            </div>
          </template>

          <span slot="reportType" slot-scope="text">
            {{ text == 1 ? '授信调查报告' : text == 2 ? '财务分析报告' : text == 4 ? '环境影响报告' : '能耗分析报告' }}
          </span>

          <template slot="action" slot-scope="text, scoped">
            <div class="action-buttons">
              <a-tooltip v-if="scoped.genStatus != 2" title="查看">
                <a-button
                  type="link"
                  class="action-btn"
                  :disabled="false"
                  @click="handleChat(scoped)"
                >
                  <img src="@/assets/images/see.png" alt="see" />
                </a-button>
              </a-tooltip>

              <a-tooltip v-if="scoped.genStatus == 2" title="重新生成">
                <a-button type="link" class="action-btn" @click="rebuild(scoped)">
                  <img src="@/assets/images/rebuild.png" alt="rebuild" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="是否确定删除该报告?" ok-text="确定" cancel-text="取消" @confirm="deleteChat(scoped)">
                <a-tooltip title="删除">
                  <a-button type="link" class="action-btn action-btn-danger">
                    <img src="@/assets/images/delete.png" alt="delete" />
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </s-table>
      </div>
    </div>

    <!-- 弹窗设计保持 Ant Design 风格但可以微调样式 -->
    <a-modal :footer="null" v-model="udt" title="数据更新提醒" class="styled-modal">
      <div class="update-item-line" v-for="item in uploadTableList" :key="item.id">
        <span class="update-item-title">{{ item.tableNameC }}</span>
        <span class="update-item-time">{{ item.changeTime }}</span>
      </div>
    </a-modal>
    <FirstDraftModals
      :newReportModalVisible="newReportModalVisible"
      :addChapterModalVisible="addChapterModalVisible"
      :templateModalVisible="templateModalVisible"
      :previewModalVisible="previewModalVisible"
      :editChapterModalVisible="editChapterModalVisible"
      :diagModalVisible.sync="diagModalVisible"
      :diagLoading="diagLoading"
      :diagResult="diagResult"
      :window_origin="window_origin"
      :uiDisabled="uiDisabled"
      :newReportForm="newReportForm"
      :chapters="chapters"
      :selectedChapterId="selectedChapterId"
      :addChapterForm="addChapterForm"
      :editChapterForm="editChapterForm"
      :filteredMarketData="filteredMarketData"
      :filteredTemplates="filteredTemplates"
      :selectedTemplate.sync="selectedTemplate"
      :marketSearchKeyword.sync="marketSearchKeyword"
      :templateSearchKeyword.sync="templateSearchKeyword"
      :closeNewReportModal="closeNewReportModal"
      :openAddChapterModal="openAddChapterModal"
      :selectChapter="selectChapter"
      :editChapter="editChapter"
      :deleteChapter="deleteChapter"
      :insertFromMarket="insertFromMarket"
      :loadTemplate="loadTemplate"
      :previewCatalog="previewCatalog"
      :closeAddChapterModal="closeAddChapterModal"
      :closeTemplateModal="closeTemplateModal"
      :confirmLoadTemplate="confirmLoadTemplate"
      :closePreviewModal="closePreviewModal"
      :exportCatalog="exportCatalog"
      :closeEditChapterModal="closeEditChapterModal"
      @create-report="createReport"
      @add-chapter="addChapter"
      @select-template="selectTemplate"
      @confirm-load-template="confirmLoadTemplate"
      @export-catalog="exportCatalog"
    />
  </div>
</template>

<script>
const reportTypeList = [
  {
    type: 1,
    name: '授信调查报告',
  },
  {
    type: 2,
    name: '财务分析报告',
  },
  {
    type: 3,
    name: '能耗分析报告',
  },
  {
    type: 4,
    name: '环境影响报告',
  },
]
const draftStatusList = [
  {
    type: 1,
    name: '已完成',
  },
  {
    type: 0,
    name: '生成中',
  },
  {
    type: 3,
    name: '更新中',
  },
  {
    type: 4,
    name: '待配置',
  },
  {
    type: 2,
    name: '生成失败',
  },
]

import mockData from './mockData.json'
import { mapState } from 'vuex'
import { STable } from '@/components'
import md5 from 'md5'
import { baseMixin } from '@/store/app-mixin'
import FirstDraftModals from './components/FirstDraftModals.vue'
import get from 'lodash.get'
import { applyFilters } from '@/utils/jsonFilter'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    STable,
    FirstDraftModals,
  },
  data() {
    return {
      loading: true,
      uiDisabled: false,
      udt: false,
      columns: [
        {
          title: '序号',
          dataIndex: 'id',
          key: 'id',
          width: '80px',
          scopedSlots: { customRender: 'id' },
        },
        {
          title: '报告名称',
          dataIndex: 'reportName',
          key: 'reportName',
          scopedSlots: { customRender: 'reportName' },
        },
        {
          title: '报告类型',
          dataIndex: 'reportType',
          key: 'reportType',
          width: '140px',
          scopedSlots: { customRender: 'reportType' },
        },
        {
          title: '智能生成状态',
          dataIndex: 'genStatus',
          key: 'genStatus',
          width: '180px',
          scopedSlots: { customRender: 'genStatus' },
        },
        {
          title: '最后更新时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
        },
        {
          title: '操作',
          key: 'action',
          width: '120px',
          align: 'left',
          scopedSlots: { customRender: 'action' },
        },
      ],
      currentView: 'drafts',
      draftTypeSelected: null,
      draftStatus: null,
      search: null,
      dateRange: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      reportTypeList,
      draftStatusList,
      uploadTableList: [],
      expandedRowKeys: [],
      // 章节数据 (来自 example2.html)
      chapters: [],
      currentEditingParent: null,
      currentEditingLevel: 1,
      selectedChapterId: null,
      editingChapterId: null,
      selectedTemplate: null,
      newReportModalVisible: false,
      addChapterModalVisible: false,
      templateModalVisible: false,
      previewModalVisible: false,
      editChapterModalVisible: false,
      diagModalVisible: false,
      diagLoading: false,
      diagResult: null,
      window_origin: window.location.origin,
      newReportForm: {
        reportName: '',
        reportType: '',
        reportObject: '环境评估',
      },
      addChapterForm: {
        level: '1',
        title: '',
      },
      editChapterForm: {
        title: '',
      },
      marketSearchKeyword: '',
      templateSearchKeyword: '',
      // 章节超市数据
      marketData: {
        项目概述: {
          name: '项目概述',
          usage: 15,
          desc: '项目管理 | 使用次数: 15\n项目基本信息和目标概述',
          children: [],
        },
        进度报告: {
          name: '进度报告',
          usage: 23,
          desc: '项目管理 | 使用次数: 23\n项目进度和里程碑追踪',
          children: [],
        },
        风险分析: {
          name: '风险分析',
          usage: 18,
          desc: '项目管理 | 使用次数: 18\n项目风险识别与应对措施',
          children: [],
        },
        环境现状分析: {
          name: '环境现状分析',
          usage: 42,
          desc: '环境评估 | 使用次数: 42\n区域环境质量现状调查与分析',
          children: ['区域环境概况', '环境质量现状', '主要环境问题'],
        },
        环境影响评估: {
          name: '环境影响评估',
          usage: 38,
          desc: '环境评估 | 使用次数: 38\n项目对环境各要素的影响分析',
          children: ['大气环境影响', '水环境影响', '声环境影响', '固体废物影响'],
        },
        污染防治措施: {
          name: '污染防治措施',
          usage: 35,
          desc: '环境评估 | 使用次数: 35\n污染物治理和环保措施',
          children: ['废气治理', '废水处理', '噪声控制', '固废处置'],
        },
        环境监测方案: {
          name: '环境监测方案',
          usage: 56,
          desc: '环境监测 | 使用次数: 56\n环境质量监测计划与实施',
          children: ['监测点位布设', '监测指标选择', '监测频次安排'],
        },
        生态保护措施: {
          name: '生态保护措施',
          usage: 48,
          desc: '生态保护 | 使用次数: 48\n生态系统保护与恢复方案',
          children: ['植被保护', '水土保持', '生物多样性保护'],
        },
        环保验收标准: {
          name: '环保验收标准',
          usage: 45,
          desc: '环保验收 | 使用次数: 45\n环境保护设施验收规范',
          children: ['验收条件', '验收程序', '验收标准'],
        },
      },
      // 模板数据
      templates: {
        环境评估报告: [
          { title: '环境现状分析', children: ['区域环境概况', '环境质量现状', '主要环境问题'] },
          { title: '环境影响评估', children: ['大气环境影响', '水环境影响', '声环境影响', '固体废物影响'] },
          { title: '污染防治措施', children: ['废气治理', '废水处理', '噪声控制', '固废处置'] },
          { title: '环境监测方案', children: ['监测点位布设', '监测指标', '监测频次'] },
          { title: '应急预案', children: ['应急组织体系', '应急响应程序', '应急保障措施'] },
          { title: '结论与建议', children: [] },
        ],
        环境影响报告: [
          { title: '项目概况', children: ['项目基本情况', '建设内容', '工程分析'] },
          { title: '环境现状调查', children: ['自然环境', '环境质量现状', '生态环境'] },
          { title: '环境影响预测', children: ['大气影响预测', '水影响预测', '声影响预测', '固废影响分析'] },
          { title: '环保措施', children: ['污染防治', '生态保护', '环境管理'] },
          { title: '环境经济损益分析', children: ['环保投资估算', '经济效益', '社会效益'] },
          { title: '环境监理与验收', children: ['施工期监理', '竣工验收', '后评价'] },
        ],
        项目管理报告: [
          { title: '项目概述', children: ['项目背景', '项目目标', '项目范围'] },
          { title: '进度报告', children: ['完成情况', '里程碑', '时间线'] },
          { title: '风险分析', children: ['风险识别', '风险评估', '应对措施'] },
          { title: '资源管理', children: ['人力资源', '财务资源', '物资资源'] },
          { title: '质量管理', children: ['质量标准', '质量控制', '质量保证'] },
        ],
        环境监测报告: [
          { title: '监测概述', children: ['监测目的', '监测依据', '监测范围'] },
          { title: '监测方案', children: ['监测点位', '监测项目', '监测频次'] },
          { title: '监测结果', children: ['大气监测结果', '水质监测结果', '噪声监测结果'] },
          { title: '结果评价', children: ['达标情况', '超标分析', '变化趋势'] },
          { title: '建议措施', children: ['污染控制建议', '监测改进建议', '后续监测计划'] },
        ],
        环保合规报告: [
          { title: '合规概述', children: ['法律法规', '标准规范', '政策要求'] },
          { title: '合规检查', children: ['环保手续', '排放许可', '环保设施'] },
          { title: '问题分析', children: ['存在问题', '原因分析', '风险评估'] },
          { title: '整改方案', children: ['整改措施', '整改计划', '责任落实'] },
          { title: '持续改进', children: ['管理体系', '培训计划', '监督机制'] },
        ],
      },
      // 查询参数
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
      },
      loadData: null,
    }
  },
  filters: {
    dealTime(minutes) {
      const oneDay = 24 * 60
      const oneHour = 60

      const days = Math.floor(minutes / oneDay)
      const remainingMinutes = minutes % oneDay
      const hours = Math.floor(remainingMinutes / oneHour)
      const mins = remainingMinutes % oneHour

      let str = ''
      str += days ? `${days} 天 ` : ''
      str += hours ? `${hours} 小时 ` : ''
      str += mins ? `${mins} 分钟` : ''

      return str || '0 分钟'
    },
  },
  computed: {
    ...mapState({
      overview: (state) => state.user.overview,
    }),
    filteredMarketData() {
      const keyword = this.marketSearchKeyword.toLowerCase()
      if (!keyword) return Object.values(this.marketData)
      return Object.values(this.marketData).filter(
        (item) => item.name.toLowerCase().includes(keyword) || item.desc.toLowerCase().includes(keyword)
      )
    },
    filteredTemplates() {
      const keyword = this.templateSearchKeyword.toLowerCase()
      const list = Object.keys(this.templates).map((name) => ({
        name,
        data: this.templates[name],
      }))
      if (!keyword) return list
      return list.filter((item) => item.name.toLowerCase().includes(keyword))
    },
  },
    created() {
      // 初始化 loadData 函数，避免在 data() 中使用 this
      const qv = (this.$route && this.$route.query && this.$route.query.view) || ''
      this.currentView = qv === 'reports' ? 'reports' : 'drafts'
      this.loadData = (parameter) => {
        const req = Object.assign({}, this.queryParam, parameter, {
          pageNum: parameter.pageNo,
        })
        if (parameter.pageSize !== this.queryParam.pageSize) {
          req.pageNo = 1
          req.pageNum = 1
        }
        this.queryParam = JSON.parse(JSON.stringify(req))
        return new Promise(async (resolve) => {
          let marker = {}
          try {
            const r = await fetch(`/local-storage/drafts/modal_marker.json?t=${Date.now()}`)
            if (r.ok) {
              const j = await r.json()
              if (j && typeof j === 'object') marker = j
            }
          } catch (e) {}
          const toTypeNumber = (title, rawType) => {
            const nameHasEnv = /环境|影响/.test(String(title || ''))
            if (nameHasEnv) return 4
            if (typeof rawType === 'number') return rawType
            const map = { '授信调查报告': 1, '财务分析报告': 2, '能耗分析报告': 3, '环境影响报告': 4 }
            if (typeof rawType === 'string') return map[rawType] || 1
            return 1
          }
          const jsonList = this.currentView === 'reports' ? (marker.formalReports || []) : (marker.draftReports || [])
          const jsonRows = jsonList.map(item => {
            const ph = item.physicalName || ''
            const ft = ph ? String(ph).split('.').pop().toLowerCase() : 'doc'
            return {
              id: item.id,
              reportName: item.title,
              reportType: toTypeNumber(item.title, item.type),
              genStatus: item.status === 'published' ? 1 : 4,
              updateTime: this.formatTime(item.createTime),
              createdAt: item.createTime,
              physicalName: ph,
              fileType: ft,
              recordId: item.id,
              size: 0,
              isLocal: true
            }
          })
          const presetList = this.currentView === 'reports' ? (mockData.formalReports || []) : (mockData.draftReports || [])
          const presetRows = presetList.map(item => {
            return {
              id: item.id,
              reportName: item.title,
              reportType: toTypeNumber(item.title, item.type),
              genStatus: item.status === 'published' ? 1 : 4,
              updateTime: this.formatTime(item.createTime),
              createdAt: item.createTime,
              physicalName: `${item.id}.docx`,
              fileType: 'docx',
              recordId: item.id,
              size: 0,
              isLocal: false
            }
          })
          const rowsAll = [...jsonRows, ...presetRows]

          let startMs = null
          let endMs = null
          if (Array.isArray(this.dateRange) && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            try {
              startMs = this.dateRange[0].valueOf()
              endMs = this.dateRange[1].valueOf()
            } catch (e) {
              this.$notification['warning']({ message: '提示', description: '日期范围无效', duration: 3 })
            }
          }
          const equals = {}
          if (this.draftTypeSelected) equals['reportType'] = this.draftTypeSelected
          if (this.draftStatus !== null && this.draftStatus !== undefined && this.draftStatus !== '') equals['genStatus'] = this.draftStatus
          const ranges = {}
          if (startMs != null || endMs != null) ranges['createdAt'] = [startMs, endMs]
          const res = applyFilters(rowsAll, {
            text: this.search,
            textFields: ['reportName'],
            equals,
            ranges,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            page: req.pageNum,
            pageSize: req.pageSize
          })
          const total = res.total
          const pageRows = res.data.map((r, idx) => {
            return {
              id: (req.pageNum - 1) * req.pageSize + idx + 1,
              reportName: r.reportName,
              reportType: r.reportType || 2,
              genStatus: r.genStatus != null ? r.genStatus : 1,
              updateTime: r.updateTime || this.formatTime(r.createdAt),
              physicalName: r.physicalName,
              fileType: r.fileType,
              recordId: r.recordId,
              size: r.size,
              isLocal: r.isLocal,
              docUrl: r.docUrl
            }
          })
          resolve({
            pageSize: req.pageSize,
            pageNo: req.pageNum,
            totalCount: total,
            totalPage: Math.ceil(total / req.pageSize),
            data: pageRows,
          })
        })
      }
    },
    methods: {
    newReport() {
      this.openNewReportModal()
    },
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    async handleFileUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      const { $notification, $router } = this
      const loading = this.$message.loading('正在上传文件...', 0)

      try {
        // 1. 读取文件内容并转为 base64
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // 2. 上传文件到 word_upload 目录
        const uploadPath = `public/local-storage/word_upload/${file.name}`
        const uploadResp = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: uploadPath, content }),
        })

        if (!uploadResp.ok) throw new Error('文件上传失败')

        // 3. 更新 modal_marker.json
        const markerUrl = '/local-storage/drafts/modal_marker.json'
        let marker = { draftReports: [], formalReports: [] }
        try {
          const r = await fetch(markerUrl + '?t=' + Date.now())
          if (r.ok) marker = await r.json()
        } catch (err) {}

        const newId = `upload-${Date.now()}`
        const plainTitle = file.name.replace(/\.[^/.]+$/, "")
        const nameHasEnv = /环境|影响/.test(plainTitle)
        const typeStr = nameHasEnv ? '环境影响报告' : '授信调查报告'
        const newReport = {
          id: newId,
          title: plainTitle,
          type: typeStr,
          createTime: Date.now(),
          status: 'draft',
          physicalName: `/local-storage/word_upload/${file.name}` // 存储完整路径以供 handleChat 使用
        }

        marker.draftReports.unshift(newReport)

        const markerContent = await new Promise((resolve) => {
          const blob = new Blob([JSON.stringify(marker, null, 2)], { type: 'application/json' })
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result.split(',')[1])
          fr.readAsDataURL(blob)
        })

        const markerResp = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'local-storage/drafts/modal_marker.json', content: markerContent }),
        })

        if (!markerResp.ok) throw new Error('更新索引文件失败')

        loading()
        $notification['success']({
          message: '上传成功',
          description: `文件 ${file.name} 已成功上传并添加到草稿列表`,
        })

        // 4. 刷新表格
        this.$refs.table.refresh()

        // 5. 自动打开编辑器
        const fileType = file.name.split('.').pop().toLowerCase()
        $router.push({
          path: `/homePage/viewReportFirstDraft/${newId}`,
          query: { 
            reportName: newReport.title, 
            fileType, 
            docUrl: newReport.physicalName 
          },
        })

      } catch (err) {
        loading()
        console.error('Upload error:', err)
        $notification['error']({
          message: '上传失败',
          description: err.message,
        })
      } finally {
        // 重置 input 以便下次选择同一文件也能触发 change
        e.target.value = ''
      }
    },
    onViewChange() {
      this.$refs.table && this.$refs.table.refresh(true)
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    async runDiagnostics() {
      this.diagModalVisible = true
      this.diagLoading = true
      this.diagResult = null
      try {
        const r = await fetch('/__diagnostics')
        if (r.ok) {
          const data = await r.json()
          // 添加客户端信息
          data.client = {
            origin: window.location.origin,
            userAgent: navigator.userAgent,
            time: new Date().toLocaleString()
          }
          this.diagResult = data
        } else {
          this.diagResult = { error: `诊断接口返回错误: ${r.status}` }
        }
      } catch (e) {
        this.diagResult = { error: `诊断失败: ${e.message}` }
      } finally {
        this.diagLoading = false
      }
    },
    async handleChat(v) {
      const { $router } = this
      let fileType = (v.fileType || '').toLowerCase()
      if (v.isLocal) {
        if (!fileType && v.physicalName) {
          fileType = String(v.physicalName).split('.').pop().toLowerCase()
        }
        if (!fileType) fileType = 'doc'
      } else {
        if (!fileType && v.physicalName) {
          fileType = String(v.physicalName).split('.').pop().toLowerCase()
        }
        if (!fileType) fileType = 'docx'
      }

      let docUrl = ''
      // 强制默认加载指定的文档
      const DEFAULT_DRAFT_DOC = '/local-storage/drafts/广东智环创新环境科技有限公司知识智库搭建-需求-终稿.doc'
      
      if (v.isLocal) {
        // 如果 physicalName 已经是完整路径则直接使用，否则根据规则拼接
        if (v.physicalName.startsWith('/local-storage/')) {
          docUrl = v.physicalName
        } else if (v.physicalName.includes('word_upload')) {
          docUrl = `/local-storage/word_upload/${v.physicalName}`
        } else {
          // 默认加载指定的文档
          docUrl = DEFAULT_DRAFT_DOC
        }
      } else {
        docUrl = DEFAULT_DRAFT_DOC
      }

      $router.push({
        path: `/homePage/viewReportFirstDraft/` + (v.recordId || md5(v.physicalName || '')),
        query: { reportName: v.reportName, fileType, docUrl },
      })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    rowChange(_, selectedRows) {
      this.expandedRowKeys = selectedRows.map((u) => u.recordId || u.physicalName)
    },
    async deleteMutil() {
      const { $notification } = this
      if (!this.expandedRowKeys.length) {
        $notification['info']({
          message: '通知：',
          description: '未选中删除项',
          duration: 8,
        })
        return
      }

      try {
        const url = '/local-storage/drafts/modal_marker.json'
        let marker = { draftReports: [], formalReports: [] }
        const r = await fetch(url + '?t=' + Date.now())
        if (r.ok) {
          marker = await r.json()
        }

        const idsToDelete = new Set(this.expandedRowKeys.map(k => String(k)))
        
        if (Array.isArray(marker.draftReports)) {
          marker.draftReports = marker.draftReports.filter(item => !idsToDelete.has(String(item.id)))
        }
        if (Array.isArray(marker.formalReports)) {
          marker.formalReports = marker.formalReports.filter(item => !idsToDelete.has(String(item.id)))
        }

        const blob = new Blob([JSON.stringify(marker, null, 2)], { type: 'application/json' })
        const content = await new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result.split(',')[1] || '')
          fr.readAsDataURL(blob)
        })

        const resp = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'local-storage/drafts/modal_marker.json', content }),
        })

        if (resp.ok) {
          $notification['success']({
            message: '通知：',
            description: '删除成功',
            duration: 8,
          })
          this.expandedRowKeys = []
          this.$refs.table.refresh()
        } else {
          throw new Error('删除失败')
        }
      } catch (e) {
        $notification['error']({
          message: '错误',
          description: '批量删除失败: ' + e.message,
        })
      }
    },
    async deleteChat(v) {
      const { $notification } = this
      if (!v.isLocal) {
        $notification['info']({
          message: '提示',
          description: '系统预设报告不支持删除',
        })
        return
      }

      try {
        const url = '/local-storage/drafts/modal_marker.json'
        let marker = { draftReports: [], formalReports: [] }
        const r = await fetch(url + '?t=' + Date.now())
        if (r.ok) {
          marker = await r.json()
        }

        const targetId = String(v.recordId)
        if (Array.isArray(marker.draftReports)) {
          marker.draftReports = marker.draftReports.filter(item => String(item.id) !== targetId)
        }
        if (Array.isArray(marker.formalReports)) {
          marker.formalReports = marker.formalReports.filter(item => String(item.id) !== targetId)
        }

        const blob = new Blob([JSON.stringify(marker, null, 2)], { type: 'application/json' })
        const content = await new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result.split(',')[1] || '')
          fr.readAsDataURL(blob)
        })

        const resp = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'local-storage/drafts/modal_marker.json', content }),
        })

        if (resp.ok) {
          $notification['success']({
            message: '通知：',
            description: '删除成功',
            duration: 8,
          })
          this.$refs.table.refresh()
        } else {
          throw new Error('写入文件失败')
        }
      } catch (e) {
        $notification['error']({
          message: '错误',
          description: '删除失败: ' + e.message,
        })
      }
    },
    lookUploadModal(v) {
      this.uploadTableList = v.tableChangeInfos
      this.udt = true
    },
    rebuild(v) {},
    // --- example2.html 迁移的方法 ---
    openNewReportModal() {
      this.newReportModalVisible = true
      this.newReportForm = {
        reportName: '',
        reportType: '',
        reportObject: '环境评估',
      }
      this.chapters = []
    },
    closeNewReportModal() {
      this.newReportModalVisible = false
    },
    selectChapter(id) {
      this.selectedChapterId = id
      this.$notification['success']({
        message: '提示',
        description: '已选中,可从超市导入章节到此章节下',
        duration: 2,
      })
    },
    insertFromMarket(name) {
      const item = this.marketData[name]
      if (!item) return

      const id = Date.now()
      const chapter = {
        id: id,
        title: item.name,
        level: 1,
        children: [],
      }

      // 添加子章节
      item.children.forEach((childTitle, idx) => {
        chapter.children.push({
          id: id + idx + 1,
          title: childTitle,
          level: 2,
          parentId: id,
          children: [],
        })
      })

      // 如果有选中的章节,导入到该章节下
      if (this.selectedChapterId) {
        const parent = this.findChapterById(this.selectedChapterId)
        if (parent) {
          chapter.parentId = this.selectedChapterId
          chapter.level = parent.level + 1

          // 更新子章节的level
          chapter.children.forEach((child) => {
            child.level = chapter.level + 1
          })

          parent.children.push(chapter)
          this.$notification['success']({
            message: '通知',
            description: `已将 "${name}" 导入到 "${parent.title}" 下`,
          })
        } else {
          this.chapters.push(chapter)
          this.$notification['success']({
            message: '通知',
            description: `已导入 "${name}" 为顶级章节`,
          })
        }
        this.selectedChapterId = null
      } else {
        // 没有选中,作为顶级章节
        this.chapters.push(chapter)
        this.$notification['success']({
          message: '通知',
          description: `已导入 "${name}" 为顶级章节`,
        })
      }
    },
    openAddChapterModal(level, parentId) {
      this.currentEditingLevel = level
      this.currentEditingParent = parentId
      this.addChapterForm = {
        level: String(level),
        title: '',
      }
      this.addChapterModalVisible = true
    },
    closeAddChapterModal() {
      this.addChapterModalVisible = false
    },
    findChapterById(id) {
      const searchRecursive = (list, targetId) => {
        for (const item of list) {
          if (item.id === targetId) return item
          if (item.children && item.children.length > 0) {
            const found = searchRecursive(item.children, targetId)
            if (found) return found
          }
        }
        return null
      }
      return searchRecursive(this.chapters, id)
    },
    addChapter() {
      const { title, level } = this.addChapterForm
      if (!title.trim()) {
        this.$notification['error']({ message: '错误', description: '请输入章节标题' })
        return
      }

      const newChapter = {
        id: Date.now(),
        title: title.trim(),
        level: parseInt(level),
        children: [],
      }

      if (this.currentEditingParent) {
        const parent = this.findChapterById(this.currentEditingParent)
        if (parent) {
          newChapter.parentId = this.currentEditingParent
          parent.children.push(newChapter)
        }
      } else {
        this.chapters.push(newChapter)
      }

      this.closeAddChapterModal()
      this.$notification['success']({ message: '通知', description: '章节添加成功' })
    },
    editChapter(id) {
      const chapter = this.findChapterById(id)
      if (!chapter) return

      this.editingChapterId = id
      this.editChapterForm.title = chapter.title
      this.editChapterModalVisible = true
    },
    closeEditChapterModal() {
      this.editChapterModalVisible = false
      this.editingChapterId = null
    },
    confirmEditChapter() {
      const newTitle = this.editChapterForm.title.trim()
      if (!newTitle) {
        this.$notification['error']({ message: '错误', description: '请输入章节标题' })
        return
      }

      const chapter = this.findChapterById(this.editingChapterId)
      if (chapter) {
        chapter.title = newTitle
        this.$notification['success']({ message: '通知', description: '章节已更新' })
      }
      this.closeEditChapterModal()
    },
    deleteChapter(id) {
      const chapter = this.findChapterById(id)
      if (!chapter) return

      const countAllChildren = (c) => {
        let count = 0
        if (c.children && c.children.length > 0) {
          count += c.children.length
          c.children.forEach((child) => {
            count += countAllChildren(child)
          })
        }
        return count
      }

      const childrenCount = countAllChildren(chapter)
      let confirmMsg = `确定要删除章节 "${chapter.title}" 吗?`
      if (childrenCount > 0) {
        confirmMsg = `确定要删除章节 "${chapter.title}" 及其 ${childrenCount} 个子章节吗?`
      }

      if (!confirm(confirmMsg)) return

      const removeRecursive = (list, targetId) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === targetId) {
            list.splice(i, 1)
            return true
          }
          if (list[i].children && list[i].children.length > 0) {
            if (removeRecursive(list[i].children, targetId)) return true
          }
        }
        return false
      }

      removeRecursive(this.chapters, id)
      this.$notification['success']({ message: '通知', description: '章节已删除' })
    },
    loadTemplate() {
      this.templateModalVisible = true
      this.templateSearchKeyword = ''
      if (!this.selectedTemplate) {
        const names = Object.keys(this.templates || {})
        this.selectedTemplate = names.length ? names[0] : null
      }
    },
    closeTemplateModal() {
      this.templateModalVisible = false
    },
    selectTemplate(templateName) {
      this.selectedTemplate = templateName
    },
    confirmLoadTemplate() {
      if (!this.selectedTemplate) {
        this.$notification['error']({ message: '错误', description: '请先选择一个模板' })
        return
      }

      if (this.chapters.length > 0 && !confirm('当前已有章节配置,是否要替换为模板内容?')) {
        return
      }

      const template = this.templates[this.selectedTemplate]
      this.chapters = []

      template.forEach((item, idx) => {
        const id = Date.now() + idx * 100
        const chapter = {
          id: id,
          title: item.title,
          level: 1,
          children: [],
        }

        item.children.forEach((childTitle, childIdx) => {
          chapter.children.push({
            id: id + childIdx + 1,
            title: childTitle,
            level: 2,
            parentId: id,
            children: [],
          })
        })

        this.chapters.push(chapter)
      })

      this.closeTemplateModal()
      this.$notification['success']({ message: '通知', description: `已加载 "${this.selectedTemplate}" 模板` })
    },
    previewCatalog() {
      if (this.chapters.length === 0) {
        this.$notification['error']({ message: '错误', description: '请先添加章节' })
        return
      }
      this.previewModalVisible = true
    },
    closePreviewModal() {
      this.previewModalVisible = false
    },
    exportCatalog() {
      let text = '报告目录\n\n'
      const generateText = (list, prefix = '') => {
        list.forEach((item, idx) => {
          const currentPrefix = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`
          text += `${currentPrefix} ${item.title}\n`
          if (item.children && item.children.length > 0) {
            generateText(item.children, currentPrefix)
          }
        })
      }
      generateText(this.chapters)

      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '报告目录.txt'
      a.click()
      URL.revokeObjectURL(url)
      this.$notification['success']({ message: '通知', description: '目录已导出' })
    },
    async createReport() {
      const { reportName, reportType } = this.newReportForm
      if (!reportName.trim()) {
        this.$notification['error']({ message: '错误', description: '请输入报告名称' })
        return
      }
      if (!reportType) {
        this.$notification['error']({ message: '错误', description: '请选择报告类型' })
        return
      }
      // 允许零章节创建记录
      try {
        const url = '/local-storage/drafts/modal_marker.json'
        let marker = { draftReports: [], formalReports: [] }
        try {
          const r = await fetch(url)
          if (r.ok) {
            const j = await r.json()
            if (j && typeof j === 'object') marker = j
          }
        } catch (e) {}
        if (!Array.isArray(marker.draftReports)) marker.draftReports = []
        const ts = Date.now()
        const pad = (n) => String(n).padStart(2, '0')
        const d = new Date(ts)
        const y = d.getFullYear()
        const m = pad(d.getMonth() + 1)
        const day = pad(d.getDate())
        const hh = pad(d.getHours())
        const mm = pad(d.getMinutes())
        const ss = pad(d.getSeconds())
        const tsStr = `${y}${m}${day}-${hh}${mm}${ss}`
        const baseName = reportName.trim()
        const physicalName = `${baseName}_${tsStr}.docx`
        const nameHasEnv = /环境|影响/.test(baseName)
        const finalType = nameHasEnv ? '环境影响报告' : reportType
        const newDraft = {
          id: `draft-${ts}`,
          title: reportName.trim(),
          type: finalType,
          createTime: ts,
          status: 'draft',
          physicalName
        }
        marker.draftReports.unshift(newDraft)
        const blob = new Blob([JSON.stringify(marker, null, 2)], { type: 'application/json' })
        const content = await new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result.split(',')[1] || '')
          fr.readAsDataURL(blob)
        })
        const resp = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'local-storage/drafts/modal_marker.json', content }),
        })
        if (!resp.ok) {
          throw new Error(`/__local-upload 写入失败: ${resp.status}`)
        }
        const jr = await resp.json().catch(() => ({}))
        if (!jr || jr.ok !== true) {
          throw new Error(`/__local-upload 返回异常: ${JSON.stringify(jr)}`)
        }
        await new Promise((r) => setTimeout(r, 150))
        let verifyOk = false
        try {
          const rv = await fetch(`/local-storage/drafts/modal_marker.json?t=${Date.now()}`)
          if (rv.ok) {
            const vj = await rv.json().catch(() => null)
            if (vj && vj.draftReports && Array.isArray(vj.draftReports)) {
              verifyOk = vj.draftReports.some((it) => String(it.id) === String(newDraft.id))
            }
          }
        } catch (e) {}
        if (!verifyOk) {
          throw new Error('写入校验失败：未在 modal_marker.json 中找到新建记录')
        }
        this.$notification['success']({
          message: '通知',
          description: '报告创建成功',
        })
        this.closeNewReportModal()
        this.$refs.table.refresh()
      } catch (e) {
        this.$notification['error']({
          message: '错误',
          description: String(e),
        })
      }
    },
    
  }
}
</script>

<style lang="less" scoped>
@import './firstDraft.less';
</style>
