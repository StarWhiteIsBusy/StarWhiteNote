const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const CACHE_ASSETS_DIR = path.join(DATA_DIR, 'cache_assets');

// Ensure directories exist
for (const dir of [PUBLIC_DIR, DATA_DIR, UPLOADS_DIR, CACHE_ASSETS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const FILES_FILE = path.join(DATA_DIR, 'files.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

// Helper: Hash password
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return { hash, salt };
}

// Ensure default tags exist
function getTagsList() {
  const customTags = readJSON(TAGS_FILE, []);
  const notes = readJSON(NOTES_FILE, []);
  const set = new Set(customTags);
  for (const n of notes) {
    if (Array.isArray(n.tags)) {
      n.tags.forEach(t => { if (t && t.trim()) set.add(t.trim()); });
    }
  }
  return Array.from(set);
}

function verifyPassword(password, storedHash, salt) {
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return hash === storedHash;
}

// Read/write JSON files safely
function readJSON(file, defaultVal = []) {
  try {
    if (!fs.existsSync(file)) {
      writeJSON(file, defaultVal);
      return defaultVal;
    }
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || 'null') || defaultVal;
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize default data if not present
function initData() {
  const users = readJSON(USERS_FILE, null);
  if (!users) {
    const adminPass = hashPassword('admin123');
    const guestPass = hashPassword('guest123');
    const initialUsers = [
      {
        id: 'u_admin',
        username: 'admin',
        role: 'admin',
        displayName: '站长/我',
        hash: adminPass.hash,
        salt: adminPass.salt,
        remark: '超级管理员，拥有完整上传与管理权限',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u_guest',
        username: 'guest',
        role: 'visitor',
        displayName: '默认访客',
        hash: guestPass.hash,
        salt: guestPass.salt,
        remark: '提供给其他人的共享访客账号，可浏览和下载',
        createdAt: new Date().toISOString()
      }
    ];
    writeJSON(USERS_FILE, initialUsers);
    console.log('✓ 初始化默认用户账号完成 (admin / guest)');
  }

  const notes = readJSON(NOTES_FILE, null);
  if (!notes) {
    const welcomeNotes = [
      {
        id: crypto.randomUUID(),
        title: '欢迎使用个人笔记与文件共享站',
        category: '指南',
        tags: ['使用说明', '共享'],
        content: `# 欢迎使用个人笔记与文件共享站！

这是一个轻量、高效且美观的私有分享平台。你可以上传自己的学习笔记、资料、文档与安装包，并为其他人分发只读下载账号。

### 👑 管理员权限（你的账号）
- 登录后可以自由**上传文件**（支持拖拽上传、进度显示）。
- 支持在线**创建和编辑 Markdown 笔记**，随时更新内容。
- 在「访客账号管理」中随时**添加、删除专属访客账号**，或者修改下载密码。
- 查看全局统计（总下载次数、存储占用等）。

### 👥 访客权限（其他人账号）
- 其他人通过你提供的账号密码登录后：
  - 只能**浏览与下载**你的笔记与文件，无法删除或篡改你的数据。
  - 支持常用格式（图片、PDF、文本代码）在线快速预览。
  - 支持一键导出下载 Markdown 笔记。

### 🌐 域名与云服务器部署
将本程序目录直接上传到云服务器，使用 Nginx 绑定域名并配置 SSL 证书反向代理即可全网安全访问！`,
        author: '站长/我',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: '常用开发与学习工具推荐清单',
        category: '学习资料',
        tags: ['工具', '学习', '推荐'],
        content: `### 推荐效率工具集合

1. **代码与文本编辑**：VS Code, Antigravity, Obsidian
2. **文档与格式转换**：Pandoc, Typora
3. **日常解压与传输**：7-Zip, LocalSend
4. **终端与命令行**：PowerShell 7, Windows Terminal

> 提示：可以直接在上方搜索栏输入关键词快速过滤笔记或文件！`,
        author: '站长/我',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    writeJSON(NOTES_FILE, welcomeNotes);
    console.log('✓ 初始化示例笔记完成');
  }

  readJSON(FILES_FILE, []);
  readJSON(SESSIONS_FILE, {});
}

initData();

// Session helpers
function getSession(req, parsedUrl = null) {
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    token = cookies['session_token'];
  }

  // Also support query param ?token=... (for <img>, <iframe>, <video>, downloads)
  if (!token && parsedUrl && parsedUrl.searchParams) {
    token = parsedUrl.searchParams.get('token');
  } else if (!token && req.url && req.url.includes('token=')) {
    try {
      const u = new URL(req.url, 'http://localhost');
      token = u.searchParams.get('token');
    } catch (_) {}
  }

  if (!token) return null;
  const sessions = readJSON(SESSIONS_FILE, {});
  const session = sessions[token];
  if (!session) return null;

  // Check expiration (30 days)
  if (Date.now() > session.expiresAt) {
    delete sessions[token];
    writeJSON(SESSIONS_FILE, sessions);
    return null;
  }
  return { token, ...session };
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readJSON(SESSIONS_FILE, {});
  sessions[token] = {
    userId: user.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  writeJSON(SESSIONS_FILE, sessions);
  return token;
}

function deleteSession(token) {
  const sessions = readJSON(SESSIONS_FILE, {});
  if (sessions[token]) {
    delete sessions[token];
    writeJSON(SESSIONS_FILE, sessions);
  }
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.zip': 'application/zip',
  '.7z': 'application/x-7z-compressed',
  '.rar': 'application/vnd.rar',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

function getMimeType(filePath, defaultType = 'application/octet-stream') {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || defaultType;
}

// Get category by filename
function guessCategory(filename) {
  const ext = path.extname(filename).toLowerCase();
  const docs = ['.doc', '.docx', '.pdf', '.txt', '.md', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.epub'];
  const archives = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.iso'];
  const images = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const media = ['.mp4', '.mkv', '.avi', '.mov', '.mp3', '.flac', '.wav', '.ogg'];
  const code = ['.js', '.ts', '.py', '.html', '.css', '.json', '.sh', '.bat', '.c', '.cpp', '.java', '.go', '.rs'];

  if (docs.includes(ext)) return '文档';
  if (archives.includes(ext)) return '压缩包';
  if (images.includes(ext)) return '图片';
  if (media.includes(ext)) return '音视频';
  if (code.includes(ext)) return '代码';
  return '其他文件';
}

// Helper: send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

// Helper: parse JSON request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit for JSON
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Get network interfaces for local IP & identify LAN Wi-Fi IP
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const results = [];
  let primaryLAN = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const lowerName = name.toLowerCase();
        const isVirtual = lowerName.includes('clash') ||
                          lowerName.includes('tap') ||
                          lowerName.includes('vEthernet') ||
                          lowerName.includes('virtual') ||
                          iface.address.startsWith('198.18.') ||
                          iface.address.startsWith('169.254.');
        results.push({ name, address: iface.address, isVirtual });
        if (!primaryLAN && !isVirtual && (iface.address.startsWith('192.168.') || iface.address.startsWith('10.') || iface.address.startsWith('172.'))) {
          primaryLAN = iface.address;
        }
      }
    }
  }
  return {
    list: results,
    primaryLAN: primaryLAN || (results.length > 0 ? results[0].address : '127.0.0.1')
  };
}

// GitHub Releases in-memory cache & proxy for domestic high-speed loading
let cachedReleases = null;
let lastReleasesFetchTime = 0;
const RELEASES_CACHE_TTL = 60 * 1000; // 60 seconds cache
const RELEASES_DISK_FILE = path.join(DATA_DIR, 'releases_cache.json');

// Helper: HTTP request following redirects (essential for GitHub Releases downloads)
function fetchWithRedirect(url, headers = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const http = require('http');
    const client = url.startsWith('https:') ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      },
      timeout: 12000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return resolve(fetchWithRedirect(redirectUrl, headers, maxRedirects - 1));
      }
      resolve(res);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

async function handleReleasesProxy(req, res, parsedUrl) {
  const isForce = parsedUrl && parsedUrl.searchParams.get('force') === '1';
  const now = Date.now();

  // If not forced and memory cache is fresh
  if (!isForce && cachedReleases && (now - lastReleasesFetchTime < RELEASES_CACHE_TTL)) {
    return sendJSON(res, 200, cachedReleases);
  }

  // If memory cache empty, check disk cache
  if (!isForce && !cachedReleases && fs.existsSync(RELEASES_DISK_FILE)) {
    try {
      const diskData = JSON.parse(fs.readFileSync(RELEASES_DISK_FILE, 'utf8'));
      if (Array.isArray(diskData) && diskData.length > 0) {
        cachedReleases = diskData;
        lastReleasesFetchTime = now;
        return sendJSON(res, 200, cachedReleases);
      }
    } catch (_) {}
  }

  // Fetch live from GitHub Releases API
  try {
    const remoteRes = await fetchWithRedirect('https://api.github.com/repos/StarWhiteIsBusy/StarWhiteNote/releases', {
      'Accept': 'application/vnd.github.v3+json'
    });
    let rawData = '';
    remoteRes.on('data', chunk => { rawData += chunk; });
    remoteRes.on('end', () => {
      try {
        if (remoteRes.statusCode === 200) {
          const releases = JSON.parse(rawData);
          cachedReleases = releases;
          lastReleasesFetchTime = Date.now();
          fs.writeFileSync(RELEASES_DISK_FILE, JSON.stringify(releases, null, 2), 'utf8');
          return sendJSON(res, 200, releases);
        } else {
          if (cachedReleases) return sendJSON(res, 200, cachedReleases);
          return sendJSON(res, remoteRes.statusCode, { error: 'GitHub API status: ' + remoteRes.statusCode });
        }
      } catch (err) {
        if (cachedReleases) return sendJSON(res, 200, cachedReleases);
        return sendJSON(res, 500, { error: '解析 Releases 失败' });
      }
    });
  } catch (err) {
    console.warn('GitHub Releases 拉取失败，读取本地备份:', err.message);
    if (cachedReleases) return sendJSON(res, 200, cachedReleases);
    if (fs.existsSync(RELEASES_DISK_FILE)) {
      try {
        const diskData = JSON.parse(fs.readFileSync(RELEASES_DISK_FILE, 'utf8'));
        return sendJSON(res, 200, diskData);
      } catch (_) {}
    }
    return sendJSON(res, 200, []);
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Filename, X-Category, X-Description');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // 1. Check current login status / Me
  if (pathname === '/api/me' && req.method === 'GET') {
    const session = getSession(req, parsedUrl);
    if (!session) {
      return sendJSON(res, 401, { error: 'Not authenticated' });
    }
    return sendJSON(res, 200, {
      user: {
        id: session.userId,
        username: session.username,
        role: session.role,
        displayName: session.displayName
      }
    });
  }

  // 2. Login
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) {
        return sendJSON(res, 400, { error: '请输入账号和密码' });
      }

      const users = readJSON(USERS_FILE, []);
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
      if (!user || !verifyPassword(password, user.hash, user.salt)) {
        return sendJSON(res, 401, { error: '账号或密码不正确' });
      }

      const token = createSession(user);
      // Set HttpOnly cookie for seamless image/video/download requests without Authorization headers
      res.setHeader('Set-Cookie', `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
      return sendJSON(res, 200, {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          remark: user.remark
        }
      });
    } catch (e) {
      return sendJSON(res, 500, { error: '登录处理失败' });
    }
  }

  // 3. Logout
  if (pathname === '/api/logout' && req.method === 'POST') {
    const session = getSession(req, parsedUrl);
    if (session) {
      deleteSession(session.token);
    }
    res.setHeader('Set-Cookie', 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    return sendJSON(res, 200, { success: true });
  }

  // 4. Network Info & Server Info (for easy Wi-Fi phone sharing)
  if (pathname === '/api/network-info' && req.method === 'GET') {
    const netInfo = getLocalIPs();
    return sendJSON(res, 200, {
      port: PORT,
      localIPs: netInfo.list,
      primaryLAN: netInfo.primaryLAN,
      lanUrl: `http://${netInfo.primaryLAN}:${PORT}`,
      localUrl: `http://localhost:${PORT}`,
      hostname: os.hostname()
    });
  }

  // 4.1 GitHub Releases proxy & cache endpoint
  if (pathname === '/api/releases' && req.method === 'GET') {
    handleReleasesProxy(req, res, parsedUrl);
    return;
  }

  // 4.2 High-Speed Release Asset Proxy & Local Disk Cache (0ms LAN delivery)
  if (pathname === '/api/asset' && req.method === 'GET') {
    const rawUrl = parsedUrl.searchParams.get('url');
    if (!rawUrl) {
      return sendJSON(res, 400, { error: '缺少 url 参数' });
    }

    try {
      const parsedTarget = new URL(rawUrl);
      const hash = crypto.createHash('md5').update(rawUrl).digest('hex');
      let ext = path.extname(parsedTarget.pathname) || '';
      if (!ext || ext.length > 8) ext = '.bin';
      const cachedFilePath = path.join(CACHE_ASSETS_DIR, `${hash}${ext}`);

      // 1. If already on local SSD disk, stream immediately (0ms!)
      if (fs.existsSync(cachedFilePath) && fs.statSync(cachedFilePath).size > 0) {
        const mime = MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        return fs.createReadStream(cachedFilePath).pipe(res);
      }

      // 2. Fetch from GitHub upstream with redirect followed
      const remoteRes = await fetchWithRedirect(rawUrl);
      if (remoteRes.statusCode === 200) {
        const mime = remoteRes.headers['content-type'] || MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });

        const fileStream = fs.createWriteStream(cachedFilePath);
        remoteRes.pipe(fileStream);
        remoteRes.pipe(res);
        return;
      } else {
        return sendJSON(res, remoteRes.statusCode, { error: 'Upstream HTTP ' + remoteRes.statusCode });
      }
    } catch (err) {
      console.warn('Asset proxy error:', err.message);
      return sendJSON(res, 502, { error: '加载资源失败: ' + err.message });
    }
  }

  // Public open access: No login required (Pure static & open sharing mode)
  const isAuth = true;
  const isAdmin = true;

