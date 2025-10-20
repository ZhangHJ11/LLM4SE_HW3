# Docker Hub 自动构建配置指南

本文档说明如何配置 Docker Hub 以自动从 GitHub 仓库构建和推送 Docker 镜像。

## 前置条件

1. 已在 Docker Hub 上创建账户
2. 已在 GitHub 上推送项目代码
3. 已在 GitHub 仓库中配置 Docker Hub 访问令牌

## 配置步骤

### 1. 在 Docker Hub 上创建访问令牌

1. 登录 Docker Hub
2. 点击右上角的用户头像，选择 "Account Settings"
3. 在左侧菜单中选择 "Security"
4. 点击 "New Access Token"
5. 输入令牌描述（如 "GitHub Actions"）
6. 选择 "Read & Write" 权限（这将允许推送和拉取镜像）
7. 点击 "Generate"
8. 复制生成的访问令牌并保存（此令牌只会显示一次）

注意：确保选择的是 "Read & Write" 权限，而不是 "Read" 权限，否则会出现权限不足的错误。

### 2. 在 GitHub 仓库中配置 Secrets

1. 进入 GitHub 仓库
2. 点击 "Settings" 选项卡
3. 在左侧菜单中选择 "Secrets and variables" -> "Actions"
4. 点击 "New repository secret"
5. 添加以下两个 secrets：
   - Name: `DOCKERHUB_USERNAME`
     Value: 你的 Docker Hub 用户名
   - Name: `DOCKERHUB_TOKEN`
     Value: 你在上一步中生成的访问令牌

### 3. 验证自动构建

1. 推送代码到 main 分支
2. 转到仓库的 "Actions" 选项卡
3. 查看工作流运行状态
4. 成功运行后，镜像将被推送到 Docker Hub

## 使用构建的镜像

构建成功后，可以通过以下命令拉取和运行镜像：

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

访问 http://localhost:8080 查看应用。