#!/usr/bin/env node
/**
 * md-to-html.js — Convert DeepWiki Markdown tech-docs to single-file HTML.
 *
 * Usage:
 *   node doc/deepwiki/md-to-html.js doc/tech-docs/Task_Design.md
 *   node doc/deepwiki/md-to-html.js --all          # convert all .md in doc/tech-docs/
 *   node doc/deepwiki/md-to-html.js --dry-run --all # preview without writing
 *
 * The script performs a structural conversion: markdown headings, tables, code blocks,
 * and lists are mapped to the HTML template's semantic components. ASCII diagrams are
 * preserved inside <pre> blocks. The output is a self-contained .html file.
 */

const fs = require('fs');
const path = require('path');

const TECH_DOCS_DIR = path.resolve(__dirname, '..', 'tech-docs');
const TEMPLATE_PATH = path.resolve(__dirname, 'template.html');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const convertAll = args.includes('--all');
const files = args.filter(a => !a.startsWith('--'));

if (!convertAll && files.length === 0) {
  console.log('Usage: node md-to-html.js [--all] [--dry-run] [file.md ...]');
  process.exit(0);
}

function readTemplate() {
  const raw = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/);
  const scriptMatch = raw.match(/<script>([\s\S]*?)<\/script>/);
  return {
    css: styleMatch ? styleMatch[1] : '',
    js: scriptMatch ? scriptMatch[1] : ''
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMdMeta(lines) {
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^\|\s*文档版本/.test(line) || /^\|\s*项目\s*\|/.test(line)) continue;
    if (/^\|[-\s|]+\|$/.test(line)) continue;
    const m = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim();
      if (key === '文档版本') meta.version = val;
      else if (key === '编写日期') meta.writeDate = val;
      else if (key === '更新日期') meta.updateDate = val;
      else if (key === '目标读者') meta.audience = val;
      else if (key === '关联文档') meta.relatedDocs = val;
      else if (key === '实现文件') meta.implFile = val;
      else if (key === '测试文件') meta.testFile = val;
    }
  }
  return meta;
}

function parseMarkdownSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentH2 = null;
  let currentBody = [];
  let metaLines = [];
  let inMeta = false;
  let title = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^# /.test(line) && !title) {
      title = line.replace(/^# /, '').trim();
      continue;
    }

    if (/^## 文档信息/.test(line)) { inMeta = true; continue; }
    if (inMeta) {
      if (/^---/.test(line) || /^## /.test(line)) {
        inMeta = false;
        if (/^## /.test(line)) i--;
      } else {
        metaLines.push(line);
      }
      continue;
    }

    if (/^## 目录/.test(line)) {
      while (i + 1 < lines.length && !(/^## /.test(lines[i + 1]) && !/^## 目录/.test(lines[i + 1]))) {
        i++;
        if (/^---/.test(lines[i + 1])) { i++; break; }
      }
      continue;
    }

    if (/^---$/.test(line)) continue;

    if (/^## /.test(line)) {
      if (currentH2) {
        sections.push({ heading: currentH2, body: currentBody.join('\n') });
      }
      currentH2 = line.replace(/^## /, '').trim();
      currentBody = [];
      continue;
    }

    currentBody.push(line);
  }
  if (currentH2) {
    sections.push({ heading: currentH2, body: currentBody.join('\n') });
  }

  const meta = parseMdMeta(metaLines);
  return { title, meta, sections };
}

function mdBodyToHtml(body) {
  const lines = body.split('\n');
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];
  let inTable = false;
  let tableRows = [];
  let inList = false;
  let listItems = [];

  function flushList() {
    if (listItems.length) {
      out.push('<ul>');
      listItems.forEach(li => out.push(`  <li>${inlineMarkdown(li)}</li>`));
      out.push('</ul>');
      listItems = [];
      inList = false;
    }
  }

  function flushTable() {
    if (tableRows.length < 2) { tableRows = []; inTable = false; return; }
    out.push('<div class="table-wrapper"><table>');
    const headers = tableRows[0];
    out.push('<thead><tr>' + headers.map(h => `<th>${inlineMarkdown(h)}</th>`).join('') + '</tr></thead>');
    out.push('<tbody>');
    for (let r = 2; r < tableRows.length; r++) {
      out.push('<tr>' + tableRows[r].map(c => `<td>${inlineMarkdown(c)}</td>`).join('') + '</tr>');
    }
    out.push('</tbody></table></div>');
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^```/.test(line)) {
      if (!inCode) {
        flushList();
        flushTable();
        inCode = true;
        codeLang = line.replace(/^```/, '').trim();
        codeLines = [];
      } else {
        const content = codeLines.join('\n');
        const isAsciiArt = !codeLang || codeLang === '' || /[┌└├─│▼▶◀]/.test(content);
        if (isAsciiArt && !codeLang) {
          out.push(`<figure class="code-block"><pre><code>${escapeHtml(content)}</code></pre></figure>`);
        } else {
          const lang = codeLang || '';
          out.push(`<figure class="code-block" data-lang="${lang}"><pre><code>${escapeHtml(content)}</code></pre></figure>`);
        }
        inCode = false;
        codeLang = '';
      }
      continue;
    }

    if (inCode) { codeLines.push(line); continue; }

    if (/^\|/.test(line)) {
      flushList();
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (/^[-*] /.test(line)) {
      flushTable();
      inList = true;
      listItems.push(line.replace(/^[-*] /, ''));
      continue;
    } else if (inList) {
      flushList();
    }

    if (/^### /.test(line)) {
      flushList(); flushTable();
      const heading = line.replace(/^### /, '').trim();
      out.push(`<h3>${inlineMarkdown(heading)}</h3>`);
      continue;
    }

    if (/^#### /.test(line)) {
      flushList(); flushTable();
      const heading = line.replace(/^#### /, '').trim();
      out.push(`<h4>${inlineMarkdown(heading)}</h4>`);
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    flushList(); flushTable();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  flushList();
  flushTable();
  return out.join('\n');
}

function inlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function sectionId(heading) {
  const num = heading.match(/^(\d+)/);
  if (num) {
    const map = {
      '1': 'sec-overview', '2': 'sec-goals', '3': 'sec-arch',
      '4': 'sec-concepts', '5': 'sec-state', '6': 'sec-flow',
      '7': 'sec-impl', '8': 'sec-api', '9': 'sec-usage',
      '10': 'sec-faq', '11': 'sec-tests'
    };
    if (map[num[1]]) return map[num[1]];
  }
  if (/附录/.test(heading)) return 'sec-appendix';
  return 'sec-' + heading.replace(/[^\w]/g, '').toLowerCase().slice(0, 20);
}

function shouldBeOpen(heading) {
  if (/^(1|2|3|4|7|8|9|11)\./.test(heading)) return true;
  if (/附录|常见问题|状态机|流程图/.test(heading)) return false;
  return true;
}

function buildHtml(parsed, template) {
  const { title, meta, sections } = parsed;
  const moduleName = title.replace(/ 技术设计文档$/, '').trim();

  const metaDl = [];
  if (meta.implFile) metaDl.push(`<dt>实现文件</dt><dd><code>${meta.implFile}</code></dd>`);
  if (meta.testFile) metaDl.push(`<dt>测试文件</dt><dd><code>${meta.testFile}</code></dd>`);
  if (meta.relatedDocs) metaDl.push(`<dt>关联文档</dt><dd>${inlineMarkdown(meta.relatedDocs)}</dd>`);
  if (meta.writeDate) metaDl.push(`<dt>编写日期</dt><dd>${meta.writeDate}</dd>`);
  if (meta.updateDate) metaDl.push(`<dt>更新日期</dt><dd>${meta.updateDate}</dd>`);

  const sectionsHtml = sections.map(s => {
    const id = sectionId(s.heading);
    const open = shouldBeOpen(s.heading) ? ' open' : '';
    const bodyHtml = mdBodyToHtml(s.body);
    return `
      <details${open} id="${id}">
        <summary><h2>${s.heading}</h2></summary>
        <div class="section-body">
${bodyHtml}
        </div>
      </details>`;
  }).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="deepwiki-html md-to-html">
  <title>${escapeHtml(title)}</title>
  <style>${template.css}</style>
</head>
<body data-doctype="tech-design">

  <nav class="topbar">
    <span class="topbar-brand">HDSA-MACO</span>
    <span class="topbar-sep">/</span>
    <span class="topbar-title">${escapeHtml(title)}</span>
    <div class="topbar-actions">
      <button class="topbar-btn menu-toggle" onclick="toggleSidebar()" title="目录">☰</button>
      <button class="topbar-btn" onclick="toggleTheme()" title="切换主题">◐</button>
      <button class="topbar-btn" onclick="window.print()" title="打印">⎙</button>
    </div>
  </nav>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <nav><ul class="toc-list" id="toc"></ul></nav>
    </aside>

    <article class="main" id="content">
      <header class="doc-meta">
        <span class="doc-version">${meta.version || 'V1.0'}</span>
        <h1>${escapeHtml(title)}</h1>
        <dl class="meta-grid">
          ${metaDl.join('\n          ')}
        </dl>
      </header>

${sectionsHtml}

    </article>
  </div>

  <script>${template.js}</script>
</body>
</html>`;
}

// --- Main ---
const template = readTemplate();

let targets = [];
if (convertAll) {
  targets = fs.readdirSync(TECH_DOCS_DIR)
    .filter(f => f.endsWith('_Design.md'))
    .map(f => path.join(TECH_DOCS_DIR, f));
} else {
  targets = files.map(f => path.resolve(f));
}

let converted = 0;
let skipped = 0;

for (const mdPath of targets) {
  if (!fs.existsSync(mdPath)) {
    console.log(`  SKIP  ${mdPath} (not found)`);
    skipped++;
    continue;
  }

  const htmlPath = mdPath.replace(/\.md$/, '.html');
  if (fs.existsSync(htmlPath)) {
    console.log(`  SKIP  ${path.basename(mdPath)} (HTML already exists)`);
    skipped++;
    continue;
  }

  const md = fs.readFileSync(mdPath, 'utf-8');
  const parsed = parseMarkdownSections(md);
  const html = buildHtml(parsed, template);

  if (dryRun) {
    console.log(`  DRY   ${path.basename(mdPath)} → ${path.basename(htmlPath)} (${parsed.sections.length} sections)`);
  } else {
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`  OK    ${path.basename(mdPath)} → ${path.basename(htmlPath)} (${parsed.sections.length} sections)`);
  }
  converted++;
}

console.log(`\nDone: ${converted} converted, ${skipped} skipped${dryRun ? ' (dry run)' : ''}`);
