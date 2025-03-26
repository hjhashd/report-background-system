<!--
 * @Author: bekon
 * @Date: 2022-10-10 22:31:07
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-26 23:08:29
 * @FilePath: /report-background-system/src/App.vue
 * @Description: 
 * 
-->
<template>
  <a-config-provider :locale="locale">
    <div id="app" :class="{ 'full-screen': fullScreen }">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import { mapState } from 'vuex'
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapState({ fullScreen: (state) => state.user.fullScreen }),
    locale() {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && setDocumentTitle(`${i18nRender(title)} - ${domTitle}`)

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    },
  },
}
</script>

<style>
@import './assets/iconfont.css';
.full-screen > .ant-layout.ant-layout-has-sider > .ant-pro-sider-menu-sider.light {
  display: none;
}
.full-screen > .ant-layout.ant-layout-has-sider > .ant-layout {
  padding-left: 0 !important;
}
.full-screen > .ant-layout.ant-layout-has-sider > .ant-layout > div {
  display: none;
}
.full-screen > .ant-layout.ant-layout-has-sider .ant-pro-basicLayout-content {
  margin: 0 !important;
}
.full-screen > .ant-layout.ant-layout-has-sider .page-content{
  height: 100vh;
}
</style>
