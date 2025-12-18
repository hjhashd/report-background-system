<template>
  <page-header-wrapper>
    <div class="flex home-part-title-right flex-1">
      <div class="flex">
        <div class="flex flex-center" style="margin-right: 20px">
          <div class="right-item-title">报告类型：</div>
          <a-select v-model="draftTypeSelected" style="width: 150px" @change="selectChange" :allowClear="true">
            <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="flex flex-center" style="margin-right: 20px">
          <div class="right-item-title">报告状态：</div>
          <a-select v-model="draftStatus" style="width: 150px" @change="selectChange" :allowClear="true">
            <a-select-option v-for="item in draftStatusList" :key="item.type" :value="item.type">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="flex flex-center">
          <div class="right-item-title">报告查询：</div>
          <a-input
            v-model="search"
            style="width: 200px"
            placeholder="输入报告名称"
            @blur="selectChange"
            @pressEnter="selectChange"
            :allowClear="true"
          />
        </div>
      </div>
      <div class="flex">
        <a-button type="primary" style="margin-right: 12px" @click="newReport" :disabled="uiDisabled">新建报告</a-button>
        <a-upload
          :showUploadList="false"
          :beforeUpload="beforeUpload"
          :customRequest="handleUpload"
          :disabled="uiDisabled"
          accept=".doc,.docx,.docm"
        >
          <a-button>上传Word文件</a-button>
        </a-upload>
      </div>
      <a-popconfirm title="是否删除已选中的草稿报告?" ok-text="是" cancel-text="否" @confirm="deleteMutil">
        <a-button>批量删除</a-button>
      </a-popconfirm>
    </div>
    <div class="table-contant tab-table">
      <s-table
        ref="table"
        :rowKey="(record) => record.id"
        :data="loadData"
        :columns="columns"
        :row-selection="{
          selectedRowKeys: expandedRowKeys,
          onChange: rowChange,
        }"
      >
        <template slot="id" slot-scope="txt, scoped, index">{{
          (queryParam.pageNum - 1) * queryParam.pageSize + index + 1
        }}</template>
        <div slot="reportName" slot-scope="text, scoped">
          <span>{{ text }}</span>
          <!-- <a-tooltip placement="right" v-if="scoped.status != 1">
            <template slot="title">
              <span v-if="scoped.dataStatus == 2">未完成数据授权，数据上传</span>
              <span v-else-if="scoped.dataStatus == 3">已完成数据授权，数据上传，正在制作报告</span>
            </template>
            <a-icon type="bell" theme="filled" style="color: #c92c1f" />
          </a-tooltip> -->
        </div>
        <span slot="status" slot-scope="text">
          <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
          <span v-if="text == 0" :class="['table-status', 'status' + text]">草稿</span>
          <span v-if="text == 1" :class="['table-status', 'status' + text]">已完成</span>
          <span v-if="text == 2" :class="['table-status', 'status' + text]">数据未授权</span>
          <span v-if="text == 3" :class="['table-status', 'status' + text]">数据已授权</span>
        </span>
        <template slot="genStatus" slot-scope="text, scoped">
          <span v-if="text == 1" class="table-status status1">已完成</span>
          <span v-else-if="text == 0" class="table-status"> 生成中 </span>
          <span v-else-if="text == 3" class="table-status"> 更新中 </span>
          <span class="table-status status4" v-else>生成失败</span>
          <a-badge
            :offset="[-3, 5]"
            v-if="scoped.tableChangeInfos && scoped.tableChangeInfos.length"
            :count="scoped.tableChangeInfos.length"
          >
            <a-button style="margin-left: 5px" icon="bell" type="link" @click="lookUploadModal(scoped)"></a-button>
          </a-badge>
          <a-progress v-if="text == 0" :percent="scoped.process" size="small" />
        </template>
        <span slot="reportType" slot-scope="text">
          {{ text == 1 ? '信贷调查报告' : text == 2 ? '财务分析报告' : '能耗分析报告' }}
        </span>
        <span slot="avgOperationTime" slot-scope="text">
          <span v-if="text">{{ text | dealTime }}</span>
          <span v-else>{{ text }}</span>
        </span>
        <template slot="action" slot-scope="text, scoped">
          <div class="flex">
            <!-- 这里可以定义操作列的具体内容，例如按钮 -->
            <a-tooltip v-if="scoped.genStatus != 2">
              <template slot="title">
                <span>查看</span>
              </template>
              <a-button
                :disabled="scoped.genStatus !== 1"
                @click="handleChat(scoped)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, margin: '0 5px' }"
              >
                <img style="width: 28px; height: 28px" src="@/assets/images/see.png" alt="dark" />
              </a-button>
            </a-tooltip>
            <!-- 这里可以定义操作列的具体内容，例如按钮 -->
            <a-tooltip v-if="scoped.genStatus == 2">
              <template slot="title">
                <span>重新生成</span>
              </template>
              <a-button
                @click="rebuild(scoped)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, margin: '0 5px' }"
              >
                <img style="width: 28px; height: 28px" src="@/assets/images/rebuild.png" alt="dark" />
              </a-button>
            </a-tooltip>
            <a-popconfirm title="是否确定删除该报告?" ok-text="确定" cancel-text="取消" @confirm="deleteChat(scoped)">
              <a-tooltip>
                <template slot="title">
                  <span>删除</span>
                </template>
                <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0, margin: '0 5px' }">
                  <img style="width: 22px; height: 22px" src="@/assets/images/delete.png" alt="dark" />
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </s-table>
    </div>

    <a-modal :footer="null" v-model="udt" title="数据更新提醒">
      <div class="update-item-line" v-for="item in uploadTableList" :key="item.id">
        <span class="update-item-title">{{ item.tableNameC }}</span>
        <span class="update-item-time">{{ item.changeTime }}</span>
      </div>
    </a-modal>
    <div v-if="uploadStatus === 'uploading'" class="upload-overlay">
      <div class="upload-overlay-center">
        <a-spin :spinning="true" tip="正在上传...">
          <div class="upload-overlay-progress">
            <a-progress :percent="Math.round(uploadProgress)" :status="'active'" />
            <div class="upload-overlay-text">{{ Math.round(uploadProgress) }}%</div>
          </div>
        </a-spin>
      </div>
    </div>
  </page-header-wrapper>
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
    type: 2,
    name: '生成失败',
  },
]
import { mapState } from 'vuex'
import { STable } from '@/components'
import md5 from 'md5'
import { baseMixin } from '@/store/app-mixin'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    STable,
  },
  data() {
    return {
      loading: true,
      uiDisabled: false,
      uploadModalVisible: false,
      uploadProgress: 0,
      uploadStatus: 'idle',
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
      draftTypeSelected: null,
      draftStatus: null,
      search: null,
      reportTypeList,
      draftStatusList,
      uploadTableList: [],
      expandedRowKeys: [],
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
  },
  created() {
    // 初始化 loadData 函数，避免在 data() 中使用 this
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
        const rowsAll = await this.listDrafts()
        const filtered = this.search ? rowsAll.filter((x) => (x.reportName || '').toLowerCase().includes(this.search.toLowerCase())) : rowsAll
        const total = filtered.length
        const start = (req.pageNum - 1) * req.pageSize
        const pageRows = filtered.slice(start, start + req.pageSize).map((r, idx) => {
          return {
            id: (req.pageNum - 1) * req.pageSize + idx + 1,
            reportName: r.reportName,
            reportType: 2,
            genStatus: 1,
            updateTime: this.formatTime(r.createdAt),
            physicalName: r.physicalName,
            fileType: r.fileType,
            recordId: r.id,
            size: r.size,
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
    async openDB() {
      return new Promise((resolve, reject) => {
        const req = window.indexedDB.open('local-drafts', 1)
        req.onupgradeneeded = (ev) => {
          const db = ev.target.result
          if (!db.objectStoreNames.contains('drafts')) {
            const store = db.createObjectStore('drafts', { keyPath: 'id' })
            store.createIndex('byName', 'reportName', { unique: false })
            store.createIndex('byCreatedAt', 'createdAt', { unique: false })
          }
        }
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
    },
    async listDrafts() {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readonly')
        const store = tx.objectStore('drafts')
        const req = store.openCursor()
        const rows = []
        req.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor) {
            rows.push(cursor.value)
            cursor.continue()
          } else {
            resolve(rows.sort((a, b) => b.createdAt - a.createdAt))
          }
        }
        req.onerror = () => reject(req.error)
      })
    },
    async putDraft(record) {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite')
        const store = tx.objectStore('drafts')
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        store.put(record)
      })
    },
    async removeDraft(id) {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite')
        const store = tx.objectStore('drafts')
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
        store.delete(id)
      })
    },
    handleChat(v) {
      const { $router } = this
      const docUrl = `/local-storage/drafts/${v.physicalName || ''}`
      $router.push({
        path: `/homePage/ViewReportFirstDraft/` + (v.recordId || v.id),
        query: { reportName: v.reportName, fileType: v.fileType || 'docx', docUrl },
      })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    rowChange(_, selectedRows) {
      this.expandedRowKeys = selectedRows.map((u) => u.id)
    },
    deleteMutil() {
      const { $notification } = this
      if (!this.expandedRowKeys.length) {
        $notification['info']({
          message: '通知：',
          description: '未选中删除项',
          duration: 8,
        })
        return
      }
      Promise.all(this.expandedRowKeys.map(async (idx) => {
        const rowsAll = await this.listDrafts()
        const row = rowsAll[idx - 1]
        if (row) {
          try {
            await this.deleteFS(row.physicalName)
          } catch (e) {}
          await this.removeDraft(row.id)
        }
      })).then(() => {
        $notification['success']({
          message: '通知：',
          description: '删除成功',
          duration: 8,
        })
        this.expandedRowKeys = []
        this.$refs.table.refresh()
      }).catch(() => {
        $notification['error']({
          message: '通知：',
          description: '删除失败',
          duration: 8,
        })
        this.$refs.table.refresh()
      })
    },
    deleteChat(v) {
      const { $notification } = this
      const rid = v.recordId
      Promise.resolve()
        .then(async () => {
          try {
            await this.deleteFS(v.physicalName)
          } catch (e) {}
          await this.removeDraft(rid)
        })
        .then(() => {
        $notification['success']({
          message: '通知：',
          description: '删除成功',
          duration: 8,
        })
        this.$refs.table.refresh()
      })
    },
    lookUploadModal(v) {
      this.uploadTableList = v.tableChangeInfos
      this.udt = true
    },
    rebuild(v) {},
    beforeUpload(file) {
      const ext = (file.name || '').toLowerCase()
      const ok = ext.endsWith('.doc') || ext.endsWith('.docx') || ext.endsWith('.docm')
      if (!ok) {
        this.$notification['error']({
          message: '错误',
          description: '仅支持上传Word文件(.doc/.docx/.docm)',
        })
        return false
      }
      const limit = 50 * 1024 * 1024
      if (file.size > limit) {
        this.$notification['warning']({
          message: '提示',
          description: '文件过大，建议小于50MB',
        })
      }
      return true
    },
    handleUpload({ file, onSuccess, onError }) {
      this.uploadFile(file)
        .then(() => {
          onSuccess && onSuccess()
        })
        .catch((e) => {
          onError && onError(e)
        })
    },
    async uploadFile(file) {
      try {
        this.uiDisabled = true
        this.uploadStatus = 'uploading'
        this.uploadProgress = 0
        const name = file.name
        const fileType = name.split('.').pop().toLowerCase()
        const now = Date.now()
        const id = `draft-${md5(name + '-' + now)}`
        const ts = new Date(now)
        const pad = (x) => String(x).padStart(2, '0')
        const tsStr = [
          ts.getFullYear(),
          pad(ts.getMonth() + 1),
          pad(ts.getDate()),
        ].join('') + '-' + [pad(ts.getHours()), pad(ts.getMinutes()), pad(ts.getSeconds())].join('')
        const physicalName = `${name.replace(/\.[^\.]+$/, '')}_${tsStr}.${fileType}`
        const chunkSize = 1024 * 256
        const total = file.size
        let offset = 0
        const parts = []
        while (offset < total) {
          const end = Math.min(offset + chunkSize, total)
          const chunk = file.slice(offset, end)
          const buf = await chunk.arrayBuffer()
          parts.push(new Uint8Array(buf))
          offset = end
          this.uploadProgress = (offset / total) * 100
        }
        const blob = new Blob(parts, { type: file.type || 'application/octet-stream' })
        const record = {
          id,
          reportName: name,
          physicalName,
          fileType,
          size: total,
          createdAt: now,
          blob,
        }
        await this.uploadToFS(record.physicalName, record.blob)
        await this.putDraft(record)
        this.uploadStatus = 'success'
        this.$notification['success']({
          message: '通知',
          description: '上传完成',
          duration: 3,
        })
        this.$refs.table.refresh()
      } catch (e) {
        this.uploadStatus = 'failed'
        this.$notification['error']({
          message: '错误',
          description: '上传失败',
          duration: 5,
        })
        throw e
      } finally {
        this.uiDisabled = false
      }
    },
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => {
          const res = fr.result || ''
          const s = typeof res === 'string' ? res : ''
          const b64 = s.includes(',') ? s.split(',')[1] : s
          resolve(b64)
        }
        fr.onerror = () => reject(fr.error)
        fr.readAsDataURL(blob)
      })
    },
    async uploadToFS(filename, blob) {
      const content = await this.blobToBase64(blob)
      const r = await fetch('/__local-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content }),
      })
      const j = await r.json().catch(() => null)
      if (!r.ok || !j || !j.ok) {
        throw new Error((j && j.error) || `文件写入失败(${r.status})`)
      }
    },
    async deleteFS(filename) {
      const url = `/__local-upload?filename=${encodeURIComponent(filename)}`
      const r = await fetch(url, { method: 'DELETE' })
      const j = await r.json().catch(() => null)
      if (!r.ok || !j || !j.ok) {
        throw new Error((j && j.error) || `文件删除失败(${r.status})`)
      }
    },
    newReport() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.doc,.docx,.docm'
      input.multiple = false
      input.onchange = async (e) => {
        const f = e.target.files && e.target.files[0]
        if (f) {
          await this.uploadFile(f)
        }
      }
      input.click()
    },
  },
}
</script>

