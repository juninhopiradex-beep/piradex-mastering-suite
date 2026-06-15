/* ═══════════════════════════════════════════════════════════════════════════
   MASTERING SUITE by Piradex — STUDIO PRO (15 features)
   Módulo separado. Reutiliza globais de app.js: audioCtx, audioBuffer,
   masterGain, analyserNode, eq nodes, kvals, setStatus, makeShapeCurve, etc.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

// ---- helpers de UI (mesma paleta da app) ----
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function $(id){ return document.getElementById(id); }
function status(m){ if(typeof setStatus==='function') setStatus(m); }
function hasAudio(){ if(typeof audioBuffer==='undefined'||!audioBuffer){ status('Carrega uma música primeiro'); return false;} return true; }

const FX = [
  {id:'codec',    name:'Codec Social',        sub:'Como vai soar no WhatsApp / TikTok', c:'var(--c4)'},
  {id:'monitor',  name:'Monitor Local',       sub:'Candongueiro, festa, telemóvel...', c:'var(--c6)'},
  {id:'room',     name:'Calibração de Sala',  sub:'Compensa o teu quarto via microfone', c:'var(--c5)'},
  {id:'stems',    name:'Stems por Bandas',    sub:'Ajusta sub/médios/agudos do stereo', c:'var(--c2)'},
  {id:'nl',       name:'Comando por Texto',   sub:'"mais quente tipo Semba antigo"', c:'var(--c5)'},
  {id:'snippet',  name:'Snippet Viral',       sub:'Corta o refrão p/ TikTok', c:'var(--c1)'},
  {id:'cert',     name:'Certificado',         sub:'Relatório partilhável do master', c:'var(--c4)'},
  {id:'print',    name:'Piradex Print',       sub:'A tua assinatura de masterização', c:'var(--c3)'},
  {id:'mentor',   name:'Modo Mentor',         sub:'Explica o porquê de cada ajuste', c:'var(--c5)'},
  {id:'dynloud',  name:'Loudness Dinâmico',   sub:'Segue a emoção da música', c:'var(--c2)'},
  {id:'reverse',  name:'Reverse Mastering',   sub:'Notas para a mistura', c:'var(--c5)'},
  {id:'forensic', name:'Source Forensics',    sub:'Raio-X do ficheiro importado', c:'var(--c2)'},
  {id:'album',    name:'Album Cohesion',      sub:'Coesão de loudness no álbum', c:'var(--c4)'},
  {id:'shootout', name:'Blind Shootout',      sub:'Teste cego com loudness igualado', c:'var(--c3)'},
  {id:'client',   name:'Client Review Room',  sub:'Aprovação do cliente ao vivo', c:'var(--c6)'},
  // ── MOONSHOT (visão de produto) ──
  {id:'copilot',  name:'Copiloto ✦',          sub:'O teu parceiro de estúdio (conversa)', c:'var(--c5)'},
  {id:'heatmap',  name:'Heat Map Emocional ✦',sub:'A forma sentimental da música', c:'var(--c1)'},
  {id:'future',   name:'O Teu Eu de 1 Ano ✦', sub:'A/B com a tua evolução prevista', c:'var(--c6)'},
  {id:'vibe',     name:'Intenção Cultural ✦', sub:'"kizombada em Luanda às 2h"', c:'var(--c3)'},
  {id:'skiprisk', name:'Skip-Risk Score ✦',   sub:'Prende o ouvinte nos 1ºs 8s', c:'var(--c2)'},
  {id:'twin',     name:'Gémeo do Ouvinte ✦',  sub:'Como personas reais te ouvem', c:'var(--c6)'},
  {id:'capsule',  name:'Time Capsule ✦',      sub:'A tua evolução guardada', c:'var(--c4)'},
  {id:'comaster', name:'Co-Master ao Vivo ✦', sub:'Dois produtores, tempo real', c:'var(--c5)'},
  {id:'hitdna',   name:'Porque o Hit é Hit ✦',sub:'Engenharia reversa do viral', c:'var(--c3)'},
  {id:'adaptive', name:'Auto-Adaptação ✦',    sub:'1 ficheiro, infinitos destinos', c:'var(--c2)'},
];

window.fxRenderHub = function(){
  const c=$('fx-content'); if(!c) return;
  $('fx-back').style.display='none';
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px;">';
  FX.forEach(f=>{
    h+=`<div onclick="fxOpen('${f.id}')" style="cursor:pointer;background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${f.c};border-radius:8px;padding:12px 14px;transition:all .15s;"
      onmouseover="this.style.background='var(--bg4,#1c1c2a)';this.style.borderColor='${f.c}'"
      onmouseout="this.style.background='var(--bg3)';this.style.borderColor='var(--border)';this.style.borderLeftColor='${f.c}'">
      <div style="font-family:'Rajdhani';font-weight:700;font-size:13px;color:${f.c};letter-spacing:.5px;">${f.name}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:3px;line-height:1.3;">${f.sub}</div>
    </div>`;
  });
  h+='</div>';
  h+='<div style="font-size:10px;color:var(--muted2);margin-top:14px;line-height:1.5;">Algumas funções (separação real por IA, sincronização entre dispositivos, comando por IA na nuvem) ficam ainda mais poderosas quando ligadas ao servidor da BeatFreak Studio. Aqui correm em versão local no browser.</div>';
  c.innerHTML=h;
};

window.fxOpen = function(id){
  const c=$('fx-content'); if(!c) return;
  $('fx-back').style.display='block';
  const f=FX.find(x=>x.id===id);
  c.innerHTML=`<div style="font-family:'Rajdhani';font-weight:700;font-size:15px;color:${f.c};letter-spacing:.5px;margin-bottom:2px;">${f.name}</div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:14px;">${f.sub}</div>
    <div id="fx-body"></div>`;
  const body=$('fx-body');
  const fn=window['fxView_'+id];
  if(fn) fn(body); else body.innerHTML='<div style="color:var(--muted)">Em breve.</div>';
};

// shared small UI builders
function btn(label,color,onclick,full){
  return `<button onclick="${onclick}" style="${full?'width:100%;':''}padding:9px 16px;border-radius:6px;border:1px solid ${color};background:color-mix(in srgb, ${color} 14%, transparent);color:${color};font-family:'Rajdhani';font-weight:700;font-size:11px;letter-spacing:1px;cursor:pointer;margin-top:6px;">${label}</button>`;
}
function chipRow(items, onclick, accent){ // items: [{v,label,active}]
  return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;">'+items.map(it=>
    `<button onclick="${onclick}('${it.v}')" data-fxchip="${it.v}" style="padding:7px 14px;border-radius:6px;border:1px solid ${it.active?accent:'var(--border2)'};background:${it.active?'color-mix(in srgb,'+accent+' 16%,transparent)':'var(--bg3)'};color:${it.active?accent:'var(--muted)'};font-family:'Rajdhani';font-size:11px;cursor:pointer;">${it.label}</button>`
  ).join('')+'</div>';
}
function card(inner,accent){ return `<div style="background:var(--bg3);border:1px solid var(--border);${accent?'border-left:3px solid '+accent+';':''}border-radius:8px;padding:12px 14px;margin-top:8px;">${inner}</div>`; }
function canvasEl(id,h){ return `<canvas id="${id}" height="${h}" style="width:100%;height:${h}px;display:block;border-radius:6px;background:#07070e;border:1px solid var(--border);margin-top:8px;"></canvas>`; }

// ── measurement reuse (fallback if app's _measureBuffer absent) ──
function measure(buf){
  if(typeof _measureBuffer==='function') return _measureBuffer(buf);
  // minimal fallback
  const d=buf.getChannelData(0); let pk=0,s=0;
  for(let i=0;i<d.length;i++){pk=Math.max(pk,Math.abs(d[i]));s+=d[i]*d[i];}
  const rms=Math.sqrt(s/d.length);
  return {lufs:20*Math.log10(rms)-0.691,peak:20*Math.log10(pk),tp:20*Math.log10(pk),rms:20*Math.log10(rms),crest:0,plr:0,lra:0,low:33,mid:33,high:33,corr:1,spec:new Float32Array(64),timeline:[]};
}

// offline render of processed master (reuse app's if present)
async function renderProcessed(){
  if(typeof _renderProcessedForAnalysis==='function') return await _renderProcessedForAnalysis();
  return audioBuffer;
}

function logFx(f,W){ return Math.log10(f/20)/Math.log10(20000/20)*W; }
function drawSpec(ctx,spec,W,H,col,fill){
  if(!spec||!spec.length) return;
  const NB=spec.length; ctx.beginPath();
  for(let i=0;i<NB;i++){const f=20*Math.pow(20000/20,i/(NB-1));const x=logFx(f,W);const y=(H-12)-spec[i]*(H-20);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
  ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
  if(fill){ctx.lineTo(W,H-12);ctx.lineTo(0,H-12);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
}
function gridFreq(ctx,W,H){
  ['60','250','1k','4k','16k'].forEach((l,i)=>{const x=i/4*W;ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-12);ctx.stroke();ctx.fillStyle='rgba(255,255,255,0.27)';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(l,x,H-2);});
}

// expose a few internals to other feature files within this IIFE
window.__fx = {el,$,status,hasAudio,btn,chipRow,card,canvasEl,measure,renderProcessed,logFx,drawSpec,gridFreq};

})();

/* ═══════════ STUDIO PRO — VIEWS (features 1-15) ═══════════ */
(function(){
'use strict';
const {btn,card,chipRow,canvasEl,measure,renderProcessed,drawSpec,gridFreq}=window.__fx;
const $=window.__fx.$, status=window.__fx.status, hasAudio=window.__fx.hasAudio;

// estado partilhado
let _fxMonitorNode=null, _fxMonitorOn=false;
let _fxCodecBuf=null;

// ---------- helper: buffer -> WAV blob ----------
function bufToWav(buf){
  const nCh=buf.numberOfChannels, len=buf.length, sr=buf.sampleRate;
  const ab=new ArrayBuffer(44+len*nCh*2), v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nCh,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*nCh*2,true);v.setUint16(32,nCh*2,true);
  v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,len*nCh*2,true);
  let o=44; for(let i=0;i<len;i++){for(let c=0;c<nCh;c++){let s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));v.setInt16(o,s<0?s*0x8000:s*0x7FFF,true);o+=2;}}
  return new Blob([ab],{type:'audio/wav'});
}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}

