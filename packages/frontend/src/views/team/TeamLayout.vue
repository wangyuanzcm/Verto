<template>
  <div class="team-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <TeamOutlined class="logo-icon" />
          <span v-if="!sidebarCollapsed" class="logo-text">团队管理</span>
        </div>
        <a-button 
          type="text" 
          @click="toggleSidebar"
          class="collapse-btn"
        >
          <MenuFoldOutlined v-if="!sidebarCollapsed" />
          <MenuUnfoldOutlined v-else />
        </a-button>
      </div>
      
      <div class="sidebar-content">
        <a-menu
          v-model:selected-keys="selectedKeys"
          mode="inline"
          :inline-collapsed="sidebarCollapsed"
          @click="handleMenuClick"
          class="sidebar-menu"
        >
          <a-menu-item key="overview">
            <DashboardOutlined />
            <span>团队概览</span>
          </a-menu-item>
          
          <a-menu-item key="members">
            <UserOutlined />
            <span>成员管理</span>
          </a-menu-item>
          
          <a-menu-item key="roles">
            <SafetyCertificateOutlined />
            <span>角色权限</span>
          </a-menu-item>
          
          <a-menu-item key="departments">
            <ApartmentOutlined />
            <span>部门管理</span>
          </a-menu-item>
          
          <a-menu-item key="invitations">
            <MailOutlined />
            <span>邀请管理</span>
          </a-menu-item>
          
          <a-menu-item key="activity">
            <HistoryOutlined />
            <span>活动日志</span>
          </a-menu-item>
          
          <a-menu-item key="settings">
            <SettingOutlined />
            <span>团队设置</span>
          </a-menu-item>
        </a-menu>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 头部 -->
      <div class="content-header">
        <div class="header-left">
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <HomeOutlined />
              <span>首页</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <TeamOutlined />
              <span>团队管理</span>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentPageTitle">
              {{ currentPageTitle }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          
          <h1 class="page-title">{{ currentPageTitle || '团队管理' }}</h1>
        </div>
        
        <div class="header-right">
          <div class="toolbar">
            <a-space>
              <a-input-search
                v-model:value="searchKeyword"
                placeholder="搜索成员、角色、部门..."
                style="width: 240px"
                @search="handleSearch"
                allow-clear
              >
                <template #enterButton>
                  <SearchOutlined />
                </template>
              </a-input-search>
              
              <a-button @click="handleRefresh" :loading="refreshing">
                <ReloadOutlined />
                刷新
              </a-button>
              
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="handleQuickAction">
                    <a-menu-item key="invite-member">
                      <UserAddOutlined />
                      邀请成员
                    </a-menu-item>
                    <a-menu-item key="create-role">
                      <PlusOutlined />
                      创建角色
                    </a-menu-item>
                    <a-menu-item key="create-department">
                      <ApartmentOutlined />
                      创建部门
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="export-members">
                      <ExportOutlined />
                      导出成员
                    </a-menu-item>
                    <a-menu-item key="import-members">
                      <ImportOutlined />
                      导入成员
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="primary">
                  快速操作
                  <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
    </div>
    
    <!-- 邀请成员模态框 -->
    <a-modal
      v-model:open="inviteModalVisible"
      title="邀请成员"
      width="600px"
      @ok="handleInviteSubmit"
      @cancel="handleInviteCancel"
      :confirm-loading="inviting"
    >
      <a-form
        ref="inviteFormRef"
        :model="inviteForm"
        :rules="inviteRules"
        layout="vertical"
      >
        <a-form-item label="邀请方式" name="inviteType">
          <a-radio-group v-model:value="inviteForm.inviteType">
            <a-radio value="email">邮箱邀请</a-radio>
            <a-radio value="link">邀请链接</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item 
          v-if="inviteForm.inviteType === 'email'"
          label="邮箱地址" 
          name="emails"
        >
          <a-textarea
            v-model:value="inviteForm.emails"
            placeholder="请输入邮箱地址，多个邮箱用换行或逗号分隔"
            :rows="4"
          />
          <div class="form-tip">
            支持批量邀请，每行一个邮箱地址或用逗号分隔
          </div>
        </a-form-item>
        
        <a-form-item label="默认角色" name="defaultRole">
          <a-select v-model:value="inviteForm.defaultRole" placeholder="请选择默认角色">
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="所属部门" name="department">
          <a-tree-select
            v-model:value="inviteForm.department"
            :tree-data="departmentTree"
            placeholder="请选择部门"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        
        <a-form-item label="邀请消息" name="message">
          <a-textarea
            v-model:value="inviteForm.message"
            placeholder="可选：添加个性化邀请消息"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>
        
        <a-form-item v-if="inviteForm.inviteType === 'link'" label="链接设置">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="有效期" name="expireTime">
                <a-select v-model:value="inviteForm.expireTime" placeholder="选择有效期">
                  <a-select-option value="1">1天</a-select-option>
                  <a-select-option value="7">7天</a-select-option>
                  <a-select-option value="30">30天</a-select-option>
                  <a-select-option value="0">永久有效</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="使用次数" name="useLimit">
                <a-input-number
                  v-model:value="inviteForm.useLimit"
                  placeholder="0表示不限制"
                  :min="0"
                  :max="1000"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
      
      <!-- 邀请链接结果 -->
      <div v-if="inviteLink" class="invite-link-result">
        <a-alert
          message="邀请链接已生成"
          type="success"
          show-icon
          class="link-alert"
        />
        <div class="link-container">
          <a-input
            :value="inviteLink"
            readonly
            class="link-input"
          >
            <template #suffix>
              <a-button type="text" @click="copyInviteLink">
                <CopyOutlined />
              </a-button>
            </template>
          </a-input>
        </div>
        <div class="link-actions">
          <a-space>
            <a-button @click="shareInviteLink">
              <ShareAltOutlined />
              分享链接
            </a-button>
            <a-button @click="generateQRCode">
              <QrcodeOutlined />
              生成二维码
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
    
    <!-- 创建角色模态框 -->
    <a-modal
      v-model:open="roleModalVisible"
      title="创建角色"
      width="800px"
      @ok="handleRoleSubmit"
      @cancel="handleRoleCancel"
      :confirm-loading="creatingRole"
    >
      <a-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="角色名称" name="name">
              <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色标识" name="code">
              <a-input v-model:value="roleForm.code" placeholder="请输入角色标识" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="roleForm.description"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="权限配置" name="permissions">
          <div class="permissions-config">
            <a-tree
              v-model:checked-keys="roleForm.permissions"
              :tree-data="permissionTree"
              checkable
              :default-expand-all="true"
              class="permission-tree"
            >
              <template #title="{ title, description }">
                <div class="permission-item">
                  <span class="permission-title">{{ title }}</span>
                  <span v-if="description" class="permission-desc">{{ description }}</span>
                </div>
              </template>
            </a-tree>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 创建部门模态框 -->
    <a-modal
      v-model:open="departmentModalVisible"
      title="创建部门"
      width="600px"
      @ok="handleDepartmentSubmit"
      @cancel="handleDepartmentCancel"
      :confirm-loading="creatingDepartment"
    >
      <a-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="departmentRules"
        layout="vertical"
      >
        <a-form-item label="部门名称" name="name">
          <a-input v-model:value="departmentForm.name" placeholder="请输入部门名称" />
        </a-form-item>
        
        <a-form-item label="上级部门" name="parentId">
          <a-tree-select
            v-model:value="departmentForm.parentId"
            :tree-data="departmentTree"
            placeholder="请选择上级部门（可选）"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        
        <a-form-item label="部门负责人" name="managerId">
          <a-select v-model:value="departmentForm.managerId" placeholder="请选择部门负责人">
            <a-select-option v-for="member in members" :key="member.id" :value="member.id">
              <div class="member-option">
                <a-avatar :size="24" :src="member.avatar">{{ member.name.charAt(0) }}</a-avatar>
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.role }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="部门描述" name="description">
          <a-textarea
            v-model:value="departmentForm.description"
            placeholder="请输入部门描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import {
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  MailOutlined,
  HistoryOutlined,
  SettingOutlined,
  HomeOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DownOutlined,
  CopyOutlined,
  ShareAltOutlined,
  QrcodeOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const sidebarCollapsed = ref(false)
