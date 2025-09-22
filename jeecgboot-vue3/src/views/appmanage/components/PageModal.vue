<!--页面配置弹窗-->
<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { pageFormSchema } from '../data/PageData';

  export default defineComponent({
    name: 'PageModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = message;
      const isUpdate = ref(true);
      const rowId = ref('');

      const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
        labelWidth: 100,
        baseColProps: { span: 24 },
        schemas: pageFormSchema,
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

        // 根据页面类型动态更新表单配置
        updateSchema([
          {
            field: 'config',
            show: data.record?.pageType === 'custom',
          },
        ]);
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增页面' : '编辑页面'));

      /**
       * 提交表单
       */
      async function handleSubmit() {
        try {
          const values = await validate();
          setModalProps({ confirmLoading: true });

          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));

          console.log('提交数据:', values);
          createMessage.success('操作成功');
          closeModal();
          emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
        } catch (error) {
          createMessage.error('操作失败');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      }

      return {
        registerModal,
        registerForm,
        getTitle,
        handleSubmit,
      };
    },
  });
</script>