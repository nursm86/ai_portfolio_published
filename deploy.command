#!/bin/bash

# ============================================
# Deploy Script for ai_portfolio
# Double-click this file on macOS to run
# ============================================

set -e

# Paths
SOURCE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PUBLISH_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  Building & Deploying ai_portfolio"
echo "========================================="
echo ""
echo "Source:  $SOURCE_DIR"
echo "Publish: $PUBLISH_DIR"
echo ""

# ---- Step 1: Build ----
echo "[1/4] Building Next.js (standalone)..."
cd "$SOURCE_DIR"
npm run build
echo "Build complete."
echo ""

# ---- Step 2: Clean old files ----
echo "[2/4] Cleaning old published files..."
cd "$PUBLISH_DIR"
# Remove everything except .git, .gitattributes, and this script
find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name '.gitattributes' ! -name '.cpanel.yml' ! -name 'deploy.command' -exec rm -rf {} +
echo "Cleaned."
echo ""

# ---- Step 3: Copy standalone build ----
echo "[3/4] Copying standalone build..."

# Copy standalone server
cp -r "$SOURCE_DIR/.next/standalone/"* "$PUBLISH_DIR/"

# Copy static assets (not included in standalone)
mkdir -p "$PUBLISH_DIR/.next/static"
cp -r "$SOURCE_DIR/.next/static/"* "$PUBLISH_DIR/.next/static/"

# Copy public folder
if [ -d "$SOURCE_DIR/public" ]; then
    cp -r "$SOURCE_DIR/public" "$PUBLISH_DIR/public"
fi

echo "Copied."
echo ""

# ---- Step 4: Commit & Push ----
echo "[4/4] Committing and pushing..."
cd "$PUBLISH_DIR"
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to deploy."
else
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "deploy: $TIMESTAMP"
    git push origin main
    echo ""
    echo "Deployed successfully!"
fi

echo ""
echo "========================================="
echo "  Done!"
echo "========================================="
echo ""
read -n 1 -s -r -p "Press any key to close..."
