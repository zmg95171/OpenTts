# Edge TTS 项目部署实例

## 部署记录

### 日期：2023-12-20

## 本地测试部署

### 1. 环境准备
- Node.js 环境：已安装
- 项目目录：D:\AI\web-tts	ts部署测试

### 2. 依赖安装
执行命令：
```bash
npm install express
```

遇到问题：
- express 模块未找到

解决过程：
1. 重新执行 `npm install express`
2. 安装成功，但出现了一些警告信息：
   - inflight 模块已弃用
   - glob 版本警告
   - 其他几个模块的弃用警告

### 3. 服务器配置
- 服务器端口：3050
- 配置文件：server.js
- 启动命令：npm start

### 4. 测试步骤
1. 启动服务器：`npm start`
2. 访问：http://localhost:3050
3. 测试功能：
   - 语音列表加载
   - 语音选择
   - 文本输入
   - 语音生成
   - 音频播放和下载

## 常见问题及解决方案

### 1. API参数问题
**问题**：
- 语音生成始终使用默认声音
- 选择的语音ID未生效

**解决方案**：
1. 确保使用正确的参数结构：
   ```javascript
   body: JSON.stringify({
       text: text,
       voice: {
           id: voice.ShortName  // 使用ShortName作为语音ID
       }
   })
   ```

2. 验证语音ID格式：
   - 检查语音列表返回的ID格式
   - 确保使用完整的语音标识符

### 2. 依赖安装问题
**问题**：
```
Error: Cannot find module 'express'
```

**解决方案**：
```bash
npm install express
```

**注意**：如果遇到权限问题，可能需要使用管理员权限运行命令行。

### 2. 端口占用问题
**问题**：
```
Error: listen EADDRINUSE :::3050
```

**解决方案**：
1. 更换端口：
   - 修改 server.js 中的 PORT 常量
   - 更新 LOCAL_TEST.md 中的端口信息

2. 或者终止占用端口的进程：
```bash
# Windows
netstat -ano | findstr :3050
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3050
kill -9 <进程ID>
```

### 3. API 请求失败
**问题**：
- 语音列表无法加载
- 语音生成失败
- 错误信息："获取到的数据不是数组格式"
- 错误信息："state.voices.map is not a function"

**排查步骤**：
1. 检查网络连接
2. 验证 https://tts.2068.online 是否可访问
3. 查看浏览器控制台错误信息
4. 检查服务器返回的原始响应内容
5. 验证响应数据结构

**解决方案**：
1. 修改前端代码中的 API 地址为完整 URL：
   - `/api/voices` → `https://tts.2068.online/api/tts/voices`
   - `/api/speak` → `https://tts.2068.online/api/tts/speak`

2. 添加响应数据结构检查：
   ```javascript
   // 检查数据结构
   if (Array.isArray(data)) {
       return data;
   } else if (data && typeof data === 'object' && Array.isArray(data.voices)) {
       return data.voices;
   } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
       return data.data;
   }
   ```

3. 确保请求参数格式正确：
   ```javascript
   body: JSON.stringify({
       text: text,
       voice: {
           id: voice.ShortName  // 使用正确的参数结构
       }
   })
   ```

4. 添加详细的错误日志：
   ```javascript
   console.log('服务器原始响应:', rawText);
   console.log('响应状态:', response.status);
   console.log('响应头:', [...response.headers.entries()]);
   ```

5. 处理跨域问题：
   - 添加 CORS 头
   - 使用正确的请求模式
   - 设置适当的请求头

### 4. API数据结构变更
**问题**：
- 语音列表无法正确显示
- 语言筛选器无法工作
- 性别筛选器无法工作

**原因**：
API返回的语音对象使用了小写属性名：
- `Locale` → `locale`
- `Gender` → `gender`
- `Name` → `name`/`displayName`
- `ShortName` → `id`

**解决方案**：
1. 更新属性名引用：
   ```javascript
   // 之前
   voice.Locale
   voice.Gender
   voice.Name
   voice.ShortName

   // 现在
   voice.locale
   voice.gender
   voice.displayName || voice.name
   voice.id
   ```

