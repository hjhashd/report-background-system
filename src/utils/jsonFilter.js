import get from 'lodash.get'

export function applyFilters(items, opts = {}) {
  let rows = Array.isArray(items) ? items.slice() : []
  const textRaw = opts.text
  const text = textRaw ? String(textRaw).toLowerCase() : ''
  const textFields = Array.isArray(opts.textFields) ? opts.textFields : []
  const equals = opts.equals || {}
  const ranges = opts.ranges || {}
  if (text) {
    rows = rows.filter(r => {
      for (let i = 0; i < textFields.length; i++) {
        const v = get(r, textFields[i])
        if (v != null && String(v).toLowerCase().includes(text)) return true
      }
      return false
    })
  }
  const eqKeys = Object.keys(equals)
  for (let i = 0; i < eqKeys.length; i++) {
    const k = eqKeys[i]
    const val = equals[k]
    if (val === null || val === undefined || val === '') continue
    rows = rows.filter(r => String(get(r, k)) === String(val))
  }
  const rangeKeys = Object.keys(ranges)
  for (let i = 0; i < rangeKeys.length; i++) {
    const k = rangeKeys[i]
    const pair = ranges[k] || []
    const min = pair[0]
    const max = pair[1]
    rows = rows.filter(r => {
      const v = get(r, k)
      if (v == null) return false
      const n = typeof v === 'number' ? v : Date.parse(v)
      if (Number.isNaN(n)) return false
      if (min != null && n < min) return false
      if (max != null && n > max) return false
      return true
    })
  }
  const sortBy = opts.sortBy
  const sortOrder = opts.sortOrder === 'asc' ? 'asc' : 'desc'
  if (sortBy) {
    rows.sort((a, b) => {
      const va = get(a, sortBy)
      const vb = get(b, sortBy)
      const sa = typeof va === 'string' ? va.toLowerCase() : va
      const sb = typeof vb === 'string' ? vb.toLowerCase() : vb
      if (sa == null && sb == null) return 0
      if (sa == null) return sortOrder === 'asc' ? -1 : 1
      if (sb == null) return sortOrder === 'asc' ? 1 : -1
      if (sa < sb) return sortOrder === 'asc' ? -1 : 1
      if (sa > sb) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }
  const total = rows.length
  const page = Math.max(1, parseInt(opts.page || 1))
  const pageSize = Math.max(1, parseInt(opts.pageSize || 10))
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = rows.slice(start, end)
  return { total, page, pageSize, totalPage: Math.ceil(total / pageSize), data }
}

export function filterMarkerData(marker, opts = {}) {
  const draft = Array.isArray(marker && marker.draftReports) ? marker.draftReports : []
  const formal = Array.isArray(marker && marker.formalReports) ? marker.formalReports : []
  const textFields = Array.isArray(opts.textFields) ? opts.textFields : ['title']
  const equals = opts.equals || {}
  const ranges = opts.ranges || {}
  const resDraft = applyFilters(draft, { text: opts.text, textFields, equals, ranges, sortBy: opts.sortBy, sortOrder: opts.sortOrder, page: opts.page, pageSize: opts.pageSize })
  const resFormal = applyFilters(formal, { text: opts.text, textFields, equals, ranges, sortBy: opts.sortBy, sortOrder: opts.sortOrder, page: 1, pageSize: formal.length || 1 })
  return { draftReports: resDraft.data, formalReports: resFormal.data, totalDraft: resDraft.total, totalFormal: resFormal.total }
}

