<template>
  <div class="system-settings-view">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <router-link to="/dashboard">首页</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <router-link to="/system">系统管理</router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>系统设置</a-breadcrumb-item>
        </a-breadcrumb>
        <h1 class="page-title">
          <SettingOutlined class="title-icon" />
          系统设置
        </h1>
        <p class="page-description">管理系统配置、参数设置和环境变量</p>
      </div>
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
          <a-button type="primary" @click="showCreateSettingModal">
            <template #icon><PlusOutlined /></template>
            新增配置
          </a-button>
          <a-button @click="exportSettings">
            <template #icon><ExportOutlined /></template>
            导出配置
          </a-button>
          <a-button @click="importSettings">
            <template #icon><ImportOutlined /></template>
            导入配置
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="总配置项"
              :value="settingsStats.total"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <SettingOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="系统配置"
              :value="settingsStats.system"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <DatabaseOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="用户配置"
              :value="settingsStats.user"
              :value-style="{ color: '#faad14' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="今日修改"
              :value="settingsStats.todayModified"
              :value-style="{ color: '#f5222d' }"
            >
              <template #prefix>
                <EditOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <a-row :gutter="16">
        <!-- 左侧配置分类 -->
        <a-col :span="6">
          <a-card title="配置分类" class="category-card">
            <a-menu
              v-model:selectedKeys="selectedCategory"
              mode="inline"
              @click="handleCategoryChange"
            >
              <a-menu-item key="all">
                <template #icon><AppstoreOutlined /></template>
                全部配置
              </a-menu-item>
              <a-menu-item key="system">
                <template #icon><SettingOutlined /></template>
                系统配置
              </a-menu-item>
              <a-menu-item key="database">
                <template #icon><DatabaseOutlined /></template>
                数据库配置
              </a-menu-item>
              <a-menu-item key="cache">
                <template #icon><ThunderboltOutlined /></template>
                缓存配置
              </a-menu-item>
              <a-menu-item key="email">
                <template #icon><MailOutlined /></template>
                邮件配置
              </a-menu-item>
              <a-menu-item key="security">
                <template #icon><SafetyOutlined /></template>
                安全配置
              </a-menu-item>
              <a-menu-item key="ui">
                <template #icon><SkinOutlined /></template>
                界面配置
              </a-menu-item>
              <a-menu-item key="api">
                <template #icon><ApiOutlined /></template>
                API配置
              </a-menu-item>
            </a-menu>
          </a-card>
        </a-col>

        <!-- 右侧配置列表 -->
        <a-col :span="18">
          <a-card title="配置列表" class="settings-card">
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <a-row :gutter="16">
                <a-col :span="8">
                  <a-input
                    v-model:value="filterForm.keyword"
                    placeholder="搜索配置项"
                    allow-clear
                    @change="handleKeywordChange"
                  >
                    <template #prefix>
                      <SearchOutlined />
                    </template>
                  </a-input>
                </a-col>
                <a-col :span="4">
                  <a-select
                    v-model:value="filterForm.type"
                    placeholder="配置类型"
                    allow-clear
                    @change="handleTypeChange"
                  >
                    <a-select-option value="string">字符串</a-select-option>
                    <a-select-option value="number">数字</a-select-option>
                    <a-select-option value="boolean">布尔值</a-select-option>
                    <a-select-option value="json">JSON</a-select-option>
                    <a-select-option value="array">数组</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="4">
                  <a-select
                    v-model:value="filterForm.status"
                    placeholder="状态"
                    allow-clear
                    @change="handleStatusChange"
                  >
                    <a-select-option value="active">启用</a-select-option>
                    <a-select-option value="disabled">禁用</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="8">
                  <a-space>
                    <a-button @click="applyFilters">
                      <template #icon><SearchOutlined /></template>
                      搜索
                    </a-button>
                    <a-button @click="resetFilters">
                      <template #icon><ClearOutlined /></template>
                      重置
                    </a-button>
                  </a-space>
                </a-col>
              </a-row>
            </div>

            <!-- 配置列表 -->
            <a-table
              :columns="settingsColumns"
              :data-source="filteredSettings"
              :loading="loading"
              :pagination="{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }"
              :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: handleRowSelectionChange
              }"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'key'">
                  <a-typography-text code>{{ record.key }}</a-typography-text>
                </template>
                <template v-else-if="column.key === 'value'">
                  <div class="setting-value">
                    <template v-if="record.type === 'boolean'">
                      <a-switch
                        :checked="record.value"
                        :disabled="record.readonly"
                        @change="(checked) => updateSettingValue(record, checked)"
                      />
                    </template>
                    <template v-else-if="record.type === 'password'">
                      <a-input-password
                        :value="record.value"
                        :disabled="record.readonly"
                        @blur="(e) => updateSettingValue(record, e.target.value)"
                      />
                    </template>
                    <template v-else-if="record.type === 'json'">
                      <a-typography-text code class="json-value">
                        {{ formatJsonValue(record.value) }}
                      </a-typography-text>
                    </template>
                    <template v-else>
                      <a-input
                        :value="record.value"
                        :disabled="record.readonly"
                        @blur="(e) => updateSettingValue(record, e.target.value)"
                      />
                    </template>
                  </div>
                </template>
                <template v-else-if="column.key === 'type'">
                  <a-tag :color="getTypeColor(record.type)">
                    {{ getTypeName(record.type) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'category'">
                  <a-tag :color="getCategoryColor(record.category)">
                    {{ getCategoryName(record.category) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusName(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'readonly'">
                  <a-tag v-if="record.readonly" color="orange">只读</a-tag>
                  <a-tag v-else color="green">可编辑</a-tag>
                </template>
                <template v-else-if="column.key === 'updatedAt'">
                  <a-tooltip :title="formatDateTime(record.updatedAt)">
                    {{ formatRelativeTime(record.updatedAt) }}
                  </a-tooltip>
                </template>
                <template v-else-if="column.key === 'actions'">
                  <a-space>
                    <a-button
                      type="link"
                      size="small"
                      @click="showSettingDetail(record)"
                    >
                      <template #icon><EyeOutlined /></template>
                      详情
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      :disabled="record.readonly"
                      @click="editSetting(record)"
                    >
                      <template #icon><EditOutlined /></template>
                      编辑
                    </a-button>
                    <a-dropdown>
                      <a-button type="link" size="small">
                        <template #icon><MoreOutlined /></template>
                      </a-button>
                      <template #overlay>
                        <a-menu @click="({ key }) => handleMenuAction(key, record)">
                          <a-menu-item key="duplicate">
                            <CopyOutlined /> 复制
                          </a-menu-item>
                          <a-menu-item key="reset">
                            <UndoOutlined /> 重置
                          </a-menu-item>
                          <a-menu-item key="history">
                            <HistoryOutlined /> 历史
                          </a-menu-item>
                          <a-menu-divider />
                          <a-menu-item key="delete" :disabled="record.readonly">
                            <DeleteOutlined /> 删除
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </a-space>
                </template>
              </template>
            </a-table>

            <!-- 批量操作 -->
            <div v-if="selectedRowKeys.length > 0" class="batch-actions">
              <a-alert
                :message="`已选择 ${selectedRowKeys.length} 项`"
                type="info"
                show-icon
                closable
                @close="selectedRowKeys = []"
              >
                <template #action>
                  <a-space>
                    <a-button size="small" @click="batchExportSettings">
                      导出
                    </a-button>
                    <a-button size="small" @click="batchResetSettings">
                      重置
                    </a-button>
                    <a-button size="small" danger @click="batchDeleteSettings">
                      删除
                    </a-button>
                  </a-space>
                </template>
              </a-alert>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 配置详情模态框 -->
    <a-modal
      v-model:open="settingDetailModalVisible"
      title="配置详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedSetting" class="setting-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="配置键">
            <a-typography-text code>{{ selectedSetting.key }}</a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="配置名称">
            {{ selectedSetting.name }}
          </a-descriptions-item>
          <a-descriptions-item label="配置分类">
            <a-tag :color="getCategoryColor(selectedSetting.category)">
              {{ getCategoryName(selectedSetting.category) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="数据类型">
            <a-tag :color="getTypeColor(selectedSetting.type)">
              {{ getTypeName(selectedSetting.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="当前值" :span="2">
            <div class="setting-value-display">
              <template v-if="selectedSetting.type === 'json'">
                <pre>{{ JSON.stringify(selectedSetting.value, null, 2) }}</pre>
              </template>
              <template v-else-if="selectedSetting.type === 'password'">
                <a-typography-text code>••••••••</a-typography-text>
              </template>
              <template v-else>
                <a-typography-text code>{{ selectedSetting.value }}</a-typography-text>
              </template>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="默认值" :span="2">
            <a-typography-text code>{{ selectedSetting.defaultValue }}</a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">
            {{ selectedSetting.description }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedSetting.status)">
              {{ getStatusName(selectedSetting.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="只读">
            <a-tag v-if="selectedSetting.readonly" color="orange">是</a-tag>
            <a-tag v-else color="green">否</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDateTime(selectedSetting.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDateTime(selectedSetting.updatedAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新人">
            {{ selectedSetting.updatedBy }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 创建/编辑配置模态框 -->
    <a-modal
      v-model:open="createSettingModalVisible"
      :title="isEditMode ? '编辑配置' : '新增配置'"
      width="600px"
      @ok="saveSetting"
      @cancel="resetSettingForm"
    >
      <a-form
        ref="settingFormRef"
        :model="settingForm"
        :rules="settingFormRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配置键" name="key">
              <a-input
                v-model:value="settingForm.key"
                placeholder="请输入配置键"
                :disabled="isEditMode"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配置名称" name="name">
              <a-input
                v-model:value="settingForm.name"
                placeholder="请输入配置名称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配置分类" name="category">
              <a-select
                v-model:value="settingForm.category"
                placeholder="请选择配置分类"
              >
                <a-select-option value="system">系统配置</a-select-option>
                <a-select-option value="database">数据库配置</a-select-option>
                <a-select-option value="cache">缓存配置</a-select-option>
                <a-select-option value="email">邮件配置</a-select-option>
                <a-select-option value="security">安全配置</a-select-option>
                <a-select-option value="ui">界面配置</a-select-option>
                <a-select-option value="api">API配置</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="数据类型" name="type">
              <a-select
                v-model:value="settingForm.type"
                placeholder="请选择数据类型"
                @change="handleTypeChange"
              >
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
                <a-select-option value="json">JSON</a-select-option>
                <a-select-option value="array">数组</a-select-option>
                <a-select-option value="password">密码</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="配置值" name="value">
          <template v-if="settingForm.type === 'boolean'">
            <a-switch v-model:checked="settingForm.value" />
          </template>
          <template v-else-if="settingForm.type === 'number'">
            <a-input-number
              v-model:value="settingForm.value"
              style="width: 100%"
              placeholder="请输入数字"
            />
          </template>
          <template v-else-if="settingForm.type === 'json'">
            <a-textarea
              v-model:value="settingForm.value"
              :rows="4"
              placeholder="请输入JSON格式数据"
            />
          </template>
          <template v-else-if="settingForm.type === 'password'">
            <a-input-password
              v-model:value="settingForm.value"
              placeholder="请输入密码"
            />
          </template>
          <template v-else>
            <a-input
              v-model:value="settingForm.value"
              placeholder="请输入配置值"
            />
          </template>
        </a-form-item>
        <a-form-item label="默认值" name="defaultValue">
          <a-input
            v-model:value="settingForm.defaultValue"
            placeholder="请输入默认值"
          />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="settingForm.description"
            :rows="3"
            placeholder="请输入配置描述"
          />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select
                v-model:value="settingForm.status"
                placeholder="请选择状态"
              >
                <a-select-option value="active">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="只读" name="readonly">
              <a-switch v-model:checked="settingForm.readonly" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 配置历史模态框 -->
    <a-modal
      v-model:open="settingHistoryModalVisible"
      title="配置历史"
      width="800px"
      :footer="null"
    >
      <a-timeline>
        <a-timeline-item
          v-for="(history, index) in settingHistory"
          :key="index"
          :color="getHistoryColor(history.action)"
        >
          <template #dot>
            <component :is="getHistoryIcon(history.action)" />
          </template>
          <div class="history-item">
            <div class="history-header">
              <span class="history-action">{{ getHistoryActionName(history.action) }}</span>
              <span class="history-time">{{ formatDateTime(history.createdAt) }}</span>
            </div>
            <div class="history-user">操作人：{{ history.user }}</div>
            <div v-if="history.oldValue !== undefined" class="history-changes">
              <div class="old-value">
                <span class="label">原值：</span>
                <a-typography-text code>{{ history.oldValue }}</a-typography-text>
              </div>
              <div class="new-value">
                <span class="label">新值：</span>
                <a-typography-text code>{{ history.newValue }}</a-typography-text>
              </div>
            </div>
            <div v-if="history.comment" class="history-comment">
              <span class="label">备注：</span>
              {{ history.comment }}
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-modal>

    <!-- 导入配置模态框 -->
    <a-modal
      v-model:open="importModalVisible"
      title="导入配置"
      width="600px"
      @ok="handleImport"
      @cancel="resetImportForm"
    >
      <a-form layout="vertical">
        <a-form-item label="导入方式">
          <a-radio-group v-model:value="importForm.type">
            <a-radio value="file">文件导入</a-radio>
            <a-radio value="text">文本导入</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="importForm.type === 'file'" label="选择文件">
          <a-upload
            v-model:file-list="importForm.fileList"
            :before-upload="() => false"
            accept=".json,.yaml,.yml"
          >
            <a-button>
              <template #icon><UploadOutlined /></template>
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item v-if="importForm.type === 'text'" label="配置内容">
          <a-textarea
            v-model:value="importForm.content"
            :rows="10"
            placeholder="请输入JSON或YAML格式的配置内容"
          />
        </a-form-item>
        <a-form-item label="导入选项">
          <a-checkbox-group v-model:value="importForm.options">
            <a-checkbox value="overwrite">覆盖已存在的配置</a-checkbox>
            <a-checkbox value="backup">导入前备份现有配置</a-checkbox>
            <a-checkbox value="validate">验证配置格式</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  UserOutlined,
  EditOutlined,
  SearchOutlined,
  ClearOutlined,
  EyeOutlined,
  MoreOutlined,
  CopyOutlined,
  UndoOutlined,
  HistoryOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  MailOutlined,
  SafetyOutlined,
  SkinOutlined,
  ApiOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const selectedCategory = ref(['all'])
const selectedRowKeys = ref<string[]>([])
const settingDetailModalVisible = ref(false)
const createSettingModalVisible = ref(false)
const settingHistoryModalVisible = ref(false)
const importModalVisible = ref(false)
const isEditMode = ref(false)
const selectedSetting = ref<any>(null)

// 统计数据
const settingsStats = reactive({
  total: 156,
  system: 45,
  user: 89,
  todayModified: 12
})

// 筛选表单
const filterForm = reactive({
  keyword: '',
  type: null,
  status: null
})

// 配置表单
const settingForm = reactive({
  id: null,
  key: '',
  name: '',
  category: 'system',
  type: 'string',
  value: '',
  defaultValue: '',
  description: '',
  status: 'active',
  readonly: false
})

// 导入表单
const importForm = reactive({
  type: 'file',
  fileList: [],
  content: '',
  options: ['validate']
})

// 表单验证规则
const settingFormRules = {
  key: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9._]*$/, message: '配置键格式不正确', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择配置分类', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 模拟配置数据
const settingsList = ref([
  {
    id: '1',
    key: 'app.name',
    name: '应用名称',
    category: 'system',
    type: 'string',
    value: 'Verto项目管理系统',
    defaultValue: 'Verto',
    description: '系统显示的应用名称',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-20 14:30:00',
    updatedBy: 'admin'
  },
  {
    id: '2',
    key: 'app.version',
    name: '应用版本',
    category: 'system',
    type: 'string',
    value: '1.0.0',
    defaultValue: '1.0.0',
    description: '当前应用版本号',
    status: 'active',
    readonly: true,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00',
    updatedBy: 'system'
  },
  {
    id: '3',
    key: 'database.host',
    name: '数据库主机',
    category: 'database',
    type: 'string',
    value: 'localhost',
    defaultValue: 'localhost',
    description: '数据库服务器地址',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-18 16:20:00',
    updatedBy: 'admin'
  },
  {
    id: '4',
    key: 'database.port',
    name: '数据库端口',
    category: 'database',
    type: 'number',
    value: 5432,
    defaultValue: 5432,
    description: '数据库服务器端口',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00',
    updatedBy: 'admin'
  },
  {
    id: '5',
    key: 'cache.enabled',
    name: '启用缓存',
    category: 'cache',
    type: 'boolean',
    value: true,
    defaultValue: true,
    description: '是否启用Redis缓存',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-19 09:15:00',
    updatedBy: 'admin'
  },
  {
    id: '6',
    key: 'email.smtp.host',
    name: 'SMTP服务器',
    category: 'email',
    type: 'string',
    value: 'smtp.gmail.com',
    defaultValue: '',
    description: '邮件SMTP服务器地址',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-17 11:45:00',
    updatedBy: 'admin'
  },
  {
    id: '7',
    key: 'security.jwt.secret',
    name: 'JWT密钥',
    category: 'security',
    type: 'password',
    value: 'your-secret-key',
    defaultValue: '',
    description: 'JWT令牌签名密钥',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-16 13:20:00',
    updatedBy: 'admin'
  },
  {
    id: '8',
    key: 'ui.theme',
    name: '默认主题',
    category: 'ui',
    type: 'string',
    value: 'light',
    defaultValue: 'light',
    description: '系统默认主题模式',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-21 08:30:00',
    updatedBy: 'admin'
  },
  {
    id: '9',
    key: 'api.rate.limit',
    name: 'API限流',
    category: 'api',
    type: 'json',
    value: { requests: 1000, window: 3600 },
    defaultValue: { requests: 100, window: 3600 },
    description: 'API请求限流配置',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-22 15:10:00',
    updatedBy: 'admin'
  },
  {
    id: '10',
    key: 'system.maintenance',
    name: '维护模式',
    category: 'system',
    type: 'boolean',
    value: false,
    defaultValue: false,
    description: '是否开启系统维护模式',
    status: 'active',
    readonly: false,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00',
    updatedBy: 'admin'
  }
])

// 配置历史数据
const settingHistory = ref([
  {
    action: 'update',
    oldValue: 'Verto',
    newValue: 'Verto项目管理系统',
    user: 'admin',
    createdAt: '2024-01-20 14:30:00',
    comment: '更新应用名称显示'
  },
  {
    action: 'create',
    user: 'admin',
    createdAt: '2024-01-15 10:00:00',
    comment: '初始化配置项'
  }
])

// 表格列配置
const settingsColumns = [
  {
    title: '配置键',
    dataIndex: 'key',
    key: 'key',
    width: 200,
    fixed: 'left'
  },
  {
    title: '配置名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '配置值',
    dataIndex: 'value',
    key: 'value',
    width: 200
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '只读',
    dataIndex: 'readonly',
    key: 'readonly',
    width: 80
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 计算属性
const filteredSettings = computed(() => {
  let filtered = settingsList.value

  // 按分类筛选
  if (selectedCategory.value[0] !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory.value[0])
  }

  // 按关键词筛选
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    filtered = filtered.filter(item =>
      item.key.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }

  // 按类型筛选
  if (filterForm.type) {
    filtered = filtered.filter(item => item.type === filterForm.type)
  }

  // 按状态筛选
  if (filterForm.status) {
    filtered = filtered.filter(item => item.status === filterForm.status)
  }

  pagination.total = filtered.length
  return filtered
})

// 方法
/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  
  setTimeout(() => {
    // 模拟数据更新
    settingsStats.total += Math.floor(Math.random() * 3)
    settingsStats.todayModified += Math.floor(Math.random() * 2)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示创建配置模态框
 */
const showCreateSettingModal = () => {
  isEditMode.value = false
  resetSettingForm()
  createSettingModalVisible.value = true
}

/**
 * 重置配置表单
 */
const resetSettingForm = () => {
  Object.assign(settingForm, {
    id: null,
    key: '',
    name: '',
    category: 'system',
    type: 'string',
    value: '',
    defaultValue: '',
    description: '',
    status: 'active',
    readonly: false
  })
}

/**
 * 处理分类变化
 */
const handleCategoryChange = ({ key }: { key: string }) => {
  selectedCategory.value = [key]
}

/**
 * 处理筛选变化
 */
const handleKeywordChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleTypeChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleStatusChange = () => {
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
    keyword: '',
    type: null,
    status: null
  })
  message.success('筛选条件已重置')
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

/**
 * 处理行选择变化
 */
const handleRowSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

/**
 * 显示配置详情
 */
const showSettingDetail = (setting: any) => {
  selectedSetting.value = setting
  settingDetailModalVisible.value = true
}

/**
 * 编辑配置
 */
const editSetting = (setting: any) => {
  isEditMode.value = true
  Object.assign(settingForm, {
    id: setting.id,
    key: setting.key,
    name: setting.name,
    category: setting.category,
    type: setting.type,
    value: setting.value,
    defaultValue: setting.defaultValue,
    description: setting.description,
    status: setting.status,
    readonly: setting.readonly
  })
  createSettingModalVisible.value = true
  settingDetailModalVisible.value = false
}

/**
 * 保存配置
 */
const saveSetting = () => {
  // 表单验证和保存逻辑
  if (isEditMode.value) {
    const index = settingsList.value.findIndex(item => item.id === settingForm.id)
    if (index > -1) {
      Object.assign(settingsList.value[index], {
        ...settingForm,
        updatedAt: new Date().toLocaleString(),
        updatedBy: 'admin'
      })
      message.success('配置更新成功')
    }
  } else {
    const newSetting = {
      ...settingForm,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      updatedBy: 'admin'
    }
    settingsList.value.unshift(newSetting)
    settingsStats.total++
    message.success('配置创建成功')
  }
  
  createSettingModalVisible.value = false
  resetSettingForm()
}

/**
 * 更新配置值
 */
const updateSettingValue = (setting: any, value: any) => {
  setting.value = value
  setting.updatedAt = new Date().toLocaleString()
  setting.updatedBy = 'admin'
  message.success('配置值更新成功')
}

/**
 * 处理菜单操作
 */
const handleMenuAction = (key: string, setting: any) => {
  switch (key) {
    case 'duplicate':
      duplicateSetting(setting)
      break
    case 'reset':
      resetSetting(setting)
      break
    case 'history':
      showSettingHistory(setting)
      break
    case 'delete':
      deleteSetting(setting)
      break
  }
}

/**
 * 复制配置
 */
const duplicateSetting = (setting: any) => {
  isEditMode.value = false
  Object.assign(settingForm, {
    id: null,
    key: `${setting.key}_copy`,
    name: `${setting.name} (副本)`,
    category: setting.category,
    type: setting.type,
    value: setting.value,
    defaultValue: setting.defaultValue,
    description: setting.description,
    status: setting.status,
    readonly: false
  })
  createSettingModalVisible.value = true
  settingDetailModalVisible.value = false
}

/**
 * 重置配置
 */
const resetSetting = (setting: any) => {
  Modal.confirm({
    title: '确认重置',
    content: `确定要将配置 "${setting.name}" 重置为默认值吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      setting.value = setting.defaultValue
      setting.updatedAt = new Date().toLocaleString()
      setting.updatedBy = 'admin'
      message.success('配置重置成功')
    }
  })
}

/**
 * 显示配置历史
 */
const showSettingHistory = (setting: any) => {
  selectedSetting.value = setting
  settingHistoryModalVisible.value = true
}

/**
 * 删除配置
 */
const deleteSetting = (setting: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除配置 "${setting.name}" 吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      const index = settingsList.value.findIndex(item => item.id === setting.id)
      if (index > -1) {
        settingsList.value.splice(index, 1)
        settingsStats.total--
        message.success('配置删除成功')
      }
      settingDetailModalVisible.value = false
    }
  })
}

/**
 * 批量导出配置
 */
const batchExportSettings = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的配置')
    return
  }
  message.success(`正在导出 ${selectedRowKeys.value.length} 个配置`)
}

/**
 * 批量重置配置
 */
const batchResetSettings = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要重置的配置')
    return
  }
  
  Modal.confirm({
    title: '确认批量重置',
    content: `确定要重置选中的 ${selectedRowKeys.value.length} 个配置吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      selectedRowKeys.value.forEach(id => {
        const setting = settingsList.value.find(item => item.id === id)
        if (setting) {
          setting.value = setting.defaultValue
          setting.updatedAt = new Date().toLocaleString()
          setting.updatedBy = 'admin'
        }
      })
      selectedRowKeys.value = []
      message.success('批量重置成功')
    }
  })
}

/**
 * 批量删除配置
 */
const batchDeleteSettings = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的配置')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个配置吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      settingsList.value = settingsList.value.filter(item => !selectedRowKeys.value.includes(item.id))
      settingsStats.total -= selectedRowKeys.value.length
      selectedRowKeys.value = []
      message.success('批量删除成功')
    }
  })
}

/**
 * 导出配置
 */
const exportSettings = () => {
  message.success('配置导出成功')
}

/**
 * 导入配置
 */
const importSettings = () => {
  importModalVisible.value = true
}

/**
 * 处理导入
 */
const handleImport = () => {
  message.success('配置导入成功')
  importModalVisible.value = false
  resetImportForm()
}

/**
 * 重置导入表单
 */
const resetImportForm = () => {
  Object.assign(importForm, {
    type: 'file',
    fileList: [],
    content: '',
    options: ['validate']
  })
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    string: 'blue',
    number: 'green',
    boolean: 'orange',
    json: 'purple',
    array: 'cyan',
    password: 'red'
  }
  return colors[type] || 'default'
}

/**
 * 获取类型名称
 */
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    json: 'JSON',
    array: '数组',
    password: '密码'
  }
  return names[type] || type
}

/**
 * 获取分类颜色
 */
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    system: 'blue',
    database: 'green',
    cache: 'orange',
    email: 'purple',
    security: 'red',
    ui: 'cyan',
    api: 'magenta'
  }
  return colors[category] || 'default'
}

/**
 * 获取分类名称
 */
const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    system: '系统配置',
    database: '数据库配置',
    cache: '缓存配置',
    email: '邮件配置',
    security: '安全配置',
    ui: '界面配置',
    api: 'API配置'
  }
  return names[category] || category
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    disabled: 'default'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态名称
 */
const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    active: '启用',
    disabled: '禁用'
  }
  return names[status] || status
}

/**
 * 获取历史操作颜色
 */
const getHistoryColor = (action: string) => {
  const colors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    reset: 'orange'
  }
  return colors[action] || 'default'
}

/**
 * 获取历史操作图标
 */
const getHistoryIcon = (action: string) => {
  const icons: Record<string, any> = {
    create: PlusOutlined,
    update: EditOutlined,
    delete: DeleteOutlined,
    reset: UndoOutlined
  }
  return icons[action] || EditOutlined
}

/**
 * 获取历史操作名称
 */
const getHistoryActionName = (action: string) => {
  const names: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    reset: '重置'
  }
  return names[action] || action
}

/**
 * 格式化JSON值
 */
const formatJsonValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString()
}

/**
 * 格式化相对时间
 */
const formatRelativeTime = (dateTime: string) => {
  const now = new Date()
  const date = new Date(dateTime)
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 生命周期钩子
onMounted(() => {
  refreshData()
})

onUnmounted(() => {
  // 清理定时器等资源
})
</script>

<style scoped>
.system-settings-view {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-actions .page-title {
  margin: 8px 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #1890ff;
}

.page-description {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.right-actions .ant-space {
  flex-wrap: wrap;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.main-content {
  margin-bottom: 24px;
}

.category-card,
.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.setting-value {
  max-width: 200px;
}

.json-value {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.setting-value-display pre {
  background: #f6f8fa;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  font-size: 12px;
  max-height: 100px;
  overflow-y: auto;
}

.batch-actions {
  margin-top: 16px;
}

.setting-detail {
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.history-action {
  font-weight: 600;
  color: #262626;
}

.history-time {
  color: #8c8c8c;
  font-size: 12px;
}

.history-user {
  color: #595959;
  font-size: 12px;
  margin-bottom: 8px;
}

.history-changes {
  background: #f6f8fa;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.old-value,
.new-value {
  margin-bottom: 4px;
}

.old-value .label,
.new-value .label,
.history-comment .label {
  font-weight: 600;
  color: #262626;
}

.history-comment {
  color: #595959;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .system-settings-view {
    padding: 16px;
  }
  
  .stats-cards .ant-col {
    margin-bottom: 16px;
  }
  
  .main-content .ant-col:first-child {
    margin-bottom: 16px;
  }
  
  .filter-bar .ant-col {
    margin-bottom: 8px;
  }
  
  .setting-value {
    max-width: 120px;
  }
  
  .json-value {
    max-width: 100px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .right-actions .ant-space {
    width: 100%;
  }
  
  .right-actions .ant-btn {
    flex: 1;
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
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.stats-cards .ant-col {
  animation: fadeIn 0.6s ease-out;
}

.stats-cards .ant-col:nth-child(1) { animation-delay: 0.1s; }
.stats-cards .ant-col:nth-child(2) { animation-delay: 0.2s; }
.stats-cards .ant-col:nth-child(3) { animation-delay: 0.3s; }
.stats-cards .ant-col:nth-child(4) { animation-delay: 0.4s; }

.category-card .ant-menu-item {
  animation: slideIn 0.4s ease-out;
}

.settings-card {
  animation: fadeIn 0.8s ease-out;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .system-settings-view {
    background: #141414;
  }
  
  .header-actions,
  .stat-card,
  .category-card,
  .settings-card {
    background: #1f1f1f;
    border-color: #303030;
  }
  
  .page-title {
    color: #ffffff;
  }
  
  .page-description {
    color: #a6a6a6;
  }
  
  .filter-bar {
    background: #262626;
  }
  
  .setting-value-display pre {
    background: #262626;
    color: #ffffff;
  }
  
  .history-changes {
    background: #262626;
  }
}

/* 打印样式 */
@media print {
  .system-settings-view {
    background: white;
    padding: 0;
  }
  
  .header-actions {
    box-shadow: none;
    border-bottom: 1px solid #d9d9d9;
  }
  
  .right-actions {
    display: none;
  }
  
  .stats-cards,
  .category-card,
  .settings-card {
    box-shadow: none;
    border: 1px solid #d9d9d9;
  }
  
  .batch-actions {
    display: none;
  }
}
</style>