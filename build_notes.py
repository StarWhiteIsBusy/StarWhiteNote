import os
import json
import urllib.parse
import re
from datetime import datetime

ROOT_DIR = r"C:\Users\PC\Desktop\cui\StarWhiteNote_web"
NOTES_DIR = os.path.join(ROOT_DIR, "notes")
OUTPUT_FILE = os.path.join(ROOT_DIR, "notes.json")
DATA_FILE = os.path.join(ROOT_DIR, "data", "notes.json")

IMG_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}
DOC_EXTS = {'.xmind', '.docx', '.xlsx', '.pptx', '.pdf', '.ora', '.excalidraw', '.zip', '.rar'}

def strip_duplicate_heading(title, content):
    if not content:
        return "该专题包含相关板书截图与思维导图资料。"
    lines = content.strip().splitlines()
    if lines:
        first = lines[0].strip()
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

    subject_folders = [f for f in os.listdir(NOTES_DIR) if os.path.isdir(os.path.join(NOTES_DIR, f))]
    notes_list = []

    for subject in subject_folders:
        sub_path = os.path.join(NOTES_DIR, subject)
        article_folders = [f for f in os.listdir(sub_path) if os.path.isdir(os.path.join(sub_path, f))]

        for article in article_folders:
            art_path = os.path.join(sub_path, article)
            files_in_art = os.listdir(art_path)

            raw_content = ""
            md_files = [f for f in files_in_art if f.lower().endswith('.md')]
            
            # Read markdown content directly as main article text
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
            latest_mtime = os.path.getmtime(art_path)

            for fname in files_in_art:
                fpath = os.path.join(art_path, fname)
                if not os.path.isfile(fpath):
                    continue
                
                mtime = os.path.getmtime(fpath)
                if mtime > latest_mtime:
                    latest_mtime = mtime

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
                elif ext == '.md':
                    # Per user instruction: markdown is rendered directly as article text
                    pass

            date_str = datetime.fromtimestamp(latest_mtime).strftime("%Y-%m-%d")

            notes_list.append({
                "id": f"{urllib.parse.quote(subject)}-{urllib.parse.quote(article)}",
                "title": article,
                "tags": [subject],
                "date": date_str,
                "content": content,
                "images": images,
                "files": files
            })

    # Sort: newest first
    notes_list.sort(key=lambda x: x.get("date", ""), reverse=True)

    json_str = json.dumps(notes_list, ensure_ascii=False, indent=2)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as fp:
        fp.write(json_str)

    data_dir = os.path.dirname(DATA_FILE)
    if os.path.exists(data_dir):
        with open(DATA_FILE, "w", encoding="utf-8") as fp:
            fp.write(json_str)

    print(f"Successfully generated notes.json with {len(notes_list)} articles from subfolders!")
    for n in notes_list:
        md_status = "MD正文已载入" if len(n['content']) > 100 else "无独立MD"
        print(f" - [{','.join(n['tags'])}] {n['title']} ({md_status}, 字数:{len(n['content'])}, 图片:{len(n['images'])}, 附件:{len(n['files'])})")

if __name__ == "__main__":
    run()
