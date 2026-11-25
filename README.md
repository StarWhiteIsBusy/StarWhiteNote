# StarWhiteNote

一个纯静态、免后端的个人学科笔记与学习资料共享站点。基于 GitHub Pages 部署，绑定独立域名，开箱即用。

- 访问地址：[https://starwhitenote.xyz](https://starwhitenote.xyz)
- 备用地址：[https://starwhiteisbusy.github.io/StarWhiteNote/](https://starwhiteisbusy.github.io/StarWhiteNote/)

---

## 目录结构说明

所有笔记与附件均存放在 `notes/` 目录下，按照 `notes/学科/专题名称/` 的层级进行维护：

```text
notes/
├── 数学/
│   └── 导数-曲线的切线与公切线/
│       ├── 导数-曲线的切线与公切线.md   # 笔记正文（Markdown 格式，可选）
│       ├── 板书.png                    # 板书截图或思维导图预览（支持在线查看与缩放）
│       └── 思维导图.xmind              # 附件资料（支持单文件或打包下载）
├── 物理/
│   └── 弹簧模型中的能量动量问题/
│       └── 截图.png
└── 化学/
    └── 电解质与非电解质/
        ├── 电解质与非电解质.md
        ├── 电解质与非电解质.png
        └── 电解质与非电解质.xmind
```

- **Markdown 正文**：若目录下存在 `.md` 文件，将提取为文章正文，在卡片预览与独立阅读器中排版展示。
- **图片资料**（PNG、JPG、WebP 等）：卡片内展示缩略图，点击后进入大图模式，支持鼠标滚轮无级缩放与拖拽平移。
- **附件文件**（XMind、Docx、Xlsx、PDF、Zip 等）：思维导图等专有格式提供直接下载，Office/PDF 支持预览，支持将单篇笔记下的所有附件一键打包（Zip）下载。

---

## 功能特性

- **纯静态架构**：无需服务器与数据库，依赖静态生成的 `notes.json` 索引文件，打开即可浏览。
- **双层同步机制**：
  - 默认读取本地静态索引，加载迅速；
  - 若在 GitHub 网页端刚上传新文件、云端尚未重新生成索引，前端会自动通过 GitHub API 探测新目录并提取时间戳与正文，无缝衔接。
- **阅读与交互**：
  - **阅读器弹窗**：提供清晰的 Markdown 阅读界面，自动过滤重复的一级标题。
  - **图片预览**：画廊布局，支持滚轮缩放、自适应居中与拖拽平移。
  - **一键打包**：当单篇笔记包含多个附件或图片时，支持一键生成 Zip 压缩包下载全部资源。
- **检索与筛选**：
  - 支持按学科标签快速筛选，动态统计各分类篇数。
  - 实时全局搜索，支持搜索标题、标签、正文内容及附件文件名。
  - 支持切换时间排序（最新发布优先 / 最早发布优先）。
- **网络适配**：
  - 内置多组 GitHub 资源加速节点（如 gh-proxy 等），资源加载失败时自动切换备用节点重试，也支持手动切换线路。
- **界面与主题**：
  - 支持深色 / 浅色模式切换。
  - 针对桌面端与移动端分别做了排版适配。

---

## 添加与更新笔记

### 方式一：GitHub 网页端直接添加（无需本地环境）

1. 进入仓库的 `notes/` 目录，进入或新建对应的学科文件夹（如 `notes/化学/`）。
2. 在该学科下新建一个以专题命名的子文件夹，将整理好的 `.md`、图片或 `.xmind` 拖拽上传。
3. 提交更改（Commit changes）后，GitHub Actions 会自动运行构建脚本更新 `notes.json` 索引，并触发 GitHub Pages 发布。

### 方式二：本地管理与推送

1. 克隆仓库到本地：
   ```bash
   git clone https://github.com/StarWhiteIsBusy/StarWhiteNote.git
   cd StarWhiteNote
   ```
2. 将整理好的资料放入 `notes/学科/专题名称/` 下。
3. 运行本地构建脚本更新索引：
   ```bash
   python build_notes.py
   ```
   脚本会扫描目录、根据 Git 提交记录提取真实创建时间、清洗 Markdown 标题并生成格式化的 `notes.json`。
4. 提交并推送到 GitHub：
   ```bash
   git add .
   git commit -m "add: 新增某专题笔记"
   git push origin main
   ```

---

## 本地预览

本项目为纯静态前端，使用任意静态 HTTP 服务即可打开：

```bash
# Python 3
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

浏览器打开 `http://localhost:8080` 即可查看。

---

## 开源协议

本项目采用 [MIT License](LICENSE) 授权。
