
# Verto 项目管理平台

## 项目简介

Verto 是一个基于 JeecgBoot 框架开发的企业级项目管理平台，提供完整的项目生命周期管理功能。系统采用前后端分离架构，后端基于 Spring Boot + MyBatis-Plus，前端基于 Vue 3 + Vite + Ant Design Vue。

## 技术栈

### 后端技术栈
- **框架**: Spring Boot 2.4.5
- **数据库**: MySQL 8.0
- **缓存**: Redis 6.0
- **ORM**: MyBatis-Plus 3.4.3
- **安全**: Spring Security + JWT
- **文档**: Swagger 3.0
- **构建工具**: Maven 3.6+

### 前端技术栈
- **框架**: Vue 3.2+
- **构建工具**: Vite 4.0+
- **UI组件**: Ant Design Vue 3.0+
- **状态管理**: Pinia
- **路由**: Vue Router 4.0+
- **HTTP客户端**: Axios
- **包管理器**: pnpm

## 功能模块

### 1. 人员管理模块 (Personnel)
- **功能描述**: 管理项目团队成员信息
- **主要功能**:
  - 人员信息的增删改查
  - 人员角色管理
  - 人员技能标签管理
  - 人员状态管理（在职/离职）
- **API接口**: `/jeecgboot/personnel/*`

### 2. 项目管理模块 (Project)
- **功能描述**: 管理项目基本信息和应用配置
- **主要功能**:
  - 项目信息的增删改查
  - 应用配置管理
  - 项目状态跟踪
  - Git仓库关联
  - 项目成员分配
- **API接口**: `/jeecgboot/project/*`

### 3. 项目流水线模块 (ProjectPipeline)
- **功能描述**: 管理项目的CI/CD流水线
- **主要功能**:
  - 流水线配置管理
  - 构建历史记录
  - 构建状态监控
  - 构建日志查看
  - 流水线触发和取消
  - 阶段重试和跳过
- **API接口**: `/jeecgboot/project/pipeline/*`

### 4. 物料管理模块 (Material)
- **功能描述**: 管理项目开发中的组件和模板资源
- **主要功能**:
  - **组件管理**: 
    - 基础组件库管理
    - 组件版本控制
    - 组件代码管理
    - 组件状态管理
  - **模板管理**:
    - 页面模板管理
    - 模板内容管理
    - 模板版本控制
    - 模板状态管理
- **API接口**: `/jeecgboot/material/component/*` 和 `/jeecgboot/material/template/*`

## 环境要求

### 系统要求
- **操作系统**: Windows 10/11 + WSL2
- **Java**: JDK 1.8+
- **Node.js**: 16.0+
- **Docker**: 20.0+
- **Docker Compose**: 1.29+

### 数据库要求
- **MySQL**: 8.0+
- **Redis**: 6.0+

## 快速启动

### 1. 环境准备

#### 1.1 启动 Docker 服务
确保 Docker Desktop 已安装并启动，然后在 WSL 中执行：

```bash
# 检查 Docker 是否正常运行
docker --version
docker-compose --version
```

#### 1.2 启动数据库服务
项目根目录下已配置 Docker Compose，执行以下命令启动 MySQL 和 Redis：

```bash
# 在项目根目录下执行
docker-compose up -d
```

服务信息：
- **MySQL**: 
  - 端口: 3306
  - 用户名: root
  - 密码: root
  - 数据库: verto
- **Redis**: 
  - 端口: 6379
  - 密码: 123456

### 2. 后端启动

#### 2.1 进入后端目录
```bash
cd verto-backend
```

#### 2.2 安装依赖并启动
```bash
# 安装 Maven 依赖
mvn clean install

# 启动后端服务
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

#### 2.3 访问接口文档
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- API文档: `http://localhost:8080/v3/api-docs`

### 3. 前端启动

#### 3.1 进入前端目录
```bash
cd jeecgboot-vue3
```

#### 3.2 安装依赖
```bash
# 使用 pnpm 安装依赖
pnpm install
```

