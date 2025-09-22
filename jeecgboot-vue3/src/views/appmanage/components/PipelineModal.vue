<!--流水线配置弹窗-->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="1000"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { pipelineFormSchema } from '../data/PipelineData';
  import { message } from 'ant-design-vue';

  export default defineComponent({
    name: 'PipelineModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = message;
      const isUpdate = ref(true);
      const rowId = ref('');

      const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: pipelineFormSchema,
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
            steps: data.record.steps ? JSON.stringify(data.record.steps, null, 2) : '',
            environment: data.record.environment ? JSON.stringify(data.record.environment, null, 2) : '',
          });
        }

        // 只读模式
        if (data?.readonly) {
          updateSchema([
            {
              field: 'pipelineName',
              componentProps: { disabled: true },
            },
            {
              field: 'description',
              componentProps: { disabled: true },
            },
            {
              field: 'triggerType',
              componentProps: { disabled: true },
            },
            {
              field: 'triggerCondition',
              componentProps: { disabled: true },
            },
            {
              field: 'steps',
              componentProps: { disabled: true },
            },
            {
              field: 'environment',
              componentProps: { disabled: true },
            },
            {
              field: 'timeout',
              componentProps: { disabled: true },
            },
            {
              field: 'retryCount',
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
              field: 'pipelineName',
              componentProps: { disabled: false },
            },
            {
              field: 'description',
              componentProps: { disabled: false },
            },
            {
              field: 'triggerType',
              componentProps: { disabled: false },
            },
            {
              field: 'triggerCondition',
              componentProps: { disabled: false },
            },
            {
              field: 'steps',
              componentProps: { disabled: false },
            },
            {
              field: 'environment',
              componentProps: { disabled: false },
            },
            {
              field: 'timeout',
              componentProps: { disabled: false },
            },
            {
              field: 'retryCount',
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

      const getTitle = computed(() => (!unref(isUpdate) ? '新建流水线' : '编辑流水线'));

      /**
       * 提交表单
       */
      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });

          // 验证JSON格式
          if (values.steps) {
            try {
              JSON.parse(values.steps);
            } catch (error) {
              createMessage.error('步骤配置JSON格式错误');
              return;
            }
          }

          if (values.environment) {
            try {
              JSON.parse(values.environment);
            } catch (error) {
              createMessage.error('环境变量JSON格式错误');
              return;
            }
          }

          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (unref(isUpdate)) {
            createMessage.success('更新流水线成功');
          } else {
            createMessage.success('新建流水线成功');
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