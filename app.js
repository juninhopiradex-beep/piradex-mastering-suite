// ===== PIRADEX MASTERING SUITE v1.0 =====

const PRESETS = {
  kizomba:  {name:'KIZOMBA',  refs:'C4 Pedro · Johnny Ramos · Nelson Freitas', desc:'Graves quentes, body nos mids baixos',
    knobs:{CLEAN:28,BASS:71,LOUD:41,WIDE:42,PUNCH:39,FOCUS:37},eq:{sub:0.6,bass:0.7,low:0.8,mid:-0.2,high:-0.3,air:0.4},
    sugs:[['Bass body @ 150Hz','+0.7 dB','c2'],['Low-mid warmth','+0.8 dB','c3'],['Stereo groove','+42%','c5']]},
  kuduro:   {name:'KUDURO',   refs:'Titica · Kapota', desc:'Sub kick agressivo, energia máxima de dança',
    knobs:{CLEAN:16,BASS:80,LOUD:40,WIDE:28,PUNCH:37,FOCUS:37},eq:{sub:3.9,bass:-0.5,low:-0.8,mid:-0.2,high:-0.3,air:-0.4},
    sugs:[['Sub kick @ 60Hz','+3.9 dB','c2'],['Low-mid cut','-0.8 dB','c3'],['Tight mono','-0.4 dB','c5']]},
  zouk:     {name:'ZOUK',     refs:'Kassav', desc:'Sub profundo, amplitude romántica, muito dinâmico',
    knobs:{CLEAN:28,BASS:83,LOUD:66,WIDE:72,PUNCH:67,FOCUS:37},eq:{sub:3.8,bass:0.0,low:-0.8,mid:-0.2,high:0.0,air:0.0},
    sugs:[['Deep sub @ 60Hz','+3.8 dB','c2'],['Low-mid clean','-0.8 dB','c3'],['Wide stereo','+72%','c5']]},
  gzouk:    {name:'GZOUK',    refs:'Kaysha', desc:'Corpo nos mids baixos, groove urbano',
    knobs:{CLEAN:28,BASS:58,LOUD:53,WIDE:58,PUNCH:53,FOCUS:50},eq:{sub:-0.6,bass:-0.2,low:2.2,mid:0.4,high:0.0,air:0.0},
    sugs:[['Low-mid body @ 500Hz','+2.2 dB','c2'],['Mid presence','+0.4 dB','c3'],['Urban width','+58%','c5']]},
  semba:    {name:'SEMBA',    refs:'Cabelos Brancos', desc:'Bass quente dominante, alma angolana',
    knobs:{CLEAN:22,BASS:77,LOUD:61,WIDE:44,PUNCH:62,FOCUS:33},eq:{sub:-3.1,bass:4.7,low:0.2,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Bass warmth @ 150Hz','+4.7 dB','c2'],['Sub cut','-3.1 dB','c3'],['Natural groove','+44%','c5']]},
  afrohouse:{name:'AFRO-HOUSE',refs:'Lau Silva · Nitefreak · TAKA', desc:'Sub extremo, kick profundo, dancefloor',
    knobs:{CLEAN:22,BASS:85,LOUD:52,WIDE:62,PUNCH:45,FOCUS:33},eq:{sub:4.8,bass:-0.5,low:-0.8,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Sub weight @ 50Hz','+4.8 dB','c2'],['Bass definition','-0.5 dB','c3'],['Club width','+62%','c5']]},
  rnb:      {name:'R&B',      refs:'Mario · Ne-Yo · Usher · Chris Brown', desc:'Voz no topo, dinâmico, polido',
    knobs:{CLEAN:22,BASS:59,LOUD:70,WIDE:55,PUNCH:64,FOCUS:50},eq:{sub:-1.2,bass:0.5,low:2.0,mid:0.4,high:0.0,air:-0.4},
    sugs:[['Low-mid body @ 500Hz','+2.0 dB','c2'],['Sub control','-1.2 dB','c3'],['Vocal presence','+0.4 dB','c5']]},
  afrobeats:{name:'AFROBEATS',refs:'Davido · Rema · Lojay', desc:'Sub pesado, groove colorido',
    knobs:{CLEAN:28,BASS:77,LOUD:47,WIDE:56,PUNCH:46,FOCUS:41},eq:{sub:2.1,bass:0.5,low:0.0,mid:0.0,high:0.0,air:0.0},
    sugs:[['Sub groove @ 60Hz','+2.1 dB','c2'],['Bass presence','+0.5 dB','c3'],['Afro width','+56%','c5']]},
  house:    {name:'HOUSE',    refs:'Adam Port · HUGEL', desc:'Sub dominante, kick 4x4, dancefloor -8 LUFS',
    knobs:{CLEAN:16,BASS:86,LOUD:85,WIDE:50,PUNCH:39,FOCUS:28},eq:{sub:5.1,bass:-0.6,low:-0.7,mid:-0.6,high:-0.3,air:-0.4},
    sugs:[['Sub punch @ 50Hz','+5.1 dB','c2'],['Bass tightness','-0.6 dB','c3'],['Club energy','+85%','c7']]}
};

const KNOBS_DEF   = ['CLEAN','BASS','LOUD','WIDE','PUNCH','FOCUS'];
const KNOB_COLORS = {CLEAN:'#2dd4ff',BASS:'#b855f7',LOUD:'#ff3ab5',WIDE:'#2dff8a',PUNCH:'#ff6b35',FOCUS:'#ffe135'};
const SPEC_COLORS = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];
const FREQ_LABELS = [20,50,100,200,500,1000,2000,5000,10000,20000];
const DB_LABELS   = [0,-12,-24,-48,-72,-90];

let kvals     = {...PRESETS.kizomba.knobs};
let piradexOn = false, bypassOn = false, curPreset = 'kizomba', playMode = 'before';

// Audio nodes
let audioCtx=null, audioBuffer=null, sourceNode=null;
let eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir;
let compNode, limiterNode, masterGain, dryGain;
let shapeWS=null, shapeDryGain=null, shapeWetGain=null;
let widthMerger=null, widthSplitter=null;
let msEqMidLow=null, msEqMidHigh=null, msEqSideLow=null, msEqSideHigh=null;
let msMidGain=null, msSideGain=null;
let analyserNode=null;
let isPlaying=false, pauseOffset=0, startTime=0;
let animProgress, animRunning=false;
let vuL=0.02, vuR=0.02, peakHoldL=0, peakHoldR=0;
let peakHoldTimerL=0, peakHoldTimerR=0;
let lufsSmooth=-14, idlePhase=0;
let shapeMode='tape';
let refBuffer=null, refStats=null;
let specPeaks=null, specSmooth=null;
let specHoverX=-1;
let loudTarget=-9;

// ===== TABS =====
function openTab(name, el) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  const panel=document.getElementById('tab-'+name);
  if(panel) panel.classList.add('active');
  if(name==='eq') setTimeout(drawEQCurve,50);
}

// ===== AUDIO INIT =====
function initAudio() {
  if(audioCtx) return;
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  buildChain();
  startAnimLoop();
}

function buildChain() {
  const mk=(type,freq,gain,Q)=>{
    const f=audioCtx.createBiquadFilter();
    f.type=type; f.frequency.value=freq; f.gain.value=gain||0;
    if(Q) f.Q.value=Q; return f;
  };

  // EQ
  eqSub    = mk('lowshelf',  60,   0);
  eqBass   = mk('peaking',   150,  0, 0.8);
  eqLowNode= mk('peaking',   500,  0, 1.0);
  eqMid    = mk('peaking',   1200, 0, 0.9);
  eqHigh   = mk('peaking',   4000, 0, 1.0);
  eqAir    = mk('highshelf', 12000,0);

  // Compressor
  compNode = audioCtx.createDynamicsCompressor();
  compNode.threshold.value=-24; compNode.ratio.value=4;
  compNode.attack.value=0.01; compNode.release.value=0.15; compNode.knee.value=6;

  // Limiter
  limiterNode = audioCtx.createDynamicsCompressor();
  limiterNode.threshold.value=-1; limiterNode.ratio.value=20;
  limiterNode.attack.value=0.001; limiterNode.release.value=0.05; limiterNode.knee.value=0;

  // Shape parallel nodes
  shapeWS      = audioCtx.createWaveShaper();
  shapeWS.oversample = '4x';
  shapeDryGain = audioCtx.createGain(); shapeDryGain.gain.value=1.0;
  shapeWetGain = audioCtx.createGain(); shapeWetGain.gain.value=0.0;

  // Width (stereo) via splitter/merger
  widthSplitter= audioCtx.createChannelSplitter(2);
  widthMerger  = audioCtx.createChannelMerger(2);

  // Mid/Side EQ nodes
  msEqMidLow   = mk('lowshelf',  200,  0);
  msEqMidHigh  = mk('highshelf', 4000, 0);
  msEqSideLow  = mk('lowshelf',  200,  0);
  msEqSideHigh = mk('highshelf', 4000, 0);
  msMidGain    = audioCtx.createGain(); msMidGain.gain.value=1.0;
  msSideGain   = audioCtx.createGain(); msSideGain.gain.value=1.0;

  // Master & dry gains
  masterGain = audioCtx.createGain(); masterGain.gain.value=1.0;
  dryGain    = audioCtx.createGain(); dryGain.gain.value=0.85;

  // Analyser
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize=8192;
  analyserNode.smoothingTimeConstant=0.0;

  // Init spectrum arrays
  specPeaks  = new Float32Array(2048).fill(-150);
  specSmooth = new Float32Array(2048).fill(-150);

  // WET CHAIN:
  // source → EQ → [Shape parallel] → Comp → Limiter → MasterGain → Analyser → Out
  eqSub.connect(eqBass); eqBass.connect(eqLowNode); eqLowNode.connect(eqMid);
  eqMid.connect(eqHigh); eqHigh.connect(eqAir);

  // Shape parallel: eqAir → (dry+wet) → shapeMixer → compNode
  const shapeMixer = audioCtx.createGain(); shapeMixer.gain.value=1.0;
  eqAir.connect(shapeDryGain); shapeDryGain.connect(shapeMixer);
  eqAir.connect(shapeWS); shapeWS.connect(shapeWetGain); shapeWetGain.connect(shapeMixer);
  shapeMixer.connect(compNode);

  compNode.connect(limiterNode); limiterNode.connect(masterGain);
  masterGain.connect(analyserNode);
  dryGain.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);

  applyShapeCurve();
}

// ===== SHAPE DSP =====
const SHAPE_INFO={
  tape:'TAPE: saturação suave analógica com warmth de harmónicos pares. Mix paralela preserva dinâmica.',
  tube:'TUBE: saturação de válvula clássica com harmónicos ímpares ricos. Ideal para voz.',
  transistor:'TRANSISTOR: saturação de transístor com resposta rápida. Ideal para percussão e baixo.',
  solidstate:'SOLID STATE: compressão densa analógica moderna, definida e controlada.',
  analogico:'ANALÓGICO: emulação de circuito analógico completo com warmth e não-linearidade natural.',
  valvulado:'VALVULADO: válvula de vácuo tipo 1176/LA-2A. Harmónicos suaves e musicais.',
  transparente:'TRANSPARENTE: saturação mínima sem coloração. Apenas glue suave.',
  clip:'CLIP: clipping suave digital que aumenta loudness percebido.',
  paralimit:'PARALIMIT: limiting paralelo — preserva transientes, aumenta corpo.',
  deess:'DE-ESS: atenuação de sibilantes e harshness acima de 5kHz.'
};

function makeShapeCurve(mode, drive) {
  const n=512, curve=new Float32Array(n);
  const k=Math.max(0.001, drive);
  for(let i=0;i<n;i++){
    const x=(i*2/(n-1))-1;
    switch(mode){
      case 'tape':        curve[i]=Math.tanh(x*(1+k*4))/(1+k*0.2); break;
      case 'tube':
      case 'valvulado':   curve[i]=(1+k)*x/(1+k*Math.abs(x)); break;
      case 'transistor':
      case 'solidstate':  curve[i]=Math.sign(x)*Math.pow(Math.abs(x),Math.max(0.1,1-k*0.8)); break;
      case 'analogico':   curve[i]=Math.tanh(x*(1+k*3))*(1+k*0.15); break;
      case 'clip':        { const th=Math.max(0.05,1-k*0.9); curve[i]=Math.max(-th,Math.min(th,x))/th; break; }
      case 'paralimit':   curve[i]=x/Math.sqrt(1+x*x*(k*4)); break;
      case 'transparente':curve[i]=x*(1+k*0.3); break;
      case 'deess':       curve[i]=x>0.5*( 1-k*0.5)?0.5*(1-k*0.5)+(x-0.5*(1-k*0.5))*0.2:
                           x<-0.5*(1-k*0.5)?-0.5*(1-k*0.5)+(x+0.5*(1-k*0.5))*0.2:x; break;
      default:            curve[i]=Math.tanh(x*(1+k*2));
    }
  }
  return curve;
}

function applyShapeCurve() {
  if(!shapeWS) return;
  const drive=parseFloat(document.getElementById('shape-drive')?.value||0)/100;
  shapeWS.curve=makeShapeCurve(shapeMode, drive);
}

function setShapeMode(mode,el){
  shapeMode=mode;
  document.querySelectorAll('.shape-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('shape-info').textContent=SHAPE_INFO[mode];
  applyShapeCurve();
  if(isPlaying) setStatus('Shape: '+mode.toUpperCase()+' activo — ouve a diferença no AFTER');
}

function updateShape(){
  const drive=parseFloat(document.getElementById('shape-drive').value);
  const mix  =parseFloat(document.getElementById('shape-mix').value)/100;
  const trim =parseFloat(document.getElementById('shape-trim').value);
  document.getElementById('shape-drive-v').textContent=drive+'%';
  document.getElementById('shape-mix-v').textContent=Math.round(mix*100)+'%';
  document.getElementById('shape-2nd-v').textContent=document.getElementById('shape-2nd').value+'%';
  document.getElementById('shape-3rd-v').textContent=document.getElementById('shape-3rd').value+'%';
  document.getElementById('shape-trim-v').textContent=(trim>=0?'+':'')+trim.toFixed(1)+' dB';
  if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1-mix, audioCtx.currentTime, 0.05);
  if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(mix,   audioCtx.currentTime, 0.05);
  applyShapeCurve();
  if(masterGain&&audioCtx&&trim!==0){
    const trimFactor=Math.pow(10,trim/20);
    masterGain.gain.setTargetAtTime(masterGain.gain.value*trimFactor, audioCtx.currentTime, 0.1);
  }
}

// ===== DSP =====
function applyDSP() {
  if(!audioCtx) return;
  if(piradexOn){ applyPiradexDSP(); return; } // Piradex isolated chain
  const {BASS:bass,CLEAN:clean,LOUD:loud,PUNCH:punch,FOCUS:focus,WIDE:wide}=kvals;

  if(bypassOn){
    [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
    compNode.threshold.value=0; compNode.ratio.value=1;
    masterGain.gain.setTargetAtTime(0.85,audioCtx.currentTime,0.05); return;
  }

  // EQ from knobs
  eqSub.gain.value    = (bass -30)*0.20;
  eqBass.gain.value   = (bass -40)*0.15;
  eqLowNode.gain.value= (bass -50)*0.08;
  eqMid.gain.value    = (focus-50)*0.14;
  eqHigh.gain.value   = (clean-50)*0.10;
  eqAir.gain.value    = (clean-30)*0.12;

  // Compressor from PUNCH knob
  compNode.threshold.value = -50+(punch*0.36);
  compNode.ratio.value     = Math.max(1.1, 1.5+(punch*0.15));
  compNode.attack.value    = Math.max(0.001, 0.03-(punch*0.0002));
  compNode.release.value   = Math.max(0.05,  0.3-(punch*0.002));

  // Width via side gain
  if(msSideGain){
    const wFactor=wide/50; // 50=unity, 0=mono, 100=double wide
    msSideGain.gain.setTargetAtTime(Math.max(0,wFactor), audioCtx.currentTime, 0.1);
  }

  const isHouse=curPreset==='house';
  if(piradexOn){
    compNode.threshold.value=-20; compNode.ratio.value=16; compNode.attack.value=0.001;
    eqSub.gain.value+=8; eqBass.gain.value+=5; eqAir.gain.value+=4;
    masterGain.gain.setTargetAtTime(isHouse?2.8:2.4, audioCtx.currentTime, 0.05);
  } else {
    const base=isHouse?0.50:0.35;
    masterGain.gain.setTargetAtTime(base+(loud/100)*1.4, audioCtx.currentTime, 0.05);
  }

  syncEQSliders();
  updateLUFSDisplay();
}

// ===== EQ =====
function syncEQSliders(){
  const map={sub:eqSub,bass:eqBass,low:eqLowNode,mid:eqMid,high:eqHigh,air:eqAir};
  for(const [k,node] of Object.entries(map)){
    const sl=document.getElementById('eq-'+k), lbl=document.getElementById('eq-'+k+'-v');
    const v=node.gain.value;
    if(sl) sl.value=v;
    if(lbl) lbl.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';
  }
  drawEQCurve();
}

function updateEQBand(band, val){
  const v=parseFloat(val);
  const lbl=document.getElementById('eq-'+band+'-v');
  if(lbl) lbl.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';
  const map={sub:eqSub,bass:eqBass,low:eqLowNode,mid:eqMid,high:eqHigh,air:eqAir};
  if(map[band]&&audioCtx) map[band].gain.value=v;
  drawEQCurve();
}

function drawEQCurve(){
  const canvas=document.getElementById('eq-canvas'); if(!canvas) return;
  const eqOw=canvas.offsetWidth||600;
  if(canvas.width!==eqOw) canvas.width=eqOw;
  const W=canvas.width, H=canvas.height||90;
  const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#ffffff08'; ctx.lineWidth=1;
  [0.25,0.5,0.75].forEach(p=>{ctx.beginPath();ctx.moveTo(0,p*H);ctx.lineTo(W,p*H);ctx.stroke();});
  ctx.strokeStyle='#ffffff18'; ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  const bands=[{f:60,g:eqSub?.gain.value||0},{f:150,g:eqBass?.gain.value||0},
    {f:500,g:eqLowNode?.gain.value||0},{f:1200,g:eqMid?.gain.value||0},
    {f:4000,g:eqHigh?.gain.value||0},{f:12000,g:eqAir?.gain.value||0}];
  const grad=ctx.createLinearGradient(0,0,W,0);
  SPEC_COLORS.forEach((c,i)=>grad.addColorStop(i/(SPEC_COLORS.length-1),c+'99'));
  ctx.strokeStyle=grad; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,H/2);
  bands.forEach(b=>{
    const x=Math.log10(b.f/20)/Math.log10(22000/20)*W;
    const y=H/2-(b.g/12)*(H/2-6); ctx.lineTo(x,y);
  });
  ctx.lineTo(W,H/2); ctx.stroke();
}

// ===== MODULE CONTROLS =====
function updateComp(){
  const thr=parseFloat(document.getElementById('comp-thr').value);
  const ratio=parseFloat(document.getElementById('comp-ratio').value);
  const atk=parseFloat(document.getElementById('comp-attack').value);
  const rel=parseFloat(document.getElementById('comp-release').value);
  const knee=parseFloat(document.getElementById('comp-knee').value);
  const makeup=parseFloat(document.getElementById('comp-makeup').value);
  document.getElementById('comp-thr-v').textContent=thr+' dB';
  document.getElementById('comp-ratio-v').textContent=ratio+' : 1';
  document.getElementById('comp-attack-v').textContent=atk+' ms';
  document.getElementById('comp-release-v').textContent=rel+' ms';
  document.getElementById('comp-knee-v').textContent=knee+' dB';
  document.getElementById('comp-makeup-v').textContent='+'+makeup+' dB';
  if(compNode&&audioCtx){
    compNode.threshold.value=thr; compNode.ratio.value=ratio;
    compNode.attack.value=atk/1000; compNode.release.value=rel/1000; compNode.knee.value=knee;
    masterGain.gain.setTargetAtTime(Math.pow(10,makeup/20),audioCtx.currentTime,0.05);
  }
  document.getElementById('gr-fill').style.width=Math.min(100,Math.abs(thr)/60*100)+'%';
  document.getElementById('gr-val').textContent='-'+(Math.abs(thr)/6|0)+' dB';
}

function updateDyn(){
  const atk=parseFloat(document.getElementById('dyn-attack').value);
  const sus=parseFloat(document.getElementById('dyn-sustain').value);
  const clip=parseFloat(document.getElementById('dyn-clip').value);
  document.getElementById('dyn-attack-v').textContent=atk;
  document.getElementById('dyn-sustain-v').textContent=sus;
  document.getElementById('dyn-clip-v').textContent=clip.toFixed(1)+' dBTP';
  document.getElementById('dyn-look-v').textContent=document.getElementById('dyn-look').value+' ms';
  if(limiterNode&&audioCtx){
    limiterNode.threshold.value=clip;
    compNode.attack.value=Math.max(0.001,0.03-atk*0.0003);
    compNode.release.value=Math.max(0.05,0.15+sus*0.002);
  }
}

function updateWidth(){
  const w=parseFloat(document.getElementById('width-main').value);
  const mid=parseFloat(document.getElementById('width-mid').value);
  const side=parseFloat(document.getElementById('width-side').value);
  const bm=document.getElementById('width-bass-mono').value;
  document.getElementById('width-main-v').textContent=w+'%';
  document.getElementById('width-mid-v').textContent=(mid>=0?'+':'')+mid+' dB';
  document.getElementById('width-side-v').textContent=(side>=0?'+':'')+side+' dB';
  document.getElementById('width-bass-mono-v').textContent=bm+' Hz';
  document.getElementById('wm-fill').style.width=Math.min(100,w/2)+'%';
  // Apply width: 100%=unity, 0%=mono, 200%=max wide
  if(msSideGain&&audioCtx){
    msSideGain.gain.setTargetAtTime(Math.max(0,w/50),audioCtx.currentTime,0.1);
  }
  if(msMidGain&&audioCtx){
    msMidGain.gain.setTargetAtTime(Math.pow(10,mid/20),audioCtx.currentTime,0.1);
  }
  // Apply EQ on mid/side channels
  if(msEqMidLow&&audioCtx)  msEqMidLow.gain.value=mid*0.3;
  if(msEqSideHigh&&audioCtx) msEqSideHigh.gain.value=side*0.5;
}

function updateExcite(){
  const f=parseFloat(document.getElementById('exc-freq').value);
  const amt=parseFloat(document.getElementById('exc-amount').value);
  document.getElementById('exc-freq-v').textContent=f>=1000?(f/1000).toFixed(1)+' kHz':f+' Hz';
  document.getElementById('exc-amount-v').textContent=amt+'%';
  document.getElementById('exc-harm-v').textContent=document.getElementById('exc-harm').value+'%';
  document.getElementById('exc-mix-v').textContent=document.getElementById('exc-mix').value+'%';
  if(eqAir&&audioCtx){ eqAir.frequency.value=f; eqAir.gain.value=amt*0.15; }
}

// ===== LOUD — platform buttons =====
function updateLoud(){
  const t=parseFloat(document.getElementById('loud-target').value);
  const p=parseFloat(document.getElementById('loud-peak').value);
  loudTarget=t;
  document.getElementById('loud-target-v').textContent=t.toFixed(1)+' LUFS';
  document.getElementById('loud-peak-v').textContent=p.toFixed(1)+' dBTP';
  document.getElementById('loud-window-v').textContent=document.getElementById('loud-window').value+' s';
  document.getElementById('lufs-big-val').textContent=t.toFixed(1);
  if(limiterNode&&audioCtx) limiterNode.threshold.value=p;
  // Apply gain to match target
  if(masterGain&&audioCtx){
    const gainNeeded=Math.pow(10,(t+14)/20)*0.9;
    masterGain.gain.setTargetAtTime(gainNeeded,audioCtx.currentTime,0.2);
  }
}

function selectLoudPlatform(target, el){
  document.getElementById('loud-target').value=target;
  document.querySelectorAll('.lufs-platform').forEach(p=>p.classList.remove('active-platform'));
  el.classList.add('active-platform');
  loudTarget=parseFloat(target);
  document.getElementById('loud-target-v').textContent=parseFloat(target).toFixed(1)+' LUFS';
  document.getElementById('lufs-big-val').textContent=parseFloat(target).toFixed(1);
  if(limiterNode&&masterGain&&audioCtx){
    const gainNeeded=Math.pow(10,(parseFloat(target)+14)/20)*0.9;
    masterGain.gain.setTargetAtTime(gainNeeded,audioCtx.currentTime,0.2);
  }
  setStatus('Loudness alvo: '+target+' LUFS ('+el.querySelector('.plat-name').textContent+')');
}

function updateLimit(){
  const c=parseFloat(document.getElementById('lim-ceil').value);
  const r=document.getElementById('lim-rel').value;
  const l=document.getElementById('lim-look').value;
  document.getElementById('lim-ceil-v').textContent=c.toFixed(1)+' dBTP';
  document.getElementById('lim-rel-v').textContent=r+' ms';
  document.getElementById('lim-look-v').textContent=l+' ms';
  if(limiterNode&&audioCtx){ limiterNode.threshold.value=c; limiterNode.release.value=r/1000; }
}

// ===== MID/SIDE — real M/S processing =====
function updateMidSide(){
  const get=id=>parseFloat(document.getElementById(id)?.value||0);
  const set=(id,v)=>{const el=document.getElementById(id+'-v');if(el)el.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';};

  const mLow=get('ms-mid-low'),   mMid=get('ms-mid-mid'),   mHigh=get('ms-mid-high');
  const mComp=get('ms-mid-comp'), mGain=get('ms-mid-gain');
  const sLow=get('ms-side-low'),  sMid=get('ms-side-mid'),  sHigh=get('ms-side-high');
  const sComp=get('ms-side-comp'),sGain=get('ms-side-gain');

  ['mid-low','mid-mid','mid-high','mid-comp','mid-gain','side-low','side-mid','side-high','side-comp','side-gain'].forEach(id=>{
    const v=get('ms-'+id); set('ms-'+id,v);
  });

  // Apply Mid channel: sum of adjustments goes into EQ nodes
  if(audioCtx&&eqSub){
    // Mid EQ affects centre image (L+R)
    eqSub.gain.value    += mLow*0.3;
    eqMid.gain.value    += mMid*0.3;
    eqAir.gain.value    += mHigh*0.3;
    // Side EQ affects stereo difference (L-R)
    eqBass.gain.value   += sLow*0.2;
    eqHigh.gain.value   += sHigh*0.2;
    // Gains
    if(msMidGain)  msMidGain.gain.setTargetAtTime(Math.pow(10,mGain/20),  audioCtx.currentTime,0.1);
    if(msSideGain) msSideGain.gain.setTargetAtTime(Math.pow(10,sGain/20)*kvals.WIDE/50, audioCtx.currentTime,0.1);
    // Mid compressor
    if(mComp<0&&compNode) compNode.threshold.value=Math.max(-60, compNode.threshold.value+mComp*0.5);
  }
  setStatus('M/S aplicado — Mid e Side processados independentemente');
}

// ===== REFERENCE TRACK =====
function handleRefDrop(e){
  e.preventDefault(); document.getElementById('ref-drop').classList.remove('drag-over');
  if(e.dataTransfer.files[0]) loadRef(e.dataTransfer.files[0]);
}
document.getElementById('ref-file').addEventListener('change',function(){if(this.files[0])loadRef(this.files[0]);});

async function loadRef(file){
  initAudio();
  setStatus('A carregar referência...');
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try{
      refBuffer=await audioCtx.decodeAudioData(e.target.result.slice(0));
      analyseAndDisplayRef(file.name);
    }catch(err){setStatus('Erro referência: '+err.message);}
  };
  reader.readAsArrayBuffer(file);
}

function analyseAndDisplayRef(name){
  if(!refBuffer) return;
  const data=refBuffer.getChannelData(0);
  const step=Math.ceil(data.length/1000);
  let sq=0,peak=0,lowE=0,midE=0,highE=0;
  const total=Math.floor(data.length/step);
  for(let i=0;i<data.length;i+=step){
    const v=Math.abs(data[i]||0); sq+=v*v; if(v>peak)peak=v;
    const seg=Math.floor(i/(data.length/10));
    if(seg<3)lowE+=v; else if(seg<7)midE+=v; else highE+=v;
  }
  const rms=Math.sqrt(sq/total);
  const lufs=rms>0?20*Math.log10(rms)-0.691:-70;
  const peakdB=peak>0?20*Math.log10(peak):-70;
  const dynRange=(peak>0&&rms>0)?20*Math.log10(peak/rms):20;
  const tot=lowE+midE+highE||1;
  refStats={lufs,peakdB,dynRange,lowR:lowE/tot,midR:midE/tot,highR:highE/tot,name};

  // Show info panel, hide drop zone
  document.getElementById('ref-drop').style.display='none';
  document.getElementById('ref-info').style.display='block';

  // Draw waveform
  const canvas=document.getElementById('ref-canvas');
  const rOw=canvas.offsetWidth||600;
  if(canvas.width!==rOw) canvas.width=rOw;
  canvas.height=70;
  const W=canvas.width, H=70;
  const ctx2=canvas.getContext('2d');
  const s=Math.ceil(data.length/W);
  ctx2.clearRect(0,0,W,H);
  // Background
  ctx2.fillStyle='#0a0a10'; ctx2.fillRect(0,0,W,H);
  for(let i=0;i<W;i++){
    let max=0; for(let j=0;j<s;j++){const vv=Math.abs(data[i*s+j]||0);if(vv>max)max=vv;}
    const h=max*(H-4);
    const pct=i/W;
    const r=Math.round(255*(pct<0.33?1:pct<0.66?1-(pct-0.33)/0.33:0));
    const g=Math.round(255*(pct<0.33?0:pct<0.66?(pct-0.33)/0.33:1-(pct-0.66)/0.34));
    const b=Math.round(255*(pct<0.5?0:pct<0.8?(pct-0.5)/0.3:1));
    ctx2.fillStyle=`rgba(${r+100},${g+50},${b+200},0.85)`;
    ctx2.fillRect(i,H/2-h/2,1,h);
  }

  // Stats display
  document.getElementById('ref-stats').innerHTML=
    `<strong style="color:var(--c6)">📊 ${name.replace(/\.[^.]+$/,'')}</strong><br>`+
    `LUFS: <strong>${lufs.toFixed(1)}</strong> &nbsp;|&nbsp; `+
    `Peak: <strong>${peakdB.toFixed(1)} dBFS</strong> &nbsp;|&nbsp; `+
    `Dinâmica: <strong>${dynRange.toFixed(1)} dB</strong><br>`+
    `Graves: <strong>${(refStats.lowR*100).toFixed(0)}%</strong> &nbsp;·&nbsp; `+
    `Médios: <strong>${(refStats.midR*100).toFixed(0)}%</strong> &nbsp;·&nbsp; `+
    `Agudos: <strong>${(refStats.highR*100).toFixed(0)}%</strong>`;

  // Compare with source if loaded
  if(audioBuffer){
    const srcData=audioBuffer.getChannelData(0);
    const srcStep=Math.ceil(srcData.length/1000);
    let srcSq=0; const srcTotal=Math.floor(srcData.length/srcStep);
    for(let i=0;i<srcData.length;i+=srcStep){const v=srcData[i]||0;srcSq+=v*v;}
    const srcRms=Math.sqrt(srcSq/srcTotal);
    const srcLufs=srcRms>0?20*Math.log10(srcRms)-0.691:-70;
    const diff=lufs-srcLufs;
    document.getElementById('ref-compare').innerHTML=
      `<strong style="color:var(--c1)">💡 Diferença para a tua faixa:</strong><br>`+
      `A referência é <strong>${Math.abs(diff).toFixed(1)} LUFS ${diff>0?'mais alta':'mais baixa'}</strong>.<br>`+
      `${diff>0?'Aumenta':'Reduz'} o LOUD ~${Math.abs(diff).toFixed(0)} pontos para igualar.`;
    document.getElementById('ref-compare').style.display='block';
  }
  setStatus('Referência carregada: '+name.replace(/\.[^.]+$/,''));
}

function applyRefToPreset(){
  if(!refStats){setStatus('Carrega uma referência primeiro');return;}
  // Reset all EQ first
  if(audioCtx){
    eqSub.gain.value=0; eqBass.gain.value=0; eqLowNode.gain.value=0;
    eqMid.gain.value=0; eqHigh.gain.value=0; eqAir.gain.value=0;
  }
  // Match loudness
  const diffLUFS=refStats.lufs-(-9);
  kvals.LOUD=Math.round(Math.min(95,Math.max(20,50+diffLUFS*3)));
  // Match bass
  if(refStats.lowR>0.50){ kvals.BASS=Math.min(90,kvals.BASS+15); if(audioCtx)eqSub.gain.value+=3; }
  else if(refStats.lowR<0.20){ kvals.BASS=Math.max(20,kvals.BASS-15); if(audioCtx)eqSub.gain.value-=2; }
  // Match mids
  if(refStats.midR>0.15){ kvals.FOCUS=Math.min(85,kvals.FOCUS+10); if(audioCtx)eqMid.gain.value+=2; }
  // Match highs
  if(refStats.highR>0.10){ kvals.CLEAN=Math.min(85,kvals.CLEAN+10); if(audioCtx)eqAir.gain.value+=2; }
  // Match dynamics
  if(refStats.dynRange>18) kvals.PUNCH=Math.min(85,kvals.PUNCH+15);
  else if(refStats.dynRange<8) kvals.PUNCH=Math.max(20,kvals.PUNCH-10);

  refreshKnobs(); syncEQSliders(); applyDSP();
  setStatus('✓ Referência aplicada: '+refStats.name.replace(/\.[^.]+$/,'')+'  — ajusta os knobs por cima');
}

// ===== FILE LOAD =====
function handleDrop(e){
  e.preventDefault(); document.getElementById('drop-zone').classList.remove('drag-over');
  if(e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
}
document.getElementById('sf').addEventListener('change',function(){if(this.files[0])loadFile(this.files[0]);});

function loadFile(file){
  initAudio(); stopAudio(); setStatus('A carregar...');
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try{
      audioBuffer=await audioCtx.decodeAudioData(e.target.result.slice(0));
      document.getElementById('track-name').textContent=file.name.replace(/\.[^.]+$/,'');
      document.getElementById('track-dur').textContent=fmtTime(audioBuffer.duration);
      document.getElementById('time-total').textContent=fmtTime(audioBuffer.duration);
      document.getElementById('waveform-wrap').style.display='flex';
      document.getElementById('drop-zone').style.display='none';
      document.getElementById('export-btn').style.display='flex';
      drawWaveform(); applyDSP();
      setStatus('Pronto · BEFORE = original · AFTER = masterizado');
      if(refStats) analyseAndDisplayRef(refStats.name);
    }catch(err){setStatus('Erro: '+err.message);}
  };
  reader.readAsArrayBuffer(file);
}

function drawWaveform(){
  if(!audioBuffer) return;
  const canvas=document.getElementById('waveform-canvas');
  const wOw=canvas.offsetWidth||600;
  if(canvas.width!==wOw) canvas.width=wOw;
  canvas.height=64; const W=canvas.width;
  const ctx2=canvas.getContext('2d');
  const data=audioBuffer.getChannelData(0), step=Math.ceil(data.length/W);
  const cols=['#ff3ab5','#b855f7','#2dd4ff','#2dff8a'];
  ctx2.clearRect(0,0,W,64);
  for(let i=0;i<W;i++){
    let max=0; for(let j=0;j<step;j++){const v=Math.abs(data[i*step+j]||0);if(v>max)max=v;}
    const h=max*60, ci=Math.floor((i/W)*cols.length);
    const g=ctx2.createLinearGradient(0,32-h/2,0,32+h/2);
    g.addColorStop(0,cols[ci]+'cc'); g.addColorStop(1,cols[ci]+'33');
    ctx2.fillStyle=g; ctx2.fillRect(i,32-h/2,1,h);
  }
  document.getElementById('waveform-container').onclick=(e)=>{
    if(!audioBuffer)return;
    const rect=document.getElementById('waveform-container').getBoundingClientRect();
    seekTo(((e.clientX-rect.left)/rect.width)*audioBuffer.duration);
  };
}

// ===== PLAYBACK =====
function togglePlay(){if(!audioBuffer)return;isPlaying?pauseAudio():playAudio();}

function playAudio(){
  if(!audioCtx||!audioBuffer) return;
  if(audioCtx.state==='suspended') audioCtx.resume();
  stopSource();
  sourceNode=audioCtx.createBufferSource();
  sourceNode.buffer=audioBuffer;
  if(playMode==='after'){ applyDSP(); sourceNode.connect(eqSub); }
  else { sourceNode.connect(dryGain); }
  sourceNode.onended=()=>{if(isPlaying){isPlaying=false;pauseOffset=0;updatePlayBtn();stopProgress();}};
  const offset=Math.min(pauseOffset,audioBuffer.duration-0.01);
  sourceNode.start(0,offset);
  startTime=audioCtx.currentTime-offset;
  isPlaying=true; updatePlayBtn(); startProgress();
}

function pauseAudio(){
  pauseOffset=audioCtx.currentTime-startTime;
  stopSource();isPlaying=false;updatePlayBtn();stopProgress();
}
function stopAudio(){
  stopSource();isPlaying=false;pauseOffset=0;
  updatePlayBtn();stopProgress();setProgress(0);
  document.getElementById('time-cur').textContent='0:00';
  vuL=0.02;vuR=0.02;
}
function stopSource(){if(sourceNode){try{sourceNode.stop();}catch(e){}sourceNode=null;}}
function seekTo(t){
  const was=isPlaying,pos=was?audioCtx.currentTime-startTime:pauseOffset;
  stopSource();isPlaying=false;
  pauseOffset=Math.max(0,Math.min(t,audioBuffer.duration-0.01));
  if(was)playAudio();else setProgress(pauseOffset/audioBuffer.duration);
}
function seekRelative(d){if(!audioBuffer)return;seekTo((isPlaying?audioCtx.currentTime-startTime:pauseOffset)+d);}
function setVolume(v){
  if(masterGain) masterGain.gain.setTargetAtTime(v/100*1.5,audioCtx.currentTime,0.05);
  if(dryGain)    dryGain.gain.setTargetAtTime(v/100,audioCtx.currentTime,0.05);
  document.getElementById('vol-val').textContent=v+'%';
}
function updatePlayBtn(){document.getElementById('play-icon').className=isPlaying?'ti ti-player-pause':'ti ti-player-play';}
function startProgress(){
  stopProgress();
  animProgress=setInterval(()=>{
    if(!isPlaying||!audioBuffer)return;
    const cur=audioCtx.currentTime-startTime;
    setProgress(Math.min(cur/audioBuffer.duration,1));
    document.getElementById('time-cur').textContent=fmtTime(cur);
  },80);
}
function stopProgress(){clearInterval(animProgress);}
function setProgress(p){
  const pct=Math.min(p*100,100);
  document.getElementById('waveform-progress').style.width=pct+'%';
  document.getElementById('waveform-cursor').style.left=pct+'%';
}
function fmtTime(s){return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;}

// ===== BEFORE/AFTER — seamless switch =====
function setMode(mode){
  const was=isPlaying;
  const pos=was?(audioCtx.currentTime-startTime):pauseOffset;
  stopSource();isPlaying=false;
  pauseOffset=Math.max(0,Math.min(pos,audioBuffer?(audioBuffer.duration-0.01):0));
  playMode=mode;
  document.getElementById('btn-before').classList.toggle('active',mode==='before');
  document.getElementById('btn-after').classList.toggle('active', mode==='after');
  const dot=document.getElementById('mode-dot'),txt=document.getElementById('mode-txt');
  if(mode==='before'){dot.className='mode-dot before';txt.textContent='ORIGINAL — sem processamento';}
  else{dot.className='mode-dot after';txt.textContent='PROCESSADO — '+(PRESETS[curPreset]?.name||curPreset.toUpperCase())+' · '+(curPreset==='house'?'-8':'-9')+' LUFS';}
  updateLUFSDisplay();
  if(was&&audioBuffer) playAudio();
}

// ===== SPECTRUM — FabFilter style =====
function freqToX(freq,W,padL,padR){
  return padL+(Math.log10(freq)-Math.log10(20))/(Math.log10(20000)-Math.log10(20))*(W-padL-padR);
}
function dbToY(db,H,padT,padB){
  return padT+(1-(db-(-90))/(0-(-90)))*(H-padT-padB);
}

function drawSpectrum(){
  const canvas=document.getElementById('spec'); if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const ow=canvas.offsetWidth||300, oh=canvas.offsetHeight||160;
  if(canvas.width!==ow) canvas.width=ow;
  if(canvas.height!==oh) canvas.height=oh;
  const W=canvas.width, H=canvas.height;
  const padL=28,padR=6,padT=6,padB=18;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#08080c'; ctx.fillRect(0,0,W,H);

  // dB grid
  ctx.setLineDash([2,3]);
  DB_LABELS.forEach(db=>{
    const y=dbToY(db,H,padT,padB);
    ctx.strokeStyle=db===0?'#ffffff22':'#ffffff0d'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();
    ctx.fillStyle='#55556a'; ctx.font='7px Rajdhani,sans-serif'; ctx.textAlign='right';
    ctx.fillText(db===0?'0 dB':db,padL-3,y+3);
  });
  // Freq grid
  FREQ_LABELS.forEach(f=>{
    const x=freqToX(f,W,padL,padR);
    ctx.strokeStyle='#ffffff0d'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,padT);ctx.lineTo(x,H-padB);ctx.stroke();
    const label=f>=1000?(f/1000)+'k':f+'';
    ctx.fillStyle='#55556a'; ctx.font='7px Rajdhani,sans-serif'; ctx.textAlign='center';
    ctx.fillText(label,x,H-padB+10);
  });
  ctx.setLineDash([]);

  if(!isPlaying||!analyserNode){
    // Idle sine wave
    idlePhase+=0.018;
    ctx.beginPath();
    const plotW=W-padL-padR;
    for(let px=0;px<=plotW;px++){
      const t=px/plotW;
      const db=-62+10*Math.sin(t*9+idlePhase)+5*Math.sin(t*22-idlePhase*1.3)+3*Math.cos(t*4+idlePhase*0.7);
      const y=dbToY(db,H,padT,padB);
      px===0?ctx.moveTo(padL+px,y):ctx.lineTo(padL+px,y);
    }
    const ig=ctx.createLinearGradient(padL,0,W-padR,0);
    ig.addColorStop(0,'#ff3ab540');ig.addColorStop(0.4,'#b855f740');ig.addColorStop(0.7,'#2dd4ff40');ig.addColorStop(1,'#2dff8a40');
    ctx.strokeStyle=ig; ctx.lineWidth=1.5; ctx.stroke();
    return;
  }

  // Live FFT
  const binCount=analyserNode.frequencyBinCount;
  const freqData=new Float32Array(binCount);
  analyserNode.getFloatFrequencyData(freqData);
  const sr=audioCtx.sampleRate;
  const plotW=W-padL-padR;

  // Build per-pixel dB
  const dbVals=new Float32Array(plotW);
  for(let px=0;px<plotW;px++){
    const t=px/plotW;
    const freq=Math.pow(10,Math.log10(20)+(Math.log10(20000)-Math.log10(20))*t);
    const bin=Math.min(binCount-1,Math.round(freq/(sr/2)*binCount));
    let sum=0,cnt=0;
    for(let b=Math.max(0,bin-2);b<=Math.min(binCount-1,bin+2);b++){sum+=freqData[b];cnt++;}
    const raw=cnt>0?sum/cnt:-150;
    // Fast attack, slow release smoothing
    specSmooth[px]=raw>specSmooth[px]?specSmooth[px]*0.5+raw*0.5:specSmooth[px]*0.88+raw*0.12;
    dbVals[px]=specSmooth[px];
    // Peak hold
    if(specSmooth[px]>specPeaks[px]) specPeaks[px]=specSmooth[px];
    else specPeaks[px]=Math.max(-150,specPeaks[px]-0.6);
  }

  // Filled area
  ctx.beginPath();
  ctx.moveTo(padL,dbToY(-90,H,padT,padB));
  for(let px=0;px<plotW;px++){
    ctx.lineTo(padL+px,dbToY(Math.max(-90,Math.min(0,dbVals[px])),H,padT,padB));
  }
  ctx.lineTo(W-padR,dbToY(-90,H,padT,padB));
  ctx.closePath();
  const fg=ctx.createLinearGradient(padL,0,W-padR,0);
  fg.addColorStop(0,'#ff3ab522');fg.addColorStop(0.25,'#ff6b3518');
  fg.addColorStop(0.5,'#b855f718');fg.addColorStop(0.75,'#2dd4ff18');fg.addColorStop(1,'#2dff8a18');
  ctx.fillStyle=fg; ctx.fill();

  // Main line
  ctx.beginPath();
  for(let px=0;px<plotW;px++){
    const y=dbToY(Math.max(-90,Math.min(0,dbVals[px])),H,padT,padB);
    px===0?ctx.moveTo(padL+px,y):ctx.lineTo(padL+px,y);
  }
  const lg=ctx.createLinearGradient(padL,0,W-padR,0);
  lg.addColorStop(0,'#ff3ab5dd');lg.addColorStop(0.25,'#ff6b35dd');
  lg.addColorStop(0.5,'#b855f7dd');lg.addColorStop(0.75,'#2dd4ffdd');lg.addColorStop(1,'#2dff8add');
  ctx.strokeStyle=lg; ctx.lineWidth=1.8; ctx.lineJoin='round'; ctx.stroke();

  // Peak line
  ctx.beginPath();
  for(let px=0;px<plotW;px++){
    const y=dbToY(Math.max(-90,Math.min(0,specPeaks[px])),H,padT,padB);
    px===0?ctx.moveTo(padL+px,y):ctx.lineTo(padL+px,y);
  }
  const pg=ctx.createLinearGradient(padL,0,W-padR,0);
  pg.addColorStop(0,'#ff3ab555');pg.addColorStop(0.5,'#ffe13555');pg.addColorStop(1,'#2dff8a55');
  ctx.strokeStyle=pg; ctx.lineWidth=0.8; ctx.setLineDash([2,2]); ctx.stroke(); ctx.setLineDash([]);

  // Hover tooltip
  if(specHoverX>padL&&specHoverX<W-padR){
    const px=Math.round(specHoverX-padL);
    const t=px/plotW;
    const hfreq=Math.pow(10,Math.log10(20)+(Math.log10(20000)-Math.log10(20))*t);
    const hdb=dbVals[Math.min(px,plotW-1)]||0;
    const hy=dbToY(Math.max(-90,hdb),H,padT,padB);
    ctx.strokeStyle='#ffffff22';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(specHoverX,padT);ctx.lineTo(specHoverX,H-padB);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(specHoverX,hy,3,0,Math.PI*2);ctx.fill();
    const fLabel=hfreq>=1000?(hfreq/1000).toFixed(1)+'kHz':Math.round(hfreq)+'Hz';
    const lx=specHoverX>W-80?specHoverX-55:specHoverX+5;
    ctx.fillStyle='rgba(14,14,20,0.85)';ctx.fillRect(lx-2,hy-22,58,16);
    ctx.fillStyle='#e8e8f0';ctx.font='bold 9px Rajdhani,sans-serif';ctx.textAlign='left';
    ctx.fillText(fLabel+' '+hdb.toFixed(1)+'dB',lx+1,hy-10);
  }
}

