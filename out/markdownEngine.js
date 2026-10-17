"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionMarkdownEngine = void 0;
const markdown_it_1 = __importDefault(require("markdown-it"));
const markdown_it_anchor_1 = __importDefault(require("markdown-it-anchor"));
const markdown_it_container_1 = __importDefault(require("markdown-it-container"));
const markdown_it_task_lists_1 = __importDefault(require("markdown-it-task-lists"));
class NotionMarkdownEngine {
    md;
    constructor() {
        this.md = new markdown_it_1.default({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
        });
        this.setupPlugins();
        this.setupLineTracking();
        this.setupCustomRenderers();
    }
    setupPlugins() {
        // 1. Task lists
        this.md.use(markdown_it_task_lists_1.default, {
            enabled: true,
            label: true,
            labelAfter: false,
        });
        // 2. Anchors for Headers (TOC support)
        this.md.use(markdown_it_anchor_1.default, {
            permalink: markdown_it_anchor_1.default.permalink.ariaHidden({
                placement: 'before',
                symbol: '#',
            }),
            slugify: (s) => s
                .toLowerCase()
                .trim()
                .replace(/[^\w\sа-яё-]/gi, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'heading',
        });
        // 3. Containers for Callout types (note, warning, tip, error, quote, callout, toggle)
        const calloutTypes = ['note', 'warning', 'tip', 'info', 'error', 'quote', 'success', 'callout', 'toggle', 'details'];
        calloutTypes.forEach((type) => {
            this.md.use(markdown_it_container_1.default, type, {
                validate: (params) => params.trim().match(new RegExp(`^${type}\\s*(.*)$`)),
                render: (tokens, idx) => {
                    const m = tokens[idx].info.trim().match(new RegExp(`^${type}\\s*(.*)$`));
                    if (tokens[idx].nesting === 1) {
                        const titleArg = m && m[1] ? m[1].trim() : '';
                        if (type === 'toggle' || type === 'details') {
                            const title = titleArg || 'Нажмите, чтобы развернуть';
                            return `<details class="notion-toggle"><summary class="notion-toggle-summary">${this.md.utils.escapeHtml(title)}</summary><div class="notion-toggle-content">\n`;
                        }
                        const iconMap = {
                            warning: '⚠️',
                            error: '🚨',
                            tip: '💡',
                            success: '✅',
                            info: 'ℹ️',
                            quote: '💬',
                        };
                        const defaultTitles = {
                            warning: 'Предупреждение',
                            error: 'Ошибка',
                            tip: 'Совет',
                            success: 'Успешно',
                            info: 'Информация',
                        };
                        const icon = iconMap[type] || '💡';
                        const title = titleArg || defaultTitles[type] || '';
                        const calloutClass = `notion-callout notion-callout-${type}`;
                        return `<div class="${calloutClass}">
              <div class="notion-callout-icon">${icon}</div>
              <div class="notion-callout-body">
                ${title ? `<div class="notion-callout-title">${this.md.utils.escapeHtml(title)}</div>` : ''}
                <div class="notion-callout-text">\n`;
                    }
                    else {
                        if (type === 'toggle' || type === 'details') {
                            return `</div></details>\n`;
                        }
                        return `</div></div></div>\n`;
                    }
                },
            });
        });
    }
    setupLineTracking() {
        // Inject data-line attributes on opening tokens to enable jump-to-source on double-click
        this.md.core.ruler.push('track_lines', (state) => {
            for (const token of state.tokens) {
                if (token.map && token.nesting === 1) {
                    token.attrSet('data-line', String(token.map[0]));
                }
            }
        });
    }
    setupCustomRenderers() {
        this.md.renderer.rules.fence = (tokens, idx) => {
            const token = tokens[idx];
            const lang = token.info.trim();
            if (lang === 'mermaid') {
                return `<div class="mermaid" data-line="${token.map ? token.map[0] : 0}">${token.content}</div>`;
            }
            if (lang === 'math' || lang === 'katex' || lang === 'latex') {
                return `<div class="katex-block" data-line="${token.map ? token.map[0] : 0}">\\[${token.content.trim()}\\]</div>`;
            }
            const escapedCode = this.md.utils.escapeHtml(token.content);
            const displayLang = lang || 'text';
            const lineAttr = token.map ? ` data-line="${token.map[0]}"` : '';
            return `<div class="notion-code-block"${lineAttr}>
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
    transformGitHubAlerts(text) {
        // Convert GitHub alert syntax (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]) into containers
        const alertMap = {
            NOTE: 'note',
            TIP: 'tip',
            IMPORTANT: 'info',
            WARNING: 'warning',
            CAUTION: 'error',
        };
        return text.replace(/(?:^|\n)> *\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\n]*\n((?:> *[^\n]*\n*)*)/gi, (match, type, content) => {
            const cType = alertMap[type.toUpperCase()] || 'note';
            const cleanedContent = content.replace(/^> ?/gm, '').trim();
            return `\n\n::: ${cType}\n${cleanedContent}\n:::\n\n`;
        });
    }
    render(markdownText) {
        let processedText = this.transformGitHubAlerts(markdownText);
        // Block math: $$ ... $$
        processedText = processedText.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (_match, math) => {
            return `<div class="katex-block">\\[${math.trim()}\\]</div>`;
        });
        // Inline math: $math$ (strictly non-empty, no leading/trailing space inside, not surrounded by letters/numbers)
        processedText = processedText.replace(/(^|[\s(])\$([^\s$](?:[^$\n]*?[^\s$])?)\$([\s).,;:!?]|$)/g, (_match, prefix, math, suffix) => {
            // Don't treat standalone numbers like $10 as math equations
            if (/^\d+(?:\.\d+)?$/.test(math)) {
                return `${prefix}$${math}$${suffix}`;
            }
            return `${prefix}<span class="katex-inline">\\(${math}\\)</span>${suffix}`;
        });
        const html = this.md.render(processedText);
        // Extract TOC
        const toc = [];
        const headingRegex = /<h([1-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[1-3]>/gi;
        let match;
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
exports.NotionMarkdownEngine = NotionMarkdownEngine;
//# sourceMappingURL=markdownEngine.js.map