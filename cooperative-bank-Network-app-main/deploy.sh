#!/bin/bash
# 🚀 Vite Production Deployment Script
# Author: ChatGPT
# Date: $(date)

set -e

APP_DIR="$HOME/cooperative-bank-Network-app/frontend_vite"
BUILD_DIR="$APP_DIR/dist"
NGINX_DIR="/var/www/html"
NODE_VERSION_REQUIRED="20"

echo "=== Checking Node.js version ==="
NODE_VERSION=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_VERSION" -lt "$NODE_VERSION_REQUIRED" ]; then
  echo "⚙️  Updating Node.js to v22 (required for Vite)..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "=== Installing dependencies ==="
cd "$APP_DIR"
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

echo "=== Building production bundle ==="
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build failed — dist/ folder not found."
  exit 1
fi

echo "=== Deploying to Nginx ==="
sudo rm -rf "$NGINX_DIR"/*
sudo cp -r "$BUILD_DIR"/* "$NGINX_DIR"

echo "=== Restarting Nginx ==="
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: http://$(curl -s ifconfig.me)"

