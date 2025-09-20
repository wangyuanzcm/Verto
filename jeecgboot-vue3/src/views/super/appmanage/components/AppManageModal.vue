<!--应用管理增删改查弹窗组件-->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="800"
    @ok="handleSubmit"
    :confirmLoading="confirmLoading"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { useMessage } from '@/hooks/web/useMessage';
  import { saveApp } from '../AppManage.api';
  import { formSchema } from '../AppManage.data';
  import type { AppManageModel } from '../AppManage.data';

  export default {
    name: 'AppManageModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const isUpdate = ref(true);
      const rowId = ref('');
      const confirmLoading = ref(false);

      const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
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
      });

      /**
       * 弹窗标题
       */
      const getTitle = computed(() => (!unref(isUpdate) ? '新增应用' : '编辑应用'));

      /**
       * 提交表单
       */
      async function handleSubmit() {
        try {
          const values = await validate();
          confirmLoading.value = true;
          setModalProps({ confirmLoading: true });

          // 构建提交数据
          const submitData: Partial<AppManageModel> = {
            ...values,
          };

          if (unref(isUpdate)) {
            submitData.id = rowId.value;
          }

          // 调用API
          const result = await saveApp(submitData);

          if (result?.success) {
            handleSuccess();
          }
        } catch (error) {
          console.error('提交失败:', error);
          createMessage.error('提交失败，请检查表单数据');
        } finally {
          confirmLoading.value = false;
          setModalProps({ confirmLoading: false });
        }
      }

      /**
       * 提交成功回调
       */
      function handleSuccess() {
        createMessage.success(unref(isUpdate) ? '编辑成功' : '新增成功');
        closeModal();
        emit('success');
      }

      return {
        registerModal,
        registerForm,
        getTitle,
        handleSubmit,
        confirmLoading,
      };
    },
  };
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    font-weight: 500;
  }

  :deep(.ant-input),
  :deep(.ant-select-selector),
  :deep(.ant-input-number) {
    border-radius: 6px;
  }

  :deep(.ant-form-item-explain-error) {
    font-size: 12px;
  }
</style>