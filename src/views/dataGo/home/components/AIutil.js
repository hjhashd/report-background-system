export class AIWebSocketClient {
    constructor() {
        this.baseUrl = 'wss://test.faithindata.com.cn/ai/ws';
        this.websocket = null;
        this.isConnected = false;
        this.userId = null;
        this.engineId = null;

        // 事件回调函数
        this.callbacks = {
            message: null,    // 接收普通消息回调
            error: null,      // 接收错误消息回调
            complete: null,   // 接收完成标识回调
            connectionOpen: null,    // 连接成功回调
            connectionClose: null    // 连接关闭回调
        };
    }

    /**
     * 连接到WebSocket服务器
     * @param {string} userId - 用户ID
     * @param {string} engineId - 引擎ID
     * @returns {Promise} - 连接结果Promise
     */
    connect(userId, engineId) {
        return new Promise((resolve, reject) => {
            // 如果已连接则先关闭
            if (this.isConnected) {
                this.close();
            }

            this.userId = userId;
            this.engineId = engineId;
            const url = `${this.baseUrl}/${userId}/${engineId}`;

            try {
                this.websocket = new WebSocket(url);

                this.websocket.onopen = () => {
                    this.isConnected = true;
                    console.log(`WebSocket连接成功: ${url}`);
                    if (this.callbacks.connectionOpen) {
                        this.callbacks.connectionOpen();
                    }
                    resolve(true);
                };

                this.websocket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.websocket.onerror = (error) => {
                    console.error('WebSocket错误:', error);
                    if (this.callbacks.error) {
                        this.callbacks.error({ type: 'connection_error', content: error.message });
                    }
                    reject(error);
                };

                this.websocket.onclose = (event) => {
                    this.isConnected = false;
                    console.log(`WebSocket连接关闭: 代码=${event.code}, 原因=${event.reason}`);
                    if (this.callbacks.connectionClose) {
                        this.callbacks.connectionClose(event);
                    }
                };
            } catch (error) {
                console.error('WebSocket连接失败:', error);
                reject(error);
            }
        });
    }

    /**
     * 处理接收到的消息
     * @param {string} data - 接收到的原始数据
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'message':
                    if (this.callbacks.message) {
                        this.callbacks.message(message.content);
                    }
                    break;

                case 'error':
                    console.error('服务器错误:', message.content);
                    if (this.callbacks.error) {
                        this.callbacks.error(message);
                    }
                    // 错误时会断开连接，这里不需要额外处理
                    break;

                case 'complete':
                    console.log('对话已完成');
                    if (this.callbacks.complete) {
                        this.callbacks.complete(message.content);
                    }
                    break;

                default:
                    console.warn('未知消息类型:', message);
            }
        } catch (error) {
            console.error('解析WebSocket消息失败:', error, '原始数据:', data);
            if (this.callbacks.error) {
                this.callbacks.error({ type: 'parse_error', content: '解析消息失败' });
            }
        }
    }

    /**
     * 发送内容消息（用户输入的提示词）
     * @param {string} userPrompt - 用户自己写的提示词
     * @param {string} [quickPrompt=''] - 快速选择的提示词
     * @returns {boolean} - 是否发送成功
     */
    sendContentMessage(userPrompt, quickPrompt = '') {
        if (!this.isConnected || !this.websocket) {
            console.error('WebSocket未连接，无法发送消息');
            return false;
        }

        // 组合用户提示词和快速选择提示词
        const message = quickPrompt
            ? `${userPrompt}\n${quickPrompt}`
            : userPrompt;

        const payload = {
            type: 'content',
            message: message
        };

        try {
            this.websocket.send(JSON.stringify(payload));
            console.log('内容消息已发送:', payload);
            return true;
        } catch (error) {
            console.error('发送内容消息失败:', error);
            return false;
        }
    }

    /**
     * 发送总结请求
     * @param {number} reportType - 报告类型
     * @param {number} categoryId - 分类ID
     * @returns {boolean} - 是否发送成功
     */
    sendSummaryRequest(reportType, categoryId) {
        if (!this.isConnected || !this.websocket) {
            console.error('WebSocket未连接，无法发送总结请求');
            return false;
        }

        const payload = {
            type: 'summary',
            report_type: reportType,
            category_id: categoryId
        };

        try {
            this.websocket.send(JSON.stringify(payload));
            console.log('总结请求已发送:', payload);
            return true;
        } catch (error) {
            console.error('发送总结请求失败:', error);
            return false;
        }
    }

    /**
     * 关闭WebSocket连接
     */
    close() {
        if (this.websocket && this.isConnected) {
            this.websocket.close(1000, '正常关闭');
            this.isConnected = false;
            console.log('WebSocket已手动关闭');
        }
    }

    /**
     * 设置事件回调
     * @param {string} eventType - 事件类型: message, error, complete, connectionOpen, connectionClose
     * @param {Function} callback - 回调函数
     */
    on(eventType, callback) {
        if (this.callbacks.hasOwnProperty(eventType) && typeof callback === 'function') {
            this.callbacks[eventType] = callback;
        } else {
            console.warn(`不支持的事件类型: ${eventType}`);
        }
    }
}


/**
 * 将 Markdown 文本转换为带样式的 HTML
 * @param {string} markdown - 原始 Markdown 文本
 * @returns {string} 带样式类的 HTML 字符串
 */
export function parseMarkdown(markdown) {
    if (!markdown) return '';

    let html = markdown
        // 标题解析
        .replace(/^# (.*$)/gm, '<h1 class="markdown-h1">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="markdown-h2">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="markdown-h3">$1</h3>')

        // 无序列表解析
        .replace(/^- (.*$)/gm, '<li class="markdown-list-item">$1</li>')
        .replace(/(<li class="markdown-list-item">.*<\/li>)+/gs,
            '<ul class="markdown-list-disc">$&</ul>')

        // 代码块解析
        .replace(/```([\s\S]*?)```/gm,
            '<pre class="markdown-code-block"><code>$1</code></pre>')

        // 行内代码解析
        .replace(/`(.*?)`/g, '<code class="markdown-code-inline">$1</code>')

        // 粗体解析
        .replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-bold">$1</strong>')

        // 链接解析
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="markdown-link">$1</a>')

        // 分隔线解析
        .replace(/^---$/gm, '<hr class="markdown-divider">')

        // 段落解析（处理剩余文本）
        .replace(/^(?!<h|<ul|<pre|<table|<hr).*$/gm, '<p>$&</p>');

    return html;
}