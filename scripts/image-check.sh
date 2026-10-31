#!/usr/bin/env bash
# Builds <template>/docker (templates without a Dockerfile have nothing to check) and fails on any file with file capabilities:
# the platform runs customer images with `--cap-drop ALL` and `no-new-privileges`, and such a binary cannot exec there.
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
echo "[image $slug] ok"