// ════════ 1. CODEC SOCIAL ════════
const CODECS={
  whatsapp:{hp:120,lp:9000,squash:0.6,label:'WhatsApp'},
  tiktok:{hp:60,lp:15000,squash:0.4,label:'TikTok'},
  instagram:{hp:50,lp:16000,squash:0.35,label:'Instagram'},
  youtube:{hp:30,lp:18000,squash:0.2,label:'YouTube'},
  original:{hp:10,lp:20000,squash:0,label:'Original'},
};
let _codecSel='whatsapp';
window.fxView_codec=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Simula a recompressão de cada plataforma e ouve o resultado <b>antes de publicar</b>.</div>
  <div style="font-size:10px;color:var(--muted2);">PLATAFORMA</div>
  ${chipRow(Object.keys(CODECS).map(k=>({v:k,label:CODECS[k].label,active:k===_codecSel})),'fxCodecSel','var(--c4)')}
  ${canvasEl('fx-codec-cv',150)}
  <div style="display:flex;gap:14px;font-size:9px;color:var(--muted2);margin-top:6px;">
    <span><span style="display:inline-block;width:12px;height:2px;background:var(--c5);vertical-align:middle;"></span> master original</span>
    <span><span style="display:inline-block;width:12px;height:2px;background:var(--c2);vertical-align:middle;"></span> depois do codec</span>
  </div>
  <div id="fx-codec-warn"></div>
  <div style="display:flex;gap:8px;">
    ${btn('▶ OUVIR ORIGINAL','var(--c5)','fxCodecPlay(0)')}
    ${btn('▶ OUVIR PÓS-CODEC','var(--c2)','fxCodecPlay(1)')}
  </div>`;
  fxCodecAnalyse();
};
window.fxCodecSel=function(v){_codecSel=v;fxOpen('codec');};
async function fxCodecAnalyse(){
  if(!hasAudio())return;
  const proc=await renderProcessed();
  const co=CODECS[_codecSel];
  // render codec-degraded version offline
  const off=new OfflineAudioContext(proc.numberOfChannels,proc.length,proc.sampleRate);
  const src=off.createBufferSource();src.buffer=proc;
  const hp=off.createBiquadFilter();hp.type='highpass';hp.frequency.value=co.hp;
  const lp=off.createBiquadFilter();lp.type='lowpass';lp.frequency.value=co.lp;
  const comp=off.createDynamicsCompressor();comp.threshold.value=-24*co.squash-3;comp.ratio.value=2+co.squash*6;comp.attack.value=0.003;comp.release.value=0.1;
  src.connect(hp);hp.connect(lp);lp.connect(comp);comp.connect(off.destination);src.start();
  const deg=await off.startRendering();
  _fxCodecBuf={orig:proc,deg:deg};
  const mo=measure(proc), md=measure(deg);
  // draw
  const cv=$('fx-codec-cv');if(cv){const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');
    ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);gridFreq(ctx,W,H);
    drawSpec(ctx,mo.spec,W,H,'var(--c5)'.replace('var(--c5)','#2dd4ff'),'rgba(45,212,255,0.10)');
    drawSpec(ctx,md.spec,W,H,'#ff6b35',null);
  }
  const hiLoss=Math.max(0,(mo.high-md.high)).toFixed(1);
  const warn=$('fx-codec-warn');
  if(warn) warn.innerHTML=card(`<b style="color:var(--c2)">AVISO</b><br><span style="font-size:12px;color:var(--text)">Nesta plataforma perdes energia de agudos (~${hiLoss}% do balanço) e o grave abaixo de ${co.hp} Hz é cortado. LUFS após normalização ≈ -14.</span>`,'var(--c2)');
}
window.fxCodecPlay=function(which){
  if(!_fxCodecBuf){status('Analisa primeiro');return;}
  if(typeof audioCtx==='undefined'||!audioCtx)return;
  try{ if(window._fxPrev){window._fxPrev.stop();} }catch(e){}
  const s=audioCtx.createBufferSource();s.buffer=which?_fxCodecBuf.deg:_fxCodecBuf.orig;
  s.connect(audioCtx.destination);s.start();window._fxPrev=s;
  status(which?('A tocar pós-'+CODECS[_codecSel].label):'A tocar master original');
};

// ════════ 2. MONITOR LOCAL ════════
const SPEAKERS={
  candongueiro:{label:'Candongueiro',bands:[[120,-12,1],[400,4,1.2],[1500,5,1.4],[5000,-6,1],[9000,-18,0.8]],mono:true},
  festa:{label:'Coluna de Festa',bands:[[60,3,0.8],[200,2,1],[3000,3,1.2],[12000,-3,0.9]],mono:false},
  telemovel:{label:'Telemóvel',bands:[[200,-18,1],[800,3,1.2],[2500,6,1.3],[6000,2,1],[10000,-12,0.9]],mono:true},
  earbuds:{label:'Earbuds',bands:[[80,-3,1],[3000,2,1.1],[8000,3,1]],mono:false},
  carro:{label:'Carro',bands:[[80,5,0.8],[500,-3,1],[2000,2,1.2],[10000,-2,1]],mono:false},
  estudio:{label:'Estúdio (flat)',bands:[],mono:false},
};
let _spkSel='candongueiro';
window.fxView_monitor=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Ouve a tua mistura como o teu público ouve. É só monitorização — <b>não afeta a exportação</b>.</div>
  <div style="font-size:10px;color:var(--muted2);">SISTEMA DE REPRODUÇÃO</div>
  ${chipRow(Object.keys(SPEAKERS).map(k=>({v:k,label:SPEAKERS[k].label,active:k===_spkSel})),'fxSpkSel','var(--c6)')}
  ${canvasEl('fx-spk-cv',140)}
  <div id="fx-spk-state" style="font-size:11px;color:var(--muted);margin-top:8px;"></div>
  <div style="display:flex;gap:8px;">
    ${btn('ATIVAR MONITORIZAÇÃO','var(--c6)','fxMonitorToggle()','')}
  </div>`;
  fxDrawSpk();
  $('fx-spk-state').textContent=_fxMonitorOn?('ATIVO: '+SPEAKERS[_spkSel].label):'Desligado (ouves o master real)';
};
window.fxSpkSel=function(v){_spkSel=v;if(_fxMonitorOn){fxBuildMonitor();}fxOpen('monitor');};
function fxDrawSpk(){
  const cv=$('fx-spk-cv');if(!cv)return;const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);gridFreq(ctx,W,H);
  const sp=SPEAKERS[_spkSel];
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const f=20*Math.pow(1000,px/W); let g=0;
    sp.bands.forEach(([fc,gain,q])=>{ const d=Math.log2(f/fc); g+=gain*Math.exp(-(d*d)/(2/(q))); });
    const y=H/2 - g*3.2;
    px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);
  }
  ctx.strokeStyle='#b855f7';ctx.lineWidth=2;ctx.stroke();
  if(sp.mono){ctx.fillStyle='#b855f7';ctx.font='9px monospace';ctx.fillText('MONO',W-46,16);}
}
function fxBuildMonitor(){
  if(typeof audioCtx==='undefined'||!audioCtx||typeof masterGain==='undefined')return;
  // remove old
  if(_fxMonitorNode){try{masterGain.disconnect(_fxMonitorNode.input);}catch(e){}try{_fxMonitorNode.output.disconnect();}catch(e){}_fxMonitorNode=null;}
  const sp=SPEAKERS[_spkSel];
  const input=audioCtx.createGain(), output=audioCtx.createGain();
  let last=input;
  sp.bands.forEach(([fc,gain,q])=>{const f=audioCtx.createBiquadFilter();f.type='peaking';f.frequency.value=fc;f.gain.value=gain;f.Q.value=q;last.connect(f);last=f;});
  if(sp.mono){const m=audioCtx.createChannelMerger(1);/* approximate mono via gain sum */ const g=audioCtx.createGain();last.connect(g);last=g;}
  last.connect(output);
  _fxMonitorNode={input,output};
  // reroute: masterGain normally → analyser → destination. We tap a parallel monitor path to destination.
  masterGain.connect(input); output.connect(audioCtx.destination);
}
window.fxMonitorToggle=function(){
  if(!_fxMonitorOn){ fxBuildMonitor(); _fxMonitorOn=true; status('Monitor '+SPEAKERS[_spkSel].label+' ATIVO'); }
  else { if(_fxMonitorNode){try{masterGain.disconnect(_fxMonitorNode.input);}catch(e){}try{_fxMonitorNode.output.disconnect();}catch(e){}_fxMonitorNode=null;} _fxMonitorOn=false; status('Monitor desligado'); }
  const st=$('fx-spk-state'); if(st) st.textContent=_fxMonitorOn?('ATIVO: '+SPEAKERS[_spkSel].label):'Desligado (ouves o master real)';
};

// ════════ 3. CALIBRAÇÃO DE SALA ════════
let _roomCurve=null, _roomEqNodes=[], _roomOn=false;
window.fxView_room=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Toca um ruído de teste pelas tuas colunas, grava com o microfone do telemóvel/PC, e a suite cria uma curva de compensação para ouvires "a direito" num quarto sem tratamento.</div>
  ${card('<b style="color:var(--c5)">COMO FUNCIONA</b><br><span style="font-size:11px;color:var(--text)">1. Sobe o volume das colunas (não auscultadores).<br>2. Põe o microfone na posição de escuta.<br>3. Clica MEDIR — toca ruído rosa 4s e grava.<br>4. Aplica a compensação como monitorização.</span>','var(--c5)')}
  <div style="display:flex;gap:8px;">${btn('● MEDIR SALA (4s)','var(--c5)','fxRoomMeasure()')}${btn('APLICAR / RETIRAR','var(--c4)','fxRoomToggle()')}</div>
  ${canvasEl('fx-room-cv',130)}
  <div id="fx-room-state" style="font-size:11px;color:var(--muted);margin-top:6px;">Ainda não medido.</div>`;
  fxRoomDraw();
};
async function fxRoomMeasure(){
  const st=$('fx-room-state');
  try{
    if(typeof audioCtx==='undefined'||!audioCtx){status('Importa uma música primeiro para iniciar o áudio');return;}
    if(st)st.textContent='A pedir acesso ao microfone...';
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const an=audioCtx.createAnalyser();an.fftSize=4096;
    const micSrc=audioCtx.createMediaStreamSource(stream);micSrc.connect(an);
    // pink-ish noise burst
    const dur=4, sr=audioCtx.sampleRate, nb=audioCtx.createBuffer(1,sr*dur,sr);
    const dd=nb.getChannelData(0); let b0=0,b1=0,b2=0;
    for(let i=0;i<dd.length;i++){const w=Math.random()*2-1;b0=0.99*b0+w*0.05;b1=0.96*b1+w*0.08;b2=0.57*b2+w*0.4;dd[i]=(b0+b1+b2+w*0.1)*0.3;}
    const ns=audioCtx.createBufferSource();ns.buffer=nb;const ng=audioCtx.createGain();ng.gain.value=0.5;ns.connect(ng);ng.connect(audioCtx.destination);ns.start();
    if(st)st.textContent='A medir... mantém-te em silêncio.';
    const bins=an.frequencyBinCount, acc=new Float32Array(bins); let frames=0;
    await new Promise(res=>{
      const t0=performance.now();
      (function loop(){
        const fd=new Uint8Array(bins);an.getByteFrequencyData(fd);
        for(let i=0;i<bins;i++)acc[i]+=fd[i]; frames++;
        if(performance.now()-t0<dur*1000) requestAnimationFrame(loop); else res();
      })();
    });
    stream.getTracks().forEach(t=>t.stop());
    // average + build inverse curve (smoothed) over 8 bands
    const NB=24, curve=new Float32Array(NB);
    for(let bnd=0;bnd<NB;bnd++){
      const f=20*Math.pow(20000/20,bnd/(NB-1)); const k=Math.round(f/(sr/an.fftSize));
      let s=0,n=0; for(let i=Math.max(1,k-2);i<=Math.min(bins-1,k+2);i++){s+=acc[i]/frames;n++;}
      curve[bnd]=n?s/n:0;
    }
    // normalize: target flat = mean
    let mean=0;for(let i=4;i<NB-3;i++)mean+=curve[i];mean/=(NB-7);
    _roomCurve=Array.from(curve).map((v,i)=>{const inv=mean-v; return Math.max(-9,Math.min(9, inv*0.12));});
    if(st)st.textContent='Medição concluída. Clica APLICAR para ouvir compensado.';
    fxRoomDraw();
    status('Sala medida — curva de compensação pronta');
  }catch(e){ if(st)st.textContent='Não foi possível aceder ao microfone: '+e.message; }
}
window.fxRoomMeasure=fxRoomMeasure;
function fxRoomDraw(){
  const cv=$('fx-room-cv');if(!cv)return;const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);gridFreq(ctx,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  if(!_roomCurve){ctx.fillStyle='var(--muted2)';return;}
  ctx.beginPath();_roomCurve.forEach((v,i)=>{const x=i/(_roomCurve.length-1)*W;const y=H/2 - v*4;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.strokeStyle='#2dd4ff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#2dd4ff';ctx.font='9px monospace';ctx.fillText('curva de compensação',8,14);
}
window.fxRoomToggle=function(){
  if(!_roomCurve){status('Mede a sala primeiro');return;}
  if(typeof audioCtx==='undefined'||!audioCtx||typeof masterGain==='undefined')return;
  if(!_roomOn){
    let last=masterGain; _roomEqNodes=[];
    _roomCurve.forEach((g,i)=>{ if(Math.abs(g)<0.3)return; const f=20*Math.pow(20000/20,i/(_roomCurve.length-1)); const bq=audioCtx.createBiquadFilter();bq.type='peaking';bq.frequency.value=f;bq.gain.value=g;bq.Q.value=1.4;last.connect(bq);last=bq;_roomEqNodes.push(bq);});
    last.connect(audioCtx.destination); _roomOn=true; status('Compensação de sala ATIVA');
  } else { _roomEqNodes.forEach(n=>{try{n.disconnect();}catch(e){}}); try{masterGain.disconnect();}catch(e){} if(typeof analyserNode!=='undefined')masterGain.connect(analyserNode); _roomEqNodes=[];_roomOn=false; status('Compensação desligada'); }
};

// ════════ 4. STEMS POR BANDAS ════════
let _stemGains={sub:1,low:1,high:1,air:1};
window.fxView_stems=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Ajusta zonas do teu stereo como se fossem stems. <b>Nota:</b> é separação por <b>bandas de frequência</b> (proxy). A separação real por IA (vocal/bateria/baixo) corre no servidor da BeatFreak.</div>
  ${fxStemSlider('sub','SUB (–120Hz)','var(--c6)')}
  ${fxStemSlider('low','CORPO (120–800)','var(--c5)')}
  ${fxStemSlider('high','PRESENÇA (0.8–6k)','var(--c3)')}
  ${fxStemSlider('air','AR (6k+)','var(--c4)')}
  ${btn('APLICAR AO MASTER','var(--c2)','fxStemsApply()','')}`;
};
function fxStemSlider(k,lbl,col){const v=Math.round(20*Math.log10(_stemGains[k]));return `<div style="margin:8px 0;"><div style="display:flex;justify-content:space-between;font-size:11px;color:${col};"><span>${lbl}</span><span id="fx-stem-${k}-v">${v>=0?'+':''}${v} dB</span></div><input type="range" min="-18" max="6" value="${v}" step="0.5" oninput="fxStemSet('${k}',this.value)" style="width:100%;accent-color:${col};"></div>`;}
window.fxStemSet=function(k,v){_stemGains[k]=Math.pow(10,parseFloat(v)/20);const e=$('fx-stem-'+k+'-v');if(e)e.textContent=(v>=0?'+':'')+parseFloat(v).toFixed(1)+' dB';};
window.fxStemsApply=function(){
  if(typeof audioCtx==='undefined'||!audioCtx){status('Importa uma música');return;}
  // map to existing EQ if available
  if(typeof eqSub!=='undefined'&&eqSub){
    eqSub.gain.value=20*Math.log10(_stemGains.sub);
    if(typeof eqLowNode!=='undefined')eqLowNode.gain.value=20*Math.log10(_stemGains.low);
    if(typeof eqHigh!=='undefined')eqHigh.gain.value=20*Math.log10(_stemGains.high);
    if(typeof eqAir!=='undefined')eqAir.gain.value=20*Math.log10(_stemGains.air);
    if(typeof syncEQSliders==='function')syncEQSliders();
  }
  status('Stems (por bandas) aplicados ao EQ do master');
};

