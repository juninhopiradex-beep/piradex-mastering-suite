# Piradex Pro Finalizer — API Pública (`window.PRDX3`)

A `features3.js` expõe uma API JavaScript para automação e integração com fluxos profissionais (host pages, webviews de DAW, scripts de batch). **Não é** uma ponte VST/AU nativa — é uma API JS no browser onde a suite corre.

## Acesso direto (mesma página)

```js
// medir
const { lufs, truePeak } = PRDX3.measure();           // usa o master activo
const stats = PRDX3.measure(meuAudioBuffer);          // ou um AudioBuffer

// limitar (True Peak + normalização opcional ao LUFS alvo)
const out = await PRDX3.limit(buf, { ceiling: -1.0, targetLufs: -14 });

// separar (M/S espectral): 'acapella' (centro) | 'instrumental' (remove centro)
const acap = await PRDX3.separate(buf, 'acapella', 2.5);

// decodificar e exportar
const buffer = await PRDX3.decode(arrayBufferOuBase64);
const blob = await PRDX3.export(out, 'flac', { artist: 'Juninho Piradex', title: 'Master', isrc: '' });
PRDX3.download(blob, 'master.flac');

// estado da suite (todos os sliders) — útil para presets/automação
const snap = PRDX3.snapshot();        // { sliderId: value, ... }
PRDX3.restore(snap);                  // reaplica e dispara eventos 'input'

// presets
PRDX3.presets.list();                 // array de presets guardados
PRDX3.presets.apply(0);               // aplica o preset índice 0

// eventos: 'fileLoaded' | 'mastered' | 'bufferLoaded'
const unbind = PRDX3.on('mastered', ({ buffer }) => console.log('master pronto', buffer));

// extensibilidade IA — plugar um modelo real de stems (Demucs/Spleeter via TF.js/ONNX)
PRDX3.setStemModel(async (buffer, mode) => { /* devolve AudioBuffer */ });
```

## Formatos de export suportados
`wav16` · `wav24` · `wav32` (float) · `aiff16` · `aiff24` · `mp3` (320) · `flac` (lossless, beta)

## Ponte `postMessage` (embeber a suite noutra app / webview de DAW)

A partir da página-host (ou de um iframe-pai), envia comandos e recebe respostas:

```js
const suite = document.getElementById('piradex-iframe').contentWindow;

function call(cmd, payload = {}) {
  return new Promise(resolve => {
    const id = Math.random().toString(36).slice(2);
    function onMsg(e) {
      const r = e.data && e.data.prdx3Result;
      if (r && r.id === id) { window.removeEventListener('message', onMsg); resolve(r); }
    }
    window.addEventListener('message', onMsg);
    suite.postMessage({ prdx3: { id, cmd, ...payload } }, '*');
  });
}

await call('version');                                    // { ok, data:{version} }
await call('measure', { audio: base64WavDoTeuDAW });      // { ok, data:{lufs, truePeak} }
const res = await call('master', {                        // masteriza e devolve o ficheiro
  audio: base64Wav,
  opts: { ceiling: -1, targetLufs: -14 },
  format: 'wav24',
  meta: { artist: 'Piradex', title: 'Take 1' }
});
// res.data.file = dataURL do WAV masterizado · res.data.lufs / .truePeak
```

### Comandos `postMessage`
| cmd | payload | devolve |
|---|---|---|
| `version` | — | `{version}` |
| `open` | — | abre o painel |
| `measure` | `{audio?}` | `{lufs, truePeak}` |
| `master` | `{audio?, opts, format, meta}` | `{lufs, truePeak, file}` (dataURL) |
| `presets` | — | lista de presets |
| `snapshot` | — | estado dos sliders |

Todas as respostas têm a forma `{ prdx3Result: { id, ok, data, error } }`.
