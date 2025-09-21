<template>
  <div class="config-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <a-page-header
        :title="configInfo.name || '配置详情'"
        :sub-title="configInfo.description"
        @back="goBack"
      >
        <template #extra>
          <a-space>
            <a-button @click="editConfig">编辑配置</a-button>
            <a-button type="primary" @click="saveConfig" :loading="saving">保存</a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item key="export">导出配置</a-menu-item>
                  <a-menu-item key="import">导入配置</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="copy">复制配置</a-menu-item>
                  <a-menu-item key="delete" danger>删除配置</a-menu-item>
                </a-menu>
              </template>
              <a-button>
                更多操作
                <Icon icon="ant-design:down-outlined" />
              </a-button>
            </a-dropdown>
          </a-space>
        </template>
        
        <template #tags>
          <a-tag :color="getTypeColor(configInfo.type)">
            {{ getTypeText(configInfo.type) }}
          </a-tag>
          <a-tag :color="getEnvironmentColor(configInfo.environment)">
            {{ getEnvironmentText(configInfo.environment) }}
          </a-tag>
          <a-tag :color="getStatusColor(configInfo.status)">
            {{ getStatusText(configInfo.status) }}
          </a-tag>
        </template>
      </a-page-header>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 详情内容 -->
    <div v-else class="detail-content">
      <!-- 配置概览 -->
      <a-card class="overview-card" :bordered="false">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-statistic title="配置版本" :value="configInfo.version" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="创建时间" :value="configInfo.createTime" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="更新时间" :value="configInfo.updateTime" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="创建者" :value="configInfo.createBy" />
          </a-col>
        </a-row>
      </a-card>

      <!-- Tab页面内容 -->
      <a-card :bordered="false" class="tab-container">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane
            v-for="tab in tabList"
            :key="tab.key"
            :tab="tab.title"
          >
            <component
              :is="tab.component"
              v-model:value="configContent"
              :config-type="configInfo.type"
              :readonly="readonly"
            />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <!-- 编辑弹窗 -->
    <ConfigModal @register="registerModal" @success="handleEditSuccess" />
    
    <!-- 导入弹窗 -->
    <ImportModal @register="registerImportModal" @success="handleImportSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadByData } from '/@/utils/file/download';
  
  import ConfigModal from './components/ConfigModal.vue';
  import ImportModal from './components/ImportModal.vue';
  import PipelineConfigEditor from './components/PipelineConfigEditor.vue';
  import TrackingConfigEditor from './components/TrackingConfigEditor.vue';
  import CodeReviewConfigEditor from './components/CodeReviewConfigEditor.vue';
  
  import { getConfigDetail, saveConfig as saveConfigApi, deleteConfig } from './api/Config.api';
  import { configDetailTabs } from './data/Config.data';
  import type { ConfigModel } from './data/Config.data';

  const route = useRoute();
  const router = useRouter();
  const { createMessage, createConfirm } = useMessage();

  const loading = ref(false);
  const saving = ref(false);
  const readonly = ref(false);
  const activeTab = ref('basic');

  // 配置信息
  const configInfo = reactive<ConfigModel>({
    id: '',
    name: '',
    type: 'pipeline',
    environment: 'dev',
    status: 'draft',
    description: '',
    content: '',
    version: '1.0.0',
    createTime: '',
    updateTime: '',
    createBy: '',
  });

  // 配置内容
  const configContent = ref<any>({});

  // Tab列表
  const tabList = computed(() => {
    return configDetailTabs.filter(tab => {
      // 根据配置类型过滤Tab
      if (tab.key === 'pipeline' && configInfo.type !== 'pipeline') return false;
      if (tab.key === 'tracking' && configInfo.type !== 'tracking') return false;
      if (tab.key === 'code_review' && configInfo.type !== 'code_review') return false;
      return true;
    });
  });

  // 弹窗注册
  const [registerModal, { openModal }] = useModal();
  const [registerImportModal, { openModal: openImportModal }] = useModal();

  onMounted(() => {
    loadConfigDetail();
  });

  /**
   * 加载配置详情
   */
  async function loadConfigDetail() {
    try {
      loading.value = true;
      const id = route.params.id as string;
      const result = await getConfigDetail(id);
      
      Object.assign(configInfo, result);
      
      // 解析配置内容
      if (result.content) {
        try {
          configContent.value = JSON.parse(result.content);
        } catch (error) {
          configContent.value = {};
        }
      }
      
      // 设置默认Tab
      if (tabList.value.length > 0) {
        activeTab.value = tabList.value[0].key;
      }
    } catch (error) {
      createMessage.error('加载配置详情失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 返回上一页
   */
  function goBack() {
    router.back();
  }

  /**
   * 编辑配置
   */
  function editConfig() {
    openModal(true, {
      isUpdate: true,
      record: configInfo,
    });
  }

  /**
   * 保存配置
   */
  async function saveConfig() {
    try {
      saving.value = true;
      
      const params = {
        ...configInfo,
        content: JSON.stringify(configContent.value),
      };
      
      await saveConfigApi(params);
      createMessage.success('保存成功');
      
      // 重新加载详情
      await loadConfigDetail();
    } catch (error) {
      createMessage.error('保存失败');
    } finally {
      saving.value = false;
    }
  }

  /**
   * 处理菜单点击
   */
  async function handleMenuClick({ key }: { key: string }) {
    switch (key) {
      case 'export':
        exportConfig();
        break;
      case 'import':
        openImportModal(true, { configId: configInfo.id });
        break;
      case 'copy':
        copyConfig();
        break;
      case 'delete':
        deleteConfigConfirm();
        break;
    }
  }

  /**
   * 导出配置
   */
  function exportConfig() {
    const data = {
      ...configInfo,
      content: configContent.value,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    downloadByData(blob, `${configInfo.name}_${configInfo.version}.json`);
    createMessage.success('导出成功');
  }

  /**
   * 复制配置
   */
  function copyConfig() {
    const newConfig = {
      ...configInfo,
      id: '',
      name: `${configInfo.name}_copy`,
      status: 'draft',
      version: '1.0.0',
      createTime: '',
      updateTime: '',
    };
    
    openModal(true, {
      isUpdate: false,
      record: newConfig,
    });
  }

  /**
   * 删除配置确认
   */
  function deleteConfigConfirm() {
    createConfirm({
      iconType: 'warning',
      title: '确认删除',
      content: `确定要删除配置"${configInfo.name}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await deleteConfig(configInfo.id);
          createMessage.success('删除成功');
          router.push('/appmanage/config');
        } catch (error) {
          createMessage.error('删除失败');
        }
      },
    });
  }

  /**
   * Tab切换
   */
  function handleTabChange(key: string) {
    activeTab.value = key;
  }

  /**
   * 编辑成功回调
   */
  function handleEditSuccess() {
    loadConfigDetail();
  }

  /**
   * 导入成功回调
   */
  function handleImportSuccess() {
    loadConfigDetail();
  }

  /**
   * 获取类型文本
   */
  function getTypeText(type: string): string {
    const typeMap = {
      pipeline: '流水线配置',
      tracking: '埋点配置',
      code_review: '代码审查配置',
      database: '数据库配置',
      cache: '缓存配置',
      message_queue: '消息队列配置',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取类型颜色
   */
  function getTypeColor(type: string): string {
    const colorMap = {
      pipeline: 'blue',
      tracking: 'green',
      code_review: 'orange',
      database: 'purple',
      cache: 'cyan',
      message_queue: 'magenta',
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取环境文本
   */
  function getEnvironmentText(environment: string): string {
    const envMap = {
      dev: '开发环境',
      test: '测试环境',
      staging: '预发布环境',
      prod: '生产环境',
    };
    return envMap[environment] || environment;
  }

  /**
   * 获取环境颜色
   */
  function getEnvironmentColor(environment: string): string {
    const colorMap = {
      dev: 'blue',
      test: 'orange',
      staging: 'purple',
      prod: 'red',
    };
    return colorMap[environment] || 'default';
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status: string): string {
    const statusMap = {
      draft: '草稿',
      active: '启用',
      inactive: '禁用',
      archived: '已归档',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status: string): string {
    const colorMap = {
      draft: 'orange',
      active: 'green',
      inactive: 'red',
      archived: 'gray',
    };
    return colorMap[status] || 'default';
  }
</script>

<style lang="less" scoped>
  .config-detail {
    .detail-header {
      background-color: #fff;
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .detail-content {
      .overview-card {
        margin-bottom: 16px;
      }

      .tab-container {
        min-height: 600px;
      }
    }
  }
</style>