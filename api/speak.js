// 生成语音
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { text, voice } = req.body;

    // 验证必需参数
    if (!text) {
      return res.status(400).json({ error: '缺少文本内容' });
    }
    if (!voice || !voice.id) {
      return res.status(400).json({ error: '缺少语音ID' });
    }

    // 调用edge-tts API
    const response = await fetch('https://tts.2068.online/api/tts/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: {
          id: voice.id
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API错误:', errorText);
      return res.status(response.status).json({ 
        error: '语音生成失败',
        details: errorText
      });
    }

    // 设置音频响应头
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 流式传输音频数据
    response.body.pipe(res);

  } catch (error) {
    console.error('生成语音失败:', error);
    res.status(500).json({ 
      error: '生成语音失败',
      message: error.message 
    });
  }
};
