import sys, json, urllib.request, urllib.parse, time, re
sys.path.insert(0, '.')
from scratch_manifest import manifest

def get_info(fname):
    title = "File:" + fname
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "titles": title
    })
    url = "https://commons.wikimedia.org/w/api.php?" + params
    req = urllib.request.Request(url, headers={"User-Agent": "babafiles-research/1.0 (saineelank@gmail.com)"})
    with urllib.request.urlopen(req) as r:
        d = json.load(r)
    pages = d['query']['pages']
    for pid, p in pages.items():
        ii = p.get('imageinfo')
        if not ii:
            return None
        i0 = ii[0]
        em = i0.get('extmetadata', {})
        def clean(x):
            return re.sub('<[^<]+?>', '', x).strip()
        return {
            "page_url": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(' ', '_')),
            "download_url": i0.get('url'),
            "license": em.get('LicenseShortName', {}).get('value', ''),
            "artist": clean(em.get('Artist', {}).get('value', '')),
            "credit": clean(em.get('Credit', {}).get('value', '')),
        }

results = {}
for eid, fname in manifest.items():
    info = get_info(fname)
    results[eid] = info
    print(eid, "->", info)
    time.sleep(0.7)

with open('/Users/neel/Work/babafiles/scratch_results.json', 'w') as f:
    json.dump(results, f, indent=2)
