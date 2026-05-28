import express from "express";
import cors from "cors";
import { JsonRpcProvider } from "ethers";

const app = express();

app.use(cors());

const RPC_URL = process.env.RPC_URL || "https://testnet-rpc.monad.xyz";
const PORT = process.env.PORT || 3000;

const provider = new JsonRpcProvider(RPC_URL);

let latestData = {
  status: "unknown",
  blockNumber: 0,
  peerCount: 0,
  chainId: 0,
  latency: 0,
  uptime: 0,
  lastUpdated: null,
  errors: 0
};

const startTime = Date.now();

async function runHealthCheck() {
  try {
    const start = Date.now();

    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    const peerHex = await provider.send("net_peerCount", []);
    const peerCount = parseInt(peerHex, 16);

    const latency = Date.now() - start;

    let status = "healthy";

    if (latency > 1500) {
      status = "warning";
    }

    if (peerCount < 2) {
      status = "critical";
    }

    latestData = {
      status,
      blockNumber,
      peerCount,
      chainId: Number(network.chainId),
      latency,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      lastUpdated: new Date().toISOString(),
      errors: latestData.errors
    };

    console.log("Health Check:", latestData);

  } catch (error) {
    latestData.status = "offline";
    latestData.errors += 1;
    latestData.lastUpdated = new Date().toISOString();

    console.error("RPC ERROR:", error.message);
  }
}

setInterval(runHealthCheck, 10000);
runHealthCheck();

app.get("/api/health", (req, res) => {
  res.json(latestData);
});

app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");

  res.send(`
# HELP rpc_latency_ms RPC latency in milliseconds
# TYPE rpc_latency_ms gauge
rpc_latency_ms ${latestData.latency}

# HELP rpc_block_number Latest block number
# TYPE rpc_block_number gauge
rpc_block_number ${latestData.blockNumber}

# HELP rpc_peer_count Current peer count
# TYPE rpc_peer_count gauge
rpc_peer_count ${latestData.peerCount}

# HELP rpc_status RPC health status
# TYPE rpc_status gauge
rpc_status ${latestData.status === "healthy" ? 1 : 0}

# HELP rpc_errors_total Total RPC errors
# TYPE rpc_errors_total counter
rpc_errors_total ${latestData.errors}
`);
});

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Monad RPC Health Checker</title>

    <style>
      body {
        background: #0f172a;
        color: white;
        font-family: Arial;
        padding: 40px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .card {
        background: #111827;
        padding: 24px;
        border-radius: 20px;
        border: 1px solid #374151;
      }

      .title {
        font-size: 14px;
        color: #9ca3af;
      }

      .value {
        font-size: 32px;
        margin-top: 10px;
        font-weight: bold;
      }

      .healthy {
        color: #22c55e;
      }

      .warning {
        color: #f59e0b;
      }

      .critical,
      .offline {
        color: #ef4444;
      }
    </style>
  </head>

  <body>
    <h1>Monad RPC Health Checker</h1>

    <div class="grid">
      <div class="card">
        <div class="title">STATUS</div>
        <div id="status" class="value">Loading...</div>
      </div>

      <div class="card">
        <div class="title">BLOCK NUMBER</div>
        <div id="block" class="value">-</div>
      </div>

      <div class="card">
        <div class="title">LATENCY</div>
        <div id="latency" class="value">-</div>
      </div>

      <div class="card">
        <div class="title">PEERS</div>
        <div id="peers" class="value">-</div>
      </div>

      <div class="card">
        <div class="title">CHAIN ID</div>
        <div id="chain" class="value">-</div>
      </div>

      <div class="card">
        <div class="title">UPTIME</div>
        <div id="uptime" class="value">-</div>
      </div>
    </div>

    <script>
      async function load() {
        const res = await fetch('/api/health');
        const data = await res.json();

        const statusEl = document.getElementById('status');

        statusEl.innerText = data.status.toUpperCase();
        statusEl.className = 'value ' + data.status;

        document.getElementById('block').innerText = data.blockNumber;
        document.getElementById('latency').innerText = data.latency + ' ms';
        document.getElementById('peers').innerText = data.peerCount;
        document.getElementById('chain').innerText = data.chainId;
        document.getElementById('uptime').innerText = data.uptime + ' sec';
      }

      load();
      setInterval(load, 5000);
    </script>
  </body>
  </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Monad RPC checker running on port ${PORT}`);
});
