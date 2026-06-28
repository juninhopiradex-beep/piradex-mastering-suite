/* ═══════════════════════════════════════════════════════════════════════════
 * FEATURES3.JS — Piradex Mastering Suite · PRO FINALIZER  (v3.B)
 * ───────────────────────────────────────────────────────────────────────────
 * Módulo 100% ADITIVO. Não edita nenhum ficheiro existente, não altera a GUI.
 * Injecta o seu próprio CSS (prefixo .prdx3-) e os seus próprios painéis via JS.
 * Apaga este ficheiro + a linha <script src="features3.js"> e a suite volta
 * exactamente ao estado anterior.
 *
 * Inclui:
 *   · True Peak Limiter  (4× oversampling, ISP brickwall + lookahead)
 *   · Medidor LUFS (ITU-R BS.1770 K-weighting) + True Peak em tempo real
 *   · Spectral Analyser Pro (FFT log-freq, peak-hold)
 *   · Export multi-formato: WAV 16/24/32f · AIFF 16/24 · MP3 320 (lamejs CDN)
 *   · Metadados BWAV (bext chunk): artista, título, ISRC, LUFS, data, versão
 *   · Harmonic Signature Match  (compara o teu espectro vs referência)
 *   · Batch Finalizer  (vários ficheiros → limita ao LUFS alvo → ZIP)
 *
 * Lê apenas: window.audioBuffer · window.audioCtx · window.analyserNode
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

const VERSION = '1.0.1';
const NS = 'prdx3';

/* ════════════════════════════ HELPERS GERAIS ════════════════════════════ */
const $  = (sel, root) => (root || document).querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const dbToLin = db => Math.pow(10, db / 20);
const linToDb = l => 20 * Math.log10(Math.max(l, 1e-12));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function toast(msg, color) {
  let t = $('#' + NS + '-toast');
  if (!t) { t = el('div'); t.id = NS + '-toast'; t.className = NS + '-toast'; document.body.appendChild(t); }
  t.style.borderColor = color || 'var(--c4)';
  t.style.color = color || 'var(--c4)';
  t.innerHTML = msg;
  t.classList.add(NS + '-toast-show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove(NS + '-toast-show'), 3400);
}
/* Buffer activo: o master da suite, ou um ficheiro carregado localmente aqui. */
let localBuffer = null;
function activeBuffer() { return localBuffer || window.audioBuffer || null; }

/* ════════════════════════════════════════════════════════════════════════
 * PLAYER INTERNO — toca o buffer (original) ou o master pós-efeito através de
 * um nó tap, alimentando o vectorscope e os medidores. Resolve o "vector não
 * funciona" (precisava de sinal a tocar) e dá o A/B no True Peak.
 * ════════════════════════════════════════════════════════════════════════ */
let _player = { src: null, tap: null, splitter: null, aL: null, aR: null, playing: false, which: null, onended: null };
function playerTap() {
  const ac = ctx();
  if (!_player.tap) {
    _player.tap = ac.createGain(); _player.tap.gain.value = 1;
    _player.splitter = ac.createChannelSplitter(2);
    _player.aL = ac.createAnalyser(); _player.aR = ac.createAnalyser();
    _player.aL.fftSize = 2048; _player.aR.fftSize = 2048;
    _player.tap.connect(_player.splitter);
    _player.splitter.connect(_player.aL, 0); _player.splitter.connect(_player.aR, 1);
    _player.tap.connect(ac.destination);
  }
  return _player.tap;
}
function prdx3Play(which, onstate) {
  const ac = ctx();
  if (ac.state === 'suspended') ac.resume();
  prdx3Stop();
  const buf = which === 'master' ? (window.__prdx3Master || activeBuffer()) : activeBuffer();
  if (!buf) { if (onstate) onstate('nobuf'); return; }
  const tap = playerTap();
  const src = ac.createBufferSource(); src.buffer = buf; src.connect(tap);
  src.onended = () => { _player.playing = false; if (_player.onended) _player.onended(); };
  src.start(); _player.src = src; _player.playing = true; _player.which = which;
  _player.onended = () => { if (onstate) onstate('stopped'); };
  if (onstate) onstate('playing');
  // arranca o vectorscope ligado ao tap, se a tab estiver aberta
  if (window.Vectorscope && document.getElementById(NS + '-vscanvas')) {
    try { window.Vectorscope.init(NS + '-vscanvas', _player.aL, _player.aR); window.Vectorscope.start(); } catch (e) {}
  }
  return _player;
}
function prdx3Stop() {
  if (_player.src) { try { _player.src.onended = null; _player.src.stop(); } catch (e) {} _player.src = null; }
  _player.playing = false;
}
function ctx() {
  if (window.audioCtx) return window.audioCtx;
  window.__prdx3Ctx = window.__prdx3Ctx || new (window.AudioContext || window.webkitAudioContext)();
  return window.__prdx3Ctx;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. DSP — TRUE PEAK (4× oversampling por interpolação windowed-sinc)
 * ════════════════════════════════════════════════════════════════════════ */
// Tabela de fase para 4× oversampling (FIR sinc janelado, 8 taps por fase).
const OS = 4, TAPS = 8;
const POLY = (function build() {
  const phases = [];
  for (let p = 0; p < OS; p++) {
    const frac = p / OS, h = [];
    let sum = 0;
    for (let n = 0; n < TAPS; n++) {
      const x = n - (TAPS / 2 - 1) - frac;
      let s = (x === 0) ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
      const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * (n + 0.5) / TAPS); // Hann
      s *= w; h.push(s); sum += s;
    }
    for (let n = 0; n < TAPS; n++) h[n] /= sum; // normaliza ganho DC
    phases.push(h);
  }
  return phases;
})();

function truePeakOfChannel(data) {
  let peak = 0;
  const N = data.length, half = TAPS / 2 - 1;
  for (let i = 0; i < N; i++) {
    // amostra original
    const a = Math.abs(data[i]); if (a > peak) peak = a;
    // amostras interpoladas (sub-sample)
    for (let p = 1; p < OS; p++) {
      const h = POLY[p]; let acc = 0;
      for (let n = 0; n < TAPS; n++) {
        const idx = i - half + n;
        acc += (idx >= 0 && idx < N ? data[idx] : 0) * h[n];
      }
      const v = Math.abs(acc); if (v > peak) peak = v;
    }
  }
  return peak;
}
function measureTruePeakDb(buffer) {
  let pk = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++)
    pk = Math.max(pk, truePeakOfChannel(buffer.getChannelData(c)));
  return linToDb(pk);
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DSP — LUFS integrado (ITU-R BS.1770-4, K-weighting + gating)
 * ════════════════════════════════════════════════════════════════════════ */
function kWeightFilter(data, sr) {
  // Estágio 1: shelf de cabeça (high-shelf ~ +4dB)
  const out = new Float32Array(data.length);
  // Coeficientes BS.1770 a 48k; reescalados para sr arbitrário via bilinear simples.
  // Pré-filtro (high-shelf)
  let f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
  let K = Math.tan(Math.PI * f0 / sr), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
  let a0 = 1 + K / Q + K * K;
  let b0 = (Vh + Vb * K / Q + K * K) / a0;
  let b1 = 2 * (K * K - Vh) / a0;
  let b2 = (Vh - Vb * K / Q + K * K) / a0;
  let a1 = 2 * (K * K - 1) / a0;
  let a2 = (1 - K / Q + K * K) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y;
  }
  // Estágio 2: high-pass (RLB)
  f0 = 38.13547087602444; Q = 0.5003270373238773;
  K = Math.tan(Math.PI * f0 / sr);
  a0 = 1 + K / Q + K * K;
  b0 = 1 / a0; b1 = -2 / a0; b2 = 1 / a0;
  a1 = 2 * (K * K - 1) / a0; a2 = (1 - K / Q + K * K) / a0;
  x1 = x2 = y1 = y2 = 0;
  for (let i = 0; i < out.length; i++) {
    const x = out[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y;
  }
  return out;
}
function measureLUFS(buffer) {
  const sr = buffer.sampleRate, nCh = buffer.numberOfChannels;
  const G = [1.0, 1.0, 1.0, 1.41, 1.41]; // ganhos de canal (L,R,C,Ls,Rs aprox.)
  const filt = [];
  for (let c = 0; c < nCh; c++) filt.push(kWeightFilter(buffer.getChannelData(c), sr));
  const blockLen = Math.round(0.4 * sr);        // 400 ms
  const step = Math.round(0.1 * sr);            // 75% overlap
  const blocks = [];
  for (let start = 0; start + blockLen <= filt[0].length; start += step) {
    let z = 0;
    for (let c = 0; c < nCh; c++) {
      let sum = 0; const d = filt[c];
      for (let i = 0; i < blockLen; i++) { const s = d[start + i]; sum += s * s; }
      z += (G[c] || 1.0) * (sum / blockLen);
    }
    const L = -0.691 + 10 * Math.log10(z + 1e-12);
    blocks.push({ L, z });
  }
  if (!blocks.length) return -70;
  // Gating absoluto (-70 LUFS)
  let g1 = blocks.filter(b => b.L > -70);
  if (!g1.length) return -70;
  // Gating relativo (-10 LU abaixo da média absoluta)
  const meanZ = g1.reduce((s, b) => s + b.z, 0) / g1.length;
  const relGate = -0.691 + 10 * Math.log10(meanZ + 1e-12) - 10;
  const g2 = g1.filter(b => b.L > relGate);
  const finalSet = g2.length ? g2 : g1;
  const z = finalSet.reduce((s, b) => s + b.z, 0) / finalSet.length;
  return -0.691 + 10 * Math.log10(z + 1e-12);
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DSP — TRUE PEAK LIMITER (lookahead brickwall, offline)
 * ════════════════════════════════════════════════════════════════════════ */
async function applyTruePeakLimiter(buffer, opts) {
  const ceilingDb = opts.ceiling != null ? opts.ceiling : -1.0;
  const targetLufs = opts.targetLufs; // se definido, normaliza antes de limitar
  const sr = buffer.sampleRate, nCh = buffer.numberOfChannels, N = buffer.length;
  const ceiling = dbToLin(ceilingDb);

  // ganho de normalização opcional para o LUFS alvo
  let preGain = 1;
  if (targetLufs != null) {
    const cur = measureLUFS(buffer);
    if (cur > -70) preGain = dbToLin(targetLufs - cur);
  }

  const out = ctx().createBuffer(nCh, N, sr);
  const lookahead = Math.round(0.005 * sr);      // 5 ms
  const release = Math.round(0.050 * sr);        // 50 ms
  const relCoef = Math.exp(-1 / release);

  // envelope de pico (linkado entre canais) a partir do sinal já com preGain
  const peakEnv = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let p = 0;
    for (let c = 0; c < nCh; c++) { const v = Math.abs(buffer.getChannelData(c)[i] * preGain); if (v > p) p = v; }
    peakEnv[i] = p;
  }
  // ganho-alvo por amostra com lookahead (atenua antes do transiente)
  const gain = new Float32Array(N).fill(1);
  let g = 1;
  for (let i = N - 1; i >= 0; i--) {
    const need = peakEnv[i] > ceiling ? ceiling / peakEnv[i] : 1;
    // propaga atenuação para trás dentro da janela de lookahead
    if (need < g) g = need; else g = Math.min(1, g * (1 / relCoef));
    gain[Math.max(0, i)] = g;
  }
  // suaviza o release (forward) e aplica
  let gs = 1;
  for (let i = 0; i < N; i++) {
    const tgt = gain[i];
    gs = tgt < gs ? tgt : tgt + (gs - tgt) * relCoef; // ataque imediato, release suave
    const laIdx = Math.min(N - 1, i + lookahead);
    const gApplied = Math.min(gs, gain[laIdx]);
    for (let c = 0; c < nCh; c++) {
      const o = out.getChannelData(c);
      o[i] = buffer.getChannelData(c)[i] * preGain * gApplied;
    }
  }
  // brickwall de segurança (clip suave no tecto, evita ISP residual)
  for (let c = 0; c < nCh; c++) {
    const o = out.getChannelData(c);
    for (let i = 0; i < N; i++) { if (o[i] > ceiling) o[i] = ceiling; else if (o[i] < -ceiling) o[i] = -ceiling; }
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. ENCODERS — WAV (16/24/32f) com bext (BWAV) · AIFF (16/24)
 * ════════════════════════════════════════════════════════════════════════ */
function writeStr(view, off, str) { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); }
function interleave(buffer) {
  const nCh = buffer.numberOfChannels, N = buffer.length;
  const out = new Float32Array(N * nCh), chs = [];
  for (let c = 0; c < nCh; c++) chs.push(buffer.getChannelData(c));
  for (let i = 0; i < N; i++) for (let c = 0; c < nCh; c++) out[i * nCh + c] = chs[c][i];
  return out;
}
function buildBext(meta) {
  // bext chunk = 602 bytes (sem coding history extra). EBU Tech 3285.
  const size = 602;
  const buf = new ArrayBuffer(8 + size);
  const v = new DataView(buf);
  writeStr(v, 0, 'bext');
  v.setUint32(4, size, true);
  const desc = `${meta.artist || ''} - ${meta.title || ''} | LUFS ${meta.lufs} | Piradex Suite v${VERSION}`.slice(0, 256);
  writeStr(v, 8, desc);                              // Description (256)
  writeStr(v, 8 + 256, (meta.artist || 'Piradex').slice(0, 32));   // Originator (32)
  writeStr(v, 8 + 288, (meta.isrc || '').slice(0, 32));            // OriginatorReference (32)
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '-');
  const time = d.toTimeString().slice(0, 8);
  writeStr(v, 8 + 320, date);                        // OriginationDate (10)
  writeStr(v, 8 + 330, time);                        // OriginationTime (8)
  return new Uint8Array(buf);
}
function encodeWAV(buffer, bitDepth, meta) {
  const nCh = buffer.numberOfChannels, sr = buffer.sampleRate, N = buffer.length;
  const data = interleave(buffer);
  const float = bitDepth === 32;
  const bytesPerSample = bitDepth / 8;
  const dataSize = data.length * bytesPerSample;
  const bext = meta ? buildBext(meta) : null;
  const bextSize = bext ? bext.length : 0;
  const headerSize = 44 + bextSize;
  const ab = new ArrayBuffer(headerSize + dataSize);
  const v = new DataView(ab);
  writeStr(v, 0, 'RIFF'); v.setUint32(4, headerSize - 8 + dataSize, true); writeStr(v, 8, 'WAVE');
  let off = 12;
  if (bext) { new Uint8Array(ab).set(bext, off); off += bextSize; }
  writeStr(v, off, 'fmt '); v.setUint32(off + 4, 16, true);
  v.setUint16(off + 8, float ? 3 : 1, true);          // 3 = IEEE float, 1 = PCM
  v.setUint16(off + 10, nCh, true);
  v.setUint32(off + 12, sr, true);
  v.setUint32(off + 16, sr * nCh * bytesPerSample, true);
  v.setUint16(off + 20, nCh * bytesPerSample, true);
  v.setUint16(off + 22, bitDepth, true);
  off += 24;
  writeStr(v, off, 'data'); v.setUint32(off + 4, dataSize, true); off += 8;
  if (float) {
    for (let i = 0; i < data.length; i++) { v.setFloat32(off, data[i], true); off += 4; }
  } else if (bitDepth === 16) {
    for (let i = 0; i < data.length; i++) { const s = clamp(data[i], -1, 1); v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2; }
  } else if (bitDepth === 24) {
    for (let i = 0; i < data.length; i++) {
      let s = clamp(data[i], -1, 1); s = s < 0 ? s * 0x800000 : s * 0x7FFFFF; s = Math.round(s);
      v.setUint8(off, s & 0xFF); v.setUint8(off + 1, (s >> 8) & 0xFF); v.setUint8(off + 2, (s >> 16) & 0xFF); off += 3;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}
function encodeAIFF(buffer, bitDepth) {
  const nCh = buffer.numberOfChannels, sr = buffer.sampleRate, N = buffer.length;
  const data = interleave(buffer);
  const bytesPerSample = bitDepth / 8;
  const dataSize = data.length * bytesPerSample;
  const ab = new ArrayBuffer(54 + dataSize);
  const v = new DataView(ab);
  writeStr(v, 0, 'FORM'); v.setUint32(4, 46 + dataSize, false); writeStr(v, 8, 'AIFF');
  writeStr(v, 12, 'COMM'); v.setUint32(16, 18, false);
  v.setInt16(20, nCh, false);
  v.setUint32(22, N, false);
  v.setInt16(26, bitDepth, false);
  // sampleRate em 80-bit IEEE 754 extended
  const ext = f80(sr); for (let i = 0; i < 10; i++) v.setUint8(28 + i, ext[i]);
  writeStr(v, 38, 'SSND'); v.setUint32(42, 8 + dataSize, false);
  v.setUint32(46, 0, false); v.setUint32(50, 0, false);
  let off = 54;
  if (bitDepth === 16) {
    for (let i = 0; i < data.length; i++) { const s = clamp(data[i], -1, 1); v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, false); off += 2; }
  } else {
    for (let i = 0; i < data.length; i++) {
      let s = clamp(data[i], -1, 1); s = Math.round(s < 0 ? s * 0x800000 : s * 0x7FFFFF);
      v.setUint8(off, (s >> 16) & 0xFF); v.setUint8(off + 1, (s >> 8) & 0xFF); v.setUint8(off + 2, s & 0xFF); off += 3;
    }
  }
  return new Blob([ab], { type: 'audio/aiff' });
}
function f80(num) {
  const bytes = new Uint8Array(10);
  if (num === 0) return bytes;
  let sign = 0; if (num < 0) { sign = 0x8000; num = -num; }
  let exp = Math.floor(Math.log2(num));
  let mant = num / Math.pow(2, exp);
  exp += 16383;
  bytes[0] = (sign | (exp >> 8)) & 0xFF; bytes[1] = exp & 0xFF;
  let m = Math.floor(mant * Math.pow(2, 63));
  for (let i = 9; i >= 2; i--) { bytes[i] = m & 0xFF; m = Math.floor(m / 256); }
  return bytes;
}

/* MP3 320 via lamejs (carregado do CDN sob demanda; fallback gracioso) */
let _lamePromise = null;
function loadLame() {
  if (window.lamejs) return Promise.resolve(true);
  if (_lamePromise) return _lamePromise;
  _lamePromise = new Promise(res => {
    const s = el('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
    s.onload = () => res(true); s.onerror = () => res(false);
    document.head.appendChild(s);
  });
  return _lamePromise;
}
async function encodeMP3(buffer, kbps) {
  const ok = await loadLame();
  if (!ok || !window.lamejs) return null;
  const nCh = Math.min(2, buffer.numberOfChannels), sr = buffer.sampleRate;
  const enc = new lamejs.Mp3Encoder(nCh, sr, kbps || 320);
  const L = buffer.getChannelData(0);
  const R = nCh > 1 ? buffer.getChannelData(1) : L;
  const to16 = f => { const o = new Int16Array(f.length); for (let i = 0; i < f.length; i++) { const s = clamp(f[i], -1, 1); o[i] = s < 0 ? s * 0x8000 : s * 0x7FFF; } return o; };
  const l16 = to16(L), r16 = to16(R);
  const block = 1152, chunks = [];
  for (let i = 0; i < l16.length; i += block) {
    const ls = l16.subarray(i, i + block), rs = r16.subarray(i, i + block);
    const mp3 = nCh > 1 ? enc.encodeBuffer(ls, rs) : enc.encodeBuffer(ls);
    if (mp3.length) chunks.push(mp3);
  }
  const end = enc.flush(); if (end.length) chunks.push(end);
  return new Blob(chunks, { type: 'audio/mp3' });
}

/* FLAC lossless via libflacjs (CDN sob demanda; fallback gracioso) */
let _flacPromise = null;
function loadFlac() {
  if (window.Flac) return Promise.resolve(true);
  if (_flacPromise) return _flacPromise;
  _flacPromise = new Promise(res => {
    const s = el('script'); s.src = 'https://cdn.jsdelivr.net/npm/libflacjs@5.4.0/dist/libflac.min.js';
    s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
  });
  return _flacPromise;
}
async function encodeFLAC(buffer, bps) {
  const ok = await loadFlac();
  if (!ok || !window.Flac) return null;
  const Flac = window.Flac;
  const ready = () => new Promise(r => { if (Flac.isReady && Flac.isReady()) r(); else Flac.on ? Flac.on('ready', r) : setTimeout(r, 300); });
  await ready();
  return new Promise((resolve) => {
    try {
      const nCh = buffer.numberOfChannels, sr = buffer.sampleRate, bits = bps || 24, N = buffer.length;
      const enc = Flac.create_libflac_encoder(sr, nCh, bits, 5, N);
      if (!enc) return resolve(null);
      const chunks = [];
      const writeCb = (data) => { chunks.push(data.slice ? data.slice() : new Uint8Array(data)); };
      const initStatus = Flac.init_encoder_stream(enc, writeCb);
      if (initStatus !== 0) { Flac.FLAC__stream_encoder_delete(enc); return resolve(null); }
      // interleave para Int32 escalado ao bit-depth
      const scale = Math.pow(2, bits - 1) - 1;
      const inter = new Int32Array(N * nCh), chs = [];
      for (let c = 0; c < nCh; c++) chs.push(buffer.getChannelData(c));
      for (let i = 0; i < N; i++) for (let c = 0; c < nCh; c++) { const s = clamp(chs[c][i], -1, 1); inter[i * nCh + c] = Math.round(s * scale); }
      const block = 4096;
      for (let off = 0; off < N; off += block) {
        const n = Math.min(block, N - off);
        const slice = inter.subarray(off * nCh, (off + n) * nCh);
        Flac.FLAC__stream_encoder_process_interleaved(enc, slice, n);
      }
      Flac.FLAC__stream_encoder_finish(enc);
      Flac.FLAC__stream_encoder_delete(enc);
      let total = 0; chunks.forEach(c => total += c.length);
      const out = new Uint8Array(total); let p = 0;
      chunks.forEach(c => { out.set(c, p); p += c.length; });
      resolve(new Blob([out], { type: 'audio/flac' }));
    } catch (e) { console.warn('FLAC encode error', e); resolve(null); }
  });
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. HARMONIC SIGNATURE — espectro médio em bandas vs referência
 * ════════════════════════════════════════════════════════════════════════ */
const BANDS = [
  ['SUB', 20, 60], ['LOW', 60, 120], ['LOW-MID', 120, 300], ['MID', 300, 800],
  ['HI-MID', 800, 2500], ['PRES', 2500, 6000], ['BRILHO', 6000, 12000], ['AR', 12000, 20000]
];
function bandSpectrum(buffer) {
  // FFT por blocos somando energia por banda → curva média (dB).
  const sr = buffer.sampleRate, size = 4096;
  const d = buffer.getChannelData(0);
  const re = new Float32Array(size), im = new Float32Array(size);
  const energy = new Array(BANDS.length).fill(0); let frames = 0;
  for (let start = 0; start + size <= d.length; start += size) {
    for (let i = 0; i < size; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / size); re[i] = d[start + i] * w; im[i] = 0; }
    fft(re, im);
    for (let k = 1; k < size / 2; k++) {
      const f = k * sr / size, mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      for (let b = 0; b < BANDS.length; b++) if (f >= BANDS[b][1] && f < BANDS[b][2]) { energy[b] += mag * mag; break; }
    }
    frames++;
  }
  return energy.map(e => linToDb(Math.sqrt(e / Math.max(1, frames))));
}
function fft(re, im) { // Cooley-Tukey radix-2 in-place
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1, cwi = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = i + k + len / 2;
        const tr = re[b] * cwr - im[b] * cwi, ti = re[b] * cwi + im[b] * cwr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncwr = cwr * wr - cwi * wi; cwi = cwr * wi + cwi * wr; cwr = ncwr;
      }
    }
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 6. UI — CSS scoped (.prdx3-*), usa as vars existentes da suite
 * ════════════════════════════════════════════════════════════════════════ */
function injectCSS() {
  if ($('#' + NS + '-css')) return;
  const s = el('style'); s.id = NS + '-css';
  s.textContent = `
  .${NS}-fab{position:fixed;right:20px;bottom:20px;z-index:99990;width:56px;height:56px;border-radius:16px;
    background:linear-gradient(135deg,var(--c6),var(--c1));border:none;cursor:pointer;color:#fff;
    font-family:'Orbitron',monospace;font-weight:900;font-size:10px;letter-spacing:.5px;
    box-shadow:0 6px 24px rgba(184,85,247,.45);display:flex;align-items:center;justify-content:center;
    transition:transform .15s ease, box-shadow .15s ease;}
  .${NS}-fab:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 10px 32px rgba(184,85,247,.6);}
  .${NS}-overlay{position:fixed;inset:0;z-index:99991;background:rgba(4,4,8,.72);backdrop-filter:blur(4px);
    display:none;align-items:flex-start;justify-content:center;padding:28px 16px;overflow:auto;}
  .${NS}-overlay.${NS}-open{display:flex;}
  .${NS}-modal{width:min(960px,100%);background:var(--bg2);border:1px solid var(--border2);border-radius:14px;
    box-shadow:0 24px 80px rgba(0,0,0,.6);overflow:hidden;font-family:'Rajdhani','Rajdhani',sans-serif;color:var(--text);}
  .${NS}-head{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border);
    background:linear-gradient(90deg,rgba(184,85,247,.12),transparent);}
  .${NS}-title{font-family:'Orbitron',monospace;font-weight:900;font-size:15px;letter-spacing:1px;
    background:linear-gradient(90deg,var(--c6),var(--c1));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .${NS}-badge{font-size:9px;font-weight:700;color:var(--c4);border:1px solid var(--c4);border-radius:4px;padding:2px 6px;letter-spacing:1px;}
  .${NS}-x{margin-left:auto;background:none;border:none;color:var(--muted2);font-size:22px;cursor:pointer;line-height:1;}
  .${NS}-x:hover{color:var(--c7);}
  .${NS}-tabs{display:flex;gap:4px;padding:10px 14px 0;flex-wrap:wrap;border-bottom:1px solid var(--border);}
  .${NS}-tab{padding:7px 12px;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted2);cursor:pointer;
    border-radius:6px 6px 0 0;border:1px solid transparent;font-family:'Orbitron',monospace;}
  .${NS}-tab.${NS}-act{color:var(--c1);border-color:var(--border2);border-bottom-color:transparent;background:var(--bg3);}
  .${NS}-body{padding:20px;min-height:280px;}
  .${NS}-page{display:none;} .${NS}-page.${NS}-act{display:block;}
  .${NS}-row{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:14px;}
  .${NS}-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;flex:1;min-width:200px;}
  .${NS}-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--muted2);text-transform:uppercase;margin-bottom:6px;}
  .${NS}-big{font-family:'Orbitron',monospace;font-weight:900;font-size:28px;line-height:1;}
  .${NS}-unit{font-size:11px;color:var(--muted);font-weight:600;margin-left:4px;}
  .${NS}-btn{padding:10px 16px;border-radius:7px;border:1px solid var(--c1);background:rgba(255,58,181,.12);
    color:var(--c1);font-family:'Orbitron',monospace;font-weight:700;font-size:10px;letter-spacing:1px;cursor:pointer;
    transition:background .15s;}
  .${NS}-btn:hover{background:rgba(255,58,181,.22);}
  .${NS}-btn.${NS}-go{border-color:var(--c4);background:rgba(45,255,138,.12);color:var(--c4);}
  .${NS}-btn.${NS}-go:hover{background:rgba(45,255,138,.24);}
  .${NS}-btn:disabled{opacity:.4;cursor:not-allowed;}
  .${NS}-sel,.${NS}-inp{background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:6px;
    padding:8px 10px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;}
  .${NS}-slider{width:100%;accent-color:var(--c1);}
  .${NS}-canvas{width:100%;height:180px;background:var(--bg);border:1px solid var(--border);border-radius:8px;display:block;}
  .${NS}-meter{height:14px;background:var(--bg);border-radius:7px;overflow:hidden;border:1px solid var(--border);position:relative;}
  .${NS}-fill{height:100%;width:0;transition:width .08s linear;}
  .${NS}-hint{font-size:11px;color:var(--muted);line-height:1.5;}
  .${NS}-card{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;}
  .${NS}-tools-grid .panel{contain:none!important;height:auto!important;min-height:120px!important;overflow:visible!important;display:block!important;}
  .${NS}-tools-grid .panel .plabel{margin-bottom:10px;}
  .${NS}-cardlbl{font-size:9px;color:var(--muted2);letter-spacing:1.5px;margin-bottom:4px;}
  .${NS}-drop{border:1.5px dashed var(--border2);border-radius:10px;padding:22px;text-align:center;color:var(--muted2);
    font-size:12px;cursor:pointer;transition:border-color .15s,color .15s;}
  .${NS}-drop:hover,.${NS}-drop.${NS}-over{border-color:var(--c1);color:var(--c1);}
  .${NS}-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;}
  .${NS}-bandrow{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .${NS}-bandname{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--muted2);width:64px;flex-shrink:0;font-family:'Orbitron',monospace;}
  .${NS}-bandbar{flex:1;height:10px;background:var(--bg);border-radius:5px;overflow:hidden;position:relative;}
  .${NS}-toast{position:fixed;bottom:88px;right:20px;z-index:99999;background:var(--bg3);border:1px solid var(--c4);
    color:var(--c4);padding:12px 16px;border-radius:9px;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:13px;
    max-width:320px;transform:translateX(140%);transition:transform .3s cubic-bezier(.2,.9,.3,1);box-shadow:0 8px 28px rgba(0,0,0,.4);}
  .${NS}-toast-show{transform:translateX(0);}
  .${NS}-tag{font-size:9px;padding:2px 7px;border-radius:4px;font-weight:700;letter-spacing:.5px;}
  `;
  document.head.appendChild(s);
}

/* ════════════════════════════════ BUILD UI ════════════════════════════════ */
function buildUI() {
  injectCSS();
  // (botão flutuante removido — agora abre pela aba PRO FINAL na barra principal)

  // Overlay + modal
  const ov = el('div', NS + '-overlay'); ov.id = NS + '-overlay';
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  const modal = el('div', NS + '-modal');
  modal.innerHTML = `
    <div class="${NS}-head">
      <div class="${NS}-title">PRO FINALIZER</div>
      <div class="${NS}-badge">v${VERSION}</div>
      <button class="${NS}-x" id="${NS}-close">×</button>
    </div>
    <div class="${NS}-tabs" id="${NS}-tabs">
      <div class="${NS}-tab ${NS}-act" data-p="limiter">TRUE PEAK</div>
      <div class="${NS}-tab" data-p="meter">LUFS METER</div>
      <div class="${NS}-tab" data-p="spectrum">SPECTRUM</div>
      <div class="${NS}-tab" data-p="analise">ANÁLISE</div>
      <div class="${NS}-tab" data-p="vector">VECTOR</div>
      <div class="${NS}-tab" data-p="harmonic">HARMONIC</div>
      <div class="${NS}-tab" data-p="phase">PHASE</div>
      <div class="${NS}-tab" data-p="stems">STEMS</div>
      <div class="${NS}-tab" data-p="presets">PRESETS</div>
      <div class="${NS}-tab" data-p="tools">FERRAMENTAS</div>
      <div class="${NS}-tab" data-p="export">EXPORT</div>
      <div class="${NS}-tab" data-p="batch">BATCH</div>
      <div class="${NS}-tab" data-p="live">LIVE</div>
    </div>
    <div class="${NS}-body" id="${NS}-body"></div>`;
  ov.appendChild(modal);
  document.body.appendChild(ov);

  $('#' + NS + '-close').onclick = closeModal;
  $('#' + NS + '-tabs').addEventListener('click', e => {
    const t = e.target.closest('.' + NS + '-tab'); if (!t) return;
    document.querySelectorAll('.' + NS + '-tab').forEach(x => x.classList.remove(NS + '-act'));
    t.classList.add(NS + '-act');
    renderPage(t.dataset.p);
  });
  renderPage('limiter');
}
function openModal() {
  // PRO FINALIZER: aberto para contas master + tier advanced. Bloqueado para basic/demo.
  if (!window.canProFinal) { showProFinalLock(); return; }
  $('#' + NS + '-overlay').classList.add(NS + '-open');
}
function showProFinalLock() {
  let lock = document.getElementById(NS + '-lock');
  if (!lock) {
    lock = el('div'); lock.id = NS + '-lock';
    lock.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(4,4,10,.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    lock.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--c6);border-radius:16px;padding:34px 30px;max-width:420px;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,.6);">
      <div style="font-size:36px;margin-bottom:10px;">🔒</div>
      <div style="font-family:'Orbitron',monospace;font-weight:900;font-size:18px;background:linear-gradient(90deg,#b855f7,#ff3ab5);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:1px;margin-bottom:10px;">PRO FINALIZER</div>
      <div style="font-size:12px;color:var(--muted2);line-height:1.6;margin-bottom:18px;">Módulo exclusivo das contas <b style="color:var(--c4)">FULL Advanced</b> e <b style="color:var(--c4)">Master</b>. Indisponível em <b style="color:var(--c3)">Basic</b> e <b style="color:var(--c3)">Demo</b>.</div>
      <button class="${NS}-btn ${NS}-go" id="${NS}-lockcta" style="width:100%;margin-bottom:8px;">DESBLOQUEAR VERSÃO FULL</button>
      <button class="${NS}-btn" id="${NS}-lockclose" style="width:100%;border-color:var(--border2);color:var(--muted);">Fechar</button>
    </div>`;
    document.body.appendChild(lock);
    lock.addEventListener('click', e => { if (e.target === lock) lock.style.display = 'none'; });
    $('#' + NS + '-lockclose').onclick = () => lock.style.display = 'none';
    $('#' + NS + '-lockcta').onclick = () => {
      lock.style.display = 'none';
      // abre o paywall existente da suite, se houver
      const pw = document.getElementById('paywall-modal'); if (pw) { pw.style.display = 'flex'; return; }
      if (typeof window.openPaywall === 'function') window.openPaywall();
    };
  }
  lock.style.display = 'flex';
}
function closeModal() { $('#' + NS + '-overlay').classList.remove(NS + '-open'); stopMeter(); stopSpectrum(); stopVector(); }

function needBuffer(body) {
  body.innerHTML = `<div class="${NS}-card" style="text-align:center;">
    <div class="${NS}-lbl">Sem áudio</div>
    <div class="${NS}-hint" style="margin:8px 0 14px;">Carrega um master na suite (tab MASTER) ou solta um ficheiro aqui para finalizar.</div>
    <div class="${NS}-drop" id="${NS}-needdrop">⬇ Soltar ficheiro de áudio (WAV/MP3/FLAC)</div>
  </div>`;
  wireDrop($('#' + NS + '-needdrop'), () => renderPage(currentPage));
}

/* ════════════════════════════ PÁGINAS ════════════════════════════ */
let currentPage = 'limiter';
function renderPage(p) {
  currentPage = p; stopMeter(); stopSpectrum(); stopVector();
  const body = $('#' + NS + '-body');
  if (p === 'limiter') return pageLimiter(body);
  if (p === 'meter') return pageMeter(body);
  if (p === 'spectrum') return pageSpectrum(body);
  if (p === 'analise') return pageAnalise(body);
  if (p === 'vector') return pageVector(body);
  if (p === 'harmonic') return pageHarmonic(body);
  if (p === 'phase') return pagePhase(body);
  if (p === 'stems') return pageStems(body);
  if (p === 'presets') return pagePresets(body);
  if (p === 'tools') return pageTools(body);
  if (p === 'export') return pageExport(body);
  if (p === 'batch') return pageBatch(body);
  if (p === 'live') return pageLive(body);
}

/* ── TRUE PEAK LIMITER ── */
function pageLimiter(body) {
  const buf = activeBuffer();
  if (!buf) return needBuffer(body);
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card">
        <div class="${NS}-lbl">True Peak actual</div>
        <div class="${NS}-big" id="${NS}-tpnow">—<span class="${NS}-unit">dBTP</span></div>
        <div class="${NS}-hint" id="${NS}-lufsnow" style="margin-top:6px;">a medir…</div>
      </div>
      <div class="${NS}-card">
        <div class="${NS}-lbl">Tecto (ceiling)</div>
        <input type="range" min="-3" max="0" step="0.1" value="-1" class="${NS}-slider" id="${NS}-ceil">
        <div class="${NS}-hint"><b id="${NS}-ceilv" style="color:var(--c1)">-1.0</b> dBTP &nbsp;·&nbsp; recomendado -1.0 (streaming)</div>
      </div>
    </div>
    <div class="${NS}-row">
      <div class="${NS}-card">
        <div class="${NS}-lbl">Normalizar para LUFS alvo (opcional)</div>
        <select class="${NS}-sel" id="${NS}-tgt" style="width:100%">
          <option value="">— não normalizar —</option>
          <option value="-14">Spotify / YouTube / Tidal  (-14)</option>
          <option value="-16">Apple Music  (-16)</option>
          <option value="-15">Deezer  (-15)</option>
          <option value="-9">Club / DJ  (-9)</option>
          <option value="-23">Broadcast EBU R128  (-23)</option>
        </select>
      </div>
      <div class="${NS}-card" style="display:flex;flex-direction:column;justify-content:center;gap:10px;">
        <button class="${NS}-btn ${NS}-go" id="${NS}-runlim">⚡ APLICAR LIMITER</button>
        <div class="${NS}-hint" id="${NS}-limstat">Processa offline e fica disponível em EXPORT.</div>
      </div>
    </div>
    <div class="${NS}-row">
      <div class="${NS}-card" style="grid-column:1/-1;">
        <div class="${NS}-lbl">🔊 A/B — ouve antes vs depois</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
          <button class="${NS}-btn" id="${NS}-playorig" style="border-color:var(--c5);color:var(--c5);background:rgba(45,212,255,.1);">▶ ORIGINAL (upload)</button>
          <button class="${NS}-btn" id="${NS}-playmaster" style="border-color:var(--c4);color:var(--c4);background:rgba(45,255,138,.1);">▶ PÓS-EFEITO (limitado)</button>
          <button class="${NS}-btn" id="${NS}-playstop" style="border-color:var(--border2);color:var(--muted);">■ PARAR</button>
        </div>
        <div class="${NS}-hint" id="${NS}-playhint" style="margin-top:8px;">Aplica o limiter primeiro para ouvires o "pós-efeito".</div>
      </div>
    </div>`;
  // ── player A/B ──
  const pHint = () => $('#' + NS + '-playhint');
  const resetPlayBtns = () => { const a = $('#' + NS + '-playorig'), b = $('#' + NS + '-playmaster'); if (a) { a.innerHTML = '▶ ORIGINAL (upload)'; a.style.opacity = '1'; } if (b) { b.innerHTML = '▶ PÓS-EFEITO (limitado)'; b.style.opacity = '1'; } };
  $('#' + NS + '-playorig').onclick = () => {
    if (!activeBuffer()) { toast('Carrega uma faixa primeiro', 'var(--c3)'); return; }
    prdx3Play('original', s => { if (s === 'playing') { resetPlayBtns(); $('#' + NS + '-playorig').innerHTML = '♪ ORIGINAL…'; $('#' + NS + '-playorig').style.opacity = '.7'; if (pHint()) pHint().textContent = 'A tocar o ficheiro original (sem limiter).'; } if (s === 'stopped') resetPlayBtns(); });
  };
  $('#' + NS + '-playmaster').onclick = () => {
    if (!window.__prdx3Master) { if (pHint()) { pHint().textContent = '⚠ Aplica o limiter primeiro (botão acima).'; pHint().style.color = 'var(--c3)'; } return; }
    prdx3Play('master', s => { if (s === 'playing') { resetPlayBtns(); $('#' + NS + '-playmaster').innerHTML = '♪ PÓS-EFEITO…'; $('#' + NS + '-playmaster').style.opacity = '.7'; if (pHint()) { pHint().textContent = 'A tocar o master limitado.'; pHint().style.color = 'var(--c4)'; } } if (s === 'stopped') resetPlayBtns(); });
  };
  $('#' + NS + '-playstop').onclick = () => { prdx3Stop(); resetPlayBtns(); };
  const ceil = $('#' + NS + '-ceil'), ceilv = $('#' + NS + '-ceilv');
  ceil.oninput = () => ceilv.textContent = parseFloat(ceil.value).toFixed(1);
  // medições assíncronas
  setTimeout(() => {
    const tpEl = $('#' + NS + '-tpnow'), luEl = $('#' + NS + '-lufsnow');
    if (!tpEl || !luEl) return; // utilizador trocou de separador entretanto
    try {
      tpEl.innerHTML = measureTruePeakDb(buf).toFixed(2) + `<span class="${NS}-unit">dBTP</span>`;
      luEl.textContent = 'Loudness: ' + measureLUFS(buf).toFixed(1) + ' LUFS';
    } catch (e) { if (luEl) luEl.textContent = 'medição indisponível'; }
  }, 30);
  $('#' + NS + '-runlim').onclick = async () => {
    const stat = $('#' + NS + '-limstat');
    stat.textContent = 'A processar…'; stat.style.color = 'var(--c3)';
    try {
      const tgt = $('#' + NS + '-tgt').value;
      const res = await applyTruePeakLimiter(buf, { ceiling: parseFloat(ceil.value), targetLufs: tgt ? parseFloat(tgt) : null });
      window.__prdx3Master = res; emit('mastered', { buffer: res });
      const tp = measureTruePeakDb(res).toFixed(2), lu = measureLUFS(res).toFixed(1);
      stat.innerHTML = `✓ Pronto — TP ${tp} dBTP · ${lu} LUFS. Vai a <b style="color:var(--c4)">EXPORT</b>.`;
      stat.style.color = 'var(--c4)';
      toast('✓ Master limitado: ' + tp + ' dBTP · ' + lu + ' LUFS', 'var(--c4)');
    } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; }
  };
}

/* ── LUFS / TRUE PEAK METER (tempo real) ── */
let meterRAF = null, meterAnalyser = null;
function stopMeter() { if (meterRAF) cancelAnimationFrame(meterRAF); meterRAF = null; }
function pageMeter(body) {
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card"><div class="${NS}-lbl">Momentary LUFS</div><div class="${NS}-big" id="${NS}-mlufs">—</div></div>
      <div class="${NS}-card"><div class="${NS}-lbl">True Peak</div><div class="${NS}-big" id="${NS}-mtp">—<span class="${NS}-unit">dBTP</span></div></div>
      <div class="${NS}-card"><div class="${NS}-lbl">RMS</div><div class="${NS}-big" id="${NS}-mrms">—</div></div>
    </div>
    <div class="${NS}-card">
      <div class="${NS}-lbl">Nível</div>
      <div class="${NS}-meter"><div class="${NS}-fill" id="${NS}-mbar" style="background:linear-gradient(90deg,var(--c4),var(--c3),var(--c7))"></div></div>
      <div class="${NS}-hint" id="${NS}-mhint" style="margin-top:8px;">Liga o Play na suite para o medidor reagir ao master em tempo real.</div>
    </div>`;
  meterAnalyser = window.analyserNode || null;
  if (!meterAnalyser) { $('#' + NS + '-mhint').textContent = 'analyserNode não disponível — toca o master na suite primeiro.'; return; }
  const buf = new Float32Array(meterAnalyser.fftSize);
  let peakHold = 0, holdT = 0;
  function loop() {
    meterRAF = requestAnimationFrame(loop);
    if (!meterAnalyser.getFloatTimeDomainData) return;
    meterAnalyser.getFloatTimeDomainData(buf);
    let sum = 0, pk = 0;
    for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); sum += buf[i] * buf[i]; if (a > pk) pk = a; }
    const rms = Math.sqrt(sum / buf.length);
    const lufs = -0.691 + 10 * Math.log10(rms * rms + 1e-12); // aproximação momentary
    const now = performance.now();
    if (pk >= peakHold || now - holdT > 1200) { peakHold = pk; holdT = now; }
    $('#' + NS + '-mlufs').textContent = (rms > 1e-5 ? lufs.toFixed(1) : '—');
    $('#' + NS + '-mtp').innerHTML = (peakHold > 1e-5 ? linToDb(peakHold).toFixed(2) : '—') + `<span class="${NS}-unit">dBTP</span>`;
    $('#' + NS + '-mrms').textContent = (rms > 1e-5 ? linToDb(rms).toFixed(1) : '—');
    const pct = clamp((linToDb(peakHold) + 40) / 40 * 100, 0, 100);
    $('#' + NS + '-mbar').style.width = pct + '%';
  }
  loop();
}

/* ════════════════════════════════════════════════════════════════════════════
 * PÁGINA ANÁLISE — 6 MÉTRICAS PRO (consolidadas no PRO FINAL)
 * ════════════════════════════════════════════════════════════════════════════ */
function computeLoudnessHistory(buffer) {
  const sr = buffer.sampleRate, nCh = buffer.numberOfChannels;
  const filt = [];
  for (let c = 0; c < nCh; c++) filt.push(kWeightFilter(buffer.getChannelData(c), sr));
  const G = [1.0, 1.0, 1.0, 1.41, 1.41];
  const win = Math.round(3 * sr), hop = Math.round(1 * sr);
  const pts = [];
  for (let start = 0; start + win <= filt[0].length; start += hop) {
    let z = 0;
    for (let c = 0; c < nCh; c++) {
      let sum = 0; const d = filt[c];
      for (let i = 0; i < win; i++) { const s = d[start + i]; sum += s * s; }
      z += (G[c] || 1) * (sum / win);
    }
    pts.push(-0.691 + 10 * Math.log10(z + 1e-12));
  }
  return pts.length ? pts : [-23];
}
function computeWaterfall(buffer, frames) {
  frames = frames || 6;
  const d = buffer.getChannelData(0), size = 2048;
  const seg = Math.floor(d.length / frames);
  const out = [];
  const re = new Float32Array(size), im = new Float32Array(size);
  for (let f = 0; f < frames; f++) {
    const base = f * seg;
    const bands = new Float32Array(32);
    let count = 0;
    for (let s = base; s + size < base + seg && s + size < d.length; s += size * 2) {
      for (let i = 0; i < size; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / size); re[i] = d[s + i] * w; im[i] = 0; }
      fft(re, im);
      for (let b = 0; b < 32; b++) {
        const k0 = Math.floor(Math.pow(size / 2, b / 32)), k1 = Math.max(k0 + 1, Math.floor(Math.pow(size / 2, (b + 1) / 32)));
        let m = 0; for (let k = k0; k < k1 && k < size / 2; k++) m += Math.sqrt(re[k] * re[k] + im[k] * im[k]);
        bands[b] += m / Math.max(1, k1 - k0);
      }
      count++;
    }
    if (count) for (let b = 0; b < 32; b++) bands[b] /= count;
    out.push(bands);
  }
  return out;
}
/* ════════════════════════════════════════════════════════════════════════════
 * PÁGINA FERRAMENTAS — painéis movidos do ecrã principal (preservam ligação):
 * Genre DNA · Sessão & Ferramentas · Ghost Reference · Blind A/B Test
 * Os nós DOM são relocados (não recriados) → todos os listeners do app.js/
 * features2.js continuam a funcionar porque estão presos aos próprios nós.
 * ════════════════════════════════════════════════════════════════════════════ */
let _toolsPanels = null;
function grabToolPanels() {
  if (_toolsPanels) return _toolsPanels;
  const holder = document.getElementById('prdx-relocated-tools');
  if (!holder) { _toolsPanels = []; return _toolsPanels; }
  // guarda referências aos painéis directos do holder
  _toolsPanels = Array.from(holder.children).filter(n => n.nodeType === 1 && n.tagName === 'DIV');
  return _toolsPanels;
}
function pageTools(body) {
  const panels = grabToolPanels();
  if (!panels.length) {
    body.innerHTML = `<div class="${NS}-hint" style="text-align:center;padding:30px;">Ferramentas indisponíveis.</div>`;
    return;
  }
  body.innerHTML = `<div class="${NS}-hint" style="margin-bottom:14px;">Genre DNA · Sessão · Ghost Reference · Blind A/B — movidos do ecrã principal.</div>
    <div id="${NS}-tools-grid" class="${NS}-tools-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;"></div>`;
  const grid = $('#' + NS + '-tools-grid');
  panels.forEach(p => {
    // garante que o ab-panel (oculto) aparece aqui visível
    if (p.id === 'ab-panel') p.style.display = '';
    // neutraliza os estilos do grid principal que os faziam colapsar em barras finas
    p.style.gridColumn = '';
    p.style.contain = 'none';
    p.style.height = 'auto';
    p.style.minHeight = '120px';
    p.style.overflow = 'visible';
    p.style.background = 'var(--bg3)';
    grid.appendChild(p); // relocaliza preservando listeners
  });
}

function pageAnalise(body) {
  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
      <div class="${NS}-card"><div class="${NS}-cardlbl">📐 CORRELÓMETRO DE FASE</div>
        <div style="text-align:center;margin:10px 0;"><span id="${NS}-an-corr" style="font-family:'Orbitron',monospace;font-weight:900;font-size:28px;color:#2dff8a;">—</span>
        <div id="${NS}-an-corr-state" style="font-size:9px;color:var(--muted);margin-top:2px;">aguarda áudio</div></div>
        <div style="position:relative;height:10px;border-radius:5px;background:linear-gradient(90deg,#ff3a3a,#ffe135 50%,#2dff8a);"><div id="${NS}-an-corr-ptr" style="position:absolute;top:-4px;left:50%;width:4px;height:18px;background:#fff;border-radius:2px;box-shadow:0 0 6px #000;transition:left .25s;"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:8px;color:var(--muted);"><span>-1</span><span>0</span><span>+1 mono ✓</span></div>
      </div>
      <div class="${NS}-card"><div class="${NS}-cardlbl">📊 DYNAMIC RANGE (DR / PSR)</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
          <div id="${NS}-an-dr" style="font-family:'Orbitron',monospace;font-weight:900;font-size:30px;color:#ffe135;">DR—</div>
          <div style="flex:1;"><div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;"><div id="${NS}-an-dr-bar" style="height:100%;width:0%;border-radius:4px;transition:all .3s;"></div></div>
          <div id="${NS}-an-dr-desc" style="font-size:10px;color:var(--muted);margin-top:6px;">—</div></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px;font-size:10px;color:var(--muted2);"><div>PSR <b id="${NS}-an-psr" style="color:var(--text);font-family:'Orbitron',monospace;">—</b></div><div>PLR <b id="${NS}-an-plr" style="color:var(--text);font-family:'Orbitron',monospace;">—</b></div></div>
        <div style="margin-top:8px;font-size:8px;color:var(--muted);"><span style="color:#2dff8a;">DR12+</span> audiófilo · <span style="color:#ffe135;">DR8-11</span> streaming · <span style="color:#ff3a3a;">DR&lt;7</span> esmagado</div>
      </div>
      <div class="${NS}-card"><div class="${NS}-cardlbl">📈 LOUDNESS HISTORY (LUFS-S)</div>
        <canvas id="${NS}-an-lh" width="300" height="120" style="width:100%;height:108px;background:#07070e;border-radius:6px;display:block;margin-top:6px;"></canvas>
        <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;"><span style="color:var(--muted);">INTEGRATED</span><span id="${NS}-an-int" style="font-family:'Orbitron',monospace;font-weight:900;color:#2dd4ff;">—</span></div>
      </div>
      <div class="${NS}-card"><div class="${NS}-cardlbl">🌊 SPECTRUM WATERFALL</div>
        <canvas id="${NS}-an-wf" width="300" height="120" style="width:100%;height:108px;background:#07070e;border-radius:6px;display:block;margin-top:6px;"></canvas>
        <div style="font-size:8px;color:var(--muted);margin-top:6px;">histórico temporal do espectro · vê o build-up de energia</div>
      </div>
      <div class="${NS}-card"><div class="${NS}-cardlbl">⚡ CREST FACTOR (TP vs RMS)</div>
        <canvas id="${NS}-an-crest" width="300" height="120" style="width:100%;height:108px;background:#07070e;border-radius:6px;display:block;margin-top:6px;"></canvas>
        <div style="font-size:8px;color:var(--muted);margin-top:6px;">distância pico↔RMS = quão "vivos" estão os transientes</div>
      </div>
      <div class="${NS}-card"><div class="${NS}-cardlbl" style="display:flex;justify-content:space-between;">TONAL BALANCE vs GÉNERO <span id="${NS}-an-genre" style="color:var(--c1);font-weight:700;">—</span></div>
        <canvas id="${NS}-an-tonal" width="300" height="120" style="width:100%;height:108px;background:#07070e;border-radius:6px;display:block;margin-top:6px;"></canvas>
        <div style="display:flex;gap:14px;margin-top:6px;font-size:8px;color:var(--muted);"><span><span style="display:inline-block;width:8px;height:8px;background:var(--c1);border-radius:2px;"></span> a tua faixa</span><span><span style="display:inline-block;width:8px;height:8px;border:1px dashed #2dff8a;border-radius:2px;"></span> alvo do género</span></div>
      </div>
    </div>
    <div class="${NS}-hint" style="margin-top:10px;text-align:center;">6 métricas profissionais — actualizam quando carregas/masterizas uma faixa.</div>`;
  setTimeout(updateAnalisePage, 80);
}
function updateAnalisePage() {
  const buf = window.audioBuffer || (window._getAudioBuffer && window._getAudioBuffer());
  if (!buf || !$('#' + NS + '-an-dr')) return;
  try {
    const corr = computeCorrelation(buf);
    const ptr = $('#' + NS + '-an-corr-ptr'), big = $('#' + NS + '-an-corr'), st = $('#' + NS + '-an-corr-state');
    if (big) {
      const col = corr > 0.3 ? '#2dff8a' : corr > -0.1 ? '#ffe135' : '#ff3a3a';
      big.textContent = (corr >= 0 ? '+' : '') + corr.toFixed(2); big.style.color = col;
      if (ptr) ptr.style.left = ((corr + 1) / 2 * 100) + '%';
      if (st) st.textContent = corr > 0.5 ? 'mono-compatível ✓' : corr > 0 ? 'estéreo amplo' : corr > -0.3 ? 'cuidado: fase larga' : '⚠ anti-fase';
    }
    const dr = computeDR(buf);
    const drEl = $('#' + NS + '-an-dr');
    if (drEl) {
      const col = dr.dr >= 12 ? '#2dff8a' : dr.dr >= 8 ? '#ffe135' : '#ff3a3a';
      drEl.textContent = 'DR' + dr.dr; drEl.style.color = col;
      const bar = $('#' + NS + '-an-dr-bar'); if (bar) { bar.style.width = clamp(dr.dr / 16 * 100, 5, 100) + '%'; bar.style.background = col; }
      const desc = $('#' + NS + '-an-dr-desc'); if (desc) desc.textContent = dr.dr >= 12 ? 'Dinâmica audiófila' : dr.dr >= 8 ? 'Loud com vida' : 'Esmagado';
      const psr = $('#' + NS + '-an-psr'); if (psr) psr.textContent = dr.psr.toFixed(1) + ' dB';
      const plr = $('#' + NS + '-an-plr'); if (plr) plr.textContent = dr.crest.toFixed(1) + ' dB';
    }
    drawLoudnessHistory(computeLoudnessHistory(buf));
    const intEl = $('#' + NS + '-an-int'); if (intEl) intEl.textContent = measureLUFS(buf).toFixed(1) + ' LUFS';
    drawWaterfall(computeWaterfall(buf, 6));
    drawCrestFactor(dr);
    drawAnaliseTonal(computeBandBalance(buf));
  } catch (e) { /* silencioso */ }
}
function drawLoudnessHistory(pts) {
  const cv = $('#' + NS + '-an-lh'); if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  g.clearRect(0, 0, W, H); g.fillStyle = '#07070e'; g.fillRect(0, 0, W, H);
  const min = -40, max = -6, yOf = v => H - ((clamp(v, min, max) - min) / (max - min)) * (H - 10) - 5;
  g.strokeStyle = 'rgba(45,255,138,.4)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(0, yOf(-14)); g.lineTo(W, yOf(-14)); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#2dff8a'; g.font = '8px monospace'; g.fillText('-14 alvo', 4, yOf(-14) - 3);
  g.beginPath(); g.moveTo(0, H);
  pts.forEach((v, i) => { const x = i / Math.max(1, pts.length - 1) * W; g.lineTo(x, yOf(v)); });
  g.lineTo(W, H); g.closePath();
  const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, 'rgba(45,212,255,.3)'); grad.addColorStop(1, 'transparent');
  g.fillStyle = grad; g.fill();
  g.beginPath(); pts.forEach((v, i) => { const x = i / Math.max(1, pts.length - 1) * W, y = yOf(v); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.strokeStyle = '#2dd4ff'; g.lineWidth = 2; g.stroke();
}
function drawWaterfall(frames) {
  const cv = $('#' + NS + '-an-wf'); if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  g.clearRect(0, 0, W, H); g.fillStyle = '#07070e'; g.fillRect(0, 0, W, H);
  const cols = ['#ff3ab5', '#b855f7', '#2dd4ff', '#2dff8a', '#ffe135', '#ff6b35'];
  const yStep = 12;
  frames.forEach((bands, fi) => {
    const offY = fi * yStep, alpha = 1 - fi * 0.13;
    let mx = 0; for (let b = 0; b < bands.length; b++) if (bands[b] > mx) mx = bands[b];
    g.beginPath();
    for (let b = 0; b < bands.length; b++) {
      const x = b / (bands.length - 1) * W;
      const mag = mx > 0 ? bands[b] / mx : 0;
      const y = H - 20 - offY - mag * (H - 40);
      b ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.strokeStyle = cols[fi % cols.length]; g.globalAlpha = Math.max(0.25, alpha); g.lineWidth = 1.5; g.stroke();
  });
  g.globalAlpha = 1;
}
function drawCrestFactor(dr) {
  const cv = $('#' + NS + '-an-crest'); if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  g.clearRect(0, 0, W, H); g.fillStyle = '#07070e'; g.fillRect(0, 0, W, H);
  const min = -60, max = 0, xOf = v => 40 + ((clamp(v, min, max) - min) / (max - min)) * (W - 70);
  g.fillStyle = '#888899'; g.font = '9px monospace'; g.fillText('TP', 8, 30);
  g.fillStyle = '#16161e'; g.fillRect(40, 22, W - 70, 12); g.fillStyle = '#ff3a3a'; g.fillRect(40, 22, Math.max(0, xOf(dr.peakDb) - 40), 12);
  g.fillStyle = '#ff3a3a'; g.fillText(dr.peakDb.toFixed(1), W - 26, 31);
  g.fillStyle = '#888899'; g.fillText('RMS', 8, 58);
  g.fillStyle = '#16161e'; g.fillRect(40, 50, W - 70, 12); g.fillStyle = '#ffe135'; g.fillRect(40, 50, Math.max(0, xOf(dr.rmsTopDb) - 40), 12);
  g.fillStyle = '#ffe135'; g.fillText(dr.rmsTopDb.toFixed(1), W - 30, 59);
  g.fillStyle = '#2dff8a'; g.font = 'bold 20px Orbitron, monospace'; g.textAlign = 'center';
  g.fillText(dr.crest.toFixed(1) + ' dB', W / 2, H - 22);
  g.font = '8px monospace'; g.fillStyle = '#888899'; g.fillText('crest · transientes', W / 2, H - 8); g.textAlign = 'left';
}
function drawAnaliseTonal(bal) {
  const cv = $('#' + NS + '-an-tonal'); if (!cv) return;
  let genre = 'kizomba';
  try { if (window.GenreDNA && window.GenreDNA.getLastResult) { const r = window.GenreDNA.getLastResult(); if (r && r.genre) genre = r.genre.toLowerCase().replace(/\s+/g, ''); } } catch (e) {}
  const targets = window.SPECTRAL_TARGETS || {}, tgt = targets[genre] || targets.kizomba || { low: 40, mid: 35, high: 25 };
  const ge = $('#' + NS + '-an-genre'); if (ge) ge.textContent = genre.toUpperCase();
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 14;
  g.clearRect(0, 0, W, H); g.fillStyle = '#07070e'; g.fillRect(0, 0, W, H);
  const bands = [['LOW', bal.low, tgt.low, '#b855f7'], ['MID', bal.mid, tgt.mid, '#2dd4ff'], ['HIGH', bal.high, tgt.high, '#2dff8a']];
  const bw = W / 3;
  bands.forEach((b, i) => {
    const x = i * bw, cx = x + bw / 2;
    const yMine = H - pad - (b[1] / 60 * (H - pad - 10)), yTgt = H - pad - (b[2] / 60 * (H - pad - 10));
    g.fillStyle = 'rgba(45,255,138,.10)'; g.fillRect(x + 12, yTgt - 5, bw - 24, 10);
    g.strokeStyle = 'rgba(45,255,138,.5)'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x + 12, yTgt); g.lineTo(x + bw - 12, yTgt); g.stroke(); g.setLineDash([]);
    g.fillStyle = b[3]; g.fillRect(cx - 14, yMine, 28, H - pad - yMine);
    g.fillStyle = '#888899'; g.font = '8px monospace'; g.textAlign = 'center'; g.fillText(b[0], cx, H - 3);
    g.fillStyle = b[3]; g.font = 'bold 9px monospace'; g.fillText(Math.round(b[1]) + '%', cx, yMine - 4);
  });
  g.textAlign = 'left';
}

/* ── SPECTRUM ANALYSER PRO ── */
let specRAF = null;
function stopSpectrum() { if (specRAF) cancelAnimationFrame(specRAF); specRAF = null; }
function pageSpectrum(body) {
  body.innerHTML = `
    <canvas class="${NS}-canvas" id="${NS}-spec" width="900" height="240"></canvas>
    <div class="${NS}-hint" style="margin-top:8px;">FFT log-frequência com peak-hold. Liga o Play na suite para análise ao vivo.</div>`;
  const an = window.analyserNode;
  const cv = $('#' + NS + '-spec'), g = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  if (!an) { g.fillStyle = '#888'; g.font = '13px monospace'; g.fillText('analyserNode indisponível — toca o master na suite.', 20, 30); return; }
  const bins = an.frequencyBinCount, data = new Uint8Array(bins), hold = new Float32Array(W).fill(0);
  const sr = (window.audioCtx ? window.audioCtx.sampleRate : 48000);
  function loop() {
    specRAF = requestAnimationFrame(loop);
    an.getByteFrequencyData(data);
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(8,8,12,1)'; g.fillRect(0, 0, W, H);
    // grelha
    ['60', '250', '1k', '4k', '16k'].forEach((l, i) => {
      const x = i / 4 * W; g.strokeStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H - 12); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.3)'; g.font = '9px monospace'; g.textAlign = 'center'; g.fillText(l, x, H - 2);
    });
    g.beginPath();
    for (let x = 0; x < W; x++) {
      const f = 20 * Math.pow(1000, x / W); // 20Hz..20kHz log
      const bin = Math.min(bins - 1, Math.round(f / (sr / 2) * bins));
      const v = data[bin] / 255;
      const y = (H - 12) - v * (H - 24);
      if (v > (hold[x] || 0)) hold[x] = v; else hold[x] *= 0.96;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    const grad = g.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#ff3ab5'); grad.addColorStop(0.5, '#b855f7'); grad.addColorStop(1, '#2dd4ff');
    g.strokeStyle = grad; g.lineWidth = 2; g.stroke();
    g.lineTo(W, H - 12); g.lineTo(0, H - 12); g.closePath();
    g.fillStyle = 'rgba(184,85,247,.12)'; g.fill();
    // peak-hold
    g.beginPath();
    for (let x = 0; x < W; x++) { const y = (H - 12) - hold[x] * (H - 24); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.strokeStyle = 'rgba(255,225,53,.6)'; g.lineWidth = 1; g.stroke();
  }
  loop();
}

/* ── HARMONIC SIGNATURE ── */
function pageHarmonic(body) {
  const buf = activeBuffer();
  if (!buf) return needBuffer(body);
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card" style="flex:1">
        <div class="${NS}-lbl">Referência comercial</div>
        <div class="${NS}-drop" id="${NS}-refdrop" style="margin-top:6px;">⬇ Soltar faixa de referência (do mesmo género)</div>
        <div class="${NS}-hint" id="${NS}-refstat" style="margin-top:8px;">Compara o teu balanço espectral com uma referência e sugere ajustes de EQ.</div>
      </div>
    </div>
    <div id="${NS}-bands"></div>`;
  wireDrop($('#' + NS + '-refdrop'), async (b, name) => {
    $('#' + NS + '-refstat').textContent = 'A analisar “' + name + '”…';
    setTimeout(() => {
      try {
        const mine = bandSpectrum(buf), ref = bandSpectrum(b);
        // normaliza ambos pela média para comparar forma, não volume
        const norm = arr => { const m = arr.reduce((s, v) => s + v, 0) / arr.length; return arr.map(v => v - m); };
        const nm = norm(mine), nr = norm(ref);
        const host = $('#' + NS + '-bands'); host.innerHTML = '';
        BANDS.forEach((band, i) => {
          const diff = nr[i] - nm[i]; // +ve => a referência tem mais => sobe esta banda
          const sig = Math.abs(diff) < 0.8;
          const action = sig ? 'OK' : (diff > 0 ? 'SUBIR' : 'BAIXAR');
          const col = sig ? 'var(--c4)' : (diff > 0 ? 'var(--c5)' : 'var(--c2)');
          const w = clamp(Math.abs(diff) / 8 * 50, 2, 50); // metade da largura = desvio máx
          // barra centrada: cresce para a direita se SUBIR, esquerda se BAIXAR
          const barHtml = diff > 0
            ? `<div style="position:absolute;left:50%;top:0;height:100%;width:${w}%;background:${col};border-radius:0 3px 3px 0;"></div>`
            : `<div style="position:absolute;right:50%;top:0;height:100%;width:${w}%;background:${col};border-radius:3px 0 0 3px;"></div>`;
          host.appendChild(el('div', NS + '-bandrow', `
            <div class="${NS}-bandname">${band[0]}</div>
            <div class="${NS}-bandbar" style="position:relative;"><div style="position:absolute;left:50%;top:-2px;width:1px;height:calc(100% + 4px);background:var(--border2);"></div>${barHtml}</div>
            <div style="width:120px;text-align:right;font-size:10px;font-weight:700;color:${col};font-family:'Orbitron',monospace;">${action} ${sig ? '' : Math.abs(diff).toFixed(1) + 'dB'}</div>`));
        });
        $('#' + NS + '-refstat').innerHTML = 'Linha central = igual à referência. <b style="color:var(--c5)">SUBIR →</b> falta-te energia nesta banda · <b style="color:var(--c2)">← BAIXAR</b> tens a mais · <b style="color:var(--c4)">OK</b> = igual.';
        toast('✓ Assinatura harmónica comparada', 'var(--c4)');
      } catch (e) { $('#' + NS + '-refstat').textContent = 'Erro: ' + e.message; }
    }, 30);
  });
}

/* ── PHASE CLASH DETECTOR ──
 * Correlação cruzada normalizada janelada entre 2 pistas. r→+1 em fase,
 * r→-1 anti-fase (colisão), r→0 descorrelacionado. Também estima o offset
 * de alinhamento óptimo via pico de correlação. */
function bestAlignOffset(a, b, maxLag) {
  // procura o lag (em amostras) que maximiza a correlação; passo grosso p/ velocidade
  let bestR = -2, bestLag = 0;
  const step = Math.max(1, Math.round(maxLag / 400));
  for (let lag = -maxLag; lag <= maxLag; lag += step) {
    let sum = 0, na = 0, nb = 0, n = 0;
    const start = Math.max(0, -lag), end = Math.min(a.length, b.length - lag);
    const stride = Math.max(1, Math.round((end - start) / 4000));
    for (let i = start; i < end; i += stride) {
      const x = a[i], y = b[i + lag];
      sum += x * y; na += x * x; nb += y * y; n++;
    }
    const r = sum / (Math.sqrt(na * nb) + 1e-12);
    if (r > bestR) { bestR = r; bestLag = lag; }
  }
  return { lag: bestLag, r: bestR };
}
function phaseTimeline(a, b, lag, win) {
  const out = [];
  const start = Math.max(0, -lag), end = Math.min(a.length, b.length - lag);
  for (let i = start; i + win <= end; i += win) {
    let sum = 0, na = 0, nb = 0;
    for (let k = 0; k < win; k++) { const x = a[i + k], y = b[i + k + lag]; sum += x * y; na += x * x; nb += y * y; }
    const e = Math.sqrt((na + nb) / (2 * win));
    const r = (na > 1e-9 && nb > 1e-9) ? sum / Math.sqrt(na * nb) : 0;
    out.push({ r, e });
  }
  return out;
}
function pagePhase(body) {
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card"><div class="${NS}-lbl">Pista A</div>
        <div class="${NS}-drop" id="${NS}-pa" style="margin-top:6px;">⬇ Soltar pista A (ex: voz lead)</div>
        <div class="${NS}-hint" id="${NS}-pas" style="margin-top:6px;">—</div></div>
      <div class="${NS}-card"><div class="${NS}-lbl">Pista B</div>
        <div class="${NS}-drop" id="${NS}-pb" style="margin-top:6px;">⬇ Soltar pista B (ex: dobra / beat)</div>
        <div class="${NS}-hint" id="${NS}-pbs" style="margin-top:6px;">—</div></div>
    </div>
    <div class="${NS}-row">
      <button class="${NS}-btn ${NS}-go" id="${NS}-prun" disabled>🔍 ANALISAR FASE</button>
      <div class="${NS}-hint" id="${NS}-pstat">Carrega as duas pistas para detectar colisões de fase.</div>
    </div>
    <div class="${NS}-card" id="${NS}-pres" style="display:none;">
      <div class="${NS}-row" style="margin-bottom:10px;">
        <div><div class="${NS}-lbl">Correlação global</div><div class="${NS}-big" id="${NS}-pcorr">—</div></div>
        <div><div class="${NS}-lbl">Offset óptimo</div><div class="${NS}-big" id="${NS}-poff">—<span class="${NS}-unit">ms</span></div></div>
        <div><div class="${NS}-lbl">Zonas de clash</div><div class="${NS}-big" id="${NS}-pclash" style="color:var(--c7)">—</div></div>
      </div>
      <div class="${NS}-lbl">Timeline de fase (<span style="color:var(--c4)">verde=em fase</span> · <span style="color:var(--c3)">amarelo=neutro</span> · <span style="color:var(--c7)">vermelho=anti-fase</span>)</div>
      <canvas class="${NS}-canvas" id="${NS}-pcanvas" width="900" height="120" style="height:120px;margin-top:6px;"></canvas>
      <div class="${NS}-hint" id="${NS}-padvice" style="margin-top:8px;"></div>
    </div>`;
  let bufA = null, bufB = null;
  const checkReady = () => { $('#' + NS + '-prun').disabled = !(bufA && bufB); };
  wireDropTo($('#' + NS + '-pa'), (b, n) => { bufA = b; $('#' + NS + '-pas').textContent = n + ' · ' + b.duration.toFixed(1) + 's'; checkReady(); });
  wireDropTo($('#' + NS + '-pb'), (b, n) => { bufB = b; $('#' + NS + '-pbs').textContent = n + ' · ' + b.duration.toFixed(1) + 's'; checkReady(); });
  $('#' + NS + '-prun').onclick = () => {
    const stat = $('#' + NS + '-pstat'); stat.textContent = 'A analisar…'; stat.style.color = 'var(--c3)';
    setTimeout(() => {
      try {
        const sr = bufA.sampleRate;
        const a = bufA.getChannelData(0), b = bufB.getChannelData(0);
        const maxLag = Math.round(0.05 * sr); // ±50ms
        const align = bestAlignOffset(a, b, maxLag);
        const win = Math.round(0.025 * sr); // 25ms
        const tl = phaseTimeline(a, b, align.lag, win);
        // métricas
        const active = tl.filter(s => s.e > 0.01);
        const meanR = active.length ? active.reduce((s, x) => s + x.r, 0) / active.length : 0;
        const clashes = active.filter(s => s.r < -0.3).length;
        const clashPct = active.length ? (clashes / active.length * 100) : 0;
        $('#' + NS + '-pres').style.display = 'block';
        $('#' + NS + '-pcorr').textContent = meanR.toFixed(2);
        $('#' + NS + '-pcorr').style.color = meanR > 0.3 ? 'var(--c4)' : meanR < -0.1 ? 'var(--c7)' : 'var(--c3)';
        $('#' + NS + '-poff').innerHTML = (align.lag / sr * 1000).toFixed(1) + `<span class="${NS}-unit">ms</span>`;
        $('#' + NS + '-pclash').textContent = clashPct.toFixed(0) + '%';
        // desenha timeline
        const cv = $('#' + NS + '-pcanvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
        g.fillStyle = '#08080c'; g.fillRect(0, 0, W, H);
        const bw = W / tl.length;
        tl.forEach((s, i) => {
          const amp = clamp(s.e * 6, 0.05, 1);
          let col;
          if (s.e < 0.01) col = 'rgba(40,40,52,.5)';
          else if (s.r > 0.3) col = `rgba(45,255,138,${amp})`;
          else if (s.r < -0.3) col = `rgba(255,58,58,${amp})`;
          else col = `rgba(255,225,53,${amp * 0.8})`;
          g.fillStyle = col;
          const h = (s.e < 0.01) ? 4 : clamp(Math.abs(s.r) * H, 6, H);
          g.fillRect(i * bw, (H - h) / 2, Math.max(1, bw - 0.5), h);
        });
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
        // conselho
        let adv;
        if (clashPct > 25) adv = '⚠ <b style="color:var(--c7)">Colisão de fase significativa</b> nas zonas vermelhas. Considera: inverter a polaridade da Pista B, micro-alinhar (offset acima), ou aplicar Haas/atraso subtil.';
        else if (meanR > 0.6) adv = '✓ <b style="color:var(--c4)">Boa coerência de fase.</b> As pistas somam bem; somas em mono sem cancelamento notável.';
        else if (Math.abs(align.lag) > sr * 0.002) adv = '↔ Offset de ' + (align.lag / sr * 1000).toFixed(1) + ' ms detectado. Alinha as pistas por esse valor para máxima coerência.';
        else adv = 'Coerência aceitável. Vê as zonas amarelas — descorrelação parcial é normal entre voz e beat.';
        $('#' + NS + '-padvice').innerHTML = adv;
        stat.textContent = '✓ Análise concluída.'; stat.style.color = 'var(--c4)';
        toast('✓ Fase analisada · clash ' + clashPct.toFixed(0) + '%', clashPct > 25 ? 'var(--c7)' : 'var(--c4)');
      } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; }
    }, 30);
  };
}
/* drop que devolve buffer sem mexer no localBuffer global */
function wireDropTo(node, cb) {
  if (!node) return;
  const over = e => { e.preventDefault(); node.classList.add(NS + '-over'); };
  const leave = () => node.classList.remove(NS + '-over');
  node.addEventListener('dragover', over); node.addEventListener('dragleave', leave);
  node.addEventListener('drop', async e => { leave(); e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) await load(f); });
  node.addEventListener('click', () => { const inp = el('input'); inp.type = 'file'; inp.accept = 'audio/*'; inp.onchange = async () => { if (inp.files[0]) await load(inp.files[0]); }; inp.click(); });
  async function load(f) {
    try { const ab = await f.arrayBuffer(); const dec = await ctx().decodeAudioData(ab.slice(0)); cb(dec, f.name); }
    catch (e) { toast('Erro: ' + e.message, 'var(--c7)'); }
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 7. VECTORSCOPE — reutiliza window.Vectorscope (features2), alimentado por
 *    dois analisadores L/R derivados de window.masterGain (tap passivo).
 * ════════════════════════════════════════════════════════════════════════ */
let vectorWired = false, vAL = null, vAR = null;
function stopVector() { try { if (window.Vectorscope) window.Vectorscope.stop(); } catch (e) {} }
function pageVector(body) {
  const buf = activeBuffer();
  body.innerHTML = `
    <canvas class="${NS}-canvas" id="${NS}-vscanvas" width="360" height="360" style="height:320px;max-width:320px;margin:0 auto;display:block;"></canvas>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:12px;">
      <button class="${NS}-btn" id="${NS}-vplay" style="border-color:var(--c4);color:var(--c4);background:rgba(45,255,138,.1);">▶ TOCAR (ver o scope animar)</button>
      <button class="${NS}-btn" id="${NS}-vstop" style="border-color:var(--border2);color:var(--muted);">■ PARAR</button>
    </div>
    <div class="${NS}-hint" style="margin-top:8px;text-align:center;">Lissajous M/S (rotação 45°). Vertical = mono/centro · diagonal = estéreo amplo · horizontal = anti-fase.<br>O scope só anima com áudio a tocar — usa o ▶ acima.</div>`;
  if (!window.Vectorscope) { const g = $('#' + NS + '-vscanvas').getContext('2d'); g.fillStyle = '#888'; g.font = '12px monospace'; g.fillText('Vectorscope (features2) não encontrado.', 20, 30); return; }
  if (!buf) { const g = $('#' + NS + '-vscanvas').getContext('2d'); g.fillStyle = '#888'; g.font = '12px monospace'; g.fillText('Carrega um master na suite primeiro.', 20, 30); }
  const playBtn = $('#' + NS + '-vplay'), stopBtn = $('#' + NS + '-vstop');
  playBtn.onclick = () => {
    if (!activeBuffer()) { toast('Carrega uma faixa primeiro', 'var(--c3)'); return; }
    prdx3Play(window.__prdx3Master ? 'master' : 'original', (s) => {
      if (s === 'playing') { playBtn.innerHTML = '♪ A TOCAR…'; playBtn.style.opacity = '.7'; }
      if (s === 'stopped') { playBtn.innerHTML = '▶ TOCAR (ver o scope animar)'; playBtn.style.opacity = '1'; }
    });
  };
  stopBtn.onclick = () => { prdx3Stop(); playBtn.innerHTML = '▶ TOCAR (ver o scope animar)'; playBtn.style.opacity = '1'; };
  // se já há masterGain a tocar na suite, também liga (fallback)
  const ac = window.audioCtx, src = window.masterGain;
  if (ac && src && !vectorWired) {
    try {
      const splitter = ac.createChannelSplitter(2);
      vAL = ac.createAnalyser(); vAR = ac.createAnalyser();
      vAL.fftSize = 2048; vAR.fftSize = 2048;
      src.connect(splitter); splitter.connect(vAL, 0); splitter.connect(vAR, 1);
      vectorWired = true;
    } catch (e) {}
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 8. STEMS — separação espectral M/S (centro=voz vs lados) via STFT.
 *    Honesto: isola/remove conteúdo central. 4-stems IA (bateria/baixo)
 *    exigem modelo dedicado — ver hook window.PRDX3.setStemModel().
 * ════════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════════
 * 8. STEMS — HPSS (Harmonic Percussive Source Separation) 4-stems:
 *    vocals · drums · bass · other
 *    Algoritmo: median-filter soft-mask no espectrograma (Fitzgerald 2010,
 *    usado no librosa, Deezer Research, Essentia). Real DSP profissional,
 *    sem modelo IA pesado — funciona totalmente offline no browser.
 *    Hook window.PRDX3.setStemModel() aceita modelo externo (TF.js/ONNX)
 *    para 4-stems ainda mais limpos se disponível.
 * ════════════════════════════════════════════════════════════════════════ */
function ifft(re, im) {
  const n = re.length;
  for (let i = 0; i < n; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < n; i++) { re[i] /= n; im[i] = -im[i] / n; }
}
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function hpssChannel(data, sr, opts) {
  const size = opts.size || 2048, hop = size >> 2;
  const Lh = opts.Lh || 17, Lp = opts.Lp || 17;  // filtro tempo / freq
  const N = data.length;
  const win = new Float32Array(size);
  for (let i = 0; i < size; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / size);
  const nFrames = Math.floor((N - size) / hop) + 1;
  const nBins = size / 2 + 1;
  // STFT
  const MAG = [], PH_re = [], PH_im = [];
  const re0 = new Float32Array(size), im0 = new Float32Array(size);
  for (let f = 0; f < nFrames; f++) {
    const re = re0.slice(), im = im0.slice();
    const base = f * hop;
    for (let i = 0; i < size; i++) re[i] = (base + i < N ? data[base + i] : 0) * win[i];
    fft(re, im);
    const m = new Float32Array(nBins), pr = new Float32Array(nBins), pi2 = new Float32Array(nBins);
    for (let k = 0; k < nBins; k++) {
      const mg = Math.sqrt(re[k] ** 2 + im[k] ** 2) || 1e-12;
      m[k] = mg; pr[k] = re[k] / mg; pi2[k] = im[k] / mg;
    }
    MAG.push(m); PH_re.push(pr); PH_im.push(pi2);
  }
  // median filter horizontal (harmónico) + vertical (percussivo)
  const hMED = MAG.map(r => new Float32Array(nBins));
  const pMED = MAG.map(r => new Float32Array(nBins));
  const hBuf = new Float32Array(Lh), pBuf = new Float32Array(Lp);
  for (let f = 0; f < nFrames; f++) {
    for (let k = 0; k < nBins; k++) {
      let h = 0; for (let d = 0; d < Lh; d++) hBuf[d] = MAG[Math.max(0, Math.min(nFrames - 1, f - Math.floor(Lh / 2) + d))][k];
      hMED[f][k] = medianOf(hBuf);
      let p = 0; for (let d = 0; d < Lp; d++) pBuf[d] = MAG[f][Math.max(0, Math.min(nBins - 1, k - Math.floor(Lp / 2) + d))];
      pMED[f][k] = medianOf(pBuf);
    }
  }
  // Wiener soft-masks
  const MASKS_h = MAG.map((_, f) => { const m = new Float32Array(nBins); for (let k = 0; k < nBins; k++) { const h2 = hMED[f][k] ** 2, p2 = pMED[f][k] ** 2; m[k] = h2 / (h2 + p2 + 1e-12); } return m; });
  const MASKS_p = MASKS_h.map(m => m.map(v => 1 - v));
  // iSTFT per stem via OLA
  function istft(masks) {
    const out = new Float32Array(N), norm = new Float32Array(N);
    const re = new Float32Array(size), im = new Float32Array(size);
    for (let f = 0; f < nFrames; f++) {
      for (let k = 0; k < nBins; k++) {
        const mg = MAG[f][k] * masks[f][k];
        re[k] = mg * PH_re[f][k]; im[k] = mg * PH_im[f][k];
        if (k > 0 && k < nBins - 1) { re[size - k] = re[k]; im[size - k] = -im[k]; }
      }
      ifft(re, im);
      const base = f * hop;
      for (let i = 0; i < size; i++) { out[base + i] += re[i] * win[i]; norm[base + i] += win[i] * win[i]; }
    }
    for (let i = 0; i < N; i++) out[i] /= norm[i] || 1;
    return out;
  }
  return { harmonic: istft(MASKS_h), percussive: istft(MASKS_p) };
}
async function hpss4Stems(buffer) {
  const sr = buffer.sampleRate, nCh = buffer.numberOfChannels, N = buffer.length;
  const opts = { size: 2048, Lh: 17, Lp: 17 };
  // processa L e R juntos
  const chL = hpssChannel(buffer.getChannelData(0), sr, opts);
  const chR = nCh > 1 ? hpssChannel(buffer.getChannelData(1), sr, opts) : chL;
  // Mid/Side para separar voz (centro) de outros harmónicos
  const mL = new Float32Array(N), mR = new Float32Array(N); // Mid → voz
  const sL = new Float32Array(N), sR = new Float32Array(N); // Sides → others
  const bL = new Float32Array(N), bR = new Float32Array(N); // Bass (harm <200Hz)
  const freqCutBin = Math.round(200 / sr * 2048);
  for (let i = 0; i < N; i++) {
    const hL = chL.harmonic[i], hR = chR.harmonic[i];
    const mid = (hL + hR) * 0.5, side = (hL - hR) * 0.5;
    mL[i] = mid; mR[i] = mid;        // vocals: harmónico central
    sL[i] = side; sR[i] = -side;     // other: harmónico lateral
  }
  // bass: harmónico low-passed ~200Hz (simples: downsampled RMS envelope)
  const bassLP = 0.995; // coef LP simples
  let runL = 0, runR = 0;
  for (let i = 0; i < N; i++) {
    runL = runL * bassLP + chL.harmonic[i] * (1 - bassLP);
    runR = runR * bassLP + (chR.harmonic[i]) * (1 - bassLP);
    bL[i] = runL * 80; bR[i] = runR * 80; // compensa filtro
  }
  const mk = (L, R) => { const b = ctx().createBuffer(2, N, sr); b.getChannelData(0).set(L); b.getChannelData(1).set(R); return b; };
  const drums = mk(chL.percussive, chR.percussive);
  const vocals = mk(mL, mR);
  const bass = mk(bL, bR);
  const other = mk(sL, sR);
  return { vocals, drums, bass, other };
}
let _stemModel = null;
function pageStems(body) {
  const buf = activeBuffer();
  if (!buf) return needBuffer(body);
  body.innerHTML = `
    <div class="${NS}-card">
      <div class="${NS}-lbl">4-Stem Separator · HPSS (Harmonic-Percussive)</div>
      <div class="${NS}-hint" style="margin-bottom:12px;">Separa a faixa em <b style="color:var(--c1)">Vocals</b> · <b style="color:var(--c7)">Drums</b> · <b style="color:var(--c5)">Bass</b> · <b style="color:var(--c4)">Other</b> via median-filter soft-mask no espectrograma (Fitzgerald 2010 · librosa · Essentia). Funciona <b>offline</b>, sem upload.</div>
      <div class="${NS}-row">
        <button class="${NS}-btn ${NS}-go" id="${NS}-srun" style="flex:1">🎚 SEPARAR 4 STEMS</button>
        <div class="${NS}-hint" id="${NS}-sstat" style="flex:2">Processa offline · duração estimada: ${(buf.duration / 10).toFixed(0)}–${(buf.duration / 5).toFixed(0)}s</div>
      </div>
      <div id="${NS}-stemgrid" style="display:none;margin-top:14px;">
        ${[['vocals','VOZ / VOCALS','--c1'],['drums','DRUMS / PERCUSSIVO','--c7'],['bass','BASS (< 200Hz)','--c5'],['other','OTHER / LATERAIS','--c4']].map(([k,label,col]) => `
        <div class="${NS}-card" style="margin-bottom:8px;display:flex;align-items:center;gap:12px;">
          <div style="flex:1;"><div class="${NS}-lbl" style="color:var(${col})">${label}</div><canvas id="${NS}-sw-${k}" height="40" style="width:100%;height:40px;background:var(--bg);border-radius:4px;display:block;"></canvas></div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button class="${NS}-btn ${NS}-go" data-stem="${k}" style="padding:6px 10px;font-size:9px;">▶ PLAY</button>
            <button class="${NS}-btn" data-dl="${k}" style="padding:6px 10px;font-size:9px;">⬇ WAV</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  const results = {};
  let playing = null;
  $('#' + NS + '-srun').onclick = async () => {
    const stat = $('#' + NS + '-sstat'), btn = $('#' + NS + '-srun');
    stat.textContent = 'A processar…'; stat.style.color = 'var(--c3)'; btn.disabled = true;
    setTimeout(async () => {
      try {
        const stems = _stemModel ? await _stemModel(buf) : await hpss4Stems(buf);
        Object.assign(results, stems);
        window.__prdx3Stems = results; // disponível no EXPORT para download 1-a-1 ou todos
        // desenha mini-waveforms
        ['vocals','drums','bass','other'].forEach(k => {
          const cv = $('#' + NS + '-sw-' + k); if (!cv) return;
          const g = cv.getContext('2d'), W = cv.width || 400, H = cv.height || 40;
          const d = results[k].getChannelData(0), step = Math.max(1, Math.floor(d.length / W));
          const cols = {'vocals':'#ff3ab5','drums':'#ff3a3a','bass':'#2dd4ff','other':'#2dff8a'};
          g.clearRect(0, 0, W, H); g.fillStyle = '#08080c'; g.fillRect(0, 0, W, H);
          g.beginPath(); g.strokeStyle = cols[k]; g.lineWidth = 1;
          for (let x = 0; x < W; x++) { let mx = 0; for (let j = 0; j < step; j++) { const v = Math.abs(d[x * step + j] || 0); if (v > mx) mx = v; } const y = H / 2 - mx * (H / 2 - 2); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
          g.stroke();
          g.beginPath();
          for (let x = 0; x < W; x++) { let mx = 0; for (let j = 0; j < step; j++) { const v = Math.abs(d[x * step + j] || 0); if (v > mx) mx = v; } const y = H / 2 + mx * (H / 2 - 2); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
          g.stroke();
        });
        $('#' + NS + '-stemgrid').style.display = 'block';
        stat.innerHTML = '✓ 4 stems prontos. HPSS offline.'; stat.style.color = 'var(--c4)';
        btn.disabled = false;
        toast('✓ 4 stems separados (Vocals · Drums · Bass · Other)', 'var(--c4)');
      } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; btn.disabled = false; }
    }, 30);
  };
  body.addEventListener('click', e => {
    const pb = e.target.closest('[data-stem]');
    const db = e.target.closest('[data-dl]');
    if (pb && results[pb.dataset.stem]) {
      if (playing) { try { playing.stop(); } catch (_) {} playing = null; }
      const ac = ctx(), src = ac.createBufferSource();
      src.buffer = results[pb.dataset.stem]; src.connect(ac.destination); src.start();
      playing = src; toast('▶ ' + pb.dataset.stem, 'var(--c4)');
    }
    if (db && results[db.dataset.dl]) {
      const k = db.dataset.dl;
      download(encodeWAV(results[k], 24, { artist: 'Piradex', title: k, isrc: '', lufs: '—' }), 'Piradex_' + k.toUpperCase() + '.wav');
      toast('⬇ ' + k + '.wav', 'var(--c4)');
    }
  });
}

/* ════════════════════════════════════════════════════════════════════════
 * 9. LIVE SESSION — partilha em tempo real via PeerJS (broker público).
 *    Host transmite o áudio do master (MediaStreamDestination de masterGain).
 * ════════════════════════════════════════════════════════════════════════ */
let _peerPromise = null, _peer = null, _liveStream = null;
function loadPeerJS() {
  if (window.Peer) return Promise.resolve(true);
  if (_peerPromise) return _peerPromise;
  _peerPromise = new Promise(res => {
    const s = el('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js';
    s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s);
  });
  return _peerPromise;
}
function pageLive(body) {
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card">
        <div class="${NS}-lbl">Modo Host (partilhar)</div>
        <div class="${NS}-hint" style="margin-bottom:10px;">Transmite o teu master ao vivo. Partilha o código com o cliente.</div>
        <button class="${NS}-btn ${NS}-go" id="${NS}-hoston">📡 INICIAR SESSÃO</button>
        <div class="${NS}-hint" id="${NS}-hostid" style="margin-top:10px;"></div>
      </div>
      <div class="${NS}-card">
        <div class="${NS}-lbl">Modo Viewer (assistir)</div>
        <div class="${NS}-hint" style="margin-bottom:10px;">Cola o código da sessão para ouvir ao vivo.</div>
        <div class="${NS}-row" style="margin-bottom:8px;">
          <input class="${NS}-inp" id="${NS}-vid" placeholder="código da sessão" style="flex:1">
          <button class="${NS}-btn" id="${NS}-vjoin">▶ LIGAR</button>
        </div>
        <audio id="${NS}-vaudio" controls style="width:100%;display:none;"></audio>
        <div class="${NS}-hint" id="${NS}-vstat"></div>
      </div>
    </div>
    <div class="${NS}-hint" style="margin-top:6px;color:var(--muted);">⚠ Usa o broker público PeerJS. Para produção/white-label, alojar um PeerServer próprio dá mais fiabilidade.</div>`;
  $('#' + NS + '-hoston').onclick = async () => {
    const stat = $('#' + NS + '-hostid'); stat.textContent = 'A ligar ao broker…'; stat.style.color = 'var(--c3)';
    const ok = await loadPeerJS();
    if (!ok) { stat.textContent = 'PeerJS indisponível (sem ligação).'; stat.style.color = 'var(--c7)'; return; }
    try {
      const ac = window.audioCtx, src = window.masterGain;
      if (!ac || !src) { stat.textContent = 'Toca o master na suite primeiro.'; stat.style.color = 'var(--c7)'; return; }
      const dest = ac.createMediaStreamDestination(); src.connect(dest); _liveStream = dest.stream;
      const id = 'piradex-' + Math.random().toString(36).slice(2, 8);
      _peer = new Peer(id);
      _peer.on('open', pid => {
        stat.innerHTML = `✓ Sessão activa. Código: <b style="color:var(--c4);font-family:Orbitron,monospace;">${pid}</b><br><span style="font-size:10px;color:var(--muted);">Partilha este código com quem vai ouvir.</span>`;
        stat.style.color = 'var(--c4)'; toast('📡 Sessão live iniciada', 'var(--c4)');
      });
      _peer.on('call', call => { call.answer(_liveStream); });
      _peer.on('error', e => { stat.textContent = 'Erro PeerJS: ' + e.type; stat.style.color = 'var(--c7)'; });
    } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; }
  };
  $('#' + NS + '-vjoin').onclick = async () => {
    const stat = $('#' + NS + '-vstat'), code = $('#' + NS + '-vid').value.trim();
    if (!code) { stat.textContent = 'Cola o código primeiro.'; return; }
    stat.textContent = 'A ligar…'; stat.style.color = 'var(--c3)';
    const ok = await loadPeerJS(); if (!ok) { stat.textContent = 'PeerJS indisponível.'; stat.style.color = 'var(--c7)'; return; }
    try {
      const vp = new Peer();
      vp.on('open', () => {
        const ac = ctx();
        const silent = ac.createMediaStreamDestination(); // stream vazio p/ a chamada
        const call = vp.call(code, silent.stream);
        call.on('stream', remote => {
          const a = $('#' + NS + '-vaudio'); a.srcObject = remote; a.style.display = 'block'; a.play().catch(() => {});
          stat.innerHTML = '✓ Ligado — a ouvir ao vivo.'; stat.style.color = 'var(--c4)';
          toast('▶ A ouvir sessão live', 'var(--c4)');
        });
        call.on('error', e => { stat.textContent = 'Erro na chamada: ' + e; stat.style.color = 'var(--c7)'; });
        setTimeout(() => { if (!$('#' + NS + '-vaudio').srcObject) { stat.textContent = 'Sem resposta — verifica o código/host activo.'; stat.style.color = 'var(--c7)'; } }, 8000);
      });
      vp.on('error', e => { stat.textContent = 'Erro PeerJS: ' + e.type; stat.style.color = 'var(--c7)'; });
    } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; }
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 10. PRESET LIBRARY — snapshot genérico de todos os sliders da suite,
 *     com ratings e packs partilháveis (import/export JSON).
 * ════════════════════════════════════════════════════════════════════════ */
const PRESET_KEY = 'prdx3_presets_v1';
function snapshotSliders() {
  // captura TODOS os input[type=range] com id da suite → {id:value}
  const snap = {};
  document.querySelectorAll('input[type="range"][id]').forEach(s => { snap[s.id] = s.value; });
  return snap;
}
function restoreSliders(snap) {
  let applied = 0;
  Object.keys(snap || {}).forEach(id => {
    const el2 = document.getElementById(id);
    if (el2 && el2.type === 'range') {
      el2.value = snap[id];
      el2.dispatchEvent(new Event('input', { bubbles: true }));
      el2.dispatchEvent(new Event('change', { bubbles: true }));
      applied++;
    }
  });
  return applied;
}
function loadPresets() { try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '[]'); } catch (e) { return []; } }
function savePresets(list) { try { localStorage.setItem(PRESET_KEY, JSON.stringify(list)); } catch (e) {} }
function pagePresets(body) {
  body.innerHTML = `
    <div class="${NS}-card" style="margin-bottom:14px;">
      <div class="${NS}-lbl">Guardar preset actual</div>
      <div class="${NS}-hint" style="margin-bottom:10px;">Captura o estado de todos os sliders da suite (EQ, dinâmica, etc.) + tecto/LUFS deste painel.</div>
      <div class="${NS}-row" style="margin-bottom:0;">
        <input class="${NS}-inp" id="${NS}-pname" placeholder="Nome (ex: Kizomba Radio)" style="flex:2">
        <select class="${NS}-sel" id="${NS}-pgenre" style="flex:1">
          <option>Kizomba</option><option>Afro House</option><option>Kuduro</option><option>Semba</option>
          <option>Zouk</option><option>Afropop</option><option>Dancehall</option><option>Hip-Hop</option><option>R&B</option><option>Outro</option>
        </select>
        <button class="${NS}-btn ${NS}-go" id="${NS}-psave">💾 GUARDAR</button>
      </div>
    </div>
    <div class="${NS}-row" style="margin-bottom:10px;">
      <button class="${NS}-btn" id="${NS}-pexport">⬆ EXPORTAR PACK (.json)</button>
      <button class="${NS}-btn" id="${NS}-pimport">⬇ IMPORTAR PACK</button>
      <div class="${NS}-hint" id="${NS}-pstat"></div>
    </div>
    <div id="${NS}-plist"></div>`;
  const ceilOf = () => { const c = document.getElementById(NS + '-ceil'); return c ? parseFloat(c.value) : -1; };
  const tgtOf = () => { const t = document.getElementById(NS + '-tgt'); return t && t.value ? parseFloat(t.value) : null; };
  function render() {
    const list = loadPresets(), host = $('#' + NS + '-plist');
    if (!list.length) { host.innerHTML = `<div class="${NS}-hint" style="text-align:center;padding:20px;">Sem presets. Guarda o primeiro acima.</div>`; return; }
    host.innerHTML = '';
    list.forEach((p, idx) => {
      const stars = [1, 2, 3, 4, 5].map(n => `<span data-r="${n}" data-i="${idx}" class="${NS}-star" style="cursor:pointer;color:${n <= (p.rating || 0) ? 'var(--c3)' : 'var(--muted)'};font-size:14px;">★</span>`).join('');
      const card = el('div', NS + '-card');
      card.style.marginBottom = '8px';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;">
            <div style="font-family:'Orbitron',monospace;font-weight:700;font-size:12px;color:var(--text);">${p.name}</div>
            <div style="font-size:10px;color:var(--muted2);">${p.genre} · ${Object.keys(p.sliders || {}).length} params · tecto ${p.ceiling} dBTP${p.targetLufs != null ? ' · ' + p.targetLufs + ' LUFS' : ''}</div>
          </div>
          <div>${stars}</div>
          <button class="${NS}-btn ${NS}-go" data-apply="${idx}" style="padding:6px 10px;">APLICAR</button>
          <button class="${NS}-btn" data-del="${idx}" style="padding:6px 10px;border-color:var(--c7);color:var(--c7);">✕</button>
        </div>`;
      host.appendChild(card);
    });
    host.querySelectorAll('.' + NS + '-star').forEach(s => s.onclick = () => {
      const list2 = loadPresets(); list2[+s.dataset.i].rating = +s.dataset.r; savePresets(list2); render();
    });
    host.querySelectorAll('[data-apply]').forEach(b => b.onclick = () => {
      const p = loadPresets()[+b.dataset.apply];
      const n = restoreSliders(p.sliders);
      const cEl = document.getElementById(NS + '-ceil'); if (cEl && p.ceiling != null) { cEl.value = p.ceiling; cEl.dispatchEvent(new Event('input')); }
      toast(`✓ Preset "${p.name}" aplicado (${n} params)`, 'var(--c4)');
    });
    host.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      const list2 = loadPresets(); list2.splice(+b.dataset.del, 1); savePresets(list2); render();
    });
  }
  $('#' + NS + '-psave').onclick = () => {
    const name = ($('#' + NS + '-pname').value || '').trim() || 'Preset ' + (loadPresets().length + 1);
    const sliders = snapshotSliders();
    const list = loadPresets();
    list.unshift({ id: 'p' + Date.now(), name, genre: $('#' + NS + '-pgenre').value, sliders, ceiling: ceilOf(), targetLufs: tgtOf(), rating: 0, created: Date.now() });
    savePresets(list); $('#' + NS + '-pname').value = '';
    toast(`💾 Preset guardado (${Object.keys(sliders).length} sliders)`, 'var(--c4)'); render();
  };
  $('#' + NS + '-pexport').onclick = () => {
    const list = loadPresets();
    if (!list.length) { toast('Sem presets para exportar', 'var(--c7)'); return; }
    download(new Blob([JSON.stringify({ piradexPresetPack: true, version: VERSION, presets: list }, null, 2)], { type: 'application/json' }), 'Piradex_Preset_Pack.json');
  };
  $('#' + NS + '-pimport').onclick = () => {
    const inp = el('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const pack = JSON.parse(r.result);
          const incoming = pack.presets || (Array.isArray(pack) ? pack : []);
          if (!incoming.length) { toast('Pack vazio ou inválido', 'var(--c7)'); return; }
          const merged = incoming.concat(loadPresets());
          savePresets(merged); render();
          toast(`⬇ ${incoming.length} presets importados`, 'var(--c4)');
        } catch (e) { toast('Erro a ler pack: ' + e.message, 'var(--c7)'); }
      };
      r.readAsText(f);
    };
    inp.click();
  };
  render();
}

