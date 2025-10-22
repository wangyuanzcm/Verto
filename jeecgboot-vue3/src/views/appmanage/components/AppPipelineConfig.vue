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
            <a-button type="default" @click="openBindDrawer"> 绑定流水线 </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <!-- 创建 Jenkins 流水线 Modal（使用 BasicModal 对齐新增配置弹框样式） -->
    <BasicModal @register="registerCreateJenkins" :title="'创建 Jenkins 流水线'" :width="720" @ok="submitCreateJenkins">
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
                <a-input-search v-model:value="searchText" placeholder="搜索流水线名称或提交信息" @search="handleSearch" allow-clear />
              </a-col>
              <a-col :span="6">
                <a-select v-model:value="statusFilter" placeholder="筛选状态" allow-clear @change="handleStatusFilter">
                  <a-select-option value="success">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                  <a-select-option value="running">运行中</a-select-option>
                  <a-select-option value="cancelled">已取消</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="6">
                <a-range-picker v-model:value="dateRange" @change="handleDateFilter" style="width: 100%" />
              </a-col>
              <a-col :span="4">
                <a-button @click="handleClearFilters">清除筛选</a-button>
              </a-col>
            </a-row>
          </div>

          <!-- 运行历史列表 -->
          <div class="history-list">
            <a-list :data-source="pipelineHistory" :loading="historyLoading" item-layout="horizontal" :pagination="historyPagination">
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a @click="handleViewLogs(item)">查看日志</a>
                    <a @click="handleRerun(item)" v-if="item.status !== 'running'">重新运行</a>
                    <a @click="handleCancel(item)" v-if="item.status === 'running'" style="color: #ff4d4f">取消</a>
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
            <a-list :data-source="pipelineConfigs" :loading="configLoading" item-layout="horizontal">
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a @click="handleEditConfig(item)">编辑</a>
                    <a @click="handleDeleteConfig(item)" style="color: #ff4d4f">删除</a>
                  </template>

                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar style="background-color: #1890ff">
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

      <!-- 新增：Jenkins 流水线绑定展示 -->
      <a-tab-pane key="jenkins" tab="Jenkins流水线">
        <div class="jenkins-bind-list">
          <a-list :data-source="jenkinsBindings" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a @click="editBinding(item)">编辑绑定</a>
                  <a @click="unbindJenkins(item)" style="color: #ff4d4f">解除绑定</a>
                </template>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar style="background-color: #722ed1">
                      <template #icon><BranchesOutlined /></template>
                    </a-avatar>
                  </template>
                  <template #title>
                    <div class="binding-title">
                      <span class="config-name">{{ item.configName }}</span>
                      <a-tag color="blue" style="margin-left: 8px">{{ item.jenkins.jobName }}</a-tag>
                    </div>
                  </template>
                  <template #description>
                    <div class="binding-desc">
                      <div>环境: {{ item.environment || '-' }}</div>
                      <div
                        >Jenkins URL: <a :href="item.jenkins.jobUrl" target="_blank">{{ item.jenkins.jobUrl || '-' }}</a></div
                      >
                      <div
                        >参数映射: BRANCH={{ item.jenkins.params?.branch || 'BRANCH' }}, COMMIT={{ item.jenkins.params?.commit || 'COMMIT' }},
                        VERSION={{ item.jenkins.params?.version || 'VERSION' }}</div
                      >
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <div v-if="!jenkinsBindings.length" style="text-align: center; color: #888; padding: 16px 0"
            >暂无绑定的 Jenkins 流水线，请点击右上角“绑定流水线”进行配置</div
          >
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
      <div class="config-form-section" style="margin-bottom: 16px">
        <BasicForm ref="basicFormRef" :schemas="basicFormSchemas" :model="currentConfig" :label-width="100" :show-action-button-group="false" />
      </div>

      <!-- 可选：从配置管理复制内容并回填（仅在“新建”模式显示，值不入库） -->
      <div class="config-prefill-section" v-if="!isEditMode" style="margin: -8px 0 16px 0">
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
        <PipelineConfigEditor ref="pipelineEditorRef" v-model:value="currentConfig.content" />
      </div>

      <!-- 抽屉底部操作按钮 -->
      <template #footer>
        <a-space>
          <a-button @click="handleConfigDrawerClose">取消</a-button>
          <a-button type="primary" @click="handleCreateJenkinsFromConfig" :loading="saveLoading"> 创建流水线 </a-button>
        </a-space>
      </template>
    </BasicDrawer>

    <!-- 新增：绑定 Jenkins 流水线抽屉 -->
    <BasicDrawer
      v-model:open="bindDrawerVisible"
      :title="'绑定 Jenkins 流水线'"
      :width="600"
      showFooter
      :mask-closable="false"
      :destroy-on-close="true"
    >
      <BasicForm @register="registerBindForm" />
      <template #footer>
        <a-space>
          <a-button @click="bindDrawerVisible = false">取消</a-button>
          <a-button type="primary" :loading="bindSubmitting" @click="submitBindJenkins">保存绑定</a-button>
        </a-space>
      </template>
    </BasicDrawer>

    <!-- 日志查看弹窗 -->
    <a-modal v-model:open="logModalVisible" title="流水线运行日志" :width="1000" :footer="null" :destroy-on-close="true">
      <div class="pipeline-logs">
        <a-tabs v-model:activeKey="activeLogTab">
          <a-tab-pane v-for="stage in currentLogs.stages" :key="stage.name" :tab="stage.name">
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
  const [
    registerCreateJenkins,
    { openModal: openCreateJenkinsModal, closeModal: closeCreateJenkinsModal, setModalProps: setCreateJenkinsModalProps },
  ] = useModal();

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

  const [
    registerCreateForm,
    { validate: validateJenkinsForm, setFieldsValue: setCreateFormFields, resetFields: resetCreateForm, getFieldsValue: getCreateFormValues },
  ] = useForm({
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

  // 可选下拉的选中值（不入库，仅用于回填）
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
    },
  }) as PipelineConfig;
  configDrawerVisible.value = true;

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

    const stageBlocks = (cfg.stages || [])
      .map((s: any) => {
        const hasImage = !!s.image;
        const agentBlock = hasImage ? `        agent { docker { image '${s.image}' } }\n` : '';
        const timeoutBlock = s.timeout ? `        options { timeout(time: ${s.timeout}, unit: 'SECONDS') }\n` : '';
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
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n');

    const pipeline = ['pipeline {', '  agent any', envLines ? '  environment {\n' + envLines + '\n  }' : '', '  stages {', stageBlocks, '  }', '}']
      .filter(Boolean)
      .join('\n');

    return pipeline;
  }

  // 从当前配置直接创建 Jenkins 作业（内联脚本模式），并保存到应用流水线配置
  async function handleCreateJenkinsFromConfig() {
    try {
      saveLoading.value = true;

      // 1) 构建 Jenkins 内联脚本
      const script = buildInlineJenkinsScriptFromConfig(currentConfig.content as PipelineConfig);

      // 2) 生成 Job 名称（优先使用配置名称；否则基于应用名兜底）
      const appName = props.appDetail?.basicInfo?.name || props.appDetail?.name || 'app';
      const jobName = currentConfig.name && currentConfig.name.trim() ? currentConfig.name.trim() : `${appName}-pipeline`;

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

  // 绑定 Jenkins 流水线抽屉 & 表单
  const bindDrawerVisible = ref(false);
  const bindSubmitting = ref(false);
  const bindFormSchemas: FormSchema[] = [
    {
      field: 'pipelineConfigId',
      label: '选择配置',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择需要绑定的流水线配置',
        // 注意：a-select 的 options 需要是数组，不能是函数或 Ref
        options: [],
      },
    },
    {
      field: 'jobName',
      label: 'Jenkins 作业名',
      component: 'Input',
      required: true,
      componentProps: { placeholder: '例如：my-app-pipeline' },
    },
    {
      field: 'jobUrl',
      label: 'Jenkins 作业URL',
      component: 'Input',
      componentProps: { placeholder: '例如：http://jenkins/job/my-app-pipeline/' },
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
      field: 'branchParam',
      label: '分支参数名',
      component: 'Input',
      defaultValue: 'BRANCH',
      helpMessage: 'Jenkins Job中对应的参数名称，用于传递分支',
    },
    {
      field: 'commitParam',
      label: '提交ID参数名',
      component: 'Input',
      defaultValue: 'COMMIT',
      helpMessage: 'Jenkins Job中对应的参数名称，用于传递提交ID',
    },
    {
      field: 'versionParam',
      label: '版本号参数名',
      component: 'Input',
      defaultValue: 'VERSION',
      helpMessage: 'Jenkins Job中对应的参数名称，用于传递版本号',
    },
  ];

  const [
    registerBindForm,
    { getFieldsValue: getBindFormValues, setFieldsValue: setBindFormValues, resetFields: resetBindForm, validate: validateBindForm, updateSchema },
  ] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    showActionButtonGroup: false,
    schemas: bindFormSchemas,
  });

  const jenkinsBindings = computed(() => {
    return (pipelineConfigs.value || [])
      .filter((pc: any) => pc?.config && pc?.config?.jenkins && pc?.config?.jenkins?.jobName)
      .map((pc: any) => ({
        configId: pc.id,
        configName: pc.name,
        environment: pc.environment,
        jenkins: pc.config.jenkins,
      }));
  });

  function openBindDrawer() {
    // 重置表单并打开抽屉
    resetBindForm();
    // 将当前的配置列表写入到 Select 的 options（必须是数组）
    const opts = (pipelineConfigs.value || []).map((pc: any) => ({ label: pc.name, value: pc.id }));
    updateSchema([
      {
        field: 'pipelineConfigId',
        componentProps: { options: opts },
      },
    ]);
    bindDrawerVisible.value = true;
  }

  function editBinding(item: any) {
    setBindFormValues({
      pipelineConfigId: item.configId,
      jobName: item.jenkins?.jobName,
      jobUrl: item.jenkins?.jobUrl,
      environment: item.environment || 'dev',
      branchParam: item.jenkins?.params?.branch || 'BRANCH',
      commitParam: item.jenkins?.params?.commit || 'COMMIT',
      versionParam: item.jenkins?.params?.version || 'VERSION',
    });
    // 同步 options，避免首次进入时为空
    const opts = (pipelineConfigs.value || []).map((pc: any) => ({ label: pc.name, value: pc.id }));
    updateSchema([
      {
        field: 'pipelineConfigId',
        componentProps: { options: opts },
      },
    ]);
    bindDrawerVisible.value = true;
  }

  async function submitBindJenkins() {
    try {
      bindSubmitting.value = true;
      await validateBindForm();
      const values = getBindFormValues();
      const target = (pipelineConfigs.value || []).find((pc: any) => String(pc.id) === String(values.pipelineConfigId));
      if (!target) {
        message.error('未找到选择的流水线配置');
        return;
      }
      // 构造新的配置（写入 jenkins 绑定信息）
      const newConfig = {
        id: target.id,
        name: target.name,
        environment: values.environment || target.environment,
        description: target.description,
        status: target.status || 'enabled',
        config: {
          ...(target.config || {}),
          jenkins: {
            jobName: values.jobName,
            jobUrl: values.jobUrl,
            params: {
              branch: values.branchParam || 'BRANCH',
              commit: values.commitParam || 'COMMIT',
              version: values.versionParam || 'VERSION',
            },
          },
        },
      };
      await savePipelineConfig(props.appId, newConfig);
      message.success('绑定成功');
      bindDrawerVisible.value = false;
      await loadPipelineConfigs();
      // 切换到 Jenkins Tab 查看效果
      activeTab.value = 'jenkins';
    } catch (e) {
      console.error(e);
      message.error('绑定失败，请稍后重试');
    } finally {
      bindSubmitting.value = false;
    }
  }

  async function unbindJenkins(item: any) {
    try {
      const target = (pipelineConfigs.value || []).find((pc: any) => pc.id === item.configId);
      if (!target) return;
      const newCfg = { ...target.config };
      if (newCfg.jenkins) delete newCfg.jenkins;
      const payload = {
        id: target.id,
        name: target.name,
        environment: target.environment,
        description: target.description,
        status: target.status || 'enabled',
        config: newCfg,
      };
      await savePipelineConfig(props.appId, payload);
      message.success('已解除绑定');
      await loadPipelineConfigs();
    } catch (e) {
      console.error(e);
      message.error('解除绑定失败');
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

    .jenkins-bind-list {
      .binding-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .binding-desc {
        color: #666;
      }
    }
  }
</style>
