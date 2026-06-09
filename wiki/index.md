# WIKI Index（全局摘要索引）

> 🔄 最后同步：2026-06-09

## 模块总览

| 摘要名称 | 摘要路径 | 关键摘要内容 | 依赖健康度 | 最后更新 |
|---|---|---|---|---|
| `项目总览` | [🔗](./abstract/overview.md) | ActorYuan 项目全景：技术栈、目标、需求总览 | ✅ | 06-08 |
| `需求1-数据存储` | [🔗](./abstract/req1.md) | 纯前端、localStorage + JSON 文件导入导出，含计费配置与模组存储 | ✅ 已交付 | 06-08 |
| `需求2-核心交互` | [🔗](./abstract/req2.md) | AI主持人交互流：情节草稿→规则计算介入→AI修正 | ✅ 已交付 | 06-08 |
| `需求3-API兼容` | [🔗](./abstract/req3.md) | OpenAI兼容格式/Anthropic双Provider、baseUrl可配、token用量提取、testConnection、4类错误、Mock保留 | ✅ 已交付 | 06-08 |
| `需求4-UI设计` | [🔗](./abstract/req4.md) | 蓝白黑主色调、对话+右键插入双交互模式、WelcomeScreen、设置面板、占位组件 | ✅ 已交付 | 06-08 |
| `需求5-输出模式` | [🔗](./abstract/req5.md) | 推演方案（隐藏）+ 情节正文双输出、textarea 自由编辑草稿、双 API 调用、分阶段 loading、retryNarrative | ✅ 已交付 | 06-08 |
| `需求6-API计费` | [🔗](./abstract/req6.md) | 按模型配置价格、token用量与费用展示、会话累计 | ⚠️ 依赖需求1、3 | 06-08 |
| `需求7-模组导入` | [🔗](./abstract/req7.md) | 纯文本/Markdown模组导入、系统提示词注入、查看编辑 | ⚠️ 依赖需求1、3 | 06-08 |
| `Vite项目初始化` | [🔗](./abstract/init-vite.md) | Vite 8 + React 19 + TS 6 + react-router 7 项目骨架已就绪 | ✅ | 06-08 |
| `React Router Data模式笔记` | [🔗](./abstract/react-router-data-patterns.md) | Data模式、路由结构、fetcher API调用、pending UI、纯前端适配策略 | ✅ | 06-08 |
| `code-types` | [🔗](./abstract/code/code-types.md) | 全部共享类型定义：Message、ChatResult、ProviderType 等 | ✅ | 06-08 |
| `code-config-storage` | [🔗](./abstract/code/code-config-storage.md) | localStorage 配置层：6 组 getter/setter、键名规范 | ✅ | 06-08 |
| `code-data-store` | [🔗](./abstract/code/code-data-store.md) | React Context 数据层：import/export、消息 CRUD、dirty 追踪 | ✅ | 06-08 |
| `code-ai-service` | [🔗](./abstract/code/code-ai-service.md) | AIService 接口、工厂函数、4 类错误体系 | ✅ | 06-08 |
| `code-providers` | [🔗](./abstract/code/code-providers.md) | OpenAI 兼容 / Anthropic / Mock 三种 Provider 实现 | ✅ | 06-08 |
| `code-hooks` | [🔗](./abstract/code/code-hooks.md) | useConversation（含 discardDraft/regenerateDraft）、useExitWarning、Req2Test 面板 | ✅ | 06-08 |
| `code-ui-components` | [🔗](./abstract/code/code-ui-components.md) | 11 个 UI 组件：TopBar/MessageList/MessageBubble/ChatInput/ConfirmDraftBar/RightPanel/SettingsPanel/ModulePanel/BillingCorner/WelcomeScreen/DebugPanel | ✅ | 06-08 |
| `项目功能文档` | [🔗](./abstract/doc-features.md) | 面向用户的项目功能说明文档：概述、架构、已实现功能（6个）、规划中功能（2个）、运行构建 | ✅ | 06-08 |
| `修复测试问题` | [🔗](./abstract/fix-issues.md) | 4 个测试问题：草稿编辑流程重构、单轮对话架构、import 状态同步、BillingCorner 位置 | ✅ 已交付 | 06-09 |

## 计划状态

| 计划名称 | 路径 | 步骤数 | 状态 |
|---|---|---|---|
| `需求1-数据存储` | [plan/req1.md](./plan/req1.md) | 5 | completed |
| `需求2-核心交互` | [plan/req2.md](./plan/req2.md) | 6 | completed |
| `需求3-API兼容` | [plan/req3.md](./plan/req3.md) | 9 | completed |
| `需求4-UI设计` | [plan/req4.md](./plan/req4.md) | 11 | completed |
| `需求5-输出模式` | [plan/req5.md](./plan/req5.md) | 11 | completed |
| `修复测试问题` | [plan/fix-issues.md](./plan/fix-issues.md) | 9 | completed |

## TODO列表

- [x] ~~执行「修复测试问题」计划~~ S1-S9 全部完成
- [ ] 制定需求6（API计费）的执行计划
- [ ] 制定需求7（模组导入）的执行计划

## 笔记

### 关键信息

- AI 主持人的游戏规则计算由用户（外部系统）负责，本项目不实现游戏规则计算引擎。涵盖判定（检定）、伤害、状态、资源等，统一称"游戏规则计算"
- 提示词硬编码在代码中，但提供用户可修改的配置入口
- 尽量减少第三方依赖，优先自己实现
- 角色/玩家数据由外部系统维护，AI主持人仅接收数据进行推演，本项目不维护不处理
- 模组内容（大纲+设定）为纯文本/Markdown，不做结构化解析；一次性注入系统提示词，不在对话中反复传递
- 计费价格由用户按模型自行配置输入/输出每千token单价；对话界面角落常驻显示会话累计用量和费用