// ════════ 5. COMANDO POR TEXTO (interpretador local PT) ════════
window.fxView_nl=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Descreve o som que queres em português. Interpretador local (offline). Exemplos: "mais quente", "mais punch no kick", "vocal à frente", "mais brilho", "mais largo", "mais alto para club".</div>
  <div style="display:flex;gap:8px;">
  <input id="fx-nl-in" type="text" placeholder='ex: deixa mais quente tipo Semba antigo e com mais punch' style="flex:1;padding:10px 12px;border-radius:6px;border:1px solid var(--c5);background:var(--bg3);color:var(--text);font-family:'Rajdhani';font-size:13px;">
  <button onclick="fxNLApply()" style="padding:0 18px;border-radius:6px;border:1px solid var(--c5);background:color-mix(in srgb,var(--c5) 16%,transparent);color:var(--c5);font-family:'Rajdhani';font-weight:700;cursor:pointer;">APLICAR</button></div>
  <div id="fx-nl-out" style="margin-top:10px;"></div>`;
};
window.fxNLApply=function(){
  const t=($('fx-nl-in').value||'').toLowerCase();
  if(!t){status('Escreve o que queres');return;}
  const done=[];
  const setKnob=(name,delta,reason)=>{ if(typeof kvals!=='undefined'&&kvals&&name in kvals){kvals[name]=Math.max(0,Math.min(100,(kvals[name]||50)+delta)); done.push([name.toUpperCase(),(delta>0?'+':'')+delta,reason]);} };
  const eqAdj=(node,db,reason,lbl)=>{ if(typeof window[node]!=='undefined'&&window[node]){window[node].gain.value+=db; done.push([lbl,(db>0?'+':'')+db.toFixed(1)+' dB',reason]);} };
  if(/quente|warm|semba|analóg|analog|vintage/.test(t)){ eqAdj('eqBass',2,'corpo e calor','EQ LOW'); setKnob('SAT',15,'satura harmónicas pares'); }
  if(/punch|pancada|kick|bombo|bate/.test(t)){ setKnob('PUNCH',20,'realça o ataque'); if(typeof updateTransient==='function'){} }
  if(/brilho|bright|aberto|crisp|agudo/.test(t)){ eqAdj('eqAir',2.5,'mais ar e brilho','EQ AIR'); }
  if(/vocal|voz/.test(t) && /(frente|alto|destaqu|claro)/.test(t)){ eqAdj('eqMid',2,'destaca o vocal','EQ MID'); }
  if(/largo|wide|espaç|stereo|aberto/.test(t)){ setKnob('WIDE',18,'mais largura stereo'); }
  if(/alto|loud|forte|club|volume|sobe/.test(t)){ setKnob('LOUD',20,'mais loudness'); }
  if(/suave|smooth|menos agressiv|calmo/.test(t)){ setKnob('LOUD',-12,'menos compressão'); }
  if(/limpo|clean|transparent/.test(t)){ setKnob('SAT',-15,'menos saturação'); }
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  const out=$('fx-nl-out');
  if(!done.length){ out.innerHTML=card('<span style="color:var(--muted)">Não percebi pedidos concretos. Tenta palavras como: quente, punch, brilho, vocal, largo, alto, limpo, suave.</span>'); return; }
  out.innerHTML='<div style="font-size:10px;color:var(--muted2);margin-bottom:4px;">A SUITE FEZ:</div>'+done.map(([m,v,r])=>card(`<b style="color:var(--c5)">${m}</b> <span style="color:var(--text)">${v}</span> <span style="color:var(--muted);float:right;font-size:11px;">${r}</span>`,'var(--c5)')).join('');
  status('Comando aplicado: '+done.length+' ajustes');
};

// ════════ 6. SNIPPET VIRAL ════════
let _snipRegion=null, _snipDur=15;
window.fxView_snippet=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Deteta o trecho mais energético (refrão/drop) e exporta-o pronto para TikTok.</div>
  <div style="font-size:10px;color:var(--muted2);">DURAÇÃO</div>
  ${chipRow([{v:'15',label:'15s',active:_snipDur==15},{v:'30',label:'30s',active:_snipDur==30},{v:'60',label:'60s',active:_snipDur==60}],'fxSnipDur','var(--c1)')}
  ${canvasEl('fx-snip-cv',90)}
  <div id="fx-snip-info" style="font-size:11px;color:var(--c4);margin-top:6px;"></div>
  <div style="display:flex;gap:8px;">${btn('DETETAR GANCHO','var(--c5)','fxSnipDetect()')}${btn('EXPORTAR SNIPPET (WAV)','var(--c1)','fxSnipExport()')}</div>`;
  fxSnipDetect();
};
window.fxSnipDur=function(v){_snipDur=parseInt(v);fxOpen('snippet');};
function fxSnipDetect(){
  if(!hasAudio())return;
  const d=audioBuffer.getChannelData(0), sr=audioBuffer.sampleRate, win=Math.floor(sr*_snipDur), hop=Math.floor(sr*1);
  let best=0,bestE=-1;
  for(let i=0;i+win<=d.length;i+=hop){ let e=0; for(let j=0;j<win;j+=200)e+=d[i+j]*d[i+j]; if(e>bestE){bestE=e;best=i;} }
  _snipRegion=[best,best+win];
  const cv=$('fx-snip-cv');if(cv){const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
    const bars=Math.floor(W/3);for(let i=0;i<bars;i++){const idx=Math.floor(i/bars*d.length);let pk=0;for(let j=0;j<2000;j+=50)pk=Math.max(pk,Math.abs(d[idx+j]||0));const inHl=idx>=best&&idx<=best+win;const bh=Math.max(2,pk*(H-10));ctx.fillStyle=inHl?'#ff3ab5':'rgba(45,212,255,0.4)';ctx.fillRect(i*3,H/2-bh/2,2,bh);}
    ctx.strokeStyle='#ff3ab5';ctx.lineWidth=2;ctx.strokeRect(best/d.length*W,2,win/d.length*W,H-4);
  }
  const fmt=s=>{const m=Math.floor(s/60),ss=Math.floor(s%60);return m+':'+(ss<10?'0':'')+ss;};
  const info=$('fx-snip-info');if(info)info.textContent='Gancho detetado: '+fmt(best/sr)+' – '+fmt((best+win)/sr);
}
window.fxSnipDetect=fxSnipDetect;
window.fxSnipExport=function(){
  if(!_snipRegion){status('Deteta o gancho primeiro');return;}
  const [s,e]=_snipRegion, sr=audioBuffer.sampleRate, len=e-s, nCh=audioBuffer.numberOfChannels;
  const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new (window.AudioContext||window.webkitAudioContext)();
  const out=ac.createBuffer(nCh,len,sr);
  for(let c=0;c<nCh;c++){const src=audioBuffer.getChannelData(c),dst=out.getChannelData(c);for(let i=0;i<len;i++)dst[i]=src[s+i]||0;}
  dl(bufToWav(out),'snippet_'+_snipDur+'s.wav');
  status('Snippet exportado ('+_snipDur+'s)');
};

})();

