// 获取可用语音列表
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://tts.2068.online/api/tts/voices');
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('获取语音列表失败:', error);
    res.status(500).json({ 
      error: '获取语音列表失败',
      message: error.message 
    });
  }
};
