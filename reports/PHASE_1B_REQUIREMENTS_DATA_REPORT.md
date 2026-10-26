# DreamVacati Phase 1B requirements data report

Date: 2026-10-25, America/New_York. Frontend only. No staging, commit, push or deployment.

## 1. Executive Summary

Connected the existing requirements guide to one same-origin JSON dataset through a cached, defensive external adapter. Removed its duplicated inline REQ_DATA. Preserved all 14 country choices and the original 12 descriptive destination IDs, adding the already established site ID maldives for the existing Maldives choice. Four Schengen countries share one record: 13 records total, including two unexposed legacy placeholders.

Live primary-source review does not justify declaring every requirement verified. Eleven selectable records are PARTIALLY VERIFIED overall; Barbados and Costa Rica are UNVERIFIED compatibility placeholders, not additional selector coverage. Across 44 displayed legal/health claims: 24 VERIFIED, 12 PARTIALLY VERIFIED, eight UNVERIFIED. Missing rules never receive fabricated fallback facts. Currency and electricity remain inherited planning information, not certified legal data.

Reviewed the Phase 1A report and all five October reports: SEO_PAGE_INVENTORY_2026_10.md, SEO_CONTENT_AUDIT_2026_10.md, SEO_INDEXING_DIAGNOSIS_2026_10.md, SEO_CONTENT_OPPORTUNITIES_2026_10.md and SEO_IMPLEMENTATION_ROADMAP_2026_10.md. Reinspected the checkout rather than assuming a previous migration exists. The requirements migration was NOT wired into production: the JSON had no production consumer.

## 2. Existing Duplication Map

The initial map was completed before application edits. A second full-folder scan expanded the editorial row to include packing lists, generic booking schema and older C5 copy.

| File | Existing data source | Duplicated fields | Consuming UI / behavior | Canonical disposition |
|---|---|---|---|---|
| tools.html | Inline REQ_DATA, 14 country codes | Passport, visa, authorization, health, currency, plugs, notes | Synchronous requirements output; could contradict unused JSON | Remove facts and requirements handlers; external adapter consumes JSON |
| data/travel-requirements.json | Twelve records, January 2026 blanket date, no production consumer | Entry facts, customs, tips and links | Stale unused parallel dataset | Canonical versioned claims and source registry |
| main.js | Legacy link helper | No independent human-entry dataset | Redirects legacy requirements action to tool | Keep unchanged |
| blog-bali-vs-thailand.html; blog-best-time-greece.html; blog-best-time-japan.html; blog-best-time-maldives.html; blog-choose-europe-cities.html; blog-santorini-vs-mykonos.html; blog-tokyo-vs-osaka.html; japan-travel-guide.html | Static prose and FAQs, with schema in Europe article | Passport/visa limits, ETA/ETIAS status and fees | Separate editorial assertions, including unsupported Bali coverage | Replace factual copies with reviewed tool references; explicitly identify unsupported Indonesia |
| world-cup-2026-travel-guide.html | Tables, entry section, FAQs and JSON-LD | Canada/Mexico passport rules, broad citizenship claims, obsolete U.S. authorization fees | Multiple parallel assertions within one page | Link Canada/Mexico tool guidance; refer U.S./other citizenships to official advice; align affected FAQ text |
| blog-japan-packing-checklist.html; jamaica-5-day-itinerary.html; book-now.html | Checklist, arrival prose, booking FAQ schema | Blanket six-month validity, paper C5 instruction | Conflicts with reviewed destination rules | Remove duplicated rules in favor of destination-specific confirmation |
| negril-jamaica.html; caribbean-travel-guide.html; blog-compare-caribbean-islands.html | Static entry summary | C5 boarding guarantees; blanket island visa exemption | Unsupported assurances separate from canonical guide | Replace with qualified canonical references only |
| blog-hidden-destinations.html | Tool referral for unsupported islands | Implied tool coverage | Dominica/Bonaire are absent from selector | State limitation; direct official confirmation |
| blog-elmo.html; tools.html pet sections | Animal import/vaccination guidance | Pet rules, not the human-entry dataset | Separate animal-travel scope | Unchanged; not certified by this review |

