// ===== PIRADEX MASTERING SUITE v1.0 =====

const PRESETS = {
  kizomba:  {name:'KIZOMBA',  refs:'C4 Pedro · Johnny Ramos · Nelson Freitas', desc:'Graves quentes, body nos mids baixos',
    knobs:{CLEAN:50,BASS:60,LOUD:65,WIDE:50,PUNCH:50,FOCUS:55},eq:{sub:0.6,bass:0.7,low:0.8,mid:-0.2,high:-0.3,air:0.4},
    sugs:[['Bass body @ 150Hz','+0.7 dB','c2'],['Low-mid warmth','+0.8 dB','c3'],['Stereo groove','+42%','c5']]},
  kuduro:   {name:'KUDURO',   refs:'Titica · Kapota', desc:'Sub kick agressivo, energia máxima de dança',
    knobs:{CLEAN:45,BASS:72,LOUD:72,WIDE:45,PUNCH:65,FOCUS:55},eq:{sub:3.9,bass:-0.5,low:-0.8,mid:-0.2,high:-0.3,air:-0.4},
    sugs:[['Sub kick @ 60Hz','+3.9 dB','c2'],['Low-mid cut','-0.8 dB','c3'],['Tight mono','-0.4 dB','c5']]},
  zouk:     {name:'ZOUK',     refs:'Kassav', desc:'Sub profundo, amplitude romántica, muito dinâmico',
    knobs:{CLEAN:50,BASS:68,LOUD:60,WIDE:68,PUNCH:52,FOCUS:45},eq:{sub:3.8,bass:0.0,low:-0.8,mid:-0.2,high:0.0,air:0.0},
    sugs:[['Deep sub @ 60Hz','+3.8 dB','c2'],['Low-mid clean','-0.8 dB','c3'],['Wide stereo','+72%','c5']]},
  gzouk:    {name:'GZOUK',    refs:'Kaysha', desc:'Corpo nos mids baixos, groove urbano',
    knobs:{CLEAN:50,BASS:60,LOUD:65,WIDE:58,PUNCH:52,FOCUS:55},eq:{sub:-0.6,bass:-0.2,low:2.2,mid:0.4,high:0.0,air:0.0},
    sugs:[['Low-mid body @ 500Hz','+2.2 dB','c2'],['Mid presence','+0.4 dB','c3'],['Urban width','+58%','c5']]},
  semba:    {name:'SEMBA',    refs:'Cabelos Brancos', desc:'Bass quente dominante, alma angolana',
    knobs:{CLEAN:50,BASS:65,LOUD:62,WIDE:50,PUNCH:55,FOCUS:50},eq:{sub:-3.1,bass:4.7,low:0.2,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Bass warmth @ 150Hz','+4.7 dB','c2'],['Sub cut','-3.1 dB','c3'],['Natural groove','+44%','c5']]},
  afrohouse:{name:'AFRO-HOUSE',refs:'Lau Silva · Nitefreak · TAKA', desc:'Sub extremo, kick profundo, dancefloor',
    knobs:{CLEAN:50,BASS:72,LOUD:68,WIDE:60,PUNCH:58,FOCUS:50},eq:{sub:4.8,bass:-0.5,low:-0.8,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Sub weight @ 50Hz','+4.8 dB','c2'],['Bass definition','-0.5 dB','c3'],['Club width','+62%','c5']]},
  rnb:      {name:'R&B',      refs:'Mario · Ne-Yo · Usher · Chris Brown', desc:'Voz no topo, dinâmico, polido',
    knobs:{CLEAN:58,BASS:52,LOUD:60,WIDE:55,PUNCH:45,FOCUS:65},eq:{sub:-0.5,bass:0.3,low:0.5,mid:1.2,high:1.0,air:0.8},
    sugs:[['Low-mid body @ 500Hz','+2.0 dB','c2'],['Sub control','-1.2 dB','c3'],['Vocal presence','+0.4 dB','c5']]},
  afrobeats:{name:'AFROBEATS',refs:'Davido · Rema · Lojay', desc:'Sub pesado, groove colorido',
    knobs:{CLEAN:50,BASS:65,LOUD:65,WIDE:55,PUNCH:55,FOCUS:55},eq:{sub:2.1,bass:0.5,low:0.0,mid:0.0,high:0.0,air:0.0},
    sugs:[['Sub groove @ 60Hz','+2.1 dB','c2'],['Bass presence','+0.5 dB','c3'],['Afro width','+56%','c5']]},
  amapiano: {name:'AMAPIANO', refs:'Asake · Olamide', desc:'Log drum pesado, piano suave, corpo nos low-mids — som sul-africano',
    knobs:{CLEAN:50,BASS:52,LOUD:65,WIDE:60,PUNCH:60,FOCUS:55},
    eq:{sub:-2.5,bass:1.0,low:1.3,mid:0.0,high:-0.4,air:-0.2},
    sugs:[['Bass body @ 150Hz','+1.0 dB','c2'],['Low-mid presence','+1.3 dB','c3'],['Log drum punch','+61%','c5']]},
  dancehall: {name:'DANCEHALL', refs:'Blaiz Fayah · Tribal Kush', desc:'Riddim energético, voz presente, espectro completo — estilo jamaicano/afro',
    knobs:{CLEAN:60,BASS:45,LOUD:65,WIDE:55,PUNCH:62,FOCUS:70},
    eq:{sub:-3.0,bass:-0.1,low:1.1,mid:1.3,high:0.7,air:0.7},
    sugs:[['Vocal presence @ 1.5kHz','+1.3 dB','c2'],['High definition','+0.7 dB','c3'],['Riddim punch','+63%','c5']]},
  reggaeton: {name:'REGGAETON', refs:'Daddy Yankee · Snow', desc:'Sub dominante, dembow pesado, kick profundo — som latino urbano',
    knobs:{CLEAN:50,BASS:65,LOUD:65,WIDE:52,PUNCH:58,FOCUS:50},
    eq:{sub:3.0,bass:-0.8,low:-0.9,mid:-0.3,high:-0.3,air:-0.2},
    sugs:[['Sub dembow @ 60Hz','+3.0 dB','c2'],['Bass tightness','-0.8 dB','c3'],['Latino punch','+60%','c5']]},
  kompa: {name:'KOMPA', refs:"Joe Dwe't File", desc:'Graves profundos, muito dinâmico, romantismo haitiano',
    knobs:{CLEAN:50,BASS:58,LOUD:62,WIDE:55,PUNCH:50,FOCUS:50},
    eq:{sub:1.1,bass:-0.2,low:0.1,mid:-0.5,high:-0.6,air:-0.2},
    sugs:[['Warm sub @ 70Hz','+1.1 dB','c2'],['Mid warmth','-0.5 dB','c3'],['Romantic width','+58%','c5']]},
  house:    {name:'HOUSE',    refs:'Adam Port · HUGEL', desc:'Sub dominante, kick 4x4, dancefloor',
    knobs:{CLEAN:52,BASS:72,LOUD:70,WIDE:52,PUNCH:58,FOCUS:50},eq:{sub:4.0,bass:-0.5,low:-0.5,mid:-0.3,high:0.5,air:0.5},
    sugs:[['Sub punch @ 50Hz','+4.0 dB','c2'],['Bass definition','-0.5 dB','c3'],['Club energy','+72%','c5']]},
  suno: {name:'AI SUNO', refs:'Suno v3 · v4 · v5 — AI Generated Music', desc:'Noise gate · EQ correction · Stereo wide · Limiter → −9 LUFS',
    knobs:{CLEAN:62,BASS:52,LOUD:68,WIDE:58,PUNCH:48,FOCUS:60},
    eq:{sub:-1.0,bass:0.5,low:-2.5,mid:-1.8,high:1.5,air:2.0},
    sugs:[['Low-mid nasal cut @ 500Hz','−2.5 dB','c2'],['Air & presence boost','+2.0 dB','c3'],['Stereo width AI clean','+58%','c5']]}
};

const KNOBS_DEF   = ['CLEAN','BASS','LOUD','WIDE','PUNCH','FOCUS'];
const KNOB_COLORS = {CLEAN:'#2dd4ff',BASS:'#b855f7',LOUD:'#ff3ab5',WIDE:'#2dff8a',PUNCH:'#ff6b35',FOCUS:'#ffe135'};
const SPEC_COLORS = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];
const FREQ_LABELS = [20,50,100,200,500,1000,2000,5000,10000,20000];
const DB_LABELS   = [0,-12,-24,-48,-72,-90];

let kvals     = {...PRESETS.kizomba.knobs};
let piradexOn = false, bypassOn = false, curPreset = 'kizomba', playMode = 'before';
let headroomApplied = false;

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
let lastWidthAirDelta=0;
let widthAirOffset=0, widthHighOffset=0;
let refBuffer=null, refStats=null;
let specPeaks=null, specSmooth=null;
let specHoverX=-1;
let loudTarget=-9;

// ===== TABS =====
function openTab(name, el) {
  if(playMode==='before' && name!=='master'){
    setStatus('Muda para PROCESSADO para aceder aos efeitos');
    return;
  }
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

  // EQ nodes — all start at 0 gain (no effect)
  eqSub    = mk('lowshelf',  60,   0);
  eqBass   = mk('peaking',   150,  0, 0.8);
  eqLowNode= mk('peaking',   500,  0, 1.0);
  eqMid    = mk('peaking',   1200, 0, 0.9);
  eqHigh   = mk('peaking',   4000, 0, 1.0);
  eqAir    = mk('highshelf', 12000,0);

  // Compressor — starts BYPASSED (threshold 0, ratio 1 = no compression)
  compNode = audioCtx.createDynamicsCompressor();
  compNode.threshold.value = 0;    // 0dB = no compression
  compNode.ratio.value     = 1;    // 1:1 = bypass
  compNode.attack.value    = 0.01;
  compNode.release.value   = 0.15;
  compNode.knee.value      = 0;

  // Limiter — starts disabled (threshold 0 = no limiting)
  limiterNode = audioCtx.createDynamicsCompressor();
  limiterNode.threshold.value = 0;
  limiterNode.ratio.value     = 1;
  limiterNode.attack.value    = 0.001;
  limiterNode.release.value   = 0.05;
  limiterNode.knee.value      = 0;

  // Shape — starts as pure dry (no saturation)
  shapeWS      = audioCtx.createWaveShaper();
  shapeWS.oversample = '4x';
  shapeDryGain = audioCtx.createGain(); shapeDryGain.gain.value = 1.0; // 100% dry
  shapeWetGain = audioCtx.createGain(); shapeWetGain.gain.value = 0.0; // 0% wet

  // MasterGain = 1.0 ALWAYS at rest (unity gain)
  masterGain = audioCtx.createGain(); masterGain.gain.value = 1.0;

  // DryGain = 1.0 (unity — not 0.85 which was causing level difference)
  dryGain = audioCtx.createGain(); dryGain.gain.value = 1.0;

  // Side/Mid gains = 1.0 unity
  msMidGain  = audioCtx.createGain(); msMidGain.gain.value  = 1.0;
  msSideGain = audioCtx.createGain(); msSideGain.gain.value = 1.0;

  // Analyser
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2048;
  analyserNode.smoothingTimeConstant = 0.7;

  // Init spectrum arrays
  specPeaks  = new Float32Array(2048).fill(-150);
  specSmooth = new Float32Array(2048).fill(-150);

  // Shape mixer node
  const shapeMixer = audioCtx.createGain(); shapeMixer.gain.value = 1.0;

  // WET CHAIN (PROCESSADO):
  // source → EQ → shapeMixer(dry+wet shape) → comp → limiter → masterGain → analyser → out
  eqSub.connect(eqBass); eqBass.connect(eqLowNode); eqLowNode.connect(eqMid);
  eqMid.connect(eqHigh); eqHigh.connect(eqAir);
  eqAir.connect(shapeDryGain); shapeDryGain.connect(shapeMixer);
  eqAir.connect(shapeWS);     shapeWS.connect(shapeWetGain); shapeWetGain.connect(shapeMixer);
  shapeMixer.connect(compNode);
  compNode.connect(limiterNode);
  limiterNode.connect(masterGain);
  masterGain.connect(analyserNode);

  // DRY CHAIN (ORIGINAL):
  // source → dryGain → analyser → out
  dryGain.connect(analyserNode);

  // Analyser → destination
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

// Shape presets — each mode has its own parameter defaults
const SHAPE_PRESETS={
  tape:        {drive:25, mix:40, '2nd':60, '3rd':20, trim:0,   info:'TAPE: warmth analógico suave, harmónicos pares, compressão natural dos picos.'},
  tube:        {drive:35, mix:35, '2nd':70, '3rd':30, trim:-1,  info:'TUBE: válvula clássica, harmónicos ímpares ricos, ideal para voz e instrumentos.'},
  transistor:  {drive:50, mix:30, '2nd':30, '3rd':60, trim:-1,  info:'TRANSISTOR: resposta rápida, harmónicos brilhantes, ideal para percussão e baixo.'},
  solidstate:  {drive:45, mix:45, '2nd':40, '3rd':50, trim:-2,  info:'SOLID STATE: compressão densa e definida, som agressivo, hardware analógico moderno.'},
  analogico:   {drive:30, mix:50, '2nd':55, '3rd':35, trim:0,   info:'ANALÓGICO: emulação completa de circuito analógico com warmth e não-linearidade natural.'},
  valvulado:   {drive:40, mix:30, '2nd':75, '3rd':20, trim:-1,  info:'VALVULADO: válvula de vácuo tipo 1176/LA-2A, harmónicos suaves e musicais.'},
  transparente:{drive:10, mix:20, '2nd':20, '3rd':10, trim:0,   info:'TRANSPARENTE: saturação mínima, sem coloração, apenas glue subtil.'},
  clip:        {drive:70, mix:60, '2nd':30, '3rd':40, trim:-3,  info:'CLIP: clipping suave digital, maximiza loudness percebido, mais agressivo.'},
  paralimit:   {drive:55, mix:50, '2nd':45, '3rd':30, trim:-2,  info:'PARALIMIT: limiting paralelo, preserva transientes, aumenta corpo e densidade.'},
  deess:       {drive:20, mix:70, '2nd':10, '3rd':80, trim:0,   info:'DE-ESS: atenuação de sibilantes e harshness acima de 5kHz. Ideal para voz e pratos.'}
};

function setShapeMode(mode,el){
  shapeMode=mode;
  document.querySelectorAll('.shape-mode-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const preset=SHAPE_PRESETS[mode];
  if(preset){
    // Apply preset parameters to UI
    const setSlider=(id,val)=>{const s=document.getElementById(id);if(s)s.value=val;};
    setSlider('shape-drive',   preset.drive);
    setSlider('shape-mix',     preset.mix);
    setSlider('shape-2nd',     preset['2nd']);
    setSlider('shape-3rd',     preset['3rd']);
    setSlider('shape-trim',    preset.trim);
    // Update display values
    document.getElementById('shape-drive-v').textContent=preset.drive+'%';
    document.getElementById('shape-mix-v').textContent=preset.mix+'%';
    document.getElementById('shape-2nd-v').textContent=preset['2nd']+'%';
    document.getElementById('shape-3rd-v').textContent=preset['3rd']+'%';
    document.getElementById('shape-trim-v').textContent=(preset.trim>=0?'+':'')+preset.trim.toFixed(1)+' dB';
    document.getElementById('shape-info').textContent=preset.info;
    // Apply DSP
    if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1-preset.mix/100, audioCtx?.currentTime||0, 0.05);
    if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(preset.mix/100,   audioCtx?.currentTime||0, 0.05);
  }
  applyShapeCurve();
  if(isPlaying&&playMode==='after') setStatus('Shape: '+mode.toUpperCase()+' activo — ouve a diferença em PROCESSADO');
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
  if(piradexOn){ applyPiradexDSP(); return; }

  // Reset stereo to unity before any processing — prevents residual
  if(msSideGain) msSideGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.02);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0,  audioCtx.currentTime, 0.02);

  const {BASS:bass,CLEAN:clean,LOUD:loud,PUNCH:punch,FOCUS:focus,WIDE:wide}=kvals;

  // ── EQ: 50 = 0dB (no effect), each point = small dB change
  eqSub.gain.value    = (bass  - 50) * 0.18;  // ±9dB range
  eqBass.gain.value   = (bass  - 50) * 0.12;  // ±6dB
  eqLowNode.gain.value= (bass  - 50) * 0.06;  // ±3dB
  eqMid.gain.value    = (focus - 50) * 0.12;  // ±6dB
  eqHigh.gain.value   = (clean - 50) * 0.08;  // ±4dB
  eqAir.gain.value    = (clean - 50) * 0.08;  // ±4dB

  // ── Compressor: at PUNCH=50 → near-bypass (threshold very high, ratio 1:1)
  // PUNCH 0  = no compression (bypass)
  // PUNCH 50 = gentle glue (-20dB threshold, 2:1)
  // PUNCH 100= heavy compression (-40dB, 8:1)
  if(punch <= 10) {
    // Effectively bypass comp
    compNode.threshold.value = 0;
    compNode.ratio.value     = 1;
  } else {
    compNode.threshold.value = -40 * (punch/100);  // 0 to -40dB
    compNode.ratio.value     = 1 + (punch/100) * 7; // 1:1 to 8:1
    compNode.attack.value    = Math.max(0.001, 0.05 - (punch*0.0004));
    compNode.release.value   = Math.max(0.05,  0.4  - (punch*0.003));
    compNode.knee.value      = 6;
  }

  // ── Limiter: only active when LOUD > 60
  if(loud <= 50) {
    limiterNode.threshold.value = 0;
    limiterNode.ratio.value     = 1;
  } else {
    limiterNode.threshold.value = -1;
    limiterNode.ratio.value     = 20;
  }

  // ── Master gain calibrated so LOUD=65 ≈ -9 LUFS output
  // LOUD 50 = 1.0 (unity), LOUD 65 = 1.45 (~+3dB toward -9 LUFS)
  // LOUD 0  = 0.1 (near silence), LOUD 100 = 2.5 (max)
  const gainFactor = loud <= 50
    ? 0.1 + (loud/50) * 0.9    // 0→50: 0.1→1.0
    : 1.0 + ((loud-50)/50) * 1.5; // 50→100: 1.0→2.5
  masterGain.gain.setTargetAtTime(gainFactor, audioCtx.currentTime, 0.08);

  // ── Width via EQ — ABSOLUTE SET (not additive, prevents residual)
  // Store width contribution separately, apply as absolute offset
  const wDelta = (wide - 50) / 50; // -1 to +1
  // These are SET absolutely each call — no accumulation
  widthAirOffset  = wDelta * 2.0;
  widthHighOffset = wDelta * 1.2;
  // Applied below after base EQ so they don't compound

  if(bypassOn){
    [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
    compNode.threshold.value=0; compNode.ratio.value=1;
    limiterNode.threshold.value=0; limiterNode.ratio.value=1;
    if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
    if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.0,audioCtx.currentTime,0.02);
    masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
    syncEQSliders();
    updateLUFSDisplay();
    return; // stop here — nothing should overwrite bypass
  }

  // Apply width offsets on top of EQ (absolute, not additive)
  if(typeof widthAirOffset!=='undefined'){
    eqAir.gain.value  += widthAirOffset;
    eqHigh.gain.value += widthHighOffset;
  }

  // ── Re-enforce any active module bypasses ──────────────────────────────────
  // applyDSP overwrites node values, so we re-apply bypass state at the end
  if(moduleBypassState.eq){
    [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
  }
  if(moduleBypassState.comp){
    compNode.threshold.value=0; compNode.ratio.value=1;
  }
  if(moduleBypassState.limit){
    limiterNode.threshold.value=0; limiterNode.ratio.value=1;
  }
  if(moduleBypassState.shape){
    if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
    if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.0,audioCtx.currentTime,0.02);
  }
  if(moduleBypassState.loud){
    masterGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.05);
  }
  if(moduleBypassState.excite){
    eqAir.gain.value=0;
  }

  syncEQSliders();
  updateLUFSDisplay();
  _applyAdaptiveComp();
  _snapUndoThrottled();
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
  _snapUndoThrottled();
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
  _snapUndoThrottled();
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
  const bm=parseFloat(document.getElementById('width-bass-mono').value);
  document.getElementById('width-main-v').textContent=w+'%';
  document.getElementById('width-mid-v').textContent=(mid>=0?'+':'')+mid+' dB';
  document.getElementById('width-side-v').textContent=(side>=0?'+':'')+side+' dB';
  document.getElementById('width-bass-mono-v').textContent=bm+' Hz';
  document.getElementById('wm-fill').style.width=Math.min(100,w/2)+'%';
  if(!audioCtx) return;
  // SET (not add) — prevents residual noise on repeated changes
  // w=100 = unity, 0=narrow/mono, 200=max wide
  const wNorm = w/100; // 0=mono, 1=unity, 2=double-wide
  // Apply width via independent gain nodes
  if(msSideGain) msSideGain.gain.setTargetAtTime(Math.max(0, wNorm), audioCtx.currentTime, 0.08);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(Math.pow(10, mid/20), audioCtx.currentTime, 0.08);
  // High shelf for width perception — SET absolute value
  const wDelta=(wNorm-1)*3; // -3 to +3 dB
  eqAir.gain.setTargetAtTime( (eqAir.gain.value-lastWidthAirDelta||0)+wDelta, audioCtx.currentTime, 0.08);
  lastWidthAirDelta=wDelta;
  // Side EQ
  eqHigh.gain.setTargetAtTime( Math.max(-12,Math.min(12, side*0.5)), audioCtx.currentTime, 0.08);
  setStatus('Width: '+w+'% · Mid: '+(mid>=0?'+':'')+mid+'dB · Side: '+(side>=0?'+':'')+side+'dB · BassM: '+bm+'Hz');
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
  ['mid-low','mid-mid','mid-high','mid-comp','mid-gain','side-low','side-mid','side-high','side-comp','side-gain'].forEach(id=>{
    const v=get('ms-'+id);
    const el=document.getElementById('ms-'+id+'-v');
    if(el)el.textContent=(v>=0?'+':'')+v.toFixed(1)+' dB';
  });
  if(!audioCtx) return;

  const mLow=get('ms-mid-low'), mMid=get('ms-mid-mid'), mHigh=get('ms-mid-high');
  const mGain=get('ms-mid-gain');
  const sLow=get('ms-side-low'), sMid=get('ms-side-mid'), sHigh=get('ms-side-high');
  const sGain=get('ms-side-gain');
  const mComp=get('ms-mid-comp'), sComp=get('ms-side-comp');

  // Apply ADDITIVELY (not replace) — small factors to avoid volume collapse
  if(mLow!==0)  eqSub.gain.setTargetAtTime(eqSub.gain.value+mLow*0.2, audioCtx.currentTime, 0.1);
  if(mMid!==0)  eqMid.gain.setTargetAtTime(eqMid.gain.value+mMid*0.2, audioCtx.currentTime, 0.1);
  if(mHigh!==0) eqAir.gain.setTargetAtTime(eqAir.gain.value+mHigh*0.2, audioCtx.currentTime, 0.1);
  if(sLow!==0)  eqBass.gain.setTargetAtTime(eqBass.gain.value+sLow*0.15, audioCtx.currentTime, 0.1);
  if(sHigh!==0) eqHigh.gain.setTargetAtTime(eqHigh.gain.value+sHigh*0.15, audioCtx.currentTime, 0.1);

  // Gains: only apply if non-zero, keep reference at 1.0 (0dB) as baseline
  if(mGain!==0&&msMidGain)  msMidGain.gain.setTargetAtTime(Math.pow(10,mGain/20), audioCtx.currentTime, 0.15);
  if(sGain!==0&&msSideGain) msSideGain.gain.setTargetAtTime(Math.max(0.01,Math.pow(10,sGain/20)*(kvals.WIDE/100)), audioCtx.currentTime, 0.15);

  // Compressor threshold adjustment (delta only)
  if(mComp<0&&compNode) compNode.threshold.value=Math.max(-50, compNode.threshold.value+mComp*0.3);

  setStatus('M/S: Mid EQ '+mLow.toFixed(1)+'/'+(mMid>=0?'+':'')+mMid.toFixed(1)+'/'+mHigh.toFixed(1)+'dB · Side '+(sLow>=0?'+':'')+sLow.toFixed(1)+'/'+(sHigh>=0?'+':'')+sHigh.toFixed(1)+'dB');
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
  if(playMode!=='before'){
    setStatus('⚠️ Volta ao modo ORIGINAL para aplicar a referência');
    return;
  }
  initAudio(); // ensure audioCtx exists
  // Reset ALL DSP first
  resetAllDSP();
  resetModuleBypasses();
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

  refreshKnobs();
  // Apply EQ from refStats analysis
  if(audioCtx){
    // Apply reference-based EQ directly
    eqSub.gain.value    = refStats.lowR>0.4  ?  2.0 : refStats.lowR<0.1 ? -2.0 : 0.5;
    eqBass.gain.value   = refStats.lowR>0.35 ?  1.5 : 0.0;
    eqLowNode.gain.value= refStats.lowR>0.3  ?  1.0 : 0.0;
    eqMid.gain.value    = refStats.midR>0.1  ?  1.2 : 0.0;
    eqHigh.gain.value   = refStats.highR>0.05?  1.0 : 0.0;
    eqAir.gain.value    = refStats.highR>0.03?  0.8 : 0.0;
    // Gain for loudness matching
    const gainDb = Math.max(-6, Math.min(6, -9 - refStats.lufs));
    masterGain.gain.setTargetAtTime(Math.pow(10,gainDb/20), audioCtx.currentTime, 0.1);
  }
  syncEQSliders();
  setMode('after'); // switch to PROCESSADO
  setStatus('✓ Referência aplicada: '+refStats.name.replace(/\.[^.]+$/,'')+'  — em PROCESSADO · ajusta por cima');
}

// ===== FILE LOAD =====
function handleDrop(e){
  e.preventDefault(); document.getElementById('drop-zone').classList.remove('drag-over');
  if(e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
}
document.getElementById('sf').addEventListener('change',function(){if(this.files[0])loadFile(this.files[0]);});

function loadFile(file){
  headroomApplied=false;
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.add('headroom-locked'));
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
      document.getElementById('export-wrap').style.display='flex';
      const hb=document.getElementById('headroom-btn'); if(hb) hb.style.display='flex';
      const nb=document.getElementById('new-track-btn'); if(nb) nb.style.display='block';
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

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  if(playMode==='after'){
    // PROCESSADO: source → EQ chain → ... → analyser → out
    applyDSP();
    sourceNode.connect(eqSub);
  } else {
    // ORIGINAL: source → dryGain(1.0) → analyser → out
    // Completely bypasses all processing — bit-perfect
    sourceNode.connect(dryGain);
  }
  // Both paths already connect to analyserNode via buildChain

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
  // v=100 → factor=1.0 (unity, same as original)
  // v=0   → factor=0.0 (silence)
  // v=150 → factor=1.5 (monitoring boost only)
  const factor = v / 100;
  if(masterGain && audioCtx) masterGain.gain.setTargetAtTime(factor, audioCtx.currentTime, 0.05);
  if(dryGain    && audioCtx) dryGain.gain.setTargetAtTime(factor,    audioCtx.currentTime, 0.05);
  document.getElementById('vol-val').textContent = v + '%';
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
  if(!audioBuffer) { playMode=mode; updateModeUI(mode); return; }
  // Headroom button visibility
  const hb=document.getElementById('headroom-btn');
  if(hb){
    if(mode==='after'){
      hb.style.borderColor='rgba(255,227,53,0.5)';hb.style.background='rgba(255,227,53,0.08)';
      hb.style.color='var(--c3)';hb.style.cursor='pointer';hb.style.pointerEvents='auto';
      hb.style.animation='headroom-pulse 1.2s ease-in-out 3';
    } else {
      hb.style.borderColor='rgba(255,227,53,0.15)';hb.style.background='rgba(255,227,53,0.03)';
      hb.style.color='rgba(255,227,53,0.25)';hb.style.cursor='default';
      hb.style.pointerEvents='none';hb.style.animation='none';
    }
  }
  const was=isPlaying;
  const pos=was?(audioCtx.currentTime-startTime):pauseOffset;
  stopSource();
  isPlaying=false;
  pauseOffset=Math.max(0,Math.min(pos,audioBuffer.duration-0.01));
  playMode=mode;

  if(mode==='before'){
    // RESET ALL DSP to zero/bypass when going back to ORIGINAL
    resetAllDSP();
    resetModuleBypasses();
  }

  updateModeUI(mode);
  updateLUFSDisplay();
  if(was) setTimeout(()=>playAudio(),10);
}

function resetAllDSP(){
  if(!audioCtx) return;
  // Zero all EQ
  [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>{ if(f) f.gain.value=0; });
  // Bypass compressor
  if(compNode){ compNode.threshold.value=0; compNode.ratio.value=1; }
  // Bypass limiter
  if(limiterNode){ limiterNode.threshold.value=0; limiterNode.ratio.value=1; }
  // Unity master gain
  if(masterGain) masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  // Unity dry gain
  if(dryGain) dryGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  // Unity side/mid
  if(msSideGain) msSideGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0,  audioCtx.currentTime, 0.05);
  // Zero shape
  if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.05);
  // Reset width offsets
  widthAirOffset=0; widthHighOffset=0;
}

