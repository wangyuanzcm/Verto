# Verto API服务端

## 项目简介

Verto API服务端是一个基于Spring Boot 3.x开发的后端接口服务，专门为 `jeecgboot-vue3` 前端项目提供完整的API支持。

## 主要功能

- **用户认证模块**：用户登录、注册、JWT认证、验证码验证
- **系统管理模块**：用户管理、角色管理、权限管理
- **员工管理模块**：员工信息CRUD、部门管理、职位管理
- **安全认证**：基于JWT的无状态认证，Spring Security安全框架
- **数据缓存**：Redis缓存支持，提升系统性能
- **接口文档**：集成Swagger3，提供完整的API文档

## 技术栈

- **框架**：Spring Boot 3.5.5
- **数据库**：MySQL 8.0+
- **缓存**：Redis
- **ORM**：MyBatis Plus 3.5.12
- **连接池**：Druid
- **安全**：Spring Security + JWT
- **文档**：Swagger3 (Knife4j)
- **工具**：Hutool、FastJSON

## 项目结构

```
src/main/java/com/verto/staffmanagement/
├── config/          # 配置类
├── controller/      # 控制器层
├── dto/            # 数据传输对象
├── entity/         # 实体类
├── mapper/         # 数据访问层
├── security/       # 安全相关
├── service/        # 业务逻辑层
├── util/           # 工具类
└── vo/             # 视图对象
```

## 快速开始

### 环境要求

- JDK 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd staff-management
   ```

2. **创建数据库**
   ```sql
   -- 执行 src/main/resources/db/init.sql 脚本
   CREATE DATABASE verto_api DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **配置数据库连接**
   
   修改 `application-dev.yml` 中的数据库配置：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://127.0.0.1:3306/verto_api
       username: root
       password: your_password
   ```

4. **配置Redis连接**
   
   修改 `application-dev.yml` 中的Redis配置：
   ```yaml
   spring:
     redis:
       host: 127.0.0.1
       port: 6379
       password: your_redis_password
   ```

5. **启动项目**
   ```bash
   mvn spring-boot:run
   ```

### 访问地址

- **API接口**：http://localhost:8080/verto-api
- **接口文档**：http://localhost:8080/verto-api/doc.html
- **数据库监控**：http://localhost:8080/verto-api/druid/

## API接口说明

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/captcha` - 获取验证码

### 用户管理
- `GET /api/users` - 用户列表（分页）
- `GET /api/users/{id}` - 用户详情
- `POST /api/users` - 新增用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 角色管理
- `GET /api/roles` - 角色列表
- `POST /api/roles` - 新增角色
- `PUT /api/roles/{id}` - 更新角色
- `DELETE /api/roles/{id}` - 删除角色

### 权限管理
- `GET /api/permissions` - 权限列表
- `GET /api/permissions/tree` - 权限树
- `POST /api/permissions` - 新增权限
- `PUT /api/permissions/{id}` - 更新权限

### 员工管理
- `GET /api/staff` - 员工列表（分页）
- `GET /api/staff/{id}` - 员工详情
- `POST /api/staff` - 新增员工
- `PUT /api/staff/{id}` - 更新员工
- `DELETE /api/staff/{id}` - 删除员工

## 配置说明

### 应用配置
```yaml
app:
  jwt:
    secret: your-jwt-secret-key
    expiration: 86400000  # 24小时
  captcha:
    enabled: true
    length: 4
    expire: 300  # 5分钟
```

### 数据库配置
- 支持MySQL 8.0+
- 使用Druid连接池
- 自动建表和数据初始化

### 缓存配置
- Redis缓存支持
- 自动序列化配置
- 缓存过期时间配置

## 开发指南

### 代码规范
- 使用统一的代码格式化配置
- 遵循阿里巴巴Java开发手册
- 所有公共方法必须添加注释

### 数据库设计
- 统一使用逻辑删除
- 自动填充创建时间和更新时间
- 主键使用雪花算法生成

### 安全设计
- JWT无状态认证
- 密码BCrypt加密
- 接口权限控制

## 部署说明

### Docker部署
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/verto-api-server-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### 生产环境配置
- 使用环境变量配置敏感信息
- 启用SSL证书
- 配置日志轮转

## 许可证

本项目采用 Apache 2.0 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

- 作者：Verto
- 邮箱：verto@example.com
- GitHub：https://github.com/verto