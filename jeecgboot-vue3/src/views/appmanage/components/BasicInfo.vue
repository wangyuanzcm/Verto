<template>
  <div class="app-basic-info">
    <a-row :gutter="24">
      <!-- 应用基本信息 -->
      <a-col :span="16">
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
            <a-descriptions-item label="应用描述" :span="2">
              {{ appInfo.description }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <!-- 技术栈信息 -->
      <a-col :span="8">
        <a-card title="技术栈" :bordered="false" class="mb-4">
          <div class="tech-stack">
            <div v-for="tech in appInfo.techStack" :key="tech.name" class="tech-item">
              <Icon :icon="tech.icon" :size="20" />
              <span class="tech-name">{{ tech.name }}</span>
              <a-tag size="small">{{ tech.version }}</a-tag>
            </div>
          </div>
        </a-card>

        <!-- 环境信息 -->
        <a-card title="环境配置" :bordered="false">
          <div class="env-list">
            <div v-for="env in appInfo.environments" :key="env.name" class="env-item">
              <div class="env-header">
                <span class="env-name">{{ env.name }}</span>
                <a-tag :color="env.status === 'running' ? 'green' : 'red'" size="small">
                  {{ env.status === 'running' ? '运行中' : '已停止' }}
                </a-tag>
              </div>
              <div class="env-url">
                <a :href="env.url" target="_blank">{{ env.url }}</a>
              </div>
            </div>
          </div>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Icon from '/@/components/Icon';
import { useCopyToClipboard } from '@/hooks/web/useCopyToClipboard';
import { useMessage } from '@/hooks/web/useMessage';

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

const props = defineProps<{
  appId: string;
  appDetail: any;
}>();

// 剪贴板和消息
const { clipboardRef, isSuccessRef } = useCopyToClipboard();
const { createMessage } = useMessage();

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

// 默认应用信息
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

onMounted(() => {
  loadAppInfo();
});
</script>

<style lang="less" scoped>
.basic-info {
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
</style>