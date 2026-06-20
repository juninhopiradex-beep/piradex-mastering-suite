/* ═══════════════════════════════════════════════════════════════════════════
 * VOICE LAB — Auto-Tune para voz isolada (snap mode)
 * Pipeline:
 *   1) Carregar stem isolado
 *   2) Detecção de escala (Krumhansl-Schmuckler)
 *   3) Pitch tracking janela-a-janela
 *   4) Snap target = nota mais próxima da escala detectada
 *   5) Phase vocoder com shift variável por janela
 *   6) A/B player + export WAV
 * ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

let vlBuffer = null;          // AudioBuffer original
let vlTunedBuffer = null;     // AudioBuffer após auto-tune
let vlAnalysis = null;        // { key, mode, pitchTrack, scaleNotes, ... }
let vlPlayingSource = null;
let vlPlayingCtx = null;

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const MAJOR_PATTERN = [0,2,4,5,7,9,11];
const MINOR_PATTERN = [0,2,3,5,7,8,10];
const MAJOR_PROFILE = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const MINOR_PROFILE = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

function vlStatus(msg, color){
  const el = document.getElementById('vl-status');
  if(el) el.innerHTML = `<span style="color:${color||'var(--muted)'}">${msg}</span>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. CARREGAR FICHEIRO
// ═══════════════════════════════════════════════════════════════════════════
window.vlLoadFile = async function(file){
  if(!file) return;
  vlStatus(`A carregar ${file.name}...`, 'var(--c5)');
  try{
    const ctx = window.audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    if(!window.audioCtx) window.audioCtx = ctx;
    const arrayBuffer = await file.arrayBuffer();
    vlBuffer = await ctx.decodeAudioData(arrayBuffer);
    vlTunedBuffer = null;
    vlAnalysis = null;

    const info = document.getElementById('vl-info');
    if(info){
      info.style.display = 'block';
      info.innerHTML = `
        <div style="color:var(--c4);font-weight:700;">✓ ${file.name}</div>
        <div style="color:var(--muted);margin-top:4px;">
          ${vlBuffer.duration.toFixed(1)}s · ${vlBuffer.sampleRate} Hz · ${vlBuffer.numberOfChannels} canal(is)
        </div>
      `;
    }

    document.getElementById('vl-btn-analyze').disabled = false;
    document.getElementById('vl-play-orig').disabled = false;
    document.getElementById('vl-btn-apply').disabled = true;
    document.getElementById('vl-play-tuned').disabled = true;
    document.getElementById('vl-export-wav').disabled = true;
    document.getElementById('vl-export-mp3').disabled = true;
    document.getElementById('vl-send-master').disabled = true;
    vlStatus('Pronto para analisar', 'var(--c4)');
    _drawPianoRoll();
  } catch(e){
    vlStatus(`Erro ao carregar: ${e.message}`, 'var(--c7)');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. ANALISAR — escala + pitch track
// ═══════════════════════════════════════════════════════════════════════════
window.vlAnalyze = function(){
  if(!vlBuffer){ vlStatus('Carrega um ficheiro primeiro', 'var(--c7)'); return; }
  vlStatus('A analisar... (pitch tracking + detecção de escala)', 'var(--c5)');

  setTimeout(()=>{
    const ch = vlBuffer.getChannelData(0);
    const sr = vlBuffer.sampleRate;
    const N = ch.length;

    const FFT = 2048;
    const HOP = 512;          // mais hops = mais resolução temporal
    const minPeriod = Math.floor(sr/1100);   // ~C6
    const maxPeriod = Math.floor(sr/65);     // ~C2

    const noteHistogram = new Array(12).fill(0);
    const pitchTrack = [];    // { time, semi, note, octave, conf, cents }
    let totalSamples = 0;

    for(let pos=0; pos+FFT<N; pos+=HOP){
      // energy gate
      let energy = 0;
      for(let i=pos; i<pos+FFT; i++) energy += ch[i]*ch[i];
      energy /= FFT;
      if(energy < 0.00005){
        pitchTrack.push({ time: pos/sr, semi: null, note: null, octave: null, conf: 0, cents: 0, silent: true });
        continue;
      }

      // autocorrelation
      let bestPeriod = 0, bestCorr = 0;
      for(let p=minPeriod; p<maxPeriod && p<FFT/2; p++){
        let corr=0, na=0, nb=0;
        for(let i=0; i<FFT-p; i++){
          const a = ch[pos+i], b = ch[pos+i+p];
          corr += a*b; na += a*a; nb += b*b;
        }
        const norm = corr / (Math.sqrt(na*nb)+1e-10);
        if(norm > bestCorr){ bestCorr = norm; bestPeriod = p; }
      }

      if(bestPeriod > 0 && bestCorr > 0.45){
        // parabolic refinement
        if(bestPeriod > minPeriod+1 && bestPeriod < maxPeriod-1){
          const cc = (p)=>{
            let c=0, na=0, nb=0;
            for(let i=0;i<FFT-p;i++){
              const a=ch[pos+i], b=ch[pos+i+p];
              c+=a*b; na+=a*a; nb+=b*b;
            }
            return c/(Math.sqrt(na*nb)+1e-10);
          };
          const y0 = cc(bestPeriod-1), y1 = bestCorr, y2 = cc(bestPeriod+1);
          const denom = (y0 - 2*y1 + y2);
          if(Math.abs(denom) > 1e-6){
            const delta = 0.5 * (y0 - y2) / denom;
            if(Math.abs(delta) < 1) bestPeriod += delta;
          }
        }

        const freq = sr / bestPeriod;
        if(freq > 65 && freq < 1100){
          const semitonesFromA4 = 12 * Math.log2(freq/440);
          const nearestSemi = Math.round(semitonesFromA4);
          const cents = (semitonesFromA4 - nearestSemi) * 100;
          const noteIdx = ((nearestSemi + 9 + 12000) % 12);
          // MIDI: A4 = 69 → semi 0 = MIDI 69
          const midi = nearestSemi + 69;
          noteHistogram[noteIdx]++;
          totalSamples++;
          pitchTrack.push({
            time: pos/sr,
            semi: semitonesFromA4,    // semitons exatos (com cents)
            note: noteIdx,
            octave: Math.floor(midi/12) - 1,
            midi: midi,
            conf: bestCorr,
            cents: cents,
            silent: false
          });
        } else {
          pitchTrack.push({ time: pos/sr, silent: true });
        }
      } else {
        pitchTrack.push({ time: pos/sr, silent: true });
      }
    }

    if(totalSamples < 20){
      vlStatus('⚠ Poucas notas detectadas — verifica se é mesmo voz isolada', 'var(--c2)');
      return;
    }

    // Krumhansl-Schmuckler key detection
    let bestKey=0, bestMode='maior', bestCorr=-Infinity;
    for(let root=0; root<12; root++){
      let cM=0, cm=0;
      for(let i=0; i<12; i++){
        cM += noteHistogram[(root+i)%12] * MAJOR_PROFILE[i];
        cm += noteHistogram[(root+i)%12] * MINOR_PROFILE[i];
      }
      if(cM > bestCorr){ bestCorr = cM; bestKey = root; bestMode = 'maior'; }
      if(cm > bestCorr){ bestCorr = cm; bestKey = root; bestMode = 'menor'; }
    }

    const scaleNotes = (bestMode==='maior'?MAJOR_PATTERN:MINOR_PATTERN).map(o=>(bestKey+o)%12);

    // % notas na escala
    let inScale=0, outScale=0;
    pitchTrack.forEach(p=>{
      if(p.silent) return;
      if(scaleNotes.includes(p.note)) inScale++; else outScale++;
    });
    const pctInScale = inScale/(inScale+outScale)*100;

    vlAnalysis = {
      key: NOTE_NAMES[bestKey],
      keyIdx: bestKey,
      mode: bestMode,
      pitchTrack: pitchTrack,
      scaleNotes: scaleNotes,
      totalSamples: totalSamples,
      pctInScale: pctInScale,
      duration: vlBuffer.duration,
      hopSize: HOP,
      fftSize: FFT
    };

    document.getElementById('vl-key').textContent = `${NOTE_NAMES[bestKey]} ${bestMode}`;
    document.getElementById('vl-key-info').innerHTML =
      `${totalSamples} notas · <span style="color:${pctInScale>85?'var(--c4)':pctInScale>70?'var(--c3)':'var(--c2)'};">${pctInScale.toFixed(1)}% na escala</span>`;

    document.getElementById('vl-btn-apply').disabled = false;
    vlStatus(`✓ Escala detectada: ${NOTE_NAMES[bestKey]} ${bestMode} (${totalSamples} notas analisadas)`, 'var(--c4)');
    _drawPianoRoll();
  }, 50);
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. APLICAR AUTO-TUNE — phase vocoder com shift variável por janela
// ═══════════════════════════════════════════════════════════════════════════
window.vlApply = async function(){
  if(!vlAnalysis){ vlStatus('Analisa primeiro', 'var(--c7)'); return; }
  const strength = parseInt(document.getElementById('vl-strength').value)/100;
  const retuneSpeed = parseInt(document.getElementById('vl-speed').value);   // ms

  vlStatus('⏳ A aplicar Auto-Tune... (phase vocoder offline, isto pode demorar)', 'var(--c5)');
  document.getElementById('vl-btn-apply').disabled = true;

  setTimeout(async ()=>{
    try {
      const t0 = performance.now();

      // Calcula shift target (em cents) por cada hop da análise
      const sr = vlBuffer.sampleRate;
      const HOP = vlAnalysis.hopSize;
      const FFT = vlAnalysis.fftSize;
      const N = vlBuffer.length;
      const scale = vlAnalysis.scaleNotes;
      const keyIdx = vlAnalysis.keyIdx;

      // Para cada hop, calcula o shift em semitons para snap à nota da escala
      const numHops = Math.floor((N-FFT)/HOP) + 1;
      const shiftSemis = new Float32Array(numHops);

      const track = vlAnalysis.pitchTrack;
      for(let h=0; h<numHops; h++){
        const p = track[h];
        if(!p || p.silent || p.semi === null || p.semi === undefined){
          shiftSemis[h] = 0;
          continue;
        }
        // semi atual (com cents)
        const semiNow = p.semi;
        // nota mais próxima dentro da escala
        const semiNearest = Math.round(semiNow);
        const noteIdx = ((semiNearest + 9 + 12000) % 12);
        let targetSemi = semiNearest;
        if(!scale.includes(noteIdx)){
          // procura nota na escala mais próxima (em ±6 semitons)
          let bestDelta = 99;
          for(let d=-6; d<=6; d++){
            const candIdx = ((semiNearest + d + 9 + 12000) % 12);
            if(scale.includes(candIdx) && Math.abs(d) < Math.abs(bestDelta)){
              bestDelta = d;
            }
          }
          if(bestDelta !== 99) targetSemi = semiNearest + bestDelta;
        }
        // shift = (target - actual)
        const shift = (targetSemi - semiNow) * strength;
        shiftSemis[h] = shift;
      }

      // Suaviza com retune speed
      if(retuneSpeed > 0){
        const hopMs = HOP/sr*1000;
        const alpha = Math.exp(-hopMs/retuneSpeed);
        let prev = shiftSemis[0];
        for(let h=0; h<numHops; h++){
          prev = alpha*prev + (1-alpha)*shiftSemis[h];
          shiftSemis[h] = prev;
        }
      }

      // Processa offline: phase vocoder com shift por janela
      vlTunedBuffer = await _autoTuneProcess(vlBuffer, shiftSemis, FFT, HOP);

      const t1 = performance.now();
      vlStatus(`✓ Auto-Tune aplicado em ${((t1-t0)/1000).toFixed(1)}s`, 'var(--c4)');

      document.getElementById('vl-play-tuned').disabled = false;
      document.getElementById('vl-export-wav').disabled = false;
      document.getElementById('vl-export-mp3').disabled = false;
      document.getElementById('vl-send-master').disabled = false;
      document.getElementById('vl-btn-apply').disabled = false;

      _drawPianoRoll();
    } catch(e){
      vlStatus(`Erro: ${e.message}`, 'var(--c7)');
      document.getElementById('vl-btn-apply').disabled = false;
    }
  }, 30);
};

// ═══════════════════════════════════════════════════════════════════════════
// FFT (Cooley-Tukey radix-2)
// ═══════════════════════════════════════════════════════════════════════════
function _fft(real, imag, n){
  let j=0;
  for(let i=1; i<n; i++){
    let bit = n>>1;
    while(j & bit){ j ^= bit; bit >>= 1; }
    j ^= bit;
    if(i<j){
      [real[i],real[j]] = [real[j],real[i]];
      [imag[i],imag[j]] = [imag[j],imag[i]];
    }
  }
  for(let size=2; size<=n; size<<=1){
    const half = size>>1;
    const step = -2*Math.PI/size;
    for(let i=0; i<n; i+=size){
      for(let k=0; k<half; k++){
        const ang = step*k;
        const cs = Math.cos(ang), sn = Math.sin(ang);
        const tre = cs*real[i+k+half] - sn*imag[i+k+half];
        const tim = sn*real[i+k+half] + cs*imag[i+k+half];
        real[i+k+half] = real[i+k] - tre;
        imag[i+k+half] = imag[i+k] - tim;
        real[i+k] += tre;
        imag[i+k] += tim;
      }
    }
  }
}
function _ifft(real, imag, n){
  for(let i=0;i<n;i++) imag[i] = -imag[i];
  _fft(real, imag, n);
  for(let i=0;i<n;i++){ real[i]/=n; imag[i] = -imag[i]/n; }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE VOCODER com shift variável por hop
// Para cada janela aplica time-stretch + resample com ratio próprio.
// Para manter duração: pitch shift via STFT manipulation + linear resample.
// ═══════════════════════════════════════════════════════════════════════════
async function _autoTuneProcess(inputBuffer, shiftSemis, FFT, HOP){
  const sr = inputBuffer.sampleRate;
  const numCh = inputBuffer.numberOfChannels;
  const N = inputBuffer.length;
  const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(numCh, N, sr);
  const out = ctx.createBuffer(numCh, N, sr);

  // Janela Hann
  const window = new Float32Array(FFT);
  for(let i=0;i<FFT;i++) window[i] = 0.5*(1 - Math.cos(2*Math.PI*i/(FFT-1)));

  for(let c=0; c<numCh; c++){
    const inData = inputBuffer.getChannelData(c);
    const outData = out.getChannelData(c);
    const accum = new Float32Array(N);

    const real = new Float32Array(FFT);
    const imag = new Float32Array(FFT);
    const lastPhase = new Float32Array(FFT/2+1);
    const sumPhase = new Float32Array(FFT/2+1);
    const magBins = new Float32Array(FFT/2+1);
    const freqBins = new Float32Array(FFT/2+1);

    let hopIdx = 0;
    for(let pos=0; pos+FFT<N; pos+=HOP, hopIdx++){
      // ratio para este hop
      const semis = shiftSemis[hopIdx] || 0;
      const ratio = Math.pow(2, semis/12);

      // copia janelada
      for(let i=0;i<FFT;i++) real[i] = (inData[pos+i]||0) * window[i];
      imag.fill(0);
      _fft(real, imag, FFT);

      // analisa magnitude e fase, computa freq instantânea
      for(let k=0; k<=FFT/2; k++){
        const mag = Math.sqrt(real[k]*real[k] + imag[k]*imag[k]);
        const phase = Math.atan2(imag[k], real[k]);
        let delta = phase - lastPhase[k];
        lastPhase[k] = phase;
        delta -= HOP * 2*Math.PI*k/FFT;
        delta = delta - 2*Math.PI*Math.round(delta/(2*Math.PI));
        const freq = 2*Math.PI*k/FFT + delta/HOP;
        magBins[k] = mag;
        freqBins[k] = freq;
      }

      // pitch shift no domínio espectral: para cada bin, multiplica freq por ratio,
      // remapeia para o bin destino (k_new = k * ratio)
      const newMag = new Float32Array(FFT/2+1);
      const newFreq = new Float32Array(FFT/2+1);
      for(let k=0; k<=FFT/2; k++){
        const targetK = Math.round(k * ratio);
        if(targetK >= 0 && targetK <= FFT/2){
          // soma se já há energia (collision = pick max)
          if(magBins[k] > newMag[targetK]){
            newMag[targetK] = magBins[k];
            newFreq[targetK] = freqBins[k] * ratio;
          }
        }
      }

      // resynthesis: acumula fase
      for(let k=0; k<=FFT/2; k++){
        sumPhase[k] += newFreq[k] * HOP;
        const ph = sumPhase[k];
        real[k] = newMag[k] * Math.cos(ph);
        imag[k] = newMag[k] * Math.sin(ph);
      }
      // espelha para simetria
      for(let k=1; k<FFT/2; k++){
        real[FFT-k] = real[k];
        imag[FFT-k] = -imag[k];
      }
      _ifft(real, imag, FFT);

      // overlap-add (com mesmo HOP = duração preservada)
      for(let i=0; i<FFT; i++){
        if(pos+i < N){
          outData[pos+i] += real[i] * window[i];
          accum[pos+i] += window[i]*window[i];
        }
      }

      // libertar event loop a cada 100 hops
      if(hopIdx % 100 === 99){
        await new Promise(r=>setTimeout(r,0));
      }
    }

    // normaliza pelo overlap accumulator
    for(let i=0;i<N;i++){
      if(accum[i] > 0.001) outData[i] /= accum[i];
    }
  }

  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER A/B
// ═══════════════════════════════════════════════════════════════════════════
window.vlPlay = function(which){
  vlStop();
  const buf = which==='tuned' ? vlTunedBuffer : vlBuffer;
  if(!buf){ vlStatus('Buffer indisponível', 'var(--c7)'); return; }
  const ctx = window.audioCtx || new (window.AudioContext||window.webkitAudioContext)();
  if(!window.audioCtx) window.audioCtx = ctx;
  vlPlayingSource = ctx.createBufferSource();
  vlPlayingSource.buffer = buf;
  vlPlayingSource.connect(ctx.destination);
  vlPlayingSource.start();
  vlPlayingCtx = ctx;
  vlStatus(`▶ A tocar ${which==='tuned'?'AUTO-TUNED':'ORIGINAL'}`, which==='tuned'?'var(--c1)':'var(--c5)');
  vlPlayingSource.onended = ()=>{ vlPlayingSource = null; };
};
window.vlStop = function(){
  if(vlPlayingSource){
    try{ vlPlayingSource.stop(); }catch(e){}
    vlPlayingSource = null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT WAV (16-bit PCM)
// ═══════════════════════════════════════════════════════════════════════════
window.vlExport = function(format){
  if(!vlTunedBuffer){ vlStatus('Aplica o Auto-Tune primeiro', 'var(--c7)'); return; }
  if(format === 'wav'){
    const blob = _bufferToWav(vlTunedBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicelab_autotuned_${Date.now()}.wav`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    vlStatus('✓ Exportado WAV', 'var(--c4)');
  } else {
    vlStatus('MP3 export precisa de lamejs — usa WAV por agora', 'var(--c3)');
  }
};
function _bufferToWav(buffer){
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const N = buffer.length;
  const buffOut = new ArrayBuffer(44 + N*numCh*2);
  const view = new DataView(buffOut);
  // RIFF header
  const writeStr = (off, s)=>{ for(let i=0;i<s.length;i++) view.setUint8(off+i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + N*numCh*2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr*numCh*2, true);
  view.setUint16(32, numCh*2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, N*numCh*2, true);
  // PCM 16-bit
  let off = 44;
  const chs = [];
  for(let c=0;c<numCh;c++) chs.push(buffer.getChannelData(c));
  for(let i=0;i<N;i++){
    for(let c=0;c<numCh;c++){
      let s = Math.max(-1, Math.min(1, chs[c][i]));
      s = s<0 ? s*0x8000 : s*0x7FFF;
      view.setInt16(off, s|0, true);
      off += 2;
    }
  }
  return new Blob([buffOut], { type: 'audio/wav' });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENVIAR PARA MASTER
// ═══════════════════════════════════════════════════════════════════════════
window.vlSendToMaster = function(){
  if(!vlTunedBuffer){ vlStatus('Aplica o Auto-Tune primeiro', 'var(--c7)'); return; }
  window.audioBuffer = vlTunedBuffer;
  vlStatus('✓ Buffer enviado para o MASTER. Muda para o separador MASTER para masterizar.', 'var(--c5)');
};

// ═══════════════════════════════════════════════════════════════════════════
// PIANO ROLL: pre + post comparison
// ═══════════════════════════════════════════════════════════════════════════
function _drawPianoRoll(){
  const cv = document.getElementById('vl-pianoroll');
  if(!cv) return;
  const W = cv.offsetWidth || cv.width;
  cv.width = W;
  const H = cv.height;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#07070e';
  ctx.fillRect(0,0,W,H);

  // grid de teclas (~3 oitavas, MIDI 48-84 = C3 a C6)
  const minMidi = 48, maxMidi = 84;
  const noteHeight = (H-30) / (maxMidi-minMidi);
  for(let m=minMidi; m<=maxMidi; m++){
    const y = H-15 - (m-minMidi)*noteHeight;
    const isBlack = [1,3,6,8,10].includes(m%12);
    if(isBlack){
      ctx.fillStyle = 'rgba(80,80,100,0.15)';
      ctx.fillRect(35, y-noteHeight, W-35, noteHeight);
    }
    if(m%12===0){  // C de cada oitava
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(35,y); ctx.lineTo(W,y); ctx.stroke();
      ctx.fillStyle = 'rgba(160,160,180,0.7)';
      ctx.font = '9px monospace';
      ctx.fillText(`C${Math.floor(m/12)-1}`, 5, y-2);
    }
  }

  // destaca notas da escala (se análise existe)
  if(vlAnalysis){
    const scale = vlAnalysis.scaleNotes;
    for(let m=minMidi; m<=maxMidi; m++){
      if(scale.includes(m%12)){
        const y = H-15 - (m-minMidi)*noteHeight;
        ctx.fillStyle = 'rgba(45,255,138,0.06)';
        ctx.fillRect(35, y-noteHeight, W-35, noteHeight);
      }
    }
    // título da escala
    ctx.fillStyle = 'rgba(45,255,138,0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Escala: ${vlAnalysis.key} ${vlAnalysis.mode}`, 40, 14);
  }

  if(!vlBuffer){
    ctx.fillStyle = 'rgba(140,140,160,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText('Carrega um stem de voz isolada para começar', W/2-120, H/2);
    return;
  }
  const dur = vlBuffer.duration;
  // grid de tempo
  const tickSec = Math.max(2, Math.floor(dur/10));
  for(let t=0; t<=dur; t+=tickSec){
    const x = 35 + (t/dur)*(W-40);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H-15); ctx.stroke();
    ctx.fillStyle = 'rgba(140,140,160,0.7)';
    ctx.font = '8px monospace';
    ctx.fillText(`${t}s`, x-6, H-3);
  }

  // pontos ORIGINAIS (cinzento)
  if(vlAnalysis && vlAnalysis.pitchTrack){
    ctx.fillStyle = 'rgba(180,180,200,0.7)';
    vlAnalysis.pitchTrack.forEach(p=>{
      if(p.silent) return;
      const x = 35 + (p.time/dur)*(W-40);
      const midi = p.midi;
      if(midi < minMidi || midi > maxMidi) return;
      const y = H-15 - (midi-minMidi)*noteHeight + p.cents/100*noteHeight;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI*2);
      ctx.fill();
    });
  }

  // pontos AUTO-TUNED (rosa quente)
  if(vlAnalysis && vlAnalysis.pitchTrack && vlTunedBuffer){
    ctx.fillStyle = 'rgba(255,58,181,0.9)';
    const scale = vlAnalysis.scaleNotes;
    vlAnalysis.pitchTrack.forEach(p=>{
      if(p.silent) return;
      const x = 35 + (p.time/dur)*(W-40);
      // calcula target (mesma lógica do apply)
      const semiNow = p.semi;
      const semiNearest = Math.round(semiNow);
      const noteIdx = ((semiNearest + 9 + 12000) % 12);
      let targetSemi = semiNearest;
      if(!scale.includes(noteIdx)){
        let bestDelta = 99;
        for(let d=-6; d<=6; d++){
          const candIdx = ((semiNearest + d + 9 + 12000) % 12);
          if(scale.includes(candIdx) && Math.abs(d) < Math.abs(bestDelta)){
            bestDelta = d;
          }
        }
        if(bestDelta !== 99) targetSemi = semiNearest + bestDelta;
      }
      const targetMidi = targetSemi + 69;
      if(targetMidi < minMidi || targetMidi > maxMidi) return;
      const y = H-15 - (targetMidi-minMidi)*noteHeight;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI*2);
      ctx.fill();
    });
  }

  // legenda
  ctx.fillStyle = 'rgba(180,180,200,0.85)';
  ctx.font = '10px monospace';
  ctx.fillText('● original', W-200, 14);
  ctx.fillStyle = 'rgba(255,58,181,0.95)';
  ctx.fillText('● auto-tuned', W-110, 14);
}

// hook openTab para inicializar
const _vlOrigOpenTab = window.openTab;
window.openTab = function(name, el){
  if(_vlOrigOpenTab) _vlOrigOpenTab(name, el);
  if(name === 'voicelab'){
    setTimeout(()=>_drawPianoRoll(), 50);
  }
};

})();
