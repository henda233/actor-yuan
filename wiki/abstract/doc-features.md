---
abstract_name: 项目功能文档
source_contents:
  - "docs/项目功能文档.md"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req1.md"
  - "wiki/abstract/req2.md"
  - "wiki/abstract/req3.md"
  - "wiki/abstract/req4.md"
  - "wiki/abstract/req5.md"
  - "wiki/abstract/req6.md"
  - "wiki/abstract/req7.md"
  - "wiki/abstract/code/code-types.md"
  - "wiki/abstract/code/code-config-storage.md"
  - "wiki/abstract/code/code-data-store.md"
  - "wiki/abstract/code/code-ai-service.md"
  - "wiki/abstract/code/code-providers.md"
  - "wiki/abstract/code/code-hooks.md"
  - "wiki/abstract/code/code-ui-components.md"
created_at: 2026-06-08 23:59
updated_at: 2026-06-08 23:59
---
# 摘要：项目功能文档

## 核心结论与关键信息

- 面向用户但仍具技术深度的项目功能说明文档，覆盖项目概述、技术栈、架构、已实现功能、规划中功能、运行构建
- 受众：终端用户 + 开发者，偏用户视角
- 仅覆盖已交付需求（1-5 + Debug面板）和待实现需求（6、7）的概要
- 粒度中等：不深入代码细节，但包含核心流程描述和架构图

## 内容概述

`docs/项目功能文档.md` 是项目的主功能说明文档，章节如下：

1. **项目概述**：ActorYuan 定位、核心场景、关键边界
2. **技术栈**：React 19 + React Router 7 + Vite 8 + TypeScript 6
3. **项目架构**：目录结构、6 层分层架构图、核心数据流（用户输入 → 双 API 调用 → 草稿确认）
4. **已实现功能**（6 个）：纯前端存储、核心交互流程、API 兼容、UI 设计、双输出模式、Debug 面板
5. **规划中功能**（2 个）：API 计费、模组导入
6. **运行与构建**：环境要求、命令、部署方式

与原有 `docs/项目文档 OUTDATE.md`（原始需求定义）关系：独立的新文档，不替换原有文档。

## 依赖与影响链

- **上游依赖**：所有需求摘要和代码模块摘要（本文档综合了所有摘要的关键信息）
- **下游被依赖**：无（终端文档，不驱动代码变更）
- **变更扩散评估**：低（文档不影响代码，但新增需求时需要同步更新）
