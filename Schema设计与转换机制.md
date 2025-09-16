# Schema设计与转换机制

## 1. 概述

### 1.1 设计目标
- 建立 Pencil 原型与 Ant Design Pro Schema 的映射关系
- 实现原型设计到代码生成的自动化转换
- 支持双向同步：原型变更自动更新代码，代码修改反映到原型
- 提供可扩展的组件映射机制
- 确保生成代码的可维护性和规范性

### 1.2 核心价值
- **提升开发效率**：从原型直接生成可运行的代码
- **保持设计一致性**：确保最终产品与原型设计一致
- **降低沟通成本**：设计师和开发者基于同一套Schema协作
- **支持快速迭代**：原型修改快速反映到代码中

### 1.3 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Schema 转换系统                          │
├─────────────────────────────────────────────────────────────────┤
│  Pencil原型  →  中间Schema  →  Ant Design Pro Schema  →  代码   │
├─────────────────────────────────────────────────────────────────┤
│     ↓              ↓              ↓                ↓           │
│  原型解析器    Schema映射器    代码生成器        文件输出器      │
├─────────────────────────────────────────────────────────────────┤
│              组件库映射  │  布局算法  │  样式转换               │
├─────────────────────────────────────────────────────────────────┤
│                        配置管理系统                             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Schema 结构设计

### 2.1 Verto 中间 Schema

#### 2.1.1 核心数据结构

```typescript
// Verto Schema 根结构
interface VertoSchema {
  version: string                    // Schema 版本
  metadata: SchemaMetadata          // 元数据信息
  pages: VertoPage[]               // 页面列表
  components: VertoComponent[]     // 自定义组件
  themes: VertoTheme[]            // 主题配置
  routes: VertoRoute[]            // 路由配置
  apis: VertoAPI[]                // API 接口定义
  states: VertoState[]            // 状态管理
}

// 元数据信息
interface SchemaMetadata {
  name: string                     // 项目名称
  description: string              // 项目描述
  author: string                   // 作者
  version: string                  // 项目版本
  createdAt: string               // 创建时间
  updatedAt: string               // 更新时间
  tags: string[]                  // 标签
  dependencies: SchemaDependency[] // 依赖项
}

// 页面结构
interface VertoPage {
  id: string                       // 页面唯一标识
  name: string                     // 页面名称
  title: string                    // 页面标题
  path: string                     // 路由路径
  layout: LayoutType              // 布局类型
  components: VertoComponent[]     // 页面组件
  styles: VertoStyle              // 页面样式
  scripts: VertoScript[]          // 页面脚本
  meta: PageMeta                  // 页面元信息
}

// 组件结构
interface VertoComponent {
  id: string                       // 组件唯一标识
  type: ComponentType             // 组件类型
  name: string                    // 组件名称
  props: Record<string, any>      // 组件属性
  styles: VertoStyle             // 组件样式
  events: VertoEvent[]           // 事件处理
  children: VertoComponent[]     // 子组件
  layout: LayoutInfo             // 布局信息
  validation: ValidationRule[]    // 验证规则
  permissions: Permission[]       // 权限控制
}

// 样式定义
interface VertoStyle {
  className?: string              // CSS 类名
  inline?: CSSProperties         // 内联样式
  responsive?: ResponsiveStyle   // 响应式样式
  theme?: ThemeVariables         // 主题变量
  animations?: Animation[]       // 动画效果
}

// 事件定义
interface VertoEvent {
  type: EventType                // 事件类型
  handler: EventHandler          // 事件处理器
  conditions: EventCondition[]   // 触发条件
  actions: EventAction[]         // 执行动作
}

// 布局信息
interface LayoutInfo {
  position: Position             // 位置信息
  size: Size                     // 尺寸信息
  constraints: LayoutConstraint[] // 布局约束
  grid: GridInfo                 // 网格信息
  flex: FlexInfo                 // Flex 信息
}
```

#### 2.1.2 组件类型定义

```typescript
// 组件类型枚举
enum ComponentType {
  // 基础组件
  BUTTON = 'button',
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  SLIDER = 'slider',
  DATE_PICKER = 'datePicker',
  TIME_PICKER = 'timePicker',
  UPLOAD = 'upload',
  
  // 布局组件
  ROW = 'row',
  COL = 'col',
  GRID = 'grid',
  FLEX = 'flex',
  SPACE = 'space',
  DIVIDER = 'divider',
  
  // 展示组件
  TEXT = 'text',
  TITLE = 'title',
  IMAGE = 'image',
  ICON = 'icon',
  AVATAR = 'avatar',
  BADGE = 'badge',
  TAG = 'tag',
  PROGRESS = 'progress',
  
  // 容器组件
  CARD = 'card',
  PANEL = 'panel',
  COLLAPSE = 'collapse',
  TABS = 'tabs',
  MODAL = 'modal',
  DRAWER = 'drawer',
  POPOVER = 'popover',
  TOOLTIP = 'tooltip',
  
  // 数据展示
  TABLE = 'table',
  LIST = 'list',
  TREE = 'tree',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
  
  // 导航组件
  MENU = 'menu',
  BREADCRUMB = 'breadcrumb',
  PAGINATION = 'pagination',
  STEPS = 'steps',
  
  // 反馈组件
  ALERT = 'alert',
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  LOADING = 'loading',
  SKELETON = 'skeleton',
  
  // 自定义组件
  CUSTOM = 'custom'
}

// 组件属性映射
interface ComponentPropsMapping {
  [ComponentType.BUTTON]: {
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
    size?: 'large' | 'middle' | 'small'
    shape?: 'default' | 'circle' | 'round'
    icon?: string
    loading?: boolean
    disabled?: boolean
    danger?: boolean
    ghost?: boolean
    block?: boolean
    htmlType?: 'button' | 'submit' | 'reset'
    href?: string
    target?: string
    onClick?: EventHandler
  }
  
  [ComponentType.INPUT]: {
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
    size?: 'large' | 'middle' | 'small'
    placeholder?: string
    defaultValue?: string
    value?: string
    disabled?: boolean
    readOnly?: boolean
    maxLength?: number
    showCount?: boolean
    allowClear?: boolean
    prefix?: string | React.ReactNode
    suffix?: string | React.ReactNode
    addonBefore?: string | React.ReactNode
    addonAfter?: string | React.ReactNode
    onChange?: EventHandler
    onPressEnter?: EventHandler
    onFocus?: EventHandler
    onBlur?: EventHandler
  }
  
  [ComponentType.TABLE]: {
    columns: TableColumn[]
    dataSource: any[]
    rowKey?: string | ((record: any) => string)
    pagination?: PaginationConfig | false
    loading?: boolean
    size?: 'default' | 'middle' | 'small'
    bordered?: boolean
    showHeader?: boolean
    scroll?: { x?: number | string; y?: number | string }
    rowSelection?: RowSelectionConfig
    expandable?: ExpandableConfig
    onRow?: (record: any, index: number) => any
    onChange?: EventHandler
  }
  
  // ... 其他组件属性定义
}
```

### 2.2 Ant Design Pro Schema 映射

#### 2.2.1 页面 Schema 结构

