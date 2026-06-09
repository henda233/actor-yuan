---
plan_name: 需求6-API计费与用量追踪
related_request: "wiki/request/req6.md"
status: completed
created_at: 2026-06-09
updated_at: 2026-06-09
---

# 执行计划：API 计费与用量追踪

## 背景与目的

需求1-5 已实现了双 API 调用（reasoning + narrative）流程，`ChatResult` 已返回 token 用量，SettingsPanel 已有价格配置 UI，BillingCorner 占位组件已存在。需求6 在此基础上补齐计费计算、累计追踪、UI 展示和数据持久化。

**本次计划的核心变更**：增加"是否计费"开关（`billingEnabled`），用户可自由开关计费功能。关闭时，token 统计仍保持开启并展示，仅隐藏费用（¥）相关显示。费用数据在后台继续计算和存储。

## 计费开关行为规范

| 状态 | tokens 统计 | tokens 展示 | 费用计算 | 费用展示 | 费用存储 |
|---|---|---|---|---|---|
| 开启 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 关闭 | ✅ | ✅ | ✅ | ❌ 隐藏 | ✅ 后台累加 |

- **默认值**：首次使用（无 localStorage）时默认**开启**
- **开关位置**：SettingsPanel
- **MessageBilling.cost**：关闭期间仍存实际计算值

### 各组件展示差异

**BillingCorner**：
- 开启：`输入 1.2M / 输出 3.4M tokens · ¥15.50`
- 关闭：`输入 1.2M / 输出 3.4M tokens`

**MessageBubble**：
- 开启：`输入1.2K/输出3.4K tokens · ¥0.05`
- 关闭：`输入1.2K/输出3.4K tokens`

## 影响范围总览

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `src/types/storage.ts` | 修改 + 新增 | 新增 `MessageBilling`/`SessionBilling` 类型；`Message` 加可选 `billing`；`AppData`/`ExportData` 加 `billing` 字段；`ExportData.version` → 3 |
| `src/services/configStorage.ts` | 修改 | 新增 `billingEnabled` 键名、`getBillingEnabled`/`setBillingEnabled` |
| `src/services/billingService.ts` | **新建** | 计费计算 + token/费用格式化工具函数 |
| `src/services/dataStore.tsx` | 修改 | `AppData` 加 `billing`、`addMessage` 加 `billing` 参数、新增 `addSessionBilling`/`resetBilling`、导入迁移 v2→v3 |
| `src/hooks/useConversation.ts` | 修改 | 所有 API 调用点捕获 usage、合并双调用、快照定价、附加 billing 到消息、更新累计 |
| `src/components/BillingCorner.tsx` | 重写 | 从 dataStore 读取累计，读取 `billingEnabled` 决定是否展示费用 |
| `src/components/MessageBubble.tsx` | 修改 | 读取 `billingEnabled`，有 `billing` 时展示用量行（费用按开关决定） |
| `src/components/SettingsPanel.tsx` | 修改 | 标签"每千"→"每百万"、新增计费开关 toggle、新增重置计费按钮 |

## 数据模型设计

### 新增类型

```typescript
// 单条消息的计费快照
export interface MessageBilling {
  inputTokens: number;
  outputTokens: number;
  cost: number; // 已按调用时价格计算（无论开关状态都存储实际值）
}

// 会话累计
export interface SessionBilling {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number; // 无论开关状态都累加
}
```

### 变更后的 Message

```typescript
export interface Message {
  // ... 现有字段不变
  billing?: MessageBilling; // 仅有 API 调用的 assistant 消息携带
}
```

### 变更后的 AppData

```typescript
export interface AppData {
  module: string;
  messages: Message[];
  contextHistory: string;
  billing: SessionBilling; // 新增，初始值均为 0
}
```

### 变更后的 ExportData（version 3）

```typescript
export interface ExportData {
  version: 3;
  exportedAt: string;
  module: string;
  messages: Message[];
  contextHistory: string;
  billing: SessionBilling; // 新增
}
```

### configStorage 新增

```typescript
// 键名
billingEnabled: 'actor-yuan:billing-enabled'

// getter/setter
export function getBillingEnabled(): boolean {
  return localStorage.getItem(KEYS.billingEnabled) !== 'false'; // 默认 true
}

export function setBillingEnabled(value: boolean): void {
  localStorage.setItem(KEYS.billingEnabled, String(value));
}
```

