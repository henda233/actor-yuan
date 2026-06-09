---
abstract_name: 需求5-AI主持人双输出模式
source_contents:
  - "docs/项目文档 OUTDATE.md"
  - "wiki/plan/req5.md"
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/dataStore.tsx"
  - "src/hooks/useConversation.ts"
  - "src/components/MessageBubble.tsx"
  - "src/components/MessageBubble.css"
  - "src/components/MessageList.tsx"
  - "src/components/ChatInput.tsx"
  - "src/components/ChatInput.css"
  - "src/App.tsx"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req2.md"
  - "wiki/abstract/req3.md"
  - "wiki/abstract/code/code-types.md"
  - "wiki/abstract/code/code-config-storage.md"
  - "wiki/abstract/code/code-ai-service.md"
  - "wiki/abstract/code/code-hooks.md"
  - "wiki/abstract/code/code-ui-components.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 摘要：需求5 —— AI 主持人双输出模式

## 核心结论与关键信息

- AI主持人进行情节推演时采用**链式思维双输出**：
  1. **推演方案/思路**（中间产物）：对用户默认隐藏（可折叠展开），指导后续情节推演
  2. **游戏情节正文**：最终呈现给用户的叙事内容
- 实现方案：**两次 API 调用**（方案 A）
  - 第1次：提示词 `{stage}="推演方案制定"` → 获取 reasoning
  - 第2次：提示词 `{stage}="游戏情节推演"` + reasoning 拼接至系统提示词 → 获取 narrative
- **推演方案存储**：`Message.reasoning?: string`（与情节消息同对象）
- **推演方案不持久化**：`confirmDraft` 时清除 reasoning（`reasoning: undefined`），不纳入导出 JSON
- **草稿编辑方式变更**：从"右键段落插入"改为 **textarea 自由编辑**整个草稿内容
- **Loading 分阶段**：`LoadingStage = 'idle' | 'reasoning' | 'narrating'`，"AI 正在推演剧情思路..." → "AI 正在输出游戏情节..."
- **regenerateDraft**仅重生成情节正文，复用已有 reasoning（仅第2次 API 调用）
- **第2次调用失败处理**：保留 reasoning 在 `pendingReasoning` 状态，用户可 `retryNarrative` 或 `cancelPendingReasoning`（删除触发用户消息）

## 内容概述

### 数据流

```
用户输入 → addMessage('user')
  → loadingStage='reasoning'
  → service.chat(messages, buildPrompt('推演方案制定'))
  → reasoning
  → loadingStage='narrating'
  → service.chat(messages, buildPrompt('游戏情节推演') + reasoning)
  → narrative
  → addMessage('assistant', narrative, 'draft', reasoning)
  → [用户 textarea 自由编辑草稿]
  → confirmDraft → 清除 reasoning, status='confirmed'
```

### 系统提示词模板

默认提示词含 `{stage}` 占位符，`buildSystemPrompt(stage, reasoning?)` 负责：
1. 读取用户提示词 → 替换 `{stage}` 
2. 若 reasoning 存在，追加 `\n\n## 推演方案\n${reasoning}`

### 涉及变更范围

| 文件 | 变更类型 |
|---|---|
| `src/types/storage.ts` | Message 新增 `reasoning?: string` |
| `src/services/configStorage.ts` | 新增 `DEFAULT_SYSTEM_PROMPT` 常量 + `buildSystemPrompt(stage, reasoning?)` |
| `src/services/dataStore.tsx` | `addMessage` 增加 `reasoning` 参数；`updateMessage` patch 类型扩展 `reasoning` |
| `src/hooks/useConversation.ts` | 双阶段 API 调用、`LoadingStage`、`setDraftContent`、`retryNarrative`、`cancelPendingReasoning`、移除 `insertIntoDraft` |
| `src/components/MessageBubble.tsx` | 草稿 → textarea（整个内容编辑）+ `<details>` collapsible reasoning 区块 |
| `src/components/MessageBubble.css` | 新增 `.msg-reasoning`、`.msg-draft-textarea` 样式 |
| `src/components/MessageList.tsx` | 精简 props：移除 `draftInserted`/`onDraftContextMenu`，新增 `onDraftContentChange` |
| `src/components/ChatInput.tsx` | 分段 loading 文案 + `pendingReasoning` 重试/取消 UI |
| `src/components/ChatInput.css` | 新增 `.chat-retry-hint`、`.chat-retry-actions` |
| `src/components/ConfirmDraftBar.tsx` | 提示文案更新 + `loadingStage` 分阶段显示 |
| `src/App.tsx` | 移除 contextMenu/insertDialog/draftInserted 状态和 DraftContextMenu/InsertDialog 组件引用 |
| `DraftContextMenu.tsx/.css` | **删除**（右键段落插入已废弃） |
| `InsertDialog.tsx/.css` | **删除**（右键段落插入已废弃） |

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req2.md`（核心交互流程 —— 输出模式服务于草稿流程）
  - `wiki/abstract/req3.md`（API 兼容 —— Provider 层无需改动，双调用在 Hook 层实现）
- **下游被依赖**：无
- **变更扩散评估**：中（涉及 8+ 文件修改 + 4 文件删除；核心变更为 Hook 层，UI 层为配套适配）
