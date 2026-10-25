"""Build the FIN 4453 Midterm II Trainer from the source files in this folder.

Run from anywhere:  python build.py
Writes:
  ../site/index.html                       standalone page for GitHub Pages (progress saved in the browser)
  ../artifact/fin4453-trainer.html         page body for the claude.ai artifact (account sync + Claude grading)
"""
import re, pathlib
here = pathlib.Path(__file__).resolve().parent
read = lambda f: (here / f).read_text(encoding='utf-8')
js = '\n'.join(read(f) for f in ['engine.js', 'content.js', 'gens.js', 'app.js'])
js = re.sub(r"^if \(typeof module !== 'undefined'\).*$", '', js, flags=re.M)
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=JetBrains+Mono:wght@400;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">\n')
style = '<style>\n' + read('style.css') + '\n</style>\n'
app = '<div id="app"></div>\n<script>\n' + js + '\n</script>\n'
title = '<title>FIN 4453 Midterm II Trainer</title>\n'
(here.parent / 'artifact').mkdir(exist_ok=True)
(here.parent / 'artifact' / 'fin4453-trainer.html').write_text(title + '<meta name="claude:viewport-fit-sides" content="cover">\n' + fonts + style + app, encoding='utf-8')
(here.parent / 'index.html').write_text('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<meta name="description" content="FIN 4453 Midterm II practice: lessons, select-all drills scored like the exam, written scenarios, mock exams and progress tracking.">\n' + title + fonts + style + '</head>\n<body>\n' + app + '</body>\n</html>\n', encoding='utf-8')
print('built site/index.html and artifact/fin4453-trainer.html')
