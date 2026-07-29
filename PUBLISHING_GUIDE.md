# Руководство по публикации и установке расширения Notion Markdown Preview (`0xMarkdownView`)

Это руководство подробно объясняет, как скомпилировать, локально установить и опубликовать расширение в открытый доступ для разработчиков всего мира!

---

## 1. Локальная сборка файлом `.vsix`

Чтобы создать установочный файл `.vsix` на вашем компьютере:

1. Откройте терминал в папке проекта `0xMarkdownView`.
2. Установите зависимости (если ещё не установили):
   ```bash
   npm install
   ```
3. Скомпилируйте TypeScript код:
   ```bash
   npm run compile
   ```
4. Соберите файл расширения `.vsix`:
   ```bash
   npm run package
   ```
   В результате в корне проекта появится файл: `markdown-notion-view-1.0.0.vsix`.

---

## 2. Установка `.vsix` в VS Code / Antigravity / Cursor / VSCodium

### Через графический интерфейс (GUI):
1. Откройте ваш редактор (VS Code, Antigravity, Cursor и т.д.).
2. Перейдите во вкладку **Расширения** (Extensions) `Ctrl+Shift+X` (или `Cmd+Shift+X` на Mac).
3. Нажмите на троеточие **`...`** в верхней правой части панели расширений.
4. Выберите **"Install from VSIX..."** (Установить из VSIX...).
5. Укажите сгенерированный файл `markdown-notion-view-1.0.0.vsix`.

### Через командную строку (CLI):
```bash
# Для обычного VS Code:
code --install-extension markdown-notion-view-1.0.0.vsix

# Для VSCodium:
codium --install-extension markdown-notion-view-1.0.0.vsix
```

---

## 3. Публикация в официальный VS Code Marketplace (Microsoft)

Чтобы расширение появилось в поиске VS Code у всех пользователей:

### Шаг 1: Создание учетной записи издателя (Publisher)
1. Перейдите на [Azure DevOps Management Portal](https://dev.azure.com/).
2. Создайте **Personal Access Token (PAT)** с правами `Marketplace (Manage)`.
3. Зайдите на [Visual Studio Marketplace Publishing Portal](https://marketplace.visualstudio.com/manage) и создайте ваш уникальный **Publisher ID** (например, `my-developer-name`).
4. Укажите этот ID в `package.json` в поле `"publisher": "my-developer-name"`.

### Шаг 2: Публикация одной командой
В терминале выполните:
```bash
npx @vscode/vsce login my-developer-name
# Введите ваш Personal Access Token

npx @vscode/vsce publish
```
После этого ваше расширение станет доступно в официальном магазине VS Code!

---

## 4. Публикация в Open VSX Registry (для VSCodium и Eclipse Theia)

Для того чтобы разработчики, использующие открытые сборки (VSCodium, Gitpod и др.), также могли установить ваше расширение:

1. Зарегистрируйтесь на [Open VSX Registry](https://open-vsx.org/).
2. Создайте токен доступа в профиле (Access Tokens).
3. Опубликуйте расширение командой `ovsx`:
   ```bash
   npx ovsx publish markdown-notion-view-1.0.0.vsix -t YOUR_OPEN_VSX_TOKEN
   ```

---

## 5. Публикация исходного кода на GitHub

Вы также можете выложить проект в GitHub репозиторий:
1. Инициализируйте Git: `git init`
2. Создайте репозиторий на GitHub и привяжите его.
3. Загрузите код. Другие разработчики смогут клонировать его, выполнять `npm run package` или скачивать `.vsix` из раздела **Releases**.
