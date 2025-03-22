<template>
  <!-- <page-header-wrapper> -->
  <div>
    <div class="page-title">数据看板</div>
    <div class="flex top-card-content">
      <div v-for="item in overview" :key="item.name" class="overview-card-item">
        <img :src="item.src" alt="dark" />
        <div>
          <div class="sum">{{ item.sum }}</div>
          <div class="title">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <div class="overview-card">
          <e-charts-component :options="customerOptions"></e-charts-component>
        </div>
      </a-col>
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <div class="overview-card">
          <e-charts-component :options="manufactureOptions"></e-charts-component>
        </div>
      </a-col>
      <!-- <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }"> 
        <div class="overview-card">
          <e-charts-component :options="completeOptions"></e-charts-component>
        </div>
      </a-col> -->
    </a-row>

    <div class="table-contant">
      <s-table ref="table" rowKey="key" :data="loadData" :columns="columns">
        <span slot="status" slot-scope="text">
          <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
          <span v-if="text == 1" :class="['table-status', 'status' + text]">已完成</span>
          <span v-if="text == 0 || text == 2" :class="['table-status', 'status' + text]">数据未授权</span>
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
          <a-tooltip>
            <template slot="title">
              <span>查看</span>
            </template>
            <a-button @click="handleChat(scoped)" :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
              <img style="width: 28px; height: 14px" src="@/assets/images/see.png" alt="dark" />
            </a-button>
          </a-tooltip>
        </template>
      </s-table>
    </div>
  </div>
  <!-- </page-header-wrapper> -->
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
            barWidth: '22px',
            itemStyle: {
              color: '#77fbf6',
            },
          },
          {
            name: '统计客户',
            type: 'bar',
            barWidth: '22px',
            data: data2,
            itemStyle: {
              color: '#3467f6',
            },
          },
        ]
        options.legend = {
          data: [
            {
              name: '新增客户',
            },
            {
              name: '统计客户',
            },
          ],
          right: 10,
        }
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
            name: '数据总采集时长(小时)',
            type: 'line',
            data: data2,
            itemStyle: {
              color: '#77fbf6',
            },
          },
          {
            name: '制作总时长(小时)',
            type: 'line',
            data: data1,
            itemStyle: {
              color: '#ded7fc',
            },
          },
        ]
        options.legend = {
          data: [
            {
              name: '制作总时长(小时)',
            },
            {
              name: '数据总采集时长(小时)',
            },
          ],
          right: 10,
        }
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
  margin-top: 40px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  .overview-card-item {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    padding: 20px;
    padding-bottom: 0;
    border: 2px solid rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 27px 0px rgba(48, 74, 161, 0.1);
    border-radius: 10px;
    img {
      margin-right: 15px;
    }
    &:nth-of-type(1) img {
      width: 87px;
      margin-top: -70px;
    }
    &:nth-of-type(2) img {
      width: 102px;
      margin-top: -41px;
    }
    &:nth-of-type(3) img {
      width: 86px;
      margin-top: -45px;
    }
    &:nth-of-type(4) img {
      width: 89px;
      margin-top: -48px;
    }
    &:nth-of-type(5) img {
      width: 79px;
      margin-top: -57px;
    }
  }
  .title,
  .sum {
    font-size: 20px;
    color: #222222;
    letter-spacing: 0;
    text-align: center;
    line-height: 23.1px;
    font-weight: 400;
  }
  .sum {
    padding-bottom: 10px;
    border-bottom: 1px solid #d8d8d8;
    margin-bottom: 10px;
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
  position: relative;
  font-size: 12px;
  padding-left: 20px;
  &.status0,
  &.status2 {
    &::before {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      background-image: url('@/assets/images/auth-orange.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      border-radius: 50%;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  &.status1 {
    &::before {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      background-color: #5ec662;
      border-radius: 50%;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  &.status3 {
    &::before {
      position: absolute;
      content: '';
      width: 16px;
      height: 16px;
      background-image: url('@/assets/images/shield-blue.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      border-radius: 50%;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
.page-title {
  opacity: 0.8;
  font-family: PingFangSC-Medium;
  font-size: 32px;
  color: #154291;
  letter-spacing: 0;
  line-height: 61.83px;
  font-weight: 500;
}
</style>