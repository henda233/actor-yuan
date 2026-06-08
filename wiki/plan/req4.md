---
plan_name: 需求4-UI设计
related_request: "wiki/abstract/req4.md"
status: completed
created_at: 2026-06-08 21:30
updated_at: 2026-06-08 23:00
---
# 执行计划：需求4 —— UI 设计与交互模式

## 背景与目的

当前 `App.tsx` 仅为开发阶段的裸骨架（导入/导出按钮 + Req2Test 面板）。需求4需要在此之上构建完整的 UI 层，支撑需求2定义的两阶段交互流程，同时为需求6（计费）和需求7（模组）预留 UI 插槽。

## 关键设计决策（已与用户对齐）

| 决策点 | 结论 |
|---|---|
| 草稿插入定位粒度 | **段落级**：草稿按 `\n` 分段，右键某段 = 在该段末尾插入 |
| 草稿渲染方式 | 按 `\n` 拆分为 `<p>` 标签（选项 C） |
| 右侧面板行为 | **推挤 ChatArea**（flex 布局）、不持久化面板状态、图标+文字按钮 |
| 计费价格配置 | 加入 SettingsPanel |
| BillingCorner 程度 | **纯占位**：静态文本"会话用量: --"，等需求6执行时对接 |
| ConfirmDraftBar | 三个按钮：确认草稿、放弃草稿、重新生成 |
| 消息气泡 | 显示时间戳、用户左对齐 / AI 右对齐、已确认草稿与普通 AI 消息外观相同 |
| 无配置引导 | WelcomeScreen：首次无配置时显示，引导用户进行设置；配置完成后切到聊天界面 |

### 段落级插入逻辑

```
草稿内容："第一段\n第二段\n第三段"
           ↓ 右键 "第二段"
           → position = "第一段\n第二段".length
           → insertIntoDraft(position, "【判定结果】")
           → 结果："第一段\n第二段【判定结果】\n第三段"
```

## 组件树

```
App
├── WelcomeScreen (无配置时显示)
│   └── 引导文案 + "开始配置"按钮
├── TopBar
│   ├── 应用标题 "ActorYuan"
│   └── 右侧面板切换按钮 (图标+文字)
├── MainContent (flex row)
│   ├── ChatArea (flex: 1)
│   │   ├── MessageList
│   │   │   └── MessageBubble × N (用户左对齐/AI 右对齐)
│   │   │       └── [草稿消息：按<p>渲染、橙色边框/badge、右键菜单]
│   │   ├── ChatInput          (phase === 'chatting' 时显示)
│   │   ├── ConfirmDraftBar    (phase === 'reviewing_draft' 时显示)
│   │   │   ├── "确认草稿" 按钮 (→ confirmDraft)
│   │   │   ├── "放弃草稿" 按钮 (→ discardDraft)
│   │   │   └── "重新生成" 按钮 (→ regenerateDraft)
│   │   ├── DraftContextMenu   (conditional)
│   │   └── InsertDialog       (conditional)
│   └── RightPanel (可切换显示/隐藏)
│       ├── TabBar (图标切换：设置 | 模组)
│       ├── SettingsPanel
│       │   ├── Provider 选择
│       │   ├── API Key 输入
│       │   ├── Base URL 输入 (仅 OpenAI 兼容时显示)
│       │   ├── Model ID 输入
│       │   ├── 测试连接 按钮
│       │   ├── 计费价格配置 (按模型设置输入/输出每千token价格)
│       │   ├── 系统提示词编辑
│       │   └── 导入/导出 按钮
│       └── ModulePanel
│           └── 占位："模组管理功能将在后续版本实现"
└── BillingCorner (fixed, 右下角, 占位)
```

## 样式架构

- `src/index.css` —— CSS 变量（白蓝黑主题）、reset、全局基础样式
- `src/App.css` —— 布局（TopBar + MainContent + RightPanel）
- `src/components/*.css` —— 各组件样式

### 色彩方案