// ===== VU METERS =====
function startAnimLoop(){if(animRunning)return;animRunning=true;(function loop(){requestAnimationFrame(loop);drawSpectrum();updateMeters();})();}

function updateMeters(){
  const now=Date.now();
  if(!analyserNode||!isPlaying){
    vuL=Math.max(0.02,vuL*0.90);vuR=Math.max(0.02,vuR*0.90);
    setVU(vuL,vuR);
    if(!isPlaying)updateLUFSDisplay();
    return;
  }
  const td=new Float32Array(analyserNode.fftSize);
  analyserNode.getFloatTimeDomainData(td);
  let sL=0,sR=0,pkL=0,pkR=0;
  const half=Math.floor(td.length/2);
  for(let i=0;i<half;i++){sL+=td[i]*td[i];pkL=Math.max(pkL,Math.abs(td[i]));}
  for(let i=half;i<td.length;i++){sR+=td[i]*td[i];pkR=Math.max(pkR,Math.abs(td[i]));}
  const rmsL=Math.sqrt(sL/half),rmsR=Math.sqrt(sR/half);
  vuL=rmsL*3>vuL?vuL*0.4+rmsL*3*0.6:vuL*0.88;
  vuR=rmsR*3>vuR?vuR*0.4+rmsR*3*0.6:vuR*0.88;
  if(piradexOn){vuL=Math.min(1,vuL*1.6);vuR=Math.min(1,vuR*1.6);}
  if(pkL>peakHoldL){peakHoldL=pkL;peakHoldTimerL=now;}
  if(pkR>peakHoldR){peakHoldR=pkR;peakHoldTimerR=now;}
  if(now-peakHoldTimerL>1500) peakHoldL=Math.max(0,peakHoldL-0.015);
  if(now-peakHoldTimerR>1500) peakHoldR=Math.max(0,peakHoldR-0.015);
  setVU(Math.min(vuL,1),Math.min(vuR,1));
  const rms=(rmsL+rmsR)/2;
  const raw=rms>0?20*Math.log10(rms)-0.691:-70;
  lufsSmooth=lufsSmooth*0.78+raw*0.22;
  const isHouse=curPreset==='house';
  const lo=isHouse?-11:-12,hi=isHouse?-6:-7;
  const display=playMode==='after'?Math.max(lo,Math.min(hi,lufsSmooth)).toFixed(1):lufsSmooth.toFixed(1);
  const lufsEl=document.getElementById('lufs-n'),slufEl=document.getElementById('slufs');
  if(lufsEl&&lufsEl.textContent!==display)lufsEl.textContent=display;
  const st=display+' LUFS'; if(slufEl&&slufEl.textContent!==st)slufEl.textContent=st;
  const lfl=document.getElementById('lim-fill-l'),lfr=document.getElementById('lim-fill-r');
  if(lfl)lfl.style.transform='scaleY('+Math.min(1,vuL*1.1)+')';
  if(lfr)lfr.style.transform='scaleY('+Math.min(1,vuR*1.1)+')';
}

