# Verto 平台部署与 CI/CD 流水线设计

## 1. 概述

### 1.1 设计目标

本文档详细描述了 Verto 平台的部署架构和 CI/CD 流水线设计，旨在实现：

- **自动化部署**: 从代码提交到生产环境的全自动化流程
- **多环境管理**: 支持开发、测试、预发布、生产等多环境部署
- **容器化部署**: 基于 Docker 的容器化部署方案
- **弹性伸缩**: 支持根据负载自动扩缩容
- **监控告警**: 完善的监控和告警机制
- **回滚机制**: 快速回滚到稳定版本的能力

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD 流水线架构                          │
├─────────────────────────────────────────────────────────────┤
│  代码仓库 → 构建 → 测试 → 打包 → 部署 → 监控 → 告警          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    部署架构图                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   前端应用   │    │   后端服务   │    │   数据库     │      │
│  │  (Electron) │    │  (NestJS)   │    │  (MySQL)    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   CDN分发    │    │  负载均衡    │    │   Redis     │      │
│  │             │    │             │    │   缓存      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 2. 环境规划

### 2.1 环境分类

#### 开发环境 (Development)
- **用途**: 开发人员日常开发和调试
- **特点**: 快速迭代，实时热更新
- **部署方式**: 本地 Docker Compose
- **数据**: 模拟数据，可重置

#### 测试环境 (Testing)
- **用途**: 功能测试、集成测试、性能测试
- **特点**: 稳定的测试数据，自动化测试
- **部署方式**: Kubernetes 集群
- **数据**: 测试数据集，定期重置

#### 预发布环境 (Staging)
- **用途**: 生产前最后验证
- **特点**: 与生产环境配置一致
- **部署方式**: Kubernetes 集群
- **数据**: 生产数据副本（脱敏）

#### 生产环境 (Production)
- **用途**: 正式对外提供服务
- **特点**: 高可用、高性能、高安全性
- **部署方式**: Kubernetes 集群 + 多可用区
- **数据**: 真实生产数据

### 2.2 环境配置

```yaml
# 环境配置示例
environments:
  development:
    domain: dev.verto.local
    database:
      host: localhost
      port: 3306
      name: verto_dev
    redis:
      host: localhost
      port: 6379
    resources:
      cpu: 0.5
      memory: 1Gi
    replicas: 1
    
  testing:
    domain: test.verto.com
    database:
      host: mysql-test.internal
      port: 3306
      name: verto_test
    redis:
      host: redis-test.internal
      port: 6379
    resources:
      cpu: 1
      memory: 2Gi
    replicas: 2
    
  staging:
    domain: staging.verto.com
    database:
      host: mysql-staging.internal
      port: 3306
      name: verto_staging
    redis:
      host: redis-staging.internal
      port: 6379
    resources:
      cpu: 2
      memory: 4Gi
    replicas: 3
    
  production:
    domain: verto.com
    database:
      host: mysql-prod.internal
      port: 3306
      name: verto_prod
    redis:
      host: redis-prod.internal
      port: 6379
    resources:
      cpu: 4
      memory: 8Gi
    replicas: 5
    autoscaling:
      enabled: true
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilization: 70
```

## 3. 容器化方案

### 3.1 Docker 镜像设计

#### 前端应用 Dockerfile

```dockerfile
# 前端应用 Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build:electron

# 生产镜像
FROM node:18-alpine AS production

# 安装 Electron 运行时依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 设置 Chromium 路径
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S electron -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=electron:nodejs /app/dist ./dist
COPY --from=builder --chown=electron:nodejs /app/package*.json ./
COPY --from=builder --chown=electron:nodejs /app/node_modules ./node_modules

# 切换到非 root 用户
USER electron

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "electron:serve"]
```

#### 后端服务 Dockerfile

```dockerfile
# 后端服务 Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产镜像
FROM node:18-alpine AS production

# 安装运行时依赖
RUN apk add --no-cache dumb-init

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# 启动命令
CMD ["dumb-init", "node", "dist/main"]
```

