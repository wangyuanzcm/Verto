# Jenkins集成设计文档

## 1. 概述

本文档描述了如何将Verto平台的应用管理和项目管理与Jenkins CI/CD系统进行集成，实现自动化构建、测试和部署流水线。

## 2. 系统架构

### 2.1 当前系统结构
- **应用管理（AppManage）**: 管理应用的基本信息，包括Git仓库地址
- **项目管理（Project）**: 管理具体的项目实例，关联到应用
- **流水线管理（ProjectPipeline）**: 记录构建流水线的执行历史和状态

### 2.2 Jenkins集成架构
```
Verto平台 <---> Jenkins API <---> Jenkins服务器 (localhost:8803)
    |                                      |
    |-- 应用管理                            |-- Job管理
    |-- 项目管理                            |-- 构建执行
    |-- 流水线状态同步                       |-- 日志收集
```

## 3. 数据模型设计

### 3.1 新增实体类

#### 3.1.1 JenkinsJob（Jenkins任务配置）
```java
@Entity
@Table(name = "jenkins_job")
public class JenkinsJob {
    private String id;                    // 主键ID
    private String appId;                 // 关联应用ID
    private String projectId;             // 关联项目ID
    private String jobName;               // Jenkins任务名称
    private String jobUrl;                // Jenkins任务URL
    private String jobType;               // 任务类型：pipeline/freestyle
    private String gitUrl;                // Git仓库地址
    private String branch;                // 默认分支
    private String jenkinsfile;           // Jenkinsfile内容
    private String buildTrigger;          // 构建触发器：manual/webhook/schedule
    private String webhookToken;          // Webhook令牌
    private Integer status;               // 状态：0-禁用，1-启用
    private Date createTime;              // 创建时间
    private Date updateTime;              // 更新时间
}
```

#### 3.1.2 JenkinsConfig（Jenkins服务器配置）
```java
@Entity
@Table(name = "jenkins_config")
public class JenkinsConfig {
    private String id;                    // 主键ID
    private String serverName;            // 服务器名称
    private String serverUrl;             // Jenkins服务器地址
    private String username;              // 用户名
    private String apiToken;              // API Token
    private String description;           // 描述
    private Integer status;               // 状态：0-禁用，1-启用
    private Date createTime;              // 创建时间
    private Date updateTime;              // 更新时间
}
```

### 3.2 扩展现有实体

#### 3.2.1 ProjectPipeline扩展
```java
// 新增字段
private String jenkinsJobName;        // Jenkins任务名称
private String jenkinsBuildId;        // Jenkins构建ID
private String jenkinsUrl;            // Jenkins构建URL
private String triggerType;           // 触发类型：manual/webhook/schedule
private String triggerUser;           // 触发用户
```

## 4. 核心功能设计

### 4.1 Jenkins任务管理

#### 4.1.1 自动创建Jenkins任务
- **触发时机**: 创建新项目时自动创建对应的Jenkins任务
- **任务命名规则**: `{appName}-{projectId}-{branch}`
- **任务配置**: 
  - Git仓库地址从项目信息获取
  - 自动生成基础Jenkinsfile模板
  - 配置Webhook触发器

#### 4.1.2 Jenkins任务模板
```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = '${appName}'
        PROJECT_ID = '${projectId}'
        GIT_URL = '${gitUrl}'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: '${branch}', url: '${gitUrl}'
            }
        }
        
        stage('Build') {
            steps {
                script {
                    // 根据项目类型执行不同的构建命令
                    if (fileExists('package.json')) {
                        sh 'npm install'
                        sh 'npm run build'
                    } else if (fileExists('pom.xml')) {
                        sh 'mvn clean package'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    if (fileExists('package.json')) {
                        sh 'npm test'
                    } else if (fileExists('pom.xml')) {
                        sh 'mvn test'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // 部署逻辑
                echo 'Deploying application...'
            }
        }
    }
    
    post {
        always {
            // 通知Verto平台构建结果
            script {
                def buildResult = [
                    projectId: env.PROJECT_ID,
                    buildNumber: env.BUILD_NUMBER,
                    status: currentBuild.result ?: 'SUCCESS',
                    duration: currentBuild.duration,
                    startTime: new Date(currentBuild.startTimeInMillis),
                    endTime: new Date()
                ]
                
                httpRequest(
                    httpMode: 'POST',
                    url: 'http://localhost:8882/verto-backend/project/pipeline/webhook',
                    contentType: 'APPLICATION_JSON',
                    requestBody: groovy.json.JsonBuilder(buildResult).toString()
                )
            }
        }
    }
}
```

