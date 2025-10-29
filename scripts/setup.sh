#!/bin/bash
set -e

echo "🚀 PhishGuard Platform Setup"
echo "============================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings!"
    echo "   Generate encryption key: openssl rand -hex 32"
    echo "   Generate JWT secret: openssl rand -base64 32"
    exit 1
fi

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
bash scripts/generate-ssl.sh

# Build and start
echo "🐳 Building Docker containers..."
docker-compose build

echo "▶️  Starting services..."
docker-compose up -d

echo ""
echo "✅ PhishGuard started successfully!"
echo "🌐 Frontend: https://localhost:8443"
echo "🔐 Admin Panel: https://localhost:8443/admin"
echo "📊 Check status: docker-compose ps"
echo "📝 View logs: docker-compose logs -f"
