
import express from "express";
import cors from "cors";
import { JsonRpcProvider } from "ethers";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

async function checkRPC(rpc){

  try{

    const provider = new JsonRpcProvider(rpc);

    const start = Date.now();

    const block = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    let peerCount = 0;

    try{
      const peerHex = await provider.send("net_peerCount", []);
      peerCount = parseInt(peerHex,16);
    }catch{}

    const latency = Date.now() - start;

    return{
      success:true,
      status:"ONLINE",
      block,
      latency,
      peerCount,
      chainId:Number(network.chainId)
    };

  }catch(err){

    return{
      success:false,
      status:"OFFLINE"
    };

  }

}

app.get("/api/check", async(req,res)=>{

  const rpc = req.query.rpc;

  const data = await checkRPC(rpc);

  res.json(data);

});

app.get("/",(req,res)=>{

res.send(`

<!DOCTYPE html>
<html>
<head>

<title>MonMetrics</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{

font-family:Inter,Arial;

background:
radial-gradient(circle at top left,#312e81 0%,#020617 38%),
#020617;

color:white;

padding:26px;

}

.container{

max-width:1700px;

margin:auto;

}

.logo{

font-size:64px;

font-weight:900;

letter-spacing:-3px;

background:linear-gradient(to right,#c084fc,#6366f1,#06b6d4);

-webkit-background-clip:text;

-webkit-text-fill-color:transparent;

margin-bottom:8px;

}

.subtitle{

color:#94a3b8;

margin-bottom:28px;

font-size:16px;

}

.search{

display:flex;

gap:14px;

margin-bottom:36px;

flex-wrap:wrap;

}

.search input{

flex:1;

padding:18px;

border-radius:22px;

background:rgba(15,23,42,.75);

border:1px solid rgba(255,255,255,.08);

backdrop-filter:blur(20px);

color:white;

font-size:15px;

}

.search button{

padding:18px 30px;

border:none;

border-radius:22px;

background:linear-gradient(to right,#7c3aed,#2563eb);

color:white;

font-weight:800;

cursor:pointer;

box-shadow:0 0 30px rgba(124,58,237,.35);

}

.stats{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(180px,1fr));

gap:16px;

margin-bottom:24px;

}

.card{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

padding:22px;

border-radius:26px;

position:relative;

overflow:hidden;

min-height:110px;

}

.card::after{

content:'';

position:absolute;

width:100px;

height:100px;

background:rgba(124,58,237,.18);

border-radius:50%;

top:-50px;

right:-50px;

}

.card-title{

font-size:12px;

letter-spacing:1px;

color:#94a3b8;

margin-bottom:10px;

}

.card-value{

font-size:30px;

font-weight:900;

}

.online{

color:#22c55e;

text-shadow:0 0 18px rgba(34,197,94,.5);

}

.analytics{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

padding:24px;

border-radius:28px;

margin-bottom:28px;

}

.analytics-title{

font-size:18px;

margin-bottom:18px;

}

.chart{

height:140px;

display:flex;

align-items:flex-end;

gap:10px;

}

.bar{

flex:1;

border-radius:12px 12px 0 0;

background:linear-gradient(to top,#7c3aed,#06b6d4);

opacity:.9;

}

.logs{

background:#010817;

border:1px solid rgba(255,255,255,.06);

border-radius:24px;

padding:20px;

height:220px;

overflow:auto;

font-family:monospace;

font-size:13px;

color:#22c55e;

line-height:1.6;

margin-bottom:34px;

}

.section-title{

font-size:22px;

margin-bottom:20px;

margin-top:30px;

}

.rpc-grid{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(260px,1fr));

gap:18px;

}

.rpc-card{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

padding:22px;

border-radius:24px;

cursor:pointer;

transition:.2s;

position:relative;

overflow:hidden;

}

.rpc-card:hover{

transform:translateY(-4px);

border-color:#8b5cf6;

box-shadow:0 0 35px rgba(124,58,237,.18);

}

.rpc-name{

font-size:17px;

font-weight:700;

margin-bottom:10px;

}

.rpc-url{

font-size:12px;

line-height:1.6;

color:#94a3b8;

word-break:break-all;

}

</style>

</head>

<body>

<div class="container">

<div class="logo">MonMetrics</div>

<div class="subtitle">
Advanced Monad RPC Infrastructure Diagnostics
</div>

<div class="search">

<input id="rpcInput" value="https://testnet-rpc.monad.xyz">

<button onclick="runCheck()">
CHECK RPC
</button>

</div>

<div class="stats">

<div class="card">
<div class="card-title">STATUS</div>
<div id="status" class="card-value online">ONLINE</div>
</div>

<div class="card">
<div class="card-title">BLOCK HEIGHT</div>
<div id="block" class="card-value">0</div>
</div>

<div class="card">
<div class="card-title">LATENCY</div>
<div id="latency" class="card-value">0ms</div>
</div>

<div class="card">
<div class="card-title">PEER COUNT</div>
<div id="peers" class="card-value">0</div>
</div>

<div class="card">
<div class="card-title">CHAIN ID</div>
<div id="chain" class="card-value">0</div>
</div>

</div>

<div class="analytics">

<div class="analytics-title">
Latency Analytics
</div>

<div class="chart">

<div class="bar" style="height:22%"></div>
<div class="bar" style="height:45%"></div>
<div class="bar" style="height:60%"></div>
<div class="bar" style="height:40%"></div>
<div class="bar" style="height:82%"></div>
<div class="bar" style="height:56%"></div>
<div class="bar" style="height:74%"></div>

</div>

</div>

<div class="logs" id="logs"></div>

<div class="section-title">
Monad Mainnet RPC Providers
</div>

<div class="rpc-grid">

<div class="rpc-card" onclick="selectRPC('https://rpc.monad.xyz/')">
<div class="rpc-name">Official Mainnet</div>
<div class="rpc-url">https://rpc.monad.xyz/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad-mainnet.drpc.org/')">
<div class="rpc-name">dRPC Mainnet</div>
<div class="rpc-url">https://monad-mainnet.drpc.org/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad.gateway.tenderly.co/')">
<div class="rpc-name">Tenderly Mainnet</div>
<div class="rpc-url">https://monad.gateway.tenderly.co/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://143.rpc.thirdweb.com/')">
<div class="rpc-name">Thirdweb Mainnet</div>
<div class="rpc-url">https://143.rpc.thirdweb.com/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc1.monad.xyz/')">
<div class="rpc-name">Alchemy Mainnet</div>
<div class="rpc-url">https://rpc1.monad.xyz/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc3.monad.xyz/')">
<div class="rpc-name">Ankr Mainnet</div>
<div class="rpc-url">https://rpc3.monad.xyz/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc.blockeden.xyz/monad/')">
<div class="rpc-name">BlockEden Mainnet</div>
<div class="rpc-url">https://rpc.blockeden.xyz/monad/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad.publicnode.com/')">
<div class="rpc-name">PublicNode Mainnet</div>
<div class="rpc-url">https://monad.publicnode.com/</div>
</div>

</div>

<div class="section-title">
Monad Testnet RPC Providers
</div>

<div class="rpc-grid">

<div class="rpc-card" onclick="selectRPC('https://testnet-rpc.monad.xyz/')">
<div class="rpc-name">Official Testnet</div>
<div class="rpc-url">https://testnet-rpc.monad.xyz/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc.ankr.com/monad_testnet')">
<div class="rpc-name">Ankr Testnet</div>
<div class="rpc-url">https://rpc.ankr.com/monad_testnet</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad-testnet.drpc.org/')">
<div class="rpc-name">dRPC Testnet</div>
<div class="rpc-url">https://monad-testnet.drpc.org/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc-testnet.monadinfra.com/')">
<div class="rpc-name">MonadInfra Testnet</div>
<div class="rpc-url">https://rpc-testnet.monadinfra.com/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad-testnet.api.onfinality.io/public')">
<div class="rpc-name">OnFinality Testnet</div>
<div class="rpc-url">https://monad-testnet.api.onfinality.io/public</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://testnet-rpc.monadexplorer.com/')">
<div class="rpc-name">MonadExplorer Testnet</div>
<div class="rpc-url">https://testnet-rpc.monadexplorer.com/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc-testnet.monadlabs.xyz/')">
<div class="rpc-name">MonadLabs Testnet</div>
<div class="rpc-url">https://rpc-testnet.monadlabs.xyz/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad-testnet.publicnode.com/')">
<div class="rpc-name">PublicNode Testnet</div>
<div class="rpc-url">https://monad-testnet.publicnode.com/</div>
</div>

</div>

</div>

<script>

function selectRPC(rpc){

document.getElementById('rpcInput').value = rpc;

runCheck();

}

function log(msg){

const logs = document.getElementById('logs');

logs.innerHTML += '[' + new Date().toLocaleTimeString() + '] ' + msg + '<br>';

logs.scrollTop = logs.scrollHeight;

}

async function runCheck(){

const rpc = document.getElementById('rpcInput').value;

try{

const res = await fetch('/api/check?rpc=' + encodeURIComponent(rpc));

const data = await res.json();

if(data.success){

document.getElementById('status').innerText = data.status;
document.getElementById('block').innerText = data.block;
document.getElementById('latency').innerText = data.latency + 'ms';
document.getElementById('peers').innerText = data.peerCount;
document.getElementById('chain').innerText = data.chainId;

log('RPC ONLINE');
log('Latency: ' + data.latency + 'ms');
log('Block Height: ' + data.block);

}else{

document.getElementById('status').innerText = 'OFFLINE';

}

}catch(err){

log('Error');

}

}

runCheck();

setInterval(runCheck,10000);

</script>

</body>
</html>

`);

});

app.listen(PORT,()=>{

console.log("MonMetrics Fixed Running");

});
