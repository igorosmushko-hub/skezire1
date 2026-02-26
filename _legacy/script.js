/* ================================================================
   ШЕЖІРЕ — script.js   (i18n: KK primary, RU secondary)
   ================================================================ */

'use strict';

/* ── Translations ──────────────────────────────────────────────── */

const TRANSLATIONS = {
  kk: {
    // Nav
    'nav.about':  'Жоба туралы',
    'nav.create': 'Шежіре жасау',
    'nav.ai':     'AI мүмкіндіктері',
    'nav.enc':    'Энциклопедия',

    // Hero
    'hero.badge':      'Жеті ата \u00a0•\u00a0 Жеті буын',
    'hero.sub':        'Қазақша шежіре ағашы онлайн',
    'hero.desc':       'Ата-тегіңіздің тарихын сақтаңыз. Жеті атаңыздың есімін біліңіз. Заманауи технологиялармен жеті ата дәстүрінің күшін ашыңыз.',
    'hero.btn.create': 'Шежіре жасау',
    'hero.btn.learn':  'Толығырақ',

    // About
    'about.h2':   'Шежіре деген не? — Қазақтың ата-тек дәстүрі',
    'about.c1.h3': 'Жеті ата',
    'about.c1.p':  'Қазақ мәдениетінде әр адам жеті атасын білуге тиіс. Бұл ұрпақтарды біріктіретін ата-бабадан қалған дәстүр.',
    'about.c2.h3': 'Жүз және Ру',
    'about.c2.p':  'Қазақтар үш жүзге (Ұлы, Орта, Кіші) және тарихи жадыны сақтаған көптеген руларға бөлінеді.',
    'about.c3.h3': 'AI Шежіре',
    'about.c3.p':  'Заманауи жасанды интеллект технологиялары ата-тегіңіздің тарихын жандандыруға және бабаларыңыздың бейнесін ашуға көмектеседі.',

    // Form
    'form.h2':           'Шежіре жасау — Ата-тегіңізді біліңіз',
    'form.desc':         'Шежіре ағашын жасау үшін жүзіңіз, руыңыз және жеті атаңыз туралы деректерді толтырыңыз',
    'form.personal.h3':  'Сіздің деректеріңіз',
    'form.name.label':   'Сіздің атыңыз *',
    'form.name.ph':      'Атыңызды енгізіңіз',
    'form.year.label':   'Туған жыл',
    'form.year.ph':      'мыс. 1990',
    'form.zhuz.label':   'Жүз',
    'form.zhuz.ph':      'Жүзді таңдаңыз',
    'form.zhuz.uly':     'Ұлы жүз — Үлкен жүз',
    'form.zhuz.orta':    'Орта жүз — Орта жүз',
    'form.zhuz.kishi':   'Кіші жүз — Кіші жүз',
    'form.ru.label':     'Ру',
    'form.ru.ph':        'мыс. Найман, Арғын, Дулат…',
    'form.anc.h3':       'Жеті ата',
    'form.anc.hint':     'Әкелік желі бойынша',
    'form.anc.ph':       'Баба атын жазыңыз',
    'form.submit':       'Шежіре жасау',

    // Tree
    'tree.h2':              'Сіздің Шежіреңіз',
    'tree.legend.known':    'Белгілі баба',
    'tree.legend.unknown':  'Белгісіз баба',
    'tree.legend.you':      'Сіз',
    'tree.btn.save':        '⬇ Сақтау',
    'tree.btn.edit':        '✎ Деректерді өзгерту',
    'tree.tag.zhuz':        'Жүз',
    'tree.tag.ru':          'Ру',
    'tree.tag.year':        'Туған жыл',
    'tree.unknown':         '· · · белгісіз · · ·',
    'tree.you':             'Сіз',

    // AI section
    'ai.h2':          'AI Мүмкіндіктері',
    'ai.desc':        'Жасанды интеллект ата-тек жадына қызмет етеді',
    'ai.past.h3':     '100 жыл бұрынғы өзіңді жасат',
    'ai.past.p':      'Суретіңізді жүктеңіз — AI 1920 жылдардағы қазақ даласы стилінде сіздің бейнеңізді жасайды: дәстүрлі шапан, тымақ, дала атмосферасы.',
    'ai.past.tag1':   'Фото AI',
    'ai.past.tag2':   'Тарихи реконструкция',
    'ai.gm.h3':       'Апашың жастайында қандай болған?',
    'ai.gm.p':        'Қарт туысыңыздың суретін жүктеңіз — AI оларды жастайындағы қазақтың дәстүрлі нарядтарында көрсетеді.',
    'ai.gm.tag1':     'Жасарту',
    'ai.gm.tag2':     'Дәстүрлі стиль',
    'ai.story.h3':    'Ата-тегіңіздің тарихы',
    'ai.story.p':     'AI жүзіңіз, руыңыз және бабаларыңыз туралы деректерге сүйене отырып, ата-тегіңіздің ғасырлар бойы жасаған жолы туралы бірегей тарихи баян жазады.',
    'ai.story.tag1':  'Мәтін жасау',
    'ai.story.tag2':  'Тарих',
    'ai.btn':         'Қолданып көру',
    'ai.soon':        'Жақында',

    // Footer
    'footer.tagline': 'Болашақ ұрпақтар үшін ата-тек тарихын сақтаймыз',
    'footer.quote':   '«Жеті атасын білмеген жетесіз»',
    'footer.cite':    '— Қазақ мақалы',
    'footer.copy':    '© 2024 Шежіре \u00a0•\u00a0 Қазақша шежіре ағашы',

    // Modal
    'modal.chip': '⏳ Жасалуда — жақында қол жетімді',

    // Tribe card
    'tribe.region':  'Қоныс аймақ',
    'tribe.tamga':   'Тамға',
    'tribe.uran':    'Ұран',
    'tribe.notable': 'Атақты тұлғалар',
    'tribe.subgroup':'Топ',

    // Zhuz extra
    'form.zhuz.other': 'Жүзден тыс — Торе, Қожа',

    // Ru select states
    'form.ru.ph_select':  'Алдымен жүзді таңдаңыз',
    'form.ru.select':     'Ру таңдаңыз',

    // Share
    'tree.btn.share':    '📤 Бөлісу',
    'share.generating':  'Сурет жасалуда...',
    'share.ready':       'Сурет дайын!',
    'share.error':       'Қате орын алды, қайталаңыз',
    'share.title':       'Менің Шежірем',

    // Misc
    'err.name':   'Атыңызды енгізіңіз',
    'toast.save': 'Кеңес: Ctrl+P → «PDF ретінде сақтау» пайдаланыңыз',
  },

  ru: {
    // Nav
    'nav.about':  'О проекте',
    'nav.create': 'Создать дерево',
    'nav.ai':     'AI функции',
    'nav.enc':    'Энциклопедия',

    // Hero
    'hero.badge':      'Жеті ата \u00a0•\u00a0 Семь поколений',
    'hero.sub':        'Казахское генеалогическое дерево онлайн',
    'hero.desc':       'Сохраните историю своего рода. Узнайте имена предков до седьмого колена. Откройте силу казахской традиции жеті ата с помощью современных технологий.',
    'hero.btn.create': 'Создать шежіре',
    'hero.btn.learn':  'Узнать больше',

    // About
    'about.h2':   'Что такое Шежіре? — Казахская генеалогическая традиция',
    'about.c1.h3': 'Жеті ата',
    'about.c1.p':  'В казахской культуре каждый должен знать своих предков до седьмого колена. Это традиция, объединяющая поколения.',
    'about.c2.h3': 'Жуз и Ру',
    'about.c2.p':  'Казахи делятся на три жуза (Старший, Средний, Младший) и множество родов (ру), хранящих историческую память.',
    'about.c3.h3': 'AI Шежіре',
    'about.c3.p':  'Современные технологии искусственного интеллекта помогут оживить историю вашего рода и предков.',

    // Form
    'form.h2':           'Создать Шежіре — Узнайте свой род',
    'form.desc':         'Заполните данные о жузе, роде и семи поколениях предков, чтобы создать генеалогическое дерево',
    'form.personal.h3':  'Ваши данные',
    'form.name.label':   'Ваше имя *',
    'form.name.ph':      'Введите ваше имя',
    'form.year.label':   'Год рождения',
    'form.year.ph':      'напр. 1990',
    'form.zhuz.label':   'Жуз',
    'form.zhuz.ph':      'Выберите жуз',
    'form.zhuz.uly':     'Ұлы жүз — Старший жуз',
    'form.zhuz.orta':    'Орта жүз — Средний жуз',
    'form.zhuz.kishi':   'Кіші жүз — Младший жуз',
    'form.ru.label':     'Ру (Род)',
    'form.ru.ph':        'напр. Найман, Аргын, Дулат…',
    'form.anc.h3':       'Жеті ата — Семь предков',
    'form.anc.hint':     'По отцовской линии',
    'form.anc.ph':       'Введите имя предка',
    'form.submit':       'Создать Шежіре',

    // Tree
    'tree.h2':              'Ваше Шежіре',
    'tree.legend.known':    'Известный предок',
    'tree.legend.unknown':  'Неизвестный предок',
    'tree.legend.you':      'Вы',
    'tree.btn.save':        '⬇ Сохранить',
    'tree.btn.edit':        '✎ Изменить данные',
    'tree.tag.zhuz':        'Жуз',
    'tree.tag.ru':          'Ру',
    'tree.tag.year':        'Год рождения',
    'tree.unknown':         '· · · неизвестен · · ·',
    'tree.you':             'Вы',

    // AI section
    'ai.h2':          'AI Функции',
    'ai.desc':        'Искусственный интеллект на службе памяти рода',
    'ai.past.h3':     'Создай себя 100 лет назад',
    'ai.past.p':      'Загрузите фото — AI воссоздаст ваш образ в стиле 1920-х годов казахской степи: традиционный костюм, атмосфера эпохи.',
    'ai.past.tag1':   'Фото AI',
    'ai.past.tag2':   'Историческая реконструкция',
    'ai.gm.h3':       'Как выглядела апашка в молодости',
    'ai.gm.p':        'Загрузите фото пожилого родственника — AI покажет, как они могли выглядеть в молодости в казахских традиционных нарядах.',
    'ai.gm.tag1':     'Омоложение',
    'ai.gm.tag2':     'Традиционный стиль',
    'ai.story.h3':    'История вашего рода',
    'ai.story.p':     'AI создаст увлекательный рассказ об истории вашего рода, жуза и ру, основываясь на введённых данных и исторических источниках.',
    'ai.story.tag1':  'Генерация текста',
    'ai.story.tag2':  'История',
    'ai.btn':         'Попробовать',
    'ai.soon':        'Скоро',

    // Footer
    'footer.tagline': 'Сохраняя историю рода для будущих поколений',
    'footer.quote':   '«Жеті атасын білмеген жетесіз»',
    'footer.cite':    '— Казахская мудрость: Кто не знает семи предков — тот неполноценный',
    'footer.copy':    '© 2024 Шежіре \u00a0•\u00a0 Казахское генеалогическое дерево',

    // Modal
    'modal.chip': '⏳ В разработке — скоро доступно',

    // Tribe card
    'tribe.region':  'Регион расселения',
    'tribe.tamga':   'Тамга',
    'tribe.uran':    'Уран (клич)',
    'tribe.notable': 'Известные представители',
    'tribe.subgroup':'Группа',

    // Zhuz extra
    'form.zhuz.other': 'Вне жузов — Торе, Кожа',

    // Ru select states
    'form.ru.ph_select':  'Сначала выберите жуз',
    'form.ru.select':     'Выберите ру',

    // Share
    'tree.btn.share':    '📤 Поделиться',
    'share.generating':  'Создаём изображение...',
    'share.ready':       'Изображение готово!',
    'share.error':       'Произошла ошибка, попробуйте ещё раз',
    'share.title':       'Моё Шежіре',

    // Misc
    'err.name':   'Пожалуйста, введите ваше имя',
    'toast.save': 'Подсказка: воспользуйтесь Ctrl+P → «Сохранить как PDF»',
  },
};

