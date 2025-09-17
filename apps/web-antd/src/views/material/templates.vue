<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Upload,
  Settings,
  Code,
} from '@vben/icons';

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
  Modal,
  Image,
  Progress,
} from 'ant-design-vue';

// 物料模板接口类型
interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  version: string;
  preview?: string;
  thumbnail?: string;
  downloadCount: number;
  rating: number;
  author: string;
  avatar?: string;
  tags: string[];
  isOfficial: boolean;
  createTime: string;
  updateTime: string;
  status: 'published' | 'draft';
  complexity: 'simple' | 'medium' | 'complex';
  size: string;
  dependencies: string[];
  features: string[];
  demoUrl?: string;
  repoUrl?: string;
}

const router = useRouter();

// 搜索和筛选状态
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedFramework = ref('');
const selectedComplexity = ref('');
const selectedSort = ref('downloadCount');
const currentPage = ref(1);
const pageSize = ref(12);
const loading = ref(false);

// 预览模态框
const previewVisible = ref(false);
const previewTemplate = ref<TemplateItem | null>(null);

// 模拟物料模板数据
const mockTemplates: TemplateItem[] = [
  {
    id: '1',
    name: 'Vue3 Admin Dashboard',
    description: '基于Vue3 + TypeScript + Ant Design Vue的现代化管理后台模板',
    category: '管理后台',
    framework: 'Vue3',
    version: '1.2.0',
    preview: 'https://preview.example.com/vue3-admin',
    thumbnail: 'https://picsum.photos/400/300?random=1',
    downloadCount: 2580,
    rating: 4.8,
    author: '前端团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend',
    tags: ['Vue3', 'TypeScript', 'Ant Design', '管理后台', 'Vite'],
    isOfficial: true,
    createTime: '2024-01-01',
    updateTime: '2024-01-20',
    status: 'published',
    complexity: 'complex',
    size: '15.2 MB',
    dependencies: ['vue', 'ant-design-vue', 'vue-router', 'pinia', 'vite'],
    features: ['用户管理', '权限控制', '数据可视化', '主题切换', '国际化'],
    demoUrl: 'https://demo.example.com/vue3-admin',
    repoUrl: 'https://github.com/example/vue3-admin',
  },
  {
    id: '2',
    name: 'React E-commerce',
    description: '完整的React电商前端解决方案，包含购物车、支付等功能',
    category: '电商系统',
    framework: 'React',
    version: '2.1.0',
    preview: 'https://preview.example.com/react-ecommerce',
    thumbnail: 'https://picsum.photos/400/300?random=2',
    downloadCount: 1890,
    rating: 4.6,
    author: 'React专家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=react',
    tags: ['React', 'TypeScript', 'Redux', '电商', 'Tailwind'],
    isOfficial: true,
    createTime: '2024-01-05',
    updateTime: '2024-01-18',
    status: 'published',
    complexity: 'complex',
    size: '22.8 MB',
    dependencies: ['react', 'redux-toolkit', 'react-router-dom', 'tailwindcss'],
    features: ['商品展示', '购物车', '用户认证', '订单管理', '支付集成'],
    demoUrl: 'https://demo.example.com/react-ecommerce',
    repoUrl: 'https://github.com/example/react-ecommerce',
  },
  {
    id: '3',
    name: 'Vue3 Blog System',
    description: '简洁优雅的Vue3博客系统模板，支持Markdown编辑',
    category: '博客系统',
    framework: 'Vue3',
    version: '1.0.5',
    preview: 'https://preview.example.com/vue3-blog',
    thumbnail: 'https://picsum.photos/400/300?random=3',
    downloadCount: 1250,
    rating: 4.5,
    author: '博客达人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=blog',
    tags: ['Vue3', 'Nuxt3', 'Markdown', '博客', 'SSG'],
    isOfficial: false,
    createTime: '2024-01-08',
    updateTime: '2024-01-15',
    status: 'published',
    complexity: 'medium',
    size: '8.5 MB',
    dependencies: ['vue', 'nuxt', 'markdown-it', 'prismjs'],
    features: ['文章管理', 'Markdown编辑', '评论系统', 'SEO优化', '响应式设计'],
    demoUrl: 'https://demo.example.com/vue3-blog',
    repoUrl: 'https://github.com/example/vue3-blog',
  },
  {
    id: '4',
    name: 'React Native App',
    description: '跨平台移动应用模板，包含常用功能和组件',
    category: '移动应用',
    framework: 'React Native',
    version: '1.5.0',
    thumbnail: 'https://picsum.photos/400/300?random=4',
    downloadCount: 980,
    rating: 4.4,
    author: '移动开发者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mobile',
    tags: ['React Native', 'TypeScript', '移动应用', '跨平台'],
    isOfficial: true,
    createTime: '2024-01-10',
    updateTime: '2024-01-22',
    status: 'published',
    complexity: 'complex',
    size: '45.2 MB',
    dependencies: [
      'react-native',
      'react-navigation',
      'react-native-vector-icons',
    ],
    features: ['导航系统', '用户认证', '本地存储', '推送通知', '相机集成'],
    demoUrl: 'https://expo.dev/@example/react-native-app',
  },
  {
    id: '5',
    name: 'Vue3 Landing Page',
    description: '现代化的产品落地页模板，适合产品展示和营销',
    category: '落地页',
    framework: 'Vue3',
    version: '1.1.2',
    preview: 'https://preview.example.com/vue3-landing',
    thumbnail: 'https://picsum.photos/400/300?random=5',
    downloadCount: 750,
    rating: 4.3,
    author: '设计师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer',
    tags: ['Vue3', '落地页', '营销', '响应式', 'GSAP'],
    isOfficial: false,
    createTime: '2024-01-12',
    updateTime: '2024-01-19',
    status: 'published',
    complexity: 'simple',
    size: '5.8 MB',
    dependencies: ['vue', 'gsap', 'intersection-observer'],
    features: ['动画效果', '响应式设计', 'SEO优化', '表单收集', '社交分享'],
    demoUrl: 'https://demo.example.com/vue3-landing',
    repoUrl: 'https://github.com/example/vue3-landing',
  },
  {
    id: '6',
    name: 'Next.js Portfolio',
    description: '个人作品集网站模板，展示项目和技能',
    category: '作品集',
    framework: 'Next.js',
    version: '2.0.1',
    preview: 'https://preview.example.com/nextjs-portfolio',
    thumbnail: 'https://picsum.photos/400/300?random=6',
    downloadCount: 620,
    rating: 4.7,
    author: '全栈开发者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fullstack',
    tags: ['Next.js', 'TypeScript', '作品集', 'SSR', 'Framer Motion'],
    isOfficial: false,
    createTime: '2024-01-14',
    updateTime: '2024-01-21',
    status: 'published',
    complexity: 'medium',
    size: '12.3 MB',
    dependencies: ['next', 'framer-motion', 'tailwindcss', 'contentlayer'],
    features: ['项目展示', '技能图表', '联系表单', '博客集成', '暗黑模式'],
    demoUrl: 'https://demo.example.com/nextjs-portfolio',
    repoUrl: 'https://github.com/example/nextjs-portfolio',
  },
];

