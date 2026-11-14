const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const NOTES_DIR = path.join(ROOT_DIR, 'notes');
const OUTPUT_FILE = path.join(ROOT_DIR, 'notes.json');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'notes.json');

// Supported extensions
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const DOC_EXTS = new Set(['.xmind', '.docx', '.xlsx', '.pptx', '.pdf', '.ora', '.excalidraw', '.zip', '.rar']);

// Define standardized note topics per subject
const TOPIC_RULES = [
  // --- 数学 ---
  {
    id: 'math-tangent',
    title: '曲线的切线与公切线',
    subject: '数学',
    date: '2026-11-14',
    summary: '高中数学导数大题高频考点：曲线在某点切线方程、过定点引切线、有公共切点的公切线及非公共切点公切线先分后合联立解法。',
    match: ['曲线的切线', '数学笔记5'],
    mdFile: '数学笔记5_曲线的切线与公切线.md'
  },
  {
    id: 'math-quadratic',
    title: '二次函数与一元二次方程、不等式',
    subject: '数学',
    date: '2026-11-14',
    summary: '高中数学核心基石：二次函数三大解析式（一般式/顶点式/两根式）、配方推导、根的判别式与韦达定理、一元二次不等式解法与特殊解集。',
    match: ['二次函数', '数学笔记4'],
    mdFile: '数学笔记4_二次函数与一元二次方程不等式.md'
  },
  {
    id: 'math-abs-func',
    title: '绝对值不等式与函数',
    subject: '数学',
    date: '2026-11-14',
    summary: '高中数学常考模型：实数绝对值定义与解集、绝对值函数翻折法则、三角不等式链、锅形拓展模型（尖底锅/平底锅/歪底锅）及极值口算口诀。',
    match: ['绝对值', '数学笔记3'],
    mdFile: '数学笔记3_绝对值不等式与函数.md'
  },
  {
    id: 'math-basic-ineq',
    title: '基本不等式及其应用',
    subject: '数学',
    date: '2026-11-12',
    summary: '高中数学必修核心：基本不等式四项链条（调和≤几何≤算术≤平方）、常数代换法（“1”的代换）、权方和不等式、一正二定三取等六字口诀。',
    match: ['基本不等式', '数学笔记2'],
    mdFile: '数学笔记2_基本不等式与应用技巧.md'
  },
  {
    id: 'math-identity',
    title: '等式与不等式性质、证明方法与常用恒等式',
    subject: '数学',
    date: '2026-11-12',
    summary: '高中数学基础概念与常用代数工具：实数大小比较基本事实、等式与不等式基本性质、证明方法（综合法/分析法/反证法）、高频平方与立方乘法公式。',
    match: ['数学笔记1', '恒等式'],
    mdFile: '数学笔记1_等式不等式与常用恒等式.md'
  },
  {
    id: 'math-set-logic',
    title: '集合与常用逻辑用语',
    subject: '数学',
    date: '2026-11-10',
    summary: '高中数学开篇重点：集合的基本概念、交集/并集/补集运算、常用逻辑用语、充分必要条件与命题真假判定。',
    match: ['集合', '常用逻辑用语', '命题与逻辑用语'],
    mdFile: null
  },

  // --- 英语 ---
  {
    id: 'english-inference',
    title: '阅读理解之推理判断题（上）',
    subject: '英语',
    date: '2026-11-14',
    summary: '高考英语阅读理解核心题型攻坚：推理判断题六大考查形式、四大解题策略、三不选排除陷阱及“立足原文、就近推导”解题法则。',
    match: ['推理判断', '阅读理解之推理判断题', '阅读理解推理判断', '阅读1', '阅读2'],
    mdFile: '英语阅读_推理判断题上_XMind.md'
  },
  {
    id: 'english-detail',
    title: '英语阅读理解：细节理解题解题攻略',
    subject: '英语',
    date: '2026-11-12',
    summary: '高考英语阅读大头题型：“定位—比对—秒杀”三阶法解题步骤、题干标志词识别、回文定位三大原则及正确/干扰选项特征剖析。',
    match: ['细节理解', '英语阅读理解1'],
    mdFile: '英语阅读_细节理解题解题法_XMind.md'
  },
  {
    id: 'english-vocab',
    title: '高考英语词汇课：核心解题方法与词汇梳理',
    subject: '英语',
    date: '2026-11-11',
    summary: '英语词汇专项精讲：核心高频词汇分类记忆、阅读词汇猜词技巧、构词法与词性转换解题方法。',
    match: ['词汇第一课', '词汇课下'],
    mdFile: null
  },

  // --- 物理 ---
  {
    id: 'physics-chase',
    title: '高中物理：相遇与追及问题专题分析',
    subject: '物理',
    date: '2026-11-13',
    summary: '高中物理必修一重点难点：相遇与追及的两大基本关系（时间/位移）、速度相等临界状态分析、极值判断与避碰条件。',
    match: ['相遇', '追及'],
    mdFile: '相遇与追及问题专题.md'
  }
];

