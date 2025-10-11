/**
 * Git Hooks 安装脚本
 * 用于自动安装项目的git hooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 安装Git Hooks
 */
function installGitHooks() {
  try {
    console.log('开始安装Git Hooks...');
    
    // 获取项目根目录
    const projectRoot = process.cwd();
    const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
    const sourceHooksDir = path.join(projectRoot, 'build', 'git-hooks');
    
    // 检查.git目录是否存在
    if (!fs.existsSync(path.join(projectRoot, '.git'))) {
      console.error('错误: 当前目录不是Git仓库');
      process.exit(1);
    }
    
    // 确保hooks目录存在
    if (!fs.existsSync(gitHooksDir)) {
      fs.mkdirSync(gitHooksDir, { recursive: true });
    }
    
    // 要安装的hooks列表
    const hooks = ['pre-commit', 'post-commit'];
    
    hooks.forEach(hookName => {
      const sourceHook = path.join(sourceHooksDir, hookName);
      const targetHook = path.join(gitHooksDir, hookName);
      
      if (fs.existsSync(sourceHook)) {
        // 复制hook文件
        fs.copyFileSync(sourceHook, targetHook);
        
        // 在Windows上，需要确保文件可执行
        if (process.platform !== 'win32') {
          try {
            execSync(`chmod +x "${targetHook}"`);
          } catch (error) {
            console.warn(`警告: 无法设置${hookName}的执行权限:`, error.message);
          }
        }
        
        console.log(`✓ 已安装 ${hookName} hook`);
      } else {
        console.warn(`警告: 找不到源文件 ${sourceHook}`);
      }
    });
    
    // 创建配置文件示例
    const configExample = path.join(projectRoot, '.env.git-hooks.example');
    if (!fs.existsSync(configExample)) {
      const configContent = `# Git Hooks 配置示例
# 复制此文件为 .env.git-hooks 并根据需要修改配置

# Git信息上报API（可选）
GIT_REPORT_API=http://localhost:8080/api/git/report

# 提交后信息上报API（可选）
POST_COMMIT_REPORT_API=http://localhost:8080/api/git/post-commit

# 是否启用详细日志
GIT_HOOKS_VERBOSE=true
`;
      
      fs.writeFileSync(configExample, configContent);
      console.log('✓ 已创建配置文件示例: .env.git-hooks.example');
    }
    
    console.log('\nGit Hooks 安装完成！');
    console.log('提示:');
    console.log('1. 复制 .env.git-hooks.example 为 .env.git-hooks 并配置API地址');
    console.log('2. 现在每次提交代码时会自动收集git信息');
    console.log('3. 信息会保存到 dist/git-info.json 和 dist/post-commit-info.json');
    
  } catch (error) {
    console.error('安装Git Hooks失败:', error.message);
    process.exit(1);
  }
}

/**
 * 卸载Git Hooks
 */
function uninstallGitHooks() {
  try {
    console.log('开始卸载Git Hooks...');
    
    const projectRoot = process.cwd();
    const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
    
    const hooks = ['pre-commit', 'post-commit'];
    
    hooks.forEach(hookName => {
      const hookFile = path.join(gitHooksDir, hookName);
      if (fs.existsSync(hookFile)) {
        fs.unlinkSync(hookFile);
        console.log(`✓ 已卸载 ${hookName} hook`);
      }
    });
    
    console.log('Git Hooks 卸载完成！');
    
  } catch (error) {
    console.error('卸载Git Hooks失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
const command = process.argv[2];

switch (command) {
  case 'install':
    installGitHooks();
    break;
  case 'uninstall':
    uninstallGitHooks();
    break;
  default:
    console.log('用法:');
    console.log('  node install-hooks.js install   - 安装Git Hooks');
    console.log('  node install-hooks.js uninstall - 卸载Git Hooks');
    break;
}