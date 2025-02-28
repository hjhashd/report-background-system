/*
 * @Author: bekon
 * @Date: 2025-02-13 16:01:48
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-28 18:12:07
 * @FilePath: /report-background-system/src/api/login.js
 * @Description: 
 * 
 */
import request from '@/utils/request'

const userApi = {
  Login: '/auth/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserInfo: '/user/info',
  UserMenu: '/user/nav',

  // ai api
  AILogin: '/auth/agent/login',
  AIRegister: '/system/agent/user/register',
  AIGetCode: '/auth/sms/sendCode',
  AILogout: '/auth/agent/logout',
  AILoginByCode: '/auth/agent/sms/login',
  AIGetInfo: '/system/agent/user/getInfo',
  AIChangeInfo: '/system/agent/user/profile',
  AISetPsw: '/system/agent/user/setPassword',
  AIRegisterSmsCode: '/system/agent/user/register/smsCode',
}

export function AILogin (parameter) {
  return request({
    url: userApi.AILogin,
    method: 'post',
    data: parameter
  })
}

export function AIRegister (parameter) {
  return request({
    url: userApi.AIRegister,
    method: 'post',
    data: parameter
  })
}

export function AIGetCode (parameter) {
  return request({
    url: userApi.AIGetCode,
    method: 'post',
    data: parameter
  })
}

export function AIRegisterSmsCode (parameter) {
  return request({
    url: userApi.AIRegisterSmsCode,
    method: 'post',
    data: parameter
  })
}

export function AILoginByCode (parameter) {
  return request({
    url: userApi.AILoginByCode,
    method: 'post',
    data: parameter
  })
}

export function AIGetInfo () {
  return request({
    url: userApi.AIGetInfo,
    method: 'get'
  })
}

export function AIChangeInfo (parameter) {
  return request({
    url: userApi.AIChangeInfo,
    method: 'put',
    data: parameter
  })
}

export function AISetPsw (parameter) {
  return request({
    url: userApi.AISetPsw,
    method: 'post',
    data: parameter
  })
}

export function AILogout () {
  return request({
    url: userApi.AILogout,
    method: 'delete'
  })
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return request({
    url: userApi.Login,
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha (parameter) {
  return request({
    url: userApi.SendSms,
    method: 'post',
    data: parameter
  })
}

export function getInfo () {
  return request({
    url: userApi.UserInfo,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export function getCurrentUserNav () {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}

export function logout () {
  return request({
    url: userApi.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

/**
 * get user 2step code open?
 * @param parameter {*}
 */
export function get2step (parameter) {
  return request({
    url: userApi.twoStepCode,
    method: 'post',
    data: parameter
  })
}
