---
request_name: 需求6-API计费与用量追踪
created_at: 2026-06-08
updated_at: 2026-06-09
status: planning
---

# 需求6：API 计费与用量追踪

## 需求描述

为项目增加 API 调用成本的可视化追踪。用户在设置中按模型配置每百万 token 的输入/输出价格（￥），每次 API 调用后从响应中提取 usage，计算并展示用量与费用。

**计费可开关**：用户可通过 SettingsPanel 中的开关自由开启/关闭计费功能。关闭时，tokens 统计与展示保持常开，仅隐藏费用（¥）相关显示，费用数据在后台继续计算和存储。

## 需求细节（对齐后确认）

1. **计费开关**：`billingEnabled` 配置（localStorage），默认开启。关闭时 tokens 统计常开，仅隐藏 ¥ 显示
2. **计费粒度**：双 API 调用（reasoning + narrative）合并展示在 assistant 消息气泡内；retryNarrative/regenerateDraft 等单次调用独立展示
3. **展示位置**：消息气泡内 + BillingCorner 常驻累计
   - 开启：`输入1.2K/输出3.4K tokens · ¥0.05`
   - 关闭：`输入1.2K/输出3.4K tokens`
4. **持久化**：累计数据存入 JSON（`AppData`/`ExportData`），导出导入携带；旧版 JSON（无 billing）导入时累计归零；`billingEnabled` 不随 JSON 导出导入
5. **定价策略**：每次调用时快照当前模型价格计算费用；关闭期间 cost 仍存实际计算值
6. **价格单位**：每百万 tokens / ￥
   - 公式：`cost = (inputTokens × inputPrice + outputTokens × outputPrice) / 1,000,000`
7. **展示格式**：Token 缩略（12.3K / 1.2M），费用小数点后 2 位，￥ 符号
8. **开关 + 重置入口**：SettingsPanel
9. **导入恢复**：导入含 billing 的 JSON 后 BillingCorner 恢复历史累计
