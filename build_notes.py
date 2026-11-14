import os
import json
import urllib.parse
from datetime import datetime

ROOT_DIR = r"C:\Users\PC\Desktop\cui\StarWhiteNote_web"
NOTES_DIR = os.path.join(ROOT_DIR, "notes")
OUTPUT_FILE = os.path.join(ROOT_DIR, "notes.json")
DATA_FILE = os.path.join(ROOT_DIR, "data", "notes.json")

IMG_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}
DOC_EXTS = {'.xmind', '.docx', '.xlsx', '.pptx', '.pdf', '.ora', '.excalidraw', '.zip', '.rar'}

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

            content = ""
            md_files = [f for f in files_in_art if f.lower().endswith('.md')]
            
            # Read markdown content directly as main article text
            if md_files:
                # Prefer the first or primary md
                primary_md = md_files[0]
                try:
                    with open(os.path.join(art_path, primary_md), "r", encoding="utf-8") as fp:
                        content = fp.read().strip()
                except Exception as e:
                    print(f"Error reading {primary_md}: {e}")
            
            if not content:
                content = f"### {article}\n\n该专题包含相关板书截图与思维导图资料。"

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
                    # Optional: also allow downloading md as attachment if desired
                    # But per user instruction: md is displayed as the main text
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