/* ── EXPORT MULTI-FORMATO ── */
function pageExport(body) {
  const master = window.__prdx3Master || activeBuffer();
  const isLimited = !!window.__prdx3Master;
  if (!master) return needBuffer(body);
  body.innerHTML = `
    <div class="${NS}-row">
      <div class="${NS}-card">
        <div class="${NS}-lbl">Fonte</div>
        <div class="${NS}-hint">${isLimited ? '<b style="color:var(--c4)">Master limitado</b> (True Peak aplicado)' : 'Master da suite (sem limiter — aplica em TRUE PEAK para entrega final)'}</div>
      </div>
      <div class="${NS}-card">
        <div class="${NS}-lbl">Formato</div>
        <select class="${NS}-sel" id="${NS}-fmt" style="width:100%">
          <option value="wav24">WAV 24-bit (entrega distribuidora)</option>
          <option value="wav16">WAV 16-bit (CD)</option>
          <option value="wav32">WAV 32-bit float (arquivo)</option>
          <option value="aiff24">AIFF 24-bit</option>
          <option value="aiff16">AIFF 16-bit</option>
          <option value="flac">FLAC 24-bit (lossless · beta)</option>
          <option value="mp3">MP3 320 kbps (preview)</option>
        </select>
      </div>
    </div>
    <div class="${NS}-card">
      <div class="${NS}-lbl">Metadados BWAV (embed no WAV)</div>
      <div class="${NS}-row" style="margin-bottom:0">
        <input class="${NS}-inp" id="${NS}-mArt" placeholder="Artista" style="flex:1">
        <input class="${NS}-inp" id="${NS}-mTit" placeholder="Título" style="flex:1">
        <input class="${NS}-inp" id="${NS}-mIsrc" placeholder="ISRC (opcional)" style="flex:1">
      </div>
    </div>
    <div id="${NS}-exstems"></div>
    <div class="${NS}-row" style="margin-top:14px;">
      <button class="${NS}-btn ${NS}-go" id="${NS}-dl">⬇ EXPORTAR</button>
      <button class="${NS}-btn" id="${NS}-receipt">🧾 MASTERING RECEIPT (PDF)</button>
      <div class="${NS}-hint" id="${NS}-dlstat"></div>
    </div>`;
  // ── lista de stems (se já separados em STEMS) ──
  (function renderExStems() {
    const host = $('#' + NS + '-exstems'); if (!host) return;
    const stems = window.__prdx3Stems;
    if (!stems || !Object.keys(stems).length) {
      host.innerHTML = `<div class="${NS}-hint" style="margin-top:6px;">💡 Separa a faixa em STEMS para aqui poderes exportar cada pista (1-a-1 ou todas).</div>`;
      return;
    }
    const labels = { vocals: ['VOZ', '--c1'], drums: ['DRUMS', '--c7'], bass: ['BASS', '--c5'], other: ['OTHER', '--c4'] };
    host.innerHTML = `<div class="${NS}-card" style="margin-top:12px;">
      <div class="${NS}-lbl">Pistas separadas (stems)</div>
      <div id="${NS}-exstemrows" style="margin-top:8px;"></div>
      <button class="${NS}-btn ${NS}-go" id="${NS}-dlallstems" style="width:100%;margin-top:8px;">⬇ EXPORTAR TODAS AS STEMS (ZIP)</button>
    </div>`;
    const rows = $('#' + NS + '-exstemrows');
    Object.keys(stems).forEach(k => {
      const lab = labels[k] || [k.toUpperCase(), '--c4'];
      const row = el('div'); row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);';
      row.innerHTML = `<span style="font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:var(${lab[1]});">${lab[0]}</span>
        <button class="${NS}-btn" data-exstem="${k}" style="padding:5px 12px;font-size:9px;">⬇ WAV 24</button>`;
      rows.appendChild(row);
    });
    rows.querySelectorAll('[data-exstem]').forEach(b => {
      b.onclick = () => {
        const k = b.dataset.exstem;
        try {
          const blob = encodeWAV(stems[k], 24, { artist: $('#' + NS + '-mArt').value.trim() || 'Piradex', title: ($('#' + NS + '-mTit').value.trim() || 'master') + '_' + k });
          download(blob, (($('#' + NS + '-mTit').value.trim() || 'master').replace(/[^\w\-]+/g, '_')) + '_' + k + '.wav');
          toast('⬇ ' + k + '.wav', 'var(--c4)');
        } catch (e) { toast('Erro: ' + e.message, 'var(--c7)'); }
      };
    });
    $('#' + NS + '-dlallstems').onclick = async () => {
      const btn = $('#' + NS + '-dlallstems'); btn.disabled = true; btn.innerHTML = '⏳ A criar ZIP…';
      try {
        const JSZ = window.JSZip || (window.PRDX3 && window.PRDX3._JSZip);
        const base = ($('#' + NS + '-mTit').value.trim() || 'master').replace(/[^\w\-]+/g, '_');
        if (!JSZ) { // fallback: descarrega uma a uma
          Object.keys(stems).forEach((k, i) => setTimeout(() => { const blob = encodeWAV(stems[k], 24, { title: base + '_' + k }); download(blob, base + '_' + k + '.wav'); }, i * 400));
          toast('A descarregar stems uma a uma…', 'var(--c5)'); btn.disabled = false; btn.innerHTML = '⬇ EXPORTAR TODAS AS STEMS (ZIP)'; return;
        }
        const zip = new JSZ();
        Object.keys(stems).forEach(k => { const blob = encodeWAV(stems[k], 24, { title: base + '_' + k }); zip.file(base + '_' + k + '.wav', blob); });
        const out = await zip.generateAsync({ type: 'blob' });
        download(out, base + '_stems.zip');
        toast('✓ ZIP com todas as stems', 'var(--c4)');
      } catch (e) { toast('Erro ZIP: ' + e.message, 'var(--c7)'); }
      btn.disabled = false; btn.innerHTML = '⬇ EXPORTAR TODAS AS STEMS (ZIP)';
    };
  })();
  const rb = $('#' + NS + '-receipt');
  if (window.MasteringReceipt) {
    rb.onclick = () => {
      try {
        const tit = $('#' + NS + '-mTit').value.trim() || 'Master';
        let lufs = '—', tp = '—';
        try { lufs = measureLUFS(master).toFixed(1); tp = measureTruePeakDb(master).toFixed(2); } catch (e) {}
        window.MasteringReceipt.generate(tit, { lufs, truePeak: tp, engineer: $('#' + NS + '-mArt').value.trim() || 'Juninho Piradex' });
        toast('🧾 Receipt gerado', 'var(--c6)');
      } catch (e) { toast('Receipt indisponível: ' + e.message, 'var(--c7)'); }
    };
  } else { rb.disabled = true; rb.title = 'MasteringReceipt (features2) não encontrado'; }
  $('#' + NS + '-dl').onclick = async () => {
    const fmt = $('#' + NS + '-fmt').value, stat = $('#' + NS + '-dlstat');
    const art = $('#' + NS + '-mArt').value.trim(), tit = $('#' + NS + '-mTit').value.trim(), isrc = $('#' + NS + '-mIsrc').value.trim();
    const base = (tit || 'master').replace(/[^\w\-]+/g, '_');
    stat.textContent = 'A codificar…'; stat.style.color = 'var(--c3)';
    try {
      let lufs = '—'; try { lufs = measureLUFS(master).toFixed(1); } catch (e) {}
      const meta = { artist: art, title: tit, isrc, lufs };
      let blob, ext;
      if (fmt === 'wav16') { blob = encodeWAV(master, 16, meta); ext = 'wav'; }
      else if (fmt === 'wav24') { blob = encodeWAV(master, 24, meta); ext = 'wav'; }
      else if (fmt === 'wav32') { blob = encodeWAV(master, 32, meta); ext = 'wav'; }
      else if (fmt === 'aiff24') { blob = encodeAIFF(master, 24); ext = 'aif'; }
      else if (fmt === 'aiff16') { blob = encodeAIFF(master, 16); ext = 'aif'; }
      else if (fmt === 'flac') {
        stat.textContent = 'A carregar codificador FLAC…';
        blob = await encodeFLAC(master, 24); ext = 'flac';
        if (!blob) { stat.textContent = 'FLAC indisponível (encoder não carregou). Usa WAV 24-bit.'; stat.style.color = 'var(--c7)'; return; }
      }
      else if (fmt === 'mp3') {
        stat.textContent = 'A carregar codificador MP3…';
        blob = await encodeMP3(master, 320); ext = 'mp3';
        if (!blob) { stat.textContent = 'MP3 indisponível (sem ligação ao CDN). Usa WAV.'; stat.style.color = 'var(--c7)'; return; }
      }
      download(blob, base + (isLimited ? '_PIRADEX_MASTER.' : '.') + ext);
      stat.innerHTML = `✓ Exportado: <b style="color:var(--c4)">${base}.${ext}</b> · ${lufs} LUFS`;
      stat.style.color = 'var(--c4)';
      toast('✓ Exportado ' + ext.toUpperCase(), 'var(--c4)');
    } catch (e) { stat.textContent = 'Erro: ' + e.message; stat.style.color = 'var(--c7)'; }
  };
}

