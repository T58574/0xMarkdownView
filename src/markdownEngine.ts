import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItContainer from 'markdown-it-container';
import markdownItTaskLists from 'markdown-it-task-lists';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface RenderResult {
  html: string;
  toc: TocItem[];
}

export class NotionMarkdownEngine {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true,
    });

    this.setupPlugins();
    this.setupCustomRenderers();
  }

  private setupPlugins() {
    // 1. Task lists
    this.md.use(markdownItTaskLists, {
      enabled: true,
      label: true,
      labelAfter: false,
    });

    // 2. Anchors for Headers (TOC support)
    this.md.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'before',
        symbol: '#',
      }),
      slugify: (s: string) =>
        s
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'heading',
    });

    // 3. Containers for Callout types (note, warning, tip, error, quote, callout, toggle)
    const calloutTypes = ['note', 'warning', 'tip', 'info', 'error', 'quote', 'success', 'callout', 'toggle', 'details'];
    
    calloutTypes.forEach((type) => {
      this.md.use(markdownItContainer, type, {
        validate: (params: string) => {
          return params.trim().match(new RegExp(`^${type}\\s*(.*)$`));
        },
        render: (tokens: any[], idx: number) => {
          const m = tokens[idx].info.trim().match(new RegExp(`^${type}\\s*(.*)$`));

          if (tokens[idx].nesting === 1) {
            const titleArg = m && m[1] ? m[1].trim() : '';

            if (type === 'toggle' || type === 'details') {
              const title = titleArg || 'Нажмите, чтобы развернуть';
              return `<details class="notion-toggle"><summary class="notion-toggle-summary">${this.md.utils.escapeHtml(title)}</summary><div class="notion-toggle-content">\n`;
            }

            // Callout styling
            let icon = '💡';
            let title = titleArg;
            let calloutClass = `notion-callout notion-callout-${type}`;

            switch (type) {
              case 'warning':
                icon = '⚠️';
                if (!title) title = 'Предупреждение';
                break;
              case 'error':
                icon = '🚨';
                if (!title) title = ' Ошибка';
                break;
              case 'tip':
              case 'success':
                icon = '✅';
                if (!title) title = 'Совет';
                break;
              case 'info':
                icon = 'ℹ️';
                if (!title) title = 'Информация';
                break;
              case 'quote':
                icon = '💬';
                break;
              default:
                icon = '💡';
                break;
            }

            return `<div class="${calloutClass}">
              <div class="notion-callout-icon">${icon}</div>
              <div class="notion-callout-body">
                ${title ? `<div class="notion-callout-title">${this.md.utils.escapeHtml(title)}</div>` : ''}
                <div class="notion-callout-text">\n`;
          } else {
            if (type === 'toggle' || type === 'details') {
              return `</div></details>\n`;
            }
            return `</div></div></div>\n`;
          }
        },
      });
    });
  }

  private setupCustomRenderers() {
    // Custom Code Block Renderer with Language Label and Copy Button
    const defaultFence = this.md.renderer.rules.fence!;
    this.md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const lang = token.info.trim();

      // Mermaid diagrams support
      if (lang === 'mermaid') {
        return `<div class="mermaid">${token.content}</div>`;
      }

      // Math blocks (KaTeX)
      if (lang === 'math' || lang === 'katex' || lang === 'latex') {
        return `<div class="katex-block">\\[${token.content.trim()}\\]</div>`;
      }

      const escapedCode = this.md.utils.escapeHtml(token.content);
      const displayLang = lang || 'text';

      return `<div class="notion-code-block">
        <div class="notion-code-header">
          <span class="notion-code-lang">${displayLang}</span>
          <button class="notion-code-copy-btn" onclick="copyCode(this)" title="Копировать код">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5z"></path>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5z"></path>
            </svg>
            <span>Копировать</span>
          </button>
        </div>
        <pre><code class="language-${displayLang}">${escapedCode}</code></pre>
      </div>`;
    };
  }

  public render(markdownText: string): RenderResult {
    // Process math inline ($...$) and block ($$...$$) placeholders before rendering
    let processedText = markdownText.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (match, math) => {
      return `<div class="katex-block">\\[${math}\\]</div>`;
    });

    processedText = processedText.replace(/\$([^\$\n]+)\$/g, (match, math) => {
      return `<span class="katex-inline">\\(${math}\\)</span>`;
    });

    const html = this.md.render(processedText);

    // Generate TOC from headings
    const toc: TocItem[] = [];
    const headingRegex = /<h([1-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[1-3]>/gi;
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const id = match[2];
      const rawText = match[3].replace(/<[^>]+>/g, '').replace(/^#\s*/, '').trim();

      if (rawText) {
        toc.push({ id, text: rawText, level });
      }
    }

    return { html, toc };
  }
}
