# Шежіре — Статус проекта

> Последнее обновление: 26 февраля 2026
> Сессия: миграция на Next.js (завершена)

---

## Что такое Шежіре

Казахское генеалогическое древо онлайн — skezire.kz.
Пользователь выбирает жүз, ру, вводит имена 7 предков (жеті ата) и получает красивое генеалогическое древо.

**Стек:** Next.js 15 (App Router) + TypeScript + next-intl
**Языки интерфейса:** казахский (основной), русский — URL-префиксы `/kk` и `/ru`
**Дизайн:** Playfair Display + Inter, цвета Blue #003082 / Gold #C8A84B / Off-white #F5F0E8

---

## Структура проекта

```
skezire/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    — корневой HTML layout
│   │   ├── sitemap.ts                    — динамический sitemap (4 URL)
│   │   └── [locale]/
│   │       ├── layout.tsx                — layout с шрифтами, metadata, providers
│   │       ├── page.tsx                  — главная страница
│   │       └── encyclopedia/
│   │           └── page.tsx              — энциклопедия (47 родов, data-driven)
│   ├── components/
│   │   ├── Navbar.tsx                    — навбар (server)
│   │   ├── NavbarClient.tsx              — скролл-тень, бургер (client)
│   │   ├── LangSwitcher.tsx              — переключатель KK/RU (client)
│   │   ├── Hero.tsx                      — hero с SVG орнаментом (server)
│   │   ├── About.tsx                     — 3 карточки (server)
│   │   ├── OrnamentDivider.tsx           — SVG разделитель (server)
│   │   ├── FormTreeContainer.tsx         — обёртка form+tree (client, shared state)
│   │   ├── FormSection.tsx               — форма жүз/ру + 7 предков (client)
│   │   ├── TribeCard.tsx                 — карточка рода при выборе (client)
│   │   ├── TreeSection.tsx               — SVG дерево + мета (client)
│   │   ├── ShareImage.tsx                — Canvas 1080×1350 + Web Share (client)
│   │   ├── AiSection.tsx                 — AI карточки (client)
│   │   ├── AiModal.tsx                   — модал "скоро" (client)
│   │   ├── Footer.tsx                    — подвал (server)
│   │   ├── Toast.tsx                     — уведомления (client, React Context)
│   │   ├── JsonLd.tsx                    — Schema.org structured data (server)
│   │   └── encyclopedia/
│   │       ├── ZhuzSection.tsx           — секция жүза с subgroup
│   │       └── TribeCardEnc.tsx          — карточка рода в энциклопедии
│   ├── data/
│   │   └── tribes.ts                     — TRIBES_DB: 47 родов, 4 жүза (typed)
│   ├── lib/
│   │   ├── types.ts                      — Zhuz, Tribe, AncestorNode, TreeFormData
│   │   ├── constants.ts                  — ANCESTOR_DEFS, AI_MODAL, ZHUZ_COLORS
│   │   ├── tree-svg.ts                   — buildTreeSVG() чистая функция
│   │   ├── escapeXml.ts                  — утилита экранирования для SVG
│   │   └── canvas/
│   │       ├── share-image.ts            — generateShareImage + drawTreeOnCanvas
│   │       ├── ornaments.ts              — кошкар мүйіз, рамка, углы
│   │       ├── diamond.ts                — ромбы, разделители, сетка
│   │       └── utils.ts                  — roundRect, watermark, ensureFontsLoaded
│   ├── i18n/
│   │   ├── routing.ts                    — defineRouting + createNavigation
│   │   └── request.ts                    — getRequestConfig для server components
│   ├── messages/
│   │   ├── kk.json                       — 84 ключа переводов (казахский)
│   │   └── ru.json                       — 84 ключа переводов (русский)
│   └── styles/
│       ├── globals.css                   — основные стили (~900 строк)
│       └── encyclopedia.css              — стили энциклопедии (~150 строк)
├── middleware.ts                          — определение локали + редирект
├── next.config.ts                        — next-intl plugin
├── tsconfig.json
├── package.json
├── public/
│   └── robots.txt
├── _legacy/                              — старые файлы до миграции (для справки)
├── skezire.pen                           — дизайн-файл pencil.dev
└── PROJECT_STATUS.md                     — этот файл
```

---

## Что было сделано сегодня (26 февраля 2026)

### Миграция с vanilla HTML/CSS/JS на Next.js 15

Полная перезапись проекта — 117 файлов, 32 845 строк кода.

