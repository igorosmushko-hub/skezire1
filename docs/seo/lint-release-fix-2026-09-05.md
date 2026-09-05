# Исправление lint перед выпуском — 2026-09-05

Статус: **все 14 ошибок исправлены локально**, общий lint проходит: **0 errors / 1 warning**, исходно **14 errors / 12 warnings**. После первичного сообщения о границах координатор явно расширил владение на ProfilePageClient.tsx. Профиль исправлен основным Astra после отдельной диагностики bug-analyzer.

Модель основного исполнителя: GPT-6 Astra. Независимые bug-analyzer и code-reviewer: закреплённые роли Sol/high.

Исполнитель: threadId `01a072d5-b85b-7e53-a403-dc8de36afff6`, cwd `/Users/am/.codex/worktrees/f163/skezire`.

## База и переносы

- Рабочая копия: `/Users/am/.codex/worktrees/f163/skezire`, HEAD `81a5aec4241078a46c0495baa886759340573b76`.
- Источник актуальной конфигурации: `/Users/am/.codex/worktrees/151b/skezire`, только чтение. Прямой запуск там `npm run lint` воспроизвёл ровно 14 errors / 12 warnings.
- До изменения все семь AI-файлов ниже побайтово совпадали с 151b. ProfilePageClient и layout также совпадали.
- Отдельные baseline-переносы: `package.json`, `package-lock.json`, `eslint.config.mjs` скопированы из 151b без изменений. Это уже существующая команда `eslint .`, стандартная конфигурация nextVitals и существующая зависимость Neon; не новые настройки или зависимости данной правки. Для проверок скопирован `node_modules` в собственную копию; env/секреты не копировались.
- SHA-256 переносов: package.json `1c9f929c5f03c8271fce9d9e6aa1d2ff0769ed110b9f392ef0b908678bcd3819`; package-lock.json `ea8931ab013afac5011cef66b2b905d16551a930f84904f89f6c23069edee175`; eslint.config.mjs `b11a1967e30e41d515bb79a788d07a2386686316d8166bd8c44f42a92d7fad1e`.
- Новая карта, genealogy API/данные/миграции и прочие изменения 151b сюда не переносились. Успешная сборка этой копии не означает проверку полного актуального пакета выпуска.

## Собственная правка

AI-интерфейсы: 15 заменённых строк в семи файлах (15 additions / 15 deletions):

- `/Users/am/.codex/worktrees/f163/skezire/src/app/[locale]/ai/family-portrait/create/FamilyPortraitClient.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiActionFigureModal.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiAncestorModal.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiFamilyPortraitModal.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiGhibliModal.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiPastModal.tsx`
- `/Users/am/.codex/worktrees/f163/skezire/src/components/AiPetHumanModal.tsx`

В обработчики добавлены уже используемые `aspectRatio` и `t`. Два локальных переводчика семейного портрета обёрнуты в `useCallback([isKk])`, чтобы зависимые обработчики обновлялись при смене языка. Сохранены разметка, copy, API payload, проверки входа, polling и обработка ошибок. Правила lint не ослаблялись, suppressions не добавлялись.

Профиль: `/Users/am/.codex/worktrees/f163/skezire/src/app/[locale]/profile/ProfilePageClient.tsx`. Независимый диагност установил: hooks-анализатор помечает вызываемые из эффекта memoized callbacks с setters, не различая их положение после await. Все четыре callback использовались только в эффектах. Отдельно браузер подтвердил реальный дефект исходного lifecycle: при A → B в первом render оставался телефон A; старые ответы могли записать данные после смены пользователя, а paymentsLoaded от A блокировал загрузку платежей B.

