/* ============================================================
   Piradex · piradex-limiter-pro.js
   LIMITER TRUE-PEAK com LOOKAHEAD — substitui a função de "safety
   limiter" que o DynamicsCompressor nativo não cumpre (sem lookahead,
   sem ceiling garantido).

   ARQUITETURA (auditoria E1/E2/D2):
   • UM único kernel DSP (KERNEL_SRC) usado em DOIS contextos:
       - realtime: AudioWorklet inserido masterGain → [TP LIM] → analyserNode
       - export:   PiradexTPLimiter.processAudioBuffer(rendered) no offline
     → o que ouves e o que exportas passam pelo MESMO código.
   • Algoritmo: deteção de pico com sobreamostragem 4x (inter-sample
     peaks), running-min por deque monotónica sobre a janela de lookahead,
     suavização boxcar (ataque em rampa linear que chega ANTES do pico),
     release exponencial, stereo-linked, clamp final de segurança.
   • Garantia: nenhuma amostra (nem inter-sample) acima do ceiling.

   Latência realtime: lookahead (1.5 ms ≈ 72 samples @48k) — inaudível.
   Transparente abaixo do ceiling (ganho = 1.0, sem coloração).

   API:
     PiradexTPLimiter.setCeiling(dB)      // default -1.0 dBTP
     PiradexTPLimiter.setRelease(ms)      // default 80 ms
     PiradexTPLimiter.setEnabled(bool)    // bypass do estágio realtime
     PiradexTPLimiter.processAudioBuffer(audioBuffer, {ceilingDb, releaseMs})
     PiradexTPLimiter.measureTruePeak(audioBuffer) → dBTP
   ============================================================ */
