<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../Project.data';
  import { saveProject } from '../Project.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'ProjectModal' });

  const emit = defineEmits(['success', 'register']);

  const { createMessage } = useMessage();
  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
    }

    // 如果是编辑模式，禁用某些字段
    updateSchema([
      {
        field: 'code',
        componentProps: {
          disabled: unref(isUpdate),
        },
      },
    ]);
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增项目' : '编辑项目'));

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // 处理表单数据
      const formData = {
        ...values,
        id: unref(isUpdate) ? rowId.value : undefined,
      };

      // 调用API
      await saveProject(formData, unref(isUpdate));

      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: formData });
      createMessage.success(unref(isUpdate) ? '编辑成功！' : '新增成功！');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>