| 用途 | 色值 | 说明 |
|---|---|---|
| 主背景 | `#ffffff` | 白 |
| 主文字 | `#1e1e2e` | 近黑 |
| 主蓝色 | `#2563eb` | 按钮、强调、边框 |
| 浅蓝背景 | `#eff6ff` | AI 消息气泡（右侧） |
| 灰色背景 | `#f3f4f6` | 用户消息气泡（左侧） |
| 边框 | `#e5e7eb` | 分隔线、边框 |
| 草稿标记 | `#f59e0b` | 草稿状态 badge、边框 |
| 错误 | `#ef4444` | 错误提示 |
| 次要文字 | `#6b7280` | 时间戳、辅助信息 |

### 核心交互流

```
[chatting 阶段]
  用户输入 → sendMessage() → loading → AI 返回草稿
  → 进入 reviewing_draft 阶段

[reviewing_draft 阶段]
  显示草稿消息（按<p>分段渲染）+ 橙色边框/badge
  → 用户右键某段落 → 光标定位 → 弹出菜单 → "插入判定结果"
  → InsertDialog 弹窗 → 输入内容 → 确认
  → 内容以【】包裹插入到段尾
  → "插入判定结果"菜单项禁用（每草稿仅一次插入）
  → 显示 ConfirmDraftBar（确认/放弃/重新生成）
    ├─ 确认草稿 → confirmDraft() → 切回 chatting
    ├─ 放弃草稿 → discardDraft() → 删除草稿 → 切回 chatting
    └─ 重新生成 → regenerateDraft() → 删除草稿 → 重新调用AI → 新草稿
  → 回到 chatting 阶段
```

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S0` | dataStore 增加 `deleteMessage`：用于放弃草稿和重新生成时删除草稿消息 | 无 | `src/services/dataStore.tsx`（修改） | 已完成 |
| `S1` | 全局样式重置：替换 Vite 模板样式，建立白蓝黑主题 CSS 变量 | 无 | `src/index.css`（重写）、`src/App.css`（重写） | 已完成 |
| `S2` | TopBar 组件 + App 布局骨架：左右分栏（flex）、标题、面板开关按钮（图标+文字） | `S1` | `src/components/TopBar.tsx` + `.css`、`src/App.tsx`（重写） | 已完成 |
| `S3` | MessageList + MessageBubble：消息渲染、用户左对齐/AI右对齐、时间戳、草稿消息按 `<p>` 分段+橙色 badge、自动滚动到底部 | `S2` | `src/components/MessageList.tsx`、`src/components/MessageBubble.tsx` + `.css` | 已完成 |
| `S4` | ChatInput：输入框 + 发送按钮、loading 态禁用、phase 感知（仅 chatting 显示） | `S2` | `src/components/ChatInput.tsx` + `.css` | 已完成 |
| `S5` | 草稿交互 UI：ConfirmDraftBar（确认/放弃/重新生成三按钮）、段落级右键菜单（DraftContextMenu）、InsertDialog 弹窗、【】包裹插入逻辑 | `S0` `S3` | `src/components/ConfirmDraftBar.tsx`、`src/components/DraftContextMenu.tsx`、`src/components/InsertDialog.tsx` + `.css`、`src/hooks/useConversation.ts`（增加 discardDraft、regenerateDraft） | 已完成 |
| `S6` | RightPanel 外壳 + Tab 切换（设置/模组，纯文字或图标标签） | `S2` | `src/components/RightPanel.tsx` + `.css` | 已完成 |
| `S7` | SettingsPanel：Provider 选择、API Key、Base URL、Model ID、测试连接、**计费价格配置**、系统提示词编辑、导入/导出按钮 | `S6` | `src/components/SettingsPanel.tsx` + `.css` | 已完成 |
| `S8` | WelcomeScreen：检测是否有有效配置（非 mock 且有 API Key），无配置时显示引导页 + "开始配置"按钮（打开右侧设置面板） | `S2` `S6` | `src/components/WelcomeScreen.tsx` + `.css` | 已完成 |
| `S9` | ModulePanel 占位 + BillingCorner 占位 | `S6` | `src/components/ModulePanel.tsx`、`src/components/BillingCorner.tsx` + `.css` | 已完成 |
| `S10` | 整体集成：App.tsx 接入 useConversation/dataStore、WelcomeScreen 与聊天视图切换、移除 Req2Test 面板、全流程联调 | `S4` `S5` `S7` `S8` `S9` | `src/App.tsx` | 已完成 |

### 步骤依赖图

```
S0 (deleteMessage)  ────────────────────────┐
S1 (全局样式)                                 │
 └─ S2 (布局 + TopBar)                        │
     ├─ S3 (MessageList)                      │
     │   └─ S5 (草稿交互 UI) ← S0 ────────────┤
     ├─ S4 (ChatInput)                        │
     └─ S6 (RightPanel)                       │
         ├─ S7 (SettingsPanel)                │
         ├─ S8 (WelcomeScreen) ← S2+S6        │
         └─ S9 (占位组件)                      │
              ↓                               │
