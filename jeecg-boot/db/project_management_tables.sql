-- =============================================
-- 项目管理模块数据库表结构
-- 创建时间: 2024-01-24
-- 描述: 包含项目管理、项目关联应用、项目时间线、项目配置、项目模板等表
-- =============================================

-- 1. 项目管理表
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `project_name` varchar(100) NOT NULL COMMENT '项目名称',
  `project_code` varchar(50) NOT NULL COMMENT '项目编码',
  `project_type` varchar(20) DEFAULT 'web' COMMENT '项目类型(web/mobile/desktop/api)',
  `description` text COMMENT '项目描述',
  `status` varchar(10) DEFAULT '1' COMMENT '项目状态(1:进行中 2:已完成 3:暂停 4:已取消)',
  `priority` varchar(10) DEFAULT 'medium' COMMENT '优先级(high/medium/low)',
  `start_date` datetime COMMENT '开始日期',
  `end_date` datetime COMMENT '结束日期',
  `budget` decimal(15,2) DEFAULT 0.00 COMMENT '预算',
  `actual_cost` decimal(15,2) DEFAULT 0.00 COMMENT '实际成本',
  `progress` int DEFAULT 0 COMMENT '进度百分比(0-100)',
  `manager_id` varchar(36) COMMENT '项目经理ID',
  `manager_name` varchar(50) COMMENT '项目经理姓名',
  `team_members` text COMMENT '团队成员(JSON格式)',
  `git_url` varchar(500) COMMENT 'Git仓库地址',
  `git_branch` varchar(100) DEFAULT 'main' COMMENT 'Git分支',
  `deploy_env` varchar(200) COMMENT '部署环境信息',
  `tags` varchar(500) COMMENT '标签(逗号分隔)',
  `create_by` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` varchar(1) DEFAULT '0' COMMENT '删除标志(0:正常 1:删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_code` (`project_code`),
  KEY `idx_project_status` (`status`),
  KEY `idx_project_manager` (`manager_id`),
  KEY `idx_project_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目管理表';

-- 2. 项目关联应用表
DROP TABLE IF EXISTS `project_related_app`;
CREATE TABLE `project_related_app` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `project_id` varchar(36) NOT NULL COMMENT '项目ID',
  `app_name` varchar(100) NOT NULL COMMENT '应用名称',
  `app_code` varchar(50) NOT NULL COMMENT '应用编码',
  `app_type` varchar(20) DEFAULT 'web' COMMENT '应用类型(web/api/service/job)',
  `description` text COMMENT '应用描述',
  `git_url` varchar(500) COMMENT 'Git仓库地址',
  `git_branch` varchar(100) DEFAULT 'main' COMMENT 'Git分支',
  `build_command` varchar(500) COMMENT '构建命令',
  `deploy_command` varchar(500) COMMENT '部署命令',
  `port` int COMMENT '端口号',
  `health_check_url` varchar(500) COMMENT '健康检查URL',
  `status` varchar(10) DEFAULT '1' COMMENT '状态(1:正常 2:停用)',
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `create_by` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` varchar(1) DEFAULT '0' COMMENT '删除标志(0:正常 1:删除)',
  PRIMARY KEY (`id`),
  KEY `idx_project_app_project_id` (`project_id`),
  KEY `idx_project_app_code` (`app_code`),
  KEY `idx_project_app_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目关联应用表';

-- 3. 项目时间线表
DROP TABLE IF EXISTS `project_timeline`;
CREATE TABLE `project_timeline` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `project_id` varchar(36) NOT NULL COMMENT '项目ID',
  `node_name` varchar(100) NOT NULL COMMENT '节点名称',
  `node_type` varchar(20) DEFAULT 'milestone' COMMENT '节点类型(milestone/task/event)',
  `description` text COMMENT '节点描述',
  `planned_date` datetime COMMENT '计划日期',
  `actual_date` datetime COMMENT '实际日期',
  `status` varchar(10) DEFAULT 'pending' COMMENT '状态(pending/in_progress/completed/delayed)',
  `progress` int DEFAULT 0 COMMENT '进度百分比(0-100)',
  `responsible_person` varchar(50) COMMENT '负责人',
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `parent_id` varchar(36) COMMENT '父节点ID',
  `create_by` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` varchar(1) DEFAULT '0' COMMENT '删除标志(0:正常 1:删除)',
  PRIMARY KEY (`id`),
  KEY `idx_timeline_project_id` (`project_id`),
  KEY `idx_timeline_status` (`status`),
  KEY `idx_timeline_planned_date` (`planned_date`),
  KEY `idx_timeline_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目时间线表';

-- 4. 项目配置表
DROP TABLE IF EXISTS `project_config`;
CREATE TABLE `project_config` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `project_id` varchar(36) COMMENT '项目ID(为空表示全局配置)',
  `config_type` varchar(50) NOT NULL COMMENT '配置类型(database/redis/mq/email/sms等)',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `description` varchar(500) COMMENT '配置描述',
  `enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用(0:禁用 1:启用)',
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `environment` varchar(20) DEFAULT 'dev' COMMENT '环境(dev/test/prod)',
  `create_by` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` varchar(1) DEFAULT '0' COMMENT '删除标志(0:正常 1:删除)',
  PRIMARY KEY (`id`),
  KEY `idx_config_project_id` (`project_id`),
  KEY `idx_config_type` (`config_type`),
  KEY `idx_config_key` (`config_key`),
  KEY `idx_config_environment` (`environment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目配置表';

