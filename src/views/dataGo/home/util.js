
export const overviewObj = {
    customerCount: '客户数',
    authCount: '授权数据',
    reportCount: '报告数量',
    waitUploadCount: '待上传数据',
    waitHandleCount: '待处理报告',
}

export const aiTypeList = [{
    value: '文本扩写',
    icon: 'file-text',
    btBc: 'linear-gradient(to right, #0096ff, #66c2ff)',
    bc: '#dee9fc',
    bcAction: '#7c9fea',
    defaultColor: '#3662e3',
}, {
    value: '数据补充',
    icon: 'bar-chart',
    btBc: 'linear-gradient(to right, #a465ef, #d95597)',
    bc: '#f1e8fd',
    bcAction: '#c98de0',
    defaultColor: '#883ae1',
}, {
    value: '提炼总结',
    icon: 'bulb',
    btBc: 'linear-gradient(to right, #eaa748, #e87b35)',
    bc: '#fcf3cc',
    bcAction: '#f0bc7b',
    defaultColor: '#cc7c2e',
}]

// 双曲线图表配置项
export const lineOptions = {
    title: {
        text: '报告制作耗时统计',
    },
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
        },
        {
            name: '数据2',
            type: 'bar',
            data: [],
        },
    ],
}

export const tabColumns = [
    {
        title: '文档名称',
        dataIndex: 'reportName',
        key: 'reportName',
        scopedSlots: { customRender: 'reportName' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#d2d8dd',
                    padding: '5px',
                    color: '#000',
                }
            };
        },
    },
    {
        title: '文档状态',
        dataIndex: 'status',
        key: 'status',
        width: '120px',
        scopedSlots: { customRender: 'status' },
        sorter: true,
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#d2d8dd',
                    padding: '5px',
                    color: '#000',
                }
            };
        },
    },
    {
        title: '关联企业',
        dataIndex: 'enterpriseName',
        key: 'enterpriseName',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#d2d8dd',
                    padding: '5px',
                    color: '#000',
                }
            };
        },
    },
    {
        title: '最近操作时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#d2d8dd',
                    padding: '5px',
                    color: '#000',
                }
            };
        },
    },
]

export const columns = [
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
        title: '企业名称',
        dataIndex: 'enterpriseName',
        key: 'enterpriseName',
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
        title: '处理时长',
        dataIndex: 'avgOperationTime',
        key: 'avgOperationTime',
        width: '100px',
        scopedSlots: { customRender: 'avgOperationTime' },
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
    },
]

export const industryColumns = [
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
        title: '行业类型',
        dataIndex: 'industry',
        key: 'industry',
    },
    {
        title: '最后更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
    },
]


export const qrColumns = [
    {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: '80px',
        scopedSlots: { customRender: 'id' },
    },
    {
        title: '二维码类型',
        dataIndex: 'codeType',
        key: 'codeType',
        scopedSlots: { customRender: 'codeType' },
    },
    {
        title: '二维码状态',
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
    },
    {
        title: '授权企业名称',
        dataIndex: 'appUser',
        key: 'appUser',
        scopedSlots: { customRender: 'bankNameInfo' },
    },
    {
        title: '生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
    },
    {
        title: '二维码',
        key: 'codeUrl',
        dataIndex: 'codeUrl',
        scopedSlots: { customRender: 'codeUrl' },
    },
]

export function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}