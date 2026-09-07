# Первый выпуск 47/4 RU/KK: применение и откат

Версия приложения `1.1.0-rc.1`. Production в этой задаче не устанавливается.
Точный candidate SHA и preview фиксируются в `first-release-result.md` после проверки.

## Состав и обязательная конфигурация

102 энциклопедические страницы (47 родов + 4 раздела × 2 языка), две страницы дерева, 42 существующих названия ветвей. Источник — `src/data/tribes.ts`, bibliography — `src/data/encyclopedia-sources.ts`. Реестр/оговорки отражают источники, не доказывают каждое биологическое ребро. ID, связи и глифы исходного дерева сохранены; спорные списки явно описаны в статье.

**GENEALOGY_SOURCE=repo**, **GENEALOGY_INCLUDE_PRIVATE=0** на build/runtime. `GENEALOGY_DATABASE_URL` и `GENEALOGY_ROOT_KEY` отсутствуют/пусты. Установить эти значения явно, не наследовать Tumalas-конфигурацию старого preview. External source API обязан вернуть400, numeric/external highlight — нейтральную недоступность. Отсутствие source тоже открывает repo, но не заменяет этот preflight.

Не применять genealogy004/source-lock/публичность в первом выпуске. Их миграции и принятые исследования сохранены для отдельного расширения Tumalas; публикации новых записей0. Neon не является runtime-зависимостью этого выпуска.

Node24, установка `npm ci`, production build. `.vercelignore`/`.dockerignore` исключают `.env*`, базы/документы/скрипты и локальные артефакты. Ключи сервиса Supabase/Firebase/Robokassa не помещать в NEXT_PUBLIC переменные. Существующие настройки публичного production приложения сохраняются. Не включать GENEALOGY_INCLUDE_PRIVATE.

## Условия до назначения даты выпуска

1. Подтвердить target production Vercel/team и payment Supabase project. В текущем авторизованном аккаунте найдены только два preview проекта; платёжный Supabase недоступен. Точный вопрос владельцу задан; не угадывать target.
2. На целевой платёжной БД выполнить read-only `payment-release-preflight.sql`, сверить schema/ACL с миграцией. Исторические paid без receipts и pending quantities сверить с независимыми fulfillment/offer evidence, не начисляя деньги/генерации автоматически. Нулевое число конфликтов не предполагать без запроса.
3. Подтвердить доступный backup/restore механизм и выполнить восстановление в изолированную среду. Локальный synthetic restore не доказывает доступ к восстановлению production. Записать backup ID, время, защищённое место, проверку schema/data/functions/RLS/ACL.
4. Проверить provider sandbox с реальным ResultURL: оплаченный тестовый invoice, повтор GET/POST, ошибка/retry. Подписанный synthetic callback и настоящий локальный PostgREST не заменяют Robokassa sandbox. Реальные деньги в этой задаче не переводить.
5. Закрыть независимое code review, exact preview QA и приём восьми целей Метрики. Baseline GSC снят в `release-measurement-2026-09-05.md`; эффект после публикации не является предрелизной проверкой.

## Операции выпуска (только после закрытия условий)

1. Проверить SHA/чистоту checkout, app-input fingerprint и настройки. Зафиксировать предыдущий безопасный artifact ID, env names/configuration и DB migration history.
2. Остановить создание оплат и перевести ResultURL в retryable503 на всех старых workers/deployments; дождаться завершения текущих callback. Заморозить количество генераций существующих packages до завершения pending invoices.
3. Сделать свежий consistent backup (`pg_dump --format=custom` через защищённый операторский DSN), проверить читаемость и наличие уже испытанного restore path. Сохранить роли/default grants отдельно; backup содержит чувствительные данные и не входит в Git/preview.
4. На **payment Supabase**, под закрытым callback gate, применить только `20260905183201_atomic_package_payment.sql`. Миграция одна транзакция, lock timeout5s/statement timeout60s. При timeout/ошибке — STOP, транзакционный rollback; не продолжать вручную. Миграция одноразовая. Обновить PostgREST schema cache согласно процессу среды.
5. Подтвердить доступ service_role к RPC, отказ anon/authenticated, наличие receiptcolumn. Установить точный проверенный RC на production target отдельным разрешённым действием, сохранив callback gate до smoke.
6. Smoke: RU/KK карта корень47/4, поиск Найман, статья→ветвь→статья, неизвестная ветвь, reload/lang, mobile375; API repo200, unknown404, external400; anonymous production200, canonical/hreflang, robots/sitemap безслучайногоnoindex, отсутствие authwall. Сверить paid/balance/receipt на разрешённом тестовом invoice; повтор не меняет receipt/balance/paid_at. Затем открыть создание оплат/callback.
7. Проверить приём целей и отсутствие личных данных, ошибки/задержки; sitemap/GSC индексацию проверять после публикации, не считать мгновенным результатом.

## Откат

Триггеры: smoke failure, нарушенные ACL, повторное начисление, HTTP5xx, неправильный источник, случайная индексация preview/закрытость production. Сразу закрыть payment creation/ResultURL (503), сохранить receipt/balance и логи, остановить изменение схемы.

Для карты откатить приложение к заранее записанному безопасному deployment/artifact с repo/public-only config. Старый callback уязвим к повторному начислению: его нельзя снова открыть, даже если остальные страницы откатились. Предпочтительна forward correction атомарного обработчика.

Если после миграции не было ни одного fulfillment/reconciliation write: оператор может в транзакции под закрытым gate удалить только RPC и новый receiptcolumn и восстановить сохранённые ACL. Это действие требует подтверждения отсутствия новых writes; автоматического rollback скрипта, уничтожающего receipts, нет.

После любого нового fulfillment/reconciliation column и данные сохраняются. Не сбрасывать paid→pending, не списывать баланс автоматически и не накатывать старый fullbackup поверх новых операций. Backup восстанавливается в изолированную recoveryDB, различия сверяются, готовится forward repair. Подробный порядок — `payment-retry-fix-2026-09-05.md`.

## Что не входит

Полный Tumalas794594, новые public nodes, genealogyDDL, новые SEO-страницы на каждыйID. Старый canvas-order callback не сертифицирован package-fix: известны отсутствие affected-row/amount validation и перезапись paid_at; риск вынесен отдельно и не скрыт за успешными packageтестами.
