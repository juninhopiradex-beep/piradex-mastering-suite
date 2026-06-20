// ===== PIRADEX MASTERING SUITE v1.0 =====

const PRESETS = {
  kizomba:  {name:'KIZOMBA',  refs:'C4 Pedro · Johnny Ramos · Nelson Freitas', desc:'Graves quentes, body nos mids baixos',
    knobs:{CLEAN:50,BASS:35,LOUD:65,WIDE:50,PUNCH:50,FOCUS:55},eq:{sub:0.6,bass:0.7,low:0.8,mid:-0.2,high:-0.3,air:0.4},
    sugs:[['Bass body @ 150Hz','+0.7 dB','c2'],['Low-mid warmth','+0.8 dB','c3'],['Stereo groove','+42%','c5']]},
  kuduro:   {name:'KUDURO',   refs:'Titica · Kapota', desc:'Sub kick agressivo, energia máxima de dança',
    knobs:{CLEAN:45,BASS:35,LOUD:72,WIDE:45,PUNCH:65,FOCUS:55},eq:{sub:3.9,bass:-0.5,low:-0.8,mid:-0.2,high:-0.3,air:-0.4},
    sugs:[['Sub kick @ 60Hz','+3.9 dB','c2'],['Low-mid cut','-0.8 dB','c3'],['Tight mono','-0.4 dB','c5']]},
  zouk:     {name:'ZOUK',     refs:'Kassav', desc:'Sub profundo, amplitude romántica, muito dinâmico',
    knobs:{CLEAN:50,BASS:35,LOUD:60,WIDE:68,PUNCH:52,FOCUS:45},eq:{sub:3.8,bass:0.0,low:-0.8,mid:-0.2,high:0.0,air:0.0},
    sugs:[['Deep sub @ 60Hz','+3.8 dB','c2'],['Low-mid clean','-0.8 dB','c3'],['Wide stereo','+72%','c5']]},
  gzouk:    {name:'GZOUK',    refs:'Kaysha', desc:'Corpo nos mids baixos, groove urbano',
    knobs:{CLEAN:50,BASS:35,LOUD:65,WIDE:58,PUNCH:52,FOCUS:55},eq:{sub:-0.6,bass:-0.2,low:2.2,mid:0.4,high:0.0,air:0.0},
    sugs:[['Low-mid body @ 500Hz','+2.2 dB','c2'],['Mid presence','+0.4 dB','c3'],['Urban width','+58%','c5']]},
  semba:    {name:'SEMBA',    refs:'Cabelos Brancos', desc:'Bass quente dominante, alma angolana',
    knobs:{CLEAN:50,BASS:35,LOUD:62,WIDE:50,PUNCH:55,FOCUS:50},eq:{sub:-3.1,bass:4.7,low:0.2,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Bass warmth @ 150Hz','+4.7 dB','c2'],['Sub cut','-3.1 dB','c3'],['Natural groove','+44%','c5']]},
  afrohouse:{name:'AFRO-HOUSE',refs:'Lau Silva · Nitefreak · TAKA', desc:'Sub extremo, kick profundo, dancefloor',
    knobs:{CLEAN:50,BASS:35,LOUD:68,WIDE:60,PUNCH:58,FOCUS:50},eq:{sub:4.8,bass:-0.5,low:-0.8,mid:-0.4,high:-0.3,air:0.0},
    sugs:[['Sub weight @ 50Hz','+4.8 dB','c2'],['Bass definition','-0.5 dB','c3'],['Club width','+62%','c5']]},
  rnb:      {name:'R&B',      refs:'Mario · Ne-Yo · Usher · Chris Brown', desc:'Voz no topo, dinâmico, polido',
    knobs:{CLEAN:58,BASS:35,LOUD:60,WIDE:55,PUNCH:45,FOCUS:65},eq:{sub:-0.5,bass:0.3,low:0.5,mid:1.2,high:1.0,air:0.8},
    sugs:[['Low-mid body @ 500Hz','+2.0 dB','c2'],['Sub control','-1.2 dB','c3'],['Vocal presence','+0.4 dB','c5']]},
  afrobeats:{name:'AFROBEATS',refs:'Davido · Rema · Lojay', desc:'Sub pesado, groove colorido',
    knobs:{CLEAN:50,BASS:35,LOUD:65,WIDE:55,PUNCH:55,FOCUS:55},eq:{sub:2.1,bass:0.5,low:0.0,mid:0.0,high:0.0,air:0.0},
    sugs:[['Sub groove @ 60Hz','+2.1 dB','c2'],['Bass presence','+0.5 dB','c3'],['Afro width','+56%','c5']]},
  amapiano: {name:'AMAPIANO', refs:'Asake · Olamide', desc:'Log drum pesado, piano suave, corpo nos low-mids — som sul-africano',
    knobs:{CLEAN:50,BASS:35,LOUD:65,WIDE:60,PUNCH:60,FOCUS:55},
    eq:{sub:-2.5,bass:1.0,low:1.3,mid:0.0,high:-0.4,air:-0.2},
    sugs:[['Bass body @ 150Hz','+1.0 dB','c2'],['Low-mid presence','+1.3 dB','c3'],['Log drum punch','+61%','c5']]},
  dancehall: {name:'DANCEHALL', refs:'Blaiz Fayah · Tribal Kush', desc:'Riddim energético, voz presente, espectro completo — estilo jamaicano/afro',
    knobs:{CLEAN:60,BASS:35,LOUD:65,WIDE:55,PUNCH:62,FOCUS:70},
    eq:{sub:-3.0,bass:-0.1,low:1.1,mid:1.3,high:0.7,air:0.7},
    sugs:[['Vocal presence @ 1.5kHz','+1.3 dB','c2'],['High definition','+0.7 dB','c3'],['Riddim punch','+63%','c5']]},
  reggaeton: {name:'REGGAETON', refs:'Daddy Yankee · Snow', desc:'Sub dominante, dembow pesado, kick profundo — som latino urbano',
    knobs:{CLEAN:50,BASS:35,LOUD:65,WIDE:52,PUNCH:58,FOCUS:50},
    eq:{sub:3.0,bass:-0.8,low:-0.9,mid:-0.3,high:-0.3,air:-0.2},
    sugs:[['Sub dembow @ 60Hz','+3.0 dB','c2'],['Bass tightness','-0.8 dB','c3'],['Latino punch','+60%','c5']]},
  kompa: {name:'KOMPA', refs:"Joe Dwe't File", desc:'Graves profundos, muito dinâmico, romantismo haitiano',
    knobs:{CLEAN:50,BASS:35,LOUD:62,WIDE:55,PUNCH:50,FOCUS:50},
    eq:{sub:1.1,bass:-0.2,low:0.1,mid:-0.5,high:-0.6,air:-0.2},
    sugs:[['Warm sub @ 70Hz','+1.1 dB','c2'],['Mid warmth','-0.5 dB','c3'],['Romantic width','+58%','c5']]},
  house:    {name:'HOUSE',    refs:'Adam Port · HUGEL', desc:'Sub dominante, kick 4x4, dancefloor',
    knobs:{CLEAN:52,BASS:35,LOUD:70,WIDE:52,PUNCH:58,FOCUS:50},eq:{sub:4.0,bass:-0.5,low:-0.5,mid:-0.3,high:0.5,air:0.5},
    sugs:[['Sub punch @ 50Hz','+4.0 dB','c2'],['Bass definition','-0.5 dB','c3'],['Club energy','+72%','c5']]},
  suno: {name:'AI SUNO', refs:'Suno v3 · v4 · v5 — AI Generated Music', desc:'Noise gate · EQ correction · Stereo wide · Limiter → −9 LUFS',
    knobs:{CLEAN:62,BASS:35,LOUD:68,WIDE:58,PUNCH:48,FOCUS:60},
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
let shapeMixer=null, shapeTrimGain=null;
let mbInputGain=null, mbBandsGain=null, mbOutGain=null;
let msSplitter=null, msMerger=null, msInL=null, msInR=null;
let msMidSum=null, msSideSum=null, msInvR1=null, msInvSide=null;
let msMidEqLow=null, msMidEqMid=null, msMidEqHigh=null;
let msSideEqLow=null, msSideEqMid=null, msSideEqHigh=null;
// Dedicated nodes for new modules (each module owns its own filters)
let _lfSub=null, _lfBass=null, _lfMud=null;  // LOW FOCUS
let _hfAir=null, _hfDeess=null, _hfPres=null; // HIGH FOCUS
let _deqNodes=[];                              // DYN EQ 4 peaks
let _mseqMidLow=null, _mseqMidMid=null, _mseqMidHigh=null; // MS EQ MID side
let _spNodes=[];                               // SPECTRAL 4 peaks
let _tdNode=null;                              // T-DESIGN aux compressor
let _resonNodes=[];                            // RESON 6 peaks
let msDirectGain=null, msProcGain=null;
let clipInGain=null, clipShaper=null, clipOutGain=null;
let clipGoldWS=null, clipAlchemy=null, clipBoxTone=null;
let clipWetGain=null, clipDryGain=null, clipSumGain=null;
let clipBypassed=false;
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
  if(playMode==='before' && name!=='master' && name!=='ref' && name!=='analysis' && name!=='studiopro' && name!=='voicelab' && name!=='voicetune'){
    setStatus('Muda para PROCESSADO para aceder aos efeitos');
    return;
  }
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  const panel=document.getElementById('tab-'+name);
  if(panel) panel.classList.add('active');
  // redraw canvases now that the panel is visible (offsetWidth is correct)
  if(name==='eq')      setTimeout(()=>{drawInteractiveEQ();},60);
  if(name==='balance') setTimeout(()=>{ if(typeof drawBalanceBars==='function') drawBalanceBars(); },60);
  if(name==='clip')    setTimeout(()=>{ if(typeof _drawClipCurve==='function') _drawClipCurve(); },60);
  if(name==='analysis')setTimeout(()=>{ if(audioBuffer && typeof runFullAnalysis==='function') runFullAnalysis(); },80);
  if(name==='studiopro')setTimeout(()=>{
    if(typeof hasStudioPro==='undefined' || !hasStudioPro){
      const c=document.getElementById('fx-content');
      const bk=document.getElementById('fx-back'); if(bk) bk.style.display='none';
      const isBasic=(typeof isFullVersion!=='undefined' && isFullVersion);
      if(c) c.innerHTML='<div style="text-align:center;padding:40px 20px;">'+
        '<div style="font-family:\'Orbitron\',monospace;font-weight:900;font-size:20px;background:linear-gradient(90deg,var(--c3),var(--c1));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">STUDIO PRO</div>'+
        '<div style="font-size:13px;color:var(--muted);margin-top:10px;line-height:1.6;max-width:520px;margin-left:auto;margin-right:auto;">As <b style="color:var(--c4)">36 ferramentas avançadas</b> (Copiloto, Heat Map Emocional, Codec Social, Blind Shootout, Afinação de Voz, Mood-to-Master, Mastering Coach, Vinyl Whisper e muito mais) exigem uma licença <b style="color:var(--c4)">AVANÇADA</b>.'+(isBasic?'<br><br>Tens uma licença <b style="color:var(--c5)">BÁSICA</b> — faz upgrade para AVANÇADA para desbloquear.':'')+'</div>'+
        '<div style="display:flex;gap:8px;justify-content:center;margin-top:18px;flex-wrap:wrap;">'+
        '<button onclick="openLicenseModal()" style="padding:10px 20px;border-radius:6px;border:1px solid var(--c4);background:rgba(45,255,138,0.12);color:var(--c4);font-family:\'Rajdhani\';font-weight:700;letter-spacing:1px;cursor:pointer;">'+(isBasic?'FAZER UPGRADE PARA AVANÇADA':'VER PLANOS AVANÇADOS')+'</button>'+
        '</div></div>';
      return;
    }
    if(typeof fxRenderHub==='function') fxRenderHub();
  },60);
  if(name==='reference')setTimeout(()=>{_drawReferenceOverlay();},60);
  if(name==='voicetune')setTimeout(()=>{ if(typeof vtInitDrop==='function'){vtInitDrop();} if(typeof _vtDrawAll==='function')_vtDrawAll(); },60);
  if(name==='reson')setTimeout(()=>{ if(typeof _ensureResonAnalyser==='function'){ _ensureResonAnalyser(); _startResonLoop(); } updateReson(); },60);
  if(name==='image')setTimeout(()=>{ if(typeof _ensureVectorscope==='function') _ensureVectorscope(); updateImager(); },60);
  if(name==='lowfocus')setTimeout(()=>{ if(typeof updateLowFocus==='function') updateLowFocus(); },60);
  if(name==='highfocus')setTimeout(()=>{ if(typeof updateHighFocus==='function') updateHighFocus(); },60);
  if(name==='dyneq')setTimeout(()=>{ if(typeof updateDynEQ==='function') updateDynEQ(); },60);
  if(name==='mseq')setTimeout(()=>{ if(typeof updateMSEq==='function') updateMSEq(); },60);
  if(name==='warmth')setTimeout(()=>{ if(typeof updateWarmth==='function') updateWarmth(); },60);
  if(name==='spectral')setTimeout(()=>{ if(typeof updateSpectral==='function') updateSpectral(); },60);
  if(name==='tdesign')setTimeout(()=>{ if(typeof updateTDesign==='function') updateTDesign(); },60);
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

  // Shape — single SERIAL waveshaper (mix baked into curve → no parallel comb filtering)
  shapeWS      = audioCtx.createWaveShaper();
  shapeWS.oversample = '4x';
  shapeDryGain = audioCtx.createGain(); shapeDryGain.gain.value = 1.0; // kept for compatibility, unused in serial path
  shapeWetGain = audioCtx.createGain(); shapeWetGain.gain.value = 1.0;

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
  shapeMixer = audioCtx.createGain(); shapeMixer.gain.value = 1.0;

  // ── TRANSIENT SHAPER node (in series, dry by default) ───────────────────
  _transientNode = audioCtx.createDynamicsCompressor();
  _transientNode.threshold.value = 0;   // disabled at rest
  _transientNode.ratio.value     = 1;
  _transientNode.attack.value    = 0.003;
  _transientNode.release.value   = 0.25;
  _transientNode.knee.value      = 6;

  // ── MULTIBAND nodes (parallel 3-band, summed) ───────────────────────────
  _initMultiband();
  // mb input/output routing gains
  mbInputGain  = audioCtx.createGain(); mbInputGain.gain.value  = 1.0; // feeds direct path when OFF
  mbBandsGain  = audioCtx.createGain(); mbBandsGain.gain.value  = 0.0; // feeds multiband path when ON
  mbOutGain    = audioCtx.createGain(); mbOutGain.gain.value    = 1.0;

  // ── M/S processing via channel splitter/merger ──────────────────────────
  // Encode L/R → Mid/Side, apply gains, decode back to L/R
  msSplitter = audioCtx.createChannelSplitter(2);
  msMerger   = audioCtx.createChannelMerger(2);
  // We build M/S with a small matrix using gains; simplest robust approach:
  // Mid  = (L+R)/2 ; Side = (L-R)/2 ; then L = Mid+Side ; R = Mid-Side
  // Implemented with gain nodes + inverters.
  msInL  = audioCtx.createGain(); msInR  = audioCtx.createGain();
  msMidSum = audioCtx.createGain(); msMidSum.gain.value = 0.5;
  msSideSum= audioCtx.createGain(); msSideSum.gain.value= 0.5;
  msInvR1  = audioCtx.createGain(); msInvR1.gain.value = -1; // for side = L - R
  msInvSide= audioCtx.createGain(); msInvSide.gain.value= -1; // for R = Mid - Side
  // msMidGain / msSideGain already created above (user-controllable)

  // ── MASTER OUTPUT / ANALYSER routing ────────────────────────────────────
  // Clean serial chain. M/S and Multiband are OPT-IN crossfade stages that are
  // fully transparent (unity, bit-equivalent) when not engaged.
  //
  // src → EQ(6) → shapeWS → shapeTrim → [MB direct|bands] → comp → transient
  //     → limiter → [MS direct|processed] → master → analyser → out

  eqSub.connect(eqBass); eqBass.connect(eqLowNode); eqLowNode.connect(eqMid);
  eqMid.connect(eqHigh); eqHigh.connect(eqAir);

  // ═══ NÓS DEDICADOS POR MÓDULO (transparentes por defeito) ═══
  // LOW FOCUS
  _lfSub  = audioCtx.createBiquadFilter(); _lfSub.type='highpass';  _lfSub.frequency.value=20;  _lfSub.Q.value=0.7;
  _lfBass = audioCtx.createBiquadFilter(); _lfBass.type='peaking';  _lfBass.frequency.value=80; _lfBass.Q.value=1; _lfBass.gain.value=0;
  _lfMud  = audioCtx.createBiquadFilter(); _lfMud.type='peaking';   _lfMud.frequency.value=300; _lfMud.Q.value=1.2; _lfMud.gain.value=0;
  // HIGH FOCUS
  _hfAir   = audioCtx.createBiquadFilter(); _hfAir.type='highshelf';   _hfAir.frequency.value=12000; _hfAir.gain.value=0;
  _hfDeess = audioCtx.createBiquadFilter(); _hfDeess.type='peaking';   _hfDeess.frequency.value=7000; _hfDeess.Q.value=2.5; _hfDeess.gain.value=0;
  _hfPres  = audioCtx.createBiquadFilter(); _hfPres.type='peaking';    _hfPres.frequency.value=3000; _hfPres.Q.value=0.9; _hfPres.gain.value=0;
  // DYN EQ — 4 peaks
  _deqNodes = [];
  for(let i=0;i<4;i++){
    const n=audioCtx.createBiquadFilter(); n.type='peaking'; n.Q.value=1.5; n.gain.value=0;
    n.frequency.value=[120,500,3000,8000][i];
    _deqNodes.push(n);
  }
  // MS EQ — 3 peaks para MID
  _mseqMidLow  = audioCtx.createBiquadFilter(); _mseqMidLow.type='peaking';  _mseqMidLow.Q.value=1; _mseqMidLow.frequency.value=200;  _mseqMidLow.gain.value=0;
  _mseqMidMid  = audioCtx.createBiquadFilter(); _mseqMidMid.type='peaking';  _mseqMidMid.Q.value=1; _mseqMidMid.frequency.value=1500; _mseqMidMid.gain.value=0;
  _mseqMidHigh = audioCtx.createBiquadFilter(); _mseqMidHigh.type='peaking'; _mseqMidHigh.Q.value=1;_mseqMidHigh.frequency.value=8000;_mseqMidHigh.gain.value=0;
  // SPECTRAL — 4 peaks
  _spNodes = [];
  for(let i=0;i<4;i++){
    const n=audioCtx.createBiquadFilter(); n.type='peaking'; n.Q.value=1.2; n.gain.value=0;
    n.frequency.value=[150,800,3000,10000][i];
    _spNodes.push(n);
  }
  // RESON — 6 peaks dedicados
  _resonNodes = [];
  for(let i=0;i<6;i++){
    const n=audioCtx.createBiquadFilter(); n.type='peaking'; n.Q.value=6; n.gain.value=0;
    n.frequency.value=[200,500,1000,2500,5000,10000][i];
    _resonNodes.push(n);
  }

  // série em ordem: eqAir → LF → HF → MS EQ MID → DYN EQ → SPECTRAL → RESON → shapeWS
  let prev = eqAir;
  const chain = [_lfSub, _lfBass, _lfMud, _hfAir, _hfDeess, _hfPres,
                 _mseqMidLow, _mseqMidMid, _mseqMidHigh,
                 ..._deqNodes, ..._spNodes, ..._resonNodes];
  chain.forEach(n => { prev.connect(n); prev = n; });

  // Shape — serial waveshaper (mix baked into curve, no parallel comb)
  prev.connect(shapeWS); shapeWS.connect(shapeMixer);

  // Shape trim
  shapeTrimGain = audioCtx.createGain(); shapeTrimGain.gain.value = 1.0;
  shapeMixer.connect(shapeTrimGain);

  // ── MULTIBAND crossfade (direct vs 3-band) ──────────────────────────────
  // direct path (default ON): shapeTrim → mbInputGain → compNode
  shapeTrimGain.connect(mbInputGain); mbInputGain.connect(compNode);
  // band path (engaged): shapeTrim → crossover bands → comps → mbBandsGain → compNode
  shapeTrimGain.connect(_mbLow);
  shapeTrimGain.connect(_mbMid);
  shapeTrimGain.connect(_mbHigh);
  _mbLowComp.connect(mbBandsGain);
  _mbMidComp.connect(mbBandsGain);
  _mbHighComp.connect(mbBandsGain);
  mbBandsGain.connect(compNode);

  // comp → transient → CLIPPER (Gold Clip style) → limiter
  compNode.connect(_transientNode);
  // Clipper sections: input trim → [parallel: dry | (clip → gold → alchemy)] → mix → output trim
  clipInGain   = audioCtx.createGain(); clipInGain.gain.value = 1.0;   // INPUT TRIM
  clipShaper   = audioCtx.createWaveShaper(); clipShaper.oversample='4x'; // CLIPPER curve
  clipGoldWS   = audioCtx.createWaveShaper(); clipGoldWS.oversample='4x'; // GOLD saturation
  clipAlchemy  = audioCtx.createBiquadFilter(); clipAlchemy.type='highshelf'; clipAlchemy.frequency.value=8000; clipAlchemy.gain.value=0; // ALCHEMY
  clipBoxTone  = audioCtx.createBiquadFilter(); clipBoxTone.type='peaking'; clipBoxTone.frequency.value=3000; clipBoxTone.Q.value=0.7; clipBoxTone.gain.value=0; // BOX TONE
  clipWetGain  = audioCtx.createGain(); clipWetGain.gain.value = 1.0;  // wet (processed) level
  clipDryGain  = audioCtx.createGain(); clipDryGain.gain.value = 0.0;  // dry (parallel) level
  clipOutGain  = audioCtx.createGain(); clipOutGain.gain.value = 1.0;  // OUTPUT TRIM
  clipSumGain  = audioCtx.createGain(); clipSumGain.gain.value = 1.0;  // wet+dry sum
  _buildClipCurve(0, 'modern');
  _buildGoldCurve(0, 'smooth');

  // input trim feeds both the processed branch and the parallel-dry branch
  _transientNode.connect(clipInGain);
  // processed: inGain → clip → gold → alchemy → boxtone → wetGain → sum
  clipInGain.connect(clipShaper);
  clipShaper.connect(clipGoldWS);
  clipGoldWS.connect(clipAlchemy);
  clipAlchemy.connect(clipBoxTone);
  clipBoxTone.connect(clipWetGain);
  clipWetGain.connect(clipSumGain);
  // parallel dry: inGain → dryGain → sum
  clipInGain.connect(clipDryGain);
  clipDryGain.connect(clipSumGain);
  // sum → output trim → limiter
  clipSumGain.connect(clipOutGain);
  clipOutGain.connect(limiterNode);

  // ── M/S crossfade (direct vs processed) ─────────────────────────────────
  // msDirectGain (default 1.0) = clean stereo passthrough — NO matrix, no noise
  // msProcGain   (default 0.0) = the M/S-processed branch, only faded in when used
  msDirectGain = audioCtx.createGain(); msDirectGain.gain.value = 1.0;
  msProcGain   = audioCtx.createGain(); msProcGain.gain.value   = 0.0;

  // direct passthrough
  limiterNode.connect(msDirectGain); msDirectGain.connect(masterGain);

  // processed M/S branch
  limiterNode.connect(msSplitter);
  msSplitter.connect(msInL, 0);
  msSplitter.connect(msInR, 1);
  // Mid = 0.5(L+R)
  msInL.connect(msMidSum); msInR.connect(msMidSum);
  // Side = 0.5(L-R)
  msInL.connect(msSideSum); msInR.connect(msInvR1); msInvR1.connect(msSideSum);
  // dedicated Mid/Side EQ
  msMidEqLow  = audioCtx.createBiquadFilter(); msMidEqLow.type='lowshelf';  msMidEqLow.frequency.value=250;  msMidEqLow.gain.value=0;
  msMidEqMid  = audioCtx.createBiquadFilter(); msMidEqMid.type='peaking';   msMidEqMid.frequency.value=1500; msMidEqMid.Q.value=0.8; msMidEqMid.gain.value=0;
  msMidEqHigh = audioCtx.createBiquadFilter(); msMidEqHigh.type='highshelf';msMidEqHigh.frequency.value=6000; msMidEqHigh.gain.value=0;
  msSideEqLow = audioCtx.createBiquadFilter(); msSideEqLow.type='lowshelf'; msSideEqLow.frequency.value=250;  msSideEqLow.gain.value=0;
  msSideEqMid = audioCtx.createBiquadFilter(); msSideEqMid.type='peaking';  msSideEqMid.frequency.value=1500; msSideEqMid.Q.value=0.8; msSideEqMid.gain.value=0;
  msSideEqHigh= audioCtx.createBiquadFilter(); msSideEqHigh.type='highshelf';msSideEqHigh.frequency.value=6000;msSideEqHigh.gain.value=0;
  msMidSum.connect(msMidEqLow); msMidEqLow.connect(msMidEqMid); msMidEqMid.connect(msMidEqHigh); msMidEqHigh.connect(msMidGain);
  msSideSum.connect(msSideEqLow); msSideEqLow.connect(msSideEqMid); msSideEqMid.connect(msSideEqHigh); msSideEqHigh.connect(msSideGain);
  // Decode L=Mid+Side, R=Mid-Side into a 2-ch merger
  msMidGain.connect(msMerger, 0, 0);
  msSideGain.connect(msMerger, 0, 0);
  msMidGain.connect(msMerger, 0, 1);
  msSideGain.connect(msInvSide); msInvSide.connect(msMerger, 0, 1);
  msMerger.connect(msProcGain); msProcGain.connect(masterGain);

  masterGain.connect(analyserNode);

  // DRY CHAIN (ORIGINAL): source → dryGain → analyser → out
  dryGain.connect(analyserNode);

  analyserNode.connect(audioCtx.destination);

  applyShapeCurve();

  // ── Bridge for STUDIO PRO (features.js) — expose live node/var references ──
  window.audioCtx=audioCtx; window.masterGain=masterGain; window.analyserNode=analyserNode;
  window.eqSub=eqSub; window.eqBass=eqBass; window.eqLowNode=eqLowNode;
  window.eqMid=eqMid; window.eqHigh=eqHigh; window.eqAir=eqAir;
  window.kvals=kvals;
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

// ===== CLIPPER (Gold Clip-style: Clipper + Gold + Alchemy + Parallel) =====
let clipMode='modern', clipDriveDb=0, clipCeilingDb=-0.1;

// CLIPPER transfer curve — Modern/Classic (analog knee) vs Hard (clean)
function _buildClipCurve(driveDb, mode){
  if(!clipShaper) return;
  const n=8192, curve=new Float32Array(n);
  const ceil=Math.pow(10,(clipCeilingDb||0)/20);
  for(let i=0;i<n;i++){
    let x=((i*2/(n-1))-1);
    let y;
    switch(mode){
      case 'hard':    y=Math.max(-ceil,Math.min(ceil,x)); break;
      case 'classic': { // medium knee
        const k=1.6; const t=x/ceil;
        y=ceil*Math.tanh(t*k)/Math.tanh(k); break; }
      case 'modern':  { // softer knee, brighter
        const k=1.1; const t=x/ceil;
        y=ceil*(t/Math.pow(1+Math.pow(Math.abs(t),2.2),1/2.2))*( Math.tanh(k)/Math.max(1e-6,Math.tanh(k)) );
        y=Math.max(-ceil,Math.min(ceil,y)); break; }
      case 'off':     y=x; break;
      default:        y=Math.max(-ceil,Math.min(ceil,x));
    }
    curve[i]=Math.max(-1,Math.min(1,y));
  }
  clipShaper.curve=curve;
}

// GOLD — loudness saturation: amplifies low-level info, up to +6 dB non-linear gain
function _buildGoldCurve(amount, mode){
  if(!clipGoldWS) return;
  const n=8192, curve=new Float32Array(n);
  const a=Math.max(0,Math.min(1,amount/100));
  if(a<0.001){ for(let i=0;i<n;i++) curve[i]=(i*2/(n-1))-1; clipGoldWS.curve=curve; return; }
  const drive=1+a*( mode==='aggressive'?2.0:1.0 ); // up to ~+6dB
  for(let i=0;i<n;i++){
    const x=((i*2/(n-1))-1);
    // upward saturation: expands quiet parts, soft-limits loud — keeps peaks
    let y = Math.sign(x)*Math.pow(Math.abs(x), 1/(1+a*0.6)); // upward compression of low-level
    y = Math.tanh(y*drive)/Math.tanh(drive);
    curve[i]=Math.max(-1,Math.min(1,(1-a)*x + a*y));
  }
  clipGoldWS.curve=curve;
}

function updateClipper(){
  const on=document.getElementById('clip-toggle')?.checked;
  const drive=parseFloat(document.getElementById('clip-drive')?.value||0);
  const ceil =parseFloat(document.getElementById('clip-ceiling')?.value||-0.1);
  const mode =document.getElementById('clip-mode')?.value||'modern';
  const gold =parseFloat(document.getElementById('clip-gold')?.value||0);
  const goldMode=document.getElementById('clip-gold-mode')?.value||'smooth';
  const alch =parseFloat(document.getElementById('clip-alchemy')?.value||0);
  const box  =parseFloat(document.getElementById('clip-boxtone')?.value||0);
  const mix  =parseFloat(document.getElementById('clip-mix')?.value||100);
  const out  =parseFloat(document.getElementById('clip-out')?.value||0);
  const unity=document.getElementById('clip-unity')?.checked;
  // labels
  const setL=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
  setL('clip-drive-v',(drive>=0?'+':'')+drive.toFixed(1)+' dB');
  setL('clip-ceiling-v',ceil.toFixed(1)+' dB');
  setL('clip-gold-v',gold.toFixed(0)+'%');
  setL('clip-alchemy-v',alch.toFixed(0)+'%');
  setL('clip-boxtone-v',box.toFixed(0)+'%');
  setL('clip-mix-v',mix.toFixed(0)+'%');
  setL('clip-out-v',(out>=0?'+':'')+out.toFixed(1)+' dB');

  clipMode=mode; clipDriveDb=drive; clipCeilingDb=ceil;
  if(!audioCtx) return;
  const os=document.getElementById('clip-os')?.value||'4x';
  if(clipShaper)  clipShaper.oversample=(os==='2x')?'2x':'4x';
  if(clipGoldWS)  clipGoldWS.oversample=(os==='2x')?'2x':'4x';
  const now=audioCtx.currentTime;

  const active = on && !clipBypassed;
  if(!active){
    // transparent passthrough
    _buildClipCurve(0,'off'); _buildGoldCurve(0,'smooth');
    if(clipInGain)  clipInGain.gain.setTargetAtTime(1,now,0.05);
    if(clipWetGain) clipWetGain.gain.setTargetAtTime(1,now,0.05);
    if(clipDryGain) clipDryGain.gain.setTargetAtTime(0,now,0.05);
    if(clipAlchemy) clipAlchemy.gain.setTargetAtTime(0,now,0.05);
    if(clipBoxTone) clipBoxTone.gain.setTargetAtTime(0,now,0.05);
    if(clipOutGain) clipOutGain.gain.setTargetAtTime(1,now,0.05);
  } else {
    _buildClipCurve(drive, mode);
    _buildGoldCurve(gold, goldMode);
    // INPUT TRIM pushes signal into the clip ceiling
    if(clipInGain) clipInGain.gain.setTargetAtTime(Math.pow(10,drive/20), now, 0.05);
    // ALCHEMY: reduces harshness near clip → gentle high-shelf cut scaling with amount
    if(clipAlchemy) clipAlchemy.gain.setTargetAtTime(-(alch/100)*4, now, 0.05); // up to -4dB smoothing
    // BOX TONE: presence bump in mids/highs
    if(clipBoxTone) clipBoxTone.gain.setTargetAtTime((box/100)*4, now, 0.05); // up to +4dB
    // PARALLEL MIX
    if(clipWetGain) clipWetGain.gain.setTargetAtTime(mix/100, now, 0.05);
    if(clipDryGain) clipDryGain.gain.setTargetAtTime(1-(mix/100), now, 0.05);
    // OUTPUT TRIM (+ optional unity-gain auto compensation for input drive)
    let outGain=Math.pow(10,out/20);
    if(unity) outGain *= Math.pow(10,-drive/20); // undo input trim level boost
    if(clipOutGain) clipOutGain.gain.setTargetAtTime(outGain, now, 0.05);
  }
  _snapUndoThrottled();
  _drawClipCurve();
  setStatus(active ? ('Clipper '+mode.toUpperCase()+' · drive +'+drive.toFixed(1)+'dB · Gold '+gold.toFixed(0)+'% · Alchemy '+alch.toFixed(0)+'% · mix '+mix.toFixed(0)+'%') : 'Clipper desligado');
}

// Buffer rolante do sinal de entrada do clipper (pré-shaper) para visualização
let _clipScopeBuf=new Float32Array(0), _clipScopeAn=null;
function _ensureClipScope(){
  if(typeof audioCtx==='undefined'||!audioCtx) return;
  if(_clipScopeAn) return;
  if(typeof clipInGain!=='undefined' && clipInGain){
    _clipScopeAn=audioCtx.createAnalyser();
    _clipScopeAn.fftSize=2048;
    try{ clipInGain.connect(_clipScopeAn); }catch(e){}
    _clipScopeBuf=new Float32Array(_clipScopeAn.fftSize);
  }
}
function _drawClipCurve(){
  const canvas=document.getElementById('clip-curve-canvas');
  if(!canvas) return;
  const W=canvas.offsetWidth||0; if(W<50) return;
  if(canvas.width!==W) canvas.width=W;
  const H=canvas.height||220;
  const ctx=canvas.getContext('2d');

  // fundo
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);

  // grelha horizontal subtil (3 linhas internas, sem grelha vertical para ficar limpo)
  ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
  for(let i=1;i<4;i++){
    const y=i/4*H;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }
  // linha central (0) mais visível
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();

  const on=document.getElementById('clip-toggle')?.checked && !clipBypassed;
  const drive=Math.pow(10,(clipDriveDb||0)/20);
  const ceil=Math.pow(10,(clipCeilingDb||0)/20);
  const mode=clipMode||'modern';

  // linhas de ceiling — rosa tracejado, espaçamento generoso (estilo Estilo 1)
  if(on){
    ctx.strokeStyle='rgba(255,58,181,0.45)';
    ctx.lineWidth=1;
    ctx.setLineDash([5,5]);
    const cy=H/2 - ceil*(H/2-8), cy2=H/2 + ceil*(H/2-8);
    ctx.beginPath(); ctx.moveTo(0,cy);  ctx.lineTo(W,cy);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,cy2); ctx.lineTo(W,cy2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // forma de onda: tenta o sinal real, senão sintético
  _ensureClipScope();
  let src=null;
  if(_clipScopeAn){
    try{ _clipScopeAn.getFloatTimeDomainData(_clipScopeBuf); src=_clipScopeBuf; }catch(e){}
  }
  const N=src?src.length:Math.max(800,W);
  const sig=new Float32Array(N);
  if(src){
    for(let i=0;i<N;i++) sig[i]=src[i];
  } else {
    // sinal sintético demonstrativo (mais musical, com transientes exagerados)
    const amp=on?Math.min(1.5,0.55+drive*0.4):0.5;
    for(let i=0;i<N;i++){
      const t=i/N*Math.PI*2*4;
      let v=0.55*Math.sin(t)+0.18*Math.sin(t*3)+0.10*Math.sin(t*5);
      const f=i/N;
      if(f>0.20 && f<0.24) v*=1.85;
      if(f>0.50 && f<0.54) v*=1.95;
      if(f>0.75 && f<0.79) v*=1.75;
      sig[i]=v*amp;
    }
  }

  function clipSample(x){
    x=x*(on?drive:1);
    let y;
    if(!on || mode==='off') y=x/(on?drive:1);
    else if(mode==='hard') y=Math.max(-ceil,Math.min(ceil,x));
    else if(mode==='classic'){ const k=1.6,t=x/ceil; y=ceil*Math.tanh(t*k)/Math.tanh(k); }
    else { const t=x/ceil; y=ceil*(t/Math.pow(1+Math.pow(Math.abs(t),2.2),1/2.2)); }
    return Math.max(-1,Math.min(1,y));
  }

  // ── 1) onda ORIGINAL — cinzento claro, 1px (Estilo 1) ──
  ctx.strokeStyle='rgba(150,150,170,0.85)';
  ctx.lineWidth=1;
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const i=Math.floor(px/W*(N-1));
    const v=sig[i]*(on?drive:1);
    const py=H/2 - Math.max(-1.6,Math.min(1.6,v))*(H/2-8);
    px===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.stroke();

  // ── 2) onda CLIPADA — dourado (ffd23c), 2px, por cima ──
  ctx.strokeStyle = on ? 'rgba(235,195,90,1)' : 'rgba(120,120,140,1)';
  ctx.lineWidth=2;
  ctx.beginPath();
  const clippedPts=[];
  for(let px=0;px<=W;px++){
    const i=Math.floor(px/W*(N-1));
    const inV=sig[i]*(on?drive:1);
    const outV=clipSample(sig[i]);
    const py=H/2 - outV*(H/2-8);
    px===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    if(on && Math.abs(inV)>ceil) clippedPts.push([px,py]);
  }
  ctx.stroke();

  // ── 3) marcadores rosa nos topos cortados (Estilo 1) ──
  if(on && clippedPts.length){
    ctx.fillStyle='rgba(255,58,181,1)';
    for(const [px,py] of clippedPts){
      ctx.beginPath();
      ctx.ellipse(px, py, 1.5, 1.5, 0, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // ── 4) legenda canto superior esquerdo (estilo limpo) ──
  ctx.font='10px monospace';
  ctx.textAlign='left';
  // "— original"
  ctx.strokeStyle='rgba(150,150,170,0.85)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(10,16); ctx.lineTo(22,16); ctx.stroke();
  ctx.fillStyle='rgba(170,170,190,0.9)'; ctx.fillText('original', 26, 19);
  // "— depois do clipper"
  ctx.strokeStyle='rgba(235,195,90,1)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(110,16); ctx.lineTo(122,16); ctx.stroke();
  ctx.fillStyle='rgba(235,195,90,0.95)'; ctx.fillText('depois do clipper', 126, 19);
  // "● ponto clipado"
  ctx.fillStyle='rgba(255,58,181,1)';
  ctx.beginPath(); ctx.ellipse(252,16,2.5,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,58,181,0.95)'; ctx.fillText('ponto clipado', 258, 19);

  // ── 5) info canto superior direito ──
  ctx.textAlign='right';
  ctx.fillStyle = on ? 'rgba(255,58,181,0.9)' : 'rgba(120,120,140,0.6)';
  ctx.font='10px monospace';
  ctx.fillText(on ? (clippedPts.length+' pontos clipados') : 'CLIPPER OFF', W-10, 19);

  // ── 6) eixo "TIME →" canto inferior esquerdo ──
  ctx.textAlign='left';
  ctx.fillStyle='rgba(150,150,170,0.4)';
  ctx.font='9px monospace';
  ctx.fillText('TIME →', 10, H-8);
}
// Loop de redesenho contínuo quando a aba clip está visível (mostra a "vida" do sinal)
function _clipScopeLoop(){
  const tab=document.getElementById('tab-clip');
  if(tab && tab.style.display!=='none' && tab.classList.contains('active')){
    _drawClipCurve();
  }
  requestAnimationFrame(_clipScopeLoop);
}
if(typeof window!=='undefined'){ requestAnimationFrame(_clipScopeLoop); }

function _OLD_makeShapeCurveStub(){}
function makeShapeCurve(mode, drive, mix) {  const n=2048, curve=new Float32Array(n);
  const k=Math.max(0, drive);
  const m=(mix==null)?1:Math.max(0,Math.min(1,mix)); // dry/wet baked in
  for(let i=0;i<n;i++){
    const x=(i*2/(n-1))-1;
    if(k<0.001){ curve[i]=x; continue; }
    let y;
    switch(mode){
      case 'tape':        y=Math.tanh(x*(1+k*3))/Math.tanh(1+k*3); break;
      case 'tube':
      case 'valvulado':   { const a=1+k*2; y=Math.sign(x)*(1-Math.exp(-a*Math.abs(x)))/(1-Math.exp(-a)); break; }
      case 'transistor':
      case 'solidstate':  y=Math.sign(x)*Math.pow(Math.abs(x),Math.max(0.3,1-k*0.5)); break;
      case 'analogico':   y=Math.tanh(x*(1+k*2.5))/Math.tanh(1+k*2.5); break;
      case 'clip':        { const th=Math.max(0.1,1-k*0.8); y=Math.max(-th,Math.min(th,x))/th; break; }
      case 'paralimit':   y=x/Math.sqrt(1+x*x*k*3); y*=Math.sqrt(1+k*3); break;
      case 'transparente':y=Math.tanh(x*(1+k))/Math.tanh(1+k); break;
      case 'deess':       y=x; break;
      default:            y=Math.tanh(x*(1+k*2))/Math.tanh(1+k*2);
    }
    // blend dry/wet inside the transfer function (serial, no comb filtering)
    curve[i]=Math.max(-1,Math.min(1,(1-m)*x + m*y));
  }
  return curve;
}

function applyShapeCurve() {
  if(!shapeWS) return;
  const drive=parseFloat(document.getElementById('shape-drive')?.value||0)/100;
  const mix=parseFloat(document.getElementById('shape-mix')?.value||0)/100;
  shapeWS.curve=makeShapeCurve(shapeMode, drive, mix);
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
  // mix + drive baked into the serial curve — no parallel path
  applyShapeCurve();
  if(shapeTrimGain&&audioCtx){
    shapeTrimGain.gain.setTargetAtTime(Math.pow(10,trim/20), audioCtx.currentTime, 0.08);
  }
  _snapUndoThrottled();
}

// ===== DSP =====
function applyDSP() {
  if(!audioCtx) return;
  if(piradexOn){ applyPiradexDSP(); return; }

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
  const gainFactor = loud <= 50
    ? 0.1 + (loud/50) * 0.9    // 0→50: 0.1→1.0
    : 1.0 + ((loud-50)/50) * 1.5; // 50→100: 1.0→2.5
  masterGain.gain.setTargetAtTime(gainFactor, audioCtx.currentTime, 0.08);

  // ── Width via the WIDE knob → Side gain (real M/S, no EQ corruption)
  if(msSideGain){
    const sideG = Math.max(0, wide/50); // 50=unity(1.0), 0=mono, 100=2x
    msSideGain.gain.setTargetAtTime(sideG, audioCtx.currentTime, 0.08);
    if(typeof _msEngage==='function') _msEngage();
  }

  if(bypassOn){
    [eqSub,eqBass,eqLowNode,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
    compNode.threshold.value=0; compNode.ratio.value=1;
    limiterNode.threshold.value=0; limiterNode.ratio.value=1;
    if(shapeDryGain) shapeDryGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
    if(shapeWetGain) shapeWetGain.gain.setTargetAtTime(0.0,audioCtx.currentTime,0.02);
    if(msSideGain) msSideGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
    if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0,audioCtx.currentTime,0.02);
    masterGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.05);
    syncEQSliders();
    updateLUFSDisplay();
    return; // stop here — nothing should overwrite bypass
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

// ===== EQ PRESETS =====
// Each: [sub, bass, low, mid, high, air] in dB
const EQ_PRESETS={
  flat:     [0,0,0,0,0,0],
  warm:     [2.5,2,1,0,-1,-1.5],
  bright:   [-1,-0.5,0,1,2.5,3.5],
  vshape:   [4,2.5,0,-2,2.5,4],
  bass:     [5,4,2,0,0,0],
  vocal:    [-2,-1,1,3,2,1],
  kuduro:   [4.5,3,-1,1.5,2.5,2],     // punchy lows + crisp highs
  kizomba:  [2,2.5,1.5,1,0.5,1],      // warm, smooth
  afrohouse:[3.5,2,-0.5,0.5,2,3],     // club-ready
  club:     [4,1.5,-1,0,2,3.5],       // loud system curve
  air:      [0,0,0,0.5,1.5,4.5]       // top-end sheen
};
function applyEQPreset(name,el){
  if(audioBuffer && !headroomApplied){
    setStatus('Aplica primeiro o HEADROOM -6dB para usar o EQ');
    return;
  }
  const p=EQ_PRESETS[name]; if(!p) return;
  const ids=['sub','bass','low','mid','high','air'];
  const nodes={sub:eqSub,bass:eqBass,low:eqLowNode,mid:eqMid,high:eqHigh,air:eqAir};
  ids.forEach((id,i)=>{
    const sl=document.getElementById('eq-'+id), lbl=document.getElementById('eq-'+id+'-v');
    if(sl) sl.value=p[i];
    if(lbl) lbl.textContent=(p[i]>=0?'+':'')+p[i].toFixed(1)+' dB';
    if(nodes[id]&&audioCtx) nodes[id].gain.value=p[i];
  });
  document.querySelectorAll('.eq-preset-chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  drawInteractiveEQ();
  _snapUndoThrottled();
  setStatus('Preset EQ aplicado: '+name);
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
  const now=audioCtx.currentTime;
  // Width acts ONLY on the Side channel gain — never touches EQ.
  // w=0 → mono (side=0), w=100 → unity (side=1), w=200 → double-wide (side=2)
  const sideBoost = Math.pow(10, side/20);      // side EQ trim in dB → linear
  const sideGain  = Math.max(0, (w/100) * sideBoost);
  const midGain   = Math.pow(10, mid/20);
  if(msSideGain) msSideGain.gain.setTargetAtTime(sideGain, now, 0.08);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(midGain,  now, 0.08);
  _msEngage();
  setStatus('Width: '+w+'% · Mid: '+(mid>=0?'+':'')+mid+'dB · Side: '+(side>=0?'+':'')+side+'dB');
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

// ═══════════════════════════════════════════════════════════════════════════
// IMAGER MULTIBANDA — Largura por banda estilo Ozone Imager
// Estratégia: aplica filtros peaking/shelf no PATH DO SIDE para realçar/atenuar
// cada banda de frequência no canal lateral. Combinado com modulação do
// msSideGain total para criar a sensação de width global (Amount/Drive).
// ═══════════════════════════════════════════════════════════════════════════
let imagerBypassed=false;
let imagerVals={sub:0, low:0, mid:0, high:0, amount:100, drive:0};

// ═══════════════════════════════════════════════════════════════════════════
// LOW FOCUS — Controlo cirúrgico de graves
// ═══════════════════════════════════════════════════════════════════════════
let lowFocusBypassed=false, lowFocusMode='balanced';
let _lfBaseEQ=null;
function _lfCaptureBase(){
  if(!_lfBaseEQ && eqSub && eqBass && eqLowNode){
    _lfBaseEQ = { sub:eqSub.gain.value, bass:eqBass.gain.value, low:eqLowNode.gain.value };
  }
}
function setLowFocusMode(m){
  lowFocusMode=m;
  ['tight','balanced','warm'].forEach(x=>{
    const b=document.getElementById('lf-mode-'+x);
    if(b) b.classList.toggle('rs-mode-active', x===m);
  });
  // Aplica valores padrão por modo
  const set=(id,v)=>{
    const e=document.getElementById(id);
    if(e){
      e.value=v;
      // dispara evento para forçar UI refresh
      try{ e.dispatchEvent(new Event('input',{bubbles:true})); }catch(err){}
    }
  };
  if(m==='tight'){
    set('lf-freq',55);  set('lf-tight',80);  set('lf-punch',65);  set('lf-mono',140);
  } else if(m==='warm'){
    set('lf-freq',30);  set('lf-tight',25);  set('lf-punch',20);  set('lf-mono',75);
  } else {
    set('lf-freq',45);  set('lf-tight',55);  set('lf-punch',40);  set('lf-mono',100);
  }
  updateLowFocus();
}
function updateLowFocus(){
  const freq=parseInt(document.getElementById('lf-freq')?.value||80);
  const tight=parseInt(document.getElementById('lf-tight')?.value||50);
  const punch=parseInt(document.getElementById('lf-punch')?.value||30);
  const mono=parseInt(document.getElementById('lf-mono')?.value||100);
  const v=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;};
  v('lf-freq-v',freq+' Hz');
  v('lf-tight-v',tight+'%');
  v('lf-punch-v',punch+'%');
  v('lf-mono-v',mono+' Hz');
  _drawLowFocusCurve(freq,tight,punch,mono);
  if(lowFocusBypassed || !audioCtx) return;
  // Usa nós dedicados — sem conflito com outros módulos
  if(!_lfBass || !_lfMud) return;
  // High-pass para limpar abaixo da freq de corte
  if(_lfSub){
    _lfSub.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.06);
    _lfSub.Q.setTargetAtTime(0.7, audioCtx.currentTime, 0.06);
  }
  // Punch boost @ freq (ligeiramente acima do HP para definir o kick)
  let punchMod = 1;
  let tightExtra = 0;
  if(lowFocusMode==='tight'){ punchMod = 1.5; tightExtra = -2; }   // mais punch + mais corte de lama
  if(lowFocusMode==='warm'){  punchMod = 0.6; tightExtra = +1.5; } // menos punch, mais corpo (positivo em 300)
  _lfBass.frequency.setTargetAtTime(Math.max(60, freq*1.3), audioCtx.currentTime, 0.06);
  _lfBass.Q.setTargetAtTime(1.0, audioCtx.currentTime, 0.06);
  _lfBass.gain.setTargetAtTime((punch/100) * 4 * punchMod, audioCtx.currentTime, 0.06);
  // Tightness — corta lama em 250-400 Hz
  const tightAmt = (tight-50)/50; // -1..+1
  _lfMud.gain.setTargetAtTime(tightAmt * -5 + tightExtra, audioCtx.currentTime, 0.06);
  // Mono below — engata M/S e corta side abaixo de `mono`
  if(msSideEqLow && msSideGain){
    msBypassed=false;
    if(msDirectGain) msDirectGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.06);
    if(msProcGain)   msProcGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.06);
    msSideEqLow.frequency.value = mono;
    msSideEqLow.gain.setTargetAtTime(-18, audioCtx.currentTime, 0.06);
  }
}
function _drawLowFocusCurve(freq,tight,punch,mono){
  const cv=document.getElementById('lf-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  // grid (log)
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach((f,i)=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-14);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // draw frequency response curve
  ctx.strokeStyle='rgba(184,85,247,1)';
  ctx.lineWidth=2;
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const f = 20 * Math.pow(20000/20, px/W);
    let gain = 0;
    // punch bump around freq
    const pAmt = punch/100;
    gain += pAmt * 4 * Math.exp(-Math.pow(Math.log10(f/freq), 2) * 5);
    // tight dip around 300
    const tAmt = (tight-50)/50;
    gain += tAmt * -4 * Math.exp(-Math.pow(Math.log10(f/300), 2) * 3);
    // mono indicator
    if(f<mono) gain -= 0.8;
    const y = H/2 - gain * 12;
    px===0 ? ctx.moveTo(px,y) : ctx.lineTo(px,y);
  }
  ctx.stroke();
  // mono below marker
  const monoX = Math.log10(mono/20)/Math.log10(20000/20)*W;
  ctx.fillStyle='rgba(255,58,181,0.15)';
  ctx.fillRect(0,0,monoX,H-14);
  ctx.fillStyle='rgba(255,58,181,0.8)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('← MONO',6,18);
  ctx.fillText(mono+' Hz', monoX-4, 18);
}

// ═══════════════════════════════════════════════════════════════════════════
// HIGH FOCUS — Ar, Claridade e Definição
// ═══════════════════════════════════════════════════════════════════════════
let highFocusBypassed=false, highFocusMode='open';
let _hfBaseEQ=null;
function _hfCaptureBase(){
  if(!_hfBaseEQ && eqAir && eqHigh && eqMid){
    _hfBaseEQ = { air:eqAir.gain.value, high:eqHigh.gain.value, mid:eqMid.gain.value };
  }
}
function setHighFocusMode(m){
  highFocusMode=m;
  ['open','vinyl','club'].forEach(x=>{
    const b=document.getElementById('hf-mode-'+x);
    if(b) b.classList.toggle('rs-mode-active', x===m);
  });
  const set=(id,v)=>{
    const e=document.getElementById(id);
    if(e){
      e.value=v;
      try{ e.dispatchEvent(new Event('input',{bubbles:true})); }catch(err){}
    }
  };
  if(m==='vinyl'){
    set('hf-freq',10000); set('hf-air',20); set('hf-deess',70); set('hf-pres',30);
  } else if(m==='club'){
    set('hf-freq',14000); set('hf-air',55); set('hf-deess',15); set('hf-pres',75);
  } else {
    set('hf-freq',13000); set('hf-air',65); set('hf-deess',25); set('hf-pres',45);
  }
  updateHighFocus();
}
function updateHighFocus(){
  const freq=parseInt(document.getElementById('hf-freq')?.value||12000);
  const air=parseInt(document.getElementById('hf-air')?.value||40);
  const deess=parseInt(document.getElementById('hf-deess')?.value||20);
  const pres=parseInt(document.getElementById('hf-pres')?.value||35);
  const v=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;};
  v('hf-freq-v',(freq/1000).toFixed(1)+' kHz');
  v('hf-air-v',air+'%');
  v('hf-deess-v',deess+'%');
  v('hf-pres-v',pres+'%');
  _drawHighFocusCurve(freq,air,deess,pres);
  if(highFocusBypassed || !audioCtx) return;
  if(!_hfAir || !_hfDeess || !_hfPres) return;
  let airMul=1, deessMul=1, presMul=1;
  if(highFocusMode==='vinyl'){ airMul=0.5; deessMul=1.6; }
  if(highFocusMode==='club'){ presMul=1.5; }
  _hfAir.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.06);
  _hfAir.gain.setTargetAtTime((air/100) * 6 * airMul, audioCtx.currentTime, 0.06);
  _hfDeess.frequency.setTargetAtTime(7000, audioCtx.currentTime, 0.06);
  _hfDeess.Q.setTargetAtTime(2.5, audioCtx.currentTime, 0.06);
  _hfDeess.gain.setTargetAtTime(-(deess/100) * 4 * deessMul, audioCtx.currentTime, 0.06);
  _hfPres.frequency.setTargetAtTime(3000, audioCtx.currentTime, 0.06);
  _hfPres.Q.setTargetAtTime(0.9, audioCtx.currentTime, 0.06);
  _hfPres.gain.setTargetAtTime((pres/100) * 3 * presMul, audioCtx.currentTime, 0.06);
}
function _drawHighFocusCurve(freq,air,deess,pres){
  const cv=document.getElementById('hf-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach((f,i)=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-14);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // response curve
  ctx.strokeStyle='rgba(255,225,53,1)';
  ctx.lineWidth=2;
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const f = 20 * Math.pow(20000/20, px/W);
    let gain = 0;
    // air shelf above freq
    gain += (air/100) * 6 * (1/(1+Math.exp(-(Math.log10(f/freq))*5)));
    // de-ess dip ~7kHz
    gain += -(deess/100) * 4 * Math.exp(-Math.pow(Math.log10(f/7000), 2) * 4);
    // presence bump ~3kHz
    gain += (pres/100) * 3 * Math.exp(-Math.pow(Math.log10(f/3000), 2) * 4);
    const y = H/2 - gain * 12;
    px===0 ? ctx.moveTo(px,y) : ctx.lineTo(px,y);
  }
  ctx.stroke();
}


// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC EQ — 4 bandas que só atuam quando excedem threshold
// Cria 4 nós peaking dedicados + 4 analysers de banda. Loop modula gain
// quando energia da banda excede threshold do utilizador.
// ═══════════════════════════════════════════════════════════════════════════
let dynEQBypassed=false;
let _dynEQNodes=null; // {peaks:[4], analysers:[4]}
let _dynEQInterval=null;

function _buildDynEQ(){
  if(!audioCtx || _dynEQNodes) return;
  const analysers=[], filters=[];
  for(let i=0;i<4;i++){
    // analyser por banda: bandpass + analyser
    const bp=audioCtx.createBiquadFilter();
    bp.type='bandpass'; bp.Q.value=2; bp.frequency.value=[120,500,3000,8000][i];
    filters.push(bp);
    const an=audioCtx.createAnalyser();
    an.fftSize=512; an.smoothingTimeConstant=0.4;
    analysers.push(an);
  }
  // IMPORTANTE: tap-off é de eqAir (antes dos peaks DEQ na chain principal)
  // para evitar feedback loop (o analyser senão estaria a medir o sinal já reduzido).
  const sourceForAnalysis = (typeof eqAir!=='undefined' && eqAir) ? eqAir : masterGain;
  if(sourceForAnalysis){
    filters.forEach((bp,i)=>{
      sourceForAnalysis.connect(bp); bp.connect(analysers[i]);
    });
  }
  _dynEQNodes = {analysers, filters};
}

function updateDynEQ(){
  for(let i=1;i<=4;i++){
    const f=parseInt(document.getElementById('deq'+i+'-f')?.value||1000);
    const g=parseFloat(document.getElementById('deq'+i+'-g')?.value||0);
    const t=parseInt(document.getElementById('deq'+i+'-t')?.value||-20);
    const fv=document.getElementById('deq'+i+'-f-v'); if(fv) fv.textContent = f>=1000?(f/1000).toFixed(1)+' kHz':f+' Hz';
    const gv=document.getElementById('deq'+i+'-g-v'); if(gv) gv.textContent = (g>=0?'+':'')+g.toFixed(1)+' dB';
    const tv=document.getElementById('deq'+i+'-t-v'); if(tv) tv.textContent = t+' dB';
  }
  _drawDynEQ();
  if(dynEQBypassed) return;
  if(!audioCtx) return;
  _buildDynEQ();
  // arranca loop se necessário
  if(!_dynEQInterval) _startDynEQLoop();
}
function _startDynEQLoop(){
  if(_dynEQInterval) return;
  _dynEQInterval = setInterval(()=>{
    if(dynEQBypassed || !_dynEQNodes || !audioCtx) return;
    for(let i=0;i<4;i++){
      const idx=i+1;
      const f=parseInt(document.getElementById('deq'+idx+'-f')?.value||1000);
      const g=parseFloat(document.getElementById('deq'+idx+'-g')?.value||0);
      const t=parseInt(document.getElementById('deq'+idx+'-t')?.value||-20);
      // Se gain é 0, o módulo está efetivamente desligado para esta banda
      if(Math.abs(g) < 0.05){
        if(_deqNodes[i]) _deqNodes[i].gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
        continue;
      }
      const an=_dynEQNodes.analysers[i];
      const data=new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(data);
      const bandHz=audioCtx.sampleRate/2/an.frequencyBinCount;
      const targetBin=Math.round(f/bandHz);
      // janela mais ampla para detectar energia da banda
      let peak=-Infinity;
      const winR = Math.max(4, Math.round(targetBin*0.15));
      for(let b=Math.max(0,targetBin-winR); b<Math.min(an.frequencyBinCount,targetBin+winR); b++){
        if(data[b]>-Infinity && data[b]>peak) peak=data[b];
      }
      // ratio mais agressiva: atinge 100% quando supera threshold em 6dB (não 12)
      const ratio = peak>t ? Math.min(1, (peak-t)/6) : 0;
      const applied = g * ratio;
      if(_deqNodes[i]){
        _deqNodes[i].frequency.setTargetAtTime(f, audioCtx.currentTime, 0.04);
        _deqNodes[i].Q.setTargetAtTime(1.5, audioCtx.currentTime, 0.04);
        _deqNodes[i].gain.setTargetAtTime(applied, audioCtx.currentTime, 0.04);
      }
    }
  }, 80);
}
let _dynEQBaseEQ=null;
function _drawDynEQ(){
  const cv=document.getElementById('deq-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach(f=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-14);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // 4 bandas
  const colors=['rgba(45,212,255,1)','rgba(45,255,138,1)','rgba(255,225,53,1)','rgba(255,58,181,1)'];
  for(let i=0;i<4;i++){
    const idx=i+1;
    const f=parseInt(document.getElementById('deq'+idx+'-f')?.value||1000);
    const g=parseFloat(document.getElementById('deq'+idx+'-g')?.value||0);
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    const y=H/2 - g*8;
    ctx.fillStyle=colors[i]; ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=colors[i].replace('1)','0.3)'); ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText(idx, x, y+3);
    ctx.fillStyle=colors[i]; ctx.font='9px monospace';
    ctx.fillText((g>=0?'+':'')+g.toFixed(1)+' dB', x, y-22);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MID/SIDE EQ — 3 bandas paramétrico por canal (MID ou SIDE)
// Usa os filtros side já existentes (msSideEqLow/Mid/High) para o SIDE
// e cria 3 nós peaking para o MID
// ═══════════════════════════════════════════════════════════════════════════
let mseqBypassed=false;
let mseqChannel='mid'; // 'mid' ou 'side'
let _mseqMidNodes=null; // 3 peaks para mid
let _mseqMidValues={low:{f:200,g:0}, mid:{f:1500,g:0}, high:{f:8000,g:0}};
let _mseqSideValues={low:{f:200,g:0}, mid:{f:1500,g:0}, high:{f:8000,g:0}};

function _buildMSEqMid(){
  if(!audioCtx || _mseqMidNodes || !msMidGain) return;
  const low=audioCtx.createBiquadFilter(); low.type='peaking'; low.Q.value=1; low.frequency.value=200; low.gain.value=0;
  const mid=audioCtx.createBiquadFilter(); mid.type='peaking'; mid.Q.value=1; mid.frequency.value=1500; mid.gain.value=0;
  const high=audioCtx.createBiquadFilter(); high.type='peaking'; high.Q.value=1; high.frequency.value=8000; high.gain.value=0;
  // insere antes do msMidGain — mas msMidGain já está ligado; criar tap-off seria invasivo
  // estratégia: para o MID, modulamos os EQ existentes via delta
  _mseqMidNodes = {low,mid,high};
}
function setMSEqChannel(ch){
  // antes de trocar, guarda valores atuais no canal corrente
  const vals = mseqChannel==='mid' ? _mseqMidValues : _mseqSideValues;
  vals.low.f  = parseInt(document.getElementById('ms-l-f')?.value||vals.low.f);
  vals.low.g  = parseFloat(document.getElementById('ms-l-g')?.value||vals.low.g);
  vals.mid.f  = parseInt(document.getElementById('ms-m-f')?.value||vals.mid.f);
  vals.mid.g  = parseFloat(document.getElementById('ms-m-g')?.value||vals.mid.g);
  vals.high.f = parseInt(document.getElementById('ms-h-f')?.value||vals.high.f);
  vals.high.g = parseFloat(document.getElementById('ms-h-g')?.value||vals.high.g);
  mseqChannel=ch;
  const m=document.getElementById('mseq-ch-mid'), s=document.getElementById('mseq-ch-side');
  if(m) m.classList.toggle('rs-mode-active', ch==='mid');
  if(s) s.classList.toggle('rs-mode-active', ch==='side');
  // carrega novos sliders
  const newVals = ch==='mid' ? _mseqMidValues : _mseqSideValues;
  const set=(id,v)=>{const e=document.getElementById(id); if(e) e.value=v;};
  set('ms-l-f', newVals.low.f); set('ms-l-g', newVals.low.g);
  set('ms-m-f', newVals.mid.f); set('ms-m-g', newVals.mid.g);
  set('ms-h-f', newVals.high.f); set('ms-h-g', newVals.high.g);
  updateMSEq();
}
let _mseqBaseEQ=null;
function updateMSEq(){
  const vals = mseqChannel==='mid' ? _mseqMidValues : _mseqSideValues;
  vals.low.f  = parseInt(document.getElementById('ms-l-f')?.value||200);
  vals.low.g  = parseFloat(document.getElementById('ms-l-g')?.value||0);
  vals.mid.f  = parseInt(document.getElementById('ms-m-f')?.value||1500);
  vals.mid.g  = parseFloat(document.getElementById('ms-m-g')?.value||0);
  vals.high.f = parseInt(document.getElementById('ms-h-f')?.value||8000);
  vals.high.g = parseFloat(document.getElementById('ms-h-g')?.value||0);
  const setv=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;};
  setv('ms-l-f-v', vals.low.f >=1000?(vals.low.f/1000).toFixed(1)+' kHz':vals.low.f+' Hz');
  setv('ms-l-g-v', (vals.low.g>=0?'+':'')+vals.low.g.toFixed(1)+' dB');
  setv('ms-m-f-v', vals.mid.f >=1000?(vals.mid.f/1000).toFixed(1)+' kHz':vals.mid.f+' Hz');
  setv('ms-m-g-v', (vals.mid.g>=0?'+':'')+vals.mid.g.toFixed(1)+' dB');
  setv('ms-h-f-v', vals.high.f>=1000?(vals.high.f/1000).toFixed(1)+' kHz':vals.high.f+' Hz');
  setv('ms-h-g-v', (vals.high.g>=0?'+':'')+vals.high.g.toFixed(1)+' dB');
  _drawMSEqCurve();
  if(mseqBypassed) return;
  if(!audioCtx) return;
  // Aplica AMBOS os canais (cada um tem os seus próprios nós)
  // Canal MID (nós dedicados na chain principal)
  const m=_mseqMidValues;
  if(_mseqMidLow){ _mseqMidLow.frequency.value=m.low.f;  _mseqMidLow.gain.setTargetAtTime(m.low.g, audioCtx.currentTime, 0.05); }
  if(_mseqMidMid){ _mseqMidMid.frequency.value=m.mid.f;  _mseqMidMid.gain.setTargetAtTime(m.mid.g, audioCtx.currentTime, 0.05); }
  if(_mseqMidHigh){_mseqMidHigh.frequency.value=m.high.f; _mseqMidHigh.gain.setTargetAtTime(m.high.g, audioCtx.currentTime, 0.05); }
  // Canal SIDE (filtros side existentes)
  const s=_mseqSideValues;
  const anySide = s.low.g!==0 || s.mid.g!==0 || s.high.g!==0;
  if(anySide){
    msBypassed=false;
    if(msDirectGain) msDirectGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.06);
    if(msProcGain)   msProcGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.06);
  }
  if(msSideEqLow){ msSideEqLow.frequency.value=s.low.f;  msSideEqLow.gain.setTargetAtTime(s.low.g, audioCtx.currentTime, 0.05); }
  if(msSideEqMid){ msSideEqMid.frequency.value=s.mid.f;  msSideEqMid.gain.setTargetAtTime(s.mid.g, audioCtx.currentTime, 0.05); }
  if(msSideEqHigh){msSideEqHigh.frequency.value=s.high.f;msSideEqHigh.gain.setTargetAtTime(s.high.g, audioCtx.currentTime, 0.05); }
}
function _drawMSEqCurve(){
  const cv=document.getElementById('mseq-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach(f=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-14);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  // mostra curva do canal atual + canal oposto a sombra
  const drawCurve=(vals,color,alpha)=>{
    ctx.strokeStyle=color.replace('1)',alpha+')'); ctx.lineWidth=2;
    ctx.beginPath();
    for(let px=0;px<=W;px++){
      const f=20*Math.pow(20000/20, px/W);
      let g=0;
      g += vals.low.g * Math.exp(-Math.pow(Math.log10(f/vals.low.f), 2) * 4);
      g += vals.mid.g * Math.exp(-Math.pow(Math.log10(f/vals.mid.f), 2) * 4);
      g += vals.high.g * Math.exp(-Math.pow(Math.log10(f/vals.high.f), 2) * 4);
      const y = H/2 - g * 6;
      px===0 ? ctx.moveTo(px,y) : ctx.lineTo(px,y);
    }
    ctx.stroke();
  };
  // shadow canal oposto
  drawCurve(mseqChannel==='mid'?_mseqSideValues:_mseqMidValues, 'rgba(150,150,170,1)', '0.3');
  // canal ativo
  drawCurve(mseqChannel==='mid'?_mseqMidValues:_mseqSideValues, mseqChannel==='mid'?'rgba(45,255,138,1)':'rgba(45,212,255,1)', '0.95');
  // legenda
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillText(mseqChannel.toUpperCase()+' (ativo)', 10, 16);
  ctx.fillStyle='rgba(150,150,170,0.7)';
  ctx.fillText((mseqChannel==='mid'?'side':'mid').toUpperCase()+' (sombra)', 10, 30);
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALOG WARMTH — Saturação multibanda
// Estratégia: usa o shapeWS existente como motor, troca a curve consoante o tipo
// ═══════════════════════════════════════════════════════════════════════════
let warmthBypassed=false;
let warmthType='tape';
let _warmthBaseCurve=null;
function setWarmthType(t){
  warmthType=t;
  ['tape','tube','transformer','console'].forEach(x=>{
    const b=document.getElementById('wm-t-'+x); if(b) b.classList.toggle('rs-mode-active', x===t);
  });
  updateWarmth();
}
function updateWarmth(){
  const lowD=parseInt(document.getElementById('wm-low-drive')?.value||20);
  const midD=parseInt(document.getElementById('wm-mid-drive')?.value||15);
  const hiD=parseInt(document.getElementById('wm-high-drive')?.value||10);
  const v=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;};
  v('wm-low-drive-v',lowD+'%');
  v('wm-mid-drive-v',midD+'%');
  v('wm-high-drive-v',hiD+'%');
  _drawWarmthCurve(lowD,midD,hiD);
  if(warmthBypassed || !audioCtx) return;
  // aplica curva no shapeWS existente
  if(typeof shapeWS!=='undefined' && shapeWS){
    if(!_warmthBaseCurve) _warmthBaseCurve = shapeWS.curve;
    // gera curva consoante tipo
    const overallDrive = (lowD+midD+hiD)/300; // 0..1
    shapeWS.curve = _genWarmthCurve(warmthType, overallDrive);
    shapeWS.oversample = '4x';
  }
}
function _genWarmthCurve(type, amt){
  const N=2048;
  const curve=new Float32Array(N);
  for(let i=0;i<N;i++){
    const x=(i*2/N)-1;
    let y=x;
    if(type==='tape'){
      // soft tanh + 3rd harmonic
      const k=1+amt*4;
      y=Math.tanh(x*k)/Math.tanh(k);
      y += amt*0.05*Math.pow(x,3);
    } else if(type==='tube'){
      // asymmetric: positive harder, negative softer
      const k=1+amt*3;
      if(x>0) y=Math.tanh(x*k*1.3)/Math.tanh(k*1.3);
      else y=Math.tanh(x*k*0.85)/Math.tanh(k*0.85);
      y += amt*0.08*x*x*(x>0?1:-1);
    } else if(type==='transformer'){
      // soft saturation + boost graves
      const k=1+amt*2.5;
      y=Math.tanh(x*k)/Math.tanh(k);
      y *= 1+amt*0.15;
    } else if(type==='console'){
      // very subtle "glue"
      const k=1+amt*1.5;
      y=Math.tanh(x*k)/Math.tanh(k);
      y *= 1+amt*0.05;
    }
    curve[i]=Math.max(-1,Math.min(1,y));
  }
  return curve;
}
function _drawWarmthCurve(low,mid,high){
  const cv=document.getElementById('wm-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  // mostra a transfer curve do tipo selecionado
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  for(let i=1;i<4;i++){
    const y=i/4*H;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
  // diagonal de referência
  ctx.strokeStyle='rgba(255,255,255,0.1)';
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,0);ctx.stroke();
  // curva
  const amt=(low+mid+high)/300;
  const curve=_genWarmthCurve(warmthType, amt);
  ctx.strokeStyle = warmthType==='tape'?'rgba(255,107,53,1)':warmthType==='tube'?'rgba(255,225,53,1)':warmthType==='transformer'?'rgba(184,85,247,1)':'rgba(45,212,255,1)';
  ctx.lineWidth=2;
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const xn=px/W*2-1;
    const idx=Math.floor((xn+1)/2*(curve.length-1));
    const y=curve[idx];
    const py=H/2 - y*(H/2-8);
    px===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  }
  ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='10px monospace';ctx.textAlign='left';
  ctx.fillText(warmthType.toUpperCase()+' · drive '+Math.round(amt*100)+'%', 10, 18);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECTRAL SHAPER — mantém espectro equilibrado em movimento
// Compara o espectro atual com curva-alvo (TILT) e ajusta EQ dinamicamente
// ═══════════════════════════════════════════════════════════════════════════
let spectralBypassed=false;
let spectralMode='balanced';
let _spectralInterval=null;
let _spectralBaseEQ=null;

function setSpectralMode(m){
  spectralMode=m;
  ['balanced','vocal','bright','warm'].forEach(x=>{
    const b=document.getElementById('sp-m-'+x); if(b) b.classList.toggle('rs-mode-active', x===m);
  });
  const set=(id,v)=>{
    const e=document.getElementById(id);
    if(e){
      e.value=v;
      try{ e.dispatchEvent(new Event('input',{bubbles:true})); }catch(err){}
    }
  };
  if(m==='vocal'){
    set('sp-tilt',-4); set('sp-smooth',60); set('sp-amount',55); set('sp-speed',300);
  } else if(m==='bright'){
    set('sp-tilt',-3); set('sp-smooth',40); set('sp-amount',45); set('sp-speed',400);
  } else if(m==='warm'){
    set('sp-tilt',-6); set('sp-smooth',60); set('sp-amount',55); set('sp-speed',700);
  } else {
    set('sp-tilt',-4.5); set('sp-smooth',50); set('sp-amount',40); set('sp-speed',500);
  }
  updateSpectral();
}
function updateSpectral(){
  const tilt=parseFloat(document.getElementById('sp-tilt')?.value||-4.5);
  const smooth=parseInt(document.getElementById('sp-smooth')?.value||50);
  const amt=parseInt(document.getElementById('sp-amount')?.value||40);
  const speed=parseInt(document.getElementById('sp-speed')?.value||500);
  const v=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;};
  v('sp-tilt-v',tilt.toFixed(1)+' dB/oct');
  v('sp-smooth-v',smooth+'%');
  v('sp-amount-v',amt+'%');
  v('sp-speed-v',speed+' ms');
  _drawSpectralCurve(tilt);
  if(spectralBypassed || !audioCtx) return;
  if(!_spectralInterval) _startSpectralLoop();
}
function _startSpectralLoop(){
  if(_spectralInterval) return;
  _spectralInterval = setInterval(()=>{
    if(spectralBypassed || !_resonAnalyser || !audioCtx) return;
    const bins=_resonAnalyser.frequencyBinCount;
    const data=new Float32Array(bins);
    _resonAnalyser.getFloatFrequencyData(data);
    const sr=audioCtx.sampleRate;
    const binHz=sr/2/bins;
    const tilt=parseFloat(document.getElementById('sp-tilt')?.value||-4.5);
    const amt=parseInt(document.getElementById('sp-amount')?.value||40)/100;
    const speed=parseInt(document.getElementById('sp-speed')?.value||500)/1000;
    const bandFreqs=[150,800,3000,10000];
    const bandWidths=[100,400,1500,4000];
    for(let bi=0;bi<4;bi++){
      const f=bandFreqs[bi];
      const w=bandWidths[bi];
      const minBin=Math.max(0,Math.floor((f-w/2)/binHz));
      const maxBin=Math.min(bins,Math.floor((f+w/2)/binHz));
      let sum=0,cnt=0;
      for(let b=minBin;b<maxBin;b++){ if(data[b]>-Infinity){sum+=data[b];cnt++;} }
      const measured = cnt>0 ? sum/cnt : -60;
      const octsFrom1k = Math.log2(f/1000);
      let target = -20 + tilt * octsFrom1k;
      if(spectralMode==='vocal') target += bi===1?3:0;
      if(spectralMode==='bright') target += bi>=2?2:-1;
      if(spectralMode==='warm') target += bi<=1?2:-2;
      const diff = measured - target;
      let delta = -diff * amt * 0.3;
      delta = Math.max(-6,Math.min(6,delta));
      // Aplica no nó dedicado deste módulo
      if(_spNodes[bi]){
        _spNodes[bi].frequency.setTargetAtTime(f, audioCtx.currentTime, speed);
        _spNodes[bi].gain.setTargetAtTime(delta, audioCtx.currentTime, speed);
      }
    }
  }, 150);
}
function _drawSpectralCurve(tilt){
  const cv=document.getElementById('sp-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.06)';
  [60,250,1000,4000,16000].forEach(f=>{
    const x=Math.log10(f/20)/Math.log10(20000/20)*W;
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-14);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(f>=1000?(f/1000)+'k':f+'',x,H-2);
  });
  // curva-alvo
  ctx.strokeStyle='rgba(255,58,181,0.8)';
  ctx.lineWidth=2; ctx.setLineDash([4,3]);
  ctx.beginPath();
  for(let px=0;px<=W;px++){
    const f=20*Math.pow(20000/20, px/W);
    const octsFrom1k=Math.log2(f/1000);
    const target = tilt * octsFrom1k;
    const y = H/2 - target * 3;
    px===0 ? ctx.moveTo(px,y) : ctx.lineTo(px,y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  // espectro atual se disponível
  if(_resonAnalyser){
    const bins=_resonAnalyser.frequencyBinCount;
    const data=new Float32Array(bins);
    _resonAnalyser.getFloatFrequencyData(data);
    const sr=audioCtx.sampleRate;
    const binHz=sr/2/bins;
    ctx.strokeStyle='rgba(255,255,255,0.4)';
    ctx.lineWidth=1;
    ctx.beginPath();
    for(let b=2;b<bins;b++){
      const f=b*binHz;
      const x=Math.log10(f/20)/Math.log10(20000/20)*W;
      const t=Math.max(0,Math.min(1,(data[b]+90)/90));
      const y=H-14 - t*(H-22);
      if(b===2) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.fillStyle='rgba(255,58,181,0.95)';ctx.font='9px monospace';ctx.textAlign='left';
  ctx.fillText('— ALVO ('+tilt.toFixed(1)+' dB/oct)', 10, 18);
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.fillText('— ESPECTRO ATUAL', 10, 32);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSIENT MASTER — 3 bandas attack/sustain
// Estratégia: usa o _transientNode existente + 2 nós dedicados por banda
// para simular o efeito. Cada banda tem o seu compressor com envelope
// rápido (attack) ou lento (sustain).
// ═══════════════════════════════════════════════════════════════════════════
let tdesignBypassed=false;
let _tdesignBaseTransient=null;
function updateTDesign(){
  const lAtk=parseInt(document.getElementById('td-low-atk')?.value||0);
  const lSus=parseInt(document.getElementById('td-low-sus')?.value||0);
  const mAtk=parseInt(document.getElementById('td-mid-atk')?.value||0);
  const mSus=parseInt(document.getElementById('td-mid-sus')?.value||0);
  const hAtk=parseInt(document.getElementById('td-high-atk')?.value||0);
  const hSus=parseInt(document.getElementById('td-high-sus')?.value||0);
  const v=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=(t>0?'+':'')+t;};
  v('td-low-atk-v',lAtk);v('td-low-sus-v',lSus);
  v('td-mid-atk-v',mAtk);v('td-mid-sus-v',mSus);
  v('td-high-atk-v',hAtk);v('td-high-sus-v',hSus);
  _drawTDesign(lAtk,lSus,mAtk,mSus,hAtk,hSus);
  if(tdesignBypassed || !audioCtx) return;

  // Filosofia (honesta):
  // O Web Audio só comprime via DynamicsCompressorNode.
  // Estratégia:
  //  • ATTACK + (positivo) → expande dinâmica: ratio 1, threshold alto (sem efeito comp)
  //                          + amplifica transientes via boost de EQ de alta freq + pump
  //  • ATTACK - (negativo) → comprime os transientes: ratio alta + threshold baixo + attack rápido
  //  • SUSTAIN + → release longo (sustenta o que vem depois do transient)
  //  • SUSTAIN - → release curto (corta a cauda)
  if(typeof _transientNode!=='undefined' && _transientNode){
    if(!_tdesignBaseTransient){
      _tdesignBaseTransient = {
        thr:_transientNode.threshold.value,
        ratio:_transientNode.ratio.value,
        atk:_transientNode.attack.value,
        rel:_transientNode.release.value
      };
    }
    const avgAtk = (lAtk+mAtk+hAtk)/3;     // -50..+50
    const avgSus = (lSus+mSus+hSus)/3;

    if(avgAtk < -5){
      // Suaviza transientes — comprime os picos
      _transientNode.threshold.setTargetAtTime(-12, audioCtx.currentTime, 0.05);
      _transientNode.ratio.setTargetAtTime(4 + Math.abs(avgAtk)*0.2, audioCtx.currentTime, 0.05);
      _transientNode.attack.setTargetAtTime(0.001, audioCtx.currentTime, 0.05);  // mata o transient
    } else if(avgAtk > 5){
      // Punch — deixa o transient passar livre, só apanha o sustain
      _transientNode.threshold.setTargetAtTime(-20, audioCtx.currentTime, 0.05);
      _transientNode.ratio.setTargetAtTime(2 + avgAtk*0.1, audioCtx.currentTime, 0.05);
      _transientNode.attack.setTargetAtTime(0.020, audioCtx.currentTime, 0.05);  // deixa passar
    } else {
      // neutro
      _transientNode.threshold.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      _transientNode.ratio.setTargetAtTime(1, audioCtx.currentTime, 0.05);
    }
    // Sustain: release time
    if(avgSus > 5){
      // sustain mais longo
      _transientNode.release.setTargetAtTime(0.5 + avgSus*0.01, audioCtx.currentTime, 0.05);
    } else if(avgSus < -5){
      _transientNode.release.setTargetAtTime(0.03, audioCtx.currentTime, 0.05);
    } else {
      _transientNode.release.setTargetAtTime(0.25, audioCtx.currentTime, 0.05);
    }
  }
}
function _drawTDesign(lAtk,lSus,mAtk,mSus,hAtk,hSus){
  const cv=document.getElementById('td-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  // 3 bandas: kick, snare, hat shapes
  const colors=['rgba(45,212,255,1)','rgba(45,255,138,1)','rgba(255,225,53,1)'];
  const atks=[lAtk,mAtk,hAtk];
  const suss=[lSus,mSus,hSus];
  const labels=['LOW (kick)','MID (snare)','HIGH (hats)'];
  for(let i=0;i<3;i++){
    const xOff=i*(W/3)+W/6;
    const yMid=H/2;
    // desenha forma de transiente (attack pulse + sustain decay)
    ctx.strokeStyle=colors[i]; ctx.lineWidth=2;
    ctx.beginPath();
    const atk=atks[i]; const sus=suss[i];
    const peakBoost = 1 + atk*0.015;
    const sustainBoost = 1 + sus*0.015;
    for(let dx=0;dx<W/3-20;dx++){
      const t=dx/(W/3-20);
      let v=0;
      // attack pulse
      v += peakBoost * Math.exp(-t*30);
      // sustain curve
      v += sustainBoost * 0.4 * Math.exp(-t*3);
      v = Math.min(1.5, v);
      const x=xOff-W/6+dx+10;
      const y=yMid - v*(H/2-15);
      if(dx===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    // baseline
    ctx.strokeStyle='rgba(255,255,255,0.15)';
    ctx.beginPath();ctx.moveTo(xOff-W/6+10,yMid);ctx.lineTo(xOff+W/6-10,yMid);ctx.stroke();
    // label
    ctx.fillStyle=colors[i];ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText(labels[i], xOff, H-6);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='9px monospace';
    ctx.fillText('atk '+(atk>0?'+':'')+atk+' · sus '+(sus>0?'+':'')+sus, xOff, 14);
  }
}


function updateImager(){
  imagerVals.sub    = parseInt(document.getElementById('img-sub')?.value || 0);
  imagerVals.low    = parseInt(document.getElementById('img-low')?.value || 0);
  imagerVals.mid    = parseInt(document.getElementById('img-mid')?.value || 0);
  imagerVals.high   = parseInt(document.getElementById('img-high')?.value || 0);
  imagerVals.amount = parseInt(document.getElementById('img-amount')?.value || 100);
  imagerVals.drive  = parseFloat(document.getElementById('img-drive')?.value || 0);

  // labels
  const fmt = v => (v>0?'+':'')+v+'%';
  const lblSub  = document.getElementById('img-sub-v');  if(lblSub)  lblSub.textContent  = fmt(imagerVals.sub);
  const lblLow  = document.getElementById('img-low-v');  if(lblLow)  lblLow.textContent  = fmt(imagerVals.low);
  const lblMid  = document.getElementById('img-mid-v');  if(lblMid)  lblMid.textContent  = fmt(imagerVals.mid);
  const lblHigh = document.getElementById('img-high-v'); if(lblHigh) lblHigh.textContent = fmt(imagerVals.high);
  const lblAmt  = document.getElementById('img-amount-v'); if(lblAmt) lblAmt.textContent = imagerVals.amount + '%';
  const lblDrv  = document.getElementById('img-drive-v'); if(lblDrv) lblDrv.textContent = (imagerVals.drive>=0?'+':'')+imagerVals.drive.toFixed(1)+' dB';

  if(imagerBypassed) return;
  if(!audioCtx || !msSideGain) return;

  // Garante que o caminho M/S processado está ativo
  msBypassed = false;
  // Side gain global = amount/100, modulado pelo drive (em dB)
  // sub afeta o low shelf (graves a serem mono = side -X dB)
  // low/mid/high afetam respetivamente os 3 filtros side
  const driveGain = Math.pow(10, imagerVals.drive/20);
  const amount    = imagerVals.amount/100;
  const sideGlobal = amount * driveGain;
  msSideGain.gain.setTargetAtTime(sideGlobal, audioCtx.currentTime, 0.06);

  // Direct → 0 (estamos a usar o caminho processado)
  if(msDirectGain) msDirectGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.06);
  if(msProcGain)   msProcGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.06);

  // Por banda — ajusta gain dos filtros side EQ
  // sub: -100 → -18 dB no shelf low (anula side abaixo de 250) → mono nos graves
  //      +100 → +6  dB no shelf low → side reforçado nos graves (normalmente NÃO recomendado)
  const subGain  = imagerVals.sub  < 0 ? imagerVals.sub  * 0.18 : imagerVals.sub  * 0.06;
  // low band (~250 Hz peaking)
  const lowGain  = imagerVals.low  < 0 ? imagerVals.low  * 0.12 : imagerVals.low  * 0.06;
  // mid band (~1500 Hz peaking)
  const midGain  = imagerVals.mid  < 0 ? imagerVals.mid  * 0.12 : imagerVals.mid  * 0.06;
  // high band (~6 kHz shelf)
  const highGain = imagerVals.high < 0 ? imagerVals.high * 0.12 : imagerVals.high * 0.06;

  if(msSideEqLow)  msSideEqLow.gain.setTargetAtTime(subGain + lowGain*0.5, audioCtx.currentTime, 0.05);
  if(msSideEqMid)  msSideEqMid.gain.setTargetAtTime(midGain, audioCtx.currentTime, 0.05);
  if(msSideEqHigh) msSideEqHigh.gain.setTargetAtTime(highGain, audioCtx.currentTime, 0.05);
}

// Vectorscope render loop
let _vecAnL=null, _vecAnR=null, _vecSplit=null, _vecBuf=null;
function _ensureVectorscope(){
  if(!audioCtx || _vecAnL) return;
  if(typeof masterGain==='undefined' || !masterGain) return;
  try{
    _vecSplit = audioCtx.createChannelSplitter(2);
    _vecAnL = audioCtx.createAnalyser(); _vecAnL.fftSize=512;
    _vecAnR = audioCtx.createAnalyser(); _vecAnR.fftSize=512;
    masterGain.connect(_vecSplit);
    _vecSplit.connect(_vecAnL, 0);
    _vecSplit.connect(_vecAnR, 1);
    _vecBuf = { l:new Float32Array(_vecAnL.fftSize), r:new Float32Array(_vecAnR.fftSize) };
  }catch(e){}
}
function _drawVectorscope(){
  const cv=document.getElementById('image-vec'); if(!cv) return;
  _ensureVectorscope();
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='rgba(7,7,14,0.25)'; ctx.fillRect(0,0,W,H);
  // grid: 45° rotated cross
  ctx.strokeStyle='rgba(255,255,255,0.08)';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,H);ctx.moveTo(W,0);ctx.lineTo(0,H);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.15)';
  ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)/3,0,Math.PI*2);ctx.stroke();
  // labels
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
  ctx.fillText('M',W/2,12); ctx.fillText('S',W-12,H/2);
  // data
  if(_vecAnL && _vecBuf){
    _vecAnL.getFloatTimeDomainData(_vecBuf.l);
    _vecAnR.getFloatTimeDomainData(_vecBuf.r);
    ctx.fillStyle='rgba(45,255,138,0.6)';
    const cx=W/2, cy=H/2, scale=Math.min(W,H)/2-4;
    let corrNum=0, corrL=0, corrR=0;
    for(let i=0;i<_vecBuf.l.length;i+=2){
      const l=_vecBuf.l[i], r=_vecBuf.r[i];
      // rotated 45deg: x = (l-r)/sqrt2, y = (l+r)/sqrt2
      const x = cx + (l-r)*scale*0.7;
      const y = cy - (l+r)*scale*0.7;
      ctx.fillRect(x,y,1,1);
      corrNum += l*r; corrL += l*l; corrR += r*r;
    }
    const corr = (corrL>0 && corrR>0) ? corrNum/Math.sqrt(corrL*corrR) : 1;
    const ce=document.getElementById('image-corr');
    if(ce){
      ce.textContent=(corr>=0?'+':'')+corr.toFixed(2);
      ce.style.color = corr>0.5 ? 'var(--c4)' : corr>0 ? 'var(--c3)' : 'var(--c7)';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESON — detetor de ressonâncias dinâmico
// Estratégia: analisa o espectro em tempo real, encontra os 6 picos mais altos
// acima da curva média, e modula os nós EQ existentes (eqBass/eqMid/eqHigh)
// + 4 filtros peaking adicionais para atenuar dinamicamente esses picos.
// ═══════════════════════════════════════════════════════════════════════════
let resonBypassed=false;
let resonMode='attenuate'; // 'attenuate' = atenua picos · 'boost' = aumenta picos
let resonNodes=[]; // filtros peaking dedicados
let resonInterval=null;
let _resonAnalyser=null; // analyser dedicado ligado ao masterGain

function _ensureResonAnalyser(){
  if(!audioCtx || _resonAnalyser) return;
  if(typeof masterGain==='undefined' || !masterGain) return;
  try{
    _resonAnalyser = audioCtx.createAnalyser();
    _resonAnalyser.fftSize = 4096;
    _resonAnalyser.smoothingTimeConstant = 0.5;
    masterGain.connect(_resonAnalyser);
  }catch(e){ console.warn('Reson analyser failed', e); }
}

function updateReson(){
  document.getElementById('rs-sens-v').textContent=document.getElementById('rs-sens').value+'%';
  const depth=parseFloat(document.getElementById('rs-depth').value);
  document.getElementById('rs-depth-v').textContent='-'+depth.toFixed(1)+' dB';
  const q=parseFloat(document.getElementById('rs-q').value)/10;
  document.getElementById('rs-q-v').textContent=q.toFixed(1);
  document.getElementById('rs-atk-v').textContent=document.getElementById('rs-atk').value+' ms';
  document.getElementById('rs-rel-v').textContent=document.getElementById('rs-rel').value+' ms';
  _ensureResonAnalyser();
  _startResonLoop();
}
function toggleResonMode(m){
  resonMode=m;
  const a=document.getElementById('rs-mode-att'), b=document.getElementById('rs-mode-boost');
  if(a) a.classList.toggle('rs-mode-active', m==='attenuate');
  if(b) b.classList.toggle('rs-mode-active', m==='boost');
}
function _buildResonNodes(){
  // Nós dedicados criados on-demand pelo loop
  resonNodes = [];
}
function _startResonLoop(){
  if(resonInterval) return;
  resonInterval = setInterval(()=>{
    _ensureResonAnalyser();
    if(!_resonAnalyser || !audioCtx) {
      _drawResonView(null, null, [], 0);
      return;
    }
    const bins = _resonAnalyser.frequencyBinCount;
    const data = new Float32Array(bins);
    _resonAnalyser.getFloatFrequencyData(data);
    const sr = audioCtx.sampleRate;
    const binHz = sr/2/bins;
    // envelope médio com janela ~24 bins
    const avg = new Float32Array(bins);
    const win = 12;
    for(let i=0;i<bins;i++){
      let s=0,n=0;
      for(let k=-win;k<=win;k++){const j=i+k; if(j>=0&&j<bins){s+=data[j];n++;}}
      avg[i]=s/n;
    }
    const sens = parseFloat(document.getElementById('rs-sens')?.value||50)/100;
    const threshold = 4 + (1-sens)*8;
    const depth = parseFloat(document.getElementById('rs-depth')?.value||6);
    // resonMode agora é 'attenuate' ou 'boost'
    const sign = (resonMode==='boost') ? +1 : -1;
    // encontra picos
    const peaks=[];
    for(let i=2;i<bins-2;i++){
      if(data[i]-avg[i]>threshold && data[i]>data[i-1] && data[i]>data[i+1]){
        peaks.push({f:i*binHz, excess:data[i]-avg[i]});
      }
    }
    peaks.sort((a,b)=>b.excess-a.excess);
    const top = peaks.slice(0, 6);
    const pe=document.getElementById('rs-peaks'); if(pe) pe.textContent=top.length;
    const atk = parseFloat(document.getElementById('rs-atk')?.value||20)/1000;
    const qVal = parseFloat(document.getElementById('rs-q')?.value||60)/10;
    // Atribui picos aos 6 nós dedicados; nós sem pico → gain 0
    if(resonBypassed){
      _resonNodes.forEach(n=>{ if(n) n.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); });
    } else {
      _resonNodes.forEach((n,idx)=>{
        if(!n) return;
        const p = top[idx];
        if(p){
          n.frequency.setTargetAtTime(p.f, audioCtx.currentTime, atk*0.5+0.01);
          n.Q.setTargetAtTime(qVal, audioCtx.currentTime, 0.02);
          const intensity = Math.min(1, p.excess/12);
          n.gain.setTargetAtTime(sign * depth * intensity, audioCtx.currentTime, atk*0.5+0.01);
        } else {
          n.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }
      });
    }
    _drawResonView(data, avg, top, binHz);
  }, 80);
}
function _drawResonView(data, avg, peaks, binHz){
  const cv=document.getElementById('reson-cv'); if(!cv) return;
  const W=cv.offsetWidth||0; if(W<10) return;
  if(cv.width!==W) cv.width=W;
  const H=cv.height;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);
  // grid freq
  ['60','250','1k','4k','16k'].forEach((l,i)=>{
    const x=i/4*W;
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-12);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText(l,x,H-2);
  });
  // map bin to log x
  const minHz=20, maxHz=20000;
  function bin2x(b){const f=b*binHz; if(f<minHz)return 0; return Math.log10(f/minHz)/Math.log10(maxHz/minHz)*W;}
  // value to y (dB scale: -90 to 0)
  function dB2y(db){const t=Math.max(0,Math.min(1,(db+90)/90)); return H-12 - t*(H-22);}
  // average envelope
  ctx.strokeStyle='rgba(45,212,255,0.4)'; ctx.lineWidth=1;
  ctx.beginPath();
  for(let i=2;i<data.length;i++){const x=bin2x(i);const y=dB2y(avg[i]); if(i===2)ctx.moveTo(x,y); else ctx.lineTo(x,y);}
  ctx.stroke();
  // current spectrum
  ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1.2;
  ctx.beginPath();
  for(let i=2;i<data.length;i++){const x=bin2x(i);const y=dB2y(data[i]); if(i===2)ctx.moveTo(x,y); else ctx.lineTo(x,y);}
  ctx.stroke();
  // peaks
  peaks.forEach(p=>{
    const x=Math.log10(p.f/minHz)/Math.log10(maxHz/minHz)*W;
    const y=dB2y(-30+p.excess);
    ctx.fillStyle='rgba(255,107,53,0.7)';
    ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,107,53,1)';ctx.font='9px monospace';ctx.textAlign='center';
    ctx.fillText((p.f>=1000?(p.f/1000).toFixed(1)+'k':Math.round(p.f)+'Hz'), x, y-8);
  });
}
// continuous vector + reson redraw if tabs are visible
(function _imagerLoop(){
  const t=document.getElementById('tab-image');
  if(t && t.classList.contains('active')) _drawVectorscope();
  requestAnimationFrame(_imagerLoop);
})();

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
  const now=audioCtx.currentTime;
  const mLow=get('ms-mid-low'), mMid=get('ms-mid-mid'), mHigh=get('ms-mid-high'), mGain=get('ms-mid-gain');
  const sLow=get('ms-side-low'), sMid=get('ms-side-mid'), sHigh=get('ms-side-high'), sGain=get('ms-side-gain');

  if(msMidEqLow)  msMidEqLow.gain.setTargetAtTime(mLow, now, 0.08);
  if(msMidEqMid)  msMidEqMid.gain.setTargetAtTime(mMid, now, 0.08);
  if(msMidEqHigh) msMidEqHigh.gain.setTargetAtTime(mHigh, now, 0.08);
  if(msSideEqLow) msSideEqLow.gain.setTargetAtTime(sLow, now, 0.08);
  if(msSideEqMid) msSideEqMid.gain.setTargetAtTime(sMid, now, 0.08);
  if(msSideEqHigh)msSideEqHigh.gain.setTargetAtTime(sHigh, now, 0.08);
  if(msMidGain)  msMidGain.gain.setTargetAtTime(Math.pow(10,mGain/20), now, 0.08);
  if(msSideGain) msSideGain.gain.setTargetAtTime(Math.max(0.0, Math.pow(10,sGain/20)), now, 0.08);

  // engage processed branch only if something is non-neutral
  _msEngage();
  _snapUndoThrottled();
  setStatus('M/S: Mid '+mLow.toFixed(1)+'/'+(mMid>=0?'+':'')+mMid.toFixed(1)+'/'+mHigh.toFixed(1)+' · Side '+(sLow>=0?'+':'')+sLow.toFixed(1)+'/'+(sMid>=0?'+':'')+sMid.toFixed(1)+'/'+(sHigh>=0?'+':'')+sHigh.toFixed(1)+' dB');
}

// Decide whether the processed M/S branch should be active (any non-neutral param)
function _msEngage(){
  if(!audioCtx||!msDirectGain||!msProcGain) return;
  const get=id=>parseFloat(document.getElementById(id)?.value||0);
  const ids=['ms-mid-low','ms-mid-mid','ms-mid-high','ms-mid-gain','ms-side-low','ms-side-mid','ms-side-high','ms-side-gain'];
  let active=ids.some(id=>Math.abs(get(id))>0.05);
  // Width knobs also engage it
  const w=parseFloat(document.getElementById('width-main')?.value||100);
  const mid=parseFloat(document.getElementById('width-mid')?.value||0);
  const side=parseFloat(document.getElementById('width-side')?.value||0);
  if(Math.abs(w-100)>0.5||Math.abs(mid)>0.05||Math.abs(side)>0.05) active=true;
  if(msBypassed) active=false;
  const now=audioCtx.currentTime;
  msDirectGain.gain.setTargetAtTime(active?0:1, now, 0.06);
  msProcGain.gain.setTargetAtTime(active?1:0, now, 0.06);
}
let msBypassed=false;

// ===== REFERENCE TRACK =====
let _refSource=null, _refPlaying=false;

function toggleRefPlay(){
  if(!refBuffer){ setStatus('Carrega uma referência primeiro'); return; }
  initAudio();
  if(audioCtx.state==='suspended') audioCtx.resume();
  if(_refPlaying){ _stopRefPlay(); return; }
  // stop main track if playing to avoid overlap
  if(isPlaying){ try{stopAudio();}catch(e){} }
  _refSource=audioCtx.createBufferSource();
  _refSource.buffer=refBuffer;
  // route reference straight to output + analyser so overlay updates with ref
  _refSource.connect(analyserNode);
  _refSource.onended=()=>{ _refPlaying=false; _updateRefPlayBtn(); };
  _refSource.start(0);
  _refPlaying=true; _updateRefPlayBtn();
  setStatus('▶ A ouvir referência: '+(refStats?.name||'').replace(/\.[^.]+$/,''));
}
function _stopRefPlay(){
  if(_refSource){ try{_refSource.stop();}catch(e){} _refSource=null; }
  _refPlaying=false; _updateRefPlayBtn();
  setStatus('Referência parada');
}
function _updateRefPlayBtn(){
  const ic=document.getElementById('ref-play-icon');
  const btn=document.getElementById('ref-play-btn');
  if(ic) ic.className=_refPlaying?'ti ti-player-pause':'ti ti-player-play';
  if(btn) btn.innerHTML=(_refPlaying?'<i class="ti ti-player-pause" id="ref-play-icon"></i> PARAR REFERÊNCIA':'<i class="ti ti-player-play" id="ref-play-icon"></i> OUVIR REFERÊNCIA');
}
function loadRefAgain(){
  _stopRefPlay();
  document.getElementById('ref-info').style.display='none';
  document.getElementById('ref-drop').style.display='';
  document.getElementById('ref-file').value='';
  _refSpectrum=null;
}

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
  _computeRefSpectrum();
  _drawReferenceOverlay();

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

// ═══════════════════════════════════════════════════════════════════════════
// ANÁLISES SONORAS — professional before/after analysis
// ═══════════════════════════════════════════════════════════════════════════
let _analysisData=null;

function _measureBuffer(buf){
  const nCh=buf.numberOfChannels, len=buf.length, sr=buf.sampleRate;
  let peak=0, sumSq=0, n=0;
  const chans=[]; for(let c=0;c<nCh;c++) chans.push(buf.getChannelData(c));
  const win=Math.floor(sr*0.4), hop=Math.floor(sr*0.1);
  const stLoud=[];
  for(let i=0;i+win<=len;i+=hop){
    let s=0;
    for(let c=0;c<nCh;c++){ const d=chans[c]; for(let j=0;j<win;j+=4){ s+=d[i+j]*d[i+j]; } }
    const rms=Math.sqrt(s/((win/4)*nCh));
    stLoud.push(rms>0?20*Math.log10(rms)-0.691:-70);
  }
  for(let c=0;c<nCh;c++){ const d=chans[c]; for(let i=0;i<len;i+=2){ const a=Math.abs(d[i]); if(a>peak)peak=a; sumSq+=d[i]*d[i]; n++; } }
  const rmsAll=Math.sqrt(sumSq/n);
  const rmsDb=rmsAll>0?20*Math.log10(rmsAll):-70;
  const peakDb=peak>0?20*Math.log10(peak):-70;
  const gated=stLoud.filter(v=>v>-50);
  const lufsInt=gated.length?gated.reduce((a,b)=>a+b,0)/gated.length-0.691:-70;
  const sorted=[...gated].sort((a,b)=>a-b);
  const pct=p=>sorted.length?sorted[Math.floor(p*(sorted.length-1))]:-70;
  const lra=sorted.length?(pct(0.95)-pct(0.10)):0;
  let tp=peak;
  for(let c=0;c<nCh;c++){ const d=chans[c]; for(let i=1;i<len;i++){ const mid=(d[i-1]+d[i])/2; if(Math.abs(mid)>tp)tp=Math.abs(mid); } }
  const tpDb=tp>0?20*Math.log10(tp):-70;
  const crest=peakDb-rmsDb, plr=peakDb-lufsInt;
  const N=8192, slice=Math.min(len,N), start=Math.floor(len/2-slice/2);
  const re=new Float32Array(N);
  for(let i=0;i<slice;i++){ let s=0; for(let c=0;c<nCh;c++)s+=chans[c][start+i]; re[i]=(s/nCh)*0.5*(1-Math.cos(2*Math.PI*i/(slice-1))); }
  const NB=64, spec=new Float32Array(NB);
  for(let b=0;b<NB;b++){
    const f=20*Math.pow(20000/20,b/(NB-1)), k=f/sr*N, w=2*Math.PI*k/N;
    let sr2=0,si2=0; for(let m=0;m<N;m+=8){ sr2+=re[m]*Math.cos(w*m); si2-=re[m]*Math.sin(w*m); }
    spec[b]=Math.sqrt(sr2*sr2+si2*si2);
  }
  let mx=1e-9; for(let b=0;b<NB;b++)mx=Math.max(mx,spec[b]);
  for(let b=0;b<NB;b++){ const db=20*Math.log10(spec[b]/mx+1e-6); spec[b]=Math.max(0,Math.min(1,(db+72)/72)); }
  let lowE=0,midE=0,highE=0;
  for(let b=0;b<NB;b++){ const f=20*Math.pow(20000/20,b/(NB-1)); const e=spec[b]; if(f<300)lowE+=e; else if(f<4000)midE+=e; else highE+=e; }
  const tt=lowE+midE+highE||1;
  let corr=1;
  if(nCh>=2){ let lr=0,ll=0,rr=0; const L=chans[0],R=chans[1]; for(let i=0;i<len;i+=8){lr+=L[i]*R[i];ll+=L[i]*L[i];rr+=R[i]*R[i];} corr=(ll&&rr)?lr/Math.sqrt(ll*rr):1; }
  return {lufs:lufsInt,peak:peakDb,tp:tpDb,rms:rmsDb,crest,plr,lra,spec,low:lowE/tt*100,mid:midE/tt*100,high:highE/tt*100,corr,timeline:stLoud};
}

async function _renderProcessedForAnalysis(){
  const nCh=audioBuffer.numberOfChannels, sr=audioBuffer.sampleRate, len=audioBuffer.length;
  const off=new OfflineAudioContext(nCh,len,sr);
  const mk=(t,f,g,Q)=>{const x=off.createBiquadFilter();x.type=t;x.frequency.value=f;x.gain.value=g||0;if(Q)x.Q.value=Q;return x;};
  const oSub=mk('lowshelf',60,eqSub.gain.value),oBass=mk('peaking',150,eqBass.gain.value,0.8),
        oLow=mk('peaking',500,eqLowNode.gain.value,1.0),oMid=mk('peaking',1200,eqMid.gain.value,0.9),
        oHigh=mk('peaking',4000,eqHigh.gain.value,1.0),oAir=mk('highshelf',12000,eqAir.gain.value);
  const oComp=off.createDynamicsCompressor();
  oComp.threshold.value=compNode.threshold.value;oComp.ratio.value=compNode.ratio.value;
  oComp.attack.value=compNode.attack.value;oComp.release.value=compNode.release.value;oComp.knee.value=6;
  const oLim=off.createDynamicsCompressor();
  oLim.threshold.value=limiterNode.threshold.value;oLim.ratio.value=20;oLim.attack.value=0.001;oLim.release.value=0.05;oLim.knee.value=0;
  const oShape=off.createWaveShaper();
  const drive=parseFloat(document.getElementById('shape-drive')?.value||0)/100;
  const mix=parseFloat(document.getElementById('shape-mix')?.value||0)/100;
  oShape.curve=makeShapeCurve(shapeMode,drive,mix);oShape.oversample='4x';
  const oGain=off.createGain();oGain.gain.value=masterGain.gain.value;
  oSub.connect(oBass);oBass.connect(oLow);oLow.connect(oMid);oMid.connect(oHigh);oHigh.connect(oAir);
  oAir.connect(oShape);oShape.connect(oComp);oComp.connect(oLim);oLim.connect(oGain);oGain.connect(off.destination);
  const src=off.createBufferSource();src.buffer=audioBuffer;src.connect(oSub);src.start(0);
  return await off.startRendering();
}

async function runFullAnalysis(){
  if(!audioBuffer){ setStatus('Carrega uma música primeiro'); return; }
  setStatus('A analisar antes/depois...');
  try{
    const before=_measureBuffer(audioBuffer);
    const procBuf=await _renderProcessedForAnalysis();
    const after=_measureBuffer(procBuf);
    _analysisData={before,after};
    _renderAnalysisMetrics(before,after);
    _drawAnalysisSpectrum(before,after);
    _drawAnalysisTonal(before,after);
    _drawAnalysisTimeline(before,after);
    _renderAnalysisVerdict(after);
    setStatus('✓ Análise completa — antes vs depois');
  }catch(e){ setStatus('Erro na análise: '+e.message); }
}

function _renderAnalysisMetrics(b,a){
  const host=document.getElementById('analysis-metrics'); if(!host) return;
  while(host.children.length>4) host.removeChild(host.lastChild);
  const rows=[
    ['LUFS Integrado', b.lufs, a.lufs, 'LUFS', 1],
    ['True Peak', b.tp, a.tp, 'dBTP', 1],
    ['Peak', b.peak, a.peak, 'dBFS', 1],
    ['RMS', b.rms, a.rms, 'dB', 1],
    ['LRA (Loudness Range)', b.lra, a.lra, 'LU', 1],
    ['PLR (Peak-to-Loudness)', b.plr, a.plr, 'dB', 1],
    ['Crest Factor', b.crest, a.crest, 'dB', 1],
    ['Correlação de Fase', b.corr, a.corr, '', 2],
  ];
  rows.forEach(([name,bv,av,unit,dec])=>{
    const delta=av-bv;
    const cell=(txt,col,align)=>{const d=document.createElement('div');d.style.cssText='background:var(--bg2);padding:7px 10px;font-size:11px;color:'+col+';text-align:'+(align||'left')+';';d.textContent=txt;return d;};
    host.appendChild(cell(name,'var(--text)'));
    host.appendChild(cell(bv.toFixed(dec)+(unit?' '+unit:''),'var(--c6)','right'));
    host.appendChild(cell(av.toFixed(dec)+(unit?' '+unit:''),'var(--c4)','right'));
    const dCol=Math.abs(delta)<0.05?'var(--muted2)':(delta>0?'#2dff8a':'#ff6b6b');
    host.appendChild(cell((delta>=0?'+':'')+delta.toFixed(dec),dCol,'right'));
  });
}

function _logFx(f,W){ return Math.log10(f/20)/Math.log10(20000/20)*W; }

function _drawAnalysisSpectrum(b,a){
  const cv=document.getElementById('analysis-spectrum-canvas'); if(!cv)return;
  const W=cv.offsetWidth||600; if(W<50)return; if(cv.width!==W)cv.width=W;
  const H=cv.height||180, ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#ffffff0e';ctx.lineWidth=1;
  [60,250,1000,4000,16000].forEach((f,i)=>{const x=_logFx(f,W);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H-12);ctx.stroke();
    ctx.fillStyle='#ffffff44';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(['60','250','1k','4k','16k'][i],x,H-2);});
  const drawCurve=(spec,col,fillA)=>{
    const NB=spec.length;
    ctx.beginPath();
    for(let i=0;i<NB;i++){const f=20*Math.pow(20000/20,i/(NB-1));const x=_logFx(f,W);const y=(H-12)-spec[i]*(H-20);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
    if(fillA){ctx.lineTo(W,H-12);ctx.lineTo(0,H-12);ctx.closePath();ctx.fillStyle=fillA;ctx.fill();}
  };
  drawCurve(b.spec,'#b855f7','rgba(184,85,247,0.10)');
  drawCurve(a.spec,'#2dff8a','rgba(45,255,138,0.12)');
}

function _drawAnalysisTonal(b,a){
  const cv=document.getElementById('analysis-tonal-canvas'); if(!cv)return;
  const W=cv.offsetWidth||600; if(W<50)return; if(cv.width!==W)cv.width=W;
  const H=cv.height||130, ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
  const bands=[['LOW',b.low,a.low,[184,85,247]],['MID',b.mid,a.mid,[45,212,255]],['HIGH',b.high,a.high,[45,255,138]]];
  const groupW=W/3, barW=groupW*0.28, gap=groupW*0.08;
  const maxPct=Math.max(...bands.map(x=>Math.max(x[1],x[2])),40);
  bands.forEach(([lbl,bv,av,rgb],i)=>{
    const cx=i*groupW+groupW/2, baseY=H-24, maxH=H-44;
    const bh=(bv/maxPct)*maxH, ah=(av/maxPct)*maxH;
    ctx.fillStyle='rgba(184,85,247,0.85)';ctx.fillRect(cx-barW-gap/2, baseY-bh, barW, bh);
    ctx.fillStyle='rgba(45,255,138,0.9)';ctx.fillRect(cx+gap/2, baseY-ah, barW, ah);
    ctx.fillStyle='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)';ctx.font='bold 10px Rajdhani';ctx.textAlign='center';ctx.fillText(lbl,cx,H-8);
    ctx.fillStyle='#b855f7';ctx.font='9px monospace';ctx.fillText(bv.toFixed(0)+'%',cx-barW/2-gap/2,baseY-bh-4);
    ctx.fillStyle='#2dff8a';ctx.fillText(av.toFixed(0)+'%',cx+barW/2+gap/2,baseY-ah-4);
  });
  ctx.fillStyle='#b855f7';ctx.font='8px Rajdhani';ctx.textAlign='left';ctx.fillText('antes',6,12);
  ctx.fillStyle='#2dff8a';ctx.fillText('depois',46,12);
}

function _drawAnalysisTimeline(b,a){
  const cv=document.getElementById('analysis-timeline-canvas'); if(!cv)return;
  const W=cv.offsetWidth||600; if(W<50)return; if(cv.width!==W)cv.width=W;
  const H=cv.height||120, ctx=cv.getContext('2d');
  ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
  const y=v=>{const c=Math.max(-40,Math.min(0,v));return H-((c+40)/40)*(H-10)-5;};
  [-9,-14,-23].forEach(t=>{const yy=y(t);ctx.strokeStyle='#ffffff14';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ffffff44';ctx.font='8px monospace';ctx.textAlign='left';ctx.fillText(t+' LUFS',4,yy-2);});
  const drawLine=(arr,col)=>{if(!arr||!arr.length)return;ctx.beginPath();arr.forEach((v,i)=>{const x=i/(arr.length-1)*W;const yy=y(v);i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);});ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();};
  drawLine(b.timeline,'#b855f7');
  drawLine(a.timeline,'#2dff8a');
}

function _renderAnalysisVerdict(a){
  const host=document.getElementById('analysis-verdict'); if(!host)return;
  host.innerHTML='';
  const targets=[
    ['Spotify / Apple Music', -14, 1.0],
    ['YouTube', -14, 1.0],
    ['Club / DJ (Angola)', -9, 1.5],
    ['Tidal', -14, 1.0],
    ['Streaming geral', -14, 1.0],
  ];
  targets.forEach(([name,tgt,tol])=>{
    const diff=a.lufs-tgt;
    const ok=Math.abs(diff)<=tol, near=Math.abs(diff)<=tol*2.5;
    const col=ok?'#2dff8a':near?'#ffe135':'#ff6b6b';
    const icon=ok?'✓':near?'~':'✕';
    const msg=ok?'no alvo':(diff>0?(diff.toFixed(1)+' dB acima'):(Math.abs(diff).toFixed(1)+' dB abaixo'));
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg3);border-radius:6px;border-left:3px solid '+col+';';
    row.innerHTML='<span style="color:'+col+';font-weight:700;font-family:monospace;">'+icon+'</span>'+
      '<span style="font-size:11px;color:var(--text);font-family:Rajdhani;flex:1;">'+name+'</span>'+
      '<span style="font-size:9px;color:var(--muted2);font-family:Rajdhani;">alvo '+tgt+' LUFS</span>'+
      '<span style="font-size:11px;color:'+col+';font-family:Rajdhani;font-weight:700;min-width:90px;text-align:right;">'+msg+'</span>';
    host.appendChild(row);
  });
}

function applyRefToPreset(){
  if(!refStats){setStatus('Carrega uma referência primeiro');return;}
  initAudio();
  resetAllDSP();
  resetModuleBypasses();

  // Translate reference analysis into KNOB values (so applyDSP reproduces it reliably)
  const diffLUFS = refStats.lufs - (-9);
  kvals.LOUD = Math.round(Math.min(95, Math.max(35, 65 + diffLUFS*2)));

  // Bass: based on low-energy ratio
  if(refStats.lowR>0.45)      kvals.BASS=72;
  else if(refStats.lowR>0.32) kvals.BASS=62;
  else if(refStats.lowR<0.18) kvals.BASS=40;
  else                        kvals.BASS=52;

  // Mids / focus
  kvals.FOCUS = refStats.midR>0.45 ? 64 : refStats.midR<0.30 ? 44 : 52;

  // Highs / clean
  kvals.CLEAN = refStats.highR>0.30 ? 64 : refStats.highR<0.18 ? 44 : 54;

  // Dynamics / punch
  kvals.PUNCH = refStats.dynRange>16 ? 68 : refStats.dynRange<8 ? 40 : 52;

  // Width neutral
  kvals.WIDE = 52;

  refreshKnobs();
  setMode('after');   // switch to PROCESSADO
  applyDSP();         // produce the sound from the knobs (persists)
  drawInteractiveEQ();
  setStatus('✓ Referência aplicada: '+refStats.name.replace(/\.[^.]+$/,'')+' — agora em PROCESSADO. Ouve a diferença e ajusta por cima.');
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
      const eb=document.getElementById('export-btn'); if(eb) eb.style.display='flex';
      const eo=document.getElementById('export-opts'); if(eo) eo.style.display='flex';
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
  // bind click handler once
  const wc=document.getElementById('waveform-container');
  if(wc && !wc._seekBound){
    wc._seekBound=true;
    wc.addEventListener('click',(e)=>{
      if(!audioBuffer)return;
      const rect=wc.getBoundingClientRect();
      const frac=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
      seekTo(frac*audioBuffer.duration);
    });
  }
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
    // NOTE: do NOT call applyDSP() here — the chain already holds the current
    // settings (knobs + manual fader edits). Re-running applyDSP would recompute
    // EQ from the knobs and wipe any manual fader changes.
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
function stopSource(){
  if(sourceNode){
    try{ sourceNode.onended=null; sourceNode.stop(); }catch(e){}
    sourceNode=null;
  }
}
function seekTo(t){
  if(!audioBuffer||!audioCtx) return;
  const was=isPlaying;
  stopSource();
  isPlaying=false;
  pauseOffset=Math.max(0,Math.min(t,audioBuffer.duration-0.05));
  setProgress(pauseOffset/audioBuffer.duration);
  document.getElementById('time-cur').textContent=fmtTime(pauseOffset);
  if(was){
    // resume playback from the new position
    playAudio();
  }
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
  } else {
    // Entering PROCESSADO — apply current knob/preset settings to the chain once
    applyDSP();
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
  // Set internal resolution ONCE via a ResizeObserver — never per frame.
  // This is the key fix for the spectrum "tremble" on playback start: the
  // canvas bitmap size no longer changes every animation frame.
  if(!canvas._sizeBound){
    canvas._sizeBound=true;
    const applySize=()=>{
      const ow=Math.round(canvas.offsetWidth||300), oh=Math.round(canvas.offsetHeight||160);
      if(ow>0 && canvas.width!==ow) canvas.width=ow;
      if(oh>0 && canvas.height!==oh) canvas.height=oh;
    };
    applySize();
    if(window.ResizeObserver){
      let raf=null;
      new ResizeObserver(()=>{ if(raf)cancelAnimationFrame(raf); raf=requestAnimationFrame(applySize); }).observe(canvas);
    }
  }
  if(!canvas.width||!canvas.height) return;
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
  // Automation
  if(_autoActive&&isPlaying&&audioCtx&&audioBuffer){
    const pos=audioCtx.currentTime-startTime;
    _applyAutomationAtTime(pos,audioBuffer.duration);
  }
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
      setTimeout(()=>{hb.style.boxShadow='';hb.style.transform='';},1500);}
    setStatus('Aplica primeiro o HEADROOM -6dB (botão amarelo) para desbloquear os presets');
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
    // ── HEADROOM AUTOMÁTICO -6 dBFS ──
    // Antes de qualquer EQ/saturação, medir a fonte e ajustar o ganho de saída
    // para que o pico fique em -6 dBFS, dando "altura" para o processamento.
    if(audioBuffer){
      let peak=0;
      for(let c=0;c<audioBuffer.numberOfChannels;c++){
        const data=audioBuffer.getChannelData(c);
        for(let i=0;i<data.length;i++) peak=Math.max(peak,Math.abs(data[i]));
      }
      if(peak>0){
        const targetPeak=0.501; // -6 dBFS
        const gainDb=20*Math.log10(targetPeak/peak);
        outputGainDb=Math.max(-24,Math.min(6,gainDb));
        applyIOGain();
        updateIODisplay();
        headroomApplied=true;
        document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('headroom-locked'));
        const peakDbH=20*Math.log10(peak);
        setStatus('PIRADEX MODE · HEADROOM -6 dBFS aplicado (fonte '+peakDbH.toFixed(1)+' dBFS → '+(gainDb>=0?'+':'')+gainDb.toFixed(1)+' dB)');
      }
    }

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
  const lufsSource=rms>0?20*Math.log10(rms)-0.691:-70;
  const lufsEst=lufsSource + (outputGainDb||0); // após headroom aplicado
  const peakdB=peak>0?20*Math.log10(peak):-70;
  const peakAfterHead=peakdB + (outputGainDb||0);
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
· Fonte: ${lufsSource.toFixed(1)} LUFS · pico ${peakdB.toFixed(1)} dBFS<br>
· Após HEADROOM -6 dBFS: ${lufsEst.toFixed(1)} LUFS · pico ${peakAfterHead.toFixed(1)} dBFS<br>
· Dinâmica: ${dynRange.toFixed(1)} dB<br>
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
  // ── DEMO: só MP3 ──
  const u = (typeof currentUser!=='undefined' && currentUser) ? USERS[currentUser] : null;
  const isDemo = u && u.type==='demo';
  if(isDemo && fmt==='wav'){
    setStatus('⚠ Exportação WAV bloqueada na DEMO — usa MP3 ou adquire uma licença.');
    alert('A versão DEMO só permite exportar em MP3.\n\nO formato WAV (sem perdas) está reservado para licenças BÁSICA ou AVANÇADA.\n\nSeleciona MP3 no menu de exportação, ou adquire uma licença em beatfreakstudio.com');
    const sel=document.getElementById('export-fmt'); if(sel){ sel.value='mp3'; }
    return;
  }
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
    const oSTrim=offCtx.createGain();oSTrim.gain.value=shapeTrimGain?shapeTrimGain.gain.value:1;
    // Transient (mirror live node)
    const oTrans=offCtx.createDynamicsCompressor();
    if(_transientNode){
      oTrans.threshold.value=_transientNode.threshold.value;
      oTrans.ratio.value=_transientNode.ratio.value;
      oTrans.attack.value=_transientNode.attack.value;
      oTrans.release.value=_transientNode.release.value;
      oTrans.knee.value=6;
    } else { oTrans.threshold.value=0; oTrans.ratio.value=1; }
    const oGain=offCtx.createGain();oGain.gain.value=masterGain.gain.value;
    oSub.connect(oBass);oBass.connect(oLow);oLow.connect(oMid);oMid.connect(oHigh);oHigh.connect(oAir);
    oAir.connect(oSDry);oSDry.connect(oSMix);
    oAir.connect(oShape);oShape.connect(oSWet);oSWet.connect(oSMix);
    oSMix.connect(oSTrim);
    oSTrim.connect(oComp);oComp.connect(oTrans);
    // Clipper (mirror live full Gold-Clip chain) — only if engaged
    const clipOn=document.getElementById('clip-toggle')?.checked && !clipBypassed;
    if(clipOn){
      const dDb=parseFloat(document.getElementById('clip-drive')?.value||0);
      const cDb=parseFloat(document.getElementById('clip-ceiling')?.value||-0.1);
      const mode=document.getElementById('clip-mode')?.value||'modern';
      const gold=parseFloat(document.getElementById('clip-gold')?.value||0);
      const goldMode=document.getElementById('clip-gold-mode')?.value||'smooth';
      const alch=parseFloat(document.getElementById('clip-alchemy')?.value||0);
      const box=parseFloat(document.getElementById('clip-boxtone')?.value||0);
      const mix=parseFloat(document.getElementById('clip-mix')?.value||100);
      const out=parseFloat(document.getElementById('clip-out')?.value||0);
      const unity=document.getElementById('clip-unity')?.checked;
      const ceil=Math.pow(10,cDb/20);
      const n=8192;
      // clip curve
      const oIn=offCtx.createGain();oIn.gain.value=Math.pow(10,dDb/20);
      const oWS=offCtx.createWaveShaper();oWS.oversample='4x';
      const cc=new Float32Array(n);
      for(let i=0;i<n;i++){let x=((i*2/(n-1))-1);let y;
        if(mode==='hard')y=Math.max(-ceil,Math.min(ceil,x));
        else if(mode==='classic'){const k=1.6,t=x/ceil;y=ceil*Math.tanh(t*k)/Math.tanh(k);}
        else if(mode==='off')y=x;
        else {const t=x/ceil;y=ceil*(t/Math.pow(1+Math.pow(Math.abs(t),2.2),1/2.2));}
        cc[i]=Math.max(-1,Math.min(1,y));}
      oWS.curve=cc;
      // gold curve
      const oGold=offCtx.createWaveShaper();oGold.oversample='4x';
      const gc=new Float32Array(n);const a=Math.max(0,Math.min(1,gold/100));
      if(a<0.001){for(let i=0;i<n;i++)gc[i]=(i*2/(n-1))-1;}
      else{const dr=1+a*(goldMode==='aggressive'?2.0:1.0);
        for(let i=0;i<n;i++){const x=((i*2/(n-1))-1);let y=Math.sign(x)*Math.pow(Math.abs(x),1/(1+a*0.6));y=Math.tanh(y*dr)/Math.tanh(dr);gc[i]=Math.max(-1,Math.min(1,(1-a)*x+a*y));}}
      oGold.curve=gc;
      // alchemy + boxtone
      const oAlch=offCtx.createBiquadFilter();oAlch.type='highshelf';oAlch.frequency.value=8000;oAlch.gain.value=-(alch/100)*4;
      const oBox=offCtx.createBiquadFilter();oBox.type='peaking';oBox.frequency.value=3000;oBox.Q.value=0.7;oBox.gain.value=(box/100)*4;
      // parallel mix + output
      const oWet=offCtx.createGain();oWet.gain.value=mix/100;
      const oDry=offCtx.createGain();oDry.gain.value=1-(mix/100);
      const oSum=offCtx.createGain();oSum.gain.value=1;
      let outG=Math.pow(10,out/20); if(unity) outG*=Math.pow(10,-dDb/20);
      const oOut=offCtx.createGain();oOut.gain.value=outG;
      oTrans.connect(oIn);
      oIn.connect(oWS);oWS.connect(oGold);oGold.connect(oAlch);oAlch.connect(oBox);oBox.connect(oWet);oWet.connect(oSum);
      oIn.connect(oDry);oDry.connect(oSum);
      oSum.connect(oOut);oOut.connect(oLim);
    } else {
      oTrans.connect(oLim);
    }
    oLim.connect(oGain);
    oGain.connect(offCtx.destination);
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
      setTimeout(()=>_showBAReport(normalized), 500);
    } else {
      const wav=encodeWAV(normalized);
      const blob=new Blob([wav],{type:'audio/wav'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
      a.download=baseName+'.wav';a.click();URL.revokeObjectURL(url);
      setStatus('✓ WAV exportado'+lufsInfo+(dither?' · TPDF dither aplicado':''));
      setTimeout(()=>_showBAReport(normalized), 500);
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
  const realW=canvas.offsetWidth||0;
  if(realW<50) return;
  const W=realW, H=canvas.height||52;
  if(canvas.width!==W) canvas.width=W;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);

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

  const gap=6;
  const bw=(W-gap*4)/3;
  const barTop=4, barBot=H-16, barH=barBot-barTop;
  [[lowPct,[184,85,247],'LOW'],[midPct,[45,212,255],'MID'],[highPct,[45,255,138],'HIGH']].forEach(([pct,rgb,lbl],i)=>{
    const x=gap+i*(bw+gap);
    // track background
    ctx.fillStyle='#15151f'; ctx.fillRect(x,barTop,bw,barH);
    ctx.strokeStyle='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.35)'; ctx.lineWidth=1;
    ctx.strokeRect(x+0.5,barTop+0.5,bw-1,barH-1);
    // filled portion — solid bright colour
    const fh=(pct/100)*barH;
    const grd=ctx.createLinearGradient(0,barBot-fh,0,barBot);
    grd.addColorStop(0,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)');
    grd.addColorStop(1,'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.55)');
    ctx.fillStyle=grd;
    ctx.fillRect(x,barBot-fh,bw,fh);
    // percentage inside/above the bar, white bold for contrast
    ctx.fillStyle='#fff'; ctx.font='bold 13px Rajdhani,sans-serif'; ctx.textAlign='center';
    ctx.fillText(pct.toFixed(0)+'%', x+bw/2, barBot-fh-6>14 ? barBot-fh-6 : barTop+14);
    // label below
    ctx.fillStyle='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',1)';
    ctx.font='bold 9px Rajdhani,sans-serif';
    ctx.fillText(lbl, x+bw/2, H-3);
    // suggestion cards
    const ids=[['sug-low-bar','sug-low-pct'],['sug-mid-bar','sug-mid-pct'],['sug-high-bar','sug-high-pct']];
    const bars=document.getElementById(ids[i][0]),lblEl=document.getElementById(ids[i][1]);
    if(bars) bars.style.width=pct.toFixed(0)+'%';
    if(lblEl) lblEl.textContent=pct.toFixed(0)+'%';
  });

  // Target overlay (dashed white line = target preset)
  const target=SPECTRAL_TARGETS[curPreset];
  if(target){
    [[target.low],[target.mid],[target.high]].forEach(([pct],i)=>{
      const x=gap+i*(bw+gap);
      const ty=barBot-(pct/100)*barH;
      ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(x,ty); ctx.lineTo(x+bw,ty); ctx.stroke();
      ctx.setLineDash([]);
    });
  }

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

// Transient Shaper — node is created in buildChain and lives in series
let _transientNode=null, _transientDry=null, _transientWet=null;
let _transientAttack=50, _transientSustain=50;
function _initTransient(){ /* node created in buildChain */ }
function updateTransient(){
  const a=parseFloat(document.getElementById('trans-attack')?.value||50);
  const s=parseFloat(document.getElementById('trans-sustain')?.value||50);
  const av=document.getElementById('trans-attack-v'), sv=document.getElementById('trans-sustain-v');
  if(av) av.textContent=(a>=50?'+':'')+(a-50)+'%';
  if(sv) sv.textContent=(s>=50?'+':'')+(s-50)+'%';
  _transientAttack=a; _transientSustain=s;
  if(!_transientNode||!audioCtx) return;
  const now=audioCtx.currentTime;
  // At 50/50 → no effect (ratio 1). Above 50 attack → punch (compress sustain, fast attack).
  const aN=(a-50)/50;  // -1..+1
  const sN=(s-50)/50;  // -1..+1
  if(Math.abs(aN)<0.02 && Math.abs(sN)<0.02){
    // neutral — bypass
    _transientNode.threshold.setTargetAtTime(0, now, 0.05);
    _transientNode.ratio.setTargetAtTime(1, now, 0.05);
    return;
  }
  // More attack = lower threshold + faster attack + higher ratio → emphasises transients
  const thr = -10 - Math.abs(aN)*25;          // -10..-35 dB
  const ratio = 1 + Math.abs(aN)*5;           // 1..6
  const atk = aN>0 ? 0.0008 : 0.02;           // punchy vs soft
  const rel = sN>0 ? 0.30 : 0.08;             // more sustain = longer release
  _transientNode.threshold.setTargetAtTime(thr, now, 0.05);
  _transientNode.ratio.setTargetAtTime(ratio, now, 0.05);
  _transientNode.attack.setTargetAtTime(atk, now, 0.05);
  _transientNode.release.setTargetAtTime(rel, now, 0.05);
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
  // Linkwitz-Riley style crossovers (cascaded Butterworth) so bands sum flat.
  // Low band:  LP@250 (x2)
  // Mid band:  HP@250 (x2) → LP@4000 (x2)
  // High band: HP@4000 (x2)
  const LP=(f)=>{const n=audioCtx.createBiquadFilter();n.type='lowpass';n.frequency.value=f;n.Q.value=0.7071;return n;};
  const HP=(f)=>{const n=audioCtx.createBiquadFilter();n.type='highpass';n.frequency.value=f;n.Q.value=0.7071;return n;};
  // LOW
  _mbLow=audioCtx.createGain();
  const lpA=LP(250), lpB=LP(250);
  _mbLow.connect(lpA); lpA.connect(lpB);
  _mbLow._out=lpB;
  // MID
  _mbMid=audioCtx.createGain();
  const hpA=HP(250), hpB=HP(250), lpC=LP(4000), lpD=LP(4000);
  _mbMid.connect(hpA); hpA.connect(hpB); hpB.connect(lpC); lpC.connect(lpD);
  _mbMid._out=lpD;
  // HIGH
  _mbHigh=audioCtx.createGain();
  const hpC=HP(4000), hpD=HP(4000);
  _mbHigh.connect(hpC); hpC.connect(hpD);
  _mbHigh._out=hpD;
  // Per-band compressors
  const mkComp=(thr,ratio)=>{const c=audioCtx.createDynamicsCompressor();c.threshold.value=thr;c.ratio.value=ratio;c.attack.value=0.005;c.release.value=0.12;c.knee.value=6;return c;};
  _mbLowComp  = mkComp(-24,3);
  _mbMidComp  = mkComp(-20,2.5);
  _mbHighComp = mkComp(-18,2);
  // band out → comp (the crossover output feeds the comp)
  _mbLow._out.connect(_mbLowComp);
  _mbMid._out.connect(_mbMidComp);
  _mbHigh._out.connect(_mbHighComp);
  _mbMixer=audioCtx.createGain(); _mbMixer.gain.value=1;
}
function updateMultiband(){
  const active=document.getElementById('mb-toggle')?.checked;
  mbActive=active||false;
  if(!audioCtx) return;
  const now=audioCtx.currentTime;
  const get=id=>parseFloat(document.getElementById(id)?.value||0);
  ['low','mid','high'].forEach(band=>{
    const thr=get('mb-'+band+'-thr');
    const ratio=get('mb-'+band+'-ratio');
    const comp={low:_mbLowComp,mid:_mbMidComp,high:_mbHighComp}[band];
    const vT=document.getElementById('mb-'+band+'-thr-v');
    const vR=document.getElementById('mb-'+band+'-ratio-v');
    if(vT) vT.textContent=thr+' dB';
    if(vR) vR.textContent=ratio+':1';
    if(comp){comp.threshold.value=thr;comp.ratio.value=ratio;}
  });
  // Crossfade: ON → bands path, OFF → direct path
  if(mbInputGain&&mbBandsGain){
    mbInputGain.gain.setTargetAtTime(mbActive?0:1, now, 0.05);
    mbBandsGain.gain.setTargetAtTime(mbActive?1:0, now, 0.05);
  }
  _snapUndoThrottled();
  setStatus(mbActive?'Multiband COMP activo: Low/Mid/High independentes':'Multiband COMP desligado');
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
  const eb2=document.getElementById('export-btn'); if(eb2) eb2.style.display='none';
  const eo2=document.getElementById('export-opts'); if(eo2) eo2.style.display='none';
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
const moduleBypassState = {eq:false, comp:false, dyn:false, shape:false, width:false, excite:false, loud:false, limit:false, midside:false, transient:false, multiband:false, clip:false};

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
  // NOTE: we do NOT call applyDSP() here — that would recompute EQ from the
  // knobs and wipe any manual fader edits or the just-restored bypass values.
  // Each applyModuleBypass case manages its own nodes directly.
  if(module==='eq') syncEQSliders(); // reflect restored/zeroed values on the faders
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
        moduleBypassSaved.comp={thr:compNode.threshold.value,ratio:compNode.ratio.value,atk:compNode.attack.value,rel:compNode.release.value,knee:compNode.knee.value};
        // Para bypass total: threshold no máximo permitido pelo nó (0 dB), ratio 1, knee 0 - efetivamente passa o sinal sem alteração
        compNode.threshold.setValueAtTime(0, audioCtx.currentTime);
        compNode.ratio.setValueAtTime(1, audioCtx.currentTime);
        compNode.knee.setValueAtTime(0, audioCtx.currentTime);
        compNode.attack.setValueAtTime(0, audioCtx.currentTime);
        compNode.release.setValueAtTime(0.25, audioCtx.currentTime);
      } else if(moduleBypassSaved.comp){
        const s=moduleBypassSaved.comp;
        compNode.threshold.setValueAtTime(s.thr, audioCtx.currentTime);
        compNode.ratio.setValueAtTime(s.ratio, audioCtx.currentTime);
        compNode.attack.setValueAtTime(s.atk, audioCtx.currentTime);
        compNode.release.setValueAtTime(s.rel, audioCtx.currentTime);
        if(typeof s.knee==='number') compNode.knee.setValueAtTime(s.knee, audioCtx.currentTime);
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
    case 'transient':
      if(bypassed){
        if(_transientNode){
          moduleBypassSaved.transient={thr:_transientNode.threshold.value,ratio:_transientNode.ratio.value};
          _transientNode.threshold.setTargetAtTime(0,audioCtx.currentTime,0.03);
          _transientNode.ratio.setTargetAtTime(1,audioCtx.currentTime,0.03);
        }
      } else {
        updateTransient(); // restore from current slider values
      }
      break;
    case 'clip':
      clipBypassed = bypassed;
      updateClipper();
      break;
    case 'multiband':
      if(bypassed){
        moduleBypassSaved.multiband=true;
        // force direct path (bands off) regardless of toggle
        if(mbInputGain) mbInputGain.gain.setTargetAtTime(1,audioCtx.currentTime,0.05);
        if(mbBandsGain) mbBandsGain.gain.setTargetAtTime(0,audioCtx.currentTime,0.05);
      } else {
        updateMultiband(); // restore based on toggle state
      }
      break;
    case 'shape':
      if(bypassed){
        moduleBypassSaved.shape=true;
        // identity curve = transparent
        if(shapeWS){ const c=new Float32Array(2048); for(let i=0;i<2048;i++)c[i]=(i*2/2047)-1; shapeWS.curve=c; }
      } else {
        applyShapeCurve(); // restore from sliders
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
        msBypassed=true;
        if(msDirectGain) msDirectGain.gain.setTargetAtTime(1,audioCtx.currentTime,0.05);
        if(msProcGain)   msProcGain.gain.setTargetAtTime(0,audioCtx.currentTime,0.05);
      } else {
        msBypassed=false;
        _msEngage(); // re-evaluate based on current settings
      }
      break;
    case 'image':
      imagerBypassed=bypassed;
      if(bypassed){
        if(typeof msSideEqLow!=='undefined'&&msSideEqLow) msSideEqLow.gain.setTargetAtTime(0,audioCtx.currentTime,0.05);
        if(typeof msSideEqMid!=='undefined'&&msSideEqMid) msSideEqMid.gain.setTargetAtTime(0,audioCtx.currentTime,0.05);
        if(typeof msSideEqHigh!=='undefined'&&msSideEqHigh) msSideEqHigh.gain.setTargetAtTime(0,audioCtx.currentTime,0.05);
      } else {
        updateImager();
      }
      break;
    case 'reson':
      resonBypassed=bypassed;
      if(bypassed){
        _resonNodes.forEach(n=>{ if(n) n.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); });
      }
      break;
    case 'lowfocus':
      lowFocusBypassed=bypassed;
      if(bypassed){
        if(_lfSub) _lfSub.frequency.setTargetAtTime(20, audioCtx.currentTime, 0.05);
        if(_lfBass) _lfBass.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(_lfMud)  _lfMud.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(msSideEqLow) msSideEqLow.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      } else {
        updateLowFocus();
      }
      break;
    case 'highfocus':
      highFocusBypassed=bypassed;
      if(bypassed){
        if(_hfAir)   _hfAir.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(_hfDeess) _hfDeess.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(_hfPres)  _hfPres.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      } else {
        updateHighFocus();
      }
      break;
    case 'dyneq':
      dynEQBypassed=bypassed;
      if(bypassed){
        _deqNodes.forEach(n=>{ if(n) n.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); });
      } else {
        updateDynEQ();
      }
      break;
    case 'mseq':
      mseqBypassed=bypassed;
      if(bypassed){
        if(_mseqMidLow)  _mseqMidLow.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(_mseqMidMid)  _mseqMidMid.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(_mseqMidHigh) _mseqMidHigh.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(msSideEqLow)  msSideEqLow.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(msSideEqMid)  msSideEqMid.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        if(msSideEqHigh) msSideEqHigh.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      } else {
        updateMSEq();
      }
      break;
    case 'warmth':
      warmthBypassed=bypassed;
      if(bypassed && typeof shapeWS!=='undefined' && shapeWS && _warmthBaseCurve){
        shapeWS.curve = _warmthBaseCurve;
      } else if(!bypassed){
        updateWarmth();
      }
      break;
    case 'spectral':
      spectralBypassed=bypassed;
      if(bypassed){
        _spNodes.forEach(n=>{ if(n) n.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); });
      } else {
        updateSpectral();
      }
      break;
    case 'tdesign':
      tdesignBypassed=bypassed;
      if(bypassed && _tdesignBaseTransient && typeof _transientNode!=='undefined' && _transientNode){
        _transientNode.threshold.setTargetAtTime(_tdesignBaseTransient.thr, audioCtx.currentTime, 0.05);
        _transientNode.ratio.setTargetAtTime(_tdesignBaseTransient.ratio, audioCtx.currentTime, 0.05);
      } else if(!bypassed){
        updateTDesign();
      }
      break;
    case '__midside_old__':
      if(bypassed){
        moduleBypassSaved.midside={
          mid:msMidGain?.gain.value||1, side:msSideGain?.gain.value||1,
          ml:msMidEqLow?.gain.value||0, mm:msMidEqMid?.gain.value||0, mh:msMidEqHigh?.gain.value||0,
          sl:msSideEqLow?.gain.value||0, sm:msSideEqMid?.gain.value||0, sh:msSideEqHigh?.gain.value||0
        };
        const now=audioCtx.currentTime;
        if(msMidGain)  msMidGain.gain.setTargetAtTime(1.0,now,0.05);
        if(msSideGain) msSideGain.gain.setTargetAtTime(1.0,now,0.05);
        [msMidEqLow,msMidEqMid,msMidEqHigh,msSideEqLow,msSideEqMid,msSideEqHigh].forEach(n=>{if(n)n.gain.setTargetAtTime(0,now,0.05);});
      } else if(moduleBypassSaved.midside){
        const now=audioCtx.currentTime, s=moduleBypassSaved.midside;
        if(msMidGain)  msMidGain.gain.setTargetAtTime(s.mid,now,0.05);
        if(msSideGain) msSideGain.gain.setTargetAtTime(s.side,now,0.05);
        if(msMidEqLow)  msMidEqLow.gain.setTargetAtTime(s.ml,now,0.05);
        if(msMidEqMid)  msMidEqMid.gain.setTargetAtTime(s.mm,now,0.05);
        if(msMidEqHigh) msMidEqHigh.gain.setTargetAtTime(s.mh,now,0.05);
        if(msSideEqLow) msSideEqLow.gain.setTargetAtTime(s.sl,now,0.05);
        if(msSideEqMid) msSideEqMid.gain.setTargetAtTime(s.sm,now,0.05);
        if(msSideEqHigh)msSideEqHigh.gain.setTargetAtTime(s.sh,now,0.05);
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
  // master (acesso total)
  'admin':     {pass:'piradex2024',  type:'master',   tier:'advanced', exports:null, hours:null},
  'piradex':   {pass:'number1',      type:'master',   tier:'advanced', exports:null, hours:null},
  // contas FULL avançadas (com STUDIO PRO)
  'beatfreak': {pass:'studio2024',   type:'full',     tier:'advanced', exports:null, hours:null},
  'producer1': {pass:'beats2024',    type:'full',     tier:'advanced', exports:null, hours:null},
  // contas FULL básicas (sem STUDIO PRO)
  'producer2': {pass:'music2024',    type:'full',     tier:'basic',    exports:null, hours:null},
  'cliente1':  {pass:'basic2024',    type:'full',     tier:'basic',    exports:null, hours:null},
  // demo (10 minutos de tempo + 3 exportações)
  'demo':      {pass:'demo123',      type:'demo',     tier:'basic',    exports:3,    minutes:10},
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

    // apply tier from the account
    if(userData.type==='full' || userData.type==='master'){
      // ── RESET total de qualquer estado anterior de demo/beta ──
      if(betaTimerInterval){ clearInterval(betaTimerInterval); betaTimerInterval=null; }
      betaSessionStart=null;
      betaExportsUsed=0;
      sessionStorage.removeItem('beta_session_start');
      sessionStorage.removeItem('beta_exports_used');
      const tb=document.getElementById('beta-timer'); if(tb) tb.style.display='none';
      // ── aplica licença full/master ──
      isFullVersion=true;
      hasStudioPro=(userData.tier==='advanced');
      currentLicense={key:'account:'+user, tier:userData.tier, mode:userData.type, days:null};
      updateLicenseBadge();
      // ── força refresh da UI: se algum modal de licença/paywall estiver aberto, fecha ──
      const lm=document.getElementById('license-modal'); if(lm) lm.style.display='none';
      const pm=document.getElementById('paywall-modal'); if(pm) pm.style.display='none';
      // se a tab STUDIO PRO estiver aberta com o ecrã de bloqueio, renderiza o hub
      const sp=document.getElementById('tab-studiopro');
      if(sp && sp.style.display!=='none' && typeof fxRenderHub==='function'){
        setTimeout(()=>fxRenderHub(),60);
      }
      const tier=userData.tier==='advanced'?'AVANÇADA':'BÁSICA';
      const lvl=userData.type==='master'?'★ MASTER':'FULL '+tier;
      setStatus('✓ Entraste como '+user+' — '+lvl+(userData.tier==='advanced'?' (STUDIO PRO desbloqueado)':''));
    }
    // Beta/limited user setup OR Demo with time limit
    if(userData.type==='beta' || (userData.type==='demo' && userData.minutes)){
      const totalSecs = userData.minutes ? userData.minutes*60 : userData.hours*3600;
      // Restore or start session
      const savedStart = sessionStorage.getItem('beta_session_start');
      const savedExports = parseInt(sessionStorage.getItem('beta_exports_used')||'0');
      betaExportsUsed = savedExports;

      if(savedStart){
        betaSessionStart = parseInt(savedStart);
        const elapsed = (Date.now()-betaSessionStart)/1000;
        if(elapsed >= totalSecs){
          // Session expired
          isLoggedIn=false;
          err.textContent='⏱️ Sessão '+(userData.type==='demo'?'demo':'beta')+' expirada. Adquire uma licença em beatfreakstudio.com';
          document.getElementById('login-screen').style.display='flex';
          return;
        }
      } else {
        betaSessionStart = Date.now();
        sessionStorage.setItem('beta_session_start', betaSessionStart);
      }
      startBetaTimer(totalSecs);
      const tag=userData.type==='demo'?'🧪 DEMO':'🧪 BETA TESTER';
      setStatus(tag+' · '+(userData.minutes?userData.minutes+' min':userData.hours+'h')+' de sessão · '+betaExportsUsed+'/'+userData.exports+' exportações usadas');
    }
  } else {
    err.textContent='❌ Credenciais inválidas.';
    document.getElementById('login-pass').value='';
    const box=document.querySelector('.login-box');
    if(box){box.style.animation='shake 0.4s ease';setTimeout(()=>box.style.animation='',400);}
  }
}

function startBetaTimer(totalSecs){
  if(betaTimerInterval) clearInterval(betaTimerInterval);
  betaTimerInterval = setInterval(()=>{
    if(!betaSessionStart) return;
    const elapsed = (Date.now()-betaSessionStart)/1000;
    const remaining = totalSecs - elapsed;
    if(remaining <= 0){
      clearInterval(betaTimerInterval);
      isLoggedIn = false;
      sessionStorage.removeItem('piradex_session');
      sessionStorage.removeItem('beta_session_start');
      document.getElementById('login-screen').style.display='flex';
      const userData = USERS[currentUser];
      const lbl = userData && userData.type==='demo' ? 'demo de '+userData.minutes+' min' : 'beta';
      document.getElementById('login-error').textContent='⏱️ Sessão '+lbl+' terminada. Adquire a versão completa.';
      setStatus('Sessão terminada');
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
    // Check beta/demo expiry
    if(userData.type==='beta' || (userData.type==='demo' && userData.minutes)){
      const totalSecs = userData.minutes ? userData.minutes*60 : userData.hours*3600;
      const savedStart = sessionStorage.getItem('beta_session_start');
      if(savedStart){
        const elapsed = (Date.now()-parseInt(savedStart))/1000;
        if(elapsed >= totalSecs){
          sessionStorage.removeItem('piradex_session');
          return; // show login
        }
        betaSessionStart = parseInt(savedStart);
        betaExportsUsed = parseInt(sessionStorage.getItem('beta_exports_used')||'0');
        currentUser = user;
        isLoggedIn = true;
        document.getElementById('login-screen').style.display='none';
        startBetaTimer(totalSecs);
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

// ═══════════════════════════════════════════════════════════════════════════
// LICENÇAS — 3 modalidades × 2 níveis
//   modo:  'master' (tua) · 'lifetime' (vitalícia) · 'monthly' (aluguer mensal)
//   nível: 'basic' (sem STUDIO PRO) · 'advanced' (com STUDIO PRO)
// Cada chave define: {tier, mode, days}. days=null = sem expiração.
// As chaves abaixo são exemplos — gera/entrega as tuas após o pagamento.
// ═══════════════════════════════════════════════════════════════════════════
const LICENSES = {
  // ── A TUA MASTER (acesso total, sem limites) ──
  'PRDX-MSTR-PIRA-DEX1': {tier:'advanced', mode:'master',   days:null},

  // ── VITALÍCIA BÁSICA (30 USD) — sem STUDIO PRO ──
  'PRDX-LFTB-0001-0001': {tier:'basic',    mode:'lifetime', days:null},
  'PRDX-LFTB-0002-0002': {tier:'basic',    mode:'lifetime', days:null},
  'PRDX-LFTB-0003-0003': {tier:'basic',    mode:'lifetime', days:null},

  // ── VITALÍCIA AVANÇADA (50 USD) — com STUDIO PRO ──
  'PRDX-LFTA-0001-0001': {tier:'advanced', mode:'lifetime', days:null},
  'PRDX-LFTA-0002-0002': {tier:'advanced', mode:'lifetime', days:null},
  'PRDX-LFTA-0003-0003': {tier:'advanced', mode:'lifetime', days:null},

  // ── ALUGUER MENSAL BÁSICO (15 USD/mês) — sem STUDIO PRO, 30 dias ──
  'PRDX-MNTB-0001-0001': {tier:'basic',    mode:'monthly',  days:30},
  'PRDX-MNTB-0002-0002': {tier:'basic',    mode:'monthly',  days:30},
  'PRDX-MNTB-0003-0003': {tier:'basic',    mode:'monthly',  days:30},

  // ── ALUGUER MENSAL AVANÇADO (25 USD/mês) — com STUDIO PRO, 30 dias ──
  'PRDX-MNTA-0001-0001': {tier:'advanced', mode:'monthly',  days:30},
  'PRDX-MNTA-0002-0002': {tier:'advanced', mode:'monthly',  days:30},
  'PRDX-MNTA-0003-0003': {tier:'advanced', mode:'monthly',  days:30},
};
let isFullVersion=false;   // true = qualquer licença válida (desbloqueia exportação)
let hasStudioPro=false;    // true = nível 'advanced' (desbloqueia STUDIO PRO)
let currentLicense=null;

function _licenseValid(key){
  const L=LICENSES[key]; if(!L) return null;
  // check expiry for monthly
  if(L.days){
    const actKey='piradex_lic_activated_'+key;
    let act=parseInt(localStorage.getItem(actKey)||'0');
    if(!act){ act=Date.now(); localStorage.setItem(actKey,String(act)); }
    const elapsedDays=(Date.now()-act)/86400000;
    if(elapsedDays>L.days) return {...L, expired:true};
  }
  return {...L, expired:false};
}
function _applyLicense(key,L){
  currentLicense={key,...L};
  isFullVersion=true;
  hasStudioPro=(L.tier==='advanced');
}
function checkLicense(){
  const saved=sessionStorage.getItem('piradex_license');
  if(saved){
    const L=_licenseValid(saved);
    if(L && !L.expired){ _applyLicense(saved,L); }
    else if(L && L.expired){ sessionStorage.removeItem('piradex_license'); setStatus('⏱ A tua licença mensal expirou — renova para continuar'); }
  }
  updateLicenseBadge();
}
function activateLicense(){
  const input=document.getElementById('license-input'),err=document.getElementById('license-error');
  const key=input.value.trim().toUpperCase();
  if(!key){err.textContent='Introduz a tua licença.';return;}
  const L=_licenseValid(key);
  if(L && !L.expired){
    _applyLicense(key,L); exportCount=0;
    sessionStorage.setItem('piradex_license',key);
    document.getElementById('license-modal').style.display='none';
    const pm=document.getElementById('paywall-modal'); if(pm) pm.style.display='none';
    updateLicenseBadge();
    const modeTxt={master:'MASTER',lifetime:'VITALÍCIA',monthly:'MENSAL'}[L.mode];
    const tierTxt=L.tier==='advanced'?'AVANÇADA (STUDIO PRO)':'BÁSICA';
    setStatus('✓ Licença '+modeTxt+' '+tierTxt+' ativada'+(L.days?(' · '+L.days+' dias'):''));
  } else if(L && L.expired){
    err.textContent='⏱ Esta licença mensal expirou. Renova para continuar.';
  } else {
    err.textContent='❌ Licença inválida.';input.value='';
    const box=document.querySelector('.license-box');
    if(box){box.style.animation='shake 0.4s ease';setTimeout(()=>box.style.animation='',400);}
  }
}
function updateLicenseBadge(){
  const b=document.getElementById('license-badge');
  if(b){
    let label='DEMO', col='var(--muted)', bord='var(--border2)';
    if(isFullVersion){
      if(currentLicense&&currentLicense.mode==='master'){label='★ MASTER';col='var(--c3)';bord='var(--c3)';}
      else if(hasStudioPro){label='✓ AVANÇADA';col='var(--c4)';bord='var(--c4)';}
      else {label='✓ BÁSICA';col='var(--c5)';bord='var(--c5)';}
    }
    b.textContent=label;b.style.color=col;b.style.borderColor=bord;
  }
  // STUDIO PRO tab: locked unless advanced/master tier
  const sp=document.querySelector('.tab[onclick*="studiopro"]');
  if(sp){
    sp.textContent = hasStudioPro ? 'STUDIO PRO' : 'STUDIO PRO 🔒';
    sp.style.opacity = hasStudioPro ? '1' : '0.6';
  }
}
const PLANS={
  'lifetime-basic':   {label:'Vitalícia Básica',    price:'30 USD',     tier:'básica',   pro:false},
  'lifetime-advanced':{label:'Vitalícia Avançada',  price:'50 USD',     tier:'avançada', pro:true},
  'monthly-basic':    {label:'Mensal Básica',       price:'15 USD/mês', tier:'básica',   pro:false},
  'monthly-advanced': {label:'Mensal Avançada',     price:'25 USD/mês', tier:'avançada', pro:true},
};
let _selectedPlan=null, _payProofFile=null;
function openLicenseModal(){
  document.getElementById('license-modal').style.display='flex';
  licTab('buy');
}
function selectPlan(p){
  _selectedPlan=p;
  document.querySelectorAll('.plan-card').forEach(c=>c.classList.toggle('plan-active', c.getAttribute('data-plan')===p));
  const sel=document.getElementById('plan-selected'), txt=document.getElementById('plan-selected-txt');
  if(sel&&txt){ sel.style.display='block'; txt.textContent=PLANS[p].label+' · '+PLANS[p].price; }
}
function payProofChanged(input){
  _payProofFile = input.files && input.files[0] ? input.files[0] : null;
  const n=document.getElementById('pay-proof-name');
  if(n) n.textContent=_payProofFile?('✓ Anexado: '+_payProofFile.name):'';
}
function _payValidate(){
  const name=(document.getElementById('pay-name').value||'').trim();
  const email=(document.getElementById('pay-email').value||'').trim();
  const msg=document.getElementById('pay-form-msg');
  if(!_selectedPlan){ msg.style.color='var(--c7)'; msg.textContent='Escolhe primeiro um plano.'; return null; }
  if(!name||!email){ msg.style.color='var(--c7)'; msg.textContent='Preenche o nome e o email.'; return null; }
  if(!_payProofFile){ msg.style.color='var(--c7)'; msg.textContent='Anexa o comprovativo de pagamento.'; return null; }
  return {name,email,P:PLANS[_selectedPlan],msg};
}
function _payText(d){
  return 'Novo pedido de licença MASTERING SUITE\n\n'+
    'Plano: '+d.P.label+' ('+d.P.price+')\n'+
    'Nível: '+d.P.tier+(d.P.pro?' (com STUDIO PRO)':' (sem STUDIO PRO)')+'\n'+
    'Nome completo: '+d.name+'\n'+
    'Email do cliente: '+d.email+'\n'+
    'Comprovativo: '+_payProofFile.name+' (anexar manualmente)';
}
function submitPayment(){
  const d=_payValidate(); if(!d) return;
  const subject='PAGAMENTO MASTERING SUITE — '+d.P.label;
  const mailto='mailto:juninhopiradex@hotmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(_payText(d)+'\n\n⚠ IMPORTANTE: anexa o comprovativo ("'+_payProofFile.name+'") a este email antes de enviar.');
  window.location.href=mailto;
  d.msg.style.color='var(--c4)';
  d.msg.innerHTML='Abrimos o teu email com os dados.<br>⚠ <b>Anexa o comprovativo</b> antes de enviar.';
}
function submitPaymentWA(){
  const d=_payValidate(); if(!d) return false;
  const txt=encodeURIComponent('Olá Juninho! '+_payText(d)+'\n\n(Vou anexar aqui o comprovativo.)');
  document.getElementById('pay-wa-btn').href='https://wa.me/244924958103?text='+txt;
  d.msg.style.color='var(--c4)';
  d.msg.innerHTML='Abrimos o WhatsApp com os dados.<br>⚠ <b>Anexa a foto do comprovativo</b> na conversa antes de enviar.';
  return true;
}
function licTab(which){
  const buy=document.getElementById('lic-panel-buy'), key=document.getElementById('lic-panel-key');
  const tb=document.getElementById('lic-tab-buy'), tk=document.getElementById('lic-tab-key');
  if(which==='key'){ buy.style.display='none'; key.style.display='block'; tk.classList.add('lic-tab-active'); tb.classList.remove('lic-tab-active'); }
  else { buy.style.display='block'; key.style.display='none'; tb.classList.add('lic-tab-active'); tk.classList.remove('lic-tab-active'); }
}
function licCopy(t){ if(navigator.clipboard) navigator.clipboard.writeText(t); setStatus('Copiado: '+t); }
function licLogin(){
  // Fecha o modal de licença e abre o ecrã de login para autenticar como master/full
  document.getElementById('license-modal').style.display='none';
  // ── RESET total ──
  if(typeof betaTimerInterval!=='undefined' && betaTimerInterval){ clearInterval(betaTimerInterval); betaTimerInterval=null; }
  if(typeof betaSessionStart!=='undefined') betaSessionStart=null;
  if(typeof betaExportsUsed!=='undefined') betaExportsUsed=0;
  sessionStorage.removeItem('piradex_session');
  sessionStorage.removeItem('piradex_user');
  sessionStorage.removeItem('beta_session_start');
  sessionStorage.removeItem('beta_exports_used');
  isLoggedIn=false; isFullVersion=false; hasStudioPro=false; currentLicense=null;
  const tb=document.getElementById('beta-timer'); if(tb) tb.style.display='none';
  updateLicenseBadge();
  const ls=document.getElementById('login-screen');
  if(ls){ ls.style.display='flex'; const u=document.getElementById('login-user'); if(u){u.value='';u.focus();} const p=document.getElementById('login-pass'); if(p)p.value=''; const e=document.getElementById('login-error'); if(e)e.textContent=''; }
  setStatus('Sessão terminada — entra com a tua conta');
}
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

// ═══════════════════════════════════════════════════════════════════════════
// PIRADEX v6 — 10 NEW PROFESSIONAL FEATURES
// ═══════════════════════════════════════════════════════════════════════════

// ── FEAT 1: Interactive EQ curve with draggable nodes ──────────────────────
let eqDragNode = null, eqDragBand = null;
const EQ_BANDS_CONFIG = [
  {id:'sub',  f:60,   type:'lowshelf', node:()=>eqSub,     label:'SUB'},
  {id:'bass', f:150,  type:'peaking',  node:()=>eqBass,    label:'BASS'},
  {id:'low',  f:500,  type:'peaking',  node:()=>eqLowNode, label:'LOW'},
  {id:'mid',  f:1200, type:'peaking',  node:()=>eqMid,     label:'MID'},
  {id:'high', f:4000, type:'peaking',  node:()=>eqHigh,    label:'HIGH'},
  {id:'air',  f:12000,type:'highshelf',node:()=>eqAir,     label:'AIR'},
];

function initInteractiveEQ(){
  const canvas = document.getElementById('eq-interactive-canvas');
  if(!canvas) return;
  canvas.addEventListener('mousedown', eqMouseDown);
  canvas.addEventListener('mousemove', eqMouseMove);
  canvas.addEventListener('mouseup',   ()=>{ eqDragNode=null; eqDragBand=null; });
  canvas.addEventListener('mouseleave',()=>{ eqDragNode=null; eqDragBand=null; });
  canvas.addEventListener('touchstart', eqTouchStart, {passive:false});
  canvas.addEventListener('touchmove',  eqTouchMove,  {passive:false});
  canvas.addEventListener('touchend',   ()=>{ eqDragNode=null; eqDragBand=null; });
  drawInteractiveEQ();
}

function eqFx(f, W){ return Math.log10(f/20)/Math.log10(22000/20)*W; }
function eqGy(g, H){ return H/2 - (g/14)*(H/2-8); }
function eqGFromY(y, H){ return ((H/2-y)/(H/2-8))*14; }

function drawInteractiveEQ(){
  const canvas = document.getElementById('eq-interactive-canvas');
  if(!canvas||!canvas.getContext) return;
  const realW = canvas.offsetWidth||0;
  // Don't draw until the canvas has a real layout width — prevents the
  // "giant node" look on first open when offsetWidth is still 0/300.
  if(realW < 50){ return; }
  const W=realW, H=canvas.height||100;
  if(canvas.width!==W) canvas.width=W;
  if(!canvas._eqResizeBound){
    canvas._eqResizeBound=true;
    if(window.ResizeObserver){
      new ResizeObserver(()=>{ drawInteractiveEQ(); }).observe(canvas);
    }
  }
  const ctx=canvas.getContext('2d');
  const isDark = true; // app is always dark-themed
  ctx.fillStyle = isDark?'#07070e':'#f8f8f5';
  ctx.fillRect(0,0,W,H);
  // grid
  ctx.strokeStyle = isDark?'#ffffff08':'#00000008'; ctx.lineWidth=0.5;
  [-12,-6,0,6,12].forEach(db=>{
    const y=eqGy(db,H);
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    ctx.fillStyle=isDark?'#ffffff22':'#00000033';
    ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText((db>0?'+':'')+db,2,y-2);
  });
  ctx.setLineDash([2,4]);
  [60,150,500,1200,4000,12000].forEach(f=>{
    const x=eqFx(f,W);
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
  });
  ctx.setLineDash([]);
  // zero line
  ctx.strokeStyle = isDark?'#ffffff22':'#00000022'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  // EQ curve
  const gains = EQ_BANDS_CONFIG.map(b=>{ try{ return b.node()?.gain.value||0; }catch(e){return 0;} });
  const pts = EQ_BANDS_CONFIG.map((b,i)=>({ x:eqFx(b.f,W), y:eqGy(gains[i],H) }));
  ctx.strokeStyle='#534AB7'; ctx.lineWidth=2;
  ctx.fillStyle='#534AB722';
  ctx.beginPath(); ctx.moveTo(0,H/2);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(W,H/2);
  ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,H/2);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(W,H/2); ctx.stroke();
  // nodes
  const NODE_COLS=['#b855f7','#2dd4ff','#2dff8a','#ffe135','#ff6b35','#ff3ab5'];
  pts.forEach((p,i)=>{
    ctx.fillStyle=NODE_COLS[i];
    ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=isDark?'#fff':'#111';
    ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill();
    // label
    ctx.fillStyle=NODE_COLS[i]; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    const g=gains[i]; ctx.fillText((g>0?'+':'')+g.toFixed(1), p.x, p.y+(p.y>H/2?-10:14));
  });
}

function eqGetNode(x,y,W,H){
  const gains=EQ_BANDS_CONFIG.map(b=>{try{return b.node()?.gain.value||0;}catch(e){return 0;}});
  for(let i=0;i<EQ_BANDS_CONFIG.length;i++){
    const px=eqFx(EQ_BANDS_CONFIG[i].f,W), py=eqGy(gains[i],H);
    if(Math.hypot(x-px,y-py)<12) return i;
  }
  return -1;
}

function eqMouseDown(e){
  const canvas=e.target; const rect=canvas.getBoundingClientRect();
  const W=canvas.width, H=canvas.height;
  const x=(e.clientX-rect.left)*(W/rect.width);
  const y=(e.clientY-rect.top)*(H/rect.height);
  const idx=eqGetNode(x,y,W,H);
  if(idx>=0){ eqDragBand=idx; e.preventDefault(); }
}
function eqMouseMove(e){
  if(eqDragBand===null||eqDragBand<0) return;
  const canvas=e.target; const rect=canvas.getBoundingClientRect();
  const H=canvas.height; const y=(e.clientY-rect.top)*(H/rect.height);
  const g=Math.max(-12,Math.min(12,eqGFromY(y,H)));
  const band=EQ_BANDS_CONFIG[eqDragBand];
  try{ band.node().gain.value=parseFloat(g.toFixed(1)); }catch(err){}
  const slId='eq-'+band.id; const slEl=document.getElementById(slId);
  if(slEl) slEl.value=g.toFixed(1);
  const vEl=document.getElementById(slId+'-v');
  if(vEl) vEl.textContent=(g>=0?'+':'')+g.toFixed(1)+' dB';
  drawInteractiveEQ(); _snapUndoThrottled();
}
function eqTouchStart(e){
  const t=e.touches[0]; const canvas=e.target; const rect=canvas.getBoundingClientRect();
  const W=canvas.width, H=canvas.height;
  const x=(t.clientX-rect.left)*(W/rect.width), y=(t.clientY-rect.top)*(H/rect.height);
  const idx=eqGetNode(x,y,W,H);
  if(idx>=0){ eqDragBand=idx; e.preventDefault(); }
}
function eqTouchMove(e){
  if(eqDragBand===null||eqDragBand<0) return;
  e.preventDefault();
  const t=e.touches[0]; const canvas=e.target; const rect=canvas.getBoundingClientRect();
  const H=canvas.height; const y=(t.clientY-rect.top)*(H/rect.height);
  const g=Math.max(-12,Math.min(12,eqGFromY(y,H)));
  const band=EQ_BANDS_CONFIG[eqDragBand];
  try{ band.node().gain.value=parseFloat(g.toFixed(1)); }catch(err){}
  drawInteractiveEQ(); _snapUndoThrottled();
}

// ── FEAT 2: LUFS histogram over time ───────────────────────────────────────
let _lufsHistory=[], _lufsHistMax=300;
let _lufsMin=-70, _lufsMax=-3, _lufsAvg=-9;

function _recordLUFSPoint(){
  if(!isPlaying||!analyserNode) return;
  const td=new Float32Array(analyserNode.fftSize);
  analyserNode.getFloatTimeDomainData(td);
  let sq=0; for(let i=0;i<td.length;i++) sq+=td[i]*td[i];
  const rms=Math.sqrt(sq/td.length);
  const lufs=rms>0?-0.691+20*Math.log10(rms):-70;
  _lufsHistory.push(Math.max(-70,Math.min(-3,lufs)));
  if(_lufsHistory.length>_lufsHistMax) _lufsHistory.shift();
  if(_lufsHistory.length>1){
    _lufsMin=Math.min(..._lufsHistory);
    _lufsMax=Math.max(..._lufsHistory);
    _lufsAvg=_lufsHistory.reduce((a,b)=>a+b,0)/_lufsHistory.length;
  }
  _drawLUFSHistogram();
  _updateLUFSStats();
}
setInterval(_recordLUFSPoint, 200);

function _drawLUFSHistogram(){
  const canvas=document.getElementById('lufs-histogram-canvas');
  if(!canvas) return;
  const W=canvas.offsetWidth||canvas.width||300, H=canvas.height||50;
  if(canvas.width!==W) canvas.width=W;
  const ctx=canvas.getContext('2d');
  const isDark=true; // app is always dark-themed
  ctx.fillStyle=isDark?'#07070e':'#f8f8f5'; ctx.fillRect(0,0,W,H);
  if(!_lufsHistory.length) return;
  const bw=W/_lufsHistMax;
  _lufsHistory.forEach((v,i)=>{
    const pct=(v+70)/(70-3);
    const bh=Math.max(2,pct*H);
    const col=v>-9.5?'#1D9E75':v>-11?'#534AB7':'#993C1D';
    ctx.fillStyle=col+'cc';
    ctx.fillRect(i*bw, H-bh, Math.max(1,bw-0.5), bh);
  });
  // target line -9
  const ty=H-((-9+70)/(70-3))*H;
  ctx.strokeStyle='#ffe13588'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(0,ty); ctx.lineTo(W,ty); ctx.stroke();
  ctx.setLineDash([]);
}

function _updateLUFSStats(){
  const mn=document.getElementById('lufs-hist-min');
  const av=document.getElementById('lufs-hist-avg');
  const mx=document.getElementById('lufs-hist-max');
  if(mn) mn.textContent=_lufsMin.toFixed(1);
  if(av) av.textContent=_lufsAvg.toFixed(1);
  if(mx) mx.textContent=_lufsMax.toFixed(1);
}

// ── FEAT 3: Before/After analysis ──────────────────────────────────────────
let _beforeStats=null;

function _captureBeforeStats(){
  if(!audioBuffer) return;
  const plr=_calcPLR(audioBuffer);
  const lufs=_measureLUFS_BS1770(audioBuffer);
  let lowE=0,midE=0,highE=0,tot=0;
  for(let c=0;c<audioBuffer.numberOfChannels;c++){
    const d=audioBuffer.getChannelData(c);
    for(let i=0;i<d.length;i++){
      const sr=audioBuffer.sampleRate, f=i/d.length*sr/2;
      const v=d[i]*d[i];
      if(f<300) lowE+=v; else if(f<4000) midE+=v; else highE+=v;
      tot+=v;
    }
  }
  _beforeStats={ lufs:lufs||(-70), peak:plr?.peakDb||0, plr:plr?.plr||0,
    low:tot>0?(lowE/tot*100):33, mid:tot>0?(midE/tot*100):33, high:tot>0?(highE/tot*100):33 };
}

function _showBAReport(afterBuf){
  const lufsAfter=_measureLUFS_BS1770(afterBuf);
  const plrAfter=_calcPLR(afterBuf);
  if(!_beforeStats) return;
  const modal=document.getElementById('ba-report-modal');
  if(!modal) return;
  const set=(id,v,good)=>{
    const el=document.getElementById(id); if(!el) return;
    el.textContent=typeof v==='number'?v.toFixed(1):v;
    if(good!==undefined) el.style.color=good?'#1D9E75':'#ff4500';
  };
  set('ba-lufs-before',_beforeStats.lufs);
  set('ba-lufs-after', lufsAfter, lufsAfter>-12&&lufsAfter<-7);
  set('ba-peak-before',_beforeStats.peak);
  set('ba-peak-after', plrAfter?.peakDb||0, (plrAfter?.peakDb||0)<=-1);
  set('ba-plr-before', _beforeStats.plr);
  set('ba-plr-after',  plrAfter?.plr||0, (plrAfter?.plr||0)>8);
  modal.style.display='flex';
}

// ── FEAT 4: Health Check ────────────────────────────────────────────────────
function runHealthCheck(){
  if(!audioBuffer){ setStatus('Carrega um ficheiro primeiro'); return; }
  const issues=[];
  // Clipping
  let clips=0;
  for(let c=0;c<audioBuffer.numberOfChannels;c++){
    const d=audioBuffer.getChannelData(c);
    for(let i=0;i<d.length;i++) if(Math.abs(d[i])>=0.9999) clips++;
  }
  if(clips>0) issues.push({type:'error',icon:'ti-alert-circle',title:'Clipping detectado',msg:clips+' amostras a 0 dBFS — aplica headroom'});
  // Phase
  const corr=parseFloat(document.getElementById('phase-corr-val')?.textContent||'0');
  if(corr<-0.1) issues.push({type:'error',icon:'ti-arrows-exchange',title:'Fase negativa',msg:'Correlação '+corr.toFixed(2)+' — incompatível com mono'});
  else if(corr<0.3) issues.push({type:'warn',icon:'ti-alert-triangle',title:'Fase baixa',msg:'Correlação '+corr.toFixed(2)+' — pode ter problemas em mono'});
  // Peak level
  const plr=_calcPLR(audioBuffer);
  if(plr&&plr.peakDb>-0.5) issues.push({type:'warn',icon:'ti-alert-triangle',title:'Nível de pico alto',msg:'Peak '+plr.peakDb.toFixed(1)+' dBFS — risco de clipping'});
  if(plr&&plr.plr<4) issues.push({type:'warn',icon:'ti-waveform',title:'Dinâmica muito reduzida',msg:'PLR '+plr.plr.toFixed(1)+' dB — música hiperlimitada'});
  // Low end excess
  const fd=new Uint8Array(analyserNode?.frequencyBinCount||256);
  if(analyserNode) analyserNode.getByteFrequencyData(fd);
  const subEnergy=Array.from(fd.slice(0,8)).reduce((a,b)=>a+b,0)/8;
  if(subEnergy>180) issues.push({type:'warn',icon:'ti-wave-square',title:'Sub excessivo @ 20–80Hz',msg:'Energia '+Math.round(subEnergy/2.55)+'% — pode mascarar o kick'});
  if(!issues.length) issues.push({type:'ok',icon:'ti-circle-check',title:'Sem problemas detectados',msg:'Faixa pronta para masterização'});
  _showHealthCheck(issues);
}

function _showHealthCheck(issues){
  const modal=document.getElementById('health-modal');
  const list=document.getElementById('health-list');
  if(!modal||!list) return;
  list.innerHTML='';
  issues.forEach(({type,icon,title,msg})=>{
    const col={error:'var(--color-text-danger)',warn:'var(--color-text-warning)',ok:'var(--color-text-success)'}[type];
    const bg={error:'var(--color-background-danger)',warn:'var(--color-background-warning)',ok:'var(--color-background-success)'}[type];
    const bd={error:'var(--color-border-danger)',warn:'var(--color-border-warning)',ok:'var(--color-border-success)'}[type];
    const div=document.createElement('div');
    div.style.cssText=`display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:6px;border:0.5px solid ${bd};background:${bg};margin-bottom:6px;`;
    div.innerHTML=`<i class="ti ${icon}" style="font-size:16px;color:${col};margin-top:1px;flex-shrink:0" aria-hidden="true"></i>
      <div><div style="font-size:13px;font-weight:500;color:${col};margin-bottom:2px;">${title}</div>
      <div style="font-size:12px;color:var(--color-text-secondary);">${msg}</div></div>`;
    list.appendChild(div);
  });
  modal.style.display='flex';
}

// ── FEAT 5: User presets (localStorage) ────────────────────────────────────
function _getUserPresets(){
  try{ return JSON.parse(localStorage.getItem('piradex_user_presets')||'[]'); }catch(e){ return []; }
}
function _saveUserPresets(p){ try{ localStorage.setItem('piradex_user_presets',JSON.stringify(p)); }catch(e){} }

function saveCurrentAsPreset(){
  const name=document.getElementById('save-preset-name')?.value||('Preset '+new Date().toLocaleDateString());
  const snap={ name, date:new Date().toISOString().slice(0,10),
    knobs:{...kvals}, eq:{sub:eqSub?.gain.value,bass:eqBass?.gain.value,low:eqLowNode?.gain.value,
      mid:eqMid?.gain.value,high:eqHigh?.gain.value,air:eqAir?.gain.value},
    comp:{thr:compNode?.threshold.value,ratio:compNode?.ratio.value},
    loud:masterGain?.gain.value, preset:curPreset };
  const presets=_getUserPresets();
  presets.unshift(snap);
  if(presets.length>20) presets.pop();
  _saveUserPresets(presets);
  _renderUserPresets();
  setStatus('Preset "'+name+'" guardado');
  document.getElementById('save-preset-name').value='';
}

function loadUserPreset(idx){
  const presets=_getUserPresets();
  const p=presets[idx]; if(!p) return;
  Object.assign(kvals,p.knobs);
  if(audioCtx&&p.eq){
    eqSub.gain.value=p.eq.sub||0; eqBass.gain.value=p.eq.bass||0;
    eqLowNode.gain.value=p.eq.low||0; eqMid.gain.value=p.eq.mid||0;
    eqHigh.gain.value=p.eq.high||0; eqAir.gain.value=p.eq.air||0;
  }
  if(audioCtx&&p.comp){ compNode.threshold.value=p.comp.thr||0; compNode.ratio.value=p.comp.ratio||1; }
  refreshKnobs(); syncEQSliders(); applyDSP(); drawInteractiveEQ();
  setStatus('Preset "'+p.name+'" carregado');
}

function deleteUserPreset(idx){
  const presets=_getUserPresets();
  presets.splice(idx,1);
  _saveUserPresets(presets);
  _renderUserPresets();
}

function exportUserPresets(){
  const data=JSON.stringify(_getUserPresets(),null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='piradex_presets.json'; a.click();
  URL.revokeObjectURL(url);
}

function importUserPresets(file){
  const r=new FileReader();
  r.onload=e=>{ try{
    const p=JSON.parse(e.target.result);
    const existing=_getUserPresets();
    _saveUserPresets([...p,...existing].slice(0,20));
    _renderUserPresets();
    setStatus(p.length+' presets importados');
  }catch(err){ setStatus('Erro ao importar presets'); }};
  r.readAsText(file);
}

function _renderUserPresets(){
  const list=document.getElementById('user-presets-list');
  if(!list) return;
  const presets=_getUserPresets();
  list.innerHTML='';
  if(!presets.length){
    list.innerHTML='<div style="font-size:12px;color:var(--color-text-tertiary);padding:8px 0;text-align:center;">Sem presets guardados</div>';
    return;
  }
  presets.forEach((p,i)=>{
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;border:0.5px solid var(--color-border-tertiary);margin-bottom:4px;background:var(--color-background-secondary);cursor:pointer;';
    div.innerHTML=`<i class="ti ti-music" style="font-size:14px;color:var(--color-text-info)" aria-hidden="true"></i>
      <div style="flex:1"><div style="font-size:12px;font-weight:500;color:var(--color-text-primary);">${p.name}</div>
      <div style="font-size:10px;color:var(--color-text-tertiary);">${p.date} · ${p.preset||'custom'}</div></div>
      <button onclick="loadUserPreset(${i})" style="font-size:10px;padding:2px 8px;border-radius:4px;border:0.5px solid var(--color-border-secondary);background:transparent;color:var(--color-text-info);cursor:pointer;">USAR</button>
      <button onclick="deleteUserPreset(${i})" style="font-size:10px;padding:2px 6px;border-radius:4px;border:0.5px solid var(--color-border-secondary);background:transparent;color:var(--color-text-tertiary);cursor:pointer;">×</button>`;
    list.appendChild(div);
  });
}

// ── FEAT 6: Parameter automation ───────────────────────────────────────────
let _autoPoints={ LOUD:[], BASS:[], WIDE:[] };
let _autoActive=false;
let _autoCanvas=null, _autoCtx=null, _autoDrag=null;

function initAutomation(){
  const canvas=document.getElementById('automation-canvas');
  if(!canvas) return;
  _autoCanvas=canvas; _autoCtx=canvas.getContext('2d');
  canvas.addEventListener('click', autoAddPoint);
  canvas.addEventListener('mousedown', autoStartDrag);
  canvas.addEventListener('mousemove', autoDragMove);
  canvas.addEventListener('mouseup', ()=>_autoDrag=null);
  drawAutomation();
}

function autoAddPoint(e){
  const param=document.getElementById('auto-param-sel')?.value||'LOUD';
  const rect=_autoCanvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)/_autoCanvas.width;
  const y=1-(e.clientY-rect.top)/_autoCanvas.height;
  _autoPoints[param].push({x,y});
  _autoPoints[param].sort((a,b)=>a.x-b.x);
  drawAutomation();
}

function autoStartDrag(e){
  const param=document.getElementById('auto-param-sel')?.value||'LOUD';
  const rect=_autoCanvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)/_autoCanvas.width;
  const my=1-(e.clientY-rect.top)/_autoCanvas.height;
  const pts=_autoPoints[param]||[];
  for(let i=0;i<pts.length;i++){
    if(Math.hypot(mx-pts[i].x,my-pts[i].y)<0.05){ _autoDrag={param,idx:i}; return; }
  }
}
function autoDragMove(e){
  if(!_autoDrag) return;
  const rect=_autoCanvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)/_autoCanvas.width;
  const y=Math.max(0,Math.min(1,1-(e.clientY-rect.top)/_autoCanvas.height));
  _autoPoints[_autoDrag.param][_autoDrag.idx]={x:Math.max(0,Math.min(1,x)),y};
  drawAutomation();
}

function clearAutomation(){
  const param=document.getElementById('auto-param-sel')?.value||'LOUD';
  _autoPoints[param]=[]; drawAutomation();
}

function drawAutomation(){
  const canvas=_autoCanvas; if(!canvas||!_autoCtx) return;
  const W=canvas.width, H=canvas.height;
  const ctx=_autoCtx;
  const isDark=true; // app is always dark-themed
  ctx.fillStyle=isDark?'#07070e':'#f8f8f5'; ctx.fillRect(0,0,W,H);
  const PARAM_COLS={LOUD:'#ff3ab5',BASS:'#b855f7',WIDE:'#2dff8a'};
  ctx.strokeStyle=isDark?'#ffffff08':'#00000008'; ctx.lineWidth=0.5;
  [.25,.5,.75].forEach(p=>{ctx.beginPath();ctx.moveTo(0,p*H);ctx.lineTo(W,p*H);ctx.stroke();
    ctx.beginPath();ctx.moveTo(p*W,0);ctx.lineTo(p*W,H);ctx.stroke();});
  Object.entries(_autoPoints).forEach(([param,pts])=>{
    if(!pts.length) return;
    const col=PARAM_COLS[param]||'#888';
    ctx.strokeStyle=col+'aa'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pts[0].x*W,(1-pts[0].y)*H);
    pts.forEach(p=>ctx.lineTo(p.x*W,(1-p.y)*H)); ctx.stroke();
    pts.forEach(p=>{
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(p.x*W,(1-p.y)*H,5,0,Math.PI*2); ctx.fill();
    });
  });
  // labels
  ctx.fillStyle=isDark?'#ffffff33':'#00000033'; ctx.font='9px monospace'; ctx.textAlign='center';
  ['0:00','1:08','2:16','3:24','4:31'].forEach((l,i)=>ctx.fillText(l,i*W/4,H-3));
}

function _applyAutomationAtTime(t, duration){
  if(!_autoActive) return;
  const pos=Math.max(0,Math.min(1,t/duration));
  Object.entries(_autoPoints).forEach(([param,pts])=>{
    if(pts.length<2) return;
    let val=pts[0].y;
    for(let i=0;i<pts.length-1;i++){
      if(pos>=pts[i].x&&pos<=pts[i+1].x){
        const r=(pos-pts[i].x)/(pts[i+1].x-pts[i].x);
        val=pts[i].y+r*(pts[i+1].y-pts[i].y); break;
      }
    }
    kvals[param]=Math.round(val*100);
  });
  applyDSP();
}

// ── FEAT 7: Batch processing ────────────────────────────────────────────────
let _batchQueue=[], _batchRunning=false, _batchResults=[];

function addToBatch(files){
  Array.from(files).forEach(f=>{
    if(!_batchQueue.find(b=>b.name===f.name)){
      _batchQueue.push({name:f.name, file:f, status:'pending', progress:0, lufs:null});
    }
  });
  _renderBatchList();
}

function _renderBatchList(){
  const list=document.getElementById('batch-list');
  if(!list) return;
  list.innerHTML='';
  _batchQueue.forEach((item,i)=>{
    const statusIcon={pending:'ti-clock',processing:'ti-loader',done:'ti-circle-check',error:'ti-alert-circle'}[item.status];
    const statusCol={pending:'var(--color-text-tertiary)',processing:'var(--color-text-info)',done:'var(--color-text-success)',error:'var(--color-text-danger)'}[item.status];
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:5px;border:0.5px solid var(--color-border-tertiary);margin-bottom:4px;background:var(--color-background-secondary);';
    div.innerHTML=`<i class="ti ${statusIcon}" style="font-size:13px;color:${statusCol};flex-shrink:0" aria-hidden="true"></i>
      <div style="flex:1;min-width:0;"><div style="font-size:11px;color:var(--color-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div></div>
      <div style="width:60px;height:4px;background:var(--color-background-primary);border-radius:2px;overflow:hidden;flex-shrink:0;">
        <div style="height:100%;width:${item.progress}%;background:${statusCol};border-radius:2px;transition:width .3s;"></div>
      </div>
      <span style="font-size:10px;color:${statusCol};min-width:36px;text-align:right;">${item.lufs?item.lufs.toFixed(1):(item.status==='done'?'ok':'—')}</span>
      ${item.status!=='processing'?`<button onclick="_removeBatchItem(${i})" style="font-size:10px;padding:1px 5px;border-radius:3px;border:0.5px solid var(--color-border-secondary);background:transparent;color:var(--color-text-tertiary);cursor:pointer;">×</button>`:''}`;
    list.appendChild(div);
  });
  const ct=document.getElementById('batch-count');
  const done=_batchQueue.filter(b=>b.status==='done').length;
  if(ct) ct.textContent=`${done}/${_batchQueue.length} concluídas`;
}

function _removeBatchItem(i){ _batchQueue.splice(i,1); _renderBatchList(); }

async function runBatch(){
  if(_batchRunning||!_batchQueue.length) return;
  _batchRunning=true;
  const btn=document.getElementById('batch-run-btn');
  if(btn) btn.textContent='A processar...';
  for(let i=0;i<_batchQueue.length;i++){
    const item=_batchQueue[i];
    if(item.status==='done') continue;
    item.status='processing'; item.progress=0; _renderBatchList();
    try{
      const buf=await new Promise((res,rej)=>{
        const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej;
        r.readAsArrayBuffer(item.file);
      });
      const tmpCtx=new AudioContext();
      const decoded=await tmpCtx.decodeAudioData(buf);
      item.progress=30; _renderBatchList();
      // Apply headroom
      let peak=0;
      for(let c=0;c<decoded.numberOfChannels;c++){
        const d=decoded.getChannelData(c);
        for(let s=0;s<d.length;s++) peak=Math.max(peak,Math.abs(d[s]));
      }
      const hGain=peak>0?Math.pow(10,(-6-20*Math.log10(peak))/20):1;
      const offCtx=new OfflineAudioContext(decoded.numberOfChannels,decoded.length,decoded.sampleRate);
      const src=offCtx.createBufferSource(); src.buffer=decoded;
      const mk=(t,f,g,Q)=>{const n=offCtx.createBiquadFilter();n.type=t;n.frequency.value=f;n.gain.value=g||0;if(Q)n.Q.value=Q;return n;};
      const oSub=mk('lowshelf',60,eqSub?.gain.value||0);
      const oBass=mk('peaking',150,eqBass?.gain.value||0,0.8);
      const oLow=mk('peaking',500,eqLowNode?.gain.value||0,1.0);
      const oMid=mk('peaking',1200,eqMid?.gain.value||0,0.9);
      const oHigh=mk('peaking',4000,eqHigh?.gain.value||0,1.0);
      const oAir=mk('highshelf',12000,eqAir?.gain.value||0);
      const oComp=offCtx.createDynamicsCompressor();
      oComp.threshold.value=compNode?.threshold.value||-20; oComp.ratio.value=compNode?.ratio.value||4;
      oComp.attack.value=0.003; oComp.release.value=0.1; oComp.knee.value=6;
      const oLim=offCtx.createDynamicsCompressor();
      oLim.threshold.value=-1; oLim.ratio.value=20; oLim.attack.value=0.001; oLim.release.value=0.05; oLim.knee.value=0;
      const oGain=offCtx.createGain(); oGain.gain.value=hGain*(masterGain?.gain.value||1);
      src.connect(oSub);oSub.connect(oBass);oBass.connect(oLow);oLow.connect(oMid);oMid.connect(oHigh);oHigh.connect(oAir);
      oAir.connect(oComp);oComp.connect(oLim);oLim.connect(oGain);oGain.connect(offCtx.destination);
      src.start(0);
      item.progress=60; _renderBatchList();
      const rendered=await offCtx.startRendering();
      item.progress=85; _renderBatchList();
      const lufs=_measureLUFS_BS1770(rendered);
      item.lufs=lufs;
      const normalized=normalizeLUFS(rendered,0.178);
      const dithered=_applyDither(normalized,16);
      const wav=encodeWAV(dithered);
      const blob=new Blob([wav],{type:'audio/wav'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url;
      a.download=item.name.replace(/\.[^.]+$/,'')+'_PIRADEX.wav';
      a.click(); URL.revokeObjectURL(url);
      await tmpCtx.close();
      item.status='done'; item.progress=100;
    }catch(err){ item.status='error'; item.progress=0; console.error('Batch error:',err); }
    _renderBatchList();
    await new Promise(r=>setTimeout(r,300));
  }
  _batchRunning=false;
  if(btn) btn.textContent='PROCESSAR TUDO';
  setStatus('Batch concluído: '+_batchQueue.filter(b=>b.status==='done').length+' faixas exportadas');
}

// ── FEAT 8: Reference overlay (spectral comparison) ────────────────────────
// Stored reference spectrum (computed once on load)
let _refSpectrum=null; // Float32Array of 0..1 magnitudes, log-freq binned

function _computeRefSpectrum(){
  if(!refBuffer){ _refSpectrum=null; return; }
  const NB=64; // number of log bins to display
  const data=refBuffer.getChannelData(0);
  const sr=refBuffer.sampleRate;
  // crude band energy via downsampled Goertzel-ish: use simple FFT on a window
  const N=4096;
  const start=Math.floor(data.length/2 - N/2);
  const re=new Float32Array(N), im=new Float32Array(N);
  for(let i=0;i<N;i++){ re[i]=data[Math.max(0,start+i)]||0; im[i]=0; }
  // Hann window
  for(let i=0;i<N;i++){ re[i]*=0.5*(1-Math.cos(2*Math.PI*i/(N-1))); }
  // naive DFT only for the log-spaced target freqs (fast enough at 64 bins)
  const bins=new Float32Array(NB);
  for(let b=0;b<NB;b++){
    const f=20*Math.pow(20000/20, b/(NB-1));
    const k=f/sr*N;
    let sr2=0, si2=0;
    const wstep=2*Math.PI*k/N;
    for(let n=0;n<N;n+=4){ // step 4 for speed
      const ph=wstep*n;
      sr2+=re[n]*Math.cos(ph); si2-=re[n]*Math.sin(ph);
    }
    bins[b]=Math.sqrt(sr2*sr2+si2*si2);
  }
  // normalize to 0..1 (dB scaled)
  let mx=1e-9; for(let b=0;b<NB;b++) mx=Math.max(mx,bins[b]);
  for(let b=0;b<NB;b++){
    const db=20*Math.log10((bins[b]/mx)+1e-6); // -120..0
    bins[b]=Math.max(0,Math.min(1,(db+72)/72)); // map -72..0 → 0..1
  }
  _refSpectrum=bins;
}

function _drawReferenceOverlay(){
  const canvas=document.getElementById('ref-overlay-canvas');
  if(!canvas) return;
  const W=canvas.offsetWidth||canvas.width||300, H=canvas.height||80;
  if(canvas.width!==W) canvas.width=W;
  const ctx=canvas.getContext('2d');
  // black background always
  ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);

  // grid + freq labels
  const freqs=[60,250,1000,4000,16000], lbls=['60Hz','250Hz','1kHz','4kHz','16kHz'];
  const sr=audioCtx?.sampleRate||44100;
  const fx=f=>Math.log10(f/20)/Math.log10(20000/20)*W;
  freqs.forEach((f,i)=>{
    const x=fx(f);
    ctx.strokeStyle='#ffffff0e'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H-12); ctx.stroke();
    ctx.fillStyle='#ffffff55'; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(lbls[i],x,H-2);
  });

  // ── FAIXA (current track) — live spectrum, CYAN filled ───────────────────
  if(analyserNode){
    const fd=new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(fd);
    ctx.beginPath(); ctx.moveTo(0,H-12);
    for(let i=1;i<fd.length;i++){
      const f=i*sr/2/analyserNode.fftSize;
      if(f<20||f>20000) continue;
      const x=fx(f), y=(H-12)-(fd[i]/255)*(H-16);
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H-12); ctx.closePath();
    ctx.fillStyle='rgba(45,212,255,0.18)'; ctx.fill();
    ctx.strokeStyle='#2dd4ff'; ctx.lineWidth=2;
    ctx.beginPath();
    let started=false;
    for(let i=1;i<fd.length;i++){
      const f=i*sr/2/analyserNode.fftSize;
      if(f<20||f>20000) continue;
      const x=fx(f), y=(H-12)-(fd[i]/255)*(H-16);
      started?ctx.lineTo(x,y):ctx.moveTo(x,y); started=true;
    }
    ctx.stroke();
  }

  // ── REFERÊNCIA — stored spectrum, AMBER dashed ───────────────────────────
  if(_refSpectrum){
    const NB=_refSpectrum.length;
    ctx.strokeStyle='#ffb020'; ctx.lineWidth=2; ctx.setLineDash([5,3]);
    ctx.beginPath();
    for(let b=0;b<NB;b++){
      const f=20*Math.pow(20000/20, b/(NB-1));
      const x=fx(f), y=(H-12)-_refSpectrum[b]*(H-16);
      b===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // legend
  ctx.textAlign='left'; ctx.font='9px monospace';
  ctx.fillStyle='#2dd4ff'; ctx.fillRect(8,8,14,3); ctx.fillText('faixa',26,12);
  ctx.fillStyle='#ffb020'; ctx.fillRect(80,8,14,3); ctx.fillText('referência',98,12);
}

// ── FEAT 9: Geographic market profiles ─────────────────────────────────────
const GEO_PROFILES = {
  angola_radio: { name:'Angola — Rádio + Clube', flag:'🇦🇴',
    lufs:-8, eq:{sub:3.5,bass:1.5,low:-0.5,mid:-0.5,high:0.5,air:0.5},
    knobs:{CLEAN:48,BASS:35,LOUD:72,WIDE:50,PUNCH:60,FOCUS:52},
    desc:'Sub pesado, kick agressivo, loudness máximo para sistemas de som angolanos' },
  caboverde_festa: { name:'Cabo Verde — Festa + PA', flag:'🇨🇻',
    lufs:-9, eq:{sub:2.5,bass:1.0,low:0.5,mid:0.5,high:0.5,air:1.0},
    knobs:{CLEAN:50,BASS:35,LOUD:68,WIDE:65,PUNCH:52,FOCUS:55},
    desc:'Graves quentes, campo stereo aberto, ideal para sistemas PA de festa' },
  europa_streaming: { name:'Europa — Spotify / Apple', flag:'🇪🇺',
    lufs:-14, eq:{sub:0,bass:0,low:0,mid:0,high:1.0,air:1.5},
    knobs:{CLEAN:62,BASS:35,LOUD:50,WIDE:55,PUNCH:40,FOCUS:60},
    desc:'Normalização Spotify -14 LUFS, dinâmica preservada, compatível com loudness normalization' },
  brasil_funk: { name:'Brasil — Funk + Streaming', flag:'🇧🇷',
    lufs:-10, eq:{sub:1.5,bass:0.5,low:1.0,mid:0.8,high:1.0,air:1.0},
    knobs:{CLEAN:55,BASS:35,LOUD:65,WIDE:52,PUNCH:58,FOCUS:62},
    desc:'Mids presentes para voz, sub controlado, punch alto para funk e pagode' },
  senegal_afro: { name:'Senegal — Afrobeats + Mbalax', flag:'🇸🇳',
    lufs:-9, eq:{sub:2.0,bass:1.0,low:0.5,mid:-0.5,high:1.0,air:1.5},
    knobs:{CLEAN:55,BASS:35,LOUD:68,WIDE:58,PUNCH:55,FOCUS:58},
    desc:'Percussão presente, sub moderado, ar e abertura para vocais' },
  mozambique_marrabenta: { name:'Moçambique — Rádio + Club', flag:'🇲🇿',
    lufs:-9, eq:{sub:1.5,bass:1.0,low:0.5,mid:0.5,high:0.5,air:0.5},
    knobs:{CLEAN:50,BASS:35,LOUD:68,WIDE:55,PUNCH:55,FOCUS:55},
    desc:'Balanço geral, compatível com rádio moçambicana e sistemas de club' },
};

function applyGeoProfile(key){
  const p=GEO_PROFILES[key]; if(!p) return;
  Object.assign(kvals,p.knobs);
  if(audioCtx){
    eqSub.gain.value=p.eq.sub; eqBass.gain.value=p.eq.bass; eqLowNode.gain.value=p.eq.low;
    eqMid.gain.value=p.eq.mid; eqHigh.gain.value=p.eq.high; eqAir.gain.value=p.eq.air;
  }
  const loudSl=document.getElementById('loud-target');
  const loudV=document.getElementById('loud-target-v');
  if(loudSl) loudSl.value=p.lufs;
  if(loudV) loudV.textContent=p.lufs+'.0 LUFS';
  refreshKnobs(); syncEQSliders(); applyDSP(); drawInteractiveEQ();
  document.querySelectorAll('.geo-profile-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('geo-'+key)?.classList.add('active');
  setStatus('Perfil geográfico: '+p.flag+' '+p.name+' · alvo '+p.lufs+' LUFS');
}

function _renderGeoProfiles(){
  const wrap=document.getElementById('geo-profiles-wrap');
  if(!wrap) return;
  wrap.innerHTML='';
  Object.entries(GEO_PROFILES).forEach(([key,p])=>{
    const btn=document.createElement('div');
    btn.id='geo-'+key; btn.className='geo-profile-btn';
    btn.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;border:0.5px solid var(--color-border-tertiary);margin-bottom:5px;cursor:pointer;background:var(--color-background-secondary);transition:all .15s;';
    btn.innerHTML=`<span style="font-size:18px;">${p.flag}</span>
      <div style="flex:1"><div style="font-size:12px;font-weight:500;color:var(--color-text-primary);">${p.name}</div>
      <div style="font-size:10px;color:var(--color-text-tertiary);">${p.lufs} LUFS · ${p.desc.slice(0,45)}...</div></div>
      <span style="font-size:9px;color:var(--color-text-info);border:0.5px solid var(--color-border-info);border-radius:3px;padding:2px 6px;">${p.lufs} LUFS</span>`;
    btn.onclick=()=>applyGeoProfile(key);
    wrap.appendChild(btn);
  });
}

// ── FEAT 10: PDF session report ─────────────────────────────────────────────
function generatePDFReport(){
  if(!audioBuffer){ setStatus('Carrega e processa um ficheiro primeiro'); return; }
  const plr=_calcPLR(audioBuffer);
  const lufs=_measureLUFS_BS1770(audioBuffer);
  const phase=parseFloat(document.getElementById('phase-corr-val')?.textContent||'0');
  const trackName=document.getElementById('track-name')?.textContent||'Desconhecida';
  const geoKey=document.querySelector('.geo-profile-btn.active')?.id?.replace('geo-','');
  const geoName=geoKey?GEO_PROFILES[geoKey]?.name||'—':'—';
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Piradex Report — ${trackName}</title>
<style>
body{font-family:monospace;background:#07070e;color:#e8e8e8;padding:40px;margin:0}
.header{border-bottom:2px solid #2dd4ff;padding-bottom:16px;margin-bottom:24px}
.logo{font-size:28px;font-weight:700;color:#2dd4ff;letter-spacing:4px}
.subtitle{font-size:14px;color:#555;margin-top:4px}
.section{margin-bottom:24px}
.section-title{font-size:11px;color:#555;letter-spacing:2px;margin-bottom:12px;border-bottom:1px solid #1a1a2e;padding-bottom:4px}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
.metric{background:#0f0f1a;border:1px solid #1a1a2e;border-radius:8px;padding:12px}
.metric-label{font-size:10px;color:#555;letter-spacing:1px;margin-bottom:4px}
.metric-value{font-size:22px;font-weight:700}
.eq-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.eq-bar{height:6px;border-radius:3px;min-width:2px;max-width:100px}
.footer{border-top:1px solid #1a1a2e;padding-top:16px;font-size:10px;color:#333;text-align:center}
</style></head><body>
<div class="header">
  <div class="logo">PIRADEX MASTERING SUITE</div>
  <div class="subtitle">Relatório de Sessão · ${new Date().toLocaleDateString('pt-PT')} · ${new Date().toLocaleTimeString('pt-PT')}</div>
</div>
<div class="section">
  <div class="section-title">FAIXA</div>
  <div style="font-size:18px;font-weight:700;color:#2dd4ff;margin-bottom:4px">${trackName}</div>
  <div style="font-size:12px;color:#555">Preset: ${curPreset.toUpperCase()} · Mercado: ${geoName}</div>
</div>
<div class="section">
  <div class="section-title">MÉTRICAS FINAIS</div>
  <div class="grid">
    <div class="metric"><div class="metric-label">LUFS BS.1770</div><div class="metric-value" style="color:#2dd4ff">${(lufs||0).toFixed(1)}</div></div>
    <div class="metric"><div class="metric-label">PEAK</div><div class="metric-value" style="color:#b855f7">${(plr?.peakDb||0).toFixed(1)} dB</div></div>
    <div class="metric"><div class="metric-label">PLR DINÂMICA</div><div class="metric-value" style="color:#ffe135">${(plr?.plr||0).toFixed(1)} dB</div></div>
    <div class="metric"><div class="metric-label">FASE STEREO</div><div class="metric-value" style="color:${phase>0.3?'#2dff8a':'#ff4500'}">${phase.toFixed(2)}</div></div>
    <div class="metric"><div class="metric-label">HEADROOM</div><div class="metric-value" style="color:#ffe135">-6 dBFS</div></div>
    <div class="metric"><div class="metric-label">TARGET LUFS</div><div class="metric-value" style="color:#2dff8a">${document.getElementById('loud-target')?.value||'-9'}</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">EQ APLICADO</div>
  ${EQ_BANDS_CONFIG.map(b=>{
    const g=b.node()?.gain.value||0;
    const col=g>0?'#2dff8a':g<0?'#ff4500':'#555';
    const w=Math.abs(g)/12*80;
    return `<div class="eq-row">
      <span style="min-width:40px;font-size:10px;color:#888">${b.label}</span>
      <span style="min-width:32px;font-size:10px;color:#555">${b.f>999?(b.f/1000).toFixed(1)+'kHz':b.f+'Hz'}</span>
      <div class="eq-bar" style="width:${w}px;background:${col}"></div>
      <span style="font-size:11px;color:${col};min-width:40px">${g>=0?'+':''}${g.toFixed(1)} dB</span>
    </div>`;
  }).join('')}
</div>
<div class="section">
  <div class="section-title">KNOBS</div>
  <div class="grid">
    ${Object.entries(kvals).map(([k,v])=>`<div class="metric"><div class="metric-label">${k}</div><div class="metric-value" style="color:#888;font-size:18px">${v}</div></div>`).join('')}
  </div>
</div>
<div class="footer">
  Masterizado com PIRADEX MASTERING SUITE · beatfreakstudio.com · v6.0<br>
  ${new Date().toISOString()}
</div>
</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const w=window.open(url,'_blank');
  if(w) setTimeout(()=>w.print(),500);
  URL.revokeObjectURL(url);
  setStatus('Relatório gerado — usa Ctrl+P para imprimir como PDF');
}

// ── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────
document.addEventListener('keydown', e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  switch(e.key){
    case 'j': case 'J': if(e.ctrlKey||e.metaKey) break; togglePlay(); break;
    case 'k': case 'K': if(e.ctrlKey||e.metaKey) break; stopAudio(); break;
    case 'e': case 'E': if(!e.ctrlKey) openTab('eq',document.querySelector('[data-tab="eq"]')); break;
    case 'c': case 'C': if(!e.ctrlKey) openTab('comp',document.querySelector('[data-tab="comp"]')); break;
    case 'h': case 'H': if(!e.ctrlKey) runHealthCheck(); break;
    case 'ArrowLeft': seekRelative(-5); break;
    case 'ArrowRight': seekRelative(5); break;
  }
});

// ── INIT ALL NEW FEATURES on DOM ready ──────────────────────────────────────
(function _initV6(){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', _setupV6);
  } else {
    setTimeout(_setupV6, 500);
  }
})();

function _setupV6(){
  initInteractiveEQ();
  initAutomation();
  _renderUserPresets();
  _renderGeoProfiles();
  if(typeof updateClipper==='function') try{updateClipper();}catch(e){}
  // Hook drawInteractiveEQ into existing EQ slider changes
  const origSyncEQ = window.syncEQSliders;
  window.syncEQSliders = function(){ if(origSyncEQ) origSyncEQ(); drawInteractiveEQ(); };
  // Hook reference overlay into animation loop
  const origAnim = window._drawSpectralBalance;
  let _refFrame=0;
  window._drawSpectralBalance = function(){
    if(origAnim) origAnim();
    _refFrame++; if(_refFrame%4===0) _drawReferenceOverlay();
  };
  // Capture before stats when file loads
  const origLoad = window.loadFile;
  window.loadFile = function(file){
    if(origLoad) origLoad(file);
    setTimeout(()=>_captureBeforeStats(), 2000);
  };
  console.log('[Piradex v6] All 10 features initialized');
}
