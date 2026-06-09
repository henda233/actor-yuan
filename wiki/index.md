# WIKI Index（全局摘要索引）

> 🔄 最后同步：2026-06-09 17:30

## 模块总览

| 摘要名称 | 摘要路径 | 关键摘要内容 | 依赖健康度 | 最后更新 |
|---|---|---|---|---|
| `项目总览` | [🔗](./abstract/overview.md) | ActorYuan 项目全景：技术栈、目标、需求总览 | ✅ | 06-08 |
| `需求1-数据存储` | [🔗](./abstract/req1.md) | 纯前端、localStorage + JSON 文件导入导出，含计费配置与模组存储 | ✅ 已交付 | 06-08 |
| `需求2-核心交互` | [🔗](./abstract/req2.md) | AI主持人交互流：情节草稿→规则计算介入→AI修正 | ✅ 已交付 | 06-08 |
| `需求3-API兼容` | [🔗](./abstract/req3.md) | OpenAI兼容格式/Anthropic双Provider、baseUrl可配、token用量提取、testConnection、4类错误、Mock保留 | ✅ 已交付 | 06-08 |
| `需求4-UI设计` | [🔗](./abstract/req4.md) | 蓝白黑主色调、对话+右键插入双交互模式、WelcomeScreen、设置面板、占位组件 | ✅ 已交付 | 06-08 |
| `需求5-输出模式` | [🔗](./abstract/req5.md) | 推演方案（隐藏）+ 情节正文双输出、textarea 自由编辑草稿、双 API 调用、分阶段 loading、retryNarrative | ✅ 已交付 | 06-08 |
| `需求6-API计费` | [🔗](./abstract/req6.md) | 每百万token/￥、计费开关(billingEnabled默认开启)、双调用合并、消息气泡+角标展示、JSON持久化、快照定价 | ✅ 已交付 | 06-09 |
| `需求7-模组导入` | [🔗](./abstract/req7.md) | 纯文本/Markdown模组导入、自定义Dialog替换/追加、textarea编辑、元信息展示 | ✅ 已交付 | 06-09 |
| `Vite项目初始化` | [🔗](./abstract/init-vite.md) | Vite 8 + React 19 + TS 6 + react-router 7 项目骨架 | ✅ | 06-08 |
| `React Router Data模式笔记` | [🔗](./abstract/react-router-data-patterns.md) | Data模式、路由结构、fetcher API调用、pending UI、纯前端适配策略 | ✅ | 06-08 |
| `code-types` | [🔗](./abstract/code/code-types.md) | MessageBilling/SessionBilling/Message/AppData/ExportData/ChatResult 等 | ✅ | 06-09 |
| `code-config-storage` | [🔗](./abstract/code/code-config-storage.md) | localStorage 配置层：9 组 getter/setter（含 billingEnabled）、键名规范 | ✅ | 06-09 |
| `code-data-store` | [🔗](./abstract/code/code-data-store.md) | React Context 数据层：import/export、消息 CRUD、addSessionBilling/resetBilling、dirty 追踪 | ✅ | 06-09 |
| `code-ai-service` | [🔗](./abstract/code/code-ai-service.md) | AIService 接口、工厂函数、4 类错误体系 | ✅ | 06-08 |
| `code-providers` | [🔗](./abstract/code/code-providers.md) | OpenAI 兼容 / Anthropic / Mock 三种 Provider 实现 | ✅ | 06-08 |
| `code-hooks` | [🔗](./abstract/code/code-hooks.md) | useConversation（双调用合并计费/makeBilling）、useExitWarning、Req2Test 面板 | ✅ | 06-09 |
| `code-billing-service` | [🔗](./abstract/code/code-billing-service.md) | 计费工具函数：calculateCost、formatTokens、formatCost | ✅ | 06-09 |
| `code-ui-components` | [🔗](./abstract/code/code-ui-components.md) | 12 个 UI 组件：TopBar/MessageList/MessageBubble/ChatInput/RightPanel/SettingsPanel/ModulePanel/BillingCorner/WelcomeScreen/DebugPanel/Dialog/DataEditorPanel | ✅ | 06-09 |
| `项目功能文档` | [🔗](./abstract/doc-features.md) | 面向用户的功能说明：概述、架构、6 个已实现功能、2 个规划中功能、运行构建 | ✅ | 06-08 |
| `修复测试问题` | [🔗](./abstract/fix-issues.md) | 数据模型扩展（contextHistory/resetMessages）、phase同步修复、单轮对话重构、草稿编辑状态机、模组注入system prompt | ✅ 已交付 | 06-09 |
| `需求1435-数据编辑与复制` | [🔗](./abstract/req_1435.md) | 新增DataEditorPanel（遮罩面板编辑module/contextHistory/messages）+ MessageBubble复制按钮（保留Markdown） | ✅ 已交付 | 06-09 |
| `UI/UX优化` | [🔗](./abstract/ui-ux-optimization.md) | 修复 --primary CSS bug + 消息对齐 + BillingCorner位置 + ChatInput/设置折叠/条件挂载（S5滚动按钮/S8宽度统一已跳过） | ✅ 已交付 | 06-09 |
| `部署文档` | [🔗](./abstract/deploy-doc.md) | Ubuntu 22.04 + Nginx 部署教程：裸机安装到验证、SPA fallback、Gzip、ufw | ✅ | 06-09 |

