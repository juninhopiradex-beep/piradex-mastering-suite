// ===== PIRADEX MASTERING SUITE — app.js (Full Real-Time Engine) =====

const PRESETS = {
  kizomba:  { name:'KIZOMBA',  desc:'Graves quentes, mids suaves, loudness moderado — sensualidade e groove',
    knobs:{CLEAN:20,BASS:72,LOUD:58,WIDE:38,PUNCH:45,FOCUS:30},
    sugs:[['Warm low-end @ 80Hz','+2.1 dB','c2'],['Mid harshness reduced','-1.8 dB','c3'],['Stereo warmth','+10%','c5']] },
  kuduro:   { name:'KUDURO',   desc:'Kick agressivo, muito punch, loudness alto — energia máxima de dança',
    knobs:{CLEAN:10,BASS:85,LOUD:88,WIDE:30,PUNCH:92,FOCUS:70},
    sugs:[['Sub kick boosted @ 60Hz','+3.5 dB','c2'],['High attack enhanced','+2.1 dB','c3'],['Punch maximised','+28%','c7']] },
  zouk:     { name:'ZOUK',     desc:'Graves profundos, amplitude sonora romântica, loudness controlado',
    knobs:{CLEAN:35,BASS:65,LOUD:52,WIDE:68,PUNCH:40,FOCUS:25},
    sugs:[['Deep bass @ 70Hz','+1.8 dB','c2'],['High freq air added','+1.2 dB','c3'],['Wide stereo field','+22%','c5']] },
  gzouk:    { name:'GZOUK',    desc:'Fusão Zouk+Ghetto — mais punch e groove urbano mantendo a fluidez',
    knobs:{CLEAN:22,BASS:75,LOUD:70,WIDE:55,PUNCH:65,FOCUS:48},
    sugs:[['Sub bass @ 55Hz','+2.8 dB','c2'],['Mid groove enhanced','+1.0 dB','c3'],['Urban width','+16%','c6']] },
  semba:    { name:'SEMBA',    desc:'Ritmo vivo, médios presentes, dinâmica preservada — alma angolana',
    knobs:{CLEAN:45,BASS:55,LOUD:50,WIDE:42,PUNCH:60,FOCUS:55},
    sugs:[['Mid presence @ 1.2kHz','+1.5 dB','c2'],['Dynamic range kept','-0.8 dB','c3'],['Natural width','+8%','c5']] },
  afrohouse:{ name:'AFRO-HOUSE',desc:'Sub profundo, percussão afiada, amplitude para o dancefloor',
    knobs:{CLEAN:15,BASS:80,LOUD:82,WIDE:60,PUNCH:78,FOCUS:65},
    sugs:[['Sub bass @ 45Hz','+3.2 dB','c2'],['Percussion clarity','+1.6 dB','c3'],['Club width','+25%','c5']] },
  rnb:      { name:'R&B',      desc:'Voz no topo, graves suaves, produção polida e cinematográfica',
    knobs:{CLEAN:55,BASS:62,LOUD:60,WIDE:52,PUNCH:42,FOCUS:72},
    sugs:[['Vocal presence @ 3kHz','+1.4 dB','c2'],['Low-end smoothed','-1.0 dB','c3'],['Silky stereo','+14%','c5']] },
  afrobeats:{ name:'AFROBEATS', desc:'Groove afro, percussão colorida, loudness radiofónico',
    knobs:{CLEAN:25,BASS:70,LOUD:75,WIDE:58,PUNCH:68,FOCUS:60},
    sugs:[['Afro kick @ 80Hz','+2.6 dB','c2'],['Rhythm mid boost','+1.2 dB','c3'],['Bright stereo','+18%','c5']] }
};

const KNOBS_DEF   = ['CLEAN','BASS','LOUD','WIDE','PUNCH','FOCUS'];
const KNOB_COLORS = { CLEAN:'#2dd4ff',BASS:'#b855f7',LOUD:'#ff3ab5',WIDE:'#2dff8a',PUNCH:'#ff6b35',FOCUS:'#ffe135' };

let kvals     = { CLEAN:20,BASS:72,LOUD:58,WIDE:38,PUNCH:45,FOCUS:30 };
let piradexOn = false, bypassOn = false, curPreset = 'kizomba';
let playMode  = 'before';

