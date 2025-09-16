# Pencil集成方案设计

## 1. 方案概述

### 1.1 集成目标
- 将 Evolus Pencil 原型工具集成到 Verto 平台中
- 实现原型设计与需求管理的无缝对接
- 支持原型版本管理和协作编辑
- 建立原型到代码的转换机制
- 提供统一的设计资产管理

### 1.2 技术挑战
- Pencil 基于 Electron + XUL 技术栈，需要适配到 Vue3 环境
- 原型数据格式转换和存储
- 实时协作和版本控制
- 与现有需求管理系统的集成
- 性能优化和用户体验

### 1.3 集成架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Verto 平台                               │
├─────────────────────────────────────────────────────────────────┤
│  需求管理  │  项目管理  │  原型设计  │  物料管理  │  人员管理    │
├─────────────────────────────────────────────────────────────────┤
│                    Pencil 集成层                                │
├─────────────────────────────────────────────────────────────────┤
│  原型编辑器  │  模板库  │  组件库  │  版本控制  │  协作引擎     │
├─────────────────────────────────────────────────────────────────┤
│                    数据存储层                                   │
├─────────────────────────────────────────────────────────────────┤
│  原型数据  │  版本历史  │  协作状态  │  模板资源  │  用户权限    │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Pencil 技术分析

### 2.1 Pencil 架构分析

#### 2.1.1 核心技术栈
```javascript
// Pencil 核心技术组成
{
  "platform": "Electron",
  "ui_framework": "XUL (XML User Interface Language)",
  "rendering": "Mozilla Gecko Engine",
  "scripting": "JavaScript",
  "data_format": "XML + SVG",
  "export_formats": ["PNG", "PDF", "SVG", "HTML", "ODT"]
}
```

#### 2.1.2 文件结构分析
```
Pencil Project Structure:
├── app/                     # 应用主目录
│   ├── content/            # XUL 界面文件
│   ├── skin/               # 样式和主题
│   ├── locale/             # 国际化文件
│   └── modules/            # JavaScript 模块
├── stencils/               # 模板和组件库
│   ├── CommonShapes/       # 通用形状
│   ├── AndroidGUI/         # Android 组件
│   ├── iOSGUI/            # iOS 组件
│   └── WebElements/        # Web 组件
└── export/                 # 导出功能模块
```

#### 2.1.3 数据格式分析
```xml
<!-- Pencil 文档格式示例 -->
<Document xmlns="http://www.evolus.vn/Namespace/Pencil">
  <Properties>
    <Property name="documentTitle">原型设计</Property>
    <Property name="author">设计师</Property>
    <Property name="createdOn">2024-01-15</Property>
  </Properties>
  <Pages>
    <Page>
      <Properties>
        <Property name="name">首页</Property>
        <Property name="width">1200</Property>
        <Property name="height">800</Property>
      </Properties>
      <Content>
        <g xmlns="http://www.w3.org/2000/svg">
          <!-- SVG 内容 -->
        </g>
      </Content>
    </Page>
  </Pages>
</Document>
```

### 2.2 集成策略选择

#### 2.2.1 方案对比

| 集成方案 | 优点 | 缺点 | 复杂度 | 推荐度 |
|---------|------|------|--------|--------|
| **完全重写** | 完全控制、技术栈统一 | 开发量大、功能缺失风险 | 极高 | ⭐⭐ |
| **Iframe 嵌入** | 快速集成、功能完整 | 样式冲突、通信复杂 | 低 | ⭐⭐⭐ |
| **核心移植** | 功能可控、性能优化 | 开发量中等、兼容性 | 高 | ⭐⭐⭐⭐ |
| **混合集成** | 平衡各方面需求 | 架构复杂、维护成本 | 中高 | ⭐⭐⭐⭐⭐ |

#### 2.2.2 推荐方案：混合集成

**核心思路**：
1. 保留 Pencil 的绘图引擎和组件库
2. 重写用户界面层，使用 Vue3 组件
3. 重新设计数据存储和协作机制
4. 建立统一的 API 接口层

## 3. 技术实现方案

### 3.1 架构设计

#### 3.1.1 分层架构

