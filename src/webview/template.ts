import { TocItem } from '../markdownEngine';
import { getWebviewStyles } from './styles';
import { getWebviewScripts } from './scripts';

export function renderFullHtml(htmlContent: string, tocItems: TocItem[], docTitle: string): string {
  const tocHtml = tocItems
    .map(
      (item) => `
      <a href="#${item.id}" class="toc-item toc-level-${item.level}" onclick="scrollToHeading('${item.id}', event)">
        ${escapeHtml(item.text)}
      </a>
    `
    )
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

  <style>
    ${getWebviewStyles()}
  </style>
</head>
<body class="font-sans">

  <!-- Notion Top Bar -->
  <header class="notion-top-bar">
    <div class="notion-top-bar-left">
      <span class="notion-doc-title">📄 <span>${escapeHtml(docTitle)}</span></span>
      <span class="notion-meta-pill" id="active-width-pill">900px</span>
    </div>

    <div class="notion-actions">
      <button class="notion-btn" onclick="openSource()" title="Открыть файл в редакторе (Enter source)">
        📝 <span>Редактировать</span>
      </button>
      <button class="notion-btn" onclick="openSplit()" title="Открыть редактор слева, превью справа (Split view)">
        ⚡ <span>Сплит</span>
      </button>
      <button class="notion-btn" onclick="toggleToc()" title="Показать/скрыть оглавление">
        📑 <span>Оглавление</span>
      </button>
      <button class="notion-btn" id="appearance-btn" onclick="toggleAppearance()" title="Настройки вида, шрифтов и ширины">
        ⚙️ <span>Вид</span>
      </button>
    </div>

    <!-- Appearance Popover -->
    <div class="notion-popover" id="notion-popover">
      <div class="popover-row">
        <div class="popover-label">Ширина контента</div>
        <div class="segmented-control">
          <button class="segmented-btn" data-set-width="720" onclick="setWidth(720)">720</button>
          <button class="segmented-btn active" data-set-width="900" onclick="setWidth(900)">900</button>
          <button class="segmented-btn" data-set-width="1200" onclick="setWidth(1200)">1200</button>
          <button class="segmented-btn" data-set-width="100%" onclick="setWidth('100%')">100%</button>
        </div>
      </div>

      <div class="popover-row">
        <div class="popover-label">Типографика</div>
        <div class="segmented-control">
          <button class="segmented-btn active" data-set-font="sans" onclick="setFont('sans')">Sans</button>
          <button class="segmented-btn" data-set-font="serif" onclick="setFont('serif')">Serif</button>
          <button class="segmented-btn" data-set-font="mono" onclick="setFont('mono')">Mono</button>
        </div>
      </div>

      <div class="popover-row">
        <div class="popover-label">Размер текста</div>
        <div class="segmented-control">
          <button class="segmented-btn" onclick="changeFontSize(-1)">A -</button>
          <span class="segmented-btn" id="font-size-display" style="cursor:default;">16px</span>
          <button class="segmented-btn" onclick="changeFontSize(1)">A +</button>
        </div>
      </div>

      <div class="popover-row">
        <div class="popover-label">Тема оформления</div>
        <div class="segmented-control">
          <button class="segmented-btn active" data-set-theme="auto" onclick="setTheme('auto')">Авто</button>
          <button class="segmented-btn" data-set-theme="light" onclick="setTheme('light')">Светлая</button>
          <button class="segmented-btn" data-set-theme="dark" onclick="setTheme('dark')">Тёмная</button>
        </div>
      </div>
    </div>
  </header>

  <!-- Centered Main Canvas -->
  <div class="notion-canvas-wrapper">
    <main class="notion-main" id="notion-content">
      ${htmlContent}
    </main>
  </div>

  <!-- Floating TOC Drawer -->
  <aside class="notion-toc-drawer" id="notion-toc">
    <div class="notion-toc-header">
      <span class="notion-toc-title">Оглавление</span>
      <button class="notion-btn" style="padding: 2px 6px; font-size: 11px;" onclick="toggleToc()">✕</button>
    </div>
    <div class="notion-toc-list">
      ${tocHtml || '<div style="opacity:0.5; font-size:12px; padding: 4px 6px;">Заголовки не найдены</div>'}
    </div>
  </aside>

  <script>
    ${getWebviewScripts()}
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