/* ── Ancestor definitions per language ────────────────────────── */

const ANCESTOR_DEFS = {
  kk: [
    { kaz: 'Ата',       label: 'Ата (1-ші буын)'        },
    { kaz: 'Баба',      label: 'Баба (2-ші буын)'        },
    { kaz: 'Арғы ата',  label: '3-ші буын'               },
    { kaz: 'Тек ата',   label: '4-ші буын'               },
    { kaz: 'Түп ата',   label: '5-ші буын'               },
    { kaz: 'Негіз ата', label: '6-шы буын'               },
    { kaz: 'Жеті ата',  label: '7-ші буын (жеті ата)'    },
  ],
  ru: [
    { kaz: 'Ата',       label: 'Дед (1-е поколение)'     },
    { kaz: 'Баба',      label: 'Прадед (2-е поколение)'  },
    { kaz: 'Арғы ата',  label: '3-е поколение'           },
    { kaz: 'Тек ата',   label: '4-е поколение'           },
    { kaz: 'Түп ата',   label: '5-е поколение'           },
    { kaz: 'Негіз ата', label: '6-е поколение'           },
    { kaz: 'Жеті ата',  label: '7-е поколение (жеті ата)'},
  ],
};

/* ── AI modal content per language ────────────────────────────── */

const AI_MODAL = {
  kk: {
    past: {
      icon: '🕰️',
      title: '100 жыл бұрынғы өзіңді жасат',
      text: 'Суретіңізді жүктеңіз — AI 1920 жылдардағы қазақ даласы стилінде сіздің бейнеңізді қайта жасайды: дәстүрлі шапан, тымақ, ұлы дала атмосферасы.',
      detail: 'Біз кескін жасайтын AI модельдерін қазақтың тарихи киім мұрағаттарымен біріктіреміз. Функция келесі нұсқада шығады.',
    },
    grandma: {
      icon: '👵',
      title: 'Апашың жастайында қандай болған?',
      text: 'Қарт туысыңыздың суретін жүктеңіз — AI оларды жастайындағы қазақтың дәстүрлі нарядтарында көрсетеді.',
      detail: 'Бет жасарту технологиялары мен қазақ дәстүрлі киімін стильдеу арқылы AI бабаларыңыздың жас кейпін көрсетеді.',
    },
    story: {
      icon: '📖',
      title: 'Ата-тегіңіздің тарихы',
      text: 'Жүзіңіз, руыңыз және бабаларыңыз туралы деректерге сүйене отырып, AI ата-тегіңіздің ғасырлар бойы жасаған жолы туралы бірегей тарихи баян жазады.',
      detail: 'Тілдік модель қазақ рулары мен дәуірлері туралы тарихи деректерде оқытылуда. Функция жақын жаңартуда қол жетімді болады.',
    },
  },
  ru: {
    past: {
      icon: '🕰️',
      title: 'Создай себя 100 лет назад',
      text: 'Загрузите своё фото — AI воссоздаст ваш образ в стиле 1920-х годов казахской степи: традиционный чапан, тымак, атмосфера Великой степи.',
      detail: 'Мы интегрируем генеративные модели изображений с историческими архивами казахского костюма. Функция появится в следующем релизе.',
    },
    grandma: {
      icon: '👵',
      title: 'Как выглядела апашка в молодости',
      text: 'Загрузите фото пожилого родственника — AI покажет, как они могли выглядеть в молодости в казахских традиционных нарядах.',
      detail: 'Технологии омоложения лица в сочетании с историческим стайлингом казахского традиционного костюма. Скоро в приложении.',
    },
    story: {
      icon: '📖',
      title: 'История вашего рода',
      text: 'На основе данных о жузе, ру и предках AI создаст уникальный исторический нарратив о пути вашего рода сквозь века.',
      detail: 'Языковая модель обучается на исторических источниках о казахских родах и эпохах. Функция появится в ближайшем обновлении.',
    },
  },
};

