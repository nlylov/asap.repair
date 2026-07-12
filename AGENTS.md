# AGENTS — asap.repair

> **This is a static marketing site + a thin layer of Cloudflare Pages
> Functions for edge forwarders.** It is NOT the application. The application
> is `bazas-crm` (Next.js, Railway).

## Repos in this ecosystem

| Repo | Purpose | Status |
|------|---------|--------|
| `bazas-crm` | Next.js app, all business logic, AI, DB, dashboards | **Active — main repo for any new logic** |
| `bazas-proxy` | Tiny Express HTTP forwarder for legacy vendor URLs | **Decommissioning — DO NOT extend** |
| `asap.repair` (you are here) | Static site + edge forwarders for vendor webhooks registered against the asap.repair domain | **Active (frontend + edge proxies only)** |

## What this repo is

1. **Static marketing site** for the Repair ASAP white-label brand — HTML/CSS/JS assets served from Cloudflare Pages at https://asap.repair.
2. **Embedded chat widget** that talks to the CRM (`crm.asap.repair/api/widget/*`) — never calls anything in this repo.
3. **Cloudflare Pages Functions** under `functions/` for edge forwarding of webhooks whose vendor URLs are registered against the `asap.repair` domain and cannot be moved.

## Edge forwarders

Cloudflare Pages Functions live in `functions/api/...`. Each one is a thin
proxy that takes an incoming request to `https://asap.repair/api/...` and
forwards it to the corresponding endpoint on `crm.asap.repair`, preserving
method, body, and relevant headers.

| Path on asap.repair | Forwards to | Why it exists |
|---------------------|-------------|---------------|
| `POST /api/webhooks/thumbtack` | `https://crm.asap.repair/api/webhooks/thumbtack` | Thumbtack API access was approved against the asap.repair domain. Vendor does not allow easy webhook URL change after approval. |

To add a new edge forwarder, model it after `functions/api/webhooks/thumbtack.js`
(uses Web Fetch API, copies safe headers, returns upstream response verbatim).

## Recent changes (April 2026)

This repo was lightly modified during the proxy decommissioning sprint:

- **#15** — Frontend rewired to call `crm.asap.repair/api/widget/*` instead of the legacy `repair-asap-proxy-production.up.railway.app/api/*`. Touched `chat.js`, `main.js`, `quote-modal.js`, `photo-drop.js`, `reviews/index.html`.
- **#16** — Added `functions/api/webhooks/thumbtack.js` Cloudflare Pages Function so Thumbtack's registered webhook URL keeps working without contacting Thumbtack support.

## What to do here vs in bazas-crm

| Change category | Where it goes |
|-----------------|---------------|
| Marketing copy, page layout, branding, CSS, marketing JS | **Here** (`*.html`, `*.css`, top-level JS) |
| Chat widget UI / behavior | **Here** (`chat.js`) — but ONLY UI/UX. The actual chat logic (LLM, KB, conversation persistence) lives in CRM. |
| New edge forwarder for a vendor webhook tied to asap.repair domain | **Here** (`functions/api/...`) |
| Adding a new lead source, AI behavior, calendar feature, dashboard | **bazas-crm**, never here |
| New backend API for the widget | **bazas-crm** at `app/api/widget/...`, then call it from here |

## Hard rules

1. **No business logic in `functions/`.** Edge forwarders must remain dumb proxies. If a webhook needs custom processing, do it in `bazas-crm` and have the function forward there.
2. **CSP**: the static site's `_headers` file enforces a strict CSP. Any new external script/iframe needs to be allowlisted there.
3. **Frontend never calls `bazas-proxy`.** All API calls go to `crm.asap.repair` directly. If you find a leftover `repair-asap-proxy-production.up.railway.app` URL anywhere in `*.js`/`*.html`, replace it.
4. **Cloudflare Pages auto-deploys** on push to `main`. There is no separate deploy step.

## Open user actions related to this repo

None — the asap.repair side of the proxy migration is complete. Pending
actions are in vendor dashboards and the `bazas-proxy` Railway service. See
`bazas-proxy/MIGRATION-PATH.md` for the full checklist.

## Quick commands

```bash
# Local preview (any static server works)
npx serve .

# After push to main, watch Cloudflare Pages deploy:
# https://dash.cloudflare.com → Pages → asap-repair → Deployments
```

---

