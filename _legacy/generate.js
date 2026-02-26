'use strict';

/**
 * generate.js — генератор статических страниц Шежіре
 * Запуск: node generate.js
 * Создаёт: tribes/{id}.html (47 файлов) + {id}-zhuz.html (4 файла)
 */

const fs   = require('fs');
const path = require('path');

/* ── Загрузка базы данных ──────────────────────────────────────── */

const tribesSource = fs.readFileSync(
  path.join(__dirname, 'data/tribes.js'), 'utf8'
);
// Убираем 'use strict' и загружаем TRIBES_DB через Function
const TRIBES_DB = new Function(
  tribesSource.replace(/'use strict';\s*/g, '') + '\nreturn TRIBES_DB;'
)();

/* ── Утилиты ───────────────────────────────────────────────────── */

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s, n = 155) {
  if (!s || s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, '') + '…';
}

/* ── Общие блоки HTML ──────────────────────────────────────────── */

function navbar(root) {
  return `  <nav class="navbar" id="navbar">
    <div class="nav-brand">
      <a href="${root}/index.html" style="display:flex;align-items:center;gap:8px;color:inherit;text-decoration:none">
        <span class="nav-orn">◆</span><span>Шежіре</span><span class="nav-orn">◆</span>
      </a>
    </div>
    <ul class="nav-links">
      <li><a href="${root}/index.html"><span class="lang-kk">Басты бет</span><span class="lang-ru" style="display:none">Главная</span></a></li>
      <li><a href="${root}/encyclopedia.html"><span class="lang-kk">Энциклопедия</span><span class="lang-ru" style="display:none">Энциклопедия</span></a></li>
    </ul>
    <div class="lang-switcher">
      <button class="lang-btn active" data-lang="kk" onclick="setEncLang('kk')">ҚАЗ</button>
      <span class="lang-sep">|</span>
      <button class="lang-btn" data-lang="ru" onclick="setEncLang('ru')">РУС</button>
    </div>
    <button class="nav-burger" id="nav-burger" aria-label="Меню">☰</button>
  </nav>`;
}

const ZHUZ_TABS_DATA = [
  { id: 'uly',   kk: 'Ұлы жүз',     ru: 'Старший жуз' },
  { id: 'orta',  kk: 'Орта жүз',    ru: 'Средний жуз'  },
  { id: 'kishi', kk: 'Кіші жүз',    ru: 'Младший жуз'  },
  { id: 'other', kk: 'Жүзден тыс',  ru: 'Вне жузов'    },
];

function zhuzTabs(activeId, root) {
  const items = ZHUZ_TABS_DATA.map(t => {
    const cls = t.id === activeId ? 'zhuz-tab zhuz-tab--active' : 'zhuz-tab';
    return `      <a href="${root}/${t.id}-zhuz.html" class="${cls}">
        <span class="lang-kk">${t.kk}</span><span class="lang-ru" style="display:none">${t.ru}</span>
      </a>`;
  }).join('\n');
  return `  <div class="zhuz-tabs-bar">
    <div class="zhuz-tabs container">
${items}
    </div>
  </div>`;
}

function footer(root) {
  return `  <footer class="footer">
    <div class="footer-orn" aria-hidden="true"></div>
    <div class="container">
      <div class="footer-body">
        <div class="footer-brand">
          <a href="${root}/index.html" class="footer-logo">Шежіре</a>
          <p class="lang-kk">Болашақ ұрпақтар үшін ата-тек тарихын сақтаймыз</p>
          <p class="lang-ru" style="display:none">Сохраняем историю рода для будущих поколений</p>
        </div>
        <blockquote class="footer-quote">
          <p>«Жеті атасын білмеген жетесіз»</p>
          <cite class="lang-kk">— Қазақ мақалы</cite>
          <cite class="lang-ru" style="display:none">— Казахская мудрость</cite>
        </blockquote>
      </div>
      <p class="footer-copy">
        © 2026 Шежіре &nbsp;•&nbsp;
        <span class="lang-kk">Қазақша шежіре ағашы</span>
        <span class="lang-ru" style="display:none">Казахское генеалогическое дерево</span>
      </p>
    </div>
  </footer>`;
}

