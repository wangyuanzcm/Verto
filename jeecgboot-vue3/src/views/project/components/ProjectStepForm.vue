<template>
  <div class="project-step-form">
    <a-steps :current="current" class="steps">
      <a-step title="基本信息" />
      <a-step title="关联配置" />
      <a-step title="技术配置" />
    </a-steps>

    <div class="steps-content">
      <Step1 
        v-if="current === 0" 
        :form-data="formData" 
        @update="updateFormData"
        @next="nextStep"
      />
      <Step2 
        v-if="current === 1" 
        :form-data="formData" 
        @update="updateFormData"
        @next="nextStep"
        @prev="prevStep"
      />
      <Step3 
        v-if="current === 2" 
        :form-data="formData" 
        @update="updateFormData"
        @prev="prevStep"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import Step1 from './step/Step1.vue';
import Step2 from './step/Step2.vue';
import Step3 from './step/Step3.vue';
import { ProjectFormData } from '../Project.data';
import { saveProject, updateProject } from '../Project.api';
import { useProjectFormStore } from '/@/store/modules/projectForm';

// 本地存储键名
const STORAGE_KEY = 'project_step_form_data';

// 使用项目表单store
const projectFormStore = useProjectFormStore();

interface Props {
  visible?: boolean;
  editData?: Partial<ProjectFormData>;
  isEdit?: boolean;
  isModal?: boolean; // 是否为模态框模式
}

interface Emits {
  (e: 'success'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  isEdit: false,
  isModal: true, // 默认为模态框模式
});

const emit = defineEmits<Emits>();

// 使用store中的状态
const current = computed(() => projectFormStore.getCurrentStep);
const formData = computed(() => projectFormStore.getFormData);

/**
 * 监听编辑数据变化，初始化表单数据
 */
watch(
  () => props.editData,
  (newRecord) => {
    if (newRecord) {
      // 初始化store数据
      projectFormStore.initFormData(newRecord);
    } else {
      // 重置store数据
      projectFormStore.resetFormData();
    }
  },
  { immediate: true }
);
/**
 * 监听弹框显示状态，重置步骤
 */
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      projectFormStore.setCurrentStep(0);
      // 在新建模式下尝试加载本地存储的数据
      if (shouldUseLocalStorage.value) {
        loadFromLocalStorage();
      }
    }
  }
);

// 在非编辑模式下使用本地存储（新建项目时）
const shouldUseLocalStorage = computed(() => !projectFormStore.getIsEdit);

/**
 * 保存表单数据到本地存储
 */
const saveToLocalStorage = () => {
  if (!shouldUseLocalStorage.value) return;
  
  try {
    const dataToSave = {
      ...projectFormStore.getFormData,
      timestamp: Date.now(),
      step: projectFormStore.getCurrentStep
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn('保存表单数据到本地存储失败:', error);
  }
};

/**
 * 从本地存储加载表单数据
 */
const loadFromLocalStorage = () => {
  if (!shouldUseLocalStorage.value) return;
  
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // 检查数据是否在24小时内
      const isRecent = parsedData.timestamp && (Date.now() - parsedData.timestamp) < 24 * 60 * 60 * 1000;
      
      if (isRecent) {
        // 使用store更新数据
        const formDataToUpdate: Partial<ProjectFormData> = {};
        Object.keys(parsedData).forEach(key => {
          if (key !== 'timestamp' && key !== 'step' && parsedData[key] !== '' && parsedData[key] != null) {
            formDataToUpdate[key] = parsedData[key];
          }
        });
        projectFormStore.updateFormData(formDataToUpdate);
        projectFormStore.setCurrentStep(parsedData.step || 0);
        message.info('已恢复之前未完成的表单数据');
      } else {
        // 清除过期数据
        clearLocalStorage();
      }
    }
  } catch (error) {
    console.warn('从本地存储加载表单数据失败:', error);
    clearLocalStorage();
  }
};

/**
 * 清除本地存储的表单数据
 */
const clearLocalStorage = () => {
  if (!shouldUseLocalStorage.value) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('清除本地存储失败:', error);
  }
};

/**
 * 监听页面初始化，加载本地存储数据
 */
watch(
  () => shouldUseLocalStorage.value,
  (shouldUse) => {
    if (shouldUse) {
      loadFromLocalStorage();
    }
  },
  { immediate: true }
);

/**
 * 更新表单数据
 */
const updateFormData = (data: Partial<ProjectFormData>) => {
  projectFormStore.updateFormData(data);
  // 自动保存到本地存储
  saveToLocalStorage();
};

/**
 * 下一步
 */
const nextStep = () => {
  projectFormStore.nextStep();
  // 保存当前步骤到本地存储
  saveToLocalStorage();
};

/**
 * 上一步
 */
const prevStep = () => {
  projectFormStore.prevStep();
  // 保存当前步骤到本地存储
  saveToLocalStorage();
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    const submitData = { ...projectFormStore.getFormData };
    
    if (projectFormStore.getIsEdit) {
      await updateProject(submitData);
      message.success('项目更新成功！');
    } else {
      await saveProject(submitData);
      message.success('项目创建成功！');
      // 清除本地存储的数据
      clearLocalStorage();
    }
    
    // 清除store数据
    projectFormStore.clearAll();
    emit('success');
  } catch (error) {
    console.error('提交失败:', error);
    message.error('操作失败，请重试！');
  }
};

/**
 * 取消操作
 */
const handleCancel = () => {
  projectFormStore.setCurrentStep(0);
  // 询问是否保存草稿（仅在新建模式下）
  const formData = projectFormStore.getFormData;
  if (shouldUseLocalStorage.value && Object.keys(formData).some(key => formData[key] && key !== 'id')) {
    // 有数据时保存到本地存储作为草稿
    saveToLocalStorage();
    message.info('表单数据已保存为草稿');
  }
  emit('cancel');
};

// 暴露方法给父组件
defineExpose({
  handleCancel,
});
</script>

<style lang="less" scoped>
.project-step-form {
  .steps {
    margin-bottom: 32px;
    padding: 0 24px;
    
    :deep(.ant-steps-item-title) {
      font-weight: 500;
      font-size: 14px;
    }
    
    :deep(.ant-steps-item-description) {
      font-size: 12px;
      color: #666;
    }
    
    :deep(.ant-steps-item-process .ant-steps-item-icon) {
      background: #1890ff;
      border-color: #1890ff;
    }
    
    :deep(.ant-steps-item-finish .ant-steps-item-icon) {
      background: #52c41a;
      border-color: #52c41a;
    }
  }

  .steps-content {
    min-height: 450px;
    padding: 32px 24px;
    background: #fafafa;
    border-radius: 8px;
    margin: 0 24px;
    
    // 为每个步骤添加渐入动画
    animation: fadeIn 0.3s ease-in-out;
  }
  
  // 表单样式优化
  :deep(.ant-form-item) {
    margin-bottom: 20px;
    
    .ant-form-item-label {
      font-weight: 500;
    }
    
    .ant-input,
    .ant-select-selector,
    .ant-picker {
      border-radius: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #40a9ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      }
      
      &:focus,
      &.ant-input-focused,
      &.ant-select-focused .ant-select-selector,
      &.ant-picker-focused {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }
  }
  
  // 按钮样式优化
  :deep(.ant-btn) {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
  
  // 设计链接列表样式
  :deep(.design-links) {
    .ant-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    }
  }
}

// 渐入动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-step-form {
    .steps {
      padding: 0 16px;
    }
    
    .steps-content {
      margin: 0 16px;
      padding: 24px 16px;
    }
  }
}
</style>