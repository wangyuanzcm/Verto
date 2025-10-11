import type { Plugin } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 依赖信息接口
 */
interface DependencyInfo {
  name: string;
  version: string;
  license?: string;
  description?: string;
  repository?: string;
  dependencies?: Record<string, string>;
}

/**
 * Git信息接口
 */
interface GitInfo {
  commitHash: string;
  branch: string;
  author: string;
  commitTime: string;
  commitMessage: string;
  remoteUrl?: string;
}

/**
 * 应用元数据接口
 */
interface AppMetadata {
  appId: string;
  timestamp: string;
  dependencies: DependencyInfo[];
  gitInfo: GitInfo;
  buildInfo: {
    buildTime: string;
    nodeVersion: string;
    npmVersion: string;
  };
}

/**
 * 获取Git信息
 */
function getGitInfo(): GitInfo | null {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const author = execSync('git log -1 --pretty=format:"%an <%ae>"', { encoding: 'utf8' }).trim();
    const commitTime = execSync('git log -1 --pretty=format:"%ci"', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
    
    let remoteUrl = '';
    try {
      remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    } catch (e) {
      // 忽略远程URL获取失败
    }

    return {
      commitHash,
      branch,
      author,
      commitTime,
      commitMessage,
      remoteUrl,
    };
  } catch (error) {
    console.warn('无法获取Git信息:', error);
    return null;
  }
}

/**
 * 解析依赖信息
 */
function parseDependencies(packageJsonPath: string): DependencyInfo[] {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies: DependencyInfo[] = [];

    // 处理生产依赖
    if (packageJson.dependencies) {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
        });
      });
    }

    // 处理开发依赖
    if (packageJson.devDependencies) {
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: version as string,
        });
      });
    }

    // 尝试获取更详细的依赖信息
    dependencies.forEach((dep) => {
      try {
        const depPackageJsonPath = path.join(process.cwd(), 'node_modules', dep.name, 'package.json');
        if (fs.existsSync(depPackageJsonPath)) {
          const depPackageJson = JSON.parse(fs.readFileSync(depPackageJsonPath, 'utf8'));
          dep.license = depPackageJson.license;
          dep.description = depPackageJson.description;
          dep.repository = depPackageJson.repository?.url || depPackageJson.repository;
          dep.dependencies = depPackageJson.dependencies;
        }
      } catch (e) {
        // 忽略单个依赖信息获取失败
      }
    });

    return dependencies;
  } catch (error) {
    console.error('解析package.json失败:', error);
    return [];
  }
}

/**
 * 上报元数据到后端
 */
async function reportMetadata(metadata: AppMetadata): Promise<void> {
  try {
    // 这里可以配置后端API地址
    const apiUrl = process.env.VITE_METADATA_REPORT_URL || 'http://localhost:8080/verto-backend/appmanage/metadata/report';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (response.ok) {
      console.log('✅ 元数据上报成功');
    } else {
      console.warn('⚠️ 元数据上报失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('⚠️ 元数据上报异常:', error);
  }
}

/**
 * 获取构建信息
 */
function getBuildInfo() {
  return {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: (() => {
      try {
        return execSync('npm --version', { encoding: 'utf8' }).trim();
      } catch {
        return 'unknown';
      }
    })(),
  };
}

/**
 * 元数据上报插件配置
 */
export interface MetadataReporterOptions {
  /** 应用ID */
  appId?: string;
  /** 是否启用上报 */
  enabled?: boolean;
  /** 后端API地址 */
  apiUrl?: string;
  /** 是否在开发模式下上报 */
  reportInDev?: boolean;
}

/**
 * 创建元数据上报插件
 */
export function createMetadataReporter(options: MetadataReporterOptions = {}): Plugin {
  const {
    appId = 'jeecgboot-vue3',
    enabled = true,
    reportInDev = false,
  } = options;

  return {
    name: 'metadata-reporter',
    apply: 'build', // 只在构建时应用
    
    async buildStart() {
      if (!enabled) return;

      console.log('🔍 开始收集应用元数据...');
      
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const dependencies = parseDependencies(packageJsonPath);
      const gitInfo = getGitInfo();
      const buildInfo = getBuildInfo();

      if (!gitInfo) {
        console.warn('⚠️ 无法获取Git信息，跳过元数据上报');
        return;
      }

      const metadata: AppMetadata = {
        appId,
        timestamp: new Date().toISOString(),
        dependencies,
        gitInfo,
        buildInfo,
      };

      console.log(`📊 收集到 ${dependencies.length} 个依赖项`);
      console.log(`📝 Git信息: ${gitInfo.branch}@${gitInfo.commitHash.substring(0, 8)}`);

      // 保存元数据到本地文件
      const metadataPath = path.join(process.cwd(), 'dist', 'metadata.json');
      try {
        // 确保dist目录存在
        const distDir = path.dirname(metadataPath);
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }
        
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log('💾 元数据已保存到:', metadataPath);
      } catch (error) {
        console.error('❌ 保存元数据失败:', error);
      }

      // 上报到后端
      await reportMetadata(metadata);
    },
  };
}