function updateModeUI(mode){
  document.getElementById('btn-before').classList.toggle('active',mode==='before');
  document.getElementById('btn-after').classList.toggle('active', mode==='after');
  const dot=document.getElementById('mode-dot'),txt=document.getElementById('mode-txt');
  const hb=document.getElementById('headroom-btn');
  if(mode==='before'){
    dot.className='mode-dot before';
    txt.textContent='ORIGINAL — sinal sem qualquer processamento';
    document.querySelectorAll('.tab').forEach(t=>{
      if(t.textContent.trim()!=='MASTER') t.style.opacity='0.4';
      else t.style.opacity='1';
    });
    // Hide headroom in ORIGINAL
    if(hb&&audioBuffer) hb.style.display='none';
  } else {
    dot.className='mode-dot after';
    const isHouse=curPreset==='house';
    txt.textContent='PROCESSADO — '+(PRESETS[curPreset]?.name||curPreset.toUpperCase())+' · alvo '+(isHouse?'-8':'-9')+' LUFS';
    document.querySelectorAll('.tab').forEach(t=>t.style.opacity='1');
    // Show headroom only in PROCESSADO
    if(hb&&audioBuffer) hb.style.display='flex';
  }
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
  // Use Uint8 for more reliable reading
  const freqData=new Uint8Array(binCount);
  analyserNode.getByteFrequencyData(freqData);
  const sr=audioCtx.sampleRate;
  const plotW=W-padL-padR;

  // Check if we're actually getting signal
  const maxVal=Math.max(...Array.from(freqData.slice(0,100)));
  if(maxVal<2){
    // No signal — draw idle
    idlePhase+=0.018;
    ctx.beginPath();
    for(let px=0;px<=plotW;px++){
      const t=px/plotW;
      const db=-62+10*Math.sin(t*9+idlePhase)+5*Math.sin(t*22-idlePhase*1.3);
      const y=dbToY(db,H,padT,padB);
      px===0?ctx.moveTo(padL+px,y):ctx.lineTo(padL+px,y);
    }
    const ig=ctx.createLinearGradient(padL,0,W-padR,0);
    ig.addColorStop(0,'#ff3ab540');ig.addColorStop(0.5,'#b855f740');ig.addColorStop(1,'#2dff8a40');
    ctx.strokeStyle=ig; ctx.lineWidth=1.5; ctx.stroke();
    return;
  }

  // Build per-pixel values from 0-255 → dB scale
  const dbVals=new Float32Array(plotW);
  for(let px=0;px<plotW;px++){
    const t=px/plotW;
    const freq=Math.pow(10,Math.log10(20)+(Math.log10(20000)-Math.log10(20))*t);
    const bin=Math.min(binCount-1,Math.round(freq/(sr/2)*binCount));
    let sum=0,cnt=0;
    for(let b=Math.max(0,bin-1);b<=Math.min(binCount-1,bin+1);b++){sum+=freqData[b];cnt++;}
    const avg=cnt>0?sum/cnt:0;
    // Convert 0-255 to dB: 255=-0dB, 0=-90dB
    const db=avg>0?(avg/255)*90-90:-90;
    // Smooth
    if(!specSmooth[px]) specSmooth[px]=db;
    specSmooth[px]=db>specSmooth[px]?specSmooth[px]*0.3+db*0.7:specSmooth[px]*0.85+db*0.15;
    dbVals[px]=specSmooth[px];
    // Peak
    if(db>specPeaks[px]) specPeaks[px]=db;
    else specPeaks[px]=Math.max(-90,specPeaks[px]-0.4);
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
  if(lfl)lfl.style.width=Math.min(100,vuL*110)+'%';
  if(lfr)lfr.style.width=Math.min(100,vuR*110)+'%';
  // Phase correlation meter
  _calcPhaseCorrelation();
  // GR meter real
  if(compNode&&audioCtx){
    const gr=compNode.reduction||0;
    const grFill=document.getElementById('gr-fill-live');
    if(grFill) grFill.style.width=Math.min(100,Math.abs(gr)*4)+'%';
    const grVal=document.getElementById('gr-val-live');
    if(grVal) grVal.textContent=gr.toFixed(1)+' dB';
  }
  // Spectral balance overlay (every 30 frames)
  if(isPlaying&&audioCtx) _drawSpectralBalance();
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
  if(audioBuffer && !headroomApplied){
    const hb=document.getElementById('headroom-btn');
    if(hb){hb.style.boxShadow='0 0 0 3px var(--c3),0 0 20px var(--c3)';hb.style.transform='scale(1.1)';
      setTimeout(()=>{hb.style.boxShadow='';hb.style.transform='';},1800);}
    let peak=0;
    for(let c=0;c<audioBuffer.numberOfChannels;c++){const d=audioBuffer.getChannelData(c);for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));}
    const peakDb=peak>0?20*Math.log10(peak):0;const gainNeeded=-6-peakDb;const dir=gainNeeded>=0?'+':'';
    setStatus('⚠ Aplica o HEADROOM -6dB primeiro! Pico: '+peakDb.toFixed(1)+' dBFS → vai aplicar '+dir+gainNeeded.toFixed(1)+' dB');
    return;
  }
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
  resetModuleBypasses();
  if(key==='suno'&&audioCtx){
    compNode.threshold.value=-45;compNode.ratio.value=6;compNode.attack.value=0.004;compNode.release.value=0.18;compNode.knee.value=8;
    limiterNode.threshold.value=-1.0;limiterNode.ratio.value=20;limiterNode.attack.value=0.001;limiterNode.release.value=0.05;limiterNode.knee.value=0;
    if(playMode==='before') setMode('after');
  }
  refreshKnobs(); updateSugs(p.sugs); applyDSP(); syncEQSliders();
  const lufsTarget=key==='house'?'-8':'-9';
  setStatus('Preset '+p.name+' aplicado · Alvo '+lufsTarget+' LUFS');
}

