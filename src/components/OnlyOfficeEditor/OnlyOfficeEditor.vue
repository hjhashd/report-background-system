<!--
 * @Author: bekon
 * @Date: 2025-02-27 20:20:34
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-14 10:23:15
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
import { wopiFile, getIndustryReportConfig } from '@/api/report'
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
    typeFrom: {
      type: String,
      default: '',
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
      if (this.typeFrom === 'industryReport') {
        this.config = await getIndustryReportConfig(this.reportId)
      } else {
        this.config = await wopiFile(this.reportId)
      }
      await this.ensureOnlyOfficeScript()
      if (this.config && this.config.editorConfig) {
        this.config.editorConfig.user = {
          id: this.$store.getters.userInfo?.id?.toString() || 'anonymous',
          name: this.$store.getters.nickname || '访客'
        }
        if (!this.config.editorConfig.customization) {
          this.config.editorConfig.customization = {}
        }
        this.config.editorConfig.customization.spellcheck = false
      }
      this.editor = new DocsAPI.DocEditor('onlyoffice-container', this.config)
    },
    async ensureOnlyOfficeScript() {
      if (typeof window !== 'undefined' && window.DocsAPI) {
        return
      }
      const hostEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : '192.168.3.10'
      const portEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : '8082'
      const url = `http://${hostEnv}:${portEnv}/web-apps/apps/api/documents/api.js`
      
      return new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = url
        s.async = true
        s.onload = resolve
        s.onerror = () => reject(new Error(`Failed to load OnlyOffice script from ${url}`))
        document.head.appendChild(s)
      })
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
