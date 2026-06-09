---
plan_name: 修复测试发现的4个问题
related_request: "docs/issues.md"
status: completed
created_at: 2026-06-09
---
# 执行计划：修复 issues.md 中的 4 个问题

## 背景

用户测试后发现 4 个问题，涉及草稿交互流程重构（问题3）、单轮对话架构变更（问题4）、导入数据后草稿状态丢失（问题1）、计费面板位置调整（问题2）。问题3和问题4在「确认草稿→纳入上下文→构建下一轮用户消息」环节强耦合，需在同一计划中实现。

## 核心架构变更

### 数据模型

```
AppData {
  module: string;
  messages: Message[];       // 简化为 [user, assistant]
  contextHistory: string;    // 新增：累积的已确认情节文本
}
```

### 消息结构

- 旧：`[system(未存), user₁, assistant₁(draft/confirmed), user₂, assistant₂(draft/confirmed), ...]`
- 新：`[user(contextHistory + 玩家操作), assistant(draft/confirmed)]`
- user 消息由代码自动拼接：`上下文（历史情节）：\n{contextHistory}\n\n玩家操作：\n{用户输入}`
- system 提示词动态构建，不存入 messages 数组
- 模组内容注入 system 提示词

### 草稿状态机（MessageBubble 内）

```
viewing（默认）：只读展示 + [重新生成] [放弃草稿] [编辑草稿] [确认草稿]
  ↓ 点击"编辑草稿"
editing：textarea + [保存] [取消]
  ↓ 点击"保存"
loading → AI 重写 → 新草稿 → 回到 viewing
  ↓ 点击"取消"
回到 viewing
```

### 【】解析规则

- 保存编辑草稿时：提取第一个 `【` 之前的内容 → 加入 contextHistory
- 确认草稿时：将确认后的全部内容加入 contextHistory
- 无 `【` 时：保存不提取任何内容，确认时全量加入

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | 数据模型扩展：AppData/ExportData 新增 contextHistory 字段，DataStore 新增 appendContextHistory、resetMessages | 无 | `src/types/storage.ts`, `src/services/dataStore.tsx` | 已完成 |
| `S2` | 修复问题1：useConversation 新增 useEffect 监听 data.messages 中 draft 状态，自动同步 phase | 无 | `src/hooks/useConversation.ts` | 已完成 |
| `S3` | 新增 draftEditRewriteMode 配置参数（full / narrative-only），getter/setter + SettingsPanel UI | 无 | `src/services/configStorage.ts`, `src/components/SettingsPanel.tsx` | 已完成 |
| `S4` | 重构 useConversation 为单轮对话模式：sendMessage 拼接 user 消息、confirmDraft 写入 contextHistory、新增 saveEditedDraft | `S1`, `S2` | `src/hooks/useConversation.ts` | 已完成 |
| `S5` | buildSystemPrompt 注入模组内容（data.module → 系统提示词） | `S1` | `src/services/configStorage.ts` | 已完成 |
| `S6` | 重构 MessageBubble 草稿交互：viewing/editing 状态机、按钮组、textarea 切换 | `S4` | `src/components/MessageBubble.tsx`, `src/components/MessageBubble.css` | 已完成 |
| `S7` | 移除 ConfirmDraftBar，App.tsx 调整：phase='reviewing_draft' 时 ChatInput 隐藏、draft 消息气泡自带按钮 | `S6` | `src/App.tsx`（删除 `ConfirmDraftBar.tsx` + `.css`） | 已完成 |
| `S8` | 修复问题2：BillingCorner 移到页面顶部居中 | 无 | `src/components/BillingCorner.css` | 已完成 |
| `S9` | TypeScript 编译检查 + 功能验证 | `S1`-`S8` | `npx tsc --noEmit` 零错误 | 已完成 |

## useConversation 新增/变更 API

| 方法 | 类型 | 说明 |
|---|---|---|
| `saveEditedDraft(content)` | 新增 | 解析【】前内容加入 contextHistory → API 重写 → 新草稿 |
| `startEditingDraft()` | 新增 | phase → 'editing_draft'（或本地状态） |
| `cancelEditingDraft()` | 新增 | 恢复到原始草稿内容 |
| `sendMessage(content)` | 变更 | 拼接 contextHistory + 用户输入为 user 消息 |
| `confirmDraft()` | 变更 | 确认后内容加入 contextHistory |
| `discardDraft()` | 变更 | 删除草稿，保留 user 消息和 contextHistory |

## 风险与约束声明

- ExportData 版本从 1 → 2（新增 contextHistory 字段），旧版导出文件不兼容
- 草稿编辑的「查看」与「编辑」状态切换在 MessageBubble 组件内管理，useConversation 保持对全局 phase 的控制
- 确认草稿时 reasoning 依旧清除（不持久化），与需求5行为一致

## 测试验证方案

1. **问题1**：导入含 draft 消息的 JSON → ConfirmDraftBar（或气泡按钮）出现
2. **问题2**：BillingCorner 在页面顶部居中显示
3. **问题3-草稿按钮**：AI 输出后 → 气泡下显示 4 个按钮 → 点"编辑草稿"→ textarea + 保存/取消 → 点"取消"→ 恢复 4 按钮 → 点"保存"→ AI 重写 → 新草稿
4. **问题3-【】解析**：编辑草稿插入 `内容A【判定】内容B` → 保存 → `内容A` 加入 contextHistory → AI 重写
5. **问题3-确认**：点"确认草稿"→ 草稿内容加入 contextHistory → phase 回到 chatting
6. **问题3-重新生成**：点"重新生成"→ 只重生成情节（复用 reasoning）
7. **问题4-单轮对话**：连续多轮 → messages 始终只有 [user, assistant] → user 消息包含累积的上下文 + 新玩家操作
8. **配置参数**：SettingsPanel 中切换 draftEditRewriteMode → 编辑保存时行为变化
9. `npx tsc --noEmit` 零错误

## 📝 执行记录

- `2026-06-09`: 计划已生成，等待用户确认
- `2026-06-09`: **前半部分（S1-S5）已完成**。S1 数据模型扩展（contextHistory + resetMessages + 旧版导入迁移）；S2 useEffect phase 同步；S3 draftEditRewriteMode 配置（默认 narrative-only）；S4 useConversation 单轮对话重构（移除 setDraftContent/insertIntoDraft，新增 saveEditedDraft/startEditingDraft/cancelEditingDraft）；S5 buildSystemPrompt(module) 模组注入。`npx tsc --noEmit` 零错误。
- `2026-06-09`: **后半部分（S6-S9）已完成**。S6 MessageBubble 重构：viewing（段落渲染 + 4 按钮：重新生成/放弃草稿/编辑草稿/确认草稿）↔ editing（textarea + 保存/取消）状态机；S7 移除 ConfirmDraftBar 组件，App.tsx phase !== 'chatting' 时隐藏 ChatInput，草稿操作由气泡内按钮完成；S8 BillingCorner fixed 顶部居中；S9 `npx tsc --noEmit` 零错误。计划全部交付，状态 completed。
