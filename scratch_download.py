import json, urllib.request, os, subprocess, re

with open('scratch_results.json') as f:
    results = json.load(f)

os.makedirs('scratch_dl', exist_ok=True)
os.makedirs('public/images/entities', exist_ok=True)

for eid, info in results.items():
    url = info['download_url']
    ext = os.path.splitext(url.split('?')[0])[1].lower()
    tmp_path = f"scratch_dl/{eid}{ext}"
    req = urllib.request.Request(url, headers={"User-Agent": "babafiles-research/1.0 (saineelank@gmail.com)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r, open(tmp_path, 'wb') as out:
            out.write(r.read())
        print("Downloaded", eid, "->", tmp_path, os.path.getsize(tmp_path), "bytes")
    except Exception as e:
        print("FAILED", eid, e)
