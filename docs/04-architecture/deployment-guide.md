# VPS & Docker Deployment Guide

**Section ID:** 04-05  
**Status:** ✅ Detailed (Updated for Persistent Ops)  
**Last Updated:** February 16, 2026

---

## 🏗️ The Persistence Strategy: Why VPS?

Unlike standard web applications, IWAS is a **Persistent Service Infrastructure**. We **MUST NOT** deploy this on Serverless platforms (like Vercel or AWS Lambda) for the following reasons:

1.  **Non-HTTP Protocols:** Cloud Serverless only supports HTTP/S (Ports 80/443). IWAS requires **UDP** for RADIUS (1812/1813) and WireGuard (51820).
2.  **Persistent VPN Connections:** VPN Tunnels must stay active 24/7 for branch routers to access the Cloud. Serverless platforms terminate connections as soon as the web request is processed.
3.  **Background Jobs:** Health checks (Heartbeats) and session management tasks must run continuously in the background without user interaction.

**Recommended Hardware:** Linux VPS (Ubuntu 22.04+)  
**Minimum Specs (50 branches):** 2 Core CPU / 4GB RAM / 40GB SSD.

---

## 🚀 Environment Setup (One-Click)

Before running Docker, prepare the host machine:

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Docker & Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install WireGuard Tools (For host-side networking)
sudo apt install -y wireguard-tools
```

---

## 📦 Docker Compose Blueprint

---

## 📦 Docker Compose Blueprint

Below is the conceptual structure of our deployment orchestrator.

```yaml
version: "3.8"

services:
  # 🧠 BRAIN: Payload CMS (Next.js 15)
  payload-cms:
    image: iwas/payload-cms:latest
    environment:
      - DATABASE_URI=mongodb://mongodb:27017/iwas
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - RADIUS_SERVER_IP=freeradius
    depends_on:
      - mongodb
    ports:
      - "3000:3000"

  # 📡 ENFORCER: FreeRADIUS
  freeradius:
    image: iwas/freeradius:latest
    volumes:
      - ./services/freeradius/config:/etc/freeradius
    ports:
      - "1812:1812/udp"
      - "1813:1813/udp"
      - "3799:3799/udp"

  # 🛡️ BRIDGE: WireGuard VPN
  wireguard:
    image: lscr.io/linuxserver/wireguard:latest
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Ho_Chi_Minh
      - SERVERURL=vpn.iwas.com
    ports:
      - "51820:51820/udp"

  # 🧊 DATA: MongoDB
  mongodb:
    image: mongo:latest
    volumes:
      - ./data/db:/data/db
```

---

## 🛠️ Deployment Steps

### Step 1: Clone & Configure

```bash
git clone https://github.com/your-org/iwas.git
cd iwas
cp .env.example .env
# Edit .env with your secrets, database URIs, and domain names
```

### Step 2: Build Images

```bash
# Build the Next.js/Payload CMS production image
docker compose build payload-cms
```

### Step 3: Launch

```bash
# Start all services in detached mode
docker compose up -d
```

### Step 4: Verify

- Access `https://admin.iwas.com` for the Dashboard.
- Access `https://wifi.iwas.com` for the Captive Portal.
- Run `docker logs freeradius` to ensure the RADIUS engine is listening for router requests.

---

## 📈 Scalability Considerations

1. **Database Scaling:** When user count exceeds 100k, migrate from Docker MongoDB to **MongoDB Atlas (Sharded Cluster)**.
2. **Horizontal Scaling:** Payload CMS is stateless (except for local storage, which should be moved to S3). You can run multiple instances of the `payload-cms` container behind a Load Balancer.
3. **RADIUS Clustering:** For high-density locations, deploy multiple FreeRADIUS instances with a shared Session Cache in Redis.

---

[← Back to Architecture](./README.md)
