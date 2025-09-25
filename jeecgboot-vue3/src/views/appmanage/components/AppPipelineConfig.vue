<!--应用流水线配置-->
<template>
  <div class="app-pipeline-config">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-row :gutter="16" align="middle">
        <a-col :span="12">
          <h3>流水线配置</h3>
          <p class="page-description">管理应用的CI/CD流水线配置和运行历史</p>
        </a-col>
        <a-col :span="12" style="text-align: right">
          <a-space>
            <a-button @click="handleRefresh" :loading="loading">
              <template #icon><ReloadOutlined /></template>
              刷新
            </a-button>
            <a-button type="primary" @click="handleCreatePipeline">
              <template #icon><PlusOutlined /></template>
              新建流水线
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-divider />

    <!-- 主要内容区域 -->
    <a-tabs v-model:activeKey="activeTab" type="card">
      <!-- 运行历史 -->
      <a-tab-pane key="history" tab="运行历史">
        <div class="pipeline-history">
          <!-- 搜索和筛选 -->
          <div class="history-toolbar">
            <a-row :gutter="16" align="middle">
              <a-col :span="8">
                <a-input-search
                  v-model:value="searchText"
                  placeholder="搜索流水线名称或提交信息"
                  @search="handleSearch"
                  allow-clear
                />
              </a-col>
              <a-col :span="6">
                <a-select
                  v-model:value="statusFilter"
                  placeholder="筛选状态"
                  allow-clear
                  @change="handleStatusFilter"
                >
                  <a-select-option value="success">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                  <a-select-option value="running">运行中</a-select-option>
                  <a-select-option value="cancelled">已取消</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-range-picker
                  v-model:value="dateRange"
                  @change="handleDateFilter"
                  style="width: 100%"
                />
              </a-col>
              <a-col :span="4">
                <a-button @click="handleClearFilters">清除筛选</a-button>
              </a-col>
            </a-row>
          </div>

          <!-- 运行历史列表 -->
          <div class="history-list">
            <a-list
              :data-source="pipelineHistory"
              :loading="historyLoading"
              item-layout="horizontal"
              :pagination="historyPagination"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a @click="handleViewLogs(item)">查看日志</a>
                    <a @click="handleRerun(item)" v-if="item.status !== 'running'">重新运行</a>
                    <a @click="handleCancel(item)" v-if="item.status === 'running'" style="color: #ff4d4f;">取消</a>
                  </template>

                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: getStatusColor(item.status) }">
                        <template #icon>
                          <CheckCircleOutlined v-if="item.status === 'success'" />
                          <CloseCircleOutlined v-if="item.status === 'failed'" />
                          <LoadingOutlined v-if="item.status === 'running'" />
                          <StopOutlined v-if="item.status === 'cancelled'" />
                        </template>
                      </a-avatar>
                    </template>
                    <template #title>
                      <div class="history-title">
                        <span class="pipeline-name">{{ item.pipelineName }}</span>
                        <a-tag :color="getStatusColor(item.status)" class="status-tag">
                          {{ getStatusText(item.status) }}
                        </a-tag>
                      </div>
                    </template>
                    <template #description>
                      <div class="history-description">
                        <div class="commit-info">
                          <span class="commit-message">{{ item.commitMessage }}</span>
                          <span class="commit-hash">{{ item.commitHash }}</span>
                        </div>
                        <div class="run-info">
                          <span class="trigger-by">触发者: {{ item.triggeredBy }}</span>
                          <span class="run-time">运行时间: {{ formatDuration(item.duration) }}</span>
                          <span class="start-time">开始时间: {{ formatTime(item.startTime) }}</span>
                        </div>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>
      </a-tab-pane>

      <!-- 流水线配置 -->
      <a-tab-pane key="config" tab="流水线配置">
        <div class="pipeline-config">
          <!-- 配置列表 -->
          <div class="config-list">
            <a-list
              :data-source="pipelineConfigs"
              :loading="configLoading"
              item-layout="horizontal"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a @click="handleEditConfig(item)">编辑</a>
                    <a @click="handleCopyConfig(item)">复制</a>
                    <a @click="handleDeleteConfig(item)" style="color: #ff4d4f;">删除</a>
                  </template>

                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar style="background-color: #1890ff;">
                        <template #icon><BranchesOutlined /></template>
                      </a-avatar>
                    </template>
                    <template #title>
                      <div class="config-title">
                        <span class="config-name">{{ item.name }}</span>
                        <a-tag :color="item.status === 'enabled' ? 'green' : 'red'">
                          {{ item.status === 'enabled' ? '启用' : '禁用' }}
                        </a-tag>
                      </div>
                    </template>
                    <template #description>
                      <div class="config-description">
                        <div>{{ item.description || '暂无描述' }}</div>
                        <div class="config-meta">
                          <span>环境: {{ item.environment }}</span>
                          <span>阶段数: {{ item.stageCount }}</span>
                          <span>更新时间: {{ formatTime(item.updatedTime) }}</span>
                        </div>
                      </div>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 配置编辑抽屉 -->
    <BasicDrawer
      v-model:open="configDrawerVisible"
      :title="configDrawerTitle"
      :width="800"
      :mask-closable="false"
      :destroy-on-close="true"
      @close="handleConfigDrawerClose"
      @ok="handleConfigSave"
    >
      <!-- 基础信息表单 -->
      <div class="config-form-section" style="margin-bottom: 16px;">
        <BasicForm
          ref="basicFormRef"
          :schemas="basicFormSchemas"
          :model="currentConfig"
          :label-width="100"
          :show-action-button-group="false"
        />
      </div>

      <!-- 流水线配置编辑器 -->
      <div class="pipeline-editor-section">
        <PipelineConfigEditor
          ref="pipelineEditorRef"
          v-model:config="currentConfig.content"
        />
      </div>

      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <a-space>
          <a-button @click="handleConfigDrawerClose">取消</a-button>
          <a-button type="primary" @click="handleSaveConfig" :loading="saveLoading">
            {{ isEditMode ? '更新' : '保存' }}
          </a-button>
        </a-space>
      </template>
    </BasicDrawer>

    <!-- 日志查看弹窗 -->
    <a-modal
      v-model:open="logModalVisible"
      title="流水线运行日志"
      :width="1000"
      :footer="null"
      :destroy-on-close="true"
    >
      <div class="pipeline-logs">
        <a-tabs v-model:activeKey="activeLogTab">
          <a-tab-pane
            v-for="stage in currentLogs.stages"
            :key="stage.name"
            :tab="stage.name"
          >
            <div class="log-content">
              <pre>{{ stage.logs }}</pre>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import {
    PlusOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    StopOutlined,
    BranchesOutlined,
  } from '@ant-design/icons-vue';
  import { BasicDrawer } from '/@/components/Drawer';
  import { BasicForm, FormSchema } from '/@/components/Form';
  import PipelineConfigEditor from '../config/components/PipelineConfigEditor.vue';
  import type { PipelineConfig } from '../../config/data/Config.data';
  
  // 导入应用管理相关的API
  import {
    getPipelineConfig,
    savePipelineConfig,
    deletePipelineConfig,
    copyPipelineConfig,
    getPipelineHistory,
    rerunPipeline,
    cancelPipeline,
    getPipelineLogs,
  } from '../AppManage.api';

  // 定义Props
  interface Props {
    appId?: string;
    appDetail?: any;
  }

  const props = withDefaults(defineProps<Props>(), {
    appId: '',
  });

  // 响应式数据
  const loading = ref(false);
  const activeTab = ref('history');

  // 运行历史相关
  const historyLoading = ref(false);
  const searchText = ref('');
  const statusFilter = ref<string>();
  const dateRange = ref<[string, string]>();
  const pipelineHistory = ref<any[]>([]);
  const historyPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    onChange: (page: number, size: number) => {
      historyPagination.current = page;
      historyPagination.pageSize = size;
      loadPipelineHistory();
    },
  });

  // 配置管理相关
  const configLoading = ref(false);
  const pipelineConfigs = ref<any[]>([]);
  const configDrawerVisible = ref(false);
  const isEditMode = ref(false);
  const saveLoading = ref(false);
  const basicFormRef = ref();
  const pipelineEditorRef = ref();
  const currentConfig = reactive({
    id: '',
    name: '',
    environment: 'dev',
    description: '',
    status: 'enabled',
    content: {
      stages: [],
      triggers: [],
      variables: [],
      notifications: [],
    } as PipelineConfig,
  });

  // 基础表单配置
  const basicFormSchemas: FormSchema[] = [
    {
      field: 'name',
      label: '配置名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入配置名称',
      },
    },
    {
      field: 'environment',
      label: '环境',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择环境',
        options: [
          { label: '开发环境', value: 'dev' },
          { label: '测试环境', value: 'test' },
          { label: '预发布环境', value: 'staging' },
          { label: '生产环境', value: 'prod' },
        ],
      },
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入配置描述',
        rows: 3,
      },
    },
    {
      field: 'status',
      label: '状态',
      component: 'RadioGroup',
      defaultValue: 'enabled',
      componentProps: {
        options: [
          { label: '启用', value: 'enabled' },
          { label: '禁用', value: 'disabled' },
        ],
      },
    },
  ];

  // 日志查看相关
  const logModalVisible = ref(false);
  const activeLogTab = ref('');
  const currentLogs = reactive({
    stages: [] as any[],
  });

  // 计算属性
  const configDrawerTitle = computed(() => {
    return isEditMode.value ? '编辑流水线配置' : '新建流水线配置';
  });

  // 生命周期
  onMounted(() => {
    loadPipelineHistory();
    loadPipelineConfigs();
  });

  /**
   * 加载流水线运行历史
   */
  async function loadPipelineHistory() {
    try {
      historyLoading.value = true;
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 模拟数据
      pipelineHistory.value = [
        {
          id: '1',
          pipelineName: '主分支构建',
          status: 'success',
          commitMessage: 'feat: 添加用户管理功能',
          commitHash: 'a1b2c3d',
          triggeredBy: '张三',
          duration: 180000, // 3分钟
          startTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          pipelineName: '测试环境部署',
          status: 'running',
          commitMessage: 'fix: 修复登录问题',
          commitHash: 'e4f5g6h',
          triggeredBy: '李四',
          duration: 120000, // 2分钟
          startTime: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          pipelineName: '生产环境部署',
          status: 'failed',
          commitMessage: 'refactor: 重构数据库连接',
          commitHash: 'i7j8k9l',
          triggeredBy: '王五',
          duration: 300000, // 5分钟
          startTime: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      
      historyPagination.total = pipelineHistory.value.length;
    } catch (error) {
      message.error('加载运行历史失败');
    } finally {
      historyLoading.value = false;
    }
  }

  /**
   * 加载流水线配置列表
   */
  async function loadPipelineConfigs() {
    try {
      configLoading.value = true;
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // 模拟数据
      pipelineConfigs.value = [
        {
          id: '1',
          name: '主分支构建流水线',
          environment: 'prod',
          description: '用于主分支的自动构建和部署',
          status: 'enabled',
          stageCount: 4,
          updatedTime: new Date(Date.now() - 86400000).toISOString(),
          config: {
            stages: [
              {
                id: '1',
                name: '代码检出',
                type: 'checkout',
                environment: 'prod',
                timeout: 5,
                retryCount: 1,
                script: 'git checkout main',
              },
              {
                id: '2',
                name: '构建',
                type: 'build',
                environment: 'prod',
                timeout: 30,
                retryCount: 2,
                script: 'npm run build',
              },
            ],
            triggers: [
              {
                id: '1',
                type: 'push',
                branches: ['main'],
              },
            ],
            variables: [
              {
                id: '1',
                key: 'NODE_ENV',
                value: 'production',
                description: '环境变量',
              },
            ],
            notifications: [
              {
                id: '1',
                type: 'email',
                recipients: ['admin@example.com'],
                events: ['success', 'failed'],
              },
            ],
          },
        },
        {
          id: '2',
          name: '测试环境流水线',
          environment: 'test',
          description: '用于测试环境的自动化测试和部署',
          status: 'enabled',
          stageCount: 3,
          updatedTime: new Date(Date.now() - 172800000).toISOString(),
          config: {
            stages: [
              {
                id: '1',
                name: '单元测试',
                type: 'test',
                environment: 'test',
                timeout: 15,
                retryCount: 1,
                script: 'npm test',
              },
            ],
            triggers: [
              {
                id: '1',
                type: 'push',
                branches: ['develop'],
              },
            ],
            variables: [],
            notifications: [],
          },
        },
      ];
    } catch (error) {
      message.error('加载配置列表失败');
    } finally {
      configLoading.value = false;
    }
  }

  /**
   * 刷新数据
   */
  function handleRefresh() {
    if (activeTab.value === 'history') {
      loadPipelineHistory();
    } else {
      loadPipelineConfigs();
    }
  }

  /**
   * 创建新流水线
   */
  function handleCreatePipeline() {
    isEditMode.value = false;
    // 重置表单数据
    Object.assign(currentConfig, {
      id: '',
      name: '',
      environment: 'dev',
      description: '',
      status: 'enabled',
      content: {
        stages: [],
        triggers: [],
        variables: [],
        notifications: [],
      },
    });
    configDrawerVisible.value = true;
  }

  /**
   * 搜索运行历史
   */
  function handleSearch(value: string) {
    console.log('搜索:', value);
    loadPipelineHistory();
  }

  /**
   * 状态筛选
   */
  function handleStatusFilter(value: string) {
    console.log('状态筛选:', value);
    loadPipelineHistory();
  }

  /**
   * 日期筛选
   */
  function handleDateFilter(dates: [string, string]) {
    console.log('日期筛选:', dates);
    loadPipelineHistory();
  }

  /**
   * 清除筛选条件
   */
  function handleClearFilters() {
    searchText.value = '';
    statusFilter.value = undefined;
    dateRange.value = undefined;
    loadPipelineHistory();
  }

  /**
   * 查看运行日志
   */
  function handleViewLogs(item: any) {
    // 模拟日志数据
    currentLogs.stages = [
      {
        name: '构建',
        logs: `[2024-01-20 10:00:00] 开始构建阶段
[2024-01-20 10:00:01] 拉取代码: ${item.commitHash}
[2024-01-20 10:00:05] 安装依赖...
[2024-01-20 10:01:30] 编译项目...
[2024-01-20 10:02:45] 构建完成`,
      },
      {
        name: '测试',
        logs: `[2024-01-20 10:02:46] 开始测试阶段
[2024-01-20 10:02:47] 运行单元测试...
[2024-01-20 10:03:15] 测试通过: 95/100
[2024-01-20 10:03:16] 生成测试报告...
[2024-01-20 10:03:20] 测试完成`,
      },
      {
        name: '部署',
        logs: `[2024-01-20 10:03:21] 开始部署阶段
[2024-01-20 10:03:22] 构建Docker镜像...
[2024-01-20 10:04:10] 推送到镜像仓库...
[2024-01-20 10:04:45] 更新Kubernetes配置...
[2024-01-20 10:05:00] 部署完成`,
      },
    ];
    
    activeLogTab.value = currentLogs.stages[0]?.name || '';
    logModalVisible.value = true;
  }

  /**
   * 重新运行流水线
   */
  async function handleRerun(item: any) {
    try {
      message.loading('正在重新运行流水线...', 2);
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('流水线已重新启动');
      loadPipelineHistory();
    } catch (error) {
      message.error('重新运行失败');
    }
  }

  /**
   * 取消运行
   */
  async function handleCancel(item: any) {
    try {
      message.loading('正在取消运行...', 2);
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('已取消运行');
      loadPipelineHistory();
    } catch (error) {
      message.error('取消运行失败');
    }
  }

  /**
   * 编辑配置
   */
  function handleEditConfig(item: any) {
    isEditMode.value = true;
    Object.assign(currentConfig, {
      id: item.id,
      name: item.name,
      environment: item.environment,
      description: item.description,
      status: item.status,
      content: item.config,
    });
    configDrawerVisible.value = true;
  }

  /**
   * 复制配置
   */
  async function handleCopyConfig(item: any) {
    try {
      message.loading('正在复制配置...', 1);
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('配置已复制');
      loadPipelineConfigs();
    } catch (error) {
      message.error('复制配置失败');
    }
  }

  /**
   * 删除配置
   */
  async function handleDeleteConfig(item: any) {
    try {
      message.loading('正在删除配置...', 1);
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('配置已删除');
      loadPipelineConfigs();
    } catch (error) {
      message.error('删除配置失败');
    }
  }

  /**
   * 关闭配置抽屉
   */
  function handleConfigDrawerClose() {
    configDrawerVisible.value = false;
  }

  /**
   * 保存配置
   */
  async function handleConfigSave() {
    try {
      // 验证基础表单
      const basicFormValid = await basicFormRef.value?.validate();
      if (!basicFormValid) {
        return;
      }

      saveLoading.value = true;
      message.loading(isEditMode.value ? '正在更新配置...' : '正在保存配置...', 2);
      
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success(isEditMode.value ? '配置更新成功' : '配置保存成功');
      configDrawerVisible.value = false;
      loadPipelineConfigs();
    } catch (error) {
      message.error(isEditMode.value ? '更新配置失败' : '保存配置失败');
    } finally {
      saveLoading.value = false;
    }
  }

  /**
   * 保存配置（别名方法）
   */
  function handleSaveConfig() {
    handleConfigSave();
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      success: '#52c41a',
      failed: '#ff4d4f',
      running: '#1890ff',
      cancelled: '#d9d9d9',
    };
    return colorMap[status] || '#d9d9d9';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      success: '成功',
      failed: '失败',
      running: '运行中',
      cancelled: '已取消',
    };
    return textMap[status] || '未知';
  }

  /**
   * 格式化持续时间
   */
  function formatDuration(duration: number): string {
    if (!duration) return '0秒';
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
  }

  /**
   * 格式化时间
   */
  function formatTime(time: string): string {
    if (!time) return '';
    return new Date(time).toLocaleString('zh-CN');
  }
