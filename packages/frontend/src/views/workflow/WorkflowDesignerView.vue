<template>
  <div class="workflow-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <a-space>
          <a-button @click="handleNew">
            <FileAddOutlined />
            新建
          </a-button>
          
          <a-button @click="handleOpen">
            <FolderOpenOutlined />
            打开
          </a-button>
          
          <a-button @click="handleSave" :disabled="!hasChanges">
            <SaveOutlined />
            保存
          </a-button>
          
          <a-button @click="handleSaveAs">
            <ExportOutlined />
            另存为
          </a-button>
          
          <a-divider type="vertical" />
          
          <a-button @click="handleUndo" :disabled="!canUndo">
            <UndoOutlined />
            撤销
          </a-button>
          
          <a-button @click="handleRedo" :disabled="!canRedo">
            <RedoOutlined />
            重做
          </a-button>
          
          <a-divider type="vertical" />
          
          <a-button @click="handleValidate">
            <CheckCircleOutlined />
            验证
          </a-button>
          
          <a-button @click="handlePreview">
            <EyeOutlined />
            预览
          </a-button>
          
          <a-button type="primary" @click="handleDeploy">
            <CloudUploadOutlined />
            部署
          </a-button>
        </a-space>
      </div>
      
      <div class="toolbar-center">
        <div class="workflow-info">
          <span class="workflow-name">{{ currentWorkflow.name || '未命名流程' }}</span>
          <span class="workflow-version">v{{ currentWorkflow.version || '1.0.0' }}</span>
          <a-tag v-if="hasChanges" color="orange">未保存</a-tag>
        </div>
      </div>
      
      <div class="toolbar-right">
        <a-space>
          <a-tooltip title="网格">
            <a-button 
              :type="showGrid ? 'primary' : 'default'"
              @click="toggleGrid"
            >
              <BorderOutlined />
            </a-button>
          </a-tooltip>
          
          <a-tooltip title="缩放">
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleZoom">
                  <a-menu-item key="fit">适应画布</a-menu-item>
                  <a-menu-item key="actual">实际大小</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="200">200%</a-menu-item>
                  <a-menu-item key="150">150%</a-menu-item>
                  <a-menu-item key="100">100%</a-menu-item>
                  <a-menu-item key="75">75%</a-menu-item>
                  <a-menu-item key="50">50%</a-menu-item>
                </a-menu>
              </template>
              <a-button>
                {{ Math.round(zoomLevel * 100) }}%
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-tooltip>
          
          <a-tooltip title="全屏">
            <a-button @click="toggleFullscreen">
              <FullscreenOutlined v-if="!isFullscreen" />
              <FullscreenExitOutlined v-else />
            </a-button>
          </a-tooltip>
          
          <a-tooltip title="设置">
            <a-button @click="showSettings = true">
              <SettingOutlined />
            </a-button>
          </a-tooltip>
        </a-space>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="designer-content" :class="{ 'fullscreen': isFullscreen }">
      <!-- 左侧组件面板 -->
      <div class="components-panel" v-show="!isFullscreen">
        <div class="panel-header">
          <h4>组件库</h4>
          <a-input-search
            v-model:value="componentSearchKeyword"
            placeholder="搜索组件..."
            size="small"
          />
        </div>
        
        <div class="panel-content">
          <a-collapse v-model:activeKey="activeComponentGroups" ghost>
            <a-collapse-panel
              v-for="group in filteredComponentGroups"
              :key="group.key"
              :header="group.name"
            >
              <div class="component-list">
                <div
                  v-for="component in group.components"
                  :key="component.type"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleComponentDragStart($event, component)"
                >
                  <div class="component-icon">
                    <component :is="component.icon" />
                  </div>
                  <div class="component-info">
                    <div class="component-name">{{ component.name }}</div>
                    <div class="component-desc">{{ component.description }}</div>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
      
      <!-- 中间画布区域 -->
      <div class="canvas-container">
        <div class="canvas-header">
          <a-breadcrumb>
            <a-breadcrumb-item>
              <HomeOutlined />
              工作流
            </a-breadcrumb-item>
            <a-breadcrumb-item>
              <DesktopOutlined />
              设计器
            </a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentWorkflow.name || '未命名流程' }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <div 
          class="canvas-area"
          :class="{ 'show-grid': showGrid }"
          :style="{ transform: `scale(${zoomLevel})` }"
          @drop="handleCanvasDrop"
          @dragover="handleCanvasDragOver"
          @click="handleCanvasClick"
        >
          <!-- 网格背景 -->
          <div class="grid-background" v-if="showGrid"></div>
          
          <!-- 流程节点 -->
          <div
            v-for="node in workflowNodes"
            :key="node.id"
            class="workflow-node"
            :class="{
              'selected': selectedNodeId === node.id,
              'connecting': connectingMode && connectingFromNode === node.id
            }"
            :style="{
              left: node.x + 'px',
              top: node.y + 'px'
            }"
            @click.stop="selectNode(node.id)"
            @mousedown="handleNodeMouseDown($event, node)"
          >
            <div class="node-header">
              <div class="node-icon">
                <component :is="getNodeIcon(node.type)" />
              </div>
              <div class="node-title">{{ node.name }}</div>
              <div class="node-actions">
                <a-dropdown trigger="click">
                  <template #overlay>
                    <a-menu @click="({ key }) => handleNodeAction(key, node)">
                      <a-menu-item key="edit">
                        <EditOutlined />
                        编辑
                      </a-menu-item>
                      <a-menu-item key="copy">
                        <CopyOutlined />
                        复制
                      </a-menu-item>
                      <a-menu-item key="connect">
                        <LinkOutlined />
                        连接
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="delete" danger>
                        <DeleteOutlined />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                </a-dropdown>
              </div>
            </div>
            
            <div class="node-content">
              <div class="node-description">{{ node.description }}</div>
              <div class="node-config" v-if="node.config">
                <a-tag v-for="(value, key) in node.config" :key="key" size="small">
                  {{ key }}: {{ value }}
                </a-tag>
              </div>
            </div>
            
            <!-- 连接点 -->
            <div class="connection-points">
              <div 
                class="connection-point input"
                v-if="node.type !== 'start'"
                @click.stop="handleConnectionClick(node.id, 'input')"
              ></div>
              <div 
                class="connection-point output"
                v-if="node.type !== 'end'"
                @click.stop="handleConnectionClick(node.id, 'output')"
              ></div>
            </div>
          </div>
          
          <!-- 连接线 -->
          <svg class="connections-svg">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#1890ff" />
              </marker>
            </defs>
            
            <path
              v-for="connection in workflowConnections"
              :key="connection.id"
              :d="getConnectionPath(connection)"
              class="connection-line"
              :class="{ 'selected': selectedConnectionId === connection.id }"
              marker-end="url(#arrowhead)"
              @click="selectConnection(connection.id)"
            />
            
            <!-- 临时连接线 -->
            <path
              v-if="tempConnection"
              :d="tempConnection.path"
              class="temp-connection-line"
              marker-end="url(#arrowhead)"
            />
          </svg>
          
          <!-- 选择框 -->
          <div
            v-if="selectionBox"
            class="selection-box"
            :style="{
              left: selectionBox.x + 'px',
              top: selectionBox.y + 'px',
              width: selectionBox.width + 'px',
              height: selectionBox.height + 'px'
            }"
          ></div>
        </div>
        
        <!-- 画布底部状态栏 -->
        <div class="canvas-footer">
          <div class="status-info">
            <span>节点: {{ workflowNodes.length }}</span>
            <span>连接: {{ workflowConnections.length }}</span>
            <span v-if="selectedNodeId">已选择: {{ getSelectedNodeName() }}</span>
          </div>
          
          <div class="canvas-controls">
            <a-button-group size="small">
              <a-button @click="zoomOut">
                <MinusOutlined />
              </a-button>
              <a-button @click="resetZoom">
                {{ Math.round(zoomLevel * 100) }}%
              </a-button>
              <a-button @click="zoomIn">
                <PlusOutlined />
              </a-button>
            </a-button-group>
          </div>
        </div>
      </div>
      
      <!-- 右侧属性面板 -->
      <div class="properties-panel" v-show="!isFullscreen">
        <div class="panel-header">
          <h4>属性配置</h4>
        </div>
        
        <div class="panel-content">
          <!-- 流程属性 -->
          <div v-if="!selectedNodeId && !selectedConnectionId" class="workflow-properties">
            <a-form layout="vertical">
              <a-form-item label="流程名称">
                <a-input v-model:value="currentWorkflow.name" placeholder="请输入流程名称" />
              </a-form-item>
              
              <a-form-item label="流程描述">
                <a-textarea 
                  v-model:value="currentWorkflow.description" 
                  placeholder="请输入流程描述"
                  :rows="3"
                />
              </a-form-item>
              
              <a-form-item label="流程版本">
                <a-input v-model:value="currentWorkflow.version" placeholder="1.0.0" />
              </a-form-item>
              
              <a-form-item label="流程分类">
                <a-select v-model:value="currentWorkflow.category" placeholder="选择分类">
                  <a-select-option value="approval">审批流程</a-select-option>
                  <a-select-option value="business">业务流程</a-select-option>
                  <a-select-option value="system">系统流程</a-select-option>
                  <a-select-option value="custom">自定义流程</a-select-option>
                </a-select>
              </a-form-item>
              
              <a-form-item label="流程标签">
                <a-select
                  v-model:value="currentWorkflow.tags"
                  mode="tags"
                  placeholder="添加标签"
                  :options="tagOptions"
                />
              </a-form-item>
            </a-form>
          </div>
          
          <!-- 节点属性 -->
          <div v-if="selectedNodeId" class="node-properties">
            <div class="property-section">
              <h5>基本信息</h5>
              <a-form layout="vertical">
                <a-form-item label="节点名称">
                  <a-input 
                    v-model:value="selectedNode.name" 
                    placeholder="请输入节点名称"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="节点描述">
                  <a-textarea 
                    v-model:value="selectedNode.description" 
                    placeholder="请输入节点描述"
                    :rows="2"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="节点类型">
                  <a-select v-model:value="selectedNode.type" disabled>
                    <a-select-option value="start">开始节点</a-select-option>
                    <a-select-option value="end">结束节点</a-select-option>
                    <a-select-option value="user_task">用户任务</a-select-option>
                    <a-select-option value="service_task">服务任务</a-select-option>
                    <a-select-option value="gateway">网关</a-select-option>
                    <a-select-option value="subprocess">子流程</a-select-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </div>
            
            <!-- 用户任务配置 -->
            <div v-if="selectedNode.type === 'user_task'" class="property-section">
              <h5>任务配置</h5>
              <a-form layout="vertical">
                <a-form-item label="执行人">
                  <a-select
                    v-model:value="selectedNode.config.assignee"
                    mode="multiple"
                    placeholder="选择执行人"
                    @change="markAsChanged"
                  >
                    <a-select-option value="user1">张三</a-select-option>
                    <a-select-option value="user2">李四</a-select-option>
                    <a-select-option value="user3">王五</a-select-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="执行方式">
                  <a-radio-group v-model:value="selectedNode.config.assignType" @change="markAsChanged">
                    <a-radio value="single">单人执行</a-radio>
                    <a-radio value="multiple">多人执行</a-radio>
                    <a-radio value="sequential">顺序执行</a-radio>
                  </a-radio-group>
                </a-form-item>
                
                <a-form-item label="超时时间(小时)">
                  <a-input-number 
                    v-model:value="selectedNode.config.timeout" 
                    :min="1"
                    placeholder="24"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="表单配置">
                  <a-select v-model:value="selectedNode.config.formKey" placeholder="选择表单" @change="markAsChanged">
                    <a-select-option value="leave_form">请假申请表</a-select-option>
                    <a-select-option value="purchase_form">采购申请表</a-select-option>
                    <a-select-option value="approval_form">审批表</a-select-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </div>
            
            <!-- 服务任务配置 -->
            <div v-if="selectedNode.type === 'service_task'" class="property-section">
              <h5>服务配置</h5>
              <a-form layout="vertical">
                <a-form-item label="服务类型">
                  <a-select v-model:value="selectedNode.config.serviceType" @change="markAsChanged">
                    <a-select-option value="http">HTTP请求</a-select-option>
                    <a-select-option value="email">邮件发送</a-select-option>
                    <a-select-option value="sms">短信发送</a-select-option>
                    <a-select-option value="script">脚本执行</a-select-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="服务地址" v-if="selectedNode.config.serviceType === 'http'">
                  <a-input 
                    v-model:value="selectedNode.config.serviceUrl" 
                    placeholder="https://api.example.com/service"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="请求方法" v-if="selectedNode.config.serviceType === 'http'">
                  <a-select v-model:value="selectedNode.config.httpMethod" @change="markAsChanged">
                    <a-select-option value="GET">GET</a-select-option>
                    <a-select-option value="POST">POST</a-select-option>
                    <a-select-option value="PUT">PUT</a-select-option>
                    <a-select-option value="DELETE">DELETE</a-select-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="重试次数">
                  <a-input-number 
                    v-model:value="selectedNode.config.retryCount" 
                    :min="0"
                    :max="5"
                    @change="markAsChanged"
                  />
                </a-form-item>
              </a-form>
            </div>
            
            <!-- 网关配置 -->
            <div v-if="selectedNode.type === 'gateway'" class="property-section">
              <h5>网关配置</h5>
              <a-form layout="vertical">
                <a-form-item label="网关类型">
                  <a-select v-model:value="selectedNode.config.gatewayType" @change="markAsChanged">
                    <a-select-option value="exclusive">排他网关</a-select-option>
                    <a-select-option value="parallel">并行网关</a-select-option>
                    <a-select-option value="inclusive">包容网关</a-select-option>
                  </a-select>
                </a-form-item>
                
                <a-form-item label="默认分支" v-if="selectedNode.config.gatewayType === 'exclusive'">
                  <a-input 
                    v-model:value="selectedNode.config.defaultFlow" 
                    placeholder="默认分支条件"
                    @change="markAsChanged"
                  />
                </a-form-item>
              </a-form>
            </div>
          </div>
          
          <!-- 连接属性 -->
          <div v-if="selectedConnectionId" class="connection-properties">
            <div class="property-section">
              <h5>连接配置</h5>
              <a-form layout="vertical">
                <a-form-item label="连接名称">
                  <a-input 
                    v-model:value="selectedConnection.name" 
                    placeholder="请输入连接名称"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="条件表达式">
                  <a-textarea 
                    v-model:value="selectedConnection.condition" 
                    placeholder="${amount > 1000}"
                    :rows="2"
                    @change="markAsChanged"
                  />
                </a-form-item>
                
                <a-form-item label="执行顺序">
                  <a-input-number 
                    v-model:value="selectedConnection.order" 
                    :min="1"
                    @change="markAsChanged"
                  />
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 设置模态框 -->
    <a-modal
      v-model:open="showSettings"
      title="设计器设置"
      width="600px"
      @ok="saveSettings"
    >
      <a-form layout="vertical">
        <a-form-item label="自动保存">
          <a-switch v-model:checked="settings.autoSave" />
          <span class="setting-desc">每5分钟自动保存一次</span>
        </a-form-item>
        
        <a-form-item label="显示网格">
          <a-switch v-model:checked="settings.showGrid" />
          <span class="setting-desc">在画布上显示网格线</span>
        </a-form-item>
        
        <a-form-item label="吸附网格">
          <a-switch v-model:checked="settings.snapToGrid" />
          <span class="setting-desc">节点移动时自动吸附到网格</span>
        </a-form-item>
        
        <a-form-item label="网格大小">
          <a-slider 
            v-model:value="settings.gridSize" 
            :min="10" 
            :max="50" 
            :marks="{ 10: '10px', 20: '20px', 30: '30px', 40: '40px', 50: '50px' }"
          />
        </a-form-item>
        
        <a-form-item label="主题">
          <a-radio-group v-model:value="settings.theme">
            <a-radio value="light">浅色</a-radio>
            <a-radio value="dark">深色</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 节点编辑模态框 -->
    <a-modal
      v-model:open="showNodeEditor"
      title="编辑节点"
      width="800px"
      @ok="saveNodeChanges"
    >
      <div v-if="editingNode">
        <!-- 节点编辑表单 -->
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="节点名称">
                <a-input v-model:value="editingNode.name" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="节点类型">
                <a-select v-model:value="editingNode.type" disabled>
                  <a-select-option value="start">开始节点</a-select-option>
                  <a-select-option value="end">结束节点</a-select-option>
                  <a-select-option value="user_task">用户任务</a-select-option>
                  <a-select-option value="service_task">服务任务</a-select-option>
                  <a-select-option value="gateway">网关</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-form-item label="节点描述">
            <a-textarea v-model:value="editingNode.description" :rows="3" />
          </a-form-item>
          
          <!-- 根据节点类型显示不同的配置项 -->
          <div v-if="editingNode.type === 'user_task'">
            <h4>用户任务配置</h4>
            <!-- 用户任务特定配置 -->
          </div>
          
          <div v-if="editingNode.type === 'service_task'">
            <h4>服务任务配置</h4>
            <!-- 服务任务特定配置 -->
          </div>
          
          <div v-if="editingNode.type === 'gateway'">
            <h4>网关配置</h4>
            <!-- 网关特定配置 -->
          </div>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 预览模态框 -->
    <a-modal
      v-model:open="showPreview"
      title="流程预览"
      width="1000px"
      :footer="null"
    >
      <div class="workflow-preview">
        <div class="preview-toolbar">
          <a-space>
            <a-button @click="exportImage">
              <PictureOutlined />
              导出图片
            </a-button>
            <a-button @click="exportXML">
              <FileTextOutlined />
              导出XML
            </a-button>
            <a-button @click="exportJSON">
              <CodeOutlined />
              导出JSON
            </a-button>
          </a-space>
        </div>
        
        <div class="preview-content">
          <!-- 这里显示只读的流程图 -->
          <div class="preview-placeholder">
            <DesktopOutlined style="font-size: 48px; color: #d9d9d9;" />
            <p>流程预览功能开发中...</p>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  FileAddOutlined,
  FolderOpenOutlined,
  SaveOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  BorderOutlined,
  DownOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  HomeOutlined,
  DesktopOutlined,
  EditOutlined,
  CopyOutlined,
  LinkOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  StopOutlined,
  UserOutlined,
  ApiOutlined,
  BranchesOutlined,
  ProcessOutlined,
  PictureOutlined,
  FileTextOutlined,
  CodeOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const hasChanges = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const showGrid = ref(true)