```typescript
// 架构分层定义
interface PencilIntegrationArchitecture {
  // 表现层 - Vue3 组件
  presentation: {
    components: {
      PrototypeEditor: 'Vue3 原型编辑器组件'
      ToolPanel: 'Vue3 工具面板组件'
      PropertyPanel: 'Vue3 属性面板组件'
      LayerPanel: 'Vue3 图层面板组件'
    }
    views: {
      PrototypeDesign: '原型设计页面'
      TemplateLibrary: '模板库页面'
      VersionHistory: '版本历史页面'
    }
  }
  
  // 业务逻辑层
  business: {
    services: {
      PrototypeService: '原型业务逻辑'
      CollaborationService: '协作服务'
      VersionService: '版本控制服务'
      ExportService: '导出服务'
    }
    adapters: {
      PencilAdapter: 'Pencil 引擎适配器'
      DataAdapter: '数据格式适配器'
      EventAdapter: '事件适配器'
    }
  }
  
  // 核心引擎层
  core: {
    engine: {
      DrawingEngine: 'Pencil 绘图引擎'
      ShapeEngine: '形状处理引擎'
      InteractionEngine: '交互处理引擎'
    }
    libraries: {
      StencilLibrary: '模板库'
      ComponentLibrary: '组件库'
      ThemeLibrary: '主题库'
    }
  }
  
  // 数据访问层
  data: {
    repositories: {
      PrototypeRepository: '原型数据仓库'
      TemplateRepository: '模板数据仓库'
      VersionRepository: '版本数据仓库'
    }
    storage: {
      FileStorage: '文件存储'
      DatabaseStorage: '数据库存储'
      CacheStorage: '缓存存储'
    }
  }
}
```

#### 3.1.2 核心模块设计

```typescript
// 原型编辑器核心模块
export class PrototypeEditor {
  private canvas: HTMLCanvasElement
  private pencilEngine: PencilEngine
  private eventManager: EventManager
  private stateManager: StateManager
  
  constructor(container: HTMLElement, options: EditorOptions) {
    this.initializeCanvas(container)
    this.initializePencilEngine()
    this.setupEventHandlers()
    this.loadStencils()
  }
  
  /**
   * 初始化画布
   */
  private initializeCanvas(container: HTMLElement): void {
    this.canvas = document.createElement('canvas')
    this.canvas.width = container.clientWidth
    this.canvas.height = container.clientHeight
    container.appendChild(this.canvas)
  }
  
  /**
   * 初始化 Pencil 引擎
   */
  private initializePencilEngine(): void {
    this.pencilEngine = new PencilEngine({
      canvas: this.canvas,
      mode: 'embedded',
      features: {
        collaboration: true,
        versionControl: true,
        export: true
      }
    })
  }
  
  /**
   * 加载原型数据
   */
  async loadPrototype(prototypeId: string): Promise<void> {
    try {
      const prototypeData = await this.prototypeService.getPrototype(prototypeId)
      const pencilDocument = this.dataAdapter.convertToPencilFormat(prototypeData)
      await this.pencilEngine.loadDocument(pencilDocument)
    } catch (error) {
      console.error('加载原型失败:', error)
      throw new Error('原型加载失败')
    }
  }
  
  /**
   * 保存原型数据
   */
  async savePrototype(): Promise<void> {
    try {
      const pencilDocument = await this.pencilEngine.exportDocument()
      const prototypeData = this.dataAdapter.convertFromPencilFormat(pencilDocument)
      await this.prototypeService.savePrototype(prototypeData)
    } catch (error) {
      console.error('保存原型失败:', error)
      throw new Error('原型保存失败')
    }
  }
  
  /**
   * 添加形状
   */
  addShape(shapeType: string, properties: ShapeProperties): void {
    const shape = this.pencilEngine.createShape(shapeType, properties)
    this.pencilEngine.addToCanvas(shape)
    this.stateManager.pushState()
  }
  
  /**
   * 删除选中元素
   */
  deleteSelected(): void {
    const selectedElements = this.pencilEngine.getSelectedElements()
    selectedElements.forEach(element => {
      this.pencilEngine.removeFromCanvas(element)
    })
    this.stateManager.pushState()
  }
  
  /**
   * 撤销操作
   */
  undo(): void {
    const previousState = this.stateManager.undo()
    if (previousState) {
      this.pencilEngine.restoreState(previousState)
    }
  }
  
  /**
   * 重做操作
   */
  redo(): void {
    const nextState = this.stateManager.redo()
    if (nextState) {
      this.pencilEngine.restoreState(nextState)
    }
  }
}
```

### 3.2 数据适配层

