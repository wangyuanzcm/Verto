<template>
  <div class="system-config">
    <!-- 配置导航 -->
    <div class="config-nav">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        @click="handleMenuClick"
      >
        <a-menu-item key="basic">
          <SettingOutlined />
          基础配置
        </a-menu-item>
        <a-menu-item key="email">
          <MailOutlined />
          邮件配置
        </a-menu-item>
        <a-menu-item key="storage">
          <CloudOutlined />
          存储配置
        </a-menu-item>
        <a-menu-item key="security">
          <SafetyOutlined />
          安全配置
        </a-menu-item>
        <a-menu-item key="notification">
          <BellOutlined />
          通知配置
        </a-menu-item>
        <a-menu-item key="integration">
          <ApiOutlined />
          集成配置
        </a-menu-item>
      </a-menu>
    </div>
    
    <!-- 配置内容 -->
    <div class="config-content">
      <!-- 基础配置 -->
      <div v-show="activeTab === 'basic'" class="config-section">
        <a-card title="基础配置" class="config-card">
          <template #extra>
            <a-button type="primary" @click="saveBasicConfig" :loading="saving">
              <SaveOutlined />
              保存配置
            </a-button>
          </template>
          
          <a-form
            ref="basicFormRef"
            :model="basicConfig"
            :rules="basicRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="系统名称" name="systemName">
                  <a-input v-model:value="basicConfig.systemName" placeholder="请输入系统名称" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="系统版本" name="systemVersion">
                  <a-input v-model:value="basicConfig.systemVersion" placeholder="请输入系统版本" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="系统域名" name="systemDomain">
                  <a-input v-model:value="basicConfig.systemDomain" placeholder="请输入系统域名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="系统端口" name="systemPort">
                  <a-input-number
                    v-model:value="basicConfig.systemPort"
                    :min="1"
                    :max="65535"
                    style="width: 100%"
                    placeholder="请输入系统端口"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="系统描述" name="systemDescription">
              <a-textarea
                v-model:value="basicConfig.systemDescription"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </a-form-item>
            
            <a-form-item label="系统Logo" name="systemLogo">
              <a-upload
                v-model:file-list="logoFileList"
                list-type="picture-card"
                :before-upload="beforeUploadLogo"
                @preview="previewLogo"
              >
                <div v-if="logoFileList.length < 1">
                  <PlusOutlined />
                  <div style="margin-top: 8px">上传Logo</div>
                </div>
              </a-upload>
            </a-form-item>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="8">
                <a-form-item label="时区设置" name="timezone">
                  <a-select v-model:value="basicConfig.timezone" placeholder="请选择时区">
                    <a-select-option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</a-select-option>
                    <a-select-option value="America/New_York">America/New_York (UTC-5)</a-select-option>
                    <a-select-option value="Europe/London">Europe/London (UTC+0)</a-select-option>
                    <a-select-option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="语言设置" name="language">
                  <a-select v-model:value="basicConfig.language" placeholder="请选择语言">
                    <a-select-option value="zh-CN">简体中文</a-select-option>
                    <a-select-option value="en-US">English</a-select-option>
                    <a-select-option value="ja-JP">日本語</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="主题设置" name="theme">
                  <a-select v-model:value="basicConfig.theme" placeholder="请选择主题">
                    <a-select-option value="light">浅色主题</a-select-option>
                    <a-select-option value="dark">深色主题</a-select-option>
                    <a-select-option value="auto">跟随系统</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item>
              <a-space>
                <a-checkbox v-model:checked="basicConfig.enableRegistration">
                  允许用户注册
                </a-checkbox>
                <a-checkbox v-model:checked="basicConfig.enableGuestAccess">
                  允许访客访问
                </a-checkbox>
                <a-checkbox v-model:checked="basicConfig.enableMaintenance">
                  维护模式
                </a-checkbox>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </div>
      
      <!-- 邮件配置 -->
      <div v-show="activeTab === 'email'" class="config-section">
        <a-card title="邮件配置" class="config-card">
          <template #extra>
            <a-space>
              <a-button @click="testEmailConfig" :loading="testing">
                <ExperimentOutlined />
                测试连接
              </a-button>
              <a-button type="primary" @click="saveEmailConfig" :loading="saving">
                <SaveOutlined />
                保存配置
              </a-button>
            </a-space>
          </template>
          
          <a-form
            ref="emailFormRef"
            :model="emailConfig"
            :rules="emailRules"
            layout="vertical"
          >
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="SMTP服务器" name="smtpHost">
                  <a-input v-model:value="emailConfig.smtpHost" placeholder="请输入SMTP服务器地址" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="SMTP端口" name="smtpPort">
                  <a-input-number
                    v-model:value="emailConfig.smtpPort"
                    :min="1"
                    :max="65535"
                    style="width: 100%"
                    placeholder="请输入SMTP端口"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="发件人邮箱" name="fromEmail">
                  <a-input v-model:value="emailConfig.fromEmail" placeholder="请输入发件人邮箱" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="发件人名称" name="fromName">
                  <a-input v-model:value="emailConfig.fromName" placeholder="请输入发件人名称" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="用户名" name="username">
                  <a-input v-model:value="emailConfig.username" placeholder="请输入SMTP用户名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="密码" name="password">
                  <a-input-password v-model:value="emailConfig.password" placeholder="请输入SMTP密码" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="8">
                <a-form-item label="加密方式" name="encryption">
                  <a-select v-model:value="emailConfig.encryption" placeholder="请选择加密方式">
                    <a-select-option value="none">无加密</a-select-option>
                    <a-select-option value="ssl">SSL</a-select-option>
                    <a-select-option value="tls">TLS</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="连接超时" name="timeout">
                  <a-input-number
                    v-model:value="emailConfig.timeout"
                    :min="1"
                    :max="300"
                    addon-after="秒"
                    style="width: 100%"
                    placeholder="连接超时时间"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item>
                  <template #label>
                    <span>启用邮件服务</span>
                  </template>
                  <a-switch v-model:checked="emailConfig.enabled" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </div>
      
      <!-- 存储配置 -->
      <div v-show="activeTab === 'storage'" class="config-section">
        <a-card title="存储配置" class="config-card">
          <template #extra>
            <a-space>
              <a-button @click="testStorageConfig" :loading="testing">
                <ExperimentOutlined />
                测试连接
              </a-button>
              <a-button type="primary" @click="saveStorageConfig" :loading="saving">
                <SaveOutlined />
                保存配置
              </a-button>
            </a-space>
          </template>
          
          <a-form
            ref="storageFormRef"
            :model="storageConfig"
            :rules="storageRules"
            layout="vertical"
          >
            <a-form-item label="存储类型" name="type">
              <a-radio-group v-model:value="storageConfig.type">
                <a-radio value="local">本地存储</a-radio>
                <a-radio value="oss">阿里云OSS</a-radio>
                <a-radio value="s3">Amazon S3</a-radio>
                <a-radio value="minio">MinIO</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <!-- 本地存储配置 -->
            <div v-if="storageConfig.type === 'local'">
              <a-form-item label="存储路径" name="localPath">
                <a-input v-model:value="storageConfig.localPath" placeholder="请输入本地存储路径" />
              </a-form-item>
              
              <a-form-item label="最大文件大小" name="maxFileSize">
                <a-input-number
                  v-model:value="storageConfig.maxFileSize"
                  :min="1"
                  addon-after="MB"
                  style="width: 200px"
                  placeholder="最大文件大小"
                />
              </a-form-item>
            </div>
            
            <!-- 云存储配置 -->
            <div v-if="storageConfig.type !== 'local'">
              <a-row :gutter="24">
                <a-col :xs="24" :md="12">
                  <a-form-item label="访问密钥ID" name="accessKeyId">
                    <a-input v-model:value="storageConfig.accessKeyId" placeholder="请输入访问密钥ID" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="访问密钥Secret" name="accessKeySecret">
                    <a-input-password v-model:value="storageConfig.accessKeySecret" placeholder="请输入访问密钥Secret" />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="24">
                <a-col :xs="24" :md="12">
                  <a-form-item label="存储桶名称" name="bucket">
                    <a-input v-model:value="storageConfig.bucket" placeholder="请输入存储桶名称" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-form-item label="区域" name="region">
                    <a-input v-model:value="storageConfig.region" placeholder="请输入区域" />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-form-item v-if="storageConfig.type === 'minio'" label="端点URL" name="endpoint">
                <a-input v-model:value="storageConfig.endpoint" placeholder="请输入MinIO端点URL" />
              </a-form-item>
            </div>
            
            <a-form-item>
              <a-checkbox v-model:checked="storageConfig.enableCdn">
                启用CDN加速
              </a-checkbox>
            </a-form-item>
            
            <a-form-item v-if="storageConfig.enableCdn" label="CDN域名" name="cdnDomain">
              <a-input v-model:value="storageConfig.cdnDomain" placeholder="请输入CDN域名" />
            </a-form-item>
          </a-form>
        </a-card>
      </div>
      
      <!-- 安全配置 -->
      <div v-show="activeTab === 'security'" class="config-section">
        <a-card title="安全配置" class="config-card">
          <template #extra>
            <a-button type="primary" @click="saveSecurityConfig" :loading="saving">
              <SaveOutlined />
              保存配置
            </a-button>
          </template>
          
          <a-form
            ref="securityFormRef"
            :model="securityConfig"
            :rules="securityRules"
            layout="vertical"
          >
            <a-divider orientation="left">密码策略</a-divider>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="8">
                <a-form-item label="最小密码长度" name="minPasswordLength">
                  <a-input-number
                    v-model:value="securityConfig.minPasswordLength"
                    :min="6"
                    :max="32"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="密码有效期" name="passwordExpireDays">
                  <a-input-number
                    v-model:value="securityConfig.passwordExpireDays"
                    :min="0"
                    :max="365"
                    addon-after="天"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="密码重试次数" name="maxPasswordRetries">
                  <a-input-number
                    v-model:value="securityConfig.maxPasswordRetries"
                    :min="3"
                    :max="10"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item>
              <a-space direction="vertical">
                <a-checkbox v-model:checked="securityConfig.requireUppercase">
                  密码必须包含大写字母
                </a-checkbox>
                <a-checkbox v-model:checked="securityConfig.requireLowercase">
                  密码必须包含小写字母
                </a-checkbox>
                <a-checkbox v-model:checked="securityConfig.requireNumbers">
                  密码必须包含数字
                </a-checkbox>
                <a-checkbox v-model:checked="securityConfig.requireSpecialChars">
                  密码必须包含特殊字符
                </a-checkbox>
              </a-space>
            </a-form-item>
            
            <a-divider orientation="left">会话管理</a-divider>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="8">
                <a-form-item label="会话超时" name="sessionTimeout">
                  <a-input-number
                    v-model:value="securityConfig.sessionTimeout"
                    :min="5"
                    :max="1440"
                    addon-after="分钟"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="最大并发会话" name="maxConcurrentSessions">
                  <a-input-number
                    v-model:value="securityConfig.maxConcurrentSessions"
                    :min="1"
                    :max="10"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item>
                  <template #label>
                    <span>启用双因子认证</span>
                  </template>
                  <a-switch v-model:checked="securityConfig.enableTwoFactor" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-divider orientation="left">IP访问控制</a-divider>
            
            <a-form-item>
              <a-checkbox v-model:checked="securityConfig.enableIpWhitelist">
                启用IP白名单
              </a-checkbox>
            </a-form-item>
            
            <a-form-item v-if="securityConfig.enableIpWhitelist" label="IP白名单" name="ipWhitelist">
              <a-textarea
                v-model:value="securityConfig.ipWhitelist"
                :rows="4"
                placeholder="请输入IP地址，每行一个，支持CIDR格式"
              />
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securityConfig.enableIpBlacklist">
                启用IP黑名单
              </a-checkbox>
            </a-form-item>
            
            <a-form-item v-if="securityConfig.enableIpBlacklist" label="IP黑名单" name="ipBlacklist">
              <a-textarea
                v-model:value="securityConfig.ipBlacklist"
                :rows="4"
                placeholder="请输入IP地址，每行一个，支持CIDR格式"
              />
            </a-form-item>
          </a-form>
        </a-card>
      </div>
      
      <!-- 通知配置 -->
      <div v-show="activeTab === 'notification'" class="config-section">
        <a-card title="通知配置" class="config-card">
          <template #extra>
            <a-button type="primary" @click="saveNotificationConfig" :loading="saving">
              <SaveOutlined />
              保存配置
            </a-button>
          </template>
          
          <a-form
            ref="notificationFormRef"
            :model="notificationConfig"
            layout="vertical"
          >
            <a-divider orientation="left">邮件通知</a-divider>
            
            <a-form-item>
              <a-space direction="vertical" style="width: 100%">
                <a-checkbox v-model:checked="notificationConfig.email.userRegistration">
                  用户注册通知
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.email.passwordReset">
                  密码重置通知
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.email.loginAlert">
                  异常登录警告
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.email.systemMaintenance">
                  系统维护通知
                </a-checkbox>
              </a-space>
            </a-form-item>
            
            <a-divider orientation="left">系统通知</a-divider>
            
            <a-form-item>
              <a-space direction="vertical" style="width: 100%">
                <a-checkbox v-model:checked="notificationConfig.system.taskAssignment">
                  任务分配通知
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.system.taskDeadline">
                  任务截止提醒
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.system.projectUpdate">
                  项目更新通知
                </a-checkbox>
                <a-checkbox v-model:checked="notificationConfig.system.teamInvitation">
                  团队邀请通知
                </a-checkbox>
              </a-space>
            </a-form-item>
            
            <a-divider orientation="left">推送设置</a-divider>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item>
                  <template #label>
                    <span>启用浏览器推送</span>
                  </template>
                  <a-switch v-model:checked="notificationConfig.push.browser" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item>
                  <template #label>
                    <span>启用移动端推送</span>
                  </template>
                  <a-switch v-model:checked="notificationConfig.push.mobile" />
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="推送频率限制" name="pushRateLimit">
              <a-input-number
                v-model:value="notificationConfig.push.rateLimit"
                :min="1"
                :max="100"
                addon-after="条/小时"
                style="width: 200px"
              />
            </a-form-item>
          </a-form>
        </a-card>
      </div>
      
      <!-- 集成配置 -->
      <div v-show="activeTab === 'integration'" class="config-section">
        <a-card title="集成配置" class="config-card">
          <template #extra>
            <a-button type="primary" @click="saveIntegrationConfig" :loading="saving">
              <SaveOutlined />
              保存配置
            </a-button>
          </template>
          
          <a-form
            ref="integrationFormRef"
            :model="integrationConfig"
            layout="vertical"
          >
            <a-divider orientation="left">第三方登录</a-divider>
            
            <!-- GitHub登录 -->
            <a-card size="small" title="GitHub" style="margin-bottom: 16px;">
              <template #extra>
                <a-switch v-model:checked="integrationConfig.oauth.github.enabled" />
              </template>
              
              <div v-if="integrationConfig.oauth.github.enabled">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="Client ID">
                      <a-input v-model:value="integrationConfig.oauth.github.clientId" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Client Secret">
                      <a-input-password v-model:value="integrationConfig.oauth.github.clientSecret" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </a-card>
            
            <!-- Google登录 -->
            <a-card size="small" title="Google" style="margin-bottom: 16px;">
              <template #extra>
                <a-switch v-model:checked="integrationConfig.oauth.google.enabled" />
              </template>
              
              <div v-if="integrationConfig.oauth.google.enabled">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="Client ID">
                      <a-input v-model:value="integrationConfig.oauth.google.clientId" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Client Secret">
                      <a-input-password v-model:value="integrationConfig.oauth.google.clientSecret" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </a-card>
            
            <a-divider orientation="left">API配置</a-divider>
            
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item>
                  <template #label>
                    <span>启用API访问</span>
                  </template>
                  <a-switch v-model:checked="integrationConfig.api.enabled" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="API版本" name="apiVersion">
                  <a-select v-model:value="integrationConfig.api.version">
                    <a-select-option value="v1">v1</a-select-option>
                    <a-select-option value="v2">v2</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            
            <a-form-item label="API速率限制" name="apiRateLimit">
              <a-input-number
                v-model:value="integrationConfig.api.rateLimit"
                :min="10"
                :max="10000"
                addon-after="请求/小时"
                style="width: 200px"
              />
            </a-form-item>
            
            <a-divider orientation="left">Webhook配置</a-divider>
            
            <a-form-item>
              <a-checkbox v-model:checked="integrationConfig.webhook.enabled">
                启用Webhook
              </a-checkbox>
            </a-form-item>
            
            <a-form-item v-if="integrationConfig.webhook.enabled" label="Webhook URL">
              <a-input v-model:value="integrationConfig.webhook.url" placeholder="请输入Webhook URL" />
            </a-form-item>
            
            <a-form-item v-if="integrationConfig.webhook.enabled" label="签名密钥">
              <a-input-password v-model:value="integrationConfig.webhook.secret" placeholder="请输入签名密钥" />
            </a-form-item>
          </a-form>
        </a-card>
      </div>
    </div>
    
    <!-- Logo预览模态框 -->
    <a-modal v-model:open="previewVisible" title="Logo预览" :footer="null">
      <img :src="previewImage" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SettingOutlined,
  MailOutlined,
  CloudOutlined,
  SafetyOutlined,
  BellOutlined,
  ApiOutlined,
  SaveOutlined,
  ExperimentOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const selectedKeys = ref(['basic'])
