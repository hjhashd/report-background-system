<template>
  <page-header-wrapper>
    <div class="flex home-part-title-right flex-1">
      <div class="flex flex-center">
        <div class="right-item-title">二维码类型类型：</div>
        <a-select v-model="draftTypeSelected" style="width: 200px" @change="selectChange" :allowClear="true">
          <a-select-option v-for="item in reportTypeList" :key="item.type" :value="item.type">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div>
        <a-button style="margin-right: 20px" @click="toDealFun">新增数据申请</a-button>
        <a-popconfirm title="是否删除已选中二维码?" ok-text="是" cancel-text="否" @confirm="deleteMutil">
          <a-button>批量删除</a-button>
        </a-popconfirm>
      </div>
    </div>
    <div class="table-contant tab-table">
      <s-table
        ref="table"
        :rowKey="(record) => record.id"
        :data="loadData"
        :columns="qrColumns"
        :row-selection="{
          selectedRowKeys: expandedRowKeys,
          onChange: rowChange,
        }"
      >
        <template slot="id" slot-scope="txt, scoped, index">{{
          (queryParam.pageNum - 1) * queryParam.pageSize + index + 1
        }}</template>
        <span slot="status" slot-scope="text">
          <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
          <span v-if="text == 1" :class="['table-status', 'status' + text]">已失效</span>
          <span v-if="text == 0" :class="['table-status', 'status' + text]">生效中</span>
        </span>
        <span slot="codeType" slot-scope="text">
          {{ text == 1 ? '数据申请' : '数据上传' }}
        </span>
        <span slot="avgOperationTime" slot-scope="text">
          <span v-if="text">约{{ text | dealTime }}小时</span>
          <span v-else>{{ text }}</span>
        </span>
        <span slot="bankNameInfo" slot-scope="text, scoped">
          <span>{{ scoped | showCompany }}</span>
        </span>
        <template slot="codeUrl" slot-scope="text, scoped">
          <div class="pointer" @click="showImg(scoped)">
            <img style="width: 40px; height: 40px" :src="text" alt="dark" />
          </div>
        </template>
        <template slot="action" slot-scope="text, scoped">
          <!-- 这里可以定义操作列的具体内容，例如按钮 -->
          <a-popconfirm title="是否删除该二维码?" ok-text="是" cancel-text="否" @confirm="deleteQrCode(scoped)">
            <a-tooltip>
              <template slot="title">
                <span>删除</span>
              </template>
              <a-button icon="delete" :style="{ color: '#ff4d4f', border: 'none', padding: 0 }"> </a-button>
            </a-tooltip>
          </a-popconfirm>
        </template>
      </s-table>
    </div>
    <a-modal class="qr-modal" v-model="qrCodePop" :footer="null">
      <div style="text-align: center; padding: 20px">
        <a-row>
          <a-col :span="12" class="qr-info-item">
            <label>营业员</label>
            <span>{{ userInfo?.userName }}</span>
          </a-col>
          <a-col :span="12" class="qr-info-item">
            <label>员工号</label>
            <span>{{ userInfo?.jobNumber }}</span>
          </a-col>
          <a-col :span="24" class="qr-info-item">
            <label>银行</label>
            <span>{{ showInfo?.bankName1 }}-{{ showInfo?.bankName2 }}</span>
          </a-col>
          <a-col :span="24" class="qr-info-item" v-if="showInfo && showInfo.showCompany">
            <label>企业名称</label>
            <span>{{ showInfo?.showCompany }}</span>
          </a-col>
          <a-col :span="24" class="qr-info-item" v-if="showInfo && showInfo.appUser">
            <label>授权企业名称</label>
            <span>{{ showInfo | showCompany }}</span>
          </a-col>
          <a-col :span="24" class="qr-info-item">
            <label>用途</label>
            <span>{{ showInfo?.useRemark | yongtuShow(this) }}</span>
          </a-col>
        </a-row>
        <img style="width: 160px; height: 160px" :src="showInfo.codeUrl" alt="dark" />
      </div>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
const reportTypeList = [
  {
    type: 1,
    name: '数据申请',
  },
  {
    type: 2,
    name: '数据上传',
  },
]
import { mapState, mapActions } from 'vuex'
import { yongtu } from '@/config/constants'
import { getQRCodeList, deleteQr, batchDelete } from '@/api/qrcode'
import { STable } from '@/components'
import { baseMixin } from '@/store/app-mixin'
import { qrColumns } from './util'

