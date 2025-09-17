<template>
  <div class="project-form">
    <Page
      :description="isEdit ? '编辑项目信息' : '创建新项目'"
      :title="isEdit ? '编辑项目' : '创建项目'"
    >
      <template #extra>
        <Space>
          <Button @click="onCancel"> 取消 </Button>
          <Button type="primary" @click="onSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </Button>
        </Space>
      </template>

      <Card class="max-w-4xl">
        <VbenForm ref="formRef" :schema="formSchema" />
      </Card>
    </Page>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenForm } from '@vben/common-ui';
import { Button, Card, Space } from 'ant-design-vue';

import { useProjectFormSchema } from './data';

/**
 * 项目表单页面组件
 * 用于创建和编辑项目
 */

interface ProjectFormData {
  name: string;
  description: string;
  template: string;
  status: 'active' | 'inactive' | 'archived';
  tags: string[];
  repository: string;
  homepage: string;
  documentation: string;
  license: string;
  visibility: 'public' | 'private';
  features: string[];
  technologies: string[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  teamSize: number;
  startDate: string;
  endDate: string;
  notes: string;
}

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id);

// 表单配置
const formSchema = useProjectFormSchema();

/**
 * 获取项目详情
 * @param id 项目ID
 * @returns 项目数据
 */
const getProjectDetail = async (id: string): Promise<ProjectFormData> => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 模拟返回数据
  return {
    name: 'Vue3 Admin Dashboard',
    description:
      '基于Vue3的现代化管理后台系统，提供完整的权限管理、数据可视化等功能',
    template: 'vue3-admin',
    status: 'active',
    tags: ['Vue3', 'TypeScript', 'Admin', 'Dashboard'],
    repository: 'https://github.com/example/vue3-admin',
    homepage: 'https://vue3-admin.example.com',
    documentation: 'https://docs.vue3-admin.example.com',
    license: 'MIT',
    visibility: 'public',
    features: ['权限管理', '数据可视化', '多语言支持', '主题切换'],
    technologies: ['Vue3', 'TypeScript', 'Vite', 'Pinia', 'Ant Design Vue'],
    estimatedDuration: 90,
    priority: 'high',
    budget: 50000,
    teamSize: 5,
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    notes: '这是一个重要的项目，需要按时完成。',
  };
};

/**
 * 创建项目
 * @param data 项目数据
 */
const createProject = async (data: ProjectFormData) => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('创建项目:', data);
};

/**
 * 更新项目
 * @param id 项目ID
 * @param data 项目数据
 */
const updateProject = async (id: string, data: ProjectFormData) => {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('更新项目:', id, data);
};

/**
 * 提交表单
 */
async function onSubmit() {
  try {
    const values = await formRef.value?.validate();
    if (!values) return;

    if (isEdit.value) {
      await updateProject(route.params.id as string, values);
      console.log('项目更新成功');
    } else {
      await createProject(values);
      console.log('项目创建成功');
    }

    // 返回列表页
    router.push('/project/list');
  } catch (error) {
    console.error('提交失败:', error);
  }
}

/**
 * 取消操作
 */
function onCancel() {
  router.back();
}

/**
 * 初始化数据
 */
onMounted(async () => {
  if (isEdit.value) {
    try {
      const data = await getProjectDetail(route.params.id as string);
      formRef.value?.setValues(data);
    } catch (error) {
      console.error('获取项目详情失败:', error);
    }
  }
});
</script>

<style scoped>
.project-form {
  height: 100%;
}
</style>
