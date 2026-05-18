#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Deploy / redeploy script — run this on the EC2 server every time you update
# Usage: chmod +x deploy.sh && ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_DIR="/var/www/repo"          # where your git repo lives on the server
FRONTEND_BUILD="/var/www/neurotherapy/dist"
SERVER_DIR="/var/www/Server"
AI_DIR="/var/www/ai-service"

echo "── 1. Pull latest code ──────────────────────────────────────────────────"
cd $REPO_DIR && git pull origin main

echo "── 2. Build React frontend ─────────────────────────────────────────────"
cd $REPO_DIR/neurotherapy
npm install --legacy-peer-deps
npm run build
cp -r dist/* $FRONTEND_BUILD/

echo "── 3. Install Node.js backend deps ─────────────────────────────────────"
cd $REPO_DIR/Server
npm install --omit=dev
rsync -a --exclude=node_modules . $SERVER_DIR/

echo "── 4. Install Python AI service deps ───────────────────────────────────"
cd $REPO_DIR/ai-service
pip3 install -r requirements.txt
rsync -a . $AI_DIR/

echo "── 5. Restart Node.js server (PM2) ─────────────────────────────────────"
if pm2 list | grep -q "neurotherapy-server"; then
    pm2 restart neurotherapy-server
else
    cp $REPO_DIR/deploy/ecosystem.config.cjs $SERVER_DIR/
    pm2 start $SERVER_DIR/ecosystem.config.cjs
fi
pm2 save

echo "── 6. Restart Python AI service ────────────────────────────────────────"
pkill -f "uvicorn app:app" || true
cd $AI_DIR
nohup python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 >> /var/log/ai-service.log 2>&1 &
echo "Python service PID: $!"

echo "── 7. Reload Nginx ─────────────────────────────────────────────────────"
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
