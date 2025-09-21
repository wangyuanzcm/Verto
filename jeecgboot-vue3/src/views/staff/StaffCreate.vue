<template>
  <div class="staff-create">
    <PageWrapper title="新增人员" @back="goBack" content="添加新的人员信息">
      <template #extra>
        <a-button @click="goBack">取消</a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
          <Icon icon="ant-design:save-outlined" />
          保存
        </a-button>
      </template>

      <div class="staff-create-content">
        <a-card title="基本信息">
          <BasicForm @register="registerForm" />
        </a-card>
      </div>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formSchema } from './staff.data';
  import { createStaff } from './staff.api';

  const router = useRouter();
  const { createMessage } = useMessage();

  const submitLoading = ref(false);

  /**
   * 表单配置
   */
  const [registerForm, { validate, resetFields }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { lg: 12, md: 24 },
  });

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      submitLoading.value = true;
      const values = await validate();
      
      await createStaff(values);
      createMessage.success('新增成功');
      goBack();
    } catch (error) {
      createMessage.error('新增失败');
    } finally {
      submitLoading.value = false;
    }
  }

  /**
   * 重置表单
   */
  function handleReset() {
    resetFields();
  }

  /**
   * 返回列表页
   */
  function goBack() {
    router.push('/staff/list');
  }
</script>

<style lang="less" scoped>
  .staff-create {
    &-content {
      padding: 16px;
    }
  }
</style>