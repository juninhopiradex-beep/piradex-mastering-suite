// ===== PIRADEX MASTERING SUITE — app.js =====

const PRESETS = {
  kizomba: {
    name: 'KIZOMBA',
    desc: 'Graves quentes, mids suaves, loudness moderado — sensualidade e groove',
    knobs: { CLEAN: 20, BASS: 72, LOUD: 58, WIDE: 38, PUNCH: 45, FOCUS: 30 },
    sugs: [
      ['Warm low-end @ 80Hz', '+2.1 dB', 'c2'],
      ['Mid harshness reduced', '-1.8 dB', 'c3'],
      ['Stereo warmth', '+10%', 'c5']
    ]
  },
  kuduro: {
    name: 'KUDURO',
    desc: 'Kick agressivo, muito punch, loudness alto — energia máxima de dança',
    knobs: { CLEAN: 10, BASS: 85, LOUD: 88, WIDE: 30, PUNCH: 92, FOCUS: 70 },
    sugs: [
      ['Sub kick boosted @ 60Hz', '+3.5 dB', 'c2'],
      ['High attack enhanced', '+2.1 dB', 'c3'],
      ['Punch maximised', '+28%', 'c7']
    ]
  },
  zouk: {
    name: 'ZOUK',
    desc: 'Graves profundos, amplitude sonora romântica, loudness controlado',
    knobs: { CLEAN: 35, BASS: 65, LOUD: 52, WIDE: 68, PUNCH: 40, FOCUS: 25 },
    sugs: [
      ['Deep bass presence @ 70Hz', '+1.8 dB', 'c2'],
      ['High freq air added', '+1.2 dB', 'c3'],
      ['Wide stereo field', '+22%', 'c5']
    ]
  },
  gzouk: {
    name: 'GZOUK',
    desc: 'Fusão Zouk+Ghetto — mais punch e groove urbano mantendo a fluidez',
    knobs: { CLEAN: 22, BASS: 75, LOUD: 70, WIDE: 55, PUNCH: 65, FOCUS: 48 },
    sugs: [
      ['Sub bass reinforced @ 55Hz', '+2.8 dB', 'c2'],
      ['Mid groove enhanced', '+1.0 dB', 'c3'],
      ['Urban width', '+16%', 'c6']
    ]
  },
  semba: {
    name: 'SEMBA',
    desc: 'Ritmo vivo, médios presentes, dinâmica preservada — alma angolana',
    knobs: { CLEAN: 45, BASS: 55, LOUD: 50, WIDE: 42, PUNCH: 60, FOCUS: 55 },
    sugs: [
      ['Mid presence @ 1.2kHz', '+1.5 dB', 'c2'],
      ['Dynamic range kept', '-0.8 dB', 'c3'],
      ['Natural width', '+8%', 'c5']
    ]
  },
  afrohouse: {
    name: 'AFRO-HOUSE',
    desc: 'Sub profundo, percussão afiada, amplitude para o dancefloor',
    knobs: { CLEAN: 15, BASS: 80, LOUD: 82, WIDE: 60, PUNCH: 78, FOCUS: 65 },
    sugs: [
      ['Sub bass weight @ 45Hz', '+3.2 dB', 'c2'],
      ['Percussion clarity', '+1.6 dB', 'c3'],
      ['Club width', '+25%', 'c5']
    ]
  },
  rnb: {
    name: 'R&B',
    desc: 'Voz no topo, graves suaves, produção polida e cinematográfica',
    knobs: { CLEAN: 55, BASS: 62, LOUD: 60, WIDE: 52, PUNCH: 42, FOCUS: 72 },
    sugs: [
      ['Vocal presence @ 3kHz', '+1.4 dB', 'c2'],
      ['Low-end smoothed', '-1.0 dB', 'c3'],
      ['Silky stereo', '+14%', 'c5']
    ]
  },
  afrobeats: {
    name: 'AFROBEATS',
    desc: 'Groove afro, percussão colorida, loudness radiofónico',
    knobs: { CLEAN: 25, BASS: 70, LOUD: 75, WIDE: 58, PUNCH: 68, FOCUS: 60 },
    sugs: [
      ['Afro kick punch @ 80Hz', '+2.6 dB', 'c2'],
      ['Rhythm mid boost', '+1.2 dB', 'c3'],
      ['Bright stereo', '+18%', 'c5']
    ]
  }
};

const KNOBS_DEF = ['CLEAN', 'BASS', 'LOUD', 'WIDE', 'PUNCH', 'FOCUS'];
const KNOB_COLORS = {
  CLEAN: '#2dd4ff',
  BASS:  '#b855f7',
  LOUD:  '#ff3ab5',
  WIDE:  '#2dff8a',
  PUNCH: '#ff6b35',
  FOCUS: '#ffe135'
};

