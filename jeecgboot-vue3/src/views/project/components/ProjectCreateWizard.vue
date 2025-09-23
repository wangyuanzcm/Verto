<template>
  <BasicModal 
    v-bind="$attrs" 
    @register="registerModal" 
    title="创建项目" 
    :width="800"
    :showOkBtn="false"
    :showCancelBtn="false"
  >
    <div class="project-create-wizard">
      <a-steps :current="currentStep" class="mb-6">
        <a-step title="基本信息" description="选择任务类型和基本信息" />
        <a-step title="详细配置" description="配置项目详细信息" />
        <a-step title="开发设置" description="选择开发模式和Git配置" />
      </a-steps>

      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <BasicForm @register="registerBasicForm" />
      </div>

      <!-- 步骤2: 详细配置 -->
      <div v-show="currentStep === 1" class="step-content">
        <BasicForm @register="registerDetailForm" />
      </div>

      <!-- 步骤3: 开发设置 -->
      <div v-show="currentStep === 2" class="step-content">
        <BasicForm @register="registerDevForm" />
        
        <!-- Git分支创建选项 -->
        <div class="mt-4">
          <h4 class="mb-3">Git分支管理</h4>
          <div v-if="relatedApps.length > 0">
            <div v-for="app in relatedApps" :key="app.id" class="mb-4 p-4 border rounded">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ app.appName }}</span>
                <a-tag>{{ app.appType }}</a-tag>
              </div>
              <div class="text-sm text-gray-500 mb-2">{{ app.gitUrl }}</div>
              <a-radio-group 
                v-model:value="branchSettings[app.id]" 
                @change="updateBranchSetting(app.id, $event)"
              >
                <a-radio value="manual">手动创建分支</a-radio>
                <a-radio value="auto">自动创建分支</a-radio>
              </a-radio-group>
              <div v-if="branchSettings[app.id]" class="mt-2 text-sm">
                <span class="text-gray-600">分支名称: </span>
                <a-tag color="blue">{{ getBranchName(app.id) }}</a-tag>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">
            请先在详细配置中选择关联应用
          </div>
        </div>
      </div>

      <!-- 自定义步骤导航按钮 -->
      <div class="wizard-footer">
        <a-space>
          <a-button v-if="currentStep > 0" @click="prevStep">
            上一步
          </a-button>
          <a-button 
            v-if="currentStep < 2" 
            type="primary" 
            @click="nextStep"
            :disabled="!canNextStep"
          >
            下一步
          </a-button>
          <a-button 
            v-if="currentStep === 2" 
            type="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
            :disabled="!canSubmit"
          >
            创建项目
          </a-button>
          <a-button @click="handleCancel">
            取消
          </a-button>
        </a-space>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { 
    basicFormSchema, 
    detailFormSchema, 
    devFormSchema,
    TaskType 
  } from '../Project.data';
  import { 
    saveProject, 
    getAppList, 
    getTemplateList, 
    getUserList 
  } from '../Project.api';

  const emit = defineEmits(['success', 'register']);

  const { createMessage } = useMessage();
  const currentStep = ref(0);
  const relatedApps = ref([]);
  const branchSettings = ref({});
  const submitLoading = ref(false);

  // 基本信息表单
  const [registerBasicForm, { 
    validate: validateBasic, 
    getFieldsValue: getBasicValues,
    setFieldsValue: setBasicValues,
    resetFields: resetBasicFields 
  }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: basicFormSchema,
    showActionButtonGroup: false,
  });

  // 详细配置表单
  const [registerDetailForm, { 
    validate: validateDetail, 
    getFieldsValue: getDetailValues,
    setFieldsValue: setDetailValues,
    resetFields: resetDetailFields 
  }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: detailFormSchema,
    showActionButtonGroup: false,
  });

  // 开发设置表单
  const [registerDevForm, { 
    validate: validateDev, 
    getFieldsValue: getDevValues,
    setFieldsValue: setDevValues,
    resetFields: resetDevFields 
  }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: devFormSchema,
    showActionButtonGroup: false,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    resetBasicFields();
    resetDetailFields();
    resetDevFields();
    currentStep.value = 0;
    relatedApps.value = [];
    branchSettings.value = {};
    setModalProps({ confirmLoading: false });
    
    // 加载选项数据
    await loadOptionsData();
  });

  /**
   * 加载选项数据
   */
  async function loadOptionsData() {
    try {
      // 加载应用列表
      const appListRes = await getAppList();
      const appOptions = appListRes.records?.map(app => ({
        label: app.appName,
        value: app.id,
      })) || [];

      // 加载用户列表
      const userListRes = await getUserList();
      const userOptions = userListRes.records?.map(user => ({
        label: user.realname || user.username,
        value: user.id,
      })) || [];

      // 加载开发模板列表
      const templateListRes = await getTemplateList();
      const templateOptions = templateListRes.records?.map(template => ({
        label: template.templateName,
        value: template.id,
      })) || [];

      // 更新表单选项
      updateDetailFormOptions(appOptions, userOptions);
      updateDevFormOptions(templateOptions);
    } catch (error) {
      console.error('加载选项数据失败:', error);
    }
  }

  /**
   * 更新详细配置表单选项
   */
  function updateDetailFormOptions(appOptions: any[], userOptions: any[]) {
    // 这里需要动态更新表单选项，但由于useForm的限制，
    // 我们可以通过重新设置schemas来实现
    // 实际项目中可能需要使用updateSchema方法
  }

  /**
   * 更新开发设置表单选项
   */
  function updateDevFormOptions(templateOptions: any[]) {
    // 同上，更新模板选项
  }

  // 监听关联应用变化
  watch(() => getDetailValues()?.relatedApps, async (newApps) => {
    if (newApps && newApps.length > 0) {
      try {
        const appDetails = await getAppList({ ids: newApps });
        relatedApps.value = appDetails;
        // 初始化分支设置
        const settings = {};
        appDetails.forEach(app => {
          settings[app.id] = 'manual';
        });
        branchSettings.value = settings;
      } catch (error) {
        console.error('获取应用详情失败:', error);
      }
    } else {
      relatedApps.value = [];
      branchSettings.value = {};
    }
  }, { deep: true });

  /**
   * 检查是否可以进入下一步
   */
  const canNextStep = computed(() => {
    if (currentStep.value === 0) {
      const basicValues = getBasicValues();
      return basicValues?.projectName && basicValues?.taskType;
    }
    if (currentStep.value === 1) {
      const detailValues = getDetailValues();
      return detailValues?.relatedApps && detailValues.relatedApps.length > 0;
    }
    return true;
  });

  /**
   * 检查是否可以提交
   */
  const canSubmit = computed(() => {
    return currentStep.value === 2 && canNextStep.value;
  });

  /**
   * 下一步
   */
  async function nextStep() {
    try {
      if (currentStep.value === 0) {
        await validateBasic();
      } else if (currentStep.value === 1) {
        await validateDetail();
      }
      currentStep.value++;
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  }

  /**
   * 上一步
   */
  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  /**
   * 更新分支设置
   */
  function updateBranchSetting(appId: string, event: any) {
    branchSettings.value[appId] = event.target.value;
  }

  /**
   * 获取分支名称
   */
  function getBranchName(appId: string) {
    const basicValues = getBasicValues();
    const taskType = basicValues?.taskType;
    const taskId = taskType === TaskType.REQUIREMENT ? 
      basicValues?.requirementId : 
      basicValues?.bugId;
    
    if (!taskId) return '';
    
    const prefix = taskType === TaskType.REQUIREMENT ? 'feature' : 'fix';
    return `${prefix}-${taskId}`;
  }

  /**
   * 取消操作
   */
  function handleCancel() {
    closeModal();
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      // 验证所有表单
      const basicValues = await validateBasic();
      const detailValues = await validateDetail();
      const devValues = await validateDev();

      submitLoading.value = true;

      // 合并表单数据
      const formData = {
        ...basicValues,
        ...detailValues,
        ...devValues,
        branchSettings: branchSettings.value,
        gitBranches: Object.keys(branchSettings.value).map(appId => ({
          appId,
          branchName: getBranchName(appId),
          createMode: branchSettings.value[appId],
          status: 'PENDING'
        }))
      };

      // 调用API
      await saveProject(formData, false);

      closeModal();
      emit('success', { isUpdate: false, values: formData });
      createMessage.success('项目创建成功！');
    } catch (error) {
      console.error('项目创建失败:', error);
      createMessage.error('项目创建失败，请检查表单信息');
    } finally {
      submitLoading.value = false;
    }
  }
</script>

<style lang="less" scoped>
  .project-create-wizard {
    padding: 8px 0;

    :deep(.ant-steps) {
      margin-bottom: 16px;
      padding: 0 8px;
    }

    .step-content {
      background: #fff;
      padding: 16px;
      margin: 0 8px;
      border: 1px solid #f0f0f0;

      .step-title {
        font-size: 16px;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .form-section {
        margin-bottom: 16px;

        .section-title {
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    h4 {
      font-size: 14px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f0f0f0;
    }

    .border-t {
      border-top: 1px solid #f0f0f0;
      padding-top: 16px;
      margin-top: 16px;
    }

    .wizard-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      text-align: right;
      margin: 0 -24px -24px;
    }
  }
</style>