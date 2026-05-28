
import express from "express";
import cors from "cors";
import { JsonRpcProvider } from "ethers";

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

async function checkRPC(rpc) {

  try {

    const provider = new JsonRpcProvider(rpc);

    const start = Date.now();

    const block = await provider.getBlockNumber();

    const network = await provider.getNetwork();

    let peerCount = 0;

    try {

      const peerHex = await provider.send("net_peerCount", []);

      peerCount = parseInt(peerHex, 16);

    } catch {}

    const latency = Date.now() - start;

    let status = "ONLINE";

    if(latency > 1000) status = "WARNING";

    if(latency > 3000) status = "SLOW";

    return {
      success:true,
      rpc,
      status,
      block,
      peerCount,
      chainId:Number(network.chainId),
      latency
    };

  } catch(err){

    return {
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

background:
radial-gradient(circle at top left,#1e1b4b 0%,#020617 40%),
#020617;

font-family:Inter,Arial;
color:white;
padding:40px;

}

.header{

display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:40px;
flex-wrap:wrap;

}

.logo{

font-size:58px;
font-weight:900;

background:linear-gradient(to right,#a855f7,#6366f1,#06b6d4);

-webkit-background-clip:text;
-webkit-text-fill-color:transparent;

letter-spacing:-2px;

}

.tag{

color:#94a3b8;
margin-top:10px;
font-size:18px;

}

.topbar{

display:flex;
gap:16px;
margin-bottom:35px;
flex-wrap:wrap;

}

input{

flex:1;
padding:20px;
border-radius:20px;
border:1px solid rgba(255,255,255,.08);

background:rgba(15,23,42,.7);

backdrop-filter:blur(20px);

color:white;

font-size:16px;

outline:none;

}

button{

padding:20px 32px;

border:none;

border-radius:20px;

background:linear-gradient(to right,#7c3aed,#2563eb);

font-weight:bold;

color:white;

cursor:pointer;

transition:.2s;

box-shadow:0 0 40px rgba(124,58,237,.4);

}

button:hover{

transform:translateY(-3px);

}

.section{

margin-bottom:35px;

}

.section-title{

font-size:22px;

margin-bottom:18px;

color:#cbd5e1;

}

.rpc-grid{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(260px,1fr));

gap:18px;

}

.rpc-card{

background:rgba(15,23,42,.6);

border:1px solid rgba(255,255,255,.08);

padding:22px;

border-radius:24px;

cursor:pointer;

transition:.2s;

backdrop-filter:blur(20px);

position:relative;

overflow:hidden;

}

.rpc-card::before{

content:'';

position:absolute;

top:0;

left:-100%;

width:100%;

height:100%;

background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);

transition:.5s;

}

.rpc-card:hover::before{

left:100%;

}

.rpc-card:hover{

transform:translateY(-5px);

border-color:#8b5cf6;

box-shadow:0 0 30px rgba(124,58,237,.25);

}

.rpc-name{

font-size:18px;

font-weight:bold;

margin-bottom:10px;

}

.rpc-url{

font-size:12px;

color:#94a3b8;

word-break:break-all;

}

.dashboard{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(220px,1fr));

gap:20px;

margin-top:30px;

}

.card{

background:rgba(15,23,42,.65);

border:1px solid rgba(255,255,255,.08);

padding:28px;

border-radius:28px;

backdrop-filter:blur(20px);

position:relative;

overflow:hidden;

}

.card::after{

content:'';

position:absolute;

width:120px;

height:120px;

background:rgba(124,58,237,.15);

border-radius:50%;

top:-40px;

right:-40px;

}

.title{

font-size:13px;

letter-spacing:1px;

color:#94a3b8;

margin-bottom:14px;

}

.value{

font-size:42px;

font-weight:800;

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

.logbox{

margin-top:35px;

background:#020617;

border:1px solid rgba(255,255,255,.08);

border-radius:28px;

padding:24px;

height:260px;

overflow:auto;

font-family:monospace;

color:#22c55e;

}

.chart{

margin-top:30px;

display:flex;

align-items:flex-end;

gap:8px;

height:160px;

}

.bar{

flex:1;

background:linear-gradient(to top,#7c3aed,#06b6d4);

border-radius:14px 14px 0 0;

animation:pulse 2s infinite;

}

@keyframes pulse{

0%{opacity:.6;}

50%{opacity:1;}

100%{opacity:.6;}

}

</style>

</head>

<body>

<div class="header">

<div>

<div class="logo">MonMetrics</div>

<div class="tag">
Advanced Monad RPC Analytics & Infrastructure Diagnostics
</div>

</div>

</div>

<div class="topbar">

<input id="rpcInput" value="https://testnet-rpc.monad.xyz">

<button onclick="runCheck()">
CHECK RPC
</button>

</div>

<div class="section">

<div class="section-title">
Monad Mainnet RPCs
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

</div>

</div>

<div class="section">

<div class="section-title">
Monad Testnet RPCs
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

</div>

</div>

<div class="dashboard">

<div class="card">
<div class="title">STATUS</div>
<div id="status" class="value offline">OFFLINE</div>
</div>

<div class="card">
<div class="title">BLOCK HEIGHT</div>
<div id="block" class="value">0</div>
</div>

<div class="card">
<div class="title">LATENCY</div>
<div id="latency" class="value">0ms</div>
</div>

<div class="card">
<div class="title">PEERS</div>
<div id="peers" class="value">0</div>
</div>

<div class="card">
<div class="title">CHAIN ID</div>
<div id="chain" class="value">0</div>
</div>

</div>

<div class="card">

<div class="title">LATENCY ANALYTICS</div>

<div class="chart">

<div class="bar" style="height:30%"></div>
<div class="bar" style="height:55%"></div>
<div class="bar" style="height:70%"></div>
<div class="bar" style="height:50%"></div>
<div class="bar" style="height:90%"></div>
<div class="bar" style="height:65%"></div>
<div class="bar" style="height:80%"></div>

</div>

</div>

<div class="logbox" id="logs"></div>

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

document.getElementById('status').className = 'value ' + data.status.toLowerCase();

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

document.getElementById('status').className = 'value offline';

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

console.log("MonMetrics Running");

});
