import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { AIGetInfo, AILogout, AILogin, AILoginByCode } from '@/api/login'
import { statisticsCount } from '@/api/overview'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'
import { info } from '@/mock/services/user';

storage.addPlugin(expirePlugin)

const overviewObj = {
  customerCount: '客户数',
  authCount: '授权数据',
  reportCount: '报告数量',
  waitUploadCount: '待上传数据',
  waitHandleCount: '待处理报告',
}

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    overview: null,
    buildQrCodePop: false,
    collapsed: false,
    fullScreen: false,
  },

  mutations: {
    SET_COLLAPSED: (state, collapsed) => {
      state.collapsed = collapsed
    },
    SET_FULLSCREEN: (state, fullScreen) => {
      state.fullScreen = fullScreen
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_BUILD_QRCODE: (state, status) => {
      state.buildQrCodePop = status
    },
    SET_OVERVIEW: (state, info) => {
      state.overview = info
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        AILogin(userInfo).then(response => {
          try {
            const result = response.data
            storage.set(ACCESS_TOKEN, result.access_token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.access_token)
            resolve()
          } catch (error) {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登录
    AILoginByCode({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        AILoginByCode(userInfo).then(response => {
          try {
            const result = response.data
            storage.set(ACCESS_TOKEN, result.access_token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.access_token)
            resolve()
          } catch (error) {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, dispatch }) {
      return new Promise((resolve, reject) => {
        // 请求后端获取用户信息 /api/user/info
        AIGetInfo().then(async (response) => {
          if (response.code === 200) {
            const mockinfos = await info();
            const { result } = mockinfos
            const { user } = response;
            if (result.role && result.role.permissions.length > 0) {
              const role = { ...result.role }
              role.permissions = result.role.permissions.map(permission => {
                const per = {
                  ...permission,
                  actionList: (permission.actionEntitySet || {}).map(item => item.action)
                }
                return per
              })
              role.permissionList = role.permissions.map(permission => { return permission.permissionId })
              // 覆盖响应体的 role, 供下游使用
              result.role = role
              const userInfo = Object.assign(result, user)
              commit('SET_ROLES', role)
              commit('SET_INFO', userInfo)
              commit('SET_NAME', { name: userInfo.username || userInfo.name, welcome: welcome() })
              commit('SET_AVATAR', userInfo.avatar)
              // 下游
              resolve(userInfo).then((re) => {
                resolve(re)
              })
            } else {
              dispatch('Logout')
            }
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        AILogout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    },

    // 打开/关闭生产二维码界面
    changeBuildQrCodePop({ commit }, status) {
      return new Promise((resolve) => {
        commit('SET_BUILD_QRCODE', status)
        resolve();
      })
    },

    setCollapsed({ commit }, status) {
      return new Promise((resolve) => {
        commit('SET_COLLAPSED', status)
        resolve();
      })
    },

    setFullScreen({ commit }, status) {
      return new Promise((resolve) => {
        commit('SET_FULLSCREEN', status)
        resolve();
      })
    },

    // 获取数据看板
    getOverView({ commit }) {
      statisticsCount().then((res) => {
        const reShow = []
        for (const key in res.data) {
          if (Object.prototype.hasOwnProperty.call(res.data, key)) {
            const num = res.data[key]
            reShow.push({
              name: overviewObj[key],
              src: require(`@/assets/images/${key}.png`),
              sum: num,
            })
          }
        }
        commit('SET_OVERVIEW', reShow)
      })
    }
  }
}

export default user
