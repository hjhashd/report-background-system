const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')

const port = process.env.PORT ? Number(process.env.PORT) : 8000
const distDir = path.join(__dirname, 'dist')
const publicLocalDir = path.join(__dirname, 'public', 'local-storage', 'drafts')

try { fs.mkdirSync(publicLocalDir, { recursive: true }) } catch (e) {}

function sendJson(res, code, obj) {
  const data = Buffer.from(JSON.stringify(obj || {}))
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', data.length)
  res.end(data)
}

function serveStaticFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404
      res.end()
      return
    }
    const st = fs.statSync(filePath)
    if (st.isDirectory()) {
      res.statusCode = 404
      res.end()
      return
    }
    const stream = fs.createReadStream(filePath)
    res.statusCode = 200
    res.setHeader('Content-Length', st.size)
    
    // 🔥🔥🔥 新增：暴力允许跨域 🔥🔥🔥
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    // 🔥🔥🔥 结束 🔥🔥🔥
    
    res.setHeader('Cache-Control', 'no-cache')
    stream.pipe(res)
  } catch (e) {
    res.statusCode = 500
    res.end()
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      let json = null
      try { json = raw ? JSON.parse(raw) : null } catch (e) {}
      resolve({ raw, json })
    })
  })
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname || '/'

  if (req.method === 'GET' && pathname === '/__proxy-fetch') {
    const src = parsed.query && parsed.query.url ? parsed.query.url : ''
    if (!src) return sendJson(res, 400, { ok: false, error: 'missing url' })
    try {
      const mod = src.startsWith('https') ? require('https') : require('http')
      const r2 = mod.get(src, (r) => {
        const chunks = []
        r.on('data', (c) => chunks.push(c))
        r.on('end', () => {
          const buf = Buffer.concat(chunks)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/octet-stream')
          res.setHeader('Content-Length', buf.length)
          res.end(buf)
        })
      })
      r2.on('error', (e) => sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) }))
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
    return
  }

  if (req.method === 'POST' && pathname === '/__local-upload') {
    const body = await parseBody(req)
    try {
      const nameRaw = body.json && body.json.filename ? body.json.filename : ''
      const name = path.basename(nameRaw || '')
      const base64 = body.json && body.json.content ? body.json.content : ''
      const buf = base64 ? Buffer.from(base64, 'base64') : Buffer.alloc(0)
      fs.mkdirSync(publicLocalDir, { recursive: true })
      try { fs.writeFileSync(path.join(publicLocalDir, name), buf) } catch (e) {}
      return sendJson(res, 200, { ok: true })
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  }

  if (req.method === 'DELETE' && pathname === '/__local-upload') {
    try {
      const nameRaw = parsed.query && parsed.query.filename ? parsed.query.filename : ''
      const name = path.basename(nameRaw || '')
      const fp1 = path.join(publicLocalDir, name)
      let removed = false
      try { if (fs.existsSync(fp1)) { fs.unlinkSync(fp1); removed = true } } catch (e) {}
      if (!removed) return sendJson(res, 404, { ok: false, error: 'file not found' })
      return sendJson(res, 200, { ok: true })
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  }

  if (req.method === 'GET' && pathname === '/__local-list') {
    try {
      fs.mkdirSync(publicLocalDir, { recursive: true })
      let files = []
      try {
        const names = fs.readdirSync(publicLocalDir)
        files = names.map((name) => {
          const fp = path.join(publicLocalDir, name)
          const st = fs.statSync(fp)
          return { name, size: st.size, mtimeMs: st.mtimeMs }
        })
      } catch (e) {}
      return sendJson(res, 200, { ok: true, files })
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  }

  if (req.method === 'POST' && pathname === '/__onlyoffice-callback') {
    const body = await parseBody(req)
    console.log('[OnlyOffice Callback] Received request:', {
      query: parsed.query,
      bodyKeys: Object.keys(body.json || {}),
      status: body.json ? body.json.status : 'unknown'
    })
    try {
      const payload = body.json || {}
      // status 2 = ready for saving, status 6 = force save
      if (payload.status !== 2 && payload.status !== 6) {
        console.log('[OnlyOffice Callback] Status not 2 or 6, ignoring save. Status:', payload.status)
        return sendJson(res, 200, { error: 0 })
      }
      
      const src = payload.url || null
      const filetype = (payload.filetype || 'docx').replace('.', '')
      const title = parsed.query && parsed.query.name ? parsed.query.name : (payload.title || '未命名文档')
      
      console.log('[OnlyOffice Callback] Payload details:', { src, filetype, title })
      
      if (!src) {
        console.error('[OnlyOffice Callback] No URL in payload')
        return sendJson(res, 200, { error: 0 })
      }
      
      const hostEnv = process.env.VUE_APP_ONLYOFFICE_HOST || process.env.ONLYOFFICE_HOST || null
      const portEnv = process.env.VUE_APP_ONLYOFFICE_HTTP_PORT || process.env.ONLYOFFICE_HTTP_PORT || null
      let finalUrl = src
      try {
        const u = new URL(src)
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
      const ts = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('') + '-' + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('')
      const base = String(title).replace(/\.[^\.]+$/, '')
      const ext = filetype.startsWith('.') ? filetype : `.${filetype}`
      const physicalName = `${base}_${ts}${ext}`
      
      console.log('[OnlyOffice Callback] Downloading from:', finalUrl, 'to:', physicalName)
      
      const mod = finalUrl.startsWith('https') ? require('https') : require('http')
      const buf = await new Promise((resolve, reject) => {
        const r2 = mod.get(finalUrl, (r) => {
          if (r.statusCode !== 200) {
            reject(new Error(`Download failed with status ${r.statusCode}`))
            return
          }
          const chunks = []
          r.on('data', (c) => chunks.push(c))
          r.on('end', () => resolve(Buffer.concat(chunks)))
          r.on('error', reject)
        })
        r2.on('error', reject)
        r2.setTimeout(10000, () => {
          r2.abort()
          reject(new Error('Download timeout'))
        })
      })
      
      const fullPath = path.join(publicLocalDir, physicalName)
      fs.writeFileSync(fullPath, buf)
      console.log('[OnlyOffice Callback] Save successful:', fullPath, 'Size:', buf.length)
      
      return sendJson(res, 200, { error: 0 })
    } catch (e) {
      console.error('[OnlyOffice Callback] Error:', e.message)
      return sendJson(res, 200, { error: 1 })
    }
  }

  if (req.method === 'GET' && pathname === '/__debug/status') {
    try {
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
      const paths = { publicDrafts: publicLocalDir }
      const exists = { publicDrafts: fs.existsSync(publicLocalDir) }
      return sendJson(res, 200, {
        ok: true,
        env: { hostEnv, portEnv, publicHost, publicPort },
        docsApiUrl: dsUrl,
        docsApiReachable,
        paths,
        exists,
      })
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  }

  if (req.method === 'GET' && pathname.startsWith('/local-storage/')) {
    const rel = pathname.replace(/^\/local-storage\//, '')
    const fp = path.join(__dirname, 'public', 'local-storage', rel)
    return serveStaticFile(res, fp)
  }

  if (req.method === 'GET') {
    let fp = path.join(distDir, pathname.replace(/^\//, ''))
    if (fp.endsWith('/')) fp = path.join(fp, 'index.html')
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
      fp = path.join(distDir, 'index.html')
    }
    return serveStaticFile(res, fp)
  }

  res.statusCode = 404
  res.end()
})

server.listen(port, () => {
  process.stdout.write(`Server listening on ${port}\n`)
})