const activeTab = ref('basic')
const saving = ref(false)
const testing = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const logoFileList = ref([])

// 表单引用
const basicFormRef = ref()
const emailFormRef = ref()
const storageFormRef = ref()
const securityFormRef = ref()
const notificationFormRef = ref()
const integrationFormRef = ref()

// 基础配置
const basicConfig = reactive({
  systemName: 'Verto项目管理系统',
  systemVersion: '2.1.0',
  systemDomain: 'verto.example.com',
  systemPort: 8080,
  systemDescription: '一个现代化的项目管理和协作平台',
  systemLogo: '',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  theme: 'light',
  enableRegistration: true,
  enableGuestAccess: false,
  enableMaintenance: false
})

// 邮件配置
const emailConfig = reactive({
  enabled: true,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  fromEmail: 'noreply@example.com',
  fromName: 'Verto系统',
  username: 'noreply@example.com',
  password: '',
  encryption: 'tls',
  timeout: 30
})

// 存储配置
const storageConfig = reactive({
  type: 'local',
  localPath: '/uploads',
  maxFileSize: 10,
  accessKeyId: '',
  accessKeySecret: '',
  bucket: '',
  region: '',
  endpoint: '',
  enableCdn: false,
  cdnDomain: ''
})

// 安全配置
const securityConfig = reactive({
  minPasswordLength: 8,
  passwordExpireDays: 90,
  maxPasswordRetries: 5,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  sessionTimeout: 120,
  maxConcurrentSessions: 3,
  enableTwoFactor: false,
  enableIpWhitelist: false,
  ipWhitelist: '',
  enableIpBlacklist: false,
  ipBlacklist: ''
})

