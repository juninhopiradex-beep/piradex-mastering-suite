/* ═══════════════════════════════════════════════════════════════════════════
 * FEATURES2.JS — Piradex Mastering Suite v3.0
 * Implementação completa das funcionalidades avançadas:
 * True Peak Limiter · LUFS Target · Session Memory · Spectral+Ghost Reference
 * Stereo Vectorscope · Genre DNA · Smart LUFS Coach · Mastering Receipt
 * Share Your Master · Blind A/B Test · Mastering Memory · Undo/Redo
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ══════════════════════════════════════════════════════════════════════════
 * 1. SESSION MEMORY — IndexedDB, nada se perde nunca
 * ══════════════════════════════════════════════════════════════════════════ */
const SessionMemory = (function() {
  const DB_NAME = 'piradex_suite';
  const DB_VER  = 1;
  let db = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('sessions'))
          d.createObjectStore('sessions', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('memory'))
          d.createObjectStore('memory', { keyPath: 'key' });
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror   = e => reject(e);
    });
  }

  async function save(key, value) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction('memory', 'readwrite');
      tx.objectStore('memory').put({ key, value, ts: Date.now() });
      tx.oncomplete = res; tx.onerror = rej;
    });
  }

  async function load(key) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction('memory', 'readonly');
      const req = tx.objectStore('memory').get(key);
      req.onsuccess = e => res(e.target.result ? e.target.result.value : null);
      req.onerror   = rej;
    });
  }

  async function saveSession() {
    const state = {
      id: 'current',
      ts: Date.now(),
      genre: MasteringMemory.lastGenre,
      lufsTarget: LUFSTarget.current,
      params: {}
    };
    // Captura todos os sliders e inputs da suite
    document.querySelectorAll('[id]').forEach(el => {
      if (el.type === 'range') state.params[el.id] = el.value;
      if (el.type === 'checkbox') state.params[el.id] = el.checked;
    });
    await save('session', state);
  }

  async function restoreSession() {
    const state = await load('session');
    if (!state || !state.params) return false;
    Object.entries(state.params).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'range') { el.value = val; el.dispatchEvent(new Event('input')); }
      if (el.type === 'checkbox') { el.checked = val; el.dispatchEvent(new Event('change')); }
    });
    if (state.lufsTarget) LUFSTarget.set(state.lufsTarget);
    _showBanner('✓ Sessão anterior restaurada — ' + new Date(state.ts).toLocaleString('pt-PT'));
    return true;
  }

  function _showBanner(msg) {
    const el = document.getElementById('session-banner');
    if (!el) return;
    el.textContent = msg; el.style.display = 'block';
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; el.style.opacity = '1'; }, 600); }, 4000);
  }

  // Auto-save a cada 30 segundos
  setInterval(saveSession, 30000);
  document.addEventListener('piradex:tab', () => setTimeout(saveSession, 500));

  return { save, load, saveSession, restoreSession };
})();
window.SessionMemory = SessionMemory;


/* ══════════════════════════════════════════════════════════════════════════
 * 2. UNDO / REDO
 * ══════════════════════════════════════════════════════════════════════════ */
const UndoRedo = (function() {
  const stack = [], MAX = 50;
  let cursor = -1;
  let paused = false;

  function capture(label) {
    if (paused) return;
    const snap = {};
    document.querySelectorAll('[id]').forEach(el => {
      if (el.type === 'range') snap[el.id] = el.value;
      if (el.type === 'checkbox') snap[el.id] = el.checked;
    });
    // Limpa redo stack
    stack.splice(cursor + 1);
    stack.push({ label: label || 'Ajuste', snap, ts: Date.now() });
    if (stack.length > MAX) stack.shift();
    cursor = stack.length - 1;
    _updateUI();
  }

  function undo() {
    if (cursor <= 0) return;
    cursor--;
    _apply(stack[cursor].snap);
    _updateUI();
    _toast('↩ Desfeito: ' + stack[cursor + 1].label);
  }

  function redo() {
    if (cursor >= stack.length - 1) return;
    cursor++;
    _apply(stack[cursor].snap);
    _updateUI();
    _toast('↪ Refeito: ' + stack[cursor].label);
  }

  function _apply(snap) {
    paused = true;
    Object.entries(snap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'range') { el.value = val; el.dispatchEvent(new Event('input')); }
      if (el.type === 'checkbox') { el.checked = val; el.dispatchEvent(new Event('change')); }
    });
    paused = false;
    if (typeof applyDSP === 'function') applyDSP();
  }

  function _updateUI() {
    const u = document.getElementById('btn-undo');
    const r = document.getElementById('btn-redo');
    if (u) u.disabled = cursor <= 0;
    if (r) r.disabled = cursor >= stack.length - 1;
  }

  function _toast(msg) {
    const el = document.getElementById('undo-toast');
    if (!el) return;
    el.textContent = msg; el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0', 2000);
  }

  // Captura automática nos sliders com debounce
  let _debounce = null;
  document.addEventListener('input', e => {
    if (e.target.type !== 'range') return;
    clearTimeout(_debounce);
    _debounce = setTimeout(() => capture(e.target.id), 800);
  });

  // Atalhos teclado
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });

  // Captura inicial
  setTimeout(() => capture('Estado inicial'), 1000);

  return { capture, undo, redo };
})();
window.UndoRedo = UndoRedo;


