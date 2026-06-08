---
plan_name: 需求5-双输出模式
related_request: "docs/项目文档 OUTDATE.md"
status: completed
created_at: 2026-06-08 23:59
---
# 执行计划：AI 主持人双输出模式

## 背景

需求5要求 AI 主持人采用两阶段链式推理：先内部推演（隐藏，中间产物），再输出情节正文（可见）。方案 A（两次 API 调用），推演方案可折叠查看，默认隐藏，确认草稿后清除推演方案不持久化。草稿编辑方式由"右键段落插入"改为 textarea 自由编辑。

## 核心决策摘要

| 决策点 | 结论 |
|---|---|
| 实现方案 | 两次 API 调用（方案 A） |
| 推演方案可见性 | 可折叠查看，默认折叠隐藏 |
| 推演方案持久化 | 不存储到导出 JSON，confirm 时清除 |
| 数据模型 | Message 新增 `reasoning?: string` |
| 推演注入方式 | 拼接至系统提示词（第2次调用） |
| 提示词模板 | `{stage}` 占位符替换 |
| 草稿编辑 | textarea 自由编辑替代右键段落插入 |
| Loading 展示 | 分阶段："推演剧情思路" / "输出游戏情节" |
| regenerateDraft | 复用已有 reasoning，只重调第2次 |
| 废弃组件 | 删除 DraftContextMenu、InsertDialog |

## 内容

### 数据流

```
用户输入
  → addMessage('user', content)
  → loadingStage='reasoning'
  → service.chat(messages, buildPrompt('推演方案制定'))
  → reasoning = response.content
  → loadingStage='narrating'
  → service.chat(messages, buildPrompt('游戏情节推演') + reasoning)
  → narrative = response.content
  → addMessage('assistant', narrative, 'draft', reasoning)
  → phase='reviewing_draft'
  → [用户自由编辑 textarea → setDraftContent]
  → confirmDraft → 清除 reasoning, status='confirmed'
```

### 系统提示词模板

默认系统提示词（用户可在设置中修改，必须保留 `{stage}` 占位符）：

```
你是一位资深的TRPG游戏主持人。

当前阶段：{stage}

你的职责是根据上下文、玩家行为和相关游戏数据进行情节推演。
- 处于"推演方案制定"阶段时：分析当前局势，制定推演思路和可能的发展方向，不需要输出完整情节。
- 处于"游戏情节推演"阶段时：基于推演方案，输出生动、沉浸式的游戏情节叙述。
```

`buildSystemPrompt(stage, reasoning?)` 逻辑：
1. 从 localStorage 读取用户配置的提示词（若无则用默认值）
2. 替换 `{stage}` 为 `stage` 参数值
3. 若 `reasoning` 存在，追加 `\n\n## 推演方案\n${reasoning}`

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S1` | Message 类型新增 `reasoning` 字段 | 无 | `src/types/storage.ts` | 已完成 |
| `S2` | configStorage 新增默认提示词常量 + `buildSystemPrompt(stage, reasoning?)` 函数 | 无 | `src/services/configStorage.ts` | 已完成 |
| `S3` | useConversation 核心重构：双阶段 API 调用、loadingStage、setDraftContent、confirmDraft 清除 reasoning、移除 insertIntoDraft。第2次调用失败时保留 reasoning 让用户重试 | `S1`, `S2` | `src/hooks/useConversation.ts` | 已完成 |
| `S4` | MessageBubble 重构：草稿消息渲染为 textarea + collapsible reasoning 区块 | `S1`, `S3` | `src/components/MessageBubble.tsx`, `src/components/MessageBubble.css` | 已完成 |
| `S5` | MessageList 精简：移除 draftContextMenu 相关 props | `S4` | `src/components/MessageList.tsx` | 已完成 |
| `S6` | ConfirmDraftBar 更新：提示文案 + loading 文案分页 | `S3` | `src/components/ConfirmDraftBar.tsx` | 已完成 |
| `S7` | ChatInput 更新：loading 文案分阶段显示 + pendingReasoning 重试/取消 UI | `S3` | `src/components/ChatInput.tsx`, `src/components/ChatInput.css` | 已完成 |
| `S8` | App.tsx 清理：移除 DraftContextMenu/InsertDialog/contextMenu/insertDialog/draftInserted 相关代码和状态 | `S4`, `S5` | `src/App.tsx` | 已完成 |
| `S9` | 删除废弃组件文件 | `S8` | 删除 `DraftContextMenu.tsx`、`DraftContextMenu.css`、`InsertDialog.tsx`、`InsertDialog.css` | 已完成 |
| `S10` | TypeScript 类型检查通过 | `S1`-`S9` | `npx tsc --noEmit` | 已完成 |
| `S11` | WIKI 记忆库更新（摘要 + index） | `S10` | `wiki/abstract/req5.md`、`wiki/index.md` | 已完成 |

## 风险与约束声明

- **风险1**：两次 API 调用使延迟翻倍，用户体验可能下降。缓解：loading 分阶段提示让用户感知进度。
- **风险2**：textarea 自由编辑替代原插入机制后，用户无法方便地在特定位置以 `【】` 格式插入计算结果，需要手动输入。这是需求变更的自然结果，但需确认用户接受。
- **约束1**：系统提示词模板 `{stage}` 占位符是硬约束。用户若在 SettingsPanel 中删除 `{stage}` 会导致阶段信息丢失。
- **约束2**：MockProvider 的 `chat()` 当前返回固定内容。为支持双输出模式测试，需在 MockProvider 中适配（返回带 reasoning 的内容或分阶段返回不同内容）。
- **扩散范围**：涉及 8+ 文件修改 + 2 文件删除。核心变更集中在 S1-S3（类型+服务+Hook），UI 层变更（S4-S8）为配套适配。

## 测试验证方案

1. **S1-S2 单元验证**：`npx tsc --noEmit` 确认类型无错误
2. **双输出流程**：使用 Mock 模式
   - 发送消息 → 观察 loading 文案依次显示"推演剧情思路" → "输出游戏情节"
   - 草稿出现后 → 确认 reasoning 折叠区块存在且默认折叠
   - 展开 reasoning → 确认推演内容可见
   - 在 textarea 中编辑草稿 → 修改内容
   - 点击"确认草稿" → reasoning 区块消失，消息状态变为 confirmed
3. **regenerateDraft**：点击重新生成 → 只发起一次 API 调用（narrating），reasoning 不变
4. **discardDraft**：放弃草稿 → 草稿及触发用户消息均被删除
5. **SettingsPanel**：验证系统提示词 textarea 显示默认模板含 `{stage}`
6. **旧组件删除**：确认 DraftContextMenu、InsertDialog 不再出现在代码库中
7. **TypeScript 编译**：`npx tsc --noEmit` 零错误

## 📝 执行记录

- `2026-06-08 23:59`: 计划已生成，待用户确认后执行
- `2026-06-08`: 与用户对齐细节：textarea编辑整个草稿、reasoning在上方三角箭头折叠、第2次调用失败保留reasoning重试、regenerate只重生成情节、MockProvider分阶段方案、{stage}强制校验拒绝保存
- `2026-06-08`: S1-S11 全部执行完成，`npx tsc --noEmit` 零错误
