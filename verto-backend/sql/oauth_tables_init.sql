-- Verto OAuth 数据表初始化脚本
-- 目的：创建 oauth_user 与 oauth_token 两张表，供后端 OAuth 模块持久化使用
-- 使用方法：在 MySQL 中执行本脚本（确保已存在数据库 verto），或根据需要修改 USE 目标库名

USE `verto`;

-- 为避免外键或依赖关系问题，按安全顺序删除旧表（若不存在则忽略）
DROP TABLE IF EXISTS `oauth_user`;
DROP TABLE IF EXISTS `oauth_token`;

-- 1) 访问令牌表：oauth_token
-- 说明：保存第三方平台 access_token 及相关信息
CREATE TABLE `oauth_token` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '主键ID（雪花算法生成）',
  `platform` VARCHAR(32) NOT NULL COMMENT '平台标识（如：github、gitlab）',
  `oauth_user_id` VARCHAR(128) NOT NULL COMMENT '第三方用户唯一ID',
  `access_token` VARCHAR(1024) NOT NULL COMMENT '访问令牌',
  `token_type` VARCHAR(64) DEFAULT 'Bearer' COMMENT '令牌类型',
  `scope` VARCHAR(1024) NULL COMMENT '权限范围',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expires_at` DATETIME NULL COMMENT '过期时间（如有）',
  KEY `idx_platform_user` (`platform`, `oauth_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三方OAuth访问令牌表';

-- 2) 用户绑定信息表：oauth_user
-- 说明：保存第三方平台的用户绑定信息，记录最近一次 token 的 id（last_token_id）
CREATE TABLE `oauth_user` (
  `id` BIGINT NOT NULL PRIMARY KEY COMMENT '主键ID（雪花算法生成）',
  `platform` VARCHAR(32) NOT NULL COMMENT '平台标识（如：github、gitlab）',
  `oauth_user_id` VARCHAR(128) NOT NULL COMMENT '第三方用户唯一ID',
  `login` VARCHAR(128) NOT NULL COMMENT '第三方登录名（如 GitHub login）',
  `name` VARCHAR(256) NULL COMMENT '显示名称',
  `avatar_url` VARCHAR(512) NULL COMMENT '头像地址',
  `email` VARCHAR(256) NULL COMMENT '邮箱',
  `bound_at` DATETIME NULL COMMENT '绑定时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_token_id` BIGINT NULL COMMENT '最近一次关联的令牌ID',
  UNIQUE KEY `uk_platform_oauth_user` (`platform`, `oauth_user_id`),
  KEY `idx_login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三方OAuth用户绑定表';

-- 3) 可选外键：便于维护 last_token_id 与 oauth_token 的引用关系
-- 若不希望引入约束，可注释或移除此语句
ALTER TABLE `oauth_user`
  ADD CONSTRAINT `fk_oauth_user_last_token`
  FOREIGN KEY (`last_token_id`) REFERENCES `oauth_token`(`id`)
  ON DELETE SET NULL
  ON UPDATE RESTRICT;

-- 4) 验证输出
SELECT 'OAuth 数据表初始化完成！' AS message;
SHOW TABLES LIKE 'oauth%';