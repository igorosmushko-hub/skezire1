# Применение и откат карты

Подготовлено 2026-09-05; применение на внешней БД и production не выполнено.

## Защищённый preview

- Target: `prj_DIQXyzeuoFAAolfKu4z4RkawMoiN`, team `team_abl6vxAiovnNNFa3jCQMsVjX`; проект `skezire-genealogy-preview`.
- До изменения проверена настройка SSO `all_except_custom_domains`, Next.js, Node 24.x. Локальная сборка проверена на Node 22.22.3; удалённая сборка завершилась READY при настройке проекта Node 24.x, карта и оба API проверены через защищённый preview.
- Runtime/build: существующий `skezire_preview_reader`, `GENEALOGY_SOURCE=tumalas-local-snapshot`, существующий root key, `GENEALOGY_INCLUDE_PRIVATE=0`. Значения подключения хранить только в secret environment; не помещать в командные отчёты, Git или клиентский bundle.
- Первая попытка передачи DSN остановлена автоматической проверкой до запуска. После явного согласия пользователя передача и установка выполнены: `dpl_2uZChoC8npRgfrX6CYBpXB5fCcja`, [preview](https://skezire-genealogy-preview-98zq36ie7-miks-projects-b711e469.vercel.app/ru/shezhire-tree). Защита доступа сохранена; подробности в genealogy-preview-check-2026-09-05.json.
- Устанавливать только preview из этого worktree, без `--prod`; перед загрузкой `vercel deploy --dry --json` и проверка `.vercelignore`/списка файлов. Production/main и сторонние checkout не менять.
- После READY: HTTP без сессии должен оставаться защищённым и noindex; авторизованно проверить карту, оба API, RU/KK, ссылки 47/4, mobile/error/retry. Не отключать SSO. Не брать `GENEALOGY_INCLUDE_PRIVATE=1` из старого deployment.

## Новая миграция

1. Уполномоченный оператор сверяет target database/source и останавливает импорт/публикацию на время проверки. Read-only DSN приложения для DDL непригоден.
2. До DDL сохранить внешним защищённым backup текущие schema/functions/triggers/grants/RLS и конфигурацию приложения; проверить доступный restore point Neon. Если предполагается менять публичность — отдельно сохранить точные затрагиваемые review-поля/ключи и утверждённый manifest. В этой миграции изменения публичности отсутствуют.
3. Применить **только** `supabase/migrations/20260905151729_genealogy_source_lock.sql` после установленной 004. Не исполнять весь набор Supabase migrations на Neon: там отдельные платёжные/пользовательские сущности. Миграция транзакционная, lock timeout 5 с, statement timeout 60 с; при timeout выяснить блокировку, не удалять ограничения вручную.
4. Сравнить public count/review-поля до/после: без отдельного решения должны остаться неизменными. Сверить новый CHECK, функции, source guard и права reader. `source_locked` старых записей должен остаться NULL; Boolean не позволяет восстановить точные уровни.
5. Не запускать reimport ради backfill. Новый begin отклоняет reviewed sources. Для их обновления нужен отдельный staged import с проверкой и атомарной заменой; обход через очистку review запрещён политикой проекта.
6. После применения повторить actual Neon adapter check. Публикацию нового manifest и production deployment рассматривать отдельно после preview, оснований и release gates.

## Откат

- Предпочтительно откатить приложение к сохранённой проверенной сборке с public-only configuration. Boolean оставлен, старый адаптер читает схему; он может скрыть уже разрешённые source-locked записи. Историческое private-mode preview не подходит для отката публичного сайта.
- SQL: `docs/seo/genealogy-source-lock-rollback.sql`. Он **останавливается**, если существуют `is_public AND locked`; автоматического снятия публикации нет. В таком случае сначала подготовить отдельное утверждённое решение по затрагиваемым ветвям и всей цепочке.
- При успешном SQL rollback возвращаются прежние ограничения просмотра locked, но сохраняются full-chain/source guards и защита reviewed sources от повторного импорта. Числовой столбец сохраняется; старый writer может писать только Boolean, и тогда несовместимый точный уровень переводится в NULL. В SQL-тесте проверено.
- Повторный запуск forward migration после rollback не предполагается: колонка уже существует. Подготовить отдельную forward corrective migration, снимающую временный legacy trigger и возвращающую согласованный CHECK; сверить данные перед ней. Не удалять столбец с recovered metadata.
- После любого отката повторить HTTP/API, RU/KK и число доступных узлов. Все private записи должны оставаться закрытыми.

## Production gates

Отдельно закрыть основания/состав, preview-проверки, общий lint/CI и риск повтора оплаты. Зафиксировать deployment ID, input hashes и конфигурацию без значений секретов; выполнить backup/restore-point проверку. Только затем решение о production; после установки проверить анонимные HTTP, SEO и Search Console. READY или локальный build не заменяют эти проверки.
