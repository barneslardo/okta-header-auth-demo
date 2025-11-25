#!/bin/bash

# Deployment script for Okta Header-Based Auth Demo
set -e

echo "==== Okta Header Auth Demo - Deployment Script ===="

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run with sudo"
  exit 1
fi

# Get the actual user who ran sudo
ACTUAL_USER=${SUDO_USER:-$USER}
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying from: $APP_DIR"
echo "Running as user: $ACTUAL_USER"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
else
  echo "Node.js already installed: $(node --version)"
fi

# Install dependencies
echo "Installing npm dependencies..."
cd "$APP_DIR"
sudo -u "$ACTUAL_USER" npm install

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/okta-header-auth.service << EOL
[Unit]
Description=Okta Header-Based Auth Demo
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=PORT=3080

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd, enable and start service
echo "Starting service..."
systemctl daemon-reload
systemctl enable okta-header-auth.service
systemctl restart okta-header-auth.service

# Check status
sleep 2
systemctl status okta-header-auth.service --no-pager

echo ""
echo "==== Deployment Complete ===="
echo "Service: okta-header-auth"
echo "Status: systemctl status okta-header-auth"
echo "Logs: journalctl -u okta-header-auth -f"
echo "Application should be running on port 3080"