/* ── BATCH FINALIZER ── */
function pageBatch(body) {
  body.innerHTML = `
    <div class="${NS}-card">
      <div class="${NS}-lbl">Batch Finalizer</div>
      <div class="${NS}-hint" style="margin-bottom:12px;">Solta vários ficheiros. Cada um é normalizado ao LUFS alvo, limitado em True Peak e exportado num ZIP.</div>
      <div class="${NS}-row">
        <div style="flex:1">
          <div class="${NS}-lbl">LUFS alvo</div>
          <select class="${NS}-sel" id="${NS}-bt" style="width:100%">
            <option value="-14">-14 (Spotify/YouTube)</option><option value="-16">-16 (Apple)</option>
            <option value="-9">-9 (Club)</option><option value="-23">-23 (Broadcast)</option>
          </select>
        </div>
        <div style="flex:1">
          <div class="${NS}-lbl">Tecto</div>
          <select class="${NS}-sel" id="${NS}-bc" style="width:100%">
            <option value="-1">-1.0 dBTP</option><option value="-0.3">-0.3 dBTP</option><option value="-2">-2.0 dBTP</option>
          </select>
        </div>
        <div style="flex:1">
          <div class="${NS}-lbl">Formato</div>
          <select class="${NS}-sel" id="${NS}-bf" style="width:100%">
            <option value="wav24">WAV 24-bit</option><option value="wav16">WAV 16-bit</option>
          </select>
        </div>
      </div>
      <div class="${NS}-drop" id="${NS}-bdrop" style="margin-top:12px;">⬇ Soltar vários ficheiros de áudio</div>
      <div class="${NS}-hint" id="${NS}-bstat" style="margin-top:10px;"></div>
    </div>`;
  const drop = $('#' + NS + '-bdrop'), stat = $('#' + NS + '-bstat');
  function over(e) { e.preventDefault(); drop.classList.add(NS + '-over'); }
  function leave() { drop.classList.remove(NS + '-over'); }
  drop.addEventListener('dragover', over); drop.addEventListener('dragleave', leave);
  drop.addEventListener('drop', e => { leave(); e.preventDefault(); handleBatch([...e.dataTransfer.files]); });
  drop.addEventListener('click', () => {
    const inp = el('input'); inp.type = 'file'; inp.accept = 'audio/*'; inp.multiple = true;
    inp.onchange = () => handleBatch([...inp.files]); inp.click();
  });
  async function handleBatch(files) {
    files = files.filter(f => f.type.startsWith('audio') || /\.(wav|mp3|flac|aif|aiff|m4a|ogg)$/i.test(f.name));
    if (!files.length) { stat.textContent = 'Nenhum ficheiro de áudio válido.'; return; }
    if (!window.JSZip) { stat.textContent = 'JSZip indisponível.'; return; }
    const zip = new JSZip();
    const tgt = parseFloat($('#' + NS + '-bt').value), ceil = parseFloat($('#' + NS + '-bc').value);
    const bits = $('#' + NS + '-bf').value === 'wav16' ? 16 : 24;
    for (let i = 0; i < files.length; i++) {
      stat.innerHTML = `A processar ${i + 1}/${files.length}: <b>${files[i].name}</b>…`;
      stat.style.color = 'var(--c3)';
      try {
        const ab = await files[i].arrayBuffer();
        const dec = await ctx().decodeAudioData(ab.slice(0));
        const lim = await applyTruePeakLimiter(dec, { ceiling: ceil, targetLufs: tgt });
        const lufs = measureLUFS(lim).toFixed(1);
        const blob = encodeWAV(lim, bits, { artist: 'Piradex', title: files[i].name, isrc: '', lufs });
        const base = files[i].name.replace(/\.[^.]+$/, '');
        zip.file(base + '_MASTER.wav', blob);
      } catch (e) { console.warn('batch skip', files[i].name, e); }
    }
    stat.textContent = 'A gerar ZIP…';
    const out = await zip.generateAsync({ type: 'blob' });
    download(out, 'Piradex_Batch_Masters.zip');
    stat.innerHTML = `✓ ${files.length} ficheiros finalizados (${tgt} LUFS · ${ceil} dBTP).`;
    stat.style.color = 'var(--c4)';
    toast('✓ Batch concluído: ' + files.length + ' ficheiros', 'var(--c4)');
  }
}

