// ===== PIRADEX MASTERING SUITE — app.js =====

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
  afrohouse: { name:'AFRO-HOUSE', desc:'Sub profundo, percussão afiada, amplitude para o dancefloor',
    knobs:{CLEAN:15,BASS:80,LOUD:82,WIDE:60,PUNCH:78,FOCUS:65},
    sugs:[['Sub bass @ 45Hz','+3.2 dB','c2'],['Percussion clarity','+1.6 dB','c3'],['Club width','+25%','c5']] },
  rnb:      { name:'R&B',      desc:'Voz no topo, graves suaves, produção polida e cinematográfica',
    knobs:{CLEAN:55,BASS:62,LOUD:60,WIDE:52,PUNCH:42,FOCUS:72},
    sugs:[['Vocal presence @ 3kHz','+1.4 dB','c2'],['Low-end smoothed','-1.0 dB','c3'],['Silky stereo','+14%','c5']] },
  afrobeats: { name:'AFROBEATS', desc:'Groove afro, percussão colorida, loudness radiofónico',
    knobs:{CLEAN:25,BASS:70,LOUD:75,WIDE:58,PUNCH:68,FOCUS:60},
    sugs:[['Afro kick @ 80Hz','+2.6 dB','c2'],['Rhythm mid boost','+1.2 dB','c3'],['Bright stereo','+18%','c5']] }
};

const KNOBS_DEF   = ['CLEAN','BASS','LOUD','WIDE','PUNCH','FOCUS'];
const KNOB_COLORS = { CLEAN:'#2dd4ff', BASS:'#b855f7', LOUD:'#ff3ab5', WIDE:'#2dff8a', PUNCH:'#ff6b35', FOCUS:'#ffe135' };

let kvals      = { CLEAN:20, BASS:72, LOUD:58, WIDE:38, PUNCH:45, FOCUS:30 };
let piradexOn  = false;
let bypassOn   = false;
let vuPhase    = 0;
let curPreset  = 'kizomba';
let specData   = new Array(52).fill(0).map(() => 0.1 + Math.random() * 0.3);
let specTarget = specData.slice();

// ===== AUDIO ENGINE =====
let audioCtx, audioBuffer, gainNode, compNode, eqLow, eqMid, eqHigh;
let sourceNode = null;
let isPlaying  = false;
let pauseOffset = 0;
let startTime  = 0;
let playMode   = 'before'; // 'before' | 'after'
let waveformData = null;
let animProgress;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  eqLow  = audioCtx.createBiquadFilter(); eqLow.type  = 'lowshelf';  eqLow.frequency.value  = 200;
  eqMid  = audioCtx.createBiquadFilter(); eqMid.type  = 'peaking';   eqMid.frequency.value  = 1000; eqMid.Q.value = 0.8;
  eqHigh = audioCtx.createBiquadFilter(); eqHigh.type = 'highshelf'; eqHigh.frequency.value = 8000;
  compNode = audioCtx.createDynamicsCompressor();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.8;
  eqLow.connect(eqMid); eqMid.connect(eqHigh); eqHigh.connect(compNode); compNode.connect(gainNode); gainNode.connect(audioCtx.destination);
}

function applyAudioChain() {
  const p = PRESETS[curPreset];
  const loud = kvals.LOUD;
  eqLow.gain.value  = (kvals.BASS  - 50) * 0.18;
  eqMid.gain.value  = (kvals.FOCUS - 50) * 0.10;
  eqHigh.gain.value = (kvals.CLEAN - 50) * 0.12;
  compNode.threshold.value = -60 + kvals.PUNCH * 0.4;
  compNode.ratio.value     = 1 + kvals.PUNCH * 0.15;
  gainNode.gain.value      = 0.5 + (loud / 100) * 1.0;
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) loadFile(f);
}

document.getElementById('sf').addEventListener('change', function () {
  if (this.files[0]) loadFile(this.files[0]);
});