#### 3.2.1 数据格式转换

```typescript
// 数据适配器
export class PencilDataAdapter {
  /**
   * 将 Verto 原型数据转换为 Pencil 格式
   */
  convertToPencilFormat(vertoData: VertoPrototype): PencilDocument {
    const pencilDoc: PencilDocument = {
      xmlns: 'http://www.evolus.vn/Namespace/Pencil',
      properties: {
        documentTitle: vertoData.title,
        author: vertoData.author,
        createdOn: vertoData.createdAt,
        modifiedOn: vertoData.updatedAt
      },
      pages: vertoData.pages.map(page => this.convertPageToPencil(page))
    }
    
    return pencilDoc
  }
  
  /**
   * 将 Pencil 文档转换为 Verto 格式
   */
  convertFromPencilFormat(pencilDoc: PencilDocument): VertoPrototype {
    const vertoData: VertoPrototype = {
      id: '', // 由服务层生成
      title: pencilDoc.properties.documentTitle,
      description: '',
      author: pencilDoc.properties.author,
      projectId: '', // 由上下文提供
      requirementId: '', // 由上下文提供
      version: 1,
      status: 'draft',
      pages: pencilDoc.pages.map(page => this.convertPageFromPencil(page)),
      createdAt: pencilDoc.properties.createdOn,
      updatedAt: pencilDoc.properties.modifiedOn || new Date().toISOString()
    }
    
    return vertoData
  }
  
  /**
   * 转换页面数据到 Pencil 格式
   */
  private convertPageToPencil(page: VertoPage): PencilPage {
    return {
      properties: {
        name: page.name,
        width: page.width,
        height: page.height,
        backgroundColor: page.backgroundColor
      },
      content: {
        svg: page.elements.map(element => this.convertElementToPencil(element))
      }
    }
  }
  
  /**
   * 转换页面数据从 Pencil 格式
   */
  private convertPageFromPencil(page: PencilPage): VertoPage {
    return {
      id: generateId(),
      name: page.properties.name,
      width: page.properties.width,
      height: page.properties.height,
      backgroundColor: page.properties.backgroundColor,
      elements: page.content.svg.map(svg => this.convertElementFromPencil(svg))
    }
  }
  
  /**
   * 转换元素到 Pencil SVG 格式
   */
  private convertElementToPencil(element: VertoElement): SVGElement {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', element.type)
    
    // 设置基本属性
    svgElement.setAttribute('id', element.id)
    svgElement.setAttribute('x', element.x.toString())
    svgElement.setAttribute('y', element.y.toString())
    svgElement.setAttribute('width', element.width.toString())
    svgElement.setAttribute('height', element.height.toString())
    
    // 设置样式属性
    if (element.style) {
      Object.entries(element.style).forEach(([key, value]) => {
        svgElement.setAttribute(key, value)
      })
    }
    
    // 设置自定义属性
    if (element.properties) {
      Object.entries(element.properties).forEach(([key, value]) => {
        svgElement.setAttribute(`data-${key}`, value)
      })
    }
    
    return svgElement
  }
  
  /**
   * 转换元素从 Pencil SVG 格式
   */
  private convertElementFromPencil(svgElement: SVGElement): VertoElement {
    const element: VertoElement = {
      id: svgElement.getAttribute('id') || generateId(),
      type: svgElement.tagName,
      x: parseInt(svgElement.getAttribute('x') || '0'),
      y: parseInt(svgElement.getAttribute('y') || '0'),
      width: parseInt(svgElement.getAttribute('width') || '0'),
      height: parseInt(svgElement.getAttribute('height') || '0'),
      style: {},
      properties: {}
    }
    
    // 提取样式属性
    const styleAttributes = ['fill', 'stroke', 'stroke-width', 'opacity']
    styleAttributes.forEach(attr => {
      const value = svgElement.getAttribute(attr)
      if (value) {
        element.style[attr] = value
      }
    })
    
    // 提取自定义属性
    Array.from(svgElement.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        const propName = attr.name.substring(5)
        element.properties[propName] = attr.value
      }
    })
    
    return element
  }
}
```

#### 3.2.2 事件适配器

