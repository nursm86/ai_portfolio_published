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
echo "[1/4] Building Next.js..."
cd "$SOURCE_DIR"
npm run build
echo "Build complete."
echo ""

# ---- Step 2: Clean old files ----
echo "[2/4] Cleaning old published files..."
cd "$PUBLISH_DIR"
find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name '.gitattributes' ! -name '.cpanel.yml' ! -name '.gitignore' ! -name 'deploy.command' -exec rm -rf {} +
echo "Cleaned."
echo ""

# ---- Step 3: Copy build files (no node_modules) ----
echo "[3/4] Copying build files..."

# Copy custom server.js
cp "$SOURCE_DIR/server.js" "$PUBLISH_DIR/server.js"

# Copy production package.json (no postinstall)
cat > "$PUBLISH_DIR/package.json" << 'PKGJSON'
{
  "name": "portfolio.com",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "@ai-sdk/openai": "^1.2.7",
    "@ai-sdk/react": "^1.2.0",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tabler/icons-react": "^3.31.0",
    "@tsparticles/engine": "^3.8.1",
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.8.1",
    "ai": "^4.1.65",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.5.0",
    "lucide-react": "^0.483.0",
    "motion": "^12.23.0",
    "next": "15.2.3",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-github-btn": "^1.4.0",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tw-animate-css": "^1.2.4",
    "vaul": "^1.1.2",
    "zod": "^3.24.2"
  }
}
PKGJSON

# Copy .next from standalone (cross-platform JS files)
cp -R "$SOURCE_DIR/.next/standalone/.next" "$PUBLISH_DIR/.next"

# Copy static assets
mkdir -p "$PUBLISH_DIR/.next/static"
cp -R "$SOURCE_DIR/.next/static/"* "$PUBLISH_DIR/.next/static/"

# Copy public folder
cp -R "$SOURCE_DIR/public" "$PUBLISH_DIR/public"

echo "Copied."
echo ""

# ---- Step 4: Commit & Push ----
echo "[4/4] Committing and pushing..."
cd "$PUBLISH_DIR"
git add -A

if git diff --cached --quiet; then
    echo "No changes to deploy."
else
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "deploy: $TIMESTAMP"
    git push origin main
    echo ""
    echo "Deployed successfully!"
    echo ""
    echo "REMINDER: On cPanel, click 'Run NPM Install' if dependencies changed."
fi

echo ""
echo "========================================="
echo "  Done!"
echo "========================================="
echo ""
read -n 1 -s -r -p "Press any key to close..."
