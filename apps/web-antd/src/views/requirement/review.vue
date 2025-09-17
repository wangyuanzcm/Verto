<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">需求评审</h1>
          <p class="mt-1 text-sm text-gray-500">对需求进行评审和审批</p>
        </div>
        <div class="flex space-x-3">
          <a-button type="primary" @click="handleBatchReview">
            <template #icon>
              <Icon icon="lucide:check-circle" />
            </template>
            批量评审
          </a-button>
          <a-button @click="handleExport">
            <template #icon>
              <Icon icon="lucide:download" />
            </template>
            导出报告
          </a-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="mb-6 rounded-lg bg-white p-4 shadow">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="评审状态">
          <a-select
            v-model:value="searchForm.reviewStatus"
            placeholder="请选择评审状态"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="pending">待评审</a-select-option>
            <a-select-option value="reviewing">评审中</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级">
          <a-select
            v-model:value="searchForm.priority"
            placeholder="请选择优先级"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="low">低</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="评审人">
          <a-select
            v-model:value="searchForm.reviewer"
            placeholder="请选择评审人"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="user1">张三</a-select-option>
            <a-select-option value="user2">李四</a-select-option>
            <a-select-option value="user3">王五</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <Icon icon="lucide:search" />
            </template>
            搜索
          </a-button>
          <a-button class="ml-2" @click="handleReset"> 重置 </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 需求列表 -->
    <div class="rounded-lg bg-white shadow">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a
              @click="handleViewDetail(record)"
              class="text-blue-600 hover:text-blue-800"
            >
              {{ record.title }}
            </a>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'reviewStatus'">
            <a-tag :color="getReviewStatusColor(record.reviewStatus)">
              {{ getReviewStatusText(record.reviewStatus) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.reviewStatus === 'pending'"
                type="primary"
                size="small"
                @click="handleReview(record)"
              >
                评审
              </a-button>
              <a-button size="small" @click="handleViewDetail(record)">
                查看
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }) => handleMenuClick(key, record)">
                    <a-menu-item key="history">评审历史</a-menu-item>
                    <a-menu-item key="comment">添加评论</a-menu-item>
                    <a-menu-item key="assign">分配评审人</a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small">
                  更多
                  <Icon icon="lucide:chevron-down" />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 评审弹窗 -->
    <a-modal
      v-model:open="reviewModalVisible"
      title="需求评审"
      width="800px"
      @ok="handleReviewSubmit"
      @cancel="handleReviewCancel"
    >
      <div v-if="currentRecord">
        <div class="mb-4">
          <h3 class="mb-2 text-lg font-medium">{{ currentRecord.title }}</h3>
          <p class="text-gray-600">{{ currentRecord.description }}</p>
        </div>

        <a-form :model="reviewForm" layout="vertical">
          <a-form-item label="评审结果" required>
            <a-radio-group v-model:value="reviewForm.result">
              <a-radio value="approved">通过</a-radio>
              <a-radio value="rejected">拒绝</a-radio>
              <a-radio value="needsRevision">需要修改</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="评审意见" required>
            <a-textarea
              v-model:value="reviewForm.comment"
              placeholder="请输入评审意见"
              :rows="4"
            />
          </a-form-item>

          <a-form-item label="下一步操作">
            <a-select
              v-model:value="reviewForm.nextAction"
              placeholder="请选择下一步操作"
            >
              <a-select-option value="development">进入开发</a-select-option>
              <a-select-option value="design">UI设计</a-select-option>
              <a-select-option value="revision">需求修改</a-select-option>
              <a-select-option value="archive">归档</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 批量评审弹窗 -->
    <a-modal
      v-model:open="batchReviewModalVisible"
      title="批量评审"
      @ok="handleBatchReviewSubmit"
      @cancel="batchReviewModalVisible = false"
    >
      <div class="mb-4">
        <p>已选择 {{ selectedRowKeys.length }} 个需求进行批量评审</p>
      </div>

      <a-form :model="batchReviewForm" layout="vertical">
        <a-form-item label="评审结果" required>
          <a-radio-group v-model:value="batchReviewForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="评审意见" required>
          <a-textarea
            v-model:value="batchReviewForm.comment"
            placeholder="请输入评审意见"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { VbenIcon } from '@vben/common-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const dataSource = ref([]);
const selectedRowKeys = ref([]);
const reviewModalVisible = ref(false);
const batchReviewModalVisible = ref(false);
const currentRecord = ref(null);

// 搜索表单
const searchForm = reactive({
  reviewStatus: undefined,
  priority: undefined,
  reviewer: undefined,
});

// 评审表单
const reviewForm = reactive({
  result: '',
  comment: '',
  nextAction: '',
});

