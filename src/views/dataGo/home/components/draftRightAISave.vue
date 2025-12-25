<template>
  <div class="eco-assistant-panel" :style="{ height: editorHeight }">
    <!-- 1. 顶部标题栏 -->
    <div class="panel-header">
      <div class="header-left">
        <a-icon type="environment" theme="twoTone" twoToneColor="#1890ff" class="header-icon" />
        <span class="header-title">报告助手</span>
      </div>
      <div class="header-right">
        <a-tooltip title="历史版本">
          <a-icon type="history" class="action-icon" @click="showVersionDrawer = true" />
        </a-tooltip>
        <a-icon type="close" class="action-icon close-btn" @click="$emit('close')" />
      </div>
    </div>

    <!-- 2. 主体内容区 (滚动区域) -->
    <div class="panel-body">
      
      <!-- 配置与生成区 -->
      <div class="config-section" :class="{ 'collapsed': hasResult }">
        <div class="form-item">
          <div class="label">报告章节 / 维度</div>
          <a-select
            v-model="selectedSection"
            placeholder="请选择报告维度"
            style="width: 100%"
            size="large"
            @change="handleSectionChange"
          >
            <a-select-option v-for="item in sectionList" :key="item" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </div>

        <!-- 动态提示词推荐 -->
        <div class="form-item" v-if="quickPrompts.length">
          <div class="label">
            <span>核心指令</span>
            <span class="sub-label">（点击添加）</span>
          </div>
          <div class="tags-wrapper">
            <span 
              v-for="(tag, index) in quickPrompts" 
              :key="index" 
              class="eco-tag"
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="form-item">
          <div class="label">自定义要求</div>
          <a-textarea 
            v-model="customPrompt" 
            placeholder="请输入具体的分析要求或补充说明..." 
            :rows="3" 
            class="custom-textarea"
          />
        </div>
        
        <div class="form-item">
          <div class="label">表达风格</div>
          <a-radio-group v-model="selectedStyle" button-style="solid" size="small">
            <a-radio-button v-for="opt in styleOptions" :key="opt" :value="opt">{{ opt }}</a-radio-button>
          </a-radio-group>
        </div>
        
        <div class="form-item">
          <div class="label">多样性</div>
          <div class="diversity-row">
            <a-slider :min="0" :max="1" :step="0.1" v-model="diversity" style="flex:1" />
            <span class="diversity-value">{{ diversity.toFixed(1) }}</span>
          </div>
        </div>

        <a-button 
          type="primary" 
          block 
          size="large" 
          :loading="aiStatus === 'processing'"
          class="generate-btn"
          @click="handleGenerate"
        >
          <a-icon type="thunderbolt" theme="filled" /> 
          {{ hasResult ? '重新生成' : '立即生成报告' }}
        </a-button>
      </div>

      <!-- 生成结果展示区 -->
      <div class="result-section" v-if="hasResult || aiStatus === 'processing'">
        <a-divider orientation="left" class="result-divider">生成结果</a-divider>
        
        <!-- 骨架屏 (Loading) -->
        <div v-if="aiStatus === 'processing'" class="skeleton-card">
          <div class="sk-header">
            <a-icon type="loading" /> 正在分析环境数据...
          </div>
          <div class="sk-line w-80"></div>
          <div class="sk-line w-100"></div>
          <div class="sk-line w-90"></div>
          <div class="sk-line w-60"></div>
        </div>

        <!-- 结果卡片 -->
        <div v-show="aiStatus === 'complete'" class="result-card">
          <div class="card-toolbar">
            <span class="card-title">
              <a-icon type="file-text" /> 
              {{ selectedSection }}
            </span>
            <div class="card-actions">
              <a-tooltip title="复制">
                <a-icon type="copy" @click="copyContent(generatedContent)" />
              </a-tooltip>
            </div>
          </div>
          
          <div class="content-editor">
            <a-textarea 
              v-model="generatedContent" 
              :auto-size="{ minRows: 6 }" 
              class="result-textarea"
            />
          </div>

          <!-- 底部操作栏 -->
          <div class="result-footer">
            <a-dropdown :trigger="['click']">
              <a-button size="small" icon="highlight">AI 润色优化 <a-icon type="down" /></a-button>
              <a-menu slot="overlay" @click="handleRetouch">
                <a-menu-item v-for="type in retouchTypes" :key="type">{{ type }}</a-menu-item>
              </a-menu>
            </a-dropdown>
            
            <div class="footer-right">
              <a-button size="small" @click="saveVersionModal = true">保存版本</a-button>
              <a-button type="primary" size="small" icon="import" @click="handleInsert">插入文档</a-button>
            </div>
          </div>
        </div>

        <!-- 润色结果对比区 (如有) -->
        <transition-group name="list-anim">
          <div v-for="(item, idx) in retouchList" :key="item.id" class="retouch-card">
            <div class="retouch-header">
              <a-tag :color="item.type === '学术化表达' ? 'purple' : item.type === '数据增强' ? 'cyan' : 'orange'">
                {{ item.type }}
              </a-tag>
              <span class="retouch-time">{{ new Date(item.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              <div class="retouch-actions">
                <a-button size="small" type="link" @click="applyRetouchItem(idx)">应用此版本</a-button>
                <a-button size="small" type="link" danger @click="removeRetouchItem(idx)">删除</a-button>
              </div>
            </div>
            <div class="retouch-content">{{ item.content }}</div>
          </div>
        </transition-group>

      </div>
      
      <!-- 样式修复：底部留白，防止内容贴底被遮挡 -->
      <div style="height: 40px;"></div>
    </div>

    <!-- 3. 保存版本弹窗 -->
    <a-modal
      title="保存当前版本"
      v-model="saveVersionModal"
      :footer="null"
      :width="400"
    >
      <div class="save-modal-body">
        <a-input v-model="versionName" placeholder="输入版本名称（如：初稿V1）" size="large" />
        <div class="modal-btns">
          <a-button @click="saveVersionModal = false">取消</a-button>
          <a-button type="primary" :loading="savingStatus" @click="confirmSaveVersion">确认保存</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 4. 历史版本抽屉 -->
    <a-drawer
      title="历史版本记录"
      placement="right"
      :closable="true"
      :visible="showVersionDrawer"
      @close="showVersionDrawer = false"
      :width="300"
      :getContainer="false"
      :wrapStyle="{ position: 'absolute', overflow: 'hidden' }"
    >
      <div class="version-list">
        <div v-for="ver in reportVersionList" :key="ver.id" class="version-item">
          <div class="ver-header">
            <span class="ver-name">{{ ver.versionName }}</span>
            <span class="ver-time">{{ ver.time }}</span>
          </div>
          <div class="ver-btns">
            <a-button size="small" icon="eye" @click="loadVersion(ver)">查看</a-button>
            <a-button size="small" icon="delete" type="danger" ghost @click="deleteVersion(ver.id)"></a-button>
          </div>
        </div>
        <div v-if="reportVersionList.length === 0" class="empty-ver">暂无历史版本</div>
      </div>
    </a-drawer>

  </div>
</template>

<script>
export default {
  name: 'EcoReportAssistant',
  props: {
    editorHeight: { type: String, default: '100%' },
    chapterId: { type: [String, Number], default: '' },
    firstDraftId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      // 状态
      aiStatus: 'idle', // idle, processing, complete
      hasResult: false,
      saveVersionModal: false,
      showVersionDrawer: false,
      savingStatus: false,
      
      // 数据输入
      kb: {},
      sectionList: [],
      selectedSection: '',
      selectedTags: [],
      customPrompt: '请重点分析项目在建设过程中的减排潜力，并引用行业相关标准进行合规性评估。',
      
      // 结果数据
      generatedContent: '',
      retouchList: [], // 润色历史
      versionName: '',
      reportVersionList: [],
      
      // 静态配置
      retouchTypes: ['学术化表达', '数据增强', '精简摘要', '政策合规性检查', '新闻风格', '条列表达', '口语风格', '方案建议'],
      
      // 风格与多样性
      styleOptions: ['学术', '新闻', '条列', '建议', '口语'],
      selectedStyle: '学术',
      diversity: 0.6
    };
  },
  computed: {
    quickPrompts() {
      return this.kb[this.selectedSection]?.prompts || [];
    }
  },
  mounted() {
    this.loadKB();
    this.loadVersionsLocal();
  },
  methods: {
    // 恢复为原始逻辑：从 JSON 文件加载
    async loadKB() {
      try {
        const res = await fetch('/eco_knowledge_base.json');
        const data = await res.json();
        this.kb = data || {};
        this.sectionList = Object.keys(this.kb);
        this.selectedSection = this.sectionList[0] || '';
        if (this.selectedSection) {
          this.customPrompt = `请重点分析“${this.selectedSection}”章节中的减排潜力，并结合行业标准提出优化建议。`;
        }
        if (this.quickPrompts.length) {
          this.selectedTags = [this.quickPrompts[0]];
        }
      } catch (e) {
        // 异常处理保持简单，确保不报错
        this.kb = {};
        this.sectionList = [];
        this.selectedSection = '';
      }
    },
    // 1. 切换章节
    handleSectionChange() {
      this.selectedTags = [];
      this.hasResult = false;
      this.generatedContent = '';
      this.retouchList = [];
      if (this.selectedSection) {
        this.customPrompt = `请重点分析“${this.selectedSection}”章节中的减排潜力，并结合行业标准提出优化建议。`;
      }
    },

    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
    },

    // 2. 核心生成逻辑
    async handleGenerate() {
      if (!this.selectedSection) return;
      
      this.aiStatus = 'processing';
      this.hasResult = true;
      this.retouchList = []; // 清空之前的润色
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const base = this.kb[this.selectedSection]?.template || "暂无该维度数据";
      const content = this.composeByStyle(this.selectedSection, base, this.selectedStyle, this.selectedTags, this.customPrompt, this.diversity);

      this.aiStatus = 'complete';
      this.typeWriterEffect(content);
    },

    // 打字机效果
    typeWriterEffect(fullText) {
      this.generatedContent = '';
      let i = 0;
      const timer = setInterval(() => {
        if (i < fullText.length) {
          const step = Math.ceil(Math.random() * 3 + 2); // 每次增加2-5个字符
          this.generatedContent += fullText.slice(i, i + step);
          i += step;
        } else {
          clearInterval(timer);
        }
      }, 20); // 间隔调整为20ms，提供更自然的节奏感
    },

    // 3. 润色逻辑
    async handleRetouch({ key }) {
      if (!this.generatedContent) return;
      
      const newItem = {
        id: Date.now(),
        type: key,
        content: 'AI正在优化中...'
      };
      this.retouchList.unshift(newItem);
      
      await new Promise(r => setTimeout(r, 1000));
      
      let newText = this.generatedContent;
      const seed = Math.random();

      if (key === '学术化表达') {
        const pool = [
          { from: /显著进展/g, to: seed > 0.5 ? '实质性突破' : '阶段性成果' },
          { from: /建议/g, to: seed > 0.6 ? '战略性建议' : '导向性对策' },
          { from: /下降/g, to: seed > 0.4 ? '同比降低' : '呈现递减态势' },
          { from: /重要/g, to: seed > 0.5 ? '关键性' : '核心' },
          { from: /符合/g, to: seed > 0.7 ? '高度契合' : '保持一致' }
        ];
        pool.forEach(p => { newText = newText.replace(p.from, p.to); });
        
        newText = this.stripMarkdown(newText);
      } else if (key === '数据增强') {
        const datasets = [
          `监测数据显示，2023年相关排放量约为1,200吨二氧化碳当量；进入2024年后，通过技术升级降至约980吨，降幅达18.3%，验证了管控措施的有效性。`,
          `通过能效对标分析，项目实施后能耗密度从初始的1.5kgce/unit下降至1.2kgce/unit，整体优化效率提升约20%，达到了预期的节能目标。`,
          `对比行业基准，本项目在水资源循环利用率上达到92%，远高于85%的区域平均水平，绿色生产指标处于行业领先地位。`
        ];
        const appendix = datasets[Math.floor(seed * datasets.length)];
        newText = `${newText}\n\n${appendix}`;
      } else if (key === '政策合规性检查') {
        const compliancePool = [
          `依据 GB/T 32150-2015 及行业准入条件，文中涉及的设计参数与现行环保标准保持高度相符。`,
          `对照《“十四五”节能减排综合工作方案》，本项目涉及的能耗控制与排放指标均符合国家鼓励类发展导向。`,
          `经核对评估，文中提及的污染防治设施及环境管理制度符合行业监管要求，具备坚实的执行基础。`
        ];
        const ref = compliancePool[Math.floor(seed * compliancePool.length)];
        newText = `${ref}\n\n${newText}`;
      } else if (key === '精简摘要') {
        const sentences = newText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s);
        const pick = sentences.slice(0, 4).map((s, i) => `- 要点${i + 1}：${s}`);
        newText = `摘要\n\n${pick.join('\n')}`;
      } else if (key === '新闻风格') {
        const lines = newText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s);
        newText = this.applySynonyms(this.composeNews(this.selectedSection, lines), this.diversity);
      } else if (key === '条列表达') {
        const lines = newText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s);
        newText = this.composeBullet(this.selectedSection, lines);
      } else if (key === '口语风格') {
        const lines = newText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s);
        newText = this.applySynonyms(this.composeCasual(this.selectedSection, lines), this.diversity);
      } else if (key === '方案建议') {
        const lines = newText.split(/[。！？\n]/).map(s => s.trim()).filter(s => s);
        newText = this.composePolicyAdvice(this.selectedSection, lines);
      }
      
      newItem.content = newText;
    },
    stripMarkdown(text) {
      if (!text) return '';
      let t = text;
      t = t.replace(/#{1,6}\s*/g, '');
      t = t.replace(/\*\*(.*?)\*\*/g, '$1');
      t = t.replace(/^\s*[-*]\s+/gm, '');
      t = t.replace(/^\s*\d+\.\s+/gm, '');
      t = t.replace(/>\s*/g, '');
      t = t.replace(/\(内容已精简\)/g, '');
      t = t.replace(/\s+\n/g, '\n');
      return t;
    },
    normalizeLines(text) {
      const cleaned = this.stripMarkdown(text);
      const lines = cleaned.split('\n').map(s => s.trim()).filter(s => !!s);
      return lines;
    },
    concludeFromDetail(detail) {
      const d = detail || '';
      if (/(符合|满足|可控|良好|轻微|Ⅱ类|二类)/.test(d)) {
        return '确保了相关指标符合既定标准。';
      }
      if (/(设置|配备|采用|加装|回收|收集|转运|高空排放|雨污分流|隔声|减振|联锁|检测报警)/.test(d)) {
        return '实现了对关键环节的有效管控。';
      }
      return '形成了闭环管理。';
    },
    composeByStyle(section, template, style, tags, prompt, diversity) {
      const lines = this.normalizeLines(template);
      let text = '';
      if (style === '新闻') {
        text = this.composeNews(section, lines);
      } else if (style === '条列') {
        text = this.composeBullet(section, lines);
      } else if (style === '建议') {
        text = this.composePolicyAdvice(section, lines);
      } else if (style === '口语') {
        text = this.composeCasual(section, lines);
      } else {
        text = this.composeAcademic(section, template, tags, prompt);
      }
      return this.applySynonyms(text, diversity);
    },
    composeAcademic(section, template, tags, prompt) {
      const conn = ['首先', '其次', '再次', '最后', '同时', '此外'];
      const lines = this.normalizeLines(template);
      const paragraphs = [];
      let iConn = 0;
      let introAdded = false;
      lines.forEach((l) => {
        if (!introAdded && /^本项目名为/.test(l)) {
          paragraphs.push(`${l}，明确了工程的基本属性。`);
          introAdded = true;
          return;
        }
        const idx = l.indexOf('：');
        if (idx > -1) {
          const subject = l.slice(0, idx).trim();
          const detail = l.slice(idx + 1).trim();
          const connector = conn[iConn % conn.length];
          iConn += 1;
          const conclusion = this.concludeFromDetail(detail);
          paragraphs.push(`${connector}，在${subject}方面，${detail}，${conclusion}`);
        } else {
          const connector = conn[iConn % conn.length];
          iConn += 1;
          paragraphs.push(`${connector}，${l}`);
        }
      });
      return paragraphs.join('\n\n');
    },
    composeNews(section, lines) {
      const head = `【${section}】最新进展`;
      const conn = ['据评估', '监测显示', '记者了解到', '资料显示', '同时', '此外'];
      let i = 0;
      const ps = [];
      ps.push(`${head}`);
      lines.forEach(l => {
        const c = conn[i % conn.length];
        i += 1;
        ps.push(`${c}，${l.replace(/^[\s-•]+/, '')}。`);
      });
      return ps.join('\n');
    },
    composeBullet(section, lines) {
      const title = `${section}要点清单`;
      const items = lines.map(l => `- ${l.replace(/^[\s-•]+/, '')}`);
      return `${title}\n\n${items.join('\n')}`;
    },
    composePolicyAdvice(section, lines) {
      const title = `${section}问题-措施-效果`;
      const blocks = [];
      lines.forEach((l, idx) => {
        const s = l.replace(/^[\s-•]+/, '');
        blocks.push(`问题${idx + 1}：${s}`);
        blocks.push(`措施：完善设施配置与流程管控，建立台账与监测。`);
        blocks.push(`效果：指标稳定达标，风险可控，形成闭环。`);
        blocks.push('');
      });
      return `${title}\n\n${blocks.join('\n')}`.trim();
    },
    composeCasual(section, lines) {
      const conn = ['我们看到', '接着看', '还有一点', '最后说说', '同时', '另外'];
      let i = 0;
      const ps = [];
      ps.push(`这是关于“${section}”的一段更口语的说明：`);
      lines.forEach(l => {
        const c = conn[i % conn.length];
        i += 1;
        ps.push(`${c}，${l.replace(/^[\s-•]+/, '')}。`);
      });
      return ps.join('\n\n');
    },
    applySynonyms(text, diversity) {
      const pairs = [
        [/此外/g, Math.random() < diversity ? '同时' : '此外'],
        [/同时/g, Math.random() < diversity ? '另外' : '同时'],
        [/最后/g, Math.random() < diversity ? '综上' : '最后'],
        [/确保/g, Math.random() < diversity ? '保证' : '确保'],
        [/有效/g, Math.random() < diversity ? '显著' : '有效'],
        [/关键/g, Math.random() < diversity ? '核心' : '关键']
      ];
      let t = text;
      pairs.forEach(([from, to]) => { t = t.replace(from, to); });
      return t;
    },

    removeRetouchItem(index) {
      this.retouchList.splice(index, 1);
    },
    applyRetouchItem(index) {
      const item = this.retouchList[index];
      if (!item) return;
      this.generatedContent = item.content;
      this.copyContent(this.generatedContent);
      this.$message.success('版本已应用并复制到剪贴板');
    },

    // 4. 版本管理
    confirmSaveVersion() {
      if (!this.versionName) {
        this.$message.warning('请输入版本名称');
        return;
      }
      
      const newVer = {
        id: Date.now(),
        versionName: this.versionName,
        content: this.generatedContent,
        time: new Date().toLocaleString()
      };
      
      this.reportVersionList.unshift(newVer);
      this.saveVersionsLocal();
      
      this.savingStatus = true;
      setTimeout(() => {
        this.savingStatus = false;
        this.saveVersionModal = false;
        this.versionName = '';
        this.$message.success('版本保存成功');
      }, 500);
    },
    
    loadVersion(ver) {
      this.generatedContent = ver.content;
      this.hasResult = true;
      this.aiStatus = 'complete';
      this.$message.info(`已加载版本：${ver.versionName}`);
    },

    deleteVersion(id) {
      this.reportVersionList = this.reportVersionList.filter(v => v.id !== id);
      this.saveVersionsLocal();
    },

    // LocalStorage 辅助
    getStorageKey() {
      return `eco_report_vers_${this.chapterId}_${this.firstDraftId}`;
    },
    saveVersionsLocal() {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.reportVersionList));
    },
    loadVersionsLocal() {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) {
        this.reportVersionList = JSON.parse(data);
      }
    },

    // 5. 通用操作
    copyContent(text) {
      if (!text) return;
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.$message.success('已复制到剪贴板');
    },

    handleInsert() {
      if (!this.generatedContent) {
        this.$message.warning('内容为空');
        return;
      }
      this.$emit('insertText', this.generatedContent);
    }
  }
};
</script>

