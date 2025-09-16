<template>
  <div class="prototype-list">
    <!-- 筛选栏 -->
    <a-card class="filter-card">
      <a-form layout="inline" :model="filters" @finish="handleSearch">
        <a-form-item label="原型名称" name="name">
          <a-input
            v-model:value="filters.name"
            placeholder="请输入原型名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select
            v-model:value="filters.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="designing">设计中</a-select-option>
            <a-select-option value="reviewing">评审中</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="创建人" name="creator">
          <a-select
            v-model:value="filters.creator"
            placeholder="请选择创建人"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="1">张三</a-select-option>
            <a-select-option value="2">李四</a-select-option>
            <a-select-option value="3">王五</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
          <a-button @click="handleReset" style="margin-left: 8px">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作栏 -->
    <a-card class="action-card">
      <div class="action-bar">
        <div class="action-left">
          <a-button type="primary" @click="handleCreate">
            <template #icon>
              <PlusOutlined />
            </template>
            新建原型
          </a-button>
          <a-button @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
            <template #icon>
              <DeleteOutlined />
            </template>
            批量删除
          </a-button>
        </div>
        <div class="action-right">
          <a-button @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            导出
          </a-button>
          <a-button @click="handleRefresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 原型列表 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="prototype-info">
              <div class="prototype-thumbnail">
                <img v-if="record.thumbnail" :src="record.thumbnail" :alt="record.name" />
                <div v-else class="thumbnail-placeholder">
                  <FileImageOutlined />
                </div>
              </div>
              <div class="prototype-details">
                <a @click="handleView(record)" class="prototype-name">{{ record.name }}</a>
                <div class="prototype-description">{{ record.description }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'creator'">
            <div class="user-info">
              <a-avatar :size="32" :src="record.creator.avatar" />
              <span class="user-name">{{ record.creator.name }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ formatDate(record.updatedAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleCopy(record)">
                复制
              </a-button>
              <a-popconfirm
                title="确定要删除这个原型吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  FileImageOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])

const filters = reactive({
  name: '',
  status: undefined,
  creator: undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`
})

// 表格列定义
const columns = [
  {
    title: '原型名称',
    key: 'name',
    width: 300
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '创建人',
    key: 'creator',
    width: 120
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 150
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 模拟数据
const dataSource = ref([
  {
    id: '1',
    name: '用户登录页面原型',
    description: '包含用户名密码登录、手机号登录、第三方登录等功能',
    status: 'designing',
    thumbnail: 'https://via.placeholder.com/60x40',
    creator: {
      id: '1',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z'
  },
  {
    id: '2',
    name: '商品列表页面原型',
    description: '展示商品列表、筛选、排序、分页等功能',
    status: 'approved',
    thumbnail: null,
    creator: {
      id: '2',
      name: '李四',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2'
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  }
])

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  }
}

// 方法
/**
 * 处理搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

/**
 * 处理重置
 */
const handleReset = () => {
  Object.assign(filters, {
    name: '',
    status: undefined,
    creator: undefined
  })
  pagination.current = 1
  loadData()
}

/**
 * 处理新建
 */
const handleCreate = () => {
  router.push('/prototype/new')
}

/**
 * 处理批量删除
 */
const handleBatchDelete = () => {
  message.info('批量删除功能开发中...')
}

/**
 * 处理导出
 */
const handleExport = () => {
  message.info('导出功能开发中...')
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  loadData()
}

/**
 * 处理查看
 */
const handleView = (record: any) => {
  router.push(`/prototype/${record.id}`)
}

/**
 * 处理编辑
 */
const handleEdit = (record: any) => {
  router.push(`/prototype/${record.id}/editor`)
}

/**
 * 处理复制
 */
const handleCopy = (record: any) => {
  message.info('复制功能开发中...')
}

/**
 * 处理删除
 */
const handleDelete = (record: any) => {
  message.success('删除成功')
  loadData()
}

/**
 * 处理表格变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'default',
    designing: 'processing',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'error'
  }
  return colors[status as keyof typeof colors] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    designing: '设计中',
    reviewing: '评审中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status as keyof typeof texts] || status
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // const response = await api.getPrototypes({
    //   ...filters,
    //   page: pagination.current,
    //   pageSize: pagination.pageSize
    // })
    // dataSource.value = response.data.list
    // pagination.total = response.data.total
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = dataSource.value.length
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.prototype-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card,
.action-card,
.table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left,
.action-right {
  display: flex;
  gap: 12px;
}

.prototype-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prototype-thumbnail {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prototype-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  color: #bfbfbf;
  font-size: 16px;
}

.prototype-details {
  flex: 1;
}

.prototype-name {
  font-weight: 500;
  color: #1890ff;
  text-decoration: none;
}

.prototype-name:hover {
  text-decoration: underline;
}

.prototype-description {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-left,
  .action-right {
    justify-content: center;
  }
}
</style>