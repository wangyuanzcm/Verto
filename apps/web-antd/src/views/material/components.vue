<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus, Search, Filter, Download, Eye, Star } from '@vben/icons';

import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Tag,
  Rate,
  Avatar,
  Tooltip,
  Empty,
  Pagination,
  message,
} from 'ant-design-vue';

// 组件库接口类型
interface ComponentItem {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  version: string;
  downloadCount: number;
  rating: number;
  author: string;
  avatar?: string;
  tags: string[];
  isOfficial: boolean;
  preview?: string;
  thumbnail?: string;
  createTime: string;
  status: 'published' | 'draft';
}

const router = useRouter();

// 搜索和筛选状态
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedFramework = ref('');
const selectedSort = ref('downloadCount');
const currentPage = ref(1);
const pageSize = ref(12);
const loading = ref(false);

// 模拟组件数据
const mockComponents: ComponentItem[] = [
  {
    id: '1',
    name: 'VButton',
    description: '通用按钮组件，支持多种样式和尺寸',
    category: '基础组件',
    framework: 'Vue3',
    version: 'v1.2.0',
    downloadCount: 1250,
    rating: 4.8,
    author: '前端团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team',
    tags: ['按钮', '基础组件', 'UI'],
    isOfficial: true,
    preview: 'https://example.com/preview/button',
    thumbnail: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=Button',
    createTime: '2024-01-01',
    status: 'published',
  },
  {
    id: '2',
    name: 'VTable',
    description: '功能强大的数据表格组件，支持排序、筛选、分页',
    category: '数据展示',
    framework: 'Vue3',
    version: 'v2.1.0',
    downloadCount: 890,
    rating: 4.6,
    author: '开发者A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
    tags: ['表格', '数据展示', '分页'],
    isOfficial: false,
    thumbnail: 'https://via.placeholder.com/300x200/059669/ffffff?text=Table',
    createTime: '2024-01-05',
    status: 'published',
  },
  {
    id: '3',
    name: 'VForm',
    description: '智能表单组件，支持动态表单和复杂验证',
    category: '数据录入',
    framework: 'Vue3',
    version: 'v1.5.0',
    downloadCount: 650,
    rating: 4.7,
    author: '表单团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=form',
    tags: ['表单', '验证', '动态'],
    isOfficial: true,
    preview: 'https://example.com/preview/form',
    thumbnail: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Form',
    createTime: '2024-01-08',
    status: 'published',
  },
  {
    id: '4',
    name: 'VChart',
    description: '基于ECharts的图表组件库，支持多种图表类型',
    category: '数据可视化',
    framework: 'Vue3',
    version: 'v3.0.0',
    downloadCount: 420,
    rating: 4.5,
    author: '可视化团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chart',
    tags: ['图表', '可视化', 'ECharts'],
    isOfficial: true,
    thumbnail: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Chart',
    createTime: '2024-01-12',
    status: 'published',
  },
  {
    id: '5',
    name: 'VUpload',
    description: '文件上传组件，支持拖拽上传、进度显示',
    category: '数据录入',
    framework: 'Vue3',
    version: 'v1.1.0',
    downloadCount: 380,
    rating: 4.4,
    author: '开发者B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=upload',
    tags: ['上传', '文件', '拖拽'],
    isOfficial: false,
    thumbnail: 'https://via.placeholder.com/300x200/ea580c/ffffff?text=Upload',
    createTime: '2024-01-15',
    status: 'published',
  },
  {
    id: '6',
    name: 'VDatePicker',
    description: '日期选择器组件，支持日期范围选择',
    category: '数据录入',
    framework: 'Vue3',
    version: 'v1.3.0',
    downloadCount: 320,
    rating: 4.3,
    author: '时间团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=date',
    tags: ['日期', '选择器', '时间'],
    isOfficial: true,
    thumbnail:
      'https://via.placeholder.com/300x200/0891b2/ffffff?text=DatePicker',
    createTime: '2024-01-18',
    status: 'published',
  },
];

// 分类选项
const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '基础组件', value: '基础组件' },
  { label: '数据展示', value: '数据展示' },
  { label: '数据录入', value: '数据录入' },
  { label: '数据可视化', value: '数据可视化' },
  { label: '导航', value: '导航' },
  { label: '反馈', value: '反馈' },
  { label: '布局', value: '布局' },
];

// 框架选项
const frameworkOptions = [
  { label: '全部框架', value: '' },
  { label: 'Vue3', value: 'Vue3' },
  { label: 'React', value: 'React' },
  { label: 'Angular', value: 'Angular' },
  { label: 'Vanilla', value: 'Vanilla' },
];

// 排序选项
const sortOptions = [
  { label: '下载量', value: 'downloadCount' },
  { label: '评分', value: 'rating' },
  { label: '最新', value: 'createTime' },
  { label: '名称', value: 'name' },
];

/**
 * 过滤和排序组件列表
 */
const filteredComponents = computed(() => {
  let result = [...mockComponents];

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword)),
    );
  }

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter((item) => item.category === selectedCategory.value);
  }

  // 框架筛选
  if (selectedFramework.value) {
    result = result.filter(
      (item) => item.framework === selectedFramework.value,
    );
  }

  // 排序
  result.sort((a, b) => {
    switch (selectedSort.value) {
      case 'downloadCount':
        return b.downloadCount - a.downloadCount;
      case 'rating':
        return b.rating - a.rating;
      case 'createTime':
        return (
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        );
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return result;
});

/**
 * 分页后的组件列表
 */
const paginatedComponents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredComponents.value.slice(start, end);
});

/**
 * 总数
 */
const total = computed(() => filteredComponents.value.length);

/**
 * 搜索处理
 */
