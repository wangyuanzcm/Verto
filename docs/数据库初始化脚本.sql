-- =============================================
-- 前端项目管理平台数据库初始化脚本
-- 版本：v1.0
-- 日期：2025-01-18
-- 基于：JeecgBoot 3.x
-- =============================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. 需求管理相关表
-- =============================================

-- 需求表
DROP TABLE IF EXISTS `verto_requirement`;
CREATE TABLE `verto_requirement` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `zentao_id` varchar(50) DEFAULT NULL COMMENT '禅道需求ID',
  `title` varchar(200) NOT NULL COMMENT '需求标题',
  `description` text COMMENT '需求描述',
  `priority` tinyint DEFAULT '2' COMMENT '优先级：1-高，2-中，3-低',
  `status` varchar(20) DEFAULT 'draft' COMMENT '状态：draft-草稿，active-激活，testing-测试中，closed-关闭',
  `type` varchar(20) DEFAULT 'feature' COMMENT '类型：feature-功能，bug-缺陷，improvement-改进',
  `assignee` varchar(32) DEFAULT NULL COMMENT '指派人',
  `assignee_name` varchar(50) DEFAULT NULL COMMENT '指派人姓名',
  `reporter` varchar(32) DEFAULT NULL COMMENT '报告人',
  `reporter_name` varchar(50) DEFAULT NULL COMMENT '报告人姓名',
  `project_id` varchar(32) DEFAULT NULL COMMENT '所属项目',
  `project_name` varchar(100) DEFAULT NULL COMMENT '项目名称',
  `prototype_url` varchar(500) DEFAULT NULL COMMENT '原型链接',
  `page_schema` longtext COMMENT '页面Schema JSON',
  `branch_name` varchar(100) DEFAULT NULL COMMENT '关联分支名',
  `gitlab_url` varchar(500) DEFAULT NULL COMMENT 'GitLab仓库地址',
  `srs_doc_url` varchar(500) DEFAULT NULL COMMENT 'SRS文档链接',
  `estimated_hours` decimal(8,2) DEFAULT NULL COMMENT '预估工时',
  `actual_hours` decimal(8,2) DEFAULT NULL COMMENT '实际工时',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `completion_rate` decimal(5,2) DEFAULT '0.00' COMMENT '完成进度百分比',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签，逗号分隔',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_requirement_zentao_id` (`zentao_id`),
  KEY `idx_requirement_status` (`status`),
  KEY `idx_requirement_assignee` (`assignee`),
  KEY `idx_requirement_project_id` (`project_id`),
  KEY `idx_requirement_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='需求表';

-- 需求状态变更历史表
DROP TABLE IF EXISTS `verto_requirement_history`;
CREATE TABLE `verto_requirement_history` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `requirement_id` varchar(32) NOT NULL COMMENT '需求ID',
  `old_status` varchar(20) DEFAULT NULL COMMENT '原状态',
  `new_status` varchar(20) DEFAULT NULL COMMENT '新状态',
  `change_reason` text COMMENT '变更原因',
  `change_by` varchar(32) DEFAULT NULL COMMENT '变更人',
  `change_by_name` varchar(50) DEFAULT NULL COMMENT '变更人姓名',
  `change_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  PRIMARY KEY (`id`),
  KEY `idx_requirement_history_req_id` (`requirement_id`),
  KEY `idx_requirement_history_change_time` (`change_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='需求状态变更历史表';

-- 需求附件表
DROP TABLE IF EXISTS `verto_requirement_attachment`;
CREATE TABLE `verto_requirement_attachment` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `requirement_id` varchar(32) NOT NULL COMMENT '需求ID',
  `file_name` varchar(200) NOT NULL COMMENT '文件名',
  `file_path` varchar(500) NOT NULL COMMENT '文件路径',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小(字节)',
  `file_type` varchar(50) DEFAULT NULL COMMENT '文件类型',
  `upload_by` varchar(32) DEFAULT NULL COMMENT '上传人',
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`),
  KEY `idx_requirement_attachment_req_id` (`requirement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='需求附件表';

-- =============================================
-- 2. 应用管理相关表
-- =============================================

-- 应用表
DROP TABLE IF EXISTS `verto_application`;
CREATE TABLE `verto_application` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `app_name` varchar(100) NOT NULL COMMENT '应用名称',
  `app_code` varchar(50) NOT NULL COMMENT '应用编码',
  `description` text COMMENT '应用描述',
  `gitlab_project_id` varchar(50) DEFAULT NULL COMMENT 'GitLab项目ID',
  `gitlab_url` varchar(500) DEFAULT NULL COMMENT 'GitLab仓库地址',
  `jenkins_job_name` varchar(100) DEFAULT NULL COMMENT 'Jenkins任务名',
  `jenkins_url` varchar(500) DEFAULT NULL COMMENT 'Jenkins地址',
  `deploy_env` varchar(20) DEFAULT 'dev' COMMENT '部署环境：dev-开发，test-测试，prod-生产',
  `app_type` varchar(20) DEFAULT 'web' COMMENT '应用类型：web-前端，api-后端，mobile-移动端',
  `tech_stack` varchar(100) DEFAULT NULL COMMENT '技术栈',
  `framework_version` varchar(50) DEFAULT NULL COMMENT '框架版本',
  `owner` varchar(32) DEFAULT NULL COMMENT '负责人',
  `owner_name` varchar(50) DEFAULT NULL COMMENT '负责人姓名',
  `team_id` varchar(32) DEFAULT NULL COMMENT '所属团队',
  `team_name` varchar(50) DEFAULT NULL COMMENT '团队名称',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃，archived-归档',
  `matomo_site_id` varchar(20) DEFAULT NULL COMMENT 'Matomo站点ID',
  `domain` varchar(200) DEFAULT NULL COMMENT '域名',
  `port` int DEFAULT NULL COMMENT '端口',
  `health_check_url` varchar(500) DEFAULT NULL COMMENT '健康检查地址',
  `last_deploy_time` datetime DEFAULT NULL COMMENT '最后部署时间',
  `last_deploy_version` varchar(50) DEFAULT NULL COMMENT '最后部署版本',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_application_code` (`app_code`),
  KEY `idx_application_owner` (`owner`),
  KEY `idx_application_status` (`status`),
  KEY `idx_application_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用表';

-- 应用构建记录表
DROP TABLE IF EXISTS `verto_build_record`;
CREATE TABLE `verto_build_record` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `application_id` varchar(32) NOT NULL COMMENT '应用ID',
  `build_number` int DEFAULT NULL COMMENT '构建号',
  `branch_name` varchar(100) DEFAULT NULL COMMENT '分支名',
  `commit_id` varchar(50) DEFAULT NULL COMMENT '提交ID',
  `commit_message` varchar(500) DEFAULT NULL COMMENT '提交信息',
  `build_status` varchar(20) DEFAULT NULL COMMENT '构建状态：building-构建中，success-成功，failed-失败，cancelled-已取消',
  `build_duration` int DEFAULT NULL COMMENT '构建耗时(秒)',
  `build_log` longtext COMMENT '构建日志',
  `build_url` varchar(500) DEFAULT NULL COMMENT '构建链接',
  `deploy_env` varchar(20) DEFAULT NULL COMMENT '部署环境',
  `trigger_by` varchar(32) DEFAULT NULL COMMENT '触发人',
  `trigger_by_name` varchar(50) DEFAULT NULL COMMENT '触发人姓名',
  `build_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '构建时间',
  `finish_time` datetime DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_build_record_app_id` (`application_id`),
  KEY `idx_build_record_status` (`build_status`),
  KEY `idx_build_record_build_time` (`build_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用构建记录表';

-- 应用环境配置表
DROP TABLE IF EXISTS `verto_app_environment`;
CREATE TABLE `verto_app_environment` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `application_id` varchar(32) NOT NULL COMMENT '应用ID',
  `env_name` varchar(50) NOT NULL COMMENT '环境名称：dev,test,prod',
  `env_url` varchar(500) DEFAULT NULL COMMENT '环境地址',
  `database_config` text COMMENT '数据库配置JSON',
  `redis_config` text COMMENT 'Redis配置JSON',
  `other_config` text COMMENT '其他配置JSON',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_env` (`application_id`,`env_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用环境配置表';

-- =============================================
-- 3. 物料管理相关表
-- =============================================

-- 物料表
DROP TABLE IF EXISTS `verto_material`;
CREATE TABLE `verto_material` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `material_name` varchar(100) NOT NULL COMMENT '物料名称',
  `material_code` varchar(50) NOT NULL COMMENT '物料编码',
  `material_type` varchar(20) NOT NULL COMMENT '物料类型：component-组件，template-模板，page-页面，hook-钩子',
  `category` varchar(50) DEFAULT NULL COMMENT '分类',
  `subcategory` varchar(50) DEFAULT NULL COMMENT '子分类',
  `description` text COMMENT '描述',
  `version` varchar(20) DEFAULT '1.0.0' COMMENT '版本号',
  `author` varchar(32) DEFAULT NULL COMMENT '作者',
  `author_name` varchar(50) DEFAULT NULL COMMENT '作者姓名',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签，逗号分隔',
  `keywords` varchar(200) DEFAULT NULL COMMENT '关键词，逗号分隔',
  `preview_url` varchar(500) DEFAULT NULL COMMENT '预览地址',
  `demo_url` varchar(500) DEFAULT NULL COMMENT '演示地址',
  `source_code` longtext COMMENT '源代码',
  `dependencies` text COMMENT '依赖信息JSON',
  `props_schema` text COMMENT '属性Schema JSON',
  `usage_doc` text COMMENT '使用文档',
  `changelog` text COMMENT '变更日志',
  `download_count` int DEFAULT '0' COMMENT '下载次数',
  `star_count` int DEFAULT '0' COMMENT '点赞次数',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `bundle_url` varchar(500) DEFAULT NULL COMMENT '打包文件地址',
  `bundle_size` bigint DEFAULT NULL COMMENT '打包文件大小(字节)',
  `status` varchar(20) DEFAULT 'published' COMMENT '状态：draft-草稿，published-已发布，deprecated-已废弃',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_code` (`material_code`),
  KEY `idx_material_type` (`material_type`),
  KEY `idx_material_category` (`category`),
  KEY `idx_material_status` (`status`),
  KEY `idx_material_author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='物料表';

-- 物料版本表
DROP TABLE IF EXISTS `verto_material_version`;
CREATE TABLE `verto_material_version` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `material_id` varchar(32) NOT NULL COMMENT '物料ID',
  `version` varchar(20) NOT NULL COMMENT '版本号',
  `version_desc` varchar(200) DEFAULT NULL COMMENT '版本描述',
  `changelog` text COMMENT '变更日志',
  `source_code` longtext COMMENT '源代码',
  `bundle_url` varchar(500) DEFAULT NULL COMMENT '打包文件地址',
  `bundle_size` bigint DEFAULT NULL COMMENT '打包文件大小(字节)',
  `dependencies` text COMMENT '依赖信息JSON',
  `is_latest` tinyint DEFAULT '0' COMMENT '是否最新版本：0-否，1-是',
  `download_count` int DEFAULT '0' COMMENT '下载次数',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_version` (`material_id`,`version`),
  KEY `idx_material_version_latest` (`is_latest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='物料版本表';

-- 物料分类表
DROP TABLE IF EXISTS `verto_material_category`;
CREATE TABLE `verto_material_category` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `category_code` varchar(50) NOT NULL COMMENT '分类编码',
  `parent_id` varchar(32) DEFAULT NULL COMMENT '父分类ID',
  `level` tinyint DEFAULT '1' COMMENT '层级：1-一级，2-二级，3-三级',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `icon` varchar(100) DEFAULT NULL COMMENT '图标',
  `description` varchar(200) DEFAULT NULL COMMENT '描述',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`category_code`),
  KEY `idx_category_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='物料分类表';

-- =============================================
-- 4. 人员管理相关表
-- =============================================

-- 人员表
DROP TABLE IF EXISTS `verto_personnel`;
CREATE TABLE `verto_personnel` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `user_id` varchar(32) NOT NULL COMMENT '用户ID，关联sys_user表',
  `employee_no` varchar(50) DEFAULT NULL COMMENT '工号',
  `position` varchar(50) DEFAULT NULL COMMENT '职位',
  `level` varchar(20) DEFAULT NULL COMMENT '级别',
  `department` varchar(50) DEFAULT NULL COMMENT '部门',
  `team` varchar(50) DEFAULT NULL COMMENT '团队',
  `skills` text COMMENT '技能标签JSON',
  `skill_level` text COMMENT '技能等级JSON',
  `experience_years` decimal(3,1) DEFAULT NULL COMMENT '工作年限',
  `join_date` date DEFAULT NULL COMMENT '入职日期',
  `mentor` varchar(32) DEFAULT NULL COMMENT '导师',
  `mentor_name` varchar(50) DEFAULT NULL COMMENT '导师姓名',
  `work_location` varchar(100) DEFAULT NULL COMMENT '工作地点',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `emergency_contact` varchar(50) DEFAULT NULL COMMENT '紧急联系人',
  `emergency_phone` varchar(20) DEFAULT NULL COMMENT '紧急联系电话',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-在职，inactive-离职，leave-请假',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_personnel_user_id` (`user_id`),
  KEY `idx_personnel_employee_no` (`employee_no`),
  KEY `idx_personnel_department` (`department`),
  KEY `idx_personnel_team` (`team`),
  KEY `idx_personnel_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='人员表';

-- 工时记录表
DROP TABLE IF EXISTS `verto_timesheet`;
CREATE TABLE `verto_timesheet` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `personnel_id` varchar(32) NOT NULL COMMENT '人员ID',
  `work_date` date NOT NULL COMMENT '工作日期',
  `project_id` varchar(32) DEFAULT NULL COMMENT '项目ID',
  `project_name` varchar(100) DEFAULT NULL COMMENT '项目名称',
  `requirement_id` varchar(32) DEFAULT NULL COMMENT '需求ID',
  `requirement_title` varchar(200) DEFAULT NULL COMMENT '需求标题',
  `work_hours` decimal(4,2) NOT NULL COMMENT '工作小时数',
  `work_type` varchar(20) DEFAULT 'development' COMMENT '工作类型：development-开发，testing-测试，meeting-会议，review-评审，other-其他',
  `description` text COMMENT '工作描述',
  `status` varchar(20) DEFAULT 'submitted' COMMENT '状态：draft-草稿，submitted-已提交，approved-已审批，rejected-已拒绝',
  `approve_by` varchar(32) DEFAULT NULL COMMENT '审批人',
  `approve_by_name` varchar(50) DEFAULT NULL COMMENT '审批人姓名',
  `approve_time` datetime DEFAULT NULL COMMENT '审批时间',
  `reject_reason` varchar(500) DEFAULT NULL COMMENT '拒绝原因',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_timesheet_personnel_date` (`personnel_id`,`work_date`),
  KEY `idx_timesheet_project_id` (`project_id`),
  KEY `idx_timesheet_requirement_id` (`requirement_id`),
  KEY `idx_timesheet_status` (`status`),
  KEY `idx_timesheet_work_date` (`work_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工时记录表';

-- 技能字典表
DROP TABLE IF EXISTS `verto_skill_dict`;
CREATE TABLE `verto_skill_dict` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `skill_name` varchar(50) NOT NULL COMMENT '技能名称',
  `skill_code` varchar(50) NOT NULL COMMENT '技能编码',
  `category` varchar(50) DEFAULT NULL COMMENT '技能分类：frontend-前端，backend-后端，database-数据库，devops-运维，design-设计',
  `description` varchar(200) DEFAULT NULL COMMENT '技能描述',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_skill_code` (`skill_code`),
  KEY `idx_skill_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='技能字典表';

-- =============================================
-- 5. 集成配置相关表
-- =============================================

-- 集成配置表
DROP TABLE IF EXISTS `verto_integration_config`;
CREATE TABLE `verto_integration_config` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `config_type` varchar(50) NOT NULL COMMENT '配置类型：gitlab，jenkins，zentao，confluence，matomo',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `base_url` varchar(500) NOT NULL COMMENT '基础URL',
  `access_token` varchar(500) DEFAULT NULL COMMENT '访问令牌',
  `username` varchar(100) DEFAULT NULL COMMENT '用户名',
  `password` varchar(200) DEFAULT NULL COMMENT '密码（加密存储）',
  `extra_config` text COMMENT '额外配置JSON',
  `is_enabled` tinyint DEFAULT '1' COMMENT '是否启用：0-禁用，1-启用',
  `test_status` varchar(20) DEFAULT NULL COMMENT '测试状态：success-成功，failed-失败',
  `test_message` varchar(500) DEFAULT NULL COMMENT '测试信息',
  `test_time` datetime DEFAULT NULL COMMENT '测试时间',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_integration_config_type` (`config_type`),
  KEY `idx_integration_config_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='集成配置表';

-- 同步日志表
DROP TABLE IF EXISTS `verto_sync_log`;
CREATE TABLE `verto_sync_log` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `sync_type` varchar(50) NOT NULL COMMENT '同步类型：zentao_requirement，gitlab_branch，jenkins_build',
  `sync_target` varchar(100) DEFAULT NULL COMMENT '同步目标',
  `sync_status` varchar(20) NOT NULL COMMENT '同步状态：running-运行中，success-成功，failed-失败',
  `sync_message` text COMMENT '同步信息',
  `sync_data` longtext COMMENT '同步数据JSON',
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration` int DEFAULT NULL COMMENT '耗时(秒)',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  KEY `idx_sync_log_type` (`sync_type`),
  KEY `idx_sync_log_status` (`sync_status`),
  KEY `idx_sync_log_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='同步日志表';

-- =============================================
-- 6. 项目管理相关表
-- =============================================

-- 项目表
DROP TABLE IF EXISTS `verto_project`;
CREATE TABLE `verto_project` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `project_name` varchar(100) NOT NULL COMMENT '项目名称',
  `project_code` varchar(50) NOT NULL COMMENT '项目编码',
  `description` text COMMENT '项目描述',
  `project_type` varchar(20) DEFAULT 'web' COMMENT '项目类型：web-Web应用，mobile-移动应用，api-API服务，desktop-桌面应用',
  `status` varchar(20) DEFAULT 'planning' COMMENT '状态：planning-规划中，active-进行中，testing-测试中，completed-已完成，cancelled-已取消',
  `priority` tinyint DEFAULT '2' COMMENT '优先级：1-高，2-中，3-低',
  `owner` varchar(32) DEFAULT NULL COMMENT '项目负责人',
  `owner_name` varchar(50) DEFAULT NULL COMMENT '负责人姓名',
  `team_id` varchar(32) DEFAULT NULL COMMENT '所属团队',
  `team_name` varchar(50) DEFAULT NULL COMMENT '团队名称',
  `start_date` date DEFAULT NULL COMMENT '开始日期',
  `end_date` date DEFAULT NULL COMMENT '结束日期',
  `actual_start_date` date DEFAULT NULL COMMENT '实际开始日期',
  `actual_end_date` date DEFAULT NULL COMMENT '实际结束日期',
  `budget` decimal(12,2) DEFAULT NULL COMMENT '预算',
  `actual_cost` decimal(12,2) DEFAULT NULL COMMENT '实际成本',
  `progress` decimal(5,2) DEFAULT '0.00' COMMENT '进度百分比',
  `zentao_project_id` varchar(50) DEFAULT NULL COMMENT '禅道项目ID',
  `gitlab_group_id` varchar(50) DEFAULT NULL COMMENT 'GitLab组ID',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` tinyint DEFAULT '0' COMMENT '删除标志：0-正常，1-删除',
  `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_code` (`project_code`),
  KEY `idx_project_status` (`status`),
  KEY `idx_project_owner` (`owner`),
  KEY `idx_project_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='项目表';

-- 项目成员表
DROP TABLE IF EXISTS `verto_project_member`;
CREATE TABLE `verto_project_member` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `project_id` varchar(32) NOT NULL COMMENT '项目ID',
  `user_id` varchar(32) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) DEFAULT NULL COMMENT '用户姓名',
  `role` varchar(50) DEFAULT NULL COMMENT '角色：PM-项目经理，TL-技术负责人，DEV-开发，QA-测试，UI-设计师',
  `join_date` date DEFAULT NULL COMMENT '加入日期',
  `leave_date` date DEFAULT NULL COMMENT '离开日期',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_member` (`project_id`,`user_id`),
  KEY `idx_project_member_user_id` (`user_id`),
  KEY `idx_project_member_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='项目成员表';

-- =============================================
-- 7. 初始化数据
-- =============================================

-- 插入物料分类初始数据
INSERT INTO `verto_material_category` (`id`, `category_name`, `category_code`, `parent_id`, `level`, `sort_order`, `icon`, `description`, `status`) VALUES
('1', '基础组件', 'basic', NULL, 1, 1, 'AppstoreOutlined', '基础UI组件', 'active'),
('2', '业务组件', 'business', NULL, 1, 2, 'BlockOutlined', '业务相关组件', 'active'),
('3', '页面模板', 'template', NULL, 1, 3, 'FileOutlined', '页面模板', 'active'),
('4', '工具函数', 'utils', NULL, 1, 4, 'ToolOutlined', '工具函数和Hooks', 'active'),
('11', '表单组件', 'form', '1', 2, 11, 'FormOutlined', '表单相关组件', 'active'),
('12', '表格组件', 'table', '1', 2, 12, 'TableOutlined', '表格相关组件', 'active'),
('13', '图表组件', 'chart', '1', 2, 13, 'BarChartOutlined', '图表相关组件', 'active'),
('14', '导航组件', 'navigation', '1', 2, 14, 'MenuOutlined', '导航相关组件', 'active'),
('21', '用户管理', 'user', '2', 2, 21, 'UserOutlined', '用户管理相关组件', 'active'),
('22', '权限管理', 'permission', '2', 2, 22, 'SafetyOutlined', '权限管理相关组件', 'active'),
('23', '数据展示', 'data', '2', 2, 23, 'DashboardOutlined', '数据展示相关组件', 'active'),
('31', '管理后台', 'admin', '3', 2, 31, 'SettingOutlined', '管理后台页面模板', 'active'),
('32', '移动端', 'mobile', '3', 2, 32, 'MobileOutlined', '移动端页面模板', 'active'),
('41', 'React Hooks', 'hooks', '4', 2, 41, 'ApiOutlined', 'React Hooks', 'active'),
('42', '工具函数', 'function', '4', 2, 42, 'FunctionOutlined', '通用工具函数', 'active');

-- 插入技能字典初始数据
INSERT INTO `verto_skill_dict` (`id`, `skill_name`, `skill_code`, `category`, `description`, `sort_order`, `status`) VALUES
('1', 'Vue.js', 'vue', 'frontend', 'Vue.js框架', 1, 'active'),
('2', 'React', 'react', 'frontend', 'React框架', 2, 'active'),
('3', 'Angular', 'angular', 'frontend', 'Angular框架', 3, 'active'),
('4', 'TypeScript', 'typescript', 'frontend', 'TypeScript语言', 4, 'active'),
('5', 'JavaScript', 'javascript', 'frontend', 'JavaScript语言', 5, 'active'),
('6', 'HTML/CSS', 'html_css', 'frontend', 'HTML和CSS', 6, 'active'),
('7', 'Webpack', 'webpack', 'frontend', 'Webpack构建工具', 7, 'active'),
('8', 'Vite', 'vite', 'frontend', 'Vite构建工具', 8, 'active'),
('11', 'Java', 'java', 'backend', 'Java语言', 11, 'active'),
('12', 'Spring Boot', 'spring_boot', 'backend', 'Spring Boot框架', 12, 'active'),
('13', 'Spring Cloud', 'spring_cloud', 'backend', 'Spring Cloud微服务', 13, 'active'),
('14', 'MyBatis', 'mybatis', 'backend', 'MyBatis ORM框架', 14, 'active'),
('15', 'Node.js', 'nodejs', 'backend', 'Node.js运行时', 15, 'active'),
('16', 'Python', 'python', 'backend', 'Python语言', 16, 'active'),
('17', 'Go', 'golang', 'backend', 'Go语言', 17, 'active'),
('21', 'MySQL', 'mysql', 'database', 'MySQL数据库', 21, 'active'),
('22', 'PostgreSQL', 'postgresql', 'database', 'PostgreSQL数据库', 22, 'active'),
('23', 'Redis', 'redis', 'database', 'Redis缓存', 23, 'active'),
('24', 'MongoDB', 'mongodb', 'database', 'MongoDB文档数据库', 24, 'active'),
('25', 'ElasticSearch', 'elasticsearch', 'database', 'ElasticSearch搜索引擎', 25, 'active'),
('31', 'Docker', 'docker', 'devops', 'Docker容器', 31, 'active'),
('32', 'Kubernetes', 'kubernetes', 'devops', 'Kubernetes容器编排', 32, 'active'),
('33', 'Jenkins', 'jenkins', 'devops', 'Jenkins CI/CD', 33, 'active'),
('34', 'GitLab CI', 'gitlab_ci', 'devops', 'GitLab CI/CD', 34, 'active'),
('35', 'Linux', 'linux', 'devops', 'Linux操作系统', 35, 'active'),
('36', 'Nginx', 'nginx', 'devops', 'Nginx Web服务器', 36, 'active'),
('41', 'UI设计', 'ui_design', 'design', 'UI界面设计', 41, 'active'),
('42', 'UX设计', 'ux_design', 'design', 'UX用户体验设计', 42, 'active'),
('43', 'Figma', 'figma', 'design', 'Figma设计工具', 43, 'active'),
('44', 'Sketch', 'sketch', 'design', 'Sketch设计工具', 44, 'active'),
('45', 'Photoshop', 'photoshop', 'design', 'Photoshop图像处理', 45, 'active');

-- 插入集成配置示例数据（需要根据实际环境配置）
INSERT INTO `verto_integration_config` (`id`, `config_type`, `config_name`, `base_url`, `access_token`, `username`, `password`, `extra_config`, `is_enabled`, `test_status`) VALUES
('config_gitlab', 'gitlab', 'GitLab集成', 'https://gitlab.example.com', 'your_gitlab_token', NULL, NULL, '{"api_version":"v4"}', 0, NULL),
('config_jenkins', 'jenkins', 'Jenkins集成', 'https://jenkins.example.com', NULL, 'admin', 'encrypted_password', '{"csrf_protection":true}', 0, NULL),
('config_zentao', 'zentao', '禅道集成', 'https://zentao.example.com', NULL, 'admin', 'encrypted_password', '{"login_method":"form"}', 0, NULL),
('config_confluence', 'confluence', 'Confluence集成', 'https://confluence.example.com', 'your_confluence_token', NULL, NULL, '{"space_key":"DEV"}', 0, NULL),
('config_matomo', 'matomo', 'Matomo集成', 'https://matomo.example.com', 'your_matomo_token', NULL, NULL, '{"site_id":"1"}', 0, NULL);

-- 插入示例项目数据
INSERT INTO `verto_project` (`id`, `project_name`, `project_code`, `description`, `project_type`, `status`, `priority`, `owner`, `owner_name`, `start_date`, `end_date`, `progress`) VALUES
('project_demo', '前端项目管理平台', 'verto', '基于JeecgBoot的前端项目管理平台', 'web', 'active', 1, 'admin', '管理员', '2025-01-01', '2025-06-30', 25.00);

-- 设置外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 8. 创建视图
-- =============================================

-- 需求统计视图
CREATE OR REPLACE VIEW `v_requirement_stats` AS
SELECT 
    r.project_id,
    r.project_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN r.status = 'draft' THEN 1 ELSE 0 END) as draft_count,
    SUM(CASE WHEN r.status = 'active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN r.status = 'testing' THEN 1 ELSE 0 END) as testing_count,
    SUM(CASE WHEN r.status = 'closed' THEN 1 ELSE 0 END) as closed_count,
    AVG(r.completion_rate) as avg_completion_rate,
    SUM(r.estimated_hours) as total_estimated_hours,
    SUM(r.actual_hours) as total_actual_hours
FROM verto_requirement r
WHERE r.del_flag = 0
GROUP BY r.project_id, r.project_name;

-- 人员工时统计视图
CREATE OR REPLACE VIEW `v_personnel_timesheet_stats` AS
SELECT 
    t.personnel_id,
    p.user_id,
    u.realname as user_name,
    p.department,
    p.team,
    DATE_FORMAT(t.work_date, '%Y-%m') as work_month,
    SUM(t.work_hours) as total_hours,
    COUNT(DISTINCT t.work_date) as work_days,
    AVG(t.work_hours) as avg_daily_hours,
    SUM(CASE WHEN t.work_type = 'development' THEN t.work_hours ELSE 0 END) as development_hours,
    SUM(CASE WHEN t.work_type = 'testing' THEN t.work_hours ELSE 0 END) as testing_hours,
    SUM(CASE WHEN t.work_type = 'meeting' THEN t.work_hours ELSE 0 END) as meeting_hours
FROM verto_timesheet t
LEFT JOIN verto_personnel p ON t.personnel_id = p.id
LEFT JOIN sys_user u ON p.user_id = u.id
WHERE t.status = 'approved'
GROUP BY t.personnel_id, p.user_id, u.realname, p.department, p.team, DATE_FORMAT(t.work_date, '%Y-%m');

-- 应用构建统计视图
CREATE OR REPLACE VIEW `v_build_stats` AS
SELECT 
    b.application_id,
    a.app_name,
    a.app_code,
    DATE_FORMAT(b.build_time, '%Y-%m-%d') as build_date,
    COUNT(*) as total_builds,
    SUM(CASE WHEN b.build_status = 'success' THEN 1 ELSE 0 END) as success_builds,
    SUM(CASE WHEN b.build_status = 'failed' THEN 1 ELSE 0 END) as failed_builds,
    ROUND(SUM(CASE WHEN b.build_status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate,
    AVG(b.build_duration) as avg_duration
FROM verto_build_record b
LEFT JOIN verto_application a ON b.application_id = a.id
WHERE a.del_flag = 0
GROUP BY b.application_id, a.app_name, a.app_code, DATE_FORMAT(b.build_time, '%Y-%m-%d');

-- =============================================
-- 9. 创建存储过程
-- =============================================

DELIMITER //

-- 需求状态变更存储过程
CREATE PROCEDURE `sp_update_requirement_status`(
    IN p_requirement_id VARCHAR(32),
    IN p_new_status VARCHAR(20),
    IN p_change_reason TEXT,
    IN p_change_by VARCHAR(32),
    IN p_change_by_name VARCHAR(50)
)
BEGIN
    DECLARE v_old_status VARCHAR(20);
    DECLARE v_history_id VARCHAR(32);
    
    -- 获取当前状态
    SELECT status INTO v_old_status FROM verto_requirement WHERE id = p_requirement_id;
    
    -- 更新需求状态
    UPDATE verto_requirement 
    SET status = p_new_status, 
        update_by = p_change_by, 
        update_time = NOW()
    WHERE id = p_requirement_id;
    
    -- 生成历史记录ID
    SET v_history_id = REPLACE(UUID(), '-', '');
    
    -- 插入状态变更历史
    INSERT INTO verto_requirement_history (
        id, requirement_id, old_status, new_status, 
        change_reason, change_by, change_by_name, change_time
    ) VALUES (
        v_history_id, p_requirement_id, v_old_status, p_new_status,
        p_change_reason, p_change_by, p_change_by_name, NOW()
    );
END //

-- 工时审批存储过程
CREATE PROCEDURE `sp_approve_timesheet`(
    IN p_timesheet_id VARCHAR(32),
    IN p_approve_by VARCHAR(32),
    IN p_approve_by_name VARCHAR(50),
    IN p_action VARCHAR(10), -- 'approve' or 'reject'
    IN p_reject_reason VARCHAR(500)
)
BEGIN
    DECLARE v_new_status VARCHAR(20);
    
    IF p_action = 'approve' THEN
        SET v_new_status = 'approved';
    ELSE
        SET v_new_status = 'rejected';
    END IF;
    
    UPDATE verto_timesheet 
    SET status = v_new_status,
        approve_by = p_approve_by,
        approve_by_name = p_approve_by_name,
        approve_time = NOW(),
        reject_reason = CASE WHEN p_action = 'reject' THEN p_reject_reason ELSE NULL END,
        update_by = p_approve_by,
        update_time = NOW()
    WHERE id = p_timesheet_id;
END //

DELIMITER ;

-- =============================================
-- 10. 创建触发器
-- =============================================

DELIMITER //

-- 物料下载计数触发器
CREATE TRIGGER `tr_material_download_count` 
AFTER INSERT ON `verto_material_version`
FOR EACH ROW
BEGIN
    IF NEW.download_count > 0 THEN
        UPDATE verto_material 
        SET download_count = download_count + NEW.download_count
        WHERE id = NEW.material_id;
    END IF;
END //

-- 需求完成进度更新触发器
CREATE TRIGGER `tr_requirement_completion_rate`
BEFORE UPDATE ON `verto_requirement`
FOR EACH ROW
BEGIN
    -- 根据状态自动设置完成进度
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        SET NEW.completion_rate = 100.00;
    ELSEIF NEW.status = 'testing' AND OLD.status != 'testing' THEN
        SET NEW.completion_rate = 80.00;
    ELSEIF NEW.status = 'active' AND OLD.status = 'draft' THEN
        SET NEW.completion_rate = 10.00;
    END IF;
END //

DELIMITER ;

-- =============================================
-- 脚本执行完成
-- =============================================

SELECT 'Verto项目管理平台数据库初始化完成！' as message;
SELECT CONCAT('共创建表: ', COUNT(*), '个') as table_count 
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name LIKE 'verto_%';