#### 3.3 启动开发服务器
```bash
# 启动前端开发服务器
pnpm dev
```

前端服务将在 `http://localhost:3000` 启动

### 4. 访问系统

打开浏览器访问: `http://localhost:3000`

默认登录账号:
- 用户名: admin
- 密码: 123456

## 项目结构

```
Verto/
├── verto-backend/                 # 后端项目
│   ├── src/main/java/com/verto/
│   │   ├── modules/
│   │   │   ├── personnel/         # 人员管理模块
│   │   │   ├── project/           # 项目管理模块
│   │   │   ├── pipeline/          # 流水线管理模块
│   │   │   └── material/          # 物料管理模块
│   │   └── common/                # 公共模块
│   └── src/main/resources/        # 配置文件
├── jeecgboot-vue3/               # 前端项目
│   ├── src/
│   │   ├── views/                # 页面组件
│   │   ├── components/           # 公共组件
│   │   ├── api/                  # API接口
│   │   └── mock/                 # Mock数据
├── docker-compose.yml            # Docker编排文件
└── README.md                     # 项目说明文档
```

## 开发指南

### 代码规范
- 后端代码遵循阿里巴巴Java开发手册
- 前端代码遵循Vue 3官方风格指南
- 所有代码必须包含中文注释
- 提交代码前请确保通过ESLint检查

### 数据库设计
- 所有表必须包含 `id`、`create_by`、`create_time`、`update_by`、`update_time` 字段
- 使用逻辑删除，添加 `del_flag` 字段
- 字段命名采用下划线命名法

### API设计
- RESTful API设计风格
- 统一返回格式使用 `Result<T>` 封装
- 所有接口必须添加Swagger注解

## 常见问题

### 1. 数据库连接失败
- 检查Docker服务是否正常启动
- 确认MySQL容器是否正在运行: `docker ps`
- 检查数据库配置是否正确

### 2. 前端启动失败
- 确认Node.js版本是否符合要求
- 清除node_modules重新安装: `rm -rf node_modules && pnpm install`
- 检查端口是否被占用

### 3. 跨域问题
- 开发环境已配置代理，生产环境需要配置Nginx

## 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 提交Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者: Verto Team
- 邮箱: support@verto.com
- 项目地址: https://github.com/verto/verto-platform

---

**注意**: 本项目基于 JeecgBoot 框架开发，感谢 JeecgBoot 团队的优秀工作！

适用项目
-----------------------------------