Внутренний ProfileContent получает React key по user.id: профиль, списки, форма и флаги сбрасываются синхронно при смене аккаунта/выходе. Loaders перенесены внутрь соответствующих effects. AbortController отменяет запросы при cleanup; проверка signal после json игнорирует даже ответ транспорта, не соблюдающего отмену. Три начальных запроса остаются параллельными с независимой обработкой ошибок. Платежи сохраняют lazy-load и кэш; возврат после отмены повторяет чтение. Зависимость от userId сохраняет несохранённый ввод при обновлении объекта того же пользователя. Ответы HTTP с ошибкой не принимаются за успешные данные. API, авторизация и существующие mutation handlers не изменены.

Одна воспроизводимая регрессия: `/Users/am/.codex/worktrees/f163/skezire/scripts/profile-runtime-check.mjs`. Она транспилирует настоящий компонент установленным TypeScript, запускает реальные React/ReactDOM в Chrome и подменяет только внешние imports/auth/fetch. API и реальные аккаунты не используются. Использован уже доступный Playwright из общего runtime; зависимости проекта не добавлены.

Минимальный patch собственной правки (8 исходных файлов + regression script): `/private/tmp/skezire-f163-lint-release.patch`, SHA-256 `1335b827ca5182845fc37559514a1cb7f891cbcc7c95af40bef376685f5c2a40`. Изменения исходников: 74 additions / 57 deletions; `git diff -- src` показывает их отдельно. Для интеграции в 151b нужны этот patch и данный отчёт; baseline package/lock/config уже есть в 151b, их повторно переносить не нужно. Перед применением проверить отсутствие новых правок в целевых файлах. Повторная сверка всех восьми исходных файлов 151b с нашим исходным HEAD выполнена после правки: совпадают.

## Фактические проверки

- Node `v22.22.3`.
- `npm run lint` в 151b: exit 1, 14 errors / 12 warnings.
- `npm run lint` после исправления в f163: exit 0, 0 errors / 1 warning; все ошибки устранены.
- Точечный `eslint` всех семи файлов с `--max-warnings 0`: exit 0, без замечаний. Существующий ESLint проверяет полноту зависимостей; дополнительный дублирующий тест массивов не создавался.
- `npx tsc --noEmit --incremental false`: exit 0.
- `npm run build`: сначала остановлен недоступностью Google Fonts в ограниченном сетевом окружении. Повтор с разрешённым сетевым доступом: exit 0, compilation / TypeScript / 86 static pages успешны. Предупреждения сборки: устаревшее имя middleware и ограничение static generation при edge runtime.
- `git diff --check`: exit 0.
- Браузерная регрессия до правки профиля: exit 1, `A data must disappear in the first B render` — подтверждён исходный дефект.
- Браузерная регрессия после правки: exit 0. Проверены lazy/cached payments, отсутствие A в первом render B, отмена и поздние ответы, возврат после отмены, сохранение ввода при том же ID, HTTP/network failures, logout и ответ старого PATCH имени после перехода на другого пользователя. Ошибок JavaScript нет. Команда из f163:

  ```sh
  NODE_PATH=/Users/am/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/profile-runtime-check.mjs
  ```

  Нужен установленный Chrome и доступный Playwright (для другого окружения изменить NODE_PATH). Первый запуск Chrome в sandbox был заблокирован окружением; разрешённый повтор успешно выполнил тест.
- Независимый code-reviewer: итоговая правка AI + профиля без actionable findings; scoped ESLint и diff check успешны. Ревьюер прочитал regression script, но не смог запустить Chrome в своём sandbox. Основной исполнитель отдельно успешно выполнил полный script с разрешённым запуском Chrome. Полная Next.js hydration и реальные API остаются за границами этой браузерной проверки.

## Остаток и ограничения

- `/Users/am/.codex/worktrees/f163/skezire/src/app/layout.tsx:56`: единственное оставшееся предупреждение `@next/next/no-img-element`. Не менялось, поскольку поручение исключает массовую очистку warnings.
- Браузерный сценарий профиля использовал синтетические ответы. Реальная AI-генерация/оплата и серверная интеграция профиля не запускались; внешние платные операции не выполнялись. Проверки не подтверждают работу внешнего AI-сервиса. Существующая подача ошибок профиля сохранена: при неудаче загрузки нет отдельного error copy; неуспешные платежи остаются незагруженными, возврат на вкладку повторяет запрос.
- Коммиты, push, deploy, внешние миграции и изменения публичности не выполнялись. После интеграции следует повторить lint/build уже на объединённой актуальной версии.

