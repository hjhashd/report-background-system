(function (window, undefined) {
  // 强制向父窗口（主页面）发送日志，绕过 iframe 隔离
  const remoteLog = (msg, data) => {
    try {
      const payload = {
        type: 'PLUGIN_DEBUG_LOG',
        message: msg,
        data: data,
        timestamp: new Date().getTime()
      };
      // 尝试发送给直接父级（OnlyOffice 内部）
      window.parent.postMessage(payload, '*');
      // 尝试发送给顶层窗口（Vue 主页面）
      if (window.parent !== window.top) {
        window.top.postMessage(payload, '*');
      }
    } catch (e) {}
  };

  remoteLog('插件脚本已加载');
  console.log('[OnlyOfficePlugin] 插件脚本已加载');

  // --- 核心修复：添加 BroadcastChannel 监听 ---
  try {
    const channel = new BroadcastChannel('onlyoffice-ai-channel');
    channel.onmessage = function(event) {
      remoteLog('BroadcastChannel 收到数据', event.data);
      if (event.data && event.data.type === "ai-insert-text") {
        insertText(event.data.text);
      }
    };
    remoteLog('BroadcastChannel 已就绪: onlyoffice-ai-channel');
  } catch (e) {
    remoteLog('BroadcastChannel 初始化失败', e.message);
  }

  function insertText(text) {
    const textToInsert = text || '';
    const tryPaste = (retryCount) => {
      if (window.Asc && window.Asc.plugin && typeof window.Asc.plugin.executeMethod === 'function') {
        remoteLog('正在执行 PasteText...', textToInsert.substring(0, 20) + '...');
        window.Asc.plugin.executeMethod("PasteText", [textToInsert]);
      } else if (retryCount > 0) {
        remoteLog('插件 API 尚未就绪，等待重试...', retryCount);
        setTimeout(() => tryPaste(retryCount - 1), 500);
      } else {
        remoteLog('插件 API 初始化最终失败');
      }
    };
    tryPaste(10);
  }
  
  window.Asc.plugin.init = function () {
    remoteLog('Asc.plugin.init() 被调用');
    console.log('[OnlyOfficePlugin] Asc.plugin.init() 被调用');
  };

  // 标准的外部消息处理接口
  window.Asc.plugin.onExternalPluginMessage = function (data) {
    remoteLog('Asc.plugin.onExternalPluginMessage 收到数据', data);
    if (data && data.type === "ai-insert-text") {
      insertText(data.text);
    }
  };

  window.addEventListener("message", function (event) {
    // 忽略我们自己发出去的日志消息，避免死循环
    if (event.data && event.data.type === 'PLUGIN_DEBUG_LOG') return;

    remoteLog('window 收到 message 事件', { origin: event.origin, data: event.data });
    
    if (event.data && event.data.type === "ai-insert-text") {
      insertText(event.data.text);
    }
  });

  window.Asc.plugin.button = function (id) {
    remoteLog('按钮点击', id);
  };
})(window, undefined);
