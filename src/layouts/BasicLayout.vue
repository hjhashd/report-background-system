<template>
  <pro-layout
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <template v-slot:menuHeaderRender>
      <div v-if="collapsed">
        <img src="@/assets/logo.png" />
      </div>
      <div style="z-index: 1000" @click="preventStop" v-if="!collapsed">
        <div>
          <img src="@/assets/logo.png" />
          <h1>{{ title }}</h1>
        </div>
        <div class="user-box flex-row-spacearound">
          <div class="user-ava">
            <a-avatar :src="userInfo.avatar" style="width: 48px; height: 48px" />
            <a-tooltip placement="right">
              <template slot="title">
                <div class="user-name">{{ userInfo.userName }}</div>
              </template>
              <div class="user-name single-line-text">{{ userInfo.userName }}</div>
            </a-tooltip>
          </div>
          <div style="text-align: center">
            <div @click="buildQRcode">
              <img
                class="code-img"
                src="@/assets/images/apply-data.png"
                alt="点击生产二维码"
                style="width: 52px; height: 52px"
              />
            </div>
            <a-button style="margin-top: 20px" type="link" size="small" @click="logout"> 退出 </a-button>
          </div>
        </div>
        <div class="user-report-info" v-if="overview">
          <div class="report-info-item">
            <div class="num">{{ overview[0].sum }}</div>
            <div class="item-name">客户</div>
          </div>
          <div class="report-info-item">
            <div class="num num1">{{ overview[2].sum }}</div>
            <div class="item-name">报告</div>
          </div>
          <div class="report-info-item">
            <div class="num num2">{{ overview[4].sum }}</div>
            <div class="item-name">草稿</div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>
    <router-view />

    <!-- 全局弹窗-生产二维码 -->
    <a-modal
      class="qr-modal"
      v-model="buildQrCodePop"
      :footer="null"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @cancel="toClosePop"
    >
      <build-q-r-code :userInfo="userInfo" @close="toClosePop"></build-q-r-code>
    </a-modal>
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapState, mapActions } from 'vuex'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import { buildQRCode } from '@/components'
import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import Ads from '@/components/Other/CarbonAds'
import { Modal } from 'ant-design-vue'
export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent,
    GlobalFooter,
    Ads,
    buildQRCode,
  },
  data() {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end
      isDev: process.env.NODE_ENV === 'development' || process.env.VUE_APP_PREVIEW === 'true',
      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,
        hideHintAlert: false,
        hideCopyButton: false,
      },
      // 媒体查询
      query: {},
      // 是否手机模式
      isMobile: false,
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: (state) => state.permission.addRouters,
      userInfo: (state) => state.user.info,
      buildQrCodePop: (state) => state.user.buildQrCodePop,
      overview: (state) => state.user.overview,
    }),
  },
  created() {
    const routes = this.mainMenu.find((item) => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
    this.getOverView()
  },
  mounted() {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
      updateTheme(this.settings.primaryColor)
    }
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop', 'getOverView']),
    i18nRender,
    handleMediaQuery(val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse(val) {
      this.collapsed = val
    },
    handleSettingChange({ type, value }) {
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fixed
          }
          break
      }
    },
    preventStop(event) {
      event.preventDefault()
    },
    buildQRcode(event) {
      event.preventDefault()
      this.changeBuildQrCodePop(true)
    },
    toClosePop(event) {
      if (event) {
        event.preventDefault()
      }
      this.changeBuildQrCodePop(false)
    },
    logout() {
      Modal.confirm({
        title: this.$t('layouts.usermenu.dialog.title'),
        content: this.$t('layouts.usermenu.dialog.content'),
        onOk: () => {
          // return new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1500)
          // }).catch(() => console.log('Oops errors!'))
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel() {},
      })
    },
  },
}
</script>

<style lang="less">
@import './BasicLayout.less';
.ant-pro-sider-menu-logo {
  height: auto;
}
.ant-layout-header,
.ant-pro-global-header,
.ant-pro-global-header-trigger {
  height: 48px !important;
  line-height: 48px !important;
}
.ant-pro-global-header-index-right .ant-pro-account-avatar .antd-pro-global-header-index-avatar {
  margin: calc((48px - 24px) / 2) 10px;
}
.user-box {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  line-height: 1.2;
  .user-ava {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .user-name {
    max-width: 80px;
    text-align: center;
    margin-top: 15px;
    font-family: PingFangSC-Regular;
    font-size: 21px;
    color: #afabc2;
    font-weight: 400;
  }
}
.user-report-info {
  margin-top: 20px;
  margin-left: -24px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
  cursor: default;
  .report-info-item {
    text-align: center;
    line-height: 1.5;
    .num {
      font-size: 16px;
      font-weight: bold;
      color: #1789ff;
      &.num1 {
        color: #10884b;
      }
      &.num2 {
        color: #fa8306;
      }
    }
    .item-name {
      color: #afabc2;
    }
  }
}
.qr-modal {
  .ant-modal-content {
    background: #ffffff url(~@/assets/images/pop-header-bg.png) no-repeat;
    background-size: 100% 100%;
    border-radius: 20px;
  }
}
.ant-layout-content {
  opacity: 0.8;
  background: #f2f2f7;
}
.code-img {
  border-radius: 50%;
  box-shadow: 0px 4px 11px 3px rgba(27, 104, 255, 1);
}
</style>
