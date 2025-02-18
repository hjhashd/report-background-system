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
                    <e-charts-component :options="lineOptions"></e-charts-component>
                </div>
            </a-col>
            <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
                <div class="overview-card">
                    <e-charts-component :options="barOptions"></e-charts-component>
                </div>
            </a-col>
            <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
                <div class="overview-card">
                    <e-charts-component :options="barOptions"></e-charts-component>
                </div>
            </a-col>
        </a-row>

        <div class="table-contant">
            <s-table ref="table" rowKey="key" :showPagination="false" :data="loadData" :columns="columns">
                <template #action="{ row }">
                    <!-- 这里可以定义操作列的具体内容，例如按钮 -->
                    <button @click="handleChat(row)">查看</button>
                </template>
            </s-table>
        </div>
    </page-header-wrapper>
</template>

<script>
import {
    EChartsComponent,
    STable
} from '@/components'
import { baseMixin } from '@/store/app-mixin'

// 模拟数据
const overview = [
    { name: '客户数', sum: 256 },
    { name: '授权数据', sum: 256 },
    { name: '报告数量', sum: 256 },
    { name: '待上传数据', sum: 256 },
    { name: '待处理报告', sum: 256 },
]

// 双曲线图表配置项
const lineOptions = {
    title: {
        text: '报告制作耗时统计'
    },
    grid: {
        containLabel: true,
        bottom: 2,
        left: 1,
        right: 1,
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '数据1',
            type: 'line',
            smooth: true,
            data: [120, 200, 150, 180, 220, 190]
        },
        {
            name: '数据2',
            type: 'line',
            smooth: true,
            data: [220, 180, 250, 210, 160, 230]
        }
    ]
}

// 双柱图标配置项
const barOptions = {
    title: {
        text: '新增客户数'
    },
    grid: {
        containLabel: true,
        bottom: 2,
        left: 1,
        right: 1,
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '数据1',
            type: 'bar',
            data: [120, 200, 150, 180, 220, 190]
        },
        {
            name: '数据2',
            type: 'bar',
            data: [220, 180, 250, 210, 160, 230]
        }
    ]
}

const tableData = [
    {
        id: 1,
        workOrderNumber: 'WO001',
        reportType: '月度报告',
        enterpriseName: 'ABC 公司',
        reportProgress: '已完成',
        description: '对本月业务数据进行总结',
        startTime: '2025-02-01 09:00:00',
        lastModifiedTime: '2025-02-18 14:30:00',
        totalProcessingTime: '17 天 5 小时 30 分钟'
    },
    {
        id: 2,
        workOrderNumber: 'WO002',
        reportType: '季度报告',
        enterpriseName: 'XYZ 公司',
        reportProgress: '进行中',
        description: '统计本季度销售数据',
        startTime: '2025-01-01 10:00:00',
        lastModifiedTime: '2025-02-18 15:15:00',
        totalProcessingTime: '48 天 5 小时 15 分钟'
    }
];
const columns = [
    {
        title: '序号',
        dataIndex: 'id',
        key: 'id'
    },
    {
        title: '作业工作工单编号',
        dataIndex: 'workOrderNumber',
        key: 'workOrderNumber'
    },
    {
        title: '报告类型',
        dataIndex: 'reportType',
        key: 'reportType'
    },
    {
        title: '企业名称',
        dataIndex: 'enterpriseName',
        key: 'enterpriseName'
    },
    {
        title: '报告进度',
        dataIndex: 'reportProgress',
        key: 'reportProgress'
    },
    {
        title: '描述',
        dataIndex: 'description',
        key: 'description'
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime'
    },
    {
        title: '最新修改时间',
        dataIndex: 'lastModifiedTime',
        key: 'lastModifiedTime'
    },
    {
        title: '累计处理时长',
        dataIndex: 'totalProcessingTime',
        key: 'totalProcessingTime'
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' }
    }
]

function questMockDat(b) {
    return new Promise((resolve, reject) => {
        const reD = {
            pageSize: 10,
            pageNp: 1,
            totalCount: tableData.length,
            totalPage: 1,
            data: tableData
        };
        resolve(reD)
    })
};

export default {
    name: 'Analysis',
    mixins: [baseMixin],
    components: {
        EChartsComponent,
        STable
    },
    data() {
        return {
            loading: true,
            overview,
            barOptions,
            lineOptions,
            columns,
            // 查询参数
            queryParam: {},
            loadData: parameter => {
                const requestParameters = Object.assign({}, parameter, this.queryParam)
                return questMockDat(requestParameters);
            },
        }
    },
    created() {
        setTimeout(() => {
            this.loading = !this.loading
        }, 1000)
    },
    methods: {
        handleChat(v) {
            console.log(v)
        }
    }
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

.table-contant{
    background-color: #fff;
}
</style>