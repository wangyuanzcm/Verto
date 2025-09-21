<template>
  <div class="project-deployment">
    <a-card title="部署配置" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAddDeployment">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          新增配置
        </a-button>
      </template>

      <a-table
        :columns="columns"
        :data-source="deploymentList"
        :loading="loading"
        :pagination="false"
        size="small"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #action="{ record }">
          <a-space>
            <a-button
              type="primary"
              size="small"
              @click="handleDeploy(record)"
              :loading="record.deploying"
            >
              部署
            </a-button>
            <a @click="handleEdit(record)">编辑</a>
            <a @click="handleDelete(record)" style="color: #ff4d4f;">删除</a>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 部署历史 -->
    <a-card title="部署历史" :bordered="false" style="margin-top: 16px;">
      <a-timeline>
        <a-timeline-item
          v-for="history in deploymentHistory"
          :key="history.id"
          :color="getHistoryColor(history.status)"
        >
          <div class="history-item">
            <div class="history-header">
              <span class="environment">{{ history.environment }}</span>
              <span class="status">{{ getStatusText(history.status) }}</span>
              <span class="time">{{ history.deployTime }}</span>
            </div>
            <div class="history-content">
              <div>版本：{{ history.version }}</div>
              <div>操作人：{{ history.operator }}</div>
              <div v-if="history.message">备注：{{ history.message }}</div>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();

  const loading = ref(false);
  const deploymentList = ref([]);
  const deploymentHistory = ref([]);

  const columns = [
    {
      title: '环境名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '环境类型',
      dataIndex: 'environment',
      width: 100,
    },
    {
      title: '服务器地址',
      dataIndex: 'serverUrl',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      slots: { customRender: 'status' },
    },
    {
      title: '最后部署时间',
      dataIndex: 'lastDeployTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
      slots: { customRender: 'action' },
    },
  ];

  /**
   * 加载部署配置
   */
  async function loadDeployments() {
    loading.value = true;
    // 模拟数据
    setTimeout(() => {
      deploymentList.value = [
        {
          id: '1',
          name: '开发环境',
          environment: 'dev',
          serverUrl: 'https://dev.example.com',
          status: 'success',
          lastDeployTime: '2024-01-01 10:00:00',
          deploying: false,
        },
        {
          id: '2',
          name: '测试环境',
          environment: 'test',
          serverUrl: 'https://test.example.com',
          status: 'failed',
          lastDeployTime: '2024-01-02 14:30:00',
          deploying: false,
        },
      ];

      deploymentHistory.value = [
        {
          id: '1',
          environment: '生产环境',
          status: 'success',
          version: 'v1.2.0',
          operator: '张三',
          deployTime: '2024-01-01 10:00:00',
          message: '修复登录bug',
        },
        {
          id: '2',
          environment: '测试环境',
          status: 'failed',
          version: 'v1.1.9',
          operator: '李四',
          deployTime: '2024-01-02 14:30:00',
          message: '部署失败，服务器连接超时',
        },
      ];

      loading.value = false;
    }, 1000);
  }

  /**
   * 新增部署配置
   */
  function handleAddDeployment() {
    console.log('新增部署配置');
  }

  /**
   * 编辑部署配置
   */
  function handleEdit(record: any) {
    console.log('编辑部署配置:', record);
  }

  /**
   * 删除部署配置
   */
  function handleDelete(record: any) {
    console.log('删除部署配置:', record);
  }

  /**
   * 执行部署
   */
  function handleDeploy(record: any) {
    record.deploying = true;
    console.log('执行部署:', record);
    
    // 模拟部署过程
    setTimeout(() => {
      record.deploying = false;
      record.status = 'success';
      record.lastDeployTime = new Date().toLocaleString();
    }, 3000);
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string) {
    const colorMap = {
      success: 'success',
      failed: 'error',
      deploying: 'processing',
      pending: 'warning',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string) {
    const textMap = {
      success: '成功',
      failed: '失败',
      deploying: '部署中',
      pending: '待部署',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取历史记录颜色
   */
  function getHistoryColor(status: string) {
    const colorMap = {
      success: 'green',
      failed: 'red',
      deploying: 'blue',
      pending: 'orange',
    };
    return colorMap[status] || 'gray';
  }

  onMounted(() => {
    loadDeployments();
  });
</script>

<style lang="less" scoped>
  .project-deployment {
    .history-item {
      .history-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .environment {
          font-weight: 600;
        }

        .status {
          font-size: 12px;
        }

        .time {
          font-size: 12px;
          color: #666;
        }
      }

      .history-content {
        font-size: 12px;
        color: #666;
        line-height: 1.5;
      }
    }
  }
</style>