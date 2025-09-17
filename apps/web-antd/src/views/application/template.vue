<template>
  <div class="project-template">
    <Page description="选择和管理项目模板" title="项目模板">
      <template #extra>
        <Button type="primary" @click="onCreateTemplate">
          <template #icon>
            <Plus class="size-4" />
          </template>
          创建模板
        </Button>
      </template>

      <!-- 搜索和筛选 -->
      <Card class="mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <Input
            v-model:value="searchKeyword"
            placeholder="搜索模板名称或描述"
            class="w-64"
            @input="onSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </Input>

          <Select
            v-model:value="selectedCategory"
            placeholder="选择分类"
            class="w-40"
            @change="onCategoryChange"
          >
            <SelectOption value="">全部分类</SelectOption>
            <SelectOption value="web">Web应用</SelectOption>
            <SelectOption value="mobile">移动应用</SelectOption>
            <SelectOption value="desktop">桌面应用</SelectOption>
            <SelectOption value="api">API服务</SelectOption>
            <SelectOption value="library">组件库</SelectOption>
          </Select>

          <Select
            v-model:value="selectedTech"
            placeholder="选择技术栈"
            class="w-40"
            @change="onTechChange"
          >
            <SelectOption value="">全部技术</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="nodejs">Node.js</SelectOption>
            <SelectOption value="python">Python</SelectOption>
          </Select>
        </div>
      </Card>

      <!-- 模板列表 -->
      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <Card
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card cursor-pointer transition-shadow hover:shadow-lg"
          @click="onTemplateClick(template)"
        >
          <template #cover>
            <div
              class="flex h-32 items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"
            >
              <component
                :is="getTemplateIcon(template.category)"
                class="text-4xl text-white"
              />
            </div>
          </template>

          <template #actions>
            <Tooltip title="预览">
              <EyeOutlined @click.stop="onPreview(template)" />
            </Tooltip>
            <Tooltip title="使用模板">
              <PlayCircleOutlined @click.stop="onUseTemplate(template)" />
            </Tooltip>
            <Tooltip title="编辑">
              <EditOutlined @click.stop="onEditTemplate(template)" />
            </Tooltip>
            <Tooltip title="删除">
              <DeleteOutlined @click.stop="onDeleteTemplate(template)" />
            </Tooltip>
          </template>

          <CardMeta
            :title="template.name"
            :description="template.description"
          />

          <div class="mt-4 space-y-2">
            <div
              class="flex items-center justify-between text-sm text-gray-500"
            >
              <span>{{ template.category }}</span>
              <span>{{ template.downloads }} 下载</span>
            </div>

            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="tech in template.technologies.slice(0, 3)"
                :key="tech"
                size="small"
                color="blue"
              >
                {{ tech }}
              </Tag>
              <Tag
                v-if="template.technologies.length > 3"
                size="small"
                color="default"
              >
                +{{ template.technologies.length - 3 }}
              </Tag>
            </div>

            <div class="flex items-center justify-between">
              <Rate
                :value="template.rating"
                disabled
                :count="5"
                class="text-xs"
              />
              <span class="text-xs text-gray-500">{{
                template.updateTime
              }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- 空状态 -->
      <Empty
        v-if="filteredTemplates.length === 0"
        description="暂无模板"
        class="mt-8"
      />
    </Page>

    <!-- 模板详情抽屉 -->
    <Drawer v-model:open="drawerVisible" title="模板详情" width="600">
      <div v-if="selectedTemplate" class="space-y-6">
        <!-- 模板基本信息 -->
        <div>
          <h3 class="mb-3 text-lg font-semibold">
            {{ selectedTemplate.name }}
          </h3>
          <p class="mb-4 text-gray-600">{{ selectedTemplate.description }}</p>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">分类：</span>
              <span>{{ selectedTemplate.category }}</span>
            </div>
            <div>
              <span class="text-gray-500">版本：</span>
              <span>{{ selectedTemplate.version }}</span>
            </div>
            <div>
              <span class="text-gray-500">作者：</span>
              <span>{{ selectedTemplate.author }}</span>
            </div>
            <div>
              <span class="text-gray-500">下载量：</span>
              <span>{{ selectedTemplate.downloads }}</span>
            </div>
          </div>
        </div>

        <!-- 技术栈 -->
        <div>
          <h4 class="mb-2 font-medium">技术栈</h4>
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="tech in selectedTemplate.technologies"
              :key="tech"
              color="blue"
            >
              {{ tech }}
            </Tag>
          </div>
        </div>

        <!-- 特性 -->
        <div>
          <h4 class="mb-2 font-medium">特性</h4>
          <ul class="space-y-1">
            <li
              v-for="feature in selectedTemplate.features"
              :key="feature"
              class="flex items-center space-x-2"
            >
              <CheckCircleOutlined class="text-green-500" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- 预览图 -->
        <div v-if="selectedTemplate.preview">
          <h4 class="mb-2 font-medium">预览</h4>
          <img
            :src="selectedTemplate.preview"
            :alt="selectedTemplate.name"
            class="w-full rounded border"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-3">
          <Button type="primary" block @click="onUseTemplate(selectedTemplate)">
            使用此模板
          </Button>
          <Button block @click="onDownloadTemplate(selectedTemplate)">
            下载模板
          </Button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  AppstoreOutlined,
  MobileOutlined,
  DesktopOutlined,
  ApiOutlined,
  BlockOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  CardMeta,
  Drawer,
  Empty,
  Input,
  Rate,
  Select,
  SelectOption,
  Tag,
  Tooltip,
} from 'ant-design-vue';

