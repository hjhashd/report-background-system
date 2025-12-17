<template>
  <div>
    <div class="step-tab">
      <div class="tab-item flex-1" :class="{ 'tab-active': selectTab == item }" v-for="item in tabType" :key="item">
        {{ item }}
      </div>
    </div>
    <a-spin :spinning="tabLoading">
      <div class="pop-box" v-if="selectTab == tabType[0]">
        <div class="tab-content">
          <a-upload
            :name="clickItem?.dataItem || ''"
            :customRequest="uploadFile"
            :showUploadList="false"
            :multiple="true"
            accept=".xlsx,.xls"
          >
            <div class="table-upload-btn">
              <a-icon type="upload" style="color: #3b82f6; font-size: 24px" />
              <div class="upload-txt-1">点击或拖拽文件到此处上传</div>
              <div class="upload-txt-2">支持 Excel 格式</div>
            </div>
          </a-upload>
          <div class="upload-list-show" v-if="fileList.length">
            <div class="name-title">已选择文件(仅保留最新文件)：</div>
            <div class="uploaded-file" v-for="(i, index) in fileList" :key="index">
              <div class="ppp">
                <a-icon type="upload" style="color: #3b82f6; font-size: 18px" /><span>{{ i.name }}</span>
              </div>
              <a-popconfirm
                title="是否确定删除已上传文件?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="deleteUploadFile(i)"
              >
                <a-button :style="{ color: '#7fbbf1', border: 'none', padding: 0 }">
                  <img style="width: 16px; height: 18px" src="@/assets/images/delete.png" alt="dark" />
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="closePop"> 取消 </a-button>
          <a-button class="pop-btn black-style" @click="analysisFile"> 文件上传 </a-button>
        </div>
      </div>
      <div v-else-if="selectTab == tabType[1]">
        <div class="desc-step-2">
          <a-icon style="margin-right: 5px" type="info-circle" />
          请将导入文件中的字段与系统字段进行匹配。系统已自动匹配相似字段，您可以根据需要调整。
        </div>

        <div v-if="showDebitCreditHint" class="desc-step-3" style="margin-top: 10px">
          <a-icon style="margin-right: 5px" type="info-circle" />
          <div>
            <strong>特殊匹配提示：</strong>
            可将系统的 <strong>“借方发生额”</strong> 和 <strong>“贷方发生额”</strong> 字段
            <i>同时</i> 匹配到您Excel中对应的 <strong>“借贷发生金额”</strong> 列，请确保 <strong>“借/贷方向”</strong> 字段已正确匹配。系统将在导入时自动拆分数据。
          </div>
        </div>
        <div class="tab-content">
          <div v-for="(item, index) in uploadTableFiedls" :key="index">
            <div class="big-title">{{ item.fieldNameCh }} <span class="must">*</span></div>
            <a-row class="row-show" :gutter="[10]">
              <a-col :span="10">
                <div class="mini-title">{{ item.fieldNameCh }}</div>
              </a-col>
              <a-col :span="4" class="item-center">
                <a-icon type="arrow-right" />
              </a-col>
              <a-col :span="10">
                <a-select
                  style="width: 100%"
                  v-model="mapping[item.fieldNameCh]"
                  placeholder="请选择匹配字段"
                  @change="pickFields"
                >
                  <a-select-option
                    v-if="specialTableNames.includes(clickItem.tableNameZh)"
                    v-for="(data, i) in dataRecord"
                    :data-fields="item.fieldNameCh"
                    :value="data"
                    :key="i"
                  >
                    {{ data }}
                  </a-select-option>

                  <a-select-option
                    v-if="!specialTableNames.includes(clickItem.tableNameZh)"
                    v-for="(data, i) in excelData"
                    :data-fields="item.fieldNameCh"
                    :value="data.fieldNameCh"
                    :key="i"
                  >
                    {{ data.fieldNameCh }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </div>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="preStep"> 上一步 </a-button>
          <a-button class="pop-btn black-style" @click="pickEndFields"> 验证匹配 </a-button>
        </div>
      </div>
      <div v-else-if="selectTab == tabType[2]">
        <div class="desc-step-3">
          <a-icon style="margin-right: 5px" type="info-circle" />
          若部分字段匹配存在问题，请检查下方标记的字段。您可以返回上一步调整匹配，或者继续导入（系统将忽略有问题的字段）。
        </div>
        <div class="tab-content">
          <a-table class="tab-table" :columns="columns" :data-source="pickFieldsData" :pagination="false" size="small">
            <template slot="tableNameZhSource" slot-scope="text">
              <div class="sys-text">{{ text }}<span class="must">*</span></div>
            </template>
            <template slot="tableNameZh" slot-scope="text">
              <div class="sys-text">{{ text }}</div>
            </template>
            <template slot="status" slot-scope="text">
              <div class="simo" v-if="text"><a-icon type="check-circle" />一致</div>
              <div class="unsimo" v-else><a-icon type="close-circle" />不一致</div>
            </template>
          </a-table>
        </div>
        <div class="flex footer-btn">
          <a-button class="pop-btn" @click="preStep"> 返回调整 </a-button>
          <a-button :loading="uploadCStatus" class="pop-btn green-style" @click="importToDatabase"> 导入 </a-button>
        </div>
      </div>
    </a-spin>
    <template>
  <div>
    <a-modal
      v-model="showConfirmModal"
      title="导入警告：存在数据格式问题"
      ok-text="继续导入"
      cancel-text="返回检查"
      :ok-button-props="{ props: { type: 'danger' } }"
      width="600"
      @ok="handleForceImport"
      @cancel="handleCancelImport"
    >
      <div v-if="conversionErrors.length > 0">
        <p>这里有丢失数据的风险。<br/>请检查Excel表里对应的数据是否与字段要求匹配（如数字列写了文字，或日期列格式不正确）。</p>
        
        <p><strong>发现 {{ conversionErrors.length }} 处问题，仅显示前 {{ Math.min(conversionErrors.length, 5) }} 条：</strong></p>
        
        <ul style="padding-left: 20px; margin-top: 10px; max-height: 150px; overflow-y: auto;">
          <li v-for="(err, index) in conversionErrors.slice(0, 5)" :key="index">
            &bull; [{{ err.type }}字段] 第 {{ err.row }} 行, 列 [{{ err.col }}], 值为 "{{ err.val }}..."
          </li>
        </ul>
        <p style="margin-top: 15px;">若不在意，可点击"继续导入"，对应的数据在数据库表里的位置将被置为空。</p>
      </div>
    </a-modal>

  </div>
</template>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getFields, getNewSpecialFields, pullTableData } from '@/api/report'
import { specialTableDeal, normalTableDeal, columns } from './util'
const tabType = ['1.上传文件', '2.字段匹配', '3.验证结果']
// [新增] 数据库表结构映射，用于数据类型强制转换
const TABLE_SCHEMA = {
  // // 工资数据表
  salary_report_info: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    department: 'VARCHAR',
    employee_count: 'INT',
    salary_amount: 'DECIMAL',
    percentage: 'DECIMAL',
    data_source: 'VARCHAR',
    data_type: 'VARCHAR',
    calc_desc: 'TEXT',
  },
  // // 贷款表
  loan_information: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    comp_name: 'VARCHAR',
    credit_code: 'VARCHAR',
    category_of_grant: 'VARCHAR',
    bank_name: 'VARCHAR',
    total_credit: 'DECIMAL',
    loan_balance: 'DECIMAL',
    interest_rate: 'DECIMAL',
    conditions_guarantee: 'VARCHAR',
    loan_company: 'VARCHAR',
  },
  // // 流水表
  bank_transaction_record_info: {
    id: 'INT',
    credit_code: 'VARCHAR',
    warehousing_time: 'TIMESTAMP',
    bank_name: 'VARCHAR',
    voucher_number: 'VARCHAR',
    account_number_self: 'VARCHAR',
    account_number_opposite: 'VARCHAR',
    transaction_time: 'VARCHAR', // 保留原代码逻辑，文档中是VARCHAR，但原代码强制转了TIMESTAMP
    transaction_type: 'VARCHAR',
    debit_amount: 'DECIMAL',
    credit_amount: 'DECIMAL',
    opposite_bank_code: 'VARCHAR',
    summary: 'VARCHAR',
    purpose: 'VARCHAR',
    opposite_party_name: 'VARCHAR',
    balance: 'DECIMAL',
    custom_info: 'TEXT',
    data_source: 'VARCHAR',
    data_type: 'VARCHAR',
    calc_desc: 'TEXT',
  },
  // // 应收账款前五企业
  Top_5_Accounts_receivable: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    Accounts_Receivable: 'DECIMAL',
    Proportion_of_Accounts_Receivable: 'DECIMAL',
    Doubtful_Accounts_Receivable: 'DECIMAL',
    give_comp_name: 'VARCHAR',
  },
  // // 其他关联方情况
  main_ep_relate_company: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    other_credit_code: 'VARCHAR',
    other_comp_name: 'VARCHAR',
    other_relate: 'VARCHAR',
  },
  // // 其他应收账款明细
  other_accounts_receivable_detail: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    book_value_bq_ratio: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    book_value_sq_ratio: 'DECIMAL',
    bad_debt_bq: 'DECIMAL',
    bad_debt_bq_ratio: 'DECIMAL',
    bad_debt_sq: 'DECIMAL',
    bad_debt_sq_ratio: 'DECIMAL',
  },
  // // 应收账款明细
  accounts_receivable_detail: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    book_value_bq_ratio: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    book_value_sq_ratio: 'DECIMAL',
    bad_debt_bq: 'DECIMAL',
    bad_debt_bq_ratio: 'DECIMAL',
    bad_debt_sq: 'DECIMAL',
    bad_debt_sq_ratio: 'DECIMAL',
  },
  // // 货币资金明细
  monetary_capital_detail: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    data_value_bq: 'DECIMAL',
    data_value_sq: 'DECIMAL',
  },
  // // 采用账龄组合的应收账款
  Accounts_Receivable_Aging: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    bad_debt_bq: 'DECIMAL',
    ratio_bq: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    bad_debt_sq: 'DECIMAL',
    ratio_sq: 'DECIMAL',
  },
  // // 主营业务板块利润明细_审计报告
  gross_profit_detail: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    comp_name: 'VARCHAR',
    credit_code: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    income_bq: 'DECIMAL',
    income_sq: 'DECIMAL',
  },
  // // 收入及利润板块结构_客户提供表格
  company_business_analysis: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    comp_name: 'VARCHAR',
    credit_code: 'VARCHAR',
    data_item: 'VARCHAR',
    data_item_name: 'VARCHAR',
    record_date: 'VARCHAR',
    amount_prev_year_0: 'DECIMAL',
    ratio_prev_year_0: 'DECIMAL',
    amount_prev_year_1: 'DECIMAL',
    ratio_prev_year_1: 'DECIMAL',
    amount_prev_year_2: 'DECIMAL',
    ratio_prev_year_2: 'DECIMAL',
    amount_prev_year_3: 'DECIMAL',
    ratio_prev_year_3: 'DECIMAL',
  },
  // // 应收账款前五大债权人
  outstanding_debt_top: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    record_date: 'VARCHAR',
    end_balance: 'DECIMAL',
    debtor: 'VARCHAR',
    bad_debt_provision: 'DECIMAL',
  },
  // // 账龄与预期信用损失率
  credit_loss_rate: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    record_date: 'VARCHAR',
    aging_range: 'VARCHAR',
    receivable_loss_rate: 'DECIMAL',
    other_receivable_loss_rate: 'DECIMAL',
  },
  // // 主营业务收入/支出明细
  main_revenue_cost_detail: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    comp_name: 'VARCHAR',
    credit_code: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    income_bq: 'DECIMAL',
    income_sq: 'DECIMAL',
    cost_bq: 'DECIMAL',
    cost_sq: 'DECIMAL',
  },
  // // 采用账龄组合的其他应收账款
  other_accounts_receivable_aging: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    bad_debt_bq: 'DECIMAL',
    ratio_bq: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    bad_debt_sq: 'DECIMAL',
    ratio_sq: 'DECIMAL',
  },
  // // 预付款项账龄分析
  prepayment_aging_analysis: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    data_item: 'VARCHAR',
    record_date: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    book_value_bq_ratio: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    book_value_sq_ratio: 'DECIMAL',
    impairment_provision_bq: 'DECIMAL',
    impairment_provision_sq: 'DECIMAL',
    book_values_bq: 'DECIMAL',
    book_values_sq: 'DECIMAL',
  },
  // // 存货明细情况
  inventory_details: {
    id: 'INT',
    warehousing_time: 'TIMESTAMP',
    credit_code: 'VARCHAR',
    comp_name: 'VARCHAR',
    record_date: 'VARCHAR',
    item_name: 'VARCHAR',
    book_value_bq: 'DECIMAL',
    book_value_sq: 'DECIMAL',
    depreciation_reserve_bq: 'DECIMAL',
    depreciation_reserve_sq: 'DECIMAL',
    book_values_bq: 'DECIMAL',
    book_values_sq: 'DECIMAL',
  },
}