// 通知配置
const notificationConfig = reactive({
  email: {
    userRegistration: true,
    passwordReset: true,
    loginAlert: true,
    systemMaintenance: true
  },
  system: {
    taskAssignment: true,
    taskDeadline: true,
    projectUpdate: true,
    teamInvitation: true
  },
  push: {
    browser: true,
    mobile: false,
    rateLimit: 10
  }
})

// 集成配置
const integrationConfig = reactive({
  oauth: {
    github: {
      enabled: false,
      clientId: '',
      clientSecret: ''
    },
    google: {
      enabled: false,
      clientId: '',
      clientSecret: ''
    }
  },
  api: {
    enabled: true,
    version: 'v1',
    rateLimit: 1000
  },
  webhook: {
    enabled: false,
    url: '',
    secret: ''
  }
})

// 表单验证规则
const basicRules = {
  systemName: [
    { required: true, message: '请输入系统名称' }
  ],
  systemVersion: [
    { required: true, message: '请输入系统版本' }
  ],
  systemDomain: [
    { required: true, message: '请输入系统域名' }
  ],
  systemPort: [
    { required: true, message: '请输入系统端口' }
  ]
}

const emailRules = {
  smtpHost: [
    { required: true, message: '请输入SMTP服务器地址' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口' }
  ],
  fromEmail: [
    { required: true, message: '请输入发件人邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ],
  username: [
    { required: true, message: '请输入SMTP用户名' }
  ],
  password: [
    { required: true, message: '请输入SMTP密码' }
  ]
}

const storageRules = {
  localPath: [
    { required: true, message: '请输入本地存储路径' }
  ],
  accessKeyId: [
    { required: true, message: '请输入访问密钥ID' }
  ],
  accessKeySecret: [
    { required: true, message: '请输入访问密钥Secret' }
  ],
  bucket: [
    { required: true, message: '请输入存储桶名称' }
  ]
}

const securityRules = {
  minPasswordLength: [
    { required: true, message: '请设置最小密码长度' }
  ],
  sessionTimeout: [
    { required: true, message: '请设置会话超时时间' }
  ]
}

// 方法
/**
 * 菜单点击处理
 */
const handleMenuClick = ({ key }: { key: string }) => {
  activeTab.value = key
  selectedKeys.value = [key]
}

/**
 * Logo上传前处理
 */
const beforeUploadLogo = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB')
    return false
  }
  
  return false // 阻止自动上传
}

/**
 * Logo预览
 */
const previewLogo = (file: any) => {
  previewImage.value = file.url || file.preview
  previewVisible.value = true
}

/**
 * 保存基础配置
 */
const saveBasicConfig = async () => {
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    setTimeout(() => {
      saving.value = false
      message.success('基础配置保存成功')
    }, 1000)
  } catch (error) {
    console.error('保存基础配置失败:', error)
  }
}