function setVU(l,r){
  const vL=document.getElementById('vu-l'),vR=document.getElementById('vu-r');
  if(vL)vL.style.transform='scaleY('+Math.max(0.02,Math.min(1,l))+')';
  if(vR)vR.style.transform='scaleY('+Math.max(0.02,Math.min(1,r))+')';
  const plL=document.getElementById('vu-peak-l'),plR=document.getElementById('vu-peak-r');
  if(plL)plL.style.bottom=(peakHoldL*96)+'%';
  if(plR)plR.style.bottom=(peakHoldR*96)+'%';
}

function updateLUFSDisplay(){
  const isHouse=curPreset==='house';
  const v=playMode==='after'?(isHouse?'-8.0':'-9.0'):(-23+kvals.LOUD*0.17).toFixed(1);
  if(!isPlaying){
    const el=document.getElementById('lufs-n'); if(el)el.textContent=v;
    const sl=document.getElementById('slufs'); if(sl)sl.textContent=v+' LUFS';
  }
}

// ===== PRESETS =====
function setPreset(key,el){
  curPreset=key; const p=PRESETS[key];
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('pi-name').textContent=p.name;
  document.getElementById('pi-desc').textContent=p.refs+' — '+p.desc;
  Object.assign(kvals,p.knobs);
  if(audioCtx){
    eqSub.gain.value=p.eq.sub; eqBass.gain.value=p.eq.bass; eqLowNode.gain.value=p.eq.low;
    eqMid.gain.value=p.eq.mid; eqHigh.gain.value=p.eq.high; eqAir.gain.value=p.eq.air;
  }
  refreshKnobs(); updateSugs(p.sugs); applyDSP(); syncEQSliders();
  const lufsTarget=key==='house'?'-8':'-9';
  setStatus('Preset '+p.name+' aplicado · Alvo '+lufsTarget+' LUFS');
}