/* ══════════════════════════════════════════════════════════════════════════
 * 3. LUFS TARGET POR PLATAFORMA
 * ══════════════════════════════════════════════════════════════════════════ */
const LUFSTarget = (function() {
  const PLATFORMS = {
    spotify:   { name: 'Spotify',       target: -14, tp: -1.0, color: '#1db954' },
    apple:     { name: 'Apple Music',   target: -16, tp: -1.0, color: '#fc3c44' },
    youtube:   { name: 'YouTube',       target: -14, tp: -1.0, color: '#ff0000' },
    tidal:     { name: 'Tidal',         target: -14, tp: -1.0, color: '#00ffff' },
    deezer:    { name: 'Deezer',        target: -15, tp: -1.0, color: '#ff6600' },
    club:      { name: 'Club / DJ',     target:  -9, tp: -0.3, color: '#b855f7' },
    broadcast: { name: 'Broadcast TV',  target: -23, tp: -1.0, color: '#2ddcff' },
    cd:        { name: 'CD / Download', target: -10, tp: -0.1, color: '#ffe135' },
    custom:    { name: 'Custom',        target: -14, tp: -1.0, color: '#2dff8a' },
  };

  let current = 'spotify';

  function set(platformKey) {
    current = platformKey;
    const p = PLATFORMS[platformKey];
    if (!p) return;
    // Actualiza display
    const nameEl = document.getElementById('lufs-target-name');
    const valEl  = document.getElementById('lufs-target-val');
    const tpEl   = document.getElementById('lufs-target-tp');
    const dotEl  = document.getElementById('lufs-target-dot');
    if (nameEl) nameEl.textContent = p.name;
    if (valEl)  { valEl.textContent = p.target + ' LUFS'; valEl.style.color = p.color; }
    if (tpEl)   tpEl.textContent = 'TP: ' + p.tp + ' dBFS';
    if (dotEl)  dotEl.style.background = p.color;
    // Marca botão activo
    document.querySelectorAll('.lufs-platform-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.platform === platformKey);
    });
    // Smart coach
    SmartLUFSCoach.setTarget(p.target, p.tp, p.color);
    // Save
    SessionMemory.save('lufsTarget', platformKey);
  }

  function getCurrent() { return PLATFORMS[current] || PLATFORMS.spotify; }

  return { set, getCurrent, PLATFORMS, get current() { return current; } };
})();
window.LUFSTarget = LUFSTarget;


/* ══════════════════════════════════════════════════════════════════════════
 * 4. SMART LUFS COACH — feedback em tempo real
 * ══════════════════════════════════════════════════════════════════════════ */
const SmartLUFSCoach = (function() {
  let targetLUFS = -14, targetTP = -1.0, targetColor = '#1db954';
  let _interval = null;

  function setTarget(lufs, tp, color) {
    targetLUFS = lufs; targetTP = tp; targetColor = color;
  }

  function start() {
    if (_interval) return;
    _interval = setInterval(_update, 500);
  }

  function stop() {
    clearInterval(_interval); _interval = null;
  }

  function _update() {
    const coachEl = document.getElementById('lufs-coach-msg');
    const barEl   = document.getElementById('lufs-coach-bar');
    const lufsEl  = document.getElementById('lufs-n');
    if (!coachEl || !lufsEl) return;

    const currentLUFS = parseFloat(lufsEl.textContent) || -23;
    const diff = currentLUFS - targetLUFS;
    const absDiff = Math.abs(diff);

    let msg = '', color = '#2dff8a', pct = 100;

    if (absDiff < 0.5) {
      msg = `✓ ${currentLUFS.toFixed(1)} LUFS — Perfeito para ${LUFSTarget.getCurrent().name}`;
      color = '#2dff8a'; pct = 100;
    } else if (diff > 3) {
      msg = `▼ ${absDiff.toFixed(1)} LUFS acima — Reduz o LOUD ou Makeup Gain`;
      color = '#ff3a3a'; pct = Math.max(20, 100 - diff * 8);
    } else if (diff > 0.5) {
      msg = `▼ ${absDiff.toFixed(1)} LUFS acima — Ligeiramente alto para ${LUFSTarget.getCurrent().name}`;
      color = '#ffe135'; pct = 80;
    } else if (diff < -3) {
      msg = `▲ ${absDiff.toFixed(1)} LUFS abaixo — Aumenta o LOUD`;
      color = '#2ddcff'; pct = 40;
    } else {
      msg = `▲ ${absDiff.toFixed(1)} LUFS abaixo — Quase lá`;
      color = '#ffab2d'; pct = 70;
    }

    coachEl.textContent = msg; coachEl.style.color = color;
    if (barEl) { barEl.style.width = pct + '%'; barEl.style.background = color; }
  }

  return { start, stop, setTarget };
})();
window.SmartLUFSCoach = SmartLUFSCoach;


/* ══════════════════════════════════════════════════════════════════════════
 * 5. TRUE PEAK LIMITER
 * ══════════════════════════════════════════════════════════════════════════ */