/**
 * 测试邮件配置
 */
const testEmailConfig = async () => {
  try {
    await emailFormRef.value.validate()
    testing.value = true
    
    // 模拟测试
    setTimeout(() => {
      testing.value = false
      message.success('邮件配置测试成功')
    }, 2000)
  } catch (error) {
    console.error('测试邮件配置失败:', error)
  }
}

/**
 * 保存邮件配置
 */
const saveEmailConfig = async () => {
  try {
    await emailFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    setTimeout(() => {
      saving.value = false
      message.success('邮件配置保存成功')
    }, 1000)
  } catch (error) {
    console.error('保存邮件配置失败:', error)
  }
}

/**
 * 测试存储配置
 */
const testStorageConfig = async () => {
  try {
    await storageFormRef.value.validate()
    testing.value = true
    
    // 模拟测试
    setTimeout(() => {
      testing.value = false
      message.success('存储配置测试成功')
    }, 2000)
  } catch (error) {
    console.error('测试存储配置失败:', error)
  }
}

/**
 * 保存存储配置
 */
const saveStorageConfig = async () => {
  try {
    await storageFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    setTimeout(() => {
      saving.value = false
      message.success('存储配置保存成功')
    }, 1000)
  } catch (error) {
    console.error('保存存储配置失败:', error)
  }
}

