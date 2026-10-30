// XPOOLS – konfigurátor bazénu a zastřešení
(() => {
  const CONTACT_EMAIL = 'info@xpools.cz';
  const STORAGE_KEY = 'xpools-konfigurace-v2';

  // ---------- nabídka voleb ----------
  const hasPool = s => s.mode !== 'zastreseni';
  const hasRoof = s => s.mode !== 'bazen';
  const isReko = s => hasPool(s) && s.type === 'rekonstrukce';
  const newPool = s => hasPool(s) && !isReko(s);              // konfiguruje se nový bazén
  const rekoOnly = s => isReko(s) && !hasRoof(s);              // jen rekonstrukce → rovnou kontakt

  const MATERIALS = {
    plast: { label: 'Plastový', desc: 'Polypropylen, rychlá montáž, dlouhá životnost.' },
    folie: { label: 'Fóliový', desc: 'Betonový skelet s fólií, libovolný rozměr.' },
    laminat: { label: 'Laminátový', desc: 'Hotová skořepina, hladký a odolný povrch.' },
    keramika: { label: 'Keramický', desc: 'Obklad či mozaika, nejvyšší standard.' },
  };
  // přelivový bazén dodáváme jen v plastovém provedení
  const materialsFor = type => (type === 'preliv' ? ['plast'] : ['plast', 'folie', 'laminat', 'keramika']);

  // typy zastřešení a jejich 3D profil pro vizualizaci (rozměry v metrech)
  const ROOFS = {
    'nizke-hranate': { label: 'Nízké hranaté', desc: 'Nízký profil s rovnými plochami, nenápadné na zahradě.', profile: 'angular', h: 0.95, wall: 0.42, chamfer: 1.05 },
    'stredni-pulkulate': { label: 'Střední půlkulaté', desc: 'Oblý tvar, dost místa nad hladinou.', profile: 'round', h: 1.6, e: 2.1 },
    'vysoke-pulkulate': { label: 'Vysoké půlkulaté', desc: 'Podchozí oblé zastřešení, koupání i za deště.', profile: 'round', h: 2.4, e: 2.7 },
    'vysoke-hranate': { label: 'Vysoké hranaté', desc: 'Podchozí, moderní hranatý tvar.', profile: 'angular', h: 2.45, wall: 1.85, chamfer: 0.75 },
    lamelove: { label: 'Lamelové', desc: 'Pergola s natáčecími lamelami – stín i ochrana před deštěm.', profile: 'pergola', h: 2.6 },
  };

  // Každý krok: id, label, title, when(state) – kdy se krok zobrazí, groups – skupiny voleb
  const STEPS = [
    {
      id: 'co', label: 'Co chcete', title: 'Co pro vás máme připravit?',
      lead: 'Vyberte, o co máte zájem. Konfigurátor vás pak provede jen tím, co je potřeba.',
      groups: [{
        id: 'mode', label: 'Mám zájem o', type: 'single', cols: 1, options: [
          { id: 'bazen', label: 'Bazén', desc: 'Nový bazén nebo rekonstrukce stávajícího.' },
          { id: 'zastreseni', label: 'Zastřešení', desc: 'Zastřešení k bazénu, který už máte.' },
          { id: 'oboji', label: 'Bazén a zastřešení', desc: 'Kompletní řešení na klíč.' },
        ],
      }],
    },
    {
      id: 'bazen', label: 'Bazén', title: 'Bazén', when: hasPool,
      groups: [
        { id: 'type', label: 'Typ bazénu', type: 'single', cols: 3, options: [
          { id: 'skimmer', label: 'Skimmerový', desc: 'Hladina pár centimetrů pod okrajem.' },
          { id: 'preliv', label: 'Přelivový', desc: 'Hladina až po okraj, voda přetéká do žlábku.' },
          { id: 'rekonstrukce', label: 'Rekonstrukce bazénu', desc: 'Oprava nebo modernizace stávajícího bazénu.' },
        ] },
        { id: 'rekoNote', type: 'note', showIf: isReko,
          text: s => (hasRoof(s)
            ? 'Rekonstrukci domluvíme osobně. Teď ještě vyberte zastřešení a v posledním kroku nám napište pár slov o bazénu.'
            : 'Každá rekonstrukce je jiná. Pošlete nám kontakt a pár slov o vašem bazénu, ozveme se a domluvíme prohlídku.') },
        { id: 'material', label: 'Konstrukce bazénu', type: 'single', cols: 2, showIf: s => !isReko(s),
          note: s => (s.type === 'preliv' ? 'Přelivové bazény dodáváme v plastovém provedení.' : ''),
          options: s => materialsFor(s.type).map(id => ({ id, ...MATERIALS[id] })) },
        { id: 'size', label: 'Velikost bazénu (š × d)', type: 'single', cols: 3, showIf: s => !isReko(s),
          note: s => (s.material === 'folie' ? '' : 'Vlastní rozměr lze zvolit u fóliového bazénu.'),
          options: s => [
            { id: '3x5', label: '3 × 5 m' },
            { id: '3x6', label: '3 × 6 m', tag: 'Nejčastější' },
            { id: '3.5x7', label: '3,5 × 7 m' },
            { id: '4x8', label: '4 × 8 m' },
            ...(s.material === 'folie' ? [{ id: 'vlastni', label: 'Vlastní rozměr' }] : []),
          ] },
        { id: 'custom', label: 'Vlastní rozměr', type: 'custom', showIf: s => !isReko(s) && s.material === 'folie' && s.size === 'vlastni' },
      ],
    },
    {
      id: 'technologie', label: 'Technologie', title: 'Umístění technologie', when: s => hasPool(s) && !isReko(s),
      lead: 'Kde bude filtrace a ostatní technika bazénu?',
      groups: [
        { id: 'techPlace', label: 'Technologie', type: 'single', cols: 2, options: [
          { id: 'sachta', label: 'Technologická šachta', desc: 'Zapuštěná v zemi hned vedle bazénu.' },
          { id: 'stena', label: 'Technologická stěna', desc: 'V garáži, sklepě nebo zahradním domku.' },
        ] },
      ],
    },
    {
      id: 'zastreseni', label: 'Zastřešení', title: 'Typ zastřešení', when: hasRoof,
      lead: 'Zastřešení prodlouží koupací sezónu, udrží vodu čistší a zvýší bezpečnost dětí.',
      groups: [
        { id: 'roof', label: 'Typ zastřešení', type: 'single', cols: 2,
          options: Object.entries(ROOFS).map(([id, r]) => ({ id, label: r.label, desc: r.desc })) },
      ],
    },
    {
      id: 'servis', label: 'Montáž a servis', title: 'Montáž a servis', when: s => hasPool(s) && !isReko(s),
      groups: [
        { id: 'montazNote', type: 'note', text: 'Montáž a zprovoznění bazénu jsou vždy součástí dodávky.' },
        { id: 'stavba', label: 'Stavební práce', type: 'single', cols: 1, options: [
          { id: 'xpools', label: 'Chci zajistit stavební práce', desc: 'Výkop, základová deska, obsyp a napojení – vše od nás.' },
          { id: 'sam', label: 'Stavební práce si zajistím sám', desc: 'Dodáme vám podklady a domluvíme se na připravenosti.' },
        ] },
      ],
    },
    { id: 'odeslat', label: 'Odeslat', title: 'Odeslat', groups: [] },
  ];

  const DEFAULT = { mode: 'bazen', type: 'skimmer', material: 'plast', size: '3x6', customW: 3, customL: 6, techPlace: 'sachta',
    roof: 'stredni-pulkulate', stavba: 'xpools', view: 'venku', time: 'den', tab: 'foto' };

  // polygony vodní hladiny ve fotkách (souřadnice v šířce 1000) – shodné s tools/scenes.py
  const SCENES = {
    venku: { h: 562.5, water: [[79, 331], [366, 303], [853, 372], [657, 563], [443, 563]] },
    uvnitr: { h: 526.25, water: [[0, 345], [270, 302], [730, 302], [1000, 350], [1000, 458], [0, 458]] },
  };

  // projekce venkovní fotky odhadnutá z rohů hladiny (tools/camera.py):
  // bazén 4 × 7,24 m, osa X podél zadní hrany, osa Y směrem k fotoaparátu, osa Z nahoru (metry)
  const CAM = {
    P: [[719.16937, 40.39576, -37.13876, 497.81922], [176.9603, -165.01437, -539.2333, 2085.79951], [0.72961, -0.67984, -0.0741, 6.30151]],
    f: 519.8, w: 4, l: 7.24,
  };
  function proj([X, Y, Z]) {
    const [a, b, c] = CAM.P;
    const d = c[0] * X + c[1] * Y + c[2] * Z + c[3];
    return [(a[0] * X + a[1] * Y + a[2] * Z + a[3]) / d, (b[0] * X + b[1] * Y + b[2] * Z + b[3]) / d, d];
  }

  // ---------- stav ----------
  let state = load();
  let stepId = startStep();

  function load() {
    let s = { ...DEFAULT };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') s = { ...DEFAULT, ...saved, time: 'den', tab: 'foto' };
    } catch (e) { /* úložiště nemusí být dostupné */ }
    // odkaz z produktové stránky, např. konfigurator.html?mode=zastreseni&roof=lamelove
    const params = new URLSearchParams(location.search);
    ['mode', 'type', 'material', 'roof'].forEach(k => { if (params.get(k)) s[k] = params.get(k); });
    return normalize(s);
  }
  function startStep() {
    const params = new URLSearchParams(location.search);
    if (params.get('roof') && !params.get('type')) return 'zastreseni';
    return params.get('mode') ? 'bazen' : 'co';
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* nevadí */ }
  }
  // drží stav v povolených kombinacích
  function normalize(s) {
    if (!materialsFor(s.type).includes(s.material)) s.material = 'plast';
    if (!['3x5', '3x6', '3.5x7', '4x8', 'vlastni'].includes(s.size)) s.size = '3x6';
    if (s.size === 'vlastni' && s.material !== 'folie') s.size = '3x6';
    if (hasRoof(s)) s.view = 'venku';
    if (!hasPool(s) || isReko(s)) s.tab = 'foto';
    return s;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const groupById = id => STEPS.flatMap(s => s.groups).find(g => g.id === id);
  const optionsOf = g => (typeof g.options === 'function' ? g.options(state) : g.options);
  const optLabel = (gid, oid) => (optionsOf(groupById(gid)).find(o => o.id === oid) || {}).label || '';
  const fmt = n => String(n).replace('.', ',');
  const visibleSteps = () => STEPS.filter(s => !s.when || s.when(state));
  const stepIndex = () => Math.max(0, visibleSteps().findIndex(s => s.id === stepId));

  function dims() {
    if (state.size === 'vlastni') return [Number(state.customW) || 3, Number(state.customL) || 6];
    return state.size.split('x').map(Number);
  }

  // ---------- vykreslení kroků ----------
  const body = $('#cfg-body');
  const stepper = $('#stepper');
  const prev = $('#cfg-prev');
  const next = $('#cfg-next');

  function renderStepper() {
    const steps = visibleSteps(), cur = stepIndex();
    stepper.innerHTML = steps.map((s, i) => `
      <li><button type="button" data-step="${s.id}" class="${i === cur ? 'is-active' : ''} ${i < cur ? 'is-done' : ''}" ${i === cur ? 'aria-current="step"' : ''}>
        <span class="stepper__num">${i + 1}</span><span class="stepper__label">${s.label}</span></button></li>`).join('');
  }

  function optionHTML(g, o) {
    const checked = state[g.id] === o.id;
    return `<label class="opt">
      <input type="radio" name="${g.id}" value="${o.id}" ${checked ? 'checked' : ''}>
      <span class="opt__box">
        <span class="opt__check" aria-hidden="true"></span>
        <span class="opt__title">${o.label}${o.tag ? `<em>${o.tag}</em>` : ''}</span>
        ${o.desc ? `<span class="opt__desc">${o.desc}</span>` : ''}
      </span></label>`;
  }

  function groupHTML(g) {
    if (g.showIf && !g.showIf(state)) return '';
    if (g.type === 'note') return `<p class="cfg-note">${typeof g.text === 'function' ? g.text(state) : g.text}</p>`;
    if (g.type === 'custom') {
      return `<fieldset class="group"><legend>${g.label}</legend><div class="custom-size">
        <label>Šířka (m)<input type="number" name="customW" min="2" max="8" step="0.5" value="${state.customW}" inputmode="decimal"></label>
        <span>×</span>
        <label>Délka (m)<input type="number" name="customL" min="3" max="20" step="0.5" value="${state.customL}" inputmode="decimal"></label>
      </div></fieldset>`;
    }
    const note = g.note ? g.note(state) : '';
    return `<fieldset class="group"><legend>${g.label}</legend>
      <div class="opts opts--${g.cols || 2}">${optionsOf(g).map(o => optionHTML(g, o)).join('')}</div>
      ${note ? `<p class="group__note">${note}</p>` : ''}</fieldset>`;
  }

  function renderBody() {
    const steps = visibleSteps(), i = stepIndex(), s = steps[i];
    if (s.id === 'odeslat') {
      body.innerHTML = summaryHTML();
      bindForm();
    } else {
      body.innerHTML = `<h2 class="cfg__title">${s.title}</h2>${s.lead ? `<p class="cfg__lead">${s.lead}</p>` : ''}${s.groups.map(groupHTML).join('')}`;
    }
    prev.disabled = i === 0;
    next.hidden = i === steps.length - 1;
    if (!next.hidden) {
      next.textContent = steps[i + 1].id === 'odeslat' ? (rekoOnly(state) ? 'Pokračovat na kontakt' : 'Shrnutí a odeslání') : `Další: ${steps[i + 1].label}`;
    }
    $('#cfg-count').textContent = `Krok ${i + 1} / ${steps.length}`;
  }

  function go(id) {
    stepId = id;
    renderStepper();
    renderBody();
    const panel = $('.cfg__panel');
    if (panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const goBy = d => { const steps = visibleSteps(); go(steps[Math.max(0, Math.min(steps.length - 1, stepIndex() + d))].id); };

  // ---------- změny voleb ----------
  body.addEventListener('change', e => {
    const el = e.target;
    if (!el.name || el.closest('.cfg-form')) return;
    if (el.name === 'customW' || el.name === 'customL') {
      state[el.name] = Math.max(Number(el.min), Math.min(Number(el.max), Number(el.value) || Number(el.min)));
      el.value = state[el.name];
    } else {
      state[el.name] = el.value;
    }
    normalize(state);
    autoPreview(el.name);
    save();
    update();
    renderStepper();
    // rekonstrukce vede rovnou na kontaktní formulář
    if (el.name === 'type' && isReko(state)) {
      renderBody();
      setTimeout(() => go(hasRoof(state) ? 'zastreseni' : 'odeslat'), 350);
      return;
    }
    if (['mode', 'type', 'material', 'size'].includes(el.name)) renderBody();
  });

  // náhled se sám přepne tam, kde je změna vidět
  function autoPreview(key) {
    if (['size', 'customW', 'customL', 'type', 'material', 'techPlace'].includes(key) && hasPool(state) && !isReko(state)) state.tab = 'plan';
    if (['mode', 'roof'].includes(key)) state.tab = 'foto';
  }

  stepper.addEventListener('click', e => {
    const b = e.target.closest('[data-step]');
    if (b) go(b.dataset.step);
  });
  prev.addEventListener('click', () => goBy(-1));
  next.addEventListener('click', () => goBy(1));

  // ---------- vizualizace ----------
  const stage = $('#viz-stage');

  $$('[data-time]').forEach(b => b.addEventListener('click', () => { state.time = b.dataset.time; update(); }));
  // se zastřešením je vizualizace vždy venkovní
  const hintEl = $('#viz-hint');
  let hintTimer;
  $$('[data-place]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.place === state.view) return;
    if (hasRoof(state)) {
      hintEl.querySelector('span').textContent = 'Zastřešení se montuje k venkovním bazénům, proto je náhled jen venkovní.';
      hintEl.hidden = false;
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => { hintEl.hidden = true; }, 5000);
      return;
    }
    state.view = b.dataset.place;
    update();
  }));
  hintEl.querySelector('button').addEventListener('click', () => { hintEl.hidden = true; go('co'); });
  $$('.viz__tabs [data-tab]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.tab === 'plan' && (!hasPool(state) || isReko(state))) return;
    state.tab = b.dataset.tab;
    update();
  }));

  function setupScenes() {
    $$('.scene').forEach(sc => { sc.style.aspectRatio = `1000 / ${SCENES[sc.dataset.scene].h}`; });
  }

  function updateScenes() {
    stage.dataset.tab = state.tab;
    stage.dataset.time = state.time;
    $$('.scene').forEach(sc => {
      sc.classList.toggle('is-active', sc.dataset.scene === state.view);
      sc.classList.toggle('is-night', state.time === 'noc');
      sc.classList.add('has-lights');
    });
    drawRoof();
    const planOff = !hasPool(state) || isReko(state);
    $$('[data-time]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time === state.time)));
    $$('[data-place]').forEach(b => {
      const on = b.dataset.place === state.view;
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-disabled', String(!on && hasRoof(state)));
      b.title = !on && hasRoof(state) ? 'Zastřešení je jen pro venkovní bazény' : '';
    });
    $$('.viz__tabs [data-tab]').forEach(b => {
      b.setAttribute('aria-selected', String(b.dataset.tab === state.tab));
      if (b.dataset.tab === 'plan') b.hidden = planOff;
    });
  }

  // zastřešení do venkovní fotky – 3D model promítnutý kamerou fotky
  function roofMarkup(time) {
    if (!hasRoof(state) || state.view !== 'venku') return '';
    const R = ROOFS[state.roof];
    const night = time === 'noc';
    const frame = ['#24292F', '#4A525C'];
    const fill = night ? 'rgba(150,190,255,.10)' : 'rgba(225,238,255,.16)';
    const P = p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    const line = pts => `M${pts.map(P).join(' L')}`;
    const px = (m, depth) => Math.max(0.6, m * CAM.f / depth);
    let out = `<defs><linearGradient id="roof-glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="${night ? 0.06 : 0.32}"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;

    if (R.profile === 'pergola') return out + pergolaMarkup(R, night, frame, P, line, px);

    const n = 5, y0 = -0.4, y1 = CAM.l + 0.35, seg = (y1 - y0) / n;
    // profil segmentu – teleskopické segmenty se směrem dozadu mírně zmenšují
    const profile = (i, y) => {
      const k = n - 1 - i, w = 4.75 - 0.1 * k, h = R.h - (R.h > 2 ? 0.07 : 0.045) * k;
      let xz;
      if (R.profile === 'round') {
        const K = 28;
        xz = Array.from({ length: K + 1 }, (_, j) => {
          const t = Math.PI * j / K, c = Math.cos(t), sn = Math.sin(t);
          return [-(w / 2) * Math.sign(c) * Math.abs(c) ** (2 / R.e), h * Math.abs(sn) ** (2 / R.e)];
        });
        return { pts: xz.map(([x, z]) => proj([CAM.w / 2 + x, y, z])), purl: [7, 14, 21], top: 14 };
      }
      const wall = R.wall - 0.03 * k, c = R.chamfer;
      xz = [[-w / 2, 0], [-w / 2, wall], [-w / 2 + c, h], [w / 2 - c, h], [w / 2, wall], [w / 2, 0]];
      return { pts: xz.map(([x, z]) => proj([CAM.w / 2 + x, y, z])), purl: [1, 2, 3, 4], top: 2 };
    };

    if (!night) {
      const shadow = [proj([-0.45, y0, 0]), proj([CAM.w + 0.45, y0, 0]), proj([CAM.w + 0.45, y1, 0]), proj([-0.45, y1, 0])];
      out += `<path d="${line(shadow)} Z" fill="rgba(10,20,40,.10)"/>`;
    }
    for (let i = 0; i < n; i++) {
      const ya = y0 + i * seg, yb = ya + seg + 0.12;
      const A = profile(i, ya), B = profile(i, yb);
      const last = A.pts.length - 1;
      const surface = `${line(A.pts)} L${[...B.pts].reverse().map(P).join(' L')} Z`;
      if (i === 0) out += `<path d="${line(A.pts)} Z" fill="${fill}"/><path d="${line(A.pts)} Z" fill="url(#roof-glass)" opacity=".5"/>`;
      out += `<path d="${surface}" fill="${fill}"/><path d="${surface}" fill="url(#roof-glass)"/>`;
      for (const j of A.purl) {
        out += `<path d="M${P(A.pts[j])} L${P(B.pts[j])}" stroke="${frame[0]}" stroke-width="${px(0.035, (A.pts[j][2] + B.pts[j][2]) / 2).toFixed(2)}" fill="none" opacity=".85"/>`;
      }
      for (const j of [0, last]) out += `<path d="M${P(A.pts[j])} L${P(B.pts[j])}" stroke="${frame[0]}" stroke-width="${px(0.07, B.pts[j][2]).toFixed(2)}" stroke-linecap="round"/>`;
      for (const arc of [A, B]) {
        const d = arc.pts[arc.top][2];
        out += `<path d="${line(arc.pts)}" stroke="${frame[0]}" stroke-width="${px(0.075, d).toFixed(2)}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
        out += `<path d="${line(arc.pts)}" stroke="${frame[1]}" stroke-width="${px(0.022, d).toFixed(2)}" fill="none" opacity="${night ? 0.35 : 0.8}" transform="translate(0 -${px(0.025, d).toFixed(2)})"/>`;
      }
    }
    return out;
  }

  // lamelová pergola: čtyři sloupy, obvodový rám a natočené lamely napříč bazénem.
  // Fotoaparát stojí těsně u bližšího konce bazénu, proto pergola končí kousek před ním.
  function pergolaMarkup(R, night, frame, P, line, px) {
    const x0 = -0.4, x1 = CAM.w + 0.4, y0 = -0.5, y1 = CAM.l - 1.9, H = R.h, step = 0.3;
    let out = '';
    if (!night) {
      // pruhovaný stín lamel na dlažbě a hladině
      for (let y = y0; y < y1; y += step) {
        const q = [proj([x0 + 0.5, y + 0.3, 0]), proj([x1 + 0.5, y + 0.3, 0]), proj([x1 + 0.5, y + 0.4, 0]), proj([x0 + 0.5, y + 0.4, 0])];
        out += `<path d="${line(q)} Z" fill="rgba(10,20,40,.12)"/>`;
      }
    }
    const post = (x, y) => {
      const a = proj([x, y, 0]), b = proj([x, y, H]);
      return `<path d="M${P(a)} L${P(b)}" stroke="${frame[0]}" stroke-width="${px(0.12, (a[2] + b[2]) / 2).toFixed(2)}" stroke-linecap="square"/>`;
    };
    out += post(x0, y0) + post(x1, y0);
    // střecha z lamel – poloprůhledná plocha s linkami lamel, aby zůstalo vidět, co je pod ní
    const roofPlane = [proj([x0, y0, H]), proj([x1, y0, H]), proj([x1, y1, H]), proj([x0, y1, H])];
    out += `<path d="${line(roofPlane)} Z" fill="${night ? 'rgba(20,26,34,.55)' : 'rgba(46,53,62,.42)'}"/>`;
    for (let y = y0 + step; y < y1 - 0.05; y += step) {
      const pa = proj([x0, y, H]), pb = proj([x1, y, H]);
      out += `<path d="M${P(pa)} L${P(pb)}" stroke="${night ? '#3A424C' : '#C9D0D8'}" stroke-width="${px(0.03, (pa[2] + pb[2]) / 2).toFixed(2)}" opacity=".9"/>`;
    }
    // obvodový rám
    for (const [a, b] of [[[x0, y0], [x1, y0]], [[x1, y0], [x1, y1]], [[x0, y0], [x0, y1]], [[x0, y1], [x1, y1]]]) {
      const pa = proj([a[0], a[1], H]), pb = proj([b[0], b[1], H]);
      out += `<path d="M${P(pa)} L${P(pb)}" stroke="${frame[0]}" stroke-width="${px(0.16, (pa[2] + pb[2]) / 2).toFixed(2)}" stroke-linecap="square"/>`;
    }
    out += post(x0, y1) + post(x1, y1);
    return out;
  }

  function drawRoof() {
    $('.scene[data-scene="venku"] .scene__roof').innerHTML = roofMarkup(state.time);
  }

  // ---------- půdorys ----------
  function planMarkup(id = 'plan') {
    if (!hasPool(state) || isReko(state)) return '';
    const [W, L] = dims();
    const VW = 640, VH = 420;
    const sc = Math.min(430 / L, 230 / W);
    const pw = L * sc, ph = W * sc;
    const x0 = (VW - pw) / 2, y0 = (VH - ph) / 2 + 6;
    let g = '';

    g += `<rect x="${x0 - 40}" y="${y0 - 40}" width="${pw + 80}" height="${ph + 80}" rx="30" fill="var(--plan-deck)"/>`;
    if (state.type === 'preliv') {
      g += `<rect x="${x0 - 16}" y="${y0 - 16}" width="${pw + 32}" height="${ph + 32}" rx="14" fill="none" stroke="var(--plan-grate)" stroke-width="9" stroke-dasharray="2 3"/>`;
    }
    g += `<rect x="${x0 - 9}" y="${y0 - 9}" width="${pw + 18}" height="${ph + 18}" rx="8" fill="#E9EDF1"/>`;
    g += `<rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" rx="2" fill="url(#${id}-water)"/>`;

    if (state.type === 'skimmer') {
      [0.22, 0.5].forEach(f => { g += `<rect x="${x0 + pw * f - 9}" y="${y0 - 7}" width="18" height="9" rx="2" fill="#E8EEF5" stroke="#4A5668" stroke-width="1"/>`; });
    }
    [0.3, 0.7].forEach(f => { g += `<circle cx="${x0 + pw * f}" cy="${y0 + ph}" r="3.5" fill="#E8EEF5" stroke="#4A5668"/>`; });

    // zastřešení – obrys, u lamelové pergoly sloupy v rozích
    if (hasRoof(state)) {
      const pad = 22, n = state.roof === 'lamelove' ? 12 : 5;
      g += `<rect x="${x0 - pad}" y="${y0 - pad}" width="${pw + pad * 2}" height="${ph + pad * 2}" rx="6" fill="rgba(200,220,255,.10)" stroke="var(--plan-line)" stroke-width="1.5" stroke-dasharray="6 4"/>`;
      for (let i = 1; i < n; i++) g += `<line x1="${x0 - pad + (pw + pad * 2) * i / n}" y1="${y0 - pad}" x2="${x0 - pad + (pw + pad * 2) * i / n}" y2="${y0 + ph + pad}" stroke="var(--plan-line)" stroke-width="1" stroke-dasharray="3 4"/>`;
      if (state.roof === 'lamelove') {
        for (const [cx, cy] of [[x0 - pad, y0 - pad], [x0 + pw + pad, y0 - pad], [x0 - pad, y0 + ph + pad], [x0 + pw + pad, y0 + ph + pad]]) {
          g += `<rect x="${cx - 6}" y="${cy - 6}" width="12" height="12" fill="var(--plan-line)"/>`;
        }
      }
    }

    if (state.techPlace === 'sachta') {
      g += `<rect x="${x0 + pw + 44}" y="${y0 + ph - 30}" width="30" height="30" rx="3" fill="var(--plan-tech)" stroke="var(--plan-line)"/>
        <text x="${x0 + pw + 59}" y="${y0 + ph + 16}" class="plan__small" text-anchor="middle">šachta</text>`;
    } else {
      g += `<path d="M${x0 + pw + 9},${y0 + ph - 14} H${x0 + pw + 60}" stroke="var(--plan-line)" stroke-dasharray="4 3"/>
        <text x="${x0 + pw + 64}" y="${y0 + ph - 10}" class="plan__small">technologie</text>`;
    }

    const ky = y0 - 58;
    g += `<g class="plan__dim"><line x1="${x0}" y1="${ky}" x2="${x0 + pw}" y2="${ky}"/><line x1="${x0}" y1="${ky - 6}" x2="${x0}" y2="${ky + 6}"/><line x1="${x0 + pw}" y1="${ky - 6}" x2="${x0 + pw}" y2="${ky + 6}"/></g>
      <text x="${x0 + pw / 2}" y="${ky - 8}" text-anchor="middle" class="plan__label">${fmt(L)} m</text>`;
    const kx = x0 - 58;
    g += `<g class="plan__dim"><line x1="${kx}" y1="${y0}" x2="${kx}" y2="${y0 + ph}"/><line x1="${kx - 6}" y1="${y0}" x2="${kx + 6}" y2="${y0}"/><line x1="${kx - 6}" y1="${y0 + ph}" x2="${kx + 6}" y2="${y0 + ph}"/></g>
      <text x="${kx - 10}" y="${y0 + ph / 2}" text-anchor="middle" class="plan__label" transform="rotate(-90 ${kx - 10} ${y0 + ph / 2})">${fmt(W)} m</text>`;
    g += `<text x="${x0 + pw / 2}" y="${y0 + ph / 2 + 5}" text-anchor="middle" class="plan__depth">${MATERIALS[state.material].label} bazén</text>`;

    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Půdorys bazénu ${fmt(W)} × ${fmt(L)} m">
      <defs><linearGradient id="${id}-water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58B8F0"/><stop offset="1" stop-color="#1F7FD0"/></linearGradient></defs>
      ${g}</svg>`;
  }

  function drawPlan() {
    $('#plan').innerHTML = planMarkup();
  }

  // ---------- souhrn ----------
  const MODE_LABEL = { bazen: 'Bazén', zastreseni: 'Zastřešení', oboji: 'Bazén a zastřešení' };

  function chips() {
    const [W, L] = dims();
    const items = [];
    if (hasPool(state)) {
      if (isReko(state)) items.push('Rekonstrukce bazénu');
      else items.push(optLabel('type', state.type), `${MATERIALS[state.material].label} bazén`, `${fmt(W)} × ${fmt(L)} m`, optLabel('techPlace', state.techPlace));
    }
    if (hasRoof(state)) items.push(`Zastřešení ${ROOFS[state.roof].label.toLowerCase()}`);
    $('#viz-chips').innerHTML = items.map(t => `<li>${t}</li>`).join('');
  }

  function summaryRows() {
    const [W, L] = dims();
    const rows = [['Poptávka', [['Zájem', MODE_LABEL[state.mode]]]]];
    if (hasPool(state)) {
      rows.push(['Bazén', isReko(state) ? [['Typ', 'Rekonstrukce bazénu']] : [
        ['Typ', optLabel('type', state.type)],
        ['Konstrukce', MATERIALS[state.material].label],
        ['Rozměr', `${fmt(W)} × ${fmt(L)} m`],
      ]]);
    }
    if (hasPool(state) && !isReko(state)) rows.push(['Technologie', [['Umístění', optLabel('techPlace', state.techPlace)]]]);
    if (hasRoof(state)) rows.push(['Zastřešení', [['Typ', ROOFS[state.roof].label]]]);
    if (hasPool(state) && !isReko(state)) {
      rows.push(['Montáž a servis', [
        ['Montáž a zprovoznění', 'Součástí dodávky'],
        ['Stavební práce', optLabel('stavba', state.stavba)],
      ]]);
    }
    return rows;
  }

  function subject() {
    if (isReko(state)) return hasRoof(state) ? 'Rekonstrukce bazénu a zastřešení' : 'Rekonstrukce bazénu';
    return state.mode === 'zastreseni' ? 'Konfigurace zastřešení' : 'Konfigurace bazénu';
  }

  function configCode() {
    const str = JSON.stringify({ ...state, time: 0, tab: 0, view: 0 });
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    const d = new Date();
    return `XP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${h.toString(36).toUpperCase().slice(-4).padStart(4, '0')}`;
  }

  function summaryText() {
    return summaryRows().map(([h, items]) => `${h.toUpperCase()}\n` + items.map(([k, v]) => `  ${k}: ${v}`).join('\n')).join('\n\n');
  }

  function branchOptions() {
    const b = window.XPOOLS_BRANCHES;
    if (!b) return '';
    const opt = list => list.map(x => `<option>${x.city}</option>`).join('');
    return `<div class="field field--full"><label for="c-branch">Nejbližší pobočka</label>
      <select id="c-branch" name="branch"><option value="">Nevím / je mi to jedno</option>
        <optgroup label="Hlavní pobočky">${opt(b.main)}</optgroup><optgroup label="Regionální zastoupení">${opt(b.regional)}</optgroup></select></div>`;
  }

  function summaryHTML() {
    const reko = isReko(state), only = rekoOnly(state);
    return `<h2 class="cfg__title">${only ? 'Rekonstrukce bazénu' : 'Vaše konfigurace je připravená'}</h2>
      <p class="cfg__lead">${only
        ? 'Napište nám, co je potřeba, a ozveme se vám. Domluvíme prohlídku a navrhneme řešení.'
        : 'Zkontrolujte souhrn, doplňte kontakt a pošlete nám ji. Ozveme se vám s nezávaznou cenovou nabídkou.'}</p>
      ${only ? '' : `<div class="summary">${summaryRows().map(([h, items]) => `
        <div class="summary__block"><h3>${h}</h3><dl>${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`).join('')}
      </div>`}
      <div class="summary__actions">
        <button type="button" class="link-btn" data-go="co">${only ? 'Zpět na výběr' : 'Upravit konfiguraci'}</button>
        ${only ? '' : `<button type="button" class="btn btn--ghost btn--sm" id="cfg-print">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Stáhnout PDF s konfigurací</button>`}
      </div>

      <form class="form cfg-form" id="cfg-form" action="send.php" method="post" novalidate>
        <h3 class="form__title">${only ? 'Kontaktní údaje' : 'Kam vám pošleme nabídku?'}</h3>
        <input type="hidden" name="subject" value="${subject()}">
        <div class="form__grid">
          <div class="field"><label for="c-name">Jméno a příjmení *</label><input id="c-name" name="name" autocomplete="name" required><small class="field__error">Vyplňte prosím jméno.</small></div>
          <div class="field"><label for="c-email">E-mail *</label><input id="c-email" name="email" type="email" autocomplete="email" inputmode="email" required><small class="field__error">Zadejte prosím platný e-mail.</small></div>
          <div class="field"><label for="c-phone">Telefon *</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+420" required><small class="field__error">Zadejte prosím telefon.</small></div>
          <div class="field"><label for="c-place">Obec / místo realizace *</label><input id="c-place" name="place" autocomplete="address-level2" placeholder="Obec nebo PSČ" required><small class="field__error">Vyplňte prosím obec nebo PSČ.</small></div>
          ${branchOptions()}
          ${only ? '' : `<div class="field field--full"><label for="c-term">Kdy plánujete realizaci?</label>
            <select id="c-term" name="term"><option>Co nejdříve</option><option>Příští sezónu</option><option>Do dvou let</option><option>Zatím jen zjišťuji možnosti</option></select></div>`}
          <div class="field field--full"><label for="c-note">${reko ? 'Popište svůj bazén a co potřebujete *' : 'Poznámka'}</label>
            <textarea id="c-note" name="note" rows="${reko ? 5 : 3}" ${reko ? 'required' : ''} placeholder="${reko
              ? 'Např. typ a rozměr bazénu, stáří, co nefunguje, co chcete vyměnit…'
              : 'Např. svažitý pozemek, stávající bazén k výměně…'}"></textarea>
            <small class="field__error">Napište nám prosím pár slov o bazénu.</small></div>
        </div>
        <div class="hp" aria-hidden="true"><label for="c-web">Web</label><input id="c-web" name="website" tabindex="-1" autocomplete="off"></div>
        <input type="hidden" name="ts" value="${Date.now()}">
        <label class="consent"><input type="checkbox" name="consent" value="1" required><span>Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.</span></label>
        <small class="field__error field__error--consent">Pro odeslání je potřeba souhlas.</small>
        <button type="submit" class="btn btn--primary btn--block"><span class="btn__label">${only ? 'Odeslat poptávku' : 'Odeslat konfiguraci'}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>
        <p class="form__status" role="status" aria-live="polite"></p>
      </form>`;
  }

  function bindForm() {
    $('[data-go]', body).addEventListener('click', () => go('co'));
    const printBtn = $('#cfg-print');
    if (printBtn) printBtn.addEventListener('click', printDoc);
    const form = $('#cfg-form');
    const status = $('.form__status', form);
    const button = $('button[type="submit"]', form);
    const label = $('.btn__label', button);
    const idleLabel = label.textContent;
    const consentError = $('.field__error--consent', form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const reko = isReko(state);

    form.addEventListener('input', e => {
      const f = e.target.closest('.field');
      if (f) f.classList.remove('is-invalid');
      if (e.target.name === 'consent' && e.target.checked) consentError.classList.remove('is-visible');
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const checks = [
        ['name', form.elements.name.value.trim().length >= 2],
        ['email', emailRe.test(form.elements.email.value.trim())],
        ['phone', form.elements.phone.value.replace(/\D/g, '').length >= 9],
        ['place', form.elements.place.value.trim().length >= 2],
        ['note', !reko || form.elements.note.value.trim().length >= 5],
      ];
      checks.forEach(([n, ok]) => form.elements[n].closest('.field').classList.toggle('is-invalid', !ok));
      consentError.classList.toggle('is-visible', !form.elements.consent.checked);
      const bad = checks.find(([, ok]) => !ok);
      if (bad) return form.elements[bad[0]].focus();
      if (!form.elements.consent.checked) return;

      const data = new FormData(form);
      const note = data.get('note').trim();
      data.set('message', rekoOnly(state) ? note : `${reko ? `Rekonstrukce bazénu – popis: ${note}\n\n` : ''}Termín realizace: ${data.get('term')}${reko ? '' : `\n\nPoznámka: ${note || '—'}`}`);
      data.set('config', summaryText());
      button.disabled = true;
      label.textContent = 'Odesílám…';
      status.className = 'form__status';
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json || !json.ok) throw new Error('send-failed');
        form.classList.add('is-sent');
        status.classList.add('is-success');
        status.textContent = reko
          ? 'Děkujeme! Poptávku jsme přijali a brzy se vám ozveme.'
          : 'Děkujeme! Konfiguraci jsme přijali a brzy se vám ozveme s nabídkou.';
      } catch (err) {
        status.classList.add('is-error');
        status.innerHTML = `Odeslání se nepodařilo. Otevírám váš e-mailový program… Případně nám napište na <a href="mailto:${CONTACT_EMAIL}" style="text-decoration:underline">${CONTACT_EMAIL}</a>.`;
        const mail = `Jméno: ${data.get('name')}\nE-mail: ${data.get('email')}\nTelefon: ${data.get('phone') || '-'}\nMísto: ${data.get('place') || '-'}\nPobočka: ${data.get('branch') || '-'}\n\n${data.get('message')}\n\n${data.get('config')}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject() + ' – ' + data.get('name'))}&body=${encodeURIComponent(mail)}`;
      } finally {
        button.disabled = false;
        label.textContent = idleLabel;
      }
    });
  }

  // ---------- PDF dokument (tisk) ----------
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // složí vizualizaci (fotka + zastřešení) do jednoho obrázku
  async function renderScene(time) {
    const cfg = SCENES[state.view];
    const src = `assets/img/konfigurator/${state.view}-${time === 'noc' ? 'noc-svetla' : 'den'}.jpg`;
    try {
      const base = await loadImg(src);
      const W = 1600, H = Math.round(W * cfg.h / 1000);
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.drawImage(base, 0, 0, W, H);
      const roof = roofMarkup(time);
      if (roof) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${cfg.h}" width="${W}" height="${H}" preserveAspectRatio="none">${roof}</svg>`;
        ctx.drawImage(await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)), 0, 0, W, H);
      }
      return c.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      return src; // např. při otevření ze souboru (file://) prohlížeč nedovolí export plátna
    }
  }

  async function buildPrintDoc() {
    if (rekoOnly(state)) { $('#print-doc').innerHTML = ''; return; }
    const [day, night] = await Promise.all([renderScene('den'), renderScene('noc')]);
    const [W, L] = dims();
    const pool = newPool(state), roof = hasRoof(state);
    const roofLabel = roof ? ROOFS[state.roof].label : '';
    const date = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
    const code = configCode();
    const form = $('#cfg-form');
    const val = n => (form && form.elements[n] ? form.elements[n].value.trim() : '');
    const client = val('name') ? [['Jméno', val('name')], ['E-mail', val('email')], ['Telefon', val('phone')], ['Místo realizace', val('place')],
      ['Pobočka', val('branch')], ['Plánovaná realizace', val('term')]].filter(r => r[1]) : null;
    const headline = pool
      ? `${optLabel('type', state.type)} ${MATERIALS[state.material].label.toLowerCase()} bazén ${fmt(W)} × ${fmt(L)} m`
      : `Zastřešení bazénu ${roofLabel.toLowerCase()}`;
    const sub = pool
      ? [optLabel('techPlace', state.techPlace), roof ? `zastřešení ${roofLabel.toLowerCase()}` : null, optLabel('stavba', state.stavba)].filter(Boolean).join(' · ')
      : (isReko(state) ? `Rekonstrukce stávajícího bazénu · ${ROOFS[state.roof].desc}` : ROOFS[state.roof].desc);
    const kpis = pool
      ? [['Rozměr', `${fmt(W)} × ${fmt(L)} m`], ['Typ', optLabel('type', state.type)], ['Konstrukce', MATERIALS[state.material].label],
        roof ? ['Zastřešení', roofLabel] : ['Technologie', state.techPlace === 'sachta' ? 'Šachta' : 'Stěna']]
      : [['Typ zastřešení', roofLabel],
        ['Tvar', { round: 'Půlkulatý', angular: 'Hranatý', pergola: 'Lamelová pergola' }[ROOFS[state.roof].profile]],
        ['Výška', ROOFS[state.roof].h >= 2 ? 'Podchozí' : 'Nízké / střední']];
    const head = (small) => `<header class="pd-head ${small ? 'pd-head--small' : ''}">
        <img src="assets/logo/xpools-logo-color-dark.svg" alt="XPOOLS">
        <div class="pd-head__meta"><span>${pool ? 'Konfigurace bazénu' : 'Konfigurace zastřešení'}</span><strong>${code}</strong><span>${date}</span></div></header>`;
    const foot = (n) => `<footer class="pd-foot"><span>XPOOLS · prodej, montáž a servis bazénů</span><span>+420 000 000 000 · info@xpools.cz</span><span>${n} / 2</span></footer>`;
    const rows = summaryRows();
    const block = ([h, items]) => `<div class="pd-spec__block"><h3>${h}</h3><dl>${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
    const col = names => rows.filter(([h]) => names.includes(h)).map(block).join('');

    $('#print-doc').innerHTML = `
      <section class="pd-sheet">
        ${head(false)}
        <div class="pd-body">
          <p class="pd-kicker">${pool ? 'Váš bazén' : 'Vaše zastřešení'}</p>
          <h1 class="pd-title">${headline}</h1>
          <p class="pd-sub">${sub}</p>
          <figure class="pd-hero"><img src="${day}" alt=""><figcaption>Ve dne</figcaption></figure>
          <div class="pd-row ${pool ? '' : 'pd-row--single'}">
            <figure class="pd-night"><img src="${night}" alt=""><figcaption>V noci</figcaption></figure>
            ${pool ? `<figure class="pd-plan">${planMarkup('pd-plan')}<figcaption>Půdorys</figcaption></figure>` : ''}
          </div>
          <div class="pd-kpis" style="grid-template-columns: repeat(${kpis.length}, 1fr)">${kpis.map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>
          <p class="pd-note">Vizualizace je ilustrační a slouží k představě o vzhledu. Konfigurace není objednávkou ani závaznou cenovou nabídkou.</p>
        </div>
        ${foot(1)}
      </section>
      <section class="pd-sheet">
        ${head(true)}
        <div class="pd-body">
          <p class="pd-kicker">Specifikace</p>
          <h2 class="pd-h2">Co jste si vybrali</h2>
          <div class="pd-spec">
            <div class="pd-spec__col">${col(['Poptávka', 'Bazén', 'Montáž a servis'])}</div>
            <div class="pd-spec__col">${col(['Technologie', 'Zastřešení'])}</div>
          </div>
          <div class="pd-bottom">
            ${client
              ? `<div class="pd-client"><h3>Zpracováno pro</h3><dl>${client.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`
              : '<div class="pd-client pd-client--notes"><h3>Poznámky</h3><div class="pd-lines"></div></div>'}
            <div class="pd-next">
              <h3>Co bude následovat</h3>
              <ol class="pd-steps">
                <li><strong>Ozveme se vám</strong><span>Projdeme konfiguraci a doplníme, co je potřeba.</span></li>
                <li><strong>Zaměření na místě</strong><span>Prohlédneme pozemek, přístup a možnosti napojení.</span></li>
                <li><strong>Cenová nabídka</strong><span>Připravíme přehlednou nabídku a termín realizace.</span></li>
              </ol>
            </div>
          </div>
          <div class="pd-contact">
            <div><strong>Máte otázky? Rádi poradíme.</strong><span>Konfiguraci si uložte – stačí nám sdělit její kód <b>${code}</b>.</span></div>
            <div class="pd-contact__links"><span>+420 000 000 000</span><span>info@xpools.cz</span><span>www.xpools.cz</span></div>
          </div>
        </div>
        ${foot(2)}
      </section>`;
    await Promise.all($$('#print-doc img').map(img => (img.complete ? null : new Promise(r => { img.onload = img.onerror = r; }))));
  }

  async function printDoc() {
    const btn = $('#cfg-print');
    if (btn) btn.disabled = true;
    try {
      await buildPrintDoc();
      window.print();
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // dokument pro tisk držíme připravený i pro tisk přes Ctrl+P
  let printTimer;
  const schedulePrintDoc = () => { clearTimeout(printTimer); printTimer = setTimeout(buildPrintDoc, 800); };

  function update() {
    updateScenes();
    drawPlan();
    chips();
    schedulePrintDoc();
  }

  setupScenes();
  renderStepper();
  renderBody();
  update();
})();
