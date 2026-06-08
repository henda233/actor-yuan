---
plan_name: 需求2-核心交互执行计划
related_request: "wiki/request/req2.md"
status: completed
created_at: 2026-06-08
---
# 执行计划：需求2 —— AI 主持人核心交互流程

## 背景

需求1 建立了数据存储底座（类型、localStorage配置、内存数据+JSON导入导出）。需求2在此基础上构建项目核心业务逻辑——AI主持人交互的两阶段流程（草稿→确认），包括交互状态机、消息管理、提示词管理、AI服务抽象。

需求2 不涉及具体 API 调用（归属需求3）和 UI 渲染（归属需求4），但它定义了需求3和需求4之间的数据与行为契约。

## 内容

### 核心设计

**两状态交互模型：**

```
chatting ──(sendMessage)──→ waiting ──(AI returns draft)──→ reviewing_draft
                                                                    │
                                               (confirmDraft)       │
                                                                    ↓
                              chatting ←────── draft → confirmed ───┘
```

- **chatting**：无待确认草稿，用户可发送新消息触发新一轮
- **reviewing_draft**：AI 已返回草稿，用户审阅中，可插入计算结果（纯文本拼接）

**一轮交互的消息视角：**

```
User: "玩家尝试推开大门"
  → AI返回草稿 →
Assistant (draft): "你推开大门，看到一只巨龙。它喷出火焰。"
  → 用户在"它喷出火焰"前插入计算结果 →
Assistant (draft): "你推开大门，看到一只巨龙。[检定：敏捷D20=15，成功] 它喷出火焰。"
  → 用户确认 →
Assistant (confirmed): "你推开大门，看到一只巨龙。[检定：敏捷D20=15，成功] 它喷出火焰。"
  → 下一轮 AI 看到含计算结果的历史 →
```

### 关键约束

- 同一时间最多存在一个 draft 消息
- draft 消息必须是最后一条消息（用户不能在 draft 之前插入新消息）
- 确认 draft 后状态回到 chatting，消息变为 confirmed
- 插入计算结果是纯文本操作，不涉及结构化数据
- 系统提示词默认空字符串，由用户通过配置入口（需求4）填写

### 架构决策：直接操作 DataStore

useConversation hook **直接读写 DataStoreContext 的消息**，不再引入独立的 ConversationManager 层。DataStore 是消息的唯一数据源。需要在 DataStore 中新增 `updateMessage` 方法支持 draft → confirmed 状态变更。

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 扩展 Message 类型，增加 `status` 字段 | 无 | `src/types/storage.ts`（修改） | 已完成 |
| `S2` | 新增系统提示词 localStorage 读写 | 无 | `src/services/configStorage.ts`（修改） | 已完成 |
| `S3` | 定义 AI 服务接口 + mock 实现 | `S1` | `src/services/aiService.ts`（新增） | 已完成 |
| `S4` | DataStore 新增 updateMessage 方法 | `S1` | `src/services/dataStore.tsx`（修改） | 已完成 |
| `S5` | 实现 useConversation hook | `S1`, `S2`, `S3`, `S4` | `src/hooks/useConversation.ts`（新增） | 已完成 |
| `S6` | 类型检查验证 | `S1`-`S5` | `npx tsc --noEmit` | 已完成 |

## 各步骤详细说明

### S1：扩展 Message 类型

在现有 `Message` 接口中增加 `status` 字段：

```typescript
export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'draft' | 'confirmed'; // 仅 assistant 消息有效
}
```

### S2：系统提示词 localStorage 读写

在 `configStorage.ts` 中新增两个函数：

| Key | 类型 | 函数 |
|---|---|---|
| `actor-yuan:system-prompt` | `string` | `getSystemPrompt()`, `setSystemPrompt(v)` |

### S3：AI 服务接口 + mock

```typescript
// AI 服务接口
export interface AIService {
  chat(messages: Message[], systemPrompt: string): Promise<string>;
}

// Mock 实现：返回固定文本，模拟延迟
export function createMockAIService(): AIService;
```

