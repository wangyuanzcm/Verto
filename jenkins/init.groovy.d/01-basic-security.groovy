/**
 * Jenkins 基础安全配置
 * 创建默认管理员用户并配置基本安全设置
 */

import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// 创建默认管理员用户
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

// 设置授权策略
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// 配置代理安全
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

// 保存配置
instance.save()

println "Jenkins 基础安全配置完成"
println "默认管理员用户: admin"
println "默认密码: admin123"
println "请在首次登录后修改密码"