```typescript
// Ant Design Pro 页面 Schema
interface AntdProPageSchema {
  name: string                     // 页面名称
  path: string                     // 路由路径
  component: string               // 组件路径
  layout?: string                 // 布局组件
  title?: string                  // 页面标题
  icon?: string                   // 页面图标
  access?: string                 // 权限标识
  hideInMenu?: boolean           // 是否在菜单中隐藏
  hideChildrenInMenu?: boolean   // 是否隐藏子菜单
  flatMenu?: boolean             // 是否扁平化菜单
  routes?: AntdProPageSchema[]   // 子路由
  wrappers?: string[]            // 包装组件
  headerRender?: boolean         // 是否渲染头部
  footerRender?: boolean         // 是否渲染底部
  menuRender?: boolean           // 是否渲染菜单
  menuHeaderRender?: boolean     // 是否渲染菜单头部
  fixSiderbar?: boolean          // 是否固定侧边栏
  fixedHeader?: boolean          // 是否固定头部
}

// 组件 Schema 结构
interface AntdProComponentSchema {
  type: string                    // 组件类型
  props?: Record<string, any>     // 组件属性
  children?: AntdProComponentSchema[] // 子组件
  key?: string                    // 组件 key
  ref?: string                    // 组件 ref
  style?: CSSProperties          // 内联样式
  className?: string             // CSS 类名
  events?: Record<string, string> // 事件处理
}

// 表单 Schema 结构
interface AntdProFormSchema {
  type: 'form'
  props: {
    name?: string
    layout?: 'horizontal' | 'vertical' | 'inline'
    labelCol?: ColProps
    wrapperCol?: ColProps
    initialValues?: Record<string, any>
    onFinish?: string
    onFinishFailed?: string
    validateMessages?: Record<string, string>
  }
  children: AntdProFormItemSchema[]
}

// 表单项 Schema 结构
interface AntdProFormItemSchema {
  type: 'form-item'
  props: {
    name: string
    label?: string
    rules?: ValidationRule[]
    required?: boolean
    tooltip?: string
    extra?: string
    help?: string
    validateStatus?: 'success' | 'warning' | 'error' | 'validating'
    hasFeedback?: boolean
    labelAlign?: 'left' | 'right'
    labelCol?: ColProps
    wrapperCol?: ColProps
    colon?: boolean
    hidden?: boolean
    noStyle?: boolean
  }
  children: AntdProComponentSchema[]
}

// 表格 Schema 结构
interface AntdProTableSchema {
  type: 'pro-table'
  props: {
    columns: ProTableColumn[]
    request?: string              // 数据请求函数
    params?: Record<string, any>  // 请求参数
    pagination?: PaginationConfig // 分页配置
    search?: SearchConfig         // 搜索配置
    toolBarRender?: string[]      // 工具栏渲染
    tableAlertRender?: string     // 表格提示渲染
    rowSelection?: RowSelectionConfig // 行选择配置
    expandable?: ExpandableConfig // 展开配置
    scroll?: { x?: number; y?: number } // 滚动配置
    size?: 'default' | 'middle' | 'small' // 表格大小
    bordered?: boolean            // 是否显示边框
    showHeader?: boolean          // 是否显示表头
    tableLayout?: 'auto' | 'fixed' // 表格布局
    rowKey?: string               // 行 key
    loading?: boolean             // 加载状态
    dataSource?: any[]            // 数据源
    onChange?: string             // 变化回调
    onRow?: string                // 行事件
    onHeaderRow?: string          // 表头行事件
  }
}
```

#### 2.2.2 ProTable 列定义

```typescript
// ProTable 列配置
interface ProTableColumn {
  title: string                   // 列标题
  dataIndex: string              // 数据索引
  key?: string                   // 列 key
  valueType?: ValueType          // 值类型
  valueEnum?: Record<string, any> // 值枚举
  width?: number | string        // 列宽
  fixed?: 'left' | 'right'       // 固定列
  align?: 'left' | 'center' | 'right' // 对齐方式
  ellipsis?: boolean             // 是否省略
  copyable?: boolean             // 是否可复制
  sorter?: boolean | SorterConfig // 排序配置
  filters?: FilterConfig[]       // 过滤配置
  search?: SearchConfig          // 搜索配置
  hideInTable?: boolean          // 是否在表格中隐藏
  hideInSearch?: boolean         // 是否在搜索中隐藏
  hideInForm?: boolean           // 是否在表单中隐藏
  hideInDescriptions?: boolean   // 是否在描述中隐藏
  render?: string                // 自定义渲染函数
  renderText?: string            // 自定义文本渲染函数
  renderFormItem?: string        // 自定义表单项渲染函数
  fieldProps?: Record<string, any> // 字段属性
  formItemProps?: Record<string, any> // 表单项属性
  colProps?: ColProps            // 列属性
  tooltip?: string               // 提示信息
  request?: string               // 数据请求函数
  params?: Record<string, any>   // 请求参数
  dependencies?: string[]        // 依赖字段
}

// 值类型枚举
enum ValueType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  PASSWORD = 'password',
  MONEY = 'money',
  INDEX = 'index',
  INDEXBORDER = 'indexBorder',
  OPTION = 'option',
  DATE = 'date',
  DATETIME = 'dateTime',
  DATEWEEK = 'dateWeek',
  DATEMONTH = 'dateMonth',
  DATEQUARTER = 'dateQuarter',
  DATEYEAR = 'dateYear',
  DATERANGE = 'dateRange',
  DATETIMERANGE = 'dateTimeRange',
  TIME = 'time',
  TIMERANGE = 'timeRange',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RATE = 'rate',
  RADIO = 'radio',
  RADIOBUTTON = 'radioButton',
  PROGRESS = 'progress',
  PERCENT = 'percent',
  DIGIT = 'digit',
  SECOND = 'second',
  AVATAR = 'avatar',
  CODE = 'code',
  SWITCH = 'switch',
  FROMTO = 'fromTo',
  IMAGE = 'image',
  JSONCODE = 'jsonCode',
  COLOR = 'color',
  CASCADER = 'cascader',
  TREESELECT = 'treeSelect',
  UPLOAD = 'upload'
}
```

## 3. 转换引擎设计

### 3.1 转换器架构

```typescript
// 转换引擎主类
export class SchemaTransformEngine {
  private pencilParser: PencilParser
  private componentMapper: ComponentMapper
  private layoutCalculator: LayoutCalculator
  private codeGenerator: CodeGenerator
  private configManager: ConfigManager
  
  constructor(config: TransformConfig) {
    this.pencilParser = new PencilParser()
    this.componentMapper = new ComponentMapper(config.mappingRules)
    this.layoutCalculator = new LayoutCalculator(config.layoutConfig)
    this.codeGenerator = new CodeGenerator(config.codeConfig)
    this.configManager = new ConfigManager(config)
  }
  
  /**
   * 转换 Pencil 原型到 Ant Design Pro Schema
   */
  async transformPencilToAntd(pencilDocument: PencilDocument): Promise<AntdProSchema> {
    try {
      // 1. 解析 Pencil 文档
      const vertoSchema = await this.pencilParser.parse(pencilDocument)
      
      // 2. 组件映射
      const mappedSchema = await this.componentMapper.mapComponents(vertoSchema)
      
      // 3. 布局计算
      const layoutedSchema = await this.layoutCalculator.calculateLayout(mappedSchema)
      
      // 4. 生成 Ant Design Pro Schema
      const antdSchema = await this.generateAntdSchema(layoutedSchema)
      
      return antdSchema
    } catch (error) {
      console.error('Schema 转换失败:', error)
      throw new TransformError('Schema 转换失败', error)
    }
  }
  
  /**
   * 转换 Ant Design Pro Schema 到代码
   */
  async transformSchemaToCode(antdSchema: AntdProSchema): Promise<GeneratedCode> {
    try {
      // 1. 代码生成
      const generatedCode = await this.codeGenerator.generate(antdSchema)
      
      // 2. 代码优化
      const optimizedCode = await this.codeGenerator.optimize(generatedCode)
      
      // 3. 格式化代码
      const formattedCode = await this.codeGenerator.format(optimizedCode)
      
      return formattedCode
    } catch (error) {
      console.error('代码生成失败:', error)
      throw new CodeGenerationError('代码生成失败', error)
    }
  }
  
  /**
   * 双向同步：代码变更反映到原型
   */
  async syncCodeToPrototype(codeChanges: CodeChange[], originalSchema: VertoSchema): Promise<VertoSchema> {
    try {
      // 1. 解析代码变更
      const schemaChanges = await this.parseCodeChanges(codeChanges)
      
      // 2. 应用变更到 Schema
      const updatedSchema = await this.applySchemaChanges(originalSchema, schemaChanges)
      
      // 3. 验证 Schema 一致性
      await this.validateSchemaConsistency(updatedSchema)
      
      return updatedSchema
    } catch (error) {
      console.error('代码同步失败:', error)
      throw new SyncError('代码同步失败', error)
    }
  }
  
  /**
   * 生成 Ant Design Pro Schema
   */
  private async generateAntdSchema(vertoSchema: VertoSchema): Promise<AntdProSchema> {
    const antdSchema: AntdProSchema = {
      version: '1.0.0',
      pages: [],
      routes: [],
      components: [],
      config: {
        theme: this.generateThemeConfig(vertoSchema.themes),
        layout: this.generateLayoutConfig(vertoSchema),
        request: this.generateRequestConfig(vertoSchema.apis)
      }
    }
    
    // 转换页面
    for (const page of vertoSchema.pages) {
      const antdPage = await this.convertPageToAntd(page)
      antdSchema.pages.push(antdPage)
      
      // 生成路由配置
      const route = this.generateRouteConfig(page)
      antdSchema.routes.push(route)
    }
    
    // 转换自定义组件
    for (const component of vertoSchema.components) {
      const antdComponent = await this.convertComponentToAntd(component)
      antdSchema.components.push(antdComponent)
    }
    
    return antdSchema
  }
  
  /**
   * 转换页面到 Ant Design Pro 格式
   */
  private async convertPageToAntd(page: VertoPage): Promise<AntdProPageSchema> {
    const antdPage: AntdProPageSchema = {
      name: page.name,
      path: page.path,
      component: `./pages/${page.name}`,
      title: page.title,
      layout: this.mapLayoutType(page.layout),
      access: page.meta.access,
      hideInMenu: page.meta.hideInMenu,
      icon: page.meta.icon
    }
    
    return antdPage
  }
  
  /**
   * 转换组件到 Ant Design Pro 格式
   */
  private async convertComponentToAntd(component: VertoComponent): Promise<AntdProComponentSchema> {
    const antdComponent: AntdProComponentSchema = {
      type: this.mapComponentType(component.type),
      props: await this.mapComponentProps(component),
      key: component.id,
      style: this.mapComponentStyle(component.styles),
      className: component.styles.className,
      events: this.mapComponentEvents(component.events)
    }
    
    // 转换子组件
    if (component.children && component.children.length > 0) {
      antdComponent.children = []
      for (const child of component.children) {
        const antdChild = await this.convertComponentToAntd(child)
        antdComponent.children.push(antdChild)
      }
    }
    
    return antdComponent
  }
}
```

