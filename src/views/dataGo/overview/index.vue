<template>
  <page-header-wrapper>
    <div class="flex top-card-content">
      <div v-for="item in overview" :key="item.name" class="flex-1">
        <div class="title">{{ item.name }}</div>
        <div class="sum">{{ item.sum }}</div>
      </div>
    </div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <div class="overview-card">
          <e-charts-component :options="manufactureOptions"></e-charts-component>
        </div>
      </a-col>
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <div class="overview-card">
          <e-charts-component :options="customerOptions"></e-charts-component>
        </div>
      </a-col>
      <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
        <div class="overview-card">
          <e-charts-component :options="completeOptions"></e-charts-component>
        </div>
      </a-col>
    </a-row>

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
import { mapState } from 'vuex'
import { statisticsAnalyze, manufacture, complete, getReportList } from '@/api/overview'
import { EChartsComponent, STable } from '@/components'
import { baseMixin } from '@/store/app-mixin'
import { overviewObj, lineOptions, barOptions, columns } from './util'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    EChartsComponent,
    STable,
  },
  data() {
    return {
      loading: true,
      customerOptions: barOptions,
      completeOptions: barOptions,
      manufactureOptions: lineOptions,
      columns,
      // 查询参数
      queryParam: {
        status: 0,
      },
      loadData: (parameter) => {
        const requestParameters = Object.assign({}, parameter, this.queryParam, { pageNum: parameter.pageNo })
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
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.statisticsAnalyze()
      this.complete()
      this.manufacture()
    },
    statisticsAnalyze() {
      statisticsAnalyze().then((res) => {
        const x = [],
          data1 = [],
          data2 = []
        res.data.forEach((v) => {
          x.push(v.month)
          data1.push(v.newCustomerCount)
          data2.push(v.totalCustomerCount)
        })
        let options = JSON.parse(JSON.stringify(barOptions))
        options.title.text = '新增客户数'
        options.xAxis.data = x
        options.series = [
          {
            name: '新增客户',
            type: 'bar',
            data: data1,
          },
          {
            name: '统计客户',
            type: 'bar',
            data: data2,
          },
        ]
        this.customerOptions = options
      })
    },
    complete() {
      complete().then((res) => {
        const x = [],
          data1 = [],
          data2 = []
        res.data.forEach((v) => {
          x.push(v.month)
          data1.push(v.completeCount)
          data2.push(v.allCount)
        })
        let options = JSON.parse(JSON.stringify(barOptions))
        options.title.text = '报告质量统计'
        options.xAxis.data = x
        options.series = [
          {
            name: '完成报告数',
            type: 'bar',
            data: data1,
          },
          {
            name: '制作报告数',
            type: 'bar',
            data: data2,
          },
        ]
        this.completeOptions = options
      })
    },
    manufacture() {
      manufacture().then((res) => {
        const x = [],
          data1 = [],
          data2 = []
        res.data.forEach((v) => {
          x.push(v.month)
          data1.push(v.avgCompleteTime)
          data2.push(v.avgDataTime)
        })
        let options = JSON.parse(JSON.stringify(lineOptions))
        options.title.text = '报告制作耗时统计'
        options.xAxis.data = x
        options.series = [
          {
            name: '制作时长(小时)',
            type: 'line',
            data: data1,
          },
          {
            name: '数据采集时长(小时)',
            type: 'line',
            data: data2,
          },
        ]
        this.manufactureOptions = options
      })
    },
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + v.id })
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
</style>