/* ═══════════ STUDIO PRO — VIEWS (features 7-15) ═══════════ */
(function(){
'use strict';
const {btn,card,chipRow,canvasEl,measure,renderProcessed,drawSpec,gridFreq}=window.__fx;
const $=window.__fx.$, status=window.__fx.status, hasAudio=window.__fx.hasAudio;
const LS='piradex_';

// ════════ 7. CERTIFICADO ════════
window.fxView_cert=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Gera um relatório partilhável do master (antes/depois, LUFS, true peak, balanço) com a tua assinatura Piradex.</div>
  ${btn('GERAR CERTIFICADO','var(--c4)','fxCertGen()','')}
  <div id="fx-cert-out" style="margin-top:10px;"></div>`;
};
window.fxCertGen=async function(){
  if(!hasAudio())return;
  status('A gerar certificado...');
  const before=measure(audioBuffer);
  const proc=await renderProcessed(); const after=measure(proc);
  const row=(l,bv,av,u)=>`<tr><td style="padding:5px 8px;color:var(--text);font-size:12px;">${l}</td><td style="padding:5px 8px;color:var(--c6);text-align:right;font-family:monospace;">${bv.toFixed(1)}${u}</td><td style="padding:5px 8px;color:var(--c4);text-align:right;font-family:monospace;">${av.toFixed(1)}${u}</td></tr>`;
  const html=`${card(`<div style="text-align:center;"><div style="font-family:'Orbitron',monospace;font-weight:900;font-size:18px;background:linear-gradient(90deg,var(--c1),var(--c5));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">CERTIFICADO DE MASTER</div>
  <div style="font-size:10px;color:var(--muted);letter-spacing:2px;margin-top:2px;">MASTERING SUITE by Piradex · v1.0.1</div></div>
  <table style="width:100%;border-collapse:collapse;margin-top:12px;">
  <tr><th style="text-align:left;font-size:9px;color:var(--muted2);padding:4px 8px;">MÉTRICA</th><th style="text-align:right;font-size:9px;color:var(--c6);padding:4px 8px;">ANTES</th><th style="text-align:right;font-size:9px;color:var(--c4);padding:4px 8px;">DEPOIS</th></tr>
  ${row('LUFS Integrado',before.lufs,after.lufs,'')}
  ${row('True Peak',before.tp,after.tp,' dBTP')}
  ${row('Peak',before.peak,after.peak,' dBFS')}
  ${row('LRA',before.lra,after.lra,' LU')}
  ${row('PLR',before.plr,after.plr,' dB')}
  </table>
  <div style="text-align:center;margin-top:12px;font-family:'GreatVibes',cursive;font-size:22px;color:var(--c1);">Juninho Piradex</div>
  <div style="text-align:center;font-size:9px;color:var(--muted2);">${new Date().toLocaleDateString('pt-PT')}</div>`,'var(--c4)')}
  ${btn('DESCARREGAR (HTML)','var(--c4)','fxCertDownload()','')}`;
  $('fx-cert-out').innerHTML=html;
  const cd=$('fx-cert-out').querySelector('div');
  window._fxCertHTML=cd?cd.outerHTML:html;
  status('Certificado gerado');
};
window.fxCertDownload=function(){
  const full=`<!doctype html><html><head><meta charset="utf-8"><title>Certificado Piradex</title><style>body{background:#05050c;color:#e0e0e8;font-family:sans-serif;display:flex;justify-content:center;padding:40px;}</style></head><body>${window._fxCertHTML||''}</body></html>`;
  const a=document.createElement('a');a.href='data:text/html;charset=utf-8,'+encodeURIComponent(full);a.download='certificado_master.html';a.click();
  status('Certificado descarregado');
};

// ════════ 8. PIRADEX PRINT ════════
window.fxView_print=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Guarda a tua cadeia atual como uma assinatura ("print"). Reaplica num clique noutras faixas.</div>
  <div style="display:flex;gap:8px;"><input id="fx-print-name" type="text" placeholder="Nome do print (ex: Kuduro Fogo)" style="flex:1;padding:9px 12px;border-radius:6px;border:1px solid var(--c3);background:var(--bg3);color:var(--text);font-family:'Rajdhani';">
  <button onclick="fxPrintSave()" style="padding:0 16px;border-radius:6px;border:1px solid var(--c3);background:color-mix(in srgb,var(--c3) 16%,transparent);color:var(--c3);font-family:'Rajdhani';font-weight:700;cursor:pointer;">GUARDAR</button></div>
  <div id="fx-print-list" style="margin-top:10px;"></div>`;
  fxPrintList();
};
function fxGetPrints(){try{return JSON.parse(localStorage.getItem(LS+'prints')||'[]');}catch(e){return [];}}
function fxSetPrints(p){localStorage.setItem(LS+'prints',JSON.stringify(p));}
window.fxPrintSave=function(){
  const name=($('fx-print-name').value||'').trim();if(!name){status('Dá um nome ao print');return;}
  const snap={name,t:Date.now(),kvals:(typeof kvals!=='undefined'?{...kvals}:{}),eq:{}};
  ['eqSub','eqBass','eqLowNode','eqMid','eqHigh','eqAir'].forEach(n=>{if(typeof window[n]!=='undefined'&&window[n])snap.eq[n]=window[n].gain.value;});
  const p=fxGetPrints();p.push(snap);fxSetPrints(p);fxPrintList();status('Print "'+name+'" guardado');
};
function fxPrintList(){
  const p=fxGetPrints(),host=$('fx-print-list');if(!host)return;
  if(!p.length){host.innerHTML='<div style="color:var(--muted);font-size:11px;">Ainda não tens prints guardados.</div>';return;}
  host.innerHTML=p.map((pr,i)=>card(`<b style="color:var(--c3)">${pr.name}</b> <span style="color:var(--muted2);font-size:10px;">${new Date(pr.t).toLocaleDateString('pt-PT')}</span>
  <span style="float:right;"><button onclick="fxPrintApply(${i})" style="border:1px solid var(--c4);background:transparent;color:var(--c4);border-radius:4px;font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Rajdhani';">APLICAR</button>
  <button onclick="fxPrintDel(${i})" style="border:1px solid var(--c7);background:transparent;color:var(--c7);border-radius:4px;font-size:10px;padding:3px 8px;cursor:pointer;font-family:'Rajdhani';margin-left:4px;">×</button></span>`,'var(--c3)')).join('');
}
window.fxPrintApply=function(i){
  const pr=fxGetPrints()[i];if(!pr)return;
  if(typeof kvals!=='undefined'&&pr.kvals)Object.assign(kvals,pr.kvals);
  Object.keys(pr.eq||{}).forEach(n=>{if(typeof window[n]!=='undefined'&&window[n])window[n].gain.value=pr.eq[n];});
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  status('Print "'+pr.name+'" aplicado');
};
window.fxPrintDel=function(i){const p=fxGetPrints();p.splice(i,1);fxSetPrints(p);fxPrintList();};

// ════════ 9. MODO MENTOR ════════
window.fxView_mentor=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Explica, em português, o que a tua cadeia atual está a fazer e porquê — para aprenderes enquanto masterizas.</div>
  ${btn('EXPLICAR A MINHA CADEIA','var(--c5)','fxMentorExplain()','')}
  <div id="fx-mentor-out" style="margin-top:10px;"></div>`;
};
window.fxMentorExplain=function(){
  const out=$('fx-mentor-out');const notes=[];
  const g=(n)=>{return (typeof window[n]!=='undefined'&&window[n])?window[n].gain.value:0;};
  if(g('eqBass')>1)notes.push(['EQ LOW','+'+g('eqBass').toFixed(1)+' dB','Estás a dar corpo e calor — típico de Semba/Kizomba.','var(--c6)']);
  if(g('eqBass')<-1)notes.push(['EQ LOW','−'+Math.abs(g('eqBass')).toFixed(1)+' dB','Estás a limpar lama nos graves — bom para clareza.','var(--c6)']);
  if(g('eqAir')>1)notes.push(['EQ AIR','+'+g('eqAir').toFixed(1)+' dB','Mais brilho e ar; cuidado com sibilância no vocal.','var(--c4)']);
  if(g('eqMid')>1)notes.push(['EQ MID','+'+g('eqMid').toFixed(1)+' dB','A destacar a presença (vocais e melodia à frente).','var(--c5)']);
  if(typeof kvals!=='undefined'&&kvals){
    if((kvals.LOUD||50)>65)notes.push(['LOUDNESS','alto','A empurrar volume — ótimo para club, mas vigia a dinâmica (PLR).','var(--c2)']);
    if((kvals.SAT||0)>20)notes.push(['SATURAÇÃO','ativa','Harmónicas a engrossar o som; dá perceção de "mais alto" sem ganho.','var(--c3)']);
    if((kvals.WIDE||50)>65)notes.push(['LARGURA','+','Mais imagem stereo; confirma a compatibilidade mono (clubs/Bluetooth).','var(--c1)']);
  }
  if(!notes.length){out.innerHTML=card('<span style="color:var(--muted)">A tua cadeia está praticamente neutra. Mexe nos módulos e volta aqui para perceberes o efeito de cada escolha.</span>');return;}
  out.innerHTML=notes.map(([m,v,why,c])=>card(`<b style="color:${c}">${m}</b> <span style="color:var(--text)">${v}</span><br><span style="font-size:12px;color:var(--muted)">${why}</span>`,c)).join('');
};

// ════════ 10. LOUDNESS DINÂMICO ════════
window.fxView_dynloud=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Analisa a estrutura da música e realça os drops/refrões com automação de ganho — preservando dinâmica onde importa.</div>
  ${canvasEl('fx-dyn-cv',120)}
  <div id="fx-dyn-info" style="font-size:11px;color:var(--muted);margin-top:6px;"></div>
  <div style="display:flex;gap:8px;">${btn('ANALISAR ESTRUTURA','var(--c5)','fxDynAnalyse()')}${btn('APLICAR AUTOMAÇÃO','var(--c2)','fxDynApply()')}</div>`;
  fxDynAnalyse();
};
let _dynEnv=null;
function fxDynAnalyse(){
  if(!hasAudio())return;
  const d=audioBuffer.getChannelData(0),sr=audioBuffer.sampleRate,win=Math.floor(sr*0.5),hop=Math.floor(sr*0.5);
  const env=[];for(let i=0;i+win<=d.length;i+=hop){let e=0;for(let j=0;j<win;j+=100)e+=d[i+j]*d[i+j];env.push(Math.sqrt(e/(win/100)));}
  const mx=Math.max(...env)||1;_dynEnv=env.map(v=>v/mx);
  const cv=$('fx-dyn-cv');if(cv){const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
    ctx.beginPath();_dynEnv.forEach((v,i)=>{const x=i/(_dynEnv.length-1)*W;const y=H-v*(H-8)-4;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.strokeStyle='#2dd4ff';ctx.lineWidth=2;ctx.stroke();
    // mark drops (local peaks above 0.8)
    _dynEnv.forEach((v,i)=>{if(v>0.82){const x=i/(_dynEnv.length-1)*W;ctx.fillStyle='#ff6b35';ctx.fillRect(x-1,4,2,H-8);}});
  }
  const drops=_dynEnv.filter(v=>v>0.82).length;
  const info=$('fx-dyn-info');if(info)info.textContent='Estrutura analisada — '+drops+' zonas de alta energia (laranja) serão realçadas.';
}
window.fxDynAnalyse=fxDynAnalyse;
window.fxDynApply=function(){
  if(!_dynEnv){status('Analisa primeiro');return;}
  if(typeof masterGain==='undefined'||!masterGain||typeof audioCtx==='undefined'){status('Importa e toca a música');return;}
  // schedule gain automation along playback (subtle: +1.5dB on drops, -1dB on low sections)
  const dur=audioBuffer.duration, now=audioCtx.currentTime, base=masterGain.gain.value;
  masterGain.gain.cancelScheduledValues(now);
  _dynEnv.forEach((v,i)=>{const t=now+(i/_dynEnv.length)*dur; const adj=v>0.82?1.18:(v<0.4?0.92:1.0); masterGain.gain.linearRampToValueAtTime(base*adj,t);});
  status('Loudness dinâmico programado para esta reprodução');
};

// ════════ 11. REVERSE MASTERING ════════
window.fxView_reverse=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Analisa o master e gera notas de correção para o engenheiro de MISTURA fazer na origem.</div>
  ${btn('GERAR NOTAS DE MISTURA','var(--c5)','fxReverseGen()','')}
  <div id="fx-rev-out" style="margin-top:10px;"></div>`;
};
window.fxReverseGen=async function(){
  if(!hasAudio())return;status('A analisar...');
  const m=measure(audioBuffer);const notes=[];
  if(m.low>45)notes.push(['var(--c7)','PROBLEMA','Excesso de graves/lama ('+m.low.toFixed(0)+'%)','Corta 2–3 dB entre 200–350 Hz no mix; o limiter vai respirar.']);
  if(m.high<14)notes.push(['var(--c2)','ATENÇÃO','Pouca energia de agudos ('+m.high.toFixed(0)+'%)','Abre um shelf suave acima de 8 kHz no mix, ou revê o de-esser.']);
  if(m.high>32)notes.push(['var(--c2)','ATENÇÃO','Agudos a mais ('+m.high.toFixed(0)+'%)','Possível sibilância/harshness — de-esser e corte a 6–8 kHz.']);
  if(m.crest<8)notes.push(['var(--c7)','DINÂMICA','Mistura já muito esmagada (crest '+m.crest.toFixed(1)+' dB)','Alivia a compressão no mix — não deixes nada para o master fazer.']);
  if(m.corr<0.3)notes.push(['var(--c7)','FASE','Correlação baixa ('+m.corr.toFixed(2)+')','Verifica problemas de fase; colapsa em mono em clubs/Bluetooth.']);
  if(Math.abs(m.low-(m.mid))>30)notes.push(['var(--c3)','BALANÇO','Desequilíbrio entre graves e médios','Reequilibra o baixo vs vocais/instrumentos no mix.']);
  if(!notes.length)notes.push(['var(--c4)','BOM','Mistura equilibrada','Boa base — nada crítico a corrigir na origem.']);
  $('fx-rev-out').innerHTML=notes.map(([c,tag,t,why])=>card(`<b style="color:${c}">${tag}</b> &nbsp;<span style="color:var(--text);font-weight:600;">${t}</span><br><span style="font-size:12px;color:var(--muted)">${why}</span>`,c)).join('');
  status('Notas de mistura geradas');
};