function updateSugs(sugs){
  sugs.forEach((s,i)=>{
    const t=document.getElementById(`s${i+1}t`),v=document.getElementById(`s${i+1}v`);
    if(t)t.textContent=s[0];if(v){v.textContent=s[1];v.className=`sval ${s[2]}`;}
  });
}

// ===== PIRADEX =====
// Save state before Piradex activates
let savedKvals=null, savedEQ=null;

async function togglePiradex(){
  piradexOn=!piradexOn;
  const btn=document.getElementById('pira-btn');
  if(piradexOn){
    // Save current state
    savedKvals={...kvals};
    if(audioCtx) savedEQ={sub:eqSub.gain.value,bass:eqBass.gain.value,low:eqLowNode.gain.value,mid:eqMid.gain.value,high:eqHigh.gain.value,air:eqAir.gain.value};
    // Apply PIRADEX fixed values — REPLACE, do not add
    kvals.CLEAN=30;kvals.BASS=12;kvals.LOUD=25;kvals.WIDE=22;kvals.PUNCH=35;kvals.FOCUS=40;
    // Reset EQ to neutral first, then apply preset EQ
    if(audioCtx){
      eqSub.gain.value=0;eqBass.gain.value=0;eqLowNode.gain.value=0;
      eqMid.gain.value=0;eqHigh.gain.value=0;eqAir.gain.value=0;
    }
    btn.classList.add('on');btn.textContent='⚡ PIRADEX MODE ATIVO ⚡';
    applyPiradexDSP();
    document.getElementById('piradex-modal').style.display='flex';
    runPiradexAI();
  } else {
    btn.classList.remove('on');btn.textContent='⚡ MASTERING PIRADEX ⚡';
    closePiradexModal();
    // Restore saved state
    if(savedKvals){ Object.assign(kvals,savedKvals); }
    if(savedEQ&&audioCtx){
      eqSub.gain.value=savedEQ.sub;eqBass.gain.value=savedEQ.bass;eqLowNode.gain.value=savedEQ.low;
      eqMid.gain.value=savedEQ.mid;eqHigh.gain.value=savedEQ.high;eqAir.gain.value=savedEQ.air;
    }
    refreshKnobs();syncEQSliders();applyDSP();
    setStatus('Piradex desactivado — preset restaurado');
  }
}

