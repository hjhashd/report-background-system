<!--
 * @Author: bekon
 * @Date: 2025-02-21 16:45:11
 * @LastEditors: bekon
 * @LastEditTime: 2025-02-26 19:56:41
 * @FilePath: /report-background-system/src/views/dataGo/client/customerUploadDetail.vue
 * @Description: 
 * 
-->
<template>
  <div>
    <div class="item-content flex">
      <div class="flex" style="margin-right: 15px">
        <div>采集方式：</div>
        <div v-for="item in graftFun" :key="item.name" class="flex const-show">
          <div class="dotted" :style="{ backgroundColor: item.color }"></div>
          {{ item.name }}
        </div>
      </div>
      <div class="flex">
        <div>操作类型：</div>
        <div v-for="item in coopFun" :key="item.icon" class="flex const-show">
          <a-icon class="dotted" :style="{ color: item.color }" :type="item.icon" />
          {{ item.name }}
        </div>
      </div>
    </div>
    <div v-for="item in customerUploadList" :key="item.name" class="item-content">
      <div class="class-name">{{ item.name }}</div>
      <a-table class="tab-table" :columns="columns" :data-source="item.data" :pagination="false" size="small">
        <div slot="type" slot-scope="i">{{ i === 'crawl' ? '授权采集' : '数据上传' }}</div>
        <div slot="status" slot-scope="i, scoped">
          <div v-if="scoped.type === 'crawl'" :class="'type' + i">
            {{ i ? '已采集' : '未授权' }}
          </div>
          <div v-else-if="scoped.type === 'upload'" :class="'type' + i">
            {{ i ? '已上传' : '未授权' }}
          </div>
        </div>
        <div slot="tool" slot-scope="text, scope">
          <div class="flex">
            <div v-for="sonItem in coopFun" :key="sonItem.icon">
              <a-upload
                v-if="sonItem.icon == 'upload'"
                :name="scope.tableName"
                :customRequest="uploadFile"
                :showUploadList="false"
              >
                <a-button
                  :icon="sonItem.icon"
                  :style="{ color: sonItem.color, border: 'none', margin: '0 10px' }"
                  @click="uploadItem(scope)"
                />
              </a-upload>
              <a-button
                v-else
                @click="toDealFun(sonItem.icon)"
                :icon="sonItem.icon"
                :style="{ color: sonItem.color, border: 'none', margin: '0 10px' }"
              />
            </div>
          </div>
        </div>
      </a-table>
    </div>
  </div>
</template>

<script>
import { uploadFile } from '@/api/report'
import { graftFun, coopFun, columns } from './util'
import { mapActions } from 'vuex'
export default {
  name: 'CustomerUploadDetail',
  props: {
    customerInfo: {
      type: Object,
      required: true,
    },
    customerUploadList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      graftFun,
      coopFun,
      columns,
      clickItem: null,
      uploading: false,
      disabledList: [],
    }
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    toDealFun(icon) {
      switch (icon) {
        case 'redo':
          // 重新采集
          this.changeBuildQrCodePop(true)
          break
        case 'upload':
          // 上传文件
          break
        case 'file-pdf':
          // 识别文件
          this.$router.push({ path: '/readWordPage/index' })
          break
      }
    },
    uploadFile(options) {
      const { $notification } = this
      const { file, onSuccess, onError } = options
      const formData = new FormData()
      const item = this.clickItem
      if (this.disabledList.findIndex((i) => i.tableName == item.tableName) != -1) {
        $notification['info']({
          message: '上传通知：',
          description: `该文档文件正在上传，请稍后再试`,
          duration: 6,
        })
        return
      }
      formData.append(item.tableName, file)
      this.uploading = true
      this.disabledList.push(item.tableName)
      uploadFile(formData, this.customerInfo.appUserId).then((res) => {
        this.uploading = false
        this.disabledList = this.disabledList.filter((item) => item != item.tableName)
        if (res.code && res.code == 200) {
          $notification['success']({
            message: '上传通知：',
            description: `上传文件成功：${file.name}`,
            duration: 6,
          })
        } else {
          $notification['error']({
            message: '上传通知：',
            description: `${res.msg}`,
            duration: 6,
          })
        }
      })
    },
    uploadItem(v) {
      this.clickItem = v
    },
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
.item-content {
  padding: 12px;
  background-color: #fff;
  margin-bottom: 20px;
  border-radius: 8px;
}
.dotted {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin: 0 5px;
}
.const-show {
  align-items: center;
}
/* 去除表格行的鼠标悬停高亮效果 */
.tab-table {
  /deep/ .ant-table-tbody > tr:hover > td {
    background: inherit !important;
  }
}
</style>