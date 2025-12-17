/*
 * @Author: bekon
 * @Date: 2025-04-27 11:52:54
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-29 15:00:33
 * @FilePath: /report-background-system/src/components/UploadFileTab/util.js
 * @Description: 
 * */
export async function specialTableDeal(data) {
    const dealingData = JSON.parse(data)
    console.log("进入特殊化", dealingData)
    // 去除第一行和第二行，并判断length不为1，记录所有行的[0]信息
    let reField = [{
        "fieldName": null,
        "fieldNameCh": '--不匹配---'
    }]
    dealingData.forEach((i, index) => {
        if (index > 1 && i.length > 1 && reField.findIndex(u => u.fieldName == i[0]) == -1) {
            reField.push({
                "fieldName": i[0],
                "fieldNameCh": i[0]
            })
        }
    })
    return reField
}


/**
 * [重大修改] 2025-10-24
 * 重构 normalTableDeal 逻辑，以确保 `fieldName` (excelEn) 的生成逻辑在任何情况下都保持一致，
 * 供 `importToDatabase` 在后续步骤中复现。
 * * 规则：
 * 1. 检测单/双表头。
 * 2. 以“中文表头”为基准 (无论是第1行还是第2行)。
 * 3. 遍历中文表头：
 * - 如果中文表头单元格为空，则跳过（过滤）此列。
 * - 如果是“单表头”，`fieldName` = `fieldNameCh` (都等于中文名)。
 * - 如果是“双表头”，检查对应的 `enItem` (英文表头单元格)：
 * - 如果 `enItem` 有效，`fieldName` = `enItem`。
 * - 如果 `enItem` 无效 (null, undefined, 空字符串)，`fieldName` = `cnItem` (使用中文名作为 fallback)。
 */
// 在 util.js 的 normalTableDeal 函数中：

export async function normalTableDeal(data) {
    const aoaData = JSON.parse(data);
    console.log("进入正常表格处理 (util.js)", aoaData);

    if (!aoaData || aoaData.length === 0) {
        console.warn('Excel数据为空');
        return [{ fieldName: null, fieldNameCh: '--不匹配---' }];
    }

    const firstRow = aoaData[0] || [];
    const secondRow = aoaData.length > 1 ? aoaData[1] : [];

    // [新增] 检查第一行是否完全为空
    const isFirstRowEmpty = firstRow.every(cell => 
        cell === null || cell === undefined || String(cell).trim() === ''
    );

    const hasChinese = (str) => typeof str === 'string' && /[\u4e00-\u9fa5]/.test(str);
    
    // [修改] 如果第一行完全为空，则视为单中文表头（使用第二行）
    const isSingleChineseHeader = isFirstRowEmpty ? true : firstRow.some(hasChinese);

    let enRow, cnRow;

    if (isSingleChineseHeader) {
        console.log("util.js: 检测到单行中文表头模式");
        cnRow = isFirstRowEmpty ? secondRow : firstRow;
        enRow = cnRow; // 单表头模式，英文行=中文行
    } else {
        console.log("util.js: 检测到双行英文/中文表头模式");
        enRow = firstRow;
        cnRow = secondRow;
    }

    const reField = [];
    const maxLen = Math.max(enRow.length, cnRow.length);

    for (let index = 0; index < maxLen; index++) {
        const cnItem = cnRow[index];
        let enItem = enRow[index];

        // 核心过滤：必须有中文字段名，否则此列无效
        if (cnItem === null || cnItem === undefined || String(cnItem).trim() === '') {
            continue;
        }

        // 核心 fallback 逻辑：如果英文字段名无效，则使用中文字段名作为 fieldName
        if (enItem === null || enItem === undefined || String(enItem).trim() === '') {
            enItem = cnItem;
        }

        reField.push({
            "fieldName": String(enItem),
            "fieldNameCh": String(cnItem)
        });
    }

    return [{
        "fieldName": null,
        "fieldNameCh": '--不匹配---'
    }, ...reField];
}


export const columns = [
    {
        title: '系统字段',
        dataIndex: 'tableNameZhSource',
        key: 'tableNameZhSource',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'tableNameZhSource' },
    },
    {
        title: '导入文件字段',
        dataIndex: 'tableNameZh',
        key: 'tableNameZh',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'tableNameZh' },
    },
    {
        width: 100,
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'status' },
    },
]