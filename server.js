
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
radial-gradient(circle at top left,#312e81 0%,#020617 40%),
#020617;

color:white;

padding:24px;

}

.container{

max-width:1600px;

margin:auto;

}

.logo{

font-size:58px;

font-weight:900;

letter-spacing:-2px;

margin-bottom:8px;

background:linear-gradient(to right,#c084fc,#6366f1,#06b6d4);

-webkit-background-clip:text;

-webkit-text-fill-color:transparent;

}

.subtitle{

color:#94a3b8;

margin-bottom:28px;

font-size:16px;

}

.search{

display:flex;

gap:14px;

margin-bottom:32px;

flex-wrap:wrap;

}

input{

flex:1;

padding:18px;

border-radius:20px;

background:rgba(15,23,42,.75);

border:1px solid rgba(255,255,255,.08);

color:white;

font-size:15px;

}

button{

padding:18px 28px;

border:none;

border-radius:20px;

background:linear-gradient(to right,#7c3aed,#2563eb);

font-weight:800;

color:white;

cursor:pointer;

}

.stats{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(190px,1fr));

gap:18px;

margin-bottom:26px;

}

.card{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

padding:24px;

border-radius:24px;

position:relative;

overflow:hidden;

min-height:120px;

}

.card::after{

content:'';

position:absolute;

width:110px;

height:110px;

background:rgba(124,58,237,.16);

border-radius:50%;

top:-55px;

right:-55px;

}

.card-title{

font-size:12px;

color:#94a3b8;

margin-bottom:12px;

letter-spacing:1px;

}

.card-value{

font-size:34px;

font-weight:800;

}

.online{

color:#22c55e;

}

.analytics{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

border-radius:28px;

padding:24px;

margin-bottom:28px;

}

.analytics-title{

font-size:20px;

margin-bottom:18px;

}

.chart{

height:160px;

display:flex;

align-items:flex-end;

gap:10px;

}

.bar{

flex:1;

border-radius:12px 12px 0 0;

background:linear-gradient(to top,#7c3aed,#06b6d4);

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

}

.rpc-grid{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(240px,1fr));

gap:16px;

margin-top:30px;

}

.rpc-card{

background:rgba(15,23,42,.72);

border:1px solid rgba(255,255,255,.06);

padding:20px;

border-radius:22px;

cursor:pointer;

}

.rpc-card:hover{

border-color:#8b5cf6;

}

.rpc-name{

font-size:17px;

font-weight:700;

margin-bottom:8px;

}

.rpc-url{

font-size:12px;

color:#94a3b8;

word-break:break-all;

}

.section-title{

font-size:22px;

margin:34px 0 18px;

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
<div class="card-title">BLOCK</div>
<div id="block" class="card-value">0</div>
</div>

<div class="card">
<div class="card-title">LATENCY</div>
<div id="latency" class="card-value">0ms</div>
</div>

<div class="card">
<div class="card-title">PEERS</div>
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

<div class="bar" style="height:28%"></div>
<div class="bar" style="height:55%"></div>
<div class="bar" style="height:70%"></div>
<div class="bar" style="height:45%"></div>
<div class="bar" style="height:88%"></div>
<div class="bar" style="height:65%"></div>
<div class="bar" style="height:80%"></div>

</div>

</div>

<div class="logs" id="logs"></div>

<div class="section-title">
Monad RPC Providers
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
<div class="rpc-name">Tenderly</div>
<div class="rpc-url">https://monad.gateway.tenderly.co/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://143.rpc.thirdweb.com/')">
<div class="rpc-name">Thirdweb</div>
<div class="rpc-url">https://143.rpc.thirdweb.com/</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://rpc.ankr.com/monad_testnet')">
<div class="rpc-name">Ankr Testnet</div>
<div class="rpc-url">https://rpc.ankr.com/monad_testnet</div>
</div>

<div class="rpc-card" onclick="selectRPC('https://monad-testnet.drpc.org/')">
<div class="rpc-name">dRPC Testnet</div>
<div class="rpc-url">https://monad-testnet.drpc.org/</div>
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
log('Block: ' + data.block);

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

console.log("MonMetrics Compact Running");

});
