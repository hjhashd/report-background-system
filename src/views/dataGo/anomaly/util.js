/*
 * @Author: bekon
 * @Date: 2025-03-12 13:54:33
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-27 21:13:28
 * @FilePath: /report-background-system/src/views/dataGo/anomaly/util.js
 * @Description: 
 * 
 */

const jy1 = ["销售商品、提供劳务收到的现金", "收到其他与经营活动有关的现金", "经营活动现金流入小计", "购买商品、接受劳务支付的现金", "支付给职工以及为职工支付的现金", "支付的各项税费", "支付其他与经营活动有关的现金", "经营活动现金流出小计", "经营活动产生的现金流量净额"]
const jy2 = ["收回投资收到的现金", "取得投资收益收到的现金", "处置固定资产、无形资产和其他长期资产收回的现金净额", "取得其他与投资活动有关的现金", "投资活动现金流入小计", "购建固定资产、无形资产和其他长期资产支付的现金", "投资支付的现金", "取得子公司及其他营业单位支付的现金净额", "支付其他与投资活动有关的现金", "投资活动现金流出小计", "投资活动产生的现金流量净额"]
const jy3 = ["吸收投资收到的现金", "取得借款收到的现金", "发行债券收到的现金", "收到其他与筹资活动有关的现金", "筹资活动现金流入小计", "偿还债务支付的现金", "分配股利、利润或偿付利息支付的现金", "支付其他与筹资活动有关的现金", "筹资活动现金流出小计", "筹资活动产生的现金流量净额", "四、汇率变动对现金及现金等价物的影响", "五、现金及现金等价物净增加额", "加：期初现金及现金等价物余额", "六、期末现金及现金等价物余额"]
const fz = ["货币资金", "应收票据", "应收账款", "预付款项", "其他应收款", "存货", "流动资产", "固定资产", "长期待摊费用", "非流动性资产", "资产总计", "短期负债", "应付票据", "应付账款", "预收款项", "应付职工薪酬", "应交税费", "其他应付款", "一年内到期的非流动负债", "流动负债合计", "长期借款", "非流动负债", "负债合计",]
const lr = ["营业收入", "营业成本", "销售费用", "管理费用", "研发费用", "财务费用", "利息收入", "资产减值损失", "营业利润", "利润总额", "净利润", "综合收益总额"]
const sortFirst = [{
    title: "一、经营活动产生的现金流量",
    data: jy1,
}, {
    title: "二、投资活动产生的现金流量",
    data: jy2,
}, {
    title: "三、筹资活动产生的现金流量",
    data: jy3,
}]

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
                // 整理reData
                let dealSortData = []
                if (secondLevel == '负债表' || secondLevel == '利润表') {
                    const forList = secondLevel == '负债表' ? fz : lr
                    forList.forEach((u) => {
                        const item = reData.find((i) => i.dataItem == u)
                        if (item) {
                            dealSortData.push(item)
                        }
                    })
                    reData = dealSortData
                    columns = [
                        {
                            title: '年份',
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
                } else if (secondLevel == '现金流量表') {
                    sortFirst.forEach((fir) => {
                        dealSortData.push({
                            dataItem: fir.title,
                            col: analysis.length,
                            index: dealSortData.length
                        })
                        fir.data.forEach((u) => {
                            const item = reData.find((i) => i.dataItem == u)
                            if (item) {
                                dealSortData.push(item)
                            }
                        })
                    })
                    reData = dealSortData
                    columns = [{
                        title: '年份',
                        dataIndex: 'dataItem',
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#ccdcfc',
                                }
                            };
                        },
                        customRender: (text, record, index) => {
                            return {
                                children: text,
                                attrs: {
                                    colSpan: record.col + 1 || 1,
                                },
                                style: {
                                    textAlign: record.col ? 'center' : 'left',
                                    fontWeight: record.col ? 'bold' : 'normal',
                                }
                            }
                        },
                    }]
                    const dealA = []
                    analysis.forEach((u) => {
                        dealA.push(Object.assign(u, {
                            customRender: (text, record, index) => {
                                return {
                                    children: text,
                                    attrs: {
                                        colSpan: record.col ? 0 : 1
                                    }
                                }
                            },
                        }))
                    })

                    columns.push(...dealA)
                    return { reData, columns }
                } else {
                    columns = [
                        {
                            title: '年份',
                            dataIndex: 'dataItem',
                            customHeaderCell: () => {
                                return {
                                    style: {
                                        backgroundColor: '#ccdcfc',
                                    }
                                };
                            }
                        },
                        ...analysis
                    ]
                }
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
            let yearFileList = null
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
                    if (item.fileList && item.fileList.length) {
                        yearFileList = item.fileList
                    }
                    if (fIndex !== -1) {
                        // 已存在
                        valueList[fIndex][item.recordDate] = item.dataValue
                        valueList[fIndex][item.recordDate + 'searchInfo'] = yearResearchInfo
                        valueList[fIndex][item.recordDate + 'fileList'] = yearFileList
                        yearResearchInfo = null
                        yearFileList = null
                    } else {
                        valueList.push(Object.assign(item, { [item.recordDate]: item.dataValue, [item.recordDate + 'searchInfo']: yearResearchInfo, [item.recordDate + 'fileList']: yearFileList }))
                        yearResearchInfo = null
                        yearFileList = null
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
                            year: y,
                            dataItem: reV.dataItem,
                            [y]: reV[y],
                            [y + 'yoy']: reV[y + 'yoy'],
                            [y + 'level']: reV[y + 'level'],
                            searchInfo: reV[y + 'searchInfo'],
                            fileList: reV[y + 'fileList'],
                            creditCode: reV.creditCode,
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