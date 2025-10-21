<template>
  <div class="tag-version-manager">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium">Tag版本管理</h3>
      <a-button type="primary" @click="handleRefreshTags" :loading="refreshLoading">
        <template #icon><ReloadOutlined /></template>
        刷新版本
      </a-button>
    </div>

    <!-- 当前版本信息 -->
    <a-card class="mb-4" size="small">
      <template #title>
        <span class="text-sm">当前版本信息</span>
      </template>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-gray-600">项目名称：</label>
          <span class="font-medium">{{ componentData.relatedProject || '-' }}</span>
        </div>
        <div>
          <label class="text-gray-600">当前Tag：</label>
          <a-tag :color="getTagColor(componentData.projectTag)">
            v{{ componentData.projectTag || '未指定' }}
          </a-tag>
        </div>
        <div>
          <label class="text-gray-600">仓库地址：</label>
          <a 
            v-if="componentData.projectRepository" 
            :href="componentData.projectRepository" 
            target="_blank"
            class="text-blue-600 hover:text-blue-800"
          >
            {{ componentData.projectRepository }}
          </a>
          <span v-else class="text-gray-400">未配置</span>
        </div>
        <div>
          <label class="text-gray-600">更新时间：</label>
          <span>{{ componentData.updateTime || '-' }}</span>
        </div>
      </div>
    </a-card>

    <!-- 可用版本列表 -->
    <a-card size="small">
      <template #title>
        <span class="text-sm">可用版本列表</span>
      </template>
      
      <div v-if="loading" class="text-center py-8">
        <a-spin size="large" />
        <div class="mt-2 text-gray-500">正在获取版本信息...</div>
      </div>

      <div v-else-if="availableTags.length === 0" class="text-center py-8 text-gray-500">
        暂无可用版本
      </div>

      <div v-else class="space-y-2">
        <div 
          v-for="tag in availableTags" 
          :key="tag.name"
          class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          :class="{ 'bg-blue-50 border-blue-200': tag.name === componentData.projectTag }"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <a-tag :color="getTagColor(tag.name)">v{{ tag.name }}</a-tag>
              <span v-if="tag.name === componentData.projectTag" class="text-blue-600 text-sm">
                (当前版本)
              </span>
            </div>
            <div class="text-sm text-gray-600 mt-1">
              <span>提交: {{ tag.commit?.substring(0, 8) }}</span>
              <span class="ml-4">时间: {{ formatDate(tag.date) }}</span>
            </div>
            <div v-if="tag.message" class="text-sm text-gray-500 mt-1">
              {{ tag.message }}
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <a-button 
              v-if="tag.name !== componentData.projectTag"
              size="small" 
              @click="handleSwitchVersion(tag.name)"
              :loading="switchingVersion === tag.name"
            >
              切换到此版本
            </a-button>
            <a-button 
              size="small" 
              type="link" 
              @click="handleViewChanges(tag.name)"
            >
              查看变更
            </a-button>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 版本切换确认弹窗 -->
    <a-modal
      v-model:open="switchModalVisible"
      title="确认切换版本"
      @ok="confirmSwitchVersion"
      @cancel="cancelSwitchVersion"
      :confirm-loading="switchLoading"
    >
      <div class="space-y-4">
        <div>
          <strong>当前版本：</strong>
          <a-tag color="blue">v{{ componentData.projectTag }}</a-tag>
        </div>
        <div>
          <strong>目标版本：</strong>
          <a-tag color="green">v{{ targetVersion }}</a-tag>
        </div>
        <a-alert
          message="版本切换提醒"
          description="切换版本后，组件的功能和接口可能发生变化，请确保相关业务系统能够兼容新版本。"
          type="warning"
          show-icon
        />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { ReloadOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import { getProjectTags, switchComponentVersion } from '../material.api';

  interface TagInfo {
    name: string;
    commit: string;
    date: string;
    message?: string;
  }

  interface ComponentData {
    id: string;
    relatedProject: string;
    projectRepository: string;
    projectTag: string;
    updateTime: string;
  }

  const props = defineProps<{
    componentData: ComponentData;
  }>();

  const emit = defineEmits(['versionChanged']);

  const loading = ref(false);
  const refreshLoading = ref(false);
  const switchLoading = ref(false);
  const switchingVersion = ref('');
  const switchModalVisible = ref(false);
  const targetVersion = ref('');
  const availableTags = ref<TagInfo[]>([]);

  /**
   * 获取Tag颜色
   */
  function getTagColor(version: string): string {
    if (!version) return 'default';
    
    const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan'];
    const hash = version.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  /**
   * 格式化日期
   */
  function formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  }

  /**
   * 获取可用的Tag版本
   */
  async function fetchAvailableTags() {
    if (!props.componentData.projectRepository) {
      message.warning('未配置项目仓库地址');
      return;
    }

    loading.value = true;
    try {
      const response = await getProjectTags({
        repository: props.componentData.projectRepository,
        project: props.componentData.relatedProject,
      });
      
      availableTags.value = response.data || [];
    } catch (error) {
      console.error('获取版本信息失败:', error);
      message.error('获取版本信息失败，请检查仓库地址是否正确');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 刷新版本信息
   */
  async function handleRefreshTags() {
    refreshLoading.value = true;
    try {
      await fetchAvailableTags();
      message.success('版本信息已刷新');
    } finally {
      refreshLoading.value = false;
    }
  }

  /**
   * 切换版本
   */
  function handleSwitchVersion(version: string) {
    targetVersion.value = version;
    switchModalVisible.value = true;
  }

  /**
   * 确认切换版本
   */
  async function confirmSwitchVersion() {
    switchLoading.value = true;
    try {
      await switchComponentVersion({
        componentId: props.componentData.id,
        targetVersion: targetVersion.value,
      });
      
      message.success(`已切换到版本 v${targetVersion.value}`);
      switchModalVisible.value = false;
      
      // 通知父组件版本已更改
      emit('versionChanged', {
        componentId: props.componentData.id,
        newVersion: targetVersion.value,
      });
    } catch (error) {
      console.error('版本切换失败:', error);
      message.error('版本切换失败，请稍后重试');
    } finally {
      switchLoading.value = false;
    }
  }

  /**
   * 取消切换版本
   */
  function cancelSwitchVersion() {
    switchModalVisible.value = false;
    targetVersion.value = '';
  }

  /**
   * 查看版本变更
   */
  function handleViewChanges(version: string) {
    if (props.componentData.projectRepository) {
      const changelogUrl = `${props.componentData.projectRepository}/compare/v${props.componentData.projectTag}...v${version}`;
      window.open(changelogUrl, '_blank');
    } else {
      message.warning('未配置项目仓库地址，无法查看变更');
    }
  }

  onMounted(() => {
    if (props.componentData.relatedProject && props.componentData.projectRepository) {
      fetchAvailableTags();
    }
  });
</script>

<style scoped>
.tag-version-manager {
  @apply max-w-4xl mx-auto;
}
</style>