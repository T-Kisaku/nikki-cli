#!/bin/sh

set -e

REPO="yourusername/nik"
INSTALL_DIR="/usr/local/bin"

# Fetch latest version
VERSION=$(curl -sL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name":' | cut -d '"' -f 4)

# Construct download URL
BIN_URL="https://github.com/$REPO/releases/download/$VERSION/nik"

echo "Downloading nik v$VERSION..."
curl -fsSL -o nik "$BIN_URL"
chmod +x nik
sudo mv nik "$INSTALL_DIR/nik"

echo "✅ nik installed successfully!"
