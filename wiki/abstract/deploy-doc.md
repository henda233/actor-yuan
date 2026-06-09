---
abstract_name: 部署文档
source_contents:
  - "docs/部署文档.md"
dependencies:
  - "wiki/abstract/doc-features.md"
  - "wiki/abstract/init-vite.md"
created_at: 2026-06-09 17:30
updated_at: 2026-06-09 17:30
---
# 摘要：部署文档

## 核心结论与关键信息

- 部署教程面向熟悉 Linux 但不熟悉 Nginx 的读者，覆盖从裸机安装到验证的全流程
- 部署环境：Ubuntu 22.04 + Nginx，纯静态 SPA，无域名、无 HTTPS、IP+端口访问
- 部署路径 `/var/www/actor-yuan/`，构建产物为 `dist/`（`npm run build` 生成）
- Nginx 配置关键点：`try_files` SPA fallback、Gzip 压缩、`/assets/` 长期缓存
- 用户自行负责文件传输，文档不涵盖 scp/rsync 等内容

## 内容概述

`docs/部署文档.md` 共 9 个章节：

1. **环境说明**：服务器、Web 服务、部署路径、构建产物一览
2. **安装 Nginx**：apt 安装 + 验证步骤
3. **配置防火墙**：ufw 放行端口 + 云服务器安全组提醒
4. **部署文件**：创建目录、上传 dist、权限设置（www-data）
5. **配置 Nginx**：站点配置文件详解（server 块、Gzip、try_files、assets 缓存）、启用站点、语法检查、重载
6. **验证部署**：浏览器验证清单
7. **常用管理命令**：systemctl 启停、日志查看
8. **更换端口**：非 80 端口的配置调整
9. **故障排查**：常见问题与检查项速查表

## 依赖与影响链

- **上游依赖**：功能文档（了解项目架构和构建命令）、Vite 初始化（了解构建输出）
- **下游被依赖**：无（终端文档，不驱动代码变更）
- **变更扩散评估**：低（仅当构建输出结构或部署路径变化时需要更新）
