# tiny-tool-browser

## 项目简介

tiny-tool-browser 是一个用于网页内容抓取和搜索引擎内容提取的工具集，支持通过 API、本地 MCP 协议和 Dify 插件三种方式集成。适用于 AI Agent、自动化数据采集等场景。

为 12~14b 的小模型提供可用的搜索结果。

## 主要功能

- 支持通过本地浏览器（Puppeteer）抓取网页内容
- 支持百度、搜狗微信等主流搜索引擎内容提取
- 提供 RESTful API 服务
- 提供 MCP 协议服务，便于与 AI/Agent 系统集成
- 提供 Dify 插件，支持 Dify 平台调用

## 目录结构

- `packages/browser`：核心网页抓取与搜索服务（Node.js/Express）
- `packages/mcp`：MCP 协议服务，封装搜索与网页内容提取工具
- `dify-plugin`：Dify 平台插件，基于 Python
- `docker`：容器化部署相关文件

## 安装与运行

### 依赖环境

- Node.js >= 18
- pnpm >= 9
- Python >= 3.12（仅 Dify 插件需要）

### 安装依赖

```powershell
pnpm install
```

### 启动本地 API 服务

```powershell
pnpm --filter @tiny-tool/browser run build
node packages/browser/dist/app.js
```

### 启动 MCP 服务

```powershell
pnpm --filter @tiny-tool/browser-mcp run build
node packages/mcp/dist/index.js
```

### Dify 插件

详见 `dify-plugin/README.md`，可直接在 Dify 平台集成。

## 主要依赖

- express
- puppeteer-core
- rehype/remark/unified
- jsdom
- zod

## 贡献

欢迎 issue 和 PR，建议先提 issue 讨论。

## 许可证

MIT