const selectedKeys = ref(['overview'])
const searchKeyword = ref('')
const refreshing = ref(false)
const inviteModalVisible = ref(false)
const roleModalVisible = ref(false)
const departmentModalVisible = ref(false)
const inviting = ref(false)
const creatingRole = ref(false)
const creatingDepartment = ref(false)
const inviteLink = ref('')

// 表单引用
const inviteFormRef = ref<FormInstance>()
const roleFormRef = ref<FormInstance>()
const departmentFormRef = ref<FormInstance>()

// 邀请表单
const inviteForm = reactive({
  inviteType: 'email',
  emails: '',
  defaultRole: '',
  department: '',
  message: '',
  expireTime: '7',
  useLimit: 0
})

// 角色表单
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  permissions: []
})

// 部门表单
const departmentForm = reactive({
  name: '',
  parentId: '',
  managerId: '',
  description: ''
})

// 模拟数据
const roles = ref([
  { id: '1', name: '管理员', code: 'admin' },
  { id: '2', name: '项目经理', code: 'pm' },
  { id: '3', name: '设计师', code: 'designer' },
  { id: '4', name: '开发者', code: 'developer' },
  { id: '5', name: '测试员', code: 'tester' }
])

const members = ref([
  { id: '1', name: '张三', role: '管理员', avatar: 'https://via.placeholder.com/32x32' },
  { id: '2', name: '李四', role: '项目经理', avatar: 'https://via.placeholder.com/32x32' },
  { id: '3', name: '王五', role: '设计师', avatar: 'https://via.placeholder.com/32x32' },
  { id: '4', name: '赵六', role: '开发者', avatar: 'https://via.placeholder.com/32x32' }
])

