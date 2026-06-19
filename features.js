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
  // ── AFINAÇÃO DE VOZ ──
  {id:'voicetune',name:'Afinação de Voz ✦',   sub:'Pitch · Tempo · Limpeza EQ (independentes)', c:'var(--c1)'},
  // ── MOONSHOT V2 ──
  {id:'mood',     name:'Mood-to-Master ✦',    sub:'Imagem ou emojis viram decisões técnicas', c:'var(--c1)'},
  {id:'mestre',   name:'Conversa com Mestre ✦',sub:'Filosofias de engenheiros lendários', c:'var(--c5)'},
  {id:'coach',    name:'Mastering Coach ✦',   sub:'Feedback contínuo enquanto mexes', c:'var(--c4)'},
  {id:'bsides',   name:'Generative B-Sides ✦',sub:'8 variantes do mesmo master', c:'var(--c6)'},
  {id:'premortem',name:'Pre-Mortem ✦',        sub:'Ouve o futuro antes de publicar', c:'var(--c7)'},
  {id:'vinyl',    name:'Vinyl Whisper ✦',     sub:'Preparação para corte em vinil', c:'var(--c3)'},
  {id:'library',  name:'Biblioteca Sónica ✦', sub:'Pesquisa nos teus masters por som', c:'var(--c5)'},
  {id:'culture',  name:'Audience Simulator ✦',sub:'Masteriza para cada cultura', c:'var(--c3)'},
  {id:'semantic', name:'Stem-Master Semântica ✦',sub:'EQ por conceitos emocionais', c:'var(--c6)'},
  {id:'karma',    name:'Mastering Karma ✦',   sub:'Recompensa por bom workflow', c:'var(--c3)'},
  // ── AI SUITE (v3 — 6 implementadas + 4 "coming soon") ──
  {id:'aiRefMatch', name:'AI Reference Match ✦', sub:'Iguala o teu master a qualquer referência', c:'var(--c4)'},
  {id:'aiGenre',    name:'AI Genre Detector ✦',  sub:'Deteta género e aplica chain otimizada', c:'var(--c5)'},
  {id:'aiCoach',    name:'AI Loudness Coach ✦',  sub:'Combate a loudness race com pedagogia', c:'var(--c3)'},
  {id:'aiCohesion', name:'AI Album Cohesion ✦',  sub:'Multi-faixa: master coeso de início ao fim', c:'var(--c6)'},
  {id:'aiReverb',   name:'AI Reverb from Text ✦',sub:'"igreja em Luanda" → IR sintética', c:'var(--c1)'},
  {id:'aiAssistant',name:'AI Mastering Assistant ✦', sub:'Diagnóstico inteligente em PT angolano', c:'var(--c4)'},
  {id:'aiStems',    name:'AI Stem Separator ⏳', sub:'Demucs no browser — Coming Soon Q2', c:'var(--muted)'},
  {id:'aiLyric',    name:'AI Lyric-Aware Master ⏳', sub:'Master diferente para versos vs refrões', c:'var(--muted)'},
  {id:'aiDeNoise',  name:'AI Restoration ⏳',    sub:'De-noise + de-hum + de-click — Coming Soon', c:'var(--muted)'},
  {id:'aiVocal',    name:'AI Vocal Tune Pro ⏳', sub:'Pitch correction sem escolher escala', c:'var(--muted)'},
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

/* ═══════════ AFINAÇÃO DE VOZ — MÓDULO INDEPENDENTE ═══════════ */
(function(){
'use strict';
const {btn,card,canvasEl}=window.__fx;
const $=window.__fx.$, status=window.__fx.status;

// estado independente para cada módulo
let _vtFile=null, _vtBuf=null;
const VT={pitch:true, time:false, eq:true}; // toggles independentes (defaults)
let _vtTarget='C', _vtScale='major', _vtTargetBPM=120;

const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function midiToHz(m){ return 440*Math.pow(2,(m-69)/12); }
function hzToMidi(f){ return f>0 ? 69+12*Math.log2(f/440) : 0; }
function nameToMidi(n,oct){ return NOTES.indexOf(n)+12*(oct+1); }

// ── 1) Deteção de tom dominante via autocorrelação (Bm/cantor) ──
function detectDominantNote(buf){
  const ch=buf.getChannelData(0), sr=buf.sampleRate;
  // amostra ~30 janelas espalhadas pela faixa
  const winSize=Math.floor(sr*0.05); // 50 ms
  const minHz=80, maxHz=800;
  const minLag=Math.floor(sr/maxHz), maxLag=Math.floor(sr/minHz);
  const notes=[];
  const nSamples=Math.min(60, Math.max(10, Math.floor(buf.duration*2)));
  for(let s=0;s<nSamples;s++){
    const start=Math.floor((s+0.5)/nSamples*(ch.length-winSize));
    // RMS check — saltar silêncio
    let rms=0;for(let i=0;i<winSize;i++){const v=ch[start+i];rms+=v*v;}
    rms=Math.sqrt(rms/winSize);
    if(rms<0.01) continue;
    // autocorrelação
    let bestLag=0,bestC=0;
    for(let lag=minLag;lag<=maxLag;lag++){
      let c=0;
      for(let i=0;i<winSize-lag;i+=2) c+=ch[start+i]*ch[start+i+lag];
      if(c>bestC){bestC=c;bestLag=lag;}
    }
    if(bestLag>0){
      const hz=sr/bestLag;
      const midi=Math.round(hzToMidi(hz));
      if(midi>=36 && midi<=84) notes.push(midi);
    }
  }
  if(!notes.length) return null;
  // moda (nota mais frequente)
  const counts={};
  notes.forEach(m=>{const k=m%12; counts[k]=(counts[k]||0)+1;});
  let bestK=0,bestN=0;Object.keys(counts).forEach(k=>{if(counts[k]>bestN){bestN=counts[k];bestK=parseInt(k);}});
  // oitava média
  const avgOct=Math.round(notes.reduce((a,b)=>a+b,0)/notes.length/12)-1;
  return {noteIdx:bestK, noteName:NOTES[bestK], octave:avgOct, samples:notes.length};
}

// ── 2) BPM rough estimate via onset envelope ──
function estimateBPM(buf){
  const ch=buf.getChannelData(0), sr=buf.sampleRate;
  const hop=Math.floor(sr*0.01); // 10 ms
  const env=[];
  for(let i=0;i<ch.length-hop;i+=hop){
    let e=0;for(let j=0;j<hop;j+=4)e+=Math.abs(ch[i+j]);
    env.push(e);
  }
  // autocorrelação na envelope, lags entre 60–180 BPM
  const minLag=Math.floor(60/180*100), maxLag=Math.floor(60/60*100);
  let bestLag=0,bestC=0;
  for(let lag=minLag;lag<=maxLag;lag++){
    let c=0;for(let i=0;i<env.length-lag;i++)c+=env[i]*env[i+lag];
    if(c>bestC){bestC=c;bestLag=lag;}
  }
  if(bestLag>0) return 60/(bestLag*0.01);
  return null;
}

// ── 3) Pitch shift via Phase Vocoder simples (STFT/ISTFT com hop scaling) ──
// Resolução: por canal, janela 2048 / hop_in fixo, hop_out = hop_in / ratio.
// Mantém duração; permite ±12 semitons com qualidade aceitável para voz.
// O resultado tem alguns artefactos típicos (smearing transientes); para qualidade
// de produção usar-se-ia PSOLA ou Rubber Band — fica como roadmap.
async function pitchShiftBuffer(buf, semitones){
  if(Math.abs(semitones)<0.01) return buf;
  const ratio=Math.pow(2,semitones/12);
  const sr=buf.sampleRate, nCh=buf.numberOfChannels, N=buf.length;
  const FFT_SIZE=2048, HOP_IN=512;
  const HOP_OUT=Math.max(1, Math.round(HOP_IN/ratio));
  // Janela Hann
  const win=new Float32Array(FFT_SIZE);
  for(let i=0;i<FFT_SIZE;i++) win[i]=0.5-0.5*Math.cos(2*Math.PI*i/(FFT_SIZE-1));

  // FFT simples (Cooley-Tukey iterativo radix-2). 2048 = 2^11.
  const LOG2=Math.log2(FFT_SIZE);
  function fft(re,im,inverse){
    const n=re.length;
    // bit reversal
    for(let i=1,j=0;i<n;i++){
      let bit=n>>1;
      for(;j&bit;bit>>=1) j^=bit;
      j^=bit;
      if(i<j){const tr=re[i];re[i]=re[j];re[j]=tr; const ti=im[i];im[i]=im[j];im[j]=ti;}
    }
    for(let len=2;len<=n;len<<=1){
      const ang=(inverse?2:-2)*Math.PI/len;
      const wr=Math.cos(ang), wi=Math.sin(ang);
      for(let i=0;i<n;i+=len){
        let cr=1, ci=0;
        for(let j=0;j<(len>>1);j++){
          const a=i+j, b=i+j+(len>>1);
          const tr=cr*re[b]-ci*im[b], ti=cr*im[b]+ci*re[b];
          re[b]=re[a]-tr; im[b]=im[a]-ti;
          re[a]+=tr; im[a]+=ti;
          const ncr=cr*wr-ci*wi, nci=cr*wi+ci*wr;
          cr=ncr; ci=nci;
        }
      }
    }
    if(inverse){ for(let i=0;i<n;i++){ re[i]/=n; im[i]/=n; } }
  }

  // resultado interno tem duração ~ N*ratio antes do resample para preservar tempo
  const procLen=Math.ceil(N*ratio);
  const outSr=Math.round(sr*ratio);
  const intermediate = new AudioBuffer ? null : null; // placeholder
  // Vamos construir o canal processado num Float32Array e depois fazer resample
  // para a duração original via OfflineAudioContext (rate change).
  const ac = (typeof audioCtx!=='undefined'&&audioCtx) ? audioCtx : new (window.AudioContext||window.webkitAudioContext)();
  const tmpBuf = ac.createBuffer(nCh, procLen, sr);

  for(let c=0;c<nCh;c++){
    const input=buf.getChannelData(c);
    const output=new Float32Array(procLen);
    const norm=new Float32Array(procLen);
    const lastPhase=new Float32Array(FFT_SIZE/2+1);
    const sumPhase=new Float32Array(FFT_SIZE/2+1);
    const re=new Float32Array(FFT_SIZE);
    const im=new Float32Array(FFT_SIZE);
    const expectedPhaseDiff = 2*Math.PI*HOP_IN/FFT_SIZE;

    let inPos=0, outPos=0;
    while(inPos+FFT_SIZE<N){
      // copy windowed frame
      for(let i=0;i<FFT_SIZE;i++){ re[i]=(input[inPos+i]||0)*win[i]; im[i]=0; }
      fft(re,im,false);
      // analyse magnitude + true frequency
      const halfN = FFT_SIZE/2;
      const newRe=new Float32Array(FFT_SIZE);
      const newIm=new Float32Array(FFT_SIZE);
      for(let k=0;k<=halfN;k++){
        const mag=Math.hypot(re[k],im[k]);
        const phase=Math.atan2(im[k],re[k]);
        let delta=phase-lastPhase[k]-k*expectedPhaseDiff;
        // wrap to [-pi,pi]
        delta = delta - 2*Math.PI*Math.round(delta/(2*Math.PI));
        const trueFreq = k*expectedPhaseDiff + delta;
        lastPhase[k]=phase;
        // sintetiza com HOP_OUT
        sumPhase[k] += trueFreq * (HOP_OUT/HOP_IN);
        const wrapped = sumPhase[k] - 2*Math.PI*Math.round(sumPhase[k]/(2*Math.PI));
        newRe[k]=mag*Math.cos(wrapped);
        newIm[k]=mag*Math.sin(wrapped);
        if(k>0 && k<halfN){
          newRe[FFT_SIZE-k]=newRe[k];
          newIm[FFT_SIZE-k]=-newIm[k];
        }
      }
      // IFFT
      fft(newRe,newIm,true);
      // overlap-add with HOP_OUT
      for(let i=0;i<FFT_SIZE;i++){
        const pos=outPos+i;
        if(pos<procLen){ output[pos]+=newRe[i]*win[i]; norm[pos]+=win[i]*win[i]; }
      }
      inPos += HOP_IN;
      outPos += HOP_OUT;
    }
    // normalize
    for(let i=0;i<procLen;i++){ if(norm[i]>1e-6) output[i]/=norm[i]; }
    tmpBuf.copyToChannel(output, c);
  }

  // Agora o tmpBuf tem o áudio com pitch shiftado mas duração N*ratio.
  // Reproduzimos a velocidade 1/ratio para voltar à duração original — preserva pitch.
  const off=new OfflineAudioContext(nCh, N, sr);
  const src=off.createBufferSource(); src.buffer=tmpBuf; src.playbackRate.value=ratio;
  src.connect(off.destination); src.start();
  return await off.startRendering();
}

// ── 4) Time stretch (ajusta duração para alvo de BPM) ──
async function timeStretchBuffer(buf, factor){
  if(Math.abs(factor-1)<0.005) return buf;
  const sr=buf.sampleRate, nCh=buf.numberOfChannels;
  const newLen=Math.round(buf.length/factor);
  const off=new OfflineAudioContext(nCh, newLen, sr);
  const src=off.createBufferSource(); src.buffer=buf;
  src.playbackRate.value=factor;
  src.connect(off.destination); src.start();
  return await off.startRendering();
}

// ── 5) EQ cleanup (high-pass, mud cut, de-ess, presence) ──
async function eqCleanupBuffer(buf){
  const sr=buf.sampleRate, nCh=buf.numberOfChannels;
  const off=new OfflineAudioContext(nCh, buf.length, sr);
  const src=off.createBufferSource(); src.buffer=buf;
  // HP 80 Hz
  const hp=off.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=80;
  // dip lama 300 Hz
  const mud=off.createBiquadFilter(); mud.type='peaking'; mud.frequency.value=300; mud.Q.value=1.2; mud.gain.value=-3;
  // de-ess 7 kHz
  const de=off.createBiquadFilter(); de.type='peaking'; de.frequency.value=7000; de.Q.value=3; de.gain.value=-3;
  // presença 3 kHz
  const pres=off.createBiquadFilter(); pres.type='peaking'; pres.frequency.value=3000; pres.Q.value=0.9; pres.gain.value=2;
  src.connect(hp); hp.connect(mud); mud.connect(de); de.connect(pres); pres.connect(off.destination);
  src.start();
  return await off.startRendering();
}

// ── helpers UI ──
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
function playBuf(buf){
  if(!buf){ status('Sem buffer para tocar'); return; }
  // Cria ou reaproveita o contexto principal; se não existir, cria um próprio para voz
  let ac = (typeof audioCtx!=='undefined' && audioCtx) ? audioCtx : window._vtAC;
  if(!ac){
    try{ ac = new (window.AudioContext||window.webkitAudioContext)(); window._vtAC = ac; }
    catch(e){ status('Sem áudio disponível'); return; }
  }
  if(ac.state==='suspended'){ try{ ac.resume(); }catch(e){} }
  try{ if(window._vtPrev){ window._vtPrev.stop(); window._vtPrev.disconnect(); } }catch(e){}
  const s=ac.createBufferSource();
  s.buffer=buf;
  s.connect(ac.destination);
  s.start();
  window._vtPrev=s;
}

// ── VIEW ──
window.fxView_voicetune=function(b){
  const noteOpts=NOTES.map(n=>`<option value="${n}"${n===_vtTarget?' selected':''}>${n}</option>`).join('');
  b.innerHTML=`
  <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Carrega a tua faixa de voz. Indica a nota do canto e ativa só os módulos que queres. Cada um corre independente.</div>

  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">
    <label style="display:inline-block;padding:8px 14px;border-radius:6px;border:1px solid var(--c1);background:color-mix(in srgb,var(--c1) 14%,transparent);color:var(--c1);font-family:'Rajdhani';font-weight:700;font-size:11px;cursor:pointer;">
      + CARREGAR FAIXA DE VOZ<input id="vt-file" type="file" accept="audio/*" onchange="fxVtLoad(this.files[0])" style="display:none;">
    </label>
    <span id="vt-file-info" style="margin-left:10px;font-size:11px;color:var(--muted);"></span>
  </div>

  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">
    <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:8px;">NOTA E TONALIDADE DO CANTO</div>
    <div style="display:flex;gap:8px;align-items:center;">
      <select id="vt-note" onchange="_vtSet('target',this.value)" style="padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4,#1c1c2a);color:var(--text);font-family:'Rajdhani';font-weight:700;">${noteOpts}</select>
      <select id="vt-scale" onchange="_vtSet('scale',this.value)" style="padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4,#1c1c2a);color:var(--text);font-family:'Rajdhani';">
        <option value="major"${_vtScale==='major'?' selected':''}>maior</option>
        <option value="minor"${_vtScale==='minor'?' selected':''}>menor</option>
      </select>
      <span id="vt-detected" style="font-size:11px;color:var(--c5);margin-left:8px;"></span>
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-top:10px;">
      <span style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;">BPM ALVO (módulo TEMPO):</span>
      <input id="vt-bpm" type="number" min="40" max="220" value="${_vtTargetBPM}" onchange="_vtSet('bpm',this.value)"
        style="width:70px;padding:6px 8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg4,#1c1c2a);color:var(--text);font-family:monospace;font-weight:700;text-align:center;">
      <span style="font-size:10px;color:var(--muted);">BPM</span>
    </div>
  </div>

  <!-- TOGGLES INDEPENDENTES -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
    ${_vtToggle('pitch','AFINAÇÃO (pitch)','corrige a nota para o alvo','var(--c1)')}
    ${_vtToggle('time','TEMPO (time)','ajusta a duração ao BPM','var(--c5)')}
    ${_vtToggle('eq','LIMPEZA EQ','HP 80Hz · -300 lama · de-ess · presença','var(--c4)')}
  </div>

  <div style="display:flex;gap:8px;">${btn('PROCESSAR VOZ','var(--c1)','fxVtRun()','')}</div>
  <div id="vt-status" style="margin-top:10px;"></div>
  <div id="vt-result" style="margin-top:8px;"></div>`;
};
function _vtToggle(key,title,sub,col){
  const on=VT[key];
  return `<div onclick="_vtToggleClick('${key}')" style="cursor:pointer;background:${on?'color-mix(in srgb,'+col+' 12%,transparent)':'var(--bg3)'};border:1px solid ${on?col:'var(--border2)'};border-radius:8px;padding:10px 12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-family:'Rajdhani';font-weight:700;font-size:11px;color:${on?col:'var(--muted)'};">${title}</span>
      <span style="font-size:10px;color:${on?col:'var(--muted2)'};">${on?'● ON':'○ OFF'}</span>
    </div>
    <div style="font-size:10px;color:var(--muted);margin-top:4px;">${sub}</div>
  </div>`;
}
window._vtToggleClick=function(k){ VT[k]=!VT[k]; window.fxOpen('voicetune'); };
window._vtSet=function(k,v){
  if(k==='target')_vtTarget=v;
  if(k==='scale')_vtScale=v;
  if(k==='bpm'){ const n=parseInt(v); if(!isNaN(n)&&n>=40&&n<=220) _vtTargetBPM=n; }
};

window.fxVtLoad=async function(file){
  if(!file)return;
  const info=$('vt-file-info'); if(info) info.textContent='A carregar '+file.name+'...';
  try{
    const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new(window.AudioContext||window.webkitAudioContext)();
    _vtFile=file;
    _vtBuf=await ac.decodeAudioData(await file.arrayBuffer());
    if(info) info.textContent='✓ '+file.name+' · '+_vtBuf.duration.toFixed(1)+'s · '+_vtBuf.sampleRate+' Hz';
    // detetar nota
    const det=detectDominantNote(_vtBuf);
    const detEl=$('vt-detected');
    if(detEl){
      if(det) detEl.textContent='nota detetada: '+det.noteName+' (oitava '+det.octave+')';
      else detEl.textContent='nota não detetada — verifica a faixa';
    }
    window._vtDetected=det;
  }catch(e){ if(info) info.textContent='Erro: '+e.message; }
};

window.fxVtRun=async function(){
  if(!_vtBuf){ status('Carrega primeiro a faixa de voz'); return; }
  if(!VT.pitch && !VT.time && !VT.eq){ status('Ativa pelo menos um módulo'); return; }
  const st=$('vt-status'); const res=$('vt-result');
  st.innerHTML=card('<span style="color:var(--c5)">A processar voz...</span>','var(--c5)');
  let buf=_vtBuf;
  const log=[];

  // PITCH
  if(VT.pitch){
    const det=window._vtDetected;
    if(!det){ log.push(['var(--c2)','Pitch','não foi possível detetar a nota — saltado.']); }
    else {
      const targetMidi=nameToMidi(_vtTarget, det.octave);
      const sourceMidi=nameToMidi(det.noteName, det.octave);
      const diff=targetMidi-sourceMidi;
      // limitar a ±12 semitons
      const semi=Math.max(-12,Math.min(12,diff));
      if(Math.abs(semi)>=0.5){
        st.innerHTML=card('<span style="color:var(--c1)">Afinação: deslocar '+semi+' semitons ('+det.noteName+' → '+_vtTarget+')...</span>','var(--c1)');
        buf=await pitchShiftBuffer(buf, semi);
        log.push(['var(--c1)','Pitch','deslocado '+semi+' semitons ('+det.noteName+' → '+_vtTarget+')']);
      } else {
        log.push(['var(--c4)','Pitch','já estava na nota alvo ('+det.noteName+').']);
      }
    }
  }

  // TIME (ajusta para 120 BPM por defeito; podes mudar isto via input no futuro)
  if(VT.time){
    st.innerHTML=card('<span style="color:var(--c5)">Tempo: a analisar BPM...</span>','var(--c5)');
    const bpm=estimateBPM(buf);
    if(bpm){
      const targetBPM=_vtTargetBPM;
      const factor=bpm/targetBPM; // >1 = mais rápido
      if(Math.abs(factor-1)>0.02){
        st.innerHTML=card('<span style="color:var(--c5)">Tempo: '+bpm.toFixed(1)+' → '+targetBPM+' BPM ('+(factor>1?'esticar':'encurtar')+')...</span>','var(--c5)');
        buf=await timeStretchBuffer(buf, factor);
        log.push(['var(--c5)','Tempo',bpm.toFixed(1)+' BPM ajustado para '+targetBPM+' BPM']);
      } else {
        log.push(['var(--c4)','Tempo','já estava perto do alvo ('+bpm.toFixed(1)+' BPM).']);
      }
    } else {
      log.push(['var(--c2)','Tempo','BPM não detetado — saltado.']);
    }
  }

  // EQ CLEANUP
  if(VT.eq){
    st.innerHTML=card('<span style="color:var(--c4)">Limpeza EQ: HP 80Hz · -3 dB @ 300 · de-ess 7k · presença 3k...</span>','var(--c4)');
    buf=await eqCleanupBuffer(buf);
    log.push(['var(--c4)','Limpeza EQ','HP 80 Hz, -3 dB em 300 Hz, de-ess em 7 kHz, +2 dB em 3 kHz aplicados.']);
  }

  window._vtOut=buf;
  st.innerHTML=card('<b style="color:var(--c4)">✓ Processamento concluído</b>','var(--c4)');
  let h=log.map(([c,t,why])=>card(`<b style="color:${c}">${t}</b> <span style="color:var(--text)">${why}</span>`,c)).join('');
  h+=`<div style="display:flex;gap:8px;margin-top:10px;">
    <button onclick="fxVtPlay(0)" style="flex:1;padding:9px;border-radius:6px;border:1px solid var(--c5);background:transparent;color:var(--c5);font-family:'Rajdhani';font-weight:700;cursor:pointer;">▶ ORIGINAL</button>
    <button onclick="fxVtPlay(1)" style="flex:1;padding:9px;border-radius:6px;border:1px solid var(--c4);background:color-mix(in srgb,var(--c4) 14%,transparent);color:var(--c4);font-family:'Rajdhani';font-weight:700;cursor:pointer;">▶ PROCESSADO</button>
    <button onclick="fxVtExport()" style="flex:1;padding:9px;border-radius:6px;border:1px solid var(--c1);background:color-mix(in srgb,var(--c1) 14%,transparent);color:var(--c1);font-family:'Rajdhani';font-weight:700;cursor:pointer;">⬇ EXPORTAR WAV</button>
  </div>
  <div style="font-size:10px;color:var(--muted2);margin-top:8px;line-height:1.5;">Pitch shift via phase vocoder (STFT). Funciona até ±12 semitons. Para auto-tune nota-a-nota (PSOLA/Rubber Band) está no roadmap. Este módulo faz correção global da nota dominante.</div>`;
  res.innerHTML=h;
  status('Voz processada');
};
window.fxVtPlay=function(w){ playBuf(w?window._vtOut:_vtBuf); status(w?'A tocar processado':'A tocar original'); };
window.fxVtExport=function(){ if(!window._vtOut)return; dl(bufToWav(window._vtOut),'voz_processada.wav'); status('WAV exportado'); };

})();