function _updateSugDataCards(){
  // Update the analysis data cards under suggestions
  if(!audioBuffer) return;
  const plr=_calcPLR(audioBuffer);
  if(plr){
    const pl=document.getElementById('sug-plr');
    const pk=document.getElementById('sug-peak');
    if(pl){ pl.textContent=plr.plr.toFixed(1)+' dB'; pl.style.color=plr.plr>12?'#2dff8a':plr.plr>6?'#ffe135':'#ff4500'; }
    if(pk){ pk.textContent=plr.peakDb.toFixed(1)+' dB'; pk.style.color=plr.peakDb>-3?'#ff4500':plr.peakDb>-6?'#ffe135':'#2dff8a'; }
  }
  const lufsEl=document.getElementById('sug-lufs');
  const lufsN=document.getElementById('lufs-n');
  if(lufsEl&&lufsN) lufsEl.textContent=lufsN.textContent;
  // Phase
  const phaseEl=document.getElementById('sug-phase');
  const phaseVal=document.getElementById('phase-corr-val');
  if(phaseEl&&phaseVal){
    const v=parseFloat(phaseVal.textContent)||0;
    phaseEl.textContent=v.toFixed(2);
    phaseEl.style.color=v>0.3?'#2dff8a':v>-0.1?'#ffe135':'#ff4500';
  }
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
  // Piradex only activates in ORIGINAL mode
  if(!piradexOn && playMode!=='before'){
    setStatus('Muda para ORIGINAL antes de activar o Piradex');
    return;
  }
  piradexOn=!piradexOn;
  const btn=document.getElementById('pira-btn');
  if(piradexOn){
    // Save current state completely
    savedKvals={...kvals};
    savedEQ = audioCtx ? {
      sub:eqSub.gain.value, bass:eqBass.gain.value, low:eqLowNode.gain.value,
      mid:eqMid.gain.value, high:eqHigh.gain.value, air:eqAir.gain.value
    } : null;

    // Set PIRADEX knob values
    kvals.CLEAN=30; kvals.BASS=12; kvals.LOUD=25;
    kvals.WIDE=22;  kvals.PUNCH=35; kvals.FOCUS=40;
    refreshKnobs();

    btn.classList.add('on');
    btn.textContent='⚡ MASTERING BY PIRADEX — ATIVO ⚡';

    // Show modal first
    document.getElementById('piradex-modal').style.display='flex';
    runPiradexAI();

    // Switch to PROCESSADO so user hears the result
    setMode('after');
  } else {
    btn.classList.remove('on');
    btn.textContent='⚡ MASTERING BY PIRADEX ⚡';
    piradexOn=false;
    closePiradexModal();
    // Restore
    if(savedKvals) Object.assign(kvals,savedKvals);
    if(savedEQ&&audioCtx){
      eqSub.gain.value=savedEQ.sub; eqBass.gain.value=savedEQ.bass; eqLowNode.gain.value=savedEQ.low;
      eqMid.gain.value=savedEQ.mid; eqHigh.gain.value=savedEQ.high; eqAir.gain.value=savedEQ.air;
    }
    refreshKnobs(); syncEQSliders(); applyDSP();
    setMode('before');
    setStatus('Mastering by Piradex desactivado — preset restaurado');
  }
}

