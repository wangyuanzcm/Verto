<template>
  <div class="app-config">
    <a-row :gutter="24">
      <a-col :span="24">
        <!-- 配置概览 -->
        <a-card title="配置概览" :bordered="false" class="mb-4">
          <a-row :gutter="16">
            <a-col
              v-for="config in configOverview"
              :key="config.key"
              :xs="24"
              :sm="12"
              :md="6"
            >
              <div class="config-overview-item">
                <div class="config-icon">
                  <Icon :icon="config.icon" :size="24" />
                </div>
                <div class="config-info">
                  <div class="config-title">{{ config.title }}</div>
                  <div class="config-status">
                    <a-tag :color="getStatusColor(config.status)">
                      {{ getStatusText(config.status) }}
                    </a-tag>
                  </div>
                </div>
                <div class="config-action">
                  <a-button
                    type="link"
                    size="small"
                    @click="handleConfigClick(config.key)"
                  >
                    配置
                  </a-button>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细配置 -->
    <a-row :gutter="24">
      <!-- 流水线配置 -->
      <a-col :span="12">
        <a-card title="流水线配置" :bordered="false" class="mb-4">
          <template #extra>
            <a-button type="primary" size="small" @click="handlePipelineConfig">
              编辑配置
            </a-button>
          </template>
          
          <div class="pipeline-config">
            <div class="config-section">
              <h4>构建配置</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="构建工具">
                  {{ pipelineConfig.buildTool }}
                </a-descriptions-item>
                <a-descriptions-item label="构建命令">
                  <code>{{ pipelineConfig.buildCommand }}</code>
                </a-descriptions-item>
                <a-descriptions-item label="构建目录">
                  {{ pipelineConfig.buildDir }}
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <a-divider />

            <div class="config-section">
              <h4>部署配置</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="部署环境">
                  <a-tag
                    v-for="env in pipelineConfig.deployEnvs"
                    :key="env"
                    color="blue"
                  >
                    {{ env }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="部署策略">
                  {{ pipelineConfig.deployStrategy }}
                </a-descriptions-item>
                <a-descriptions-item label="自动部署">
                  <a-switch
                    v-model:checked="pipelineConfig.autoDeploy"
                    @change="handleAutoDeployChange"
                  />
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 埋点配置 -->
      <a-col :span="12">
        <a-card title="埋点配置" :bordered="false" class="mb-4">
          <template #extra>
            <a-button type="primary" size="small" @click="handleTrackingConfig">
              编辑配置
            </a-button>
          </template>

          <div class="tracking-config">
            <div class="config-section">
              <h4>基础配置</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="埋点SDK">
                  {{ trackingConfig.sdk }}
                </a-descriptions-item>
                <a-descriptions-item label="应用ID">
                  {{ trackingConfig.appId }}
                </a-descriptions-item>
                <a-descriptions-item label="数据上报">
                  <a-switch
                    v-model:checked="trackingConfig.enabled"
                    @change="handleTrackingEnabledChange"
                  />
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <a-divider />

            <div class="config-section">
              <h4>事件配置</h4>
              <div class="event-list">
                <div
                  v-for="event in trackingConfig.events"
                  :key="event.name"
                  class="event-item"
                >
                  <span class="event-name">{{ event.name }}</span>
                  <a-tag :color="event.enabled ? 'green' : 'red'" size="small">
                    {{ event.enabled ? '已启用' : '已禁用' }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <!-- 代码审查规范 -->
      <a-col :span="12">
        <a-card title="代码审查规范" :bordered="false" class="mb-4">
          <template #extra>
            <a-button type="primary" size="small" @click="handleCodeReviewConfig">
              编辑规范
            </a-button>
          </template>

          <div class="code-review-config">
            <div class="config-section">
              <h4>审查规则</h4>
              <div class="rule-list">
                <div
                  v-for="rule in codeReviewConfig.rules"
                  :key="rule.name"
                  class="rule-item"
                >
                  <div class="rule-header">
                    <span class="rule-name">{{ rule.name }}</span>
                    <a-tag :color="rule.enabled ? 'green' : 'red'" size="small">
                      {{ rule.enabled ? '已启用' : '已禁用' }}
                    </a-tag>
                  </div>
                  <div class="rule-description">{{ rule.description }}</div>
                </div>
              </div>
            </div>

            <a-divider />

            <div class="config-section">
              <h4>审查设置</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="必须审查">
                  <a-switch
                    v-model:checked="codeReviewConfig.required"
                    @change="handleCodeReviewRequiredChange"
                  />
                </a-descriptions-item>
                <a-descriptions-item label="最少审查人数">
                  {{ codeReviewConfig.minReviewers }}
                </a-descriptions-item>
                <a-descriptions-item label="自动合并">
                  <a-switch
                    v-model:checked="codeReviewConfig.autoMerge"
                    @change="handleAutoMergeChange"
                  />
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 监控告警 -->
      <a-col :span="12">
        <a-card title="监控告警" :bordered="false" class="mb-4">
          <template #extra>
            <a-button type="primary" size="small" @click="handleMonitorConfig">
              编辑配置
            </a-button>
          </template>

          <div class="monitor-config">
            <div class="config-section">
              <h4>监控指标</h4>
              <div class="metric-list">
                <div
                  v-for="metric in monitorConfig.metrics"
                  :key="metric.name"
                  class="metric-item"
                >
                  <div class="metric-header">
                    <span class="metric-name">{{ metric.name }}</span>
                    <a-tag :color="metric.enabled ? 'green' : 'red'" size="small">
                      {{ metric.enabled ? '已启用' : '已禁用' }}
                    </a-tag>
                  </div>
                  <div class="metric-threshold">
                    阈值: {{ metric.threshold }}
                  </div>
                </div>
              </div>
            </div>

            <a-divider />

            <div class="config-section">
              <h4>告警设置</h4>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="告警方式">
                  <a-tag
                    v-for="method in monitorConfig.alertMethods"
                    :key="method"
                    color="blue"
                  >
                    {{ method }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="告警频率">
                  {{ monitorConfig.alertFrequency }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Row, Col, Button, Descriptions, Tag, Switch, Divider, message } from 'ant-design-vue';
import Icon from '/@/components/Icon';

const props = defineProps<{
  appId: string;
}>();

const emit = defineEmits<{
  switchToConfig: [configType: string];
}>();

// 配置概览数据
const configOverview = ref([
  {
    key: 'pipeline',
    title: '流水线',
    icon: 'ant-design:deployment-unit-outlined',
    status: 'enabled',
  },
  {
    key: 'tracking',
    title: '埋点',
    icon: 'ant-design:aim-outlined',
    status: 'enabled',
  },
  {
    key: 'codeReview',
    title: '代码审查',
    icon: 'ant-design:audit-outlined',
    status: 'pending',
  },
  {
    key: 'monitor',
    title: '监控告警',
    icon: 'ant-design:monitor-outlined',
    status: 'disabled',
  },
]);

// 流水线配置
const pipelineConfig = ref({
  buildTool: 'Vite',
  buildCommand: 'pnpm build',
  buildDir: 'dist',
  deployEnvs: ['开发环境', '测试环境', '生产环境'],
  deployStrategy: '蓝绿部署',
  autoDeploy: true,
});

// 埋点配置
const trackingConfig = ref({
  sdk: 'Google Analytics',
  appId: 'GA-XXXXXXXXX',
  enabled: true,
  events: [
    { name: '页面访问', enabled: true },
    { name: '按钮点击', enabled: true },
    { name: '表单提交', enabled: false },
    { name: '文件下载', enabled: true },
  ],
});

// 代码审查配置
const codeReviewConfig = ref({
  required: true,
  minReviewers: 2,
  autoMerge: false,
  rules: [
    {
      name: 'ESLint检查',
      description: '代码必须通过ESLint规则检查',
      enabled: true,
    },
    {
      name: '单元测试',
      description: '新增代码必须包含单元测试',
      enabled: true,
    },
    {
      name: '代码覆盖率',
      description: '代码覆盖率不能低于80%',
      enabled: false,
    },
    {
      name: '安全扫描',
      description: '代码必须通过安全漏洞扫描',
      enabled: true,
    },
  ],
});

// 监控配置
const monitorConfig = ref({
  metrics: [
    { name: 'CPU使用率', threshold: '80%', enabled: true },
    { name: '内存使用率', threshold: '85%', enabled: true },
    { name: '响应时间', threshold: '2s', enabled: false },
    { name: '错误率', threshold: '5%', enabled: true },
  ],
  alertMethods: ['邮件', '短信', '钉钉'],
  alertFrequency: '5分钟',
});

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    enabled: 'green',
    disabled: 'red',
    pending: 'orange',
  };
  return colorMap[status] || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    enabled: '已启用',
    disabled: '已禁用',
    pending: '待配置',
  };
  return textMap[status] || status;
};

