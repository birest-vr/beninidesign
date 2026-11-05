# Rigenera sitemap.xml: lastmod = data dell'ultimo commit che ha toccato il file.
import io, os, re, subprocess

ROOT = r"C:\Users\pc\Downloads\benini-design"
BASE = "https://beninidesign.it/"

def url(p):
    rel = os.path.relpath(p, ROOT).replace("\\", "/")
    # index.html vale come URL della cartella: e il canonical delle pagine
    if rel.endswith("index.html"):
        rel = rel[:-len("index.html")]
    return BASE + rel

def data_git(p):
    rel = os.path.relpath(p, ROOT).replace("\\", "/")
    out = subprocess.check_output(
        ["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT)
    return out.decode().strip() or "2026-11-01"

pagine = []
for base, dirs, files in os.walk(ROOT):
    if ".git" in base:
        continue
    for f in sorted(files):
        if not f.endswith(".html") or f.startswith("_"):
            continue
        p = os.path.join(base, f)
        h = io.open(p, encoding="utf-8").read()
        if re.search(r'name="robots"[^>]*content="[^"]*noindex', h):
            continue
        pagine.append(p)

def prio(u):
    if u == BASE: return "1.0"
    if u == BASE + "comuni/": return "0.8"
    if "/comuni/" in u: return "0.6"
    if "/de/" in u: return "0.9"
    if "/en/" in u: return "0.5"
    return "0.8"

voci = sorted((url(p), data_git(p), prio(url(p))) for p in pagine)
righe = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ""]
for gruppo, filtro in [
        ("ITALIANO — pagine principali", lambda u: "/comuni/" not in u and "/en/" not in u and "/de/" not in u),
        ("ITALIANO — comuni", lambda u: "/comuni/" in u),
        ("DEUTSCH", lambda u: "/de/" in u),
        ("ENGLISH", lambda u: "/en/" in u)]:
    sel = [v for v in voci if filtro(v[0])]
    if not sel: continue
    righe.append("  <!-- ============ %s ============ -->" % gruppo)
    for u, d, pr in sel:
        righe.append('  <url><loc>%s</loc><lastmod>%s</lastmod>'
                     '<changefreq>monthly</changefreq><priority>%s</priority></url>' % (u, d, pr))
    righe.append("")
righe.append("</urlset>")

io.open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(righe) + "\n")
date = sorted(set(v[1] for v in voci))
print("URL:", len(voci), "| date lastmod presenti:", ", ".join(date))
