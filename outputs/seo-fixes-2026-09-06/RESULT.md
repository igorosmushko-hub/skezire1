# SEO-исправления — 6 сентября 2026

Статус: локальная реализация. Commit, push и deploy не выполнялись. Чужие изменения сохранены, включая `tribe.updatedAt` в sitemap. Полный исходный аудит: `../seo-audit-2026-09-06/AUDIT.md`.

## Изменено

- `robots.ts`: снят запрет `/_next/` в обеих группах; `/api/` и `/agents/` остаются закрытыми.
- `sitemap.ts`: исключены root-редирект и две create-формы с noindex. Добавлены canonical-страницы дерева kk/ru, которые уже есть в live sitemap, но отсутствовали в локальном генераторе. Итог: 170 URL.
- Казахский title AI-раздела локализован; русский сохранён.
- В существующий футер добавлены публичные ссылки на тарифы и дерево родов в обоих языках.
- Фоны Hero/About используют те же изображения через `next/image`: адаптивные размеры, preload и высокий приоритет героя, отложенная загрузка нижнего орнамента. Для этих двух декоративных слоёв задано качество 5; список `[5,20,75]` сохраняет качество 75 по умолчанию для остальных изображений. Прозрачность 0,08/0,15 и кадрирование cover сохранены.
- Для декоративных слоёв низкое качество выбрано намеренно: они отображаются с прозрачностью и не содержат контента. Проверенные WebP-варианты шириной 750 px: Hero — 59 424 байта (−79% от 284 438), About — 66 660 байт (−83% от 394 422). Размеры конкретных вариантов, а не оценка всего трафика страницы.

## Проверки и границы

- Финальная production-сборка с проверкой TypeScript, точечный ESLint и `git diff --check` прошли. ESLint охватывает изменённые TS/TSX-файлы, Next config и smoke-script. Фактические логи: `build.log`, `lint.log`.
- `node scripts/verify-seo.mjs` проверяет robots, sitemap, обе локали, доступность новых ссылок, noindex форм, разные title и атрибуты загрузки изображений. Требуется запущенная локальная production-сборка на порту3106 или URL первым аргументом.
- Playwright: RU mobile390×844 и KK desktop1440×900. Проверены изображения, отсутствие horizontal overflow, footer links; сохранены и просмотрены скриншоты в `../../output/playwright/`.
- Независимое code-review выполнено. Временный отказ smoke-test во время проверки старой сборки устранён rebuild/restart, затем проверка повторена.
- В локальном окружении `/api/tribe/stats` возвращает503: статистика родов недоступна. Этот сервис не изменялся; полная работоспособность приложения в production не заявляется.
- Локальные обходы выполняются без sitemap-seeding, чтобы не уйти по абсолютным ссылкам на production. Canonical и hreflang сохраняют production origin; соответствующие предупреждения на localhost не требуют менять их на localhost.
- Финальные обходы: по 89 страниц в KK/RU, без ошибок загрузки и достижения лимита обхода. В каждом обходе 86 обычных URL и 3 состояния дерева с query-параметрами. `orphan_page` отсутствует; оставшиеся дубли title относятся к состояниям дерева с общим canonical. Проверка `verify-seo.mjs` прошла для всех 170 URL sitemap и проверяемых атрибутов обеих локалей (`verify.log`).
- Финальный Lighthouse mobile RU: **85/100; LCP 3,6 с; FCP 2,7 с**. Файл `performance-q5-local-ru.json`. По сравнению с предыдущим замером 80/100 и LCP 4,4 с, уменьшение декоративного ресурса дало улучшение; это одиночные лабораторные прогоны, а не доказательство стабильного ускорения.
- **LCP остаётся выше 2,5 с.** Главным элементом по-прежнему является орнамент Hero. Отчёт также отмечает оставшиеся затраты на изображения карточек, блокирующий CSS и стороннюю Метрику. Полное устранение проблем скорости не заявляется. Локальный Lighthouse нельзя напрямую сравнивать с live 10,8 с как доказательство эффекта: отличаются сервер и окружение. CrUX/GSC не подключались.

## Что не менялось

HSTS, массовая редактура title, добавление schema на служебные страницы и переработка статей не выполнялись: исходный аудит не дал оснований для автоматических изменений этих частей. Наличие больших кандидатов srcset само по себе не доказывает их скачивание. Эффект на индексацию и реальные пользовательские показатели можно подтвердить только после отдельного развёртывания и свежих измерений.

