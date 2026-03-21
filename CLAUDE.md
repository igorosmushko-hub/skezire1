# Шежіре (Skezire) — Казахское генеалогическое дерево онлайн

## Быстрый старт

```bash
npm install        # Установить зависимости (Node >= 22)
npm run dev        # Запустить dev-сервер (http://localhost:3000)
npm run build      # Продакшен-сборка
npm run lint       # ESLint
```

Для работы нужен `.env.local` — запросить у владельца проекта (секреты не в репо).

## Стек

- **Next.js 16** (App Router, React 19, TypeScript, strict mode)
- **next-intl** — i18n, локали: `kk` (казахский, дефолт), `ru` (русский)
- **Firebase Auth** — аутентификация по номеру телефона
- **Supabase (PostgreSQL)** — основная БД
- **Robokassa** — оплата (тенге)
- **Kie AI API** — генерация изображений
- **Telegram Bot API** — уведомления админу
- **Vercel** — хостинг, автодеплой из `main`
- **Docker** — мультистейдж сборка (standalone)

## Структура проекта

```
src/
├── app/
│   ├── [locale]/          # Страницы с i18n (kk, ru)
│   │   ├── page.tsx       # Главная
│   │   ├── ai/            # AI-генерация изображений
│   │   ├── delivery/      # Заказы на печать
│   │   ├── pricing/       # Тарифы
│   │   ├── encyclopedia/  # Энциклопедия родов
│   │   └── profile/       # Профиль пользователя
│   └── api/               # API routes
│       ├── auth/           # Верификация Firebase → JWT
│       ├── generate/       # AI-генерация
│       ├── orders/         # CRUD заказов
│       └── payments/       # Robokassa вебхуки
├── components/            # React-компоненты
├── data/                  # Статические данные (tribes.ts — 47 родов)
├── i18n/                  # Конфигурация next-intl
├── lib/                   # Утилиты (auth, supabase, firebase, robokassa)
├── messages/              # Переводы (kk.json, ru.json)
└── styles/                # CSS
```

## Архитектурные решения

### i18n
- Локали: `kk` (основная), `ru`
- URL: `/kk/...`, `/ru/...` — динамический сегмент `[locale]`
- Middleware (`middleware.ts`) редиректит `/` → `/kk`
- Переводы: `src/messages/kk.json`, `src/messages/ru.json`

### Аутентификация
```
Телефон → Firebase Auth → ID Token → /api/auth/verify
→ Firebase Admin проверяет → Upsert в Supabase (users)
→ JWT сессия → httpOnly cookie
```

### БД (Supabase PostgreSQL)
Основные таблицы:
- `users` — пользователи (phone, usage_count, paid_generations, tribe_id)
- `packages` — тарифы AI-генераций (Starter/Standard/Premium)
- `payments` — платежи через Robokassa
- `products` — физические товары (постеры, холсты)
- `orders` — заказы на печать с доставкой
- `order_status_log` — история статусов заказов

### Компоненты
- **Server components**: Navbar, Footer, Hero, About
- **Client components**: формы, модалки, canvas, дерево (помечены `'use client'`)
- Path alias: `@/*` → `./src/*`

### Данные о родах
47 казахских родов в `src/data/tribes.ts` — структура `Tribe` с полями на kk/ru, тамга, уран, известные личности, подроды.

## Внешние сервисы (env vars)

| Переменная | Сервис |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase клиент |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin (base64) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `KIE_AI_API_KEY` | AI-генерация |
| `ROBOKASSA_*` | Платёжный шлюз |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Уведомления |
| `AUTH_JWT_SECRET` | Подпись JWT сессий |

## Деплой

- **Продакшен**: Vercel, автодеплой при push в `main`
- **Домен**: skezire.kz
- **Docker**: `docker compose up` (порт 3000)

## Дизайн

- **Шрифты**: Playfair Display + Inter
- **Цвета**: синий `#003082`, золотой `#C8A84B`, кремовый `#F5F0E8`
- **Аналитика**: Yandex Metrika

## Соглашения

- Язык коммуникации с пользователем: **русский**
- Коммиты и пуш — только по запросу пользователя
- Не спрашивать подтверждение на каждое действие — работать автономно
- GitHub remote: `https://github.com/igorosmushko-hub/skezire1.git` (репо называется skezire1)
- Ветка для деплоя: `main`
