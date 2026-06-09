---
plan_name: UI/UX优化
related_request: "wiki/request/req_ui-ux-optimization.md"
status: completed
created_at: 2026-06-09
---
# 执行计划：UI/UX 优化

基于代码审查发现的 1 个 Bug 和 7 个优化点，按优先级递减排列。

## 内容

### 问题清单

| # | 问题 | 类型 | 优先级 |
|---|---|---|---|
| 1 | CSS 变量 `--primary` 未定义，focus ring 失效 | Bug | P0 |
| 2 | 消息对齐方向反直觉（用户左/AI右） | UX | P1 |
| 3 | BillingCorner 与 TopBar 视觉重叠 | UX | P1 |
| 4 | ChatInput 只有 2 行且不可 resize | UX | P2 |
| 5 | 缺少滚动到底部按钮 | UX | P2 |
| 6 | 设置面板内容过长无分组折叠 | UX | P2 |
| 7 | 右侧面板关闭时仍挂载子组件 | 性能 | P3 |
| 8 | DebugPanel(480px) 与 DataEditorPanel(80vw) 宽度策略不一致 | 一致性 | P3 |

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 修复 CSS 变量 `--primary` 未定义：在 `index.css` 的 `:root` 中添加 `--primary` 变量 | 无 | `src/index.css` | 已完成 |
| `S2` | 交换消息对齐方向：用户消息靠右、AI 消息靠左 | 无 | `src/components/MessageBubble.css` | 已完成 |
| `S3` | BillingCorner 下移避免遮挡 TopBar：`top: 52px` 或使用 `top` 偏移 | 无 | `src/components/BillingCorner.css` | 已回滚 |
| `S4` | ChatInput textarea 改为 3 行 + 允许 resize + max-height: 50vh | 无 | `src/components/ChatInput.tsx`, `ChatInput.css` | 已完成 |
| `S5` | ~~添加滚动到底部浮动按钮~~ | 无 | — | 已跳过 |
| `S6` | 设置面板分组折叠：使用 `<details>` 将设置项分为"连接配置""计费配置""高级设置"三组 | 无 | `src/components/SettingsPanel.tsx`, `SettingsPanel.css` | 已完成 |
| `S7` | 右侧面板条件挂载：`panelOpen` 为 false 时不渲染子组件 | 无 | `src/App.tsx` | 已完成 |
| `S8` | ~~统一遮罩面板宽度~~ | 无 | — | 已跳过 |

## 风险与约束声明

- S2 改变消息对齐方向可能影响用户已有习惯（但更符合主流聊天应用惯例）
- S7 条件挂载可能导致 SettingsPanel 打开时状态重新初始化（但配置存储在 localStorage，即时读取，无影响）
- 所有改动仅涉及 CSS/TSX，不改变业务逻辑

## 测试验证方案

1. `npx tsc --noEmit` 零错误
2. 手动验证：focus ring 在 textarea 聚焦时可见
3. 手动验证：用户消息在右侧、AI 消息在左侧
4. 手动验证：BillingCorner 不再遮挡 TopBar
5. 手动验证：ChatInput 可拖拽调整高度
6. 手动验证：上翻消息后出现"回到底部"按钮
7. 手动验证：设置面板三组可折叠
8. 手动验证：打开关闭右侧面板功能正常

## 执行记录

- `2026-06-09`: 计划已生成
- `2026-06-09 17:00`: 全部交付（S5/S8 跳过）。S1: `--primary: var(--blue)` 补充到 `:root`；S2: 交换 .msg-user-wrapper/.msg-ai-wrapper 的 align-self；S3: ~~BillingCorner top:0→52px + 全圆角~~ 已回滚；S4: ChatInput rows=2→3 + resize:vertical + max-height:50vh；S6: SettingsPanel 三组 details/summary 折叠（连接配置/计费配置 open，高级设置 collapsed）；S7: App.tsx panelOpen 条件挂载 aside，移除 dead CSS right-panel-hidden。`npx tsc --noEmit` 零错误
