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
  <div :style="{ width: '100%', height: editorInnerHeight }">
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
    // 监听来自插件的远程日志
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PLUGIN_DEBUG_LOG') {
        const { message, data, timestamp } = event.data;
        console.log(`%c[PluginRemoteLog] ${new Date(timestamp || Date.now()).toLocaleTimeString()} - ${message}`, 'color: #4caf50; font-weight: bold;', data || '');
      }
    });
    this.initReport()
  },
  methods: {
    async initReport() {
      if (this.editor) {
        this.editor.destroyEditor()
        this.editor = null
      }
      await this.ensureOnlyOfficeScript()
      this.config = await this.buildConfig()
      console.log('[OnlyOffice] 最终生成的编辑器配置:', JSON.stringify(this.config, null, 2));
      // 去掉 Object.freeze，直接赋值
      // 建议加上 window.docEditor = this.editor 方便我们在控制台调试
      this.editor = new DocsAPI.DocEditor('onlyoffice-container', this.config)
      window.docEditor = this.editor
      this.setupLock()
  },
    refreshEditor() {
      if (this.editor) {
        this.editor.destroyEditor()
        this.editor = null
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
      if (typeof window !== 'undefined' && (window).DocsAPI) {
        console.log('[OnlyOffice] DocsAPI already exists, skipping load.');
        return;
      }
      if (this.loadingScript) return
      this.loadingScript = true
      const urls = []
      
      // 获取配置的 Host 和 Port
      const hostEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : null
      const portEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : 8082;
      const apiUrlEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_API_URL) ? process.env.VUE_APP_ONLYOFFICE_API_URL : null;
      
      console.log(`[OnlyOffice] Loading api.js using host: ${hostEnv}, port: ${portEnv}, api_url: ${apiUrlEnv}`);

      if (apiUrlEnv) {
        urls.push(apiUrlEnv);
      }
      
      if (hostEnv && portEnv) {
        urls.push(`http://${hostEnv}:${portEnv}/web-apps/apps/api/documents/api.js`)
      } else if (typeof window !== 'undefined') {
        const hn = window.location.hostname
        urls.push(`http://${hn}:${portEnv}/web-apps/apps/api/documents/api.js`)
      }
      // 兜底方案
      urls.push(`http://127.0.0.1:${portEnv}/web-apps/apps/api/documents/api.js`)
      urls.push(`http://192.168.3.10:${portEnv}/web-apps/apps/api/documents/api.js`)
      urls.push(`http://192.168.3.10:8082/web-apps/apps/api/documents/api.js`)

      await new Promise((resolve, reject) => {
        const tryLoad = (i) => {
          if (i >= urls.length) {
            reject(new Error('OnlyOffice 脚本加载失败，请检查服务器连接'))
            return
          }
          console.log(`[OnlyOffice] Attempting to load script from: ${urls[i]}`);
          const s = document.createElement('script')
          s.src = urls[i]
          s.async = true
          s.onload = () => {
            console.log(`[OnlyOffice] Script loaded successfully from: ${urls[i]}`);
            resolve();
          }
          s.onerror = () => {
            console.warn(`[OnlyOffice] Failed to load script from: ${urls[i]}`);
            s.remove()
            tryLoad(i + 1)
          }
          document.head.appendChild(s)
        }
        tryLoad(0)
      }).catch(err => {
        console.error(err)
        this.$notification['error']({
          message: '编辑器加载失败',
          description: '无法连接到 OnlyOffice 服务器，请检查网络或配置。'
        });
      }).finally(() => {
        this.loadingScript = false
      })
    },
    async buildConfig() {
      const title = this.docTitle || '新建报告'
      const fileType = (this.docFileType || 'docx').replace('.', '')
      
      // --- Debug Environment Variables ---
      console.log('[OnlyOffice Debug] Environment Variables:', {
        VUE_APP_ONLYOFFICE_HOST: process.env.VUE_APP_ONLYOFFICE_HOST,
        VUE_APP_ONLYOFFICE_HTTP_PORT: process.env.VUE_APP_ONLYOFFICE_HTTP_PORT,
        VUE_APP_INTERNAL_DOC_HOST: process.env.VUE_APP_INTERNAL_DOC_HOST,
        VUE_APP_PUBLIC_HOST: process.env.VUE_APP_PUBLIC_HOST,
        VUE_APP_PUBLIC_PORT: process.env.VUE_APP_PUBLIC_PORT,
        VUE_APP_ONLYOFFICE_CALLBACK_URL: process.env.VUE_APP_ONLYOFFICE_CALLBACK_URL,
        location_origin: window.location.origin
      });

      // --- Key generation logic from example.ts ---
      const generateStableKey = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; 
        }
        return Math.abs(hash).toString(16) + '_' + str.length;
      };
      
      const docKey = generateStableKey((this.docUrl || title) + '|fd');
      this.fileId = docKey;
      const key = docKey;

      const relUrl = this.docUrl || ''
      let internalUrl = ''
      
      const pubHost = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_PUBLIC_HOST) ? process.env.VUE_APP_PUBLIC_HOST : null
      const pubPort = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_PUBLIC_PORT) ? process.env.VUE_APP_PUBLIC_PORT : null
      
      // --- Origin handling ---
      // 核心修复：插件路径必须与当前页面访问地址完全同源，否则浏览器会拦截加载
      const currentOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      const originForPlugins = currentOrigin;

      const envInternalHost = process.env.VUE_APP_INTERNAL_DOC_HOST;
      const envPublicHost = process.env.VUE_APP_PUBLIC_HOST;
      const envPublicPort = process.env.VUE_APP_PUBLIC_PORT;

      console.log('[OnlyOffice Debug] --- Environment Check ---');
      console.log('[OnlyOffice Debug] window.location.origin:', window.location.origin);
      console.log('[OnlyOffice Debug] process.env.VUE_APP_PUBLIC_HOST:', envPublicHost);
      console.log('[OnlyOffice Debug] process.env.VUE_APP_PUBLIC_PORT:', envPublicPort);
      console.log('[OnlyOffice Debug] process.env.VUE_APP_INTERNAL_DOC_HOST:', envInternalHost);
      
      let internalOrigin = currentOrigin;

      // Priority logic for internalOrigin (the URL OnlyOffice uses to talk to this app)
      // 优先级 1: 如果配置了公网 Host/Port (如 192.168.3.10:3004)，这通常是 OnlyOffice 最稳妥的访问路径
      if (envPublicHost && envPublicPort && envPublicHost !== 'null' && envPublicPort !== 'null') {
        internalOrigin = `http://${envPublicHost}:${envPublicPort}`;
        console.log('[OnlyOffice Debug] Priority 1: Using envPublicHost/Port:', internalOrigin);
      } 
      // 优先级 2: 内部容器主机名 (仅当 OnlyOffice 也在同一个 Docker 网络时有效)
      else if (envInternalHost && envInternalHost !== 'null' && envInternalHost !== 'undefined') {
        internalOrigin = `http://${envInternalHost}:8000`;
        console.log('[OnlyOffice Debug] Priority 2: Using envInternalHost (Docker Internal):', internalOrigin);
      } 
      // 优先级 3: 本地开发环境 fallback
      else if (internalOrigin.includes('localhost') || internalOrigin.includes('127.0.0.1')) {
        internalOrigin = internalOrigin.replace(/localhost|127\.0\.0\.1/, 'host.docker.internal');
        console.log('[OnlyOffice Debug] Priority 3: Fallback to host.docker.internal:', internalOrigin);
      }
      
      console.log('[OnlyOffice Debug] Final internalOrigin selected:', internalOrigin);

      // 对路径进行编码，防止中文字符导致下载失败
      const encodedRelUrl = relUrl.split('/').map(seg => encodeURIComponent(seg)).join('/');
      internalUrl = `${internalOrigin}${encodedRelUrl.startsWith('/') ? encodedRelUrl : `/${encodedRelUrl}`}`
      
      console.log('[OnlyOffice Debug] Final internalUrl (for OO to download):', internalUrl);
       
       const dt = (() => {
         const ft = fileType.toLowerCase()
         if (['xlsx', 'xlsm', 'ods', 'csv'].includes(ft)) return 'cell'
         if (['pptx', 'pptm', 'odp'].includes(ft)) return 'slide'
         return 'word'
       })()

       const callbackUrl = (() => {
         const explicit = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_CALLBACK_URL) ? process.env.VUE_APP_ONLYOFFICE_CALLBACK_URL : null
         if (explicit) return explicit
         // 强制加上 name 参数，确保回调能识别文件名
         return `${internalOrigin}/__onlyoffice-callback?name=${encodeURIComponent(title)}`
       })();

       console.log('[OnlyOffice Debug] Final callbackUrl (for OO to post back):', callbackUrl);

       const dsHost = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : 'localhost'
       const dsPort = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : '8082'
       const sdkUrl = encodeURIComponent(`http://${dsHost}:${dsPort}/sdkjs-plugins/v1/plugins.js`);

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
           user: {
             id: this.$store.getters.userInfo?.id?.toString() || 'anonymous',
             name: this.$store.getters.nickname || '访客'
           },
           callbackUrl: callbackUrl,
           plugins: {
             // 确保这里的 GUID 与 public/plugins/insert-text-demo/config.json 一致
             autostart: ['asc.{A1105DEE-7544-4C33-B3D5-168406D92F72}'],
             pluginsData: [`${originForPlugins}/plugins/insert-text-demo/config.json?sdkUrl=${sdkUrl}`]
           },
           customization: {
             toolbar: true,
             statusBar: true, // 开启状态栏以查看保存状态
             compactToolbar: true,
             hideRightMenu: true,
             spellcheck: false,
             autosave: true, // 强制开启自动保存
             forcesave: true  // 强制开启手动保存回调 (Ctrl+S)
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
    insertTextAtCursor(text) {
      console.log('[OnlyOfficeEditor Debug] insertTextAtCursor called with text:', text ? (text.substring(0, 30) + '...') : 'null');
      if (!text) {
        this.$message.warning('插入内容不能为空');
        return;
      }

      try {
        const safeText = String(text);
        
        // --- 方案 0：尝试直接使用 callCommand (高级 API/企业版) ---
        if (this.editor) {
          const callCommand = this.editor.callCommand || (this.editor).connector?.callCommand;
          if (typeof callCommand === 'function') {
            console.log('[OnlyOfficeEditor Debug] 检测到高级 API，直接执行 callCommand...');
            const command = `
              var oDocument = Api.GetDocument();
              var oParagraph = Api.CreateParagraph();
              oParagraph.AddText(${JSON.stringify(safeText)});
              oDocument.InsertContent([oParagraph], true);
            `;
            callCommand.call(this.editor, command);
            this.$message.success('已通过高级 API 插入文本');
            return;
          }
        }

        // --- 方案一：BroadcastChannel (推荐用于社区版) ---
        console.log('[OnlyOfficeEditor Debug] 尝试通过 BroadcastChannel 发送插入指令...');
        const channel = new BroadcastChannel('onlyoffice-ai-channel');
        channel.postMessage({
          type: "ai-insert-text",
          text: safeText
        });
        setTimeout(() => channel.close(), 1000);

        // --- 方案二：PostMessage (作为回退) ---
        let iframe = null;
        if (this.editor && this.editor.iframe) {
          iframe = this.editor.iframe;
          console.log('[OnlyOfficeEditor Debug] 使用 this.editor.iframe');
        } else {
          iframe = document.getElementsByName("frameEditor")[0] || 
                   document.querySelector('#onlyoffice-container iframe');
          console.log('[OnlyOfficeEditor Debug] 使用 querySelector 查找 iframe:', !!iframe);
        }
        
        if (iframe && iframe.contentWindow) {
          console.log('[OnlyOfficeEditor Debug] 尝试通过 postMessage 发送插入指令...');
          const origin = '*'; 
          
          // 方案 2.1: 针对插件内部 window.message 监听
          const messageData = {
            type: "ai-insert-text",
            text: safeText
          };
          iframe.contentWindow.postMessage(messageData, origin);

          // 方案 2.2: 针对 OnlyOffice 标准插件协议
          const apiPayload = {
            "type": "onExternalPluginMessage",
            "pluginGuid": "asc.{A1105DEE-7544-4C33-B3D5-168406D92F72}",
            "data": messageData
          };
          iframe.contentWindow.postMessage(apiPayload, origin);
          console.log('[OnlyOfficeEditor Debug] postMessage 已发出');
        } else {
          console.warn('[OnlyOfficeEditor Debug] 未找到编辑器 iframe，postMessage 无法发送');
        }

        this.$message.success('插入指令已发送'); 
      } catch (e) {
        console.error("[OnlyOfficeEditor Debug] 插入操作异常:", e);
        this.$notification['error']({
          message: '插入操作失败',
          description: String(e)
        });
      }
    },
    insertTextViaDrop(text) {
      try {
        const iframe = document.querySelector('iframe[name="frameEditor"]') || document.querySelector('#onlyoffice-container iframe')
        if (!iframe || !iframe.contentWindow) {
          throw new Error('未找到编辑器窗口')
        }
        const hostEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HOST) ? process.env.VUE_APP_ONLYOFFICE_HOST : null
        const portEnv = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_ONLYOFFICE_HTTP_PORT) ? process.env.VUE_APP_ONLYOFFICE_HTTP_PORT : null
        const dsOrigin = (hostEnv && portEnv) ? `http://${hostEnv}:${portEnv}` : '*'
        const payload = {
          type: 'onExternalPluginMessage',
          pluginGuid: 'asc.{A1105DEE-7544-4C33-B3D5-168406D92F72}',
          data: { type: 'insertTextDrop', text: String(text || '') }
        }
        iframe.contentWindow.postMessage(payload, dsOrigin)
        this.$emit('onlyoffice-info', { type: 'info', message: 'insert-text-drop-requested' })
      } catch (e) {
        this.$emit('onlyoffice-error', e)
      }
    },
    async saveDocument(format) {
      try {
        const f = (format || this.docFileType || 'docx').replace('.', '')
        if (this.editor && typeof this.editor.downloadAs === 'function') {
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
        const ext = fileType.startsWith('.') ? fileType : `.${fileType}`
        const origName = (() => {
          const u = this.docUrl || ''
          const seg = u.split('/').pop() || ''
          if (seg) return seg
          const base = title.replace(/\.[^\.]+$/, '')
          return `${base}${ext}`
        })()
        await this.uploadToFS(origName, blob)
        this.lastSaveMeta = { originalName: title, type: fileType, overwrittenName: origName }
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
      this.editor = null
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
#onlyoffice-container {
  width: 100%;
  height: 100%;
}
</style>
