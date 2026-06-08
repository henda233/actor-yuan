---
request_name: 需求1-数据存储
related_abstract: "wiki/abstract/req1.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 需求1：纯前端 + 本地 JSON 数据存储

## 原始需求

基于 React + React Router 纯前端开发，数据分为两层：

1. **localStorage** —— 基础配置参数，独立 key 存储
2. **JSON 文件** —— 业务数据，用户手动导入导出（单文件、覆盖式）

## 需求对齐确认

### 数据实体

| 实体 | 存储位置 | 说明 |
|---|---|---|
| API Key | localStorage (`actor-yuan:api-key`) | 明文存储 |
| 模型选择 | localStorage (`actor-yuan:model`) | 当前选用的模型 ID |
| 计费价格 | localStorage (`actor-yuan:billing-prices`) | `Record<modelId, { inputPrice, outputPrice }>`，每千 token 单价 |
| 对话消息 | 内存 → JSON 导出 | 数组，每条含 `role`（system/user/assistant）、`content`、`timestamp`；游戏规则计算结果由用户引用嵌入 content |
| 模组文本 | 内存 → JSON 导出 | 原始 Markdown 字符串，单模组（应用级全局唯一） |

### 关键约束

- **无"游戏状态"概念** —— 游戏数据由外部系统维护，本项目不存储
- **无运行时自动缓存** —— 刷新/关闭即丢失内存数据，不自动写 localStorage
- **退出警告** —— 用户有未导出数据时关闭/刷新页面，需弹出警告
- **单模组** —— 整个 Web 应用同一时间只有一个模组
- **单会话** —— 不支持多存档/多会话切换
- **不做**数据校验、格式版本兼容迁移

### JSON 导出格式（单文件覆盖式）

```typescript
{
  version: 1,
  exportedAt: "ISO 8601",
  module: "原始 Markdown 文本",
  messages: [
    { id: "uuid", role: "user", content: "...", timestamp: 1700000000000 }
  ]
}
```

### localStorage key 设计

| Key | 值类型 | 说明 |
|---|---|---|
| `actor-yuan:api-key` | `string` | API 密钥 |
| `actor-yuan:model` | `string` | 当前模型 ID |
| `actor-yuan:billing-prices` | `Record<string, {inputPrice: number, outputPrice: number}>` | 按模型配置的每千 token 价格 |
