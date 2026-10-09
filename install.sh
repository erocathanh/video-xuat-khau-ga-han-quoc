#!/usr/bin/env bash
# One-command setup for this repo: system deps (only if missing), npm packages,
# Python packages, then a smoke test that renders one still.
# No API keys are needed: every voice, music and video clip is already committed.
#
# usage: ./install.sh            interactive (asks before any brew install)
#        ./install.sh --yes      answer yes to brew installs
#        ./install.sh --skip-brew  never touch Homebrew (fail if a tool is missing)
set -euo pipefail
cd "$(dirname "$0")"

ASSUME_YES=0
SKIP_BREW=0
for a in "$@"; do
  case "$a" in
    --yes|-y) ASSUME_YES=1 ;;
    --skip-brew) SKIP_BREW=1 ;;
    *) echo "unknown option: $a"; exit 2 ;;
  esac
done

say() { printf '\n==> %s\n' "$*"; }

say "No API keys needed: rebuilding the video uses only files committed in this repo."

# ---------------------------------------------------------------- system tools
missing=()
node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  local major; major=$(node -p 'process.versions.node.split(".")[0]')
  [ "$major" -ge 18 ]
}
node_ok || missing+=(node)
command -v ffmpeg >/dev/null 2>&1 || missing+=(ffmpeg)
command -v python3 >/dev/null 2>&1 || missing+=(python)

if [ ${#missing[@]} -eq 0 ]; then
  say "System tools present: node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3), $(python3 --version)"
else
  say "Missing tools: ${missing[*]}"
  if [ "$SKIP_BREW" -eq 1 ]; then
    echo "--skip-brew set; install them yourself and re-run."; exit 1
  fi
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew not found. Install it from https://brew.sh then re-run ./install.sh"; exit 1
  fi
  echo "Would run: brew install ${missing[*]}"
  if [ "$ASSUME_YES" -eq 0 ]; then
    read -r -p "Proceed? [y/N] " ans
    case "$ans" in y|Y|yes|YES) ;; *) echo "Aborted."; exit 1 ;; esac
  fi
  brew install "${missing[@]}"
  node_ok || { echo "node >= 18 still not available"; exit 1; }
fi

# ---------------------------------------------------------------- npm
say "npm ci"
npm ci --no-audit --no-fund

# ---------------------------------------------------------------- python packages
# Only needed to re-run xkga/build_timeline.py (music bed) and the map/image scripts.
if python3 -c 'import numpy, PIL' >/dev/null 2>&1; then
  say "Python packages numpy + pillow present"
else
  say "pip3 install --user numpy pillow"
  pip3 install --user numpy pillow || pip3 install --user --break-system-packages numpy pillow
fi

# ---------------------------------------------------------------- smoke test
say "Smoke test: render one still -> out/smoke-test.png"
mkdir -p out
npx remotion still src/index.ts XkgaVi out/smoke-test.png --frame=1700
[ -s out/smoke-test.png ] || { echo "SMOKE TEST FAILED"; exit 1; }
say "INSTALL-OK. Render the full video with: npm run render"