const zoomLevel = ref(1)
const isFullscreen = ref(false)
const showSettings = ref(false)
const showNodeEditor = ref(false)
const showPreview = ref(false)
const componentSearchKeyword = ref('')
const activeComponentGroups = ref(['basic', 'tasks', 'gateways'])
const selectedNodeId = ref('')
const selectedConnectionId = ref('')
const connectingMode = ref(false)
const connectingFromNode = ref('')
const tempConnection = ref(null)
const selectionBox = ref(null)
const editingNode = ref(null)

// 当前工作流数据
const currentWorkflow = reactive({
  id: '',
  name: '新建流程',
  description: '',
  version: '1.0.0',
  category: '',
  tags: []
})

// 设置数据
const settings = reactive({
  autoSave: true,
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  theme: 'light'
})

// 标签选项
const tagOptions = [
  { label: '审批', value: 'approval' },
  { label: '业务', value: 'business' },
  { label: '系统', value: 'system' },
  { label: '自动化', value: 'automation' }
]

// 组件库数据
const componentGroups = [
  {
    key: 'basic',
    name: '基础组件',
    components: [
      {
        type: 'start',
        name: '开始节点',
        description: '流程开始',
        icon: PlayCircleOutlined
      },
      {
        type: 'end',
        name: '结束节点',
        description: '流程结束',
        icon: StopOutlined
      }
    ]
  },
  {
    key: 'tasks',
    name: '任务节点',
    components: [
      {
        type: 'user_task',
        name: '用户任务',
        description: '需要人工处理的任务',
        icon: UserOutlined
      },
      {
        type: 'service_task',
        name: '服务任务',
        description: '自动执行的服务',
        icon: ApiOutlined
      },
      {
        type: 'subprocess',
        name: '子流程',
        description: '嵌套的子流程',
        icon: ProcessOutlined
      }
    ]
  },
  {
    key: 'gateways',
    name: '网关节点',
    components: [
      {
        type: 'gateway',
        name: '排他网关',
        description: '条件分支',
        icon: BranchesOutlined
      }
    ]
  }
]

