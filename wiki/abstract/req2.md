---
abstract_name: 需求2-AI主持人核心交互流程
source_contents:
  - "docs/项目文档 OUTDATE.md"
  - "wiki/request/req2.md"
  - "wiki/plan/req2.md"
  - "src/types/storage.ts"
  - "src/services/configStorage.ts"
  - "src/services/aiService.ts"
  - "src/services/dataStore.tsx"
  - "src/hooks/useConversation.ts"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req1.md"
created_at: 2026-06-08
updated_at: 2026-06-08 19:00
---
# 摘要：需求2 —— AI 主持人核心交互流程

## 核心结论与关键信息

- **核心流程**：玩家 → 用户（代理人）→ AI主持人 → 用户 → 玩家
- **游戏规则计算机制**（关键设计）：
  1. AI主持人先输出游戏情节"草稿"
  2. 用户决定哪些事件需要进行游戏规则计算，给出计算结果
  3. 将计算结果插入到原情节对应位置（事件句子/段落前）
  4. 将插入了计算结果的情节返回AI主持人
  5. AI主持人根据计算结果修改后续情节
  - 涵盖示例：技能/属性检定（判定）、伤害计算、状态效果结算、资源消耗管理等，统一以"游戏规则计算"指代
- AI主持人职责：根据上下文（已发生情节）、玩家行为、游戏数据进行**情节推演**
- **游戏规则计算全部由外部系统负责**，本项目不处理
- 提示词**硬编码在代码中**，但用户可通过配置修改更新

## 内容概述

这是项目的核心业务逻辑。与常规 AI 对话不同，这里引入了"先草稿后规则计算介入"的两阶段交互模式。AI 主持人和用户各司其职：AI 负责叙事推演，用户（代表外部规则系统）负责对关键事件进行游戏规则计算与仲裁。

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（项目总览）
  - `wiki/abstract/req1.md`（数据存储 —— 对话记录、游戏状态需要持久化）
- **下游被依赖**：`wiki/abstract/req3.md`、`wiki/abstract/req4.md`、`wiki/abstract/req5.md`（所有功能都围绕核心交互构建）
- **变更扩散评估**：高（核心业务逻辑，修改会影响 UI、API、输出模式等所有模块）
