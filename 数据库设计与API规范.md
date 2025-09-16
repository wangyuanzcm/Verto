# 数据库设计与API接口规范

## 1. 数据库设计概览

### 1.1 设计原则
- **规范化**: 遵循第三范式，减少数据冗余
- **性能优化**: 合理设计索引，优化查询性能
- **扩展性**: 预留扩展字段，支持业务发展
- **一致性**: 统一的命名规范和数据类型
- **安全性**: 敏感数据加密，权限控制

### 1.2 数据库架构
```
┌─────────────────────────────────────────────────────────┐
│                     MySQL 8.0+                         │
├─────────────────────────────────────────────────────────┤
│  用户权限模块  │  项目管理模块  │  需求管理模块  │  物料管理模块  │
├─────────────────────────────────────────────────────────┤
│  监控日志模块  │  原型设计模块  │  流水线模块   │  系统配置模块  │
├─────────────────────────────────────────────────────────┤
│                    Redis 缓存层                         │
└─────────────────────────────────────────────────────────┘
```

## 2. 核心数据表设计

### 2.1 用户权限模块

#### 2.1.1 用户表 (users)
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码哈希',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `department` varchar(100) DEFAULT NULL COMMENT '部门',
  `position` varchar(100) DEFAULT NULL COMMENT '职位',
  `status` tinyint DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(45) DEFAULT NULL COMMENT '最后登录IP',
  `email_verified_at` timestamp NULL DEFAULT NULL COMMENT '邮箱验证时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

#### 2.1.2 角色表 (roles)
```sql
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `code` varchar(50) NOT NULL COMMENT '角色编码',
  `description` text COMMENT '角色描述',
  `permissions` json DEFAULT NULL COMMENT '权限列表',
  `is_system` tinyint DEFAULT '0' COMMENT '是否系统角色：0-否，1-是',
  `status` tinyint DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
```

#### 2.1.3 用户角色关联表 (user_roles)
```sql
CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `assigned_by` int DEFAULT NULL COMMENT '分配人ID',
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  KEY `fk_user_roles_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
```

#### 2.1.4 权限表 (permissions)
```sql
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `name` varchar(100) NOT NULL COMMENT '权限名称',
  `code` varchar(100) NOT NULL COMMENT '权限编码',
  `type` enum('menu','button','api') NOT NULL COMMENT '权限类型',
  `parent_id` int DEFAULT NULL COMMENT '父权限ID',
  `path` varchar(255) DEFAULT NULL COMMENT '路径',
  `component` varchar(255) DEFAULT NULL COMMENT '组件',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_permissions_parent` FOREIGN KEY (`parent_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';
```

### 2.2 项目管理模块

#### 2.2.1 项目表 (projects)
```sql
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `name` varchar(100) NOT NULL COMMENT '项目名称',
  `code` varchar(50) NOT NULL COMMENT '项目编码',
  `description` text COMMENT '项目描述',
  `repository_url` varchar(255) DEFAULT NULL COMMENT '代码仓库地址',
  `preview_url` varchar(255) DEFAULT NULL COMMENT '预览地址',
  `status` enum('planning','development','testing','production','archived') DEFAULT 'planning' COMMENT '项目状态',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium' COMMENT '优先级',
  `owner_id` int NOT NULL COMMENT '项目负责人ID',
  `team_id` int DEFAULT NULL COMMENT '团队ID',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `config` json DEFAULT NULL COMMENT '项目配置',
  `tags` json DEFAULT NULL COMMENT '标签',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `fk_projects_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';
```

#### 2.2.2 项目成员表 (project_members)
```sql
CREATE TABLE `project_members` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `project_id` int NOT NULL COMMENT '项目ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `role` enum('owner','admin','developer','designer','tester','viewer') DEFAULT 'developer' COMMENT '项目角色',
  `permissions` json DEFAULT NULL COMMENT '项目权限',
  `joined_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `left_at` timestamp NULL DEFAULT NULL COMMENT '离开时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_user` (`project_id`,`user_id`),
  KEY `fk_project_members_user` (`user_id`),
  CONSTRAINT `fk_project_members_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员表';
```