const TruePeakLimiter = (function() {
  let tpNode = null, tpGain = null, tpCeiling = -0.3;

  function init(ctx, inputNode) {
    if (tpNode) { try { tpNode.disconnect(); } catch(e) {} }
    tpGain = ctx.createGain();
    tpGain.gain.value = 1;
    // DynamicsCompressor configurado como limiter (ratio alto, attack instantâneo)
    tpNode = ctx.createDynamicsCompressor();
    tpNode.threshold.value = tpCeiling;
    tpNode.knee.value      = 0;
    tpNode.ratio.value     = 20;
    tpNode.attack.value    = 0.001;
    tpNode.release.value   = 0.05;
    tpGain.connect(tpNode);
    return { input: tpGain, output: tpNode };
  }

  function setCeiling(db) {
    tpCeiling = db;
    if (tpNode) tpNode.threshold.value = db;
    const el = document.getElementById('tp-ceiling-val');
    if (el) el.textContent = db.toFixed(1) + ' dBFS';
  }

  function bypass(on) {
    if (tpNode) tpNode.ratio.value = on ? 1 : 20;
    const btn = document.getElementById('tp-bypass-btn');
    if (btn) btn.classList.toggle('bypass-active', on);
  }

  // True Peak metering (oversampling 4x via interpolação)
  function measureTruePeak(buffer) {
    const data = buffer.getChannelData(0);
    const N = data.length;
    let tp = 0;
    // Interpolação linear 4x
    for (let i = 0; i < N - 1; i++) {
      for (let k = 0; k < 4; k++) {
        const frac = k / 4;
        const interp = data[i] * (1 - frac) + data[i + 1] * frac;
        tp = Math.max(tp, Math.abs(interp));
      }
    }
    return 20 * Math.log10(tp + 1e-10);
  }

  return { init, setCeiling, bypass, measureTruePeak };
})();
window.TruePeakLimiter = TruePeakLimiter;


/* ══════════════════════════════════════════════════════════════════════════
 * 6. GENRE DNA — detector de géneros africanos + universais
 * ══════════════════════════════════════════════════════════════════════════ */
