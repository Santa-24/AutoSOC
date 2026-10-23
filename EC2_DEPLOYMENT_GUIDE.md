# AutoSOC — AWS EC2 Production Deployment Guide

This guide walks you through deploying **AutoSOC** to an Amazon Web Services (AWS) Elastic Compute Cloud (EC2) instance.

---

## 1. Prerequisites & Sizing

- **Recommended Instance Type:** `t3.medium` or `t3.large` (2 vCPU, 4GB+ RAM recommended for Next.js production builds).
- **Recommended AMI:** Amazon Linux 2023 AMI (or Ubuntu 24.04 LTS).
- **Architecture:** `x86_64`.
- **Storage:** 20 GB gp3 root volume.

---

## 2. AWS Security Group Configuration

Configure an inbound security group for your EC2 instance with the following rules:

| Type | Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | Your IP (`x.x.x.x/32`) | Secure terminal access |
| **Custom TCP** | TCP | `3000` | `0.0.0.0/0` (or VPN/Office IP) | AutoSOC Direct Port |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Web Access |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | TLS / SSL (if behind domain) |

---

## 3. Recommended IAM Role (Zero Static Keys on EC2)

The most secure way to run AutoSOC on EC2 is attaching an **IAM Instance Profile**:
1. Open the **AWS IAM Console** -> **Roles** -> **Create role**.
2. Select **AWS service** -> **EC2**.
3. Attach the **`AutoSOC-Operator-Policy`** created during project setup.
4. Name the role: `AutoSOC-EC2-Role`.
5. Attach `AutoSOC-EC2-Role` to your EC2 instance under **Actions** -> **Security** -> **Modify IAM role**.

*When attached, AutoSOC automatically authenticates via AWS Instance Metadata Service (IMDSv2). You do not need to paste static access keys into `.env`!*

---

## 4. Deployment Methods

### Method A: Automated One-Click Launch via EC2 User Data (Recommended)

When launching your EC2 instance in the AWS Console, expand **Advanced details** at the bottom of the launch wizard and paste the following into the **User data** field:

```bash
#!/bin/bash
# Update and install Docker and Git
dnf update -y
dnf install -y docker git
systemctl enable --now docker

# Clone AutoSOC repository
cd /opt
git clone https://github.com/Santa-24/AutoSOC.git
cd AutoSOC

# Initialize environment
cp .env.example .env
sed -i 's/AUTOSOC_DEMO_MODE=true/AUTOSOC_DEMO_MODE=false/g' .env
sed -i 's/AUTOSOC_ENABLE_CLOUDTRAIL=false/AUTOSOC_ENABLE_CLOUDTRAIL=true/g' .env

# Build and run container
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

---

### Method B: Manual SSH Deployment

If you already have a running EC2 instance:

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/Santa-24/AutoSOC.git
   cd AutoSOC
   ```

3. **Configure your `.env`:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   *(If using an attached IAM role, leave `AWS_ACCESS_KEY_ID` blank; set `AUTOSOC_DEMO_MODE=false` and `AWS_REGION=ap-south-1`)*.

4. **Run the automated deployment script:**
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

5. **Verify live container status:**
   ```bash
   sudo docker ps
   curl http://localhost:3000/api/health
   ```

6. Open your browser and navigate to:
   ```
   http://<YOUR-EC2-PUBLIC-IP>:3000/dashboard
   ```

---

## 5. Production SSL / Custom Domain (Optional)

To serve AutoSOC over HTTPS with your custom domain name (e.g. `autosoc.yourdomain.com`):

1. **Install Nginx & Certbot on EC2:**
   ```bash
   sudo dnf install -y nginx certbot python3-certbot-nginx
   ```

2. **Create Nginx Reverse Proxy Config (`/etc/nginx/conf.d/autosoc.conf`):**
   ```nginx
   server {
       listen 80;
       server_name autosoc.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Request free SSL certificate:**
   ```bash
   sudo certbot --nginx -d autosoc.yourdomain.com
   sudo systemctl restart nginx
   ```
