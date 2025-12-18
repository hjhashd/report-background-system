<!--
 * @Author: bekon
 * @Date: 2022-10-10 22:31:07
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-25 11:49:52
 * @FilePath: /report-background-system/src/components/GlobalHeader/RightContent.vue
 * @Description: 
 * 
-->
<template>
  <div :class="wrpCls">
    <avatar-dropdown :menu="showMenu" :current-user="userInfo" :class="prefixCls" />
    <!-- <select-lang :class="prefixCls" /> -->
  </div>
</template>

<script>
import AvatarDropdown from './AvatarDropdown'
import SelectLang from '@/components/SelectLang'
import { mapState } from 'vuex'
export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLang,
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action',
    },
    isMobile: {
      type: Boolean,
      default: () => false,
    },
    topMenu: {
      type: Boolean,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showMenu: false,
    }
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.info,
    }),
    wrpCls() {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? 'light' : this.theme}`]: true,
      }
    },
  }
}
</script>