### 3.2 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - API_BASE_URL=http://backend:3001
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - verto-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_HOST=mysql
      - DATABASE_PORT=3306
      - DATABASE_NAME=verto_dev
      - DATABASE_USER=root
      - DATABASE_PASSWORD=password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    depends_on:
      - mysql
      - redis
    networks:
      - verto-network

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=verto_dev
      - MYSQL_USER=verto
      - MYSQL_PASSWORD=verto123
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - verto-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - verto-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - verto-network

volumes:
  mysql-data:
  redis-data:

networks:
  verto-network:
    driver: bridge
```

## 4. CI/CD 流水线设计

### 4.1 GitLab CI/CD 配置

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - build
  - security
  - deploy
  - notify

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  REGISTRY: registry.gitlab.com/verto/platform
  FRONTEND_IMAGE: $REGISTRY/frontend
  BACKEND_IMAGE: $REGISTRY/backend

# 代码质量检查
code-quality:
  stage: validate
  image: node:18-alpine
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run lint
    - pnpm run type-check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# 单元测试
unit-test:
  stage: test
  image: node:18-alpine
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run test:unit
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# 集成测试
integration-test:
  stage: test
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - docker info
    - docker-compose --version
  script:
    - docker-compose -f docker-compose.test.yml up -d
    - docker-compose -f docker-compose.test.yml exec -T backend npm run test:e2e
    - docker-compose -f docker-compose.test.yml down
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# 构建前端镜像
build-frontend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd frontend
    - docker build -t $FRONTEND_IMAGE:$CI_COMMIT_SHA .
    - docker tag $FRONTEND_IMAGE:$CI_COMMIT_SHA $FRONTEND_IMAGE:latest
    - docker push $FRONTEND_IMAGE:$CI_COMMIT_SHA
    - docker push $FRONTEND_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

# 构建后端镜像
build-backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd backend
    - docker build -t $BACKEND_IMAGE:$CI_COMMIT_SHA .
    - docker tag $BACKEND_IMAGE:$CI_COMMIT_SHA $BACKEND_IMAGE:latest
    - docker push $BACKEND_IMAGE:$CI_COMMIT_SHA
    - docker push $BACKEND_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

# 安全扫描
security-scan:
  stage: security
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        -v $PWD:/tmp/.cache/ aquasec/trivy:latest \
        image --exit-code 0 --no-progress --format table \
        $FRONTEND_IMAGE:$CI_COMMIT_SHA
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        -v $PWD:/tmp/.cache/ aquasec/trivy:latest \
        image --exit-code 0 --no-progress --format table \
        $BACKEND_IMAGE:$CI_COMMIT_SHA
  allow_failure: true
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

# 部署到测试环境
deploy-testing:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_TESTING
    - envsubst < k8s/testing/deployment.yaml | kubectl apply -f -
    - kubectl rollout status deployment/verto-frontend -n testing
    - kubectl rollout status deployment/verto-backend -n testing
  environment:
    name: testing
    url: https://test.verto.com
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# 部署到预发布环境
deploy-staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_STAGING
    - envsubst < k8s/staging/deployment.yaml | kubectl apply -f -
    - kubectl rollout status deployment/verto-frontend -n staging
    - kubectl rollout status deployment/verto-backend -n staging
  environment:
    name: staging
    url: https://staging.verto.com
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# 部署到生产环境
deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_PRODUCTION
    - envsubst < k8s/production/deployment.yaml | kubectl apply -f -
    - kubectl rollout status deployment/verto-frontend -n production
    - kubectl rollout status deployment/verto-backend -n production
  environment:
    name: production
    url: https://verto.com
  when: manual
  only:
    - tags

# 通知
notify-success:
  stage: notify
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ Verto 部署成功\n环境: '$CI_ENVIRONMENT_NAME'\n版本: '$CI_COMMIT_SHA'\n分支: '$CI_COMMIT_REF_NAME'"}' \
        $SLACK_WEBHOOK_URL
  when: on_success
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

notify-failure:
  stage: notify
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"❌ Verto 部署失败\n环境: '$CI_ENVIRONMENT_NAME'\n版本: '$CI_COMMIT_SHA'\n分支: '$CI_COMMIT_REF_NAME'\n查看详情: '$CI_PIPELINE_URL'"}' \
        $SLACK_WEBHOOK_URL
  when: on_failure
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG
```

