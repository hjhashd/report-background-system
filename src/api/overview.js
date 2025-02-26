/*
 * @Author: bekon
 * @Date: 2025-02-26 20:18:59
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 21:16:55
 * @FilePath: /report-background-system/src/api/overview.js
 * @Description: 
 * 
 */
import request from '@/utils/request'

const overviewAPI = {
    statisticsCount: '/report/statistics/count',
    statisticsAnalyze: '/report/statistics/customer/analyze',
    manufacture: '/report/statistics/report/manufacture',
    complete: '/report/statistics/report/complete',
    getReportList: '/report/entity/list',
}

export function statisticsCount() {
    return request({
        url: overviewAPI.statisticsCount,
        method: 'get'
    })
}

export function statisticsAnalyze() {
    return request({
        url: overviewAPI.statisticsAnalyze,
        method: 'get'
    })
}

export function manufacture() {
    return request({
        url: overviewAPI.manufacture,
        method: 'get'
    })
}

export function complete() {
    return request({
        url: overviewAPI.complete,
        method: 'get'
    })
}

export function getReportList(params) {
    return request({
        url: overviewAPI.getReportList,
        method: 'post',
        data: params
    })
}