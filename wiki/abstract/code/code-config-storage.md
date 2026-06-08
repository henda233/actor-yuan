---
abstract_name: code-config-storage 配置存储
source_contents:
  - "src/services/configStorage.ts"
dependencies:
  - "src/types/storage.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-08
---
# 摘要：配置存储（src/services/configStorage.ts）

## 核心结论与关键信息

- 所有配置通过 localStorage 持久化，键前缀统一为 `actor-yuan:` 做命名空间隔离
- 复杂类型（`BillingPrices`）以 JSON 序列化存储，读取时做防御性解析（失败返回 `{}`）
- `getProvider` 默认返回 `'mock'`——无 API Key 时保证应用可运行
- `getApiBaseUrl` 默认返回 `https://api.openai.com/v1`，仅 OpenAI 兼容格式使用
- **无 set 端校验**：校验职责在 UI 层，本模块仅负责读写，保持简单
- `getSystemPrompt` 不存在时返回空字符串 `''`
- `DEFAULT_SYSTEM_PROMPT` 常量含 `{stage}` 占位符，`buildSystemPrompt(stage, reasoning?)` 负责替换和追加推理内容

## 内容概述

共 8 组 getter/setter，覆盖 8 个 localStorage 键：

| localStorage 键 | getter | setter | 类型 | 默认值 |
|---|---|---|---|---|
| `actor-yuan:provider` | `getProvider` | `setProvider` | `ProviderType` | `'mock'` |
| `actor-yuan:api-key` | `getApiKey` | `setApiKey` | `string \| null` | `null` |
| `actor-yuan:api-base-url` | `getApiBaseUrl` | `setApiBaseUrl` | `string` | `https://api.openai.com/v1` |
| `actor-yuan:model` | `getModel` | `setModel` | `string \| null` | `null` |
| `actor-yuan:billing-prices` | `getBillingPrices` | `setBillingPrices` | `BillingPrices` | `{}` |
| `actor-yuan:system-prompt` | `getSystemPrompt` | `setSystemPrompt` | `string` | `''` |
| `actor-yuan:debug-mode` | `getDebugMode` | `setDebugMode` | `boolean` | `false` |

额外导出：`DEFAULT_SYSTEM_PROMPT`（常量）、`buildSystemPrompt(stage, reasoning?)`（函数）

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`（`BillingPrices`, `ProviderType` 类型）
- **下游被依赖**：`useConversation.ts`（读取 systemPrompt、debugMode）、`aiService.ts` 的调用方（读取 apiKey/model/provider/baseUrl）、`SettingsPanel.tsx`（全部 getter/setter）、`App.tsx`（debugMode）
- **变更扩散评估**：中（新增配置项只需增加一对 getter/setter + 一个 key 常量）
