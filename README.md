[English](README.md) | [中文](README.zh-CN.md)

# DeepWiki Technical Documentation Generator

A Claude Code skill for generating technical design documentation with ASCII diagrams, API references, and runnable code examples. Supports both English and Chinese. **Dual format output: Markdown + HTML.**

## Quick Start

```bash
# Install to Claude Code skills directory
git clone https://github.com/GeziP/deepwiki-module-skill.git ~/.claude/skills/deepwiki-module-skill
```

That's it. No additional setup required.

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
- `doc/tech-docs/<ModuleName>_Design.html` (HTML, single-file, zero dependencies)

## File Structure

```
deepwiki-module-skill/
├── SKILL.md                    # Main skill file (bilingual triggers)
├── template.md                 # Chinese Markdown template (default)
├── template.en.md              # English Markdown template
├── template.html               # HTML template (main)
├── template-architecture.html  # HTML template (architecture)
├── template-guide.html         # HTML template (guide)
├── template-issue.html         # HTML template (issue)
├── template-report.html        # HTML template (report)
├── md-to-html.js               # MD to HTML converter
├── examples/
│   └── Task_Design.md          # Complete example (Chinese)
└── README.md                   # This file
```

## Features

- **Dual Format Output** - Both Markdown and HTML generated simultaneously
- **ASCII Diagrams (MD)** - Architecture, state machines, flow charts - no UML tools needed
- **Inline SVG (HTML)** - High-density diagrams with dark/light theme support
- **12-Chapter Structure** - Complete template from overview to test coverage
- **Runnable Examples** - Complete code with necessary imports
- **API Reference Tables** - Signatures, parameters, return values
- **Bilingual Support** - Automatic language detection
- **HTML Components** - Collapsible sections, tabs, callouts, code blocks

## Templates

| File | Language | Format | Usage |
|------|----------|--------|-------|
| `template.md` | 中文 | Markdown | Default for Chinese users |
| `template.en.md` | English | Markdown | For English users |
| `template.html` | 中文 | HTML | Main HTML template |
| `template-architecture.html` | 中文 | HTML | Architecture docs |
| `template-guide.html` | 中文 | HTML | User guides |
| `template-issue.html` | 中文 | HTML | Issue reports |
| `template-report.html` | 中文 | HTML | Project reports |

### MD to HTML Conversion

Use `md-to-html.js` to convert existing Markdown docs to HTML:

```bash
# Convert single file
node md-to-html.js doc/tech-docs/Task_Design.md

# Convert all .md files
node md-to-html.js --all

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