# Jenkins Pipeline 配置示例

## 📋 Verto项目Pipeline配置

### 1. 基础Pipeline脚本

```groovy
pipeline {
    agent any
    
    environment {
        // 定义环境变量
        NODEJS_HOME = tool 'NodeJS'
        MAVEN_HOME = tool 'Maven'
        PATH = "${NODEJS_HOME}/bin:${MAVEN_HOME}/bin:${env.PATH}"
        
        // 项目相关变量
        FRONTEND_DIR = 'jeecgboot-vue3'
        BACKEND_DIR = 'jeecg-boot'
        DOCKER_REGISTRY = 'localhost:5000'
        APP_NAME = 'verto'
    }
    
    stages {
        stage('代码检出') {
            steps {
                echo '正在检出代码...'
                git branch: 'main', 
                    url: 'http://gitlab:8080/root/verto.git',
                    credentialsId: 'gitlab-credentials'
            }
        }
        
        stage('前端构建') {
            steps {
                echo '正在构建前端项目...'
                dir("${FRONTEND_DIR}") {
                    script {
                        // 安装依赖
                        sh 'pnpm install --frozen-lockfile'
                        
                        // 运行测试
                        sh 'pnpm test:unit'
                        
                        // 构建项目
                        sh 'pnpm build'
                        
                        // 归档构建产物
                        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                    }
                }
            }
        }
        
        stage('后端构建') {
            steps {
                echo '正在构建后端项目...'
                dir("${BACKEND_DIR}") {
                    script {
                        // 编译项目
                        sh 'mvn clean compile'
                        
                        // 运行测试
                        sh 'mvn test'
                        
                        // 打包项目
                        sh 'mvn clean package -DskipTests'
                        
                        // 归档JAR文件
                        archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
                    }
                }
            }
        }
        
        stage('代码质量检查') {
            parallel {
                stage('前端代码检查') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            sh 'pnpm lint'
                            sh 'pnpm type-check'
                        }
                    }
                }
                stage('后端代码检查') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            sh 'mvn checkstyle:check'
                            sh 'mvn pmd:check'
                        }
                    }
                }
            }
        }
        
        stage('Docker镜像构建') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // 构建前端镜像
                    def frontendImage = docker.build("${DOCKER_REGISTRY}/${APP_NAME}-frontend:${BUILD_NUMBER}", 
                                                   "-f ${FRONTEND_DIR}/Dockerfile ${FRONTEND_DIR}")
                    
                    // 构建后端镜像
                    def backendImage = docker.build("${DOCKER_REGISTRY}/${APP_NAME}-backend:${BUILD_NUMBER}", 
                                                   "-f ${BACKEND_DIR}/Dockerfile ${BACKEND_DIR}")
                    
                    // 推送镜像
                    docker.withRegistry("http://${DOCKER_REGISTRY}") {
                        frontendImage.push()
                        frontendImage.push("latest")
                        
                        backendImage.push()
                        backendImage.push("latest")
                    }
                }
            }
        }
        
        stage('部署到测试环境') {
            when {
                branch 'develop'
            }
            steps {
                echo '正在部署到测试环境...'
                script {
                    // 使用Docker Compose部署
                    sh '''
                        docker-compose -f docker-compose.test.yml down
                        docker-compose -f docker-compose.test.yml up -d
                    '''
                }
            }
        }
        
        stage('部署到生产环境') {
            when {
                branch 'main'
            }
            steps {
                echo '正在部署到生产环境...'
                input message: '确认部署到生产环境？', ok: '部署'
                script {
                    // 生产环境部署逻辑
                    sh '''
                        docker-compose -f docker-compose.prod.yml down
                        docker-compose -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '清理工作空间...'
            cleanWs()
        }
        success {
            echo '构建成功！'
            // 发送成功通知
            emailext (
                subject: "构建成功: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "构建成功完成。查看详情: ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo '构建失败！'
            // 发送失败通知
            emailext (
                subject: "构建失败: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "构建失败。查看详情: ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        unstable {
            echo '构建不稳定！'
        }
    }
}
```

### 2. 简化版Pipeline（适合开发环境）

```groovy
pipeline {
    agent any
    
    stages {
        stage('检出代码') {
            steps {
                git branch: 'main', url: 'http://gitlab:8080/root/verto.git'
            }
        }
        
        stage('前端构建') {
            steps {
                dir('jeecgboot-vue3') {
                    sh 'pnpm install'
                    sh 'pnpm build'
                }
            }
        }
        
        stage('后端构建') {
            steps {
                dir('jeecg-boot') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('部署') {
            steps {
                echo '部署完成'
            }
        }
    }
}
```

### 3. 多分支Pipeline配置

```groovy
pipeline {
    agent any
    
    stages {
        stage('检出代码') {
            steps {
                checkout scm
            }
        }
        
        stage('构建') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        echo '主分支构建'
                        // 生产环境构建逻辑
                    } else if (env.BRANCH_NAME == 'develop') {
                        echo '开发分支构建'
                        // 测试环境构建逻辑
                    } else {
                        echo '功能分支构建'
                        // 基础构建逻辑
                    }
                }
            }
        }
    }
}
```

