# ⭐ StarWhiteNote | 个人笔记与资料分享站 (GitHub Pages 极速纯静态版)

> **GitHub Pages 免费托管 · 多线国内极速镜像源 · 毫秒级即时加载 · 严格文档排版预览**

<p align="center">
  <a href="https://starwhitenote.xyz/"><img src="https://img.shields.io/badge/Website-访问主页-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website"></a>
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote"><img src="https://img.shields.io/badge/GitHub-仓库主页-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo"></a>
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote/releases"><img src="https://img.shields.io/badge/Releases-发布新笔记-10B981?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Releases"></a>
</p>

---

## 🌐 网站专属在线地址

👉 **[https://starwhitenote.xyz/](https://starwhitenote.xyz/)** （独立顶级域名）
备用地址：[https://starwhiteisbusy.github.io/StarWhiteNote/](https://starwhiteisbusy.github.io/StarWhiteNote/)

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

## 📝 怎样管理与发布新笔记？

直接在 GitHub 网页端操作，无需安装任何本地环境或运行脚本：

1. **直接进入学科目录**：
   - 打开 GitHub 仓库，进入 `notes/` 对应的科目文件夹（如 `notes/数学/`、`notes/英语/`、`notes/物理/`）；
2. **新建文章目录并上传资料**：
   - 点击右上角 **【Add file】 ➔ 【Upload files】**（或 **【Create new file】** 创建 Markdown 正文）；
   - 以文章标题命名子文件夹（如 `notes/数学/平面向量的数量积/`）；
   - 将导出的思维导图 (`.xmind`)、笔记正文 (`.md`)、板书截图 (`.png`) 拖入保存；
3. **云端全自动构建发布**：
   - 提交保存（Commit changes）后，GitHub Actions 云端机器人会在 10 秒内全自动更新知识库全景索引；
   - GitHub Pages 全球 CDN 将在 30 秒内自动完成全网部署上线！
