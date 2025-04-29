<!--
 * @Author: bekon
 * @Date: 2025-03-23 11:47:16
 * @LastEditors: bekon
 * @LastEditTime: 2025-04-29 11:44:50
 * @FilePath: /report-background-system/src/components/dataGoTable/dataGoTable.vue
 * @Description: 
 * 
-->
<template>
  <a-spin :spinning="tableLoad" class="table-content">
    <a-table
      ref="table"
      :scroll="{ x: '80vw' }"
      :rowKey="(record) => record.key"
      :pagination="pagination"
      :columns="columns"
      :data-source="tableData"
      @change="handleTableChange"
    >
      <template v-for="item in columns" :slot="item.key" slot-scope="text, scoped">
        <div :key="item.key">
          <div v-if="item.key == 'tool'">
            <a-button
              v-if="!scoped.canEdit"
              type="line"
              style="color: #448ef7"
              icon="edit"
              @click="changEdit(scoped)"
            />
            <a-button v-else type="line" style="color: #448ef7" icon="check-circle" @click="uploadLine(scoped)" />
          </div>
          <div v-else>
            <div v-if="!canEdit">{{ text }}</div>
            <div v-if="canEdit && !scoped.canEdit">
              <a-tooltip>
                <template slot="title">
                  <span>{{ text }}</span>
                </template>
                <div class="line-climp">{{ text }}</div>
              </a-tooltip>
            </div>
            <div v-else>
              <a-input
                v-model="scoped[item.key]"
                :data-key="item.key"
                :data-id="scoped.id"
                @change="handleInputChange"
              />
            </div>
          </div>
        </div>
      </template>
    </a-table>
  </a-spin>
</template>

<script>
import { viewReportTable, updateTable } from '@/api/report'
import { dealTable } from './util'
export default {
  name: 'dataGoTable',
  props: {
    seeQuery: {
      type: Object,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    customerInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      hasFirstLoad: true,
      tableQuery: null,
      tableLoad: false,
      columns: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total, range) => `总共 ${total} 条记录`,
      },
      tableData: null,
    }
  },
  watch: {
    seeQuery: {
      handler(v) {
        this.tableQuery = this.seeQuery
        this.getViewTable()
      },
    },
    canEdit: {
      handler(v) {
        if (v) {
          this.tableQuery = this.seeQuery
          this.getViewTable()
        }
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
          const reObj = dealTable(result.rows, this.canEdit)
          this.columns = reObj.columns
          this.tableData = reObj.reData
          this.pagination.total = result.total
        }
      })
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.tableQuery.pageNum = pagination.current
      this.tableQuery.pageSize = pagination.pageSize
      this.getViewTable()
    },
    handleInputChange(v) {
      const { dataset, value } = v.target
      // 更改data值
      this.tableData = this.tableData.map((u) => {
        if (dataset.id == u.id) {
          return Object.assign(u, { [dataset.key]: value })
        } else {
          return u
        }
      })
    },
    changEdit(v) {
      this.tableData = this.tableData.map((u) => {
        if (v.id == u.id) {
          return Object.assign(u, { canEdit: true })
        } else {
          return u
        }
      })
    },
    uploadLine(v) {
      const { $notification } = this
      const queryParams = {
        data: v,
        tableId: this.seeQuery.id,
        appUserId: this.customerInfo.appUserId,
      }
      updateTable(queryParams).then((res) => {
        if (res.code != 200 && res.code != 0) {
          $notification['error']({
            message: '错误通知：',
            description: `${res.msg}`,
            duration: 8,
          })
        } else {
          $notification['success']({
            message: '通知：',
            description: `修改成功`,
            duration: 8,
          })
          this.tableData = this.tableData.map((u) => {
            if (v.id == u.id) {
              return Object.assign(u, { canEdit: false })
            } else {
              return u
            }
          })
          this.getViewTable()
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.line-climp {
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 溢出部分以省略号显示 */
}
</style>