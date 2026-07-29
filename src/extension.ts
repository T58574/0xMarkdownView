import * as vscode from 'vscode';
import { NotionMarkdownEngine } from './markdownEngine';
import { getWebviewContent } from './webviewContent';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('[NotionMarkdownView] Extension activated!');

  const engine = new NotionMarkdownEngine();
  const activePanels = new Map<string, vscode.WebviewPanel>();

  // Register "Просмотр Md" command
  const openPreviewDisposable = vscode.commands.registerCommand(
    'markdown-notion-view.openPreview',
    async (uri?: vscode.Uri) => {
      try {
        let document: vscode.TextDocument | undefined;

        if (uri && 'fsPath' in uri && uri.fsPath) {
          document = await vscode.workspace.openTextDocument(uri);
        } else if (vscode.window.activeTextEditor) {
          document = vscode.window.activeTextEditor.document;
        }

        if (document && isMarkdownDocument(document)) {
          openNotionPreview(document);
        } else {
          vscode.window.showInformationMessage('Пожалуйста, откройте или выберите Markdown (.md) файл.');
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`Ошибка открытия Notion превью: ${err?.message || err}`);
      }
    }
  );

  function isMarkdownDocument(doc: vscode.TextDocument): boolean {
    return doc.languageId === 'markdown' || doc.fileName.toLowerCase().endsWith('.md');
  }

  function openNotionPreview(doc: vscode.TextDocument) {
    const docKey = doc.uri.toString();
    const fileName = path.basename(doc.fileName);

    let panel = activePanels.get(docKey);

    if (panel) {
      panel.reveal(vscode.ViewColumn.Active);
      updateWebview(panel, doc);
      return;
    }

    // Open Webview in ViewColumn.Active (same editor column)
    panel = vscode.window.createWebviewPanel(
      'notionMarkdownPreview',
      `[Notion] ${fileName}`,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.dirname(doc.fileName))],
      }
    );

    activePanels.set(docKey, panel);

    // Handle messages from Webview (e.g. open source code)
    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'openSource') {
          vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Active, preview: false });
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

  context.subscriptions.push(openPreviewDisposable, changeDocumentDisposable);
}

export function deactivate() {}
