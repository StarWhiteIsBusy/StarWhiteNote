# ⭐ StarWhiteNote | GitHub Pages 纯静态个人笔记与资料分享站

> **永久 0 元运维 · 零后端依赖 · 在线 Word/Excel 排版级预览 · 免费绑定自定义域名**

这是一个专为 **GitHub Pages** 打造的现代化、高颜值纯静态个人笔记与文件共享站。

你不需要购买任何云服务器，也不需要懂复杂的 Linux 运维命令。你的所有笔记与文件都存放在 GitHub 仓库中；访客打开你的专属网址或绑定域名，即可享受极致流畅的**标签筛选、全文搜索、Word 文档在线排版级预览、Excel 表格切换、图片画廊大图浏览与原文件高速下载**！

---

## 🌟 核心特性

- ⚡ **纯静态架构（Jamstack / Git-based CMS）**：
  - 零后端服务器，不消耗一分钱服务器费用，全球 CDN 极速分发，永远不宕机、不休眠。
- 📘 **排版级在线预览引擎（纯浏览器本地运行）**：
  - **Word 文档 (`.docx` / `.doc`)**：原汁原味还原微软 Office 的段落、表格、字体与排版样式，手机和电脑无需安装 Office 即可直接阅读！
  - **Excel 表格 (`.xlsx` / `.csv`)**：支持多工作表（Sheet）在线点击切换，高保真表格渲染。
  - **高清大图画廊**：多图网格自适应展示，点击弹出全屏高清缩放画廊。
  - **PDF 文档**：内置滚动翻页、缩放与阅读器。
- 🏷️ **智能动态标签系统**：
  - 无需硬编码分类，网页会自动扫描 `notes.json` 中的所有标签，动态生成顶部的标签胶囊筛选栏（如 `#工作方案`、`#项目手册`、`#Word文档`）。
- 🔍 **毫秒级全局即时搜索**：
  - 输入关键词，即时在笔记标题、内容正文、标签及关联的所有文件名中进行模糊匹配。
- 🌐 **免费绑定自定义域名**：
  - 支持将你购买的域名（例如 `note.yourdomain.com`）解析至 GitHub Pages，GitHub 全自动免费签发 SSL 证书（永久自动续期 `https://` 绿标）。

---

## 📁 仓库目录结构

将本文件夹内的所有文件上传到你的 GitHub 仓库根目录即可直接工作：

```
StarWhiteNote/
├── index.html               # 网站主界面（纯静态 SPA）
├── style.css                # 现代化样式系统（支持明暗双主题、响应式适配）
├── app.js                   # 纯静态核心逻辑（自动加载 notes.json、动态提取标签、交互与预览）
├── notes.json               # 核心笔记数据清单（直接在 GitHub 网页端编辑登记笔记）
├── files/                   # 资料与附件存储目录（在此上传你的 Word、Excel、图片、PDF 等）
│   ├── StarWhiteNote使用指南与功能手册.docx
│   ├── 共享平台架构与操作界面截图.png
│   └── 项目进度与任务清单示例.xlsx
├── docx-preview.min.js      # 本地离线 Word 排版渲染引擎
├── mammoth.browser.min.js   # Word 备用解析器
├── jszip.min.js             # 解压渲染支持库
├── xlsx.full.min.js         # 本地离线 Excel 渲染引擎
├── start.bat                # 本地电脑一键双击离线预览脚本
└── README.md                # 详细部署与使用指南
```

---

## 🚀 第一部分：如何上线部署到 GitHub Pages（只需 3 分钟）

