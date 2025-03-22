/*
 * @Author: bekon
 * @Date: 2025-02-21 15:22:28
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-22 16:15:42
 * @FilePath: /report-background-system/src/views/dataGo/client/util.js
 * @Description: 
 * 
 */

/**
 * 处理客户数据情况信息
 */
export function classifyDataByClassName(data) {
    const classifiedData = {};
    data.forEach(item => {
        const className = item.className;
        if (!classifiedData[className]) {
            classifiedData[className] = [];
        }
        classifiedData[className].push(item);
    });

    const reD = [];
    for (const key in classifiedData) {
        if (Object.prototype.hasOwnProperty.call(classifiedData, key)) {
            const element = classifiedData[key];
            reD.push({
                name: key,
                data: element
            })
        }
    }
    return reD;
}

export const graftFun = [
    {
        name: '数据上传',
        color: '#4e80ee',
        bgcolor: '#f0f6fe',
    },
    {
        name: '数据采集',
        color: '#5ec269',
        bgcolor: '#f2fdf5'
    },
]

export const columns = [
    {
        width: '20%',
        title: '文档名称',
        dataIndex: 'tableNameZh',
        key: 'tableNameZh',
    },
    {
        width: '20%',
        title: '上传状态',
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
    },
    {
        width: '20%',
        title: '采集方式',
        dataIndex: 'type',
        key: 'type',
        scopedSlots: { customRender: 'type' },
    },
    {
        width: '20%',
        title: '最近操作时间',
        dataIndex: 'operateTime',
        key: 'operateTime',
    },
    {
        width: '20%',
        title: '操作',
        dataIndex: 'tool',
        scopedSlots: { customRender: 'tool' },
    },
]

export const newColumns = [
    {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
    {
        title: '文档名称',
        dataIndex: 'tableNameZh',
        key: 'tableNameZh',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
    {
        title: '数据类型',
        dataIndex: 'className',
        key: 'className',
        scopedSlots: { customRender: 'className' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
    {
        title: '上传状态',
        dataIndex: 'status',
        key: 'status',
        scopedSlots: { customRender: 'status' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
    {
        title: '最近操作时间',
        dataIndex: 'operateTime',
        key: 'operateTime',
        scopedSlots: { customRender: 'operateTime' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
    {
        title: '操作',
        dataIndex: 'tool',
        scopedSlots: { customRender: 'tool' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#656D92',
                }
            };
        },
    },
]