2. 更新筛选逻辑：
   ```javascript
   if (languageFilter && voice.locale !== languageFilter) return false;
   if (genderFilter && voice.gender !== genderFilter) return false;
   ```

3. 更新显示逻辑：
   ```javascript
   <div class="voice-name">${voice.displayName || voice.name || '未知'}</div>
   <div class="voice-info">
       ${voice.locale || '未知'} | ${voice.gender || '未知'}
   </div>
   ```

### 5. 性别筛选问题
**问题**：
- 选择性别后显示"没有找到匹配的语音"
- 只有"所有性别"选项能正常工作

**原因**：
1. API返回的性别值是小写（female/male）
2. HTML中的选项值是大写（Female/Male）
3. 大小写不匹配导致筛选失败

**解决方案**：
1. 修改HTML中的选项值为小写：
   ```html
   <option value="female">女声</option>
   <option value="male">男声</option>
   ```

2. 在JavaScript中添加大小写转换：
   ```javascript
   if (genderFilter && voice.gender !== genderFilter.toLowerCase()) return false;
   ```

### 6. 语音生成参数问题
**问题**：
- 所有生成的语音都使用相同的默认声音
- 无法生成所选声音的语音

**原因**：
1. 语音生成请求使用了错误的参数结构
2. 后端期望的是 `voiceId` 参数，而不是嵌套的 `voice.id` 结构

**解决方案**：
修改请求参数结构：
```javascript
// 之前
body: JSON.stringify({
    text: text,
    voice: {
        id: voice.ShortName
    }
})

// 修复后
body: JSON.stringify({
    text: text,
    voiceId: voice.id  // 直接使用voiceId参数
})
```

### 7. 文本处理问题
**问题**：
- 输入文本包含空行时导致错误
- 多余的空格影响语音生成
- 空文本或纯空格文本导致错误

**解决方案**：
1. 添加文本清理逻辑：
   ```javascript
   text = text.split('\n')
       .filter(line => line.trim())  // 移除空行
       .join(' ')  // 用空格连接非空行
       .trim();  // 移除首尾空格
   ```

2. 验证文本有效性：
   ```javascript
   if (!text) {
       throw new Error('请输入有效的文本内容');
   }
   ```

3. 处理流程：
   - 移除空行
   - 合并非空行
   - 清理多余空格
   - 验证最终文本

### 8. 文件上传问题
**问题**：
- 文件上传失败
- 文件格式不支持
- 拖拽上传不响应
- 文件内容读取失败

**解决方案**：
1. 文件格式验证：
   ```javascript
   if (file && file.type === 'text/plain') {
       // 处理文件
   } else {
       alert('请选择 .txt 格式的文本文件');
   }
   ```

2. 文件读取处理：
   ```javascript
   const reader = new FileReader();
   reader.onload = (e) => {
       elements.textInput.value = e.target.result;
       updateCharCount();
       updateGenerateButton();
   };
   reader.readAsText(file);
   ```

3. 拖拽事件处理：
   ```javascript
   fileUploadArea.addEventListener('dragover', (e) => {
       e.preventDefault();
       fileUploadArea.classList.add('drag-over');
   });

   fileUploadArea.addEventListener('drop', (e) => {
       e.preventDefault();
       fileUploadArea.classList.remove('drag-over');
       // 处理文件
   });
   ```

### 9. 数据解析问题
**问题**：
- 服务器返回的数据格式不符合预期
- JSON解析失败
- 错误信息："state.voices.map is not a function"
- 错误信息："获取到的数据不是数组格式"

**解决方案**：
1. 添加原始响应检查：
   ```javascript
   const rawText = await response.text();
   console.log('服务器原始响应:', rawText);
   ```

2. 安全解析JSON：
   ```javascript
   try {
       data = JSON.parse(rawText);
   } catch (parseError) {
       throw new Error('服务器返回的不是有效的JSON格式');
   }
   ```

3. 处理不同的数据结构：
   ```javascript
   if (Array.isArray(data)) {
       return data;
   } else if (data && typeof data === 'object' && data.success && Array.isArray(data.voices)) {
       console.log('使用 voices 属性作为数据源');
       console.log('voices 数组内容:', data.voices);
       return data.voices;
   } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
       return data.data;
   }
   ```

