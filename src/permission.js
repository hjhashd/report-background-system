import router, { resetRouter } from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register', 'registerResult'] // no redirect allowList
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`)
  /* has token */
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // request login userInfo
        store
          .dispatch('GetInfo')
          .then(res => {
            // console.log('res', res)
            // 根据用户权限信息生成可访问的路由表
            store.dispatch('GenerateRoutes', { token, ...res }).then(() => {
              // 动态添加可访问路由表
              // VueRouter@3.5.0+ New API
              resetRouter() // 重置路由 防止退出重新登录或者 token 过期后页面未刷新，导致的路由重复添加
              store.getters.addRouters.forEach(r => {
                router.addRoute(r)
              })
              // 请求带有 redirect 重定向时，登录自动重定向到该地址
              const redirect = decodeURIComponent(from.query.redirect || to.path)
              if (to.path === redirect) {
                // set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true })
              } else {
                // 跳转到目的路由
                next({ path: redirect })
              }
            })
          })
          .catch(() => {
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试'
            })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    // 演示模式：自动注入令牌并跳过登录
    const demoToken = 'demo-token'
    const expireAt = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    storage.set(ACCESS_TOKEN, demoToken, expireAt)
    store.commit('SET_TOKEN', demoToken)
    store
      .dispatch('GetInfo')
      .then(res => {
        store.dispatch('GenerateRoutes', { token: demoToken, ...res }).then(() => {
          resetRouter()
          store.getters.addRouters.forEach(r => {
            router.addRoute(r)
          })
          const redirect = decodeURIComponent(from.query.redirect || to.path)
          if (to.path === redirect || to.path === loginRoutePath) {
            next({ path: defaultRoutePath, replace: true })
          } else {
            next({ path: redirect })
          }
        })
      })
      .catch(() => {
        // 如果获取用户信息失败，仍然强制跳转到默认页，避免出现登录页
        next({ path: defaultRoutePath })
      })
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