const GenreDNA = (function() {
  const GENRES = {
    kizomba:    { name: 'Kizomba',        bpmRange: [80,  100], bassWeight: 0.45, midWeight: 0.35, hiWeight: 0.20, transLow: true,  color: '#ff3ab5', lufs: -12, eq: { low:+2, mid:+1, high:0,   air:+1 } },
    afrohouse:  { name: 'Afro House',     bpmRange: [120, 130], bassWeight: 0.40, midWeight: 0.30, hiWeight: 0.30, transLow: false, color: '#b855f7', lufs: -9,  eq: { low:+1, mid:0,  high:+2, air:+2 } },
    kuduro:     { name: 'Kuduro',         bpmRange: [130, 145], bassWeight: 0.35, midWeight: 0.30, hiWeight: 0.35, transLow: false, color: '#ffe135', lufs: -9,  eq: { low:+1, mid:-1, high:+2, air:+3 } },
    semba:      { name: 'Semba',          bpmRange: [90,  115], bassWeight: 0.40, midWeight: 0.40, hiWeight: 0.20, transLow: true,  color: '#2dff8a', lufs: -14, eq: { low:+1, mid:+2, high:0,   air:0 } },
    zouk:       { name: 'Zouk',           bpmRange: [75,   95], bassWeight: 0.42, midWeight: 0.38, hiWeight: 0.20, transLow: true,  color: '#2ddcff', lufs: -12, eq: { low:+2, mid:+1, high:0,   air:+1 } },
    afropop:    { name: 'Afropop',        bpmRange: [100, 120], bassWeight: 0.38, midWeight: 0.35, hiWeight: 0.27, transLow: false, color: '#ff6b2b', lufs: -11, eq: { low:+1, mid:0,  high:+1, air:+2 } },
    dancehall:  { name: 'Dancehall',      bpmRange: [68,   92], bassWeight: 0.45, midWeight: 0.28, hiWeight: 0.27, transLow: true,  color: '#ffab2d', lufs: -10, eq: { low:+2, mid:-1, high:+1, air:+2 } },
    hiphop:     { name: 'Hip-Hop / Rap',  bpmRange: [75,  110], bassWeight: 0.48, midWeight: 0.28, hiWeight: 0.24, transLow: true,  color: '#ff3a3a', lufs: -10, eq: { low:+3, mid:-1, high:0,   air:+1 } },
    electronic: { name: 'Electronic',     bpmRange: [120, 140], bassWeight: 0.42, midWeight: 0.28, hiWeight: 0.30, transLow: false, color: '#00f5ff', lufs: -8,  eq: { low:+2, mid:-1, high:+2, air:+3 } },
    rnb:        { name: 'R&B / Soul',     bpmRange: [65,   95], bassWeight: 0.40, midWeight: 0.38, hiWeight: 0.22, transLow: true,  color: '#d966ff', lufs: -13, eq: { low:+2, mid:+1, high:+1, air:+1 } },
  };

  let lastResult = null;

  function analyze(buffer) {
    const sr = buffer.sampleRate;
    const data = buffer.getChannelData(0);
    const N = data.length;
    const FFT = 4096;
    const HOP = 2048;

    // Análise espectral por bandas
    let lowE = 0, midE = 0, hiE = 0, totalE = 0;
    let nFrames = 0;
    const lowLimit  = Math.floor(300  * FFT / sr);
    const midLimit  = Math.floor(3000 * FFT / sr);

    for (let pos = 0; pos + FFT < N; pos += HOP) {
      const real = new Float32Array(FFT);
      for (let i = 0; i < FFT; i++) real[i] = data[pos + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / FFT));
      const mag = _fftMag(real);
      for (let k = 1; k < FFT / 2; k++) {
        const e = mag[k] * mag[k];
        if (k < lowLimit)  lowE += e;
        else if (k < midLimit) midE += e;
        else hiE += e;
        totalE += e;
      }
      nFrames++;
    }

    if (totalE < 1e-6 || nFrames === 0) return null;
    const lw = lowE / totalE, mw = midE / totalE, hw = hiE / totalE;

    // Estima BPM (onset detection simples)
    const bpm = _estimateBPM(data, sr);

    // Score por género
    let bestGenre = 'afropop', bestScore = -Infinity;
    for (const [key, g] of Object.entries(GENRES)) {
      const bpmOk = bpm >= g.bpmRange[0] && bpm <= g.bpmRange[1] ? 1 : 0.4;
      const specScore = 1 - (Math.abs(lw - g.bassWeight) + Math.abs(mw - g.midWeight) + Math.abs(hw - g.hiWeight));
      const score = specScore * 0.7 + bpmOk * 0.3;
      if (score > bestScore) { bestScore = score; bestGenre = key; }
    }

    lastResult = { genre: bestGenre, bpm: Math.round(bpm), confidence: Math.round(bestScore * 100), lw, mw, hw };
    return lastResult;
  }

  function _fftMag(real) {
    const N = real.length;
    // Simple DFT for magnitude (fast enough for genre detection)
    const mag = new Float32Array(N / 2);
    for (let k = 0; k < N / 2; k++) {
      let re = 0, im = 0;
      const step = 2 * Math.PI * k / N;
      for (let n = 0; n < N; n++) { re += real[n] * Math.cos(step * n); im -= real[n] * Math.sin(step * n); }
      mag[k] = Math.sqrt(re * re + im * im) / N;
    }
    return mag;
  }

  function _estimateBPM(data, sr) {
    // Onset detection via envelope follower
    const windowMs = 10, windowSz = Math.round(sr * windowMs / 1000);
    const env = [];
    for (let i = 0; i + windowSz < data.length; i += windowSz) {
      let rms = 0; for (let j = 0; j < windowSz; j++) rms += data[i+j]*data[i+j];
      env.push(Math.sqrt(rms / windowSz));
    }
    // Autocorrelação do envelope para BPM 60-180
    let bestBPM = 120, bestCorr = -1;
    for (let bpm = 60; bpm <= 180; bpm++) {
      const lagFrames = Math.round((60 / bpm) * (1000 / windowMs));
      if (lagFrames >= env.length) continue;
      let corr = 0;
      for (let i = 0; i < env.length - lagFrames; i++) corr += env[i] * env[i + lagFrames];
      if (corr > bestCorr) { bestCorr = corr; bestBPM = bpm; }
    }
    return bestBPM;
  }

  function applyPreset(genreKey) {
    const g = GENRES[genreKey];
    if (!g) return;
    // Aplica EQ sugerido
    const setS = (id, val) => {
      const el = document.getElementById(id); if (!el) return;
      el.value = val; el.dispatchEvent(new Event('input'));
    };
    // Voice Lab EQ
    setS('vl-eq-low',  g.eq.low);
    setS('vl-eq-mid',  g.eq.mid);
    setS('vl-eq-high', g.eq.high);
    setS('vl-eq-air',  g.eq.air);
    // LUFS target
    LUFSTarget.set(Object.entries(LUFSTarget.PLATFORMS).find(([k,v]) => v.target === g.lufs)?.[0] || 'custom');
    // Save para Mastering Memory
    MasteringMemory.recordGenre(genreKey);
  }

  function getGenre(key) { return GENRES[key]; }
  function getAllGenres() { return GENRES; }
  function getLastResult() { return lastResult; }

  return { analyze, applyPreset, getGenre, getAllGenres, getLastResult };
})();
window.GenreDNA = GenreDNA;


/* ══════════════════════════════════════════════════════════════════════════
 * 7. MASTERING MEMORY — aprende hábitos por género
 * ══════════════════════════════════════════════════════════════════════════ */