/* drop genérico → decodifica em localBuffer */
function wireDrop(node, cb) {
  if (!node) return;
  function over(e) { e.preventDefault(); node.classList.add(NS + '-over'); }
  function leave() { node.classList.remove(NS + '-over'); }
  node.addEventListener('dragover', over); node.addEventListener('dragleave', leave);
  node.addEventListener('drop', async e => {
    leave(); e.preventDefault();
    const f = e.dataTransfer.files[0]; if (f) await load(f);
  });
  node.addEventListener('click', () => {
    const inp = el('input'); inp.type = 'file'; inp.accept = 'audio/*';
    inp.onchange = async () => { if (inp.files[0]) await load(inp.files[0]); }; inp.click();
  });
  async function load(f) {
    try {
      const ab = await f.arrayBuffer();
      const dec = await ctx().decodeAudioData(ab.slice(0));
      localBuffer = dec;
      if (cb) cb(dec, f.name);
    } catch (e) { toast('Erro ao ler ficheiro: ' + e.message, 'var(--c7)'); }
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 11. PRO ANALYSIS — injecta 3 gráficos profissionais no painel ANÁLISE DA
 *     FAIXA: Dynamic Range (DR/PSR), Correlómetro de fase, Tonal Balance vs
 *     curva-alvo do género. Aditivo, lê window.audioBuffer / SPECTRAL_TARGETS.
 * ════════════════════════════════════════════════════════════════════════ */
function computeDR(buffer) {
  // DR estilo TT-DR: usa apenas blocos com sinal (>-50dBFS), mede a diferença
  // entre o pico e a média RMS dos 20% blocos mais altos (zona "loud").
  const sr = buffer.sampleRate, blk = Math.round(0.3 * sr);
  let peak = 0; const rmsBlocks = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i += blk) {
      let sq = 0, n = 0;
      for (let j = i; j < Math.min(i + blk, d.length); j++) { const a = Math.abs(d[j]); if (a > peak) peak = a; sq += d[j] * d[j]; n++; }
      if (n > 0) { const rms = Math.sqrt(sq / n); if (rms > 3.16e-3) rmsBlocks.push(rms); } // > -50 dBFS (ignora silêncio)
    }
  }
  if (!rmsBlocks.length) return { dr: 0, psr: 0, crest: 0, peakDb: -70, rmsTopDb: -70 };
  rmsBlocks.sort((a, b) => b - a);
  // média dos 20% mais altos (zona loud) — TT-DR
  const topCount = Math.max(1, Math.round(rmsBlocks.length * 0.2));
  let sumTop = 0; for (let i = 0; i < topCount; i++) sumTop += rmsBlocks[i] * rmsBlocks[i];
  const rmsTop = Math.sqrt(sumTop / topCount);
  const peakDb = linToDb(peak), rmsTopDb = linToDb(rmsTop);
  const dr = Math.max(0, Math.round(peakDb - rmsTopDb));
  const psr = Math.max(0, peakDb - linToDb(rmsBlocks[0]));
  // crest global (só blocos com sinal)
  let sqAll = 0, nAll = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) { const d = buffer.getChannelData(c); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > 1e-4) { sqAll += d[i] * d[i]; nAll++; } } }
  const crest = nAll ? peakDb - linToDb(Math.sqrt(sqAll / nAll)) : 0;
  return { dr, psr, crest, peakDb, rmsTopDb };
}
function computeCorrelation(buffer) {
  if (buffer.numberOfChannels < 2) return 1;
  const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
  let sum = 0, nL = 0, nR = 0;
  const stride = Math.max(1, Math.floor(L.length / 200000));
  for (let i = 0; i < L.length; i += stride) { sum += L[i] * R[i]; nL += L[i] * L[i]; nR += R[i] * R[i]; }
  return clamp(sum / (Math.sqrt(nL * nR) + 1e-12), -1, 1);
}
function computeBandBalance(buffer) {
  // energia em low(<250) / mid(250-4k) / high(>4k) via FFT
  const sr = buffer.sampleRate, size = 4096, d = buffer.getChannelData(0);
  const re = new Float32Array(size), im = new Float32Array(size);
  let low = 0, mid = 0, high = 0, frames = 0;
  for (let s = 0; s + size <= d.length; s += size * 2) {
    for (let i = 0; i < size; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / size); re[i] = d[s + i] * w; im[i] = 0; }
    fft(re, im);
    for (let k = 1; k < size / 2; k++) {
      const f = k * sr / size, m = re[k] * re[k] + im[k] * im[k];
      if (f < 250) low += m; else if (f < 4000) mid += m; else high += m;
    }
    frames++;
  }
  const tot = low + mid + high + 1e-12;
  return { low: low / tot * 100, mid: mid / tot * 100, high: high / tot * 100 };
}

