# ⭐ StarWhiteNote | 个人笔记与资料分享站 (GitHub Pages 极速纯静态版)

> **GitHub Pages 免费托管 · 多线国内极速镜像源 · 毫秒级即时加载 · 严格文档排版预览**

<p align="center">
  <a href="https://starwhiteisbusy.github.io/StarWhiteNote/"><img src="https://img.shields.io/badge/Website-访问主页-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website"></a>
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote"><img src="https://img.shields.io/badge/GitHub-仓库主页-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo"></a>
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote/releases"><img src="https://img.shields.io/badge/Releases-发布新笔记-10B981?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Releases"></a>
</p>

---

## 🌐 网站专属在线地址

👉 **[https://starwhiteisbusy.github.io/StarWhiteNote/](https://starwhiteisbusy.github.io/StarWhiteNote/)**

- **零成本永久运行**：完全托管在 GitHub Pages，不需要任何服务器或数据库。
- **免登录公开畅读**：任何人打开网址即可直接阅读全部笔记、预览文档排版与高速下载资料。

---

## ⚡ 为什么现在打开速度飞快？

针对国内访问 GitHub 慢、图片加载卡顿的问题，本版本深度升级了三大加速引擎：

1. **🚀 50毫秒级即时直出（首屏秒开）**：
   - 网页优先从 GitHub Pages 边缘 CDN 读取静态索引，**打开网页 50ms 内瞬间呈现所有笔记卡片**，绝不白屏等待；
   - 随后在后台静默请求 GitHub Releases 同步最新版本，实现平滑无感更新。
2. **🛡️ 多线国内极速镜像源 + 自动容灾**：
   - 内置 **GH-Proxy 专线、GHProxy.net、Mirror.ghproxy、Akams** 等多条国内高速镜像；
   - **自动失败重试**：当一张图片在当前节点加载慢或失败时，网页会自动无缝切换至下一条镜像重试，确保图片 100% 秒级加载！
   - 点击顶部药丸按钮，也可手动自由切换线路。
3. **🎯 严格规范的在线预览过滤**：
   - **允许在线预览**：
     - **图片**：PNG, JPG, JPEG, GIF, WebP, SVG（自适应缩略画廊，点击放大）
     - **文档**：Word (`.docx`), PPT (`.pptx`), Excel (`.xlsx`), PDF (`.pdf`)
     - **笔记正文**：Markdown (`.md`) 高保真排版渲染
   - **专有格式严格直接下载**：
     - 思维导图 (`.xmind`)、分层绘图 (`.ora`)、白板 (`.excalidraw`)、压缩包 (`.zip`, `.rar`) 等**非图片非文档文件不出现预览窗口，一键直接高速下载**，保留原工程完整格式。

---

## 📝 怎样发布新笔记与思维导图？

每次写新笔记或上传资料，只需在 GitHub 网页上点几下即可：

1. 进入你的 GitHub 仓库 [Releases 页面](https://github.com/StarWhiteIsBusy/StarWhiteNote/releases)；
2. 点击 **【Draft a new release】**：
   - **Tag version**：填分类标签（如 `物理`、`数学`、`英语`）；
   - **Release title**：填笔记主标题（如 `相遇追及问题技巧总结`）；
   - **Description**：填写 Markdown 笔记正文；
   - **Attach binaries**：把你的思维导图 (`.xmind`)、课件 (`.pptx`) 或图片直接拖进去；
3. 点击 **【Publish release】** 发布；
4. 任何人访问你的 GitHub Pages 网站，点击右上角 **`🔄 同步云端`** 即可立即查看到最新发布的笔记！

---

## 📂 本地文件夹一键发布工具

在本地 `StarWhiteNote_web` 文件夹中：
- 双击运行 **`一键发布到GitHub.bat`**：输入更新说明按回车，即可全自动将本地最新文件与修改推送到 GitHub 仓库并自动触发 GitHub Pages 全网部署。
- 双击运行 **`一键同步云端最新.bat`**：一键拉取合并云端的所有改动。
