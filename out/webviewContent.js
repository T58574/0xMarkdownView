"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = getWebviewContent;
function getWebviewContent(htmlContent, tocItems, docTitle) {
    const tocHtml = tocItems
        .map((item) => `
      <a href="#${item.id}" class="toc-item toc-level-${item.level}" onclick="scrollToHeading('${item.id}', event)">
        ${escapeHtml(item.text)}
      </a>
    `)
        .join('');
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(docTitle)}</title>

  <!-- KaTeX CSS & JS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>

  <!-- Mermaid JS -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <!-- Highlight.js CSS for Code Highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css" id="highlight-theme">
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/core.min.js"></script>

  <style>
    :root {
      --bg-primary: var(--vscode-editor-background, #ffffff);
      --text-primary: var(--vscode-editor-foreground, #37352f);
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --border-color: rgba(55, 53, 47, 0.12);
      --callout-bg: rgba(235, 236, 237, 0.6);
      --code-bg: #1e1e1e;
      --code-header-bg: #2d2d2d;
      --accent-color: #2eaadc;
      --toc-bg: var(--vscode-sideBar-background, rgba(247, 246, 243, 0.8));
      --block-hover: rgba(55, 53, 47, 0.04);
    }

    body.dark-mode {
      --bg-primary: #191919;
      --text-primary: rgba(255, 255, 255, 0.9);
      --border-color: rgba(255, 255, 255, 0.13);
      --callout-bg: rgba(255, 255, 255, 0.06);
      --code-bg: #121212;
      --code-header-bg: #1f1f1f;
      --toc-bg: #202020;
      --block-hover: rgba(255, 255, 255, 0.05);
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-family);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      margin: 0;
      padding: 0;
      line-height: 1.65;
      font-size: 16px;
      display: flex;
      min-height: 100vh;
    }

    /* Floating Navigation / Header Bar */
    .notion-top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 100;
      backdrop-filter: blur(8px);
    }

    .notion-top-bar-title {
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notion-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .notion-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .notion-btn:hover {
      background: var(--block-hover);
      border-color: var(--accent-color);
    }

    /* Layout & Sidebar */
    .notion-container {
      display: flex;
      width: 100%;
      margin-top: 44px;
    }

    .notion-sidebar {
      width: 240px;
      position: fixed;
      top: 44px;
      bottom: 0;
      right: 0;
      background: var(--toc-bg);
      border-left: 1px solid var(--border-color);
      padding: 16px 12px;
      overflow-y: auto;
      transition: transform 0.2s ease;
    }

    .notion-sidebar.hidden {
      transform: translateX(100%);
    }

    .notion-sidebar-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      margin-bottom: 12px;
    }

    .toc-item {
      display: block;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 4px;
      opacity: 0.75;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 2px;
    }

    .toc-item:hover {
      opacity: 1;
      background: var(--block-hover);
      color: var(--accent-color);
    }

    .toc-level-1 { font-weight: 600; padding-left: 8px; }
    .toc-level-2 { padding-left: 18px; }
    .toc-level-3 { padding-left: 28px; opacity: 0.65; }

    /* Main Content Area */
    .notion-main {
      flex: 1;
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 48px 100px;
      box-sizing: border-box;
    }

    body.sidebar-open .notion-main {
      margin-right: 240px;
    }

    /* Notion Typography */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary);
      font-weight: 700;
      line-height: 1.3;
      margin-top: 1.8em;
      margin-bottom: 0.4em;
    }

    h1 { font-size: 2.2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.6em; }
    h3 { font-size: 1.3em; }

    p {
      margin-top: 0;
      margin-bottom: 1em;
    }

    a {
      color: var(--accent-color);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    /* Notion Callouts */
    .notion-callout {
      display: flex;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 8px;
      background: var(--callout-bg);
      border: 1px solid var(--border-color);
      margin: 1.2em 0;
    }

    .notion-callout-icon {
      font-size: 20px;
      line-height: 1;
      user-select: none;
    }

    .notion-callout-body {
      flex: 1;
    }

    .notion-callout-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .notion-callout-text {
      margin: 0;
    }

    .notion-callout-text p:last-child {
      margin-bottom: 0;
    }

    /* Notion Toggles */
    .notion-toggle {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 14px;
      margin: 1em 0;
      background: var(--callout-bg);
    }

    .notion-toggle-summary {
      font-weight: 600;
      cursor: pointer;
      outline: none;
      user-select: none;
      padding: 4px 0;
    }

    .notion-toggle-content {
      padding-top: 10px;
      padding-left: 8px;
    }

    /* Notion Code Blocks */
    .notion-code-block {
      border-radius: 8px;
      overflow: hidden;
      margin: 1.2em 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
    }

    .notion-code-header {
      background: var(--code-header-bg);
      color: #a0a0a0;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      font-size: 12px;
      text-transform: lowercase;
    }

    .notion-code-copy-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #e0e0e0;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s;
    }

    .notion-code-copy-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    pre {
      margin: 0;
      padding: 16px;
      background: var(--code-bg);
      overflow-x: auto;
      font-family: "Fira Code", Consolas, Monaco, "Andale Mono", monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    code {
      font-family: inherit;
    }

    p code, li code {
      background: rgba(135, 131, 120, 0.15);
      color: #eb5757;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 85%;
    }

    /* Task Lists & Checkboxes */
    .contains-task-list {
      list-style-type: none;
      padding-left: 0;
    }

    .task-list-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 6px;
    }

    .task-list-item-checkbox {
      width: 18px;
      height: 18px;
      margin-top: 3px;
      accent-color: var(--accent-color);
      cursor: pointer;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      text-align: left;
    }

    th {
      background: var(--block-hover);
      font-weight: 600;
    }

    /* Blockquotes */
    blockquote {
      border-left: 3px solid var(--text-primary);
      margin: 1.2em 0;
      padding-left: 16px;
      font-style: italic;
      opacity: 0.85;
    }

    /* Mermaid Container */
    .mermaid {
      display: flex;
      justify-content: center;
      margin: 1.5em 0;
      background: var(--callout-bg);
      padding: 16px;
      border-radius: 8px;
    }
  </style>
