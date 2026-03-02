/* ================================================================
   ENCYCLOPEDIA — Shared JS for hub, zhuz, and tribe pages
   Reads data from TRIBES_DB (data/tribes.js)
   i18n: KK primary, RU secondary (localStorage 'shejire-lang')
   ================================================================ */

'use strict';

/* ── i18n translations ──────────────────────────────────────────── */

const ENC_TRANSLATIONS = {
  kk: {
    'nav.home':      'Басты бет',
    'nav.enc':       'Энциклопедия',
    'bc.home':       'Шежіре',
    'bc.enc':        'Энциклопедия',
    'hub.title':     'Қазақ рулары энциклопедиясы',
    'hub.sub':       'Ұлы, Орта, Кіші жүз және Жүзден тыс — 47 рудың толық тарихы',
    'hub.tribes':    'ру',
    'hub.open':      'Толығырақ',
    'zhuz.tribes_heading': 'Рулар',
    'tribe.region':  'Қоныс аймақ',
    'tribe.tamga':   'Тамға',
    'tribe.uran':    'Ұран',
    'tribe.subgroup':'Топ',
    'tribe.notable': 'Атақты тұлғалар',
    'tribe.more':    'Толығырақ →',
    'pager.prev':    '← Алдыңғы',
    'pager.next':    'Келесі →',
    'cta.title':     'Шежіре жасау',
    'cta.desc':      'Ата-тегіңіздің тарихын сақтаңыз',
    'cta.btn':       'Шежіре жасау',
    'footer.tagline':'Болашақ ұрпақтар үшін ата-тек тарихын сақтаймыз',
    'footer.copy':   '© 2024 Шежіре',
    'notfound.title':'Бет табылмады',
    'notfound.desc': 'Сілтеме қате немесе бет жоқ.',
    'notfound.back': '← Энциклопедияға оралу',
  },
  ru: {
    'nav.home':      'Главная',
    'nav.enc':       'Энциклопедия',
    'bc.home':       'Шежіре',
    'bc.enc':        'Энциклопедия',
    'hub.title':     'Энциклопедия казахских родов',
    'hub.sub':       'Старший, Средний, Младший жуз и Вне жузов — полная история 47 родов',
    'hub.tribes':    'родов',
    'hub.open':      'Подробнее',
    'zhuz.tribes_heading': 'Роды',
    'tribe.region':  'Регион расселения',
    'tribe.tamga':   'Тамга',
    'tribe.uran':    'Уран',
    'tribe.subgroup':'Группа',
    'tribe.notable': 'Известные представители',
    'tribe.more':    'Подробнее →',
    'pager.prev':    '← Назад',
    'pager.next':    'Далее →',
    'cta.title':     'Создать Шежіре',
    'cta.desc':      'Сохраните историю своего рода',
    'cta.btn':       'Создать Шежіре',
    'footer.tagline':'Сохраняя историю рода для будущих поколений',
    'footer.copy':   '© 2024 Шежіре',
    'notfound.title':'Страница не найдена',
    'notfound.desc': 'Ссылка неверна или страница не существует.',
    'notfound.back': '← Вернуться в энциклопедию',
  },
};

/* Zhuz icons for hub cards */
const ZHUZ_ICONS = {
  uly:   '🏔️',
  orta:  '🌾',
  kishi: '🐎',
  other: '👑',
};

/* ── State ──────────────────────────────────────────────────────── */

let encLang = 'kk';
let pageType = 'hub'; // 'hub' | 'zhuz' | 'tribe'

/* ── Helpers ────────────────────────────────────────────────────── */

function t(key) {
  return ENC_TRANSLATIONS[encLang]?.[key] || ENC_TRANSLATIONS.kk[key] || key;
}

function loc(obj, field) {
  if (!obj) return '';
  const val = encLang === 'ru' ? (obj[field + '_ru'] || obj['ru']) : (obj[field + '_kk'] || obj['kk']);
  return val || obj[field + '_kk'] || obj['kk'] || '';
}

function locName(obj) {
  if (!obj) return '';
  return encLang === 'ru' ? (obj.ru || obj.kk) : (obj.kk || obj.ru);
}

function locDesc(obj) {
  if (!obj) return '';
  return encLang === 'ru' ? (obj.desc_ru || obj.desc_kk) : (obj.desc_kk || obj.desc_ru);
}

function locRegion(obj) {
  if (!obj) return '';
  return encLang === 'ru' ? (obj.region_ru || obj.region_kk) : (obj.region_kk || obj.region_ru);
}

