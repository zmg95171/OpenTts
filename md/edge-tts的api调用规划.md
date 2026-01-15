# edge-tts API 调用规划

## 项目概述
基于 `https://tts.2068.online` API 创建一个文本转语音（TTS）测试项目，并部署到 Vercel 平台。

## API 端点

### 1. 获取可用语音列表
- **端点**: `GET /api/tts/voices`
- **描述**: 获取所有可用的语音朗读者列表
- **响应格式**: JSON 数组，包含每个语音的详细信息
  ```json
  [
    {
      "Name": "语音名称",
      "ShortName": "语音ID",
      "Locale": "语言区域",
      "Gender": "性别",
      "SampleRateHertz": "采样率",
      "Description": "描述"
    }
  ]
  ```

### 2. 生成语音
- **端点**: `POST /api/tts/speak`
- **请求头**: 
  - `Content-Type: application/json`
- **请求体**:
  ```json
  {
    "text": "要转换的文本内容",
    "voice": {
      "id": "语音ID (如: Eric)"
    }
  }
  ```
- **可选参数** (根据文档说明，可能导致500错误，暂不使用):
  - `rate`: 语速
  - `volume`: 音量
  - `pitch`: 音调
- **响应**: 音频流 (audio/mpeg)

## 项目结构

```
edge-tts-test/
├── api/
│   ├── voices.js          # 获取语音列表API
│   └── speak.js           # 生成语音API
├── public/
│   ├── index.html         # 前端页面
│   └── styles.css         # 样式文件
├── package.json           # 项目依赖
└── vercel.json           # Vercel配置文件
```

## 功能规划

### 1. 前端功能
- [ ] 语音选择器
  - 显示所有可用的语音列表
  - 支持按语言/性别筛选
  - 显示语音名称和描述
- [ ] 文本输入区域
  - 支持多行文本输入
  - 显示字符计数
- [ ] 播放控制
  - 播放/暂停按钮
  - 音频播放器
  - 音量控制
- [ ] 响应式设计
  - 支持移动端和桌面端

### 2. 后端API功能
- [ ] `/api/voices`
  - 调用 `https://tts.2068.online/api/tts/voices`
  - 处理和返回语音列表
- [ ] `/api/speak`
  - 接收文本和语音ID参数
  - 调用 `https://tts.2068.online/api/tts/speak`
  - 返回音频流
  - 处理错误情况

## 技术栈

### 前端
- HTML5
- CSS3 (原生或使用Tailwind CSS)
- JavaScript (ES6+)
- Fetch API

### 后端
- Node.js (Vercel Serverless Functions)
- Express.js (可选)

## 部署配置

### Vercel 配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## 开发步骤

1. **项目初始化**
   - 创建项目目录结构
   - 初始化 package.json
   - 安装必要依赖

2. **后端API开发**
   - 实现 `/api/voices` 端点
   - 实现 `/api/speak` 端点
   - 添加错误处理

3. **前端开发**
   - 创建基础HTML结构
   - 实现语音选择功能
   - 实现文本输入和播放功能
   - 添加样式和响应式设计

4. **测试**
   - 测试API端点
   - 测试前端功能
   - 测试不同语音的生成

5. **部署**
   - 连接Vercel仓库
   - 配置环境变量
   - 部署到生产环境

## 注意事项

1. **API调用限制**
   - 注意API调用频率限制
   - 实现适当的缓存机制

2. **错误处理**
   - 处理网络错误
   - 处理API返回的错误
   - 提供用户友好的错误提示

3. **性能优化**
   - 实现请求防抖
   - 优化音频加载

4. **安全性**
   - 验证输入文本长度
   - 防止XSS攻击
   - 实现速率限制

## 已知问题

根据 `edge-tts调用说明.md` 文档：
1. Voice ID 参数可能无法正确应用，所有生成的语音可能使用相同的默认声音
2. 某些可选参数（rate、volume、pitch）可能导致500错误，应避免使用

## 后续优化

- [ ] 添加音频下载功能
- [ ] 支持批量文本转换
- [ ] 添加语音预设功能
- [ ] 实现音频历史记录
- [ ] 添加使用统计
