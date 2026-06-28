# Piradex · Loudness Radar (In ⇄ Out)

Medidor de loudness estilo **Clarity M** para a Piradex Mastering Suite.
Mede o áudio na **entrada** e na **saída** da cadeia (principalmente saída),
segundo a norma **ITU-R BS.1770-4 / EBU R128**, com radar polar de loudness,
Balance-o-Meter (L/R + Mid/Side) e barras de **true-peak**.

A medição corre num `AudioWorkletNode` (a única forma correta de obter LUFS:
o `AnalyserNode` não tem ponderação-K nem *gating*). Os taps são **pass-through**
puros — não alteram o áudio, podem ficar sempre ligados.

## Ficheiros

| Ficheiro | Função |
|---|---|
| `loudness-processor.js` | Worklet de medição BS.1770 (ponderação-K, Momentary/Short-term/Integrated com gating, True-peak por sobreamostragem 4x, correlação, M/S). **Canónico.** |
| `piradex-loudness-meter.js` | API `createPiradexMetering()` — cria os dois taps (entrada + saída). Traz o worklet embebido (fallback Blob), por isso funciona em `file://`, GitHub Pages ou embebido na suite, sem servidor. |
| `piradex-radar-ui.js` | `PiradexRadarUI()` — desenha o radar, a Balance-o-Meter e as barras a partir de uma instância de metering. |
| `piradex-rta.js` | `PiradexRTA()` — analisador de espectro 1/3-oitava (ISO 266). Barras = saída, linha âmbar = entrada, marcas vermelhas = peak-hold. Ramos `AnalyserNode` paralelos; não altera o áudio. |
| `index.html` | Demo completa (carregar ficheiro, tom de calibração, ruído rosa, cadeia de processamento, target presets). |

## Arrancar

- **GitHub Pages / servidor:** abre `index.html`. O worklet carrega de `loudness-processor.js`.
- **Sem servidor (`file://`)/embebido:** funciona à mesma — o `meter` usa o worklet embebido via Blob.

## Integrar na Piradex Mastering Suite

```js
const meters = await createPiradexMetering(audioCtx, {
  target: -14,                          // alvo LUFS (presets: -14/-9/-8/-16/-23)
  workletUrl: 'loudness-processor.js'   // opcional; sem isto usa o Blob embebido
});

// inserir os taps na cadeia real:
fonte.connect(meters.inputNode);        // ENTRADA (pré-processamento)
meters.inputNode.connect(primeiroProcessador);
// ... EQ, compressor, etc ...
limiter.connect(meters.outputNode);     // SAÍDA (pós-limiter)
meters.outputNode.connect(audioCtx.destination);

// ligar a UI (opcional):
const ui = PiradexRadarUI({
  metering: meters,
  radar: document.getElementById('radar'),
  balance: document.getElementById('balance'),
  bars: { L:barL, R:barR, capL:capL, capR:capR },
  onText: (out, inp, delta) => { /* atualiza o teu DOM */ }
});
ui.start();
```

### RTA 1/3-oitava (opcional)

```js
const rta = PiradexRTA({ audioContext: audioCtx, canvas: document.getElementById('rta') });
rta.tapOutput(meters.outputNode);   // barras = saída
rta.tapInput(meters.inputNode);     // linha âmbar = entrada (opcional)
rta.start();
```

Validação: ruído **rosa** → RTA aproximadamente plano; ruído **branco** → sobe ~3 dB/oitava.

### API

- `meters.inputNode`, `meters.outputNode` — `AudioWorkletNode` pass-through a inserir na cadeia.
- `meters.state.in`, `meters.state.out` — última leitura de cada ponto.
- `meters.onUpdate((state, target) => {})` — callback por atualização (~10 Hz).
- `meters.setTarget(lufs)`, `meters.resetIntegrated()`, `meters.resetTruePeak()`.

### Objeto de leitura (`state.in` / `state.out`)

```
{
  id, channels,
  momentary,   // LUFS (400 ms)
  shortTerm,   // LUFS (3 s)
  integrated,  // LUFS (gated, BS.1770)
  lra,         // LU (Loudness Range)
  tpMax,       // dBTP (max-hold)
  tpL, tpR,    // dBTP corrente por canal
  corr,        // correlação de fase  (-1..+1)
  balance,     // balança L/R         (-1..+1)
  side         // fração de energia Side (0..1)
}
```

## Validar a medição (EBU Tech 3341)

1. **Bypass proc. ON** + **Tom 1 kHz −23 dBFS** → Integrated da saída tem de assentar
   em **−23.0 LUFS (±0.1)** e o Δ entrada/saída em **0.0 LU**. Confirma ponderação-K + gating.
2. Liga **Makeup** ou desliga o bypass → a saída afasta-se da entrada; o painel Δ mostra
   ΔLoudness, true-peak in→out e ΔLRA.

## Notas técnicas

- Coeficientes da ponderação-K recalculados para o `sampleRate` real (44.1 ou 48 kHz),
  não fixos a 48 k.
- Mono é medido como **um** canal (peso 1.0) — sem o erro de +3 LU de duplicar para estéreo.
- **True-peak:** sobreamostragem 4x com FIR de 8 taps/fase. Suficiente para metering fiável
  e apanha inter-sample peaks; para certificação formal BS.1770 sobe para ~48 taps/fase.
- Posting ~10 Hz (a cada bloco de 100 ms).

---
Piradex / BeatFreak — inspirado no conceito de loudness radar; implementação própria sobre Web Audio API.
