/**
 * 工具函数库
 * 提供常用的工具函数和辅助方法
 */

import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间为相对时间
 * @param date 日期对象或时间戳
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: Date | number): string => {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  return formatDistanceToNow(targetDate, { 
    addSuffix: true, 
    locale: zhCN 
  })
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param formatStr 格式字符串，默认为 'yyyy-MM-dd'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | number, formatStr = 'yyyy-MM-dd'): string => {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  return format(targetDate, formatStr, { locale: zhCN })
}

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | number): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func.apply(null, args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - previous)
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(null, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(null, args)
      }, remaining)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  
  return obj
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 获取文件名（不含扩展名）
 * @param filename 文件名
 * @returns 不含扩展名的文件名
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度等级 (weak, medium, strong)
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) {
    return 'weak'
  }
  
  let score = 0
  
  // 长度检查
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score < 3) return 'weak'
  if (score < 5) return 'medium'
  return 'strong'
}

/**
 * 将字符串转换为驼峰命名
 * @param str 输入字符串
 * @returns 驼峰命名字符串
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
}

/**
 * 将驼峰命名转换为短横线命名
 * @param str 驼峰命名字符串
 * @returns 短横线命名字符串
 */
export const toKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认为 '...'
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 获取随机颜色
 * @returns 随机颜色的十六进制值
 */
export const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * 获取对比色（黑色或白色）
 * @param hexColor 十六进制颜色值
 * @returns 对比色（#000000 或 #ffffff）
 */
export const getContrastColor = (hexColor: string): string => {
  // 移除 # 符号
  const color = hexColor.replace('#', '')
  
  // 转换为 RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 返回对比色
  return brightness > 128 ? '#000000' : '#ffffff'
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

/**
 * 获取URL参数
 * @param name 参数名
 * @param url URL字符串，默认为当前页面URL
 * @returns 参数值
 */
export const getUrlParam = (name: string, url?: string): string | null => {
  const targetUrl = url || window.location.href
  const urlObj = new URL(targetUrl)
  return urlObj.searchParams.get(name)
}

/**
 * 设置URL参数
 * @param params 参数对象
 * @param url URL字符串，默认为当前页面URL
 * @returns 新的URL字符串
 */
export const setUrlParams = (params: Record<string, string>, url?: string): string => {
  const targetUrl = url || window.location.href
  const urlObj = new URL(targetUrl)
  
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })
  
  return urlObj.toString()
}

/**
 * 移除URL参数
 * @param names 要移除的参数名数组
 * @param url URL字符串，默认为当前页面URL
 * @returns 新的URL字符串
 */
export const removeUrlParams = (names: string[], url?: string): string => {
  const targetUrl = url || window.location.href
  const urlObj = new URL(targetUrl)
  
  names.forEach(name => {
    urlObj.searchParams.delete(name)
  })
  
  return urlObj.toString()
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 检查是否为开发环境
 * @returns 是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV
}

/**
 * 检查是否为生产环境
 * @returns 是否为生产环境
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD
}

/**
 * 等待指定时间
 * @param ms 等待时间（毫秒）
 * @returns Promise
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 * @returns Promise
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        await sleep(delay)
      }
    }
  }
  
  throw lastError!
}

/**
 * 数组去重
 * @param array 原数组
 * @param key 对象数组的去重键名
 * @returns 去重后的数组
 */
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 数组分组
 * @param array 原数组
 * @param key 分组键名或分组函数
 * @returns 分组后的对象
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K | ((item: T) => string)
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组排序
 * @param array 原数组
 * @param key 排序键名或排序函数
 * @param order 排序顺序
 * @returns 排序后的数组
 */
export const sortBy = <T, K extends keyof T>(
  array: T[],
  key: K | ((item: T) => any),
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

/**
 * 数组分页
 * @param array 原数组
 * @param page 页码（从1开始）
 * @param pageSize 每页大小
 * @returns 分页结果
 */
export const paginate = <T>(
  array: T[],
  page: number,
  pageSize: number
): {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} => {
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = array.slice(startIndex, endIndex)
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages
  }
}