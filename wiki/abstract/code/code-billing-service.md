---
abstract_name: code-billing-service 计费工具函数
source_contents:
  - "src/services/billingService.ts"
dependencies:
  - "src/types/storage.ts"
created_at: 2026-06-09
updated_at: 2026-06-09
---
# 摘要：计费工具函数（src/services/billingService.ts）

## 核心结论与关键信息

- 三个纯函数，无副作用，不依赖外部状态或 DOM
- `calculateCost` 公式：`(inputTokens × inputPrice + outputTokens × outputPrice) / 1,000,000`
- `formatTokens` 缩略规则：`<1000` 原始 → `"1.2K"`（千）→ `"1.2M"`（百万）→ `"1.2B"`（十亿），保留 1 位小数并去掉末尾 `.0`
- `formatCost` 输出 `"¥0.05"` 格式，保留 2 位小数
- `stripTrailingZero` 为模块内部 helper，不导出

## 内容概述

| 导出 | 签名 | 说明 |
|---|---|---|
| `calculateCost` | `(inputTokens: number, outputTokens: number, inputPrice: number, outputPrice: number) => number` | 按每百万 token 单价计算费用 |
| `formatTokens` | `(n: number) => string` | token 数量缩略展示（K/M/B） |
| `formatCost` | `(n: number) => string` | 费用格式化，¥ 前缀 + 2 位小数 |

## 依赖与影响链

- **上游依赖**：无（纯工具函数，仅依赖 JavaScript 内置类型）
- **下游被依赖**：`src/hooks/useConversation.ts`（`calculateCost`）、`src/components/BillingCorner.tsx`（`formatTokens`/`formatCost`）、`src/components/MessageBubble.tsx`（`formatTokens`/`formatCost`）
- **变更扩散评估**：低（纯函数签名稳定，调用方仅消费返回值）