/* ── State ─────────────────────────────────────────────────────── */

let currentLang  = 'kk';
let currentTribe = null;   // currently selected tribe object

/* ── Helpers ───────────────────────────────────────────────────── */

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] ?? key;
}

/* ── i18n core ─────────────────────────────────────────────────── */

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang];
  if (!dict) return;

  // textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });

  // placeholder
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = dict[el.dataset.i18nPh];
    if (v != null) el.placeholder = v;
  });

  // <html lang>
  document.documentElement.lang = lang;

  // <title>
  document.title = lang === 'kk'
    ? 'Шежіре — Қазақша шежіре ағашы | Жеті ата, Жүз, Ру'
    : 'Шежіре — Казахское генеалогическое дерево | Роды, жузы, жеті ата';

  // lang-btn active state
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

/* ── Language switch ───────────────────────────────────────────── */

function setLanguage(lang) {
  if (lang === currentLang) return;

  // Preserve ancestor input values
  const saved = ANCESTOR_DEFS[currentLang].map((_, i) => {
    const el = document.getElementById(`anc-${i}`);
    return el ? el.value : '';
  });

  currentLang = lang;
  applyTranslations(lang);

  // Rebuild ancestor fields with new language labels
  document.getElementById('ancestors-grid').innerHTML = '';
  buildAncestorFields();

  // Restore values
  saved.forEach((v, i) => {
    const el = document.getElementById(`anc-${i}`);
    if (el && v) el.value = v;
  });

  // Re-populate ru select (language labels change)
  const zhuzEl = document.getElementById('zhuz');
  const ruEl   = document.getElementById('ru');
  const savedRuId = ruEl.value;
  if (zhuzEl.value) onZhuzChange(zhuzEl.value, savedRuId);

  // Re-render tribe card if one is selected
  if (currentTribe) renderTribeCard(currentTribe);

  // If tree is visible, re-render with new language
  const treeSection = document.getElementById('tree-section');
  if (treeSection.style.display !== 'none') {
    const data = collectData(document.getElementById('your-name').value.trim());
    renderTree(data);
  }

  localStorage.setItem('shejire-lang', lang);
}

