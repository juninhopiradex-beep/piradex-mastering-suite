#!/usr/bin/env node
/* ============================================================
   Piradex · tests/run-tests.js  (auditoria E3)
   Testes numéricos DSP — correm em Node, sem browser:
     node tests/run-tests.js
   Verificam invariantes que não podem regredir:
   T1  Loudness worklet: conformidade EBU Tech 3341 (tom −23 dBFS)
   T2  Loudness: mono ≠ estéreo dual-mono (sem o erro de +3 LU)
   T3  TP Limiter: ceiling garantido em sinal +3 dBFS (inter-sample incl.)
   T4  TP Limiter: transparência abaixo do ceiling (null test)
   T5  TP Limiter: transiente único (pico isolado) não passa o ceiling
   T6  TP measure: seno a −6 dBFS mede ≈ −6 dBTP
   ============================================================ */
'use strict';
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
let pass=0, fail=0;
function ok(name,cond,detail){ if(cond){pass++;console.log('  ✓ '+name+(detail?'  ['+detail+']':''));}
  else{fail++;console.log('  ✗ FALHOU: '+name+(detail?'  ['+detail+']':''));} }

/* ---- carregar o kernel do limiter (fonte única) ---- */
const limSrc=fs.readFileSync(path.join(ROOT,'piradex-limiter-pro.js'),'utf8');
const kernelMatch=limSrc.match(/const KERNEL_SRC = String\.raw`([\s\S]*?)`;/);
const KERNEL=kernelMatch[1];
const modK={}; new Function('exports',KERNEL+';exports.K=TPLimiterKernel;')(modK);
const TPKernel=modK.K;

/* ---- carregar o worklet de loudness (de piradex-analise-pro.js) ---- */
const apSrc=fs.readFileSync(path.join(ROOT,'piradex-analise-pro.js'),'utf8');
const wkMatch=apSrc.match(/String\.raw`([\s\S]*?)`;/);
let wk=wkMatch[1].replace("registerProcessor('piradex-loudness', LoudnessProcessor);","globalThis.__LP=LoudnessProcessor;");
global.sampleRate=48000;
global.AudioWorkletProcessor=class{constructor(){this.port={postMessage(){},onmessage:null}}};
eval(wk);
const LP=globalThis.__LP;

const SR=48000;
function sine(freq,dbfs,secs,ch=2){
  const amp=Math.pow(10,dbfs/20), N=Math.round(SR*secs), out=[];
  for(let c=0;c<ch;c++){const d=new Float32Array(N);
    for(let i=0;i<N;i++)d[i]=amp*Math.sin(2*Math.PI*freq*i/SR); out.push(d);}
  return out;
}
function runLoudness(chs){
  const p=new LP({processorOptions:{id:'t'}}); let last=null;
  p.port.postMessage=(m)=>{last=m;};
  const N=128, total=chs[0].length;
  for(let off=0;off+N<=total;off+=N){
    const blk=chs.map(d=>d.subarray(off,off+N));
    p.process([blk],[blk.map(b=>new Float32Array(N))]);
  }
  return last;
}

console.log('\n══ T1 · EBU Tech 3341: tom 1 kHz −23 dBFS estéreo → −23.0 LUFS (±0.1) ══');
{ const r=runLoudness(sine(1000,-23,3,2));
  ok('Integrated', Math.abs(r.integrated-(-23))<=0.1, r.integrated.toFixed(2)+' LUFS');
  ok('Momentary',  Math.abs(r.momentary -(-23))<=0.1, r.momentary.toFixed(2)+' LUFS');
  ok('True-peak',  Math.abs(r.tpMax     -(-23))<=0.2, r.tpMax.toFixed(2)+' dBTP'); }

console.log('\n══ T2 · Mono medido como 1 canal (sem inflação de +3 LU) ══');
{ const st=runLoudness(sine(1000,-23,3,2)).integrated;
  const mo=runLoudness(sine(1000,-23,3,1)).integrated;
  ok('estéreo dual-mono ≈ −23', Math.abs(st-(-23))<=0.1, st.toFixed(2));
  ok('mono ≈ −26 (1 canal, correto por norma)', Math.abs(mo-(-26))<=0.2, mo.toFixed(2)); }

console.log('\n══ T3 · TP Limiter: seno +3 dBFS → saída ≤ −1.0 dBTP (+0.1 tolerância) ══');
{ const chs=sine(997,+3,1.0,2);
  const k=new TPKernel(SR,{ceilingDb:-1.0,releaseMs:80});
  k.process(chs);
  const tp=new TPKernel(SR,{}).measure(chs);
  ok('true-peak pós-limiter ≤ ceiling', tp<=-1.0+0.1, tp.toFixed(2)+' dBTP'); }

console.log('\n══ T4 · TP Limiter: transparência a −6 dBFS (null < −60 dB pós-delay) ══');
{ const secs=0.5, chs=sine(440,-6,secs,2);
  const ref=chs.map(d=>Float32Array.from(d));
  const k=new TPKernel(SR,{ceilingDb:-1.0});
  k.process(chs);
  const la=k.la; let maxDiff=0; const N=chs[0].length;
  for(let i=0;i<N-la;i++){const d=Math.abs(chs[0][i+la]-ref[0][i]); if(d>maxDiff)maxDiff=d;}
  const nullDb=20*Math.log10(maxDiff>1e-12?maxDiff:1e-12);
  ok('resíduo (sinal alinhado) < −60 dB', nullDb<-60, nullDb.toFixed(1)+' dB'); }

console.log('\n══ T5 · TP Limiter: transiente isolado (impulso 0 dBFS) não passa o ceiling ══');
{ const N=SR/2, L=new Float32Array(N), R=new Float32Array(N);
  L[Math.floor(N/2)]=1.0; R[Math.floor(N/2)]=1.0;   // clique a 0 dBFS
  const chs=[L,R];
  const k=new TPKernel(SR,{ceilingDb:-1.0});
  k.process(chs);
  const tp=new TPKernel(SR,{}).measure(chs);
  ok('impulso limitado ao ceiling', tp<=-1.0+0.15, tp.toFixed(2)+' dBTP'); }

console.log('\n══ T6 · Medidor TP: seno −6 dBFS mede ≈ −6 dBTP ══');
{ const chs=sine(1000,-6,0.3,2);
  const tp=new TPKernel(SR,{}).measure(chs);
  ok('medição correta', Math.abs(tp-(-6))<=0.15, tp.toFixed(2)+' dBTP'); }

console.log('\n─────────────────────────────');
console.log(pass+' passaram · '+fail+' falharam');
process.exit(fail?1:0);
