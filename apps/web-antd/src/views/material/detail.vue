<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { ArrowLeft, Download, Edit, ExternalLink, Github, Star, Eye, Calendar, User, Tag as TagIcon } from '@vben/icons';

import { Button, Card, Descriptions, Tag, Rate, Space, Divider, message, Tabs, TabPane } from 'ant-design-vue';

// 物料详情接口类型
interface MaterialDetail {
  id: string;
  name: string;
  description: string;
  type: 'component' | 'snippet' | 'template' | 'library';
  category: string;
  framework: string;
  language: string;
  version: string;
  status: 'published' | 'draft' | 'deprecated';
  downloadCount: number;
  rating: number;
  author: string;
  createTime: string;
  updateTime: string;
  tags: string[];
  isOfficial: boolean;
  preview?: string;
  repository?: string;
  readme?: string;
  changelog?: string;
  dependencies?: string[];
  devDependencies?: string[];
  files?: Array<{
    name: string;
    path: string;
    content: string;
    language: string;
  }>;
  examples?: Array<{
    title: string;
    description: string;
    code: string;
    language: string;
  }>;
}

const route = useRoute();
const router = useRouter();

const materialDetail = ref<MaterialDetail | null>(null);
const loading = ref(false);
const activeTab = ref('overview');

/**
 * 获取物料详情
 * @param id 物料ID
 */
const getMaterialDetail = async (id: string): Promise<MaterialDetail> => {
  // 模拟API调用
  return {
    id,
    name: 'Button组件',
    description: '通用按钮组件，支持多种样式和尺寸，包含主要按钮、次要按钮、危险按钮等类型，支持加载状态、禁用状态等功能。',
    type: 'component',
    category: '基础组件',
    framework: 'Vue3',
    language: 'TypeScript',
    version: 'v1.2.0',
    status: 'published',
    downloadCount: 1250,
    rating: 4.8,
    author: '前端团队',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-15 14:30:00',
    tags: ['按钮', '基础组件', 'UI', 'TypeScript', 'Vue3'],
    isOfficial: true,
    preview: 'https://example.com/preview/button',
    repository: 'https://github.com/example/button',
    readme: `# Button 组件\n\n通用按钮组件，支持多种样式和尺寸。\n\n## 特性\n\n- 支持多种类型：primary、default、dashed、text、link\n- 支持多种尺寸：large、middle、small\n- 支持加载状态\n- 支持禁用状态\n- 支持图标按钮\n\n## 安装\n\n\`\`\`bash\nnpm install @verto/button\n\`\`\`\n\n## 使用\n\n\`\`\`vue\n<template>\n  <VButton type="primary">主要按钮</VButton>\n</template>\n\n<script setup>\nimport { VButton } from '@verto/button'\n</script>\n\`\`\``,
    changelog: `# 更新日志\n\n## v1.2.0 (2024-01-15)\n\n### 新增\n- 添加了 loading 状态支持\n- 新增 ghost 类型按钮\n\n### 修复\n- 修复了在某些情况下样式不正确的问题\n\n## v1.1.0 (2024-01-08)\n\n### 新增\n- 添加了图标按钮支持\n- 新增 size 属性\n\n## v1.0.0 (2024-01-01)\n\n### 新增\n- 初始版本发布\n- 基础按钮功能`,
    dependencies: ['vue', '@vben/icons'],
    devDependencies: ['@types/node', 'typescript', 'vite'],
    files: [
      {
        name: 'Button.vue',
        path: 'src/Button.vue',
        content: 'Button component code here',
        language: 'vue',
      },
      {
        name: 'index.ts',
        path: 'src/index.ts',
        content: `import Button from './Button.vue'\n\nexport { Button }\nexport default Button`,
        language: 'typescript',
      },
    ],
    examples: [
      {
        title: '基础用法',
        description: '最简单的用法',
        code: `<template>\n  <VButton>默认按钮</VButton>\n  <VButton type="primary">主要按钮</VButton>\n</template>`,
        language: 'vue',
      },
      {
        title: '加载状态',
        description: '添加 loading 属性即可让按钮处于加载状态',
        code: `<template>\n  <VButton :loading="loading" @click="handleClick">\n    点击加载\n  </VButton>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\n\nconst loading = ref(false)\n\nfunction handleClick() {\n  loading.value = true\n  setTimeout(() => {\n    loading.value = false\n  }, 2000)\n}\n</script>`,
        language: 'vue',
      },
    ],
  };
};

/**
 * 加载物料详情
 */