### 3.2 组件映射器

```typescript
// 组件映射器
export class ComponentMapper {
  private mappingRules: MappingRule[]
  private customMappings: Map<string, ComponentMapping>
  
  constructor(mappingRules: MappingRule[]) {
    this.mappingRules = mappingRules
    this.customMappings = new Map()
    this.initializeDefaultMappings()
  }
  
  /**
   * 初始化默认映射规则
   */
  private initializeDefaultMappings(): void {
    // 基础组件映射
    this.addMapping('button', {
      antdType: 'Button',
      propsMapping: {
        'text': 'children',
        'buttonType': 'type',
        'size': 'size',
        'disabled': 'disabled',
        'loading': 'loading',
        'icon': 'icon',
        'shape': 'shape',
        'danger': 'danger',
        'ghost': 'ghost',
        'block': 'block'
      },
      styleMapping: {
        'backgroundColor': (value) => ({ type: value === '#1890ff' ? 'primary' : 'default' }),
        'borderRadius': 'shape',
        'width': (value) => ({ block: value === '100%' })
      },
      eventMapping: {
        'click': 'onClick',
        'mouseenter': 'onMouseEnter',
        'mouseleave': 'onMouseLeave'
      }
    })
    
    this.addMapping('input', {
      antdType: 'Input',
      propsMapping: {
        'placeholder': 'placeholder',
        'defaultValue': 'defaultValue',
        'value': 'value',
        'disabled': 'disabled',
        'readOnly': 'readOnly',
        'maxLength': 'maxLength',
        'showCount': 'showCount',
        'allowClear': 'allowClear',
        'size': 'size',
        'prefix': 'prefix',
        'suffix': 'suffix',
        'addonBefore': 'addonBefore',
        'addonAfter': 'addonAfter'
      },
      styleMapping: {
        'width': 'style.width',
        'height': 'style.height'
      },
      eventMapping: {
        'change': 'onChange',
        'pressenter': 'onPressEnter',
        'focus': 'onFocus',
        'blur': 'onBlur'
      }
    })
    
    this.addMapping('select', {
      antdType: 'Select',
      propsMapping: {
        'placeholder': 'placeholder',
        'defaultValue': 'defaultValue',
        'value': 'value',
        'disabled': 'disabled',
        'allowClear': 'allowClear',
        'showSearch': 'showSearch',
        'mode': 'mode',
        'size': 'size',
        'options': 'options'
      },
      styleMapping: {
        'width': 'style.width'
      },
      eventMapping: {
        'change': 'onChange',
        'search': 'onSearch',
        'focus': 'onFocus',
        'blur': 'onBlur'
      }
    })
    
    this.addMapping('table', {
      antdType: 'ProTable',
      propsMapping: {
        'columns': 'columns',
        'dataSource': 'dataSource',
        'rowKey': 'rowKey',
        'pagination': 'pagination',
        'loading': 'loading',
        'size': 'size',
        'bordered': 'bordered',
        'showHeader': 'showHeader',
        'scroll': 'scroll',
        'rowSelection': 'rowSelection',
        'expandable': 'expandable'
      },
      styleMapping: {
        'width': 'style.width',
        'height': 'scroll.y'
      },
      eventMapping: {
        'change': 'onChange',
        'row': 'onRow'
      },
      specialHandlers: {
        'columns': this.handleTableColumns.bind(this),
        'dataSource': this.handleTableDataSource.bind(this),
        'pagination': this.handleTablePagination.bind(this)
      }
    })
    
    this.addMapping('form', {
      antdType: 'ProForm',
      propsMapping: {
        'layout': 'layout',
        'labelCol': 'labelCol',
        'wrapperCol': 'wrapperCol',
        'initialValues': 'initialValues',
        'validateMessages': 'validateMessages'
      },
      eventMapping: {
        'finish': 'onFinish',
        'finishFailed': 'onFinishFailed',
        'valuesChange': 'onValuesChange'
      },
      specialHandlers: {
        'formItems': this.handleFormItems.bind(this)
      }
    })
  }
  
  /**
   * 添加自定义映射
   */
  addMapping(componentType: string, mapping: ComponentMapping): void {
    this.customMappings.set(componentType, mapping)
  }
  
  /**
   * 映射组件类型
   */
  mapComponentType(vertoType: ComponentType): string {
    const mapping = this.customMappings.get(vertoType)
    return mapping?.antdType || vertoType
  }
  
  /**
   * 映射组件属性
   */
  async mapComponentProps(component: VertoComponent): Promise<Record<string, any>> {
    const mapping = this.customMappings.get(component.type)
    if (!mapping) {
      return component.props
    }
    
    const mappedProps: Record<string, any> = {}
    
    // 基础属性映射
    if (mapping.propsMapping) {
      Object.entries(component.props).forEach(([key, value]) => {
        const mappedKey = mapping.propsMapping[key]
        if (mappedKey) {
          mappedProps[mappedKey] = value
        }
      })
    }
    
    // 样式属性映射
    if (mapping.styleMapping && component.styles) {
      Object.entries(component.styles.inline || {}).forEach(([key, value]) => {
        const styleMapper = mapping.styleMapping[key]
        if (styleMapper) {
          if (typeof styleMapper === 'string') {
            this.setNestedProperty(mappedProps, styleMapper, value)
          } else if (typeof styleMapper === 'function') {
            const mappedValue = styleMapper(value)
            Object.assign(mappedProps, mappedValue)
          }
        }
      })
    }
    
    // 特殊处理器
    if (mapping.specialHandlers) {
      for (const [key, handler] of Object.entries(mapping.specialHandlers)) {
        if (component.props[key] !== undefined) {
          const handledValue = await handler(component.props[key], component)
          mappedProps[key] = handledValue
        }
      }
    }
    
    return mappedProps
  }
  
  /**
   * 映射组件事件
   */
  mapComponentEvents(events: VertoEvent[]): Record<string, string> {
    const mappedEvents: Record<string, string> = {}
    
    events.forEach(event => {
      const mapping = this.customMappings.get(event.type)
      if (mapping?.eventMapping) {
        const mappedEventName = mapping.eventMapping[event.type]
        if (mappedEventName) {
          mappedEvents[mappedEventName] = this.generateEventHandler(event)
        }
      }
    })
    
    return mappedEvents
  }
  
  /**
   * 处理表格列配置
   */
  private async handleTableColumns(columns: any[], component: VertoComponent): Promise<ProTableColumn[]> {
    const proColumns: ProTableColumn[] = []
    
    for (const column of columns) {
      const proColumn: ProTableColumn = {
        title: column.title || column.label,
        dataIndex: column.dataIndex || column.key,
        key: column.key || column.dataIndex,
        valueType: this.mapValueType(column.type),
        width: column.width,
        fixed: column.fixed,
        align: column.align,
        ellipsis: column.ellipsis,
        sorter: column.sortable,
        search: column.searchable ? {} : false,
        hideInTable: column.hidden,
        render: column.render ? this.generateRenderFunction(column.render) : undefined
      }
      
      // 处理枚举值
      if (column.options) {
        proColumn.valueEnum = this.convertOptionsToEnum(column.options)
      }
      
      // 处理过滤器
      if (column.filters) {
        proColumn.filters = column.filters.map(filter => ({
          text: filter.label,
          value: filter.value
        }))
      }
      
      proColumns.push(proColumn)
    }
    
    return proColumns
  }
  
  /**
   * 处理表格数据源
   */
  private async handleTableDataSource(dataSource: any, component: VertoComponent): Promise<any> {
    if (typeof dataSource === 'string') {
      // 如果是 API 地址，转换为 request 函数
      return {
        request: this.generateRequestFunction(dataSource)
      }
    }
    
    return dataSource
  }
  
  /**
   * 处理表格分页
   */
  private async handleTablePagination(pagination: any, component: VertoComponent): Promise<any> {
    if (pagination === false) {
      return false
    }
    
    return {
      pageSize: pagination.pageSize || 10,
      current: pagination.current || 1,
      total: pagination.total || 0,
      showSizeChanger: pagination.showSizeChanger !== false,
      showQuickJumper: pagination.showQuickJumper !== false,
      showTotal: pagination.showTotal !== false
    }
  }
  
  /**
   * 处理表单项
   */
  private async handleFormItems(formItems: any[], component: VertoComponent): Promise<any[]> {
    const proFormItems = []
    
    for (const item of formItems) {
      const proFormItem = {
        name: item.name,
        label: item.label,
        valueType: this.mapValueType(item.type),
        required: item.required,
        rules: item.rules || [],
        tooltip: item.tooltip,
        placeholder: item.placeholder,
        fieldProps: item.fieldProps || {},
        formItemProps: item.formItemProps || {}
      }
      
      // 处理选项类型
      if (item.options) {
        proFormItem.fieldProps.options = item.options
      }
      
      // 处理依赖关系
      if (item.dependencies) {
        proFormItem.dependencies = item.dependencies
      }
      
      proFormItems.push(proFormItem)
    }
    
    return proFormItems
  }
  
  /**
   * 映射值类型
   */
  private mapValueType(type: string): ValueType {
    const typeMapping: Record<string, ValueType> = {
      'text': ValueType.TEXT,
      'textarea': ValueType.TEXTAREA,
      'password': ValueType.PASSWORD,
      'number': ValueType.DIGIT,
      'money': ValueType.MONEY,
      'date': ValueType.DATE,
      'datetime': ValueType.DATETIME,
      'daterange': ValueType.DATERANGE,
      'time': ValueType.TIME,
      'select': ValueType.SELECT,
      'checkbox': ValueType.CHECKBOX,
      'radio': ValueType.RADIO,
      'switch': ValueType.SWITCH,
      'rate': ValueType.RATE,
      'slider': ValueType.PERCENT,
      'upload': ValueType.UPLOAD,
      'image': ValueType.IMAGE,
      'color': ValueType.COLOR
    }
    
    return typeMapping[type] || ValueType.TEXT
  }
  
  /**
   * 生成事件处理函数
   */
  private generateEventHandler(event: VertoEvent): string {
    const handlerName = `handle${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`
    
    // 根据事件动作生成处理逻辑
    const actions = event.actions.map(action => {
      switch (action.type) {
        case 'navigate':
          return `history.push('${action.target}')`
        case 'api_call':
          return `await ${action.api}(${JSON.stringify(action.params)})`
        case 'state_update':
          return `set${action.state}(${action.value})`
        case 'message':
          return `message.${action.level}('${action.content}')`
        default:
          return `// ${action.type}: ${action.description}`
      }
    }).join(';\n    ')
    
    return `
  const ${handlerName} = async (${event.handler.params || ''}) => {
    try {
      ${actions}
    } catch (error) {
      console.error('事件处理失败:', error)
      message.error('操作失败，请重试')
    }
  }
    `
  }
  
  /**
   * 生成渲染函数
   */
  private generateRenderFunction(renderConfig: any): string {
    if (typeof renderConfig === 'string') {
      return renderConfig
    }
    
    // 根据渲染配置生成函数
    switch (renderConfig.type) {
      case 'link':
        return `(text, record) => <a href="${renderConfig.href}">{text}</a>`
      case 'tag':
        return `(text) => <Tag color="${renderConfig.color}">{text}</Tag>`
      case 'status':
        return `(text) => <Badge status="${renderConfig.status}" text={text} />`
      case 'image':
        return `(text) => <Image src={text} width={${renderConfig.width || 50}} />`
      default:
        return `(text) => text`
    }
  }
  
  /**
   * 转换选项为枚举
   */
  private convertOptionsToEnum(options: any[]): Record<string, any> {
    const enumObj: Record<string, any> = {}
    
    options.forEach(option => {
      enumObj[option.value] = {
        text: option.label,
        status: option.status || 'Default'
      }
    })
    
    return enumObj
  }
  
  /**
   * 生成请求函数
   */
  private generateRequestFunction(apiUrl: string): string {
    return `
  const request = async (params, sort, filter) => {
    const response = await fetch('${apiUrl}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        sort,
        filter
      })
    })
    
    const data = await response.json()
    
    return {
      data: data.list,
      success: data.success,
      total: data.total
    }
  }
    `
  }
  
  /**
   * 设置嵌套属性
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }
}

// 映射规则接口
interface MappingRule {
  sourceType: string
  targetType: string
  propsMapping?: Record<string, string>
  styleMapping?: Record<string, string | ((value: any) => any)>
  eventMapping?: Record<string, string>
  specialHandlers?: Record<string, (value: any, component: VertoComponent) => Promise<any>>
}

// 组件映射接口
interface ComponentMapping {
  antdType: string
  propsMapping?: Record<string, string>
  styleMapping?: Record<string, string | ((value: any) => any)>
  eventMapping?: Record<string, string>
  specialHandlers?: Record<string, (value: any, component: VertoComponent) => Promise<any>>
}
```

### 3.3 布局计算器

```typescript
// 布局计算器
export class LayoutCalculator {
  private gridSystem: GridSystem
  private flexSystem: FlexSystem
  private responsiveSystem: ResponsiveSystem
  
  constructor(config: LayoutConfig) {
    this.gridSystem = new GridSystem(config.grid)
    this.flexSystem = new FlexSystem(config.flex)
    this.responsiveSystem = new ResponsiveSystem(config.responsive)
  }
  
  /**
   * 计算页面布局
   */
  async calculateLayout(schema: VertoSchema): Promise<VertoSchema> {
    const layoutedSchema = { ...schema }
    
    for (const page of layoutedSchema.pages) {
      await this.calculatePageLayout(page)
    }
    
    return layoutedSchema
  }
  
  /**
   * 计算页面布局
   */
  private async calculatePageLayout(page: VertoPage): Promise<void> {
    // 1. 分析组件层次结构
    const componentTree = this.buildComponentTree(page.components)
    
    // 2. 检测布局模式
    const layoutMode = this.detectLayoutMode(componentTree)
    
    // 3. 应用布局算法
    switch (layoutMode) {
      case 'grid':
        await this.applyGridLayout(page)
        break
      case 'flex':
        await this.applyFlexLayout(page)
        break
      case 'absolute':
        await this.applyAbsoluteLayout(page)
        break
      case 'mixed':
        await this.applyMixedLayout(page)
        break
    }
    
    // 4. 计算响应式布局
    await this.calculateResponsiveLayout(page)
  }
  
  /**
   * 构建组件树
   */
  private buildComponentTree(components: VertoComponent[]): ComponentTree {
    const tree: ComponentTree = {
      root: null,
      nodes: new Map(),
      edges: new Map()
    }
    
    // 构建节点
    components.forEach(component => {
      tree.nodes.set(component.id, {
        id: component.id,
        component: component,
        parent: null,
        children: [],
        level: 0,
        bounds: this.calculateBounds(component)
      })
    })
    
    // 构建层次关系
    components.forEach(component => {
      if (component.children) {
        component.children.forEach(child => {
          const parentNode = tree.nodes.get(component.id)
          const childNode = tree.nodes.get(child.id)
          
          if (parentNode && childNode) {
            childNode.parent = parentNode
            parentNode.children.push(childNode)
            childNode.level = parentNode.level + 1
          }
        })
      }
    })
    
    return tree
  }
  
  /**
   * 检测布局模式
   */
  private detectLayoutMode(tree: ComponentTree): LayoutMode {
    const components = Array.from(tree.nodes.values())
    
    // 检查是否有明确的布局容器
    const hasGridContainer = components.some(node => 
      node.component.type === ComponentType.GRID
    )
    
    const hasFlexContainer = components.some(node => 
      node.component.type === ComponentType.FLEX
    )
    
    if (hasGridContainer) {
      return 'grid'
    }
    
    if (hasFlexContainer) {
      return 'flex'
    }
    
    // 分析组件位置关系
    const alignmentScore = this.calculateAlignmentScore(components)
    const overlapScore = this.calculateOverlapScore(components)
    
    if (alignmentScore > 0.8) {
      return 'grid'
    }
    
    if (overlapScore < 0.1) {
      return 'flex'
    }
    
    return 'absolute'
  }
  
  /**
   * 应用网格布局
   */
  private async applyGridLayout(page: VertoPage): Promise<void> {
    const gridConfig = await this.gridSystem.analyzeGrid(page.components)
    
    // 创建网格容器
    const gridContainer: VertoComponent = {
      id: generateId(),
      type: ComponentType.ROW,
      name: 'GridContainer',
      props: {
        gutter: gridConfig.gutter
      },
      styles: {
        className: 'grid-container'
      },
      events: [],
      children: [],
      layout: {
        position: { x: 0, y: 0 },
        size: { width: page.width, height: page.height },
        constraints: [],
        grid: gridConfig,
        flex: null
      },
      validation: [],
      permissions: []
    }
    
    // 将组件分配到网格单元
    const gridCells = this.gridSystem.allocateComponents(page.components, gridConfig)
    
    gridCells.forEach(cell => {
      const colComponent: VertoComponent = {
        id: generateId(),
        type: ComponentType.COL,
        name: `GridCol_${cell.col}`,
        props: {
          span: cell.span,
          offset: cell.offset,
          xs: cell.responsive?.xs,
          sm: cell.responsive?.sm,
          md: cell.responsive?.md,
          lg: cell.responsive?.lg,
          xl: cell.responsive?.xl,
          xxl: cell.responsive?.xxl
        },
        styles: {
          className: 'grid-col'
        },
        events: [],
        children: cell.components,
        layout: {
          position: { x: cell.x, y: cell.y },
          size: { width: cell.width, height: cell.height },
          constraints: [],
          grid: null,
          flex: null
        },
        validation: [],
        permissions: []
      }
      
      gridContainer.children.push(colComponent)
    })
    
    // 替换页面组件
    page.components = [gridContainer]
  }
  
  /**
   * 应用 Flex 布局
   */
  private async applyFlexLayout(page: VertoPage): Promise<void> {
    const flexConfig = await this.flexSystem.analyzeFlex(page.components)
    
    // 创建 Flex 容器
    const flexContainer: VertoComponent = {
      id: generateId(),
      type: ComponentType.FLEX,
      name: 'FlexContainer',
      props: {
        direction: flexConfig.direction,
        justify: flexConfig.justify,
        align: flexConfig.align,
        wrap: flexConfig.wrap,
        gap: flexConfig.gap
      },
      styles: {
        className: 'flex-container',
        inline: {
          display: 'flex',
          flexDirection: flexConfig.direction,
          justifyContent: flexConfig.justify,
          alignItems: flexConfig.align,
          flexWrap: flexConfig.wrap,
          gap: `${flexConfig.gap}px`
        }
      },
      events: [],
      children: [],
      layout: {
        position: { x: 0, y: 0 },
        size: { width: page.width, height: page.height },
        constraints: [],
        grid: null,
        flex: flexConfig
      },
      validation: [],
      permissions: []
    }
    
    // 计算 Flex 项目属性
    page.components.forEach(component => {
      const flexItem = this.flexSystem.calculateFlexItem(component, flexConfig)
      
      component.props = {
        ...component.props,
        flex: flexItem.flex,
        order: flexItem.order
      }
      
      component.styles.inline = {
        ...component.styles.inline,
        flex: flexItem.flex,
        order: flexItem.order,
        alignSelf: flexItem.alignSelf
      }
      
      flexContainer.children.push(component)
    })
    
    // 替换页面组件
    page.components = [flexContainer]
  }
  
  /**
   * 应用绝对定位布局
   */
  private async applyAbsoluteLayout(page: VertoPage): Promise<void> {
    page.components.forEach(component => {
      component.styles.inline = {
        ...component.styles.inline,
        position: 'absolute',
        left: `${component.layout.position.x}px`,
        top: `${component.layout.position.y}px`,
        width: `${component.layout.size.width}px`,
        height: `${component.layout.size.height}px`
      }
    })
  }
  
  /**
   * 计算响应式布局
   */
  private async calculateResponsiveLayout(page: VertoPage): Promise<void> {
    const breakpoints = this.responsiveSystem.getBreakpoints()
    
    for (const component of page.components) {
      await this.calculateComponentResponsive(component, breakpoints)
    }
  }
  
  /**
   * 计算组件响应式属性
   */
  private async calculateComponentResponsive(
    component: VertoComponent, 
    breakpoints: Breakpoint[]
  ): Promise<void> {
    const responsiveStyles: ResponsiveStyle = {}
    
    breakpoints.forEach(breakpoint => {
      const mediaQuery = `@media (max-width: ${breakpoint.maxWidth}px)`
      
      // 计算在该断点下的样式
      const breakpointStyle = this.responsiveSystem.calculateBreakpointStyle(
        component,
        breakpoint
      )
      
      if (Object.keys(breakpointStyle).length > 0) {
        responsiveStyles[mediaQuery] = breakpointStyle
      }
    })
    
    if (Object.keys(responsiveStyles).length > 0) {
      component.styles.responsive = responsiveStyles
    }
    
    // 递归处理子组件
    if (component.children) {
      for (const child of component.children) {
        await this.calculateComponentResponsive(child, breakpoints)
      }
    }
  }
  
  /**
   * 计算组件边界
   */
  private calculateBounds(component: VertoComponent): Bounds {
    return {
      x: component.layout.position.x,
      y: component.layout.position.y,
      width: component.layout.size.width,
      height: component.layout.size.height,
      right: component.layout.position.x + component.layout.size.width,
      bottom: component.layout.position.y + component.layout.size.height
    }
  }
  
  /**
   * 计算对齐分数
   */
  private calculateAlignmentScore(nodes: ComponentTreeNode[]): number {
    if (nodes.length < 2) return 0
    
    let alignedPairs = 0
    let totalPairs = 0
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        totalPairs++
        
        const node1 = nodes[i]
        const node2 = nodes[j]
        
        // 检查水平对齐
        if (Math.abs(node1.bounds.x - node2.bounds.x) < 5 ||
            Math.abs(node1.bounds.right - node2.bounds.right) < 5) {
          alignedPairs++
        }
        
        // 检查垂直对齐
        if (Math.abs(node1.bounds.y - node2.bounds.y) < 5 ||
            Math.abs(node1.bounds.bottom - node2.bounds.bottom) < 5) {
          alignedPairs++
        }
      }
    }
    
    return totalPairs > 0 ? alignedPairs / totalPairs : 0
  }
  
  /**
   * 计算重叠分数
   */
  private calculateOverlapScore(nodes: ComponentTreeNode[]): number {
    if (nodes.length < 2) return 0
    
    let overlappingPairs = 0
    let totalPairs = 0
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        totalPairs++
        
        const node1 = nodes[i]
        const node2 = nodes[j]
        
        if (this.isOverlapping(node1.bounds, node2.bounds)) {
          overlappingPairs++
        }
      }
    }
    
    return totalPairs > 0 ? overlappingPairs / totalPairs : 0
  }
  
  /**
   * 检查两个边界是否重叠
   */
  private isOverlapping(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(bounds1.right <= bounds2.x || 
             bounds2.right <= bounds1.x || 
             bounds1.bottom <= bounds2.y || 
             bounds2.bottom <= bounds1.y)
  }
}

