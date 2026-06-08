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
  - "src/services/providers/mockProvider.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-08 23:00
---
# 摘要：自定义 Hooks 与测试面板

## 核心结论与关键信息

### useConversation（核心业务 Hook）

- 管理两阶段交互流程：`chatting`（等待用户输入）↔ `reviewing_draft`（待确认/插入计算结果）
- **Phase 恢复**：初始化时检查 `data.messages` 中是否存在 `status === 'draft'` 的消息，有则初始化为 `reviewing_draft`（页面刷新不丢失状态）
- **防重复发送**：`chatting` 阶段调用 `sendMessage` 直接 `throw new Error(...)`，不依赖 UI 禁用
- **消息过滤**：发送给 AI 前过滤 `role === 'system'` 和 `status === 'draft'` 的消息，确保 AI 只看到已确认的历史
- **错误翻译**：4 类错误 → 中文提示（`AINetworkError` → "网络连接失败"、`AIAuthError` → "API Key 无效"、`AIRateLimitError` → "调用频率超限"、`AIAPIError` → "API 服务异常(statusCode)"）
- **Mock fallback**：`aiService` 参数可选，未传时默认使用 `createMockProvider()`，保证无配置时也能调通
- **token 用量**：通过 `console.debug` 输出，为需求6计费模块预留插口

### useExitWarning

- 监听 `window.beforeunload` 事件，`dirty === true` 时触发浏览器原生"未保存更改"对话框
- 依赖 `dirty` 变化重新绑定/解绑事件监听器

### Req2Test

- 需求2的手动测试面板，嵌入 `App.tsx` 中（仅开发阶段）
- 覆盖 S2（系统提示词读写）、S4（addMessage/updateMessage）、S5（sendMessage → draft、insertIntoDraft、confirmDraft、防重复、phase 恢复）
- 使用 `useRef` 避免异步测试回调中的闭包过期问题（`convRef.current` / `dataRef.current` 始终指向最新值）

## 内容概述

### useConversation 导出

| 导出 | 类型 | 说明 |
|---|---|---|
| `useConversation` | `(aiService?: AIService) => ReturnType` | 唯一导出 |

### useConversation 返回值

| 字段 | 类型 | 说明 |
|---|---|---|
| `phase` | `'chatting' \| 'reviewing_draft'` | 当前交互阶段 |
| `messages` | `Message[]` | 所有消息（只读，来自 `useDataStore`） |
| `loading` | `boolean` | AI 请求进行中 |
| `error` | `string \| null` | 最近一次错误的中文描述 |
| `draftMessage` | `Message \| null` | 当前待确认的草稿（memo 派生） |
| `sendMessage` | `(content: string) => Promise<void>` | 发送用户消息 → 获取 AI 草稿 → 进入 `reviewing_draft` |
| `insertIntoDraft` | `(position: number, text: string) => void` | 在草稿指定位置插入文本（插入游戏规则计算结果） |
| `consultDraft` | `() => void` | 确认草稿，标记为 `confirmed`，切回 `chatting` |
| `discardDraft` | `() => void` | 删除草稿消息 → `deleteMessage(draftMessage.id)` → 切回 `chatting` |
| `regenerateDraft` | `() => Promise<void>` | 删除当前草稿 → 保留历史消息 → 重新调用 AI → 新草稿（不新增用户消息）；`phase` 保持 `reviewing_draft` |

### useExitWarning 导出

| 导出 | 签名 | 说明 |
|---|---|---|
| `useExitWarning` | `(dirty: boolean) => void` | 注册/解绑 `beforeunload` 监听 |

### Req2Test 导出

| 导出 | 类型 | 说明 |
|---|---|---|
| `Req2Test` | `React.FC` | 默认导出，手动测试面板组件 |

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`、`src/services/dataStore.tsx`（`useDataStore` 含 `deleteMessage`）、`src/services/aiService.ts`（`AIService`、4 个错误类）、`src/services/configStorage.ts`（`getSystemPrompt`）、`src/services/providers/mockProvider.ts`（`createMockProvider` fallback）
- **下游被依赖**：`App.tsx`（直接使用 `useConversation`、`useExitWarning`、`Req2Test`）
- **变更扩散评估**：中（`useConversation` 是核心业务 Hook，修改其接口会影响所有使用它的组件；`useExitWarning` 和 `Req2Test` 独立性强，变更影响面小）
