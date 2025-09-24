# 项目管理模块

## 功能概述

项目管理模块提供了完整的项目生命周期管理功能，支持需求和BUG的全流程管理。

## 主要功能

### 1. 项目基础管理
- 项目类型：需求/BUG
- 项目信息：ID、关联应用、开发人员、时间节点等
- 项目状态：待开发、开发中、测试中、已上线等

### 2. Git分支管理
- 自动创建分支：需求(feature-需求ID)、BUG(fix-BUGID)
- 分支状态跟踪
- Git命令提示

### 3. 应用配置管理
- 埋点配置
- 流水线配置
- 代码审核配置

### 4. 流水线管理
- 流水线状态展示
- 阶段操作（重试、跳过、查看日志）
- 执行历史记录

## 文件结构

```
project/
├── ProjectList.vue          # 项目列表页面
├── ProjectDetail.vue        # 项目详情页面
├── Project.data.ts          # 数据模型定义
├── Project.api.ts           # API接口定义
├── components/
│   ├── ProjectModal.vue     # 项目新增/编辑模态框
│   ├── GitBranchManager.vue # Git分支管理组件
│   ├── AppConfigManager.vue # 应用配置管理组件
│   └── PipelineManager.vue  # 流水线管理组件
├── index.ts                 # 模块入口文件
└── README.md               # 说明文档
```

## 使用说明

1. 访问项目列表页面查看所有项目
2. 点击"新增"按钮创建新项目
3. 在项目详情页面管理项目的各个方面
4. 使用Git分支管理器创建和管理分支
5. 配置应用默认设置
6. 监控和操作流水线状态

## 技术栈

- Vue 3 + TypeScript
- Ant Design Vue
- JeecgBoot框架
- Vite构建工具