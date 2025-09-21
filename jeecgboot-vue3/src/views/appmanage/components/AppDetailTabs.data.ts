/**
 * 应用详情Tab页面数据配置
 * @description 定义应用详情页面的Tab结构、统计数据和配置项
 */

export interface TabItem {
  key: string;
  name: string;
  component: string;
  icon?: string;
}

export interface StatisticItem {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  suffix?: string;
}

export interface ConfigItem {
  title: string;
  description: string;
  icon: string;
  status: 'enabled' | 'disabled' | 'pending';
  lastUpdate?: string;
}

/**
 * 应用详情Tab配置
 */
export const appDetailTabs: TabItem[] = [
  {
    key: 'basic',
    name: '基本信息',
    component: 'BasicInfo',
    icon: 'ant-design:info-circle-outlined',
  },
  {
    key: 'projects',
    name: '项目列表',
    component: 'ProjectList',
    icon: 'ant-design:project-outlined',
  },
  {
    key: 'config',
    name: '应用配置',
    component: 'AppConfig',
    icon: 'ant-design:setting-outlined',
  },
  {
    key: 'statistics',
    name: '统计信息',
    component: 'Statistics',
    icon: 'ant-design:bar-chart-outlined',
  },
];

/**
 * 应用统计数据
 */
export const appStatistics: StatisticItem[] = [
  {
    title: '项目总数',
    value: 12,
    icon: 'ant-design:project-outlined',
    color: '#1890ff',
  },
  {
    title: '活跃项目',
    value: 8,
    icon: 'ant-design:rocket-outlined',
    color: '#52c41a',
  },
  {
    title: '代码提交',
    value: 1234,
    icon: 'ant-design:code-outlined',
    color: '#722ed1',
  },
  {
    title: '部署次数',
    value: 89,
    icon: 'ant-design:cloud-upload-outlined',
    color: '#fa8c16',
  },
];

/**
 * 应用配置项
 */
export const appConfigs: ConfigItem[] = [
  {
    title: '流水线配置',
    description: 'CI/CD流水线自动化配置',
    icon: 'ant-design:deployment-unit-outlined',
    status: 'enabled',
    lastUpdate: '2024-01-15 14:30',
  },
  {
    title: '埋点配置',
    description: '用户行为数据埋点配置',
    icon: 'ant-design:aim-outlined',
    status: 'enabled',
    lastUpdate: '2024-01-14 09:15',
  },
  {
    title: '代码审查规范',
    description: '代码质量检查和审查规范',
    icon: 'ant-design:audit-outlined',
    status: 'pending',
    lastUpdate: '2024-01-10 16:45',
  },
  {
    title: '监控告警',
    description: '应用性能监控和告警配置',
    icon: 'ant-design:monitor-outlined',
    status: 'disabled',
  },
];

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  DEVELOPING = 'developing',
  TESTING = 'testing',
  DEPLOYED = 'deployed',
  ARCHIVED = 'archived',
}

/**
 * 项目状态标签配置
 */
export const projectStatusConfig = {
  [ProjectStatus.PLANNING]: { text: '规划中', color: 'blue' },
  [ProjectStatus.DEVELOPING]: { text: '开发中', color: 'orange' },
  [ProjectStatus.TESTING]: { text: '测试中', color: 'purple' },
  [ProjectStatus.DEPLOYED]: { text: '已部署', color: 'green' },
  [ProjectStatus.ARCHIVED]: { text: '已归档', color: 'gray' },
};