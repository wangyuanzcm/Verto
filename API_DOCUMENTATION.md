# Verto 项目管理平台 API 接口文档

## 接口概述

本文档描述了 Verto 项目管理平台的所有 REST API 接口。所有接口均遵循 RESTful 设计规范，使用 JSON 格式进行数据交换。

## 基础信息

- **Base URL**: `http://localhost:8080`
- **API 版本**: v1.0
- **认证方式**: JWT Token
- **内容类型**: `application/json`

## 通用响应格式

所有接口均使用统一的响应格式：

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "result": {},
  "timestamp": 1640995200000
}
```

### 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| code | integer | 响应状态码 |
| message | string | 响应消息 |
| result | object | 响应数据 |
| timestamp | long | 响应时间戳 |

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 1. 人员管理模块 API

### 1.1 分页查询人员列表

**接口地址**: `GET /jeecgboot/personnel/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页大小，默认10 |
| name | string | 否 | 姓名（模糊查询） |
| role | string | 否 | 角色 |
| status | string | 否 | 状态 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "records": [
      {
        "id": "1",
        "name": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "role": "开发工程师",
        "skills": "Java,Vue,MySQL",
        "status": "1",
        "createTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

### 1.2 根据ID查询人员

**接口地址**: `GET /jeecgboot/personnel/queryById`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 人员ID |

### 1.3 新增人员

**接口地址**: `POST /jeecgboot/personnel/add`

**请求体**:

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "role": "开发工程师",
  "skills": "Java,Vue,MySQL",
  "status": "1"
}
```

### 1.4 编辑人员

**接口地址**: `PUT /jeecgboot/personnel/edit`

### 1.5 删除人员

**接口地址**: `DELETE /jeecgboot/personnel/delete`

### 1.6 批量删除人员

**接口地址**: `DELETE /jeecgboot/personnel/deleteBatch`

## 2. 项目管理模块 API

### 2.1 分页查询项目列表

**接口地址**: `GET /jeecgboot/project/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页大小，默认10 |
| appName | string | 否 | 应用名称（模糊查询） |
| appType | string | 否 | 应用类型 |
| status | string | 否 | 状态 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "records": [
      {
        "id": "1",
        "projectId": "PROJ001",
        "appName": "用户管理系统",
        "appCode": "user-management",
        "appType": "web",
        "gitUrl": "https://github.com/example/user-management.git",
        "developer": "张三",
        "tester": "李四",
        "status": "1",
        "description": "用户管理系统项目",
        "createTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

### 2.2 根据ID查询项目

**接口地址**: `GET /jeecgboot/project/queryById`

### 2.3 新增项目

**接口地址**: `POST /jeecgboot/project/add`

**请求体**:

```json
{
  "projectId": "PROJ001",
  "appName": "用户管理系统",
  "appCode": "user-management",
  "appType": "web",
  "gitUrl": "https://github.com/example/user-management.git",
  "developer": "张三",
  "tester": "李四",
  "status": "1",
  "description": "用户管理系统项目"
}
```

### 2.4 编辑项目

**接口地址**: `PUT /jeecgboot/project/edit`

### 2.5 删除项目

**接口地址**: `DELETE /jeecgboot/project/delete`

### 2.6 批量删除项目

**接口地址**: `DELETE /jeecgboot/project/deleteBatch`

### 2.7 根据项目ID查询关联应用

**接口地址**: `GET /jeecgboot/project/queryByProjectId`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |

## 3. 项目流水线模块 API

### 3.1 获取流水线配置

**接口地址**: `GET /jeecgboot/project/pipeline/config/get`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |

### 3.2 保存流水线配置

**接口地址**: `POST /jeecgboot/project/pipeline/config/save`

### 3.3 启用/禁用流水线

**接口地址**: `POST /jeecgboot/project/pipeline/config/toggle`

### 3.4 获取流水线状态

**接口地址**: `GET /jeecgboot/project/pipeline/status`

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "id": "1",
    "projectId": "PROJ001",
    "buildNumber": 123,
    "status": "SUCCESS",
    "branch": "main",
    "commitId": "abc123def456",
    "commitMessage": "修复用户登录问题",
    "author": "张三",
    "startTime": "2024-01-01 10:00:00",
    "endTime": "2024-01-01 10:15:00",
    "duration": 900,
    "currentStage": "deploy",
    "progress": 100
  }
}
```

### 3.5 获取构建历史

**接口地址**: `GET /jeecgboot/project/pipeline/history`

### 3.6 触发构建

**接口地址**: `POST /jeecgboot/project/pipeline/trigger`

### 3.7 取消构建

**接口地址**: `POST /jeecgboot/project/pipeline/cancel/{projectId}/{buildId}`

### 3.8 重试构建

**接口地址**: `POST /jeecgboot/project/pipeline/build/retry/{projectId}/{buildId}`

### 3.9 获取构建日志

**接口地址**: `GET /jeecgboot/project/pipeline/logs/{projectId}/{buildId}`

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "buildLogs": "开始构建...\n编译成功\n",
    "testLogs": "运行测试...\n所有测试通过\n",
    "deployLogs": "部署中...\n部署成功\n"
  }
}
```

### 3.10 删除构建记录

**接口地址**: `DELETE /jeecgboot/project/pipeline/build/delete/{projectId}/{buildId}`

### 3.11 批量删除构建记录

**接口地址**: `DELETE /jeecgboot/project/pipeline/build/batch-delete/{projectId}`

## 4. 物料管理模块 API

### 4.1 组件管理接口

#### 4.1.1 分页查询组件列表

**接口地址**: `GET /jeecgboot/material/component/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页大小，默认10 |
| name | string | 否 | 组件名称（模糊查询） |
| type | string | 否 | 组件类型 |
| status | string | 否 | 状态 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "records": [
      {
        "id": "1",
        "name": "BasicTable",
        "type": "table",
        "version": "1.0.0",
        "code": "<template>...</template>",
        "description": "基础表格组件",
        "status": "1",
        "createTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 30,
    "size": 10,
    "current": 1,
    "pages": 3
  }
}
```

#### 4.1.2 根据ID查询组件

**接口地址**: `GET /jeecgboot/material/component/queryById`

#### 4.1.3 新增组件

**接口地址**: `POST /jeecgboot/material/component/add`

**请求体**:

```json
{
  "name": "BasicTable",
  "type": "table",
  "version": "1.0.0",
  "code": "<template>...</template>",
  "description": "基础表格组件",
  "status": "1"
}
```

#### 4.1.4 编辑组件

**接口地址**: `PUT /jeecgboot/material/component/edit`

#### 4.1.5 删除组件

**接口地址**: `DELETE /jeecgboot/material/component/delete`

#### 4.1.6 批量删除组件

**接口地址**: `DELETE /jeecgboot/material/component/deleteBatch`

### 4.2 模板管理接口

#### 4.2.1 分页查询模板列表

**接口地址**: `GET /jeecgboot/material/template/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNo | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页大小，默认10 |
| name | string | 否 | 模板名称（模糊查询） |
| type | string | 否 | 模板类型 |
| status | string | 否 | 状态 |

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "result": {
    "records": [
      {
        "id": "1",
        "name": "用户管理页面",
        "type": "page",
        "version": "1.0.0",
        "content": "<template>...</template>",
        "description": "用户管理页面模板",
        "status": "1",
        "createTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 20,
    "size": 10,
    "current": 1,
    "pages": 2
  }
}
```

#### 4.2.2 根据ID查询模板

**接口地址**: `GET /jeecgboot/material/template/queryById`

#### 4.2.3 新增模板

**接口地址**: `POST /jeecgboot/material/template/add`

**请求体**:

```json
{
  "name": "用户管理页面",
  "type": "page",
  "version": "1.0.0",
  "content": "<template>...</template>",
  "description": "用户管理页面模板",
  "status": "1"
}
```

#### 4.2.4 编辑模板

**接口地址**: `PUT /jeecgboot/material/template/edit`

#### 4.2.5 删除模板

**接口地址**: `DELETE /jeecgboot/material/template/delete`

#### 4.2.6 批量删除模板

**接口地址**: `DELETE /jeecgboot/material/template/deleteBatch`

## 5. 错误处理

### 5.1 常见错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 400 | 请求参数错误 | 请求参数格式不正确或缺少必填参数 |
| 401 | 未授权 | 用户未登录或Token已过期 |
| 403 | 禁止访问 | 用户无权限访问该资源 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器内部错误 | 服务器处理请求时发生错误 |

### 5.2 错误响应示例

```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误：缺少必填参数 name",
  "result": null,
  "timestamp": 1640995200000
}
```

## 6. 认证授权

### 6.1 登录获取Token

**接口地址**: `POST /jeecgboot/sys/login`

**请求体**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**:

```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "1",
      "username": "admin",
      "realname": "管理员"
    }
  }
}
```

### 6.2 请求头设置

所有需要认证的接口都需要在请求头中携带Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 7. 分页参数说明

所有分页接口都支持以下通用参数：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| pageNo | integer | 否 | 1 | 当前页码 |
| pageSize | integer | 否 | 10 | 每页记录数 |

分页响应格式：

```json
{
  "records": [],      // 当前页数据
  "total": 100,       // 总记录数
  "size": 10,         // 每页大小
  "current": 1,       // 当前页码
  "pages": 10         // 总页数
}
```

## 8. 接口测试

### 8.1 Swagger UI

访问 `http://localhost:8080/swagger-ui/index.html` 可以在线测试所有接口。

### 8.2 Postman 集合

项目提供了 Postman 集合文件，可以导入 Postman 进行接口测试。

## 9. 版本更新记录

| 版本 | 更新日期 | 更新内容 |
|------|----------|----------|
| v1.0 | 2024-01-27 | 初始版本，包含人员管理、项目管理、流水线管理、物料管理四个模块的完整API |

---

**注意**: 本文档会随着系统功能的更新而持续维护，请关注最新版本。