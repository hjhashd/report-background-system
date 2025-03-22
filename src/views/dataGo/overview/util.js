/*
 * @Author: bekon
 * @Date: 2025-02-26 20:29:58
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-22 21:01:23
 * @FilePath: /report-background-system/src/views/dataGo/overview/util.js
 * @Description: 
 * 
 */
export const overviewObj = {
    customerCount: '客户数',
    authCount: '授权数据',
    reportCount: '报告数量',
    waitUploadCount: '待上传数据',
    waitHandleCount: '待处理报告',
}


// 双曲线图表配置项
export const lineOptions = {
    title: {
        text: '报告制作耗时统计',
        textStyle: {
            'font-size': '22px',
            'color': '#488FD7'
        }
    },
    smooth: true,
    grid: {
        containLabel: true,
        bottom: 2,
        left: 1,
        right: 1,
    },
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'category',
        data: [],
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            name: '新增客户数',
            type: 'line',
            smooth: true,
            data: [],
        },
        {
            name: '授权客户数',
            type: 'line',
            smooth: true,
            data: [],
        },
    ],
}

// 双柱图标配置项
export const barOptions = {
    title: {
        text: '新增客户数',
        textStyle: {
            'font-size': '22px',
            'color': '#488FD7'
        }
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
            type: 'shadow',
        },
    },
    xAxis: {
        type: 'category',
        data: [],
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            name: '数据1',
            type: 'bar',
            data: [],
            itemStyle: {
                color: '#77fbf6',
                width: '22px'
            }
        },
        {
            name: '数据2',
            type: 'bar',
            data: [],
            itemStyle: {
                color: '#3467f6',
                width: '22px'
            }
        },
    ],
}

export const columns = [
    {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: '报告类型',
        dataIndex: 'reportType',
        key: 'reportType',
        scopedSlots: { customRender: 'reportType' },
    },
    {
        title: '企业名称',
        dataIndex: 'enterpriseName',
        key: 'enterpriseName',
    },
    {
        title: '报告进度',
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
    },
    {
        title: '累计处理时长',
        dataIndex: 'avgOperationTime',
        key: 'avgOperationTime',
        scopedSlots: { customRender: 'avgOperationTime' },
    },
    {
        title: '开始时间',
        dataIndex: 'createTime',
        key: 'createTime',
    },
    {
        title: '最新修改时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
    },
]