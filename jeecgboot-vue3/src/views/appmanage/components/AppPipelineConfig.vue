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

      <!-- 可选：从配置管理复制内容并回填（仅在“新建”模式显示，值不入库） -->
      <div class="config-prefill-section" v-if="!isEditMode" style="margin: -8px 0 16px 0;">
        <a-form layout="vertical">
          <a-form-item label="从已有配置复制">
            <a-select
              v-model:value="selectedConfigId"
              :options="prefillOptions"
              placeholder="选择已有配置进行快速填充（可选）"
              allow-clear
              show-search
              :filter-option="filterOption"
              style="min-width: 380px"
              @change="onSelectExistingConfig"
            />
          </a-form-item>
        </a-form>
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
    <a-button type="primary" @click="handleCreateJenkinsFromConfig" :loading="saveLoading">
      创建流水线
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
    QuestionCircleOutlined,
  } from '@ant-design/icons-vue';
  import { BasicDrawer } from '/@/components/Drawer';
  import { BasicForm, FormSchema } from '/@/components/Form';
  import { useForm } from '/@/components/Form/index';
  import { BasicModal, useModal } from '/@/components/Modal';
  import PipelineConfigEditor from '../config/components/PipelineConfigEditor.vue';
  import type { PipelineConfig } from '../../config/data/Config.data';
  
  // 导入应用管理相关的API
  import {
    // getPipelineConfig, // 移除，改用配置管理列表接口
    savePipelineConfig,
    deletePipelineConfig,
    copyPipelineConfig,
    getPipelineHistory,
    rerunPipeline,
    cancelPipeline,
    getPipelineLogs,
    createJenkinsPipeline,
  } from '../AppManage.api';
  // 新增：引入配置管理列表接口，用于下拉展示已有的流水线配置
  import { getConfigList } from '../config/api/Config.api';

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

  // 新增：可选下拉的选中值（不入库，仅用于回填）
  const selectedConfigId = ref<string | undefined>();
  const prefillOptions = computed(() =>
    (pipelineConfigs.value || []).map((pc: any) => ({
      label: `${pc.name}（环境：${pc.environment}，阶段数：${pc.stageCount}）`,
      value: pc.id,
    }))
  );
  function filterOption(input: string, option: any) {
    return String(option?.label || '')
      .toLowerCase()
      .includes(String(input || '').toLowerCase());
  }
  function onSelectExistingConfig(value?: string) {
    if (!value) return;
    const item = (pipelineConfigs.value || []).find((pc: any) => pc.id === value);
    if (!item || !item.config) {
      message.warning('该配置不包含流水线内容');
      return;
    }
    try {
      const copied: PipelineConfig = JSON.parse(JSON.stringify(item.config || {}));
      // 仅回填 content，不修改基础信息表单（名称/环境等由用户自行填写）
      currentConfig.content = copied;
      message.success('已复制配置内容到当前表单，可继续编辑');
    } catch (e) {
      console.error(e);
      message.error('复制回填失败，请稍后重试');
    }
  }

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

  // 新增：基础信息表单Schema
  const basicFormSchemas: FormSchema[] = [
    {
      field: 'name',
      label: '配置名称',
      component: 'Input',
      required: true,
      componentProps: { placeholder: '例如：默认流水线' },
    },
    {
      field: 'environment',
      label: '环境',
      component: 'Select',
      required: true,
      defaultValue: 'dev',
      componentProps: {
        options: [
          { label: '开发(dev)', value: 'dev' },
          { label: '测试(test)', value: 'test' },
          { label: '生产(prod)', value: 'prod' },
        ],
      },
    },
    {
      field: 'status',
      label: '状态',
      component: 'Select',
      required: true,
      defaultValue: 'enabled',
      componentProps: {
        options: [
          { label: '启用', value: 'enabled' },
          { label: '禁用', value: 'disabled' },
        ],
      },
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputTextArea',
      componentProps: { rows: 3, placeholder: '该配置的简介（可选）' },
    },
  ];

  // 抽屉标题
  const configDrawerTitle = computed(() => (isEditMode.value ? '编辑流水线配置' : '新建流水线配置'));

  // 运行历史工具函数
  function getStatusColor(status: string) {
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'cancelled':
        return 'orange';
      default:
        return 'default';
    }
  }
  function getStatusText(status: string) {
    const map: Record<string, string> = {
      success: '成功',
      failed: '失败',
      running: '运行中',
      cancelled: '已取消',
    };
    return map[status] || status;
  }
  function formatDuration(ms: number) {
    if (!ms && ms !== 0) return '-';
    const sec = Math.round(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}分${s}秒`;
  }
  function formatTime(ts: string | number | Date) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '-';
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // 日志弹窗相关
  const logModalVisible = ref(false);
  const activeLogTab = ref<string>('');
  const currentLogs = reactive<{ stages: Array<{ name: string; logs: string }> }>({ stages: [] });

  // 加载配置列表
  async function loadPipelineConfigs() {
    try {
      configLoading.value = true;
      // 改为调用配置管理的列表接口，筛选 type=pipeline
      const res = await getConfigList({ type: 'pipeline', pageNo: 1, pageSize: 100 });
      const records = Array.isArray((res as any)?.records)
        ? (res as any).records
        : Array.isArray((res as any)?.result?.records)
        ? (res as any).result.records
        : [];
      // 统一处理 config 字段为对象，并计算阶段数量用于展示
      pipelineConfigs.value = records.map((r: any) => {
        let cfg: any = r?.config;
        if (typeof cfg === 'string') {
          try {
            cfg = JSON.parse(cfg || '{}');
          } catch (e) {
            cfg = {};
          }
        }
        const stages = Array.isArray(cfg?.stages) ? cfg.stages : [];
        return {
          id: r.id,
          name: r.name,
          environment: r.environment,
          stageCount: stages.length,
          config: cfg,
        };
      });
    } catch (e) {
      console.error(e);
      message.error('加载配置列表失败');
      pipelineConfigs.value = [];
    } finally {
      configLoading.value = false;
    }
  }

  // 加载运行历史（占位实现）
  async function loadPipelineHistory() {
    try {
      historyLoading.value = true;
      // 可根据 appId 与筛选参数调用 getPipelineHistory
      // 这里简化为占位实现
      // const res = await getPipelineHistory({ appId: props.appId, ... });
      // pipelineHistory.value = Array.isArray(res) ? res : [];
      pipelineHistory.value = [];
    } catch (e) {
      console.error(e);
      message.error('加载运行历史失败');
    } finally {
      historyLoading.value = false;
    }
  }

  // 顶部刷新按钮
  async function handleRefresh() {
    await Promise.all([loadPipelineConfigs(), loadPipelineHistory()]);
    message.success('已刷新');
  }

  // 历史筛选（占位实现）
  function handleSearch() {
    loadPipelineHistory();
  }
  function handleStatusFilter() {
    loadPipelineHistory();
  }
  function handleDateFilter() {
    loadPipelineHistory();
  }
  function handleClearFilters() {
    searchText.value = '';
    statusFilter.value = undefined;
    dateRange.value = undefined as any;
    loadPipelineHistory();
  }

  // 查看日志（占位实现）
  async function handleViewLogs(item: any) {
    try {
      const res = await getPipelineLogs(item?.id);
      const stages = Array.isArray(res?.stages) ? res.stages : [];
      currentLogs.stages = stages.map((s: any) => ({ name: s?.name || '阶段', logs: String(s?.logs || '') }));
      activeLogTab.value = currentLogs.stages[0]?.name || '';
      logModalVisible.value = true;
    } catch (e) {
      console.error(e);
      message.error('获取日志失败');
    }
  }

  async function handleRerun(item: any) {
    try {
      await rerunPipeline(item?.id);
      message.success('已触发重新运行');
      loadPipelineHistory();
    } catch (e) {
      console.error(e);
      message.error('重新运行失败');
    }
  }

  async function handleCancel(item: any) {
    try {
      await cancelPipeline(item?.id);
      message.success('已取消运行');
      loadPipelineHistory();
    } catch (e) {
      console.error(e);
      message.error('取消失败');
    }
  }

  // 新建流水线：打开抽屉
  function handleCreatePipeline() {
    isEditMode.value = false;
    selectedConfigId.value = undefined;
    // 重置当前配置
    currentConfig.id = '';
    currentConfig.name = '';
    currentConfig.environment = 'dev';
    currentConfig.description = '';
    currentConfig.status = 'enabled';
    currentConfig.content = {
      stages: [],
      triggers: [],
      variables: [],
      notifications: [],
    } as PipelineConfig;
    configDrawerVisible.value = true;
  }

  // 编辑配置：打开抽屉并回填
  function handleEditConfig(item: any) {
    isEditMode.value = true;
    selectedConfigId.value = undefined;
    currentConfig.id = item?.id ?? '';
    currentConfig.name = item?.name ?? '';
    currentConfig.environment = item?.environment ?? 'dev';
    currentConfig.description = item?.description ?? '';
    currentConfig.status = item?.status ?? 'enabled';
    currentConfig.content = item?.config ?? {
      stages: [],
      triggers: [],
      variables: [],
      notifications: [],
    };
    configDrawerVisible.value = true;
  }

  // 删除配置（占位实现）
  async function handleDeleteConfig(item: any) {
    try {
      await deletePipelineConfig(item?.id);
      message.success('已删除配置');
      loadPipelineConfigs();
    } catch (e) {
      console.error(e);
      message.error('删除失败');
    }
  }

  // 抽屉关闭
  function handleConfigDrawerClose() {
    configDrawerVisible.value = false;
  }

  // 抽屉保存（与 savePipelineConfig 对接）
  async function handleConfigSave() {
    try {
      saveLoading.value = true;
      const configPayload: any = {
        id: currentConfig.id,
        name: currentConfig.name,
        environment: currentConfig.environment,
        description: currentConfig.description,
        status: currentConfig.status,
        config: currentConfig.content,
      };
      await savePipelineConfig(props.appId, configPayload);
      message.success('配置保存成功');
      configDrawerVisible.value = false;
      await loadPipelineConfigs();
    } catch (e) {
      console.error(e);
      message.error('保存失败，请稍后重试');
    } finally {
      saveLoading.value = false;
    }
  }

  // 将 PipelineConfig 转换为 Jenkins Declarative Pipeline 内联脚本
  function buildInlineJenkinsScriptFromConfig(cfg: PipelineConfig): string {
    const envLines = (cfg.variables || [])
      .filter((v: any) => v && v.name)
      .map((v: any) => `      ${v.name} = '${String(v.value ?? '')}'`)
      .join('\n');

    const stageBlocks = (cfg.stages || []).map((s: any) => {
      const hasImage = !!s.image;
      const agentBlock = hasImage
        ? `        agent { docker { image '${s.image}' } }\n`
        : '';
      const timeoutBlock = s.timeout
        ? `        options { timeout(time: ${s.timeout}, unit: 'SECONDS') }\n`
        : '';
      const stepsScript = (s.script || '').trim() || 'echo "No script defined"';
      return [
        `    stage('${s.name || s.id || 'stage'}') {`,
        agentBlock ? agentBlock.trimEnd() : '',
        timeoutBlock ? timeoutBlock.trimEnd() : '',
        '        steps {',
        `          sh '''`,
        `            ${stepsScript}`,
        `          '''`,
        '        }',
        '    }',
      ].filter(Boolean).join('\n');
    }).join('\n');

    const pipeline = [
      'pipeline {',
      '  agent any',
      envLines ? '  environment {\n' + envLines + '\n  }' : '',
      '  stages {',
      stageBlocks,
      '  }',
      '}'
    ].filter(Boolean).join('\n');

    return pipeline;
  }

  // 从当前配置直接创建 Jenkins 作业（内联脚本模式），并保存到应用流水线配置
  async function handleCreateJenkinsFromConfig() {
    try {
      saveLoading.value = true;

      // 1) 构建 Jenkins 内联脚本
      const script = buildInlineJenkinsScriptFromConfig(currentConfig.content as PipelineConfig);

      // 2) 生成 Job 名称（优先使用配置名称；否则基于应用名兜底）
      const appName = (props.appDetail?.basicInfo?.name || props.appDetail?.name || 'app');
      const jobName = (currentConfig.name && currentConfig.name.trim()) ? currentConfig.name.trim() : `${appName}-pipeline`;

      // 3) 后台创建 Jenkins Job（内联脚本模式）
      const createPayload = {
        jobName,
        useScm: false,
        useInlineScript: true,
        pipelineScript: script,
      };
      const resp = await createJenkinsPipeline(createPayload);

      // 4) 将 Jenkins 作业信息写入到当前配置，并保存到数据库
      const jenkinsMeta: any = {
        jobName,
        mode: 'inlineScript',
        jobUrl: resp?.data?.jobUrl || resp?.jobUrl || undefined,
      };

      const configPayload: any = {
        id: currentConfig.id,
        name: jobName,
        environment: currentConfig.environment,
        description: currentConfig.description,
        status: currentConfig.status,
        config: {
          ...(currentConfig.content as any),
          jenkins: jenkinsMeta,
        },
      };
      await savePipelineConfig(props.appId, configPayload);

      message.success('Jenkins 流水线已创建，并已保存到应用流水线配置');
      configDrawerVisible.value = false;
      await loadPipelineConfigs();
    } catch (e) {
      console.error(e);
      message.error('创建流水线失败，请稍后重试');
    } finally {
      saveLoading.value = false;
    }
  }

  // 初始加载
  onMounted(() => {
    handleRefresh();
  });
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