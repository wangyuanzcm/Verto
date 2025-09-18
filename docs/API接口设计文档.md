# 前端项目管理平台 API 接口设计文档

## 文档信息
- **版本**: v1.0
- **创建日期**: 2025-01-18
- **最后更新**: 2025-01-18
- **维护人**: 开发团队

## 目录
1. [接口规范](#接口规范)
2. [认证授权](#认证授权)
3. [需求管理模块](#需求管理模块)
4. [应用管理模块](#应用管理模块)
5. [物料管理模块](#物料管理模块)
6. [人员管理模块](#人员管理模块)
7. [集成配置模块](#集成配置模块)
8. [项目管理模块](#项目管理模块)
9. [统计分析模块](#统计分析模块)
10. [错误码定义](#错误码定义)

## 接口规范

### 基础信息
- **基础URL**: `http://localhost:8080/jeecg-boot`
- **API版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8
- **请求方式**: RESTful

### 通用响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "result": {},
  "timestamp": 1642492800000
}
```

### 分页响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "records": [],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  },
  "timestamp": 1642492800000
}
```

### 请求头规范
```
Content-Type: application/json
X-Access-Token: {token}
X-Tenant-Id: {tenantId}
```

## 认证授权

### 用户登录
```
POST /sys/login
```

**请求参数**:
```json
{
  "username": "admin",
  "password": "123456",
  "captcha": "1234",
  "checkKey": "uuid"
}
```

**响应数据**:
```json
{
  "success": true,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userInfo": {
      "id": "1",
      "username": "admin",
      "realname": "管理员",
      "avatar": "/avatar/admin.jpg"
    }
  }
}
```

### 获取用户信息
```
GET /sys/user/info
```

### 用户登出
```
POST /sys/logout
```

## 需求管理模块

### 需求列表查询
```
GET /verto/requirement/list
```

**查询参数**:
- `pageNo`: 页码 (默认: 1)
- `pageSize`: 页大小 (默认: 10)
- `title`: 需求标题 (模糊查询)
- `status`: 状态筛选
- `priority`: 优先级筛选
- `assignee`: 指派人筛选
- `projectId`: 项目ID筛选
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应数据**:
```json
{
  "success": true,
  "result": {
    "records": [
      {
        "id": "req001",
        "zentaoId": "ZT001",
        "title": "用户登录功能",
        "description": "实现用户登录功能",
        "priority": 1,
        "status": "active",
        "type": "feature",
        "assignee": "user001",
        "assigneeName": "张三",
        "projectId": "proj001",
        "projectName": "前端管理系统",
        "estimatedHours": 16.0,
        "actualHours": 12.0,
        "completionRate": 75.0,
        "createTime": "2025-01-18 10:00:00"
      }
    ],
    "total": 50,
    "current": 1,
    "size": 10
  }
}
```

### 需求详情查询
```
GET /verto/requirement/{id}
```

### 创建需求
```
POST /verto/requirement
```

**请求参数**:
```json
{
  "zentaoId": "ZT002",
  "title": "用户注册功能",
  "description": "实现用户注册功能，包括邮箱验证",
  "priority": 2,
  "type": "feature",
  "assignee": "user002",
  "projectId": "proj001",
  "estimatedHours": 20.0,
  "startDate": "2025-01-20",
  "endDate": "2025-01-25",
  "tags": "用户管理,注册"
}
```

### 更新需求
```
PUT /verto/requirement/{id}
```

### 删除需求
```
DELETE /verto/requirement/{id}
```

### 批量删除需求
```
DELETE /verto/requirement/batch
```

**请求参数**:
```json
{
  "ids": ["req001", "req002", "req003"]
}
```

### 需求状态变更
```
PUT /verto/requirement/{id}/status
```

**请求参数**:
```json
{
  "status": "testing",
  "changeReason": "开发完成，进入测试阶段"
}
```

### 需求状态变更历史
```
GET /verto/requirement/{id}/history
```

### 需求附件上传
```
POST /verto/requirement/{id}/attachment
```

### 需求附件列表
```
GET /verto/requirement/{id}/attachments
```

### 需求附件下载
```
GET /verto/requirement/attachment/{attachmentId}/download
```

### 禅道需求同步
```
POST /verto/requirement/sync/zentao
```

**请求参数**:
```json
{
  "projectId": "proj001",
  "syncType": "incremental", // full | incremental
  "lastSyncTime": "2025-01-18 00:00:00"
}
```

### 创建Git分支
```
POST /verto/requirement/{id}/branch
```

**请求参数**:
```json
{
  "branchName": "feature/user-login",
  "baseBranch": "develop",
  "gitlabProjectId": "123"
}
```

## 应用管理模块

### 应用列表查询
```
GET /verto/application/list
```

**查询参数**:
- `pageNo`: 页码
- `pageSize`: 页大小
- `appName`: 应用名称
- `appType`: 应用类型
- `status`: 状态
- `owner`: 负责人
- `teamId`: 团队ID

### 应用详情查询
```
GET /verto/application/{id}
```

### 创建应用
```
POST /verto/application
```

**请求参数**:
```json
{
  "appName": "用户管理系统",
  "appCode": "user-management",
  "description": "用户管理系统前端应用",
  "appType": "web",
  "techStack": "Vue3 + TypeScript + Vite",
  "frameworkVersion": "3.3.0",
  "owner": "user001",
  "teamId": "team001",
  "gitlabUrl": "https://gitlab.com/group/user-management",
  "domain": "user.example.com",
  "port": 3000
}
```

### 更新应用
```
PUT /verto/application/{id}
```

### 删除应用
```
DELETE /verto/application/{id}
```

### GitLab仓库同步
```
POST /verto/application/sync/gitlab
```

### Jenkins流水线关联
```
POST /verto/application/{id}/jenkins
```

**请求参数**:
```json
{
  "jenkinsJobName": "user-management-frontend",
  "jenkinsUrl": "https://jenkins.example.com/job/user-management-frontend"
}
```

### 应用构建记录
```
GET /verto/application/{id}/builds
```

### 触发构建
```
POST /verto/application/{id}/build
```

**请求参数**:
```json
{
  "branchName": "develop",
  "deployEnv": "test",
  "buildParams": {
    "NODE_ENV": "production",
    "API_BASE_URL": "https://api-test.example.com"
  }
}
```

### 应用环境配置
```
GET /verto/application/{id}/environments
POST /verto/application/{id}/environment
PUT /verto/application/{id}/environment/{envId}
DELETE /verto/application/{id}/environment/{envId}
```

### 应用健康检查
```
GET /verto/application/{id}/health
```

## 物料管理模块

### 物料列表查询
```
GET /verto/material/list
```

**查询参数**:
- `pageNo`: 页码
- `pageSize`: 页大小
- `materialName`: 物料名称
- `materialType`: 物料类型
- `category`: 分类
- `author`: 作者
- `tags`: 标签
- `status`: 状态

### 物料详情查询
```
GET /verto/material/{id}
```

### 创建物料
```
POST /verto/material
```

**请求参数**:
```json
{
  "materialName": "用户表格组件",
  "materialCode": "user-table",
  "materialType": "component",
  "category": "table",
  "description": "支持增删改查的用户表格组件",
  "version": "1.0.0",
  "tags": "表格,用户,CRUD",
  "keywords": "table,user,crud",
  "sourceCode": "<template>...</template>",
  "dependencies": {
    "vue": "^3.3.0",
    "ant-design-vue": "^4.0.0"
  },
  "propsSchema": {
    "type": "object",
    "properties": {
      "dataSource": {
        "type": "array",
        "description": "表格数据源"
      }
    }
  },
  "usageDoc": "## 使用方法\n\n```vue\n<UserTable :dataSource=\"users\" />\n```"
}
```

### 更新物料
```
PUT /verto/material/{id}
```

### 删除物料
```
DELETE /verto/material/{id}
```

### 物料版本管理
```
GET /verto/material/{id}/versions
POST /verto/material/{id}/version
GET /verto/material/{id}/version/{version}
```

### 物料下载
```
GET /verto/material/{id}/download
GET /verto/material/{id}/version/{version}/download
```

### 物料预览
```
GET /verto/material/{id}/preview
```

### 物料搜索
```
GET /verto/material/search
```

**查询参数**:
- `keyword`: 搜索关键词
- `type`: 物料类型
- `category`: 分类
- `tags`: 标签

### 物料分类管理
```
GET /verto/material/categories
POST /verto/material/category
PUT /verto/material/category/{id}
DELETE /verto/material/category/{id}
```

### 物料统计
```
GET /verto/material/stats
```

## 人员管理模块

### 人员列表查询
```
GET /verto/personnel/list
```

### 人员详情查询
```
GET /verto/personnel/{id}
```

### 创建人员档案
```
POST /verto/personnel
```

**请求参数**:
```json
{
  "userId": "user001",
  "employeeNo": "EMP001",
  "position": "前端开发工程师",
  "level": "P6",
  "department": "技术部",
  "team": "前端团队",
  "skills": ["vue", "react", "typescript"],
  "skillLevel": {
    "vue": 4,
    "react": 3,
    "typescript": 4
  },
  "experienceYears": 3.5,
  "joinDate": "2022-01-15",
  "workLocation": "北京",
  "contactPhone": "13800138000"
}
```

### 更新人员档案
```
PUT /verto/personnel/{id}
```

### 人员技能矩阵
```
GET /verto/personnel/skill-matrix
```

### 工时记录管理
```
GET /verto/timesheet/list
POST /verto/timesheet
PUT /verto/timesheet/{id}
DELETE /verto/timesheet/{id}
```

### 工时记录提交
```
POST /verto/timesheet/{id}/submit
```

### 工时记录审批
```
POST /verto/timesheet/{id}/approve
```

**请求参数**:
```json
{
  "action": "approve", // approve | reject
  "rejectReason": "工时填写不准确"
}
```

### 工时统计
```
GET /verto/timesheet/stats
```

**查询参数**:
- `personnelId`: 人员ID
- `startDate`: 开始日期
- `endDate`: 结束日期
- `projectId`: 项目ID

### 技能字典管理
```
GET /verto/skill/list
POST /verto/skill
PUT /verto/skill/{id}
DELETE /verto/skill/{id}
```

## 集成配置模块

### 集成配置列表
```
GET /verto/integration/config/list
```

### 集成配置详情
```
GET /verto/integration/config/{id}
```

### 创建集成配置
```
POST /verto/integration/config
```

**请求参数**:
```json
{
  "configType": "gitlab",
  "configName": "GitLab集成",
  "baseUrl": "https://gitlab.example.com",
  "accessToken": "glpat-xxxxxxxxxxxxxxxxxxxx",
  "extraConfig": {
    "apiVersion": "v4",
    "timeout": 30000
  }
}
```

### 更新集成配置
```
PUT /verto/integration/config/{id}
```

### 测试集成配置
```
POST /verto/integration/config/{id}/test
```

### 同步日志查询
```
GET /verto/integration/sync-log/list
```

### 手动同步
```
POST /verto/integration/sync
```

**请求参数**:
```json
{
  "syncType": "zentao_requirement",
  "syncTarget": "project_001",
  "syncParams": {
    "projectId": "1",
    "lastSyncTime": "2025-01-18 00:00:00"
  }
}
```

## 项目管理模块

### 项目列表查询
```
GET /verto/project/list
```

### 项目详情查询
```
GET /verto/project/{id}
```

### 创建项目
```
POST /verto/project
```

**请求参数**:
```json
{
  "projectName": "电商管理系统",
  "projectCode": "ecommerce-admin",
  "description": "电商后台管理系统",
  "projectType": "web",
  "priority": 1,
  "owner": "user001",
  "teamId": "team001",
  "startDate": "2025-02-01",
  "endDate": "2025-08-31",
  "budget": 500000.00
}
```

### 更新项目
```
PUT /verto/project/{id}
```

### 项目成员管理
```
GET /verto/project/{id}/members
POST /verto/project/{id}/member
PUT /verto/project/{id}/member/{memberId}
DELETE /verto/project/{id}/member/{memberId}
```

### 项目进度更新
```
PUT /verto/project/{id}/progress
```

**请求参数**:
```json
{
  "progress": 65.5,
  "progressDesc": "前端开发完成65%，后端开发完成70%"
}
```

## 统计分析模块

### 需求统计
```
GET /verto/stats/requirement
```

**查询参数**:
- `projectId`: 项目ID
- `startDate`: 开始日期
- `endDate`: 结束日期
- `groupBy`: 分组方式 (status|priority|assignee|project)

**响应数据**:
```json
{
  "success": true,
  "result": {
    "totalCount": 150,
    "statusStats": {
      "draft": 20,
      "active": 80,
      "testing": 30,
      "closed": 20
    },
    "priorityStats": {
      "high": 30,
      "medium": 90,
      "low": 30
    },
    "completionRate": 75.5,
    "avgEstimatedHours": 16.5,
    "avgActualHours": 18.2
  }
}
```

### 应用构建统计
```
GET /verto/stats/build
```

### 人员工时统计
```
GET /verto/stats/timesheet
```

### 物料使用统计
```
GET /verto/stats/material
```

### 项目进度统计
```
GET /verto/stats/project
```

### 团队效能统计
```
GET /verto/stats/team-efficiency
```

### 仪表板数据
```
GET /verto/stats/dashboard
```

**响应数据**:
```json
{
  "success": true,
  "result": {
    "overview": {
      "totalProjects": 15,
      "activeRequirements": 120,
      "totalApplications": 25,
      "totalMaterials": 180
    },
    "recentActivities": [
      {
        "type": "requirement",
        "action": "created",
        "title": "用户登录功能",
        "user": "张三",
        "time": "2025-01-18 14:30:00"
      }
    ],
    "buildStats": {
      "todayBuilds": 12,
      "successRate": 85.5,
      "avgDuration": 180
    },
    "timesheetStats": {
      "todayHours": 64.5,
      "weeklyHours": 320.0,
      "pendingApproval": 8
    }
  }
}
```

## 错误码定义

### 通用错误码
- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务错误码
- `10001`: 用户名或密码错误
- `10002`: 验证码错误
- `10003`: 账户已被锁定
- `10004`: Token已过期
- `10005`: Token无效

### 需求管理错误码
- `20001`: 需求不存在
- `20002`: 需求状态不允许此操作
- `20003`: 禅道同步失败
- `20004`: Git分支创建失败
- `20005`: 需求已关联分支

### 应用管理错误码
- `30001`: 应用不存在
- `30002`: 应用编码已存在
- `30003`: GitLab仓库不存在
- `30004`: Jenkins任务不存在
- `30005`: 构建触发失败

### 物料管理错误码
- `40001`: 物料不存在
- `40002`: 物料编码已存在
- `40003`: 物料版本已存在
- `40004`: 物料正在使用中，无法删除
- `40005`: 物料打包失败

### 人员管理错误码
- `50001`: 人员档案不存在
- `50002`: 工时记录不存在
- `50003`: 工时记录已提交，无法修改
- `50004`: 工时记录已审批，无法修改
- `50005`: 技能不存在

### 集成配置错误码
- `60001`: 集成配置不存在
- `60002`: 集成配置测试失败
- `60003`: 第三方API调用失败
- `60004`: 认证信息无效
- `60005`: 同步任务正在运行中

## 接口调用示例

### JavaScript/TypeScript
```typescript
// 使用axios调用API
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/jeecg-boot',
  headers: {
    'Content-Type': 'application/json',
    'X-Access-Token': localStorage.getItem('token')
  }
});

// 查询需求列表
const getRequirements = async (params: any) => {
  const response = await api.get('/verto/requirement/list', { params });
  return response.data;
};

// 创建需求
const createRequirement = async (data: any) => {
  const response = await api.post('/verto/requirement', data);
  return response.data;
};
```

### cURL
```bash
# 用户登录
curl -X POST http://localhost:8080/jeecg-boot/sys/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "captcha": "1234",
    "checkKey": "uuid"
  }'

# 查询需求列表
curl -X GET "http://localhost:8080/jeecg-boot/verto/requirement/list?pageNo=1&pageSize=10" \
  -H "X-Access-Token: your_token_here"

# 创建需求
curl -X POST http://localhost:8080/jeecg-boot/verto/requirement \
  -H "Content-Type: application/json" \
  -H "X-Access-Token: your_token_here" \
  -d '{
    "title": "用户登录功能",
    "description": "实现用户登录功能",
    "priority": 1,
    "type": "feature",
    "assignee": "user001",
    "projectId": "proj001"
  }'
```

## 版本更新记录

### v1.0 (2025-01-18)
- 初始版本
- 完成需求管理、应用管理、物料管理、人员管理模块API设计
- 完成集成配置、项目管理、统计分析模块API设计
- 定义通用响应格式和错误码

---

**注意事项**:
1. 所有接口都需要进行身份认证，除了登录接口
2. 分页查询默认页大小为10，最大不超过100
3. 日期时间格式统一使用 `yyyy-MM-dd HH:mm:ss`
4. 文件上传接口需要使用 `multipart/form-data` 格式
5. 批量操作接口建议限制单次操作数量不超过100条
6. 所有删除操作都是逻辑删除，不会物理删除数据
7. 敏感信息（如密码、Token）在日志中需要脱敏处理