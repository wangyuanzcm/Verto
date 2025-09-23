# Verto DevOps 环境操作指南

## 📋 目录
1. [环境准备](#环境准备)
2. [快速启动](#快速启动)
3. [详细操作步骤](#详细操作步骤)
4. [GitLab配置](#gitlab配置)
5. [Jenkins配置](#jenkins配置)
6. [项目集成](#项目集成)
7. [常见问题](#常见问题)
8. [维护操作](#维护操作)

## 🔧 环境准备

### 1. 系统要求检查
```powershell
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker compose version

# 检查可用内存（建议8GB以上）
Get-WmiObject -Class Win32_ComputerSystem | Select-Object TotalPhysicalMemory

# 检查磁盘空间（建议20GB以上可用空间）
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace
```

### 2. 启动Docker Desktop
- 确保Docker Desktop正在运行
- 检查Docker设置中的资源分配（建议分配至少4GB内存）

## 🚀 快速启动

### 一键启动所有服务
```batch
# 方法1：双击运行
start-devops.bat

# 方法2：命令行运行
cd d:\github_workspace\Verto
start-devops.bat
```

### 检查服务状态
```batch
# 检查所有服务状态
devops-status.bat

# 或者使用Docker命令
docker compose -f docker-compose-devops.yml ps
```

## 📝 详细操作步骤

### 步骤1：准备环境文件
确保以下文件存在：
- `docker-compose-devops.yml` - 主配置文件
- `.env.devops` - 环境变量
- `jenkins/` - Jenkins配置目录
- `gitlab/` - GitLab配置目录

### 步骤2：创建数据目录
```powershell
# 创建必要的数据目录
New-Item -ItemType Directory -Force -Path jenkins_home, gitlab\config, gitlab\logs, gitlab\data
```

### 步骤3：拉取Docker镜像
```powershell
# 拉取所有需要的镜像
docker compose -f docker-compose-devops.yml --env-file .env.devops pull
```

### 步骤4：启动服务
```powershell
# 启动所有服务（后台运行）
docker compose -f docker-compose-devops.yml --env-file .env.devops up -d

# 查看启动日志
docker compose -f docker-compose-devops.yml logs -f
```

### 步骤5：等待服务初始化
- GitLab：首次启动需要5-10分钟
- Jenkins：首次启动需要2-3分钟安装插件

## 🦊 GitLab配置

### 1. 首次访问
- 访问地址：http://localhost:8080
- 默认用户：`root`
- 默认密码：`gitlab123456`

### 2. 基础配置步骤
```markdown
1. 登录GitLab管理界面
2. 修改root用户密码（推荐）
3. 创建新用户和组织
4. 配置SSH密钥
5. 创建第一个项目
```

### 3. 创建Verto项目
```bash
# 在GitLab中创建新项目后，推送现有代码
cd d:\github_workspace\Verto
git remote add gitlab http://localhost:8080/root/verto.git
git push -u gitlab main
```

### 4. SSH配置
```bash
# 生成SSH密钥（如果没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 添加SSH密钥到GitLab
# 复制公钥内容：cat ~/.ssh/id_rsa.pub
# 在GitLab中：Settings -> SSH Keys -> 添加密钥

# 测试SSH连接
ssh -T -p 2222 git@localhost
```

## 🔧 Jenkins配置

### 1. 首次访问
- 访问地址：http://localhost:8081
- 默认用户：`admin`
- 默认密码：`admin123`

### 2. 基础配置步骤
```markdown
1. 登录Jenkins管理界面
2. 安装推荐插件（已预配置）
3. 创建新用户（可选）
4. 配置系统设置
5. 配置全局工具
```

### 3. 配置GitLab连接
```markdown
1. 进入 "Manage Jenkins" -> "Configure System"
2. 找到 "GitLab" 部分
3. 添加GitLab服务器：
   - Name: Local GitLab
   - GitLab host URL: http://gitlab:8080
   - Credentials: 添加GitLab访问令牌
```

### 4. 创建Pipeline任务
```groovy
pipeline {
    agent any
    
    environment {
        NODEJS_HOME = tool 'NodeJS'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'http://gitlab:8080/root/verto.git'
            }
        }
        
        stage('Install Dependencies - Frontend') {
            steps {
                dir('jeecgboot-vue3') {
                    sh 'pnpm install'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('jeecgboot-vue3') {
                    sh 'pnpm build'
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                dir('jeecgboot-vue3') {
                    sh 'pnpm test'
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('jeecg-boot') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // 添加部署逻辑
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

## 🔗 项目集成

### 1. 前端项目集成
```bash
# 进入前端目录
cd jeecgboot-vue3

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行测试
pnpm test
```

### 2. 后端项目集成
```bash
# 进入后端目录
cd jeecg-boot

# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包项目
mvn clean package -DskipTests
```

### 3. 配置Webhook
```markdown
1. 在GitLab项目中进入 Settings -> Webhooks
2. 添加Jenkins Webhook URL：
   http://localhost:8081/project/YOUR_JOB_NAME
3. 选择触发事件：Push events, Merge request events
4. 测试Webhook连接
```

## ❓ 常见问题

### 1. 服务启动失败
```powershell
# 检查端口占用
netstat -ano | findstr :8080
netstat -ano | findstr :8081
netstat -ano | findstr :2222

# 停止占用端口的进程
taskkill /PID <进程ID> /F

# 重新启动服务
docker compose -f docker-compose-devops.yml restart
```

### 2. GitLab访问缓慢
```powershell
# 查看GitLab日志
docker compose -f docker-compose-devops.yml logs gitlab

# 检查容器资源使用
docker stats

# 重启GitLab服务
docker compose -f docker-compose-devops.yml restart gitlab
```

### 3. Jenkins插件安装失败
```powershell
# 查看Jenkins日志
docker compose -f docker-compose-devops.yml logs jenkins

# 进入Jenkins容器
docker compose -f docker-compose-devops.yml exec jenkins bash

# 手动安装插件
jenkins-plugin-cli --plugins git:latest
```

### 4. 内存不足
```powershell
# 调整Docker Desktop内存分配
# Docker Desktop -> Settings -> Resources -> Advanced

# 或修改 .env.devops 文件中的内存限制
GITLAB_MEMORY_LIMIT=2g
JENKINS_MEMORY_LIMIT=1g
```

## 🛠️ 维护操作

### 1. 备份数据
```powershell
# 备份GitLab数据
docker compose -f docker-compose-devops.yml exec gitlab gitlab-backup create

# 备份Jenkins数据
docker cp verto-jenkins:/var/jenkins_home ./jenkins_backup

# 备份数据库
docker compose -f docker-compose-devops.yml exec postgres pg_dump -U gitlab gitlabhq_production > gitlab_db_backup.sql
```

### 2. 更新服务
```powershell
# 拉取最新镜像
docker compose -f docker-compose-devops.yml pull

# 重新创建容器
docker compose -f docker-compose-devops.yml up -d --force-recreate
```

### 3. 清理资源
```powershell
# 停止所有服务
docker compose -f docker-compose-devops.yml down

# 清理未使用的镜像
docker image prune -f

# 清理未使用的卷（注意：会删除数据）
docker volume prune -f
```

### 4. 监控服务
```powershell
# 查看容器状态
docker compose -f docker-compose-devops.yml ps

# 查看资源使用
docker stats

# 查看日志
docker compose -f docker-compose-devops.yml logs -f --tail=100
```

## 📊 性能优化

### 1. GitLab优化
```ruby
# 编辑 gitlab/gitlab.rb
unicorn['worker_processes'] = 2
sidekiq['max_concurrency'] = 10
postgresql['shared_preload_libraries'] = 'pg_stat_statements'
```

### 2. Jenkins优化
```groovy
# 在Jenkins中配置
# Manage Jenkins -> Configure System
# 设置执行器数量：2-4个
# 配置JVM参数：-Xmx2g -Xms1g
```

### 3. 数据库优化
```sql
-- PostgreSQL优化
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
```

## 🔐 安全配置

### 1. 修改默认密码
```markdown
1. GitLab root密码修改
2. Jenkins admin密码修改
3. 数据库密码修改（在.env.devops中）
```

### 2. 配置SSL（可选）
```yaml
# 在docker-compose-devops.yml中添加
nginx:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./ssl:/etc/nginx/ssl
```

### 3. 网络安全
```yaml
# 限制网络访问
networks:
  devops-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 📞 技术支持

如果遇到问题，请按以下顺序排查：

1. 检查Docker Desktop状态
2. 运行 `devops-status.bat` 查看服务状态
3. 查看相关服务日志
4. 参考本文档的常见问题部分
5. 查看官方文档

**重要提醒**：这是开发环境配置，生产环境请参考官方部署指南并加强安全配置。