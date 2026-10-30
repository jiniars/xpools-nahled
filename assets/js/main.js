// XPOOLS – interakce webu
(() => {
  const CONTACT_EMAIL = 'info@xpools.cz'; // záložní adresa, pokud server neumí odeslat formulář

  const header = document.querySelector('.header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const form = document.getElementById('contact-form');
  const mobileBar = document.querySelector('.mobile-bar');

  // --- hlavička při scrollu ---
  // v konfigurátoru je hlavička pevná – pod ní není tmavá fotka
  const solidHeader = document.body.classList.contains('page-konfigurator');
  const onScroll = () => header.classList.toggle('is-scrolled', solidHeader || window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- mobilní menu ---
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    document.body.classList.toggle('nav-open', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // --- tlačítka s data-subject předvyplní typ poptávky ---
  if (form) document.querySelectorAll('[data-subject]').forEach(el => {
    el.addEventListener('click', () => {
      const radio = form.querySelector(`input[name="subject"][value="${el.dataset.subject}"]`);
      if (radio) radio.checked = true;
    });
  });

  // --- postupné zobrazení obsahu ---
  const revealEls = document.querySelectorAll('.section__head, .card, .step, .feature, .gallery__item, .split__media, .split__text, .faq details, .contact__info, .form, .cta-band__inner, .product, .pstep, .real');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });

    // mobilní lišta se schová, když je formulář na obrazovce
    const contact = document.getElementById('kontakt');
    if (mobileBar && contact) {
      new IntersectionObserver(([entry]) => mobileBar.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.15 })
        .observe(contact);
    }
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // --- formulář (jen na úvodní stránce) ---
  if (!form) return;
  document.getElementById('f-ts').value = Date.now();

  // odkaz z produktové stránky: index.html?tema=Terasy&produkt=…#kontakt
  const params = new URLSearchParams(location.search);
  const tema = params.get('tema'), produkt = params.get('produkt');
  if (tema) {
    const radio = form.querySelector(`input[name="subject"][value="${CSS.escape(tema)}"]`);
    if (radio) radio.checked = true;
  }
  if (produkt) form.elements.message.value = `Mám zájem o: ${produkt}\n\n`;
  const status = form.querySelector('.form__status');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('.btn__label');
  const consentError = form.querySelector('.field__error--consent');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate() {
    let ok = true;
    const check = (name, valid) => {
      const field = form.elements[name].closest('.field');
      field.classList.toggle('is-invalid', !valid);
      if (!valid && ok) form.elements[name].focus();
      ok = ok && valid;
    };
    check('name', form.elements.name.value.trim().length >= 2);
    check('email', emailRe.test(form.elements.email.value.trim()));
    check('phone', form.elements.phone.value.replace(/\D/g, '').length >= 9);
    check('place', form.elements.place.value.trim().length >= 2);
    check('message', form.elements.message.value.trim().length >= 5);
    const consent = form.elements.consent.checked;
    consentError.classList.toggle('is-visible', !consent);
    return ok && consent;
  }

  form.addEventListener('input', e => {
    const field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid')) field.classList.remove('is-invalid');
    if (e.target.name === 'consent' && e.target.checked) consentError.classList.remove('is-visible');
  });

  function mailtoFallback(data) {
    const body = [
      `Typ poptávky: ${data.get('subject')}`,
      `Jméno: ${data.get('name')}`,
      `E-mail: ${data.get('email')}`,
      `Telefon: ${data.get('phone') || '-'}`,
      `Místo realizace: ${data.get('place') || '-'}`,
      `Pobočka: ${data.get('branch') || '-'}`,
      '',
      data.get('message'),
    ].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Poptávka z webu – ' + data.get('subject'))}&body=${encodeURIComponent(body)}`;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    if (!validate()) return;

    const data = new FormData(form);
    button.disabled = true;
    label.textContent = 'Odesílám…';

    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || !json.ok) throw new Error((json && json.error) || 'send-failed');
      form.classList.add('is-sent');
      status.classList.add('is-success');
      status.textContent = 'Děkujeme! Zpráva byla odeslána. Ozveme se vám co nejdříve.';
    } catch (err) {
      status.classList.add('is-error');
      status.innerHTML = 'Zprávu se nepodařilo odeslat. Otevírám váš e-mailový program… Případně nám napište přímo na ' +
        `<a href="mailto:${CONTACT_EMAIL}" style="text-decoration:underline">${CONTACT_EMAIL}</a>.`;
      mailtoFallback(data);
    } finally {
      button.disabled = false;
      label.textContent = 'Odeslat zprávu';
    }
  });
})();