// Audio nodes
let audioCtx    = null;
let audioBuffer = null;
let sourceNode  = null;
let analyserNode = null;
let analyserDry  = null;
let eqSub,eqBass,eqLow,eqMid,eqHigh,eqAir;
let compNode,limiterNode,masterGain;

let isPlaying   = false;
let pauseOffset = 0;
let startTime   = 0;
let animId      = null;
let animProgress;

// ===== INIT AUDIO =====
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  buildChain();
}

function buildChain() {
  eqSub  = mkFilter('lowshelf', 60,    0,   0);
  eqBass = mkFilter('peaking',  150,   0, 0.8);
  eqLow  = mkFilter('peaking',  300,   0, 1.0);
  eqMid  = mkFilter('peaking',  1200,  0, 0.9);
  eqHigh = mkFilter('peaking',  4000,  0, 1.0);
  eqAir  = mkFilter('highshelf',12000, 0,   0);

  compNode = audioCtx.createDynamicsCompressor();
  compNode.attack.value = 0.01; compNode.release.value = 0.15; compNode.knee.value = 6;

  limiterNode = audioCtx.createDynamicsCompressor();
  limiterNode.threshold.value = -1; limiterNode.ratio.value = 20;
  limiterNode.attack.value = 0.001; limiterNode.release.value = 0.05; limiterNode.knee.value = 0;

  masterGain = audioCtx.createGain(); masterGain.gain.value = 1.0;

  // Analyser on the WET (processed) signal
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2048;
  analyserNode.smoothingTimeConstant = 0.8;

  // Chain: EQ→Comp→Limiter→MasterGain→Analyser→Out
  eqSub.connect(eqBass); eqBass.connect(eqLow); eqLow.connect(eqMid);
  eqMid.connect(eqHigh); eqHigh.connect(eqAir); eqAir.connect(compNode);
  compNode.connect(limiterNode); limiterNode.connect(masterGain);
  masterGain.connect(analyserNode); analyserNode.connect(audioCtx.destination);

  // Dry analyser (for BEFORE mode)
  analyserDry = audioCtx.createAnalyser();
  analyserDry.fftSize = 2048;
  analyserDry.smoothingTimeConstant = 0.8;
}

function mkFilter(type, freq, gain, Q) {
  const f = audioCtx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.gain.value = gain;
  if (Q) f.Q.value = Q;
  return f;
}

// ===== DSP APPLY =====
function applyDSP() {
  if (!audioCtx) return;
  const bass=kvals.BASS, clean=kvals.CLEAN, loud=kvals.LOUD, punch=kvals.PUNCH, focus=kvals.FOCUS;

  if (bypassOn) {
    [eqSub,eqBass,eqLow,eqMid,eqHigh,eqAir].forEach(f=>f.gain.value=0);
    compNode.threshold.value=0; compNode.ratio.value=1;
    masterGain.gain.setTargetAtTime(0.8, audioCtx.currentTime, 0.05);
    return;
  }

  eqSub.gain.value  = (bass -30)*0.20;
  eqBass.gain.value = (bass -40)*0.15;
  eqLow.gain.value  = (bass -50)*0.08;
  eqMid.gain.value  = (focus-50)*0.14;
  eqHigh.gain.value = (clean-50)*0.10;
  eqAir.gain.value  = (clean-30)*0.12;

  compNode.threshold.value = -50+(punch*0.36);
  compNode.ratio.value     = 1.5+(punch*0.15);
  compNode.attack.value    = Math.max(0.001, 0.03-(punch*0.0002));
  compNode.release.value   = Math.max(0.05,  0.3 -(punch*0.002));

  if (piradexOn) {
    compNode.threshold.value = -20;
    compNode.ratio.value     = 16;
    compNode.attack.value    = 0.001;
    eqSub.gain.value  += 8;
    eqBass.gain.value += 5;
    eqAir.gain.value  += 4;
    masterGain.gain.setTargetAtTime(2.4, audioCtx.currentTime, 0.05);
  } else {
    const g = 0.35 + (loud/100)*1.4;
    masterGain.gain.setTargetAtTime(g, audioCtx.currentTime, 0.05);
  }
  updateLUFSDisplay();
}