|下载    | JDK17 + SpringBoot3.3 + Shiro                     |JDK17 + SpringBoot3.3+ SpringAuthorizationServer   | JDK17/JDK8 + SpringBoot2.7 |
|------|----------------------------------------------------|--------------------------------------------|--------------------------------------------|
| Github |  [`springboot3`](https://github.com/jeecgboot/JeecgBoot/tree/springboot3)  | [`springboot3_sas`](https://github.com/jeecgboot/JeecgBoot/tree/springboot3_sas) 分支 |[`master`](https://github.com/jeecgboot/JeecgBoot) 分支|
| Gitee |  [`springboot3`](https://gitee.com/jeecg/JeecgBoot/tree/springboot3/)      | [`springboot3_sas`](https://gitee.com/jeecg/JeecgBoot/tree/springboot3_sas) 分支 |[`master`](https://gitee.com/jeecg/JeecgBoot)     分支 |


- `jeecg-boot` 是后端JAVA源码项目Springboot3+SpringCloudAlibaba（支持单体和微服务切换）.
- `jeecgboot-vue3` 是前端VUE3源码项目（vue3+vite6+ts最新技术栈）.
- `JeecgUniapp`  是[配套APP框架](https://github.com/jeecgboot/JeecgUniapp) 适配多个终端，支持APP、小程序、H5、鸿蒙、鸿蒙Next.
- 参考 [文档](https://help.jeecg.com/ui/2dev/mini) 可以删除不需要的demo，制作一个精简版本





启动项目
-----------------------------------

> 默认账号密码： admin/123456

- [开发环境搭建](https://help.jeecg.com/java/setup/tools)
- [IDEA启动前后端(单体模式)](https://help.jeecg.com/java/setup/idea/startup)
- [Docker一键启动(单体模式)](https://help.jeecg.com/java/docker/quick)
- [IDEA启动前后端(微服务方式)](https://help.jeecg.com/java/springcloud/switchcloud/monomer)
- [Docker一键启动(微服务方式)](https://help.jeecg.com/java/docker/quickcloud)


技术文档
-----------------------------------

- 官方网站：  [http://www.jeecg.com](http://www.jeecg.com)
- 在线演示：  [平台演示](https://boot3.jeecg.com) | [APP演示](https://jeecg.com/appIndex)
- 入门指南：  [快速入门](http://www.jeecg.com/doc/quickstart)  | [代码生成使用](https://help.jeecg.com/java/codegen/online) | [开发文档](https://help.jeecg.com)  | [AI应用手册](https://help.jeecg.com/aigc) | [视频教程](http://jeecg.com/doc/video)
- 技术支持：  [反馈问题](https://github.com/jeecgboot/JeecgBoot/issues/new?template=bug_report.md)    | [低代码体验一分钟](https://jeecg.blog.csdn.net/article/details/106079007) 
- QQ交流群 ： 964611995、⑩716488839(满)、⑨808791225(满)、其他(满)


AI 应用平台介绍
-----------------------------------

一个全栈式 AI 开发平台，旨在帮助开发者快速构建和部署个性化的 AI 应用。

JeecgBoot平台提供了一套完善的AI应用管理系统模块，是一套类似`Dify`的`AIGC应用开发平台`+`知识库问答`，是一款基于LLM大语言模型AI应用平台和 RAG 的知识库问答系统。
其直观的界面结合了 AI 流程编排、RAG 管道、知识库管理、模型管理、对接向量库、实时运行可观察等，让您可以快速从原型到生产，拥有AI服务能力。 

- [详细专题介绍，请点击查看](README-AI.md)

- AI视频介绍

[![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/jeecg_aivideo.png)](https://www.bilibili.com/video/BV1zmd7YFE4w)


为什么选择JeecgBoot?
-----------------------------------
- 1.采用最新主流前后分离框架（Spring Boot3 + MyBatis + Ant Design4 + Vue3），容易上手；代码生成器依赖性低，灵活的扩展能力，可快速实现二次开发。
- 2.前端大版本换代，最新版采用 Vue3.0 + TypeScript + Vite6 + Ant Design Vue4 等新技术方案。
- 3.支持微服务Spring Cloud Alibaba（Nacos、Gateway、Sentinel、Skywalking），提供简易机制，支持单体和微服务自由切换（这样可以满足各类项目需求）。
- 4.开发效率高，支持在线建表和AI建表，提供强大代码生成器，单表、树列表、一对多、一对一等数据模型，增删改查功能一键生成，菜单配置直接使用。
- 5.代码生成器提供强大模板机制，支持自定义模板，目前提供四套风格模板（单表两套、树模型一套、一对多三套）。
- 6.提供强大的报表和大屏可视化工具，支持丰富的数据源连接，能够通过拖拉拽方式快速制作报表、大屏和门户设计；支持多种图表类型：柱形图、折线图、散点图、饼图、环形图、面积图、漏斗图、进度图、仪表盘、雷达图、地图等。
- 7.低代码能力：在线表单（无需编码，通过在线配置表单，实现表单的增删改查，支持单表、树、一对多、一对一等模型，实现人人皆可编码），在线配置零代码开发、所见即所得支持23种类控件。
- 8.低代码能力：在线报表、在线图表（无需编码，通过在线配置方式，实现数据报表和图形报表，可以快速抽取数据，减轻开发压力，实现人人皆可编码）。
- 9.Online支持在线增强开发，提供在线代码编辑器，支持代码高亮、代码提示等功能，支持多种语言（Java、SQL、JavaScript等）。
- 10.封装完善的用户、角色、菜单、组织机构、数据字典、在线定时任务等基础功能，支持访问授权、按钮权限、数据权限等功能。
- 11.前端UI提供丰富的组件库，支持各种常用组件，如表格、树形控件、下拉框、日期选择器等，满足各种复杂的业务需求 [UI组件库文档](https://help.jeecg.com/category/ui%E7%BB%84%E4%BB%B6%E5%BA%93)。
- 12.提供APP配套框架，一份多代码多终端适配，一份代码多终端适配，小程序、H5、安卓、iOS、鸿蒙Next。
- 13.新版APP框架采用Uniapp、Vue3.0、Vite、Wot-design-uni、TypeScript等最新技术栈，包括二次封装组件、路由拦截、请求拦截等功能。实现了与JeecgBoot完美对接：目前已经实现登录、用户信息、通讯录、公告、移动首页、九宫格、聊天、Online表单、仪表盘等功能，提供了丰富的组件。
- 14.提供了一套成熟的AI应用平台功能，从AI模型、知识库到AI应用搭建，助力企业快速落地AI服务，加速智能化升级。
- 15.AI能力：目前JeecgBoot支持AI大模型chatgpt和deepseek，现在最新版默认使用deepseek，速度更快质量更高。目前提供了AI对话助手、AI知识库、AI应用、AI建表、AI报表等功能。
- 16.提供新行编辑表格JVXETable，轻松满足各种复杂ERP布局，拥有更高的性能、更灵活的扩展、更强大的功能。
- 17.平台首页风格，提供多种组合模式，支持自定义风格；支持门户设计，支持自定义首页。
- 18.常用共通封装，各种工具类（定时任务、短信接口、邮件发送、Excel导入导出等），基本满足80%项目需求。
- 19.简易Excel导入导出，支持单表导出和一对多表模式导出，生成的代码自带导入导出功能。
- 20.集成智能报表工具，报表打印、图像报表和数据导出非常方便，可极其方便地生成PDF、Excel、Word等报表。
- 21.采用前后分离技术，页面UI风格精美，针对常用组件做了封装：时间、行表格控件、截取显示控件、报表组件、编辑器等。
- 22.查询过滤器：查询功能自动生成，后台动态拼SQL追加查询条件；支持多种匹配方式（全匹配/模糊查询/包含查询/不匹配查询）。
- 23.数据权限（精细化数据权限控制，控制到行级、列表级、表单字段级，实现不同人看不同数据，不同人对同一个页面操作不同字段）。
- 24.接口安全机制，可细化控制接口授权，非常简便实现不同客户端只看自己数据等控制；也提供了基于AK和SK认证鉴权的OpenAPI功能。
- 25.活跃的社区支持；近年来，随着网络威胁的日益增加，团队在安全和漏洞管理方面积累了丰富的经验，能够为企业提供全面的安全解决方案。
- 26.权限控制采用RBAC（Role-Based Access Control，基于角色的访问控制）。
- 27.页面校验自动生成（必须输入、数字校验、金额校验、时间空间等）。
- 28.支持SaaS服务模式，提供SaaS多租户架构方案。
- 29.分布式文件服务，集成MinIO、阿里OSS等优秀的第三方，提供便捷的文件上传与管理，同时也支持本地存储。
- 30.主流数据库兼容，一套代码完全兼容MySQL、PostgreSQL、Oracle、SQL Server、MariaDB、达梦、人大金仓等主流数据库。
- 31.集成工作流Flowable，并实现了只需在页面配置流程转向，可极大简化BPM工作流的开发；用BPM的流程设计器画出了流程走向，一个工作流基本就完成了，只需写很少量的Java代码。
- 32.低代码能力：在线流程设计，采用开源Flowable流程引擎，实现在线画流程、自定义表单、表单挂靠、业务流转。
- 33.多数据源：极其简易的使用方式，在线配置数据源配置，便捷地从其他数据抓取数据。
- 34.提供单点登录CAS集成方案，项目中已经提供完善的对接代码。
- 35.低代码能力：表单设计器，支持用户自定义表单布局，支持单表、一对多表单，支持select、radio、checkbox、textarea、date、popup、列表、宏等控件。
- 36.专业接口对接机制，统一采用RESTful接口方式，集成Swagger-UI在线接口文档，JWT token安全验证，方便客户端对接。
- 37.高级组合查询功能，在线配置支持主子表关联查询，可保存查询历史。
- 38.提供各种系统监控，实时跟踪系统运行情况（监控Redis、Tomcat、JVM、服务器信息、请求追踪、SQL监控）。
- 39.消息中心（支持短信、邮件、微信推送等）；集成WebSocket消息通知机制。
- 40.支持多语言，提供国际化方案。
- 41.数据变更记录日志，可记录数据每次变更内容，通过版本对比功能查看历史变化。
- 42.提供简单易用的打印插件，支持谷歌、火狐、IE11+等各种浏览器。
- 43.后端采用Maven分模块开发方式；前端支持菜单动态路由。
- 44.提供丰富的示例代码，涵盖了常用的业务场景，便于学习和参考。



技术架构：
-----------------------------------

#### 前端

- 前端环境要求：Node.js要求`Node 20+` 版本以上、pnpm 要求`9+` 版本以上
- 依赖管理：node、npm、pnpm
- 前端IDE建议：IDEA、WebStorm、Vscode
- 采用 Vue3.0+TypeScript+Vite6+Ant-Design-Vue4等新技术方案，包括二次封装组件、utils、hooks、动态菜单、权限校验、按钮级别权限控制等功能
- 最新技术栈：Vue3.0 + TypeScript + Vite6 + ant-design-vue4 + pinia + echarts + unocss + vxe-table + qiankun + es6


#### 后端

- IDE建议： IDEA (必须安装lombok插件 )
- 语言：Java 默认jdk17(jdk21)
- 依赖管理：Maven
- 基础框架：Spring Boot 3.5.5
- 微服务框架： Spring Cloud Alibaba 2023.0.3.3
- 持久层框架：MybatisPlus 3.5.12
- 报表工具： JimuReport 2.1.3
- 安全框架：Apache Shiro 2.0.4，Jwt 4.5.0
- 微服务技术栈：Spring Cloud Alibaba、Nacos、Gateway、Sentinel、Skywalking
- 数据库连接池：阿里巴巴Druid 1.2.24
- AI大模型：支持 `ChatGPT` `DeepSeek` `千问`等各种常规模式
- 日志打印：logback
- 缓存：Redis
- 其他：autopoi, fastjson，poi，Swagger-ui，quartz, lombok（简化代码）等。
- 默认提供MySQL5.7+数据库脚本

#### 数据库支持

> jeecgboot平台支持以下数据库，默认我们只提供mysql脚本，其他数据库可以参考[转库文档](https://my.oschina.net/jeecg/blog/4905722)自己转。

|  数据库   |  支持   |
| --- | --- |
|   MySQL   |  √   |
|  Oracle11g   |  √   |
|  Sqlserver2017   |  √   |
|   PostgreSQL   |  √   |
|   MariaDB   |  √   |
|   达梦   |  √   |
|   人大金仓   |  √   |
|   TiDB     |  √   |
|   kingbase8   |  √   |



 
## 微服务解决方案

- 1、服务注册和发现 Nacos √
- 2、统一配置中心 Nacos  √
- 3、路由网关 gateway(三种加载方式) √
- 4、分布式 http feign √
- 5、熔断降级限流 Sentinel √
- 6、分布式文件 Minio、阿里OSS √ 
- 7、统一权限控制 JWT + Shiro √
- 8、服务监控 SpringBootAdmin√
- 9、链路跟踪 Skywalking   [参考文档](https://help.jeecg.com/java/springcloud/super/skywarking)
- 10、消息中间件 RabbitMQ  √
- 11、分布式任务 xxl-job  √ 
- 12、分布式事务 Seata
- 13、轻量分布式日志 Loki+grafana套件
- 14、支持 docker-compose、k8s、jenkins
- 15、CAS 单点登录   √
- 16、路由限流   √

#### 微服务架构图
![微服务架构图](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/jeecgboot_springcloud2022.png "在这里输入图片标题")





开源版与企业版区别?
-----------------------------------

 - JeecgBoot开源版采用 [Apache-2.0 license](LICENSE) 协议附加补充条款：允许商用使用，不会造成侵权行为，允许基于本平台软件开展业务系统开发（但在任何情况下，您不得使用本软件开发可能被认为与本软件竞争的软件).
 - 商业版与开源版主要区别在于商业版提供了技术支持 和 更多的企业级功能(例如：Online图表、流程监控、流程设计、流程审批、表单设计器、表单视图、积木报表企业版、OA办公、商业APP、零代码应用、Online模块源码等功能). [更多商业功能介绍，点击查看](README-Enterprise.md)
 - JeecgBoot未来发展方向是：零代码平台的建设，也就是团队的另外一款产品 [敲敲云零代码](https://www.qiaoqiaoyun.com) ，无需编码即可通过拖拽快速搭建企业级应用，与JeecgBoot低代码平台形成互补，满足从简单业务到复杂系统的全场景开发需求，目前已经开源，[欢迎下载](https://qiaoqiaoyun.com/downloadCode)






### Jeecg Boot 产品功能蓝图
![功能蓝图](https://jeecgos.oss-cn-beijing.aliyuncs.com/upload/test/Jeecg-Boot-lantu202005_1590912449914.jpg "在这里输入图片标题")



####  系统功能架构图

![](https://oscimg.oschina.net/oscnet/up-1569487b95a07dbc3599fb1349a2e3aaae1.png)



### 开源版功能清单
```
├─系统管理
│  ├─用户管理
│  ├─角色管理
│  ├─菜单管理
│  ├─首页配置
│  ├─权限设置（支持按钮权限、数据权限）
│  ├─表单权限（控制字段禁用、隐藏）
│  ├─部门管理
│  ├─我的部门（二级管理员）
│  └─字典管理
│  └─分类字典
│  └─系统公告
│  └─职务管理
│  └─通讯录
│  ├─多数据源管理
│  ├─白名单管理
│  ├─第三方配置（对接钉钉和企业微信）
│  └─多租户管理（租户管理、租户角色、我的租户、租户默认套餐管理）
├─Online在线开发(低代码)
│  ├─Online在线表单
│  ├─Online代码生成器
│  ├─Online在线报表
│  ├─仪表盘设计器
│  ├─系统编码规则
│  ├─系统校验规则
│  ├─APP版本管理
├─AI应用平台
│  ├─AI知识库问答系统
│  ├─AI大模型管理
│  ├─AI流程编排
│  ├─AI流程设计器
│  ├─AI对话支持图片
│  ├─AI对话助手(智能问答)
│  ├─AI建表（Online表单）
│  ├─AI聊天窗口支持嵌入第三方
│  ├─AI聊天窗口支持移动端
│  ├─支持常见大模型ChatGPT和DeepSeek、ollama等等
│  ├─AI OCR示例
├─数据可视化
│  ├─报表设计器(支持打印设计）
│  ├─大屏设和仪表盘设计
├─OpenAPI（基于AK和SK认证鉴权）
│  ├─接口管理
│  ├─接口授权
│  ├─接口文档
├─消息中心
│  ├─消息管理
│  ├─模板管理
├─代码生成器(低代码)
│  ├─代码生成器功能（一键生成前后端代码，生成后无需修改直接用，绝对是后端开发福音）
│  ├─代码生成器模板（提供4套模板，分别支持单表和一对多模型，不同风格选择）
│  ├─代码生成器模板（生成代码，自带excel导入导出）
│  ├─查询过滤器（查询逻辑无需编码，系统根据页面配置自动生成）
│  ├─高级查询器（弹窗自动组合查询条件）
│  ├─Excel导入导出工具集成（支持单表，一对多 导入导出）
│  ├─平台移动自适应支持
│  ├─提供新版uniapp3的代码生成器模板
├─系统监控
│  ├─Gateway路由网关
│  ├─基于AK和SK认证鉴权OpenAPI功能
│  ├─定时任务
│  ├─数据源管理
│  ├─性能扫描监控
│  │  ├─监控 Redis
│  │  ├─Tomcat
│  │  ├─jvm
│  │  ├─服务器信息
│  │  ├─请求追踪
│  │  ├─磁盘监控
│  ├─系统日志
│  ├─消息中心（支持短信、邮件、微信推送等等）
│  ├─数据日志（记录数据快照，可对比快照，查看数据变更情况）
│  ├─SQL监控
│  ├─在线用户
│─报表示例
│  ├─曲线图
│  └─饼状图
│  └─柱状图
│  └─折线图
│  └─面积图
│  └─雷达图
│  └─仪表图
│  └─进度条
│  └─排名列表
│  └─等等
│─大屏模板
│  ├─作战指挥中心大屏
│  └─物流服务中心大屏
│─常用示例
│  ├─自定义组件
│  ├─对象存储(对接阿里云)
│  ├─JVXETable示例（各种复杂ERP布局示例）
│  ├─单表模型例子
│  └─一对多模型例子
│  └─打印例子
│  └─一对多TAB例子
│  └─内嵌table例子
│  └─常用选择组件
│  └─异步树table
│  └─接口模拟测试
│  └─表格合计示例
│  └─异步树列表示例
│  └─一对多JEditable
│  └─JEditable组件示例
│  └─图片拖拽排序
│  └─图片翻页
│  └─图片预览
│  └─PDF预览
│  └─分屏功能
│─封装通用组件	
│  ├─行编辑表格JEditableTable
│  └─省略显示组件
│  └─时间控件
│  └─高级查询
│  └─用户选择组件
│  └─报表组件封装
│  └─字典组件
│  └─下拉多选组件
│  └─选人组件
│  └─选部门组件
│  └─通过部门选人组件
│  └─封装曲线、柱状图、饼状图、折线图等等报表的组件（经过封装，使用简单）
│  └─在线code编辑器
│  └─上传文件组件
│  └─验证码组件
│  └─树列表组件
│  └─表单禁用组件
│  └─等等
│─更多页面模板
│  ├─各种高级表单
│  ├─各种列表效果
│  └─结果页面
│  └─异常页面
│  └─个人页面
├─高级功能
│  ├─提供单点登录CAS集成方案
│  ├─提供APP发布方案
│  ├─集成Websocket消息通知机制
│  ├─支持electron桌面应用打包(支持windows、linux、macOS三大平台)
│  ├─docker容器支持
│  ├─提供移动APP框架及源码（Uniapp3版本）支持H5、小程序、APP、鸿蒙Next
│  ├─提供移动APP低代码设计(Online表单、仪表盘)
```



### 系统效果

##### PC端
![](https://oscimg.oschina.net/oscnet/up-000530d95df337b43089ac77e562494f454.png)

![输入图片说明](https://static.oschina.net/uploads/img/201904/14155402_AmlV.png "在这里输入图片标题")

![](https://oscimg.oschina.net/oscnet/up-9d6f36f251e71a0b515a01323474b03004c.png)

![输入图片说明](https://static.oschina.net/uploads/img/201904/14160813_KmXS.png "在这里输入图片标题")

![输入图片说明](https://static.oschina.net/uploads/img/201904/14160935_Nibs.png "在这里输入图片标题")

![输入图片说明](https://static.oschina.net/uploads/img/201904/14161004_bxQ4.png "在这里输入图片标题")

#####  系统交互
![](https://oscimg.oschina.net/oscnet/up-78b151fc888d4319377bf1cc311fe826871.png)

![](https://oscimg.oschina.net/oscnet/up-16c07e000278329b69b228ae3189814b8e9.png)


##### AI功能

AI聊天助手

![](https://oscimg.oschina.net/oscnet//65298d5710b4e6039a5f802b5f8505c5.png)

AI建表

![](https://oscimg.oschina.net/oscnet/up-381423599f219a67def45dfd9a99df8ef3f.png)

![](https://oscimg.oschina.net/oscnet/up-1508c2b0708c365605f68893044ee11f20d.png)

AI写文章

![](https://oscimg.oschina.net/oscnet/up-e3ee5b1fe497308805aa5e324b72994af79.png)


#####  仪表盘设计器

![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/darg20240726105556.png)

![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/drag20240724135626.png)

![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/drag20240724135619.png)

![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/drag20240724135630.png)

![](https://jeecgos.oss-cn-beijing.aliyuncs.com/files/drag20240726105547.png)

![](https://oscimg.oschina.net/oscnet/up-fad98d42b2cf92f92a903c9cff7579f18ec.png)


##### 报表设计器
![](https://oscimg.oschina.net/oscnet/up-64648de000851f15f6c7b9573d107ebb5f8.png)

![](https://oscimg.oschina.net/oscnet/up-fa52b44445db281c51d3f267dce7450d21b.gif)

![](https://oscimg.oschina.net/oscnet/up-68a19149d640f1646c8ed89ed4375e3326c.png)

![](https://oscimg.oschina.net/oscnet/up-f7e9cb2e3740f2d19ff63b40ec2dd554f96.png)


##### 手机端
![](https://oscimg.oschina.net/oscnet/da543c5d0d57baab0cecaa4670c8b68c521.jpg)
![](https://oscimg.oschina.net/oscnet/fda4bd82cab9d682de1c1fbf2060bf14fa6.jpg)

##### PAD端
![](https://oscimg.oschina.net/oscnet/e90fef970a8c33790ab03ffd6c4c7cec225.jpg)
![](https://oscimg.oschina.net/oscnet/d78218803a9e856a0aa82b45efc49849a0c.jpg)
![](https://oscimg.oschina.net/oscnet/59c23b230f52384e588ee16309b44fa20de.jpg)


##### 图表示例
![](https://oscimg.oschina.net/oscnet/up-218bc6a1669496b241ebb23506440c0083e.png)

![输入图片说明](https://static.oschina.net/uploads/img/201904/14160834_Lo23.png "在这里输入图片标题")
![输入图片说明](https://static.oschina.net/uploads/img/201904/14160842_QK7B.png "在这里输入图片标题")
![输入图片说明](https://static.oschina.net/uploads/img/201904/14160849_GBm5.png "在这里输入图片标题")
![输入图片说明](https://static.oschina.net/uploads/img/201904/14160858_6RAM.png "在这里输入图片标题")

##### 在线接口文档
![输入图片说明](https://static.oschina.net/uploads/img/201908/27095258_M2Xq.png "在这里输入图片标题")
![输入图片说明](https://static.oschina.net/uploads/img/201904/14160957_hN3X.png "在这里输入图片标题")


##### UNIAPP效果

![](https://oscimg.oschina.net/oscnet/up-aac943fbd26561879c57a41f7a406edf274.png)

![](https://oscimg.oschina.net/oscnet/up-9a44ba2e82b09c750629d12fafd7f60f553.png)


##### 大屏设计器
![](https://oscimg.oschina.net/oscnet/up-402a6034124474bfef8dfc5b4b2bac1ce5c.png)

![](https://oscimg.oschina.net/oscnet/up-6f7ba2e2ebbeea0d203db8d69fd87644c9f.png)

![](https://oscimg.oschina.net/oscnet/up-ee8d34f318da466b8a6070a6e3111d12ce7.png)

![](https://oscimg.oschina.net/oscnet/up-6b81781b43086819049c4421206810667c5.png)








## 捐赠 

如果觉得还不错，请作者喝杯咖啡吧 ☺

![](https://static.oschina.net/uploads/img/201903/08155608_0EFX.png)



创建gitlab和jenkins的docker容器
docker compose -f docker-compose-devops.yml --env-file .env.devops pull