## Хеши для интеграции

Пути ниже относительно f163/151b; абсолютный корень исполнителя указан выше. SHA-256 `151b` — исходник, `f163` — готовая правка. Восемь исходных файлов 151b повторно сверены с исходным HEAD непосредственно при подготовке таблицы.

| Файл | SHA-256 151b | SHA-256 f163 |
|---|---|---|
| `src/app/[locale]/ai/family-portrait/create/FamilyPortraitClient.tsx` | `26447be0a7b969a6e49ca93d0c532cd59a861b1a5c9e54bf5425c990860e9a18` | `e671e7485c7bcc17eb65bce0f47d9aec731df3f6fb367e2494b6ba19385a9a69` |
| `src/app/[locale]/profile/ProfilePageClient.tsx` | `a4fb637c999f16d61175c5c1a9737998eb4c6b10a54bd62fa9c427834ae587bb` | `5ce1553067e8abd1e598a1796f803c3401af5c9747c28c09ff41ac91215ca268` |
| `src/components/AiActionFigureModal.tsx` | `13b1ba0df0dcdc65237438a32e5acb9951fc77eafe2b2b1388295c09f6839bc5` | `9da611df7d463f182775f4b4544b96e50320660906ac7961d4a3631687d107da` |
| `src/components/AiAncestorModal.tsx` | `3cfd9b6ab1574db88cd95dc46856327752b4ccc3b95b76800cdb3e9c6d3fd681` | `691484da9b733af378033d945efde66867e6566459e7a95607cfc257a0965d54` |
| `src/components/AiFamilyPortraitModal.tsx` | `b7344b551cef5999b86eb70a53d30d60aa26408c475e8f73696bfeb8d8c2027c` | `b7c56c651689b457d5435f84a7ff08874789b27330609431e028da41741866e4` |
| `src/components/AiGhibliModal.tsx` | `2cd7286feb5173db0ab32bb2910edaaba203ad9c885fc1b73be7a2dea09fb2b8` | `112bacbfe5c74bca75dc83ad9a3ef604431ec7d63f08daef3fec36345c2e9f6b` |
| `src/components/AiPastModal.tsx` | `151725d3c29a9b90a52600f4493f6046e482dc84734f27cb338d53470d03c4d8` | `bcfc6f3de4cba08351a762743c414d4d10f1a636cd5c329ced3e592322a4aca8` |
| `src/components/AiPetHumanModal.tsx` | `73911d9aefe89f2511c05f2581f7ad5132d7a313707b43fea9fb6dd0ea2b7d9c` | `e332cde4e8b59d103162749f1e90639b5627f45743644820099a131e8679c0f6` |
| `scripts/profile-runtime-check.mjs` | `NEW` | `811d0a5b5f350ac105c524bf6780ff7aa42ec85fd2413e7955638b196c37426d` |

## Coordinator integration in151b

В151b интегрированы собственные patch lint/profile и атомарного подтверждения пакетной оплаты. Общий lint: exit0, 0 ошибок / 1 прежний img warning. Общая npm run build: exit0, TypeScript и88staticpages. Главный агент повторил браузерную регрессию профиля (ReactDOM/Chrome, синтетические auth/API, включая смену пользователя/late responses/pending save) и12групп платёжных тестов на изолированном PostgreSQL16.13 (повторы/гонки/rollback/права/настоящий GET/POST handler с psql adapter): успешно. Независимые bug-analyzer/code-reviewer исполнителей завершены без оставшихся замечаний; главный агент проверил diff и применимость. Изменения локальны: действующий protected preview пока содержит прежнюю сборку; внешние migration/deploy/оплаты не выполнялись.