// 工作流节点数据
const workflowNodes = ref([
  {
    id: 'start_1',
    type: 'start',
    name: '开始',
    description: '流程开始',
    x: 100,
    y: 100,
    config: {}
  },
  {
    id: 'task_1',
    type: 'user_task',
    name: '提交申请',
    description: '用户提交申请表单',
    x: 300,
    y: 100,
    config: {
      assignee: ['user1'],
      assignType: 'single',
      timeout: 24,
      formKey: 'leave_form'
    }
  },
  {
    id: 'gateway_1',
    type: 'gateway',
    name: '审批判断',
    description: '根据金额判断审批流程',
    x: 500,
    y: 100,
    config: {
      gatewayType: 'exclusive',
      defaultFlow: 'approved'
    }
  },
  {
    id: 'end_1',
    type: 'end',
    name: '结束',
    description: '流程结束',
    x: 700,
    y: 100,
    config: {}
  }
])

// 工作流连接数据
const workflowConnections = ref([
  {
    id: 'conn_1',
    name: '提交',
    sourceNodeId: 'start_1',
    targetNodeId: 'task_1',
    condition: '',
    order: 1
  },
  {
    id: 'conn_2',
    name: '审批',
    sourceNodeId: 'task_1',
    targetNodeId: 'gateway_1',
    condition: '',
    order: 1
  },
  {
    id: 'conn_3',
    name: '通过',
    sourceNodeId: 'gateway_1',
    targetNodeId: 'end_1',
    condition: '${approved == true}',
    order: 1
  }
])

