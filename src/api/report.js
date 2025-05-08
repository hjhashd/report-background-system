/*
 * @Author: bekon
 * @Date: 2025-02-21 14:25:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-05-08 13:42:36
 * @FilePath: /report-background-system/src/api/report.js
 * @Description: 
 * 
 */
import request from '@/utils/request'

const reportAPI = {
    dataAccredit: '/report/data/accredit/lately/dataAccredit',
    getCustomerList: '/system/agent/user/customer/list',
    accreditUploadList: '/report/data/accredit/finance/files/',
    customerData: '/report/entity/data/table/config',
    buildReport: '/report/entity/save/report',
    wopiFile: '/report/office/config/',
    abnormalReport: '/report/entity/abnormal/report',
    reportList: '/report/entity/list',
    getReportModal: '/report/entity/template/list',
    getModalInfo: '/report/entity/template/type/list',
    uploadFile: '/report/entity/upload/data/',
    getReportDetail: '/report/entity/',
    reportContentList: '/report/entity/content/list',
    deleteReportContent: '/report/entity/content/delete/',
    saveReportContent: '/report/entity/content/save/as',
    useReportContent: '/report/entity/content/apply',
    getCustomerDetail: '/system/agent/user/customer/info/',
    updateReportDate: '/report/entity/batch/update/data/',
    getModalList: '/report/entity/content/title/list/',
    updateReport: '/report/entity/update/report/',
    applyReport: '/report/entity/publish/',
    setDraftStatus: '/report/entity/draft/',
    getCustomerAbnormalList: '/report/entity/customer/abnormal/list/',
    AI: '/report/entity/content/optimize',
    viewReportTable: '/report/entity/preview/data',
    appUploadFile: '/report/data/accredit/lately/detail',
    industryReportList: '/report/industry/list',
    getIndustryClassify: '/report/industry/classify',
    getIndustryReportConfig: '/report/office/industry/config/',
    getAIConfig: '/report/entity/ai/content',
    getAbnormalNew: '/report/entity/customer/abnormal/list/',
    dUploadFile: '/report/entity/indicators/batch/upload',
    updateSearchContent: '/report/entity/indicators/save',
    importCashFlow: '/report/v2/entity/import/cashFlow',
    importBalanceSheet: '/report/v2/entity/import/balanceSheet',
    importProfitSheet: '/report/v2/entity/import/profitSheet',
    importNormal: '/report/v2/entity/upload/data',
    getCashFlowFields: '/report/v2/entity/cashFlow/fields',
    getBalanceSheetFields: '/report/v2/entity/balanceSheet/fields',
    getProfitSheetFields: '/report/v2/entity/profitSheet/fields',
    getNormalFields: '/report/v2/entity/table/fields/',
    getAppFileList: '/report/v2/entity/client/upload/files',
    deleteFile: '/report/v2/entity/indicators/delete/file/',
    deleteSearchContent: '/report/entity/indicators/',
    uploadProof: '/report/v2/entity/proof/file/upload',
    updateTable: '/report/v2/entity/update/table/data',
    deleteProofFile: '/report/v2/entity/delete/proof/file/',
    getProofFile: '/report/v2/entity/proof/file/list',
    deleteReport: '/report/entity/',
    getAIType: '/report/v2/entity/ai/content/type?creditCode=',
    batchDeleteReport: '/report/entity/batch/delete'
}

// 获取证明材料
export function getProofFile(parameter) {
    return request({
        url: reportAPI.getProofFile,
        method: 'post',
        data: parameter
    })
}

// 更新证明材料
export function uploadProof(parameter) {
    return request({
        url: reportAPI.uploadProof,
        method: 'post',
        data: parameter
    })
}

// 更新表
export function updateTable(parameter) {
    return request({
        url: reportAPI.updateTable,
        method: 'post',
        data: parameter
    })
}

// 删除报告
export function deleteReport(id) {
    return request({
        url: reportAPI.deleteReport + id,
        method: 'delete',
    })
}

// 删除证明材料
export function deleteProofFile(id) {
    return request({
        url: reportAPI.deleteProofFile + id,
        method: 'delete',
    })
}

// 删除指标文件
export function deleteFile(id) {
    return request({
        url: reportAPI.deleteFile + id,
        method: 'delete',
    })
}
// 删除现场调研接口
export function deleteSearchContent(id) {
    return request({
        url: reportAPI.deleteSearchContent + id,
        method: 'delete',
    })
}
// 删除
export function batchDeleteReport(ids) {
    return request({
        url: reportAPI.batchDeleteReport,
        method: 'delete',
        data: ids
    })
}
export function getAppFileList(parameter) {
    return request({
        url: reportAPI.getAppFileList,
        method: 'post',
        data: parameter
    })
}

// 获取上传数据表格Fields
export function getFields(clickItem) {
    const { tableNameZh, id } = clickItem
    switch (tableNameZh) {
        case '现金流量表':
            return request({
                url: reportAPI.getCashFlowFields,
                method: 'get',
            })
        case '利润表':
            return request({
                url: reportAPI.getProfitSheetFields,
                method: 'get',
            })
        case '资产负债表':
            return request({
                url: reportAPI.getBalanceSheetFields,
                method: 'get',
            })
        default:
            return request({
                url: reportAPI.getNormalFields + id,
                method: 'get',
            })
    }
}