## 计划状态

| 计划名称 | 路径 | 步骤数 | 状态 |
|---|---|---|---|
| `需求1-数据存储` | [plan/req1.md](./plan/req1.md) | 5 | completed |
| `需求2-核心交互` | [plan/req2.md](./plan/req2.md) | 6 | completed |
| `需求3-API兼容` | [plan/req3.md](./plan/req3.md) | 9 | completed |
| `需求4-UI设计` | [plan/req4.md](./plan/req4.md) | 11 | completed |
| `需求5-输出模式` | [plan/req5.md](./plan/req5.md) | 11 | completed |
| `修复测试问题` | [plan/fix-issues.md](./plan/fix-issues.md) | 9 | completed |
| `需求7-模组导入` | [plan/req7.md](./plan/req7.md) | 7 | completed |
| `需求6-API计费` | [plan/req6.md](./plan/req6.md) | 9 | completed |
| `需求1435-数据编辑与复制` | [plan/req_1435.md](./plan/req_1435.md) | 6 | completed |
| `UI/UX优化` | [plan/ui-ux-optimization.md](./plan/ui-ux-optimization.md) | 8 | completed |

## TODO列表


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

- `06-09 17:30`: **部署文档**：编写 `docs/部署文档.md`（Ubuntu 22.04 + Nginx 部署教程），新增 `wiki/abstract/deploy-doc.md`，更新 index
- `06-09 17:00`: **UI/UX优化 全部交付（S5/S8跳过）**：S1 `--primary: var(--blue)` 补充 → S2 消息对齐交换 → S3 BillingCorner top:52px → S4 ChatInput rows=3+resize+max-height:50vh → S6 设置面板三组 details 折叠 → S7 右侧面板条件挂载+移除 dead CSS。`npx tsc --noEmit` 零错误
- `06-09 16:15`: **需求1435 修订**：contextHistory 改为单个 textarea 整体编辑（不再 `\n\n` 拆分），面板扩至 80vw，dataStore 新增 `setContextHistory` 方法。`npx tsc --noEmit` 零错误
- `06-09 16:00`: **需求1435 全部交付（S1-S6）**：dataStore 新增 setContextHistoryEntry/deleteContextHistoryEntry；MessageBubble 包裹 wrapper + 复制按钮（1.5s "✓ 已复制"）；DataEditorPanel（560px、三区域 module/contextHistory/messages、美化 textarea、z-index:99）；TopBar "数据编辑" 按钮（始终可见）；App.tsx 集成。`npx tsc --noEmit` 零错误
- `06-09 15:30`: **需求1435 计划制定**：对齐确认数据编辑面板（遮罩面板、实时编辑 module/contextHistory/messages 的 content）+ 复制按钮（气泡下方、保留 Markdown、"✓ 已复制" 反馈）。制定 6 步骤计划，新增 `wiki/request/req_1435.md`、`wiki/plan/req_1435.md`、`wiki/abstract/req_1435.md`，更新 index
- `06-09`: **需求6 全部交付（S1-S9）**：新增 MessageBilling/SessionBilling 类型、billingEnabled 开关（默认开启）、billingService 工具函数、dataStore 计费方法、useConversation 全路径 usage 捕获合并、BillingCorner 重写、MessageBubble 计费行、SettingsPanel 开关+重置。`npx tsc --noEmit` 零错误
- `06-09`: **需求6 计划修订**：新增 `billingEnabled` 计费开关（默认开启、存 localStorage、不随 JSON 导出导入）；关闭时 tokens 统计常开仅隐藏 ¥。计划步骤 8→9。更新 plan/req6.md、abstract/req6.md、request/req6.md、index.md
- `06-09`: **需求6 计划制定**：对齐确认 11 项细节（每百万token/￥、双调用合并、JSON持久化、快照定价、缩略格式等），制定 8 步骤执行计划。新增 `wiki/request/req6.md`、`wiki/plan/req6.md`，更新摘要与 index
- `06-09`: **需求7 全部交付**：ModulePanel 重写（toolbar + textarea + 元信息）、自定义 Dialog 弹窗（替换/追加/取消）、FileReader 文件导入、清空确认。新增 `Dialog.tsx`/`Dialog.css`，`npx tsc --noEmit` 零错误
- `06-09`: **「修复测试问题」全部交付（S1-S9）**：数据模型扩展（contextHistory + resetMessages + 旧版导入迁移）、useEffect phase 同步修复、draftEditRewriteMode 配置、useConversation 单轮对话重构、buildSystemPrompt 模组注入、MessageBubble viewing/editing 状态机、移除 ConfirmDraftBar、ChatInput 按 phase 显隐、BillingCorner 顶部居中。`npx tsc --noEmit` 零错误
- `06-09`: 定位问题1根因（useState 初始化不响应 importData 更新→phase 未同步），制定「修复测试问题」执行计划（9 步骤），新增 `wiki/abstract/fix-issues.md`
- `06-09`: 编写项目功能文档（`docs/项目功能文档.md`），新增摘要 `wiki/abstract/doc-features.md`；Debug 面板功能交付（configStorage debug 开关、DebugPanel 组件、SettingsPanel/TopBar 入口）
- `06-08`: **需求5 全部交付（S1-S11）**：双 API 调用双输出、LoadingStage 分阶段、reasoning 折叠、textarea 编辑草稿、retryNarrative/cancelPendingReasoning、删除 DraftContextMenu/InsertDialog。`npx tsc --noEmit` 零错误
- `06-08`: **需求4 全部交付**：13 个 UI 组件、dataStore deleteMessage、useConversation discardDraft/regenerateDraft、WelcomeScreen、白蓝黑主题、段落级插入
- `06-08`: **需求3 全部交付**：OpenAI兼容/Anthropic双Provider、baseUrl可配、testConnection 10s超时（防无限挂起）、4类错误体系、Mock保留。`npx tsc --noEmit` 通过
- `06-08`: **需求2 全部交付（方案B）**：AI主持人交互流（情节草稿→规则计算介入→AI修正）。discardDraft 同步删除触发用户消息（保持对话一致性）
- `06-08`: **需求1 全部交付**：localStorage 配置层 + JSON 导入导出。`npx tsc --noEmit` 通过
- `06-08`: Vite 8 + React 19.2.6 + TS 6.0 + react-router 7.17.0 脚手架初始化；阅读 React Router 文档编写 Data 模式笔记
- `06-08`: 需求对齐讨论：新增 req6（API计费）、req7（模组导入），确认 MVP 范围；WIKI 记忆库初始化
