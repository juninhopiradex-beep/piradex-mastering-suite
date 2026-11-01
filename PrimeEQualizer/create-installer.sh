#!/bin/bash
set -euo pipefail
VST3="${1:-}"
AU="${2:-}"
if [[ -z "$VST3" || -z "$AU" || ! -d "$VST3" || ! -d "$AU" ]]; then
  echo 'Usage: ./create-installer.sh /path/plugin.vst3 /path/plugin.component'
  echo 'Both compiled macOS bundles are mandatory. This does not compile plugins.'
  exit 2
fi
if [[ $(uname -s) != Darwin ]]; then echo 'Run on macOS'; exit 2; fi
for bundle in "$VST3" "$AU"; do
  if ! file "$bundle/Contents/MacOS/"* 2>/dev/null | grep -q 'Mach-O 64-bit.*x86_64'; then
    echo "No Intel macOS Mach-O found in $bundle"
    exit 3
  fi
done
ROOT=$(mktemp -d)
trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/Library/Audio/Plug-Ins/VST3" "$ROOT/Library/Audio/Plug-Ins/Components"
cp -R "$VST3" "$ROOT/Library/Audio/Plug-Ins/VST3/"
cp -R "$AU" "$ROOT/Library/Audio/Plug-Ins/Components/"
pkgbuild --root "$ROOT" --identifier com.beatfreak.primeequalizer --version 0.1.1 --install-location / "PrimeEQualizer-by-Piradex-Intel-Catalina-unsigned.pkg"
echo 'Installer created (unsigned). Test and sign/notarize before public distribution.'
