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
  Copy,
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
} from 'ant-design-vue';

// 代码片段接口类型
interface SnippetItem {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  framework?: string;
  code: string;
  downloadCount: number;
  rating: number;
  author: string;
  avatar?: string;
  tags: string[];
  isOfficial: boolean;
  createTime: string;
  status: 'published' | 'draft';
  complexity: 'simple' | 'medium' | 'complex';
}

const router = useRouter();

// 搜索和筛选状态
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedLanguage = ref('');
const selectedComplexity = ref('');
const selectedSort = ref('downloadCount');
const currentPage = ref(1);
const pageSize = ref(12);
const loading = ref(false);

// 代码预览模态框
const previewVisible = ref(false);
const previewSnippet = ref<SnippetItem | null>(null);

// 模拟代码片段数据
const mockSnippets: SnippetItem[] = [
  {
    id: '1',
    title: '防抖函数',
    description: '通用防抖函数，用于限制函数调用频率',
    category: '工具函数',
    language: 'TypeScript',
    framework: 'Vue3',
    code: `/**\n * 防抖函数\n * @param func 要防抖的函数\n * @param delay 延迟时间(ms)\n * @returns 防抖后的函数\n */\nexport function debounce<T extends (...args: any[]) => any>(\n  func: T,\n  delay: number\n): (...args: Parameters<T>) => void {\n  let timeoutId: NodeJS.Timeout | null = null;\n  \n  return function (...args: Parameters<T>) {\n    if (timeoutId) {\n      clearTimeout(timeoutId);\n    }\n    \n    timeoutId = setTimeout(() => {\n      func.apply(this, args);\n    }, delay);\n  };\n}\n\n// 使用示例\nconst debouncedSearch = debounce((query: string) => {\n  console.log('搜索:', query);\n}, 300);`,
    downloadCount: 1250,
    rating: 4.8,
    author: '工具团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=utils',
    tags: ['防抖', '工具函数', '性能优化'],
    isOfficial: true,
    createTime: '2024-01-01',
    status: 'published',
    complexity: 'simple',
  },
  {
    id: '2',
    title: '表单验证规则',
    description: '常用的表单验证规则集合',
    category: '表单验证',
    language: 'TypeScript',
    framework: 'Vue3',
    code: `import type { Rule } from 'ant-design-vue/es/form';\n\n// 手机号验证\nexport const phoneRule: Rule = {\n  pattern: /^1[3-9]\\d{9}$/,\n  message: '请输入正确的手机号码',\n};\n\n// 邮箱验证\nexport const emailRule: Rule = {\n  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,\n  message: '请输入正确的邮箱地址',\n};\n\n// 身份证验证\nexport const idCardRule: Rule = {\n  pattern: /^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$/,\n  message: '请输入正确的身份证号码',\n};\n\n// 密码强度验证\nexport const passwordRule: Rule = {\n  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$/,\n  message: '密码至少8位，包含大小写字母和数字',\n};`,
    downloadCount: 890,
    rating: 4.6,
    author: '表单专家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=form',
    tags: ['表单', '验证', '正则'],
    isOfficial: true,
    createTime: '2024-01-05',
    status: 'published',
    complexity: 'medium',
  },
  {
    id: '3',
    title: 'HTTP请求封装',
    description: '基于axios的HTTP请求封装，包含拦截器和错误处理',
    category: 'HTTP请求',
    language: 'TypeScript',
    code: `import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';\n\nclass HttpClient {\n  private instance: AxiosInstance;\n\n  constructor(baseURL: string) {\n    this.instance = axios.create({\n      baseURL,\n      timeout: 10000,\n    });\n\n    this.setupInterceptors();\n  }\n\n  private setupInterceptors() {\n    // 请求拦截器\n    this.instance.interceptors.request.use(\n      (config) => {\n        const token = localStorage.getItem('token');\n        if (token) {\n          config.headers.Authorization = \`Bearer \${token}\`;\n        }\n        return config;\n      },\n      (error) => Promise.reject(error)\n    );\n\n    // 响应拦截器\n    this.instance.interceptors.response.use(\n      (response: AxiosResponse) => response.data,\n      (error) => {\n        if (error.response?.status === 401) {\n          // 处理未授权\n          localStorage.removeItem('token');\n          window.location.href = '/login';\n        }\n        return Promise.reject(error);\n      }\n    );\n  }\n\n  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {\n    return this.instance.get(url, config);\n  }\n\n  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {\n    return this.instance.post(url, data, config);\n  }\n}\n\nexport const httpClient = new HttpClient('/api');`,
    downloadCount: 650,
    rating: 4.7,
    author: 'API团队',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=api',
    tags: ['HTTP', 'axios', '请求封装'],
    isOfficial: true,
    createTime: '2024-01-08',
    status: 'published',
    complexity: 'complex',
  },
  {
    id: '4',
    title: '日期格式化工具',
    description: '常用的日期格式化函数集合',
    category: '工具函数',
    language: 'TypeScript',
    code: `/**\n * 格式化日期\n * @param date 日期对象或时间戳\n * @param format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'\n * @returns 格式化后的日期字符串\n */\nexport function formatDate(date: Date | number | string, format = 'YYYY-MM-DD HH:mm:ss'): string {\n  const d = new Date(date);\n  \n  const year = d.getFullYear();\n  const month = String(d.getMonth() + 1).padStart(2, '0');\n  const day = String(d.getDate()).padStart(2, '0');\n  const hours = String(d.getHours()).padStart(2, '0');\n  const minutes = String(d.getMinutes()).padStart(2, '0');\n  const seconds = String(d.getSeconds()).padStart(2, '0');\n\n  return format\n    .replace('YYYY', String(year))\n    .replace('MM', month)\n    .replace('DD', day)\n    .replace('HH', hours)\n    .replace('mm', minutes)\n    .replace('ss', seconds);\n}\n\n/**\n * 获取相对时间\n * @param date 日期\n * @returns 相对时间字符串\n */\nexport function getRelativeTime(date: Date | number | string): string {\n  const now = new Date();\n  const target = new Date(date);\n  const diff = now.getTime() - target.getTime();\n\n  const minute = 60 * 1000;\n  const hour = 60 * minute;\n  const day = 24 * hour;\n\n  if (diff < minute) return '刚刚';\n  if (diff < hour) return \`\${Math.floor(diff / minute)}分钟前\`;\n  if (diff < day) return \`\${Math.floor(diff / hour)}小时前\`;\n  if (diff < 7 * day) return \`\${Math.floor(diff / day)}天前\`;\n  \n  return formatDate(target, 'YYYY-MM-DD');\n}`,
    downloadCount: 420,
    rating: 4.5,
    author: '时间专家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=time',
    tags: ['日期', '格式化', '时间'],
    isOfficial: false,
    createTime: '2024-01-12',
    status: 'published',
    complexity: 'simple',
  },
  {
    id: '5',
    title: 'Vue3 Composable Hook',
    description: '通用的Vue3 Composable Hook模板',
    category: 'Vue Hooks',
    language: 'TypeScript',
    framework: 'Vue3',
    code: `import { ref, computed, onMounted, onUnmounted } from 'vue';\n\n/**\n * 通用列表管理Hook\n * @param fetchFn 获取数据的函数\n * @returns 列表状态和操作方法\n */\nexport function useList<T>(fetchFn: (params?: any) => Promise<{ items: T[]; total: number }>) {\n  const loading = ref(false);\n  const list = ref<T[]>([]);\n  const total = ref(0);\n  const current = ref(1);\n  const pageSize = ref(10);\n\n  const pagination = computed(() => ({\n    current: current.value,\n    pageSize: pageSize.value,\n    total: total.value,\n    showSizeChanger: true,\n    showQuickJumper: true,\n  }));\n\n  async function fetchData(params?: any) {\n    loading.value = true;\n    try {\n      const result = await fetchFn({\n        page: current.value,\n        pageSize: pageSize.value,\n        ...params,\n      });\n      list.value = result.items;\n      total.value = result.total;\n    } catch (error) {\n      console.error('获取数据失败:', error);\n    } finally {\n      loading.value = false;\n    }\n  }\n\n  function refresh() {\n    fetchData();\n  }\n\n  function onPageChange(page: number, size: number) {\n    current.value = page;\n    pageSize.value = size;\n    fetchData();\n  }\n\n  onMounted(() => {\n    fetchData();\n  });\n\n  return {\n    loading,\n    list,\n    total,\n    pagination,\n    fetchData,\n    refresh,\n    onPageChange,\n  };\n}`,
    downloadCount: 380,
    rating: 4.4,
    author: 'Vue专家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vue',
    tags: ['Vue3', 'Composable', 'Hook'],
    isOfficial: true,
    createTime: '2024-01-15',
    status: 'published',
    complexity: 'medium',
  },
];