// 计算属性
/**
 * 过滤后的组件组
 */
const filteredComponentGroups = computed(() => {
  if (!componentSearchKeyword.value) {
    return componentGroups
  }
  
  const keyword = componentSearchKeyword.value.toLowerCase()
  return componentGroups.map(group => ({
    ...group,
    components: group.components.filter(component => 
      component.name.toLowerCase().includes(keyword) ||
      component.description.toLowerCase().includes(keyword)
    )
  })).filter(group => group.components.length > 0)
})

/**
 * 选中的节点
 */
const selectedNode = computed(() => {
  return workflowNodes.value.find(node => node.id === selectedNodeId.value)
})

/**
 * 选中的连接
 */
const selectedConnection = computed(() => {
  return workflowConnections.value.find(conn => conn.id === selectedConnectionId.value)
})

// 方法
/**
 * 获取节点图标
 */
const getNodeIcon = (type: string) => {
  const icons = {
    start: PlayCircleOutlined,
    end: StopOutlined,
    user_task: UserOutlined,
    service_task: ApiOutlined,
    gateway: BranchesOutlined,
    subprocess: ProcessOutlined
  }
  return icons[type] || UserOutlined
}

/**
 * 获取选中节点名称
 */
const getSelectedNodeName = () => {
  const node = selectedNode.value
  return node ? node.name : ''
}

