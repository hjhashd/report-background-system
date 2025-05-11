/*
 * @Author: bekon
 * @Date: 2025-05-11 15:38:21
 * @LastEditors: bekon
 * @LastEditTime: 2025-05-11 16:09:34
 * @FilePath: \report-background-system\src\views\dataGo\uploadData\util.js
 * @Description: 
 * 
 */

export const webCollapseList = [
    {
        icon: 'upload',
        title: '上传数据：',
        desc: '财报、银行流水、工资等结构化的数据文件',
        data: [],
    },
    {
        icon: 'sync',
        title: '自动采集：',
        desc: '财报、银行流水、工资等结构化的数据文件',
        data: [],
    },
    {
        icon: 'check-square',
        title: '指标验证：',
        desc: '财报、银行流水、工资等结构化的数据文件',
        data: [],
    },
]

export const appCollapseList = [
    {
        icon: 'user',
        title: '客户上传：',
        desc: '财报、银行流水、工资等结构化的数据文件',
        data: [],
    },
]

export const defaultColumns = [
    {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: '80px',
        scopedSlots: { customRender: 'id' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f8fafc',
                    padding: '5px',
                    color: '#000',
                },
            }
        },
    },
    {
        title: '文件名称',
        dataIndex: 'fileName',
        key: 'fileName',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f8fafc',
                    padding: '5px',
                    color: '#000',
                },
            }
        },
    },
    {
        title: '操作时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f8fafc',
                    padding: '5px',
                    color: '#000',
                },
            }
        },
    },
    {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f8fafc',
                    padding: '5px',
                    color: '#000',
                },
            }
        },
    },
]