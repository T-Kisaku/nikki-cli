#!/usr/bin/env bash
set -euo pipefail

if [[ -n $(git status --porcelain) ]]; then
  echo "error: git repository is not clean" >&2
  exit 1
fi

read -p "tag name: " tag
if [[ -z "$tag" ]]; then
  echo "error: tag name is empty" >&2
  exit 1
fi

version=${tag#v}
binary_name=$(sed -n 's/^project_name:[[:space:]]*//p' .goreleaser.yaml)
if [[ -z "$binary_name" ]]; then
  echo "error: failed to get project_name from .goreleaser.yaml" >&2
  exit 1
fi

cat <<EOF > release.json
{
  "version": "$version",
  "binaryName": "$binary_name"
}
EOF

git add release.json
git commit -m "chore(release): $tag"
git tag "$tag"
git push --follow-tags