<template>
  <footer class="app-footer" :class="footerClass">
    <!-- 主要内容区域 -->
    <div class="app-footer__content">
      <!-- 左侧信息 -->
      <div class="app-footer__left">
        <slot name="left">
          <!-- 版权信息 -->
          <div class="copyright">
            <span>© {{ currentYear }} {{ companyName }}. {{ copyrightText }}</span>
          </div>
          
          <!-- 版本信息 -->
          <div v-if="showVersion" class="version">
            <el-tag size="small" type="info">{{ version }}</el-tag>
            <span v-if="buildTime" class="build-time">
              构建时间: {{ formatBuildTime(buildTime) }}
            </span>
          </div>
        </slot>
      </div>
      
      <!-- 中间链接 -->
      <div class="app-footer__center">
        <slot name="center">
          <div v-if="links.length > 0" class="footer-links">
            <a
              v-for="link in links"
              :key="link.key"
              :href="link.url"
              :target="link.external ? '_blank' : '_self'"
              :rel="link.external ? 'noopener noreferrer' : ''"
              class="footer-link"
              @click="handleLinkClick(link)"
            >
              <el-icon v-if="link.icon">
                <component :is="link.icon" />
              </el-icon>
              {{ link.text }}
            </a>
          </div>
        </slot>
      </div>
      
      <!-- 右侧操作 -->
      <div class="app-footer__right">
        <slot name="right">
          <!-- 系统状态 -->
          <div v-if="showStatus" class="system-status">
            <el-tooltip :content="statusTooltip" placement="top">
              <div class="status-indicator" :class="`status-${systemStatus}`">
                <el-icon>
                  <CircleCheckFilled v-if="systemStatus === 'online'" />
                  <WarningFilled v-else-if="systemStatus === 'warning'" />
                  <CircleCloseFilled v-else />
                </el-icon>
                <span v-if="!compact">{{ statusText }}</span>
              </div>
            </el-tooltip>
          </div>
          
          <!-- 语言切换 -->
          <el-dropdown
            v-if="showLanguage"
            class="language-selector"
            @command="handleLanguageChange"
          >
            <el-button type="text" size="small">
              <el-icon><Globe /></el-icon>
              <span v-if="!compact">{{ currentLanguage.label }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in languages"
                  :key="lang.code"
                  :command="lang.code"
                  :disabled="lang.code === currentLanguage.code"
                >
                  {{ lang.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 主题切换 -->
          <el-button
            v-if="showTheme"
            type="text"
            size="small"
            class="theme-toggle"
            @click="handleThemeToggle"
          >
            <el-icon>
              <Sunny v-if="currentTheme === 'light'" />
              <Moon v-else-if="currentTheme === 'dark'" />
              <Monitor v-else />
            </el-icon>
            <span v-if="!compact">{{ themeText }}</span>
          </el-button>
          
          <!-- 返回顶部 -->
          <el-button
            v-if="showBackTop"
            type="text"
            size="small"
            class="back-top"
            @click="handleBackTop"
          >
            <el-icon><Top /></el-icon>
            <span v-if="!compact">返回顶部</span>
          </el-button>
        </slot>
      </div>
    </div>
    
    <!-- 额外信息区域 -->
    <div v-if="showExtra" class="app-footer__extra">
      <slot name="extra">
        <!-- 统计信息 -->
        <div v-if="statistics.length > 0" class="statistics">
          <div
            v-for="stat in statistics"
            :key="stat.key"
            class="stat-item"
          >
            <span class="stat-label">{{ stat.label }}:</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
        
        <!-- 社交链接 -->
        <div v-if="socialLinks.length > 0" class="social-links">
          <a
            v-for="social in socialLinks"
            :key="social.key"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            :title="social.name"
            @click="handleSocialClick(social)"
          >
            <el-icon>
              <component :is="social.icon" />
            </el-icon>
          </a>
        </div>
      </slot>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ElTag,
  ElIcon,
  ElTooltip,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import {
  CircleCheckFilled,
  WarningFilled,
  CircleCloseFilled,
  Globe,
  Sunny,
  Moon,
  Monitor,
  Top
} from '@element-plus/icons-vue'
import { formatTime } from '@/utils'

/**
 * 应用页脚组件
 * 包含版权信息、链接、系统状态、语言切换等功能
 */

// 链接类型
interface FooterLink {
  key: string
  text: string
  url: string
  icon?: any
  external?: boolean
}

// 语言类型
interface Language {
  code: string
  label: string
}

// 统计信息类型
interface Statistic {
  key: string
  label: string
  value: string | number
}

// 社交链接类型
interface SocialLink {
  key: string
  name: string
  url: string
  icon: any
}

// 定义组件属性
interface Props {
  /** 公司名称 */
  companyName?: string
  /** 版权文本 */
  copyrightText?: string
  /** 是否显示版本信息 */
  showVersion?: boolean
  /** 版本号 */
  version?: string
  /** 构建时间 */
  buildTime?: string | Date
  /** 页脚链接 */
  links?: FooterLink[]
  /** 是否显示系统状态 */
  showStatus?: boolean
  /** 系统状态 */
  systemStatus?: 'online' | 'warning' | 'offline'
  /** 状态提示文本 */
  statusTooltip?: string
  /** 是否显示语言切换 */
  showLanguage?: boolean
  /** 可选语言列表 */
  languages?: Language[]
  /** 当前语言 */
  currentLanguage?: Language
  /** 是否显示主题切换 */
  showTheme?: boolean
  /** 当前主题 */
  currentTheme?: 'light' | 'dark' | 'auto'
  /** 是否显示返回顶部 */
  showBackTop?: boolean
  /** 是否显示额外信息区域 */
  showExtra?: boolean
  /** 统计信息 */
  statistics?: Statistic[]
  /** 社交链接 */
  socialLinks?: SocialLink[]
  /** 是否紧凑模式 */
  compact?: boolean
  /** 是否固定在底部 */
  fixed?: boolean
  /** 自定义类名 */
  customClass?: string
}

// 定义默认值
const props = withDefaults(defineProps<Props>(), {
  companyName: 'Verto Team',
  copyrightText: 'All rights reserved.',
  showVersion: true,
  version: 'v1.0.0',
  links: () => [],
  showStatus: true,
  systemStatus: 'online',
  statusTooltip: '系统运行正常',
  showLanguage: false,
  languages: () => [
    { code: 'zh-CN', label: '简体中文' },
    { code: 'en-US', label: 'English' }
  ],
  currentLanguage: () => ({ code: 'zh-CN', label: '简体中文' }),
  showTheme: true,
  currentTheme: 'auto',
  showBackTop: true,
  showExtra: false,
  statistics: () => [],
  socialLinks: () => [],
  compact: false,
  fixed: false
})

// 定义事件
const emit = defineEmits<{
  'link-click': [link: FooterLink]
  'language-change': [language: string]
  'theme-toggle': []
  'back-top': []
  'social-click': [social: SocialLink]
}>()

// 计算属性
const footerClass = computed(() => {
  return [
    {
      'app-footer--compact': props.compact,
      'app-footer--fixed': props.fixed
    },
    props.customClass
  ]
})

const currentYear = computed(() => {
  return new Date().getFullYear()
})

const statusText = computed(() => {
  const statusMap = {
    online: '正常',
    warning: '警告',
    offline: '离线'
  }
  return statusMap[props.systemStatus]
})

const themeText = computed(() => {
  const themeMap = {
    light: '浅色',
    dark: '深色',
    auto: '自动'
  }
  return themeMap[props.currentTheme]
})

/**
 * 格式化构建时间
 */
const formatBuildTime = (time: string | Date) => {
  if (typeof time === 'string') {
    return time
  }
  return formatTime(time, 'YYYY-MM-DD HH:mm')
}

/**
 * 处理链接点击
 */
const handleLinkClick = (link: FooterLink) => {
  emit('link-click', link)
}

/**
 * 处理语言切换
 */
const handleLanguageChange = (language: string) => {
  emit('language-change', language)
}

/**
 * 处理主题切换
 */
const handleThemeToggle = () => {
  emit('theme-toggle')
}

/**
 * 处理返回顶部
 */
const handleBackTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  emit('back-top')
}

/**
 * 处理社交链接点击
 */
const handleSocialClick = (social: SocialLink) => {
  emit('social-click', social)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.app-footer {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px 24px;
  margin-top: auto;
  
  &--fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
  
  &--compact {
    padding: 8px 16px;
    
    .app-footer__content {
      min-height: auto;
    }
    
    .app-footer__extra {
      margin-top: 8px;
      padding-top: 8px;
    }
  }
  
  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    gap: 16px;
  }
  
  &__left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  
  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  
  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }
  
  &__extra {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
}

// 版权信息
.copyright {
  font-size: $font-size-small;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

// 版本信息
.version {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-small;
  
  .build-time {
    color: var(--el-text-color-placeholder);
    font-size: $font-size-extra-small;
  }
}

// 页脚链接
.footer-links {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: $font-size-small;
  padding: 4px 8px;
  border-radius: $border-radius-small;
  transition: all 0.3s;
  
  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
  
  .el-icon {
    font-size: 14px;
  }
}

// 系统状态
.system-status {
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-small;
    
    &.status-online {
      color: var(--el-color-success);
    }
    
    &.status-warning {
      color: var(--el-color-warning);
    }
    
    &.status-offline {
      color: var(--el-color-danger);
    }
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 语言选择器
.language-selector {
  :deep(.el-button) {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 主题切换
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    font-size: 14px;
  }
}

// 返回顶部
.back-top {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    font-size: 14px;
  }
}

// 统计信息
.statistics {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-small;
    
    .stat-label {
      color: var(--el-text-color-regular);
    }
    
    .stat-value {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
}

// 社交链接
.social-links {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);
    transition: all 0.3s;
    
    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      transform: translateY(-2px);
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

// 响应式设计
@include tablet {
  .app-footer {
    padding: 12px 16px;
    
    &__content {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
    
    &__left,
    &__center,
    &__right {
      flex: none;
      width: 100%;
      justify-content: center;
    }
    
    &__extra {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
  }
  
  .footer-links {
    justify-content: center;
    gap: 12px;
  }
  
  .statistics {
    justify-content: center;
    gap: 12px;
  }
}

@include mobile {
  .app-footer {
    padding: 8px 12px;
    
    &__content {
      gap: 8px;
    }
    
    &__extra {
      margin-top: 8px;
      padding-top: 8px;
      gap: 8px;
    }
  }
  
  .footer-links {
    gap: 8px;
    
    .footer-link {
      padding: 2px 4px;
      font-size: $font-size-extra-small;
    }
  }
  
  .statistics {
    gap: 8px;
    
    .stat-item {
      font-size: $font-size-extra-small;
    }
  }
  
  .social-links {
    gap: 6px;
    
    .social-link {
      width: 28px;
      height: 28px;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
  
  // 紧凑模式下隐藏部分文本
  .app-footer--compact {
    .copyright,
    .version .build-time,
    .footer-link span,
    .status-indicator span,
    .theme-toggle span,
    .back-top span {
      display: none;
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .app-footer {
    border-top-color: var(--el-border-color);
  }
}

// 动画效果
.app-footer {
  .footer-link,
  .social-link,
  .theme-toggle,
  .back-top {
    &:hover {
      animation: bounce 0.3s ease;
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
</style>