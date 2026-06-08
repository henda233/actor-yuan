---
abstract_name: code-providers AI 提供商实现
source_contents:
  - "src/services/providers/openaiProvider.ts"
  - "src/services/providers/anthropicProvider.ts"
  - "src/services/providers/mockProvider.ts"
dependencies:
  - "src/types/storage.ts"
  - "src/services/aiService.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-08 21:00
---
# 摘要：AI 提供商实现（src/services/providers/*.ts）

## 核心结论与关键信息

- 三个 Provider 均实现 `AIService` 接口，对外暴露工厂函数（非类），遵循函数式风格
- **OpenAI 兼容格式**泛指所有遵循 Chat Completions 协议的服务，通过可配置 `apiBaseUrl` 路由到不同端点
- **Anthropic** 有两个关键适配：(1) system prompt 提至顶层 `system` 字段而非作为消息；(2) 消息必须 `user`/`assistant` 严格交替
- **Anthropic 角色交替策略**：连续同角色以 `\n\n` 合并；首条为 assistant 时自动插入空 user 占位
- 所有 Provider 的 `chat()` 内部 `catch` 网络异常 → `AINetworkError`；非 ok 响应通过共享的 `handleAPIError` 统一处理
- `testConnection` 发送 `{ role: 'user', content: 'ping' }` 极简消息（`max_tokens: 5`），仅验证连通性
- Mock Provider 保留 500ms 模拟延迟，返回零值 `usage`，确保无 API Key 时可调试 UI

## 内容概述

### OpenAI 兼容格式 Provider

| 项目 | 详情 |
|---|---|
| 文件 | `src/services/providers/openaiProvider.ts` |
| 工厂函数 | `createOpenAIProvider(apiKey, apiBaseUrl, model) → AIService` |
| 端点 | `{apiBaseUrl}/chat/completions`（尾部斜杠已防御性去除） |
| 认证头 | `Authorization: Bearer {apiKey}` |
| system prompt | 作为 `role: 'system'` 消息置于消息列表首位（仅当非空时） |
| token 提取 | `inputTokens ← usage.prompt_tokens`、`outputTokens ← usage.completion_tokens` |
| 响应解析 | `data.choices[0].message.content` |

### Anthropic Provider

| 项目 | 详情 |
|---|---|
| 文件 | `src/services/providers/anthropicProvider.ts` |
| 工厂函数 | `createAnthropicProvider(apiKey, model) → AIService` |
| 端点 | `https://api.anthropic.com/v1/messages`（固定，不可配置） |
| 认证头 | `x-api-key: {apiKey}` + `anthropic-version: 2023-06-01` |
| system prompt | 作为顶层 `system` 字段（不作为消息），仅当非空时发送 |
| 角色交替 | `normalizeMessages()` 内部处理（见下方） |
| max_tokens | 固定 `4096` |
| token 提取 | `inputTokens ← usage.input_tokens`、`outputTokens ← usage.output_tokens` |
| 响应解析 | `data.content[0].text` |

**`normalizeMessages()` 逻辑**：
1. 过滤 `role === 'system'` 的消息
2. 遍历消息，连续同角色以 `\n\n` 合并为一条
3. 若合并后首条为 `assistant`，在列表头部插入 `{ role: 'user', content: '' }` 占位

### Mock Provider

| 项目 | 详情 |
|---|---|
| 文件 | `src/services/providers/mockProvider.ts` |
| 工厂函数 | `createMockProvider() → AIService`（无需参数） |
| 延迟 | `chat()` 500ms，`testConnection()` 300ms |
| 返回内容 | 硬编码的奇幻叙事文本（推开石门场景） |
| usage | `{ inputTokens: 0, outputTokens: 0 }` |

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`（`Message`, `ChatResult`）、`src/services/aiService.ts`（`AIService` 接口、`AINetworkError`、`handleAPIError`）
- **下游被依赖**：`src/services/aiService.ts`（工厂函数引用三个 Provider）、`useConversation.ts`（直接引用 `createMockProvider` 作为 fallback）
- **变更扩散评估**：低（新增 Provider 只需创建新文件 + 在工厂函数加一个 case；修改现有 Provider 不影响其他 Provider；类型接口变更会影响所有 Provider 但由 TypeScript 编译器强制检查）
