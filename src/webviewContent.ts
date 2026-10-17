import { TocItem } from './markdownEngine';
import { renderFullHtml } from './webview/template';

export function getWebviewContent(htmlContent: string, tocItems: TocItem[], docTitle: string): string {
  return renderFullHtml(htmlContent, tocItems, docTitle);
}