/* ── Init ──────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved language preference
  const saved = localStorage.getItem('shejire-lang');
  if (saved && TRANSLATIONS[saved]) {
    currentLang = saved;
    applyTranslations(saved);
  }

  buildAncestorFields();
  bindForm();
  bindNavbar();
  bindModalBackdrop();

  // Restore zhuz/ru if saved
  const savedZhuz = localStorage.getItem('shejire-zhuz');
  const savedRu   = localStorage.getItem('shejire-ru');
  if (savedZhuz) {
    const zhuzEl = document.getElementById('zhuz');
    zhuzEl.value = savedZhuz;
    onZhuzChange(savedZhuz, savedRu);
  }
});

/* ── Tribe Select ──────────────────────────────────────────────── */

function onZhuzChange(zhuzId, restoreRuId) {
  const ruEl = document.getElementById('ru');

  // Reset ru select
  ruEl.innerHTML = '';
  currentTribe = null;
  hideTribeCard();

  if (!zhuzId) {
    ruEl.disabled = true;
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = t('form.ru.ph_select');
    ruEl.appendChild(opt);
    return;
  }

  // Find the zhuz in TRIBES_DB
  const zhuz = (typeof TRIBES_DB !== 'undefined') && TRIBES_DB.find(z => z.id === zhuzId);
  if (!zhuz) return;

  // First empty option
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = t('form.ru.select');
  ruEl.appendChild(placeholder);

  // Populate tribes
  zhuz.tribes.forEach(tribe => {
    const opt   = document.createElement('option');
    opt.value   = tribe.id;
    const name  = currentLang === 'kk' ? tribe.kk : tribe.ru;
    const sub   = tribe.subgroup_kk
      ? ` (${currentLang === 'kk' ? tribe.subgroup_kk : tribe.subgroup_ru})`
      : '';
    opt.textContent = name + sub;
    ruEl.appendChild(opt);
  });

  ruEl.disabled = false;

  // Restore previous selection if provided
  if (restoreRuId) {
    ruEl.value = restoreRuId;
    if (ruEl.value === restoreRuId) onRuChange(restoreRuId);
  }

  localStorage.setItem('shejire-zhuz', zhuzId);
}

function onRuChange(tribeId) {
  if (!tribeId) { hideTribeCard(); return; }

  const zhuzId = document.getElementById('zhuz').value;
  const zhuz   = (typeof TRIBES_DB !== 'undefined') && TRIBES_DB.find(z => z.id === zhuzId);
  if (!zhuz) return;

  const tribe = zhuz.tribes.find(t => t.id === tribeId);
  if (!tribe) return;

  currentTribe = tribe;
  renderTribeCard(tribe);

  localStorage.setItem('shejire-ru', tribeId);
}

function renderTribeCard(tribe) {
  const card = document.getElementById('tribe-card');
  const lang = currentLang;

  const name   = lang === 'kk' ? tribe.kk   : tribe.ru;
  const desc   = lang === 'kk' ? tribe.desc_kk : tribe.desc_ru;
  const region = lang === 'kk' ? tribe.region_kk : tribe.region_ru;
  const sub    = tribe.subgroup_kk
    ? `<div class="tc-row"><span class="tc-label">${t('tribe.subgroup')}</span><span class="tc-val">${lang === 'kk' ? tribe.subgroup_kk : tribe.subgroup_ru}</span></div>`
    : '';

  const notableHtml = (tribe.notable && tribe.notable.length)
    ? `<div class="tc-notable-title">${t('tribe.notable')}</div>
       <ul class="tc-notable-list">${tribe.notable.map(p =>
         `<li><strong>${escapeXML(p.name)}</strong> — ${escapeXML(lang === 'kk' ? p.role_kk : p.role_ru)}</li>`
       ).join('')}</ul>`
    : '';

  card.innerHTML = `
    <div class="tc-header">
      <div class="tc-tamga">${tribe.tamga}</div>
      <div>
        <div class="tc-name">${escapeXML(name)}</div>
        <div class="tc-uran">${escapeXML(tribe.uran)}</div>
      </div>
    </div>
    <p class="tc-desc">${escapeXML(desc)}</p>
    <div class="tc-meta">
      <div class="tc-row"><span class="tc-label">📍 ${t('tribe.region')}</span><span class="tc-val">${escapeXML(region)}</span></div>
      <div class="tc-row"><span class="tc-label">🏹 ${t('tribe.uran')}</span><span class="tc-val tc-uran-val">${escapeXML(tribe.uran)}</span></div>
      ${sub}
    </div>
    ${notableHtml}
  `;

  card.style.display = 'block';
  // Trigger reflow for animation
  card.classList.remove('tc-visible');
  requestAnimationFrame(() => card.classList.add('tc-visible'));
}