<style lang="less" scoped>
.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.top-card-content {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 24px;

  .title {
    font-size: 20px;
    font-weight: bold;
  }

  .sum {
    font-size: 16px;
  }
}

.overview-card {
  background-color: #fff;
  padding: 10px;

  .title {
    font-size: 18px;
  }
}

.table-contant {
  background-color: #fff;
}

.table-status {
  font-size: 12px;
  &.status0 {
    color: #666666;
  }
  &.status1 {
    color: #25f021;
  }
  &.status2 {
    color: #15dff1;
  }
  &.status3 {
    color: #0a69ef;
  }
  &.status4 {
    color: #ea2222;
  }
}
.home-part-title-right {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #fff;
  justify-content: space-between;
}
/* 去除表格行的鼠标悬停高亮效果 */
.tab-table {
  /deep/ .ant-table-tbody > tr:hover > td {
    background: inherit !important;
  }
  /deep/ .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
}
.upload-overlay {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
  z-index: 2000;
}
.upload-overlay-center {
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(-50%, -50%);
  width: 360px;
  max-width: 90vw;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  padding: 16px;
}
.upload-overlay-progress {
  margin-top: 10px;
}
.upload-overlay-text {
  margin-top: 8px;
  text-align: center;
  color: #666;
}
</style>