// 批量评审表单
const batchReviewForm = reactive({
  result: '',
  comment: '',
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 表格列配置
const columns = [
  {
    title: '需求标题',
    dataIndex: 'title',
    key: 'title',
    width: 200,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
  },
  {
    title: '评审状态',
    dataIndex: 'reviewStatus',
    key: 'reviewStatus',
    width: 120,
  },
  {
    title: '提交人',
    dataIndex: 'submitter',
    key: 'submitter',
    width: 100,
  },
  {
    title: '评审人',
    dataIndex: 'reviewer',
    key: 'reviewer',
    width: 100,
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
    width: 150,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
];

// 行选择配置
const rowSelection = {
  selectedRowKeys,
  onChange: (keys: any[]) => {
    selectedRowKeys.value = keys;
  },
};

/**
 * 获取优先级颜色
 */
const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'green',
  };
  return colors[priority] || 'default';
};

/**
 * 获取优先级文本
 */
const getPriorityText = (priority: string) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return texts[priority] || priority;
};

/**
 * 获取评审状态颜色
 */
const getReviewStatusColor = (status: string) => {
  const colors = {
    pending: 'orange',
    reviewing: 'blue',
    approved: 'green',
    rejected: 'red',
  };
  return colors[status] || 'default';
};

/**
 * 获取评审状态文本
 */
const getReviewStatusText = (status: string) => {
  const texts = {
    pending: '待评审',
    reviewing: '评审中',
    approved: '已通过',
    rejected: '已拒绝',
  };
  return texts[status] || status;
};

/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟数据
    const mockData = [
      {
        id: '1',
        title: '用户登录功能优化',
        priority: 'high',
        reviewStatus: 'pending',
        submitter: '张三',
        reviewer: '李四',
        submitTime: '2024-01-15 10:30:00',
        description: '优化用户登录流程，提升用户体验',
      },
      {
        id: '2',
        title: '数据导出功能',
        priority: 'medium',
        reviewStatus: 'reviewing',
        submitter: '王五',
        reviewer: '赵六',
        submitTime: '2024-01-14 14:20:00',
        description: '支持多种格式的数据导出',
      },
      {
        id: '3',
        title: '移动端适配',
        priority: 'low',
        reviewStatus: 'approved',
        submitter: '刘七',
        reviewer: '陈八',
        submitTime: '2024-01-13 09:15:00',
        description: '优化移动端显示效果',
      },
    ];

    dataSource.value = mockData;
    pagination.total = mockData.length;
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索处理
 */
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, {
    reviewStatus: undefined,
    priority: undefined,
    reviewer: undefined,
  });
  handleSearch();
};

/**
 * 表格变化处理
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
};

/**
 * 查看详情
 */
const handleViewDetail = (record: any) => {
  router.push(`/requirement/detail/${record.id}`);
};

/**
 * 评审处理
 */
const handleReview = (record: any) => {
  currentRecord.value = record;
  reviewModalVisible.value = true;
  // 重置表单
  Object.assign(reviewForm, {
    result: '',
    comment: '',
    nextAction: '',
  });
};

/**
 * 评审提交
 */
const handleReviewSubmit = async () => {
  if (!reviewForm.result || !reviewForm.comment) {
    message.error('请填写完整的评审信息');
    return;
  }

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success('评审提交成功');
    reviewModalVisible.value = false;
    loadData();
  } catch (error) {
    message.error('评审提交失败');
  }
};

/**
 * 评审取消
 */
const handleReviewCancel = () => {
  reviewModalVisible.value = false;
  currentRecord.value = null;
};

/**
 * 批量评审
 */
const handleBatchReview = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要评审的需求');
    return;
  }
  batchReviewModalVisible.value = true;
  // 重置表单
  Object.assign(batchReviewForm, {
    result: '',
    comment: '',
  });
};

/**
 * 批量评审提交
 */
const handleBatchReviewSubmit = async () => {
  if (!batchReviewForm.result || !batchReviewForm.comment) {
    message.error('请填写完整的评审信息');
    return;
  }

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success(`成功评审 ${selectedRowKeys.value.length} 个需求`);
    batchReviewModalVisible.value = false;
    selectedRowKeys.value = [];
    loadData();
  } catch (error) {
    message.error('批量评审失败');
  }
};

/**
 * 导出报告
 */
const handleExport = () => {
  message.success('导出功能开发中');
};

/**
 * 菜单点击处理
 */
const handleMenuClick = (key: string, record: any) => {
  switch (key) {
    case 'history':
      message.info('查看评审历史');
      break;
    case 'comment':
      message.info('添加评论');
      break;
    case 'assign':
      message.info('分配评审人');
      break;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.ant-table {
  background: white;
}
</style>
