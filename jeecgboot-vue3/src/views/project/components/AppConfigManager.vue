<template>
  <div class="app-config-manager">
    <div class="config-header">
      <h3>应用默认配置</h3>
      <a-button type="primary" @click="handleSave" :loading="saveLoading">
        <Icon icon="ant-design:save-outlined" />
        保存配置
      </a-button>
    </div>

    <a-tabs v-model:activeKey="activeTab" type="card">
      <!-- 埋点配置 -->
      <a-tab-pane key="tracking" tab="埋点配置">
        <div class="config-section">
          <BasicForm @register="registerTrackingForm" />
          
          <div class="tracking-events" v-if="trackingConfig.events?.length">
            <h4>埋点事件列表</h4>
            <a-table
              :columns="trackingColumns"
              :data-source="trackingConfig.events"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="handleEditEvent(record, index)">
                      编辑
                    </a-button>
                    <a-popconfirm
                      title="确定要删除这个埋点事件吗？"
                      @confirm="handleDeleteEvent(index)"
                    >
                      <a-button size="small" danger>
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
            
            <a-button type="dashed" block @click="handleAddEvent" class="add-event-btn">
              <Icon icon="ant-design:plus-outlined" />
              添加埋点事件
            </a-button>
          </div>
        </div>
      </a-tab-pane>

      <!-- 流水线配置 -->
      <a-tab-pane key="pipeline" tab="流水线配置">
        <div class="config-section">
          <BasicForm @register="registerPipelineForm" />
          
          <div class="pipeline-stages" v-if="pipelineConfig.stages?.length">
            <h4>流水线阶段</h4>
            <div class="stages-list">
              <div
                v-for="(stage, index) in pipelineConfig.stages"
                :key="index"
                class="stage-item"
              >
                <div class="stage-header">
                  <span class="stage-name">{{ stage.name }}</span>
                  <a-space>
                    <a-button size="small" @click="handleEditStage(stage, index)">
                      编辑
                    </a-button>
                    <a-popconfirm
                      title="确定要删除这个阶段吗？"
                      @confirm="handleDeleteStage(index)"
                    >
                      <a-button size="small" danger>
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </div>
                <div class="stage-content">
                  <p><strong>脚本：</strong>{{ stage.script }}</p>
                  <p><strong>超时时间：</strong>{{ stage.timeout }}分钟</p>
                  <p><strong>失败时继续：</strong>{{ stage.continueOnFailure ? '是' : '否' }}</p>
                </div>
              </div>
            </div>
            
            <a-button type="dashed" block @click="handleAddStage" class="add-stage-btn">
              <Icon icon="ant-design:plus-outlined" />
              添加流水线阶段
            </a-button>
          </div>
        </div>
      </a-tab-pane>

      <!-- 代码审核配置 -->
      <a-tab-pane key="codeReview" tab="代码审核配置">
        <div class="config-section">
          <BasicForm @register="registerCodeReviewForm" />
          
          <div class="review-rules" v-if="codeReviewConfig.rules?.length">
            <h4>审核规则</h4>
            <a-table
              :columns="reviewRulesColumns"
              :data-source="codeReviewConfig.rules"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'enabled'">
                  <a-switch
                    v-model:checked="record.enabled"
                    size="small"
                  />
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="handleEditRule(record, index)">
                      编辑
                    </a-button>
                    <a-popconfirm
                      title="确定要删除这个规则吗？"
                      @confirm="handleDeleteRule(index)"
                    >
                      <a-button size="small" danger>
                        删除
                      </a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
            
            <a-button type="dashed" block @click="handleAddRule" class="add-rule-btn">
              <Icon icon="ant-design:plus-outlined" />
              添加审核规则
            </a-button>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 埋点事件编辑模态框 -->
    <BasicModal
      v-model:visible="eventModalVisible"
      :title="eventModalTitle"
      @ok="handleConfirmEvent"
      :confirm-loading="eventLoading"
    >
      <BasicForm @register="registerEventForm" />
    </BasicModal>

    <!-- 流水线阶段编辑模态框 -->
    <BasicModal
      v-model:visible="stageModalVisible"
      :title="stageModalTitle"
      @ok="handleConfirmStage"
      :confirm-loading="stageLoading"
    >
      <BasicForm @register="registerStageForm" />
    </BasicModal>

    <!-- 审核规则编辑模态框 -->
    <BasicModal
      v-model:visible="ruleModalVisible"
      :title="ruleModalTitle"
      @ok="handleConfirmRule"
      :confirm-loading="ruleLoading"
    >
      <BasicForm @register="registerRuleForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { BasicModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getAppConfig, saveAppConfig } from '../Project.api';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();
  const { createMessage } = useMessage();

  // 当前激活的标签页
  const activeTab = ref('tracking');
  
  // 加载和保存状态
  const loading = ref(false);
  const saveLoading = ref(false);

  // 配置数据
  const trackingConfig = reactive({
    enabled: false,
    trackingId: '',
    apiEndpoint: '',
    events: [],
  });

  const pipelineConfig = reactive({
    enabled: false,
    repository: '',
    branch: 'main',
    buildTool: 'npm',
    stages: [],
  });

  const codeReviewConfig = reactive({
    enabled: false,
    requiredReviewers: 1,
    autoMerge: false,
    rules: [],
  });

  // 模态框状态
  const eventModalVisible = ref(false);
  const eventModalTitle = ref('');
  const eventLoading = ref(false);
  const currentEventIndex = ref(-1);

  const stageModalVisible = ref(false);
  const stageModalTitle = ref('');
  const stageLoading = ref(false);
  const currentStageIndex = ref(-1);

  const ruleModalVisible = ref(false);
  const ruleModalTitle = ref('');
  const ruleLoading = ref(false);
  const currentRuleIndex = ref(-1);

  // 埋点配置表单
  const [registerTrackingForm] = useForm({
    labelWidth: 120,
    schemas: [
      {
        field: 'enabled',
        label: '启用埋点',
        component: 'Switch',
        defaultValue: false,
      },
      {
        field: 'trackingId',
        label: '埋点ID',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入埋点ID',
        },
      },
      {
        field: 'apiEndpoint',
        label: 'API端点',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入API端点地址',
        },
      },
    ],
    showActionButtonGroup: false,
  });

  // 流水线配置表单
  const [registerPipelineForm] = useForm({
    labelWidth: 120,
    schemas: [
      {
        field: 'enabled',
        label: '启用流水线',
        component: 'Switch',
        defaultValue: false,
      },
      {
        field: 'repository',
        label: '代码仓库',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入代码仓库地址',
        },
      },
      {
        field: 'branch',
        label: '默认分支',
        component: 'Input',
        required: true,
        defaultValue: 'main',
        componentProps: {
          placeholder: '请输入默认分支名',
        },
      },
      {
        field: 'buildTool',
        label: '构建工具',
        component: 'Select',
        required: true,
        defaultValue: 'npm',
        componentProps: {
          options: [
            { label: 'npm', value: 'npm' },
            { label: 'yarn', value: 'yarn' },
            { label: 'pnpm', value: 'pnpm' },
            { label: 'maven', value: 'maven' },
            { label: 'gradle', value: 'gradle' },
          ],
        },
      },
    ],
    showActionButtonGroup: false,
  });

  // 代码审核配置表单
  const [registerCodeReviewForm] = useForm({
    labelWidth: 120,
    schemas: [
      {
        field: 'enabled',
        label: '启用代码审核',
        component: 'Switch',
        defaultValue: false,
      },
      {
        field: 'requiredReviewers',
        label: '必需审核人数',
        component: 'InputNumber',
        required: true,
        defaultValue: 1,
        componentProps: {
          min: 1,
          max: 10,
        },
      },
      {
        field: 'autoMerge',
        label: '自动合并',
        component: 'Switch',
        defaultValue: false,
      },
    ],
    showActionButtonGroup: false,
  });

  // 埋点事件表单
  const [registerEventForm, { getFieldsValue: getEventValues, resetFields: resetEventFields, setFieldsValue: setEventValues }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'name',
        label: '事件名称',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入事件名称',
        },
      },
      {
        field: 'eventId',
        label: '事件ID',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入事件ID',
        },
      },
      {
        field: 'description',
        label: '事件描述',
        component: 'InputTextArea',
        componentProps: {
          placeholder: '请输入事件描述',
          rows: 3,
        },
      },
    ],
    showActionButtonGroup: false,
  });

  // 流水线阶段表单
  const [registerStageForm, { getFieldsValue: getStageValues, resetFields: resetStageFields, setFieldsValue: setStageValues }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'name',
        label: '阶段名称',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入阶段名称',
        },
      },
      {
        field: 'script',
        label: '执行脚本',
        component: 'InputTextArea',
        required: true,
        componentProps: {
          placeholder: '请输入执行脚本',
          rows: 4,
        },
      },
      {
        field: 'timeout',
        label: '超时时间(分钟)',
        component: 'InputNumber',
        required: true,
        defaultValue: 30,
        componentProps: {
          min: 1,
          max: 300,
        },
      },
      {
        field: 'continueOnFailure',
        label: '失败时继续',
        component: 'Switch',
        defaultValue: false,
      },
    ],
    showActionButtonGroup: false,
  });

  // 审核规则表单
  const [registerRuleForm, { getFieldsValue: getRuleValues, resetFields: resetRuleFields, setFieldsValue: setRuleValues }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'name',
        label: '规则名称',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入规则名称',
        },
      },
      {
        field: 'type',
        label: '规则类型',
        component: 'Select',
        required: true,
        componentProps: {
          options: [
            { label: '代码质量', value: 'quality' },
            { label: '安全检查', value: 'security' },
            { label: '性能检查', value: 'performance' },
            { label: '代码风格', value: 'style' },
          ],
        },
      },
      {
        field: 'pattern',
        label: '匹配模式',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入匹配模式',
        },
      },
      {
        field: 'enabled',
        label: '启用规则',
        component: 'Switch',
        defaultValue: true,
      },
    ],
    showActionButtonGroup: false,
  });

  // 表格列配置
  const trackingColumns = [
    { title: '事件名称', dataIndex: 'name', key: 'name' },
    { title: '事件ID', dataIndex: 'eventId', key: 'eventId' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '操作', key: 'action', width: 150 },
  ];

  const reviewRulesColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '规则类型', dataIndex: 'type', key: 'type' },
    { title: '匹配模式', dataIndex: 'pattern', key: 'pattern' },
    { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 80 },
    { title: '操作', key: 'action', width: 150 },
  ];

  /**
   * 加载应用配置
   */
  async function loadAppConfig() {
    try {
      loading.value = true;
      const result = await getAppConfig({ projectId: props.projectId });
      
      if (result.tracking) {
        Object.assign(trackingConfig, result.tracking);
      }
      if (result.pipeline) {
        Object.assign(pipelineConfig, result.pipeline);
      }
      if (result.codeReview) {
        Object.assign(codeReviewConfig, result.codeReview);
      }
    } catch (error) {
      createMessage.error('加载应用配置失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 保存配置
   */
  async function handleSave() {
    try {
      saveLoading.value = true;
      
      await saveAppConfig({
        projectId: props.projectId,
        tracking: trackingConfig,
        pipeline: pipelineConfig,
        codeReview: codeReviewConfig,
      });
      
      createMessage.success('配置保存成功');
    } catch (error) {
      createMessage.error('保存配置失败');
    } finally {
      saveLoading.value = false;
    }
  }

  // 埋点事件相关方法
  function handleAddEvent() {
    resetEventFields();
    eventModalTitle.value = '添加埋点事件';
    currentEventIndex.value = -1;
    eventModalVisible.value = true;
  }

  function handleEditEvent(record: any, index: number) {
    setEventValues(record);
    eventModalTitle.value = '编辑埋点事件';
    currentEventIndex.value = index;
    eventModalVisible.value = true;
  }

  async function handleConfirmEvent() {
    try {
      const values = await getEventValues();
      
      if (currentEventIndex.value >= 0) {
        trackingConfig.events[currentEventIndex.value] = values;
      } else {
        trackingConfig.events.push(values);
      }
      
      eventModalVisible.value = false;
      createMessage.success('埋点事件保存成功');
    } catch (error) {
      createMessage.error('保存埋点事件失败');
    }
  }

  function handleDeleteEvent(index: number) {
    trackingConfig.events.splice(index, 1);
    createMessage.success('埋点事件删除成功');
  }

  // 流水线阶段相关方法
  function handleAddStage() {
    resetStageFields();
    stageModalTitle.value = '添加流水线阶段';
    currentStageIndex.value = -1;
    stageModalVisible.value = true;
  }

  function handleEditStage(record: any, index: number) {
    setStageValues(record);
    stageModalTitle.value = '编辑流水线阶段';
    currentStageIndex.value = index;
    stageModalVisible.value = true;
  }

  async function handleConfirmStage() {
    try {
      const values = await getStageValues();
      
      if (currentStageIndex.value >= 0) {
        pipelineConfig.stages[currentStageIndex.value] = values;
      } else {
        pipelineConfig.stages.push(values);
      }
      
      stageModalVisible.value = false;
      createMessage.success('流水线阶段保存成功');
    } catch (error) {
      createMessage.error('保存流水线阶段失败');
    }
  }

  function handleDeleteStage(index: number) {
    pipelineConfig.stages.splice(index, 1);
    createMessage.success('流水线阶段删除成功');
  }

  // 审核规则相关方法
  function handleAddRule() {
    resetRuleFields();
    ruleModalTitle.value = '添加审核规则';
    currentRuleIndex.value = -1;
    ruleModalVisible.value = true;
  }

  function handleEditRule(record: any, index: number) {
    setRuleValues(record);
    ruleModalTitle.value = '编辑审核规则';
    currentRuleIndex.value = index;
    ruleModalVisible.value = true;
  }

  async function handleConfirmRule() {
    try {
      const values = await getRuleValues();
      
      if (currentRuleIndex.value >= 0) {
        codeReviewConfig.rules[currentRuleIndex.value] = values;
      } else {
        codeReviewConfig.rules.push(values);
      }
      
      ruleModalVisible.value = false;
      createMessage.success('审核规则保存成功');
    } catch (error) {
      createMessage.error('保存审核规则失败');
    }
  }

  function handleDeleteRule(index: number) {
    codeReviewConfig.rules.splice(index, 1);
    createMessage.success('审核规则删除成功');
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadAppConfig();
  });
</script>

<style lang="less" scoped>
  .app-config-manager {
    padding: 16px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    
    .config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .config-section {
      padding: 16px 0;
    }
    
    .tracking-events,
    .pipeline-stages,
    .review-rules {
      margin-top: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .stages-list {
      .stage-item {
        margin-bottom: 16px;
        padding: 16px;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        
        .stage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .stage-name {
            font-size: 16px;
            font-weight: 600;
          }
        }
        
        .stage-content {
          p {
            margin: 4px 0;
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
    
    .add-event-btn,
    .add-stage-btn,
    .add-rule-btn {
      margin-top: 16px;
    }
  }
</style>