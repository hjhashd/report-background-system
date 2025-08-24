/*
 * @Author: bekon
 * @Date: 2025-02-21 14:25:44
 * @LastEditors: bekon
 * @LastEditTime: 2025-08-24 17:16:17
 * @FilePath: \report-background-system\src\api\report.js
 * @Description:
 *
 */
import request from '@/utils/request'

const reportAPI = {
    dataAccredit: '/report/data/accredit/lately/dataAccredit',
    getCustomerList: '/system/agent/user/customer/list',
    accreditUploadList: '/report/data/accredit/finance/files/',
    customerData: '/report/entity/data/table/config',
    buildReport: '/report/entity/save/report',
    wopiFile: '/report/office/config/',
    abnormalReport: '/report/entity/abnormal/report',
    reportList: '/report/entity/list',
    getReportModal: '/report/entity/template/list',
    getModalInfo: '/report/entity/template/type/list',
    uploadFile: '/report/entity/upload/data/',
    getReportDetail: '/report/entity/',
    reportContentList: '/report/entity/content/list',
    deleteReportContent: '/report/entity/content/delete/',
    saveReportContent: '/report/entity/content/save/as',
    useReportContent: '/report/entity/content/apply',
    getCustomerDetail: '/system/agent/user/customer/info/',
    updateReportDate: '/report/entity/batch/update/data/',
    getModalList: '/report/entity/content/title/list/',
    updateReport: '/report/entity/update/report/',
    applyReport: '/report/entity/publish/',
    setDraftStatus: '/report/entity/draft/',
    getCustomerAbnormalList: '/report/entity/customer/abnormal/list/',
    AI: '/report/entity/content/optimize',
    viewReportTable: '/report/entity/preview/data',
    appUploadFile: '/report/data/accredit/lately/detail',
    industryReportList: '/report/industry/list',
    getIndustryClassify: '/report/industry/classify',
    getIndustryReportConfig: '/report/office/industry/config/',
    getAIConfig: '/report/entity/ai/content',
    getAbnormalNew: '/report/entity/customer/abnormal/list/',
    dUploadFile: '/report/entity/indicators/batch/upload',
    updateSearchContent: '/report/entity/indicators/save',
    importCashFlow: '/report/v2/entity/import/cashFlow',
    importBalanceSheet: '/report/v2/entity/import/balanceSheet',
    importProfitSheet: '/report/v2/entity/import/profitSheet',
    importNormal: '/report/v2/entity/upload/data',
    getCashFlowFields: '/report/v2/entity/cashFlow/fields',
    getBalanceSheetFields: '/report/v2/entity/balanceSheet/fields',
    getProfitSheetFields: '/report/v2/entity/profitSheet/fields',
    getNormalFields: '/report/v2/entity/table/fields/',
    getAppFileList: '/report/v2/entity/client/upload/files',
    deleteFile: '/report/v2/entity/indicators/delete/file/',
    deleteSearchContent: '/report/entity/indicators/',
    uploadProof: '/report/v2/entity/proof/file/upload',
    updateTable: '/report/v2/entity/update/table/data',
    deleteProofFile: '/report/v2/entity/delete/proof/file/',
    deleteUploadFile: '/report/v2/entity/delete/uploadtable/file/',
    getProofFile: '/report/v2/entity/proof/file/list',
    deleteReport: '/report/entity/',
    getAIType: '/report/v2/entity/ai/content/type?creditCode=',
    batchDeleteReport: '/report/entity/batch/delete',
    uploadTableUpload: '/report/v2/entity/uploadtable/file/upload',

    // 上传数据
    getUploadsFile: '/report/v2/entity/uploadtable/file/list',
    getAutoFiles: '/report/v2/entity/proof/file/list',
    getDYFiles: '/report/v2/entity/all/customer/abnormal/file/list',

    // ai润色
    getAiColor: '/report/v2/entity/ai/retouch/type',
    aiColor: '/report/v2/entity/ai/content/retouch',

    // 报告模板类型
    getReportTemplateClassify: '/report/entity/template/classify/list',

    // 特殊三表的字段获取
    getSpecialFields: '/report/v2/entity/data/record',

    // 初稿列表
    getFirstDraftList: '/report/draft/list',
    deleteFirstDraft: '/report/draft/delete/',
    saveFirstDraft: '/report/draft/save/report',
    batchDeleteFirstDraft: '/report/draft/batch/delete',
    getFirstDraftDetail: '/report/draft/chapter/detail/',
    getFirstDraftConfig: '/report/office/draft/config/',
    getFirstDraftChapter: '/report/draft/chapter/',
    // 初稿AI相关接口
    getTemplateDetail: '/report/draft/chose/report/content',
    getDraftQuickChose: '/report/draft/quick/chose',
    mergeTemplate: '/report/draft/merge/draft/',
    getAIRetouchType: '/report/v2/entity/ai/retouch/type',
    contentRetouch: '/report/v2/entity/ai/content/retouch',
    saveDraftPolishing: '/report/draft/polishing/save',
    getPolishingList: '/report/draft/polishing/list',
    draftAIContent: '/report/draft/ai/content',
    applyAIContent: '/report/draft/apply/ai/content',
    addAIEngine: '/report/draft/ai/engine/save',
    getAIEngineList: '/report/draft/ai/engine/list',
    getEngineQuickList: '/report/draft/ai/search/prompt/'
}