function applyPiradexDSP(){
  if(!audioCtx) return;
  // PIRADEX: clean, transparent EQ — no stereo widening
  // Zero everything first
  [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
  // Apply gentle EQ only
  eqSub.gain.value     =  1.5;  // sub warmth
  eqBass.gain.value    =  1.0;  // bass body
  eqLowNode.gain.value = -0.5;  // clean low mids
  eqMid.gain.value     =  0.8;  // presence
  eqHigh.gain.value    =  0.5;  // clarity
  eqAir.gain.value     =  0.8;  // air
  // Gentle compressor — glue only, not crush
  compNode.threshold.value=-18; compNode.ratio.value=2.5;
  compNode.attack.value=0.030;  compNode.release.value=0.30; compNode.knee.value=12;
  // Limiter
  limiterNode.threshold.value=-1; limiterNode.ratio.value=20;
  limiterNode.attack.value=0.001; limiterNode.release.value=0.05;
  // Master gain for -9 LUFS — unity-based
  masterGain.gain.setTargetAtTime(1.4, audioCtx.currentTime, 0.1);
  // Shape: TAPE very subtle — dry dominant
  if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(0.88, audioCtx.currentTime, 0.05);
  if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.05);
  if(shapeWS) shapeWS.curve=makeShapeCurve('tape', 0.08);
  // NO stereo changes — msSideGain stays at 1.0
  if(msSideGain) msSideGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
  // Reset width offsets
  widthAirOffset=0; widthHighOffset=0;
  syncEQSliders();
  updateLUFSDisplay();
  setStatus('MASTERING BY PIRADEX ATIVO — -9 LUFS · alterna ORIGINAL/PROCESSADO para comparar');
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
// lamejs loader
let _lamejsLoaded=false;
function _loadLamejs(cb){
  if(_lamejsLoaded){cb();return;}
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
  s.onload=()=>{_lamejsLoaded=true;cb();};
  s.onerror=()=>cb(new Error('lamejs nao carregou'));
  document.head.appendChild(s);
}

async function _originalExport(){
  if(!audioBuffer){setStatus('Carrega um ficheiro primeiro');return;}
  const btn=document.getElementById('export-btn');
  const fmt=(document.getElementById('export-fmt')||{}).value||'wav';
  const dither=document.getElementById('export-dither')?.checked!==false;
  btn.style.opacity='0.5';btn.style.pointerEvents='none';
  setStatus('A renderizar'+( fmt==='mp3'?' MP3 320kbps':' WAV')+'...');
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
    // True peak limiter — hard brickwall -1 dBTP
    const oLim=offCtx.createDynamicsCompressor();
    oLim.threshold.value=-1.0;oLim.ratio.value=20;oLim.attack.value=0.001;oLim.release.value=0.05;oLim.knee.value=0;
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
    let normalized=normalizeLUFS(rendered,isHouse?0.224:0.178);
    // Measure true LUFS BS.1770
    const trueLUFS=_measureLUFS_BS1770(normalized);
    // Apply TPDF dither before 16-bit conversion
    if(dither&&fmt==='wav') normalized=_applyDither(normalized,16);
    const baseName=(document.getElementById('track-name').textContent||'audio')+'_PIRADEX_MASTERED';
    const lufsInfo=trueLUFS?(' · '+trueLUFS.toFixed(1)+' LUFS'):'';
    if(fmt==='mp3'){
      await new Promise((resolve,reject)=>_loadLamejs(e=>e?reject(e):resolve()));
      setStatus('A codificar MP3 320kbps...');
      const nChOut=Math.min(nCh,2);
      const mp3enc=new lamejs.Mp3Encoder(nChOut,sr,320);
      const blockSize=1152;const mp3Data=[];
      const toPCM16=(ch)=>{const f=normalized.getChannelData(ch);const s=new Int16Array(f.length);for(let i=0;i<f.length;i++)s[i]=Math.max(-32768,Math.min(32767,f[i]*32767));return s;};
      const pcmL=toPCM16(0);const pcmR=nChOut>1?toPCM16(1):pcmL;
      for(let i=0;i<pcmL.length;i+=blockSize){
        const blkL=pcmL.subarray(i,i+blockSize);const blkR=pcmR.subarray(i,i+blockSize);
        const buf=nChOut>1?mp3enc.encodeBuffer(blkL,blkR):mp3enc.encodeBuffer(blkL);
        if(buf.length>0) mp3Data.push(buf);
      }
      const final=mp3enc.flush();if(final.length>0) mp3Data.push(final);
      const blob=new Blob(mp3Data,{type:'audio/mpeg'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
      a.download=baseName+'.mp3';a.click();URL.revokeObjectURL(url);
      setStatus('✓ MP3 320kbps exportado'+lufsInfo+' · Nota: MP3 e lossy — WAV preserva qualidade total');
    } else {
      const wav=encodeWAV(normalized);
      const blob=new Blob([wav],{type:'audio/wav'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
      a.download=baseName+'.wav';a.click();URL.revokeObjectURL(url);
      setStatus('✓ WAV exportado'+lufsInfo+(dither?' · TPDF dither aplicado':''));
    }
  }catch(err){setStatus('Erro na exportacao: '+err.message);console.error(err);}
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


// ===== SPECTRAL BALANCE OVERLAY (Feat 7) =====
let _specBalFrame=0;
function _drawSpectralBalance(){
  _specBalFrame++;
  if(_specBalFrame%6!==0) return; // every 6 frames ~10fps
  const canvas=document.getElementById('spec-balance-canvas');
  if(!canvas||!analyserNode) return;
  const W=canvas.offsetWidth||300, H=canvas.height||40;
  if(canvas.width!==W) canvas.width=W;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  // Get frequency data
  const fd=new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(fd);
  const sr=audioCtx?.sampleRate||44100;
  const binHz=sr/(analyserNode.fftSize);
  let lowE=0,midE=0,highE=0;
  for(let i=0;i<fd.length;i++){
    const f=i*binHz;
    const v=(fd[i]/255)**2;
    if(f<300) lowE+=v;
    else if(f<4000) midE+=v;
    else highE+=v;
  }
  const tot=lowE+midE+highE||1;
  const lowPct=lowE/tot*100, midPct=midE/tot*100, highPct=highE/tot*100;
  // Draw bars
  const bw=W/3-4;
  [[lowPct,'#b855f7','LOW'],[midPct,'#2dd4ff','MID'],[highPct,'#2dff8a','HIGH']].forEach(([pct,col,lbl],i)=>{
    const x=i*(W/3)+2;
    ctx.fillStyle='#1a1a28'; ctx.fillRect(x,0,bw,H-12);
    ctx.fillStyle=col+'88'; ctx.fillRect(x,H-12-(pct/100)*(H-12),bw,(pct/100)*(H-12));
    ctx.fillStyle=col; ctx.font='bold 8px Rajdhani,sans-serif'; ctx.textAlign='center';
    ctx.fillText(lbl+' '+pct.toFixed(0)+'%',x+bw/2,H-2);
    // Update suggestion cards
    const ids=[['sug-low-bar','sug-low-pct'],['sug-mid-bar','sug-mid-pct'],['sug-high-bar','sug-high-pct']];
    const bars=document.getElementById(ids[i][0]),lblEl=document.getElementById(ids[i][1]);
    if(bars) bars.style.width=pct.toFixed(0)+'%';
    if(lblEl) lblEl.textContent=pct.toFixed(0)+'%';
  });
  // Target overlay from current preset
  const target=SPECTRAL_TARGETS[curPreset];
  if(target){
    [[target.low,'#b855f750'],[target.mid,'#2dd4ff50'],[target.high,'#2dff8a50']].forEach(([pct,col],i)=>{
      const x=i*(W/3)+2;
      const ty=H-12-(pct/100)*(H-12);
      ctx.strokeStyle=col.replace('50','ff'); ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(x,ty); ctx.lineTo(x+bw,ty); ctx.stroke();
      ctx.setLineDash([]);
    });
  }
  // Update PLR display
  const plr=_calcPLR(audioBuffer);
  if(plr){
    const plrEl=document.getElementById('plr-val');
    if(plrEl){
      const color=plr.plr>12?'#2dff8a':plr.plr>6?'#ffe135':'#ff4500';
      plrEl.textContent=plr.plr.toFixed(1)+' dB'; plrEl.style.color=color;
    }
    const plrBar=document.getElementById('plr-bar');
    if(plrBar){ plrBar.style.width=Math.min(100,plr.plr/20*100)+'%'; }
  }
}

// ===== I/O GAIN CONTROLS =====
let ioDragType='', ioDragSY=0, ioDragSV=0;
let inputGainDb=0, outputGainDb=0;

// ── NEW: Professional meters & DSP modules ────────────────────────────────
// Undo history (Feat 6)
let undoStack=[], redoStack=[], _undoThrottle=null;
function _snapUndo(){
  if(!audioCtx) return;
  const snap={eq:{sub:eqSub?.gain.value||0,bass:eqBass?.gain.value||0,low:eqLowNode?.gain.value||0,
    mid:eqMid?.gain.value||0,high:eqHigh?.gain.value||0,air:eqAir?.gain.value||0},
    knobs:{...kvals}, comp:{thr:compNode?.threshold.value||0,ratio:compNode?.ratio.value||1},
    limiter:{thr:limiterNode?.threshold.value||0}, masterGain:masterGain?.gain.value||1};
  undoStack.push(snap); if(undoStack.length>30) undoStack.shift(); redoStack=[];
  _updateUndoUI();
}
function _restoreSnap(snap){
  if(!audioCtx||!snap) return;
  Object.assign(kvals,snap.knobs);
  eqSub.gain.value=snap.eq.sub; eqBass.gain.value=snap.eq.bass; eqLowNode.gain.value=snap.eq.low;
  eqMid.gain.value=snap.eq.mid; eqHigh.gain.value=snap.eq.high; eqAir.gain.value=snap.eq.air;
  compNode.threshold.value=snap.comp.thr; compNode.ratio.value=snap.comp.ratio;
  limiterNode.threshold.value=snap.limiter.thr;
  masterGain.gain.setTargetAtTime(snap.masterGain, audioCtx.currentTime, 0.05);
  syncEQSliders(); refreshKnobs(); _updateUndoUI();
}
function undoAction(){if(!undoStack.length) return; redoStack.push(undoStack.pop()); _restoreSnap(undoStack[undoStack.length-1]); setStatus('UNDO — '+undoStack.length+' estados guardados');}
function redoAction(){if(!redoStack.length) return; const s=redoStack.pop(); undoStack.push(s); _restoreSnap(s); setStatus('REDO');}
function _updateUndoUI(){
  const u=document.getElementById('undo-btn'),r=document.getElementById('redo-btn');
  if(u){u.style.opacity=undoStack.length?'1':'0.3';u.style.pointerEvents=undoStack.length?'auto':'none';}
  if(r){r.style.opacity=redoStack.length?'1':'0.3';r.style.pointerEvents=redoStack.length?'auto':'none';}
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();undoAction();}
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();redoAction();}
});

// Phase correlation (Feat 4)
let _corrValue=0, _corrSmooth=0;
function _calcPhaseCorrelation(){
  if(!analyserNode||!isPlaying) return;
  const td=new Float32Array(analyserNode.fftSize);
  analyserNode.getFloatTimeDomainData(td);
  const half=Math.floor(td.length/2);
  let sumLR=0,sumL2=0,sumR2=0;
  for(let i=0;i<half;i++){
    const L=td[i],R=td[i+half]||td[i];
    sumLR+=L*R; sumL2+=L*L; sumR2+=R*R;
  }
  const denom=Math.sqrt(sumL2*sumR2)||1;
  _corrValue=Math.max(-1,Math.min(1,sumLR/denom));
  _corrSmooth=_corrSmooth*0.85+_corrValue*0.15;
  _drawCorrelationMeter(_corrSmooth);
}
function _drawCorrelationMeter(v){
  const el=document.getElementById('phase-corr-fill');
  const lbl=document.getElementById('phase-corr-val');
  if(!el) return;
  const pct=((v+1)/2)*100;
  el.style.width=pct+'%';
  const color=v>0.3?'#2dff8a':v>-0.1?'#ffe135':'#ff4500';
  el.style.background=color;
  if(lbl) lbl.textContent=v.toFixed(2);
  const warn=document.getElementById('phase-warn');
  if(warn) warn.style.display=v<-0.1?'block':'none';
}

// True LUFS ITU-R BS.1770-4 (Feat 5)
let _kWeightL=null, _kWeightH=null;
function _initKWeighting(ctx){
  if(_kWeightL) return;
  _kWeightL=ctx.createBiquadFilter(); _kWeightL.type='highshelf';
  _kWeightL.frequency.value=1681; _kWeightL.gain.value=4.0;
  _kWeightH=ctx.createBiquadFilter(); _kWeightH.type='highpass';
  _kWeightH.frequency.value=38.13; _kWeightH.Q.value=0.5;
}
let _lufsIntBuf=[], _lufsIntTimer=null;
function _measureLUFS_BS1770(buffer){
  if(!audioCtx) return null;
  _initKWeighting(audioCtx);
  // offline measurement
  const nCh=buffer.numberOfChannels, len=buffer.length, sr=buffer.sampleRate;
  const blockSize=Math.round(sr*0.4); // 400ms blocks
  const hopSize=Math.round(sr*0.1);   // 100ms hop
  const G=[1,1,1,1.41,1.41]; // channel weights (L,R,C,Ls,Rs)
  let blocks=[];
  for(let start=0;start+blockSize<=len;start+=hopSize){
    let sum=0;
    for(let c=0;c<Math.min(nCh,5);c++){
      const d=buffer.getChannelData(c);
      let sq=0;
      for(let i=start;i<start+blockSize;i++) sq+=d[i]*d[i];
      sum+=(G[c]||1)*(sq/blockSize);
    }
    const lk=-0.691+10*Math.log10(sum||1e-10);
    if(lk>-70) blocks.push(lk);
  }
  if(!blocks.length) return -70;
  // Gating: absolute -70 LUFS already done, relative gate at -10 LU below ungated mean
  const ungated=10*Math.log10(blocks.reduce((a,b)=>a+Math.pow(10,b/10),0)/blocks.length);
  const gate=ungated-10;
  const gated=blocks.filter(b=>b>=gate);
  if(!gated.length) return ungated;
  return 10*Math.log10(gated.reduce((a,b)=>a+Math.pow(10,b/10),0)/gated.length);
}

// Transient Shaper (Feat 9)
let _transientNode=null, _transientDry=null, _transientWet=null;
let _transientAttack=50, _transientSustain=50;
function _initTransient(){
  if(_transientNode||!audioCtx) return;
  _transientNode=audioCtx.createDynamicsCompressor();
  _transientNode.threshold.value=-40; _transientNode.ratio.value=4;
  _transientNode.attack.value=0.001; _transientNode.release.value=0.2;
  _transientNode.knee.value=6;
}
function updateTransient(){
  const a=parseFloat(document.getElementById('trans-attack')?.value||50);
  const s=parseFloat(document.getElementById('trans-sustain')?.value||50);
  const av=document.getElementById('trans-attack-v'), sv=document.getElementById('trans-sustain-v');
  if(av) av.textContent=(a>=50?'+':'')+(a-50)+'%';
  if(sv) sv.textContent=(s>=50?'+':'')+(s-50)+'%';
  _transientAttack=a; _transientSustain=s;
  if(!_transientNode||!audioCtx) return;
  // Attack: controls how fast transients pass through (lower = more punch)
  const atkMs=Math.max(0.001, 0.05*(1-(a-50)/100));
  const relMs=Math.max(0.05,  0.3*(s/100));
  _transientNode.attack.value=atkMs;
  _transientNode.release.value=relMs;
  const ratio=1+(a/50)*6;
  _transientNode.ratio.value=ratio;
  _snapUndoThrottled();
  setStatus('Transient shaper: Attack '+(a>=50?'+':'')+(a-50)+'% · Sustain '+(s>=50?'+':'')+(s-50)+'%');
}

// Dithering (Feat 11)
function _applyDither(buf, bits){
  const nCh=buf.numberOfChannels, len=buf.length;
  const step=2/Math.pow(2,bits);
  for(let c=0;c<nCh;c++){
    const d=buf.getChannelData(c);
    for(let i=0;i<len;i++){
      // TPDF dither: sum of two uniform random numbers = triangular PDF
      const tpdf=(Math.random()-Math.random())*step;
      d[i]=Math.max(-0.999,Math.min(0.999,d[i]+tpdf));
    }
  }
  return buf;
}

// Multiband compressor (Feat 3) — 3 bands via parallel BPF
let _mbLow=null,_mbMid=null,_mbHigh=null;
let _mbLowComp=null,_mbMidComp=null,_mbHighComp=null;
let _mbMixer=null;
let mbActive=false;
function _initMultiband(){
  if(_mbLow||!audioCtx) return;
  const mk=(t,f,g,Q)=>{const n=audioCtx.createBiquadFilter();n.type=t;n.frequency.value=f;n.gain.value=g||0;if(Q)n.Q.value=Q;return n;};
  _mbLow  = mk('lowpass',  250,0,0.7);
  _mbMid  = mk('bandpass', 2000,0,0.8);
  _mbHigh = mk('highpass', 6000,0,0.7);
  const mkComp=(thr,ratio)=>{const c=audioCtx.createDynamicsCompressor();c.threshold.value=thr;c.ratio.value=ratio;c.attack.value=0.005;c.release.value=0.12;c.knee.value=6;return c;};
  _mbLowComp  = mkComp(-24,3);
  _mbMidComp  = mkComp(-20,2.5);
  _mbHighComp = mkComp(-18,2);
  _mbMixer=audioCtx.createGain(); _mbMixer.gain.value=1;
}
function updateMultiband(){
  const active=document.getElementById('mb-toggle')?.checked;
  mbActive=active||false;
  if(!active||!audioCtx) return;
  _initMultiband();
  const get=id=>parseFloat(document.getElementById(id)?.value||0);
  ['low','mid','high'].forEach(band=>{
    const thr=get('mb-'+band+'-thr');
    const ratio=get('mb-'+band+'-ratio');
    const comp={low:_mbLowComp,mid:_mbMidComp,high:_mbHighComp}[band];
    const vT=document.getElementById('mb-'+band+'-thr-v');
    const vR=document.getElementById('mb-'+band+'-ratio-v');
    if(vT) vT.textContent=thr+' dB';
    if(vR) vR.textContent=ratio+':1';
    if(comp&&audioCtx){comp.threshold.value=thr;comp.ratio.value=ratio;}
  });
  _snapUndoThrottled();
  setStatus('Multiband COMP activo: Low/Mid/High independentes');
}

// PLR (Peak to Loudness Ratio — Feat 13)
function _calcPLR(buffer){
  if(!buffer) return null;
  let peak=0,sq=0,cnt=0;
  for(let c=0;c<buffer.numberOfChannels;c++){
    const d=buffer.getChannelData(c);
    for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>peak)peak=v;sq+=v*v;cnt++;}
  }
  const rms=Math.sqrt(sq/cnt);
  const peakDb=peak>0?20*Math.log10(peak):-70;
  const rmsDb=rms>0?20*Math.log10(rms):-70;
  return {plr:Math.max(0,peakDb-rmsDb), peakDb, rmsDb};
}

