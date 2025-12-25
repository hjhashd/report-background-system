const path = require('path')
const webpack = require('webpack')
const packageJson = require('./package.json')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const createThemeColorReplacerPlugin = require('./config/plugin.config')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// check Git
function getGitHash() {
  try {
    return GitRevision.version()
  } catch (e) { }
  return 'unknown'
}
// eslint-disable-next-line no-unused-vars
const isProd = process.env.NODE_ENV === 'production'
// eslint-disable-next-line no-unused-vars
const assetsCDN = {
  // webpack build externals
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios'
  },
  css: [],
  // https://unpkg.com/browse/vue@2.6.10/
  js: [
    '//cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
    '//cdn.jsdelivr.net/npm/vue-router@3.5.1/dist/vue-router.min.js',
    '//cdn.jsdelivr.net/npm/vuex@3.1.1/dist/vuex.min.js',
    '//cdn.jsdelivr.net/npm/axios@0.21.1/dist/axios.min.js'
  ]
}

// vue.config.js
const vueConfig = {
  runtimeCompiler: true,
  configureWebpack: {
    // webpack plugins
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin({
        contextRegExp: /^\.\/locale$/,
        resourceRegExp: /moment$/
      }),
      new webpack.DefinePlugin({
        APP_VERSION: `"${packageJson.version}"`,
        GIT_HASH: JSON.stringify(getGitHash()),
        BUILD_DATE: buildDate
      })
    ]
    // en_US: `if prod, add externals`
    // zh_CN: `这里是用来控制编译忽略外部依赖的，与 config.plugin('html') 配合可以编译时引入外部CDN文件依赖`
    // externals: isProd ? assetsCDN.externals : {}
  },

  chainWebpack: config => {
    config.resolve.alias.set('@$', resolve('src'))

    // fixed svg-loader by https://github.com/damianstasik/vue-svg-loader/issues/185#issuecomment-1126721069
    const svgRule = config.module.rule('svg')
    // Remove regular svg config from root rules list
    config.module.rules.delete('svg')

    config.module.rule('svg')
      // Use svg component rule
      .oneOf('svg_as_component')
      .resourceQuery(/inline/)
      .test(/\.(svg)(\?.*)?$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [
            { prefixIds: true },
            { cleanupIDs: true },
            { convertShapeToPath: false },
            { convertStyleToAttrs: true }
          ]
        }
      })
      .end()
      .end()
      // Otherwise use original svg rule
      .oneOf('svg_as_regular')
      .merge(svgRule.toConfig())
      .end()

    // en_US: If prod is on assets require on cdn
    // zh_CN: 如果是 prod 模式，则引入 CDN 依赖文件，有需要减少包大小请自行解除依赖
    //
    // if (isProd) {
    //   config.plugin('html').tap(args => {
    //     args[0].cdn = assetsCDN
    //     return args
    //   })
    // }
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // less vars，customize Data Go theme

          // 'primary-color': '#F5222D',
          // 'link-color': '#F5222D',
          'border-radius-base': '2px'
        },
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 8000,
    host: '0.0.0.0',
    allowedHosts: 'all', // 允许任何 host 访问，解决 Invalid Host header 问题

    // --- 新增下面这段配置 ---
    // 告诉浏览器：热更新请走外部的 3004 端口，别走内部的 8000
    client: {
      webSocketURL: 'ws://192.168.3.10:3004/ws',
    },
    // ----------------------

    // 🔥🔥🔥 核心修复：禁止 Webpack 监控存储目录，防止自动刷新 🔥🔥🔥
    static: {
      watch: {
        ignored: /public\/local-storage/
      }
    },
    // 如果上面的 static 写法在你的 vue-cli 版本不生效，请同时加上这个保险：
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        ignored: ['**/public/local-storage/**']
      }
    },
    // 🔥🔥🔥 结束 🔥🔥🔥
    setupMiddlewares(middlewares, devServer) {
      if (!devServer || !devServer.app) return middlewares
      
      // Create local storage directory
      try {
        const path = require('path')
        const fs = require('fs')
        const dir = path.join(__dirname, 'public', 'local-storage', 'drafts')
        fs.mkdirSync(dir, { recursive: true })
      } catch (e) {}
      
      devServer.app.post('/__local-upload', (req, res) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf-8')
            const json = raw ? JSON.parse(raw) : {}
            const nameRaw = json && json.filename ? json.filename : ''
            
            // 解析目录和文件名
            const path = require('path')
            const fs = require('fs')
            
            let targetDir = path.join(__dirname, 'public', 'local-storage', 'drafts')
            if (nameRaw.includes('word_upload')) {
              targetDir = path.join(__dirname, 'public', 'local-storage', 'word_upload')
            }
            
            const name = path.basename(nameRaw || '')
            const base64 = json && json.content ? json.content : ''
            const buf = base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0)
            
            fs.mkdirSync(targetDir, { recursive: true })
            try { 
              fs.writeFileSync(path.join(targetDir, name), buf) 
            } catch (e) {
              console.error('Failed to write file:', e)
            }
            res.status(200).json({ ok: true })
          } catch (e) {
            res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
          }
        })
      })
      devServer.app.get('/__local-upload/ping', (req, res) => {
        res.status(200).json({ ok: true })
      })
      devServer.app.get('/__proxy-fetch', (req, res) => {
        const url = req.query && req.query.url ? req.query.url : ''
        if (!url) {
          res.status(400).json({ ok: false, error: 'missing url' })
          return
        }
        try {
          const mod = url.startsWith('https') ? require('https') : require('http')
          const req2 = mod.get(url, (r2) => {
            const chunks = []
            r2.on('data', (c) => chunks.push(c))
            r2.on('end', () => {
              const buf = Buffer.concat(chunks)
              res.setHeader('Content-Type', 'application/octet-stream')
              res.setHeader('Content-Length', buf.length)
              res.status(200).end(buf)
            })
          })
          req2.on('error', (e) => {
            res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
          })
        } catch (e) {
          res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
        }
      })
      // 诊断接口
      devServer.app.get('/__diagnostics', async (req, res) => {
        const fs = require('fs')
        const path = require('path')
        const http = require('http')

        const results = {
          env: {
            hostEnv: process.env.VUE_APP_ONLYOFFICE_HOST,
            portEnv: process.env.VUE_APP_ONLYOFFICE_HTTP_PORT,
            internalDocHost: process.env.VUE_APP_INTERNAL_DOC_HOST,
            callbackUrl: process.env.VUE_APP_ONLYOFFICE_CALLBACK_URL
          },
          exists: {
            publicDrafts: fs.existsSync(path.join(__dirname, 'public/local-storage/drafts'))
          },
          docsApiReachable: false
        }

        // 测试 OnlyOffice 可达性
        const ooHost = process.env.VUE_APP_ONLYOFFICE_HOST || 'onlyoffice-document-server'
        const ooPort = process.env.VUE_APP_ONLYOFFICE_HTTP_PORT || '80'
        
        try {
          const checkUrl = `http://${ooHost}:${ooPort}/healthcheck`
          const checkReq = http.get(checkUrl, (checkRes) => {
            results.docsApiReachable = (checkRes.statusCode === 200)
            res.json(results)
          })
          checkReq.on('error', () => {
            res.json(results)
          })
          checkReq.setTimeout(2000, () => {
            checkReq.abort()
            res.json(results)
          })
        } catch (e) {
          res.json(results)
        }
      })

      devServer.app.post('/__onlyoffice-callback', (req, res) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', async () => {
          console.log('[OnlyOffice Callback] Received request:', {
            query: req.query,
            time: new Date().toLocaleString()
          })
          try {
            const raw = Buffer.concat(chunks).toString('utf-8')
            const json = raw ? JSON.parse(raw) : {}
            console.log('[OnlyOffice Callback] Payload status:', json.status)
            
            // status 2 = ready for saving, status 6 = force save
            if (json.status !== 2 && json.status !== 6) {
              console.log('[OnlyOffice Callback] Status not 2 or 6, ignoring save. Status:', json.status)
              res.status(200).json({ error: 0 })
              return
            }

            const url = json && json.url ? json.url : null
            const filetype = (json && json.filetype ? json.filetype : 'docx').replace('.', '')
            const title = (req.query && req.query.name) ? req.query.name : (json && json.title ? json.title : '未命名文档')
            
            console.log('[OnlyOffice Callback] Payload details:', { url, filetype, title })
            
            if (!url) {
              console.error('[OnlyOffice Callback] No URL in payload')
              res.status(200).json({ error: 0 })
              return
            }

            const hostEnv = process.env.VUE_APP_ONLYOFFICE_HOST || process.env.ONLYOFFICE_HOST
            const portEnv = process.env.VUE_APP_ONLYOFFICE_HTTP_PORT || process.env.ONLYOFFICE_HTTP_PORT
            let finalUrl = url
            try {
              const u = new URL(url)
              if (hostEnv && portEnv) {
                u.protocol = 'http:'
                u.hostname = hostEnv
                u.port = String(portEnv)
                finalUrl = u.toString()
                console.log('[OnlyOffice Callback] Rewrote URL for internal download:', finalUrl)
              }
            } catch (e) {
              console.error('[OnlyOffice Callback] URL rewrite failed:', e.message)
            }

            const now = new Date()
            const pad = (x) => String(x).padStart(2, '0')
            const ts = [
              now.getFullYear(),
              pad(now.getMonth() + 1),
              pad(now.getDate()),
            ].join('') + '-' + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('')
            const base = String(title).replace(/\.[^\.]+$/, '')
            const ext = filetype.startsWith('.') ? filetype : `.${filetype}`
            const physicalName = `${base}_${ts}${ext}`
            
            console.log('[OnlyOffice Callback] Downloading from:', finalUrl, 'to:', physicalName)
            
            const mod = finalUrl.startsWith('https') ? require('https') : require('http')
            const dir1 = require('path').join(__dirname, 'public', 'local-storage', 'drafts')
            const fs = require('fs')
            fs.mkdirSync(dir1, { recursive: true })
            
            const buf = await new Promise((resolve, reject) => {
              const req2 = mod.get(finalUrl, (r2) => {
                if (r2.statusCode !== 200) {
                  reject(new Error(`Download failed with status ${r2.statusCode}`))
                  return
                }
                const chunks2 = []
                r2.on('data', (c) => chunks2.push(c))
                r2.on('end', () => resolve(Buffer.concat(chunks2)))
                r2.on('error', reject)
              })
              req2.on('error', reject)
              req2.setTimeout(10000, () => {
                req2.abort()
                reject(new Error('Download timeout'))
              })
            })

            const fullPath = require('path').join(dir1, physicalName)
            fs.writeFileSync(fullPath, buf)
            console.log('[OnlyOffice Callback] Save successful:', fullPath, 'Size:', buf.length)
            
            res.status(200).json({ error: 0 })
          } catch (e) {
            console.error('[OnlyOffice Callback] Error:', e && e.message ? e.message : String(e))
            res.status(200).json({ error: 1 })
          }
        })
      })
      devServer.app.get('/__onlyoffice-callback/ping', (req, res) => {
        res.status(200).json({ ok: true })
      })
      devServer.app.delete('/__local-upload', (req, res) => {
        try {
          const path = require('path')
          const fs = require('fs')
          const nameRaw = req.query && req.query.filename ? req.query.filename : ''
          const name = path.basename(nameRaw || '')
          const dir1 = path.join(__dirname, 'public', 'local-storage', 'drafts')
          const fp1 = path.join(dir1, name)
          let removed = false
          try {
            if (fs.existsSync(fp1)) {
              fs.unlinkSync(fp1)
              removed = true
            }
          } catch (e) {}
          if (!removed) {
            throw new Error('file not found')
          }
          res.status(200).json({ ok: true })
        } catch (e) {
          res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
        }
      })
      devServer.app.post('/__local-upload/delete', (req, res) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf-8')
            const json = raw ? JSON.parse(raw) : {}
            const path = require('path')
            const fs = require('fs')
            const nameRaw = json && json.filename ? json.filename : ''
            const name = path.basename(nameRaw || '')
            const dir = path.join(__dirname, 'public', 'local-storage', 'drafts')
            const fp = path.join(dir, name)
            fs.unlinkSync(fp)
            res.status(200).json({ ok: true })
          } catch (e) {
            res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
          }
        })
      })
      devServer.app.get('/__debug/status', async (req, res) => {
        try {
          const fs = require('fs')
          const path = require('path')
          const hostEnv = process.env.VUE_APP_ONLYOFFICE_HOST || process.env.ONLYOFFICE_HOST || null
          const portEnv = process.env.VUE_APP_ONLYOFFICE_HTTP_PORT || process.env.ONLYOFFICE_HTTP_PORT || null
          const dsUrl = hostEnv && portEnv ? `http://${hostEnv}:${portEnv}/web-apps/apps/api/documents/api.js` : null
          let docsApiReachable = false
          if (dsUrl) {
            try {
              const mod = dsUrl.startsWith('https') ? require('https') : require('http')
              docsApiReachable = await new Promise((resolve) => {
                const r = mod.get(dsUrl, (r2) => resolve(r2.statusCode === 200))
                r.on('error', () => resolve(false))
              })
            } catch (e) {}
          }
          const publicHost = process.env.VUE_APP_PUBLIC_HOST || null
          const publicPort = process.env.VUE_APP_PUBLIC_PORT || null
          const paths = {
            publicDrafts: path.join(__dirname, 'public', 'local-storage', 'drafts'),
          }
          const exists = {
            publicDrafts: fs.existsSync(paths.publicDrafts),
          }
          res.status(200).json({
            ok: true,
            env: { hostEnv, portEnv, publicHost, publicPort },
            docsApiUrl: dsUrl,
            docsApiReachable,
            paths,
            exists,
          })
        } catch (e) {
          res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
        }
      })
      devServer.app.get('/__local-list', (req, res) => {
        try {
          const fs = require('fs')
          const path = require('path')
          const dir = path.join(__dirname, 'public', 'local-storage', 'drafts')
          fs.mkdirSync(dir, { recursive: true })
          let files = []
          try {
            const names = fs.readdirSync(dir)
            files = names.map((name) => {
              const fp = path.join(dir, name)
              const st = fs.statSync(fp)
              return { name, size: st.size, mtimeMs: st.mtimeMs }
            })
          } catch (e) {}
          res.status(200).json({ ok: true, files })
        } catch (e) {
          res.status(500).json({ ok: false, error: e && e.message ? e.message : String(e) })
        }
      })
      return middlewares
    }
  },

  // disable source map in production
  productionSourceMap: false,
  lintOnSave: false,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}

// preview.pro.loacg.com only do not use in your production;
if (process.env.VUE_APP_PREVIEW === 'true') {
  // add `ThemeColorReplacer` plugin to webpack plugins
  vueConfig.configureWebpack.plugins.push(createThemeColorReplacerPlugin())
}

module.exports = vueConfig