S10 (集成) ← S4 + S5 + S7 + S8 + S9 ─────────┘
```

## 风险与约束声明

- **风险1**：RightPanel 在移动端/窄屏会挤压聊天区，当前不做响应式适配（MVP 桌面端优先）
- **风险2**：段落级右键定位需要处理：右键时先设置光标位置再弹出菜单，否则 `window.getSelection()` 可能返回旧选区
- **约束1**：需求6、需求7仅占位——BillingCorner 显示静态文本，ModulePanel 显示占位提示
- **约束2**：不引入第三方 UI 库、CSS 框架，全部手写 CSS
- **约束3**：`discardDraft` 和 `regenerateDraft` 需要 dataStore 新增 `deleteMessage` 方法
- **约束4**：WelcomeScreen 的判断逻辑：Provider 为 `mock` 且无 API Key → 视为未配置；Provider 为 `openai`/`anthropic` 且有 API Key → 视为已配置

## 测试验证方案

1. **WelcomeScreen 流程**：
   - 清除 localStorage → 打开应用 → 显示 WelcomeScreen
   - 点击"开始配置"→ 打开右侧设置面板 → 填写 API Key 等 → WelcomeScreen 消失，显示聊天界面

2. **布局检查**：
   - 左侧聊天区 + 右侧面板（默认隐藏）→ 点击 TopBar 按钮 → 右侧面板推挤 ChatArea
   - ChatArea 自适应宽度

3. **直接对话流程**：
   - 配置 API（Mock 模式可跳过）→ 输入框输入内容 → 发送
   - 显示用户消息气泡（左对齐, 灰色, 带时间戳）+ loading → 显示 AI 草稿（橙色边框/badge, 右对齐）

4. **草稿插入流程**（段落级）：
   - AI 输出多段落草稿后 → ConfirmDraftBar 出现（确认/放弃/重新生成）
   - 右键点击第二段 → 弹出菜单"插入判定结果"→ InsertDialog 弹出
   - 输入内容 → 确认 → 第二段末尾出现【插入内容】
   - 再次右键 → "插入判定结果"已禁用
   - 点击"确认草稿"→ 草稿 badge 消失 → 回到 chatting 阶段

5. **放弃草稿流程**：
   - AI 输出草稿后 → 点击"放弃草稿"→ 草稿被删除 → 回到 chatting 阶段

6. **重新生成流程**：
   - AI 输出草稿后 → 点击"重新生成"→ 旧草稿消失 → loading → 新草稿出现

7. **设置面板**：
   - 打开右侧面板 → 切换到"设置"Tab → 修改 Provider
   - Base URL 输入框仅在 OpenAI 兼容时显示
   - 填写 API Key/Model → 点击"测试连接"→ 成功/失败反馈
   - 计费价格配置（输入/输出每千token价格）可编辑
   - 系统提示词 textarea 可编辑
   - 导入/导出按钮可用

8. **占位检查**：
   - BillingCorner 始终显示在右下角（"会话用量: --"）
   - ModulePanel 显示占位提示文本

9. **类型检查**：`npx tsc --noEmit` 零错误

## 📝 执行记录

- `2026-06-08 21:30`: 计划初版生成
- `2026-06-08 22:00`: 与用户对齐关键决策：段落级定位、ConfirmDraftBar三按钮、WelcomeScreen、BillingCorner纯占位、计费价格进SettingsPanel
- `2026-06-08 22:00`: 计划更新为11步骤 (S0-S10)，新增 S0(deleteMessage) 和 S8(WelcomeScreen)
- `2026-06-08 23:00`: S0-S10 全部执行完成，`npx tsc --noEmit` 通过