// 导入数据文件
export function pullTableData(clickItem, data, pickFieldsData, mapping) {
    const { tableNameZh, id } = clickItem
    switch (tableNameZh) {
        case '现金流量表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importCashFlow,
                method: 'post',
                data
            })
        case '利润表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importProfitSheet,
                method: 'post',
                data
            })
        case '资产负债表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importBalanceSheet,
                method: 'post',
                data
            })
        default:
            data.append('tableId', id)
            let mapIn = {}
            pickFieldsData.forEach(element => {
                mapIn[element.sysEn] = element.excelEn
            });
            data.append('mapping', JSON.stringify(mapIn))
            return request({
                url: reportAPI.importNormal,
                method: 'post',
                data
            })
    }
}

export function getIndustryClassify() {
    return request({
        url: reportAPI.getIndustryClassify,
        method: 'get',
    })
}

export function getAIType(creditCode) {
    return request({
        url: reportAPI.getAIType + creditCode,
        method: 'get',
    })
}

export function industryReportList(parameter) {
    return request({
        url: reportAPI.industryReportList,
        method: 'post',
        data: parameter
    })
}

export function dataAccredit(parameter) {
    return request({
        url: reportAPI.dataAccredit,
        method: 'post',
        data: parameter
    })
}

export function getCustomerList(parameter) {
    return request({
        url: reportAPI.getCustomerList,
        method: 'post',
        data: parameter
    })
}

export function accreditUploadList(id) {
    return request({
        url: reportAPI.accreditUploadList + id,
        method: 'get'
    })
}

export function customerData(parameter) {
    return request({
        url: reportAPI.customerData,
        method: 'post',
        data: parameter
    })
}

export function buildReport(parameter) {
    return request({
        url: reportAPI.buildReport,
        method: 'post',
        data: parameter
    })
}

export function wopiFile(id) {
    return request({
        url: reportAPI.wopiFile + id,
        method: 'get'
    })
}

export function abnormalReport(parameter) {
    return request({
        url: reportAPI.abnormalReport,
        method: 'post',
        data: parameter
    })
}

export function reportList(parameter) {
    return request({
        url: reportAPI.reportList,
        method: 'post',
        data: parameter
    })
}

export function getReportModal(parameter) {
    return request({
        url: reportAPI.getReportModal,
        method: 'post',
        data: parameter
    })
}

export function uploadFile(parameter, customerId) {
    return request({
        url: reportAPI.uploadFile + customerId,
        method: 'post',
        data: parameter
    })
}

export function getModalInfo() {
    return request({
        url: reportAPI.getModalInfo,
        method: 'get',
    })
}

// 获取报告详情信息
export function getReportDetail(id) {
    return request({
        url: reportAPI.getReportDetail + id,
        method: 'get',
    })
}

// 获取报告评价内容列表
export function reportContentList(parameter) {
    return request({
        url: reportAPI.reportContentList,
        method: 'post',
        data: parameter
    })
}

// 获取AI智能内容
export function getAIConfig(parameter) {
    return request({
        url: reportAPI.getAIConfig,
        method: 'post',
        data: parameter
    })
}

// 获取报告评价内容列表
export function deleteReportContent(id) {
    return request({
        url: reportAPI.deleteReportContent + id,
        method: 'delete',
    })
}

// 另存为报告评价内容
export function saveReportContent(parameter) {
    return request({
        url: reportAPI.saveReportContent,
        method: 'post',
        data: parameter
    })
}

// 应用报告评价内容
export function useReportContent(parameter) {
    return request({
        url: reportAPI.useReportContent,
        method: 'post',
        data: parameter
    })
}

// 更新报告数据文档 
export function updateReportDate(parameter, id) {
    return request({
        url: reportAPI.updateReportDate + id,
        method: 'post',
        data: parameter
    })
}

// 获取客户详情信息
export function getCustomerDetail(id) {
    return request({
        url: reportAPI.getCustomerDetail + id,
        method: 'get',
    })
}

// 获取报告结论模板列表
export function getModalList(id) {
    return request({
        url: reportAPI.getModalList + id,
        method: 'get',
    })
}

// 更新报告 
export function updateReport(id) {
    return request({
        url: reportAPI.updateReport + id,
        method: 'post',
    })
}

// 发布报告
export function applyReport(id, name) {
    return request({
        url: reportAPI.applyReport + id + '?reportName=' + name,
        method: 'post',
    })
}

// 将报告状态转为草稿
export function setDraftStatus(id, name) {
    return request({
        url: reportAPI.setDraftStatus + id + '?reportName=' + name,
        method: 'post',
    })
}

// AI优化
export function toAi(parameter) {
    return request({
        url: reportAPI.AI,
        method: 'post',
        data: parameter
    })
}

export function viewReportTable(parameter) {
    return request({
        url: reportAPI.viewReportTable,
        method: 'post',
        data: parameter
    })
}

export function appUploadFile(parameter) {
    return request({
        url: reportAPI.appUploadFile,
        method: 'post',
        data: parameter
    })
}

export function dUploadFile(parameter) {
    return request({
        url: reportAPI.dUploadFile,
        method: 'post',
        data: parameter
    })
}

// 将报告状态转为草稿
export function getCustomerAbnormalList(id, type) {
    return request({
        url: `${reportAPI.getCustomerAbnormalList}${id}?firstLevel=${type}`,
        method: 'get',
    })
}

// 获取异常数据-new
export function getAbnormalNew(id, parameter) {
    return request({
        url: `${reportAPI.getAbnormalNew}${id}`,
        method: 'post',
        data: parameter
    })
}

// 更新content
export function updateSearchContent(parameter) {
    return request({
        url: `${reportAPI.updateSearchContent}`,
        method: 'post',
        data: parameter
    })
}

// 获取报告的config
export function getIndustryReportConfig(id) {
    return request({
        url: `${reportAPI.getIndustryReportConfig}${id}`,
        method: 'get',
    })
}
