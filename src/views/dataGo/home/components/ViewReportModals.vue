<template>
  <div>
    <a-modal
      class="qr-modal"
      :visible="setReportName"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @ok="$emit('reset-report')"
      @cancel="$emit('update:setReportName', false)"
    >
      <div class="set-name">
        <div class="set-name-title">{{ popTitle }}</div>
        <a-input allowClear size="large" v-model="otherNameProxy"></a-input>
      </div>
    </a-modal>
    <a-modal
      class="view-page-pop"
      :visible="openDataYC"
      width="80vw"
      :bodyStyle="{ height: '80vh', padding: 0, backgroundColor: 'transparent' }"
      :footer="null"
      @cancel="$emit('update:openDataYC', false)"
    >
      <anomaly-content :customerDetail="customerDetail"></anomaly-content>
    </a-modal>
    <a-modal :footer="null" :visible="udt" title="数据更新提醒" @cancel="$emit('update:udt', false)">
      <div class="update-item-line" v-for="item in uploadTableList" :key="item.id">
        <span class="update-item-title">{{ item.tableNameC }}</span>
        <span class="update-item-time">{{ item.changeTime }}</span>
      </div>
    </a-modal>
  </div>
  </template>
  
  <script>
import AnomalyContent from '../../anomaly/innerContent.vue'
export default {
  name: 'ViewReportModals',
  components: { AnomalyContent },
  props: {
    setReportName: { type: Boolean, default: false },
    popTitle: { type: String, default: '' },
    otherSaveReportName: { type: String, default: '' },
    openDataYC: { type: Boolean, default: false },
    customerDetail: { type: Object, default: () => ({}) },
    udt: { type: Boolean, default: false },
    uploadTableList: { type: Array, default: () => [] }
  },
  computed: {
    otherNameProxy: {
      get() {
        return this.otherSaveReportName
      },
      set(v) {
        this.$emit('update:otherSaveReportName', v)
      }
    }
  }
}
  </script>
  
  <style scoped>
  </style>
