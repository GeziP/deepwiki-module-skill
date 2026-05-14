---
name: deepwiki-module
description: 用于生成代码模块/类的技术设计文档。生成包含架构图、API 参考、使用示例和测试覆盖的完整文档，支持中英文。同时输出 Markdown 和 HTML 两种格式。
---

TRIGGER when:
  - 用户说 "生成 deepwiki 文档", "deepwiki <file>", "技术设计文档", "给 X 写文档", "为这个模块生成文档"
  - 用户说 "generate deepwiki doc", "deepwiki <file>", "technical design document", "create documentation for X"
DO NOT TRIGGER when: user asks about general documentation concepts without requesting generation

# DeepWiki 技术文档生成器 / Technical Documentation Generator

## Overview / 概述

**DeepWiki is a technical documentation format emphasizing architecture visualization, API completeness, and runnable code examples.**

**DeepWiki 是一种技术文档格式，强调架构可视化、API 完整性和代码示例可运行性。**

Core principles / 核心原则：
- One document per module / 每个模块一份独立文档
- **Dual format output / 双格式输出**: 同时生成 `.md` 和 `.html` 两种格式
- ASCII diagrams in MD / MD 中使用 ASCII 图表
- Inline SVG diagrams in HTML / HTML 中使用内联 SVG 图表（信息密度高 3-5 倍）
- Collapsible sections in HTML / HTML 中使用可折叠章节
- Tabs component in HTML / HTML 中使用 Tabs 组件
- API reference tables / API 参考表
- Runnable code examples / 可运行代码示例
- Test coverage tracking / 测试覆盖追踪

**Output path / 输出路径**:
- `doc/tech-docs/<ModuleName>_Design.md` (Markdown)
- `doc/tech-docs/<ModuleName>_Design.html` (HTML, 单文件零依赖)

---

## 先问后做原则 / Ask-First Principle

**遇到任何不确定的情况，必须先询问用户，禁止猜测后执行。**

需要询问的典型场景：
- 语言偏好（中文/英文模板）
- 目标文件不明确（单文件多类、入口文件不确定）
- 模块边界模糊（哪些相关文件需要覆盖）
- 章节取舍（哪些章节适用、哪些可跳过）
- 输出路径或命名约定
- 用户意图有多种合理解读

使用 AskUserQuestion 时，提供 2-4 个具体选项 + "Other" 自定义输入。

## Language Selection / 语言选择

When generating documentation, detect user's language preference:
生成文档时，检测用户语言偏好：

- If user speaks Chinese → use `template.md` (中文模板)
- If user speaks English → use `template.en.md` (英文模板)
- User can explicitly specify: "用英文模板" / "use English template"
- **If language cannot be reliably determined → ask first**

---

## Generation Process / 生成流程

Complete each phase before proceeding / 必须完成每个阶段才能进入下一阶段。

### Phase 1: Source Analysis / 源码分析

**Before generating any content / 生成任何内容之前:**

1. **Read Target File / 读取目标文件**
   - Parse class/struct definitions / 解析类/结构体定义
   - Extract public APIs / 提取公开 API
   - Identify implementation details / 识别实现细节
   - Find state variables and enums / 查找状态变量和枚举
   - Document dependencies / 记录依赖关系

2. **Identify Module Type / 识别模块类型**
   - Stateful module → needs state machine diagram / 有状态模块 → 需状态机图
   - Process module → needs flow diagram / 流程模块 → 需流程图
   - Data module → focus on data structures / 数据模块 → 侧重数据结构
   - Utility module → focus on API reference / 工具模块 → 侧重 API 参考

3. **Check Related Files / 检查相关文件**
   - Test files: `tests/<module>_test.*` / 测试文件
   - Config files / 配置文件
   - Related modules / 相关模块

4. **Record Source Locations / 记录源码位置**
   - For each key function/class/struct, record `file:line` range
   - Use Grep to locate: `pattern="function ${name}"` or `pattern="class ${name}"`
   - Output format: `src/parser.js:500-556` or `src/scheduler/Task.h:42-58`

