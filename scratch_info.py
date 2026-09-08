import sys, json, urllib.request, urllib.parse, time

def info(fname):
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
        print("TITLE:", p.get('title'))
        ii = p.get('imageinfo')
        if not ii:
            print("  NO IMAGEINFO (missing?)")
            continue
        i0 = ii[0]
        print("  URL:", i0.get('url'))
        em = i0.get('extmetadata', {})
        print("  License:", em.get('LicenseShortName', {}).get('value'))
        artist = em.get('Artist', {}).get('value', '')
        import re
        artist_clean = re.sub('<[^<]+?>', '', artist)[:200]
        print("  Artist:", artist_clean)
        print("  Credit:", re.sub('<[^<]+?>','',em.get('Credit', {}).get('value', ''))[:200])
        print("  DateTimeOriginal:", em.get('DateTimeOriginal', {}).get('value', '')[:50])
    print()

if __name__ == "__main__":
    for fname in sys.argv[1:]:
        try:
            info(fname)
        except Exception as e:
            print("ERROR for", fname, ":", e)
        time.sleep(0.5)
