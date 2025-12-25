<template>
  <div>
    <div class="flex home-part-title-right flex-1">
      <div class="flex">
        <div class="flex flex-center" style="margin-right: 20px;">
          <div class="right-item-title">报告类型：</div>
          <a-select v-model="draftTypeSelected" style="width: 200px" @change="selectChange" :allowClear="true">
            <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
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
      <a-popconfirm title="是否删除已选中的报告?" ok-text="是" cancel-text="否" @confirm="deleteMutil">
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
          <a-tooltip placement="right" v-if="scoped.status != 1">
            <template slot="title">
              <span v-if="scoped.dataStatus == 2">未完成数据授权，数据上传</span>
              <span v-else-if="scoped.dataStatus == 3">已完成数据授权，数据上传，正在制作报告</span>
            </template>
            <a-icon type="bell" theme="filled" style="color: #c92c1f" />
          </a-tooltip>
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
          <a-badge
            :offset="[-3, 5]"
            v-if="scoped.tableChangeInfos && scoped.tableChangeInfos.length"
            :count="scoped.tableChangeInfos.length"
          >
            <a-button style="margin-left: 5px" icon="bell" type="link" @click="lookUploadModal(scoped)"></a-button>
          </a-badge>
        </template>
        <span slot="reportType" slot-scope="text">
          {{ text == 1 ? '信贷调查报告' : text == 2 ? '财务分析报告' : '能耗分析报告' }}
        </span>
        <span slot="avgOperationTime" slot-scope="text">
          <span v-if="text">{{ text | dealTime }}</span>
          <span v-else>{{ text }}</span>
        </span>
        <template slot="action" slot-scope="text, scoped">
          <!-- 这里可以定义操作列的具体内容，例如按钮 -->
          <a-tooltip>
            <template slot="title">
              <span>查看</span>
            </template>
            <a-button @click="handleChat(scoped)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
              <img style="width: 28px; height: 28px" src="@/assets/images/see.png" alt="dark" />
            </a-button>
          </a-tooltip>
          <a-popconfirm title="是否确定删除该报告?" ok-text="确定" cancel-text="取消" @confirm="deleteChat(scoped)">
            <a-tooltip>
              <template slot="title">
                <span>删除</span>
              </template>
              <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'margin-left': '10px' }">
                <img style="width: 22px; height: 22px" src="@/assets/images/delete.png" alt="dark" />
              </a-button>
            </a-tooltip>
          </a-popconfirm>
        </template>
      </s-table>
    </div>

    <a-modal :footer="null" v-model="udt" title="数据更新提醒">
      <div class="update-item-line" v-for="item in uploadTableList" :key="item.id">
        <span class="update-item-title">{{ item.tableNameC }}</span>
        <span class="update-item-time">{{ item.changeTime }}</span>
      </div>
    </a-modal>
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
]
import { mapState } from 'vuex'
import { STable } from '@/components'
import { baseMixin } from '@/store/app-mixin'
import { columns } from '../util'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    STable,
  },
  data() {
    return {
      loading: true,
      columns,
      draftTypeSelected: null,
      search: null,
      reportTypeList,
      udt: false,
      uploadTableList: [],
      expandedRowKeys: [],
      // 查询参数
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        status: 1,
      },
      loadData: (parameter) => {
        const requestParameters = Object.assign({}, this.queryParam, parameter, {
          pageNum: parameter.pageNo,
        })
        if (parameter.pageSize !== this.queryParam.pageSize) {
          requestParameters.pageNo = 1
          requestParameters.pageNum = 1
        }
        this.queryParam = requestParameters
        return new Promise(async (resolve) => {
          const state = await this.readReportState()
          let rows = Array.isArray(state.reports) ? state.reports.slice() : []
          if (this.search) {
            const s = String(this.search).toLowerCase()
            rows = rows.filter((r) => String(r.reportName).toLowerCase().includes(s))
          }
          if (this.draftTypeSelected) {
            rows = rows.filter((r) => String(r.reportType) === String(this.draftTypeSelected))
          }
          const total = rows.length
          const start = (requestParameters.pageNum - 1) * requestParameters.pageSize
          const end = start + requestParameters.pageSize
          const pageRows = rows.slice(start, end)
          resolve({
            pageSize: requestParameters.pageSize,
            pageNo: requestParameters.pageNum,
            totalCount: total,
            totalPage: Math.ceil(total / requestParameters.pageSize),
            data: pageRows,
          })
        })
      },
    }
  },
  filters: {
    dealTime(minutes) {
      const oneDay = 24 * 60;
      const oneHour = 60;

      const days = Math.floor(minutes / oneDay);
      const remainingMinutes = minutes % oneDay;
      const hours = Math.floor(remainingMinutes / oneHour);
      const mins = remainingMinutes % oneHour;

      let str = '';
      str += days ? `${days} 天 ` : '';
      str += hours ? `${hours} 小时 ` : '';
      str += mins ? `${mins} 分钟` : '';

      return str || '0 分钟';
    },
  },
  computed: {
    ...mapState({
      overview: (state) => state.user.overview,
    }),
  },
  methods: {
    handleChat(v) {
      const { $router } = this
      const DEFAULT_DOC = ''
      $router.push({
        path: `/homePage/viewReportFirstDraft/` + v.id,
        query: { reportName: v.reportName, fileType: 'doc', docUrl: DEFAULT_DOC }
      })
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
      this.deleteByIds(this.expandedRowKeys).then(() => {
        $notification['success']({
          message: '通知：',
          description: '删除成功',
          duration: 8,
        })
        this.expandedRowKeys = []
        this.$refs.table.refresh()
      }).catch((e) => {
        $notification['error']({
          message: '通知：',
          description: '删除失败' + e,
          duration: 8,
        })
      })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    deleteChat(v) {
      const { $notification } = this
      this.deleteByIds([v.id]).then(() => {
        $notification['success']({
          message: '通知：',
          description: '删除成功',
          duration: 8,
        })
        this.$refs.table.refresh()
      }).catch((e) => {
        $notification['error']({
          message: '通知：',
          description: '删除失败' + e,
          duration: 8,
        })
      })
    },
    lookUploadModal(v) {
      this.uploadTableList = v.tableChangeInfos
      this.udt = true
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
    },
    async deleteByIds(ids) {
      const state = await this.readReportState()
      const set = new Set(ids.map((x) => String(x)))
      state.reports = (Array.isArray(state.reports) ? state.reports : []).filter((r) => !set.has(String(r.id)))
      await this.writeReportState(state)
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
}
.home-part-title-right {
  padding: 20px;
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
</style>
