<template>
  <div class="pipeline-manager">
    <!-- 流水线概览 -->
    <div class="pipeline-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总流水线"
              :value="pipelineStats.total"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <Icon icon="ant-design:build-outlined" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="运行中"
              :value="pipelineStats.running"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <Icon icon="ant-design:play-circle-outlined" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="成功率"
              :value="pipelineStats.successRate"
              suffix="%"
              :value-style="{ color: pipelineStats.successRate >= 90 ? '#52c41a' : '#ff4d4f' }"
            >
              <template #prefix>
                <Icon icon="ant-design:check-circle-outlined" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="平均耗时"
              :value="pipelineStats.avgDuration"
              suffix="分钟"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <Icon icon="ant-design:clock-circle-outlined" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 流水线列表 -->
    <div class="pipeline-list">
      <a-card title="流水线列表" :bordered="false">
        <template #extra>
          <a-space>
            <a-button type="primary" @click="handleCreatePipeline">
              <template #icon>
                <Icon icon="ant-design:plus-outlined" />
              </template>
              创建流水线
            </a-button>
            <a-button @click="handleRefresh">
              <template #icon>
                <Icon icon="ant-design:reload-outlined" />
              </template>
              刷新
            </a-button>
          </a-space>
        </template>

        <a-table 
          :columns="pipelineColumns" 
          :data-source="pipelineList"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="pipeline-name">
                <Icon :icon="getPipelineIcon(record.type)" class="pipeline-icon" />
                <span>{{ record.name }}</span>
              </div>
            </template>
            
            <template v-if="column.key === 'status'">
              <a-tag :color="getPipelineStatusColor(record.status)">
                <Icon :icon="getPipelineStatusIcon(record.status)" />
                {{ getPipelineStatusText(record.status) }}
              </a-tag>
            </template>
            
            <template v-if="column.key === 'environment'">
              <a-tag>{{ record.environment }}</a-tag>
            </template>
            
            <template v-if="column.key === 'lastRun'">
              <div v-if="record.lastRun">
                <div>{{ formatTime(record.lastRun.time) }}</div>
                <div class="last-run-info">
                  <a-tag size="small" :color="getRunStatusColor(record.lastRun.status)">
                    {{ getRunStatusText(record.lastRun.status) }}
                  </a-tag>
                  <span class="duration">{{ record.lastRun.duration }}</span>
                </div>
              </div>
              <span v-else class="text-gray">从未运行</span>
            </template>
            
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button 
                  type="link" 
                  size="small" 
                  @click="handleRunPipeline(record)"
                  :disabled="record.status === 'running'"
                >
                  <Icon icon="ant-design:play-circle-outlined" />
                  运行
                </a-button>
                <a-button type="link" size="small" @click="handleViewPipeline(record)">
                  <Icon icon="ant-design:eye-outlined" />
                  查看
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="handleEditPipeline(record)">
                        <Icon icon="ant-design:edit-outlined" />
                        编辑
                      </a-menu-item>
                      <a-menu-item @click="handleClonePipeline(record)">
                        <Icon icon="ant-design:copy-outlined" />
                        克隆
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item @click="handleDeletePipeline(record)" class="text-red">
                        <Icon icon="ant-design:delete-outlined" />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="link" size="small">
                    <Icon icon="ant-design:more-outlined" />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 流水线详情弹窗 -->
    <BasicModal 
      v-bind="$attrs" 
      @register="registerDetailModal" 
      title="流水线详情" 
      :width="1200"
      :min-height="600"
      :footer="null"
    >
      <PipelineDetail 
        v-if="currentPipeline"
        :pipeline="currentPipeline"
        @refresh="handleRefresh"
      />
    </BasicModal>

    <!-- 创建/编辑流水线弹窗 -->
    <BasicModal 
      v-bind="$attrs" 
      @register="registerFormModal" 
      :title="formModalTitle" 
      @ok="handleFormSubmit"
      :width="800"
    >
      <PipelineForm 
        ref="pipelineFormRef"
        :project-id="projectId"
        :pipeline="editingPipeline"
        @submit="handleFormSubmit"
      />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import PipelineDetail from './PipelineDetail.vue';
  import PipelineForm from './PipelineForm.vue';
  import { 
    getPipelineList, 
    runPipeline, 
    deletePipeline,
    createPipeline,
    updatePipeline 
  } from '../Project.api';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();
  const { createMessage, createConfirm } = useMessage();

  // 流水线统计
  const pipelineStats = reactive({
    total: 0,
    running: 0,
    successRate: 0,
    avgDuration: 0,
  });

  // 流水线列表
  const pipelineList = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // 当前选中的流水线
  const currentPipeline = ref(null);
  const editingPipeline = ref(null);

  // 表格列配置
  const pipelineColumns = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
    },
    {
      title: '最后运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      width: 180,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
    },
  ];

  // 弹窗注册
  const [registerDetailModal, { openModal: openDetailModal, closeModal: closeDetailModal }] = useModal();
  const [registerFormModal, { openModal: openFormModal, closeModal: closeFormModal }] = useModal();

  // 表单引用
  const pipelineFormRef = ref();

  // 表单弹窗标题
  const formModalTitle = computed(() => {
    return editingPipeline.value ? '编辑流水线' : '创建流水线';
  });

  /**
   * 加载流水线列表
   */
  async function loadPipelineList() {
    try {
      loading.value = true;
      const params = {
        projectId: props.projectId,
        current: pagination.current,
        size: pagination.pageSize,
      };
      
      const result = await getPipelineList(params);
      if (result.success) {
        pipelineList.value = result.data.records || [];
        pagination.total = result.data.total || 0;
        
        // 更新统计信息
        updatePipelineStats();
      }
    } catch (error) {
      console.error('加载流水线列表失败:', error);
      // 使用模拟数据
      loadMockData();
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加载模拟数据
   */
  function loadMockData() {
    pipelineList.value = [
      {
        id: '1',
        name: '前端构建部署',
        type: 'build',
        environment: '生产环境',
        status: 'idle',
        lastRun: {
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          duration: '5分钟',
        },
        createTime: '2024-01-10 10:00:00',
      },
      {
        id: '2',
        name: '后端API部署',
        type: 'deploy',
        environment: '测试环境',
        status: 'running',
        lastRun: {
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'running',
          duration: '进行中',
        },
        createTime: '2024-01-10 11:00:00',
      },
      {
        id: '3',
        name: '数据库迁移',
        type: 'migration',
        environment: '预发布',
        status: 'idle',
        lastRun: {
          time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'failed',
          duration: '2分钟',
        },
        createTime: '2024-01-09 15:30:00',
      },
    ];

    pagination.total = pipelineList.value.length;
    updatePipelineStats();
  }

  /**
   * 更新流水线统计
   */
  function updatePipelineStats() {
    const total = pipelineList.value.length;
    const running = pipelineList.value.filter(p => p.status === 'running').length;
    const successCount = pipelineList.value.filter(p => 
      p.lastRun && p.lastRun.status === 'success'
    ).length;
    
    Object.assign(pipelineStats, {
      total,
      running,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
      avgDuration: 6.5, // 模拟平均耗时
    });
  }

  /**
   * 获取流水线图标
   */
  function getPipelineIcon(type: string) {
    const iconMap = {
      'build': 'ant-design:build-outlined',
      'deploy': 'ant-design:cloud-upload-outlined',
      'test': 'ant-design:bug-outlined',
      'migration': 'ant-design:database-outlined',
    };
    return iconMap[type] || 'ant-design:setting-outlined';
  }

  /**
   * 获取流水线状态颜色
   */
  function getPipelineStatusColor(status: string) {
    const colorMap = {
      'idle': 'default',
      'running': 'processing',
      'success': 'success',
      'failed': 'error',
      'disabled': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取流水线状态图标
   */
  function getPipelineStatusIcon(status: string) {
    const iconMap = {
      'idle': 'ant-design:pause-circle-outlined',
      'running': 'ant-design:loading-outlined',
      'success': 'ant-design:check-circle-outlined',
      'failed': 'ant-design:close-circle-outlined',
      'disabled': 'ant-design:stop-outlined',
    };
    return iconMap[status] || 'ant-design:question-circle-outlined';
  }

  /**
   * 获取流水线状态文本
   */
  function getPipelineStatusText(status: string) {
    const textMap = {
      'idle': '空闲',
      'running': '运行中',
      'success': '成功',
      'failed': '失败',
      'disabled': '已禁用',
    };
    return textMap[status] || '未知';
  }

  /**
   * 获取运行状态颜色
   */
  function getRunStatusColor(status: string) {
    const colorMap = {
      'success': 'success',
      'failed': 'error',
      'running': 'processing',
      'pending': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取运行状态文本
   */
  function getRunStatusText(status: string) {
    const textMap = {
      'success': '成功',
      'failed': '失败',
      'running': '运行中',
      'pending': '等待中',
    };
    return textMap[status] || '未知';
  }

  /**
   * 格式化时间
   */
  function formatTime(time: string) {
    return formatToDateTime(time);
  }

  /**
   * 表格变化处理
   */
  function handleTableChange(pag: any) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    loadPipelineList();
  }

  /**
   * 刷新列表
   */
  function handleRefresh() {
    loadPipelineList();
  }

  /**
   * 创建流水线
   */
  function handleCreatePipeline() {
    editingPipeline.value = null;
    openFormModal(true, {});
  }

  /**
   * 运行流水线
   */
  async function handleRunPipeline(record: any) {
    try {
      const result = await runPipeline({ 
        pipelineId: record.id,
        projectId: props.projectId 
      });
      
      if (result.success) {
        createMessage.success('流水线启动成功');
        record.status = 'running';
        updatePipelineStats();
      }
    } catch (error) {
      console.error('运行流水线失败:', error);
      createMessage.error('运行流水线失败');
    }
  }

  /**
   * 查看流水线详情
   */
  function handleViewPipeline(record: any) {
    currentPipeline.value = record;
    openDetailModal(true, {});
  }

  /**
   * 编辑流水线
   */
  function handleEditPipeline(record: any) {
    editingPipeline.value = record;
    openFormModal(true, {});
  }

  /**
   * 克隆流水线
   */
  function handleClonePipeline(record: any) {
    const clonedPipeline = {
      ...record,
      id: undefined,
      name: `${record.name} - 副本`,
    };
    editingPipeline.value = clonedPipeline;
    openFormModal(true, {});
  }

  /**
   * 删除流水线
   */
  function handleDeletePipeline(record: any) {
    createConfirm({
      iconType: 'warning',
      title: '确认删除',
      content: `确定要删除流水线 "${record.name}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await deletePipeline({ pipelineId: record.id });
          createMessage.success('删除成功');
          loadPipelineList();
        } catch (error) {
          console.error('删除流水线失败:', error);
          createMessage.error('删除失败');
        }
      },
    });
  }

  /**
   * 表单提交
   */
  async function handleFormSubmit() {
    try {
      const formData = await pipelineFormRef.value?.validate();
      if (!formData) return;

      const apiMethod = editingPipeline.value ? updatePipeline : createPipeline;
      const params = {
        ...formData,
        projectId: props.projectId,
        ...(editingPipeline.value && { id: editingPipeline.value.id }),
      };

      const result = await apiMethod(params);
      if (result.success) {
        createMessage.success(editingPipeline.value ? '更新成功' : '创建成功');
        closeFormModal();
        loadPipelineList();
      }
    } catch (error) {
      console.error('保存流水线失败:', error);
      createMessage.error('保存失败');
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadPipelineList();
  });
</script>

<style lang="less" scoped>
  .pipeline-manager {
    .pipeline-overview {
      margin-bottom: 24px;
    }

    .pipeline-list {
      .pipeline-name {
        display: flex;
        align-items: center;
        gap: 8px;

        .pipeline-icon {
          color: #1890ff;
        }
      }

      .last-run-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;

        .duration {
          font-size: 12px;
          color: #666;
        }
      }

      .text-gray {
        color: #999;
      }

      .text-red {
        color: #ff4d4f;
      }
    }
  }
</style>