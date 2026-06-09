---
plan_name: 需求7-模组导入
related_request: "wiki/abstract/req7.md"
status: completed
created_at: 2026-06-09
---
# 执行计划：需求7 —— 模组导入

## 背景

ModulePanel 当前为占位组件。需实现完整的模组管理功能：文件导入（.txt/.md）、文本框查看编辑、替换/追加选择、元信息展示。模组内容已通过 `data.module` + `buildSystemPrompt` 注入系统提示词，本计划聚焦 UI 层实现。

## 核心设计决策

- 数据模型：保持单一 `data.module` 字段，用户自由组织大纲与设定
- 文件导入交互：**自定义 Dialog 弹窗**（非浏览器 confirm），三按钮 —— 替换/追加/取消，风格统一
- 追加分隔符：`"\n\n---\n\n"` 拼接新旧内容
- 文件格式：仅 `.txt` 和 `.md`
- 编辑模式：textarea 即时保存（跟随 SettingsPanel 系统提示词编辑区的模式）
- 元信息：文件名、导入时间（仅文件导入时更新，手动编辑后保留作为"来源"信息；清空或新文件导入时更新；纯手打从未导入显示 `—`）+ 行数、字符数（实时计算）
- 清空操作：需 Dialog 二次确认
- 按钮位置：toolbar 在 textarea **上方**
- UI 风格：复用 SettingsPanel 的 `.setting-*` CSS 类体系

## 任务步骤

| 步骤ID | 任务描述 | 前置依赖 | 交付物/修改路径 | 状态 |
|---|---|---|---|---|
| `S0` | 对齐讨论结论，更新执行计划 | 无 | `wiki/plan/req7.md` | 已完成 |
| `S1` | 创建 Dialog 通用弹窗组件（遮罩+居中卡片，多按钮配置） | 无 | `src/components/Dialog.tsx`、`src/components/Dialog.css` | 已完成 |
| `S2` | 重写 ModulePanel 组件：toolbar（导入/清空按钮）+ textarea + 元信息行 + Dialog 集成 | `S1` | `src/components/ModulePanel.tsx` | 已完成 |
| `S3` | 实现文件导入逻辑：FileReader → Dialog 替换/追加 → setModule；清空 Dialog 确认 | `S2` | `src/components/ModulePanel.tsx` | 已完成 |
| `S4` | 重写 ModulePanel.css：复用 `.setting-*` 样式体系 | `S2` | `src/components/ModulePanel.css` | 已完成 |
| `S5` | TypeScript 编译检查 | `S2`, `S3`, `S4` | `npx tsc --noEmit` | 已完成 |
| `S6` | 更新 WIKI 记忆库（摘要 + index + 计划状态） | `S5` | `wiki/abstract/req7.md`、`wiki/index.md`、`wiki/plan/req7.md` | 已完成 |

## 风险与约束声明

- 模组文本可能较大（数万字），textarea 即时保存会频繁触发 `setModule` → `setDirty(true)`，但 React 19 自动批处理不会造成性能问题，与 SettingsPanel 系统提示词编辑区行为一致
- 文件编码仅支持 UTF-8（FileReader.readAsText 默认），GBK 等编码文件会乱码——当前版本不处理编码检测

## 测试验证方案

1. **文件导入-替换**：打开 ModulePanel → 点击导入 → 选择 .md 文件 → Dialog 点"替换" → 验证 textarea 显示文件内容、元信息更新
2. **文件导入-追加**：已有模组内容 → 导入另一个文件 → Dialog 点"追加" → 验证新内容以 `\n\n---\n\n` 追加到末尾
3. **文件导入-取消**：导入文件 → Dialog 点"取消" → 验证内容不变
4. **手动编辑**：在 textarea 中直接编辑 → 切换到其他标签再切回 → 验证内容保持
5. **清空**：点击清空 → Dialog 确认 → 验证 textarea 清空、元信息重置
6. **模组注入验证**：导入模组后发送对话 → 打开 Debug 面板 → 验证系统提示词包含 `## 模组设定` 及模组内容
7. **JSON 导出导入**：导出 JSON → 导入 JSON → 验证模组内容完整恢复
8. **TypeScript**：`npx tsc --noEmit` 零错误

## 📝 执行记录

- `2026-06-09`: 计划已生成，待用户确认后执行
- `2026-06-09`: 与用户对齐5个关键决策：自定义Dialog、追加分隔符`\n\n---\n\n`、元信息行为、清空确认、toolbar位置上置。开始执行。
- `2026-06-09`: S0-S6 全部交付。创建 Dialog 通用弹窗、重写 ModulePanel（toolbar + textarea + 元信息 + 替换/追加/清空）、`npx tsc --noEmit` 零错误。WIKI 记忆库已更新。