5. **Extract Domain Terminology / 提取领域术语**
   - Collect from: class/struct names, enum values, config keys, business concepts
   - Sources: README, design.md, header files
   - Record: term, definition, source file

### Phase 2: Context Gathering / 上下文收集

1. **Find Existing Docs / 查找现有文档**
   - Check `doc/tech-docs/` for related documents

2. **Extract Test Coverage / 提取测试覆盖**
   - List test case names from test file

3. **Check Git History / 检查 Git 历史**
   ```bash
   git log --oneline --follow <file> | head -10
   ```

### Phase 3: Document Generation / 文档生成

**Generate BOTH formats simultaneously / 同时生成两种格式:**

1. **Generate Markdown / 生成 Markdown**
   - Use `template.md` or `template.en.md` structure
   - ASCII diagrams for architecture, state machine, flow charts
   - Output: `doc/tech-docs/<ModuleName>_Design.md`

2. **Generate HTML / 生成 HTML**
   - Use `template.html` as skeleton (CSS + JS already embedded)
   - Replace `{{placeholders}}` with real content
   - Inline SVG for diagrams (architecture, state machine, flow)
   - `<details open>` / `<details>` for collapsible sections
   - `.tabs` component for API reference and usage guide
   - Output: `doc/tech-docs/<ModuleName>_Design.html`

   **Shared CSS/JS / 共享样式脚本**:
   - `~/.claude/skills/shared-docs/doc-shell.css` — shared CSS (variables, dark mode, layout, components)
   - `~/.claude/skills/shared-docs/doc-shell.js` — shared JS (theme, TOC, ScrollSpy, code copy, diagram zoom)
   - Inline these into the HTML `<style>` and `<script>` sections, then add template-specific overrides

   **Hierarchical Numbering / 层级编号**:
   - H2 headings use numbers: `## 1. 概述`, `## 2. 设计目标` ...
   - H3 headings use sub-numbers: `### 2.1 目标一`, `### 2.2 目标二`
   - TOC auto-generates with numbering preserved

   **Design Decision Callouts / 设计决策 Callout**:
   - Each major section (chapters 1-9) MUST contain at least one `<aside class="callout note">` explaining **WHY** a design choice was made
   - Format: state the decision, then explain the tradeoff or alternative considered
   - Bad: "Task uses shared_ptr" (WHAT) — Good: "Task uses shared_ptr而非unique_ptr because Module队列和CancellationToken需要共享所有权" (WHY)
   - Minimum: 4 callouts per document for chapters 3/4/7/8

   **Scope Declaration / Scope 声明**:
   - Add at the top of the document, after the metadata header:
   ```html
   <div class="scope-block">
     <strong>Scope:</strong> 本文覆盖 Task 的状态机、优先级、取消机制。
     不覆盖 Module 的任务分发逻辑（见 <a href="Module_Design.html">Module_Design</a>）。
   </div>
   ```

   **Source Code References / 源码行号引用**:
   - Every code reference must include `file:line` — no bare function names
   - Use `<a class="source-ref">` links: `<a class="source-ref" href="src/parser.js#L500-L556"><code>src/parser.js:500-556</code></a>`
   - Add a **Relevant source files** block at the top of the document:
   ```html
   <div class="relevant-sources">
     <h4>关联源文件</h4>
     <ul>
       <li><a class="source-ref" href="src/parser.js#L1-L777"><code>src/parser.js</code></a> — Excel 解析核心</li>
     </ul>
   </div>
   ```
   - Add a **Sources:** block at the end of each major section:
   ```html
   <div class="sources-block">
     <span class="sources-label">Sources:</span>
     <a class="source-ref" href="src/parser.js#L500-L556"><code>src/parser.js:500-556</code></a>
   </div>
   ```

   **Glossary / 术语表**:
   - Add a glossary section before Appendix:
   ```html
   <details id="sec-glossary">
     <summary><h2>N. 术语表</h2></summary>
     <div class="section-body">
       <div class="table-wrapper">
         <table>
           <thead><tr><th>术语</th><th>说明</th><th>出处</th></tr></thead>
           <tbody>
             <tr><td><strong>cycleOffset</strong></td><td>reaction step 相对偏移量</td><td><code>src/scheduler/ReactionExpander.h</code></td></tr>
           </tbody>
         </table>
       </div>
     </div>
   </details>
   ```

