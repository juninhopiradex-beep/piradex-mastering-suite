/* ═══════════════════════════════════════════════════════════════════════════
 * VOICE LAB v2.1 — Piradex Mastering Suite
 * 3 modos de escuta: ORIGINAL · PREVIEW (tempo real) · RESULTADO (offline)
 * 5 passos com detalhe completo: Clean → Shape → Control → Tune → Space
 * + Vocal Aligner
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Estado ──────────────────────────────────────────────────────────── */
  let vlBuffer = null;
  let vlProcessedBuffer = null;
  let vlPlayingSource = null;
  let vlCtx = null;

  // Preview chain (nós Web Audio em tempo real)
  let vlPreviewActive = false;
  let vlPreviewSource = null;
  let vlPreviewNodes = null;

  // Auto-tune
  let vlAnalysis = null;
  let vlTunedBuffer = null;

  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const MAJOR_PATTERN = [0,2,4,5,7,9,11];
  const MINOR_PATTERN = [0,2,3,5,7,8,10];
  const MAJOR_PROFILE = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
  const MINOR_PROFILE = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function vlStatus(msg, color) {
    var el = document.getElementById('vl-status');
    if (el) el.innerHTML = '<span style="color:' + (color || 'var(--muted)') + ';">' + msg + '</span>';
  }

  function getCtx() {
    if (!vlCtx || vlCtx.state === 'closed') {
      vlCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (vlCtx.state === 'suspended') vlCtx.resume();
    return vlCtx;
  }

  function setStepState(step, state) {
    var el = document.getElementById('vl-step-' + step);
    if (!el) return;
    var colors = { idle: 'var(--border2)', active: 'var(--c5)', done: 'var(--c4)' };
    el.style.borderColor = colors[state] || 'var(--border2)';
    var badge = el.querySelector('.vl-step-badge');
    if (badge) {
      badge.style.background = state === 'done' ? 'var(--c4)' : state === 'active' ? 'var(--c5)' : 'var(--bg3)';
      badge.style.color = (state === 'active' || state === 'done') ? '#000' : 'var(--muted)';
      badge.style.borderColor = colors[state] || 'var(--border2)';
    }
  }

  window.vlToggleDetail = function (step) {
    var detail = document.getElementById('vl-detail-' + step);
    if (!detail) return;
    var isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    var btn = document.getElementById('vl-detail-btn-' + step);
    if (btn) btn.textContent = isOpen ? '⚙ DETALHE' : '▲ FECHAR';
    if (!isOpen && step === 4) setTimeout(_drawPianoRoll, 50);
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CARREGAR FICHEIRO
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlLoadFile = async function (file) {
    if (!file) return;
    vlStatus('A carregar ' + file.name + '...', 'var(--c5)');
    try {
      var ctx = getCtx();
      var arrayBuffer = await file.arrayBuffer();
      vlBuffer = await new Promise(function (resolve, reject) {
        ctx.decodeAudioData(arrayBuffer, resolve, reject);
      });
      vlProcessedBuffer = null; vlTunedBuffer = null; vlAnalysis = null;

      var info = document.getElementById('vl-info');
      if (info) {
        info.style.display = 'block';
        info.innerHTML = '<div style="color:var(--c4);font-weight:700;">✓ ' + file.name + '</div>' +
          '<div style="color:var(--muted);margin-top:3px;">' + vlBuffer.duration.toFixed(1) + 's · ' + vlBuffer.sampleRate + ' Hz · ' + vlBuffer.numberOfChannels + ' canal(is)</div>';
      }

      ['1','2','3','4','5'].forEach(function (s) { setStepState(s, 'idle'); });
      _setBtn('vl-play-orig', false);
      _setBtn('vl-play-preview', false);
      _setBtn('vl-play-result', true);
      _setBtn('vl-export-wav', true);
      _setBtn('vl-send-master', true);
      _setBtn('vl-btn-process', false);

      vlStatus('✓ Ficheiro carregado — ajusta os passos, usa PREVIEW para ouvir, depois PROCESSAR', 'var(--c4)');
      _drawDropWave();
    } catch (e) {
      vlStatus('Erro ao carregar: ' + e.message, 'var(--c7)');
      console.error('[VoiceLab]', e);
    }
  };

  function _setBtn(id, disabled) {
    var el = document.getElementById(id);
    if (el) el.disabled = disabled;
  }

  window.vlInitDrop = function () {
    var zone = document.getElementById('vl-dropzone');
    if (!zone || zone._dropInit) return;
    zone._dropInit = true;
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.style.borderColor = 'var(--c1)'; });
    zone.addEventListener('dragleave', function () { zone.style.borderColor = ''; });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.style.borderColor = '';
      var f = e.dataTransfer.files[0]; if (f) vlLoadFile(f);
    });
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * PREVIEW EM TEMPO REAL — Web Audio API nodes
   * Constrói cadeia: Source → HPF → EQ bandas → Compressor → Delay → Reverb → Destination
   * Actualiza parâmetros dos nós sem reconstruir (vlUpdatePreview)
   * ══════════════════════════════════════════════════════════════════════════ */
  function _buildPreviewChain() {
    var ctx = getCtx();
    var nodes = {};

    // HPF
    nodes.hpf = ctx.createBiquadFilter();
    nodes.hpf.type = 'highpass';
    nodes.hpf.frequency.value = 80;
    nodes.hpf.Q.value = 0.7;

    // De-ess (notch estreito nos sibilantes)
    nodes.deess = ctx.createBiquadFilter();
    nodes.deess.type = 'peaking';
    nodes.deess.frequency.value = 7000;
    nodes.deess.Q.value = 3;
    nodes.deess.gain.value = 0;

    // EQ simples (4 bandas principais)
    nodes.eqLow = ctx.createBiquadFilter(); nodes.eqLow.type = 'peaking'; nodes.eqLow.frequency.value = 120; nodes.eqLow.Q.value = 0.8; nodes.eqLow.gain.value = 0;
    nodes.eqMid = ctx.createBiquadFilter(); nodes.eqMid.type = 'peaking'; nodes.eqMid.frequency.value = 1200; nodes.eqMid.Q.value = 1.0; nodes.eqMid.gain.value = 0;
    nodes.eqHigh = ctx.createBiquadFilter(); nodes.eqHigh.type = 'peaking'; nodes.eqHigh.frequency.value = 5000; nodes.eqHigh.Q.value = 1.0; nodes.eqHigh.gain.value = 0;
    nodes.eqAir = ctx.createBiquadFilter(); nodes.eqAir.type = 'highshelf'; nodes.eqAir.frequency.value = 12000; nodes.eqAir.gain.value = 0;

    // EQ detalhe bandas extra
    nodes.eqSub = ctx.createBiquadFilter(); nodes.eqSub.type = 'peaking'; nodes.eqSub.frequency.value = 60; nodes.eqSub.Q.value = 0.7; nodes.eqSub.gain.value = 0;
    nodes.eqLowBody = ctx.createBiquadFilter(); nodes.eqLowBody.type = 'peaking'; nodes.eqLowBody.frequency.value = 120; nodes.eqLowBody.Q.value = 0.8; nodes.eqLowBody.gain.value = 0;
    nodes.eqLowMid = ctx.createBiquadFilter(); nodes.eqLowMid.type = 'peaking'; nodes.eqLowMid.frequency.value = 500; nodes.eqLowMid.Q.value = 1.0; nodes.eqLowMid.gain.value = 0;
    nodes.eqMidDetail = ctx.createBiquadFilter(); nodes.eqMidDetail.type = 'peaking'; nodes.eqMidDetail.frequency.value = 1200; nodes.eqMidDetail.Q.value = 1.0; nodes.eqMidDetail.gain.value = 0;
    nodes.eqHighMid = ctx.createBiquadFilter(); nodes.eqHighMid.type = 'peaking'; nodes.eqHighMid.frequency.value = 3000; nodes.eqHighMid.Q.value = 1.0; nodes.eqHighMid.gain.value = 0;
    nodes.eqHighDetail = ctx.createBiquadFilter(); nodes.eqHighDetail.type = 'peaking'; nodes.eqHighDetail.frequency.value = 5000; nodes.eqHighDetail.Q.value = 1.0; nodes.eqHighDetail.gain.value = 0;
    nodes.eqAirDetail = ctx.createBiquadFilter(); nodes.eqAirDetail.type = 'highshelf'; nodes.eqAirDetail.frequency.value = 12000; nodes.eqAirDetail.gain.value = 0;
    nodes.eqPresence = ctx.createBiquadFilter(); nodes.eqPresence.type = 'highshelf'; nodes.eqPresence.frequency.value = 16000; nodes.eqPresence.gain.value = 0;

    // Compressor
    nodes.comp = ctx.createDynamicsCompressor();
    nodes.comp.threshold.value = -20;
    nodes.comp.ratio.value = 3;
    nodes.comp.attack.value = 0.01;
    nodes.comp.release.value = 0.1;
    nodes.comp.knee.value = 10;

    // Makeup gain
    nodes.makeupGain = ctx.createGain();
    nodes.makeupGain.gain.value = 1;

    // Pitch shift via playbackRate (simples, sem duração preservada no preview)
    // Implementado na source directamente

    // Delay
    nodes.delayNode = ctx.createDelay(5.0);
    nodes.delayNode.delayTime.value = 0;
    nodes.delayFb = ctx.createGain(); nodes.delayFb.gain.value = 0;
    nodes.delayWet = ctx.createGain(); nodes.delayWet.gain.value = 0;
    nodes.delayDry = ctx.createGain(); nodes.delayDry.gain.value = 1;

    // Reverb (ConvolverNode com IR sintético)
    nodes.reverbConv = ctx.createConvolver();
    nodes.reverbWet = ctx.createGain(); nodes.reverbWet.gain.value = 0;
    nodes.reverbDry = ctx.createGain(); nodes.reverbDry.gain.value = 1;
    _buildIR(ctx, nodes.reverbConv, 1.5);

    // Output
    nodes.output = ctx.createGain(); nodes.output.gain.value = 1;

    // Ligar cadeia
    // source → hpf → deess → eqSub → eqLowBody → eqLow → eqLowMid → eqMid → eqMidDetail → eqHighMid → eqHigh → eqHighDetail → eqAir → eqAirDetail → eqPresence → comp → makeupGain → [dry+delay+reverb] → output → dest
    var eqChain = [nodes.hpf, nodes.deess, nodes.eqSub, nodes.eqLowBody, nodes.eqLow, nodes.eqLowMid, nodes.eqMid, nodes.eqMidDetail, nodes.eqHighMid, nodes.eqHigh, nodes.eqHighDetail, nodes.eqAir, nodes.eqAirDetail, nodes.eqPresence, nodes.comp, nodes.makeupGain];
    for (var i = 0; i < eqChain.length - 1; i++) eqChain[i].connect(eqChain[i+1]);

    // Dry path
    nodes.makeupGain.connect(nodes.delayDry);
    nodes.delayDry.connect(nodes.output);

    // Delay path
    nodes.makeupGain.connect(nodes.delayNode);
    nodes.delayNode.connect(nodes.delayFb);
    nodes.delayFb.connect(nodes.delayNode);
    nodes.delayNode.connect(nodes.delayWet);
    nodes.delayWet.connect(nodes.output);

    // Reverb path
    nodes.makeupGain.connect(nodes.reverbDry);
    nodes.reverbDry.connect(nodes.output);
    nodes.makeupGain.connect(nodes.reverbConv);
    nodes.reverbConv.connect(nodes.reverbWet);
    nodes.reverbWet.connect(nodes.output);

    nodes.output.connect(ctx.destination);
    nodes._chain = eqChain;

    return nodes;
  }

  function _buildIR(ctx, conv, decaySec) {
    var len = Math.round(ctx.sampleRate * Math.min(decaySec, 4));
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decaySec);
      }
    }
    conv.buffer = buf;
  }

  function _applyPreviewParams(nodes) {
    var g = function (id, def) { var el = document.getElementById(id); return el ? parseFloat(el.value) : def; };
    var gc = function (id) { var el = document.getElementById(id); return el ? el.checked : false; };
    var s1 = document.getElementById('vl-step-on-1') ? document.getElementById('vl-step-on-1').checked : true;
    var s2 = document.getElementById('vl-step-on-2') ? document.getElementById('vl-step-on-2').checked : true;
    var s3 = document.getElementById('vl-step-on-3') ? document.getElementById('vl-step-on-3').checked : true;
    var s5 = document.getElementById('vl-step-on-5') ? document.getElementById('vl-step-on-5').checked : false;

    // Step 1 — CLEAN
    nodes.hpf.frequency.value = s1 ? g('vl-hpf', 80) : 20;
    nodes.deess.frequency.value = gc('vl-deess-on') && s1 ? g('vl-deess-freq', 7000) : 7000;
    nodes.deess.gain.value = gc('vl-deess-on') && s1 ? -(g('vl-deess-amt', 50) / 100) * 12 : 0;

    // Step 2 — SHAPE (simples)
    nodes.eqLow.gain.value = s2 ? g('vl-eq-low', 0) : 0;
    nodes.eqMid.gain.value = s2 ? g('vl-eq-mid', 0) : 0;
    nodes.eqHigh.gain.value = s2 ? g('vl-eq-high', 0) : 0;
    nodes.eqAir.gain.value = s2 ? g('vl-eq-air', 0) : 0;
    // Step 2 — SHAPE detalhe
    nodes.eqSub.gain.value = s2 ? g('vl-eq-sub', 0) : 0;
    nodes.eqLowBody.gain.value = s2 ? g('vl-eq-low-detail', 0) : 0;
    nodes.eqLowMid.gain.value = s2 ? g('vl-eq-lowmid', 0) : 0;
    nodes.eqMidDetail.gain.value = s2 ? g('vl-eq-mid-detail', 0) : 0;
    nodes.eqHighMid.gain.value = s2 ? g('vl-eq-highmid', 0) : 0;
    nodes.eqHighDetail.gain.value = s2 ? g('vl-eq-high-detail', 0) : 0;
    nodes.eqAirDetail.gain.value = s2 ? g('vl-eq-air-detail', 0) : 0;
    nodes.eqPresence.gain.value = s2 ? g('vl-eq-presence', 0) : 0;

    // Step 3 — CONTROL
    if (s3) {
      nodes.comp.threshold.value = g('vl-comp-thresh', -20);
      nodes.comp.ratio.value = g('vl-comp-ratio', 3);
      nodes.comp.attack.value = g('vl-comp-attack', 10) / 1000;
      nodes.comp.release.value = g('vl-comp-release', 100) / 1000;
      nodes.comp.knee.value = g('vl-comp-knee', 10);
      nodes.makeupGain.gain.value = Math.pow(10, g('vl-comp-makeup', 0) / 20);
    } else {
      nodes.comp.threshold.value = 0; nodes.comp.ratio.value = 1;
      nodes.makeupGain.gain.value = 1;
    }

    // Step 5 — SPACE
    var reverbMix = s5 ? g('vl-reverb-mix', 0) / 100 : 0;
    var delayMix = s5 ? g('vl-delay-mix', 0) / 100 : 0;
    nodes.reverbWet.gain.value = reverbMix;
    nodes.reverbDry.gain.value = 1 - reverbMix * 0.5;
    nodes.delayWet.gain.value = delayMix;
    nodes.delayDry.gain.value = 1;
    nodes.delayFb.gain.value = s5 ? g('vl-delay-fb', 40) / 100 : 0;

    if (s5 && delayMix > 0) {
      var bpm = g('vl-delay-bpm', 120);
      var div = g('vl-delay-div', 4);
      var delaySec = (60 / bpm) * (4 / div);
      nodes.delayNode.delayTime.value = Math.min(delaySec, 4.9);
    } else {
      nodes.delayNode.delayTime.value = 0;
    }

    // Rebuild IR se decay mudou
    if (s5 && reverbMix > 0) {
      var decay = g('vl-reverb-decay', 1.5);
      if (!nodes._lastDecay || Math.abs(nodes._lastDecay - decay) > 0.2) {
        nodes._lastDecay = decay;
        _buildIR(vlCtx, nodes.reverbConv, decay);
      }
    }
  }

  function _startVlPreview() {
    if (!vlBuffer) return;
    var ctx = getCtx();
    if (vlPreviewSource) { try { vlPreviewSource.stop(); } catch(e){} vlPreviewSource = null; }
    vlPreviewNodes = _buildPreviewChain();
    _applyPreviewParams(vlPreviewNodes);
    vlPreviewSource = ctx.createBufferSource();
    vlPreviewSource.buffer = vlBuffer;
    vlPreviewSource.loop = true; // LOOP até parar
    vlPreviewSource.connect(vlPreviewNodes._chain[0]);
    vlPreviewSource.start();
  }

  window.vlPlayPreview = function () {
    if (!vlBuffer) { vlStatus('Carrega um ficheiro primeiro', 'var(--c7)'); return; }
    if (vlPreviewActive) { vlStop(); return; } // toggle — clica de novo para parar
    vlStop();
    _startVlPreview();
    vlPreviewActive = true;
    var prevBtn = document.getElementById('vl-play-preview');
    if (prevBtn) { prevBtn.style.borderColor = 'var(--c3)'; prevBtn.style.background = 'rgba(255,227,53,0.25)'; prevBtn.textContent = '⬛ PARAR'; }
    vlStatus('▶ PREVIEW em loop — ajusta os sliders e ouve o efeito · clica de novo para parar', 'var(--c3)');
  };

  // Actualiza parâmetros dos nós durante preview em loop (sem reiniciar)
  window.vlUpdatePreview = function () {
    if (vlPreviewActive && vlPreviewNodes) {
      _applyPreviewParams(vlPreviewNodes);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * DSP OFFLINE — 5 PASSOS
   * ══════════════════════════════════════════════════════════════════════════ */
  function _biquadFilter(data, b0, b1, b2, a1, a2) {
    var out = new Float32Array(data.length); var x1=0,x2=0,y1=0,y2=0;
    for (var i=0;i<data.length;i++){var x0=data[i],y0=b0*x0+b1*x1+b2*x2-a1*y1-a2*y2;out[i]=y0;x2=x1;x1=x0;y2=y1;y1=y0;}
    return out;
  }
  function _biquadPeak(data, fc, gDb, Q, sr) {
    if (Math.abs(gDb) < 0.05) return data;
    var A=Math.pow(10,gDb/40),om=2*Math.PI*fc/sr,al=Math.sin(om)/(2*Q);
    var b0=1+al*A,b1=-2*Math.cos(om),b2=1-al*A,a0=1+al/A,a1=-2*Math.cos(om),a2=1-al/A;
    return _biquadFilter(data,b0/a0,b1/a0,b2/a0,a1/a0,a2/a0);
  }
  function _biquadHS(data, fc, gDb, sr) {
    if (Math.abs(gDb) < 0.05) return data;
    var A=Math.pow(10,gDb/40),om=2*Math.PI*fc/sr,cosO=Math.cos(om),sinO=Math.sin(om);
    var al=sinO/2*Math.sqrt((A+1/A)*(1/0.7-1)+2);
    var b0=A*((A+1)+(A-1)*cosO+2*Math.sqrt(A)*al);
    var b1=-2*A*((A-1)+(A+1)*cosO);
    var b2=A*((A+1)+(A-1)*cosO-2*Math.sqrt(A)*al);
    var a0=(A+1)-(A-1)*cosO+2*Math.sqrt(A)*al;
    var a1=2*((A-1)-(A+1)*cosO);
    var a2=(A+1)-(A-1)*cosO-2*Math.sqrt(A)*al;
    return _biquadFilter(data,b0/a0,b1/a0,b2/a0,a1/a0,a2/a0);
  }

  function _applyClean(data, sr, p) {
    var out = new Float32Array(data.length);
    var rc=1/(2*Math.PI*(p.hpf||80)),dt=1/sr,alpha=rc/(rc+dt);
    var prev=0,prevIn=0;
    for (var i=0;i<data.length;i++){var x=data[i];out[i]=alpha*(prev+x-prevIn);prevIn=x;prev=out[i];}
    if (p.deess>0&&p.deessAmt>0) {
      var fc=p.deess,rcD=1/(2*Math.PI*fc),alphaD=dt/(rcD+dt); var lp=0;
      for (var i=0;i<out.length;i++){lp=lp+alphaD*(out[i]-lp);out[i]=lp+(out[i]-lp)*(1-p.deessAmt/100);}
    }
    var gt=Math.pow(10,(p.gate||-60)/20),winSz=Math.round(sr*0.02);
    for (var i=0;i<out.length;i+=winSz){
      var rms=0;for(var j=i;j<Math.min(i+winSz,out.length);j++)rms+=out[j]*out[j];
      if(Math.sqrt(rms/winSz)<gt)for(var j=i;j<Math.min(i+winSz,out.length);j++)out[j]=0;
    }
    return out;
  }

  function _applyShape(data, sr, p) {
    var d = data;
    // Simples
    d=_biquadPeak(d,120,p.low||0,0.8,sr);
    d=_biquadPeak(d,1200,p.mid||0,1.0,sr);
    d=_biquadPeak(d,5000,p.high||0,1.0,sr);
    d=_biquadHS(d,12000,p.air||0,sr);
    // Detalhe
    d=_biquadPeak(d,60,p.sub||0,0.7,sr);
    d=_biquadPeak(d,120,p.lowBody||0,0.8,sr);
    d=_biquadPeak(d,500,p.lowMid||0,1.0,sr);
    d=_biquadPeak(d,1200,p.midDetail||0,1.0,sr);
    d=_biquadPeak(d,3000,p.highMid||0,1.0,sr);
    d=_biquadPeak(d,5000,p.highDetail||0,1.0,sr);
    d=_biquadHS(d,12000,p.airDetail||0,sr);
    d=_biquadHS(d,16000,p.presence||0,sr);
    return d;
  }

  function _applyControl(data, sr, p) {
    var thr=Math.pow(10,(p.threshold||-20)/20);
    var mk=Math.pow(10,(p.makeup||0)/20);
    var ratio=p.ratio||3;
    var atC=Math.exp(-1/(sr*(p.attack||10)/1000));
    var relC=Math.exp(-1/(sr*(p.release||100)/1000));
    var out=new Float32Array(data.length); var env=0;
    for(var i=0;i<data.length;i++){
      var x=Math.abs(data[i]);
      env=x>env?atC*env+(1-atC)*x:relC*env+(1-relC)*x;
      var g=1; if(env>thr) g=Math.pow(thr/env,1-1/ratio);
      out[i]=data[i]*g*mk;
    }
    return out;
  }

  function _pitchShiftSimple(data, sr, semis) {
    if (Math.abs(semis)<0.05) return data;
    var ratio=Math.pow(2,semis/12),srcLen=data.length;
    var tempLen=Math.round(srcLen/ratio),temp=new Float32Array(tempLen);
    for(var i=0;i<tempLen;i++){var si=i*ratio,lo=Math.floor(si),hi=Math.min(lo+1,srcLen-1),frac=si-lo;temp[i]=data[lo]*(1-frac)+data[hi]*frac;}
    var out=new Float32Array(srcLen);
    for(var i=0;i<srcLen;i++){var si=i*tempLen/srcLen,lo=Math.floor(si),hi=Math.min(lo+1,tempLen-1),frac=si-lo;out[i]=temp[lo]*(1-frac)+temp[hi]*frac;}
    return out;
  }

  function _applyReverb(data, sr, p) {
    var mix=(p.reverbMix||0)/100; if(mix<0.01) return data;
    var decay=p.decay||1.5,pdS=Math.round(sr*(p.preDelay||20)/1000);
    var irLen=Math.round(sr*Math.min(decay,4)),ir=new Float32Array(irLen);
    ir[0]=1;
    var combD=[0.0297,0.0371,0.0411,0.0437].map(function(d){return Math.round(d*sr);});
    for(var ci=0;ci<combD.length;ci++){var cd=combD[ci];for(var i=cd;i<irLen;i++)ir[i]+=ir[i-cd]*0.5*Math.pow(0.001,1/(decay*sr))*0.25;}
    var irMax=0;for(var i=0;i<irLen;i++)irMax=Math.max(irMax,Math.abs(ir[i]));
    if(irMax>0)for(var i=0;i<irLen;i++)ir[i]/=irMax;
    var wet=new Float32Array(data.length+irLen);
    for(var i=0;i<data.length;i++){if(data[i]===0)continue;for(var j=0;j<irLen&&i+j+pdS<wet.length;j++)wet[i+j+pdS]+=data[i]*ir[j];}
    var out=new Float32Array(data.length);
    for(var i=0;i<data.length;i++)out[i]=data[i]*(1-mix)+wet[i]*mix;
    return out;
  }

  function _applyDelay(data, sr, p) {
    var mix=(p.delayMix||0)/100; if(mix<0.01) return data;
    var bpm=p.delayBpm||120,div=p.delayDiv||4,fb=(p.delayFb||40)/100;
    var dSec=(60/bpm)*(4/div),dS=Math.round(sr*dSec);
    var out=new Float32Array(data.length);
    for(var i=0;i<data.length;i++)out[i]=data[i];
    var fbG=mix,cur=dS;
    while(fbG>0.01&&cur<data.length){for(var i=0;i<data.length-cur;i++)out[i+cur]+=data[i]*fbG;fbG*=fb;cur+=dS;}
    return out;
  }

  function _readParams() {
    var g=function(id,def){var el=document.getElementById(id);return el?parseFloat(el.value):def;};
    var gc=function(id){var el=document.getElementById(id);return el?el.checked:false;};
    return {
      hpf:g('vl-hpf',80), gate:g('vl-gate',-60),
      deess:gc('vl-deess-on')?g('vl-deess-freq',7000):0, deessAmt:g('vl-deess-amt',50),
      // Shape simples
      low:g('vl-eq-low',0), mid:g('vl-eq-mid',0), high:g('vl-eq-high',0), air:g('vl-eq-air',0),
      // Shape detalhe
      sub:g('vl-eq-sub',0), lowBody:g('vl-eq-low-detail',0), lowMid:g('vl-eq-lowmid',0),
      midDetail:g('vl-eq-mid-detail',0), highMid:g('vl-eq-highmid',0),
      highDetail:g('vl-eq-high-detail',0), airDetail:g('vl-eq-air-detail',0), presence:g('vl-eq-presence',0),
      // Control
      threshold:g('vl-comp-thresh',-20), ratio:g('vl-comp-ratio',3),
      attack:g('vl-comp-attack',10), release:g('vl-comp-release',100),
      makeup:g('vl-comp-makeup',0), knee:g('vl-comp-knee',10),
      // Tune
      pitchSemis:g('vl-pitch-semis',0),
      // Space
      reverbMix:gc('vl-reverb-bypass')?0:(g('vl-reverb-mix-detail',0)||g('vl-reverb-mix',0)), preDelay:g('vl-reverb-predelay',20), decay:g('vl-reverb-decay',1.5),
      delayMix:gc('vl-delay-bypass')?0:(g('vl-delay-mix-detail',0)||g('vl-delay-mix',0)), delayBpm:g('vl-delay-bpm',120), delayDiv:g('vl-delay-div',4), delayFb:g('vl-delay-fb',40),
    };
  }

  function _stepEnabled(n){var el=document.getElementById('vl-step-on-'+n);return el?el.checked:true;}

  window.vlProcess = async function () {
    if (!vlBuffer) { vlStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    vlStop();
    var btn=document.getElementById('vl-btn-process'); if(btn) btn.disabled=true;
    vlStatus('⏳ A processar offline...','var(--c5)');
    await new Promise(function(r){setTimeout(r,30);});
    try {
      var sr=vlBuffer.sampleRate,numCh=vlBuffer.numberOfChannels,p=_readParams();
      var ctx=getCtx(),outBuf=ctx.createBuffer(numCh,vlBuffer.length,sr);
      for(var c=0;c<numCh;c++){
        var data=new Float32Array(vlBuffer.getChannelData(c));
        if(_stepEnabled(1)){setStepState('1','active');await new Promise(function(r){setTimeout(r,0);});data=_applyClean(data,sr,p);setStepState('1','done');}
        if(_stepEnabled(2)){setStepState('2','active');await new Promise(function(r){setTimeout(r,0);});data=_applyShape(data,sr,p);setStepState('2','done');}
        if(_stepEnabled(3)){setStepState('3','active');await new Promise(function(r){setTimeout(r,0);});data=_applyControl(data,sr,p);setStepState('3','done');}
        if(_stepEnabled(4)){setStepState('4','active');await new Promise(function(r){setTimeout(r,0);});data=_pitchShiftSimple(data,sr,p.pitchSemis||0);setStepState('4','done');}
        if(_stepEnabled(5)){setStepState('5','active');await new Promise(function(r){setTimeout(r,0);});data=_applyReverb(data,sr,p);data=_applyDelay(data,sr,p);setStepState('5','done');}
        var peak=0;for(var i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));
        if(peak>0.98){var sc=0.96/peak;for(var i=0;i<data.length;i++)data[i]*=sc;}
        outBuf.copyToChannel(data,c);
      }
      vlProcessedBuffer=outBuf;
      _setBtn('vl-play-result',false);
      _setBtn('vl-export-wav',false);
      _setBtn('vl-send-master',false);
      vlStatus('✓ Processado — ouve RESULTADO e exporta','var(--c4)');
    } catch(e){ vlStatus('Erro: '+e.message,'var(--c7)'); console.error(e); }
    if(btn) btn.disabled=false;
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * AUTO-TUNE completo (motor phase vocoder — DETALHE passo 4)
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlAnalyze = function () {
    if (!vlBuffer) { vlStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    vlStatus('A analisar pitch e escala...','var(--c5)');
    setTimeout(function(){
      var ch=vlBuffer.getChannelData(0),sr=vlBuffer.sampleRate,N=ch.length;
      var FFT=2048,HOP=512,minP=Math.floor(sr/1100),maxP=Math.floor(sr/65);
      var noteHist=new Array(12).fill(0),pitchTrack=[],total=0;
      for(var pos=0;pos+FFT<N;pos+=HOP){
        var en=0;for(var i=pos;i<pos+FFT;i++)en+=ch[i]*ch[i];
        if(en/FFT<0.00005){pitchTrack.push({silent:true,time:pos/sr});continue;}
        var bP=0,bC=0;
        for(var p=minP;p<maxP&&p<FFT/2;p++){
          var c=0,na=0,nb=0;for(var i=0;i<FFT-p;i++){var a=ch[pos+i],b=ch[pos+i+p];c+=a*b;na+=a*a;nb+=b*b;}
          var norm=c/(Math.sqrt(na*nb)+1e-10);if(norm>bC){bC=norm;bP=p;}
        }
        if(bP>0&&bC>0.45){
          var freq=sr/bP;
          if(freq>65&&freq<1100){
            var semi=12*Math.log2(freq/440),nS=Math.round(semi),cents=(semi-nS)*100;
            var ni=((nS+9+12000)%12);noteHist[ni]++;total++;
            pitchTrack.push({time:pos/sr,semi:semi,note:ni,midi:nS+69,cents:cents,conf:bC,silent:false});
          } else pitchTrack.push({silent:true,time:pos/sr});
        } else pitchTrack.push({silent:true,time:pos/sr});
      }
      if(total<20){vlStatus('⚠ Poucas notas — é mesmo voz isolada?','var(--c2)');return;}
      var bK=0,bM='maior',bCr=-Infinity;
      for(var root=0;root<12;root++){
        var cM=0,cm=0;
        for(var i=0;i<12;i++){cM+=noteHist[(root+i)%12]*MAJOR_PROFILE[i];cm+=noteHist[(root+i)%12]*MINOR_PROFILE[i];}
        if(cM>bCr){bCr=cM;bK=root;bM='maior';}if(cm>bCr){bCr=cm;bK=root;bM='menor';}
      }
      var scaleNotes=(bM==='maior'?MAJOR_PATTERN:MINOR_PATTERN).map(function(o){return(bK+o)%12;});
      var inScale=0,outScale=0;
      pitchTrack.forEach(function(p){if(p.silent)return;if(scaleNotes.includes(p.note))inScale++;else outScale++;});
      var pct=inScale/(inScale+outScale)*100;
      vlAnalysis={key:NOTE_NAMES[bK],keyIdx:bK,mode:bM,pitchTrack:pitchTrack,scaleNotes:scaleNotes,totalSamples:total,hopSize:HOP,fftSize:FFT,duration:vlBuffer.duration,pctInScale:pct};
      var keyEl=document.getElementById('vl-tune-key');if(keyEl)keyEl.textContent=NOTE_NAMES[bK]+' '+bM;
      var kiEl=document.getElementById('vl-key-info');if(kiEl)kiEl.textContent=total+' notas · '+pct.toFixed(1)+'% na escala';
      var btnAt=document.getElementById('vl-btn-autotune');if(btnAt){btnAt.disabled=false;btnAt.style.opacity='1';}
      vlStatus('✓ Escala: '+NOTE_NAMES[bK]+' '+bM+' · '+total+' notas','var(--c4)');
      _drawPianoRoll();
    },50);
  };

  window.vlApplyAutotune = async function () {
    if (!vlAnalysis) { vlStatus('Analisa primeiro','var(--c7)'); return; }
    var strength=parseInt(document.getElementById('vl-at-strength').value)/100;
    var speed=parseInt(document.getElementById('vl-at-speed').value);
    vlStatus('⏳ A aplicar Auto-Tune completo (phase vocoder)...','var(--c5)');
    var btn=document.getElementById('vl-btn-autotune');if(btn)btn.disabled=true;
    setTimeout(async function(){
      try{
        var sr=vlBuffer.sampleRate,HOP=vlAnalysis.hopSize,FFT=vlAnalysis.fftSize;
        var N=vlBuffer.length,scale=vlAnalysis.scaleNotes;
        var numHops=Math.floor((N-FFT)/HOP)+1,shiftSemis=new Float32Array(numHops);
        var track=vlAnalysis.pitchTrack;
        for(var h=0;h<numHops;h++){
          var p=track[h];if(!p||p.silent||p.semi==null){shiftSemis[h]=0;continue;}
          var sN=Math.round(p.semi),ni=((sN+9+12000)%12);var tS=sN;
          if(!scale.includes(ni)){var bd=99;for(var d=-6;d<=6;d++){var ci=((sN+d+9+12000)%12);if(scale.includes(ci)&&Math.abs(d)<Math.abs(bd))bd=d;}if(bd!==99)tS=sN+bd;}
          shiftSemis[h]=(tS-p.semi)*strength;
        }
        if(speed>0){var hMs=HOP/sr*1000,alp=Math.exp(-hMs/speed);var prev=shiftSemis[0];for(var h=0;h<numHops;h++){prev=alp*prev+(1-alp)*shiftSemis[h];shiftSemis[h]=prev;}}
        vlTunedBuffer=await _phaseVocoderProcess(vlBuffer,shiftSemis,FFT,HOP);
        vlProcessedBuffer=vlTunedBuffer;
        _setBtn('vl-play-result',false);_setBtn('vl-export-wav',false);_setBtn('vl-send-master',false);
        vlStatus('✓ Auto-Tune completo aplicado','var(--c4)');
        _drawPianoRoll();
      }catch(e){vlStatus('Erro: '+e.message,'var(--c7)');}
      if(btn){btn.disabled=false;btn.style.opacity='1';}
    },30);
  };

  function _fft(real,imag,n){
    var j=0;
    for(var i=1;i<n;i++){var bit=n>>1;while(j&bit){j^=bit;bit>>=1;}j^=bit;if(i<j){var tr=real[i];real[i]=real[j];real[j]=tr;var ti=imag[i];imag[i]=imag[j];imag[j]=ti;}}
    for(var size=2;size<=n;size<<=1){var half=size>>1,step=-2*Math.PI/size;for(var i=0;i<n;i+=size){for(var k=0;k<half;k++){var ang=step*k,cs=Math.cos(ang),sn=Math.sin(ang);var tre=cs*real[i+k+half]-sn*imag[i+k+half],tim=sn*real[i+k+half]+cs*imag[i+k+half];real[i+k+half]=real[i+k]-tre;imag[i+k+half]=imag[i+k]-tim;real[i+k]+=tre;imag[i+k]+=tim;}}}
  }
  function _ifft(real,imag,n){for(var i=0;i<n;i++)imag[i]=-imag[i];_fft(real,imag,n);for(var i=0;i<n;i++){real[i]/=n;imag[i]=-imag[i]/n;}}
  async function _phaseVocoderProcess(inputBuffer,shiftSemis,FFT,HOP){
    var sr=inputBuffer.sampleRate,numCh=inputBuffer.numberOfChannels,N=inputBuffer.length;
    var ctx=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(numCh,N,sr);
    var out=ctx.createBuffer(numCh,N,sr);
    var win=new Float32Array(FFT);for(var i=0;i<FFT;i++)win[i]=0.5*(1-Math.cos(2*Math.PI*i/(FFT-1)));
    for(var c=0;c<numCh;c++){
      var inD=inputBuffer.getChannelData(c),outD=out.getChannelData(c),acc=new Float32Array(N);
      var real=new Float32Array(FFT),imag=new Float32Array(FFT),lP=new Float32Array(FFT/2+1),sP=new Float32Array(FFT/2+1);
      var hi=0;
      for(var pos=0;pos+FFT<N;pos+=HOP,hi++){
        var ratio=Math.pow(2,(shiftSemis[hi]||0)/12);
        for(var i=0;i<FFT;i++){real[i]=(inD[pos+i]||0)*win[i];}imag.fill(0);_fft(real,imag,FFT);
        var mB=new Float32Array(FFT/2+1),fB=new Float32Array(FFT/2+1);
        for(var k=0;k<=FFT/2;k++){var mag=Math.sqrt(real[k]*real[k]+imag[k]*imag[k]),ph=Math.atan2(imag[k],real[k]);var dl=ph-lP[k];lP[k]=ph;dl-=HOP*2*Math.PI*k/FFT;dl-=2*Math.PI*Math.round(dl/(2*Math.PI));mB[k]=mag;fB[k]=2*Math.PI*k/FFT+dl/HOP;}
        var nM=new Float32Array(FFT/2+1),nF=new Float32Array(FFT/2+1);
        for(var k=0;k<=FFT/2;k++){var tK=Math.round(k*ratio);if(tK>=0&&tK<=FFT/2&&mB[k]>nM[tK]){nM[tK]=mB[k];nF[tK]=fB[k]*ratio;}}
        for(var k=0;k<=FFT/2;k++){sP[k]+=nF[k]*HOP;real[k]=nM[k]*Math.cos(sP[k]);imag[k]=nM[k]*Math.sin(sP[k]);}
        for(var k=1;k<FFT/2;k++){real[FFT-k]=real[k];imag[FFT-k]=-imag[k];}_ifft(real,imag,FFT);
        for(var i=0;i<FFT;i++){if(pos+i<N){outD[pos+i]+=real[i]*win[i];acc[pos+i]+=win[i]*win[i];}}
        if(hi%100===99)await new Promise(function(r){setTimeout(r,0);});
      }
      for(var i=0;i<N;i++){if(acc[i]>0.001)outD[i]/=acc[i];}
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * PIANO ROLL
   * ══════════════════════════════════════════════════════════════════════════ */
  function _drawPianoRoll() {
    var cv=document.getElementById('vl-pianoroll');if(!cv)return;
    var W=cv.offsetWidth||cv.parentElement.offsetWidth||400;cv.width=W;var H=cv.height;
    var ctx=cv.getContext('2d');ctx.fillStyle='#07070e';ctx.fillRect(0,0,W,H);
    var minMidi=48,maxMidi=84,noteH=(H-20)/(maxMidi-minMidi);
    for(var m=minMidi;m<=maxMidi;m++){
      var y=H-10-(m-minMidi)*noteH;
      var isBlack=[1,3,6,8,10].includes(m%12);
      if(isBlack){ctx.fillStyle='rgba(80,80,100,0.15)';ctx.fillRect(28,y-noteH,W-28,noteH);}
      if(m%12===0){ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.beginPath();ctx.moveTo(28,y);ctx.lineTo(W,y);ctx.stroke();ctx.fillStyle='rgba(140,140,160,0.6)';ctx.font='8px monospace';ctx.fillText('C'+(Math.floor(m/12)-1),4,y-1);}
    }
    if(!vlAnalysis){ctx.fillStyle='rgba(100,100,120,0.5)';ctx.font='10px monospace';ctx.fillText('Analisa para ver o piano roll',W/2-80,H/2);return;}
    var scale=vlAnalysis.scaleNotes;
    for(var m=minMidi;m<=maxMidi;m++){if(scale.includes(m%12)){var y=H-10-(m-minMidi)*noteH;ctx.fillStyle='rgba(45,255,138,0.07)';ctx.fillRect(28,y-noteH,W-28,noteH);}}
    ctx.fillStyle='rgba(45,255,138,0.8)';ctx.font='bold 9px monospace';ctx.fillText('Escala: '+vlAnalysis.key+' '+vlAnalysis.mode,32,11);
    var dur=vlAnalysis.duration;
    vlAnalysis.pitchTrack.forEach(function(p){
      if(p.silent)return;
      var x=28+(p.time/dur)*(W-32);var midi=p.midi;
      if(midi<minMidi||midi>maxMidi)return;
      var y=H-10-(midi-minMidi)*noteH+p.cents/100*noteH;
      ctx.fillStyle='rgba(160,160,180,0.65)';ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill();
    });
    if(vlTunedBuffer&&vlAnalysis.scaleNotes){
      vlAnalysis.pitchTrack.forEach(function(p){
        if(p.silent)return;
        var x=28+(p.time/dur)*(W-32);
        var sN=Math.round(p.semi),ni=((sN+9+12000)%12);var tS=sN;
        if(!scale.includes(ni)){var bd=99;for(var d=-6;d<=6;d++){var ci=((sN+d+9+12000)%12);if(scale.includes(ci)&&Math.abs(d)<Math.abs(bd))bd=d;}if(bd!==99)tS=sN+bd;}
        var tMidi=tS+69;if(tMidi<minMidi||tMidi>maxMidi)return;
        var y=H-10-(tMidi-minMidi)*noteH;
        ctx.fillStyle='rgba(255,58,181,0.85)';ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();
      });
    }
    ctx.fillStyle='rgba(160,160,180,0.7)';ctx.font='9px monospace';ctx.fillText('● original',W-140,11);
    ctx.fillStyle='rgba(255,58,181,0.9)';ctx.fillText('● tuned',W-65,11);
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * PLAYER
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlPlay = function (which) {
    vlStop();
    var buf = which === 'result' ? (vlProcessedBuffer || vlBuffer) : vlBuffer;
    if (!buf) { vlStatus('Buffer indisponível','var(--c7)'); return; }
    var ctx = getCtx();
    vlPlayingSource = ctx.createBufferSource();
    vlPlayingSource.buffer = buf;
    vlPlayingSource.connect(ctx.destination);
    vlPlayingSource.start();
    var isResult = which === 'result';
    vlStatus('▶ A tocar — ' + (isResult ? 'RESULTADO PROCESSADO' : 'ORIGINAL'), isResult ? 'var(--c4)' : 'var(--text)');
    vlPlayingSource.onended = function () { vlPlayingSource = null; vlStatus('■ Parado','var(--muted)'); };
  };

  window.vlStop = function () {
    if (vlPlayingSource) { try { vlPlayingSource.stop(); } catch (e) {} vlPlayingSource = null; }
    if (vlPreviewSource) { try { vlPreviewSource.stop(); } catch (e) {} vlPreviewSource = null; }
    vlPreviewActive = false;
    var prevBtn = document.getElementById('vl-play-preview');
    if (prevBtn) { prevBtn.style.borderColor = 'var(--c3)'; prevBtn.style.background = 'rgba(255,227,53,0.08)'; prevBtn.textContent = '▶ PREVIEW'; }
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * EXPORT + MASTER
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlExport = function () {
    var buf = vlProcessedBuffer || vlBuffer;
    if (!buf) { vlStatus('Processa primeiro','var(--c7)'); return; }
    var blob = _bufToWav(buf);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'voicelab_' + Date.now() + '.wav'; a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    vlStatus('✓ Exportado WAV','var(--c4)');
  };

  window.vlSendToMaster = function () {
    var buf = vlProcessedBuffer || vlBuffer;
    if (!buf) { vlStatus('Processa primeiro','var(--c7)'); return; }
    // Injecta no player da suite
    window.audioBuffer = buf;
    // Inicializa audioCtx da suite se necessário
    if (typeof initAudio === 'function') initAudio();
    // Mostra waveform e esconde dropzone
    var ww = document.getElementById('waveform-wrap');
    var dz = document.getElementById('drop-zone');
    if (ww) ww.style.display = 'flex';
    if (dz) dz.style.display = 'none';
    // Redesenha waveform e aplica DSP
    if (typeof drawWaveform === 'function') drawWaveform();
    if (typeof applyDSP === 'function') applyDSP();
    // Navegar para MASTER directamente (sem depender de openTab chain)
    var tn = document.getElementById('track-name');
    if (tn) tn.textContent = 'Voice Lab';
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    var masterTab = document.querySelector('.tab-primary');
    if (masterTab) masterTab.classList.add('active');
    var masterPanel = document.getElementById('tab-master');
    if (masterPanel) masterPanel.classList.add('active');
    vlStatus('✓ Enviado para MASTER','var(--c5)');
  };

  function _bufToWav(buffer){
    var nCh=buffer.numberOfChannels,sr=buffer.sampleRate,N=buffer.length;
    var ab=new ArrayBuffer(44+N*nCh*2),v=new DataView(ab);
    var ws=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    ws(0,'RIFF');v.setUint32(4,36+N*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
    v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nCh,true);
    v.setUint32(24,sr,true);v.setUint32(28,sr*nCh*2,true);v.setUint16(32,nCh*2,true);
    v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,N*nCh*2,true);
    var off=44,chs=[];for(var c=0;c<nCh;c++)chs.push(buffer.getChannelData(c));
    for(var i=0;i<N;i++)for(var c=0;c<nCh;c++){var s=Math.max(-1,Math.min(1,chs[c][i]));s=s<0?s*0x8000:s*0x7FFF;v.setInt16(off,s|0,true);off+=2;}
    return new Blob([ab],{type:'audio/wav'});
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * WAVEFORM MINI
   * ══════════════════════════════════════════════════════════════════════════ */
  function _drawDropWave() {
    var cv=document.getElementById('vl-waveform');if(!cv||!vlBuffer)return;
    var W=cv.offsetWidth||300;cv.width=W;var H=cv.height;
    var ctx=cv.getContext('2d');ctx.clearRect(0,0,W,H);
    var data=vlBuffer.getChannelData(0),step=Math.floor(data.length/W);
    ctx.strokeStyle='var(--c1)';ctx.lineWidth=1.5;ctx.beginPath();
    for(var x=0;x<W;x++){var mx=0;for(var i=0;i<step;i++)mx=Math.max(mx,Math.abs(data[x*step+i]||0));var y=H/2-mx*(H/2)*0.88;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
    ctx.strokeStyle='rgba(255,58,181,0.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * VOCAL ALIGNER
   * ══════════════════════════════════════════════════════════════════════════ */
  var aligner={guide:null,tracks:[],playSource:null,zoom:1};

  window.vaLoadGuide=async function(file){
    if(!file)return;
    var ctx=getCtx(),ab=await file.arrayBuffer();
    aligner.guide=await new Promise(function(res,rej){ctx.decodeAudioData(ab,res,rej);});
    var nm=document.getElementById('va-guide-name');if(nm)nm.textContent=file.name;
    _vaDrawAll();vlStatus('✓ Guia carregada · '+aligner.guide.duration.toFixed(1)+'s','var(--c4)');
  };
  window.vaAddTrack=async function(file){
    if(!file)return;
    var ctx=getCtx(),ab=await file.arrayBuffer();
    var buf=await new Promise(function(res,rej){ctx.decodeAudioData(ab,res,rej);});
    aligner.tracks.push({buffer:buf,offset:0,name:file.name});
    _vaRenderTracks();_vaDrawAll();vlStatus('✓ Pista: '+file.name,'var(--c5)');
  };
  function _vaRenderTracks(){
    var container=document.getElementById('va-tracks');if(!container)return;
    container.innerHTML='';
    aligner.tracks.forEach(function(t,i){
      var row=document.createElement('div');row.className='va-track-row';
      row.innerHTML='<div style="width:100px;min-width:100px;"><div style="font-size:9px;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:98px;" title="'+t.name+'">'+t.name+'</div><div style="font-size:8px;color:var(--c5);margin-top:2px;">offset: <b id="va-offset-'+i+'">0</b>ms</div><div style="display:flex;gap:3px;margin-top:4px;"><button onclick="vaExportMix('+i+')" style="font-size:8px;background:rgba(45,255,138,0.08);border:1px solid var(--c4);color:var(--c4);border-radius:3px;padding:2px 5px;cursor:pointer;">⬇</button><button onclick="vaRemoveTrack('+i+')" style="font-size:8px;background:none;border:1px solid var(--border2);color:var(--muted);border-radius:3px;padding:2px 5px;cursor:pointer;">✕</button></div></div><canvas id="va-canvas-'+i+'" height="40"></canvas>';
      container.appendChild(row);_vaDrawTrack(i);_vaBindDrag(i);
    });
  }
  window.vaRemoveTrack=function(i){aligner.tracks.splice(i,1);_vaRenderTracks();_vaDrawAll();};
  function _vaDrawAll(){_vaDrawGuide();aligner.tracks.forEach(function(_,i){_vaDrawTrack(i);});}
  function _vaDrawGuide(){var cv=document.getElementById('va-guide-canvas');if(!cv||!aligner.guide)return;_vaDrawWave(cv,aligner.guide,'#2dff8a',0,null,true);}
  function _vaDrawTrack(i){var cv=document.getElementById('va-canvas-'+i);if(!cv)return;_vaDrawWave(cv,aligner.tracks[i].buffer,'#2ddcff',aligner.tracks[i].offset,aligner.guide,false);}
  function _vaDrawWave(cv,buffer,color,offsetSec,refBuf,isGuide){
    var totalDur=refBuf?refBuf.duration:buffer.duration;
    var W=cv.offsetWidth||cv.parentElement.offsetWidth||600;cv.width=W;var H=cv.height;
    var ctx=cv.getContext('2d');
    // Fundo com gradiente subtil
    var bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'rgba(0,0,0,0.6)');bg.addColorStop(1,'rgba(0,0,0,0.3)');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    var data=buffer.getChannelData(0),pxPerSec=(W/totalDur)*aligner.zoom;
    var samplesPerPx=Math.max(1,Math.floor(data.length/(W*aligner.zoom)));
    var offsetPx=offsetSec*pxPerSec;
    // Linha de centro
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
    // Waveform fill (espelho)
    ctx.globalAlpha=0.18;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H/2);
    for(var x=0;x<W;x++){var sStart=Math.floor((x-offsetPx)*samplesPerPx*(1/aligner.zoom));var mx=0;for(var j=0;j<samplesPerPx;j++){var idx=sStart+j;if(idx>=0&&idx<data.length)mx=Math.max(mx,Math.abs(data[idx]));}var y=H/2-mx*(H/2-3);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.lineTo(W,H/2);ctx.closePath();ctx.fill();
    // Waveform fill inferior (espelho)
    ctx.beginPath();ctx.moveTo(0,H/2);
    for(var x=0;x<W;x++){var sStart=Math.floor((x-offsetPx)*samplesPerPx*(1/aligner.zoom));var mx=0;for(var j=0;j<samplesPerPx;j++){var idx=sStart+j;if(idx>=0&&idx<data.length)mx=Math.max(mx,Math.abs(data[idx]));}var y=H/2+mx*(H/2-3);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.lineTo(W,H/2);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
    // Linha principal
    ctx.strokeStyle=color;ctx.lineWidth=isGuide?2:1.5;ctx.shadowColor=color;ctx.shadowBlur=isGuide?6:3;ctx.beginPath();
    for(var x=0;x<W;x++){var sStart=Math.floor((x-offsetPx)*samplesPerPx*(1/aligner.zoom));var mx=0;for(var j=0;j<samplesPerPx;j++){var idx=sStart+j;if(idx>=0&&idx<data.length)mx=Math.max(mx,Math.abs(data[idx]));}var y=H/2-mx*(H/2-3);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
    // Linha inferior (espelho)
    ctx.beginPath();
    for(var x=0;x<W;x++){var sStart=Math.floor((x-offsetPx)*samplesPerPx*(1/aligner.zoom));var mx=0;for(var j=0;j<samplesPerPx;j++){var idx=sStart+j;if(idx>=0&&idx<data.length)mx=Math.max(mx,Math.abs(data[idx]));}var y=H/2+mx*(H/2-3);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();ctx.shadowBlur=0;
  }
  function _vaBindDrag(i){
    var cv=document.getElementById('va-canvas-'+i);if(!cv)return;
    var sX=0,sOff=0,drag=false;
    cv.addEventListener('mousedown',function(e){drag=true;sX=e.clientX;sOff=aligner.tracks[i].offset;e.preventDefault();});
    window.addEventListener('mousemove',function(e){if(!drag)return;var dur=aligner.guide?aligner.guide.duration:10;var dSec=(e.clientX-sX)/((cv.offsetWidth||600)/dur);aligner.tracks[i].offset=Math.max(-aligner.tracks[i].buffer.duration,Math.min(dur,sOff+dSec));var el=document.getElementById('va-offset-'+i);if(el)el.textContent=Math.round(aligner.tracks[i].offset*1000);_vaDrawTrack(i);});
    window.addEventListener('mouseup',function(){drag=false;});
    cv.addEventListener('touchstart',function(e){drag=true;sX=e.touches[0].clientX;sOff=aligner.tracks[i].offset;},{passive:true});
    window.addEventListener('touchmove',function(e){if(!drag)return;var dur=aligner.guide?aligner.guide.duration:10;var dSec=(e.touches[0].clientX-sX)/((cv.offsetWidth||600)/dur);aligner.tracks[i].offset=Math.max(-aligner.tracks[i].buffer.duration,Math.min(dur,sOff+dSec));var el=document.getElementById('va-offset-'+i);if(el)el.textContent=Math.round(aligner.tracks[i].offset*1000);_vaDrawTrack(i);},{passive:true});
    window.addEventListener('touchend',function(){drag=false;});
  }
  // AUTO-ALIGN: cross-correlação para encontrar melhor offset
  window.vaAutoAlign = function() {
    if (!aligner.guide) { vlStatus('Carrega a guia primeiro','var(--c7)'); return; }
    if (!aligner.tracks.length) { vlStatus('Adiciona pistas para alinhar','var(--c7)'); return; }
    vlStatus('⏳ A calcular alinhamento...','var(--c5)');
    setTimeout(function(){
      var gData = aligner.guide.getChannelData(0);
      var sr = aligner.guide.sampleRate;
      aligner.tracks.forEach(function(t, i){
        var tData = t.buffer.getChannelData(0);
        // Correlação em janelas de 512 amostras, salto de 256
        var winSz = Math.min(4096, Math.floor(sr * 0.2));
        var maxLag = Math.floor(sr * 2.0); // máx 2 segundos de offset
        var bestLag = 0, bestCorr = -Infinity;
        var step = Math.max(64, Math.floor(sr * 0.01));
        // Usa RMS para encontrar janela activa na guia
        var gStart = 0;
        for (var s = 0; s < gData.length - winSz; s += winSz) {
          var rms = 0; for (var k = 0; k < winSz; k++) rms += gData[s+k]*gData[s+k];
          if (rms/winSz > 0.001) { gStart = s; break; }
        }
        for (var lag = -maxLag; lag <= maxLag; lag += step) {
          var corr = 0;
          for (var k = 0; k < winSz; k++) {
            var gi = gStart + k; var ti = gStart + k + lag;
            if (gi >= 0 && gi < gData.length && ti >= 0 && ti < tData.length) {
              corr += gData[gi] * tData[ti];
            }
          }
          if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
        }
        t.offset = -bestLag / sr;
        var el = document.getElementById('va-offset-'+i);
        if (el) el.textContent = Math.round(t.offset*1000);
        _vaDrawTrack(i);
      });
      vlStatus('✓ Auto-align concluído — verifica e ajusta manualmente se necessário','var(--c4)');
    }, 30);
  };

  // EXPORTAR TODAS as pistas com offsets aplicados
  window.vaExportAll = function() {
    if (!aligner.tracks.length) { vlStatus('Sem pistas para exportar','var(--c7)'); return; }
    var delay = 0;
    aligner.tracks.forEach(function(t, i){
      setTimeout(function(){
        var blob = _bufToWav(t.buffer);
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'aligned_' + (i+1) + '_' + t.name.replace(/\s/g,'_');
        a.click();
        setTimeout(function(){URL.revokeObjectURL(url);}, 1000);
      }, delay);
      delay += 400;
    });
    vlStatus('✓ A exportar ' + aligner.tracks.length + ' pistas...','var(--c4)');
  };

  window.vaPlay=function(){
    vaStop();if(!aligner.guide){vlStatus('Carrega a guia primeiro','var(--c7)');return;}
    var ctx=getCtx(),gSrc=ctx.createBufferSource();gSrc.buffer=aligner.guide;gSrc.connect(ctx.destination);gSrc.start();
    aligner.playSource=[gSrc];
    aligner.tracks.forEach(function(t){var src=ctx.createBufferSource();src.buffer=t.buffer;src.connect(ctx.destination);if(t.offset>=0)src.start(ctx.currentTime+t.offset);else src.start(ctx.currentTime,-t.offset);aligner.playSource.push(src);});
    vlStatus('▶ A tocar alinhamento...','var(--c4)');
  };
  window.vaStop=function(){if(aligner.playSource){aligner.playSource.forEach(function(s){try{s.stop();}catch(e){}});aligner.playSource=null;}};
  window.vaExportMix=function(idx){var t=aligner.tracks[idx];if(!t)return;var blob=_bufToWav(t.buffer);var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='aligned_'+t.name.replace(/\s/g,'_');a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);vlStatus('✓ Pista exportada','var(--c4)');};
  window.vaZoom=function(dir){aligner.zoom=Math.max(0.5,Math.min(8,aligner.zoom*(dir>0?1.5:0.67)));_vaDrawAll();};

  /* ══════════════════════════════════════════════════════════════════════════
   * INIT
   * ══════════════════════════════════════════════════════════════════════════ */
  // Recebe buffer afinado do Voice Tune
  window.vlReceiveTuned = function(buf) {
    vlBuffer = buf;
    vlProcessedBuffer = null;
    var info = document.getElementById('vl-info');
    if (info) {
      info.style.display = 'block';
      info.innerHTML = '<div style="color:var(--c6);font-weight:700;">↗ Recebido do Voice Tune</div>' +
        '<div style="color:var(--muted);margin-top:3px;">' + buf.duration.toFixed(1) + 's · ' + buf.sampleRate + 'Hz</div>';
    }
    _setBtn('vl-play-orig', false);
    _setBtn('vl-play-preview', false);
    _setBtn('vl-play-result', true);
    _setBtn('vl-export-wav', true);
    _setBtn('vl-send-master', true);
    _setBtn('vl-btn-process', false);
    vlStatus('✓ Recebido do Voice Tune — pronto para processar', 'var(--c6)');
  };

  // Ouve evento de navegação
  document.addEventListener('piradex:tab', function(e){
    if (e.detail === 'voicelab') {
      setTimeout(function(){ vlInitDrop(); _vaDrawGuide(); }, 60);
    }
  });

  setTimeout(function(){
    var p=document.getElementById('tab-voicelab');
    if(p&&p.classList.contains('active')) vlInitDrop();
  },300);

})();
