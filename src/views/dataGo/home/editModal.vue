<template>
  <div class="edit-modal-body">
    <div class="drawer-container">
      <div class="select-item flex-row-spacebetween">
        <div>
          选择模块<a-select
            v-model="currentModalSelect"
            style="width: 250px; margin-left: 20px"
            @change="changModalShow"
          >
            <a-select-option v-for="(i, index) in modalList" :key="index" :value="i">
              {{ i }}
            </a-select-option>
          </a-select>
          历史版本<a-select v-model="selectModalId" style="width: 250px; margin-left: 20px" @change="changeSelect">
            <a-select-option v-for="(i, index) in modalContentList" :key="index" :value="i.id">
              <span v-if="i.versionName">{{ i.versionName }}</span>
              <span v-else>版本{{ i.version }}-{{ i.updateTime.split(' ')[0] }}</span>
            </a-select-option>
          </a-select>
        </div>
        <div>
          <a-tooltip placement="top" style="margin-right: 10px">
            <template slot="title">
              <span>AI优化</span>
            </template>
            <!-- <a-popconfirm :disabled="editLoading" placement="left" ok-text="AI优化" cancel-text="取消" @confirm="toAI">
              <template slot="title">
                <div>是否通过AI对模板结论进行优化?</div>
                <div>注意：进行AI优化会修改当前编辑框内容。</div>
              </template>
            </a-popconfirm> -->
            <img class="ai-png" src="@/assets/images/ai.png" alt="dark" @click="toAI" />
          </a-tooltip>
          <a-tooltip placement="top" style="margin-right: 10px">
            <template slot="title">
              <span>新增结论</span>
            </template>
            <a-popconfirm
              :disabled="editLoading"
              placement="left"
              ok-text="新增结论"
              cancel-text="取消"
              @confirm="addModalResult"
            >
              <template slot="title">
                <div>是否新增模板结论?</div>
                <div>注意：进行新增模板结论会清空当前编辑框内容。</div>
              </template>
              <a-button style="color: #6cbdf6; border: none; background-color: transparent" icon="plus" />
            </a-popconfirm>
          </a-tooltip>
          <a-tooltip placement="top" style="margin-right: 10px">
            <template slot="title">
              <span>另存为</span>
            </template>
            <a-button
              @click="setContentPop = true"
              :loading="saveLoading"
              style="color: #6cbdf6; border: none; background-color: transparent"
              icon="save"
            />
          </a-tooltip>
          <a-tooltip placement="top">
            <template slot="title">
              <span>应用</span>
            </template>
            <a-popconfirm
              :disabled="editLoading"
              placement="left"
              ok-text="应用结论"
              cancel-text="取消"
              @confirm="applyChanges"
            >
              <template slot="title">
                <div>是否应用?</div>
              </template>
              <a-button
                style="color: #6cbdf6; border: none; background-color: transparent"
                icon="check-circle"
                :loading="applyLoading"
              />
            </a-popconfirm>
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="report-container">
      <a-row class="grid-box">
        <a-col :span="11">
          <div class="flex-row-spacebetween cant-edit-box">
            <span class="red-dot status-tag">原报告内容</span>
            <span>不可编辑</span>
          </div>
        </a-col>
        <a-col :span="11">
          <span class="status-tag green-tag">修改编辑</span>
        </a-col>
        <!-- <a-col :span="6" class="flex flex-end"> </a-col> -->
      </a-row>
      <a-row :gutter="[10]" v-if="modalContentList">
        <a-col :span="11" class="un-edit-pass">
          <a-textarea
            :style="{
              height: !isExpend && !isColorExpend ? '68vh' : '0px',
              display: !isExpend && !isColorExpend ? 'inline-block' : 'none',
            }"
            v-model="useContent.content"
            :auto-size="true"
            :disabled="true"
          />
          <a-collapse @change="getKey" accordion v-if="isExpend" :style="{ height: isExpend ? '68vh' : '0px' }">
            <a-collapse-panel key="1" header="内容生产">
              <div class="ai-expend">
                <div class="flex-row-spacebetween btn-part">
                  <div style="padding: 0 10px; z-index: 1000" class="line-item flex-row-spacebetween flex-1">
                    <div v-for="(item, index) in aiTypeList" :key="index" @click="chooseAI(item.value)">
                      <div class="item">
                        <div class="dott" :class="{ active: item.value === aiType }"></div>
                        <div class="ai-item-title">{{ item.value }}</div>
                      </div>
                    </div>
                  </div>
                  <a-dropdown>
                    <a-menu slot="overlay" @click="menuChoose">
                      <a-menu-item v-for="(item, index) in aiTypes" :key="index" :value="item">
                        {{ item }}
                      </a-menu-item>
                    </a-menu>
                    <a-button style="padding: 0 5px"> <a-icon type="ellipsis" /> </a-button>
                  </a-dropdown>
                </div>
                <div class="ai-response" v-if="AIresponse">
                  <!-- <div class="ai-title">{{ aiType }}</div> -->
                  <a-textarea
                    style="height: calc(68vh - 185px)"
                    v-model="AIresponse"
                    :auto-size="true"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="loading-zezao" v-if="clickInAI">
                <div class="top-t w100 flex-row-spacebetween">
                  <span>正在补充{{ aiType }}...</span>
                  <span>{{ processNum }}%</span>
                </div>
                <a-progress :showInfo="false" strokeColor="#64ceea" :percent="processNum" status="active" />
                <div class="detail">AI正在分析报告内容</div>
              </div>
              <div class="ex-icon">
                <a-icon
                  theme="filled"
                  style="font-size: 20px"
                  :class="{ 'close-icon': !isExpend }"
                  type="up-circle"
                  @click="isExpend = !isExpend"
                />
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="内容润色">
              <div class="ai-expend">
                <div class="flex-row-spacebetween btn-part">
                  <div style="padding: 0 10px; z-index: 1000" class="flex-1">
                    <a-checkbox-group v-model="aiColorType" @change="chooseAIColor">
                      <div class="flex">
                        <div v-for="(item, index) in aiColorList" :key="index" :value="item">
                          <a-checkbox :value="item" v-if="index < 3">
                            {{ item }}
                          </a-checkbox>
                        </div>
                      </div>
                    </a-checkbox-group>
                  </div>
                  <a-dropdown>
                    <a-checkbox-group
                      style="background-color: #fff; padding: 5px; border: 1px solid #f5f5f5"
                      slot="overlay"
                      v-model="aiColorType"
                      @change="chooseAIColor"
                    >
                      <a-row v-for="(item, index) in aiColorList" :key="index" :value="item">
                        <a-checkbox :value="item">
                          {{ item }}
                        </a-checkbox>
                      </a-row>
                    </a-checkbox-group>
                    <a-button style="padding: 0 5px"> 更多 </a-button>
                  </a-dropdown>
                  <a-button style="padding: 0 5px; margin-left: 10px" @click="confirmAIColor"> 确定 </a-button>
                </div>
                <div class="ai-response" v-if="AIresponseColor">
                  <a-textarea
                    style="height: calc(68vh - 185px)"
                    v-model="AIresponseColor"
                    :auto-size="true"
                    :disabled="true"
                  />
                </div>
              </div>
              <div class="loading-zezao" v-if="clickInAIColor">
                <div class="top-t w100 flex-row-spacebetween">
                  <span>正在进行AI润色...</span>
                  <span>{{ processNum }}%</span>
                </div>
                <a-progress :showInfo="false" strokeColor="#64ceea" :percent="processNum" status="active" />
                <div class="detail">AI正在分析报告内容</div>
              </div>
            </a-collapse-panel>
          </a-collapse>
          <div class="ex-icon">
            <a-icon
              theme="filled"
              style="font-size: 20px"
              :class="{ 'close-icon': !isExpend }"
              type="up-circle"
              @click="isExpend = !isExpend"
            />
          </div>

          <div class="footer-btns">
            <!-- <a-button class="normal-btn" @click="toAIColor"
              ><img style="width: 22px; height: 25px" src="@/assets/images/ai-r.png" alt="dark" />AI润色</a-button
            > -->
            <a-button style="margin-left: 15px" class="normal-btn" @click="toAI"
              ><img style="width: 22px; height: 25px" src="@/assets/images/AI-icon.png" alt="dark" />AI生成</a-button
            >
            <a-popconfirm
              style="margin-left: 15px"
              :disabled="!isExpend || !collapseKey || (collapseKey == '2' && !AIresponseColor) || (collapseKey == '1' && !AIresponse)"
              placement="top"
              ok-text="确定"
              cancel-text="取消"
              @confirm="confirmText"
              @cancel="transfromText"
            >
              <template slot="title">
                <div>是否将AI内容另存当前版本?</div>
              </template>
              <a-button :disabled="!isExpend || !collapseKey || (collapseKey == '2' && !AIresponseColor) || (collapseKey == '1' && !AIresponse)"
                ><img style="width: 20px; height: 20px" src="@/assets/images/cy.png" alt="dark" />替换</a-button
              >
            </a-popconfirm>
          </div>
        </a-col>
        <a-col :span="11">
          <a-spin :spinning="editLoading">
            <a-textarea style="height: 68vh" v-model="changeContent" :auto-size="true" />
          </a-spin>
          <div class="footer-btns">
            <a-tooltip placement="top" style="margin-right: 10px">
              <template slot="title">
                <span>新增结论</span>
              </template>
              <a-popconfirm
                :disabled="editLoading"
                placement="top"
                ok-text="新增结论"
                cancel-text="取消"
                @confirm="addModalResult"
              >
                <template slot="title">
                  <div>是否新增模板结论?</div>
                  <div>注意：进行新增模板结论会清空当前编辑框内容。</div>
                </template>
                <a-button class="normal-btn">+ 新增</a-button>
              </a-popconfirm>
            </a-tooltip>
            <a-button style="margin-right: 10px" class="normal-btn" icon="save" @click="setContentPop = true"
              >另存版本</a-button
            >
            <a-popconfirm
              :disabled="editLoading"
              placement="top"
              ok-text="应用结论"
              cancel-text="取消"
              @confirm="applyChanges"
            >
              <template slot="title">
                <div>是否应用?</div>
              </template>
              <a-button class="normal-btn" icon="check">应用到报告</a-button>
            </a-popconfirm>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-modal
      class="qr-modal"
      v-model="setContentPop"
      :bodyStyle="{ padding: 0, backgroundColor: 'transparent' }"
      :maskClosable="false"
      @ok="saveAs"
      @cancel="setContentPop = false"
    >
      <div class="set-name">
        <div class="set-name-title">另存为新版本</div>
        <div class="pop-tab-name">版本名称</div>
        <a-input allowClear size="large" v-model="contentTitle"></a-input>
        <div class="pop-tab-name">版本描述</div>
        <a-textarea style="min-height: 200px" v-model="contentDesc" :auto-size="true" />
      </div>
    </a-modal>
  </div>
