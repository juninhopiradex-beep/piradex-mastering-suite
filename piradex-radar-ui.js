/* ============================================================
   Piradex · piradex-radar-ui.js
   Renderiza o radar de loudness (saída), a Balance-o-Meter e as
   barras de true-peak L/R a partir de uma instância de metering.

   USO:
     const ui = PiradexRadarUI({
        metering,                      // de createPiradexMetering
        radar:   document.getElementById('radar'),    // <canvas>
        balance: document.getElementById('balance'),  // <canvas> (opcional)
        bars: { L:elBarL, R:elBarR, capL:elCapL, capR:elCapR }, // divs (opcional)
        period: 30000,                 // 1 volta do radar (ms)
        onText: (out, inp, delta) => { ... }  // p/ atualizar texto no teu DOM
     });
     ui.start();   // ui.stop(); ui.resetRadar();
   ============================================================ */
(function(global){
  "use strict";

  function PiradexRadarUI(o){
    const metering = o.metering;
    const rc = o.radar, rx = rc ? rc.getContext('2d') : null;
    const bc = o.balance, bx = bc ? bc.getContext('2d') : null;
    const bars = o.bars || null;
    const onText = o.onText || function(){};
    const PERIOD = o.period || 30000;
    const luMin = -24, luMax = 9;

    let hist = [];           // {ang, lu, t}
    let startT = performance.now();
    let lastSample = 0;
    let raf = null;

    function zoneColor(rel){ // rel = short-term - target (0 = no alvo)
      if(rel<-9)  return '#2f6fd6';
      if(rel<-4)  return '#1fa98a';
      if(rel<-1)  return '#36c46a';
      if(rel<1.5) return '#f4c430';
      if(rel<4)   return '#f08a24';
      return '#e23b3b';
    }
    function rForLu(lu,R){const i=0.16*R; lu=Math.max(luMin,Math.min(luMax,lu));
      return i+(lu-luMin)/(luMax-luMin)*(R-i);}

    function drawRadar(){
      if(!rx) return;
      const W=rc.width,H=rc.height,cx=W/2,cy=H/2,R=Math.min(W,H)/2-12;
      rx.clearRect(0,0,W,H);
      rx.fillStyle='#06080b'; rx.beginPath(); rx.arc(cx,cy,R,0,7); rx.fill();
      rx.font='10px DM Mono, ui-monospace, monospace'; rx.textAlign='center';
      const rings=[-24,-18,-12,-6,0,6];
      for(const lu of rings){
        const r=rForLu(lu,R);
        rx.beginPath(); rx.arc(cx,cy,r,0,7);
        rx.strokeStyle = lu===0 ? 'rgba(244,196,48,.55)' : 'rgba(40,60,75,.6)';
        rx.lineWidth = lu===0 ? 1.5 : 1; rx.stroke();
        rx.fillStyle = lu===0 ? 'rgba(244,196,48,.85)':'rgba(120,140,155,.7)';
        rx.fillText((lu>0?'+':'')+lu, cx, cy-r+11);
      }
      for(let a=0;a<12;a++){const ang=a/12*2*Math.PI-Math.PI/2;
        rx.beginPath(); rx.moveTo(cx,cy);
        rx.lineTo(cx+Math.cos(ang)*R, cy+Math.sin(ang)*R);
        rx.strokeStyle='rgba(30,45,58,.5)'; rx.lineWidth=1; rx.stroke();}
      const now=performance.now();
      const wedge=2*Math.PI/300*0.95;
      for(const h of hist){
        const age=(now-h.t)/PERIOD; if(age>1)continue;
        const ang=h.ang-Math.PI/2, r=rForLu(h.lu,R);
        rx.beginPath(); rx.moveTo(cx,cy);
        rx.arc(cx,cy,r,ang-wedge/2,ang+wedge/2); rx.closePath();
        rx.fillStyle=zoneColor(h.lu);
        rx.globalAlpha=Math.max(0.12,1-age*0.85); rx.fill();
      }
      rx.globalAlpha=1;
      const ca=((now-startT)%PERIOD)/PERIOD*2*Math.PI-Math.PI/2;
      rx.beginPath(); rx.moveTo(cx,cy);
      rx.lineTo(cx+Math.cos(ca)*R, cy+Math.sin(ca)*R);
      rx.strokeStyle='rgba(255,255,255,.35)'; rx.lineWidth=1.5; rx.stroke();
      rx.fillStyle='#06080b'; rx.beginPath(); rx.arc(cx,cy,0.16*R,0,7); rx.fill();
    }

    function drawBalance(corr,bal,side){
      if(!bx) return;
      const W=bc.width,H=bc.height; bx.clearRect(0,0,W,H);
      const cx=W/2, top=14, bot=H-14, hw=W/2-18;
      bx.strokeStyle='rgba(244,196,48,.7)'; bx.lineWidth=1.5;
      bx.beginPath(); bx.moveTo(cx,top); bx.lineTo(cx-hw,bot); bx.lineTo(cx+hw,bot); bx.closePath(); bx.stroke();
      bx.fillStyle='rgba(120,140,155,.8)'; bx.font='10px DM Mono, monospace'; bx.textAlign='center';
      bx.fillText('M/S', cx, top-3); bx.textAlign='left'; bx.fillText('L',2,bot+11);
      bx.textAlign='right'; bx.fillText('R',W-2,bot+11);
      const x=cx+(bal||0)*hw*0.9;
      const y=bot-(side||0)*(bot-top)*1.6; const yc=Math.max(top,Math.min(bot,y));
      bx.beginPath(); bx.arc(x,yc,4,0,7);
      bx.fillStyle=(corr<0)?'#e23b3b':'#f4c430'; bx.fill();
    }

    function setBar(fill,cap,db){
      if(!fill) return;
      const lo=-30, hi=3, p=Math.max(0,Math.min(1,(db-lo)/(hi-lo)));
      fill.style.height=(p*100)+'%'; if(cap)cap.style.bottom=(p*100)+'%';
    }

    function frame(){
      const o = metering.state.out, i = metering.state.in, target = metering.target;
      if(o){
        if(bars) setBar(bars.L, bars.capL, isFinite(o.tpL)?o.tpL:-60);
        if(bars) setBar(bars.R, bars.capR, isFinite(o.tpR)?o.tpR:-60);
        drawBalance(o.corr,o.balance,o.side);
        const now=performance.now();
        if(now-lastSample>90 && isFinite(o.shortTerm)){
          lastSample=now;
          hist.push({ang:((now-startT)%PERIOD)/PERIOD*2*Math.PI, lu:o.shortTerm-target, t:now});
          if(hist.length>320)hist.shift();
        }
        let delta=null;
        if(i){
          const dL=(isFinite(o.integrated)&&isFinite(i.integrated))?o.integrated-i.integrated:NaN;
          const dLra=(isFinite(o.lra)&&isFinite(i.lra))?o.lra-i.lra:NaN;
          delta={ dLoud:dL, dLra:dLra };
        }
        onText(o, i, delta);
      }
      drawRadar();
      raf=requestAnimationFrame(frame);
    }

    return {
      start(){ if(!raf){ startT=performance.now(); raf=requestAnimationFrame(frame); } },
      stop(){ if(raf){ cancelAnimationFrame(raf); raf=null; } },
      resetRadar(){ hist=[]; startT=performance.now(); },
      _draw(){ drawRadar(); drawBalance(1,0,0); }
    };
  }

  global.PiradexRadarUI = PiradexRadarUI;
})(typeof window!=='undefined' ? window : globalThis);