### 技术约束

- 纯前端运行，无后端服务
- localStorage 仅用于基础配置参数（含计费价格配置）
- 数据持久化依赖用户手动导入导出 JSON 文件（含模组文本）
- 不支持流式响应（当前版本）

### 需求3 关键澄清

- **OpenAI 格式**指兼容 Chat Completions 协议的任意服务，通过 `apiBaseUrl` 配置路由，非仅 OpenAI 官方
- Anthropic URL 固定不变（其协议为独有格式）
- 错误分 4 类，`useConversation` 中按类型给出中文提示

## 全局更新日志

- `06-09`: **「修复测试问题」后半部分（S6-S9）完成**：MessageBubble viewing/editing 状态机、移除 ConfirmDraftBar、ChatInput 按 phase 显隐、BillingCorner 顶部居中、`tsc --noEmit` 零错误。计划全部交付。
- `06-09`: **「修复测试问题」前半部分（S1-S5）完成**：数据模型扩展（contextHistory + resetMessages + 旧版导入迁移）、useEffect phase 同步修复、draftEditRewriteMode 配置、useConversation 单轮对话重构、buildSystemPrompt 模组注入。`npx tsc --noEmit` 零错误。App.tsx 已适配新 API（移除 setDraftContent），Req2Test 已更新。
- `06-09`: 定位问题1根因（useState 初始化不响应 importData 更新→phase 未同步），与用户对齐问题3+4细节（编辑→保存→AI重写配置参数、contextHistory 增长来源、模组注入 system prompt），制定「修复测试问题」执行计划（9 步骤）并写入 `wiki/plan/fix-issues.md`，新增摘要 `wiki/abstract/fix-issues.md`，更新 index
- `06-09 00:30`: 编写项目功能文档（`docs/项目功能文档.md`），覆盖概述/架构/6 个已实现功能/2 个规划中功能/运行构建；新增摘要 `wiki/abstract/doc-features.md`；修正 code-ui-components index 条目（移除已删除的 DraftContextMenu/InsertDialog，补充 DebugPanel）
- `06-08 23:59`: Debug 面板功能：configStorage 新增 getDebugMode/setDebugMode、useConversation 新增 DebugEntry/DebugEntries 类型 + debugEntries 捕获、DebugPanel 组件（右侧遮罩面板，双阶段输入对比）、SettingsPanel debug 开关、TopBar debug 按钮、`npx tsc --noEmit` 零错误
- `06-08`: 需求5 全部交付（S1-S11）：双 API 调用双输出、LoadingStage 分阶段、reasoning 折叠、textarea 编辑草稿、retryNarrative/cancelPendingReasoning、删除 DraftContextMenu/InsertDialog、dataStore 扩展 reasoning、`npx tsc --noEmit` 零错误
- `06-08 23:59`: 需求5 执行计划制定完成（11 步骤）：双 API 调用、{stage} 提示词模板、Message.reasoning 字段、textarea 自由编辑草稿、删除 DraftContextMenu/InsertDialog
- `06-08 23:30`: 需求1-4回顾修复：discardDraft 同步删除触发用户消息（保持对话一致性）；openaiProvider/anthropicProvider 的 testConnection 添加 AbortController 10 秒超时，防止目标不可达时无限挂起
- `06-08 23:00`: 需求4 全部交付（S0-S10）：13 个 UI 组件、dataStore 增加 deleteMessage、useConversation 增加 discardDraft/regenerateDraft、WelcomeScreen、白蓝黑主题、段落级插入
- `06-08 21:00`: 创建 6 个代码模块摘要（code-types/config-storage/data-store/ai-service/providers/hooks）；修复 req2/req3 的 source_contents 缺漏
- `06-08 20:30`: 需求3 WIKI 记忆库全面更新（计划、摘要、index），补充错误分类、baseUrl 决策、完整测试方案
- `06-08 20:15`: S9 补充 OpenAILikeProvider 可配置 baseUrl（默认 `https://api.openai.com/v1`）
- `06-08 20:00`: 需求3计划执行完成，S1-S8 全部交付，`npx tsc --noEmit` 通过
- `06-08 19:30`: 需求3执行计划制定完成（8步骤），与用户对齐全部关键决策
- `06-08 19:00`: 需求2计划执行完成，S1-S6 全部交付，`npx tsc --noEmit` 通过
- `06-08 18:00`: 需求2计划制定完成（6步骤），确定方案B架构
- `06-08 17:30`: 需求1计划执行完成，S1-S5 全部交付，`npx tsc --noEmit` 通过
- `06-08 17:00`: 新增「计划总览」表格，纳入 req1 执行计划；index.md 结构整理
- `06-08 16:30`: 阅读 React Router 文档，编写 Data 模式开发笔记
- `06-08 16:03`: Vite 8 + React 19.2.6 + TS 6.0 + react-router 7.17.0 项目脚手架初始化完成
- `06-08 14:30`: 需求2泛化 —— "判定规则"→"游戏规则计算"，涵盖判定/伤害/状态/资源等
- `06-08`: 需求对齐讨论 —— 新增 req6（API计费）、req7（模组导入）；确认 MVP 范围与优先级
- `06-08`: WIKI 记忆库初始化，基于 `docs/项目文档 OUTDATE.md` 创建项目总览与 5 个需求摘要
