---
abstract_name: UI/UX优化
source_contents:
  - "src/index.css"
  - "src/components/MessageBubble.css"
  - "src/components/BillingCorner.css"
  - "src/components/ChatInput.tsx"
  - "src/components/ChatInput.css"
  - "src/components/SettingsPanel.tsx"
  - "src/components/SettingsPanel.css"
  - "src/App.tsx"
  - "src/App.css"
dependencies:
  - "wiki/request/req_ui-ux-optimization.md"
  - "wiki/plan/ui-ux-optimization.md"
created_at: 2026-06-09 17:00
updated_at: 2026-06-09 17:00
---
# 摘要：UI/UX优化

## 核心结论与关键信息

- `--primary` CSS 变量定义为 `var(--blue)`（`#2563eb`），修复所有 prime 色引用（focus ring、hover 状态）
- 消息对齐方向：用户靠右（`flex-end`）、AI 靠左（`flex-start`），符合主流聊天应用惯例
- BillingCorner 从 `top:0` 移至 `top:52px`，避免遮挡 TopBar；同时改为全圆角（floating badge 形态）
- ChatInput: rows=3 + `resize: vertical` + `max-height: 50vh`
- SettingsPanel 使用 `<details>/<summary>` 分为三组：连接配置（open）、计费配置（open）、高级设置（collapsed）
- 右侧面板 `panelOpen` 为 false 时完全不挂载子组件（SettingsPanel/ModulePanel）；移除 dead CSS `.right-panel-hidden`
- S5（滚动到底部按钮）、S8（遮罩面板宽度统一）按用户要求跳过

## 内容概述

> 对 8 个 CSS/JSX/TSX 文件进行修改，修复 1 个 CSS Bug 并完成 5 项 UX/性能优化。所有改动仅涉及 CSS/TSX，不改变业务逻辑。`npx tsc --noEmit` 零错误。

## 依赖与影响链

- **上游依赖**：`wiki/request/req_ui-ux-optimization.md`（需求描述）、`wiki/plan/ui-ux-optimization.md`（执行计划）
- **下游被依赖**：无
- **变更扩散评估**：低（仅 UI 层，不影响数据流和业务逻辑）