**Use template structure (12 chapters) / 使用模板结构（12 章节）:**

| Chapter / 章节 | Required / 必须 |
|----------------|-----------------|
| 文档信息 / Doc Info | ✓ |
| 1. 概述 / Overview | ✓ |
| 2. 设计目标 / Design Goals | ✓ |
| 3. 架构设计 / Architecture | ✓ |
| 4. 核心概念 / Core Concepts | ✓ |
| 5. 状态机 / State Machine | ○ (if applicable) |
| 6. 流程图 / Flow Diagram | ○ (if applicable) |
| 7. 实现细节 / Implementation | ✓ |
| 8. API 参考 / API Reference | ✓ |
| 9. 使用指南 / Usage Guide | ✓ |
| 10. 常见问题 / FAQ | ○ |
| 11. 测试覆盖 / Test Coverage | ✓ |
| 附录 / Appendix | ○ |

### Phase 4: Closed-loop Validation / 闭环校验（必须步骤，不可跳过）

生成 HTML 后，**必须**运行闭环校验脚本 / After generating HTML, **must** run the validation script:

```bash
# 新文档校验（含 source refs / glossary / scope 强制检查）/ New doc validation
node ~/.claude/skills/shared-docs/validate-doc.js --new-doc --fix --type module doc/tech-docs/<ModuleName>_Design.html

# 校验并自动修复已有文档 / Validate existing docs
node ~/.claude/skills/shared-docs/validate-doc.js --fix --type module doc/tech-docs/<ModuleName>_Design.html

# 校验所有模块文档 / Validate all module docs
node ~/.claude/skills/shared-docs/validate-doc.js --fix --type module --all
```

校验覆盖 11 类内容，每类闭环（检查 → 修复 → 重新检查 → 报告）/ 11 validation categories:

| 校验项 / Category | 说明 / Description | 自动修复 / Auto-fix |
|--------|------|----------|
| Mermaid 块 | HTML 实体、箭头语法、花括号、序列图 | ✓ |
| 章节标题 ID | h2/h3 唯一 id、TOC 可定位 | ✓ |
| 代码块 | language tag、HTML 转义、bare code wrap | ✓ |
| 表格 | thead/tbody 结构 | 报告 |
| 内联 Markdown | 链接、粗体已解析 | 报告 |
| 可折叠章节 | details/summary 结构 | 报告 |
| TOC 完整性 | 非空、链接有效 | ✓ |
| HTML 骨架 | charset、viewport、lang | 报告 |
| 源码引用 | source-ref、sources-block、relevant-sources | 报告 (--new-doc 时必填) |
| 术语表 | glossary 章节存在 | 报告 (--new-doc 时必填) |
| Scope 声明 | scope-block 存在 | 报告 (--new-doc 时必填) |

**新文档必须所有校验通过（含 `--new-doc`）才能交付 / New docs must pass all checks including --new-doc before delivery**

**交互功能验证（必须手动确认）/ Interactive features (must verify manually):**

生成 HTML 后，必须逐项确认以下交互功能正常：

| 功能 | 验证方式 | 常见问题 |
|------|---------|---------|
| SVG 点击放大 | 点击架构图 → 全屏放大 → 滚轮缩放 → Esc 关闭 | SVG 缺少 viewBox 时放大后变为 300x150 |
| 代码复制按钮 | hover 代码块 → 出现 Copy 按钮 → 点击复制 | 缺少 `.copy-btn` JS 逻辑 |
| 暗色模式 | 点击主题切换 → 所有颜色正确 → 图表可读 | SVG 内硬编码颜色在暗色模式不可读 |
| 侧边栏 TOC | 点击 H2/H3 → 滚动到对应章节 → ScrollSpy 高亮 | TOC 为空或链接失效 |