// 初稿列表
export function getFirstDraftList(parameter) {
    return request({
        url: reportAPI.getFirstDraftList,
        method: 'post',
        data: parameter
    })
}

// 删除初稿
export function deleteFirstDraft(id) {
    return request({
        url: reportAPI.deleteFirstDraft + id,
        method: 'delete',
    })
}

// 批量删除初稿
export function batchDeleteFirstDraft(ids) {
    return request({
        url: reportAPI.batchDeleteFirstDraft,
        method: 'post',
        data: ids
    })
}

// 获取指定用户所有调研结果上传的文件
export function getDYFiles(parameter) {
    return request({
        url: reportAPI.getDYFiles,
        method: 'post',
        data: parameter
    })
}

// 获取自动采集的表证明文件列表
export function getAutoFiles(parameter) {
    return request({
        url: reportAPI.getAutoFiles,
        method: 'post',
        data: parameter
    })
}

// 获取上传数据的表证明文件列表
export function getUploadsFile(parameter) {
    return request({
        url: reportAPI.getUploadsFile,
        method: 'post',
        data: parameter
    })
}

// 批量上传
export function uploadTableUpload(parameter) {
    return request({
        url: reportAPI.uploadTableUpload,
        method: 'post',
        data: parameter
    })
}

// 获取证明材料
export function getProofFile(parameter) {
    return request({
        url: reportAPI.getProofFile,
        method: 'post',
        data: parameter
    })
}

// 更新证明材料
export function uploadProof(parameter) {
    return request({
        url: reportAPI.uploadProof,
        method: 'post',
        data: parameter
    })
}

// 更新表
export function updateTable(parameter) {
    return request({
        url: reportAPI.updateTable,
        method: 'post',
        data: parameter
    })
}

// 删除报告
export function deleteReport(id) {
    return request({
        url: reportAPI.deleteReport + id,
        method: 'delete',
    })
}

// 删除证明材料
export function deleteProofFile(id) {
    return request({
        url: reportAPI.deleteProofFile + id,
        method: 'delete',
    })
}

// 删除指标验证文件
export function deleteUploadFile(id) {
    return request({
        url: reportAPI.deleteUploadFile + id,
        method: 'delete',
    })
}

// 删除指标文件
export function deleteFile(id) {
    return request({
        url: reportAPI.deleteFile + id,
        method: 'delete',
    })
}
// 删除现场调研接口
export function deleteSearchContent(id) {
    return request({
        url: reportAPI.deleteSearchContent + id,
        method: 'delete',
    })
}
// 删除
export function batchDeleteReport(ids) {
    return request({
        url: reportAPI.batchDeleteReport,
        method: 'delete',
        data: ids
    })
}
export function getAppFileList(parameter) {
    return request({
        url: reportAPI.getAppFileList,
        method: 'post',
        data: parameter
    })
}

// 获取上传数据表格Fields
export function getFields(clickItem) {
    const { tableNameZh, id } = clickItem
    switch (tableNameZh) {
        case '现金流量表':
            return request({
                url: reportAPI.getCashFlowFields,
                method: 'get',
            })
        case '利润表':
            return request({
                url: reportAPI.getProfitSheetFields,
                method: 'get',
            })
        case '资产负债表':
            return request({
                url: reportAPI.getBalanceSheetFields,
                method: 'get',
            })
        default:
            return request({
                url: reportAPI.getNormalFields + id,
                method: 'get',
            })
    }
}

// 获取更新后的灵活入库三表字段
export function getNewSpecialFields(tableName) {
    return request({
        url: reportAPI.getSpecialFields,
        method: 'get',
        params: { "tableName": tableName }
    })
}