// ════════ 12. SOURCE FORENSICS ════════
window.fxView_forensic=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Perícia ao ficheiro importado antes de masterizar.</div>
  ${btn('ANALISAR FICHEIRO','var(--c2)','fxForensicRun()','')}
  <div id="fx-for-out" style="margin-top:10px;"></div>`;
  window.fxForensicRun();
};
window.fxForensicRun=function(){
  if(!hasAudio())return;
  const d=audioBuffer.getChannelData(0),sr=audioBuffer.sampleRate;
  let clip=0,dc=0,mx=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>=0.999)clip++;dc+=d[i];mx=Math.max(mx,a);}dc/=d.length;
  // crest
  let s=0;for(let i=0;i<d.length;i+=2)s+=d[i]*d[i];const rms=Math.sqrt(s/(d.length/2));const crest=20*Math.log10(mx)-20*Math.log10(rms);
  // HF cliff (MP3 detection): compare energy 16-20k vs 10-14k via quick goertzel-ish sampling
  const m=measure(audioBuffer);
  // phase
  let corr=m.corr;
  const checks=[];let score=100;
  if(clip>20){checks.push(['var(--c7)','✕','Clipping digital ('+clip+' amostras)','A fonte já foi esmagada — re-masterizar vai distorcer.']);score-=30;}
  else checks.push(['var(--c4)','✓','Sem clipping significativo','Picos dentro do limite.']);
  if(m.high<8){checks.push(['var(--c2)','!','Possível origem MP3/baixa qualidade','Energia de agudos muito baixa — confirma que é WAV genuíno.']);score-=15;}
  else checks.push(['var(--c4)','✓','Conteúdo de agudos presente','Sem sinais óbvios de origem comprimida.']);
  if(Math.abs(dc)>0.002){checks.push(['var(--c2)','!','DC offset ('+dc.toFixed(4)+')','Centra o sinal antes de masterizar.']);score-=8;}
  else checks.push(['var(--c4)','✓','Sem DC offset','Linha de base centrada.']);
  if(corr<0.3){checks.push(['var(--c7)','✕','Fase problemática ('+corr.toFixed(2)+')','Vais perder sinal em mono.']);score-=20;}
  else checks.push(['var(--c4)','✓','Fase saudável ('+corr.toFixed(2)+')','Seguro para mono.']);
  if(crest<7){checks.push(['var(--c2)','!','Pouca dinâmica (crest '+crest.toFixed(1)+' dB)','A fonte já está limitada — pouco espaço para trabalhar.']);score-=12;}
  else checks.push(['var(--c4)','✓','Dinâmica adequada (crest '+crest.toFixed(1)+' dB)','Há espaço para masterizar.']);
  score=Math.max(0,score);
  const col=score>80?'var(--c4)':score>55?'var(--c3)':'var(--c7)';
  let h=card(`<div style="font-size:10px;color:var(--muted2)">QUALIDADE DA FONTE</div><div style="font-size:18px;font-weight:700;color:${col};font-family:'Orbitron',monospace;">${score} / 100</div>`,col);
  h+=checks.map(([c,ic,t,why])=>card(`<b style="color:${c}">${ic}</b> &nbsp;<span style="color:var(--text)">${t}</span><br><span style="font-size:11px;color:var(--muted)">${why}</span>`,c)).join('');
  $('fx-for-out').innerHTML=h;
};

// ════════ 13. ALBUM COHESION ════════
window.fxView_album=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Mede várias faixas e nivela o loudness percebido para o álbum fluir. Adiciona ficheiros abaixo.</div>
  <label style="display:inline-block;padding:9px 16px;border-radius:6px;border:1px solid var(--c4);background:color-mix(in srgb,var(--c4) 14%,transparent);color:var(--c4);font-family:'Rajdhani';font-weight:700;font-size:11px;cursor:pointer;">+ ADICIONAR FAIXAS<input type="file" accept="audio/*" multiple onchange="fxAlbumAdd(this.files)" style="display:none;"></label>
  <div id="fx-album-list" style="margin-top:12px;"></div>`;
  fxAlbumRender();
};
let _album=[];
window.fxAlbumAdd=async function(files){
  status('A medir faixas...');
  const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new (window.AudioContext||window.webkitAudioContext)();
  for(const f of files){
    try{const ab=await f.arrayBuffer();const buf=await ac.decodeAudioData(ab);const m=measure(buf);_album.push({name:f.name,lufs:m.lufs,high:m.high,low:m.low});}catch(e){}
  }
  fxAlbumRender();status(_album.length+' faixas no álbum');
};
function fxAlbumRender(){
  const host=$('fx-album-list');if(!host)return;
  if(!_album.length){host.innerHTML='<div style="color:var(--muted);font-size:11px;">Sem faixas. Adiciona o teu EP/álbum.</div>';return;}
  const target=_album.reduce((a,b)=>a+b.lufs,0)/_album.length;
  let h='<div style="font-size:10px;color:var(--muted2);margin-bottom:6px;">MAPA DE COESÃO · alvo médio '+target.toFixed(1)+' LUFS</div>';
  _album.forEach((t,i)=>{
    const diff=t.lufs-target;const col=Math.abs(diff)<0.6?'var(--c4)':Math.abs(diff)<1.6?'var(--c3)':'var(--c7)';
    const frac=Math.max(0.05,Math.min(0.95,0.5+diff*0.06));
    h+=`<div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:6px;padding:8px 10px;margin-bottom:5px;">
      <span style="flex:1;font-size:12px;color:var(--text);font-family:'Rajdhani';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i+1}. ${t.name}</span>
      <div style="width:200px;height:8px;background:var(--bg4,#1c1c2a);border-radius:4px;position:relative;"><div style="width:${frac*100}%;height:100%;background:${col};border-radius:4px;"></div><div style="position:absolute;left:50%;top:-3px;width:1px;height:14px;background:#fff;"></div></div>
      <span style="font-family:monospace;font-size:11px;color:${col};min-width:80px;text-align:right;">${t.lufs.toFixed(1)} LUFS</span>
      <button onclick="fxAlbumDel(${i})" style="border:1px solid var(--c7);background:transparent;color:var(--c7);border-radius:4px;font-size:10px;padding:2px 7px;cursor:pointer;">×</button></div>`;
  });
  const off=_album.filter(t=>Math.abs(t.lufs-target)>=0.6);
  if(off.length)h+=card('<span style="color:var(--text);font-size:12px;">'+off.length+' faixa(s) fora do alvo. A linha branca é o alvo do álbum. Iguala manualmente o LUFS de cada uma na aba LOUD, ou re-exporta com o ganho ajustado.</span>','var(--c2)');
  else h+=card('<span style="color:var(--c4);font-size:12px;">Álbum coeso — todas as faixas dentro de ±0.6 LUFS do alvo.</span>','var(--c4)');
  host.innerHTML=h;
}
window.fxAlbumDel=function(i){_album.splice(i,1);fxAlbumRender();};

// ════════ 14. BLIND SHOOTOUT ════════
let _shootCands=null,_shootPick=null,_shootRevealed=false;
const SHOOT_PHILO=[
  {key:'A',name:'Limpo e Dinâmico',eq:{eqAir:1},loud:0.0},
  {key:'B',name:'Alto e Agressivo',eq:{eqBass:1,eqAir:2},loud:3.0},
  {key:'C',name:'Colorido / Saturado',eq:{eqBass:2,eqMid:1},loud:1.5,sat:true},
  {key:'D',name:'Equilibrado',eq:{},loud:1.0},
];
window.fxView_shootout=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Gera versões candidatas, <b>iguala o loudness</b> de todas e apresenta-as às cegas. Escolhe pelo som, não pelo volume.</div>
  ${btn('GERAR CANDIDATOS','var(--c3)','fxShootGen()','')}
  <div id="fx-shoot-out" style="margin-top:10px;"></div>`;
};
window.fxShootGen=async function(){
  if(!hasAudio())return;status('A gerar candidatos (loudness igualado)...');
  _shootCands=[];_shootPick=null;_shootRevealed=false;
  for(const ph of SHOOT_PHILO){
    const buf=await fxRenderCandidate(ph);
    _shootCands.push({...ph,buf});
  }
  // loudness-match all to -14 LUFS (approx via measured lufs)
  _shootCands.forEach(c=>{const m=measure(c.buf);c.gain=Math.pow(10,(-14-m.lufs)/20);});
  // shuffle display order
  _shootCands.sort(()=>Math.random()-0.5);
  fxShootRender();status('Candidatos prontos — ouve às cegas');
};
async function fxRenderCandidate(ph){
  const nCh=audioBuffer.numberOfChannels,sr=audioBuffer.sampleRate,len=audioBuffer.length;
  const off=new OfflineAudioContext(nCh,len,sr);
  const mk=(t,f,g,Q)=>{const x=off.createBiquadFilter();x.type=t;x.frequency.value=f;x.gain.value=g||0;if(Q)x.Q.value=Q;return x;};
  const sub=mk('lowshelf',60,ph.eq.eqSub||0),bass=mk('peaking',150,ph.eq.eqBass||0,0.8),mid=mk('peaking',1200,ph.eq.eqMid||0,0.9),air=mk('highshelf',12000,ph.eq.eqAir||0);
  const comp=off.createDynamicsCompressor();comp.threshold.value=-18-ph.loud*2;comp.ratio.value=2+ph.loud;comp.attack.value=0.005;comp.release.value=0.1;
  const lim=off.createDynamicsCompressor();lim.threshold.value=-1;lim.ratio.value=20;lim.attack.value=0.001;lim.release.value=0.05;
  const g=off.createGain();g.gain.value=Math.pow(10,ph.loud/20);
  let ws=null;
  if(ph.sat){ws=off.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cv[i]=Math.tanh(x*1.8);}ws.curve=cv;ws.oversample='2x';}
  const src=off.createBufferSource();src.buffer=audioBuffer;
  src.connect(sub);sub.connect(bass);bass.connect(mid);mid.connect(air);
  let last=air; if(ws){air.connect(ws);last=ws;}
  last.connect(comp);comp.connect(lim);lim.connect(g);g.connect(off.destination);src.start();
  return await off.startRendering();
}
function fxShootRender(){
  const host=$('fx-shoot-out');if(!host||!_shootCands)return;
  let h=`<div style="font-size:10px;color:var(--c3);margin-bottom:8px;">Loudness igualado a -14 LUFS · ordem aleatória · etiquetas escondidas</div>`;
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
  _shootCands.forEach((c,i)=>{
    const lbl=_shootRevealed?c.name:('?');
    const letter=String.fromCharCode(65+i);
    const sel=_shootPick===i;
    h+=`<div onclick="fxShootPick(${i})" style="cursor:pointer;text-align:center;background:${sel?'color-mix(in srgb,var(--c3) 12%,transparent)':'var(--bg3)'};border:${sel?'2px':'1px'} solid ${sel?'var(--c3)':'var(--border2)'};border-radius:10px;padding:14px 6px;">
      <div style="font-family:'Orbitron',monospace;font-weight:900;font-size:26px;color:${sel?'var(--c3)':'var(--muted)'};">${letter}</div>
      <div style="margin:6px 0;"><button onclick="event.stopPropagation();fxShootPlay(${i})" style="border:1px solid ${sel?'var(--c3)':'var(--muted)'};background:transparent;color:${sel?'var(--c3)':'var(--muted)'};border-radius:50%;width:34px;height:34px;cursor:pointer;">▶</button></div>
      <div style="font-size:9px;color:${_shootRevealed?'var(--c4)':'var(--muted2)'};min-height:12px;">${lbl}</div>
    </div>`;
  });
  h+='</div>';
  h+='<div style="display:flex;gap:8px;margin-top:12px;align-items:center;">';
  h+=`<span style="font-size:11px;color:var(--muted);">A tua escolha: <b style="color:var(--c3)">${_shootPick!==null?String.fromCharCode(65+_shootPick):'—'}</b></span>`;
  h+=`<button onclick="fxShootReveal()" style="margin-left:auto;padding:8px 16px;border-radius:6px;border:1px solid var(--c3);background:color-mix(in srgb,var(--c3) 16%,transparent);color:var(--c3);font-family:'Rajdhani';font-weight:700;cursor:pointer;">REVELAR</button>`;
  h+='</div>';
  if(_shootRevealed&&_shootPick!==null)h+=card('<span style="color:var(--text);font-size:12px;">Escolheste <b style="color:var(--c3)">'+_shootCands[_shootPick].name+'</b> — sem o engano do volume. Aplica esta filosofia no master.</span>','var(--c3)');
  host.innerHTML=h;
}
window.fxShootPick=function(i){_shootPick=i;fxShootRender();};
window.fxShootPlay=function(i){
  if(typeof audioCtx==='undefined'||!audioCtx)return;
  try{if(window._fxPrev)window._fxPrev.stop();}catch(e){}
  const c=_shootCands[i];const s=audioCtx.createBufferSource();s.buffer=c.buf;const g=audioCtx.createGain();g.gain.value=c.gain||1;s.connect(g);g.connect(audioCtx.destination);s.start();window._fxPrev=s;
  status('A tocar candidato '+String.fromCharCode(65+i)+' (loudness igualado)');
};
window.fxShootReveal=function(){_shootRevealed=true;fxShootRender();};

// ════════ 15. CLIENT REVIEW ROOM ════════
window.fxView_client=function(b){
  const room=localStorage.getItem(LS+'room_id')||('k'+Math.random().toString(36).slice(2,8));
  localStorage.setItem(LS+'room_id',room);
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Cria versões para o cliente comparar e aprovar, com comentários ancorados ao tempo. <b>Nota:</b> a partilha entre dispositivos requer o servidor da BeatFreak; aqui é guardado localmente.</div>
  <div style="display:flex;gap:8px;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;">
    <span style="flex:1;font-family:monospace;font-size:12px;color:var(--c5);">beatfreakstudio.com/review/${room}</span>
    <button onclick="fxClientCopy('beatfreakstudio.com/review/${room}')" style="border:1px solid var(--c6);background:color-mix(in srgb,var(--c6) 16%,transparent);color:var(--c6);border-radius:6px;padding:6px 12px;font-family:'Rajdhani';font-weight:700;font-size:10px;cursor:pointer;">COPIAR LINK</button>
  </div>
  <div style="display:flex;gap:8px;margin-top:10px;">${btn('+ GUARDAR VERSÃO ATUAL','var(--c4)','fxClientSaveVer()')}</div>
  <div id="fx-client-vers" style="margin-top:8px;"></div>
  <div style="margin-top:12px;"><div style="font-size:10px;color:var(--muted2);margin-bottom:4px;">COMENTÁRIO (com tempo)</div>
  <div style="display:flex;gap:8px;"><input id="fx-client-time" placeholder="1:32" style="width:70px;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-family:monospace;text-align:center;">
  <input id="fx-client-msg" placeholder="comentário do cliente..." style="flex:1;padding:8px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-family:'Rajdhani';">
  <button onclick="fxClientComment()" style="border:1px solid var(--c5);background:color-mix(in srgb,var(--c5) 16%,transparent);color:var(--c5);border-radius:6px;padding:0 14px;font-family:'Rajdhani';font-weight:700;cursor:pointer;">ENVIAR</button></div></div>
  <div id="fx-client-comments" style="margin-top:8px;"></div>`;
  fxClientRender();
};
function fxCData(){try{return JSON.parse(localStorage.getItem(LS+'room')||'{"vers":[],"comments":[]}');}catch(e){return {vers:[],comments:[]};}}
function fxCSave(d){localStorage.setItem(LS+'room',JSON.stringify(d));}
window.fxClientCopy=function(t){navigator.clipboard&&navigator.clipboard.writeText(t);status('Link copiado');};
window.fxClientSaveVer=function(){const d=fxCData();const name='Versão '+String.fromCharCode(65+d.vers.length)+' — '+((typeof curPreset!=='undefined'?curPreset:'master'));d.vers.push({name,t:Date.now(),approved:false});fxCSave(d);fxClientRender();status('Versão guardada');};
window.fxClientApprove=function(i){const d=fxCData();d.vers.forEach((v,j)=>v.approved=(j===i));fxCSave(d);fxClientRender();status('Versão aprovada');};
window.fxClientComment=function(){const tm=($('fx-client-time').value||'0:00'),msg=($('fx-client-msg').value||'').trim();if(!msg)return;const d=fxCData();d.comments.push({tm,msg,t:Date.now()});fxCSave(d);$('fx-client-msg').value='';fxClientRender();};
function fxClientRender(){
  const d=fxCData();
  const vh=$('fx-client-vers');
  if(vh)vh.innerHTML=d.vers.length?d.vers.map((v,i)=>card(`<span style="color:var(--text);font-size:12px;">${v.name}</span><span style="float:right;">${v.approved?'<span style="color:var(--c4);font-size:11px;">✓ aprovada</span>':'<button onclick="fxClientApprove('+i+')" style="border:1px solid var(--c4);background:transparent;color:var(--c4);border-radius:4px;font-size:10px;padding:3px 8px;cursor:pointer;">aprovar</button>'}</span>`,v.approved?'var(--c4)':'var(--border2)')).join(''):'<div style="color:var(--muted);font-size:11px;">Sem versões guardadas.</div>';
  const ch=$('fx-client-comments');
  if(ch)ch.innerHTML=d.comments.length?d.comments.map(c=>`<div style="display:flex;gap:10px;align-items:center;background:var(--bg3);border-radius:6px;padding:7px 10px;margin-bottom:4px;"><span style="background:color-mix(in srgb,var(--c5) 18%,transparent);color:var(--c5);border-radius:5px;padding:3px 8px;font-family:monospace;font-size:11px;">${c.tm}</span><span style="color:var(--text);font-size:12px;">${c.msg}</span></div>`).join(''):'<div style="color:var(--muted);font-size:11px;">Sem comentários.</div>';
}

})();