</script>

<style lang="less" scoped>
  .app-pipeline-config {
    padding: 16px;
    background: #fff;
    border-radius: 6px;

    .page-header {
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #262626;
      }

      .page-description {
        margin: 4px 0 0 0;
        color: #8c8c8c;
        font-size: 14px;
      }
    }

    .history-toolbar {
      margin-bottom: 16px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
    }

    .history-list {
      .history-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .pipeline-name {
          font-weight: 500;
        }

        .status-tag {
          font-size: 12px;
        }
      }

      .history-description {
        .commit-info {
          margin-bottom: 4px;

          .commit-message {
            margin-right: 12px;
          }

          .commit-hash {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            color: #8c8c8c;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
          }
        }

        .run-info {
          font-size: 12px;
          color: #8c8c8c;

          span {
            margin-right: 16px;
          }
        }
      }
    }

    .config-list {
      .config-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .config-name {
          font-weight: 500;
        }
      }

      .config-description {
        .config-meta {
          margin-top: 4px;
          font-size: 12px;
          color: #8c8c8c;

          span {
            margin-right: 16px;
          }
        }
      }
    }

    .config-form-section {
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 16px;
    }

    .pipeline-editor-section {
      margin-top: 16px;
    }

    .pipeline-logs {
      .log-content {
        background: #001529;
        color: #fff;
        padding: 16px;
        border-radius: 6px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.5;
        max-height: 400px;
        overflow-y: auto;

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }
</style>