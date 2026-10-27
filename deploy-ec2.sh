#!/usr/bin/env bash
# ==============================================================================
# AutoSOC — AWS EC2 One-Command Deployment Script
# Supports: Amazon Linux 2023, Amazon Linux 2, Ubuntu 22.04 / 24.04 LTS
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo "  AutoSOC — Automated Cloud Security Operations Center Deployment"
echo "======================================================================"

# 1. Detect Package Manager & Install Dependencies (Docker, Git)
if command -v dnf &> /dev/null; then
    echo "[+] Amazon Linux 2023 detected. Installing Docker & Git..."
    sudo dnf update -y
    sudo dnf install -y docker git
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
elif command -v yum &> /dev/null; then
    echo "[+] Amazon Linux 2 detected. Installing Docker & Git..."
    sudo yum update -y
    sudo amazon-linux-extras install docker -y 2>/dev/null || sudo yum install -y docker
    sudo yum install -y git
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
elif command -v apt-get &> /dev/null; then
    echo "[+] Ubuntu/Debian detected. Installing Docker & Git..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io docker-compose-v2 git curl
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
fi

# 2. Optimize Build Performance (Enable 2GB Swap on <4GB RAM Instances)
if [ -f /proc/meminfo ]; then
    TOTAL_MEM=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 4096)
    SWAP_TOTAL=$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)
    if [ "$SWAP_TOTAL" -eq 0 ] && [ "$TOTAL_MEM" -lt 4096 ]; then
        echo "[+] Low memory instance detected (${TOTAL_MEM}MB RAM). Creating 2GB swap space to accelerate Next.js build..."
        sudo dd if=/dev/zero of=/swapfile bs=128M count=16 status=none 2>/dev/null || true
        if [ -f /swapfile ]; then
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile >/dev/null 2>&1 || true
            sudo swapon /swapfile >/dev/null 2>&1 || true
            echo "[+] 2GB swap activated."
        fi
    fi
fi

# 3. Check for .env Configuration
if [ ! -f .env ]; then
    echo "[!] No .env file found. Initializing .env from .env.example..."
    cp .env.example .env
    echo "[*] AutoSOC will authenticate via EC2 IAM Instance Profile by default."
fi

# 4. Build & Launch Container via Docker Compose
echo "[+] Building and starting AutoSOC container..."
if docker compose version &> /dev/null; then
    sudo docker compose down || true
    sudo docker compose up -d --build
elif command -v docker-compose &> /dev/null; then
    sudo docker-compose down || true
    sudo docker-compose up -d --build
else
    echo "[*] Fallback: Standard Docker Build & Run..."
    sudo docker build -t autosoc:latest .
    sudo docker stop autosoc-app 2>/dev/null || true
    sudo docker rm autosoc-app 2>/dev/null || true
    sudo docker run -d \
      --name autosoc-app \
      --restart unless-stopped \
      -p 80:3000 \
      -p 3000:3000 \
      --env-file .env \
      autosoc:latest
fi

# 5. Wait for Container Health Check
echo "[+] Waiting for AutoSOC server to boot..."
sleep 5

for i in {1..12}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "======================================================================"
        echo "  SUCCESS: AutoSOC is live and listening on HTTP ports 80 and 3000!"
        echo "  Access the Analyst Console: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<EC2-PUBLIC-IP>'):3000"
        echo "======================================================================"
        exit 0
    fi
    echo "    Attempt $i: waiting for health endpoint..."
    sleep 3
done

echo "[!] Warning: AutoSOC container started but health check took longer than expected."
echo "    Inspect container logs: sudo docker logs autosoc-app"