function locSubgroup(obj) {
  if (!obj) return '';
  return encLang === 'ru' ? (obj.subgroup_ru || obj.subgroup_kk || '') : (obj.subgroup_kk || obj.subgroup_ru || '');
}

function locRole(p) {
  if (!p) return '';
  return encLang === 'ru' ? (p.role_ru || p.role_kk) : (p.role_kk || p.role_ru);
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function findZhuz(id) {
  return TRIBES_DB.find(z => z.id === id);
}

function findTribe(zhuzId, tribeId) {
  const zhuz = findZhuz(zhuzId);
  if (!zhuz) return null;
  return zhuz.tribes.find(tr => tr.id === tribeId) || null;
}

function escHtml(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

/* ── URL builders ───────────────────────────────────────────────── */

function zhuzUrl(zhuzId) {
  return pageType === 'hub'
    ? 'encyclopedia/zhuz.html?id=' + zhuzId
    : 'zhuz.html?id=' + zhuzId;
}

function tribeUrl(zhuzId, tribeId) {
  return pageType === 'hub'
    ? 'encyclopedia/tribe.html?zhuz=' + zhuzId + '&id=' + tribeId
    : 'tribe.html?zhuz=' + zhuzId + '&id=' + tribeId;
}

function hubUrl() {
  return pageType === 'hub' ? 'encyclopedia.html' : '../encyclopedia.html';
}

/* ── i18n apply ─────────────────────────────────────────────────── */

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === encLang);
  });

  // Set html lang
  document.documentElement.lang = encLang === 'ru' ? 'ru' : 'kk';
}

/* ── Set language (global) ──────────────────────────────────────── */

function setEncLang(lang) {
  if (lang === encLang) return;
  encLang = lang;
  localStorage.setItem('shejire-lang', lang);
  renderPage();
}

/* Make it global for onclick */
window.setEncLang = setEncLang;

/* ================================================================
   PAGE RENDERERS
   ================================================================ */

/* ── HUB PAGE ───────────────────────────────────────────────────── */

function renderHub() {
  const grid = document.getElementById('hub-grid');
  if (!grid) return;

  let html = '<div class="hub-grid">';
  TRIBES_DB.forEach(zhuz => {
    const name = locName(zhuz);
    const desc = locDesc(zhuz);
    const count = zhuz.tribes ? zhuz.tribes.length : 0;
    const icon = ZHUZ_ICONS[zhuz.id] || '📜';
    html += `
      <a href="${zhuzUrl(zhuz.id)}" class="hub-card">
        <div class="hub-card-icon">${icon}</div>
        <div class="hub-card-title">${escHtml(name)}</div>
        <div class="hub-card-desc">${escHtml(desc)}</div>
        <div class="hub-card-count">${count} ${t('hub.tribes')}</div>
        <div class="hub-card-btn">${t('hub.open')} →</div>
      </a>`;
  });
  html += '</div>';
  grid.innerHTML = html;

  // SEO
  const title = t('hub.title') + ' | Шежіре';
  document.title = title;

  applyI18n();
}

/* ── ZHUZ PAGE ──────────────────────────────────────────────────── */