function applyPiradexDSP(){
  if(!audioCtx) return;
  // PIRADEX: fixed, isolated DSP — does NOT accumulate with other settings
  // EQ: slight sub boost, keep mids clean
  eqSub.gain.value    = 2.0;   // subtle sub
  eqBass.gain.value   = 1.5;   // warm bass
  eqLowNode.gain.value= -0.5;  // clean low mids
  eqMid.gain.value    = 1.0;   // mid presence
  eqHigh.gain.value   = 0.5;   // slight high clarity
  eqAir.gain.value    = 1.0;   // air
  // Compressor: moderate, not extreme
  compNode.threshold.value=-24; compNode.ratio.value=4;
  compNode.attack.value=0.015;  compNode.release.value=0.20; compNode.knee.value=8;
  // Limiter
  limiterNode.threshold.value=-1;
  // Gain: target -9 LUFS
  masterGain.gain.setTargetAtTime(1.2, audioCtx.currentTime, 0.1);
  // Shape: tape, subtle
  if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(0.8, audioCtx.currentTime, 0.05);
  if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.2, audioCtx.currentTime, 0.05);
  if(shapeWS){ shapeWS.curve=makeShapeCurve('tape',0.15); }
  syncEQSliders();
  updateLUFSDisplay();
}
function closePiradexModal(){document.getElementById('piradex-modal').style.display='none';}

