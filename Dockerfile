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

# 构建应用时需要的环境变量
# 这些变量会在构建时注入到前端代码中
ARG DOUBAO_APIKEY
ARG SUPABASE_KEY
ARG XF_APPID
ARG XF_APIKEY
ARG XF_APISECRET
ARG BAIDU_AK

# 构建应用（环境变量在构建时通过ARG传递）
RUN DOUBAO_APIKEY=${DOUBAO_APIKEY} \
    SUPABASE_KEY=${SUPABASE_KEY} \
    XF_APPID=${XF_APPID} \
    XF_APIKEY=${XF_APIKEY} \
    XF_APISECRET=${XF_APISECRET} \
    BAIDU_AK=${BAIDU_AK} \
    npm run build

# 使用轻量级 nginx 镜像作为生产服务器
FROM nginx:alpine

# 复制构建产物到 nginx 服务器
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 安装 openssl 和 CA 证书，并生成自签名证书（用于启用 HTTPS）
RUN apk add --no-cache openssl ca-certificates \
    && mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -subj "/CN=localhost" \
        -keyout /etc/nginx/ssl/selfsigned.key \
        -out /etc/nginx/ssl/selfsigned.crt

# 暴露端口
EXPOSE 80
EXPOSE 443

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]