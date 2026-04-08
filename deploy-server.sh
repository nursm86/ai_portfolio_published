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
echo "[1/4] Pulling latest code..."
git pull origin main
echo ""

# Install dependencies (only if package.json changed)
echo "[2/4] Installing dependencies..."
npm install --legacy-peer-deps --production=false
echo ""

# Build
echo "[3/4] Building..."
npm run build
echo ""

# Restart
echo "[4/4] Restarting service..."
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