// upoutávka na konfigurátor: střídání dne a noci
(() => {
  const media = document.querySelector('.cfg-teaser__media');
  if (!media || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const btns = media.querySelectorAll('.seg__item');
  setInterval(() => {
    const night = media.classList.toggle('is-night');
    btns[0].setAttribute('aria-pressed', String(!night));
    btns[1].setAttribute('aria-pressed', String(night));
  }, 3500);
})();

// pobočky: propojení mapy, seznamu a výběru pobočky ve formuláři
(() => {
  const data = window.XPOOLS_BRANCHES;
  const select = document.getElementById('f-branch');
  if (select && data) {
    const group = (label, list) => `<optgroup label="${label}">${list.map(b => `<option>${b.city}</option>`).join('')}</optgroup>`;
    select.insertAdjacentHTML('beforeend', group('Hlavní pobočky', data.main) + group('Regionální zastoupení', data.regional));
  }
  const section = document.getElementById('pobocky');
  if (!section) return;
  const items = section.querySelectorAll('[data-city]');
  const detail = document.getElementById('branch-detail');
  let selected = null;
  const setActive = city => items.forEach(el => el.classList.toggle('is-active', el.dataset.city === city));
  const toForm = city => {
    if (!select) return;
    select.value = city;
    document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
    select.classList.remove('is-flash');
    setTimeout(() => select.classList.add('is-flash'), 600);
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICO = {
    tel: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    time: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };
  const showDetail = b => {
    const initials = b.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    detail.innerHTML = `<button type="button" class="branch-detail__close" aria-label="Zavřít">×</button>
      <span class="branch-detail__city">Pobočka ${esc(b.city)}</span>
      <div class="branch-detail__person"><span class="branch-detail__avatar" aria-hidden="true">${esc(initials)}</span>
        <div><strong>${esc(b.name)}</strong><small>${esc(b.role)}</small></div></div>
      <ul>
        <li>${ICO.tel}<a href="tel:${esc(b.phone.replace(/\s/g, ''))}">${esc(b.phone)}</a></li>
        <li>${ICO.mail}<a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>
        <li>${ICO.pin}${esc(b.address)}</li>
        <li>${ICO.time}${esc(b.hours)}</li>
      </ul>
      <button type="button" class="btn btn--primary btn--sm btn--block" data-to-form>Poslat poptávku této pobočce</button>`;
    detail.hidden = false;
    detail.querySelector('.branch-detail__close').addEventListener('click', () => { detail.hidden = true; selected = null; setActive(null); });
    detail.querySelector('[data-to-form]').addEventListener('click', () => toForm(b.city));
    const r = detail.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const choose = city => {
    selected = city;
    setActive(city);
    const main = data && data.main.find(b => b.city === city);
    if (main && main.name && detail) showDetail(main);
    else toForm(city);
  };
  items.forEach(el => {
    el.addEventListener('mouseenter', () => setActive(el.dataset.city));
    el.addEventListener('focus', () => setActive(el.dataset.city));
    el.addEventListener('click', () => choose(el.dataset.city));
    if (el.matches('.pin')) {
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(el.dataset.city); } });
    }
  });
  section.querySelector('.branches').addEventListener('mouseleave', () => setActive(selected));
})();

// galerie produktů a realizací: náhledy + lightbox
(() => {
  const boxes = document.querySelectorAll('.gallery-box[data-photos], .real[data-photos]');
  if (!boxes.length) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = `<div class="lightbox__img"><img alt=""></div><span class="lightbox__count"></span>
    <button type="button" class="lightbox__prev" aria-label="Předchozí">‹</button>
    <button type="button" class="lightbox__next" aria-label="Další">›</button>
    <button type="button" class="lightbox__close" aria-label="Zavřít">×</button>`;
  document.body.appendChild(dlg);
  const img = dlg.querySelector('img'), count = dlg.querySelector('.lightbox__count');
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length;
    img.src = list[idx];
    count.textContent = `${idx + 1} / ${list.length}`;
    dlg.querySelector('.lightbox__prev').hidden = dlg.querySelector('.lightbox__next').hidden = list.length < 2;
  };
  const open = (photos, i) => { list = photos; show(i); dlg.showModal(); };
  dlg.querySelector('.lightbox__prev').addEventListener('click', () => show(idx - 1));
  dlg.querySelector('.lightbox__next').addEventListener('click', () => show(idx + 1));
  dlg.querySelector('.lightbox__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('lightbox__img')) dlg.close(); });
  dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });

  boxes.forEach(box => {
    const photos = JSON.parse(box.dataset.photos);
    if (box.classList.contains('real')) {
      box.querySelectorAll('.real__item').forEach((el, i) => el.addEventListener('click', () => open(photos, i)));
      return;
    }
    const main = box.querySelector('.gallery-box__main img');
    let current = 0;
    box.querySelectorAll('.gallery-box__thumb').forEach((t, i) => t.addEventListener('click', () => {
      current = i;
      main.src = photos[i];
      box.querySelectorAll('.gallery-box__thumb').forEach(x => x.classList.toggle('is-active', x === t));
    }));
    box.querySelector('.gallery-box__main').addEventListener('click', () => open(photos, current));
  });
})();

// světlý / tmavý režim: každé načtení stránky se řídí systémem (skript v <head>). Tlačítko přepne režim
// a volba se přenese jen při kliknutí na odkaz uvnitř webu; změna režimu v systému ji zruší.
(() => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: light)');
  const current = () => root.dataset.theme || (system.matches ? 'light' : 'dark');
  const store = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* nevadí */ } };
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = window.__xpT = next;
    store('xpools-theme', next);
  }));
  system.addEventListener('change', () => {
    delete root.dataset.theme;
    window.__xpT = 'system';
    store('xpools-theme', null);
  });
  // proklik na jinou stránku webu – ruční volba se přenese
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !root.dataset.theme || a.target === '_blank' || a.origin !== location.origin) return;
    store('xpools-theme-nav', Date.now());
  });
})();
