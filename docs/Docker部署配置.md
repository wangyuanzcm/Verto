# Docker 部署配置指南

## 📋 Verto项目Docker化部署

### 1. 前端Dockerfile配置

#### 多阶段构建Dockerfile
```dockerfile
# jeecgboot-vue3/Dockerfile
# 第一阶段：构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@8.15.0

# 复制package文件
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 第二阶段：运行
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx配置文件
```nginx
# jeecgboot-vue3/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # 处理前端路由
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API代理
        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### 2. 后端Dockerfile配置

#### 多阶段构建Dockerfile
```dockerfile
# jeecg-boot/Dockerfile
# 第一阶段：构建
FROM maven:3.8.6-openjdk-8 AS builder

# 设置工作目录
WORKDIR /app

# 复制pom文件
COPY pom.xml .
COPY jeecg-module-system/pom.xml jeecg-module-system/
COPY jeecg-module-demo/pom.xml jeecg-module-demo/

# 下载依赖（利用Docker缓存）
RUN mvn dependency:go-offline -B

# 复制源代码
COPY . .

# 构建应用
RUN mvn clean package -DskipTests -B

# 第二阶段：运行
FROM openjdk:8-jre-alpine

# 安装必要工具
RUN apk add --no-cache curl

# 创建应用用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 设置工作目录
WORKDIR /app

# 复制jar文件
COPY --from=builder /app/jeecg-module-system/jeecg-system-start/target/*.jar app.jar

# 更改文件所有者
RUN chown -R appuser:appgroup /app

# 切换到应用用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 暴露端口
EXPOSE 8080

# JVM参数
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+PrintGCDetails"

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 3. 完整Docker Compose配置

#### 生产环境配置
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./jeecgboot-vue3
      dockerfile: Dockerfile
    image: verto/frontend:latest
    container_name: verto-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - verto-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`verto.local`)"

  # 后端服务
  backend:
    build:
      context: ./jeecg-boot
      dockerfile: Dockerfile
    image: verto/backend:latest
    container_name: verto-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/verto?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
      - SPRING_DATASOURCE_USERNAME=verto
      - SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
      - SPRING_REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - ./logs:/app/logs
      - ./upload:/app/upload
    depends_on:
      - mysql
      - redis
    networks:
      - verto-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: verto-mysql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=verto
      - MYSQL_USER=verto
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/conf:/etc/mysql/conf.d
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - verto-network
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: verto-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"
    networks:
      - verto-network
    restart: unless-stopped

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    container_name: verto-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - verto-network
    restart: unless-stopped

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    container_name: verto-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - verto-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: verto-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    networks:
      - verto-network
    restart: unless-stopped

# 网络配置
networks:
  verto-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# 数据卷
volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
```

#### 开发环境配置
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # 开发环境前端（热重载）
  frontend-dev:
    build:
      context: ./jeecgboot-vue3
      dockerfile: Dockerfile.dev
    container_name: verto-frontend-dev
    ports:
      - "3000:3000"
    volumes:
      - ./jeecgboot-vue3:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    networks:
      - verto-dev-network
    restart: unless-stopped

  # 开发环境后端
  backend-dev:
    build:
      context: ./jeecg-boot
      dockerfile: Dockerfile.dev
    container_name: verto-backend-dev
    ports:
      - "8080:8080"
      - "5005:5005"  # 调试端口
    volumes:
      - ./jeecg-boot:/app
      - ~/.m2:/root/.m2
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - JAVA_TOOL_OPTIONS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
    depends_on:
      - mysql-dev
      - redis-dev
    networks:
      - verto-dev-network
    restart: unless-stopped

  # 开发数据库
  mysql-dev:
    image: mysql:8.0
    container_name: verto-mysql-dev
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=verto_dev
      - MYSQL_USER=verto
      - MYSQL_PASSWORD=verto123
    volumes:
      - mysql_dev_data:/var/lib/mysql
    ports:
      - "3307:3306"
    networks:
      - verto-dev-network

  redis-dev:
    image: redis:7-alpine
    container_name: verto-redis-dev
    ports:
      - "6380:6379"
    networks:
      - verto-dev-network

networks:
  verto-dev-network:
    driver: bridge

volumes:
  mysql_dev_data:
```

### 4. 开发环境Dockerfile

#### 前端开发Dockerfile
```dockerfile
# jeecgboot-vue3/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@8.15.0

# 复制package文件
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 暴露端口
EXPOSE 3000

# 启动开发服务器
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
```

#### 后端开发Dockerfile
```dockerfile
# jeecg-boot/Dockerfile.dev
FROM maven:3.8.6-openjdk-8

WORKDIR /app

# 复制pom文件
COPY pom.xml .

# 下载依赖
RUN mvn dependency:go-offline -B

# 暴露端口
EXPOSE 8080 5005

# 启动开发服务器
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"]
```

### 5. 环境变量配置

#### 生产环境变量
```bash
# .env.prod
# 数据库配置
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_PASSWORD=your_strong_password

# Redis配置
REDIS_PASSWORD=your_redis_password

# 应用配置
APP_ENV=production
JWT_SECRET=your_jwt_secret_key

# 监控配置
GRAFANA_PASSWORD=your_grafana_password

# SSL配置
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

#### 开发环境变量
```bash
# .env.dev
# 数据库配置
MYSQL_ROOT_PASSWORD=root123
MYSQL_PASSWORD=verto123

# Redis配置
REDIS_PASSWORD=

# 应用配置
APP_ENV=development
JWT_SECRET=dev_jwt_secret

# 调试配置
DEBUG_PORT=5005
```

### 6. 部署脚本

#### 生产部署脚本
```bash
#!/bin/bash
# deploy-prod.sh

set -e

echo "🚀 开始生产环境部署..."

# 检查环境变量
if [ ! -f .env.prod ]; then
    echo "❌ 缺少 .env.prod 文件"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 停止旧服务
echo "⏹️ 停止旧服务..."
docker-compose -f docker-compose.prod.yml down

# 备份数据库
echo "💾 备份数据库..."
docker exec verto-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} verto > backup_$(date +%Y%m%d_%H%M%S).sql

# 启动新服务
echo "▶️ 启动新服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 健康检查..."
if curl -f http://localhost:8080/actuator/health; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，正在回滚..."
    docker-compose -f docker-compose.prod.yml down
    # 这里可以添加回滚逻辑
    exit 1
fi

echo "🎉 生产环境部署完成！"
```

#### 开发环境启动脚本
```bash
#!/bin/bash
# start-dev.sh

echo "🚀 启动开发环境..."

# 启动服务
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

echo "⏳ 等待服务启动..."
sleep 20

echo "🔍 检查服务状态..."
docker-compose -f docker-compose.dev.yml ps

echo "✅ 开发环境启动完成！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:8080"
echo "🗄️ 数据库地址: localhost:3307"
echo "🔴 Redis地址: localhost:6380"
```

### 7. 监控配置

#### Prometheus配置
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'verto-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql:9104']
```

#### Grafana仪表板配置
```json
{
  "dashboard": {
    "title": "Verto应用监控",
    "panels": [
      {
        "title": "应用状态",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"verto-backend\"}"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"verto-backend\"}"
          }
        ]
      }
    ]
  }
}
```

---

## 💡 最佳实践

1. **多阶段构建**：减小镜像大小
2. **健康检查**：确保服务可用性
3. **资源限制**：防止资源耗尽
4. **安全配置**：使用非root用户
5. **数据持久化**：重要数据使用卷挂载
6. **监控告警**：及时发现问题
7. **备份策略**：定期备份重要数据

这些配置可以根据您的具体需求进行调整和优化。