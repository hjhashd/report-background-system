/*
 * @Author: bekon
 * @Date: 2025-02-21 14:25:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-27 18:59:17
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
    wopiFile: '/report/onlyoffice/config/',
    abnormalReport: '/report/entity/abnormal/report',
    reportList: '/report/entity/list',
    getReportModal: '/report/entity/template/list',
    getModalInfo: '/report/entity/template/type/list',
    uploadFile: '/report/entity/upload/data/'
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