const departmentTree = ref([
  {
    title: '技术部',
    value: '1',
    children: [
      { title: '前端组', value: '11' },
      { title: '后端组', value: '12' },
      { title: '测试组', value: '13' }
    ]
  },
  {
    title: '产品部',
    value: '2',
    children: [
      { title: '产品组', value: '21' },
      { title: '设计组', value: '22' }
    ]
  },
  {
    title: '运营部',
    value: '3',
    children: [
      { title: '市场组', value: '31' },
      { title: '客服组', value: '32' }
    ]
  }
])

const permissionTree = ref([
  {
    title: '项目管理',
    key: 'project',
    description: '项目相关权限',
    children: [
      { title: '查看项目', key: 'project:view', description: '查看项目列表和详情' },
      { title: '创建项目', key: 'project:create', description: '创建新项目' },
      { title: '编辑项目', key: 'project:edit', description: '编辑项目信息' },
      { title: '删除项目', key: 'project:delete', description: '删除项目' }
    ]
  },
  {
    title: '需求管理',
    key: 'requirement',
    description: '需求相关权限',
    children: [
      { title: '查看需求', key: 'requirement:view', description: '查看需求列表和详情' },
      { title: '创建需求', key: 'requirement:create', description: '创建新需求' },
      { title: '编辑需求', key: 'requirement:edit', description: '编辑需求信息' },
      { title: '删除需求', key: 'requirement:delete', description: '删除需求' }
    ]
  },
  {
    title: '原型设计',
    key: 'prototype',
    description: '原型相关权限',
    children: [
      { title: '查看原型', key: 'prototype:view', description: '查看原型列表和详情' },
      { title: '创建原型', key: 'prototype:create', description: '创建新原型' },
      { title: '编辑原型', key: 'prototype:edit', description: '编辑原型内容' },
      { title: '删除原型', key: 'prototype:delete', description: '删除原型' }
    ]
  },
  {
    title: '团队管理',
    key: 'team',
    description: '团队相关权限',
    children: [
      { title: '查看成员', key: 'team:view', description: '查看团队成员' },
      { title: '邀请成员', key: 'team:invite', description: '邀请新成员' },
      { title: '管理成员', key: 'team:manage', description: '管理成员信息和权限' },
      { title: '移除成员', key: 'team:remove', description: '移除团队成员' }
    ]
  },
  {
    title: '系统设置',
    key: 'system',
    description: '系统相关权限',
    children: [
      { title: '查看设置', key: 'system:view', description: '查看系统设置' },
      { title: '修改设置', key: 'system:edit', description: '修改系统设置' },
      { title: '用户管理', key: 'system:user', description: '管理系统用户' },
      { title: '日志查看', key: 'system:log', description: '查看系统日志' }
    ]
  }
])

// 表单验证规则
const inviteRules = {
  emails: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' }
  ],
  defaultRole: [
    { required: true, message: '请选择默认角色', trigger: 'change' }
  ]
}

const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色标识只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ]
}

const departmentRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 30, message: '部门名称长度在 2 到 30 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const currentPageTitle = computed(() => {
  const routeMap = {
    overview: '团队概览',
    members: '成员管理',
    roles: '角色权限',
    departments: '部门管理',
    invitations: '邀请管理',
    activity: '活动日志',
    settings: '团队设置'
  }
  return routeMap[selectedKeys.value[0]] || ''
})

// 方法
/**
 * 切换侧边栏折叠状态
 */
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

/**
 * 处理菜单点击
 */
const handleMenuClick = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  router.push(`/team/${key}`)
}

/**
 * 处理搜索
 */
const handleSearch = (value: string) => {
  console.log('搜索:', value)
  // 实现搜索逻辑
}

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  refreshing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('刷新成功')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

/**
 * 处理快速操作
 */
const handleQuickAction = ({ key }: { key: string }) => {
  switch (key) {
    case 'invite-member':
      showInviteModal()
      break
    case 'create-role':
      showRoleModal()
      break
    case 'create-department':
      showDepartmentModal()
      break
    case 'export-members':
      handleExportMembers()
      break
    case 'import-members':
      handleImportMembers()
      break
  }
}

/**
 * 显示邀请成员模态框
 */
