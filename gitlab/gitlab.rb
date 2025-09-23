## GitLab 自定义配置文件
## 此文件用于配置GitLab的各种设置

# 外部URL配置
external_url 'http://localhost:8800'

# SSH配置
gitlab_rails['gitlab_shell_ssh_port'] = 8802

# 邮件配置（开发环境可以禁用）
gitlab_rails['smtp_enable'] = false

# 时区设置
gitlab_rails['time_zone'] = 'Asia/Shanghai'

# 数据库配置（使用内置PostgreSQL）
postgresql['enable'] = true
postgresql['shared_preload_libraries'] = 'pg_stat_statements'

# Redis配置（使用内置Redis）
redis['enable'] = true

# 禁用一些不必要的服务以节省资源
prometheus_monitoring['enable'] = false
alertmanager['enable'] = false
node_exporter['enable'] = false
redis_exporter['enable'] = false
postgres_exporter['enable'] = false
gitlab_exporter['enable'] = false
# grafana配置项在新版本GitLab中已被移除，不再需要配置

# 备份配置
gitlab_rails['backup_keep_time'] = 604800  # 7天
gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"

# Git配置
gitlab_rails['gitlab_default_branch'] = 'main'

# 用户设置
gitlab_rails['gitlab_default_can_create_group'] = true
gitlab_rails['gitlab_username_changing_enabled'] = true

# 上传文件大小限制
gitlab_rails['max_attachment_size'] = 100  # MB

# Session配置
gitlab_rails['session_expire_delay'] = 10080  # 7天（分钟）

# 日志配置
logging['logrotate_frequency'] = "daily"
logging['logrotate_size'] = "200MB"
logging['logrotate_rotate'] = 30

# Nginx配置
nginx['enable'] = true
nginx['client_max_body_size'] = '250m'
nginx['redirect_http_to_https'] = false

# Unicorn配置（Web服务器）- GitLab 11.8.2兼容
unicorn['worker_processes'] = 2
unicorn['worker_timeout'] = 60

# Sidekiq配置（后台任务处理）- GitLab 11.8.2兼容
sidekiq['concurrency'] = 10

# GitLab Pages（如果需要）
pages_external_url "http://pages.localhost:8080"
gitlab_pages['enable'] = false

# Container Registry（如果需要）
registry_external_url 'http://registry.localhost:8080'
gitlab_rails['registry_enabled'] = false

# 安全设置
gitlab_rails['webhook_timeout'] = 10
gitlab_rails['gitlab_default_projects_features_issues'] = true
gitlab_rails['gitlab_default_projects_features_merge_requests'] = true
gitlab_rails['gitlab_default_projects_features_wiki'] = true
gitlab_rails['gitlab_default_projects_features_snippets'] = true
gitlab_rails['gitlab_default_projects_features_builds'] = true
gitlab_rails['gitlab_default_projects_features_container_registry'] = false