<!--
 * @Author: bekon
 * @Date: 2025-02-27 20:20:34
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-17 11:09:22
 * @FilePath: /report-background-system/src/components/OnlyOfficeEditor/OnlyOfficeEditor.vue
 * @Description: 
 * 
-->
<template>
  <div :style="{ 'padding-left': '20px', width: '100%', height: editorInnerHeight }">
    <div id="onlyoffice-container"></div>
  </div>
</template>
  
  <script>
import { wopiFile } from '@/api/report'
export default {
  name: 'OnlyOfficeEditor',
  props: {
    reportId: {
      type: String,
      required: true,
    },
    editorHeight: {
      type: String,
      default: '78vh',
    },
  },
  data() {
    return {
      editor: null,
      config: null,
      editorInnerHeight: '78vh',
    }
  },
  watch: {
    editorHeight: {
      handler(v) {
        this.editorInnerHeight = v
      },
    },
  },
  mounted() {
    this.initReport()
  },
  methods: {
    async initReport() {
      this.config = await wopiFile(this.reportId)
      this.editor = new DocsAPI.DocEditor('onlyoffice-container', this.config)
    },
    refreshEditor() {
      if (this.editor) {
        this.editor.destroyEditor()
      }
      this.initReport()
    },
    onDocumentReady() {
      console.success('Document is loaded')
    },
    onLoadComponentError(errorCode, errorDescription) {
      switch (errorCode) {
        case -1: // Unknown error loading component
          console.error(errorDescription)
          break

        case -2: // Error load DocsAPI from http://documentserver/
          console.error(errorDescription)
          break

        case -3: // DocsAPI is not defined
          console.error(errorDescription)
          break
      }
    },
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroyEditor()
    }
  },
}
</script>
  
<style scoped>
/* 可以添加一些样式来调整容器的外观 */
</style>