/**
 * 获取连接路径
 */
const getConnectionPath = (connection: any) => {
  const sourceNode = workflowNodes.value.find(node => node.id === connection.sourceNodeId)
  const targetNode = workflowNodes.value.find(node => node.id === connection.targetNodeId)
  
  if (!sourceNode || !targetNode) return ''
  
  const startX = sourceNode.x + 120 // 节点宽度的一半
  const startY = sourceNode.y + 40  // 节点高度的一半
  const endX = targetNode.x
  const endY = targetNode.y + 40
  
  // 简单的直线连接，实际应该是贝塞尔曲线
  return `M ${startX} ${startY} L ${endX} ${endY}`
}

/**
 * 标记为已更改
 */
const markAsChanged = () => {
  hasChanges.value = true
}

/**
 * 切换网格显示
 */
const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

/**
 * 切换全屏
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

/**
 * 缩放处理
 */
const handleZoom = ({ key }: { key: string }) => {
  switch (key) {
    case 'fit':
      zoomLevel.value = 1
      break
    case 'actual':
      zoomLevel.value = 1
      break
    default:
      zoomLevel.value = parseInt(key) / 100
  }
}

/**
 * 放大
 */
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2)
}

/**
 * 缩小
 */
const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
}

/**
 * 重置缩放
 */
