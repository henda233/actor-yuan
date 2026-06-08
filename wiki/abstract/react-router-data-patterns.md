---
abstract_name: React Router Data模式开发笔记
source_contents:
  - "docs/react_routers/安装.md"
  - "docs/react_routers/路由.md"
  - "docs/react_routers/路由对象.md"
  - "docs/react_routers/数据加载.md"
  - "docs/react_routers/操作.md"
  - "docs/react_routers/导航.md"
  - "docs/react_routers/待定UI.md"
  - "docs/react_routers/自定义框架.md"
  - "docs/react_routers/测试.md"
dependencies:
  - "wiki/abstract/overview.md"
  - "wiki/abstract/req1.md"
  - "wiki/abstract/req2.md"
  - "wiki/abstract/req3.md"
  - "wiki/abstract/req4.md"
created_at: 2026-06-08
updated_at: 2026-06-08
---
# 摘要：React Router Data 模式开发笔记

## 核心结论与关键信息

- 本项目采用 React Router v7 **Data Mode**（`createBrowserRouter` + `RouterProvider`），不涉及 SSR/框架模式
- **路由结构**：`/`（主对话）、`/settings`（设置）、`/modules`（模组管理）
- MVP 阶段使用：路由 + loader/action + `useFetcher` + pending UI
- **延后**：lazy loading、middleware、`shouldRevalidate` 自定义
- 纯前端数据流策略：loader 读取 localStorage 做初始化，运行时状态通过 React Context + hooks 管理，不依赖 loader 做服务端数据获取
- 核心对话交互（AI草稿→规则计算插入→AI修正）是**组件内状态流转**，不涉及路由切换；API 调用使用 `useFetcher` 避免页面导航

## 内容概述

`docs/react_routers/` 下的 9 篇文档是 React Router v7 官方指南。本笔记提炼其中与 ActorYuan 项目相关的模式，过滤掉无关的 SSR/框架模式内容。

### 路由配置模式

使用 `createBrowserRouter` 定义路由树，通过 `RouterProvider` 挂载到 React 根节点：

```tsx
// 入口模式
import { createBrowserRouter, RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  { path: "/", Component: Conversation },
  { path: "/settings", Component: Settings },
  { path: "/modules", Component: ModuleManager },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

关键路由特性：
- **嵌套路由 + `<Outlet />`**：如果后续需要在对话页内嵌套子面板（如侧边栏），使用 children + Outlet 模式
- **动态段**：`path: "module/:moduleId"` 可用于模组详情/编辑
- **Index 路由**：`{ index: true, Component: Home }` 用于默认子路由

### 导航模式

- `<NavLink>`：需要激活态的导航链接（如侧边栏/顶部导航）
- `<Link>`：不需要激活态的普通链接
- `useNavigate`：**尽量少用**，仅在用户无交互但需导航时（如超时跳转）

### 数据交互模式（核心）

这是本项目与 React Router 结合的关键点。由于本项目是纯前端应用，loader/action 的传统用途（服务端数据获取/提交）需做适配：

**策略决定**：
- loader/action 仅做路由级轻量初始化（如从 localStorage 读取配置校验），不做重业务逻辑
- 运行时数据（对话记录、游戏状态）通过 **React Context + hooks** 管理
- API 调用（大模型请求）使用 **`useFetcher`**，因为：
  1. 不会触发页面导航/URL 变化
  2. 有独立的 pending/state 状态，适合按钮 loading、提交中禁用等 UI
  3. 调用后可通过 `fetcher.data` 获取返回数据
  4. 不会添加浏览器历史记录

```tsx
// API 调用模式
function Conversation() {
  const fetcher = useFetcher();
  const isThinking = fetcher.state !== "idle";

  const sendMessage = (content: string) => {
    fetcher.submit(
      { message: content },
      { method: "post", action: "/api/chat" } // 或使用 encType 传递 JSON
    );
  };

  return (
    <div>
      {/* 对话展示 */}
      {isThinking && <Spinner />}
      <button onClick={() => sendMessage(input)} disabled={isThinking}>
        发送
      </button>
    </div>
  );
}
```

### Pending UI 模式

利用 fetcher 的 `state` 属性提供即时反馈：

- `fetcher.state === "submitting"` → 显示"发送中..."
- `fetcher.state === "loading"` → 显示"AI 思考中..."
- `fetcher.state === "idle"` → 正常状态

对于全局导航 pending（页面跳转加载），使用 `useNavigation`：

```tsx
const navigation = useNavigation();
const isNavigating = Boolean(navigation.location);
```

### 测试模式

使用 `createRoutesStub` 对依赖路由上下文的组件进行单元测试（如使用了 `useLoaderData`、`useActionData` 的组件）。路由级集成测试推荐 E2E（Playwright/Cypress）。

## 路由与交互流的对应关系

| 路由 | 核心交互 | 数据来源 | react-router 能力 |
|---|---|---|---|
| `/` | AI 对话 + 右键插入 | Context/state + fetcher API 调用 | fetcher（API 调用）、pending UI、NavLink（导航） |
| `/settings` | 配置编辑表单 | localStorage 读写 | `<Form>` + action（保存配置）、loader（读取配置） |
| `/modules` | 模组导入/查看/编辑 | localStorage + 文件读取 | loader（列出模组）、action（保存/删除） |

## 依赖与影响链

- **上游依赖**：
  - `wiki/abstract/overview.md`（技术栈选型）
  - `wiki/abstract/req1.md`（数据存储方案决定 loader/action 的适配方式）
  - `wiki/abstract/req2.md`（核心交互决定了 fetcher 为主的 API 调用模式）
  - `wiki/abstract/req4.md`（UI 设计决定路由结构和导航模式）
- **下游被依赖**：所有后续实现需求的代码都遵循本笔记的模式
- **变更扩散评估**：高（路由架构决策影响所有页面和组件的实现方式）
