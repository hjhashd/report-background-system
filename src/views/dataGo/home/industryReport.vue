<template>
  <page-header-wrapper>
    <div class="flex home-part-title-right flex-1">
      <div class="flex flex-center">
        <div class="right-item-title">行业类型：</div>
        <a-select
          showSearch
          :filter-option="filterOption"
          v-model="industrySelected"
          style="width: 200px"
          @change="selectChange"
          :allowClear="true"
        >
          <a-select-option v-for="(item, index) in industrySelectList" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
    </div>
    <div class="table-contant tab-table">
      <s-table ref="table" rowKey="key" :data="loadData" :columns="industryColumns">
        <template slot="id" slot-scope="txt, scoped, index">{{
          (queryParam.pageNum - 1) * queryParam.pageSize + index + 1
        }}</template>
        <span slot="status" slot-scope="text">
          <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
          <span v-if="text == 0" :class="['table-status', 'status' + text]">草稿</span>
          <span v-if="text == 1" :class="['table-status', 'status' + text]">已完成</span>
          <span v-if="text == 2" :class="['table-status', 'status' + text]">数据未授权</span>
          <span v-if="text == 3" :class="['table-status', 'status' + text]">数据已授权</span>
        </span>
        <span slot="reportType" slot-scope="text">
          {{ text == 1 ? '信贷调查报告' : text == 2 ? '财务分析报告' : '能耗分析报告' }}
        </span>
        <span slot="avgOperationTime" slot-scope="text">
          <span v-if="text">约{{ text | dealTime }}小时</span>
          <span v-else>{{ text }}</span>
        </span>
        <template slot="action" slot-scope="text, scoped">
          <!-- 这里可以定义操作列的具体内容，例如按钮 -->
          <a-tooltip style="margin-right: 10px">
            <template slot="title">
              <span>下载报告</span>
            </template>
            <a-button @click="downloadModal(scoped)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
              <img style="width: 20px; height: 22px" src="@/assets/images/download-modal.png" alt="dark" />
            </a-button>
          </a-tooltip>
          <a-tooltip>
            <template slot="title">
              <span>查看</span>
            </template>
            <a-button @click="handleChat(scoped)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
              <img style="width: 28px; height: 28px" src="@/assets/images/see.png" alt="dark" />
            </a-button>
          </a-tooltip>
        </template>
      </s-table>
    </div>
  </page-header-wrapper>
</template>

<script>
import { mapState } from 'vuex'
import { getIndustryClassify, industryReportList } from '@/api/report'
import { STable } from '@/components'
import { baseMixin } from '@/store/app-mixin'
import { industryColumns } from './util'

export default {
  name: 'industryReport',
  mixins: [baseMixin],
  components: {
    STable,
  },
  data() {
    return {
      loading: true,
      industryColumns,
      industrySelected: null,
      search: null,
      industrySelectList: null,
      // 查询参数
      queryParam: {
        pageNum: 1,
        pageSize: 10,
      },
      loadData: (parameter) => {
        let requestParameters = Object.assign({}, this.queryParam, parameter, {
          pageNum: parameter.pageNo,
          industry: this.industrySelected,
        })
        if (parameter.pageSize !== this.queryParam.pageSize) {
          requestParameters.pageNo = 1
          requestParameters.pageNum = 1
        }
        this.queryParam = requestParameters
        return new Promise((resolve, reject) => {
          industryReportList(requestParameters).then((res) => {
            const reD = {
              pageSize: requestParameters.pageSize,
              pageNo: requestParameters.pageNo,
              totalCount: res.total,
              totalPage: Math.ceil(res.total / requestParameters.pageSize),
              data: res.rows,
            }
            resolve(reD)
          })
        })
      },
    }
  },
  filters: {
    dealTime(v) {
      let time = parseInt(v)
      return Math.ceil(time / 3600)
    },
  },
  created() {
    const { $notification } = this
    getIndustryClassify()
      .then((result) => {
        this.industrySelectList = result.data
      })
      .catch((err) => {
        $notification['error']({
          message: '错误通知：',
          description: err,
          duration: 8,
        })
      })
  },
  computed: {
    ...mapState({
      overview: (state) => state.user.overview,
    }),
  },
  methods: {
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/${v.id}?typeFrom=industryReport&reportName=${v.reportName}` })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    downloadModal(v) {
      const url = v.fileUrl
      const filename = `${v.reportName}`
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        if (xhr.status === 200) {
          const blob = xhr.response
          const urlObject = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = urlObject
          a.download = filename
          a.click()
          URL.revokeObjectURL(urlObject)
        }
      }
      xhr.send()
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
</style>