/* ============================================================
   Piradex · piradex-analise-pro.js   (integrado na Mastering Suite)
   Medidor In/Out estilo Clarity M (radar BS.1770 + RTA 1/3-oitava) para
   a página ANÁLISE do PRO FINAL.

   Não-destrutivo: taps EM PARALELO ao masterGain (+ tap de entrada
   alimentado pela fonte). Os nós de áudio são criados UMA vez (singleton);
   o painel é redesenhado a cada abertura da página, sem leaks.

   Usa globais da suite: window.audioCtx, window.masterGain, window.__papInputTap
   Chamada (no pageAnalise):  PiradexAnalisePro.show(body)
   ============================================================ */
(function(global){
  "use strict";

  const WORKLET_SRC = String.raw`
class LoudnessProcessor extends AudioWorkletProcessor {
  constructor(opt){super();this.fs=sampleRate;this.id=(opt&&opt.processorOptions&&opt.processorOptions.id)||'m';
    this.shelf=this._shelf(this.fs);this.hp=this._hp(this.fs);this.st=[];this.blkN=Math.round(0.1*this.fs);
    this.acc=0;this.sumSq=[0,0];this.sub=[];this.gate=[];this.stHist=[];this.stClock=0;
    this.osc=this._os(4,8);this.osDelay=[];this.tpMax=-Infinity;this.tpCur=[-Infinity,-Infinity];
    this.cLR=0;this.cLL=0;this.cRR=0;this.cN=0;this.msM=0;this.msS=0;this.nch=2;
    this.port.onmessage=(e)=>{if(e.data==='resetInt'){this.gate=[];this.stHist=[];}if(e.data==='resetTP'){this.tpMax=-Infinity;}};}
  _shelf(fs){const G=3.999843853973347,Q=0.7071752369554196,fc=1681.974450955533,K=Math.tan(Math.PI*fc/fs),
    Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,0.4996667741545416),a0=1+K/Q+K*K;
    return{b0:(Vh+Vb*K/Q+K*K)/a0,b1:2*(K*K-Vh)/a0,b2:(Vh-Vb*K/Q+K*K)/a0,a1:2*(K*K-1)/a0,a2:(1-K/Q+K*K)/a0};}
  _hp(fs){const Q=0.5003270373238773,fc=38.13547087602444,K=Math.tan(Math.PI*fc/fs),a0=1+K/Q+K*K;
    return{b0:1,b1:-2,b2:1,a1:2*(K*K-1)/a0,a2:(1-K/Q+K*K)/a0};}
  _biq(c,s,x){const y=c.b0*x+c.b1*s.x1+c.b2*s.x2-c.a1*s.y1-c.a2*s.y2;s.x2=s.x1;s.x1=x;s.y2=s.y1;s.y1=y;return y;}
  _os(f,tpp){const N=f*tpp,fc=0.5/f,M=N-1,h=new Float32Array(N);
    for(let n=0;n<N;n++){const x=n-M/2;let s=(x===0)?2*fc:Math.sin(2*Math.PI*fc*x)/(Math.PI*x);h[n]=s*(0.5-0.5*Math.cos(2*Math.PI*n/M));}
    let sm=0;for(let n=0;n<N;n++)sm+=h[n];for(let n=0;n<N;n++)h[n]=h[n]/sm*f;
    const ph=[];for(let p=0;p<f;p++){ph[p]=[];for(let j=0;j<tpp;j++)ph[p].push(h[p+f*j]||0);}return{f,tpp,ph};}
  _L(zs){return -0.691+10*Math.log10(zs>0?zs:1e-12);}
  process(inps,outs){const inp=inps[0],out=outs[0];if(!inp||inp.length===0)return true;
    const ch=Math.min(inp.length,2);this.nch=ch;const n=inp[0].length;
    for(let c=0;c<out.length;c++){const o=out[c],i=inp[Math.min(c,inp.length-1)];if(i)for(let k=0;k<n;k++)o[k]=i[k];}
    while(this.st.length<2){this.st.push({sh:{x1:0,x2:0,y1:0,y2:0},hp:{x1:0,x2:0,y1:0,y2:0}});this.osDelay.push(new Float32Array(this.osc.tpp));}
    const L=inp[0],R=ch>1?inp[1]:null;
    for(let k=0;k<n;k++){const sL=L[k],sR=R?R[k]:0;
      let kL=this._biq(this.shelf,this.st[0].sh,sL);kL=this._biq(this.hp,this.st[0].hp,kL);this.sumSq[0]+=kL*kL;
      if(R){let kR=this._biq(this.shelf,this.st[1].sh,sR);kR=this._biq(this.hp,this.st[1].hp,kR);this.sumSq[1]+=kR*kR;}
      this.acc++;this._tp(0,sL);if(R)this._tp(1,sR);
      if(R){this.cLR+=sL*sR;this.cLL+=sL*sL;this.cRR+=sR*sR;this.cN++;const m=(sL+sR)*0.5,s=(sL-sR)*0.5;this.msM+=m*m;this.msS+=s*s;}
      if(this.acc>=this.blkN)this._close();}
    return true;}
  _tp(c,x){const d=this.osDelay[c];for(let j=d.length-1;j>0;j--)d[j]=d[j-1];d[0]=x;let pk=0;
    for(let p=0;p<this.osc.f;p++){let a=0;const co=this.osc.ph[p];for(let j=0;j<co.length;j++)a+=co[j]*d[j];const ab=Math.abs(a);if(ab>pk)pk=ab;}
    const db=20*Math.log10(pk>1e-9?pk:1e-9);if(db>this.tpCur[c])this.tpCur[c]=db;if(db>this.tpMax)this.tpMax=db;}
  _close(){this.sub.push({s:[this.sumSq[0],this.sumSq[1]],n:this.acc});if(this.sub.length>40)this.sub.shift();this.sumSq=[0,0];this.acc=0;
    if(this.sub.length>=4){let sL=0,sR=0,nn=0;for(let i=this.sub.length-4;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}
      const zs=(sL+sR)/nn,l=this._L(zs);this.gate.push({zs,l});if(this.gate.length>36000)this.gate.shift();}
    this.stClock++;if(this.stClock>=3&&this.sub.length>=30){this.stClock=0;let sL=0,sR=0,nn=0;
      for(let i=this.sub.length-30;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}
      this.stHist.push(this._L((sL+sR)/nn));if(this.stHist.length>4000)this.stHist.shift();}
    this._post();}
  _win(cnt){if(this.sub.length<cnt)cnt=this.sub.length;if(cnt===0)return -Infinity;let sL=0,sR=0,nn=0;
    for(let i=this.sub.length-cnt;i<this.sub.length;i++){sL+=this.sub[i].s[0];sR+=this.sub[i].s[1];nn+=this.sub[i].n;}return this._L((sL+sR)/nn);}
  _int(){if(!this.gate.length)return -Infinity;const abs=this.gate.filter(b=>b.l>-70);if(!abs.length)return -Infinity;
    let m=0;for(const b of abs)m+=b.zs;m/=abs.length;const g=this._L(m)-10;const rel=abs.filter(b=>b.l>g);if(!rel.length)return -Infinity;
    let m2=0;for(const b of rel)m2+=b.zs;m2/=rel.length;return this._L(m2);}
  _lra(){const v=this.stHist.filter(x=>x>-70);if(v.length<6)return 0;let m=0;for(const x of v)m+=Math.pow(10,(x+0.691)/10);m/=v.length;
    const thr=(-0.691+10*Math.log10(m))-20;const g=v.filter(x=>x>thr).sort((a,b)=>a-b);if(g.length<2)return 0;
    const q=p=>{const i=(g.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return g[lo]+(g[hi]-g[lo])*(i-lo);};return Math.max(0,q(0.95)-q(0.10));}
  _post(){let corr,bal,side,tpR;if(this.nch>1){corr=(this.cLL>0&&this.cRR>0)?this.cLR/Math.sqrt(this.cLL*this.cRR):1;
      const tot=this.msM+this.msS;side=tot>0?this.msS/tot:0;bal=(this.cLL+this.cRR)>0?(this.cRR-this.cLL)/(this.cLL+this.cRR):0;tpR=this.tpCur[1];}
    else{corr=1;side=0;bal=0;tpR=this.tpCur[0];}
    this.port.postMessage({id:this.id,channels:this.nch,momentary:this._win(4),shortTerm:this._win(30),integrated:this._int(),
      lra:this._lra(),tpMax:this.tpMax,tpL:this.tpCur[0],tpR,corr,balance:bal,side});
    this.cLR=this.cLL=this.cRR=0;this.cN=0;this.msM=0;this.msS=0;this.tpCur=[-Infinity,-Infinity];}
}
registerProcessor('piradex-loudness', LoudnessProcessor);
`;

  const ISO=[25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,
             1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500,16000,20000];
  const CSS = `
  .pap-wrap{font-family:'DM Mono',ui-monospace,Menlo,Consolas,monospace;color:#cdd6df;margin-top:14px}
  .pap-h{font-family:'Orbitron','DM Mono',monospace;font-weight:800;font-size:12px;letter-spacing:1.5px;color:#f4c430;margin:0 0 8px}
  .pap-top{display:flex;gap:12px;flex-wrap:wrap}
  .pap-card2{background:#0d1116;border:1px solid #1d2731;border-radius:10px;padding:10px}
  .pap-radar{flex:0 0 246px}.pap-radar canvas{width:246px;height:246px;display:block}
  .pap-read{flex:1;min-width:250px;display:flex;gap:10px}
  .pap-col{display:flex;flex-direction:column;gap:8px;flex:1}
  .pap-ro{background:#10161d;border:1px solid #1d2731;border-radius:8px;padding:7px 9px}
  .pap-k{font-size:9px;letter-spacing:1.3px;color:#6b7884;text-transform:uppercase}
  .pap-v{color:#f4c430;margin-top:2px;line-height:1;font-variant-numeric:tabular-nums}
  .pap-v.big{font-size:26px}.pap-v.mid{font-size:16px}.pap-v small{font-size:10px;color:#caa42b;margin-left:3px}
  .pap-v.warn{color:#e23b3b}
  .pap-bars{display:flex;gap:7px;align-items:flex-end}
  .pap-bt{position:relative;width:14px;height:150px;background:#0a0e12;border:1px solid #1d2731;border-radius:3px;overflow:hidden}
  .pap-bf{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,#e23b3b,#f08a24 14%,#f4c430 30%,#36c46a 58%,#1fa98a)}
  .pap-bc{position:absolute;left:0;right:0;height:2px;background:#fff;opacity:.85;bottom:0}
  .pap-bl{font-size:9px;color:#6b7884;text-align:center}
  .pap-delta{margin-top:10px}
  .pap-delta .r{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #13202b;font-size:12px}
  .pap-delta .r:last-child{border-bottom:0}.pap-delta .l{color:#6b7884;font-size:10px;letter-spacing:.5px}
  .pap-pos{color:#36c46a}.pap-neg{color:#f08a24}
  .pap-rta{margin-top:10px}
  .pap-rta .hd{display:flex;justify-content:space-between;font-size:10px;color:#6b7884;margin-bottom:5px}
  .pap-rta canvas{width:100%;height:190px;display:block}
  `;
  const TEMPLATE = `
    <div class="pap-h">MEDIDOR IN ⇄ OUT · RADAR DE LOUDNESS (BS.1770) — TEMPO REAL</div>
    <div class="pap-top">
      <div class="pap-card2 pap-radar"><canvas data-r="radar" width="492" height="492"></canvas></div>
      <div class="pap-card2 pap-read">
        <div class="pap-col">
          <div class="pap-ro"><div class="pap-k">Momentary (saída)</div><div class="pap-v big" data-r="mo">−∞ <small>LUFS</small></div></div>
          <div class="pap-ro"><div class="pap-k">True-peak Max</div><div class="pap-v mid" data-r="tp">−∞ <small>dBTP</small></div></div>
          <div class="pap-ro"><div class="pap-k">Short-term · Integrated</div><div class="pap-v mid" data-r="st">−∞ <small>/ −∞ LUFS</small></div></div>
          <div class="pap-ro"><div class="pap-k">Loudness Range</div><div class="pap-v mid" data-r="lra">0.0 <small>LU</small></div></div>
          <div class="pap-ro"><div class="pap-k">Balance-o-Meter</div><canvas data-r="bal" width="220" height="150" style="width:110px;height:75px"></canvas></div>
        </div>
        <div class="pap-bars">
          <div><div class="pap-bt"><div class="pap-bf" data-r="bL"></div><div class="pap-bc" data-r="cL"></div></div><div class="pap-bl">L</div></div>
          <div><div class="pap-bt"><div class="pap-bf" data-r="bR"></div><div class="pap-bc" data-r="cR"></div></div><div class="pap-bl">R</div></div>
        </div>
      </div>
    </div>
    <div class="pap-card2 pap-delta">
      <div class="r"><span class="l">Integrated entrada</span><span data-r="inI">−∞</span></div>
      <div class="r"><span class="l">Integrated saída</span><span data-r="outI">−∞</span></div>
      <div class="r"><span class="l">Δ Loudness (out − in)</span><span data-r="dL">0.0 LU</span></div>
      <div class="r"><span class="l">True-peak in → out</span><span data-r="tpio">−∞ → −∞</span></div>
      <div class="r"><span class="l">Δ LRA (out − in)</span><span data-r="dLra">0.0 LU</span></div>
    </div>
    <div class="pap-card2 pap-rta">
      <div class="hd"><span>RTA · 1/3 OITAVA</span><span><span style="color:#36c46a">▮</span> saída &nbsp; <span style="color:#f4c430">—</span> entrada &nbsp; <span style="color:#e23b3b">▮</span> peak</span></div>
      <canvas data-r="rta" width="1120" height="190"></canvas>
    </div>`;

  let CORE=null, RAF=null, TARGET=-14, HIST=[], STARTT=performance.now();
  const PEAKS=new Float32Array(ISO.length).fill(-90);
  const PER=30000, luMin=-24, luMax=9, half=Math.pow(2,1/6);

  function ensureWorklet(ctx){ if(ctx.__papLoaded) return Promise.resolve();
    const b=new Blob([WORKLET_SRC],{type:'application/javascript'});
    return ctx.audioWorklet.addModule(URL.createObjectURL(b)).then(()=>{ctx.__papLoaded=true;}); }
  function injectCSS(){ if(document.getElementById('pap-style'))return;
    const s=document.createElement('style');s.id='pap-style';s.textContent=CSS;document.head.appendChild(s); }
  function fmt(v,d=1){return (v==null||!isFinite(v))?'−∞':(v>=0?'+':'')+v.toFixed(d);}
  function plain(v,d=1){return (v==null||!isFinite(v))?'−∞':v.toFixed(d);}

  async function ensureCore(ctx,out,inp){
    if(CORE) return CORE;
    await ensureWorklet(ctx);
    const sink=ctx.createGain(); sink.gain.value=0; sink.connect(ctx.destination);
    const outMeter=new AudioWorkletNode(ctx,'piradex-loudness',{processorOptions:{id:'out'}});
    out.connect(outMeter); outMeter.connect(sink);
    let inMeter=null;
    if(inp){ inMeter=new AudioWorkletNode(ctx,'piradex-loudness',{processorOptions:{id:'in'}});
      inp.connect(inMeter); inMeter.connect(sink); }
    const stt={in:null,out:null};
    outMeter.port.onmessage=e=>stt.out=e.data; if(inMeter)inMeter.port.onmessage=e=>stt.in=e.data;
    const mkA=()=>{const a=ctx.createAnalyser();a.fftSize=8192;a.smoothingTimeConstant=0.75;a.minDecibels=-120;a.maxDecibels=0;return a;};
    const outA=mkA(); out.connect(outA); const outBuf=new Float32Array(outA.frequencyBinCount);
    let inA=null,inBuf=null; if(inp){inA=mkA();inp.connect(inA);inBuf=new Float32Array(inA.frequencyBinCount);}
    CORE={ctx,sink,outMeter,inMeter,stt,outA,inA,outBuf,inBuf,hasIn:!!inp};
    return CORE;
  }

  function startLoop(core, wrap){
    const Q=s=>wrap.querySelector('[data-r="'+s+'"]');
    const rcv=Q('radar'),rx=rcv.getContext('2d');
    const bcv=Q('bal'),bx=bcv.getContext('2d');
    const tcv=Q('rta'),tx=tcv.getContext('2d');
    const bands=ISO;
    function zone(rel){if(rel<-9)return'#2f6fd6';if(rel<-4)return'#1fa98a';if(rel<-1)return'#36c46a';if(rel<1.5)return'#f4c430';if(rel<4)return'#f08a24';return'#e23b3b';}
    function rFor(lu,R){const i=0.16*R;lu=Math.max(luMin,Math.min(luMax,lu));return i+(lu-luMin)/(luMax-luMin)*(R-i);}
    function drawRadar(){const W=rcv.width,H=rcv.height,cx=W/2,cy=H/2,R=Math.min(W,H)/2-10;rx.clearRect(0,0,W,H);
      rx.fillStyle='#06080b';rx.beginPath();rx.arc(cx,cy,R,0,7);rx.fill();rx.font='9px DM Mono,monospace';rx.textAlign='center';
      for(const lu of[-24,-18,-12,-6,0,6]){const r=rFor(lu,R);rx.beginPath();rx.arc(cx,cy,r,0,7);
        rx.strokeStyle=lu===0?'rgba(244,196,48,.55)':'rgba(40,60,75,.6)';rx.lineWidth=lu===0?1.5:1;rx.stroke();
        rx.fillStyle=lu===0?'rgba(244,196,48,.85)':'rgba(120,140,155,.7)';rx.fillText((lu>0?'+':'')+lu,cx,cy-r+10);}
      const now=performance.now(),w=2*Math.PI/300*0.95;
      for(const h of HIST){const age=(now-h.t)/PER;if(age>1)continue;const ang=h.ang-Math.PI/2,r=rFor(h.lu,R);
        rx.beginPath();rx.moveTo(cx,cy);rx.arc(cx,cy,r,ang-w/2,ang+w/2);rx.closePath();rx.fillStyle=zone(h.lu);rx.globalAlpha=Math.max(0.12,1-age*0.85);rx.fill();}
      rx.globalAlpha=1;const ca=((now-STARTT)%PER)/PER*2*Math.PI-Math.PI/2;rx.beginPath();rx.moveTo(cx,cy);
      rx.lineTo(cx+Math.cos(ca)*R,cy+Math.sin(ca)*R);rx.strokeStyle='rgba(255,255,255,.35)';rx.lineWidth=1.5;rx.stroke();
      rx.fillStyle='#06080b';rx.beginPath();rx.arc(cx,cy,0.16*R,0,7);rx.fill();}
    function drawBal(corr,bal,side){const W=bcv.width,H=bcv.height;bx.clearRect(0,0,W,H);const cx=W/2,top=12,bot=H-14,hw=W/2-16;
      bx.strokeStyle='rgba(244,196,48,.7)';bx.lineWidth=1.5;bx.beginPath();bx.moveTo(cx,top);bx.lineTo(cx-hw,bot);bx.lineTo(cx+hw,bot);bx.closePath();bx.stroke();
      const x=cx+(bal||0)*hw*0.9,y=bot-(side||0)*(bot-top)*1.6,yc=Math.max(top,Math.min(bot,y));
      bx.beginPath();bx.arc(x,yc,4,0,7);bx.fillStyle=(corr<0)?'#e23b3b':'#f4c430';bx.fill();}
    function setBar(f,c,db){const lo=-30,hi=3,p=Math.max(0,Math.min(1,(db-lo)/(hi-lo)));f.style.height=(p*100)+'%';c.style.bottom=(p*100)+'%';}
    function specCol(f){if(f<80)return'#2f6fd6';if(f<250)return'#1fa98a';if(f<2000)return'#36c46a';if(f<6300)return'#9ccf3a';return'#f4c430';}
    function bandLv(an,buf){an.getFloatFrequencyData(buf);const bh=core.ctx.sampleRate/an.fftSize,nb=buf.length,o=new Float32Array(bands.length);
      for(let i=0;i<bands.length;i++){const fc=bands[i],lo=fc/half,hi=fc*half;let b0=Math.max(1,Math.floor(lo/bh)),b1=Math.min(nb-1,Math.ceil(hi/bh)),pw=0,cnt=0;
        if(b1<b0){const bi=Math.max(1,Math.min(nb-1,Math.round(fc/bh)));pw=Math.pow(10,buf[bi]/10);cnt=1;}else{for(let b=b0;b<=b1;b++){pw+=Math.pow(10,buf[b]/10);cnt++;}}
        o[i]=cnt?10*Math.log10(pw):-90;if(!isFinite(o[i]))o[i]=-90;}return o;}
    function drawRTA(){const W=tcv.width,H=tcv.height;tx.clearRect(0,0,W,H);const pL=22,pR=6,pT=6,pB=14,pw=W-pL-pR,ph=H-pT-pB,N=bands.length;
      const yF=db=>pT+(1-Math.max(0,Math.min(1,(db+90)/90)))*ph;
      tx.font='9px DM Mono,monospace';tx.textAlign='right';
      for(let db=0;db>=-90;db-=12){const y=yF(db);tx.strokeStyle='rgba(30,45,58,.5)';tx.beginPath();tx.moveTo(pL,y);tx.lineTo(W-pR,y);tx.stroke();tx.fillStyle='rgba(120,140,155,.55)';tx.fillText(db,pL-3,y+3);}
      const bw=pw/N,oL=bandLv(core.outA,core.outBuf),iL=core.inA?bandLv(core.inA,core.inBuf):null;
      for(let i=0;i<N;i++){const v=oL[i];PEAKS[i]=(v>PEAKS[i])?v:Math.max(v,PEAKS[i]-0.5);const y=yF(v),x=pL+i*bw;
        tx.fillStyle=specCol(bands[i]);tx.fillRect(x+1,y,Math.max(1,bw-2),pT+ph-y);const py=yF(PEAKS[i]);tx.fillStyle='#e23b3b';tx.fillRect(x+1,py-1,Math.max(1,bw-2),2);}
      if(iL){tx.beginPath();for(let i=0;i<N;i++){const x=pL+i*bw+bw/2,y=yF(iL[i]);if(i===0)tx.moveTo(x,y);else tx.lineTo(x,y);}tx.strokeStyle='rgba(244,196,48,.9)';tx.lineWidth=1.5;tx.stroke();}
      tx.fillStyle='rgba(120,140,155,.7)';tx.textAlign='center';const mk={31.5:'31',63:'63',125:'125',250:'250',500:'500',1000:'1k',2000:'2k',4000:'4k',8000:'8k',16000:'16k'};
      for(let i=0;i<N;i++){if(mk[bands[i]]){tx.fillText(mk[bands[i]],pL+i*bw+bw/2,H-3);}}}

    function loop(){
      if(!wrap.isConnected){ RAF=null; return; } // página fechada → pára
      const o=core.stt.out,i=core.stt.in;
      if(o){Q('mo').innerHTML=plain(o.momentary)+' <small>LUFS</small>';
        const t=Q('tp');t.innerHTML=fmt(o.tpMax)+' <small>dBTP</small>';t.classList.toggle('warn',o.tpMax>-1);
        Q('st').innerHTML=plain(o.shortTerm)+' <small>/ '+plain(o.integrated)+' LUFS</small>';
        Q('lra').innerHTML=plain(o.lra)+' <small>LU</small>';
        Q('outI').textContent=plain(o.integrated)+' LUFS';
        Q('tpio').textContent=(i?fmt(i.tpMax):'−∞')+' → '+fmt(o.tpMax)+' dBTP';
        setBar(Q('bL'),Q('cL'),isFinite(o.tpL)?o.tpL:-60);setBar(Q('bR'),Q('cR'),isFinite(o.tpR)?o.tpR:-60);
        drawBal(o.corr,o.balance,o.side);
        const now=performance.now();if(now-(loop._ls||0)>90&&isFinite(o.shortTerm)){loop._ls=now;HIST.push({ang:((now-STARTT)%PER)/PER*2*Math.PI,lu:o.shortTerm-TARGET,t:now});if(HIST.length>320)HIST.shift();}}
      if(i)Q('inI').textContent=plain(i.integrated)+' LUFS';
      if(i&&o){const dL=(isFinite(o.integrated)&&isFinite(i.integrated))?o.integrated-i.integrated:NaN;
        const e=Q('dL');e.textContent=(isFinite(dL)?fmt(dL):'0.0')+' LU';e.className=(dL>0.05?'pap-pos':dL<-0.05?'pap-neg':'');
        const dLra=(isFinite(o.lra)&&isFinite(i.lra))?o.lra-i.lra:NaN;const e2=Q('dLra');e2.textContent=(isFinite(dLra)?fmt(dLra):'0.0')+' LU';e2.className=(dLra<-0.1?'pap-pos':dLra>0.1?'pap-neg':'');}
      drawRadar();drawRTA();RAF=requestAnimationFrame(loop);}
    if(RAF)cancelAnimationFrame(RAF);
    drawRadar();drawBal(1,0,0);drawRTA();RAF=requestAnimationFrame(loop);
  }

  async function show(container, opts){
    opts=opts||{};
    const ctx = opts.audioContext || global.audioCtx;
    const out = opts.outputNode   || global.masterGain;
    const inp = (opts.inputNode!==undefined ? opts.inputNode : global.__papInputTap) || null;
    if(opts.target!=null) TARGET=opts.target;
    if(!ctx || !out){ console.warn('[pap] sem audioCtx/masterGain ainda'); return null; }
    const core = await ensureCore(ctx, out, inp);
    if(!container) return core;
    if(container.querySelector('.pap-wrap')) return core; // já desenhado nesta página
    injectCSS();
    const wrap=document.createElement('div'); wrap.className='pap-wrap'; wrap.innerHTML=TEMPLATE;
    container.appendChild(wrap);
    startLoop(core, wrap);
    return core;
  }

  global.PiradexAnalisePro = {
    show, mount: show,
    setTarget(v){ TARGET=v; HIST.length=0; },
    reset(){ HIST.length=0; PEAKS.fill(-90);
      if(CORE){CORE.outMeter.port.postMessage('resetInt');CORE.outMeter.port.postMessage('resetTP');
        if(CORE.inMeter){CORE.inMeter.port.postMessage('resetInt');CORE.inMeter.port.postMessage('resetTP');}} }
  };
})(typeof window!=='undefined'?window:globalThis);