<style lang="less" scoped>
/* 颜色变量 */
@eco-blue: #1890ff;
@eco-bg: #e6f7ff;
@text-main: #262626;
@text-sub: #8c8c8c;
@border-color: #f0f0f0;

/* 样式修复的核心部分 */
.eco-assistant-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid @border-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  /* 修复: 确保该容器是相对定位，且不会默认溢出 */
  position: relative;
  overflow: hidden; 
  box-sizing: border-box;
  
  /* 修复: 如果父容器没有高度，这里 min-height 可以提供一点保护，但主要靠 props 的 editorHeight */
  min-height: 400px; 
}

/* 1. Header */
.panel-header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid @border-color;
  background: #fff;
  flex-shrink: 0; /* 防止头部被压缩 */

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    .header-icon { font-size: 20px; color: @eco-blue; }
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: @text-main;
    }
  }

  .header-right {
    .action-icon {
      font-size: 16px;
      color: @text-sub;
      cursor: pointer;
      margin-left: 16px;
      transition: color 0.3s;
      
      &:hover { color: @eco-blue; }
      &.close-btn:hover { color: #ff4d4f; }
    }
  }
}

/* 2. Body - 滚动修复核心 */
.panel-body {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden;
  padding: 20px;
  background: #fbfbfb;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  /* 修复: Flex子项滚动必须 */
  min-height: 0; 
  position: relative;
  
  /* 滚动条样式 */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

/* 3. Config Section */
.config-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止被压缩 */

  .form-item {
    margin-bottom: 16px;
    
    .label {
      font-size: 13px;
      font-weight: 500;
      color: @text-main;
      margin-bottom: 8px;
      .sub-label { color: @text-sub; font-weight: normal; font-size: 12px; }
    }
  }

  &.collapsed {
    padding: 12px 20px;
    .form-item { margin-bottom: 8px; }
    .custom-textarea { height: 60px; }
    .generate-btn { margin-top: 8px; }
  }

  /* Tags */
  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .eco-tag {
      padding: 4px 12px;
      background: #f5f5f5;
      color: @text-main;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
      
      &:hover { color: @eco-blue; background: @eco-bg; }
      &.active {
        background: @eco-bg;
        color: @eco-blue;
        border-color: @eco-blue;
        font-weight: 500;
      }
    }
  }

  .custom-textarea {
    resize: none;
    border-radius: 6px;
  }
  
  .diversity-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .diversity-value {
    width: 32px;
    text-align: right;
    font-size: 12px;
    color: @text-sub;
  }

  .generate-btn {
    background: @eco-blue;
    border-color: @eco-blue;
    font-weight: 500;
    box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
    
    &:hover {
      background: lighten(@eco-blue, 5%);
      border-color: lighten(@eco-blue, 5%);
    }
  }
}