const showInviteModal = () => {
  inviteModalVisible.value = true
  inviteLink.value = ''
  Object.assign(inviteForm, {
    inviteType: 'email',
    emails: '',
    defaultRole: '',
    department: '',
    message: '',
    expireTime: '7',
    useLimit: 0
  })
}

/**
 * 处理邀请提交
 */
const handleInviteSubmit = async () => {
  try {
    await inviteFormRef.value?.validate()
    
    inviting.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (inviteForm.inviteType === 'link') {
      inviteLink.value = `https://verto.example.com/invite?token=abc123&expires=${inviteForm.expireTime}`
      message.success('邀请链接生成成功')
    } else {
      message.success('邀请邮件发送成功')
      inviteModalVisible.value = false
    }
  } catch (error) {
    message.error('请检查表单信息')
  } finally {
    inviting.value = false
  }
}

/**
 * 取消邀请
 */
const handleInviteCancel = () => {
  inviteModalVisible.value = false
  inviteLink.value = ''
}

/**
 * 复制邀请链接
 */
const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    message.success('链接已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

/**
 * 分享邀请链接
 */
const shareInviteLink = () => {
  if (navigator.share) {
    navigator.share({
      title: '团队邀请',
      text: '邀请您加入我们的团队',
      url: inviteLink.value
    })
  } else {
    copyInviteLink()
  }
}

/**
 * 生成二维码
 */
const generateQRCode = () => {
  message.info('二维码生成功能开发中')
}

/**
 * 显示角色创建模态框
 */
const showRoleModal = () => {
  roleModalVisible.value = true
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    permissions: []
  })
}

/**
 * 处理角色提交
 */
const handleRoleSubmit = async () => {
  try {
    await roleFormRef.value?.validate()
    
    creatingRole.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    message.success('角色创建成功')
    roleModalVisible.value = false
  } catch (error) {
    message.error('请检查表单信息')
  } finally {
    creatingRole.value = false
  }
}

/**
 * 取消角色创建
 */
const handleRoleCancel = () => {
  roleModalVisible.value = false
}

/**
 * 显示部门创建模态框
 */
const showDepartmentModal = () => {
  departmentModalVisible.value = true
  Object.assign(departmentForm, {
    name: '',
    parentId: '',
    managerId: '',
    description: ''
  })
}

/**
 * 处理部门提交
 */
const handleDepartmentSubmit = async () => {
  try {
    await departmentFormRef.value?.validate()
    
    creatingDepartment.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    message.success('部门创建成功')
    departmentModalVisible.value = false
  } catch (error) {
    message.error('请检查表单信息')
  } finally {
    creatingDepartment.value = false
  }
}

/**
 * 取消部门创建
 */
const handleDepartmentCancel = () => {
  departmentModalVisible.value = false
}

/**
 * 导出成员
 */
const handleExportMembers = () => {
  message.success('导出功能开发中')
}

/**
 * 导入成员
 */
const handleImportMembers = () => {
  message.success('导入功能开发中')
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    const pathSegments = newPath.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    if (lastSegment && lastSegment !== 'team') {
      selectedKeys.value = [lastSegment]
    } else {
      selectedKeys.value = ['overview']
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.team-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.logo-icon {
  font-size: 24px;
  color: #1890ff;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.collapse-btn {
  padding: 4px;
  border: none;
  background: transparent;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
}

.sidebar-menu :deep(.ant-menu-item-selected) {
  background: #e6f7ff;
  color: #1890ff;
}

.sidebar-menu :deep(.ant-menu-item:hover) {
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.header-left {
  flex: 1;
}

.breadcrumb {
  margin-bottom: 8px;
}

.breadcrumb :deep(.ant-breadcrumb-link) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.header-right {
  display: flex;
  align-items: center;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 模态框样式 */
.form-tip {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.invite-link-result {
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.link-alert {
  margin-bottom: 12px;
}

.link-container {
  margin-bottom: 12px;
}

.link-input {
  font-family: monospace;
}

.link-actions {
  text-align: center;
}

.permissions-config {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
}

.permission-tree {
  background: transparent;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.permission-title {
  font-weight: 500;
  color: #262626;
}

.permission-desc {
  font-size: 12px;
  color: #666;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  flex: 1;
  font-weight: 500;
}

.member-role {
  font-size: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 220px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toolbar {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 260px;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .content-header {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .content-body {
    padding: 16px;
  }
  
  .toolbar :deep(.ant-space) {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar :deep(.ant-input-search) {
    width: 100% !important;
  }
}

@media (max-width: 576px) {
  .content-header {
    padding: 8px 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .content-body {
    padding: 12px;
  }
  
  .sidebar-header {
    padding: 12px 16px;
  }
  
  .logo-text {
    font-size: 16px;
  }
}
</style>