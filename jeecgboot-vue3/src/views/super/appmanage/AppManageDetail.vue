<!--应用管理详情页面-->
<template>
  <div class="app-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <a-button type="link" @click="goBack" class="back-btn">
        <Icon icon="ant-design:arrow-left-outlined" size="16" />
        返回列表
      </a-button>
      <div class="header-actions">
        <a-button type="primary" @click="handleEdit">
          <Icon icon="ant-design:edit-outlined" size="16" />
          编辑应用
        </a-button>
        <a-button danger @click="handleDelete">
          <Icon icon="ant-design:delete-outlined" size="16" />
          删除应用
        </a-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 详情内容 -->
    <div v-else-if="appDetail" class="detail-content">
      <!-- 基本信息卡片 -->
      <a-card title="基本信息" class="detail-card">
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">应用简称：</label>
              <span class="info-value">{{ appDetail.appName }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">所属领域：</label>
              <a-tag color="blue">{{ appDetail.domain_dictText || '未分类' }}</a-tag>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="info-item">
              <label class="info-label">应用描述：</label>
              <span class="info-value">{{ appDetail.appDescription || '暂无描述' }}</span>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="info-item">
              <label class="info-label">Git地址：</label>
              <a :href="appDetail.gitUrl" target="_blank" class="git-link">
                <Icon icon="ant-design:github-outlined" size="16" />
                {{ appDetail.gitUrl }}
              </a>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="info-item">
              <label class="info-label">应用负责人：</label>
              <span class="info-value">{{ appDetail.managers_dictText || '暂无负责人' }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 创建信息卡片 -->
      <a-card title="创建信息" class="detail-card">
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">创建人：</label>
              <span class="info-value">{{ appDetail.createBy_dictText || appDetail.createBy }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">创建时间：</label>
              <span class="info-value">{{ formatDate(appDetail.createTime) }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">更新人：</label>
              <span class="info-value">{{ appDetail.updateBy_dictText || appDetail.updateBy || '暂无' }}</span>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="info-item">
              <label class="info-label">更新时间：</label>
              <span class="info-value">{{ formatDate(appDetail.updateTime) }}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Git仓库信息卡片 -->
      <a-card title="Git仓库信息" class="detail-card">
        <div class="git-info">
          <div class="git-actions">
            <a-button type="primary" @click="openGitRepo">
              <Icon icon="ant-design:github-outlined" size="16" />
              访问仓库
            </a-button>
            <a-button @click="copyGitUrl">
              <Icon icon="ant-design:copy-outlined" size="16" />
              复制地址
            </a-button>
          </div>
          <div class="git-url">
            <Icon icon="ant-design:link-outlined" size="16" />
            <span>{{ appDetail.gitUrl }}</span>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 数据不存在 -->
    <div v-else class="no-data">
      <a-empty description="应用不存在或已被删除" />
    </div>

    <!-- 编辑弹窗 -->
    <AppManageModal @register="registerModal" @success="handleSuccess"></AppManageModal>
  </div>
</template>

<script lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useModal } from '@/components/Modal';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useCopyToClipboard } from '@/hooks/web/useCopyToClipboard';
  import Icon from '@/components/Icon';
  import AppManageModal from './components/AppManageModal.vue';
  import { getAppById, deleteApp } from './AppManage.api';
  import type { AppManageModel } from './AppManage.data';
  import { formatToDateTime } from '@/utils/dateUtil';

  export default {
    name: 'AppManageDetail',
    components: {
      Icon,
      AppManageModal,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const { createMessage } = useMessage();
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const [registerModal, { openModal }] = useModal();

      const loading = ref(false);
      const appDetail = ref<AppManageModel | null>(null);

      /**
       * 加载应用详情
       */
      const loadAppDetail = async () => {
        const appId = route.params.id as string;
        if (!appId) {
          createMessage.error('应用ID不能为空');
          return;
        }

        loading.value = true;
        try {
          const result = await getAppById({ id: appId });
          if (result.success) {
            appDetail.value = result.result;
          } else {
            createMessage.error(result.message || '加载应用详情失败');
          }
        } catch (error) {
          console.error('加载应用详情失败:', error);
          createMessage.error('加载应用详情失败');
        } finally {
          loading.value = false;
        }
      };

      /**
       * 返回列表
       */
      const goBack = () => {
        router.push({ name: 'AppManageList' });
      };

      /**
       * 编辑应用
       */
      const handleEdit = () => {
        if (!appDetail.value) return;
        openModal(true, {
          record: appDetail.value,
          isUpdate: true,
        });
      };

      /**
       * 删除应用
       */
      const handleDelete = () => {
        if (!appDetail.value) return;
        deleteApp({ id: appDetail.value.id }, () => {
          createMessage.success('删除成功');
          goBack();
        });
      };

      /**
       * 打开Git仓库
       */
      const openGitRepo = () => {
        if (appDetail.value?.gitUrl) {
          window.open(appDetail.value.gitUrl, '_blank');
        }
      };

      /**
       * 复制Git地址
       */
      const copyGitUrl = async () => {
        if (appDetail.value?.gitUrl) {
          clipboardRef.value = appDetail.value.gitUrl;
          if (copiedRef.value) {
            createMessage.success('Git地址已复制到剪贴板');
          } else {
            createMessage.error('复制失败');
          }
        }
      };

      /**
       * 格式化日期
       */
      const formatDate = (date: string) => {
        return date ? formatToDateTime(date) : '暂无';
      };

      /**
       * 编辑成功回调
       */
      const handleSuccess = () => {
        loadAppDetail();
      };

      // 组件挂载时加载数据
      onMounted(() => {
        loadAppDetail();
      });

      return {
        loading,
        appDetail,
        registerModal,
        goBack,
        handleEdit,
        handleDelete,
        openGitRepo,
        copyGitUrl,
        formatDate,
        handleSuccess,
      };
    },
  };
</script>

<style lang="less" scoped>
  .app-detail {
    padding: 24px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 64px);

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .back-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0;
        font-size: 16px;
        color: #1890ff;

        &:hover {
          color: #40a9ff;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .detail-content {
      .detail-card {
        margin-bottom: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        :deep(.ant-card-head) {
          border-bottom: 1px solid #f0f0f0;
          
          .ant-card-head-title {
            font-size: 18px;
            font-weight: 600;
            color: #262626;
          }
        }

        :deep(.ant-card-body) {
          padding: 24px;
        }
      }

      .info-item {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;

        .info-label {
          min-width: 100px;
          font-weight: 500;
          color: #595959;
          margin-right: 12px;
        }

        .info-value {
          flex: 1;
          color: #262626;
          word-break: break-all;
        }

        .git-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1890ff;
          text-decoration: none;

          &:hover {
            color: #40a9ff;
            text-decoration: underline;
          }
        }
      }

      .git-info {
        .git-actions {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }

        .git-url {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          color: #595959;
          word-break: break-all;
        }
      }
    }

    .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
</style>