#### Фаза 1: Инициализация
- Настроен Next.js 15 с App Router, TypeScript, Turbopack
- Установлен next-intl для i18n с `/kk` и `/ru` URL-префиксами
- Middleware для определения локали и редиректа
- Старые файлы перемещены в `_legacy/`

#### Фаза 2: Данные и типы
- TypeScript-интерфейсы: `Zhuz`, `Tribe`, `NotablePerson`, `AncestorNode`, `TreeFormData`
- `TRIBES_DB` конвертирован из глобальной переменной JS в типизированный ES-модуль (47 родов)
- Константы вынесены: `ANCESTOR_DEFS`, `AI_MODAL`, `ZHUZ_COLORS`

#### Фаза 3: Стили и шрифты
- CSS скопирован без изменений (сохранение визуала)
- Стили энциклопедии извлечены из inline `<style>` в отдельный файл
- Шрифты через `next/font/google` — self-hosted, без внешних запросов

#### Фаза 4: Layout и статические компоненты
- Root layout + locale layout с `generateMetadata()` (OG, Twitter, hreflang)
- Navbar с LangSwitcher (переключение через `createNavigation`)
- Hero, About, OrnamentDivider, Footer — server components
- Toast (React Context), AiSection + AiModal
- JsonLd — Schema.org (WebSite, Organization, FAQPage)

#### Фаза 5: Интерактивные компоненты
- FormSection — жүз/ру селекты, поля 7 предков, localStorage, TribeCard
- TreeSection — построение SVG дерева через `buildTreeSVG()`
- ShareImage — Canvas 1080×1350, Web Share API + fallback download
- FormTreeContainer — `'use client'` обёртка с shared state
- Canvas-библиотека вынесена в `lib/canvas/` (4 модуля)

#### Фаза 6: Энциклопедия
- Data-driven страница: 47 родов рендерятся из `TRIBES_DB` (~100 строк React вместо 1409 строк HTML)
- ZhuzSection с группировкой по subgroup для Кіші жүз
- TribeCardEnc с locale-aware данными

#### Фаза 7: SEO и финализация
- `sitemap.ts` — 4 URL (`/kk`, `/ru`, `/kk/encyclopedia`, `/ru/encyclopedia`)
- `robots.txt` — Allow all, Disallow `/_next/` и `/agents/`
- **Build** проходит без ошибок
- Все 4 маршрута отвечают HTTP 200
- Git init + первый коммит + push на GitHub

#### Исправления при верификации
- `next-intl` v4: `Link`, `useRouter`, `usePathname` через `createNavigation()` (не из `next-intl/routing`)
- React 19: `useRef()` требует начальное значение

---

## Репозиторий

**GitHub:** https://github.com/igorosmushko-hub/skezire
**Ветка:** `main`
**Первый коммит:** `b055641` — "Migrate Skezire from vanilla HTML/CSS/JS to Next.js 15"

---

## Что НЕ доделано / известные задачи

### Приоритет 1 — Тестирование
- [ ] Проверить форму в браузере: жүз → ру → карточка → 7 предков → submit → SVG дерево
- [ ] Проверить Canvas share/download (все 4 цветовые схемы)
- [ ] Проверить переключение языков `/kk` ↔ `/ru`
- [ ] Проверить localStorage (жүз, ру, язык сохраняются между сессиями)
- [ ] Responsive: 900px, 768px, 500px
- [ ] Мобильная навигация (бургер-меню)

### Приоритет 2 — Улучшения
- [ ] OG-изображение для соцсетей
- [ ] QR-код на PNG картинке → ссылка на skezire.kz
- [ ] Варианты формата: Story (1080×1920), квадрат (1080×1080)
- [ ] Удалить `_legacy/` после полной проверки

### Приоритет 3 — Новые фичи
- [ ] AI-функции (сейчас заглушки): стилизация фото, история рода
- [ ] PDF-экспорт дерева
- [ ] PWA: service worker, manifest.json, офлайн-доступ
- [ ] Аналитика

---

## Контекст для AI-ассистента

- Пользователь общается на русском, контент проекта — казахский/русский
- Пользователь предпочитает автономную работу без лишних подтверждений
- Коммиты — только по явной просьбе
- Дизайн-система хранится в `skezire.pen` (pencil.dev)
- Все переводы — в `messages/kk.json` и `messages/ru.json` (next-intl)
- База родов — `TRIBES_DB` в `data/tribes.ts`
- npm cache workaround: `--cache /tmp/npm-cache-skezire` (из-за root-owned файлов в ~/.npm)