// 相关接口定义
interface ComponentTree {
  root: ComponentTreeNode | null
  nodes: Map<string, ComponentTreeNode>
  edges: Map<string, string[]>
}

interface ComponentTreeNode {
  id: string
  component: VertoComponent
  parent: ComponentTreeNode | null
  children: ComponentTreeNode[]
  level: number
  bounds: Bounds
}

interface Bounds {
  x: number
  y: number
  width: number
  height: number
  right: number
  bottom: number
}

type LayoutMode = 'grid' | 'flex' | 'absolute' | 'mixed'

interface GridConfig {
  columns: number
  rows: number
  gutter: number
  columnWidth: number
  rowHeight: number
}

interface FlexConfig {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap: number
}

interface Breakpoint {
  name: string
  minWidth: number
  maxWidth: number
  columns: number
}
```

## 4. 代码生成器

### 4.1 代码生成引擎

```typescript
// 代码生成器
export class CodeGenerator {
  private templateEngine: TemplateEngine
  private fileManager: FileManager
  private codeFormatter: CodeFormatter
  private dependencyManager: DependencyManager
  
  constructor(config: CodeGenerationConfig) {
    this.templateEngine = new TemplateEngine(config.templates)
    this.fileManager = new FileManager(config.output)
    this.codeFormatter = new CodeFormatter(config.formatting)
    this.dependencyManager = new DependencyManager(config.dependencies)
  }
  