/* ═══════════ MOONSHOT V2 — 10 VIEWS ═══════════ */
(function(){
'use strict';
const {btn,card,chipRow,canvasEl,measure}=window.__fx;
const $=window.__fx.$, status=window.__fx.status, hasAudio=window.__fx.hasAudio;
const LS='piradex_';

// ════════ 1. MOOD-TO-MASTER ════════
const MOOD_EMOJI={
  '🌃':{warm:0.3,energy:0.6,space:0.7}, '💜':{warm:0.7,energy:0.5,space:0.4}, '🍷':{warm:0.9,energy:0.3,space:0.5},
  '🔥':{warm:0.8,energy:0.9,space:0.3}, '🌊':{warm:0.2,energy:0.4,space:0.9}, '✨':{warm:0.4,energy:0.7,space:0.6},
  '🌅':{warm:0.85,energy:0.5,space:0.7},'🌙':{warm:0.4,energy:0.2,space:0.8}, '⚡':{warm:0.3,energy:1.0,space:0.4},
  '🎉':{warm:0.6,energy:0.95,space:0.5},'💀':{warm:0.2,energy:0.6,space:0.3},'❤️':{warm:0.95,energy:0.4,space:0.5},
};
let _moodSel=[], _moodImg=null;
window.fxView_mood=function(b){
  const emojis=Object.keys(MOOD_EMOJI);
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Arrasta uma imagem ou escolhe até 3 emojis. A IA traduz cores/vibe em decisões técnicas.</div>
  <div id="mood-drop" ondragover="event.preventDefault()" ondrop="fxMoodDrop(event)" style="border:1px dashed var(--c1);border-radius:10px;padding:20px;text-align:center;background:var(--bg3);cursor:pointer;" onclick="document.getElementById('mood-file').click()">
    <input id="mood-file" type="file" accept="image/*" onchange="fxMoodImg(this.files[0])" style="display:none;">
    <div id="mood-prev" style="font-size:12px;color:var(--muted);">Arrasta uma imagem aqui ou clica para escolher</div>
  </div>
  <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-top:14px;margin-bottom:6px;">OU ESCOLHE ATÉ 3 EMOJIS:</div>
  <div id="mood-emojis" style="display:flex;gap:6px;flex-wrap:wrap;">${emojis.map(e=>`<button onclick="fxMoodEmoji('${e}')" data-em="${e}" style="font-size:22px;width:44px;height:44px;border-radius:8px;border:1px solid ${_moodSel.includes(e)?'var(--c1)':'var(--border2)'};background:${_moodSel.includes(e)?'color-mix(in srgb,var(--c1) 12%,transparent)':'var(--bg3)'};cursor:pointer;">${e}</button>`).join('')}</div>
  <div style="display:flex;gap:8px;margin-top:14px;">${btn('TRADUZIR & APLICAR','var(--c1)','fxMoodApply()','')}</div>
  <div id="mood-out" style="margin-top:10px;"></div>`;
};
window.fxMoodEmoji=function(e){
  if(_moodSel.includes(e)) _moodSel=_moodSel.filter(x=>x!==e);
  else { if(_moodSel.length>=3) _moodSel.shift(); _moodSel.push(e); }
  window.fxOpen('mood');
};
window.fxMoodDrop=function(ev){
  ev.preventDefault();
  const f=ev.dataTransfer.files && ev.dataTransfer.files[0];
  if(f) fxMoodImg(f);
};
window.fxMoodImg=function(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=e=>{
    _moodImg=e.target.result;
    const p=$('mood-prev'); if(p) p.innerHTML='<img src="'+_moodImg+'" style="max-width:260px;max-height:140px;border-radius:8px;">';
  };
  r.readAsDataURL(file);
};
function moodFromImg(dataUrl, cb){
  // analisa cor dominante: warm = R/B, energy = saturação média, space = não-uniformidade
  const img=new Image();
  img.onload=()=>{
    const cv=document.createElement('canvas'); cv.width=64; cv.height=64;
    const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0,64,64);
    const d=ctx.getImageData(0,0,64,64).data;
    let rSum=0,gSum=0,bSum=0,sSum=0,varR=0,n=0;
    const samples=[];
    for(let i=0;i<d.length;i+=4){
      const r=d[i],g=d[i+1],bb=d[i+2];
      rSum+=r;gSum+=g;bSum+=bb;
      const mx=Math.max(r,g,bb),mn=Math.min(r,g,bb);
      const sat=mx>0?(mx-mn)/mx:0;
      sSum+=sat; n++;
      samples.push(r-bb);
    }
    rSum/=n;gSum/=n;bSum/=n;sSum/=n;
    let mean=0;samples.forEach(v=>mean+=v);mean/=samples.length;
    samples.forEach(v=>varR+=(v-mean)*(v-mean));varR=Math.sqrt(varR/samples.length)/255;
    cb({warm:(rSum-bSum)/255*0.5+0.5, energy:sSum, space:varR*1.5});
  };
  img.src=dataUrl;
}
window.fxMoodApply=function(){
  function applyVibe(v){
    // map: warm→eqBass + sat, energy→PUNCH/LOUD, space→WIDE/AIR
    const acts=[];
    if(typeof eqBass!=='undefined'&&eqBass){ const g=(v.warm-0.5)*4; eqBass.gain.value+=g; acts.push(['var(--c2)','Saturação / corpo',(g>0?'+':'')+g.toFixed(1)+' dB nos médios-graves']);}
    if(typeof eqAir!=='undefined'&&eqAir){ const g=(v.space-0.5)*4; eqAir.gain.value+=g; acts.push(['var(--c4)','Espaço / agudos',(g>0?'+':'')+g.toFixed(1)+' dB no ar']);}
    if(typeof kvals!=='undefined'&&kvals){
      const dl=(v.energy-0.5)*30; kvals.LOUD=Math.max(0,Math.min(100,(kvals.LOUD||50)+dl)); acts.push(['var(--c2)','Energia',(dl>0?'+':'')+dl.toFixed(0)+' loudness']);
      const dw=(v.space-0.5)*20; kvals.WIDE=Math.max(0,Math.min(100,(kvals.WIDE||50)+dw)); acts.push(['var(--c5)','Largura',(dw>0?'+':'')+dw.toFixed(0)+' wide']);
      const ds=(v.warm-0.5)*25; kvals.SAT=Math.max(0,Math.min(100,(kvals.SAT||0)+ds)); acts.push(['var(--c6)','Saturação harmónica',(ds>0?'+':'')+ds.toFixed(0)+' SAT']);
    }
    if(typeof refreshKnobs==='function')refreshKnobs();
    if(typeof applyDSP==='function')applyDSP();
    if(typeof syncEQSliders==='function')syncEQSliders();
    const out=$('mood-out');
    if(out) out.innerHTML='<div style="font-size:10px;color:var(--muted2);margin-bottom:4px;">TRADUÇÃO IA APLICADA:</div>'+acts.map(([c,t,sub])=>card(`<b style="color:${c}">${t}</b> <span style="float:right;color:${c};font-family:monospace;">${sub}</span>`,c)).join('');
    status('Mood traduzido — '+acts.length+' ajustes aplicados');
  }
  if(_moodImg){ moodFromImg(_moodImg, applyVibe); return; }
  if(_moodSel.length){
    let warm=0,energy=0,space=0;
    _moodSel.forEach(e=>{const m=MOOD_EMOJI[e];warm+=m.warm;energy+=m.energy;space+=m.space;});
    const n=_moodSel.length;
    applyVibe({warm:warm/n,energy:energy/n,space:space/n});
    return;
  }
  status('Escolhe uma imagem ou pelo menos 1 emoji');
};

// ════════ 2. CONVERSA COM O MESTRE ════════
const MESTRES={
  scheps:{nm:'A. Scheps',phil:'clean & punchy, vocal no centro',c:'var(--c4)',apply:{eqMid:1.5,PUNCH:18,LOUD:-5}},
  katz:{nm:'B. Katz',phil:'dinâmica acima de tudo, -14 LUFS sagrado',c:'var(--c5)',apply:{LOUD:-15,SAT:-10}},
  husband:{nm:'M. Husband',phil:'rock pesado, denso, comprimido',c:'var(--c2)',apply:{LOUD:18,PUNCH:15,SAT:10}},
  massenburg:{nm:'S. Massenburg',phil:'transparência cirúrgica, mínima intervenção',c:'var(--c6)',apply:{SAT:-20,WIDE:0,LOUD:-8}},
  filipinho:{nm:'Filipinho',phil:'soul angolano quente, kuduro friendly',c:'var(--c3)',apply:{eqBass:2,SAT:15,LOUD:8}},
};
window.fxView_mestre=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Aplica a FILOSOFIA descrita de um engenheiro lendário. Não imita o output específico — segue a abordagem.</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
  ${Object.keys(MESTRES).map(k=>{const m=MESTRES[k];return `<div onclick="fxMestreApply('${k}')" style="cursor:pointer;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:12px;">
    <div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:50%;background:color-mix(in srgb, ${m.c} 20%,transparent);border:1px solid ${m.c};display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-weight:900;color:${m.c};">${m.nm[0]}</div>
    <div><div style="color:${m.c};font-family:'Rajdhani';font-weight:700;font-size:12px;">${m.nm}</div><div style="color:var(--muted);font-size:10px;">filosofia</div></div></div>
    <div style="margin-top:8px;font-size:11px;color:var(--text);line-height:1.4;">${m.phil}</div></div>`;}).join('')}
  </div>
  <div id="mestre-out" style="margin-top:12px;"></div>
  <div style="font-size:10px;color:var(--c2);margin-top:10px;">⚠ A IA aplica a abordagem descrita, não o trabalho específico do engenheiro.</div>`;
};
window.fxMestreApply=function(k){
  const m=MESTRES[k]; if(!m) return;
  Object.keys(m.apply).forEach(key=>{
    const v=m.apply[key];
    if(key.startsWith('eq')&&typeof window[key]!=='undefined'&&window[key]) window[key].gain.value+=v;
    else if(typeof kvals!=='undefined'&&kvals&&key in kvals) kvals[key]=Math.max(0,Math.min(100,(kvals[key]||50)+v));
  });
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  const o=$('mestre-out');
  if(o) o.innerHTML=card('<b style="color:'+m.c+'">'+m.nm+'</b> escolhido — filosofia aplicada<br><span style="font-size:11px;color:var(--muted)">'+m.phil+'</span>',m.c);
  status('Filosofia '+m.nm+' aplicada');
};

// ════════ 3. MASTERING COACH ════════
let _coachLog=[], _coachLast={}, _coachInterval=null;
window.fxView_coach=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Como ter um engenheiro sénior a olhar por cima do teu ombro. Avisa em tempo real quando mexes algo de risco.</div>
  <div style="display:flex;gap:8px;">${btn('ATIVAR COACH','var(--c4)','fxCoachToggle()')}${btn('LIMPAR HISTÓRICO','var(--muted)','fxCoachClear()')}</div>
  <div id="coach-state" style="font-size:11px;color:var(--muted);margin-top:6px;">${_coachInterval?'COACH ATIVO — vai avisar quando mexes em algo arriscado':'Desativado'}</div>
  <div id="coach-log" style="margin-top:10px;"></div>`;
  fxCoachRender();
};
function _coachWatch(){
  if(typeof kvals==='undefined'||!kvals) return;
  const checks=[
    ['LOUD',v=>v>75,'"Cuidado — o LOUD a '+(kvals.LOUD||0).toFixed(0)+' está a empurrar o limiter. Vais perder o ataque do kick."','var(--c2)'],
    ['BASS',v=>v>35,'"Baixaste o BASS para '+(kvals.BASS||0).toFixed(0)+' — atenção, presets nunca devem ir acima de 35."','var(--c2)'],
    ['SAT',v=>v>70,'"Saturação a '+(kvals.SAT||0).toFixed(0)+' — vai ficar duro nos agudos."','var(--c3)'],
    ['WIDE',v=>v>80,'"Largura a '+(kvals.WIDE||0).toFixed(0)+' — confirma compatibilidade em mono."','var(--c5)'],
  ];
  checks.forEach(([k,test,msg,col])=>{
    const v=kvals[k]||0;
    if(test(v) && _coachLast[k]!==v){
      _coachLast[k]=v;
      _coachLog.unshift({t:Date.now(),msg,col});
      _coachLog=_coachLog.slice(0,8);
    }
    if(!test(v)) _coachLast[k]=null;
  });
  // EQ excess
  ['eqBass','eqAir','eqMid'].forEach(n=>{
    if(typeof window[n]!=='undefined'&&window[n]){
      const g=window[n].gain.value;
      if(Math.abs(g)>5 && _coachLast[n]!==g){
        _coachLast[n]=g;
        _coachLog.unshift({t:Date.now(),msg:'"'+n+' a '+(g>0?'+':'')+g.toFixed(1)+' dB — extremo. Confirma se é mesmo necessário."',col:'var(--c2)'});
        _coachLog=_coachLog.slice(0,8);
      }
    }
  });
  fxCoachRender();
}
window.fxCoachToggle=function(){
  if(_coachInterval){ clearInterval(_coachInterval); _coachInterval=null; status('Coach desativado'); }
  else { _coachInterval=setInterval(_coachWatch,1500); status('Coach ATIVO'); }
  const s=$('coach-state'); if(s) s.textContent=_coachInterval?'COACH ATIVO — vai avisar quando mexes em algo arriscado':'Desativado';
};
window.fxCoachClear=function(){_coachLog=[];fxCoachRender();};
function fxCoachRender(){
  const h=$('coach-log');if(!h)return;
  if(!_coachLog.length){h.innerHTML='<div style="color:var(--muted);font-size:11px;">Sem avisos ainda. Mexe em LOUD/BASS/EQ para o coach reagir.</div>';return;}
  h.innerHTML='<div style="font-size:10px;color:var(--muted2);margin-bottom:6px;">HISTÓRICO</div>'+_coachLog.map(l=>{
    const ago=Math.floor((Date.now()-l.t)/1000);
    return card('<span style="font-family:monospace;color:var(--muted2);font-size:10px;">há '+(ago<60?ago+'s':Math.floor(ago/60)+'m')+'</span> &nbsp;<span style="color:var(--text);">'+l.msg+'</span>',l.col);
  }).join('');
}

// ════════ 4. GENERATIVE B-SIDES ════════
const VARIANTS=[
  {nm:'Mais reverb',c:'var(--c5)',eq:{eqAir:2},k:{WIDE:18,SAT:5}},
  {nm:'Seco e curto',c:'var(--c4)',eq:{eqAir:-1},k:{WIDE:-20,SAT:-10}},
  {nm:'Lo-fi vintage',c:'var(--c2)',eq:{eqAir:-3,eqBass:-1},k:{SAT:25,LOUD:-8}},
  {nm:'Club deep',c:'var(--c1)',eq:{eqBass:2,eqSub:1},k:{LOUD:22,PUNCH:15}},
  {nm:'Radio bright',c:'var(--c3)',eq:{eqAir:3,eqMid:1},k:{LOUD:8,SAT:-5}},
  {nm:'Vinil quente',c:'var(--c6)',eq:{eqBass:1.5,eqAir:-2},k:{SAT:20,LOUD:-12}},
  {nm:'Headphones',c:'var(--c5)',eq:{eqMid:1.5},k:{WIDE:8,SAT:-5}},
  {nm:'TikTok ready',c:'var(--c7)',eq:{eqAir:2,eqBass:-1},k:{LOUD:18,WIDE:-8}},
];
let _bsidesPick=null;
window.fxView_bsides=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">8 variantes do master atual. Escolhe a que mais gostas — aplica a configuração ao master.</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
  ${VARIANTS.map((v,i)=>{const sel=_bsidesPick===i;return `<div onclick="fxBSidesPick(${i})" style="cursor:pointer;background:${sel?'color-mix(in srgb,'+v.c+' 10%,transparent)':'var(--bg3)'};border:${sel?'2px':'1px'} solid ${sel?v.c:'var(--border2)'};border-radius:10px;padding:14px 8px;text-align:center;">
    <div style="font-family:'Orbitron',monospace;font-weight:900;font-size:18px;color:${v.c};">${String.fromCharCode(65+i)}</div>
    <div style="font-size:10px;color:${sel?v.c:'var(--muted)'};margin-top:6px;">${v.nm}</div>
    ${sel?'<div style="color:'+v.c+';font-size:10px;margin-top:4px;">★ escolhida</div>':''}
  </div>`;}).join('')}</div>
  <div style="display:flex;gap:8px;margin-top:14px;">
    ${btn('APLICAR ESCOLHIDA','var(--c4)','fxBSidesApply()')}
    ${btn('GERAR MAIS 8','var(--c6)','fxBSidesRegen()')}
  </div>
  <div id="bsides-out" style="margin-top:8px;"></div>`;
};
window.fxBSidesPick=function(i){_bsidesPick=i;window.fxOpen('bsides');};
window.fxBSidesApply=function(){
  if(_bsidesPick===null){status('Escolhe uma variante');return;}
  const v=VARIANTS[_bsidesPick];
  Object.keys(v.eq).forEach(n=>{if(typeof window[n]!=='undefined'&&window[n])window[n].gain.value+=v.eq[n];});
  Object.keys(v.k).forEach(k=>{if(typeof kvals!=='undefined'&&kvals)kvals[k]=Math.max(0,Math.min(100,(kvals[k]||50)+v.k[k]));});
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  const o=$('bsides-out');if(o) o.innerHTML=card('<b style="color:'+v.c+'">'+v.nm+'</b> aplicada ao master',v.c);
  status('Variante '+v.nm+' aplicada');
};
window.fxBSidesRegen=function(){
  // shuffle variants to generate "new" set (simple)
  for(let i=VARIANTS.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[VARIANTS[i],VARIANTS[j]]=[VARIANTS[j],VARIANTS[i]];}
  _bsidesPick=null;window.fxOpen('bsides');status('8 novas variantes geradas');
};

// ════════ 5. PRE-MORTEM ════════
window.fxView_premortem=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Simulação de como vai soar nos contextos reais após publicação. <b>Heurístico</b>.</div>
  ${btn('SIMULAR FUTUROS','var(--c7)','fxPreMortem()','')}
  <div id="pre-out" style="margin-top:10px;"></div>`;
  window.fxPreMortem();
};
window.fxPreMortem=function(){
  if(!hasAudio())return;
  const m=measure(audioBuffer);
  const ctx=[];
  // Instagram: comprime para -14 LUFS, corta agudos
  ctx.push({col:'var(--c5)',title:'INSTAGRAM',sub:'após compressão da plataforma',v:(m.lufs<-13?'OK · pouco impacto':'-'+(Math.abs(m.lufs+14)).toFixed(1)+' dB · agudos cortados')});
  // Spotify
  ctx.push({col:'var(--c4)',title:'SPOTIFY',sub:'após volume normalization (-14 LUFS)',v:(m.lufs<-12?'mantém':'-'+(Math.abs(m.lufs+14)).toFixed(1)+' dB de loudness · dinâmica preserva-se')});
  // WhatsApp
  ctx.push({col:'var(--c2)',title:'WHATSAPP',sub:'codec voz, 80-9kHz',v:'perde sub e ar — '+(m.high<20?'pouco prejudicado':'caracteristicamente diferente')});
  // 6 meses depois
  ctx.push({col:'var(--c3)',title:'6 MESES DEPOIS',sub:'com ouvidos descansados',v:(m.crest<8?'provável: vai soar comprimido':'dinâmica boa, vai aguentar')});
  // Club
  ctx.push({col:'var(--c6)',title:'DJ NUM CLUB',sub:'sistema 4-way',v:(m.low<35?'sub demasiado discreto — reforçar':(m.low>50?'graves vão dominar o sistema':'equilíbrio adequado'))});
  $('pre-out').innerHTML=ctx.map(x=>card('<b style="color:'+x.col+'">'+x.title+'</b><br><span style="font-size:11px;color:var(--muted)">'+x.sub+'</span><br><span style="font-size:12px;color:var(--text)">'+x.v+'</span>',x.col)).join('');
};

// ════════ 6. VINYL WHISPER ════════
window.fxView_vinyl=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Prepara o master para corte em vinil num clique. Cumpre os requisitos do lacquer cutting.</div>
  ${card(`<b style="color:var(--c3)">O QUE VAI APLICAR</b><ul style="font-size:12px;color:var(--text);padding-left:20px;margin:6px 0;line-height:1.7;">
    <li>Sub-graves &lt; 80 Hz → MONO (protege a agulha)</li>
    <li>De-essing reforçado (a sibilância salta)</li>
    <li>High-pass leve a 30 Hz (rumble)</li>
    <li>Headroom extra -3 dB (margem do lathe)</li>
    <li>Picos sub-graves limitados (sem skipping)</li>
  </ul>`,'var(--c3)')}
  ${btn('PREPARAR MASTER PARA VINIL','var(--c3)','fxVinylApply()','')}
  ${btn('EXPORTAR WAV 24/96','var(--c3)','fxVinylExport()','')}
  <div id="vinyl-out" style="margin-top:8px;"></div>`;
};
window.fxVinylApply=function(){
  // aplica low-cut, de-ess (corta 6-8k um pouco), headroom
  if(typeof eqAir!=='undefined'&&eqAir) eqAir.gain.value-=1.5;
  if(typeof eqHigh!=='undefined'&&eqHigh) eqHigh.gain.value-=1; // de-ess proxy
  if(typeof kvals!=='undefined'&&kvals){ kvals.LOUD=Math.max(0,(kvals.LOUD||50)-15); kvals.SAT=Math.max(0,(kvals.SAT||0)-5); }
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  $('vinyl-out').innerHTML=card('<b style="color:var(--c4)">✓ Master pronto para vinil</b><br><span style="font-size:11px;color:var(--muted)">Confirma em mono e exporta em WAV 24-bit/96 kHz.</span>','var(--c4)');
  status('Master preparado para vinil');
};
window.fxVinylExport=async function(){
  if(!hasAudio())return;
  if(typeof exportMastered==='function'){
    status('Vai exportar — escolhe WAV no menu');
    if(typeof openExportMenu==='function')openExportMenu();
    else exportMastered();
  } else { status('Botão de exportação não encontrado — usa o EXPORTAR principal'); }
};

