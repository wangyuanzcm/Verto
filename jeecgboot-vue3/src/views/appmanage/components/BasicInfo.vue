<template>
  <div class="app-basic-info">
    <a-row :gutter="24">
      <!-- 应用基本信息 -->
      <a-col :span="24">
        <a-card title="应用信息" :bordered="false">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="应用名称">
              {{ appInfo.appName }}
            </a-descriptions-item>
            <a-descriptions-item label="应用编码">
              {{ appInfo.appCode }}
            </a-descriptions-item>
            <a-descriptions-item label="应用类型">
              <a-tag :color="getAppTypeColor(appInfo.appType)">
                {{ getAppTypeText(appInfo.appType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="应用状态">
              <a-tag :color="getStatusColor(appInfo.status)">
                {{ getStatusText(appInfo.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="负责人">
              {{ appInfo.owner }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ appInfo.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="最后更新">
              {{ appInfo.updateTime }}
            </a-descriptions-item>
            <a-descriptions-item label="版本号">
              {{ appInfo.version }}
            </a-descriptions-item>
            <a-descriptions-item label="技术栈" :span="2">
              <div class="tech-stack-tags">
                <a-tag 
                  v-for="tech in appInfo.techStack" 
                  :key="tech.name" 
                  class="tech-tag"
                  color="blue"
                >
                  <Icon :icon="tech.icon" :size="14" style="margin-right: 4px;" />
                  {{ tech.name }} {{ tech.version }}
                </a-tag>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="应用描述" :span="2">
              {{ appInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <!-- 初始化命令 -->
    <a-row :gutter="24" class="mt-4">
      <a-col :span="24">
        <a-card title="初始化命令" :bordered="false" v-if="appDetail && (appDetail.initCommand || appDetail.templateType)" class="init-command-card">
          <div class="init-command-container">
            <div class="command-header">
              <span class="command-title">
                <Icon icon="ant-design:code-outlined" :size="18" />
                {{ getInitCommandTitle() }}
              </span>
              <a-button type="link" @click="copyInitCommand" size="small">
                <Icon icon="ant-design:copy-outlined" :size="16" />
                复制命令
              </a-button>
            </div>
            <div class="command-content">
              <a-alert type="info" show-icon>
                <template #message>
                  <div class="command-text">{{ getInitCommand() }}</div>
                </template>
                <template #description>
                  <div class="command-desc">{{ getInitCommandDesc() }}</div>
                </template>
              </a-alert>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Git仓库信息 -->
    <a-row :gutter="24" class="mt-4">
      <a-col :span="24">
        <a-card title="Git仓库信息" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="仓库地址">
                  <a :href="appInfo.gitInfo.repoUrl" target="_blank">
                    {{ appInfo.gitInfo.repoUrl }}
                  </a>
                </a-descriptions-item>
                <a-descriptions-item label="默认分支">
                  {{ appInfo.gitInfo.defaultBranch }}
                </a-descriptions-item>
                <a-descriptions-item label="最后提交">
                  {{ appInfo.gitInfo.lastCommit }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="12">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="提交者">
                  {{ appInfo.gitInfo.lastCommitter }}
                </a-descriptions-item>
                <a-descriptions-item label="提交时间">
                  {{ appInfo.gitInfo.lastCommitTime }}
                </a-descriptions-item>
                <a-descriptions-item label="分支数量">
                  {{ appInfo.gitInfo.branchCount }}
                </a-descriptions-item>
              </a-descriptions>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- 依赖信息 -->
    <a-row :gutter="24" class="mt-4">
      <a-col :span="24">
        <a-card title="依赖信息" :bordered="false">
          <div v-if="packageJsonLoading" class="loading-container">
            <a-spin size="large" />
            <div class="loading-text">正在加载依赖信息...</div>
          </div>
          <div v-else-if="packageJsonError" class="error-container">
            <a-alert type="error" :message="packageJsonError" show-icon />
          </div>
          <div v-else-if="packageJsonData">
            <a-tabs v-model:activeKey="dependencyTabKey" type="card">
              <!-- 生产依赖 -->
              <a-tab-pane key="dependencies" :tab="`生产依赖 (${getDependencyCount('dependencies')})`">
                <div class="dependency-section">
                  <div class="dependency-header">
                    <span class="dependency-title">
                      <Icon icon="ant-design:package-outlined" :size="18" />
                      生产环境依赖包
                    </span>
                    <a-button type="link" @click="copyDependencies('dependencies')" size="small">
                      <Icon icon="ant-design:copy-outlined" :size="16" />
                      复制依赖列表
                    </a-button>
                  </div>
                  <a-descriptions 
                    :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                    size="small"
                    bordered
                    class="dependency-descriptions"
                  >
                    <a-descriptions-item 
                      v-for="(version, name) in packageJsonData.dependencies" 
                      :key="name"
                      :label="name"
                    >
                      <a-tag color="blue">{{ version }}</a-tag>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>

              <!-- 开发依赖 -->
              <a-tab-pane key="devDependencies" :tab="`开发依赖 (${getDependencyCount('devDependencies')})`">
                <div class="dependency-section">
                  <div class="dependency-header">
                    <span class="dependency-title">
                      <Icon icon="ant-design:tool-outlined" :size="18" />
                      开发环境依赖包
                    </span>
                    <a-button type="link" @click="copyDependencies('devDependencies')" size="small">
                      <Icon icon="ant-design:copy-outlined" :size="16" />
                      复制依赖列表
                    </a-button>
                  </div>
                  <a-descriptions 
                    :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                    size="small"
                    bordered
                    class="dependency-descriptions"
                  >
                    <a-descriptions-item 
                      v-for="(version, name) in packageJsonData.devDependencies" 
                      :key="name"
                      :label="name"
                    >
                      <a-tag color="orange">{{ version }}</a-tag>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>

              <!-- 可选依赖 -->
              <a-tab-pane key="optionalDependencies" :tab="`可选依赖 (${getDependencyCount('optionalDependencies')})`" v-if="packageJsonData.optionalDependencies">
                <div class="dependency-section">
                  <div class="dependency-header">
                    <span class="dependency-title">
                      <Icon icon="ant-design:question-circle-outlined" :size="18" />
                      可选依赖包
                    </span>
                    <a-button type="link" @click="copyDependencies('optionalDependencies')" size="small">
                      <Icon icon="ant-design:copy-outlined" :size="16" />
                      复制依赖列表
                    </a-button>
                  </div>
                  <a-descriptions 
                    :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                    size="small"
                    bordered
                    class="dependency-descriptions"
                  >
                    <a-descriptions-item 
                      v-for="(version, name) in packageJsonData.optionalDependencies" 
                      :key="name"
                      :label="name"
                    >
                      <a-tag color="purple">{{ version }}</a-tag>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>

              <!-- 同级依赖 -->
              <a-tab-pane key="peerDependencies" :tab="`同级依赖 (${getDependencyCount('peerDependencies')})`" v-if="packageJsonData.peerDependencies">
                <div class="dependency-section">
                  <div class="dependency-header">
                    <span class="dependency-title">
                      <Icon icon="ant-design:share-alt-outlined" :size="18" />
                      同级依赖包
                    </span>
                    <a-button type="link" @click="copyDependencies('peerDependencies')" size="small">
                      <Icon icon="ant-design:copy-outlined" :size="16" />
                      复制依赖列表
                    </a-button>
                  </div>
                  <a-descriptions 
                    :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                    size="small"
                    bordered
                    class="dependency-descriptions"
                  >
                    <a-descriptions-item 
                      v-for="(version, name) in packageJsonData.peerDependencies" 
                      :key="name"
                      :label="name"
                    >
                      <a-tag color="green">{{ version }}</a-tag>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
          <div v-else class="no-data-container">
            <a-empty description="未找到 package.json 文件" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, h } from 'vue';
import Icon from '/@/components/Icon';
import { useCopyToClipboard } from '@/hooks/web/useCopyToClipboard';
import { useMessage } from '@/hooks/web/useMessage';
import { getAppPackageJson } from '../AppManage.api';

/**
 * 应用信息接口定义
 */
interface AppInfo {
  appName: string;
  appCode: string;
  appType: string;
  status: string;
  owner: string;
  createTime: string;
  updateTime: string;
  version: string;
  description: string;
  techStack: Array<{
    name: string;
    version: string;
    icon: string;
  }>;
  environments: Array<{
    name: string;
    url: string;
    status: string;
  }>;
  gitInfo: {
    repoUrl: string;
    defaultBranch: string;
    lastCommit: string;
    lastCommitter: string;
    lastCommitTime: string;
    branchCount: number;
  };
}

/**
 * Package.json 数据接口定义
 */
interface PackageJsonData {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const props = defineProps<{
  appId: string;
  appDetail: any;
}>();

// 剪贴板和消息
const { clipboardRef, isSuccessRef } = useCopyToClipboard();
const { createMessage } = useMessage();

// 依赖信息相关状态
const packageJsonData = ref<PackageJsonData | null>(null);
const packageJsonLoading = ref(false);
const packageJsonError = ref<string | null>(null);
const dependencyTabKey = ref('dependencies');

// 表格列定义
const dependencyColumns = [
  {
    title: '包名',
    dataIndex: 'name',
    key: 'name',
    width: '60%',
    ellipsis: true,
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: '40%',
    customRender: ({ record }) => {
      const colorMap = {
        dependencies: 'blue',
        devDependencies: 'orange',
        optionalDependencies: 'purple',
        peerDependencies: 'green',
      };
      return h('a-tag', { color: colorMap[record.type] || 'default' }, record.version);
    },
  },
];

/**
 * 获取依赖数量
 * @param type 依赖类型
 */
function getDependencyCount(type: string): number {
  if (!packageJsonData.value || !packageJsonData.value[type]) return 0;
  return Object.keys(packageJsonData.value[type]).length;
}

/**
 * 获取表格数据
 * @param type 依赖类型
 */
function getDependencyTableData(type: string) {
  if (!packageJsonData.value || !packageJsonData.value[type]) return [];
  
  return Object.entries(packageJsonData.value[type]).map(([name, version]) => ({
    key: name,
    name,
    version,
    type,
  }));
}

/**
 * 复制依赖列表
 * @param type 依赖类型
 */
function copyDependencies(type: string) {
  if (!packageJsonData.value || !packageJsonData.value[type]) return;
  
  const dependencies = Object.entries(packageJsonData.value[type])
    .map(([name, version]) => `${name}@${version}`)
    .join('\n');
  
  copy(dependencies);
  }
/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
function copy(text: string) {
  clipboardRef.value = text;
  if (isSuccessRef.value) {
    createMessage.success('复制成功');
  } else {
    createMessage.error('复制失败');
  }
}
const appInfo = ref<AppInfo>({
  appName: props.appDetail?.appName || 'Jeecg Boot Vue3',
  appCode: props.appDetail?.appCode || 'jeecg-vue3',
  appType: props.appDetail?.appType || 'web',
  status: props.appDetail?.status || 'running',
  owner: props.appDetail?.owner || '张三',
  createTime: props.appDetail?.createTime || '2023-01-15 10:30:00',
  updateTime: props.appDetail?.updateTime || '2024-01-15 14:20:00',
  version: props.appDetail?.version || 'v3.5.3',
  description: props.appDetail?.description || '基于Vue3 + TypeScript + Ant Design Vue的企业级后台管理系统',
  techStack: [
    { name: 'Vue3', version: '3.3.4', icon: 'logos:vue' },
    { name: 'TypeScript', version: '5.0.2', icon: 'logos:typescript-icon' },
    { name: 'Vite', version: '4.4.5', icon: 'logos:vitejs' },
    { name: 'Ant Design Vue', version: '4.0.0', icon: 'logos:ant-design' },
  ],
  environments: [
    { name: '开发环境', url: 'http://dev.jeecg.com', status: 'running' },
    { name: '测试环境', url: 'http://test.jeecg.com', status: 'running' },
    { name: '生产环境', url: 'http://prod.jeecg.com', status: 'running' },
  ],
  gitInfo: {
    repoUrl: props.appDetail?.gitUrl || 'https://github.com/jeecgboot/jeecg-boot',
    defaultBranch: 'master',
    lastCommit: 'feat: 新增应用管理功能',
    lastCommitter: '张三',
    lastCommitTime: '2024-01-15 14:20:00',
    branchCount: 15,
  },
});

/**
 * 获取初始化命令标题
 */
const getInitCommandTitle = () => {
  if (!props.appDetail) return '初始化命令';
  
  if (props.appDetail.templateType === 'application') {
    return '应用模板初始化命令';
  } else {
    return 'Git仓库下载命令';
  }
};

/**
 * 获取初始化命令
 */
const getInitCommand = () => {
  if (!props.appDetail) return '';
  
  // 如果有自定义命令，直接返回
  if (props.appDetail.initCommand) {
    return props.appDetail.initCommand;
  }
  
  // 根据模板类型生成默认命令
  if (props.appDetail.templateType === 'application') {
    return `npm init jeecg-app ${props.appDetail.appName} --template=${props.appDetail.templateId}`;
  } else {
    // 空白模板，返回Git克隆命令
    if (props.appDetail.gitUrl) {
      return `git clone ${props.appDetail.gitUrl}`;
    } else {
      return 'git clone https://github.com/jeecgboot/jeecg-boot-vue3.git';
    }
  }
};

/**
 * 获取初始化命令描述
 */
const getInitCommandDesc = () => {
  if (!props.appDetail) return '';
  
  if (props.appDetail.templateType === 'application') {
    return '使用此命令初始化应用模板，将创建基于选定模板的新应用。';
  } else {
    return '使用此命令从Git仓库下载应用代码，然后可以进行自定义开发。';
  }
};

/**
 * 复制初始化命令
 */
const copyInitCommand = async () => {
  const command = getInitCommand();
  if (command) {
    await copy(command);
    createMessage.success('命令已复制到剪贴板');
  }
};

/**
 * 获取应用类型颜色
 */
const getAppTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    web: 'blue',
    mobile: 'green',
    desktop: 'purple',
    api: 'orange',
  };
  return colorMap[type] || 'default';
};

/**
 * 获取应用类型文本
 */
const getAppTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API服务',
  };
  return textMap[type] || type;
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    running: 'green',
    stopped: 'red',
    pending: 'orange',
  };
  return colorMap[status] || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    pending: '待部署',
  };
  return textMap[status] || status;
};

/**
 * 加载应用信息
 */
const loadAppInfo = async () => {
  // TODO: 调用API获取应用详细信息
  console.log('Loading app info for:', props.appId);
};

/**
 * 加载 package.json 依赖信息
 */
const loadPackageJsonData = async () => {
  if (!props.appId) return;
  
  packageJsonLoading.value = true;
  packageJsonError.value = null;
  
  try {
    const result = await getAppPackageJson(props.appId);
    if (result.success) {
      packageJsonData.value = result.result;
    } else {
      packageJsonError.value = result.message || '获取依赖信息失败';
    }
  } catch (error) {
    console.error('获取 package.json 失败:', error);
    packageJsonError.value = '获取依赖信息失败，请稍后重试';
  } finally {
    packageJsonLoading.value = false;
  }
};

onMounted(() => {
  loadAppInfo();
  loadPackageJsonData();
});

</script>

<style lang="less" scoped>
.basic-info {
  .tech-stack-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .tech-tag {
      display: inline-flex;
      align-items: center;
      margin: 0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      
      .anticon {
        margin-right: 4px;
      }
    }
  }

  .tech-stack {
    .tech-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      background: #fafafa;
      border-radius: 6px;

      .tech-name {
        margin: 0 8px;
        flex: 1;
        font-weight: 500;
      }
    }
  }

  .env-list {
    .env-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;

      .env-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .env-name {
          font-weight: 500;
        }
      }

      .env-url {
        font-size: 12px;
        color: #666;

        a {
          color: #1890ff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mt-4 {
    margin-top: 16px;
  }
}

// 依赖信息样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .ant-spin {
    margin-bottom: 16px;
  }
  
  .loading-text {
    color: #666;
    font-size: 14px;
  }
}

.error-container {
  padding: 20px;
}

.no-data-container {
  padding: 40px;
  text-align: center;
}

.dependency-section {
  .dependency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .dependency-title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #262626;
      
      .anticon {
        margin-right: 8px;
      }
    }
  }
}

.dependency-descriptions {
  :deep(.ant-descriptions-item-label) {
    font-weight: 500;
    color: #262626;
    background-color: #fafafa;
    width: 60%;
  }
  
  :deep(.ant-descriptions-item-content) {
    width: 40%;
  }
  
  :deep(.ant-tag) {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    border-radius: 4px;
  }
  
  :deep(.ant-descriptions-item) {
    padding-bottom: 8px;
  }
}
</style>