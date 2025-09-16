<template>
  <div class="project-detail-view">
    <a-card :bordered="false">
      <template #title>
        <div class="page-header">
          <a-button type="text" @click="$router.go(-1)">
            <ArrowLeftOutlined />
            返回
          </a-button>
          <span class="page-title">项目详情</span>
        </div>
      </template>
      
      <div class="project-content">
        <a-row :gutter="24">
          <a-col :span="16">
            <a-card title="项目信息" class="info-card">
              <a-descriptions :column="2" bordered>
                <a-descriptions-item label="项目名称">{{ project.name }}</a-descriptions-item>
                <a-descriptions-item label="项目状态">
                  <a-tag :color="getStatusColor(project.status)">{{ getStatusText(project.status) }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">{{ formatDate(project.createdAt) }}</a-descriptions-item>
                <a-descriptions-item label="更新时间">{{ formatDate(project.updatedAt) }}</a-descriptions-item>
                <a-descriptions-item label="项目描述" :span="2">{{ project.description }}</a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <a-card title="快速操作" class="action-card">
              <a-space direction="vertical" style="width: 100%">
                <a-button type="primary" block>
                  <EditOutlined />
                  编辑项目
                </a-button>
                <a-button block>
                  <SettingOutlined />
                  项目设置
                </a-button>
                <a-button block>
                  <TeamOutlined />
                  成员管理
                </a-button>
                <a-button danger block>
                  <DeleteOutlined />
                  删除项目
                </a-button>
              </a-space>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SettingOutlined,
  TeamOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

// 响应式数据
const route = useRoute()
const project = ref({
  id: '',
  name: '',
  description: '',
  status: 'active',
  createdAt: '',
  updatedAt: ''
})

/**
 * 获取状态颜色
 */
const getStatusColor = (status: string) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  }
  return colors[status] || 'default'
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const texts = {
    active: '进行中',
    inactive: '已完成',
    pending: '待开始'
  }
  return texts[status] || '未知'
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

/**
 * 加载项目详情
 */
const loadProjectDetail = async () => {
  try {
    const projectId = route.params.id
    // TODO: 调用API获取项目详情
    project.value = {
      id: projectId as string,
      name: '示例项目',
      description: '这是一个示例项目的描述信息',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  } catch (error) {
    message.error('加载项目详情失败')
  }
}

// 生命周期
onMounted(() => {
  loadProjectDetail()
})
</script>

<style scoped>
.project-detail-view {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.project-content {
  margin-top: 24px;
}

.info-card,
.action-card {
  margin-bottom: 24px;
}

.action-card .ant-btn {
  margin-bottom: 8px;
}

.action-card .ant-btn:last-child {
  margin-bottom: 0;
}
</style>