# ОБЯЗАТЕЛЬНЫЙ ПРОТОКОЛ ПУБЛИКАЦИИ СТРАНИЦ ASAP.REPAIR

> Обязательный **Definition of Done** при создании, изменении URL, публикации,
> снятии noindex или удалении любой публичной индексируемой страницы. Не
> рекомендация. (Добавлено по требованию владельца, 2026-07-12.)

## ГЛАВНОЕ ПРАВИЛО

Создание страницы — атомарная операция. Страница НЕ считается опубликованной,
пока в одном change set и production deploy не синхронизированы:

1. source/generator страницы;
2. HTML;
3. родительский hub и внутренние ссылки;
4. sitemap.xml;
5. llms.txt;
6. llms-full.txt;
7. facts.json, если страница меняет бизнес-факты или маршрутизацию;
8. CRM taxonomy/Knowledge Base, если страница меняет услугу или intake;
9. тесты и валидаторы;
10. production-версия всех применимых файлов.

Запрещено сначала публиковать HTML, а discovery-файлы обновлять «потом».
Запрещено говорить «готово», если проверена только локальная версия, commit или
Cloudflare deployment status без проверки live URL.

## 1. ПЕРЕД НАЧАЛОМ

Прочитай этот файл. Подтверди правильный репозиторий, branch, remote, что
production разворачивается именно из этого branch, и source of truth для типа
страницы. Выполни `git status --short`, `git branch --show-current`,
`git remote -v`. Не перезаписывай/не удаляй/не коммить чужие изменения.

Определи PAGE_TYPE (service / category-hub / service-area / B2B landing /
case study / blog / trust / utility-legal). До редактирования зафиксируй:
CANONICAL_URL, PUBLIC_PATH, SOURCE_FILE_OR_GENERATOR, PARENT_HUB, RELATED_PAGES,
CHANGES_BUSINESS_FACTS, CHANGES_CRM_ROUTING.

Найди дубли/конкурирующие страницы (`rg` по sitemap/llms/facts/services/
case-studies/blog). Не создавай новую страницу при том же intent (SEO/AI
cannibalization). Остановись и спроси Никиту при неясности: цены, scope,
лицензирование, география, доступность, источник фото, приватность клиента,
production branch, необходимость нового CRM service code.

## 2. SOURCE OF TRUTH

Никогда не редактируй только generated HTML.

- **CASE STUDY** — source: `_data/case-studies.json` + `assets/case-studies/<slug>/`.
  После изменения: `python3 scripts/generate-case-studies.py` (обновляет
  `case-studies/<slug>/index.html`, `case-studies/index.html`,
  `assets/data/case-studies.json`, `sitemap.xml`, и авто-добавляет URL в
  `llms.txt` / `llms-full.txt`).
- **SERVICE/AREA** — используй существующий generator/config
  (`scripts/generate-appliance-repair-pages.mjs`,
  `scripts/generate-area-pages.mjs` и т.д.). Не запускай широкий generator
  вслепую — сначала посмотри, что он перезаписывает.

## 3. ОБЯЗАТЕЛЬНЫЙ STATIC-NAVIGATION BAKE

Header/footer/nav/CTA должны быть в raw HTML без JS. Важно:
`scripts/bake-components.mjs` обрабатывает только файлы из `git ls-files` —
совершенно новый untracked HTML он ПРОПУСКАЕТ. Для новой страницы:

```bash
PAGE_FILE="<путь к новому index.html>"   # для case study: case-studies/<slug>/index.html
git add -N -- "$PAGE_FILE"
node scripts/bake-components.mjs
rg -Fq '<!--baked:header-->' "$PAGE_FILE"
rg -Fq '<!--baked:footer-->' "$PAGE_FILE"
```

Нет хотя бы одного маркера — публикация запрещена.

## 4. КОНТРАКТ СТРАНИЦЫ

Один постоянный canonical URL; согласованный trailing slash; HTTP 200;
index,follow; уникальные title и meta description; ровно один H1;
self-referencing canonical; OG/Twitter + существующий OG image; BreadcrumbList;
подходящий JSON-LD (Service для service page, Article для case study/blog,
FAQPage только если тот же FAQ виден пользователю); основной текст в raw HTML;
статическая навигация; работающий CTA; ссылка на родительский hub; релевантные
исходящие + минимум одна статическая входящая ссылка.

НЕ публикуй: Review/AggregateRating JSON-LD; скрытый FAQ только для schema;
неподтверждённые цены/сроки; обещания лицензированной работы вне scope.

