/*
 * @Author: bekon
 * @Date: 2025-03-12 13:54:33
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-12 18:28:49
 * @FilePath: /report-background-system/src/views/dataGo/anomaly/util.js
 * @Description: 
 * 
 */

export function dealColumns(data, type) {
    let columns = [];
    let reData = [];
    let yearList = [];
    let analysis = [];
    let sortData = null;
    switch (type) {
        case '财务基础指标':
            let colSpanSet = {};
            let analysisYoy = [];
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                const fIndex = reData.findIndex((i) => i.dataItem == item.dataItem)
                if (fIndex !== -1) {
                    // 已存在
                    reData[fIndex][item.recordDate] = item.dataValue ? Math.round(item.dataValue * 10000) / 10000 : null
                } else {
                    reData.push(Object.assign(item, { [item.recordDate]: item.dataValue ? Math.round(item.dataValue * 10000) / 10000 : null }))
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            reData.map((ii) => {
                if (colSpanSet[ii.secondLevel]) {
                    colSpanSet[ii.secondLevel].span++;
                    ii.showLeftTitle = false
                } else {
                    colSpanSet[ii.secondLevel] = {
                        span: 1
                    }
                    ii.showLeftTitle = true
                }
                // 计算各环比同比值
                yearList.forEach((y, index) => {
                    // 忽略第一个年份
                    if (index !== 0) {
                        if (ii[y] && ii[yearList[index - 1]]) {
                            ii[`${y}Yoy`] = Math.round((ii[y] - ii[yearList[index - 1]]) / ii[yearList[index - 1]] * 10000) / 10000
                        } else {
                            ii[`${y}Yoy`] = null
                        }
                    }
                })
            })
            yearList.forEach((y, index) => {
                if (index >= (yearList.length - 4)) {
                    analysis.push({
                        title: y,
                        dataIndex: y,
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                    })
                    if (index > (yearList.length - 4)) {
                        analysisYoy.push({
                            title: y,
                            dataIndex: `${y}Yoy`,
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                            scopedSlots: { customRender: 'yoy' },
                        })
                    }
                }
            })
            columns = [
                {
                    title: '财务报表分析',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#e6edf8',
                            }
                        };
                    },
                    children: [
                        {
                            title: '',
                            dataIndex: 'secondLevel',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                            customRender: (text, row, index) => {
                                const obj = {
                                    children: text,
                                    attrs: {},
                                }
                                if (row.showLeftTitle) {
                                    obj.attrs.rowSpan = colSpanSet[row.secondLevel].span
                                } else {
                                    obj.attrs.rowSpan = 0
                                }

                                obj.attrs.style = `background-color: #ccdcfc`
                                return obj;
                            },
                        },
                        {
                            title: '指标名称',
                            dataIndex: 'dataItem',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        },
                        ...analysis
                    ],
                }, {
                    title: '相对上年的环比',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#e6edf8',
                            }
                        };
                    },
                    children: analysisYoy
                }
            ]
            break;
        case '财务异常指标':
            const levelLists = {}
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                const fIndex = reData.findIndex((i) => i.dataItem == item.dataItem)
                if (item.dataItem.includes('异常等级')) {
                    levelLists[item.recordDate + item.dataItem] = item
                } else {
                    if (fIndex !== -1) {
                        // 已存在
                        reData[fIndex][item.recordDate] = item.dataValue
                    } else {
                        reData.push(Object.assign(item, { [item.recordDate]: item.dataValue }))
                    }
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            yearList.forEach((y, index) => {
                if (index >= (yearList.length - 3)) {
                    analysis.push({
                        title: y,
                        dataIndex: y,
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                    })
                }
                if (index == yearList.length - 1) {
                    analysis.push({
                        title: y + '增长率',
                        dataIndex: 'compName',
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                    });
                    analysis.push({
                        title: '提示等级',
                        dataIndex: 'dataItemId',
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                    });
                }
            })
            console.log(reData)
            columns = [
                {
                    title: '资产负债表重点数据',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#e6edf8',
                            }
                        };
                    },
                    children: [
                        {
                            title: '',
                            dataIndex: 'dataItem',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        },
                        ...analysis
                    ],
                }]
            console.log(columns)
            break;
        case '衍生异常指标':
            const dD = {}
            const valuelist = []
            const levelList = {}
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                if (item.dataItem.includes('异常等级')) {
                    levelList[item.recordDate + item.dataItem] = item
                } else {
                    valuelist.push(item)
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            const yearLength = yearList.length;
            yearList.forEach((y, index) => {
                if (index >= (yearLength - 3)) {
                    dD[y] = []
                    // 整理数据
                    valuelist.forEach((io) => {
                        if (io.recordDate === y) {
                            dD[y].push(Object.assign(io, {
                                levelValue: levelList[io.recordDate + io.dataItem] || '',
                                [`${y}dataItem`]: io.dataItem || ''
                            }))
                        }
                    })
                    analysis.push({
                        title: `${y}年衍生指标`,
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#e6edf8',
                                }
                            };
                        },
                        children: [{
                            title: '指标名称',
                            dataIndex: `${y}dataItem`,
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        }, {
                            title: y,
                            dataIndex: 'dataValue',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        }, {
                            title: '提示等级',
                            dataIndex: 'levelValue',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        }]
                    });
                }
            })
            console.log(dD)
            console.log(reData)
            columns = analysis
            console.log(columns)
            break;
    }
    return { reData, columns }
}

function wenzistartSort(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        if (!value1 && !value2) {
            return 0
        }
        return value1.localeCompare(value2)
    }
}