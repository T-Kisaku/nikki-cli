#!/usr/bin/env bash
set -euo pipefail
git describe --tags --abbrev=0 2>/dev/null || echo -n dev