---

## HTML Components Guide / HTML 组件指南

When generating HTML, use these components:

### Inline SVG Diagrams / 内联 SVG 图表

Replace ASCII art with SVG in HTML output:

```html
<figure class="diagram">
  <svg viewBox="0 0 600 300" role="img" aria-label="描述">
    <!-- Use CSS variables for theme compatibility -->
    <rect x="50" y="50" width="140" height="40" rx="6"
          fill="var(--bg,#fff)" stroke="var(--border,#dfe6e8)"/>
    <text x="120" y="75" text-anchor="middle" font-size="12"
          fill="var(--text,#1f2a30)">ComponentA</text>
  </svg>
  <figcaption>图 X.X — 描述</figcaption>
</figure>
```

SVG rules:
- All colors use CSS variables + fallback (for dark/light theme)
- `viewBox` width 480-640, height adjustable
- `role="img"` + `aria-label` for accessibility
- Nodes: `<rect rx="6">` + `<text>`, Lines: `<line>` + `marker-end`

### Collapsible Sections / 可折叠章节

```html
<details open id="sec-overview">     <!-- Important sections expanded -->
  <summary><h2>1. 概述</h2></summary>
  <div class="section-body">Content...</div>
</details>

<details id="sec-faq">               <!-- Reference sections collapsed -->
  <summary><h2>10. 常见问题</h2></summary>
  <div class="section-body">Content...</div>
</details>
```

### Tabs Component / Tabs 组件

```html
<div class="tabs">
  <input type="radio" name="api-tabs" id="api-t1" checked>
  <input type="radio" name="api-tabs" id="api-t2">
  <div class="tab-bar">
    <label for="api-t1">ExecutionResult</label>
    <label for="api-t2">ActionContext</label>
  </div>
  <div class="tab-panel"><!-- First tab content --></div>
  <div class="tab-panel"><!-- Second tab content --></div>
</div>
```

### Other Components / 其他组件

| Component | Usage |
|-----------|-------|
| Code Block | `<figure class="code-block" data-lang="cpp"><pre><code>...</code></pre></figure>` |
| Callout | `<aside class="callout info\|warning\|danger\|note"><strong>Title</strong>Content</aside>` |
| Card Grid | `<div class="card-grid cols-2\|cols-3"><article class="card accent-green">...</article></div>` |
| Flow Steps | `<div class="flow"><div class="flow-step"><b>Step</b><span>Description</span></div>...</div>` |
| Dep Tree | `<div class="dep-tree">ModuleName\n ├── Dep1\n └── Dep2</div>` |
| Changelog | `<ol class="changelog"><li><time>Date</time><span class="tag">Version</span> Description</li></ol>` |

### HTML Entity Escaping / HTML 实体转义

C++ code must escape `<`, `>`, `&`:
- `std::shared_ptr<T>` → `std::shared_ptr&lt;T&gt;`
- `a && b` → `a &amp;&amp; b`
- `operator<<` → `operator&lt;&lt;`

---

## ASCII Diagram Styles (for MD) / ASCII 图表风格（MD 用）

### Architecture Diagram / 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Module Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐                       │
│  │  ComponentA │────▶│  ComponentB │                       │
│  └─────────────┘     └─────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Machine / 状态机

```
                    ┌─────────────┐
                    │   Initial   │
                    └─────────────┘
                          │
                    start()
                          ▼
┌─────────────┐     ┌─────────────┐
│   Failed    │◀────│   Running   │
└─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Completed  │
                   └─────────────┘
```

### Flow Diagram / 流程图

