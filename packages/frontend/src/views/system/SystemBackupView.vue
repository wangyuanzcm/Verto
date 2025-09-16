<template>
  <div class="system-backup">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>系统备份</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统备份</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button type="primary" @click="showCreateBackupModal">
            <CloudUploadOutlined />
            创建备份
          </a-button>
          <a-button @click="showScheduleModal">
            <ScheduleOutlined />
            备份计划
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="总备份数"
              :value="stats.totalBackups"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <DatabaseOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="存储空间"
              :value="stats.totalSize"
              suffix="GB"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <HddOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="成功率"
              :value="stats.successRate"
              suffix="%"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <CheckCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card">
            <a-statistic
              title="最近备份"
              :value="stats.lastBackupDays"
              suffix="天前"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <ClockCircleOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 备份状态概览 -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :xs="24" :lg="16">
        <a-card title="备份趋势" class="backup-chart-card">
          <div class="backup-chart">
            <!-- 这里可以集成图表库如 ECharts -->
            <div class="chart-placeholder">
              <BarChartOutlined style="font-size: 48px; color: #d9d9d9;" />
              <p>备份趋势图表</p>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="8">
        <a-card title="存储分布" class="storage-distribution-card">
          <div class="storage-distribution">
            <div class="storage-item">
              <div class="storage-label">
                <DatabaseOutlined style="color: #1890ff;" />
                数据库备份
              </div>
              <div class="storage-value">45.2 GB</div>
              <a-progress :percent="65" size="small" />
            </div>
            
            <div class="storage-item">
              <div class="storage-label">
                <FileOutlined style="color: #52c41a;" />
                文件备份
              </div>
              <div class="storage-value">28.7 GB</div>
              <a-progress :percent="41" size="small" />
            </div>
            
            <div class="storage-item">
              <div class="storage-label">
                <SettingOutlined style="color: #fa8c16;" />
                配置备份
              </div>
              <div class="storage-value">1.3 GB</div>
              <a-progress :percent="2" size="small" />
            </div>
            
            <div class="storage-item">
              <div class="storage-label">
                <CodeOutlined style="color: #722ed1;" />
                代码备份
              </div>
              <div class="storage-value">12.8 GB</div>
              <a-progress :percent="18" size="small" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    
    <!-- 备份列表 -->
    <a-card class="backup-list-card">
      <template #title>
        <span>备份列表</span>
        <a-tag color="blue" style="margin-left: 8px">
          共 {{ filteredBackups.length }} 个备份
        </a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索备份名称"
            style="width: 200px"
            @search="handleSearch"
          />
          <a-select
            v-model:value="filterType"
            placeholder="备份类型"
            style="width: 120px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="full">完整备份</a-select-option>
            <a-select-option value="incremental">增量备份</a-select-option>
            <a-select-option value="differential">差异备份</a-select-option>
          </a-select>
          <a-select
            v-model:value="filterStatus"
            placeholder="状态"
            style="width: 100px"
            allowClear
            @change="handleFilter"
          >
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="running">进行中</a-select-option>
          </a-select>
        </a-space>
      </template>
      
      <a-table
        :columns="columns"
        :data-source="filteredBackups"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }"
        :loading="loading"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="backup-name">
              <div class="name-text">{{ record.name }}</div>
              <div class="name-description">{{ record.description }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <div class="backup-status">
              <a-tag :color="getStatusColor(record.status)">
                <template #icon>
                  <LoadingOutlined v-if="record.status === 'running'" />
                  <CheckCircleOutlined v-else-if="record.status === 'success'" />
                  <CloseCircleOutlined v-else-if="record.status === 'failed'" />
                </template>
                {{ getStatusText(record.status) }}
              </a-tag>
              <div v-if="record.status === 'running'" class="progress-info">
                <a-progress :percent="record.progress" size="small" />
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'size'">
            <span class="backup-size">{{ formatSize(record.size) }}</span>
          </template>
          
          <template v-else-if="column.key === 'duration'">
            <span class="backup-duration">{{ formatDuration(record.duration) }}</span>
          </template>
          
          <template v-else-if="column.key === 'createdAt'">
            <div class="backup-time">
              <div class="date">{{ formatDate(record.createdAt) }}</div>
              <div class="time">{{ formatTime(record.createdAt) }}</div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space size="small">
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="showBackupDetail(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip v-if="record.status === 'success'" title="下载备份">
                <a-button type="text" size="small" @click="downloadBackup(record)">
                  <DownloadOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip v-if="record.status === 'success'" title="恢复备份">
                <a-button type="text" size="small" @click="showRestoreModal(record)">
                  <RedoOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip v-if="record.status === 'running'" title="取消备份">
                <a-popconfirm
                  title="确定要取消这个备份任务吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="cancelBackup(record)"
                >
                  <a-button type="text" size="small" danger>
                    <StopOutlined />
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
              
              <a-tooltip title="删除备份">
                <a-popconfirm
                  title="确定要删除这个备份吗？删除后无法恢复。"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="deleteBackup(record)"
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
    
    <!-- 创建备份模态框 -->
    <a-modal
      v-model:open="createBackupModalVisible"
      title="创建备份"
      width="600px"
      :confirm-loading="creating"
      @ok="handleCreateBackup"
      @cancel="handleCreateBackupCancel"
    >
      <a-form
        ref="createBackupFormRef"
        :model="createBackupForm"
        :rules="createBackupRules"
        layout="vertical"
      >
        <a-form-item label="备份名称" name="name">
          <a-input v-model:value="createBackupForm.name" placeholder="请输入备份名称" />
        </a-form-item>
        
        <a-form-item label="备份描述" name="description">
          <a-textarea
            v-model:value="createBackupForm.description"
            :rows="3"
            placeholder="请输入备份描述"
          />
        </a-form-item>
        
        <a-form-item label="备份类型" name="type">
          <a-radio-group v-model:value="createBackupForm.type">
            <a-radio value="full">完整备份</a-radio>
            <a-radio value="incremental">增量备份</a-radio>
            <a-radio value="differential">差异备份</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="备份内容" name="content">
          <a-checkbox-group v-model:value="createBackupForm.content">
            <a-checkbox value="database">数据库</a-checkbox>
            <a-checkbox value="files">文件系统</a-checkbox>
            <a-checkbox value="config">配置文件</a-checkbox>
            <a-checkbox value="logs">日志文件</a-checkbox>
            <a-checkbox value="uploads">上传文件</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item label="压缩选项">
          <a-checkbox v-model:checked="createBackupForm.compress">
            启用压缩（可减少备份文件大小）
          </a-checkbox>
        </a-form-item>
        
        <a-form-item label="加密选项">
          <a-checkbox v-model:checked="createBackupForm.encrypt">
            启用加密（提高备份安全性）
          </a-checkbox>
        </a-form-item>
        
        <a-form-item v-if="createBackupForm.encrypt" label="加密密码" name="password">
          <a-input-password
            v-model:value="createBackupForm.password"
            placeholder="请输入加密密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 备份详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="备份详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedBackup" class="backup-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="备份名称">
            {{ selectedBackup.name }}
          </a-descriptions-item>
          <a-descriptions-item label="备份类型">
            <a-tag :color="getTypeColor(selectedBackup.type)">
              {{ getTypeText(selectedBackup.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedBackup.status)">
              {{ getStatusText(selectedBackup.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="文件大小">
            {{ formatSize(selectedBackup.size) }}
          </a-descriptions-item>
          <a-descriptions-item label="备份时长">
            {{ formatDuration(selectedBackup.duration) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedBackup.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedBackup.completedAt" label="完成时间">
            {{ formatDateTime(selectedBackup.completedAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="存储位置">
            {{ selectedBackup.path }}
          </a-descriptions-item>
          <a-descriptions-item label="备份描述" :span="2">
            {{ selectedBackup.description }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider>备份内容</a-divider>
        
        <div class="backup-content">
          <a-space wrap>
            <a-tag
              v-for="item in selectedBackup.content"
              :key="item"
              color="blue"
            >
              {{ getContentText(item) }}
            </a-tag>
          </a-space>
        </div>
        
        <div v-if="selectedBackup.logs" class="backup-logs">
          <a-divider>备份日志</a-divider>
          <div class="logs-container">
            <pre class="logs-content">{{ selectedBackup.logs }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- 恢复备份模态框 -->
    <a-modal
      v-model:open="restoreModalVisible"
      title="恢复备份"
      width="600px"
      :confirm-loading="restoring"
      @ok="handleRestore"
    >
      <div v-if="selectedBackup" class="restore-form">
        <a-alert
          message="警告"
          description="恢复备份将覆盖当前数据，请确保已做好数据备份。此操作不可逆，请谨慎操作。"
          type="warning"
          show-icon
          style="margin-bottom: 16px;"
        />
        
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="备份名称">
            {{ selectedBackup.name }}
          </a-descriptions-item>
          <a-descriptions-item label="备份时间">
            {{ formatDateTime(selectedBackup.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="备份大小">
            {{ formatSize(selectedBackup.size) }}
          </a-descriptions-item>
        </a-descriptions>
        
        <a-divider>恢复选项</a-divider>
        
        <a-form layout="vertical">
          <a-form-item label="恢复内容">
            <a-checkbox-group v-model:value="restoreForm.content">
              <a-checkbox
                v-for="item in selectedBackup.content"
                :key="item"
                :value="item"
              >
                {{ getContentText(item) }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          
          <a-form-item v-if="selectedBackup.encrypt" label="解密密码">
            <a-input-password
              v-model:value="restoreForm.password"
              placeholder="请输入解密密码"
            />
          </a-form-item>
          
          <a-form-item>
            <a-checkbox v-model:checked="restoreForm.createBackupBeforeRestore">
              恢复前创建当前数据备份
            </a-checkbox>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 备份计划模态框 -->
    <a-modal
      v-model:open="scheduleModalVisible"
      title="备份计划"
      width="700px"
      :footer="null"
    >
      <div class="backup-schedule">
        <div class="schedule-header">
          <a-button type="primary" @click="showCreateScheduleModal">
            <PlusOutlined />
            新建计划
          </a-button>
        </div>
        
        <a-table
          :columns="scheduleColumns"
          :data-source="schedules"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-switch
                :checked="record.enabled"
                @change="(checked) => toggleSchedule(record.id, checked)"
              />
            </template>
            
            <template v-else-if="column.key === 'actions'">
              <a-space size="small">
                <a-button type="text" size="small" @click="editSchedule(record)">
                  <EditOutlined />
                </a-button>
                <a-popconfirm
                  title="确定要删除这个计划吗？"
                  @confirm="deleteSchedule(record.id)"
                >
                  <a-button type="text" size="small" danger>
                    <DeleteOutlined />
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
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
  CloudUploadOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  HddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  FileOutlined,
  CodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  RedoOutlined,
  StopOutlined,
  DeleteOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const restoring = ref(false)
const searchText = ref('')
const filterType = ref()
const filterStatus = ref()
const createBackupModalVisible = ref(false)
const detailModalVisible = ref(false)
const restoreModalVisible = ref(false)
const scheduleModalVisible = ref(false)
const selectedBackup = ref(null)

// 表单引用
const createBackupFormRef = ref()

// 统计数据
const stats = reactive({
  totalBackups: 45,
  totalSize: 87.2,
  successRate: 96.8,
  lastBackupDays: 2
})

// 创建备份表单
const createBackupForm = reactive({
  name: '',
  description: '',
  type: 'full',
  content: ['database', 'files'],
  compress: true,
  encrypt: false,
  password: ''
})

// 恢复表单
const restoreForm = reactive({
  content: [],
  password: '',
  createBackupBeforeRestore: true
})

// 备份数据
const backups = ref([
  {
    id: '1',
    name: '系统完整备份_20240115',
    description: '包含所有数据库和文件的完整备份',
    type: 'full',
    status: 'success',
    size: 15728640000, // 15GB
    duration: 3600, // 1小时
    content: ['database', 'files', 'config', 'uploads'],
    path: '/backups/full/system_backup_20240115.tar.gz',
    compress: true,
    encrypt: false,
    createdAt: '2024-01-15 02:00:00',
    completedAt: '2024-01-15 03:00:00',
    logs: '2024-01-15 02:00:00 [INFO] 开始备份...\n2024-01-15 02:05:00 [INFO] 备份数据库...\n2024-01-15 02:30:00 [INFO] 备份文件系统...\n2024-01-15 03:00:00 [INFO] 备份完成'
  },
  {
    id: '2',
    name: '增量备份_20240114',
    description: '基于上次完整备份的增量备份',
    type: 'incremental',
    status: 'success',
    size: 2147483648, // 2GB
    duration: 900, // 15分钟
    content: ['database', 'files'],
    path: '/backups/incremental/incremental_backup_20240114.tar.gz',
    compress: true,
    encrypt: true,
    createdAt: '2024-01-14 02:00:00',
    completedAt: '2024-01-14 02:15:00',
    logs: '2024-01-14 02:00:00 [INFO] 开始增量备份...\n2024-01-14 02:15:00 [INFO] 增量备份完成'
  },
  {
    id: '3',
    name: '数据库备份_20240113',
    description: '仅备份数据库',
    type: 'differential',
    status: 'running',
    size: 0,
    duration: 0,
    progress: 65,
    content: ['database'],
    path: '/backups/database/db_backup_20240113.sql.gz',
    compress: true,
    encrypt: false,
    createdAt: '2024-01-13 02:00:00',
    logs: '2024-01-13 02:00:00 [INFO] 开始数据库备份...\n2024-01-13 02:10:00 [INFO] 备份进行中...'
  },
  {
    id: '4',
    name: '配置文件备份_20240112',
    description: '系统配置文件备份',
    type: 'full',
    status: 'failed',
    size: 0,
    duration: 300,
    content: ['config'],
    path: '/backups/config/config_backup_20240112.tar.gz',
    compress: true,
    encrypt: false,
    createdAt: '2024-01-12 02:00:00',
    completedAt: '2024-01-12 02:05:00',
    logs: '2024-01-12 02:00:00 [INFO] 开始配置备份...\n2024-01-12 02:05:00 [ERROR] 备份失败：磁盘空间不足'
  }
])

// 备份计划数据
const schedules = ref([
  {
    id: '1',
    name: '每日增量备份',
    type: 'incremental',
    schedule: '0 2 * * *',
    enabled: true,
    nextRun: '2024-01-16 02:00:00'
  },
  {
    id: '2',
    name: '每周完整备份',
    type: 'full',
    schedule: '0 1 * * 0',
    enabled: true,
    nextRun: '2024-01-21 01:00:00'
  },
  {
    id: '3',
    name: '每月归档备份',
    type: 'full',
    schedule: '0 0 1 * *',
    enabled: false,
    nextRun: '2024-02-01 00:00:00'
  }
])

// 表格列定义
const columns = [
  {
    title: '备份名称',
    key: 'name',
    width: 250,
    fixed: 'left'
  },
  {
    title: '类型',
    key: 'type',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 120
  },
  {
    title: '大小',
    key: 'size',
    width: 100
  },
  {
    title: '耗时',
    key: 'duration',
    width: 100
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 140
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 计划表格列定义
const scheduleColumns = [
  {
    title: '计划名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '备份类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: 'Cron表达式',
    dataIndex: 'schedule',
    key: 'schedule'
  },
  {
    title: '下次执行',
    dataIndex: 'nextRun',
    key: 'nextRun'
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '操作',
    key: 'actions',
    width: 100
  }
]

// 表单验证规则
const createBackupRules = {
  name: [
    { required: true, message: '请输入备份名称' }
  ],
  content: [
    { required: true, message: '请选择备份内容', type: 'array', min: 1 }
  ],
  password: [
    { required: true, message: '请输入加密密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 类型颜色映射
const typeColors = {
  full: 'blue',
  incremental: 'green',
  differential: 'orange'
}

// 类型文本映射
const typeTexts = {
  full: '完整备份',
  incremental: '增量备份',
  differential: '差异备份'
}

// 状态颜色映射
const statusColors = {
  success: 'green',
  failed: 'red',
  running: 'blue'
}

// 状态文本映射
const statusTexts = {
  success: '成功',
  failed: '失败',
  running: '进行中'
}

// 内容文本映射
const contentTexts = {
  database: '数据库',
  files: '文件系统',
  config: '配置文件',
  logs: '日志文件',
  uploads: '上传文件'
}

// 计算属性
const filteredBackups = computed(() => {
  let result = backups.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(backup => 
      backup.name.toLowerCase().includes(search) ||
      backup.description.toLowerCase().includes(search)
    )
  }
  
  // 类型过滤
  if (filterType.value) {
    result = result.filter(backup => backup.type === filterType.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(backup => backup.status === filterStatus.value)
  }
  
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 方法
/**
 * 搜索处理
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 过滤处理
 */
const handleFilter = () => {
  // 过滤逻辑已在计算属性中处理
}

/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示创建备份模态框
 */
const showCreateBackupModal = () => {
  resetCreateBackupForm()
  createBackupModalVisible.value = true
}

/**
 * 处理创建备份
 */
const handleCreateBackup = async () => {
  try {
    await createBackupFormRef.value.validate()
    creating.value = true
    
    // 模拟创建备份
    setTimeout(() => {
      const newBackup = {
        id: Date.now().toString(),
        name: createBackupForm.name,
        description: createBackupForm.description,
        type: createBackupForm.type,
        status: 'running',
        size: 0,
        duration: 0,
        progress: 0,
        content: createBackupForm.content,
        path: `/backups/${createBackupForm.type}/${createBackupForm.name}.tar.gz`,
        compress: createBackupForm.compress,
        encrypt: createBackupForm.encrypt,
        createdAt: new Date().toLocaleString(),
        logs: `${new Date().toLocaleString()} [INFO] 开始备份...`
      }
      
      backups.value.unshift(newBackup)
      stats.totalBackups++
      
      creating.value = false
      createBackupModalVisible.value = false
      message.success('备份任务已创建，正在后台执行')
    }, 2000)
  } catch (error) {
    console.error('创建备份失败:', error)
  }
}

/**
 * 取消创建备份
 */
const handleCreateBackupCancel = () => {
  createBackupModalVisible.value = false
  resetCreateBackupForm()
}

/**
 * 重置创建备份表单
 */
const resetCreateBackupForm = () => {
  Object.assign(createBackupForm, {
    name: '',
    description: '',
    type: 'full',
    content: ['database', 'files'],
    compress: true,
    encrypt: false,
    password: ''
  })
  createBackupFormRef.value?.resetFields()
}

/**
 * 显示备份详情
 */
const showBackupDetail = (backup: any) => {
  selectedBackup.value = backup
  detailModalVisible.value = true
}

/**
 * 下载备份
 */
const downloadBackup = (backup: any) => {
  // 模拟下载
  message.info(`开始下载备份：${backup.name}`)
}

/**
 * 显示恢复模态框
 */
const showRestoreModal = (backup: any) => {
  selectedBackup.value = backup
  restoreForm.content = [...backup.content]
  restoreModalVisible.value = true
}

/**
 * 处理恢复
 */
const handleRestore = () => {
  restoring.value = true
  
  setTimeout(() => {
    restoring.value = false
    restoreModalVisible.value = false
    message.success('备份恢复成功')
  }, 3000)
}

/**
 * 取消备份
 */
const cancelBackup = (backup: any) => {
  backup.status = 'failed'
  backup.logs += `\n${new Date().toLocaleString()} [INFO] 备份已取消`
  message.success('备份任务已取消')
}

/**
 * 删除备份
 */
const deleteBackup = (backup: any) => {
  const index = backups.value.findIndex(b => b.id === backup.id)
  if (index > -1) {
    backups.value.splice(index, 1)
    stats.totalBackups--
    message.success('备份删除成功')
  }
}

/**
 * 显示备份计划模态框
 */
const showScheduleModal = () => {
  scheduleModalVisible.value = true
}

/**
 * 显示创建计划模态框
 */
const showCreateScheduleModal = () => {
  message.info('创建备份计划功能开发中')
}

/**
 * 切换计划状态
 */
const toggleSchedule = (id: string, enabled: boolean) => {
  const schedule = schedules.value.find(s => s.id === id)
  if (schedule) {
    schedule.enabled = enabled
    message.success(`计划已${enabled ? '启用' : '禁用'}`)
  }
}

/**
 * 编辑计划
 */
const editSchedule = (schedule: any) => {
  message.info('编辑备份计划功能开发中')
}

/**
 * 删除计划
 */
const deleteSchedule = (id: string) => {
  const index = schedules.value.findIndex(s => s.id === id)
  if (index > -1) {
    schedules.value.splice(index, 1)
    message.success('计划删除成功')
  }
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string) => {
  return typeColors[type] || 'default'
}

/**
 * 获取类型文本
 */
const getTypeText = (type: string) => {
  return typeTexts[type] || type
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  return statusColors[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  return statusTexts[status] || status
}

/**
 * 获取内容文本
 */
const getContentText = (content: string) => {
  return contentTexts[content] || content
}

/**
 * 格式化文件大小
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化持续时间
 */
const formatDuration = (seconds: number) => {
  if (seconds === 0) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateTime: string) => {
  return new Date(dateTime).toLocaleDateString()
}

/**
 * 格式化时间
 */
const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString()
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

// 生命周期
onMounted(() => {
  console.log('系统备份页面已加载')
})
</script>

<style scoped>
.system-backup {
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

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.backup-chart-card,
.storage-distribution-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.backup-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

.storage-distribution {
  padding: 16px 0;
}

.storage-item {
  margin-bottom: 24px;
}

.storage-item:last-child {
  margin-bottom: 0;
}

.storage-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
}

.storage-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.backup-list-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.backup-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text {
  font-weight: 500;
}

.name-description {
  font-size: 12px;
  color: #666;
}

.backup-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  width: 80px;
}

.backup-size {
  font-weight: 500;
}

.backup-duration {
  color: #666;
}

.backup-time {
  text-align: center;
}

.backup-time .date {
  font-size: 12px;
  color: #666;
}

.backup-time .time {
  font-size: 11px;
  color: #999;
}

.backup-detail .ant-descriptions {
  margin-bottom: 16px;
}

.backup-content {
  margin-bottom: 16px;
}

.backup-logs {
  margin-top: 16px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  border-radius: 4px;
}

.logs-content {
  padding: 12px;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.restore-form .ant-descriptions {
  margin-bottom: 16px;
}

.backup-schedule {
  padding: 0;
}

.schedule-header {
  margin-bottom: 16px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions {
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
  
  .right-actions .ant-space {
    flex-direction: column;
    width: 100%;
  }
  
  .stats-cards .ant-col {
    margin-bottom: 16px;
  }
  
  .backup-chart {
    height: 200px;
  }
  
  .storage-item {
    margin-bottom: 16px;
  }
  
  .backup-name {
    gap: 2px;
  }
  
  .name-description {
    font-size: 11px;
  }
  
  .backup-status {
    gap: 4px;
  }
  
  .progress-info {
    width: 60px;
  }
}

/* 动画效果 */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .header-actions,
  .stat-card,
  .backup-chart-card,
  .storage-distribution-card,
  .backup-list-card {
    background: #141414;
    border-color: #303030;
  }
  
  .name-description,
  .backup-duration,
  .backup-time .date,
  .backup-time .time {
    color: #999;
  }
  
  .chart-placeholder {
    color: #666;
  }
  
  .logs-container {
    background: #262626;
  }
  
  .logs-content {
    color: #fff;
  }
}
</style>