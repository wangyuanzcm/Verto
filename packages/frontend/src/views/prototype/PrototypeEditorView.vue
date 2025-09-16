<template>
  <div class="prototype-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <a-button type="text" @click="goBack" class="back-btn">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          返回
        </a-button>
        <a-divider type="vertical" />
        <span class="prototype-name">{{ prototype.name }}</span>
      </div>
      
      <div class="toolbar-center">
        <a-space>
          <a-button @click="handleUndo" :disabled="!canUndo">
            <template #icon>
              <UndoOutlined />
            </template>
          </a-button>
          <a-button @click="handleRedo" :disabled="!canRedo">
            <template #icon>
              <RedoOutlined />
            </template>
          </a-button>
          <a-divider type="vertical" />
          <a-select v-model:value="zoomLevel" style="width: 100px">
            <a-select-option value="0.5">50%</a-select-option>
            <a-select-option value="0.75">75%</a-select-option>
            <a-select-option value="1">100%</a-select-option>
            <a-select-option value="1.25">125%</a-select-option>
            <a-select-option value="1.5">150%</a-select-option>
          </a-select>
        </a-space>
      </div>
      
      <div class="toolbar-right">
        <a-space>
          <a-button @click="handlePreview">
            <template #icon>
              <EyeOutlined />
            </template>
            预览
          </a-button>
          <a-button @click="handleSave" :loading="saving">
            <template #icon>
              <SaveOutlined />
            </template>
            保存
          </a-button>
          <a-button type="primary" @click="handlePublish">
            <template #icon>
              <CloudUploadOutlined />
            </template>
            发布
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="editor-content">
      <!-- 左侧组件面板 -->
      <div class="component-panel" :class="{ collapsed: componentPanelCollapsed }">
        <div class="panel-header">
          <span>组件库</span>
          <a-button type="text" size="small" @click="toggleComponentPanel">
            <template #icon>
              <MenuFoldOutlined v-if="!componentPanelCollapsed" />
              <MenuUnfoldOutlined v-else />
            </template>
          </a-button>
        </div>
        
        <div class="panel-content" v-show="!componentPanelCollapsed">
          <a-collapse v-model:activeKey="activeComponentGroups" ghost>
            <a-collapse-panel key="basic" header="基础组件">
              <div class="component-grid">
                <div 
                  v-for="component in basicComponents" 
                  :key="component.type"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart(component)"
                >
                  <div class="component-icon">
                    <component :is="component.icon" />
                  </div>
                  <span class="component-name">{{ component.name }}</span>
                </div>
              </div>
            </a-collapse-panel>
            
            <a-collapse-panel key="form" header="表单组件">
              <div class="component-grid">
                <div 
                  v-for="component in formComponents" 
                  :key="component.type"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart(component)"
                >
                  <div class="component-icon">
                    <component :is="component.icon" />
                  </div>
                  <span class="component-name">{{ component.name }}</span>
                </div>
              </div>
            </a-collapse-panel>
            
            <a-collapse-panel key="layout" header="布局组件">
              <div class="component-grid">
                <div 
                  v-for="component in layoutComponents" 
                  :key="component.type"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart(component)"
                >
                  <div class="component-icon">
                    <component :is="component.icon" />
                  </div>
                  <span class="component-name">{{ component.name }}</span>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <div class="canvas-container">
          <div class="canvas-header">
            <a-space>
              <span>画布</span>
              <a-select v-model:value="canvasSize" style="width: 150px">
                <a-select-option value="1920x1080">桌面端 (1920x1080)</a-select-option>
                <a-select-option value="1366x768">桌面端 (1366x768)</a-select-option>
                <a-select-option value="375x667">iPhone SE</a-select-option>
                <a-select-option value="414x896">iPhone 11</a-select-option>
                <a-select-option value="360x640">Android</a-select-option>
              </a-select>
            </a-space>
          </div>
          
          <div class="canvas-wrapper" :style="canvasWrapperStyle">
            <div 
              class="canvas"
              :style="canvasStyle"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @click="handleCanvasClick"
            >
              <!-- 网格背景 -->
              <div class="canvas-grid" v-if="showGrid"></div>
              
              <!-- 渲染的组件 -->
              <div 
                v-for="element in canvasElements"
                :key="element.id"
                class="canvas-element"
                :class="{ selected: selectedElementId === element.id }"
                :style="getElementStyle(element)"
                @click.stop="selectElement(element.id)"
                @mousedown="startDrag(element.id, $event)"
              >
                <component 
                  :is="getComponentByType(element.type)"
                  v-bind="element.props"
                />
                
                <!-- 选中状态的控制点 -->
                <div v-if="selectedElementId === element.id" class="element-controls">
                  <div class="resize-handle resize-handle-nw"></div>
                  <div class="resize-handle resize-handle-ne"></div>
                  <div class="resize-handle resize-handle-sw"></div>
                  <div class="resize-handle resize-handle-se"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel" :class="{ collapsed: propertyPanelCollapsed }">
        <div class="panel-header">
          <span>属性面板</span>
          <a-button type="text" size="small" @click="togglePropertyPanel">
            <template #icon>
              <MenuFoldOutlined v-if="!propertyPanelCollapsed" />
              <MenuUnfoldOutlined v-else />
            </template>
          </a-button>
        </div>
        
        <div class="panel-content" v-show="!propertyPanelCollapsed">
          <div v-if="selectedElement">
            <a-form layout="vertical">
              <!-- 基础属性 -->
              <a-form-item label="组件ID">
                <a-input v-model:value="selectedElement.id" disabled />
              </a-form-item>
              
              <a-form-item label="组件类型">
                <a-input v-model:value="selectedElement.type" disabled />
              </a-form-item>
              
              <!-- 位置和尺寸 -->
              <a-divider>位置和尺寸</a-divider>
              
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-form-item label="X">
                    <a-input-number 
                      v-model:value="selectedElement.x" 
                      @change="updateElementPosition"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Y">
                    <a-input-number 
                      v-model:value="selectedElement.y" 
                      @change="updateElementPosition"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-form-item label="宽度">
                    <a-input-number 
                      v-model:value="selectedElement.width" 
                      @change="updateElementSize"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="高度">
                    <a-input-number 
                      v-model:value="selectedElement.height" 
                      @change="updateElementSize"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              
              <!-- 组件特定属性 -->
              <a-divider>组件属性</a-divider>
              
              <component 
                :is="getPropertyEditor(selectedElement.type)"
                v-model:props="selectedElement.props"
                @change="updateElementProps"
              />
            </a-form>
          </div>
          
          <div v-else class="no-selection">
            <FileImageOutlined />
            <p>请选择一个组件</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  FormOutlined,
  LayoutOutlined,
  FontSizeOutlined,
  PictureOutlined,
  BorderOutlined
} from '@ant-design/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const saving = ref(false)
const componentPanelCollapsed = ref(false)
const propertyPanelCollapsed = ref(false)
const activeComponentGroups = ref(['basic', 'form', 'layout'])
const zoomLevel = ref('1')
const canvasSize = ref('1920x1080')
const showGrid = ref(true)
const selectedElementId = ref<string | null>(null)
const canUndo = ref(false)
const canRedo = ref(false)
const draggedComponent = ref<any>(null)
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })

const prototype = ref({
  id: 'PROTO-001',
  name: '用户登录页面原型'
})

const canvasElements = ref([
  {
    id: 'element-1',
    type: 'button',
    x: 100,
    y: 100,
    width: 120,
    height: 40,
    props: {
      text: '登录按钮',
      type: 'primary'
    }
  },
  {
    id: 'element-2',
    type: 'input',
    x: 100,
    y: 50,
    width: 200,
    height: 32,
    props: {
      placeholder: '请输入用户名'
    }
  }
])

// 组件库定义
const basicComponents = ref([
  { type: 'button', name: '按钮', icon: AppstoreOutlined },
  { type: 'text', name: '文本', icon: FontSizeOutlined },
  { type: 'image', name: '图片', icon: PictureOutlined },
  { type: 'divider', name: '分割线', icon: BorderOutlined }
])

const formComponents = ref([
  { type: 'input', name: '输入框', icon: FormOutlined },
  { type: 'textarea', name: '文本域', icon: FormOutlined },
  { type: 'select', name: '选择器', icon: FormOutlined },
  { type: 'checkbox', name: '复选框', icon: FormOutlined }
])

const layoutComponents = ref([
  { type: 'container', name: '容器', icon: LayoutOutlined },
  { type: 'row', name: '行', icon: LayoutOutlined },
  { type: 'col', name: '列', icon: LayoutOutlined }
])

// 计算属性
const selectedElement = computed(() => {
  return canvasElements.value.find(el => el.id === selectedElementId.value)
})

const canvasStyle = computed(() => {
  const [width, height] = canvasSize.value.split('x').map(Number)
  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: `scale(${zoomLevel.value})`,
    transformOrigin: 'top left'
  }
})

const canvasWrapperStyle = computed(() => {
  const [width, height] = canvasSize.value.split('x').map(Number)
  const scale = parseFloat(zoomLevel.value)
  return {
    width: `${width * scale}px`,
    height: `${height * scale}px`
  }
})

// 方法
/**
 * 返回上一页
 */
const goBack = () => {
  router.go(-1)
}

/**
 * 切换组件面板
 */
const toggleComponentPanel = () => {
  componentPanelCollapsed.value = !componentPanelCollapsed.value
}

/**
 * 切换属性面板
 */
const togglePropertyPanel = () => {
  propertyPanelCollapsed.value = !propertyPanelCollapsed.value
}

/**
 * 处理撤销
 */
const handleUndo = () => {
  message.info('撤销功能开发中...')
}

/**
 * 处理重做
 */
const handleRedo = () => {
  message.info('重做功能开发中...')
}

/**
 * 处理预览
 */