> `billingEnabled` 是用户偏好配置，存储在 localStorage 而非 AppData/ExportData。不计入会话导出导入。

### 导入迁移策略

- `version === 3`：直接读取 `billing`
- `version <= 2`：`billing` 初始化为零（`{ totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 }`）

## 工具函数（`src/services/billingService.ts`）

| 函数 | 签名 | 说明 |
|---|---|---|
| `calculateCost` | `(inputTokens, outputTokens, inputPrice, outputPrice) => number` | 公式：`(inputTokens × inputPrice + outputTokens × outputPrice) / 1_000_000` |
| `formatTokens` | `(n: number) => string` | 缩略格式：`<1000` 原始 → `1.2K`（千）→ `1.2M`（百万）→ `1.2B`（十亿），保留 1 位小数，去掉末尾 `.0` |
| `formatCost` | `(n: number) => string` | `¥0.05`，保留 2 位小数 |

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 数据模型扩展：新增 `MessageBilling`/`SessionBilling` 类型；`Message` 加 `billing?`；`AppData`/`ExportData` 加 `billing`；`ExportData.version` → `3` | 无 | `src/types/storage.ts` | 已完成 |
| `S2` | configStorage 扩展：新增 `billingEnabled` 键名、`getBillingEnabled`/`setBillingEnabled`（默认 `true`） | 无 | `src/services/configStorage.ts` | 已完成 |
| `S3` | 创建计费工具函数：`calculateCost`、`formatTokens`、`formatCost` | `S1` | `src/services/billingService.ts`（新建） | 已完成 |
| `S4` | dataStore 扩展：`initialData` 加 `billing` 默认值；`addMessage` 加可选 `billing` 参数；新增 `addSessionBilling` / `resetBilling` 方法；导出含 `billing`（v3）；导入兼容 v2→v3 迁移 | `S1` | `src/services/dataStore.tsx` | 已完成 |
| `S5` | useConversation 集成计费：`sendMessage` 捕获双调用 usage 并合并；`retryNarrative`、`regenerateDraft`、`saveEditedDraft` 捕获单/双调用 usage；所有路径调用 `calculateCost`（快照 `getBillingPrices`）+ `addSessionBilling` | `S3`, `S4` | `src/hooks/useConversation.ts` | 已完成 |
| `S6` | BillingCorner 重写：从 `useDataStore` 读取 `data.billing`，用 `formatTokens`/`formatCost` 展示累计；读取 `billingEnabled`，关闭时只展示 tokens 不含 ¥ | `S2`, `S4` | `src/components/BillingCorner.tsx` | 已完成 |
| `S7` | MessageBubble 展示：读取 `message.billing`，存在时展示用量行；读取 `billingEnabled`，关闭时只展示 `输入x/输出y tokens`，开启时追加 ` · ¥z` | `S1`, `S2` | `src/components/MessageBubble.tsx` | 已完成 |
| `S8` | SettingsPanel 更新：计费标签"每千 token"→"每百万 token"；新增"计费功能"开关 toggle（`billingEnabled`）；新增"重置会话用量"按钮（调用 `resetBilling`） | `S2`, `S4` | `src/components/SettingsPanel.tsx` | 已完成 |
| `S9` | TypeScript 编译检查 + 一致性验证 | `S1`–`S8` | `npx tsc --noEmit` | 已完成 |

## 各调用路径的 usage 捕获说明

### sendMessage（双调用）
```
reasoning call → usage1 (当前未捕获 → 需加上)
narrative call → usage2 (当前已捕获但仅 console.debug)
合并 → { inputTokens: u1+u2, outputTokens: u1+u2 }
计算 cost（快照价格）→ addMessage('assistant', ..., billing) + addSessionBilling(billing)
```

### retryNarrative（单调用）
```
narrative call → usage (当前已捕获)
直接使用 → addMessage('assistant', ..., billing) + addSessionBilling(billing)
```

### regenerateDraft（单调用）
```
narrative call → usage (当前已捕获)
直接使用 → addMessage('assistant', ..., billing) + addSessionBilling(billing)
```

### saveEditedDraft — narrative-only 模式（单调用）
```
narrative call → usage (当前已捕获)
直接使用 → updateMessage 后手动 addSessionBilling（因为不走 addMessage）
```