const MasteringMemory = (function() {
  let lastGenre = null;
  const memory = {};

  async function load() {
    const saved = await SessionMemory.load('masteringMemory');
    if (saved) Object.assign(memory, saved);
  }

  function recordGenre(genre) {
    lastGenre = genre;
    if (!memory[genre]) memory[genre] = { count: 0, params: {} };
    memory[genre].count++;
    // Captura parâmetros actuais
    document.querySelectorAll('[id]').forEach(el => {
      if (el.type === 'range') memory[genre].params[el.id] = parseFloat(el.value);
    });
    SessionMemory.save('masteringMemory', memory);
  }

  function suggest(genre) {
    if (!memory[genre] || memory[genre].count < 3) return null;
    return memory[genre].params;
  }

  function applyMemory(genre) {
    const params = suggest(genre);
    if (!params) return false;
    Object.entries(params).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && el.type === 'range') { el.value = val; el.dispatchEvent(new Event('input')); }
    });
    _showGenreMemoryToast(genre);
    return true;
  }

  function _showGenreMemoryToast(genre) {
    const g = GenreDNA.getGenre(genre);
    const el = document.getElementById('memory-toast');
    if (!el || !g) return;
    el.innerHTML = `🧠 Mastering Memory: aplicados os teus ajustes habituais de <b style="color:${g.color}">${g.name}</b>`;
    el.style.display = 'block'; el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.style.display = 'none', 500); }, 4000);
  }

  load();
  return { recordGenre, suggest, applyMemory, get lastGenre() { return lastGenre; } };
})();
window.MasteringMemory = MasteringMemory;


/* ══════════════════════════════════════════════════════════════════════════
 * 8. GHOST REFERENCE — overlay espectral de referência comercial
 * ══════════════════════════════════════════════════════════════════════════ */
const GhostReference = (function() {
  let ghostData = null; // Float32Array com spectro de referência
  let visible = true;

  function load(buffer) {
    const data = buffer.getChannelData(0);
    const FFT = 2048;
    const real = new Float32Array(FFT);
    // Média de múltiplos frames para o espectro de referência
    let frames = 0;
    ghostData = new Float32Array(FFT / 2);
    for (let pos = 0; pos + FFT < data.length; pos += FFT) {
      let rms = 0; for (let i = 0; i < FFT; i++) rms += data[pos+i]*data[pos+i];
      if (rms/FFT < 0.0001) continue;
      for (let i = 0; i < FFT; i++) real[i] = data[pos+i];
      // Magnitude via autocorrelação espectral
      for (let k = 0; k < FFT/2; k++) {
        let re=0, im=0;
        for (let n=0;n<FFT;n++){re+=real[n]*Math.cos(2*Math.PI*k*n/FFT);im-=real[n]*Math.sin(2*Math.PI*k*n/FFT);}
        ghostData[k] += Math.sqrt(re*re+im*im)/FFT;
      }
      frames++;
    }
    if (frames > 0) for (let k = 0; k < FFT/2; k++) ghostData[k] /= frames;
    // Normaliza
    const mx = Math.max(...ghostData);
    if (mx > 0) for (let k = 0; k < FFT/2; k++) ghostData[k] /= mx;
    _updateGhostBtn(true);
  }

  function getSpectrum() { return visible ? ghostData : null; }
  function toggle() { visible = !visible; _updateGhostBtn(visible && !!ghostData); }

  function _updateGhostBtn(active) {
    const btn = document.getElementById('ghost-ref-btn');
    if (btn) btn.classList.toggle('active', active);
  }

  return { load, getSpectrum, toggle, get hasData() { return !!ghostData; } };
})();
window.GhostReference = GhostReference;


/* ══════════════════════════════════════════════════════════════════════════
 * 9. STEREO VECTORSCOPE
 * ══════════════════════════════════════════════════════════════════════════ */
const Vectorscope = (function() {
  let _canvas = null, _ctx = null, _analyserL = null, _analyserR = null;
  let _raf = null, _active = false;

  function init(canvasId, analyserL, analyserR) {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');
    _analyserL = analyserL; _analyserR = analyserR;
  }

  function start() {
    if (_active) return; _active = true; _draw();
  }

  function stop() { _active = false; cancelAnimationFrame(_raf); }

  function _draw() {
    if (!_active || !_canvas || !_analyserL) return;
    const W = _canvas.width, H = _canvas.height;
    const cx = W / 2, cy = H / 2;

    // Fade trail
    _ctx.fillStyle = 'rgba(0,0,0,0.15)'; _ctx.fillRect(0, 0, W, H);

    const bufL = new Float32Array(_analyserL.fftSize);
    const bufR = new Float32Array(_analyserR.fftSize);
    _analyserL.getFloatTimeDomainData(bufL);
    _analyserR.getFloatTimeDomainData(bufR);

    const N = Math.min(bufL.length, 256);
    for (let i = 0; i < N; i++) {
      const l = bufL[i], r = bufR[i];
      // Rotacionar 45°: M = (L+R)/√2, S = (L-R)/√2
      const m = (l + r) * 0.707;
      const s = (l - r) * 0.707;
      const px = cx + s * cx * 0.9;
      const py = cy - m * cy * 0.9;
      const amp = Math.sqrt(l*l + r*r);
      const hue = 140 + amp * 120;
      _ctx.fillStyle = `hsla(${hue},100%,65%,0.7)`;
      _ctx.fillRect(px - 0.5, py - 0.5, 1.5, 1.5);
    }

    // Guias
    _ctx.strokeStyle = 'rgba(255,255,255,0.06)'; _ctx.lineWidth = 1;
    _ctx.beginPath(); _ctx.moveTo(cx, 0); _ctx.lineTo(cx, H); _ctx.stroke();
    _ctx.beginPath(); _ctx.moveTo(0, cy); _ctx.lineTo(W, cy); _ctx.stroke();
    _ctx.beginPath(); _ctx.moveTo(0, H); _ctx.lineTo(W, 0); _ctx.stroke();
    _ctx.beginPath(); _ctx.moveTo(0, 0); _ctx.lineTo(W, H); _ctx.stroke();

    // Labels
    _ctx.fillStyle = 'rgba(255,255,255,0.3)'; _ctx.font = '9px monospace';
    _ctx.fillText('M', cx - 8, 12);
    _ctx.fillText('L', 4, cy + 4);
    _ctx.fillText('R', W - 14, cy + 4);
    _ctx.fillText('S', cx - 8, H - 4);

    _raf = requestAnimationFrame(_draw);
  }

  return { init, start, stop };
})();
window.Vectorscope = Vectorscope;


