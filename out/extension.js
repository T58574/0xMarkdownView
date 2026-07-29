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
    console.log('[NotionMarkdownView] Extension activated!');
    const engine = new markdownEngine_1.NotionMarkdownEngine();
    const activePanels = new Map();
    // Register "Просмотр Md" command
    const openPreviewDisposable = vscode.commands.registerCommand('markdown-notion-view.openPreview', async (uri) => {
        try {
            let document;
            if (uri && 'fsPath' in uri && uri.fsPath) {
                document = await vscode.workspace.openTextDocument(uri);
            }
            else if (vscode.window.activeTextEditor) {
                document = vscode.window.activeTextEditor.document;
            }
            if (document && isMarkdownDocument(document)) {
                openNotionPreview(document);
            }
            else {
                vscode.window.showInformationMessage('Пожалуйста, откройте или выберите Markdown (.md) файл.');
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Ошибка открытия Notion превью: ${err?.message || err}`);
        }
    });
    function isMarkdownDocument(doc) {
        return doc.languageId === 'markdown' || doc.fileName.toLowerCase().endsWith('.md');
    }
    function openNotionPreview(doc) {
        const docKey = doc.uri.toString();
        const fileName = path.basename(doc.fileName);
        let panel = activePanels.get(docKey);
        if (panel) {
            panel.reveal(vscode.ViewColumn.Active);
            updateWebview(panel, doc);
            return;
        }
        // Open Webview in ViewColumn.Active (same editor column)
        panel = vscode.window.createWebviewPanel('notionMarkdownPreview', `[Notion] ${fileName}`, vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.dirname(doc.fileName))],
        });
        activePanels.set(docKey, panel);
        // Handle messages from Webview (e.g. open source code)
        panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'openSource') {
                vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Active, preview: false });
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
    context.subscriptions.push(openPreviewDisposable, changeDocumentDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map