
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

    let status = "ONLINE";

    if(latency > 1200) status = "WARNING";

    if(latency > 3000) status = "SLOW";

    return{
      success:true,
      status,
      block,
      latency,
      peerCount,
      chainId:Number(network.chainId)
    };

  }catch(err){

    return{
      success:false,
      status:"OFFLINE",
      error:err.message
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
radial-gradient(circle at top left,#312e81 0%,#020617 40%),
#020617;

color:white;

padding:32px;

overflow-x:hidden;

}

.container{

max-width:1700px;

margin:auto;

}

.header{

margin-bottom:38px;

}

.logo{

font-size:72px;

font-weight:900;

letter-spacing:-3px;

background:linear-gradient(to right,#c084fc,#6366f1,#06b6d4);

-webkit-background-clip:text;

-webkit-text-fill-color:transparent;

}

.subtitle{

margin-top:12px;

color:#94a3b8;

font-size:18px;

}

.search{

display:flex;

gap:18px;

margin-bottom:40px;

flex-wrap:wrap;

}

.search input{

flex:1;

min-width:280px;

padding:22px;

border-radius:24px;

background:rgba(15,23,42,.75);

border:1px solid rgba(255,255,255,.08);

backdrop-filter:blur(20px);

color:white;

font-size:16px;

outline:none;

}

.search button{

padding:22px 34px;

border:none;

border-radius:24px;

background:linear-gradient(to right,#7c3aed,#2563eb);

font-weight:800;

color:white;

cursor:pointer;

box-shadow:0 0 40px rgba(124,58,237,.4);

transition:.2s;

}

.search button:hover{

transform:translateY(-3px);

}

.section{

margin-bottom:45px;

}

.section-title{

font-size:24px;

margin-bottom:22px;

color:#e2e8f0;

}

.rpc-grid{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(300px,1fr));

gap:22px;

}

.rpc-card{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.07);

border-radius:30px;

padding:26px;

cursor:pointer;

position:relative;

overflow:hidden;

transition:.25s;

backdrop-filter:blur(20px);

}

.rpc-card::before{

content:'';

position:absolute;

width:180px;

height:180px;

background:rgba(124,58,237,.18);

border-radius:50%;

top:-70px;

right:-70px;

}

.rpc-card:hover{

transform:translateY(-6px);

border-color:#8b5cf6;

box-shadow:0 0 45px rgba(124,58,237,.25);

}

.rpc-name{

font-size:20px;

font-weight:700;

margin-bottom:12px;

}

.rpc-url{

font-size:13px;

color:#94a3b8;

word-break:break-all;

line-height:1.6;

}

.stats{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(240px,1fr));

gap:24px;

margin-top:20px;

margin-bottom:40px;

}

.card{

background:rgba(15,23,42,.75);

border:1px solid rgba(255,255,255,.07);

padding:34px;

border-radius:32px;

position:relative;

overflow:hidden;

backdrop-filter:blur(20px);

min-height:170px;

}

.card::after{

content:'';

position:absolute;

width:180px;

height:180px;

background:rgba(124,58,237,.18);

border-radius:50%;

top:-90px;

right:-90px;

}

.card-title{

font-size:13px;

letter-spacing:1px;

color:#94a3b8;

margin-bottom:20px;

}

.card-value{

font-size:52px;

font-weight:900;

}

.online{

color:#22c55e;

text-shadow:0 0 20px rgba(34,197,94,.6);

}

.warning,.slow{

color:#f59e0b;

}

.offline{

color:#ef4444;

}

.analytics{

background:rgba(15,23,42,.75);

border:1px solid rgba(255,255,255,.07);

border-radius:34px;

padding:34px;

margin-bottom:40px;

}

.chart{

height:260px;

display:flex;

align-items:flex-end;

gap:16px;

margin-top:34px;

}

.bar{

flex:1;

border-radius:18px 18px 0 0;

background:linear-gradient(to top,#7c3aed,#06b6d4);

animation:pulse 2.5s infinite;

}

@keyframes pulse{

0%{opacity:.65;}

50%{opacity:1;}

100%{opacity:.65;}

}

.logs{

background:#010817;

border:1px solid rgba(255,255,255,.08);

border-radius:34px;

padding:30px;

height:340px;

overflow:auto;

font-family:monospace;

font-size:15px;

color:#22c55e;

line-height:1.7;

}

@media(max-width:768px){

.logo{

font-size:48px;

}

.card-value{

font-size:42px;

}

.chart{

height:180px;

gap:10px;

}

}

</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="logo">MonMetrics</div>

<div class="subtitle">
Ultimate Monad RPC Infrastructure Diagnostics Platform
</div>

</div>

<div class="search">

<input id="rpcInput" value="https://testnet-rpc.monad.xyz">

<button onclick="runCheck()">
CHECK RPC
</button>

</div>

<div class="section">

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

</div>

<div class="section">

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

<div class="stats">

<div class="card">
<div class="card-title">STATUS</div>
<div id="status" class="card-value offline">OFFLINE</div>
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

<div class="section-title">
Latency Analytics
</div>

<div class="chart">

<div class="bar" style="height:28%"></div>
<div class="bar" style="height:55%"></div>
<div class="bar" style="height:70%"></div>
<div class="bar" style="height:48%"></div>
<div class="bar" style="height:90%"></div>
<div class="bar" style="height:62%"></div>
<div class="bar" style="height:82%"></div>

</div>

</div>

<div class="logs" id="logs"></div>

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

log('Checking RPC endpoint...');

try{

const res = await fetch('/api/check?rpc=' + encodeURIComponent(rpc));

const data = await res.json();

if(data.success){

document.getElementById('status').innerText = data.status;

document.getElementById('status').className = 'card-value ' + data.status.toLowerCase();

document.getElementById('block').innerText = data.block;

document.getElementById('latency').innerText = data.latency + 'ms';

document.getElementById('peers').innerText = data.peerCount;

document.getElementById('chain').innerText = data.chainId;

log('RPC ONLINE');
log('Latency: ' + data.latency + 'ms');
log('Block Height: ' + data.block);
log('Peer Count: ' + data.peerCount);

}else{

document.getElementById('status').innerText = 'OFFLINE';

document.getElementById('status').className = 'card-value offline';

log('RPC OFFLINE');

}

}catch(err){

log('Error: ' + err.message);

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

console.log("MonMetrics Ultimate Running");

});
