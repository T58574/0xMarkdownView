"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = getWebviewContent;
const template_1 = require("./webview/template");
function getWebviewContent(htmlContent, tocItems, docTitle) {
    return (0, template_1.renderFullHtml)(htmlContent, tocItems, docTitle);
}
//# sourceMappingURL=webviewContent.js.map