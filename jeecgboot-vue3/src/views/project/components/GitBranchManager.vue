<template>
  <div class="git-branch-manager">
    <div class="branch-header">
      <h3>Git分支管理</h3>
      <a-button type="primary" @click="handleCreateBranch" :loading="createLoading">
        <Icon icon="ant-design:plus-outlined" />
        创建分支
      </a-button>
    </div>

    <div class="current-branch" v-if="currentBranch">
      <h4>当前分支</h4>
      <div class="branch-info">
        <a-tag color="blue" class="branch-tag">
          <Icon icon="ant-design:branch-outlined" />
          {{ currentBranch }}
        </a-tag>
        <a-button size="small" @click="handleCopyBranchName">
          <Icon icon="ant-design:copy-outlined" />
          复制分支名
        </a-button>
      </div>
    </div>

    <div class="branch-commands">
      <h4>Git命令</h4>
      <div class="command-list">
        <div class="command-item">
          <span class="command-label">创建并切换分支：</span>
          <a-typography-paragraph copyable class="command-text">
            git checkout -b {{ suggestedBranchName }}
          </a-typography-paragraph>
        </div>
        <div class="command-item">
          <span class="command-label">推送分支到远程：</span>
          <a-typography-paragraph copyable class="command-text">
            git push -u origin {{ suggestedBranchName }}
          </a-typography-paragraph>
        </div>
        <div class="command-item">
          <span class="command-label">切换到分支：</span>
          <a-typography-paragraph copyable class="command-text">
            git checkout {{ suggestedBranchName }}
          </a-typography-paragraph>
        </div>
        <div class="command-item">
          <span class="command-label">删除本地分支：</span>
          <a-typography-paragraph copyable class="command-text">
            git branch -d {{ suggestedBranchName }}
          </a-typography-paragraph>
        </div>
        <div class="command-item">
          <span class="command-label">删除远程分支：</span>
          <a-typography-paragraph copyable class="command-text">
            git push origin --delete {{ suggestedBranchName }}
          </a-typography-paragraph>
        </div>
      </div>
    </div>

    <div class="branch-list">
      <h4>分支列表</h4>
      <a-table
        :columns="columns"
        :data-source="branchList"
        :loading="loading"
        :pagination="false"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-tag :color="record.isCurrent ? 'blue' : 'default'">
              <Icon icon="ant-design:branch-outlined" />
              {{ record.name }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="handleSwitchBranch(record)">
                切换
              </a-button>
              <a-button size="small" @click="handleMergeBranch(record)">
                合并
              </a-button>
              <a-popconfirm
                title="确定要删除这个分支吗？"
                @confirm="handleDeleteBranch(record)"
              >
                <a-button size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 创建分支模态框 -->
    <BasicModal
      v-model:visible="createModalVisible"
      title="创建Git分支"
      @ok="handleConfirmCreate"
      :confirm-loading="createLoading"
    >
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { BasicModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { 
    getGitBranches, 
    createGitBranch, 
    deleteGitBranch,
    generateGitBranchName 
  } from '../Project.api';
  import { ProjectModel, ProjectType } from '../Project.data';
  import { formatToDateTime } from '/@/utils/dateUtil';

  interface Props {
    projectId: string;
    projectData?: ProjectModel;
  }

  const props = defineProps<Props>();
  const { createMessage } = useMessage();

  // 分支列表
  const branchList = ref<any[]>([]);
  const loading = ref(false);
  const createLoading = ref(false);
  const createModalVisible = ref(false);

  // 当前分支
  const currentBranch = computed(() => {
    return props.projectData?.gitBranch || '';
  });

  // 建议的分支名
  const suggestedBranchName = computed(() => {
    if (!props.projectData) return '';
    
    const itemId = props.projectData.requirementId || props.projectData.bugId;
    if (!itemId) return '';
    
    return generateGitBranchName(props.projectData.projectType, itemId);
  });

  // 表格列配置
  const columns = [
    {
      title: '分支名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '最后提交时间',
      dataIndex: 'lastCommitTime',
      key: 'lastCommitTime',
      width: 180,
      customRender: ({ text }) => formatToDateTime(text),
    },
    {
      title: '最后提交人',
      dataIndex: 'lastCommitAuthor',
      key: 'lastCommitAuthor',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
    },
  ];

  // 创建分支表单
  const [registerForm, { getFieldsValue, resetFields, setFieldsValue }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'branchName',
        label: '分支名称',
        component: 'Input',
        required: true,
        defaultValue: suggestedBranchName.value,
        componentProps: {
          placeholder: '请输入分支名称',
        },
      },
      {
        field: 'baseBranch',
        label: '基础分支',
        component: 'Select',
        required: true,
        defaultValue: 'main',
        componentProps: {
          options: [
            { label: 'main', value: 'main' },
            { label: 'master', value: 'master' },
            { label: 'develop', value: 'develop' },
          ],
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
    ],
    showActionButtonGroup: false,
  });

  /**
   * 加载分支列表
   */
  async function loadBranchList() {
    try {
      loading.value = true;
      const result = await getGitBranches({ projectId: props.projectId });
      branchList.value = result || [];
    } catch (error) {
      createMessage.error('加载分支列表失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建分支
   */
  function handleCreateBranch() {
    resetFields();
    setFieldsValue({
      branchName: suggestedBranchName.value,
    });
    createModalVisible.value = true;
  }

  /**
   * 确认创建分支
   */
  async function handleConfirmCreate() {
    try {
      const values = await getFieldsValue();
      createLoading.value = true;
      
      await createGitBranch({
        projectId: props.projectId,
        branchName: values.branchName,
        baseBranch: values.baseBranch,
        description: values.description,
      });
      
      createMessage.success('分支创建成功');
      createModalVisible.value = false;
      loadBranchList();
    } catch (error) {
      createMessage.error('创建分支失败');
    } finally {
      createLoading.value = false;
    }
  }

  /**
   * 复制分支名
   */
  function handleCopyBranchName() {
    if (currentBranch.value) {
      navigator.clipboard.writeText(currentBranch.value);
      createMessage.success('分支名已复制到剪贴板');
    }
  }

  /**
   * 切换分支
   */
  function handleSwitchBranch(record: any) {
    const command = `git checkout ${record.name}`;
    navigator.clipboard.writeText(command);
    createMessage.success('切换命令已复制到剪贴板');
  }

  /**
   * 合并分支
   */
  function handleMergeBranch(record: any) {
    const command = `git merge ${record.name}`;
    navigator.clipboard.writeText(command);
    createMessage.success('合并命令已复制到剪贴板');
  }

  /**
   * 删除分支
   */
  async function handleDeleteBranch(record: any) {
    try {
      await deleteGitBranch({
        projectId: props.projectId,
        branchName: record.name,
      });
      createMessage.success('分支删除成功');
      loadBranchList();
    } catch (error) {
      createMessage.error('删除分支失败');
    }
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string) {
    const colorMap = {
      active: 'green',
      merged: 'blue',
      deleted: 'red',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string) {
    const textMap = {
      active: '活跃',
      merged: '已合并',
      deleted: '已删除',
    };
    return textMap[status] || status;
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadBranchList();
  });
</script>

<style lang="less" scoped>
  .git-branch-manager {
    padding: 16px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    
    .branch-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .current-branch {
      margin-bottom: 24px;
      padding: 16px;
      background: #f6f8fa;
      border-radius: 6px;
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .branch-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .branch-tag {
          font-size: 14px;
          padding: 4px 8px;
        }
      }
    }
    
    .branch-commands {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .command-list {
        .command-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          
          .command-label {
            min-width: 140px;
            font-size: 14px;
            color: #666;
            line-height: 32px;
          }
          
          .command-text {
            flex: 1;
            margin: 0;
            font-family: 'Courier New', monospace;
            background: #f6f8fa;
            padding: 6px 12px;
            border-radius: 4px;
            
            :deep(.ant-typography-copy) {
              margin-left: 8px;
            }
          }
        }
      }
    }
    
    .branch-list {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
</style>