// 分类选项
const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '工具函数', value: '工具函数' },
  { label: '表单验证', value: '表单验证' },
  { label: 'HTTP请求', value: 'HTTP请求' },
  { label: 'Vue Hooks', value: 'Vue Hooks' },
  { label: '数据处理', value: '数据处理' },
  { label: '样式工具', value: '样式工具' },
];

// 语言选项
const languageOptions = [
  { label: '全部语言', value: '' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'CSS', value: 'CSS' },
  { label: 'SCSS', value: 'SCSS' },
  { label: 'Less', value: 'Less' },
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
  { label: '最新', value: 'createTime' },
  { label: '标题', value: 'title' },
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
 * 过滤和排序代码片段列表
 */
const filteredSnippets = computed(() => {
  let result = [...mockSnippets];

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword)),
    );
  }

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter((item) => item.category === selectedCategory.value);
  }

  // 语言筛选
  if (selectedLanguage.value) {
    result = result.filter((item) => item.language === selectedLanguage.value);
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
      case 'createTime':
        return (
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        );
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return result;
});

/**
 * 分页后的代码片段列表
 */
const paginatedSnippets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSnippets.value.slice(start, end);
});

/**
 * 总数
 */
const total = computed(() => filteredSnippets.value.length);

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
  selectedLanguage.value = '';
  selectedComplexity.value = '';
  selectedSort.value = 'downloadCount';
  currentPage.value = 1;
}

