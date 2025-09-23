<template>
  <BasicModal 
    v-bind="$attrs" 
    @register="registerModal" 
    :title="getTitle" 
    @ok="handleSubmit"
    :width="600"
    class="project-modal"
  >
    <div class="project-form-container">
      <BasicForm @register="registerForm" />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../Project.data';
  import { saveProject } from '../Project.api';
  import { useMessage } from '/@/hooks/web/useMessage';

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
      createMessage.success(unref(isUpdate) ? '项目编辑成功！' : '项目新增成功！');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .project-form-container {
    padding: 16px 0;

    :deep(.ant-form) {
      .ant-form-item {
        margin-bottom: 20px;

        .ant-form-item-label {
          padding-bottom: 8px;

          label {
            font-weight: 500;
            color: #262626;
            font-size: 14px;

            &.ant-form-item-required::before {
              color: #ff4d4f;
              font-weight: 600;
            }
          }
        }

        .ant-form-item-control {
          .ant-input,
          .ant-select-selector,
          .ant-picker,
          .ant-input-number,
          .ant-input-affix-wrapper {
            border-radius: 8px;
            border: 1px solid #d9d9d9;
            transition: all 0.3s ease;
            padding: 8px 12px;

            &:hover {
              border-color: #40a9ff;
              box-shadow: 0 2px 4px rgba(64, 169, 255, 0.1);
            }

            &:focus,
            &.ant-input-focused,
            &.ant-select-focused .ant-select-selector,
            &.ant-picker-focused,
            &.ant-input-affix-wrapper-focused {
              border-color: #1890ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            }

            &:disabled,
            &.ant-input-disabled {
              background: #f5f5f5;
              border-color: #d9d9d9;
              color: #8c8c8c;
              cursor: not-allowed;
            }
          }

          .ant-select {
            .ant-select-selector {
              padding: 4px 8px;
            }
          }

          .ant-input-number {
            width: 100%;
          }

          .ant-input-affix-wrapper {
            padding: 0;

            .ant-input {
              border: none;
              box-shadow: none;
              padding: 8px 12px;

              &:focus {
                box-shadow: none;
              }
            }
          }

          // 文本域样式
          .ant-input {
            &[type="textarea"] {
              min-height: 80px;
              resize: vertical;
            }
          }
        }

        // 错误状态样式
        &.ant-form-item-has-error {
          .ant-form-item-control {
            .ant-input,
            .ant-select-selector,
            .ant-picker,
            .ant-input-number,
            .ant-input-affix-wrapper {
              border-color: #ff4d4f;

              &:hover,
              &:focus,
              &.ant-input-focused,
              &.ant-select-focused .ant-select-selector,
              &.ant-picker-focused,
              &.ant-input-affix-wrapper-focused {
                border-color: #ff4d4f;
                box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
              }
            }
          }

          .ant-form-item-explain-error {
            color: #ff4d4f;
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }
    }
  }

  :deep(.project-modal) {
    .ant-modal-header {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px;
    }

    .ant-modal-body {
      padding: 16px;
    }

    .ant-modal-footer {
      border-top: 1px solid #f0f0f0;
      padding: 16px;
    }
  }
</style>