/**
 * 处理配置点击
 */
const handleConfigClick = (configKey: string) => {
  message.info(`配置 ${configKey}`);
};

/**
 * 处理流水线配置
 */
const handlePipelineConfig = () => {
  // 触发事件，通知父组件切换到流水线配置页面
  emit('switchToConfig', 'pipeline');
};

/**
 * 处理自动部署变更
 */
const handleAutoDeployChange = (checked: boolean) => {
  message.success(`自动部署已${checked ? '启用' : '禁用'}`);
};

/**
 * 处理埋点配置
 */
const handleTrackingConfig = () => {
  message.info('编辑埋点配置');
};

/**
 * 处理埋点启用变更
 */
const handleTrackingEnabledChange = (checked: boolean) => {
  message.success(`埋点数据上报已${checked ? '启用' : '禁用'}`);
};

/**
 * 处理代码审查配置
 */
const handleCodeReviewConfig = () => {
  message.info('编辑代码审查规范');
};

/**
 * 处理代码审查必须变更
 */
const handleCodeReviewRequiredChange = (checked: boolean) => {
  message.success(`代码审查${checked ? '必须' : '可选'}`);
};

/**
 * 处理自动合并变更
 */
const handleAutoMergeChange = (checked: boolean) => {
  message.success(`自动合并已${checked ? '启用' : '禁用'}`);
};

