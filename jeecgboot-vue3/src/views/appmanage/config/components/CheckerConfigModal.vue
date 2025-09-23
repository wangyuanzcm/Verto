<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" width="800px">
    <div class="checker-config-modal">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 基础配置 -->
        <a-tab-pane key="basic" tab="基础配置">
          <BasicForm @register="registerForm" />
        </a-tab-pane>
        
        <!-- 高级配置 -->
        <a-tab-pane key="advanced" tab="高级配置">
          <div class="advanced-config">
            <a-form layout="vertical">
              <a-form-item label="环境变量">
                <div class="env-vars">
                  <div v-for="(env, index) in envVars" :key="index" class="env-var-item">
                    <a-input 
                      v-model:value="env.key" 
                      placeholder="变量名" 
                      style="width: 200px; margin-right: 8px;"
                    />
                    <a-input 
                      v-model:value="env.value" 
                      placeholder="变量值" 
                      style="width: 300px; margin-right: 8px;"
                    />
                    <a-button @click="removeEnvVar(index)" danger size="small">删除</a-button>
                  </div>
                  <a-button @click="addEnvVar" type="dashed" size="small">
                    <template #icon><Icon icon="ant-design:plus-outlined" /></template>
                    添加环境变量
                  </a-button>
                </div>
              </a-form-item>
              
              <a-form-item label="执行前脚本">
                <a-textarea 
                  v-model:value="preScript" 
                  placeholder="在检查器执行前运行的脚本..."
                  :rows="4"
                />
              </a-form-item>
              
              <a-form-item label="执行后脚本">
                <a-textarea 
                  v-model:value="postScript" 
                  placeholder="在检查器执行后运行的脚本..."
                  :rows="4"
                />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
        
        <!-- 规则配置 -->
        <a-tab-pane key="rules" tab="规则配置">
          <div class="rules-config">
            <a-form layout="vertical">
              <a-form-item label="配置文件路径">
                <a-input 
                  v-model:value="configFilePath" 
                  placeholder="例如: .eslintrc.js, sonar-project.properties"
                />
              </a-form-item>
              
              <a-form-item label="配置内容">
                <a-textarea 
                  v-model:value="configContent" 
                  placeholder="请输入配置文件内容..."
                  :rows="10"
                />
              </a-form-item>
              
              <a-form-item label="忽略文件">
                <a-textarea 
                  v-model:value="ignoreContent" 
                  placeholder="请输入忽略规则，每行一个..."
                  :rows="6"
                />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
        
        <!-- 输出配置 -->
        <a-tab-pane key="output" tab="输出配置">
          <div class="output-config">
            <a-form layout="vertical">
              <a-form-item label="输出格式">
                <a-select v-model:value="outputFormat">
                  <a-select-option value="json">JSON</a-select-option>
                  <a-select-option value="xml">XML</a-select-option>
                  <a-select-option value="junit">JUnit</a-select-option>
                  <a-select-option value="checkstyle">Checkstyle</a-select-option>
                  <a-select-option value="sonarqube">SonarQube</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="输出文件">
                <a-input 
                  v-model:value="outputFile" 
                  placeholder="输出文件路径，例如: reports/checkstyle.xml"
                />
              </a-form-item>
              
              <a-form-item label="报告模板">
                <a-textarea 
                  v-model:value="reportTemplate" 
                  placeholder="自定义报告模板..."
                  :rows="6"
                />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form/index';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();

  const activeTab = ref('basic');
  const checkerData = ref<any>({});

  // 环境变量
  const envVars = ref<Array<{ key: string; value: string }>>([]);
  
  // 脚本配置
  const preScript = ref('');
  const postScript = ref('');
  
  // 规则配置
  const configFilePath = ref('');
  const configContent = ref('');
  const ignoreContent = ref('');
  
  // 输出配置
  const outputFormat = ref('json');
  const outputFile = ref('');
  const reportTemplate = ref('');

  // 基础配置表单
  const basicFormSchema: FormSchema[] = [
    {
      field: 'dockerImage',
      label: 'Docker镜像',
      component: 'Input',
      componentProps: {
        placeholder: '例如: eslint:latest, sonarqube-scanner:latest',
      },
    },
    {
      field: 'dockerArgs',
      label: 'Docker参数',
      component: 'Input',
      componentProps: {
        placeholder: '例如: --rm -v $(pwd):/workspace',
      },
    },
    {
      field: 'workingDirectory',
      label: '工作目录',
      component: 'Input',
      componentProps: {
        placeholder: '相对于项目根目录的路径',
      },
    },
    {
      field: 'timeout',
      label: '超时时间(秒)',
      component: 'InputNumber',
      defaultValue: 300,
      componentProps: {
        min: 30,
        max: 3600,
      },
    },
    {
      field: 'retryCount',
      label: '重试次数',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        max: 5,
      },
    },
    {
      field: 'parallel',
      label: '并行执行',
      component: 'Switch',
      defaultValue: false,
      helpMessage: '是否允许与其他检查器并行执行',
    },
  ];

  // 表单配置
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 120,
    baseColProps: { span: 24 },
    schemas: basicFormSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  // 弹窗配置
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    checkerData.value = data?.record || {};

    if (data?.record) {
      // 设置基础表单数据
      setFieldsValue({
        dockerImage: data.record.dockerImage || '',
        dockerArgs: data.record.dockerArgs || '',
        workingDirectory: data.record.workingDirectory || '',
        timeout: data.record.timeout || 300,
        retryCount: data.record.retryCount || 0,
        parallel: data.record.parallel || false,
      });

      // 设置高级配置数据
      envVars.value = data.record.envVars || [];
      preScript.value = data.record.preScript || '';
      postScript.value = data.record.postScript || '';

      // 设置规则配置数据
      configFilePath.value = data.record.configFilePath || '';
      configContent.value = data.record.configContent || '';
      ignoreContent.value = data.record.ignoreContent || '';

      // 设置输出配置数据
      outputFormat.value = data.record.outputFormat || 'json';
      outputFile.value = data.record.outputFile || '';
      reportTemplate.value = data.record.reportTemplate || '';
    } else {
      // 重置所有数据
      envVars.value = [];
      preScript.value = '';
      postScript.value = '';
      configFilePath.value = '';
      configContent.value = '';
      ignoreContent.value = '';
      outputFormat.value = 'json';
      outputFile.value = '';
      reportTemplate.value = '';
    }
  });

  // 弹窗标题
  const getTitle = computed(() => '检查器配置');

  /**
   * 添加环境变量
   */
  function addEnvVar() {
    envVars.value.push({ key: '', value: '' });
  }

  /**
   * 删除环境变量
   */
  function removeEnvVar(index: number) {
    envVars.value.splice(index, 1);
  }

  /**
   * 提交配置
   */
  async function handleSubmit() {
    try {
      const basicValues = await validate();
      setModalProps({ confirmLoading: true });

      const configData = {
        ...basicValues,
        envVars: envVars.value.filter(env => env.key && env.value),
        preScript: preScript.value,
        postScript: postScript.value,
        configFilePath: configFilePath.value,
        configContent: configContent.value,
        ignoreContent: ignoreContent.value,
        outputFormat: outputFormat.value,
        outputFile: outputFile.value,
        reportTemplate: reportTemplate.value,
      };

      emit('success', configData);
      createMessage.success('检查器配置保存成功');
      closeModal();
    } catch (error) {
      console.error('保存检查器配置失败:', error);
      createMessage.error('保存失败，请检查配置数据');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .checker-config-modal {
    .env-vars {
      .env-var-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
    }

    .advanced-config,
    .rules-config,
    .output-config {
      padding: 16px 0;
    }
  }
</style>