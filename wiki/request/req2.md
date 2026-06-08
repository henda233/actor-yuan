---
request_name: 需求2-核心交互
related_abstract: "wiki/abstract/req2.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 需求2：AI 主持人核心交互流程

## 原始需求

来自项目文档：AI主持人先出游戏情节"草稿"，用户决定哪些事件需要游戏规则计算并插入计算结果（纯文本拼接），提交后草稿变为正式内容，后续AI基于含计算结果的历史进行推演。

## 需求对齐确认

### 范围边界

- **需求2负责**：交互状态机、消息流管理、提示词管理（localStorage读写）、AI服务抽象接口 + mock
- **需求3负责**：具体API调用（OpenAI/Anthropic格式适配、token提取）
- **需求4负责**：UI渲染（对话界面、右键插入交互）

### 设计决策

| 决策点 | 结论 |
|---|---|
| 状态机粒度 | 简化：`chatting`（正常对话） / `reviewing_draft`（有待确认草稿） |
| 草稿/正式内容区分 | AI消息增加 `status: 'draft' | 'confirmed'`，AI返回即为草稿，用户确认后为正式 |
| 计算结果的插入 | 纯文本拼接，插入到草稿 content 的指定位置 |
| 提示词 | 用户提供，存储到 localStorage `actor-yuan:system-prompt` |
| AI服务接口 | `chat(messages: Message[], systemPrompt: string): Promise<string>`，需求2用mock实现 |
| 轮次模式 | 发送→AI返回草稿→用户审阅/插入→确认草稿→草稿变正式内容→下一轮AI看到含计算结果的历史 |
| 数据架构 | useConversation 直接操作 DataStore，不引入独立 ConversationManager |

### 交付物

1. 扩展 Message 类型（增加 `status` 字段）
2. 系统提示词配置服务（localStorage 读写）
3. AI 服务接口定义 + mock 实现
4. 对话管理器（状态机 + 消息操作）
5. useConversation hook（React 集成）
