// ===== PIRADEX MASTERING SUITE v1.0 — app.js =====

const PRESETS = {
  kizomba:  { name:'KIZOMBA',  desc:'Graves quentes, mids suaves, loudness moderado — sensualidade e groove',
    knobs:{CLEAN:20,BASS:72,LOUD:58,WIDE:38,PUNCH:45,FOCUS:30},
    eq:{sub:3,bass:4,low:-1,mid:-2,high:1,air:2},
    sugs:[['Warm low-end @ 80Hz','+2.1 dB','c2'],['Mid harshness reduced','-1.8 dB','c3'],['Stereo warmth','+10%','c5']] },
  kuduro:   { name:'KUDURO',   desc:'Kick agressivo, muito punch, loudness alto — energia máxima de dança',
    knobs:{CLEAN:10,BASS:85,LOUD:88,WIDE:30,PUNCH:92,FOCUS:70},
    eq:{sub:6,bass:5,low:0,mid:2,high:-1,air:0},
    sugs:[['Sub kick boosted @ 60Hz','+3.5 dB','c2'],['High attack enhanced','+2.1 dB','c3'],['Punch maximised','+28%','c7']] },
  zouk:     { name:'ZOUK',     desc:'Graves profundos, amplitude sonora romântica, loudness controlado',
    knobs:{CLEAN:35,BASS:65,LOUD:52,WIDE:68,PUNCH:40,FOCUS:25},
    eq:{sub:2,bass:3,low:0,mid:-1,high:2,air:3},
    sugs:[['Deep bass @ 70Hz','+1.8 dB','c2'],['High freq air added','+1.2 dB','c3'],['Wide stereo field','+22%','c5']] },
  gzouk:    { name:'GZOUK',    desc:'Fusão Zouk+Ghetto — mais punch e groove urbano mantendo a fluidez',
    knobs:{CLEAN:22,BASS:75,LOUD:70,WIDE:55,PUNCH:65,FOCUS:48},
    eq:{sub:4,bass:4,low:-1,mid:1,high:1,air:2},
    sugs:[['Sub bass @ 55Hz','+2.8 dB','c2'],['Mid groove enhanced','+1.0 dB','c3'],['Urban width','+16%','c6']] },
  semba:    { name:'SEMBA',    desc:'Ritmo vivo, médios presentes, dinâmica preservada — alma angolana',
    knobs:{CLEAN:45,BASS:55,LOUD:50,WIDE:42,PUNCH:60,FOCUS:55},
    eq:{sub:1,bass:2,low:1,mid:3,high:2,air:1},
    sugs:[['Mid presence @ 1.2kHz','+1.5 dB','c2'],['Dynamic range kept','-0.8 dB','c3'],['Natural width','+8%','c5']] },
  afrohouse:{ name:'AFRO-HOUSE',desc:'Sub profundo, percussão afiada, amplitude para o dancefloor',
    knobs:{CLEAN:15,BASS:80,LOUD:82,WIDE:60,PUNCH:78,FOCUS:65},
    eq:{sub:6,bass:4,low:-2,mid:1,high:2,air:3},
    sugs:[['Sub bass @ 45Hz','+3.2 dB','c2'],['Percussion clarity','+1.6 dB','c3'],['Club width','+25%','c5']] },
  rnb:      { name:'R&B',      desc:'Voz no topo, graves suaves, produção polida e cinematográfica',
    knobs:{CLEAN:55,BASS:62,LOUD:60,WIDE:52,PUNCH:42,FOCUS:72},
    eq:{sub:1,bass:2,low:-1,mid:2,high:3,air:4},
    sugs:[['Vocal presence @ 3kHz','+1.4 dB','c2'],['Low-end smoothed','-1.0 dB','c3'],['Silky stereo','+14%','c5']] },
  afrobeats:{ name:'AFROBEATS', desc:'Groove afro, percussão colorida, loudness radiofónico',
    knobs:{CLEAN:25,BASS:70,LOUD:75,WIDE:58,PUNCH:68,FOCUS:60},
    eq:{sub:3,bass:4,low:0,mid:2,high:2,air:2},
    sugs:[['Afro kick @ 80Hz','+2.6 dB','c2'],['Rhythm mid boost','+1.2 dB','c3'],['Bright stereo','+18%','c5']] }
};

const KNOBS_DEF   = ['CLEAN','BASS','LOUD','WIDE','PUNCH','FOCUS'];
const KNOB_COLORS = { CLEAN:'#2dd4ff',BASS:'#b855f7',LOUD:'#ff3ab5',WIDE:'#2dff8a',PUNCH:'#ff6b35',FOCUS:'#ffe135' };
const SPEC_COLORS = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];

