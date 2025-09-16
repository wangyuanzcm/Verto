<template>
  <div class="requirement-list-view">
    <div class="list-header">
      <div class="header-filters">
        <a-space wrap>
          <a-select
            v-model:value="filters.status"
            placeholder="状态筛选"
            style="width: 120px"
            allowClear
            @change="onFilterChange"
          >
            <a-select-option value="pending">待处理</a-select-option>
            <a-select-option value="in-progress">进行中</a-select-option>
            <a-select-option value="testing">测试中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
          
          <a-select
            v-model:value="filters.priority"
            placeholder="优先级筛选"
            style="width: 120px"
            allowClear
            @change="onFilterChange"
          >
            <a-select-option value="high">
              <a-tag color="red">高</a-tag>
            </a-select-option>
            <a-select-option value="medium">
              <a-tag color="orange">中</a-tag>
            </a-select-option>
            <a-select-option value="low">
              <a-tag color="green">低</a-tag>
            </a-select-option>
          </a-select>
          
          <a-select
            v-model:value="filters.type"
            placeholder="类型筛选"
            style="width: 120px"
            allowClear
            @change="onFilterChange"
          >
            <a-select-option value="feature">功能需求</a-select-option>
            <a-select-option value="enhancement">功能增强</a-select-option>
            <a-select-option value="bugfix">问题修复</a-select-option>
            <a-select-option value="performance">性能优化</a-select-option>
            <a-select-option value="ui">界面优化</a-select-option>
          </a-select>
          
          <a-select
            v-model:value="filters.assignee"
            placeholder="负责人筛选"
            style="width: 140px"
            allowClear
            show-search
            :filter-option="filterOption"
            @change="onFilterChange"
          >
            <a-select-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
            >
              <div class="user-option">
                <a-avatar :size="20" :src="user.avatar">
                  {{ user.name.charAt(0) }}
                </a-avatar>
                <span>{{ user.name }}</span>
              </div>
            </a-select-option>
          </a-select>
          
          <a-range-picker
            v-model:value="filters.dateRange"
            placeholder="创建时间"
            @change="onFilterChange"
          />
          
          <a-button @click="resetFilters">
            <ReloadOutlined />
            重置
          </a-button>
        </a-space>
      </div>
      
      <div class="header-actions">
        <a-space>
          <a-tooltip title="批量操作">
            <a-dropdown :disabled="selectedRowKeys.length === 0">
              <template #overlay>
                <a-menu @click="onBatchAction">
                  <a-menu-item key="assign">
                    <UserOutlined />
                    批量分配
                  </a-menu-item>
                  <a-menu-item key="status">
                    <EditOutlined />
                    批量更新状态
                  </a-menu-item>
                  <a-menu-item key="priority">
                    <FlagOutlined />
                    批量设置优先级
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger>
                    <DeleteOutlined />
                    批量删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                批量操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-tooltip>
          
          <a-button type="primary" @click="createRequirement">
            <PlusOutlined />
            新建需求
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="list-content">
      <a-table
        :columns="columns"
        :data-source="requirementList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 1200 }"
        @change="onTableChange"
        row-key="id"
      >
        <!-- 标题列 -->
        <template #title="{ record }">
          <div class="requirement-title">
            <a @click="viewDetail(record.id)" class="title-link">
              {{ record.title }}
            </a>
            <div class="title-meta">
              <a-tag :color="getTypeColor(record.type)" size="small">
                {{ getTypeLabel(record.type) }}
              </a-tag>
              <span class="requirement-id">#{{ record.id }}</span>
            </div>
          </div>
        </template>
        
        <!-- 状态列 -->
        <template #status="{ record }">
          <a-select
            :value="record.status"
            size="small"
            style="width: 100px"
            @change="(value) => updateStatus(record.id, value)"
          >
            <a-select-option value="pending">
              <a-tag color="default">待处理</a-tag>
            </a-select-option>
            <a-select-option value="in-progress">
              <a-tag color="processing">进行中</a-tag>
            </a-select-option>
            <a-select-option value="testing">
              <a-tag color="warning">测试中</a-tag>
            </a-select-option>
            <a-select-option value="completed">
              <a-tag color="success">已完成</a-tag>
            </a-select-option>
            <a-select-option value="rejected">
              <a-tag color="error">已拒绝</a-tag>
            </a-select-option>
          </a-select>
        </template>
        
        <!-- 优先级列 -->
        <template #priority="{ record }">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityLabel(record.priority) }}
          </a-tag>
        </template>
        
        <!-- 负责人列 -->
        <template #assignee="{ record }">
          <div class="assignee-cell" v-if="record.assignee">
            <a-avatar :size="24" :src="record.assignee.avatar">
              {{ record.assignee.name.charAt(0) }}
            </a-avatar>
            <span class="assignee-name">{{ record.assignee.name }}</span>
          </div>
          <span v-else class="text-placeholder">未分配</span>
        </template>
        
        <!-- 创建时间列 -->
        <template #createdAt="{ record }">
          <div class="date-cell">
            <div>{{ formatDate(record.createdAt) }}</div>
            <div class="date-relative">{{ getRelativeTime(record.createdAt) }}</div>
          </div>
        </template>
        
        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a-tooltip title="查看详情">
              <a-button type="text" size="small" @click="viewDetail(record.id)">
                <EyeOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button type="text" size="small" @click="editRequirement(record.id)">
                <EditOutlined />
              </a-button>
            </a-tooltip>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="({ key }) => onActionClick(key, record)">
                  <a-menu-item key="duplicate">
                    <CopyOutlined />
                    复制需求
                  </a-menu-item>
                  <a-menu-item key="export">
                    <ExportOutlined />
                    导出
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
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  ReloadOutlined,
  UserOutlined,
  EditOutlined,
  FlagOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  EyeOutlined,
  CopyOutlined,
  ExportOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'

