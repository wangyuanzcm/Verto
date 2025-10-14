<template>
  <a-modal
    v-model:open="visible"
    :title="project ? '编辑项目' : '新建项目'"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    :width="600"
    destroyOnClose
  >
    <a-form :model="form" layout="vertical">
      <a-form-item label="项目名称" name="name" :rules="[{ required: true, message: '请输入项目名称' }]">
        <a-input v-model:value="form.name" placeholder="请输入项目名称" />
      </a-form-item>

      <a-form-item label="项目描述" name="description" :rules="[{ required: true, message: '请输入项目描述' }]">
        <a-textarea v-model:value="form.description" placeholder="请输入项目描述" rows="4" />
      </a-form-item>

      <a-form-item label="分支" name="branch">
        <a-input v-model:value="form.branch" placeholder="例如 feature/new-module" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { Modal as AModal, Form as AForm, Input as AInput } from 'ant-design-vue';

interface Project {
  id?: string;
  name: string;
  description: string;
  branch?: string;
}

const props = defineProps<{
  appId: string;
  project: Project | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = ref<boolean>(props.open);
const confirmLoading = ref(false);
const form = ref<Project>({ name: '', description: '', branch: '' });

watch(() => props.open, (val) => {
  visible.value = val;
});

watch(() => props.project, (val) => {
  if (val) {
    form.value = { ...val };
  } else {
    form.value = { name: '', description: '', branch: '' };
  }
}, { immediate: true });

function handleOk() {
  confirmLoading.value = true;
  setTimeout(() => {
    confirmLoading.value = false;
    emit('success');
  }, 500);
}

function handleCancel() {
  emit('update:open', false);
}

onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
</style>