Цены: $0 — предварительная оценка по фото; $99 — on-site assessment,
засчитываемый в работу; $150 — минимальная стоимость фактической работы (если
это актуальная модель); НИКОГДА не называй $99 ценой ремонта/минимальной ценой
работы.

При смене URL: 301 redirect + обнови canonical + убери старый URL из sitemap и
AI-файлов + обнови внутренние ссылки. Не оставляй две индексируемые копии.

## 5. ИЗОБРАЖЕНИЯ И ПРИВАТНОСТЬ

Локальный оптимизированный WebP/AVIF; файл существует; width+height;
содержательный alt; без лишних дублей. НЕ публикуй лица, отражения, документы,
номера квартир, чеки, адреса, персональные данные без разрешения. Для case study
используй стадии before/process/detail/after. Один реальный существенный проект
= один canonical case study (не плоди слабые страницы под каждый набор фото).

## 6. SITEMAP И ВНУТРЕННИЕ ССЫЛКИ

Для каждого нового URL: точный canonical в sitemap.xml + правильный lastmod +
ссылка с родительского hub + минимум одна доп. входящая + исходящие на связанные
услуги/доказательства + отсутствие robots/meta блокировки. Orphan page не
считается опубликованной. Проверка:

```bash
URL="https://asap.repair/<path>/"
rg -Fq "$URL" sitemap.xml || { echo "MISSING FROM SITEMAP: $URL"; exit 1; }
```

## 7. AI-ПОВЕРХНОСТИ (llms.txt / llms-full.txt / facts.json)

Для каждого нового коммерческого индексируемого URL добавь точный URL в
`llms.txt` (короткое название + intent + canonical URL) и в `llms-full.txt`
(URL + краткий фактический routing context: что предлагает/доказывает, кому
подходит, симптомы/intents, что входит/не входит в scope, что прислать, next
step). Не копируй маркетинговые преувеличения; только факты со страницы. Обнови
`Last updated`. Проверка:

```bash
rg -Fq "$URL" llms.txt      || { echo "MISSING FROM llms.txt: $URL"; exit 1; }
rg -Fq "$URL" llms-full.txt || { echo "MISSING FROM llms-full.txt: $URL"; exit 1; }
```

`facts.json` — семантическая бизнес-истина и routing layer, НЕ вторая копия
sitemap. Обновляй, если страница добавляет/меняет услугу, category, high-intent
route, AI recommendation rule, service area, pricing, booking, intake,
контакты, regulated-trade scope, canonical hub, или структурированный
proof/case-study catalog. Для proof-only case study/статьи facts.json может быть
`not applicable`, если она не меняет business facts и в принятой структуре нет
detail-page catalog (на 2026-07-12 в facts.json НЕТ ключа caseStudyPages, так
что обычный case study = not applicable). Если правишь facts.json — проверь
JSON, обнови `lastReviewed` только после реальной проверки, убедись в отсутствии
противоречий с HTML/llms/CRM. В финальном отчёте ВСЕГДА напиши
`facts.json: updated — <что>` или `facts.json: not applicable — <причина>`.

## 8. CRM/TAXONOMY

CRM обновляется, только если страница меняет услугу, category, booking/lead
intent, intake fields, pricing/policy, service-area routing, AI scope, обещания
или отказы. Для service page проверь `docs/crm-appliance-service-taxonomy.json`
и настоящий runtime source of truth в canonical bazas-crm (website docs != prod
CRM config). Case study/blog обычно CRM не требует. В отчёте:
`CRM: updated — <что>` или `CRM: not applicable — no service/policy/intake/routing change`.

## 9. АВТОМАТИЧЕСКАЯ ЗАЩИТА

Если новая поверхность не покрыта validator/test — расширь validator в той же
работе. Инварианты: каждый sitemap URL есть в llms.txt и llms-full.txt; нет
дублей в sitemap; canonical == public URL; локальный HTML и все assets
существуют; registry/index содержит страницу; новая коммерческая страница имеет
входящую ссылку; static header/footer запечены; применимые service/area routes
в facts/CRM; повторный запуск generator не даёт новый diff. Не добавляй URL в
allowlist ради зелёного теста.

## 10. ОБЯЗАТЕЛЬНЫЕ ЛОКАЛЬНЫЕ ПРОВЕРКИ

