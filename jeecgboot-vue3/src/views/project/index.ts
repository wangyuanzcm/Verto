/**
 * 项目管理模块入口文件
 * 导出所有项目相关组件
 */

export { default as ProjectList } from './ProjectList.vue'
export { default as ProjectDetail } from './ProjectDetail.vue'
export { default as ProjectModal } from './components/ProjectModal.vue'
export { default as GitBranchManager } from './components/GitBranchManager.vue'
export { default as AppConfigManager } from './components/AppConfigManager.vue'
export { default as PipelineManager } from './components/PipelineManager.vue'

// 导出数据模型和API
export * from './Project.data'
export * from './Project.api'