import jenkins.model.*
import hudson.model.*
import hudson.slaves.*
import hudson.slaves.JNLPLauncher
import hudson.slaves.RetentionStrategy

// 获取Jenkins实例
def jenkins = Jenkins.getInstance()

// 检查是否已存在docker-agent节点
def existingNode = jenkins.getNode("docker-agent")
if (existingNode != null) {
    println "节点 'docker-agent' 已存在"
    
    // 获取现有节点的密钥
    def computer = existingNode.toComputer()
    if (computer instanceof hudson.slaves.SlaveComputer) {
        def jnlpMac = computer.getJnlpMac()
        println "Agent连接密钥: ${jnlpMac}"
        println "请将此密钥设置到 .env.devops 文件的 JENKINS_AGENT_SECRET 变量中"
    }
} else {
    println "创建新的 docker-agent 节点..."
    
    // 创建新的Agent节点
    def launcher = new JNLPLauncher(true)
    def retentionStrategy = new RetentionStrategy.Always()
    
    def slave = new DumbSlave(
        "docker-agent",                    // 节点名称
        "Docker容器中的Jenkins Agent",      // 描述
        "/home/jenkins/agent",             // 远程工作目录
        "2",                              // 执行器数量
        Node.Mode.NORMAL,                 // 使用模式
        "docker linux",                   // 标签
        launcher,                         // 启动器
        retentionStrategy,                // 保留策略
        []                               // 节点属性
    )
    
    // 添加节点到Jenkins
    jenkins.addNode(slave)
    jenkins.save()
    
    println "节点 'docker-agent' 创建成功"
    
    // 等待一下让节点初始化
    Thread.sleep(2000)
    
    // 获取密钥
    def computer = slave.toComputer()
    if (computer instanceof hudson.slaves.SlaveComputer) {
        def jnlpMac = computer.getJnlpMac()
        println "Agent连接密钥: ${jnlpMac}"
        println "请将此密钥设置到 .env.devops 文件的 JENKINS_AGENT_SECRET 变量中"
        
        // 输出连接命令
        println ""
        println "Agent连接命令:"
        println "java -jar agent.jar -url http://jenkins:8081/ -secret ${jnlpMac} -name docker-agent"
    }
}