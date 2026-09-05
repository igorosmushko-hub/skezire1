# QA первого релиза справочного дерева

Проверено 2026-09-05, 19:55–19:56 UTC. Это локальный чистый production build на `http://127.0.0.1:3422`, не preview и не production deployment.

## Состав и доказательства

- Основной источник: `repo`; внешние API и Neon в этом проходе не использовались.
- Скрипт: `scripts/release-browser-check.mjs`.
- Артефакты: `/private/tmp/skezire-release-qa-production/results.json`, `map-ru.png`, `map-kk.png`.
- Запуск: `QA_BASE_URL=http://127.0.0.1:3422 QA_EXPECT_UNAVAILABLE=1 QA_LOAD=1 node scripts/release-browser-check.mjs` с локальным Playwright runtime и Chromium cache.

## Результат: PASS

| Проверка | Результат |
| --- | --- |
| RU и KK, desktop 1440 px | Поиск Найман → выбор → reload; переключение языка сохраняет `highlight=tribe:naiman`; document width 1440 px. |
| RU и KK, mobile 375 px | Корень и восстановленная после ошибки ветвь без горизонтального overflow (`scrollWidth=375`). Back сохраняет рабочую навигацию. |
| 47 статей и 4 раздела | В каждой локали извлечены 47 canonical article URLs из JSON-LD, проверены 4 раздела и все 47 циклов статья → выделенная ветвь → та же статья. |
| Поиск | Инъецированный HTTP 503 показан отдельно; следующий запрос успешен. Empty и Clear проверены. |
| Ветвь | Инъецированный HTTP 503 при загрузке дочерней ветви показывает retry; Retry успешен и сохраняет выбранную ветвь. RU: 39 мс, KK: 39 мс. |
| Недоступная ссылка | Невалидный `highlight` показывает безопасное состояние «ветвь не найдена или недоступна» / KK-вариант, без подмены ошибкой источника. |
| Expand/collapse | Найман сворачивается и раскрывается в обеих локалях. |
| Ссылка на ветвь | Clipboard permissions выданы только отдельному local Playwright context. Копируется URL текущего locale с `highlight=tribe:naiman`, без hash и без другого origin. |
| Hydration и JS errors | Нет browser `pageerror` на свежем production build. Предыдущий dev-only hydration mismatch не воспроизвёлся. |

## Ограниченная нагрузка

Пороги были согласованы до измерения: 8 посещений карты двумя волнами, concurrency 4; warm API ≤1500 мс; local page p95 ≤3000 мс. Фактически `map page p95 = 663 мс` (296, 314, 273, 301, 663, 636, 661, 658), HTTP ошибок не было.

Это измерение справочного дерева `repo` на локальном production build. Оно не подтверждает cold-start preview, нагрузочную способность Neon или production SLA. Для preview применяются согласованные пороги: cold page ≤5000 мс, warm p95 ≤2500 мс, HTTP errors = 0.

## Финальный визуальный контроль local build

После финальных правок проверен exact SHA `e950a8c185f17c1e1515c645fd57ed5de3851727` на `http://127.0.0.1:3422`, без cookies и внешних сервисов. Это отдельный visual smoke, полный matrix/load повторно не запускался.

- RU, 1440 × 900: выбран Найман; видны дерево, карточка выбранной ветви и каталог 47 родов. Скриншот: `/private/tmp/skezire-release-qa-final-local/map-ru-1440-naiman.png`.
- KK, 375 × 812: выбран Найман; карта, карточка ветви и каталог читаемы в одну колонку. `scrollWidth=375` при `innerWidth=375`. Скриншот: `/private/tmp/skezire-release-qa-final-local/map-kk-375-naiman.png`.
- Обе страницы вернули HTTP 200; точные измерения записаны в `/private/tmp/skezire-release-qa-final-local/visual-check.json`.

## Protected preview: BLOCKED

Новый preview `dpl_6CbL1xCQrMYoR6XWxPX1KS11M7KC` и SHA `e950a8c185f17c1e1515c645fd57ed5de3851727` были подготовлены координатором. Его authorized HTTP-проверка зафиксировала Ready, anonymous 302/noindex, authorized map 200/noindex, `repo` search 200, внешний source 400 и нейтральное состояние unknown focus.

Отдельная browser QA этого preview не выполнена. Автоматическая проверка разрешений дважды отклонила использование созданного для QA storage-state: она не считает подтверждение, найденное в `read_thread`, прямой пользовательской авторизацией на локальный cookie для внешнего protected URL. QA-субагент cookie не читал, не выводил и не использовал; координатор использовал его только в отдельно разрешённой HTTP-проверке, описанной выше. Нужна явная авторизация пользователя в текущем чате на read-only QA этого exact preview; после неё остаются browser matrix, screenshots и ограниченная нагрузка preview.
