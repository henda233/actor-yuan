---
plan_name: 需求1-数据存储执行计划
related_request: "wiki/request/req1.md"
status: completed
created_at: 2026-06-08
---
# 执行计划：需求1 —— 纯前端 + 本地 JSON 数据存储

## 背景

需求1 是整个 ActorYuan 项目的数据底座。它建立两层存储体系：localStorage 承载轻量配置，JSON 文件承载业务数据的导入导出。所有上层功能（需求 2/3/4/6/7）均依赖此层。

本计划的目的：将需求描述拆解为可执行的编码任务，明确交付物与步骤间的依赖关系。

## 内容

根据与用户对齐后的需求，本计划的交付范围为：

1. **TypeScript 类型定义** —— 对话消息、计费配置、导出文件结构等全部数据实体的类型
2. **localStorage 配置服务** —— 三个独立 key 的读写封装（api-key、model、billing-prices）
3. **内存数据存储 + JSON 导入导出** —— 对话消息与模组文本的运行时持有，单文件导出（下载）、单文件导入（上传并覆盖）
4. **退出警告** —— 利用 `beforeunload` 事件，在内存中有未导出数据时拦截页面关闭/刷新

明确**不做**：
- 数据校验 / Schema 校验
- 数据版本兼容迁移
- 配置 UI 界面（归属需求 4）
- 运行时自动缓存到 localStorage

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 定义全部数据实体的 TypeScript 类型 | 无 | `src/types/storage.ts` | ✅ 已完成 |
| `S2` | 实现 localStorage 配置服务（api-key、model、billing-prices 读写） | `S1` | `src/services/configStorage.ts` | ✅ 已完成 |
| `S3` | 实现内存数据存储 + JSON 单文件导入导出（含 React Context） | `S1` | `src/services/dataStore.tsx` | ✅ 已完成 |
| `S4` | 实现 beforeunload 退出警告 hook | `S3` | `src/hooks/useExitWarning.ts` | ✅ 已完成 |
| `S5` | 在 App.tsx 中集成 dataStore Provider 与退出警告 | `S3`, `S4` | `src/App.tsx`、`src/main.tsx` | ✅ 已完成 |

## 各步骤详细说明

### S1：TypeScript 类型定义

定义以下类型：

- `Message` —— `{ id: string; role: 'system' | 'user' | 'assistant'; content: string; timestamp: number }`
- `BillingPrice` —— `{ inputPrice: number; outputPrice: number }`（每千 token 单价，用户自行配置）
- `BillingPrices` —— `Record<string, BillingPrice>`（模型 ID → 价格）
- `ExportData` —— `{ version: 1; exportedAt: string; module: string; messages: Message[] }`
- `AppData` —— `{ module: string; messages: Message[] }`（运行时内存数据）

### S2：localStorage 配置服务

三个独立 key 的读写封装：

| Key | 类型 | 函数 |
|---|---|---|
| `actor-yuan:api-key` | `string` | `getApiKey()`, `setApiKey(v)` |
| `actor-yuan:model` | `string` | `getModel()`, `setModel(v)` |
| `actor-yuan:billing-prices` | `BillingPrices` | `getBillingPrices()`, `setBillingPrices(v)` |

每个 setter 直接 `localStorage.setItem`；getter 直接 `localStorage.getItem` 并 JSON.parse（billing-prices）或直接返回（字符串 key）。不做校验。

### S3：内存数据存储 + JSON 导入导出

核心设计：

- **内存状态**：`AppData` 对象持有 `module`（字符串）和 `messages`（Message 数组）
- **脏标记**：任意修改后置 `dirty = true`，导出成功后置 `false`
- **导出**：构建 `ExportData` → `JSON.stringify` → 创建 Blob → 触发 `<a download>` 下载
- **导入**：`<input type="file">` 读取 `.json` 文件 → `JSON.parse` → 覆盖内存中的 `messages` 和 `module`
- **React 集成**：通过 React Context + Provider 暴露 `data`、`dirty`、`exportData()`、`importData(file)`、`addMessage(msg)`、`setModule(text)` 等

### S4：退出警告 hook

- 监听 `beforeunload` 事件
- 当 `dirty === true` 时调用 `event.preventDefault()` 触发浏览器原生拦截弹窗
- 封装为 `useExitWarning(dirty: boolean)` hook，在 App 层调用

### S5：App 集成

- 用 DataStoreProvider 包裹 App 根组件
- 调用 `useExitWarning(dirty)`
- 替换 Vite 默认模板内容为最小占位（后续需求会替换为实际 UI）

## 风险与约束声明

- **localStorage 容量**：三个配置 key 数据量极小，不存在容量问题
- **JSON 文件大小**：对话消息累积可能导致导出文件较大，但纯文本场景下通常不会达到浏览器处理瓶颈
- **beforeunload 局限性**：移动端浏览器对 `beforeunload` 支持不一致，且浏览器可能忽略自定义消息。这是已知限制，暂不处理
- **类型仅作编译时约束**：不做运行时校验，导入非预期格式的 JSON 会导致运行时错误——这是与用户确认后的取舍

## 测试验证方案

计划完成后，通过以下场景手动验证：

1. **localStorage 读写**：浏览器 DevTools → Application → Local Storage，确认三个 key 可正常读写
2. **消息追加**：调用 `addMessage()` 后检查 `dirty` 变为 `true`
3. **导出下载**：调用 `exportData()` 后浏览器下载 `.json` 文件，内容符合 `ExportData` 结构
4. **导入覆盖**：修改导出的 JSON 文件后再导入，内存数据被覆盖为新内容，`dirty` 重置为 `false`
5. **退出警告**：`dirty = true` 时刷新页面，浏览器弹出确认对话框；导出后 `dirty = false` 再刷新，无弹窗
6. **类型检查**：`npx tsc --noEmit` 无类型错误

## 📝 执行记录

- `2026-06-08`: 计划已生成，与用户对齐需求细节后制定
- `2026-06-08 17:30`: S1-S5 全部完成，5个文件创建/修改，npx tsc --noEmit 通过
