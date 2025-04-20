/*
 * @Author: bekon
 * @Date: 2025-03-12 13:54:33
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-20 16:28:47
 * @FilePath: \report-background-system\src\views\dataGo\anomaly\util.js
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
                                    backgroundColor: '#E5EDF9'
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
                                        backgroundColor: '#E5EDF9'
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
            const valueList = []
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                const fIndex = valueList.findIndex((i) => i.dataItem === item.dataItem)
                if (item.dataItem.includes('异常等级')) {
                    levelLists[item.recordDate + item.dataItem] = item.dataValue
                } else {
                    if (fIndex !== -1) {
                        // 已存在
                        valueList[fIndex][item.recordDate] = item.dataValue
                    } else {
                        valueList.push(Object.assign(item, { [item.recordDate]: item.dataValue }))
                    }
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            reData = valueList.map((v) => {
                let yoy = ""
                const lastIndex = yearList.length - 1
                const lastSecondIndex = yearList.length - 2
                let key = levelLists[yearList[yearList.length - 1] + v.dataItem + '异常等级']
                if (v[yearList[lastIndex]] && v[yearList[lastSecondIndex]]) {
                    yoy = Math.round((v[yearList[lastIndex]] - v[yearList[lastSecondIndex]]) / v[yearList[lastSecondIndex]] * 10000) / 10000
                }
                return Object.assign(v, {
                    level: key,
                    yoy
                })
            })
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
                        dataIndex: 'yoy',
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                        scopedSlots: { customRender: 'yoy' },
                    });
                    analysis.push({
                        title: yearList[yearList.length - 1] + '异常等级',
                        dataIndex: 'level',
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                        scopedSlots: { customRender: 'yclevel' },
                    });
                }
            })
            reData = reData.filter((inI) => inI.level && inI.level !== '正常' && inI.level !== '过滤').sort((a, b) => a.id - b.id)
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
            break;
        case '衍生异常指标':
            const dD = {}
            let valuelist = []
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!item.dataItem.includes('异常等级')) {
                    if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                    const ycIndex = sortData.findIndex((yc) => yc.dataItem === item.dataItem + '异常等级' && yc.recordDate == item.recordDate)
                    const level = ycIndex !== -1 ? sortData[ycIndex].dataValue : ''
                    if (level && level !== '正常' && level !== '过滤') {
                        valuelist.push(Object.assign(item, {
                            level
                        }))
                    }
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            const yearLength = yearList.length;
            let maxL = 0
            let maxYear = null
            yearList.forEach((y, index) => {
                if (index >= (yearLength - 3)) {
                    dD[y] = valuelist.filter((vv) => vv.recordDate === y)
                    if (maxL < dD[y].length) {
                        maxL = dD[y].length
                        maxYear = y
                    }
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
                            title: `指标名称`,
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
                            dataIndex: `${y}dataValue`,
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                        }, {
                            title: '异常等级',
                            dataIndex: `${y}level`,
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            },
                            scopedSlots: { customRender: 'yclevel' },
                        }]
                    });
                }
            })
            if (maxYear) {
                dD[maxYear].forEach((ii, index) => {
                    let inReData = {}
                    for (const key in dD) {
                        if (Object.prototype.hasOwnProperty.call(dD, key)) {
                            const element = dD[key][index];
                            if (element) {
                                inReData[`${element.recordDate}dataItem`] = element.dataItem;
                                inReData[`${element.recordDate}dataValue`] = element.dataValue;
                                inReData[`${element.recordDate}level`] = element.level;
                            }
                        }
                    }
                    reData.push(inReData)
                })
            }
            columns = analysis
            break;
    }
    return { reData, columns }
}

export function dealColumnsNew(data, type, secondLevel) {
    let columns = [];
    let reData = [];
    let yearList = [];
    let analysis = [];
    let sortData = null;
    switch (type) {
        case '财务基础指标':
            // 分两种情况： 枚举值为：负债表、利润表、现金流量表，以及财务报表
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
                                    backgroundColor: '#E5EDF9'
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
                                        backgroundColor: '#E5EDF9'
                                    }
                                };
                            },
                            scopedSlots: { customRender: 'yoy' },
                        })
                    }
                }
            })
            if (secondLevel) {
                columns = [
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
                ]
            } else {
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
            }
            return { reData, columns }
        case '财务异常指标':
        case '衍生异常指标':
            const levelLists = {}
            const valueList = []
            const reDataList = []
            let yearResearchInfo = null
            sortData = data.sort(wenzistartSort("secondLevel"));
            sortData.forEach(item => {
                if (!yearList.includes(item.recordDate)) yearList.push(item.recordDate);
                const fIndex = valueList.findIndex((i) => i.dataItem === item.dataItem)
                if (item.dataItem.includes('异常等级')) {
                    levelLists[item.recordDate + item.dataItem] = item.dataValue
                } else {
                    if (item.researchList && item.researchList.length) {
                        yearResearchInfo = item.researchList[0]
                    }
                    if (fIndex !== -1) {
                        // 已存在
                        valueList[fIndex][item.recordDate] = item.dataValue
                        valueList[fIndex][item.recordDate + 'searchInfo'] = yearResearchInfo
                        yearResearchInfo = null
                    } else {
                        valueList.push(Object.assign(item, { [item.recordDate]: item.dataValue, [item.recordDate + 'searchInfo']: yearResearchInfo }))
                        yearResearchInfo = null
                    }
                }
            });
            yearList = yearList.sort((a, b) => Number(a) - Number(b));
            reData = valueList.map((v) => {
                const reO = {}
                yearList.forEach((yi, index) => {
                    if (index !== 0) {
                        // 同比
                        if (parseFloat(v[yearList[index]]) && parseFloat(v[yearList[index - 1]])) {
                            reO[yi + 'yoy'] = Math.round((parseFloat(v[yearList[index]]) - parseFloat(v[yearList[index - 1]])) / parseFloat(v[yearList[index - 1]]) * 10000) / 10000
                        }
                    }
                    reO[yi + 'level'] = levelLists[yi + v.dataItem + '异常等级']
                })
                return Object.assign(v, {
                    ...reO
                })
            })
            yearList.forEach((y, index) => {
                analysis = []
                analysis.push({
                    title: y + '年数据',
                    dataIndex: y,
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#ccdcfc',
                            }
                        };
                    },
                })
                analysis.push({
                    title: '增长率',
                    dataIndex: y + 'yoy',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#ccdcfc',
                            }
                        };
                    },
                    scopedSlots: { customRender: 'yoy' },
                });
                analysis.push({
                    title: '异常等级',
                    dataIndex: y + 'level',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#ccdcfc',
                            }
                        };
                    },
                    scopedSlots: { customRender: 'yclevel' },
                });
                analysis.push({
                    title: '现场调研结果',
                    width: 200,
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#ccdcfc',
                            }
                        };
                    },
                    scopedSlots: { customRender: 'searchResult' },
                });
                analysis.push({
                    title: '上传',
                    customHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: '#ccdcfc',
                            }
                        };
                    },
                    scopedSlots: { customRender: 'uploadFile' },
                });
                columns.push({
                    year: y,
                    columns: [{
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
                    ...analysis]
                },)

                const rr = []
                reData.forEach((reV) => {
                    if (reV[y + 'level'] && reV[y + 'level'] !== '正常' && reV[y + 'level'] !== '过滤') {
                        rr.push({
                            dataItem: reV.dataItem,
                            [y]: reV[y],
                            [y + 'yoy']: reV[y + 'yoy'],
                            [y + 'level']: reV[y + 'level'],
                            searchInfo: reV[y + 'searchInfo'],
                            creditCode: reV.creditCode
                        })
                    }
                })
                reDataList.push({
                    year: y,
                    reData: rr
                })
            })
            return { reData: reDataList.reverse(), columns: columns.reverse() }
    }
}

function wenzistartSort(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        if (!value1 || !value2) {
            return 0
        }
        return value1.localeCompare(value2)
    }
}