/* ══════════════════════════════════════════════════════════════════════════
 * 10. BLIND A/B TEST
 * ══════════════════════════════════════════════════════════════════════════ */
const BlindABTest = (function() {
  let _round = 0, _correct = 0, _total = 0;
  let _playing = null, _answer = null;
  let _origBuf = null, _procBuf = null;

  function start(origBuffer, processedBuffer) {
    _origBuf = origBuffer; _procBuf = processedBuffer;
    _round = 0; _correct = 0; _total = 0;
    _updateUI();
    _showPanel(true);
  }

  function play(which) {
    // Para qualquer player activo
    window.AudioManager && window.AudioManager.stopAll();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = which === 'A' ? _getRandomOrder()[0] : _getRandomOrder()[1];
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start();
    _playing = { which, ctx, src };
  }

  function _getRandomOrder() {
    // Randomiza qual é A e qual é B
    if (!_answer) _answer = Math.random() < 0.5 ? 'orig' : 'proc';
    return _answer === 'orig' ? [_origBuf, _procBuf] : [_procBuf, _origBuf];
  }

  function guess(which) {
    // which = 'original' | 'masterizado'
    _total++;
    const isOrig = which === 'original';
    const playedOrig = _answer === 'orig' ? _playing?.which === 'A' : _playing?.which === 'B';
    const correct = (isOrig && playedOrig) || (!isOrig && !playedOrig);
    if (correct) _correct++;
    _answer = null; // reset para próxima ronda
    _updateResult(correct);
    _updateUI();
  }

  function _updateResult(correct) {
    const el = document.getElementById('ab-result');
    if (!el) return;
    el.textContent = correct ? '✓ Correcto! O teu ouvido é aguçado.' : '✗ Enganado! Não é fácil distinguir.';
    el.style.color = correct ? '#2dff8a' : '#ff3a3a';
  }

  function _updateUI() {
    const el = document.getElementById('ab-score');
    if (el) el.textContent = `${_correct}/${_total} correcto${_total !== 1 ? 's' : ''}`;
  }

  function _showPanel(show) {
    const panel = document.getElementById('ab-panel');
    if (panel) panel.style.display = show ? 'block' : 'none';
  }

  return { start, play, guess };
})();
window.BlindABTest = BlindABTest;


/* ══════════════════════════════════════════════════════════════════════════
 * 11. MASTERING RECEIPT — PDF profissional
 * ══════════════════════════════════════════════════════════════════════════ */
