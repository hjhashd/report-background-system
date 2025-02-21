/*
 * @Author: bekon
 * @Date: 2025-02-21 14:03:14
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-21 14:06:29
 * @FilePath: /report-background-system/src/api/qrcode.js
 * @Description:二维码相关接口 
 * 
 */
import request from '@/utils/request'

const qrCodeApi = {
    bankTree: '/report/agent/code/bank/tree',
    buildQRCode: '/report/agent/code/generate',
    getQRCodeList: '/report/agent/code/list',
    changeQRCode: '/report/agent/code/update',
    getQRCodeDetail: '/report/agent/code/info/',
}

export function bankTree() {
    return request({
        url: qrCodeApi.bankTree,
        method: 'get'
    })
}

export function buildQRCode(parameter) {
    return request({
        url: qrCodeApi.buildQRCode,
        method: 'post',
        data: parameter
    })
}

export function getQRCodeList(parameter) {
    return request({
        url: qrCodeApi.getQRCodeList,
        method: 'post',
        data: parameter
    })
}

export function changeQRCode(parameter) {
    return request({
        url: qrCodeApi.changeQRCode,
        method: 'post',
        data: parameter
    })
}

export function getQRCodeDetail(id) {
    return request({
        url: qrCodeApi.getQRCodeDetail + id,
        method: 'get'
    })
}