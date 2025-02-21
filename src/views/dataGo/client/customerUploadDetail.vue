<template>
  <div>
    <div v-for="item in customerUploadList" :key="item.name">
      <div class="class-name">{{ item.name }}</div>
      <div class="detail-files" v-for="i in item.data" :key="i.tableName">
        <a-row type="flex" align="middle" class="row-box">
          <a-col :span="5">{{ i.tableNameZh }}</a-col>
          <a-col :span="4"> 采集方式：{{ i.type === 'crawl' ? '授权采集' : '数据上传' }} </a-col>
          <a-col :span="2">
            <div v-if="i.type === 'crawl'" :class="'type' + i.status">
              {{ i.status ? '已采集' : '未授权' }}
            </div>
            <div v-else-if="i.type === 'upload'" :class="'type' + i.status">
              {{ i.status ? '已上传' : '未授权' }}
            </div>
          </a-col>
          <a-col :span="4">
            <a-button @click="uploadData(i)"> {{ i.status ? '重新上传数据表' : '上传数据表' }} </a-button>
          </a-col>
          <a-col :span="4">
            <a-button @click="toRecognition(i)"> 前往识别pdf/图片 </a-button>
          </a-col>
          <a-col :span="4"> 最近操作时间：2025-01-01 18:02:54 </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerUploadDetail',
  props: {
    customerUploadList: {
      type: Array,
    },
  },
  data() {
    return {}
  },
  methods: {
    uploadData(i) {},
    toRecognition(i) {},
  },
}
</script>

<style lang="less" scoped>
.class-name {
  font-family: PingFangSC-Semibold;
  font-size: 24px;
  color: #1b69ff;
  letter-spacing: 0;
  line-height: 33px;
  font-weight: 600;
  padding: 12px 0;
  border-bottom: 1px dotted #1b69ff;
}
.detail-files {
  margin: 20px 0;
}
.row-box {
  /deep/ .ant-col {
    font-family: PingFangSC-Semibold;
    font-size: 16px;
    letter-spacing: 0;
    font-weight: 600;
  }
}
.type1 {
  color: green;
}
.type0 {
  color: grey;
}
</style>