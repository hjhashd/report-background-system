<template>
  <div class="file-select-panel">
    <div class="panel-header">
      <div class="title">资料选择</div>
      <a-button size="small" @click="$emit('close')">关闭</a-button>
    </div>
    <div class="upload-area">
      <a-upload :file-list="uploadList" :beforeUpload="handleBeforeUpload" :multiple="true" :showUploadList="true">
        <a-button type="primary" size="small">选择资料</a-button>
      </a-upload>
      <div class="hint">选择本地素材后可在下方进行预览与推荐</div>
    </div>
    <div class="section">
      <div class="section-title">
        <span>文件目录</span>
      </div>
      <div class="tree-root" :style="{ maxHeight: panelHeight }">
        <div class="folder" v-for="folder in treeData" :key="folder.name">
          <div class="folder-header" @click="toggleFolder(folder.name)">
            <a-icon :type="isCollapsed(folder.name) ? 'folder' : 'folder-open'" style="color: #4a7ce2; margin-right: 6px" />
            <span class="folder-name">{{ folder.name }}</span>
            <a-icon :type="isCollapsed(folder.name) ? 'down' : 'up'" style="margin-left: auto" />
          </div>
          <div class="folder-body" v-show="!isCollapsed(folder.name)">
            <div class="subfolder" v-for="sub in folder.children" :key="sub.name">
              <div class="subfolder-header" @click="toggleFolder(folder.name + '/' + sub.name)">
                <a-icon :type="isCollapsed(folder.name + '/' + sub.name) ? 'folder' : 'folder-open'" style="color: #7e9cea; margin-right: 6px" />
                <span class="subfolder-name">{{ sub.name }}</span>
                <a-icon :type="isCollapsed(folder.name + '/' + sub.name) ? 'down' : 'up'" style="margin-left: auto" />
              </div>
              <div class="files" v-show="!isCollapsed(folder.name + '/' + sub.name)">
                <div
                  class="file-item"
                  v-for="f in sub.files"
                  :key="f.name"
                  @click="previewFile(f)"
                >
                  <a-checkbox
                    :checked="selectedPaths.includes(f.path)"
                    @click.stop
                    @change="(e) => toggleSelection(f.path, e.target.checked)"
                    style="margin-right: 8px"
                  />
                  <a-icon type="file" style="color: #999; margin-right: 6px" />
                  <span class="file-name single-line-text">{{ f.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  <div class="section">
      <div class="section-title">
        <span>推荐文件</span>
      </div>
      <a-spin :spinning="recoLoading" tip="推荐中...">
        <div class="recommendations">
          <div class="recommend-item rec-item-clickable" v-for="item in recommendations" :key="item.name" @click="openRec(item)">
            <div class="flex-row-center">
              <a-checkbox
                :checked="selectedPaths.includes(item.path)"
                @click.stop
                @change="(e) => toggleSelection(item.path, e.target.checked)"
                style="margin-right: 8px"
              />
              <div class="flex-1 overflow-hidden">
                <div class="rec-name single-line-text">{{ item.name }}</div>
                <div class="rec-reason single-line-text">{{ item.reason }}</div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div class="section">
      <div class="section-title">
        <span>AI 辅助撰写</span>
      </div>
      <div class="ai-box">
        <a-input
          type="textarea"
          :rows="5"
          v-model="aiPrompt"
          placeholder="请输入提示词，例如：生成一段关于节能降碳的政策综述，包含背景、目标与建议。"
        ></a-input>
        <div class="ai-actions">
          <a-button type="primary" size="small" :loading="aiGenerating" @click="generateAI">AI生成</a-button>
          <a-button size="small" :disabled="aiGenerating" @click="regenerate">重新生成</a-button>
          <a-button type="dashed" size="small" :disabled="!aiResult || aiGenerating" @click="applyInsert">应用并插入</a-button>
          <span class="ai-hint">将在光标处插入到左侧文档</span>
        </div>
        <a-spin :spinning="aiGenerating" tip="正在生成...">
          <div class="ai-result" v-if="aiResult && !aiGenerating">
            <div class="ai-result-title">生成结果预览：</div>
            <div class="ai-result-text">{{ aiResult }}</div>
          </div>
        </a-spin>
      </div>
    </div>
    <a-modal
      v-model="previewVisible"
      :footer="null"
      width="70vw"
      :bodyStyle="{ height: '70vh', padding: 0 }"
      title="文件预览"
    >
      <div class="preview-wrap">
        <iframe v-if="previewFileUrl" :src="previewFileUrl" class="preview-iframe"></iframe>
      </div>
      <div class="modal-footer">
        <a-button type="primary" @click="previewVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
  </template>
  
  <script>
  export default {
    name: 'FileSelectPanel',
    props: {
      editorHeight: {
        type: String,
        default: '600px'
      }
    },
    data() {
      return {
        uploadList: [],
        collapsed: {},
        selectedPaths: [],
        previewVisible: false,
        previewFileUrl: '',
        recoLoading: false,
        selectedFileName: '',
        aiPrompt: '请生成一段约200字的材料综述，主题为节能降碳工作推进，包含背景、重点举措与预期成效，语气正式、结构清晰。',
        aiGenerating: false,
        aiResult: '',
        treeData: [
          {
            name: '环境文件',
            children: [
              {
                name: '国家政策',
                files: [
                  {
                    name: '习近平在广东考察时强调 深入学习宣传贯彻党的二十届四中全会精神 以全面深化改革开放推动高质量发展  广东省人民政府门户网站.pdf',
                    path: '/database/环境文件/国家政策/习近平在广东考察时强调 深入学习宣传贯彻党的二十届四中全会精神 以全面深化改革开放推动高质量发展  广东省人民政府门户网站.pdf'
                  },
                  {
                    name: '李强主持国务院第十七次专题学习  广东省人民政府门户网站.pdf',
                    path: '/database/环境文件/国家政策/李强主持国务院第十七次专题学习  广东省人民政府门户网站.pdf'
                  },
                  {
                    name: '李强主持召开国务院常务会议 研究进一步做好节能降碳工作等  广东省人民政府门户网站.pdf',
                    path: '/database/环境文件/国家政策/李强主持召开国务院常务会议 研究进一步做好节能降碳工作等  广东省人民政府门户网站.pdf'
                  }
                ]
              },
              {
                name: '地方行政',
                files: [
                  { name: '省委常委会召开会议认真学习贯彻习近平总书记重要讲话和中央经济工作会议精神.pdf', path: '/database/环境文件/地方行政/省委常委会召开会议认真学习贯彻习近平总书记重要讲话和中央经济工作会议精神.pdf' },
                  { name: '中共广东省委十三届七次全会召开.pdf', path: '/database/环境文件/地方行政/中共广东省委十三届七次全会召开.pdf' },
                  { name: '省委工作务虚会召开.pdf', path: '/database/环境文件/地方行政/省委工作务虚会召开.pdf' },
                  { name: '广州深圳及省委有关部委传达学习贯彻习近平总书记视察广东.pdf', path: '/database/环境文件/地方行政/广州深圳及省委有关部委传达学习贯彻习近平总书记视察广东.pdf' },
                  { name: '孟凡利主持召开省政府党组会议、常务会议.pdf', path: '/database/环境文件/地方行政/孟凡利主持召开省政府党组会议、常务会议.pdf' },
                  { name: '孟凡利主持召开省政府党组会议.pdf', path: '/database/环境文件/地方行政/孟凡利主持召开省政府党组会议.pdf' }
                ]
              },
              {
                name: '科技创新',
                files: [
                  { name: '中国科学院东莞材料科学与技术研究所成立 黄坤明侯建国出席成立大会并揭牌 孟凡利主持  广东省人民政府门户网站.pdf', path: '/database/环境文件/科技创新/中国科学院东莞材料科学与技术研究所成立 黄坤明侯建国出席成立大会并揭牌 孟凡利主持  广东省人民政府门户网站.pdf' }
                ]
              },
              {
                name: '对外交流与合作',
                files: [
                  { name: '2025年丝绸之路电视共同体高峰论坛在阳江举行 黄坤明慎海雄出席开幕式并启动论坛广东省人民政府门户网站.pdf', path: '/database/环境文件/对外交流与合作/2025年丝绸之路电视共同体高峰论坛在阳江举行 黄坤明慎海雄出席开幕式并启动论坛广东省人民政府门户网站.pdf' }
                ]
              }
            ]
          }
        ]
      }
    },
    computed: {
      panelHeight() {
        const h = parseInt(this.editorHeight.replace('px', ''), 10)
        const inner = Math.max(200, h - 160)
        return inner + 'px'
      },
      recommendations() {
        const base = [
          {
            name: '李强主持召开国务院常务会议（节能降碳工作）.pdf',
            reason: '该素材包含政策与节能降碳信息，有助于政策综述',
            path: '/database/环境文件/国家政策/李强主持召开国务院常务会议 研究进一步做好节能降碳工作等  广东省人民政府门户网站.pdf'
          },
          {
            name: '省委工作务虚会召开.pdf',
            reason: '该素材包含地方工作部署，适合区域政策分析',
            path: '/database/环境文件/地方行政/省委工作务虚会召开.pdf'
          },
          {
            name: '中国科学院东莞材料科学与技术研究所成立.pdf',
            reason: '该素材包含科技创新信息，利于技术章节撰写',
            path: '/database/环境文件/科技创新/中国科学院东莞材料科学与技术研究所成立 黄坤明侯建国出席成立大会并揭牌 孟凡利主持  广东省人民政府门户网站.pdf'
          },
          {
            name: '丝绸之路电视共同体高峰论坛.pdf',
            reason: '该素材包含对外合作信息，适合合作交流章节',
            path: '/database/环境文件/对外交流与合作/2025年丝绸之路电视共同体高峰论坛在阳江举行 黄坤明慎海雄出席开幕式并启动论坛广东省人民政府门户网站.pdf'
          }
        ]
        if (false) {
          return base
        }
        return base.slice(0, 3)
      }
    },
    methods: {
      handleBeforeUpload(file) {
        this.uploadList = [...this.uploadList, file]
        this.selectedFileName = file.name
        return false
      },
      triggerReco() {
        this.recoLoading = true
        setTimeout(() => {
          this.recoLoading = false
        }, 800)
      },
      toggleFolder(key) {
        const v = this.collapsed[key]
        this.$set(this.collapsed, key, !v)
      },
      isCollapsed(key) {
        return this.collapsed[key] !== false
      },
      toggleSelection(path, checked) {
        if (checked) {
          if (!this.selectedPaths.includes(path)) {
            this.selectedPaths.push(path)
          }
        } else {
          const index = this.selectedPaths.indexOf(path)
          if (index > -1) {
            this.selectedPaths.splice(index, 1)
          }
        }
      },
      previewFile(f) {
        this.selectedFileName = f.name
        this.previewFileUrl = encodeURI(f.path)
        this.previewVisible = true
      },
      openRec(item) {
        this.selectedFileName = item.name
        if (item.path) {
          this.previewFileUrl = encodeURI(item.path)
          this.previewVisible = true
        }
      },
      generateAI() {
        if (this.aiGenerating) return
        this.aiGenerating = true
        this.aiResult = ''
        setTimeout(() => {
          this.aiGenerating = false
          this.aiResult = `【AI生成内容】
为贯彻国家关于节能降碳的工作部署，各地持续完善政策体系与协同机制，推动重点行业工艺升级与设备更新，提升能源利用效率。围绕公共机构与工业企业两类主体，开展示范项目与绩效评价，形成可复制经验。结合区域产业结构与资源禀赋，建立数据监测与动态评估机制，强化过程管理与结果应用，助力实现经济发展与绿色转型协同提升。`
        }, 1000)
      },
      regenerate() {
        this.generateAI()
      },
      applyInsert() {
        if (!this.aiResult) {
          this.$message.warning('请先进行AI生成')
          return
        }
        this.$emit('insertText', this.aiResult)
      }
    },
    created() {
      const initialKeys = []
      this.treeData.forEach(f => {
        initialKeys.push(f.name)
        f.children.forEach(s => {
          initialKeys.push(f.name + '/' + s.name)
        })
      })
      const m = {}
      initialKeys.forEach(k => {
        m[k] = true
      })
      this.collapsed = m
      this.triggerReco()
    }
  }
  </script>
  
  <style lang="less" scoped>
  .file-select-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid #e8e8e8;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    color: #000;
  }
  .upload-area {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  .hint {
    font-size: 12px;
    color: #717682;
    margin-top: 8px;
  }
  .section {
    padding: 10px 12px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #000;
    margin-bottom: 8px;
  }
  .tree-root {
    overflow-y: auto;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fff;
  }
  .folder-header,
  .subfolder-header {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    cursor: pointer;
  }
  .folder-header:hover,
  .subfolder-header:hover {
    background: #f5f9ff;
  }
  .folder-name,
  .subfolder-name {
    font-size: 14px;
    color: #000;
  }
  .files {
    padding: 6px 12px 8px 28px;
  }
  .file-item {
    display: flex;
    align-items: center;
    padding: 6px 0;
    cursor: pointer;
  }
  .file-item:hover {
    background: #f6f6f6;
  }
  .single-line-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .flex-row-center {
    display: flex;
    align-items: center;
  }
  .flex-1 {
    flex: 1;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .recommendations {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fff;
    padding: 8px 10px;
  }
  .recommend-item {
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .recommend-item:last-of-type {
    border-bottom: none;
  }
  .rec-item-clickable {
    cursor: pointer;
  }
  .rec-item-clickable:hover {
    background: #f6faff;
  }
  .rec-name {
    font-size: 14px;
    font-weight: 600;
    color: #000;
  }
  .rec-reason {
    font-size: 12px;
    color: #717682;
    margin-top: 2px;
  }
  .preview-wrap {
    height: calc(70vh - 48px);
  }
  .preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .modal-footer {
    padding: 10px 12px;
    text-align: right;
    border-top: 1px solid #f0f0f0;
  }
  .ai-box {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fff;
    padding: 8px 10px;
  }
  .ai-actions {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ai-hint {
    font-size: 12px;
    color: #717682;
  }
  .ai-result {
    margin-top: 10px;
    border: 1px dashed #c7d7ff;
    background: #f6f9ff;
    border-radius: 4px;
    padding: 8px 10px;
  }
  .ai-result-title {
    font-size: 13px;
    font-weight: 600;
    color: #4a7ce2;
    margin-bottom: 6px;
  }
  .ai-result-text {
    font-size: 13px;
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  </style>
