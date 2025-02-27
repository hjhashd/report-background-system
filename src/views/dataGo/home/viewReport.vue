<!--
 * @Author: bekon
 * @Date: 2025-02-25 15:23:20
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-27 21:18:27
 * @FilePath: /report-background-system/src/views/dataGo/home/viewReport.vue
 * @Description: 报告预览
 * 
-->
<template>
  <page-header-wrapper>
    <div class="page-content flex-col" style="padding: 0; width: 100%">
      <div class="report-view">
        <div class="flex-row-spacebetween tools">
          <div class="sys-title">企业信息查询系统</div>
          <div class="flex">
            <div class="btn-item">
              <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="redo" /></div>
              <span>更新数据</span>
            </div>
            <div class="btn-item" @click="isListCollapsed = false">
              <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="eye" /></div>
              <span>查看数据</span>
            </div>
            <div class="btn-item">
              <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="edit" /></div>
              <span>编辑</span>
            </div>
            <div class="btn-item">
              <div class="icon-box"><a-icon style="color: rgb(87, 135, 238)" type="save" /></div>
              <span>另存草稿</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="editor-container" v-if="reportId">
          <OnlyOfficeEditor :reportId="reportId" />
        </div>
        <div class="container-detail right-content" :class="{ 'list-collapsed': isListCollapsed }"></div>
      </div>
      <!-- <a-drawer
        title="Basic Drawer"
        placement="right"
        :closable="false"
        :visible="visible"
        :get-container="false"
        :wrap-style="{ position: 'absolute' }"
        @close="onClose"
      >
        <p>Some contents...</p>
      </a-drawer> -->
    </div>
  </page-header-wrapper>
</template>

<script>
import { OnlyOfficeEditor } from '@/components'
export default {
  name: 'addReport',
  components: { OnlyOfficeEditor },
  data() {
    return {
      visible: false,
      config: null,
      reportId: null,
      isListCollapsed: true,
    }
  },
  created() {
    this.reportId = this.$route.params.reportId
  },
  methods: {
    afterVisibleChange(val) {
      console.log('visible', val)
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .ant-page-header-heading {
  display: none;
}
/deep/ .ant-pro-page-header-wrap-children-content {
  margin: 0;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.tools {
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
}
.sys-title {
  font-size: 22px;
  font-weight: bold;
  color: #000;
}
.btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(240, 246, 254);
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  span {
    margin-top: 4px;
    font-size: 12px;
  }
}
.editor-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
}
.right-content {
  height: 100%;
  width: 300px;
  transition: width 0.3s ease;
  border-right: 1px solid #e8e8e8;
  position: relative;
}

.list-collapsed {
  width: 0px;
}
</style>