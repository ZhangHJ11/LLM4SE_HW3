# 使用官方 Node.js 运行时作为基础镜像
FROM node:16-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 复制项目文件
COPY . .

# 创建一个包含默认值的 .env.local 文件以避免构建错误
RUN echo "DOUBAO_APIKEY=dummy_key" >> .env.local && \
    echo "SUPABASE_KEY=dummy_key" >> .env.local && \
    echo "XF_APPID=dummy_id" >> .env.local && \
    echo "XF_APIKEY=dummy_key" >> .env.local && \
    echo "XF_APISECRET=dummy_secret" >> .env.local && \
    echo "BAIDU_AK=dummy_ak" >> .env.local

# 构建应用
RUN npm run build

# 使用轻量级 nginx 镜像作为生产服务器
FROM nginx:alpine

# 复制构建产物到 nginx 服务器
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]