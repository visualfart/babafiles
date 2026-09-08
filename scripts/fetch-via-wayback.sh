#!/usr/bin/env bash
# Fetch a page that blocks direct requests (indiankanoon.org, some outlets) by asking the
# Wayback Machine to capture it, then print the captured text and the archive URL.
#   scripts/fetch-via-wayback.sh "https://indiankanoon.org/doc/12345/"
# Prints: ARCHIVE_URL=<url> on the first line, then the page text (tags stripped).
set -euo pipefail
url="$1"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
tmp=$(mktemp)
# Try an existing capture first, then Save Page Now.
avail=$(curl -s "https://archive.org/wayback/available?url=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$url")" | python3 -c 'import sys,json; d=json.load(sys.stdin); c=d.get("archived_snapshots",{}).get("closest"); print(c["url"] if c and c.get("available") else "")' 2>/dev/null || true)
if [ -n "$avail" ]; then
  eff="$avail"; curl -s -A "$UA" -L --max-time 60 -o "$tmp" "$avail"
else
  eff=$(curl -s -A "$UA" -L --max-time 120 -o "$tmp" -w "%{url_effective}" "https://web.archive.org/save/$url")
fi
echo "ARCHIVE_URL=$eff"
python3 - "$tmp" <<'PY'
import sys,re,html
s=open(sys.argv[1],encoding="utf-8",errors="ignore").read()
s=re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>"," ",s)
s=re.sub(r"(?s)<!--.*?-->"," ",s)
s=re.sub(r"<br\s*/?>|</p>|</div>|</h\d>|</li>|</tr>","\n",s,flags=re.I)
s=re.sub(r"<[^>]+>"," ",s)
s=html.unescape(s)
s=re.sub(r"[ \t]+"," ",s); s=re.sub(r"\n\s*\n+","\n",s)
print(s.strip()[:120000])
PY
rm -f "$tmp"
