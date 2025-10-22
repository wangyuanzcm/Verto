<template>
  <div class="pipeline-config-editor">
    <a-tabs v-model:activeKey="activeTab">
      <!-- 阶段配置 -->
      <a-tab-pane key="stages" tab="阶段配置">
        <div class="stages-config">
          <div class="toolbar">
            <a-button type="primary" @click="addStage" size="small" :disabled="isReadonly">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加阶段
            </a-button>
          </div>
          
          <div class="stages-list">
            <div
              v-for="(stage, index) in config.stages"
              :key="stage.id"
              class="stage-item"
            >
              <a-card size="small" :title="`阶段 ${index + 1}: ${stage.name}`">
                <template #extra>
                  <a-space>
                    <a-button type="text" size="small" @click="editStage(index)" :disabled="isReadonly">
                      <Icon icon="ant-design:edit-outlined" />
                    </a-button>
                    <a-button type="text" size="small" danger @click="removeStage(index)" :disabled="isReadonly">
                      <Icon icon="ant-design:delete-outlined" />
                    </a-button>
                  </a-space>
                </template>
                
                <a-descriptions size="small" :column="2">
                  <a-descriptions-item label="类型">
                    <a-tag :color="getStageTypeColor(stage.type)">
                      {{ getStageTypeText(stage.type) }}
                    </a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="环境">{{ stage.environment || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="超时时间">{{ stage.timeout || 30 }}分钟</a-descriptions-item>
                  <a-descriptions-item label="重试次数">{{ stage.retryCount || 0 }}次</a-descriptions-item>
                </a-descriptions>
                
                <div v-if="stage.script" class="stage-script">
                  <a-typography-text code>{{ stage.script }}</a-typography-text>
                </div>
              </a-card>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- 触发器配置 -->
      <a-tab-pane key="triggers" tab="触发器配置">
        <div class="triggers-config">
          <div class="toolbar">
            <a-button type="primary" @click="addTrigger" size="small" :disabled="isReadonly">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加触发器
            </a-button>
          </div>
          
          <a-list :data-source="config.triggers" item-layout="horizontal">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <template #actions>
                  <a-button type="link" @click="editTrigger(index)" :disabled="isReadonly">编辑</a-button>
                  <a-button type="link" danger @click="removeTrigger(index)" :disabled="isReadonly">删除</a-button>
                </template>
                
                <a-list-item-meta>
                  <template #title>
                    <a-tag :color="getTriggerTypeColor(item.type)">
                      {{ getTriggerTypeText(item.type) }}
                    </a-tag>
                  </template>
                  <template #description>
                    <div v-if="item.branches?.length">
                      分支: {{ item.branches.join(', ') }}
                    </div>
                    <div v-if="item.schedule">
                      定时: {{ item.schedule }}
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-tab-pane>

      <!-- 变量配置 -->
      <a-tab-pane key="variables" tab="变量配置">
        <div class="variables-config">
          <div class="toolbar">
            <a-button type="primary" @click="addVariable" size="small" :disabled="isReadonly">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加变量
            </a-button>
          </div>
          
          <a-table
            :columns="variableColumns"
            :data-source="config.variables"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <a-tag :color="record.type === 'env' ? 'blue' : 'green'">
                  {{ record.type === 'env' ? '环境变量' : '文件变量' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'protected'">
                <a-switch v-model:checked="record.protected" size="small" :disabled="isReadonly" />
              </template>
              <template v-if="column.key === 'masked'">
                <a-switch v-model:checked="record.masked" size="small" :disabled="isReadonly" />
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" @click="editVariable(index)" :disabled="isReadonly">编辑</a-button>
                  <a-button type="link" danger @click="removeVariable(index)" :disabled="isReadonly">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 通知配置 -->
      <a-tab-pane key="notifications" tab="通知配置">
        <div class="notifications-config">
          <div class="toolbar">
            <a-button type="primary" @click="addNotification" size="small" :disabled="isReadonly">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加通知
            </a-button>
          </div>
          
          <a-list :data-source="config.notifications" item-layout="horizontal">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <template #actions>
                  <a-button type="link" @click="editNotification(index)" :disabled="isReadonly">编辑</a-button>
                  <a-button type="link" danger @click="removeNotification(index)" :disabled="isReadonly">删除</a-button>
                </template>
                
                <a-list-item-meta>
                  <template #title>
                    <a-tag :color="getNotificationTypeColor(item.type)">
                      {{ getNotificationTypeText(item.type) }}
                    </a-tag>
                  </template>
                  <template #description>
                    <div>接收者: {{ item.recipients.join(', ') }}</div>
                    <div>事件: {{ item.events.join(', ') }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 阶段编辑弹窗 -->
    <StageModal @register="registerStageModal" @success="handleStageSuccess" />
    
    <!-- 触发器编辑弹窗 -->
    <TriggerModal @register="registerTriggerModal" @success="handleTriggerSuccess" />
    
    <!-- 变量编辑弹窗 -->
    <VariableModal @register="registerVariableModal" @success="handleVariableSuccess" />
    
    <!-- 通知编辑弹窗 -->
    <NotificationModal @register="registerNotificationModal" @success="handleNotificationSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, computed } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  import StageModal from './StageModal.vue';
  import TriggerModal from './TriggerModal.vue';
  import VariableModal from './VariableModal.vue';
  import NotificationModal from './NotificationModal.vue';
  
  import type { PipelineConfig, PipelineStage, PipelineTrigger, PipelineVariable, PipelineNotification } from '../data/Config.data';

  interface Props {
    value?: PipelineConfig;
    readonly?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    value: () => ({
      stages: [],
      triggers: [],
      variables: [],
      notifications: [],
    }),
    readonly: false,
  });

  const emit = defineEmits(['update:value']);

  const { createMessage } = useMessage();
  const activeTab = ref('stages');
  const isReadonly = computed(() => !!props.readonly);

  // 配置数据
  const config = reactive<PipelineConfig>({
    stages: [],
    triggers: [],
    variables: [],
    notifications: [],
  });

  // 变量表格列配置
  const variableColumns = [
    { title: '变量名', dataIndex: 'key', key: 'key' },
    { title: '变量值', dataIndex: 'value', key: 'value', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '受保护', dataIndex: 'protected', key: 'protected' },
    { title: '掩码', dataIndex: 'masked', key: 'masked' },
    { title: '操作', key: 'action' },
  ];

  // 弹窗注册
  const [registerStageModal, { openModal: openStageModal }] = useModal();
  const [registerTriggerModal, { openModal: openTriggerModal }] = useModal();
  const [registerVariableModal, { openModal: openVariableModal }] = useModal();
  const [registerNotificationModal, { openModal: openNotificationModal }] = useModal();

  // 监听props变化
  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        Object.assign(config, newValue);
      }
    },
    { immediate: true, deep: true }
  );

  // 监听config变化，向上传递
  watch(
    config,
    (newConfig) => {
      emit('update:value', { ...newConfig });
    },
    { deep: true }
  );

  // ==================== 阶段管理 ====================

  /**
   * 添加阶段
   */
  function addStage() {
    openStageModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑阶段
   */
  function editStage(index: number) {
    const s = config.stages[index];
    openStageModal(true, {
      isUpdate: true,
      // 将现有阶段数据映射到 StageModal 的字段，确保回填
      record: {
        stageName: s.name,
        stageType: s.type,
        order: s.order ?? index + 1,
        executor: (s as any).executor,
        commands: s.script,
        workingDirectory: (s as any).workingDirectory,
        environment: typeof s.environment === 'string' ? s.environment : s.environment ? JSON.stringify(s.environment, null, 2) : '',
        timeout: s.timeout,
        retryCount: s.retryCount,
        continueOnError: (s as any).continueOnError ?? false,
        parallel: (s as any).parallel ?? false,
        conditions: typeof (s as any).conditions === 'string' ? (s as any).conditions : (s as any).conditions ? JSON.stringify((s as any).conditions, null, 2) : '',
        artifacts: typeof (s as any).artifacts === 'string' ? (s as any).artifacts : (s as any).artifacts ? JSON.stringify((s as any).artifacts, null, 2) : '',
        dependencies: Array.isArray(s.dependencies) ? s.dependencies.join(',') : (s as any).dependencies ?? '',
        enabled: (s as any).enabled ?? true,
        description: (s as any).description ?? '',
      },
      index,
    });
  }

  /**
   * 删除阶段
   */
  function removeStage(index: number) {
    config.stages.splice(index, 1);
  }

  /**
   * 阶段操作成功回调
   */
  function handleStageSuccess(data: any) {
    // 兼容两种回调形式：
    // 1) StageModal 直接 emit(values)
    // 2) StageModal emit({ stage: values, index })
    const rawStage = data?.stage ?? data;
    const index = data?.index;

    // 解析可能为 JSON 字符串的字段
    const parseJSONIfString = (v: any) => {
      if (!v) return undefined;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v; // 保留原字符串
        }
      }
      return v;
    };

    // 处理依赖字段（字符串转数组）
    const normalizeDependencies = (deps: any): string[] | undefined => {
      if (!deps) return undefined;
      if (Array.isArray(deps)) return deps as string[];
      if (typeof deps === 'string') {
        return deps
          .split(',')
          .map((s) => s.trim())
          .filter((s) => !!s);
      }
      return undefined;
    };

    // 规范化为 PipelineStage 结构
    const normalizedStage: PipelineStage = {
      id: rawStage?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: rawStage?.name ?? rawStage?.stageName ?? '未命名阶段',
      type: rawStage?.type ?? rawStage?.stageType ?? 'custom',
      script: rawStage?.script ?? rawStage?.commands ?? rawStage?.command ?? '',
      environment: rawStage?.environment ?? rawStage?.env ?? '',
      timeout: rawStage?.timeout ?? 30,
      retryCount: rawStage?.retryCount ?? 0,
      // 以下为 StageModal 扩展字段
      order: rawStage?.order,
      executor: rawStage?.executor,
      workingDirectory: rawStage?.workingDirectory,
      continueOnError: rawStage?.continueOnError,
      parallel: rawStage?.parallel,
      conditions: parseJSONIfString(rawStage?.conditions),
      artifacts: parseJSONIfString(rawStage?.artifacts),
      dependencies: normalizeDependencies(rawStage?.dependencies),
      enabled: rawStage?.enabled,
      description: rawStage?.description,
    } as PipelineStage;

    if (typeof index === 'number' && index >= 0) {
      // 编辑
      config.stages[index] = normalizedStage;
    } else {
      // 新增
      config.stages.push(normalizedStage);
    }
  }

  // ==================== 触发器管理 ====================

  /**
   * 添加触发器
   */
  function addTrigger() {
    openTriggerModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑触发器
   */
  function editTrigger(index: number) {
    openTriggerModal(true, {
      isUpdate: true,
      record: config.triggers[index],
      index,
    });
  }

  /**
   * 删除触发器
   */
  function removeTrigger(index: number) {
    config.triggers.splice(index, 1);
  }

  /**
   * 触发器操作成功回调
   */
  function handleTriggerSuccess(data: { trigger: PipelineTrigger; index?: number }) {
    if (data.index !== undefined) {
      config.triggers[data.index] = data.trigger;
    } else {
      config.triggers.push(data.trigger);
    }
  }

  // ==================== 变量管理 ====================

  /**
   * 添加变量
   */
  function addVariable() {
    openVariableModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑变量
   */
  function editVariable(index: number) {
    openVariableModal(true, {
      isUpdate: true,
      record: config.variables[index],
      index,
    });
  }

  /**
   * 删除变量
   */
  function removeVariable(index: number) {
    config.variables.splice(index, 1);
  }

  /**
   * 变量操作成功回调
   */
  function handleVariableSuccess(data: { variable: PipelineVariable; index?: number }) {
    if (data.index !== undefined) {
      config.variables[data.index] = data.variable;
    } else {
      config.variables.push(data.variable);
    }
  }

  // ==================== 通知管理 ====================

  /**
   * 添加通知
   */
  function addNotification() {
    openNotificationModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑通知
   */
  function editNotification(index: number) {
    openNotificationModal(true, {
      isUpdate: true,
      record: config.notifications[index],
      index,
    });
  }

  /**
   * 删除通知
   */
  function removeNotification(index: number) {
    config.notifications.splice(index, 1);
  }

  /**
   * 通知操作成功回调
   */
  function handleNotificationSuccess(data: { notification: PipelineNotification; index?: number }) {
    if (data.index !== undefined) {
      config.notifications[data.index] = data.notification;
    } else {
      config.notifications.push(data.notification);
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取阶段类型文本
   */
  function getStageTypeText(type: string): string {
    const typeMap = {
      build: '构建',
      test: '测试',
      deploy: '部署',
      approval: '审批',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取阶段类型颜色
   */
  function getStageTypeColor(type: string): string {
    const colorMap = {
      build: 'blue',
      test: 'green',
      deploy: 'orange',
      approval: 'purple',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取触发器类型文本
   */
  function getTriggerTypeText(type: string): string {
    const typeMap = {
      push: '推送触发',
      merge_request: '合并请求',
      schedule: '定时触发',
      manual: '手动触发',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取触发器类型颜色
   */
  function getTriggerTypeColor(type: string): string {
    const colorMap = {
      push: 'blue',
      merge_request: 'green',
      schedule: 'orange',
      manual: 'purple',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取通知类型文本
   */
  function getNotificationTypeText(type: string): string {
    const typeMap = {
      email: '邮件通知',
      webhook: 'Webhook',
      slack: 'Slack通知',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取通知类型颜色
   */
  function getNotificationTypeColor(type: string): string {
    const colorMap = {
      email: 'blue',
      webhook: 'green',
      slack: 'purple',
    };
    return colorMap[type] || 'default';
  }
</script>

<style lang="less" scoped>
  .pipeline-config-editor {
    .toolbar {
      margin-bottom: 16px;
    }

    .stages-list {
      .stage-item {
        margin-bottom: 16px;

        .stage-script {
          margin-top: 8px;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
      }
    }
  }
</style>