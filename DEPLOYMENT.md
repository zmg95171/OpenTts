# Edge TTS 项目部署指南

## 方法一：通过 Vercel 网站部署（推荐）

### 1. 准备工作
- 确保您有一个 GitHub 账号
- 确保您有一个 Vercel 账号（可以使用 GitHub 账号登录）

### 2. 上传代码到 GitHub

#### 2.1 初始化 Git 仓库
```bash
cd d:\AI\web-tts	ts部署测试
git init
git add .
git commit -m "Initial commit"
```

#### 2.2 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 创建新仓库，命名为 `edge-tts-test`
3. 不要初始化 README、.gitignore 或 LICENSE

#### 2.3 推送代码到 GitHub
```bash
git remote add origin https://github.com/你的用户名/edge-tts-test.git
git branch -M main
git push -u origin main
```

### 3. 部署到 Vercel

#### 3.1 导入项目
1. 访问 https://vercel.com/new
2. 点击 "Add New..." → "Project"
3. 选择您的 GitHub 仓库 `edge-tts-test`
4. 点击 "Import"

#### 3.2 配置项目
Vercel 会自动检测项目配置，无需修改：
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: (留空)
- **Output Directory**: (留空)

#### 3.3 部署
1. 点击 "Deploy" 按钮
2. 等待部署完成（通常需要 1-2 分钟）
3. 部署成功后，您将获得一个 `.vercel.app` 域名

## 方法二：使用 Vercel CLI 部署

### 1. 安装 Node.js
确保已安装 Node.js (版本 14 或更高)
下载地址：https://nodejs.org/

### 2. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 3. 登录 Vercel
```bash
vercel login
```

### 4. 部署项目
```bash
cd d:\AI\web-tts	ts部署测试
vercel
```

按照提示操作：
- ? Set up and deploy "~/edge-tts-test"? [Y/n] Y
- ? Which scope do you want to deploy to? (选择您的账号)
- ? Link to existing project? [y/N] N
- ? What's your project's name? edge-tts-test
- ? In which directory is your code located? ./
- ? Want to override the settings? [y/N] N

### 5. 生产环境部署
```bash
vercel --prod
```

## 部署后测试

1. 访问您的 Vercel 域名（例如：https://edge-tts-test.vercel.app）
2. 测试功能：
   - 检查语音列表是否正常加载
   - 选择不同的语音
   - 输入文本并生成语音
   - 测试播放和下载功能

## 常见问题

### 1. 部署后 API 返回 404
- 检查 `vercel.json` 配置是否正确
- 确保 `api/` 目录结构正确

### 2. 语音列表无法加载
- 检查 `api/voices.js` 文件是否存在
- 查看浏览器控制台错误信息
- 检查 `https://tts.2068.online/api/tts/voices` 是否可访问

### 3. 生成语音失败
- 检查 `api/speak.js` 文件是否存在
- 查看浏览器控制台错误信息
- 确认文本输入不为空
- 确认已选择语音

### 4. 音频无法播放
- 检查浏览器是否支持音频播放
- 尝试下载音频文件后播放
- 查看浏览器控制台错误信息

## 更新部署

### 修改代码后重新部署

#### 方法一：通过 Vercel 网站
1. 将修改推送到 GitHub
2. Vercel 会自动检测并重新部署
3. 在 Vercel 控制台查看部署状态

#### 方法二：使用 Vercel CLI
```bash
vercel --prod
```

## 环境变量（如需要）

如果需要添加环境变量：

### 通过 Vercel 网站
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需的环境变量
4. 重新部署项目

### 使用 Vercel CLI
```bash
vercel env add
```

## 项目监控

- 访问 Vercel 控制台查看部署日志
- 查看 Analytics 了解访问情况
- 设置 Alerts 接收错误通知

## 联系支持

如遇到部署问题，可以：
1. 查看 Vercel 文档：https://vercel.com/docs
2. 在 Vercel 社区提问：https://vercel.com/community
3. 联系 Vercel 支持
