<template>
  <div class="system-api">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="left-actions">
        <h2>API管理</h2>
        <a-breadcrumb>
          <a-breadcrumb-item>
            <HomeOutlined />
            首页
          </a-breadcrumb-item>
          <a-breadcrumb-item>
            <SettingOutlined />
            系统管理
          </a-breadcrumb-item>
          <a-breadcrumb-item>API管理</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      
      <div class="right-actions">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button @click="showCreateApiModal">
            <PlusOutlined />
            创建API
          </a-button>
          <a-button type="primary" @click="showApiDocsModal">
            <FileTextOutlined />
            API文档
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="api-stats">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card total-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="total-icon">
                  <ApiOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">总API数</div>
                <div class="stat-value">{{ apiStats.total }}</div>
                <div class="stat-detail">
                  <span>今日新增: {{ apiStats.todayNew }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card active-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="active-icon">
                  <CheckCircleOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">活跃API</div>
                <div class="stat-value">{{ apiStats.active }}</div>
                <div class="stat-detail">
                  <span>占比: {{ ((apiStats.active / apiStats.total) * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card requests-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="requests-icon">
                  <BarChartOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">今日请求</div>
                <div class="stat-value">{{ apiStats.todayRequests.toLocaleString() }}</div>
                <div class="stat-detail">
                  <span>成功率: {{ apiStats.successRate }}%</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-card class="stat-card errors-card">
            <div class="stat-content">
              <div class="stat-icon">
                <div class="errors-icon">
                  <ExclamationCircleOutlined style="font-size: 24px;" />
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-title">错误数</div>
                <div class="stat-value">{{ apiStats.errors }}</div>
                <div class="stat-detail">
                  <span>错误率: {{ ((apiStats.errors / apiStats.todayRequests) * 100).toFixed(2) }}%</span>
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
        <a-form-item label="API分组">
          <a-select
            v-model:value="filterForm.group"
            placeholder="请选择API分组"
            style="width: 150px"
            allowClear
            @change="handleGroupChange"
          >
            <a-select-option value="user">用户管理</a-select-option>
            <a-select-option value="project">项目管理</a-select-option>
            <a-select-option value="system">系统管理</a-select-option>
            <a-select-option value="file">文件管理</a-select-option>
            <a-select-option value="auth">认证授权</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="请求方法">
          <a-select
            v-model:value="filterForm.method"
            placeholder="请选择请求方法"
            style="width: 120px"
            allowClear
            @change="handleMethodChange"
          >
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
            <a-select-option value="PUT">PUT</a-select-option>
            <a-select-option value="DELETE">DELETE</a-select-option>
            <a-select-option value="PATCH">PATCH</a-select-option>
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
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="inactive">停用</a-select-option>
            <a-select-option value="deprecated">已废弃</a-select-option>
            <a-select-option value="testing">测试中</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="版本">
          <a-select
            v-model:value="filterForm.version"
            placeholder="请选择版本"
            style="width: 100px"
            allowClear
            @change="handleVersionChange"
          >
            <a-select-option value="v1">v1</a-select-option>
            <a-select-option value="v2">v2</a-select-option>
            <a-select-option value="v3">v3</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="关键词">
          <a-input
            v-model:value="filterForm.keyword"
            placeholder="搜索API名称或路径"
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
    
    <!-- API列表 -->
    <a-card class="api-card">
      <template #title>
        <span>API列表</span>
        <a-tag color="blue" style="margin-left: 8px">
          共 {{ filteredApis.length }} 个API
        </a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-tooltip title="批量测试">
            <a-button size="small" @click="batchTestApis">
              <ExperimentOutlined />
              批量测试
            </a-button>
          </a-tooltip>
          <a-button size="small" @click="exportApiDocs">
            <ExportOutlined />
            导出文档
          </a-button>
        </a-space>
      </template>
      
      <a-table
        :columns="apiColumns"
        :data-source="filteredApis"
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
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="api-name">
              <a @click="showApiDetail(record)" class="name-link">
                {{ record.name }}
              </a>
              <a-tag v-if="record.isNew" color="green" size="small">新</a-tag>
            </div>
          </template>
          
          <template v-else-if="column.key === 'method'">
            <a-tag :color="getMethodColor(record.method)">
              {{ record.method }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'path'">
            <code class="api-path">{{ record.path }}</code>
          </template>
          
          <template v-else-if="column.key === 'group'">
            <a-tag :color="getGroupColor(record.group)">
              {{ getGroupName(record.group) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusName(record.status) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'responseTime'">
            <span :class="getResponseTimeClass(record.responseTime)">
              {{ record.responseTime }}ms
            </span>
          </template>
          
          <template v-else-if="column.key === 'requestCount'">
            <div class="request-stats">
              <div class="count">{{ record.requestCount.toLocaleString() }}</div>
              <div class="trend" :class="record.trend">
                <component :is="getTrendIcon(record.trend)" />
                {{ record.trendPercent }}%
              </div>
            </div>
          </template>
          
          <template v-else-if="column.key === 'lastUsed'">
            {{ formatDateTime(record.lastUsed) }}
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <a-space size="small">
              <a-tooltip title="查看详情">
                <a-button type="text" size="small" @click="showApiDetail(record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="测试API">
                <a-button type="text" size="small" @click="testApi(record)">
                  <ExperimentOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="编辑">
                <a-button type="text" size="small" @click="editApi(record)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              
              <a-tooltip title="复制">
                <a-button type="text" size="small" @click="duplicateApi(record)">
                  <CopyOutlined />
                </a-button>
              </a-tooltip>
              
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleMenuAction(key, record)">
                    <a-menu-item key="enable" v-if="record.status === 'inactive'">
                      <PlayCircleOutlined />
                      启用
                    </a-menu-item>
                    <a-menu-item key="disable" v-if="record.status === 'active'">
                      <PauseCircleOutlined />
                      停用
                    </a-menu-item>
                    <a-menu-item key="deprecate" v-if="record.status !== 'deprecated'">
                      <StopOutlined />
                      废弃
                    </a-menu-item>
                    <a-menu-item key="logs">
                      <FileTextOutlined />
                      查看日志
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
    
    <!-- API详情模态框 -->
    <a-modal
      v-model:open="apiDetailModalVisible"
      title="API详情"
      width="1000px"
      :footer="null"
    >
      <div v-if="selectedApi" class="api-detail">
        <a-tabs v-model:activeKey="detailTab">
          <a-tab-pane key="basic" tab="基本信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="API名称">
                {{ selectedApi.name }}
              </a-descriptions-item>
              <a-descriptions-item label="API路径">
                <code>{{ selectedApi.path }}</code>
              </a-descriptions-item>
              <a-descriptions-item label="请求方法">
                <a-tag :color="getMethodColor(selectedApi.method)">
                  {{ selectedApi.method }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="API分组">
                <a-tag :color="getGroupColor(selectedApi.group)">
                  {{ getGroupName(selectedApi.group) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="版本">
                {{ selectedApi.version }}
              </a-descriptions-item>
              <a-descriptions-item label="状态">
                <a-tag :color="getStatusColor(selectedApi.status)">
                  {{ getStatusName(selectedApi.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="描述" :span="2">
                {{ selectedApi.description }}
              </a-descriptions-item>
              <a-descriptions-item label="创建时间">
                {{ formatDateTime(selectedApi.createTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="更新时间">
                {{ formatDateTime(selectedApi.updateTime) }}
              </a-descriptions-item>
              <a-descriptions-item label="创建者">
                {{ selectedApi.creator }}
              </a-descriptions-item>
              <a-descriptions-item label="维护者">
                {{ selectedApi.maintainer }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
          
          <a-tab-pane key="params" tab="参数说明">
            <div class="params-section">
              <h4>请求参数</h4>
              <a-table
                :columns="paramColumns"
                :data-source="selectedApi.requestParams"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'required'">
                    <a-tag :color="record.required ? 'red' : 'default'">
                      {{ record.required ? '必填' : '可选' }}
                    </a-tag>
                  </template>
                </template>
              </a-table>
              
              <h4 style="margin-top: 24px;">响应参数</h4>
              <a-table
                :columns="responseColumns"
                :data-source="selectedApi.responseParams"
                :pagination="false"
                size="small"
              />
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="example" tab="示例代码">
            <div class="example-section">
              <a-tabs v-model:activeKey="exampleTab">
                <a-tab-pane key="curl" tab="cURL">
                  <pre class="code-block">{{ selectedApi.examples.curl }}</pre>
                </a-tab-pane>
                <a-tab-pane key="javascript" tab="JavaScript">
                  <pre class="code-block">{{ selectedApi.examples.javascript }}</pre>
                </a-tab-pane>
                <a-tab-pane key="python" tab="Python">
                  <pre class="code-block">{{ selectedApi.examples.python }}</pre>
                </a-tab-pane>
                <a-tab-pane key="java" tab="Java">
                  <pre class="code-block">{{ selectedApi.examples.java }}</pre>
                </a-tab-pane>
              </a-tabs>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="test" tab="在线测试">
            <div class="test-section">
              <a-form layout="vertical">
                <a-form-item label="请求URL">
                  <a-input v-model:value="testForm.url" readonly />
                </a-form-item>
                
                <a-form-item label="请求头">
                  <a-textarea
                    v-model:value="testForm.headers"
                    placeholder="请输入请求头，JSON格式"
                    :rows="4"
                  />
                </a-form-item>
                
                <a-form-item label="请求参数" v-if="selectedApi.method !== 'GET'">
                  <a-textarea
                    v-model:value="testForm.body"
                    placeholder="请输入请求参数，JSON格式"
                    :rows="6"
                  />
                </a-form-item>
                
                <a-form-item>
                  <a-button type="primary" @click="executeTest" :loading="testLoading">
                    <ExperimentOutlined />
                    发送请求
                  </a-button>
                </a-form-item>
              </a-form>
              
              <div v-if="testResult" class="test-result">
                <h4>响应结果</h4>
                <div class="result-header">
                  <a-tag :color="testResult.status >= 200 && testResult.status < 300 ? 'green' : 'red'">
                    {{ testResult.status }} {{ testResult.statusText }}
                  </a-tag>
                  <span class="response-time">{{ testResult.responseTime }}ms</span>
                </div>
                <pre class="result-body">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="stats" tab="统计信息">
            <div class="stats-section">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-statistic title="总请求数" :value="selectedApi.totalRequests" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="成功率" :value="selectedApi.successRate" suffix="%" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="平均响应时间" :value="selectedApi.avgResponseTime" suffix="ms" />
                </a-col>
                <a-col :span="12">
                  <a-statistic title="错误数" :value="selectedApi.errorCount" />
                </a-col>
              </a-row>
              
              <div class="chart-container" style="margin-top: 24px;">
                <h4>请求趋势</h4>
                <div class="chart-placeholder">
                  <!-- 这里可以集成图表库显示请求趋势 -->
                  <p>请求趋势图表</p>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
        
        <div class="api-actions" style="margin-top: 16px; text-align: right;">
          <a-space>
            <a-button @click="editApi(selectedApi)">
              编辑API
            </a-button>
            <a-button @click="testApi(selectedApi)">
              测试API
            </a-button>
            <a-button @click="apiDetailModalVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 创建/编辑API模态框 -->
    <a-modal
      v-model:open="createApiModalVisible"
      :title="isEditMode ? '编辑API' : '创建API'"
      width="800px"
      @ok="saveApi"
      :confirm-loading="saveLoading"
    >
      <a-form
        ref="apiFormRef"
        :model="apiForm"
        :rules="apiRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="API名称" name="name">
              <a-input v-model:value="apiForm.name" placeholder="请输入API名称" />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="API分组" name="group">
              <a-select v-model:value="apiForm.group" placeholder="请选择API分组">
                <a-select-option value="user">用户管理</a-select-option>
                <a-select-option value="project">项目管理</a-select-option>
                <a-select-option value="system">系统管理</a-select-option>
                <a-select-option value="file">文件管理</a-select-option>
                <a-select-option value="auth">认证授权</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="请求方法" name="method">
              <a-select v-model:value="apiForm.method" placeholder="请选择请求方法">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
                <a-select-option value="PUT">PUT</a-select-option>
                <a-select-option value="DELETE">DELETE</a-select-option>
                <a-select-option value="PATCH">PATCH</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="8">
            <a-form-item label="版本" name="version">
              <a-select v-model:value="apiForm.version" placeholder="请选择版本">
                <a-select-option value="v1">v1</a-select-option>
                <a-select-option value="v2">v2</a-select-option>
                <a-select-option value="v3">v3</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="8">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="apiForm.status" placeholder="请选择状态">
                <a-select-option value="active">活跃</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
                <a-select-option value="testing">测试中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="API路径" name="path">
          <a-input v-model:value="apiForm.path" placeholder="请输入API路径，如：/api/v1/users" />
        </a-form-item>
        
        <a-form-item label="API描述" name="description">
          <a-textarea
            v-model:value="apiForm.description"
            placeholder="请输入API描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="维护者">
          <a-select
            v-model:value="apiForm.maintainer"
            placeholder="请选择维护者"
            show-search
            :filter-option="filterUserOption"
          >
            <a-select-option
              v-for="user in userList"
              :key="user.id"
              :value="user.name"
            >
              {{ user.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="标签">
          <a-select
            v-model:value="apiForm.tags"
            mode="tags"
            placeholder="请输入标签"
            style="width: 100%"
          >
            <a-select-option value="CRUD">CRUD</a-select-option>
            <a-select-option value="查询">查询</a-select-option>
            <a-select-option value="上传">上传</a-select-option>
            <a-select-option value="下载">下载</a-select-option>
            <a-select-option value="认证">认证</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- API文档模态框 -->
    <a-modal
      v-model:open="apiDocsModalVisible"
      title="API文档"
      width="1200px"
      :footer="null"
    >
      <div class="api-docs">
        <div class="docs-header">
          <h3>API接口文档</h3>
          <a-space>
            <a-button @click="exportApiDocs">
              <ExportOutlined />
              导出文档
            </a-button>
            <a-button @click="generateSwagger">
              <FileTextOutlined />
              生成Swagger
            </a-button>
          </a-space>
        </div>
        
        <div class="docs-content">
          <a-collapse v-model:activeKey="docsActiveKey">
            <a-collapse-panel
              v-for="group in apiGroups"
              :key="group.key"
              :header="`${group.name} (${group.apis.length}个API)`"
            >
              <div class="group-apis">
                <div
                  v-for="api in group.apis"
                  :key="api.id"
                  class="api-doc-item"
                >
                  <div class="api-header">
                    <a-tag :color="getMethodColor(api.method)">{{ api.method }}</a-tag>
                    <code class="api-path">{{ api.path }}</code>
                    <span class="api-name">{{ api.name }}</span>
                  </div>
                  <div class="api-description">{{ api.description }}</div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
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
  PlusOutlined,
  FileTextOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ClearOutlined,
  ExperimentOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  MoreOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  MinusOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const loading = ref(false)
const apiDetailModalVisible = ref(false)
const createApiModalVisible = ref(false)
const apiDocsModalVisible = ref(false)
const selectedApi = ref(null)
const selectedRowKeys = ref([])
const saveLoading = ref(false)
const testLoading = ref(false)
const isEditMode = ref(false)
const detailTab = ref('basic')
const exampleTab = ref('curl')
const docsActiveKey = ref(['user'])
const apiFormRef = ref()

// 统计数据
const apiStats = reactive({
  total: 156,
  todayNew: 3,
  active: 142,
  todayRequests: 25847,
  successRate: 99.2,
  errors: 206
})

// 用户列表
const userList = ref([
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' }
])

// 筛选表单
const filterForm = reactive({
  group: null,
  method: null,
  status: null,
  version: null,
  keyword: ''
})

// API表单
const apiForm = reactive({
  id: null,
  name: '',
  group: 'user',
  method: 'GET',
  version: 'v1',
  status: 'active',
  path: '',
  description: '',
  maintainer: '',
  tags: []
})

// 表单验证规则
const apiRules = {
  name: [{ required: true, message: '请输入API名称' }],
  group: [{ required: true, message: '请选择API分组' }],
  method: [{ required: true, message: '请选择请求方法' }],
  path: [{ required: true, message: '请输入API路径' }],
  description: [{ required: true, message: '请输入API描述' }]
}

// 测试表单
const testForm = reactive({
  url: '',
  headers: '{}',
  body: '{}'
})

// 测试结果
const testResult = ref(null)

// API数据
const apis = ref([
  {
    id: 'API001',
    name: '获取用户列表',
    group: 'user',
    method: 'GET',
    path: '/api/v1/users',
    version: 'v1',
    status: 'active',
    description: '获取系统中所有用户的列表信息',
    creator: '张三',
    maintainer: '李四',
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-01-15 14:30:00',
    responseTime: 120,
    requestCount: 15420,
    trend: 'up',
    trendPercent: 12.5,
    lastUsed: '2024-01-15 16:45:00',
    isNew: false,
    tags: ['CRUD', '查询'],
    totalRequests: 156420,
    successRate: 99.8,
    avgResponseTime: 115,
    errorCount: 312,
    requestParams: [
      { name: 'page', type: 'number', required: false, description: '页码，默认为1' },
      { name: 'size', type: 'number', required: false, description: '每页数量，默认为20' },
      { name: 'keyword', type: 'string', required: false, description: '搜索关键词' }
    ],
    responseParams: [
      { name: 'code', type: 'number', description: '响应状态码' },
      { name: 'message', type: 'string', description: '响应消息' },
      { name: 'data', type: 'object', description: '响应数据' },
      { name: 'data.list', type: 'array', description: '用户列表' },
      { name: 'data.total', type: 'number', description: '总数量' }
    ],
    examples: {
      curl: `curl -X GET "http://localhost:3000/api/v1/users?page=1&size=20" \\\n  -H "Authorization: Bearer your-token"`,
      javascript: `fetch('/api/v1/users?page=1&size=20', {\n  method: 'GET',\n  headers: {\n    'Authorization': 'Bearer your-token'\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "http://localhost:3000/api/v1/users"\nparams = {"page": 1, "size": 20}\nheaders = {"Authorization": "Bearer your-token"}\n\nresponse = requests.get(url, params=params, headers=headers)\nprint(response.json())`,
      java: `OkHttpClient client = new OkHttpClient();\n\nRequest request = new Request.Builder()\n  .url("http://localhost:3000/api/v1/users?page=1&size=20")\n  .addHeader("Authorization", "Bearer your-token")\n  .build();\n\nResponse response = client.newCall(request).execute();`
    }
  },
  {
    id: 'API002',
    name: '创建用户',
    group: 'user',
    method: 'POST',
    path: '/api/v1/users',
    version: 'v1',
    status: 'active',
    description: '创建新的用户账户',
    creator: '李四',
    maintainer: '张三',
    createTime: '2024-01-12 09:30:00',
    updateTime: '2024-01-15 11:20:00',
    responseTime: 85,
    requestCount: 8520,
    trend: 'up',
    trendPercent: 8.3,
    lastUsed: '2024-01-15 15:20:00',
    isNew: false,
    tags: ['CRUD'],
    totalRequests: 85200,
    successRate: 98.5,
    avgResponseTime: 92,
    errorCount: 1278,
    requestParams: [
      { name: 'username', type: 'string', required: true, description: '用户名' },
      { name: 'email', type: 'string', required: true, description: '邮箱地址' },
      { name: 'password', type: 'string', required: true, description: '密码' },
      { name: 'role', type: 'string', required: false, description: '用户角色' }
    ],
    responseParams: [
      { name: 'code', type: 'number', description: '响应状态码' },
      { name: 'message', type: 'string', description: '响应消息' },
      { name: 'data', type: 'object', description: '用户信息' }
    ],
    examples: {
      curl: `curl -X POST "http://localhost:3000/api/v1/users" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer your-token" \\\n  -d '{"username":"john","email":"john@example.com","password":"123456"}'`,
      javascript: `fetch('/api/v1/users', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'Authorization': 'Bearer your-token'\n  },\n  body: JSON.stringify({\n    username: 'john',\n    email: 'john@example.com',\n    password: '123456'\n  })\n});`,
      python: `import requests\nimport json\n\nurl = "http://localhost:3000/api/v1/users"\ndata = {\n    "username": "john",\n    "email": "john@example.com",\n    "password": "123456"\n}\nheaders = {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer your-token"\n}\n\nresponse = requests.post(url, data=json.dumps(data), headers=headers)`,
      java: `OkHttpClient client = new OkHttpClient();\nMediaType JSON = MediaType.get("application/json; charset=utf-8");\n\nString json = "{\"username\":\"john\",\"email\":\"john@example.com\",\"password\":\"123456\"}";\nRequestBody body = RequestBody.create(json, JSON);\n\nRequest request = new Request.Builder()\n  .url("http://localhost:3000/api/v1/users")\n  .post(body)\n  .addHeader("Authorization", "Bearer your-token")\n  .build();`
    }
  },
  {
    id: 'API003',
    name: '获取项目列表',
    group: 'project',
    method: 'GET',
    path: '/api/v1/projects',
    version: 'v1',
    status: 'active',
    description: '获取用户有权限访问的项目列表',
    creator: '王五',
    maintainer: '王五',
    createTime: '2024-01-08 14:20:00',
    updateTime: '2024-01-14 16:10:00',
    responseTime: 95,
    requestCount: 12350,
    trend: 'down',
    trendPercent: 5.2,
    lastUsed: '2024-01-15 17:30:00',
    isNew: false,
    tags: ['查询'],
    totalRequests: 123500,
    successRate: 99.5,
    avgResponseTime: 98,
    errorCount: 617,
    requestParams: [
      { name: 'status', type: 'string', required: false, description: '项目状态筛选' },
      { name: 'owner', type: 'string', required: false, description: '项目负责人' }
    ],
    responseParams: [
      { name: 'code', type: 'number', description: '响应状态码' },
      { name: 'data', type: 'array', description: '项目列表' }
    ],
    examples: {
      curl: `curl -X GET "http://localhost:3000/api/v1/projects" \\\n  -H "Authorization: Bearer your-token"`,
      javascript: `fetch('/api/v1/projects', {\n  method: 'GET',\n  headers: {\n    'Authorization': 'Bearer your-token'\n  }\n});`,
      python: `import requests\n\nresponse = requests.get('http://localhost:3000/api/v1/projects', \n                       headers={'Authorization': 'Bearer your-token'})`,
      java: `Request request = new Request.Builder()\n  .url("http://localhost:3000/api/v1/projects")\n  .addHeader("Authorization", "Bearer your-token")\n  .build();`
    }
  },
  {
    id: 'API004',
    name: '系统健康检查',
    group: 'system',
    method: 'GET',
    path: '/api/v1/health',
    version: 'v1',
    status: 'active',
    description: '检查系统运行状态和健康度',
    creator: '赵六',
    maintainer: '赵六',
    createTime: '2024-01-05 08:00:00',
    updateTime: '2024-01-15 12:00:00',
    responseTime: 25,
    requestCount: 45620,
    trend: 'stable',
    trendPercent: 0.8,
    lastUsed: '2024-01-15 18:00:00',
    isNew: false,
    tags: ['监控'],
    totalRequests: 456200,
    successRate: 99.9,
    avgResponseTime: 28,
    errorCount: 456,
    requestParams: [],
    responseParams: [
      { name: 'status', type: 'string', description: '系统状态' },
      { name: 'timestamp', type: 'string', description: '检查时间' },
      { name: 'services', type: 'object', description: '各服务状态' }
    ],
    examples: {
      curl: `curl -X GET "http://localhost:3000/api/v1/health"`,
      javascript: `fetch('/api/v1/health');`,
      python: `import requests\n\nresponse = requests.get('http://localhost:3000/api/v1/health')`,
      java: `Request request = new Request.Builder()\n  .url("http://localhost:3000/api/v1/health")\n  .build();`
    }
  },
  {
    id: 'API005',
    name: '文件上传',
    group: 'file',
    method: 'POST',
    path: '/api/v1/files/upload',
    version: 'v1',
    status: 'testing',
    description: '上传文件到服务器',
    creator: '张三',
    maintainer: '李四',
    createTime: '2024-01-14 16:00:00',
    updateTime: '2024-01-15 10:30:00',
    responseTime: 1250,
    requestCount: 2340,
    trend: 'up',
    trendPercent: 25.6,
    lastUsed: '2024-01-15 16:20:00',
    isNew: true,
    tags: ['上传', '文件'],
    totalRequests: 23400,
    successRate: 97.8,
    avgResponseTime: 1180,
    errorCount: 515,
    requestParams: [
      { name: 'file', type: 'file', required: true, description: '要上传的文件' },
      { name: 'folder', type: 'string', required: false, description: '目标文件夹' }
    ],
    responseParams: [
      { name: 'code', type: 'number', description: '响应状态码' },
      { name: 'data', type: 'object', description: '文件信息' },
      { name: 'data.url', type: 'string', description: '文件访问URL' }
    ],
    examples: {
      curl: `curl -X POST "http://localhost:3000/api/v1/files/upload" \\\n  -H "Authorization: Bearer your-token" \\\n  -F "file=@/path/to/file.jpg"`,
      javascript: `const formData = new FormData();\nformData.append('file', fileInput.files[0]);\n\nfetch('/api/v1/files/upload', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer your-token'\n  },\n  body: formData\n});`,
      python: `import requests\n\nfiles = {'file': open('/path/to/file.jpg', 'rb')}\nheaders = {'Authorization': 'Bearer your-token'}\n\nresponse = requests.post('http://localhost:3000/api/v1/files/upload', \n                        files=files, headers=headers)`,
      java: `MultipartBody.Builder builder = new MultipartBody.Builder()\n  .setType(MultipartBody.FORM)\n  .addFormDataPart("file", "file.jpg", \n    RequestBody.create(new File("/path/to/file.jpg"), \n    MediaType.parse("image/jpeg")));`
    }
  }
])

// 表格列定义
const apiColumns = [
  {
    title: 'API名称',
    key: 'name',
    width: 180,
    fixed: 'left'
  },
  {
    title: '方法',
    key: 'method',
    width: 80
  },
  {
    title: 'API路径',
    key: 'path',
    width: 200
  },
  {
    title: '分组',
    key: 'group',
    width: 100
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: 60
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '响应时间',
    key: 'responseTime',
    width: 100
  },
  {
    title: '请求数',
    key: 'requestCount',
    width: 120
  },
  {
    title: '最后使用',
    key: 'lastUsed',
    width: 150
  },
  {
    title: '维护者',
    dataIndex: 'maintainer',
    key: 'maintainer',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// 参数表格列
const paramColumns = [
  {
    title: '参数名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '必填',
    key: 'required'
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description'
  }
]

// 响应参数表格列
const responseColumns = [
  {
    title: '字段名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description'
  }
]

// 计算属性
const filteredApis = computed(() => {
  let result = apis.value
  
  // 分组筛选
  if (filterForm.group) {
    result = result.filter(api => api.group === filterForm.group)
  }
  
  // 方法筛选
  if (filterForm.method) {
    result = result.filter(api => api.method === filterForm.method)
  }
  
  // 状态筛选
  if (filterForm.status) {
    result = result.filter(api => api.status === filterForm.status)
  }
  
  // 版本筛选
  if (filterForm.version) {
    result = result.filter(api => api.version === filterForm.version)
  }
  
  // 关键词筛选
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    result = result.filter(api => 
      api.name.toLowerCase().includes(keyword) ||
      api.path.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// API分组
const apiGroups = computed(() => {
  const groups = [
    { key: 'user', name: '用户管理', apis: [] },
    { key: 'project', name: '项目管理', apis: [] },
    { key: 'system', name: '系统管理', apis: [] },
    { key: 'file', name: '文件管理', apis: [] },
    { key: 'auth', name: '认证授权', apis: [] }
  ]
  
  apis.value.forEach(api => {
    const group = groups.find(g => g.key === api.group)
    if (group) {
      group.apis.push(api)
    }
  })
  
  return groups.filter(group => group.apis.length > 0)
})

// 方法
/**
 * 保存API
 */
const saveApi = async () => {
  try {
    await apiFormRef.value.validate()
    saveLoading.value = true
    
    setTimeout(() => {
      if (isEditMode.value) {
        // 更新API
        const index = apis.value.findIndex(api => api.id === apiForm.id)
        if (index !== -1) {
          Object.assign(apis.value[index], {
            ...apiForm,
            updateTime: new Date().toLocaleString()
          })
        }
        message.success('API更新成功')
      } else {
        // 创建API
        const newApi = {
          ...apiForm,
          id: `API${String(apis.value.length + 1).padStart(3, '0')}`,
          creator: '当前用户',
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          responseTime: Math.floor(Math.random() * 200) + 50,
          requestCount: 0,
          trend: 'stable',
          trendPercent: 0,
          lastUsed: '-',
          isNew: true,
          totalRequests: 0,
          successRate: 100,
          avgResponseTime: 0,
          errorCount: 0,
          requestParams: [],
          responseParams: [],
          examples: {
            curl: '',
            javascript: '',
            python: '',
            java: ''
          }
        }
        apis.value.unshift(newApi)
        apiStats.total++
        apiStats.todayNew++
        message.success('API创建成功')
      }
      
      saveLoading.value = false
      createApiModalVisible.value = false
      resetApiForm()
    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 处理菜单操作
 */
const handleMenuAction = (key: string, api: any) => {
  switch (key) {
    case 'enable':
      api.status = 'active'
      message.success('API已启用')
      break
    case 'disable':
      api.status = 'inactive'
      message.success('API已停用')
      break
    case 'deprecate':
      api.status = 'deprecated'
      message.success('API已废弃')
      break
    case 'logs':
      message.info('查看API日志')
      break
    case 'delete':
      const index = apis.value.findIndex(item => item.id === api.id)
      if (index !== -1) {
        apis.value.splice(index, 1)
        apiStats.total--
        message.success('API删除成功')
      }
      break
  }
}

/**
 * 获取方法颜色
 */
const getMethodColor = (method: string) => {
  const colors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple'
  }
  return colors[method] || 'default'
}

/**
 * 获取分组颜色
 */
const getGroupColor = (group: string) => {
  const colors = {
    user: 'blue',
    project: 'green',
    system: 'orange',
    file: 'purple',
    auth: 'red'
  }
  return colors[group] || 'default'
}

/**
 * 获取分组名称
 */
const getGroupName = (group: string) => {
  const names = {
    user: '用户管理',
    project: '项目管理',
    system: '系统管理',
    file: '文件管理',
    auth: '认证授权'
  }
  return names[group] || group
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    active: 'green',
    inactive: 'default',
    deprecated: 'red',
    testing: 'orange'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态名称
 */
const getStatusName = (status: string) => {
  const names = {
    active: '活跃',
    inactive: '停用',
    deprecated: '已废弃',
    testing: '测试中'
  }
  return names[status] || status
}

/**
 * 获取响应时间样式类
 */
const getResponseTimeClass = (time: number) => {
  if (time < 100) return 'response-time-good'
  if (time < 500) return 'response-time-normal'
  return 'response-time-slow'
}

/**
 * 获取趋势图标
 */
const getTrendIcon = (trend: string) => {
  const icons = {
    up: CaretUpOutlined,
    down: CaretDownOutlined,
    stable: MinusOutlined
  }
  return icons[trend] || MinusOutlined
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime || dateTime === '-') return '-'
  return new Date(dateTime).toLocaleString()
}

/**
 * 过滤用户选项
 */
const filterUserOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.system-api {
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
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-actions h2 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 24px;
  font-weight: 600;
}

.right-actions .ant-space {
  flex-wrap: wrap;
}

/* 统计卡片样式 */
.api-stats {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.stat-icon {
  margin-right: 16px;
}

.total-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.active-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.requests-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.errors-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
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

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

/* API卡片样式 */
.api-card {
  border-radius: 8px;
}

.api-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-link {
  color: #1890ff;
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
}

.api-path {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.response-time-good {
  color: #52c41a;
  font-weight: 500;
}

.response-time-normal {
  color: #faad14;
  font-weight: 500;
}

.response-time-slow {
  color: #ff4d4f;
  font-weight: 500;
}

.request-stats {
  text-align: center;
}

.request-stats .count {
  font-weight: 600;
  margin-bottom: 4px;
}

.request-stats .trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.request-stats .trend.up {
  color: #52c41a;
}

.request-stats .trend.down {
  color: #ff4d4f;
}

.request-stats .trend.stable {
  color: #666;
}

/* API详情样式 */
.api-detail {
  max-height: 600px;
  overflow-y: auto;
}

.params-section h4 {
  margin: 16px 0 8px 0;
  color: #333;
  font-weight: 600;
}

.example-section .code-block {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.test-section .test-result {
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
}

.test-section .result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.test-section .response-time {
  color: #666;
  font-size: 12px;
}

.test-section .result-body {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
}

.stats-section .chart-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 16px;
}

.stats-section .chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 4px;
  color: #999;
}

/* API文档样式 */
.api-docs .docs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.api-docs .docs-header h3 {
  margin: 0;
  color: #333;
}

.group-apis {
  padding: 8px 0;
}

.api-doc-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.api-doc-item .api-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.api-doc-item .api-name {
  font-weight: 500;
  color: #333;
}

.api-doc-item .api-description {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-api {
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .right-actions {
    width: 100%;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 8px;
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

.api-card,
.filter-card,
.stat-card {
  animation: fadeIn 0.3s ease-out;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .system-api {
    background: #141414;
  }
  
  .header-actions,
  .filter-card,
  .api-card {
    background: #1f1f1f;
    border-color: #303030;
  }
  
  .left-actions h2 {
    color: #1890ff;
  }
  
  .stat-title {
    color: #999;
  }
  
  .stat-value {
    color: #fff;
  }
  
  .api-path {
    background: #262626;
    color: #fff;
  }
  
  .example-section .code-block {
    background: #262626;
    color: #fff;
  }
  
  .test-section .test-result {
    background: #262626;
  }
  
  .test-section .result-body {
    background: #1f1f1f;
    color: #fff;
  }
  
  .api-doc-item {
    background: #262626;
    border-color: #303030;
  }
}

/* 打印样式 */
@media print {
  .system-api {
    background: white;
    padding: 0;
  }
  
  .header-actions .right-actions,
  .filter-card,
  .ant-table-pagination {
    display: none;
  }
  
  .api-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>/**
 * 刷新数据
 */
const refreshData = () => {
  loading.value = true
  
  setTimeout(() => {
    // 模拟数据更新
    apiStats.total += Math.floor(Math.random() * 3)
    apiStats.todayNew += Math.floor(Math.random() * 2)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示创建API模态框
 */
const showCreateApiModal = () => {
  isEditMode.value = false
  resetApiForm()
  createApiModalVisible.value = true
}

/**
 * 显示API文档模态框
 */
const showApiDocsModal = () => {
  apiDocsModalVisible.value = true
}

/**
 * 重置API表单
 */
const resetApiForm = () => {
  Object.assign(apiForm, {
    id: null,
    name: '',
    group: 'user',
    method: 'GET',
    version: 'v1',
    status: 'active',
    path: '',
    description: '',
    maintainer: '',
    tags: []
  })
}

/**
 * 处理筛选变化
 */
const handleGroupChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleMethodChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleStatusChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleVersionChange = () => {
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
    group: null,
    method: null,
    status: null,
    version: null,
    keyword: ''
  })
  message.success('筛选条件已重置')
}

/**
 * 批量测试API
 */
const batchTestApis = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要测试的API')
    return
  }
  message.success(`正在测试 ${selectedRowKeys.value.length} 个API`)
}

/**
 * 导出API文档
 */
const exportApiDocs = () => {
  message.success('API文档导出成功')
}

/**
 * 生成Swagger文档
 */
const generateSwagger = () => {
  message.success('Swagger文档生成成功')
}

/**
 * 处理行选择变化
 */
const handleRowSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

/**
 * 显示API详情
 */
const showApiDetail = (api: any) => {
  selectedApi.value = api
  testForm.url = `http://localhost:3000${api.path}`
  apiDetailModalVisible.value = true
}

/**
 * 测试API
 */
const testApi = (api: any) => {
  selectedApi.value = api
  testForm.url = `http://localhost:3000${api.path}`
  detailTab.value = 'test'
  apiDetailModalVisible.value = true
}

/**
 * 执行测试
 */
const executeTest = () => {
  testLoading.value = true
  
  setTimeout(() => {
    testResult.value = {
      status: 200,
      statusText: 'OK',
      responseTime: Math.floor(Math.random() * 200) + 50,
      data: {
        code: 200,
        message: 'success',
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    }
    testLoading.value = false
    message.success('API测试完成')
  }, 1500)
}

/**
 * 编辑API
 */
const editApi = (api: any) => {
  isEditMode.value = true
  Object.assign(apiForm, {
    id: api.id,
    name: api.name,
    group: api.group,
    method: api.method,
    version: api.version,
    status: api.status,
    path: api.path,
    description: api.description,
    maintainer: api.maintainer,
    tags: api.tags || []
  })
  createApiModalVisible.value = true
  apiDetailModalVisible.value = false
}

/**
 * 删除API
 */
const deleteApi = (api: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除API "${api.name}" 吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 模拟删除操作
      const index = apiList.value.findIndex(item => item.id === api.id)
      if (index > -1) {
        apiList.value.splice(index, 1)
        apiStats.total--
        message.success('API删除成功')
      }
      apiDetailModalVisible.value = false
    }
  })
}

/**
 * 批量删除API
 */
const batchDeleteApis = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的API')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个API吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 模拟批量删除操作
      apiList.value = apiList.value.filter(item => !selectedRowKeys.value.includes(item.id))
      apiStats.total -= selectedRowKeys.value.length
      selectedRowKeys.value = []
      message.success(`成功删除 ${selectedRowKeys.value.length} 个API`)
    }
  })
}

/**
 * 启用/禁用API
 */
const toggleApiStatus = (api: any) => {
  const newStatus = api.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  api.status = newStatus
  message.success(`API ${action}成功`)
}

/**
 * 批量启用/禁用API
 */
const batchToggleApiStatus = (status: string) => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要操作的API')
    return
  }
  
  const action = status === 'active' ? '启用' : '禁用'
  
  selectedRowKeys.value.forEach(id => {
    const api = apiList.value.find(item => item.id === id)
    if (api) {
      api.status = status
    }
  })
  
  selectedRowKeys.value = []
  message.success(`成功${action} ${selectedRowKeys.value.length} 个API`)
}

// 生命周期钩子
onMounted(() => {
  refreshData()
})

onUnmounted(() => {
  // 清理定时器等资源
})

/**
 * 复制API
 */
const duplicateApi = (api: any) => {
  isEditMode.value = false
  Object.assign(apiForm, {
    id: null,
    name: `${api.name} (副本)`,
    group: api.group,
    method: api.method,
    version: api.version,
    status: 'testing',
    path: `${api.path}_copy`,
    description: api.description,
    maintainer: api.maintainer,
    tags: api.tags || []
  })
  createApiModalVisible.value = true
  apiDetailModalVisible.value = false
}  loading.value = true
  
  setTimeout(() => {
    // 模拟数据更新
    apiStats.total += Math.floor(Math.random() * 3)
    apiStats.todayNew += Math.floor(Math.random() * 2)
    
    loading.value = false
    message.success('数据刷新成功')
  }, 1000)
}

/**
 * 显示创建API模态框
 */
const showCreateApiModal = () => {
  isEditMode.value = false
  resetApiForm()
  createApiModalVisible.value = true
}

/**
 * 显示API文档模态框
 */
const showApiDocsModal = () => {
  apiDocsModalVisible.value = true
}

/**
 * 重置API表单
 */
const resetApiForm = () => {
  Object.assign(apiForm, {
    id: null,
    name: '',
    group: 'user',
    method: 'GET',
    version: 'v1',
    status: 'active',
    path: '',
    description: '',
    maintainer: '',
    tags: []
  })
}

/**
 * 处理筛选变化
 */
const handleGroupChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleMethodChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleStatusChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleVersionChange = () => {
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
    group: null,
    method: null,
    status: null,
    version: null,
    keyword: ''
  })
  message.success('筛选条件已重置')
}

/**
 * 批量测试API
 */
const batchTestApis = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要测试的API')
    return
  }
  message.success(`正在测试 ${selectedRowKeys.value.length} 个API`)
}

/**
 * 导出API文档
 */
const exportApiDocs = () => {
  message.success('API文档导出成功')
}

/**
 * 生成Swagger文档
 */
const generateSwagger = () => {
  message.success('Swagger文档生成成功')
}

/**
 * 处理行选择变化
 */
const handleRowSelectionChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

/**
 * 显示API详情
 */
const showApiDetail = (api: any) => {
  selectedApi.value = api
  testForm.url = `http://localhost:3000${api.path}`
  apiDetailModalVisible.value = true
}

/**
 * 测试API
 */
const testApi = (api: any) => {
  selectedApi.value = api
  testForm.url = `http://localhost:3000${api.path}`
  detailTab.value = 'test'
  apiDetailModalVisible.value = true
}

/**
 * 执行测试
 */
const executeTest = () => {
  testLoading.value = true
  
  setTimeout(() => {
    testResult.value = {
      status: 200,
      statusText: 'OK',
      responseTime: Math.floor(Math.random() * 200) + 50,
      data: {
        code: 200,
        message: 'success',
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    }
    testLoading.value = false
    message.success('API测试完成')
  }, 1500)
}

/**
 * 编辑API
 */
const editApi = (api: any) => {
  isEditMode.value = true
  Object.assign(apiForm, {
    id: api.id,
    name: api.name,
    group: api.group,
    method: api.method,
    version: api.version,
    status: api.status,
    path: api.path,
    description: api.description,
    maintainer: api.maintainer,
    tags: api.tags || []
  })
  createApiModalVisible.value = true
  apiDetailModalVisible.value = false
}

/**
 * 复制API
 */
const duplicateApi = (api: any) => {
  isEditMode.value = false
  Object.assign(apiForm, {
    id: null,
    name: `${api.name} (副本)`,
    group: api.group,
    method: api.method,
    version: api.version,
    status: 'testing',
    path: `${api.path}_copy`,
    description: api.description,
    maintainer: api.maintainer,
    tags: api.tags || []
  })
  createApiModalVisible.value = true
  apiDetailModalVisible.value = false
}

/**
 *