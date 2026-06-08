---
plan_name: 需求3-大模型API兼容
related_request: "wiki/request/req3.md"
status: completed
created_at: 2026-06-08 19:30
---
# 执行计划：需求3 —— 大模型 API 兼容（OpenAI 兼容格式 / Anthropic）

## 背景

当前 `aiService.ts` 只有一个 Mock 实现，需要扩展为支持 OpenAI 兼容格式 / Anthropic / Mock 三种提供商，并统一返回 token 用量供后续计费模块（req6）使用。

> **OpenAI 兼容格式**泛指所有遵循 OpenAI Chat Completions 协议的模型服务（OpenAI、DeepSeek、vLLM、Ollama 等），不特指 OpenAI 官方服务。

## 内容

### 架构设计

```
           useConversation (调用方)
                    │
                    ▼
        createAIService(config)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   OpenAIProvider  AnthropicProvider  MockProvider
   (baseUrl可配)    (URL固定)         (本地模拟)
```

### 关键决策

| 决策项 | 结论 |
|---|---|
| OpenAI 格式 | 泛指所有 OpenAI Chat Completions 兼容服务，非仅 OpenAI 官方 |
| BASE URL | OpenAI 格式可配置（默认 `https://api.openai.com/v1`），Anthropic URL 固定 |
| API Key | 只填一个（对应选定的提供商），前端 fetch 直连 |
| 模型 ID | 用户自由输入，附带「测试连接」按钮 |
| 深度思考 | 不传任何思考参数，依赖模型默认行为 |
| 返回值 | `chat()` 返回 `{ content: string; usage: { inputTokens: number; outputTokens: number } }` |
| 流式响应 | 不做 |
| CORS | 浏览器直接 fetch |
| Mock 服务 | 保留，新增 `mock` 提供商选项 |
| 文件组织 | 提供商实现集中放在 `src/services/providers/` 目录下 |
| 错误分类 | 4 类：`AINetworkError` / `AIAuthError` / `AIRateLimitError` / `AIAPIError` |
| 角色交替（Anthropic） | 连续同角色以 `\n\n` 合并；首条为 assistant 时自动插入空 user |

### Token 用量提取

- **OpenAI 兼容格式**：`response.usage.prompt_tokens` → `inputTokens`，`response.usage.completion_tokens` → `outputTokens`
- **Anthropic**：`response.usage.input_tokens` → `inputTokens`，`response.usage.output_tokens` → `outputTokens`

### Anthropic 消息格式适配

Anthropic API 要求：
1. system 提示词作为顶层 `system` 字段，不作为消息
2. 消息以 `user` 开头，`user` / `assistant` 严格交替
3. 需要显式指定 `max_tokens`

正常使用流程下角色自然交替（从 user 消息开始）。对连续同角色消息做防御性合并。首条为 assistant 时自动插入空 user 占位。

### 配置存储（localStorage）

在现有 `configStorage.ts` 基础上新增：

| key | getter/setter | 类型 | 默认值 |
|---|---|---|---|
| `actor-yuan:provider` | `getProvider` / `setProvider` | `'openai' \| 'anthropic' \| 'mock'` | `'mock'` |
| `actor-yuan:api-base-url` | `getApiBaseUrl` / `setApiBaseUrl` | `string` | `'https://api.openai.com/v1'` |

### 错误分类

| 错误类 | HTTP 状态 | 场景 |
|---|---|---|
| `AINetworkError` | — | fetch 失败 / 超时 / DNS 不可达 |
| `AIAuthError` | 401, 403 | API Key 无效 |
| `AIRateLimitError` | 429 | 调用频率超限 |
| `AIAPIError` | 其他 4xx/5xx | 服务端错误，附带 `statusCode` |

`useConversation` 中按类型给出中文提示。

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 定义 `ChatResult` 类型，扩展 `AIService` 接口（含 `testConnection`），类型文件中新增 `ProviderType`，定义错误类 | 无 | `src/types/storage.ts`, `src/services/aiService.ts` | 已完成 |
| `S2` | 扩展 `configStorage`，新增 `provider` 字段的 getter/setter | `S1` | `src/services/configStorage.ts` | 已完成 |
| `S3` | 实现 `OpenAIProvider`：构造 Chat Completions 请求体、可配置 baseUrl、解析响应提取 content + usage、`testConnection` 发极简消息 | `S1` | `src/services/providers/openaiProvider.ts` | 已完成 |
| `S4` | 实现 `AnthropicProvider`：构造 Messages 请求体（system 提至顶层、处理角色交替约束）、解析响应提取 content + usage、`testConnection` 发极简消息 | `S1` | `src/services/providers/anthropicProvider.ts` | 已完成 |
| `S5` | 实现 `MockProvider`：封装现有 mock 逻辑，适配新接口 | `S1` | `src/services/providers/mockProvider.ts` | 已完成 |
| `S6` | 工厂函数 `createAIService(config)`：根据 `provider` 类型返回对应实现 | `S3,S4,S5` | `src/services/aiService.ts` | 已完成 |
| `S7` | 更新 `useConversation`：适配 `ChatResult` 返回值，分类错误提示 | `S6,S2` | `src/hooks/useConversation.ts` | 已完成 |
| `S8` | `npx tsc --noEmit` 类型检查 | `S7` | 无 | 已完成 |
| `S9` | 补充 `apiBaseUrl` 配置与 getter/setter，OpenAIProvider 使用可配置 endpoint | `S3` 用户反馈 | `src/services/configStorage.ts`, `src/services/aiService.ts`, `src/services/providers/openaiProvider.ts` | 已完成 |

## 风险与约束声明

1. **Anthropic 消息角色交替约束**：正常流程下角色自然交替（从 user 开始）。连续同角色消息以 `\n\n` 合并；首条为 assistant 时自动插入空 user 占位。
2. **API Key 浏览器暴露**：已知风险，用户已接受。
3. **深度思考参数**：不传任何思考相关参数，依赖模型默认行为。
4. **OpenAI 格式非仅特指 OpenAI**：OpenAI 格式指遵循 Chat Completions 协议的任意服务，通过 baseUrl 区分和路由。

## 测试验证方案

1. `npx tsc --noEmit` 通过，无类型错误
2. Mock 模式：启动 dev server，发送消息，确认 AI 模拟回复正常返回，返回值为 `ChatResult` 结构
3. 第一层（浏览器控制台）：验证 `getProvider`/`setProvider`、`getApiBaseUrl`/`setApiBaseUrl` 读写、`createAIService` mock 实例化、`chat` 返回 `{content, usage}`、`testConnection` 不抛错
4. 第二层（Req2Test 面板）：完整回归 sendMessage → draft → insert → confirm 流程，phase 切换正常
5. 第三层（真 API）：OpenAI 兼容格式和 Anthropic 的 testConnection、chat（短回复、多轮、系统提示词、连续同角色合并、首条 assistant 防御）
6. 第四层（错误场景）：无效 Key → `AIAuthError`、不可达 URL → `AINetworkError`、无效模型 → `AIAPIError`

## 📝 执行记录

- `2026-06-08 19:30`: 计划已生成，与用户对齐全部关键决策
- `2026-06-08 20:00`: S1-S8 全部执行完毕，`npx tsc --noEmit` 通过
- `2026-06-08 20:15`: S9 补充 OpenAILikeProvider 可配置 baseUrl（默认 `https://api.openai.com/v1`），支持任意 OpenAI 兼容格式的模型服务
- `2026-06-08 20:30`: 更新 WIKI 记忆库（计划、摘要、index），补充错误分类、baseUrl 决策、完整测试方案
