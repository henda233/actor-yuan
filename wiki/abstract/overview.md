---
abstract_name: 项目总览
source_contents:
  - "docs/项目文档.md"
dependencies: []
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 摘要：ActorYuan 项目总览

## 核心结论与关键信息

- ActorYuan 是基于大模型的 AI 跑团（TRPG）主持人交互 Web 应用，**纯前端本地运行**
- 技术栈：React 19.2.6 + React Router 7.17.0 + Vite 8 + TypeScript 6.0，**尽量少用第三方依赖**
- AI 主持人的判定规则由用户（外部系统）主观决定，**本项目不实现游戏规则计算**
- 提示词硬编码但用户可配置修改
- 数据持久化依赖用户**手动导入导出 JSON 文件**

## 内容概述

`docs/项目文档.md` 定义了项目的技术栈、目标、开发规范和 5 个核心需求。项目本质是 AI 对话应用，但增加了 TRPG 特有的"判定插入"交互模式——AI 先出情节草稿，用户对关键事件进行判定后插入结果，AI 据此修正后续情节。

## 依赖与影响链

- **上游依赖**：无（顶层文档）
- **下游被依赖**：`wiki/abstract/req1.md`、`wiki/abstract/req2.md`、`wiki/abstract/req3.md`、`wiki/abstract/req4.md`、`wiki/abstract/req5.md`
- **变更扩散评估**：高（项目文档修改会影响所有需求摘要）
