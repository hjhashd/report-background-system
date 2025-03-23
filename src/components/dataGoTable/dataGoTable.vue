<!--
 * @Author: bekon
 * @Date: 2025-03-23 11:47:16
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-23 12:28:58
 * @FilePath: /report-background-system/src/components/dataGoTable/dataGoTable.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="tableLoad" class="table-content">
    <s-table :scroll="{ x: '80vw' }" ref="table" rowKey="key" :data="loadData" :columns="columns"> </s-table>
  </a-spin>
</template>

<script>
import { STable } from '@/components'
import { viewReportTable } from '@/api/report'
import { dealTable } from './util'
export default {
  name: 'dataGoTable',
  components: { STable },
  props: {
    seeQuery: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hasFirstLoad: true,
      tableQuery: null,
      tableLoad: false,
      columns: [],
      loadData: (parameter) => {
        const requestParameters = Object.assign({}, parameter, this.tableQuery, {
          pageNum: parameter.pageNo,
        })
        this.tableLoad = true
        return new Promise((resolve, reject) => {
          if (this.hasFirstLoad)
            resolve({
              pageSize: requestParameters.pageSize,
              pageNo: requestParameters.pageNo,
              totalCount: 0,
              totalPage: 1,
              data: [],
            })
          viewReportTable(requestParameters).then((res) => {
            const reD = {
              pageSize: requestParameters.pageSize,
              pageNo: requestParameters.pageNo,
              totalCount: res.total,
              totalPage: Math.ceil(res.total / requestParameters.pageSize),
              data: res.rows,
            }
            this.tableLoad = false
            resolve(reD)
          })
        })
      },
    }
  },
  watch: {
    seeQuery: {
      handler(v) {
        this.tableQuery = this.seeQuery
        this.getViewTable()
      },
    },
  },
  mounted() {
    this.tableQuery = this.seeQuery
    this.getViewTable()
  },
  methods: {
    getViewTable() {
      const { $notification } = this
      viewReportTable(this.tableQuery).then((result) => {
        if (result.code != 200 && result.code != 0) {
          $notification['error']({
            message: '错误通知：',
            description: `${result.msg}`,
            duration: 8,
          })
        } else {
          this.hasFirstLoad = false
          const reObj = dealTable(result.rows)
          this.columns = reObj.columns
          this.$refs.table.refresh()
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
</style>