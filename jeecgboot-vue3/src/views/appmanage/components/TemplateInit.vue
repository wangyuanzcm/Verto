<!--模板初始化-->
<template>
  <div class="template-init-container">
    <!-- 模板选择区域 -->
    <div class="template-selection">
      <a-card title="选择应用模板" :bordered="false">
        <a-row :gutter="[16, 16]">
          <a-col :span="8" v-for="template in templateList" :key="template.id">
            <a-card
              hoverable
              :class="['template-card', { active: selectedTemplate?.id === template.id }]"
              @click="handleSelectTemplate(template)"
            >
              <template #cover>
                <div class="template-cover">
                  <Icon :icon="template.icon" :size="48" />
                </div>
              </template>
              <a-card-meta
                :title="template.name"
                :description="template.description"
              />
              <div class="template-tags">
                <a-tag v-for="tag in template.tags" :key="tag" :color="getTagColor(tag)">
                  {{ tag }}
                </a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 配置区域 -->
    <div class="template-config" v-if="selectedTemplate">
      <a-card title="模板配置" :bordered="false">
        <BasicForm @register="registerForm" />
        
        <div class="config-actions">
          <a-space>
            <a-button @click="handlePreview" :loading="previewLoading">
              <template #icon><EyeOutlined /></template>
              预览配置
            </a-button>
            <a-button type="primary" @click="handleInitialize" :loading="initLoading">
              <template #icon><RocketOutlined /></template>
              初始化应用
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>

    <!-- 预览弹窗 -->
    <a-modal
      v-model:open="previewVisible"
      title="配置预览"
      :width="800"
      :footer="null"
    >
      <div class="preview-content">
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="应用名称">{{ previewData.appName }}</a-descriptions-item>
          <a-descriptions-item label="应用描述">{{ previewData.appDescription }}</a-descriptions-item>
          <a-descriptions-item label="模板类型">{{ selectedTemplate?.name }}</a-descriptions-item>
          <a-descriptions-item label="版本">{{ previewData.version }}</a-descriptions-item>
        </a-descriptions>
        
        <a-divider />
        
        <h4>目录结构预览</h4>
        <pre class="directory-tree">{{ directoryTree }}</pre>
        
        <a-divider />
        
        <h4>配置文件预览</h4>
        <a-tabs>
          <a-tab-pane key="package" tab="package.json">
            <pre class="config-preview">{{ packageJsonPreview }}</pre>
          </a-tab-pane>
          <a-tab-pane key="config" tab="配置文件">
            <pre class="config-preview">{{ configPreview }}</pre>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 初始化进度弹窗 -->
    <a-modal
      v-model:open="progressVisible"
      title="初始化进度"
      :width="600"
      :footer="null"
      :closable="false"
      :maskClosable="false"
    >
      <div class="progress-content">
        <a-steps :current="currentStep" direction="vertical" size="small">
          <a-step
            v-for="(step, index) in initSteps"
            :key="index"
            :title="step.title"
            :description="step.description"
            :status="getStepStatus(index)"
          />
        </a-steps>
        
        <div class="progress-actions" v-if="initCompleted">
          <a-result
            status="success"
            title="应用初始化成功！"
            sub-title="您的应用已成功创建，可以开始开发了。"
          >
            <template #extra>
              <a-space>
                <a-button type="primary" @click="handleViewApp">查看应用</a-button>
                <a-button @click="handleClose">关闭</a-button>
              </a-space>
            </template>
          </a-result>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, reactive } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Icon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';
  import { EyeOutlined, RocketOutlined } from '@ant-design/icons-vue';
  import { templateList, getTemplateFormSchema } from '../data/TemplateData';

  export default defineComponent({
    name: 'TemplateInit',
    components: {
      BasicForm,
      Icon,
      EyeOutlined,
      RocketOutlined,
    },
    setup() {
      const { createMessage } = message;
      const selectedTemplate = ref(null);
      const previewVisible = ref(false);
      const progressVisible = ref(false);
      const previewLoading = ref(false);
      const initLoading = ref(false);
      const currentStep = ref(0);
      const initCompleted = ref(false);

      const previewData = reactive({
        appName: '',
        appDescription: '',
        version: '1.0.0',
      });

      const initSteps = [
        { title: '创建项目目录', description: '正在创建项目基础目录结构...' },
        { title: '下载模板文件', description: '正在下载模板文件和依赖...' },
        { title: '生成配置文件', description: '正在生成项目配置文件...' },
        { title: '安装依赖包', description: '正在安装项目依赖包...' },
        { title: '初始化Git仓库', description: '正在初始化Git仓库...' },
        { title: '完成初始化', description: '项目初始化完成！' },
      ];

      const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: [],
        showActionButtonGroup: false,
      });

      const directoryTree = computed(() => {
        if (!selectedTemplate.value) return '';
        
        return `${previewData.appName}/
├── src/
│   ├── components/
│   ├── views/
│   ├── router/
│   ├── store/
│   ├── utils/
│   └── main.ts
├── public/
├── tests/
├── docs/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md`;
      });

      const packageJsonPreview = computed(() => {
        return JSON.stringify({
          name: previewData.appName,
          version: previewData.version,
          description: previewData.appDescription,
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
            test: 'vitest',
            lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore',
          },
          dependencies: selectedTemplate.value?.dependencies || {},
          devDependencies: selectedTemplate.value?.devDependencies || {},
        }, null, 2);
      });

      const configPreview = computed(() => {
        return selectedTemplate.value?.configTemplate || '// 配置文件内容';
      });

      /**
       * 获取标签颜色
       */
      function getTagColor(tag: string) {
        const colorMap = {
          'Vue3': 'green',
          'React': 'blue',
          'Angular': 'red',
          'TypeScript': 'purple',
          'JavaScript': 'orange',
          '管理后台': 'cyan',
          '移动端': 'magenta',
          '桌面应用': 'geekblue',
          '微服务': 'lime',
          '单页应用': 'gold',
        };
        return colorMap[tag] || 'default';
      }

      /**
       * 选择模板
       */
      function handleSelectTemplate(template) {
        selectedTemplate.value = template;
        
        // 更新表单配置
        const formSchemas = getTemplateFormSchema(template.type);
        registerForm.updateSchema(formSchemas);
        
        // 重置表单
        resetFields();
        
        // 设置默认值
        setFieldsValue({
          appName: `my-${template.type}-app`,
          appDescription: `基于${template.name}模板创建的应用`,
          version: '1.0.0',
        });
      }

      /**
       * 预览配置
       */
      async function handlePreview() {
        try {
          previewLoading.value = true;
          const values = await validate();
          
          Object.assign(previewData, values);
          previewVisible.value = true;
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          previewLoading.value = false;
        }
      }

      /**
       * 初始化应用
       */
      async function handleInitialize() {
        try {
          initLoading.value = true;
          const values = await validate();
          
          Object.assign(previewData, values);
          
          // 显示进度弹窗
          progressVisible.value = true;
          currentStep.value = 0;
          initCompleted.value = false;
          
          // 模拟初始化过程
          for (let i = 0; i < initSteps.length; i++) {
            currentStep.value = i;
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          
          initCompleted.value = true;
          createMessage.success('应用初始化成功！');
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          initLoading.value = false;
        }
      }

      /**
       * 获取步骤状态
       */
      function getStepStatus(index: number) {
        if (index < currentStep.value) return 'finish';
        if (index === currentStep.value && !initCompleted.value) return 'process';
        if (index === currentStep.value && initCompleted.value) return 'finish';
        return 'wait';
      }

      /**
       * 查看应用
       */
      function handleViewApp() {
        // 跳转到应用详情页
        createMessage.info('跳转到应用详情页...');
        handleClose();
      }

      /**
       * 关闭弹窗
       */
      function handleClose() {
        progressVisible.value = false;
        currentStep.value = 0;
        initCompleted.value = false;
      }

      return {
        templateList,
        selectedTemplate,
        previewVisible,
        progressVisible,
        previewLoading,
        initLoading,
        currentStep,
        initCompleted,
        previewData,
        initSteps,
        directoryTree,
        packageJsonPreview,
        configPreview,
        registerForm,
        getTagColor,
        handleSelectTemplate,
        handlePreview,
        handleInitialize,
        getStepStatus,
        handleViewApp,
        handleClose,
      };
    },
  });
</script>

<style lang="less" scoped>
  .template-init-container {
    .template-selection {
      margin-bottom: 24px;
      
      .template-card {
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        &.active {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        
        .template-cover {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80px;
          background: #f5f5f5;
        }
        
        .template-tags {
          margin-top: 8px;
        }
      }
    }
    
    .template-config {
      .config-actions {
        margin-top: 24px;
        text-align: center;
      }
    }
    
    .preview-content {
      .directory-tree,
      .config-preview {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        max-height: 300px;
        overflow-y: auto;
      }
    }
    
    .progress-content {
      .progress-actions {
        margin-top: 24px;
      }
    }
  }
</style>