const ENC_LANG_SCRIPT = `  <script>
    'use strict';
    let encLang = localStorage.getItem('shejire-lang') || 'kk';
    function setEncLang(lang) {
      encLang = lang;
      document.documentElement.lang = lang;
      document.querySelectorAll('.lang-kk').forEach(el => { el.style.display = lang === 'kk' ? '' : 'none'; });
      document.querySelectorAll('.lang-ru').forEach(el => { el.style.display = lang === 'ru' ? '' : 'none'; });
      document.querySelectorAll('.lang-btn').forEach(b => { b.classList.toggle('active', b.dataset.lang === lang); });
      const titles = { kk: document.documentElement.dataset.titleKk, ru: document.documentElement.dataset.titleRu };
      if (titles[lang]) document.title = titles[lang];
      localStorage.setItem('shejire-lang', lang);
    }
    document.addEventListener('DOMContentLoaded', () => {
      if (encLang !== 'kk') setEncLang(encLang);
      const nav = document.getElementById('navbar');
      window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });
      const burger = document.getElementById('nav-burger');
      const links  = document.querySelector('.nav-links');
      if (burger && links) burger.addEventListener('click', () => links.classList.toggle('open'));
    });
  </script>`;

const FONTS_LINK = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">`;

/* ── Генератор страницы рода ───────────────────────────────────── */

