<template>
  <div class="development-mode-selector">
    <div class="mode-header">
      <h3 class="title">选择开发模式</h3>
      <p class="description">根据项目复杂度和团队规模选择合适的开发模式</p>
    </div>

    <!-- 开发模式选择卡片 -->
    <div class="mode-cards">
      <div 
        v-for="mode in developmentModes" 
        :key="mode.level"
        class="mode-card"
        :class="{ 'selected': selectedMode === mode.level }"
        @click="handleSelectMode(mode.level)"
      >
        <div class="card-header">
          <div class="mode-icon">
            <Icon :icon="mode.icon" :size="32" />
          </div>
          <div class="mode-info">
            <h4 class="mode-title">{{ mode.title }}</h4>
            <p class="mode-subtitle">{{ mode.subtitle }}</p>
          </div>
          <div class="selection-indicator">
            <a-radio :checked="selectedMode === mode.level" />
          </div>
        </div>
        
        <div class="card-content">
          <div class="features">
            <h5>特性</h5>
            <ul>
              <li v-for="feature in mode.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
          
          <div class="workflow">
            <h5>开发流程</h5>
            <div class="workflow-steps">
              <div 
                v-for="(step, index) in mode.workflow" 
                :key="index"
                class="workflow-step"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">{{ step }}</div>
              </div>
            </div>
          </div>
          
          <div class="suitable-for">
            <h5>适用场景</h5>
            <div class="scenarios">
              <a-tag 
                v-for="scenario in mode.suitableFor" 
                :key="scenario"
                :color="mode.color"
              >
                {{ scenario }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式详细配置 -->
    <div v-if="selectedMode" class="mode-configuration">
      <a-card title="开发模式配置" :bordered="false">
        <BasicForm @register="registerConfigForm" />
        
        <!-- 分支策略配置 -->
        <div class="branch-strategy">
          <h4>分支策略</h4>
          <div class="strategy-diagram">
            <div class="branch-flow">
              <div 
                v-for="branch in getCurrentModeConfig().branchStrategy" 
                :key="branch.name"
                class="branch-item"
              >
                <div class="branch-line" :style="{ backgroundColor: branch.color }"></div>
                <div class="branch-info">
                  <span class="branch-name">{{ branch.name }}</span>
                  <span class="branch-desc">{{ branch.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 部署流水线配置 -->
        <div class="pipeline-config">
          <h4>部署流水线</h4>
          <div class="pipeline-stages">
            <div 
              v-for="(stage, index) in getCurrentModeConfig().pipeline" 
              :key="stage.name"
              class="pipeline-stage"
            >
              <div class="stage-icon">
                <Icon :icon="stage.icon" />
              </div>
              <div class="stage-info">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-desc">{{ stage.description }}</div>
              </div>
              <div v-if="index < getCurrentModeConfig().pipeline.length - 1" class="stage-arrow">
                <Icon icon="ant-design:arrow-right-outlined" />
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 操作按钮 -->
    <div class="mode-actions">
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button 
          type="primary" 
          :disabled="!selectedMode"
          @click="handleConfirm"
        >
          确认选择
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form/index';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface Props {
    projectId?: string;
    currentMode?: string;
  }

  interface Emits {
    (e: 'confirm', mode: string, config: any): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  const { createMessage } = useMessage();

  // 选中的开发模式
  const selectedMode = ref(props.currentMode || '');

  // 开发模式定义
  const developmentModes = [
    {
      level: 'L1',
      title: 'L1 - 简单模式',
      subtitle: '适合小型项目和快速原型',
      icon: 'ant-design:rocket-outlined',
      color: 'green',
      features: [
        '单分支开发',
        '简化的代码审查',
        '快速部署',
        '最小化流程',
      ],
      workflow: [
        '需求分析',
        '直接在主分支开发',
        '简单测试',
        '直接部署',
      ],
      suitableFor: [
        '个人项目',
        '原型开发',
        '小型应用',
        '快速迭代',
      ],
      branchStrategy: [
        { name: 'main', description: '主分支，直接开发和部署', color: '#52c41a' },
      ],
      pipeline: [
        { name: '代码提交', description: '提交代码到主分支', icon: 'ant-design:code-outlined' },
        { name: '自动测试', description: '运行基础测试用例', icon: 'ant-design:bug-outlined' },
        { name: '自动部署', description: '直接部署到生产环境', icon: 'ant-design:cloud-upload-outlined' },
      ],
    },
    {
      level: 'L2',
      title: 'L2 - 标准模式',
      subtitle: '适合中型项目和团队协作',
      icon: 'ant-design:team-outlined',
      color: 'blue',
      features: [
        'Feature分支开发',
        '代码审查流程',
        '分环境部署',
        '自动化测试',
      ],
      workflow: [
        '需求分析',
        '创建Feature分支',
        '开发和测试',
        '代码审查',
        '合并到主分支',
        '部署到各环境',
      ],
      suitableFor: [
        '团队项目',
        '中型应用',
        '标准开发流程',
        '质量要求较高',
      ],
      branchStrategy: [
        { name: 'main', description: '主分支，稳定版本', color: '#52c41a' },
        { name: 'develop', description: '开发分支，集成功能', color: '#1890ff' },
        { name: 'feature/*', description: '功能分支，独立开发', color: '#722ed1' },
      ],
      pipeline: [
        { name: '功能开发', description: '在Feature分支开发', icon: 'ant-design:code-outlined' },
        { name: '代码审查', description: 'Pull Request审查', icon: 'ant-design:eye-outlined' },
        { name: '集成测试', description: '合并到develop分支测试', icon: 'ant-design:bug-outlined' },
        { name: '预发布', description: '部署到预发布环境', icon: 'ant-design:experiment-outlined' },
        { name: '生产部署', description: '部署到生产环境', icon: 'ant-design:cloud-upload-outlined' },
      ],
    },
    {
      level: 'L3',
      title: 'L3 - 企业模式',
      subtitle: '适合大型项目和企业级开发',
      icon: 'ant-design:bank-outlined',
      color: 'purple',
      features: [
        'GitFlow工作流',
        '严格的代码审查',
        '多环境部署',
        '完整的CI/CD',
        '版本管理',
        '回滚机制',
      ],
      workflow: [
        '需求分析和设计',
        '创建Feature分支',
        '开发和单元测试',
        '代码审查',
        '合并到develop',
        '集成测试',
        '创建Release分支',
        '预发布测试',
        '合并到main',
        '生产部署',
        '版本标记',
      ],
      suitableFor: [
        '大型项目',
        '企业级应用',
        '高质量要求',
        '复杂业务逻辑',
      ],
      branchStrategy: [
        { name: 'main', description: '主分支，生产版本', color: '#52c41a' },
        { name: 'develop', description: '开发分支，集成功能', color: '#1890ff' },
        { name: 'feature/*', description: '功能分支，独立开发', color: '#722ed1' },
        { name: 'release/*', description: '发布分支，版本准备', color: '#fa8c16' },
        { name: 'hotfix/*', description: '热修复分支，紧急修复', color: '#f5222d' },
      ],
      pipeline: [
        { name: '功能开发', description: '在Feature分支开发', icon: 'ant-design:code-outlined' },
        { name: '代码审查', description: '严格的PR审查流程', icon: 'ant-design:eye-outlined' },
        { name: '集成测试', description: '自动化集成测试', icon: 'ant-design:bug-outlined' },
        { name: '发布准备', description: '创建Release分支', icon: 'ant-design:branches-outlined' },
        { name: '预发布', description: '预发布环境验证', icon: 'ant-design:experiment-outlined' },
        { name: '生产部署', description: '生产环境部署', icon: 'ant-design:cloud-upload-outlined' },
        { name: '版本标记', description: '创建版本标签', icon: 'ant-design:tag-outlined' },
      ],
    },
  ];

  // 配置表单Schema
  const configFormSchema = computed<FormSchema[]>(() => {
    const currentMode = getCurrentModeConfig();
    if (!currentMode) return [];

    const baseSchema: FormSchema[] = [
      {
        field: 'autoCreateBranch',
        label: '自动创建分支',
        component: 'Switch',
        defaultValue: true,
        componentProps: {
          checkedChildren: '开启',
          unCheckedChildren: '关闭',
        },
      },
      {
        field: 'requireCodeReview',
        label: '强制代码审查',
        component: 'Switch',
        defaultValue: selectedMode.value !== 'L1',
        componentProps: {
          checkedChildren: '必须',
          unCheckedChildren: '可选',
        },
      },
      {
        field: 'autoTest',
        label: '自动化测试',
        component: 'Switch',
        defaultValue: true,
        componentProps: {
          checkedChildren: '开启',
          unCheckedChildren: '关闭',
        },
      },
    ];

    // L2和L3模式添加额外配置
    if (selectedMode.value === 'L2' || selectedMode.value === 'L3') {
      baseSchema.push(
        {
          field: 'environments',
          label: '部署环境',
          component: 'Select',
          componentProps: {
            mode: 'multiple',
            placeholder: '选择部署环境',
            options: [
              { label: '开发环境', value: 'dev' },
              { label: '测试环境', value: 'test' },
              { label: '预发布环境', value: 'staging' },
              { label: '生产环境', value: 'prod' },
            ],
          },
          defaultValue: ['dev', 'test', 'prod'],
        },
        {
          field: 'approvalRequired',
          label: '部署审批',
          component: 'Switch',
          defaultValue: selectedMode.value === 'L3',
          componentProps: {
            checkedChildren: '需要',
            unCheckedChildren: '不需要',
          },
        }
      );
    }

    // L3模式添加企业级配置
    if (selectedMode.value === 'L3') {
      baseSchema.push(
        {
          field: 'versionStrategy',
          label: '版本策略',
          component: 'Select',
          componentProps: {
            placeholder: '选择版本策略',
            options: [
              { label: '语义化版本 (SemVer)', value: 'semver' },
              { label: '日期版本', value: 'date' },
              { label: '构建版本', value: 'build' },
            ],
          },
          defaultValue: 'semver',
        },
        {
          field: 'rollbackStrategy',
          label: '回滚策略',
          component: 'Select',
          componentProps: {
            placeholder: '选择回滚策略',
            options: [
              { label: '自动回滚', value: 'auto' },
              { label: '手动回滚', value: 'manual' },
              { label: '蓝绿部署', value: 'blue-green' },
            ],
          },
          defaultValue: 'manual',
        }
      );
    }

    return baseSchema;
  });

  // 表单注册
  const [registerConfigForm, { validate: validateConfig, getFieldsValue }] = useForm({
    labelWidth: 120,
    schemas: configFormSchema,
    showActionButtonGroup: false,
  });

  /**
   * 获取当前模式配置
   */
  function getCurrentModeConfig() {
    return developmentModes.find(mode => mode.level === selectedMode.value);
  }

  /**
   * 选择开发模式
   */
  function handleSelectMode(mode: string) {
    selectedMode.value = mode;
  }

  /**
   * 确认选择
   */
  async function handleConfirm() {
    try {
      const config = await validateConfig();
      const modeConfig = getCurrentModeConfig();
      
      emit('confirm', selectedMode.value, {
        ...config,
        modeInfo: modeConfig,
      });
      
      createMessage.success(`已选择 ${modeConfig?.title} 开发模式`);
    } catch (error) {
      console.error('配置验证失败:', error);
    }
  }

  /**
   * 取消选择
   */
  function handleCancel() {
    emit('cancel');
  }
</script>

<style lang="less" scoped>
  .development-mode-selector {
    .mode-header {
      text-align: center;
      margin-bottom: 32px;
      
      .title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .description {
        color: #666;
        font-size: 14px;
      }
    }

    .mode-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;

      .mode-card {
        border: 1px solid #f0f0f0;
        padding: 16px;
        cursor: pointer;
        background: #fff;

        &.selected {
          border-color: #1890ff;
          background: #f6ffed;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;

          .mode-icon {
            margin-right: 16px;
            color: #1890ff;
          }

          .mode-info {
            flex: 1;

            .mode-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .mode-subtitle {
              color: #666;
              font-size: 14px;
              margin: 0;
            }
          }

          .selection-indicator {
            margin-left: 16px;
          }
        }

        .card-content {
          .features,
          .workflow,
          .suitable-for {
            margin-bottom: 16px;

            h5 {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #262626;
            }

            ul {
              margin: 0;
              padding-left: 16px;

              li {
                font-size: 13px;
                color: #666;
                margin-bottom: 4px;
              }
            }
          }

          .workflow-steps {
            .workflow-step {
              display: flex;
              align-items: center;
              margin-bottom: 8px;

              .step-number {
                width: 20px;
                height: 20px;
                background: #1890ff;
                color: #fff;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;
                flex-shrink: 0;
              }

              .step-content {
                font-size: 13px;
                color: #666;
              }
            }
          }

          .scenarios {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }
    }

    .mode-configuration {
      margin-bottom: 32px;

      .branch-strategy,
      .pipeline-config {
        margin-top: 24px;

        h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }
      }

      .branch-flow {
        .branch-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .branch-line {
            width: 4px;
            height: 24px;
            margin-right: 12px;
          }

          .branch-info {
            .branch-name {
              font-weight: 600;
              margin-right: 8px;
            }

            .branch-desc {
              color: #666;
              font-size: 13px;
            }
          }
        }
      }

      .pipeline-stages {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        .pipeline-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 100px;

          .stage-icon {
            width: 40px;
            height: 40px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            color: #1890ff;
          }

          .stage-info {
            .stage-name {
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .stage-desc {
              font-size: 11px;
              color: #666;
              line-height: 1.3;
            }
          }
        }

        .stage-arrow {
          color: #ccc;
          margin: 0 8px;
        }
      }
    }

    .mode-actions {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
    }
  }
</style>