</template>
  
<script>
import {
  reportContentList,
  deleteReportContent,
  saveReportContent,
  useReportContent,
  getModalList,
  toAi,
  getAIConfig,
  getAIType,
  getAiColor,
  aiColor,
} from '@/api/report'
import { colorList } from '@/config/constants'
import { aiTypeList } from './util'
export default {
  props: {
    reportDetail: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isFirstLoading: true,
      applyLoading: false,
      saveLoading: false,
      editLoading: false,
      modalList: [],
      colorList,
      currentModalSelect: null,
      modalContentList: [],
      selectModal: null,
      selectModalId: null,
      useContent: {
        content: '',
      },
      aiTypeList,
      aiTypes: null,
      processNum: 0,
      clickInAI: false,
      AIresponse: null,
      changeContent: null,
      setContentPop: false,
      contentTitle: null,
      contentDesc: null,
      aiExspend: false,
      isExpend: false,
      aiType: [],
      aiColorList: [],
      aiColorType: [],
      aiColorExspend: false,
      isColorExpend: false,
      AIresponseColor: null,
      clickInAIColor: false,
      collapseKey: null,
    }
  },
  created() {
    getAIType(this.reportDetail.creditCode).then((res) => {
      this.aiTypes = res.data
    })
    getAiColor().then((res) => {
      this.aiColorList = res.data
    })
  },
  mounted() {
    const { $notification } = this
    getModalList(this.reportDetail.id).then((res) => {
      if (res.data.length) {
        this.modalList = res.data
        this.currentModalSelect = res.data[0]
        this.getModalContent()
        return
      }
      $notification['warn']({
        message: '通知：',
        description: '无结论数据',
        duration: 8,
      })
    })
  },
  watch: {
    selectModal: {
      handler(v) {
        this.changeContent = v.content
      },
      deep: true,
    },
  },
  methods: {
    getKey(e) {
      this.collapseKey = e
    },
    transfromText() {
      this.changeContent = this.AIresponse
    },
    confirmText() {
      if (this.collapseKey == '1') {
        this.changeContent = this.AIresponse
      } else {
        this.changeContent = this.AIresponseColor
      }
      this.setContentPop = true
    },
    menuChoose(v) {
      this.aiType = v.item.value
      const parameter = {
        aiType: this.aiType,
        reportType: this.reportDetail.reportType,
        creditCode: this.reportDetail.appUser.enterprise.enterpriseCreditCode,
        title: this.selectModal.title,
      }
      this.getAIConfig(parameter)
    },
    chooseAIColor(value) {
      this.aiColorType = value
    },
    menuChooseColor(v) {
      this.aiColorType = v.item.value
    },
    async confirmAIColor() {
      const { $notification } = this
      this.clickInAIColor = true
      // const reD = await getAIConfig(parameter)
      let countdown = 20
      let reD = null
      this.AIresponseColor = `广州信安数据有限公司于 2016 年 11 月 15 日成立，注册资本 22569800 元，是员工规模 100-499 人的中型企业，专注于软件和信息技术服务业，展现出一定发展潜力。虽成立时间不长，但资本规模与人员配置体现了一定资源积累及发展空间，结合行业趋势，具备较强市场适应与技术创新潜力。
    从工商变更记录看，企业经历了多次变更， 2018 年变更频繁，涉及高级管理人员备案、章程备案及投资人变更等，反映初期组织架构与股权结构优化。后续几年变更频率降低，但投资人变更仍较活跃，如 2021 年变更 3 次，同时经营范围与地址变更显示业务拓展和区域布局变化，体现市场适应能力，不过频繁投资人变更或对稳定性有影响。
    司法信用信息方面，近三年公司无经营异常、行政处罚、失信被执行及刑事案件记录，合规性和法律风险表现良好，关联的 2 件司法案件暂未见明显负面影响。综合来看，工商变更记录反映企业适应市场环境调整，但部分变更可能影响稳定性。
    基于企业的发展潜力与行业前景，建议关注其资本运作稳定性及管理团队持续性，优化内部管理结构、强化风险控制机制，以提升抗风险能力，为合作奠定基础。`
      this.clickInAIColor = false
      console.log((this.collapseKey == '2' && !this.AIresponseColor) || (this.collapseKey == '1' && !this.AIresponse))
      // const intervalId = setInterval(async () => {
      //   if (countdown > 0) {
      //     if (!reD) {
      //       countdown = countdown == 1 ? 1 : countdown - 1
      //       this.processNum = (20 - countdown) * 5
      //     } else {
      //       this.AIresponseColor = reD.data
      //       this.clickInAIColor = false
      //       this.processNum = 0
      //       if (reD.code !== 200) {
      //         $notification['error']({
      //           message: '错误通知：',
      //           description: `${reD.msg}`,
      //           duration: 8,
      //         })
      //       }
      //       clearInterval(intervalId)
      //     }
      //   } else {
      //     this.AIresponseColor = reD.data
      //     this.clickInAIColor = false
      //     this.processNum = 0
      //     if (reD.code !== 200) {
      //       $notification['error']({
      //         message: '错误通知：',
      //         description: `${reD.msg}`,
      //         duration: 8,
      //       })
      //     }
      //     clearInterval(intervalId)
      //   }
      // }, 1000)
      // reD = await aiColor({
      //   content: this.changeContent,
      //   types: this.aiColorType,
      // })
    },
    chooseAI(value) {
      this.aiType = value
      const parameter = {
        aiType: this.aiType,
        reportId: this.reportDetail.id,
        reportType: this.reportDetail.reportType,
        creditCode: this.reportDetail.appUser.enterprise.enterpriseCreditCode,
        title: this.selectModal.title,
      }
      this.getAIConfig(parameter)
    },
    async getAIConfig(parameter) {
      const { $notification } = this
      this.clickInAI = true
      // const reD = await getAIConfig(parameter)
      let countdown = 20
      let reD = null
      this.AIresponse = `广州信安数据有限公司于 2016 年 11 月 15 日成立，注册资本 22569800 元，是员工规模 100-499 人的中型企业，专注于软件和信息技术服务业，展现出一定发展潜力。虽成立时间不长，但资本规模与人员配置体现了一定资源积累及发展空间，结合行业趋势，具备较强市场适应与技术创新潜力。
    从工商变更记录看，企业经历了多次变更， 2018 年变更频繁，涉及高级管理人员备案、章程备案及投资人变更等，反映初期组织架构与股权结构优化。后续几年变更频率降低，但投资人变更仍较活跃，如 2021 年变更 3 次，同时经营范围与地址变更显示业务拓展和区域布局变化，体现市场适应能力，不过频繁投资人变更或对稳定性有影响。
    司法信用信息方面，近三年公司无经营异常、行政处罚、失信被执行及刑事案件记录，合规性和法律风险表现良好，关联的 2 件司法案件暂未见明显负面影响。综合来看，工商变更记录反映企业适应市场环境调整，但部分变更可能影响稳定性。
    基于企业的发展潜力与行业前景，建议关注其资本运作稳定性及管理团队持续性，优化内部管理结构、强化风险控制机制，以提升抗风险能力，为合作奠定基础。`
      this.clickInAI = false
      console.log((this.collapseKey == '2' && !this.AIresponseColor) || (this.collapseKey == '1' && !this.AIresponse))
      // const intervalId = setInterval(async () => {
      //   if (countdown > 0) {
      //     if (!reD) {
      //       countdown = countdown == 1 ? 1 : countdown - 1
      //       this.processNum = (20 - countdown) * 5
      //     } else {
      //       this.AIresponse = reD.data
      //       this.clickInAI = false
      //       this.processNum = 0
      //       if (reD.code !== 200) {
      //         $notification['error']({
      //           message: '错误通知：',
      //           description: `${reD.msg}`,
      //           duration: 8,
      //         })
      //       }
      //       clearInterval(intervalId)
      //     }
      //   } else {
      //     this.AIresponse = reD.data
      //     this.clickInAI = false
      //     this.processNum = 0
      //     if (reD.code !== 200) {
      //       $notification['error']({
      //         message: '错误通知：',
      //         description: `${reD.msg}`,
      //         duration: 8,
      //       })
      //     }
      //     clearInterval(intervalId)
      //   }
      // }, 1000)
      // reD = await toAi({ content: this.changeContent, aiType: this.aiType })
    },
    toAI() {
      const { $notification } = this
      // ai
      this.aiExspend = true
      this.isExpend = true
      this.aiColorExspend = false
      this.isColorExpend = false
    },
    toAIColor() {
      const { $notification } = this
      this.aiExspend = false
      this.isExpend = false
      this.aiColorExspend = true
      this.isColorExpend = true
    },
    addModalResult() {
      this.changeContent = ''
    },
    changModalShow(v) {
      this.isFirstLoading = true
      this.currentModalSelect = v
      // 重置一下ai内容
      this.processNum = 0
      this.clickInAI = false
      this.aiExspend = false
      this.isExpend = false
      this.AIresponse = null
      this.aiColorExspend = false
      this.isColorExpend = false
      this.AIresponseColor = null
      this.aiType = []
      this.getModalContent()
    },
    getModalContent() {
      // 获取对应modal内容
      const query = {
        reportId: this.reportDetail.id,
        title: this.currentModalSelect,
      }
      reportContentList(query).then((res) => {
        this.modalContentList = res.data
        if (this.isFirstLoading) {
          res.data.forEach((v) => {
            if (v.isUse == 1) {
              this.useContent = v
              return
            }
          })
          this.isFirstLoading = false
          this.selectModal = this.useContent
          this.selectModalId = this.useContent.id
        }
      })
    },
    changeSelect(version) {
      if (version == this.selectModal.id) return
      this.selectModalId = version
      this.selectModal = this.modalContentList.filter((v) => v.id == version)[0]
    },
    applyChanges() {
      // 应用修改的逻辑，例如发送请求到后端保存修改
      const { $notification } = this
      // 现判断是否有修改？
      if (this.changeContent == this.useContent.content) {
        // 若相等，则没有更改，不进行接口调用
        $notification['info']({
          message: '通知：',
          description: '请对结论进行编辑后再保存',
          duration: 8,
        })
        return
      }
      const query = {
        id: this.selectModal.id,
        content: this.changeContent,
      }
      this.applyLoading = true
      useReportContent(query)
        .then((res) => {
          this.isFirstLoading = true
          if (res.code != 200) {
            $notification['error']({
              message: '错误通知：',
              description: `${res.msg}`,
              duration: 8,
            })
            this.applyLoading = false
            this.getModalContent()
          } else {
            this.$emit('refreshEdit')
            $notification['success']({
              message: '通知：',
              description: '操作成功',
              duration: 8,
            })
            this.applyLoading = false
            this.getModalContent()
          }
        })
        .catch((err) => {
          $notification['error']({
            message: '通知：',
            description: `操作失败：${err}`,
            duration: 8,
          })
          this.applyLoading = false
          this.getModalContent()
        })
    },
    saveAs() {
      // 另存的逻辑，例如创建新的版本记录
      const { $notification, $confirm } = this
      const _this = this
      // 内容
      if (!this.contentTitle) {
        $notification['info']({
          message: '通知：',
          description: '请填写版本名称',
          duration: 8,
        })
        return
      }
      // 现判断是否有修改？
      if (this.changeContent == this.selectModal.content) {
        // 若相等，则没有更改，不进行接口调用
        $notification['info']({
          message: '通知：',
          description: '请对结论进行编辑后再保存',
          duration: 8,
        })
        return
      }
      const query = {
        reportId: this.reportDetail.id,
        title: this.currentModalSelect,
        content: this.changeContent,
        versionName: this.contentTitle,
        versionDesc: this.contentDesc,
      }
      // 判断是否已存在改版本名称
      const pipeiM = this.modalContentList.findIndex((u) => {
        return u.versionName == this.contentTitle
      })
      if (pipeiM !== -1) {
        $confirm({
          title: '另存为提醒',
          content: `检测历史版本存在同名，请问是否覆盖另存？`,
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            _this.saveLoading = true
            query.id = _this.modalContentList[pipeiM].id
            saveReportContent(query)
              .then((res) => {
                _this.setContentPop = false
                $notification['success']({
                  message: '通知：',
                  description: '操作成功',
                  duration: 8,
                })
                _this.saveLoading = false
                _this.getModalContent()
              })
              .catch((err) => {
                _this.saveLoading = true
                $notification['error']({
                  message: '通知：',
                  description: `操作失败：${err}`,
                  duration: 8,
                })
                _this.saveLoading = false
                _this.getModalContent()
              })
          },
          onCancel() {
            $notification['info']({
              message: '通知：',
              description: '当前版本名称已被占用，请更改后再提交。',
              duration: 8,
            })
          },
        })
      } else {
        _this.saveLoading = true
        query.id = saveReportContent(query)
          .then((res) => {
            _this.setContentPop = false
            $notification['success']({
              message: '通知：',
              description: '操作成功',
              duration: 8,
            })
            _this.saveLoading = false
            _this.getModalContent()
          })
          .catch((err) => {
            _this.saveLoading = true
            $notification['error']({
              message: '通知：',
              description: `操作失败：${err}`,
              duration: 8,
            })
            _this.saveLoading = false
            _this.getModalContent()
          })
      }
    },
    deleteVersion(item) {
      const { $notification } = this
      if (item.isUse) {
        $notification['info']({
          message: '通知：',
          description: '当前正在被应用的结论无法删除',
          duration: 8,
        })
        return
      }
      deleteReportContent(item.id)
        .then((res) => {
          $notification['success']({
            message: '通知：',
            description: '删除成功',
            duration: 8,
          })
          this.getModalContent()
        })
        .catch((err) => {
          $notification['error']({
            message: '通知：',
            description: `删除失败：${err}`,
            duration: 8,
          })
          this.getModalContent()
        })
    },
  },
}
</script>
  