#### 2.2.3 项目环境表 (project_environments)
```sql
CREATE TABLE `project_environments` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '环境ID',
  `project_id` int NOT NULL COMMENT '项目ID',
  `name` varchar(50) NOT NULL COMMENT '环境名称',
  `type` enum('development','testing','staging','production') NOT NULL COMMENT '环境类型',
  `url` varchar(255) DEFAULT NULL COMMENT '访问地址',
  `branch` varchar(100) DEFAULT NULL COMMENT '对应分支',
  `config` json DEFAULT NULL COMMENT '环境配置',
  `status` enum('active','inactive','deploying','failed') DEFAULT 'inactive' COMMENT '状态',
  `last_deploy_at` timestamp NULL DEFAULT NULL COMMENT '最后部署时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_name` (`project_id`,`name`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_project_environments_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目环境表';
```

### 2.3 需求管理模块

#### 2.3.1 需求表 (requirements)
```sql
CREATE TABLE `requirements` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '需求ID',
  `title` varchar(200) NOT NULL COMMENT '需求标题',
  `code` varchar(50) NOT NULL COMMENT '需求编号',
  `description` text COMMENT '需求描述',
  `acceptance_criteria` text COMMENT '验收标准',
  `project_id` int NOT NULL COMMENT '所属项目ID',
  `creator_id` int NOT NULL COMMENT '创建人ID',
  `assignee_id` int DEFAULT NULL COMMENT '负责人ID',
  `reviewer_id` int DEFAULT NULL COMMENT '评审人ID',
  `status` enum('draft','review','approved','development','testing','done','rejected') DEFAULT 'draft' COMMENT '状态',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium' COMMENT '优先级',
  `type` enum('feature','bug','improvement','task') DEFAULT 'feature' COMMENT '需求类型',
  `story_points` int DEFAULT NULL COMMENT '故事点',
  `estimated_hours` decimal(8,2) DEFAULT NULL COMMENT '预估工时',
  `actual_hours` decimal(8,2) DEFAULT NULL COMMENT '实际工时',
  `prototype_data` json DEFAULT NULL COMMENT '原型数据',
  `ui_design_url` varchar(255) DEFAULT NULL COMMENT 'UI设计地址',
  `attachments` json DEFAULT NULL COMMENT '附件列表',
  `tags` json DEFAULT NULL COMMENT '标签',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `due_date` date DEFAULT NULL COMMENT '截止日期',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_assignee_id` (`assignee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_requirements_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requirements_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_requirements_assignee` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_requirements_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求表';
```

#### 2.3.2 需求评论表 (requirement_comments)
```sql
CREATE TABLE `requirement_comments` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `requirement_id` int NOT NULL COMMENT '需求ID',
  `user_id` int NOT NULL COMMENT '评论人ID',
  `content` text NOT NULL COMMENT '评论内容',
  `parent_id` int DEFAULT NULL COMMENT '父评论ID',
  `attachments` json DEFAULT NULL COMMENT '附件列表',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_requirement_id` (`requirement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_requirement_comments_requirement` FOREIGN KEY (`requirement_id`) REFERENCES `requirements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requirement_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_requirement_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `requirement_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='需求评论表';
```

### 2.4 物料管理模块

#### 2.4.1 物料分类表 (material_categories)
```sql
CREATE TABLE `material_categories` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `code` varchar(50) NOT NULL COMMENT '分类编码',
  `description` text COMMENT '分类描述',
  `parent_id` int DEFAULT NULL COMMENT '父分类ID',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_material_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `material_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物料分类表';
```

#### 2.4.2 物料表 (materials)
```sql
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '物料ID',
  `name` varchar(100) NOT NULL COMMENT '物料名称',
  `code` varchar(50) NOT NULL COMMENT '物料编码',
  `type` enum('component','template','snippet','block') NOT NULL COMMENT '物料类型',
  `description` text COMMENT '物料描述',
  `category_id` int DEFAULT NULL COMMENT '分类ID',
  `creator_id` int NOT NULL COMMENT '创建人ID',
  `maintainer_id` int DEFAULT NULL COMMENT '维护人ID',
  `version` varchar(20) DEFAULT '1.0.0' COMMENT '版本号',
  `source_code` longtext COMMENT '源代码',
  `demo_code` text COMMENT '示例代码',
  `config` json DEFAULT NULL COMMENT '配置信息',
  `props` json DEFAULT NULL COMMENT '属性定义',
  `events` json DEFAULT NULL COMMENT '事件定义',
  `dependencies` json DEFAULT NULL COMMENT '依赖列表',
  `tags` json DEFAULT NULL COMMENT '标签',
  `preview_url` varchar(255) DEFAULT NULL COMMENT '预览地址',
  `documentation` text COMMENT '文档说明',
  `download_count` int DEFAULT '0' COMMENT '下载次数',
  `star_count` int DEFAULT '0' COMMENT '收藏次数',
  `rating` decimal(3,2) DEFAULT '0.00' COMMENT '评分',
  `status` enum('draft','published','deprecated') DEFAULT 'draft' COMMENT '状态',
  `published_at` timestamp NULL DEFAULT NULL COMMENT '发布时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_materials_category` FOREIGN KEY (`category_id`) REFERENCES `material_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_materials_maintainer` FOREIGN KEY (`maintainer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物料表';
```

### 2.5 原型设计模块

#### 2.5.1 原型表 (prototypes)
```sql
CREATE TABLE `prototypes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '原型ID',
  `name` varchar(100) NOT NULL COMMENT '原型名称',
  `description` text COMMENT '原型描述',
  `requirement_id` int DEFAULT NULL COMMENT '关联需求ID',
  `project_id` int NOT NULL COMMENT '所属项目ID',
  `creator_id` int NOT NULL COMMENT '创建人ID',
  `version` varchar(20) DEFAULT '1.0.0' COMMENT '版本号',
  `data` longtext COMMENT '原型数据(JSON)',
  `pages` json DEFAULT NULL COMMENT '页面列表',
  `components` json DEFAULT NULL COMMENT '组件列表',
  `assets` json DEFAULT NULL COMMENT '资源列表',
  `config` json DEFAULT NULL COMMENT '配置信息',
  `preview_url` varchar(255) DEFAULT NULL COMMENT '预览地址',
  `status` enum('draft','review','approved','archived') DEFAULT 'draft' COMMENT '状态',
  `published_at` timestamp NULL DEFAULT NULL COMMENT '发布时间',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_requirement_id` (`requirement_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_prototypes_requirement` FOREIGN KEY (`requirement_id`) REFERENCES `requirements` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prototypes_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prototypes_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原型表';
```

### 2.6 流水线模块

#### 2.6.1 流水线表 (pipelines)
```sql
CREATE TABLE `pipelines` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '流水线ID',
  `name` varchar(100) NOT NULL COMMENT '流水线名称',
  `description` text COMMENT '流水线描述',
  `project_id` int NOT NULL COMMENT '所属项目ID',
  `creator_id` int NOT NULL COMMENT '创建人ID',
  `type` enum('build','deploy','test','release') NOT NULL COMMENT '流水线类型',
  `trigger` enum('manual','push','merge','schedule') DEFAULT 'manual' COMMENT '触发方式',
  `config` json NOT NULL COMMENT '流水线配置',
  `stages` json NOT NULL COMMENT '阶段配置',
  `variables` json DEFAULT NULL COMMENT '变量配置',
  `status` enum('active','inactive','archived') DEFAULT 'active' COMMENT '状态',
  `last_run_at` timestamp NULL DEFAULT NULL COMMENT '最后运行时间',
  `last_run_status` enum('success','failed','running','cancelled') DEFAULT NULL COMMENT '最后运行状态',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_pipelines_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pipelines_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流水线表';
```

#### 2.6.2 流水线执行记录表 (pipeline_executions)
```sql
CREATE TABLE `pipeline_executions` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '执行ID',
  `pipeline_id` int NOT NULL COMMENT '流水线ID',
  `trigger_user_id` int DEFAULT NULL COMMENT '触发人ID',
  `trigger_type` enum('manual','push','merge','schedule') NOT NULL COMMENT '触发类型',
  `trigger_data` json DEFAULT NULL COMMENT '触发数据',
  `status` enum('pending','running','success','failed','cancelled') DEFAULT 'pending' COMMENT '执行状态',
  `stages_result` json DEFAULT NULL COMMENT '阶段执行结果',
  `logs` longtext COMMENT '执行日志',
  `error_message` text COMMENT '错误信息',
  `started_at` timestamp NULL DEFAULT NULL COMMENT '开始时间',
  `finished_at` timestamp NULL DEFAULT NULL COMMENT '结束时间',
  `duration` int DEFAULT NULL COMMENT '执行时长(秒)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_pipeline_id` (`pipeline_id`),
  KEY `idx_trigger_user_id` (`trigger_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_started_at` (`started_at`),
  CONSTRAINT `fk_pipeline_executions_pipeline` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pipeline_executions_trigger_user` FOREIGN KEY (`trigger_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流水线执行记录表';
```

### 2.7 监控日志模块

#### 2.7.1 操作日志表 (operation_logs)
```sql
CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` int DEFAULT NULL COMMENT '操作人ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作人用户名',
  `module` varchar(50) NOT NULL COMMENT '操作模块',
  `action` varchar(50) NOT NULL COMMENT '操作动作',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型',
  `resource_id` varchar(50) DEFAULT NULL COMMENT '资源ID',
  `description` varchar(500) DEFAULT NULL COMMENT '操作描述',
  `request_method` varchar(10) DEFAULT NULL COMMENT '请求方法',
  `request_url` varchar(500) DEFAULT NULL COMMENT '请求URL',
  `request_params` json DEFAULT NULL COMMENT '请求参数',
  `response_data` json DEFAULT NULL COMMENT '响应数据',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `status` enum('success','failed') DEFAULT 'success' COMMENT '操作状态',
  `error_message` text COMMENT '错误信息',
  `execution_time` int DEFAULT NULL COMMENT '执行时间(毫秒)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource_type`,`resource_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
```

## 3. Redis缓存设计

### 3.1 缓存策略

#### 3.1.1 用户会话缓存
```
# 用户会话信息
KEY: session:{userId}
VALUE: {
  "userId": 1,
  "username": "admin",
  "roles": ["admin"],
  "permissions": ["project:read", "project:write"],
  "lastActivity": "2024-01-01T10:00:00Z"
}
TTL: 7200 (2小时)
```

#### 3.1.2 项目缓存
```
# 项目基本信息
KEY: project:{projectId}
VALUE: {
  "id": 1,
  "name": "项目名称",
  "status": "development",
  "owner": {...},
  "members": [...]
}
TTL: 3600 (1小时)

# 项目列表缓存
KEY: projects:list:{userId}:{page}:{limit}
VALUE: {
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
TTL: 300 (5分钟)
```

#### 3.1.3 物料缓存
```
# 物料详情
KEY: material:{materialId}
VALUE: {...}
TTL: 1800 (30分钟)

# 热门物料
KEY: materials:hot
VALUE: [materialId1, materialId2, ...]
TTL: 3600 (1小时)
```

#### 3.1.4 实时数据缓存
```
# 在线用户
KEY: online:users
VALUE: Set<userId>
TTL: 300 (5分钟)

# 项目实时协作
KEY: collaboration:project:{projectId}
VALUE: {
  "activeUsers": [...],
  "lastActivity": "2024-01-01T10:00:00Z"
}
TTL: 600 (10分钟)
```

## 4. API接口规范

### 4.1 RESTful API设计原则

#### 4.1.1 URL设计规范
- 使用名词复数形式：`/api/v1/projects`
- 资源嵌套不超过2层：`/api/v1/projects/{id}/members`
- 使用连字符分隔：`/api/v1/project-templates`
- 版本控制：`/api/v1/`, `/api/v2/`

#### 4.1.2 HTTP方法使用
- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 完整更新资源
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源

#### 4.1.3 状态码规范
- `200`: 成功
- `201`: 创建成功
- `204`: 删除成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `422`: 数据验证失败
- `500`: 服务器错误

### 4.2 统一响应格式

#### 4.2.1 成功响应
```typescript
interface SuccessResponse<T> {
  code: number;          // 业务状态码
  message: string;       // 响应消息
  data: T;              // 响应数据
  timestamp: string;     // 响应时间戳
  requestId: string;     // 请求ID
}

// 示例
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "项目名称"
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "req_123456789"
}
```

#### 4.2.2 分页响应
```typescript
interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];          // 数据列表
    total: number;       // 总数量
    page: number;        // 当前页码
    limit: number;       // 每页数量
    totalPages: number;  // 总页数
    hasNext: boolean;    // 是否有下一页
    hasPrev: boolean;    // 是否有上一页
  };
  timestamp: string;
  requestId: string;
}
```

#### 4.2.3 错误响应
```typescript
interface ErrorResponse {
  code: number;          // 错误状态码
  message: string;       // 错误消息
  error: {
    type: string;        // 错误类型
    details: any;        // 错误详情
    stack?: string;      // 错误堆栈(仅开发环境)
  };
  timestamp: string;
  requestId: string;
  path: string;          // 请求路径
}

// 示例
{
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "type": "ValidationError",
    "details": {
      "name": ["项目名称不能为空"]
    }
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "req_123456789",
  "path": "/api/v1/projects"
}
```

### 4.3 核心API接口

#### 4.3.1 认证授权接口

```typescript
// 用户登录
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password",
  "captcha": "1234",
  "captchaId": "captcha_123"
}

// 响应
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "avatar": "https://example.com/avatar.jpg",
      "roles": ["admin"],
      "permissions": ["project:read", "project:write"]
    }
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "req_123456789"
}

// 刷新Token
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// 用户登出
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

// 获取当前用户信息
GET /api/v1/auth/profile
Authorization: Bearer {accessToken}
```

#### 4.3.2 项目管理接口

```typescript
// 获取项目列表
GET /api/v1/projects?page=1&limit=20&status=active&keyword=搜索关键词
Authorization: Bearer {accessToken}

// 响应
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "项目名称",
        "code": "PROJECT_001",
        "description": "项目描述",
        "status": "development",
        "priority": "high",
        "owner": {
          "id": 1,
          "username": "admin",
          "realName": "管理员"
        },
        "memberCount": 5,
        "requirementCount": 10,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "requestId": "req_123456789"
}

// 创建项目
POST /api/v1/projects
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新项目",
  "code": "NEW_PROJECT",
  "description": "项目描述",
  "repositoryUrl": "https://github.com/user/repo",
  "status": "planning",
  "priority": "medium",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "tags": ["web", "vue3"]
}

// 获取项目详情
GET /api/v1/projects/{id}
Authorization: Bearer {accessToken}

// 更新项目
PUT /api/v1/projects/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

// 删除项目
DELETE /api/v1/projects/{id}
Authorization: Bearer {accessToken}

// 获取项目成员
GET /api/v1/projects/{id}/members
Authorization: Bearer {accessToken}

// 添加项目成员
POST /api/v1/projects/{id}/members
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userIds": [2, 3, 4],
  "role": "developer"
}

// 移除项目成员
DELETE /api/v1/projects/{id}/members/{userId}
Authorization: Bearer {accessToken}
```

#### 4.3.3 需求管理接口

```typescript
// 获取需求列表
GET /api/v1/requirements?projectId=1&page=1&limit=20&status=development
Authorization: Bearer {accessToken}

// 创建需求
POST /api/v1/requirements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "用户登录功能",
  "description": "实现用户登录功能，支持用户名密码登录",
  "acceptanceCriteria": "1. 支持用户名密码登录\n2. 登录失败显示错误信息",
  "projectId": 1,
  "assigneeId": 2,
  "priority": "high",
  "type": "feature",
  "storyPoints": 5,
  "estimatedHours": 16,
  "dueDate": "2024-01-15",
  "tags": ["登录", "认证"]
}

// 获取需求详情
GET /api/v1/requirements/{id}
Authorization: Bearer {accessToken}

// 更新需求状态
PATCH /api/v1/requirements/{id}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "development",
  "comment": "开始开发"
}

// 上传需求原型
POST /api/v1/requirements/{id}/prototype
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "prototypeData": {...},
  "version": "1.0.0"
}

// 添加需求评论
POST /api/v1/requirements/{id}/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "这个需求需要考虑移动端适配",
  "parentId": null
}
```

#### 4.3.4 物料管理接口

```typescript
// 获取物料列表
GET /api/v1/materials?categoryId=1&type=component&page=1&limit=20&keyword=按钮
Authorization: Bearer {accessToken}

// 创建物料
POST /api/v1/materials
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "通用按钮组件",
  "code": "COMMON_BUTTON",
  "type": "component",
  "description": "通用的按钮组件，支持多种样式",
  "categoryId": 1,
  "sourceCode": "<template>...</template>",
  "demoCode": "<CommonButton type='primary'>按钮</CommonButton>",
  "props": {
    "type": {
      "type": "string",
      "default": "default",
      "options": ["default", "primary", "success", "warning", "danger"]
    }
  },
  "tags": ["按钮", "UI组件"]
}

// 获取物料详情
GET /api/v1/materials/{id}
Authorization: Bearer {accessToken}

// 下载物料
POST /api/v1/materials/{id}/download
Authorization: Bearer {accessToken}

// 收藏物料
POST /api/v1/materials/{id}/star
Authorization: Bearer {accessToken}

// 评价物料
POST /api/v1/materials/{id}/rating
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "rating": 5,
  "comment": "很好用的组件"
}
```

#### 4.3.5 原型设计接口

```typescript
// 获取原型列表
GET /api/v1/prototypes?projectId=1&page=1&limit=20
Authorization: Bearer {accessToken}

// 创建原型
POST /api/v1/prototypes
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "用户管理页面原型",
  "description": "用户管理页面的交互原型",
  "projectId": 1,
  "requirementId": 1,
  "data": {...},  // Pencil原型数据
  "pages": [...],
  "components": [...]
}

// 保存原型数据
PUT /api/v1/prototypes/{id}/data
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "data": {...},  // 原型数据
  "version": "1.1.0"
}

// 生成代码
POST /api/v1/prototypes/{id}/generate-code
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "template": "vue3-antd",
  "options": {
    "typescript": true,
    "composition": true
  }
}

// 响应
{
  "code": 200,
  "message": "代码生成成功",
  "data": {
    "files": [
      {
        "path": "src/views/UserManagement.vue",
        "content": "<template>...</template>"
      },
      {
        "path": "src/api/user.ts",
        "content": "export const userApi = {...}"
      }
    ],
    "downloadUrl": "https://example.com/download/code.zip"
  }
}
```

### 4.4 WebSocket接口

#### 4.4.1 连接认证
```typescript
// 连接时携带token
const socket = io('ws://localhost:7001', {
  auth: {
    token: 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
})

// 加入项目房间
socket.emit('join-project', { projectId: 1 })

// 离开项目房间
socket.emit('leave-project', { projectId: 1 })
```

#### 4.4.2 实时协作事件
```typescript
// 原型设计协作
socket.on('prototype-update', (data) => {
  console.log('原型更新:', data)
})

socket.emit('prototype-update', {
  prototypeId: 1,
  userId: 1,
  action: 'add-component',
  data: {...}
})

// 需求状态变更通知
socket.on('requirement-status-changed', (data) => {
  console.log('需求状态变更:', data)
})

// 项目成员在线状态
socket.on('member-online', (data) => {
  console.log('成员上线:', data)
})

socket.on('member-offline', (data) => {
  console.log('成员下线:', data)
})
```

## 5. 数据库索引优化

### 5.1 核心索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 项目表索引
CREATE INDEX idx_projects_owner_status ON projects(owner_id, status);
CREATE INDEX idx_projects_status_priority ON projects(status, priority);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 需求表索引
CREATE INDEX idx_requirements_project_status ON requirements(project_id, status);
CREATE INDEX idx_requirements_assignee_status ON requirements(assignee_id, status);
CREATE INDEX idx_requirements_priority_due_date ON requirements(priority, due_date);
CREATE INDEX idx_requirements_created_at ON requirements(created_at);

-- 物料表索引
CREATE INDEX idx_materials_category_type ON materials(category_id, type);
CREATE INDEX idx_materials_status_published ON materials(status, published_at);
CREATE INDEX idx_materials_creator_type ON materials(creator_id, type);

-- 操作日志表索引
CREATE INDEX idx_operation_logs_user_module ON operation_logs(user_id, module);
CREATE INDEX idx_operation_logs_resource ON operation_logs(resource_type, resource_id);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);
```

### 5.2 查询优化示例

```sql
-- 优化前：全表扫描
SELECT * FROM requirements WHERE status = 'development';

-- 优化后：使用索引
SELECT r.*, u.real_name as assignee_name 
FROM requirements r
LEFT JOIN users u ON r.assignee_id = u.id
WHERE r.status = 'development'
AND r.project_id = 1
ORDER BY r.priority DESC, r.created_at DESC
LIMIT 20;

-- 复合查询优化
SELECT p.*, u.real_name as owner_name,
       (SELECT COUNT(*) FROM requirements WHERE project_id = p.id) as requirement_count
FROM projects p
INNER JOIN users u ON p.owner_id = u.id
WHERE p.status IN ('development', 'testing')
AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY p.updated_at DESC;
```

## 6. 数据迁移策略

### 6.1 版本控制
```sql
-- 创建迁移记录表
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `executed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6.2 初始化数据
```sql
-- 插入默认角色
INSERT INTO roles (name, code, description, permissions, is_system) VALUES
('超级管理员', 'super_admin', '系统超级管理员', '["*"]', 1),
('项目管理员', 'project_admin', '项目管理员', '["project:*", "requirement:*"]', 1),
('开发人员', 'developer', '开发人员', '["project:read", "requirement:read", "requirement:write"]', 1),
('测试人员', 'tester', '测试人员', '["project:read", "requirement:read"]', 1);

-- 插入默认用户
INSERT INTO users (username, email, password, real_name, status) VALUES
('admin', 'admin@example.com', '$2b$10$...', '系统管理员', 1);

-- 分配角色
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- 插入默认物料分类
INSERT INTO material_categories (name, code, description, parent_id) VALUES
('UI组件', 'ui_components', 'UI界面组件', NULL),
('业务组件', 'business_components', '业务逻辑组件', NULL),
('工具函数', 'utils', '工具函数库', NULL),
('页面模板', 'templates', '页面模板', NULL);
```

---

本文档详细定义了系统的数据库结构和API接口规范，为后续开发提供了完整的数据层和接口层设计指导。