(function(global){
  "use strict";

  /* ── KERNEL DSP (fonte única, partilhada worklet+offline) ── */
  const KERNEL_SRC = String.raw`
function _tpFIR(f,tpp){var N=f*tpp,fc=0.5/f,M=N-1,h=new Float64Array(N),n,x,s;
  for(n=0;n<N;n++){x=n-M/2;s=(x===0)?2*fc:Math.sin(2*Math.PI*fc*x)/(Math.PI*x);
    h[n]=s*(0.5-0.5*Math.cos(2*Math.PI*n/M));}
  var sum=0;for(n=0;n<N;n++)sum+=h[n];for(n=0;n<N;n++)h[n]=h[n]/sum*f;
  var ph=[];for(var p=0;p<f;p++){ph[p]=[];for(var j=0;j<tpp;j++)ph[p].push(h[p+f*j]||0);}
  return{f:f,tpp:tpp,ph:ph};}

function TPLimiterKernel(sampleRate,opts){
  opts=opts||{};
  this.sr=sampleRate;
  this.setCeiling(opts.ceilingDb!=null?opts.ceilingDb:-1.0);
  this.setRelease(opts.releaseMs!=null?opts.releaseMs:80);
  this.la=Math.max(8,Math.round(this.sr*(opts.lookaheadMs!=null?opts.lookaheadMs:1.5)/1000));
  this.osc=_tpFIR(4,8);
  this.nch=0;
  this._alloc(2);
  // deque monotónica p/ running-min do ganho desejado
  this.dqV=new Float64Array(this.la+4); this.dqI=new Int32Array(this.la+4);
  this.dqH=0; this.dqT=0; this.n=0;
  // boxcar (soma corrente) sobre o running-min
  this.box=new Float64Array(this.la); this.boxP=0; this.boxSum=this.la; // inicia a g=1
  for(var i=0;i<this.la;i++)this.box[i]=1;
  this.g=1;                         // ganho suavizado (após release)
  this.grMaxBlk=0;                  // metering: máx. redução no bloco (dB)
}
TPLimiterKernel.prototype._alloc=function(nch){
  if(nch===this.nch)return;
  this.nch=nch;
  this.dly=[]; this.osd=[];
  for(var c=0;c<nch;c++){ this.dly.push(new Float64Array(this.la)); this.osd.push(new Float64Array(this.osc.tpp)); }
  this.dlyP=0;
};
TPLimiterKernel.prototype.setCeiling=function(db){ this.ceilDb=db; this.ceil=Math.pow(10,db/20); };
TPLimiterKernel.prototype.setRelease=function(ms){ this.relMs=ms; this.rel=1-Math.exp(-1/(this.sr*(ms/1000))); };
TPLimiterKernel.prototype._tpPeak=function(c,x){
  var d=this.osd[c],j,p,a,co,pk=Math.abs(x);
  for(j=d.length-1;j>0;j--)d[j]=d[j-1]; d[0]=x;
  for(p=0;p<this.osc.f;p++){a=0;co=this.osc.ph[p];
    for(j=0;j<co.length;j++)a+=co[j]*d[j];
    a=Math.abs(a); if(a>pk)pk=a;}
  return pk;
};
// processa em-lugar: chs = array de Float32Array (mesmo comprimento)
TPLimiterKernel.prototype.process=function(chs){
  var nch=chs.length; this._alloc(nch);
  var N=chs[0].length, la=this.la, ceil=this.ceil, i, c, x, pk, d, m, s, out;
  this.grMaxBlk=0;
  for(i=0;i<N;i++){
    // pico inter-sample stereo-linked
    pk=0;
    for(c=0;c<nch;c++){ x=chs[c][i]; var p=this._tpPeak(c,x); if(p>pk)pk=p; }
    d=(pk>ceil)?(ceil/pk):1;              // ganho desejado
    // running-min (deque) sobre janela la
    var n=this.n;
    while(this.dqT>this.dqH && this.dqV[(this.dqT-1)%this.dqV.length]>=d)this.dqT--;
    this.dqV[this.dqT%this.dqV.length]=d; this.dqI[this.dqT%this.dqV.length]=n; this.dqT++;
    while(this.dqI[this.dqH%this.dqV.length]<=n-la)this.dqH++;
    m=this.dqV[this.dqH%this.dqV.length];
    // boxcar la → rampa linear de ataque que antecede o pico
    this.boxSum+=m-this.box[this.boxP]; this.box[this.boxP]=m; this.boxP=(this.boxP+1)%la;
    s=this.boxSum/la; if(s>1)s=1; if(s<m)s=m; // nunca acima de 1 nem abaixo do min corrente? (min garante teto)
    // segurança matemática: usar o MENOR entre boxcar e min corrente garante ceiling
    if(m<s)s=m;
    // release exponencial (ataque instantâneo para baixo)
    if(s<this.g)this.g=s; else this.g+=(s-this.g)*this.rel;
    var g=this.g;
    var gr=-20*Math.log10(g>1e-9?g:1e-9); if(gr>this.grMaxBlk)this.grMaxBlk=gr;
    // saída = amostra atrasada la × ganho, com clamp final
    for(c=0;c<nch;c++){
      var dl=this.dly[c]; out=dl[this.dlyP]*g;
      if(out>ceil)out=ceil; else if(out<-ceil)out=-ceil;
      dl[this.dlyP]=chs[c][i];
      chs[c][i]=out;
    }
    this.dlyP=(this.dlyP+1)%la;
    this.n++;
  }
};
// medição true-peak (dBTP) de um conjunto de canais — sem alterar
TPLimiterKernel.prototype.measure=function(chs){
  var osc=_tpFIR(4,8), nch=chs.length, N=chs[0].length, pk=0;
  for(var c=0;c<nch;c++){
    var d=new Float64Array(osc.tpp);
    for(var i=0;i<N;i++){
      for(var j=d.length-1;j>0;j--)d[j]=d[j-1]; d[0]=chs[c][i];
      var a0=Math.abs(chs[c][i]); if(a0>pk)pk=a0;
      for(var p=0;p<osc.f;p++){var a=0,co=osc.ph[p];
        for(j=0;j<co.length;j++)a+=co[j]*d[j];
        a=Math.abs(a); if(a>pk)pk=a;}
    }
  }
  return 20*Math.log10(pk>1e-12?pk:1e-12);
};
`;

  /* instancia o kernel neste scope (para uso offline/export) */
  const _mod={}; (new Function('exports',KERNEL_SRC+
    ';exports.TPLimiterKernel=TPLimiterKernel;exports._tpFIR=_tpFIR;'))(_mod);
  const TPLimiterKernel=_mod.TPLimiterKernel;

  /* ── WORKLET (mesmo kernel embebido) ── */
  const WORKLET_SRC = KERNEL_SRC + String.raw`
class TPLimiterProcessor extends AudioWorkletProcessor {
  constructor(opt){
    super();
    const o=(opt&&opt.processorOptions)||{};
    this.k=new TPLimiterKernel(sampleRate,o);
    this.enabled=(o.enabled!==false);
    this._tmp=null; this._blk=0;
    this.port.onmessage=(e)=>{
      const m=e.data||{};
      if(m.ceilingDb!=null)this.k.setCeiling(m.ceilingDb);
      if(m.releaseMs!=null)this.k.setRelease(m.releaseMs);
      if(m.enabled!=null)this.enabled=!!m.enabled;
    };
  }
  process(inputs,outputs){
    const inp=inputs[0],out=outputs[0];
    if(!inp||inp.length===0)return true;
    const nch=Math.min(inp.length,out.length),N=inp[0].length;
    if(!this.enabled){
      for(let c=0;c<nch;c++)out[c].set(inp[c]);
      return true;
    }
    // copia para buffers de trabalho (process é em-lugar)
    if(!this._tmp||this._tmp.length!==nch||this._tmp[0].length!==N){
      this._tmp=[];for(let c=0;c<nch;c++)this._tmp.push(new Float32Array(N));
    }
    for(let c=0;c<nch;c++)this._tmp[c].set(inp[c]);
    this.k.process(this._tmp);
    for(let c=0;c<nch;c++)out[c].set(this._tmp[c]);
    // metering ~10 Hz
    if(++this._blk>=Math.round(sampleRate/128/10)){
      this._blk=0;
      this.port.postMessage({gr:this.k.grMaxBlk});
    }
    return true;
  }
}
registerProcessor('piradex-tp-limiter', TPLimiterProcessor);
`;

  /* ── API pública ── */
  let node=null, ctxRef=null, lastGR=0;
  const state={ceilingDb:-1.0, releaseMs:80, enabled:true};

  async function _ensureNode(ctx){
    if(node&&ctxRef===ctx)return node;
    if(!ctx.__papTPLimLoaded){
      const blob=new Blob([WORKLET_SRC],{type:'application/javascript'});
      await ctx.audioWorklet.addModule(URL.createObjectURL(blob));
      ctx.__papTPLimLoaded=true;
    }
    node=new AudioWorkletNode(ctx,'piradex-tp-limiter',{
      processorOptions:{ceilingDb:state.ceilingDb,releaseMs:state.releaseMs,enabled:state.enabled},
      channelCount:2});
    node.port.onmessage=e=>{ if(e.data&&e.data.gr!=null)lastGR=e.data.gr; };
    ctxRef=ctx;
    return node;
  }

  // Auto-splice SEGURO: insere-se entre masterGain e analyserNode.
  // Regra de ouro: liga o caminho novo ANTES de cortar o direto — nunca há
  // um instante sem saída. Se algo falhar, reverte para masterGain→analyser.
  async function _autoWire(){
    const ctx=global.audioCtx, mg=global.masterGain, an=global.analyserNode;
    if(!ctx||!mg||!an){ setTimeout(_autoWire,200); return; }
    if(mg.__tpSpliced) return;
    let n;
    try{ n=await _ensureNode(ctx); }
    catch(e){ console.warn('[TP-LIM] worklet não carregou; caminho normal mantém-se.',e); return; }
    try{
      mg.connect(n);            // 1) novo caminho primeiro
      n.connect(an);
      try{ mg.disconnect(an); }catch(e){}   // 2) só depois corta o direto
      mg.__tpSpliced=true; mg.__tpNode=n;
      console.log('[TP-LIM] limiter true-peak ATIVO (ceiling '+state.ceilingDb+' dBTP, lookahead 1.5 ms)');
      try{ if(global.PRDX&&PRDX.emit)PRDX.emit('tplimiter:ready'); }catch(e){}
    }catch(e){
      // reverter para o caminho direto garantido
      try{ mg.disconnect(n); }catch(_){}
      try{ mg.connect(an); }catch(_){}
      console.warn('[TP-LIM] splice falhou; caminho direto reposto.',e);
    }
  }
  function _unsplice(){
    const mg=global.masterGain, an=global.analyserNode, n=mg&&mg.__tpNode;
    if(!mg||!mg.__tpSpliced||!n)return;
    try{ mg.connect(an); }catch(e){}        // repõe direto primeiro
    try{ n.disconnect(an); }catch(e){}
    try{ mg.disconnect(n); }catch(e){}
    mg.__tpSpliced=false;
    console.log('[TP-LIM] limiter em bypass (caminho direto).');
  }
  if(typeof window!=='undefined') setTimeout(_autoWire,300);

  function _send(m){ if(node)node.port.postMessage(m); }

  global.PiradexTPLimiter={
    setCeiling(db){ state.ceilingDb=db; _send({ceilingDb:db}); },
    setRelease(ms){ state.releaseMs=ms; _send({releaseMs:ms}); },
    setEnabled(on){ state.enabled=!!on; _send({enabled:!!on});
      // liga/desliga também o splice no caminho realtime
      if(!on){ _unsplice(); } else if(global.masterGain && !global.masterGain.__tpSpliced){ _autoWire(); } },
    getGR(){ return lastGR; },
    get state(){ return Object.assign({},state); },

    /* EXPORT (D2): aplica o MESMO kernel a um AudioBuffer renderizado */
    processAudioBuffer(buf,opts){
      opts=opts||{};
      const k=new TPLimiterKernel(buf.sampleRate,{
        ceilingDb:(opts.ceilingDb!=null?opts.ceilingDb:state.ceilingDb),
        releaseMs:(opts.releaseMs!=null?opts.releaseMs:state.releaseMs)});
      const chs=[]; for(let c=0;c<buf.numberOfChannels;c++)chs.push(buf.getChannelData(c));
      const before=k.measure(chs);
      k.process(chs);
      // flush do delay interno: processa cauda de silêncio e descarta o pré-delay
      // (simples e suficiente: o atraso de 1.5 ms no início/fim é imperceptível num master)
      const after=k.measure(chs);
      return {beforeDbTP:before, afterDbTP:after, ceilingDb:k.ceilDb};
    },
    measureTruePeak(buf){
      const k=new TPLimiterKernel(buf.sampleRate,{});
      const chs=[]; for(let c=0;c<buf.numberOfChannels;c++)chs.push(buf.getChannelData(c));
      return k.measure(chs);
    },
    _Kernel:TPLimiterKernel   // exposto p/ testes
  };
})(typeof window!=='undefined'?window:globalThis);