<style lang="less" scoped>
.w100 {
  width: 100%;
}
.drawer-container {
  padding-left: 4px;
  margin-bottom: 20px;
  .select-item {
    padding-bottom: 10px;
    border-bottom: 1px solid #979797;
    font-size: 16px;
    font-weight: bold;
    color: #1789ff;
  }
}
.edit-modal-body {
  /deep/ .ant-input-disabled {
    color: rgba(0, 0, 0, 0.75);
    background-color: #f5f5f5;
  }
}
.grid-box {
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  .cant-edit-box {
    padding-right: 10px;
    border-right: 1px solid #e5e7eb;
  }
}
.status-tag {
  position: relative;
  padding-left: 15px;
  font-size: 14px;
  font-weight: bold;
  &::before {
    position: absolute;
    content: '';
    width: 8px;
    height: 14px;
    border-radius: 4px;
    background-color: #dd524c;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
.green-tag {
  padding-left: 25px;
  &::before {
    left: 10px;
    background-color: #5ec269;
  }
}
.flex-end {
  align-items: flex-end;
  justify-content: flex-end;
  /deep/ .ant-btn {
    margin: 0 4px;
  }
}
.history-box {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.history-title {
  position: relative;
  font-weight: bold;
  font-size: 18px;
  padding: 10px;
  padding-left: 24px;
  border-bottom: 1px solid #e5e7eb;
  &::before {
    position: absolute;
    content: '';
    width: 5px;
    border-radius: 3px;
    background-color: #9d59ef;
    height: 30px;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.version-item {
  display: flex;
  align-items: center;
  padding: 10px 4px;
  cursor: pointer;
  .version-id {
    display: flex;
    align-items: center;
    color: #fff;
    padding: 2px 4px;
    border-radius: 2px;
    font-weight: bold;
  }
  .version-number {
    flex: 1;
    padding: 0 4px;
    font-size: 13px;
    font-weight: bold;
  }
  .version-date {
    flex: 1;
    font-size: 12px;
  }
}
.version-active {
  background-color: #f9f5fe;
}
.ai-png {
  width: 17px;
  height: 20px;
  cursor: pointer;
}
.set-name {
  padding: 0 20px 20px;
  .set-name-title {
    display: flex;
    align-items: center;
    height: 56px;
    font-size: 20px;
    font-weight: bold;
  }
}
.un-edit-pass {
  position: relative;
  .ex-icon {
    position: absolute;
    right: 10px;
    top: 5px;
    z-index: 300;
    cursor: pointer;
  }
  .close-icon {
    transform: rotate(180deg);
    transition: transform 0.5s ease;
  }
  .ai-expend {
    background-color: #fff;
    width: 100%;
    border: 1px solid #e5e7eb;
  }
}
.btn-part {
  padding: 14px;
}
.ai-btn {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  height: auto;
  box-sizing: border-box;
  border-radius: 5px;
}
.ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.loading-zezao {
  padding: 0 15px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .top-t {
    font-size: 14px;
    color: #000;
    font-weight: bold;
  }
  .detail {
    font-size: 12px;
    color: #adb0b8;
  }
}
.ai-response {
  padding: 0 15px;
  .ai-title {
    font-size: 14px;
    color: #000;
    font-weight: bold;
    padding-bottom: 3px;
  }
}
.footer-btns {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  .ai-btn {
    margin-left: 10px;
  }
}
.line-item {
  position: relative;
  &::before {
    position: absolute;
    content: '';
    height: 5px;
    width: calc(100% - 4em);
    background-color: #e5e7eb;
    top: 6px;
    left: 2em;
    transform: translateY(-50%);
  }
  .item {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .dott {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #2563eb;
    margin-bottom: 8px;
    z-index: 1;
    &.active {
      width: 16px;
      height: 16px;
      background-color: #fff;
      border: 2px solid #2563eb;
    }
  }
  .ai-item-title {
    font-size: 12px;
    color: #2563eb;
  }
}
</style>