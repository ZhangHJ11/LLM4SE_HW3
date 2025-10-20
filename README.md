# AI Travel Planner - 智能旅行规划师

AI Travel Planner 是一个基于人工智能的旅行规划应用，集成语音识别、地图服务和AI大模型，为用户提供个性化的旅行建议。

## 功能特性

- 语音输入旅行需求
- AI生成个性化旅行计划
- 百度地图路线展示
- Supabase用户认证和数据存储

## 环境要求

- Node.js 16+
- Docker (可选，用于容器化部署)

## 本地开发

### 环境变量配置

1. 复制 [.env.local.example](file:///D:/front/LLM4SE_HW3/.env.local.example) 文件并重命名为 [.env.local](file:///D:/front/LLM4SE_HW3/.env.local)：
   ```bash
   cp .env.local.example .env.local
   ```

2. 在 [.env.local](file:///D:/front/LLM4SE_HW3/.env.local) 文件中配置以下环境变量：

   ```
   # 火山引擎API密钥（用于AI旅行计划生成）
   DOUBAO_APIKEY=your_doubao_api_key
   
   # Supabase配置
   SUPABASE_KEY=your_supabase_anon_key
   
   # 讯飞语音识别配置
   XF_APPID=your_xunfei_app_id
   XF_APIKEY=your_xunfei_api_key
   XF_APISECRET=your_xunfei_api_secret
   
   # 百度地图API密钥
   BAIDU_AK=your_baidu_map_ak
   ```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 上运行。

### 构建生产版本

```bash
npm run build
```

## Docker 部署

### 使用预构建的 Docker 镜像

```bash
docker pull zhanghj11/llm4se_hw3:latest
docker run -d \
  --name ai-travel-planner \
  -p 8080:80 \
  -e DOUBAO_APIKEY=your_doubao_api_key \
  -e SUPABASE_KEY=your_supabase_anon_key \
  -e XF_APPID=your_xunfei_app_id \
  -e XF_APIKEY=your_xunfei_api_key \
  -e XF_APISECRET=your_xunfei_api_secret \
  -e BAIDU_AK=your_baidu_map_ak \
  zhanghj11/llm4se_hw3:latest
```

应用将在 http://localhost:8080 上运行。

### 从源码构建 Docker 镜像

```bash
docker build -t ai-travel-planner .
docker run -d \
  --name ai-travel-planner \
  -p 8080:80 \
  -e DOUBAO_APIKEY=your_doubao_api_key \
  -e SUPABASE_KEY=your_supabase_anon_key \
  -e XF_APPID=your_xunfei_app_id \
  -e XF_APIKEY=your_xunfei_api_key \
  -e XF_APISECRET=your_xunfei_api_secret \
  -e BAIDU_AK=your_baidu_map_ak \
  ai-travel-planner
```

### Docker Hub 自动构建配置

为了实现 Docker 镜像的自动构建和推送，需要在 GitHub 仓库中配置以下 secrets。详细配置步骤请参考 [DOCKER_HUB_SETUP.md](DOCKER_HUB_SETUP.md)：

1. `DOCKERHUB_USERNAME` - Docker Hub 用户名
2. `DOCKERHUB_TOKEN` - Docker Hub 访问令牌

## 项目结构

```
src/
├── components/           # React 组件
│   ├── Auth/            # 认证相关组件
│   ├── Dashboard/       # 仪表板组件
│   └── TravelPlanner/   # 旅行规划相关组件
├── config/              # 配置文件
├── lib/                 # 工具库
├── services/            # 服务层
└── index.js             # 应用入口文件
```

## 技术栈

- React 18.2.0
- Webpack 5.88.0
- Supabase (认证和数据库)
- 百度地图 API
- 讯飞语音识别 API
- 火山引擎豆包大模型 API

## 注意事项

所有 API 密钥都需要通过环境变量注入，不要在代码中硬编码密钥。

## 供助教使用的测试密钥

为了方便助教测试，我们提供了以下测试密钥（有效期至2026年1月）：

请注意，这些密钥仅供测试使用，生产环境中请使用您自己的密钥。