export default {
  name: 'Analysis',
  mixins: [baseMixin],
  components: {
    STable,
  },
  data() {
    return {
      loading: true,
      qrCodePop: false,
      qrColumns,
      draftTypeSelected: null,
      search: null,
      yongtu,
      showInfo: {},
      reportTypeList,
      expandedRowKeys: [],
      // 查询参数
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
      },
      loadData: (parameter) => {
        let requestParameters = Object.assign({}, this.queryParam, parameter, {
          pageNum: parameter.pageNo,
          codeType: this.draftTypeSelected,
        })
        if (parameter.pageSize !== this.queryParam.pageSize) {
          requestParameters.pageNo = 1
          requestParameters.pageNum = 1
        }
        this.queryParam = JSON.parse(JSON.stringify(requestParameters))
        return new Promise((resolve, reject) => {
          getQRCodeList(requestParameters).then((res) => {
            const reD = {
              pageSize: requestParameters.pageSize,
              pageNo: requestParameters.pageNo,
              totalCount: res.total,
              totalPage: Math.ceil(res.total / requestParameters.pageSize),
              data: res.rows,
            }
            resolve(reD)
          })
        })
      },
    }
  },
  filters: {
    yongtuShow(v, that) {
      if (!v) return ''
      const i = that.yongtu.find((item) => item.id == v)
      return i.name
    },
    dealTime(v) {
      let time = parseInt(v)
      return Math.ceil(time / 3600)
    },
    showCompany(v) {
      if (v.appUser && v.appUser.enterprise) {
        let enter = v.appUser.enterprise
        return enter.enterpriseName
      } else {
        return ''
      }
    },
  },
  watch: {
    buildQrCodePop: {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.$refs.table.refresh()
        }
      },
    },
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.info,
      overview: (state) => state.user.overview,
      buildQrCodePop: (state) => state.user.buildQrCodePop,
    }),
  },
  created() {
    console.log(this.userInfo)
  },
  methods: {
    ...mapActions(['changeBuildQrCodePop']),
    rowChange(_, selectedRows) {
      this.expandedRowKeys = selectedRows.map((u) => u.id)
    },
    deleteMutil() {
      const { $notification } = this
      if (!this.expandedRowKeys.length) {
        $notification['info']({
          message: '通知：',
          description: '未选中删除项',
          duration: 8,
        })
        return
      }
      batchDelete(this.expandedRowKeys).then((i) => {
        if (i.code == 200) {
          $notification['success']({
            message: '通知：',
            description: '删除成功',
            duration: 8,
          })
          this.expandedRowKeys = []
          this.$refs.table.refresh()
        } else {
          $notification['error']({
            message: '通知：',
            description: '删除失败' + i.msg,
            duration: 8,
          })
          this.$refs.table.refresh()
        }
      })
    },
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + v.id })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    showImg(info) {
      this.showInfo = info
      this.qrCodePop = true
    },
    deleteQrCode(v) {
      const { $notification } = this
      deleteQr(v.id).then((res) => {
        $notification['success']({
          message: '通知：',
          description: '删除成功',
          duration: 8,
        })
        this.$refs.table.refresh()
      })
    },
    toDealFun() {
      this.changeBuildQrCodePop(true)
    },
  },
}
</script>

<style lang="less" scoped>
.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.top-card-content {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 24px;

  .title {
    font-size: 20px;
    font-weight: bold;
  }

  .sum {
    font-size: 16px;
  }
}

.overview-card {
  background-color: #fff;
  padding: 10px;

  .title {
    font-size: 18px;
  }
}

.table-contant {
  background-color: #fff;
}

.table-status {
  font-size: 12px;
  &.status1 {
    color: #666666;
  }
  &.status0 {
    color: #25f021;
  }
  &.status2 {
    color: #15dff1;
  }
  &.status3 {
    color: #0a69ef;
  }
}
.home-part-title-right {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #fff;
  justify-content: space-between;
}
.pointer {
  cursor: pointer;
}
/* 去除表格行的鼠标悬停高亮效果 */
.tab-table {
  /deep/ .ant-table-tbody > tr:hover > td {
    background: inherit !important;
  }
  /deep/ .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
}
.qr-info-item {
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #3d4566;
  letter-spacing: 0;
  font-weight: 400;
  display: flex;
  margin: 10px 0;
  label {
    width: 120px;
    margin-right: 15px;
    text-align: right;
  }
}
</style>