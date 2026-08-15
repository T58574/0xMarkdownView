# 📄 0xMarkdownView (Notion Markdown Preview) — VS Code Extension

<div align="center">

[![VS Code](https://img.shields.io/badge/VS_Code-Extension-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![KaTeX](https://img.shields.io/badge/Render-KaTeX_Math-3178C6?style=flat-square)](https://katex.org/)
[![Mermaid](https://img.shields.io/badge/Diagrams-Mermaid_JS-FF3670?style=flat-square)](https://mermaid.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**A modern Visual Studio Code extension providing real-time Notion-style Markdown preview with KaTeX mathematical typesetting, Mermaid diagrams, GitHub alert callouts, and floating Table of Contents.**

[Key Features](#-key-features) • [Installation](#-installation) • [Usage](#-usage) • [Supported Syntax](#-supported-syntax) • [License](#-license)

</div>

---

## 📖 Overview

**0xMarkdownView** (*Notion Markdown Preview*) transforms the standard VS Code Markdown reading experience into an interactive, visually stunning Notion/Obsidian style document. It combines elegant typography with full support for GitHub-style Callout alerts, LaTeX math equations, interactive Mermaid architecture diagrams, and task lists.

---

## ✨ Key Features

- 💎 **Notion-Inspired Typography & Aesthetics**
  - Frosted glass containers, refined typography, and balanced whitespace for comfortable reading.
- 📐 **KaTeX Mathematical Typesetting**
  - High-precision rendering of mathematical notation for inline ($E = mc^2$) and display formulas:
    $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
- 📊 **Interactive Mermaid Diagrams**
  - Seamlessly renders flowcharts, sequence diagrams, state machines, and Gantt charts directly inside the preview.
- 💡 **GitHub Alert Callouts**
  - Native support for `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and `[!CAUTION]` with themed icons and borders.
- 📑 **Floating Interactive Table of Contents (ToC)**
  - Automatically generates smooth-scrolling outline navigation based on header hierarchy.
- 🔄 **Real-Time Synchronized Scrolling**
  - Keeps editor cursor position and preview viewport perfectly aligned.

---

## 🚀 Installation

### Install from VSIX Package
1. Download `markdown-notion-view-1.0.2.vsix` from the repository releases or root.
2. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
3. Type **`Extensions: Install from VSIX...`** and select the `.vsix` file.

### Or Build & Run Locally
```bash
git clone https://github.com/T58574/0xMarkdownView.git
cd 0xMarkdownView
npm install
npm run compile
```
Press `F5` in VS Code to launch the Extension Development Host window.

---

## ⌨️ Usage

- Open any `.md` file in VS Code.
- Click the **Preview** icon (`$(eye)`) in the top-right editor title bar.
- Or press `Ctrl+Shift+P` and choose **`Notion Preview: Open Preview`**.

---

## 📁 Project Structure

```
0xMarkdownView/
├── src/
│   ├── extension.ts         # VS Code extension entry point & command registry
│   ├── markdownEngine.ts    # Markdown-it pipeline (KaTeX, Mermaid, Callouts)
│   └── webviewProvider.ts   # Webview panel manager & theme injector
├── media/                   # Stylesheets, KaTeX assets, and Notion theme CSS
├── package.json             # Extension manifest & contribution points
├── tsconfig.json            # TypeScript compiler configuration
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