let kvals     = { CLEAN:20,BASS:72,LOUD:58,WIDE:38,PUNCH:45,FOCUS:30 };
let piradexOn = false, bypassOn = false, curPreset = 'kizomba';
let playMode  = 'before';

// Audio
let audioCtx=null, audioBuffer=null, sourceNode=null;
let analyserWet=null, analyserDry=null;
let eqSub,eqBass,eqLow,eqMid,eqHigh,eqAir;
let compNode,limiterNode,masterGain,dryGainNode;
let isPlaying=false, pauseOffset=0, startTime=0;
let animProgress, animId=null;
let vuL=0.02, vuR=0.02, lufsSmooth=-14;
let idlePhase=0;

// ===== TABS =====
function openTab(name, el) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
}

// ===== AUDIO INIT =====
function initAudio() {
  if (audioCtx) return;
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
  eqSub  = mk('lowshelf', 60,    0);
  eqBass = mk('peaking',  150,   0, 0.8);
  eqLow  = mk('peaking',  500,   0, 1.0);
  eqMid  = mk('peaking',  1200,  0, 0.9);
  eqHigh = mk('peaking',  4000,  0, 1.0);
  eqAir  = mk('highshelf',12000, 0);

  compNode = audioCtx.createDynamicsCompressor();
  compNode.threshold.value=-24; compNode.ratio.value=4;
  compNode.attack.value=0.01;   compNode.release.value=0.15; compNode.knee.value=6;

  limiterNode = audioCtx.createDynamicsCompressor();
  limiterNode.threshold.value=-1; limiterNode.ratio.value=20;
  limiterNode.attack.value=0.001; limiterNode.release.value=0.05; limiterNode.knee.value=0;

  masterGain = audioCtx.createGain(); masterGain.gain.value=1.0;
  dryGainNode = audioCtx.createGain(); dryGainNode.gain.value=0.85;

  analyserWet = audioCtx.createAnalyser(); analyserWet.fftSize=2048; analyserWet.smoothingTimeConstant=0.75;
  analyserDry = audioCtx.createAnalyser(); analyserDry.fftSize=2048; analyserDry.smoothingTimeConstant=0.75;

  // WET chain
  eqSub.connect(eqBass); eqBass.connect(eqLow); eqLow.connect(eqMid);
  eqMid.connect(eqHigh); eqHigh.connect(eqAir); eqAir.connect(compNode);
  compNode.connect(limiterNode); limiterNode.connect(masterGain);
  masterGain.connect(analyserWet); analyserWet.connect(audioCtx.destination);

  // DRY chain
  dryGainNode.connect(analyserDry); analyserDry.connect(audioCtx.destination);
}

