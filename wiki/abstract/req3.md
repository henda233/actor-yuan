---
abstract_name: 需求3-大模型API兼容
source_contents:
  - "docs/项目文档 OUTDATE.md"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req2.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 摘要：需求3 —— 大模型 API 兼容（OpenAI / Anthropic）

## 核心结论与关键信息

- 需同时支持 **OpenAI** 和 **Anthropic** 两种 API 调用格式
- 需适配**深度思考功能的开关**（部分模型通过调整思考强度实现）
- 需要一套统一的内部抽象层，屏蔽不同提供商的 API 差异
- **需从 API 响应中提取 token 用量信息**（输入/输出 token 数），供计费模块（req6）消费

## 内容概述

该需求要求项目能够兼容不同大模型提供商的 API。核心挑战在于：
1. 请求/响应格式的差异（OpenAI Chat Completions vs Anthropic Messages）
2. 深度思考/推理功能的 API 控制方式不同
3. **Token 用量信息的提取**——两种 API 的 usage 字段格式不同，需统一为内部结构（含输入 token 数、输出 token 数）

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req2.md`（核心交互 —— API 调用服务于 AI 主持人的交互流程）
- **下游被依赖**：`wiki/abstract/req5.md`（双输出模式依赖 API 的思考功能）、`wiki/abstract/req6.md`（计费模块依赖 token 用量数据）
- **变更扩散评估**：中（API 层相对独立，但输出模式和计费需求依赖它）
