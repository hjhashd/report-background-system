/*
 * @Author: bekon
 * @Date: 2022-10-10 22:31:07
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 11:37:19
 * @FilePath: /report-background-system/src/utils/filter.js
 * @Description: 
 * 
 */
import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { yongtu } from '@/config/constants';
moment.locale('zh-cn')

Vue.filter('NumberFormat', function (value) {
  if (!value) {
    return '0'
  }
  const intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
  return intPartFormat
})

Vue.filter('dayjs', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

Vue.filter('showReportName', function (v) {
  return yongtu.find((i) => i.id == v).name
})