<!-- FINDING_HANDOFF -->

## Все исходные findings: 8/8

Все fixed/changed ниже — только локально. Исходный инвентарь173URL и доказательства остаются в предыдущем аудите.

| ID и точный title | Outcome | Решение и проверка |
|---|---|---|
| crawl:title_duplicate — title_duplicate: Duplicate title (2 URLs) | fixed | KK/RU title различаются; локальный smoke-test. |
| crawl:noindex — noindex: Noindex found (2 URLs) | no-change | Сохранён noindex форм; из sitemap они исключены. |
| crawl:hsts_missing — hsts_missing: HSTS header missing (172 URLs) | deferred | Отдельная серверная настройка HTTPS, не SEO-блокер. |
| crawl:structured_data_missing — structured_data_missing: No structured data detected (18 URLs) | no-change | Подходящий тип schema не подтверждён; фиктивная разметка не добавляется. |
| crawl:image_oversized_candidate — image_oversized_candidate: Oversized image candidates (16 URLs) | deferred | Реальные фоновые ресурсы улучшены отдельно; не все кандидаты srcset признаны дефектами. |
| crawl:title_too_wide — title_too_wide: Title may truncate on some devices (9 URLs) | deferred | Эвристика ширины требует редакторского решения. |
| crawl:orphan_page — orphan_page: No observed internal links (4 URLs) | changed | Публичные HTML-ссылки на все4страницы есть, цели200; orphan_page исчез из локальных обходов. |
| crawl:redirected_url — redirected_url: URL redirects (1 URL) | no-change | Языковой редирект сохранён, корень удалён из sitemap. |

Первоначальный slow_response: no-change, не воспроизведён в повторных измерениях исходного аудита; серверная логика не менялась.

## Findings локальных повторных обходов

| Обход | ID и точный title | Outcome | Обоснование |
|---|---|---|---|
| KK | canonical_mismatch — Canonical differs from final URL | no-change | Production canonical намеренно отличается от localhost. |
| KK | noindex — Noindex found | no-change | Сохранён noindex форм; из sitemap они исключены. |
| KK | canonicalized_page — Canonicalized page | no-change | Production canonical намеренно отличается от localhost. |
| KK | title_too_wide — Title may truncate on some devices | deferred | Эвристика ширины требует редакторского решения. |
| KK | image_oversized_candidate — Oversized image candidates | deferred | Реальные фоновые ресурсы улучшены отдельно; не все кандидаты srcset признаны дефектами. |
| KK | structured_data_missing — No structured data detected | no-change | Подходящий тип schema не подтверждён; фиктивная разметка не добавляется. |
| KK | redirected_url — URL redirects | no-change | Языковой редирект сохранён, корень удалён из sitemap. |
| KK | meta_description_duplicate — Duplicate meta description | not-needed | Основное дерево и3query-варианта с общим canonical; отдельные descriptions не требуются. |
| KK | title_duplicate — Duplicate title | not-needed | Основное дерево и3его query-варианта из существующего WIP имеют общий canonical; отдельные title для состояния интерфейса не требуются. |
| KK | hreflang_incomplete — Hreflang missing self reference | not-needed | Production hreflang сохраняется; localhost не поисковая языковая версия. |
| RU | canonical_mismatch — Canonical differs from final URL | no-change | Production canonical намеренно отличается от localhost. |
| RU | noindex — Noindex found | no-change | Сохранён noindex форм; из sitemap они исключены. |
| RU | canonicalized_page — Canonicalized page | no-change | Production canonical намеренно отличается от localhost. |
| RU | title_too_wide — Title may truncate on some devices | deferred | Эвристика ширины требует редакторского решения. |
| RU | image_oversized_candidate — Oversized image candidates | deferred | Реальные фоновые ресурсы улучшены отдельно; не все кандидаты srcset признаны дефектами. |
| RU | structured_data_missing — No structured data detected | no-change | Подходящий тип schema не подтверждён; фиктивная разметка не добавляется. |
| RU | meta_description_duplicate — Duplicate meta description | not-needed | Основное дерево и3query-варианта с общим canonical; отдельные descriptions не требуются. |
| RU | title_duplicate — Duplicate title | not-needed | Основное дерево и3его query-варианта из существующего WIP имеют общий canonical; отдельные title для состояния интерфейса не требуются. |
| RU | hreflang_incomplete — Hreflang missing self reference | not-needed | Production hreflang сохраняется; localhost не поисковая языковая версия. |
