#!/bin/bash
# usage: pushloop.sh "<subject sin número>"  — rebase sobre main, versión = main+1, push
cd "$(git rev-parse --show-toplevel)" || exit 1
SUBJ="$1"
for try in 1 2 3 4 5 6; do
  git fetch -q origin main
  git rebase origin/main >/dev/null 2>&1
  while [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; do
    python3 - <<'EOF' || { git rebase --abort; echo "conflicto no trivial"; exit 2; }
import re,subprocess
for p in subprocess.check_output(['git','diff','--name-only','--diff-filter=U']).decode().split():
    s=open(p).read()
    if p.endswith('.md'):
        s=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', lambda m: m.group(1)+m.group(2), s, flags=re.S)
    else:
        def pick(m):
            a,b=m.group(1),m.group(2); st=lambda t: re.sub(r'2026-11-03\.\d+','V',t)
            assert st(a)==st(b), 'non-version conflict in '+p
            return a
        s=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', pick, s, flags=re.S)
    open(p,'w').write(s)
EOF
    git add -A granja; GIT_EDITOR=true git rebase --continue >/dev/null 2>&1 || true
  done
  base=$(git show origin/main:granja/version.json | grep -o '\.[0-9]*"' | tr -d '."'); n=$((base+1)); cur=$(grep -o "2026-11-03\.[0-9]*" granja/version.json)
  sed -i "s/$cur/2026-11-03.$n/" granja/version.json; sed -i "s/var FALL = '2026-11-03\.[0-9]*'/var FALL = '2026-11-03.$n'/" granja/index.html; sed -i "0,/2026-11-03\.[0-9]*/s//2026-11-03.$n/" granja/game.js
  sed -i "s/^## Versión 0 (sesión \"Corsario\"/## Versión $n (sesión \"Corsario\"/" granja/PLAN.md
  [ "$(grep -c 'function worldB' granja/game.js)" = 1 ] || { echo "worldB perdido"; exit 3; }
  node --check granja/game.js && node --check granja/mundo.js && node --check granja/cidade.js || exit 4
  git add -A granja; git commit -q -m "Granja v$n (mundo.js): $SUBJ

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ej8pJRuBw1GQCjAd4NzR9W" || true
  if git push -q origin HEAD:main 2>/dev/null; then git push -q -u origin "$(git rev-parse --abbrev-ref HEAD)" 2>/dev/null; echo "pushed v$n"; exit 0; fi
  sleep 2
done
echo "no pude pushear"; exit 1