General navigation, coverage descriptions and links are not independent legal datasets. The U.S.-citizen domestic visa column in the World Cup table was not expanded into a new international requirements dataset.

## 3. Canonical Data Architecture

- data/travel-requirements.json schemaVersion 2: assumptions, countryMappings, sources, destinations.
- Original IDs retained: uk, schengen, japan, uae, canada, mexico, jamaica, barbados, thailand, australia, new-zealand, costa-rica. maldives already exists in the site's destination vocabulary; not an invented alternative ID.
- Per-record status, lastReviewed and conditions; per-claim text, status, actual lastReviewed or null, and source IDs. The claim structure replaces unused legacy flat fields; no production flat-field consumer was found.
- Every source has an official URL, nullable publicationDate and actual checkedOn. A check date is not a source publication date or a guarantee that law has not changed.
- js/travel-requirements.js validates the dataset, resolves existing country codes, caches one successful download per page, coalesces concurrent downloads and permits retry after network/HTTP/parse/schema failures.
- Missing records fail with an explicit warning; valid but incomplete records show UNVERIFIED per field instead of old inline facts. A missing record in an otherwise cached valid dataset needs a page reload to obtain a changed dataset.
- Citizenship/purpose/passport assumptions default explicitly to the existing U.S.-tourist scope. Adapter requests for another citizenship, work or emergency passports reject before downloading. No citizenship selector or unsupported promise was added.
- Safe textContent rendering; HTTPS government-domain source validation; no external API, backend, package or new storage.

## 4. Verification Results

All following source reviews actually occurred on 2026-10-25. This is a point-in-time review, not ongoing monitoring. Scope: U.S. citizens, ordinary passport books, short tourism visits by air. Individual admissibility, dual nationality, transit, land/sea entry, work and residence are not fully reviewed.

| Destination / codes | Status | Passport and visa review | Conditions / unresolved coverage |
|---|---|---|---|
| Japan JP | PARTIALLY VERIFIED | Whole-stay validity; short tourist exemption checked | Current electronic registration unverified; medication exceptions require confirmation |
| United Kingdom GB | PARTIALLY VERIFIED | Whole-stay validity; ETA route checked | GBP 20; landside versus airside transit distinguished; health unreviewed |
| France FR | PARTIALLY VERIFIED | Shared Schengen passport and rolling stay allowance checked | ETIAS current operating status unverified; country-specific health unreviewed |
| Italy IT | PARTIALLY VERIFIED | Same shared Schengen record | No separate per-country allowance or independently verified ETIAS status |
| Greece GR | PARTIALLY VERIFIED | Same shared Schengen record | Other document and health exceptions require destination confirmation |
| Spain ES | PARTIALLY VERIFIED | Same shared Schengen record | Residency/prior stays and country-specific exceptions not exhaustively reviewed |
| Australia AU | PARTIALLY VERIFIED | Valid passport and visa/ETA requirement checked | JavaScript-only Home Affairs details; current fees/full document conditions not certified |
| New Zealand NZ | PARTIALLY VERIFIED | Passport buffer, visa-waiver scope and NZeTA reviewed | Separate NZTD arrival declaration included; IVL exceptions and personal conditions remain |
| UAE AE | PARTIALLY VERIFIED | Entry-based passport buffer and revised on-arrival allowance checked | Emergency documents, sex markers and prior marker changes are material exceptions |
| Thailand TH | PARTIALLY VERIFIED | Passport rule and official description of exemption checked | Source itself warns exemption may change; TDAC included; route-dependent health |
| Mexico MX | PARTIALLY VERIFIED | Air-travel document and tourist exemption checked | Officer grants actual stay; digital air records differ from land/sea procedures |
| Canada CA | PARTIALLY VERIFIED | U.S.-citizen visa/eTA exception checked | Stay is not unlimited; officer decides duration; personal inadmissibility still possible |
| Jamaica JM | PARTIALLY VERIFIED | Entry/exit passport validity and tourist exemption checked | Official electronic C5 linked; no boarding-gate or resort-safety guarantee |
| Maldives MV | PARTIALLY VERIFIED | Visa-on-arrival and declaration reviewed | Immigration versus U.S. passport guidance conflicts; child yellow-fever exceptions also differ |
| Barbados (legacy ID only) | UNVERIFIED | Unsourced rules withdrawn | Not in selector; no invented review date |
| Costa Rica (legacy ID only) | UNVERIFIED | Unsourced rules withdrawn | Old mandatory COVID-insurance assertion withdrawn, not replaced with guessed rules |

