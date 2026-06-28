/* ============================================================
   Piradex · piradex-loudness-meter.js
   API de wiring: cria DOIS taps de medição (entrada + saída) como
   pass-through e expõe as leituras BS.1770 vindas do worklet.

   USO NA SUITE:
     const meters = await createPiradexMetering(audioCtx, {
        target: -14,                       // alvo LUFS
        workletUrl: 'loudness-processor.js' // opcional (servido); senão usa Blob
     });
     fonte.connect(meters.inputNode);     // tap de entrada
     meters.inputNode.connect(primeiroProc);
     // ...cadeia (EQ, comp, limiter)...
     limiter.connect(meters.outputNode);  // tap de saída
     meters.outputNode.connect(audioCtx.destination);

     meters.onUpdate((state, target) => { ... state.in / state.out ... });

   Campos de cada leitura (state.in / state.out):
     { id, channels, momentary, shortTerm, integrated, lra,
       tpMax, tpL, tpR, corr, balance, side }   // dB/LUFS; corr/balance/side em -1..1 / 0..1
   ============================================================ */
(function(global){
  "use strict";

  // Fonte do worklet embebida (fallback Blob — espelha loudness-processor.js)
  const WORKLET_SRC = String.raw`/* ============================================================
   Piradex · loudness-processor.js
   Medição de loudness ITU-R BS.1770-4 / EBU R128 num AudioWorklet.
   Mede: Momentary (400ms), Short-term (3s), Integrated (com gating),
   Loudness Range, True-peak (sobreamostragem 4x), correlação e
   balança L/R + Mid/Side. Funciona como PASS-THROUGH (não altera o áudio).

   Carregado por addModule() — direto (servido) ou via Blob (embebido).
   Coeficientes da ponderação-K recalculados para o sampleRate real.
   ============================================================ */
class LoudnessProcessor extends AudioWorkletProcessor {
  constructor(opt){
    super();
    this.fs = sampleRate;
    this.id = (opt && opt.processorOptions && opt.processorOptions.id) || 'meter';
    this.shelf = this._shelf(this.fs);   // pre-filter (high-shelf)
    this.hp    = this._hp(this.fs);      // RLB high-pass
    this.st = [];                        // estados de filtro por canal
    this.blkN = Math.round(0.1*this.fs); // bloco de 100 ms
    this.acc = 0; this.sumSq = [0,0];    // soma de quadrados ponderados-K (100ms)
    this.sub = [];                       // sub-blocos 100ms: {s:[L,R], n}
    this.gate = [];                      // blocos 400ms p/ integrated: {zs, l}
    this.stHist = [];                    // short-term p/ LRA
    this.stClock = 0;
    this.osc = this._osDesign(4,8);      // sobreamostragem 4x p/ true-peak
    this.osDelay = [];                   // delay-line por canal
    this.tpMax = -Infinity;              // true-peak max-hold (dBTP)
    this.tpCur = [-Infinity,-Infinity];  // true-peak corrente por canal
    this.cLR=0;this.cLL=0;this.cRR=0;this.cN=0; // correlação (janela ~100ms)
    this.msM=0;this.msS=0;               // energia mid/side
    this.nch=2;
    this.port.onmessage = (e)=>{
      if(e.data==='resetInt'){ this.gate=[]; this.stHist=[]; }
      if(e.data==='resetTP'){ this.tpMax=-Infinity; }
    };
  }
  _shelf(fs){const G=3.999843853973347,Q=0.7071752369554196,fc=1681.974450955533;
    const K=Math.tan(Math.PI*fc/fs),Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,0.4996667741545416),a0=1+K/Q+K*K;
    return{b0:(Vh+Vb*K/Q+K*K)/a0,b1:2*(K*K-Vh)/a0,b2:(Vh-Vb*K/Q+K*K)/a0,a1:2*(K*K-1)/a0,a2:(1-K/Q+K*K)/a0};}
  _hp(fs){const Q=0.5003270373238773,fc=38.13547087602444;
    const K=Math.tan(Math.PI*fc/fs),a0=1+K/Q+K*K;
    return{b0:1,b1:-2,b2:1,a1:2*(K*K-1)/a0,a2:(1-K/Q+K*K)/a0};}
  _biq(c,s,x){const y=c.b0*x+c.b1*s.x1+c.b2*s.x2-c.a1*s.y1-c.a2*s.y2;
    s.x2=s.x1;s.x1=x;s.y2=s.y1;s.y1=y;return y;}
  _osDesign(f,tpp){const N=f*tpp,fc=0.5/f,M=N-1,h=new Float32Array(N);
    for(let n=0;n<N;n++){const x=n-M/2;let s=(x===0)?2*fc:Math.sin(2*Math.PI*fc*x)/(Math.PI*x);
      h[n]=s*(0.5-0.5*Math.cos(2*Math.PI*n/M));}
    let sum=0;for(let n=0;n<N;n++)sum+=h[n];for(let n=0;n<N;n++)h[n]=h[n]/sum*f;
    const ph=[];for(let p=0;p<f;p++){ph[p]=[];for(let j=0;j<tpp;j++)ph[p].push(h[p+f*j]||0);}
    return{f,tpp,ph};}
  _loudFrom(zs){return -0.691+10*Math.log10(zs>0?zs:1e-12);}

  process(inputs,outputs){
    const inp=inputs[0],out=outputs[0];
    if(!inp||inp.length===0)return true;
    const ch=Math.min(inp.length,2); this.nch=ch;
    const n=inp[0].length;
    // pass-through (não altera o áudio)
    for(let c=0;c<out.length;c++){const o=out[c],i=inp[Math.min(c,inp.length-1)];
      if(i)for(let k=0;k<n;k++)o[k]=i[k];}
    while(this.st.length<2){this.st.push({sh:{x1:0,x2:0,y1:0,y2:0},hp:{x1:0,x2:0,y1:0,y2:0}});
      this.osDelay.push(new Float32Array(this.osc.tpp));}
    const L=inp[0], R=ch>1?inp[1]:null;
    for(let k=0;k<n;k++){
      const sL=L[k], sR=R?R[k]:0;
      let kL=this._biq(this.shelf,this.st[0].sh,sL); kL=this._biq(this.hp,this.st[0].hp,kL);
      this.sumSq[0]+=kL*kL;
      if(R){ let kR=this._biq(this.shelf,this.st[1].sh,sR); kR=this._biq(this.hp,this.st[1].hp,kR);
        this.sumSq[1]+=kR*kR; }
      this.acc++;
      this._tp(0,sL); if(R)this._tp(1,sR);
      if(R){ this.cLR+=sL*sR; this.cLL+=sL*sL; this.cRR+=sR*sR; this.cN++;
        const m=(sL+sR)*0.5, s=(sL-sR)*0.5; this.msM+=m*m; this.msS+=s*s; }
      if(this.acc>=this.blkN) this._closeBlock();
    }
    return true;
  }
  _tp(c,x){const d=this.osDelay[c];for(let j=d.length-1;j>0;j--)d[j]=d[j-1];d[0]=x;
    let pk=0;for(let p=0;p<this.osc.f;p++){let a=0;const co=this.osc.ph[p];
      for(let j=0;j<co.length;j++)a+=co[j]*d[j];const ab=Math.abs(a);if(ab>pk)pk=ab;}
    const db=20*Math.log10(pk>1e-9?pk:1e-9);
    if(db>this.tpCur[c])this.tpCur[c]=db; if(db>this.tpMax)this.tpMax=db;}

  _closeBlock(){
    this.sub.push({s:[this.sumSq[0],this.sumSq[1]], n:this.acc});
    if(this.sub.length>40)this.sub.shift();
    this.sumSq=[0,0]; this.acc=0;
    if(this.sub.length>=4){
      let sL=0,sR=0,nn=0;
      for(let i=this.sub.length-4;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}
      const zs=(sL+sR)/nn, l=this._loudFrom(zs);
      this.gate.push({zs,l}); if(this.gate.length>36000)this.gate.shift();
    }
    this.stClock++;
    if(this.stClock>=3 && this.sub.length>=30){
      this.stClock=0; let sL=0,sR=0,nn=0;
      for(let i=this.sub.length-30;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}
      this.stHist.push(this._loudFrom((sL+sR)/nn)); if(this.stHist.length>4000)this.stHist.shift();
    }
    this._post();
  }
  _winLoud(cnt){ if(this.sub.length<cnt)cnt=this.sub.length; if(cnt===0)return -Infinity;
    let sL=0,sR=0,nn=0; for(let i=this.sub.length-cnt;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}
    return this._loudFrom((sL+sR)/nn); }
  _integrated(){
    if(!this.gate.length)return -Infinity;
    const abs=this.gate.filter(b=>b.l>-70); if(!abs.length)return -Infinity;
    let m=0;for(const b of abs)m+=b.zs;m/=abs.length;
    const gamma=this._loudFrom(m)-10;
    const rel=abs.filter(b=>b.l>gamma); if(!rel.length)return -Infinity;
    let m2=0;for(const b of rel)m2+=b.zs;m2/=rel.length;
    return this._loudFrom(m2);
  }
  _lra(){
    const v=this.stHist.filter(x=>x>-70); if(v.length<6)return 0;
    let m=0;for(const x of v)m+=Math.pow(10,(x+0.691)/10);m/=v.length;
    const thr=(-0.691+10*Math.log10(m))-20;
    const g=v.filter(x=>x>thr).sort((a,b)=>a-b); if(g.length<2)return 0;
    const q=p=>{const i=(g.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return g[lo]+(g[hi]-g[lo])*(i-lo);};
    return Math.max(0,q(0.95)-q(0.10));
  }
  _post(){
    let corr,bal,side,tpR;
    if(this.nch>1){
      corr=(this.cLL>0&&this.cRR>0)?this.cLR/Math.sqrt(this.cLL*this.cRR):1;
      const tot=this.msM+this.msS; side=tot>0?this.msS/tot:0;
      bal=(this.cLL+this.cRR)>0?(this.cRR-this.cLL)/(this.cLL+this.cRR):0;
      tpR=this.tpCur[1];
    }else{ corr=1; side=0; bal=0; tpR=this.tpCur[0]; }
    this.port.postMessage({
      id:this.id, channels:this.nch,
      momentary:this._winLoud(4),
      shortTerm:this._winLoud(30),
      integrated:this._integrated(),
      lra:this._lra(),
      tpMax:this.tpMax, tpL:this.tpCur[0], tpR,
      corr, balance:bal, side
    });
    this.cLR=this.cLL=this.cRR=0; this.cN=0; this.msM=0; this.msS=0;
    this.tpCur=[-Infinity,-Infinity];
  }
}
registerProcessor('loudness-processor', LoudnessProcessor);
`;

  async function loadWorklet(ctx, workletUrl){
    if(ctx.__piradexLoudnessLoaded) return;
    let ok=false;
    if(workletUrl){
      try{ await ctx.audioWorklet.addModule(workletUrl); ok=true; }
      catch(e){ ok=false; }
    }
    if(!ok){
      const blob = new Blob([WORKLET_SRC], {type:'application/javascript'});
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
    }
    ctx.__piradexLoudnessLoaded = true;
  }

  async function createPiradexMetering(ctx, opts){
    opts = opts || {};
    await loadWorklet(ctx, opts.workletUrl || null);

    const mk = id => new AudioWorkletNode(ctx, 'loudness-processor', { processorOptions:{ id } });
    const inputNode  = mk('in');
    const outputNode = mk('out');

    const state = { in:null, out:null };
    let target = (opts.target != null) ? opts.target : -14;
    const cbs = [];
    if(typeof opts.onUpdate === 'function') cbs.push(opts.onUpdate);
    function emit(){ for(let i=0;i<cbs.length;i++) cbs[i](state, target); }

    inputNode.port.onmessage  = e => { state.in  = e.data; emit(); };
    outputNode.port.onmessage = e => { state.out = e.data; emit(); };

    return {
      inputNode, outputNode, state,
      get target(){ return target; },
      setTarget(v){ target = v; },
      onUpdate(cb){ if(typeof cb==='function') cbs.push(cb); },
      resetIntegrated(){ inputNode.port.postMessage('resetInt'); outputNode.port.postMessage('resetInt'); },
      resetTruePeak(){ inputNode.port.postMessage('resetTP'); outputNode.port.postMessage('resetTP'); }
    };
  }

  global.createPiradexMetering = createPiradexMetering;
})(typeof window!=='undefined' ? window : globalThis);
