# ⭐ StarWhiteNote | 个人笔记与资料共享站 (双模驱动版)

> **本地局域网千兆秒开 · GitHub Releases 极速同步 · 国内镜像免翻墙加速 · 严格文档排版预览**

<p align="center">
  <img src="https://img.shields.io/badge/Local_LAN-手机电脑同开-10B981?style=for-the-badge&logo=wifi&logoColor=white" alt="Local LAN">
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote"><img src="https://img.shields.io/badge/GitHub-仓库主页-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo"></a>
  <a href="https://github.com/StarWhiteIsBusy/StarWhiteNote/releases"><img src="https://img.shields.io/badge/Releases-发布新笔记-2563EB?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Releases"></a>
</p>

---

## 💡 为什么使用这个项目的本地网页？

1. **📱 手机、平板同 Wi-Fi 极速畅读**：
   电脑双击运行 `启动本地网页(手机电脑同开).bat`，同一 Wi-Fi 下任何手机、平板直接在自带浏览器输入局域网地址（如 `http://192.168.1.32:3000`），即可秒开浏览全部笔记并下载思维导图！
2. **🚀 国内镜像源与本地 0ms 磁盘缓存**：
   专为国内网络深度优化，内置 **GHProxy 极速镜像源** 与 **本地千兆流式缓存**，告别 GitHub 官方源慢、卡顿或被墙问题，图片与课件秒开！
3. **📁 规范的文件预览与下载机制**：
   - **支持在线预览**：
     - **图片**：PNG, JPG, JPEG, GIF, WebP, SVG（自适应多图画廊，点击放大）
     - **文档**：Word (`.docx`), PPT (`.pptx`), Excel (`.xlsx`), PDF (`.pdf`)
     - **笔记正文**：Markdown (`.md`) 高保真排版渲染
   - **专有格式严格直接下载**：
     - 思维导图 (`.xmind`)、分层绘图 (`.ora`)、白板 (`.excalidraw`)、压缩包 (`.zip`, `.rar`) 等**非图片非文档文件不出现预览窗口，一键直接高速下载**，保留原工程完整格式。

---

## 🚀 启动与使用指南

### 1. 启动本地项目网页（推荐首选）
在桌面文件夹 `StarWhiteNote_web` 中：
- 双击运行 **`启动本地网页(手机电脑同开).bat`**（或 `start.bat`）
- 电脑会自动弹出浏览器并打开：  
  👉 **`http://localhost:3000`**
- 同一个 Wi-Fi 下的手机或平板，直接在手机浏览器输入黑框中打印的局域网地址（例如 `http://192.168.1.32:3000`）即可访问！

### 2. 发布新笔记（GitHub Releases 即后台）
每次需要写新笔记或上传资料时：
1. 打开你的 GitHub 仓库 [Releases 页面](https://github.com/StarWhiteIsBusy/StarWhiteNote/releases)；
2. 点击 **【Draft a new release】**：
   - **Tag version**：填分类标签（如 `物理`、`数学`、`英语`）；
   - **Release title**：填笔记主标题（如 `相遇追及问题技巧总结`）；
   - **Description**：填写 Markdown 笔记详细内容；
   - **Attach binaries**：把你的思维导图 (`.xmind`)、课件 (`.pptx`) 或图片直接拖进去；
3. 点击 **【Publish release】** 发布！
4. 回到本地网页，点击顶部的 **`🔄 同步云端`** 按钮，新发布的笔记与附件便会立即呈现在网页中！

---

## 📋 字段映射规范

| GitHub Release 提交项 | 网页端展示效果 | 说明 |
| :--- | :--- | :--- |
| **Tag version** | **🏷️ 顶部分类标签** | 如填 `数学`，网页生成 `#数学` 标签；支持逗号分隔多个标签 |
| **Release title** | **📌 笔记大标题** | 笔记卡片主标题 |
| **Description** | **📝 笔记详细正文** | 完整支持 Markdown 语法与代码块排版 |
| **Attach binaries** | **🖼️ 图片画廊 & 📎 文件列表** | • 图片自动排版为缩略画廊；<br>• 文档与思维导图自动归入附件列表；<br>• 非图片/非文档一键直接下载 |

---

## 🛠️ 常见问题

- **Q: 手机连接同一个 Wi-Fi 打开提示无法访问？**  
  A: 这是由于 Windows Defender 防火墙拦截了局域网端口。只需在电脑右下角防火墙弹窗提示时选择“允许专用网络访问”，或在 PowerShell (管理员) 中执行：
  ```powershell
  New-NetFirewallRule -DisplayName "StarWhiteNote Web" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
  ```
- **Q: 国内访问图片慢？**  
  A: 网页顶部已默认开启 **`⚡ 本地极速专线 / 🚀 国内极速镜像`**，点击顶部加速药丸可自由切换线路。
