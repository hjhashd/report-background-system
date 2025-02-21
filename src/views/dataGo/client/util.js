/*
 * @Author: bekon
 * @Date: 2025-02-21 15:22:28
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 15:30:08
 * @FilePath: /report-background-system/src/views/dataGo/uploadData/util.js
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