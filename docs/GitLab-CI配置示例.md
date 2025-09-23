# GitLab CI/CD 配置示例

## 📋 Verto项目CI/CD配置

### 1. 基础 .gitlab-ci.yml 配置

```yaml
# GitLab CI/CD 配置文件
# 放置在项目根目录

# 定义阶段
stages:
  - build
  - test
  - quality
  - package
  - deploy

# 全局变量
variables:
  # Maven配置
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"
  MAVEN_CLI_OPTS: "--batch-mode --errors --fail-at-end --show-version"
  
  # Node.js配置
  NODE_VERSION: "18"
  PNPM_VERSION: "8.15.0"
  
  # Docker配置
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  
  # 应用配置
  APP_NAME: "verto"
  FRONTEND_DIR: "jeecgboot-vue3"
  BACKEND_DIR: "jeecg-boot"

# 缓存配置
cache:
  paths:
    - .m2/repository/
    - node_modules/
    - $FRONTEND_DIR/node_modules/

# 前端构建任务
frontend:build:
  stage: build
  image: node:18-alpine
  before_script:
    - npm install -g pnpm@$PNPM_VERSION
    - cd $FRONTEND_DIR
    - pnpm config set store-dir .pnpm-store
  script:
    - pnpm install --frozen-lockfile
    - pnpm build
  artifacts:
    paths:
      - $FRONTEND_DIR/dist/
    expire_in: 1 hour
  cache:
    key: frontend-$CI_COMMIT_REF_SLUG
    paths:
      - $FRONTEND_DIR/node_modules/
      - $FRONTEND_DIR/.pnpm-store/
  only:
    changes:
      - jeecgboot-vue3/**/*
      - .gitlab-ci.yml

# 后端构建任务
backend:build:
  stage: build
  image: maven:3.8.6-openjdk-8
  before_script:
    - cd $BACKEND_DIR
  script:
    - mvn $MAVEN_CLI_OPTS clean compile
  artifacts:
    paths:
      - $BACKEND_DIR/target/
    expire_in: 1 hour
  cache:
    key: backend-$CI_COMMIT_REF_SLUG
    paths:
      - .m2/repository/
  only:
    changes:
      - jeecg-boot/**/*
      - .gitlab-ci.yml

# 前端测试
frontend:test:
  stage: test
  image: node:18-alpine
  needs: ["frontend:build"]
  before_script:
    - npm install -g pnpm@$PNPM_VERSION
    - cd $FRONTEND_DIR
  script:
    - pnpm install --frozen-lockfile
    - pnpm test:unit
    - pnpm lint
    - pnpm type-check
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      junit: $FRONTEND_DIR/test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: $FRONTEND_DIR/coverage/cobertura-coverage.xml
    paths:
      - $FRONTEND_DIR/coverage/
  only:
    changes:
      - jeecgboot-vue3/**/*
      - .gitlab-ci.yml

# 后端测试
backend:test:
  stage: test
  image: maven:3.8.6-openjdk-8
  needs: ["backend:build"]
  before_script:
    - cd $BACKEND_DIR
  script:
    - mvn $MAVEN_CLI_OPTS test
  coverage: '/Total.*?([0-9]{1,3})%/'
  artifacts:
    reports:
      junit: $BACKEND_DIR/target/surefire-reports/TEST-*.xml
      coverage_report:
        coverage_format: cobertura
        path: $BACKEND_DIR/target/site/cobertura/coverage.xml
    paths:
      - $BACKEND_DIR/target/surefire-reports/
      - $BACKEND_DIR/target/site/jacoco/
  only:
    changes:
      - jeecg-boot/**/*
      - .gitlab-ci.yml

# 代码质量检查
code:quality:
  stage: quality
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
    GIT_DEPTH: "0"
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
  allow_failure: true
  only:
    - main
    - develop

# 前端Docker镜像构建
frontend:package:
  stage: package
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  needs: ["frontend:build", "frontend:test"]
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd $FRONTEND_DIR
    - |
      cat > Dockerfile << EOF
      FROM nginx:alpine
      COPY dist/ /usr/share/nginx/html/
      COPY nginx.conf /etc/nginx/nginx.conf
      EXPOSE 80
      CMD ["nginx", "-g", "daemon off;"]
      EOF
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE/frontend:latest .
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:latest
  only:
    - main
    - develop

# 后端Docker镜像构建
backend:package:
  stage: package
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  needs: ["backend:build", "backend:test"]
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd $BACKEND_DIR
    - mvn $MAVEN_CLI_OPTS clean package -DskipTests
    - |
      cat > Dockerfile << EOF
      FROM openjdk:8-jre-alpine
      VOLUME /tmp
      COPY target/*.jar app.jar
      EXPOSE 8080
      ENTRYPOINT ["java","-jar","/app.jar"]
      EOF
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE/backend:latest .
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/backend:latest
  only:
    - main
    - develop

# 部署到开发环境
deploy:dev:
  stage: deploy
  image: alpine:latest
  needs: ["frontend:package", "backend:package"]
  before_script:
    - apk add --no-cache curl
  script:
    - echo "部署到开发环境"
    - |
      cat > docker-compose.dev.yml << EOF
      version: '3.8'
      services:
        frontend:
          image: $CI_REGISTRY_IMAGE/frontend:latest
          ports:
            - "3000:80"
        backend:
          image: $CI_REGISTRY_IMAGE/backend:latest
          ports:
            - "8080:8080"
          environment:
            - SPRING_PROFILES_ACTIVE=dev
      EOF
    # 这里可以添加实际的部署命令
    # 例如：scp docker-compose.dev.yml user@dev-server:/path/
    # 例如：ssh user@dev-server "docker-compose -f /path/docker-compose.dev.yml up -d"
  environment:
    name: development
    url: http://dev.verto.local
  only:
    - develop

# 部署到测试环境
deploy:test:
  stage: deploy
  image: alpine:latest
  needs: ["frontend:package", "backend:package"]
  script:
    - echo "部署到测试环境"
    # 测试环境部署逻辑
  environment:
    name: testing
    url: http://test.verto.local
  when: manual
  only:
    - main

# 部署到生产环境
deploy:prod:
  stage: deploy
  image: alpine:latest
  needs: ["frontend:package", "backend:package"]
  script:
    - echo "部署到生产环境"
    # 生产环境部署逻辑
  environment:
    name: production
    url: http://verto.local
  when: manual
  only:
    - main
  allow_failure: false
```

