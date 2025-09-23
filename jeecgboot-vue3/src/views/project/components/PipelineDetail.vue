<template>
  <div class="pipeline-detail">
    <!-- 流水线基本信息 -->
    <div class="pipeline-info">
      <a-descriptions title="基本信息" :column="2" bordered>
        <a-descriptions-item label="流水线名称">
          {{ pipeline.name }}
        </a-descriptions-item>
        <a-descriptions-item label="类型">
          <a-tag>{{ pipeline.type }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="环境">
          <a-tag>{{ pipeline.environment }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getPipelineStatusColor(pipeline.status)">
            <Icon :icon="getPipelineStatusIcon(pipeline.status)" />
            {{ getPipelineStatusText(pipeline.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ pipeline.createTime }}
        </a-descriptions-item>
        <a-descriptions-item label="最后运行">
          <div v-if="pipeline.lastRun">
            {{ formatTime(pipeline.lastRun.time) }}
            <a-tag size="small" :color="getRunStatusColor(pipeline.lastRun.status)">
              {{ getRunStatusText(pipeline.lastRun.status) }}
            </a-tag>
          </div>
          <span v-else>从未运行</span>
        </a-descriptions-item>
      </a-descriptions>
    </div>

    <!-- 流水线阶段 -->
    <div class="pipeline-stages">
      <a-card title="流水线阶段" :bordered="false">
        <div class="stages-flow">
          <div 
            v-for="(stage, index) in pipelineStages" 
            :key="stage.id"
            class="pipeline-stage"
            :class="{ 
              'active': stage.status === 'running', 
              'success': stage.status === 'success', 
              'failed': stage.status === 'failed',
              'pending': stage.status === 'pending'
            }"
          >
            <div class="stage-header">
              <div class="stage-icon">
                <Icon :icon="stage.icon" />
                <div v-if="stage.status === 'running'" class="loading-indicator">
                  <a-spin size="small" />
                </div>
              </div>
              <div class="stage-info">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-desc">{{ stage.description }}</div>
              </div>
              <div class="stage-status">
                <a-tag :color="getStageStatusColor(stage.status)">
                  {{ getStageStatusText(stage.status) }}
                </a-tag>
                <div v-if="stage.duration" class="stage-duration">
                  {{ stage.duration }}
                </div>
              </div>
            </div>

            <!-- 阶段详情 -->
            <div v-if="stage.expanded" class="stage-details">
              <div class="stage-logs">
                <h4>执行日志</h4>
                <div class="log-content">
                  <pre v-for="log in stage.logs" :key="log.id" :class="log.level">{{ log.message }}</pre>
                </div>
              </div>
            </div>

            <!-- 连接线 -->
            <div v-if="index < pipelineStages.length - 1" class="stage-connector">
              <div class="connector-line" :class="{ 'active': stage.status === 'success' }"></div>
            </div>

            <!-- 展开/收起按钮 -->
            <div class="stage-toggle">
              <a-button 
                type="text" 
                size="small" 
                @click="toggleStageDetails(stage)"
              >
                <Icon :icon="stage.expanded ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
              </a-button>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 执行历史 -->
    <div class="execution-history">
      <a-card title="执行历史" :bordered="false">
        <template #extra>
          <a-space>
            <a-button @click="handleRefreshHistory">
              <template #icon>
                <Icon icon="ant-design:reload-outlined" />
              </template>
              刷新
            </a-button>
          </a-space>
        </template>

        <a-table 
          :columns="historyColumns" 
          :data-source="executionHistory"
          :loading="historyLoading"
          :pagination="historyPagination"
          @change="handleHistoryTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getRunStatusColor(record.status)">
                <Icon :icon="getRunStatusIcon(record.status)" />
                {{ getRunStatusText(record.status) }}
              </a-tag>
            </template>
            
            <template v-if="column.key === 'trigger'">
              <div class="trigger-info">
                <Icon :icon="getTriggerIcon(record.trigger.type)" />
                <span>{{ getTriggerText(record.trigger.type) }}</span>
                <div class="trigger-user">{{ record.trigger.user }}</div>
              </div>
            </template>
            
            <template v-if="column.key === 'duration'">
              {{ record.duration || '-' }}
            </template>
            
            <template v-if="column.key === 'actions'">
              <a-space>
                <a @click="handleViewExecution(record)">查看详情</a>
                <a v-if="record.status === 'failed'" @click="handleRetryExecution(record)">重试</a>
                <a @click="handleDownloadLogs(record)">下载日志</a>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDateTime } from '/@/utils/dateUtil';

  interface Props {
    pipeline: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['refresh']);
  const { createMessage } = useMessage();

  // 流水线阶段
  const pipelineStages = ref([]);

  // 执行历史
  const executionHistory = ref([]);
  const historyLoading = ref(false);
  const historyPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 历史表格列配置
  const historyColumns = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '触发方式',
      dataIndex: 'trigger',
      key: 'trigger',
      width: 150,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
    },
  ];

  /**
   * 加载流水线阶段
   */
  function loadPipelineStages() {
    // 模拟数据
    pipelineStages.value = [
      {
        id: '1',
        name: '代码检出',
        description: '从Git仓库检出代码',
        icon: 'ant-design:download-outlined',
        status: 'success',
        duration: '30秒',
        expanded: false,
        logs: [
          { id: '1', level: 'info', message: 'Cloning repository...' },
          { id: '2', level: 'info', message: 'Checkout completed successfully' },
        ],
      },
      {
        id: '2',
        name: '依赖安装',
        description: '安装项目依赖',
        icon: 'ant-design:download-outlined',
        status: 'success',
        duration: '2分钟',
        expanded: false,
        logs: [
          { id: '3', level: 'info', message: 'Installing dependencies...' },
          { id: '4', level: 'info', message: 'Dependencies installed successfully' },
        ],
      },
      {
        id: '3',
        name: '代码检查',
        description: '静态代码分析',
        icon: 'ant-design:code-outlined',
        status: 'running',
        duration: null,
        expanded: true,
        logs: [
          { id: '5', level: 'info', message: 'Running ESLint...' },
          { id: '6', level: 'warn', message: 'Found 2 warnings' },
          { id: '7', level: 'info', message: 'Code analysis in progress...' },
        ],
      },
      {
        id: '4',
        name: '单元测试',
        description: '运行单元测试',
        icon: 'ant-design:bug-outlined',
        status: 'pending',
        duration: null,
        expanded: false,
        logs: [],
      },
      {
        id: '5',
        name: '构建打包',
        description: '编译和打包应用',
        icon: 'ant-design:build-outlined',
        status: 'pending',
        duration: null,
        expanded: false,
        logs: [],
      },
      {
        id: '6',
        name: '部署',
        description: '部署到目标环境',
        icon: 'ant-design:cloud-upload-outlined',
        status: 'pending',
        duration: null,
        expanded: false,
        logs: [],
      },
    ];
  }

  /**
   * 加载执行历史
   */
  function loadExecutionHistory() {
    historyLoading.value = true;
    
    // 模拟数据
    setTimeout(() => {
      executionHistory.value = [
        {
          id: 'exec-001',
          status: 'success',
          trigger: {
            type: 'manual',
            user: 'admin',
          },
          startTime: '2024-01-15 14:30:00',
          duration: '8分钟',
        },
        {
          id: 'exec-002',
          status: 'failed',
          trigger: {
            type: 'webhook',
            user: 'system',
          },
          startTime: '2024-01-15 10:15:00',
          duration: '3分钟',
        },
        {
          id: 'exec-003',
          status: 'success',
          trigger: {
            type: 'schedule',
            user: 'system',
          },
          startTime: '2024-01-14 22:00:00',
          duration: '12分钟',
        },
      ];
      
      historyPagination.total = executionHistory.value.length;
      historyLoading.value = false;
    }, 1000);
  }

  /**
   * 获取流水线状态颜色
   */
  function getPipelineStatusColor(status: string) {
    const colorMap = {
      'idle': 'default',
      'running': 'processing',
      'success': 'success',
      'failed': 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取流水线状态图标
   */
  function getPipelineStatusIcon(status: string) {
    const iconMap = {
      'idle': 'ant-design:pause-circle-outlined',
      'running': 'ant-design:loading-outlined',
      'success': 'ant-design:check-circle-outlined',
      'failed': 'ant-design:close-circle-outlined',
    };
    return iconMap[status] || 'ant-design:question-circle-outlined';
  }

  /**
   * 获取流水线状态文本
   */
  function getPipelineStatusText(status: string) {
    const textMap = {
      'idle': '空闲',
      'running': '运行中',
      'success': '成功',
      'failed': '失败',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取阶段状态颜色
   */
  function getStageStatusColor(status: string) {
    const colorMap = {
      'pending': 'default',
      'running': 'processing',
      'success': 'success',
      'failed': 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取阶段状态文本
   */
  function getStageStatusText(status: string) {
    const textMap = {
      'pending': '等待中',
      'running': '运行中',
      'success': '成功',
      'failed': '失败',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取运行状态颜色
   */
  function getRunStatusColor(status: string) {
    const colorMap = {
      'success': 'success',
      'failed': 'error',
      'running': 'processing',
      'pending': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取运行状态图标
   */
  function getRunStatusIcon(status: string) {
    const iconMap = {
      'success': 'ant-design:check-circle-outlined',
      'failed': 'ant-design:close-circle-outlined',
      'running': 'ant-design:loading-outlined',
      'pending': 'ant-design:clock-circle-outlined',
    };
    return iconMap[status] || 'ant-design:question-circle-outlined';
  }

  /**
   * 获取运行状态文本
   */
  function getRunStatusText(status: string) {
    const textMap = {
      'success': '成功',
      'failed': '失败',
      'running': '运行中',
      'pending': '等待中',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取触发方式图标
   */
  function getTriggerIcon(type: string) {
    const iconMap = {
      'manual': 'ant-design:user-outlined',
      'webhook': 'ant-design:api-outlined',
      'schedule': 'ant-design:clock-circle-outlined',
    };
    return iconMap[type] || 'ant-design:question-circle-outlined';
  }

  /**
   * 获取触发方式文本
   */
  function getTriggerText(type: string) {
    const textMap = {
      'manual': '手动触发',
      'webhook': 'Webhook',
      'schedule': '定时任务',
    };
    return textMap[type] || '未知';
  }

  /**
   * 格式化时间
   */
  function formatTime(time: string) {
    return formatToDateTime(time);
  }

  /**
   * 切换阶段详情
   */
  function toggleStageDetails(stage: any) {
    stage.expanded = !stage.expanded;
  }

  /**
   * 刷新历史记录
   */
  function handleRefreshHistory() {
    loadExecutionHistory();
  }

  /**
   * 历史表格变化
   */
  function handleHistoryTableChange(pag: any) {
    historyPagination.current = pag.current;
    historyPagination.pageSize = pag.pageSize;
    loadExecutionHistory();
  }

  /**
   * 查看执行详情
   */
  function handleViewExecution(record: any) {
    createMessage.info(`查看执行详情: ${record.id}`);
  }

  /**
   * 重试执行
   */
  function handleRetryExecution(record: any) {
    createMessage.info(`重试执行: ${record.id}`);
  }

  /**
   * 下载日志
   */
  function handleDownloadLogs(record: any) {
    createMessage.info(`下载日志: ${record.id}`);
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadPipelineStages();
    loadExecutionHistory();
  });
</script>

<style lang="less" scoped>
  .pipeline-detail {
    .pipeline-info {
      margin-bottom: 24px;
    }

    .pipeline-stages {
      margin-bottom: 24px;

      .stages-flow {
        .pipeline-stage {
          border: 1px solid #f0f0f0;
          margin-bottom: 16px;
          position: relative;
          background: #fafafa;

          &.active {
            border-color: #1890ff;
            background: #e6f7ff;
          }

          &.success {
            border-color: #52c41a;
            background: #f6ffed;
          }

          &.failed {
            border-color: #ff4d4f;
            background: #fff2f0;
          }

          &.pending {
            border-color: #d9d9d9;
            background: #f5f5f5;
          }

          .stage-header {
            display: flex;
            align-items: center;
            padding: 16px;

            .stage-icon {
              width: 40px;
              height: 40px;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 16px;
              position: relative;
              font-size: 18px;

              .loading-indicator {
                position: absolute;
                top: -2px;
                right: -2px;
              }
            }

            .stage-info {
              flex: 1;

              .stage-name {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 4px;
              }

              .stage-desc {
                color: #666;
                font-size: 14px;
              }
            }

            .stage-status {
              text-align: right;

              .stage-duration {
                margin-top: 4px;
                font-size: 12px;
                color: #999;
              }
            }
          }

          .stage-details {
            border-top: 1px solid #f0f0f0;
            padding: 16px;

            .stage-logs {
              h4 {
                margin-bottom: 12px;
                font-size: 14px;
              }

              .log-content {
                background: #000;
                color: #fff;
                padding: 12px;
                max-height: 200px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;

                pre {
                  margin: 0;
                  white-space: pre-wrap;
                  word-break: break-all;

                  &.info {
                    color: #fff;
                  }

                  &.warn {
                    color: #faad14;
                  }

                  &.error {
                    color: #ff4d4f;
                  }
                }
              }
            }
          }

          .stage-connector {
            position: absolute;
            bottom: -16px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 16px;

            .connector-line {
              width: 100%;
              height: 100%;
              background: #f0f0f0;

              &.active {
                background: #52c41a;
              }
            }
          }

          .stage-toggle {
            position: absolute;
            top: 16px;
            right: 16px;
          }
        }
      }
    }

    .execution-history {
      .trigger-info {
        display: flex;
        align-items: center;
        gap: 4px;

        .trigger-user {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
</style>