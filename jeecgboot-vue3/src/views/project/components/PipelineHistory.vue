<template>
  <div class="pipeline-history">
    <a-card title="流水线历史" :bordered="false">
      <template #extra>
        <a-space>
          <a-select
            v-model:value="historyFilters.status"
            placeholder="状态筛选"
            style="width: 120px"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
            <a-select-option value="running">运行中</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
          <a-select
            v-model:value="historyFilters.branch"
            placeholder="分支筛选"
            style="width: 120px"
            allow-clear
            @change="handleFilterChange"
          >
            <a-select-option value="main">main</a-select-option>
            <a-select-option value="develop">develop</a-select-option>
            <a-select-option value="feature">feature</a-select-option>
          </a-select>
          <a-range-picker
            v-model:value="historyFilters.dateRange"
            style="width: 240px"
            @change="handleFilterChange"
          />
          <a-button @click="handleRefresh">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- 历史记录表格 -->
      <a-table
        :columns="historyColumns"
        :data-source="filteredHistory"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- 构建号列 -->
        <template #buildNumber="{ record }">
          <a-button type="link" @click="handleViewDetails(record)">
            #{{ record.buildNumber }}
          </a-button>
        </template>

        <!-- 状态列 -->
        <template #status="{ record }">
          <a-tag :color="getBuildStatusColor(record.status)">
            {{ getBuildStatusText(record.status) }}
          </a-tag>
        </template>

        <!-- 分支列 -->
        <template #branch="{ record }">
          <a-tag color="blue">
            <template #icon>
              <ApartmentOutlined />
            </template>
            {{ record.branch }}
          </a-tag>
        </template>

        <!-- 提交信息列 -->
        <template #commit="{ record }">
          <div class="commit-info">
            <div class="commit-id">
              <a-typography-text code copyable>
                {{ record.commitId?.substring(0, 8) }}
              </a-typography-text>
            </div>
            <div class="commit-message">
              <a-tooltip :title="record.commitMessage">
                <span class="commit-text">{{ record.commitMessage }}</span>
              </a-tooltip>
            </div>
          </div>
        </template>

        <!-- 触发人列 -->
        <template #triggeredBy="{ record }">
          <div class="trigger-info">
            <a-avatar size="small" :src="record.avatar">
              {{ record.triggeredBy?.charAt(0).toUpperCase() }}
            </a-avatar>
            <span class="trigger-name">{{ record.triggeredBy }}</span>
          </div>
        </template>

        <!-- 时长列 -->
        <template #duration="{ record }">
          <span v-if="record.duration">
            {{ formatDuration(record.duration) }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <!-- 开始时间列 -->
        <template #startTime="{ record }">
          <div class="time-info">
            <div class="time-primary">{{ formatTime(record.startTime) }}</div>
            <div class="time-relative">{{ getRelativeTime(record.startTime) }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #actions="{ record }">
          <a-space>
            <a-tooltip title="查看详情">
              <a-button 
                type="text" 
                size="small"
                @click="handleViewDetails(record)"
              >
                详情
              </a-button>
            </a-tooltip>
            
            <a-tooltip title="重新构建">
              <a-button 
                type="text" 
                size="small"
                :disabled="record.status === 'running'"
                @click="handleRetryBuild(record)"
              >
                重试
              </a-button>
            </a-tooltip>
            
            <a-tooltip title="下载日志">
              <a-button 
                type="text" 
                size="small"
                @click="handleDownloadLogs(record)"
              >
                日志
              </a-button>
            </a-tooltip>
            
            <a-dropdown :trigger="['click']">
              <a-button type="text" size="small">
                更多
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item 
                    key="cancel" 
                    :disabled="record.status !== 'running'"
                    @click="handleCancelBuild(record)"
                  >
                    取消构建
                  </a-menu-item>
                  <a-menu-item key="compare" @click="handleCompareBuild(record)">
                    对比构建
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item 
                    key="delete" 
                    danger
                    @click="handleDeleteBuild(record)"
                  >
                    删除记录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </template>
      </a-table>

      <!-- 批量操作 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions">
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 项`"
          type="info"
          show-icon
          closable
          @close="clearSelection"
        >
          <template #action>
            <a-space>
              <a-button size="small" @click="handleBatchDownload">
                批量下载日志
              </a-button>
              <a-button size="small" danger @click="handleBatchDelete">
                批量删除
              </a-button>
            </a-space>
          </template>
        </a-alert>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ReloadOutlined,
  ApartmentOutlined,
  EyeOutlined,
  DownloadOutlined,
  MoreOutlined,
  StopOutlined,
  DiffOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import type { PipelineBuild } from '../types/pipeline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 扩展dayjs插件
dayjs.extend(relativeTime);

// Props定义
interface Props {
  pipelineHistory: PipelineBuild[];
  loading?: boolean;
}

// Emits定义
interface Emits {
  (e: 'refresh'): void;
  (e: 'viewDetails', build: PipelineBuild): void;
  (e: 'retryBuild', build: PipelineBuild): void;
  (e: 'cancelBuild', build: PipelineBuild): void;
  (e: 'deleteBuild', build: PipelineBuild): void;
  (e: 'downloadLogs', build: PipelineBuild): void;
  (e: 'compareBuild', build: PipelineBuild): void;
  (e: 'batchDownload', builds: PipelineBuild[]): void;
  (e: 'batchDelete', builds: PipelineBuild[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

// 响应式数据
const selectedRowKeys = ref<string[]>([]);
const historyFilters = ref({
  status: undefined as string | undefined,
  branch: undefined as string | undefined,
  dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined
});

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
});

// 表格列定义
const historyColumns: TableColumnsType = [
  {
    title: '构建号',
    dataIndex: 'buildNumber',
    key: 'buildNumber',
    width: 100,
    slots: { customRender: 'buildNumber' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' }
  },
  {
    title: '分支',
    dataIndex: 'branch',
    key: 'branch',
    width: 120,
    slots: { customRender: 'branch' }
  },
  {
    title: '提交信息',
    dataIndex: 'commit',
    key: 'commit',
    width: 300,
    slots: { customRender: 'commit' }
  },
  {
    title: '触发人',
    dataIndex: 'triggeredBy',
    key: 'triggeredBy',
    width: 120,
    slots: { customRender: 'triggeredBy' }
  },
  {
    title: '时长',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
    slots: { customRender: 'duration' }
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 180,
    slots: { customRender: 'startTime' }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    slots: { customRender: 'actions' }
  }
];

// 计算属性
const filteredHistory = computed(() => {
  let filtered = [...props.pipelineHistory];
  
  // 状态筛选
  if (historyFilters.value.status) {
    filtered = filtered.filter(item => item.status === historyFilters.value.status);
  }
  
  // 分支筛选
  if (historyFilters.value.branch) {
    filtered = filtered.filter(item => item.branch === historyFilters.value.branch);
  }
  
  // 日期范围筛选
  if (historyFilters.value.dateRange) {
    const [start, end] = historyFilters.value.dateRange;
    filtered = filtered.filter(item => {
      const itemDate = dayjs(item.startTime);
      return itemDate.isAfter(start) && itemDate.isBefore(end);
    });
  }
  
  return filtered;
});

// 监听筛选结果更新分页总数
watch(filteredHistory, (newData) => {
  pagination.value.total = newData.length;
}, { immediate: true });

// 事件处理方法
/**
 * 处理筛选变更
 */
const handleFilterChange = () => {
  pagination.value.current = 1; // 重置到第一页
};

/**
 * 处理刷新
 */
const handleRefresh = () => {
  emit('refresh');
};

/**
 * 处理表格变更（分页、排序等）
 */
const handleTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  if (pag) {
    pagination.value.current = pag.current || 1;
    pagination.value.pageSize = pag.pageSize || 10;
  }
};

/**
 * 查看构建详情
 */
const handleViewDetails = (build: PipelineBuild) => {
  emit('viewDetails', build);
};

/**
 * 重新构建
 */
const handleRetryBuild = (build: PipelineBuild) => {
  emit('retryBuild', build);
};

/**
 * 取消构建
 */
const handleCancelBuild = (build: PipelineBuild) => {
  emit('cancelBuild', build);
};

/**
 * 删除构建记录
 */
const handleDeleteBuild = (build: PipelineBuild) => {
  emit('deleteBuild', build);
};

/**
 * 下载日志
 */
const handleDownloadLogs = (build: PipelineBuild) => {
  emit('downloadLogs', build);
};

/**
 * 对比构建
 */
const handleCompareBuild = (build: PipelineBuild) => {
  emit('compareBuild', build);
};

/**
 * 批量下载日志
 */
const handleBatchDownload = () => {
  const selectedBuilds = props.pipelineHistory.filter(
    build => selectedRowKeys.value.includes(build.id)
  );
  emit('batchDownload', selectedBuilds);
};

/**
 * 批量删除
 */
const handleBatchDelete = () => {
  const selectedBuilds = props.pipelineHistory.filter(
    build => selectedRowKeys.value.includes(build.id)
  );
  emit('batchDelete', selectedBuilds);
};

/**
 * 清除选择
 */
const clearSelection = () => {
  selectedRowKeys.value = [];
};

// 工具方法
/**
 * 获取构建状态颜色
 */
const getBuildStatusColor = (status: string) => {
  const colorMap = {
    'pending': 'default',
    'running': 'processing',
    'success': 'success',
    'failed': 'error',
    'cancelled': 'warning'
  };
  return colorMap[status] || 'default';
};

/**
 * 获取构建状态文本
 */
const getBuildStatusText = (status: string) => {
  const textMap = {
    'pending': '等待中',
    'running': '运行中',
    'success': '成功',
    'failed': '失败',
    'cancelled': '已取消'
  };
  return textMap[status] || status;
};

/**
 * 格式化时长
 */
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 获取相对时间
 */
const getRelativeTime = (time: string) => {
  return dayjs(time).fromNow();
};

// 表格行选择配置
const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  }
};
</script>

<style lang="less" scoped>
.pipeline-history {
  .commit-info {
    .commit-id {
      margin-bottom: 4px;
    }
    
    .commit-message {
      .commit-text {
        display: inline-block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        color: #666;
      }
    }
  }
  
  .trigger-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .trigger-name {
      font-size: 12px;
    }
  }
  
  .time-info {
    .time-primary {
      font-size: 13px;
      color: #2c3e50;
    }
    
    .time-relative {
      font-size: 11px;
      color: #999;
      margin-top: 2px;
    }
  }
  
  .text-muted {
    color: #999;
  }
  
  .batch-actions {
    margin-top: 16px;
  }
  
  // 表格样式优化
  :deep(.ant-table) {
    .ant-table-tbody > tr:hover > td {
      background-color: #f5f7fa;
    }
    
    .ant-table-thead > tr > th {
      background-color: #fafbfc;
      border-bottom: 1px solid #e8eaec;
      font-weight: 600;
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    :deep(.ant-table) {
      .ant-table-thead > tr > th,
      .ant-table-tbody > tr > td {
        padding: 8px 4px;
        font-size: 12px;
      }
    }
    
    .commit-info .commit-text {
      max-width: 100px;
    }
  }
}
</style>