### 2. 简化版配置（适合小项目）

```yaml
stages:
  - build
  - deploy

variables:
  FRONTEND_DIR: "jeecgboot-vue3"
  BACKEND_DIR: "jeecg-boot"

# 前端构建和部署
frontend:
  stage: build
  image: node:18-alpine
  script:
    - cd $FRONTEND_DIR
    - npm install -g pnpm
    - pnpm install
    - pnpm build
  artifacts:
    paths:
      - $FRONTEND_DIR/dist/
  only:
    changes:
      - jeecgboot-vue3/**/*

# 后端构建和部署
backend:
  stage: build
  image: maven:3.8.6-openjdk-8
  script:
    - cd $BACKEND_DIR
    - mvn clean package -DskipTests
  artifacts:
    paths:
      - $BACKEND_DIR/target/*.jar
  only:
    changes:
      - jeecg-boot/**/*

# 部署
deploy:
  stage: deploy
  script:
    - echo "应用部署完成"
  when: manual
  only:
    - main
```

### 3. 多环境配置

```yaml
# 开发环境变量
.dev_variables: &dev_variables
  ENVIRONMENT: "development"
  DATABASE_URL: "jdbc:mysql://dev-db:3306/verto"
  REDIS_URL: "redis://dev-redis:6379"

# 测试环境变量
.test_variables: &test_variables
  ENVIRONMENT: "testing"
  DATABASE_URL: "jdbc:mysql://test-db:3306/verto"
  REDIS_URL: "redis://test-redis:6379"

# 生产环境变量
.prod_variables: &prod_variables
  ENVIRONMENT: "production"
  DATABASE_URL: "jdbc:mysql://prod-db:3306/verto"
  REDIS_URL: "redis://prod-redis:6379"

# 部署模板
.deploy_template: &deploy_template
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - echo "部署到 $ENVIRONMENT 环境"

deploy:dev:
  <<: *deploy_template
  stage: deploy
  variables:
    <<: *dev_variables
  environment:
    name: development
  only:
    - develop

deploy:test:
  <<: *deploy_template
  stage: deploy
  variables:
    <<: *test_variables
  environment:
    name: testing
  when: manual
  only:
    - main

deploy:prod:
  <<: *deploy_template
  stage: deploy
  variables:
    <<: *prod_variables
  environment:
    name: production
  when: manual
  only:
    - main
```