// 扩展dayjs
dayjs.extend(relativeTime)

const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(false)

// 筛选条件
const filters = reactive({
  status: undefined,
  priority: undefined,
  type: undefined,
  assignee: undefined,
  dateRange: undefined
})

// 需求列表
const requirementList = ref([])

// 用户列表
const userList = ref([
  { id: '1', name: '张三', avatar: '' },
  { id: '2', name: '李四', avatar: '' },
  { id: '3', name: '王五', avatar: '' },
  { id: '4', name: '赵六', avatar: '' }
])

// 选中的行
const selectedRowKeys = ref<string[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表格列配置
const columns: TableColumnsType = [
  {
    title: '需求标题',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    fixed: 'left',
    slots: { customRender: 'title' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    slots: { customRender: 'status' }
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
    slots: { customRender: 'priority' }
  },
  {
    title: '负责人',
    dataIndex: 'assignee',
    key: 'assignee',
    width: 120,
    slots: { customRender: 'assignee' }
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    slots: { customRender: 'createdAt' },
    sorter: true
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
  onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    console.log('全选:', selected, selectedRows, changeRows)
  }
}))

/**
 * 用户搜索过滤
 */
const filterOption = (input: string, option: any) => {
  return option.children.props.children[1].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    feature: 'blue',
    enhancement: 'green',
    bugfix: 'red',
    performance: 'orange',
    ui: 'purple'
  }
  return colorMap[type] || 'default'
}

/**
 * 获取类型标签
 */
const getTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    feature: '功能需求',
    enhancement: '功能增强',
    bugfix: '问题修复',
    performance: '性能优化',
    ui: '界面优化'
  }
  return labelMap[type] || type
}

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'green'
  }
  return colorMap[priority] || 'default'
}

/**
 * 获取优先级标签
 */
const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[priority] || priority
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 获取相对时间
 */
const getRelativeTime = (date: string) => {
  return dayjs(date).fromNow()
}

/**
 * 筛选条件变化
 */
const onFilterChange = () => {
  pagination.current = 1
  loadRequirements()
}

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key as keyof typeof filters] = undefined
  })
  pagination.current = 1
  loadRequirements()
}

/**
 * 表格变化处理
 */
const onTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  if (pag) {
    pagination.current = pag.current || 1
    pagination.pageSize = pag.pageSize || 20
  }
  loadRequirements()
}

/**
 * 批量操作
 */
const onBatchAction = ({ key }: { key: string }) => {
  console.log('批量操作:', key, selectedRowKeys.value)
  message.info(`批量${key}功能开发中...`)
}

/**
 * 创建需求
 */
const createRequirement = () => {
  router.push('/requirements/new')
}

/**
 * 查看详情
 */
const viewDetail = (id: string) => {
  router.push(`/requirements/${id}`)
}

/**
 * 编辑需求
 */
const editRequirement = (id: string) => {
  router.push(`/requirements/${id}/edit`)
}

/**
 * 更新状态
 */
const updateStatus = async (id: string, status: string) => {
  try {
    // TODO: 调用API更新状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新本地数据
    const item = requirementList.value.find((item: any) => item.id === id)
    if (item) {
      item.status = status
    }
    
    message.success('状态更新成功')
  } catch (error) {
    message.error('状态更新失败')
  }
}

/**
 * 操作点击处理
 */
const onActionClick = (key: string, record: any) => {
  switch (key) {
    case 'duplicate':
      duplicateRequirement(record.id)
      break
    case 'export':
      exportRequirement(record.id)
      break
    case 'delete':
      deleteRequirement(record.id)
      break
  }
}

/**
 * 复制需求
 */
const duplicateRequirement = (id: string) => {
  message.info('复制需求功能开发中...')
}

/**
 * 导出需求
 */
const exportRequirement = (id: string) => {
  message.info('导出需求功能开发中...')
}

/**
 * 删除需求
 */
const deleteRequirement = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个需求吗？此操作不可恢复。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        // TODO: 调用API删除需求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 从列表中移除
        const index = requirementList.value.findIndex((item: any) => item.id === id)
        if (index > -1) {
          requirementList.value.splice(index, 1)
          pagination.total--
        }
        
        message.success('需求删除成功')
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

/**
 * 加载需求列表
 */
const loadRequirements = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取需求列表
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = Array.from({ length: 50 }, (_, index) => ({
      id: `REQ-${String(index + 1).padStart(3, '0')}`,
      title: `需求标题 ${index + 1}`,
      type: ['feature', 'enhancement', 'bugfix', 'performance', 'ui'][index % 5],
      status: ['pending', 'in-progress', 'testing', 'completed', 'rejected'][index % 5],
      priority: ['high', 'medium', 'low'][index % 3],
      assignee: index % 3 === 0 ? null : userList.value[index % userList.value.length],
      createdAt: dayjs().subtract(index, 'day').toISOString(),
      description: `这是需求 ${index + 1} 的描述信息...`
    }))
    
    requirementList.value = mockData.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    )
    pagination.total = mockData.length
  } catch (error) {
    message.error('加载需求列表失败')
  } finally {
    loading.value = false
  }
}

// 监听路由查询参数变化
watch(
  () => route.query,
  (query) => {
    // 同步筛选条件
    Object.keys(filters).forEach(key => {
      filters[key as keyof typeof filters] = query[key] as any
    })
    loadRequirements()
  },
  { immediate: true }
)

onMounted(() => {
  loadRequirements()
})
</script>

<style scoped>
.requirement-list-view {
  padding: 24px;
}

.list-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.header-filters {
  flex: 1;
}

.header-actions {
  flex-shrink: 0;
}

.list-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.requirement-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-link {
  font-weight: 500;
  color: #1890ff;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirement-id {
  font-size: 12px;
  color: #8c8c8c;
  font-family: 'Monaco', 'Menlo', monospace;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-name {
  font-size: 14px;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-relative {
  font-size: 12px;
  color: #8c8c8c;
}

.text-placeholder {
  color: #bfbfbf;
  font-style: italic;
}

@media (max-width: 1200px) {
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .requirement-list-view {
    padding: 16px;
  }
  
  .header-filters :deep(.ant-space) {
    flex-wrap: wrap;
  }
  
  .header-filters :deep(.ant-space-item) {
    margin-bottom: 8px;
  }
}
</style>