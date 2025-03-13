<template>
  <page-header-wrapper>
    <div class="flex home-part-title-right flex-1">
      <div class="flex flex-center">
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
    <div class="table-contant">
      <s-table ref="table" rowKey="key" :data="loadData" :columns="columns">
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
          <a-button type="primary" @click="handleChat(scoped)">查看</a-button>
        </template>
      </s-table>
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
import { mapState } from 'vuex'
import { getReportList } from '@/api/overview'
import { STable } from '@/components'
import { baseMixin } from '@/store/app-mixin'
import { columns } from './util'

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
      // 查询参数
      queryParam: {
        status: 1,
      },
      loadData: (parameter) => {
        const requestParameters = Object.assign({}, parameter, this.queryParam, {
          pageNum: parameter.pageNo,
          reportName: this.search,
          reportType: this.draftTypeSelected,
        })
        return new Promise((resolve, reject) => {
          getReportList(requestParameters).then((res) => {
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
  computed: {
    ...mapState({
      overview: (state) => state.user.overview,
    }),
  },
  methods: {
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + v.id })
    },
    selectChange() {
      this.$refs.table.refresh()
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
</style>