// Spectral Balance overlay (Feat 7) — genre target curves
const SPECTRAL_TARGETS={
  kizomba:  {low:38,mid:38,high:24,desc:'Graves quentes + mids presentes'},
  kuduro:   {low:52,mid:30,high:18,desc:'Sub dominante, agudos controlados'},
  zouk:     {low:48,mid:32,high:20,desc:'Sub profundo + mids romantismo'},
  gzouk:    {low:36,mid:44,high:20,desc:'Low-mids corpo + groove urbano'},
  semba:    {low:42,mid:38,high:20,desc:'Bass quente + alma angolana'},
  afrohouse:{low:55,mid:28,high:17,desc:'Sub extremo + dancefloor'},
  rnb:      {low:28,mid:40,high:32,desc:'Voz no topo + polido'},
  afrobeats:{low:45,mid:35,high:20,desc:'Sub pesado + groove colorido'},
  amapiano: {low:35,mid:42,high:23,desc:'Log drum + piano suave'},
  dancehall:{low:25,mid:42,high:33,desc:'Riddim + voz presente'},
  reggaeton:{low:48,mid:32,high:20,desc:'Sub dembow + kick profundo'},
  kompa:    {low:38,mid:38,high:24,desc:'Graves profundos + romantismo'},
  house:    {low:52,mid:28,high:20,desc:'Sub dominante + kick 4x4'},
  suno:     {low:30,mid:38,high:32,desc:'AI clean + ar e presenca'},
};

