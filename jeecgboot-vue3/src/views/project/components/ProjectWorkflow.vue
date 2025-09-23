<template>
  <div class="project-workflow">
    <!-- 工作流概览 -->
    <div class="workflow-overview">
      <a-card title="开发模式概览" :bordered="false" class="overview-card">
        <div class="mode-info">
          <div class="mode-badge">
            <a-tag :color="getModeColor(workflowInfo.mode)" size="large">
              {{ getModeTitle(workflowInfo.mode) }}
            </a-tag>
          </div>
          <div class="mode-description">
            <p>{{ getModeDescription(workflowInfo.mode) }}</p>
          </div>
          <div class="mode-actions">
            <a-button @click="handleChangeModeClick">
              <template #icon>
                <Icon icon="ant-design:setting-outlined" />
              </template>
              更改模式
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 分支策略 -->
    <div class="branch-strategy-section">
      <a-card title="分支策略" :bordered="false">
        <div class="branch-diagram">
          <div class="branch-timeline">
            <div 
              v-for="branch in workflowInfo.branchStrategy" 
              :key="branch.name"
              class="branch-line"
            >
              <div class="branch-header">
                <div class="branch-indicator" :style="{ backgroundColor: branch.color }"></div>
                <div class="branch-info">
                  <span class="branch-name">{{ branch.name }}</span>
                  <span class="branch-desc">{{ branch.description }}</span>
                </div>
                <div class="branch-status">
                  <a-tag :color="getBranchStatusColor(branch.status)">
                    {{ getBranchStatusText(branch.status) }}
                  </a-tag>
                </div>
              </div>
              
              <!-- 分支操作历史 -->
              <div v-if="branch.activities && branch.activities.length > 0" class="branch-activities">
                <div 
                  v-for="activity in branch.activities.slice(0, 3)" 
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <Icon :icon="getActivityIcon(activity.type)" />
                  </div>
                  <div class="activity-content">
                    <span class="activity-message">{{ activity.message }}</span>
                    <span class="activity-time">{{ formatTime(activity.time) }}</span>
                  </div>
                </div>
                <div v-if="branch.activities.length > 3" class="more-activities">
                  <a @click="handleViewBranchHistory(branch)">查看更多...</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 流水线状态 -->
    <div class="pipeline-section">
      <a-card title="部署流水线" :bordered="false">
        <div class="pipeline-overview">
          <div class="pipeline-stats">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic
                  title="总部署次数"
                  :value="pipelineStats.totalDeployments"
                  suffix="次"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="成功率"
                  :value="pipelineStats.successRate"
                  suffix="%"
                  :value-style="{ color: pipelineStats.successRate >= 90 ? '#3f8600' : '#cf1322' }"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="平均部署时间"
                  :value="pipelineStats.avgDeployTime"
                  suffix="分钟"
                />
              </a-col>
              <a-col :span="6">
                <a-statistic
                  title="最后部署"
                  :value="pipelineStats.lastDeployment"
                  :formatter="formatLastDeployment"
                />
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 流水线阶段 -->
        <div class="pipeline-stages">
          <h4>流水线阶段</h4>
          <div class="stages-flow">
            <div 
              v-for="(stage, index) in workflowInfo.pipeline" 
              :key="stage.name"
              class="pipeline-stage"
              :class="{ 'active': stage.status === 'running', 'success': stage.status === 'success', 'failed': stage.status === 'failed' }"
            >
              <div class="stage-icon">
                <Icon :icon="stage.icon" />
                <div v-if="stage.status === 'running'" class="loading-indicator">
                  <a-spin size="small" />
                </div>
              </div>
              <div class="stage-content">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-desc">{{ stage.description }}</div>
                <div v-if="stage.duration" class="stage-duration">
                  耗时: {{ stage.duration }}
                </div>
              </div>
              <div v-if="index < workflowInfo.pipeline.length - 1" class="stage-connector">
                <div class="connector-line"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近部署历史 -->
        <div class="recent-deployments">
          <h4>最近部署</h4>
          <a-table 
            :columns="deploymentColumns" 
            :data-source="recentDeployments"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getDeploymentStatusColor(record.status)">
                  {{ getDeploymentStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'environment'">
                <a-tag>{{ record.environment }}</a-tag>
              </template>
              <template v-if="column.key === 'duration'">
                {{ record.duration || '-' }}
              </template>
              <template v-if="column.key === 'actions'">
                <a-space>
                  <a @click="handleViewDeploymentDetail(record)">详情</a>
                  <a v-if="record.status === 'failed'" @click="handleRetryDeployment(record)">重试</a>
                  <a v-if="record.status === 'success'" @click="handleRollback(record)">回滚</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-card>
    </div>

    <!-- 开发模式选择弹窗 -->
    <BasicModal 
      v-bind="$attrs" 
      @register="registerModeModal" 
      title="选择开发模式" 
      @ok="handleModeConfirm"
      :width="1200"
      :min-height="600"
    >
      <DevelopmentModeSelector 
        :project-id="projectId"
        :current-mode="workflowInfo.mode"
        @confirm="handleModeChange"
        @cancel="closeModeModal"
      />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import DevelopmentModeSelector from './DevelopmentModeSelector.vue';
  import { getProjectWorkflow, updateProjectWorkflow } from '../Project.api';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();
  const { createMessage } = useMessage();

  // 工作流信息
  const workflowInfo = reactive({
    mode: 'L2',
    branchStrategy: [],
    pipeline: [],
    config: {},
  });

  // 流水线统计
  const pipelineStats = reactive({
    totalDeployments: 0,
    successRate: 0,
    avgDeployTime: 0,
    lastDeployment: '',
  });

  // 最近部署记录
  const recentDeployments = ref([]);

  // 部署表格列配置
  const deploymentColumns = [
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '环境', dataIndex: 'environment', key: 'environment' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '部署时间', dataIndex: 'deployTime', key: 'deployTime' },
    { title: '耗时', dataIndex: 'duration', key: 'duration' },
    { title: '操作', key: 'actions' },
  ];

  // 弹窗注册
  const [registerModeModal, { openModal: openModeModal, closeModal: closeModeModal }] = useModal();

  /**
   * 加载工作流数据
   */
  async function loadWorkflowData() {
    try {
      const result = await getProjectWorkflow({ projectId: props.projectId });
      if (result.success) {
        Object.assign(workflowInfo, result.data.workflow);
        Object.assign(pipelineStats, result.data.stats);
        recentDeployments.value = result.data.deployments || [];
      }
    } catch (error) {
      console.error('加载工作流数据失败:', error);
      // 使用模拟数据
      loadMockData();
    }
  }

  /**
   * 加载模拟数据
   */
  function loadMockData() {
    Object.assign(workflowInfo, {
      mode: 'L2',
      branchStrategy: [
        {
          name: 'main',
          description: '主分支，稳定版本',
          color: '#52c41a',
          status: 'active',
          activities: [
            {
              id: '1',
              type: 'merge',
              message: '合并feature/user-management分支',
              time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              type: 'deploy',
              message: '部署到生产环境',
              time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          name: 'develop',
          description: '开发分支，集成功能',
          color: '#1890ff',
          status: 'active',
          activities: [
            {
              id: '3',
              type: 'commit',
              message: '提交新功能代码',
              time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          name: 'feature/user-management',
          description: '用户管理功能分支',
          color: '#722ed1',
          status: 'merged',
          activities: [],
        },
      ],
      pipeline: [
        {
          name: '代码检查',
          description: '静态代码分析',
          icon: 'ant-design:code-outlined',
          status: 'success',
          duration: '2分钟',
        },
        {
          name: '单元测试',
          description: '运行单元测试',
          icon: 'ant-design:bug-outlined',
          status: 'success',
          duration: '5分钟',
        },
        {
          name: '构建打包',
          description: '编译和打包',
          icon: 'ant-design:build-outlined',
          status: 'running',
          duration: null,
        },
        {
          name: '部署',
          description: '部署到目标环境',
          icon: 'ant-design:cloud-upload-outlined',
          status: 'pending',
          duration: null,
        },
      ],
    });

    Object.assign(pipelineStats, {
      totalDeployments: 156,
      successRate: 94.2,
      avgDeployTime: 8.5,
      lastDeployment: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    });

    recentDeployments.value = [
      {
        id: '1',
        version: 'v1.2.3',
        environment: '生产环境',
        status: 'success',
        deployTime: '2024-01-15 14:30:00',
        duration: '8分钟',
      },
      {
        id: '2',
        version: 'v1.2.2',
        environment: '预发布',
        status: 'success',
        deployTime: '2024-01-15 10:15:00',
        duration: '6分钟',
      },
      {
        id: '3',
        version: 'v1.2.1',
        environment: '测试环境',
        status: 'failed',
        deployTime: '2024-01-14 16:45:00',
        duration: '3分钟',
      },
    ];
  }

  /**
   * 获取模式颜色
   */
  function getModeColor(mode: string) {
    const colorMap = {
      'L1': 'green',
      'L2': 'blue',
      'L3': 'purple',
    };
    return colorMap[mode] || 'default';
  }

  /**
   * 获取模式标题
   */
  function getModeTitle(mode: string) {
    const titleMap = {
      'L1': 'L1 - 简单模式',
      'L2': 'L2 - 标准模式',
      'L3': 'L3 - 企业模式',
    };
    return titleMap[mode] || '未知模式';
  }

  /**
   * 获取模式描述
   */
  function getModeDescription(mode: string) {
    const descMap = {
      'L1': '适合小型项目和快速原型开发，流程简化，快速迭代。',
      'L2': '适合中型项目和团队协作，标准的开发流程和代码审查。',
      'L3': '适合大型项目和企业级开发，完整的GitFlow和CI/CD流程。',
    };
    return descMap[mode] || '未知模式描述';
  }

  /**
   * 获取分支状态颜色
   */
  function getBranchStatusColor(status: string) {
    const colorMap = {
      'active': 'processing',
      'merged': 'success',
      'archived': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取分支状态文本
   */
  function getBranchStatusText(status: string) {
    const textMap = {
      'active': '活跃',
      'merged': '已合并',
      'archived': '已归档',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取活动图标
   */
  function getActivityIcon(type: string) {
    const iconMap = {
      'commit': 'ant-design:code-outlined',
      'merge': 'ant-design:merge-outlined',
      'deploy': 'ant-design:cloud-upload-outlined',
      'tag': 'ant-design:tag-outlined',
    };
    return iconMap[type] || 'ant-design:info-circle-outlined';
  }

  /**
   * 获取部署状态颜色
   */
  function getDeploymentStatusColor(status: string) {
    const colorMap = {
      'success': 'success',
      'failed': 'error',
      'running': 'processing',
      'pending': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取部署状态文本
   */
  function getDeploymentStatusText(status: string) {
    const textMap = {
      'success': '成功',
      'failed': '失败',
      'running': '进行中',
      'pending': '等待中',
    };
    return textMap[status] || '未知';
  }

  /**
   * 格式化时间
   */
  function formatTime(time: string) {
    return formatToDateTime(time);
  }

  /**
   * 格式化最后部署时间
   */
  function formatLastDeployment(value: string) {
    if (!value) return '-';
    const now = new Date();
    const deployTime = new Date(value);
    const diff = now.getTime() - deployTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  }

  /**
   * 更改模式点击
   */
  function handleChangeModeClick() {
    openModeModal(true, {});
  }

  /**
   * 模式更改确认
   */
  async function handleModeChange(mode: string, config: any) {
    try {
      await updateProjectWorkflow({
        projectId: props.projectId,
        mode,
        config,
      });
      
      workflowInfo.mode = mode;
      workflowInfo.config = config;
      
      closeModeModal();
      createMessage.success('开发模式更新成功');
      
      // 重新加载工作流数据
      await loadWorkflowData();
    } catch (error) {
      console.error('更新开发模式失败:', error);
      createMessage.error('更新开发模式失败');
    }
  }

  /**
   * 模式弹窗确认
   */
  function handleModeConfirm() {
    // 由DevelopmentModeSelector组件处理
  }

  /**
   * 查看分支历史
   */
  function handleViewBranchHistory(branch: any) {
    createMessage.info(`查看 ${branch.name} 分支历史`);
  }

  /**
   * 查看部署详情
   */
  function handleViewDeploymentDetail(record: any) {
    createMessage.info(`查看部署详情: ${record.version}`);
  }

  /**
   * 重试部署
   */
  function handleRetryDeployment(record: any) {
    createMessage.info(`重试部署: ${record.version}`);
  }

  /**
   * 回滚部署
   */
  function handleRollback(record: any) {
    createMessage.info(`回滚到版本: ${record.version}`);
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadWorkflowData();
  });
</script>

<style lang="less" scoped>
  .project-workflow {
    .workflow-overview {
      margin-bottom: 24px;

      .overview-card {
        .mode-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .mode-badge {
            flex-shrink: 0;
          }

          .mode-description {
            flex: 1;

            p {
              margin: 0;
              color: #666;
            }
          }

          .mode-actions {
            flex-shrink: 0;
          }
        }
      }
    }

    .branch-strategy-section {
      margin-bottom: 24px;

      .branch-diagram {
        .branch-timeline {
          .branch-line {
            border-left: 2px solid #f0f0f0;
            padding-left: 16px;
            margin-bottom: 24px;
            position: relative;

            &:last-child {
              margin-bottom: 0;
            }

            .branch-header {
              display: flex;
              align-items: center;
              margin-bottom: 12px;

              .branch-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                position: absolute;
                left: -7px;
                top: 6px;
              }

              .branch-info {
                flex: 1;

                .branch-name {
                  font-weight: 600;
                  margin-right: 8px;
                }

                .branch-desc {
                  color: #666;
                  font-size: 13px;
                }
              }

              .branch-status {
                flex-shrink: 0;
              }
            }

            .branch-activities {
              margin-left: 16px;

              .activity-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 13px;

                .activity-icon {
                  width: 16px;
                  height: 16px;
                  margin-right: 8px;
                  color: #666;
                }

                .activity-content {
                  flex: 1;

                  .activity-message {
                    margin-right: 8px;
                  }

                  .activity-time {
                    color: #999;
                    font-size: 12px;
                  }
                }
              }

              .more-activities {
                margin-top: 8px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .pipeline-section {
      .pipeline-overview {
        margin-bottom: 24px;
      }

      .pipeline-stages {
        margin-bottom: 24px;

        h4 {
          margin-bottom: 16px;
        }

        .stages-flow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;

          .pipeline-stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-width: 120px;
            position: relative;

            &.active .stage-icon {
              background: #e6f7ff;
              border-color: #1890ff;
              color: #1890ff;
            }

            &.success .stage-icon {
              background: #f6ffed;
              border-color: #52c41a;
              color: #52c41a;
            }

            &.failed .stage-icon {
              background: #fff2f0;
              border-color: #ff4d4f;
              color: #ff4d4f;
            }

            .stage-icon {
              width: 48px;
              height: 48px;
              border: 2px solid #f0f0f0;
              background: #fafafa;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 8px;
              position: relative;

              .loading-indicator {
                position: absolute;
                top: -2px;
                right: -2px;
              }
            }

            .stage-content {
              .stage-name {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 4px;
              }

              .stage-desc {
                font-size: 12px;
                color: #666;
                line-height: 1.3;
                margin-bottom: 4px;
              }

              .stage-duration {
                font-size: 11px;
                color: #999;
              }
            }

            .stage-connector {
              position: absolute;
              top: 24px;
              left: 100%;
              width: 16px;
              height: 2px;

              .connector-line {
                width: 100%;
                height: 2px;
                background: #f0f0f0;
              }
            }
          }
        }
      }

      .recent-deployments {
        h4 {
          margin-bottom: 16px;
        }
      }
    }
  }
</style>