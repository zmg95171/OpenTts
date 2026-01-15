const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3050;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// API: 获取语音列表
app.get('/api/voices', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    https.get('https://tts.2068.online/api/tts/voices', (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => {
            data += chunk;
        });
        apiRes.on('end', () => {
            try {
                const voices = JSON.parse(data);
                res.json(voices);
            } catch (error) {
                console.error('解析语音列表失败:', error);
                res.status(500).json({ error: '解析语音列表失败' });
            }
        });
    }).on('error', (error) => {
        console.error('获取语音列表失败:', error);
        res.status(500).json({ error: '获取语音列表失败' });
    });
});

// API: 生成语音
app.post('/api/speak', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { text, voice } = req.body;

    if (!text || !voice || !voice.id) {
        return res.status(400).json({ error: '缺少必需参数' });
    }

    const postData = JSON.stringify({
        text: text,
        voice: {
            id: voice.id
        }
    });

    const options = {
        hostname: 'tts.2068.online',
        port: 443,
        path: '/api/tts/speak',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        if (apiRes.statusCode !== 200) {
            let errorData = '';
            apiRes.on('data', (chunk) => {
                errorData += chunk;
            });
            apiRes.on('end', () => {
                console.error('TTS API错误:', errorData);
                res.status(apiRes.statusCode).json({ 
                    error: '语音生成失败',
                    details: errorData
                });
            });
            return;
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        apiRes.pipe(res);
    });

    apiReq.on('error', (error) => {
        console.error('生成语音失败:', error);
        res.status(500).json({ error: '生成语音失败' });
    });

    apiReq.write(postData);
    apiReq.end();
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`按 Ctrl+C 停止服务器`);
});
