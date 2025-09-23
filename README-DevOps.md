# Verto DevOps 环境部署指南

本文档介绍如何在本地使用Docker Compose部署Jenkins和GitLab开发环境。

## 📋 系统要求

- Windows 10/11
- Docker Desktop for Windows
- 至少8GB内存
- 至少20GB可用磁盘空间

## 🚀 快速开始

### 1. 启动服务

双击运行 `start-devops.bat` 或在命令行中执行：

```bash
start-devops.bat
```

### 2. 访问服务

**GitLab**
- 🌐 Web界面: http://localhost:8080
- 👤 默认用户: `root`
- 🔑 默认密码: `gitlab123456`
- 🔌 SSH端口: `2222`

**Jenkins**
- 🌐 Web界面: http://localhost:8081
- 👤 默认用户: `admin`
- 🔑 默认密码: `admin123`

### 3. 检查服务状态

```bash
devops-status.bat
```

### 4. 停止服务

```bash
stop-devops.bat
```

## 📁 目录结构

```
Verto/
├── docker-compose-devops.yml    # Docker Compose配置文件
├── .env.devops                  # 环境变量配置
├── start-devops.bat            # 启动脚本
├── stop-devops.bat             # 停止脚本
├── devops-status.bat           # 状态检查脚本
├── jenkins/                    # Jenkins配置目录
│   ├── Dockerfile              # 自定义Jenkins镜像
│   ├── plugins.txt             # 插件列表
│   └── init.groovy.d/          # 初始化脚本
├── gitlab/                     # GitLab配置目录
│   └── gitlab.rb               # GitLab配置文件
├── jenkins_home/               # Jenkins数据目录（自动创建）
└── gitlab/                     # GitLab数据目录（自动创建）
    ├── config/
    ├── logs/
    └── data/
```

## ⚙️ 配置说明

### 端口映射

| 服务 | 内部端口 | 外部端口 | 说明 |
|------|----------|----------|------|
| GitLab HTTP | 80 | 8080 | Web界面 |
| GitLab HTTPS | 443 | 8443 | HTTPS访问 |
| GitLab SSH | 22 | 2222 | Git SSH访问 |
| Jenkins HTTP | 8080 | 8081 | Web界面 |
| Jenkins Agent | 50000 | 50000 | 构建代理连接 |

### 环境变量

主要配置在 `.env.devops` 文件中：

- `GITLAB_ROOT_PASSWORD`: GitLab root用户密码
- `JENKINS_ADMIN_USER`: Jenkins管理员用户名
- `JENKINS_ADMIN_PASSWORD`: Jenkins管理员密码
- 其他数据库、内存限制等配置

## 🔧 常用操作

### 查看服务日志

```bash
# 查看所有服务日志
docker compose -f docker-compose-devops.yml logs -f

# 查看特定服务日志
docker compose -f docker-compose-devops.yml logs -f gitlab
docker compose -f docker-compose-devops.yml logs -f jenkins
```

### 重启服务

```bash
# 重启所有服务
docker compose -f docker-compose-devops.yml restart

# 重启特定服务
docker compose -f docker-compose-devops.yml restart gitlab
docker compose -f docker-compose-devops.yml restart jenkins
```

### 进入容器

```bash
# 进入GitLab容器
docker compose -f docker-compose-devops.yml exec gitlab bash

# 进入Jenkins容器
docker compose -f docker-compose-devops.yml exec jenkins bash
```

## 🛠️ 故障排除

### 1. 服务启动失败

- 检查Docker Desktop是否运行
- 确保端口8080、8081、2222未被占用
- 检查磁盘空间是否充足

### 2. GitLab访问缓慢

- GitLab首次启动需要5-10分钟初始化
- 可以通过 `devops-status.bat` 检查启动进度

### 3. Jenkins插件安装失败

- 检查网络连接
- 可以手动重启Jenkins服务

### 4. 内存不足

- 调整 `.env.devops` 中的内存限制配置
- 关闭其他不必要的应用程序

## 🔐 安全注意事项

1. **修改默认密码**: 首次登录后请立即修改默认密码
2. **网络访问**: 当前配置仅适用于本地开发，不要暴露到公网
3. **数据备份**: 重要数据请定期备份
4. **SSL证书**: 生产环境请配置SSL证书

## 📚 集成指南

### GitLab与Jenkins集成

1. 在GitLab中创建项目
2. 在Jenkins中创建Pipeline任务
3. 配置GitLab Webhook触发构建
4. 设置构建结果回传到GitLab

### 与Verto项目集成

1. 将Verto项目推送到GitLab
2. 在Jenkins中配置前端和后端构建任务
3. 设置自动化部署流程

## 🆘 获取帮助

如果遇到问题，请：

1. 运行 `devops-status.bat` 检查服务状态
2. 查看相关服务日志
3. 检查Docker Desktop状态
4. 参考官方文档：
   - [GitLab文档](https://docs.gitlab.com/)
   - [Jenkins文档](https://www.jenkins.io/doc/)

---

**注意**: 这是开发环境配置，不适用于生产环境。生产环境部署请参考官方部署指南。