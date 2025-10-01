-- ===================================================================
-- Staff Management System Database Schema
-- 员工管理系统数据库结构
-- ===================================================================

-- 系统消息表 (System Message Table)
-- 用于存储系统内部消息，包括通知、提醒等
DROP TABLE IF EXISTS `sys_message`;
CREATE TABLE `sys_message` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `title` varchar(100) DEFAULT NULL COMMENT '消息标题',
  `msg_content` text COMMENT '消息内容',
  `msg_type` varchar(10) DEFAULT NULL COMMENT '消息类型 1:通知公告 2:系统消息',
  `msg_category` varchar(10) DEFAULT '1' COMMENT '消息分类 1:普通消息 2:紧急消息',
  `send_status` varchar(10) DEFAULT NULL COMMENT '发送状态 0:未发送 1:已发送',
  `send_time` datetime DEFAULT NULL COMMENT '发送时间',
  `cancel_time` datetime DEFAULT NULL COMMENT '撤销时间',
  `bus_type` varchar(20) DEFAULT NULL COMMENT '业务类型',
  `bus_id` varchar(50) DEFAULT NULL COMMENT '业务ID',
  `open_type` varchar(20) DEFAULT NULL COMMENT '打开方式 组件：component 路由：url',
  `open_page` varchar(255) DEFAULT NULL COMMENT '组件/路由 地址',
  `map_id` varchar(32) DEFAULT NULL COMMENT '消息中心消息关联ID',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` int(1) DEFAULT '0' COMMENT '删除状态 0:正常 1:已删除',
  PRIMARY KEY (`id`),
  KEY `index_bus_id` (`bus_id`),
  KEY `index_send_status` (`send_status`),
  KEY `index_msg_type` (`msg_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统消息表';

-- 系统消息模板表 (System Message Template Table)
-- 用于存储消息模板，支持参数化消息发送
DROP TABLE IF EXISTS `sys_message_template`;
CREATE TABLE `sys_message_template` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `template_code` varchar(32) NOT NULL COMMENT '模板编码',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `template_title` varchar(200) DEFAULT NULL COMMENT '模板标题',
  `template_content` longtext COMMENT '模板内容',
  `template_type` varchar(10) DEFAULT NULL COMMENT '模板类型 1:系统消息 2:短信 3:邮件 4:微信',
  `template_params` varchar(500) DEFAULT NULL COMMENT '模板参数',
  `template_json` longtext COMMENT '模板测试json',
  `create_by` varchar(32) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(32) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` int(1) DEFAULT '0' COMMENT '删除状态 0:正常 1:已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`template_code`),
  KEY `index_template_type` (`template_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统消息模板表';

-- 用户消息表 (User Message Table)
-- 用于存储用户接收的消息记录
DROP TABLE IF EXISTS `sys_user_message`;
CREATE TABLE `sys_user_message` (
  `id` varchar(32) NOT NULL COMMENT '主键ID',
  `user_id` varchar(32) NOT NULL COMMENT '用户ID',
  `message_id` varchar(32) NOT NULL COMMENT '消息ID',
  `read_flag` int(1) DEFAULT '0' COMMENT '阅读状态 0:未读 1:已读',
  `read_time` datetime DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `index_user_id` (`user_id`),
  KEY `index_message_id` (`message_id`),
  KEY `index_read_flag` (`read_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户消息表';

-- 插入默认消息模板数据
INSERT INTO `sys_message_template` VALUES 
('1', 'WELCOME_MSG', '欢迎消息模板', '欢迎加入员工管理系统', '亲爱的${userName}，欢迎您加入我们的员工管理系统！', '1', 'userName', '{"userName":"张三"}', 'admin', NOW(), 'admin', NOW(), 0),
('2', 'PASSWORD_RESET', '密码重置模板', '密码重置通知', '您的密码已重置，新密码为：${newPassword}，请及时修改。', '1', 'newPassword', '{"newPassword":"123456"}', 'admin', NOW(), 'admin', NOW(), 0),
('3', 'SYSTEM_NOTICE', '系统通知模板', '系统维护通知', '系统将于${maintenanceTime}进行维护，预计耗时${duration}小时。', '1', 'maintenanceTime,duration', '{"maintenanceTime":"2024-01-01 02:00","duration":"2"}', 'admin', NOW(), 'admin', NOW(), 0);

-- 创建索引以提高查询性能
CREATE INDEX idx_sys_message_create_time ON sys_message(create_time);
CREATE INDEX idx_sys_message_send_time ON sys_message(send_time);
CREATE INDEX idx_sys_user_message_create_time ON sys_user_message(create_time);