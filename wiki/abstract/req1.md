---
abstract_name: 需求1-纯前端与本地数据存储
source_contents:
  - "docs/项目文档 OUTDATE.md"
  - "wiki/request/req1.md"
  - "wiki/plan/req1.md"
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/dataStore.tsx"
  - "src/hooks/useExitWarning.ts"
  - "src/App.tsx"
  - "src/main.tsx"
dependencies:
  - "wiki/abstract/overview.md"
created_at: 2026-06-08
updated_at: 2026-06-08 17:30
---
# 摘要：需求1 —— 纯前端 + 本地 JSON 文件数据存储

## 核心结论与关键信息

- 基于 React + React Router 进行**纯前端开发**，无后端服务
- **基础配置参数**存储到 localStorage，包括但不限于：API key、模型选择、**各模型计费价格**
- **其余数据**以 JSON 文件保存，用户**手动导入导出**，包括但不限于：对话记录、游戏状态、**模组文本**
- 不依赖任何后端或云存储服务

## 内容概述

该需求定义了项目的技术架构边界：一切运行在浏览器端。数据分为两类——轻量配置走 localStorage（如 API key、模型选择、各模型输入/输出每千 token 价格），业务数据走 JSON 文件（如角色卡、游戏存档、模组文本）。用户通过导入/导出操作管理 JSON 数据。

## 依赖与影响链

- **上游依赖**：`wiki/abstract/overview.md`（项目总览）
- **下游被依赖**：`wiki/abstract/req2.md`（核心交互需要数据存储支撑）、`wiki/abstract/req4.md`（UI 需要数据读写入口）、`wiki/abstract/req6.md`（计费配置存储）、`wiki/abstract/req7.md`（模组存储与导入导出）
- **变更扩散评估**：高（数据层是所有上层功能的基础）