// Adaptive attack/release (Feat 8)
function _applyAdaptiveComp(){
  if(!audioCtx||!compNode||!audioBuffer) return;
  // Measure transient density from FFT
  const td=new Float32Array(analyserNode?.fftSize||2048);
  if(analyserNode) analyserNode.getFloatTimeDomainData(td);
  let transients=0;
  for(let i=1;i<td.length-1;i++){
    if(Math.abs(td[i])>0.3&&Math.abs(td[i])>Math.abs(td[i-1])&&Math.abs(td[i])>Math.abs(td[i+1])) transients++;
  }
  const density=transients/td.length;
  // Dense transients (percussive) = faster attack/release
  const atkBase=density>0.01?0.003:0.015;
  const relBase=density>0.01?0.08:0.25;
  compNode.attack.value=Math.max(0.001,atkBase*(1-(kvals.PUNCH-50)/200));
  compNode.release.value=Math.max(0.05,relBase*(1+(kvals.PUNCH-50)/100));
}

function _snapUndoThrottled(){
  clearTimeout(_undoThrottle);
  _undoThrottle=setTimeout(_snapUndo, 600);
}
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
  const inFactor  = inputGainDb  <= -60 ? 0 : Math.pow(10, inputGainDb/20);
  const outFactor = outputGainDb <= -60 ? 0 : Math.pow(10, outputGainDb/20);
  // Input: controls dryGain (ORIGINAL) and pre-EQ level (PROCESSADO)
  dryGain.gain.setTargetAtTime(inFactor, audioCtx.currentTime, 0.05);
  // Output: controls masterGain absolute level
  const baseGain = piradexOn ? 1.8 : (() => {
    const loud=kvals.LOUD;
    return loud<=50 ? 0.35+(loud/50)*0.65 : 1.0+((loud-50)/50)*1.0;
  })();
  masterGain.gain.setTargetAtTime(baseGain * outFactor, audioCtx.currentTime, 0.05);
}

function applyHeadroom(){
  // Headroom: only in PROCESSADO, reduces output to reach -6 dBFS peak
  if(!audioBuffer){ setStatus('Carrega uma faixa primeiro'); return; }
  if(playMode!=='after'){ setStatus('Muda para PROCESSADO para usar o Headroom'); return; }
  // Measure peak across all channels
  let peak = 0;
  for(let c=0;c<audioBuffer.numberOfChannels;c++){
    const data=audioBuffer.getChannelData(c);
    for(let i=0;i<data.length;i++) peak=Math.max(peak,Math.abs(data[i]));
  }
  if(peak<=0){ setStatus('Áudio silencioso'); return; }
  const targetPeak = 0.501; // -6 dBFS
  const gainNeeded = targetPeak / peak;
  const gainDb = 20 * Math.log10(gainNeeded);
  // Apply via outputGainDb (on top of masterGain)
  outputGainDb = Math.max(-24, Math.min(6, gainDb));
  applyIOGain();
  updateIODisplay();
  const peakDbH=20*Math.log10(peak);const dirH=gainDb>=0?'+':'';
  setStatus('HEADROOM -6dBFS: pico '+peakDbH.toFixed(1)+' dBFS → '+dirH+gainDb.toFixed(1)+' dB aplicado · presets desbloqueados');
  headroomApplied=true;
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('headroom-locked'));
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
  setStatus('MODO DEMO · '+exportCount+'/'+FREE_EXPORTS+' exportações usadas · subscreve para continuar');
}


// ===== NEW TRACK UPLOAD =====
function newTrackUpload(){
  stopAudio();
  audioBuffer=null; refBuffer=null; refStats=null;
  document.getElementById('drop-zone').style.display='flex';
  document.getElementById('waveform-wrap').style.display='none';
  document.getElementById('export-wrap').style.display='none';
  const hb=document.getElementById('headroom-btn'); if(hb) hb.style.display='none';
  document.getElementById('new-track-btn').style.display='none';
  // Reset to original mode
  playMode='before'; updateModeUI('before');
  // Reset IO
  inputGainDb=0; outputGainDb=0; updateIODisplay();
  setStatus('Pronto para nova faixa');
  // Open file dialog
  document.getElementById('sf').click();
}


// ===== EDITABLE VALUE INPUTS =====
function makeEditable(el, callback, min, max, suffix){
  el.title='Clica para editar o valor';
  el.style.cursor='text';
  el.addEventListener('dblclick',()=>{
    const current=parseFloat(el.textContent)||0;
    const input=document.createElement('input');
    input.type='number'; input.min=min; input.max=max; input.step='0.1';
    input.value=current;
    input.style.cssText='width:55px;background:var(--bg3);border:1px solid var(--c1);border-radius:3px;color:var(--text);font-family:Orbitron,monospace;font-size:10px;padding:2px 4px;text-align:center;';
    el.replaceWith(input); input.focus(); input.select();
    const finish=()=>{
      const val=Math.max(min,Math.min(max,parseFloat(input.value)||0));
      el.textContent=(val>=0&&suffix!=='dB'?'':val>=0?'+':'')+val.toFixed(suffix==='%'?0:1)+(suffix||'');
      input.replaceWith(el);
      callback(val);
    };
    input.addEventListener('blur',finish);
    input.addEventListener('keydown',e=>{if(e.key==='Enter')finish();if(e.key==='Escape'){input.replaceWith(el);}});
  });
}


