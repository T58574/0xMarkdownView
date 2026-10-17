import * as vscode from 'vscode';
import { NotionMarkdownEngine } from './markdownEngine';
import { getWebviewContent } from './webviewContent';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const engine = new NotionMarkdownEngine();
  const activePanels = new Map<string, vscode.WebviewPanel>();

  // 1. Open Preview (In Active Editor Column / Full reading mode)
  const openPreviewDisposable = vscode.commands.registerCommand(
    'markdown-notion-view.openPreview',
    async (uri?: vscode.Uri) => {
      await handleOpen(uri, vscode.ViewColumn.Active);
    }
  );

  // 2. Open Preview To Side (Split mode: Editor on Left, Preview on Right)
  const openPreviewToSideDisposable = vscode.commands.registerCommand(
    'markdown-notion-view.openPreviewToSide',
    async (uri?: vscode.Uri) => {
      await handleOpen(uri, vscode.ViewColumn.Beside);
    }
  );

  async function handleOpen(uri: vscode.Uri | undefined, targetColumn: vscode.ViewColumn) {
    try {
      let document: vscode.TextDocument | undefined;

      if (uri && 'fsPath' in uri && uri.fsPath) {
        document = await vscode.workspace.openTextDocument(uri);
      } else if (vscode.window.activeTextEditor) {
        document = vscode.window.activeTextEditor.document;
      }

      if (document && isMarkdownDocument(document)) {
        openNotionPreview(document, targetColumn);
      } else {
        vscode.window.showInformationMessage('Пожалуйста, откройте или выберите Markdown (.md) файл.');
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Ошибка открытия Notion превью: ${err?.message || err}`);
    }
  }

  function isMarkdownDocument(doc: vscode.TextDocument): boolean {
    return doc.languageId === 'markdown' || doc.fileName.toLowerCase().endsWith('.md');
  }

  function openNotionPreview(doc: vscode.TextDocument, targetColumn: vscode.ViewColumn) {
    const docKey = doc.uri.toString();
    const fileName = path.basename(doc.fileName);

    let panel = activePanels.get(docKey);

    if (panel) {
      panel.reveal(targetColumn);
      updateWebview(panel, doc);
      return;
    }

    panel = vscode.window.createWebviewPanel(
      'notionMarkdownPreview',
      `[Notion] ${fileName}`,
      targetColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.dirname(doc.fileName))],
      }
    );

    activePanels.set(docKey, panel);

    // Message dispatcher from Webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'openSource': {
            await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Active, preview: false });
            break;
          }

          case 'openSplit': {
            await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preview: false });
            if (panel) {
              panel.reveal(vscode.ViewColumn.Two);
            }
            break;
          }

          case 'jumpToLine': {
            const targetLine = Math.min(Math.max(0, message.line || 0), doc.lineCount - 1);
            const editor = await vscode.window.showTextDocument(doc, {
              viewColumn: vscode.ViewColumn.One,
              preview: false,
            });
            const pos = new vscode.Position(targetLine, 0);
            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
            break;
          }

          case 'toggleTask': {
            const targetLine = Math.min(Math.max(0, message.line || 0), doc.lineCount - 1);
            const line = doc.lineAt(targetLine);
            const lineText = line.text;
            let updatedText = lineText;

            if (/\[ \]/i.test(lineText)) {
              updatedText = lineText.replace(/\[ \]/, '[x]');
            } else if (/\[x\]/i.test(lineText)) {
              updatedText = lineText.replace(/\[x\]/i, '[ ]');
            }

            if (updatedText !== lineText) {
              const edit = new vscode.WorkspaceEdit();
              edit.replace(doc.uri, line.range, updatedText);
              await vscode.workspace.applyEdit(edit);
            }
            break;
          }
        }
      },
      undefined,
      context.subscriptions
    );

    updateWebview(panel, doc);

    panel.onDidDispose(() => {
      activePanels.delete(docKey);
    });
  }

  function updateWebview(panel: vscode.WebviewPanel, doc: vscode.TextDocument) {
    const text = doc.getText();
    const fileName = path.basename(doc.fileName);
    const renderResult = engine.render(text);

    panel.webview.html = getWebviewContent(renderResult.html, renderResult.toc, fileName);
  }

  const changeDocumentDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
    const docKey = e.document.uri.toString();
    const panel = activePanels.get(docKey);
    if (panel) {
      updateWebview(panel, e.document);
    }
  });

  context.subscriptions.push(openPreviewDisposable, openPreviewToSideDisposable, changeDocumentDisposable);
}

export function deactivate() {}