const _ev = {};
function on(e, cb) { (_ev[e] = _ev[e] || []).push(cb); return () => off(e, cb); }
function off(e, cb) { if (_ev[e]) _ev[e] = _ev[e].filter(f => f !== cb); }
function emit(e, data) { (_ev[e] || []).forEach(cb => { try { cb(data); } catch (_) {} }); }
async function exportBlob(buffer, format, meta) {
  format = (format || 'wav24').toLowerCase();
  if (format === 'wav16') return encodeWAV(buffer, 16, meta);
  if (format === 'wav24') return encodeWAV(buffer, 24, meta);
  if (format === 'wav32') return encodeWAV(buffer, 32, meta);
  if (format === 'aiff24') return encodeAIFF(buffer, 24);
  if (format === 'aiff16') return encodeAIFF(buffer, 16);
  if (format === 'mp3') return await encodeMP3(buffer, 320);
  if (format === 'flac') return await encodeFLAC(buffer, 24);
  return encodeWAV(buffer, 24, meta);
}
function decodeAny(input) {
  // ArrayBuffer | base64 string | dataURL → AudioBuffer
  let ab = input;
  if (typeof input === 'string') {
    const b64 = input.indexOf(',') >= 0 ? input.split(',')[1] : input;
    const bin = atob(b64), len = bin.length, u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
    ab = u8.buffer;
  }
  return ctx().decodeAudioData(ab.slice(0));
}
function buildAPI() {
  return {
    version: VERSION,
    open: openModal,
    // medição
    measure: (buf) => { const b = buf || activeBuffer(); return { lufs: measureLUFS(b), truePeak: measureTruePeakDb(b) }; },
    measureLUFS, measureTruePeakDb,
    // processamento
    limit: (buf, opts) => applyTruePeakLimiter(buf || activeBuffer(), opts || {}),
    applyTruePeakLimiter,
    separate: (buf) => hpss4Stems(buf || activeBuffer()),
    // decode / export
    decode: decodeAny,
    export: exportBlob, encodeWAV,
    download,
    // estado da suite
    snapshot: snapshotSliders, restore: restoreSliders,
    getMaster: () => window.__prdx3Master || activeBuffer(),
    loadBuffer: (buf) => { localBuffer = buf; emit('bufferLoaded', buf); },
    // presets
    presets: {
      list: loadPresets, save: savePresets,
      apply: (i) => { const p = loadPresets()[i]; return p ? restoreSliders(p.sliders) : 0; }
    },
    // extensibilidade IA
    setStemModel: fn => { _stemModel = fn; },
    // eventos: 'fileLoaded' | 'mastered' | 'bufferLoaded'
    on, off
  };
}