```typescript
// 事件适配器
export class PencilEventAdapter {
  private eventBus: EventBus
  private pencilEngine: PencilEngine
  
  constructor(eventBus: EventBus, pencilEngine: PencilEngine) {
    this.eventBus = eventBus
    this.pencilEngine = pencilEngine
    this.setupEventMapping()
  }
  
  /**
   * 设置事件映射
   */
  private setupEventMapping(): void {
    // Pencil 事件 -> Verto 事件
    this.pencilEngine.on('elementAdded', (element) => {
      this.eventBus.emit('prototype:element:added', {
        elementId: element.id,
        elementType: element.type,
        timestamp: Date.now()
      })
    })
    
    this.pencilEngine.on('elementRemoved', (element) => {
      this.eventBus.emit('prototype:element:removed', {
        elementId: element.id,
        timestamp: Date.now()
      })
    })
    
    this.pencilEngine.on('elementModified', (element, changes) => {
      this.eventBus.emit('prototype:element:modified', {
        elementId: element.id,
        changes: changes,
        timestamp: Date.now()
      })
    })
    
    this.pencilEngine.on('selectionChanged', (selectedElements) => {
      this.eventBus.emit('prototype:selection:changed', {
        selectedIds: selectedElements.map(el => el.id),
        timestamp: Date.now()
      })
    })
    
    // Verto 事件 -> Pencil 操作
    this.eventBus.on('prototype:tool:select', (toolName) => {
      this.pencilEngine.setActiveTool(toolName)
    })
    
    this.eventBus.on('prototype:zoom:change', (zoomLevel) => {
      this.pencilEngine.setZoom(zoomLevel)
    })
    
    this.eventBus.on('prototype:grid:toggle', (enabled) => {
      this.pencilEngine.setGridVisible(enabled)
    })
  }
}
```

### 3.3 协作功能实现

#### 3.3.1 实时协作架构

```typescript
// 协作服务
export class CollaborationService {
  private websocket: WebSocket
  private prototypeId: string
  private userId: string
  private operationQueue: Operation[]
  private conflictResolver: ConflictResolver
  
  constructor(prototypeId: string, userId: string) {
    this.prototypeId = prototypeId
    this.userId = userId
    this.operationQueue = []
    this.conflictResolver = new ConflictResolver()
    this.initializeWebSocket()
  }
  
  /**
   * 初始化 WebSocket 连接
   */
  private initializeWebSocket(): void {
    this.websocket = new WebSocket(`ws://localhost:3000/collaboration/${this.prototypeId}`)
    
    this.websocket.onopen = () => {
      console.log('协作连接已建立')
      this.sendJoinMessage()
    }
    
    this.websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleCollaborationMessage(message)
    }
    
    this.websocket.onclose = () => {
      console.log('协作连接已断开')
      this.attemptReconnect()
    }
  }
  
  /**
   * 发送操作到其他协作者
   */
  sendOperation(operation: Operation): void {
    const message: CollaborationMessage = {
      type: 'operation',
      prototypeId: this.prototypeId,
      userId: this.userId,
      operation: operation,
      timestamp: Date.now()
    }
    
    this.websocket.send(JSON.stringify(message))
    this.operationQueue.push(operation)
  }
  
  /**
   * 处理协作消息
   */
  private handleCollaborationMessage(message: CollaborationMessage): void {
    switch (message.type) {
      case 'operation':
        this.handleRemoteOperation(message.operation)
        break
      case 'cursor':
        this.handleRemoteCursor(message.cursor)
        break
      case 'user_joined':
        this.handleUserJoined(message.user)
        break
      case 'user_left':
        this.handleUserLeft(message.user)
        break
      case 'conflict':
        this.handleConflict(message.conflict)
        break
    }
  }
  
  /**
   * 处理远程操作
   */
  private handleRemoteOperation(operation: Operation): void {
    // 检查操作冲突
    const conflicts = this.conflictResolver.detectConflicts(operation, this.operationQueue)
    
    if (conflicts.length > 0) {
      // 解决冲突
      const resolvedOperation = this.conflictResolver.resolveConflicts(operation, conflicts)
      this.applyOperation(resolvedOperation)
    } else {
      // 直接应用操作
      this.applyOperation(operation)
    }
  }
  
  /**
   * 应用操作到本地
   */
  private applyOperation(operation: Operation): void {
    switch (operation.type) {
      case 'add_element':
        this.pencilEngine.addElement(operation.element)
        break
      case 'remove_element':
        this.pencilEngine.removeElement(operation.elementId)
        break
      case 'modify_element':
        this.pencilEngine.modifyElement(operation.elementId, operation.changes)
        break
      case 'move_element':
        this.pencilEngine.moveElement(operation.elementId, operation.position)
        break
    }
  }
  
  /**
   * 处理远程光标
   */
  private handleRemoteCursor(cursor: CursorInfo): void {
    const cursorElement = document.getElementById(`cursor-${cursor.userId}`)
    if (cursorElement) {
      cursorElement.style.left = `${cursor.x}px`
      cursorElement.style.top = `${cursor.y}px`
    } else {
      this.createRemoteCursor(cursor)
    }
  }
  
  /**
   * 创建远程光标
   */
  private createRemoteCursor(cursor: CursorInfo): void {
    const cursorElement = document.createElement('div')
    cursorElement.id = `cursor-${cursor.userId}`
    cursorElement.className = 'remote-cursor'
    cursorElement.style.cssText = `
      position: absolute;
      left: ${cursor.x}px;
      top: ${cursor.y}px;
      width: 20px;
      height: 20px;
      background: ${cursor.color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
    `
    
    const label = document.createElement('span')
    label.textContent = cursor.userName
    label.style.cssText = `
      position: absolute;
      top: 25px;
      left: 0;
      background: ${cursor.color};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      white-space: nowrap;
    `
    
    cursorElement.appendChild(label)
    document.body.appendChild(cursorElement)
  }
}
```

#### 3.3.2 冲突解决机制

```typescript
// 冲突解决器
export class ConflictResolver {
  /**
   * 检测操作冲突
   */
  detectConflicts(operation: Operation, localOperations: Operation[]): Conflict[] {
    const conflicts: Conflict[] = []
    
    localOperations.forEach(localOp => {
      if (this.isConflicting(operation, localOp)) {
        conflicts.push({
          remoteOperation: operation,
          localOperation: localOp,
          type: this.getConflictType(operation, localOp)
        })
      }
    })
    
    return conflicts
  }
  
