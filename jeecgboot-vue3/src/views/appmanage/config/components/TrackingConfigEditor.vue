<template>
  <div class="tracking-config-editor">
    <a-tabs v-model:activeKey="activeTab">
      <!-- 事件配置 -->
      <a-tab-pane key="events" tab="事件配置">
        <div class="events-config">
          <div class="toolbar">
            <a-button type="primary" @click="addEvent" size="small">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加事件
            </a-button>
          </div>
          
          <a-table
            :columns="eventColumns"
            :data-source="config.events"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'enabled'">
                <a-switch v-model:checked="record.enabled" size="small" />
              </template>
              <template v-if="column.key === 'properties'">
                <a-tag v-for="prop in record.properties" :key="prop" size="small">
                  {{ prop }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a @click="editEvent(index)">编辑</a>
                  <a @click="removeEvent(index)" style="color: #ff4d4f;">删除</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 属性配置 -->
      <a-tab-pane key="properties" tab="属性配置">
        <div class="properties-config">
          <div class="toolbar">
            <a-button type="primary" @click="addProperty" size="small">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加属性
            </a-button>
          </div>
          
          <a-table
            :columns="propertyColumns"
            :data-source="config.properties"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getPropertyTypeColor(record.type)">
                  {{ getPropertyTypeText(record.type) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'required'">
                <a-switch v-model:checked="record.required" size="small" />
              </template>
              <template v-if="column.key === 'defaultValue'">
                <a-typography-text code v-if="record.defaultValue">
                  {{ record.defaultValue }}
                </a-typography-text>
                <span v-else>-</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a @click="editProperty(index)">编辑</a>
                  <a @click="removeProperty(index)" style="color: #ff4d4f;">删除</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 过滤器配置 -->
      <a-tab-pane key="filters" tab="过滤器配置">
        <div class="filters-config">
          <div class="toolbar">
            <a-button type="primary" @click="addFilter" size="small">
              <template #icon><Icon icon="ant-design:plus-outlined" /></template>
              添加过滤器
            </a-button>
          </div>
          
          <a-table
            :columns="filterColumns"
            :data-source="config.filters"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <a-tag :color="record.type === 'include' ? 'green' : 'red'">
                  {{ record.type === 'include' ? '包含' : '排除' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'operator'">
                <a-tag>{{ getOperatorText(record.operator) }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a @click="editFilter(index)">编辑</a>
                  <a @click="removeFilter(index)" style="color: #ff4d4f;">删除</a>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- 采样配置 -->
      <a-tab-pane key="sampling" tab="采样配置">
        <div class="sampling-config">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="启用采样">
                  <a-switch v-model:checked="config.sampling.enabled" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="采样率">
                  <a-input-number
                    v-model:value="config.sampling.rate"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    :disabled="!config.sampling.enabled"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="采样策略">
                  <a-select
                    v-model:value="config.sampling.strategy"
                    :disabled="!config.sampling.enabled"
                  >
                    <a-select-option value="random">随机采样</a-select-option>
                    <a-select-option value="user_based">基于用户</a-select-option>
                    <a-select-option value="session_based">基于会话</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 事件编辑弹窗 -->
    <EventModal @register="registerEventModal" @success="handleEventSuccess" />
    
    <!-- 属性编辑弹窗 -->
    <PropertyModal @register="registerPropertyModal" @success="handlePropertySuccess" />
    
    <!-- 过滤器编辑弹窗 -->
    <FilterModal @register="registerFilterModal" @success="handleFilterSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  import EventModal from './EventModal.vue';
  import PropertyModal from './PropertyModal.vue';
  import FilterModal from './FilterModal.vue';
  
  import type { TrackingConfig, TrackingEvent, TrackingProperty, TrackingFilter } from '../data/Config.data';

  interface Props {
    value?: TrackingConfig;
  }

  const props = withDefaults(defineProps<Props>(), {
    value: () => ({
      events: [],
      properties: [],
      filters: [],
      sampling: {
        enabled: false,
        rate: 1.0,
        strategy: 'random',
      },
    }),
  });

  const emit = defineEmits(['update:value']);

  const { createMessage } = useMessage();
  const activeTab = ref('events');

  // 配置数据
  const config = reactive<TrackingConfig>({
    events: [],
    properties: [],
    filters: [],
    sampling: {
      enabled: false,
      rate: 1.0,
      strategy: 'random',
    },
  });

  // 事件表格列配置
  const eventColumns = [
    { title: '事件名称', dataIndex: 'name', key: 'name' },
    { title: '事件ID', dataIndex: 'id', key: 'id' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '属性', dataIndex: 'properties', key: 'properties' },
    { title: '启用', dataIndex: 'enabled', key: 'enabled' },
    { title: '操作', key: 'action' },
  ];

  // 属性表格列配置
  const propertyColumns = [
    { title: '属性名', dataIndex: 'key', key: 'key' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '必填', dataIndex: 'required', key: 'required' },
    { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '操作', key: 'action' },
  ];

  // 过滤器表格列配置
  const filterColumns = [
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '字段', dataIndex: 'field', key: 'field' },
    { title: '操作符', dataIndex: 'operator', key: 'operator' },
    { title: '值', dataIndex: 'value', key: 'value' },
    { title: '操作', key: 'action' },
  ];

  // 弹窗注册
  const [registerEventModal, { openModal: openEventModal }] = useModal();
  const [registerPropertyModal, { openModal: openPropertyModal }] = useModal();
  const [registerFilterModal, { openModal: openFilterModal }] = useModal();

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

  // ==================== 事件管理 ====================

  /**
   * 添加事件
   */
  function addEvent() {
    openEventModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑事件
   */
  function editEvent(index: number) {
    openEventModal(true, {
      isUpdate: true,
      record: config.events[index],
      index,
    });
  }

  /**
   * 删除事件
   */
  function removeEvent(index: number) {
    config.events.splice(index, 1);
  }

  /**
   * 事件操作成功回调
   */
  function handleEventSuccess(data: { event: TrackingEvent; index?: number }) {
    if (data.index !== undefined) {
      config.events[data.index] = data.event;
    } else {
      config.events.push(data.event);
    }
  }

  // ==================== 属性管理 ====================

  /**
   * 添加属性
   */
  function addProperty() {
    openPropertyModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑属性
   */
  function editProperty(index: number) {
    openPropertyModal(true, {
      isUpdate: true,
      record: config.properties[index],
      index,
    });
  }

  /**
   * 删除属性
   */
  function removeProperty(index: number) {
    config.properties.splice(index, 1);
  }

  /**
   * 属性操作成功回调
   */
  function handlePropertySuccess(data: { property: TrackingProperty; index?: number }) {
    if (data.index !== undefined) {
      config.properties[data.index] = data.property;
    } else {
      config.properties.push(data.property);
    }
  }

  // ==================== 过滤器管理 ====================

  /**
   * 添加过滤器
   */
  function addFilter() {
    openFilterModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑过滤器
   */
  function editFilter(index: number) {
    openFilterModal(true, {
      isUpdate: true,
      record: config.filters[index],
      index,
    });
  }

  /**
   * 删除过滤器
   */
  function removeFilter(index: number) {
    config.filters.splice(index, 1);
  }

  /**
   * 过滤器操作成功回调
   */
  function handleFilterSuccess(data: { filter: TrackingFilter; index?: number }) {
    if (data.index !== undefined) {
      config.filters[data.index] = data.filter;
    } else {
      config.filters.push(data.filter);
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取属性类型文本
   */
  function getPropertyTypeText(type: string): string {
    const typeMap = {
      string: '字符串',
      number: '数字',
      boolean: '布尔值',
      object: '对象',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取属性类型颜色
   */
  function getPropertyTypeColor(type: string): string {
    const colorMap = {
      string: 'blue',
      number: 'green',
      boolean: 'orange',
      object: 'purple',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取操作符文本
   */
  function getOperatorText(operator: string): string {
    const operatorMap = {
      equals: '等于',
      contains: '包含',
      regex: '正则匹配',
    };
    return operatorMap[operator] || operator;
  }
</script>

<style lang="less" scoped>
  .tracking-config-editor {
    .toolbar {
      margin-bottom: 16px;
    }

    .sampling-config {
      padding: 16px;
      background-color: #fafafa;
      border-radius: 6px;
    }
  }
</style>