const handlePreview = () => {
  message.info('预览功能开发中...')
}

/**
 * 处理保存
 */
const handleSave = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('保存成功')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 处理发布
 */
const handlePublish = () => {
  message.info('发布功能开发中...')
}

/**
 * 处理拖拽开始
 */
const handleDragStart = (component: any) => {
  draggedComponent.value = component
}

/**
 * 处理拖拽悬停
 */
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

/**
 * 处理放置
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!draggedComponent.value) return
  
  const canvas = event.currentTarget as HTMLElement
  const rect = canvas.getBoundingClientRect()
  const scale = parseFloat(zoomLevel.value)
  
  const x = (event.clientX - rect.left) / scale
  const y = (event.clientY - rect.top) / scale
  
  const newElement = {
    id: `element-${Date.now()}`,
    type: draggedComponent.value.type,
    x: Math.max(0, x - 50),
    y: Math.max(0, y - 20),
    width: 100,
    height: 40,
    props: getDefaultProps(draggedComponent.value.type)
  }
  
  canvasElements.value.push(newElement)
  selectedElementId.value = newElement.id
  
  draggedComponent.value = null
}

/**
 * 处理画布点击
 */
const handleCanvasClick = () => {
  selectedElementId.value = null
}

/**
 * 选择元素
 */
const selectElement = (elementId: string) => {
  selectedElementId.value = elementId
}

/**
 * 开始拖拽元素
 */
const startDrag = (elementId: string, event: MouseEvent) => {
  if (event.button !== 0) return // 只处理左键
  
  selectedElementId.value = elementId
  isDragging.value = true
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  
  document.addEventListener('mousemove', handleElementDrag)
  document.addEventListener('mouseup', stopDrag)
}

/**
 * 处理元素拖拽
 */
const handleElementDrag = (event: MouseEvent) => {
  if (!isDragging.value || !selectedElement.value) return
  
  const deltaX = event.clientX - dragStartPos.value.x
  const deltaY = event.clientY - dragStartPos.value.y
  const scale = parseFloat(zoomLevel.value)
  
  selectedElement.value.x += deltaX / scale
  selectedElement.value.y += deltaY / scale
  
  dragStartPos.value = { x: event.clientX, y: event.clientY }
}

/**
 * 停止拖拽
 */
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleElementDrag)
  document.removeEventListener('mouseup', stopDrag)
}

/**
 * 获取元素样式
 */
const getElementStyle = (element: any) => {
  return {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    cursor: 'move'
  }
}

/**
 * 根据类型获取组件
 */
const getComponentByType = (type: string) => {
  // 这里应该返回对应的Vue组件
  return 'div'
}

/**
 * 获取属性编辑器
 */
const getPropertyEditor = (type: string) => {
  // 这里应该返回对应的属性编辑器组件
  return 'div'
}

/**
 * 获取默认属性
 */
const getDefaultProps = (type: string) => {
  const defaultProps = {
    button: { text: '按钮', type: 'default' },
    input: { placeholder: '请输入' },
    text: { content: '文本内容' },
    image: { src: '', alt: '图片' }
  }
  return defaultProps[type as keyof typeof defaultProps] || {}
}

/**
 * 更新元素位置
 */
const updateElementPosition = () => {
  // 位置更新逻辑
}

/**
 * 更新元素尺寸
 */
const updateElementSize = () => {
  // 尺寸更新逻辑
}

/**
 * 更新元素属性
 */
const updateElementProps = () => {
  // 属性更新逻辑
}

// 生命周期
onMounted(() => {
  // 初始化编辑器
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', handleElementDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.prototype-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.editor-toolbar {
  height: 56px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prototype-name {
  font-size: 16px;
  font-weight: 500;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-panel,
.property-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.property-panel {
  border-right: none;
  border-left: 1px solid #f0f0f0;
}

.component-panel.collapsed,
.property-panel.collapsed {
  width: 48px;
}

.panel-header {
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  padding: 12px 8px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  text-align: center;
  cursor: grab;
  transition: all 0.2s;
  background: white;
}

.component-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: 20px;
  color: #666;
  margin-bottom: 4px;
}

.component-name {
  font-size: 12px;
  color: #666;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canvas-header {
  height: 48px;
  padding: 0 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.canvas-wrapper {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #fafafa;
}

.canvas {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.canvas-element {
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.canvas-element:hover {
  border-color: #1890ff;
}

.canvas-element.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.element-controls {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #1890ff;
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
}

.resize-handle-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-handle-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-handle-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.no-selection {
  text-align: center;
  color: #bfbfbf;
  padding: 48px 16px;
}

.no-selection .anticon {
  font-size: 48px;
  margin-bottom: 16px;
}

@media (max-width: 1200px) {
  .component-panel,
  .property-panel {
    width: 240px;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    height: auto;
    padding: 12px;
    gap: 12px;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .component-panel,
  .property-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .component-panel.collapsed,
  .property-panel.collapsed {
    transform: translateX(-100%);
  }
}
</style>