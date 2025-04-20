/*
 * @Author: bekon
 * @Date: 2025-02-21 14:25:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-20 10:51:52
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
    getAbnormalNew: '/report/entity/customer/abnormal/list/'
}

export function getIndustryClassify() {
    return request({
        url: reportAPI.getIndustryClassify,
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

// 获取报告的config
export function getIndustryReportConfig(id) {
    return request({
        url: `${reportAPI.getIndustryReportConfig}${id}`,
        method: 'get',
    })
}