/**
 * 保存安全配置
 */
const saveSecurityConfig = async () => {
  try {
    await securityFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    setTimeout(() => {
      saving.value = false
      message.success('安全配置保存成功')
    }, 1000)
  } catch (error) {
    console.error('保存安全配置失败:', error)
  }
}

/**
 * 保存通知配置
 */
const saveNotificationConfig = () => {
  saving.value = true
  
  // 模拟保存
  setTimeout(() => {
    saving.value = false
    message.success('通知配置保存成功')
  }, 1000)
}

/**
 * 保存集成配置
 */
const saveIntegrationConfig = () => {
  saving.value = true
  
  // 模拟保存
  setTimeout(() => {
    saving.value = false
    message.success('集成配置保存成功')
  }, 1000)
}

// 生命周期
onMounted(() => {
  // 初始化配置数据
  console.log('系统配置页面已加载')
})
</script>

<style scoped>
.system-config {
  padding: 0;
}

.config-nav {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-nav .ant-menu {
  border-bottom: none;
}

.config-content {
  min-height: 600px;
}

.config-section {
  animation: fadeIn 0.3s ease-out;
}

.config-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-card .ant-card-head {
  border-bottom: 1px solid #f0f0f0;
}

.config-card .ant-card-body {
  padding: 24px;
}

.ant-divider {
  margin: 24px 0 16px 0;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .config-content .ant-col {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .config-nav .ant-menu {
    overflow-x: auto;
  }
  
  .config-card .ant-card-body {
    padding: 16px;
  }
  
  .ant-form-item {
    margin-bottom: 16px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .config-nav,
  .config-card {
    background: #141414;
    border-color: #303030;
  }
  
  .config-nav .ant-menu {
    background: #141414;
  }
  
  .ant-divider {
    border-color: #303030;
  }
}
</style>