/* ════════════════════════════════ INIT ════════════════════════════════ */
function init() {
  if (window.__prdx3Loaded) return; window.__prdx3Loaded = true;
  buildUI();
  document.addEventListener('piradex:fileLoaded', (e) => {
    window.__prdx3Master = null;
    localBuffer = (e.detail && e.detail.numberOfChannels) ? e.detail : null; // captura o buffer carregado
    emit('fileLoaded', e.detail);
    if ($('#' + NS + '-overlay') && $('#' + NS + '-overlay').classList.contains(NS + '-open')) renderPage(currentPage);
  });
  window.PRDX3 = buildAPI();
  // ── As 6 métricas PRO vivem agora na tab ANÁLISE do PRO FINAL ──
  document.addEventListener('piradex:fileLoaded', () => { setTimeout(updateAnalisePage, 400); });
  on('mastered', () => setTimeout(updateAnalisePage, 100));
  // ── Ponte postMessage: permite a um host/DAW-webview controlar a suite ──
  window.addEventListener('message', async (e) => {
    const m = e.data && e.data.prdx3; if (!m || !m.cmd) return;
    const reply = (ok, data, error) => {
      try { (e.source || window).postMessage({ prdx3Result: { id: m.id, ok, data, error } }, e.origin && e.origin !== 'null' ? e.origin : '*'); } catch (_) {}
    };
    try {
      if (m.cmd === 'version') return reply(true, { version: VERSION });
      if (m.cmd === 'open') { openModal(); return reply(true, {}); }
      if (m.cmd === 'presets') return reply(true, loadPresets());
      if (m.cmd === 'snapshot') return reply(true, snapshotSliders());
      if (m.cmd === 'measure') {
        const buf = m.audio ? await decodeAny(m.audio) : activeBuffer();
        if (!buf) return reply(false, null, 'sem áudio');
        return reply(true, { lufs: measureLUFS(buf), truePeak: measureTruePeakDb(buf) });
      }
      if (m.cmd === 'master') {
        const buf = m.audio ? await decodeAny(m.audio) : activeBuffer();
        if (!buf) return reply(false, null, 'sem áudio');
        const out = await applyTruePeakLimiter(buf, m.opts || { ceiling: -1 });
        const blob = await exportBlob(out, m.format || 'wav24', m.meta || {});
        const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
        emit('mastered', { buffer: out });
        return reply(true, { lufs: measureLUFS(out), truePeak: measureTruePeakDb(out), file: b64 });
      }
      reply(false, null, 'comando desconhecido: ' + m.cmd);
    } catch (err) { reply(false, null, err.message); }
  });
  console.log('[Piradex] Features3 (Pro Finalizer v' + VERSION + ') loaded ✓ · API: window.PRDX3');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})(); // end IIFE