// ===== FILE LOAD =====
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
}
document.getElementById('sf').addEventListener('change', function(){ if(this.files[0]) loadFile(this.files[0]); });

function loadFile(file) {
  initAudio();
  stopAudio();
  setStatus('A carregar ficheiro...');
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      audioBuffer = await audioCtx.decodeAudioData(e.target.result.slice(0));
      const dur = audioBuffer.duration;
      document.getElementById('track-name').textContent = file.name.replace(/\.[^.]+$/,'');
      document.getElementById('track-dur').textContent  = fmtTime(dur);
      document.getElementById('time-total').textContent = fmtTime(dur);
      document.getElementById('waveform-wrap').style.display = 'flex';
      document.getElementById('drop-zone').style.display     = 'none';
      document.getElementById('export-btn').style.display    = 'flex';
      drawWaveform();
      applyDSP();
      setStatus('Pronto — BEFORE = original · AFTER = masterizado em tempo real');
    } catch(err) { setStatus('Erro: ' + err.message); }
  };
  reader.readAsArrayBuffer(file);
}

// ===== WAVEFORM =====
function drawWaveform() {
  if (!audioBuffer) return;
  const canvas = document.getElementById('waveform-canvas');
  const W = canvas.width  = canvas.offsetWidth || 600;
  const H = canvas.height = 64;
  const ctx2 = canvas.getContext('2d');
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / W);
  const cols = ['#ff3ab5','#b855f7','#2dd4ff','#2dff8a'];
  ctx2.clearRect(0,0,W,H);
  for (let i=0;i<W;i++) {
    let max=0;
    for (let j=0;j<step;j++){const v=Math.abs(data[i*step+j]||0);if(v>max)max=v;}
    const h=max*(H-4), ci=Math.floor((i/W)*cols.length);
    const g=ctx2.createLinearGradient(0,H/2-h/2,0,H/2+h/2);
    g.addColorStop(0,cols[ci]+'cc'); g.addColorStop(1,cols[ci]+'33');
    ctx2.fillStyle=g; ctx2.fillRect(i,H/2-h/2,1,h);
  }
  document.getElementById('waveform-container').onclick = (e) => {
    if (!audioBuffer) return;
    const rect = document.getElementById('waveform-container').getBoundingClientRect();
    seekTo(((e.clientX-rect.left)/rect.width)*audioBuffer.duration);
  };
}

// ===== PLAYBACK =====
function togglePlay() { if(!audioBuffer) return; isPlaying ? pauseAudio() : playAudio(); }

function playAudio() {
  if (!audioCtx||!audioBuffer) return;
  if (audioCtx.state==='suspended') audioCtx.resume();
  stopSource();
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  if (playMode==='after') {
    applyDSP();
    sourceNode.connect(eqSub);
  } else {
    // DRY path: source → dryGain → analyserDry → destination
    const dg = audioCtx.createGain(); dg.gain.value = 0.85;
    sourceNode.connect(dg);
    dg.connect(analyserDry);
    analyserDry.connect(audioCtx.destination);
  }

  sourceNode.onended = () => {
    if (isPlaying) { isPlaying=false; pauseOffset=0; updatePlayBtn(); stopProgress(); }
  };
  const offset = Math.min(pauseOffset, audioBuffer.duration-0.01);
  sourceNode.start(0, offset);
  startTime = audioCtx.currentTime - offset;
  isPlaying = true;
  updatePlayBtn();
  startProgress();
  startRealTimeAnim();
}

function pauseAudio() {
  pauseOffset = audioCtx.currentTime - startTime;
  stopSource(); isPlaying=false; updatePlayBtn(); stopProgress(); stopRealTimeAnim();
}

function stopAudio() {
  stopSource(); isPlaying=false; pauseOffset=0;
  updatePlayBtn(); stopProgress(); setProgress(0);
  document.getElementById('time-cur').textContent='0:00';
  stopRealTimeAnim();
}

function stopSource() { if(sourceNode){try{sourceNode.stop();}catch(e){}sourceNode=null;} }

function seekTo(t) {
  const was=isPlaying; stopSource(); isPlaying=false;
  pauseOffset=Math.max(0,Math.min(t,audioBuffer.duration-0.01));
  if(was) playAudio(); else setProgress(pauseOffset/audioBuffer.duration);
}
function seekRelative(d) { if(!audioBuffer) return; seekTo((isPlaying?audioCtx.currentTime-startTime:pauseOffset)+d); }

