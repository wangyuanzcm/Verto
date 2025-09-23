/**
 * Jenkins 工具配置
 * 配置Maven、NodeJS、Git等构建工具
 */

import jenkins.model.*
import hudson.model.*
import hudson.tools.*
import hudson.util.DescribableList
import jenkins.plugins.nodejs.*
import hudson.plugins.git.*

def instance = Jenkins.getInstance()

// 配置Git
def gitInstallation = new GitTool("Default", "/usr/bin/git", [])
def gitDescriptor = instance.getDescriptor("hudson.plugins.git.GitTool")
gitDescriptor.setInstallations(gitInstallation)
gitDescriptor.save()

// 配置Maven
def mavenInstallation = new Maven.MavenInstallation("Maven-3.8", "/usr/share/maven", [])
def mavenDescriptor = instance.getDescriptor("hudson.tasks.Maven")
mavenDescriptor.setInstallations(mavenInstallation)
mavenDescriptor.save()

// 配置NodeJS
def nodeJSInstallation = new NodeJSInstallation("NodeJS-18", "/usr/bin/node", [])
def nodeJSDescriptor = instance.getDescriptor("jenkins.plugins.nodejs.tools.NodeJSInstallation")
if (nodeJSDescriptor != null) {
    nodeJSDescriptor.setInstallations(nodeJSInstallation)
    nodeJSDescriptor.save()
}

// 保存配置
instance.save()

println "Jenkins 工具配置完成"
println "已配置: Git, Maven, NodeJS"