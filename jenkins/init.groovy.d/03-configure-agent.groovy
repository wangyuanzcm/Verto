/**
 * Jenkins Agent 配置
 * 自动配置Docker Agent节点
 */

import jenkins.model.*
import hudson.model.*
import hudson.slaves.*
import hudson.slaves.JNLPLauncher
import hudson.slaves.DumbSlave
import hudson.slaves.CommandLauncher
import hudson.slaves.RetentionStrategy
import java.util.Arrays

def instance = Jenkins.getInstance()

// 检查是否已存在docker-agent节点
def existingNode = instance.getNode("docker-agent")
if (existingNode != null) {
    println "Docker agent节点已存在，跳过创建"
    return
}

// 创建Docker Agent节点
def agentName = "docker-agent"
def agentDescription = "Docker容器中的Jenkins Agent"
def agentRemoteFS = "/home/jenkins/agent"
def agentNumExecutors = 2
def agentMode = Node.Mode.NORMAL
def agentLabelString = "docker linux"

// 创建JNLP启动器
def launcher = new JNLPLauncher(true)

// 创建保留策略
def retentionStrategy = new RetentionStrategy.Always()

// 创建节点属性列表
def nodeProperties = new DescribableList<NodeProperty<?>, NodePropertyDescriptor>()

// 创建Agent节点
def agent = new DumbSlave(
    agentName,
    agentDescription,
    agentRemoteFS,
    agentNumExecutors.toString(),
    agentMode,
    agentLabelString,
    launcher,
    retentionStrategy,
    nodeProperties
)

// 添加节点到Jenkins
instance.addNode(agent)

// 获取Agent的连接密钥
def computer = agent.getComputer()
def jnlpMac = computer.getJnlpMac()

println "Jenkins Agent配置完成"
println "Agent名称: ${agentName}"
println "Agent密钥: ${jnlpMac}"
println "请将此密钥设置到JENKINS_AGENT_SECRET环境变量中"

// 保存配置
instance.save()