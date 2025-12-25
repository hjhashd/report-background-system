import { applyFilters, filterMarkerData } from '@/utils/jsonFilter'

describe('jsonFilter', () => {
  test('shows all records without filters', () => {
    const items = [
      { id: 1, reportName: 'A', reportType: 1, genStatus: 4, createdAt: 1000 },
      { id: 2, reportName: 'B', reportType: 2, genStatus: 1, createdAt: 2000 }
    ]
    const res = applyFilters(items, { page: 1, pageSize: 10 })
    expect(res.total).toBe(2)
    expect(res.data.length).toBe(2)
  })

  test('text search case-insensitive', () => {
    const items = [
      { id: 1, reportName: 'Alpha', createdAt: 1 },
      { id: 2, reportName: 'beta', createdAt: 2 }
    ]
    const res = applyFilters(items, { text: 'ALP', textFields: ['reportName'], page: 1, pageSize: 10 })
    expect(res.total).toBe(1)
    expect(res.data[0].id).toBe(1)
  })

  test('equals filter', () => {
    const items = [
      { id: 1, reportType: 1, createdAt: 1 },
      { id: 2, reportType: 2, createdAt: 2 }
    ]
    const res = applyFilters(items, { equals: { reportType: 2 }, page: 1, pageSize: 10 })
    expect(res.total).toBe(1)
    expect(res.data[0].id).toBe(2)
  })

  test('range filter on createdAt', () => {
    const items = [
      { id: 1, createdAt: 1000 },
      { id: 2, createdAt: 2000 },
      { id: 3, createdAt: 3000 }
    ]
    const res = applyFilters(items, { ranges: { createdAt: [1500, 2500] }, page: 1, pageSize: 10 })
    expect(res.total).toBe(1)
    expect(res.data[0].id).toBe(2)
  })

  test('sorting asc and desc', () => {
    const items = [
      { id: 1, reportName: 'c', createdAt: 1 },
      { id: 2, reportName: 'a', createdAt: 2 },
      { id: 3, reportName: 'b', createdAt: 3 }
    ]
    const asc = applyFilters(items, { sortBy: 'reportName', sortOrder: 'asc', page: 1, pageSize: 10 })
    const desc = applyFilters(items, { sortBy: 'reportName', sortOrder: 'desc', page: 1, pageSize: 10 })
    expect(asc.data.map(x => x.reportName)).toEqual(['a', 'b', 'c'])
    expect(desc.data.map(x => x.reportName)).toEqual(['c', 'b', 'a'])
  })

  test('nested path filtering', () => {
    const items = [
      { id: 1, meta: { author: 'Alice' }, createdAt: 1 },
      { id: 2, meta: { author: 'Bob' }, createdAt: 2 }
    ]
    const res = applyFilters(items, { text: 'bob', textFields: ['meta.author'], page: 1, pageSize: 10 })
    expect(res.total).toBe(1)
    expect(res.data[0].id).toBe(2)
  })

  test('pagination', () => {
    const items = []
    for (let i = 0; i < 25; i++) items.push({ id: i + 1, createdAt: i + 1 })
    const res = applyFilters(items, { page: 2, pageSize: 10, sortBy: 'createdAt', sortOrder: 'asc' })
    expect(res.total).toBe(25)
    expect(res.page).toBe(2)
    expect(res.data.length).toBe(10)
    expect(res.data[0].id).toBe(11)
  })

  test('filterMarkerData structure', () => {
    const marker = {
      draftReports: [
        { id: 'd1', title: 'Hello', type: 1, createTime: 1 },
        { id: 'd2', title: 'World', type: 2, createTime: 2 }
      ],
      formalReports: [
        { id: 'f1', title: 'Foo', type: 1, createTime: 3 }
      ]
    }
    const res = filterMarkerData(marker, { text: 'worl', textFields: ['title'], equals: { type: 2 }, page: 1, pageSize: 10 })
    expect(Array.isArray(res.draftReports)).toBe(true)
    expect(Array.isArray(res.formalReports)).toBe(true)
    expect(res.totalDraft).toBe(1)
  })

  test('large dataset performance', () => {
    const items = []
    for (let i = 0; i < 5000; i++) items.push({ id: i + 1, reportName: i % 2 ? 'X' : 'Y', createdAt: i })
    const res = applyFilters(items, { text: 'x', textFields: ['reportName'], page: 1, pageSize: 50 })
    expect(res.total).toBe(2500)
    expect(res.data.length).toBe(50)
  })
})