### 第一步：在 GitHub 创建新仓库
1. 登录你的 [GitHub 账号](https://github.com/)。
2. 点击右上角绿色的 **【New repository】**（新建仓库）。
3. 填写仓库名称（例如：`StarWhiteNote` 或 `my-notes`）。
4. 仓库权限选择 **【Public】**（公开，GitHub Pages 免费版需要 Public 仓库）。
5. 点击最下方的 **【Create repository】**。

### 第二步：上传本项目的所有文件
1. 在刚刚创建好的 GitHub 仓库页面中，点击 **【uploading an existing file】**（上传已有文件）。
2. 将本地项目文件夹（`StarWhiteNote`）中的所有文件和文件夹（`index.html`, `style.css`, `app.js`, `notes.json`, `files/`, `*.min.js` 等）全选并直接拖拽到 GitHub 网页的上传区域。
3. 页面底部的提交框中直接点击绿色的 **【Commit changes】**（保存提交）。

### 第三步：开启 GitHub Pages 网站服务
1. 在你的 GitHub 仓库页面，点击上方的 **【Settings】**（设置）选项卡。
2. 在左侧菜单栏中点击 **【Pages】**。
3. 在 **Build and deployment** 下方的 **Branch**（分支）下拉菜单中：
   - 将 `None` 改为选择 **`main`**（或 `master`）。
   - 目录选择默认的 **`/ (root)`**。
   - 点击右侧的 **【Save】**（保存）。
4. 耐心等待 1~2 分钟，页面上方会出现一行绿色的提示：
   > **"Your site is live at https://你的用户名.github.io/StarWhiteNote/"**
   点击该链接，你的个人笔记与资料分享站就正式全网公开发布上线了！

---

## ✍️ 第二部分：平时如何更新笔记与上传新文件？

完全不需要敲任何 Git 命令行，平时在手机或任意电脑的浏览器里就能轻松维护：

### 1. 上传新文档或图片（Word、Excel、图片、PDF）
1. 在 GitHub 你的仓库页面中，点击进入 **`files/`** 文件夹。
2. 点击右上角 **【Add file】->【Upload files】**。
3. 把你要分享的新文件（例如 `2026年度总结.docx` 或 `架构图.png`）拖拽进网页。
4. 点击底部的 **【Commit changes】** 提交保存。

### 2. 登记笔记（编辑 `notes.json`）
1. 回到仓库根目录，点击打开 **`notes.json`** 文件。
2. 点击右上角的小铅笔图标 **✏️（Edit this file）** 进行在线编辑。
3. 仿照格式在数组中复制追加一条笔记：

```json
[
  {
    "id": "my-new-note-2026",
    "title": "2026 年度工作总结与规划方案（含完整排版）",
    "tags": ["年度汇报", "工作总结", "Word文档"],
    "date": "2026-11-12",
    "content": "这里是站长整理的年度工作总结，包含了核心数据指标与详细图文排版。点击下方按钮即可在线阅读完整 Word 排版，也可以一键下载原文件。",
    "images": [
      {
        "name": "架构图.png",
        "url": "files/架构图.png",
        "size": 25600
      }
    ],
    "files": [
      {
        "name": "2026年度总结.docx",
        "url": "files/2026年度总结.docx",
        "size": 38400
      }
    ]
  }
]
```
4. 点击页面右上角的绿色 **【Commit changes】** 提交保存。
5. 等待 30 秒左右，GitHub Pages 就会自动更新，刷新网页即可看到最新内容！

---

## 🌐 第三部分：如何绑定你的自定义域名？

如果你有自己的独立域名（例如你在阿里云、腾讯云或万网购买了 `yourdomain.com`，想用 `note.yourdomain.com` 访问）：

### 第一步：在域名解析商处添加 CNAME 记录
登录你的阿里云/腾讯云域名解析控制台，添加一条 DNS 记录：
* **记录类型**：`CNAME`
* **主机记录**：`note`（代表二级域名 `note.yourdomain.com`；若要用主域名请填 `@`）
* **记录值**：`你的GitHub用户名.github.io`（例如 `zhangsan.github.io`）
* **TTL**：默认 600 秒

### 第二步：在 GitHub 仓库设置中填入域名
1. 打开 GitHub 仓库的 **【Settings】->【Pages】**。
2. 找到 **Custom domain**（自定义域名）输入框。
3. 填入你的完整域名（如 `note.yourdomain.com`），点击 **Save**。
4. GitHub 会自动在仓库根目录下生成一个 `CNAME` 文件，并自动向国际证书颁发机构申请免费的 SSL 证书。
5. 勾选下方的 **【Enforce HTTPS】**（强制开启 HTTPS 安全访问）。
6. 解析生效后（通常 5~15 分钟），任何人访问 `https://note.yourdomain.com` 就可以直接秒开你的网站了！

---

## 💻 本地离线预览

如果你在自己电脑上修改了 `notes.json` 或添加了新文档，想要在上传到 GitHub 之前先在电脑上看看效果：
* 直接双击运行项目根目录下的 **`start.bat`**。
* 浏览器会自动打开 `http://localhost:3000`，呈现与 GitHub Pages 上完全一致的效果。
