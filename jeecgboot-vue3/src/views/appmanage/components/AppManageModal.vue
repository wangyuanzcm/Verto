<!--应用管理增删改查弹窗组件-->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="800"
    @ok="handleSubmit"
    :confirmLoading="confirmLoading"
    :okText="getOkText"
    :cancelText="getCancelText"
    @cancel="handleCancel"
  >
    <!-- 步骤条 -->
    <div v-if="!isUpdate" class="steps-wrapper">
      <a-steps :current="currentStep">
        <a-step title="选择模板" />
        <a-step title="应用信息" />
      </a-steps>
    </div>
    
    <!-- 模板选择 -->
    <AppTemplateSelect 
      v-if="!isUpdate && currentStep === 0" 
      @next="handleTemplateNext" 
      @select="handleTemplateSelect"
    />
    
    <!-- 应用信息表单 -->
    <BasicForm v-show="isUpdate || currentStep === 1" @register="registerForm">
      <template #managers="{ model, field }">
        <StaffSelectUser 
          v-model:value="model[field]" 
          placeholder="请选择应用负责人"
          :mode="'multiple'"
          :labelInValue="true"
        />
      </template>
      <!-- 现有项目：Git地址下拉（可搜索） -->
      <template #gitUrl="{ model, field }">
        <a-select
          v-model:value="model[field]"
          :options="gitUrlOptions"
          show-search
          :filter-option="false"
          allow-clear
          placeholder="请选择或搜索已有仓库"
          @search="onGitSearch"
          style="width: 100%"
        />
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts">
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveApp, editApp, createGitRepo, getGitRepos } from '../AppManage.api';
  import { formSchema } from '../AppManage.data';
  import type { AppManageModel } from '../AppManage.data';
  import AppTemplateSelect from './AppTemplateSelect.vue';
  import StaffSelectUser from './StaffSelectUser.vue';

  export default {
    name: 'AppManageModal',
    components: { BasicModal, BasicForm, AppTemplateSelect ,StaffSelectUser},
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const isUpdate = ref(true);
      const rowId = ref('');
      const confirmLoading = ref(false);
      const currentStep = ref(0);
      const selectedTemplate = ref('');
      const selectedTemplateDetail = ref(null);

      const gitUrlOptions = ref<Array<{ label: string; value: string }>>([]);
      const selectedGitPrefix = ref<string>('');
      const envGitPrefix = (import.meta as any)?.env?.VITE_GIT_PREFIX || (import.meta as any)?.env?.VITE_GITHUB_PREFIX || '';

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
        currentStep.value = 0;
        selectedTemplate.value = '';
        selectedTemplateDetail.value = null;

        // 使用环境变量作为固定的 Git 前缀
        selectedGitPrefix.value = (envGitPrefix || '').trim();

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
      const getTitle = computed(() => {
        if (unref(isUpdate)) {
          return '编辑应用';
        }
        return currentStep.value === 0 ? '选择应用模板' : '新增应用';
      });

      /**
       * 确认按钮文本
       */
      const getOkText = computed(() => {
        if (unref(isUpdate)) {
          return '确定';
        }
        return currentStep.value === 0 ? '下一步' : '确定';
      });

      /**
       * 取消按钮文本
       */
      const getCancelText = computed(() => {
        if (unref(isUpdate) || currentStep.value === 0) {
          return '取消';
        }
        return '上一步';
      });

      /**
       * 处理模板选择
       * @param template 选中的模板ID
       * @param templateDetail 模板详情
       */
      function handleTemplateSelect(template: string, templateDetail: any) {
        selectedTemplate.value = template;
        selectedTemplateDetail.value = templateDetail;
      }

      /**
       * 处理模板选择下一步
       */
      async function handleTemplateNext(template: string) {
        selectedTemplate.value = template;
        currentStep.value = 1;
        
        // 根据模板类型设置默认值
        setFieldsValue({
          appType: template === 'blank' ? '0' : template === 'standard' ? '1' : '2',
          templateType: template,
          projectSource: 'new',
        });

        // 不再调用后端获取前缀，前缀从前端环境变量读取
      }

      /**
       * 处理取消按钮点击
       */
      function handleCancel() {
        if (!unref(isUpdate) && currentStep.value === 1) {
          // 如果是新增且在第二步，返回第一步
          currentStep.value = 0;
        } else {
          // 否则关闭弹窗
          closeModal();
        }
      }

      /**
       * 提交表单
       */
      async function handleSubmit() {
        // 如果是新增且在第一步，进入第二步
        if (!unref(isUpdate) && currentStep.value === 0) {
          if (!selectedTemplate.value) {
            createMessage.warning('请先选择一个应用模板');
            return;
          }
          currentStep.value = 1;
          return;
        }

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
          } else {
            // 新增时添加模板信息
            submitData.templateType = selectedTemplate.value;
            
            // 添加初始化命令（如果有）
            if (selectedTemplateDetail.value && selectedTemplateDetail.value.initCommand) {
              submitData.initCommand = selectedTemplateDetail.value.initCommand;
            }
          }

          // 如果是新增并选择了“创建新项目”，先创建Git仓库
          if (!unref(isUpdate) && values.projectSource === 'new') {
            try {
              // 组合新项目仓库地址：所有者前缀 + 仓库名称（不再拼接项目类型路径）
              const prefix = selectedGitPrefix.value || '';
              const path = values.appPath || '';
              const name = values.repoName || '';

              // 生成仓库名：项目类型-项目名称（例如 web-user-center）
              const repoName = path ? `${path}-${name}` : name;
              const buildGitUrl = (p: string, r: string) => {
                if (!p) return '';
                const _p = p.endsWith('/') ? p.slice(0, -1) : p;
                const _r = r ? `/${r}` : '';
                return `${_p}${_r}`;
              };
              const repoUrl = buildGitUrl(envGitPrefix, repoName);

              if (!name) {
                createMessage.error('项目名称缺失');
                confirmLoading.value = false;
                setModalProps({ confirmLoading: false });
                return;
              }
              if (!envGitPrefix) {
                createMessage.error('未获取到GitHub账户前缀，请先完成账号绑定或授权');
                confirmLoading.value = false;
                setModalProps({ confirmLoading: false });
                return;
              }

              // 写入到提交数据
              submitData.gitUrl = repoUrl as any;

              // 不再从 Cookie 读取 GitHub OAuth Token，改为由后端代理使用绑定令牌
              const gitResp = await createGitRepo({
                gitUrl: repoUrl,
                visibility: 'private',
              });
              if (!gitResp?.success) {
                createMessage.error(gitResp?.message || '创建Git仓库失败');
                confirmLoading.value = false;
                setModalProps({ confirmLoading: false });
                return;
              }
              // 使用后端返回的仓库地址（如有）
              if (gitResp?.result?.repoUrl) {
                submitData.gitUrl = gitResp.result.repoUrl;
              }
            } catch (e) {
              console.error('创建Git仓库异常:', e);
              createMessage.error('创建Git仓库异常，请检查权限或令牌');
              confirmLoading.value = false;
              setModalProps({ confirmLoading: false });
              return;
            }
          }

          // 调用API（更新使用 edit，新增使用 save）
          const result = unref(isUpdate)
            ? await editApp(submitData)
            : await saveApp(submitData);
          console.log(result,'result')
          if (result?.success) {
            handleSuccess(result.result);
          } else {
            createMessage.error(result?.message || '提交失败');
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
      function handleSuccess(result) {
        createMessage.success(unref(isUpdate) ? '编辑成功' : '新增成功');
        closeModal();
        emit('success', result); // 传递创建的应用信息，用于跳转到应用详情页
      }
      
      // 搜索现有仓库
      async function onGitSearch(query: string) {
        try {
          const resp = await getGitRepos({ query });
          const list = resp?.result?.repos || resp?.result || [];
          gitUrlOptions.value = (list || []).slice(0, 50).map((item: any) => ({
            label: item?.name ? `${item.name} (${item.clone_url || item.httpUrlToRepo || item.ssh_url || item.url})` : (item?.clone_url || item?.httpUrlToRepo || item?.ssh_url || item?.url || ''),
            value: item?.clone_url || item?.httpUrlToRepo || item?.ssh_url || item?.url || '',
          })).filter((opt: any) => !!opt.value);
        } catch (e) {
          console.warn('搜索仓库失败', e);
        }
      }

      return {
        registerModal,
        registerForm,
        getTitle,
        getOkText,
        getCancelText,
        handleSubmit,
        handleCancel,
        handleTemplateNext,
        handleTemplateSelect,
        confirmLoading,
        isUpdate,
        currentStep,
        gitUrlOptions,
        onGitSearch,
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
  
  .steps-wrapper {
    margin-bottom: 24px;
    padding: 0 20px;
  }
</style>