mock 实现模拟 500ms 延迟后返回固定文本。

### S4：DataStore 新增 updateMessage

在 `DataStoreContext` 的 value 中新增 `updateMessage` 方法：

```typescript
updateMessage: (id: string, patch: Partial<Pick<Message, 'content' | 'status'>>) => void;
```

- 按 id 查找消息，合并 patch 字段
- 触发 dirty 标记

### S5：useConversation hook

直接使用 DataStoreContext，不引入独立 Manager：

```typescript
function useConversation(aiService: AIService): {
  phase: 'chatting' | 'reviewing_draft';
  messages: Message[];
  sendMessage(content: string): Promise<void>;
  insertIntoDraft(position: number, content: string): void;
  confirmDraft(): void;
};
```

内部逻辑：

- `phase` 通过 `useState` 管理
- `messages` 直接取自 `useDataStore().data.messages`
- `draftMessage` 通过 `messages.find(m => m.status === 'draft')` 定位

**`sendMessage` 流程：**
1. 断言 phase === 'chatting'，否则抛错
2. `addMessage('user', content)` → 写入 DataStore
3. 收集已 confirmed 的消息 + 当前 user 消息，调用 `aiService.chat(messages, systemPrompt)`
4. AI 返回后 `addMessage('assistant', response, { status: 'draft' })` → 写入 DataStore
5. setPhase('reviewing_draft')

**`insertIntoDraft` 流程：**
1. 断言 phase === 'reviewing_draft'，定位 draft 消息
2. 在 draft.content 的 position 处插入文本
3. `updateMessage(draft.id, { content: newContent })` → 更新 DataStore

**`confirmDraft` 流程：**
1. 断言 phase === 'reviewing_draft'，定位 draft 消息
2. `updateMessage(draft.id, { status: 'confirmed' })` → 更新 DataStore
3. setPhase('chatting')

### S6：类型检查

运行 `npx tsc --noEmit` 确保无类型错误。

## 风险与约束声明

- **单 draft 约束**：同一时间只能有一个 draft，sendMessage 时断言 phase === 'chatting'
- **draft 末端约束**：draft 必须是最后一条消息，insertIntoDraft 和 confirmDraft 依赖此前提
- **addMessage 扩展**：S5 需要 addMessage 支持传入 status，需修改 addMessage 签名或新增参数
- **异步状态**：sendMessage 期间 AI 调用进行中，调用方需自行处理 loading 态（phase 不变，但 UI 可监听 Promise）
- **与需求3的对接**：useConversation 接收 AIService 实例，需求3 提供真实实现后替换 mock 即可，无需修改 hook

## 测试验证方案

1. **类型检查**：`npx tsc --noEmit` 无错误
2. **sendMessage → draft 流程**：调用 sendMessage → phase 变为 reviewing_draft → messages 最后一条为 assistant 且 status='draft'
3. **insertIntoDraft**：调用 insertIntoDraft(5, "[检定]") → draft content 在位置5处插入文本
4. **confirmDraft**：调用 confirmDraft → draft status 变为 'confirmed' → phase 变为 chatting
5. **防重复发送**：reviewing_draft 状态下调用 sendMessage 应抛出错误
6. **提示词读写**：setSystemPrompt / getSystemPrompt 读写 localStorage 正确

## 📝 执行记录

- `2026-06-08`: S1-S6 全部执行完毕，`npx tsc --noEmit` 通过。交付物：`src/types/storage.ts`（Message.status）、`src/services/configStorage.ts`（systemPrompt读写）、`src/services/aiService.ts`（AIService接口+mock）、`src/services/dataStore.tsx`（updateMessage+addMessage扩展）、`src/hooks/useConversation.ts`（核心hook）
- `2026-06-08`: 与用户对齐需求细节（状态机、插入格式、提示词、AI服务接口、交付物范围），计划制定完成
- `2026-06-08`: 确定架构方案 B —— useConversation 直接操作 DataStore，不引入独立 ConversationManager