const resetZoom = () => {
  zoomLevel.value = 1
}

/**
 * 组件拖拽开始
 */
const handleComponentDragStart = (event: DragEvent, component: any) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(component))
}

/**
 * 画布拖拽悬停
 */
const handleCanvasDragOver = (event: DragEvent) => {
  event.preventDefault()
}

/**
 * 画布放置
 */
const handleCanvasDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const componentData = event.dataTransfer?.getData('application/json')
  if (!componentData) return
  
  const component = JSON.parse(componentData)
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoomLevel.value
  const y = (event.clientY - rect.top) / zoomLevel.value
  
  // 创建新节点
  const newNode = {
    id: `${component.type}_${Date.now()}`,
    type: component.type,
    name: component.name,
    description: component.description,
    x: x - 60, // 节点宽度的一半
    y: y - 40, // 节点高度的一半
    config: {}
  }
  
  workflowNodes.value.push(newNode)
  markAsChanged()
}

/**
 * 画布点击
 */
const handleCanvasClick = (event: MouseEvent) => {
  // 取消选择
  selectedNodeId.value = ''
  selectedConnectionId.value = ''
  connectingMode.value = false
  connectingFromNode.value = ''
}

/**
 * 选择节点
 */
const selectNode = (nodeId: string) => {
  selectedNodeId.value = nodeId
  selectedConnectionId.value = ''
}

/**
 * 选择连接
 */
const selectConnection = (connectionId: string) => {
  selectedConnectionId.value = connectionId
  selectedNodeId.value = ''
}

/**
 * 节点鼠标按下
 */
const handleNodeMouseDown = (event: MouseEvent, node: any) => {
  // 实现节点拖拽逻辑
  event.stopPropagation()
}

/**
 * 连接点击
 */
const handleConnectionClick = (nodeId: string, type: 'input' | 'output') => {
  if (connectingMode.value) {
    if (type === 'input' && connectingFromNode.value !== nodeId) {
      // 创建连接
      const newConnection = {
        id: `conn_${Date.now()}`,
        name: '连接',
        sourceNodeId: connectingFromNode.value,
        targetNodeId: nodeId,
        condition: '',
        order: 1
      }
      
      workflowConnections.value.push(newConnection)
      connectingMode.value = false
      connectingFromNode.value = ''
      tempConnection.value = null
      markAsChanged()
    }
  } else if (type === 'output') {
    // 开始连接模式
    connectingMode.value = true
    connectingFromNode.value = nodeId
  }
}

