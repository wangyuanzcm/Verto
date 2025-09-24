<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="900px"
    :footer="null"
  >
    <ProjectStepForm
      ref="stepFormRef"
      :visible="visible"
      :record="currentRecord"
      :is-edit="isUpdate"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import ProjectStepForm from './ProjectStepForm.vue';
import { ProjectFormData } from '../Project.data';

const emit = defineEmits(['success', 'register']);

const isUpdate = ref(false);
const visible = ref(false);
const currentRecord = ref<Partial<ProjectFormData>>({});
const stepFormRef = ref();

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  setModalProps({ confirmLoading: false });
  
  isUpdate.value = !!data?.isUpdate;
  visible.value = true;

  if (unref(isUpdate)) {
    // 编辑模式：设置当前记录数据
    currentRecord.value = {
      ...data.record,
      type: data.record.projectType, // 字段名映射
      appId: data.record.relatedAppId, // 字段名映射
    };
  } else {
    // 新增模式：重置记录数据
    currentRecord.value = {};
  }
});

const getTitle = computed(() => (!unref(isUpdate) ? '新增项目' : '编辑项目'));

/**
 * 处理提交
 */
const handleSubmit = () => {
  // 由于使用了自定义footer，这个方法不会被调用
  // 实际提交逻辑在ProjectStepForm组件中处理
};

/**
 * 处理成功
 */
const handleSuccess = () => {
  visible.value = false;
  closeModal();
  emit('success');
};

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false;
  if (stepFormRef.value) {
    stepFormRef.value.handleCancel();
  }
  closeModal();
};
</script>

<style lang="less" scoped>
// 样式可以根据需要调整
</style>