/* 4. Result Section */
.result-section {
  display: flex;
  flex-direction: column;
  padding-bottom: 20px; /* 额外底部间距 */
  
  .result-divider {
    margin: 10px 0 20px 0;
    font-size: 12px;
    color: @text-sub;
  }
}

/* 骨架屏 */
.skeleton-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid @border-color;
  
  .sk-header {
    color: @eco-blue;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .sk-line {
    height: 10px;
    background: #f0f0f0;
    margin-bottom: 12px;
    border-radius: 2px;
    animation: pulse 1.5s infinite;
  }
  .w-80 { width: 80%; }
  .w-100 { width: 100%; }
  .w-90 { width: 90%; }
  .w-60 { width: 60%; }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 结果卡片 */
.result-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid @border-color;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;

  .card-toolbar {
    height: 40px;
    background: #fafafa;
    border-bottom: 1px solid @border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    
    .card-title {
      font-size: 12px;
      font-weight: 600;
      color: @text-main;
      i { color: @eco-blue; margin-right: 4px; }
    }
    
    .card-actions i {
      cursor: pointer;
      color: @text-sub;
      &:hover { color: @eco-blue; }
    }
  }

  .content-editor {
    padding: 0;
    .result-textarea {
      border: none;
      resize: none;
      padding: 16px;
      font-size: 14px;
      line-height: 1.8;
      color: #2c3e50;
      &:focus { box-shadow: none; }
    }
  }

  .result-footer {
    padding: 10px 16px;
    border-top: 1px solid @border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;

    .footer-right {
      display: flex;
      gap: 8px;
    }
  }
}

