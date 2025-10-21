<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="800px">
    <BasicForm @register="registerForm" />
    
    <!-- 分发方式说明 -->
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-900 mb-2">分发方式说明：</h4>
      <div class="space-y-2 text-sm text-gray-600">
        <div>
          <strong>NPM包：</strong>适用于独立、可复用的组件，与其他项目无耦合，可直接编译发布为npm包
        </div>
        <div>
          <strong>模块联邦：</strong>适用于耦合较深的组件（如业务页面），通过模块联邦导出远程模块，需要指定关联项目的tag版本确保稳定性
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { componentFormSchema } from '../material.data';
  import { addComponent, updateComponent } from '../material.api';

  /**
   * 组件管理弹窗
   * 用于新增和编辑组件信息
   */
  defineOptions({ name: 'ComponentModal' });
  
  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate, getFieldsValue }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: componentFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false, width: '800px' });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
    } else {
      // 新增时设置默认值
      setFieldsValue({
        distributionType: 'npm',
        status: '1',
      });
    }
  });

  /**
   * 获取弹窗标题
   */
  const getTitle = computed(() => (!unref(isUpdate) ? '新增组件' : '编辑组件'));

  /**
   * 监听分发方式变化，清空相关字段
   */
  watch(
    () => getFieldsValue()?.distributionType,
    (newType, oldType) => {
      if (oldType && newType !== oldType) {
        const fieldsToReset = {
          // 清空模块联邦相关字段
          relatedProject: undefined,
          projectRepository: undefined,
          projectTag: undefined,
          remoteModuleName: undefined,
          // 清空NPM包相关字段
          npmPackageName: undefined,
          packageRepository: undefined,
        };
        
        setFieldsValue(fieldsToReset);
      }
    },
    { deep: true }
  );

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      
      // 根据分发方式清理不需要的字段
      const cleanedValues = { ...values };
      if (values.distributionType === 'npm') {
        // NPM包类型，清除模块联邦相关字段
        delete cleanedValues.relatedProject;
        delete cleanedValues.projectRepository;
        delete cleanedValues.projectTag;
        delete cleanedValues.remoteModuleName;
      } else if (values.distributionType === 'federation') {
        // 模块联邦类型，清除NPM包相关字段
        delete cleanedValues.npmPackageName;
        delete cleanedValues.packageRepository;
      }
      
      if (unref(isUpdate)) {
        cleanedValues.id = rowId.value;
        await updateComponent(cleanedValues);
      } else {
        await addComponent(cleanedValues);
      }
      
      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...cleanedValues, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>