### 4.2 GitHub Actions 配置

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 代码质量检查
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm run lint

      - name: Run type checking
        run: pnpm run type-check

  # 测试
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm run test:unit

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # 构建和推送镜像
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name != 'pull_request'
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        service: [frontend, backend]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 安全扫描
  security:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name != 'pull_request'
    strategy:
      matrix:
        service: [frontend, backend]
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # 部署到测试环境
  deploy-testing:
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: testing
      url: https://test.verto.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_TESTING }}

      - name: Deploy to testing
        run: |
          envsubst < k8s/testing/deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment/verto-frontend -n testing
          kubectl rollout status deployment/verto-backend -n testing
        env:
          IMAGE_TAG: ${{ github.sha }}

  # 部署到生产环境
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, security]
    if: startsWith(github.ref, 'refs/tags/v')
    environment:
      name: production
      url: https://verto.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}

      - name: Deploy to production
        run: |
          envsubst < k8s/production/deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment/verto-frontend -n production
          kubectl rollout status deployment/verto-backend -n production
        env:
          IMAGE_TAG: ${{ github.ref_name }}

  # 通知
  notify:
    runs-on: ubuntu-latest
    needs: [deploy-testing, deploy-production]
    if: always()
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 5. Kubernetes 部署配置

### 5.1 命名空间配置

```yaml
# k8s/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: verto-testing
  labels:
    name: verto-testing
    environment: testing
---
apiVersion: v1
kind: Namespace
metadata:
  name: verto-staging
  labels:
    name: verto-staging
    environment: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: verto-production
  labels:
    name: verto-production
    environment: production
```

### 5.2 ConfigMap 配置

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: verto-config
  namespace: ${NAMESPACE}
data:
  NODE_ENV: "${NODE_ENV}"
  API_BASE_URL: "${API_BASE_URL}"
  DATABASE_HOST: "${DATABASE_HOST}"
  DATABASE_PORT: "${DATABASE_PORT}"
  DATABASE_NAME: "${DATABASE_NAME}"
  REDIS_HOST: "${REDIS_HOST}"
  REDIS_PORT: "${REDIS_PORT}"
  LOG_LEVEL: "${LOG_LEVEL}"
  CORS_ORIGIN: "${CORS_ORIGIN}"
```

### 5.3 Secret 配置

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: verto-secret
  namespace: ${NAMESPACE}
type: Opaque
data:
  DATABASE_PASSWORD: ${DATABASE_PASSWORD_BASE64}
  JWT_SECRET: ${JWT_SECRET_BASE64}
  REDIS_PASSWORD: ${REDIS_PASSWORD_BASE64}
  ENCRYPTION_KEY: ${ENCRYPTION_KEY_BASE64}
```

### 5.4 前端部署配置

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verto-frontend
  namespace: ${NAMESPACE}
  labels:
    app: verto-frontend
    version: ${IMAGE_TAG}
spec:
  replicas: ${FRONTEND_REPLICAS}
  selector:
    matchLabels:
      app: verto-frontend
  template:
    metadata:
      labels:
        app: verto-frontend
        version: ${IMAGE_TAG}
    spec:
      containers:
      - name: frontend
        image: ${FRONTEND_IMAGE}:${IMAGE_TAG}
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: NODE_ENV
        - name: API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: API_BASE_URL
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
---
apiVersion: v1
kind: Service
metadata:
  name: verto-frontend-service
  namespace: ${NAMESPACE}
spec:
  selector:
    app: verto-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### 5.5 后端部署配置

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: verto-backend
  namespace: ${NAMESPACE}
  labels:
    app: verto-backend
    version: ${IMAGE_TAG}
spec:
  replicas: ${BACKEND_REPLICAS}
  selector:
    matchLabels:
      app: verto-backend
  template:
    metadata:
      labels:
        app: verto-backend
        version: ${IMAGE_TAG}
    spec:
      containers:
      - name: backend
        image: ${BACKEND_IMAGE}:${IMAGE_TAG}
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: NODE_ENV
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: DATABASE_HOST
        - name: DATABASE_PORT
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: DATABASE_PORT
        - name: DATABASE_NAME
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: DATABASE_NAME
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: verto-secret
              key: DATABASE_PASSWORD
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: REDIS_HOST
        - name: REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: verto-config
              key: REDIS_PORT
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: verto-secret
              key: JWT_SECRET
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
---
apiVersion: v1
kind: Service
metadata:
  name: verto-backend-service
  namespace: ${NAMESPACE}
