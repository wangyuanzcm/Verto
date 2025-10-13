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

    <!-- 创建 Jenkins 流水线 Modal（使用 BasicModal 对齐新增配置弹框样式） -->
    <BasicModal
      @register="registerCreateJenkins"
      :title="'创建 Jenkins 流水线'"
      :width="720"
      @ok="submitCreateJenkins"
    >
      <!-- 与配置管理保持一致，使用 BasicForm 构建表单 -->
      <BasicForm @register="registerCreateForm" />
    </BasicModal>

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
      showFooter
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
          v-model:value="currentConfig.content"
        />
      </div>

      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <a-space>
          <a-button @click="handleConfigDrawerClose">取消</a-button>
          <a-button type="primary" @click="handleSaveConfig" :loading="saveLoading">
            {{ isEditMode ? '更新配置' : '提交配置' }}
          </a-button>
          <a-button type="primary" @click="handleCreateJenkinsFromConfig" v-if="!isEditMode">创建 Jenkins 流水线</a-button>
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
  import { useForm } from '/@/components/Form/index';
  import { BasicModal, useModal } from '/@/components/Modal';
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
    createJenkinsPipeline,
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

  // 创建 Jenkins 流水线 Modal（BasicModal + BasicForm）
  const [registerCreateJenkins, { openModal: openCreateJenkinsModal, closeModal: closeCreateJenkinsModal, setModalProps: setCreateJenkinsModalProps }] = useModal();

  const jenkinsFormSchemas: FormSchema[] = [
    {
      field: 'jobName',
      label: '作业名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '例如：my-app-pipeline',
      },
    },
    {
      field: 'useScm',
      label: '使用SCM（Git）拉取 Jenkinsfile',
      component: 'Switch',
      defaultValue: true,
    },
    {
      field: 'repoUrl',
      label: '仓库地址',
      component: 'Input',
      required: true,
      ifShow: ({ model }) => !!model.useScm,
      componentProps: {
        placeholder: 'https://github.com/xxx/xxx.git',
      },
    },
    {
      field: 'branch',
      label: '分支',
      component: 'Input',
      required: true,
      defaultValue: 'main',
      ifShow: ({ model }) => !!model.useScm,
      componentProps: {
        placeholder: 'main',
      },
    },
    {
      field: 'credentialsId',
      label: '凭据ID（可选）',
      component: 'Input',
      ifShow: ({ model }) => !!model.useScm,
      componentProps: {
        placeholder: 'Jenkins 凭据ID',
      },
    },
    {
      field: 'jenkinsfilePath',
      label: 'Jenkinsfile 路径（来自配置管理）',
      helpMessage: '该路径对应配置管理页面中的配置内容',
      component: 'Input',
      required: true,
      defaultValue: 'Jenkinsfile',
      ifShow: ({ model }) => !!model.useScm,
      componentProps: {
        placeholder: '例如：Jenkinsfile',
      },
    },
    {
      field: 'pipelineScript',
      label: '内联流水线脚本',
      component: 'InputTextArea',
      required: true,
      ifShow: ({ model }) => !model.useScm,
      componentProps: {
        rows: 10,
        placeholder: '输入 Jenkins Pipeline 脚本，例如：pipeline { agent any ... }',
      },
    },
  ];

  const [registerCreateForm, { validate: validateJenkinsForm, setFieldsValue: setCreateFormFields, resetFields: resetCreateForm, getFieldsValue: getCreateFormValues }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: jenkinsFormSchemas,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 注：已移除弹框中的“快速填充”选择器，改为仅通过嵌入的配置管理列表进行复制与预填

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
      if (!props.appId) {
        message.warning('缺少应用ID，无法加载运行历史');
        return;
      }

      const resp: any = await getPipelineHistory(props.appId, {
        search: searchText.value,
        status: statusFilter.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        page: historyPagination.current,
        pageSize: historyPagination.pageSize,
      });

      const list = resp?.result?.records || resp?.records || resp?.data || resp?.list || [];
      const total = resp?.result?.total || resp?.total || (Array.isArray(list) ? list.length : 0);
      pipelineHistory.value = (list || []).map((item: any) => ({
        id: item.id || item.historyId || item.buildId || item.jobId,
        pipelineName: item.pipelineName || item.name || item.jobName || item.pipeline || '未命名流水线',
        status: item.status || item.buildStatus || 'unknown',
        commitMessage: item.commitMessage || item.message || '',
        commitHash: item.commitHash || item.sha || '',
        triggeredBy: item.triggeredBy || item.userName || item.triggerUser || '',
        duration: item.duration || (item.endTime && item.startTime ? new Date(item.endTime).getTime() - new Date(item.startTime).getTime() : 0),
        startTime: item.startTime || item.createdAt || item.start || new Date().toISOString(),
      }));
      historyPagination.total = total;
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
      if (!props.appId) {
        message.warning('缺少应用ID，无法加载配置列表');
        return;
      }

      const resp: any = await getPipelineConfig(props.appId);
      const list = resp?.result || resp?.data || resp?.records || resp?.list || [];
      pipelineConfigs.value = (list || []).map((item: any) => {
        const content = item.content || item.config || {};
        const stages = content?.stages || [];
        return {
          id: item.id || item.configId || item.id,
          name: item.name || item.configName || '未命名配置',
          environment: item.environment || item.env || 'dev',
          description: item.description || '',
          status: item.status || (item.enabled ? 'enabled' : 'disabled'),
          stageCount: Array.isArray(stages) ? stages.length : 0,
          updatedTime: item.updatedTime || item.updateTime || item.modifiedAt || item.lastUpdated || new Date().toISOString(),
          config: content,
        };
      });
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
    // 打开配置编辑抽屉（与配置管理编辑抽屉交互形式保持一致）
    isEditMode.value = false;
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
      } as PipelineConfig,
    });
    configDrawerVisible.value = true;
  }

  /**
   * 将内部流水线配置转换为 Jenkins Declarative Pipeline 脚本
   */
  function generateJenkinsfileFromConfig(cfg: PipelineConfig): string {
    const vars = (cfg?.variables || [])
      .map((v) => `    ${v.key} = '${String(v.value ?? '')}'`)
      .join('\n');

    const envBlock = vars ? `  environment {\n${vars}\n  }\n` : '';

    const stages = (cfg?.stages || [])
      .map((s: any) => {
        const script = String(s.script || '').trim();
        const multiline = script.includes('\n');
        const step = multiline
          ? `sh '''\n${script}\n            '''`
          : `sh '${script.replace(/'/g, "'\\''")}'`;
        return [
          `    stage('${s.name || 'Stage'}') {`,
          `      steps {`,
          `        ${step}`,
          `      }`,
          `    }`,
        ].join('\n');
      })
      .join('\n');

    const stagesBlock = stages ? `  stages {\n${stages}\n  }\n` : '';

    const header = `pipeline {\n  agent any\n`;
    const footer = `  // 提示：触发器(triggers)与通知(notifications)未自动映射，请在 Jenkins 中手动完善\n}`;

    return [header, envBlock, stagesBlock, footer].join('');
  }

  /**
   * 从现有配置一键填充到新建 Jenkins 流水线表单
   */
  function handleUseConfigForJenkins(item: any) {
    try {
      const cfg = (item && item.config) as PipelineConfig;
      if (!cfg) {
        message.warning('该配置不包含流水线内容');
        return;
      }

      const script = generateJenkinsfileFromConfig(cfg);
      // 打开弹窗并预填表单
      openCreateJenkinsModal(true);
      setCreateFormFields({
        jobName: item.name || 'new-pipeline-job',
        useScm: false,
        pipelineScript: script,
        repoUrl: '',
        branch: 'main',
        credentialsId: '',
        jenkinsfilePath: 'Jenkinsfile',
      });
      message.success('已根据配置生成 Jenkinsfile 并填充到表单，可继续编辑后提交');
    } catch (e) {
      console.error(e);
      message.error('填充失败，请稍后重试');
    }
  }

  /**
   * 在弹框内一键从选择的配置填充（已移除快速填充入口，保留从配置管理列表复制）
   */
  // function handlePrefillFromSelected() {
  //   // 已废弃：通过弹框中的下拉选择进行快速填充
  // }

  /**
   * 提交创建 Jenkins 流水线
   */
  async function submitCreateJenkins() {
    try {
      const values = await validateJenkinsForm();
      setCreateJenkinsModalProps({ confirmLoading: true });
      const payload = {
        jobName: values.jobName,
        useScm: !!values.useScm,
        repoUrl: values.repoUrl || '',
        branch: values.branch || 'main',
        credentialsId: values.credentialsId || '',
        jenkinsfilePath: values.jenkinsfilePath || 'Jenkinsfile',
        useInlineScript: !values.useScm,
        pipelineScript: values.pipelineScript || '',
      };

      const resp = await createJenkinsPipeline(payload);
      if (resp?.success) {
        message.success('Jenkins 流水线创建成功');
        closeCreateJenkinsModal();
        // 刷新配置/历史
        handleRefresh();
      } else {
        const msg = resp?.message || resp?.error || '创建失败';
        message.error(`创建失败：${msg}`);
      }
    } catch (e) {
      const err = (e as any);
      message.error(`创建失败：${err?.message || err}`);
    } finally {
      setCreateJenkinsModalProps({ confirmLoading: false });
    }
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
  async function handleViewLogs(item: any) {
    try {
      if (!props.appId) {
        message.warning('缺少应用ID，无法获取日志');
        return;
      }
      const resp: any = await getPipelineLogs(props.appId, item.id);
      const logsData = resp?.result || resp?.data || resp || {};
      if (Array.isArray(logsData?.stages)) {
        currentLogs.stages = logsData.stages.map((s: any) => ({
          name: s.name || s.stageName || '阶段',
          logs: s.logs || s.content || '',
        }));
      } else {
        currentLogs.stages = [
          {
            name: '日志',
            logs: typeof logsData === 'string' ? logsData : JSON.stringify(logsData, null, 2),
          },
        ];
      }
      activeLogTab.value = currentLogs.stages[0]?.name || '';
      logModalVisible.value = true;
    } catch (error) {
      message.error('获取运行日志失败');
    }
  }

  /**
   * 重新运行流水线
   */
  async function handleRerun(item: any) {
    try {
      if (!props.appId) {
        message.warning('缺少应用ID，无法重新运行');
        return;
      }
      await rerunPipeline(props.appId, item.id);
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
      if (!props.appId) {
        message.warning('缺少应用ID，无法取消运行');
        return;
      }
      await cancelPipeline(props.appId, item.id);
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
      if (!props.appId) {
        message.warning('缺少应用ID，无法复制配置');
        return;
      }
      const newName = `${item.name}-copy`;
      await copyPipelineConfig(props.appId, item.id, newName);
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
      if (!props.appId) {
        message.warning('缺少应用ID，无法删除配置');
        return;
      }
      await deletePipelineConfig(props.appId, item.id);
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

      if (!props.appId) {
        message.warning('缺少应用ID，无法提交配置');
        return;
      }

      saveLoading.value = true;
      const payload = {
        id: currentConfig.id || undefined,
        name: currentConfig.name,
        environment: currentConfig.environment,
        description: currentConfig.description,
        status: currentConfig.status,
        content: currentConfig.content as PipelineConfig,
      };
      await savePipelineConfig(props.appId, payload);
      message.success(isEditMode.value ? '配置更新成功' : '配置提交成功');
      configDrawerVisible.value = false;
      loadPipelineConfigs();
    } catch (error) {
      message.error(isEditMode.value ? '更新配置失败' : '提交配置失败');
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
   * 从抽屉中的流水线配置创建 Jenkins 流水线
   * 后端会根据 stages、triggers 等自动聚合 Jenkins 配置并创建 Job；
   * 兼容：同时传递生成的 Jenkinsfile 以便后端直接使用（useInlineScript=true）。
   */
  async function handleCreateJenkinsFromConfig() {
    try {
      // 先校验基础信息
      const basicFormValid = await basicFormRef.value?.validate();
      if (!basicFormValid) {
        return;
      }

      const cfg = currentConfig.content as PipelineConfig;
      if (!currentConfig.name) {
        message.warning('请填写配置名称');
        return;
      }

      // 生成 Jenkinsfile（前端兼容方案）
      const script = generateJenkinsfileFromConfig(cfg);

      const payload = {
        jobName: currentConfig.name,
        useScm: false,
        repoUrl: '',
        branch: 'main',
        credentialsId: '',
        jenkinsfilePath: 'Jenkinsfile',
        useInlineScript: true,
        pipelineScript: script,
        // 额外传递原始配置，后端可直接解析聚合
        pipelineConfig: cfg,
        appId: props.appId,
      };

      setCreateJenkinsModalProps({ confirmLoading: true });
      const resp = await createJenkinsPipeline(payload);
      if (resp?.success) {
        message.success('Jenkins 流水线创建成功');
        configDrawerVisible.value = false;
        handleRefresh();
      } else {
        const msg = resp?.message || resp?.error || '创建失败';
        message.error(`创建失败：${msg}`);
      }
    } catch (e: any) {
      console.error(e);
      message.error(`创建失败：${e?.message || '未知错误'}`);
    } finally {
      setCreateJenkinsModalProps({ confirmLoading: false });
    }
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