### saveEditedDraft — full 模式（双调用）
```
reasoning call → usage1 (当前未捕获 → 需加上)
narrative call → usage2 (当前已捕获)
合并 → updateMessage 后手动 addSessionBilling
```

> 所有路径中，`cost` 始终计算并存储。展示层（BillingCorner、MessageBubble）根据 `billingEnabled` 决定是否显示 ¥。

## dataStore 接口变更

```typescript
interface DataStoreContextValue {
  // ... 现有方法不变
  addMessage: (
    role: Message['role'],
    content: string,
    status?: Message['status'],
    reasoning?: string,
    billing?: MessageBilling  // NEW
  ) => void;
  addSessionBilling: (billing: MessageBilling) => void; // NEW
  resetBilling: () => void;                              // NEW
}
```

`addSessionBilling` 的逻辑：将传入的 `MessageBilling` 各项累加到 `data.billing` 的对应字段。

对于 `saveEditedDraft`（走 `updateMessage` 而非 `addMessage`），需单独调用 `addSessionBilling` 更新累计。

## 风险与约束声明

- **saveEditedDraft 不新建消息**：通过 `updateMessage` 更新现有草稿，因此计费信息需通过 `updateMessage` 的 patch 参数附加到 message 的 `billing` 字段，同时调用 `addSessionBilling` 更新累计。需要扩展 `updateMessage` 的 patch 类型以支持 `billing`。
- **旧版 JSON 兼容**：导入不含 billing 的 v1/v2 数据时累计归零（`SessionBilling` 默认值），不尝试根据消息反算。
- **Mock 模式**：Mock provider 返回零值 usage，不影响计费逻辑，自然兼容。
- **价格快照**：费用在调用时计算并存入消息。后续修改价格不影响历史消息的计费展示。
- **billingEnabled 不随 JSON 导出导入**：这是用户偏好配置（localStorage），不属于会话数据。导入他人 JSON 不会覆盖自己的开关偏好。

## 测试验证方案

1. **计费计算正确性**：手动计算 `(1500 × 2 + 3000 × 4) / 1000000 = 0.015`，验证 `calculateCost` 返回值
2. **formatTokens**：`0` → `"0"`, `500` → `"500"`, `1500` → `"1.5K"`, `1500000` → `"1.5M"`
3. **formatCost**：`0.015` → `"¥0.02"`, `1.5` → `"¥1.50"`
4. **开关默认值**：清除 localStorage，刷新页面 → 计费默认开启 → BillingCorner 显示 ¥
5. **关闭计费**：SettingsPanel 关闭计费 → BillingCorner 只显示 tokens 不含 ¥；MessageBubble 只显示 tokens 不含 ¥；检查 `data.billing.totalCost` 仍在增长
6. **重新开启**：SettingsPanel 开启计费 → BillingCorner 和 MessageBubble 恢复显示 ¥（含关闭期间累计的费用）
7. **双调用合并**：Mock 模式下发送消息，验证消息气泡显示合并后的 usage，验证 BillingCorner 累计累加
8. **retryNarrative** 使用 pending reasoning 重新生成，验证新消息独立展示单次计费
9. **saveEditedDraft** 编辑草稿后保存，验证计费更新到消息
10. **导出导入**：导出 JSON → 检查 version=3 且 billing 字段存在 → 刷新页面 → 导入 → BillingCorner 恢复累计；billingEnabled 开关状态不受导入影响
11. **旧版导入**：导入 v2 JSON → 累计归零
12. **重置**：点击重置按钮 → BillingCorner 归零
13. **换模型**：中途切换模型并修改价格 → 新消息按新价格计费，旧消息保留旧价格
14. `npx tsc --noEmit` 零错误

## 📝 执行记录

- `2026-06-09`: 计划已生成
- `2026-06-09`: 计划修订 —— 新增 `billingEnabled` 开关（默认开启）、关闭时 tokens 统计常开仅隐藏费用、开关存放 SettingsPanel
- `2026-06-09`: **全部交付（S1-S9）**：数据模型扩展（MessageBilling/SessionBilling）、configStorage 加 billingEnabled、新建 billingService 工具函数、dataStore 加 addSessionBilling/resetBilling、useConversation 所有路径捕获 usage 合并计费、BillingCorner 重写（含开关）、MessageBubble 计费展示行、SettingsPanel 标签/开关/重置按钮。`npx tsc --noEmit` 零错误