```bash
python3 -m json.tool facts.json >/dev/null
python3 -m json.tool _data/case-studies.json >/dev/null
python3 -m json.tool docs/crm-appliance-service-taxonomy.json >/dev/null
node scripts/bake-components.mjs
node scripts/validate-ai-guide-coverage.mjs
node scripts/validate-structured-data.mjs
node scripts/validate-review-schema.mjs
node --test tests/*.test.js
git diff --check && git status --short && git diff --stat
```

Для изменённых JS — `node --check <file.js>`. Открой страницу через локальный
static server; проверь desktop+mobile, console, failed requests, CTA, raw HTML
без JS, новые ссылки/assets, canonical/title/H1, baked header/footer. Для
generated страницы проверь идемпотентность (повторный generate+bake не даёт
diff). Если suite был красным ДО работы — сохрани baseline, убедись что нет
НОВЫХ failures, перечисли существующие, не говори «все тесты прошли». Новый
failure блокирует публикацию; статус не COMPLETE пока обязательный
page-specific gate красный.

## 11. COMMIT И DEPLOY

Перед commit просмотри полный diff. В одном change set: source/generator,
generated page, parent hub, внутренние ссылки, sitemap, llms.txt, llms-full.txt,
применимый facts.json, применимый CRM mapping, tests/validators, generated
public data. Не включай временные/чужие файлы. Push/deploy только с разрешения
задачи. `commit != deploy`, `push != live`, `deployment success != verified live content`.

## 12. PRODUCTION-ПРОВЕРКА (после разрешённого push)

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' "$URL"
curl -fsS "$URL" | rg -F '<!--baked:header-->'
curl -fsS "$URL" | rg -F '<!--baked:footer-->'
curl -fsS https://asap.repair/sitemap.xml   | rg -F "$URL"
curl -fsS https://asap.repair/llms.txt      | rg -F "$URL"
curl -fsS https://asap.repair/llms-full.txt | rg -F "$URL"
# если facts применим: curl -fsS https://asap.repair/facts.json | rg -F "$URL"
```

Проверь: 200; нет неожиданного redirect/challenge; title/canonical/H1 == commit;
основной текст и static header/footer в raw HTML; assets 200; URL в live sitemap/
llms/llms-full; parent hub линкует; JSON-LD парсится; desktop/mobile smoke;
local==live critical content. Если curl блокируется Cloudflare — используй
реальный браузер и укажи, что проверено. IndexNow: сначала `--dry-run`, реальная
отправка только если задача это разрешает. НЕ заявляй, что страница
проиндексирована или будет рекомендоваться Google/ChatGPT/Claude/Perplexity.
Разрешённая формулировка: «Страница опубликована, отвечает 200 и включена в
sitemap и AI discovery surfaces».

## 13. ЖЁСТКИЕ STOP-УСЛОВИЯ (BLOCKED/PARTIAL, не COMPLETE)

Неясен source of truth или production branch; пересекающиеся чужие изменения;
generator и output расходятся; нет baked header/footer; противоречие
pricing/scope/geography; URL нет в sitemap/llms.txt/llms-full.txt; orphan;
падает обязательный page-specific validator; новый test failure; canonical !=
sitemap != фактический URL; live deploy не подтверждён; live != commit; нужен
CRM update но runtime source не найден; нужно бизнес-решение Никиты. ЗАПРЕЩЕНО:
удалять тест ради зелёного; ослаблять validator без обоснования; фиктивный
allowlist; скрывать pre-existing failures; «поправим позже» + COMPLETE; считать
URL в sitemap доказательством индексации; считать доступность доказательством
AI-рекомендаций.

## 14. ФОРМАТ ФИНАЛЬНОГО ОТЧЁТА

```
STATUS: COMPLETE | PARTIAL | BLOCKED
Page type / Canonical URL / Source-generator / Commit SHA / Production deploy
Synchronized: page-source, static header/footer, parent hub, inbound links,
  sitemap.xml, llms.txt, llms-full.txt, facts.json (updated|not applicable +
  reason), CRM (updated|not applicable + reason)
Validation: exact commands, page-specific gates, full suite, baseline/pre-existing
  failures, new failures
Live evidence: HTTP, title/canonical/H1, raw content, static navigation, assets,
  sitemap, llms, facts, inbound links, browser/mobile, local/live comparison
Known limitations: список или none
```

Фразу «страница опубликована и полностью синхронизирована» — только после
подтверждения всех применимых пунктов.