/**
 * 节点操作
 */
const handleNodeAction = (key: string, node: any) => {
  switch (key) {
    case 'edit':
      editingNode.value = { ...node }
      showNodeEditor.value = true
      break
    case 'copy':
      const copiedNode = {
        ...node,
        id: `${node.type}_${Date.now()}`,
        name: `${node.name}_副本`,
        x: node.x + 50,
        y: node.y + 50
      }
      workflowNodes.value.push(copiedNode)
      markAsChanged()
      break
    case 'connect':
      connectingMode.value = true
      connectingFromNode.value = node.id
      break
    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除节点 "${node.name}" 吗？`,
        onOk: () => {
          // 删除节点
          const nodeIndex = workflowNodes.value.findIndex(n => n.id === node.id)
          if (nodeIndex > -1) {
            workflowNodes.value.splice(nodeIndex, 1)
          }
          
          // 删除相关连接
          workflowConnections.value = workflowConnections.value.filter(
            conn => conn.sourceNodeId !== node.id && conn.targetNodeId !== node.id
          )
          
          selectedNodeId.value = ''
          markAsChanged()
        }
      })
      break
  }
}

/**
 * 保存节点更改
 */
const saveNodeChanges = () => {
  if (editingNode.value) {
    const nodeIndex = workflowNodes.value.findIndex(n => n.id === editingNode.value.id)
    if (nodeIndex > -1) {
      workflowNodes.value[nodeIndex] = { ...editingNode.value }
      markAsChanged()
    }
  }
  showNodeEditor.value = false
  editingNode.value = null
}

/**
 * 新建流程
 */
const handleNew = () => {
  if (hasChanges.value) {
    Modal.confirm({
      title: '确认新建',
      content: '当前流程有未保存的更改，确定要新建吗？',
      onOk: () => {
        resetWorkflow()
      }
    })
  } else {
    resetWorkflow()
  }
}

/**
 * 重置工作流
 */
const resetWorkflow = () => {
  currentWorkflow.id = ''
  currentWorkflow.name = '新建流程'
  currentWorkflow.description = ''
  currentWorkflow.version = '1.0.0'
  currentWorkflow.category = ''
  currentWorkflow.tags = []
  
  workflowNodes.value = []
  workflowConnections.value = []
  selectedNodeId.value = ''
  selectedConnectionId.value = ''
  hasChanges.value = false
}

/**
 * 打开流程
 */
const handleOpen = () => {
  message.info('打开流程功能开发中...')
}

/**
 * 保存流程
 */
const handleSave = () => {
  message.success('保存成功')
  hasChanges.value = false
}

/**
 * 另存为
 */
const handleSaveAs = () => {
  message.info('另存为功能开发中...')
}

/**
 * 撤销
 */
const handleUndo = () => {
  message.info('撤销功能开发中...')
}

/**
 * 重做
 */
const handleRedo = () => {
  message.info('重做功能开发中...')
}

/**
 * 验证流程
 */
const handleValidate = () => {
  const errors = []
  
  // 检查是否有开始节点
  const startNodes = workflowNodes.value.filter(node => node.type === 'start')
  if (startNodes.length === 0) {
    errors.push('缺少开始节点')
  } else if (startNodes.length > 1) {
    errors.push('只能有一个开始节点')
  }
  
  // 检查是否有结束节点
  const endNodes = workflowNodes.value.filter(node => node.type === 'end')
  if (endNodes.length === 0) {
    errors.push('缺少结束节点')
  }
  
  // 检查节点连接
  workflowNodes.value.forEach(node => {
    if (node.type !== 'end') {
      const outgoingConnections = workflowConnections.value.filter(conn => conn.sourceNodeId === node.id)
      if (outgoingConnections.length === 0) {
        errors.push(`节点 "${node.name}" 缺少输出连接`)
      }
    }
    
    if (node.type !== 'start') {
      const incomingConnections = workflowConnections.value.filter(conn => conn.targetNodeId === node.id)
      if (incomingConnections.length === 0) {
        errors.push(`节点 "${node.name}" 缺少输入连接`)
      }
    }
  })
  
  if (errors.length === 0) {
    message.success('流程验证通过')
  } else {
    Modal.error({
      title: '流程验证失败',
      content: errors.join('\n')
    })
  }
}

/**
 * 预览流程
 */
const handlePreview = () => {
  showPreview.value = true
}

/**
 * 部署流程
 */
const handleDeploy = () => {
  handleValidate()
  message.success('部署成功')
}

/**
 * 保存设置
 */
const saveSettings = () => {
  showGrid.value = settings.showGrid
  message.success('设置已保存')
}

/**
 * 导出图片
 */
const exportImage = () => {
  message.info('导出图片功能开发中...')
}

/**
 * 导出XML
 */
const exportXML = () => {
  message.info('导出XML功能开发中...')
}

/**
 * 导出JSON
 */
const exportJSON = () => {
  const workflowData = {
    workflow: currentWorkflow,
    nodes: workflowNodes.value,
    connections: workflowConnections.value
  }
  
  const dataStr = JSON.stringify(workflowData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${currentWorkflow.name || 'workflow'}.json`
  link.click()
  
  URL.revokeObjectURL(url)
  message.success('JSON文件已下载')
}

// 生命周期
onMounted(() => {
  // 初始化设计器
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style scoped>
.workflow-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.workflow-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workflow-name {
  font-weight: 500;
  font-size: 16px;
}

.workflow-version {
  color: #8c8c8c;
  font-size: 12px;
}

.designer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.designer-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: white;
}

.components-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #1890ff;
}

.component-info {
  flex: 1;
}

.component-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.component-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.canvas-header {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: white;
  transform-origin: 0 0;
}

.canvas-area.show-grid {
  background-image: 
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.workflow-node {
  position: absolute;
  width: 120px;
  min-height: 80px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.workflow-node:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.workflow-node.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.workflow-node.connecting {
  border-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.node-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1890ff;
  margin-right: 8px;
}

.node-title {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-node:hover .node-actions {
  opacity: 1;
}

.node-content {
  padding: 8px;
}

.node-description {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.node-config {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.connection-points {
  position: absolute;
}

.connection-point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  position: absolute;
  cursor: crosshair;
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-node:hover .connection-point {
  opacity: 1;
}

.connection-point.input {
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.connection-point.output {
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  fill: none;
  stroke: #1890ff;
  stroke-width: 2;
  pointer-events: stroke;
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.connection-line:hover {
  stroke-width: 3;
}

.connection-line.selected {
  stroke: #52c41a;
  stroke-width: 3;
}

.temp-connection-line {
  fill: none;
  stroke: #faad14;
  stroke-width: 2;
  stroke-dasharray: 5,5;
}

.selection-box {
  position: absolute;
  border: 1px dashed #1890ff;
  background: rgba(24, 144, 255, 0.1);
  pointer-events: none;
}

.canvas-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #e8e8e8;
  font-size: 12px;
}

.status-info {
  display: flex;
  gap: 16px;
  color: #8c8c8c;
}

.canvas-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.properties-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.workflow-properties,
.node-properties,
.connection-properties {
  padding: 16px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.setting-desc {
  margin-left: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.workflow-preview {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.preview-placeholder {
  text-align: center;
  color: #8c8c8c;
}

.preview-placeholder p {
  margin: 16px 0 0 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .components-panel {
    width: 240px;
  }
  
  .properties-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .designer-toolbar {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .components-panel,
  .properties-panel {
    display: none;
  }
  
  .canvas-container {
    width: 100%;
  }
}

/* 动画效果 */
@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.workflow-node {
  animation: nodeAppear 0.3s ease-out;
}

@keyframes connectionDraw {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}

.connection-line {
  animation: connectionDraw 0.5s ease-out;
}

/* 深色主题支持 */
.dark-theme .workflow-designer {
  background: #141414;
}

.dark-theme .designer-toolbar,
.dark-theme .components-panel,
.dark-theme .properties-panel,
.dark-theme .canvas-header,
.dark-theme .canvas-footer {
  background: #1f1f1f;
  border-color: #303030;
  color: #ffffff;
}

.dark-theme .workflow-node {
  background: #262626;
  border-color: #434343;
  color: #ffffff;
}

.dark-theme .canvas-area {
  background: #1f1f1f;
}

.dark-theme .canvas-area.show-grid {
  background-image: 
    linear-gradient(to right, #303030 1px, transparent 1px),
    linear-gradient(to bottom, #303030 1px, transparent 1px);
}

/* 打印样式 */
@media print {
  .designer-toolbar,
  .components-panel,
  .properties-panel,
  .canvas-footer {
    display: none;
  }
  
  .canvas-container {
    width: 100%;
    height: auto;
  }
  
  .workflow-node {
    break-inside: avoid;
  }
}
</style>