spec:
  selector:
    app: verto-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

### 5.6 Ingress 配置

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: verto-ingress
  namespace: ${NAMESPACE}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - ${DOMAIN}
    secretName: verto-tls
  rules:
  - host: ${DOMAIN}
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: verto-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: verto-frontend-service
            port:
              number: 80
```

### 5.7 HPA 自动扩缩容

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: verto-frontend-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verto-frontend
  minReplicas: ${MIN_REPLICAS}
  maxReplicas: ${MAX_REPLICAS}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: verto-backend-hpa
  namespace: ${NAMESPACE}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verto-backend
  minReplicas: ${MIN_REPLICAS}
  maxReplicas: ${MAX_REPLICAS}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 6. 监控和告警

### 6.1 Prometheus 监控配置

```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "/etc/prometheus/rules/*.yml"
    
    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
    
    scrape_configs:
      - job_name: 'prometheus'
        static_configs:
          - targets: ['localhost:9090']
      
      - job_name: 'verto-frontend'
        kubernetes_sd_configs:
          - role: endpoints
            namespaces:
              names:
                - verto-production
                - verto-staging
                - verto-testing
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: verto-frontend-service
          - source_labels: [__meta_kubernetes_endpoint_port_name]
            action: keep
            regex: metrics
      
      - job_name: 'verto-backend'
        kubernetes_sd_configs:
          - role: endpoints
            namespaces:
              names:
                - verto-production
                - verto-staging
                - verto-testing
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: verto-backend-service
          - source_labels: [__meta_kubernetes_endpoint_port_name]
            action: keep
            regex: metrics
      
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
      
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
```

### 6.2 告警规则配置

```yaml
# monitoring/alert-rules.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  verto-alerts.yml: |
    groups:
    - name: verto.rules
      rules:
      # 应用可用性告警
      - alert: VertoServiceDown
        expr: up{job=~"verto-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Verto service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute."
      
      # 高错误率告警
      - alert: VertoHighErrorRate
        expr: |
          (
            rate(http_requests_total{job=~"verto-.*",status=~"5.."}[5m])
            /
            rate(http_requests_total{job=~"verto-.*"}[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "{{ $labels.job }} has error rate above 5% for 5 minutes."
      
      # 高响应时间告警
      - alert: VertoHighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket{job=~"verto-.*"}[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "{{ $labels.job }} 95th percentile latency is above 1s for 5 minutes."
      
      # CPU 使用率告警
      - alert: VertoHighCPUUsage
        expr: |
          (
            rate(container_cpu_usage_seconds_total{pod=~"verto-.*"}[5m])
            * 100
          ) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "{{ $labels.pod }} CPU usage is above 80% for 10 minutes."
      
      # 内存使用率告警
      - alert: VertoHighMemoryUsage
        expr: |
          (
            container_memory_working_set_bytes{pod=~"verto-.*"}
            /
            container_spec_memory_limit_bytes{pod=~"verto-.*"}
            * 100
          ) > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "{{ $labels.pod }} memory usage is above 85% for 10 minutes."
      
      # 磁盘空间告警
      - alert: VertoDiskSpaceLow
        expr: |
          (
            node_filesystem_avail_bytes{mountpoint="/"}
            /
            node_filesystem_size_bytes{mountpoint="/"}
            * 100
          ) < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space detected"
          description: "Node {{ $labels.instance }} has less than 10% disk space available."
      
      # 数据库连接告警
      - alert: VertoDatabaseConnectionHigh
        expr: mysql_global_status_threads_connected > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "MySQL has more than 80 active connections for 5 minutes."
```

### 6.3 Grafana 仪表板配置

```json
{
  "dashboard": {
    "id": null,
    "title": "Verto Platform Monitoring",
    "tags": ["verto", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Service Availability",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"verto-.*\"}",
            "legendFormat": "{{ job }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "options": {
                  "0": {
                    "text": "DOWN",
                    "color": "red"
                  },
                  "1": {
                    "text": "UP",
                    "color": "green"
                  }
                },
                "type": "value"
              }
            ]
          }
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=~\"verto-.*\"}[5m])",
            "legendFormat": "{{ job }} - {{ method }} {{ status }}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        }
      },
      {
        "id": 3,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~\"verto-.*\"}[5m]))",
            "legendFormat": "{{ job }} - 95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job=~\"verto-.*\"}[5m]))",
            "legendFormat": "{{ job }} - 50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 24,
          "x": 0,
          "y": 8
        }
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=~\"verto-.*\",status=~\"5..\"}[5m]) / rate(http_requests_total{job=~\"verto-.*\"}[5m])",
            "legendFormat": "{{ job }} - Error Rate"
          }
        ],
        "yAxes": [
          {
            "label": "Error Rate",
            "max": 1,
            "min": 0
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 16
        }
      },
      {
        "id": 5,
        "title": "Resource Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total{pod=~\"verto-.*\"}[5m]) * 100",
            "legendFormat": "{{ pod }} - CPU %"
          },
          {
            "expr": "container_memory_working_set_bytes{pod=~\"verto-.*\"} / container_spec_memory_limit_bytes{pod=~\"verto-.*\"} * 100",
            "legendFormat": "{{ pod }} - Memory %"
          }
        ],
        "yAxes": [
          {
            "label": "Percentage",
            "max": 100,
            "min": 0
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 16
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

## 7. 安全配置

### 7.1 网络策略

```yaml
# security/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: verto-network-policy
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: verto-frontend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: verto-backend
    ports:
    - protocol: TCP
      port: 3001
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: verto-backend-network-policy
  namespace: ${NAMESPACE}
spec:
  podSelector:
    matchLabels:
      app: verto-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: verto-frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mysql
    ports:
    - protocol: TCP
      port: 3306
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
```

### 7.2 Pod 安全策略

```yaml
# security/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: verto-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: false
```

### 7.3 RBAC 配置

```yaml
# security/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: verto-service-account
  namespace: ${NAMESPACE}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: ${NAMESPACE}
  name: verto-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: verto-role-binding
  namespace: ${NAMESPACE}
subjects:
- kind: ServiceAccount
  name: verto-service-account
  namespace: ${NAMESPACE}
roleRef:
  kind: Role
  name: verto-role
  apiGroup: rbac.authorization.k8s.io
```

## 8. 备份和恢复

### 8.1 数据库备份策略

```yaml
# backup/mysql-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: ${NAMESPACE}
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点执行
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mysql-backup
            image: mysql:8.0
            command:
            - /bin/bash
            - -c
            - |
              BACKUP_FILE="verto_backup_$(date +%Y%m%d_%H%M%S).sql"
              mysqldump -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD $DATABASE_NAME > /backup/$BACKUP_FILE
              
              # 上传到云存储
              aws s3 cp /backup/$BACKUP_FILE s3://$BACKUP_BUCKET/mysql/
              
              # 清理本地文件
              rm /backup/$BACKUP_FILE
              
              # 清理7天前的备份
              aws s3 ls s3://$BACKUP_BUCKET/mysql/ | while read -r line; do
                createDate=`echo $line|awk {'print $1" "$2'}`
                createDate=`date -d"$createDate" +%s`
                olderThan=`date -d"7 days ago" +%s`
                if [[ $createDate -lt $olderThan ]]; then
                  fileName=`echo $line|awk {'print $4'}`
                  if [[ $fileName != "" ]]; then
                    aws s3 rm s3://$BACKUP_BUCKET/mysql/$fileName
                  fi
                fi
              done
            env:
            - name: DATABASE_HOST
              valueFrom:
                configMapKeyRef:
                  name: verto-config
                  key: DATABASE_HOST
            - name: DATABASE_USER
              value: "root"
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: verto-secret
                  key: DATABASE_PASSWORD
            - name: DATABASE_NAME
              valueFrom:
                configMapKeyRef:
                  name: verto-config
                  key: DATABASE_NAME
            - name: BACKUP_BUCKET
              value: "verto-backups"
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: secret-access-key
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

### 8.2 应用配置备份

```bash
#!/bin/bash
# scripts/backup-configs.sh

set -e

NAMESPACE=${1:-verto-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p $BACKUP_DIR

echo "Backing up ConfigMaps..."
kubectl get configmaps -n $NAMESPACE -o yaml > $BACKUP_DIR/configmaps.yaml

echo "Backing up Secrets..."
kubectl get secrets -n $NAMESPACE -o yaml > $BACKUP_DIR/secrets.yaml

echo "Backing up Deployments..."
kubectl get deployments -n $NAMESPACE -o yaml > $BACKUP_DIR/deployments.yaml

echo "Backing up Services..."
kubectl get services -n $NAMESPACE -o yaml > $BACKUP_DIR/services.yaml

echo "Backing up Ingress..."
kubectl get ingress -n $NAMESPACE -o yaml > $BACKUP_DIR/ingress.yaml

echo "Backing up HPA..."
kubectl get hpa -n $NAMESPACE -o yaml > $BACKUP_DIR/hpa.yaml

echo "Creating archive..."
tar -czf "backup_${NAMESPACE}_$(date +%Y%m%d_%H%M%S).tar.gz" -C ./backups .

echo "Uploading to cloud storage..."
aws s3 cp "backup_${NAMESPACE}_$(date +%Y%m%d_%H%M%S).tar.gz" s3://verto-backups/configs/

echo "Cleaning up local files..."
rm -rf $BACKUP_DIR
rm "backup_${NAMESPACE}_$(date +%Y%m%d_%H%M%S).tar.gz"

echo "Backup completed successfully!"
```

## 9. 灾难恢复

### 9.1 恢复流程

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

NAMESPACE=${1:-verto-production}
BACKUP_FILE=${2}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <namespace> <backup-file>"
    echo "Example: $0 verto-production backup_verto-production_20240101_120000.tar.gz"
    exit 1
fi

echo "Starting disaster recovery for namespace: $NAMESPACE"
echo "Using backup file: $BACKUP_FILE"

# 下载备份文件
echo "Downloading backup file from cloud storage..."
aws s3 cp s3://verto-backups/configs/$BACKUP_FILE ./

# 解压备份文件
echo "Extracting backup file..."
tar -xzf $BACKUP_FILE

# 获取备份目录名
BACKUP_DIR=$(tar -tzf $BACKUP_FILE | head -1 | cut -f1 -d"/")

echo "Restoring namespace: $NAMESPACE"

# 创建命名空间（如果不存在）
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 恢复 Secrets（优先级最高）
echo "Restoring Secrets..."
kubectl apply -f $BACKUP_DIR/secrets.yaml -n $NAMESPACE

# 恢复 ConfigMaps
echo "Restoring ConfigMaps..."
kubectl apply -f $BACKUP_DIR/configmaps.yaml -n $NAMESPACE

# 恢复 Services
echo "Restoring Services..."
kubectl apply -f $BACKUP_DIR/services.yaml -n $NAMESPACE

# 恢复 Deployments
echo "Restoring Deployments..."
kubectl apply -f $BACKUP_DIR/deployments.yaml -n $NAMESPACE

# 等待 Deployments 就绪
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n $NAMESPACE

# 恢复 Ingress
echo "Restoring Ingress..."
kubectl apply -f $BACKUP_DIR/ingress.yaml -n $NAMESPACE

# 恢复 HPA
echo "Restoring HPA..."
kubectl apply -f $BACKUP_DIR/hpa.yaml -n $NAMESPACE

# 清理临时文件
echo "Cleaning up temporary files..."
rm -rf $BACKUP_DIR
rm $BACKUP_FILE

echo "Disaster recovery completed successfully!"
echo "Please verify the application is working correctly."
```

### 9.2 数据库恢复

```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

BACKUP_FILE=${1}
TARGET_DATABASE=${2:-verto_restored}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file> [target-database]"
    echo "Example: $0 verto_backup_20240101_120000.sql verto_restored"
    exit 1
fi

echo "Starting database restore..."
echo "Backup file: $BACKUP_FILE"
echo "Target database: $TARGET_DATABASE"

# 下载备份文件
echo "Downloading backup file from cloud storage..."
aws s3 cp s3://verto-backups/mysql/$BACKUP_FILE ./

# 创建目标数据库
echo "Creating target database..."
mysql -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $TARGET_DATABASE;"

# 恢复数据
echo "Restoring database..."
mysql -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD $TARGET_DATABASE < $BACKUP_FILE

# 验证恢复
echo "Verifying restore..."
TABLE_COUNT=$(mysql -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD $TARGET_DATABASE -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TARGET_DATABASE';" -s -N)
echo "Restored $TABLE_COUNT tables"

# 清理临时文件
rm $BACKUP_FILE

echo "Database restore completed successfully!"
echo "Database: $TARGET_DATABASE"
echo "Tables: $TABLE_COUNT"
```

## 10. 性能优化

### 10.1 应用性能优化

```yaml
# performance/resource-optimization.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: performance-config
  namespace: ${NAMESPACE}
data:
  # Node.js 性能优化
  NODE_OPTIONS: "--max-old-space-size=2048 --optimize-for-size"
  UV_THREADPOOL_SIZE: "16"
  
  # 数据库连接池优化
  DB_POOL_MIN: "5"
  DB_POOL_MAX: "20"
  DB_POOL_IDLE_TIMEOUT: "30000"
  DB_POOL_ACQUIRE_TIMEOUT: "60000"
  
  # Redis 连接优化
  REDIS_POOL_MIN: "2"
  REDIS_POOL_MAX: "10"
  REDIS_CONNECT_TIMEOUT: "5000"
  REDIS_COMMAND_TIMEOUT: "3000"
  
  # 缓存策略
  CACHE_TTL_SHORT: "300"    # 5分钟
  CACHE_TTL_MEDIUM: "1800"  # 30分钟
  CACHE_TTL_LONG: "3600"    # 1小时
```

### 10.2 数据库性能优化

```sql
-- database/performance-optimization.sql

-- 创建索引优化查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_created ON users(status, created_at);
CREATE INDEX idx_projects_owner_status ON projects(owner_id, status);
CREATE INDEX idx_requirements_project_status ON requirements(project_id, status);
CREATE INDEX idx_prototypes_requirement_version ON prototypes(requirement_id, version);
CREATE INDEX idx_pipelines_project_status ON pipelines(project_id, status);
CREATE INDEX idx_deployments_pipeline_created ON deployments(pipeline_id, created_at);

-- 分区表优化（日志表）
ALTER TABLE audit_logs PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 查询优化配置
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL query_cache_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
```

### 10.3 CDN 配置

```yaml
# cdn/cloudfront-config.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'CloudFront distribution for Verto platform'

Resources:
  VertoDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Aliases:
          - verto.com
          - www.verto.com
        DefaultCacheBehavior:
          TargetOriginId: verto-origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # Managed-CachingOptimized
          OriginRequestPolicyId: 88a5eaf4-2fd4-4709-b370-b4c650ea3fcf  # Managed-CORS-S3Origin
          ResponseHeadersPolicyId: 67f7725c-6f97-4210-82d7-5512b31e9d03  # Managed-SecurityHeadersPolicy
        CacheBehaviors:
          - PathPattern: '/api/*'
            TargetOriginId: verto-api-origin
            ViewerProtocolPolicy: https-only
            CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
            TTL:
              DefaultTTL: 0
              MaxTTL: 0
          - PathPattern: '/static/*'
            TargetOriginId: verto-static-origin
            ViewerProtocolPolicy: https-only
            CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6  # Managed-CachingOptimizedForUncompressedObjects
            TTL:
              DefaultTTL: 86400  # 1 day
              MaxTTL: 31536000   # 1 year
        Origins:
          - Id: verto-origin
            DomainName: !GetAtt VertoALB.DNSName
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
          - Id: verto-api-origin
            DomainName: !GetAtt VertoALB.DNSName
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
          - Id: verto-static-origin
            DomainName: !GetAtt VertoS3Bucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${VertoOAI}'
        Enabled: true
        HttpVersion: http2
        PriceClass: PriceClass_All
        ViewerCertificate:
          AcmCertificateArn: !Ref VertoSSLCertificate
          SslSupportMethod: sni-only
          MinimumProtocolVersion: TLSv1.2_2021
```

## 11. 成本优化

### 11.1 资源成本优化

```yaml
# cost-optimization/resource-limits.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: verto-limits
  namespace: ${NAMESPACE}
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "1Gi"
    defaultRequest:
      cpu: "100m"
      memory: "256Mi"
    type: Container
  - max:
      cpu: "2"
      memory: "4Gi"
    min:
      cpu: "50m"
      memory: "128Mi"
    type: Container
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: verto-quota
  namespace: ${NAMESPACE}
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
    services: "10"
    secrets: "20"
    configmaps: "20"
```

### 11.2 自动扩缩容策略

```yaml
# cost-optimization/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: verto-frontend-vpa
  namespace: ${NAMESPACE}
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verto-frontend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: frontend
      maxAllowed:
        cpu: 1
        memory: 2Gi
      minAllowed:
        cpu: 100m
        memory: 256Mi
      controlledResources: ["cpu", "memory"]
---
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: verto-backend-vpa
  namespace: ${NAMESPACE}
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: verto-backend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: backend
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 200m
        memory: 512Mi
      controlledResources: ["cpu", "memory"]
```

## 12. 实施计划

### 12.1 阶段规划

#### 第一阶段：基础设施搭建（2周）
- **目标**: 完成基础的 CI/CD 流水线和开发环境
- **任务**:
  - 搭建 GitLab/GitHub CI/CD 流水线
  - 配置 Docker 镜像构建
  - 部署开发环境
  - 配置基础监控

#### 第二阶段：测试环境部署（1周）
- **目标**: 完成测试环境的自动化部署
- **任务**:
  - 配置 Kubernetes 测试集群
  - 实现自动化测试集成
  - 配置测试数据管理
  - 完善监控告警

#### 第三阶段：生产环境准备（2周）
- **目标**: 完成生产环境的高可用部署
- **任务**:
  - 配置生产 Kubernetes 集群
  - 实现多可用区部署
  - 配置备份和恢复机制
  - 完善安全策略

#### 第四阶段：性能优化（1周）
- **目标**: 优化系统性能和成本
- **任务**:
  - 配置 CDN 和缓存策略
  - 优化数据库性能
  - 实现自动扩缩容
  - 成本监控和优化

### 12.2 关键里程碑

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| CI/CD 流水线完成 | 第1周 | 自动化构建和部署流水线 |
| 开发环境就绪 | 第2周 | 完整的开发环境和工具链 |
| 测试环境部署 | 第3周 | 自动化测试环境 |
| 生产环境上线 | 第5周 | 高可用生产环境 |
| 性能优化完成 | 第6周 | 优化后的系统性能 |

## 13. 风险评估

### 13.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Kubernetes 集群故障 | 中 | 高 | 多可用区部署，定期备份 |
| 数据库性能瓶颈 | 中 | 中 | 读写分离，缓存策略 |
| 网络安全威胁 | 低 | 高 | 网络策略，安全扫描 |
| 存储空间不足 | 低 | 中 | 监控告警，自动扩容 |

### 13.2 运维风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 人员操作失误 | 中 | 中 | RBAC 权限控制，操作审计 |
| 配置错误 | 中 | 中 | 配置管理，代码审查 |
| 监控盲区 | 低 | 中 | 全面监控覆盖，定期检查 |
| 备份失败 | 低 | 高 | 多重备份策略，定期验证 |

## 14. 总结

本文档详细描述了 Verto 平台的部署架构和 CI/CD 流水线设计，涵盖了从开发到生产的完整流程。通过容器化部署、自动化流水线、监控告警、安全策略等多个维度，确保了系统的高可用性、高性能和高安全性。

### 14.1 核心优势

1. **全自动化**: 从代码提交到生产部署的全自动化流程
2. **高可用性**: 多可用区部署，自动故障转移
3. **弹性伸缩**: 基于负载的自动扩缩容
4. **安全可靠**: 完善的安全策略和备份机制
5. **成本优化**: 智能资源管理和成本控制

### 14.2 后续优化方向

1. **服务网格**: 引入 Istio 实现更精细的流量管理
2. **GitOps**: 采用 ArgoCD 实现声明式部署
3. **可观测性**: 引入分布式链路追踪
4. **混沌工程**: 实施故障注入测试
5. **多云部署**: 支持多云环境的混合部署

通过持续的优化和改进，Verto 平台将能够为用户提供更加稳定、高效的服务体验。