#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# EC2 Ubuntu 22.04 — one-time setup script
# Run as: chmod +x setup.sh && sudo ./setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "── 1. System update ────────────────────────────────────────────────────"
apt update && apt upgrade -y

echo "── 2. Node.js 20 ───────────────────────────────────────────────────────"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

echo "── 3. Python 3 + pip + venv ─────────────────────────────────────────────"
apt install -y python3 python3-pip python3-venv
python3 --version

echo "── 4. Nginx ────────────────────────────────────────────────────────────"
apt install -y nginx
systemctl enable nginx

echo "── 5. PM2 (Node.js process manager) ────────────────────────────────────"
npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash

echo "── 6. Git ──────────────────────────────────────────────────────────────"
apt install -y git

echo "── 7. Create app directories ───────────────────────────────────────────"
mkdir -p /var/www/neurotherapy/dist
mkdir -p /var/www/Server
mkdir -p /var/www/ai-service

chown -R ubuntu:ubuntu /var/www

echo "✅ Setup complete. Now run deploy.sh to upload your code."