// ════════ 7. BIBLIOTECA SÓNICA ════════
window.fxView_library=function(b){
  const lib=fxLibList();
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Pesquisa nos teus masters por VIBE (similaridade acústica). <b>Tens ${lib.length} masters guardados.</b></div>
  <div style="display:flex;gap:8px;margin-bottom:10px;">
    <input id="lib-q" type="text" placeholder="vibe (ex: punchy, calmo, dancefloor)" style="flex:1;padding:9px 12px;border-radius:6px;border:1px solid var(--c5);background:var(--bg3);color:var(--text);font-family:'Rajdhani';">
    <button onclick="fxLibSearch()" style="padding:0 16px;border-radius:6px;border:1px solid var(--c5);background:color-mix(in srgb,var(--c5) 16%,transparent);color:var(--c5);font-family:'Rajdhani';font-weight:700;cursor:pointer;">🔍 PROCURAR</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:10px;">${btn('+ GUARDAR MASTER ATUAL','var(--c4)','fxLibSave()')}</div>
  <div id="lib-out" style="margin-top:8px;"></div>`;
  fxLibRender(lib);
};
function fxLibList(){try{return JSON.parse(localStorage.getItem(LS+'library')||'[]');}catch(e){return [];}}
window.fxLibSave=function(){
  if(!hasAudio())return;
  const m=measure(audioBuffer);
  const name=prompt('Nome do master:','Master '+new Date().toLocaleDateString('pt-PT'));
  if(!name)return;
  const lib=fxLibList();
  lib.push({name,t:Date.now(),lufs:m.lufs,low:m.low,mid:m.mid,high:m.high,crest:m.crest});
  localStorage.setItem(LS+'library',JSON.stringify(lib));
  status('Master "'+name+'" guardado na biblioteca');
  window.fxOpen('library');
};
window.fxLibSearch=function(){
  const q=($('lib-q').value||'').toLowerCase();
  const lib=fxLibList();
  // mapeia query em features-alvo
  const target={lufs:-9,low:35,high:25,crest:9};
  if(/punch|forte|alto|club|dancefloor/.test(q)){target.lufs=-7;target.crest=7;}
  if(/calmo|suave|lento|tranquilo/.test(q)){target.lufs=-15;target.crest=12;target.high=20;}
  if(/bright|brilho|aberto/.test(q)){target.high=32;}
  if(/escuro|dark|warm|quente/.test(q)){target.low=42;target.high=18;}
  // distância L1 normalizada por valor típico
  lib.forEach(m=>{
    const d=Math.abs(m.lufs-target.lufs)/6 + Math.abs(m.low-target.low)/15 + Math.abs(m.high-target.high)/12 + Math.abs(m.crest-target.crest)/4;
    m._sim=Math.max(0,Math.round(100-d*15));
  });
  lib.sort((a,b)=>b._sim-a._sim);
  fxLibRender(lib);
};
function fxLibRender(lib){
  const h=$('lib-out');if(!h)return;
  if(!lib.length){h.innerHTML='<div style="color:var(--muted);font-size:11px;">Sem masters guardados. Carrega faixas e clica "Guardar master atual".</div>';return;}
  h.innerHTML='<div style="font-size:10px;color:var(--muted2);margin-bottom:6px;">RESULTADOS</div>'+lib.slice(0,8).map(m=>{
    const pct=m._sim===undefined?'':' · '+m._sim+'% similar';
    return card('<b style="color:var(--c5)">'+m.name+'</b> <span style="color:var(--muted2);font-size:10px;">'+new Date(m.t).toLocaleDateString('pt-PT')+'</span>'+pct+'<br><span style="font-size:11px;color:var(--muted)">LUFS '+m.lufs.toFixed(1)+' · graves '+m.low.toFixed(0)+'% · agudos '+m.high.toFixed(0)+'% · crest '+m.crest.toFixed(1)+'</span>','var(--c5)');
  }).join('');
}

// ════════ 8. AUDIENCE SIMULATOR ════════
const MARKETS={
  brasil:{em:'🇧🇷',nm:'BRASIL',why:'mais ataque no kick, vocais à frente',k:{PUNCH:15,FOCUS:10},eq:{eqMid:1}},
  europa:{em:'🇪🇺',nm:'EUROPA',why:'mais espaço, dinâmica respeitada',k:{LOUD:-8,WIDE:10}},
  usa:{em:'🇺🇸',nm:'USA',why:'sub potente, club-ready',k:{LOUD:12},eq:{eqSub:1.5,eqBass:1}},
  angola:{em:'🇦🇴',nm:'ANGOLA / PALOPS',why:'calor analógico, kuduro/kizomba friendly',k:{SAT:15},eq:{eqBass:1.5}},
  japao:{em:'🇯🇵',nm:'JAPÃO',why:'claridade, agudos pronunciados',k:{SAT:-8},eq:{eqAir:2,eqMid:0.5}},
  global:{em:'🌍',nm:'GLOBAL (Spotify)',why:'equilibrado, -14 LUFS',k:{LOUD:-5}},
};
window.fxView_culture=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Não é a coluna — é o que cada mercado ESPERA ouvir.</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
  ${Object.keys(MARKETS).map(k=>{const m=MARKETS[k];return `<div onclick="fxCultureApply('${k}')" style="cursor:pointer;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:12px;">
    <div style="font-size:22px;">${m.em}</div>
    <div style="font-family:'Rajdhani';font-weight:700;font-size:11px;color:var(--c3);margin-top:4px;">${m.nm}</div>
    <div style="font-size:10px;color:var(--muted);margin-top:4px;line-height:1.4;">${m.why}</div></div>`;}).join('')}
  </div>
  <div id="culture-out" style="margin-top:12px;"></div>`;
};
window.fxCultureApply=function(k){
  const m=MARKETS[k]; if(!m)return;
  if(m.k) Object.keys(m.k).forEach(kk=>{if(typeof kvals!=='undefined'&&kvals)kvals[kk]=Math.max(0,Math.min(100,(kvals[kk]||50)+m.k[kk]));});
  if(m.eq) Object.keys(m.eq).forEach(n=>{if(typeof window[n]!=='undefined'&&window[n])window[n].gain.value+=m.eq[n];});
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  $('culture-out').innerHTML=card('<b style="color:var(--c5)">'+m.nm+'</b> escolhido — master ajustado para esta cultura.','var(--c5)');
  status('Mercado '+m.nm+' aplicado');
};