/**
 * 项目模板页面组件
 * 提供模板的浏览、搜索、使用等功能
 */

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'library';
  technologies: string[];
  features: string[];
  author: string;
  version: string;
  downloads: number;
  rating: number;
  updateTime: string;
  preview?: string;
  repository?: string;
  documentation?: string;
}

const router = useRouter();

// 响应式数据
const templates = ref<ProjectTemplate[]>([]);
const searchKeyword = ref('');
const selectedCategory = ref('');
const selectedTech = ref('');
const drawerVisible = ref(false);
const selectedTemplate = ref<ProjectTemplate>();

/**
 * 获取模板列表
 * @returns 模板列表
 */
const getTemplates = async (): Promise<ProjectTemplate[]> => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: 'tpl_001',
      name: 'Vue3 Admin Dashboard',
      description:
        '基于Vue3的现代化管理后台模板，包含完整的权限管理和数据可视化功能',
      category: 'web',
      technologies: ['Vue3', 'TypeScript', 'Vite', 'Pinia', 'Ant Design Vue'],
      features: [
        '权限管理',
        '数据可视化',
        '多语言支持',
        '主题切换',
        '响应式设计',
      ],
      author: '张三',
      version: '1.2.0',
      downloads: 1250,
      rating: 4.8,
      updateTime: '2024-01-20',
      repository: 'https://github.com/example/vue3-admin',
    },
    {
      id: 'tpl_002',
      name: 'React E-commerce',
      description: '电商平台前端模板，支持商品展示、购物车、订单管理等功能',
      category: 'web',
      technologies: [
        'React',
        'TypeScript',
        'Next.js',
        'Redux Toolkit',
        'Material-UI',
      ],
      features: ['商品管理', '购物车', '支付集成', '用户中心', 'SEO优化'],
      author: '李四',
      version: '2.1.0',
      downloads: 890,
      rating: 4.6,
      updateTime: '2024-01-18',
    },
    {
      id: 'tpl_003',
      name: 'Flutter Mobile App',
      description: '跨平台移动应用模板，包含常用的移动端功能和组件',
      category: 'mobile',
      technologies: [
        'Flutter',
        'Dart',
        'Provider',
        'Dio',
        'Shared Preferences',
      ],
      features: ['用户认证', '数据缓存', '推送通知', '地图集成', '相机功能'],
      author: '王五',
      version: '1.0.5',
      downloads: 650,
      rating: 4.4,
      updateTime: '2024-01-15',
    },
    {
      id: 'tpl_004',
      name: 'Node.js API Server',
      description:
        'RESTful API服务器模板，包含认证、数据库集成、文档生成等功能',
      category: 'api',
      technologies: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Swagger'],
      features: ['JWT认证', '数据验证', 'API文档', '错误处理', '日志记录'],
      author: '赵六',
      version: '1.3.2',
      downloads: 1100,
      rating: 4.7,
      updateTime: '2024-01-22',
    },
    {
      id: 'tpl_005',
      name: 'Vue Component Library',
      description: 'Vue组件库模板，包含组件开发、文档生成、测试等完整工具链',
      category: 'library',
      technologies: ['Vue3', 'TypeScript', 'Vite', 'Vitest', 'VitePress'],
      features: ['组件开发', '文档生成', '单元测试', '构建优化', '发布流程'],
      author: '钱七',
      version: '1.1.0',
      downloads: 420,
      rating: 4.5,
      updateTime: '2024-01-10',
    },
  ];
};

