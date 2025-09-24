<template>
  <div class="project-edit-page">
    <PageWrapper 
      :title="pageTitle" 
      content="项目信息编辑"
      contentBackground
      @back="handleBack"
    >
      <template #headerContent>
        <div class="page-header-content">
          <div class="breadcrumb">
            <a-breadcrumb>
              <a-breadcrumb-item>
                <router-link to="/project/list">项目管理</router-link>
              </a-breadcrumb-item>
              <a-breadcrumb-item>{{ pageTitle }}</a-breadcrumb-item>
            </a-breadcrumb>
          </div>
        </div>
      </template>

      <div class="project-edit-container">
        <ProjectStepForm
          :visible="true"
          :edit-data="editData"
          :is-modal="false"
          @success="handleSuccess"
          @cancel="handleCancel"
        />
      </div>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import ProjectStepForm from './components/ProjectStepForm.vue';
  import { getProjectDetail } from './Project.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  const editData = ref<any>({});
  const loading = ref(false);

  // 页面标题
  const pageTitle = computed(() => {
    return route.params.id ? '编辑项目' : '新建项目';
  });

  // 是否为编辑模式
  const isEdit = computed(() => {
    return !!route.params.id;
  });

  /**
   * 初始化数据
   */
  async function initData() {
    if (!isEdit.value) return;
    
    try {
      loading.value = true;
      const result = await getProjectDetail({ id: route.params.id });
      editData.value = result;
    } catch (error) {
      console.error('获取项目详情失败:', error);
      createMessage.error('获取项目详情失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 返回列表页
   */
  function handleBack() {
    router.push('/project/list');
  }

  /**
   * 保存成功回调
   */
  function handleSuccess() {
    createMessage.success(isEdit.value ? '项目更新成功' : '项目创建成功');
    router.push('/project/list');
  }

  /**
   * 取消操作
   */
  function handleCancel() {
    router.push('/project/list');
  }

  onMounted(() => {
    initData();
  });
</script>

<style lang="less" scoped>
  .project-edit-page {
    .page-header-content {
      .breadcrumb {
        margin-bottom: 16px;
      }
    }

    .project-edit-container {
      background: #fff;
      border-radius: 6px;
      padding: 24px;
      min-height: 600px;

      :deep(.ant-steps) {
        margin-bottom: 32px;
      }

      :deep(.step-form-container) {
        border: none;
        box-shadow: none;
        padding: 0;
      }

      :deep(.step-form-footer) {
        border-top: 1px solid #f0f0f0;
        margin-top: 32px;
        padding-top: 24px;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .project-edit-page {
      .project-edit-container {
        padding: 16px;
        margin: 0 -16px;
        border-radius: 0;
      }
    }
  }
</style>