// 导入数据文件
export function pullTableData(clickItem, data, pickFieldsData, mapping) {
    const { tableNameZh, id } = clickItem

    const specialTable = ['现金流量表', '利润表', '资产负债表']
    if (specialTable.includes(tableNameZh)) {
        // 过滤处理
        mapping = Object.entries(mapping).reduce((acc, [key, value]) => {
            if (value !== "--不匹配---") {
                acc[key] = value;
            }
            return acc;
        }, {});
    }

    switch (tableNameZh) {
        case '现金流量表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importCashFlow,
                method: 'post',
                data
            })
        case '利润表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importProfitSheet,
                method: 'post',
                data
            })
        case '资产负债表':
            data.append('mapping', JSON.stringify(mapping))
            return request({
                url: reportAPI.importBalanceSheet,
                method: 'post',
                data
            })
        default:
            data.append('tableId', id)
            let mapIn = {}
            pickFieldsData.forEach(element => {
                mapIn[element.sysEn] = element.excelEn
            });
            data.append('mapping', JSON.stringify(mapIn))
            return request({
                url: reportAPI.importNormal,
                method: 'post',
                data
            })
    }
}

export function getIndustryClassify() {
    return request({
        url: reportAPI.getIndustryClassify,
        method: 'get',
    })
}

export function getAIType(creditCode) {
    return request({
        url: reportAPI.getAIType + creditCode,
        method: 'get',
    })
}

export function industryReportList(parameter) {
    return request({
        url: reportAPI.industryReportList,
        method: 'post',
        data: parameter
    })
}

export function dataAccredit(parameter) {
    return request({
        url: reportAPI.dataAccredit,
        method: 'post',
        data: parameter
    })
}

export function getCustomerList(parameter) {
    return request({
        url: reportAPI.getCustomerList,
        method: 'post',
        data: parameter
    })
}

export function accreditUploadList(id) {
    return request({
        url: reportAPI.accreditUploadList + id,
        method: 'get'
    })
}

export function customerData(parameter) {
    return request({
        url: reportAPI.customerData,
        method: 'post',
        data: parameter
    })
}

export function buildReport(parameter) {
    return request({
        // url: reportAPI.buildReport,
        url: reportAPI.saveFirstDraft,
        method: 'post',
        data: parameter
    })
}

export function wopiFile(id) {
    return request({
        url: reportAPI.wopiFile + id,
        method: 'get'
    })
}

export function abnormalReport(parameter) {
    return request({
        url: reportAPI.abnormalReport,
        method: 'post',
        data: parameter
    })
}

export function reportList(parameter) {
    return request({
        url: reportAPI.reportList,
        method: 'post',
        data: parameter
    })
}

export function getReportModal(parameter) {
    return request({
        url: reportAPI.getReportModal,
        method: 'post',
        data: parameter
    })
}

export function uploadFile(parameter, customerId) {
    return request({
        url: reportAPI.uploadFile + customerId,
        method: 'post',
        data: parameter
    })
}

export function getModalInfo() {
    return request({
        url: reportAPI.getModalInfo,
        method: 'get',
    })
}

// 获取报告详情信息
export function getReportDetail(id) {
    return request({
        url: reportAPI.getReportDetail + id,
        method: 'get',
    })
}

// 获取报告评价内容列表
export function reportContentList(parameter) {
    return request({
        url: reportAPI.reportContentList,
        method: 'post',
        data: parameter
    })
}

// 获取AI智能内容
export function getAIConfig(parameter) {
    return request({
        url: reportAPI.getAIConfig,
        method: 'post',
        data: parameter
    })
}

// 获取报告评价内容列表
export function deleteReportContent(id) {
    return request({
        url: reportAPI.deleteReportContent + id,
        method: 'delete',
    })
}

// 另存为报告评价内容
export function saveReportContent(parameter) {
    return request({
        url: reportAPI.saveReportContent,
        method: 'post',
        data: parameter
    })
}

// 应用报告评价内容
export function useReportContent(parameter) {
    return request({
        url: reportAPI.useReportContent,
        method: 'post',
        data: parameter
    })
}

// 更新报告数据文档
export function updateReportDate(parameter, id) {
    return request({
        url: reportAPI.updateReportDate + id,
        method: 'post',
        data: parameter
    })
}

// 获取客户详情信息
export function getCustomerDetail(id) {
    return request({
        url: reportAPI.getCustomerDetail + id,
        method: 'get',
    })
}

// 获取报告结论模板列表
export function getModalList(id) {
    return request({
        url: reportAPI.getModalList + id,
        method: 'get',
    })
}

// 更新报告
export function updateReport(id) {
    return request({
        url: reportAPI.updateReport + id,
        method: 'post',
    })
}

// 发布报告
export function applyReport(id, name) {
    return request({
        url: reportAPI.applyReport + id + '?reportName=' + name,
        method: 'post',
    })
}

// 将报告状态转为草稿
export function setDraftStatus(id, name) {
    return request({
        url: reportAPI.setDraftStatus + id + '?reportName=' + name,
        method: 'post',
    })
}