/* ═══════════ STUDIO PRO — MOONSHOT VIEWS (10) ═══════════ */
(function(){
'use strict';
const {btn,card,chipRow,canvasEl,measure,renderProcessed,drawSpec,gridFreq}=window.__fx;
const $=window.__fx.$, status=window.__fx.status, hasAudio=window.__fx.hasAudio;
const LS='piradex_';

function bufToWav(buf){
  const nCh=buf.numberOfChannels,len=buf.length,sr=buf.sampleRate;
  const ab=new ArrayBuffer(44+len*nCh*2),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nCh,true);v.setUint32(24,sr,true);
  v.setUint32(28,sr*nCh*2,true);v.setUint16(32,nCh*2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,len*nCh*2,true);
  let o=44;for(let i=0;i<len;i++)for(let c=0;c<nCh;c++){let s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));v.setInt16(o,s<0?s*0x8000:s*0x7FFF,true);o+=2;}
  return new Blob([ab],{type:'audio/wav'});
}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
function playBuf(buf,gain){ if(typeof audioCtx==='undefined'||!audioCtx)return; try{if(window._fxPrev)window._fxPrev.stop();}catch(e){} const s=audioCtx.createBufferSource();s.buffer=buf;const g=audioCtx.createGain();g.gain.value=gain||1;s.connect(g);g.connect(audioCtx.destination);s.start();window._fxPrev=s; }
function fmt(s){const m=Math.floor(s/60),ss=Math.floor(s%60);return m+':'+(ss<10?'0':'')+ss;}

// energy+centroid timeline (shared by heatmap/skiprisk/copilot)
function analyseTimeline(buf){
  const d=buf.getChannelData(0),sr=buf.sampleRate,win=Math.floor(sr*0.5),hop=Math.floor(sr*0.25);
  const out=[];
  for(let i=0;i+win<=d.length;i+=hop){
    let e=0,zc=0,prev=0;
    for(let j=0;j<win;j+=50){const x=d[i+j];e+=x*x;if((x>0)!==(prev>0))zc++;prev=x;}
    out.push({e:Math.sqrt(e/(win/50)),bright:zc/(win/50)});
  }
  const mx=Math.max(...out.map(o=>o.e))||1;
  out.forEach(o=>{o.e/=mx;});
  return out;
}

// ════════ COPILOTO ════════
let _copilotMsgs=[];
window.fxView_copilot=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Ouve a tua faixa e conversa contigo. Aceitas ou recusas cada sugestão. <b>Versão local</b> (a IA na nuvem fica no servidor).</div>
  <div id="fx-cop-feed" style="min-height:120px;"></div>
  <div style="display:flex;gap:8px;margin-top:8px;">${btn('ANALISAR & SUGERIR','var(--c5)','fxCopilotAnalyse()')}</div>`;
  _copilotMsgs=[]; fxCopFeed();
};
function fxCopFeed(){
  const f=$('fx-cop-feed');if(!f)return;
  f.innerHTML=_copilotMsgs.map(m=>{
    if(m.me) return `<div style="text-align:right;margin:6px 0;"><span style="display:inline-block;background:color-mix(in srgb,var(--c4) 12%,transparent);border:1px solid color-mix(in srgb,var(--c4) 40%,transparent);border-radius:10px;padding:8px 12px;font-size:13px;color:var(--text);max-width:70%;">${m.t}</span></div>`;
    return `<div style="margin:6px 0;"><div style="font-size:8px;color:var(--c5);margin-bottom:2px;">COPILOTO</div><span style="display:inline-block;background:color-mix(in srgb,var(--c5) 9%,transparent);border:1px solid color-mix(in srgb,var(--c5) 35%,transparent);border-radius:10px;padding:8px 12px;font-size:13px;color:var(--text);max-width:80%;">${m.t}</span>${m.action?` <button onclick="fxCopApply('${m.action}')" style="border:1px solid var(--c4);background:color-mix(in srgb,var(--c4) 14%,transparent);color:var(--c4);border-radius:6px;font-size:10px;padding:5px 12px;cursor:pointer;font-family:'Rajdhani';font-weight:700;margin-left:6px;">APLICAR</button>`:''}</div>`;
  }).join('');
}
window.fxCopilotAnalyse=function(){
  if(!hasAudio())return;
  const m=measure(audioBuffer), tl=analyseTimeline(audioBuffer);
  _copilotMsgs=[];
  _copilotMsgs.push({me:false,t:'Analisei a tua faixa. Aqui está o que noto:'});
  if(m.low>45){_copilotMsgs.push({me:false,t:'Os graves estão pesados ('+m.low.toFixed(0)+'% do balanço) — sente-se "lama". Queres que limpe a zona 200–350 Hz?',action:'cleanlow'});}
  if(m.high<14){_copilotMsgs.push({me:false,t:'Falta brilho ('+m.high.toFixed(0)+'%). Posso abrir um pouco de ar acima de 10 kHz.',action:'addair'});}
  if(m.crest<8){_copilotMsgs.push({me:false,t:'A faixa está bastante esmagada (crest '+m.crest.toFixed(1)+' dB). Cuidado em empurrar mais loudness.'});}
  // find weak drop
  let minE=2,minI=0;tl.forEach((o,i)=>{if(i>tl.length*0.2&&i<tl.length*0.8&&o.e<minE){minE=o.e;minI=i;}});
  _copilotMsgs.push({me:false,t:'A energia cai por volta de '+fmt(minI*0.25)+' — confere se a música não "morre" aí.'});
  if(m.lufs<-12){_copilotMsgs.push({me:false,t:'Estás a '+m.lufs.toFixed(1)+' LUFS — abaixo do alvo de club (-9). Queres que empurre o loudness?',action:'louder'});}
  if(_copilotMsgs.length<3)_copilotMsgs.push({me:false,t:'No geral está equilibrada. Boa base!'});
  fxCopFeed();
};
window.fxCopApply=function(action){
  const acts={
    cleanlow:()=>{if(typeof eqBass!=='undefined'&&eqBass)eqBass.gain.value-=2.5;},
    addair:()=>{if(typeof eqAir!=='undefined'&&eqAir)eqAir.gain.value+=2.5;},
    louder:()=>{if(typeof kvals!=='undefined'&&kvals){kvals.LOUD=Math.min(100,(kvals.LOUD||50)+18);if(typeof refreshKnobs==='function')refreshKnobs();if(typeof applyDSP==='function')applyDSP();}},
  };
  if(acts[action])acts[action]();
  if(typeof syncEQSliders==='function')syncEQSliders();
  _copilotMsgs.push({me:true,t:'Sim, aplica.'});
  _copilotMsgs.push({me:false,t:'Feito ✓'});
  fxCopFeed();status('Copiloto aplicou a sugestão');
};

// ════════ HEAT MAP EMOCIONAL ════════
window.fxView_heatmap=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Tensão, energia e clímax ao longo do tempo. Vê onde a música "morre".</div>
  ${canvasEl('fx-heat-cv',90)}
  <div style="display:flex;gap:14px;font-size:9px;color:var(--muted2);margin-top:6px;"><span><span style="display:inline-block;width:12px;height:8px;background:var(--c5);"></span> calma</span><span><span style="display:inline-block;width:12px;height:8px;background:var(--c4);"></span> energia</span><span><span style="display:inline-block;width:12px;height:8px;background:var(--c7);"></span> clímax</span></div>
  <div id="fx-heat-info" style="margin-top:8px;"></div>
  ${btn('ANALISAR EMOÇÃO','var(--c1)','fxHeatmap()')}`;
  window.fxHeatmap();
};
window.fxHeatmap=function(){
  if(!hasAudio())return;
  const tl=analyseTimeline(audioBuffer);
  const cv=$('fx-heat-cv');if(cv){const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
    tl.forEach((o,i)=>{const x=i/tl.length*W;const v=Math.min(1,o.e*(0.7+o.bright*0.5));let col;
      if(v<0.4)col=[45,212,255];else if(v<0.7)col=[45,255,138];else col=[255,90,90];
      ctx.fillStyle='rgb('+col[0]+','+col[1]+','+col[2]+')';ctx.fillRect(x,0,W/tl.length+1,H);});
  }
  // find climax + dead zone
  let mxE=0,mxI=0,mnE=2,mnI=0;tl.forEach((o,i)=>{if(o.e>mxE){mxE=o.e;mxI=i;}if(i>tl.length*0.2&&i<tl.length*0.85&&o.e<mnE){mnE=o.e;mnI=i;}});
  const info=$('fx-heat-info');
  if(info)info.innerHTML=card('<b style="color:var(--c3)">INSIGHT</b><br><span style="font-size:12px;color:var(--text)">Clímax em '+fmt(mxI*0.25)+'. Zona de menor energia perto de '+fmt(mnI*0.25)+' — confirma que não perde o ouvinte aí.</span>','var(--c3)');
};

