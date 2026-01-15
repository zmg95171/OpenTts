# TTS API 调用说明

## API 基本信息

- **基础URL**: `https://tts.2068.online/`
- **API版本**: v1
- **协议**: HTTPS
- **数据格式**: JSON

## 1. 获取语音列表

### 接口地址
```
GET https://tts.2068.online/api/tts/voices
```

### 请求参数
无

### 响应示例
```json
[
    {
        "Name": "Microsoft Eric",
        "ShortName": "en-US-EricNeural",
        "Locale": "en-US",
        "Gender": "Male",
        "SampleRateHertz": "24000"
    },
    {
        "Name": "Microsoft Jenny",
        "ShortName": "en-US-JennyNeural",
        "Locale": "en-US",
        "Gender": "Female",
        "SampleRateHertz": "24000"
    }
]
```

### 响应字段说明
- `Name`: 语音名称
- `ShortName`: 语音唯一标识符
- `Locale`: 语言代码
- `Gender`: 性别
- `SampleRateHertz`: 采样率

### 常见错误及处理

#### 1. 网络连接错误
**错误信息**:
```
Network Error: Failed to fetch
```

**可能原因**:
- 网络连接问题
- 服务器暂时不可用

**处理方法**:
1. 检查网络连接
2. 添加重试机制
3. 实现错误提示

#### 2. 服务器错误
**错误信息**:
```
500 Internal Server Error
```

**处理方法**:
1. 检查服务器状态
2. 实现错误重试
3. 显示友好的错误提示

## 2. 生成语音

### 接口地址
```
POST https://tts.2068.online/api/tts/speak
```

### 请求参数
```json
{
    "text": "要转换的文本内容",
    "voice": {
        "id": "语音ID"
    }
}
```

### 请求头
```
Content-Type: application/json
```

### 响应
- 成功：返回音频流（audio/mpeg）
- 失败：返回错误信息（application/json）

### 常见错误及处理

#### 1. 参数错误
**错误信息**:
```json
{
    "error": "缺少必需参数",
    "details": "text 参数不能为空"
}
```

**处理方法**:
1. 验证输入参数
2. 实现参数校验
3. 提供友好的错误提示

#### 2. 语音ID错误
**错误信息**:
```json
{
    "error": "无效的语音ID",
    "details": "指定的语音不存在"
}
```

**处理方法**:
1. 验证语音ID的有效性
2. 使用语音列表接口获取有效ID
3. 实现语音选择界面

#### 3. 文本长度限制
**错误信息**:
```json
{
    "error": "文本过长",
    "details": "文本长度不能超过1000字符"
}
```

**处理方法**:
1. 实现文本长度限制
2. 添加字符计数器
3. 提供文本分割功能

#### 4. 服务器错误
**错误信息**:
```
500 Internal Server Error
```

**处理方法**:
1. 实现错误重试机制
2. 显示友好的错误提示
3. 记录错误日志

## 3. 最佳实践

### 1. 错误处理
```javascript
try {
    const response = await fetch('https://tts.2068.online/api/tts/speak', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            voice: {
                id: voiceId
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成语音失败');
    }

    // 处理成功响应
    const audioBlob = await response.blob();
    // ...
} catch (error) {
    console.error('生成语音失败:', error);
    // 显示错误提示
}
```

### 2. 请求重试
```javascript
async function fetchWithRetry(url, options, retries = 3) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('请求失败');
        return response;
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
    }
}
```

### 3. 参数验证
```javascript
function validateParams(text, voiceId) {
    if (!text || text.trim().length === 0) {
        throw new Error('文本内容不能为空');
    }
    if (text.length > 1000) {
        throw new Error('文本长度不能超过1000字符');
    }
    if (!voiceId) {
        throw new Error('请选择语音');
    }
}
```

## 4. 性能优化

### 1. 语音列表缓存
```javascript
let voicesCache = null;
let voicesCacheTime = 0;
const CACHE_DURATION = 3600000; // 1小时

async function getVoices() {
    const now = Date.now();
    if (voicesCache && (now - voicesCacheTime) < CACHE_DURATION) {
        return voicesCache;
    }

    const response = await fetch('https://tts.2068.online/api/tts/voices');
    voicesCache = await response.json();
    voicesCacheTime = now;
    return voicesCache;
}
```

### 2. 请求防抖
```javascript
let debounceTimer;

function debounceGenerate(text, voiceId, delay = 500) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        generateSpeech(text, voiceId);
    }, delay);
}
```

## 5. 安全建议

### 1. 输入过滤
```javascript
function sanitizeText(text) {
    // 移除HTML标签
    text = text.replace(/<[^>]*>/g, '');
    // 移除特殊字符
    text = text.replace(/[^\w\s一-龥]/g, '');
    return text;
}
```

### 2. 访问限制
```javascript
const rateLimit = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const requests = rateLimit.get(ip) || [];
    const recent = requests.filter(time => now - time < 60000); // 1分钟内

    if (recent.length >= 10) { // 限制每分钟10次请求
        throw new Error('请求过于频繁，请稍后再试');
    }

    recent.push(now);
    rateLimit.set(ip, recent);
}
```

## 6. 监控和日志

### 1. 错误日志
```javascript
function logError(error, context) {
    console.error({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context: context
    });
}
```

### 2. 性能监控
```javascript
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    console.log(`${name} 执行时间: ${duration}ms`);
    return result;
}
```

## 7. 故障排除

### 1. 检查清单
- [ ] 网络连接正常
- [ ] API 地址正确
- [ ] 请求参数完整
- [ ] 请求头正确
- [ ] 错误处理完善

### 2. 调试技巧
1. 使用浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 使用 try-catch 捕获错误
4. 添加请求和响应日志

## 8. 更新记录

### 2023-12-20
- 创建文档
- 添加基本API说明
- 补充错误处理方案