export default {
  name: 'uploadFileTab',
  props: {
    clickItem: {
      type: Object,
      default: null,
    },
    customerInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabType,
      tabLoading: false,
      uploadCStatus: false,
      selectTab: tabType[0],
      fileList: [],
      columns,
      pickFieldsData: [],
      uploadTableFiedls: [],
      excelData: [],
      mapping: {},
      dataRecord: [],
      specialTableNames: ['现金流量表', '利润表', '资产负债表'],
      // [新增] 状态管理
      conversionErrors: [], // 存储预检查发现的错误
      showConfirmModal: false, // 控制自定义模态框的显示
      importArgs: null, // 临时存储导入所需的所有参数
    }
  },

  // [新增] 计算属性
  computed: {
    /**
     * @description: 是否显示借贷分离提示
     * 仅当系统字段中同时包含“借方发生额”、“贷方发生额”和“借/贷”时
     */
    showDebitCreditHint() {
      if (!this.uploadTableFiedls || this.uploadTableFiedls.length === 0) {
        return false
      }

      // this.uploadTableFiedls 是 { fieldName: '...', fieldNameCh: '...' } 的数组
      const fieldNames = this.uploadTableFiedls.map((f) => f.fieldNameCh)

      // 根据您在 importToDatabase 中的逻辑，我们查找这三个关键字段
      const hasDebit = fieldNames.some((name) => name && name.includes('借方发生额'))
      const hasCredit = fieldNames.some((name) => name && name.includes('贷方发生额'))
      const hasDirection = fieldNames.some((name) => name && name.includes('借/贷')) // 假设方向字段叫 '借/贷'

      return hasDebit && hasCredit && hasDirection
    },
  },
  // [新增结束]

  methods: {
    // [新增] 归一化字段名函数：用于统一处理括号、空格等，确保能正确匹配
    normalizeFieldName(name) {
      if (typeof name !== 'string') {
        return ''
      }
      return (
        name
          // [修改] 下面两行会移除所有中英文括号、方括号及其中的任何内容
          .replace(/[（\(].*?[）\)]/g, '') // 移除 (内容) 或 （内容）
          .replace(/[【\[].*?[】\]]/g, '') // 移除 [内容] 或 【内容】
          // .replace(/（/g, '(')      // [删除] 旧逻辑
          // .replace(/）/g, ')')      // [删除] 旧逻辑
          // .replace(/【/g, '[')      // [删除] 旧逻辑
          // .replace(/】/g, ']')      // [删除] 旧逻辑
          .replace(/\s+/g, '') // 移除所有空格
          .replace(/[/\\\-—–：:]/g, '') // [修改] 增加移除斜杠、冒号，反斜杠、连字符、破折号等中英文
          .toLowerCase() // 统一转为小写
          .trim()
      ) //
    },

    // [新增] 为单表头生成英文表头
    // cnHeaders: 字符串数组, e.g., ['编号', '公司名称', ...]
    // fieldMappings: this.pickFieldsData, e.g., [{ sysEn: '...', excelEn: 'id', tableNameZh: '编号', ... }, ...]
    generateEnglishHeaders(cnHeaders, fieldMappings) {
      return cnHeaders.map((cnHeader, index) => {
        if (!cnHeader) return `column_${index + 1}` // 处理空表头

        // 查找映射关系中对应的英文字段名
        // 我们要用 "Excel中的中文名"(tableNameZh) 来匹配 cnHeader
        const mapping = fieldMappings.find(
          (m) => this.normalizeFieldName(m.tableNameZh) === this.normalizeFieldName(cnHeader)
        )

        if (mapping && mapping.excelEn) {
          // 找到匹配项，使用 `excelEn` (e.g., 'id', 'comp_name')
          // 这能确保与 `getIndices` 辅助函数中的 `mapping.excelEn` 匹配
          return mapping.excelEn
        } else {
          // 如果未找到映射 (e.g., 用户未匹配此列)，
          // 回退使用中文名本身，这与 `normalTableDeal` (单表头) 逻辑一致
          return cnHeader
        }
      })
    },

    uploadFile(options) {
      const { file, filename, onSuccess, onError } = options
      this.fileList = [file]
    },
    deleteUploadFile(i) {
      this.fileList = this.fileList.filter((v) => v.uid !== i.uid)
    },
    dUploadFileFun() {
      const { $notification } = this
      const formData = new FormData()
      formData.append('indicatorsName', this.clickItem.dataItem)
      formData.append('creditCode', this.clickItem.creditCode)
      this.fileList.forEach((fileItem) => {
        formData.append('files', fileItem)
      })
    },
    preStep() {
      const currentStep = this.tabType.findIndex((ui) => ui === this.selectTab)
      this.selectTab = this.tabType[currentStep - 1]
    },
   pickEndFields() {
      // 最后一步
      this.selectTab = this.tabType[2]
      let pickFieldsData = []
      for (const key in this.mapping) {
        if (Object.prototype.hasOwnProperty.call(this.mapping, key)) {
          const sysEn = this.uploadTableFiedls.find((u) => u.fieldNameCh == key)
            ? this.uploadTableFiedls.find((u) => u.fieldNameCh == key).fieldName
            : null
          // [MODIFIED] 修正当Excel列名不存在时的处理
          const excelField = this.excelData.find((u) => u.fieldNameCh == this.mapping[key])

          const excelEn = excelField ? excelField.fieldName : this.mapping[key] || null // <-- 新逻辑

          const element = this.mapping[key]
          pickFieldsData.push({
            sysEn,
            excelEn, 
            tableNameZhSource: key,
            
            // [修改点 1]：如果 element (即 this.mapping[key]) 为 null，则显示 '--- 未匹配 ---'
            tableNameZh: element || '--- 未匹配 ---', 
            
            // [修改点 2]：确保未匹配时，status 明确为 false
            status: !!element && this.normalizeFieldName(key) == this.normalizeFieldName(element),
          })
        }
      }
      this.pickFieldsData = pickFieldsData
    },
    pickFields(v, item) {
      const key = item.data.attrs['data-fields']
      // 赋值
      this.mapping[key] = v
    },
    async analysisFile() {
      if (this.fileList.length === 0) {
        this.$message.warning('未获取到有效文件')
        return
      }

      this.tabLoading = true
      try {
        // [修改] 确保文件读取完成
        await new Promise((resolve) => {
          this.readXLSXcontent(this.fileList, this.clickItem, resolve)
        })

        const specialTable = ['现金流量表', '利润表', '资产负债表']
        const { tableNameZh } = this.clickItem

        if (specialTable.includes(tableNameZh)) {
          // [修改] 使用 await 等待 API 结果
          const res = await getNewSpecialFields(tableNameZh)
          
          const matchFields = {}
          const mapping = {}
          // ========================================================
          // [修改点 1]：在此处初始化 dataRecord，并添加“不匹配”选项
          this.dataRecord = ['--不匹配---']
          // ========================================================

          res.data.forEach((item) => {
            if (!this.dataRecord.includes(item.record)) {
              this.dataRecord.push(item.record)
            }
            matchFields[item.originRecord] = item.record
          })

          const uploadTableFiedls = [] // [修正] uploadTableFiedls 应该在这里定义
          this.excelData.forEach((item) => {
            if (item.fieldName != null) {
              uploadTableFiedls.push({
                fieldName: item.fieldNameCh,
                fieldNameCh: item.fieldNameCh,
              })

              // [FIX] 将 mapping 逻辑移动到 if 内部
              const fE = matchFields[item.fieldNameCh]
              if (fE) {
                mapping[item.fieldNameCh] = fE
              } else {
                mapping[item.fieldNameCh] = '--不匹配---'
              }
            }
          })

          this.uploadTableFiedls = uploadTableFiedls
          this.mapping = mapping
          this.selectTab = tabType[1]

        } else {
          // [修改] 使用 await 等待 API 结果
          const res = await getFields(this.clickItem)
          
          const reD = JSON.parse(JSON.stringify(res.data))
          const uploadTableFiedls = []
          const mapping = {}
          reD.forEach((item) => {
            // [修改] 优化自动匹配逻辑，使用归一化函数进行查找，忽略括号和空格的差异
            const systemFieldName = typeof item === 'object' ? item.fieldNameCh : item
            const matchedExcelField = this.excelData.find(
              (excelField) => this.normalizeFieldName(excelField.fieldNameCh) === this.normalizeFieldName(systemFieldName)
            )

            // ========================================================
            // [修改点 3] 如果找到匹配项，则使用它；否则默认不匹配
            mapping[systemFieldName] = matchedExcelField ? matchedExcelField.fieldNameCh : '--不匹配---' // <-- 新逻辑
            // ========================================================

            if (typeof item == 'object') {
              uploadTableFiedls.push(item)
            } else {
              uploadTableFiedls.push({
                fieldName: item,
                fieldNameCh: item,
              })
            }
          })
          this.uploadTableFiedls = uploadTableFiedls
          this.mapping = mapping
          this.selectTab = tabType[1]
        }
      } catch (err) {
        console.log(err)
        // 你可以在这里添加一个 $notification 错误提示
        this.$notification['error']({ message: '提醒：', description: '文件分析失败: ' + err.toString(), duration: 8 })
      } finally {
        // [修改] 确保 loading 状态总是在最后被关闭
        this.tabLoading = false
      }
    },

isValidDateString(rawValue, dateObjValue) {
  // 1. 检查是否为有意为空 (null, undefined, 空白字符串)
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
    return true; // 空值是有效的，不是冲突
  }
  
  // 2. 检查是否为有效的 Date 对象 (由 cellDates: true 转换)
  if (dateObjValue instanceof Date && !isNaN(dateObjValue.getTime())) {
    return true;
  }
  
  // 3. 检查是否为有效的 Excel 数字序列日期
  if (typeof rawValue === 'number' && rawValue > 25569) { // 25569 约等于 1970-01-01
    return true;
  }

  // 4. 此时，它不是空值, 不是有效Date对象, 也不是Excel数字日期
  // 如果它是一个数字 (但不是日期序列)，或类型不是字符串，视为冲突
  if (typeof rawValue !== 'string') {
    return false; // 例如：数字 123, 或布尔值 true
  }

  // 5. 它是一个非空字符串，尝试按我们的规则解析
  try {
    let timeStr = rawValue.trim().replace(/\//g, '-');
    let datePart = '', timePart = '00:00:00';
    
    if (timeStr.includes(' ')) { const parts = timeStr.split(' '); datePart = parts[0]; timePart = parts[1]; }
    else { datePart = timeStr; }
    
    const dateComponents = datePart.split('-');
    const timeComponents = (timePart || '00:00:00').split(':');

    if (dateComponents.length !== 3) return false; // 必须是 Y-M-D 结构

    const Y = dateComponents[0], M = dateComponents[1].padStart(2, '0'), D = dateComponents[2].padStart(2, '0');
    const h = (timeComponents[0] || '00').padStart(2, '0'), m = (timeComponents[1] || '00').padStart(2, '0'), s = (timeComponents[2] || '00').padStart(2, '0');
    
    // 检查年份是否在合理范围，防止 "123-45-6" 这种也被解析
    if (Y.length < 4 || parseInt(Y) < 1900 || parseInt(Y) > 2100) {
      return false;
    }

    const isoString = `${Y}-${M}-${D}T${h}:${m}:${s}`;
    const d = new Date(isoString);

    if (isNaN(d.getTime())) {
       // 最终回退尝试
       const d2 = new Date(timeStr.replace(' ', 'T'));
       if (isNaN(d2.getTime())) return false; // 仍然无效
    }

    return true; // 解析成功
  } catch (e) {
    return false; // 解析过程中抛出异常
  }
},
    // [替换] 重构整个导入方法
    // [重大重构] 2025-10-24
    // 1. 增加了智能表头检测 (单中文 / 双英中)
    // 2. 动态构建 `headers` 数组，使其与 `util.js` 生成的 `excelEn` (fieldName) 保持一致
    // 3. 动态切片 `dataRows` 和 `dateDataRows` (slice(1) 或 slice(2))
    // 4. 修正了 `dateAoaData` 的行索引逻辑
    // 5. [核心修复] 无论单双表头，最终都构造 [英文表头, 中文表头, ...数据] 结构
async importToDatabase() {
  const { $notification } = this
  
  // [保留] 导入前置验证 (检查列表是否为空)
  if (!this.pickFieldsData || this.pickFieldsData.length === 0) {
    this.$notification['error']({
      message: '导入失败：字段列表为空',
      description: '没有检测到任何有效的字段映射。请检查您的Excel文件格式是否正确，并返回上一步重新匹配。',
      duration: 8,
    });
    return;
  }

  // [保留] 导入前置验证 (检查是否存在未匹配)
  const unmappedFields = this.pickFieldsData.filter(item => !item.excelEn);
  
  if (unmappedFields.length > 0) {
    const fieldNames = unmappedFields.map(f => f.tableNameZhSource).join('、');
    this.$notification['error']({
      message: '导入失败：存在未匹配字段',
      description: `以下系统字段尚未匹配Excel中的任何字段：【${fieldNames}】。请返回上一步（字段匹配）完成匹配后再导入。`,
      duration: 8,
    });
    return;
  }
  // [验证结束]


  // ==========================================================
  // --- 1. [修改] 新的、安全的“特殊表”导入逻辑 ---
  // ==========================================================
  if (this.specialTableNames.includes(this.clickItem.tableNameZh)) {
    console.log('ImportDB: 检测到特殊表，执行新版（安全）导入逻辑')
    
    // [修改] 使用 try...catch...finally 保证状态重置
    try {
      this.uploadCStatus = true; // 在 try 内部开启 Loading
      
      const formData = new FormData()
      const item = this.clickItem // 确保 item 已定义
      
      // [关键] 这些操作现在都在 try 块中，如果出错会被 catch 捕获
      formData.append('file', this.fileList[0]) 
      formData.append('appUserId', this.customerInfo.appUserId)

      // [修改] 使用 await 等待异步结果
      const res = await pullTableData(item, formData, this.pickFieldsData, this.mapping)

      // [修改] API 成功后的逻辑
      if (res.code == 200) {
        $notification['success']({ message: '通知：', description: '导入数据库成功', duration: 8 })
        this.resetData(); this.closePop(); this.update();
      } else {
        $notification['error']({ message: '提醒：', description: res.msg, duration: 8 })
      }
    } catch (err) {
      // [修改] 捕获所有错误 (包括同步错误和API错误)
      $notification['error']({ message: '提醒：', description: err.toString(), duration: 8 })
    } finally {
      // [修改] 无论成功还是失败，都确保重置 loading 状态
      this.uploadCStatus = false 
    }

  } else {
    // ==========================================================
    // --- 2. [保留] 通用表的导入逻辑 (和之前一样) ---
    // ==========================================================
    console.log('ImportDB: 检测到普通表，执行新版（复杂）导入逻辑')
    
    try {
      // (uploadCStatus is false)

      // [保留] 1. 文件读取
      const originalFile = this.fileList[0]
      if (!originalFile) {
        this.$message.warning('未找到文件')
        return
      }
      const data = await originalFile.arrayBuffer()
      const dateWorkbook = XLSX.read(data, { type: 'array', cellDates: true })
      const dateWorksheet = dateWorkbook.Sheets[dateWorkbook.SheetNames[0]]
      const dateAoaData = XLSX.utils.sheet_to_json(dateWorksheet, { header: 1, raw: false, defval: null })
      const rawWorkbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = rawWorkbook.SheetNames[0]
      const rawWorksheet = rawWorkbook.Sheets[firstSheetName]
      let aoaData = XLSX.utils.sheet_to_json(rawWorksheet, { header: 1, raw: true, defval: null })

      // [保留] 2. 表头解析 (省略详细代码，和原来一样)
      if (aoaData.length < 1) throw new Error('Excel文件为空或没有表头')
      // ... (此处省略约 50 行表头解析、借贷分离逻辑) ...
      // (从 "const firstRow = aoaData[0] || []" 开始)
      // (一直到 "const columnsToDecimalIndices = getIndices(decimalForcedFields)")
      const firstRow = aoaData[0] || [], secondRow = aoaData.length > 1 ? aoaData[1] : []
      const isFirstRowEmpty = firstRow.every((cell) => cell === null || cell === undefined || String(cell).trim() === '')
      const hasChinese = (str) => typeof str === 'string' && /[\u4e00-\u9fa5]/.test(str)
      const isSingleChineseHeader = isFirstRowEmpty ? true : firstRow.some(hasChinese)
      let headers = [], cnRowForExcel = [], dataRows = [], dateDataRows = []
      let dataRowStartIndex; 
      if (isSingleChineseHeader) {
        const cnRow = isFirstRowEmpty ? secondRow : firstRow
        if (isFirstRowEmpty) {
          if (aoaData.length < 2) throw new Error('Excel文件表头不完整')
          dataRows = aoaData.slice(2); dateDataRows = dateAoaData.slice(2); dataRowStartIndex = 3;
        } else {
          dataRows = aoaData.slice(1); dateDataRows = dateAoaData.slice(1); dataRowStartIndex = 2;
        }
        cnRowForExcel = cnRow.map((cn) => (cn === null || cn === undefined ? '' : String(cn)))
        headers = this.generateEnglishHeaders(cnRowForExcel, this.pickFieldsData)
      } else {
        if (aoaData.length < 2) throw new Error('Excel文件表头不完整')
        const enRow = firstRow, cnRow = secondRow
        cnRowForExcel = cnRow.map((cn) => (cn === null || cn === undefined ? '' : String(cn)))
        const maxLen = Math.max(enRow.length, cnRow.length)
        for (let i = 0; i < maxLen; i++) {
          const cnItem = cnRow[i]; let enItem = enRow[i];
          if (cnItem === null || cnItem === undefined || String(cnItem).trim() === '') { headers.push(`__SKIPPED_COLUMN_${i}__`); continue; }
          if (enItem === null || enItem === undefined || String(enItem).trim() === '') { enItem = cnItem; }
          headers.push(String(enItem))
        }
        dataRows = aoaData.slice(2); dateDataRows = dateAoaData.slice(2); dataRowStartIndex = 3;
      }
      if (dataRows.length === 0) console.warn('ImportDB: Excel文件没有数据行')
      let finalPickFieldsData = this.pickFieldsData
      const debitMapping = this.pickFieldsData.find((m) => m.tableNameZhSource.includes('借方发生额'))
      const creditMapping = this.pickFieldsData.find((m) => m.tableNameZhSource.includes('贷方发生额'))
      const directionMapping = this.pickFieldsData.find((m) => m.tableNameZhSource.includes('借/贷'))
      const isJournalEntry = debitMapping && creditMapping && directionMapping && debitMapping.excelEn === creditMapping.excelEn
      if (isJournalEntry) {
        const newDebitHeader = debitMapping.tableNameZhSource, newCreditHeader = creditMapping.tableNameZhSource
        headers.push(newDebitHeader, newCreditHeader); cnRowForExcel.push(newDebitHeader, newCreditHeader);
        const amountColIndex = headers.indexOf(debitMapping.excelEn), directionColIndex = headers.indexOf(directionMapping.excelEn)
        if (amountColIndex === -1 || directionColIndex === -1) throw new Error('无法在Excel中找到借/贷方向列或金额列')
        for (const row of dataRows) {
          const direction = String(row[directionColIndex] || '').trim(), amount = row[amountColIndex]
          if (direction.includes('借')) row.push(amount, null); else if (direction.includes('贷')) row.push(null, amount); else row.push(null, null);
        }
        finalPickFieldsData = this.pickFieldsData.map((m) => {
          if (m.sysEn === debitMapping.sysEn) return { ...m, excelEn: newDebitHeader, tableNameZh: newDebitHeader }
          if (m.sysEn === creditMapping.sysEn) return { ...m, excelEn: newCreditHeader, tableNameZh: newCreditHeader }
          return m
        })
      }
      let stringForcedFields = [], timestampForcedFields = [], decimalForcedFields = []
      const { tableNameZh } = this.clickItem, englishTableName = this.clickItem?.dataItem
      const fallbackStringFields = ['voucher_number', 'account_number_self', 'opposite_party_name', 'record_date']
      const fallbackTimestampFields = ['transaction_time']
      const fallbackDecimalFields = ['debit_amount', 'credit_amount', 'balance', 'book_value_bq', 'book_value_bq_ratio', 'book_value_sq', 'book_value_sq_ratio', 'bad_debt_bq', 'bad_debt_bq_ratio', 'bad_debt_sq', 'bad_debt_sq_ratio']
      if (this.specialTableNames.includes(tableNameZh)) {
        stringForcedFields = fallbackStringFields; timestampForcedFields = fallbackTimestampFields; decimalForcedFields = fallbackDecimalFields;
      } else {
        const tableSchema = TABLE_SCHEMA[englishTableName]
        if (tableSchema) {
          for (const mappingInfo of finalPickFieldsData) {
            const sysFieldName = mappingInfo.sysEn; if (!sysFieldName) continue;
            const fieldType = tableSchema[sysFieldName]
            if (fieldType) {
              const normalizedType = fieldType.toUpperCase().split('(')[0]
              if (['VARCHAR', 'TEXT', 'CHAR'].includes(normalizedType)) stringForcedFields.push(sysFieldName)
              else if (['TIMESTAMP', 'DATE', 'DATETIME'].includes(normalizedType)) timestampForcedFields.push(sysFieldName)
              else if (['DECIMAL', 'FLOAT', 'DOUBLE', 'INT', 'BIGINT'].includes(normalizedType)) decimalForcedFields.push(sysFieldName)
            }
          }
          if (englishTableName === 'bank_transaction_record_info') {
            if (!stringForcedFields.includes('voucher_number')) stringForcedFields.push('voucher_number')
            if (!timestampForcedFields.includes('transaction_time')) timestampForcedFields.push('transaction_time')
          }
        } else {
          stringForcedFields = fallbackStringFields; timestampForcedFields = fallbackTimestampFields; decimalForcedFields = fallbackDecimalFields;
        }
      }
      const getIndices = (fields) => {
        const excelHeaders = finalPickFieldsData.filter((m) => fields.includes(m.sysEn)).map((m) => m.excelEn)
        return excelHeaders.map((h) => headers.indexOf(h)).filter((index) => index > -1)
      }
      const columnsToStringifyIndices = getIndices(stringForcedFields)
      const columnsToTimestampIndices = getIndices(timestampForcedFields)
      const columnsToDecimalIndices = getIndices(decimalForcedFields)


      // [保留] 3. 预检查
      const conversionErrors = [];
      const MAX_ERRORS_TO_SHOW = 5; // (这个变量现在在 data 中定义了，但局部保留也OK)
      for (let i = 0; i < dataRows.length; i++) {
        if (conversionErrors.length >= MAX_ERRORS_TO_SHOW) break; 
        const row = dataRows[i];
        const dateRow = dateDataRows[i]; 
        columnsToDecimalIndices.forEach((colIndex) => {
          if (conversionErrors.length >= MAX_ERRORS_TO_SHOW) return;
          let cellValue = row[colIndex];
          if ( !(cellValue === null || cellValue === undefined || String(cellValue).trim() === '' || String(cellValue).trim().toUpperCase() === 'NULL' || String(cellValue).trim() === '-') ) {
            const num = parseFloat(String(cellValue).replace(/,/g, ''));
            if (isNaN(num)) {
              conversionErrors.push({ type: '数字', row: i + dataRowStartIndex, col: cnRowForExcel[colIndex] || headers[colIndex] || `第 ${colIndex + 1} 列`, val: String(cellValue).substring(0, 20) });
            }
          }
        });
        columnsToTimestampIndices.forEach((colIndex) => {
          if (conversionErrors.length >= MAX_ERRORS_TO_SHOW) return;
          if (!this.isValidDateString(row[colIndex], dateRow[colIndex])) {
            conversionErrors.push({ type: '日期', row: i + dataRowStartIndex, col: cnRowForExcel[colIndex] || headers[colIndex] || `第 ${colIndex + 1} 列`, val: String(row[colIndex]).substring(0, 20) });
          }
        });
      }

      // [保留] 4. 确认与启动
      const importArguments = {
        dataRows,
        dateDataRows,
        headers,
        cnRowForExcel,
        finalPickFieldsData,
        columnsToStringifyIndices,
        columnsToTimestampIndices,
        columnsToDecimalIndices,
        firstSheetName,
        originalFile,
      }

      if (conversionErrors.length > 0) {
        console.log('ImportDB: 发现错误, 弹出自定义模态框。');
        this.importArgs = importArguments; 
        this.conversionErrors = conversionErrors; 
        this.showConfirmModal = true; 
        return; 

      } else {
        console.log('ImportDB: 预检查通过，没有错误。');
        this._executeImportProcess(importArguments);
      }

    } catch (error) {
      // [保留] 这个 catch 捕获步骤 1, 2, 3 (文件读取/解析/验证) 的错误
      this.uploadCStatus = false;
      
      if (error) { 
        console.error('前端处理文件时发生错误:', error)
        $notification['error']({
          message: '提醒：',
          description: '前端处理文件时发生错误: ' + error.toString(),
          duration: 8,
        })
      }
    }
  }
},


    // [新增] 真正执行导入的函数 (原步骤 5 和 6)
    _executeImportProcess(importArgs) {
      // 1. 从参数中解构所有需要的数据
      const {
        dataRows,
        dateDataRows,
        headers,
        cnRowForExcel,
        finalPickFieldsData,
        columnsToStringifyIndices,
        columnsToTimestampIndices,
        columnsToDecimalIndices,
        firstSheetName,
        originalFile,
      } = importArgs
      
      const { $notification } = this

      try {
        // [新增] 在这里开启 Loading
        this.uploadCStatus = true;

        // [保留] 5. 执行数据处理
        function formatTimestamp(date) {
          const Y = date.getFullYear(), M = String(date.getMonth() + 1).padStart(2, '0'), D = String(date.getDate()).padStart(2, '0')
          const h = String(date.getHours()).padStart(2, '0'), m = String(date.getMinutes()).padStart(2, '0'), s = String(date.getSeconds()).padStart(2, '0')
          return `${Y}-${M}-${D} ${h}:${m}:${s}`
        }
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i]
          // ... (此处省略约 40 行数据格式化逻辑) ...
          // (从 "columnsToStringifyIndices.forEach" 开始)
          // (一直到 "row[colIndex] = !isNaN(num) ? num : null;")
          columnsToStringifyIndices.forEach((colIndex) => {
            if (row[colIndex] !== null && row[colIndex] !== undefined) { let val = row[colIndex]; if (typeof val === 'number') val = val.toFixed(0); row[colIndex] = String(val).trim(); }
          })
          columnsToTimestampIndices.forEach((colIndex) => {
            const dateRow = dateDataRows[i], rawRow = row; let dateValue;
            if (dateRow && dateRow[colIndex] instanceof Date && !isNaN(dateRow[colIndex].getTime())) { dateValue = dateRow[colIndex] }
            else if (rawRow && typeof rawRow[colIndex] === 'number' && rawRow[colIndex] > 25569) { try { const serial = rawRow[colIndex], dateCode = XLSX.SSF.parse_date_code(serial); if (dateCode) dateValue = new Date(dateCode.y, dateCode.m - 1, dateCode.d, dateCode.H, dateCode.M, dateCode.S); else dateValue = null; } catch (e) { dateValue = null } }
            else if (rawRow && typeof rawRow[colIndex] === 'string' && rawRow[colIndex].trim() !== '') {
              let timeStr = rawRow[colIndex].trim().replace(/\//g, '-'); let datePart = '', timePart = '00:00:00';
              if (timeStr.includes(' ')) { const parts = timeStr.split(' '); datePart = parts[0]; timePart = parts[1] } else { datePart = timeStr }
              const dateComponents = datePart.split('-'), timeComponents = (timePart || '00:00:00').split(':')
              if (dateComponents.length === 3) {
                try { const Y = dateComponents[0], M = dateComponents[1].padStart(2, '0'), D = dateComponents[2].padStart(2, '0'); const h = (timeComponents[0] || '00').padStart(2, '0'), m = (timeComponents[1] || '00').padStart(2, '0'), s = (timeComponents[2] || '00').padStart(2, '0'); const isoString = `${Y}-${M}-${D}T${h}:${m}:${s}`; dateValue = new Date(isoString); if (isNaN(dateValue.getTime())) dateValue = new Date(timeStr.replace(' ', 'T')) } catch (e) { dateValue = null }
              } else { let cleanedTime = timeStr.replace(/\.\d+$/, '').replace(' ', 'T'); dateValue = new Date(cleanedTime); if (isNaN(dateValue.getTime())) dateValue = new Date(timeStr) }
              if (isNaN(dateValue.getTime())) dateValue = null
            } else { dateValue = null }
            row[colIndex] = dateValue ? formatTimestamp(dateValue) : null
          })
          columnsToDecimalIndices.forEach((colIndex) => {
            let cellValue = row[colIndex];
            if ( cellValue === null || cellValue === undefined || String(cellValue).trim() === '' || String(cellValue).trim().toUpperCase() === 'NULL' || String(cellValue).trim() === '-' ) { row[colIndex] = null }
            else { const num = parseFloat(String(cellValue).replace(/,/g, '')); row[colIndex] = !isNaN(num) ? num : null; }
          })
        }

        // [保留] 6. 构造新文件并上传
        const finalData = [headers, cnRowForExcel, ...dataRows]
        const newWorksheet = XLSX.utils.aoa_to_sheet(finalData)
        const newWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, firstSheetName)
        const newFileBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([newFileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const newFile = new File([blob], originalFile.name, { type: blob.type })
        const formData = new FormData(), item = this.clickItem
        formData.append('file', newFile)
        formData.append('appUserId', this.customerInfo.appUserId)

        pullTableData(item, formData, finalPickFieldsData, this.mapping)
          .then((res) => {
            this.uploadCStatus = false // [保留] 停止 Loading
            if (res.code == 200) {
              $notification['success']({ message: '通知：', description: '导入数据库成功', duration: 8 })
              this.resetData(); this.closePop(); this.update();
            } else {
              $notification['error']({ message: '提醒：', description: res.msg, duration: 8 })
            }
          })
          .catch((err) => {
            this.uploadCStatus = false // [保留] 停止 Loading
            $notification['error']({ message: '提醒：', description: err.toString(), duration: 8 })
          })

      } catch (processingError) {
        // [新增] 捕获步骤5或6中可能发生的同步错误
        this.uploadCStatus = false;
        console.error('前端处理或上传文件时发生错误:', processingError);
        $notification['error']({
          message: '提醒：',
          description: '前端处理文件时发生错误: ' + processingError.toString(),
          duration: 8,
        });
      }
    },

    // [新增] 模态框“确定”按钮的点击事件
    handleForceImport() {
      console.warn('ImportDB: 用户已确认数据格式问题，将继续导入。');
      // 从 this.importArgs 中获取之前保存的参数
      if (this.importArgs) {
        this._executeImportProcess(this.importArgs);
      }
      // 清理状态
      this.handleCancelImport();
    },

    // [新增] 模态框“取消”按钮的点击事件
    handleCancelImport() {
      console.log('ImportDB: 用户取消导入以检查数据。');
      this.showConfirmModal = false;
      this.importArgs = null;
      this.conversionErrors = [];
    },

    resetData() {
      this.selectTab = tabType[0]
      this.fileList = []
      this.pickFieldsData = []
      this.uploadTableFiedls = []
      this.excelData = []
      this.mapping = {}

      // [新增] 重置所有状态，防止二次导入时状态污染
      this.tabLoading = false       // 重置步骤1的loading
      this.uploadCStatus = false    // 重置步骤3的loading (这是卡死的关键)
      this.dataRecord = []          // 重置特殊表的数据记录
      this.conversionErrors = []    // 重置导入前的错误检查
      this.showConfirmModal = false // 隐藏确认模态框
      this.importArgs = null        // 清除待导入的参数
    },
    closePop() {
      this.resetData()
      this.$emit('closePop')
    },
    update() {
      this.$emit('update')
    },
    // [修改] 增加 callback 参数以支持 Promise 封装
    async readXLSXcontent(event, clickItem, callback) {
      const specialTable = ['现金流量表', '利润表', '资产负债表']
      const { tableNameZh } = clickItem
      let excelData = null
      if (event.length > 0) {
        const file = event[0]
        const reader = new FileReader()
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result) // [修改] 修正拼写错误：UintArray -> Uint8Array
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          excelData = JSON.stringify(jsonData, null, 2)
          if (specialTable.includes(tableNameZh)) {
            // 特殊化处理
            this.excelData = await specialTableDeal(excelData)
          } else {
            // [修改] 使用新的 normalTableDeal
            this.excelData = await normalTableDeal(excelData)
          }
          // [修改] 在文件处理完成后调用回调函数
          if (callback) callback()
        }
        reader.readAsArrayBuffer(file)
      } else {
        // [修改] 即使没有文件，也要调用回调以允许Promise继续执行
        if (callback) callback()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.tab-content {
  max-height: 70vh;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}
.step-tab {
  background-color: #f4f4f5;
  display: flex;
  text-align: center;
  border-radius: 8px 8px 0 0;
  line-height: 2;
  overflow: hidden;
  .tab-item {
    margin: 3px;
  }
  .tab-active {
    background-color: #fff;
    cursor: pointer;
  }
}
.pop-box {
  display: flex;
  flex-direction: column;
}
/deep/.ant-upload.ant-upload-select {
  display: block;
}
.table-upload-btn {
  margin: 20px 0;
  width: 100%;
  display: block;
  border: 1px dashed #e4e4e7;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  .choose-file {
    border-radius: 10px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
  .upload-txt-1 {
    font-weight: bold;
    color: #000;
  }
}
.upload-list-show {
  text-align: left;
  .name-title {
    margin-top: 5px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
  }
}
.ppp {
  display: flex;
  align-items: center;
}
.pop-btn {
  border-radius: 5px;
}
.uploaded-file {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9fafb;
}
.footer-btn {
  margin-top: 20px;
  width: 100%;
  justify-content: flex-end;
  .black-style {
    margin-left: 20px;
    background-color: #374151;
    color: #fff;
  }
  .green-style {
    margin-left: 20px;
    background-color: #16a34a;
    color: #fff;
  }
}
.desc-step-2 {
  margin: 12px 0;
  font-size: 14px;
  color: #416ade;
  background-color: #eff6ff;
  border-radius: 5px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
}
.desc-step-3 {
  margin: 12px 0;
  font-size: 14px;
  color: #aa721e;
  background-color: #fefce8;
  border-radius: 5px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
}
.big-title {
  font-size: 16px;
  font-weight: bold;
  .must {
    color: #bb1515;
  }
}
.row-show {
  display: flex;
  align-items: center;
}
.item-center {
  display: flex;
  justify-content: center;
}
.simo {
  color: #3eb269;
  font-size: 14px;
  & i {
    margin-right: 5px;
  }
}
.unsimo {
  color: #bb1515;
  font-size: 14px;
  & i {
    margin-right: 5px;
  }
}
.sys-text {
  font-size: 14px;
  color: #000;
  .must {
    margin-left: 5px;
    color: #bb1515;
  }
}
</style>