function handleSearch() {
  currentPage.value = 1;
}

/**
 * 重置筛选
 */
function resetFilters() {
  searchKeyword.value = '';
  selectedCategory.value = '';
  selectedFramework.value = '';
  selectedSort.value = 'downloadCount';
  currentPage.value = 1;
}

/**
 * 查看组件详情
 * @param component 组件信息
 */
function viewComponent(component: ComponentItem) {
  router.push(`/material/detail/${component.id}`);
}

/**
 * 预览组件
 * @param component 组件信息
 */
function previewComponent(component: ComponentItem) {
  if (component.preview) {
    window.open(component.preview, '_blank');
  } else {
    message.info('该组件暂无预览');
  }
}

/**
 * 下载组件
 * @param component 组件信息
 */
function downloadComponent(component: ComponentItem) {
  message.success(`正在下载"${component.name}"...`);
  // 这里应该调用下载API
}

/**
 * 收藏组件
 * @param component 组件信息
 */
function starComponent(component: ComponentItem) {
  message.success(`已收藏"${component.name}"`);
}

/**
 * 创建新组件
 */
function createComponent() {
  router.push('/material/create?type=component');
}

/**
 * 页码变化
 * @param page 页码
 */
function onPageChange(page: number) {
  currentPage.value = page;
}
</script>

<template>
  <Page
    description="组件库管理 - 浏览、搜索和管理可复用的UI组件"
    title="组件库"
  >
    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <div class="flex flex-col gap-4">
        <!-- 搜索栏 -->
        <div class="flex gap-4">
          <Input.Search
            v-model:value="searchKeyword"
            placeholder="搜索组件名称、描述或标签..."
            class="flex-1"
            @search="handleSearch"
          >
            <template #prefix>
              <Search class="size-4 text-gray-400" />
            </template>
          </Input.Search>
          <Button type="primary" @click="createComponent">
            <template #icon>
              <Plus class="size-4" />
            </template>
            新建组件
          </Button>
        </div>

        <!-- 筛选栏 -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Filter class="size-4 text-gray-500" />
            <span class="text-sm text-gray-600">筛选:</span>
          </div>
          <Select
            v-model:value="selectedCategory"
            :options="categoryOptions"
            placeholder="选择分类"
            class="w-32"
            @change="handleSearch"
          />
          <Select
            v-model:value="selectedFramework"
            :options="frameworkOptions"
            placeholder="选择框架"
            class="w-32"
            @change="handleSearch"
          />
          <Select
            v-model:value="selectedSort"
            :options="sortOptions"
            placeholder="排序方式"
            class="w-32"
            @change="handleSearch"
          />
          <Button @click="resetFilters">重置</Button>
        </div>
      </div>
    </Card>

    <!-- 组件列表 -->
    <div v-if="paginatedComponents.length > 0" class="space-y-6">
      <!-- 统计信息 -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600"> 共找到 {{ total }} 个组件 </span>
      </div>

      <!-- 组件网格 -->
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <Card
          v-for="component in paginatedComponents"
          :key="component.id"
          class="component-card cursor-pointer transition-shadow hover:shadow-lg"
          @click="viewComponent(component)"
        >
          <!-- 组件缩略图 -->
          <div class="relative mb-4">
            <img
              :src="component.thumbnail"
              :alt="component.name"
              class="h-32 w-full rounded object-cover"
            />
            <div class="absolute right-2 top-2 flex gap-1">
              <Tag v-if="component.isOfficial" color="gold" size="small"
                >官方</Tag
              >
              <Tag color="blue" size="small">{{ component.framework }}</Tag>
            </div>
          </div>

          <!-- 组件信息 -->
          <div class="space-y-3">
            <!-- 标题和版本 -->
            <div class="flex items-center justify-between">
              <h3 class="truncate text-lg font-semibold">
                {{ component.name }}
              </h3>
              <Tag color="geekblue" size="small">{{ component.version }}</Tag>
            </div>

            <!-- 描述 -->
            <p class="line-clamp-2 text-sm text-gray-600">
              {{ component.description }}
            </p>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="tag in component.tags.slice(0, 3)"
                :key="tag"
                size="small"
                color="default"
              >
                {{ tag }}
              </Tag>
              <span
                v-if="component.tags.length > 3"
                class="text-xs text-gray-400"
              >
                +{{ component.tags.length - 3 }}
              </span>
            </div>

            <!-- 作者和统计 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Avatar :src="component.avatar" :size="20" />
                <span class="text-xs text-gray-500">{{
                  component.author
                }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <Download class="size-3" />
                  <span>{{ component.downloadCount.toLocaleString() }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Rate
                    :value="component.rating"
                    disabled
                    style="font-size: 10px"
                  />
                  <span>{{ component.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-2" @click.stop>
              <Tooltip title="查看详情">
                <Button size="small" @click="viewComponent(component)">
                  <Eye class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="预览" v-if="component.preview">
                <Button size="small" @click="previewComponent(component)">
                  <Search class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="下载">
                <Button size="small" @click="downloadComponent(component)">
                  <Download class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="收藏">
                <Button size="small" @click="starComponent(component)">
                  <Star class="size-3" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      </div>

      <!-- 分页 -->
      <div class="flex justify-center pt-6">
        <Pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          :show-size-changer="false"
          :show-quick-jumper="true"
          :show-total="
            (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          "
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <Card v-else>
      <Empty description="暂无组件" :image="Empty.PRESENTED_IMAGE_SIMPLE">
        <Button type="primary" @click="createComponent">
          创建第一个组件
        </Button>
      </Empty>
    </Card>
  </Page>
</template>

<style scoped>
.component-card {
  transition: all 0.3s ease;
}

.component-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