## 🔧 Jenkins配置步骤

### 1. 创建Pipeline任务
1. 登录Jenkins：http://localhost:8081
2. 点击"新建任务"
3. 输入任务名称：`verto-pipeline`
4. 选择"Pipeline"
5. 点击"确定"

### 2. 配置Pipeline
1. 在"Pipeline"部分选择"Pipeline script from SCM"
2. SCM选择"Git"
3. Repository URL：`http://gitlab:8080/root/verto.git`
4. 添加凭据（GitLab用户名密码）
5. Script Path：`Jenkinsfile`

### 3. 配置Webhook
1. 在GitLab项目中进入"Settings" -> "Webhooks"
2. URL：`http://localhost:8081/project/verto-pipeline`
3. 选择触发事件：Push events, Merge request events
4. 点击"Add webhook"

### 4. 配置工具
在Jenkins中配置以下工具：
- **NodeJS**: Manage Jenkins -> Global Tool Configuration -> NodeJS
- **Maven**: Manage Jenkins -> Global Tool Configuration -> Maven
- **Git**: 通常已预装

## 📝 Jenkinsfile示例

在项目根目录创建 `Jenkinsfile`：

```groovy
@Library('shared-library') _

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'test', 'prod'],
            description: '选择部署环境'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: '跳过测试'
        )
    }
    
    stages {
        stage('准备') {
            steps {
                script {
                    env.BUILD_TIME = sh(script: 'date +%Y%m%d-%H%M%S', returnStdout: true).trim()
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
                echo "构建时间: ${env.BUILD_TIME}"
                echo "Git提交: ${env.GIT_COMMIT_SHORT}"
            }
        }
        
        stage('构建') {
            parallel {
                stage('前端') {
                    steps {
                        buildFrontend()
                    }
                }
                stage('后端') {
                    steps {
                        buildBackend()
                    }
                }
            }
        }
        
        stage('测试') {
            when {
                not { params.SKIP_TESTS }
            }
            steps {
                runTests()
            }
        }
        
        stage('部署') {
            steps {
                deployToEnvironment(params.ENVIRONMENT)
            }
        }
    }
}

def buildFrontend() {
    dir('jeecgboot-vue3') {
        sh 'pnpm install --frozen-lockfile'
        sh 'pnpm build'
    }
}

def buildBackend() {
    dir('jeecg-boot') {
        sh 'mvn clean package -DskipTests'
    }
}

def runTests() {
    parallel(
        "前端测试": {
            dir('jeecgboot-vue3') {
                sh 'pnpm test'
            }
        },
        "后端测试": {
            dir('jeecg-boot') {
                sh 'mvn test'
            }
        }
    )
}

def deployToEnvironment(env) {
    echo "部署到 ${env} 环境"
    // 部署逻辑
}
```

## 🔍 常用Pipeline片段

### 1. 条件执行
```groovy
stage('生产部署') {
    when {
        allOf {
            branch 'main'
            environment name: 'DEPLOY_ENV', value: 'production'
        }
    }
    steps {
        // 部署步骤
    }
}
```

### 2. 并行执行
```groovy
stage('并行构建') {
    parallel {
        stage('前端') {
            steps {
                // 前端构建
            }
        }
        stage('后端') {
            steps {
                // 后端构建
            }
        }
    }
}
```

### 3. 错误处理
```groovy
stage('构建') {
    steps {
        script {
            try {
                sh 'mvn clean package'
            } catch (Exception e) {
                currentBuild.result = 'FAILURE'
                error "构建失败: ${e.getMessage()}"
            }
        }
    }
}
```

### 4. 文件操作
```groovy
stage('文件处理') {
    steps {
        // 读取文件
        script {
            def content = readFile 'version.txt'
            env.VERSION = content.trim()
        }
        
        // 写入文件
        writeFile file: 'build-info.txt', text: "Build: ${BUILD_NUMBER}\nTime: ${BUILD_TIME}"
        
        // 归档文件
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
    }
}
```

## 📊 构建报告

### 1. 测试报告
```groovy
post {
    always {
        // 发布测试结果
        publishTestResults testResultsPattern: '**/target/surefire-reports/*.xml'
        
        // 发布覆盖率报告
        publishCoverage adapters: [jacocoAdapter('**/target/site/jacoco/jacoco.xml')]
    }
}
```

### 2. 代码质量报告
```groovy
stage('代码质量') {
    steps {
        // SonarQube分析
        withSonarQubeEnv('SonarQube') {
            sh 'mvn sonar:sonar'
        }
        
        // 等待质量门检查
        timeout(time: 10, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
        }
    }
}
```

---

## 💡 最佳实践

1. **使用参数化构建**：允许用户选择构建选项
2. **并行执行**：提高构建速度
3. **错误处理**：优雅处理构建失败
4. **通知机制**：及时通知构建结果
5. **归档产物**：保存重要的构建文件
6. **环境隔离**：不同环境使用不同配置

这些Pipeline示例可以根据您的具体需求进行调整和扩展。