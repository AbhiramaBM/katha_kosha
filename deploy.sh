#!/bin/bash
set -e

echo "=================================================="
echo "🚀 Deploying Kannada Katha Kosha to Server"
echo "=================================================="

# 1. Fetch latest changes
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Install backend dependencies & run database migration
echo "📦 Installing backend dependencies..."
npm install --production=false

echo "🗄️ Running database migrations..."
npx knex migrate:latest

# 3. Build the frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. If Nginx serves from a custom www folder, copy dist
if [ -d "/var/www/html/dist" ]; then
  echo "📂 Copying frontend build to /var/www/html/dist..."
  cp -r frontend/dist/* /var/www/html/dist/
elif [ -d "/var/www/katha_kosha/frontend/dist" ]; then
  echo "📂 Frontend build ready at /var/www/katha_kosha/frontend/dist"
fi

# 5. Restart Node.js backend service (PM2 or systemd)
echo "🔄 Restarting application service..."
if command -v pm2 &> /dev/null; then
  pm2 restart all || pm2 restart katha_kosha || pm2 start src/server.js --name "katha_kosha"
elif systemctl is-active --quiet katha_kosha; then
  sudo systemctl restart katha_kosha
fi

# 6. Reload Nginx
if command -v nginx &> /dev/null; then
  echo "🌐 Reloading Nginx..."
  sudo nginx -t && sudo systemctl reload nginx || sudo service nginx reload
fi

echo "=================================================="
echo "✅ Deployment completed successfully!"
echo "Visit: https://story.devupattar.com"
echo "=================================================="
