---
abstract_name: 修复测试发现的4个问题
source_contents:
  - "docs/issues.md"
  - "wiki/plan/fix-issues.md"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req2.md"
  - "wiki/abstract/req5.md"
  - "wiki/abstract/code/code-types.md"
  - "wiki/abstract/code/code-config-storage.md"
  - "wiki/abstract/code/code-data-store.md"
  - "wiki/abstract/code/code-ai-service.md"
  - "wiki/abstract/code/code-hooks.md"
  - "wiki/abstract/code/code-ui-components.md"
created_at: 2026-06-09
updated_at: 2026-06-09
---
# 摘要：修复测试发现的4个问题

## 核心结论与关键信息

- **问题1根因**：`useConversation` 中 `useState` 初始化函数仅在组件挂载时执行一次，`importData` 更新 `data.messages` 后 `phase` 未重新计算
  - 修复：增加 `useEffect` 监听 `data.messages` 中 draft 存在性，自动同步 `phase`
- **问题2**：`BillingCorner` 从 fixed 右下移至页面顶部居中
- **问题3+4 联合重构**：草稿编辑流程 + 单轮对话架构
  - 数据模型新增 `contextHistory: string` 累积已确认情节
  - messages 简化为 `[user, assistant]`，user 消息由代码自动拼接历史上下文 + 玩家操作
  - 草稿气泡下方按钮组：[重新生成(仅情节)] [放弃草稿] [编辑草稿] [确认草稿]
  - 编辑模式：textarea + [保存] [取消]，保存时解析 `【` 前内容加入 contextHistory 并触发 AI 重写
  - 新增 `draftEditRewriteMode` 配置（full / narrative-only），控制编辑保存后的重写行为
- **模组内容注入**：`buildSystemPrompt` 拼入 `data.module`
- **MessageBubble 状态机**：viewing（段落渲染 + 4 按钮）↔ editing（textarea + 保存/取消），按钮位于气泡内部内容下方
- **ConfirmDraftBar 已移除**，草稿操作由气泡内按钮完成；`phase !== 'chatting'` 时 ChatInput 隐藏
- **BillingCorner** 从 fixed 右下移至 fixed 视口顶部居中
- **ExportData 版本**：1 → 2（新增 `contextHistory`）

## 内容概述

4 个问题中，问题3（草稿编辑流程）和问题4（单轮对话）是核心变更，涉及数据模型、Hook 逻辑、UI 组件三层改造。问题1 是状态同步缺陷，问题2 是 CSS 调整。计划 9 步骤全部完成，`npx tsc --noEmit` 零错误。

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req2.md`（核心交互流程——草稿流程的父需求）
  - `wiki/abstract/req5.md`（双输出模式——草稿/确认逻辑的父需求）
  - 全部 6 个 code-* 摘要（涉及所有层的修改）
- **下游被依赖**：无
- **变更扩散评估**：高（数据模型、Hook、UI 三层联动，移除 ConfirmDraftBar，MessageBubble 重构）
