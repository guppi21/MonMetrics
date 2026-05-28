# MonMetrics

Advanced Monad RPC Infrastructure Diagnostics Platform

---

## Overview

MonMetrics is a real-time RPC diagnostics and infrastructure analytics dashboard built for the Monad ecosystem.

The platform monitors Monad-compatible RPC endpoints and provides live analytics for:
- RPC health
- latency
- block height
- peer count
- chain ID
- endpoint availability

MonMetrics helps developers, validators, node operators, and infrastructure providers benchmark and monitor RPC performance across Monad mainnet and testnet.

---

# Features

- Real-time RPC health checks
- Monad Mainnet RPC support
- Monad Testnet RPC support
- RPC benchmarking
- Latency analytics
- Live infrastructure logs
- Peer count monitoring
- Chain ID verification
- Modern infrastructure dashboard UI
- Responsive design

---

# How It Works

MonMetrics sends live EVM-compatible JSON-RPC requests to Monad RPC endpoints.

The platform performs checks using methods like:

```json
eth_blockNumber
net_peerCount
eth_chainId
```

The response data is analyzed and displayed in a real-time diagnostics dashboard.

Metrics collected include:
- Block height
- RPC response speed
- Peer count
- Endpoint availability
- Network verification

---

# Tech Stack

## Frontend
- HTML
- CSS
- JavaScript

## Backend
- Node.js
- Express.js
- ethers.js

---

# Installation

## Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
```

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
npm start
```

---

# Open Dashboard

```bash
http://localhost:3000
```

---

# RPC Providers Included

## Mainnet
- Official Monad RPC
- dRPC
- Tenderly
- Thirdweb
- Alchemy
- Ankr
- BlockEden
- PublicNode

## Testnet
- Official Monad Testnet
- dRPC Testnet
- Ankr Testnet
- MonadInfra
- OnFinality
- MonadExplorer
- MonadLabs
- PublicNode

---

# Use Cases

MonMetrics can be used for:

- Infrastructure monitoring
- RPC benchmarking
- Validator diagnostics
- Node health checks
- Developer debugging
- Endpoint testing
- Network monitoring

---

# Future Improvements

Planned upgrades:
- WebSocket diagnostics
- Historical charts
- Geo latency benchmarking
- Multi-RPC comparison
- AI anomaly detection
- Telegram alerts
- Discord alerts
- Public uptime leaderboard

---

# License

MIT License

---

# MonMetrics

Built for the Monad ecosystem.