function renderZhuz() {
  const zhuzId = getParam('id');
  const zhuz = findZhuz(zhuzId);

  if (!zhuz) {
    renderNotFound();
    return;
  }

  const name = locName(zhuz);
  const desc = locDesc(zhuz);

  // Title & SEO
  document.title = name + ' | Шежіре';
  const metaDesc = document.getElementById('page-desc');
  if (metaDesc) metaDesc.setAttribute('content', desc);

  const canonical = document.getElementById('page-canonical');
  if (canonical) canonical.setAttribute('href', 'https://skezire.kz/encyclopedia/zhuz.html?id=' + zhuzId);
  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', name + ' | Шежіре');
  const ogDesc = document.getElementById('og-desc');
  if (ogDesc) ogDesc.setAttribute('content', desc);

  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) {
    bc.innerHTML = `
      <a href="../index.html">${t('bc.home')}</a><span>›</span>
      <a href="../encyclopedia.html">${t('bc.enc')}</a><span>›</span>
      <span class="bc-current">${escHtml(name)}</span>`;
  }

  // Hero
  const titleEl = document.getElementById('zhuz-title');
  if (titleEl) titleEl.textContent = name;
  const descEl = document.getElementById('zhuz-desc');
  if (descEl) descEl.textContent = desc;

  // Tribes heading
  const heading = document.getElementById('tribes-heading');
  if (heading) heading.textContent = t('zhuz.tribes_heading') + ' — ' + name;

  // Tribes grid
  const grid = document.getElementById('tribes-grid');
  if (grid && zhuz.tribes) {
    let html = '';
    zhuz.tribes.forEach(tribe => {
      const tName = locName(tribe);
      const tDesc = locDesc(tribe);
      const subgroup = locSubgroup(tribe);
      const region = locRegion(tribe);

      html += `
        <a href="${tribeUrl(zhuz.id, tribe.id)}" class="tribe-card">
          <div class="tribe-card-header">
            <div class="tribe-card-tamga">${tribe.tamga || ''}</div>
            <div>
              <div class="tribe-card-name">${escHtml(tName)}</div>
              ${encLang === 'kk' && tribe.ru ? '<div class="tribe-card-subname">' + escHtml(tribe.ru) + '</div>' : ''}
              ${encLang === 'ru' && tribe.kk ? '<div class="tribe-card-subname">' + escHtml(tribe.kk) + '</div>' : ''}
            </div>
          </div>
          ${subgroup ? '<div class="tribe-card-subgroup">' + escHtml(subgroup) + '</div>' : ''}
          <div class="tribe-card-desc">${escHtml(tDesc)}</div>
          <div class="tribe-card-meta">
            ${region ? '<span>📍 ' + escHtml(region) + '</span>' : ''}
            ${tribe.uran ? '<span>📣 ' + escHtml(tribe.uran) + '</span>' : ''}
          </div>
          <div class="tribe-card-link">${t('tribe.more')}</div>
        </a>`;
    });
    grid.innerHTML = html;
  }

  // Pager (prev/next zhuz)
  renderZhuzPager(zhuzId);

  applyI18n();
}

function renderZhuzPager(zhuzId) {
  const pager = document.getElementById('pager-top');
  if (!pager) return;

  const idx = TRIBES_DB.findIndex(z => z.id === zhuzId);
  const prev = idx > 0 ? TRIBES_DB[idx - 1] : null;
  const next = idx < TRIBES_DB.length - 1 ? TRIBES_DB[idx + 1] : null;

  let html = '';
  if (prev) {
    html += `<a href="zhuz.html?id=${prev.id}">${t('pager.prev')} ${escHtml(locName(prev))}</a>`;
  } else {
    html += '<span></span>';
  }
  html += '<span class="pager-spacer"></span>';
  if (next) {
    html += `<a href="zhuz.html?id=${next.id}">${escHtml(locName(next))} ${t('pager.next')}</a>`;
  }
  pager.innerHTML = html;
}

/* ── TRIBE PAGE ─────────────────────────────────────────────────── */