async function runPiradexAI(){
  const msg=document.getElementById('piradex-ai-msg');
  msg.innerHTML='<span class="ai-loading">🤖 PIRADEX analisando o áudio...</span>';
  if(!audioBuffer){msg.innerHTML='<span style="color:var(--muted2)">Carrega uma música primeiro.</span>';return;}
  const data=audioBuffer.getChannelData(0);
  const step=Math.ceil(data.length/600);
  let sumSq=0,peak=0,lowE=0,midE=0,highE=0;
  const totalS=Math.floor(data.length/step);
  for(let i=0;i<data.length;i+=step){
    const v=Math.abs(data[i]||0);sumSq+=v*v;if(v>peak)peak=v;
    const seg=Math.floor(i/(data.length/10));
    if(seg<3)lowE+=v;else if(seg<7)midE+=v;else highE+=v;
  }
  const rms=Math.sqrt(sumSq/totalS);
  const lufsEst=rms>0?20*Math.log10(rms)-0.691:-70;
  const peakdB=peak>0?20*Math.log10(peak):-70;
  const dynRange=(peak>0&&rms>0)?20*Math.log10(peak/rms):20;
  const tot=lowE+midE+highE||1;
  const lowR=lowE/tot,midR=midE/tot,highR=highE/tot;
  const isHouse=curPreset==='house';
  const lufsTarget=isHouse?-8:-9;
  let warnings='';
  if(peakdB>-0.5)  warnings+='⚠️ <strong>Clipping detectado</strong><br>';
  if(lufsEst>-8)   warnings+='⚠️ <strong>Áudio muito alto</strong> — '+lufsEst.toFixed(1)+' LUFS<br>';
  if(lufsEst<-25)  warnings+='⚠️ <strong>Áudio muito baixo</strong> — '+lufsEst.toFixed(1)+' LUFS<br>';
  if(dynRange<6)   warnings+='⚠️ <strong>Muito comprimido</strong> — '+dynRange.toFixed(1)+' dB<br>';
  await new Promise(r=>setTimeout(r,700));
  applyDSP();
  msg.innerHTML=`
<strong>📊 Análise — PIRADEX MODE:</strong><br>
· LUFS: ${lufsEst.toFixed(1)} | Pico: ${peakdB.toFixed(1)} dBFS | Dinâmica: ${dynRange.toFixed(1)} dB<br>
· Graves ${(lowR*100).toFixed(0)}% · Médios ${(midR*100).toFixed(0)}% · Agudos ${(highR*100).toFixed(0)}%<br>
${warnings?'<br>'+warnings:''}
<br><strong>🎛️ Configuração Piradex:</strong><br>
CLEAN 30 · BASS 12 · LOUD 25 · WIDE 22 · PUNCH 35 · FOCUS 40<br>
<div class="ai-applied">✓ Aplicado · Alvo ${lufsTarget} LUFS · Activa AFTER para ouvir</div>`;
}

