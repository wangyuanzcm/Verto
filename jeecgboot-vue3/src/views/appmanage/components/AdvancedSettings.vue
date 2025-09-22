<!--高级设置-->
<template>
  <div class="advanced-settings-container">
    <a-row :gutter="24">
      <!-- 系统配置 -->
      <a-col :span="12">
        <a-card title="系统配置" :bordered="false">
          <BasicForm @register="registerSystemForm" />
          <div class="form-actions">
            <a-button type="primary" @click="handleSaveSystemConfig" :loading="systemLoading">
              保存系统配置
            </a-button>
          </div>
        </a-card>
      </a-col>

      <!-- 安全配置 -->
      <a-col :span="12">
        <a-card title="安全配置" :bordered="false">
          <BasicForm @register="registerSecurityForm" />
          <div class="form-actions">
            <a-button type="primary" @click="handleSaveSecurityConfig" :loading="securityLoading">
              保存安全配置
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24" style="margin-top: 24px;">
      <!-- 性能配置 -->
      <a-col :span="12">
        <a-card title="性能配置" :bordered="false">
          <BasicForm @register="registerPerformanceForm" />
          <div class="form-actions">
            <a-button type="primary" @click="handleSavePerformanceConfig" :loading="performanceLoading">
              保存性能配置
            </a-button>
          </div>
        </a-card>
      </a-col>

      <!-- 监控配置 -->
      <a-col :span="12">
        <a-card title="监控配置" :bordered="false">
          <BasicForm @register="registerMonitorForm" />
          <div class="form-actions">
            <a-button type="primary" @click="handleSaveMonitorConfig" :loading="monitorLoading">
              保存监控配置
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 危险操作区域 -->
    <a-card title="危险操作" :bordered="false" style="margin-top: 24px;">
      <a-alert
        message="警告"
        description="以下操作具有风险性，请谨慎操作。建议在操作前备份重要数据。"
        type="warning"
        show-icon
        style="margin-bottom: 16px;"
      />
      
      <a-space direction="vertical" size="middle" style="width: 100%;">
        <div class="danger-item">
          <div class="danger-content">
            <h4>清空应用缓存</h4>
            <p>清空应用的所有缓存数据，包括用户会话、临时文件等。</p>
          </div>
          <a-button danger @click="handleClearCache" :loading="clearCacheLoading">
            清空缓存
          </a-button>
        </div>

        <a-divider />

        <div class="danger-item">
          <div class="danger-content">
            <h4>重置应用配置</h4>
            <p>将应用配置重置为默认值，所有自定义配置将丢失。</p>
          </div>
          <a-button danger @click="handleResetConfig" :loading="resetConfigLoading">
            重置配置
          </a-button>
        </div>

        <a-divider />

        <div class="danger-item">
          <div class="danger-content">
            <h4>删除应用</h4>
            <p>永久删除此应用及其所有相关数据，此操作不可恢复。</p>
          </div>
          <a-button danger type="primary" @click="handleDeleteApp" :loading="deleteAppLoading">
            删除应用
          </a-button>
        </div>
      </a-space>
    </a-card>

    <!-- 确认删除弹窗 -->
    <a-modal
      v-model:open="deleteConfirmVisible"
      title="确认删除应用"
      :width="500"
      @ok="handleConfirmDelete"
      @cancel="deleteConfirmVisible = false"
      ok-text="确认删除"
      cancel-text="取消"
      ok-type="danger"
    >
      <div class="delete-confirm-content">
        <a-alert
          message="此操作不可恢复"
          description="删除应用将永久移除所有相关数据，包括代码、配置、日志等。"
          type="error"
          show-icon
          style="margin-bottom: 16px;"
        />
        
        <p>请输入应用名称 <strong>{{ appName }}</strong> 来确认删除：</p>
        <a-input
          v-model:value="deleteConfirmText"
          placeholder="请输入应用名称"
          @input="handleDeleteConfirmInput"
        />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { message, Modal } from 'ant-design-vue';
  import {
    systemFormSchema,
    securityFormSchema,
    performanceFormSchema,
    monitorFormSchema,
  } from '../data/AdvancedSettingsData';

  export default defineComponent({
    name: 'AdvancedSettings',
    components: {
      BasicForm,
    },
    setup() {
      const { createMessage } = message;
      const { confirm } = Modal;
      
      const systemLoading = ref(false);
      const securityLoading = ref(false);
      const performanceLoading = ref(false);
      const monitorLoading = ref(false);
      const clearCacheLoading = ref(false);
      const resetConfigLoading = ref(false);
      const deleteAppLoading = ref(false);
      const deleteConfirmVisible = ref(false);
      const deleteConfirmText = ref('');
      const appName = ref('示例应用'); // 实际应用中从props或store获取

      // 系统配置表单
      const [registerSystemForm, { validate: validateSystemForm }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: systemFormSchema,
        showActionButtonGroup: false,
      });

      // 安全配置表单
      const [registerSecurityForm, { validate: validateSecurityForm }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: securityFormSchema,
        showActionButtonGroup: false,
      });

      // 性能配置表单
      const [registerPerformanceForm, { validate: validatePerformanceForm }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: performanceFormSchema,
        showActionButtonGroup: false,
      });

      // 监控配置表单
      const [registerMonitorForm, { validate: validateMonitorForm }] = useForm({
        labelWidth: 120,
        baseColProps: { span: 24 },
        schemas: monitorFormSchema,
        showActionButtonGroup: false,
      });

      /**
       * 保存系统配置
       */
      async function handleSaveSystemConfig() {
        try {
          systemLoading.value = true;
          const values = await validateSystemForm();
          
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('系统配置:', values);
          createMessage.success('系统配置保存成功');
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          systemLoading.value = false;
        }
      }

      /**
       * 保存安全配置
       */
      async function handleSaveSecurityConfig() {
        try {
          securityLoading.value = true;
          const values = await validateSecurityForm();
          
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('安全配置:', values);
          createMessage.success('安全配置保存成功');
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          securityLoading.value = false;
        }
      }

      /**
       * 保存性能配置
       */
      async function handleSavePerformanceConfig() {
        try {
          performanceLoading.value = true;
          const values = await validatePerformanceForm();
          
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('性能配置:', values);
          createMessage.success('性能配置保存成功');
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          performanceLoading.value = false;
        }
      }

      /**
       * 保存监控配置
       */
      async function handleSaveMonitorConfig() {
        try {
          monitorLoading.value = true;
          const values = await validateMonitorForm();
          
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('监控配置:', values);
          createMessage.success('监控配置保存成功');
        } catch (error) {
          createMessage.error('请完善配置信息');
        } finally {
          monitorLoading.value = false;
        }
      }

      /**
       * 清空缓存
       */
      function handleClearCache() {
        confirm({
          title: '确认清空缓存？',
          content: '此操作将清空应用的所有缓存数据，可能会影响应用性能。',
          onOk: async () => {
            try {
              clearCacheLoading.value = true;
              
              // 模拟API调用
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              createMessage.success('缓存清空成功');
            } catch (error) {
              createMessage.error('缓存清空失败');
            } finally {
              clearCacheLoading.value = false;
            }
          },
        });
      }

      /**
       * 重置配置
       */
      function handleResetConfig() {
        confirm({
          title: '确认重置配置？',
          content: '此操作将重置所有应用配置为默认值，自定义配置将丢失。',
          onOk: async () => {
            try {
              resetConfigLoading.value = true;
              
              // 模拟API调用
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              createMessage.success('配置重置成功');
            } catch (error) {
              createMessage.error('配置重置失败');
            } finally {
              resetConfigLoading.value = false;
            }
          },
        });
      }

      /**
       * 删除应用
       */
      function handleDeleteApp() {
        deleteConfirmVisible.value = true;
        deleteConfirmText.value = '';
      }

      /**
       * 删除确认输入处理
       */
      function handleDeleteConfirmInput() {
        // 输入验证逻辑
      }

      /**
       * 确认删除应用
       */
      async function handleConfirmDelete() {
        if (deleteConfirmText.value !== appName.value) {
          createMessage.error('应用名称输入不正确');
          return;
        }

        try {
          deleteAppLoading.value = true;
          
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          createMessage.success('应用删除成功');
          deleteConfirmVisible.value = false;
          
          // 跳转到应用列表
          // router.push('/appmanage/list');
        } catch (error) {
          createMessage.error('应用删除失败');
        } finally {
          deleteAppLoading.value = false;
        }
      }

      return {
        systemLoading,
        securityLoading,
        performanceLoading,
        monitorLoading,
        clearCacheLoading,
        resetConfigLoading,
        deleteAppLoading,
        deleteConfirmVisible,
        deleteConfirmText,
        appName,
        registerSystemForm,
        registerSecurityForm,
        registerPerformanceForm,
        registerMonitorForm,
        handleSaveSystemConfig,
        handleSaveSecurityConfig,
        handleSavePerformanceConfig,
        handleSaveMonitorConfig,
        handleClearCache,
        handleResetConfig,
        handleDeleteApp,
        handleDeleteConfirmInput,
        handleConfirmDelete,
      };
    },
  });
</script>

<style lang="less" scoped>
  .advanced-settings-container {
    .form-actions {
      margin-top: 16px;
      text-align: right;
    }
    
    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .danger-content {
        flex: 1;
        
        h4 {
          margin: 0 0 4px 0;
          color: #ff4d4f;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .delete-confirm-content {
      p {
        margin-bottom: 12px;
        
        strong {
          color: #ff4d4f;
        }
      }
    }
  }
</style>