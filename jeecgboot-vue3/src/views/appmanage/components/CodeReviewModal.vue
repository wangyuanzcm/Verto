<!--代码审查规则弹窗-->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="900"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { codeReviewFormSchema } from '../data/CodeReviewData';
  import { message } from 'ant-design-vue';

  export default defineComponent({
    name: 'CodeReviewModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = message;
      const isUpdate = ref(true);
      const rowId = ref('');

      const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: codeReviewFormSchema,
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

        // 只读模式
        if (data?.readonly) {
          updateSchema([
            {
              field: 'ruleName',
              componentProps: { disabled: true },
            },
            {
              field: 'ruleType',
              componentProps: { disabled: true },
            },
            {
              field: 'severity',
              componentProps: { disabled: true },
            },
            {
              field: 'description',
              componentProps: { disabled: true },
            },
            {
              field: 'pattern',
              componentProps: { disabled: true },
            },
            {
              field: 'fileExtensions',
              componentProps: { disabled: true },
            },
            {
              field: 'excludePaths',
              componentProps: { disabled: true },
            },
            {
              field: 'autoFix',
              componentProps: { disabled: true },
            },
            {
              field: 'status',
              componentProps: { disabled: true },
            },
          ]);
          setModalProps({ showOkBtn: false });
        } else {
          updateSchema([
            {
              field: 'ruleName',
              componentProps: { disabled: false },
            },
            {
              field: 'ruleType',
              componentProps: { disabled: false },
            },
            {
              field: 'severity',
              componentProps: { disabled: false },
            },
            {
              field: 'description',
              componentProps: { disabled: false },
            },
            {
              field: 'pattern',
              componentProps: { disabled: false },
            },
            {
              field: 'fileExtensions',
              componentProps: { disabled: false },
            },
            {
              field: 'excludePaths',
              componentProps: { disabled: false },
            },
            {
              field: 'autoFix',
              componentProps: { disabled: false },
            },
            {
              field: 'status',
              componentProps: { disabled: false },
            },
          ]);
          setModalProps({ showOkBtn: true });
        }
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增审查规则' : '编辑审查规则'));

      /**
       * 提交表单
       */
      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });

          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (unref(isUpdate)) {
            createMessage.success('更新审查规则成功');
          } else {
            createMessage.success('新增审查规则成功');
          }

          closeModal();
          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
        } catch (error) {
          createMessage.error('操作失败');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return { registerModal, registerForm, getTitle, handleSubmit };
    },
  });
</script>