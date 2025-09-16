/**
 * HTTP请求工具
 * 基于fetch API封装的请求库，支持拦截器、错误处理等功能
 */

import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

// 请求配置接口
interface RequestConfig extends RequestInit {
  url: string
  params?: Record<string, any>
  timeout?: number
  showLoading?: boolean
  showError?: boolean
  retries?: number
}

// 响应数据接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: number
}

// 请求错误类
class RequestError extends Error {
  public code: number
  public response?: Response
  
  constructor(message: string, code: number, response?: Response) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.response = response
  }
}

// 默认配置
const DEFAULT_CONFIG: Partial<RequestConfig> = {
  timeout: 10000,
  showLoading: false,
  showError: true,
  retries: 0,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 基础URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 构建完整URL
 * @param url 相对URL
 * @param params 查询参数
 * @returns 完整URL
 */
const buildUrl = (url: string, params?: Record<string, any>): string => {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  
  if (!params || Object.keys(params).length === 0) {
    return fullUrl
  }
  
  const urlObj = new URL(fullUrl, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.set(key, String(value))
    }
  })
  
  return urlObj.toString()
}

/**
 * 获取认证头
 * @returns 认证头对象
 */
const getAuthHeaders = (): Record<string, string> => {
  const userStore = useUserStore()
  const token = userStore.token
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    }
  }
  
  return {}
}

/**
 * 处理请求超时
 * @param promise 请求Promise
 * @param timeout 超时时间
 * @returns 带超时的Promise
 */
const withTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new RequestError('请求超时', 408))
      }, timeout)
    })
  ])
}

/**
 * 重试请求
 * @param fn 请求函数
 * @param retries 重试次数
 * @param delay 重试延迟
 * @returns Promise
 */
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries: number,
  delay = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && shouldRetry(error as RequestError)) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

/**
 * 判断是否应该重试
 * @param error 错误对象
 * @returns 是否应该重试
 */
const shouldRetry = (error: RequestError): boolean => {
  // 网络错误或5xx服务器错误可以重试
  return !error.response || (error.code >= 500 && error.code < 600)
}

/**
 * 处理响应数据
 * @param response 响应对象
 * @returns 处理后的数据
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type')
  
  let data: any
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }
  
  if (!response.ok) {
    const error = new RequestError(
      data.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response
    )
    throw error
  }
  
  // 如果是标准API响应格式
  if (data && typeof data === 'object' && 'code' in data) {
    const apiResponse = data as ApiResponse<T>
    
    if (apiResponse.code !== 200 && !apiResponse.success) {
      throw new RequestError(
        apiResponse.message || '请求失败',
        apiResponse.code
      )
    }
    
    return apiResponse.data
  }
  
  return data
}

/**
 * 处理请求错误
 * @param error 错误对象
 * @param showError 是否显示错误消息
 */
const handleError = (error: RequestError, showError: boolean): void => {
  console.error('Request Error:', error)
  
  if (!showError) {
    return
  }
  
  let message = '请求失败'
  
  switch (error.code) {
    case 400:
      message = '请求参数错误'
      break
    case 401:
      message = '未授权，请重新登录'
      // 清除用户信息并跳转到登录页
      const userStore = useUserStore()
      userStore.logout()
      break
    case 403:
      message = '拒绝访问'
      break
    case 404:
      message = '请求的资源不存在'
      break
    case 408:
      message = '请求超时'
      break
    case 500:
      message = '服务器内部错误'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务不可用'
      break
    case 504:
      message = '网关超时'
      break
    default:
      message = error.message || '网络错误'
  }
  
  ElMessage.error(message)
}

/**
 * 核心请求函数
 * @param config 请求配置
 * @returns Promise
 */
const request = async <T = any>(config: RequestConfig): Promise<T> => {
  const appStore = useAppStore()
  
  // 合并配置
  const finalConfig: RequestConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    headers: {
      ...DEFAULT_CONFIG.headers,
      ...getAuthHeaders(),
      ...config.headers
    }
  }
  
  // 构建URL
  const url = buildUrl(finalConfig.url, finalConfig.params)
  
  // 显示加载状态
  if (finalConfig.showLoading) {
    appStore.setLoading(true)
  }
  
  try {
    // 创建请求函数
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        method: finalConfig.method || 'GET',
        headers: finalConfig.headers as HeadersInit,
        body: finalConfig.body,
        credentials: 'include',
        ...finalConfig
      })
      
      return handleResponse<T>(response)
    }
    
    // 添加超时和重试
    let result: T
    if (finalConfig.timeout) {
      const timeoutPromise = withTimeout(makeRequest(), finalConfig.timeout)
      if (finalConfig.retries && finalConfig.retries > 0) {
        result = await retryRequest(() => timeoutPromise, finalConfig.retries)
      } else {
        result = await timeoutPromise
      }
    } else {
      if (finalConfig.retries && finalConfig.retries > 0) {
        result = await retryRequest(makeRequest, finalConfig.retries)
      } else {
        result = await makeRequest()
      }
    }
    
    return result
    
  } catch (error) {
    const requestError = error instanceof RequestError 
      ? error 
      : new RequestError('网络错误', 0)
    
    handleError(requestError, finalConfig.showError!)
    throw requestError
    
  } finally {
    // 隐藏加载状态
    if (finalConfig.showLoading) {
      appStore.setLoading(false)
    }
  }
}

/**
 * GET请求
 * @param url 请求URL
 * @param params 查询参数
 * @param config 请求配置
 * @returns Promise
 */
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Partial<RequestConfig>
): Promise<T> => {
  return request<T>({
    url,
    method: 'GET',
    params,
    ...config
  })
}

/**
 * POST请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
): Promise<T> => {
  return request<T>({
    url,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...config
  })
}

/**
 * PUT请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
): Promise<T> => {
  return request<T>({
    url,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...config
  })
}

/**
 * PATCH请求
 * @param url 请求URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise
 */
export const patch = <T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestConfig>
): Promise<T> => {
  return request<T>({
    url,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...config
  })
}

/**
 * DELETE请求
 * @param url 请求URL
 * @param config 请求配置
 * @returns Promise
 */
export const del = <T = any>(
  url: string,
  config?: Partial<RequestConfig>
): Promise<T> => {
  return request<T>({
    url,
    method: 'DELETE',
    ...config
  })
}

/**
 * 上传文件
 * @param url 上传URL
 * @param file 文件对象
 * @param data 额外数据
 * @param config 请求配置
 * @returns Promise
 */
export const upload = <T = any>(
  url: string,
  file: File,
  data?: Record<string, any>,
  config?: Partial<RequestConfig>
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }
  
  return request<T>({
    url,
    method: 'POST',
    body: formData,
    headers: {
      // 不设置Content-Type，让浏览器自动设置
      ...getAuthHeaders()
    },
    ...config
  })
}

/**
 * 下载文件
 * @param url 下载URL
 * @param filename 文件名
 * @param config 请求配置
 * @returns Promise
 */
export const download = async (
  url: string,
  filename?: string,
  config?: Partial<RequestConfig>
): Promise<void> => {
  const response = await request<Blob>({
    url,
    method: 'GET',
    ...config
  })
  
  // 创建下载链接
  const blob = new Blob([response])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  
  if (filename) {
    link.download = filename
  }
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

// 导出请求实例
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  download,
  request
}

// 导出类型
export type {
  RequestConfig,
  ApiResponse,
  RequestError
}