function loadFile(file) {
  initAudio();
  stopAudio();
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      audioBuffer = await audioCtx.decodeAudioData(e.target.result);
      const dur = audioBuffer.duration;
      document.getElementById('track-name').textContent = file.name.replace(/\.[^.]+$/, '');
      document.getElementById('track-dur').textContent  = fmtTime(dur);
      document.getElementById('time-total').textContent = fmtTime(dur);
      document.getElementById('waveform-wrap').style.display = 'flex';
      document.getElementById('drop-zone').style.display = 'none';
      drawWaveform();
      setStatus('Ficheiro carregado — clica PLAY para ouvir');
      setModeUI(playMode);
    } catch(err) {
      setStatus('Erro ao carregar ficheiro de áudio');
    }
  };
  reader.readAsArrayBuffer(file);
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function drawWaveform() {
  if (!audioBuffer) return;
  const canvas = document.getElementById('waveform-canvas');
  const W = canvas.width  = canvas.offsetWidth || 600;
  const H = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / W);
  const colors = ['#ff3ab5','#b855f7','#2dd4ff','#2dff8a'];
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < W; i++) {
    let max = 0;
    for (let j = 0; j < step; j++) {
      const v = Math.abs(data[i * step + j] || 0);
      if (v > max) max = v;
    }
    const h = max * (H - 4);
    const ci = Math.floor((i / W) * colors.length);
    const grad = ctx.createLinearGradient(0, H/2 - h/2, 0, H/2 + h/2);
    grad.addColorStop(0, colors[ci] + 'cc');
    grad.addColorStop(1, colors[ci] + '44');
    ctx.fillStyle = grad;
    ctx.fillRect(i, H/2 - h/2, 1, h);
  }
  waveformData = true;
  // click to seek
  canvas.parentElement.onclick = (e) => {
    if (!audioBuffer) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    seekTo(pct * audioBuffer.duration);
  };
}

function togglePlay() {
  if (!audioBuffer) return;
  if (isPlaying) pauseAudio();
  else           playAudio();
}

