import os
import json
import urllib.parse
import re
import subprocess
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
NOTES_DIR = os.path.join(ROOT_DIR, "notes")
OUTPUT_FILE = os.path.join(ROOT_DIR, "notes.json")
DATA_FILE = os.path.join(ROOT_DIR, "data", "notes.json")
PUBLIC_FILE = os.path.join(ROOT_DIR, "public", "notes.json")

IMG_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}
DOC_EXTS = {'.xmind', '.docx', '.xlsx', '.pptx', '.pdf', '.ora', '.excalidraw', '.zip', '.rar'}

# 历史笔记官方创建时间锚点（精确到秒，保证绝对真实的创建先后顺序）
HISTORICAL_CREATED_TIMES = {
    '基本不等式及其应用': '2026-11-12 17:33:52',
    '相遇追及': '2026-11-12 17:33:53',
    '绝对值不等式与函数': '2026-11-14 11:24:07',
    '二次函数与一元二次方程，不等式': '2026-11-14 11:29:58',
    '导数-曲线的切线与公切线': '2026-11-14 12:06:20',
    '阅读理解-推理判断题（上）': '2026-11-14 15:45:11',
    '阅读理解推断题（下）': '2026-11-14 19:14:58',
}

def get_article_creation_time(art_path, article_name):
    if article_name in HISTORICAL_CREATED_TIMES:
        return HISTORICAL_CREATED_TIMES[article_name]
    
    # 新上传的笔记通过 git 历史回溯初次提交时间
    try:
        rel_path = os.path.relpath(art_path, ROOT_DIR).replace('\\', '/')
        res = subprocess.run(
            ['git', 'log', '--format=%ad', '--date=iso', '--', rel_path],
            cwd=ROOT_DIR, capture_output=True, text=True
        )
        lines = [l.strip() for l in res.stdout.splitlines() if l.strip()]
        if lines:
            earliest = lines[-1]
            # parse iso date
            dt = earliest[:19]
            return dt.replace('T', ' ')
    except Exception:
        pass
    
    # 默认回退至文件元数据创建时间
    try:
        ctime = os.path.getctime(art_path)
        return datetime.fromtimestamp(ctime).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def strip_duplicate_heading(title, content):
    if not content:
        return "该专题包含相关板书截图与思维导图资料。"
    lines = content.strip().splitlines()
    if lines:
        first = lines[0].strip()
        # 过滤空标题行如 '#'
        if re.match(r'^#+\s*$', first):
            lines = lines[1:]
            while lines and not lines[0].strip():
                lines = lines[1:]
            return "\n".join(lines).strip()

        if first.startswith('#'):
            h_text = re.sub(r'^#+\s*', '', first)
            clean_h = re.sub(r'[\s\-_——,，、：:()（）之与及的和的与]', '', h_text.lower())
            clean_t = re.sub(r'[\s\-_——,，、：:()（）之与及的和的与]', '', title.lower())
            
            is_dup = False
            if clean_h and clean_t:
                if clean_h in clean_t or clean_t in clean_h:
                    is_dup = True
                else:
                    h_set = set(clean_h)
                    t_set = set(clean_t)
                    common = h_set & t_set
                    if len(common) / max(len(h_set), len(t_set)) >= 0.7:
                        is_dup = True
            
            if is_dup:
                lines = lines[1:]
                while lines and not lines[0].strip():
                    lines = lines[1:]
                return "\n".join(lines).strip()
    return content.strip()

def run():
    if not os.path.exists(NOTES_DIR):
        print(f"Directory not found: {NOTES_DIR}")
        return

    subject_folders = [f for f in sorted(os.listdir(NOTES_DIR)) if os.path.isdir(os.path.join(NOTES_DIR, f))]
    notes_list = []

    for subject in subject_folders:
        sub_path = os.path.join(NOTES_DIR, subject)
        article_folders = [f for f in sorted(os.listdir(sub_path)) if os.path.isdir(os.path.join(sub_path, f))]

        for article in article_folders:
            art_path = os.path.join(sub_path, article)
            files_in_art = os.listdir(art_path)

            raw_content = ""
            md_files = [f for f in files_in_art if f.lower().endswith('.md')]
            
            # 读取 Markdown 正文
            if md_files:
                primary_md = md_files[0]
                try:
                    with open(os.path.join(art_path, primary_md), "r", encoding="utf-8") as fp:
                        raw_content = fp.read().strip()
                except Exception as e:
                    print(f"Error reading {primary_md}: {e}")
            
            content = strip_duplicate_heading(article, raw_content)

            images = []
            files = []

            for fname in files_in_art:
                fpath = os.path.join(art_path, fname)
                if not os.path.isfile(fpath):
                    continue

                ext = os.path.splitext(fname)[1].lower()
                stat = os.stat(fpath)

                sub_enc = urllib.parse.quote(subject)
                art_enc = urllib.parse.quote(article)
                fn_enc = urllib.parse.quote(fname)
                rel_url = f"notes/{sub_enc}/{art_enc}/{fn_enc}"

                item = {
                    "name": fname,
                    "url": rel_url,
                    "size": stat.st_size
                }

                if ext in IMG_EXTS:
                    images.append(item)
                elif ext in DOC_EXTS:
                    files.append(item)

            created_time_str = get_article_creation_time(art_path, article)
            date_str = created_time_str.split()[0]

            notes_list.append({
                "id": f"{urllib.parse.quote(subject)}-{urllib.parse.quote(article)}",
                "title": article,
                "tags": [subject],
                "date": date_str,
                "created_at": created_time_str,
                "content": content,
                "images": images,
                "files": files
            })

    # 按创建时间先后顺序正向排序 (从早到晚，保证上集在前，下集在后)
    notes_list.sort(key=lambda x: x.get("created_at", x.get("date", "")))

    json_str = json.dumps(notes_list, ensure_ascii=False, indent=2)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as fp:
        fp.write(json_str)

    data_dir = os.path.dirname(DATA_FILE)
    if os.path.exists(data_dir):
        with open(DATA_FILE, "w", encoding="utf-8") as fp:
            fp.write(json_str)

    pub_dir = os.path.dirname(PUBLIC_FILE)
    if os.path.exists(pub_dir):
        with open(PUBLIC_FILE, "w", encoding="utf-8") as fp:
            fp.write(json_str)

    print(f"Successfully generated notes.json with {len(notes_list)} articles in chronological order!")
    for idx, n in enumerate(notes_list, 1):
        md_status = "MD正文" if len(n['content']) > 100 else "无独立MD"
        print(f" {idx}. [{','.join(n['tags'])}] {n['title']} (创建时间: {n['created_at']}, {md_status}, 图片:{len(n['images'])}, 附件:{len(n['files'])})")

if __name__ == "__main__":
    run()
