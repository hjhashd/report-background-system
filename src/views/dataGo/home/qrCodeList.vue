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
    </div>
    <div class="table-contant">
      <s-table ref="table" rowKey="key" :data="loadData" :columns="qrColumns">
        <template slot="id" slot-scope="txt, scoped, index">{{
          (queryParam.pageNum - 1) * queryParam.pageSize + index + 1
        }}</template>
        <span slot="status" slot-scope="text">
          <!-- // 0 草稿 1 已完成 2 数据未授权 3 数据已授权 -->
          <span v-if="text == 0" :class="['table-status', 'status' + text]">已失效</span>
          <span v-if="text == 1" :class="['table-status', 'status' + text]">生效中</span>
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
        <template slot="codeUrl" slot-scope="text">
          <div class="pointer" @click="showImg(text)">
            <img style="width: 40px; height: 40px" :src="text" alt="dark" />
          </div>
        </template>
      </s-table>
    </div>
    <a-modal class="qr-modal" v-model="qrCodePop" :footer="null">
      <div style="text-align: center; padding: 20px">
        <img style="width: 200px; height: 200px" :src="showImgUrl" alt="dark" />
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
import { mapState } from 'vuex'
import { getQRCodeList } from '@/api/qrcode'
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
      showImgUrl: null,
      reportTypeList,
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
  computed: {
    ...mapState({
      overview: (state) => state.user.overview,
    }),
  },
  methods: {
    handleChat(v) {
      const { $router } = this
      $router.push({ path: `/homePage/viewReport/` + v.id })
    },
    selectChange() {
      this.$refs.table.refresh()
    },
    showImg(url) {
      this.showImgUrl = url
      this.qrCodePop = true
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
  &.status0 {
    color: #666666;
  }
  &.status1 {
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
</style>