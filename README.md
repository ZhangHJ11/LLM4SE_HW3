# 🌍 AI旅行规划师 (AI Travel Planner)

一个智能的旅行规划Web应用程序，帮助用户创建和管理个性化的旅行计划。

## ✨ 功能特性

### 🔐 用户管理系统
- **用户注册与登录** - 安全的用户认证系统
- **个人仪表板** - 管理个人旅行计划
- **数据持久化** - 云端存储用户数据
- **响应式设计** - 支持多设备访问

### 🤖 AI智能旅行规划
- **智能行程生成** - 基于火山引擎AI的个性化旅行规划
- **详细行程安排** - 包含景点、餐厅、住宿、交通等完整信息
- **预算管理** - 智能预算分配和费用估算
- **个性化推荐** - 根据用户偏好生成定制化建议
- **中文内容保证** - 所有AI生成内容均为简体中文

### 🎤 语音输入功能
- **语音识别** - 支持中文语音输入旅行需求
- **实时识别** - 边说边识别，提供即时反馈
- **讯飞集成** - 使用讯飞语音识别API提高准确率
- **文本编辑** - 识别后可继续编辑文本内容
- **顶部集成** - 语音输入组件位于表单顶部，便于快速填写
- **智能分析** - AI分析语音内容并自动填充表单字段

### 🚀 技术特性
- ⚛️ React 18 最新版本
- 🛣️ React Router 路由管理
- 📦 Webpack 5 构建工具
- 🔄 Babel 转译器
- 🔥 热重载开发服务器
- 🎨 现代化 CSS 样式
- 📱 完全响应式设计

## 📁 项目结构

```
├── public/
│   └── index.html                    # HTML 模板
├── src/
│   ├── components/
│   │   ├── Auth/                    # 认证相关组件
│   │   │   ├── Login.js             # 登录页面
│   │   │   ├── Register.js          # 注册页面
│   │   │   └── Auth.css             # 认证样式
│   │   ├── Dashboard/               # 仪表板组件
│   │   │   ├── Dashboard.js         # 用户仪表板
│   │   │   └── Dashboard.css        # 仪表板样式
│   │   └── TravelPlanner/           # 旅行规划组件
│   │       ├── TravelPlanForm.js    # 旅行计划表单
│   │       ├── TravelPlanner.css    # 旅行计划样式
│   │       └── VoiceInput.js        # 语音输入组件
│   ├── App.js                       # 主应用组件
│   ├── App.css                      # 应用样式
│   ├── index.js                     # 应用入口
│   └── index.css                    # 全局样式
├── package.json                     # 项目配置
├── webpack.config.js                # Webpack 配置
├── .babelrc                        # Babel 配置
└── README.md                       # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置Supabase

1. 在Supabase控制台中创建新项目
2. 复制项目URL和匿名密钥
3. 编辑 `src/config/supabase.js` 文件，替换为你的实际配置：

```javascript
export const supabaseConfig = {
  url: 'https://your-project-ref.supabase.co', // 替换为你的项目URL
  anonKey: 'your-actual-anon-key-here' // 替换为你的匿名密钥
};
```

4. 在Supabase SQL编辑器中运行 `supabase-setup.sql` 文件中的SQL语句

### 3. 配置火山引擎AI

1. 在火山引擎控制台获取API密钥
2. 编辑 `src/config/ai.js` 文件，替换为你的实际配置：

```javascript
export const aiConfig = {
  apiKey: 'your-ark-api-key-here', // 替换为你的火山引擎API密钥
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  model: 'doubao-seed-1-6-251015',
  reasoningEffort: 'medium'
};
```

### 4. 配置讯飞语音识别（可选）

1. 在讯飞开放平台注册并创建应用
2. 获取APP ID、API Key和API Secret
3. 编辑 `src/components/TravelPlanner/VoiceInput.js` 文件，替换为你的实际配置：

```javascript
const XF_CONFIG = {
  appId: 'YOUR_APP_ID_HERE',           // 替换为您的讯飞APP ID
  apiKey: 'YOUR_API_KEY_HERE',         // 替换为您的讯飞API Key
  apiSecret: 'YOUR_API_SECRET_HERE'    // 替换为您的讯飞API Secret
};
```

**⚠️ 安全提醒**：
- API密钥会在浏览器中暴露，请确保密钥安全
- 建议在生产环境中使用服务器端代理来保护API密钥
- 定期轮换API密钥以确保安全

### 5. 启动开发服务器

```bash
npm start
```

或者

```bash
npm run dev
```

应用将在 http://localhost:3000 启动，并自动在浏览器中打开。

### 6. 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

## 🎯 使用指南

### 用户注册
1. 访问应用首页，点击"立即注册"
2. 填写姓名、邮箱和密码
3. 确认密码后点击"创建账户"

### 用户登录
1. 在登录页面输入邮箱和密码
2. 点击"登录"按钮
3. 成功登录后自动跳转到仪表板

### 仪表板功能
- 查看个人旅行计划统计
- 管理现有的旅行计划
- 创建新的AI智能旅行计划

### AI旅行规划功能
- 填写旅行需求（目的地、天数、预算、人数、偏好等）
- AI自动生成详细的旅行计划
- 包含每日行程、景点推荐、餐厅推荐、住宿建议
- 智能预算分配和实用建议
- 保存和管理生成的旅行计划
- 所有内容均为简体中文，避免出现英文内容
- 支持语音输入的智能分析和自动填充

### 语音输入功能
- 在表单顶部点击"🎤 语音输入(讯飞)"按钮
- 允许浏览器访问麦克风
- 开始说话，系统将实时识别语音内容
- 识别结果将自动添加到旅行偏好文本框中
- 可继续编辑识别后的文本内容
- 点击"⏹️ 停止录音"按钮结束录音
- 系统将智能分析语音内容并自动填充相关表单字段

## 🛠️ 技术栈

- **前端框架**: React 18.2.0
- **路由管理**: React Router DOM 6.15.0
- **后端服务**: Supabase (PostgreSQL + Auth)
- **AI服务**: 火山引擎豆包大模型
- **语音识别**: 讯飞语音识别API
- **构建工具**: Webpack 5.88.0
- **转译器**: Babel 7.22.0
- **样式**: 现代 CSS + 响应式设计
- **数据存储**: Supabase 云数据库

## 🔮 未来功能规划

- 💰 **费用管理** - 智能预算分析和费用跟踪
- ☁️ **云端同步** - 多设备数据同步
- 🗺️ **地图集成** - 可视化行程展示
- 📱 **移动端优化** - PWA支持
- 🔄 **计划优化** - AI根据反馈优化旅行计划
- 📊 **数据分析** - 旅行偏好分析和推荐
- 🧠 **智能语音分析** - 通过AI分析语音内容并自动填充表单字段（已在当前版本中实现）

## 🌐 浏览器支持

支持所有现代浏览器，包括：
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

---

**注意**: 当前版本已实现用户管理、AI智能旅行规划和语音输入功能。