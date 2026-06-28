/* ============================================================
   Piradex · piradex-rta.js
   Analisador de espectro RTA 1/3-oitava (ISO 266), entrada vs saída.
   Barras = SAÍDA · linha âmbar = ENTRADA · marcas vermelhas = peak-hold.

   Usa AnalyserNode em ramos paralelos (não altera o áudio):
     const rta = PiradexRTA({ audioContext: ctx, canvas: cv });
     rta.tapOutput(meters.outputNode);   // barras
     rta.tapInput(meters.inputNode);     // linha (opcional)
     rta.start();   // rta.stop()

   Validação rápida: ruído ROSA → RTA ~plano; ruído BRANCO → sobe ~3 dB/oitava.
   ============================================================ */
(function(global){
  "use strict";
  const ISO=[25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,
             1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500,16000,20000];

  function PiradexRTA(o){
    const ctx=o.audioContext, canvas=o.canvas, g=canvas.getContext('2d');
    const fftSize=o.fftSize||8192;
    const minF=o.minFreq||25, maxF=o.maxFreq||20000;
    const floorDb=o.floorDb||-90, topDb=o.topDb||0;
    const smoothing=(o.smoothing!=null)?o.smoothing:0.75;
    const bands=ISO.filter(f=>f>=minF-0.5 && f<=maxF+0.5);
    const N=bands.length, half=Math.pow(2,1/6);
    const peak=new Float32Array(N).fill(floorDb);
    let outA=null,inA=null,outBuf=null,inBuf=null,raf=null;

    function mkAnalyser(){const a=ctx.createAnalyser();a.fftSize=fftSize;
      a.smoothingTimeConstant=smoothing;a.minDecibels=-120;a.maxDecibels=0;return a;}

    function bandLevels(analyser,buf){
      analyser.getFloatFrequencyData(buf);
      const binHz=ctx.sampleRate/analyser.fftSize, nb=buf.length, out=new Float32Array(N);
      for(let i=0;i<N;i++){
        const fc=bands[i], lo=fc/half, hi=fc*half;
        let b0=Math.floor(lo/binHz), b1=Math.ceil(hi/binHz);
        b0=Math.max(1,b0); b1=Math.min(nb-1,b1);
        let pw=0,cnt=0;
        if(b1<b0){ const bi=Math.max(1,Math.min(nb-1,Math.round(fc/binHz)));
          pw=Math.pow(10,buf[bi]/10); cnt=1; }
        else { for(let b=b0;b<=b1;b++){ pw+=Math.pow(10,buf[b]/10); cnt++; } }
        out[i]=cnt?10*Math.log10(pw):floorDb;
        if(!isFinite(out[i]))out[i]=floorDb;
      }
      return out;
    }
    function specColor(f){
      if(f<80)return '#2f6fd6'; if(f<250)return '#1fa98a';
      if(f<2000)return '#36c46a'; if(f<6300)return '#9ccf3a'; return '#f4c430';
    }
    function yFor(db,padT,plotH){return padT+(1-Math.max(0,Math.min(1,(db-floorDb)/(topDb-floorDb))))*plotH;}

    function draw(){
      const W=canvas.width,H=canvas.height;
      g.clearRect(0,0,W,H);
      const padL=22,padR=6,padT=8,padB=16, plotW=W-padL-padR, plotH=H-padT-padB;
      g.font='9px DM Mono, ui-monospace, monospace';
      g.textAlign='right';
      for(let db=topDb; db>=floorDb; db-=12){
        const y=yFor(db,padT,plotH);
        g.strokeStyle='rgba(30,45,58,.5)'; g.beginPath(); g.moveTo(padL,y); g.lineTo(W-padR,y); g.stroke();
        g.fillStyle='rgba(120,140,155,.55)'; g.fillText(db, padL-3, y+3);
      }
      const bw=plotW/N;
      const outL=outA?bandLevels(outA,outBuf):null;
      const inL =inA ?bandLevels(inA ,inBuf ):null;
      if(outL){
        for(let i=0;i<N;i++){
          const v=outL[i];
          peak[i]=(v>peak[i])?v:Math.max(v,peak[i]-0.5);
          const y=yFor(v,padT,plotH), x=padL+i*bw;
          g.fillStyle=specColor(bands[i]);
          g.fillRect(x+1,y,Math.max(1,bw-2),padT+plotH-y);
          const py=yFor(peak[i],padT,plotH);
          g.fillStyle='#e23b3b'; g.fillRect(x+1,py-1,Math.max(1,bw-2),2);
        }
      }
      if(inL){
        g.beginPath();
        for(let i=0;i<N;i++){ const x=padL+i*bw+bw/2, y=yFor(inL[i],padT,plotH);
          if(i===0)g.moveTo(x,y); else g.lineTo(x,y); }
        g.strokeStyle='rgba(244,196,48,.9)'; g.lineWidth=1.5; g.stroke();
      }
      g.fillStyle='rgba(120,140,155,.7)'; g.textAlign='center';
      const marks={31.5:'31',63:'63',125:'125',250:'250',500:'500',1000:'1k',
                   2000:'2k',4000:'4k',8000:'8k',16000:'16k'};
      for(let i=0;i<N;i++){ if(marks[bands[i]]){ const x=padL+i*bw+bw/2;
        g.fillText(marks[bands[i]], x, H-4); } }
      raf=requestAnimationFrame(draw);
    }

    return {
      tapOutput(node){ if(!outA){outA=mkAnalyser();outBuf=new Float32Array(outA.frequencyBinCount);} node.connect(outA); return this; },
      tapInput(node){ if(!inA){inA=mkAnalyser();inBuf=new Float32Array(inA.frequencyBinCount);} node.connect(inA); return this; },
      start(){ if(!raf)raf=requestAnimationFrame(draw); },
      stop(){ if(raf){cancelAnimationFrame(raf);raf=null;} },
      resetPeaks(){ peak.fill(floorDb); },
      analyserOut(){return outA;}, analyserIn(){return inA;}
    };
  }
  global.PiradexRTA=PiradexRTA;
})(typeof window!=='undefined'?window:globalThis);