-- 5. 项目模板表
DROP TABLE IF EXISTS `project_template`;
CREATE TABLE `project_template` (
  `id` varchar(36) NOT NULL COMMENT '主键ID',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `template_code` varchar(50) NOT NULL COMMENT '模板编码',
  `template_type` varchar(20) DEFAULT 'web' COMMENT '模板类型(web/mobile/desktop/api)',
  `tech_stack` varchar(200) COMMENT '技术栈(Spring Boot/Vue/React等)',
  `description` text COMMENT '模板描述',
  `git_url` varchar(500) COMMENT '模板Git地址',
  `git_branch` varchar(100) DEFAULT 'main' COMMENT 'Git分支',
  `config_data` longtext COMMENT '配置数据(JSON格式)',
  `enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用(0:禁用 1:启用)',
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `version` varchar(20) DEFAULT '1.0.0' COMMENT '版本号',
  `author` varchar(50) COMMENT '作者',
  `tags` varchar(500) COMMENT '标签(逗号分隔)',
  `usage_count` int DEFAULT 0 COMMENT '使用次数',
  `create_by` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` varchar(1) DEFAULT '0' COMMENT '删除标志(0:正常 1:删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`template_code`),
  KEY `idx_template_type` (`template_type`),
  KEY `idx_template_enabled` (`enabled`),
  KEY `idx_template_usage_count` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目模板表';

-- 插入初始数据
-- 项目模板初始数据
INSERT INTO `project_template` (`id`, `template_name`, `template_code`, `template_type`, `tech_stack`, `description`, `git_url`, `config_data`, `enabled`, `sort_order`, `version`, `author`, `tags`, `usage_count`, `create_by`, `create_time`) VALUES
('1', 'Spring Boot + Vue3 模板', 'springboot-vue3', 'web', 'Spring Boot 3.x, Vue 3, Element Plus', '基于Spring Boot 3和Vue 3的前后端分离项目模板', 'https://github.com/example/springboot-vue3-template.git', '{"backend":{"port":8080,"database":"mysql"},"frontend":{"port":3000,"framework":"vue3"}}', 1, 1, '1.0.0', 'system', 'java,vue,mysql', 0, 'system', NOW()),
('2', 'React + Node.js 模板', 'react-nodejs', 'web', 'React 18, Node.js, Express', '基于React和Node.js的全栈项目模板', 'https://github.com/example/react-nodejs-template.git', '{"backend":{"port":3001,"database":"mongodb"},"frontend":{"port":3000,"framework":"react"}}', 1, 2, '1.0.0', 'system', 'react,nodejs,mongodb', 0, 'system', NOW()),
('3', 'Spring Boot API 模板', 'springboot-api', 'api', 'Spring Boot 3.x, MyBatis Plus', '纯后端API项目模板，适用于微服务架构', 'https://github.com/example/springboot-api-template.git', '{"backend":{"port":8080,"database":"mysql","swagger":true}}', 1, 3, '1.0.0', 'system', 'java,api,microservice', 0, 'system', NOW());

-- 项目配置初始数据
INSERT INTO `project_config` (`id`, `project_id`, `config_type`, `config_key`, `config_value`, `description`, `enabled`, `sort_order`, `environment`, `create_by`, `create_time`) VALUES
('1', NULL, 'database', 'default.driver', 'com.mysql.cj.jdbc.Driver', '默认数据库驱动', 1, 1, 'dev', 'system', NOW()),
('2', NULL, 'database', 'default.url', 'jdbc:mysql://localhost:3306/jeecg_boot?useUnicode=true&characterEncoding=utf8&autoReconnect=true&useSSL=false&serverTimezone=GMT%2B8', '默认数据库连接URL', 1, 2, 'dev', 'system', NOW()),
('3', NULL, 'redis', 'default.host', 'localhost', '默认Redis主机', 1, 3, 'dev', 'system', NOW()),
('4', NULL, 'redis', 'default.port', '6379', '默认Redis端口', 1, 4, 'dev', 'system', NOW());

COMMIT;