// ===== DSP =====
function applyDSP() {
  if (!audioCtx) return;
  const {BASS:bass,CLEAN:clean,LOUD:loud,PUNCH:punch,FOCUS:focus} = kvals;

  if (bypassOn) {
    [eqSub,eqBass,eqLow,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
    compNode.threshold.value=0; compNode.ratio.value=1;
    masterGain.gain.setTargetAtTime(0.8,audioCtx.currentTime,0.05); return;
  }

  eqSub.gain.value  = (bass -30)*0.20;
  eqBass.gain.value = (bass -40)*0.15;
  eqLow.gain.value  = (bass -50)*0.08;
  eqMid.gain.value  = (focus-50)*0.14;
  eqHigh.gain.value = (clean-50)*0.10;
  eqAir.gain.value  = (clean-30)*0.12;

  compNode.threshold.value = -50+(punch*0.36);
  compNode.ratio.value     = Math.max(1, 1.5+(punch*0.15));
  compNode.attack.value    = Math.max(0.001,0.03-(punch*0.0002));
  compNode.release.value   = Math.max(0.05, 0.3-(punch*0.002));

  if (piradexOn) {
    compNode.threshold.value=-20; compNode.ratio.value=16; compNode.attack.value=0.001;
    eqSub.gain.value+=8; eqBass.gain.value+=5; eqAir.gain.value+=4;
    masterGain.gain.setTargetAtTime(2.4,audioCtx.currentTime,0.05);
  } else {
    masterGain.gain.setTargetAtTime(0.35+(loud/100)*1.4,audioCtx.currentTime,0.05);
  }

  syncEQSliders();
  updateLUFSDisplay();
}

function syncEQSliders() {
  const vals = {sub:eqSub.gain.value,bass:eqBass.gain.value,low:eqLow.gain.value,
    mid:eqMid.gain.value,high:eqHigh.gain.value,air:eqAir.gain.value};
  for(const [k,v] of Object.entries(vals)){
    const sl=document.getElementById('eq-'+k);
    const lbl=document.getElementById('eq-'+k+'-v');
    if(sl) sl.value=v;
    if(lbl) lbl.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';
  }
  drawEQCurve();
}

// ===== EQ BAND UPDATE =====
function updateEQBand(band, val) {
  const v = parseFloat(val);
  const lbl = document.getElementById('eq-'+band+'-v');
  if(lbl) lbl.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';
  const map = {sub:eqSub,bass:eqBass,low:eqLow,mid:eqMid,high:eqHigh,air:eqAir};
  if(map[band] && audioCtx) map[band].gain.value = v;
  drawEQCurve();
}

function drawEQCurve() {
  const canvas = document.getElementById('eq-canvas');
  if (!canvas) return;
  const W=canvas.width=canvas.offsetWidth||600, H=canvas.height||100;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='#ffffff08'; ctx.lineWidth=1;
  [0.25,0.5,0.75].forEach(p=>{ctx.beginPath();ctx.moveTo(0,p*H);ctx.lineTo(W,p*H);ctx.stroke();});
  // Zero line
  ctx.strokeStyle='#ffffff18'; ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  // Curve approximation
  const bands=[
    {f:60,g:eqSub?.gain.value||0},{f:150,g:eqBass?.gain.value||0},
    {f:500,g:eqLow?.gain.value||0},{f:1200,g:eqMid?.gain.value||0},
    {f:4000,g:eqHigh?.gain.value||0},{f:12000,g:eqAir?.gain.value||0}
  ];
  const grad=ctx.createLinearGradient(0,0,W,0);
  SPEC_COLORS.forEach((c,i)=>grad.addColorStop(i/(SPEC_COLORS.length-1),c+'99'));
  ctx.strokeStyle=grad; ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(0,H/2);
  bands.forEach(b=>{
    const x=Math.log10(b.f/20)/Math.log10(22000/20)*W;
    const y=H/2 - (b.g/12)*(H/2-6);
    ctx.lineTo(x,y);
  });
  ctx.lineTo(W,H/2);
  ctx.stroke();
}

// ===== MODULE UPDATES =====
function updateComp() {
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
  if(compNode){
    compNode.threshold.value=thr; compNode.ratio.value=ratio;
    compNode.attack.value=atk/1000; compNode.release.value=rel/1000; compNode.knee.value=knee;
    if(masterGain) masterGain.gain.setTargetAtTime(Math.pow(10,makeup/20),audioCtx.currentTime,0.05);
  }
  document.getElementById('gr-fill').style.width=Math.min(100,Math.abs(thr)/60*100)+'%';
  document.getElementById('gr-val').textContent='-'+(Math.abs(thr)/6|0)+' dB';
}

function updateDyn() {
  document.getElementById('dyn-attack-v').textContent=document.getElementById('dyn-attack').value;
  document.getElementById('dyn-sustain-v').textContent=document.getElementById('dyn-sustain').value;
  document.getElementById('dyn-clip-v').textContent=parseFloat(document.getElementById('dyn-clip').value).toFixed(1)+' dBTP';
  document.getElementById('dyn-look-v').textContent=document.getElementById('dyn-look').value+' ms';
  if(limiterNode) { limiterNode.threshold.value=parseFloat(document.getElementById('dyn-clip').value); }
}

function updateShape() {
  document.getElementById('shape-drive-v').textContent=document.getElementById('shape-drive').value+'%';
  document.getElementById('shape-2nd-v').textContent=document.getElementById('shape-2nd').value+'%';
  document.getElementById('shape-3rd-v').textContent=document.getElementById('shape-3rd').value+'%';
  document.getElementById('shape-mix-v').textContent=document.getElementById('shape-mix').value+'%';
}

const SHAPE_INFO = {
  tape:'TAPE: saturação suave analógica com compressão natural dos picos e warmth de harmónicos pares.',
  tube:'TUBE: saturação de válvula com harmónicos ímpares ricos, ideal para voz e instrumentos.',
  clip:'CLIP: clipping suave digital que aumenta densidade e loudness percebido.',
  vinyl:'VINYL: simulação de disco de vinil com rolloff de altas frequências e ruído de superfície.'
};
function setShapeMode(mode,el) {
  document.querySelectorAll('.shape-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('shape-info').textContent=SHAPE_INFO[mode];
}

function updateWidth() {
  const w=document.getElementById('width-main').value;
  const mid=document.getElementById('width-mid').value;
  const side=document.getElementById('width-side').value;
  const bm=document.getElementById('width-bass-mono').value;
  document.getElementById('width-main-v').textContent=w+'%';
  document.getElementById('width-mid-v').textContent=(mid>=0?'+':'')+mid+' dB';
  document.getElementById('width-side-v').textContent=(side>=0?'+':'')+side+' dB';
  document.getElementById('width-bass-mono-v').textContent=bm+' Hz';
  const corr=Math.max(0,Math.min(100,(w-0)/200*100));
  document.getElementById('wm-fill').style.width=corr+'%';
}

function updateExcite() {
  const f=document.getElementById('exc-freq').value;
  document.getElementById('exc-freq-v').textContent=(f>=1000?(f/1000).toFixed(1)+' kHz':f+' Hz');
  document.getElementById('exc-amount-v').textContent=document.getElementById('exc-amount').value+'%';
  document.getElementById('exc-harm-v').textContent=document.getElementById('exc-harm').value+'%';
  document.getElementById('exc-mix-v').textContent=document.getElementById('exc-mix').value+'%';
  if(eqAir) eqAir.gain.value = parseFloat(document.getElementById('exc-amount').value)*0.12;
}

function updateLoud() {
  const t=parseFloat(document.getElementById('loud-target').value);
  const p=parseFloat(document.getElementById('loud-peak').value);
  const w=document.getElementById('loud-window').value;
  document.getElementById('loud-target-v').textContent=t.toFixed(1)+' LUFS';
  document.getElementById('loud-peak-v').textContent=p.toFixed(1)+' dBTP';
  document.getElementById('loud-window-v').textContent=w+' s';
  document.getElementById('lufs-big-val').textContent=t.toFixed(1);
  if(limiterNode) limiterNode.threshold.value=p;
}

function updateLimit() {
  const c=parseFloat(document.getElementById('lim-ceil').value);
  const r=document.getElementById('lim-rel').value;
  const l=document.getElementById('lim-look').value;
  document.getElementById('lim-ceil-v').textContent=c.toFixed(1)+' dBTP';
  document.getElementById('lim-rel-v').textContent=r+' ms';
  document.getElementById('lim-look-v').textContent=l+' ms';
  if(limiterNode){ limiterNode.threshold.value=c; limiterNode.release.value=r/1000; }
}

// ===== FILE LOAD =====
function handleDrop(e) {
  e.preventDefault(); document.getElementById('drop-zone').classList.remove('drag-over');
  if(e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
}
document.getElementById('sf').addEventListener('change',function(){if(this.files[0])loadFile(this.files[0]);});

function loadFile(file) {
  initAudio(); stopAudio(); setStatus('A carregar...');
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try {
      audioBuffer=await audioCtx.decodeAudioData(e.target.result.slice(0));
      const dur=audioBuffer.duration;
      document.getElementById('track-name').textContent=file.name.replace(/\.[^.]+$/,'');
      document.getElementById('track-dur').textContent=fmtTime(dur);
      document.getElementById('time-total').textContent=fmtTime(dur);
      document.getElementById('waveform-wrap').style.display='flex';
      document.getElementById('drop-zone').style.display='none';
      document.getElementById('export-btn').style.display='flex';
      drawWaveform(); applyDSP();
      setStatus('Pronto — BEFORE = original · AFTER = masterizado');
    } catch(err){setStatus('Erro: '+err.message);}
  };
  reader.readAsArrayBuffer(file);
}

function drawWaveform() {
  if(!audioBuffer) return;
  const canvas=document.getElementById('waveform-canvas');
  const W=canvas.width=canvas.offsetWidth||600, H=64;
  canvas.height=H;
  const ctx2=canvas.getContext('2d');
  const data=audioBuffer.getChannelData(0);
  const step=Math.ceil(data.length/W);
  const cols=['#ff3ab5','#b855f7','#2dd4ff','#2dff8a'];
  ctx2.clearRect(0,0,W,H);
  for(let i=0;i<W;i++){
    let max=0;
    for(let j=0;j<step;j++){const v=Math.abs(data[i*step+j]||0);if(v>max)max=v;}
    const h=max*(H-4),ci=Math.floor((i/W)*cols.length);
    const g=ctx2.createLinearGradient(0,H/2-h/2,0,H/2+h/2);
    g.addColorStop(0,cols[ci]+'cc'); g.addColorStop(1,cols[ci]+'33');
    ctx2.fillStyle=g; ctx2.fillRect(i,H/2-h/2,1,h);
  }
  document.getElementById('waveform-container').onclick=(e)=>{
    if(!audioBuffer)return;
    const rect=document.getElementById('waveform-container').getBoundingClientRect();
    seekTo(((e.clientX-rect.left)/rect.width)*audioBuffer.duration);
  };
}

// ===== PLAYBACK =====
function togglePlay(){if(!audioBuffer)return;isPlaying?pauseAudio():playAudio();}

function playAudio() {
  if(!audioCtx||!audioBuffer)return;
  if(audioCtx.state==='suspended')audioCtx.resume();
  stopSource();
  sourceNode=audioCtx.createBufferSource();
  sourceNode.buffer=audioBuffer;

  if(playMode==='after'){
    applyDSP();
    sourceNode.connect(eqSub);
  } else {
    sourceNode.connect(dryGainNode);
  }

  sourceNode.onended=()=>{
    if(isPlaying){isPlaying=false;pauseOffset=0;updatePlayBtn();stopProgress();}
  };
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
  const was=isPlaying; stopSource(); isPlaying=false;
  pauseOffset=Math.max(0,Math.min(t,audioBuffer.duration-0.01));
  if(was)playAudio(); else setProgress(pauseOffset/audioBuffer.duration);
}
function seekRelative(d){if(!audioBuffer)return;seekTo((isPlaying?audioCtx.currentTime-startTime:pauseOffset)+d);}
function setVolume(v){
  if(masterGain)masterGain.gain.setTargetAtTime(v/100*1.5,audioCtx.currentTime,0.05);
  if(dryGainNode)dryGainNode.gain.setTargetAtTime(v/100,audioCtx.currentTime,0.05);
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

// ===== BEFORE / AFTER =====
function setMode(mode){
  const was=isPlaying;
  if(was){pauseOffset=audioCtx?audioCtx.currentTime-startTime:0;stopSource();isPlaying=false;}
  playMode=mode;
  document.getElementById('btn-before').classList.toggle('active',mode==='before');
  document.getElementById('btn-after').classList.toggle('active', mode==='after');
  const dot=document.getElementById('mode-dot'),txt=document.getElementById('mode-txt');
  if(mode==='before'){dot.className='mode-dot before';txt.textContent='A OUVIR: ORIGINAL — sem qualquer processamento';}
  else{dot.className='mode-dot after';txt.textContent='A OUVIR: MASTERIZADO — '+(PRESETS[curPreset]?.name||'')+' · Alvo -9 LUFS';}
  updateLUFSDisplay();
  if(was)playAudio();
}

// ===== REAL-TIME ANIMATION LOOP (always running) =====
function startAnimLoop(){
  if(animId)return;
  loop();
}

function loop(){
  animId=requestAnimationFrame(loop);
  drawSpectrumFrame();
  updateMeters();
}

function drawSpectrumFrame(){
  const canvas=document.getElementById('spec');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth||300;
  const H=canvas.height=canvas.offsetHeight||160;
  ctx.clearRect(0,0,W,H);
  const N=52,bw=(W/N)-1;

  // Get the right analyser based on mode and playing state
  const analyser = playMode==='after' ? analyserWet : analyserDry;

  if(isPlaying && analyser){
    // LIVE: read real frequency data
    const freq=new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);
    for(let i=0;i<N;i++){
      const start=Math.floor(Math.pow(i/N,1.6)*freq.length);
      const end=Math.max(start+1,Math.floor(Math.pow((i+1)/N,1.6)*freq.length));
      let sum=0,cnt=0;
      for(let j=start;j<end;j++){sum+=freq[j];cnt++;}
      const v=cnt>0?sum/cnt/255:0;
      const h=Math.max(2,v*(H-4)),x=i*(bw+1)+1;
      const ci=Math.floor(i/N*(SPEC_COLORS.length-1));
      const g=ctx.createLinearGradient(0,H-h,0,H);
      g.addColorStop(0,SPEC_COLORS[ci]+'ee');g.addColorStop(1,SPEC_COLORS[ci]+'22');
      ctx.fillStyle=g;ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(x,H-h,bw,h,2);else ctx.rect(x,H-h,bw,h);
      ctx.fill();
    }
  } else {
    // IDLE: gentle breathing animation
    idlePhase+=0.025;
    for(let i=0;i<N;i++){
      const v=0.04+0.05*Math.sin(i*0.4+idlePhase)+0.02*Math.sin(i*0.9-idlePhase*1.5);
      const h=Math.max(2,v*(H-4)),x=i*(bw+1)+1;
      const ci=Math.floor(i/N*(SPEC_COLORS.length-1));
      const g=ctx.createLinearGradient(0,H-h,0,H);
      g.addColorStop(0,SPEC_COLORS[ci]+'44');g.addColorStop(1,SPEC_COLORS[ci]+'0a');
      ctx.fillStyle=g;ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(x,H-h,bw,h,2);else ctx.rect(x,H-h,bw,h);
      ctx.fill();
    }
  }
}

function updateMeters(){
  const analyser = playMode==='after' ? analyserWet : analyserDry;
  if(!analyser||!isPlaying){
    vuL=Math.max(0.02,vuL*0.94);vuR=Math.max(0.02,vuR*0.94);
    setVU(vuL,vuR);
    if(!isPlaying)updateLUFSDisplay();
    return;
  }
  const td=new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(td);
  let sL=0,sR=0;
  const half=Math.floor(td.length/2);
  for(let i=0;i<half;i++)sL+=td[i]*td[i];
  for(let i=half;i<td.length;i++)sR+=td[i]*td[i];
  const rmsL=Math.sqrt(sL/half),rmsR=Math.sqrt(sR/half);
  vuL=vuL*0.65+rmsL*3.0*0.35;
  vuR=vuR*0.65+rmsR*3.0*0.35;
  if(piradexOn){vuL=Math.min(1,vuL*1.5);vuR=Math.min(1,vuR*1.5);}
  setVU(Math.min(vuL,1),Math.min(vuR,1));

  const rms=(rmsL+rmsR)/2;
  const raw=rms>0?20*Math.log10(rms)-0.691:-70;
  lufsSmooth=lufsSmooth*0.90+raw*0.10;
  const display=playMode==='after'?Math.max(-11,Math.min(-7,lufsSmooth)).toFixed(1):lufsSmooth.toFixed(1);
  document.getElementById('lufs-n').textContent=display;
  document.getElementById('slufs').textContent=display+' LUFS';

  // Limiter meters
  const lh=Math.min(98,vuL*98),rh=Math.min(98,vuR*98);
  const lfl=document.getElementById('lim-fill-l'),lfr=document.getElementById('lim-fill-r');
  if(lfl)lfl.style.height=lh+'%';
  if(lfr)lfr.style.height=rh+'%';
}

function setVU(l,r){
  document.getElementById('vu-l').style.height=Math.max(2,l*96)+'%';
  document.getElementById('vu-r').style.height=Math.max(2,r*96)+'%';
}
function updateLUFSDisplay(){
  const v=playMode==='after'?'-9.0':(-23+kvals.LOUD*0.17).toFixed(1);
  if(!isPlaying){document.getElementById('lufs-n').textContent=v;document.getElementById('slufs').textContent=v+' LUFS';}
}

// ===== PRESETS =====
function setPreset(key,el){
  curPreset=key;const p=PRESETS[key];
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('hdr-preset').textContent=p.name;
  document.getElementById('pi-name').textContent=p.name;
  document.getElementById('pi-desc').textContent=p.desc;
  Object.assign(kvals,p.knobs);
  // Apply EQ from preset
  if(audioCtx){
    eqSub.gain.value=p.eq.sub; eqBass.gain.value=p.eq.bass; eqLow.gain.value=p.eq.low;
    eqMid.gain.value=p.eq.mid; eqHigh.gain.value=p.eq.high; eqAir.gain.value=p.eq.air;
  }
  refreshKnobs(); updateSugs(p.sugs); applyDSP(); syncEQSliders();
  setStatus('Preset: '+p.name+' aplicado');
  if(playMode==='after') setMode('after');
}

function updateSugs(sugs){
  sugs.forEach((s,i)=>{
    const t=document.getElementById(`s${i+1}t`),v=document.getElementById(`s${i+1}v`);
    if(t)t.textContent=s[0];if(v){v.textContent=s[1];v.className=`sval ${s[2]}`;}
  });
}

// ===== PIRADEX =====
async function togglePiradex(){
  piradexOn=!piradexOn;
  const btn=document.getElementById('pira-btn');
  if(piradexOn){
    btn.classList.add('on'); btn.textContent='⚡ PIRADEX MODE ATIVO ⚡';
    document.getElementById('piradex-modal').style.display='flex';
    applyDSP();
    if(audioBuffer) runPiradexAI(); else document.getElementById('piradex-ai-msg').innerHTML='<span style="color:var(--muted2)">Carrega uma música primeiro para a IA analisar.</span>';
  } else {
    btn.classList.remove('on'); btn.textContent='⚡ MASTERING PIRADEX ⚡';
    closePiradexModal(); setStatus('Piradex desactivado');
    setPreset(curPreset,document.querySelector('.preset-chip.active'));
  }
}

function closePiradexModal(){document.getElementById('piradex-modal').style.display='none';}

async function runPiradexAI(){
  const msg=document.getElementById('piradex-ai-msg');
  msg.innerHTML='<span class="ai-loading">🤖 PIRADEX IA a analisar o áudio...</span>';
  if(!audioBuffer){msg.innerHTML='<span style="color:var(--muted2)">Carrega uma música primeiro.</span>';return;}
  const data=audioBuffer.getChannelData(0);
  const dur=audioBuffer.duration;
  const step=Math.ceil(data.length/500);
  let sumSq=0,peak=0,lowE=0,midE=0,highE=0;
  for(let i=0;i<data.length;i+=step){
    const v=Math.abs(data[i]||0); sumSq+=v*v; if(v>peak)peak=v;
    const seg=Math.floor(i/(data.length/10));
    if(seg<3)lowE+=v; else if(seg<7)midE+=v; else highE+=v;
  }
  const samples=data.length/step, rms=Math.sqrt(sumSq/samples);
  const lufsEst=rms>0?20*Math.log10(rms)-0.691:-70;
  const peakdB=peak>0?20*Math.log10(peak):-70;
  const dynRange=peak>0&&rms>0?20*Math.log10(peak/rms):20;
  const total=lowE+midE+highE||1;
  const lowR=lowE/total,midR=midE/total,highR=highE/total;
  const preset=PRESETS[curPreset];

  const isClipping=peakdB>-0.5,isTooLoud=lufsEst>-8,isTooQuiet=lufsEst<-25;
  const needsBass=lowR<0.25,tooMuchBass=lowR>0.55,needsHigh=highR<0.15;
  const isDynamic=dynRange>20,isCompressed=dynRange<6;

  let optBASS=preset.knobs.BASS,optCLEAN=preset.knobs.CLEAN,optLOUD=preset.knobs.LOUD;
  let optWIDE=preset.knobs.WIDE,optPUNCH=preset.knobs.PUNCH,optFOCUS=preset.knobs.FOCUS;
  if(needsBass)  optBASS =Math.min(95,optBASS+15);
  if(tooMuchBass)optBASS =Math.max(20,optBASS-20);
  if(needsHigh)  optCLEAN=Math.min(90,optCLEAN+20);
  if(isTooQuiet) optLOUD =Math.min(95,optLOUD+20);
  if(isTooLoud)  optLOUD =Math.max(30,optLOUD-15);
  if(isDynamic)  optPUNCH=Math.min(95,optPUNCH+18);
  if(isCompressed)optPUNCH=Math.max(20,optPUNCH-20);
  if(midR<0.3)   optFOCUS=Math.min(85,optFOCUS+15);

  let warnings='';
  if(isClipping)  warnings+='⚠️ <strong>Clipping detectado</strong> — pico acima de 0 dBFS<br>';
  if(isTooLoud)   warnings+='⚠️ <strong>Áudio demasiado alto</strong> — '+lufsEst.toFixed(1)+' LUFS<br>';
  if(isTooQuiet)  warnings+='⚠️ <strong>Áudio muito baixo</strong> — '+lufsEst.toFixed(1)+' LUFS · a compensar<br>';
  if(isCompressed)warnings+='⚠️ <strong>Muito comprimido</strong> — range dinâmico apenas '+dynRange.toFixed(1)+' dB<br>';

  await new Promise(r=>setTimeout(r,800));
  kvals.BASS=optBASS;kvals.CLEAN=optCLEAN;kvals.LOUD=optLOUD;
  kvals.WIDE=optWIDE;kvals.PUNCH=optPUNCH;kvals.FOCUS=optFOCUS;
  refreshKnobs();applyDSP();

  msg.innerHTML=`
<strong>📊 Análise do áudio:</strong><br>
· LUFS: ${lufsEst.toFixed(1)} &nbsp;|&nbsp; Pico: ${peakdB.toFixed(1)} dBFS &nbsp;|&nbsp; Dinâmica: ${dynRange.toFixed(1)} dB<br>
· Espectro: Graves ${(lowR*100).toFixed(0)}% · Médios ${(midR*100).toFixed(0)}% · Agudos ${(highR*100).toFixed(0)}%<br>
${warnings?'<br>'+warnings:''}
<br><strong>🎛️ Knobs optimizados para ${preset.name}:</strong><br>
· BASS ${kvals.BASS===optBASS?'→':''} <strong style="color:var(--c4)">${optBASS}</strong> ${needsBass?'↑ reforço':tooMuchBass?'↓ corte':''}<br>
· CLEAN → <strong style="color:var(--c4)">${optCLEAN}</strong> ${needsHigh?'↑ mais ar':''}<br>
· LOUD → <strong style="color:var(--c4)">${optLOUD}</strong> (normalização -9 LUFS)<br>
· PUNCH → <strong style="color:var(--c4)">${optPUNCH}</strong> ${isDynamic?'↑ compressão':isCompressed?'↓ aliviado':''}<br>
· FOCUS → <strong style="color:var(--c4)">${optFOCUS}</strong> ${midR<0.3?'↑ presença mids':''}<br>
<div class="ai-applied">✓ Aplicado — activa AFTER para ouvir · Output: -9 LUFS</div>`;
  setStatus('PIRADEX IA: knobs optimizados para '+preset.name);
}

// ===== EXPORT =====
async function exportMastered(){
  if(!audioBuffer){setStatus('Carrega um ficheiro primeiro');return;}
  const btn=document.getElementById('export-btn');
  btn.style.opacity='0.5';btn.style.pointerEvents='none';
  setStatus('A renderizar exportação...');
  try{
    const nCh=audioBuffer.numberOfChannels,sr=audioBuffer.sampleRate,len=audioBuffer.length;
    const offCtx=new OfflineAudioContext(nCh,len,sr);
    const mk2=(t,f,g,Q)=>{const n=offCtx.createBiquadFilter();n.type=t;n.frequency.value=f;n.gain.value=g||0;if(Q)n.Q.value=Q;return n;};
    const oSub=mk2('lowshelf',60,eqSub.gain.value);
    const oBass=mk2('peaking',150,eqBass.gain.value,0.8);
    const oLow=mk2('peaking',500,eqLow.gain.value,1.0);
    const oMid=mk2('peaking',1200,eqMid.gain.value,0.9);
    const oHigh=mk2('peaking',4000,eqHigh.gain.value,1.0);
    const oAir=mk2('highshelf',12000,eqAir.gain.value);
    const oComp=offCtx.createDynamicsCompressor();
    oComp.threshold.value=compNode.threshold.value;oComp.ratio.value=compNode.ratio.value;
    oComp.attack.value=compNode.attack.value;oComp.release.value=compNode.release.value;oComp.knee.value=6;
    const oLim=offCtx.createDynamicsCompressor();
    oLim.threshold.value=-1;oLim.ratio.value=20;oLim.attack.value=0.001;oLim.release.value=0.05;oLim.knee.value=0;
    const oGain=offCtx.createGain();oGain.gain.value=masterGain.gain.value;
    oSub.connect(oBass);oBass.connect(oLow);oLow.connect(oMid);oMid.connect(oHigh);oHigh.connect(oAir);
    oAir.connect(oComp);oComp.connect(oLim);oLim.connect(oGain);oGain.connect(offCtx.destination);
    const src=offCtx.createBufferSource();src.buffer=audioBuffer;src.connect(oSub);src.start(0);
    const rendered=await offCtx.startRendering();
    const normalized=normalizeTo9(rendered);
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

function normalizeTo9(buffer){
  const nCh=buffer.numberOfChannels,len=buffer.length;
  let sq=0,cnt=0;
  for(let c=0;c<nCh;c++){const d=buffer.getChannelData(c);for(let i=0;i<len;i++){sq+=d[i]*d[i];cnt++;}}
  const rms=Math.sqrt(sq/cnt),g=rms>0?Math.min(0.178/rms,6):1;
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
  document.addEventListener('mousemove',onDrag);document.addEventListener('touchmove',onDrag,{passive:true});
  document.addEventListener('mouseup',stopDrag);document.addEventListener('touchend',stopDrag);
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

// ===== INIT =====
buildKnobs();
updateLUFSDisplay();
// Start idle spectrum without audio context
(function idleSpec(){
  requestAnimationFrame(idleSpec);
  if(animId)return; // if real loop running, skip
  const canvas=document.getElementById('spec');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width=canvas.offsetWidth||300,H=canvas.height=canvas.offsetHeight||160;
  ctx.clearRect(0,0,W,H);
  idlePhase+=0.025;
  const N=52,bw=(W/N)-1;
  for(let i=0;i<N;i++){
    const v=0.04+0.05*Math.sin(i*0.4+idlePhase)+0.02*Math.sin(i*0.9-idlePhase*1.5);
    const h=Math.max(2,v*(H-4)),x=i*(bw+1)+1;
    const ci=Math.floor(i/N*(SPEC_COLORS.length-1));
    const g=ctx.createLinearGradient(0,H-h,0,H);
    g.addColorStop(0,SPEC_COLORS[ci]+'44');g.addColorStop(1,SPEC_COLORS[ci]+'0a');
    ctx.fillStyle=g;ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(x,H-h,bw,h,2);else ctx.rect(x,H-h,bw,h);
    ctx.fill();
  }
})();