```
┌─────────┐     ┌─────────┐
│ Step 1  │────▶│ Step 2  │
└─────────┘     └────┬────┘
                     │
                ┌────┴────┐
                ▼         ▼
           ┌─────────┐ ┌─────────┐
           │  Yes    │ │   No    │
           └─────────┘ └─────────┘
```

---

## Code Example Style / 代码示例风格

```cpp
// ========== Basic Usage / 基本使用 ==========

// Create a task / 创建任务
auto task = std::make_shared<Task>(Task::Config{
    .name = "SampleTask",
    .priority = 10
});

task->execute();

// ========== Advanced Usage / 进阶用法 ==========

// With callback / 带回调
task->setOnSuccess([](const TaskHookContext& ctx) {
    std::cout << "Task completed\n";
});
```

**Requirements / 要求**:
- `// ========== Title ========== ` section headers / 分节标题
- Comments explain WHY / 注释解释原因
- Include necessary imports/includes / 包含必要的导入

---

## Templates / 模板

| File / 文件 | Language / 语言 | Format / 格式 |
|-------------|-----------------|---------------|
| `template.md` | 中文（默认） | Markdown |
| `template.en.md` | English / 英文 | Markdown |
| `template.html` | 中文 | HTML (main) |
| `template-architecture.html` | 中文 | HTML (architecture) |
| `template-guide.html` | 中文 | HTML (guide) |
| `template-issue.html` | 中文 | HTML (issue) |
| `template-report.html` | 中文 | HTML (report) |

See templates for placeholders: `{{MODULE_NAME}}`, `{{FILE_PATH}}`, `{{VERSION}}`, `{{DATE}}`
查看模板了解占位符：`{{MODULE_NAME}}`, `{{FILE_PATH}}`, `{{VERSION}}`, `{{DATE}}`

---

## MD to HTML Conversion / MD 转 HTML

Use the unified converter in `~/.claude/skills/shared-docs/md-to-html.js`:

```bash
# Convert single file
node ~/.claude/skills/shared-docs/md-to-html.js --type module doc/tech-docs/Task_Design.md

# Convert all module docs
node ~/.claude/skills/shared-docs/md-to-html.js --type module --all

# Generate index page
node ~/.claude/skills/shared-docs/md-to-html.js --type module --index "HDSA" "description"

# Preview without writing
node ~/.claude/skills/shared-docs/md-to-html.js --type module --dry-run --all
```

---

## Example / 示例

See `examples/Task_Design.md` for a complete example document (Markdown).
查看 `examples/Task_Design.md` 了解完整示例文档（Markdown 格式）。

For HTML example, see `doc/tech-docs/ActionExecutor_Design.html`:
- Single-file HTML, zero external dependencies
- Inline SVG diagrams (3 diagrams) with **click-to-zoom** (fullscreen, scroll zoom, drag pan)
- Tabs for API reference (4 tabs) and usage guide (3 tabs)
- Collapsible sections (important sections expanded, FAQ/appendix collapsed)
- Dark/Light theme toggle, code copy, auto TOC
- Print optimization

---

## Quick Reference / 快速参考

| Input / 输入 | Output / 输出 |
|--------------|---------------|
| `deepwiki src/Task.h` | `doc/tech-docs/Task_Design.md` + `Task_Design.html` |
| `给 Task 生成 deepwiki 文档` | `doc/tech-docs/Task_Design.md` + `Task_Design.html` |
| `generate doc for Task` | `doc/tech-docs/Task_Design.md` + `Task_Design.html` |

---

## Red Flags / 注意事项

- Cannot find source → Ask user for path / 找不到源文件 → 询问路径
- Multiple classes in one file → Ask which to document / 单文件多类 → 询问目标
- No test file → Note in document / 无测试文件 → 文档标注
- Complex dependencies → Focus on direct deps / 复杂依赖 → 侧重直接依赖

**DO NOT / 禁止**:
- Guess without reading source / 不读源码猜测功能
- Create diagrams without understanding / 不理解就画图
- Skip required chapters / 跳过必须章节
