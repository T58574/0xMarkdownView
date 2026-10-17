export function getWebviewScripts(): string {
  return `
    const vscode = acquireVsCodeApi();
    let currentSettings = {
      width: '900',
      font: 'sans',
      fontSize: 16,
      theme: 'auto',
      tocOpen: true
    };

    // Load saved settings
    try {
      const state = vscode.getState();
      if (state && typeof state === 'object') {
        currentSettings = { ...currentSettings, ...state };
      }
    } catch (e) {}

    // Apply settings on load
    applySettings();

    function saveState() {
      try {
        vscode.setState(currentSettings);
      } catch (e) {}
    }

    function applySettings() {
      const body = document.body;
      const widthVal = currentSettings.width === '100%' ? '100%' : currentSettings.width + 'px';
      body.style.setProperty('--content-max-width', widthVal);
      body.style.setProperty('--font-size', currentSettings.fontSize + 'px');

      body.classList.remove('font-sans', 'font-serif', 'font-mono');
      body.classList.add('font-' + currentSettings.font);

      body.classList.remove('theme-dark', 'theme-light');
      if (currentSettings.theme !== 'auto') {
        body.classList.add('theme-' + currentSettings.theme);
      }

      const tocDrawer = document.getElementById('notion-toc');
      if (tocDrawer) {
        if (currentSettings.tocOpen) {
          tocDrawer.classList.remove('hidden');
        } else {
          tocDrawer.classList.add('hidden');
        }
      }

      updateUiControls();
    }

    function updateUiControls() {
      // Update segmented controls active classes
      document.querySelectorAll('[data-set-width]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-width') === currentSettings.width);
      });
      document.querySelectorAll('[data-set-font]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-font') === currentSettings.font);
      });
      document.querySelectorAll('[data-set-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-theme') === currentSettings.theme);
      });

      const fsDisplay = document.getElementById('font-size-display');
      if (fsDisplay) fsDisplay.innerText = currentSettings.fontSize + 'px';

      const widthPill = document.getElementById('active-width-pill');
      if (widthPill) {
        widthPill.innerText = currentSettings.width === '100%' ? '100%' : currentSettings.width + 'px';
      }
    }

    function setWidth(w) {
      currentSettings.width = String(w);
      saveState();
      applySettings();
    }

    function setFont(f) {
      currentSettings.font = f;
      saveState();
      applySettings();
    }

    function changeFontSize(delta) {
      const newSize = Math.min(24, Math.max(12, currentSettings.fontSize + delta));
      currentSettings.fontSize = newSize;
      saveState();
      applySettings();
    }

    function setTheme(t) {
      currentSettings.theme = t;
      saveState();
      applySettings();
    }

    function toggleToc() {
      currentSettings.tocOpen = !currentSettings.tocOpen;
      saveState();
      applySettings();
    }

    function toggleAppearance() {
      const popover = document.getElementById('notion-popover');
      if (popover) {
        popover.classList.toggle('open');
      }
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('notion-popover');
      const triggerBtn = document.getElementById('appearance-btn');
      if (popover && popover.classList.contains('open')) {
        if (!popover.contains(e.target) && !triggerBtn.contains(e.target)) {
          popover.classList.remove('open');
        }
      }
    });

    // Actions to VS Code
    function openSource() {
      vscode.postMessage({ command: 'openSource' });
    }

    function openSplit() {
      vscode.postMessage({ command: 'openSplit' });
    }

    // Double-click on any element with data-line jumps to source line in editor
    document.addEventListener('dblclick', (e) => {
      const targetBlock = e.target.closest('[data-line]');
      if (targetBlock) {
        const line = Number(targetBlock.getAttribute('data-line'));
        if (!isNaN(line)) {
          vscode.postMessage({ command: 'jumpToLine', line });
        }
      }
    });

    // Checkbox toggles in task lists
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('task-list-item-checkbox')) {
        const item = e.target.closest('li') || e.target.closest('[data-line]');
        if (item) {
          const line = Number(item.getAttribute('data-line'));
          if (!isNaN(line)) {
            vscode.postMessage({ command: 'toggleTask', line });
          }
        }
      }
    });

    // Smooth scroll to heading
    function scrollToHeading(id, event) {
      if (event) event.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -54;
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
          const orig = span ? span.innerText : 'Копировать';
          if (span) span.innerText = 'Скопировано!';
          setTimeout(() => { if (span) span.innerText = orig; }, 2000);
        });
      }
    }

    // Init Mermaid safely
    if (window.mermaid) {
      try {
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
      } catch (e) {}
    }

    // Init KaTeX safely on targeted math blocks only
    document.addEventListener('DOMContentLoaded', () => {
      if (window.renderMathInElement) {
        const mathBlocks = document.querySelectorAll('.katex-block, .katex-inline');
        mathBlocks.forEach(el => {
          try {
            renderMathInElement(el, {
              delimiters: [
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
              ],
              throwOnError: false
            });
          } catch (e) {}
        });
      }
    });
  `;
}