// ════════ O TEU EU DE 1 ANO ════════
window.fxView_future=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Projeção da tua evolução (heurística): mais dinâmica, menos saturação, agudos mais abertos. Compara às cegas.</div>
  ${btn('GERAR AGORA vs FUTURO','var(--c6)','fxFutureGen()','')}
  <div id="fx-future-out" style="margin-top:10px;"></div>`;
};
window.fxFutureGen=async function(){
  if(!hasAudio())return;status('A projetar o teu eu futuro...');
  const now=await renderProcessed();
  // "future": more dynamic (less loud), brighter, cleaner
  const nCh=audioBuffer.numberOfChannels,sr=audioBuffer.sampleRate,len=audioBuffer.length;
  const off=new OfflineAudioContext(nCh,len,sr);
  const air=off.createBiquadFilter();air.type='highshelf';air.frequency.value=11000;air.gain.value=2;
  const lowcut=off.createBiquadFilter();lowcut.type='peaking';lowcut.frequency.value=280;lowcut.Q.value=1;lowcut.gain.value=-1.5;
  const comp=off.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=1.8;comp.attack.value=0.01;comp.release.value=0.12;
  const src=off.createBufferSource();src.buffer=now;src.connect(lowcut);lowcut.connect(air);air.connect(comp);comp.connect(off.destination);src.start();
  const fut=await off.startRendering();
  window._fxFut={now,fut};
  $('fx-future-out').innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    ${card('<div style="text-align:center;"><b style="color:var(--c5)">AGORA</b><br><span style="font-size:11px;color:var(--muted)">o teu gosto atual</span><br><button onclick="fxFuturePlay(0)" style="margin-top:8px;border:1px solid var(--c5);background:transparent;color:var(--c5);border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:14px;">▶</button></div>','var(--c5)')}
    ${card('<div style="text-align:center;"><b style="color:var(--c6)">DAQUI A 1 ANO</b><br><span style="font-size:11px;color:var(--muted)">previsão da tua evolução</span><br><button onclick="fxFuturePlay(1)" style="margin-top:8px;border:1px solid var(--c6);background:transparent;color:var(--c6);border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:14px;">▶</button></div>','var(--c6)')}
  </div>`+card('<span style="font-size:12px;color:var(--text)">A tua evolução prevista: +2 dB de dinâmica, menos lama nos graves, agudos mais abertos.</span>','var(--c6)');
  status('Comparação pronta');
};
window.fxFuturePlay=function(w){if(!window._fxFut){return;}playBuf(w?window._fxFut.fut:window._fxFut.now);status(w?'A tocar o teu eu de 1 ano':'A tocar agora');};

// ════════ INTENÇÃO CULTURAL ════════
window.fxView_vibe=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Descreve uma vibe cultural. A suite traduz em decisões técnicas.</div>
  <div style="display:flex;gap:8px;"><input id="fx-vibe-in" type="text" placeholder='ex: kizombada em Luanda às 2h da manhã' style="flex:1;padding:10px 12px;border-radius:6px;border:1px solid var(--c3);background:var(--bg3);color:var(--text);font-family:'Rajdhani';font-size:13px;">
  <button onclick="fxVibeApply()" style="padding:0 18px;border-radius:6px;border:1px solid var(--c3);background:color-mix(in srgb,var(--c3) 16%,transparent);color:var(--c3);font-family:'Rajdhani';font-weight:700;cursor:pointer;">TRADUZIR</button></div>
  <div style="font-size:10px;color:var(--muted2);margin-top:8px;">Sugestões: kizombada · festa de kuduro · semba de domingo · zouk romântico · club às 3h · rádio da manhã</div>
  <div id="fx-vibe-out" style="margin-top:10px;"></div>`;
};
const VIBES={
  kizomb:[['var(--c6)','Graves quentes e redondos','low-shelf +2.5 dB @ 90 Hz + saturação analógica',{eqBass:2.5}],['var(--c5)','Médios intimistas','vocal colado, presença suave',{eqMid:1}],['var(--c2)','Dinâmica de dança lenta','compressão suave, groove preservado, -9 LUFS',{LOUD:8}]],
  kuduro:[['var(--c7)','Punch agressivo','transientes fortes no kick',{PUNCH:25}],['var(--c6)','Sub potente','graves de club',{eqBass:2}],['var(--c2)','Alto e energético','-8 LUFS, compressão rápida',{LOUD:20}]],
  semba:[['var(--c6)','Calor analógico','saturação tipo fita, médios cheios',{SAT:18}],['var(--c3)','Brilho natural','agudos abertos mas suaves',{eqAir:1.5}],['var(--c5)','Dinâmica viva','menos compressão, respira',{LOUD:-8}]],
  zouk:[['var(--c5)','Suavidade','médios doces, sem agressividade',{eqMid:1}],['var(--c6)','Graves redondos','baixo presente mas controlado',{eqBass:1.5}],['var(--c4)','Espaço romântico','stereo amplo, reverb-friendly',{WIDE:12}]],
  club:[['var(--c1)','Loudness de club','-9 LUFS, clipper ativo',{LOUD:22}],['var(--c6)','Sub para sistema grande','graves sólidos em mono',{eqBass:2}],['var(--c2)','Impacto físico','transientes fortes',{PUNCH:18}]],
  radio:[['var(--c3)','Brilho e clareza','médios e agudos à frente',{eqAir:2,eqMid:1}],['var(--c5)','Consistente','compressão controlada, -14 LUFS',{LOUD:5}]],
};
window.fxVibeApply=function(){
  const t=($('fx-vibe-in').value||'').toLowerCase();
  let key=null;
  if(/kizomb/.test(t))key='kizomb';else if(/kuduro/.test(t))key='kuduro';else if(/semba/.test(t))key='semba';else if(/zouk/.test(t))key='zouk';else if(/club|festa|3h|2h|noite/.test(t))key='club';else if(/rádio|radio|manhã|manha/.test(t))key='radio';
  const out=$('fx-vibe-out');
  if(!key){out.innerHTML=card('<span style="color:var(--muted)">Não reconheci a vibe. Tenta: kizombada, kuduro, semba, zouk, club, rádio.</span>');return;}
  const rows=VIBES[key];
  // apply
  rows.forEach(([c,t2,sub,adj])=>{Object.keys(adj).forEach(k=>{
    if(k.startsWith('eq')&&typeof window[k]!=='undefined'&&window[k])window[k].gain.value+=adj[k];
    else if(typeof kvals!=='undefined'&&kvals&&k in kvals)kvals[k]=Math.max(0,Math.min(100,(kvals[k]||50)+adj[k]));
  });});
  if(typeof refreshKnobs==='function')refreshKnobs();if(typeof applyDSP==='function')applyDSP();if(typeof syncEQSliders==='function')syncEQSliders();
  out.innerHTML='<div style="font-size:10px;color:var(--muted2);margin-bottom:4px;">TRADUÇÃO TÉCNICA APLICADA:</div>'+rows.map(([c,t2,sub])=>card(`<b style="color:${c}">${t2}</b><br><span style="font-size:11px;color:var(--muted)">${sub}</span>`,c)).join('');
  status('Vibe "'+key+'" traduzida e aplicada');
};

// ════════ SKIP-RISK SCORE ════════
window.fxView_skiprisk=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Estima o risco de skip nos primeiros 8 s. <b>Heurístico, indicativo.</b></div>
  ${btn('CALCULAR SKIP-RISK','var(--c2)','fxSkipRisk()','')}
  <div id="fx-skip-out" style="margin-top:10px;"></div>`;
  window.fxSkipRisk();
};
window.fxSkipRisk=function(){
  if(!hasAudio())return;
  const d=audioBuffer.getChannelData(0),sr=audioBuffer.sampleRate;
  const intro=Math.min(d.length,sr*8);
  // time to reach 60% of intro peak energy
  let peak=0;for(let i=0;i<intro;i+=100)peak=Math.max(peak,Math.abs(d[i]));
  let openT=8;const winE=Math.floor(sr*0.25);
  for(let i=0;i+winE<intro;i+=winE){let e=0;for(let j=0;j<winE;j+=50)e+=Math.abs(d[i+j]);e/=(winE/50);if(e>peak*0.5){openT=i/sr;break;}}
  let risk=Math.min(95,Math.round(openT/8*70 + (peak<0.2?20:0)));
  const col=risk<30?'var(--c4)':risk<55?'var(--c3)':'var(--c7)';
  const out=$('fx-skip-out');
  let h=card(`<div style="font-size:10px;color:var(--muted2)">RISCO DE SKIP (primeiros 8s)</div><div style="font-size:28px;font-weight:700;color:${col};font-family:'Orbitron',monospace;">${risk}%</div><div style="height:10px;background:var(--bg4,#1c1c2a);border-radius:5px;margin-top:6px;"><div style="width:${risk}%;height:100%;background:${col};border-radius:5px;"></div></div>`,col);
  h+=card(`<span style="font-size:12px;color:var(--text)">A intro demora <b>${openT.toFixed(1)}s</b> a "abrir". ${openT>3?'Risco de perder o ouvinte — começa com o gancho ou um impacto nos 1ºs 2s.':'Boa — prende cedo.'}</span>`, openT>3?'var(--c2)':'var(--c4)');
  out.innerHTML=h;
};