  /**
   * 生成完整项目代码
   */
  async generate(schema: AntdProSchema): Promise<GeneratedCode> {
    try {
      // 1. 分析依赖
      const dependencies = await this.dependencyManager.analyzeDependencies(schema)
      
      // 2. 生成文件结构
      const fileStructure = await this.generateFileStructure(schema)
      
      // 3. 生成页面组件
      const pageComponents = await this.generatePageComponents(schema.pages)
      
      // 4. 生成自定义组件
      const customComponents = await this.generateCustomComponents(schema.components)
      
      // 5. 生成路由配置
      const routeConfig = await this.generateRouteConfig(schema.routes)
      
      // 6. 生成配置文件
      const configFiles = await this.generateConfigFiles(schema.config)
      
      // 7. 生成样式文件
      const styleFiles = await this.generateStyleFiles(schema)
      
      // 8. 生成类型定义
      const typeDefinitions = await this.generateTypeDefinitions(schema)
      
      // 9. 生成测试文件
      const testFiles = await this.generateTestFiles(schema)
      
      // 10. 生成文档
      const documentation = await this.generateDocumentation(schema)
      
      const generatedCode: GeneratedCode = {
        dependencies,
        fileStructure,
        pageComponents,
        customComponents,
        routeConfig,
        configFiles,
        styleFiles,
        typeDefinitions,
        testFiles,
        documentation
      }
      
      return generatedCode
    } catch (error) {
      console.error('代码生成失败:', error)
      throw new CodeGenerationError('代码生成失败', error)
    }
  }
  
