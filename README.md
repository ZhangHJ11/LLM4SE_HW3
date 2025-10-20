# 🌍 AI旅行规划师 (AI Travel Planner)

一个智能的旅行规划Web应用程序，帮助用户创建和管理个性化的旅行计划。

## ✨ 核心功能

### 🔐 用户管理
- 用户注册与登录
- 个人仪表板
- 数据云端存储

### 🤖 AI智能旅行规划
- 基于火山引擎AI的个性化旅行规划
- 详细行程安排（景点、餐厅、住宿、交通等）
- 智能预算分配和费用估算
- 所有内容均为简体中文

### 🎤 语音输入
- 中文语音识别（讯飞API）
- 实时识别与文本编辑
- AI分析语音内容并自动填充表单

### 🗺️ 地图路线规划
- 景点自动标注
- 任意两点间最优路线规划
- 可视化路线展示与详细信息

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
1. 复制 `.env.local.example` 文件并重命名为 `.env.local`
2. 在 `.env.local` 文件中配置您的 API 密钥：
```bash
# 火山引擎API密钥 (用于AI旅行规划)
DOUBAO_APIKEY=your_actual_api_key_here

# Supabase配置 (用于用户认证和数据存储)
SUPABASE_KEY=your_supabase_anon_key_here

# 讯飞语音识别配置 (用于语音输入功能)
XF_APPID=your_xunfei_app_id_here
XF_APIKEY=your_xunfei_api_key_here
XF_APISECRET=your_xunfei_api_secret_here
```

### 3. 启动应用
```bash
npm start
```

应用将在 http://localhost:3000 启动。

## 🛠️ 技术栈
- **前端**: React 18, React Router
- **后端**: Supabase (PostgreSQL + Auth)
- **AI服务**: 火山引擎豆包大模型
- **语音识别**: 讯飞语音识别API
- **地图服务**: 百度地图GL版API
- **构建工具**: Webpack 5, Babel 7

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

---

**注意**: 当前版本已实现用户管理、AI智能旅行规划和语音输入功能。