async function loadMaterialDetail() {
  const id = route.params.id as string;
  if (!id) {
    message.error('物料ID不能为空');
    router.push('/material/list');
    return;
  }

  loading.value = true;
  try {
    materialDetail.value = await getMaterialDetail(id);
  } catch (error) {
    message.error('加载物料详情失败');
    console.error('加载物料详情失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 返回列表
 */
function goBack() {
  router.push('/material/list');
}

/**
 * 编辑物料
 */
function editMaterial() {
  if (materialDetail.value) {
    router.push(`/material/edit/${materialDetail.value.id}`);
  }
}

/**
 * 下载物料
 */
function downloadMaterial() {
  if (materialDetail.value) {
    message.success(`正在下载"${materialDetail.value.name}"...`);
    // 这里应该调用下载API
  }
}

/**
 * 预览物料
 */
function previewMaterial() {
  if (materialDetail.value?.preview) {
    window.open(materialDetail.value.preview, '_blank');
  } else {
    message.info('该物料暂无预览');
  }
}

/**
 * 查看代码仓库
 */
function viewRepository() {
  if (materialDetail.value?.repository) {
    window.open(materialDetail.value.repository, '_blank');
  } else {
    message.info('该物料暂无代码仓库');
  }
}

/**
 * 收藏物料
 */
function starMaterial() {
  message.success('收藏成功');
}

/**
 * 类型映射
 */
const typeMap = {
  component: { color: 'blue', text: '组件' },
  snippet: { color: 'green', text: '代码片段' },
  template: { color: 'purple', text: '模板' },
  library: { color: 'orange', text: '库' },
};

/**
 * 状态映射
 */
const statusMap = {
  published: { color: 'success', text: '已发布' },
  draft: { color: 'warning', text: '草稿' },
  deprecated: { color: 'error', text: '已废弃' },
};

/**
 * 计算属性
 */
const typeConfig = computed(() => {
  if (!materialDetail.value) return { color: 'default', text: '' };
  return typeMap[materialDetail.value.type] || { color: 'default', text: materialDetail.value.type };
});

const statusConfig = computed(() => {
  if (!materialDetail.value) return { color: 'default', text: '' };
  return statusMap[materialDetail.value.status] || { color: 'default', text: materialDetail.value.status };
});

onMounted(() => {
  loadMaterialDetail();
});
</script>

<template>
  <Page
    :loading="loading"
    :title="materialDetail?.name || '物料详情'"
    description="查看物料的详细信息、使用文档和示例代码"
  >
    <template #extra>
      <Space>
        <Button @click="goBack">
          <template #icon>
            <ArrowLeft class="size-4" />
          </template>
          返回列表
        </Button>
        <Button @click="starMaterial">
          <template #icon>
            <Star class="size-4" />
          </template>
          收藏
        </Button>
        <Button @click="previewMaterial" v-if="materialDetail?.preview">
          <template #icon>
            <ExternalLink class="size-4" />
          </template>
          预览
        </Button>
        <Button @click="viewRepository" v-if="materialDetail?.repository">
          <template #icon>
            <Github class="size-4" />
          </template>
          代码仓库
        </Button>
        <Button type="primary" @click="downloadMaterial">
          <template #icon>
            <Download class="size-4" />
          </template>
          下载
        </Button>
        <Button @click="editMaterial">
          <template #icon>
            <Edit class="size-4" />
          </template>
          编辑
        </Button>
      </Space>
    </template>

    <div v-if="materialDetail" class="material-detail">
      <!-- 基本信息卡片 -->
      <Card class="mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <h1 class="text-2xl font-bold m-0">{{ materialDetail.name }}</h1>
              <Tag v-if="materialDetail.isOfficial" color="gold">官方</Tag>
              <Tag :color="typeConfig.color">{{ typeConfig.text }}</Tag>
              <Tag :color="statusConfig.color">{{ statusConfig.text }}</Tag>
              <Tag color="geekblue">{{ materialDetail.version }}</Tag>
            </div>
            <p class="text-gray-600 mb-4">{{ materialDetail.description }}</p>
            <div class="flex items-center gap-6 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <User class="size-4" />
                <span>{{ materialDetail.author }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Download class="size-4" />
                <span>{{ materialDetail.downloadCount.toLocaleString() }} 下载</span>
              </div>
              <div class="flex items-center gap-1">
                <Rate :value="materialDetail.rating" disabled allow-half style="font-size: 14px" />
                <span>{{ materialDetail.rating }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Calendar class="size-4" />
                <span>更新于 {{ materialDetail.updateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- 详细信息 -->
      <Tabs v-model:activeKey="activeTab" class="material-tabs">
        <TabPane key="overview" tab="概览">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 基本信息 -->
            <div class="lg:col-span-2">
              <Card title="基本信息" class="mb-6">
                <Descriptions :column="2" bordered>
                  <Descriptions.Item label="物料名称">{{ materialDetail.name }}</Descriptions.Item>
                  <Descriptions.Item label="类型">{{ typeConfig.text }}</Descriptions.Item>
                  <Descriptions.Item label="分类">{{ materialDetail.category }}</Descriptions.Item>
                  <Descriptions.Item label="框架">{{ materialDetail.framework }}</Descriptions.Item>
                  <Descriptions.Item label="语言">{{ materialDetail.language }}</Descriptions.Item>
                  <Descriptions.Item label="版本">{{ materialDetail.version }}</Descriptions.Item>
                  <Descriptions.Item label="状态">{{ statusConfig.text }}</Descriptions.Item>
                  <Descriptions.Item label="作者">{{ materialDetail.author }}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{{ materialDetail.createTime }}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{{ materialDetail.updateTime }}</Descriptions.Item>
                </Descriptions>
              </Card>

              <!-- 标签 -->
              <Card title="标签" v-if="materialDetail.tags?.length">
                <div class="flex flex-wrap gap-2">
                  <Tag v-for="tag in materialDetail.tags" :key="tag" color="blue">
                    <TagIcon class="size-3 mr-1" />{{ tag }}
                  </Tag>
                </div>
              </Card>
            </div>

            <!-- 侧边栏信息 -->
            <div>
              <!-- 依赖信息 -->
              <Card title="依赖" class="mb-4" v-if="materialDetail.dependencies?.length">
                <div class="space-y-2">
                  <div v-for="dep in materialDetail.dependencies" :key="dep" class="text-sm">
                    <code class="bg-gray-100 px-2 py-1 rounded">{{ dep }}</code>
                  </div>
                </div>
              </Card>

              <!-- 开发依赖 -->
              <Card title="开发依赖" v-if="materialDetail.devDependencies?.length">
                <div class="space-y-2">
                  <div v-for="dep in materialDetail.devDependencies" :key="dep" class="text-sm">
                    <code class="bg-gray-100 px-2 py-1 rounded">{{ dep }}</code>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabPane>

        <TabPane key="readme" tab="使用文档">
          <Card>
            <div class="prose max-w-none" v-if="materialDetail.readme">
              <pre class="whitespace-pre-wrap">{{ materialDetail.readme }}</pre>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              暂无使用文档
            </div>
          </Card>
        </TabPane>

        <TabPane key="examples" tab="示例代码">
          <div class="space-y-6" v-if="materialDetail.examples?.length">
            <Card v-for="(example, index) in materialDetail.examples" :key="index">
              <template #title>
                <div class="flex items-center justify-between">
                  <span>{{ example.title }}</span>
                  <Tag>{{ example.language }}</Tag>
                </div>
              </template>
              <p class="text-gray-600 mb-4">{{ example.description }}</p>
              <pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code>{{ example.code }}</code></pre>
            </Card>
          </div>
          <Card v-else>
            <div class="text-center text-gray-500 py-8">
              暂无示例代码
            </div>
          </Card>
        </TabPane>

        <TabPane key="files" tab="文件结构">
          <div class="space-y-4" v-if="materialDetail.files?.length">
            <Card v-for="file in materialDetail.files" :key="file.path">
              <template #title>
                <div class="flex items-center justify-between">
                  <span>{{ file.name }}</span>
                  <div class="flex items-center gap-2">
                    <Tag>{{ file.language }}</Tag>
                    <code class="text-xs text-gray-500">{{ file.path }}</code>
                  </div>
                </div>
              </template>
              <pre class="bg-gray-50 p-4 rounded overflow-x-auto"><code>{{ file.content }}</code></pre>
            </Card>
          </div>
          <Card v-else>
            <div class="text-center text-gray-500 py-8">
              暂无文件信息
            </div>
          </Card>
        </TabPane>

        <TabPane key="changelog" tab="更新日志">
          <Card>
            <div class="prose max-w-none" v-if="materialDetail.changelog">
              <pre class="whitespace-pre-wrap">{{ materialDetail.changelog }}</pre>
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              暂无更新日志
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<style scoped>
.material-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.material-tabs :deep(.ant-tabs-content-holder) {
  padding-top: 16px;
}

.prose pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.prose code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 14px;
}
</style>