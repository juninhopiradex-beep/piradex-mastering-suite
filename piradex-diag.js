/* ============================================================
   Piradex · piradex-diag.js
   Diagnóstico de integridade — corre no browser.
   Na consola escreve:  PIRADEX_DIAGNOSE()
   Diz-te se os ficheiros carregaram por inteiro, o estado do áudio,
   o modo BEFORE/AFTER, e onde está o problema.
   ============================================================ */
(function(){
  function T(v){ try{ return typeof v; }catch(e){ return 'erro'; } }
  window.PIRADEX_DIAGNOSE = function(){
    const L=[]; const line=(ok,name,extra)=>L.push((ok?'✓':'✗')+' '+name+(extra!=null?' → '+extra:''));

    // 1) ficheiros carregados por inteiro (funções-chave definidas)
    const appOK = (T(window.applyDSP==null?undefined:0), typeof window.applyDSP==='function') ||
                  (typeof applyDSP!=='undefined');
    line(typeof applyDSP!=='undefined' && typeof applyDSP==='function','app.js · applyDSP()');
    line(typeof buildChain!=='undefined','app.js · buildChain()');
    line(typeof initAudio!=='undefined','app.js · initAudio()');
    line(typeof applyPiradexDSP!=='undefined','app.js · applyPiradexDSP()');
    line(typeof window.PiradexAnalisePro!=='undefined','piradex-analise-pro.js');
    line(typeof window.PiradexTPLimiter!=='undefined','piradex-limiter-pro.js');

    // 2) estado do motor de áudio
    line(!!window.audioCtx,'audioCtx', window.audioCtx && window.audioCtx.state);
    line(!!window.masterGain,'masterGain');
    line(!!window.analyserNode,'analyserNode');
    line(typeof playMode!=='undefined', 'playMode (BEFORE/AFTER)', (typeof playMode!=='undefined'?playMode:'?'));
    line(typeof piradexOn!=='undefined', 'piradexOn', (typeof piradexOn!=='undefined'?piradexOn:'?'));
    line(typeof bypassOn!=='undefined', 'bypassOn', (typeof bypassOn!=='undefined'?bypassOn:'?'));
    line(true,'limiter ao vivo ligado', !!(window.masterGain && window.masterGain.__tpSpliced));
    try{ line(typeof kvals!=='undefined','kvals (knobs)', JSON.stringify(kvals)); }catch(e){}

    console.log('%c  PIRADEX DIAGNOSE  ','background:#f4c430;color:#111;font-weight:bold;font-size:13px');
    console.log(L.join('\n'));

    // 3) conclusão automática
    const filesBroken = (typeof applyDSP==='undefined' || typeof buildChain==='undefined' ||
                         typeof applyPiradexDSP==='undefined');
    if(filesBroken){
      console.log('%c>> PROBLEMA: o app.js NÃO carregou por inteiro. A extração do ZIP ficou corrompida/truncada.\n   Solução: apaga a pasta, volta a descarregar o ZIP COMPLETO e extrai de novo (vê instruções).',
        'color:#e23b3b;font-weight:bold');
    } else if(typeof playMode!=='undefined' && playMode!=='after'){
      console.log('%c>> Estás em modo BEFORE (= original, sem processamento). Carrega no botão A/B (AFTER) para ouvires os efeitos.',
        'color:#f08a24;font-weight:bold');
    } else {
      console.log('%c Código íntegro e em modo AFTER. Se a processada ainda não muda com os knobs, escreve:  PiradexTPLimiter.setEnabled(false)  e testa de novo. Diz-me o resultado.',
        'color:#36c46a;font-weight:bold');
    }
    return L;
  };
  // aviso automático leve ao carregar
  setTimeout(function(){
    if(typeof applyDSP==='undefined' || typeof buildChain==='undefined'){
      console.log('%c[PIRADEX] Aviso: parte do app.js não carregou — provável ZIP corrompido. Corre PIRADEX_DIAGNOSE()','color:#e23b3b;font-weight:bold');
    } else {
      console.log('%c[PIRADEX] pronto. Diagnóstico disponível: escreve  PIRADEX_DIAGNOSE()','color:#6b7884');
    }
  }, 1200);
})();
