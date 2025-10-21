# 组件管理方案

## 概述

本组件管理系统支持两种不同类型的组件分发方式，以满足不同场景下的组件复用需求。

## 组件分类

### 1. 独立组件（NPM包）

**适用场景：**
- 可以独立拆分的组件
- 与其他项目没有耦合关系
- 通用性强，可跨项目复用

**特点：**
- 直接编译成npm包进行发布
- 版本管理通过npm版本号控制
- 安装使用简单：`npm install @company/component-name`

**管理字段：**
- 组件名称
- 分发方式：NPM包
- 组件类型：表单组件/展示组件/布局组件/业务组件
- 技术栈：Vue3/React/Angular/Vanilla JS
- 版本号
- NPM包名
- 包仓库地址（可选）
- 描述
- 使用说明

### 2. 耦合组件（模块联邦）

**适用场景：**
- 耦合较深的组件（如业务页面）
- 可能使用不同的技术栈
- 需要与特定业务项目保持同步

**特点：**
- 通过模块联邦导出远程模块
- 通过标准工具打包为npm进行使用
- 需要指定关联项目的tag版本保证稳定性

**管理字段：**
- 组件名称
- 分发方式：模块联邦
- 组件类型：表单组件/展示组件/布局组件/业务组件/页面组件
- 技术栈：Vue3/React/Angular/Vanilla JS
- 版本号
- 关联项目
- 项目仓库地址
- Tag版本
- 远程模块名
- 描述
- 使用说明

## 核心功能

### 1. 差异化表单管理

根据选择的分发方式，表单会动态显示相应的字段：

- **NPM包类型**：显示NPM包名、包仓库地址等字段
- **模块联邦类型**：显示关联项目、项目仓库地址、Tag版本、远程模块名等字段

### 2. Tag版本管理

针对模块联邦类型的组件，提供专门的版本管理功能：

- **版本列表**：显示关联项目的所有可用Tag版本
- **版本切换**：支持切换到指定的Tag版本
- **变更查看**：可以查看不同版本之间的变更内容
- **版本刷新**：实时获取最新的版本信息

### 3. 智能操作菜单

根据组件类型提供不同的操作选项：

- **通用操作**：编辑、删除
- **模块联邦专属**：版本管理

## 使用流程

### 添加独立组件

1. 点击"新增"按钮
2. 选择分发方式为"NPM包"
3. 填写组件基本信息
4. 填写NPM包名和仓库地址
5. 保存组件信息

### 添加耦合组件

1. 点击"新增"按钮
2. 选择分发方式为"模块联邦"
3. 填写组件基本信息
4. 填写关联项目信息和Tag版本
5. 填写远程模块名
6. 保存组件信息

### 管理组件版本

1. 在组件列表中找到模块联邦类型的组件
2. 点击"版本管理"按钮
3. 查看当前版本信息和可用版本列表
4. 选择目标版本并确认切换
5. 系统自动更新组件版本信息

## 技术实现

### 前端架构

- **Vue 3** + **TypeScript**
- **Ant Design Vue** 组件库
- **Vite** 构建工具
- **Tailwind CSS** 样式框架

### 核心组件

1. **ComponentModal.vue** - 组件添加/编辑弹窗
2. **TagVersionManager.vue** - Tag版本管理组件
3. **material.data.ts** - 数据结构定义
4. **material.api.ts** - API接口定义

### 数据结构

```typescript
interface ComponentData {
  id: string;
  componentName: string;
  distributionType: 'npm' | 'federation';
  componentType: 'form' | 'display' | 'layout' | 'business' | 'page';
  techStack: 'vue3' | 'react' | 'angular' | 'vanilla';
  version: string;
  
  // NPM包相关字段
  npmPackageName?: string;
  packageRepository?: string;
  
  // 模块联邦相关字段
  relatedProject?: string;
  projectRepository?: string;
  projectTag?: string;
  remoteModuleName?: string;
  
  description?: string;
  usageInstructions?: string;
  status: string;
  createTime: string;
  updateTime: string;
}
```

## API接口

### 组件管理

- `GET /material/component/list` - 获取组件列表
- `POST /material/component/add` - 添加组件
- `PUT /material/component/edit` - 更新组件
- `DELETE /material/component/delete` - 删除组件

### 版本管理

- `GET /material/component/getProjectTags` - 获取项目Tag版本列表
- `POST /material/component/switchVersion` - 切换组件版本

## 最佳实践

### 独立组件开发

1. 确保组件无外部依赖或依赖明确声明
2. 提供完整的TypeScript类型定义
3. 编写详细的使用文档和示例
4. 遵循语义化版本控制

### 耦合组件管理

1. 定期更新Tag版本，确保稳定性
2. 在版本切换前充分测试兼容性
3. 维护详细的变更日志
4. 建立版本回滚机制

## 扩展计划

1. **自动化构建**：集成CI/CD流程，自动构建和发布组件
2. **依赖分析**：分析组件间的依赖关系
3. **使用统计**：统计组件的使用情况和热度
4. **质量评估**：集成代码质量检查和测试覆盖率
5. **文档生成**：自动生成组件文档和API说明