</head>
<body class="sidebar-open">

  <div class="notion-top-bar">
    <div class="notion-top-bar-title">
      📄 <span>${escapeHtml(docTitle)}</span>
    </div>
    <div class="notion-actions">
      <button class="notion-btn" onclick="openSource()" title="Вернуться к редактору кода">
        📝 <span>Код</span>
      </button>
      <button class="notion-btn" onclick="toggleSidebar()">
        📑 <span>Содержание</span>
      </button>
      <button class="notion-btn" onclick="toggleTheme()">
        🌗 <span id="theme-btn-text">Тема</span>
      </button>
    </div>
  </div>

  <div class="notion-container">
    <main class="notion-main" id="notion-content">
      ${htmlContent}
    </main>

    <aside class="notion-sidebar" id="notion-sidebar">
      <div class="notion-sidebar-title">Содержание</div>
      <div class="notion-toc-list">
        ${tocHtml || '<div style="opacity:0.5; font-size:12px;">Заголовки не найдены</div>'}
      </div>
    </aside>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Open Source Code
    function openSource() {
      vscode.postMessage({ command: 'openSource' });
    }

    // Initialize Mermaid
    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
    }

    // Initialize KaTeX Math
    document.addEventListener("DOMContentLoaded", function() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '\\[', right: '\\]', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false
        });
      }
    });

    // Toggle Sidebar
    function toggleSidebar() {
      const sidebar = document.getElementById('notion-sidebar');
      const body = document.body;
      sidebar.classList.toggle('hidden');
      body.classList.toggle('sidebar-open');
    }

    // Scroll to Heading
    function scrollToHeading(id, event) {
      if (event) event.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -60; 
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    // Copy Code Helper
    function copyCode(btn) {
      const codeBlock = btn.closest('.notion-code-block');
      if (codeBlock) {
        const codeText = codeBlock.querySelector('code').innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          const span = btn.querySelector('span');
          const origText = span.innerText;
          span.innerText = 'Скопировано!';
          setTimeout(() => { span.innerText = origText; }, 2000);
        });
      }
    }

    // Toggle Theme
    function toggleTheme() {
      const body = document.body;
      const isDark = body.classList.toggle('dark-mode');
      const themeText = document.getElementById('theme-btn-text');
      themeText.innerText = isDark ? 'Тёмная' : 'Светлая';
    }
  </script>
</body>
</html>`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=webviewContent.js.map