  /**
   * 判断两个操作是否冲突
   */
  private isConflicting(op1: Operation, op2: Operation): boolean {
    // 同一元素的操作可能冲突
    if (op1.elementId === op2.elementId) {
      return true
    }
    
    // 位置重叠的操作可能冲突
    if (this.isPositionOverlapping(op1, op2)) {
      return true
    }
    
    return false
  }
  
  /**
   * 解决冲突
   */
  resolveConflicts(operation: Operation, conflicts: Conflict[]): Operation {
    let resolvedOperation = { ...operation }
    
    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'position_conflict':
          resolvedOperation = this.resolvePositionConflict(resolvedOperation, conflict)
          break
        case 'property_conflict':
          resolvedOperation = this.resolvePropertyConflict(resolvedOperation, conflict)
          break
        case 'deletion_conflict':
          resolvedOperation = this.resolveDeletionConflict(resolvedOperation, conflict)
          break
      }
    })
    
    return resolvedOperation
  }
  
  /**
   * 解决位置冲突
   */
  private resolvePositionConflict(operation: Operation, conflict: Conflict): Operation {
    // 策略：远程操作优先，本地操作偏移
    if (operation.type === 'move_element') {
      return {
        ...operation,
        position: {
          x: operation.position.x + 10, // 偏移避免重叠
          y: operation.position.y + 10
        }
      }
    }
    
    return operation
  }
  
  /**
   * 解决属性冲突
   */
  private resolvePropertyConflict(operation: Operation, conflict: Conflict): Operation {
    // 策略：合并属性，时间戳较新的优先
    if (operation.type === 'modify_element') {
      const mergedChanges = {
        ...conflict.localOperation.changes,
        ...operation.changes
      }
      
      return {
        ...operation,
        changes: mergedChanges
      }
    }
    
    return operation
  }
  
  /**
   * 解决删除冲突
   */
  private resolveDeletionConflict(operation: Operation, conflict: Conflict): Operation {
    // 策略：删除操作优先
    if (conflict.localOperation.type === 'remove_element') {
      return null // 取消远程操作
    }
    
    return operation
  }
}
```

### 3.4 版本控制系统

#### 3.4.1 版本管理

```typescript
// 版本控制服务
export class VersionControlService {
  private prototypeId: string
  private currentVersion: number
  private versionHistory: PrototypeVersion[]
  private changeTracker: ChangeTracker
  
  constructor(prototypeId: string) {
    this.prototypeId = prototypeId
    this.currentVersion = 1
    this.versionHistory = []
    this.changeTracker = new ChangeTracker()
  }
  
