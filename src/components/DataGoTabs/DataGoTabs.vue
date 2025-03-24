<!--
 * @Author: bekon
 * @Date: 2025-03-21 22:37:18
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-24 18:15:44
 * @FilePath: /report-background-system/src/components/DataGoTabs/DataGoTabs.vue
 * @Description: 
 * 
-->
<template>
  <div class="tab-box">
    <div class="flex tab-center">
      <slot name="leftContant" v-if="hasLeftContant"></slot>
      <div
        v-for="(item, index) in tab"
        :key="index"
        :class="{ 'item flex-1': true, active: item.type == active }"
        @click="changeTab(item.type)"
      >
        <div :class="['flex', 'son-item', 'item-' + index, 'active-' + active, 'flex-1']">
          <div v-if="item.icon" class="son-item">
            <img v-if="item.type != active" style="width: 35px; height: 35px" :src="item.icon" alt="dark" />
            <img v-else style="width: 35px; height: 35px" :src="item.iconActive || item.icon" alt="dark" />
          </div>
          {{ item.name }}
        </div>
      </div>
      <slot name="rightContant" v-if="hasRightContant"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'DataGoTabs',
  props: {
    activeTab: {
      type: String,
      default: null,
    },
    tab: {
      type: Array,
      required: true,
    },
    hasRightContant: {
      type: Boolean,
      default: false,
    },
    hasLeftContant: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      active: 0,
    }
  },
  mounted() {
    this.active = this.activeTab != null ? this.activeTab : this.tab.length ? this.tab[0].type : 0
  },
  methods: {
    changeTab(type) {
      this.active = type
      this.$emit('changeTab', type)
    },
  },
}
</script>

<style scoped lang="less">
.tab-box {
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
  border-radius: 5px 5px 0 0;
}
.tab-center {
  background-color: #d3e3f8;
  align-items: center;
}
.item {
  display: flex;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
  line-height: 2;
  cursor: pointer;
  .son-item {
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    padding: 5px 0;
    img {
      margin-right: 10px;
    }
  }
  .item-0 {
    background-color: #eaf7fd;
  }
  .item-1 {
    background-color: #d6e3f6;
    background: url(~@/assets/images/tab2.jpg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    &.active-3 {
      background-color: #e2edf7;
    }
  }
  .item-2 {
    background-color: #d6e3f6;
  }
}
.active .item-0 {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #154291;
  font-weight: 400;
  background-color: #dfecf8;
  background-image: url(~@/assets/images/active-tab.jpg) !important;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.active .item-1 {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #154291;
  font-weight: 400;
  background-color: #d6e3f6;
  background-image: url(~@/assets/images/active-tab.jpg) !important;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.active .item-2 {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #154291;
  font-weight: 400;
  background: #fff;
}
</style>