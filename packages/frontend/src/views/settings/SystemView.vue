<template>
  <div class="system-view">
    <div class="page-header">
      <h1>系统配置</h1>
      <p>管理系统级别的配置和设置</p>
    </div>

    <div class="settings-content">
      <a-card title="基础设置" class="settings-card">
        <a-form :model="systemSettings" layout="vertical">
          <a-form-item label="系统名称">
            <a-input v-model:value="systemSettings.systemName" placeholder="请输入系统名称" />
          </a-form-item>
          
          <a-form-item label="系统描述">
            <a-textarea 
              v-model:value="systemSettings.description" 
              placeholder="请输入系统描述"
              :rows="3"
            />
          </a-form-item>
          
          <a-form-item label="默认语言">
            <a-select v-model:value="systemSettings.defaultLanguage" placeholder="选择默认语言">
              <a-select-option value="zh-CN">简体中文</a-select-option>
              <a-select-option value="en-US">English</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="安全设置" class="settings-card">
        <a-form :model="securitySettings" layout="vertical">
          <a-form-item label="会话超时时间（分钟）">
            <a-input-number 
              v-model:value="securitySettings.sessionTimeout" 
              :min="5" 
              :max="1440"
              style="width: 200px"
            />
          </a-form-item>
          
          <a-form-item label="密码策略">
            <a-checkbox-group v-model:value="securitySettings.passwordPolicy">
              <a-checkbox value="minLength">最少8位字符</a-checkbox>
              <a-checkbox value="requireNumbers">包含数字</a-checkbox>
              <a-checkbox value="requireSymbols">包含特殊字符</a-checkbox>
              <a-checkbox value="requireUppercase">包含大写字母</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </a-form>
      </a-card>

      <div class="settings-actions">
        <a-button type="primary" @click="saveSettings" :loading="saving">
          保存设置
        </a-button>
        <a-button @click="resetSettings">
          重置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

// 系统设置数据
const systemSettings = reactive({
  systemName: 'Verto 项目管理系统',
  description: '一个现代化的项目管理和协作平台',
  defaultLanguage: 'zh-CN'
})

// 安全设置数据
const securitySettings = reactive({
  sessionTimeout: 30,
  passwordPolicy: ['minLength', 'requireNumbers']
})

const saving = ref(false)

/**
 * 保存系统设置
 */
const saveSettings = async () => {
  saving.value = true
  try {
    // TODO: 调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('设置保存成功')
  } catch (error) {
    message.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

/**
 * 重置设置到默认值
 */
const resetSettings = () => {
  systemSettings.systemName = 'Verto 项目管理系统'
  systemSettings.description = '一个现代化的项目管理和协作平台'
  systemSettings.defaultLanguage = 'zh-CN'
  
  securitySettings.sessionTimeout = 30
  securitySettings.passwordPolicy = ['minLength', 'requireNumbers']
  
  message.info('设置已重置')
}
</script>

<style scoped>
.system-view {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.settings-content {
  max-width: 800px;
}

.settings-card {
  margin-bottom: 24px;
}

.settings-card :deep(.ant-card-head-title) {
  font-weight: 600;
}

.settings-actions {
  display: flex;
  gap: 12px;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .system-view {
    padding: 16px;
  }
  
  .settings-content {
    max-width: 100%;
  }
}
</style>