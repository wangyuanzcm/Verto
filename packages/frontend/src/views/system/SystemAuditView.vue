<template>
  <div class="system-audit">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统审计</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统审计</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="showExportModal">
            <ExportOutlined />
            导出
          </a-button>
          <a-button type="primary" @click="showAuditSettingsModal">
            <SettingOutlined />
            审计设置
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="audit-stats">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card login-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="login-icon">
                  <LoginOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">登录事件</div>
                <div class="stat-value">{{ auditStats.login.total }}</div>
                <div class="stat-detail">
                  <span class="success-count">成功: {{ auditStats.login.success }}</span>
                  <span class="failed-count">失败: {{ auditStats.login.failed }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card operation-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="operation-icon">
                  <ToolOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">操作事件</div>
                <div class="stat-value">{{ auditStats.operation.total }}</div>
                <div class="stat-detail">
                  <span>今日: {{ auditStats.operation.today }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card access-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="access-icon">
                  <KeyOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">访问控制</div>
                <div class="stat-value">{{ auditStats.access.total }}</div>
                <div class="stat-detail">
                  <span>拒绝: {{ auditStats.access.denied }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card system-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="system-icon">
                  <DatabaseOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">系统事件</div>
                <div class="stat-value">{{ auditStats.system.total }}</div>
                <div class="stat-detail">
                  <span>错误: {{ auditStats.system.errors }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 筛选栏 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filterForm">
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="filterForm.dateRange"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </a-form-item>
        
        <a-form-item label="事件类型">
          <a-select
            v-model:value="filterForm.eventType"
            placeholder="请选择事件类型"
            style="width: 150px"
            allowClear
            @change="handleEventTypeChange"
          >
            <a-select-option value="login">登录事件</a-select-option>
            <a-select-option value="operation">操作事件</a-select-option>
            <a-select-option value="access">访问控制</a-select-option>
            <a-select-option value="system">系统事件</a-select-option>
            <a-select-option value="security">安全事件</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="用户">
          <a-select
            v-model:value="filterForm.userId"
            placeholder="请选择用户"
            style="width: 150px"
            allowClear
            show-search
            :filter-option="filterUserOption"
            @change="handleUserChange"
          >
            <a-select-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="结果">
          <a-select
            v-model:value="filterForm.result"
            placeholder="请选择结果"
            style="width: 120px"
            allowClear
            @change="handleResultChange"
          >
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="denied">拒绝</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="IP地址">
          <a-input
            v-model:value="filterForm.ipAddress"
            placeholder="请输入IP地址"
            style="width: 150px"
            @change="handleIpAddressChange"
          />
        </a-form-item>
        
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="applyFilters">
              <SearchOutlined />
              查询
            </a-button>
            <a-button @click="resetFilters">
              <ClearOutlined />
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 审计日志列表 -->
    <a-card class="audit-logs-card">
      <template #title>
        <span>审计日志</span>
        <a-tag color="blue" style="margin-left: 8px">
          共 {{ filteredLogs.length }} 条记录
        </a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-tooltip title="自动刷新">
            <a-switch
              v-model:checked="autoRefresh"
              size="small"
              @change="toggleAutoRefresh"
            />
          </a-tooltip>
          <a-button size="small" @click="showBatchActionsDrawer">
            <AppstoreOutlined />
            批量操作
          </a-button>
        </a-space>
      </template>
      
      <a-table
        :columns="auditColumns"
        :data-source="filteredLogs"
        :pagination="{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: handleRowSelectionChange
        }"
        size="small"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'eventType'">
            <a-tag :color="getEventTypeColor(record.eventType)">
              {{ getEventTypeName(record.eventType) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'result'">
            <a-tag :color="getResultColor(record.result)">
              {{ getResultName(record.result) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'severity'">
            <a-tag :color="getSeverityColor(record.severity)">
              {{ getSeverityName(record.severity) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'timestamp'">
            {{ formatDateTime(record.timestamp) }}
          </template>
          
          <template v-else-if="column.key === 'duration'">
            {{ formatDuration(record.duration) }}
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space size="small">
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="showLogDetail(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="相关日志">
                <a-button type="text" size="small" @click="showRelatedLogs(record)">
                  <LinkOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="导出">
                <a-button type="text" size="small" @click="exportSingleLog(record)">
                  <DownloadOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 日志详情模态框 -->
    <a-modal
      v-model:open="logDetailModalVisible"
      title="日志详情"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedLog" class="log-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="日志ID">
            {{ selectedLog.id }}
          </a-descriptions-item>
          <a-descriptions-item label="事件类型">
            <a-tag :color="getEventTypeColor(selectedLog.eventType)">
              {{ getEventTypeName(selectedLog.eventType) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用户">
            {{ selectedLog.userName }}
          </a-descriptions-item>
          <a-descriptions-item label="用户ID">
            {{ selectedLog.userId }}
          </a-descriptions-item>
          <a-descriptions-item label="IP地址">
            {{ selectedLog.ipAddress }}
          </a-descriptions-item>
          <a-descriptions-item label="用户代理">
            {{ selectedLog.userAgent }}
          </a-descriptions-item>
          <a-descriptions-item label="时间戳">
            {{ formatDateTime(selectedLog.timestamp) }}
          </a-descriptions-item>
          <a-descriptions-item label="持续时间">
            {{ formatDuration(selectedLog.duration) }}
          </a-descriptions-item>
          <a-descriptions-item label="结果">
            <a-tag :color="getResultColor(selectedLog.result)">
              {{ getResultName(selectedLog.result) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="严重程度">
            <a-tag :color="getSeverityColor(selectedLog.severity)">
              {{ getSeverityName(selectedLog.severity) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="操作描述" :span="2">
            {{ selectedLog.description }}
          </a-descriptions-item>
          <a-descriptions-item label="请求路径" :span="2">
            {{ selectedLog.requestPath }}
          </a-descriptions-item>
          <a-descriptions-item label="请求方法">
            <a-tag>{{ selectedLog.requestMethod }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="响应状态">
            <a-tag :color="selectedLog.responseStatus >= 400 ? 'red' : 'green'">
              {{ selectedLog.responseStatus }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="请求参数" :span="2">
            <pre class="log-data">{{ formatJson(selectedLog.requestParams) }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="响应数据" :span="2">
            <pre class="log-data">{{ formatJson(selectedLog.responseData) }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="错误信息" :span="2" v-if="selectedLog.errorMessage">
            <pre class="error-message">{{ selectedLog.errorMessage }}</pre>
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="log-actions" style="margin-top: 16px; text-align: right;">
          <a-space>
            <a-button @click="showRelatedLogs(selectedLog)">
              查看相关日志
            </a-button>
            <a-button @click="exportSingleLog(selectedLog)">
              导出日志
            </a-button>
            <a-button @click="logDetailModalVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 相关日志模态框 -->
    <a-modal
      v-model:open="relatedLogsModalVisible"
      title="相关日志"
      width="1000px"
      :footer="null"
    >
      <div class="related-logs">
        <a-tabs v-model:activeKey="relatedLogsTab">
          <a-tab-pane key="user" tab="同用户操作">
            <a-table
              :columns="relatedLogsColumns"
              :data-source="relatedLogs.user"
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'eventType'">
                  <a-tag :color="getEventTypeColor(record.eventType)">
                    {{ getEventTypeName(record.eventType) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'result'">
                  <a-tag :color="getResultColor(record.result)">
                    {{ getResultName(record.result) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'timestamp'">
                  {{ formatDateTime(record.timestamp) }}
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="ip" tab="同IP地址">
            <a-table
              :columns="relatedLogsColumns"
              :data-source="relatedLogs.ip"
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'eventType'">
                  <a-tag :color="getEventTypeColor(record.eventType)">
                    {{ getEventTypeName(record.eventType) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'result'">
                  <a-tag :color="getResultColor(record.result)">
                    {{ getResultName(record.result) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'timestamp'">
                  {{ formatDateTime(record.timestamp) }}
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="session" tab="同会话">
            <a-table
              :columns="relatedLogsColumns"
              :data-source="relatedLogs.session"
              :pagination="{ pageSize: 10 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'eventType'">
                  <a-tag :color="getEventTypeColor(record.eventType)">
                    {{ getEventTypeName(record.eventType) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'result'">
                  <a-tag :color="getResultColor(record.result)">
                    {{ getResultName(record.result) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'timestamp'">
                  {{ formatDateTime(record.timestamp) }}
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
    
    <!-- 导出模态框 -->
    <a-modal
      v-model:open="exportModalVisible"
      title="导出审计日志"
      width="600px"
      @ok="exportLogs"
      :confirm-loading="exportLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="导出格式">
          <a-radio-group v-model:value="exportOptions.format">
            <a-radio value="csv">CSV</a-radio>
            <a-radio value="excel">Excel</a-radio>
            <a-radio value="json">JSON</a-radio>
            <a-radio value="pdf">PDF</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="导出范围">
          <a-radio-group v-model:value="exportOptions.scope">
            <a-radio value="current">当前筛选结果</a-radio>
            <a-radio value="selected">选中记录</a-radio>
            <a-radio value="all">全部记录</a-radio>
            <a-radio value="custom">自定义范围</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="exportOptions.scope === 'custom'" label="时间范围">
          <a-range-picker
            v-model:value="exportOptions.customDateRange"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD"
          />
        </a-form-item>
        
        <a-form-item label="包含字段">
          <a-checkbox-group v-model:value="exportOptions.fields">
            <a-checkbox value="id">日志ID</a-checkbox>
            <a-checkbox value="eventType">事件类型</a-checkbox>
            <a-checkbox value="userName">用户名</a-checkbox>
            <a-checkbox value="ipAddress">IP地址</a-checkbox>
            <a-checkbox value="timestamp">时间戳</a-checkbox>
            <a-checkbox value="result">结果</a-checkbox>
            <a-checkbox value="description">描述</a-checkbox>
            <a-checkbox value="requestPath">请求路径</a-checkbox>
            <a-checkbox value="userAgent">用户代理</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="exportOptions.includeDetails">
            包含详细信息（请求参数、响应数据等）
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 审计设置模态框 -->
    <a-modal
      v-model:open="auditSettingsModalVisible"
      title="审计设置"
      width="700px"
      @ok="saveAuditSettings"
    >
      <a-tabs v-model:activeKey="auditSettingsTab">
        <a-tab-pane key="general" tab="常规设置">
          <a-form layout="vertical">
            <a-form-item label="审计状态">
              <a-switch
                v-model:checked="auditSettings.enabled"
                checked-children="启用"
                un-checked-children="禁用"
              />
            </a-form-item>
            
            <a-form-item label="日志保留期">
              <a-input-number
                v-model:value="auditSettings.retentionDays"
                :min="1"
                :max="3650"
                addon-after="天"
                placeholder="日志保留天数"
              />
            </a-form-item>
            
            <a-form-item label="最大日志数量">
              <a-input-number
                v-model:value="auditSettings.maxLogCount"
                :min="1000"
                :max="10000000"
                placeholder="最大日志数量"
              />
            </a-form-item>
            
            <a-form-item label="自动清理">
              <a-switch
                v-model:checked="auditSettings.autoCleanup"
                checked-children="启用"
                un-checked-children="禁用"
              />
            </a-form-item>
            
            <a-form-item label="压缩存储">
              <a-switch
                v-model:checked="auditSettings.compression"
                checked-children="启用"
                un-checked-children="禁用"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="events" tab="事件配置">
          <a-form layout="vertical">
            <a-form-item label="登录事件">
              <a-checkbox-group v-model:value="auditSettings.events.login">
                <a-checkbox value="success">成功登录</a-checkbox>
                <a-checkbox value="failed">失败登录</a-checkbox>
                <a-checkbox value="logout">用户登出</a-checkbox>
                <a-checkbox value="timeout">会话超时</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            
            <a-form-item label="操作事件">
              <a-checkbox-group v-model:value="auditSettings.events.operation">
                <a-checkbox value="create">创建操作</a-checkbox>
                <a-checkbox value="update">更新操作</a-checkbox>
                <a-checkbox value="delete">删除操作</a-checkbox>
                <a-checkbox value="view">查看操作</a-checkbox>
                <a-checkbox value="export">导出操作</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            
            <a-form-item label="系统事件">
              <a-checkbox-group v-model:value="auditSettings.events.system">
                <a-checkbox value="startup">系统启动</a-checkbox>
                <a-checkbox value="shutdown">系统关闭</a-checkbox>
                <a-checkbox value="config">配置变更</a-checkbox>
                <a-checkbox value="backup">备份操作</a-checkbox>
                <a-checkbox value="restore">恢复操作</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            
            <a-form-item label="安全事件">
              <a-checkbox-group v-model:value="auditSettings.events.security">
                <a-checkbox value="intrusion">入侵检测</a-checkbox>
                <a-checkbox value="privilege">权限变更</a-checkbox>
                <a-checkbox value="policy">策略违规</a-checkbox>
                <a-checkbox value="encryption">加密操作</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="alerts" tab="告警配置">
          <a-form layout="vertical">
            <a-form-item label="实时告警">
              <a-switch
                v-model:checked="auditSettings.alerts.enabled"
                checked-children="启用"
                un-checked-children="禁用"
              />
            </a-form-item>
            
            <a-form-item label="告警阈值">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-input-number
                    v-model:value="auditSettings.alerts.failedLoginThreshold"
                    :min="1"
                    :max="100"
                    addon-after="次"
                    placeholder="登录失败次数"
                  />
                </a-col>
                <a-col :span="12">
                  <a-input-number
                    v-model:value="auditSettings.alerts.timeWindow"
                    :min="1"
                    :max="60"
                    addon-after="分钟"
                    placeholder="时间窗口"
                  />
                </a-col>
              </a-row>
            </a-form-item>
            
            <a-form-item label="告警方式">
              <a-checkbox-group v-model:value="auditSettings.alerts.methods">
                <a-checkbox value="email">邮件通知</a-checkbox>
                <a-checkbox value="sms">短信通知</a-checkbox>
                <a-checkbox value="webhook">Webhook</a-checkbox>
                <a-checkbox value="dashboard">仪表板提醒</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            
            <a-form-item label="告警邮箱">
              <a-input
                v-model:value="auditSettings.alerts.emailRecipients"
                placeholder="多个邮箱用逗号分隔"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    
    <!-- 批量操作抽屉 -->
    <a-drawer
      v-model:open="batchActionsDrawerVisible"
      title="批量操作"
      width="400"
      placement="right"
    >
      <div class="batch-actions">
        <div class="selected-info">
          <a-alert
            :message="`已选择 ${selectedRowKeys.length} 条记录`"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
        </div>
        
        <div class="action-buttons">
          <a-space direction="vertical" style="width: 100%">
            <a-button
              block
              @click="batchExport"
              :disabled="selectedRowKeys.length === 0"
            >
              <ExportOutlined />
              批量导出
            </a-button>
            
            <a-button
              block
              @click="batchArchive"
              :disabled="selectedRowKeys.length === 0"
            >
              <InboxOutlined />
              批量归档
            </a-button>
            
            <a-button
              block
              danger
              @click="batchDelete"
              :disabled="selectedRowKeys.length === 0"
            >
              <DeleteOutlined />
              批量删除
            </a-button>
          </a-space>
        </div>
        
        <a-divider />
        
        <div class="batch-filters">
          <h4>快速筛选</h4>
          <a-space direction="vertical" style="width: 100%">
            <a-button block size="small" @click="selectFailedLogins">
              选择失败登录
            </a-button>
            <a-button block size="small" @click="selectSecurityEvents">
              选择安全事件
            </a-button>
            <a-button block size="small" @click="selectTodayLogs">
              选择今日日志
            </a-button>
            <a-button block size="small" @click="clearSelection">
              清空选择
            </a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExportOutlined,
  LoginOutlined,
  ToolOutlined,
  KeyOutlined,
  DatabaseOutlined,
  SearchOutlined,
  ClearOutlined,
  AppstoreOutlined,
  EyeOutlined,
  LinkOutlined,
  DownloadOutlined,
  InboxOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const autoRefresh = ref(false)
const logDetailModalVisible = ref(false)
const relatedLogsModalVisible = ref(false)
const exportModalVisible = ref(false)
const auditSettingsModalVisible = ref(false)
const batchActionsDrawerVisible = ref(false)
const selectedLog = ref(null)
const selectedRowKeys = ref([])
const exportLoading = ref(false)
const relatedLogsTab = ref('user')
const auditSettingsTab = ref('general')
const autoRefreshInterval = ref(null)

// 统计数据
const auditStats = reactive({
  login: {
    total: 1247,
    success: 1198,
    failed: 49
  },
  operation: {
    total: 3456,
    today: 234
  },
  access: {
    total: 892,
    denied: 67
  },
  system: {
    total: 567,
    errors: 23
  }
})

// 用户列表
const userList = ref([
  { id: '1', name: '管理员' },
  { id: '2', name: '张三' },
  { id: '3', name: '李四' },
  { id: '4', name: '王五' },
  { id: '5', name: '赵六' }
])

// 筛选表单
const filterForm = reactive({
  dateRange: null,
  eventType: null,
  userId: null,
  result: null,
  ipAddress: ''
})

// 审计日志数据
const auditLogs = ref([
  {
    id: 'AL001',
    eventType: 'login',
    userId: '1',
    userName: '管理员',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15 14:30:25',
    duration: 1250,
    result: 'success',
    severity: 'info',
    description: '用户登录成功',
    requestPath: '/api/auth/login',
    requestMethod: 'POST',
    responseStatus: 200,
    requestParams: { username: 'admin', remember: true },
    responseData: { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', expires: 3600 },
    errorMessage: null,
    sessionId: 'sess_123456789'
  },
  {
    id: 'AL002',
    eventType: 'login',
    userId: null,
    userName: '未知用户',
    ipAddress: '203.0.113.45',
    userAgent: 'curl/7.68.0',
    timestamp: '2024-01-15 14:25:10',
    duration: 500,
    result: 'failed',
    severity: 'warning',
    description: '登录失败 - 用户名或密码错误',
    requestPath: '/api/auth/login',
    requestMethod: 'POST',
    responseStatus: 401,
    requestParams: { username: 'admin', password: '***' },
    responseData: { error: 'Invalid credentials' },
    errorMessage: 'Authentication failed',
    sessionId: null
  },
  {
    id: 'AL003',
    eventType: 'operation',
    userId: '2',
    userName: '张三',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15 14:20:15',
    duration: 2100,
    result: 'success',
    severity: 'info',
    description: '创建新项目',
    requestPath: '/api/projects',
    requestMethod: 'POST',
    responseStatus: 201,
    requestParams: { name: '新项目', description: '项目描述' },
    responseData: { id: 'proj_001', name: '新项目', created: '2024-01-15T14:20:15Z' },
    errorMessage: null,
    sessionId: 'sess_987654321'
  },
  {
    id: 'AL004',
    eventType: 'access',
    userId: '3',
    userName: '李四',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15 14:15:30',
    duration: 150,
    result: 'denied',
    severity: 'warning',
    description: '访问被拒绝 - 权限不足',
    requestPath: '/api/admin/users',
    requestMethod: 'GET',
    responseStatus: 403,
    requestParams: {},
    responseData: { error: 'Access denied' },
    errorMessage: 'Insufficient permissions',
    sessionId: 'sess_456789123'
  },
  {
    id: 'AL005',
    eventType: 'system',
    userId: null,
    userName: '系统',
    ipAddress: 'localhost',
    userAgent: 'System',
    timestamp: '2024-01-15 14:10:00',
    duration: 5000,
    result: 'success',
    severity: 'info',
    description: '系统备份完成',
    requestPath: '/system/backup',
    requestMethod: 'POST',
    responseStatus: 200,
    requestParams: { type: 'full', compression: true },
    responseData: { backupId: 'backup_20240115_141000', size: '2.5GB' },
    errorMessage: null,
    sessionId: null
  },
  {
    id: 'AL006',
    eventType: 'security',
    userId: null,
    userName: '安全系统',
    ipAddress: '203.0.113.67',
    userAgent: 'Unknown',
    timestamp: '2024-01-15 14:05:45',
    duration: 100,
    result: 'failed',
    severity: 'critical',
    description: '检测到SQL注入攻击尝试',
    requestPath: '/api/search',
    requestMethod: 'GET',
    responseStatus: 400,
    requestParams: { q: "'; DROP TABLE users; --" },
    responseData: { error: 'Invalid request' },
    errorMessage: 'SQL injection attempt detected',
    sessionId: null
  }
])

// 相关日志数据
const relatedLogs = reactive({
  user: [],
  ip: [],
  session: []
})

// 导出选项
const exportOptions = reactive({
  format: 'csv',
  scope: 'current',
  customDateRange: null,
  fields: ['id', 'eventType', 'userName', 'ipAddress', 'timestamp', 'result', 'description'],
  includeDetails: false
})

// 审计设置
const auditSettings = reactive({
  enabled: true,
  retentionDays: 365,
  maxLogCount: 1000000,
  autoCleanup: true,
  compression: true,
  events: {
    login: ['success', 'failed', 'logout'],
    operation: ['create', 'update', 'delete'],
    system: ['startup', 'shutdown', 'config', 'backup'],
    security: ['intrusion', 'privilege', 'policy']
  },
  alerts: {
    enabled: true,
    failedLoginThreshold: 5,
    timeWindow: 10,
    methods: ['email', 'dashboard'],
    emailRecipients: 'admin@example.com'
  }
})

// 表格列定义
const auditColumns = [
  {
    title: '日志ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    fixed: 'left'
  },
  {
    title: '事件类型',
    key: 'eventType',
    width: 100
  },
  {
    title: '用户',
    dataIndex: 'userName',
    key: 'userName',
    width: 100
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    key: 'ipAddress',
    width: 120
  },
  {
    title: '时间',
    key: 'timestamp',
    width: 150
  },
  {
    title: '持续时间',
    key: 'duration',
    width: 100
  },
  {
    title: '结果',
    key: 'result',
    width: 80
  },
  {
    title: '严重程度',
    key: 'severity',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 相关日志表格列
const relatedLogsColumns = [
  {
    title: '日志ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '事件类型',
    key: 'eventType',
    width: 100
  },
  {
    title: '时间',
    key: 'timestamp',
    width: 150
  },
  {
    title: '结果',
    key: 'result',
    width: 80
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  }
]

// 计算属性
const filteredLogs = computed(() => {
  let result = auditLogs.value
  
  // 时间范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    result = result.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }
  
  // 事件类型筛选
  if (filterForm.eventType) {
    result = result.filter(log => log.eventType === filterForm.eventType)
  }
  
  // 用户筛选
  if (filterForm.userId) {
    result = result.filter(log => log.userId === filterForm.userId)
  }
  
  // 结果筛选
  if (filterForm.result) {
    result = result.filter(log => log.result === filterForm.result)
  }
  
  // IP地址筛选
  if (filterForm.ipAddress) {
    result = result.filter(log => 
      log.ipAddress.toLowerCase().includes(filterForm.ipAddress.toLowerCase())
    )
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
    auditStats.login.total += Math.floor(Math.random() * 5)
    auditStats.operation.today += Math.floor(Math.random() * 10)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示导出模态框
 */
const showExportModal = () => {
  exportModalVisible.value = true
}

/**
 * 显示审计设置模态框
 */
const showAuditSettingsModal = () => {
  auditSettingsModalVisible.value = true
}

/**
 * 处理日期范围变化
 */
const handleDateRangeChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 处理事件类型变化
 */
const handleEventTypeChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 处理用户变化
 */
const handleUserChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 处理结果变化
 */
const handleResultChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 处理IP地址变化
 */
const handleIpAddressChange = () => {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 应用筛选
 */
const applyFilters = () => {
  message.success('筛选条件已应用')
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  Object.assign(filterForm, {
    dateRange: null,
    eventType: null,
    userId: null,
    result: null,
    ipAddress: ''
  })
  message.success('筛选条件已重置')
}

/**
 * 用户选项过滤
 */
const filterUserOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 切换自动刷新
 */
const toggleAutoRefresh = (checked: boolean) => {
  if (checked) {
    autoRefreshInterval.value = setInterval(() => {
      refreshData()
    }, 30000) // 30秒刷新一次
    message.success('已启用自动刷新')
  } else {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value)
      autoRefreshInterval.value = null
    }
    message.success('已禁用自动刷新')
  }
}

/**
 * 显示批量操作抽屉
 */
const showBatchActionsDrawer = () => {
  batchActionsDrawerVisible.value = true
}

/**
 * 处理行选择变化
 */
const handleRowSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

/**
 * 显示日志详情
 */
const showLogDetail = (log: any) => {
  selectedLog.value = log
  logDetailModalVisible.value = true
}

/**
 * 显示相关日志
 */
const showRelatedLogs = (log: any) => {
  // 模拟获取相关日志
  relatedLogs.user = auditLogs.value.filter(l => 
    l.userId === log.userId && l.id !== log.id
  ).slice(0, 10)
  
  relatedLogs.ip = auditLogs.value.filter(l => 
    l.ipAddress === log.ipAddress && l.id !== log.id
  ).slice(0, 10)
  
  relatedLogs.session = auditLogs.value.filter(l => 
    l.sessionId === log.sessionId && l.id !== log.id
  ).slice(0, 10)
  
  relatedLogsModalVisible.value = true
}

/**
 * 导出单个日志
 */
const exportSingleLog = (log: any) => {
  message.success(`正在导出日志 ${log.id}`)
}

/**
 * 导出日志
 */
const exportLogs = () => {
  exportLoading.value = true
  
  setTimeout(() => {
    exportLoading.value = false
    exportModalVisible.value = false
    message.success('日志导出成功')
  }, 2000)
}

/**
 * 保存审计设置
 */
const saveAuditSettings = () => {
  auditSettingsModalVisible.value = false
  message.success('审计设置已保存')
}

/**
 * 批量导出
 */
const batchExport = () => {
  message.success(`正在导出 ${selectedRowKeys.value.length} 条记录`)
  batchActionsDrawerVisible.value = false
}

/**
 * 批量归档
 */
const batchArchive = () => {
  message.success(`已归档 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

/**
 * 批量删除
 */
const batchDelete = () => {
  message.success(`已删除 ${selectedRowKeys.value.length} 条记录`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

/**
 * 选择失败登录
 */
const selectFailedLogins = () => {
  const failedLoginIds = filteredLogs.value
    .filter(log => log.eventType === 'login' && log.result === 'failed')
    .map(log => log.id)
  selectedRowKeys.value = failedLoginIds
  message.success(`已选择 ${failedLoginIds.length} 条失败登录记录`)
}

/**
 * 选择安全事件
 */
const selectSecurityEvents = () => {
  const securityEventIds = filteredLogs.value
    .filter(log => log.eventType === 'security')
    .map(log => log.id)
  selectedRowKeys.value = securityEventIds
  message.success(`已选择 ${securityEventIds.length} 条安全事件记录`)
}

/**
 * 选择今日日志
 */
const selectTodayLogs = () => {
  const today = new Date().toDateString()
  const todayLogIds = filteredLogs.value
    .filter(log => new Date(log.timestamp).toDateString() === today)
    .map(log => log.id)
  selectedRowKeys.value = todayLogIds
  message.success(`已选择 ${todayLogIds.length} 条今日日志记录`)
}

/**
 * 清空选择
 */
const clearSelection = () => {
  selectedRowKeys.value = []
  message.success('已清空选择')
}

/**
 * 获取事件类型颜色
 */
const getEventTypeColor = (type: string) => {
  const colors = {
    login: 'blue',
    operation: 'green',
    access: 'orange',
    system: 'purple',
    security: 'red'
  }
  return colors[type] || 'default'
}

/**
 * 获取事件类型名称
 */
const getEventTypeName = (type: string) => {
  const names = {
    login: '登录事件',
    operation: '操作事件',
    access: '访问控制',
    system: '系统事件',
    security: '安全事件'
  }
  return names[type] || type
}

/**
 * 获取结果颜色
 */
const getResultColor = (result: string) => {
  const colors = {
    success: 'green',
    failed: 'red',
    denied: 'orange'
  }
  return colors[result] || 'default'
}

/**
 * 获取结果名称
 */
const getResultName = (result: string) => {
  const names = {
    success: '成功',
    failed: '失败',
    denied: '拒绝'
  }
  return names[result] || result
}

/**
 * 获取严重程度颜色
 */
const getSeverityColor = (severity: string) => {
  const colors = {
    critical: 'red',
    warning: 'orange',
    info: 'blue',
    debug: 'gray'
  }
  return colors[severity] || 'default'
}

/**
 * 获取严重程度名称
 */
const getSeverityName = (severity: string) => {
  const names = {
    critical: '严重',
    warning: '警告',
    info: '信息',
    debug: '调试'
  }
  return names[severity] || severity
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

/**
 * 格式化持续时间
 */
const formatDuration = (duration: number) => {
  if (duration < 1000) {
    return `${duration}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    return `${(duration / 60000).toFixed(1)}m`
  }
}

/**
 * 格式化JSON
 */
const formatJson = (data: any) => {
  if (!data) return ''
  return JSON.stringify(data, null, 2)
}

// 生命周期
onMounted(() => {
  console.log('系统审计页面已加载')
})

onUnmounted(() => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
})
</script>

<style scoped>
.system-audit {
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

.audit-stats {
  margin-bottom: 24px;
}

.stat-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  flex-shrink: 0;
}

.login-icon,
.operation-icon,
.access-icon,
.system-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.login-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.operation-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.access-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.system-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 8px;
}

.success-count {
  color: #52c41a;
}

.failed-count {
  color: #ff4d4f;
}

.filter-card,
.audit-logs-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-detail .ant-descriptions {
  margin-bottom: 16px;
}

.log-data,
.error-message {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-message {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.related-logs .ant-tabs-content {
  max-height: 400px;
  overflow-y: auto;
}

.batch-actions {
  padding: 16px 0;
}

.selected-info {
  margin-bottom: 16px;
}

.action-buttons .ant-btn {
  margin-bottom: 8px;
}

.batch-filters h4 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.batch-filters .ant-btn {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions {
    width: 100%;
  }
  
  .right-actions .ant-space {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .filter-card .ant-form {
    flex-direction: column;
  }
  
  .filter-card .ant-form-item {
    margin-bottom: 16px;
    width: 100%;
  }
  
  .audit-logs-card .ant-table {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .system-audit {
    padding: 0 8px;
  }
  
  .header-actions {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .audit-logs-card .ant-card-title {
    font-size: 14px;
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

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

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

.audit-stats .ant-col {
  animation: fadeIn 0.6s ease-out;
}

.audit-stats .ant-col:nth-child(1) {
  animation-delay: 0.1s;
}

.audit-stats .ant-col:nth-child(2) {
  animation-delay: 0.2s;
}

.audit-stats .ant-col:nth-child(3) {
  animation-delay: 0.3s;
}

.audit-stats .ant-col:nth-child(4) {
  animation-delay: 0.4s;
}

.filter-card,
.audit-logs-card {
  animation: slideInRight 0.5s ease-out;
}

.stat-card:hover .stat-icon > div {
  animation: pulse 0.6s ease-in-out;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .header-actions,
  .filter-card,
  .audit-logs-card {
    background: #1f1f1f;
    border-color: #303030;
  }
  
  .left-actions h2 {
    color: #fff;
  }
  
  .stat-title {
    color: #bfbfbf;
  }
  
  .stat-value {
    color: #fff;
  }
  
  .stat-detail {
    color: #8c8c8c;
  }
  
  .log-data {
    background: #262626;
    color: #fff;
  }
  
  .error-message {
    background: #2a1215;
    color: #ff7875;
    border-color: #434343;
  }
}

/* 打印样式 */
@media print {
  .header-actions .right-actions,
  .filter-card,
  .audit-logs-card .ant-card-extra,
  .audit-logs-card .ant-table-pagination {
    display: none !important;
  }
  
  .system-audit {
    padding: 0;
  }
  
  .audit-stats {
    page-break-inside: avoid;
  }
  
  .audit-logs-card {
    box-shadow: none;
    border: 1px solid #d9d9d9;
  }
  
  .stat-card {
    box-shadow: none;
    border: 1px solid #d9d9d9;
  }
}
</style>