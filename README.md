[English](README.md) | [中文](README.zh-CN.md)

# DeepWiki Technical Documentation Generator

A multi-platform skill (Claude Code / Cursor / Codex) for generating technical design documentation with **syntax-highlighted code**, **dark/light themes**, and **index navigation**. Supports both English and Chinese. **Dual format output: Markdown + HTML.**

## Quick Start

```bash
# Claude Code
git submodule add https://github.com/GeziP/deepwiki-module-skill.git .claude/skills/deepwiki-module-skill

# Cursor
git submodule add https://github.com/GeziP/deepwiki-module-skill.git .cursor/skills/deepwiki-module-skill
```

No additional setup required. The skill auto-loads on session start.

## Usage

```
> deepwiki src/scheduler/Task.h
> 给 Task 生成 deepwiki 文档
> generate doc for Module class
```

The skill automatically detects your language:
- Chinese conversation → uses `template.md` (Chinese template)
- English conversation → uses `template.en.md` (English template)

Output:
- `doc/tech-docs/<ModuleName>_Design.md` (Markdown)
- `doc/tech-docs/<ModuleName>_Design.html` (HTML, single-file, syntax-highlighted)

## Features

- **Code Syntax Highlighting** — highlight.js with C++ / JSON / Bash auto-detection, theme-aware colors
- **Dark / Light Theme** — follows system preference, one-click toggle with localStorage memory
- **Index Navigation** — auto-generated `index.html` with search, filter by group, card grid layout
- **Dual Format Output** — both Markdown and HTML generated simultaneously
- **Single-File HTML** — zero external dependencies (except CDN highlight.js), offline-shareable
- **Collapsible Sections** — 12-chapter structure, expand/collapse as needed
- **ASCII Diagrams (MD)** — architecture, state machines, flow charts — no UML tools needed
- **Inline SVG (HTML)** — high-density diagrams with dark/light theme support
- **Bilingual Support** — automatic language detection

## File Structure

```
deepwiki-module-skill/
├── SKILL.md                    # Main skill file (bilingual triggers)
├── README.md                   # This file
├── template.md                 # Chinese Markdown template (default)
├── template.en.md              # English Markdown template
├── template.html               # HTML template (with highlight.js)
├── template-index.html         # Index page template (navigation)
├── template-architecture.html  # HTML template (architecture)
├── template-guide.html         # HTML template (guide)
├── template-issue.html         # HTML template (issue)
├── template-report.html        # HTML template (report)
├── md-to-html.js               # MD to HTML converter
└── examples/
    └── Task_Design.md          # Complete example (Chinese)
```

## Templates

| File | Language | Format | Usage |
|------|----------|--------|-------|
| `template.md` | 中文 | Markdown | Default for Chinese users |
| `template.en.md` | English | Markdown | For English users |
| `template.html` | 中文 | HTML | Main HTML template (with syntax highlighting) |
| `template-index.html` | 中文 | HTML | Index navigation page |
| `template-architecture.html` | 中文 | HTML | Architecture docs |
| `template-guide.html` | 中文 | HTML | User guides |
| `template-issue.html` | 中文 | HTML | Issue reports |
| `template-report.html` | 中文 | HTML | Project reports |

## MD to HTML Conversion

Use `md-to-html.js` to convert existing Markdown docs to HTML:

```bash
# Convert single file
node md-to-html.js doc/tech-docs/Task_Design.md

# Convert all .md files
node md-to-html.js --all

# Generate index navigation page
node md-to-html.js --index "ProjectName" "Project description"

# Preview without writing
node md-to-html.js --dry-run --all
```

## Document Structure

| Chapter | Content |
|---------|---------|
| 1. Overview | Background, problem, solution + architecture diagram |
| 2. Design Goals | Functional & non-functional goals |
| 3. Architecture | Module relationships, responsibilities |
| 4. Core Concepts | Data structures, enums, constants |
| 5. State Machine | State definitions, transitions (optional) |
| 6. Flow Diagram | Core workflows (optional) |
| 7. Implementation | Key code snippets |
| 8. API Reference | Public interface table |
| 9. Usage Guide | Runnable examples |
| 10. FAQ | Common questions (optional) |
| 11. Test Coverage | Test case table |
| Appendix | File list, dependencies, history |

## Example

See [examples/Task_Design.md](examples/Task_Design.md) for a complete output example.

## License

MIT