// ════════ GÉMEO DO OUVINTE ════════
const TWINS={
  earbuds:{label:'Miúdo · earbuds furados',bands:[[120,-14,1],[2500,4,1.2],[7000,5,1],[11000,-10,0.9]],mono:true},
  djclub:{label:'DJ · club PA',bands:[[50,4,0.8],[120,3,1],[8000,2,1]],mono:false},
  tia:{label:'Tia · telemóvel na cozinha',bands:[[250,-18,1],[1000,4,1.2],[3000,5,1.3],[8000,-8,0.9]],mono:true},
  audiofilo:{label:'Audiófilo · headphones',bands:[],mono:false},
};
let _twinSel='earbuds',_twinNode=null,_twinOn=false;
window.fxView_twin=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Não é a coluna — é o ser humano e o contexto. Escolhe a persona e ouve.</div>
  ${chipRow(Object.keys(TWINS).map(k=>({v:k,label:TWINS[k].label,active:k===_twinSel})),'fxTwinSel','var(--c6)')}
  ${canvasEl('fx-twin-cv',120)}
  <div id="fx-twin-state" style="font-size:11px;color:var(--muted);margin-top:8px;"></div>
  ${btn('OUVIR COMO ESTA PERSONA','var(--c6)','fxTwinToggle()','')}`;
  fxTwinDraw();$('fx-twin-state').textContent=_twinOn?('A ouvir como: '+TWINS[_twinSel].label):'Desligado';
};
window.fxTwinSel=function(v){_twinSel=v;if(_twinOn)fxTwinBuild();fxOpen('twin');};
function fxTwinDraw(){const cv=$('fx-twin-cv');if(!cv)return;const W=cv.offsetWidth||600;cv.width=W;const H=cv.height;const ctx=cv.getContext('2d');ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);gridFreq(ctx,W,H);
  const sp=TWINS[_twinSel];ctx.beginPath();for(let px=0;px<=W;px++){const f=20*Math.pow(1000,px/W);let g=0;sp.bands.forEach(([fc,gn,q])=>{const dd=Math.log2(f/fc);g+=gn*Math.exp(-(dd*dd)/(2/q));});ctx.lineTo(px,H/2-g*3);}ctx.strokeStyle='#b855f7';ctx.lineWidth=2;ctx.stroke();if(sp.mono){ctx.fillStyle='#b855f7';ctx.font='9px monospace';ctx.fillText('MONO',W-46,16);}}
function fxTwinBuild(){if(typeof audioCtx==='undefined'||!audioCtx||typeof masterGain==='undefined')return;if(_twinNode){try{masterGain.disconnect(_twinNode.input);}catch(e){}try{_twinNode.output.disconnect();}catch(e){}_twinNode=null;}
  const sp=TWINS[_twinSel];const input=audioCtx.createGain(),output=audioCtx.createGain();let last=input;sp.bands.forEach(([fc,gn,q])=>{const f=audioCtx.createBiquadFilter();f.type='peaking';f.frequency.value=fc;f.gain.value=gn;f.Q.value=q;last.connect(f);last=f;});last.connect(output);_twinNode={input,output};masterGain.connect(input);output.connect(audioCtx.destination);}
window.fxTwinToggle=function(){if(!_twinOn){fxTwinBuild();_twinOn=true;status('A ouvir como '+TWINS[_twinSel].label);}else{if(_twinNode){try{masterGain.disconnect(_twinNode.input);}catch(e){}try{_twinNode.output.disconnect();}catch(e){}_twinNode=null;}_twinOn=false;status('Gémeo desligado');}const st=$('fx-twin-state');if(st)st.textContent=_twinOn?('A ouvir como: '+TWINS[_twinSel].label):'Desligado';};

// ════════ TIME CAPSULE ════════
window.fxView_capsule=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Cada master fica um snapshot vivo. Reabre no futuro e ouve a tua evolução.</div>
  <div style="display:flex;gap:8px;"><input id="fx-cap-name" placeholder="nome do snapshot (ex: Kuduro Fogo)" style="flex:1;padding:9px 12px;border-radius:6px;border:1px solid var(--c4);background:var(--bg3);color:var(--text);font-family:'Rajdhani';">
  <button onclick="fxCapSave()" style="padding:0 16px;border-radius:6px;border:1px solid var(--c4);background:color-mix(in srgb,var(--c4) 16%,transparent);color:var(--c4);font-family:'Rajdhani';font-weight:700;cursor:pointer;">GUARDAR SNAPSHOT</button></div>
  <div id="fx-cap-list" style="margin-top:10px;"></div>`;
  fxCapList();
};
function fxCapData(){try{return JSON.parse(localStorage.getItem(LS+'capsule')||'[]');}catch(e){return [];}}
window.fxCapSave=function(){
  if(!hasAudio())return;
  const name=($('fx-cap-name').value||'').trim();if(!name){status('Dá um nome');return;}
  const m=measure(audioBuffer);
  const d=fxCapData();d.push({name,t:Date.now(),lufs:m.lufs,crest:m.crest,low:m.low,high:m.high});
  localStorage.setItem(LS+'capsule',JSON.stringify(d));fxCapList();status('Snapshot "'+name+'" guardado');
};
function fxCapList(){
  const d=fxCapData(),host=$('fx-cap-list');if(!host)return;
  if(!d.length){host.innerHTML='<div style="color:var(--muted);font-size:11px;">Sem snapshots. Guarda o teu primeiro.</div>';return;}
  let h='<div style="font-size:10px;color:var(--muted2);margin-bottom:6px;">LINHA DO TEMPO</div>';
  d.forEach((s,i)=>{h+=card(`<b style="color:var(--c4)">${s.name}</b> <span style="color:var(--muted2);font-size:10px;">${new Date(s.t).toLocaleDateString('pt-PT')}</span><br><span style="font-size:11px;color:var(--muted)">LUFS ${s.lufs.toFixed(1)} · crest ${s.crest.toFixed(1)} dB · graves ${s.low.toFixed(0)}%</span> <button onclick="fxCapDel(${i})" style="float:right;border:1px solid var(--c7);background:transparent;color:var(--c7);border-radius:4px;font-size:10px;padding:2px 7px;cursor:pointer;">×</button>`,'var(--c4)');});
  if(d.length>=2){const a=d[0],z=d[d.length-1];
    const obs=[];if(z.crest>a.crest+0.5)obs.push('usas mais dinâmica');if(z.crest<a.crest-0.5)obs.push('comprimes mais');if(z.low<a.low-2)obs.push('graves mais limpos');if(z.high>a.high+2)obs.push('mais brilho');
    h+=card('<b style="color:var(--c4)">A IA COMENTA A TUA EVOLUÇÃO</b><br><span style="font-size:12px;color:var(--text)">De "'+a.name+'" para "'+z.name+'": '+(obs.length?obs.join(', '):'estilo consistente')+'.</span>','var(--c4)');
  }
  host.innerHTML=h;
}
window.fxCapDel=function(i){const d=fxCapData();d.splice(i,1);localStorage.setItem(LS+'capsule',JSON.stringify(d));fxCapList();};

// ════════ CO-MASTER AO VIVO ════════
window.fxView_comaster=function(b){
  const room='live-'+Math.random().toString(36).slice(2,7);
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Dois produtores no mesmo master, em tempo real. <b>Nota:</b> a sincronização ao vivo entre dispositivos requer o servidor da BeatFreak; aqui é a estrutura local.</div>
  <div style="display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;">
    <span style="flex:1;font-family:monospace;font-size:12px;color:var(--c5);">beatfreakstudio.com/live/${room}</span>
    <button onclick="fxCoCopy('beatfreakstudio.com/live/${room}')" style="border:1px solid var(--c5);background:color-mix(in srgb,var(--c5) 16%,transparent);color:var(--c5);border-radius:6px;padding:6px 12px;font-family:'Rajdhani';font-weight:700;font-size:10px;cursor:pointer;">CONVIDAR</button>
  </div>
  ${card('<div style="text-align:center;font-size:12px;color:var(--muted);padding:14px;">Partilha o link com outro produtor. Quando ambos estiverem na sala, cada edição aparece em tempo real para os dois.<br><br><span style="color:var(--c4)">● à espera de um segundo produtor...</span></div>','var(--c5)')}`;
};
window.fxCoCopy=function(t){navigator.clipboard&&navigator.clipboard.writeText(t);status('Link de sessão copiado');};

// ════════ PORQUE O HIT É HIT ════════
window.fxView_hitdna=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Carrega um hit de referência. A suite mede-o e mostra a distância até à tua faixa.</div>
  <label style="display:inline-block;padding:9px 16px;border-radius:6px;border:1px solid var(--c3);background:color-mix(in srgb,var(--c3) 14%,transparent);color:var(--c3);font-family:'Rajdhani';font-weight:700;font-size:11px;cursor:pointer;">CARREGAR HIT DE REFERÊNCIA<input type="file" accept="audio/*" onchange="fxHitLoad(this.files[0])" style="display:none;"></label>
  <div id="fx-hit-out" style="margin-top:10px;"></div>`;
};
window.fxHitLoad=async function(file){
  if(!file)return;if(!hasAudio()){status('Carrega primeiro a TUA faixa na app');return;}
  status('A analisar o hit...');
  try{
    const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new(window.AudioContext||window.webkitAudioContext)();
    const buf=await ac.decodeAudioData(await file.arrayBuffer());
    const ref=measure(buf), me=measure(audioBuffer);
    const cmp=(a,b2,tol)=>Math.max(0,Math.round(100-Math.abs(a-b2)/tol*100));
    const factors=[
      ['var(--c4)','Loudness de impacto',`hit ${ref.lufs.toFixed(1)} LUFS · tu ${me.lufs.toFixed(1)}`,cmp(me.lufs,ref.lufs,6)],
      ['var(--c5)','Controlo de graves',`hit ${ref.low.toFixed(0)}% · tu ${me.low.toFixed(0)}%`,cmp(me.low,ref.low,15)],
      ['var(--c2)','Energia de agudos',`hit ${ref.high.toFixed(0)}% · tu ${me.high.toFixed(0)}%`,cmp(me.high,ref.high,12)],
      ['var(--c6)','Dinâmica (crest)',`hit ${ref.crest.toFixed(1)} · tu ${me.crest.toFixed(1)} dB`,cmp(me.crest,ref.crest,6)],
    ];
    let h=card('<span style="font-size:12px;color:var(--text)">Referência analisada. Barras = quão perto a tua faixa está do padrão do hit.</span>','var(--c3)');
    h+=factors.map(([c,t,sub,pct])=>card(`<b style="color:${c}">${t}</b> <span style="float:right;color:${c};font-family:monospace;">${pct}%</span><br><span style="font-size:11px;color:var(--muted)">${sub}</span><div style="height:6px;background:var(--bg4,#1c1c2a);border-radius:3px;margin-top:5px;"><div style="width:${pct}%;height:100%;background:${c};border-radius:3px;"></div></div>`,c)).join('');
    $('fx-hit-out').innerHTML=h;status('Hit analisado');
  }catch(e){status('Erro ao ler o ficheiro: '+e.message);}
};

// ════════ AUTO-ADAPTAÇÃO AO DESTINO ════════
const DESTS={
  spotify:{label:'Spotify / Apple',lufs:-14,hp:20,lp:20000},
  club:{label:'Club / DJ',lufs:-9,hp:25,lp:20000},
  whatsapp:{label:'WhatsApp',lufs:-14,hp:120,lp:9000},
  vinil:{label:'Vinil (RIAA-safe)',lufs:-16,hp:30,lp:16000},
};
window.fxView_adaptive=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Gera versões otimizadas para cada destino a partir do teu master, num clique.</div>
  <div id="fx-adapt-list">`+Object.keys(DESTS).map(k=>`<div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:6px;"><span style="flex:1;font-family:'Rajdhani';font-weight:700;color:var(--text);">${DESTS[k].label}</span><span style="font-family:monospace;font-size:11px;color:var(--muted);">${DESTS[k].lufs} LUFS</span><button onclick="fxAdaptExport('${k}')" style="border:1px solid var(--c2);background:color-mix(in srgb,var(--c2) 14%,transparent);color:var(--c2);border-radius:6px;padding:6px 12px;font-family:'Rajdhani';font-weight:700;font-size:10px;cursor:pointer;">EXPORTAR</button></div>`).join('')+`</div>
  ${btn('EXPORTAR TODOS OS DESTINOS','var(--c2)','fxAdaptAll()','')}`;
};
async function fxRenderDest(k){
  const dst=DESTS[k];const proc=await renderProcessed();
  const off=new OfflineAudioContext(proc.numberOfChannels,proc.length,proc.sampleRate);
  const src=off.createBufferSource();src.buffer=proc;
  const hp=off.createBiquadFilter();hp.type='highpass';hp.frequency.value=dst.hp;
  const lp=off.createBiquadFilter();lp.type='lowpass';lp.frequency.value=dst.lp;
  const m=measure(proc);const g=off.createGain();g.gain.value=Math.pow(10,(dst.lufs-m.lufs)/20);
  const lim=off.createDynamicsCompressor();lim.threshold.value=-1;lim.ratio.value=20;lim.attack.value=0.001;lim.release.value=0.05;
  src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(lim);lim.connect(off.destination);src.start();
  return await off.startRendering();
}
window.fxAdaptExport=async function(k){if(!hasAudio())return;status('A gerar versão '+DESTS[k].label+'...');const buf=await fxRenderDest(k);dl(bufToWav(buf),'master_'+k+'.wav');status(DESTS[k].label+' exportado');};
window.fxAdaptAll=async function(){if(!hasAudio())return;for(const k of Object.keys(DESTS)){status('A gerar '+DESTS[k].label+'...');const buf=await fxRenderDest(k);dl(bufToWav(buf),'master_'+k+'.wav');await new Promise(r=>setTimeout(r,400));}status('Todos os destinos exportados');};

})();