/**
 * 处理监控配置
 */
const handleMonitorConfig = () => {
  message.info('编辑监控告警配置');
};

/**
 * 加载配置数据
 */
const loadConfigs = async () => {
  // TODO: 调用API获取配置数据
  console.log('Loading configs for app:', props.appId);
};

onMounted(() => {
  loadConfigs();
});
</script>

<style lang="less" scoped>
.app-config {
  .mb-4 {
    margin-bottom: 16px;
  }

  .config-overview-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      background: #f0f0f0;
    }

    .config-icon {
      margin-right: 12px;
      color: #1890ff;
    }

    .config-info {
      flex: 1;

      .config-title {
        font-weight: 500;
        margin-bottom: 4px;
      }
    }

    .config-action {
      margin-left: 12px;
    }
  }

  .config-section {
    h4 {
      margin-bottom: 16px;
      color: #333;
      font-weight: 500;
    }
  }

  .event-list,
  .rule-list,
  .metric-list {
    .event-item,
    .rule-item,
    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: #fafafa;
      border-radius: 4px;

      .event-name,
      .rule-name,
      .metric-name {
        font-weight: 500;
      }

      .rule-header,
      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .rule-description,
      .metric-threshold {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    }

    .rule-item,
    .metric-item {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  code {
    padding: 2px 6px;
    background: #f6f6f6;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}
</style>