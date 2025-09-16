<template>
  <div class="team-departments">
    <!-- 头部操作栏 -->
    <div class="header-actions">
      <div class="header-left">
        <h2 class="page-title">部门管理</h2>
        <p class="page-description">管理组织架构和部门层级，优化团队协作效率</p>
      </div>
      
      <div class="header-right">
        <a-space>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索部门名称或描述"
            style="width: 280px"
            @search="handleSearch"
            allow-clear
          >
            <template #enterButton>
              <SearchOutlined />
            </template>
          </a-input-search>
          
          <a-button @click="refreshDepartments" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            创建部门
          </a-button>
          
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleBatchAction">
                <a-menu-item key="expand">
                  <ExpandAltOutlined />
                  展开全部
                </a-menu-item>
                <a-menu-item key="collapse">
                  <ShrinkOutlined />
                  收起全部
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="export">
                  <ExportOutlined />
                  导出组织架构
                </a-menu-item>
                <a-menu-item key="import">
                  <ImportOutlined />
                  导入组织架构
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="chart">
                  <PartitionOutlined />
                  组织架构图
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              更多操作
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </a-space>
      </div>
    </div>
    
    <!-- 部门统计 -->
    <div class="stats-section">
      <a-row :gutter="[24, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="总部门数"
              :value="departmentStats.total"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <ApartmentOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="一级部门"
              :value="departmentStats.topLevel"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <BankOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="总员工数"
              :value="departmentStats.totalMembers"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <TeamOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="平均层级"
              :value="departmentStats.avgLevel"
              :precision="1"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <NodeIndexOutlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>
    
    <!-- 视图切换 -->
    <div class="view-controls">
      <a-radio-group v-model:value="viewMode" button-style="solid">
        <a-radio-button value="tree">
          <ApartmentOutlined />
          树形视图
        </a-radio-button>
        <a-radio-button value="table">
          <TableOutlined />
          表格视图
        </a-radio-button>
        <a-radio-button value="chart">
          <PartitionOutlined />
          架构图
        </a-radio-button>
      </a-radio-group>
    </div>
    
    <!-- 部门内容 -->
    <div class="departments-content">
      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'" class="tree-view">
        <a-tree
          :tree-data="departmentTree"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          @expand="onExpand"
          @select="onSelect"
          show-line
          :show-icon="true"
          block-node
        >
          <template #icon="{ dataRef }">
            <component :is="getDepartmentIcon(dataRef.type)" />
          </template>
          
          <template #title="{ title, key, dataRef }">
            <div class="department-node">
              <div class="node-info">
                <span class="node-title">{{ title }}</span>
                <a-tag v-if="dataRef.isHeadquarters" color="red" size="small">总部</a-tag>
                <a-tag :color="getDepartmentTypeColor(dataRef.type)" size="small">
                  {{ getDepartmentTypeName(dataRef.type) }}
                </a-tag>
                <span class="member-count">({{ dataRef.memberCount }}人)</span>
              </div>
              
              <div class="node-actions">
                <a-space size="small">
                  <a-tooltip title="查看详情">
                    <a-button type="text" size="small" @click.stop="viewDepartment(dataRef)">
                      <EyeOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip title="添加子部门">
                    <a-button type="text" size="small" @click.stop="addSubDepartment(dataRef)">
                      <PlusOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-tooltip title="编辑部门">
                    <a-button type="text" size="small" @click.stop="editDepartment(dataRef)">
                      <EditOutlined />
                    </a-button>
                  </a-tooltip>
                  
                  <a-dropdown @click.stop>
                    <template #overlay>
                      <a-menu @click="({ key }) => handleDepartmentAction(key, dataRef)">
                        <a-menu-item key="move">
                          <DragOutlined />
                          移动部门
                        </a-menu-item>
                        <a-menu-item key="members">
                          <UserOutlined />
                          管理成员
                        </a-menu-item>
                        <a-menu-item key="settings">
                          <SettingOutlined />
                          部门设置
                        </a-menu-item>
                        <a-menu-divider />
                        <a-menu-item key="delete" class="danger-item">
                          <DeleteOutlined />
                          删除部门
                        </a-menu-item>
                      </a-menu>
                    </template>
                    <a-button type="text" size="small">
                      <MoreOutlined />
                    </a-button>
                  </a-dropdown>
                </a-space>
              </div>
            </div>
          </template>
        </a-tree>
      </div>
      
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <a-table
          :columns="tableColumns"
          :data-source="flatDepartments"
          :pagination="{
            current: currentPage,
            pageSize: pageSize,
            total: flatDepartments.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }"
          :loading="loading"
          row-key="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="department-name">
                <component :is="getDepartmentIcon(record.type)" class="dept-icon" />
                <span>{{ record.name }}</span>
                <a-tag v-if="record.isHeadquarters" color="red" size="small">总部</a-tag>
              </div>
            </template>
            
            <template v-if="column.key === 'type'">
              <a-tag :color="getDepartmentTypeColor(record.type)">
                {{ getDepartmentTypeName(record.type) }}
              </a-tag>
            </template>
            
            <template v-if="column.key === 'manager'">
              <div v-if="record.manager" class="manager-info">
                <a-avatar :src="record.manager.avatar" :size="24">
                  {{ record.manager.name.charAt(0) }}
                </a-avatar>
                <span class="manager-name">{{ record.manager.name }}</span>
              </div>
              <span v-else class="no-manager">未设置</span>
            </template>
            
            <template v-if="column.key === 'members'">
              <div class="member-info">
                <a-avatar-group :max-count="3" size="small">
                  <a-avatar
                    v-for="member in record.members.slice(0, 3)"
                    :key="member.id"
                    :src="member.avatar"
                    :title="member.name"
                  >
                    {{ member.name.charAt(0) }}
                  </a-avatar>
                </a-avatar-group>
                <span class="member-count">{{ record.memberCount }}人</span>
              </div>
            </template>
            
            <template v-if="column.key === 'status'">
              <a-badge
                :status="record.isActive ? 'success' : 'default'"
                :text="record.isActive ? '正常' : '停用'"
              />
            </template>
            
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" size="small" @click="viewDepartment(record)">
                  查看
                </a-button>
                <a-button type="link" size="small" @click="editDepartment(record)">
                  编辑
                </a-button>
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="({ key }) => handleDepartmentAction(key, record)">
                      <a-menu-item key="move">
                        <DragOutlined />
                        移动部门
                      </a-menu-item>
                      <a-menu-item key="members">
                        <UserOutlined />
                        管理成员
                      </a-menu-item>
                      <a-menu-item key="settings">
                        <SettingOutlined />
                        部门设置
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="delete" class="danger-item">
                        <DeleteOutlined />
                        删除部门
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="link" size="small">
                    更多
                    <DownOutlined />
                  </a-button>
                </a-dropdown>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
      
      <!-- 架构图视图 -->
      <div v-if="viewMode === 'chart'" class="chart-view">
        <div class="org-chart">
          <div class="chart-container" ref="chartContainer">
            <!-- 这里可以集成组织架构图组件，如 OrgChart.js 或自定义 SVG -->
            <div class="chart-placeholder">
              <a-empty description="组织架构图功能开发中">
                <a-button type="primary" @click="viewMode = 'tree'">
                  返回树形视图
                </a-button>
              </a-empty>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="departmentTree.length === 0" class="empty-state">
        <a-empty description="暂无部门数据">
          <a-button type="primary" @click="showCreateModal">
            <PlusOutlined />
            创建第一个部门
          </a-button>
        </a-empty>
      </div>
    </div>
    
    <!-- 创建/编辑部门模态框 -->
    <a-modal
      v-model:open="departmentModalVisible"
      :title="isEditing ? '编辑部门' : (isAddingSub ? '添加子部门' : '创建部门')"
      width="600px"
      @ok="handleDepartmentSubmit"
      @cancel="resetDepartmentForm"
      :confirm-loading="submitLoading"
    >
      <a-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="departmentRules"
        layout="vertical"
      >
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="部门名称" name="name">
              <a-input
                v-model:value="departmentForm.name"
                placeholder="请输入部门名称"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="部门类型" name="type">
              <a-select
                v-model:value="departmentForm.type"
                placeholder="选择部门类型"
              >
                <a-select-option value="headquarters">总部</a-select-option>
                <a-select-option value="branch">分公司</a-select-option>
                <a-select-option value="department">部门</a-select-option>
                <a-select-option value="team">团队</a-select-option>
                <a-select-option value="group">小组</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item v-if="!isAddingSub" label="上级部门" name="parentId">
          <a-tree-select
            v-model:value="departmentForm.parentId"
            :tree-data="parentDepartmentOptions"
            placeholder="选择上级部门（可选）"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        
        <a-form-item label="部门描述" name="description">
          <a-textarea
            v-model:value="departmentForm.description"
            placeholder="请输入部门描述"
            :rows="3"
            :max-length="200"
            show-count
          />
        </a-form-item>
        
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="部门负责人" name="managerId">
              <a-select
                v-model:value="departmentForm.managerId"
                placeholder="选择部门负责人"
                show-search
                :filter-option="filterManagerOption"
                allow-clear
              >
                <a-select-option
                  v-for="user in availableManagers"
                  :key="user.id"
                  :value="user.id"
                >
                  <div class="manager-option">
                    <a-avatar :src="user.avatar" :size="20">
                      {{ user.name.charAt(0) }}
                    </a-avatar>
                    <span>{{ user.name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone">
              <a-input
                v-model:value="departmentForm.phone"
                placeholder="请输入联系电话"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="[16, 0]">
          <a-col :span="12">
            <a-form-item label="办公地址" name="address">
              <a-input
                v-model:value="departmentForm.address"
                placeholder="请输入办公地址"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="成立时间" name="establishedAt">
              <a-date-picker
                v-model:value="departmentForm.establishedAt"
                placeholder="选择成立时间"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="部门设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="departmentForm.isActive">
              启用部门（禁用后部门成员将无法正常工作）
            </a-checkbox>
            <a-checkbox v-model:checked="departmentForm.allowSubDepartments">
              允许创建子部门
            </a-checkbox>
            <a-checkbox v-model:checked="departmentForm.isHeadquarters">
              设为总部（仅限顶级部门）
            </a-checkbox>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 部门详情模态框 -->
    <a-modal
      v-model:open="departmentDetailVisible"
      :title="`部门详情 - ${selectedDepartment?.name}`"
      width="900px"
      :footer="null"
    >
      <div v-if="selectedDepartment" class="department-detail">
        <div class="detail-header">
          <div class="department-info">
            <div class="department-title">
              <component :is="getDepartmentIcon(selectedDepartment.type)" class="dept-icon large" />
              <div>
                <h3>{{ selectedDepartment.name }}</h3>
                <div class="department-meta">
                  <a-tag v-if="selectedDepartment.isHeadquarters" color="red">总部</a-tag>
                  <a-tag :color="getDepartmentTypeColor(selectedDepartment.type)">
                    {{ getDepartmentTypeName(selectedDepartment.type) }}
                  </a-tag>
                  <a-tag :color="selectedDepartment.isActive ? 'success' : 'default'">
                    {{ selectedDepartment.isActive ? '正常' : '停用' }}
                  </a-tag>
                </div>
              </div>
            </div>
            <p class="department-description">{{ selectedDepartment.description || '暂无描述' }}</p>
          </div>
        </div>
        
        <a-divider />
        
        <a-tabs default-active-key="overview">
          <a-tab-pane key="overview" tab="概览信息">
            <div class="overview-content">
              <a-row :gutter="[24, 16]">
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">部门负责人:</span>
                    <div v-if="selectedDepartment.manager" class="manager-info">
                      <a-avatar :src="selectedDepartment.manager.avatar" :size="24">
                        {{ selectedDepartment.manager.name.charAt(0) }}
                      </a-avatar>
                      <span>{{ selectedDepartment.manager.name }}</span>
                    </div>
                    <span v-else class="no-data">未设置</span>
                  </div>
                </a-col>
                
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">成员数量:</span>
                    <span class="info-value">{{ selectedDepartment.memberCount }}人</span>
                  </div>
                </a-col>
                
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">联系电话:</span>
                    <span class="info-value">{{ selectedDepartment.phone || '未设置' }}</span>
                  </div>
                </a-col>
                
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">办公地址:</span>
                    <span class="info-value">{{ selectedDepartment.address || '未设置' }}</span>
                  </div>
                </a-col>
                
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">成立时间:</span>
                    <span class="info-value">{{ formatDate(selectedDepartment.establishedAt) }}</span>
                  </div>
                </a-col>
                
                <a-col :span="12">
                  <div class="info-item">
                    <span class="info-label">创建时间:</span>
                    <span class="info-value">{{ formatDate(selectedDepartment.createdAt) }}</span>
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="members" tab="部门成员">
            <div class="members-content">
              <div class="members-header">
                <h4>部门成员 ({{ selectedDepartment.memberCount }})</h4>
                <a-button size="small" @click="manageDepartmentMembers(selectedDepartment)">
                  <UserAddOutlined />
                  管理成员
                </a-button>
              </div>
              
              <div class="members-list">
                <div v-for="member in selectedDepartment.members" :key="member.id" class="member-item">
                  <div class="member-info">
                    <a-avatar :src="member.avatar" :size="32">
                      {{ member.name.charAt(0) }}
                    </a-avatar>
                    <div class="member-details">
                      <div class="member-name">{{ member.name }}</div>
                      <div class="member-position">{{ member.position || '未设置职位' }}</div>
                    </div>
                  </div>
                  
                  <div class="member-meta">
                    <a-tag v-if="member.id === selectedDepartment.manager?.id" color="gold">
                      负责人
                    </a-tag>
                    <span class="join-date">{{ formatDate(member.joinedAt) }}</span>
                  </div>
                </div>
                
                <div v-if="selectedDepartment.members.length === 0" class="no-members">
                  <a-empty description="暂无部门成员" />
                </div>
              </div>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="subdepartments" tab="子部门">
            <div class="subdepartments-content">
              <div class="subdepartments-header">
                <h4>子部门 ({{ selectedDepartment.children?.length || 0 }})</h4>
                <a-button size="small" @click="addSubDepartment(selectedDepartment)">
                  <PlusOutlined />
                  添加子部门
                </a-button>
              </div>
              
              <div class="subdepartments-list">
                <div v-for="subDept in selectedDepartment.children" :key="subDept.id" class="subdept-item">
                  <div class="subdept-info">
                    <component :is="getDepartmentIcon(subDept.type)" class="dept-icon" />
                    <div class="subdept-details">
                      <div class="subdept-name">{{ subDept.name }}</div>
                      <div class="subdept-description">{{ subDept.description || '暂无描述' }}</div>
                    </div>
                  </div>
                  
                  <div class="subdept-meta">
                    <span class="member-count">{{ subDept.memberCount }}人</span>
                    <a-button type="link" size="small" @click="viewDepartment(subDept)">
                      查看详情
                    </a-button>
                  </div>
                </div>
                
                <div v-if="!selectedDepartment.children || selectedDepartment.children.length === 0" class="no-subdepts">
                  <a-empty description="暂无子部门" />
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  ExportOutlined,
  ImportOutlined,
  PartitionOutlined,
  DownOutlined,
  ApartmentOutlined,
  BankOutlined,
  TeamOutlined,
  NodeIndexOutlined,
  TableOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  DragOutlined,
  UserOutlined,
  SettingOutlined,
  UserAddOutlined,
  BuildOutlined,
  HomeOutlined,
  ShopOutlined,
  GroupOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const viewMode = ref('tree')
const departmentModalVisible = ref(false)
const departmentDetailVisible = ref(false)
const isEditing = ref(false)
const isAddingSub = ref(false)
const selectedDepartment = ref(null)
const expandedKeys = ref<string[]>(['1', '2', '3'])
const selectedKeys = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// 表单引用
const departmentFormRef = ref()
const chartContainer = ref()

// 部门统计
const departmentStats = reactive({
  total: 8,
  topLevel: 3,
  totalMembers: 45,
  avgLevel: 2.3
})

// 部门表单
const departmentForm = reactive({
  id: '',
  name: '',
  type: '',
  parentId: '',
  description: '',
  managerId: '',
  phone: '',
  address: '',
  establishedAt: null,
  isActive: true,
  allowSubDepartments: true,
  isHeadquarters: false
})

// 部门表单验证规则
const departmentRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度为2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择部门类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 部门树数据
const departmentTree = ref([
  {
    title: '总公司',
    key: '1',
    id: '1',
    name: '总公司',
    type: 'headquarters',
    isHeadquarters: true,
    memberCount: 15,
    isActive: true,
    manager: { id: '1', name: '张总', avatar: '', email: 'zhang@example.com' },
    description: '公司总部，负责整体战略规划和管理',
    phone: '010-12345678',
    address: '北京市朝阳区xxx大厦',
    establishedAt: '2020-01-01',
    createdAt: '2020-01-01T00:00:00Z',
    children: [
      {
        title: '技术部',
        key: '1-1',
        id: '2',
        name: '技术部',
        type: 'department',
        isHeadquarters: false,
        memberCount: 20,
        isActive: true,
        manager: { id: '2', name: '李经理', avatar: '', email: 'li@example.com' },
        description: '负责产品技术研发和系统维护',
        phone: '010-12345679',
        address: '北京市朝阳区xxx大厦8层',
        establishedAt: '2020-03-01',
        createdAt: '2020-03-01T00:00:00Z',
        children: [
          {
            title: '前端团队',
            key: '1-1-1',
            id: '3',
            name: '前端团队',
            type: 'team',
            isHeadquarters: false,
            memberCount: 8,
            isActive: true,
            manager: { id: '3', name: '王组长', avatar: '', email: 'wang@example.com' },
            description: '负责前端界面开发和用户体验优化',
            establishedAt: '2020-06-01',
            createdAt: '2020-06-01T00:00:00Z',
            members: [
              { id: '3', name: '王组长', position: '前端组长', avatar: '', joinedAt: '2020-06-01' },
              { id: '4', name: '赵工程师', position: '高级前端工程师', avatar: '', joinedAt: '2020-08-15' }
            ]
          },
          {
            title: '后端团队',
            key: '1-1-2',
            id: '4',
            name: '后端团队',
            type: 'team',
            isHeadquarters: false,
            memberCount: 12,
            isActive: true,
            manager: { id: '5', name: '钱组长', avatar: '', email: 'qian@example.com' },
            description: '负责后端服务开发和数据库设计',
            establishedAt: '2020-06-01',
            createdAt: '2020-06-01T00:00:00Z',
            members: [
              { id: '5', name: '钱组长', position: '后端组长', avatar: '', joinedAt: '2020-06-01' },
              { id: '6', name: '孙工程师', position: '高级后端工程师', avatar: '', joinedAt: '2020-07-20' }
            ]
          }
        ]
      },
      {
        title: '产品部',
        key: '1-2',
        id: '5',
        name: '产品部',
        type: 'department',
        isHeadquarters: false,
        memberCount: 6,
        isActive: true,
        manager: { id: '7', name: '周经理', avatar: '', email: 'zhou@example.com' },
        description: '负责产品规划、设计和运营',
        phone: '010-12345680',
        address: '北京市朝阳区xxx大厦6层',
        establishedAt: '2020-04-01',
        createdAt: '2020-04-01T00:00:00Z',
        members: [
          { id: '7', name: '周经理', position: '产品经理', avatar: '', joinedAt: '2020-04-01' },
          { id: '8', name: '吴设计师', position: 'UI设计师', avatar: '', joinedAt: '2020-05-15' }
        ]
      }
    ]
  },
  {
    title: '上海分公司',
    key: '2',
    id: '6',
    name: '上海分公司',
    type: 'branch',
    isHeadquarters: false,
    memberCount: 8,
    isActive: true,
    manager: { id: '9', name: '郑总', avatar: '', email: 'zheng@example.com' },
    description: '上海地区业务拓展和客户服务',
    phone: '021-12345678',
    address: '上海市浦东新区xxx中心',
    establishedAt: '2021-01-01',
    createdAt: '2021-01-01T00:00:00Z',
    children: [
      {
        title: '销售部',
        key: '2-1',
        id: '7',
        name: '销售部',
        type: 'department',
        isHeadquarters: false,
        memberCount: 5,
        isActive: true,
        manager: { id: '10', name: '冯经理', avatar: '', email: 'feng@example.com' },
        description: '负责华东地区销售业务',
        establishedAt: '2021-02-01',
        createdAt: '2021-02-01T00:00:00Z',
        members: [
          { id: '10', name: '冯经理', position: '销售经理', avatar: '', joinedAt: '2021-02-01' },
          { id: '11', name: '陈专员', position: '销售专员', avatar: '', joinedAt: '2021-03-15' }
        ]
      }
    ]
  },
  {
    title: '深圳分公司',
    key: '3',
    id: '8',
    name: '深圳分公司',
    type: 'branch',
    isHeadquarters: false,
    memberCount: 2,
    isActive: false,
    manager: null,
    description: '深圳地区业务（暂停运营）',
    phone: '0755-12345678',
    address: '深圳市南山区xxx科技园',
    establishedAt: '2022-01-01',
    createdAt: '2022-01-01T00:00:00Z',
    members: []
  }
])

// 表格列配置
const tableColumns = [
  {
    title: '部门名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '部门类型',
    dataIndex: 'type',
    key: 'type',
    width: 120
  },
  {
    title: '负责人',
    dataIndex: 'manager',
    key: 'manager',
    width: 150
  },
  {
    title: '成员',
    dataIndex: 'members',
    key: 'members',
    width: 150
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 130
  },
  {
    title: '状态',
    dataIndex: 'isActive',
    key: 'status',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    customRender: ({ text }) => formatDate(text)
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right'
  }
]

// 可选负责人列表
const availableManagers = ref([
  { id: '1', name: '张总', email: 'zhang@example.com', avatar: '' },
  { id: '2', name: '李经理', email: 'li@example.com', avatar: '' },
  { id: '3', name: '王组长', email: 'wang@example.com', avatar: '' },
  { id: '4', name: '赵工程师', email: 'zhao@example.com', avatar: '' },
  { id: '5', name: '钱组长', email: 'qian@example.com', avatar: '' }
])

// 计算属性
/**
 * 扁平化的部门列表（用于表格视图）
 */
const flatDepartments = computed(() => {
  const flatten = (departments: any[], level = 0): any[] => {
    let result: any[] = []
    
    departments.forEach(dept => {
      const flatDept = {
        ...dept,
        level,
        key: dept.id
      }
      result.push(flatDept)
      
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flatten(dept.children, level + 1))
      }
    })
    
    return result
  }
  
  const flattened = flatten(departmentTree.value)
  
  if (!searchKeyword.value) {
    return flattened
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return flattened.filter(dept => 
    dept.name.toLowerCase().includes(keyword) ||
    dept.description?.toLowerCase().includes(keyword)
  )
})

/**
 * 上级部门选项（用于创建/编辑时选择）
 */
const parentDepartmentOptions = computed(() => {
  const buildOptions = (departments: any[]): any[] => {
    return departments.map(dept => ({
      title: dept.name,
      value: dept.id,
      key: dept.id,
      children: dept.children ? buildOptions(dept.children) : undefined
    }))
  }
  
  return buildOptions(departmentTree.value)
})

// 方法
/**
 * 获取部门图标
 */
const getDepartmentIcon = (type: string) => {
  const icons = {
    headquarters: BankOutlined,
    branch: BuildOutlined,
    department: ApartmentOutlined,
    team: TeamOutlined,
    group: GroupOutlined
  }
  return icons[type] || ApartmentOutlined
}

/**
 * 获取部门类型颜色
 */
const getDepartmentTypeColor = (type: string) => {
  const colors = {
    headquarters: 'red',
    branch: 'blue',
    department: 'green',
    team: 'orange',
    group: 'purple'
  }
  return colors[type] || 'default'
}

/**
 * 获取部门类型名称
 */
const getDepartmentTypeName = (type: string) => {
  const names = {
    headquarters: '总部',
    branch: '分公司',
    department: '部门',
    team: '团队',
    group: '小组'
  }
  return names[type] || type
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 搜索处理
 */
const handleSearch = (value: string) => {
  searchKeyword.value = value
}

/**
 * 刷新部门列表
 */
const refreshDepartments = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('部门列表已刷新')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

/**
 * 批量操作处理
 */
const handleBatchAction = ({ key }: { key: string }) => {
  switch (key) {
    case 'expand':
      expandedKeys.value = flatDepartments.value.map(dept => dept.key)
      break
    case 'collapse':
      expandedKeys.value = []
      break
    case 'export':
      message.success('导出功能开发中')
      break
    case 'import':
      message.success('导入功能开发中')
      break
    case 'chart':
      viewMode.value = 'chart'
      break
  }
}

/**
 * 树节点展开/收起
 */
const onExpand = (keys: string[]) => {
  expandedKeys.value = keys
}

/**
 * 树节点选择
 */
const onSelect = (keys: string[]) => {
  selectedKeys.value = keys
}

/**
 * 表格变化处理
 */
const handleTableChange = (pagination: any) => {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
}

/**
 * 显示创建模态框
 */
const showCreateModal = () => {
  isEditing.value = false
  isAddingSub.value = false
  departmentModalVisible.value = true
}

/**
 * 添加子部门
 */
const addSubDepartment = (parentDept: any) => {
  isEditing.value = false
  isAddingSub.value = true
  departmentForm.parentId = parentDept.id
  departmentModalVisible.value = true
}

/**
 * 编辑部门
 */
const editDepartment = (dept: any) => {
  isEditing.value = true
  isAddingSub.value = false
  Object.assign(departmentForm, {
    ...dept,
    managerId: dept.manager?.id || '',
    establishedAt: dept.establishedAt ? dayjs(dept.establishedAt) : null
  })
  departmentModalVisible.value = true
}

/**
 * 查看部门详情
 */
const viewDepartment = (dept: any) => {
  selectedDepartment.value = dept
  departmentDetailVisible.value = true
}

/**
 * 部门操作处理
 */
const handleDepartmentAction = (action: string, dept: any) => {
  switch (action) {
    case 'move':
      message.info(`移动部门 ${dept.name} 功能开发中`)
      break
    case 'members':
      manageDepartmentMembers(dept)
      break
    case 'settings':
      message.info(`部门设置功能开发中`)
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除部门 ${dept.name} 吗？此操作将同时删除所有子部门，且不可恢复。`,
        okType: 'danger',
        onOk: () => {
          message.success(`已删除部门 ${dept.name}`)
        }
      })
      break
  }
}

/**
 * 管理部门成员
 */
const manageDepartmentMembers = (dept: any) => {
  message.info(`管理 ${dept.name} 成员功能开发中`)
}

/**
 * 提交部门表单
 */
const handleDepartmentSubmit = async () => {
  try {
    await departmentFormRef.value.validate()
    submitLoading.value = true
    
    // 模拟提交请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (isEditing.value) {
      message.success(`部门 ${departmentForm.name} 更新成功`)
    } else if (isAddingSub.value) {
      message.success(`子部门 ${departmentForm.name} 创建成功`)
    } else {
      message.success(`部门 ${departmentForm.name} 创建成功`)
    }
    
    departmentModalVisible.value = false
    resetDepartmentForm()
    refreshDepartments()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

/**
 * 重置部门表单
 */
const resetDepartmentForm = () => {
  departmentFormRef.value?.resetFields()
  Object.assign(departmentForm, {
    id: '',
    name: '',
    type: '',
    parentId: '',
    description: '',
    managerId: '',
    phone: '',
    address: '',
    establishedAt: null,
    isActive: true,
    allowSubDepartments: true,
    isHeadquarters: false
  })
}

/**
 * 过滤负责人选项
 */
const filterManagerOption = (input: string, option: any) => {
  const user = availableManagers.value.find(u => u.id === option.value)
  if (!user) return false
  
  return user.name.toLowerCase().includes(input.toLowerCase()) ||
         user.email.toLowerCase().includes(input.toLowerCase())
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.team-departments {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.view-controls {
  margin-bottom: 24px;
  text-align: center;
}

.departments-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.tree-view {
  min-height: 400px;
}

.department-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.department-node:hover {
  background-color: #f5f5f5;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 500;
  color: #262626;
}

.member-count {
  color: #666;
  font-size: 12px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.department-node:hover .node-actions {
  opacity: 1;
}

.table-view {
  min-height: 400px;
}

.department-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dept-icon {
  font-size: 16px;
  color: #1890ff;
}

.dept-icon.large {
  font-size: 24px;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.manager-name {
  color: #262626;
}

.no-manager {
  color: #999;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-count {
  color: #666;
  font-size: 12px;
}

.chart-view {
  min-height: 500px;
}

.chart-container {
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.manager-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-email {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.department-detail {
  padding: 0;
}

.detail-header {
  margin-bottom: 0;
}

.department-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.department-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.department-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.department-description {
  color: #666;
  line-height: 1.5;
  margin: 8px 0 0 0;
}

.overview-content {
  padding: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.info-label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #262626;
}

.no-data {
  color: #999;
}

.members-content {
  padding: 0;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.members-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.member-details {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 2px;
}

.member-position {
  font-size: 12px;
  color: #666;
}

.member-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.join-date {
  font-size: 12px;
  color: #666;
}

.no-members {
  text-align: center;
  padding: 40px 0;
}

.subdepartments-content {
  padding: 0;
}

.subdepartments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.subdepartments-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.subdepartments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subdept-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.subdept-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.subdept-details {
  flex: 1;
  min-width: 0;
}

.subdept-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 2px;
}

.subdept-description {
  font-size: 12px;
  color: #666;
}

.subdept-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-subdepts {
  text-align: center;
  padding: 40px 0;
}

:deep(.danger-item) {
  color: #f5222d !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-right .ant-space {
    width: 100%;
    justify-content: space-between;
  }
  
  .view-controls {
    text-align: left;
  }
  
  .department-node {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .node-actions {
    opacity: 1;
    align-self: flex-end;
  }
  
  .member-item,
  .subdept-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .member-meta,
  .subdept-meta {
    align-self: flex-end;
  }
}

@media (max-width: 576px) {
  .departments-content {
    padding: 16px;
  }
  
  .header-actions {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stats-section .ant-col {
    margin-bottom: 16px;
  }
}

/* 动画效果 */
.department-node {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInScale 0.4s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 树形视图样式优化 */
:deep(.ant-tree) {
  background: transparent;
}

:deep(.ant-tree .ant-tree-node-content-wrapper) {
  padding: 0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.ant-tree .ant-tree-node-content-wrapper:hover) {
  background-color: transparent;
}

:deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: #e6f7ff;
}

:deep(.ant-tree .ant-tree-switcher) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-tree .ant-tree-iconEle) {
  margin-right: 8px;
}

/* 表格样式优化 */
:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #262626;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

/* 模态框样式优化 */
:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 24px 16px;
}

:deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

:deep(.ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
}

/* 标签样式优化 */
:deep(.ant-tag) {
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.2;
  padding: 2px 6px;
}

/* 统计卡片样式优化 */
:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
  font-weight: 600;
}

:deep(.ant-statistic-content-prefix) {
  margin-right: 8px;
  font-size: 20px;
}
</style>