// ===== MODULE BYPASS SYSTEM =====
const moduleBypassState = {eq:false, comp:false, dyn:false, shape:false, width:false, excite:false, loud:false, limit:false, midside:false};

// Saved values for each bypassed module
const moduleBypassSaved = {};

function toggleModuleBypass(module){
  moduleBypassState[module] = !moduleBypassState[module];
  const btn = document.getElementById('bypass-'+module);
  const active = moduleBypassState[module];
  if(btn){
    btn.classList.toggle('bypass-active', active);
    btn.textContent = active ? 'BYPASSED' : 'BYPASS';
    btn.style.borderColor = active ? '#ff3ab5' : '';
    btn.style.color       = active ? '#ff3ab5' : '';
    btn.style.background  = active ? 'rgba(255,58,181,0.12)' : '';
  }
  applyModuleBypass(module, active);
  applyDSP(); // re-enforce all active bypasses
}

function applyModuleBypass(module, bypassed){
  if(!audioCtx) return;
  switch(module){
    case 'eq':
      if(bypassed){
        moduleBypassSaved.eq = {sub:eqSub.gain.value,bass:eqBass.gain.value,low:eqLowNode.gain.value,mid:eqMid.gain.value,high:eqHigh.gain.value,air:eqAir.gain.value};
        [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
      } else if(moduleBypassSaved.eq) {
        const s=moduleBypassSaved.eq;
        eqSub.gain.value=s.sub;eqBass.gain.value=s.bass;eqLowNode.gain.value=s.low;
        eqMid.gain.value=s.mid;eqHigh.gain.value=s.high;eqAir.gain.value=s.air;
      }
      break;
    case 'comp':
      if(bypassed){
        moduleBypassSaved.comp={thr:compNode.threshold.value,ratio:compNode.ratio.value,atk:compNode.attack.value,rel:compNode.release.value};
        compNode.threshold.value=0; compNode.ratio.value=1;
      } else if(moduleBypassSaved.comp){
        const s=moduleBypassSaved.comp;
        compNode.threshold.value=s.thr;compNode.ratio.value=s.ratio;compNode.attack.value=s.atk;compNode.release.value=s.rel;
      }
      break;
    case 'limit':
      if(bypassed){
        moduleBypassSaved.limit={thr:limiterNode.threshold.value,ratio:limiterNode.ratio.value};
        limiterNode.threshold.value=0;limiterNode.ratio.value=1;
      } else if(moduleBypassSaved.limit){
        limiterNode.threshold.value=moduleBypassSaved.limit.thr;
        limiterNode.ratio.value=moduleBypassSaved.limit.ratio;
      }
      break;
    case 'shape':
      if(bypassed){
        moduleBypassSaved.shape={dry:shapeDryGain.gain.value,wet:shapeWetGain.gain.value};
        shapeDryGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
        shapeWetGain.gain.setTargetAtTime(0.0,audioCtx.currentTime,0.02);
      } else if(moduleBypassSaved.shape){
        shapeDryGain.gain.setTargetAtTime(moduleBypassSaved.shape.dry,audioCtx.currentTime,0.02);
        shapeWetGain.gain.setTargetAtTime(moduleBypassSaved.shape.wet,audioCtx.currentTime,0.02);
      }
      break;
    case 'width':
      if(bypassed){
        moduleBypassSaved.width={air:eqAir.gain.value,high:eqHigh.gain.value,side:msSideGain?.gain.value||1};
        // Reset width — absolute zero width contribution
        widthAirOffset=0; widthHighOffset=0;
        if(msSideGain) msSideGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.05);
        applyDSP(); // reapply without width
      } else {
        widthAirOffset=0;widthHighOffset=0; // let applyDSP recalc
        applyDSP();
      }
      break;
    case 'excite':
      if(bypassed){
        moduleBypassSaved.excite={air:eqAir.gain.value};
        eqAir.gain.value=0;
      } else if(moduleBypassSaved.excite){
        eqAir.gain.value=moduleBypassSaved.excite.air;
      }
      break;
    case 'loud':
      if(bypassed){
        moduleBypassSaved.loud={gain:masterGain.gain.value};
        masterGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.05);
      } else if(moduleBypassSaved.loud){
        masterGain.gain.setTargetAtTime(moduleBypassSaved.loud.gain,audioCtx.currentTime,0.05);
      }
      break;
    case 'midside':
      if(bypassed){
        moduleBypassSaved.midside={mid:msMidGain?.gain.value||1,side:msSideGain?.gain.value||1};
        if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.05);
        if(msSideGain) msSideGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.05);
      } else if(moduleBypassSaved.midside){
        if(msMidGain)  msMidGain.gain.setTargetAtTime(moduleBypassSaved.midside.mid,audioCtx.currentTime,0.05);
        if(msSideGain) msSideGain.gain.setTargetAtTime(moduleBypassSaved.midside.side,audioCtx.currentTime,0.05);
      }
      break;
    case 'dyn':
      if(bypassed){
        moduleBypassSaved.dyn={thr:compNode.threshold.value,ratio:compNode.ratio.value,atk:compNode.attack.value,rel:compNode.release.value,lim:limiterNode.threshold.value};
        compNode.threshold.value=0;compNode.ratio.value=1;
        limiterNode.threshold.value=0;limiterNode.ratio.value=1;
      } else if(moduleBypassSaved.dyn){
        const s=moduleBypassSaved.dyn;
        compNode.threshold.value=s.thr;compNode.ratio.value=s.ratio;
        compNode.attack.value=s.atk;compNode.release.value=s.rel;
        limiterNode.threshold.value=s.lim;
      }
      break;
  }
  syncEQSliders();
}

// Reset all bypass states (called when switching presets or modes)
function resetModuleBypasses(){
  Object.keys(moduleBypassState).forEach(m=>{
    if(moduleBypassState[m]){
      moduleBypassState[m]=false;
      const btn=document.getElementById('bypass-'+m);
      if(btn){btn.classList.remove('bypass-active');btn.textContent='BYPASS';}
    }
  });
}


// ===== FEEDBACK MODAL =====
let selectedRating = 0;

function openFeedbackModal(){
  selectedRating = 0;
  document.getElementById('feedback-modal').style.display='flex';
  document.getElementById('feedback-text').value='';
  document.getElementById('feedback-thanks').style.display='none';
  document.getElementById('feedback-form').style.display='block';
  // Reset stars
  document.querySelectorAll('.star-btn').forEach(s=>s.classList.remove('active'));
}

function closeFeedbackModal(){
  document.getElementById('feedback-modal').style.display='none';
}

function selectRating(val){
  selectedRating = val;
  document.querySelectorAll('.star-btn').forEach((s,i)=>{
    s.classList.toggle('active', i<val);
    s.textContent = i<val ? '★' : '☆';
  });
  document.getElementById('rating-val').textContent = val + '/10';
}