  /**
   * 生成页面组件
   */
  private async generatePageComponents(pages: AntdProPageSchema[]): Promise<GeneratedFile[]> {
    const pageFiles: GeneratedFile[] = []
    
    for (const page of pages) {
      const pageComponent = await this.generatePageComponent(page)
      pageFiles.push(pageComponent)
    }
    
    return pageFiles
  }
  
  /**
   * 生成单个页面组件
   */
  private async generatePageComponent(page: AntdProPageSchema): Promise<GeneratedFile> {
    const template = await this.templateEngine.getTemplate('page')
    
    const templateData = {
      pageName: page.name,
      pageTitle: page.title,
      components: page.components || [],
      imports: this.generateImports(page),
      hooks: this.generateHooks(page),
      handlers: this.generateHandlers(page),
      effects: this.generateEffects(page),
      styles: this.generatePageStyles(page)
    }
    
    const code = await this.templateEngine.render(template, templateData)
    
    return {
      path: `src/pages/${page.name}/index.tsx`,
      content: code,
      type: 'component'
    }
  }
  
  /**
   * 生成导入语句
   */
  private generateImports(page: AntdProPageSchema): string[] {
    const imports = new Set<string>()
    
    // React 基础导入
    imports.add("import React, { useState, useEffect, useCallback } from 'react'")
    
    // Ant Design 组件导入
    const antdComponents = this.extractAntdComponents(page.components || [])
    if (antdComponents.length > 0) {
      imports.add(`import { ${antdComponents.join(', ')} } from 'antd'`)
    }
    
    // Pro Components 导入
    const proComponents = this.extractProComponents(page.components || [])
    if (proComponents.length > 0) {
      imports.add(`import { ${proComponents.join(', ')} } from '@ant-design/pro-components'`)
    }
    
    // 自定义组件导入
    const customComponents = this.extractCustomComponents(page.components || [])
    customComponents.forEach(component => {
      imports.add(`import ${component} from '@/components/${component}'`)
    })
    
    // API 导入
    const apis = this.extractApis(page.components || [])
    apis.forEach(api => {
      imports.add(`import { ${api} } from '@/services/${page.name}'`)
    })
    
    // 类型导入
    imports.add(`import type { ${page.name}Props } from './types'`)
    
    return Array.from(imports)
  }
  
  /**
   * 生成 Hooks
   */
  private generateHooks(page: AntdProPageSchema): string[] {
    const hooks: string[] = []
    
    // 状态 Hooks
    const states = this.extractStates(page.components || [])
    states.forEach(state => {
      hooks.push(`const [${state.name}, set${capitalize(state.name)}] = useState<${state.type}>(${state.defaultValue})`)
    })
    
    // 表单 Hooks
    const forms = this.extractForms(page.components || [])
    forms.forEach(form => {
      hooks.push(`const [${form.name}] = Form.useForm()`)
    })
    
    // 表格 Hooks
    const tables = this.extractTables(page.components || [])
    tables.forEach(table => {
      hooks.push(`const ${table.name}Ref = useRef<ActionType>()`)
    })
    
    return hooks
  }
  
  /**
   * 生成事件处理器
   */
  private generateHandlers(page: AntdProPageSchema): string[] {
    const handlers: string[] = []
    
    // 提取所有事件
    const events = this.extractEvents(page.components || [])
    
    events.forEach(event => {
      const handlerCode = this.generateEventHandler(event)
      handlers.push(handlerCode)
    })
    
    return handlers
  }
  
  /**
   * 生成副作用
   */
  private generateEffects(page: AntdProPageSchema): string[] {
    const effects: string[] = []
    
    // 页面初始化效果
    effects.push(`
  useEffect(() => {
    // 页面初始化逻辑
    console.log('${page.name} 页面已加载')
  }, [])
    `)
    
    // 数据加载效果
    const dataLoaders = this.extractDataLoaders(page.components || [])
    dataLoaders.forEach(loader => {
      effects.push(`
  useEffect(() => {
    ${loader.code}
  }, [${loader.dependencies.join(', ')}])
      `)
    })
    
    return effects
  }
  
  /**
   * 生成路由配置
   */
  private async generateRouteConfig(routes: AntdProPageSchema[]): Promise<GeneratedFile> {
    const template = await this.templateEngine.getTemplate('routes')
    
    const templateData = {
      routes: routes.map(route => ({
        path: route.path,
        name: route.name,
        component: route.component,
        title: route.title,
        icon: route.icon,
        access: route.access,
        hideInMenu: route.hideInMenu,
        routes: route.routes || []
      }))
    }
    
    const code = await this.templateEngine.render(template, templateData)
    
    return {
      path: 'config/routes.ts',
      content: code,
      type: 'config'
    }
  }
  
  /**
   * 生成配置文件
   */
  private async generateConfigFiles(config: any): Promise<GeneratedFile[]> {
    const configFiles: GeneratedFile[] = []
    
    // 主配置文件
    const mainConfig = await this.generateMainConfig(config)
    configFiles.push(mainConfig)
    
    // 主题配置
    const themeConfig = await this.generateThemeConfig(config.theme)
    configFiles.push(themeConfig)
    
    // 代理配置
    const proxyConfig = await this.generateProxyConfig(config.proxy)
    configFiles.push(proxyConfig)
    
    // 构建配置
    const buildConfig = await this.generateBuildConfig(config.build)
    configFiles.push(buildConfig)
    
    return configFiles
  }
  
  /**
   * 生成样式文件
   */
  private async generateStyleFiles(schema: AntdProSchema): Promise<GeneratedFile[]> {
    const styleFiles: GeneratedFile[] = []
    
    // 全局样式
    const globalStyles = await this.generateGlobalStyles(schema)
    styleFiles.push(globalStyles)
    
    // 主题样式
    const themeStyles = await this.generateThemeStyles(schema.config.theme)
    styleFiles.push(themeStyles)
    
    // 组件样式
    for (const page of schema.pages) {
      const pageStyles = await this.generatePageStyles(page)
      if (pageStyles.content.trim()) {
        styleFiles.push(pageStyles)
      }
    }
    
    return styleFiles
  }
  
  /**
   * 生成类型定义
   */
  private async generateTypeDefinitions(schema: AntdProSchema): Promise<GeneratedFile[]> {
    const typeFiles: GeneratedFile[] = []
    
    // 全局类型定义
    const globalTypes = await this.generateGlobalTypes(schema)
    typeFiles.push(globalTypes)
    
    // 页面类型定义
    for (const page of schema.pages) {
      const pageTypes = await this.generatePageTypes(page)
      typeFiles.push(pageTypes)
    }
    
    // API 类型定义
    const apiTypes = await this.generateApiTypes(schema)
    typeFiles.push(apiTypes)
    
    return typeFiles
  }
}

// 模板引擎
export class TemplateEngine {
  private templates: Map<string, string>
  
  constructor(templateConfig: TemplateConfig) {
    this.templates = new Map()
    this.loadTemplates(templateConfig)
  }
  