function playAudio() {
  if (!audioCtx || !audioBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  stopSource();

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  // BEFORE = dry, AFTER = through effects chain
  if (playMode === 'after') {
    applyAudioChain();
    sourceNode.connect(eqLow);
  } else {
    gainNode.gain.value = 0.8;
    sourceNode.connect(gainNode);
  }

  sourceNode.onended = () => {
    if (isPlaying) { isPlaying = false; pauseOffset = 0; updatePlayBtn(); stopProgress(); }
  };

  const offset = Math.min(pauseOffset, audioBuffer.duration - 0.01);
  sourceNode.start(0, offset);
  startTime  = audioCtx.currentTime - offset;
  isPlaying  = true;
  updatePlayBtn();
  startProgress();
}

function pauseAudio() {
  if (!isPlaying) return;
  pauseOffset = audioCtx.currentTime - startTime;
  stopSource();
  isPlaying = false;
  updatePlayBtn();
  stopProgress();
}

function stopAudio() {
  stopSource();
  isPlaying   = false;
  pauseOffset = 0;
  updatePlayBtn();
  stopProgress();
  setProgress(0);
}

function stopSource() {
  if (sourceNode) { try { sourceNode.stop(); } catch(e){} sourceNode = null; }
}

function seekTo(time) {
  const wasPlaying = isPlaying;
  stopSource();
  isPlaying   = false;
  pauseOffset = Math.max(0, Math.min(time, audioBuffer.duration - 0.01));
  if (wasPlaying) playAudio();
  else setProgress(pauseOffset / audioBuffer.duration);
}

function seekRelative(delta) {
  if (!audioBuffer) return;
  const cur = isPlaying ? audioCtx.currentTime - startTime : pauseOffset;
  seekTo(cur + delta);
}

function setVolume(v) {
  if (gainNode) gainNode.gain.value = (v / 100) * (playMode === 'after' ? 1.5 : 1.0);
  document.getElementById('vol-val').textContent = v + '%';
}

function updatePlayBtn() {
  const icon = document.getElementById('play-icon');
  icon.className = isPlaying ? 'ti ti-player-pause' : 'ti ti-player-play';
}

function startProgress() {
  stopProgress();
  animProgress = setInterval(() => {
    if (!isPlaying || !audioBuffer) return;
    const cur = audioCtx.currentTime - startTime;
    const pct = Math.min(cur / audioBuffer.duration, 1);
    setProgress(pct);
    document.getElementById('time-cur').textContent = fmtTime(cur);
  }, 80);
}

function stopProgress() { clearInterval(animProgress); }

function setProgress(pct) {
  const p = Math.min(pct * 100, 100);
  document.getElementById('waveform-progress').style.width  = p + '%';
  document.getElementById('waveform-cursor').style.left     = p + '%';
}

// ===== BEFORE / AFTER =====
function setMode(mode) {
  playMode = mode;
  const wasPlaying = isPlaying;
  if (wasPlaying) { pauseOffset = audioCtx.currentTime - startTime; stopSource(); isPlaying = false; }
  setModeUI(mode);
  if (wasPlaying) playAudio();
}

function setModeUI(mode) {
  document.getElementById('btn-before').classList.toggle('active', mode === 'before');
  document.getElementById('btn-after').classList.toggle('active',  mode === 'after');
  const dot = document.getElementById('mode-dot');
  const txt = document.getElementById('mode-txt');
  if (mode === 'before') {
    dot.className = 'mode-dot before';
    txt.textContent = 'A OUVIR: ORIGINAL (sem masterização)';
  } else {
    dot.className = 'mode-dot after';
    txt.textContent = 'A OUVIR: MASTERIZADO — ' + (PRESETS[curPreset]?.name || '') + ' · Piradex Suite';
  }
}

function setStatus(msg) { document.getElementById('stxt').textContent = msg.toUpperCase(); }

// ===== KNOBS =====
function toRad(d) { return d * Math.PI / 180; }
function descArc(cx, cy, r, s, e) {
  const sr = toRad(s), er = toRad(e);
  return `M${cx+r*Math.cos(sr)},${cy+r*Math.sin(sr)} A${r},${r},0,${e-s>180?1:0},1,${cx+r*Math.cos(er)},${cy+r*Math.sin(er)}`;
}

function buildKnobs() {
  const row = document.getElementById('knobs-row');
  row.innerHTML = '';
  KNOBS_DEF.forEach((name, i) => {
    const div = document.createElement('div');
    div.className = 'ki';
    div.innerHTML = `<svg class="ks" viewBox="0 0 52 52" id="ks-${i}">
      <circle cx="26" cy="26" r="20" fill="#141418" stroke="#ffffff0e" stroke-width="2.5"/>
      <path id="ka-${i}" fill="none" stroke="${KNOB_COLORS[name]}" stroke-width="4" stroke-linecap="round"/>
      <text x="26" y="31" text-anchor="middle" font-family="Orbitron" font-size="12" font-weight="700" fill="${KNOB_COLORS[name]}" id="kt-${i}">${Math.round(kvals[name])}</text>
    </svg><div class="kname">${name}</div>`;
    div.addEventListener('mousedown', e => startDrag(e, name));
    div.addEventListener('touchstart', e => startDrag(e, name), { passive: true });
    row.appendChild(div);
    drawKnob(i, name);
  });
}

function drawKnob(i, name) {
  const arc = document.getElementById(`ka-${i}`);
  const txt = document.getElementById(`kt-${i}`);
  if (arc) arc.setAttribute('d', descArc(26, 26, 20, 135, 135 + (kvals[name]/100)*270));
  if (txt) txt.textContent = Math.round(kvals[name]);
}

function refreshKnobs() { KNOBS_DEF.forEach((n, i) => drawKnob(i, n)); }

let dragName='', dragSY=0, dragSV=0;
function startDrag(e, name) {
  dragName = name; dragSY = e.touches ? e.touches[0].clientY : e.clientY; dragSV = kvals[name];
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}
function onDrag(e) {
  if (!dragName) return;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  kvals[dragName] = Math.max(0, Math.min(100, dragSV + (dragSY - cy) * 0.9));
  drawKnob(KNOBS_DEF.indexOf(dragName), dragName);
  updateLUFS();
  if (isPlaying && playMode === 'after') applyAudioChain();
}
function stopDrag() { dragName = ''; document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', stopDrag); }

// ===== PRESETS =====
function setPreset(key, el) {
  curPreset = key;
  const p = PRESETS[key];
  document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('hdr-preset').textContent = p.name;
  document.getElementById('pi-name').textContent    = p.name;
  document.getElementById('pi-desc').textContent    = p.desc;
  Object.assign(kvals, p.knobs);
  refreshKnobs(); updateLUFS(); updateSugs(p.sugs); setSpecTarget(key);
  setStatus('Preset: ' + p.name + ' — ' + p.desc.split(',')[0]);
  if (isPlaying && playMode === 'after') applyAudioChain();
  if (playMode === 'after') setModeUI('after');
}

function updateSugs(sugs) {
  sugs.forEach((s, i) => {
    const t = document.getElementById(`s${i+1}t`);
    const v = document.getElementById(`s${i+1}v`);
    if (t) t.textContent = s[0];
    if (v) { v.textContent = s[1]; v.className = `sval ${s[2]}`; }
  });
}

function setSpecTarget(key) {
  const profiles = {
    kizomba:  [0.80,0.85,0.70,0.50,0.40,0.30,0.25,0.20,0.15,0.12],
    kuduro:   [0.95,0.90,0.75,0.50,0.60,0.55,0.40,0.30,0.20,0.15],
    zouk:     [0.75,0.80,0.65,0.55,0.45,0.35,0.30,0.25,0.20,0.18],
    gzouk:    [0.85,0.88,0.70,0.55,0.50,0.40,0.32,0.25,0.18,0.14],
    semba:    [0.65,0.70,0.75,0.60,0.55,0.50,0.40,0.30,0.22,0.15],
    afrohouse:[0.92,0.88,0.72,0.50,0.60,0.55,0.45,0.35,0.22,0.14],
    rnb:      [0.60,0.65,0.70,0.65,0.60,0.55,0.50,0.40,0.30,0.20],
    afrobeats:[0.82,0.85,0.72,0.58,0.55,0.48,0.38,0.28,0.18,0.12]
  };
  const curve = profiles[key] || profiles.kizomba;
  specTarget = new Array(52).fill(0).map((_, i) => {
    const base = curve[Math.min(Math.floor(i/52*curve.length), curve.length-1)];
    return Math.max(0.04, base * (0.8 + Math.random() * 0.4));
  });
}

function doRemaster() {
  setSpecTarget(curPreset);
  setStatus('✓ Re-master completo — IA aplicada');
  if (audioBuffer && playMode === 'after') applyAudioChain();
}

function updateLUFS() {
  const lufs = (-23 + kvals.LOUD * 0.17).toFixed(1);
  document.getElementById('lufs-n').textContent = lufs;
  document.getElementById('slufs').textContent  = lufs + ' LUFS';
}

function toggleBypass() {
  bypassOn = !bypassOn;
  document.getElementById('bypass-btn').classList.toggle('on', bypassOn);
  setStatus(bypassOn ? 'Bypass ativo — sem processamento' : 'Bypass desligado — processando');
}

function togglePiradex() {
  piradexOn = !piradexOn;
  const btn = document.getElementById('pira-btn');
  if (piradexOn) {
    btn.classList.add('on');
    btn.textContent = '⚡ PIRADEX ATIVO ⚡';
    setStatus('🔥 Piradex ON — Turbo máximo activado');
    KNOBS_DEF.forEach((n, i) => { kvals[n] = Math.min(100, kvals[n] + 18 + Math.random()*12); drawKnob(i, n); });
    setSpecTarget(curPreset); updateLUFS();
    if (isPlaying && playMode === 'after') applyAudioChain();
  } else {
    btn.classList.remove('on');
    btn.textContent = '⚡ MASTERING PIRADEX ⚡';
    setStatus('Piradex desactivado');
    setPreset(curPreset, document.querySelector('.preset-chip.active'));
  }
}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', function () {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  this.classList.add('active');
}));

