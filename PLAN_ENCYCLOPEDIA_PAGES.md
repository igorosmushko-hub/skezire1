# План: Отдельные страницы энциклопедии (Next.js)

> Дата: 27 февраля 2026
> Статус: готов к реализации

---

## Контекст

Сейчас энциклопедия — **одна страница** `src/app/[locale]/encyclopedia/page.tsx`, рендерящая все 47 родов монолитом. Нужно разбить на **отдельные маршруты** для каждого жуза и рода.

**Прототип** на чистом HTML/JS уже сделан в `/Users/igorosmushko/skezire/` — его нужно мигрировать в Next.js проект.

---

## Целевая URL-схема (Next.js App Router)

| Страница | URL | Route |
|----------|-----|-------|
| Хаб (4 жуза) | `/kk/encyclopedia` | `[locale]/encyclopedia/page.tsx` |
| Жуз | `/kk/encyclopedia/uly` | `[locale]/encyclopedia/[zhuzId]/page.tsx` |
| Род | `/kk/encyclopedia/uly/dulat` | `[locale]/encyclopedia/[zhuzId]/[tribeId]/page.tsx` |

Все страницы **статически генерируются** через `generateStaticParams()`.

---

## Структура файлов

### Новые файлы
```
src/app/[locale]/encyclopedia/
├── page.tsx                          ← ПЕРЕПИСАТЬ (хаб: 4 карточки жузов)
├── [zhuzId]/
│   ├── page.tsx                      ← НОВЫЙ (страница жуза)
│   └── [tribeId]/
│       └── page.tsx                  ← НОВЫЙ (страница рода)
```

### Новые компоненты
```
src/components/encyclopedia/
├── ZhuzSection.tsx                   ← ОСТАВИТЬ (используется на странице жуза)
├── TribeCardEnc.tsx                  ← ОСТАВИТЬ (используется на странице жуза)
├── HubCard.tsx                       ← НОВЫЙ (карточка жуза на хабе)
├── TribeDetail.tsx                   ← НОВЫЙ (полный вид рода)
├── Breadcrumb.tsx                    ← НОВЫЙ (хлебные крошки)
└── Pager.tsx                         ← НОВЫЙ (Prev/Next навигация)
```

### Обновляемые файлы
```
src/messages/kk.json                  ← ОБНОВИТЬ (новые ключи enc.*)
src/messages/ru.json                  ← ОБНОВИТЬ (новые ключи enc.*)
src/styles/encyclopedia.css           ← ОБНОВИТЬ (стили хаба, деталей, пагера)
src/app/sitemap.ts                    ← ОБНОВИТЬ (~106 URL: 2 locale × 53 страницы)
```

---

## Шаги реализации

### Шаг 1. Переводы (messages)

Добавить в `kk.json` и `ru.json` ключи `enc.*`:

```jsonc
// kk.json — добавить в секцию "enc"
{
  "enc": {
    // существующие ключи...
    "hubTitle": "Қазақ рулары энциклопедиясы",
    "hubSub": "Ұлы, Орта, Кіші жүз және Жүзден тыс — 47 рудың толық тарихы",
    "tribesWord": "ру",
    "openZhuz": "Толығырақ",
    "tribesHeading": "Рулар",
    "tribeMore": "Толығырақ →",
    "tribeRegion": "Қоныс аймақ",
    "tribeTamga": "Тамға",
    "tribeUran": "Ұран",
    "tribeSubgroup": "Топ",
    "tribeNotable": "Атақты тұлғалар",
    "pagerPrev": "← Алдыңғы",
    "pagerNext": "Келесі →",
    "ctaTitle": "Шежіре жасау",
    "ctaDesc": "Ата-тегіңіздің тарихын сақтаңыз",
    "ctaBtn": "Шежіре жасау",
    "notFound": "Бет табылмады",
    "notFoundDesc": "Сілтеме қате немесе бет жоқ.",
    "notFoundBack": "← Энциклопедияға оралу"
  }
}
```

Аналогично для `ru.json`.

### Шаг 2. Новые компоненты

#### `src/components/encyclopedia/Breadcrumb.tsx`
```tsx
// Server component
// Принимает: items: { label: string; href?: string }[]
// Рендерит: Шежіре › Энциклопедия › Ұлы жүз › Дулат
```

#### `src/components/encyclopedia/Pager.tsx`
```tsx
// Server component
// Принимает: prev?: { label: string; href: string }, next?: { label: string; href: string }
// Рендерит: ← Алдыңғы Дулат ... Шапырашты Келесі →
```

#### `src/components/encyclopedia/HubCard.tsx`
```tsx
// Server component
// Принимает: zhuz: Zhuz, locale: string
// Рендерит: карточка жуза с иконкой, названием, описанием, счётчиком родов, ссылкой
```

#### `src/components/encyclopedia/TribeDetail.tsx`
```tsx
// Server component
// Принимает: tribe: Tribe, locale: string
// Рендерит: полное описание, карточки с тамгой/ураном/регионом/подгруппой, список атақты тұлғалар
```

### Шаг 3. Страница хаба — `[locale]/encyclopedia/page.tsx`

Переписать: убрать монолитный рендер всех родов. Вместо этого — сетка 4 карточек `<HubCard>` со ссылками на `/[locale]/encyclopedia/[zhuzId]`.

```tsx
export default async function EncyclopediaPage() {
  // Рендер 4 HubCard с Link на [zhuzId]
}
```

### Шаг 4. Страница жуза — `[locale]/encyclopedia/[zhuzId]/page.tsx`

