# ⭐ StarWhiteNote | 个人笔记与资料云端共享站

> **永久 0 元成本 · 100% 纯静态架构 · 免登录直接畅读 · 浏览器级 Word/Excel 排版预览 · 全球 CDN 极速加速**

![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-blue?logo=github)
![Zero Backend](https://img.shields.io/badge/Backend-100%25%20Static-green)
![CDN Acceleration](https://img.shields.io/badge/CDN-jsDelivr%20Anycast-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 📖 项目简介

**StarWhiteNote** 是一个专为个人笔记记录、电子资料整理与公开分享打造的高颜值、现代化的纯静态云端笔记共享站。

- **无需租用服务器**：完全托管在 GitHub Pages 上，零服务器月租，不休眠、不宕机；
- **访客免登录**：任何人打开网址即可直接阅读全部笔记，无需注册或输入任何访问密码；
- **排版级在线预览**：浏览器内置轻量化解析引擎，不需要安装 Office 或 WPS 软件，点击直接在线完整还原 Word 排版、Excel 多工作表与高清图片；
- **极速更新体验**：支持在 GitHub 网页端随手上传，也支持在 Windows 本地双击脚本一键发布与同步。

---

## ✨ 核心特性

- ⚡ **纯静态免登录架构（Git-based CMS）**
  所有笔记和文件全部存储在 GitHub 仓库中。访客打开即读，站长通过 GitHub 权限管理内容，兼顾开放共享与数据安全。
- 📘 **排版级 Office 预览引擎（纯浏览器前端渲染）**
  - **Word 文档 (`.docx`)**：高保真还原微软 Word 排版、段落缩进、加粗标题、表格及样式，居中单页纸张级阅读体验；
  - **Excel 表格 (`.xlsx` / `.csv`)**：支持多工作表（Sheet Tabs）在线点击切换，快速查阅表格数据；
  - **高清大图画廊**：多图网格自适应展示，点击支持全屏放大查看与另存原图；
  - **文件即时下载**：所有关联文档与附件均支持一键高速下载。
- 🚀 **GitHub Pages 全球加速（默认开启）**
  - 顶部状态栏默认启用 `⚡ GitHub Pages 全球加速`，配备呼吸状态绿灯指示；
  - 底层自动路由至全球 Anycast 边缘 CDN（jsDelivr CDN），彻底解决国内直连 GitHub Pages 延迟卡顿的问题，实现秒级加载；
  - 点击加速胶囊可随时在「全球 CDN 极速加速」与「GitHub 官方源直连」之间自由切换。
- 🏷️ **智能标签动态聚合**
  网页自动扫描笔记数据中的所有标签，动态聚合生成顶部胶囊筛选栏（如 `#使用指南`、`#Word文档`、`#项目资料`），点击标签即时筛选。
- 🔍 **毫秒级全局模糊搜索**
  输入关键词，实时在笔记标题、内容正文、分类标签以及关联的文件名中进行即时匹配。
- 🌙 **Apple / Notion 极简设计美学**
  - 清晰排版、舒适对比度、平滑圆角与细致微动效；
  - 右上角支持一键切换明亮模式（Light）与暗黑模式（Dark）。

---

## 📁 项目目录结构

```text
StarWhiteNote/
├── index.html               # 网站主界面（纯静态 SPA 单页应用）
├── style.css                # 现代极简设计系统（支持明暗双主题、响应式自适应）
├── app.js                   # 前端核心业务逻辑（数据加载、标签提取、搜索过滤、预览驱动）
├── notes.json               # 笔记数据库清单（直接在 GitHub 网页端或本地编辑登记）
├── files/                   # 电子资料与附件存储目录
│   ├── StarWhiteNote使用指南与功能手册.docx
│   ├── 共享平台架构与操作界面截图.png
│   └── 项目进度与任务清单示例.xlsx
├── docx-preview.min.js      # 浏览器端 Word 排版级预览引擎
├── mammoth.browser.min.js   # Word 文档备用轻量解析库
├── xlsx.full.min.js         # 浏览器端 Excel 高保真表格解析引擎
├── jszip.min.js             # 客户端解压与流式文件读取库
├── 一键发布到GitHub.bat     # Windows 极简一键推送发布脚本
├── 一键同步云端最新.bat     # Windows 一键拉取同步最新修改脚本
├── start.bat                # 本地电脑离线预览调试服务启动脚本
├── server.js                # 本地简易零依赖预览服务（Node.js 原生驱动）
└── README.md                # 本说明文档
```

---

## 🚀 首次部署上线指南（只需 2 步）

仓库地址：[https://github.com/StarWhiteIsBusy/StarWhiteNote](https://github.com/StarWhiteIsBusy/StarWhiteNote)

### 第 1 步：一键推送本地文件到 GitHub
1. 打开项目所在的本地文件夹；
2. 双击运行 **`一键发布到GitHub.bat`**：
   - 提示输入更新说明时，直接按 **Enter 回车**；
   - Git 会自动弹出浏览器窗口，点击 **【Authorize git-ecosystem】** 授权登录即可；
   - 脚本会自动将所有静态页面、引擎库及附件推送到您的 GitHub 仓库。

### 第 2 步：在 GitHub 仓库开启免费 Pages 托管
1. 打开您的 GitHub 仓库设置页面：  
   👉 [https://github.com/StarWhiteIsBusy/StarWhiteNote/settings/pages](https://github.com/StarWhiteIsBusy/StarWhiteNote/settings/pages)
2. 在 **Build and deployment** 下方的 **Source** 选择 **Deploy from a branch**；
3. 在 **Branch** 下拉框中选择 **`main`** 分支，目录保持默认的 **`/(root)`**；
4. 点击右侧绿色的 **Save** 保存！

---

### 🎉 全网访问网址

保存后等待约 30 秒至 1 分钟，您的专属网站便会自动部署生效：

👉 **`https://starwhiteisbusy.github.io/StarWhiteNote/`**

任何人通过手机或电脑浏览器打开该链接，即可畅读您的全部笔记并在线预览或下载附件！

---

## ✍️ 日常更新与维护说明

平时更新笔记或添加新文件时，您可以根据使用场景自由选择以下两种方式之一：

### 方式 A：在 GitHub 网页端随手更新（适合日常笔记与普通文档）

#### 1. 上传新文件
进入仓库的 **`files/`** 目录，点击 **【Add file】->【Upload files】** 上传您的 Word、Excel 或 PDF 文件并提交。

#### 2. 登记新笔记
在根目录下编辑 **`notes.json`**，仿照格式复制追加一条笔记并保存提交。

---

### 方式 B (强烈推荐)：通过 GitHub Releases 上传图片与大文件（不占用仓库体积）

如果您有很多**高清图片、思维导图、工程安装包或超大 PDF**，强烈建议将它们上传到 GitHub Releases 中：
- **零代码膨胀**：代码仓库永远保持只有几 MB，无论传多少 GB 图片都不会让 git clone / git push 变卡；
- **单文件最高支持 2GB**，永久免维护全球加速分发！

#### 操作步骤：
1. 打开您的 GitHub 仓库页面，点击右侧的 **【Releases】**（或者直接访问 `https://github.com/StarWhiteIsBusy/StarWhiteNote/releases`）；
2. 点击 **【Draft a new release】**：
   - **Tag version**（标签名）：填写 `assets`（或者版本号如 `v1.0`）；
   - **Release title**（标题）：填写 `资源附件库`；
   - 在底部的 **Attach binaries by dropping them here or selecting them** 框中，把你的高清图片（`.png`, `.jpg`, `.webp`）或大文件直接拖拽进去；
3. 点击最下方绿色的 **【Publish release】** 发布保存；
4. 回到根目录的 **`notes.json`** 中，在图片登记项中只需填写：
```json
"images": [
  {
    "name": "思维导图大图.png",
    "release": "assets"
  }
]
```
或者直接填写上传后的完整下载链接：
```json
"images": [
  {
    "name": "思维导图大图.png",
    "url": "https://github.com/StarWhiteIsBusy/StarWhiteNote/releases/download/assets/思维导图大图.png"
  }
]
```
StarWhiteNote 引擎会自动识别并进行极速加载与全屏放大！

---

### 方式 C：在本地电脑编辑后一键发布（双击批处理）

1. 把新文件直接放到本地的 `files/` 文件夹下；
2. 用记事本或编辑器打开 `notes.json` 登记笔记；
3. 双击运行 **`一键发布到GitHub.bat`**，按一下回车，自动同步推送上云！
4. 如果您在网页端做过修改，只需在本地双击 **`一键同步云端最新.bat`** 即可拉取最新变动。

---

## 💻 本地离线开发与预览

若需要在离线或无网环境下预览网站：

1. 双击运行 **`start.bat`**；
2. 浏览器将自动打开 `http://localhost:3000`；
3. 可在本地完整体验标签分类、全文搜索、Office 文档在线预览与下载。

---

## 🌐 绑定独立域名（进阶可选）

如果您拥有自己的个性化域名（例如 `notes.yourdomain.com`）：

1. **添加 CNAME 解析**：登录您的域名服务商后台（阿里云 / 腾讯云 / Cloudflare），添加一条 CNAME 解析记录，主机记录填写 `notes`，记录值填写 `starwhiteisbusy.github.io`；
2. **在 GitHub 绑定**：打开仓库 **Settings -> Pages**，在 **Custom domain** 框中填入您的域名并点击 Save；
3. **启用 HTTPS**：勾选 **Enforce HTTPS**，GitHub 会全自动签发全球信任的 SSL 安全证书并保持永久自动续期。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源，供个人学习、知识沉淀与资料分享免费使用。
