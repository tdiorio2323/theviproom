#!/bin/bash

# VIP Room Deployment Script for td-core-01
# Deploy to: www.tdstudiosdigital.com

set -e

echo "🏆 Starting VIP Room deployment to td-core-01..."

# Configuration
SERVER_IP="167.99.127.220"
SERVER_USER="td"
SSH_KEY="~/.ssh/id_rsa_tdstudios"
DOMAIN="www.tdstudiosdigital.com"
PROJECT_NAME="theviproom"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    print_error "index.html not found. Please run this script from the VIP Room project directory."
    exit 1
fi

print_status "Preparing deployment package..."

# Create deployment package
tar -czf viproom-deploy.tar.gz \
    index.html \
    styles.css \
    script.js \
    Dockerfile \
    nginx.conf \
    docker-compose.yml \
    README.md

print_success "Deployment package created"

print_status "Uploading to td-core-01 server..."

# Upload to server
scp -i $SSH_KEY viproom-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

print_success "Files uploaded to server"

print_status "Deploying on server..."

# Execute deployment on server
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
set -e

echo "🚀 Starting server-side deployment..."

# Create project directory
sudo mkdir -p /opt/viproom
cd /opt/viproom

# Extract files
sudo tar -xzf /tmp/viproom-deploy.tar.gz
sudo chown -R $USER:$USER /opt/viproom

echo "📦 Files extracted"

# Stop existing container if running
if docker ps -q --filter "name=viproom" | grep -q .; then
    echo "🛑 Stopping existing VIP Room container..."
    docker stop viproom || true
    docker rm viproom || true
fi

# Build and start new container
echo "🏗️  Building VIP Room container..."
docker build -t viproom:latest .

echo "🚀 Starting VIP Room container..."
docker run -d \
    --name viproom \
    --restart unless-stopped \
    -p 8080:80 \
    --network vip-network \
    viproom:latest

# Wait for container to be healthy
echo "⏳ Waiting for VIP Room to be ready..."
sleep 10

# Test the deployment
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ VIP Room is running successfully!"
else
    echo "❌ VIP Room health check failed"
    exit 1
fi

# Update Caddy configuration for www.tdstudiosdigital.com
echo "🔧 Updating Caddy configuration..."

# Create or update Caddyfile
sudo tee /opt/caddy/Caddyfile << 'CADDY_EOF'
# Main TD Studios sites
tdstudiosny.com, www.tdstudiosny.com {
    reverse_proxy portainer:9000
}

# VIP Room with password protection
www.tdstudiosdigital.com {
    # Basic authentication for VIP access
    basicauth /vip/* {
        vip $2a$14$EPXrP9bGEXQhsdA.TzikV.CDMp5UwlAUj7jEfnPkvnXdWx7syzNbq
    }
    
    # Reverse proxy to VIP Room
    reverse_proxy viproom:80
    
    # Security headers
    header {
        # VIP-specific headers
        X-VIP-Access "Granted"
        X-TD-Studios "VIP-Room"
        
        # Standard security headers
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # Remove server info
        -Server
    }
    
    # Logging
    log {
        output file /var/log/caddy/viproom.log
        format json
    }
}

# File browser
files.tdstudiosny.com {
    reverse_proxy filebrowser:80
}

# Monitoring
monitor.tdstudiosny.com {
    reverse_proxy uptime-kuma:3001
}
CADDY_EOF

# Reload Caddy configuration
echo "🔄 Reloading Caddy..."
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

echo "🎉 VIP Room deployment completed successfully!"
echo "🌐 Access at: https://www.tdstudiosdigital.com"
echo "🔐 VIP Password required for /vip/ sections"
echo ""
echo "📊 Container Status:"
docker ps --filter "name=viproom" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

EOF

# Clean up local deployment file
rm viproom-deploy.tar.gz

print_success "VIP Room deployed successfully!"
print_status "🌐 URL: https://www.tdstudiosdigital.com"
print_status "🔐 VIP sections require password authentication"

print_status "Verifying deployment..."

# Test the deployment
sleep 5
if curl -f https://www.tdstudiosdigital.com/health > /dev/null 2>&1; then
    print_success "✅ VIP Room is live and accessible!"
else
    print_warning "⚠️  Site may still be starting up. Check in a moment."
fi

echo ""
echo "🏆 VIP Room Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Domain: https://www.tdstudiosdigital.com"
echo "🔐 Password: vip (for /vip/ sections)"
echo "🖥️  Server: td-core-01 (167.99.127.220)"
echo "🐳 Container: viproom"
echo "📊 Port: 8080 -> 80"
echo "🔒 SSL: Auto-managed by Caddy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next Steps:"
echo "1. Visit https://www.tdstudiosdigital.com"
echo "2. Navigate to VIP sections (password required)"
echo "3. Customize content as needed"
echo "4. Monitor via https://monitor.tdstudiosny.com"
echo ""
echo "✨ VIP Room is ready for exclusive access!"