  /**
   * 加载模板
   */
  private loadTemplates(config: TemplateConfig): void {
    // 页面组件模板
    this.templates.set('page', `
import React, { useState, useEffect, useCallback } from 'react'
{{#each imports}}
{{{this}}}
{{/each}}
import type { {{pageName}}Props } from './types'
import styles from './index.module.less'

const {{pageName}}: React.FC<{{pageName}}Props> = (props) => {
  {{#each hooks}}
  {{{this}}}
  {{/each}}
  
  {{#each handlers}}
  {{{this}}}
  {{/each}}
  
  {{#each effects}}
  {{{this}}}
  {{/each}}
  
  return (
    <div className={styles.container}>
      <PageContainer title="{{pageTitle}}">
        {{#each components}}
        {{{this}}}
        {{/each}}
      </PageContainer>
    </div>
  )
}

export default {{pageName}}
    `)
    
    // 路由配置模板
    this.templates.set('routes', `
export default [
  {{#each routes}}
  {
    path: '{{path}}',
    name: '{{name}}',
    component: '{{component}}',
    {{#if title}}title: '{{title}}',{{/if}}
    {{#if icon}}icon: '{{icon}}',{{/if}}
    {{#if access}}access: '{{access}}',{{/if}}
    {{#if hideInMenu}}hideInMenu: {{hideInMenu}},{{/if}}
    {{#if routes}}
    routes: [
      {{#each routes}}
      {
        path: '{{path}}',
        name: '{{name}}',
        component: '{{component}}',
        {{#if title}}title: '{{title}}',{{/if}}
      },
      {{/each}}
    ],
    {{/if}}
  },
  {{/each}}
]
    `)
    
    // 组件模板
    this.templates.set('component', `
import React from 'react'
{{#each imports}}
{{{this}}}
{{/each}}
import type { {{componentName}}Props } from './types'
import styles from './index.module.less'

const {{componentName}}: React.FC<{{componentName}}Props> = (props) => {
  const {
    {{#each props}}
    {{name}},
    {{/each}}
    ...restProps
  } = props
  
  {{#each hooks}}
  {{{this}}}
  {{/each}}
  
  {{#each handlers}}
  {{{this}}}
  {{/each}}
  
  return (
    <div className={styles.container} {...restProps}>
      {{#each children}}
      {{{this}}}
      {{/each}}
    </div>
  )
}

export default {{componentName}}
    `)
  }
  
  /**
   * 获取模板
   */
  async getTemplate(name: string): Promise<string> {
    const template = this.templates.get(name)
    if (!template) {
      throw new Error(`模板 ${name} 不存在`)
    }
    return template
  }
  
  /**
   * 渲染模板
   */
  async render(template: string, data: any): Promise<string> {
    // 使用 Handlebars 或类似的模板引擎
    return this.processTemplate(template, data)
  }
  