// ===== SPECTRUM ANIMATION =====
function animate() {
  const canvas = document.getElementById('spec');
  if (!canvas) { requestAnimationFrame(animate); return; }
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth  || 300;
  const H = canvas.height = canvas.offsetHeight || 160;
  ctx.clearRect(0, 0, W, H);
  const N = 52, bw = (W/N) - 1;
  const colors = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];
  const spd = piradexOn ? 1.8 : 1;
  specData = specData.map((v, i) => Math.max(0.03, Math.min(1, v*0.87 + specTarget[i]*0.13 + (Math.random()-0.5)*0.05*spd)));
  specData.forEach((v, i) => {
    const x = i*(bw+1)+1, h = v*(H-4);
    const ci = Math.floor(i/N*(colors.length-1));
    const grad = ctx.createLinearGradient(0,H-h,0,H);
    grad.addColorStop(0, colors[ci]+'ee'); grad.addColorStop(1, colors[ci]+'22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x,H-h,bw,h,2); else ctx.rect(x,H-h,bw,h);
    ctx.fill();
  });
  vuPhase += piradexOn ? 0.09 : 0.05;
  const loud = kvals.LOUD/100;
  document.getElementById('vu-l').style.height = Math.min(96, 50+loud*45+Math.sin(vuPhase*1.2)*9+(piradexOn?18:0)) + '%';
  document.getElementById('vu-r').style.height = Math.min(96, 45+loud*45+Math.sin(vuPhase*1.6+1)*9+(piradexOn?18:0)) + '%';
  requestAnimationFrame(animate);
}

// ===== INIT =====
buildKnobs();
updateLUFS();
setSpecTarget('kizomba');
setModeUI('before');
animate();