function renderTribe() {
  const zhuzId = getParam('zhuz');
  const tribeId = getParam('id');
  const zhuz = findZhuz(zhuzId);
  const tribe = findTribe(zhuzId, tribeId);

  if (!zhuz || !tribe) {
    renderNotFound();
    return;
  }

  const zhuzName = locName(zhuz);
  const tribeName = locName(tribe);
  const tribeDesc = locDesc(tribe);
  const region = locRegion(tribe);
  const subgroup = locSubgroup(tribe);

  // Title & SEO
  document.title = tribeName + ' — ' + zhuzName + ' | Шежіре';
  const metaDesc = document.getElementById('page-desc');
  if (metaDesc) metaDesc.setAttribute('content', tribeDesc);
  const canonical = document.getElementById('page-canonical');
  if (canonical) canonical.setAttribute('href', 'https://skezire.kz/encyclopedia/tribe.html?zhuz=' + zhuzId + '&id=' + tribeId);

  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) {
    bc.innerHTML = `
      <a href="../index.html">${t('bc.home')}</a><span>›</span>
      <a href="../encyclopedia.html">${t('bc.enc')}</a><span>›</span>
      <a href="zhuz.html?id=${zhuzId}">${escHtml(zhuzName)}</a><span>›</span>
      <span class="bc-current">${escHtml(tribeName)}</span>`;
  }

  // Hero
  const titleEl = document.getElementById('tribe-title');
  if (titleEl) titleEl.textContent = tribeName;
  const zhuzLabel = document.getElementById('tribe-zhuz-label');
  if (zhuzLabel) zhuzLabel.textContent = zhuzName + (subgroup ? ' — ' + subgroup : '');

  // Detail
  const detail = document.getElementById('tribe-detail');
  if (detail) {
    let html = `<div class="tribe-detail-desc">${escHtml(tribeDesc)}</div>`;

    // Info cards
    html += '<div class="tribe-detail-grid">';
    if (tribe.tamga) {
      html += `
        <div class="tribe-detail-card">
          <div class="tribe-detail-card-label">${t('tribe.tamga')}</div>
          <div class="tribe-detail-card-value tamga-big">${tribe.tamga}</div>
        </div>`;
    }
    if (tribe.uran) {
      html += `
        <div class="tribe-detail-card">
          <div class="tribe-detail-card-label">${t('tribe.uran')}</div>
          <div class="tribe-detail-card-value">${escHtml(tribe.uran)}</div>
        </div>`;
    }
    if (region) {
      html += `
        <div class="tribe-detail-card">
          <div class="tribe-detail-card-label">${t('tribe.region')}</div>
          <div class="tribe-detail-card-value" style="font-size:1rem">${escHtml(region)}</div>
        </div>`;
    }
    if (subgroup) {
      html += `
        <div class="tribe-detail-card">
          <div class="tribe-detail-card-label">${t('tribe.subgroup')}</div>
          <div class="tribe-detail-card-value" style="font-size:1.1rem">${escHtml(subgroup)}</div>
        </div>`;
    }
    html += '</div>';

    // Notable persons
    if (tribe.notable && tribe.notable.length > 0) {
      html += `<div class="tribe-notable">
        <h3 class="tribe-notable-title">${t('tribe.notable')}</h3>
        <div class="notable-list">`;
      tribe.notable.forEach(p => {
        html += `
          <div class="notable-item">
            <div class="notable-item-name">${escHtml(p.name)}</div>
            <div class="notable-item-role">${escHtml(locRole(p))}</div>
          </div>`;
      });
      html += '</div></div>';
    }

    detail.innerHTML = html;
  }

  // Pager (prev/next tribe within the zhuz)
  renderTribePager(zhuzId, tribeId);

  applyI18n();
}

function renderTribePager(zhuzId, tribeId) {
  const pager = document.getElementById('pager-top');
  if (!pager) return;

  const zhuz = findZhuz(zhuzId);
  if (!zhuz || !zhuz.tribes) return;

  const idx = zhuz.tribes.findIndex(tr => tr.id === tribeId);
  const prev = idx > 0 ? zhuz.tribes[idx - 1] : null;
  const next = idx < zhuz.tribes.length - 1 ? zhuz.tribes[idx + 1] : null;

  let html = '';
  if (prev) {
    html += `<a href="tribe.html?zhuz=${zhuzId}&id=${prev.id}">${t('pager.prev')} ${escHtml(locName(prev))}</a>`;
  } else {
    html += '<span></span>';
  }
  html += '<span class="pager-spacer"></span>';
  if (next) {
    html += `<a href="tribe.html?zhuz=${zhuzId}&id=${next.id}">${escHtml(locName(next))} ${t('pager.next')}</a>`;
  }
  pager.innerHTML = html;
}

/* ── NOT FOUND ──────────────────────────────────────────────────── */

function renderNotFound() {
  const main = document.querySelector('.enc-main .container') || document.querySelector('.enc-main');
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; padding:80px 24px;">
        <h2 style="font-family:var(--ff-head); color:var(--blue); font-size:2rem; margin-bottom:12px;">
          ${t('notfound.title')}
        </h2>
        <p style="color:var(--muted); margin-bottom:24px;">${t('notfound.desc')}</p>
        <a href="${hubUrl()}" class="btn btn-primary">${t('notfound.back')}</a>
      </div>`;
  }
  applyI18n();
}

/* ── Navbar scroll & burger ─────────────────────────────────────── */

function bindNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });

  const burger = document.getElementById('nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }
}

/* ================================================================
   INIT
   ================================================================ */

function renderPage() {
  switch (pageType) {
    case 'hub':   renderHub(); break;
    case 'zhuz':  renderZhuz(); break;
    case 'tribe': renderTribe(); break;
  }
}

function initEncyclopedia(type) {
  pageType = type;

  // Restore language from localStorage
  const saved = localStorage.getItem('shejire-lang');
  if (saved && ENC_TRANSLATIONS[saved]) {
    encLang = saved;
  }

  bindNavbar();
  renderPage();
}

/* Make init global */
window.initEncyclopedia = initEncyclopedia;