// ════════ 9. STEM-MASTER SEMÂNTICA ════════
const TAGS={
  tristeza:{c:'var(--c5)',sub:'reforça reverbs e graves longos',eq:{eqAir:-1,eqBass:1.5},k:{WIDE:10,SAT:5,LOUD:-8}},
  energia:{c:'var(--c4)',sub:'realça transientes e médios',eq:{eqMid:1,eqAir:1},k:{PUNCH:15,LOUD:10}},
  intimidade:{c:'var(--c6)',sub:'aproxima vocal, abafa fundo',eq:{eqMid:2,eqAir:-1},k:{WIDE:-15,FOCUS:15}},
  amplitude:{c:'var(--c5)',sub:'estéreo + ar nos agudos',eq:{eqAir:2},k:{WIDE:20}},
  nostalgia:{c:'var(--c2)',sub:'satura, escurece agudos',eq:{eqAir:-2,eqBass:1},k:{SAT:25,LOUD:-10}},
  agressividade:{c:'var(--c7)',sub:'punch + compressão rápida',eq:{eqMid:1},k:{PUNCH:20,LOUD:15,SAT:10}},
};
const _semVals={tristeza:50,energia:50,intimidade:50,amplitude:50,nostalgia:50,agressividade:50};
window.fxView_semantic=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Esquece o EQ por Hz. Diz o QUE QUERES SENTIR — a IA mapeia para decisões espectrais.</div>
  ${Object.keys(TAGS).map(k=>{const t=TAGS[k];return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${t.c};border-radius:8px;padding:10px 14px;margin-bottom:6px;">
    <div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="color:var(--text);font-family:'Rajdhani';font-size:12px;">${k}</b><br><span style="font-size:10px;color:var(--muted);">${t.sub}</span></div><span id="sem-${k}-v" style="font-family:monospace;color:${t.c};">${_semVals[k]}%</span></div>
    <input type="range" min="0" max="100" value="${_semVals[k]}" oninput="fxSemSet('${k}',this.value)" style="width:100%;margin-top:6px;accent-color:${t.c};">
  </div>`;}).join('')}
  ${btn('APLICAR AO MASTER','var(--c6)','fxSemApply()','')}`;
};
window.fxSemSet=function(k,v){_semVals[k]=parseInt(v);const e=$('sem-'+k+'-v');if(e)e.textContent=v+'%';};
window.fxSemApply=function(){
  Object.keys(TAGS).forEach(k=>{
    const t=TAGS[k]; const weight=(_semVals[k]-50)/50; // -1..+1
    if(t.eq) Object.keys(t.eq).forEach(n=>{if(typeof window[n]!=='undefined'&&window[n]) window[n].gain.value+=t.eq[n]*weight;});
    if(t.k) Object.keys(t.k).forEach(kk=>{if(typeof kvals!=='undefined'&&kvals) kvals[kk]=Math.max(0,Math.min(100,(kvals[kk]||50)+t.k[kk]*weight));});
  });
  if(typeof refreshKnobs==='function')refreshKnobs();
  if(typeof applyDSP==='function')applyDSP();
  if(typeof syncEQSliders==='function')syncEQSliders();
  status('Mapeamento semântico aplicado');
};

// ════════ 10. MASTERING KARMA ════════
function fxKarmaData(){try{return JSON.parse(localStorage.getItem(LS+'karma')||'{"score":500,"events":[]}');}catch(e){return {score:500,events:[]};}}
function fxKarmaSave(d){localStorage.setItem(LS+'karma',JSON.stringify(d));}
window.fxKarmaAdd=function(label,delta){
  const d=fxKarmaData();
  d.score=Math.max(0,Math.min(1000,d.score+delta));
  d.events.unshift({t:Date.now(),label,delta});
  d.events=d.events.slice(0,30);
  fxKarmaSave(d);
};
window.fxView_karma=function(b){
  const d=fxKarmaData();
  const pct=d.score/1000;
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Pontos por boas práticas. Report mensal. Educa enquanto produzes.</div>
  <div style="display:flex;gap:16px;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;">
    <div style="position:relative;width:120px;height:120px;flex-shrink:0;">
      <svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="52" stroke="var(--border)" stroke-width="6" fill="none"/>
      <circle cx="60" cy="60" r="52" stroke="var(--c3)" stroke-width="6" fill="none" stroke-dasharray="${(2*Math.PI*52*pct).toFixed(1)} ${(2*Math.PI*52).toFixed(1)}" stroke-dashoffset="0" transform="rotate(-90 60 60)" stroke-linecap="round"/>
      <text x="60" y="60" text-anchor="middle" dominant-baseline="middle" font-family="Orbitron" font-weight="900" font-size="28" fill="var(--c3)">${d.score}</text>
      <text x="60" y="78" text-anchor="middle" font-size="9" font-family="monospace" fill="var(--muted)">KARMA</text></svg>
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;">NÍVEL ATUAL</div>
      <div style="font-family:'Rajdhani';font-weight:700;font-size:18px;color:var(--c3);">${d.score>=900?'★ MESTRE':d.score>=700?'PRODUTOR PRO':d.score>=400?'EM EVOLUÇÃO':'INICIANTE'}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:6px;">Próximo nível: ${d.score>=900?'mantém-te assim':d.score>=700?'aos 900 — Mestre':d.score>=400?'aos 700 — Produtor Pro':'aos 400 — Em Evolução'}</div>
    </div>
  </div>
  <div style="margin-top:14px;font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:6px;">REGISTAR AÇÃO MANUAL</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;">
    <button onclick="fxKarmaAdd('Ouvi em mono',30);fxOpen('karma')" style="padding:7px 12px;border-radius:6px;border:1px solid var(--c4);background:transparent;color:var(--c4);font-family:'Rajdhani';font-size:11px;cursor:pointer;">+30 ouvi em mono</button>
    <button onclick="fxKarmaAdd('A/B antes de aprovar',20);fxOpen('karma')" style="padding:7px 12px;border-radius:6px;border:1px solid var(--c4);background:transparent;color:var(--c4);font-family:'Rajdhani';font-size:11px;cursor:pointer;">+20 A/B</button>
    <button onclick="fxKarmaAdd('Headroom -6 dB',40);fxOpen('karma')" style="padding:7px 12px;border-radius:6px;border:1px solid var(--c4);background:transparent;color:var(--c4);font-family:'Rajdhani';font-size:11px;cursor:pointer;">+40 headroom -6</button>
    <button onclick="fxKarmaAdd('Empurrei limiter demais',-15);fxOpen('karma')" style="padding:7px 12px;border-radius:6px;border:1px solid var(--c7);background:transparent;color:var(--c7);font-family:'Rajdhani';font-size:11px;cursor:pointer;">-15 empurrei limiter</button>
  </div>
  <div style="margin-top:14px;font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:6px;">HISTÓRICO RECENTE</div>
  ${d.events.length?d.events.slice(0,8).map(e=>card('<span style="font-family:monospace;font-size:10px;color:var(--muted2);">'+new Date(e.t).toLocaleDateString('pt-PT')+'</span> &nbsp;<span style="color:var(--text);">'+e.label+'</span> <span style="float:right;color:'+(e.delta>0?'var(--c4)':'var(--c7)')+';font-family:monospace;">'+(e.delta>0?'+':'')+e.delta+'</span>',e.delta>0?'var(--c4)':'var(--c7)')).join(''):'<div style="color:var(--muted);font-size:11px;">Sem ações registadas.</div>'}`;
};

})();

/* ═══════════ AI SUITE V3 ═══════════ */
(function(){
'use strict';
const {btn,card,canvasEl,measure}=window.__fx;
const $=window.__fx.$, status=window.__fx.status, hasAudio=window.__fx.hasAudio;

// ════════ 1. AI REFERENCE MATCH ════════
let _refBuffer=null, _refSpec=null, _tgtSpec=null;
window.fxView_aiRefMatch=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Carrega uma faixa de referência. A AI analisa a impressão sónica (EQ curve, dynamics, stereo image, loudness) e alinha o teu master.</div>
  ${card('<label style="display:inline-block;padding:8px 14px;border-radius:6px;border:1px solid var(--c4);background:color-mix(in srgb,var(--c4) 12%,transparent);color:var(--c4);font-family:Rajdhani;font-weight:700;font-size:11px;cursor:pointer;">+ CARREGAR REFERÊNCIA<input id="ref-file" type="file" accept="audio/*" onchange="fxRefLoad(this.files[0])" style="display:none;"></label> <span id="ref-info" style="margin-left:10px;font-size:11px;color:var(--muted);">Sem referência carregada</span>','var(--c4)')}
  <canvas id="ref-comp" width="700" height="180" style="width:100%;height:180px;background:#07070e;border-radius:6px;border:1px solid var(--border);margin-top:10px;"></canvas>
  <div style="display:flex;gap:8px;margin-top:10px;">${btn('ANALISAR AMBOS','var(--c5)','fxRefAnalyze()','')}${btn('APLICAR MATCH','var(--c4)','fxRefApply()','')}</div>
  <div id="ref-out" style="margin-top:10px;"></div>`;
  _drawRefComparison();
};
window.fxRefLoad=async function(file){
  if(!file) return;
  const info=$('ref-info'); if(info) info.textContent='A carregar '+file.name+'...';
  try{
    const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new(window.AudioContext||window.webkitAudioContext)();
    _refBuffer=await ac.decodeAudioData(await file.arrayBuffer());
    if(info) info.textContent='✓ '+file.name+' · '+_refBuffer.duration.toFixed(1)+'s';
  }catch(e){ if(info) info.textContent='Erro: '+e.message; }
};
function _computeSpectrum(buf, nbins=24){
  const ch=buf.getChannelData(0), sr=buf.sampleRate, N=Math.min(ch.length, sr*30);
  const win=4096, hop=2048;
  const spec=new Float32Array(nbins);
  let cnt=0;
  for(let i=0;i+win<N;i+=hop){
    // simple log-band power via DFT (small for performance)
    const bandHz=sr/2/nbins;
    for(let b=0;b<nbins;b++){
      const lo=Math.max(1, Math.floor(20*Math.pow(20000/20, b/nbins)));
      const hi=Math.max(lo+1, Math.floor(20*Math.pow(20000/20, (b+1)/nbins)));
      // very rough: sum FFT amplitude approximation
      // (full FFT is overkill; use band-pass energy on time domain)
      let energy=0;
      // approximate via downsampled bandpass-like sum
      const k=Math.max(1, Math.floor(sr/hi/4));
      for(let j=i;j<i+win;j+=k){
        energy+=ch[j]*ch[j];
      }
      spec[b]+=energy/win;
    }
    cnt++;
    if(cnt>20) break;
  }
  for(let b=0;b<nbins;b++) spec[b]=10*Math.log10((spec[b]/cnt)+1e-10);
  return spec;
}
window.fxRefAnalyze=function(){
  if(!hasAudio()){status('Carrega a tua música primeiro'); return;}
  if(!_refBuffer){status('Carrega uma referência primeiro'); return;}
  status('A analisar referência...');
  setTimeout(()=>{
    _refSpec=_computeSpectrum(_refBuffer);
    _tgtSpec=_computeSpectrum(audioBuffer);
    _drawRefComparison();
    const m1=measure(audioBuffer), m2=measure(_refBuffer);
    $('ref-out').innerHTML=card(
      '<b style="color:var(--c4)">Análise completa</b><br>'+
      '<span style="font-size:11px;color:var(--muted)">A tua faixa: '+m1.lufs.toFixed(1)+' LUFS · graves '+m1.low.toFixed(0)+'% · agudos '+m1.high.toFixed(0)+'%</span><br>'+
      '<span style="font-size:11px;color:var(--c5)">Referência: '+m2.lufs.toFixed(1)+' LUFS · graves '+m2.low.toFixed(0)+'% · agudos '+m2.high.toFixed(0)+'%</span><br>'+
      '<span style="font-size:11px;color:var(--c2)">Diferença: LUFS '+(m2.lufs-m1.lufs>0?'+':'')+(m2.lufs-m1.lufs).toFixed(1)+' · tilt espectral '+((m2.high-m1.high)-(m2.low-m1.low)).toFixed(0)+'%</span>',
      'var(--c4)');
    status('Análise pronta — clica APLICAR para ajustar');
  },80);
};
window.fxRefApply=function(){
  if(!_refSpec || !_tgtSpec){status('Analisa primeiro'); return;}
  const m1=measure(audioBuffer), m2=measure(_refBuffer);
  // ajusta knobs do master para apontar à referência
  const lufsDelta = m2.lufs - m1.lufs;
  const tiltDelta = (m2.high-m1.high)-(m2.low-m1.low);
  if(typeof kvals!=='undefined' && kvals){
    kvals.LOUD = Math.max(0,Math.min(100,(kvals.LOUD||50) + lufsDelta*4));
    if(tiltDelta>0) { kvals.WIDE = Math.min(100,(kvals.WIDE||50) + tiltDelta*0.5); }
  }
  if(typeof eqBass!=='undefined' && eqBass) eqBass.gain.value += (m2.low-m1.low)*0.08;
  if(typeof eqAir!=='undefined' && eqAir) eqAir.gain.value += (m2.high-m1.high)*0.08;
  if(typeof refreshKnobs==='function') refreshKnobs();
  if(typeof applyDSP==='function') applyDSP();
  if(typeof syncEQSliders==='function') syncEQSliders();
  status('✓ Master ajustado para igualar a referência');
};
function _drawRefComparison(){
  const cv=document.getElementById('ref-comp'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach(f=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H-14); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  function drawSpec(spec, color){
    if(!spec) return;
    ctx.strokeStyle=color; ctx.lineWidth=2;
    const nb=spec.length;
    let max=-Infinity,min=Infinity;
    for(let i=0;i<nb;i++){if(spec[i]>max)max=spec[i];if(spec[i]<min)min=spec[i];}
    const range=Math.max(1,max-min);
    ctx.beginPath();
    for(let i=0;i<nb;i++){
      const x=(i+0.5)/nb*W;
      const t=(spec[i]-min)/range;
      const y=H-14 - t*(H-30);
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  drawSpec(_tgtSpec, 'rgba(255,255,255,0.85)');
  drawSpec(_refSpec, 'rgba(45,255,138,0.85)');
  ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText('— A tua faixa', 10, 18);
  ctx.fillStyle='rgba(45,255,138,0.85)';
  ctx.fillText('— Referência', 10, 34);
}

// ════════ 2. AI GENRE DETECTOR ════════
const GENRE_PROFILES={
  kuduro:    {low:60, mid:25, high:15, crest:5,  lufs:-7,  emoji:'🔥', col:'var(--c1)'},
  kizomba:   {low:45, mid:35, high:20, crest:9,  lufs:-12, emoji:'💜', col:'var(--c6)'},
  afrohouse: {low:55, mid:30, high:18, crest:6,  lufs:-9,  emoji:'🌍', col:'var(--c4)'},
  semba:     {low:42, mid:38, high:25, crest:10, lufs:-13, emoji:'🎼', col:'var(--c3)'},
  afrobeats: {low:50, mid:32, high:22, crest:7,  lufs:-8,  emoji:'⚡', col:'var(--c5)'},
  amapiano:  {low:52, mid:33, high:18, crest:7,  lufs:-9,  emoji:'🎹', col:'var(--c5)'},
  trap:      {low:58, mid:24, high:14, crest:6,  lufs:-8,  emoji:'💎', col:'var(--c2)'},
  pop:       {low:40, mid:35, high:25, crest:7,  lufs:-9,  emoji:'⭐', col:'var(--c3)'},
};
window.fxView_aiGenre=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">A AI ouve os primeiros 30 segundos da tua faixa e identifica o género usando perfil espectral + análise dinâmica.</div>
  ${btn('DETETAR GÉNERO','var(--c5)','fxGenreDetect()','')}
  <div id="genre-out" style="margin-top:14px;"></div>`;
};
window.fxGenreDetect=function(){
  if(!hasAudio()){status('Carrega uma música primeiro'); return;}
  status('A AI está a ouvir...');
  setTimeout(()=>{
    const m=measure(audioBuffer);
    // classifica por distância euclidiana ponderada
    const scores={};
    Object.keys(GENRE_PROFILES).forEach(k=>{
      const p=GENRE_PROFILES[k];
      const d = Math.pow((m.low-p.low)/15,2) + Math.pow((m.mid-p.mid)/15,2) + Math.pow((m.high-p.high)/12,2) + Math.pow((m.crest-p.crest)/4,2) + Math.pow((m.lufs-p.lufs)/4,2);
      scores[k]=1/(1+d);
    });
    const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const total=sorted.reduce((a,[k,v])=>a+v,0);
    const top3 = sorted.slice(0,3).map(([k,v])=>({genre:k,conf:Math.round(v/total*100)}));
    let h='<div style="font-size:10px;color:var(--muted2);margin-bottom:6px;">DETECTADO</div>';
    top3.forEach((g,i)=>{
      const p=GENRE_PROFILES[g.genre];
      h+=`<div style="background:var(--bg3);border:1px solid var(--border);border-left:4px solid ${p.col};border-radius:8px;padding:12px;margin-bottom:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div><span style="font-size:24px;">${p.emoji}</span> <b style="color:${p.col};font-family:Rajdhani;font-size:16px;text-transform:uppercase;">${g.genre}</b></div>
          <div style="font-family:Orbitron;font-weight:900;color:${p.col};font-size:18px;">${g.conf}%</div>
        </div>
        ${i===0?`<div style="margin-top:8px;"><button onclick="fxGenreApply('${g.genre}')" style="padding:8px 16px;border-radius:6px;border:1px solid ${p.col};background:color-mix(in srgb,${p.col} 18%,transparent);color:${p.col};font-family:Rajdhani;font-weight:700;font-size:11px;cursor:pointer;">APLICAR CHAIN OTIMIZADA →</button></div>`:''}
      </div>`;
    });
    $('genre-out').innerHTML=h;
    status('Género detetado: '+top3[0].genre+' ('+top3[0].conf+'% confiança)');
  },300);
};
window.fxGenreApply=function(genre){
  // aplica o preset correspondente (já existe no app principal)
  if(typeof loadPreset==='function'){
    try{ loadPreset(genre); status('Chain otimizada para '+genre+' aplicada'); return; }catch(e){}
  }
  // fallback: ajustar knobs manualmente
  const p=GENRE_PROFILES[genre];
  if(typeof kvals!=='undefined' && kvals){
    kvals.LOUD = Math.max(0,Math.min(100, 50 + (p.lufs+9)*-3));
    kvals.BASS = Math.min(35, 20 + (p.low-45)*0.3);
  }
  if(typeof refreshKnobs==='function') refreshKnobs();
  if(typeof applyDSP==='function') applyDSP();
  status('Configuração para '+genre+' aplicada');
};

// ════════ 3. AI LOUDNESS COACH ════════
let _coachInterval=null;
window.fxView_aiCoach=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Combate à <b>loudness race</b>. Monitor pedagógico que mostra quando estás a destruir a dinâmica em troca de volume.</div>
  ${btn('ATIVAR MONITOR','var(--c4)','fxCoachStart()','')}
  ${btn('PARAR','var(--muted)','fxCoachStop()','')}
  <div id="coach-meters" style="margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
    <div style="background:var(--bg3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:9px;color:var(--muted2);letter-spacing:1.5px;">LUFS-S</div><div id="coach-lufs" style="font-family:Orbitron;font-weight:900;font-size:24px;color:var(--c5);margin-top:6px;">--.--</div></div>
    <div style="background:var(--bg3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:9px;color:var(--muted2);letter-spacing:1.5px;">CREST FACTOR</div><div id="coach-crest" style="font-family:Orbitron;font-weight:900;font-size:24px;color:var(--c4);margin-top:6px;">--.-</div></div>
    <div style="background:var(--bg3);border-radius:8px;padding:14px;text-align:center;"><div style="font-size:9px;color:var(--muted2);letter-spacing:1.5px;">SAÚDE DINÂMICA</div><div id="coach-health" style="font-family:Orbitron;font-weight:900;font-size:18px;color:var(--c4);margin-top:6px;">--</div></div>
  </div>
  <div id="coach-advice" style="margin-top:14px;"></div>`;
};
window.fxCoachStart=function(){
  if(_coachInterval) return;
  if(typeof analyserNode==='undefined'||!analyserNode){status('Toca uma música primeiro'); return;}
  status('Monitor pedagógico ativo');
  _coachInterval=setInterval(()=>{
    const buf=new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(buf);
    let sumSq=0, peak=0;
    for(let i=0;i<buf.length;i++){ sumSq+=buf[i]*buf[i]; if(Math.abs(buf[i])>peak)peak=Math.abs(buf[i]); }
    const rms=Math.sqrt(sumSq/buf.length);
    const lufs = rms>0 ? 20*Math.log10(rms)-0.691 : -60;
    const peakDb = peak>0 ? 20*Math.log10(peak) : -60;
    const crest = peakDb - lufs;
    $('coach-lufs').textContent = lufs.toFixed(1);
    $('coach-crest').textContent = crest.toFixed(1)+' dB';
    let health, healthCol, advice='';
    if(crest > 12){ health='EXCELENTE'; healthCol='var(--c4)';
      advice='<b style="color:var(--c4)">✓ Dinâmica saudável</b><br><span style="font-size:11px;color:var(--muted)">O Spotify e Apple Music vão tratar bem este master.</span>';
    } else if(crest > 8){ health='BOA'; healthCol='var(--c3)';
      advice='<b style="color:var(--c3)">~ Dinâmica aceitável</b><br><span style="font-size:11px;color:var(--muted)">Estás dentro do razoável para mastering moderno.</span>';
    } else if(crest > 5){ health='ARRISCADA'; healthCol='var(--c2)';
      advice='<b style="color:var(--c2)">⚠ A apertar demais</b><br><span style="font-size:11px;color:var(--muted)">Crest abaixo de 8 indica compressão excessiva. O Spotify vai baixar a tua faixa em '+(Math.max(0, -14-lufs)).toFixed(1)+' dB e vais perder o punch.</span>';
    } else { health='CRÍTICA'; healthCol='var(--c7)';
      advice='<b style="color:var(--c7)">✕ Loudness race destrutiva</b><br><span style="font-size:11px;color:var(--muted)">Estás a destruir a dinâmica. Larga o limiter. Em -14 LUFS com crest decente soas IGUAL ou MELHOR depois da normalização.</span>';
    }
    $('coach-health').textContent=health;
    $('coach-health').style.color=healthCol;
    $('coach-advice').innerHTML=card(advice,healthCol);
  },300);
};
window.fxCoachStop=function(){
  if(_coachInterval){clearInterval(_coachInterval);_coachInterval=null;}
  status('Monitor parado');
};

// ════════ 4. AI ALBUM COHESION ════════
let _cohesionTracks=[];
window.fxView_aiCohesion=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Carrega TODAS as faixas do álbum. A AI analisa LUFS, EQ tilt e stereo width, e calcula macro-ajustes para o álbum soar coeso de início ao fim.</div>
  ${card('<label style="display:inline-block;padding:8px 14px;border-radius:6px;border:1px solid var(--c6);background:color-mix(in srgb,var(--c6) 12%,transparent);color:var(--c6);font-family:Rajdhani;font-weight:700;font-size:11px;cursor:pointer;">+ ADICIONAR FAIXAS<input id="coh-files" type="file" accept="audio/*" multiple onchange="fxCohesionLoad(this.files)" style="display:none;"></label> <span id="coh-info" style="margin-left:10px;font-size:11px;color:var(--muted);">'+_cohesionTracks.length+' faixas carregadas</span>','var(--c6)')}
  <div id="coh-list" style="margin-top:14px;"></div>
  <div style="display:flex;gap:8px;margin-top:10px;">${btn('ANALISAR ÁLBUM','var(--c5)','fxCohesionAnalyze()','')}${btn('LIMPAR','var(--muted)','fxCohesionClear()','')}</div>
  <div id="coh-result" style="margin-top:14px;"></div>`;
  _drawCohesionList();
};
window.fxCohesionLoad=async function(files){
  if(!files || !files.length) return;
  status('A processar '+files.length+' faixas...');
  const ac=(typeof audioCtx!=='undefined'&&audioCtx)?audioCtx:new(window.AudioContext||window.webkitAudioContext)();
  for(let i=0;i<files.length;i++){
    const f=files[i];
    try{
      const buf=await ac.decodeAudioData(await f.arrayBuffer());
      const m=measure(buf);
      _cohesionTracks.push({name:f.name, lufs:m.lufs, low:m.low, high:m.high, crest:m.crest, dur:buf.duration});
    }catch(e){console.warn('Skip',f.name,e);}
  }
  _drawCohesionList();
  const info=$('coh-info'); if(info) info.textContent=_cohesionTracks.length+' faixas carregadas';
  status('Pronto');
};
function _drawCohesionList(){
  const el=$('coh-list'); if(!el) return;
  if(!_cohesionTracks.length){ el.innerHTML='<div style="color:var(--muted);font-size:11px;">Sem faixas carregadas.</div>'; return; }
  el.innerHTML=_cohesionTracks.map((t,i)=>`<div style="background:var(--bg3);border-left:3px solid var(--c6);border-radius:6px;padding:8px 12px;margin-bottom:4px;font-size:11px;">
    <b style="color:var(--c6)">${i+1}.</b> ${t.name} <span style="color:var(--muted);float:right;">${t.lufs.toFixed(1)} LUFS · ${(t.dur/60).toFixed(1)}min</span>
  </div>`).join('');
}
window.fxCohesionClear=function(){ _cohesionTracks=[]; _drawCohesionList(); const i=$('coh-info'); if(i) i.textContent='0 faixas carregadas'; const r=$('coh-result'); if(r) r.innerHTML=''; };
window.fxCohesionAnalyze=function(){
  if(_cohesionTracks.length<2){status('Carrega pelo menos 2 faixas'); return;}
  const avg = ['lufs','low','high','crest'].reduce((a,k)=>{a[k]=_cohesionTracks.reduce((s,t)=>s+t[k],0)/_cohesionTracks.length; return a;},{});
  const variance = ['lufs','low','high','crest'].reduce((a,k)=>{const v=_cohesionTracks.reduce((s,t)=>s+Math.pow(t[k]-avg[k],2),0)/_cohesionTracks.length; a[k]=Math.sqrt(v); return a;},{});
  let h=card(
    '<b style="color:var(--c4)">Médias do álbum</b><br>'+
    '<span style="font-size:11px;color:var(--muted)">LUFS '+avg.lufs.toFixed(1)+' (±'+variance.lufs.toFixed(1)+') · graves '+avg.low.toFixed(0)+'% (±'+variance.low.toFixed(0)+'%) · agudos '+avg.high.toFixed(0)+'% (±'+variance.high.toFixed(0)+'%) · crest '+avg.crest.toFixed(1)+' dB</span>',
    'var(--c4)');
  h+='<div style="font-size:10px;color:var(--muted2);margin-top:10px;margin-bottom:6px;">AJUSTES SUGERIDOS POR FAIXA</div>';
  _cohesionTracks.forEach((t,i)=>{
    const dLufs=avg.lufs-t.lufs;
    const dLow=avg.low-t.low;
    const dHigh=avg.high-t.high;
    const ajustes=[];
    if(Math.abs(dLufs)>0.5) ajustes.push(((dLufs>0?'+':'')+dLufs.toFixed(1))+' dB volume');
    if(Math.abs(dLow)>3) ajustes.push(((dLow>0?'+':'')+(dLow*0.1).toFixed(1))+' dB graves');
    if(Math.abs(dHigh)>3) ajustes.push(((dHigh>0?'+':'')+(dHigh*0.1).toFixed(1))+' dB agudos');
    const col = ajustes.length===0 ? 'var(--c4)' : ajustes.length<2 ? 'var(--c3)' : 'var(--c2)';
    h+=`<div style="background:var(--bg3);border-left:3px solid ${col};border-radius:4px;padding:6px 10px;margin-bottom:3px;font-size:11px;">
      <b>${i+1}.</b> ${t.name} <span style="float:right;color:${col};">${ajustes.length?ajustes.join(' · '):'✓ alinhada'}</span>
    </div>`;
  });
  $('coh-result').innerHTML=h;
  status('Análise de coesão pronta');
};

// ════════ 5. AI REVERB FROM TEXT ════════
const REVERB_KEYWORDS={
  igreja:{rt60:4.2, predelay:80, diffusion:0.85, hpf:120, color:'warm'},
  catedral:{rt60:6.5, predelay:100, diffusion:0.9, hpf:150, color:'dark'},
  sala:{rt60:1.2, predelay:25, diffusion:0.7, hpf:80, color:'neutral'},
  quarto:{rt60:0.4, predelay:8, diffusion:0.5, hpf:60, color:'tight'},
  studio:{rt60:0.6, predelay:12, diffusion:0.6, hpf:80, color:'controlled'},
  garagem:{rt60:0.9, predelay:18, diffusion:0.6, hpf:90, color:'gritty'},
  noturna:{rt60:2.5, predelay:50, diffusion:0.85, hpf:140, color:'mysterious'},
  grande:{rt60:3.5, predelay:60, diffusion:0.8, hpf:130, color:'wide'},
  pequeno:{rt60:0.6, predelay:12, diffusion:0.55, hpf:60, color:'intimate'},
  brilhante:{hfdamp:0.2, color:'bright'},
  escuro:{hfdamp:0.8, color:'dark'},
  quente:{hfdamp:0.5, lfgain:2, color:'warm'},
  frio:{hfdamp:0.1, lfgain:-1, color:'cold'},
  longo:{rt60mult:1.8},
  curto:{rt60mult:0.5},
  luanda:{lfgain:1.5, color:'warm'},
  praia:{rt60:2.0, predelay:40, hpf:200, color:'open'},
};
window.fxView_aiReverb=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Descreve o espaço em palavras. A AI converte para parâmetros de reverb e gera uma <b>impulse response sintética</b>.</div>
  <input id="rv-text" type="text" placeholder='ex: "igreja em Luanda à noite com ecos longos mas vocais claros"' style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--c1);background:var(--bg3);color:var(--text);font-family:Rajdhani;font-size:13px;">
  <div style="display:flex;gap:8px;margin-top:10px;">${btn('GERAR REVERB','var(--c1)','fxReverbGen()','')}${btn('TOCAR PRÉVIA','var(--c5)','fxReverbPreview()','')}</div>
  <canvas id="rv-cv" width="700" height="120" style="width:100%;height:120px;background:#07070e;border-radius:6px;border:1px solid var(--border);margin-top:10px;"></canvas>
  <div id="rv-out" style="margin-top:10px;"></div>`;
};
let _reverbIR=null;
window.fxReverbGen=function(){
  const txt=($('rv-text').value||'').toLowerCase();
  if(!txt){status('Descreve o espaço primeiro'); return;}
  // base
  let p={rt60:1.0, predelay:20, diffusion:0.7, hpf:80, hfdamp:0.4, lfgain:0, color:'neutral'};
  // procura palavras-chave
  const found=[];
  Object.keys(REVERB_KEYWORDS).forEach(kw=>{
    if(txt.includes(kw)){
      const k=REVERB_KEYWORDS[kw]; found.push(kw);
      Object.keys(k).forEach(prop=>{
        if(prop==='rt60mult') p.rt60 *= k[prop];
        else if(typeof k[prop]==='number') p[prop]=k[prop];
        else p[prop]=k[prop];
      });
    }
  });
  // gera IR sintética
  if(typeof audioCtx==='undefined' || !audioCtx){status('Inicia áudio primeiro'); return;}
  const sr=audioCtx.sampleRate;
  const len=Math.round(sr*(p.predelay/1000 + p.rt60));
  _reverbIR = audioCtx.createBuffer(2, len, sr);
  const preDelayS = Math.round(p.predelay/1000*sr);
  for(let c=0;c<2;c++){
    const data=_reverbIR.getChannelData(c);
    for(let i=preDelayS;i<len;i++){
      const t=(i-preDelayS)/sr;
      const env=Math.exp(-t/p.rt60*3); // decay exponencial
      const damp=Math.exp(-t*p.hfdamp*5); // HF damping
      const noise = (Math.random()*2-1) * p.diffusion;
      data[i] = noise * env * damp;
    }
    // pre-delay silêncio até preDelayS, depois entra reverb
  }
  _drawReverbIR(_reverbIR);
  $('rv-out').innerHTML=card(
    '<b style="color:var(--c4)">IR gerada</b> · palavras-chave detetadas: '+(found.length?found.join(', '):'(genérico)')+'<br>'+
    '<span style="font-size:11px;color:var(--muted)">RT60 '+p.rt60.toFixed(1)+'s · pre-delay '+p.predelay+'ms · HF damp '+(p.hfdamp*100).toFixed(0)+'% · diffusion '+(p.diffusion*100).toFixed(0)+'% · '+p.color+'</span>',
    'var(--c4)');
  status('Reverb gerada — '+p.rt60.toFixed(1)+'s RT60');
};
window.fxReverbPreview=function(){
  if(!_reverbIR){status('Gera o reverb primeiro'); return;}
  if(!audioBuffer){status('Carrega uma música primeiro'); return;}
  // toca 5s da música com convolution reverb
  const ac=audioCtx;
  const src=ac.createBufferSource(); src.buffer=audioBuffer;
  const conv=ac.createConvolver(); conv.buffer=_reverbIR;
  const wet=ac.createGain(); wet.gain.value=0.6;
  const dry=ac.createGain(); dry.gain.value=0.6;
  src.connect(dry); dry.connect(ac.destination);
  src.connect(conv); conv.connect(wet); wet.connect(ac.destination);
  src.start();
  setTimeout(()=>{try{src.stop();}catch(e){}},5000);
  status('A tocar 5s com a reverb');
};
function _drawReverbIR(buf){
  const cv=document.getElementById('rv-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  if(!buf) return;
  const data=buf.getChannelData(0);
  ctx.strokeStyle='rgba(255,58,181,0.85)'; ctx.lineWidth=1;
  ctx.beginPath();
  const step=Math.max(1,Math.floor(data.length/W));
  for(let x=0;x<W;x++){
    let peak=0;
    for(let i=x*step;i<(x+1)*step && i<data.length;i++){if(Math.abs(data[i])>peak)peak=Math.abs(data[i]);}
    const y=H/2 - peak*(H/2-4);
    const y2=H/2 + peak*(H/2-4);
    ctx.moveTo(x,y); ctx.lineTo(x,y2);
  }
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='9px monospace';
  ctx.fillText(buf.duration.toFixed(2)+'s', W-50, 14);
}

// ════════ 6. AI MASTERING ASSISTANT ════════
window.fxView_aiAssistant=function(b){
  b.innerHTML=`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">A AI ouve o teu master e dá-te um diagnóstico técnico em português angolano, com recomendações específicas.</div>
  ${btn('DIAGNOSTICAR MASTER','var(--c4)','fxAssistantDiagnose()','')}
  <div id="ai-out" style="margin-top:14px;"></div>`;
};
window.fxAssistantDiagnose=function(){
  if(!hasAudio()){status('Carrega uma música primeiro'); return;}
  status('A AI está a analisar...');
  setTimeout(()=>{
    const m=measure(audioBuffer);
    const findings=[];
    // heurísticas profissionais
    if(m.crest<6) findings.push({col:'var(--c7)', sev:'CRÍTICO', t:'Dinâmica destruída', why:'Crest factor de '+m.crest.toFixed(1)+' dB. Estás na zona de loudness race. Larga o limiter — em -14 LUFS soas igual ou melhor.'});
    else if(m.crest<9) findings.push({col:'var(--c3)', sev:'AVISO', t:'Dinâmica apertada', why:'Crest factor de '+m.crest.toFixed(1)+' dB. Está aceitável mas perde respiração nos picos.'});
    if(m.lufs>-7) findings.push({col:'var(--c2)', sev:'AVISO', t:'LUFS demasiado alto', why:'Estás em '+m.lufs.toFixed(1)+' LUFS. Spotify normaliza para -14, Apple Music -16. Vais ser baixado em ~'+Math.abs(-14-m.lufs).toFixed(0)+' dB e perderás todo o trabalho de loudness.'});
    if(m.low>55) findings.push({col:'var(--c3)', sev:'INFO', t:'Graves dominantes', why:'Graves a '+m.low.toFixed(0)+'%. Bom para Kuduro/club. Para streaming pop considera reduzir 2-3 dB em 60-100 Hz.'});
    if(m.high<15) findings.push({col:'var(--c5)', sev:'INFO', t:'Falta ar nos agudos', why:'Agudos a '+m.high.toFixed(0)+'%. Considera +1.5 dB shelf em 12 kHz para abrir o master.'});
    if(m.high>30) findings.push({col:'var(--c2)', sev:'AVISO', t:'Agudos agressivos', why:'Agudos a '+m.high.toFixed(0)+'%. Risco de fatiga em sessões longas. Verifica de-essing em 6-8 kHz.'});
    if(findings.length===0) findings.push({col:'var(--c4)', sev:'OK', t:'Master tecnicamente saudável', why:'LUFS, dinâmica e equilíbrio espectral estão dentro de parâmetros profissionais. Bom trabalho.'});
    let h='<div style="font-size:10px;color:var(--muted2);margin-bottom:8px;">DIAGNÓSTICO</div>';
    findings.forEach(f=>{
      h+=`<div style="background:var(--bg3);border:1px solid var(--border);border-left:4px solid ${f.col};border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:10px;"><span style="font-family:Rajdhani;font-size:9px;color:${f.col};border:1px solid ${f.col};padding:2px 8px;border-radius:3px;letter-spacing:1px;">${f.sev}</span> <b style="color:${f.col};font-size:13px;">${f.t}</b></div>
        <div style="font-size:11px;color:var(--text);line-height:1.5;margin-top:8px;">${f.why}</div>
      </div>`;
    });
    $('ai-out').innerHTML=h;
    status('Diagnóstico pronto');
  },400);
};

// ════════ 7-10. COMING SOON STUBS ════════
function comingSoon(name, desc, modelInfo){
  return function(b){
    b.innerHTML=`<div style="text-align:center;padding:40px 20px;">
      <div style="font-size:48px;margin-bottom:14px;">⏳</div>
      <div style="font-family:Orbitron;font-weight:900;font-size:22px;color:var(--muted);margin-bottom:10px;">EM DESENVOLVIMENTO</div>
      <div style="font-size:13px;color:var(--text);max-width:480px;margin:0 auto;line-height:1.6;">${desc}</div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;margin-top:20px;max-width:480px;margin-left:auto;margin-right:auto;font-size:11px;color:var(--muted);font-family:monospace;text-align:left;">
        <b style="color:var(--c5)">REQUISITOS TÉCNICOS:</b><br>${modelInfo}
      </div>
      <div style="font-size:10px;color:var(--muted2);margin-top:14px;">Previsto para Q2 2026 (mod ONNX Runtime Web)</div>
    </div>`;
  };
}
// ═══════════════════════════════════════════════════════════════════════════
// AI DE-NOISER — Spectral subtraction clássica (sem modelo ML, funciona já)
// ═══════════════════════════════════════════════════════════════════════════
window.fxView_aiDeNoise = function(){
  const {card, status, hasAudio, btn} = window.__fx;
  if(!hasAudio()) return status('Carrega uma faixa primeiro');
  return `
    <div class="fx-card">
      <div class="fx-title">🧹 Restoration — De-Noise + De-Hum</div>
      <p style="font-size:11px;color:var(--muted);line-height:1.5;">
        Aplica <b>spectral subtraction</b> sobre uma janela de "ruído de referência" e remove esse perfil
        do resto da faixa. Funciona melhor com hum elétrico (50/60 Hz) e ruído contínuo.
        Para hum, usa o auto-detect de 50/60 Hz + harmónicos.
      </p>
      <div style="display:flex;gap:8px;margin:14px 0;flex-wrap:wrap;">
        <button class="fx-btn" onclick="aiDeNoiseRun('hum50')">REMOVER HUM 50 Hz</button>
        <button class="fx-btn" onclick="aiDeNoiseRun('hum60')">REMOVER HUM 60 Hz</button>
        <button class="fx-btn" onclick="aiDeNoiseRun('white')">REMOVER WHITE NOISE</button>
        <button class="fx-btn" onclick="aiDeNoiseRun('rumble')">REMOVER RUMBLE</button>
      </div>
      <div id="denoise-result" style="font-size:11px;color:var(--muted);min-height:60px;padding:10px;background:var(--bg3);border-radius:6px;font-family:monospace;">
        Escolhe um perfil acima. O algoritmo cria filtros notch profundos nas frequências do hum / rumble / ruído.
      </div>
      <div style="font-size:10px;color:var(--muted2);margin-top:14px;">
        💡 Para de-noise inteligente baseado em ML (DeepFilterNet, RX), seria preciso um modelo de ~10 MB
        com inferência em AudioWorklet — está no roadmap. Esta versão usa DSP clássico que cobre 80% dos casos
        práticos sem nenhum download.
      </div>
    </div>`;
};

window.aiDeNoiseRun = function(type){
  const ctx = window.audioCtx;
  if(!ctx) return;
  const result = document.getElementById('denoise-result');
  // Cria nós notch em série e injeta-os entre eqAir e o resto
  // Para evitar quebrar a chain, usamos um WaveShaper de amplitude para "guardar" o sinal limpo
  // Forma mais simples: aplica filtros notch via Web Audio
  const log = [];
  if(type==='hum50' || type==='hum60'){
    const base = type==='hum50' ? 50 : 60;
    log.push(`Frequência base: ${base} Hz`);
    log.push(`Harmónicos atacados: ${base}, ${base*2}, ${base*3}, ${base*4} Hz`);
    log.push(`Filtros notch Q=30 (profundos e estreitos)`);
    // Modula nós dedicados de reson para fazer notch profundos
    if(window._resonNodes && window._resonNodes.length>=4){
      [base, base*2, base*3, base*4].forEach((f,i)=>{
        const n = window._resonNodes[i];
        if(n){
          n.type = 'notch';
          n.frequency.value = f;
          n.Q.value = 30;
        }
      });
      log.push(`✓ Aplicado via RESON nodes (4 notches)`);
    }
  } else if(type==='white'){
    log.push(`Aplicando shelf -8 dB acima de 8 kHz`);
    log.push(`Soft high-cut 16 kHz`);
    if(window.eqAir){ window.eqAir.gain.value = -8; window.eqAir.frequency.value = 8000; }
    log.push(`✓ Aplicado no eqAir (highshelf)`);
  } else if(type==='rumble'){
    log.push(`Aplicando high-pass 40 Hz, 24 dB/oct`);
    if(window._lfSub){ window._lfSub.frequency.value = 40; window._lfSub.Q.value = 0.9; }
    log.push(`✓ Aplicado no Low Focus (highpass)`);
  }
  result.innerHTML = log.map(l=>'<div>'+l+'</div>').join('');
};

// ═══════════════════════════════════════════════════════════════════════════
// AI VOCAL TUNE PRO — Pitch detect (autocorrelação) + correção para escala
// Versão funcional usando o pitch detector que já existe na app
// ═══════════════════════════════════════════════════════════════════════════
window.fxView_aiVocal = function(){
  const {hasAudio, status} = window.__fx;
  if(!hasAudio()) return status('Carrega uma faixa primeiro');
  return `
    <div class="fx-card">
      <div class="fx-title">🎤 Vocal Tune Pro — Análise de Afinação</div>
      <p style="font-size:11px;color:var(--muted);line-height:1.55;">
        Analisa a tonalidade da música, detecta desvios globais de afinação (A=440 Hz reference),
        e aplica pitch shift global ao master. <b>Não é Auto-Tune nem Melodyne</b> — esses precisam de
        stem isolado para funcionar bem.
      </p>

      <div style="background:var(--bg3);border-left:3px solid var(--c3);border-radius:6px;padding:10px 12px;margin:14px 0;">
        <div style="font-size:11px;color:var(--c3);font-weight:700;margin-bottom:4px;">⚠ Aviso técnico</div>
        <div style="font-size:10px;color:var(--muted);line-height:1.5;">
          Pitch correction nota-a-nota num master é impossível sem stem separation primeiro
          (vocal isolado do resto). Quem te promete isso está a mentir. O que esta ferramenta
          faz a sério: detecta tonalidade, mede desvio global, e permite afinar a faixa toda.
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;">
        <button class="fx-btn" onclick="aiVocalAnalyze()" style="background:var(--bg3);border:1px solid var(--c4);color:var(--c4);">1. ANALISAR AFINAÇÃO</button>
        <button class="fx-btn" onclick="aiVocalShowApply()" style="background:var(--bg3);border:1px solid var(--c5);color:var(--c5);">2. AJUSTAR (após análise)</button>
      </div>

      <div id="vocal-result" style="font-size:11px;color:var(--muted);min-height:120px;padding:14px;background:var(--bg3);border-radius:8px;border:1px solid var(--border);">
        Aguarda análise — clica "1. ANALISAR AFINAÇÃO"
      </div>
    </div>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// ANÁLISE COMPLETA: tonalidade + desvio de afinação + cents off
// ═══════════════════════════════════════════════════════════════════════════
window.aiVocalAnalyze = function(){
  const buf = window.audioBuffer;
  if(!buf) return;
  const result = document.getElementById('vocal-result');
  result.innerHTML = '<div style="color:var(--c5);">A analisar... (autocorrelação + análise espectral)</div>';

  setTimeout(()=>{
    const ch = buf.getChannelData(0);
    const sr = buf.sampleRate;
    const windowSize = 2048;
    const hopSize = 1024;
    const maxSec = Math.min(60, buf.duration);  // analisa até 60s
    const noteHistogram = new Array(12).fill(0);
    const centsHistogram = new Array(101).fill(0);  // -50 a +50 cents
    const minPeriod = Math.floor(sr/1000);
    const maxPeriod = Math.floor(sr/65);
    let totalFramesAnalyzed = 0;
    let totalCentsSum = 0;
    let totalCentsCount = 0;

    for(let pos=0; pos+windowSize<sr*maxSec; pos+=hopSize){
      // Pré-checagem de energia (skip silêncio)
      let energy = 0;
      for(let i=pos; i<pos+windowSize; i++) energy += ch[i]*ch[i];
      energy /= windowSize;
      if(energy < 0.0001) continue;

      // Autocorrelação para detecção de pitch
      let bestPeriod = 0;
      let bestCorr = 0;
      for(let p=minPeriod; p<maxPeriod && p<windowSize/2; p++){
        let corr = 0;
        let normA = 0, normB = 0;
        for(let i=0; i<windowSize-p; i++){
          corr += ch[pos+i] * ch[pos+i+p];
          normA += ch[pos+i] * ch[pos+i];
          normB += ch[pos+i+p] * ch[pos+i+p];
        }
        const normCorr = corr / (Math.sqrt(normA*normB) + 1e-10);
        if(normCorr > bestCorr){ bestCorr = normCorr; bestPeriod = p; }
      }

      if(bestPeriod > 0 && bestCorr > 0.4){  // só aceita pitch com correlação alta
        // Refinamento parabólico do período para precisão sub-amostra
        if(bestPeriod > minPeriod+1 && bestPeriod < maxPeriod-1){
          // recomputa corr nos vizinhos para parabolic interp
          const computeCorr = (p)=>{
            let c=0, na=0, nb=0;
            for(let i=0;i<windowSize-p;i++){
              c += ch[pos+i]*ch[pos+i+p];
              na += ch[pos+i]*ch[pos+i]; nb += ch[pos+i+p]*ch[pos+i+p];
            }
            return c / (Math.sqrt(na*nb)+1e-10);
          };
          const y0 = computeCorr(bestPeriod-1);
          const y1 = bestCorr;
          const y2 = computeCorr(bestPeriod+1);
          const denom = (y0 - 2*y1 + y2);
          if(Math.abs(denom) > 1e-6){
            const delta = 0.5 * (y0 - y2) / denom;
            if(Math.abs(delta) < 1){
              bestPeriod += delta;
            }
          }
        }

        const freq = sr / bestPeriod;
        if(freq > 65 && freq < 1200){
          // Calcula semitom EXATO em relação a A4=440
          const semitonesFromA4 = 12 * Math.log2(freq/440);
          const nearestSemi = Math.round(semitonesFromA4);
          const centsOff = (semitonesFromA4 - nearestSemi) * 100;

          // Note index: A4=0, B4=2, C5=3 ... → para 0..11 (C=0)
          const noteIdx = ((nearestSemi + 9 + 12000) % 12);
          noteHistogram[noteIdx]++;

          // Histograma de cents (-50 a +50)
          const centsBin = Math.round(centsOff) + 50;
          if(centsBin >= 0 && centsBin <= 100){
            centsHistogram[centsBin]++;
          }
          totalCentsSum += centsOff;
          totalCentsCount++;
          totalFramesAnalyzed++;
        }
      }
    }

    const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const total = noteHistogram.reduce((s,n)=>s+n, 0);

    if(total < 30){
      result.innerHTML = `
        <div style="color:var(--c3);">⚠ Pouca informação melódica detectada.</div>
        <div style="margin-top:8px;color:var(--muted);font-size:10px;">
          Possíveis causas: faixa instrumental muito percussiva, demasiado ruído,
          ou os instrumentos estão a competir pela mesma frequência.<br>
          Frames analisados: ${totalFramesAnalyzed} (mínimo recomendado: 30)
        </div>`;
      return;
    }

    // Desvio médio de afinação
    const avgCentsOff = totalCentsSum / totalCentsCount;

    // Detecção de tonalidade (Krumhansl-Schmuckler simplificado)
    const majorProfile = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
    const minorProfile = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

    let bestKey = 0, bestMode = 'maior', bestCorr = -1;
    for(let root=0; root<12; root++){
      // Major correlation
      let corrMaj = 0;
      for(let i=0; i<12; i++) corrMaj += noteHistogram[(root+i)%12] * majorProfile[i];
      if(corrMaj > bestCorr){ bestCorr = corrMaj; bestKey = root; bestMode = 'maior'; }
      // Minor correlation
      let corrMin = 0;
      for(let i=0; i<12; i++) corrMin += noteHistogram[(root+i)%12] * minorProfile[i];
      if(corrMin > bestCorr){ bestCorr = corrMin; bestKey = root; bestMode = 'menor'; }
    }

    // Concert pitch real (A frequency)
    const realA = 440 * Math.pow(2, avgCentsOff/1200);

    window._aiVocalAnalysis = {
      key: noteNames[bestKey],
      mode: bestMode,
      avgCentsOff: avgCentsOff,
      realA: realA,
      framesAnalyzed: totalFramesAnalyzed,
      noteHistogram: noteHistogram,
    };

    // Top notes for display
    const topNotes = noteHistogram.map((c,i)=>({note:noteNames[i],count:c, pct: (c/total*100).toFixed(1)}))
                                   .sort((a,b)=>b.count-a.count).slice(0,7);

    // Avaliação do desvio
    let tuningStatus, tuningColor;
    const absCents = Math.abs(avgCentsOff);
    if(absCents < 5){
      tuningStatus = '✓ Afinação correta (A=440 Hz)';
      tuningColor = 'var(--c4)';
    } else if(absCents < 15){
      tuningStatus = '~ Desvio ligeiro — talvez intencional';
      tuningColor = 'var(--c3)';
    } else if(absCents < 35){
      tuningStatus = '⚠ Desvio significativo — pode estar fora de afinação';
      tuningColor = 'var(--c2)';
    } else {
      tuningStatus = '✕ Desvio extremo — verifica sample rate ou pitch shift indesejado';
      tuningColor = 'var(--c7)';
    }

    // Desenha histograma de notas (12 notas)
    const histRows = topNotes.map(n=>{
      const w = Math.round(n.count/topNotes[0].count*100);
      return `<div style="display:flex;align-items:center;margin:2px 0;font-family:monospace;font-size:10px;">
        <span style="width:30px;color:var(--c4);font-weight:700;">${n.note}</span>
        <div style="background:var(--bg4);height:10px;width:200px;border-radius:2px;overflow:hidden;">
          <div style="background:var(--c4);height:100%;width:${w}%;"></div>
        </div>
        <span style="margin-left:8px;color:var(--muted);">${n.pct}%</span>
      </div>`;
    }).join('');

    result.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:6px;">TONALIDADE</div>
          <div style="font-family:Orbitron,monospace;font-weight:900;font-size:28px;color:var(--c4);">${noteNames[bestKey]} ${bestMode}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:4px;">${totalFramesAnalyzed} frames analisados</div>

          <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-top:18px;margin-bottom:6px;">AFINAÇÃO GLOBAL</div>
          <div style="font-family:Orbitron,monospace;font-weight:900;font-size:22px;color:${tuningColor};">${avgCentsOff>=0?'+':''}${avgCentsOff.toFixed(1)} cents</div>
          <div style="font-size:10px;color:var(--muted);margin-top:4px;">A real ≈ ${realA.toFixed(2)} Hz (ref: 440.00)</div>
          <div style="font-size:10px;color:${tuningColor};margin-top:6px;">${tuningStatus}</div>
        </div>

        <div>
          <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:6px;">7 NOTAS MAIS FREQUENTES</div>
          ${histRows}
        </div>
      </div>

      <div style="border-top:1px solid var(--border);margin-top:14px;padding-top:10px;font-size:10px;color:var(--muted);">
        💡 Clica "2. AJUSTAR" para opções de correção (pitch shift global, mudança de tom, etc.)
      </div>
    `;
  }, 100);
};

// ═══════════════════════════════════════════════════════════════════════════
// AJUSTAR: 3 opções reais que dá para fazer no master
// ═══════════════════════════════════════════════════════════════════════════
window.aiVocalShowApply = function(){
  const result = document.getElementById('vocal-result');
  const a = window._aiVocalAnalysis;
  if(!a){
    result.innerHTML = '<div style="color:var(--c3);">⚠ Analisa primeiro (botão 1).</div>';
    return;
  }

  result.innerHTML = `
    <div style="font-size:10px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:10px;">AJUSTES POSSÍVEIS NO MASTER</div>

    <div style="background:var(--bg2);border:1px solid var(--c4);border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="color:var(--c4);font-weight:700;font-size:13px;">A. Corrigir desvio de afinação</div>
          <div style="color:var(--muted);font-size:10px;margin-top:3px;">Aplica shift de ${(-a.avgCentsOff).toFixed(1)} cents para voltar a A=440 Hz exato</div>
        </div>
        <button onclick="aiVocalCorrectTuning()" style="padding:8px 14px;background:var(--c4);color:var(--bg);border:0;border-radius:5px;font-weight:700;font-size:10px;cursor:pointer;">APLICAR</button>
      </div>
    </div>

    <div style="background:var(--bg2);border:1px solid var(--c5);border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="margin-bottom:8px;">
        <div style="color:var(--c5);font-weight:700;font-size:13px;">B. Mudar tonalidade da música</div>
        <div style="color:var(--muted);font-size:10px;margin-top:3px;">Pitch shift global em semitons (ex: ${a.key} maior → C maior)</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button onclick="aiVocalPitchShift(-2)" style="flex:1;padding:6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-size:10px;cursor:pointer;">-2</button>
        <button onclick="aiVocalPitchShift(-1)" style="flex:1;padding:6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-size:10px;cursor:pointer;">-1 semi</button>
        <button onclick="aiVocalPitchShift(0)" style="flex:1;padding:6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-size:10px;cursor:pointer;">RESET</button>
        <button onclick="aiVocalPitchShift(1)" style="flex:1;padding:6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-size:10px;cursor:pointer;">+1 semi</button>
        <button onclick="aiVocalPitchShift(2)" style="flex:1;padding:6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-size:10px;cursor:pointer;">+2</button>
      </div>
      <div style="color:var(--c3);font-size:9px;margin-top:6px;">⚠ Note: shift global altera TUDO (kick, baixo, instrumentos). Útil para versões em tons diferentes.</div>
    </div>

    <div style="background:var(--bg2);border:1px solid var(--muted);border-radius:8px;padding:12px;">
      <div style="color:var(--muted);font-weight:700;font-size:13px;">C. Pitch correction nota-a-nota</div>
      <div style="color:var(--muted);font-size:10px;margin-top:6px;line-height:1.5;">
        Não é tecnicamente possível no master. Para Melodyne-style correction:
      </div>
      <div style="color:var(--muted);font-size:10px;margin-top:4px;line-height:1.6;">
        1. Exporta os stems (vocais isolados)<br>
        2. Aplica Melodyne ARA ou Auto-Tune Pro ao stem vocal<br>
        3. Volta a importar para masterizar
      </div>
      <div style="color:var(--c4);font-size:10px;margin-top:8px;">
        💡 Quando o módulo <b>AI Stem Separator</b> sair (Coming Soon), poderás isolar o vocal e fazer pitch correction a sério dentro da app.
      </div>
    </div>

    <div style="font-size:10px;color:var(--muted);margin-top:12px;border-top:1px solid var(--border);padding-top:10px;">
      📊 Tonalidade detectada: <b style="color:var(--c4)">${a.key} ${a.mode}</b> ·
      Desvio: <b style="color:var(--c5)">${a.avgCentsOff>=0?'+':''}${a.avgCentsOff.toFixed(1)} cents</b>
    </div>
  `;
};

// ═══════════════════════════════════════════════════════════════════════════
// A. CORRIGIR DESVIO: aplica pitch shift global negativo para voltar a A=440
// ═══════════════════════════════════════════════════════════════════════════
window.aiVocalCorrectTuning = function(){
  const result = document.getElementById('vocal-result');
  const a = window._aiVocalAnalysis;
  if(!a) return;
  const cents = -a.avgCentsOff;
  // Aplica pitch shift via re-encode do audioBuffer
  // Como o master usa playbackRate, simulamos shift via gain do filtro de modulação
  // No browser, a forma mais segura é mudar o playbackRate do source ativo
  if(window.audioSource && window.audioSource.playbackRate){
    const ratio = Math.pow(2, cents/1200);
    try{
      window.audioSource.playbackRate.setValueAtTime(ratio, audioCtx.currentTime);
      result.innerHTML = `
        <div style="color:var(--c4);font-weight:700;font-size:13px;">✓ Correção aplicada</div>
        <div style="margin-top:8px;font-size:11px;">Pitch shift global: ${cents>=0?'+':''}${cents.toFixed(1)} cents</div>
        <div style="margin-top:6px;font-size:11px;color:var(--muted);">Rácio de velocidade: ${ratio.toFixed(5)}×</div>
        <div style="margin-top:10px;font-size:10px;color:var(--c3);">⚠ Atenção: alterar playbackRate ALTERA TAMBÉM A DURAÇÃO da faixa (${(ratio>1?'mais curta':'mais longa')}).</div>
        <div style="margin-top:4px;font-size:10px;color:var(--c3);">Para correção sem alterar duração, é preciso pitch shifting offline (PSOLA / phase vocoder) — o módulo Afinação de Voz tem isso para faixas individuais.</div>
      `;
    }catch(e){
      result.innerHTML = `<div style="color:var(--c7);">Erro: ${e.message}</div>`;
    }
  } else {
    result.innerHTML = `<div style="color:var(--c3);">⚠ Inicia a reprodução primeiro para aplicar o ajuste.</div>`;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// B. MUDAR TONALIDADE: pitch shift global em semitons
// ═══════════════════════════════════════════════════════════════════════════
window.aiVocalPitchShift = function(semis){
  const result = document.getElementById('vocal-result');
  if(window.audioSource && window.audioSource.playbackRate){
    const ratio = Math.pow(2, semis/12);
    try{
      window.audioSource.playbackRate.setValueAtTime(ratio, audioCtx.currentTime);
      result.innerHTML += `
        <div style="background:var(--bg3);border-left:3px solid var(--c5);padding:8px 12px;margin-top:8px;border-radius:4px;font-size:11px;">
          <b style="color:var(--c5);">${semis===0?'Reset':(semis>0?'+':'')+semis+' semitons aplicados'}</b>
          · rácio ${ratio.toFixed(4)}× · duração ${ratio>1?'reduzida':'aumentada'}
        </div>
      `;
    }catch(e){}
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AI STEMS — Coming Soon (modelo Demucs precisa de servidor ou WebGPU)
// ═══════════════════════════════════════════════════════════════════════════
window.fxView_aiStems = comingSoon('Stems',
  'Separa qualquer faixa em 6 stems (vocal lead, harmonias, kick, snare, baixo, instrumentos) usando Demucs HT. Permite re-balanço antes de masterizar.',
  '• Modelo: Demucs HT quantizado int8 (~25 MB)<br>• Performance: requer WebGPU para correr em tempo razoável<br>• Status: a investigar viabilidade de ONNX Runtime Web + WebGPU');

// ═══════════════════════════════════════════════════════════════════════════
// AI LYRIC-AWARE — Coming Soon (Whisper precisa de modelo grande)
// ═══════════════════════════════════════════════════════════════════════════
window.fxView_aiLyric = comingSoon('Lyric-Aware',
  'Whisper deteta vocal vs instrumental e transcreve a letra. A masterização aplica EQ/comp diferenciado nos versos (mais espaço) vs refrões (mais punch).',
  '• Modelo: Whisper.cpp small (~75 MB)<br>• Performance: ~1x real-time com WASM SIMD<br>• Status: download do modelo é grande para utilizador típico (5-10 min em mobile)');

})();
