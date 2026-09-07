# Первый выпуск: результат подготовки

Дата: 2026-09-05. Статус **BLOCKED_EXTERNAL — READY TO DEPLOY не достигнут**.
Production и внешние DDL не выполнялись.

## Зафиксированный кандидат

- Версия: `1.1.0-rc.1`, branch `codex/first-release-47-ru-kk`.
- Candidate commit: `e950a8c185f17c1e1515c645fd57ed5de3851727`. Последующие изменения отчётов не меняют этот кандидат.
- Protected preview: https://skezire-genealogy-preview-gx2nvfjeb-miks-projects-b711e469.vercel.app/ru/shezhire-tree
- Deployment: `dpl_6CbL1xCQrMYoR6XWxPX1KS11M7KC`, Vercel state `READY`, target preview (не production), Next.js / Node 24.
- Project `prj_DIQXyzeuoFAAolfKu4z4RkawMoiN`, team `team_abl6vxAiovnNNFa3jCQMsVjX`.
- Build/runtime: `GENEALOGY_SOURCE=repo`, `GENEALOGY_INCLUDE_PRIVATE=0`, database URL/root key пусты. API external400 подтверждён на новом preview.
- Dry-upload:242 файла, SHA-256 состава загрузки `07a43075fcc3d2cb5a13bd6fd022f8157afaddd79dcf93209f3d6dadf761eed9` (sorted path/sha JSON). Env, docs/research, scripts, миграции, полная база и buildcache исключены.

Состав:47 родов + 4 раздела RU/KK (102 страницы энциклопедии),2 страницы справочного дерева,42 существующих названия ветвей. ID/связи/глифы сохранены относительно 151b. Исправлены содержание и источники по принятой evidence matrix; условные глифы и спорные списки оговорены. Полный Tumalas (794 594 записи) не включён и не заявляется готовым.

## Проверки

- Production build/TypeScript на Node 24 — PASS. Lint:0 ошибок, 1 прежнее предупреждение img аналитического pixel.
- Runtime genealogy, SEO, контент47/4,9 тестов дерева, import, analytics emitted-template — PASS.
- Профиль (включая устаревшие асинхронные ответы) и12 групп платёжной регрессии — PASS.
- Настоящий локальный PostgreSQL 16 + PostgREST 14.14: ACL, actual GET/POST handler, сумма с шестью десятичными знаками, repeat,8 одновременных callback,неверная сумма,атомарный откат и повтор — PASS. Использовались синтетические данные и подписи, не Robokassa sandbox.
- Genealogy 004/source-lock иrollback — PASS в собственной временной PostgreSQL. Эти миграции не применяются в первом выпуске.
- Независимый code-reviewer: новых блокирующих замечаний по коду нет. Исправлены lock_timeout и statement_timeout в платёжной миграции; повторены затронутые проверки.
- Локальная production browserQA:94 перехода статья→ветвь→статья, RU/KK, desktop/mobile 375 px, поиск/empty/clear, ошибка/retry, back/reload/language, копирование ссылки, неизвестная ветвь и переполнение — PASS.8 визитов с максимум 4 одновременно: p95 страницы 663 мс; поиск 284/279 мс. Это измерение локальной справочной карты.
- Новый preview HTTP:anonymous 302 + noindex, authorized 200 + noindex, repo search 200, external 400, unknown focus 200 с нейтральной недоступностью,article canonical/hreflang/JSON-LD и sitemap 200 — PASS.
- Полная браузерная QA нового preview — BLOCKED: автоматическая проверка разрешений отклонила использование временного QA-cookie; требуется прямое согласие в текущем чате. Матрица, скриншоты и нагрузка preview не выполнены. HTTP-проверки выше не заменяют их.
- Визуальная проверка координатором финальной локальной сборки: карта RU 1440 px и KK 375 px с выбранным Найманом просмотрена, перекрытий элементов управления не обнаружено. Скриншоты находятся в `/private/tmp/skezire-release-qa-final-local/`; это не проверка preview.
- Повторный dry-run после оформления отчётов подтвердил тот же fingerprint и 242 файла приложения.
- Поиск типичных форматов credentials по 389 файлам: только известные DSN с подстановками и примерами в scripts; secret-bearing env исключён и не закоммичен. Это ограниченная проверка шаблонов, не универсальное доказательство отсутствия всех возможных секретов.

## Предрелизные блокеры

0. Завершить браузерную QA нового preview после разрешения использовать временный cookie только для этого URL. Вопрос задан; обход блокировки не выполняется.
1. Настоящий production target/team и платёжный Supabase не установлены в доступных аккаунтах. Не проверены текущая схема/ACL, история paid/pending offers и доступность backup/restore. Подготовлен `payment-release-preflight.sql`; нужен target или ответ владельца с результатом, без передачи credentials в чат.
2. Robokassa sandbox с настоящим ResultURL не доступен. Реальный сценарий провайдера пока не проверен.
3. В счётчике Метрики 107086067 отсутствуют 8 целей public_tree_*/public_article_tree. Автоматическая проверка разрешений отклонила сохранение цели из-за отсутствия явного разрешения на изменение внешней конфигурации. Вопрос о разрешении задан; цели и фактический приём не приняты.

Отдельный существовавший риск: canvas-order callback не проверяет число обновлённых строк и сумму и переписывает paid_at на повторе. Исправление пакетной оплаты не сертифицирует оплату картин.

## Пакет передачи

- `first-release-manifest.json` — состав, хеши, конфигурация и границы DDL.
- `first-release-runbook.md` — предварительные проверки, backup/restore, остановка callback, порядок миграции и приложения, smoke и условия отката.
- `release-measurement-2026-09-05.md` — контракт 8 событий и GSC baseline 7 августа — 3 сентября: 221 клик / 6,49 тыс. показов для URL внутри `/encyclopedia/`.
- `tasks.md` — текущий первый выпуск отдельно от истории Tumalas.

После закрытия блокеров остаются разрешённые операции выпуска по инструкции и проверки опубликованного production. Индексация и SEO-эффект оцениваются после публикации.
