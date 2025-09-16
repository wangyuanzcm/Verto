<template>
  <div class="system-notifications">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统通知</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统通知</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="showCreateNotificationModal">
            <PlusOutlined />
            创建通知
          </a-button>
          <a-button type="primary" @click="showNotificationSettingsModal">
            <SettingOutlined />
            通知设置
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="notification-stats">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card total-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="total-icon">
                  <BellOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">总通知数</div>
                <div class="stat-value">{{ notificationStats.total }}</div>
                <div class="stat-detail">
                  <span>今日: {{ notificationStats.today }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card unread-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="unread-icon">
                  <MailOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">未读通知</div>
                <div class="stat-value">{{ notificationStats.unread }}</div>
                <div class="stat-detail">
                  <span>占比: {{ ((notificationStats.unread / notificationStats.total) * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card urgent-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="urgent-icon">
                  <ExclamationCircleOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">紧急通知</div>
                <div class="stat-value">{{ notificationStats.urgent }}</div>
                <div class="stat-detail">
                  <span>待处理: {{ notificationStats.urgentPending }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card sent-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="sent-icon">
                  <SendOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">已发送</div>
                <div class="stat-value">{{ notificationStats.sent }}</div>
                <div class="stat-detail">
                  <span>成功率: {{ ((notificationStats.sent / notificationStats.total) * 100).toFixed(1) }}%</span>
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
        <a-form-item label="通知类型">
          <a-select
            v-model:value="filterForm.type"
            placeholder="请选择通知类型"
            style="width: 150px"
            allowClear
            @change="handleTypeChange"
          >
            <a-select-option value="system">系统通知</a-select-option>
            <a-select-option value="security">安全通知</a-select-option>
            <a-select-option value="maintenance">维护通知</a-select-option>
            <a-select-option value="update">更新通知</a-select-option>
            <a-select-option value="announcement">公告通知</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="优先级">
          <a-select
            v-model:value="filterForm.priority"
            placeholder="请选择优先级"
            style="width: 120px"
            allowClear
            @change="handlePriorityChange"
          >
            <a-select-option value="urgent">紧急</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="状态">
          <a-select
            v-model:value="filterForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allowClear
            @change="handleStatusChange"
          >
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="scheduled">已安排</a-select-option>
            <a-select-option value="sent">已发送</a-select-option>
            <a-select-option value="failed">发送失败</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="发送时间">
          <a-range-picker
            v-model:value="filterForm.dateRange"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </a-form-item>
        
        <a-form-item label="关键词">
          <a-input
            v-model:value="filterForm.keyword"
            placeholder="搜索标题或内容"
            style="width: 200px"
            @change="handleKeywordChange"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
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
    
    <!-- 通知列表 -->
    <a-card class="notifications-card">
      <template #title>
        <span>通知列表</span>
        <a-tag color="blue" style="margin-left: 8px">
          共 {{ filteredNotifications.length }} 条通知
        </a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-tooltip title="标记全部已读">
            <a-button size="small" @click="markAllAsRead">
              <CheckOutlined />
              全部已读
            </a-button>
          </a-tooltip>
          <a-button size="small" @click="showBatchActionsDrawer">
            <AppstoreOutlined />
            批量操作
          </a-button>
        </a-space>
      </template>
      
      <a-table
        :columns="notificationColumns"
        :data-source="filteredNotifications"
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
          <template v-if="column.key === 'title'">
            <div class="notification-title">
              <a @click="showNotificationDetail(record)" class="title-link">
                {{ record.title }}
              </a>
              <a-badge v-if="!record.isRead" status="processing" />
            </div>
          </template>
          
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              <component :is="getTypeIcon(record.type)" style="margin-right: 4px;" />
              {{ getTypeName(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityName(record.priority) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusName(record.status) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'recipients'">
            <a-tooltip :title="record.recipients.join(', ')">
              <a-tag>{{ record.recipients.length }} 人</a-tag>
            </a-tooltip>
          </template>
          
          <template v-else-if="column.key === 'sendTime'">
            {{ formatDateTime(record.sendTime) }}
          </template>
          
          <template v-else-if="column.key === 'readCount'">
            <div class="read-progress">
              <a-progress
                :percent="(record.readCount / record.recipients.length) * 100"
                size="small"
                :show-info="false"
              />
              <span class="read-text">
                {{ record.readCount }}/{{ record.recipients.length }}
              </span>
            </div>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space size="small">
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="showNotificationDetail(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <a-button 
                  type="text" 
                  size="small" 
                  @click="editNotification(record)"
                  :disabled="record.status === 'sent'"
                >
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="复制">
                <a-button type="text" size="small" @click="duplicateNotification(record)">
                  <CopyOutlined />
                </a-button>
              </a-tooltip>
              
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleMenuAction(key, record)">
                    <a-menu-item key="resend" v-if="record.status === 'failed'">
                      <SendOutlined />
                      重新发送
                    </a-menu-item>
                    <a-menu-item key="schedule" v-if="record.status === 'draft'">
                      <ClockCircleOutlined />
                      安排发送
                    </a-menu-item>
                    <a-menu-item key="cancel" v-if="record.status === 'scheduled'">
                      <StopOutlined />
                      取消发送
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="text" size="small">
                  <MoreOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <!-- 通知详情模态框 -->
    <a-modal
      v-model:open="notificationDetailModalVisible"
      title="通知详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="通知ID">
            {{ selectedNotification.id }}
          </a-descriptions-item>
          <a-descriptions-item label="通知类型">
            <a-tag :color="getTypeColor(selectedNotification.type)">
              <component :is="getTypeIcon(selectedNotification.type)" style="margin-right: 4px;" />
              {{ getTypeName(selectedNotification.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(selectedNotification.priority)">
              {{ getPriorityName(selectedNotification.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedNotification.status)">
              {{ getStatusName(selectedNotification.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="标题" :span="2">
            {{ selectedNotification.title }}
          </a-descriptions-item>
          <a-descriptions-item label="内容" :span="2">
            <div class="notification-content" v-html="selectedNotification.content"></div>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedNotification.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="发送时间">
            {{ formatDateTime(selectedNotification.sendTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建者">
            {{ selectedNotification.creator }}
          </a-descriptions-item>
          <a-descriptions-item label="接收人数">
            {{ selectedNotification.recipients.length }} 人
          </a-descriptions-item>
          <a-descriptions-item label="已读人数">
            {{ selectedNotification.readCount }} 人
          </a-descriptions-item>
          <a-descriptions-item label="阅读率">
            {{ ((selectedNotification.readCount / selectedNotification.recipients.length) * 100).toFixed(1) }}%
          </a-descriptions-item>
        </a-descriptions>
        
        <div class="recipients-section" style="margin-top: 24px;">
          <h4>接收人列表</h4>
          <a-table
            :columns="recipientColumns"
            :data-source="selectedNotification.recipientDetails"
            :pagination="{ pageSize: 10 }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.isRead ? 'green' : 'orange'">
                  {{ record.isRead ? '已读' : '未读' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'readTime'">
                {{ record.readTime ? formatDateTime(record.readTime) : '-' }}
              </template>
            </template>
          </a-table>
        </div>
        
        <div class="notification-actions" style="margin-top: 16px; text-align: right;">
          <a-space>
            <a-button @click="editNotification(selectedNotification)" v-if="selectedNotification.status !== 'sent'">
              编辑通知
            </a-button>
            <a-button @click="duplicateNotification(selectedNotification)">
              复制通知
            </a-button>
            <a-button @click="notificationDetailModalVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 创建/编辑通知模态框 -->
    <a-modal
      v-model:open="createNotificationModalVisible"
      :title="isEditMode ? '编辑通知' : '创建通知'"
      width="900px"
      @ok="saveNotification"
      :confirm-loading="saveLoading"
    >
      <a-form
        ref="notificationFormRef"
        :model="notificationForm"
        :rules="notificationRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="通知类型" name="type">
              <a-select v-model:value="notificationForm.type" placeholder="请选择通知类型">
                <a-select-option value="system">
                  <BellOutlined style="margin-right: 4px;" />
                  系统通知
                </a-select-option>
                <a-select-option value="security">
                  <ShieldOutlined style="margin-right: 4px;" />
                  安全通知
                </a-select-option>
                <a-select-option value="maintenance">
                  <ToolOutlined style="margin-right: 4px;" />
                  维护通知
                </a-select-option>
                <a-select-option value="update">
                  <UploadOutlined style="margin-right: 4px;" />
                  更新通知
                </a-select-option>
                <a-select-option value="announcement">
                  <SoundOutlined style="margin-right: 4px;" />
                  公告通知
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-select v-model:value="notificationForm.priority" placeholder="请选择优先级">
                <a-select-option value="urgent">紧急</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="low">低</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="通知标题" name="title">
          <a-input v-model:value="notificationForm.title" placeholder="请输入通知标题" />
        </a-form-item>
        
        <a-form-item label="通知内容" name="content">
          <a-textarea
            v-model:value="notificationForm.content"
            placeholder="请输入通知内容"
            :rows="6"
            show-count
            :maxlength="1000"
          />
        </a-form-item>
        
        <a-form-item label="接收人">
          <a-tabs v-model:activeKey="recipientTab">
            <a-tab-pane key="users" tab="指定用户">
              <a-select
                v-model:value="notificationForm.selectedUsers"
                mode="multiple"
                placeholder="请选择接收用户"
                style="width: 100%"
                show-search
                :filter-option="filterUserOption"
              >
                <a-select-option
                  v-for="user in userList"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.email }})
                </a-select-option>
              </a-select>
            </a-tab-pane>
            
            <a-tab-pane key="roles" tab="按角色">
              <a-checkbox-group v-model:value="notificationForm.selectedRoles">
                <a-row>
                  <a-col :span="8" v-for="role in roleList" :key="role.id">
                    <a-checkbox :value="role.id">{{ role.name }}</a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-tab-pane>
            
            <a-tab-pane key="all" tab="全部用户">
              <a-checkbox v-model:checked="notificationForm.sendToAll">
                发送给所有用户
              </a-checkbox>
            </a-tab-pane>
          </a-tabs>
        </a-form-item>
        
        <a-form-item label="发送设置">
          <a-radio-group v-model:value="notificationForm.sendType">
            <a-radio value="immediate">立即发送</a-radio>
            <a-radio value="scheduled">定时发送</a-radio>
            <a-radio value="draft">保存为草稿</a-radio>
          </a-radio-group>
          
          <a-date-picker
            v-if="notificationForm.sendType === 'scheduled'"
            v-model:value="notificationForm.scheduledTime"
            show-time
            placeholder="选择发送时间"
            style="margin-top: 8px; width: 100%;"
          />
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="notificationForm.requireConfirmation">
            需要接收人确认阅读
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="notificationForm.sendEmail">
            同时发送邮件通知
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 通知设置模态框 -->
    <a-modal
      v-model:open="notificationSettingsModalVisible"
      title="通知设置"
      width="700px"
      @ok="saveNotificationSettings"
    >
      <a-tabs v-model:activeKey="settingsTab">
        <a-tab-pane key="general" tab="常规设置">
          <a-form layout="vertical">
            <a-form-item label="通知保留期">
              <a-input-number
                v-model:value="notificationSettings.retentionDays"
                :min="1"
                :max="365"
                addon-after="天"
                placeholder="通知保留天数"
              />
            </a-form-item>
            
            <a-form-item label="自动标记已读">
              <a-switch
                v-model:checked="notificationSettings.autoMarkRead"
                checked-children="启用"
                un-checked-children="禁用"
              />
              <div class="setting-description">
                用户查看通知详情后自动标记为已读
              </div>
            </a-form-item>
            
            <a-form-item label="批量发送限制">
              <a-input-number
                v-model:value="notificationSettings.batchSendLimit"
                :min="1"
                :max="10000"
                addon-after="人"
                placeholder="单次发送人数限制"
              />
            </a-form-item>
            
            <a-form-item label="发送频率限制">
              <a-input-number
                v-model:value="notificationSettings.sendRateLimit"
                :min="1"
                :max="100"
                addon-after="条/分钟"
                placeholder="发送频率限制"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="email" tab="邮件设置">
          <a-form layout="vertical">
            <a-form-item label="启用邮件通知">
              <a-switch
                v-model:checked="notificationSettings.email.enabled"
                checked-children="启用"
                un-checked-children="禁用"
              />
            </a-form-item>
            
            <a-form-item label="SMTP服务器">
              <a-input
                v-model:value="notificationSettings.email.smtpHost"
                placeholder="SMTP服务器地址"
              />
            </a-form-item>
            
            <a-form-item label="SMTP端口">
              <a-input-number
                v-model:value="notificationSettings.email.smtpPort"
                :min="1"
                :max="65535"
                placeholder="SMTP端口"
              />
            </a-form-item>
            
            <a-form-item label="发送邮箱">
              <a-input
                v-model:value="notificationSettings.email.fromEmail"
                placeholder="发送邮箱地址"
              />
            </a-form-item>
            
            <a-form-item label="邮箱密码">
              <a-input-password
                v-model:value="notificationSettings.email.password"
                placeholder="邮箱密码或授权码"
              />
            </a-form-item>
            
            <a-form-item>
              <a-button @click="testEmailSettings">
                测试邮件设置
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="templates" tab="模板设置">
          <a-form layout="vertical">
            <a-form-item label="邮件模板">
              <a-textarea
                v-model:value="notificationSettings.templates.email"
                placeholder="邮件模板内容"
                :rows="6"
              />
              <div class="template-variables">
                <span>可用变量：</span>
                <a-tag>{{title}}</a-tag>
                <a-tag>{{content}}</a-tag>
                <a-tag>{{sender}}</a-tag>
                <a-tag>{{date}}</a-tag>
              </div>
            </a-form-item>
            
            <a-form-item label="系统通知模板">
              <a-textarea
                v-model:value="notificationSettings.templates.system"
                placeholder="系统通知模板"
                :rows="4"
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
            :message="`已选择 ${selectedRowKeys.length} 条通知`"
            type="info"
            show-icon
            style="margin-bottom: 16px"
          />
        </div>
        
        <div class="action-buttons">
          <a-space direction="vertical" style="width: 100%">
            <a-button
              block
              @click="batchMarkAsRead"
              :disabled="selectedRowKeys.length === 0"
            >
              <CheckOutlined />
              批量标记已读
            </a-button>
            
            <a-button
              block
              @click="batchSend"
              :disabled="selectedRowKeys.length === 0"
            >
              <SendOutlined />
              批量发送
            </a-button>
            
            <a-button
              block
              @click="batchSchedule"
              :disabled="selectedRowKeys.length === 0"
            >
              <ClockCircleOutlined />
              批量安排
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
            <a-button block size="small" @click="selectUnreadNotifications">
              选择未读通知
            </a-button>
            <a-button block size="small" @click="selectUrgentNotifications">
              选择紧急通知
            </a-button>
            <a-button block size="small" @click="selectDraftNotifications">
              选择草稿通知
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  BellOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  MoreOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ShieldOutlined,
  ToolOutlined,
  UploadOutlined,
  SoundOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const notificationDetailModalVisible = ref(false)
const createNotificationModalVisible = ref(false)
const notificationSettingsModalVisible = ref(false)
const batchActionsDrawerVisible = ref(false)
const selectedNotification = ref(null)
const selectedRowKeys = ref([])
const saveLoading = ref(false)
const isEditMode = ref(false)
const recipientTab = ref('users')
const settingsTab = ref('general')
const notificationFormRef = ref()

// 统计数据
const notificationStats = reactive({
  total: 1247,
  today: 23,
  unread: 156,
  urgent: 8,
  urgentPending: 3,
  sent: 1089
})

// 用户列表
const userList = ref([
  { id: '1', name: '管理员', email: 'admin@example.com' },
  { id: '2', name: '张三', email: 'zhangsan@example.com' },
  { id: '3', name: '李四', email: 'lisi@example.com' },
  { id: '4', name: '王五', email: 'wangwu@example.com' },
  { id: '5', name: '赵六', email: 'zhaoliu@example.com' }
])

// 角色列表
const roleList = ref([
  { id: '1', name: '管理员' },
  { id: '2', name: '开发者' },
  { id: '3', name: '测试员' },
  { id: '4', name: '普通用户' }
])

// 筛选表单
const filterForm = reactive({
  type: null,
  priority: null,
  status: null,
  dateRange: null,
  keyword: ''
})

// 通知表单
const notificationForm = reactive({
  id: null,
  type: 'system',
  priority: 'medium',
  title: '',
  content: '',
  selectedUsers: [],
  selectedRoles: [],
  sendToAll: false,
  sendType: 'immediate',
  scheduledTime: null,
  requireConfirmation: false,
  sendEmail: false
})

// 表单验证规则
const notificationRules = {
  type: [{ required: true, message: '请选择通知类型' }],
  priority: [{ required: true, message: '请选择优先级' }],
  title: [{ required: true, message: '请输入通知标题' }],
  content: [{ required: true, message: '请输入通知内容' }]
}

// 通知设置
const notificationSettings = reactive({
  retentionDays: 30,
  autoMarkRead: true,
  batchSendLimit: 1000,
  sendRateLimit: 60,
  email: {
    enabled: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    fromEmail: 'noreply@example.com',
    password: ''
  },
  templates: {
    email: '您有新的通知：{{title}}\n\n{{content}}\n\n发送者：{{sender}}\n时间：{{date}}',
    system: '{{title}}\n{{content}}'
  }
})

// 通知数据
const notifications = ref([
  {
    id: 'N001',
    type: 'system',
    priority: 'high',
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用，请提前保存工作内容。',
    status: 'sent',
    creator: '系统管理员',
    createTime: '2024-01-15 10:00:00',
    sendTime: '2024-01-15 10:30:00',
    recipients: ['1', '2', '3', '4', '5'],
    readCount: 3,
    isRead: false,
    recipientDetails: [
      { userId: '1', userName: '管理员', isRead: true, readTime: '2024-01-15 10:35:00' },
      { userId: '2', userName: '张三', isRead: true, readTime: '2024-01-15 11:20:00' },
      { userId: '3', userName: '李四', isRead: true, readTime: '2024-01-15 12:15:00' },
      { userId: '4', userName: '王五', isRead: false, readTime: null },
      { userId: '5', userName: '赵六', isRead: false, readTime: null }
    ]
  },
  {
    id: 'N002',
    type: 'security',
    priority: 'urgent',
    title: '安全警告：检测到异常登录',
    content: '检测到您的账户在异地登录，如非本人操作，请立即修改密码并联系管理员。',
    status: 'sent',
    creator: '安全系统',
    createTime: '2024-01-15 14:20:00',
    sendTime: '2024-01-15 14:21:00',
    recipients: ['2'],
    readCount: 0,
    isRead: false,
    recipientDetails: [
      { userId: '2', userName: '张三', isRead: false, readTime: null }
    ]
  },
  {
    id: 'N003',
    type: 'update',
    priority: 'medium',
    title: '版本更新通知',
    content: '系统已更新至v2.1.0版本，新增了多项功能和性能优化，请查看更新日志了解详情。',
    status: 'draft',
    creator: '产品经理',
    createTime: '2024-01-15 16:00:00',
    sendTime: null,
    recipients: ['1', '2', '3', '4', '5'],
    readCount: 0,
    isRead: false,
    recipientDetails: []
  },
  {
    id: 'N004',
    type: 'announcement',
    priority: 'low',
    title: '春节放假通知',
    content: '根据国家法定节假日安排，春节期间系统正常运行，技术支持时间调整为9:00-18:00。',
    status: 'scheduled',
    creator: '人事部',
    createTime: '2024-01-10 09:00:00',
    sendTime: '2024-02-01 09:00:00',
    recipients: ['1', '2', '3', '4', '5'],
    readCount: 0,
    isRead: false,
    recipientDetails: []
  },
  {
    id: 'N005',
    type: 'maintenance',
    priority: 'high',
    title: '数据库维护完成',
    content: '数据库维护工作已于凌晨3:00顺利完成，系统性能得到显著提升，感谢您的耐心等待。',
    status: 'sent',
    creator: '运维团队',
    createTime: '2024-01-14 03:30:00',
    sendTime: '2024-01-14 08:00:00',
    recipients: ['1', '2', '3', '4', '5'],
    readCount: 5,
    isRead: true,
    recipientDetails: [
      { userId: '1', userName: '管理员', isRead: true, readTime: '2024-01-14 08:05:00' },
      { userId: '2', userName: '张三', isRead: true, readTime: '2024-01-14 08:30:00' },
      { userId: '3', userName: '李四', isRead: true, readTime: '2024-01-14 09:15:00' },
      { userId: '4', userName: '王五', isRead: true, readTime: '2024-01-14 10:20:00' },
      { userId: '5', userName: '赵六', isRead: true, readTime: '2024-01-14 11:45:00' }
    ]
  }
])

// 表格列定义
const notificationColumns = [
  {
    title: '标题',
    key: 'title',
    width: 200,
    fixed: 'left'
  },
  {
    title: '类型',
    key: 'type',
    width: 120
  },
  {
    title: '优先级',
    key: 'priority',
    width: 80
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '接收人',
    key: 'recipients',
    width: 80
  },
  {
    title: '发送时间',
    key: 'sendTime',
    width: 150
  },
  {
    title: '阅读进度',
    key: 'readCount',
    width: 120
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    key: 'creator',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 接收人表格列
const recipientColumns = [
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName'
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '阅读时间',
    key: 'readTime'
  }
]

// 计算属性
const filteredNotifications = computed(() => {
  let result = notifications.value
  
  // 类型筛选
  if (filterForm.type) {
    result = result.filter(notification => notification.type === filterForm.type)
  }
  
  // 优先级筛选
  if (filterForm.priority) {
    result = result.filter(notification => notification.priority === filterForm.priority)
  }
  
  // 状态筛选
  if (filterForm.status) {
    result = result.filter(notification => notification.status === filterForm.status)
  }
  
  // 时间范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    result = result.filter(notification => {
      const sendTime = new Date(notification.sendTime || notification.createTime)
      return sendTime >= startDate && sendTime <= endDate
    })
  }
  
  // 关键词筛选
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(keyword) ||
      notification.content.toLowerCase().includes(keyword)
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
    notificationStats.total += Math.floor(Math.random() * 5)
    notificationStats.today += Math.floor(Math.random() * 3)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示创建通知模态框
 */
const showCreateNotificationModal = () => {
  isEditMode.value = false
  resetNotificationForm()
  createNotificationModalVisible.value = true
}

/**
 * 显示通知设置模态框
 */
const showNotificationSettingsModal = () => {
  notificationSettingsModalVisible.value = true
}

/**
 * 重置通知表单
 */
const resetNotificationForm = () => {
  Object.assign(notificationForm, {
    id: null,
    type: 'system',
    priority: 'medium',
    title: '',
    content: '',
    selectedUsers: [],
    selectedRoles: [],
    sendToAll: false,
    sendType: 'immediate',
    scheduledTime: null,
    requireConfirmation: false,
    sendEmail: false
  })
}

/**
 * 处理筛选变化
 */
const handleTypeChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handlePriorityChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleStatusChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleDateRangeChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleKeywordChange = () => {
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
    type: null,
    priority: null,
    status: null,
    dateRange: null,
    keyword: ''
  })
  message.success('筛选条件已重置')
}

/**
 * 标记全部已读
 */
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    if (!notification.isRead) {
      notification.isRead = true
      notification.readCount = notification.recipients.length
    }
  })
  message.success('已标记全部通知为已读')
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
 * 显示通知详情
 */
const showNotificationDetail = (notification: any) => {
  selectedNotification.value = notification
  notificationDetailModalVisible.value = true
  
  // 标记为已读
  if (!notification.isRead) {
    notification.isRead = true
  }
}

/**
 * 编辑通知
 */
const editNotification = (notification: any) => {
  isEditMode.value = true
  Object.assign(notificationForm, {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    content: notification.content,
    selectedUsers: notification.recipients,
    selectedRoles: [],
    sendToAll: false,
    sendType: notification.status === 'scheduled' ? 'scheduled' : 'immediate',
    scheduledTime: notification.sendTime ? new Date(notification.sendTime) : null,
    requireConfirmation: false,
    sendEmail: false
  })
  createNotificationModalVisible.value = true
  notificationDetailModalVisible.value = false
}

/**
 * 复制通知
 */
const duplicateNotification = (notification: any) => {
  isEditMode.value = false
  Object.assign(notificationForm, {
    id: null,
    type: notification.type,
    priority: notification.priority,
    title: `${notification.title} (副本)`,
    content: notification.content,
    selectedUsers: notification.recipients,
    selectedRoles: [],
    sendToAll: false,
    sendType: 'draft',
    scheduledTime: null,
    requireConfirmation: false,
    sendEmail: false
  })
  createNotificationModalVisible.value = true
  notificationDetailModalVisible.value = false
}

/**
 * 处理菜单操作
 */
const handleMenuAction = (key: string, notification: any) => {
  switch (key) {
    case 'resend':
      message.success(`正在重新发送通知: ${notification.title}`)
      break
    case 'schedule':
      message.success(`正在安排发送通知: ${notification.title}`)
      break
    case 'cancel':
      message.success(`已取消发送通知: ${notification.title}`)
      break
    case 'delete':
      message.success(`已删除通知: ${notification.title}`)
      break
  }
}

/**
 * 保存通知
 */
const saveNotification = async () => {
  try {
    await notificationFormRef.value.validate()
    saveLoading.value = true
    
    setTimeout(() => {
      saveLoading.value = false
      createNotificationModalVisible.value = false
      
      if (isEditMode.value) {
        message.success('通知更新成功')
      } else {
        message.success('通知创建成功')
      }
      
      resetNotificationForm()
    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 保存通知设置
 */
const saveNotificationSettings = () => {
  notificationSettingsModalVisible.value = false
  message.success('通知设置已保存')
}

/**
 * 测试邮件设置
 */
const testEmailSettings = () => {
  message.success('邮件设置测试成功')
}

/**
 * 用户选项过滤
 */
const filterUserOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 批量操作方法
 */
const batchMarkAsRead = () => {
  message.success(`已标记 ${selectedRowKeys.value.length} 条通知为已读`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

const batchSend = () => {
  message.success(`正在发送 ${selectedRowKeys.value.length} 条通知`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

const batchSchedule = () => {
  message.success(`已安排 ${selectedRowKeys.value.length} 条通知`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

const batchDelete = () => {
  message.success(`已删除 ${selectedRowKeys.value.length} 条通知`)
  selectedRowKeys.value = []
  batchActionsDrawerVisible.value = false
}

/**
 * 快速选择方法
 */
const selectUnreadNotifications = () => {
  const unreadIds = filteredNotifications.value
    .filter(notification => !notification.isRead)
    .map(notification => notification.id)
  selectedRowKeys.value = unreadIds
  message.success(`已选择 ${unreadIds.length} 条未读通知`)
}

const selectUrgentNotifications = () => {
  const urgentIds = filteredNotifications.value
    .filter(notification => notification.priority === 'urgent')
    .map(notification => notification.id)
  selectedRowKeys.value = urgentIds
  message.success(`已选择 ${urgentIds.length} 条紧急通知`)
}

const selectDraftNotifications = () => {
  const draftIds = filteredNotifications.value
    .filter(notification => notification.status === 'draft')
    .map(notification => notification.id)
  selectedRowKeys.value = draftIds
  message.success(`已选择 ${draftIds.length} 条草稿通知`)
}

const clearSelection = () => {
  selectedRowKeys.value = []
  message.success('已清空选择')
}

/**
 * 样式相关方法
 */
const getTypeColor = (type: string) => {
  const colors = {
    system: 'blue',
    security: 'red',
    maintenance: 'orange',
    update: 'green',
    announcement: 'purple'
  }
  return colors[type] || 'default'
}

const getTypeIcon = (type: string) => {
  const icons = {
    system: BellOutlined,
    security: ShieldOutlined,
    maintenance: ToolOutlined,
    update: UploadOutlined,
    announcement: SoundOutlined
  }
  return icons[type] || BellOutlined
}

const getTypeName = (type: string) => {
  const names = {
    system: '系统通知',
    security: '安全通知',
    maintenance: '维护通知',
    update: '更新通知',
    announcement: '公告通知'
  }
  return names[type] || type
}

const getPriorityColor = (priority: string) => {
  const colors = {
    urgent: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'green'
  }
  return colors[priority] || 'default'
}

const getPriorityName = (priority: string) => {
  const names = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return names[priority] || priority
}

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'gray',
    scheduled: 'blue',
    sent: 'green',
    failed: 'red'
  }
  return colors[status] || 'default'
}

const getStatusName = (status: string) => {
  const names = {
    draft: '草稿',
    scheduled: '已安排',
    sent: '已发送',
    failed: '发送失败'
  }
  return names[status] || status
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString()
}

// 生命周期
onMounted(() => {
  console.log('系统通知页面已加载')
})
</script>

<style scoped>
.system-notifications {
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

.notification-stats {
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

.total-icon,
.unread-icon,
.urgent-icon,
.sent-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.total-icon {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.unread-icon {
  background: linear-gradient(135deg, #fa8c16, #ffa940);
}

.urgent-icon {
  background: linear-gradient(135deg, #f5222d, #ff4d4f);
}

.sent-icon {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #999;
}

.filter-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notifications-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.title-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.read-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.read-text {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.notification-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.notification-content {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
  white-space: pre-wrap;
  word-break: break-word;
}

.recipients-section h4 {
  margin-bottom: 16px;
  color: #333;
}

.template-variables {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.template-variables span {
  margin-right: 8px;
}

.setting-description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.batch-actions {
  padding: 16px 0;
}

.selected-info {
  margin-bottom: 16px;
}

.action-buttons {
  margin-bottom: 24px;
}

.batch-filters h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
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
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .filter-card .ant-form {
    flex-direction: column;
  }
  
  .filter-card .ant-form-item {
    margin-bottom: 16px;
    width: 100%;
  }
  
  .notification-detail {
    max-height: 60vh;
  }
}

@media (max-width: 576px) {
  .header-actions {
    padding: 12px;
  }
  
  .left-actions h2 {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .notification-stats .ant-col {
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
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

.stat-card {
  animation: fadeIn 0.6s ease-out;
}

.notifications-card {
  animation: slideIn 0.8s ease-out;
}

.urgent-icon {
  animation: pulse 2s infinite;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .header-actions {
    background: #1f1f1f;
    color: #fff;
  }
  
  .left-actions h2 {
    color: #fff;
  }
  
  .stat-title {
    color: #ccc;
  }
  
  .stat-value {
    color: #fff;
  }
  
  .stat-detail {
    color: #999;
  }
  
  .notification-content {
    background: #2f2f2f;
    color: #fff;
  }
  
  .title-link {
    color: #40a9ff;
  }
  
  .read-text {
    color: #ccc;
  }
  
  .batch-filters h4 {
    color: #fff;
  }
  
  .recipients-section h4 {
    color: #fff;
  }
  
  .setting-description {
    color: #999;
  }
  
  .template-variables {
    color: #ccc;
  }
}

/* 打印样式 */
@media print {
  .header-actions .right-actions,
  .filter-card,
  .notification-actions {
    display: none;
  }
  
  .system-notifications {
    padding: 0;
  }
  
  .stat-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .notifications-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>