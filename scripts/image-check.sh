#!/usr/bin/env bash
# Builds <template>/docker (templates without a Dockerfile have nothing to check) and fails on:
# - any file with file capabilities: the platform runs customer images with `--cap-drop ALL` and `no-new-privileges`, and such a
#   binary cannot exec there;
# - an absolute path in ENTRYPOINT/CMD that uid 1000 (the user the platform runs the app as) cannot use: the first one must be
#   executable, the others readable (a folder created with the wrong mode hides the start script, and the app dies on boot).
# Usage: scripts/image-check.sh <template-folder>   (needs Docker and python3; removes the image it built)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
slug="${1:?usage: scripts/image-check.sh <template-folder>}"
ctx="$ROOT/$slug/docker"
if [ ! -f "$ctx/Dockerfile" ]; then echo "[image $slug] no Dockerfile: nothing to build"; exit 0; fi
tag="image-check-$slug:$$"
trap 'docker rmi "$tag" >/dev/null 2>&1 || true' EXIT
echo "[image $slug] building"
docker build -q -t "$tag" "$ctx" >/dev/null
echo "[image $slug] scanning for file capabilities"
found="$(python3 "$ROOT/scripts/lib/scan-caps.py" "$tag")"
if [ -n "$found" ]; then
  echo "[image $slug] FAIL: files with file capabilities (copy them with \`cat > file\` to drop the attribute):" >&2
  echo "$found" >&2
  exit 1
fi
echo "[image $slug] checking the start command as uid 1000"
paths="$(docker image inspect -f '{{json .Config.Entrypoint}} {{json .Config.Cmd}}' "$tag" | python3 -c '
import json, sys
a, b = sys.stdin.read().split(" ", 1)
argv = (json.loads(a) or []) + (json.loads(b) or [])
for i, arg in enumerate(argv):
    if arg.startswith("/") and " " not in arg:
        print(("x" if i == 0 else "r") + " " + arg)
')"
if [ -n "$paths" ]; then
  if ! docker run --rm --network none --entrypoint /bin/sh "$tag" -c true >/dev/null 2>&1; then
    echo "[image $slug] no /bin/sh in the image: start command not checked"
  else
    bad="$(printf '%s\n' "$paths" | docker run --rm -i --network none --user 1000:1000 --entrypoint /bin/sh "$tag" -c '
      while read -r mode path; do
        if [ "$mode" = x ]; then [ -x "$path" ] || echo "$path (not executable by uid 1000)"; else [ -r "$path" ] || echo "$path (not readable by uid 1000)"; fi
      done')"
    if [ -n "$bad" ]; then
      echo "[image $slug] FAIL: the start command uses paths uid 1000 cannot use (check the mode of the file and of every folder above it):" >&2
      echo "$bad" >&2
      exit 1
    fi
  fi
fi
echo "[image $slug] ok"