  /**
   * 处理模板
   */
  private processTemplate(template: string, data: any): string {
    let result = template
    
    // 简单的模板替换实现
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    })
    
    // 处理循环
    result = this.processLoops(result, data)
    
    // 处理条件
    result = this.processConditions(result, data)
    
    return result
  }
  
  /**
   * 处理循环
   */
  private processLoops(template: string, data: any): string {
    let result = template
    
    // 匹配 {{#each array}} ... {{/each}} 模式
    const loopRegex = /{{#each (\w+)}}([\s\S]*?){{\/each}}/g
    
    result = result.replace(loopRegex, (match, arrayName, content) => {
      const array = data[arrayName]
      if (!Array.isArray(array)) {
        return ''
      }
      
      return array.map(item => {
        let itemContent = content
        
        if (typeof item === 'object') {
          Object.entries(item).forEach(([key, value]) => {
            const itemRegex = new RegExp(`{{${key}}}`, 'g')
            itemContent = itemContent.replace(itemRegex, String(value))
          })
        } else {
          itemContent = itemContent.replace(/{{this}}/g, String(item))
        }
        
        return itemContent
      }).join('')
    })
    
    return result
  }
  
  /**
   * 处理条件
   */
  private processConditions(template: string, data: any): string {
    let result = template
    
    // 匹配 {{#if condition}} ... {{/if}} 模式
    const conditionRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g
    
    result = result.replace(conditionRegex, (match, condition, content) => {
      const value = data[condition]
      return value ? content : ''
    })
    
    return result
  }
}
```

## 5. 双向同步机制

### 5.1 代码变更检测

```typescript
// 代码变更检测器
export class CodeChangeDetector {
  private fileWatcher: FileWatcher
  private astParser: ASTParser
  private changeAnalyzer: ChangeAnalyzer
  
  constructor() {
    this.fileWatcher = new FileWatcher()
    this.astParser = new ASTParser()
    this.changeAnalyzer = new ChangeAnalyzer()
  }
  
  /**
   * 开始监听代码变更
   */
  startWatching(projectPath: string): void {
    this.fileWatcher.watch(projectPath, {
      ignored: /node_modules|dist|build/,
      persistent: true
    })
    
    this.fileWatcher.on('change', async (filePath: string) => {
      await this.handleFileChange(filePath)
    })
  }
  
  /**
   * 处理文件变更
   */
  private async handleFileChange(filePath: string): Promise<void> {
    try {
      // 1. 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8')
      
      // 2. 解析 AST
      const ast = await this.astParser.parse(content, filePath)
      
      // 3. 分析变更
      const changes = await this.changeAnalyzer.analyze(ast, filePath)
      
      // 4. 触发同步事件
      if (changes.length > 0) {
        this.emit('codeChanged', {
          filePath,
          changes,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('处理文件变更失败:', error)
    }
  }
  
  /**
   * 检测组件变更
   */
  async detectComponentChanges(oldAST: AST, newAST: AST): Promise<ComponentChange[]> {
    const changes: ComponentChange[] = []
    
    // 检测新增组件
    const addedComponents = this.findAddedComponents(oldAST, newAST)
    addedComponents.forEach(component => {
      changes.push({
        type: 'component_added',
        component: component,
        location: component.location
      })
    })
    
    // 检测删除组件
    const removedComponents = this.findRemovedComponents(oldAST, newAST)
    removedComponents.forEach(component => {
      changes.push({
        type: 'component_removed',
        component: component,
        location: component.location
      })
    })
    
    // 检测修改组件
    const modifiedComponents = this.findModifiedComponents(oldAST, newAST)
    modifiedComponents.forEach(({ oldComponent, newComponent }) => {
      const propertyChanges = this.detectPropertyChanges(oldComponent, newComponent)
      
      propertyChanges.forEach(change => {
        changes.push({
          type: 'component_modified',
          component: newComponent,
          location: newComponent.location,
          propertyChange: change
        })
      })
    })
    
    return changes
  }
  
  /**
   * 检测属性变更
   */
  private detectPropertyChanges(oldComponent: ComponentAST, newComponent: ComponentAST): PropertyChange[] {
    const changes: PropertyChange[] = []
    
    // 检测属性值变更
    Object.entries(newComponent.props).forEach(([key, newValue]) => {
      const oldValue = oldComponent.props[key]
      
      if (oldValue !== newValue) {
        changes.push({
          type: 'property_changed',
          property: key,
          oldValue: oldValue,
          newValue: newValue
        })
      }
    })
    
    // 检测新增属性
    Object.keys(newComponent.props).forEach(key => {
      if (!(key in oldComponent.props)) {
        changes.push({
          type: 'property_added',
          property: key,
          value: newComponent.props[key]
        })
      }
    })
    
    // 检测删除属性
    Object.keys(oldComponent.props).forEach(key => {
      if (!(key in newComponent.props)) {
        changes.push({
          type: 'property_removed',
          property: key,
          value: oldComponent.props[key]
        })
      }
    })
    
    return changes
  }
}
```

### 5.2 Schema 同步器

```typescript
// Schema 同步器
export class SchemaSynchronizer {
  private schemaStore: SchemaStore
  private changeApplier: ChangeApplier
  private conflictResolver: ConflictResolver
  
  constructor() {
    this.schemaStore = new SchemaStore()
    this.changeApplier = new ChangeApplier()
    this.conflictResolver = new ConflictResolver()
  }
  
  /**
   * 同步代码变更到 Schema
   */
  async syncCodeToSchema(changes: CodeChange[], schemaId: string): Promise<VertoSchema> {
    try {
      // 1. 获取当前 Schema
      const currentSchema = await this.schemaStore.getSchema(schemaId)
      
      // 2. 应用变更
      const updatedSchema = await this.applyChangesToSchema(currentSchema, changes)
      
      // 3. 验证 Schema 一致性
      await this.validateSchema(updatedSchema)
      
      // 4. 保存更新后的 Schema
      await this.schemaStore.saveSchema(schemaId, updatedSchema)
      
      // 5. 触发同步事件
      this.emit('schemaUpdated', {
        schemaId,
        changes,
        updatedSchema
      })
      
      return updatedSchema
    } catch (error) {
      console.error('Schema 同步失败:', error)
      throw new SyncError('Schema 同步失败', error)
    }
  }
  
  /**
   * 应用变更到 Schema
   */
  private async applyChangesToSchema(schema: VertoSchema, changes: CodeChange[]): Promise<VertoSchema> {
    let updatedSchema = { ...schema }
    
    for (const change of changes) {
      updatedSchema = await this.applyChangeToSchema(updatedSchema, change)
    }
    
    return updatedSchema
  }
  
  /**
   * 应用单个变更到 Schema
   */
  private async applyChangeToSchema(schema: VertoSchema, change: CodeChange): Promise<VertoSchema> {
    switch (change.type) {
      case 'component_added':
        return this.addComponentToSchema(schema, change)
      
      case 'component_removed':
        return this.removeComponentFromSchema(schema, change)
      
      case 'component_modified':
        return this.modifyComponentInSchema(schema, change)
      
      case 'page_added':
        return this.addPageToSchema(schema, change)
      
      case 'page_removed':
        return this.removePageFromSchema(schema, change)
      
      case 'route_changed':
        return this.updateRouteInSchema(schema, change)
      
      default:
        console.warn('未知的变更类型:', change.type)
        return schema
    }
  }
  
  /**
   * 添加组件到 Schema
   */
  private async addComponentToSchema(schema: VertoSchema, change: CodeChange): Promise<VertoSchema> {
    const newComponent: VertoComponent = {
      id: generateId(),
      type: this.mapCodeComponentToVertoType(change.component.type),
      name: change.component.name,
      props: this.mapCodePropsToVertoProps(change.component.props),
      styles: this.mapCodeStylesToVertoStyles(change.component.styles),
      events: this.mapCodeEventsToVertoEvents(change.component.events),
      children: [],
      layout: this.calculateLayoutFromCode(change.component),
      validation: [],
      permissions: []
    }
    
    // 找到父组件并添加子组件
    const parentComponent = this.findComponentByLocation(schema, change.location.parent)
    if (parentComponent) {
      parentComponent.children.push(newComponent)
    } else {
      // 如果没有父组件，添加到页面级别
      const page = this.findPageByLocation(schema, change.location.page)
      if (page) {
        page.components.push(newComponent)
      }
    }
    
    return schema
  }
  
  /**
   * 从 Schema 删除组件
   */
  private async removeComponentFromSchema(schema: VertoSchema, change: CodeChange): Promise<VertoSchema> {
    const componentId = change.component.id
    
    // 递归删除组件
    const removeFromComponents = (components: VertoComponent[]): VertoComponent[] => {
      return components.filter(component => {
        if (component.id === componentId) {
          return false
        }
        
        if (component.children) {
          component.children = removeFromComponents(component.children)
        }
        
        return true
      })
    }
    
    // 从所有页面中删除组件
    schema.pages.forEach(page => {
      page.components = removeFromComponents(page.components)
    })
    
    // 从自定义组件中删除
    schema.components = removeFromComponents(schema.components)
    
    return schema
  }
  
  /**
   * 修改 Schema 中的组件
   */
  private async modifyComponentInSchema(schema: VertoSchema, change: CodeChange): Promise<VertoSchema> {
    const component = this.findComponentById(schema, change.component.id)
    
    if (!component) {
      console.warn('未找到要修改的组件:', change.component.id)
      return schema
    }
    
    // 应用属性变更
    if (change.propertyChange) {
      switch (change.propertyChange.type) {
        case 'property_changed':
          component.props[change.propertyChange.property] = change.propertyChange.newValue
          break
        
        case 'property_added':
          component.props[change.propertyChange.property] = change.propertyChange.value
          break
        
        case 'property_removed':
          delete component.props[change.propertyChange.property]
          break
      }
    }
    
    return schema
  }
  
  /**
   * 验证 Schema 一致性
   */
  private async validateSchema(schema: VertoSchema): Promise<void> {
    // 验证组件引用
    await this.validateComponentReferences(schema)
    
    // 验证路由配置
    await this.validateRoutes(schema)
    
    // 验证数据流
    await this.validateDataFlow(schema)
    
    // 验证权限配置
    await this.validatePermissions(schema)
  }
  
  /**
   * 验证组件引用
   */
  private async validateComponentReferences(schema: VertoSchema): Promise<void> {
    const allComponents = new Set<string>()
    const referencedComponents = new Set<string>()
    
    // 收集所有组件 ID
    const collectComponentIds = (components: VertoComponent[]) => {
      components.forEach(component => {
        allComponents.add(component.id)
        if (component.children) {
          collectComponentIds(component.children)
        }
      })
    }
    
    schema.pages.forEach(page => {
      collectComponentIds(page.components)
    })
    
    collectComponentIds(schema.components)
    
    // 检查引用的组件是否存在
    const checkReferences = (components: VertoComponent[]) => {
      components.forEach(component => {
        // 检查事件中引用的组件
        component.events.forEach(event => {
          event.actions.forEach(action => {
            if (action.target && action.target.startsWith('#')) {
              const targetId = action.target.substring(1)
              referencedComponents.add(targetId)
              
              if (!allComponents.has(targetId)) {
                throw new ValidationError(`组件 ${component.id} 引用了不存在的组件 ${targetId}`)
              }
            }
          })
        })
        
        if (component.children) {
          checkReferences(component.children)
        }
      })
    }
    
    schema.pages.forEach(page => {
      checkReferences(page.components)
    })
    
    checkReferences(schema.components)
  }
}
```

## 6. 实施计划

### 6.1 开发阶段

#### 第一阶段：基础架构（4周）
- **Week 1-2**: Schema 结构设计和基础类型定义
- **Week 3-4**: 转换引擎核心架构搭建

#### 第二阶段：Pencil 集成（6周）
- **Week 5-6**: Pencil 解析器开发
- **Week 7-8**: 组件映射器实现
- **Week 9-10**: 布局计算器开发

#### 第三阶段：代码生成（4周）
- **Week 11-12**: 代码生成器核心功能
- **Week 13-14**: 模板引擎和文件管理

#### 第四阶段：双向同步（4周）
- **Week 15-16**: 代码变更检测
- **Week 17-18**: Schema 同步机制

#### 第五阶段：测试优化（2周）
- **Week 19**: 集成测试和性能优化
- **Week 20**: 文档完善和发布准备

### 6.2 技术风险评估

#### 高风险项
1. **Pencil 格式解析复杂性**
   - 风险：Pencil 文件格式可能存在版本兼容性问题
   - 缓解：建立完善的格式适配层，支持多版本兼容

2. **布局算法准确性**
   - 风险：自动布局可能无法完全还原设计意图
   - 缓解：提供手动调整机制，支持布局规则自定义

3. **代码生成质量**
   - 风险：生成的代码可能不符合最佳实践
   - 缓解：建立代码质量检查机制，提供代码优化建议

#### 中风险项
1. **性能优化**
   - 风险：大型项目转换可能存在性能瓶颈
   - 缓解：实现增量转换和缓存机制

2. **双向同步一致性**
   - 风险：代码和原型同步可能出现冲突
   - 缓解：建立冲突检测和解决机制

### 6.3 成功指标

#### 功能指标
- **转换准确率**: ≥95% 的组件能够正确转换
- **布局还原度**: ≥90% 的布局能够准确还原
- **代码质量**: 生成代码通过 ESLint 检查率 ≥95%

#### 性能指标
- **转换速度**: 中等复杂度页面转换时间 ≤10秒
- **内存使用**: 转换过程内存使用 ≤500MB
- **文件大小**: 生成代码文件大小合理，无冗余代码

#### 用户体验指标
- **学习成本**: 新用户上手时间 ≤2小时
- **操作效率**: 相比手动开发效率提升 ≥300%
- **错误率**: 用户操作错误率 ≤5%

## 7. 总结

本 Schema 设计与转换机制为 Verto 平台提供了从原型设计到代码实现的完整解决方案。通过建立标准化的中间 Schema，实现了 Pencil 原型工具与 Ant Design Pro 的无缝集成，为前端开发全流程管理奠定了坚实的技术基础。

### 核心优势

1. **标准化**: 建立了统一的 Schema 标准，确保不同工具间的兼容性
2. **自动化**: 实现了从设计到代码的自动转换，大幅提升开发效率
3. **可扩展**: 模块化的架构设计支持新组件和功能的快速集成
4. **双向同步**: 支持设计和代码的双向同步，保持一致性
5. **高质量**: 生成的代码符合最佳实践，具有良好的可维护性

### 技术创新

1. **智能布局算法**: 自动识别和转换复杂的布局结构
2. **组件映射机制**: 灵活的组件映射规则支持自定义扩展
3. **增量同步**: 高效的变更检测和增量同步机制
4. **冲突解决**: 智能的冲突检测和解决策略

通过这套完整的 Schema 设计与转换机制，Verto 平台将能够为用户提供从原型设计到代码部署的一站式解决方案，真正实现前端开发的全流程自动化管理。