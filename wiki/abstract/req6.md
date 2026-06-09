---
abstract_name: 需求6-API计费与用量追踪
source_contents:
  - "wiki/request/req6.md"
  - "wiki/plan/req6.md"
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/dataStore.tsx"
  - "src/hooks/useConversation.ts"
  - "src/components/BillingCorner.tsx"
  - "src/components/MessageBubble.tsx"
  - "src/components/SettingsPanel.tsx"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req1.md"
  - "wiki/abstract/req3.md"
  - "wiki/abstract/req5.md"
created_at: 2026-06-08
updated_at: 2026-06-09
---
# 摘要：需求6 —— API 计费与用量追踪

## 核心结论与关键信息

- **计费开关**：新增 `billingEnabled` 配置（localStorage），用户可自由开关计费。默认**开启**。关闭时 tokens 统计与展示仍常开，仅隐藏 ¥ 相关显示，费用数据后台继续计算和存储
- **价格单位**：每百万 tokens / ￥（非每千）
  - 公式：`cost = (inputTokens × inputPrice + outputTokens × outputPrice) / 1,000,000`
- **计费粒度**：双 API 调用（reasoning + narrative）合并展示在 assistant 消息气泡；retryNarrative 等单次调用独立展示
- **定价快照**：每次调用时读取当前模型价格计算费用，存入消息的 `billing` 字段。后续改价不影响历史消息
- **持久化**：累计数据存入 `AppData.billing`（`SessionBilling` 类型），随 JSON 导出导入；旧版 JSON 导入时累计归零；`billingEnabled` 是用户偏好，不随 JSON 导出导入
- **展示**：
  - 开启时：消息气泡 `输入1.2K/输出3.4K tokens · ¥0.05`；BillingCorner `输入 1.2M / 输出 3.4M tokens · ¥15.50`
  - 关闭时：消息气泡 `输入1.2K/输出3.4K tokens`；BillingCorner `输入 1.2M / 输出 3.4M tokens`
- **Token 缩略格式**：`<1000` 原始 → `1.2K`（千）→ `1.2M`（百万）→ `1.2B`（十亿），保留1位小数去尾零
- **费用格式**：`¥0.05`，保留2位小数
- **开关 + 重置入口**：SettingsPanel

## 内容概述

需求6 基于已就位的基础设施（`ChatResult.usage`、`BillingPrices`、`BillingCorner` 占位组件）补齐完整计费链路：

| 模块 | 变更 |
|---|---|
| `src/types/storage.ts` | 新增 `MessageBilling`/`SessionBilling`；`Message` 加 `billing?`；`AppData`/`ExportData` 加 `billing`；version→3 |
| `src/services/configStorage.ts` | 新增 `billingEnabled` 键名 + getter/setter（默认 `true`） |
| `src/services/billingService.ts` | **新建**：`calculateCost`/`formatTokens`/`formatCost` |
| `src/services/dataStore.tsx` | `addMessage` 加 `billing` 参数；新增 `addSessionBilling`/`resetBilling`；导入 v2→v3 迁移 |
| `src/hooks/useConversation.ts` | 所有 API 调用点捕获 usage、双调用合并、快照定价、传 billing 到 addMessage |
| `src/components/BillingCorner.tsx` | 从 dataStore 读取累计，根据 `billingEnabled` 决定展示 |
| `src/components/MessageBubble.tsx` | 根据 `message.billing` + `billingEnabled` 渲染 |
| `src/components/SettingsPanel.tsx` | 标签"每千"→"每百万"、新增计费开关 toggle、新增重置按钮 |

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/req1.md`（billing 价格配置存储）
  - `wiki/abstract/req3.md`（API 响应中的 usage 提取）
  - `wiki/abstract/req5.md`（双 API 调用流程——需在 useConversation 中合并 usage）
- **下游被依赖**：无（计费是末端展示需求）
- **变更扩散评估**：中（修改 types、configStorage、dataStore、useConversation、3 个组件，新增 1 个工具文件）
