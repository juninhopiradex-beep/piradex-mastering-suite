/* ═══════════════════════════════════════════════════════════════════════════
 * VOICE TUNE — Janela dedicada de afinação
 * Piradex Mastering Suite
 * Pitch shift · Cents · Formant · Auto-Tune (phase vocoder)
 * Piano roll grande · 3 modos player
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var vtBuffer = null;       // original carregado aqui
  var vtTunedBuffer = null;  // após auto-tune
  var vtAnalysis = null;
  var vtPlayingSource = null;
  var vtPreviewSource = null;
  var vtPreviewActive = false;
  var vtCtx = null;
  var vtTuneMode = 'snap';

  var NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  var MAJOR_PATTERN    = [0,2,4,5,7,9,11];
  var MINOR_PATTERN    = [0,2,3,5,7,8,10];
  var PENTA_MAJ        = [0,2,4,7,9];
  var PENTA_MIN        = [0,3,5,7,10];
  var BLUES            = [0,3,5,6,7,10];
  var CROMATICA        = [0,1,2,3,4,5,6,7,8,9,10,11];
  var MAJOR_PROFILE    = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
  var MINOR_PROFILE    = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function vtStatus(msg, color) {
    var el = document.getElementById('vt-status');
    if (el) el.innerHTML = '<span style="color:' + (color || 'var(--muted)') + ';">' + msg + '</span>';
  }

  function getCtx() {
    if (!vtCtx || vtCtx.state === 'closed') vtCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (vtCtx.state === 'suspended') vtCtx.resume();
    return vtCtx;
  }

  function setBtn(id, disabled) {
    var el = document.getElementById(id);
    if (el) { el.disabled = disabled; if (!disabled) el.style.opacity = '1'; else el.style.opacity = '0.5'; }
  }

  function getScale() {
    var rootEl = document.getElementById('vt-scale-root');
    var modeEl = document.getElementById('vt-scale-mode');
    var root = rootEl ? parseInt(rootEl.value) : -1;
    var mode = modeEl ? modeEl.value : 'maior';

    // Se auto e temos análise
    if (root === -1 && vtAnalysis) {
      root = vtAnalysis.keyIdx;
      mode = vtAnalysis.mode;
    }
    if (root === -1) return null;

    var pat = mode === 'maior' ? MAJOR_PATTERN :
              mode === 'menor' ? MINOR_PATTERN :
              mode === 'penta_maior' ? PENTA_MAJ :
              mode === 'penta_menor' ? PENTA_MIN :
              mode === 'blues' ? BLUES : CROMATICA;

    return { root: root, mode: mode, notes: pat.map(function(o){ return (root + o) % 12; }) };
  }

  window.vtSetMode = function(mode) {
    vtTuneMode = mode;
    var snap = document.getElementById('vt-mode-snap');
    var smooth = document.getElementById('vt-mode-smooth');
    if (snap) { snap.style.background = mode==='snap'?'rgba(255,58,181,0.15)':'var(--bg2)'; snap.style.borderColor = mode==='snap'?'var(--c1)':'var(--border2)'; snap.style.color = mode==='snap'?'var(--c1)':'var(--muted)'; }
    if (smooth) { smooth.style.background = mode==='smooth'?'rgba(255,107,53,0.15)':'var(--bg2)'; smooth.style.borderColor = mode==='smooth'?'var(--c2)':'var(--border2)'; smooth.style.color = mode==='smooth'?'var(--c2)':'var(--muted)'; }
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CARREGAR FICHEIRO
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vtLoadFile = async function(file) {
    if (!file) return;
    vtStatus('A carregar ' + file.name + '...', 'var(--c5)');
    try {
      var ctx = getCtx();
      var ab = await file.arrayBuffer();
      vtBuffer = await new Promise(function(res,rej){ ctx.decodeAudioData(ab,res,rej); });
      vtTunedBuffer = null; vtAnalysis = null;

      var info = document.getElementById('vt-info');
      if (info) info.innerHTML = '<span style="color:var(--c4);font-weight:700;">✓ ' + file.name + '</span> <span style="color:var(--muted);">' + vtBuffer.duration.toFixed(1) + 's · ' + vtBuffer.sampleRate + 'Hz</span>';

      setBtn('vt-play-orig', false);
      setBtn('vt-play-preview', false);
      setBtn('vt-play-tuned', true);
      setBtn('vt-export-wav', false);
      setBtn('vt-send-master', false);

      vtStatus('✓ Carregado — usa PREVIEW para ouvir pitch shift em tempo real', 'var(--c4)');
      _drawWaveform();
      _drawPianoRoll();
    } catch(e) {
      vtStatus('Erro: ' + e.message, 'var(--c7)');
      console.error('[VoiceTune]', e);
    }
  };

  // Também aceita buffer do Voice Lab via vtReceiveBuffer
  window.vtReceiveBuffer = function(buf) {
    vtBuffer = buf; vtTunedBuffer = null; vtAnalysis = null;
    setBtn('vt-play-orig', false); setBtn('vt-play-preview', false);
    setBtn('vt-play-tuned', true); setBtn('vt-export-wav', true);
    setBtn('vt-send-master', true); setBtn('vt-send-vl', true);
    var info = document.getElementById('vt-info');
    if (info) info.innerHTML = '<span style="color:var(--c6);font-weight:700;">↗ Recebido do Voice Lab</span> <span style="color:var(--muted);">' + buf.duration.toFixed(1) + 's · ' + buf.sampleRate + 'Hz</span>';
    vtStatus('✓ Buffer recebido do Voice Lab', 'var(--c4)');
    _drawWaveform(); _drawPianoRoll();
  };

  /* Drag & drop */
  window.vtInitDrop = function() {
    var zone = document.getElementById('vt-dropzone');
    if (!zone || zone._init) return; zone._init = true;
    zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.style.borderColor='var(--c6)'; });
    zone.addEventListener('dragleave', function(){ zone.style.borderColor=''; });
    zone.addEventListener('drop', function(e){ e.preventDefault(); zone.style.borderColor=''; var f=e.dataTransfer.files[0]; if(f) vtLoadFile(f); });
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * PREVIEW EM TEMPO REAL — playbackRate para pitch shift simples
   * ══════════════════════════════════════════════════════════════════════════ */
  function _startVtPreview() {
    if (!vtBuffer) return;
    var ctx = getCtx();
    if (vtPreviewSource) { try { vtPreviewSource.stop(); } catch(e){} vtPreviewSource = null; }
    vtPreviewSource = ctx.createBufferSource();
    vtPreviewSource.buffer = vtBuffer;
    vtPreviewSource.loop = true; // LOOP até parar
    var semis = parseFloat((document.getElementById('vt-pitch-semis')||{value:0}).value) || 0;
    var cents = parseFloat((document.getElementById('vt-pitch-cents')||{value:0}).value) || 0;
    vtPreviewSource.playbackRate.value = Math.pow(2, (semis + cents/100) / 12);
    vtPreviewSource.connect(ctx.destination);
    vtPreviewSource.start();
  }

  window.vtPlayPreview = function() {
    if (!vtBuffer) { vtStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    if (vtPreviewActive) { vtStop(); return; } // toggle
    vtStop();
    _startVtPreview();
    vtPreviewActive = true;
    var btn = document.getElementById('vt-play-preview');
    if (btn) { btn.style.background = 'rgba(255,227,53,0.25)'; btn.style.borderColor = 'var(--c3)'; btn.textContent = '⬛ PARAR'; }
    vtStatus('▶ PREVIEW em loop — move os sliders para ouvir o efeito · clica de novo para parar', 'var(--c3)');
  };

  window.vtUpdatePreview = function() {
    if (!vtPreviewActive) return;
    // playbackRate pode ser mudado em tempo real na mesma source
    if (vtPreviewSource) {
      var semis = parseFloat((document.getElementById('vt-pitch-semis')||{value:0}).value) || 0;
      var cents = parseFloat((document.getElementById('vt-pitch-cents')||{value:0}).value) || 0;
      vtPreviewSource.playbackRate.value = Math.pow(2, (semis + cents/100) / 12);
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * ANÁLISE — Krumhansl-Schmuckler
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vtAnalyze = function() {
    if (!vtBuffer) { vtStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    vtStatus('A analisar pitch e escala...','var(--c5)');
    setTimeout(function(){
      var ch = vtBuffer.getChannelData(0), sr = vtBuffer.sampleRate, N = ch.length;
      var FFT=2048, HOP=512;
      var minP=Math.floor(sr/1100), maxP=Math.floor(sr/65);
      var noteHist=new Array(12).fill(0), pitchTrack=[], total=0;

      for (var pos=0; pos+FFT<N; pos+=HOP) {
        var en=0; for(var i=pos;i<pos+FFT;i++) en+=ch[i]*ch[i];
        if (en/FFT<0.00005) { pitchTrack.push({silent:true,time:pos/sr}); continue; }
        var bP=0,bC=0;
        for (var p=minP;p<maxP&&p<FFT/2;p++) {
          var c=0,na=0,nb=0;
          for(var i=0;i<FFT-p;i++){var a=ch[pos+i],b=ch[pos+i+p];c+=a*b;na+=a*a;nb+=b*b;}
          var norm=c/(Math.sqrt(na*nb)+1e-10); if(norm>bC){bC=norm;bP=p;}
        }
        if (bP>0&&bC>0.45) {
          var freq=sr/bP;
          if (freq>65&&freq<1100) {
            var semi=12*Math.log2(freq/440), nS=Math.round(semi), cents=(semi-nS)*100;
            var ni=((nS+9+12000)%12); noteHist[ni]++; total++;
            pitchTrack.push({time:pos/sr,semi:semi,note:ni,midi:nS+69,cents:cents,conf:bC,silent:false});
          } else pitchTrack.push({silent:true,time:pos/sr});
        } else pitchTrack.push({silent:true,time:pos/sr});
      }

      if (total<10) { vtStatus('⚠ Poucas notas detectadas','var(--c2)'); return; }

      var bK=0,bM='maior',bCr=-Infinity;
      for (var root=0;root<12;root++) {
        var cM=0,cm=0;
        for(var i=0;i<12;i++){cM+=noteHist[(root+i)%12]*MAJOR_PROFILE[i];cm+=noteHist[(root+i)%12]*MINOR_PROFILE[i];}
        if(cM>bCr){bCr=cM;bK=root;bM='maior';} if(cm>bCr){bCr=cm;bK=root;bM='menor';}
      }
      var inScale=0,outScale=0;
      var scNotes=(bM==='maior'?MAJOR_PATTERN:MINOR_PATTERN).map(function(o){return(bK+o)%12;});
      pitchTrack.forEach(function(p){if(!p.silent){if(scNotes.includes(p.note))inScale++;else outScale++;}});
      var pct=inScale/(inScale+outScale)*100;

      vtAnalysis = {key:NOTE_NAMES[bK],keyIdx:bK,mode:bM,pitchTrack:pitchTrack,scaleNotes:scNotes,totalSamples:total,hopSize:HOP,fftSize:FFT,duration:vtBuffer.duration,pctInScale:pct};

      var kd=document.getElementById('vt-key-display'); if(kd) kd.textContent=NOTE_NAMES[bK]+' '+bM;
      var ki=document.getElementById('vt-key-info'); if(ki) ki.textContent=total+' notas · '+pct.toFixed(1)+'% na escala';

      // Actualiza selector de escala para a detectada
      var rootEl=document.getElementById('vt-scale-root'); if(rootEl) rootEl.value=bK;
      var modeEl=document.getElementById('vt-scale-mode'); if(modeEl) modeEl.value=bM;

      setBtn('vt-btn-apply', false);
      vtStatus('✓ Escala: '+NOTE_NAMES[bK]+' '+bM+' · '+total+' notas · '+pct.toFixed(1)+'% afinadas','var(--c4)');
      _drawPianoRoll();
      _drawScaleKeys();
    }, 50);
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * AUTO-TUNE — phase vocoder completo
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vtApplyAutotune = async function() {
    if (!vtAnalysis) { vtStatus('Analisa primeiro','var(--c7)'); return; }
    var strength = parseInt(document.getElementById('vt-at-strength').value) / 100;
    var speed = parseInt(document.getElementById('vt-at-speed').value);
    var scale = getScale();
    if (!scale) { vtStatus('Define uma escala primeiro','var(--c7)'); return; }

    vtStatus('⏳ A aplicar Auto-Tune (phase vocoder)...','var(--c5)');
    setBtn('vt-btn-apply', true);

    setTimeout(async function(){
      try {
        var sr=vtBuffer.sampleRate, HOP=vtAnalysis.hopSize, FFT=vtAnalysis.fftSize;
        var N=vtBuffer.length, scaleNotes=scale.notes;
        var numHops=Math.floor((N-FFT)/HOP)+1, shiftSemis=new Float32Array(numHops);
        var track=vtAnalysis.pitchTrack;

        for (var h=0;h<numHops;h++) {
          var p=track[h]; if(!p||p.silent||p.semi==null){shiftSemis[h]=0;continue;}
          var sN=Math.round(p.semi), ni=((sN+9+12000)%12), tS=sN;
          if (!scaleNotes.includes(ni)) {
            var bd=99;
            for(var d=-6;d<=6;d++){var ci=((sN+d+9+12000)%12);if(scaleNotes.includes(ci)&&Math.abs(d)<Math.abs(bd))bd=d;}
            if(bd!==99) tS=sN+bd;
          }
          shiftSemis[h] = (tS - p.semi) * strength;
        }

        // Suaviza (retune speed)
        if (speed>0) {
          var hMs=HOP/sr*1000, alp=Math.exp(-hMs/speed), prev=shiftSemis[0];
          for(var h=0;h<numHops;h++){prev=alp*prev+(1-alp)*shiftSemis[h];shiftSemis[h]=prev;}
        }

        // Pitch shift extra (semitons + cents)
        var extraSemis = (parseFloat(document.getElementById('vt-pitch-semis').value)||0) + (parseFloat(document.getElementById('vt-pitch-cents').value)||0)/100;
        if (Math.abs(extraSemis)>0.05) {
          for(var h=0;h<numHops;h++) shiftSemis[h]+=extraSemis;
        }

        vtTunedBuffer = await _phaseVocoder(vtBuffer, shiftSemis, FFT, HOP);
        setBtn('vt-play-tuned', false);
        setBtn('vt-export-wav', false);
        setBtn('vt-send-master', false);
          vtStatus('✓ Auto-Tune aplicado — ouve AFINADO', 'var(--c4)');
        _drawPianoRoll();
      } catch(e) {
        vtStatus('Erro: '+e.message,'var(--c7)'); console.error(e);
      }
      setBtn('vt-btn-apply', false);
    }, 30);
  };

  /* FFT / phase vocoder */
  function _fft(real,imag,n){
    var j=0;
    for(var i=1;i<n;i++){var bit=n>>1;while(j&bit){j^=bit;bit>>=1;}j^=bit;if(i<j){var t=real[i];real[i]=real[j];real[j]=t;t=imag[i];imag[i]=imag[j];imag[j]=t;}}
    for(var sz=2;sz<=n;sz<<=1){var h=sz>>1,st=-2*Math.PI/sz;for(var i=0;i<n;i+=sz){for(var k=0;k<h;k++){var ang=st*k,cs=Math.cos(ang),sn=Math.sin(ang);var tr=cs*real[i+k+h]-sn*imag[i+k+h],ti=sn*real[i+k+h]+cs*imag[i+k+h];real[i+k+h]=real[i+k]-tr;imag[i+k+h]=imag[i+k]-ti;real[i+k]+=tr;imag[i+k]+=ti;}}}
  }
  function _ifft(real,imag,n){for(var i=0;i<n;i++)imag[i]=-imag[i];_fft(real,imag,n);for(var i=0;i<n;i++){real[i]/=n;imag[i]=-imag[i]/n;}}

  async function _phaseVocoder(inBuf, shiftSemis, FFT, HOP) {
    var sr=inBuf.sampleRate, nCh=inBuf.numberOfChannels, N=inBuf.length;
    var ctx=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(nCh,N,sr);
    var out=ctx.createBuffer(nCh,N,sr);
    var win=new Float32Array(FFT); for(var i=0;i<FFT;i++) win[i]=0.5*(1-Math.cos(2*Math.PI*i/(FFT-1)));
    for(var c=0;c<nCh;c++){
      var inD=inBuf.getChannelData(c), outD=out.getChannelData(c), acc=new Float32Array(N);
      var real=new Float32Array(FFT), imag=new Float32Array(FFT);
      var lP=new Float32Array(FFT/2+1), sP=new Float32Array(FFT/2+1);
      var hi=0;
      for(var pos=0;pos+FFT<N;pos+=HOP,hi++){
        var ratio=Math.pow(2,(shiftSemis[hi]||0)/12);
        for(var i=0;i<FFT;i++) real[i]=(inD[pos+i]||0)*win[i];
        imag.fill(0); _fft(real,imag,FFT);
        var mB=new Float32Array(FFT/2+1), fB=new Float32Array(FFT/2+1);
        for(var k=0;k<=FFT/2;k++){
          var mag=Math.sqrt(real[k]*real[k]+imag[k]*imag[k]), ph=Math.atan2(imag[k],real[k]);
          var dl=ph-lP[k]; lP[k]=ph;
          dl-=HOP*2*Math.PI*k/FFT; dl-=2*Math.PI*Math.round(dl/(2*Math.PI));
          mB[k]=mag; fB[k]=2*Math.PI*k/FFT+dl/HOP;
        }
        var nM=new Float32Array(FFT/2+1), nF=new Float32Array(FFT/2+1);
        for(var k=0;k<=FFT/2;k++){var tK=Math.round(k*ratio);if(tK>=0&&tK<=FFT/2&&mB[k]>nM[tK]){nM[tK]=mB[k];nF[tK]=fB[k]*ratio;}}
        for(var k=0;k<=FFT/2;k++){sP[k]+=nF[k]*HOP;real[k]=nM[k]*Math.cos(sP[k]);imag[k]=nM[k]*Math.sin(sP[k]);}
        for(var k=1;k<FFT/2;k++){real[FFT-k]=real[k];imag[FFT-k]=-imag[k];}
        _ifft(real,imag,FFT);
        for(var i=0;i<FFT;i++){if(pos+i<N){outD[pos+i]+=real[i]*win[i];acc[pos+i]+=win[i]*win[i];}}
        if(hi%100===99) await new Promise(function(r){setTimeout(r,0);});
      }
      for(var i=0;i<N;i++){if(acc[i]>0.001)outD[i]/=acc[i];}
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * PLAYER
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vtPlay = function(which) {
    vtStop();
    var buf = which==='tuned' ? vtTunedBuffer : vtBuffer;
    if (!buf) { vtStatus('Buffer indisponível','var(--c7)'); return; }
    var ctx = getCtx();
    vtPlayingSource = ctx.createBufferSource();
    vtPlayingSource.buffer = buf;
    vtPlayingSource.connect(ctx.destination);
    vtPlayingSource.start();
    vtStatus('▶ A tocar — '+(which==='tuned'?'AFINADO':'ORIGINAL'), which==='tuned'?'var(--c4)':'var(--text)');
    vtPlayingSource.onended = function(){ vtPlayingSource=null; vtStatus('■ Parado','var(--muted)'); };
  };

  window.vtStop = function() {
    if (vtPlayingSource){try{vtPlayingSource.stop();}catch(e){}vtPlayingSource=null;}
    if (vtPreviewSource){try{vtPreviewSource.stop();}catch(e){}vtPreviewSource=null;}
    vtPreviewActive=false;
    var btn=document.getElementById('vt-play-preview');
    if(btn){btn.style.background='rgba(255,227,53,0.07)';btn.style.borderColor='var(--c3)';btn.textContent='▶ PREVIEW';}
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * EXPORT + ENVIAR
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vtExport = function() {
    var buf = vtTunedBuffer || vtBuffer;
    if (!buf){vtStatus('Aplica o Auto-Tune primeiro','var(--c7)');return;}
    var blob = _bufToWav(buf);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href=url; a.download='voicetune_'+Date.now()+'.wav'; a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    vtStatus('✓ Exportado WAV','var(--c4)');
  };

  window.vtSendToMaster = function() {
    var buf = vtTunedBuffer || vtBuffer;
    if(!buf){vtStatus('Carrega um ficheiro primeiro','var(--c7)');return;}
    // Injector no player da suite
    window.audioBuffer = buf;
    if (typeof initAudio === 'function') initAudio();
    // Mostrar waveform, esconder drop
    var ww = document.getElementById('waveform-wrap');
    var dz = document.getElementById('drop-zone');
    if (ww) ww.style.display = 'flex';
    if (dz) dz.style.display = 'none';
    // Actualizar UI da suite
    var trackName = document.getElementById('track-name');
    if (trackName) trackName.textContent = 'Voice Tune';
    if (typeof drawWaveform === 'function') drawWaveform();
    if (typeof applyDSP === 'function') applyDSP();
    // Navegar para MASTER usando openVoiceTune's sister function logic
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    var masterTab = document.querySelector('.tab-primary');
    if (masterTab) masterTab.classList.add('active');
    var masterPanel = document.getElementById('tab-master');
    if (masterPanel) masterPanel.classList.add('active');
    vtStatus('✓ Enviado para MASTER','var(--c5)');
  };

  window.vtSendToVoiceLab = function() {
    var buf = vtTunedBuffer || vtBuffer;
    if(!buf){vtStatus('Aplica o Auto-Tune primeiro','var(--c7)');return;}
    // Voice Lab aceita via window.vlLoadBuffer se existir
    if(window.vlReceiveTuned) window.vlReceiveTuned(buf);
    else window.audioBuffer=buf;
    vtStatus('✓ Enviado para Voice Lab','var(--c1)');
    if(window.openVoiceLab) openVoiceLab();
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
   * PIANO ROLL GRANDE
   * ══════════════════════════════════════════════════════════════════════════ */
  function _drawPianoRoll() {
    var cv=document.getElementById('vt-pianoroll'); if(!cv) return;
    var W=cv.offsetWidth||cv.parentElement.offsetWidth||600; cv.width=W; var H=cv.height;
    var ctx=cv.getContext('2d');
    ctx.fillStyle='#07070e'; ctx.fillRect(0,0,W,H);

    var minMidi=45, maxMidi=84, noteH=(H-24)/(maxMidi-minMidi);
    var pianoW=34;

    // Teclas do piano lateral
    for(var m=minMidi;m<=maxMidi;m++){
      var y=H-12-(m-minMidi)*noteH;
      var isBlack=[1,3,6,8,10].includes(m%12);
      // Fundo da linha
      ctx.fillStyle=isBlack?'rgba(30,30,45,0.6)':'rgba(40,40,55,0.3)';
      ctx.fillRect(pianoW,y-noteH,W-pianoW,noteH);
      // Tecla piano
      if(!isBlack){
        ctx.fillStyle='rgba(200,200,210,0.85)';
        ctx.fillRect(2,y-noteH+0.5,pianoW-4,noteH-1);
      } else {
        ctx.fillStyle='rgba(30,30,35,0.9)';
        ctx.fillRect(2,y-noteH+0.5,pianoW-10,noteH-1);
      }
      // Label C
      if(m%12===0){
        ctx.fillStyle='rgba(80,80,90,0.9)'; ctx.font='bold 8px monospace';
        ctx.fillText('C'+(Math.floor(m/12)-1),pianoW-30,y-1);
        ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(pianoW,y); ctx.lineTo(W,y); ctx.stroke();
      }
    }

    // Escala destacada
    var sc = getScale();
    if (sc) {
      for(var m=minMidi;m<=maxMidi;m++){
        if(sc.notes.includes(m%12)){
          var y=H-12-(m-minMidi)*noteH;
          ctx.fillStyle='rgba(45,255,138,0.06)'; ctx.fillRect(pianoW,y-noteH,W-pianoW,noteH);
          ctx.strokeStyle='rgba(45,255,138,0.12)'; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(pianoW,y); ctx.lineTo(W,y); ctx.stroke();
        }
      }
    }

    // Grid de tempo
    if(vtAnalysis){
      var dur=vtAnalysis.duration;
      var tickSec=dur>30?4:dur>10?2:1;
      for(var t=0;t<=dur;t+=tickSec){
        var x=pianoW+(t/dur)*(W-pianoW-2);
        ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H-12); ctx.stroke();
        ctx.fillStyle='rgba(100,100,120,0.7)'; ctx.font='8px monospace';
        ctx.fillText(t+'s',x+2,H-2);
      }
    }

    if(!vtBuffer){
      ctx.fillStyle='rgba(100,100,140,0.5)'; ctx.font='11px monospace';
      ctx.fillText('Carrega uma voz e clica ANALISAR para ver o piano roll',pianoW+10,H/2);
      return;
    }
    if(!vtAnalysis){
      ctx.fillStyle='rgba(100,100,140,0.4)'; ctx.font='10px monospace';
      ctx.fillText('Clica ANALISAR para ver o pitch tracking',pianoW+10,H/2);
      return;
    }

    var dur=vtAnalysis.duration;

    // Pontos originais
    ctx.fillStyle='rgba(160,160,180,0.6)';
    vtAnalysis.pitchTrack.forEach(function(p){
      if(p.silent) return;
      var x=pianoW+(p.time/dur)*(W-pianoW-2);
      var midi=p.midi; if(midi<minMidi||midi>maxMidi) return;
      var y=H-12-(midi-minMidi)*noteH+p.cents/100*noteH;
      ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fill();
    });

    // Pontos afinados (após auto-tune)
    if(vtTunedBuffer && sc){
      ctx.fillStyle='rgba(255,58,181,0.88)';
      vtAnalysis.pitchTrack.forEach(function(p){
        if(p.silent) return;
        var x=pianoW+(p.time/dur)*(W-pianoW-2);
        var sN=Math.round(p.semi), ni=((sN+9+12000)%12), tS=sN;
        if(!sc.notes.includes(ni)){var bd=99;for(var d=-6;d<=6;d++){var ci=((sN+d+9+12000)%12);if(sc.notes.includes(ci)&&Math.abs(d)<Math.abs(bd))bd=d;}if(bd!==99)tS=sN+bd;}
        var tMidi=tS+69; if(tMidi<minMidi||tMidi>maxMidi) return;
        var y=H-12-(tMidi-minMidi)*noteH;
        ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2); ctx.fill();
      });
    }

    // Info escala
    if(vtAnalysis){
      ctx.fillStyle='rgba(45,255,138,0.8)'; ctx.font='bold 9px monospace';
      ctx.fillText('Escala: '+vtAnalysis.key+' '+vtAnalysis.mode+' · '+vtAnalysis.totalSamples+' notas · '+vtAnalysis.pctInScale.toFixed(1)+'% afinadas',pianoW+6,11);
    }
  }

  /* Mini teclado da escala */
  function _drawScaleKeys() {
    var cv=document.getElementById('vt-scale-keys'); if(!cv) return;
    var W=cv.offsetWidth||200; cv.width=W; var H=cv.height;
    var ctx=cv.getContext('2d');
    ctx.fillStyle='var(--bg)'; ctx.fillRect(0,0,W,H);
    var sc=getScale(); if(!sc) return;
    var noteW=W/12;
    var blackNotes=[1,3,6,8,10];
    // Teclas brancas
    var whiteIdx=0;
    for(var n=0;n<12;n++){
      if(!blackNotes.includes(n)){
        var inSc=sc.notes.includes(n);
        ctx.fillStyle=inSc?'rgba(45,255,138,0.7)':'rgba(180,180,190,0.3)';
        ctx.fillRect(whiteIdx*(W/7)+1,1,W/7-2,H-2);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.strokeRect(whiteIdx*(W/7)+1,1,W/7-2,H-2);
        if(inSc){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.font='7px monospace';ctx.fillText(NOTE_NAMES[n],whiteIdx*(W/7)+3,H-3);}
        whiteIdx++;
      }
    }
    // Teclas pretas
    whiteIdx=0;
    for(var n=0;n<12;n++){
      if(!blackNotes.includes(n)){
        var nextBlack=n+1;
        if(blackNotes.includes(nextBlack)){
          var inSc=sc.notes.includes(nextBlack);
          ctx.fillStyle=inSc?'rgba(184,85,247,0.85)':'rgba(30,30,40,0.85)';
          ctx.fillRect((whiteIdx+1)*(W/7)-W/21,1,W/10,H*0.6);
        }
        whiteIdx++;
      }
    }
  }

  /* Waveform */
  function _drawWaveform() {
    var cv=document.getElementById('vt-waveform'); if(!cv||!vtBuffer) return;
    var W=cv.offsetWidth||400; cv.width=W; var H=cv.height;
    var ctx=cv.getContext('2d'); ctx.clearRect(0,0,W,H);
    var data=vtBuffer.getChannelData(0), step=Math.floor(data.length/W);
    ctx.strokeStyle='var(--c6)'; ctx.lineWidth=1.5; ctx.beginPath();
    for(var x=0;x<W;x++){var mx=0;for(var i=0;i<step;i++)mx=Math.max(mx,Math.abs(data[x*step+i]||0));var y=H/2-mx*(H/2)*0.88;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
    ctx.strokeStyle='rgba(184,85,247,0.15)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * INIT — hook openTab
   * ══════════════════════════════════════════════════════════════════════════ */
  // Ouve evento de navegação em vez de override openTab
  document.addEventListener('piradex:tab', function(e){
    if (e.detail === 'voicetune') {
      setTimeout(function(){
        vtInitDrop();
        _drawPianoRoll();
        _drawScaleKeys();
        if (vtBuffer) _drawWaveform();
      }, 60);
    }
  });

  // Também init se o painel já estiver activo no load
  setTimeout(function(){
    var p = document.getElementById('tab-voicetune');
    if (p && p.classList.contains('active')) {
      vtInitDrop(); _drawPianoRoll(); _drawScaleKeys();
    }
  }, 300);

})();
