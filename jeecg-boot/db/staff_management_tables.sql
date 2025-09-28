-- ===========================
-- 员工管理模块数据库表脚本
-- ===========================

-- ----------------------------
-- Table structure for staff
-- ----------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '主键ID',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建日期',
  `update_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '更新人',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新日期',
  `sys_org_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属部门',
  `tenant_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '租户id',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工姓名',
  `employee_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工编号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `hire_date` date NULL DEFAULT NULL COMMENT '入职日期',
  `work_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '工作地点',
  `skills_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '技能JSON数据',
  `skills` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '技能标签（逗号分隔）',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态（active=在职，inactive=离职）',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_employee_no` (`employee_no`) USING BTREE COMMENT '员工编号唯一索引',
  KEY `idx_name` (`name`) USING BTREE COMMENT '姓名索引',
  KEY `idx_email` (`email`) USING BTREE COMMENT '邮箱索引',
  KEY `idx_status` (`status`) USING BTREE COMMENT '状态索引',
  KEY `idx_hire_date` (`hire_date`) USING BTREE COMMENT '入职日期索引',
  KEY `idx_work_location` (`work_location`) USING BTREE COMMENT '工作地点索引'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '员工信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of staff (示例数据)
-- ----------------------------
INSERT INTO `staff` VALUES 
('1', 'admin', '2024-01-01 10:00:00', 'admin', '2024-01-01 10:00:00', 'A01', NULL, '张三', 'EMP001', 'zhangsan@example.com', '13800138001', '2023-01-15', '北京', '[{"name":"Java","level":"高级"},{"name":"Spring Boot","level":"中级"}]', 'Java,Spring Boot', 'active', '优秀的后端开发工程师'),
('2', 'admin', '2024-01-01 10:00:00', 'admin', '2024-01-01 10:00:00', 'A02', NULL, '李四', 'EMP002', 'lisi@example.com', '13800138002', '2023-02-20', '上海', '[{"name":"Vue.js","level":"高级"},{"name":"React","level":"中级"}]', 'Vue.js,React', 'active', '前端开发专家'),
('3', 'admin', '2024-01-01 10:00:00', 'admin', '2024-01-01 10:00:00', 'A03', NULL, '王五', 'EMP003', 'wangwu@example.com', '13800138003', '2023-03-10', '深圳', '[{"name":"Python","level":"高级"},{"name":"机器学习","level":"中级"}]', 'Python,机器学习', 'active', '数据科学工程师'),
('4', 'admin', '2024-01-01 10:00:00', 'admin', '2024-01-01 10:00:00', 'A04', NULL, '赵六', 'EMP004', 'zhaoliu@example.com', '13800138004', '2023-04-05', '广州', '[{"name":"UI设计","level":"高级"},{"name":"Figma","level":"高级"}]', 'UI设计,Figma', 'active', '资深UI设计师'),
('5', 'admin', '2024-01-01 10:00:00', 'admin', '2024-01-01 10:00:00', 'A05', NULL, '孙七', 'EMP005', 'sunqi@example.com', '13800138005', '2023-05-12', '杭州', '[{"name":"项目管理","level":"高级"},{"name":"敏捷开发","level":"中级"}]', '项目管理,敏捷开发', 'active', '项目经理');

-- ----------------------------
-- 创建相关索引以优化查询性能
-- ----------------------------
-- 复合索引：状态+入职日期
CREATE INDEX `idx_status_hire_date` ON `staff` (`status`, `hire_date`) USING BTREE;

-- 复合索引：工作地点+状态
CREATE INDEX `idx_location_status` ON `staff` (`work_location`, `status`) USING BTREE;

-- 全文索引：技能搜索（如果需要）
-- ALTER TABLE `staff` ADD FULLTEXT(`skills`) WITH PARSER ngram;

-- ----------------------------
-- 表注释和字段注释说明
-- ----------------------------
/*
员工信息表 (staff) 字段说明：
- id: 主键ID，使用UUID格式
- create_by: 创建人，记录数据创建者
- create_time: 创建时间，记录数据创建时间
- update_by: 更新人，记录最后更新者
- update_time: 更新时间，记录最后更新时间
- sys_org_code: 所属部门编码，用于数据权限控制
- tenant_id: 租户ID，用于多租户数据隔离
- name: 员工姓名，必填字段
- employee_no: 员工编号，唯一标识，必填字段
- email: 员工邮箱，用于联系和登录
- phone: 手机号码，联系方式
- hire_date: 入职日期，记录员工入职时间
- work_location: 工作地点，员工办公地点
- skills_json: 技能详细信息，JSON格式存储技能名称和等级
- skills: 技能标签，逗号分隔的技能列表，便于搜索
- status: 员工状态，active表示在职，inactive表示离职
- remark: 备注信息，记录额外说明

索引设计说明：
1. 主键索引：id字段自动创建
2. 唯一索引：employee_no确保员工编号唯一性
3. 单列索引：name、email、status、hire_date、work_location用于常见查询
4. 复合索引：status+hire_date、work_location+status用于组合查询优化
*/