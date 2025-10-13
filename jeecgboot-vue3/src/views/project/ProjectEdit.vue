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
        <BasicForm @register="registerForm">
          <template #designLinks="{ model, field }">
            <div class="design-links">
              <div v-for="(link, index) in model[field]" :key="index" class="design-link-item">
                <a-input-group compact>
                  <a-input v-model:value="link.title" style="width: 150px" placeholder="链接标题" />
                  <a-input v-model:value="link.url" style="width: calc(100% - 300px)" placeholder="链接地址" />
                  <a-button type="text" danger @click="removeDesignLink(model[field], index)" style="width: 50px">删除</a-button>
                </a-input-group>
              </div>
              <a-button type="dashed" @click="addDesignLink(model[field])" style="width: 100%; margin-top: 8px">
                <PlusOutlined />
                添加设计链接
              </a-button>
            </div>
          </template>
        </BasicForm>
        <div class="page-actions">
          <a-button type="primary" @click="handleSubmit">保存</a-button>
          <a-button style="margin-left: 8px" @click="handleCancel">取消</a-button>
        </div>
      </div>
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { BasicForm, useForm } from '/@/components/Form';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { message } from 'ant-design-vue';
  import { getProjectDetail, saveProject, updateProject } from './Project.api';
  import { step1Schemas, step2Schemas, step3Schemas, ProjectType, ProjectModel } from './Project.data';

  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  const loading = ref(false);
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({
    labelWidth: 120,
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
    schemas: [...step1Schemas, ...step2Schemas, ...step3Schemas],
  });

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
    if (!isEdit.value) {
      resetFields();
      setFieldsValue({ designLinks: [] });
      return;
    }
    
    try {
      loading.value = true;
      const result = await getProjectDetail({ id: route.params.id });
      // 设计链接可能为字符串，需解析为数组
      let designLinks = result.designLinks;
      if (typeof designLinks === 'string') {
        try {
          designLinks = JSON.parse(designLinks);
        } catch (e) {
          designLinks = [];
        }
      }
      if (!Array.isArray(designLinks)) {
        designLinks = [];
      }

      const initial = {
        id: result.id,
        type: result.projectType,
        requirementId: result.requirementId,
        bugId: result.bugId,
        title: result.title,
        description: result.description,
        appId: {
          value: result.relatedAppId,
          label: result.relatedAppName || '',
        },
        developerId: {
          value: result.developerId,
          label: result.developerName || '',
        },
        status: result.status,
        priority: result.priority,
        gitBranch: result.gitBranch,
        designLinks,
        startTime: result.startTime,
        testTime: result.testTime,
        onlineTime: result.onlineTime,
        releaseTime: result.releaseTime,
        remark: result.remark,
      };
      setFieldsValue(initial);
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

  function computeBranch(values: any) {
    if (values?.type === ProjectType.REQUIREMENT && values?.requirementId) {
      return `feature/REQ-${values.requirementId}`;
    }
    if (values?.type === ProjectType.BUG && values?.bugId) {
      return `bugfix/BUG-${values.bugId}`;
    }
    return values?.gitBranch || '';
  }

  async function handleSubmit() {
    try {
      const values = await validate();

      // 基本校验
      if (values.type === ProjectType.REQUIREMENT && !values.requirementId) {
        message.error('请输入需求ID');
        return;
      }
      if (values.type === ProjectType.BUG && !values.bugId) {
        message.error('请输入BUG ID');
        return;
      }
      if (!values.title?.trim()) {
        message.error('请输入项目标题');
        return;
      }
      if (!values.appId) {
        message.error('请选择关联应用');
        return;
      }
      if (!values.developerId) {
        message.error('请选择开发人员');
        return;
      }

      const gitBranch = computeBranch(values);

      const payload: ProjectModel = {
        id: values.id,
        projectType: values.type,
        requirementId: values.requirementId,
        bugId: values.bugId,
        title: values.title,
        description: values.description,
        relatedAppId: values.appId?.value ?? values.appId,
        relatedAppName: values.appId?.label,
        developerId: values.developerId?.value ?? values.developerId,
        developerName: values.developerId?.label,
        designLinks: values.designLinks || [],
        startTime: values.startTime,
        testTime: values.testTime,
        onlineTime: values.onlineTime,
        releaseTime: values.releaseTime,
        status: values.status,
        priority: values.priority,
        gitBranch,
      } as ProjectModel;

      if (isEdit.value) {
        await updateProject(payload);
        createMessage.success('项目更新成功');
      } else {
        await saveProject(payload);
        createMessage.success('项目创建成功');
      }
      router.push('/project/list');
    } catch (e) {
      console.error(e);
      message.error('提交失败，请检查表单信息');
    }
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