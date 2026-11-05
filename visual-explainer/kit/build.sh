#!/bin/bash
# Build: concatenate head + pages + figures + shell into one self-contained dist/index.html.
# Page order = p0_top.html, then p[A-Z]*.html sorted (so pA_*, pB_* … is your chapter order), then p9_end.html.
set -e
cd "$(dirname "$0")"
mkdir -p dist
PAGES="p0_top.html $(ls p[A-Z]*.html 2>/dev/null | tr '\n' ' ') p9_end.html"
FIGS="helpers.js $(ls f[A-Z]*.js 2>/dev/null | tr '\n' ' ')"
python3 - $PAGES -- $FIGS <<'PY'
import sys
a=sys.argv[1:]; k=a.index('--'); pages=a[:k]; figs=a[k+1:]
js=''.join(open(f).read()+'\n' for f in figs)+'\nST=0;\n})();\n'   # all figures share one IIFE opened by helpers.js
open('/tmp/ve_all.js','w').write(js+'\n'+open('shell.js').read())
html=(open('head.html').read()
      +''.join(open(p).read() for p in pages)
      +'<script>\n'+js+'</script>\n<script>\n'+open('shell.js').read()+'\n</script>\n</body>\n</html>\n')
open('dist/index.html','w').write(html)
PY
node --check /tmp/ve_all.js
# every id a figure reaches for must exist in the HTML
missing=0
for id in $(cat f*.js shell.js | grep -oE '\$\("[A-Za-z0-9_]+"\)|getElementById\("[A-Za-z0-9_]+"\)' | sed -E 's/.*\("(.*)"\)/\1/' | sort -u); do
  grep -q "id=\"$id\"" dist/index.html || { echo "MISSING id $id"; missing=1; }
done
[ $missing -eq 0 ] || exit 1
echo "BUILD_OK $(wc -c < dist/index.html) bytes, pages $(grep -c '<article class="page' dist/index.html)"
