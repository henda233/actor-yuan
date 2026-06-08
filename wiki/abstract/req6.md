---
abstract_name: 需求6-API计费与用量追踪
source_contents:
  - "docs/项目文档 OUTDATE.md"
  - "用户讨论确认 (2026-06-08)"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req1.md"
  - "wiki/abstract/req3.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 摘要：需求6 —— API 计费与用量追踪

## 核心结论与关键信息

- 用户按模型自行设置**每千 token 输入价格**和**每千 token 输出价格**
- 每次 API 调用后显示：**输入 token 数、输出 token 数、本次预估费用**
- 累计并常驻显示**本次会话的总 token 用量和总费用**
- 价格配置存储在 localStorage 中（见 req1）
- Token 用量数据从 API 响应中提取（见 req3）
- 费用展示位置：对话界面角落常驻显示

## 内容概述

该需求为项目增加 API 调用成本的可视化追踪。用户在设置中配置各模型的输入/输出 token 单价（每千 token），每次 API 调用完成后从响应中提取 usage 数据，计算并展示用量与费用。界面角落常驻显示会话累计 token 用量和预估总费用。

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req1.md`（价格配置存储到 localStorage）
  - `wiki/abstract/req3.md`（API 响应中提取 token 用量）
- **下游被依赖**：`wiki/abstract/req4.md`（UI 展示计费信息）
- **变更扩散评估**：低（独立模块，仅消费 API 层的 usage 数据并供 UI 展示）

## 技术要点

- 计费公式：`预估费用 = (输入token数 × 输入单价 + 输出token数 × 输出单价) / 1000`
- 价格配置按模型区分，用户在设置中针对不同模型配置不同价格
- 会话累计数据为内存态，不持久化（页面刷新后归零，或可选择持久化到 localStorage）
