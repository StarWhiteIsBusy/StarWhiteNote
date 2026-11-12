// StarWhiteNote - Pure Static Edition for GitHub Pages & Custom Domain
(function () {
  'use strict';

  // --- State ---
  let notes = [];
  let allTags = [];
  let activeTab = 'notes';
  let activeTag = 'all';
  let searchQuery = '';
  let cdnEnabled = localStorage.getItem('starwhite_cdn_enabled') !== 'false'; // 默认开启 CDN 加速

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
    previewNewTabBtn: document.getElementById('previewNewTabBtn'),

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

  // --- Helpers ---
  function updateCdnUI() {
    if (!el.cdnBadgeText) return;
    const dot = document.querySelector('.cdn-status-dot');
    if (cdnEnabled) {
      el.cdnBadgeText.textContent = '⚡ GitHub Pages 全球加速 (默认开启)';
      if (dot) dot.style.backgroundColor = '#10b981';
    } else {
      el.cdnBadgeText.textContent = '🌐 GitHub 官方源 (直连模式)';
      if (dot) dot.style.backgroundColor = '#94a3b8';
    }
  }

  function getAcceleratedUrl(url) {
    if (!url) return '';
    if (!cdnEnabled) return url;
    // On GitHub Pages or production, accelerate files via jsDelivr global fast CDN
    if (window.location.hostname.endsWith('github.io') || (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'))) {
      if (url.startsWith('files/')) {
        const cleanPath = url.replace(/^files\//, '');
        return `https://cdn.jsdelivr.net/gh/StarWhiteIsBusy/StarWhiteNote@main/files/${cleanPath}`;
      }
    }
    return url;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    if (typeof bytes === 'string') return bytes;
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // --- Data Loading (Fetch static notes.json) ---
  async function loadNotesData() {
    el.notesList.innerHTML = '<div class="loading-placeholder">正在加载笔记与文件列表...</div>';
    try {
      // Load notes.json with timestamp to avoid browser caching
      const res = await fetch(`notes.json?_t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`无法读取 notes.json (HTTP ${res.status})`);
      }
      notes = await res.json();

      // Normalize notes schema (support both .files and .attachments)
      notes.forEach((n, idx) => {
        n.id = n.id || `note-${idx + 1}`;
        n.tags = Array.isArray(n.tags) ? n.tags : [];
        n.images = Array.isArray(n.images) ? n.images : [];
        n.files = Array.isArray(n.files) ? n.files : (Array.isArray(n.attachments) ? n.attachments : []);
      });

      // Extract unique tags across all notes automatically
      const tagSet = new Set();
      let totalFiles = 0;
      for (const n of notes) {
        (n.tags || []).forEach(t => {
          if (t && t.trim()) tagSet.add(t.trim());
        });
        totalFiles += (n.images ? n.images.length : 0) + (n.files ? n.files.length : 0);
      }
      allTags = Array.from(tagSet);

      // Update Stats
      el.statNotesCount.textContent = notes.length;
      el.statFilesCount.textContent = totalFiles;
      el.statTagsCount.textContent = allTags.length;

      renderTagsBar();
      renderNotes();
    } catch (err) {
      console.error('Error loading notes.json:', err);
      el.notesList.innerHTML = `
        <div class="loading-placeholder">
          <div style="font-size:2rem; margin-bottom:0.5rem;">⚠️</div>
          <strong style="color:var(--text-main);">未找到笔记数据文件</strong>
          <p style="margin-top:0.3rem; color:var(--text-muted); font-size:0.85rem;">${err.message}</p>
          <p style="margin-top:0.2rem; color:var(--text-muted); font-size:0.85rem;">请确保项目根目录下存在 <code>notes.json</code> 文件</p>
          <button class="btn btn-primary btn-sm" id="retryLoadBtn" style="margin-top:0.8rem;">🔄 点击重试</button>
        </div>
      `;
      const retryBtn = document.getElementById('retryLoadBtn');
      if (retryBtn) retryBtn.onclick = loadNotesData;
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
              const rawUrl = img.url || `files/${img.name}`;
              const imgUrl = getAcceleratedUrl(rawUrl);
              return `
                <div class="note-thumb-wrapper preview-img-trigger" data-url="${escapeHTML(imgUrl)}" data-name="${escapeHTML(img.name)}" data-size="${img.size || ''}">
                  <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(img.name)}" loading="lazy">
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
              const rawUrl = doc.url || `files/${doc.name}`;
              const fileUrl = getAcceleratedUrl(rawUrl);
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
                    <button class="btn btn-xs btn-outline preview-doc-btn" data-url="${escapeHTML(fileUrl)}" data-name="${escapeHTML(doc.name)}" data-size="${doc.size || ''}" title="在线完整预览">
                      <span>👁️</span> 预览
                    </button>
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
        const url = f.url || `files/${f.name}`;
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
        const url = img.url || `files/${img.name}`;
        return `
          <div class="reader-img-card" data-url="${escapeHTML(url)}" data-name="${escapeHTML(img.name)}" data-size="${img.size || ''}" title="点击放大图片">
            <img src="${escapeHTML(url)}" alt="${escapeHTML(img.name)}" loading="lazy">
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
        const url = doc.url || `files/${doc.name}`;
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
              <button class="btn btn-xs btn-outline reader-preview-btn" data-url="${escapeHTML(url)}" data-name="${escapeHTML(doc.name)}" data-size="${doc.size || ''}">
                <span>👁️</span> 在线预览
              </button>
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
  async function openFilePreview(fileUrl, fileName, fileSize = '') {
    el.previewFileIcon.textContent = getFileIcon(fileName);
    el.previewFileName.textContent = fileName;
    el.previewFileSize.textContent = fileSize ? formatBytes(fileSize) : '';
    el.previewDownloadBtn.href = fileUrl;
    el.previewDownloadBtn.setAttribute('download', fileName);
    el.previewNewTabBtn.onclick = () => window.open(fileUrl, '_blank');

    el.previewContainer.innerHTML = '<div class="loading-placeholder" style="color:#fff;">正在解析并加载预览，请稍候...</div>';
    el.previewHintText.textContent = '';
    el.filePreviewModal.style.display = 'flex';

    const ext = fileName.split('.').pop().toLowerCase();

    // 1. WORD DOCUMENTS (.docx / .doc)
    if (ext === 'docx' || ext === 'doc') {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`文件获取失败 (HTTP ${res.status})`);
        const arrayBuffer = await res.arrayBuffer();

        el.previewContainer.innerHTML = '<div class="docx-render-container"><div id="docxTarget"></div></div>';
        const docxTarget = document.getElementById('docxTarget');

        if (window.docx && window.docx.renderAsync) {
          await window.docx.renderAsync(arrayBuffer, docxTarget, null, {
            className: 'docx',
            inWrapper: true,
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
        const res = await fetch(fileUrl);
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
      el.previewContainer.innerHTML = `
        <div class="image-zoom-container" style="display:flex; justify-content:center; align-items:center; width:100%; height:100%; min-height:360px;">
          <img src="${fileUrl}" alt="${escapeHTML(fileName)}" style="max-width:100%; max-height:75vh; object-fit:contain; border-radius:6px; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
        </div>
      `;
      el.previewHintText.textContent = '提示：图片支持鼠标右键“复制图片”或保存原图，点击右上角“新窗口”可全屏查看';
      return;
    }

    // 4. PDF DOCUMENTS
    if (ext === 'pdf') {
      el.previewContainer.innerHTML = `<iframe src="${fileUrl}" style="width:100%; height:100%; border:none; background:#fff;"></iframe>`;
      el.previewHintText.textContent = 'PDF 支持在内置窗口中滚动翻页、放大与打印';
      return;
    }

    // 5. VIDEOS & AUDIOS
    if (['mp4', 'webm'].includes(ext)) {
      el.previewContainer.innerHTML = `<video src="${fileUrl}" controls autoplay style="max-width:100%; max-height:100%; border-radius:8px;"></video>`;
      return;
    }
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
      el.previewContainer.innerHTML = `<audio src="${fileUrl}" controls autoplay style="width:100%; max-width:480px;"></audio>`;
      return;
    }

    // 6. CODE & TEXT
    try {
      const res = await fetch(fileUrl);
      const text = await res.text();
      el.previewContainer.innerHTML = `<pre style="padding:1.5rem; margin:0; width:100%; height:100%; overflow:auto; background:var(--bg-surface); color:var(--text-main); font-family:Consolas,monospace; font-size:0.9rem; line-height:1.6; border-radius:6px;"><code>${escapeHTML(text)}</code></pre>`;
    } catch (err) {
      el.previewContainer.innerHTML = `<div class="loading-placeholder" style="color:#fff;">纯文本读取失败: ${err.message}</div>`;
    }
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
    if (el.closePreviewBtn) el.closePreviewBtn.onclick = () => { if (el.filePreviewModal) el.filePreviewModal.style.display = 'none'; };

    // CDN Toggle
    if (el.cdnTogglePill) {
      el.cdnTogglePill.onclick = () => {
        cdnEnabled = !cdnEnabled;
        localStorage.setItem('starwhite_cdn_enabled', cdnEnabled ? 'true' : 'false');
        updateCdnUI();
        renderNotes();
        showToast(cdnEnabled ? '⚡ 已开启全球 CDN 极速加速（国内秒开，默认已开启）' : '🌐 已切换为 GitHub 官方源直连模式', 'info');
      };
    }

    // Close modals on clicking overlay backdrop
    window.onclick = (e) => {
      if (el.noteReaderModal && e.target === el.noteReaderModal) el.noteReaderModal.style.display = 'none';
      if (el.filePreviewModal && e.target === el.filePreviewModal) el.filePreviewModal.style.display = 'none';
    };
  }

  // --- Boot App ---
  initTheme();
  updateCdnUI();
  initEvents();
  loadNotesData();

})();
