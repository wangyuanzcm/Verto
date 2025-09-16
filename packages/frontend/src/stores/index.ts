import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

/**
 * Pinia 状态管理配置
 * 包含持久化插件配置
 */

// 创建 Pinia 实例
const pinia = createPinia()

// 配置持久化插件
pinia.use(
  createPersistedState({
    // 默认使用 localStorage
    storage: localStorage,
    // 序列化配置
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    },
    // 默认持久化所有状态
    auto: true,
    // 调试模式
    debug: import.meta.env.DEV
  })
)

export default pinia

// 导出所有 store
export { useAppStore } from './app'
export { useAuthStore } from './auth'
export { useUserStore } from './user'
export { useProjectStore } from './project'
export { useRequirementStore } from './requirement'
export { usePrototypeStore } from './prototype'
export { useComponentStore } from './component'
export { useTeamStore } from './team'
export { useSettingsStore } from './settings'
export { useNotificationStore } from './notification'

/**
 * Store 类型定义
 */
export interface StoreState {
  app: ReturnType<typeof useAppStore>
  auth: ReturnType<typeof useAuthStore>
  user: ReturnType<typeof useUserStore>
  project: ReturnType<typeof useProjectStore>
  requirement: ReturnType<typeof useRequirementStore>
  prototype: ReturnType<typeof usePrototypeStore>
  component: ReturnType<typeof useComponentStore>
  team: ReturnType<typeof useTeamStore>
  settings: ReturnType<typeof useSettingsStore>
  notification: ReturnType<typeof useNotificationStore>
}

/**
 * 重置所有 Store
 */
export const resetAllStores = () => {
  const stores = [
    useAppStore(),
    useAuthStore(),
    useUserStore(),
    useProjectStore(),
    useRequirementStore(),
    usePrototypeStore(),
    useComponentStore(),
    useTeamStore(),
    useSettingsStore(),
    useNotificationStore()
  ]
  
  stores.forEach(store => {
    if (store.$reset) {
      store.$reset()
    }
  })
}