// AI优化
export function toAi(parameter) {
    return request({
        url: reportAPI.AI,
        method: 'post',
        data: parameter
    })
}

export function viewReportTable(parameter) {
    return request({
        url: reportAPI.viewReportTable,
        method: 'post',
        data: parameter
    })
}

export function appUploadFile(parameter) {
    return request({
        url: reportAPI.appUploadFile,
        method: 'post',
        data: parameter
    })
}

export function dUploadFile(parameter) {
    return request({
        url: reportAPI.dUploadFile,
        method: 'post',
        data: parameter
    })
}

// 将报告状态转为草稿
export function getCustomerAbnormalList(id, type) {
    return request({
        url: `${reportAPI.getCustomerAbnormalList}${id}?firstLevel=${type}`,
        method: 'get',
    })
}

// 获取异常数据-new
export function getAbnormalNew(id, parameter) {
    return request({
        url: `${reportAPI.getAbnormalNew}${id}`,
        method: 'post',
        data: parameter
    })
}

// 更新content
export function updateSearchContent(parameter) {
    return request({
        url: `${reportAPI.updateSearchContent}`,
        method: 'post',
        data: parameter
    })
}

// 获取报告的config
export function getIndustryReportConfig(id) {
    return request({
        url: `${reportAPI.getIndustryReportConfig}${id}`,
        method: 'get',
    })
}

export function getAiColor() {
    return request({
        url: reportAPI.getAiColor,
        method: 'get',
    })
}

export function aiColor(parameter) {
    return request({
        url: reportAPI.aiColor,
        method: 'post',
        data: parameter
    })
}

export function getReportTemplateClassify(parameter) {
    return request({
        url: reportAPI.getReportTemplateClassify,
        method: 'post',
        data: parameter
    })
}

// 获取章节详情(使用章节的id)
export function getFirstDraftDetail(id) {
    return request({
        url: reportAPI.getFirstDraftDetail + id,
        method: 'get',
    })
}

// 获取office配置
export function getFirstDraftConfig(id) {
    return request({
        url: reportAPI.getFirstDraftConfig + id,
        method: 'get',
    })
}

// 获取初稿详情列表接口(使用初稿的id)
export function getFirstDraftChapter(id) {
    return request({
        url: reportAPI.getFirstDraftChapter + id,
        method: 'get',
    })
}

// 初稿详情-AI生成-获取详情页面的(选择报告内容项，使用标题的templateId)
export function getTemplateDetail(parameter) {
    return request({
        url: reportAPI.getTemplateDetail,
        method: 'post',
        data: parameter
    })
}

// 初稿详情-AI生成-获取快速选择列表(使用templateId和选择的报告内容项)
export function getDraftQuickChose(parameter) {
    return request({
        url: reportAPI.getDraftQuickChose,
        method: 'post',
        data: parameter
    })
}

// 将初稿生成一份报告(用初稿id在url上，不用带body)
export function mergeTemplate(id) {
    return request({
        url: reportAPI.mergeTemplate + id,
        method: 'post',
    })
}

// 获取润色的全部分类
export function getAIRetouchType() {
    return request({
        url: reportAPI.getAIRetouchType,
        method: 'get',
    })
}

// 内容润色接口
export function contentRetouch(parameter) {
    return request({
        url: reportAPI.contentRetouch,
        method: 'post',
        data: parameter
    })
}

// 保存初稿润色结果版本
export function saveDraftPolishing(parameter) {
    return request({
        url: reportAPI.saveDraftPolishing,
        method: 'post',
        data: parameter
    })
}

// 获取初稿润色结果版本列表
export function getPolishingList(parameter) {
    return request({
        url: reportAPI.getPolishingList,
        method: 'post',
        data: parameter
    })
}

// 初稿生成AI内容
export function draftAIContent(parameter) {
    return request({
        url: reportAPI.draftAIContent,
        method: 'post',
        data: parameter
    })
}

// 应用AI内容到初稿章节
export function applyAIContent(parameter) {
    return request({
        url: reportAPI.applyAIContent,
        method: 'post',
        data: parameter
    })
}

// 新增AI引擎
export function addAIEngine(parameter) {
    return request({
        url: reportAPI.addAIEngine,
        method: 'post',
        data: parameter
    })
}

// AI引擎列表
export function getAIEngineList() {
    return request({
        url: reportAPI.getAIEngineList,
        method: 'get',
    })
}

// 初稿详情-AI搜索-快速选择提示词列表
export function getEngineQuickList(prompt) {
    return request({
        url: reportAPI.getEngineQuickList + prompt,
        method: 'get',
    })
}