<template>
  <div class="app-basic-info">
    <a-row :gutter="24">
      <!-- 应用基本信息 -->
      <a-col :span="24">
        <a-card title="应用信息" :bordered="false">
          <template #extra>
            <a-button type="primary" size="small" @click="openEdit">编辑</a-button>
          </template>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="应用名称">
              {{ appInfo.appName || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="应用编码">
              {{ appInfo.appCode || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="应用类型">
              <template v-if="appInfo.appType">
                <a-tag :color="getAppTypeColor(appInfo.appType)">
                  {{ getAppTypeText(appInfo.appType) }}
                </a-tag>
              </template>
              <template v-else>
                暂无数据
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="应用状态">
              <!-- 注意：0 是有效值（禁用），不能用简单的 truthy 判断 -->
              <template v-if="appInfo.status !== null && appInfo.status !== undefined">
                <a-tag :color="getStatusColor(appInfo.status)">
                  {{ getStatusText(appInfo.status) }}
                </a-tag>
              </template>
              <template v-else>
                暂无数据
              </template>
            </a-descriptions-item>
            <a-descriptions-item label="负责人">
              {{ appInfo.owner || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ appInfo.createTime || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="最后更新">
              {{ appInfo.updateTime || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="版本号">
              {{ appInfo.version || '暂无数据' }}
            </a-descriptions-item>
            <a-descriptions-item label="技术栈" :span="2">
              <template v-if="appInfo.techStack && appInfo.techStack.length">
                <div class="tech-stack-tags">
                  <a-tag 
                    v-for="tech in appInfo.techStack" 
                    :key="tech.name" 
                    class="tech-tag"
                    color="blue"
                  >
                    <Icon :icon="tech.icon" :size="14" style="margin-right: 4px;" />
                    {{ tech.name }} {{ tech.version }}
                  </a-tag>
                </div>
              </template>
              <template v-else>
                暂无数据
              </template>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

      <!-- Git 仓库信息 -->
      <a-row :gutter="24" class="mt-4">
        <a-col :span="24">
          <a-card title="Git仓库信息" :bordered="false">
            <template #extra>
              <a-button :loading="syncLoading" type="primary" size="small" @click="syncGitInfo">
                <Icon icon="ant-design:sync-outlined" :size="16" />
                同步
              </a-button>
            </template>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-descriptions :column="1" bordered>
                  <a-descriptions-item label="仓库地址">
                    <template v-if="appInfo.gitInfo && appInfo.gitInfo.repoUrl">
                      <a :href="appInfo.gitInfo.repoUrl" target="_blank">
                        {{ appInfo.gitInfo.repoUrl }}
                      </a>
                    </template>
                    <template v-else>
                      暂无数据
                    </template>
                  </a-descriptions-item>
                  <a-descriptions-item label="默认分支">
                    {{ (appInfo.gitInfo && appInfo.gitInfo.defaultBranch) || '暂无数据' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="最后提交">
                    {{ (appInfo.gitInfo && appInfo.gitInfo.lastCommitSha) || '暂无数据' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-col>
              <a-col :span="12">
                <a-descriptions :column="1" bordered>
                  <a-descriptions-item label="提交者">
                    {{ (appInfo.gitInfo && appInfo.gitInfo.lastCommitter) || '暂无数据' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="提交时间">
                    {{ (appInfo.gitInfo && appInfo.gitInfo.lastCommitTime) || '暂无数据' }}
                  </a-descriptions-item>
                  <a-descriptions-item label="分支数量">
                    {{ (appInfo.gitInfo && appInfo.gitInfo.branchCount) || '暂无数据' }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <!-- 依赖信息（暂不展示） -->
      <a-row v-if="showDependencies" :gutter="24" class="mt-4">
        <a-col :span="24">
          <a-card title="依赖信息" :bordered="false">
            <div v-if="packageJsonLoading" class="loading-container">
              <a-spin size="large" />
              <div class="loading-text">正在加载依赖信息...</div>
            </div>
            <div v-else-if="packageJsonError" class="error-container">
              <a-alert type="error" :message="packageJsonError" show-icon />
            </div>
            <div v-else-if="packageJsonData">
              <a-tabs v-model:activeKey="dependencyTabKey" type="card">
                <!-- 生产依赖 -->
                <a-tab-pane key="dependencies" :tab="`生产依赖 (${getDependencyCount('dependencies')})`">
                  <div class="dependency-section">
                    <div class="dependency-header">
                      <span class="dependency-title">
                        <Icon icon="ant-design:package-outlined" :size="18" />
                        生产环境依赖包
                      </span>
                      <a-button type="link" @click="copyDependencies('dependencies')" size="small">
                        <Icon icon="ant-design:copy-outlined" :size="16" />
                        复制依赖列表
                      </a-button>
                    </div>
                    <a-descriptions 
                      :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                      size="small"
                      bordered
                      class="dependency-descriptions"
                    >
                      <a-descriptions-item 
                        v-for="(version, name) in packageJsonData.dependencies" 
                        :key="name"
                        :label="name"
                      >
                        <a-tag color="blue">{{ version }}</a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-tab-pane>

                <!-- 开发依赖 -->
                <a-tab-pane key="devDependencies" :tab="`开发依赖 (${getDependencyCount('devDependencies')})`">
                  <div class="dependency-section">
                    <div class="dependency-header">
                      <span class="dependency-title">
                        <Icon icon="ant-design:tool-outlined" :size="18" />
                        开发环境依赖包
                      </span>
                      <a-button type="link" @click="copyDependencies('devDependencies')" size="small">
                        <Icon icon="ant-design:copy-outlined" :size="16" />
                        复制依赖列表
                      </a-button>
                    </div>
                    <a-descriptions 
                      :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                      size="small"
                      bordered
                      class="dependency-descriptions"
                    >
                      <a-descriptions-item 
                        v-for="(version, name) in packageJsonData.devDependencies" 
                        :key="name"
                        :label="name"
                      >
                        <a-tag color="orange">{{ version }}</a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-tab-pane>

                <!-- 可选依赖 -->
                <a-tab-pane key="optionalDependencies" :tab="`可选依赖 (${getDependencyCount('optionalDependencies')})`" v-if="packageJsonData.optionalDependencies">
                  <div class="dependency-section">
                    <div class="dependency-header">
                      <span class="dependency-title">
                        <Icon icon="ant-design:question-circle-outlined" :size="18" />
                        可选依赖包
                      </span>
                      <a-button type="link" @click="copyDependencies('optionalDependencies')" size="small">
                        <Icon icon="ant-design:copy-outlined" :size="16" />
                        复制依赖列表
                      </a-button>
                    </div>
                    <a-descriptions 
                      :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                      size="small"
                      bordered
                      class="dependency-descriptions"
                    >
                      <a-descriptions-item 
                        v-for="(version, name) in packageJsonData.optionalDependencies" 
                        :key="name"
                        :label="name"
                      >
                        <a-tag color="purple">{{ version }}</a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-tab-pane>

                <!-- 同级依赖 -->
                <a-tab-pane key="peerDependencies" :tab="`同级依赖 (${getDependencyCount('peerDependencies')})`" v-if="packageJsonData.peerDependencies">
                  <div class="dependency-section">
                    <div class="dependency-header">
                      <span class="dependency-title">
                        <Icon icon="ant-design:share-alt-outlined" :size="18" />
                        同级依赖包
                      </span>
                      <a-button type="link" @click="copyDependencies('peerDependencies')" size="small">
                        <Icon icon="ant-design:copy-outlined" :size="16" />
                        复制依赖列表
                      </a-button>
                    </div>
                    <a-descriptions 
                      :column="{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }"
                      size="small"
                      bordered
                      class="dependency-descriptions"
                    >
                      <a-descriptions-item 
                        v-for="(version, name) in packageJsonData.peerDependencies" 
                        :key="name"
                        :label="name"
                      >
                        <a-tag color="green">{{ version }}</a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
            <div v-else class="no-data-container">
              <a-empty description="未找到 package.json 文件" />
            </div>
          </a-card>
        </a-col>
      </a-row>
      
      <!-- 编辑弹窗 -->
      <a-modal
        v-model:visible="editVisible"
        title="编辑应用信息"
        :destroyOnClose="true"
        @ok="handleEditOk"
        @cancel="handleEditCancel"
        :width="720"
      >
        <a-form :model="editModel" layout="vertical" class="edit-form" style="width: 80%; max-width: none;margin:0 auto;">
          <a-row :gutter="[16, 8]">
            <a-col :span="12">
              <a-form-item label="应用名称" name="appName">
                <a-input v-model:value="editModel.appName" placeholder="请输入应用名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用编码" name="appCode">
                <a-input v-model:value="editModel.appCode" placeholder="请输入应用编码" />
              </a-form-item>
            </a-col>
          
            <a-col :span="12">
              <a-form-item label="应用类型" name="appType">
                <a-select v-model:value="editModel.appType" placeholder="请选择应用类型">
                  <a-select-option value="web">Web应用</a-select-option>
                  <a-select-option value="mobile">移动应用</a-select-option>
                  <a-select-option value="desktop">桌面应用</a-select-option>
                  <a-select-option value="api">API服务</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="应用状态" name="status">
                <!-- 后端为数字：0(禁用)、1(启用) -->
                <a-select v-model:value="editModel.status" placeholder="请选择状态">
                  <a-select-option :value="1">启用</a-select-option>
                  <a-select-option :value="0">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          
            <a-col :span="12">
              <a-form-item label="负责人" name="owner">
                <a-input v-model:value="editModel.owner" placeholder="请输入负责人" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="版本号" name="version">
                <a-input v-model:value="editModel.version" placeholder="请输入版本号" />
              </a-form-item>
            </a-col>
          
            <a-col :span="24">
              <a-form-item label="应用描述" name="description">
                <a-textarea v-model:value="editModel.description" placeholder="请输入描述" rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="Git 仓库地址" name="gitUrl">
                <a-input v-model:value="editModel.gitUrl" placeholder="请输入仓库地址" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>
    </div>
  </template>

<script lang="ts" setup>
import { ref, onMounted, h } from 'vue';
import Icon from '/@/components/Icon';
import { useCopyToClipboard } from '@/hooks/web/useCopyToClipboard';
import { useMessage } from '@/hooks/web/useMessage';
import { getAppPackageJson, editApp, syncGitRepoInfo, getGitRepoInfo } from '../AppManage.api';

/**
 * 应用信息接口定义
 */
interface AppInfo {
  appName: string;
  appCode: string;
  appType: string;
  // 后端为数字(0:禁用,1:启用)，兼容历史字符串
  status: number | string | null;
  owner: string;
  createTime: string;
  updateTime: string;
  version: string;
  description: string;
  techStack: Array<{
    name: string;
    version: string;
    icon: string;
  }>;
  environments: Array<{
    name: string;
    url: string;
    status: string;
  }>;
  gitInfo: {
    repoUrl: string;
    defaultBranch: string;
    // 后端字段为 lastCommitSha 与 lastCommitMessage，这里同时保留聚合字段 lastCommit
    lastCommit: string;
    lastCommitSha?: string;
    lastCommitMessage?: string;
    lastCommitter: string;
    lastCommitTime: string;
    branchCount: number;
  };
}

/**
 * Package.json 数据接口定义
 */
interface PackageJsonData {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const props = defineProps<{
  appId: string;
  appDetail: any;
}>();

// 剪贴板和消息
const { clipboardRef, isSuccessRef } = useCopyToClipboard();
const { createMessage } = useMessage();

// 依赖信息相关状态
const packageJsonData = ref<PackageJsonData | null>(null);
const packageJsonLoading = ref(false);
const packageJsonError = ref<string | null>(null);
const dependencyTabKey = ref('dependencies');
// 控制依赖信息展示（当前需求：暂时不展示）
const showDependencies = ref(false);

// 表格列定义
const dependencyColumns = [
  {
    title: '包名',
    dataIndex: 'name',
    key: 'name',
    width: '60%',
    ellipsis: true,
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    width: '40%',
    customRender: ({ record }) => {
      const colorMap = {
        dependencies: 'blue',
        devDependencies: 'orange',
        optionalDependencies: 'purple',
        peerDependencies: 'green',
      };
      return h('a-tag', { color: colorMap[record.type] || 'default' }, record.version);
    },
  },
];

/**
 * 获取依赖数量
 * @param type 依赖类型
 */
function getDependencyCount(type: string): number {
  if (!packageJsonData.value || !packageJsonData.value[type]) return 0;
  return Object.keys(packageJsonData.value[type]).length;
}

/**
 * 获取表格数据
 * @param type 依赖类型
 */
function getDependencyTableData(type: string) {
  if (!packageJsonData.value || !packageJsonData.value[type]) return [];
  
  return Object.entries(packageJsonData.value[type]).map(([name, version]) => ({
    key: name,
    name,
    version,
    type,
  }));
}

/**
 * 复制依赖列表
 * @param type 依赖类型
 */
function copyDependencies(type: string) {
  if (!packageJsonData.value || !packageJsonData.value[type]) return;
  
  const dependencies = Object.entries(packageJsonData.value[type])
    .map(([name, version]) => `${name}@${version}`)
    .join('\n');
  
  copy(dependencies);
  }
/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
function copy(text: string) {
  clipboardRef.value = text;
  if (isSuccessRef.value) {
    createMessage.success('复制成功');
  } else {
    createMessage.error('复制失败');
  }
}
const appInfo = ref<AppInfo>({
  appName: props.appDetail?.appName || '',
  appCode: props.appDetail?.appCode || '',
  appType: props.appDetail?.appType || '',
  // 0 是有效值，这里用 null 作为“未知/未设置”的占位
  status: props.appDetail?.status ?? null,
  owner: props.appDetail?.owner || '',
  createTime: props.appDetail?.createTime || '',
  updateTime: props.appDetail?.updateTime || '',
  version: props.appDetail?.version || '',
  description: props.appDetail?.description || '',
  techStack: props.appDetail?.techStack || [],
  environments: props.appDetail?.environments || [],
  gitInfo: {
    repoUrl: props.appDetail?.gitUrl || '',
    defaultBranch: props.appDetail?.defaultBranch || '',
    lastCommit: props.appDetail?.lastCommit || '',
    lastCommitter: props.appDetail?.lastCommitter || '',
    lastCommitTime: props.appDetail?.lastCommitTime || '',
    branchCount: props.appDetail?.branchCount || 0,
  },
});

// Git仓库信息同步状态
const syncLoading = ref(false);

// 编辑相关
const editVisible = ref(false);
const editModel = ref<any>({});
const emit = defineEmits(['save']);

function openEdit() {
  // 初始化编辑模型
  editModel.value = {
    appName: appInfo.value.appName,
    appCode: appInfo.value.appCode,
    appType: appInfo.value.appType,
    status: appInfo.value.status,
    owner: appInfo.value.owner,
    version: appInfo.value.version,
    description: appInfo.value.description,
    gitUrl: appInfo.value.gitInfo?.repoUrl || '',
  };
  editVisible.value = true;
}

async function handleEditOk() {
  // 构建提交数据（与后端实体字段保持一致），统一使用编辑接口
  const submitData: any = {
    // 使用 props.appId 作为主键ID，兜底使用 props.appDetail.id
    id: props.appId || props.appDetail?.id,
    // 保留原有字段，避免后端更新为 null
    ...(props.appDetail || {}),
    // 覆盖需要更新的基础信息字段
    appName: editModel.value.appName || '',
    appCode: editModel.value.appCode || '',
    appType: editModel.value.appType || '',
    // 确保提交给后端的是数字(0/1)
    status: (editModel.value.status !== undefined && editModel.value.status !== null && editModel.value.status !== '')
      ? Number(editModel.value.status)
      : (props.appDetail?.status ?? undefined),
    owner: editModel.value.owner || '',
    version: editModel.value.version || '',
    // 后端实体使用 appDescription 字段
    appDescription: editModel.value.description || '',
    // Git 仓库地址字段为 gitUrl
    gitUrl: editModel.value.gitUrl || '',
  };

  try {
    const result = await editApp(submitData);
    if (result?.success) {
      const newDetail = result?.result || submitData;
      // 同步本地展示数据（映射到 BasicInfo 的 appInfo 结构）
      appInfo.value.appName = newDetail.appName || '';
      appInfo.value.appCode = newDetail.appCode || '';
      appInfo.value.appType = newDetail.appType || '';
      // 后端返回为数字，直接赋值
      appInfo.value.status = (typeof newDetail.status === 'number') ? newDetail.status : Number(newDetail.status);
      appInfo.value.owner = newDetail.owner || '';
      appInfo.value.version = newDetail.version || '';
      // 兼容后端返回 appDescription 字段
      appInfo.value.description = newDetail.appDescription || newDetail.description || '';
      appInfo.value.gitInfo = {
        ...(appInfo.value.gitInfo || {}),
        repoUrl: newDetail.gitUrl || editModel.value.gitUrl || '',
      };

      // 通知父组件保存成功（方便刷新详情）
      emit('save', newDetail);
      createMessage.success('编辑成功');
      editVisible.value = false;
    } else {
      createMessage.error(result?.message || '编辑失败');
    }
  } catch (error) {
    console.error('编辑应用失败:', error);
    createMessage.error('编辑失败');
  }
}

function handleEditCancel() {
  editVisible.value = false;
}

/**
 * 获取初始化命令标题
 */
const getInitCommandTitle = () => {
  if (!props.appDetail) return '初始化命令';
  
  if (props.appDetail.templateType === 'application') {
    return '应用模板初始化命令';
  } else {
    return 'Git仓库下载命令';
  }
};

/**
 * 获取初始化命令
 */
const getInitCommand = () => {
  if (!props.appDetail) return '';
  
  // 如果有自定义命令，直接返回
  if (props.appDetail.initCommand) {
    return props.appDetail.initCommand;
  }
  
  // 根据模板类型生成默认命令
  if (props.appDetail.templateType === 'application') {
    return `npm init jeecg-app ${props.appDetail.appName} --template=${props.appDetail.templateId}`;
  } else {
    // 空白模板，返回Git克隆命令
    if (props.appDetail.gitUrl) {
      return `git clone ${props.appDetail.gitUrl}`;
    } else {
      return 'git clone https://github.com/jeecgboot/jeecg-boot-vue3.git';
    }
  }
};

/**
 * 获取初始化命令描述
 */
const getInitCommandDesc = () => {
  if (!props.appDetail) return '';
  
  if (props.appDetail.templateType === 'application') {
    return '使用此命令初始化应用模板，将创建基于选定模板的新应用。';
  } else {
    return '使用此命令从Git仓库下载应用代码，然后可以进行自定义开发。';
  }
};

/**
 * 复制初始化命令
 */
const copyInitCommand = async () => {
  const command = getInitCommand();
  if (command) {
    await copy(command);
    createMessage.success('命令已复制到剪贴板');
  }
};

/**
 * 获取应用类型颜色
 */
const getAppTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    web: 'blue',
    mobile: 'green',
    desktop: 'purple',
    api: 'orange',
  };
  return colorMap[type] || 'default';
};

/**
 * 获取应用类型文本
 */
const getAppTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API服务',
  };
  return textMap[type] || type;
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: number | string | null) => {
  // 数字状态：0(禁用)红色，1(启用)绿色
  if (status === 0 || status === '0') return 'red';
  if (status === 1 || status === '1') return 'green';
  // 历史字符串状态兼容
  const colorMap: Record<string, string> = {
    running: 'green',
    stopped: 'red',
    pending: 'orange',
    enabled: 'green',
    disabled: 'red',
  };
  return colorMap[String(status)] || 'default';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: number | string | null) => {
  // 数字状态：0(禁用)、1(启用)
  if (status === 0 || status === '0') return '禁用';
  if (status === 1 || status === '1') return '启用';
  // 历史字符串状态兼容
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    pending: '待部署',
    enabled: '启用',
    disabled: '禁用',
  };
  return textMap[String(status)] || String(status);
};

/**
 * 加载应用信息
 */
const loadAppInfo = async () => {
  // TODO: 调用API获取应用详细信息
  console.log('Loading app info for:', props.appId);
};

/**
 * 加载 package.json 依赖信息
 */
const loadPackageJsonData = async () => {
  if (!props.appId) return;
  
  packageJsonLoading.value = true;
  packageJsonError.value = null;
  
  try {
    const result = await getAppPackageJson(props.appId);
    if (result.success) {
      packageJsonData.value = result.result;
    } else {
      packageJsonError.value = result.message || '获取依赖信息失败';
    }
  } catch (error) {
    console.error('获取 package.json 失败:', error);
    packageJsonError.value = '获取依赖信息失败，请稍后重试';
  } finally {
    packageJsonLoading.value = false;
  }
};

onMounted(() => {
  loadAppInfo();
  // 页面初始化时加载已持久化的 Git 仓库信息
  loadGitRepoInfo();
  // 依赖信息暂不展示，避免不必要的接口调用
  if (showDependencies.value) {
    loadPackageJsonData();
  }
});

/**
 * 同步 Git 仓库详细信息并持久化，后续同步为更新
 */
const syncGitInfo = async () => {
  if (!props.appId) {
    return createMessage.warning('缺少应用ID，无法同步');
  }
  syncLoading.value = true;
  try {
    const res = await syncGitRepoInfo(props.appId);
    if (res && res.success) {
      const info = res.result || {};
      // 更新前端展示数据
      appInfo.value.gitInfo = {
        repoUrl: info.htmlUrl || appInfo.value.gitInfo?.repoUrl || props.appDetail?.gitUrl || '',
        defaultBranch: info.defaultBranch || '',
        lastCommit: `${info.lastCommitSha || ''}${info.lastCommitSha ? ' ' : ''}${info.lastCommitMessage || ''}`.trim(),
        lastCommitSha: info.lastCommitSha || '',
        lastCommitMessage: info.lastCommitMessage || '',
        lastCommitter: info.lastCommitter || '',
        lastCommitTime: info.lastCommitTime || '',
        branchCount: info.branchCount || 0,
      };
      createMessage.success('Git 仓库信息同步成功');
    } else {
      createMessage.error(res?.message || '同步失败');
    }
  } catch (e) {
    console.error('同步 Git 仓库失败:', e);
    createMessage.error('同步失败，请检查后端服务或令牌配置');
  } finally {
    syncLoading.value = false;
  }
};

/**
 * 初始化加载已持久化的 Git 仓库信息
 */
const loadGitRepoInfo = async () => {
  if (!props.appId) return;
  try {
    const res = await getGitRepoInfo(props.appId);
    if (res && res.success) {
      const info = res.result || {};
      appInfo.value.gitInfo = {
        repoUrl: info.htmlUrl || appInfo.value.gitInfo?.repoUrl || props.appDetail?.gitUrl || '',
        defaultBranch: info.defaultBranch || '',
        lastCommit: `${info.lastCommitSha || ''}${info.lastCommitSha ? ' ' : ''}${info.lastCommitMessage || ''}`.trim(),
        lastCommitSha: info.lastCommitSha || '',
        lastCommitMessage: info.lastCommitMessage || '',
        lastCommitter: info.lastCommitter || '',
        lastCommitTime: info.lastCommitTime || '',
        branchCount: info.branchCount || 0,
      };
    }
  } catch (e) {
    // 保持静默失败，页面显示“暂无数据”
    console.warn('初始化加载 Git 仓库信息失败:', e);
  }
};

</script>

<style lang="less" scoped>
.basic-info {
  .tech-stack-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .tech-tag {
      display: inline-flex;
      align-items: center;
      margin: 0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      
      .anticon {
        margin-right: 4px;
      }
    }
  }

  .tech-stack {
    .tech-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      background: #fafafa;
      border-radius: 6px;

      .tech-name {
        margin: 0 8px;
        flex: 1;
        font-weight: 500;
      }
    }
  }

  .env-list {
    .env-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;

      .env-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .env-name {
          font-weight: 500;
        }
      }

      .env-url {
        font-size: 12px;
        color: #666;

        a {
          color: #1890ff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mt-4 {
    margin-top: 16px;
  }
}

// 依赖信息样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .ant-spin {
    margin-bottom: 16px;
  }
  
  .loading-text {
    color: #666;
    font-size: 14px;
  }
}

.error-container {
  padding: 20px;
}

.no-data-container {
  padding: 40px;
  text-align: center;
}

.dependency-section {
  .dependency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .dependency-title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #262626;
      
      .anticon {
        margin-right: 8px;
      }
    }
  }
}

.dependency-descriptions {
  :deep(.ant-descriptions-item-label) {
    font-weight: 500;
    color: #262626;
    background-color: #fafafa;
    width: 60%;
  }
  
  :deep(.ant-descriptions-item-content) {
    width: 40%;
  }
  
  :deep(.ant-tag) {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    border-radius: 4px;
  }
  
  :deep(.ant-descriptions-item) {
    padding-bottom: 8px;
  }
}
</style>