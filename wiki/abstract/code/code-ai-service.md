---
abstract_name: code-ai-service AI 服务抽象层
source_contents:
  - "src/services/aiService.ts"
dependencies:
  - "src/types/storage.ts"
  - "src/services/providers/openaiProvider.ts"
  - "src/services/providers/anthropicProvider.ts"
  - "src/services/providers/mockProvider.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-08 21:00
---
# 摘要：AI 服务抽象层（src/services/aiService.ts）

## 核心结论与关键信息

- 采用 **Provider 模式**（策略模式变体）：`createAIService(config)` 工厂函数根据 `config.provider` 路由到具体实现
- `AIService` 接口定义两个方法：`chat()` 返回 `ChatResult`（含 token 用量），`testConnection()` 发送 `"ping"` 验证连通性
- 4 类错误继承自 `Error`，`handleAPIError(response)` 统一解析 HTTP 状态码并抛出对应类型——Provider 层复用此函数，无需各自实现错误分类
- `AIServiceConfig.apiBaseUrl` 可选：OpenAI 使用，Anthropic 忽略
- API Key 由调用方从 `configStorage` 读取后注入 `AIServiceConfig`，本模块不直接访问 localStorage

## 内容概述

### 接口与类型

| 导出 | 类型 | 说明 |
|---|---|---|
| `AIService` | `interface` | `chat(messages, systemPrompt) → ChatResult`、`testConnection() → void` |
| `AIServiceConfig` | `interface` | `provider`, `apiKey`, `apiBaseUrl?`, `model` |

### 工厂函数

| 导出 | 签名 | 说明 |
|---|---|---|
| `createAIService` | `(config: AIServiceConfig) => AIService` | 按 `config.provider` 分发：`'openai'` → `createOpenAIProvider`、`'anthropic'` → `createAnthropicProvider`、`'mock'` → `createMockProvider` |

### 错误体系

| 导出 | 触发条件 | 携带信息 |
|---|---|---|
| `AINetworkError` | `fetch` 异常（网络不可达、DNS 失败、超时） | `message` |
| `AIAuthError` | HTTP 401 / 403 | `message`（含 API 返回的错误详情） |
| `AIRateLimitError` | HTTP 429 | `message` |
| `AIAPIError` | 其他 4xx / 5xx | `statusCode: number`, `message` |
| `handleAPIError` | `(response: Response) => never` | 解析响应体 → 按状态码抛出对应错误类 |

### 调用链

```
useConversation
  → createAIService(config)  ← config 来自 configStorage
    → openaiProvider / anthropicProvider / mockProvider
      → fetch (或 mock 延迟)
      → 响应 → ChatResult
      → 异常 → handleAPIError → 4 类错误 → useConversation 捕获并翻译为中文
```

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`（`Message`, `ChatResult`, `ProviderType`）、`src/services/providers/*.ts`（三个 Provider 工厂函数）
- **下游被依赖**：`useConversation.ts`（唯一直接调用方）
- **变更扩散评估**：低（接口稳定后，新增 Provider 只需新增文件 + 在 `createAIService` 中加一个 case；错误类变更只影响 `useConversation` 的错误翻译分支）