function submitFeedback(){
  const text = document.getElementById('feedback-text').value.trim();
  if(selectedRating===0){ setStatus('Selecciona uma nota de 0-10 antes de enviar'); return; }

  // Save feedback locally
  const feedback = {
    user: currentUser||'anon',
    rating: selectedRating,
    text: text,
    preset: curPreset,
    date: new Date().toISOString()
  };
  const feedbacks = JSON.parse(localStorage.getItem('piradex_feedbacks')||'[]');
  feedbacks.push(feedback);
  localStorage.setItem('piradex_feedbacks', JSON.stringify(feedbacks));

  // Show thank you
  document.getElementById('feedback-form').style.display='none';
  document.getElementById('feedback-thanks').style.display='flex';

  // Build thank you message based on rating
  let msg = '';
  if(selectedRating >= 9)      msg = 'Incrível! Obrigado pelo teu apoio! 🚀';
  else if(selectedRating >= 7) msg = 'Muito obrigado! O teu feedback vai melhorar a Suite de Mastering! 🎛️';
  else if(selectedRating >= 5) msg = 'Obrigado! Vamos trabalhar para melhorar! 💪';
  else                          msg = 'Obrigado pela honestidade! O teu feedback é muito valioso! 🙏';

  document.getElementById('thanks-msg').textContent = msg;
  document.getElementById('thanks-rating').textContent = selectedRating + '/10';

  setStatus('Feedback enviado · Nota: '+selectedRating+'/10 · Obrigado!');
  setTimeout(()=>closeFeedbackModal(), 4000);
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
function toggleBypass(){
  bypassOn=!bypassOn;
  const btn=document.getElementById('bypass-btn');
  if(btn){
    btn.classList.toggle('on', bypassOn);
    btn.style.color = bypassOn ? '#ff3ab5' : '';
  }
  applyDSP();
  setStatus(bypassOn ? '⚡ BYPASS ATIVO — sinal sem processamento' : 'Bypass desligado — processamento activo');
}
function setStatus(msg){document.getElementById('stxt').textContent=msg.toUpperCase();}


// ===== HUMAN MASTERING MODAL =====
function openHumanMasteringModal(){
  closePiradexModal();
  // Build specs text from current analysis
  const isHouse = curPreset==='house';
  const lufsTarget = isHouse?-8:-9;
  const headroom = -6;
  const p = PRESETS[curPreset];
  let specs = `🎵 COMO DEVE VIR A MIX PARA MASTERIZAÇÃO\n`;
  specs += `═══════════════════════════════════════\n\n`;
  specs += `• Desliga o master bus limiter/compressor antes de exportar\n`;
  specs += `• Headroom obrigatório: -6 dBFS de pico máximo\n`;
  specs += `• Formato: WAV ou AIFF, 24-bit mínimo, sample rate original\n`;
  specs += `• Sem normalização — entregar com dinâmica natural\n`;
  specs += `• True Peak máximo na mix: -3 dBTP\n`;
  specs += `• Atenção ao clipping em percussão e baixo\n`;
  specs += `• Exports separados se possível: stems vocals + instrumentais\n\n`;
  specs += `🎛️ PROJECTO\n`;
  specs += `────────────\n`;
  specs += `• Género: ${p?.name||curPreset.toUpperCase()}\n`;
  specs += `• Target LUFS: ${lufsTarget} LUFS integrado\n`;
  specs += `• True Peak final: -1.0 dBTP\n`;
  specs += `• Referências: ${p?.refs||'a enviar separadamente'}`;
  document.getElementById('human-specs').textContent=specs;
  document.getElementById('human-sent-msg').style.display='none';
  document.getElementById('human-mastering-modal').style.display='flex';
}

function closeHumanMasteringModal(){
  document.getElementById('human-mastering-modal').style.display='none';
  // Reset form for next use
  humanMasteringSent=false;
  ['human-email','human-link','human-ref','human-notes'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const sentEl=document.getElementById('human-sent-msg');
  if(sentEl) sentEl.style.display='none';
  const sendBtn=document.querySelector('#human-mastering-modal button[onclick*="sendHuman"]');
  if(sendBtn){ sendBtn.textContent='📩 ENVIAR PEDIDO DE MASTERING'; sendBtn.style.opacity='1'; sendBtn.style.background=''; sendBtn.style.pointerEvents='auto'; }
}

let humanMasteringSent = false;
function sendHumanMastering(){
  if(humanMasteringSent){ setStatus('Pedido já enviado — abre nova janela para enviar outro'); return; }
  const email = document.getElementById('human-email').value.trim();
  const link  = document.getElementById('human-link').value.trim();
  const ref   = document.getElementById('human-ref').value.trim();
  const notes = document.getElementById('human-notes').value.trim();
  const specs = document.getElementById('human-specs').textContent;

  if(!email){ document.getElementById('human-email').style.borderColor='var(--c7)'; return; }
  if(!link) { document.getElementById('human-link').style.borderColor='var(--c7)'; return; }

  // Build mailto link to juninhopiradex@hotmail.com
  const subject = encodeURIComponent('Pedido de Mastering — Piradex Studio');
  const body = encodeURIComponent(
    `PEDIDO DE MASTERING — PIRADEX MASTERING SUITE
` +
    `===============================================

` +
    `EMAIL DO CLIENTE: ${email}

` +
    `ESPECIFICAÇÕES:
${specs}

` +
    `LINK DA FAIXA:
${link}

` +
    (ref?`LINK DA REFERÊNCIA:
${ref}

`:'') +
    (notes?`NOTAS ADICIONAIS:
${notes}

`:'') +
    `===============================================
` +
    `Enviado via Piradex Mastering Suite · beatfreakstudio.com`
  );

  // Send via EmailJS (free service, no server needed)
  // Uses emailjs.com with a pre-configured service
  const msgEl=document.getElementById('human-sent-msg');
  const sendBtn=event.target;
  sendBtn.textContent='A enviar...';sendBtn.style.opacity='0.6';sendBtn.style.pointerEvents='none';

  // Try EmailJS first (if loaded), fallback to mailto
  humanMasteringSent = true;
  if(typeof emailjs!=='undefined'){
    emailjs.send('piradex_service','piradex_template',{
      to_email:'juninhopiradex@hotmail.com',
      from_email:email,
      subject:'Pedido de Mastering — Piradex Studio',
      track_link:link,
      ref_link:ref||'—',
      notes:notes||'—',
      specs:specs,
      reply_to:email
    }).then(()=>{
      msgEl.style.display='block';
      sendBtn.textContent='✓ ENVIADO';sendBtn.style.background='var(--c4)';
      setStatus('Pedido enviado — aguarda orçamento no email');
    }).catch(()=>fallbackMailto(subject,body,msgEl,sendBtn));
  } else {
    fallbackMailto(subject,body,msgEl,sendBtn);
  }
}

function fallbackMailto(subject,body,msgEl,sendBtn){
  // Open mailto as fallback
  const link2=`mailto:juninhopiradex@hotmail.com?subject=${subject}&body=${body}`;
  window.open(link2,'_blank');
  if(msgEl) msgEl.style.display='block';
  if(sendBtn){ sendBtn.textContent='✓ ENVIADO'; sendBtn.style.background='var(--c4)'; }
  setStatus('Email aberto — aguarda orçamento no teu email');
}

// ===== LOGIN =====
const USERS={
  'admin':     {pass:'piradex2024',  type:'full',  exports:null, hours:null},
  'beatfreak': {pass:'studio2024',   type:'full',  exports:null, hours:null},
  'demo':      {pass:'demo123',      type:'demo',  exports:3,    hours:null},
  'producer1': {pass:'beats2024',    type:'full',  exports:null, hours:null},
  'producer2': {pass:'music2024',    type:'full',  exports:null, hours:null},
  'piradex':   {pass:'number1',      type:'beta',  exports:10,   hours:2}
};
// Legacy password check support
function getUserPass(u){ return USERS[u]?.pass||null; }
let isLoggedIn=false,exportCount=0;
const FREE_EXPORTS=3,PAY_URL='https://www.beatfreakstudio.com/subscribe';
function checkAutoLogin(){
  if(sessionStorage.getItem('piradex_session')==='authenticated'){isLoggedIn=true;document.getElementById('login-screen').style.display='none';}
  exportCount=parseInt(sessionStorage.getItem('piradex_exports')||'0');
  checkLicense();
}
let currentUser = null;
let betaExportsUsed = 0;
let betaSessionStart = null;
let betaTimerInterval = null;

function doLogin(){
  const user=document.getElementById('login-user').value.trim().toLowerCase();
  const pass=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');
  if(!user||!pass){err.textContent='Preenche todos os campos.';return;}

  const userData = USERS[user];
  if(userData && userData.pass===pass){
    isLoggedIn=true;
    currentUser=user;
    sessionStorage.setItem('piradex_session','authenticated');
    sessionStorage.setItem('piradex_user', user);
    document.getElementById('login-screen').style.display='none';
    err.textContent='';

    // Beta user setup
    if(userData.type==='beta'){
      // Restore or start session
      const savedStart = sessionStorage.getItem('beta_session_start');
      const savedExports = parseInt(sessionStorage.getItem('beta_exports_used')||'0');
      betaExportsUsed = savedExports;

      if(savedStart){
        betaSessionStart = parseInt(savedStart);
        const elapsed = (Date.now()-betaSessionStart)/1000/3600;
        if(elapsed >= userData.hours){
          // Session expired
          isLoggedIn=false;
          err.textContent='⏱️ Sessão beta expirada. Contacta beatfreakstudio.com';
          document.getElementById('login-screen').style.display='flex';
          return;
        }
      } else {
        betaSessionStart = Date.now();
        sessionStorage.setItem('beta_session_start', betaSessionStart);
      }
      startBetaTimer(userData.hours);
      setStatus('🧪 BETA TESTER · Bem-vindo Piradex! · '+betaExportsUsed+'/'+userData.exports+' masterizações usadas');
    }
  } else {
    err.textContent='❌ Credenciais inválidas.';
    document.getElementById('login-pass').value='';
    const box=document.querySelector('.login-box');
    if(box){box.style.animation='shake 0.4s ease';setTimeout(()=>box.style.animation='',400);}
  }
}

function startBetaTimer(hours){
  if(betaTimerInterval) clearInterval(betaTimerInterval);
  betaTimerInterval = setInterval(()=>{
    if(!betaSessionStart) return;
    const elapsed = (Date.now()-betaSessionStart)/1000;
    const totalSecs = hours*3600;
    const remaining = totalSecs - elapsed;
    if(remaining <= 0){
      clearInterval(betaTimerInterval);
      isLoggedIn = false;
      sessionStorage.removeItem('piradex_session');
      sessionStorage.removeItem('beta_session_start');
      document.getElementById('login-screen').style.display='flex';
      document.getElementById('login-error').textContent='⏱️ Sessão beta de 2 horas terminada. Obrigado por testar!';
      setStatus('Sessão beta terminada');
      return;
    }
    const mins = Math.floor(remaining/60);
    const secs = Math.floor(remaining%60);
    const userData = USERS[currentUser];
    const exportsLeft = (userData?.exports||10) - betaExportsUsed;
    // Update timer in status bar
    document.getElementById('beta-timer').style.display='flex';
    document.getElementById('beta-timer-val').textContent =
      '⏱ '+String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')+':'+String(secs).padStart(2,'0')+
      '  ·  🎧 '+exportsLeft+' masterizações restantes';
  }, 1000);
}

function checkAutoLogin(){
  const sess = sessionStorage.getItem('piradex_session');
  const user = sessionStorage.getItem('piradex_user');
  if(sess==='authenticated' && user){
    const userData = USERS[user];
    if(!userData){ return; }
    // Check beta expiry
    if(userData.type==='beta'){
      const savedStart = sessionStorage.getItem('beta_session_start');
      if(savedStart){
        const elapsed = (Date.now()-parseInt(savedStart))/1000/3600;
        if(elapsed >= userData.hours){
          sessionStorage.removeItem('piradex_session');
          return; // show login
        }
        betaSessionStart = parseInt(savedStart);
        betaExportsUsed = parseInt(sessionStorage.getItem('beta_exports_used')||'0');
        currentUser = user;
        isLoggedIn = true;
        document.getElementById('login-screen').style.display='none';
        startBetaTimer(userData.hours);
      }
    } else {
      currentUser = user;
      isLoggedIn = true;
      document.getElementById('login-screen').style.display='none';
    }
  }
  exportCount=parseInt(sessionStorage.getItem('piradex_exports')||'0');
  checkLicense();
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
function showPaywall(){
  const lbl=document.getElementById('export-count-label');
  if(lbl) lbl.textContent = FREE_EXPORTS+' exportações gratuitas';
  document.getElementById('paywall-modal').style.display='flex';
}
function skipPaywall(){
  document.getElementById('paywall-modal').style.display='none';
  setStatus('MODO DEMO · '+exportCount+'/'+FREE_EXPORTS+' exportações usadas · subscreve para continuar');
}
function goPay(){const s=document.querySelector('.plan.selected .plan-name');window.open(PAY_URL+'?plan='+(s?s.textContent:'pro').toLowerCase(),'_blank');}

async function exportMastered(){
  if(!isLoggedIn){document.getElementById('login-screen').style.display='flex';return;}

  // Beta user export logic
  if(currentUser && USERS[currentUser]?.type==='beta'){
    const maxExports = USERS[currentUser].exports;
    if(betaExportsUsed >= maxExports){
      setStatus('❌ Limite de '+maxExports+' masterizações beta atingido · Contacta beatfreakstudio.com');
      showBetaLimitModal();
      return;
    }
    await _originalExport();
    betaExportsUsed++;
    sessionStorage.setItem('beta_exports_used', betaExportsUsed);
    const remaining = maxExports - betaExportsUsed;
    setStatus('🧪 BETA · Masterização '+betaExportsUsed+'/'+maxExports+' · Faltam '+remaining+' masterizações');
    // Show feedback modal after export
    setTimeout(()=>openFeedbackModal(), 1800);
    return;
  }

  if(isFullVersion){await _originalExport();setTimeout(()=>openFeedbackModal(),1800);return;}
  if(exportCount<FREE_EXPORTS){
    await _originalExport();
    exportCount++;
    sessionStorage.setItem('piradex_exports',exportCount);
    const remaining=FREE_EXPORTS-exportCount;
    if(remaining>0){
      setStatus('Exportação '+exportCount+'/'+FREE_EXPORTS+' · ainda tens '+remaining+' exportação'+(remaining>1?'ões':'')+' gratuita'+(remaining>1?'s':''));
    } else {
      setTimeout(()=>showPaywall(),1500);
    }
  } else {
    showPaywall();
  }
}

function showBetaLimitModal(){
  document.getElementById('beta-limit-modal').style.display='flex';
}

// ===== INIT =====
buildKnobs();
updateLUFSDisplay();
updateModeUI('before'); // init tabs state
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