function buildNotes() {
  if (!fs.existsSync(NOTES_DIR)) {
    console.error('Notes directory does not exist:', NOTES_DIR);
    return;
  }

  // 1. Gather all files in notes/
  const subjectFolders = fs.readdirSync(NOTES_DIR).filter(f => {
    return fs.statSync(path.join(NOTES_DIR, f)).isDirectory();
  });

  const subjectFilesMap = new Map();
  subjectFolders.forEach(sub => {
    const subPath = path.join(NOTES_DIR, sub);
    const files = fs.readdirSync(subPath).filter(f => fs.statSync(path.join(subPath, f)).isFile());
    subjectFilesMap.set(sub, files);
  });

  const assignedFiles = new Set();
  const notesList = [];

  // 2. Build defined topics
  for (const topic of TOPIC_RULES) {
    const subFiles = subjectFilesMap.get(topic.subject) || [];
    const matchedFiles = subFiles.filter(f => {
      const match = topic.match.some(m => f.includes(m));
      return match;
    });

    matchedFiles.forEach(f => assignedFiles.add(`${topic.subject}/${f}`));

    // Read markdown content if available
    let content = topic.summary;
    if (topic.mdFile && subFiles.includes(topic.mdFile)) {
      try {
        const mdPath = path.join(NOTES_DIR, topic.subject, topic.mdFile);
        const mdText = fs.readFileSync(mdPath, 'utf8');
        if (mdText && mdText.trim()) {
          content = mdText.trim();
        }
      } catch (_) {}
    }

    const images = [];
    const files = [];

    matchedFiles.forEach(fileName => {
      const ext = path.extname(fileName).toLowerCase();
      const filePath = path.join(NOTES_DIR, topic.subject, fileName);
      const stat = fs.statSync(filePath);
      const relUrl = `notes/${encodeURIComponent(topic.subject)}/${encodeURIComponent(fileName)}`;

      const item = {
        name: fileName,
        url: relUrl,
        size: stat.size
      };

      if (IMG_EXTS.has(ext)) {
        images.push(item);
      } else if (DOC_EXTS.has(ext) || ext === '.md') {
        files.push(item);
      }
    });

    // Ensure mdFile is also accessible in files if present
    if (topic.mdFile && subFiles.includes(topic.mdFile) && !files.some(f => f.name === topic.mdFile)) {
      const filePath = path.join(NOTES_DIR, topic.subject, topic.mdFile);
      const stat = fs.statSync(filePath);
      files.unshift({
        name: topic.mdFile,
        url: `notes/${encodeURIComponent(topic.subject)}/${encodeURIComponent(topic.mdFile)}`,
        size: stat.size
      });
    }

    notesList.push({
      id: topic.id,
      title: topic.title,
      tags: [topic.subject],
      date: topic.date,
      content,
      images,
      files
    });
  }

  // 3. Any unassigned files grouped by subject
  subjectFolders.forEach(sub => {
    const files = subjectFilesMap.get(sub) || [];
    const remaining = files.filter(f => !assignedFiles.has(`${sub}/${f}`));
    if (remaining.length > 0) {
      const images = [];
      const docFiles = [];
      remaining.forEach(f => {
        const ext = path.extname(f).toLowerCase();
        const stat = fs.statSync(path.join(NOTES_DIR, sub, f));
        const item = {
          name: f,
          url: `notes/${encodeURIComponent(sub)}/${encodeURIComponent(f)}`,
          size: stat.size
        };
        if (IMG_EXTS.has(ext)) images.push(item);
        else docFiles.push(item);
      });

      notesList.push({
        id: `unassigned-${encodeURIComponent(sub)}`,
        title: `${sub} 补充资料与未分类笔记`,
        tags: [sub],
        date: new Date().toISOString().slice(0, 10),
        content: `该分类包含 ${sub} 学科下最新上传但未归并的独立文件。`,
        images,
        files: docFiles
      });
    }
  });

  // Sort notes: newest date first
  notesList.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // 4. Output to notes.json
  const jsonContent = JSON.stringify(notesList, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');
  if (fs.existsSync(path.dirname(DATA_FILE))) {
    fs.writeFileSync(DATA_FILE, jsonContent, 'utf8');
  }

  console.log(`Successfully generated notes.json with ${notesList.length} notes!`);
  notesList.forEach(n => {
    console.log(` - [${n.tags.join(',')}] ${n.title} (Images: ${n.images.length}, Files: ${n.files.length})`);
  });
}

buildNotes();