let kvals = { CLEAN: 20, BASS: 72, LOUD: 58, WIDE: 38, PUNCH: 45, FOCUS: 30 };
let piradexOn = false;
let bypassOn  = false;
let vuPhase   = 0;
let curPreset = 'kizomba';
let specData  = new Array(52).fill(0).map(() => 0.1 + Math.random() * 0.3);
let specTarget = specData.slice();

// ===== KNOB DRAWING =====

function toRad(d) { return d * Math.PI / 180; }

function descArc(cx, cy, r, startDeg, endDeg) {
  const sr = toRad(startDeg), er = toRad(endDeg);
  const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
  const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}`;
}

function buildKnobs() {
  const row = document.getElementById('knobs-row');
  row.innerHTML = '';
  KNOBS_DEF.forEach((name, i) => {
    const div = document.createElement('div');
    div.className = 'ki';
    div.innerHTML = `
      <svg class="ks" viewBox="0 0 52 52" id="ks-${i}">
        <circle cx="26" cy="26" r="20" fill="#141418" stroke="#ffffff0e" stroke-width="2.5"/>
        <path id="ka-${i}" fill="none" stroke="${KNOB_COLORS[name]}" stroke-width="4" stroke-linecap="round"/>
        <text x="26" y="31" text-anchor="middle" font-family="Orbitron" font-size="12"
              font-weight="700" fill="${KNOB_COLORS[name]}" id="kt-${i}">${Math.round(kvals[name])}</text>
      </svg>
      <div class="kname">${name}</div>
    `;
    div.addEventListener('mousedown', e => startDrag(e, name));
    div.addEventListener('touchstart', e => startDrag(e, name), { passive: true });
    row.appendChild(div);
    drawKnob(i, name);
  });
}

function drawKnob(i, name) {
  const v    = kvals[name];
  const pct  = v / 100;
  const end  = 135 + pct * 270;
  const arc  = document.getElementById(`ka-${i}`);
  const txt  = document.getElementById(`kt-${i}`);
  if (arc) arc.setAttribute('d', descArc(26, 26, 20, 135, end));
  if (txt) txt.textContent = Math.round(v);
}

function refreshKnobs() {
  KNOBS_DEF.forEach((name, i) => drawKnob(i, name));
}

// ===== DRAG =====

let dragName = '', dragSY = 0, dragSV = 0;

function startDrag(e, name) {
  dragName = name;
  dragSY   = e.touches ? e.touches[0].clientY : e.clientY;
  dragSV   = kvals[name];
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
  if (!dragName) return;
  const cy    = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = (dragSY - cy) * 0.9;
  kvals[dragName] = Math.max(0, Math.min(100, dragSV + delta));
  const i = KNOBS_DEF.indexOf(dragName);
  drawKnob(i, dragName);
  updateLUFS();
}

function stopDrag() {
  dragName = '';
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// ===== PRESETS =====

function setPreset(key, el) {
  curPreset = key;
  const p = PRESETS[key];

  document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('hdr-preset').textContent = p.name;
  document.getElementById('pi-name').textContent    = p.name;
  document.getElementById('pi-desc').textContent    = p.desc;

  Object.assign(kvals, p.knobs);
  refreshKnobs();
  updateLUFS();
  updateSugs(p.sugs);
  setSpecTarget(key);

  document.getElementById('stxt').textContent =
    `PRESET: ${p.name} — ${p.desc.split(',')[0].toUpperCase()}`;
}

function updateSugs(sugs) {
  sugs.forEach((s, i) => {
    const t = document.getElementById(`s${i + 1}t`);
    const v = document.getElementById(`s${i + 1}v`);
    if (t) t.textContent = s[0];
    if (v) {
      v.textContent = s[1];
      v.className   = `sval ${s[2]}`;
    }
  });
}

function setSpecTarget(key) {
  const profiles = {
    kizomba:  [0.80,0.85,0.70,0.50,0.40,0.30,0.25,0.20,0.15,0.12],
    kuduro:   [0.95,0.90,0.75,0.50,0.60,0.55,0.40,0.30,0.20,0.15],
    zouk:     [0.75,0.80,0.65,0.55,0.45,0.35,0.30,0.25,0.20,0.18],
    gzouk:    [0.85,0.88,0.70,0.55,0.50,0.40,0.32,0.25,0.18,0.14],
    semba:    [0.65,0.70,0.75,0.60,0.55,0.50,0.40,0.30,0.22,0.15],
    afrohouse:[0.92,0.88,0.72,0.50,0.60,0.55,0.45,0.35,0.22,0.14],
    rnb:      [0.60,0.65,0.70,0.65,0.60,0.55,0.50,0.40,0.30,0.20],
    afrobeats:[0.82,0.85,0.72,0.58,0.55,0.48,0.38,0.28,0.18,0.12]
  };
  const curve = profiles[key] || profiles.kizomba;
  specTarget = new Array(52).fill(0).map((_, i) => {
    const seg  = Math.floor(i / 52 * curve.length);
    const base = curve[Math.min(seg, curve.length - 1)];
    return Math.max(0.04, base * (0.8 + Math.random() * 0.4));
  });
}

// ===== ACTIONS =====

function doRemaster() {
  setSpecTarget(curPreset);
  document.getElementById('stxt').textContent = '✓ RE-MASTER COMPLETO — IA APLICADA';
}

function updateLUFS() {
  const loud = kvals.LOUD;
  const lufs = (-23 + loud * 0.17).toFixed(1);
  document.getElementById('lufs-n').textContent = lufs;
  document.getElementById('slufs').textContent  = lufs + ' LUFS';
}

function toggleBypass() {
  bypassOn = !bypassOn;
  document.getElementById('bypass-btn').classList.toggle('on', bypassOn);
  document.getElementById('stxt').textContent = bypassOn
    ? 'BYPASS ATIVO — SEM PROCESSAMENTO'
    : 'BYPASS DESLIGADO — PROCESSANDO';
}

function togglePiradex() {
  piradexOn = !piradexOn;
  const btn = document.getElementById('pira-btn');
  if (piradexOn) {
    btn.classList.add('on');
    btn.textContent = '⚡ PIRADEX ATIVO ⚡';
    document.getElementById('stxt').textContent = '🔥 PIRADEX ON — TURBO MÁXIMO ACTIVADO';
    KNOBS_DEF.forEach((n, i) => {
      kvals[n] = Math.min(100, kvals[n] + 18 + Math.random() * 12);
      drawKnob(i, n);
    });
    setSpecTarget(curPreset);
    updateLUFS();
  } else {
    btn.classList.remove('on');
    btn.textContent = '⚡ MASTERING PIRADEX ⚡';
    document.getElementById('stxt').textContent = 'PIRADEX DESACTIVADO';
    setPreset(curPreset, document.querySelector('.preset-chip.active'));
  }
}

// ===== FILE INPUT =====

document.getElementById('sf').addEventListener('change', function () {
  if (this.files[0]) {
    document.getElementById('fname').textContent  = this.files[0].name;
    document.getElementById('stxt').textContent   = 'ARQUIVO CARREGADO — PRONTO PARA MASTERIZAR';
    setSpecTarget(curPreset);
  }
});

// ===== TABS =====

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
  });
});

// ===== SPECTRUM + VU ANIMATION =====

function animate() {
  const canvas = document.getElementById('spec');
  if (!canvas) { requestAnimationFrame(animate); return; }

  const ctx = canvas.getContext('2d');
  const W   = canvas.width  = canvas.offsetWidth  || 300;
  const H   = canvas.height = canvas.offsetHeight || 160;
  ctx.clearRect(0, 0, W, H);

  const N  = 52;
  const bw = (W / N) - 1;
  const colors = ['#ff3ab5','#ff6b35','#ffe135','#2dff8a','#2dd4ff','#b855f7','#ff3ab5'];
  const spd = piradexOn ? 1.8 : 1;

  specData = specData.map((v, i) => {
    const n = (Math.random() - 0.5) * 0.05 * spd;
    return Math.max(0.03, Math.min(1, v * 0.87 + specTarget[i] * 0.13 + n));
  });

  specData.forEach((v, i) => {
    const x   = i * (bw + 1) + 1;
    const h   = v * (H - 4);
    const pct = i / N;
    const ci  = Math.floor(pct * (colors.length - 1));
    const grad = ctx.createLinearGradient(0, H - h, 0, H);
    grad.addColorStop(0, colors[ci] + 'ee');
    grad.addColorStop(1, colors[ci] + '22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, H - h, bw, h, 2);
    else               ctx.rect(x, H - h, bw, h);
    ctx.fill();
  });

  vuPhase += piradexOn ? 0.09 : 0.05;
  const loud = kvals.LOUD / 100;
  const lh = Math.min(96, 50 + loud * 45 + Math.sin(vuPhase * 1.2) * 9 + (piradexOn ? 18 : 0));
  const rh = Math.min(96, 45 + loud * 45 + Math.sin(vuPhase * 1.6 + 1) * 9 + (piradexOn ? 18 : 0));
  document.getElementById('vu-l').style.height = lh + '%';
  document.getElementById('vu-r').style.height = rh + '%';

  requestAnimationFrame(animate);
}

// ===== INIT =====
buildKnobs();
updateLUFS();
setSpecTarget('kizomba');
animate();
