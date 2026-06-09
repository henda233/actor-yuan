---
abstract_name: code-hooks 自定义 Hooks 与测试面板
source_contents:
  - "src/hooks/useConversation.ts"
  - "src/hooks/useExitWarning.ts"
  - "src/test/Req2Test.tsx"
dependencies:
  - "src/types/storage.ts"
  - "src/services/dataStore.tsx"
  - "src/services/aiService.ts"
  - "src/services/configStorage.ts"
  - "src/services/billingService.ts"
  - "src/services/providers/mockProvider.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-09
---
# 摘要：自定义 Hooks 与测试面板

## 核心结论与关键信息

### useConversation（核心业务 Hook）

- 管理两阶段交互流程：`chatting`（等待用户输入）↔ `reviewing_draft`（待确认草稿）
- **Phase 恢复**：初始化时检查 `data.messages` 中是否存在 `status === 'draft'` 的消息，有则初始化为 `reviewing_draft`
- **双输出模式**（需求5）：两次 API 调用——第1次 `{stage}="推演方案制定"` 获取 reasoning，第2次 `{stage}="游戏情节推演"` + reasoning 获取 narrative
- **Loading 分阶段**：`LoadingStage = 'idle' | 'reasoning' | 'narrating'`
- **第2次调用失败**：保留 reasoning 到 `pendingReasoning`，用户可 `retryNarrative` 或 `cancelPendingReasoning`
- **regenerateDraft**：复用已有 reasoning，仅重调第2次 API
- **消息过滤**：发送给 AI 前过滤 `role === 'system'` 和 `status === 'draft'` 的消息
- **错误翻译**：4 类错误 → 中文提示
- **Debug 模式**：当 `getDebugMode() === true` 时，每次 `service.chat()` 调用前捕获输入到 `debugEntries`
- **计费集成**（需求6）：所有 API 调用点通过 `makeBilling` helper 快照定价、合并双调用 usage、调用 `addSessionBilling`；reasoning 成功但 narrative 失败时仍计入 reasoning tokens

### useExitWarning

- 监听 `window.beforeunload` 事件，`dirty === true` 时触发浏览器原生"未保存更改"对话框

### Req2Test

- 需求2的手动测试面板（仅开发阶段）

## 内容概述

### useConversation 导出类型

| 导出 | 类型 | 说明 |
|---|---|---|
| `LoadingStage` | `'idle' \| 'reasoning' \| 'narrating'` | loading 分阶段类型 |
| `DebugEntry` | `{ systemPrompt, messages, stage, timestamp }` | 单次 debug 输入记录 |
| `DebugEntries` | `{ reasoning?, narrative? }` | 双阶段 debug 记录集合 |
| `useConversation` | `(aiService?: AIService) => ReturnType` | 唯一导出 Hook |

### useConversation 返回值

| 字段 | 类型 | 说明 |
|---|---|---|
| `phase` | `'chatting' \| 'reviewing_draft' \| 'editing_draft'` | 当前交互阶段 |
| `messages` | `Message[]` | 所有消息（只读） |
| `loading` | `boolean` | AI 请求进行中 |
| `loadingStage` | `LoadingStage` | 分阶段 loading 状态 |
| `error` | `string \| null` | 最近一次错误的中文描述 |
| `draftMessage` | `Message \| null` | 当前待确认的草稿 |
| `pendingReasoning` | `string \| null` | 第2次调用失败时保留的 reasoning |
| `debugEntries` | `DebugEntries` | debug 模式下的输入记录 |
| `sendMessage` | `(content: string) => Promise<void>` | 发送用户消息 → 双阶段 API 调用（含双调用 usage 合并计费） |
| `retryNarrative` | `() => Promise<void>` | 重试第2次 API 调用（含单调用计费） |
| `cancelPendingReasoning` | `() => void` | 取消 pendingReasoning |
| `setDraftContent` | `(content: string) => void` | textarea 编辑草稿内容 |
| `discardDraft` | `() => void` | 删除草稿 |
| `regenerateDraft` | `() => Promise<void>` | 复用 reasoning 重新生成情节（含单调用计费） |
| `confirmDraft` | `() => void` | 确认草稿，清除 reasoning |
| `startEditingDraft` | `() => void` | 进入编辑模式 |
| `cancelEditingDraft` | `() => void` | 取消编辑 |
| `saveEditedDraft` | `(editedContent: string) => Promise<void>` | 保存编辑（narrative-only 单调用 / full 双调用，均含计费） |
| `clearDebugEntries` | `() => void` | 清空 debug 记录 |

### 模块级 helper

| 函数 | 说明 |
|---|---|
| `makeBilling(inputTokens, outputTokens) => MessageBilling` | 快照 `getBillingPrices()[getModel()]` 价格，调用 `calculateCost` 计算费用 |

### 计费路径覆盖

| 调用路径 | 调用次数 | usage 来源 | 失败处理 |
|---|---|---|---|
| `sendMessage` | 双调用 | reasoning + narrative 合并 | narrative 失败时计入 reasoning tokens |
| `retryNarrative` | 单调用 | narrative | — |
| `regenerateDraft` | 单调用 | narrative | — |
| `saveEditedDraft` (narrative-only) | 单调用 | narrative | — |
| `saveEditedDraft` (full) | 双调用 | reasoning + narrative 合并 | narrative 失败时计入 reasoning tokens |

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`、`src/services/dataStore.tsx`、`src/services/aiService.ts`、`src/services/configStorage.ts`、`src/services/billingService.ts`、`src/services/providers/mockProvider.ts`
- **下游被依赖**：`App.tsx`（直接使用 `useConversation`、`useExitWarning`）
- **变更扩散评估**：中（`useConversation` 是核心业务 Hook，新增计费依赖 `billingService`）