  /**
   * 创建新版本
   */
  async createVersion(message: string, changes: Change[]): Promise<PrototypeVersion> {
    const version: PrototypeVersion = {
      id: generateId(),
      prototypeId: this.prototypeId,
      version: this.currentVersion + 1,
      message: message,
      changes: changes,
      author: getCurrentUser().id,
      createdAt: new Date().toISOString(),
      parentVersion: this.currentVersion
    }
    
    // 保存版本到数据库
    await this.versionRepository.save(version)
    
    // 更新当前版本
    this.currentVersion = version.version
    this.versionHistory.push(version)
    
    return version
  }
  
  /**
   * 获取版本历史
   */
  async getVersionHistory(): Promise<PrototypeVersion[]> {
    if (this.versionHistory.length === 0) {
      this.versionHistory = await this.versionRepository.findByPrototypeId(this.prototypeId)
    }
    return this.versionHistory
  }
  
  /**
   * 切换到指定版本
   */
  async switchToVersion(version: number): Promise<VertoPrototype> {
    const targetVersion = this.versionHistory.find(v => v.version === version)
    if (!targetVersion) {
      throw new Error(`版本 ${version} 不存在`)
    }
    
    // 重建指定版本的原型数据
    const prototypeData = await this.reconstructVersion(targetVersion)
    
    return prototypeData
  }
  
  /**
   * 比较两个版本
   */
  async compareVersions(version1: number, version2: number): Promise<VersionDiff> {
    const v1Data = await this.switchToVersion(version1)
    const v2Data = await this.switchToVersion(version2)
    
    return this.calculateDiff(v1Data, v2Data)
  }
  
  /**
   * 重建指定版本
   */
  private async reconstructVersion(targetVersion: PrototypeVersion): Promise<VertoPrototype> {
    // 获取从初始版本到目标版本的所有变更
    const changes = await this.getChangesToVersion(targetVersion.version)
    
    // 从初始状态开始应用变更
    let prototypeData = await this.getInitialPrototype()
    
    changes.forEach(change => {
      prototypeData = this.applyChange(prototypeData, change)
    })
    
    return prototypeData
  }
  
  /**
   * 应用变更
   */
  private applyChange(prototype: VertoPrototype, change: Change): VertoPrototype {
    const newPrototype = { ...prototype }
    
    switch (change.type) {
      case 'add_page':
        newPrototype.pages.push(change.page)
        break
      case 'remove_page':
        newPrototype.pages = newPrototype.pages.filter(p => p.id !== change.pageId)
        break
      case 'modify_page':
        const pageIndex = newPrototype.pages.findIndex(p => p.id === change.pageId)
        if (pageIndex !== -1) {
          newPrototype.pages[pageIndex] = { ...newPrototype.pages[pageIndex], ...change.changes }
        }
        break
      case 'add_element':
        const page = newPrototype.pages.find(p => p.id === change.pageId)
        if (page) {
          page.elements.push(change.element)
        }
        break
      case 'remove_element':
        const targetPage = newPrototype.pages.find(p => p.id === change.pageId)
        if (targetPage) {
          targetPage.elements = targetPage.elements.filter(e => e.id !== change.elementId)
        }
        break
      case 'modify_element':
        const elementPage = newPrototype.pages.find(p => p.id === change.pageId)
        if (elementPage) {
          const elementIndex = elementPage.elements.findIndex(e => e.id === change.elementId)
          if (elementIndex !== -1) {
            elementPage.elements[elementIndex] = { ...elementPage.elements[elementIndex], ...change.changes }
          }
        }
        break
    }
    
    return newPrototype
  }
  
