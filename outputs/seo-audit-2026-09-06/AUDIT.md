# SEO-аудит skezire.kz — 6 сентября 2026

Аудит выполнен с установленным скиллом [iannuttall/seo](https://github.com/iannuttall/seo) и его CLI `seo 0.2.40`. Проверены 173 адреса из sitemap: корень перенаправляет на `/kk`, остальные 172 страницы возвращают 200. Основные проблемы: блокировка ресурсов поисковых роботов, медленный первый экран мобильных главных, слабая доступность отдельных страниц через ссылки и несогласованность sitemap с noindex.

Изменения сайта не вносились. Это результаты аудита и рекомендации, не выполненные исправления.

## Что проверено и где границы

- Обход публичного HTML: 172 страницы, 86 на kk и 86 на ru; предел 300 страниц, глубина 8, лимит не достигнут. Все URL sitemap учтены. Проверены 4053 наблюдаемые внутренние ссылки; это не число уникальных ссылок и не проверка внешних сайтов.
- Сохранён полный результат `crawl_410607ff643046eda8e5035b8a66edf3` от 2026-09-06 11:12 UTC, без усечения списков страниц. Первый проход ограничивался 100 страницами и не служит итоговым охватом.
- Проверены robots.txt, sitemap, HTTP-ответы, title/description/H1, canonical, языковые связи, JSON-LD и alt в исходном HTML; дополнительно сделаны 10 HTTP-проверок, включая несуществующую страницу.
- Выполнены два мобильных Lighthouse-замера через `seo`: по одному для `/ru` и `/kk`. Общий обход выполнялся без JavaScript; Lighthouse загружал страницы в браузере. Авторизованные сценарии и содержание закрытых разделов не проверялись.
- В CLI нет Google token. Текущие GSC, Google-selected canonical, индексирование конкретных URL, запросы, позиции, клики, конверсии и CrUX — **UNAVAILABLE**. Анализ обратных ссылок и конкурентов не выполнялся. Нулевые значения внутренних полей `scoreFactors.clicks` не являются измеренными нулевыми кликами.
- Предыдущая проверка от 5 сентября подсказала отдельно перепроверить robots. Её исторические GSC-цифры в текущие результаты не перенесены.
- Локальная ветка `codex/genealogy-lazy-rollout`, HEAD `c407cc5a9cffd2a1781a4c58317fd6c3c0fe8e4a`, содержит чужие незакоммиченные изменения. Source используется для поиска мест исправления, а состояние сайта установлено по live-ответам. В частности, live sitemap содержит `/shezhire-tree`, текущая локальная версия генератора отличается.

## Что исправлять сначала

### 1. P1 — открыть ресурсы, необходимые для отображения сайта

В [robots.txt](https://skezire.kz/robots.txt) для `*` и `Yandex` сохранён `Disallow: /_next/`. Он перекрывает CSS/JS, шрифты и оптимизированные изображения. `Allow: /` этого не отменяет: более конкретный запрет имеет приоритет.

На каждой главной из 41 найденного URL ресурса запрещены 40, на двух проверенных статьях — 16 из 17. В счёт входят CSS/JS, preload и `img src`; CSS-фоны и все варианты srcset этой дополнительной проверкой не перечислялись. HTML страниц доступен, поэтому это **дефект доступа к ресурсам**, а не доказанная причина отсутствия индексации или потери трафика. [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

Рекомендация: пересмотреть общий запрет `/_next/`; как минимум разрешить `/_next/static/` и используемый `/_next/image`, сохранив необходимые ограничения `/api/` и `/agents/`. Место в source: `src/app/robots.ts`. Проверка после исправления: точные URL подключённых CSS/JS/изображений разрешены Googlebot и отвечают 200; затем проверка отрисовки в GSC. Самостоятельного обещания индексации это не даёт.

Доказательства: `robots.txt`, `live-checks.json`, `live/*.html`, воспроизводимая проверка `python3 verify-live.py`. Парсер правил — зависимость `robots-parser` установленного инструмента; в `check-robots.mjs` есть проверка приоритета более конкретного правила.

### 2. P1 — ускорить мобильный первый экран

| Страница | Lighthouse performance | LCP | FCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|
| `/ru` | 62/100 | 10,8 с | 4,1 с | 70 мс | 0,015 |
| `/kk` | 65/100 | 11,0 с | 3,3 с | 160 мс | 0,012 |

Это два лабораторных замера с мобильным профилем, а не полевые Core Web Vitals. Они показывают позднее появление самого крупного элемента; заметного сдвига вёрстки в этих запусках нет.

На `/ru` Lighthouse определил LCP-элемент `body > section#hero > div.hero-ornament`. В диагностике изображений: `ornament-hero.webp` — 284 438 байт, `ornament-about.webp` — 394 422 байта. Общий оценочный резерв оптимизации изображений — 563 KiB; это оценка инструмента, не гарантированная экономия после правки. В source фон подключён через CSS (`src/styles/globals.css:294` и `:574`), первый орнамент имеет opacity 0.08.

Рекомендация: начать с уменьшения веса и мобильного варианта декоративных фонов, проверить необходимость загрузки каждого из них и момент обнаружения LCP-ресурса. Не добавлять preload всем картинкам. После правки повторить Lighthouse с теми же условиями и проверить визуальный результат. Доказательства: `performance-ru-mobile.json`, `performance-kk-mobile.json`.

### 3. P2 — согласовать sitemap с назначением страниц

В sitemap 173 уникальных URL. Из них два — `/kk/ai/family-portrait/create` и `/ru/ai/family-portrait/create` — имеют явный `noindex`; ещё один — `/` — перенаправляет на `/kk`.

Формы создания портрета относятся к действию пользователя, а для поискового входа существуют отдельные страницы `/ai/family-portrait`. Рекомендация: **оставить noindex форм**, убрать их из sitemap; для корня сохранить языковой редирект, а в sitemap оставить конечные `/kk` и `/ru`. Это очистка противоречивых сигналов, а не критический сбой сайта. [Google: состав sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Места в source: `src/app/sitemap.ts`, `src/app/[locale]/ai/family-portrait/create/page.tsx:22`. Проверка после правки: sitemap содержит только предназначенные для поиска конечные URL, формы остаются доступны пользователю и сохраняют noindex.

### 4. P2 — добавить публичные ссылки на тарифы и дерево родов

Полный обход не нашёл входящих HTML-ссылок на `/kk/pricing`, `/ru/pricing`, `/kk/shezhire-tree`, `/ru/shezhire-tree`. Все четыре URL доступны из sitemap и имеют self-canonical. Это вывод о публичном HTML в выбранном обходе, а не утверждение, что пользователь вообще не может попасть на страницу.

Для тарифов source объясняет часть поведения: ссылка появляется в `NavbarAuth.tsx:28` после входа и при нулевом балансе. Рекомендация: если тарифы должны привлекать поиск и помогать гостю принять решение, дать им обычную ссылку из AI-раздела. Для дерева родов — релевантную ссылку из энциклопедии/карточек родов. В dirty source уже есть условная ссылка в `TribeDetail.tsx:68`, но текущий публичный обход её не подтверждает; это не следует выдавать за выполненный production-фикс.

Проверка: повторный неавторизованный обход должен увидеть входящую ссылку на каждый предназначенный для поиска URL.

### 5. P2 — локализовать title AI-раздела

`/kk/ai` и `/ru/ai` возвращают один title: «AI фото трансформация — Нейросеть | Шежіре». В source обе ветки `isKk` действительно равны (`src/app/[locale]/ai/page.tsx:19`). Description и H1 различаются, поэтому ошибка ограничена title и не означает, что страницы целиком дублируются.

Рекомендация: написать казахский title для `/kk/ai`, сохранив конкретное назначение раздела. Проверка: два осмысленных локализованных title в live HTML при сохранении self-canonical и hreflang.

### 6. P2 — усилить полезность справочных статей, выборочно

В 22 локализованных статьях сканер не обнаружил внешних ссылок. Само по себе это не ошибка и не требование добавлять ссылки в каждый материал.

Вручную прочитана пара `/kk/blog/how-to-create-shezhire` и `/ru/blog/how-to-create-shezhire`. Русская статья обещает «Полное руководство», но ограничивается общими советами: спросить семью, обратиться в архивы, записать имена. Нет примера записи, списка вопросов родственникам, способа отметить неподтверждённые сведения или конкретного архивного маршрута. Между советами стоят два AI-промоблока; утверждения об образах предков могут смешивать творческую обработку с документальным восстановлением.

Рекомендация: привести обещание и содержимое в соответствие; добавить практический образец и ясное разделение семейного предания, документов и творческого AI-изображения. Для исторических утверждений — проверяемые источники там, где они действительно нужны. Это редакторская оценка конкретной пары статей, не массовый приговор всему блогу и не доказанная причина их статуса в Google. Полная историческая факт-проверка не выполнялась.

## Что работает и что не нужно чинить по одному предупреждению

- Все 172 страницы имеют title, description, ровно один H1 и один self-canonical. У 170 страниц в HTML есть kk/ru/x-default; обратные языковые ссылки согласованы. У двух форм с noindex hreflang не обнаружен в HTML, но kk/ru/x-default присутствуют в HTTP-заголовке Link — отдельного дефекта здесь не установлено.
- В наблюдаемом HTML нет изображений без alt и синтаксически невалидного JSON-LD. Это не проверка качества каждого alt или соответствия разметки правилам Google для расширенных результатов.
- Несуществующий URL вернул настоящий 404; две отдельные soft-404 пробы сканера также прошли.
- 172 предупреждения об отсутствии HSTS — одна настройка HTTPS-защиты на уровне сервера, не 172 отдельных SEO-блокера. Отсутствие заголовка подтверждено; выносить это выше robots/LCP оснований нет.
- Отсутствие schema на 18 служебных/интерактивных страницах не требует массово добавлять `Organization` или произвольный тип. Для каждой строки ниже оставлено решение по назначению страницы.
- 16 предупреждений oversized images основаны в том числе на варианте 3840w в `srcset`; наличие такого кандидата не доказывает, что мобильный браузер его скачал. Обоснованный первый шаг по весу изображений дан отдельно по результатам Lighthouse.
- Девять широких title — оценка возможного обрезания, не нарушение лимита Google. Не укорачивать автоматически без проверки смысла.
- В первом проходе восемь URL получили `slow_response`; в расширенном обходе предупреждение отсутствует. Дополнительные последовательные curl-проверки показали TTFB 0,356–0,430 с, полную загрузку ответа 0,587–0,748 с. Это локальные HTTP-замеры, не пользовательские Core Web Vitals и не основание переписывать серверную часть.

## Установка и воспроизведение

- Скилл: `/Users/am/.codex/skills/seo/SKILL.md`; установлен через штатный `skill-installer` из `iannuttall/seo/skills/seo`.
- Upstream main при установке: `52f10012021131c2405cddfb976d583a6af3b490` (наблюдаемый SHA, не гарантия неизменности будущего main).
- CLI: `seo 0.2.40`, Node `22.22.3`; команда доступна через `/Users/am/.local/bin/seo`. MCP-сервер отдельно не подключался, для этого аудита использован CLI.
- Скилл будет доступен для автоматического выбора со следующего сообщения; в этом аудите его файл уже прочитан и применён напрямую.

```bash
seo report --url https://skezire.kz --crawl-max-pages 300 --crawl-max-depth 8 --actions-only --json
seo reports run performance-audit --params '{"url":"https://skezire.kz/ru","strategy":"mobile"}' --json
seo reports run performance-audit --params '{"url":"https://skezire.kz/kk","strategy":"mobile"}' --json
```

Инструмент использует локальный cache; для нового сравнения после изменений нужен свежий обход/`refresh`, а не чтение сохранённого снимка. JSON CLI усекал подробный массив страниц, поэтому полный текущий снимок экспортирован штатной SDK-функцией `loadCrawlReport` в `crawl-complete.json`. Команда `seo reports describe report` в этой версии не поддерживается: верхнеуровневый `seo report` запускается напрямую; схемы дополнительных зарегистрированных отчётов прочитаны перед выполнением.

Полные исходные findings, evidence, verification и предупреждения: `report-actions-expanded.json`, `report-full.json`, `crawl-complete.json`. В таблице ниже сохранены точные ID/title инструмента, разрешённый outcome и собственное решение по каждому пункту. `deferred` означает, что исправление предложено, но не выполнено в рамках аудита. В исходных JSON поля `open` сохранены как оригинальные данные сканера.

<!-- GENERATED_TABLES -->

## Полная таблица решений: 8 из 8 findings

| ID и точный title | Outcome | Решение и доказательство | Проверка после возможной правки |
|---|---|---|---|
| crawl:title_duplicate — title_duplicate: Duplicate title (2 URLs) | deferred | Подтверждён одинаковый русский title двух языков; локализовать kk. Аудит не включает изменение сайта. | Re-run the crawl and confirm this title appears on only one indexable URL. |
| crawl:noindex — noindex: Noindex found (2 URLs) | no-change | Сохранить noindex двух create-форм: отдельные посадочные страницы существуют. Исключение форм из sitemap рекомендовано отдельно. | Для принятого решения: noindex остаётся, формы отсутствуют в sitemap. Общая подсказка инструмента удалить noindex здесь не применяется. |
| crawl:hsts_missing — hsts_missing: HSTS header missing (172 URLs) | deferred | Отсутствие HSTS подтверждено. Настройка HTTPS-защиты низкого приоритета; не доказанный SEO-блокер. | Re-run the crawl and confirm hasHsts is true for HTTPS pages. |
| crawl:structured_data_missing — structured_data_missing: No structured data detected (18 URLs) | no-change | У 18 служебных/интерактивных страниц не подтверждена необходимость конкретного типа разметки. Не добавлять общую schema ради снятия предупреждения. | Изменений нет; при будущем добавлении сначала подтвердить подходящий тип и видимые свойства, затем валидировать. |
| crawl:image_oversized_candidate — image_oversized_candidate: Oversized image candidates (16 URLs) | deferred | 3840w в srcset — кандидат, а не факт мобильной загрузки. Для конкретных фоновых изображений есть отдельное Lighthouse-доказательство; остальные требуют проверки реально выбранного ресурса. | Re-run the crawl and confirm oversizedImageCandidates is empty, then spot-check the page in a browser performance trace if the image is important. |
| crawl:title_too_wide — title_too_wide: Title may truncate on some devices (9 URLs) | deferred | Эвристика ширины: проверить смысл и видимость главной формулировки перед редактурой каждого title. Реальное обрезание в выдаче не измерялось. | Re-run the audit and review estimatedPixels, referencePixels, confidence, and profile. Confirm the important wording appears early. |
| crawl:orphan_page — orphan_page: No observed internal links (4 URLs) | deferred | На четырёх страницах ноль входящих ссылок в полном публичном HTML-обходе. Для pricing и shezhire-tree предложены разные релевантные точки входа. | Re-run a complete crawl from the same site entry point and confirm an observed internal link reaches the page. |
| crawl:redirected_url — redirected_url: URL redirects (1 URL) | no-change | 307 / → /kk соответствует языковой маршрутизации; сохранить редирект. Убрать корень из sitemap рекомендовано отдельно. | Корень перенаправляет на /kk; sitemap перечисляет конечные URL. |

### Дополнительное решение по первому ограниченному проходу

| ID и точный title | Outcome | Проверка и решение |
|---|---|---|
| crawl:slow_response — slow_response: Slow response in this crawl (8 URLs) | no-change | Не воспроизведено в расширенном обходе; повторно проверены все 8 исходных URL, каждый HTTP 200. TTFB 0,356–0,430 с. Evidence: timing-rechecks.json. |

В окончательном actions-ответе нет поля inventories и нет nextPage. Чтобы передать весь охват, ниже дан собственный полный инвентарь sitemap, сопоставленный с неусечённым crawl. Counts: 173 URL, 172 HTML-документа. Полные title/description, ссылки, hreflang, разметка и evidence каждой строки сохранены в crawl-complete.json; удобный табличный экспорт — urls.csv.

## Полный инвентарь URL: 173 из 173

Indexable означает только отсутствие обнаруженного запрета в HTML/HTTP, а не нахождение страницы в индексе Google. ID в колонке «Наблюдения» ссылаются на решения выше. Общие рекомендации robots применимы к подключённым ресурсам; ручная проверка точных asset URL выполнена на выборке, описанной в отчёте.

| URL | HTTP / индексируемость | Входящие HTML-ссылки | Наблюдения CLI | Решение по URL |
|---|---|---:|---|---|
| [/](https://skezire.kz/) | 307 → /kk (200) |  | redirected_url | Сохранить языковой редирект; исключить из sitemap. |
| [/kk](https://skezire.kz/kk) | 200 / indexable | 90 | hsts_missing, image_oversized_candidate, title_too_wide | Оптимизировать первый экран по мобильному Lighthouse. Проверить реально выбранный размер изображения, не удалять srcset автоматически. Ширину title проверить перед редактурой. |
| [/kk/ai](https://skezire.kz/kk/ai) | 200 / indexable | 86 | hsts_missing, title_duplicate | Локализовать kk title. |
| [/kk/ai/action-figure](https://skezire.kz/kk/ai/action-figure) | 200 / indexable | 18 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/ai/ancestor](https://skezire.kz/kk/ai/ancestor) | 200 / indexable | 69 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/ai/family-portrait](https://skezire.kz/kk/ai/family-portrait) | 200 / indexable | 9 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/ai/family-portrait/create](https://skezire.kz/kk/ai/family-portrait/create) | 200 / noindex | 1 | hsts_missing, noindex | Сохранить noindex формы; исключить из sitemap. |
| [/kk/ai/ghibli-style](https://skezire.kz/kk/ai/ghibli-style) | 200 / indexable | 15 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/ai/national-costume](https://skezire.kz/kk/ai/national-costume) | 200 / indexable | 8 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/ai/past](https://skezire.kz/kk/ai/past) | 200 / indexable | 72 | hsts_missing, image_oversized_candidate, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. Ширину title проверить перед редактурой. |
| [/kk/ai/pet-humanize](https://skezire.kz/kk/ai/pet-humanize) | 200 / indexable | 12 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/kk/blog](https://skezire.kz/kk/blog) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/ai-action-figure](https://skezire.kz/kk/blog/ai-action-figure) | 200 / indexable | 1 | hsts_missing, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Ширину title проверить перед редактурой. |
| [/kk/blog/ai-photo-trends-2026](https://skezire.kz/kk/blog/ai-photo-trends-2026) | 200 / indexable | 8 | hsts_missing, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Ширину title проверить перед редактурой. |
| [/kk/blog/ai-preserving-shezhire](https://skezire.kz/kk/blog/ai-preserving-shezhire) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/guide-kazakh-tribes](https://skezire.kz/kk/blog/guide-kazakh-tribes) | 200 / indexable | 1 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/how-to-create-shezhire](https://skezire.kz/kk/blog/how-to-create-shezhire) | 200 / indexable | 1 | hsts_missing | Редакторская доработка практического руководства, без смены URL/canonical. |
| [/kk/blog/how-to-find-your-tribe](https://skezire.kz/kk/blog/how-to-find-your-tribe) | 200 / indexable | 53 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/tamga-symbol](https://skezire.kz/kk/blog/tamga-symbol) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/three-zhuz](https://skezire.kz/kk/blog/three-zhuz) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/uran-war-cry](https://skezire.kz/kk/blog/uran-war-cry) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/what-is-shezhire](https://skezire.kz/kk/blog/what-is-shezhire) | 200 / indexable | 12 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/blog/zheti-ata-seven-ancestors](https://skezire.kz/kk/blog/zheti-ata-seven-ancestors) | 200 / indexable | 52 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/contacts](https://skezire.kz/kk/contacts) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/delivery](https://skezire.kz/kk/delivery) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/encyclopedia](https://skezire.kz/kk/encyclopedia) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi](https://skezire.kz/kk/encyclopedia/kishi) | 200 / indexable | 28 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/aday](https://skezire.kz/kk/encyclopedia/kishi/aday) | 200 / indexable | 27 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/alasha](https://skezire.kz/kk/encyclopedia/kishi/alasha) | 200 / indexable | 24 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/baybakty](https://skezire.kz/kk/encyclopedia/kishi/baybakty) | 200 / indexable | 26 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/bersh](https://skezire.kz/kk/encyclopedia/kishi/bersh) | 200 / indexable | 24 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/esentemir](https://skezire.kz/kk/encyclopedia/kishi/esentemir) | 200 / indexable | 7 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/karakesek](https://skezire.kz/kk/encyclopedia/kishi/karakesek) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/karatay](https://skezire.kz/kk/encyclopedia/kishi/karatay) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/kerderi](https://skezire.kz/kk/encyclopedia/kishi/kerderi) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/kete](https://skezire.kz/kk/encyclopedia/kishi/kete) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/kyzylkurt](https://skezire.kz/kk/encyclopedia/kishi/kyzylkurt) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/maskar](https://skezire.kz/kk/encyclopedia/kishi/maskar) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/ramadan](https://skezire.kz/kk/encyclopedia/kishi/ramadan) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/shekti](https://skezire.kz/kk/encyclopedia/kishi/shekti) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/sherkesh](https://skezire.kz/kk/encyclopedia/kishi/sherkesh) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/shomekei](https://skezire.kz/kk/encyclopedia/kishi/shomekei) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/tabyn](https://skezire.kz/kk/encyclopedia/kishi/tabyn) | 200 / indexable | 6 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/tama](https://skezire.kz/kk/encyclopedia/kishi/tama) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/tana](https://skezire.kz/kk/encyclopedia/kishi/tana) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/taz](https://skezire.kz/kk/encyclopedia/kishi/taz) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/teleu](https://skezire.kz/kk/encyclopedia/kishi/teleu) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/tileu](https://skezire.kz/kk/encyclopedia/kishi/tileu) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/ysyk](https://skezire.kz/kk/encyclopedia/kishi/ysyk) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/zhagalbayly](https://skezire.kz/kk/encyclopedia/kishi/zhagalbayly) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/kishi/zhappas](https://skezire.kz/kk/encyclopedia/kishi/zhappas) | 200 / indexable | 25 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta](https://skezire.kz/kk/encyclopedia/orta) | 200 / indexable | 12 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/argyn](https://skezire.kz/kk/encyclopedia/orta/argyn) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/kerey](https://skezire.kz/kk/encyclopedia/orta/kerey) | 200 / indexable | 10 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/konyrat](https://skezire.kz/kk/encyclopedia/orta/konyrat) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/kypshak](https://skezire.kz/kk/encyclopedia/orta/kypshak) | 200 / indexable | 10 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/merkit](https://skezire.kz/kk/encyclopedia/orta/merkit) | 200 / indexable | 1 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/naiman](https://skezire.kz/kk/encyclopedia/orta/naiman) | 200 / indexable | 13 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/tarakty](https://skezire.kz/kk/encyclopedia/orta/tarakty) | 200 / indexable | 1 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/orta/uak](https://skezire.kz/kk/encyclopedia/orta/uak) | 200 / indexable | 12 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/other](https://skezire.kz/kk/encyclopedia/other) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/other/koja](https://skezire.kz/kk/encyclopedia/other/koja) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/other/tolengit](https://skezire.kz/kk/encyclopedia/other/tolengit) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/other/tore](https://skezire.kz/kk/encyclopedia/other/tore) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly](https://skezire.kz/kk/encyclopedia/uly) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/alban](https://skezire.kz/kk/encyclopedia/uly/alban) | 200 / indexable | 7 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/dulat](https://skezire.kz/kk/encyclopedia/uly/dulat) | 200 / indexable | 17 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/jalayir](https://skezire.kz/kk/encyclopedia/uly/jalayir) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/janyis](https://skezire.kz/kk/encyclopedia/uly/janyis) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/kanly](https://skezire.kz/kk/encyclopedia/uly/kanly) | 200 / indexable | 6 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/katagan](https://skezire.kz/kk/encyclopedia/uly/katagan) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/oshakty](https://skezire.kz/kk/encyclopedia/uly/oshakty) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/shanishkily](https://skezire.kz/kk/encyclopedia/uly/shanishkily) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/shapyrashty](https://skezire.kz/kk/encyclopedia/uly/shapyrashty) | 200 / indexable | 16 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/sirgeli](https://skezire.kz/kk/encyclopedia/uly/sirgeli) | 200 / indexable | 9 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/suan](https://skezire.kz/kk/encyclopedia/uly/suan) | 200 / indexable | 6 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/encyclopedia/uly/ysty](https://skezire.kz/kk/encyclopedia/uly/ysty) | 200 / indexable | 33 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/glossary](https://skezire.kz/kk/glossary) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/kk/leaderboard](https://skezire.kz/kk/leaderboard) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/oferta](https://skezire.kz/kk/oferta) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/order/canvas](https://skezire.kz/kk/order/canvas) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/payment-policy](https://skezire.kz/kk/payment-policy) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/pricing](https://skezire.kz/kk/pricing) | 200 / indexable | 0 | hsts_missing, orphan_page | Добавить ссылку из AI-раздела, доступную гостю. |
| [/kk/privacy](https://skezire.kz/kk/privacy) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/refund](https://skezire.kz/kk/refund) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/shezhire-tree](https://skezire.kz/kk/shezhire-tree) | 200 / indexable | 0 | hsts_missing, orphan_page, structured_data_missing | Дать публичную ссылку из энциклопедии; проверить доступность дерева без заблокированных ресурсов. Schema не добавлять без подходящего подтверждённого типа. |
| [/kk/zheti-ata](https://skezire.kz/kk/zheti-ata) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru](https://skezire.kz/ru) | 200 / indexable | 86 | hsts_missing, image_oversized_candidate, title_too_wide | Оптимизировать первый экран по мобильному Lighthouse. Проверить реально выбранный размер изображения, не удалять srcset автоматически. Ширину title проверить перед редактурой. |
| [/ru/ai](https://skezire.kz/ru/ai) | 200 / indexable | 86 | hsts_missing, title_duplicate | Сохранить русский title; проверить различие с kk. |
| [/ru/ai/action-figure](https://skezire.kz/ru/ai/action-figure) | 200 / indexable | 18 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/ai/ancestor](https://skezire.kz/ru/ai/ancestor) | 200 / indexable | 69 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/ai/family-portrait](https://skezire.kz/ru/ai/family-portrait) | 200 / indexable | 9 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/ai/family-portrait/create](https://skezire.kz/ru/ai/family-portrait/create) | 200 / noindex | 1 | hsts_missing, noindex | Сохранить noindex формы; исключить из sitemap. |
| [/ru/ai/ghibli-style](https://skezire.kz/ru/ai/ghibli-style) | 200 / indexable | 15 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/ai/national-costume](https://skezire.kz/ru/ai/national-costume) | 200 / indexable | 8 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/ai/past](https://skezire.kz/ru/ai/past) | 200 / indexable | 72 | hsts_missing, image_oversized_candidate, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. Ширину title проверить перед редактурой. |
| [/ru/ai/pet-humanize](https://skezire.kz/ru/ai/pet-humanize) | 200 / indexable | 12 | hsts_missing, image_oversized_candidate | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Проверить реально выбранный размер изображения, не удалять srcset автоматически. |
| [/ru/blog](https://skezire.kz/ru/blog) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/ai-action-figure](https://skezire.kz/ru/blog/ai-action-figure) | 200 / indexable | 1 | hsts_missing, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Ширину title проверить перед редактурой. |
| [/ru/blog/ai-photo-trends-2026](https://skezire.kz/ru/blog/ai-photo-trends-2026) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/ai-preserving-shezhire](https://skezire.kz/ru/blog/ai-preserving-shezhire) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/guide-kazakh-tribes](https://skezire.kz/ru/blog/guide-kazakh-tribes) | 200 / indexable | 1 | hsts_missing, title_too_wide | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Ширину title проверить перед редактурой. |
| [/ru/blog/how-to-create-shezhire](https://skezire.kz/ru/blog/how-to-create-shezhire) | 200 / indexable | 1 | hsts_missing, title_too_wide | Редакторская доработка практического руководства, без смены URL/canonical. Ширину title проверить перед редактурой. |
| [/ru/blog/how-to-find-your-tribe](https://skezire.kz/ru/blog/how-to-find-your-tribe) | 200 / indexable | 53 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/tamga-symbol](https://skezire.kz/ru/blog/tamga-symbol) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/three-zhuz](https://skezire.kz/ru/blog/three-zhuz) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/uran-war-cry](https://skezire.kz/ru/blog/uran-war-cry) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/what-is-shezhire](https://skezire.kz/ru/blog/what-is-shezhire) | 200 / indexable | 12 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/blog/zheti-ata-seven-ancestors](https://skezire.kz/ru/blog/zheti-ata-seven-ancestors) | 200 / indexable | 52 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/contacts](https://skezire.kz/ru/contacts) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/delivery](https://skezire.kz/ru/delivery) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/encyclopedia](https://skezire.kz/ru/encyclopedia) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi](https://skezire.kz/ru/encyclopedia/kishi) | 200 / indexable | 28 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/aday](https://skezire.kz/ru/encyclopedia/kishi/aday) | 200 / indexable | 27 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/alasha](https://skezire.kz/ru/encyclopedia/kishi/alasha) | 200 / indexable | 24 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/baybakty](https://skezire.kz/ru/encyclopedia/kishi/baybakty) | 200 / indexable | 26 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/bersh](https://skezire.kz/ru/encyclopedia/kishi/bersh) | 200 / indexable | 24 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/esentemir](https://skezire.kz/ru/encyclopedia/kishi/esentemir) | 200 / indexable | 7 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/karakesek](https://skezire.kz/ru/encyclopedia/kishi/karakesek) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/karatay](https://skezire.kz/ru/encyclopedia/kishi/karatay) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/kerderi](https://skezire.kz/ru/encyclopedia/kishi/kerderi) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/kete](https://skezire.kz/ru/encyclopedia/kishi/kete) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/kyzylkurt](https://skezire.kz/ru/encyclopedia/kishi/kyzylkurt) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/maskar](https://skezire.kz/ru/encyclopedia/kishi/maskar) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/ramadan](https://skezire.kz/ru/encyclopedia/kishi/ramadan) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/shekti](https://skezire.kz/ru/encyclopedia/kishi/shekti) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/sherkesh](https://skezire.kz/ru/encyclopedia/kishi/sherkesh) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/shomekei](https://skezire.kz/ru/encyclopedia/kishi/shomekei) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/tabyn](https://skezire.kz/ru/encyclopedia/kishi/tabyn) | 200 / indexable | 6 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/tama](https://skezire.kz/ru/encyclopedia/kishi/tama) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/tana](https://skezire.kz/ru/encyclopedia/kishi/tana) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/taz](https://skezire.kz/ru/encyclopedia/kishi/taz) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/teleu](https://skezire.kz/ru/encyclopedia/kishi/teleu) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/tileu](https://skezire.kz/ru/encyclopedia/kishi/tileu) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/ysyk](https://skezire.kz/ru/encyclopedia/kishi/ysyk) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/zhagalbayly](https://skezire.kz/ru/encyclopedia/kishi/zhagalbayly) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/kishi/zhappas](https://skezire.kz/ru/encyclopedia/kishi/zhappas) | 200 / indexable | 25 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta](https://skezire.kz/ru/encyclopedia/orta) | 200 / indexable | 12 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/argyn](https://skezire.kz/ru/encyclopedia/orta/argyn) | 200 / indexable | 11 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/kerey](https://skezire.kz/ru/encyclopedia/orta/kerey) | 200 / indexable | 10 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/konyrat](https://skezire.kz/ru/encyclopedia/orta/konyrat) | 200 / indexable | 8 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/kypshak](https://skezire.kz/ru/encyclopedia/orta/kypshak) | 200 / indexable | 10 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/merkit](https://skezire.kz/ru/encyclopedia/orta/merkit) | 200 / indexable | 1 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/naiman](https://skezire.kz/ru/encyclopedia/orta/naiman) | 200 / indexable | 13 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/tarakty](https://skezire.kz/ru/encyclopedia/orta/tarakty) | 200 / indexable | 1 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/orta/uak](https://skezire.kz/ru/encyclopedia/orta/uak) | 200 / indexable | 10 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/other](https://skezire.kz/ru/encyclopedia/other) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/other/koja](https://skezire.kz/ru/encyclopedia/other/koja) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/other/tolengit](https://skezire.kz/ru/encyclopedia/other/tolengit) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/other/tore](https://skezire.kz/ru/encyclopedia/other/tore) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly](https://skezire.kz/ru/encyclopedia/uly) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/alban](https://skezire.kz/ru/encyclopedia/uly/alban) | 200 / indexable | 7 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/dulat](https://skezire.kz/ru/encyclopedia/uly/dulat) | 200 / indexable | 17 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/jalayir](https://skezire.kz/ru/encyclopedia/uly/jalayir) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/janyis](https://skezire.kz/ru/encyclopedia/uly/janyis) | 200 / indexable | 2 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/kanly](https://skezire.kz/ru/encyclopedia/uly/kanly) | 200 / indexable | 4 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/katagan](https://skezire.kz/ru/encyclopedia/uly/katagan) | 200 / indexable | 3 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/oshakty](https://skezire.kz/ru/encyclopedia/uly/oshakty) | 200 / indexable | 15 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/shanishkily](https://skezire.kz/ru/encyclopedia/uly/shanishkily) | 200 / indexable | 5 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/shapyrashty](https://skezire.kz/ru/encyclopedia/uly/shapyrashty) | 200 / indexable | 16 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/sirgeli](https://skezire.kz/ru/encyclopedia/uly/sirgeli) | 200 / indexable | 7 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/suan](https://skezire.kz/ru/encyclopedia/uly/suan) | 200 / indexable | 6 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/encyclopedia/uly/ysty](https://skezire.kz/ru/encyclopedia/uly/ysty) | 200 / indexable | 17 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/glossary](https://skezire.kz/ru/glossary) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
| [/ru/leaderboard](https://skezire.kz/ru/leaderboard) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/oferta](https://skezire.kz/ru/oferta) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/order/canvas](https://skezire.kz/ru/order/canvas) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/payment-policy](https://skezire.kz/ru/payment-policy) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/pricing](https://skezire.kz/ru/pricing) | 200 / indexable | 0 | hsts_missing, orphan_page | Добавить ссылку из AI-раздела, доступную гостю. |
| [/ru/privacy](https://skezire.kz/ru/privacy) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/refund](https://skezire.kz/ru/refund) | 200 / indexable | 86 | hsts_missing, structured_data_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/shezhire-tree](https://skezire.kz/ru/shezhire-tree) | 200 / indexable | 0 | hsts_missing, orphan_page, structured_data_missing | Дать публичную ссылку из энциклопедии; проверить доступность дерева без заблокированных ресурсов. Schema не добавлять без подходящего подтверждённого типа. |
| [/ru/zheti-ata](https://skezire.kz/ru/zheti-ata) | 200 / indexable | 86 | hsts_missing | Сохранить URL и self-canonical; адресной правки содержания по этому обходу не назначено. |