function setVolume(v) {
  if(masterGain) masterGain.gain.setTargetAtTime(v/100*1.5, audioCtx.currentTime, 0.05);
  document.getElementById('vol-val').textContent=v+'%';
}

function updatePlayBtn() {
  document.getElementById('play-icon').className = isPlaying ? 'ti ti-player-pause' : 'ti ti-player-play';
}

function startProgress() {
  stopProgress();
  animProgress = setInterval(()=>{
    if(!isPlaying||!audioBuffer) return;
    const cur = audioCtx.currentTime - startTime;
    setProgress(Math.min(cur/audioBuffer.duration,1));
    document.getElementById('time-cur').textContent = fmtTime(cur);
  }, 80);
}
function stopProgress() { clearInterval(animProgress); }
function setProgress(p) {
  const pct=Math.min(p*100,100);
  document.getElementById('waveform-progress').style.width = pct+'%';
  document.getElementById('waveform-cursor').style.left    = pct+'%';
}
function fmtTime(s) { return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }

// ===== BEFORE / AFTER =====
function setMode(mode) {
  playMode=mode;
  const was=isPlaying;
  if(was){pauseOffset=audioCtx.currentTime-startTime;stopSource();isPlaying=false;stopRealTimeAnim();}
  setModeUI(mode);
  if(was) playAudio();
}
function setModeUI(mode) {
  document.getElementById('btn-before').classList.toggle('active',mode==='before');
  document.getElementById('btn-after').classList.toggle('active', mode==='after');
  const dot=document.getElementById('mode-dot'), txt=document.getElementById('mode-txt');
  if(mode==='before'){dot.className='mode-dot before';txt.textContent='A OUVIR: ORIGINAL — sem qualquer processamento';}
  else               {dot.className='mode-dot after'; txt.textContent='A OUVIR: MASTERIZADO — '+(PRESETS[curPreset]?.name||'')+' · Alvo -9 LUFS';}
  updateLUFSDisplay();
}

// ===== REAL-TIME SPECTRUM + LUFS FROM ANALYSER =====
const SPEC_COLORS = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];

function startRealTimeAnim() { if(!animId) animLoop(); }
function stopRealTimeAnim()  { if(animId){cancelAnimationFrame(animId);animId=null;} }

let vuL=0.3, vuR=0.3, lufsSmooth=-14;

function animLoop() {
  animId = requestAnimationFrame(animLoop);
  drawSpectrum();
  updateVUandLUFS();
}

function getActiveAnalyser() {
  return (playMode==='after') ? analyserNode : analyserDry;
}

function drawSpectrum() {
  const canvas = document.getElementById('spec');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth||300;
  const H = canvas.height = canvas.offsetHeight||160;
  ctx.clearRect(0,0,W,H);

  const analyser = getActiveAnalyser();
  if (!analyser || !isPlaying) {
    // idle animation when not playing
    drawIdleSpectrum(ctx, W, H);
    return;
  }

  const bufLen = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bufLen);
  analyser.getByteFrequencyData(freqData);

  const N   = 52;
  const bw  = (W/N) - 1;
  // Map frequency bins to N bars (logarithmic-ish)
  for (let i=0;i<N;i++) {
    const start = Math.floor(Math.pow(i/N, 1.5) * bufLen);
    const end   = Math.floor(Math.pow((i+1)/N, 1.5) * bufLen);
    let sum=0, cnt=0;
    for(let j=start;j<end;j++){sum+=freqData[j];cnt++;}
    const avg = cnt>0 ? sum/cnt : 0;
    const v   = avg/255;
    const h   = Math.max(2, v * (H-4));
    const x   = i*(bw+1)+1;
    const ci  = Math.floor(i/N*(SPEC_COLORS.length-1));
    const grad = ctx.createLinearGradient(0,H-h,0,H);
    grad.addColorStop(0,SPEC_COLORS[ci]+'ee');
    grad.addColorStop(1,SPEC_COLORS[ci]+'22');
    ctx.fillStyle=grad;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x,H-h,bw,h,2); else ctx.rect(x,H-h,bw,h);
    ctx.fill();
  }
}

