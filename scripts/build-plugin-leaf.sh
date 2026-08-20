#!/usr/bin/env bash
# Materialize plugins/huashu-design/skills/huashu-design/ as regular files.
# Codex copies skills/ and drops symlinks; core.symlinks=false turns links into path stubs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/plugins/huashu-design/skills/huashu-design"
CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

stage() {
  local dest="$1"
  rm -rf "$dest"
  mkdir -p "$dest"
  local p
  for p in SKILL.md LICENSE SECURITY.md package.json .env.example assets references scripts; do
    [ -e "$ROOT/$p" ] || continue
    rsync -a --exclude node_modules --exclude __pycache__ --exclude .DS_Store \
      --exclude build-plugin-leaf.sh \
      "$ROOT/$p" "$dest/"
  done
  mkdir -p "$dest/agents"
  cp "$ROOT/plugins/huashu-design/.codex-plugin/openai.yaml" "$dest/agents/openai.yaml"
  if find "$dest" -type l | grep -q .; then
    echo "error: symlinks in plugin leaf" >&2
    find "$dest" -type l >&2
    exit 1
  fi
}

if [ "$CHECK" = 1 ]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  stage "$tmp/huashu-design"
  if [ ! -d "$DEST" ]; then
    echo "plugin leaf missing — run scripts/build-plugin-leaf.sh" >&2
    exit 1
  fi
  if ! diff -rq "$tmp/huashu-design" "$DEST" >/dev/null; then
    echo "plugin leaf is stale — run scripts/build-plugin-leaf.sh" >&2
    diff -rq "$tmp/huashu-design" "$DEST" || true
    exit 1
  fi
  echo "plugin leaf is fresh"
else
  stage "$DEST"
  echo "wrote $DEST"
fi
