---
abstract_name: code-ui-components UI组件层
source_contents:
  - "src/App.tsx"
  - "src/App.css"
  - "src/index.css"
  - "src/components/TopBar.tsx"
  - "src/components/MessageList.tsx"
  - "src/components/MessageBubble.tsx"
  - "src/components/ChatInput.tsx"
  - "src/components/RightPanel.tsx"
  - "src/components/SettingsPanel.tsx"
  - "src/components/ModulePanel.tsx"
  - "src/components/BillingCorner.tsx"
  - "src/components/WelcomeScreen.tsx"
  - "src/components/DebugPanel.tsx"
  - "src/components/Dialog.tsx"
  - "src/components/DataEditorPanel.tsx"
dependencies:
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/dataStore.tsx"
  - "src/services/billingService.ts"
  - "src/services/aiService.ts"
  - "src/hooks/useConversation.ts"
created_at: 2026-06-08 23:00
updated_at: 2026-06-09
---
# 摘要：UI 组件层（src/components/*）

## 核心结论与关键信息

- **色彩方案**：白蓝黑主题，CSS 变量定义在 `src/index.css`
- **布局**：TopBar + MainContent（flex row：ChatArea + RightPanel）+ BillingCorner（fixed 顶部居中）+ DebugPanel（overlay 遮罩）
- **无第三方 UI 库**：全部手写 CSS
- **WelcomeScreen**：Provider 为 mock 且无 API Key → 显示引导页
- **草稿交互**：需求5起改为 textarea 自由编辑；需求修复后改为 viewing（段落 + 4 按钮）↔ editing（textarea + 保存/取消）状态机，ConfirmDraftBar 已移除
- **推演方案折叠**：MessageBubble 中 `<details>` 默认折叠显示 reasoning
- **Debug 模式**：SettingsPanel 开关 → TopBar 显示 Debug 按钮 → DebugPanel 右侧遮罩面板
- **计费展示**（需求6）：
  - `BillingCorner`：从 dataStore 读取 `data.billing` 累计，`getBillingEnabled()` 控制费用显隐；无数据时显示 `--`
  - `MessageBubble`：`message.billing` 存在时渲染计费行（`.msg-billing`），根据 `getBillingEnabled()` 决定是否显示 ¥
  - `SettingsPanel`：标签"每百万 token"、计费开关 toggle（`billingEnabled`）、重置会话用量按钮

## 内容概述

### 组件清单

| 组件 | 文件 | 功能 |
|---|---|---|
| `TopBar` | `TopBar.tsx` | 应用标题 + Debug 按钮(debugMode 时) + 右侧面板切换按钮 |
| `MessageList` | `MessageList.tsx` | 消息列表渲染，自动滚到底部，过滤 system 消息 |
| `MessageBubble` | `MessageBubble.tsx` | 消息气泡；draft viewing（段落 + 4 按钮）↔ editing（textarea + 保存/取消）状态机；计费行展示（tokens + 可选费用） |
| `ChatInput` | `ChatInput.tsx` | 输入框 + 发送按钮；分阶段 loading 文案；pendingReasoning 重试/取消 UI |
| `RightPanel` | `RightPanel.tsx` | 面板外壳 + Tab 切换（设置/模组） |
| `SettingsPanel` | `SettingsPanel.tsx` | Provider/API Key/Base URL/Model/测试连接/计费价格（每百万token）/计费开关/重置用量/系统提示词/Debug开关/草稿重写模式/导入导出 |
| `ModulePanel` | `ModulePanel.tsx` | 模组管理：文件导入(.txt/.md)、textarea编辑、替换/追加、元信息展示 |
| `BillingCorner` | `BillingCorner.tsx` | fixed 顶部居中会话用量显示；`输入 1.2M / 输出 3.4M tokens · ¥15.50`（开启）/ 隐藏 ¥（关闭） |
| `WelcomeScreen` | `WelcomeScreen.tsx` | 居中引导卡片 |
| `DebugPanel` | `DebugPanel.tsx` | 右侧遮罩面板，双阶段 AI 输入展示（系统提示词 + 可折叠消息列表） |
| `Dialog` | `Dialog.tsx` | 通用弹窗：遮罩+居中卡片，多按钮配置，风格统一 |
| `DataEditorPanel` | `DataEditorPanel.tsx` | 数据编辑遮罩面板（z-index:99）：module/contextHistory/messages 三区域，textarea 实时编辑 |

### App.tsx 状态管理

| 状态 | 类型 | 说明 |
|---|---|---|
| `panelOpen` | `boolean` | 右侧设置面板显隐，关闭时刷新 `configured` 和 `debugMode` |
| `debugPanelOpen` | `boolean` | Debug 面板显隐 |
| `configured` | `boolean` | Provider 非 mock 且有 API Key |
| `debugMode` | `boolean` | 从 localStorage 读取，控制 Debug 按钮显隐和输入捕获 |

### 样式架构

- `src/index.css`：CSS 变量、reset、全局 `.btn` 样式
- `src/App.css`：布局样式
- `src/components/*.css`：各组件独立样式（含 `.msg-billing` 计费行样式）
- `src/components/Dialog.css`：弹窗遮罩+居中卡片样式
- `DebugPanel.css`：遮罩层 + 右侧面板 + code block + 消息折叠

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`、`src/services/configStorage.ts`、`src/services/dataStore.tsx`、`src/services/billingService.ts`、`src/hooks/useConversation.ts`
- **下游被依赖**：无（UI 层为顶层）
- **变更扩散评估**：中
