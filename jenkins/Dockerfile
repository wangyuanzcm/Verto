# 基于官方Jenkins 2.276镜像
FROM jenkins/jenkins:2.276

# 切换到root用户安装软件
USER root

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    sudo \
    vim \
    git \
    maven \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 安装Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce-cli

# 安装pnpm
RUN npm install -g pnpm

# 将jenkins用户添加到docker组
RUN usermod -aG docker jenkins

# 切换回jenkins用户
USER jenkins

# 复制插件列表
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

# 安装Jenkins插件
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# 复制初始化脚本
COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/

# 设置Jenkins配置
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV JENKINS_OPTS="--httpPort=8081"