function tribePageHTML(tribe, group, siblings) {
  const root      = '..';
  const zhuzFile  = `${group.id}-zhuz.html`;
  const canonical = `https://skezire.kz/tribes/${tribe.id}.html`;
  const titleKK   = `${tribe.kk} руы — тарихы, тамғасы, ұраны | Шежіре`;
  const titleRU   = `Род ${tribe.ru} — история, тамга, уран | Шежіре`;

  // Подгруппа (только Кіші жүз)
  const subgroupItem = tribe.subgroup_kk ? `
          <div class="tribe-meta-item">
            <span class="tribe-meta-label lang-kk">Тобы</span>
            <span class="tribe-meta-label lang-ru" style="display:none">Подгруппа</span>
            <span class="lang-kk">${esc(tribe.subgroup_kk)}</span>
            <span class="lang-ru" style="display:none">${esc(tribe.subgroup_ru || tribe.subgroup_kk)}</span>
          </div>` : '';

  // Известные личности
  const notableSection = (tribe.notable && tribe.notable.length) ? `
        <div class="tribe-notable">
          <h3 class="lang-kk">Атақты тұлғалар</h3>
          <h3 class="lang-ru" style="display:none">Известные представители</h3>
          <ul>
            ${tribe.notable.map(n => `<li>
              <strong>${esc(n.name)}</strong> —
              <span class="lang-kk">${esc(n.role_kk)}</span>
              <span class="lang-ru" style="display:none">${esc(n.role_ru)}</span>
            </li>`).join('\n            ')}
          </ul>
        </div>` : '';

  // Другие роды жуза
  const siblingsCards = siblings.map(s => `
            <a href="${s.id}.html" class="tribe-sibling-card">
              <div class="tribe-sibling-tamga">${s.tamga}</div>
              <div class="tribe-sibling-name">
                <span class="lang-kk">${s.kk}</span>
                <span class="lang-ru" style="display:none">${s.ru}</span>
              </div>
            </a>`).join('');

  return `<!DOCTYPE html>
<html lang="kk" data-title-kk="${esc(titleKK)}" data-title-ru="${esc(titleRU)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titleKK)}</title>
  <meta name="description" lang="kk" content="${esc(truncate(tribe.desc_kk, 155))}">
  <meta name="description" lang="ru" content="${esc(truncate(tribe.desc_ru, 155))}">
  <meta name="keywords" content="${esc(tribe.kk)}, ${esc(tribe.ru)}, ${esc(group.kk)}, ${esc(group.ru)}, қазақ рулары, казахские роды, шежіре">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="../style.css">
${FONTS_LINK}
</head>
<body>

${navbar(root)}

  <!-- ХЛЕБНЫЕ КРОШКИ -->
  <div class="tribe-breadcrumb">
    <div class="container">
      <a href="../encyclopedia.html">
        <span class="lang-kk">Энциклопедия</span>
        <span class="lang-ru" style="display:none">Энциклопедия</span>
      </a>
      <span class="bc-sep">›</span>
      <a href="../${zhuzFile}">
        <span class="lang-kk">${group.kk}</span>
        <span class="lang-ru" style="display:none">${group.ru}</span>
      </a>
      <span class="bc-sep">›</span>
      <span class="lang-kk">${tribe.kk}</span>
      <span class="lang-ru" style="display:none">${tribe.ru}</span>
    </div>
  </div>

${zhuzTabs(group.id, root)}

  <main class="tribe-main">
    <div class="container">

      <article class="tribe-article">

        <!-- HERO -->
        <div class="tribe-hero">
          <div class="tribe-tamga-big">${tribe.tamga}</div>
          <div class="tribe-hero-text">
            <h1 class="tribe-title">
              <span class="lang-kk">${tribe.kk} <small>руы</small></span>
              <span class="lang-ru" style="display:none">Род ${tribe.ru}</span>
            </h1>
            <div class="tribe-uran-line">
              <span class="tribe-uran-label lang-kk">Ұран:</span>
              <span class="tribe-uran-label lang-ru" style="display:none">Уран:</span>
              <em class="tribe-uran-val">${esc(tribe.uran)}</em>
            </div>
          </div>
        </div>

        <!-- МЕТА -->
        <div class="tribe-meta-row">
          <div class="tribe-meta-item">
            <span class="tribe-meta-label lang-kk">Жүз</span>
            <span class="tribe-meta-label lang-ru" style="display:none">Жуз</span>
            <a href="../${zhuzFile}" class="tribe-meta-val">
              <span class="lang-kk">${group.kk}</span>
              <span class="lang-ru" style="display:none">${group.ru}</span>
            </a>
          </div>${subgroupItem}
          <div class="tribe-meta-item">
            <span class="tribe-meta-label lang-kk">Аймақ</span>
            <span class="tribe-meta-label lang-ru" style="display:none">Регион</span>
            <span class="tribe-meta-val lang-kk">${esc(tribe.region_kk)}</span>
            <span class="tribe-meta-val lang-ru" style="display:none">${esc(tribe.region_ru)}</span>
          </div>
          <div class="tribe-meta-item">
            <span class="tribe-meta-label lang-kk">Тамға</span>
            <span class="tribe-meta-label lang-ru" style="display:none">Тамга</span>
            <span class="tribe-meta-val tribe-meta-tamga">${tribe.tamga}</span>
          </div>
        </div>

        <!-- ОПИСАНИЕ -->
        <div class="tribe-desc">
          <p class="lang-kk">${esc(tribe.desc_kk)}</p>
          <p class="lang-ru" style="display:none">${esc(tribe.desc_ru)}</p>
        </div>
${notableSection}
      </article>

      <!-- ДРУГИЕ РОДЫ ЭТОГО ЖУЗА -->
      <section class="tribe-siblings">
        <h2>
          <span class="lang-kk">${group.kk} — басқа рулар</span>
          <span class="lang-ru" style="display:none">${group.ru} — другие роды</span>
        </h2>
        <div class="tribe-siblings-grid">
${siblingsCards}
        </div>
      </section>

    </div>
  </main>

${footer(root)}

${ENC_LANG_SCRIPT}

</body>
</html>`;
}

/* ── Генератор страницы жуза ───────────────────────────────────── */

