<!--
 * @Author: bekon
 * @Date: 2025-02-27 20:20:34
 * @LastEditors: bekon
 * @LastEditTime: 2025-08-16 15:48:23
 * @FilePath: \report-background-system\src\components\OnlyOfficeEditor\OnlyOfficeEditorFD.vue
 * @Description: 
 * 
-->
<template>
  <div :style="{ 'padding-left': '20px', width: '100%', height: editorInnerHeight }">
    <div id="onlyoffice-container"></div>
  </div>
</template>
  
  <script>
import md5 from 'md5'
export default {
  name: 'OnlyOfficeEditor',
  props: {
    reportId: {
      type: Number,
      default: null,
    },
    editorHeight: {
      type: String,
      default: '78vh',
    },
    typeFrom: {
      type: String,
      default: '',
    },
    docUrl: {
      type: String,
      default: '',
    },
    docTitle: {
      type: String,
      default: '新建报告',
    },
    docFileType: {
      type: String,
      default: 'docx',
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editor: null,
      config: null,
      editorInnerHeight: '78vh',
      loadingScript: false,
      dirty: false,
      lockId: null,
      fileId: null,
      lastSaveMeta: null,
      sessionId: null,
    }
  },
  watch: {
    editorHeight: {
      handler(v) {
        this.editorInnerHeight = v
      },
    },
    reportId: {
      handler(v) {
        this.initReport()
      },
    },
    docUrl: {
      handler(v) {
        this.initReport()
      },
    },
    editable: {
      handler() {
        this.refreshEditor()
      },
    },
  },
  mounted() {
    this.initReport()
  },
  methods: {
    async initReport() {
      if (this.editor) {
        this.editor.destroyEditor()
      }
      await this.ensureOnlyOfficeScript()
      this.config = await this.buildConfig()
      this.editor = new DocsAPI.DocEditor('onlyoffice-container', this.config)
      this.setupLock()
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
    async ensureOnlyOfficeScript() {
      if (typeof window !== 'undefined' && (window).DocsAPI) return
      if (this.loadingScript) return
      this.loadingScript = true
      const urls = []
      const hostEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : null
      const portEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : null
      if (hostEnv && portEnv) {
        urls.push(`http://${hostEnv}:${portEnv}/web-apps/apps/api/documents/api.js`)
      } else if (typeof window !== 'undefined') {
        const hn = window.location.hostname
        const p = portEnv || 8082
        urls.push(`http://${hn}:${p}/web-apps/apps/api/documents/api.js`)
      }
      urls.push(`http://127.0.0.1:${portEnv || 8082}/web-apps/apps/api/documents/api.js`)
      await new Promise((resolve, reject) => {
        const tryLoad = (i) => {
          if (i >= urls.length) {
            reject(new Error('OnlyOffice 脚本加载失败'))
            return
          }
          const s = document.createElement('script')
          s.src = urls[i]
          s.async = true
          s.onload = () => resolve()
          s.onerror = () => {
            s.remove()
            tryLoad(i + 1)
          }
          document.head.appendChild(s)
        }
        tryLoad(0)
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.loadingScript = false
      })
    },
    async buildConfig() {
      const title = this.docTitle || '新建报告'
      const fileType = (this.docFileType || 'docx').replace('.', '')
      const stableId = md5((this.docUrl || title) + '|fd')
      this.fileId = stableId
      const key = `local-${stableId}-${Date.now()}`
      const relUrl = this.docUrl || ''
      let internalUrl = ''
      const envHost = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_INTERNAL_DOC_HOST) ? process.env.VUE_APP_INTERNAL_DOC_HOST : null
      if (envHost) {
        internalUrl = `http://${envHost}:8000${relUrl.startsWith('/') ? relUrl : `/${relUrl}`}`
      } else if (relUrl.startsWith('http')) {
        internalUrl = relUrl
      } else if (typeof window !== 'undefined' && window.location) {
        const origin = window.location.origin
        internalUrl = `${origin}${relUrl.startsWith('/') ? relUrl : `/${relUrl}`}`
      } else {
        internalUrl = `${relUrl.startsWith('/') ? relUrl : `/${relUrl}`}`
      }
      const dt = (() => {
        const ft = fileType.toLowerCase()
        if (['xlsx', 'xlsm', 'ods', 'csv'].includes(ft)) return 'cell'
        if (['pptx', 'pptm', 'odp'].includes(ft)) return 'slide'
        return 'word'
      })()
      const cfg = {
        document: {
          title,
          url: internalUrl,
          fileType,
          key,
          permissions: {
            download: true,
            print: true,
            edit: true
          }
        },
        documentType: dt,
        editorConfig: {
          mode: 'edit',
          lang: 'zh-CN',
          customization: {
            toolbar: true,
            statusBar: false,
            compactToolbar: true,
            hideRightMenu: true,
            autosave: true,
            forcesave: false
          }
        },
        type: 'desktop',
        width: '100%',
        height: '100%',
        events: {
          onAppReady: () => {
            this.$emit('onlyoffice-info', { type: 'app-ready' })
            console.log('[OnlyOffice] App ready')
          },
          onDocumentReady: () => {
            this.$emit('onlyoffice-info', { type: 'doc-ready' })
            console.log('[OnlyOffice] Document ready')
          },
          onError: (e) => {
            this.$emit('onlyoffice-error', e)
            console.error('[OnlyOffice] Error', e)
          },
          onInfo: (i) => {
            this.$emit('onlyoffice-info', i)
            console.log('[OnlyOffice] Info', i)
          },
          onDocumentStateChange: (event) => {
            this.dirty = !!(event && event.data)
            this.$emit('onlyoffice-info', { type: 'state', dirty: this.dirty })
          },
          onDownloadAs: (event) => {
            const d = event && event.data ? event.data : {}
            this.handleDownloadedFile(d)
          },
          onRequestSaveAs: (event) => {
            const d = event && event.data ? event.data : {}
            this.handleDownloadedFile(d)
          }
        },
      }
      return cfg
    },
    async saveDocument(format) {
      try {
        const f = (format || this.docFileType || 'docx').replace('.', '')
        if (this.editor && this.editor.downloadAs) {
          this.editor.downloadAs({ fileType: f })
          this.$emit('onlyoffice-info', { type: 'save-requested', format: f })
        } else {
          throw new Error('编辑器未初始化或不支持下载')
        }
      } catch (e) {
        this.$emit('onlyoffice-error', e)
      }
    },
    setupLock() {
      try {
        const lid = `onlyoffice-lock-${this.fileId}`
        this.lockId = lid
        this.sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const existing = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(lid) : null
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(lid, this.sessionId)
        }
      } catch (e) {
        
      }
    },
    async handleDownloadedFile(data) {
      try {
        const fileType = data.fileType || (this.docFileType || 'docx').replace('.', '')
        const url = data.url
        const title = data.title || this.docTitle || '未命名文档'
        if (!url) {
          throw new Error('未获取到保存文件地址')
        }
        const blob = await this.fetchOOBlobWithRetry(url)
        const now = new Date()
        const ts = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0'),
        ].join('') + '-' + [
          String(now.getHours()).padStart(2, '0'),
          String(now.getMinutes()).padStart(2, '0'),
          String(now.getSeconds()).padStart(2, '0'),
        ].join('')
        const ext = fileType.startsWith('.') ? fileType : `.${fileType}`
        const base = title.replace(/\.[^\.]+$/, '')
        const physicalName = `${base}_${ts}${ext}`
        await this.persistToIndexedDB({
          id: `${this.fileId}-${ts}`,
          physicalName,
          originalName: title,
          type: fileType,
          blob,
          sourceUrl: url,
          createdAt: Date.now(),
        })
        await this.uploadToFS(physicalName, blob)
        this.lastSaveMeta = { physicalName, originalName: title, type: fileType }
        this.$emit('onlyoffice-info', { type: 'save-success', meta: this.lastSaveMeta })
      } catch (e) {
        this.$emit('onlyoffice-error', e)
      }
    },
    normalizeOOUrl(raw) {
      try {
        const u = new URL(raw)
        const hostEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : null
        const portEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : null
        if (hostEnv && portEnv) {
          u.protocol = 'http:'
          u.hostname = hostEnv
          u.port = String(portEnv)
          return u.toString()
        }
        return raw
      } catch (e) {
        return raw
      }
    },
    async fetchOOBlobWithRetry(raw) {
      const max = 3
      let lastErr = null
      for (let i = 0; i < max; i++) {
        const url = this.normalizeOOUrl(raw)
        try {
          const res = await fetch(`/__proxy-fetch?url=${encodeURIComponent(url)}`)
          if (res.ok) {
            return await res.blob()
          }
          lastErr = new Error(`文件下载失败(${res.status})`)
        } catch (e) {
          lastErr = e
        }
        await new Promise(r => setTimeout(r, 800))
      }
      throw lastErr || new Error('文件下载失败')
    },
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => {
          const res = fr.result || ''
          const s = typeof res === 'string' ? res : ''
          const b64 = s.includes(',') ? s.split(',')[1] : s
          resolve(b64)
        }
        fr.onerror = () => reject(fr.error)
        fr.readAsDataURL(blob)
      })
    },
    async uploadToFS(filename, blob) {
      try {
        const content = await this.blobToBase64(blob)
        const r = await fetch('/__local-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, content }),
        })
        const j = await r.json().catch(() => null)
        if (!r.ok || !j || !j.ok) {
          throw new Error((j && j.error) || `文件写入失败(${r.status})`)
        }
      } catch (e) {
        this.$emit('onlyoffice-error', e)
      }
    },
    async persistToIndexedDB(record) {
      return new Promise((resolve, reject) => {
        const req = window.indexedDB.open('onlyoffice-files', 1)
        req.onupgradeneeded = (ev) => {
          const db = ev.target.result
          if (!db.objectStoreNames.contains('files')) {
            const store = db.createObjectStore('files', { keyPath: 'id' })
            store.createIndex('byOriginal', 'originalName', { unique: false })
            store.createIndex('byCreatedAt', 'createdAt', { unique: false })
          }
        }
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction('files', 'readwrite')
          tx.oncomplete = () => resolve(true)
          tx.onerror = () => reject(tx.error)
          const store = tx.objectStore('files')
          store.put(record)
        }
      })
    },
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroyEditor()
    }
    try {
      if (this.lockId && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.lockId)
      }
    } catch (e) {}
  },
}
</script>
  
<style scoped>
/* 可以添加一些样式来调整容器的外观 */
</style>