function hideTribeCard() {
  const card = document.getElementById('tribe-card');
  card.style.display = 'none';
  card.classList.remove('tc-visible');
}

/* ── Ancestor Fields ───────────────────────────────────────────── */

function buildAncestorFields() {
  const grid = document.getElementById('ancestors-grid');
  const defs = ANCESTOR_DEFS[currentLang];
  const ph   = t('form.anc.ph');

  defs.forEach((anc, i) => {
    const div = document.createElement('div');
    div.className = 'anc-field';
    div.innerHTML = `
      <span class="anc-label">${anc.label}</span>
      <div class="anc-input-wrap">
        <span class="anc-badge">${anc.kaz}</span>
        <input class="anc-input" type="text" id="anc-${i}"
               placeholder="${ph}" autocomplete="off" spellcheck="false">
      </div>
    `;
    grid.appendChild(div);
  });
}

/* ── Form ──────────────────────────────────────────────────────── */

function bindForm() {
  document.getElementById('family-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('your-name').value.trim();
    if (!name) {
      showToast(t('err.name'));
      document.getElementById('your-name').focus();
      return;
    }
    const data = collectData(name);
    renderTree(data);

    const section = document.getElementById('tree-section');
    section.style.display = 'block';
    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function collectData(name) {
  const zhuzEl = document.getElementById('zhuz');
  const ruName = currentTribe
    ? (currentLang === 'kk' ? currentTribe.kk : currentTribe.ru)
    : '';
  return {
    name,
    birthYear: document.getElementById('birth-year').value || '',
    zhuz:      zhuzEl.value,
    zhuzLabel: zhuzEl.options[zhuzEl.selectedIndex]?.text || '',
    ru:        ruName,
    ancestors: ANCESTOR_DEFS[currentLang].map((anc, i) => ({
      ...anc,
      name: document.getElementById(`anc-${i}`)?.value.trim() || '',
    })),
  };
}

/* ── Tree ──────────────────────────────────────────────────────── */

function renderTree(data) {
  // Title
  const titleEl = document.getElementById('tree-title');
  if (currentLang === 'kk') {
    titleEl.textContent = (data.ru || data.name) + ' шежіресі';
  } else {
    titleEl.textContent = data.ru
      ? `Шежіре рода ${data.ru}`
      : `Шежіре ${data.name}`;
  }

  // Meta tags
  const meta = document.getElementById('tree-meta');
  meta.innerHTML = '';
  const addTag = (icon, labelKey, val) => {
    if (!val) return;
    const d = document.createElement('div');
    d.className = 'tree-tag';
    d.innerHTML = `<span>${icon}</span><span><strong>${t(labelKey)}:</strong> ${val}</span>`;
    meta.appendChild(d);
  };
  addTag('🏛️', 'tree.tag.zhuz', data.zhuzLabel);
  addTag('🌿', 'tree.tag.ru',   data.ru);
  addTag('📅', 'tree.tag.year', data.birthYear);

  // Build node list: oldest → user
  const nodes = [
    ...data.ancestors.slice().reverse(),
    { kaz: t('tree.you'), label: '', name: data.name, isUser: true },
  ];

  document.getElementById('tree-container').innerHTML = buildTreeSVG(nodes);
}

function buildTreeSVG(nodes) {
  const W     = 560;
  const nodeW = 220;
  const nodeH = 60;
  const gapV  = 44;
  const padT  = 28;
  const cx    = W / 2;
  const totalH = nodes.length * (nodeH + gapV) - gapV + padT * 2;
  const unknownText = t('tree.unknown');

  const defs = `
    <defs>
      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2B6FD4"/>
        <stop offset="100%" stop-color="#002A74"/>
      </linearGradient>
      <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#E8C96A"/>
        <stop offset="100%" stop-color="#7A5E18"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  let shapes = '';

  nodes.forEach((node, i) => {
    const x    = cx - nodeW / 2;
    const y    = padT + i * (nodeH + gapV);
    const midY = y + nodeH / 2;
    const isUser  = node.isUser === true;
    const hasFill = !!node.name;
    const delay   = (i * 0.06).toFixed(2);

    // Connector
    if (i < nodes.length - 1) {
      const y1 = y + nodeH, y2 = y + nodeH + gapV - 8, yA = y2 + 8;
      const op = hasFill ? '.75' : '.28';
      const da = hasFill ? '' : 'stroke-dasharray="6 4"';
      shapes += `
        <line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}"
              stroke="#C8A84B" stroke-width="2" opacity="${op}" ${da}/>
        <polygon points="${cx},${yA} ${cx-5},${y2} ${cx+5},${y2}"
                 fill="#C8A84B" opacity="${op}"/>
      `;
    }

    // Background rect
    let fill, stroke, strokeW, dash;
    if (isUser)       { fill = 'url(#gGold)'; stroke = '#E8C96A'; strokeW = '1.5'; dash = ''; }
    else if (hasFill) { fill = 'url(#gBlue)'; stroke = '#3B6FDB'; strokeW = '1.5'; dash = ''; }
    else              { fill = '#F2EEF8';      stroke = '#C0B4D8'; strokeW = '1';   dash = 'stroke-dasharray="5 3"'; }

    shapes += `
      <rect class="tree-node" x="${x}" y="${y}" width="${nodeW}" height="${nodeH}" rx="10"
            fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${dash}
            style="animation-delay:${delay}s"
            ${isUser && hasFill ? 'filter="url(#glow)"' : ''}/>
    `;

    // Generation label
    const lblColor = isUser
      ? 'rgba(60,30,0,.7)'
      : hasFill ? 'rgba(200,168,75,.85)' : 'rgba(160,150,180,.7)';
    shapes += `
      <text x="${x+12}" y="${y+18}" font-size="9" font-weight="800" letter-spacing="0.5"
            fill="${lblColor}" font-family="Inter,sans-serif">
        ${node.kaz.toUpperCase()}
      </text>
    `;

    // Name
    const nameColor = isUser ? '#1A0A00' : (hasFill ? '#FFFFFF' : '#B0A8C8');
    const nameW     = hasFill ? '600' : '400';
    const nameStr   = node.name || unknownText;
    const fSize     = nameStr.length > 22 ? 12 : 15;
    shapes += `
      <text x="${cx}" y="${midY+7}" text-anchor="middle"
            font-size="${fSize}" font-weight="${nameW}"
            fill="${nameColor}" font-family="Georgia,'Times New Roman',serif">
        ${escapeXML(nameStr)}
      </text>
    `;

    // Decorative ornament
    if (isUser) {
      shapes += `<text x="${x+nodeW-18}" y="${midY+7}" font-size="14"
                       fill="rgba(50,25,0,.4)" text-anchor="middle">★</text>`;
    } else if (hasFill) {
      shapes += `<text x="${x+nodeW-18}" y="${midY+7}" font-size="13"
                       fill="rgba(200,168,75,.38)" text-anchor="middle">✦</text>`;
    }
  });

  return `
    <svg viewBox="0 0 ${W} ${totalH}" width="100%" style="max-width:${W}px"
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Шежіре ағашы">
      ${defs}${shapes}
    </svg>
  `;
}

function escapeXML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Navbar ────────────────────────────────────────────────────── */

function bindNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── AI Modal ──────────────────────────────────────────────────── */

function openAiModal(type) {
  const c = AI_MODAL[currentLang]?.[type];
  if (!c) return;
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-icon">${c.icon}</div>
    <h2 class="modal-title" id="modal-title">${c.title}</h2>
    <p class="modal-text">${c.text}</p>
    <p class="modal-text modal-detail">${c.detail}</p>
    <div class="modal-chip">${t('modal.chip')}</div>
  `;
  document.getElementById('ai-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAiModal() {
  document.getElementById('ai-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function bindModalBackdrop() {
  document.getElementById('ai-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAiModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAiModal();
  });
}

/* ── Toast ─────────────────────────────────────────────────────── */

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

/* ── Utilities ─────────────────────────────────────────────────── */

function scrollToForm() {
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================================================================
   SHARE IMAGE GENERATION — Instagram-ready 1080×1350 PNG
   ================================================================ */

/* ── Zhuz color palettes ───────────────────────────────────────── */

const ZHUZ_COLORS = {
  uly:   { bg: '#001A4A', nodeTop: '#1B4D8A', nodeBot: '#00244E' },
  orta:  { bg: '#0A2E1A', nodeTop: '#1A5E3A', nodeBot: '#07220F' },
  kishi: { bg: '#2E0A1A', nodeTop: '#6A1A3A', nodeBot: '#1F0612' },
  other: { bg: '#001A4A', nodeTop: '#1B4D8A', nodeBot: '#00244E' },
};
const GOLD = '#C8A84B';

/* ── Canvas helper: rounded rect ───────────────────────────────── */

function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

/* ── Diamond drawing helpers ───────────────────────────────────── */

function drawDiamond(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
}

function drawDiamondDivider(ctx, cx, y, width, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;

  // Center diamond
  drawDiamond(ctx, cx, y, 11);
  ctx.fill();

  // Side diamonds
  drawDiamond(ctx, cx - 40, y, 7);
  ctx.fill();
  drawDiamond(ctx, cx + 40, y, 7);
  ctx.fill();

  // Smaller outer diamonds
  ctx.globalAlpha = 0.4;
  drawDiamond(ctx, cx - 80, y, 4);
  ctx.fill();
  drawDiamond(ctx, cx + 80, y, 4);
  ctx.fill();

  // Dots
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx - 120, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 120, y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Lines
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, y);
  ctx.lineTo(cx - 140, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 140, y);
  ctx.lineTo(cx + width / 2, y);
  ctx.stroke();

  ctx.restore();
}

function drawDiamondGrid(ctx, W, H, color) {
  ctx.save();
  const size = 80;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.1;
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      drawDiamond(ctx, x + size / 2, y + size / 2, size / 2 - 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ── Font loading helper ───────────────────────────────────────── */

async function ensureFontsLoaded() {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Trigger loading of needed fonts
  const families = ['Playfair Display', 'Inter'];
  for (const f of families) {
    try { await document.fonts.load(`400 48px "${f}"`); } catch (_) { /* ok */ }
    try { await document.fonts.load(`700 48px "${f}"`); } catch (_) { /* ok */ }
  }
}

/* ── Ornament: Ram horn motif (кошкар мүйіз) ──────────────────── */

function drawRamHornMotif(ctx, cx, cy, angle, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const s = scale || 1;

  // Left spiral
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-12 * s, -18 * s, -22 * s, -10 * s);
  ctx.quadraticCurveTo(-30 * s, -2 * s, -24 * s, 8 * s);
  ctx.quadraticCurveTo(-18 * s, 16 * s, -10 * s, 12 * s);
  ctx.stroke();

  // Right spiral
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(12 * s, -18 * s, 22 * s, -10 * s);
  ctx.quadraticCurveTo(30 * s, -2 * s, 24 * s, 8 * s);
  ctx.quadraticCurveTo(18 * s, 16 * s, 10 * s, 12 * s);
  ctx.stroke();

  ctx.restore();
}

function drawCornerOrnament(ctx, cx, cy, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const s = 1.8;

  // Double spiral for corner
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14 * s, -22 * s, -26 * s, -12 * s);
  ctx.quadraticCurveTo(-34 * s, -2 * s, -28 * s, 10 * s);
  ctx.quadraticCurveTo(-20 * s, 20 * s, -10 * s, 14 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14 * s, -22 * s, 26 * s, -12 * s);
  ctx.quadraticCurveTo(34 * s, -2 * s, 28 * s, 10 * s);
  ctx.quadraticCurveTo(20 * s, 20 * s, 10 * s, 14 * s);
  ctx.stroke();

  ctx.restore();
}

function drawOrnamentalBorder(ctx, W, H, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;

  // Inner border rect
  const m = 35;
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 4);
  ctx.stroke();

  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.2;

  // Corner ornaments
  drawCornerOrnament(ctx, m + 20, m + 20, 0);
  drawCornerOrnament(ctx, W - m - 20, m + 20, Math.PI / 2);
  drawCornerOrnament(ctx, W - m - 20, H - m - 20, Math.PI);
  drawCornerOrnament(ctx, m + 20, H - m - 20, -Math.PI / 2);

  // Side motifs — top and bottom
  const motifCount = 5;
  const spacing = (W - m * 2 - 120) / (motifCount + 1);
  for (let i = 1; i <= motifCount; i++) {
    const x = m + 60 + spacing * i;
    drawRamHornMotif(ctx, x, m + 6, Math.PI, 0.6);
    drawRamHornMotif(ctx, x, H - m - 6, 0, 0.6);
  }

  // Side motifs — left and right
  const motifCountV = 7;
  const spacingV = (H - m * 2 - 120) / (motifCountV + 1);
  for (let i = 1; i <= motifCountV; i++) {
    const y = m + 60 + spacingV * i;
    drawRamHornMotif(ctx, m + 6, y, Math.PI / 2, 0.6);
    drawRamHornMotif(ctx, W - m - 6, y, -Math.PI / 2, 0.6);
  }

  ctx.restore();
}

/* ── Tamga watermark ───────────────────────────────────────────── */

function drawTamgaWatermark(ctx, tamga, cx, cy) {
  if (!tamga) return;
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = GOLD;
  ctx.font = '320px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tamga, cx, cy);
  ctx.restore();
}

/* ── Draw tree on canvas ───────────────────────────────────────── */

function drawTreeOnCanvas(ctx, nodes, colors, startY, W) {
  const nodeW = 400;
  const nodeH = 90;
  const gap = 30;
  const cx = W / 2;
  const unknownText = t('tree.unknown');

  nodes.forEach((node, i) => {
    const x = cx - nodeW / 2;
    const y = startY + i * (nodeH + gap);
    const midY = y + nodeH / 2;
    const isUser = node.isUser === true;
    const hasFill = !!node.name;

    // Connector to next node
    if (i < nodes.length - 1) {
      const y1 = y + nodeH;
      const y2 = y + nodeH + gap - 10;
      ctx.save();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.globalAlpha = hasFill ? 0.75 : 0.28;
      if (!hasFill) ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, y1);
      ctx.lineTo(cx, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.moveTo(cx, y2 + 10);
      ctx.lineTo(cx - 5, y2);
      ctx.lineTo(cx + 5, y2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Node background
    ctx.save();
    if (isUser) {
      // Gold gradient
      const grad = ctx.createLinearGradient(x, y, x + nodeW, y + nodeH);
      grad.addColorStop(0, '#E8C96A');
      grad.addColorStop(1, '#7A5E18');
      ctx.fillStyle = grad;
      // Glow
      ctx.shadowColor = 'rgba(200,168,75,0.5)';
      ctx.shadowBlur = 16;
    } else if (hasFill) {
      const grad = ctx.createLinearGradient(x, y, x, y + nodeH);
      grad.addColorStop(0, colors.nodeTop);
      grad.addColorStop(1, colors.nodeBot);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
    }
    roundRect(ctx, x, y, nodeW, nodeH, 12);
    ctx.fill();
    ctx.restore();

    // Node border
    ctx.save();
    if (isUser) {
      ctx.strokeStyle = '#E8C96A';
      ctx.lineWidth = 1.5;
    } else if (hasFill) {
      ctx.strokeStyle = 'rgba(200,168,75,0.3)';
      ctx.lineWidth = 1;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
    }
    roundRect(ctx, x, y, nodeW, nodeH, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Generation label
    ctx.save();
    ctx.font = '800 15px Inter, sans-serif';
    ctx.letterSpacing = '0.5px';
    if (isUser) {
      ctx.fillStyle = 'rgba(60,30,0,0.7)';
    } else if (hasFill) {
      ctx.fillStyle = 'rgba(200,168,75,0.85)';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(node.kaz.toUpperCase(), x + 16, y + 14);
    ctx.restore();

    // Name
    const nameStr = node.name || unknownText;
    let fSize = 26;
    if (nameStr.length > 22) fSize = 20;
    else if (nameStr.length > 16) fSize = 23;

    ctx.save();
    ctx.font = `600 ${fSize}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isUser) {
      ctx.fillStyle = '#1A0A00';
    } else if (hasFill) {
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
    }

    // Truncate if too wide
    let displayName = nameStr;
    const maxW = nodeW - 60;
    if (ctx.measureText(displayName).width > maxW) {
      while (displayName.length > 3 && ctx.measureText(displayName + '...').width > maxW) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '...';
    }
    ctx.fillText(displayName, cx, midY + 8);
    ctx.restore();

    // Decorative ornament
    if (isUser) {
      ctx.save();
      ctx.font = '18px serif';
      ctx.fillStyle = 'rgba(50,25,0,0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2605', x + nodeW - 24, midY + 4);
      ctx.restore();
    } else if (hasFill) {
      ctx.save();
      ctx.font = '16px serif';
      ctx.fillStyle = 'rgba(200,168,75,0.38)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2726', x + nodeW - 24, midY + 4);
      ctx.restore();
    }
  });
}

/* ── Main composition ──────────────────────────────────────────── */

async function generateShareImage() {
  await ensureFontsLoaded();

  const canvas = document.getElementById('share-canvas');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1350;

  // Gather data
  const name = document.getElementById('your-name').value.trim();
  const data = collectData(name);
  const zhuzId = data.zhuz || 'other';
  const colors = ZHUZ_COLORS[zhuzId] || ZHUZ_COLORS.other;

  // Tribe info
  const tribe = currentTribe;
  const tamga = tribe ? tribe.tamga : null;
  const ruName = data.ru;
  const uran = tribe ? tribe.uran : '';

  // Zhuz display name
  const zhuzDisplay = data.zhuz
    ? (currentLang === 'kk'
      ? { uly: 'Ұлы жүз', orta: 'Орта жүз', kishi: 'Кіші жүз', other: 'Жүзден тыс' }[data.zhuz]
      : { uly: 'Ұлы жүз', orta: 'Орта жүз', kishi: 'Кіші жүз', other: 'Вне жузов' }[data.zhuz])
    : '';

  // Build node list: oldest → user (same as renderTree)
  const nodes = [
    ...data.ancestors.slice().reverse(),
    { kaz: t('tree.you'), label: '', name: data.name, isUser: true },
  ];

  // ─── Layer 1: Background ───
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, H);

  // ─── Layer 2: Diamond grid ───
  drawDiamondGrid(ctx, W, H, GOLD);

  // ─── Layer 3: Ornamental border ───
  drawOrnamentalBorder(ctx, W, H, GOLD);

  // ─── Layer 4: Title "Шежіре" ───
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.font = '700 48px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(200,168,75,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('Шежіре', W / 2, 68);
  ctx.restore();

  // ─── Layer 5: Top divider ───
  drawDiamondDivider(ctx, W / 2, 140, W - 120, GOLD);

  // ─── Layer 6: Tamga watermark ───
  drawTamgaWatermark(ctx, tamga, W / 2, H / 2);

  // ─── Layer 7: Tree ───
  const treeStartY = 170;
  drawTreeOnCanvas(ctx, nodes, colors, treeStartY, W);

  // ─── Layer 8: Tribe info ───
  const infoY = treeStartY + nodes.length * (90 + 30) - 30 + 25;

  if (zhuzDisplay || ruName) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.8;
    ctx.font = '500 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    const parts = [zhuzDisplay, ruName].filter(Boolean);
    ctx.fillText(parts.join('  \u00b7  '), W / 2, infoY);
    ctx.restore();
  }

  if (uran) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.55;
    ctx.font = 'italic 18px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const uranLabel = currentLang === 'kk' ? 'Ұраны' : 'Уран';
    ctx.fillText(`${uranLabel}: ${uran}`, W / 2, infoY + 32);
    ctx.restore();
  }

  // ─── Layer 9: Bottom divider + branding ───
  drawDiamondDivider(ctx, W / 2, H - 100, W - 120, GOLD);

  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.45;
  ctx.font = '300 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('skezire.kz', W / 2, H - 60);
  ctx.restore();

  return canvas;
}

/* ── Share flow ────────────────────────────────────────────────── */

async function shareTree() {
  const btn = document.querySelector('.btn-share');
  if (!btn || btn.classList.contains('generating')) return;

  btn.classList.add('generating');
  showToast(t('share.generating'));

  try {
    const canvas = await generateShareImage();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    });

    // Try Web Share API with file support
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'shezhire.png', { type: 'image/png' });
      const shareData = { title: t('share.title'), files: [file] };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          showToast(t('share.ready'));
        } catch (err) {
          if (err.name !== 'AbortError') throw err;
          // User cancelled — do nothing
        }
        return;
      }
    }

    // Fallback: download
    downloadBlob(blob, 'shezhire.png');
    showToast(t('share.ready'));
  } catch (err) {
    console.error('Share error:', err);
    showToast(t('share.error'));
  } finally {
    btn.classList.remove('generating');
  }
}

/* ── Download flow (replaces stub) ─────────────────────────────── */

async function downloadTree() {
  const btn = document.querySelector('[data-i18n="tree.btn.save"]');
  try {
    showToast(t('share.generating'));
    const canvas = await generateShareImage();
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    });
    downloadBlob(blob, 'shezhire.png');
    showToast(t('share.ready'));
  } catch (err) {
    console.error('Download error:', err);
    showToast(t('share.error'));
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
