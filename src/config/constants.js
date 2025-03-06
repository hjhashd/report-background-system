/*
 * @Author: bekon
 * @Date: 2025-02-21 18:03:38
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-05 17:33:17
 * @FilePath: /report-background-system/src/config/constants.js
 * @Description: 
 * 
 */
export const dataTypes = [
    {
        type: 'crawl',
        name: '电力数据',
        id: 1,
    },
    {
        type: 'crawl',
        name: '企业基础数据',
        id: 2,
    },
    {
        type: 'upload',
        name: '财务数据',
        id: 3,
    },
]

export const uploadType = () => {
    const reL = [];
    dataTypes.forEach(item => {
        if (item.type === 'upload') {
            reL.push(item);
        }
    })

    return reL;
}

export const crawlType = () => {
    const reL = [];
    dataTypes.forEach(item => {
        if (item.type === 'crawl') {
            reL.push(item);
        }
    })

    return reL;
}

export const yongtu = [
    {
        id: 1,
        name: '信贷调查报告',
    },
    {
        id: 2,
        name: '财务分析报告',
    },
    {
        id: 3,
        name: '能耗分析报告',
    }
]

export const colorList = [
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#FF33E7",
    "#33E7FF",
    "#E7FF33",
    "#FF9933",
    "#33FF99",
    "#9933FF",
    "#FF3399",
    "#3399FF",
    "#99FF33",
    "#FF3366",
    "#3366FF",
    "#66FF33",
    "#FF6633",
    "#33FFCC",
    "#CC33FF",
    "#FFCC33",
    "#33CCFF",
]