/**
 * 查看代码片段详情
 * @param snippet 代码片段信息
 */
function viewSnippet(snippet: SnippetItem) {
  router.push(`/material/detail/${snippet.id}`);
}

/**
 * 预览代码
 * @param snippet 代码片段信息
 */
function previewCode(snippet: SnippetItem) {
  previewSnippet.value = snippet;
  previewVisible.value = true;
}

/**
 * 复制代码
 * @param code 代码内容
 */
async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
}

/**
 * 下载代码片段
 * @param snippet 代码片段信息
 */
function downloadSnippet(snippet: SnippetItem) {
  const blob = new Blob([snippet.code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${snippet.title}.${snippet.language.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  message.success(`"${snippet.title}" 已下载`);
}

/**
 * 收藏代码片段
 * @param snippet 代码片段信息
 */
function starSnippet(snippet: SnippetItem) {
  message.success(`已收藏"${snippet.title}"`);
}

/**
 * 创建新代码片段
 */
function createSnippet() {
  router.push('/material/create?type=snippet');
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
    description="代码片段管理 - 浏览、搜索和管理可复用的代码片段"
    title="代码片段"
  >
    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <div class="flex flex-col gap-4">
        <!-- 搜索栏 -->
        <div class="flex gap-4">
          <Input.Search
            v-model:value="searchKeyword"
            placeholder="搜索代码片段标题、描述或标签..."
            class="flex-1"
            @search="handleSearch"
          >
            <template #prefix>
              <Search class="size-4 text-gray-400" />
            </template>
          </Input.Search>
          <Button type="primary" @click="createSnippet">
            <template #icon>
              <Plus class="size-4" />
            </template>
            新建片段
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
            v-model:value="selectedLanguage"
            :options="languageOptions"
            placeholder="选择语言"
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

    <!-- 代码片段列表 -->
    <div v-if="paginatedSnippets.length > 0" class="space-y-6">
      <!-- 统计信息 -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">
          共找到 {{ total }} 个代码片段
        </span>
      </div>

      <!-- 代码片段网格 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          v-for="snippet in paginatedSnippets"
          :key="snippet.id"
          class="snippet-card transition-shadow hover:shadow-lg"
        >
          <!-- 片段头部 -->
          <div class="mb-4 flex items-start justify-between">
            <div class="flex-1">
              <div class="mb-2 flex items-center gap-2">
                <h3
                  class="cursor-pointer text-lg font-semibold hover:text-blue-600"
                  @click="viewSnippet(snippet)"
                >
                  {{ snippet.title }}
                </h3>
                <Tag v-if="snippet.isOfficial" color="gold" size="small"
                  >官方</Tag
                >
                <Tag color="blue" size="small">{{ snippet.language }}</Tag>
                <Tag
                  :color="complexityColorMap[snippet.complexity]"
                  size="small"
                >
                  {{ complexityTextMap[snippet.complexity] }}
                </Tag>
              </div>
              <p class="mb-3 text-sm text-gray-600">
                {{ snippet.description }}
              </p>
            </div>
          </div>

          <!-- 代码预览 -->
          <div class="group relative mb-4 rounded bg-gray-50 p-3">
            <pre
              class="overflow-hidden text-xs"
              style="max-height: 120px"
            ><code>{{ snippet.code.slice(0, 200) }}{{ snippet.code.length > 200 ? '...' : '' }}</code></pre>
            <div
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-10 group-hover:opacity-100"
            >
              <Button type="primary" size="small" @click="previewCode(snippet)">
                <Code class="mr-1 size-3" />查看完整代码
              </Button>
            </div>
          </div>

          <!-- 标签 -->
          <div class="mb-4 flex flex-wrap gap-1">
            <Tag
              v-for="tag in snippet.tags.slice(0, 4)"
              :key="tag"
              size="small"
              color="default"
            >
              {{ tag }}
            </Tag>
            <span v-if="snippet.tags.length > 4" class="text-xs text-gray-400">
              +{{ snippet.tags.length - 4 }}
            </span>
          </div>

          <!-- 作者和统计 -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Avatar :src="snippet.avatar" :size="20" />
              <span class="text-xs text-gray-500">{{ snippet.author }}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <Download class="size-3" />
                <span>{{ snippet.downloadCount.toLocaleString() }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Rate
                  :value="snippet.rating"
                  disabled
                  style="font-size: 10px"
                />
                <span>{{ snippet.rating }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <Tooltip title="查看详情">
              <Button size="small" @click="viewSnippet(snippet)">
                <Eye class="size-3" />
              </Button>
            </Tooltip>
            <Tooltip title="预览代码">
              <Button size="small" @click="previewCode(snippet)">
                <Code class="size-3" />
              </Button>
            </Tooltip>
            <Tooltip title="复制代码">
              <Button size="small" @click="copyCode(snippet.code)">
                <Copy class="size-3" />
              </Button>
            </Tooltip>
            <Tooltip title="下载">
              <Button size="small" @click="downloadSnippet(snippet)">
                <Download class="size-3" />
              </Button>
            </Tooltip>
            <Tooltip title="收藏">
              <Button size="small" @click="starSnippet(snippet)">
                <Star class="size-3" />
              </Button>
            </Tooltip>
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
      <Empty description="暂无代码片段" :image="Empty.PRESENTED_IMAGE_SIMPLE">
        <Button type="primary" @click="createSnippet">
          创建第一个代码片段
        </Button>
      </Empty>
    </Card>

    <!-- 代码预览模态框 -->
    <Modal
      v-model:open="previewVisible"
      :title="previewSnippet?.title"
      width="80%"
      :footer="null"
      class="code-preview-modal"
    >
      <div v-if="previewSnippet" class="space-y-4">
        <!-- 片段信息 -->
        <div class="flex items-center gap-4 border-b pb-4">
          <Tag color="blue">{{ previewSnippet.language }}</Tag>
          <Tag :color="complexityColorMap[previewSnippet.complexity]">
            {{ complexityTextMap[previewSnippet.complexity] }}
          </Tag>
          <span class="text-sm text-gray-600">{{
            previewSnippet.description
          }}</span>
        </div>

        <!-- 代码内容 -->
        <div class="relative">
          <pre
            class="max-h-96 overflow-x-auto rounded bg-gray-50 p-4"
          ><code>{{ previewSnippet.code }}</code></pre>
          <Button
            class="absolute right-2 top-2"
            size="small"
            @click="copyCode(previewSnippet.code)"
          >
            <Copy class="mr-1 size-3" />复制
          </Button>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2 border-t pt-4">
          <Button @click="downloadSnippet(previewSnippet)">
            <Download class="mr-1 size-3" />下载
          </Button>
          <Button @click="starSnippet(previewSnippet)">
            <Star class="mr-1 size-3" />收藏
          </Button>
          <Button type="primary" @click="viewSnippet(previewSnippet)">
            <Eye class="mr-1 size-3" />查看详情
          </Button>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<style scoped>
.snippet-card {
  transition: all 0.3s ease;
}

.snippet-card:hover {
  transform: translateY(-2px);
}

.code-preview-modal :deep(.ant-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
