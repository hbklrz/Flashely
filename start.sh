#!/bin/bash
# =========================================
# Discord Bot Panel Enhanced - Start Script
# Run this in Termux: bash start.sh
# =========================================

echo ""
echo "🤖 Discord Bot Panel Enhanced v2.0"
echo "====================================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install with: pkg install nodejs"
  exit 1
fi

echo "✅ Node.js: $(node --version)"

# Check .env
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Edit .env to set your password: nano .env"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create bots folder
mkdir -p bots/logs
mkdir -p database

echo ""
echo "🚀 Starting panel..."
echo "📌 Open in browser: http://localhost:$(grep PORT .env | cut -d= -f2 || echo 3000)"
echo "🛑 Press Ctrl+C to stop"
echo ""

node index.js