### 4.2 Jenkins API集成服务

#### 4.2.1 JenkinsApiService
```java
@Service
public class JenkinsApiService {
    
    /**
     * 创建Jenkins任务
     */
    public boolean createJob(String jobName, String jenkinsfile, String gitUrl);
    
    /**
     * 更新Jenkins任务配置
     */
    public boolean updateJob(String jobName, String jenkinsfile);
    
    /**
     * 删除Jenkins任务
     */
    public boolean deleteJob(String jobName);
    
    /**
     * 触发构建
     */
    public String triggerBuild(String jobName, Map<String, String> parameters);
    
    /**
     * 获取构建状态
     */
    public BuildStatus getBuildStatus(String jobName, String buildNumber);
    
    /**
     * 获取构建日志
     */
    public String getBuildLogs(String jobName, String buildNumber);
    
    /**
     * 获取任务列表
     */
    public List<JenkinsJobInfo> getJobList();
}
```

### 4.3 Webhook集成

#### 4.3.1 Jenkins构建结果回调
```java
@RestController
@RequestMapping("/project/pipeline")
public class PipelineWebhookController {
    
    @PostMapping("/webhook")
    public Result<String> handleJenkinsWebhook(@RequestBody JenkinsBuildResult result) {
        // 更新流水线状态
        ProjectPipeline pipeline = new ProjectPipeline();
        pipeline.setProjectId(result.getProjectId());
        pipeline.setBuildNumber(result.getBuildNumber());
        pipeline.setStatus(result.getStatus());
        pipeline.setDuration(result.getDuration());
        pipeline.setStartTime(result.getStartTime());
        pipeline.setEndTime(result.getEndTime());
        
        projectPipelineService.updateBuildResult(pipeline);
        
        return Result.ok("Webhook processed successfully");
    }
}
```

#### 4.3.2 Git Webhook集成
- 配置Git仓库Webhook，指向Jenkins
- Jenkins接收到Webhook后自动触发构建
- 构建完成后通过Webhook通知Verto平台

## 5. 前端集成设计

### 5.1 Jenkins任务管理界面
- **任务列表**: 显示所有Jenkins任务及其状态
- **任务配置**: 编辑Jenkinsfile、构建参数等
- **构建历史**: 显示构建历史记录
- **实时日志**: 实时显示构建日志

### 5.2 流水线状态同步
- **实时状态更新**: 通过WebSocket实时更新构建状态
- **构建进度显示**: 显示当前构建阶段和进度
- **日志查看**: 实时查看构建日志

## 6. 安全设计

### 6.1 Jenkins API认证
- 使用Jenkins API Token进行认证
- 配置专用的Jenkins用户，限制权限范围
- API Token加密存储

### 6.2 Webhook安全
- 使用Token验证Webhook请求的合法性
- 限制Webhook来源IP
- 请求签名验证

## 7. 部署配置

### 7.1 Jenkins插件要求
- **Pipeline Plugin**: 支持Pipeline任务
- **Git Plugin**: Git仓库集成
- **HTTP Request Plugin**: 发送HTTP请求
- **Build Authorization Token Root Plugin**: 支持Token触发构建

### 7.2 网络配置
- Jenkins服务器: `http://localhost:8803`
- Verto后端服务: `http://localhost:8882`
- 确保两个服务之间网络互通

## 8. 实施步骤

### 8.1 第一阶段：基础集成
1. 创建Jenkins配置管理功能
2. 实现Jenkins API服务
3. 创建基础的任务管理功能

### 8.2 第二阶段：自动化流程
1. 实现项目创建时自动创建Jenkins任务
2. 配置Git Webhook集成
3. 实现构建状态同步

### 8.3 第三阶段：高级功能
1. 实现实时日志查看
2. 添加构建参数配置
3. 支持多环境部署

## 9. 监控和日志

### 9.1 构建监控
- 构建成功率统计
- 构建时长分析
- 失败原因分析

### 9.2 系统日志
- Jenkins API调用日志
- Webhook接收日志
- 错误处理日志

## 10. 扩展性考虑

### 10.1 多Jenkins服务器支持
- 支持配置多个Jenkins服务器
- 负载均衡和故障转移

### 10.2 其他CI/CD工具集成
- GitLab CI/CD
- GitHub Actions
- Azure DevOps

这个设计文档为Jenkins集成提供了完整的技术方案，包括数据模型、API设计、安全考虑和实施步骤。可以根据实际需求进行调整和扩展。