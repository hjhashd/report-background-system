<template>
  <div class="eco-assistant-panel" :style="{ height: editorHeight }">
    <!-- 1. 顶部标题栏 (参考 AISave 设计) -->
    <div class="panel-header">
      <div class="header-left">
        <a-icon type="thunderbolt" theme="twoTone" twoToneColor="#1890ff" class="header-icon" />
        <span class="header-title">智能搜索助手</span>
      </div>
      <div class="header-right">
        <a-icon type="close" class="action-icon close-btn" @click="$emit('close')" />
      </div>
    </div>

    <div class="panel-body">
      <!-- 2. 统一输入与操作区域 -->
      <div class="operation-area">
        <div class="input-wrapper">
          <a-textarea 
            v-model="inputQuery" 
            placeholder="输入关键词搜索，或输入内容进行总结/润色..." 
            :auto-size="{ minRows: 3, maxRows: 6 }"
            class="custom-textarea"
          />
          <div class="recommend-tags">
            <span 
              v-for="tag in recommendTags" 
              :key="tag" 
              class="tag" 
              @click="inputQuery = tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="action-bar">
          <div class="action-left">
            <!-- 顶部不再需要全局回撤，改为卡片内回退 -->
          </div>
          <div class="action-right">
            <a-button 
              type="primary" 
              size="small"
              :loading="isProcessing && currentMode === 'search' && !processingId"
              @click="handleExecute('search')"
            >
              <a-icon type="search" />智能搜索
            </a-button>
          </div>
        </div>
      </div>

      <!-- 3. 结果展示区域 -->
      <div class="results-container" ref="resultsContainer">
        
        <!-- 历史结果列表 -->
        <transition-group name="slide-fade">
          <div 
            v-for="(item, index) in resultList" 
            :key="item.id" 
            class="result-card"
          >
            <!-- 卡片头部：功能标识 -->
            <div class="card-header">
              <div class="header-left">
                <a-tag :color="getTagColor(item.type)">{{ getTagName(item.type) }}</a-tag>
                <span class="timestamp">{{ item.time }}</span>
              </div>
              <div class="header-right">
                <a-tooltip title="复制内容">
                  <a-icon type="copy" class="action-icon" @click="copyText(item.content)" />
                </a-tooltip>
                <a-tooltip title="删除">
                  <a-icon type="delete" class="action-icon" @click="deleteItem(index)" />
                </a-tooltip>
              </div>
            </div>

            <!-- 卡片内容：Markdown渲染 -->
            <div class="card-content markdown-style">
              <!-- 标题 (如果是搜索模式) -->
              <div v-if="item.title" class="content-title">{{ item.title }}</div>
              <!-- 正文 -->
              <div v-html="renderMarkdown(item.content)"></div>
            </div>

            <!-- 卡片底部：操作按钮 -->
            <div class="card-footer">
              <div class="footer-left">
                <template v-if="!isProcessing || processingId !== item.id">
                  <a-button 
                    v-if="item.history && item.history.length > 0"
                    size="small" 
                    icon="rollback" 
                    class="action-btn"
                    @click="handleCardRollback(item)"
                  >
                    返回
                  </a-button>
                  <a-button 
                    size="small" 
                    icon="file-text" 
                    class="action-btn"
                    @click="handleCardAction(item, 'summary')"
                  >
                    总结
                  </a-button>
                  <a-button 
                    size="small" 
                    icon="highlight" 
                    class="action-btn"
                    @click="handleCardAction(item, 'polish')"
                  >
                    润色
                  </a-button>
                </template>
                <span v-else class="processing-text">
                  <a-icon type="loading" /> AI 正在处理...
                </span>
              </div>
              <div class="footer-right">
                <a-button size="small" type="link" icon="import" @click="$emit('insertText', item.content)">
                  插入到光标位置
                </a-button>
              </div>
            </div>
          </div>
        </transition-group>
        
        <!-- 空状态 -->
        <div v-if="resultList.length === 0 && !isProcessing" class="empty-state">
          <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" alt="empty" />
          <p>AI 文档助手就绪<br>请在上方输入指令</p>
        </div>
      </div>

      <!-- 防止底部遮挡 -->
      <div class="bottom-spacer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DraftRightAISearch',
  props: {
    editorHeight: { type: String, default: '600px' }
  },
  data() {
    return {
      currentMode: 'search', // search, summary, polish
      inputQuery: '',
      isProcessing: false,
      processingId: null, // 当前正在处理的卡片ID
      resultList: [],
      kb: {},
      recommendTags: [],
      // 计时器
      timer: null
    };
  },
  mounted() {
    this.loadKB();
  },
  methods: {
    async loadKB() {
      try {
        const res = await fetch('/eco_knowledge_base.json');
        const data = await res.json();
        this.kb = data || {};
        this.buildRecommendTags();
      } catch (e) {
        this.kb = {};
        this.recommendTags = ['碳达峰路径', '绿色供应链', 'ESG评级标准', '循环经济'];
      }
    },
    buildRecommendTags() {
      const tags = [];
      Object.keys(this.kb).forEach(k => {
        const ps = this.kb[k]?.prompts || [];
        ps.forEach(p => tags.push(p));
      });
      const uniq = Array.from(new Set(tags));
      const pick = [];
      while (pick.length < Math.min(4, uniq.length)) {
        const t = uniq[Math.floor(Math.random() * uniq.length)];
        if (!pick.includes(t)) pick.push(t);
      }
      this.recommendTags = pick.length ? pick : ['碳达峰路径', '绿色供应链', 'ESG评级标准', '循环经济'];
    },
    
    // 统一执行入口 (顶部搜索框触发)
    async handleExecute(mode) {
      this.currentMode = mode;
      
      let targetText = this.inputQuery.trim();
      if (!targetText && (mode === 'summary' || mode === 'polish')) {
        const lastResult = this.resultList[0];
        if (lastResult) {
          targetText = lastResult.content;
          this.$message.info(`已自动获取上一步生成的内容进行${mode === 'summary' ? '总结' : '润色'}`);
        }
      }

      if (!targetText) {
        return this.$message.warning(mode === 'search' ? '请输入搜索关键词' : '请输入或先生成需要处理的文本');
      }

      this.isProcessing = true;
      this.processingId = null; // 顶部触发，表示新建卡片
      
      const content = this.generateContent(mode, targetText);
      await this.streamOutput(content, mode);
    },

    // 卡片内部操作入口 (总结/润色)
    async handleCardAction(item, mode) {
      if (this.isProcessing) return;
      
      this.currentMode = mode;
      this.isProcessing = true;
      this.processingId = item.id;

      // 保存当前内容到历史记录
      if (!item.history) {
        this.$set(item, 'history', []);
      }
      item.history.push({
        content: item.content,
        type: item.type,
        title: item.title
      });

      const content = this.generateContent(mode, item.content);
      
      // 更新卡片类型和标题 (可选，根据需求决定是否要在润色时改标题)
      item.type = mode;
      if (content.title) item.title = content.title;
      
      await this.streamOutput(content, mode, item);
    },

    // 卡片内容回撤
    handleCardRollback(item) {
      if (!item.history || item.history.length === 0) return;
      
      const lastVersion = item.history.pop();
      item.content = lastVersion.content;
      item.type = lastVersion.type;
      item.title = lastVersion.title;
      
      this.$message.success('已恢复到上一个版本');
    },

    generateContent(mode, text) {
      if (mode === 'search') {
        return this.performSearch(text);
      } else if (mode === 'summary') {
        return {
          title: '内容总结',
          text: this.summaryFromText(text)
        };
      } else {
        return {
          title: '润色建议',
          text: this.polishText(text)
        };
      }
    },
    performSearch(query) {
      const keys = Object.keys(this.kb);
      const scored = keys.map(k => {
        const t = this.kb[k]?.template || '';
        const p = this.kb[k]?.prompts || [];
        return { key: k, score: this.scoreText(query, t, p) };
      }).sort((a, b) => b.score - a.score);
      const top = scored.slice(0, Math.min(2, scored.length)).map(s => s.key);
      const title = `检索结果：${query}`;
      const text = this.assembleSearchReport(query, top);
      return { title, text };
    },
    scoreText(query, text, prompts) {
      if (!query) return 0;
      const q = query.trim();
      let score = 0;
      for (let i = 0; i < q.length; i++) {
        const ch = q[i];
        if (text.includes(ch)) score += 1;
      }
      prompts.forEach(p => {
        if (q.includes(p) || text.includes(p)) score += 3;
      });
      if (text.includes(q)) score += 5;
      return score;
    },
    stripMarkdown(text) {
      if (!text) return '';
      let t = text;
      t = t.replace(/#{1,6}\s*/g, '');
      t = t.replace(/\*\*(.*?)\*\*/g, '$1');
      t = t.replace(/^\s*[-*]\s+/gm, '');
      t = t.replace(/^\s*\d+\.\s+/gm, '');
      t = t.replace(/>\s*/g, '');
      t = t.replace(/\s+\n/g, '\n');
      return t;
    },
    normalizeLines(text) {
      const cleaned = this.stripMarkdown(text);
      const lines = cleaned.split('\n').map(s => s.trim()).filter(s => !!s);
      return lines;
    },
    chooseThemes(text) {
      const cues = [];
      Object.keys(this.kb).forEach(k => {
        const ps = this.kb[k]?.prompts || [];
        ps.forEach(p => {
          if (text && text.includes(p)) cues.push(p);
        });
      });
      return Array.from(new Set(cues)).slice(0, 3);
    },
    useConnectors(arr) {
      const conn = ['一方面', '另一方面', '同时', '总体来看'];
      if (!arr || !arr.length) return '';
      return arr.slice(0, 4).map((s, i) => `${conn[i % conn.length]}${s.endsWith('。') ? s : `${s}。`}`).join('');
    },
    concludeFromText(text) {
      if (/(符合|满足|可控|良好|轻微|Ⅱ类|二类)/.test(text)) return '结论为影响可控且与相关标准相符。';
      return '结论为措施完整、路径清晰，具备实施可行性。';
    },
    assembleSearchReport(query, topKeys) {
      const toPlain = (text) => {
        return text
          .replace(/#{1,6}\s*/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/^\s*[-*]\s+/gm, '')
          .replace(/^\s*\d+\.\s+/gm, '')
          .replace(/\(内容已精简\)/g, '')
      };
      const conn = ['首先', '其次', '再次', '最后'];
      const intro = `针对“${query}”的检索结果显示，主要涉及${topKeys.join('与')}等方面，现将核心内容整理如下。`;
      const paras = [intro];
      let iConn = 0;
      topKeys.forEach(k => {
        const section = this.kb[k];
        if (!section) return;
        let t = toPlain(section.template || '');
        if (t.length > 600) t = t.slice(0, 600);
        const lines = t.split('\n').map(s => s.trim()).filter(s => !!s);
        const connector = conn[iConn % conn.length];
        iConn += 1;
        if (lines.length) {
          const firstLine = lines[0];
          const rest = lines.slice(1);
          paras.push(`${connector}在${k}方面，${firstLine}。`);
          rest.forEach(l => {
            const idx = l.indexOf('：');
            if (idx > -1) {
              const subject = l.slice(0, idx).trim();
              const detail = l.slice(idx + 1).trim();
              paras.push(`在${subject}方面，${detail}。`);
            } else {
              paras.push(l.endsWith('。') ? l : `${l}。`);
            }
          });
        }
      });
      return paras.join('\n\n');
    },
    summaryFromText(text) {
      const lines = this.normalizeLines(text || '');
      const themes = this.chooseThemes(text || '');
      
      const head = themes.length ? `本文主要涉及${themes.join('、')}等内容，涵盖了项目背景、生产工艺及环境影响。` : '内容主要围绕项目背景、工艺流程与环境影响展开。';
      const core = lines.length ? lines[0].replace(/。+$/, '。') : '核心信息明确，主要围绕工程建设要点。';
      const details = lines.filter(l => /(\d|万吨|m³|t\/a|mg\/L|dB|Ⅱ类|二类|符合|满足|加注|BOG|放散|污水|噪声|风险|泄漏)/.test(l)).slice(0, 4);
      const merged = this.useConnectors(details.length ? details : lines.slice(1, 5));
      const tail = this.concludeFromText(text || '');

      // 增加总结的专业辨识度
      return `【内容摘要】\n${head}\n\n【关键要点】\n1. ${core}\n2. ${merged}\n\n【评估结论】\n${tail}`;
    },
    polishText(text) {
      let t = this.stripMarkdown(text || '');
      const seed = Math.random();
      
      // 词库随机化
      const rules = [
        [/越来越/g, seed > 0.5 ? '日益' : '持续'],
        [/很/g, seed > 0.6 ? '较为' : '相对'],
        [/重要/g, seed > 0.4 ? '关键' : '核心'],
        [/控制/g, seed > 0.7 ? '管控' : '约束'],
        [/处理/g, seed > 0.5 ? '处置' : '治理'],
        [/分析/g, seed > 0.3 ? '研判' : '剖析']
      ];
      rules.forEach(([a, b]) => { t = t.replace(a, b); });

      const lines = this.normalizeLines(t).slice(0, 8);
      
      // 结构随机化：有时保留连接词，有时直接组合
      let joined = '';
      if (seed > 0.5) {
        joined = lines.map(s => s.endsWith('。') ? s : `${s}。`).join('');
      } else {
        const conn = ['此外，', '另一方面，', '由此可见，', '综上所述，'];
        joined = lines.map((s, i) => {
          const prefix = i > 0 && i < conn.length ? conn[i] : '';
          return `${prefix}${s.endsWith('。') ? s : `${s}。`}`;
        }).join('');
      }

      return joined;
    },
    applyVariations(text) {
      const variants = [
        [/建议/g, '建议与措施'],
        [/分析/g, '解析'],
        [/处理/g, '处置'],
        [/控制/g, '管控']
      ];
      let t = text;
      variants.forEach(([a, b]) => {
        if (Math.random() > 0.5) t = t.replace(a, b);
      });
      return t;
    },

    // 模拟流式输出
    async streamOutput(resultData, mode, existingItem = null) {
      let targetItem;
      
      if (existingItem) {
        // 更新现有卡片
        targetItem = existingItem;
        targetItem.content = ''; // 清空内容准备打字
      } else {
        // 新建卡片
        targetItem = {
          id: Date.now(),
          type: mode,
          title: resultData.title,
          content: '',
          history: [],
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        this.resultList.unshift(targetItem);
      }
      
      this.isProcessing = false; // 停止 Loading 状态
      
      const fullText = resultData.text;
      let i = 0;
      
      return new Promise((resolve) => {
        this.timer = setInterval(() => {
          if (i < fullText.length) {
            const step = Math.ceil(Math.random() * 3 + 2);
            targetItem.content += fullText.slice(i, i + step);
            i += step;
          } else {
            clearInterval(this.timer);
            this.processingId = null; // 清除处理中的ID
            resolve();
          }
        }, 20);
      });
    },

    // 工具类方法
    getTagColor(type) {
      const map = { search: 'blue', summary: 'orange', polish: 'green' };
      return map[type] || 'default';
    },
    
    getTagName(type) {
      const map = { search: 'AI搜索', summary: '内容总结', polish: '智能润色' };
      return map[type] || '未知';
    },

    renderMarkdown(text) {
      if (!text) return '';
      const plain = text
        .replace(/#{1,6}\s*/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/^\s*[-*]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '');
      return plain.replace(/\n/g, '<br>');
    },

    copyText(text) {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.$message.success('已复制到剪贴板');
    },

    deleteItem(index) {
      this.resultList.splice(index, 1);
    }
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
};
</script>

<style lang="less" scoped>
/* 整体布局变量 */
@primary-color: #1890ff;
@text-main: #333;
@text-sub: #666;
@bg-base: #f7f9fc;
@border-color: #e8eaec;

.eco-assistant-panel {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 1px solid @border-color;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  height: 100%;
  position: relative;
  box-sizing: border-box;
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 20px; /* 基础边距 */
}

.bottom-spacer {
  height: 120px; /* 增加高度，确保内容能滚上去 */
  flex-shrink: 0;
}

/* 1. 顶部 Header 样式 */
.panel-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid @border-color;
  background: #fff;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    .header-icon { font-size: 18px; }
    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: @text-main;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    .action-icon {
      font-size: 16px;
      color: @text-sub;
      cursor: pointer;
      transition: color 0.3s;
      &:hover { color: @primary-color; }
      &.close-btn:hover { color: #ff4d4f; }
    }
  }
}

/* 2. 操作区域样式 */
.operation-area {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid @border-color;
  flex-shrink: 0;

  .input-wrapper {
    margin-bottom: 12px;
    position: relative;
  }

  .recommend-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .tag {
      background: #f5f7fa;
      color: @text-sub;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #eee;
      transition: all 0.2s;
      
      &:hover {
        background: #e6f7ff;
        color: @primary-color;
        border-color: @primary-color;
      }
    }
  }

  .custom-textarea {
    resize: none;
    border-radius: 6px;
    padding: 10px;
    background: #fcfcfc;
    border: 1px solid @border-color;
    transition: all 0.3s;
    &:focus {
      background: #fff;
      border-color: @primary-color;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .action-right {
      .ant-btn {
        font-size: 12px;
      }
    }
    .action-left {
      .ant-btn {
        font-size: 12px;
        color: @text-sub;
        &:hover {
          color: @primary-color;
        }
      }
    }
  }
}

/* 3. 结果容器样式 */
.results-container {
  background: @bg-base;
  padding: 20px 20px 40px 20px; /* 增加底部内边距 */
  position: relative;
}

/* 结果卡片样式 (模拟文档块) */
.result-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  border: 1px solid @border-color;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;

    .header-left {
      display: flex;
      align-items: center;
      .timestamp {
        font-size: 12px;
        color: #999;
        margin-left: 10px;
      }
    }

    .action-icon {
      color: #999;
      cursor: pointer;
      margin-left: 12px;
      font-size: 14px;
      &:hover { color: @primary-color; }
    }
  }

  .card-content {
    padding: 16px;
    font-size: 14px;
    line-height: 1.8;
    color: @text-main;
    min-height: 60px;

    .content-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
  }

  .card-footer {
    padding: 8px 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;

    .footer-left {
      display: flex;
      gap: 8px;
      align-items: center;

      .action-btn {
        font-size: 12px;
        color: @text-sub;
        &:hover {
          color: @primary-color;
          border-color: @primary-color;
        }
      }

      .processing-text {
        font-size: 12px;
        color: @primary-color;
      }
    }

    .footer-right {
      .ant-btn {
        padding: 0;
        height: auto;
      }
    }
  }
}

/* 骨架屏动画 */
.processing-card {
  .card-header {
    color: @primary-color;
    font-weight: 500;
  }
  .skeleton-content {
    padding: 20px;
    .line {
      height: 12px;
      background: #f0f0f0;
      margin-bottom: 12px;
      border-radius: 2px;
      animation: pulse 1.5s infinite;
    }
    .w-80 { width: 80%; }
    .w-100 { width: 100%; }
    .w-60 { width: 60%; }
  }
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Markdown 样式模拟 */
.markdown-style {
  /deep/ h3 {
    font-size: 14px;
    font-weight: bold;
    margin: 12px 0 6px 0;
    color: #2c3e50;
    border-left: 3px solid @primary-color;
    padding-left: 8px;
  }
  /deep/ b {
    color: #262626;
    font-weight: 600;
  }
  /deep/ li {
    list-style-type: disc;
    margin-left: 20px;
    color: @text-sub;
  }
}

.empty-state {
  text-align: center;
  padding-top: 60px;
  color: #ccc;
  img {
    width: 120px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
}

/* Vue Transition */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
