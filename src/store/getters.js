/*
 * @Author: bekon
 * @Date: 2022-10-10 22:31:07
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 17:04:51
 * @FilePath: /report-background-system/src/store/getters.js
 * @Description: 
 * 
 */
const getters = {
  isMobile: state => state.app.isMobile,
  lang: state => state.app.lang,
  theme: state => state.app.theme,
  color: state => state.app.color,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  nickname: state => state.user.name,
  welcome: state => state.user.welcome,
  roles: state => state.user.roles,
  userInfo: state => state.user.info,
  addRouters: state => state.permission.addRouters,
  multiTab: state => state.app.multiTab,
  buildQrCodePop: state => state.app.buildQrCodePop,
}

export default getters
