---
abstract_name: code-types 类型定义
source_contents:
  - "src/types/storage.ts"
dependencies: []
created_at: 2026-06-08 21:00
updated_at: 2026-06-09
---
# 摘要：类型定义（src/types/storage.ts）

## 核心结论与关键信息

- 项目所有共享类型集中于此文件，是类型系统的唯一出口
- `Message.status` 可选值 `'draft' | 'confirmed'`，是需求2两阶段交互（草稿→确认）的类型基础
- `BillingPrices` 结构为 `Record<string, BillingPrice>`，以模型 ID 为键，供计费模块消费
- `ExportData.version` 已升至 `3`（需求6 加入 `billing` 字段）
- `ProviderType` 为 `'openai' | 'anthropic' | 'mock'` 字面量联合，新提供商需同步扩展该类型
- `ChatResult` 将 `content` 与 `usage` 分离，供计费模块独立消费 token 用量
- 需求6 新增 `MessageBilling`（单条消息计费快照）、`SessionBilling`（会话累计）；`Message` 加可选 `billing` 字段；`AppData`/`ExportData` 加 `billing: SessionBilling`

## 内容概述

| 类型 | 用途 | 关键字段 |
|---|---|---|
| `Message` | 单条对话消息 | `id`, `role`, `content`, `timestamp`, `status?`, `reasoning?`, `billing?` |
| `MessageBilling` | 单条消息的计费快照 | `inputTokens`, `outputTokens`, `cost` |
| `SessionBilling` | 会话累计用量与费用 | `totalInputTokens`, `totalOutputTokens`, `totalCost` |
| `BillingPrice` | 单个模型的输入/输出价格 | `inputPrice`, `outputPrice`（每百万 token） |
| `BillingPrices` | 所有模型的价格映射表 | `Record<string, BillingPrice>` |
| `ExportData` | 导出 JSON 文件结构 | `version: 3`, `exportedAt`, `module`, `messages`, `contextHistory`, `billing` |
| `AppData` | 运行时应用数据 | `module`, `messages`, `contextHistory`, `billing` |
| `ProviderType` | 支持的 AI 提供商类型 | `'openai' \| 'anthropic' \| 'mock'` |
| `ChatResult` | AI 调用返回值（统一抽象） | `content: string`, `usage: { inputTokens, outputTokens }` |

## 依赖与影响链

- **上游依赖**：无（叶子模块，不依赖其他项目文件）
- **下游被依赖**：`configStorage.ts`、`dataStore.tsx`、`aiService.ts`、三个 Provider、`useConversation.ts`、`Req2Test.tsx`、`billingService.ts`、各 UI 组件
- **变更扩散评估**：高（所有模块都引用此文件，修改类型签名会造成大范围编译错误，但这也是类型安全的好处——编译期即可捕获所有影响点）
