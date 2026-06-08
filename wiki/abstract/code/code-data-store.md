---
abstract_name: code-data-store 数据存储层
source_contents:
  - "src/services/dataStore.tsx"
dependencies:
  - "src/types/storage.ts"
created_at: 2026-06-08 21:00
updated_at: 2026-06-08 23:00
---
# 摘要：数据存储层（src/services/dataStore.tsx）

## 核心结论与关键信息

- 采用 **React Context** 模式管理全局状态（非 Redux/Zustand），遵循项目"最小依赖"原则
- `dirty` 标志位追踪未导出更改，驱动 `useExitWarning` 的浏览器关闭拦截
- 消息 ID 使用 `crypto.randomUUID()` 生成（浏览器原生 API，无外部依赖）
- 导入/导出通过 `Blob` + 隐式 `<a>` 点击实现，不依赖 File System Access API
- `updateMessage` 对不存在的 ID **静默无操作**（不抛错），防御性设计
- `deleteMessage` 按 ID 删除消息，`setDirty(true)`；不存在的 ID 不抛错，`filter` 自然忽略
- `addMessage` 第三个参数 `status` 为可选，不传则 `undefined`（普通消息），传 `'draft'` 或 `'confirmed'` 用于两阶段流程

## 内容概述

### 导出

| 导出 | 类型 | 说明 |
|---|---|---|
| `DataStoreProvider` | React 组件 | Context Provider，包裹应用根节点 |
| `useDataStore` | Hook | 消费 Context，任意子组件调用 |
| `DataStoreContextValue` | TypeScript 接口 | Context 值的类型（未导出，但定义在模块内） |

### `useDataStore()` 返回值

| 字段 | 类型 | 说明 |
|---|---|---|
| `data` | `AppData` | `{ module: string, messages: Message[] }` |
| `dirty` | `boolean` | 自上次导出后是否有未持久化的更改 |
| `exportData` | `() => void` | 导出为 JSON 文件（触发浏览器下载），同时置 `dirty=false` |
| `importData` | `(file: File) => Promise<void>` | 从 JSON 文件导入，解析失败抛 `'JSON 解析失败，请检查文件格式'`，重置 `dirty=false` |
| `addMessage` | `(role, content, status?) => void` | 追加消息，自动生成 `id`/`timestamp`，置 `dirty=true` |
| `updateMessage` | `(id, patch) => void` | 更新消息的 `content` 或 `status`，不存在则无操作，置 `dirty=true` |
| `deleteMessage` | `(id: string) => void` | 按 ID 删除消息，不存在则无操作，置 `dirty=true` |
| `setModule` | `(text: string) => void` | 设置模组文本，置 `dirty=true` |

### 数据流向

```
DataStoreProvider (state + callbacks)
  └─→ useDataStore() consumer
        ├─→ App.tsx (import/export, dirty 显示)
        ├─→ useConversation.ts (addMessage, updateMessage, data.messages)
        └─→ Req2Test.tsx (测试数据操作)
```

## 依赖与影响链

- **上游依赖**：`src/types/storage.ts`（`AppData`, `ExportData`, `Message`）
- **下游被依赖**：`App.tsx`、`useConversation.ts`、`Req2Test.tsx`
- **变更扩散评估**：高（所有组件都通过 `useDataStore` 读写数据；修改 Context 接口会影响所有消费者，但 `DataStoreProvider` 的实现细节可自由重构）