let idlePhase=0;
function drawIdleSpectrum(ctx,W,H) {
  idlePhase+=0.03;
  const N=52, bw=(W/N)-1;
  for(let i=0;i<N;i++){
    const v=0.04+0.06*Math.sin(i*0.3+idlePhase)+0.03*Math.sin(i*0.7-idlePhase*1.3);
    const h=Math.max(2,v*(H-4)), x=i*(bw+1)+1;
    const ci=Math.floor(i/N*(SPEC_COLORS.length-1));
    const grad=ctx.createLinearGradient(0,H-h,0,H);
    grad.addColorStop(0,SPEC_COLORS[ci]+'66');
    grad.addColorStop(1,SPEC_COLORS[ci]+'11');
    ctx.fillStyle=grad;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x,H-h,bw,h,2); else ctx.rect(x,H-h,bw,h);
    ctx.fill();
  }
}

function updateVUandLUFS() {
  const analyser = getActiveAnalyser();
  if (!analyser || !isPlaying) {
    vuL=Math.max(0.02,vuL*0.92); vuR=Math.max(0.02,vuR*0.92);
    setVU(vuL,vuR); return;
  }

  const timeDomain = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(timeDomain);

  let sumL=0, sumR=0;
  const half = Math.floor(timeDomain.length/2);
  for(let i=0;i<half;i++)  { sumL+=timeDomain[i]*timeDomain[i]; }
  for(let i=half;i<timeDomain.length;i++) { sumR+=timeDomain[i]*timeDomain[i]; }
  const rmsL = Math.sqrt(sumL/half);
  const rmsR = Math.sqrt(sumR/half);

  vuL = vuL*0.7 + rmsL*2.5*0.3;
  vuR = vuR*0.7 + rmsR*2.5*0.3;

  if(piradexOn){vuL=Math.min(1,vuL*1.4);vuR=Math.min(1,vuR*1.4);}
  setVU(Math.min(vuL,1), Math.min(vuR,1));

  // LUFS approximation from RMS
  const rms = (rmsL+rmsR)/2;
  const lufsRaw = rms>0 ? 20*Math.log10(rms)-0.691 : -70;
  lufsSmooth = lufsSmooth*0.92 + lufsRaw*0.08;
  const display = playMode==='after' ? Math.max(-9, Math.min(-6, lufsSmooth)).toFixed(1) : lufsSmooth.toFixed(1);
  document.getElementById('lufs-n').textContent = display;
  document.getElementById('slufs').textContent  = display+' LUFS';
}

function setVU(l,r) {
  document.getElementById('vu-l').style.height = Math.max(2,l*96)+'%';
  document.getElementById('vu-r').style.height = Math.max(2,r*96)+'%';
}

function updateLUFSDisplay() {
  const v = playMode==='after'?'-9.0':(-23+kvals.LOUD*0.17).toFixed(1);
  if(!isPlaying){ document.getElementById('lufs-n').textContent=v; document.getElementById('slufs').textContent=v+' LUFS'; }
}

// ===== PIRADEX MODE (with Claude AI) =====
async function togglePiradex() {
  piradexOn = !piradexOn;
  const btn = document.getElementById('pira-btn');

  if (piradexOn) {
    btn.classList.add('on');
    btn.innerHTML = '⚡ PIRADEX MODE ATIVO ⚡';
    showPiradexModal();
  } else {
    btn.classList.remove('on');
    btn.innerHTML = '⚡ MASTERING PIRADEX ⚡';
    closePiradexModal();
    setStatus('Piradex desactivado');
    setPreset(curPreset, document.querySelector('.preset-chip.active'));
  }
  applyDSP();
}

function showPiradexModal() {
  document.getElementById('piradex-modal').style.display = 'flex';
  if (audioBuffer) {
    runPiradexAI();
  } else {
    document.getElementById('piradex-ai-msg').innerHTML =
      '<span style="color:var(--muted2)">Carrega uma música para a IA analisar e masterizar automaticamente.</span>';
  }
}

function closePiradexModal() {
  document.getElementById('piradex-modal').style.display = 'none';
}