// 计算属性：过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value;

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (template) =>
        template.name.toLowerCase().includes(keyword) ||
        template.description.toLowerCase().includes(keyword),
    );
  }

  // 按分类筛选
  if (selectedCategory.value) {
    result = result.filter(
      (template) => template.category === selectedCategory.value,
    );
  }

  // 按技术栈筛选
  if (selectedTech.value) {
    result = result.filter((template) =>
      template.technologies.some((tech) =>
        tech.toLowerCase().includes(selectedTech.value.toLowerCase()),
      ),
    );
  }

  return result;
});

/**
 * 获取模板图标
 * @param category 分类
 * @returns 图标组件
 */
function getTemplateIcon(category: string) {
  switch (category) {
    case 'web':
      return AppstoreOutlined;
    case 'mobile':
      return MobileOutlined;
    case 'desktop':
      return DesktopOutlined;
    case 'api':
      return ApiOutlined;
    case 'library':
      return BlockOutlined;
    default:
      return AppstoreOutlined;
  }
}

/**
 * 搜索处理
 */
function onSearch() {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 分类变更处理
 */
function onCategoryChange() {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 技术栈变更处理
 */
function onTechChange() {
  // 筛选逻辑已在计算属性中处理
}

/**
 * 模板点击处理
 * @param template 模板数据
 */
function onTemplateClick(template: ProjectTemplate) {
  selectedTemplate.value = template;
  drawerVisible.value = true;
}

/**
 * 预览模板
 * @param template 模板数据
 */
function onPreview(template: ProjectTemplate) {
  selectedTemplate.value = template;
  drawerVisible.value = true;
}

/**
 * 使用模板
 * @param template 模板数据
 */
function onUseTemplate(template: ProjectTemplate) {
  // 跳转到项目创建页面，并传递模板信息
  router.push({
    path: '/project/create',
    query: { template: template.id },
  });
}

/**
 * 编辑模板
 * @param template 模板数据
 */
function onEditTemplate(template: ProjectTemplate) {
  console.log('编辑模板:', template.name);
  // 这里可以打开编辑模板的弹窗或页面
}

/**
 * 删除模板
 * @param template 模板数据
 */
function onDeleteTemplate(template: ProjectTemplate) {
  console.log('删除模板:', template.name);
  // 这里可以显示确认删除的对话框
}

/**
 * 下载模板
 * @param template 模板数据
 */
function onDownloadTemplate(template: ProjectTemplate) {
  console.log('下载模板:', template.name);
  // 这里可以触发模板下载
}

/**
 * 创建模板
 */
function onCreateTemplate() {
  console.log('创建新模板');
  // 这里可以打开创建模板的弹窗或页面
}

/**
 * 初始化数据
 */
onMounted(async () => {
  try {
    templates.value = await getTemplates();
  } catch (error) {
    console.error('获取模板列表失败:', error);
  }
});
</script>

<style scoped>
.project-template {
  height: 100%;
}

.template-card {
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}
</style>
