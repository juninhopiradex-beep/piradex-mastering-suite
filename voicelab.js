/* ═══════════════════════════════════════════════════════════════════════════
 * VOICE LAB v2.0 — Piradex Mastering Suite
 * Pipeline 5 passos: Clean → Shape → Control → Tune → Space
 * + Vocal Aligner (guia + pistas de coro)
 * Fix: AudioContext resume + decodeAudioData Promise (Safari/Catalina)
 * ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Estado global ────────────────────────────────────────────────────── */
  let vlBuffer = null;
  let vlProcessedBuffer = null;
  let vlPlayingSource = null;
  let vlCtx = null;
  let vlAnalysis = null;
  let vlTunedBuffer = null;

  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const MAJOR_PATTERN = [0,2,4,5,7,9,11];
  const MINOR_PATTERN = [0,2,3,5,7,8,10];
  const MAJOR_PROFILE = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
  const MINOR_PROFILE = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function vlStatus(msg, color) {
    const el = document.getElementById('vl-status');
    if (el) el.innerHTML = '<span style="color:' + (color||'var(--muted)') + ';">' + msg + '</span>';
  }

  function getCtx() {
    if (!vlCtx || vlCtx.state === 'closed') {
      vlCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // FIX CRÍTICO: resumir contexto suspenso (política autoplay)
    if (vlCtx.state === 'suspended') vlCtx.resume();
    return vlCtx;
  }

  function setStepState(step, state) {
    const el = document.getElementById('vl-step-' + step);
    if (!el) return;
    const colors = { idle: 'var(--border)', active: 'var(--c5)', done: 'var(--c4)' };
    el.style.borderColor = colors[state] || 'var(--border)';
    const badge = el.querySelector('.vl-step-badge');
    if (badge) {
      badge.style.background = state === 'done' ? 'var(--c4)' : state === 'active' ? 'var(--c5)' : 'var(--bg3)';
      badge.style.color = (state === 'active' || state === 'done') ? '#000' : 'var(--muted)';
    }
  }

  window.vlToggleDetail = function(step) {
    const detail = document.getElementById('vl-detail-' + step);
    if (!detail) return;
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    const btn = document.getElementById('vl-detail-btn-' + step);
    if (btn) btn.textContent = isOpen ? '⚙ DETALHE' : '▲ FECHAR';
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * CARREGAR FICHEIRO — fix decodeAudioData Promise
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlLoadFile = async function(file) {
    if (!file) return;
    vlStatus('A carregar ' + file.name + '...', 'var(--c5)');
    try {
      const ctx = getCtx();
      const arrayBuffer = await file.arrayBuffer();
      // FIX: decodeAudioData com callback explícito (evita freeze em Safari/Catalina)
      vlBuffer = await new Promise(function(resolve, reject) {
        ctx.decodeAudioData(arrayBuffer, resolve, reject);
      });
      vlProcessedBuffer = null;
      vlTunedBuffer = null;
      vlAnalysis = null;

      const info = document.getElementById('vl-info');
      if (info) {
        info.style.display = 'block';
        info.innerHTML = '<div style="color:var(--c4);font-weight:700;">✓ ' + file.name + '</div>' +
          '<div style="color:var(--muted);margin-top:4px;">' + vlBuffer.duration.toFixed(1) + 's · ' + vlBuffer.sampleRate + ' Hz · ' + vlBuffer.numberOfChannels + ' canal(is)</div>';
      }

      ['1','2','3','4','5'].forEach(function(s){ setStepState(s, 'idle'); });
      document.getElementById('vl-play-orig').disabled = false;
      document.getElementById('vl-play-result').disabled = true;
      document.getElementById('vl-export-wav').disabled = true;
      document.getElementById('vl-send-master').disabled = true;
      document.getElementById('vl-btn-process').disabled = false;
      vlStatus('✓ Ficheiro carregado — ajusta os passos e clica PROCESSAR', 'var(--c4)');
      _drawDropWave();
    } catch(e) {
      vlStatus('Erro ao carregar: ' + e.message, 'var(--c7)');
      console.error('[VoiceLab] loadFile:', e);
    }
  };

  window.vlInitDrop = function() {
    const zone = document.getElementById('vl-dropzone');
    if (!zone || zone._dropInit) return;
    zone._dropInit = true;
    zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.style.borderColor='var(--c1)'; });
    zone.addEventListener('dragleave', function(){ zone.style.borderColor=''; });
    zone.addEventListener('drop', function(e){ e.preventDefault(); zone.style.borderColor=''; const f=e.dataTransfer.files[0]; if(f) vlLoadFile(f); });
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * DSP — PASSO 1: CLEAN
   * ══════════════════════════════════════════════════════════════════════════ */
  function _applyClean(data, sr, p) {
    const out = new Float32Array(data.length);
    // HPF 1ª ordem
    const rc = 1/(2*Math.PI*(p.hpf||80)), dt = 1/sr, alpha = rc/(rc+dt);
    let prev=0, prevIn=0;
    for(let i=0;i<data.length;i++){
      const x=data[i]; out[i]=alpha*(prev+x-prevIn); prevIn=x; prev=out[i];
    }
    // De-ess
    if(p.deess>0 && p.deessAmt>0){
      const fc=p.deess, rcD=1/(2*Math.PI*fc), alphaD=dt/(rcD+dt);
      let lp=0;
      for(let i=0;i<out.length;i++){
        lp=lp+alphaD*(out[i]-lp);
        out[i]=lp+(out[i]-lp)*(1-p.deessAmt/100);
      }
    }
    // Gate
    const gt=Math.pow(10,(p.gate||-60)/20), winSz=Math.round(sr*0.02);
    for(let i=0;i<out.length;i+=winSz){
      let rms=0;
      for(let j=i;j<Math.min(i+winSz,out.length);j++) rms+=out[j]*out[j];
      if(Math.sqrt(rms/winSz)<gt) for(let j=i;j<Math.min(i+winSz,out.length);j++) out[j]=0;
    }
    return out;
  }

  /* PASSO 2: SHAPE — biquad EQ */
  function _biquadFilter(data,b0,b1,b2,a1,a2){
    const out=new Float32Array(data.length); let x1=0,x2=0,y1=0,y2=0;
    for(let i=0;i<data.length;i++){const x0=data[i],y0=b0*x0+b1*x1+b2*x2-a1*y1-a2*y2;out[i]=y0;x2=x1;x1=x0;y2=y1;y1=y0;}
    return out;
  }
  function _biquadPeak(data,fc,gDb,Q,sr){
    if(Math.abs(gDb)<0.05) return data;
    const A=Math.pow(10,gDb/40),om=2*Math.PI*fc/sr,al=Math.sin(om)/(2*Q);
    const b0=1+al*A,b1=-2*Math.cos(om),b2=1-al*A,a0=1+al/A,a1=-2*Math.cos(om),a2=1-al/A;
    return _biquadFilter(data,b0/a0,b1/a0,b2/a0,a1/a0,a2/a0);
  }
  function _applyShape(data,sr,p){
    let d=data;
    d=_biquadPeak(d,120, p.low||0, 0.8,sr);
    d=_biquadPeak(d,1200,p.mid||0, 1.0,sr);
    d=_biquadPeak(d,5000,p.high||0,1.0,sr);
    d=_biquadPeak(d,12000,p.air||0,0.6,sr);
    return d;
  }

  /* PASSO 3: CONTROL — compressor */
  function _applyControl(data,sr,p){
    const thr=Math.pow(10,(p.threshold||-20)/20);
    const mk=Math.pow(10,(p.makeup||0)/20);
    const ratio=p.ratio||3;
    const atC=Math.exp(-1/(sr*(p.attack||10)/1000));
    const relC=Math.exp(-1/(sr*(p.release||100)/1000));
    const out=new Float32Array(data.length); let env=0;
    for(let i=0;i<data.length;i++){
      const x=Math.abs(data[i]);
      env=x>env?atC*env+(1-atC)*x:relC*env+(1-relC)*x;
      let g=1; if(env>thr) g=Math.pow(thr/env,1-1/ratio);
      out[i]=data[i]*g*mk;
    }
    return out;
  }

  /* PASSO 4: TUNE — pitch shift simples (preserva duração) */
  function _pitchShiftSimple(data,sr,semis){
    if(Math.abs(semis)<0.05) return data;
    const ratio=Math.pow(2,semis/12), srcLen=data.length;
    const tempLen=Math.round(srcLen/ratio), temp=new Float32Array(tempLen);
    for(let i=0;i<tempLen;i++){
      const si=i*ratio, lo=Math.floor(si), hi=Math.min(lo+1,srcLen-1), frac=si-lo;
      temp[i]=data[lo]*(1-frac)+data[hi]*frac;
    }
    const out=new Float32Array(srcLen);
    for(let i=0;i<srcLen;i++){
      const si=i*tempLen/srcLen, lo=Math.floor(si), hi=Math.min(lo+1,tempLen-1), frac=si-lo;
      out[i]=temp[lo]*(1-frac)+temp[hi]*frac;
    }
    return out;
  }

  /* PASSO 5: SPACE — reverb + delay */
  function _applyReverb(data,sr,p){
    const mix=(p.reverbMix||0)/100;
    if(mix<0.01) return data;
    const decay=p.decay||1.5, pdS=Math.round(sr*(p.preDelay||20)/1000);
    const irLen=Math.round(sr*decay), ir=new Float32Array(irLen);
    ir[0]=1;
    const combD=[0.0297,0.0371,0.0411,0.0437].map(function(d){return Math.round(d*sr);});
    for(let ci=0;ci<combD.length;ci++){
      const cd=combD[ci];
      for(let i=cd;i<irLen;i++) ir[i]+=ir[i-cd]*0.5*Math.pow(0.001,1/(decay*sr))*0.25;
    }
    let irMax=0; for(let i=0;i<irLen;i++) irMax=Math.max(irMax,Math.abs(ir[i]));
    if(irMax>0) for(let i=0;i<irLen;i++) ir[i]/=irMax;
    const wet=new Float32Array(data.length+irLen);
    for(let i=0;i<data.length;i++){
      if(data[i]===0) continue;
      for(let j=0;j<irLen&&i+j+pdS<wet.length;j++) wet[i+j+pdS]+=data[i]*ir[j];
    }
    const out=new Float32Array(data.length);
    for(let i=0;i<data.length;i++) out[i]=data[i]*(1-mix)+wet[i]*mix;
    return out;
  }

  function _applyDelay(data,sr,p){
    const mix=(p.delayMix||0)/100;
    if(mix<0.01) return data;
    const bpm=p.delayBpm||120, div=p.delayDiv||4, fb=(p.delayFb||40)/100;
    const dSec=(60/bpm)*(4/div), dS=Math.round(sr*dSec);
    const out=new Float32Array(data.length);
    for(let i=0;i<data.length;i++) out[i]=data[i];
    let fbG=mix, cur=dS;
    while(fbG>0.01&&cur<data.length){
      for(let i=0;i<data.length-cur;i++) out[i+cur]+=data[i]*fbG;
      fbG*=fb; cur+=dS;
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * PROCESSAR — pipeline completo
   * ══════════════════════════════════════════════════════════════════════════ */
  function _readParams(){
    const g=function(id,def){ const el=document.getElementById(id); return el?parseFloat(el.value):def; };
    const gc=function(id){ const el=document.getElementById(id); return el?el.checked:false; };
    return {
      hpf:g('vl-hpf',80), gate:g('vl-gate',-60), deess:gc('vl-deess-on')?g('vl-deess-freq',7000):0, deessAmt:g('vl-deess-amt',50),
      low:g('vl-eq-low',0), mid:g('vl-eq-mid',0), high:g('vl-eq-high',0), air:g('vl-eq-air',0),
      threshold:g('vl-comp-thresh',-20), ratio:g('vl-comp-ratio',3), attack:g('vl-comp-attack',10), release:g('vl-comp-release',100), makeup:g('vl-comp-makeup',0),
      pitchSemis:g('vl-pitch-semis',0),
      reverbMix:g('vl-reverb-mix',0), preDelay:g('vl-reverb-predelay',20), decay:g('vl-reverb-decay',1.5),
      delayMix:g('vl-delay-mix',0), delayBpm:g('vl-delay-bpm',120), delayDiv:g('vl-delay-div',4), delayFb:g('vl-delay-fb',40),
    };
  }

  function _stepEnabled(n){ const el=document.getElementById('vl-step-on-'+n); return el?el.checked:true; }

  window.vlProcess = async function(){
    if(!vlBuffer){ vlStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    const btn=document.getElementById('vl-btn-process');
    if(btn) btn.disabled=true;
    vlStatus('⏳ A processar...','var(--c5)');
    await new Promise(function(r){setTimeout(r,30);});
    try{
      const sr=vlBuffer.sampleRate, numCh=vlBuffer.numberOfChannels, p=_readParams();
      const ctx=getCtx(), outBuf=ctx.createBuffer(numCh,vlBuffer.length,sr);
      for(let c=0;c<numCh;c++){
        let data=new Float32Array(vlBuffer.getChannelData(c));
        if(_stepEnabled(1)){ setStepState('1','active'); await new Promise(function(r){setTimeout(r,0);}); data=_applyClean(data,sr,p); setStepState('1','done'); }
        if(_stepEnabled(2)){ setStepState('2','active'); await new Promise(function(r){setTimeout(r,0);}); data=_applyShape(data,sr,p); setStepState('2','done'); }
        if(_stepEnabled(3)){ setStepState('3','active'); await new Promise(function(r){setTimeout(r,0);}); data=_applyControl(data,sr,p); setStepState('3','done'); }
        if(_stepEnabled(4)){ setStepState('4','active'); await new Promise(function(r){setTimeout(r,0);}); data=_pitchShiftSimple(data,sr,p.pitchSemis||0); setStepState('4','done'); }
        if(_stepEnabled(5)){ setStepState('5','active'); await new Promise(function(r){setTimeout(r,0);}); data=_applyReverb(data,sr,p); data=_applyDelay(data,sr,p); setStepState('5','done'); }
        let peak=0; for(let i=0;i<data.length;i++) peak=Math.max(peak,Math.abs(data[i]));
        if(peak>0.98){ const sc=0.96/peak; for(let i=0;i<data.length;i++) data[i]*=sc; }
        outBuf.copyToChannel(data,c);
      }
      vlProcessedBuffer=outBuf;
      document.getElementById('vl-play-result').disabled=false;
      document.getElementById('vl-export-wav').disabled=false;
      document.getElementById('vl-send-master').disabled=false;
      vlStatus('✓ Processado — ouve o resultado e exporta','var(--c4)');
    }catch(e){ vlStatus('Erro: '+e.message,'var(--c7)'); console.error('[VoiceLab] process:',e); }
    if(btn) btn.disabled=false;
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * AUTO-TUNE COMPLETO (motor original — DETALHE passo 4)
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlAnalyze = function(){
    if(!vlBuffer){ vlStatus('Carrega um ficheiro primeiro','var(--c7)'); return; }
    vlStatus('A analisar pitch e escala...','var(--c5)');
    setTimeout(function(){
      const ch=vlBuffer.getChannelData(0), sr=vlBuffer.sampleRate, N=ch.length;
      const FFT=2048, HOP=512, minP=Math.floor(sr/1100), maxP=Math.floor(sr/65);
      const noteHist=new Array(12).fill(0), pitchTrack=[]; let total=0;
      for(let pos=0;pos+FFT<N;pos+=HOP){
        let en=0; for(let i=pos;i<pos+FFT;i++) en+=ch[i]*ch[i];
        if(en/FFT<0.00005){ pitchTrack.push({silent:true,time:pos/sr}); continue; }
        let bP=0,bC=0;
        for(let p=minP;p<maxP&&p<FFT/2;p++){
          let c=0,na=0,nb=0; for(let i=0;i<FFT-p;i++){const a=ch[pos+i],b=ch[pos+i+p];c+=a*b;na+=a*a;nb+=b*b;}
          const norm=c/(Math.sqrt(na*nb)+1e-10); if(norm>bC){bC=norm;bP=p;}
        }
        if(bP>0&&bC>0.45){
          const freq=sr/bP;
          if(freq>65&&freq<1100){
            const semi=12*Math.log2(freq/440),nS=Math.round(semi),cents=(semi-nS)*100;
            const ni=((nS+9+12000)%12); noteHist[ni]++; total++;
            pitchTrack.push({time:pos/sr,semi,note:ni,midi:nS+69,cents,conf:bC,silent:false});
          } else pitchTrack.push({silent:true,time:pos/sr});
        } else pitchTrack.push({silent:true,time:pos/sr});
      }
      if(total<20){ vlStatus('⚠ Poucas notas detectadas — é mesmo voz isolada?','var(--c2)'); return; }
      let bK=0,bM='maior',bCr=-Infinity;
      for(let root=0;root<12;root++){
        let cM=0,cm=0;
        for(let i=0;i<12;i++){cM+=noteHist[(root+i)%12]*MAJOR_PROFILE[i];cm+=noteHist[(root+i)%12]*MINOR_PROFILE[i];}
        if(cM>bCr){bCr=cM;bK=root;bM='maior';} if(cm>bCr){bCr=cm;bK=root;bM='menor';}
      }
      const scaleNotes=(bM==='maior'?MAJOR_PATTERN:MINOR_PATTERN).map(function(o){return(bK+o)%12;});
      vlAnalysis={key:NOTE_NAMES[bK],keyIdx:bK,mode:bM,pitchTrack,scaleNotes,totalSamples:total,hopSize:HOP,fftSize:FFT,duration:vlBuffer.duration};
      const keyEl=document.getElementById('vl-tune-key'); if(keyEl) keyEl.textContent=NOTE_NAMES[bK]+' '+bM;
      const btnAt=document.getElementById('vl-btn-autotune'); if(btnAt) btnAt.disabled=false;
      vlStatus('✓ Escala: '+NOTE_NAMES[bK]+' '+bM+' · '+total+' notas detectadas','var(--c4)');
    },50);
  };

  window.vlApplyAutotune = async function(){
    if(!vlAnalysis){ vlStatus('Analisa primeiro','var(--c7)'); return; }
    const strength=parseInt(document.getElementById('vl-at-strength').value)/100;
    const speed=parseInt(document.getElementById('vl-at-speed').value);
    vlStatus('⏳ A aplicar Auto-Tune completo (phase vocoder)...','var(--c5)');
    const btn=document.getElementById('vl-btn-autotune'); if(btn) btn.disabled=true;
    setTimeout(async function(){
      try{
        const sr=vlBuffer.sampleRate,HOP=vlAnalysis.hopSize,FFT=vlAnalysis.fftSize;
        const N=vlBuffer.length,scale=vlAnalysis.scaleNotes;
        const numHops=Math.floor((N-FFT)/HOP)+1,shiftSemis=new Float32Array(numHops);
        const track=vlAnalysis.pitchTrack;
        for(let h=0;h<numHops;h++){
          const p=track[h]; if(!p||p.silent||p.semi==null){shiftSemis[h]=0;continue;}
          const sN=Math.round(p.semi),ni=((sN+9+12000)%12); let tS=sN;
          if(!scale.includes(ni)){let bd=99;for(let d=-6;d<=6;d++){const ci=((sN+d+9+12000)%12);if(scale.includes(ci)&&Math.abs(d)<Math.abs(bd))bd=d;}if(bd!==99)tS=sN+bd;}
          shiftSemis[h]=(tS-p.semi)*strength;
        }
        if(speed>0){const hMs=HOP/sr*1000,alp=Math.exp(-hMs/speed);let prev=shiftSemis[0];for(let h=0;h<numHops;h++){prev=alp*prev+(1-alp)*shiftSemis[h];shiftSemis[h]=prev;}}
        vlTunedBuffer=await _phaseVocoderProcess(vlBuffer,shiftSemis,FFT,HOP);
        vlProcessedBuffer=vlTunedBuffer;
        document.getElementById('vl-play-result').disabled=false;
        document.getElementById('vl-export-wav').disabled=false;
        document.getElementById('vl-send-master').disabled=false;
        vlStatus('✓ Auto-Tune completo aplicado','var(--c4)');
      }catch(e){ vlStatus('Erro: '+e.message,'var(--c7)'); }
      if(btn) btn.disabled=false;
    },30);
  };

  function _fft(real,imag,n){
    let j=0;
    for(let i=1;i<n;i++){let bit=n>>1;while(j&bit){j^=bit;bit>>=1;}j^=bit;if(i<j){const tr=real[i];real[i]=real[j];real[j]=tr;const ti=imag[i];imag[i]=imag[j];imag[j]=ti;}}
    for(let size=2;size<=n;size<<=1){const half=size>>1,step=-2*Math.PI/size;for(let i=0;i<n;i+=size){for(let k=0;k<half;k++){const ang=step*k,cs=Math.cos(ang),sn=Math.sin(ang);const tre=cs*real[i+k+half]-sn*imag[i+k+half],tim=sn*real[i+k+half]+cs*imag[i+k+half];real[i+k+half]=real[i+k]-tre;imag[i+k+half]=imag[i+k]-tim;real[i+k]+=tre;imag[i+k]+=tim;}}}
  }
  function _ifft(real,imag,n){for(let i=0;i<n;i++)imag[i]=-imag[i];_fft(real,imag,n);for(let i=0;i<n;i++){real[i]/=n;imag[i]=-imag[i]/n;}}
  async function _phaseVocoderProcess(inputBuffer,shiftSemis,FFT,HOP){
    const sr=inputBuffer.sampleRate,numCh=inputBuffer.numberOfChannels,N=inputBuffer.length;
    const ctx=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(numCh,N,sr);
    const out=ctx.createBuffer(numCh,N,sr);
    const win=new Float32Array(FFT); for(let i=0;i<FFT;i++) win[i]=0.5*(1-Math.cos(2*Math.PI*i/(FFT-1)));
    for(let c=0;c<numCh;c++){
      const inD=inputBuffer.getChannelData(c),outD=out.getChannelData(c),acc=new Float32Array(N);
      const real=new Float32Array(FFT),imag=new Float32Array(FFT),lP=new Float32Array(FFT/2+1),sP=new Float32Array(FFT/2+1);
      let hi=0;
      for(let pos=0;pos+FFT<N;pos+=HOP,hi++){
        const ratio=Math.pow(2,(shiftSemis[hi]||0)/12);
        for(let i=0;i<FFT;i++){real[i]=(inD[pos+i]||0)*win[i];} imag.fill(0); _fft(real,imag,FFT);
        const mB=new Float32Array(FFT/2+1),fB=new Float32Array(FFT/2+1);
        for(let k=0;k<=FFT/2;k++){const mag=Math.sqrt(real[k]*real[k]+imag[k]*imag[k]),ph=Math.atan2(imag[k],real[k]);let dl=ph-lP[k];lP[k]=ph;dl-=HOP*2*Math.PI*k/FFT;dl-=2*Math.PI*Math.round(dl/(2*Math.PI));mB[k]=mag;fB[k]=2*Math.PI*k/FFT+dl/HOP;}
        const nM=new Float32Array(FFT/2+1),nF=new Float32Array(FFT/2+1);
        for(let k=0;k<=FFT/2;k++){const tK=Math.round(k*ratio);if(tK>=0&&tK<=FFT/2&&mB[k]>nM[tK]){nM[tK]=mB[k];nF[tK]=fB[k]*ratio;}}
        for(let k=0;k<=FFT/2;k++){sP[k]+=nF[k]*HOP;real[k]=nM[k]*Math.cos(sP[k]);imag[k]=nM[k]*Math.sin(sP[k]);}
        for(let k=1;k<FFT/2;k++){real[FFT-k]=real[k];imag[FFT-k]=-imag[k];} _ifft(real,imag,FFT);
        for(let i=0;i<FFT;i++){if(pos+i<N){outD[pos+i]+=real[i]*win[i];acc[pos+i]+=win[i]*win[i];}}
        if(hi%100===99) await new Promise(function(r){setTimeout(r,0);});
      }
      for(let i=0;i<N;i++){if(acc[i]>0.001)outD[i]/=acc[i];}
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * PLAYER
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlPlay = function(which){
    vlStop();
    const buf = which==='result' ? (vlProcessedBuffer||vlBuffer) : vlBuffer;
    if(!buf){ vlStatus('Buffer indisponível','var(--c7)'); return; }
    const ctx=getCtx();
    vlPlayingSource=ctx.createBufferSource();
    vlPlayingSource.buffer=buf;
    vlPlayingSource.connect(ctx.destination);
    vlPlayingSource.start();
    vlStatus('▶ A tocar — '+(which==='result'?'PROCESSADO':'ORIGINAL'), which==='result'?'var(--c4)':'var(--c5)');
    vlPlayingSource.onended=function(){ vlPlayingSource=null; vlStatus('■ Parado','var(--muted)'); };
  };
  window.vlStop=function(){
    if(vlPlayingSource){try{vlPlayingSource.stop();}catch(e){}vlPlayingSource=null;}
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * EXPORT WAV
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlExport=function(){
    const buf=vlProcessedBuffer||vlBuffer;
    if(!buf){ vlStatus('Processa primeiro','var(--c7)'); return; }
    const blob=_bufToWav(buf);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='voicelab_'+Date.now()+'.wav'; a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    vlStatus('✓ Exportado WAV','var(--c4)');
  };
  function _bufToWav(buffer){
    const nCh=buffer.numberOfChannels,sr=buffer.sampleRate,N=buffer.length;
    const ab=new ArrayBuffer(44+N*nCh*2),v=new DataView(ab);
    const ws=function(o,s){for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    ws(0,'RIFF');v.setUint32(4,36+N*nCh*2,true);ws(8,'WAVE');ws(12,'fmt ');
    v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nCh,true);
    v.setUint32(24,sr,true);v.setUint32(28,sr*nCh*2,true);v.setUint16(32,nCh*2,true);
    v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,N*nCh*2,true);
    let off=44;
    const chs=[]; for(let c=0;c<nCh;c++) chs.push(buffer.getChannelData(c));
    for(let i=0;i<N;i++) for(let c=0;c<nCh;c++){let s=Math.max(-1,Math.min(1,chs[c][i]));s=s<0?s*0x8000:s*0x7FFF;v.setInt16(off,s|0,true);off+=2;}
    return new Blob([ab],{type:'audio/wav'});
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * ENVIAR PARA MASTER
   * ══════════════════════════════════════════════════════════════════════════ */
  window.vlSendToMaster=function(){
    const buf=vlProcessedBuffer||vlBuffer;
    if(!buf){ vlStatus('Processa primeiro','var(--c7)'); return; }
    window.audioBuffer=buf;
    vlStatus('✓ Enviado para MASTER — muda para o tab MASTER','var(--c5)');
  };

  /* ══════════════════════════════════════════════════════════════════════════
   * WAVEFORM mini
   * ══════════════════════════════════════════════════════════════════════════ */
  function _drawDropWave(){
    const cv=document.getElementById('vl-waveform');
    if(!cv||!vlBuffer) return;
    const W=cv.offsetWidth||300,H=cv.height;
    cv.width=W;
    const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const data=vlBuffer.getChannelData(0);
    const step=Math.floor(data.length/W);
    ctx.strokeStyle='var(--c1)'; ctx.lineWidth=1.5; ctx.beginPath();
    for(let x=0;x<W;x++){
      let mx=0; for(let i=0;i<step;i++) mx=Math.max(mx,Math.abs(data[x*step+i]||0));
      const y=H/2-mx*(H/2)*0.88; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
    // Linha centro
    ctx.strokeStyle='rgba(255,58,181,0.15)'; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * VOCAL ALIGNER
   * ══════════════════════════════════════════════════════════════════════════ */
  const aligner={guide:null,tracks:[],playSource:null,zoom:1};

  window.vaLoadGuide=async function(file){
    if(!file) return;
    const ctx=getCtx();
    const ab=await file.arrayBuffer();
    aligner.guide=await new Promise(function(res,rej){ctx.decodeAudioData(ab,res,rej);});
    const nm=document.getElementById('va-guide-name'); if(nm) nm.textContent=file.name;
    _vaDrawAll(); vlStatus('✓ Guia carregada · '+aligner.guide.duration.toFixed(1)+'s','var(--c4)');
  };

  window.vaAddTrack=async function(file){
    if(!file) return;
    const ctx=getCtx();
    const ab=await file.arrayBuffer();
    const buf=await new Promise(function(res,rej){ctx.decodeAudioData(ab,res,rej);});
    aligner.tracks.push({buffer:buf,offset:0,name:file.name});
    _vaRenderTracks(); _vaDrawAll();
    vlStatus('✓ Pista adicionada: '+file.name,'var(--c5)');
  };

  function _vaRenderTracks(){
    const container=document.getElementById('va-tracks');
    if(!container) return;
    container.innerHTML='';
    aligner.tracks.forEach(function(t,i){
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:8px;';
      row.className='va-track-row';
      row.innerHTML='<div style="width:100px;min-width:100px;"><div style="font-size:9px;color:var(--muted2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:98px;" title="'+t.name+'">'+t.name+'</div><div style="font-size:8px;color:var(--c5);margin-top:2px;">offset: <b id="va-offset-'+i+'">0</b>ms</div><div style="display:flex;gap:3px;margin-top:4px;"><button onclick="vaExportMix('+i+')" style="font-size:8px;background:rgba(45,255,138,0.08);border:1px solid var(--c4);color:var(--c4);border-radius:3px;padding:2px 5px;cursor:pointer;font-family:Rajdhani,monospace;">⬇</button><button onclick="vaRemoveTrack('+i+')" style="font-size:8px;background:none;border:1px solid var(--border2);color:var(--muted);border-radius:3px;padding:2px 5px;cursor:pointer;">✕</button></div></div><canvas id="va-canvas-'+i+'" height="40"></canvas>';
      container.appendChild(row);
      _vaDrawTrack(i);
      _vaBindDrag(i);
    });
  }

  window.vaRemoveTrack=function(i){ aligner.tracks.splice(i,1); _vaRenderTracks(); _vaDrawAll(); };

  function _vaDrawAll(){ _vaDrawGuide(); aligner.tracks.forEach(function(_,i){_vaDrawTrack(i);}); }

  function _vaDrawGuide(){
    const cv=document.getElementById('va-guide-canvas');
    if(!cv||!aligner.guide) return;
    _vaDrawWave(cv,aligner.guide,'var(--c4)',0,null);
  }
  function _vaDrawTrack(i){
    const cv=document.getElementById('va-canvas-'+i);
    if(!cv) return;
    _vaDrawWave(cv,aligner.tracks[i].buffer,'var(--c5)',aligner.tracks[i].offset,aligner.guide);
  }
  function _vaDrawWave(cv,buffer,color,offsetSec,refBuf){
    const totalDur=refBuf?refBuf.duration:buffer.duration;
    const W=cv.offsetWidth||cv.parentElement.offsetWidth||600; cv.width=W;
    const H=cv.height, ctx=cv.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const data=buffer.getChannelData(0);
    const pxPerSec=(W/totalDur)*aligner.zoom;
    const samplesPerPx=Math.max(1,Math.floor(data.length/(W*aligner.zoom)));
    const offsetPx=offsetSec*pxPerSec;
    ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.globalAlpha=0.85; ctx.beginPath();
    for(let x=0;x<W;x++){
      const sStart=Math.floor((x-offsetPx)*samplesPerPx*(1/aligner.zoom));
      let mx=0;
      for(let j=0;j<samplesPerPx;j++){const idx=sStart+j;if(idx>=0&&idx<data.length)mx=Math.max(mx,Math.abs(data[idx]));}
      const y=H/2-mx*(H/2-2); x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.globalAlpha=1;
    // Linha centro
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.beginPath();
    ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  }

  function _vaBindDrag(i){
    const cv=document.getElementById('va-canvas-'+i);
    if(!cv) return;
    let sX=0,sOff=0,drag=false;
    cv.addEventListener('mousedown',function(e){drag=true;sX=e.clientX;sOff=aligner.tracks[i].offset;e.preventDefault();});
    window.addEventListener('mousemove',function(e){
      if(!drag) return;
      const dur=aligner.guide?aligner.guide.duration:10;
      const dSec=(e.clientX-sX)/((cv.offsetWidth||600)/dur);
      aligner.tracks[i].offset=Math.max(-aligner.tracks[i].buffer.duration,Math.min(dur,sOff+dSec));
      const el=document.getElementById('va-offset-'+i);
      if(el) el.textContent=Math.round(aligner.tracks[i].offset*1000);
      _vaDrawTrack(i);
    });
    window.addEventListener('mouseup',function(){drag=false;});
    cv.addEventListener('touchstart',function(e){drag=true;sX=e.touches[0].clientX;sOff=aligner.tracks[i].offset;},{passive:true});
    window.addEventListener('touchmove',function(e){
      if(!drag) return;
      const dur=aligner.guide?aligner.guide.duration:10;
      const dSec=(e.touches[0].clientX-sX)/((cv.offsetWidth||600)/dur);
      aligner.tracks[i].offset=Math.max(-aligner.tracks[i].buffer.duration,Math.min(dur,sOff+dSec));
      const el=document.getElementById('va-offset-'+i);
      if(el) el.textContent=Math.round(aligner.tracks[i].offset*1000);
      _vaDrawTrack(i);
    },{passive:true});
    window.addEventListener('touchend',function(){drag=false;});
  }

  window.vaPlay=function(){
    vaStop();
    if(!aligner.guide){ vlStatus('Carrega a guia primeiro','var(--c7)'); return; }
    const ctx=getCtx();
    const gSrc=ctx.createBufferSource(); gSrc.buffer=aligner.guide; gSrc.connect(ctx.destination); gSrc.start();
    aligner.playSource=[gSrc];
    aligner.tracks.forEach(function(t){
      const src=ctx.createBufferSource(); src.buffer=t.buffer; src.connect(ctx.destination);
      if(t.offset>=0) src.start(ctx.currentTime+t.offset); else src.start(ctx.currentTime,-(t.offset));
      aligner.playSource.push(src);
    });
    vlStatus('▶ A tocar alinhamento...','var(--c4)');
  };
  window.vaStop=function(){
    if(aligner.playSource){aligner.playSource.forEach(function(s){try{s.stop();}catch(e){}});aligner.playSource=null;}
    vlStatus('■ Parado','var(--muted)');
  };
  window.vaExportMix=function(idx){
    const t=aligner.tracks[idx]; if(!t) return;
    const blob=_bufToWav(t.buffer);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='aligned_'+t.name.replace(/\s/g,'_'); a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    vlStatus('✓ Pista exportada','var(--c4)');
  };
  window.vaZoom=function(dir){ aligner.zoom=Math.max(0.5,Math.min(8,aligner.zoom*(dir>0?1.5:0.67))); _vaDrawAll(); };

  /* ══════════════════════════════════════════════════════════════════════════
   * INIT
   * ══════════════════════════════════════════════════════════════════════════ */
  const _origOpenTab=window.openTab;
  window.openTab=function(name,el){
    if(_origOpenTab) _origOpenTab(name,el);
    if(name==='voicelab') setTimeout(function(){ vlInitDrop(); _vaDrawGuide(); },60);
  };
  setTimeout(function(){
    const panel=document.getElementById('tab-voicelab');
    if(panel&&panel.style.display!=='none') vlInitDrop();
  },200);

})();