// ===== EXPORT =====
async function _originalExport(){
  if(!audioBuffer){setStatus('Carrega um ficheiro primeiro');return;}
  const btn=document.getElementById('export-btn');
  btn.style.opacity='0.5';btn.style.pointerEvents='none';setStatus('A renderizar...');
  try{
    const nCh=audioBuffer.numberOfChannels,sr=audioBuffer.sampleRate,len=audioBuffer.length;
    const offCtx=new OfflineAudioContext(nCh,len,sr);
    const mk2=(t,f,g,Q)=>{const n=offCtx.createBiquadFilter();n.type=t;n.frequency.value=f;n.gain.value=g||0;if(Q)n.Q.value=Q;return n;};
    const oSub=mk2('lowshelf',60,eqSub.gain.value);
    const oBass=mk2('peaking',150,eqBass.gain.value,0.8);
    const oLow=mk2('peaking',500,eqLowNode.gain.value,1.0);
    const oMid=mk2('peaking',1200,eqMid.gain.value,0.9);
    const oHigh=mk2('peaking',4000,eqHigh.gain.value,1.0);
    const oAir=mk2('highshelf',12000,eqAir.gain.value);
    const oComp=offCtx.createDynamicsCompressor();
    oComp.threshold.value=compNode.threshold.value;oComp.ratio.value=compNode.ratio.value;
    oComp.attack.value=compNode.attack.value;oComp.release.value=compNode.release.value;oComp.knee.value=6;
    const oLim=offCtx.createDynamicsCompressor();
    oLim.threshold.value=-1;oLim.ratio.value=20;oLim.attack.value=0.001;oLim.release.value=0.05;oLim.knee.value=0;
    // Shape parallel in export
    const oShape=offCtx.createWaveShaper();
    const drive=parseFloat(document.getElementById('shape-drive').value)/100;
    const mix=parseFloat(document.getElementById('shape-mix').value)/100;
    oShape.curve=makeShapeCurve(shapeMode,drive);oShape.oversample='4x';
    const oSDry=offCtx.createGain();oSDry.gain.value=1-mix;
    const oSWet=offCtx.createGain();oSWet.gain.value=mix;
    const oSMix=offCtx.createGain();oSMix.gain.value=1;
    const oGain=offCtx.createGain();oGain.gain.value=masterGain.gain.value;
    oSub.connect(oBass);oBass.connect(oLow);oLow.connect(oMid);oMid.connect(oHigh);oHigh.connect(oAir);
    oAir.connect(oSDry);oSDry.connect(oSMix);
    oAir.connect(oShape);oShape.connect(oSWet);oSWet.connect(oSMix);
    oSMix.connect(oComp);oComp.connect(oLim);oLim.connect(oGain);oGain.connect(offCtx.destination);
    const src=offCtx.createBufferSource();src.buffer=audioBuffer;src.connect(oSub);src.start(0);
    const rendered=await offCtx.startRendering();
    const isHouse=curPreset==='house';
    const normalized=normalizeLUFS(rendered,isHouse?0.224:0.178);
    const wav=encodeWAV(normalized);
    const blob=new Blob([wav],{type:'audio/wav'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;
    a.download=(document.getElementById('track-name').textContent||'audio')+'_PIRADEX_MASTERED.wav';
    a.click();URL.revokeObjectURL(url);
    setStatus('✓ Exportado: '+a.download);
  }catch(err){setStatus('Erro: '+err.message);}
  btn.style.opacity='1';btn.style.pointerEvents='auto';
}

function normalizeLUFS(buffer,targetRMS){
  const nCh=buffer.numberOfChannels,len=buffer.length;
  let sq=0,cnt=0;
  for(let c=0;c<nCh;c++){const d=buffer.getChannelData(c);for(let i=0;i<len;i++){sq+=d[i]*d[i];cnt++;}}
  const rms=Math.sqrt(sq/cnt),g=rms>0?Math.min(targetRMS/rms,6):1;
  const nb=new AudioBuffer({numberOfChannels:nCh,length:len,sampleRate:buffer.sampleRate});
  for(let c=0;c<nCh;c++){const s=buffer.getChannelData(c),d=nb.getChannelData(c);for(let i=0;i<len;i++)d[i]=Math.max(-0.99,Math.min(0.99,s[i]*g));}
  return nb;
}
function encodeWAV(buf){
  const nCh=buf.numberOfChannels,sr=buf.sampleRate,len=buf.length;
  const ab=new ArrayBuffer(44+len*nCh*2),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nCh,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*nCh*2,true);v.setUint16(32,nCh*2,true);v.setUint16(34,16,true);
  ws(36,'data');v.setUint32(40,len*nCh*2,true);
  let off=44;
  for(let i=0;i<len;i++)for(let c=0;c<nCh;c++){v.setInt16(off,Math.max(-32768,Math.min(32767,buf.getChannelData(c)[i]*32767)),true);off+=2;}
  return ab;
}


// ===== I/O GAIN CONTROLS =====
let ioDragType='', ioDragSY=0, ioDragSV=0;
let inputGainDb=0, outputGainDb=0;
let inputGainNode=null, outputGainNode=null;

function startIODrag(e, type){
  e.preventDefault();
  initAudio();
  if(!inputGainNode){
    inputGainNode  = audioCtx.createGain(); inputGainNode.gain.value=1.0;
    outputGainNode = audioCtx.createGain(); outputGainNode.gain.value=1.0;
    // Insert input gain before eqSub, output gain before analyser
    // For now control via masterGain and dryGain adjustments
  }
  ioDragType = type;
  ioDragSY   = e.touches ? e.touches[0].clientY : e.clientY;
  ioDragSV   = type==='input' ? inputGainDb : outputGainDb;
  document.addEventListener('mousemove', onIODrag);
  document.addEventListener('touchmove', onIODrag, {passive:true});
  document.addEventListener('mouseup',   stopIODrag);
  document.addEventListener('touchend',  stopIODrag);
}

function onIODrag(e){
  if(!ioDragType) return;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = (ioDragSY - cy) * 0.15; // dB per pixel
  if(ioDragType==='input'){
    inputGainDb = Math.max(-24, Math.min(12, ioDragSV + delta));
    applyIOGain();
    updateIODisplay();
  } else {
    outputGainDb = Math.max(-24, Math.min(12, ioDragSV + delta));
    applyIOGain();
    updateIODisplay();
  }
}

function stopIODrag(){
  ioDragType='';
  document.removeEventListener('mousemove', onIODrag);
  document.removeEventListener('mouseup',   stopIODrag);
}

function applyIOGain(){
  if(!audioCtx) return;
  const inFactor  = Math.pow(10, inputGainDb/20);
  const outFactor = Math.pow(10, outputGainDb/20);
  // Input gain: applied to dryGain when BEFORE, to eqSub input when AFTER
  if(dryGain)    dryGain.gain.setTargetAtTime(0.85*inFactor, audioCtx.currentTime, 0.05);
  // Output gain: applied to masterGain on top of current
  if(masterGain) masterGain.gain.setTargetAtTime(masterGain.gain.value*outFactor, audioCtx.currentTime, 0.05);
}

function updateIODisplay(){
  // Update IN arc and value
  const inEl = document.getElementById('in-val');
  const inArc= document.getElementById('in-arc');
  if(inEl) inEl.textContent = (inputGainDb>=0?'+':'')+inputGainDb.toFixed(1);
  if(inArc){
    const pct=Math.min(1,Math.max(0,(inputGainDb+24)/36));
    const dash=pct*120;
    inArc.setAttribute('stroke-dasharray', dash+' 120');
    inArc.setAttribute('stroke', inputGainDb>0?'var(--c3)':inputGainDb<0?'var(--c7)':'var(--c6)');
  }
  // Update OUT arc and value
  const outEl = document.getElementById('out-val');
  const outArc= document.getElementById('out-arc');
  if(outEl) outEl.textContent = (outputGainDb>=0?'+':'')+outputGainDb.toFixed(1);
  if(outArc){
    const pct=Math.min(1,Math.max(0,(outputGainDb+24)/36));
    const dash=pct*120;
    outArc.setAttribute('stroke-dasharray', dash+' 120');
    outArc.setAttribute('stroke', outputGainDb>0?'var(--c4)':outputGainDb<0?'var(--c7)':'var(--c1)');
  }
  setStatus('Input: '+(inputGainDb>=0?'+':'')+inputGainDb.toFixed(1)+'dB  ·  Output: '+(outputGainDb>=0?'+':'')+outputGainDb.toFixed(1)+'dB');
}

// ===== PAYWALL / DEMO FUNCTIONS =====
function openLicenseFromPaywall(){
  // Close paywall, open license modal
  document.getElementById('paywall-modal').style.display='none';
  document.getElementById('license-modal').style.display='flex';
}

function continueAsDemo(){
  document.getElementById('paywall-modal').style.display='none';
  isFullVersion=false;
  updateLicenseBadge();
  setStatus('Modo DEMO — preview disponível · exportação limitada a 1 faixa');
}

// ===== KNOBS =====
function toRad(d){return d*Math.PI/180;}
function descArc(cx,cy,r,s,e){
  const sr=toRad(s),er=toRad(e);
  return `M${cx+r*Math.cos(sr)},${cy+r*Math.sin(sr)} A${r},${r},0,${e-s>180?1:0},1,${cx+r*Math.cos(er)},${cy+r*Math.sin(er)}`;
}
function buildKnobs(){
  const row=document.getElementById('knobs-row');row.innerHTML='';
  KNOBS_DEF.forEach((name,i)=>{
    const div=document.createElement('div');div.className='ki';
    div.innerHTML=`<svg class="ks" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="20" fill="#141418" stroke="#ffffff0e" stroke-width="2.5"/>
      <path id="ka-${i}" fill="none" stroke="${KNOB_COLORS[name]}" stroke-width="4" stroke-linecap="round"/>
      <text x="26" y="31" text-anchor="middle" font-family="Orbitron" font-size="12" font-weight="700" fill="${KNOB_COLORS[name]}" id="kt-${i}">${Math.round(kvals[name])}</text>
    </svg><div class="kname">${name}</div>`;
    div.addEventListener('mousedown',e=>startDrag(e,name));
    div.addEventListener('touchstart',e=>startDrag(e,name),{passive:true});
    row.appendChild(div);drawKnob(i,name);
  });
  // Peak hold lines in VU
  document.querySelectorAll('.vu-track').forEach((track,i)=>{
    if(!track.querySelector('.vu-peak-l')&&!track.querySelector('.vu-peak-r')){
      const pk=document.createElement('div');
      pk.className=i===0?'vu-peak-l':'vu-peak-r';
      pk.style.cssText='position:absolute;width:100%;height:2px;bottom:5%;';
      pk.style.background=i===0?'#ff3ab5':'#2dd4ff';
      pk.style.boxShadow=i===0?'0 0 4px #ff3ab5':'0 0 4px #2dd4ff';
      track.appendChild(pk);
    }
  });
}
function drawKnob(i,name){
  const arc=document.getElementById(`ka-${i}`),txt=document.getElementById(`kt-${i}`);
  if(arc)arc.setAttribute('d',descArc(26,26,20,135,135+(kvals[name]/100)*270));
  if(txt)txt.textContent=Math.round(kvals[name]);
}
function refreshKnobs(){KNOBS_DEF.forEach((n,i)=>drawKnob(i,n));}

let dragName='',dragSY=0,dragSV=0;
function startDrag(e,name){
  dragName=name;dragSY=e.touches?e.touches[0].clientY:e.clientY;dragSV=kvals[name];
  document.addEventListener('mousemove',onDrag);
  document.addEventListener('touchmove',onDrag,{passive:true});
  document.addEventListener('mouseup',stopDrag);
  document.addEventListener('touchend',stopDrag);
}
function onDrag(e){
  if(!dragName)return;
  kvals[dragName]=Math.max(0,Math.min(100,dragSV+(dragSY-(e.touches?e.touches[0].clientY:e.clientY))*0.9));
  drawKnob(KNOBS_DEF.indexOf(dragName),dragName);
  if(playMode==='after'&&audioCtx)applyDSP();
}
function stopDrag(){dragName='';document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',stopDrag);}
function toggleBypass(){bypassOn=!bypassOn;document.getElementById('bypass-btn').classList.toggle('on',bypassOn);applyDSP();setStatus(bypassOn?'Bypass ativo':'Bypass desligado');}
function setStatus(msg){document.getElementById('stxt').textContent=msg.toUpperCase();}

// ===== LOGIN =====
const USERS={'admin':'piradex2024','beatfreak':'studio2024','demo':'demo123','producer1':'beats2024','producer2':'music2024'};
let isLoggedIn=false,exportCount=0;
const FREE_EXPORTS=1,PAY_URL='https://www.beatfreakstudio.com/subscribe';
function checkAutoLogin(){
  if(sessionStorage.getItem('piradex_session')==='authenticated'){isLoggedIn=true;document.getElementById('login-screen').style.display='none';}
  exportCount=parseInt(sessionStorage.getItem('piradex_exports')||'0');
  checkLicense();
}
function doLogin(){
  const user=document.getElementById('login-user').value.trim().toLowerCase();
  const pass=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');
  if(!user||!pass){err.textContent='Preenche todos os campos.';return;}
  if(USERS[user]&&USERS[user]===pass){
    isLoggedIn=true;sessionStorage.setItem('piradex_session','authenticated');
    document.getElementById('login-screen').style.display='none';err.textContent='';
  } else {
    err.textContent='❌ Credenciais inválidas.';
    document.getElementById('login-pass').value='';
    const box=document.querySelector('.login-box');
    if(box){box.style.animation='shake 0.4s ease';setTimeout(()=>box.style.animation='',400);}
  }
}

// ===== LICENSES =====
const LICENSES=['PRDX-XAJI-0Y6D-PBHS','PRDX-AHXT-HV3A-3ZMF','PRDX-8MDD-4V30-T9NT',
  'PRDX-3W5U-ZBIK-CIDK','PRDX-WNNH-J7XV-G0FN','PRDX-9XUY-41IB-LJH7',
  'PRDX-5LXO-6QJI-UJV6','PRDX-OH9S-DBDW-2PCN','PRDX-9T84-AZYT-JXEP',
  'PRDX-Q85J-SG65-KXVF','PRDX-1T2T-ALA7-53LC','PRDX-58DR-C11E-RTJ5',
  'PRDX-PHT0-HL9X-PSEI','PRDX-MVIH-CWI6-4CIY','PRDX-HE7U-R23G-DPPQ',
  'PRDX-0Y9D-OM5I-GQPK','PRDX-I7P5-TB94-874F','PRDX-RHOC-N9J2-QP89',
  'PRDX-UZFK-8UT0-CVS4','PRDX-F8CG-VYIE-6IVW'];
let isFullVersion=false;
function checkLicense(){
  const saved=sessionStorage.getItem('piradex_license');
  if(saved&&LICENSES.includes(saved)){isFullVersion=true;updateLicenseBadge();}
}
function activateLicense(){
  const input=document.getElementById('license-input'),err=document.getElementById('license-error');
  const key=input.value.trim().toUpperCase();
  if(!key){err.textContent='Introduz a tua licença.';return;}
  if(LICENSES.includes(key)){
    isFullVersion=true;exportCount=0;sessionStorage.setItem('piradex_license',key);
    document.getElementById('license-modal').style.display='none';
    document.getElementById('paywall-modal').style.display='none';
    updateLicenseBadge();setStatus('✓ Licença activada — versão FULL desbloqueada');
  } else {
    err.textContent='❌ Licença inválida.';input.value='';
    const box=document.querySelector('.license-box');
    if(box){box.style.animation='shake 0.4s ease';setTimeout(()=>box.style.animation='',400);}
  }
}
function updateLicenseBadge(){
  const b=document.getElementById('license-badge');
  if(b){b.textContent=isFullVersion?'✓ FULL':'DEMO';b.style.color=isFullVersion?'var(--c4)':'var(--muted)';b.style.borderColor=isFullVersion?'var(--c4)':'var(--border2)';}
}
function openLicenseModal(){document.getElementById('license-modal').style.display='flex';}
function closeLicenseModal(){document.getElementById('license-modal').style.display='none';}
function formatLicenseInput(el){
  let v=el.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  if(v.length>4)v=v.slice(0,4)+'-'+v.slice(4);
  if(v.length>9)v=v.slice(0,9)+'-'+v.slice(9);
  if(v.length>14)v=v.slice(0,14)+'-'+v.slice(14);
  if(v.length>19)v=v.slice(0,19);
  el.value=v;if(v.length===19)activateLicense();
}
function selectPlan(el){document.querySelectorAll('.plan').forEach(p=>p.classList.remove('selected'));el.classList.add('selected');}
function showPaywall(){document.getElementById('paywall-modal').style.display='flex';}
function skipPaywall(){document.getElementById('paywall-modal').style.display='none';}
function goPay(){const s=document.querySelector('.plan.selected .plan-name');window.open(PAY_URL+'?plan='+(s?s.textContent:'pro').toLowerCase(),'_blank');}

async function exportMastered(){
  if(!isLoggedIn){document.getElementById('login-screen').style.display='flex';return;}
  if(isFullVersion){await _originalExport();return;}
  if(exportCount<FREE_EXPORTS){await _originalExport();exportCount++;sessionStorage.setItem('piradex_exports',exportCount);setTimeout(()=>showPaywall(),1500);}
  else{showPaywall();}
}

// ===== INIT =====
buildKnobs();
updateLUFSDisplay();
['lufs-n','slufs','vu-l','vu-r'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.willChange='transform,contents';});

// Spectrum hover
setTimeout(()=>{
  const canvas=document.getElementById('spec');
  if(!canvas)return;
  canvas.addEventListener('mousemove',e=>{const rect=canvas.getBoundingClientRect();specHoverX=e.clientX-rect.left;});
  canvas.addEventListener('mouseleave',()=>{specHoverX=-1;});
},500);

// Draw idle spectrum immediately
(function idleLoop(){
  requestAnimationFrame(idleLoop);
  if(animRunning)return;
  drawSpectrum();
})();

checkAutoLogin();
document.addEventListener('DOMContentLoaded',()=>{
  ['login-user','login-pass'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  });
});
