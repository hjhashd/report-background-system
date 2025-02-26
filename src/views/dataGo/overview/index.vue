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
        <template #action="{ row }">
          <!-- 这里可以定义操作列的具体内容，例如按钮 -->
          <button @click="handleChat(row)">查看</button>
        </template>
      </s-table>
    </div>
  </page-header-wrapper>
</template>

<script>
import { statisticsCount, statisticsAnalyze, manufacture, complete, getReportList } from '@/api/overview'
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
      overview: null,
      customerOptions: barOptions,
      completeOptions: barOptions,
      manufactureOptions: lineOptions,
      columns,
      // 查询参数
      queryParam: {
        status: 0,
      },
      loadData: (parameter) => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
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
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.statisticsCount()
      this.statisticsAnalyze()
      this.complete()
      this.manufacture()
    },
    // 获取看板
    statisticsCount() {
      statisticsCount().then((res) => {
        const reShow = []
        for (const key in res.data) {
          if (Object.prototype.hasOwnProperty.call(res.data, key)) {
            const num = res.data[key]
            reShow.push({
              name: overviewObj[key],
              sum: num,
            })
          }
        }
        this.overview = reShow
      })
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
      console.log(v)
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
</style>