<template>
  <div class="pipeline-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <!-- 基本信息 -->
      <a-card title="基本信息" :bordered="false" class="form-card">
        <a-form-item label="流水线名称" name="name">
          <a-input 
            v-model:value="formData.name" 
            placeholder="请输入流水线名称"
            :max-length="50"
          />
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请输入流水线描述"
            :rows="3"
            :max-length="200"
          />
        </a-form-item>

        <a-form-item label="类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择流水线类型">
            <a-select-option value="build">构建</a-select-option>
            <a-select-option value="deploy">部署</a-select-option>
            <a-select-option value="test">测试</a-select-option>
            <a-select-option value="migration">数据迁移</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="目标环境" name="environment">
          <a-select v-model:value="formData.environment" placeholder="请选择目标环境">
            <a-select-option value="development">开发环境</a-select-option>
            <a-select-option value="testing">测试环境</a-select-option>
            <a-select-option value="staging">预发布环境</a-select-option>
            <a-select-option value="production">生产环境</a-select-option>
          </a-select>
        </a-form-item>
      </a-card>

      <!-- 触发配置 -->
      <a-card title="触发配置" :bordered="false" class="form-card">
        <a-form-item label="触发方式" name="triggers">
          <a-checkbox-group v-model:value="formData.triggers">
            <a-checkbox value="manual">手动触发</a-checkbox>
            <a-checkbox value="webhook">Webhook触发</a-checkbox>
            <a-checkbox value="schedule">定时触发</a-checkbox>
            <a-checkbox value="push">代码推送触发</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item 
          v-if="formData.triggers.includes('schedule')" 
          label="定时表达式" 
          name="scheduleExpression"
        >
          <a-input 
            v-model:value="formData.scheduleExpression" 
            placeholder="请输入Cron表达式，如：0 0 2 * * ?"
          />
          <div class="form-help">
            <a href="#" @click.prevent="showCronHelp">查看Cron表达式帮助</a>
          </div>
        </a-form-item>

        <a-form-item 
          v-if="formData.triggers.includes('push')" 
          label="监听分支" 
          name="watchBranches"
        >
          <a-select 
            v-model:value="formData.watchBranches" 
            mode="tags" 
            placeholder="请输入要监听的分支名称"
          >
            <a-select-option value="main">main</a-select-option>
            <a-select-option value="develop">develop</a-select-option>
            <a-select-option value="release/*">release/*</a-select-option>
          </a-select>
        </a-form-item>
      </a-card>

      <!-- 流水线阶段 -->
      <a-card title="流水线阶段" :bordered="false" class="form-card">
        <div class="stages-config">
          <div class="stages-header">
            <span>配置流水线执行阶段</span>
            <a-button type="dashed" @click="handleAddStage">
              <template #icon>
                <Icon icon="ant-design:plus-outlined" />
              </template>
              添加阶段
            </a-button>
          </div>

          <div class="stages-list">
            <div 
              v-for="(stage, index) in formData.stages" 
              :key="stage.id"
              class="stage-item"
            >
              <div class="stage-header">
                <div class="stage-order">{{ index + 1 }}</div>
                <div class="stage-content">
                  <a-row :gutter="16">
                    <a-col :span="8">
                      <a-form-item 
                        :name="['stages', index, 'name']"
                        :rules="[{ required: true, message: '请输入阶段名称' }]"
                      >
                        <a-input 
                          v-model:value="stage.name" 
                          placeholder="阶段名称"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :span="8">
                      <a-form-item 
                        :name="['stages', index, 'type']"
                        :rules="[{ required: true, message: '请选择阶段类型' }]"
                      >
                        <a-select 
                          v-model:value="stage.type" 
                          placeholder="阶段类型"
                          @change="handleStageTypeChange(stage, $event)"
                        >
                          <a-select-option value="checkout">代码检出</a-select-option>
                          <a-select-option value="install">依赖安装</a-select-option>
                          <a-select-option value="lint">代码检查</a-select-option>
                          <a-select-option value="test">单元测试</a-select-option>
                          <a-select-option value="build">构建打包</a-select-option>
                          <a-select-option value="deploy">部署</a-select-option>
                          <a-select-option value="custom">自定义</a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item>
                        <a-space>
                          <a-button 
                            type="text" 
                            size="small" 
                            @click="handleMoveStage(index, 'up')"
                            :disabled="index === 0"
                          >
                            <Icon icon="ant-design:up-outlined" />
                          </a-button>
                          <a-button 
                            type="text" 
                            size="small" 
                            @click="handleMoveStage(index, 'down')"
                            :disabled="index === formData.stages.length - 1"
                          >
                            <Icon icon="ant-design:down-outlined" />
                          </a-button>
                          <a-button 
                            type="text" 
                            size="small" 
                            danger
                            @click="handleRemoveStage(index)"
                          >
                            <Icon icon="ant-design:delete-outlined" />
                          </a-button>
                        </a-space>
                      </a-form-item>
                    </a-col>
                  </a-row>

                  <!-- 阶段配置 -->
                  <div class="stage-config">
                    <a-form-item 
                      :name="['stages', index, 'script']"
                      :rules="[{ required: true, message: '请输入执行脚本' }]"
                    >
                      <a-textarea 
                        v-model:value="stage.script" 
                        placeholder="请输入执行脚本或命令"
                        :rows="4"
                      />
                    </a-form-item>

                    <!-- 环境变量 -->
                    <div class="stage-env">
                      <div class="env-header">
                        <span>环境变量</span>
                        <a-button 
                          type="dashed" 
                          size="small" 
                          @click="handleAddEnvVar(stage)"
                        >
                          <Icon icon="ant-design:plus-outlined" />
                          添加
                        </a-button>
                      </div>
                      <div class="env-list">
                        <div 
                          v-for="(env, envIndex) in stage.envVars" 
                          :key="envIndex"
                          class="env-item"
                        >
                          <a-row :gutter="8">
                            <a-col :span="10">
                              <a-input 
                                v-model:value="env.key" 
                                placeholder="变量名"
                                size="small"
                              />
                            </a-col>
                            <a-col :span="12">
                              <a-input 
                                v-model:value="env.value" 
                                placeholder="变量值"
                                size="small"
                              />
                            </a-col>
                            <a-col :span="2">
                              <a-button 
                                type="text" 
                                size="small" 
                                danger
                                @click="handleRemoveEnvVar(stage, envIndex)"
                              >
                                <Icon icon="ant-design:delete-outlined" />
                              </a-button>
                            </a-col>
                          </a-row>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 通知配置 -->
      <a-card title="通知配置" :bordered="false" class="form-card">
        <a-form-item label="通知方式" name="notifications">
          <a-checkbox-group v-model:value="formData.notifications">
            <a-checkbox value="email">邮件通知</a-checkbox>
            <a-checkbox value="webhook">Webhook通知</a-checkbox>
            <a-checkbox value="dingtalk">钉钉通知</a-checkbox>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item 
          v-if="formData.notifications.includes('email')" 
          label="邮件地址" 
          name="emailAddresses"
        >
          <a-select 
            v-model:value="formData.emailAddresses" 
            mode="tags" 
            placeholder="请输入邮件地址"
          />
        </a-form-item>

        <a-form-item 
          v-if="formData.notifications.includes('webhook')" 
          label="Webhook URL" 
          name="webhookUrl"
        >
          <a-input 
            v-model:value="formData.webhookUrl" 
            placeholder="请输入Webhook URL"
          />
        </a-form-item>
      </a-card>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface Props {
    projectId: string;
    pipeline?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['submit']);
  const { createMessage } = useMessage();

  // 表单引用
  const formRef = ref();

  // 表单数据
  const formData = reactive({
    name: '',
    description: '',
    type: '',
    environment: '',
    triggers: [],
    scheduleExpression: '',
    watchBranches: [],
    stages: [],
    notifications: [],
    emailAddresses: [],
    webhookUrl: '',
  });

  // 表单验证规则
  const formRules = {
    name: [
      { required: true, message: '请输入流水线名称', trigger: 'blur' },
      { min: 2, max: 50, message: '名称长度在2-50个字符', trigger: 'blur' },
    ],
    type: [
      { required: true, message: '请选择流水线类型', trigger: 'change' },
    ],
    environment: [
      { required: true, message: '请选择目标环境', trigger: 'change' },
    ],
    triggers: [
      { required: true, message: '请选择至少一种触发方式', trigger: 'change' },
    ],
    scheduleExpression: [
      { 
        required: true, 
        message: '请输入定时表达式', 
        trigger: 'blur',
        validator: (rule, value) => {
          if (formData.triggers.includes('schedule') && !value) {
            return Promise.reject('请输入定时表达式');
          }
          return Promise.resolve();
        }
      },
    ],
  };

  /**
   * 初始化表单数据
   */
  function initFormData() {
    if (props.pipeline) {
      Object.assign(formData, {
        name: props.pipeline.name || '',
        description: props.pipeline.description || '',
        type: props.pipeline.type || '',
        environment: props.pipeline.environment || '',
        triggers: props.pipeline.triggers || ['manual'],
        scheduleExpression: props.pipeline.scheduleExpression || '',
        watchBranches: props.pipeline.watchBranches || [],
        stages: props.pipeline.stages || [],
        notifications: props.pipeline.notifications || [],
        emailAddresses: props.pipeline.emailAddresses || [],
        webhookUrl: props.pipeline.webhookUrl || '',
      });
    } else {
      // 默认添加一个基础阶段
      handleAddStage();
    }
  }

  /**
   * 添加阶段
   */
  function handleAddStage() {
    const newStage = {
      id: Date.now().toString(),
      name: '',
      type: '',
      script: '',
      envVars: [],
    };
    formData.stages.push(newStage);
  }

  /**
   * 移除阶段
   */
  function handleRemoveStage(index: number) {
    formData.stages.splice(index, 1);
  }

  /**
   * 移动阶段
   */
  function handleMoveStage(index: number, direction: 'up' | 'down') {
    const stages = formData.stages;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < stages.length) {
      [stages[index], stages[targetIndex]] = [stages[targetIndex], stages[index]];
    }
  }

  /**
   * 阶段类型变化
   */
  function handleStageTypeChange(stage: any, type: string) {
    // 根据类型设置默认脚本
    const scriptTemplates = {
      'checkout': 'git clone $GIT_URL\ncd $PROJECT_NAME',
      'install': 'npm install',
      'lint': 'npm run lint',
      'test': 'npm run test',
      'build': 'npm run build',
      'deploy': 'docker build -t $IMAGE_NAME .\ndocker push $IMAGE_NAME',
      'custom': '# 请输入自定义脚本',
    };
    
    if (scriptTemplates[type] && !stage.script) {
      stage.script = scriptTemplates[type];
    }
  }

  /**
   * 添加环境变量
   */
  function handleAddEnvVar(stage: any) {
    if (!stage.envVars) {
      stage.envVars = [];
    }
    stage.envVars.push({ key: '', value: '' });
  }

  /**
   * 移除环境变量
   */
  function handleRemoveEnvVar(stage: any, index: number) {
    stage.envVars.splice(index, 1);
  }

  /**
   * 显示Cron帮助
   */
  function showCronHelp() {
    createMessage.info('Cron表达式格式：秒 分 时 日 月 周年\n例如：0 0 2 * * ? 表示每天凌晨2点执行');
  }

  /**
   * 表单验证
   */
  async function validate() {
    try {
      const values = await formRef.value?.validate();
      return values;
    } catch (error) {
      console.error('表单验证失败:', error);
      return null;
    }
  }

  // 监听编辑数据变化
  watch(() => props.pipeline, () => {
    initFormData();
  }, { immediate: true });

  // 暴露验证方法
  defineExpose({
    validate,
  });

  // 组件挂载时初始化
  onMounted(() => {
    initFormData();
  });
</script>

<style lang="less" scoped>
  .pipeline-form {
    .form-card {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-help {
      margin-top: 4px;
      font-size: 12px;
      color: #666;
    }

    .stages-config {
      .stages-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: 600;
      }

      .stages-list {
        .stage-item {
          border: 1px solid #f0f0f0;
          margin-bottom: 16px;
          background: #fafafa;

          .stage-header {
            display: flex;
            align-items: flex-start;
            padding: 16px;

            .stage-order {
              width: 32px;
              height: 32px;
              background: #1890ff;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              margin-right: 16px;
              flex-shrink: 0;
            }

            .stage-content {
              flex: 1;

              .stage-config {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #f0f0f0;
              }

              .stage-env {
                margin-top: 16px;

                .env-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 8px;
                  font-size: 14px;
                  font-weight: 600;
                }

                .env-list {
                  .env-item {
                    margin-bottom: 8px;

                    &:last-child {
                      margin-bottom: 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>