  /**
   * 计算版本差异
   */
  private calculateDiff(v1: VertoPrototype, v2: VertoPrototype): VersionDiff {
    const diff: VersionDiff = {
      pages: {
        added: [],
        removed: [],
        modified: []
      },
      elements: {
        added: [],
        removed: [],
        modified: []
      }
    }
    
    // 比较页面
    const v1PageIds = new Set(v1.pages.map(p => p.id))
    const v2PageIds = new Set(v2.pages.map(p => p.id))
    
    // 新增的页面
    v2.pages.forEach(page => {
      if (!v1PageIds.has(page.id)) {
        diff.pages.added.push(page)
      }
    })
    
    // 删除的页面
    v1.pages.forEach(page => {
      if (!v2PageIds.has(page.id)) {
        diff.pages.removed.push(page)
      }
    })
    
    // 修改的页面
    v1.pages.forEach(v1Page => {
      const v2Page = v2.pages.find(p => p.id === v1Page.id)
      if (v2Page && !this.isPagesEqual(v1Page, v2Page)) {
        diff.pages.modified.push({
          before: v1Page,
          after: v2Page
        })
      }
    })
    
    return diff
  }
}
```

### 3.5 导出功能

#### 3.5.1 多格式导出

```typescript
// 导出服务
export class ExportService {
  private pencilEngine: PencilEngine
  private dataAdapter: PencilDataAdapter
  
  constructor(pencilEngine: PencilEngine) {
    this.pencilEngine = pencilEngine
    this.dataAdapter = new PencilDataAdapter()
  }
  
