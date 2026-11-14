// StarWhiteNote - Pure Static Edition for GitHub Pages & Custom Domain
(function () {
  'use strict';

  // --- State ---
  let notes = [];
  let allTags = [];
  let activeTab = 'notes';
  let activeTag = 'all';
  let searchQuery = '';

  // Domestic High-Speed Mirror Lines for GitHub Pages (国内高速镜像源与自动容灾)
  const MIRROR_NODES = [
    {
      id: 'gh-proxy',
      name: '🚀 极速镜像 1 (GH-Proxy 专线 - 推荐)',
      short: '🚀 极速镜像 1 (推荐)',
      desc: '专为国内网络优化，超快加载图片与高速下载附件，免翻墙秒开',
      prefix: 'https://gh-proxy.com/',
      color: '#10b981'
    },
    {
      id: 'ghproxy-net',
      name: '⚡ 极速镜像 2 (GHProxy.net 节点)',
      short: '⚡ 极速镜像 2',
      desc: '国内多线 CDN 节点加速，针对电信/移动深度优化',
      prefix: 'https://ghproxy.net/',
      color: '#06b6d4'
    },
    {
      id: 'mirror-ghproxy',
      name: '🛡️ 备用镜像 3 (Mirror.ghproxy)',
      short: '🛡️ 备用镜像 3',
      desc: '高可用稳定备用镜像代理节点',
      prefix: 'https://mirror.ghproxy.com/',
      color: '#8b5cf6'
    },
    {
      id: 'akams',
      name: '🚄 备用镜像 4 (Akams 镜像源)',
      short: '🚄 备用镜像 4',
      desc: '开源镜像加速通道，保障大文件下载顺畅',
      prefix: 'https://github.akams.cn/',
      color: '#f59e0b'
    },
    {
      id: 'direct',
      name: '🌐 GitHub 官方源 (直连模式)',
      short: '🌐 官方直连',
      desc: '直接连接 GitHub 官方原始服务器 (科学上网环境推荐)',
      prefix: '',
      color: '#94a3b8'
    }
  ];

  let currentMirrorId = localStorage.getItem('starwhite_mirror_id') || 'gh-proxy';

  // --- DOM Elements ---
  const el = {
    // Nav tabs
    navTabs: document.getElementById('navTabs'),
    tabPanes: {
      notes: document.getElementById('tab-notes'),
      guide: document.getElementById('tab-guide')
    },

    // Search & Theme
    globalSearch: document.getElementById('globalSearch'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Stats & CDN Toggle
    statNotesCount: document.getElementById('statNotesCount'),
    statFilesCount: document.getElementById('statFilesCount'),
    statTagsCount: document.getElementById('statTagsCount'),
    cdnTogglePill: document.getElementById('cdnTogglePill'),
    cdnBadgeText: document.getElementById('cdnBadgeText'),

    // Tags & Notes Section
    tagsList: document.getElementById('tagsList'),
    notesFilterHint: document.getElementById('notesFilterHint'),
    notesList: document.getElementById('notesList'),

    // Note Reader Modal
    noteReaderModal: document.getElementById('noteReaderModal'),
    closeReaderBtn: document.getElementById('closeReaderBtn'),
    closeReaderFooterBtn: document.getElementById('closeReaderFooterBtn'),
    readerTitle: document.getElementById('readerTitle'),
    readerTags: document.getElementById('readerTags'),
    readerDate: document.getElementById('readerDate'),
    readerContent: document.getElementById('readerContent'),
    readerImagesSection: document.getElementById('readerImagesSection'),
    readerImageCount: document.getElementById('readerImageCount'),
    readerImagesGrid: document.getElementById('readerImagesGrid'),
    readerAttachmentsSection: document.getElementById('readerAttachmentsSection'),
    readerDocCount: document.getElementById('readerDocCount'),
    readerDocsList: document.getElementById('readerDocsList'),
    copyNoteContentBtn: document.getElementById('copyNoteContentBtn'),

    // File Preview Modal
    filePreviewModal: document.getElementById('filePreviewModal'),
    closePreviewBtn: document.getElementById('closePreviewBtn'),
    previewFileIcon: document.getElementById('previewFileIcon'),
    previewFileName: document.getElementById('previewFileName'),
    previewFileSize: document.getElementById('previewFileSize'),
    previewContainer: document.getElementById('previewContainer'),
    previewHintText: document.getElementById('previewHintText'),
    previewDownloadBtn: document.getElementById('previewDownloadBtn'),
    previewFullscreenBtn: document.getElementById('previewFullscreenBtn'),
    previewHeaderActionBtn: document.getElementById('previewHeaderActionBtn'),

    toastContainer: document.getElementById('toastContainer')
  };

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Mirror Acceleration UI & Switching ---
  function updateCdnUI() {
    if (!el.cdnBadgeText) return;
    const dot = document.querySelector('.cdn-status-dot');
    const cur = MIRROR_NODES.find(m => m.id === currentMirrorId) || MIRROR_NODES[0];
    el.cdnBadgeText.textContent = cur.short;
    if (dot) dot.style.backgroundColor = cur.color;
    if (el.cdnTogglePill) {
      el.cdnTogglePill.title = `当前加速线路: ${cur.name}\n${cur.desc}\n(点击切换镜像线路)`;
    }
  }

  function cycleAccelMode() {
    const curIdx = MIRROR_NODES.findIndex(m => m.id === currentMirrorId);
    const nextIdx = (curIdx + 1) % MIRROR_NODES.length;
    currentMirrorId = MIRROR_NODES[nextIdx].id;
    localStorage.setItem('starwhite_mirror_id', currentMirrorId);
    updateCdnUI();
    showToast(`已切换至: ${MIRROR_NODES[nextIdx].name}`);
    renderNotes();
  }

  // Global automatic fallback if an image fails to load on the current mirror
  window.handleImageError = function (img) {
    const rawUrl = img.dataset.rawUrl;
    if (!rawUrl) return;
    let attempt = parseInt(img.dataset.attempt || '0', 10);
    attempt++;
    if (attempt < MIRROR_NODES.length) {
      img.dataset.attempt = attempt;
      const node = MIRROR_NODES[attempt];
      img.src = node.prefix ? `${node.prefix}${rawUrl}` : rawUrl;
    }
  };

  const GITHUB_REPO_URL = 'https://github.com/StarWhiteIsBusy/StarWhiteNote';

  function resolveAssetUrl(item) {
    if (!item) return '';

    let rawUrl = '';
    if (item.url) {
      rawUrl = item.url;
    } else if (item.release) {
      rawUrl = `${GITHUB_REPO_URL}/releases/download/${encodeURIComponent(item.release)}/${encodeURIComponent(item.name)}`;
    } else {
      rawUrl = `files/${item.name}`;
    }

    // Relative local path in repository (e.g. notes/..., files/...)
    if (rawUrl.startsWith('notes/') || rawUrl.startsWith('files/') || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
      return rawUrl;
    }

    // Full HTTP/HTTPS URLs (GitHub Releases download assets)
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      const activeNode = MIRROR_NODES.find(m => m.id === currentMirrorId) || MIRROR_NODES[0];
      return activeNode.prefix ? `${activeNode.prefix}${rawUrl}` : rawUrl;
    }

    return rawUrl;
  }

  function formatBytes(bytes) {
    if (bytes === undefined || bytes === null || bytes === '') return '';
    const num = typeof bytes === 'number' ? bytes : Number(bytes);
    if (isNaN(num)) return String(bytes);
    if (num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFileIcon(filename) {
    if (!filename) return '📄';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'doc':
      case 'docx': return '📘';
      case 'pdf': return '📕';
      case 'xls':
      case 'xlsx':
      case 'csv': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz': return '📦';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
      case 'svg': return '🖼️';
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov': return '🎬';
      case 'mp3':
      case 'flac':
      case 'wav': return '🎵';
      case 'txt':
      case 'md': return '📝';
      case 'js':
      case 'ts':
      case 'py':
      case 'html':
      case 'css':
      case 'json': return '💻';
      default: return '📄';
    }
  }

  // Allowed preview types (严格限制: 仅图片、文档包括 docx/pptx/xlsx/pdf、以及 md 文件支持在线预览)
  // 非图片、非文档、非 md 文件 (如 xmind, ora, excalidraw, zip 等) 一律不提供预览，直接下载
  function isPreviewableFile(filename) {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    const allowed = [
      // 1. 图片
      'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
      // 2. 文档
      'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'pdf',
      // 3. MD 文件
      'md', 'markdown'
    ];
    return allowed.includes(ext);
  }

  function renderMarkdown(md) {
    if (!md) return '';
    let html = escapeHTML(md)
      .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre><code>${p1.trim()}</code></pre>`)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^---$/gim, '<hr style="border:none; border-top:1px solid var(--border-color); margin:1.5rem 0;">')
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');

    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    return `<p>${html}</p>`;
  }

  // --- Data Loading (Auto-sync GitHub Releases as Notes CMS) ---
  const GITHUB_RELEASES_API = 'https://api.github.com/repos/StarWhiteIsBusy/StarWhiteNote/releases';

  function transformReleaseToNote(rel) {
    // 1. Tag parsing with smart category grouping:
    // 支持序号防重复（如 数学-2, 数学_02, 数学2 均自动归入 #数学 主分类）
    // 支持副标题（如 数学-绝对值 自动归入 #数学 与 #绝对值）
    // 支持在 Description 正文第一行写：标签: 数学, 导图
    let tags = [];
    const bodyText = rel.body || '';
    const tagMatch = bodyText.match(/^(?:标签|分类|Tag|Tags)[:：]\s*([^\r\n]+)/im);
    if (tagMatch) {
      tags = tagMatch[1].split(/[,;\s/]+/).map(t => t.trim()).filter(Boolean);
    }

    if (tags.length === 0) {
      const rawTag = (rel.tag_name || '未分类').trim();
      const parts = rawTag.split(/[,;\s/]+/).map(t => t.trim()).filter(Boolean);
      for (const p of parts) {
        // e.g. "数学-2" / "数学_02" / "数学2" -> 智能提取主分类 "数学"
        const mainCat = p.replace(/[-_.]\d+$/, '').replace(/\d+$/, '').trim();
        if (mainCat) tags.push(mainCat);
        // 若为 "数学-绝对值"，同时登记两个分类
        if (p.includes('-') || p.includes('_')) {
          const subparts = p.split(/[-_]+/).map(s => s.trim()).filter(s => s && !/^\d+$/.test(s));
          subparts.forEach(sp => { if (!tags.includes(sp)) tags.push(sp); });
        }
      }
    }

    if (tags.length === 0) tags = ['未分类'];
    tags = Array.from(new Set(tags));

    // 2. Assets -> images & files
    const images = [];
    const files = [];
    (rel.assets || []).forEach(asset => {
      const ext = (asset.name || '').split('.').pop().toLowerCase();
      const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
      const item = {
        name: asset.name,
        url: asset.browser_download_url,
        size: asset.size || 0
      };
      if (isImg) images.push(item);
      else files.push(item);
    });

    return {
      id: `rel-${rel.id}`,
      title: rel.name || rel.tag_name || '未命名笔记',
      tags: tags.length ? tags : ['未分类'],
      date: (rel.published_at || rel.created_at || '').slice(0, 10),
      content: rel.body || '（无详细说明正文）',
      images,
      files,
      isRelease: true,
      htmlUrl: rel.html_url
    };
  }

  function applyNotes(combinedList, isFromSync = false) {
    if (!Array.isArray(combinedList) || combinedList.length === 0) return;
    notes = combinedList;
    const tagSet = new Set();
    let totalFiles = 0;
    for (const n of notes) {
      (n.tags || []).forEach(t => {
        if (t && t.trim()) tagSet.add(t.trim());
      });
      totalFiles += (n.images ? n.images.length : 0) + (n.files ? n.files.length : 0);
    }
    allTags = Array.from(tagSet);

    el.statNotesCount.textContent = notes.length;
    el.statFilesCount.textContent = totalFiles;
    el.statTagsCount.textContent = allTags.length;

    renderTagsBar();
    renderNotes();

    if (isFromSync) {
      showToast(`✅ 已刷新！当前共收录 ${notes.length} 篇学科笔记与资料`, 'success');
    }
  }

  async function loadNotesData(isManualSync = false) {
    if (el.notesList && !isManualSync && notes.length === 0) {
      el.notesList.innerHTML = '<div class="loading-placeholder">正在加载笔记与思维导图...</div>';
    }

    // Read notes.json directly from repository root
    try {
      const res = await fetch(`notes.json?_t=${Date.now()}`);
      if (res.ok) {
        const localNotes = await res.json();
        if (Array.isArray(localNotes) && localNotes.length > 0) {
          localNotes.forEach((n, idx) => {
            n.id = n.id || `note-${idx + 1}`;
            n.tags = Array.isArray(n.tags) ? n.tags : [];
            n.images = Array.isArray(n.images) ? n.images : [];
            n.files = Array.isArray(n.files) ? n.files : (Array.isArray(n.attachments) ? n.attachments : []);
          });
          applyNotes(localNotes, isManualSync);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load notes.json:', e);
      if (isManualSync) {
        showToast('❌ 刷新失败，请检查网络或本地文件', 'error');
      }
    }

    if (notes.length === 0) {
      el.notesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>知识库中暂未发现笔记</h3>
          <p>请在 notes/ 对应学科文件夹中放入笔记或导图文件。</p>
        </div>
      `;
    }
  }
          <div class="empty-icon">📝</div>
          <h3>尚未发布任何笔记或思维导图</h3>
          <p>可以在 GitHub 仓库右侧点击【Releases】->【Draft a new release】快速发布第一篇笔记！</p>
        </div>
      `;
    }
  }

  // --- Dynamic Tags Filter Bar ---
  function renderTagsBar() {
    let html = `
      <button class="tag-pill ${activeTag === 'all' ? 'active' : ''}" data-tag="all">全部笔记 (${notes.length})</button>
    `;

    for (const t of allTags) {
      const count = notes.filter(n => (n.tags || []).includes(t)).length;
      const isSelected = activeTag === t;
      html += `
        <button class="tag-pill ${isSelected ? 'active' : ''}" data-tag="${escapeHTML(t)}">
          <span>#${escapeHTML(t)}</span>
          <span style="font-size:0.75rem; opacity:0.8; margin-left:2px;">(${count})</span>
        </button>
      `;
    }

    el.tagsList.innerHTML = html;

    el.tagsList.querySelectorAll('.tag-pill').forEach(pill => {
      pill.onclick = () => {
        activeTag = pill.dataset.tag;
        renderTagsBar();
        renderNotes();
      };
    });
  }

  // --- Render Notes Stream ---
  function renderNotes() {
    const q = searchQuery.toLowerCase().trim();

    const filtered = notes.filter(n => {
      // 1. Tag filter
      if (activeTag !== 'all' && !(n.tags || []).includes(activeTag)) {
        return false;
      }
      // 2. Search filter
      if (q) {
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const contentMatch = (n.content || '').toLowerCase().includes(q);
        const tagMatch = (n.tags || []).some(t => t.toLowerCase().includes(q));
        const fileMatch = [...(n.images || []), ...(n.files || [])].some(f => (f.name || '').toLowerCase().includes(q));
        return titleMatch || contentMatch || tagMatch || fileMatch;
      }
      return true;
    });

    if (el.notesFilterHint) {
      if (activeTag === 'all' && !q) {
        el.notesFilterHint.textContent = `共 ${notes.length} 篇笔记`;
      } else {
        el.notesFilterHint.textContent = `筛选结果: ${filtered.length} 篇笔记`;
      }
    }

    if (filtered.length === 0) {
      el.notesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>未找到匹配的笔记或文件</h3>
          <p>尝试切换顶部标签分类，或在搜索栏输入其他关键词搜索。</p>
        </div>
      `;
      return;
    }

    el.notesList.innerHTML = filtered.map(n => {
      const totalAttached = (n.images ? n.images.length : 0) + (n.files ? n.files.length : 0);

      // Render image gallery on the card
      let imagesHtml = '';
      if (n.images && n.images.length > 0) {
        const displayImgs = n.images.slice(0, 3);
        const remaining = n.images.length - 3;
        imagesHtml = `
          <div class="note-card-images">
            ${displayImgs.map((img, idx) => {
              const imgUrl = resolveAssetUrl(img);
              const rawUrl = img.url || (img.release ? `${GITHUB_REPO_URL}/releases/download/${encodeURIComponent(img.release)}/${encodeURIComponent(img.name)}` : `files/${img.name}`);
              return `
                <div class="note-thumb-wrapper preview-img-trigger" data-url="${escapeHTML(imgUrl)}" data-name="${escapeHTML(img.name)}" data-size="${img.size || ''}">
                  <img src="${escapeHTML(imgUrl)}" data-raw-url="${escapeHTML(rawUrl)}" data-attempt="0" onerror="handleImageError(this)" alt="${escapeHTML(img.name)}" loading="lazy">
                  ${idx === 2 && remaining > 0 ? `<div class="note-thumb-more">+${remaining}张图片</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      // Render attached document files on the card
      let docsHtml = '';
      if (n.files && n.files.length > 0) {
        docsHtml = `
          <div class="note-card-docs">
            ${n.files.map(doc => {
              const icon = getFileIcon(doc.name);
              const fileUrl = resolveAssetUrl(doc);
              const canPreview = isPreviewableFile(doc.name);
              return `
                <div class="bound-doc-item">
                  <div class="bound-doc-info">
                    <span class="bound-doc-icon">${icon}</span>
                    <div class="bound-doc-details">
                      <span class="bound-doc-name" title="${escapeHTML(doc.name)}">${escapeHTML(doc.name)}</span>
                      <span class="bound-doc-size">${formatBytes(doc.size)}</span>
                    </div>
                  </div>
                  <div class="bound-doc-actions">
                    ${canPreview ? `
                      <button class="btn btn-xs btn-outline preview-doc-btn" data-url="${escapeHTML(fileUrl)}" data-name="${escapeHTML(doc.name)}" data-size="${doc.size || ''}" title="在线完整预览">
                        <span>👁️</span> 预览
                      </button>
                    ` : ''}
                    <a class="btn btn-xs btn-primary download-doc-btn" href="${escapeHTML(fileUrl)}" download="${escapeHTML(doc.name)}" title="下载原文件">
                      <span>⬇️</span> 下载
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      return `
        <article class="note-card" data-id="${n.id}">
          <div class="note-card-header">
            <div class="note-card-meta">
              <div class="note-tags">
                ${(n.tags || []).map(t => `<span class="badge badge-tag" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</span>`).join('')}
              </div>
              <span class="note-date">${n.date || ''}</span>
            </div>
            <h3 class="note-title reader-trigger" data-id="${n.id}" title="点击阅读全文">${escapeHTML(n.title)}</h3>
          </div>

          <div class="note-card-body reader-trigger" data-id="${n.id}">
            <div class="note-content-preview">
              ${renderMarkdown(n.content)}
            </div>
          </div>

          ${imagesHtml}
          ${docsHtml}

          <div class="note-card-footer">
            <div class="note-stats">
              <span>📎 ${totalAttached} 个关联资源</span>
            </div>
            <div class="note-actions">
              ${totalAttached > 1 ? `
                <button class="btn btn-xs btn-outline download-all-btn" data-id="${n.id}">
                  <span>📦</span> 下载全部
                </button>
              ` : ''}
              <button class="btn btn-xs btn-primary reader-trigger" data-id="${n.id}">
                <span>📖</span> 查看全文
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card events
    // 1. Tag click on note card filters by that tag
    el.notesList.querySelectorAll('.badge-tag').forEach(tagEl => {
      tagEl.onclick = (e) => {
        e.stopPropagation();
        activeTag = tagEl.dataset.tag;
        renderTagsBar();
        renderNotes();
      };
    });

    // 2. Open Note Reader
    el.notesList.querySelectorAll('.reader-trigger').forEach(trigger => {
      trigger.onclick = () => openNoteReader(trigger.dataset.id || trigger.closest('.note-card').dataset.id);
    });

    // 3. Image click triggers preview
    el.notesList.querySelectorAll('.preview-img-trigger').forEach(thumb => {
      thumb.onclick = (e) => {
        e.stopPropagation();
        openFilePreview(thumb.dataset.url, thumb.dataset.name, thumb.dataset.size);
      };
    });

    // 4. Document preview button
    el.notesList.querySelectorAll('.preview-doc-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        openFilePreview(btn.dataset.url, btn.dataset.name, btn.dataset.size);
      };
    });

    // 5. Download All button
    el.notesList.querySelectorAll('.download-all-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        downloadAllNoteFiles(btn.dataset.id);
      };
    });
  }

  // --- Download All files in a note sequentially ---
  function downloadAllNoteFiles(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const all = [...(note.images || []), ...(note.files || [])];
    if (all.length === 0) return;

    showToast(`开始下载本笔记的 ${all.length} 个文件...`, 'info');
    all.forEach((f, idx) => {
      setTimeout(() => {
        const url = resolveAssetUrl(f);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 400);
    });
  }

  // --- Note Reader Modal ---
  function openNoteReader(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    el.readerTitle.textContent = note.title;
    el.readerDate.textContent = note.date || '';
    el.readerTags.innerHTML = (note.tags || []).map(t => `<span class="badge badge-tag">#${escapeHTML(t)}</span>`).join('');
    el.readerContent.innerHTML = renderMarkdown(note.content);

    // Images Gallery in reader
    if (note.images && note.images.length > 0) {
      el.readerImagesSection.style.display = 'block';
      el.readerImageCount.textContent = note.images.length;
      el.readerImagesGrid.innerHTML = note.images.map(img => {
        const url = resolveAssetUrl(img);
        const rawUrl = img.url || (img.release ? `${GITHUB_REPO_URL}/releases/download/${encodeURIComponent(img.release)}/${encodeURIComponent(img.name)}` : `files/${img.name}`);
        return `
          <div class="reader-img-card" data-url="${escapeHTML(url)}" data-name="${escapeHTML(img.name)}" data-size="${img.size || ''}" title="点击放大图片">
            <img src="${escapeHTML(url)}" data-raw-url="${escapeHTML(rawUrl)}" data-attempt="0" onerror="handleImageError(this)" alt="${escapeHTML(img.name)}" loading="lazy">
            <div style="font-size:0.75rem; padding:0.25rem 0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; background:var(--bg-surface);">
              ${escapeHTML(img.name)} (${formatBytes(img.size)})
            </div>
          </div>
        `;
      }).join('');

      el.readerImagesGrid.querySelectorAll('.reader-img-card').forEach(card => {
        card.onclick = () => openFilePreview(card.dataset.url, card.dataset.name, card.dataset.size);
      });
    } else {
      el.readerImagesSection.style.display = 'none';
    }

    // Attached Documents in reader
    if (note.files && note.files.length > 0) {
      el.readerAttachmentsSection.style.display = 'block';
      el.readerDocCount.textContent = note.files.length;
      el.readerDocsList.innerHTML = note.files.map(doc => {
        const icon = getFileIcon(doc.name);
        const url = resolveAssetUrl(doc);
        const canPreview = isPreviewableFile(doc.name);
        return `
          <div class="bound-doc-item">
            <div class="bound-doc-info">
              <span class="bound-doc-icon">${icon}</span>
              <div class="bound-doc-details">
                <span class="bound-doc-name">${escapeHTML(doc.name)}</span>
                <span class="bound-doc-size">${formatBytes(doc.size)}</span>
              </div>
            </div>
            <div class="bound-doc-actions">
              ${canPreview ? `
                <button class="btn btn-xs btn-outline reader-preview-btn" data-url="${escapeHTML(url)}" data-name="${escapeHTML(doc.name)}" data-size="${doc.size || ''}">
                  <span>👁️</span> 在线预览
                </button>
              ` : ''}
              <a class="btn btn-xs btn-primary" href="${escapeHTML(url)}" download="${escapeHTML(doc.name)}">
                <span>⬇️</span> 下载文件
              </a>
            </div>
          </div>
        `;
      }).join('');

      el.readerDocsList.querySelectorAll('.reader-preview-btn').forEach(btn => {
        btn.onclick = () => openFilePreview(btn.dataset.url, btn.dataset.name, btn.dataset.size);
      });
    } else {
      el.readerAttachmentsSection.style.display = 'none';
    }

    el.copyNoteContentBtn.onclick = () => {
      const copyText = `${note.title}\n\n${note.content}`;
      copyToClipboard(copyText, '笔记内容已复制到剪贴板！');
    };

    el.noteReaderModal.style.display = 'flex';
  }

  // ========================================================
  // IN-BROWSER HIGH FIDELITY PREVIEW ENGINE (PURE STATIC)
  // ========================================================
  let isPreviewFullscreen = false;

  function resetPreviewFullscreen() {
    isPreviewFullscreen = false;
    const modal = el.filePreviewModal?.querySelector('.modal-preview');
    if (modal) modal.classList.remove('is-fullscreen');
    if (el.previewFullscreenBtn) {
      el.previewFullscreenBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        <span>全屏</span>
      `;
      el.previewFullscreenBtn.title = '全屏沉浸阅读';
    }
  }

  function togglePreviewFullscreen() {
    isPreviewFullscreen = !isPreviewFullscreen;
    const modal = el.filePreviewModal?.querySelector('.modal-preview');
    if (modal) {
      modal.classList.toggle('is-fullscreen', isPreviewFullscreen);
    }
    if (el.previewFullscreenBtn) {
      el.previewFullscreenBtn.innerHTML = isPreviewFullscreen
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h6v6m10-10h-6V4m0 6 7-7M4 20l7-7"/></svg><span>还原</span>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg><span>全屏</span>`;
      el.previewFullscreenBtn.title = isPreviewFullscreen ? '还原窗口大小' : '全屏沉浸阅读';
    }
  }

  // ========================================================
  // IMAGE VIEWER WITH SMOOTH WHEEL ZOOM & TOUCH PAN
  // ========================================================
  function renderImagePreviewWithZoom(fileUrl, fileName) {
    el.previewContainer.innerHTML = `
      <div class="image-zoom-container" id="imageZoomContainer">
        <div class="image-zoom-viewport" id="imageZoomViewport" title="支持鼠标滚轮缩放、按住鼠标拖拽、双击重置">
          <img class="zoomable-image" id="zoomableImage" src="${fileUrl}" alt="${escapeHTML(fileName)}" draggable="false">
        </div>
        <div class="image-zoom-toolbar">
          <button class="zoom-btn" id="zoomOutBtn" title="缩小 (快捷键: -)">➖</button>
          <span class="zoom-level-badge" id="zoomLevelBadge">100%</span>
          <button class="zoom-btn" id="zoomInBtn" title="放大 (快捷键: +)">➕</button>
          <button class="zoom-btn zoom-btn-text" id="zoomResetBtn" title="重置到 100% (双击图片也可重置)">↺ 100%</button>
        </div>
      </div>
    `;

    el.previewHintText.textContent = '提示：支持鼠标滚轮缩放、鼠标拖拽平移、双击重置（手机触屏支持双指捏合缩放）';

    const viewport = document.getElementById('imageZoomViewport');
    const img = document.getElementById('zoomableImage');
    const levelBadge = document.getElementById('zoomLevelBadge');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');

    if (!viewport || !img) return;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startPanX = 0;
    let startPanY = 0;
    const activePointers = new Map();
    let initialPinchDist = 0;
    let initialScale = 1;

    function applyTransform(smooth = false) {
      if (smooth) {
        img.classList.add('smooth-transition');
        setTimeout(() => img.classList.remove('smooth-transition'), 250);
      } else {
        img.classList.remove('smooth-transition');
      }
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      if (levelBadge) {
        levelBadge.textContent = `${Math.round(scale * 100)}%`;
      }
      viewport.style.cursor = isDragging ? 'grabbing' : (scale > 1.05 ? 'grab' : 'default');
    }

    // 1. Mouse Wheel Zoom (centered at mouse cursor)
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 10);

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - (rect.left + rect.width / 2);
      const mouseY = e.clientY - (rect.top + rect.height / 2);

      translateX = mouseX - (mouseX - translateX) * (newScale / scale);
      translateY = mouseY - (mouseY - translateY) * (newScale / scale);
      scale = newScale;

      applyTransform(false);
    }, { passive: false });

    // 2. Pointer Events (Desktop Drag + Mobile Touch Pinch/Pan)
    viewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}

      if (activePointers.size === 1) {
        isDragging = true;
        startPanX = e.clientX - translateX;
        startPanY = e.clientY - translateY;
        applyTransform(false);
      } else if (activePointers.size === 2) {
        isDragging = false;
        const pts = Array.from(activePointers.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialScale = scale;
      }
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1 && isDragging) {
        translateX = e.clientX - startPanX;
        translateY = e.clientY - startPanY;
        applyTransform(false);
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (initialPinchDist > 0) {
          scale = Math.min(Math.max(initialScale * (currentDist / initialPinchDist), 0.2), 10);
          applyTransform(false);
        }
      }
    });

    const endPointer = (e) => {
      activePointers.delete(e.pointerId);
      try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      if (activePointers.size === 0) {
        isDragging = false;
        applyTransform(false);
      } else if (activePointers.size === 1) {
        const remaining = Array.from(activePointers.values())[0];
        isDragging = true;
        startPanX = remaining.x - translateX;
        startPanY = remaining.y - translateY;
      }
    };

    viewport.addEventListener('pointerup', endPointer);
    viewport.addEventListener('pointercancel', endPointer);

    // 3. Double click / double tap reset or zoom
    viewport.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (scale !== 1 || translateX !== 0 || translateY !== 0) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      } else {
        scale = 2;
      }
      applyTransform(true);
    });

    // 4. Zoom Toolbar Buttons
    if (zoomInBtn) {
      zoomInBtn.onclick = (e) => {
        e.stopPropagation();
        scale = Math.min(scale * 1.25, 10);
        applyTransform(true);
      };
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = (e) => {
        e.stopPropagation();
        scale = Math.max(scale / 1.25, 0.2);
        applyTransform(true);
      };
    }
    if (zoomResetBtn) {
      zoomResetBtn.onclick = (e) => {
        e.stopPropagation();
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform(true);
      };
    }
  }

  async function openFilePreview(fileUrl, fileName, fileSize = '') {
    // 严格限制: 仅图片、文档 (docx/pptx/xlsx/pdf) 和 md 文件允许弹窗预览
    if (!isPreviewableFile(fileName)) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`该格式不支持在线预览，已直接开始下载: ${fileName}`);
      return;
    }

    resetPreviewFullscreen();
    el.previewFileIcon.textContent = getFileIcon(fileName);
    el.previewFileName.textContent = fileName;
    el.previewFileSize.textContent = fileSize ? formatBytes(fileSize) : '';
    el.previewDownloadBtn.href = fileUrl;
    el.previewDownloadBtn.setAttribute('download', fileName);

    const ext = fileName.split('.').pop().toLowerCase();
    const isOffice = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv'].includes(ext);

    if (el.previewHeaderActionBtn) {
      el.previewHeaderActionBtn.href = fileUrl;
      if (isOffice) {
        // Office documents cannot be rendered natively in a blank browser tab, so download directly
        el.previewHeaderActionBtn.setAttribute('download', fileName);
        el.previewHeaderActionBtn.removeAttribute('target');
        el.previewHeaderActionBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>下载</span>
        `;
        el.previewHeaderActionBtn.title = '下载原文件';
      } else {
        // Images and PDFs can be viewed natively in new tab
        el.previewHeaderActionBtn.removeAttribute('download');
        el.previewHeaderActionBtn.setAttribute('target', '_blank');
        el.previewHeaderActionBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>新窗口</span>
        `;
        el.previewHeaderActionBtn.title = '在新标签页中查看';
      }
    }

    el.previewContainer.innerHTML = '<div class="loading-placeholder" style="color:#fff;">正在解析并加载预览，请稍候...</div>';
    el.previewHintText.textContent = '';
    el.filePreviewModal.style.display = 'flex';

    // 1. WORD DOCUMENTS (.docx / .doc)
    if (ext === 'docx' || ext === 'doc') {
      try {
        const fetchUrl = fileUrl.includes('?') ? `${fileUrl}&_t=${Date.now()}` : `${fileUrl}?_t=${Date.now()}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`文件获取失败 (HTTP ${res.status})`);
        const arrayBuffer = await res.arrayBuffer();

        el.previewContainer.innerHTML = '<div class="docx-render-container"><div id="docxTarget"></div></div>';
        const docxTarget = document.getElementById('docxTarget');

        if (window.docx && window.docx.renderAsync) {
          await window.docx.renderAsync(arrayBuffer, docxTarget, null, {
            className: 'docx',
            inWrapper: false,
            ignoreWidth: false,
            breakPages: true
          });
          el.previewHintText.textContent = 'Word 文档预览成功（完整还原排版、表格与段落样式）';
        } else if (window.mammoth) {
          const result = await window.mammoth.convertToHtml({ arrayBuffer });
          docxTarget.innerHTML = `<div style="background:#fff; color:#000; padding:2rem; max-width:850px; margin:0 auto; box-shadow:0 4px 15px rgba(0,0,0,0.3); border-radius:4px; line-height:1.7;">${result.value}</div>`;
          el.previewHintText.textContent = 'Word 文档快速预览模式';
        } else {
          el.previewContainer.innerHTML = '<div class="loading-placeholder" style="color:#fff;">未检测到 Word 渲染引擎，请直接点击下方下载查看</div>';
        }
      } catch (err) {
        console.error('Word preview error:', err);
        el.previewContainer.innerHTML = `<div class="loading-placeholder" style="color:#fff;">Word 文档解析失败: ${err.message}<br><a class="btn btn-primary" href="${fileUrl}" download="${fileName}" style="margin-top:1rem;">直接下载 Word 文件查看</a></div>`;
      }
      return;
    }

    // 2. EXCEL SPREADSHEETS (.xlsx / .xls / .csv)
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      try {
        const fetchUrl = fileUrl.includes('?') ? `${fileUrl}&_t=${Date.now()}` : `${fileUrl}?_t=${Date.now()}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`文件获取失败 (HTTP ${res.status})`);
        const arrayBuffer = await res.arrayBuffer();

        if (window.XLSX) {
          const workbook = window.XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          const sheetNames = workbook.SheetNames;
          let currentSheet = sheetNames[0];

          function renderSheet(name) {
            const worksheet = workbook.Sheets[name];
            return window.XLSX.utils.sheet_to_html(worksheet, { id: 'excelTable', editable: false });
          }

          el.previewContainer.innerHTML = `
            <div class="excel-container">
              <div class="excel-sheet-tabs" id="sheetTabs">
                ${sheetNames.map((s, idx) => `<button class="excel-sheet-tab ${idx === 0 ? 'active' : ''}" data-sheet="${s}">${escapeHTML(s)}</button>`).join('')}
              </div>
              <div class="excel-table-scroll" id="sheetContent">
                ${renderSheet(currentSheet)}
              </div>
            </div>
          `;

          document.getElementById('sheetTabs').querySelectorAll('.excel-sheet-tab').forEach(btn => {
            btn.onclick = () => {
              document.getElementById('sheetTabs').querySelectorAll('.excel-sheet-tab').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              document.getElementById('sheetContent').innerHTML = renderSheet(btn.dataset.sheet);
            };
          });

          el.previewHintText.textContent = `Excel 工作簿包含 ${sheetNames.length} 个工作表（支持切换）`;
        } else {
          el.previewContainer.innerHTML = '<div class="loading-placeholder" style="color:#fff;">未检测到 Excel 渲染引擎，请直接点击下方下载查看</div>';
        }
      } catch (err) {
        el.previewContainer.innerHTML = `<div class="loading-placeholder" style="color:#fff;">Excel 解析失败: ${err.message}</div>`;
      }
      return;
    }

    // 3. IMAGES (JPG, PNG, GIF, WEBP, SVG)
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      renderImagePreviewWithZoom(fileUrl, fileName);
      return;
    }

    // 4. PDF DOCUMENTS
    if (ext === 'pdf') {
      el.previewContainer.innerHTML = `<iframe src="${fileUrl}" style="width:100%; height:100%; border:none; background:#fff;"></iframe>`;
      el.previewHintText.textContent = 'PDF 支持在内置窗口中滚动翻页、放大与打印';
      return;
    }

    // 5. POWERPOINT 演示文档 (.pptx / .ppt)
    if (ext === 'pptx' || ext === 'ppt') {
      el.previewContainer.innerHTML = `
        <div class="pptx-preview-card" style="text-align:center; padding:3rem 1.5rem; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-color); max-width:540px; margin:2rem auto; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
          <div style="font-size:3.5rem; margin-bottom:1rem;">📙</div>
          <h3 style="margin-bottom:0.5rem; font-size:1.25rem; color:var(--text-main); font-weight:600;">${escapeHTML(fileName)}</h3>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.75rem; line-height:1.6;">
            PowerPoint 幻灯片演示文稿 (${fileSize ? formatBytes(fileSize) : 'PPT课件'})<br>
            可通过本地局域网高速下载原件，支持在 PowerPoint 或 WPS 中完整放映与编辑。
          </p>
          <a class="btn btn-primary" href="${fileUrl}" download="${fileName}" style="padding:0.75rem 2rem; font-size:1rem; display:inline-flex; align-items:center; gap:0.5rem;">
            <span>⬇️</span> 立即下载 PPT 演示文稿
          </a>
        </div>
      `;
      el.previewHintText.textContent = 'PowerPoint 演示文稿（支持全速下载到本地放映）';
      return;
    }

    // 6. MARKDOWN 文档 (.md / .markdown)
    if (ext === 'md' || ext === 'markdown') {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        el.previewContainer.innerHTML = `
          <div class="md-preview-container" style="padding:2rem; width:100%; height:100%; overflow:auto; background:var(--bg-card); color:var(--text-main); line-height:1.8; border-radius:8px;">
            <div class="markdown-body" style="max-width:850px; margin:0 auto;">
              ${renderMarkdown(text)}
            </div>
          </div>
        `;
        el.previewHintText.textContent = 'Markdown 笔记文档渲染模式';
      } catch (err) {
        el.previewContainer.innerHTML = `<div class="loading-placeholder" style="color:#fff;">Markdown 读取失败: ${err.message}</div>`;
      }
      return;
    }

    // 7. 任何其他非图片、非文档文件：严禁预览，直接提示下载
    el.previewContainer.innerHTML = `
      <div style="text-align:center; padding:3rem 1.5rem; color:#fff;">
        <div style="font-size:3rem; margin-bottom:1rem;">📁</div>
        <h3>该格式不支持在线预览</h3>
        <p style="margin-top:0.5rem; opacity:0.85;">请直接下载后使用本地对应软件打开查看</p>
        <a class="btn btn-primary" href="${fileUrl}" download="${fileName}" style="margin-top:1.5rem;">⬇️ 立即下载原文件</a>
      </div>
    `;
    el.previewHintText.textContent = '专有格式文件（请下载后在专业软件中查看）';
  }

  // --- Copy Share Card ---
  function handleCopyShareCard() {
    const currentOrigin = window.location.href;
    const card = `🌟【StarWhiteNote 个人笔记与资料分享站】🌟
----------------------------------
🔗 访问网址: ${currentOrigin}
💡 随时在线阅读我的全部笔记、Word 文档完整排版预览、高清图片与数据表格下载！无需任何密码直接畅读！`;

    copyToClipboard(card, '完整分享卡片已复制！可以直接粘贴发送给好友！');
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg, 'success');
    } catch (_) {
      showToast('复制失败，请手动选择复制', 'error');
    }
    document.body.removeChild(textarea);
  }

  // --- Tab Navigation ---
  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    Object.keys(el.tabPanes).forEach(paneKey => {
      if (el.tabPanes[paneKey]) {
        el.tabPanes[paneKey].style.display = (paneKey === tabName) ? 'block' : 'none';
      }
    });
  }

  // --- Theme Toggle ---
  function initTheme() {
    const savedTheme = localStorage.getItem('starwhite_theme') || 'theme-light';
    document.body.className = savedTheme;
    if (el.themeToggleBtn) {
      el.themeToggleBtn.textContent = savedTheme === 'theme-dark' ? '☀️' : '🌙';
      el.themeToggleBtn.onclick = () => {
        const isDark = document.body.classList.contains('theme-dark');
        const newTheme = isDark ? 'theme-light' : 'theme-dark';
        document.body.className = newTheme;
        localStorage.setItem('starwhite_theme', newTheme);
        el.themeToggleBtn.textContent = newTheme === 'theme-dark' ? '☀️' : '🌙';
      };
    }
  }

  // --- Initialize Events ---
  function initEvents() {
    // Nav tabs
    if (el.navTabs) {
      el.navTabs.querySelectorAll('.nav-tab').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
      });
    }

    // Global Search
    if (el.globalSearch) {
      el.globalSearch.oninput = (e) => {
        searchQuery = e.target.value;
        renderNotes();
      };
    }

    // Note Reader Modal actions
    if (el.closeReaderBtn) el.closeReaderBtn.onclick = () => { if (el.noteReaderModal) el.noteReaderModal.style.display = 'none'; };
    if (el.closeReaderFooterBtn) el.closeReaderFooterBtn.onclick = () => { if (el.noteReaderModal) el.noteReaderModal.style.display = 'none'; };

    // File Preview Modal actions
    if (el.previewFullscreenBtn) {
      el.previewFullscreenBtn.onclick = togglePreviewFullscreen;
    }
    if (el.closePreviewBtn) {
      el.closePreviewBtn.onclick = () => {
        resetPreviewFullscreen();
        if (el.filePreviewModal) el.filePreviewModal.style.display = 'none';
      };
    }

    // Sync Releases Button
    const syncBtn = document.getElementById('syncReleasesBtn');
    if (syncBtn) {
      syncBtn.onclick = () => {
        syncBtn.style.transform = 'rotate(180deg)';
        syncBtn.style.transition = 'transform 0.5s ease';
        setTimeout(() => { syncBtn.style.transform = 'none'; }, 500);
        loadNotesData(true);
      };
    }

    // Acceleration Line Toggle (Cycles through Local, Mirror, jsDelivr, Direct)
    if (el.cdnTogglePill) {
      el.cdnTogglePill.onclick = cycleAccelMode;
    }

    // Share Website Modal (Custom Domain & GitHub Pages)
    const shareSiteBtn = document.getElementById('shareSiteBtn');
    const shareSiteModal = document.getElementById('shareSiteModal');
    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    const copySiteUrlBtn = document.getElementById('copySiteUrlBtn');
    const shareModalUrlCode = document.getElementById('shareModalUrlCode');
    const shareModalQrImg = document.getElementById('shareModalQrImg');

    function getActiveSiteUrl() {
      if (location.hostname === 'starwhitenote.xyz' || location.hostname === 'www.starwhitenote.xyz') {
        return 'https://' + location.hostname + '/';
      }
      if (location.hostname.includes('github.io')) {
        return location.origin + location.pathname;
      }
      return 'https://starwhitenote.xyz/';
    }

    if (shareSiteBtn && shareSiteModal) {
      shareSiteBtn.onclick = () => {
        const currentUrl = getActiveSiteUrl();
        if (shareModalUrlCode) shareModalUrlCode.textContent = currentUrl;
        if (shareModalQrImg) shareModalQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`;
        shareSiteModal.style.display = 'flex';
      };
    }

    if (closeShareModalBtn && shareSiteModal) {
      closeShareModalBtn.onclick = () => { shareSiteModal.style.display = 'none'; };
    }

    if (copySiteUrlBtn) {
      copySiteUrlBtn.onclick = () => {
        const urlToCopy = getActiveSiteUrl();
        navigator.clipboard.writeText(urlToCopy).then(() => {
          showToast('✅ 网址已复制到剪贴板！可直接发送给好友或微信浏览。', 'success');
        }).catch(() => {
          prompt('请复制本站网址：', urlToCopy);
        });
      };
    }

    // Close modals on clicking overlay backdrop
    window.onclick = (e) => {
      if (el.noteReaderModal && e.target === el.noteReaderModal) el.noteReaderModal.style.display = 'none';
      if (shareSiteModal && e.target === shareSiteModal) shareSiteModal.style.display = 'none';
      if (el.filePreviewModal && e.target === el.filePreviewModal) {
        resetPreviewFullscreen();
        el.filePreviewModal.style.display = 'none';
      }
    };
  }

  // --- Boot App ---
  initTheme();
  updateCdnUI();
  initEvents();
  loadNotesData();

})();