async function runPiradexAI() {
  const msg = document.getElementById('piradex-ai-msg');
  msg.innerHTML = '<span class="ai-loading">🤖 IA a analisar a tua música...</span>';

  // Gather audio stats for AI
  const data    = audioBuffer.getChannelData(0);
  const sr      = audioBuffer.sampleRate;
  const dur     = audioBuffer.duration;
  const step    = Math.ceil(data.length/200);
  let sumSq=0, peak=0, zeros=0;
  for(let i=0;i<data.length;i+=step){
    const v=Math.abs(data[i]);
    sumSq+=v*v; if(v>peak)peak=v; if(v<0.001)zeros++;
  }
  const rms   = Math.sqrt(sumSq/(data.length/step));
  const lufsEst = rms>0 ? (20*Math.log10(rms)-0.691).toFixed(1) : '-inf';
  const dynRange = peak>0 ? (20*Math.log10(peak/rms)).toFixed(1) : '0';
  const preset  = PRESETS[curPreset];

  const prompt = `És um engenheiro de masterização de áudio profissional especializado em música africana e urbana. 
  
Analisa este ficheiro de áudio e fornece recomendações de masterização:

- Género/Preset seleccionado: ${preset.name}
- Duração: ${dur.toFixed(1)}s
- RMS estimado: ${lufsEst} LUFS
- Pico: ${(20*Math.log10(peak)).toFixed(1)} dBFS
- Range Dinâmico: ${dynRange} dB
- Knobs actuais: BASS=${kvals.BASS} CLEAN=${kvals.CLEAN} LOUD=${kvals.LOUD} WIDE=${kvals.WIDE} PUNCH=${kvals.PUNCH} FOCUS=${kvals.FOCUS}

Responde em português com:
1. **Análise rápida** do estado do áudio (2 linhas)
2. **Ajustes recomendados** para ${preset.name} com output a -9 LUFS (lista de 4-5 ajustes específicos com valores)
3. **Configuração óptima dos knobs** (dá valores 0-100 para cada: BASS, CLEAN, LOUD, WIDE, PUNCH, FOCUS)
4. **Aviso** se o áudio tem problemas (clipping, demasiado comprimido, etc)

Formato resposta para o ponto 3 EXACTAMENTE assim (para poder ser lido pelo sistema):
KNOBS: BASS=XX CLEAN=XX LOUD=XX WIDE=XX PUNCH=XX FOCUS=XX`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data2 = await res.json();
    const text  = data2.content?.filter(b=>b.type==='text').map(b=>b.text).join('') || 'Sem resposta.';

    // Parse knob values from AI response
    const knobMatch = text.match(/KNOBS:\s*BASS=(\d+)\s+CLEAN=(\d+)\s+LOUD=(\d+)\s+WIDE=(\d+)\s+PUNCH=(\d+)\s+FOCUS=(\d+)/i);
    if (knobMatch) {
      kvals.BASS  = parseInt(knobMatch[1]);
      kvals.CLEAN = parseInt(knobMatch[2]);
      kvals.LOUD  = parseInt(knobMatch[3]);
      kvals.WIDE  = parseInt(knobMatch[4]);
      kvals.PUNCH = parseInt(knobMatch[5]);
      kvals.FOCUS = parseInt(knobMatch[6]);
      refreshKnobs();
      applyDSP();
    }

    // Format and display AI response (hide the KNOBS: line)
    const cleanText = text.replace(/KNOBS:.*$/m,'').trim();
    const html = cleanText
      .replace(/\*\*(.*?)\*\*/g,'<strong style="color:var(--c1)">$1</strong>')
      .replace(/\n/g,'<br>');

    msg.innerHTML = html;
    if (knobMatch) {
      msg.innerHTML += `<div class="ai-applied">✓ Knobs ajustados automaticamente pela IA · Clica AFTER para ouvir</div>`;
    }
    setStatus('🤖 PIRADEX IA: masterização analisada e aplicada');

  } catch(err) {
    msg.innerHTML = `<span style="color:var(--c7)">Erro ao conectar com a IA: ${err.message}</span>`;
    // Apply piradex turbo anyway
    KNOBS_DEF.forEach((n,i)=>{kvals[n]=Math.min(100,kvals[n]+18+Math.random()*12);drawKnob(i,n);});
    applyDSP();
  }
}