OUTDATED legacy assertions removed or replaced: UK GBP 10, ETIAS EUR 7 and confidently dated launch claims, UAE 30-day allowance and departure-based passport buffer, Canadian unlimited-stay claim, Maldives one-month-beyond-departure certainty, Japan/Jamaica blanket six-month checklist rules, Jamaica paper-C5/boarding assurances, and obsolete/generalized World Cup authorization summaries. Old customs, health and tips assertions without reviewed support are not silently retained as certified facts.

## 5. Source Provenance

Canonical source registry below. Publication dates are retained only where identifiable; advisory issue dates were not falsely assigned to each entry rule. Maldives displays an ambiguous numeric update date: retained verbatim, not guessed into ISO format. Search snippets were not sufficient to certify ETIAS's current launch state.

| Source ID / authority | Official URL | Publication date | Check result |
|---|---|---|---|
| jp: U.S. Department of State - japan | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/japan.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| ae: U.S. Department of State - united-arab-emirates | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/united-arab-emirates.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| th: U.S. Department of State - thailand | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/thailand.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| mx: U.S. Department of State - mexico | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/mexico.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| ca: U.S. Department of State - canada | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/canada.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| jm: U.S. Department of State - jamaica | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/jamaica.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| au: U.S. Department of State - australia | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/australia.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| mv-state: U.S. Department of State - maldives | [Official source](https://travel.state.gov/en/international-travel/travel-advisories/maldives.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| uk-border: UK government - passport documents | [Official source](https://www.gov.uk/uk-border-control/before-you-leave-for-the-uk) | Unavailable | Readable primary source reviewed 2026-10-25 |
| uk-eta: UK government - ETA | [Official source](https://www.gov.uk/eta) | Unavailable | Readable primary source reviewed 2026-10-25 |
| uk-exempt: UK government - ETA exemptions and transit | [Official source](https://www.gov.uk/eta/when-not-need-eta) | Unavailable | Readable primary source reviewed 2026-10-25 |
| schengen: U.S. Department of State - Schengen travel | [Official source](https://travel.state.gov/en/international-travel/planning/guidance/europe.html) | 2025-11-24 | Readable primary source reviewed 2026-10-25 |
| eu-visa: European Commission - Schengen visa policy | [Official source](https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en) | 2025-06-23 | Readable primary source reviewed 2026-10-25 |
| etias: Official EU ETIAS portal - confirm current status | [Official source](https://travel-europe.europa.eu/en/etias) | Unavailable | Reached portal, but current launch/application status was not readable. No operational-status verification. |
| au-eta: Australian Home Affairs - ETA subclass 601 | [Official source](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601) | Unavailable | JavaScript-only detail page; fees and full conditions not independently verified. |
| nz: Immigration New Zealand - NZeTA | [Official source](https://www.immigration.govt.nz/visas/new-zealand-electronic-travel-authority-nzeta/) | Unavailable | Readable primary source reviewed 2026-10-25 |
| nz-waiver: Immigration New Zealand - U.S. visa-waiver eligibility and arrival declaration | [Official source](https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/visa-waiver-countries-and-territories/) | Unavailable | Readable primary source reviewed 2026-10-25 |
| nz-ivl: Immigration New Zealand - visitor levy | [Official source](https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/fees-processing-times-and-refunds/paying-the-international-visitor-levy/) | Unavailable | Readable primary source reviewed 2026-10-25 |
| ca-eta: Canadian government - eTA eligibility | [Official source](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility.html) | Unavailable | Readable primary source reviewed 2026-10-25 |
| ca-stay: Canadian government - visitor stay duration | [Official source](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/about-visitor-visa.html) | 2026-05-26 | Readable primary source reviewed 2026-10-25 |
| jm-c5: Jamaica PICA - official electronic C5 | [Official source](https://enterjamaica.gov.jm/) | Unavailable | Readable primary source reviewed 2026-10-25 |
| mv: Maldives Immigration - tourist entry conditions | [Official source](https://www.immigration.gov.mv/visa/tourist-visa) | Raw 10/09/2026; ISO not inferred | Readable primary source reviewed 2026-10-25 |

Additional official referrals: [U.S. visitor guidance](https://travel.state.gov/content/travel/en/us-visas/tourism-visit.html) was readable; [Indonesian Immigration](https://www.imigrasi.go.id/) returned 403 to the research client, so no Indonesian rule was verified. Source reachability is not a successful visa application or promise of future availability. No forms were submitted and no authorization was purchased.

## 6. Exact Phase 1B Files Changed

Twenty-four files changed or added in this phase; the unchanged Phase 1A unit test is additionally made trackable by the narrow ignore exceptions.

- `.gitignore`
- `data/travel-requirements.json`
- `js/travel-requirements.js`
- `tools.html`
- `blog-bali-vs-thailand.html`
- `blog-best-time-greece.html`
- `blog-best-time-japan.html`
- `blog-best-time-maldives.html`
- `blog-choose-europe-cities.html`
- `blog-compare-caribbean-islands.html`
- `blog-hidden-destinations.html`
- `blog-japan-packing-checklist.html`
- `blog-santorini-vs-mykonos.html`
- `blog-tokyo-vs-osaka.html`
- `book-now.html`
- `caribbean-travel-guide.html`
- `jamaica-5-day-itinerary.html`
- `japan-travel-guide.html`
- `negril-jamaica.html`
- `world-cup-2026-travel-guide.html`
- `tests/factual-repair-browser.js`
- `tests/travel-requirements.test.js`
- `tests/travel-requirements-browser.js`
- `reports/PHASE_1B_REQUIREMENTS_DATA_REPORT.md`

## 7. Country Mapping Validation

JP -> japan; GB -> uk; FR/IT/GR/ES -> schengen; AU -> australia; NZ -> new-zealand; AE -> uae; TH -> thailand; MX -> mexico; CA -> canada; JM -> jamaica; MV -> maldives.

All 14 existing option values resolve; all 13 record IDs are unique. Barbados and Costa Rica retain their IDs but are not introduced as new public options. Schengen uses a combined rolling allowance, not a fresh allowance per country. Country-specific plug descriptions remain separate mappings, not duplicated legal claims.

## 8. User-Facing Safety

Existing six output rows, req-card/req-row styles and controls retained. Added explicit citizenship/passport/purpose/air-route assumptions, per-claim status and review dates, unresolved-source warnings, official links and an entry-discretion warning. No emergency passport, work or residency eligibility guarantee. Static workflow text no longer says requirements have been confirmed merely by using the guide.

Loading, failure and selection feedback uses an aria-live status region and aria-busy. Selection changes invalidate stale responses and clear old results. No innerHTML interpolation of downloaded data. Source-less fields render warnings, not legal assertions. Unsupported destinations fail closed.

Analytics semantics preserved: tool_start once on first nonempty selection with tool_name requirements; requirements_lookup only after rendering a matching record with destination country code. No event on failed download/missing record; no citizenship or personal data added.

## 9. Regression Testing

- Baseline before edits: existing legacy requirements test 41 checks passed; Phase 1A unit suite eight tests passed.
- Updated canonical/adapter suite: 28 tests passed; Phase 1A unit suite: eight passed; combined 36/36.
- Existing conversion-source suite: 36 checks passed; conversion-unit suite: 22 checks passed. These are local stubs/source tests, not payment or transmission tests.
- New Playwright suite: all 14 choices at 1440px and 390px, one cached download per page, unchanged event names/payloads, selection/empty state, retry after offline/HTTP/invalid JSON, missing record/source/claim/date, safe text rendering, stale-response handling, no page errors.
- Budget input, packing generation, itinerary custom activity and pet estimate interactions passed unchanged. Existing best-time, destination comparison, TDI filters/sort/search and paused-newsletter browser regressions passed.
- Requirements adapter and same-origin JSON work under the existing strict CSP. Other pre-existing inline scripts remain subject to that CSP; this phase does not certify or refactor their deployment behavior.
- Bootstrap was required to load for layout assertions. Initial restricted-network run could not load it and correctly failed rather than claiming a layout pass; rerun with GET-only CDN access passed. A test-only missing-record retry expectation was corrected to reload the deliberately cached valid fixture; no assertion was removed.
- Updated Phase 1A browser test waits for the asynchronous requirements result; its existing assertions remain. Phase 1A unit test is unchanged.
- Phase 1A comprehensive validation passes: all JSON/JSON-LD parse, frontend inline/external JS compile, local asset/link targets exist, 48 sitemap canonical targets remain valid.
- Snapshot comparisons confirm protected canonical tags, ad markup/scripts, analytics scripts, newsletter forms and unrelated inline tool JS unchanged; whole-file hashes preserve protected shared files and six previous reports.
- Browser screenshots inspected locally outside the repository. Requirements output stays within desktop/mobile width. Known pre-existing TDI document overflow (~773px at 390px) and Jamaica guide width (430px at 390px) remain; changed requirements card does not overflow.
- Live entry eligibility, authorizations, backend, payment processing and production deployment not tested; tests/trip-results-conversion.spec.js is a manual scenario document, not an executable end-to-end runner.

Commands: node --test tests/travel-requirements.test.js tests/factual-repair.test.js; node tests/travel-requirements-browser.js; node tests/factual-repair-browser.js; node tests/conversion-source.test.js; node tests/conversion-unit.test.js. No packages installed.

## 10. Unresolved Research Gaps

ETIAS current operational/application status; Australian current ETA app fees/full conditions; Japanese electronic registration details; Thai exemption changes; Maldives conflicting passport and child health thresholds; individualized health/medication advice and route exceptions; legacy Barbados/Costa Rica records. These gaps are visible or withheld, not stamped verified.

Official sources can change after this review. Publication dates unavailable at the reviewed page are null. Before release and before travel, recheck time-sensitive claims. Pet-import rules remain a separate, unreviewed domain. This phase does not implement budget discovery, itinerary generation or the broader October content roadmap.

## 11. Phase 1A Regression Test Tracking

Before this patch, .gitignore line 19 ignored all tests/ and git ls-files tests returned no tracked files. The rule's stated purpose was to exclude local validation from static deployment. Replaced it with /tests/* and exactly four allowlisted factual/requirements regression files. All other conversion/local tests remain ignored; no broad tests-directory unignore.

Allowlisted: factual-repair.test.js (unchanged); factual-repair-browser.js (one asynchronous wait); travel-requirements.test.js (replaces obsolete inline extraction); travel-requirements-browser.js (new). Nothing staged.

Git tracking and deployment exclusion are different. Hosting/build packaging must exclude tests/ and reports/ independently before a future release; no hosting configuration or headers changed in this phase.

## 12. Git State and Preservation

Baseline branch master, HEAD 23c205a. Eleven existing tracked modifications preserved: blog-compare-caribbean-islands.html, jamaica-travel-guide.html, js/dv-destinations.js, js/email-capture.js, js/tourism-demand-data.js, js/tourism-demand-index.js, montego-bay-jamaica.html, montego-bay-vs-negril.html, negril-jamaica.html, privacy.html, tourism-demand-index.html. Existing untracked reports/ contained the five October reports and Phase 1A report.

The two newsletter-pause files, all TDI/shared destination files, Jamaica guide/Montego Bay repairs and all six existing reports remain byte-for-byte as at this phase's baseline. Only the entry-related paragraph in the already modified Negril and Caribbean comparison pages changes further; prior Phase 1A resort/airport edits remain intact.

A 120-file SHA-256 baseline guards against concurrent changes before applying the bounded patch from the writable staging workspace. No reset, checkout, stash, stage or commit performed. sitemap.xml, robots.txt, _headers, _redirects, CSS, main.js, consent/tracking/advertising modules, planner/results and newsletter code unchanged from baseline.

Final git status/stat/check and ignore checks are recorded below after applying the patch. The combined worktree is intentionally dirty; review Phase 1A and the existing pause changes separately before any eventual commit.

### Final Working Tree Snapshot

Branch master. Combined tracked diff (including pre-existing Phase 1A/newsletter work): 28 files, 869 insertions, 436 deletions. New adapter, report files and allowlisted tests are untracked and are not counted by git diff --stat. No staged paths. git diff --check exits 0, with only LF-to-CRLF normalization notices. Restricted-shell Git also warns that the user-global ignore file cannot be read; local ignore exceptions were verified explicitly and the four intended tests are visible as untracked.

```text
 M .gitignore
 M blog-bali-vs-thailand.html
 M blog-best-time-greece.html
 M blog-best-time-japan.html
 M blog-best-time-maldives.html
 M blog-choose-europe-cities.html
 M blog-compare-caribbean-islands.html
 M blog-hidden-destinations.html
 M blog-japan-packing-checklist.html
 M blog-santorini-vs-mykonos.html
 M blog-tokyo-vs-osaka.html
 M book-now.html
 M caribbean-travel-guide.html
 M data/travel-requirements.json
 M jamaica-5-day-itinerary.html
 M jamaica-travel-guide.html
 M japan-travel-guide.html
 M js/dv-destinations.js
 M js/email-capture.js
 M js/tourism-demand-data.js
 M js/tourism-demand-index.js
 M montego-bay-jamaica.html
 M montego-bay-vs-negril.html
 M negril-jamaica.html
 M privacy.html
 M tools.html
 M tourism-demand-index.html
 M world-cup-2026-travel-guide.html
?? js/travel-requirements.js
?? reports/
?? tests/
```

The four factual/requirements test paths match explicit negative ignore rules; conversion-source.test.js still matches /tests/*. No staging or broad unignore occurred. Final repository tests and 120-file baseline/installed-file comparisons pass. Unrelated baseline files remain unchanged.


## 13. Deployment Readiness and Verdicts

- DATA DUPLICATION: RESOLVED for the supported human-entry dataset and inspected duplicated article rules; pet-entry guidance is explicitly separate.
- REQUIREMENTS ACCURACY: PARTIALLY VERIFIED.
- FRONTEND INTEGRATION: PASS.
- REGRESSION TESTS: PASS for the available automated/local-browser scope.
- GIT SCOPE: NEEDS REVIEW before committing the combined pre-existing and Phase 1B work; no unrelated changes intentionally introduced.
- DEPLOYMENT: CONDITIONAL. Not deployed. Review the combined changes, exclude local reports/tests from deployment artifacts, and revisit exposed time-sensitive research gaps. No blanket legal/health completeness certification.

## 14. Recommended Next Phase

Resolve the named primary-source gaps and establish a human review/expiry process before broadening citizenship or destination coverage. Separately handle the previously documented inline-script CSP and mobile overflow issues. Only then continue the budget-first architecture roadmap; no itinerary-generation/backend expansion in this patch.