```tsx
import { TRIBES_DB } from '@/data/tribes';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return TRIBES_DB.map(z => ({ zhuzId: z.id }));
}

export async function generateMetadata({ params }) {
  // Динамический title/description на основе zhuz данных
}

export default async function ZhuzPage({ params }) {
  const zhuz = TRIBES_DB.find(z => z.id === params.zhuzId);
  if (!zhuz) notFound();
  // Breadcrumb + описание жуза + сетка TribeCardEnc (ссылки на [tribeId]) + Pager
}
```

**Pager**: prev/next между жузами по порядку в TRIBES_DB.

**TribeCardEnc**: обернуть в `<Link href={...}>` для перехода на страницу рода.

### Шаг 5. Страница рода — `[locale]/encyclopedia/[zhuzId]/[tribeId]/page.tsx`

```tsx
export function generateStaticParams() {
  return TRIBES_DB.flatMap(z =>
    z.tribes.map(t => ({ zhuzId: z.id, tribeId: t.id }))
  );
}

export async function generateMetadata({ params }) {
  // Динамический title: "Дулат — Ұлы жүз | Шежіре"
}

export default async function TribePage({ params }) {
  const zhuz = TRIBES_DB.find(z => z.id === params.zhuzId);
  const tribe = zhuz?.tribes.find(t => t.id === params.tribeId);
  if (!zhuz || !tribe) notFound();
  // Breadcrumb + TribeDetail + Pager (prev/next в рамках жуза) + CTA
}
```

### Шаг 6. Стили — `src/styles/encyclopedia.css`

Добавить стили из прототипа `/Users/igorosmushko/skezire/encyclopedia/encyclopedia.css`:
- `.hub-grid`, `.hub-card`, `.hub-card-*` — сетка хаба
- `.enc-breadcrumb`, `.enc-pager` — навигация
- `.tribe-detail`, `.tribe-detail-*` — страница рода
- `.tribe-notable`, `.notable-*` — атақты тұлғалар
- `.enc-cta` — call-to-action секция

Существующие стили `.enc-tribe-grid`, `.tribe-card`, `.tc-*` — оставить для страницы жуза.

### Шаг 7. Sitemap — `src/app/sitemap.ts`

Генерировать все URL из TRIBES_DB:

```tsx
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skezire.kz';
  const locales = ['kk', 'ru'];
  const entries: MetadataRoute.Sitemap = [];

  // Главные страницы
  for (const locale of locales) {
    entries.push({ url: `${baseUrl}/${locale}`, priority: 1.0, ... });
    entries.push({ url: `${baseUrl}/${locale}/encyclopedia`, priority: 0.9, ... });
  }

  // Жузы и роды
  for (const locale of locales) {
    for (const zhuz of TRIBES_DB) {
      entries.push({ url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}`, priority: 0.9, ... });
      for (const tribe of zhuz.tribes) {
        entries.push({ url: `${baseUrl}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`, priority: 0.8, ... });
      }
    }
  }
  return entries; // ~106 URL
}
```

### Шаг 8. TribeCardEnc — добавить ссылку

Обернуть `TribeCardEnc` в `<Link>` или добавить prop `href`:

```tsx
// Сейчас: <div className="tribe-card">
// Станет: <Link href={`/${locale}/encyclopedia/${zhuzId}/${tribe.id}`} className="tribe-card">
```

Для этого компонент должен знать `zhuzId` — добавить prop.

---

## Навигация

### Хлебные крошки
- **Хаб**: Шежіре › Энциклопедия
- **Жуз**: Шежіре › Энциклопедия › Ұлы жүз
- **Род**: Шежіре › Энциклопедия › Ұлы жүз › Дулат

### Prev/Next
- **Жуз**: между жузами: Ұлы ↔ Орта ↔ Кіші ↔ Жүзден тыс
- **Род**: между родами внутри жуза: Дулат ↔ Жалайыр ↔ ... ↔ Қатаған

### CTA
На странице рода внизу — блок «Шежіре жасау» со ссылкой на `/{locale}#form-section`.

---

## Проверка (Definition of Done)

- [ ] `next build` проходит без ошибок
- [ ] `/kk/encyclopedia` — 4 карточки жузов
- [ ] `/kk/encyclopedia/uly` — описание + 12 родов
- [ ] `/kk/encyclopedia/uly/dulat` — полная страница рода
- [ ] `/ru/encyclopedia/uly/dulat` — русская версия
- [ ] Breadcrumbs рабочие на всех уровнях
- [ ] Prev/Next работает для жузов и родов
- [ ] CTA ведёт на форму на главной
- [ ] Sitemap содержит ~106 URL
- [ ] Responsive (мобильная версия)
- [ ] Прямые ссылки (deep links) работают
- [ ] Переключение языка /kk ↔ /ru сохраняет маршрут

---

## Оценка объёма

| Файл | Действие | Объём |
|------|----------|-------|
| `kk.json` + `ru.json` | Добавить ~15 ключей | мало |
| `Breadcrumb.tsx` | Новый | ~30 строк |
| `Pager.tsx` | Новый | ~40 строк |
| `HubCard.tsx` | Новый | ~40 строк |
| `TribeDetail.tsx` | Новый | ~80 строк |
| `encyclopedia/page.tsx` | Переписать | ~40 строк |
| `[zhuzId]/page.tsx` | Новый | ~70 строк |
| `[zhuzId]/[tribeId]/page.tsx` | Новый | ~70 строк |
| `TribeCardEnc.tsx` | Обновить (+ Link, + zhuzId) | мало |
| `encyclopedia.css` | Добавить ~200 строк | средне |
| `sitemap.ts` | Переписать | ~30 строк |

**Итого**: ~7 новых файлов, ~3 обновлённых, ~500 строк нового кода.