// ===== EXPORT =====
async function exportMastered() {
  if (!audioBuffer) { setStatus('Carrega um ficheiro primeiro'); return; }
  const btn = document.getElementById('export-btn');
  btn.style.opacity='0.5'; btn.style.pointerEvents='none';
  setStatus('A renderizar e exportar...');
  try {
    const nCh=audioBuffer.numberOfChannels, sr=audioBuffer.sampleRate, len=audioBuffer.length;
    const offCtx = new OfflineAudioContext(nCh, len, sr);

    const oSub  = mkOffFilter(offCtx,'lowshelf', 60,   eqSub.gain.value,  0);
    const oBass = mkOffFilter(offCtx,'peaking',  150,  eqBass.gain.value, 0.8);
    const oLow  = mkOffFilter(offCtx,'peaking',  300,  eqLow.gain.value,  1.0);
    const oMid  = mkOffFilter(offCtx,'peaking',  1200, eqMid.gain.value,  0.9);
    const oHigh = mkOffFilter(offCtx,'peaking',  4000, eqHigh.gain.value, 1.0);
    const oAir  = mkOffFilter(offCtx,'highshelf',12000,eqAir.gain.value,  0);
    const oComp = offCtx.createDynamicsCompressor();
    oComp.threshold.value=compNode.threshold.value; oComp.ratio.value=compNode.ratio.value;
    oComp.attack.value=compNode.attack.value; oComp.release.value=compNode.release.value; oComp.knee.value=6;
    const oLim = offCtx.createDynamicsCompressor();
    oLim.threshold.value=-1; oLim.ratio.value=20; oLim.attack.value=0.001; oLim.release.value=0.05; oLim.knee.value=0;
    const oGain = offCtx.createGain(); oGain.gain.value = masterGain.gain.value;

    oSub.connect(oBass); oBass.connect(oLow); oLow.connect(oMid);
    oMid.connect(oHigh); oHigh.connect(oAir); oAir.connect(oComp);
    oComp.connect(oLim); oLim.connect(oGain); oGain.connect(offCtx.destination);

    const src = offCtx.createBufferSource();
    src.buffer = audioBuffer; src.connect(oSub); src.start(0);

    const rendered = await offCtx.startRendering();
    const normalized = normalizeTo9LUFS(rendered);
    const wav  = encodeWAV(normalized);
    const blob = new Blob([wav],{type:'audio/wav'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url;
    a.download=(document.getElementById('track-name').textContent||'audio')+'_PIRADEX_MASTERED.wav';
    a.click(); URL.revokeObjectURL(url);
    setStatus('✓ Exportado: '+a.download+' · -9 LUFS normalizado');
  } catch(err){ setStatus('Erro na exportação: '+err.message); }
  btn.style.opacity='1'; btn.style.pointerEvents='auto';
}

function mkOffFilter(ctx,type,freq,gain,Q){
  const f=ctx.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.gain.value=gain; if(Q) f.Q.value=Q; return f;
}

function normalizeTo9LUFS(buffer) {
  const nCh=buffer.numberOfChannels, len=buffer.length;
  let sumSq=0,cnt=0;
  for(let c=0;c<nCh;c++){const d=buffer.getChannelData(c);for(let i=0;i<len;i++){sumSq+=d[i]*d[i];cnt++;}}
  const rms=Math.sqrt(sumSq/cnt);
  const targetRMS=0.178; // ≈ -9 LUFS
  const gainN=rms>0?Math.min(targetRMS/rms,6):1;
  const newBuf=new AudioBuffer({numberOfChannels:nCh,length:len,sampleRate:buffer.sampleRate});
  for(let c=0;c<nCh;c++){
    const src=buffer.getChannelData(c),dst=newBuf.getChannelData(c);
    for(let i=0;i<len;i++) dst[i]=Math.max(-0.99,Math.min(0.99,src[i]*gainN));
  }
  return newBuf;
}

function encodeWAV(buffer) {
  const nCh=buffer.numberOfChannels,sr=buffer.sampleRate,len=buffer.length;
  const ab=new ArrayBuffer(44+len*nCh*2),view=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');view.setUint32(4,36+len*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,nCh,true);
  view.setUint32(24,sr,true);view.setUint32(28,sr*nCh*2,true);
  view.setUint16(32,nCh*2,true);view.setUint16(34,16,true);
  ws(36,'data');view.setUint32(40,len*nCh*2,true);
  let off=44;
  for(let i=0;i<len;i++) for(let c=0;c<nCh;c++){
    view.setInt16(off,Math.max(-32768,Math.min(32767,buffer.getChannelData(c)[i]*32767)),true);off+=2;
  }
  return ab;
}

// ===== KNOBS =====
function toRad(d){return d*Math.PI/180;}
function descArc(cx,cy,r,s,e){
  const sr=toRad(s),er=toRad(e);
  return `M${cx+r*Math.cos(sr)},${cy+r*Math.sin(sr)} A${r},${r},0,${e-s>180?1:0},1,${cx+r*Math.cos(er)},${cy+r*Math.sin(er)}`;
}
function buildKnobs(){
  const row=document.getElementById('knobs-row'); row.innerHTML='';
  KNOBS_DEF.forEach((name,i)=>{
    const div=document.createElement('div'); div.className='ki';
    div.innerHTML=`<svg class="ks" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="20" fill="#141418" stroke="#ffffff0e" stroke-width="2.5"/>
      <path id="ka-${i}" fill="none" stroke="${KNOB_COLORS[name]}" stroke-width="4" stroke-linecap="round"/>
      <text x="26" y="31" text-anchor="middle" font-family="Orbitron" font-size="12" font-weight="700" fill="${KNOB_COLORS[name]}" id="kt-${i}">${Math.round(kvals[name])}</text>
    </svg><div class="kname">${name}</div>`;
    div.addEventListener('mousedown',e=>startDrag(e,name));
    div.addEventListener('touchstart',e=>startDrag(e,name),{passive:true});
    row.appendChild(div); drawKnob(i,name);
  });
}
function drawKnob(i,name){
  const arc=document.getElementById(`ka-${i}`),txt=document.getElementById(`kt-${i}`);
  if(arc) arc.setAttribute('d',descArc(26,26,20,135,135+(kvals[name]/100)*270));
  if(txt) txt.textContent=Math.round(kvals[name]);
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
  if(!dragName) return;
  kvals[dragName]=Math.max(0,Math.min(100,dragSV+(dragSY-(e.touches?e.touches[0].clientY:e.clientY))*0.9));
  drawKnob(KNOBS_DEF.indexOf(dragName),dragName);
  if(playMode==='after') applyDSP();
}
function stopDrag(){dragName='';document.removeEventListener('mousemove',onDrag);document.removeEventListener('mouseup',stopDrag);}

// ===== PRESETS =====
function setPreset(key,el){
  curPreset=key; const p=PRESETS[key];
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('hdr-preset').textContent=p.name;
  document.getElementById('pi-name').textContent=p.name;
  document.getElementById('pi-desc').textContent=p.desc;
  Object.assign(kvals,p.knobs); refreshKnobs(); updateSugs(p.sugs); applyDSP();
  setStatus('Preset: '+p.name+' · '+p.desc.split(',')[0]);
  if(playMode==='after') setModeUI('after');
}
function updateSugs(sugs){
  sugs.forEach((s,i)=>{
    const t=document.getElementById(`s${i+1}t`),v=document.getElementById(`s${i+1}v`);
    if(t)t.textContent=s[0]; if(v){v.textContent=s[1];v.className=`sval ${s[2]}`;}
  });
}

function doRemaster(){ applyDSP(); setStatus('✓ RE-MASTER aplicado — clica AFTER para ouvir'); }

function toggleBypass(){
  bypassOn=!bypassOn;
  document.getElementById('bypass-btn').classList.toggle('on',bypassOn);
  applyDSP(); setStatus(bypassOn?'Bypass ativo':'Bypass desligado');
}

function setStatus(msg){document.getElementById('stxt').textContent=msg.toUpperCase();}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',function(){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));this.classList.add('active');
}));

// ===== IDLE SPECTRUM LOOP =====
function idleLoop(){
  if(!isPlaying){
    const canvas=document.getElementById('spec');
    if(canvas){const ctx=canvas.getContext('2d');const W=canvas.width=canvas.offsetWidth||300;const H=canvas.height=canvas.offsetHeight||160;ctx.clearRect(0,0,W,H);drawIdleSpectrum(ctx,W,H);}
  }
  requestAnimationFrame(idleLoop);
}

// ===== INIT =====
buildKnobs();
updateLUFSDisplay();
idleLoop();