4. 添加数据验证：
   ```javascript
   // 验证数据类型
   if (!Array.isArray(voices)) {
       throw new Error('获取到的数据不是数组格式');
   }
   ```

5. 改进语音列表渲染：
   ```javascript
   function renderVoiceList() {
       if (!Array.isArray(state.voices)) {
           console.error('state.voices 不是数组:', state.voices);
           elements.voiceList.innerHTML = '<p class="loading">语音数据格式错误</p>';
           return;
       }

       const filteredVoices = state.voices.filter(voice => {
           if (!voice || typeof voice !== 'object') {
               console.warn('无效的语音数据:', voice);
               return false;
           }
           // ... 其他过滤条件
       });
   }
   ```

### 5. CORS 问题
**问题**：
```
Access to fetch at 'https://tts.2068.online/api/tts/voices' from origin 'http://localhost:3050' has been blocked by CORS policy
```

**解决方案**：
1. 在前端请求中添加正确的请求头：
   ```javascript
   headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json'
   }
   ```

2. 在 server.js 中添加 CORS 头：
   ```javascript
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   ```

## Vercel 部署（待补充）

### 1. 准备工作
- GitHub 仓库
- Vercel 账号

### 2. 部署步骤
（待实际部署时补充）

### 3. 部署问题
（待实际部署时补充）

## 性能优化建议

### 1. 前端优化
- 实现语音列表缓存
- 添加加载状态指示
- 实现请求防抖

### 2. 后端优化
- 实现请求缓存
- 添加请求限流
- 优化错误处理

## 安全建议

### 1. 输入验证
- 文本长度限制
- 特殊字符过滤
- XSS 防护

### 2. API 安全
- 添加请求签名
- 实现访问限制
- 记录访问日志

## 调试指南

### 1. API调用调试
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 触发语音列表加载
4. 检查请求详情：
   - 请求URL
   - 请求头
   - 响应状态码
   - 响应内容

### 2. 常见响应状态码
- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

### 3. 错误日志检查
```javascript
// 添加详细的错误日志
console.log('请求URL:', url);
console.log('请求参数:', params);
console.log('响应状态:', response.status);
console.log('响应头:', [...response.headers.entries()]);
console.log('响应内容:', await response.text());

// 数据结构检查
console.log('解析后的数据类型:', typeof data);
console.log('是否为数组:', Array.isArray(data));
console.log('数据内容:', data);

// 语音列表渲染日志
console.log('开始渲染语音列表，当前语音数据:', state.voices);
console.log('过滤后的语音列表:', filteredVoices);
console.log('提取的语言列表:', languages);

// 语音选择日志
console.log('选择的语音:', voice);
```

### 4. 数据验证
```javascript
// 验证数据类型
if (!Array.isArray(voices)) {
    throw new Error('获取到的数据不是数组格式');
}

// 验证语音对象
if (!voice || typeof voice !== 'object') {
    console.warn('无效的语音数据:', voice);
    return false;
}

// 安全访问属性
const voiceName = voice.Name || '未知';
const locale = voice.Locale || '未知';
const gender = voice.Gender || '未知';
```

## 更新日志

### 2023-12-20
- 创建项目
- 配置本地服务器
- 编写部署文档
- 添加API调用问题解决方案
- 添加调试指南

### 2024-01-20
- 添加服务状态指示灯
  - 绿色：服务正常
  - 橙色：检查中
  - 红色：服务不可用
- 优化错误处理
- 添加实时状态更新
- 增强文本处理鲁棒性
  - 自动处理空行
  - 清理多余空格
  - 验证文本有效性
- UI布局优化
  - 采用两列自适应布局
  - 状态指示灯移至控制栏
  - 添加语速调节功能
    - 支持0.5x-2.0x调节
    - 实时显示当前语速
    - 自动应用到音频播放
- 添加文件上传功能
  - 支持 .txt 文件上传
  - 支持点击上传
  - 支持拖拽上传
  - 自动读取文件内容
  - 文件格式验证
- 优化页脚链接
  - 添加可点击链接
  - 优化链接样式
  - 添加悬停效果

## 后续计划

1. 完成 Vercel 部署
2. 添加更多测试用例
3. 实现性能优化
4. 增强安全措施
