---
abstract_name: 需求3-大模型API兼容
source_contents:
  - "docs/项目文档 OUTDATE.md"
  - "wiki/plan/req3.md"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req2.md"
created_at: 2026-06-08
updated_at: 2026-06-08 20:30
---
# 摘要：需求3 —— 大模型 API 兼容（OpenAI 兼容格式 / Anthropic）

## 核心结论与关键信息

- 需同时支持 **OpenAI 兼容格式**（Chat Completions 协议）和 **Anthropic**（Messages）两种 API 调用格式
- **OpenAI 兼容格式**泛指所有遵循 OpenAI Chat Completions 协议的模型服务（OpenAI、DeepSeek、vLLM、Ollama 等），不特指 OpenAI 官方。BASE URL 可配置，默认 `https://api.openai.com/v1`
- **Anthropic URL 固定**为 `https://api.anthropic.com/v1`，不可配置
- **深度思考**：不传任何思考相关参数，依赖模型默认行为（无开关 UI）
- **API Key**：只填一个（对应选定的提供商），前端 fetch 直连（接受浏览器暴露风险）
- **模型 ID**：用户自由输入，附带「测试连接」按钮（发极简消息 `"ping"` 验证）
- **CORS**：直接 fetch
- 统一内部抽象层（Provider 模式），屏蔽不同提供商的 API 差异
- **需从 API 响应中提取 token 用量信息**（输入/输出 token 数），供计费模块（req6）消费
- `chat()` 返回 `ChatResult = { content: string; usage: { inputTokens: number; outputTokens: number } }`
- `AIService` 接口新增 `testConnection(): Promise<void>` 方法
- 保留 Mock 提供商，无 API Key 时可调试 UI
- **4 类错误**：`AINetworkError`（网络）、`AIAuthError`（401/403）、`AIRateLimitError`（429）、`AIAPIError`（其他，含 statusCode）
- **Anthropic 角色交替**：系统提示词提至顶层 `system` 字段；连续同角色 `\n\n` 合并；首条 assistant 自动插入空 user 占位；`max_tokens` 固定 4096

## 内容概述

采用 Provider 模式实现统一抽象，三种实现：

| 文件 | Provider | 端点 | 备注 |
|---|---|---|---|
| `src/services/providers/openaiProvider.ts` | OpenAI 兼容 | `{baseUrl}/chat/completions` | baseUrl 可配置，token 从 `usage.prompt_tokens` / `usage.completion_tokens` |
| `src/services/providers/anthropicProvider.ts` | Anthropic | `https://api.anthropic.com/v1/messages` | URL 固定，token 从 `usage.input_tokens` / `usage.output_tokens` |
| `src/services/providers/mockProvider.ts` | Mock | 无 | 本地模拟，返回零值 usage |

工厂函数 `createAIService(config)` 位于 `src/services/aiService.ts`，按 `config.provider` 路由。

`src/services/configStorage.ts` 新增 `getProvider`/`setProvider`（默认 `'mock'`）和 `getApiBaseUrl`/`setApiBaseUrl`（默认 `https://api.openai.com/v1`）。

错误类与 `handleAPIError(response)` 共享于 `src/services/aiService.ts`，各 Provider 需要时调用。

`src/hooks/useConversation.ts` 适配 `ChatResult` 解构（`{content, usage}`），`usage` 通过 `console.debug` 输出预留计费接口，错误按类型显示中文提示。

详细执行计划见 `wiki/plan/req3.md`。

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req2.md`（核心交互 —— API 调用服务于 AI 主持人的交互流程）
- **下游被依赖**：
  - `wiki/abstract/req5.md`（双输出模式 —— 依赖 API 的思考功能）
  - `wiki/abstract/req6.md`（计费模块 —— 依赖 token 用量数据；已预留 `usage` 输出）
- **变更扩散评估**：中（API 层相对独立，但输出模式和计费需求依赖它）