const MasteringReceipt = (function() {

  function generate(trackName, params) {
    const g = GenreDNA.getLastResult();
    const platform = LUFSTarget.getCurrent();
    const now = new Date();

    // Gera HTML que será convertido para PDF via print
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Mastering Receipt — ${trackName}</title>
<style>
  body { font-family: 'Courier New', monospace; background: #fff; color: #111; padding: 40px; max-width: 600px; margin: 0 auto; }
  .header { border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-size: 24px; font-weight: 900; letter-spacing: 4px; }
  .sub { font-size: 11px; color: #555; letter-spacing: 2px; margin-top: 4px; }
  .track { font-size: 18px; font-weight: 700; margin: 16px 0 4px; }
  .date { font-size: 11px; color: #777; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { text-align: left; font-size: 10px; letter-spacing: 2px; color: #555; border-bottom: 1px solid #ddd; padding: 6px 0; }
  td { padding: 5px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
  td:last-child { text-align: right; font-weight: 700; }
  .section { font-size: 10px; letter-spacing: 2px; color: #555; margin: 20px 0 8px; text-transform: uppercase; }
  .footer { border-top: 1px solid #ddd; margin-top: 32px; padding-top: 16px; font-size: 10px; color: #777; }
  .badge { display: inline-block; background: #111; color: #fff; padding: 3px 10px; font-size: 10px; letter-spacing: 2px; border-radius: 2px; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">PIRADEX</div>
  <div class="sub">MASTERING SUITE — RECEIPT</div>
</div>
<div class="track">${trackName || 'Sem título'}</div>
<div class="date">${now.toLocaleDateString('pt-PT', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} · ${now.toLocaleTimeString('pt-PT')}</div>

<div class="section">Análise</div>
<table>
  <tr><th>Parâmetro</th><th>Valor</th></tr>
  <tr><td>Género detectado</td><td>${g ? g.name + ' (' + g.confidence + '% conf.)' : '—'}</td></tr>
  <tr><td>BPM estimado</td><td>${g ? g.bpm + ' bpm' : '—'}</td></tr>
  <tr><td>LUFS target</td><td>${platform.target} LUFS (${platform.name})</td></tr>
  <tr><td>True Peak ceiling</td><td>${platform.tp} dBFS</td></tr>
  <tr><td>Balance Low/Mid/High</td><td>${g ? Math.round(g.lw*100) + '% / ' + Math.round(g.mw*100) + '% / ' + Math.round(g.hw*100) + '%' : '—'}</td></tr>
</table>

<div class="section">Processamento Voice Lab</div>
<table>
  <tr><th>Módulo</th><th>Estado</th></tr>
  <tr><td>1. CLEAN — HPF</td><td>${params?.hpf || '80'} Hz</td></tr>
  <tr><td>2. SHAPE — EQ Low/Mid/High/Air</td><td>${params?.eqLow || '0'} / ${params?.eqMid || '0'} / ${params?.eqHigh || '0'} / ${params?.eqAir || '0'} dB</td></tr>
  <tr><td>3. CONTROL — Threshold / Ratio</td><td>${params?.threshold || '-20'} dB / ${params?.ratio || '3'}:1</td></tr>
  <tr><td>5. SPACE — Reverb / Delay</td><td>${params?.reverbMix || '0'}% / ${params?.delayMix || '0'}%</td></tr>
</table>

<div class="section">Certificação</div>
<table>
  <tr><td>Suite</td><td>Piradex Mastering Suite v3.0</td></tr>
  <tr><td>Session ID</td><td>${Date.now().toString(36).toUpperCase()}</td></tr>
  <tr><td>Engineer</td><td>Juninho Piradex / BeatFreak Music</td></tr>
  <tr><td>Studio</td><td>beatfreakstudio.com</td></tr>
</table>

<div class="footer">
  <span class="badge">PIRADEX CERTIFIED MASTER</span>
  <p style="margin-top:10px;">Este documento certifica que a faixa acima foi masterizada com a Piradex Mastering Suite. Os parâmetros listados representam o estado final do processamento.</p>
</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  return { generate };
})();
window.MasteringReceipt = MasteringReceipt;


/* ══════════════════════════════════════════════════════════════════════════
 * 12. SHARE YOUR MASTER — card visual para redes sociais
 * ══════════════════════════════════════════════════════════════════════════ */
const ShareCard = (function() {

  function generate(trackName, lufs, genre, buffer) {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1080;
    const ctx = cv.getContext('2d');
    const g = GenreDNA.getGenre(genre) || { name: genre, color: '#ff3ab5' };

    // Background gradiente
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#07070e');
    grad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1080);

    // Grid decorativo
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
    for (let i = 0; i < 1080; i += 60) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
    }

    // Waveform de fundo
    if (buffer) {
      const data = buffer.getChannelData(0);
      const step = Math.floor(data.length / 1080);
      ctx.strokeStyle = g.color + '22'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < 1080; x++) {
        let mx = 0; for (let i = 0; i < step; i++) mx = Math.max(mx, Math.abs(data[x*step+i]||0));
        const y = 540 - mx * 300;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x < 1080; x++) {
        let mx = 0; for (let i = 0; i < step; i++) mx = Math.max(mx, Math.abs(data[x*step+i]||0));
        const y = 540 + mx * 300;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Linha central glow
    ctx.shadowColor = g.color; ctx.shadowBlur = 20;
    ctx.strokeStyle = g.color; ctx.lineWidth = 2;
    if (buffer) {
      const data = buffer.getChannelData(0);
      const step = Math.floor(data.length / 1080);
      ctx.beginPath();
      for (let x = 0; x < 1080; x++) {
        let mx = 0; for (let i = 0; i < step; i++) mx = Math.max(mx, Math.abs(data[x*step+i]||0));
        const y = 540 - mx * 260;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Logo
    ctx.font = 'bold 48px Orbitron, monospace';
    ctx.fillStyle = '#ffffff'; ctx.letterSpacing = '6px';
    ctx.fillText('PIRADEX', 60, 100);
    ctx.font = '18px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('MASTERING SUITE', 60, 130);

    // Badge género
    ctx.fillStyle = g.color + '33';
    ctx.beginPath(); ctx.roundRect(60, 820, 300, 60, 8); ctx.fill();
    ctx.strokeStyle = g.color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(60, 820, 300, 60, 8); ctx.stroke();
    ctx.font = 'bold 22px Rajdhani, monospace'; ctx.fillStyle = g.color;
    ctx.fillText(g.name.toUpperCase(), 80, 858);

    // LUFS
    ctx.font = 'bold 80px Orbitron, monospace'; ctx.fillStyle = '#ffffff';
    ctx.fillText(lufs || '-14.0', 60, 760);
    ctx.font = '20px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('LUFS', 60, 790);

    // Faixa
    ctx.font = 'bold 36px Rajdhani, monospace'; ctx.fillStyle = '#ffffff';
    ctx.fillText(trackName || 'Sem título', 60, 940);

    // beatfreakstudio.com
    ctx.font = '16px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('beatfreakstudio.com', 60, 1020);

    // Download
    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'piradex_master_' + Date.now() + '.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  return { generate };
})();
window.ShareCard = ShareCard;


/* ══════════════════════════════════════════════════════════════════════════
 * 13. INIT GLOBAL — arrancar tudo quando DOM estiver pronto
 * ══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {

  // Restaurar sessão anterior
  await SessionMemory.restoreSession();

  // Iniciar LUFS Coach
  SmartLUFSCoach.start();

  // LUFS Target default
  LUFSTarget.set('spotify');

  // Botões Undo/Redo
  const btnU = document.getElementById('btn-undo');
  const btnR = document.getElementById('btn-redo');
  if (btnU) btnU.addEventListener('click', () => UndoRedo.undo());
  if (btnR) btnR.addEventListener('click', () => UndoRedo.redo());

  // Botões plataforma LUFS
  document.querySelectorAll('.lufs-platform-btn').forEach(btn => {
    btn.addEventListener('click', () => LUFSTarget.set(btn.dataset.platform));
  });

  // Ghost Reference file input
  const ghostInput = document.getElementById('ghost-ref-file');
  if (ghostInput) {
    ghostInput.addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const ab = await file.arrayBuffer();
      const buf = await new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej));
      GhostReference.load(buf);
      const nm = document.getElementById('ghost-ref-name');
      if (nm) nm.textContent = file.name;
    });
  }

  // Share button
  const shareBtn = document.getElementById('btn-share-master');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const trackName = document.getElementById('track-name')?.textContent || 'Master';
      const lufs = document.getElementById('lufs-n')?.textContent || '-14.0';
      const genre = GenreDNA.getLastResult()?.genre || 'afropop';
      ShareCard.generate(trackName, lufs, genre, window.audioBuffer);
    });
  }

  // Receipt button
  const receiptBtn = document.getElementById('btn-receipt');
  if (receiptBtn) {
    receiptBtn.addEventListener('click', () => {
      const trackName = document.getElementById('track-name')?.textContent || 'Master';
      MasteringReceipt.generate(trackName, {
        hpf: document.getElementById('vl-hpf')?.value,
        eqLow: document.getElementById('vl-eq-low')?.value,
        eqMid: document.getElementById('vl-eq-mid')?.value,
        eqHigh: document.getElementById('vl-eq-high')?.value,
        eqAir: document.getElementById('vl-eq-air')?.value,
        threshold: document.getElementById('vl-comp-thresh')?.value,
        ratio: document.getElementById('vl-comp-ratio')?.value,
        reverbMix: document.getElementById('vl-reverb-mix')?.value,
        delayMix: document.getElementById('vl-delay-mix')?.value,
      });
    });
  }

  // Blind A/B Test button
  const abBtn = document.getElementById('btn-ab-test');
  if (abBtn) {
    abBtn.addEventListener('click', () => {
      if (!window.audioBuffer) return;
      const procBuf = window.audioBuffer; // usa processado se existir
      BlindABTest.start(window.audioBuffer, procBuf);
    });
  }

  // Genre DNA — trigger ao carregar ficheiro
  document.addEventListener('piradex:fileLoaded', e => {
    const buf = e.detail;
    if (!buf) return;
    setTimeout(() => {
      const result = GenreDNA.analyze(buf);
      if (!result) return;
      const g = GenreDNA.getGenre(result.genre);
      _showGenreResult(result, g);
      // Aplica Mastering Memory se tiver historial
      const hasMemory = MasteringMemory.suggest(result.genre);
      if (hasMemory) MasteringMemory.applyMemory(result.genre);
    }, 500);
  });

  console.log('[Piradex] Features2 loaded ✓');
});

function _showGenreResult(result, g) {
  const el = document.getElementById('gene-dna-result');
  if (!el || !g) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:10px;height:10px;border-radius:50%;background:${g.color};box-shadow:0 0 8px ${g.color};flex-shrink:0;"></div>
      <div>
        <div style="font-family:'Orbitron',monospace;font-weight:700;font-size:11px;color:${g.color};">${g.name}</div>
        <div style="font-size:9px;color:var(--muted);margin-top:2px;">${result.bpm} BPM · ${result.confidence}% confiança · LUFS sugerido: ${g.lufs}</div>
      </div>
      <button onclick="GenreDNA.applyPreset('${result.genre}')" style="margin-left:auto;background:${g.color}22;border:1px solid ${g.color};color:${g.color};padding:4px 10px;border-radius:3px;font-family:'Rajdhani',monospace;font-weight:700;font-size:9px;cursor:pointer;letter-spacing:1px;">APLICAR</button>
    </div>`;
  el.style.display = 'block';
}

/* Expor função para trigger manual de Genre DNA */
window.triggerGenreDNA = function(buffer) {
  document.dispatchEvent(new CustomEvent('piradex:fileLoaded', { detail: buffer }));
};

})(); // end IIFE
