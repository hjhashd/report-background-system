<template>
  <div>
    <div v-if="newReportModalVisible" class="modal-overlay">
      <div class="modal-large">
        <div class="modal-header">
          <div class="modal-title">新建报告</div>
          <button class="modal-close" @click="closeNewReportModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              报告名称
            </label>
            <input type="text" class="form-input" v-model="newReportForm.reportName" placeholder="请输入报告名称" />
          </div>
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              报告类型
            </label>
            <select class="form-select" v-model="newReportForm.reportType">
              <option value="">请选择报告类型</option>
              <option value="环境评估报告">环境评估报告</option>
              <option value="环境影响报告">环境影响报告</option>
              <option value="环保合规报告">环保合规报告</option>
              <option value="环境监测报告">环境监测报告</option>
              <option value="污染治理报告">污染治理报告</option>
              <option value="项目管理报告">项目管理报告</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">
              <span class="required">*</span>
              报告章节配置
            </label>
            <div class="chapter-config-wrapper">
              <div class="chapter-list-panel">
                <div class="panel-header">
                  <div class="panel-title">章节列表</div>
                  <button type="button" class="add-chapter-btn" @click="openAddChapterModal(1, null)" title="添加章节">+</button>
                </div>
                <div style="padding: 8px 12px; background: #fff7e6; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #fa8c16;">
                  💡 提示: 点击章节可选中,然后从右侧超市导入到该章节下
                </div>
                <div class="chapter-list-container">
                  <div v-if="chapters.length === 0" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div>尚未添加章节</div>
                    <div class="add-first-chapter" @click="openAddChapterModal(1, null)">添加第一个章节</div>
                  </div>
                  <div v-else>
                    <div v-for="(chapter, idx) in chapters" :key="chapter.id" class="chapter-item" :class="{ selected: selectedChapterId === chapter.id }">
                      <div class="chapter-item-header" @click="selectChapter(chapter.id)">
                        <div class="chapter-drag-handle">⋮⋮</div>
                        <div class="chapter-number">{{ idx + 1 }}</div>
                        <div class="chapter-title">{{ chapter.title }}</div>
                        <div class="chapter-actions">
                          <span class="action-icon" @click.stop="openAddChapterModal(chapter.level + 1, chapter.id)" title="添加子章节">➕</span>
                          <span class="action-icon" @click.stop="editChapter(chapter.id)" title="编辑">✏️</span>
                          <span class="action-icon action-icon-danger" @click.stop="deleteChapter(chapter.id)" title="删除">🗑️</span>
                        </div>
                      </div>
                      <div v-if="chapter.children && chapter.children.length > 0" class="sub-chapters">
                        <div v-for="(sub, subIdx) in chapter.children" :key="sub.id" class="sub-chapter-item" :class="{ selected: selectedChapterId === sub.id }" @click.stop="selectChapter(sub.id)">
                          <div class="sub-chapter-number">{{ idx + 1 }}.{{ subIdx + 1 }}</div>
                          <div class="chapter-title">{{ sub.title }}</div>
                          <div class="chapter-actions">
                            <span class="action-icon" @click.stop="openAddChapterModal(sub.level + 1, sub.id)" title="添加子章节">➕</span>
                            <span class="action-icon" @click.stop="editChapter(sub.id)" title="编辑">✏️</span>
                            <span class="action-icon action-icon-danger" @click.stop="deleteChapter(sub.id)" title="删除">🗑️</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chapter-operation-btns" style="padding: 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px;">
                  <button type="button" class="btn-default" @click="loadTemplate" style="flex: 1; height: 32px; font-size: 12px;">
                    📚 从模板加载
                  </button>
                  <button type="button" class="btn-primary" @click="previewCatalog" style="flex: 1; height: 32px; font-size: 12px;">
                    👁️ 预览目录
                  </button>
                </div>
              </div>
              <div class="chapter-market-panel">
                <div class="panel-header">
                  <div class="panel-title">章节超市</div>
                </div>
                <div class="market-search">
                  <input type="text" class="market-search-input" v-model="marketSearchKeywordProxy" placeholder="搜索章节..." />
                </div>
                <div class="market-content">
                  <div v-for="item in filteredMarketData" :key="item.name" class="template-card">
                    <div class="template-header">
                      <div class="template-name">{{ item.name }}</div>
                      <button type="button" class="insert-btn" @click="insertFromMarket(item.name)">导入</button>
                    </div>
                    <div class="template-meta">
                      <span>{{ item.desc.split('\n')[0] }}</span>
                    </div>
                    <div class="template-desc">{{ item.desc.split('\n')[1] || '' }}</div>
                    <div v-if="item.children.length > 0" style="font-size: 11px; color: #999; margin-top: 4px;">
                      含 {{ item.children.length }} 个子章节
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">报告对象</label>
            <input type="text" class="form-input" v-model="newReportForm.reportObject" placeholder="请输入报告对象" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="closeNewReportModal" style="height: 36px; padding: 0 20px;">取消</button>
          <button class="btn-primary" @click="$emit('create-report')" :disabled="uiDisabled" style="height: 36px; padding: 0 20px;">确定创建</button>
        </div>
      </div>
    </div>
    <div v-if="addChapterModalVisible" class="modal-overlay" style="z-index: 1100;">
      <div class="modal-small">
        <div class="modal-header">
          <div class="modal-title">添加章节</div>
          <button class="modal-close" @click="closeAddChapterModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">章节层级</label>
            <select class="form-select" v-model="addChapterForm.level">
              <option value="1">一级章节</option>
              <option value="2">二级章节</option>
              <option value="3">三级章节</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">章节标题</label>
            <input type="text" class="form-input" v-model="addChapterForm.title" placeholder="请输入章节标题" @keyup.enter="$emit('add-chapter')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="closeAddChapterModal" style="height: 32px; padding: 0 16px;">取消</button>
          <button class="btn-primary" @click="$emit('add-chapter')" style="height: 32px; padding: 0 16px;">确定</button>
        </div>
      </div>
    </div>
    <div v-if="templateModalVisible" class="modal-overlay" style="z-index: 1100;">
      <div class="modal-small">
        <div class="modal-header">
          <div class="modal-title">选择模板</div>
          <button class="modal-close" @click="closeTemplateModal">×</button>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
          <div class="market-search" style="padding: 0 0 16px 0;">
            <input type="text" class="market-search-input" v-model="templateSearchKeywordProxy" placeholder="搜索模板..." />
          </div>
          <div id="templateList">
            <div v-for="tpl in filteredTemplates" :key="tpl.name" 
                 :class="['template-card', { active: selectedTemplate === tpl.name }]"
                 @click="$emit('update:selectedTemplate', tpl.name); $emit('select-template', tpl.name)">
              <div class="template-header">
                <div class="template-name">{{ tpl.name }}</div>
              </div>
              <div class="template-desc">
                包含 {{ tpl.data.length }} 个一级章节, {{ tpl.data.reduce((acc, curr) => acc + curr.children.length, 0) }} 个二级章节
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="closeTemplateModal" style="height: 32px; padding: 0 16px;">取消</button>
          <button class="btn-primary" @click="$emit('confirm-load-template')" style="height: 32px; padding: 0 16px;">确定加载</button>
        </div>
      </div>
    </div>
    <div v-if="previewModalVisible" class="modal-overlay" style="z-index: 1100;">
      <div class="modal-small">
        <div class="modal-header">
          <div class="modal-title">报告目录预览</div>
          <button class="modal-close" @click="closePreviewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="preview-catalog">
            <div v-for="(item, idx) in chapters" :key="item.id">
              <div class="preview-item preview-level-1">{{ idx + 1 }} {{ item.title }}</div>
              <div v-for="(sub, subIdx) in item.children" :key="sub.id">
                <div class="preview-item preview-level-2">{{ idx + 1 }}.{{ subIdx + 1 }} {{ sub.title }}</div>
                <div v-for="(ssub, ssubIdx) in sub.children" :key="ssub.id">
                  <div class="preview-item preview-level-3">{{ idx + 1 }}.{{ subIdx + 1 }}.{{ ssubIdx + 1 }} {{ ssub.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="closePreviewModal" style="height: 32px; padding: 0 16px;">关闭</button>
          <button class="btn-primary" @click="$emit('export-catalog')" style="height: 32px; padding: 0 16px;">导出目录</button>
        </div>
      </div>
    </div>
    <div v-if="editChapterModalVisible" class="modal-overlay" style="z-index: 1100;">
      <div class="modal-small">
        <div class="modal-header">
          <div class="modal-title">编辑章节</div>
          <button class="modal-close" @click="closeEditChapterModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">章节标题</label>
            <input type="text" class="form-input" v-model="editChapterForm.title" placeholder="请输入章节标题" @keyup.enter="$emit('confirm-edit-chapter')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-default" @click="closeEditChapterModal" style="height: 32px; padding: 0 16px;">取消</button>
          <button class="btn-primary" @click="$emit('confirm-edit-chapter')" style="height: 32px; padding: 0 16px;">确定</button>
        </div>
      </div>
    </div>
    <div v-if="diagModalVisible" class="modal-overlay" style="z-index: 2000;">
      <div class="modal-content" style="max-width: 600px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <div class="modal-header" style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 18px; color: #333;">🔍 系统诊断报告</h3>
          <span class="modal-close" @click="$emit('update:diagModalVisible', false)" style="cursor: pointer; font-size: 24px;">&times;</span>
        </div>
        <div class="modal-body" style="padding: 20px; max-height: 400px; overflow-y: auto;">
          <div v-if="diagLoading" style="text-align: center; padding: 40px">
            <a-icon type="loading" style="font-size: 24px; color: #1890ff;" />
            <div style="margin-top: 10px; color: #666;">正在运行深度诊断，请稍候...</div>
          </div>
          <div v-else-if="diagResult">
            <div style="margin-bottom: 20px; padding: 12px; background: #f0f7ff; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #0050b3;">🌍 客户端环境</h4>
              <div style="font-size: 13px; line-height: 1.6;">
                <div><span style="color: #666; width: 100px; display: inline-block;">当前 Origin:</span> <strong>{{ window_origin }}</strong></div>
                <div><span style="color: #666; width: 100px; display: inline-block;">VPN 状态:</span> <span style="color: #52c41a;">检测到 VPN 连接</span></div>
              </div>
            </div>
            <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #eee; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">🔗 OnlyOffice 连通性</h4>
              <div style="font-size: 13px; line-height: 1.6;">
                <div><span style="color: #666; width: 100px; display: inline-block;">OO Host:</span> {{ (diagResult.env && diagResult.env.hostEnv) || '未设置' }}</div>
                <div><span style="color: #666; width: 100px; display: inline-block;">API 状态:</span> 
                  <a-tag :color="diagResult.docsApiReachable ? 'green' : 'red'">
                    {{ diagResult.docsApiReachable ? '可连接' : '无法连接' }}
                  </a-tag>
                </div>
              </div>
              <div v-if="!diagResult.docsApiReachable" style="margin-top: 10px; padding: 8px; background: #fff1f0; border: 1px solid #ffa39e; color: #cf1322; font-size: 12px; border-radius: 2px;">
                ⚠️ 警告: OnlyOffice 服务端无法从本系统容器内部访问。这会导致编辑器无法加载或无法保存。
              </div>
            </div>
            <div style="padding: 12px; border: 1px solid #eee; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">📂 文件系统状态</h4>
              <div style="font-size: 13px;">
                <div><span style="color: #666; width: 120px; display: inline-block;">草稿箱目录:</span> 
                  <a-tag :color="(diagResult.exists && diagResult.exists.publicDrafts) ? 'green' : 'red'">
                    {{ (diagResult.exists && diagResult.exists.publicDrafts) ? 'OK' : '缺失' }}
                  </a-tag>
                </div>
              </div>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #999; border-top: 1px dashed #eee; padding-top: 10px;">
              诊断完成，若仍有问题请联系管理员。
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <a-button type="primary" @click="$emit('update:diagModalVisible', false)">完成诊断</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FirstDraftModals',
  props: {
    newReportModalVisible: { type: Boolean, default: false },
    addChapterModalVisible: { type: Boolean, default: false },
    templateModalVisible: { type: Boolean, default: false },
    previewModalVisible: { type: Boolean, default: false },
    editChapterModalVisible: { type: Boolean, default: false },
    diagModalVisible: { type: Boolean, default: false },
    diagLoading: { type: Boolean, default: false },
    diagResult: { type: [Object, String, null], default: null },
    window_origin: { type: String, default: '' },
    uiDisabled: { type: Boolean, default: false },
    primaryColor: { type: String, default: '#1890ff' },
    // data
    newReportForm: { type: Object, default: () => ({}) },
    chapters: { type: Array, default: () => [] },
    selectedChapterId: { type: [Number, String, null], default: null },
    addChapterForm: { type: Object, default: () => ({}) },
    editChapterForm: { type: Object, default: () => ({}) },
    filteredMarketData: { type: Array, default: () => [] },
    filteredTemplates: { type: Array, default: () => [] },
    selectedTemplate: { type: [String, null], default: null },
    marketSearchKeyword: { type: String, default: '' },
    templateSearchKeyword: { type: String, default: '' },
    // methods
    closeNewReportModal: { type: Function, required: true },
    openAddChapterModal: { type: Function, required: true },
    selectChapter: { type: Function, required: true },
    editChapter: { type: Function, required: true },
    deleteChapter: { type: Function, required: true },
    insertFromMarket: { type: Function, required: true },
    loadTemplate: { type: Function, required: true },
    previewCatalog: { type: Function, required: true },
    closeAddChapterModal: { type: Function, required: true },
    closeTemplateModal: { type: Function, required: true },
    confirmLoadTemplate: { type: Function, required: true },
    closePreviewModal: { type: Function, required: true },
    exportCatalog: { type: Function, required: true },
    closeEditChapterModal: { type: Function, required: true }
  },
  computed: {
    marketSearchKeywordProxy: {
      get() { return this.marketSearchKeyword },
      set(v) { this.$emit('update:marketSearchKeyword', v) }
    },
    templateSearchKeywordProxy: {
      get() { return this.templateSearchKeyword },
      set(v) { this.$emit('update:templateSearchKeyword', v) }
    }
  }
}
</script>

<style lang="less" scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .modal-large {
    background: white;
    border-radius: 12px;
    width: 1200px;
    max-width: 95%;
    height: 85vh;
    animation: slideUp 0.3s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
  }
  .modal-small {
    background: white;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    animation: slideUp 0.3s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .modal-close:hover {
    background: #f5f5f5;
    color: #333;
  }
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  .form-label .required { color: #ff4d4f; margin-right: 4px; }
  .form-input, .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s;
  }
  #templateList {
    .template-card {
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all .2s;
    }
    .template-card:hover {
      border-color: #d6e4ff;
      background: #f7fbff;
    }
    .template-card.active {
      border-color: #4a7ce2;
      background: #eaf2ff;
    }
    .template-header .template-name {
      font-weight: 600;
      color: #333;
    }
    .template-desc {
      font-size: 12px;
      color: #666;
      margin-top: 6px;
    }
  }
  .chapter-config-wrapper {
    display: flex;
    gap: 0;
    height: 500px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    overflow: hidden;
  }
  .chapter-list-panel {
    width: 50%;
    background: white;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
  }
  .chapter-market-panel {
    width: 50%;
    background: white;
    display: flex;
    flex-direction: column;
  }
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
  }
  .panel-title { font-size: 14px; font-weight: 600; color: #333; }
  .chapter-list-container { flex: 1; overflow-y: auto; padding: 16px; }
  .market-search { padding: 16px; border-bottom: 1px solid #f0f0f0; }
  .market-search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 13px;
  }
  .market-content { flex: 1; overflow-y: auto; padding: 16px; }
  .empty-state { text-align: center; padding: 40px 20px; color: #999; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .add-first-chapter { color: #1890ff; cursor: pointer; text-decoration: underline; margin-top: 8px; display: inline-block; }
  .chapter-item { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 8px; transition: all 0.2s; overflow: hidden; }
  .chapter-item-header { padding: 10px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; background: white; }
  .chapter-drag-handle { color: #999; font-size: 14px; cursor: move; }
  .chapter-number { background: #1890ff; color: white; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; min-width: 35px; text-align: center; }
  .chapter-title { flex: 1; font-size: 13px; color: #333; }
  .chapter-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
  .chapter-item:hover .chapter-actions { opacity: 1; }
  .action-icon { color: #999; cursor: pointer; font-size: 14px; transition: all 0.2s; padding: 2px; }
  .action-icon:hover { color: #1890ff; transform: scale(1.2); }
  .sub-chapters { padding: 6px 12px 6px 40px; background: #fafafa; }
  .sub-chapter-item { padding: 8px; background: white; border: 1px solid #e8e8e8; border-radius: 4px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .sub-chapter-number { background: #52c41a; color: white; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 600; min-width: 30px; text-align: center; }
  .template-card { background: white; border: 1px solid #e8e8e8; border-radius: 6px; padding: 12px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; }
  .template-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .template-name { font-size: 13px; font-weight: 600; color: #333; }
  .template-desc { font-size: 12px; color: #666; line-height: 1.5; }
  .insert-btn { background: #1890ff; color: white; border: none; border-radius: 4px; padding: 4px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .preview-catalog { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 20px; font-family: 'Courier New', monospace; max-height: 60vh; overflow-y: auto; }
  .preview-item { padding: 6px 0; line-height: 1.8; color: #333; }
  .preview-level-1 { font-size: 15px; font-weight: 600; color: #1890ff; }
  .preview-level-2 { padding-left: 30px; font-size: 13px; color: #52c41a; }
  .preview-level-3 { padding-left: 60px; font-size: 12px; color: #999; }
</style>
