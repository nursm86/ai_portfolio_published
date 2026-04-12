#!/bin/bash
# ============================================
# Deploy script — run on the Ubuntu server
# Usage: bash ~/portfolio/deploy-server.sh
# ============================================

set -e

cd ~/portfolio

echo "========================================="
echo "  Deploying Portfolio"
echo "========================================="
echo ""

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main
echo ""

# Install dependencies
echo "[2/6] Installing dependencies..."
npm install --legacy-peer-deps --production=false
echo ""

# Generate Prisma client (reads prisma/schema.prisma).
# Nuke the output dir first so stale engine binaries or leftover files from
# previous generator versions don't block regeneration. Safe — everything in
# src/generated/prisma is regenerated from scratch.
echo "[3/6] Generating Prisma client..."
rm -rf src/generated/prisma
npx prisma generate
echo ""

# Apply any pending database migrations. Safe on first run (creates DB).
echo "[4/6] Applying database migrations..."
npx prisma migrate deploy
echo ""

# Seed only on first run when the database is empty (non-destructive).
# Remove this block once the DB has production data you don't want overwritten.
if [ ! -s prisma/portfolio.db ] || [ "$(sqlite3 prisma/portfolio.db 'SELECT COUNT(*) FROM Activity;' 2>/dev/null || echo 0)" = "0" ]; then
    echo "[4b] Database empty — seeding initial content..."
    npm run db:seed || echo "Seed failed (continuing anyway)"
    echo ""
fi

# Build
echo "[5/6] Building..."
npm run build
echo ""

# Restart
echo "[6/6] Restarting service..."
sudo systemctl restart portfolio
sleep 2

# Verify
if sudo systemctl is-active --quiet portfolio; then
    echo ""
    echo "========================================="
    echo "  Deployed successfully!"
    echo "  Site is live at https://mdnurislam.com"
    echo "========================================="
else
    echo ""
    echo "  ERROR: Service failed to start!"
    echo "  Check logs: sudo journalctl -u portfolio -n 20"
fi
