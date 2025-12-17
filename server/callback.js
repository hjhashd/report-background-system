const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

const app = express();
const port = 3000; // 回调服务器监听的端口

// 使用 body-parser 中间件解析 JSON 和 URL-encoded 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// OnlyOffice 回调接口
app.post('/onlyoffice-callback', (req, res) => {
    console.log('Received OnlyOffice callback:', req.body);

    const { status, url, key, users } = req.body;

    // 根据 OnlyOffice 文档服务器的文档，status 字段表示文档状态
    // 1: 文档正在编辑中
    // 2: 文档已准备好保存
    // 3: 文档保存失败
    // 4: 文档关闭，没有保存
    // 6: 文档强制保存
    // 7: 文档协作会话结束

    if (status === 2 || status === 6) {
        // 文档已准备好保存或强制保存
        console.log(`Document ${key} is ready to be saved. Download URL: ${url}`);

        // 在这里，您需要从 OnlyOffice 文档服务器下载更新后的文档
        // 并将其保存到您的存储中（例如，覆盖原始文件）
        // 这是一个简化的示例，实际生产环境需要更健壮的实现
        // 例如，使用 axios 或 node-fetch 下载文件
        const savedDocumentsDir = path.join(__dirname, 'saved_documents');
        if (!fs.existsSync(savedDocumentsDir)) {
            fs.mkdirSync(savedDocumentsDir, { recursive: true });
        }

        fetch(url).then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(path.join(__dirname, 'saved_documents', `${key}.docx`), buffer);
                console.log(`Document ${key} saved successfully.`);
            })
            .catch(error => {
                console.error(`Error saving document ${key}:`, error);
            });

        // 模拟保存成功，返回状态 0
        res.json({ error: 0 });
    } else if (status === 1) {
        console.log(`Document ${key} is being edited by users: ${users}`);
        res.json({ error: 0 });
    } else {
        console.log(`OnlyOffice callback status: ${status} for document ${key}`);
        res.json({ error: 0 });
    }
});

app.listen(port, () => {
    console.log(`OnlyOffice callback server listening at http://localhost:${port}`);
});