  /**
   * 导出为 PNG 图片
   */
  async exportToPNG(options: PNGExportOptions): Promise<Blob> {
    const canvas = await this.pencilEngine.renderToCanvas({
      width: options.width || 1200,
      height: options.height || 800,
      scale: options.scale || 1,
      backgroundColor: options.backgroundColor || '#ffffff'
    })
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png', options.quality || 1)
    })
  }
  
  /**
   * 导出为 SVG 矢量图
   */
  async exportToSVG(options: SVGExportOptions): Promise<string> {
    const svgDocument = await this.pencilEngine.renderToSVG({
      width: options.width || 1200,
      height: options.height || 800,
      includeStyles: options.includeStyles !== false,
      optimized: options.optimized || false
    })
    
    return svgDocument
  }
  
  /**
   * 导出为 PDF 文档
   */
  async exportToPDF(options: PDFExportOptions): Promise<Blob> {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'px',
      format: [options.width || 1200, options.height || 800]
    })
    
    const pages = await this.pencilEngine.getAllPages()
    
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }
      
      const canvas = await this.pencilEngine.renderPageToCanvas(pages[i], {
        width: options.width || 1200,
        height: options.height || 800,
        scale: options.scale || 1
      })
      
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, options.width || 1200, options.height || 800)
    }
    
    return pdf.output('blob')
  }
  
  /**
   * 导出为 HTML 原型
   */
  async exportToHTML(options: HTMLExportOptions): Promise<string> {
    const pages = await this.pencilEngine.getAllPages()
    const htmlTemplate = await this.loadHTMLTemplate(options.template || 'default')
    
    const pageHTML = pages.map((page, index) => {
      const svgContent = this.pencilEngine.renderPageToSVG(page)
      return `
        <div class="prototype-page" id="page-${index}" ${index > 0 ? 'style="display: none;"' : ''}>
          <h2>${page.name}</h2>
          <div class="page-content">
            ${svgContent}
          </div>
        </div>
      `
    }).join('')
    
    const navigation = pages.map((page, index) => {
      return `<li><a href="#" onclick="showPage(${index})">${page.name}</a></li>`
    }).join('')
    
    return htmlTemplate
      .replace('{{PAGES}}', pageHTML)
      .replace('{{NAVIGATION}}', navigation)
      .replace('{{TITLE}}', options.title || '原型预览')
  }
  
  /**
   * 导出为 Ant Design Pro Schema
   */
  async exportToAntdSchema(options: SchemaExportOptions): Promise<AntdSchema> {
    const pages = await this.pencilEngine.getAllPages()
    const schema: AntdSchema = {
      version: '1.0.0',
      pages: [],
      components: [],
      routes: []
    }
    
    for (const page of pages) {
      const pageSchema = await this.convertPageToAntdSchema(page, options)
      schema.pages.push(pageSchema)
      
      // 生成路由配置
      schema.routes.push({
        path: `/${page.name.toLowerCase().replace(/\s+/g, '-')}`,
        component: `./pages/${pageSchema.name}`,
        name: page.name
      })
    }
    
    return schema
  }
  
  /**
   * 转换页面为 Ant Design Pro Schema
   */
  private async convertPageToAntdSchema(page: PencilPage, options: SchemaExportOptions): Promise<AntdPageSchema> {
    const pageSchema: AntdPageSchema = {
      name: page.name,
      title: page.name,
      layout: 'BasicLayout',
      components: []
    }
    
    for (const element of page.elements) {
      const component = await this.convertElementToAntdComponent(element, options)
      if (component) {
        pageSchema.components.push(component)
      }
    }
    
    return pageSchema
  }
  
  /**
   * 转换元素为 Ant Design 组件
   */
  private async convertElementToAntdComponent(element: VertoElement, options: SchemaExportOptions): Promise<AntdComponent | null> {
    const componentMap: Record<string, string> = {
      'button': 'Button',
      'input': 'Input',
      'select': 'Select',
      'table': 'Table',
      'form': 'Form',
      'card': 'Card',
      'list': 'List'
    }
    
    const antdType = componentMap[element.type.toLowerCase()]
    if (!antdType) {
      return null
    }
    
    const component: AntdComponent = {
      id: element.id,
      type: antdType,
      props: this.convertElementPropsToAntd(element),
      style: {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height
      },
      children: []
    }
    
    return component
  }
  
  /**
   * 转换元素属性为 Ant Design 属性
   */
  private convertElementPropsToAntd(element: VertoElement): Record<string, any> {
    const props: Record<string, any> = {}
    
    // 通用属性映射
    if (element.properties.text) {
      props.children = element.properties.text
    }
    
    if (element.properties.placeholder) {
      props.placeholder = element.properties.placeholder
    }
    
    if (element.properties.disabled) {
      props.disabled = element.properties.disabled === 'true'
    }
    
    // 特定组件属性映射
    switch (element.type.toLowerCase()) {
      case 'button':
        if (element.properties.type) {
          props.type = element.properties.type
        }
        if (element.style.backgroundColor) {
          props.type = 'primary'
        }
        break
        
      case 'input':
        if (element.properties.inputType) {
          props.type = element.properties.inputType
        }
        break
        
      case 'select':
        if (element.properties.options) {
          props.options = JSON.parse(element.properties.options)
        }
        break
    }
    
    return props
  }
}
```

## 4. 集成实施计划

### 4.1 开发阶段

#### 阶段一：基础架构搭建（2周）
- [ ] 搭建 Pencil 集成开发环境
- [ ] 实现数据适配层基础框架
- [ ] 创建 Vue3 原型编辑器组件骨架
- [ ] 建立事件总线和通信机制

#### 阶段二：核心功能实现（4周）
- [ ] 集成 Pencil 绘图引擎
- [ ] 实现基础绘图功能（添加、删除、修改元素）
- [ ] 开发工具面板和属性面板
- [ ] 实现数据格式转换

#### 阶段三：高级功能开发（3周）
- [ ] 实现实时协作功能
- [ ] 开发版本控制系统
- [ ] 集成模板库和组件库
- [ ] 实现导出功能

#### 阶段四：集成测试（2周）
- [ ] 单元测试和集成测试
- [ ] 性能优化和调试
- [ ] 用户体验优化
- [ ] 文档编写

### 4.2 技术风险评估

| 风险项 | 风险等级 | 影响 | 应对策略 |
|--------|----------|------|----------|
| Pencil 引擎兼容性 | 高 | 核心功能无法实现 | 提前进行技术验证，准备备选方案 |
| 性能问题 | 中 | 用户体验下降 | 分阶段优化，使用虚拟化技术 |
| 协作冲突处理 | 中 | 数据一致性问题 | 设计完善的冲突解决机制 |
| 数据迁移复杂性 | 低 | 开发周期延长 | 充分测试，逐步迁移 |

### 4.3 成功指标

#### 功能指标
- [ ] 支持 Pencil 90% 以上的核心功能
- [ ] 实现多人实时协作（支持 10+ 用户同时编辑）
- [ ] 版本控制功能完整（支持分支、合并、回滚）
- [ ] 导出格式齐全（PNG、SVG、PDF、HTML、Schema）

#### 性能指标
- [ ] 编辑器启动时间 < 3秒
- [ ] 大型原型（100+ 元素）流畅编辑
- [ ] 协作延迟 < 500ms
- [ ] 内存占用 < 500MB

#### 用户体验指标
- [ ] 学习成本低（现有 Pencil 用户可快速上手）
- [ ] 界面响应速度快
- [ ] 操作流程简洁
- [ ] 错误处理友好

---

本方案详细分析了 Pencil 集成的技术架构、实现方案和开发计划，为项目实施提供了完整的技术指导。通过混合集成的方式，既保留了 Pencil 的强大功能，又实现了与 Verto 平台的深度整合。