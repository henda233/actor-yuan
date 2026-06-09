# ActorYuan WIKI 记忆库

基于 LLM-WIKI 的 Agent 任务范式构建的项目记忆库，为 AI 助手提供结构化的项目上下文。

## 项目简述

ActorYuan 是基于大模型的 AI 跑团（TRPG）主持人交互 Web 应用，纯前端运行。用户扮演玩家（PL）代理人，通过 AI 主持人进行游戏情节推演。

## WIKI 结构导航

```
wiki/
├── readme.md              # 本文件 —— WIKI 概述与导航入口
├── index.md               # 全局摘要索引（所有任务开始时必读）
├── abstract/              # 摘要目录
│   ├── overview.md        # 项目总览摘要
│   ├── req1.md            # 需求1：纯前端 + 本地 JSON 数据存储
│   ├── req2.md            # 需求2：AI 主持人核心交互流程
│   ├── req3.md            # 需求3：大模型 API 兼容（OpenAI / Anthropic）
│   ├── req4.md            # 需求4：UI 设计与交互模式
│   ├── req5.md            # 需求5：AI 主持人双输出模式
│   ├── req6.md            # 需求6：API 计费（待制定计划）
│   ├── req7.md            # 需求7：模组导入
│   ├── fix-issues.md      # 修复测试问题
│   ├── doc-features.md    # 项目功能文档
│   ├── init-vite.md       # Vite 项目初始化
│   ├── react-router-data-patterns.md  # React Router Data 模式笔记
│   └── code/              # 代码模块摘要
│       ├── code-types.md
│       ├── code-config-storage.md
│       ├── code-data-store.md
│       ├── code-ai-service.md
│       ├── code-providers.md
│       ├── code-billing-service.md
│       ├── code-hooks.md
│       └── code-ui-components.md
├── request/               # 用户需求记录
└── plan/                  # 执行计划
    ├── req1.md
    ├── req2.md
    ├── req3.md
    ├── req4.md
    ├── req5.md
    ├── req7.md
    └── fix-issues.md
```

## 阅读规范

每次会话或任务开始时，必须按以下顺序阅读：
1. `readme.md` + `index.md` —— 了解项目全局状态
2. 相关 `abstract/` 摘要 —— 获取关键信息与文件路径
3. 具体内容文件（代码、配置等）

**禁止越过摘要直接读取具体内容。**

## 内容存储

WIKI 元信息（摘要、需求、计划）存储在 `wiki/` 目录下。项目的实际代码、配置等交付物按其技术栈规范存放，不纳入 `wiki/` 目录。
