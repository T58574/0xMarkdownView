"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const markdownEngine_1 = require("./markdownEngine");
const webviewContent_1 = require("./webviewContent");
const path = __importStar(require("path"));
function activate(context) {
    const engine = new markdownEngine_1.NotionMarkdownEngine();
    const activePanels = new Map();
    // 1. Open Preview (In Active Editor Column / Full reading mode)
    const openPreviewDisposable = vscode.commands.registerCommand('markdown-notion-view.openPreview', async (uri) => {
        await handleOpen(uri, vscode.ViewColumn.Active);
    });
    // 2. Open Preview To Side (Split mode: Editor on Left, Preview on Right)
    const openPreviewToSideDisposable = vscode.commands.registerCommand('markdown-notion-view.openPreviewToSide', async (uri) => {
        await handleOpen(uri, vscode.ViewColumn.Beside);
    });
    async function handleOpen(uri, targetColumn) {
        try {
            let document;
            if (uri && 'fsPath' in uri && uri.fsPath) {
                document = await vscode.workspace.openTextDocument(uri);
            }
            else if (vscode.window.activeTextEditor) {
                document = vscode.window.activeTextEditor.document;
            }
            if (document && isMarkdownDocument(document)) {
                openNotionPreview(document, targetColumn);
            }
            else {
                vscode.window.showInformationMessage('Пожалуйста, откройте или выберите Markdown (.md) файл.');
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Ошибка открытия Notion превью: ${err?.message || err}`);
        }
    }
    function isMarkdownDocument(doc) {
        return doc.languageId === 'markdown' || doc.fileName.toLowerCase().endsWith('.md');
    }
    function openNotionPreview(doc, targetColumn) {
        const docKey = doc.uri.toString();
        const fileName = path.basename(doc.fileName);
        let panel = activePanels.get(docKey);
        if (panel) {
            panel.reveal(targetColumn);
            updateWebview(panel, doc);
            return;
        }
        panel = vscode.window.createWebviewPanel('notionMarkdownPreview', `[Notion] ${fileName}`, targetColumn, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.dirname(doc.fileName))],
        });
        activePanels.set(docKey, panel);
        // Message dispatcher from Webview
        panel.webview.onDidReceiveMessage(async (message) => {
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
                    }
                    else if (/\[x\]/i.test(lineText)) {
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
        }, undefined, context.subscriptions);
        updateWebview(panel, doc);
        panel.onDidDispose(() => {
            activePanels.delete(docKey);
        });
    }
    function updateWebview(panel, doc) {
        const text = doc.getText();
        const fileName = path.basename(doc.fileName);
        const renderResult = engine.render(text);
        panel.webview.html = (0, webviewContent_1.getWebviewContent)(renderResult.html, renderResult.toc, fileName);
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
function deactivate() { }
//# sourceMappingURL=extension.js.map