function zhuzPageHTML(group) {
  const root      = '.';
  const canonical = `https://skezire.kz/${group.id}-zhuz.html`;
  const count     = group.tribes.length;
  const titleKK   = `${group.kk} рулары — ${count} рудың тарихы, тамғалары | Шежіре`;
  const titleRU   = `Роды ${group.ru} — история ${count} родов, тамги | Шежіре`;

  const tribeCards = group.tribes.map(tribe => {
    const dkk = esc(truncate(tribe.desc_kk, 110));
    const dru = esc(truncate(tribe.desc_ru, 110));
    return `
        <a href="tribes/${tribe.id}.html" class="enc-tribe-card zhuz-tribe-link">
          <div class="enc-tribe-header">
            <div class="enc-tamga">${tribe.tamga}</div>
            <div>
              <h2 class="enc-tribe-name lang-kk">${tribe.kk}</h2>
              <h2 class="enc-tribe-name lang-ru" style="display:none">${tribe.ru}</h2>
              <div class="enc-uran">${esc(tribe.uran)}</div>
            </div>
          </div>
          <div class="enc-tribe-body">
            <p class="lang-kk">${dkk}</p>
            <p class="lang-ru" style="display:none">${dru}</p>
            <div class="enc-tribe-meta">
              <span class="lang-kk">📍 ${esc(tribe.region_kk)}</span>
              <span class="lang-ru" style="display:none">📍 ${esc(tribe.region_ru)}</span>
            </div>
            <div class="zhuz-card-arrow">→</div>
          </div>
        </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="kk" data-title-kk="${esc(titleKK)}" data-title-ru="${esc(titleRU)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titleKK)}</title>
  <meta name="description" lang="kk" content="${esc(group.desc_kk)}">
  <meta name="description" lang="ru" content="${esc(group.desc_ru)}">
  <meta name="keywords" content="${esc(group.kk)}, ${esc(group.ru)}, қазақ рулары, казахские роды, шежіре, ${group.tribes.map(t => esc(t.kk)).join(', ')}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="style.css">
${FONTS_LINK}
</head>
<body>

${navbar(root)}

${zhuzTabs(group.id, root)}

  <main class="zhuz-main">
    <div class="container">

      <!-- HERO ЖУЗА -->
      <div class="zhuz-hero">
        <div class="zhuz-hero-badge">${count}</div>
        <div class="zhuz-hero-text">
          <h1 class="zhuz-hero-title">
            <span class="lang-kk">${group.kk}</span>
            <span class="lang-ru" style="display:none">${group.ru}</span>
          </h1>
          <p class="zhuz-hero-desc lang-kk">${esc(group.desc_kk)}</p>
          <p class="zhuz-hero-desc lang-ru" style="display:none">${esc(group.desc_ru)}</p>
        </div>
      </div>

      <!-- СЕТКА РОДОВ -->
      <div class="enc-tribes-grid">
${tribeCards}
      </div>

    </div>
  </main>

${footer(root)}

${ENC_LANG_SCRIPT}

</body>
</html>`;
}

/* ── Генерация всех файлов ─────────────────────────────────────── */

// Создаём папку tribes/
const tribesDir = path.join(__dirname, 'tribes');
if (!fs.existsSync(tribesDir)) fs.mkdirSync(tribesDir);

let tribeCount = 0;
let zhuzCount  = 0;
const sitemapUrls = [];

TRIBES_DB.forEach(group => {
  // Страница жуза
  const zhuzFile = `${group.id}-zhuz.html`;
  fs.writeFileSync(path.join(__dirname, zhuzFile), zhuzPageHTML(group), 'utf8');
  zhuzCount++;
  sitemapUrls.push(`  <url>
    <loc>https://skezire.kz/${zhuzFile}</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
  console.log(`✓ ${zhuzFile}`);

  // Страницы родов
  group.tribes.forEach(tribe => {
    const siblings = group.tribes.filter(t => t.id !== tribe.id);
    const html = tribePageHTML(tribe, group, siblings);
    const outFile = path.join(tribesDir, `${tribe.id}.html`);
    fs.writeFileSync(outFile, html, 'utf8');
    tribeCount++;
    sitemapUrls.push(`  <url>
    <loc>https://skezire.kz/tribes/${tribe.id}.html</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    console.log(`  ✓ tribes/${tribe.id}.html`);
  });
});

/* ── Обновление sitemap.xml ────────────────────────────────────── */

const sitemapPath = path.join(__dirname, 'sitemap.xml');
const existingSitemap = fs.readFileSync(sitemapPath, 'utf8');
const newUrls = sitemapUrls.join('\n');

// Вставляем новые URL перед закрывающим тегом
const updatedSitemap = existingSitemap.replace(
  '</urlset>',
  `${newUrls}\n</urlset>`
);
fs.writeFileSync(sitemapPath, updatedSitemap, 'utf8');

console.log(`\n✅ Готово!`);
console.log(`   Страниц жузов:  ${zhuzCount}`);
console.log(`   Страниц родов:  ${tribeCount}`);
console.log(`   Итого:          ${zhuzCount + tribeCount} файлов`);
console.log(`   sitemap.xml обновлён (+${sitemapUrls.length} URL)`);
