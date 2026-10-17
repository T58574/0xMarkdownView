export function getWebviewStyles(): string {
  return `
    :root {
      --bg-primary: var(--vscode-editor-background, #ffffff);
      --text-primary: var(--vscode-editor-foreground, #37352f);
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-size: 16px;
      --line-height: 1.65;
      --content-max-width: 900px;
      --border-color: rgba(55, 53, 47, 0.12);
      --callout-bg: rgba(235, 236, 237, 0.6);
      --code-bg: #1e1e1e;
      --code-header-bg: #2d2d2d;
      --accent-color: #2eaadc;
      --toc-bg: var(--vscode-sideBar-background, rgba(247, 246, 243, 0.92));
      --block-hover: rgba(55, 53, 47, 0.05);
      --popover-bg: var(--vscode-menu-background, #ffffff);
      --popover-border: var(--vscode-menu-border, rgba(55, 53, 47, 0.15));
    }

    body.theme-dark {
      --bg-primary: #191919;
      --text-primary: rgba(255, 255, 255, 0.9);
      --border-color: rgba(255, 255, 255, 0.13);
      --callout-bg: rgba(255, 255, 255, 0.06);
      --code-bg: #121212;
      --code-header-bg: #1f1f1f;
      --toc-bg: rgba(30, 30, 30, 0.95);
      --block-hover: rgba(255, 255, 255, 0.06);
      --popover-bg: #242424;
      --popover-border: rgba(255, 255, 255, 0.15);
    }

    body.theme-light {
      --bg-primary: #ffffff;
      --text-primary: #37352f;
      --border-color: rgba(55, 53, 47, 0.12);
      --callout-bg: rgba(241, 241, 239, 0.7);
      --code-bg: #f7f6f3;
      --code-header-bg: #ecebe8;
      --toc-bg: rgba(247, 246, 243, 0.95);
      --block-hover: rgba(55, 53, 47, 0.05);
      --popover-bg: #ffffff;
      --popover-border: rgba(55, 53, 47, 0.15);
    }

    /* Font Families */
    body.font-sans { --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body.font-serif { --font-family: Lyon-Text, Georgia, YuMincho, "Yu Mincho", "Hiragino Mincho ProN", serif; }
    body.font-mono { --font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Courier New", monospace; }

    * { box-sizing: border-box; }

    body {
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: var(--line-height);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Bar */
    .notion-top-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }

    .notion-top-bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .notion-doc-title {
      font-weight: 600;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notion-meta-pill {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 4px;
      background: var(--block-hover);
      border: 1px solid var(--border-color);
      opacity: 0.75;
    }

    .notion-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .notion-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 6px;
      padding: 4px 9px;
      font-size: 12.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .notion-btn:hover, .notion-btn.active {
      background: var(--block-hover);
      border-color: var(--accent-color);
    }

    /* Appearance Popover */
    .notion-popover {
      position: absolute;
      top: 50px;
      right: 16px;
      width: 290px;
      background: var(--popover-bg);
      border: 1px solid var(--popover-border);
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.22);
      padding: 14px;
      z-index: 200;
      display: none;
      font-size: 12.5px;
    }

    .notion-popover.open { display: block; }

    .popover-row {
      margin-bottom: 12px;
    }
    .popover-row:last-child { margin-bottom: 0; }

    .popover-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .segmented-control {
      display: flex;
      background: var(--block-hover);
      border-radius: 6px;
      padding: 2px;
      gap: 2px;
    }

    .segmented-btn {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary);
      padding: 5px 8px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      font-family: inherit;
      transition: background 0.12s;
    }

    .segmented-btn.active {
      background: var(--bg-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      font-weight: 600;
    }

    /* Centered Canvas */
    .notion-canvas-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      width: 100%;
      position: relative;
    }

    .notion-main {
      width: 100%;
      max-width: var(--content-max-width, 900px);
      margin: 0 auto;
      padding: 36px 36px 140px;
      transition: max-width 0.2s ease, font-size 0.15s ease;
    }

    /* Floating TOC Drawer */
    .notion-toc-drawer {
      position: fixed;
      top: 56px;
      right: 20px;
      width: 270px;
      max-height: calc(100vh - 76px);
      background: var(--toc-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      backdrop-filter: blur(16px);
      padding: 14px 12px;
      overflow-y: auto;
      z-index: 90;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .notion-toc-drawer.hidden {
      transform: translateX(300px);
      opacity: 0;
      pointer-events: none;
    }

    .notion-toc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding: 0 4px;
    }

    .notion-toc-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      opacity: 0.6;
    }

    .toc-item {
      display: block;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 12.5px;
      padding: 4px 8px;
      border-radius: 4px;
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 2px;
      line-height: 1.4;
    }

    .toc-item:hover {
      opacity: 1;
      background: var(--block-hover);
      color: var(--accent-color);
    }

    .toc-level-1 { font-weight: 600; padding-left: 6px; }
    .toc-level-2 { padding-left: 18px; }
    .toc-level-3 { padding-left: 28px; opacity: 0.7; }

    /* Jump to source cue */
    [data-line] {
      position: relative;
      cursor: default;
    }
    [data-line]:hover::before {
      content: "✎";
      position: absolute;
      left: -22px;
      top: 2px;
      font-size: 12px;
      opacity: 0.35;
      cursor: pointer;
    }

    /* Typography & Blocks */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary);
      font-weight: 700;
      line-height: 1.25;
      margin-top: 1.6em;
      margin-bottom: 0.4em;
    }

    h1 { font-size: 2.1em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    p { margin-top: 0; margin-bottom: 1em; }
    a { color: var(--accent-color); text-decoration: underline; text-underline-offset: 3px; }

    /* Callouts */
    .notion-callout {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
      background: var(--callout-bg);
      border: 1px solid var(--border-color);
      margin: 1.2em 0;
    }

    .notion-callout-icon { font-size: 18px; line-height: 1.2; user-select: none; }
    .notion-callout-body { flex: 1; }
    .notion-callout-title { font-weight: 600; margin-bottom: 4px; font-size: 0.95em; }
    .notion-callout-text { margin: 0; }
    .notion-callout-text p:last-child { margin-bottom: 0; }

    /* Details / Toggle */
    .notion-toggle {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 14px;
      margin: 1em 0;
      background: var(--callout-bg);
    }
    .notion-toggle-summary { font-weight: 600; cursor: pointer; outline: none; }
    .notion-toggle-content { padding-top: 8px; }

    /* Code Blocks */
    .notion-code-block {
      border-radius: 8px;
      overflow: hidden;
      margin: 1.2em 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
    }

    .notion-code-header {
      background: var(--code-header-bg);
      color: #a0a0a0;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: monospace;
      font-size: 11px;
      text-transform: lowercase;
    }

    .notion-code-copy-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #e0e0e0;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .notion-code-copy-btn:hover { background: rgba(255, 255, 255, 0.25); }

    pre {
      margin: 0;
      padding: 14px 16px;
      background: var(--code-bg);
      overflow-x: auto;
      font-family: "JetBrains Mono", Consolas, Monaco, monospace;
      font-size: 13.5px;
      line-height: 1.5;
    }

    p code, li code {
      background: rgba(135, 131, 120, 0.15);
      color: #eb5757;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 85%;
    }

    /* Interactive Checkboxes */
    .contains-task-list { list-style-type: none; padding-left: 0; }
    .task-list-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .task-list-item-checkbox {
      width: 17px;
      height: 17px;
      margin-top: 3px;
      accent-color: var(--accent-color);
      cursor: pointer;
    }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid var(--border-color); padding: 9px 12px; text-align: left; }
    th { background: var(--block-hover); font-weight: 600; }

    /* Blockquotes */
    blockquote {
      border-left: 3px solid var(--text-primary);
      margin: 1.2em 0;
      padding-left: 14px;
      font-style: italic;
      opacity: 0.85;
    }

    /* Mermaid */
    .mermaid {
      display: flex;
      justify-content: center;
      margin: 1.5em 0;
      background: var(--callout-bg);
      padding: 16px;
      border-radius: 8px;
    }
  `;
}
