<template>
  <div class="project-layout">
    <div class="layout-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Folder /></el-icon>
          项目管理
        </h1>
        <div class="header-actions">
          <el-button 
            type="primary" 
            @click="$router.push('/project/new')"
            v-if="$route.name !== 'ProjectNew'"
          >
            <el-icon><Plus /></el-icon>
            新建项目
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="layout-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Folder, Plus } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.project-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  
  .header-content {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.layout-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>