// 分类选项
const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '管理后台', value: '管理后台' },
  { label: '电商系统', value: '电商系统' },
  { label: '博客系统', value: '博客系统' },
  { label: '移动应用', value: '移动应用' },
  { label: '落地页', value: '落地页' },
  { label: '作品集', value: '作品集' },
  { label: '企业官网', value: '企业官网' },
];

// 框架选项
const frameworkOptions = [
  { label: '全部框架', value: '' },
  { label: 'Vue3', value: 'Vue3' },
  { label: 'React', value: 'React' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Nuxt3', value: 'Nuxt3' },
  { label: 'React Native', value: 'React Native' },
  { label: 'Angular', value: 'Angular' },
];

// 复杂度选项
const complexityOptions = [
  { label: '全部复杂度', value: '' },
  { label: '简单', value: 'simple' },
  { label: '中等', value: 'medium' },
  { label: '复杂', value: 'complex' },
];

// 排序选项
const sortOptions = [
  { label: '下载量', value: 'downloadCount' },
  { label: '评分', value: 'rating' },
  { label: '最新', value: 'updateTime' },
  { label: '名称', value: 'name' },
];

// 复杂度颜色映射
const complexityColorMap = {
  simple: 'green',
  medium: 'orange',
  complex: 'red',
};

// 复杂度文本映射
const complexityTextMap = {
  simple: '简单',
  medium: '中等',
  complex: '复杂',
};

/**
 * 过滤和排序模板列表
 */
const filteredTemplates = computed(() => {
  let result = [...mockTemplates];

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

  // 复杂度筛选
  if (selectedComplexity.value) {
    result = result.filter(
      (item) => item.complexity === selectedComplexity.value,
    );
  }

  // 排序
  result.sort((a, b) => {
    switch (selectedSort.value) {
      case 'downloadCount':
        return b.downloadCount - a.downloadCount;
      case 'rating':
        return b.rating - a.rating;
      case 'updateTime':
        return (
          new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
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
 * 分页后的模板列表
 */
const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTemplates.value.slice(start, end);
});

/**
 * 总数
 */
const total = computed(() => filteredTemplates.value.length);

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
  selectedComplexity.value = '';
  selectedSort.value = 'downloadCount';
  currentPage.value = 1;
}

/**
 * 查看模板详情
 * @param template 模板信息
 */
function viewTemplate(template: TemplateItem) {
  router.push(`/material/detail/${template.id}`);
}

/**
 * 预览模板
 * @param template 模板信息
 */
function previewTemplate(template: TemplateItem) {
  if (template.preview || template.demoUrl) {
    window.open(template.preview || template.demoUrl, '_blank');
  } else {
    previewTemplate.value = template;
    previewVisible.value = true;
  }
}

/**
 * 下载模板
 * @param template 模板信息
 */
function downloadTemplate(template: TemplateItem) {
  // 模拟下载进度
  const downloadProgress = ref(0);
  const progressModal = Modal.info({
    title: `正在下载 "${template.name}"`,
    content: () => {
      return (
        <div class="space-y-4">
          <Progress percent={downloadProgress.value} />
          <p class="text-sm text-gray-600">文件大小: {template.size}</p>
        </div>
      );
    },
    okText: '取消下载',
    onOk: () => {
      clearInterval(timer);
    },
  });

  const timer = setInterval(() => {
    downloadProgress.value += Math.random() * 20;
    if (downloadProgress.value >= 100) {
      downloadProgress.value = 100;
      clearInterval(timer);
      progressModal.destroy();
      message.success(`"${template.name}" 下载完成`);
    }
  }, 500);
}

/**
 * 收藏模板
 * @param template 模板信息
 */
function starTemplate(template: TemplateItem) {
  message.success(`已收藏"${template.name}"`);
}

/**
 * 使用模板
 * @param template 模板信息
 */
function useTemplate(template: TemplateItem) {
  // 项目创建功能已移除，这里可以改为下载模板或其他操作
  console.log('使用模板:', template.name);
  // 可以添加下载模板的逻辑
}

/**
 * 查看代码仓库
 * @param template 模板信息
 */
function viewRepo(template: TemplateItem) {
  if (template.repoUrl) {
    window.open(template.repoUrl, '_blank');
  } else {
    message.info('该模板暂无代码仓库');
  }
}

/**
 * 创建新模板
 */
function createTemplate() {
  router.push('/material/create?type=template');
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
  <Page description="物料模板管理 - 浏览、搜索和管理项目模板" title="物料模板">
    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <div class="flex flex-col gap-4">
        <!-- 搜索栏 -->
        <div class="flex gap-4">
          <Input.Search
            v-model:value="searchKeyword"
            placeholder="搜索模板名称、描述或标签..."
            class="flex-1"
            @search="handleSearch"
          >
            <template #prefix>
              <Search class="size-4 text-gray-400" />
            </template>
          </Input.Search>
          <Button type="primary" @click="createTemplate">
            <template #icon>
              <Plus class="size-4" />
            </template>
            新建模板
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
            v-model:value="selectedComplexity"
            :options="complexityOptions"
            placeholder="选择复杂度"
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

    <!-- 模板列表 -->
    <div v-if="paginatedTemplates.length > 0" class="space-y-6">
      <!-- 统计信息 -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600"> 共找到 {{ total }} 个模板 </span>
      </div>

      <!-- 模板网格 -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="template in paginatedTemplates"
          :key="template.id"
          class="template-card transition-all hover:shadow-lg"
        >
          <!-- 模板缩略图 -->
          <div class="group relative mb-4">
            <Image
              :src="template.thumbnail"
              :alt="template.name"
              class="h-48 w-full rounded object-cover"
              :preview="false"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-50 group-hover:opacity-100"
            >
              <div class="flex gap-2">
                <Tooltip title="预览">
                  <Button
                    type="primary"
                    size="small"
                    @click="previewTemplate(template)"
                  >
                    <Eye class="size-3" />
                  </Button>
                </Tooltip>
                <Tooltip title="使用模板">
                  <Button
                    type="primary"
                    size="small"
                    @click="useTemplate(template)"
                  >
                    <Download class="size-3" />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <!-- 官方标识 -->
            <Tag
              v-if="template.isOfficial"
              color="gold"
              class="absolute left-2 top-2"
              size="small"
            >
              官方
            </Tag>
          </div>

          <!-- 模板信息 -->
          <div class="space-y-3">
            <!-- 标题和版本 -->
            <div class="flex items-start justify-between">
              <h3
                class="flex-1 cursor-pointer text-lg font-semibold hover:text-blue-600"
                @click="viewTemplate(template)"
              >
                {{ template.name }}
              </h3>
              <Tag color="blue" size="small">v{{ template.version }}</Tag>
            </div>

            <!-- 描述 -->
            <p class="line-clamp-2 text-sm text-gray-600">
              {{ template.description }}
            </p>

            <!-- 框架和复杂度 -->
            <div class="flex items-center gap-2">
              <Tag color="purple" size="small">{{ template.framework }}</Tag>
              <Tag
                :color="complexityColorMap[template.complexity]"
                size="small"
              >
                {{ complexityTextMap[template.complexity] }}
              </Tag>
              <span class="text-xs text-gray-500">{{ template.size }}</span>
            </div>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="tag in template.tags.slice(0, 3)"
                :key="tag"
                size="small"
                color="default"
              >
                {{ tag }}
              </Tag>
              <span
                v-if="template.tags.length > 3"
                class="text-xs text-gray-400"
              >
                +{{ template.tags.length - 3 }}
              </span>
            </div>

            <!-- 作者和统计 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Avatar :src="template.avatar" :size="20" />
                <span class="text-xs text-gray-500">{{ template.author }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <Download class="size-3" />
                  <span>{{ template.downloadCount.toLocaleString() }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Rate
                    :value="template.rating"
                    disabled
                    style="font-size: 10px"
                  />
                  <span>{{ template.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 功能特性 -->
            <div class="space-y-2">
              <div class="text-xs text-gray-600">主要功能:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="feature in template.features.slice(0, 3)"
                  :key="feature"
                  class="rounded bg-gray-100 px-2 py-1 text-xs"
                >
                  {{ feature }}
                </span>
                <span
                  v-if="template.features.length > 3"
                  class="text-xs text-gray-400"
                >
                  +{{ template.features.length - 3 }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 border-t pt-2">
              <Tooltip title="查看详情">
                <Button size="small" @click="viewTemplate(template)">
                  <Eye class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="预览">
                <Button size="small" @click="previewTemplate(template)">
                  <Settings class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="查看代码">
                <Button size="small" @click="viewRepo(template)">
                  <Code class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="下载">
                <Button size="small" @click="downloadTemplate(template)">
                  <Download class="size-3" />
                </Button>
              </Tooltip>
              <Tooltip title="收藏">
                <Button size="small" @click="starTemplate(template)">
                  <Star class="size-3" />
                </Button>
              </Tooltip>
              <Button
                type="primary"
                size="small"
                @click="useTemplate(template)"
              >
                使用
              </Button>
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
      <Empty description="暂无模板" :image="Empty.PRESENTED_IMAGE_SIMPLE">
        <Button type="primary" @click="createTemplate"> 创建第一个模板 </Button>
      </Empty>
    </Card>

    <!-- 模板详情预览模态框 -->
    <Modal
      v-model:open="previewVisible"
      :title="previewTemplate?.name"
      width="80%"
      :footer="null"
      class="template-preview-modal"
    >
      <div v-if="previewTemplate" class="space-y-6">
        <!-- 模板基本信息 -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Image
              :src="previewTemplate.thumbnail"
              :alt="previewTemplate.name"
              class="w-full rounded"
            />
          </div>
          <div class="space-y-4">
            <div>
              <h3 class="mb-2 text-lg font-semibold">
                {{ previewTemplate.name }}
              </h3>
              <p class="text-gray-600">{{ previewTemplate.description }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Tag color="purple">{{ previewTemplate.framework }}</Tag>
              <Tag color="blue">v{{ previewTemplate.version }}</Tag>
              <Tag :color="complexityColorMap[previewTemplate.complexity]">
                {{ complexityTextMap[previewTemplate.complexity] }}
              </Tag>
            </div>
            <div class="space-y-2">
              <div class="text-sm font-medium">主要功能:</div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="feature in previewTemplate.features"
                  :key="feature"
                  class="rounded bg-gray-100 px-2 py-1 text-xs"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="text-sm font-medium">技术栈:</div>
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="dep in previewTemplate.dependencies"
                  :key="dep"
                  size="small"
                  color="default"
                >
                  {{ dep }}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2 border-t pt-4">
          <Button @click="downloadTemplate(previewTemplate)">
            <Download class="mr-1 size-3" />下载模板
          </Button>
          <Button @click="starTemplate(previewTemplate)">
            <Star class="mr-1 size-3" />收藏
          </Button>
          <Button @click="viewRepo(previewTemplate)">
            <Code class="mr-1 size-3" />查看代码
          </Button>
          <Button type="primary" @click="useTemplate(previewTemplate)">
            <Settings class="mr-1 size-3" />使用模板
          </Button>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<style scoped>
.template-card {
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-preview-modal :deep(.ant-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