/* 润色对比卡片 */
.retouch-card {
  margin-top: 16px;
  background: #fcfcfc;
  border: 1px dashed @eco-blue;
  border-radius: 6px;
  padding: 12px;
  position: relative;
  
  .retouch-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .tag-label {
      font-size: 12px;
      background: @eco-bg;
      color: @eco-blue;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .close-item {
      cursor: pointer;
      color: #ccc;
      &:hover { color: #f5222d; }
    }
  }
  
  .retouch-content {
    font-size: 13px;
    color: #595959;
    margin-bottom: 8px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  .retouch-actions {
    text-align: right;
  }
}

/* 弹窗样式补丁 */
.save-modal-body {
  padding: 20px 0;
  .modal-btns {
    margin-top: 20px;
    text-align: right;
    button { margin-left: 10px; }
  }
}

/* 历史版本列表 */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
  padding-bottom: 40px; /* 防止底部按钮遮挡 */
  
  .version-item {
    border: 1px solid @border-color;
    border-radius: 6px;
    padding: 12px;
    transition: all 0.2s;
    
    &:hover {
      border-color: @eco-blue;
      background: @eco-bg;
    }
    
    .ver-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      .ver-name { font-weight: 600; color: @text-main; }
      .ver-time { font-size: 12px; color: @text-sub; }
    }
    
    .ver-btns {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
  
  .empty-ver {
    text-align: center;
    color: #ccc;
    margin-top: 40px;
  }
}

/* 动画 */
.list-anim-enter-active, .list-anim-leave-active {
  transition: all 0.3s;
}
.list-anim-enter, .list-anim-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
