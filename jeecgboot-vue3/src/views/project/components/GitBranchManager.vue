<template>
  <div class="git-branch-manager">
    <div class="branch-header">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Git分支管理</h3>
        <a-button type="primary" @click="handleCreateBranch" preIcon="ant-design:plus-outlined">
          创建分支
        </a-button>
      </div>
      
      <!-- 分支统计 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="stat-card">
          <div class="stat-number">{{ branchStats.total }}</div>
          <div class="stat-label">总分支数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ branchStats.active }}</div>
          <div class="stat-label">活跃分支</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ branchStats.merged }}</div>
          <div class="stat-label">已合并</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ branchStats.deleted }}</div>
          <div class="stat-label">已删除</div>
        </div>
      </div>
    </div>

    <!-- 应用分支列表 -->
    <div class="app-branches">
      <div v-for="app in appBranches" :key="app.appId" class="app-branch-section mb-6">
        <div class="app-header">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <a-tag color="blue" class="mr-2">{{ app.appName }}</a-tag>
              <span class="text-sm text-gray-500">{{ app.gitUrl }}</span>
            </div>
            <a-button 
              size="small" 
              @click="handleCreateAppBranch(app.appId)"
              preIcon="ant-design:plus-outlined"
            >
              创建分支
            </a-button>
          </div>
        </div>

        <!-- 分支列表 -->
        <div class="branches-list">
          <div 
            v-for="branch in app.branches" 
            :key="branch.id"
            class="branch-item"
          >
            <div class="branch-info">
              <div class="branch-name">
                <a-tag :color="getBranchTypeColor(branch.branchType)">
                  {{ branch.branchName }}
                </a-tag>
                <a-tag 
                  :color="getBranchStatusColor(branch.status)" 
                  size="small"
                >
                  {{ getBranchStatusText(branch.status) }}
                </a-tag>
              </div>
              <div class="branch-meta">
                <span class="text-sm text-gray-500">
                  创建时间: {{ formatDate(branch.createTime) }}
                </span>
                <span v-if="branch.mergeTime" class="text-sm text-gray-500 ml-4">
                  合并时间: {{ formatDate(branch.mergeTime) }}
                </span>
              </div>
            </div>
            
            <div class="branch-actions">
              <a-button 
                v-if="branch.status === 'ACTIVE'" 
                size="small" 
                type="primary"
                @click="handleMergeBranch(branch)"
              >
                合并
              </a-button>
              <a-button 
                v-if="branch.status === 'MERGED'" 
                size="small" 
                danger
                @click="handleDeleteBranch(branch)"
              >
                删除
              </a-button>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="handleViewBranchDetail(branch)">
                      查看详情
                    </a-menu-item>
                    <a-menu-item @click="handleSyncBranch(branch)">
                      同步分支
                    </a-menu-item>
                    <a-menu-item 
                      v-if="branch.status === 'ACTIVE'" 
                      @click="handleCreatePullRequest(branch)"
                    >
                      创建PR
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small">
                  更多
                  <Icon icon="ant-design:down-outlined" />
                </a-button>
              </a-dropdown>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="!app.branches || app.branches.length === 0" class="empty-branches">
            <a-empty description="暂无分支" />
          </div>
        </div>
      </div>
    </div>

    <!-- 创建分支弹窗 -->
    <BasicModal 
      v-bind="$attrs" 
      @register="registerCreateModal" 
      title="创建Git分支" 
      @ok="handleCreateSubmit"
      :width="600"
    >
      <BasicForm @register="registerCreateForm" />
    </BasicModal>

    <!-- 合并分支弹窗 -->
    <BasicModal 
      v-bind="$attrs" 
      @register="registerMergeModal" 
      title="合并Git分支" 
      @ok="handleMergeSubmit"
      :width="600"
    >
      <div class="merge-info mb-4">
        <p><strong>源分支:</strong> {{ currentBranch?.branchName }}</p>
        <p><strong>目标分支:</strong> {{ targetBranch }}</p>
      </div>
      <BasicForm @register="registerMergeForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { 
    getProjectGitBranches, 
    createGitBranch, 
    mergeGitBranch, 
    deleteGitBranch 
  } from '../Project.api';
  import { formatToDateTime } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
  }

  const props = defineProps<Props>();
  const { createMessage, createConfirm } = useMessage();

  // 数据状态
  const appBranches = ref([]);
  const currentBranch = ref(null);
  const targetBranch = ref('master');
  const loading = ref(false);

  // 分支统计
  const branchStats = computed(() => {
    const stats = { total: 0, active: 0, merged: 0, deleted: 0 };
    appBranches.value.forEach(app => {
      if (app.branches) {
        app.branches.forEach(branch => {
          stats.total++;
          if (branch.status === 'ACTIVE') stats.active++;
          else if (branch.status === 'MERGED') stats.merged++;
          else if (branch.status === 'DELETED') stats.deleted++;
        });
      }
    });
    return stats;
  });

  // 创建分支表单配置
  const createFormSchema: FormSchema[] = [
    {
      field: 'appId',
      label: '关联应用',
      component: 'Select',
      required: true,
      componentProps: {
        placeholder: '请选择关联应用',
        options: computed(() => 
          appBranches.value.map(app => ({
            label: app.appName,
            value: app.appId,
          }))
        ),
      },
    },
    {
      field: 'branchType',
      label: '分支类型',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          { label: 'Feature分支', value: 'feature' },
          { label: 'Fix分支', value: 'fix' },
          { label: 'Hotfix分支', value: 'hotfix' },
          { label: 'Release分支', value: 'release' },
        ],
      },
    },
    {
      field: 'branchName',
      label: '分支名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入分支名称',
      },
    },
    {
      field: 'sourceBranch',
      label: '源分支',
      component: 'Input',
      defaultValue: 'master',
      componentProps: {
        placeholder: '请输入源分支名称',
      },
    },
    {
      field: 'description',
      label: '分支描述',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入分支描述',
        rows: 3,
      },
    },
  ];

  // 合并分支表单配置
  const mergeFormSchema: FormSchema[] = [
    {
      field: 'targetBranch',
      label: '目标分支',
      component: 'Input',
      defaultValue: 'master',
      required: true,
      componentProps: {
        placeholder: '请输入目标分支名称',
      },
    },
    {
      field: 'mergeMessage',
      label: '合并信息',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入合并信息',
        rows: 3,
      },
    },
    {
      field: 'deleteAfterMerge',
      label: '合并后删除分支',
      component: 'Switch',
      defaultValue: true,
    },
  ];

  // 表单注册
  const [registerCreateForm, { validate: validateCreate, resetFields: resetCreateFields }] = useForm({
    labelWidth: 100,
    schemas: createFormSchema,
    showActionButtonGroup: false,
  });

  const [registerMergeForm, { validate: validateMerge, resetFields: resetMergeFields }] = useForm({
    labelWidth: 100,
    schemas: mergeFormSchema,
    showActionButtonGroup: false,
  });

  // 弹窗注册
  const [registerCreateModal, { openModal: openCreateModal, closeModal: closeCreateModal }] = useModal();
  const [registerMergeModal, { openModal: openMergeModal, closeModal: closeMergeModal }] = useModal();

  /**
   * 加载分支数据
   */
  async function loadBranches() {
    try {
      loading.value = true;
      const result = await getProjectGitBranches({ projectId: props.projectId });
      appBranches.value = result.data || [];
    } catch (error) {
      console.error('加载分支数据失败:', error);
      createMessage.error('加载分支数据失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建分支
   */
  function handleCreateBranch() {
    resetCreateFields();
    openCreateModal(true, {});
  }

  /**
   * 为特定应用创建分支
   */
  function handleCreateAppBranch(appId: string) {
    resetCreateFields();
    openCreateModal(true, { appId });
  }

  /**
   * 提交创建分支
   */
  async function handleCreateSubmit() {
    try {
      const values = await validateCreate();
      await createGitBranch({
        projectId: props.projectId,
        ...values,
      });
      closeCreateModal();
      createMessage.success('分支创建成功');
      await loadBranches();
    } catch (error) {
      console.error('创建分支失败:', error);
      createMessage.error('创建分支失败');
    }
  }

  /**
   * 合并分支
   */
  function handleMergeBranch(branch: any) {
    currentBranch.value = branch;
    resetMergeFields();
    openMergeModal(true, {});
  }

  /**
   * 提交合并分支
   */
  async function handleMergeSubmit() {
    try {
      const values = await validateMerge();
      await mergeGitBranch({
        projectId: props.projectId,
        branchId: currentBranch.value?.id,
        ...values,
      });
      closeMergeModal();
      createMessage.success('分支合并成功');
      await loadBranches();
    } catch (error) {
      console.error('合并分支失败:', error);
      createMessage.error('合并分支失败');
    }
  }

  /**
   * 删除分支
   */
  function handleDeleteBranch(branch: any) {
    createConfirm({
      iconType: 'warning',
      title: '确认删除',
      content: `确定要删除分支 "${branch.branchName}" 吗？`,
      onOk: async () => {
        try {
          await deleteGitBranch({
            projectId: props.projectId,
            branchId: branch.id,
          });
          createMessage.success('分支删除成功');
          await loadBranches();
        } catch (error) {
          console.error('删除分支失败:', error);
          createMessage.error('删除分支失败');
        }
      },
    });
  }

  /**
   * 查看分支详情
   */
  function handleViewBranchDetail(branch: any) {
    // TODO: 实现分支详情查看
    console.log('查看分支详情:', branch);
  }

  /**
   * 同步分支
   */
  function handleSyncBranch(branch: any) {
    // TODO: 实现分支同步
    console.log('同步分支:', branch);
  }

  /**
   * 创建PR
   */
  function handleCreatePullRequest(branch: any) {
    // TODO: 实现创建PR
    console.log('创建PR:', branch);
  }

  /**
   * 获取分支类型颜色
   */
  function getBranchTypeColor(type: string) {
    const colorMap = {
      'feature': 'blue',
      'fix': 'red',
      'hotfix': 'orange',
      'release': 'green',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取分支状态颜色
   */
  function getBranchStatusColor(status: string) {
    const colorMap = {
      'ACTIVE': 'processing',
      'MERGED': 'success',
      'DELETED': 'default',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取分支状态文本
   */
  function getBranchStatusText(status: string) {
    const textMap = {
      'ACTIVE': '活跃',
      'MERGED': '已合并',
      'DELETED': '已删除',
    };
    return textMap[status] || '未知';
  }

  /**
   * 格式化日期
   */
  function formatDate(date: string) {
    return formatToDateTime(date);
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadBranches();
  });
</script>

<style lang="less" scoped>
  .git-branch-manager {
    .stat-card {
      @apply bg-white p-4 rounded-lg border text-center;
      
      .stat-number {
        @apply text-2xl font-bold text-blue-600;
      }
      
      .stat-label {
        @apply text-sm text-gray-500 mt-1;
      }
    }

    .app-branch-section {
      @apply bg-white p-4 rounded-lg border;
      
      .app-header {
        @apply border-b pb-3 mb-3;
      }
      
      .branch-item {
        @apply flex items-center justify-between p-3 border rounded mb-2 hover:bg-gray-50;
        
        .branch-info {
          @apply flex-1;
          
          .branch-name {
            @apply mb-1;
          }
          
          .branch-meta {
            @apply text-xs;
          }
        }
        
        .branch-actions {
          @apply flex items-center gap-2;
        }
      }
      
      .empty-branches {
        @apply py-8;
      }
    }

    .merge-info {
      @apply bg-gray-50 p-3 rounded;
      
      p {
        @apply mb-1;
      }
    }
  }
</style>