## 🔧 GitLab配置步骤

### 1. 启用GitLab Runner
```bash
# 在GitLab容器中注册Runner
docker exec -it gitlab-ce gitlab-runner register \
  --url http://localhost:8080 \
  --registration-token YOUR_TOKEN \
  --executor docker \
  --docker-image alpine:latest \
  --description "Docker Runner"
```

### 2. 配置项目变量
在GitLab项目中设置以下变量：
- `CI_REGISTRY_USER`: Docker注册表用户名
- `CI_REGISTRY_PASSWORD`: Docker注册表密码
- `SSH_PRIVATE_KEY`: 部署用的SSH私钥
- `SONAR_TOKEN`: SonarQube访问令牌

### 3. 配置Webhook
1. 进入项目 Settings -> Webhooks
2. 添加触发器URL
3. 选择触发事件

### 4. 设置环境保护
1. 进入项目 Settings -> CI/CD -> Environments
2. 为生产环境设置保护规则
3. 指定可以部署的用户/角色

## 📝 SonarQube配置

创建 `sonar-project.properties`：

```properties
# SonarQube项目配置
sonar.projectKey=verto
sonar.projectName=Verto
sonar.projectVersion=1.0

# 源码路径
sonar.sources=jeecgboot-vue3/src,jeecg-boot/src/main
sonar.tests=jeecgboot-vue3/src/__tests__,jeecg-boot/src/test

# 排除文件
sonar.exclusions=**/node_modules/**,**/dist/**,**/target/**

# 语言特定配置
sonar.java.source=8
sonar.java.binaries=jeecg-boot/target/classes
sonar.javascript.lcov.reportPaths=jeecgboot-vue3/coverage/lcov.info

# 覆盖率报告
sonar.coverage.jacoco.xmlReportPaths=jeecg-boot/target/site/jacoco/jacoco.xml
```

## 🔍 常用CI/CD模式

### 1. 功能分支工作流
```yaml
# 只在特定分支运行
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
    - if: $CI_MERGE_REQUEST_IID

# 合并请求管道
merge_request:
  stage: test
  script:
    - echo "运行合并请求检查"
  only:
    - merge_requests
```

### 2. 条件执行
```yaml
# 基于文件变更的条件执行
frontend:build:
  script:
    - echo "构建前端"
  only:
    changes:
      - "jeecgboot-vue3/**/*"

# 基于变量的条件执行
deploy:
  script:
    - echo "部署应用"
  rules:
    - if: $CI_COMMIT_BRANCH == "main" && $DEPLOY_ENABLED == "true"
```

### 3. 并行任务
```yaml
# 并行执行多个任务
test:
  stage: test
  parallel:
    matrix:
      - NODE_VERSION: ["16", "18", "20"]
  script:
    - node --version
    - npm test
```

### 4. 依赖管理
```yaml
# 任务依赖
deploy:
  stage: deploy
  needs:
    - job: frontend:build
      artifacts: true
    - job: backend:build
      artifacts: true
  script:
    - echo "部署应用"
```

## 📊 监控和通知

### 1. Slack通知
```yaml
notify:slack:
  stage: .post
  image: alpine:latest
  script:
    - |
      curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"构建完成: '"$CI_PROJECT_NAME"' - '"$CI_COMMIT_REF_NAME"'"}' \
      $SLACK_WEBHOOK_URL
  when: always
```

### 2. 邮件通知
```yaml
notify:email:
  stage: .post
  script:
    - echo "发送邮件通知"
  only:
    - main
  when: on_failure
```

### 3. 构建状态徽章
在README.md中添加：
```markdown
[![pipeline status](http://localhost:8080/root/verto/badges/main/pipeline.svg)](http://localhost:8080/root/verto/-/commits/main)
[![coverage report](http://localhost:8080/root/verto/badges/main/coverage.svg)](http://localhost:8080/root/verto/-/commits/main)
```

---

## 💡 最佳实践

1. **使用缓存**：加速构建过程
2. **并行执行**：提高构建效率
3. **条件执行**：避免不必要的任务
4. **环境隔离**：不同环境使用不同配置
5. **安全管理**：使用GitLab变量存储敏感信息
6. **监控告警**：及时了解构建状态

这些配置可以根据您的具体需求进行调整和优化。