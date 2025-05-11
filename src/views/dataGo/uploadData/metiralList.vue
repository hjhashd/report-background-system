<template>
  <a-spin :spinning="pageLoading">
    <div class="tab">
      <div
        class="flex-1 tab-item"
        :class="{ active: item == tabSelect }"
        v-for="(item, index) in uploadTab"
        :key="index"
        @click="() => (tabSelect = item)"
      >
        {{ item }}
      </div>
    </div>

    <!-- 内容 -->
    <a-collapse v-model="activeKey" expand-icon-position="right" style="border: none">
      <a-collapse-panel v-for="item in showColl" :key="item.icon" :class="'tab-item-' + item.icon">
        <template slot="header">
          <div class="flex-row-spacebetween coll-item-style">
            <div class="mm">
              <a-icon class="icon" :type="item.icon" />
              <span class="title">{{ item.title }}</span>
              <span class="desc">{{ item.desc }}</span>
            </div>
            <div class="have-file-num">{{ item.data.length }}个文件</div>
          </div>
        </template>
        <a-table :columns="defaultColumns" :data-source="item.data" :bordered="true" :pagination="false">
          <div slot="id" slot-scope="i, scoped, index">{{ index + 1 }}</div>
          <template slot="action" slot-scope="text, scoped">
            <a-tooltip>
              <template slot="title">
                <span>下载文件</span>
              </template>
              <a-button
                @click="downloadModal(scoped)"
                :style="{ color: '#7fbbf1', border: 'none', padding: 0, 'padding-right': '5px' }"
              >
                <img style="width: 20px; height: 22px" src="@/assets/images/download-modal.png" alt="dark" /><span
                  >下载文件</span
                >
              </a-button>
            </a-tooltip>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </a-spin>
</template>

<script>
import { webCollapseList, appCollapseList, defaultColumns } from './util'
import { mapState } from 'vuex'
import { getAppFileList, getUploadsFile, getAutoFiles, getDYFiles } from '@/api/report'
const uploadTab = ['Web端', '小程序/APP端']
export default {
  props: {
    customerInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      // 动态主路由
      userInfo: (state) => state.user.info,
    }),
  },
  data() {
    return {
      pageLoading: true,
      uploadTab,
      tabSelect: uploadTab[0],
      activeKey: [],
      defaultColumns,
      webCollapseList,
      appCollapseList,
      showColl: [],
    }
  },
  watch: {
    customerInfo: {
      handler(v) {
        this.initData()
      },
    },
    tabSelect: {
      handler(v) {
        if (v === 'Web端') {
          this.showColl = this.webCollapseList
        } else {
          this.showColl = this.appCollapseList
        }
      },
    },
  },
  mounted() {
    this.showColl = this.webCollapseList
    this.initData()
  },
  methods: {
    initData() {
      Promise.all([this.getAppFileLists(), this.getUploadsFiles(), this.getAutoFiles(), this.getDYFiles()])
        .then((res) => {
          this.pageLoading = false
        })
        .catch((err) => {
          this.pageLoading = false
        })
    },
    getAppFileLists() {
      getAppFileList({ agentUserId: this.userInfo.userId, appUserId: this.customerInfo.appUserId }).then((res) => {
        this.appCollapseList[0].data = res.data
      })
    },
    getUploadsFiles() {
      getUploadsFile({ appUserId: this.customerInfo.appUserId }).then((res) => {
        this.webCollapseList[0].data = res.data
      })
    },
    getAutoFiles() {
      getAutoFiles({ appUserId: this.customerInfo.appUserId }).then((res) => {
        this.webCollapseList[1].data = res.data
      })
    },
    getDYFiles() {
      getDYFiles({ appUserId: this.customerInfo.appUserId }).then((res) => {
        this.webCollapseList[2].data = res.data
      })
    },
    downloadModal(v) {
      const url = v.fileUrl
      const filename = `${v.fileName}`
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function () {
        if (xhr.status === 200) {
          const blob = xhr.response
          const urlObject = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = urlObject
          a.download = filename
          a.click()
          URL.revokeObjectURL(urlObject)
        }
      }
      xhr.send()
    },
  },
}
</script>

<style lang="less" scoped>
.tab {
  margin-bottom: 10px;
  display: flex;
  .tab-item {
    line-height: 2;
    margin: 4px;
    text-align: center;
    border: 1px solid #e4e4e7;
    border-radius: 3px;
    cursor: pointer;
    &.active {
      color: #fff;
      background-color: #528bfb;
    }
  }
}
.tab-item-upload {
  border: none !important;
  margin-bottom: 20px;
  /deep/ .ant-collapse-header {
    color: #fff;
    background: linear-gradient(to right, #06bedd 0%, #3b82f6 100%);
    border: none !important;
    border-radius: 10px;
  }
  /deep/ .ant-collapse-content {
    border: none;
  }
}
.tab-item-sync {
  border: none !important;
  margin-bottom: 20px;
  /deep/ .ant-collapse-header {
    color: #fff;
    background: linear-gradient(to right, #4ee986 0%, #11c287 100%);
    border: none !important;
    border-radius: 10px;
  }
  /deep/ .ant-collapse-content {
    border: none;
  }
}
.tab-item-check-square {
  border: none !important;
  margin-bottom: 20px;
  /deep/ .ant-collapse-header {
    color: #fff;
    background: linear-gradient(to right, #c084fc 0%, #6466f1 100%);
    border: none !important;
    border-radius: 10px !important;
  }
  /deep/ .ant-collapse-content {
    border: none;
  }
}
.tab-item-user {
  border: none !important;
  margin-bottom: 20px;
  /deep/ .ant-collapse-header {
    color: #fff;
    background: linear-gradient(to right, #fbbf24 0%, #f97316 100%);
    border: none !important;
    border-radius: 10px !important;
  }
  /deep/ .ant-collapse-content {
    border: none;
  }
}
.coll-item-style {
  color: #fff;
  .mm {
    display: flex;
    align-items: center;
  }
  .icon {
    font-size: 16px;
    font-weight: bold;
    margin-right: 4px;
  }
  .title {
    font-weight: bold;
    font-size: 16px;
  }
  .have-file-num {
    font-size: 12px;
    line-height: 1;
    font-weight: bold;
    padding: 4px 12px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.15);
  }
}
</style>