// Helper: Find file across files.json and notes attachments
function findFileRecord(fileId) {
  const files = readJSON(FILES_FILE, []);
  let found = files.find(f => f.id === fileId);
  if (found) return { record: found, inFiles: true };

  const notes = readJSON(NOTES_FILE, []);
  for (const n of notes) {
    const bound = [...(n.images || []), ...(n.attachments || [])];
    const match = bound.find(f => f.id === fileId);
    if (match) {
      let rec = { ...match };
      if (!rec.storedName) {
        // Try to match in files.json by id or name
        const fromFiles = files.find(f => f.originalName === match.name || f.id === match.id);
        if (fromFiles && fromFiles.storedName) {
          rec.storedName = fromFiles.storedName;
        } else {
          // Check if file exists directly on disk as id + ext
          const safeExt = path.extname(match.name || '');
          const candidateName = `${match.id}${safeExt}`;
          rec.storedName = candidateName;
        }
      }
      return { record: rec, inNotes: true, note: n };
    }
  }
  return null;
}

// 5. System Stats
if (pathname === '/api/stats' && req.method === 'GET') {
  if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });

  const notes = readJSON(NOTES_FILE, []);
  const users = readJSON(USERS_FILE, []);
  const visitors = users.filter(u => u.role === 'visitor');

  let filesCount = 0;
  let totalFileSize = 0;
  let totalDownloads = 0;

  for (const n of notes) {
    const boundFiles = [...(n.images || []), ...(n.attachments || [])];
    filesCount += boundFiles.length;
    for (const f of boundFiles) {
      totalFileSize += (f.size || 0);
      totalDownloads += (f.downloadCount || 0);
    }
  }

  // If notes don't have all files yet, fall back to files.json if larger
  const files = readJSON(FILES_FILE, []);
  if (filesCount === 0 && files.length > 0) {
    filesCount = files.length;
    totalFileSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
    totalDownloads = files.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
  }

  return sendJSON(res, 200, {
    notesCount: notes.length,
    filesCount,
    totalFileSize,
    totalDownloads,
    visitorCount: visitors.length
  });
}

  // 5.5 Tags Management
  if (pathname === '/api/tags' && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });
    const tags = getTagsList();
    return sendJSON(res, 200, tags);
  }

  if (pathname === '/api/tags' && req.method === 'POST') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以创建标签' });
    try {
      const data = await parseBody(req);
      const name = (data.name || '').trim();
      if (!name) return sendJSON(res, 400, { error: '标签名称不能为空' });
      if (name.length > 30) return sendJSON(res, 400, { error: '标签名称过长' });

      const customTags = readJSON(TAGS_FILE, []);
      if (!customTags.includes(name)) {
        customTags.push(name);
        writeJSON(TAGS_FILE, customTags);
      }
      return sendJSON(res, 201, { success: true, name });
    } catch (e) {
      return sendJSON(res, 500, { error: '创建标签失败' });
    }
  }

  if (pathname.startsWith('/api/tags/') && req.method === 'DELETE') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以删除标签' });
    const rawTag = pathname.replace('/api/tags/', '').split('/')[0];
    const tagName = decodeURIComponent(rawTag);
    const customTags = readJSON(TAGS_FILE, []);
    const filtered = customTags.filter(t => t !== tagName);
    writeJSON(TAGS_FILE, filtered);
    return sendJSON(res, 200, { success: true });
  }

  // 6. Notes Management
  if (pathname === '/api/notes' && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });
    const notes = readJSON(NOTES_FILE, []);
    return sendJSON(res, 200, notes);
  }

  if (pathname === '/api/notes' && req.method === 'POST') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以发布笔记' });
    try {
      const data = await parseBody(req);
      if (!data.title) {
        return sendJSON(res, 400, { error: '笔记标题不能为空' });
      }

      const notes = readJSON(NOTES_FILE, []);
      const newNote = {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        category: (data.category || '未分类').trim(),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
        content: data.content || '',
        images: Array.isArray(data.images) ? data.images : [],
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        author: session.displayName || session.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notes.unshift(newNote);
      writeJSON(NOTES_FILE, notes);
      return sendJSON(res, 201, newNote);
    } catch (e) {
      return sendJSON(res, 500, { error: '保存笔记失败' });
    }
  }

  if (pathname.startsWith('/api/notes/') && req.method === 'PUT') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以编辑笔记' });
    const noteId = pathname.replace('/api/notes/', '').split('/')[0];
    try {
      const data = await parseBody(req);
      const notes = readJSON(NOTES_FILE, []);
      const idx = notes.findIndex(n => n.id === noteId);
      if (idx === -1) return sendJSON(res, 404, { error: '笔记不存在' });

      notes[idx].title = (data.title || notes[idx].title).trim();
      notes[idx].category = (data.category || notes[idx].category).trim();
      if (data.tags !== undefined) {
        notes[idx].tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (data.content !== undefined) {
        notes[idx].content = data.content;
      }
      if (data.images !== undefined) {
        notes[idx].images = Array.isArray(data.images) ? data.images : [];
      }
      if (data.attachments !== undefined) {
        notes[idx].attachments = Array.isArray(data.attachments) ? data.attachments : [];
      }
      notes[idx].updatedAt = new Date().toISOString();

      writeJSON(NOTES_FILE, notes);
      return sendJSON(res, 200, notes[idx]);
    } catch (e) {
      return sendJSON(res, 500, { error: '更新笔记失败' });
    }
  }

  if (pathname.startsWith('/api/notes/') && req.method === 'DELETE') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以删除笔记' });
    const noteId = pathname.replace('/api/notes/', '').split('/')[0];
    const notes = readJSON(NOTES_FILE, []);
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx === -1) {
      return sendJSON(res, 404, { error: '笔记不存在' });
    }
    const noteToDelete = notes[idx];
    // Delete any bound physical files from disk
    const bound = [...(noteToDelete.images || []), ...(noteToDelete.attachments || [])];
    for (const item of bound) {
      if (item.storedName) {
        const p = path.join(UPLOADS_DIR, item.storedName);
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch (_) {}
        }
      }
    }

    notes.splice(idx, 1);
    writeJSON(NOTES_FILE, notes);
    return sendJSON(res, 200, { success: true });
  }

  // Export note as Markdown/Text file
  if (pathname.match(/^\/api\/notes\/[a-zA-Z0-9_\-]+\/export$/) && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });
    const parts = pathname.split('/');
    const noteId = parts[3];
    const notes = readJSON(NOTES_FILE, []);
    const note = notes.find(n => n.id === noteId);
    if (!note) return sendJSON(res, 404, { error: '笔记不存在' });

    const safeTitle = note.title.replace(/[\\/:*?"<>|]/g, '_');
    const filename = `${safeTitle}.md`;
    const exportContent = `# ${note.title}\n\n分类: ${note.category} | 标签: ${note.tags.join(', ')} | 更新时间: ${new Date(note.updatedAt).toLocaleString()}\n\n---\n\n${note.content}\n`;

    res.writeHead(200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    });
    return res.end(exportContent);
  }

  // 7. Files Management
  if (pathname === '/api/files' && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });
    const files = readJSON(FILES_FILE, []);
    return sendJSON(res, 200, files);
  }

  // Direct Binary Stream Upload (Supports any size, zero-dependency, ultra-reliable)
  if (pathname === '/api/files/upload' && req.method === 'POST') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以上传文件' });

    let rawFilename = req.headers['x-filename'] || parsedUrl.searchParams.get('filename');
    if (!rawFilename) {
      return sendJSON(res, 400, { error: '缺少文件名参数 (X-Filename)' });
    }

    try {
      rawFilename = decodeURIComponent(rawFilename);
    } catch (_) {}

    const originalName = path.basename(rawFilename);
    const category = decodeURIComponent(req.headers['x-category'] || parsedUrl.searchParams.get('category') || guessCategory(originalName));
    const description = decodeURIComponent(req.headers['x-description'] || parsedUrl.searchParams.get('description') || '');

    const fileId = crypto.randomUUID();
    const safeExt = path.extname(originalName);
    const storedName = `${fileId}${safeExt}`;
    const targetPath = path.join(UPLOADS_DIR, storedName);

    const writeStream = fs.createWriteStream(targetPath);
    let bytesReceived = 0;

    req.on('data', chunk => {
      bytesReceived += chunk.length;
    });

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      const mimeType = getMimeType(originalName, req.headers['content-type']);
      const fileRecord = {
        id: fileId,
        originalName,
        storedName,
        size: bytesReceived,
        mimeType,
        category,
        description,
        uploadedBy: session.displayName || session.username,
        uploadedAt: new Date().toISOString(),
        downloadCount: 0
      };

      const files = readJSON(FILES_FILE, []);
      files.unshift(fileRecord);
      writeJSON(FILES_FILE, files);

      return sendJSON(res, 201, fileRecord);
    });

    writeStream.on('error', (err) => {
      console.error('File write error:', err);
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      return sendJSON(res, 500, { error: '文件保存失败' });
    });
    return;
  }

  // File Download
  if (pathname.match(/^\/api\/files\/[a-zA-Z0-9_\-]+\/download$/) && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录以获取文件下载权限' });
    const fileId = pathname.split('/')[3];
    const match = findFileRecord(fileId);
    if (!match || !match.record) return sendJSON(res, 404, { error: '文件记录不存在' });

    const file = match.record;
    const filePath = path.join(UPLOADS_DIR, file.storedName);
    if (!fs.existsSync(filePath)) {
      return sendJSON(res, 404, { error: '物理文件不存在或已被移走' });
    }

    // Increment download count
    file.downloadCount = (file.downloadCount || 0) + 1;
    if (match.inFiles) {
      const files = readJSON(FILES_FILE, []);
      const f = files.find(x => x.id === fileId);
      if (f) { f.downloadCount = (f.downloadCount || 0) + 1; writeJSON(FILES_FILE, files); }
    }
    if (match.inNotes && match.note) {
      const notes = readJSON(NOTES_FILE, []);
      const n = notes.find(x => x.id === match.note.id);
      if (n) {
        const target = [...(n.images || []), ...(n.attachments || [])].find(x => x.id === fileId);
        if (target) target.downloadCount = (target.downloadCount || 0) + 1;
        writeJSON(NOTES_FILE, notes);
      }
    }

    const stat = fs.statSync(filePath);
    const mimeType = file.mimeType || 'application/octet-stream';
    const encodedName = encodeURIComponent(file.originalName || file.name || 'download');

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    return;
  }

  // File Online Preview
  if (pathname.match(/^\/api\/files\/[a-zA-Z0-9_\-]+\/preview$/) && req.method === 'GET') {
    if (!isAuth) return sendJSON(res, 401, { error: '请先登录' });
    const fileId = pathname.split('/')[3];
    const match = findFileRecord(fileId);
    if (!match || !match.record) return sendJSON(res, 404, { error: '文件记录不存在' });

    const file = match.record;
    const filePath = path.join(UPLOADS_DIR, file.storedName);
    if (!fs.existsSync(filePath)) {
      return sendJSON(res, 404, { error: '文件不存在' });
    }

    const stat = fs.statSync(filePath);
    const fileName = file.originalName || file.name || 'preview';
    const mimeType = file.mimeType || getMimeType(fileName);

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'public, max-age=604800'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    return;
  }

  // Delete File
  if (pathname.startsWith('/api/files/') && req.method === 'DELETE') {
    if (!isAdmin) return sendJSON(res, 403, { error: '只有管理员可以删除文件' });
    const fileId = pathname.replace('/api/files/', '').split('/')[0];
    const files = readJSON(FILES_FILE, []);
    const idx = files.findIndex(f => f.id === fileId);
    if (idx === -1) return sendJSON(res, 404, { error: '文件不存在' });

    const file = files[idx];
    const physicalPath = path.join(UPLOADS_DIR, file.storedName);
    try {
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
    } catch (err) {
      console.warn('Could not delete physical file:', err);
    }

    files.splice(idx, 1);
    writeJSON(FILES_FILE, files);
    return sendJSON(res, 200, { success: true });
  }

  // 8. Admin: Visitor Accounts Management
  if (pathname === '/api/admin/visitors' && req.method === 'GET') {
    if (!isAdmin) return sendJSON(res, 403, { error: '无权限访问' });
    const users = readJSON(USERS_FILE, []);
    const visitors = users
      .filter(u => u.role === 'visitor')
      .map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        remark: u.remark || '',
        createdAt: u.createdAt
      }));
    return sendJSON(res, 200, visitors);
  }

  if (pathname === '/api/admin/visitors' && req.method === 'POST') {
    if (!isAdmin) return sendJSON(res, 403, { error: '无权限访问' });
    try {
      const data = await parseBody(req);
      const username = (data.username || '').trim();
      const password = (data.password || '').trim();
      const remark = (data.remark || '').trim();
      const displayName = (data.displayName || username).trim();

      if (!username || !password) {
        return sendJSON(res, 400, { error: '用户名和密码不能为空' });
      }

      const users = readJSON(USERS_FILE, []);
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return sendJSON(res, 400, { error: '该用户名已存在，请换一个' });
      }

      const passData = hashPassword(password);
      const newVisitor = {
        id: crypto.randomUUID(),
        username,
        role: 'visitor',
        displayName,
        hash: passData.hash,
        salt: passData.salt,
        remark,
        createdAt: new Date().toISOString()
      };

      users.push(newVisitor);
      writeJSON(USERS_FILE, users);

      return sendJSON(res, 201, {
        id: newVisitor.id,
        username: newVisitor.username,
        displayName: newVisitor.displayName,
        remark: newVisitor.remark,
        createdAt: newVisitor.createdAt
      });
    } catch (e) {
      return sendJSON(res, 500, { error: '创建访客账号失败' });
    }
  }

  if (pathname.startsWith('/api/admin/visitors/') && req.method === 'DELETE') {
    if (!isAdmin) return sendJSON(res, 403, { error: '无权限访问' });
    const visitorId = pathname.replace('/api/admin/visitors/', '').split('/')[0];
    const users = readJSON(USERS_FILE, []);
    const idx = users.findIndex(u => u.id === visitorId && u.role === 'visitor');
    if (idx === -1) return sendJSON(res, 404, { error: '访客账号不存在' });

    users.splice(idx, 1);
    writeJSON(USERS_FILE, users);
    return sendJSON(res, 200, { success: true });
  }

  // 9. Admin: Change Password
  if (pathname === '/api/admin/change-password' && req.method === 'PUT') {
    if (!isAdmin) return sendJSON(res, 403, { error: '无权限访问' });
    try {
      const { oldPassword, newPassword } = await parseBody(req);
      if (!oldPassword || !newPassword) {
        return sendJSON(res, 400, { error: '新旧密码不能为空' });
      }

      const users = readJSON(USERS_FILE, []);
      const user = users.find(u => u.id === session.userId);
      if (!user || !verifyPassword(oldPassword, user.hash, user.salt)) {
        return sendJSON(res, 400, { error: '原密码不正确' });
      }

      const passData = hashPassword(newPassword);
      user.hash = passData.hash;
      user.salt = passData.salt;
      writeJSON(USERS_FILE, users);

      return sendJSON(res, 200, { success: true, message: '密码修改成功' });
    } catch (e) {
      return sendJSON(res, 500, { error: '修改密码失败' });
    }
  }

  // ----------------------------------------------------
  // STATIC FILES SERVING (Root and Public folder)
  // ----------------------------------------------------
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (_) {}
  let safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  // First check in ROOT_DIR (GitHub Pages static layout)
  let staticFilePath = path.join(ROOT_DIR, safePath);
  if (!fs.existsSync(staticFilePath) || !fs.statSync(staticFilePath).isFile()) {
    // Fallback to PUBLIC_DIR
    staticFilePath = path.join(PUBLIC_DIR, safePath);
  }

  // Check if static file exists
  if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    const ext = path.extname(staticFilePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isDevAsset = ['.html', '.js', '.css', '.json'].includes(ext);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isDevAsset ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'
    });
    fs.createReadStream(staticFilePath).pipe(res);
    return;
  }

  // Fallback: send root index.html
  const rootIndex = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(rootIndex)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(rootIndex).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

// Start listening
server.listen(PORT, HOST, () => {
  const netInfo = getLocalIPs();
  console.log('===============================================================');
  console.log('       ⭐ StarWhiteNote 个人笔记与资料站 已成功启动！');
  console.log('===============================================================');
  console.log(`💻 电脑本机浏览器访问:   http://localhost:${PORT}`);
  console.log(`📱 手机/局域网Wi-Fi访问: http://${netInfo.primaryLAN}:${PORT}`);
  console.log('');
  console.log(`💡 说明: 只要手机连接同一个 Wi-Fi，打开手机自带浏览器输入上面的`);
  console.log(`        http://${netInfo.primaryLAN}:${PORT} 即可直接浏览与下载笔记！`);
  console.log('===============================================================');
});
