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
    <!-- Ads begin
      广告代码 真实项目中请移除
      production remove this Ads
    -->
    <!-- <ads v-if="isProPreviewSite && !collapsed"/> -->
    <!-- Ads end -->

    <!-- 1.0.0+ 版本 pro-layout 提供 API，
          我们推荐使用这种方式进行 LOGO 和 title 自定义
    -->
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
            <a-avatar :src="userInfo.avatar" style="width: 50px; height: 50px" />
            <div class="user-name">{{ userInfo.userName }}</div>
          </div>
          <div @click="buildQRcode">
            <img src="@/assets/images/apply-data.png" alt="点击生产二维码" style="width: 60px; height: 50px" />
          </div>
        </div>
        <div class="user-report-info">
          <div class="report-info-item">
            <div class="num">-</div>
            <div class="item-name">客户</div>
          </div>
          <div class="report-info-item">
            <div class="num">-</div>
            <div class="item-name">报告</div>
          </div>
          <div class="report-info-item">
            <div class="num">-</div>
            <div class="item-name">草稿</div>
          </div>
        </div>
      </div>
    </template>
    <!-- 1.0.0+ 版本 pro-layout 提供 API,
          增加 Header 左侧内容区自定义
    -->
    <!-- <template v-slot:headerContentRender>
      <div>
        <a-tooltip title="刷新页面">
          <a-icon type="reload" style="font-size: 18px;cursor: pointer;" @click="() => { $message.info('只是一个DEMO') }" />
        </a-tooltip>
      </div>
    </template> -->
    <!-- <setting-drawer v-if="isDev" :settings="settings" @change="handleSettingChange">
      <div style="margin: 12px 0;">
        This is SettingDrawer custom footer content.
      </div>
    </setting-drawer> -->
    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>
    <!-- custom footer / 自定义Footer -->
    <!-- <template v-slot:footerRender>
      <global-footer />
    </template> -->
    <router-view />

    <!-- 全局弹窗-生产二维码 -->
    <a-modal
      class="qr-modal"
      v-model="buildQrCodePop"
      :footer="null"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
    >
      <build-q-r-code :userInfo="userInfo" @close="buildQrCodePop = false"></build-q-r-code>
    </a-modal>
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapState } from 'vuex'
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import { buildQRCode } from '@/components'
import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import Ads from '@/components/Other/CarbonAds'

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
      // 生产二维码
      buildQrCodePop: false,
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: (state) => state.permission.addRouters,
      userInfo: (state) => state.user.info,
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
      console.log('type', type, value)
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
      this.buildQrCodePop = true
    },
  },
}
</script>

<style lang="less">
@import './BasicLayout.less';
.ant-pro-sider-menu-logo {
  height: auto;
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
    margin-top: 8px;
    font-size: 18px;
    color: #000;
  }
}
.user-report-info {
  margin-left: -24px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
  .report-info-item {
    text-align: center;
    line-height: 1.5;
    .num {
      font-size: 16px;
      font-weight: bold;
      color: #f4d4ad;
    }
    .item-name {
      color: #000;
    }
  }
}
.qr-modal {
  .ant-modal-content {
    background: #ffffff url(~@/assets/images/login-box-bg.png) no-repeat;
    background-size: 100% 100%;
    border-radius: 20px;
  }
}
</style>
