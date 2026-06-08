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
  - "src/components/ConfirmDraftBar.tsx"
  - "src/components/DraftContextMenu.tsx"
  - "src/components/InsertDialog.tsx"
  - "src/components/RightPanel.tsx"
  - "src/components/SettingsPanel.tsx"
  - "src/components/ModulePanel.tsx"
  - "src/components/BillingCorner.tsx"
  - "src/components/WelcomeScreen.tsx"
dependencies:
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/dataStore.tsx"
  - "src/services/aiService.ts"
  - "src/hooks/useConversation.ts"
created_at: 2026-06-08 23:00
updated_at: 2026-06-08 23:00
---
# 摘要：UI 组件层（src/components/*）

## 核心结论与关键信息

- **色彩方案**：白蓝黑主题，CSS 变量定义在 `src/index.css`（`--bg: #fff`、`--text: #1e1e2e`、`--blue: #2563eb`、`--draft: #f59e0b` 等）
- **布局**：TopBar（固定顶栏）+ MainContent（flex row：ChatArea + RightPanel）+ BillingCorner（fixed 右下）
- **无第三方 UI 库**：全部手写 CSS，`src/components/*.css` 各组件独立样式文件
- **WelcomeScreen**：Provider 为 mock 且无 API Key → 显示引导页；`开始配置` 按钮打开右侧设置面板
- **草稿交互**：段落级定位（按 `\n` 分段）、右键菜单 → InsertDialog → `【】` 包裹插入
- **RightPanel**：推挤 ChatArea（flex 布局，宽度 360px），不持久化面板状态
- **SettingsPanel**：Provider/API Key/Base URL/Model/测试连接/计费价格/系统提示词/导入导出

## 内容概述

### 组件清单

| 组件 | 文件 | 功能 |
|---|---|---|
| `TopBar` | `TopBar.tsx` | 应用标题 + 右侧面板切换按钮（☰/✕ + 文字） |
| `MessageList` | `MessageList.tsx` | 消息列表渲染，自动滚到底部，过滤 system 消息 |
| `MessageBubble` | `MessageBubble.tsx` | 单条消息气泡：用户左对齐(灰底) / AI 右对齐(浅蓝)；草稿橙色边框+badge，按 `\n` 分段渲染 `<p>`，支持段落级右键 |
| `ChatInput` | `ChatInput.tsx` | 输入框(2行 textarea) + 发送按钮；Enter 发送、Shift+Enter 换行；loading 时禁用 |
| `ConfirmDraftBar` | `ConfirmDraftBar.tsx` | 草稿确认栏：放弃草稿 / 重新生成 / 确认草稿 三按钮；loading 时全部禁用 |
| `DraftContextMenu` | `DraftContextMenu.tsx` | 固定定位右键菜单："插入判定结果"（draftInserted 后禁用）；点击外部关闭 |
| `InsertDialog` | `InsertDialog.tsx` | 模态弹窗：textarea + 取消/确认插入；确认后将内容传回父组件 |
| `RightPanel` | `RightPanel.tsx` | 面板外壳 + Tab 切换（设置/模组）；通过 `tabs` prop 配置 |
| `SettingsPanel` | `SettingsPanel.tsx` | 全部设置项：Provider 下拉、API Key(password)、Base URL(仅 OpenAI 兼容显示)、Model ID、测试连接(loading/success/error 三态)、计费价格(输入/输出每千 token + 保存)、系统提示词 textarea(等宽字体)、导入导出 |
| `ModulePanel` | `ModulePanel.tsx` | 占位："模组管理功能将在后续版本实现。" |
| `BillingCorner` | `BillingCorner.tsx` | fixed 右下角："会话用量: --"（占位，待需求6对接） |
| `WelcomeScreen` | `WelcomeScreen.tsx` | 居中引导卡片：标题/副标题/说明/"开始配置"按钮 |

### App.tsx 状态管理

| 状态 | 类型 | 说明 |
|---|---|---|
| `panelOpen` | `boolean` | 右侧面板显隐，关闭时重新检查 `isConfigured()` |
| `configured` | `boolean` | Provider 非 mock 且有 API Key → true |
| `contextMenu` | `{x, y, messageId, paragraphIndex} \| null` | 右键菜单位置与目标信息 |
| `insertDialogOpen` | `boolean` | InsertDialog 显隐 |
| `insertTarget` | `{messageId, position} \| null` | 插入目标：消息 ID + 字符偏移量 |
| `draftInserted` | `boolean` | 当前草稿是否已插入过（每草稿一次），`phase` 切回 `chatting` 时重置 |

### 段落级插入算法

```typescript
function calcInsertPosition(content: string, paragraphIndex: number): number {
  // 计算第 paragraphIndex 段末尾的字符偏移
  // 位置 = 前 N 段长度之和 + N 个 \n
}
```

### 样式架构

- `src/index.css`：CSS 变量、reset、全局 `.btn` 按钮样式（btn-confirm/discard/regenerate）
- `src/App.css`：`.app-layout`、`.app-main`、`.chat-area`、`.right-panel`、`.right-panel-hidden`、`.chat-error`
- `src/components/*.css`：各组件独立样式，无交叉引用

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`、`src/services/configStorage.ts`、`src/services/dataStore.tsx`、`src/services/aiService.ts`、`src/hooks/useConversation.ts`
- **下游被依赖**：无（UI 层为顶层，所有组件被 `App.tsx` 消费）
- **变更扩散评估**：中（修改组件接口影响 `App.tsx`；样式各组件独立，修改互不干扰）
