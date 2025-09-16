<template>
  <div class="system-security">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统安全</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统安全</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button type="primary" @click="showSecurityScanModal">
            <ScanOutlined />
            安全扫描
          </a-button>
          <a-button @click="showSecuritySettingsModal">
            <SettingOutlined />
            安全设置
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 安全状态概览 -->
    <div class="security-overview">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="security-card threat-card">
            <div class="security-content">
              <div class="security-icon">
                <div class="threat-icon">
                  <BugOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="security-info">
                <div class="security-title">威胁检测</div>
                <div class="security-value">{{ securityStats.threats.count }}</div>
                <div class="security-detail">
                  <span class="threat-level">风险等级: {{ securityStats.threats.level }}</span>
                </div>
              </div>
              <div class="security-status">
                <a-tag :color="getThreatLevelColor(securityStats.threats.level)">
                  {{ securityStats.threats.level }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="security-card firewall-card">
            <div class="security-content">
              <div class="security-icon">
                <div class="firewall-icon">
                  <FireOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="security-info">
                <div class="security-title">防火墙</div>
                <div class="security-value">{{ securityStats.firewall.blocked }}</div>
                <div class="security-detail">
                  <span>已拦截攻击</span>
                </div>
              </div>
              <div class="security-status">
                <a-tag :color="securityStats.firewall.enabled ? 'green' : 'red'">
                  {{ securityStats.firewall.enabled ? '已启用' : '已禁用' }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="security-card antivirus-card">
            <div class="security-content">
              <div class="security-icon">
                <div class="antivirus-icon">
                  <SafetyOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="security-info">
                <div class="security-title">病毒防护</div>
                <div class="security-value">{{ securityStats.antivirus.scanned }}</div>
                <div class="security-detail">
                  <span>已扫描文件</span>
                </div>
              </div>
              <div class="security-status">
                <a-tag :color="securityStats.antivirus.enabled ? 'green' : 'red'">
                  {{ securityStats.antivirus.enabled ? '已启用' : '已禁用' }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="security-card intrusion-card">
            <div class="security-content">
              <div class="security-icon">
                <div class="intrusion-icon">
                  <EyeOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="security-info">
                <div class="security-title">入侵检测</div>
                <div class="security-value">{{ securityStats.intrusion.attempts }}</div>
                <div class="security-detail">
                  <span>入侵尝试</span>
                </div>
              </div>
              <div class="security-status">
                <a-tag :color="securityStats.intrusion.enabled ? 'green' : 'red'">
                  {{ securityStats.intrusion.enabled ? '已启用' : '已禁用' }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 主要内容区域 -->
    <a-row :gutter="16">
      <a-col :xs="24" :lg="16">
        <!-- 安全事件 -->
        <a-card class="security-events-card" style="margin-bottom: 16px;">
          <template #title>
            <span>安全事件</span>
            <a-tag color="orange" style="margin-left: 8px">
              待处理: {{ pendingEvents.length }}
            </a-tag>
          </template>
          
          <template #extra>
            <a-space>
              <a-select
                v-model:value="eventFilter"
                placeholder="事件类型"
                style="width: 120px"
                allowClear
                @change="handleEventFilter"
              >
                <a-select-option value="attack">攻击事件</a-select-option>
                <a-select-option value="intrusion">入侵检测</a-select-option>
                <a-select-option value="malware">恶意软件</a-select-option>
                <a-select-option value="policy">策略违规</a-select-option>
              </a-select>
              <a-select
                v-model:value="severityFilter"
                placeholder="严重程度"
                style="width: 100px"
                allowClear
                @change="handleSeverityFilter"
              >
                <a-select-option value="critical">严重</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-space>
          </template>
          
          <a-table
            :columns="eventColumns"
            :data-source="filteredEvents"
            :pagination="{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              size: 'small'
            }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getEventTypeColor(record.type)">
                  {{ getEventTypeName(record.type) }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'severity'">
                <a-tag :color="getSeverityColor(record.severity)">
                  {{ getSeverityName(record.severity) }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getEventStatusColor(record.status)">
                  {{ getEventStatusName(record.status) }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'time'">
                {{ formatDateTime(record.time) }}
              </template>
              
              <template v-else-if="column.key === 'actions'">
                <a-space size="small">
                  <a-tooltip title="查看详情">
                    <a-button type="text" size="small" @click="showEventDetail(record)">
                      <EyeOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip v-if="record.status === 'pending'" title="处理事件">
                    <a-button type="text" size="small" @click="handleEvent(record)">
                      <CheckOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip title="忽略事件">
                    <a-popconfirm
                      title="确定要忽略这个事件吗？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="ignoreEvent(record)"
                    >
                      <a-button type="text" size="small">
                        <CloseOutlined />
                      </a-button>
                    </a-popconfirm>
                  </a-tooltip>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
        
        <!-- 访问控制 -->
        <a-card class="access-control-card">
          <template #title>
            <span>访问控制</span>
          </template>
          
          <template #extra>
            <a-space>
              <a-button @click="showAddRuleModal">
                <PlusOutlined />
                添加规则
              </a-button>
              <a-button @click="showImportRulesModal">
                <ImportOutlined />
                导入规则
              </a-button>
            </a-space>
          </template>
          
          <a-table
            :columns="ruleColumns"
            :data-source="accessRules"
            :pagination="{
              pageSize: 8,
              showSizeChanger: false,
              showQuickJumper: false,
              size: 'small'
            }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-tag :color="record.action === 'allow' ? 'green' : 'red'">
                  {{ record.action === 'allow' ? '允许' : '拒绝' }}
                </a-tag>
              </template>
              
              <template v-else-if="column.key === 'enabled'">
                <a-switch
                  v-model:checked="record.enabled"
                  size="small"
                  @change="toggleRule(record)"
                />
              </template>
              
              <template v-else-if="column.key === 'priority'">
                <a-tag color="blue">{{ record.priority }}</a-tag>
              </template>
              
              <template v-else-if="column.key === 'actions'">
                <a-space size="small">
                  <a-tooltip title="编辑规则">
                    <a-button type="text" size="small" @click="editRule(record)">
                      <EditOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip title="删除规则">
                    <a-popconfirm
                      title="确定要删除这个规则吗？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="deleteRule(record)"
                    >
                      <a-button type="text" size="small" danger>
                        <DeleteOutlined />
                      </a-button>
                    </a-popconfirm>
                  </a-tooltip>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="8">
        <!-- 安全统计 -->
        <a-card title="安全统计" class="security-stats-card" style="margin-bottom: 16px;">
          <div class="stats-chart">
            <div class="chart-placeholder">
              <PieChartOutlined style="font-size: 48px; color: #d9d9d9;" />
              <p>安全事件分布图</p>
            </div>
          </div>
          
          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-label">今日事件</div>
              <div class="stat-value">{{ securityStats.today.events }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">本周事件</div>
              <div class="stat-value">{{ securityStats.week.events }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">本月事件</div>
              <div class="stat-value">{{ securityStats.month.events }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">已处理事件</div>
              <div class="stat-value">{{ securityStats.resolved.events }}</div>
            </div>
          </div>
        </a-card>
        
        <!-- 安全建议 -->
        <a-card title="安全建议" class="security-recommendations-card">
          <div class="recommendations-list">
            <div
              v-for="recommendation in securityRecommendations"
              :key="recommendation.id"
              class="recommendation-item"
              :class="`recommendation-${recommendation.priority}`"
            >
              <div class="recommendation-icon">
                <ExclamationCircleOutlined v-if="recommendation.priority === 'high'" />
                <WarningOutlined v-else-if="recommendation.priority === 'medium'" />
                <InfoCircleOutlined v-else />
              </div>
              <div class="recommendation-content">
                <div class="recommendation-title">{{ recommendation.title }}</div>
                <div class="recommendation-description">{{ recommendation.description }}</div>
              </div>
              <div class="recommendation-actions">
                <a-button type="text" size="small" @click="applyRecommendation(recommendation)">
                  应用
                </a-button>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 安全扫描模态框 -->
    <a-modal
      v-model:open="securityScanModalVisible"
      title="安全扫描"
      width="600px"
      @ok="startSecurityScan"
      :confirm-loading="scanLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="扫描类型">
          <a-checkbox-group v-model:value="scanOptions.types">
            <a-checkbox value="malware">恶意软件扫描</a-checkbox>
            <a-checkbox value="vulnerability">漏洞扫描</a-checkbox>
            <a-checkbox value="configuration">配置检查</a-checkbox>
            <a-checkbox value="network">网络安全扫描</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item label="扫描范围">
          <a-radio-group v-model:value="scanOptions.scope">
            <a-radio value="quick">快速扫描</a-radio>
            <a-radio value="full">完整扫描</a-radio>
            <a-radio value="custom">自定义扫描</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="scanOptions.scope === 'custom'" label="扫描路径">
          <a-input
            v-model:value="scanOptions.customPath"
            placeholder="请输入扫描路径"
          />
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="scanOptions.autoFix">
            自动修复发现的问题
          </a-checkbox>
        </a-form-item>
      </a-form>
      
      <div v-if="scanProgress.active" class="scan-progress">
        <a-progress
          :percent="scanProgress.percent"
          :status="scanProgress.status"
        />
        <p class="scan-status">{{ scanProgress.message }}</p>
      </div>
    </a-modal>
    
    <!-- 安全设置模态框 -->
    <a-modal
      v-model:open="securitySettingsModalVisible"
      title="安全设置"
      width="700px"
      @ok="saveSecuritySettings"
    >
      <a-tabs v-model:activeKey="securitySettingsTab">
        <a-tab-pane key="general" tab="常规设置">
          <a-form layout="vertical">
            <a-form-item label="密码策略">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-input-number
                    v-model:value="securitySettings.password.minLength"
                    :min="6"
                    :max="32"
                    addon-after="位"
                    placeholder="最小长度"
                  />
                </a-col>
                <a-col :span="12">
                  <a-input-number
                    v-model:value="securitySettings.password.maxAge"
                    :min="1"
                    :max="365"
                    addon-after="天"
                    placeholder="有效期"
                  />
                </a-col>
              </a-row>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.password.requireUppercase">
                要求包含大写字母
              </a-checkbox>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.password.requireNumbers">
                要求包含数字
              </a-checkbox>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.password.requireSpecialChars">
                要求包含特殊字符
              </a-checkbox>
            </a-form-item>
            
            <a-form-item label="登录安全">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-input-number
                    v-model:value="securitySettings.login.maxAttempts"
                    :min="3"
                    :max="10"
                    addon-after="次"
                    placeholder="最大尝试次数"
                  />
                </a-col>
                <a-col :span="12">
                  <a-input-number
                    v-model:value="securitySettings.login.lockoutDuration"
                    :min="5"
                    :max="60"
                    addon-after="分钟"
                    placeholder="锁定时长"
                  />
                </a-col>
              </a-row>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.login.requireTwoFactor">
                启用双因素认证
              </a-checkbox>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="firewall" tab="防火墙">
          <a-form layout="vertical">
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.firewall.enabled">
                启用防火墙
              </a-checkbox>
            </a-form-item>
            
            <a-form-item label="默认策略">
              <a-radio-group v-model:value="securitySettings.firewall.defaultPolicy">
                <a-radio value="allow">允许</a-radio>
                <a-radio value="deny">拒绝</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.firewall.logBlocked">
                记录被阻止的连接
              </a-checkbox>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.firewall.enableDDoSProtection">
                启用DDoS防护
              </a-checkbox>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="monitoring" tab="监控">
          <a-form layout="vertical">
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.monitoring.enabled">
                启用安全监控
              </a-checkbox>
            </a-form-item>
            
            <a-form-item label="监控级别">
              <a-radio-group v-model:value="securitySettings.monitoring.level">
                <a-radio value="basic">基础</a-radio>
                <a-radio value="standard">标准</a-radio>
                <a-radio value="advanced">高级</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.monitoring.realTimeAlerts">
                实时告警
              </a-checkbox>
            </a-form-item>
            
            <a-form-item>
              <a-checkbox v-model:checked="securitySettings.monitoring.emailNotifications">
                邮件通知
              </a-checkbox>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    
    <!-- 事件详情模态框 -->
    <a-modal
      v-model:open="eventDetailModalVisible"
      title="事件详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedEvent" class="event-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="事件ID">
            {{ selectedEvent.id }}
          </a-descriptions-item>
          <a-descriptions-item label="事件类型">
            <a-tag :color="getEventTypeColor(selectedEvent.type)">
              {{ getEventTypeName(selectedEvent.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="严重程度">
            <a-tag :color="getSeverityColor(selectedEvent.severity)">
              {{ getSeverityName(selectedEvent.severity) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getEventStatusColor(selectedEvent.status)">
              {{ getEventStatusName(selectedEvent.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="发生时间">
            {{ formatDateTime(selectedEvent.time) }}
          </a-descriptions-item>
          <a-descriptions-item label="来源IP">
            {{ selectedEvent.sourceIp }}
          </a-descriptions-item>
          <a-descriptions-item label="目标IP">
            {{ selectedEvent.targetIp }}
          </a-descriptions-item>
          <a-descriptions-item label="端口">
            {{ selectedEvent.port }}
          </a-descriptions-item>
          <a-descriptions-item label="事件描述" :span="2">
            {{ selectedEvent.description }}
          </a-descriptions-item>
          <a-descriptions-item label="详细信息" :span="2">
            <pre class="event-details">{{ selectedEvent.details }}</pre>
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="event-actions" style="margin-top: 16px; text-align: right;">
          <a-space>
            <a-button v-if="selectedEvent.status === 'pending'" type="primary" @click="handleEvent(selectedEvent)">
              处理事件
            </a-button>
            <a-button @click="ignoreEvent(selectedEvent)">
              忽略事件
            </a-button>
            <a-button @click="eventDetailModalVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 添加访问规则模态框 -->
    <a-modal
      v-model:open="addRuleModalVisible"
      title="添加访问规则"
      width="600px"
      @ok="saveAccessRule"
    >
      <a-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        layout="vertical"
      >
        <a-form-item label="规则名称" name="name">
          <a-input v-model:value="ruleForm.name" placeholder="请输入规则名称" />
        </a-form-item>
        
        <a-form-item label="源地址" name="source">
          <a-input v-model:value="ruleForm.source" placeholder="IP地址或网段，如：192.168.1.0/24" />
        </a-form-item>
        
        <a-form-item label="目标地址" name="target">
          <a-input v-model:value="ruleForm.target" placeholder="IP地址或网段，如：0.0.0.0/0" />
        </a-form-item>
        
        <a-form-item label="端口" name="port">
          <a-input v-model:value="ruleForm.port" placeholder="端口号或端口范围，如：80,443,8000-9000" />
        </a-form-item>
        
        <a-form-item label="协议" name="protocol">
          <a-select v-model:value="ruleForm.protocol" placeholder="请选择协议">
            <a-select-option value="tcp">TCP</a-select-option>
            <a-select-option value="udp">UDP</a-select-option>
            <a-select-option value="icmp">ICMP</a-select-option>
            <a-select-option value="any">任意</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="动作" name="action">
          <a-radio-group v-model:value="ruleForm.action">
            <a-radio value="allow">允许</a-radio>
            <a-radio value="deny">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="优先级" name="priority">
          <a-input-number
            v-model:value="ruleForm.priority"
            :min="1"
            :max="100"
            placeholder="1-100，数字越小优先级越高"
          />
        </a-form-item>
        
        <a-form-item label="描述">
          <a-textarea
            v-model:value="ruleForm.description"
            placeholder="规则描述（可选）"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
  ScanOutlined,
  BugOutlined,
  FireOutlined,
  SafetyOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ImportOutlined,
  EditOutlined,
  DeleteOutlined,
  PieChartOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const eventFilter = ref()
const severityFilter = ref()
const securityScanModalVisible = ref(false)
const securitySettingsModalVisible = ref(false)
const eventDetailModalVisible = ref(false)
const addRuleModalVisible = ref(false)
const selectedEvent = ref(null)
const scanLoading = ref(false)
const securitySettingsTab = ref('general')
const ruleFormRef = ref()

// 安全统计数据
const securityStats = reactive({
  threats: {
    count: 3,
    level: '中等'
  },
  firewall: {
    enabled: true,
    blocked: 127
  },
  antivirus: {
    enabled: true,
    scanned: 45678
  },
  intrusion: {
    enabled: true,
    attempts: 15
  },
  today: {
    events: 8
  },
  week: {
    events: 42
  },
  month: {
    events: 156
  },
  resolved: {
    events: 134
  }
})

// 安全事件数据
const securityEvents = ref([
  {
    id: 'SE001',
    type: 'attack',
    severity: 'high',
    status: 'pending',
    title: 'SQL注入攻击尝试',
    description: '检测到来自192.168.1.100的SQL注入攻击尝试',
    time: '2024-01-15 14:30:00',
    sourceIp: '192.168.1.100',
    targetIp: '10.0.0.1',
    port: '3306',
    details: 'User-Agent: Mozilla/5.0\nPayload: \' OR 1=1 --\nQuery: SELECT * FROM users WHERE id=\' OR 1=1 --'
  },
  {
    id: 'SE002',
    type: 'intrusion',
    severity: 'critical',
    status: 'pending',
    title: '异常登录尝试',
    description: '检测到来自未知IP的多次登录失败',
    time: '2024-01-15 14:25:00',
    sourceIp: '203.0.113.45',
    targetIp: '10.0.0.1',
    port: '22',
    details: 'Failed login attempts: 15\nUsername: admin, root, user\nTime span: 5 minutes'
  },
  {
    id: 'SE003',
    type: 'malware',
    severity: 'medium',
    status: 'resolved',
    title: '恶意文件检测',
    description: '在临时目录发现可疑文件',
    time: '2024-01-15 14:20:00',
    sourceIp: 'localhost',
    targetIp: 'localhost',
    port: '-',
    details: 'File: /tmp/suspicious.exe\nHash: d41d8cd98f00b204e9800998ecf8427e\nThreat: Trojan.Generic'
  },
  {
    id: 'SE004',
    type: 'policy',
    severity: 'low',
    status: 'ignored',
    title: '策略违规',
    description: '用户尝试访问受限资源',
    time: '2024-01-15 14:15:00',
    sourceIp: '192.168.1.50',
    targetIp: '10.0.0.5',
    port: '443',
    details: 'User: john.doe\nResource: /admin/config\nAction: GET\nResult: Access Denied'
  }
])

// 访问控制规则
const accessRules = ref([
  {
    id: 'R001',
    name: '允许HTTP访问',
    source: '0.0.0.0/0',
    target: '10.0.0.1',
    port: '80',
    protocol: 'tcp',
    action: 'allow',
    priority: 10,
    enabled: true,
    description: '允许所有来源访问HTTP服务'
  },
  {
    id: 'R002',
    name: '允许HTTPS访问',
    source: '0.0.0.0/0',
    target: '10.0.0.1',
    port: '443',
    protocol: 'tcp',
    action: 'allow',
    priority: 10,
    enabled: true,
    description: '允许所有来源访问HTTPS服务'
  },
  {
    id: 'R003',
    name: '拒绝SSH访问',
    source: '0.0.0.0/0',
    target: '10.0.0.1',
    port: '22',
    protocol: 'tcp',
    action: 'deny',
    priority: 5,
    enabled: true,
    description: '拒绝外部SSH访问'
  },
  {
    id: 'R004',
    name: '允许内网SSH',
    source: '192.168.1.0/24',
    target: '10.0.0.1',
    port: '22',
    protocol: 'tcp',
    action: 'allow',
    priority: 1,
    enabled: true,
    description: '允许内网SSH访问'
  }
])

// 安全建议
const securityRecommendations = ref([
  {
    id: 'R001',
    priority: 'high',
    title: '更新系统补丁',
    description: '发现3个高危安全漏洞，建议立即安装系统补丁'
  },
  {
    id: 'R002',
    priority: 'medium',
    title: '启用双因素认证',
    description: '建议为管理员账户启用双因素认证以提高安全性'
  },
  {
    id: 'R003',
    priority: 'low',
    title: '定期备份数据',
    description: '建议设置自动备份策略，确保数据安全'
  },
  {
    id: 'R004',
    priority: 'medium',
    title: '更新防病毒定义',
    description: '防病毒定义文件已过期，建议立即更新'
  }
])

// 扫描选项
const scanOptions = reactive({
  types: ['malware', 'vulnerability'],
  scope: 'quick',
  customPath: '',
  autoFix: false
})

// 扫描进度
const scanProgress = reactive({
  active: false,
  percent: 0,
  status: 'active',
  message: '准备开始扫描...'
})

// 安全设置
const securitySettings = reactive({
  password: {
    minLength: 8,
    maxAge: 90,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  login: {
    maxAttempts: 5,
    lockoutDuration: 15,
    requireTwoFactor: false
  },
  firewall: {
    enabled: true,
    defaultPolicy: 'deny',
    logBlocked: true,
    enableDDoSProtection: true
  },
  monitoring: {
    enabled: true,
    level: 'standard',
    realTimeAlerts: true,
    emailNotifications: true
  }
})

// 规则表单
const ruleForm = reactive({
  name: '',
  source: '',
  target: '',
  port: '',
  protocol: 'tcp',
  action: 'allow',
  priority: 50,
  description: ''
})

// 表单验证规则
const ruleFormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请输入源地址', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请输入目标地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口', trigger: 'blur' }
  ],
  protocol: [
    { required: true, message: '请选择协议', trigger: 'change' }
  ],
  action: [
    { required: true, message: '请选择动作', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' }
  ]
}

// 事件表格列定义
const eventColumns = [
  {
    title: '事件ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '类型',
    key: 'type',
    width: 100
  },
  {
    title: '严重程度',
    key: 'severity',
    width: 100
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '时间',
    key: 'time',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 120
  }
]

// 规则表格列定义
const ruleColumns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '源地址',
    dataIndex: 'source',
    key: 'source',
    width: 120
  },
  {
    title: '目标地址',
    dataIndex: 'target',
    key: 'target',
    width: 120
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 80
  },
  {
    title: '动作',
    key: 'action',
    width: 80
  },
  {
    title: '优先级',
    key: 'priority',
    width: 80
  },
  {
    title: '启用',
    key: 'enabled',
    width: 80
  },
  {
    title: '操作',
    key: 'actions',
    width: 100
  }
]

// 计算属性
const pendingEvents = computed(() => {
  return securityEvents.value.filter(event => event.status === 'pending')
})

const filteredEvents = computed(() => {
  let result = securityEvents.value
  
  if (eventFilter.value) {
    result = result.filter(event => event.type === eventFilter.value)
  }
  
  if (severityFilter.value) {
    result = result.filter(event => event.severity === severityFilter.value)
  }
  
  return result
})

// 方法
/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  
  setTimeout(() => {
    // 模拟数据更新
    securityStats.threats.count = Math.floor(Math.random() * 10)
    securityStats.firewall.blocked += Math.floor(Math.random() * 5)
    securityStats.intrusion.attempts += Math.floor(Math.random() * 3)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示安全扫描模态框
 */
const showSecurityScanModal = () => {
  securityScanModalVisible.value = true
}

/**
 * 显示安全设置模态框
 */
const showSecuritySettingsModal = () => {
  securitySettingsModalVisible.value = true
}

/**
 * 开始安全扫描
 */
const startSecurityScan = () => {
  if (scanOptions.types.length === 0) {
    message.error('请至少选择一种扫描类型')
    return
  }
  
  scanLoading.value = true
  scanProgress.active = true
  scanProgress.percent = 0
  scanProgress.status = 'active'
  scanProgress.message = '正在初始化扫描...'
  
  // 模拟扫描进度
  const interval = setInterval(() => {
    scanProgress.percent += Math.floor(Math.random() * 10) + 5
    
    if (scanProgress.percent >= 100) {
      scanProgress.percent = 100
      scanProgress.status = 'success'
      scanProgress.message = '扫描完成'
      clearInterval(interval)
      
      setTimeout(() => {
        scanLoading.value = false
        securityScanModalVisible.value = false
        scanProgress.active = false
        message.success('安全扫描完成')
      }, 1000)
    } else {
      const messages = [
        '正在扫描系统文件...',
        '正在检查网络配置...',
        '正在分析安全策略...',
        '正在检测恶意软件...',
        '正在验证系统完整性...'
      ]
      scanProgress.message = messages[Math.floor(Math.random() * messages.length)]
    }
  }, 500)
}

/**
 * 保存安全设置
 */
const saveSecuritySettings = () => {
  securitySettingsModalVisible.value = false
  message.success('安全设置已保存')
}

/**
 * 处理事件过滤
 */
const handleEventFilter = () => {
  // 过滤逻辑已在计算属性中处理
}

/**
 * 处理严重程度过滤
 */
const handleSeverityFilter = () => {
  // 过滤逻辑已在计算属性中处理
}

/**
 * 显示事件详情
 */
const showEventDetail = (event: any) => {
  selectedEvent.value = event
  eventDetailModalVisible.value = true
}

/**
 * 处理事件
 */
const handleEvent = (event: any) => {
  event.status = 'resolved'
  eventDetailModalVisible.value = false
  message.success(`事件 ${event.id} 已处理`)
}

/**
 * 忽略事件
 */
const ignoreEvent = (event: any) => {
  event.status = 'ignored'
  eventDetailModalVisible.value = false
  message.success(`事件 ${event.id} 已忽略`)
}

/**
 * 显示添加规则模态框
 */
const showAddRuleModal = () => {
  // 重置表单
  Object.assign(ruleForm, {
    name: '',
    source: '',
    target: '',
    port: '',
    protocol: 'tcp',
    action: 'allow',
    priority: 50,
    description: ''
  })
  addRuleModalVisible.value = true
}

/**
 * 显示导入规则模态框
 */
const showImportRulesModal = () => {
  message.info('导入规则功能开发中')
}

/**
 * 保存访问规则
 */
const saveAccessRule = () => {
  ruleFormRef.value.validate().then(() => {
    const newRule = {
      id: `R${String(accessRules.value.length + 1).padStart(3, '0')}`,
      ...ruleForm,
      enabled: true
    }
    
    accessRules.value.push(newRule)
    addRuleModalVisible.value = false
    message.success('访问规则已添加')
  }).catch(() => {
    message.error('请检查表单输入')
  })
}

/**
 * 切换规则状态
 */
const toggleRule = (rule: any) => {
  message.success(`规则 ${rule.name} 已${rule.enabled ? '启用' : '禁用'}`)
}

/**
 * 编辑规则
 */
const editRule = (rule: any) => {
  Object.assign(ruleForm, rule)
  addRuleModalVisible.value = true
}

/**
 * 删除规则
 */
const deleteRule = (rule: any) => {
  const index = accessRules.value.findIndex(r => r.id === rule.id)
  if (index > -1) {
    accessRules.value.splice(index, 1)
    message.success(`规则 ${rule.name} 已删除`)
  }
}

/**
 * 应用安全建议
 */
const applyRecommendation = (recommendation: any) => {
  message.success(`正在应用建议: ${recommendation.title}`)
}

/**
 * 获取威胁等级颜色
 */
const getThreatLevelColor = (level: string) => {
  const colors = {
    '低': 'green',
    '中等': 'orange',
    '高': 'red',
    '严重': 'red'
  }
  return colors[level] || 'default'
}

/**
 * 获取事件类型颜色
 */
const getEventTypeColor = (type: string) => {
  const colors = {
    attack: 'red',
    intrusion: 'orange',
    malware: 'purple',
    policy: 'blue'
  }
  return colors[type] || 'default'
}

/**
 * 获取事件类型名称
 */
const getEventTypeName = (type: string) => {
  const names = {
    attack: '攻击事件',
    intrusion: '入侵检测',
    malware: '恶意软件',
    policy: '策略违规'
  }
  return names[type] || type
}

/**
 * 获取严重程度颜色
 */
const getSeverityColor = (severity: string) => {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'green'
  }
  return colors[severity] || 'default'
}

/**
 * 获取严重程度名称
 */
const getSeverityName = (severity: string) => {
  const names = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  }
  return names[severity] || severity
}

/**
 * 获取事件状态颜色
 */
const getEventStatusColor = (status: string) => {
  const colors = {
    pending: 'orange',
    resolved: 'green',
    ignored: 'gray'
  }
  return colors[status] || 'default'
}

/**
 * 获取事件状态名称
 */
const getEventStatusName = (status: string) => {
  const names = {
    pending: '待处理',
    resolved: '已处理',
    ignored: '已忽略'
  }
  return names[status] || status
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

// 生命周期
onMounted(() => {
  console.log('系统安全页面已加载')
})
</script>

<style scoped>
.system-security {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-actions h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.right-actions {
  flex-shrink: 0;
}

.security-overview {
  margin-bottom: 24px;
}

.security-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.security-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.security-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.security-icon {
  flex-shrink: 0;
}

.threat-icon,
.firewall-icon,
.antivirus-icon,
.intrusion-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.threat-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.firewall-icon {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.antivirus-icon {
  background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
}

.intrusion-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.security-info {
  flex: 1;
  min-width: 0;
}

.security-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.security-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.security-detail {
  font-size: 12px;
  color: #999;
}

.security-status {
  flex-shrink: 0;
}

.security-events-card,
.access-control-card,
.security-stats-card,
.security-recommendations-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-chart {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

.stats-list {
  padding: 8px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.recommendations-list {
  padding: 8px 0;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background: #f5f5f5;
}

.recommendation-high {
  border-left: 4px solid #ff4d4f;
  background: #fff2f0;
}

.recommendation-medium {
  border-left: 4px solid #fa8c16;
  background: #fff7e6;
}

.recommendation-low {
  border-left: 4px solid #1890ff;
  background: #e6f7ff;
}

.recommendation-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.recommendation-high .recommendation-icon {
  color: #ff4d4f;
}

.recommendation-medium .recommendation-icon {
  color: #fa8c16;
}

.recommendation-low .recommendation-icon {
  color: #1890ff;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.recommendation-description {
  font-size: 12px;
  color: #666;
}

.recommendation-actions {
  flex-shrink: 0;
}

.scan-progress {
  margin-top: 16px;
}

.scan-status {
  text-align: center;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.event-detail .ant-descriptions {
  margin-bottom: 16px;
}

.event-details {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions .ant-space {
    flex-wrap: wrap;
  }
  
  .security-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .security-info {
    order: 2;
  }
  
  .security-status {
    order: 3;
  }
  
  .security-icon {
    order: 1;
  }
}

@media (max-width: 576px) {
  .system-security {
    padding: 0 8px;
  }
  
  .header-actions {
    padding: 8px;
  }
  
  .left-actions h2 {
    font-size: 18px;
  }
  
  .security-value {
    font-size: 20px;
  }
  
  .recommendation-item {
    padding: 8px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.security-card.threat-card:hover .threat-icon,
.security-card.firewall-card:hover .firewall-icon,
.security-card.antivirus-card:hover .antivirus-icon,
.security-card.intrusion-card:hover .intrusion-icon {
  animation: pulse 1s infinite;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .header-actions {
    background: #1f1f1f;
    color: #fff;
  }
  
  .security-card {
    background: #1f1f1f;
    border-color: #303030;
  }
  
  .security-title {
    color: #999;
  }
  
  .security-detail {
    color: #666;
  }
  
  .recommendation-item {
    background: #262626;
  }
  
  .recommendation-item:hover {
    background: #303030;
  }
  
  .recommendation-high {
    background: #2a1215;
  }
  
  .recommendation-medium {
    background: #2b1d11;
  }
  
  .recommendation-low {
    background: #111b26;
  }
  
  .event-details {
    background: #262626;
    color: #fff;
  }
  
  .stat-item {
    border-bottom-color: #303030;
  }
  
  .chart-placeholder {
    color: #666;
  }
}

/* 打印样式 */
@media print {
  .header-actions .right-actions,
  .recommendation-actions,
  .event-actions {
    display: none;
  }
  
  .security-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .system-security {
    padding: 0;
  }
}
</style>actions {
    width: 100%;
  }
  
  .right-actions .ant-space {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .header-actions {
    padding: 12px;
  }
  
  .right-