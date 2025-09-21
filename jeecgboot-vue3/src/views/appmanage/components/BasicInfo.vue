<template>
  <div class="basic-info">
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
import { Card, Row, Col, Descriptions, Tag } from 'ant-design-vue';
import Icon from '/@/components/Icon';

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
}>();

const appInfo = ref<AppInfo>({
  appName: 'Jeecg Boot Vue3',
  appCode: 'jeecg-vue3',
  appType: 'web',
  status: 'running',
  owner: '张三',
  createTime: '2023-01-15 10:30:00',
  updateTime: '2024-01-15 14:20:00',
  version: 'v3.5.3',
  description: '基于Vue3 + TypeScript + Ant Design Vue的企业级后台管理系统',
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
    repoUrl: 'https://github.com/jeecgboot/jeecg-boot',
    defaultBranch: 'master',
    lastCommit: 'feat: 新增应用管理功能',
    lastCommitter: '张三',
    lastCommitTime: '2024-01-15 14:20:00',
    branchCount: 15,
  },
});

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