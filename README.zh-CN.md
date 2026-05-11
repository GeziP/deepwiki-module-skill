[English](README.md) | [中文](README.zh-CN.md)

# DeepWiki 技术文档生成 Skill

多平台 Skill（Claude Code / Cursor / Codex），用于生成技术设计文档。支持**代码语法高亮**、**深色/浅色主题**、**索引导航页**。支持中英文双语。**双格式输出：Markdown + HTML。**

## 快速开始

```bash
# Claude Code
git submodule add https://github.com/GeziP/deepwiki-module-skill.git .claude/skills/deepwiki-module-skill

# Cursor
git submodule add https://github.com/GeziP/deepwiki-module-skill.git .cursor/skills/deepwiki-module-skill
```

无需其他配置，会话开始时自动加载。

## 使用

```
> deepwiki src/scheduler/Task.h
> 给 Task 生成 deepwiki 文档
> generate doc for Module class
```

自动识别语言：
- 中文对话 → 使用 `template.md`（中文模板）
- 英文对话 → 使用 `template.en.md`（英文模板）

输出：
- `doc/tech-docs/<ModuleName>_Design.md`（Markdown）
- `doc/tech-docs/<ModuleName>_Design.html`（HTML，单文件，代码高亮）

## 特性

- **代码语法高亮** — highlight.js，C++ / JSON / Bash 自动识别，主题感知配色
- **深色 / 浅色主题** — 跟随系统偏好，一键切换 + localStorage 记忆
- **索引导航页** — 自动生成 `index.html`，支持搜索、分组筛选、卡片布局
- **双格式输出** — 同时生成 Markdown 和 HTML 两种格式
- **单文件 HTML** — 零外部依赖（仅 CDN highlight.js），可离线浏览 / 分享
- **可折叠章节** — 12 章结构化文档，按需展开 / 收起
- **ASCII 图表（MD）** — 架构图、状态机、流程图，无需 UML 工具
- **内联 SVG（HTML）** — 高密度图表，支持深色/浅色主题
- **双语支持** — 自动识别语言选择模板

## 文件结构

```
deepwiki-module-skill/
├── SKILL.md                    # 主 skill 文件（双语触发）
├── README.md                   # 说明文档（英文）
├── README.zh-CN.md             # 说明文档（中文）
├── template.md                 # 中文 Markdown 模板（默认）
├── template.en.md              # 英文 Markdown 模板
├── template.html               # HTML 模板（含 highlight.js）
├── template-index.html         # 索引导航页模板
├── template-architecture.html  # HTML 模板（架构文档）
├── template-guide.html         # HTML 模板（指南）
├── template-issue.html         # HTML 模板（问题报告）
├── template-report.html        # HTML 模板（项目报告）
├── md-to-html.js               # MD 转 HTML 工具
└── examples/
    └── Task_Design.md          # 完整示例（中文）
```

## 模板

| 文件 | 语言 | 格式 | 用途 |
|------|------|------|------|
| `template.md` | 中文 | Markdown | 中文用户默认 |
| `template.en.md` | 英文 | Markdown | 英文用户 |
| `template.html` | 中文 | HTML | 主 HTML 模板（含语法高亮） |
| `template-index.html` | 中文 | HTML | 索引导航页 |
| `template-architecture.html` | 中文 | HTML | 架构文档 |
| `template-guide.html` | 中文 | HTML | 用户指南 |
| `template-issue.html` | 中文 | HTML | 问题报告 |
| `template-report.html` | 中文 | HTML | 项目报告 |

## MD 转 HTML 工具

使用 `md-to-html.js` 将现有 Markdown 文档转换为 HTML：

```bash
# 转换单个文件
node md-to-html.js doc/tech-docs/Task_Design.md

# 转换所有 .md 文件
node md-to-html.js --all

# 生成索引导航页
node md-to-html.js --index "项目名" "项目描述"

# 预览不写入
node md-to-html.js --dry-run --all
```

## 文档结构

| 章节 | 内容 |
|------|------|
| 1. 概述 | 背景、问题、解决方案 + 架构图 |
| 2. 设计目标 | 功能目标、非功能目标 |
| 3. 架构设计 | 模块关系、职责划分 |
| 4. 核心概念 | 数据结构、枚举、常量 |
| 5. 状态机 | 状态定义、转换图（可选） |
| 6. 流程图 | 核心流程（可选） |
| 7. 实现细节 | 关键代码片段 |
| 8. API 参考 | 公开接口表 |
| 9. 使用指南 | 可运行示例 |
| 10. 常见问题 | FAQ（可选） |
| 11. 测试覆盖 | 测试用例表 |
| 附录 | 文件清单、依赖关系 |

## 示例

查看 [examples/Task_Design.md](examples/Task_Design.md) 了解完整输出格式。

## License

MIT