# DreamVacati Phase 1A factual repair report

Date: 2026-10-25, America/New_York. Frontend only. No commit, push or deployment.

## Executive Summary

Corrected supported Jamaica resort-location and airport statements across five related pages. Corrected Japan's misdated visitor statistic in the shared destination registry and TDI fallback, added statistic-specific provenance, and rendered its source/reference year/publication/check dates. The other 29 visitor figures are explicitly labeled unverified estimates; their year and visitor/geographic scope are not fabricated. TDI's scores remain editorial ratings, not measured crowd density, live pricing or demand forecasts.

Nine application files changed, two focused regression test files were added, and this report was added. The existing newsletter-pause changes in `js/email-capture.js` and `privacy.html` were preserved byte for byte. The five preceding audit reports were preserved. No redirects, requirements data, calculators, tracking, advertising, canonical URLs, robots policy, sitemap, CSS, destination coverage, planner/backend or payment infrastructure changed.

Deployment verdict: **CONDITIONAL**. The bounded corrections pass automated and local browser checks. They do not complete the broader site factual review, resolve the unknown index-loss cohort, certify the remaining tourism estimates, or fix pre-existing mobile overflow. Production behavior of this patch has not been tested because it has not been deployed. Before any later release, review the existing newsletter-pause work together with its privacy wording and the exact files being released.

## Reports and Files Inspected

Read the five preceding reports, including the full page inventory, content audit, opportunities and roadmap. Rechecked the current repository rather than treating the reports as current implementation state.

- Baseline: branch `master`, HEAD `23c205a`. Existing modified files: `js/email-capture.js`, `privacy.html`; existing untracked directory: `reports/` containing five SEO reports. Existing diff: 73 insertions, 133 deletions. Baseline hashes captured for all 117 non-git files before staging edits.
- Jamaica: `jamaica-travel-guide.html`, `montego-bay-jamaica.html`, `negril-jamaica.html`, `montego-bay-vs-negril.html`, `jamaica-5-day-itinerary.html`, `best-time-to-visit-jamaica.html`, `blog-caribbean-family.html`, `blog-compare-caribbean-islands.html`; cross-folder resort/airport searches.
- Tourism: `js/dv-destinations.js`, `js/tourism-demand-data.js`, `js/tourism-demand-index.js`, `tourism-demand-index.html`, `js/dv-tdi-map.js`; registry consumers in `destination-comparison.html`, `best-time-greece.html`, `japan-travel-guide.html`, `seasonal-recommendations.html`, `js/best-time.js` and `data/destinations.json`.
- Requirements: `data/travel-requirements.json`, the complete affected `REQ_DATA` and rendering sections in `tools.html`, relevant `main.js` code, production HTML/JS reference searches, and `tests/travel-requirements.test.js`.
- Protection: `sitemap.xml`, `robots.txt`, `_redirects`, `_headers`, `.gitignore`, metadata and script/ad references across affected HTML; syntax and local-link scans across all 54 HTML documents and 14 external frontend JS files. Conversion/payment tests were identified but not executed or expanded into service/payment inspection.

## Verified Findings

| Finding | Repository evidence | Authoritative evidence | Action |
|---|---|---|---|
| Royal Barbados was listed in Montego Bay | Jamaica guide couples paragraph | [Sandals Royal Barbados](https://www.sandals.com/royal-barbados/) identifies the resort in Barbados | Remove the misplaced example; retain existing Jamaica examples |
| Moon Palace was repeatedly classified as a Montego Bay/Rose Hall property | Guide table/family text; Montego Bay guide list/family paragraph/FAQ; comparison tables/family text; Caribbean island article | [Moon Palace Jamaica](https://jamaica.moonpalace.com/) identifies Ocho Rios | Remove it from Montego Bay tables; identify Ocho Rios and separate transfer planning where retained |
| Secrets Wild Orchid was described as having family programs | Montego Bay guide FAQ and Montego Bay/Negril family paragraph | [Official Secrets Wild Orchid page](https://www.hyattinclusivecollection.com/en/resorts-hotels/secrets/jamaica/wild-orchid-montego-bay/) identifies an adults-only resort; [official Jamaica resort directory](https://www.hyattinclusivecollection.com/en/destinations/jamaica/) distinguishes family-friendly Hyatt Ziva | Correct age-policy context in directly affected family advice; no new availability promise |
| Negril was said to have no airport | Negril schema, comparison schema/FAQ, Jamaica comparison table | [Airports Authority of Jamaica: Negril Aerodrome](https://airportsauthorityjamaica.aero/airports-aerodromes/negril-aerodrome/) confirms its existence; [Sangster domestic connections](https://www.mbjairport.com/domestic-airlines) lists Negril Aerodrome | State Negril has a domestic aerodrome; retain MBJ as usual international gateway, without inventing schedules |
| Japan's 2024 visitor figure was 31.9M | Registry and fallback annualArrivals, trendNote and notes | [JNTO release, January 15, 2025](https://www.jnto.go.jp/news/press/20250115_monthly.html), provisional 2024 estimate | Correct to 36,869,900 visitor arrivals and identify reference year/metric/publication status |
| Public score descriptions implied measured density and blanket freshness | TDI methodology and visible/schema FAQs | Actual code contains static editorial scores and no measured density feed or per-record review process | Describe editorial estimates and limit freshness claims to the sourced statistic |
| Requirements duplication remains in this checkout | Inline `const REQ_DATA` has 14 records; separate JSON has 12 destinations and a January review marker; no production consumer of that JSON found | Current frontend source and existing 41 assertions | Document separate bounded follow-up; no requirements changes |

The AAJ page contains an apparently inconsistent eastern-island phrase and template text. Only its direct evidence that Negril Aerodrome exists is used; that phrase was not copied into DreamVacati. Precise route times and current flight availability were not inferred from the existence of an aerodrome.

## Jamaica Corrections

| File / affected section | Before | Problem | Implemented correction | Source |
|---|---|---|---|---|
| `jamaica-travel-guide.html`, couples | Royal Barbados in MoBay | Wrong country | Remove Royal Barbados from Jamaica examples | Sandals property page above |
| Same file, all-inclusive table | Moon Palace in Montego Bay list | Wrong base | Remove Moon Palace; retain existing local brand examples | Moon Palace official page |
| Same file, families | Moon Palace and Hyatt Ziva both a short airport ride in Montego Bay | Conflates Ocho Rios and Montego Bay | Identify Moon Palace in Ocho Rios; separate transfer planning; clarify Ziva/Zilara age distinction | Official Moon Palace and Hyatt sources |
| Same file, airport table | No commercial airport in Negril | Overbroad airport assertion | Negril has a domestic aerodrome | AAJ and Sangster sources |
| `montego-bay-jamaica.html`, resort list | Moon Palace has a Montego Bay property | Wrong location | Identify Ocho Rios | Moon Palace |
| Same file, families | Both properties in Rose Hall, about 20 minutes from airport | Wrong region/proximity for Moon Palace | Separate Rose Hall and Ocho Rios; provider-confirmed transfer planning with no invented replacement duration | Moon Palace and Hyatt |
| Same file, visible family FAQ and schema | Secrets family programs; Beaches near airport in schema | Wrong age policy and misleading geographic grouping | Explain local family-friendly option, adults-only Secrets, and Moon Palace's Ocho Rios base; remove unsupported schema grouping | Hyatt and Moon Palace |
| `montego-bay-vs-negril.html`, resort/cost tables | Moon Palace used as Montego Bay example | Wrong base | Remove misplaced example; leave pricing amounts and calculation behavior untouched | Moon Palace |
| Same file, families | Moon Palace local; Secrets has kids programs/waterparks | Wrong location/age policy | Correct bases and age policy; replace blanket five-minute arrival comparison with property/traffic-dependent wording | Moon Palace and Hyatt |
| Same file, airport FAQ/schema | No airport in Negril | Incorrect | Identify domestic aerodrome, usual international gateway MBJ | AAJ and Sangster |
| `negril-jamaica.html`, airport FAQ/schema | No direct airport in Negril | Overbroad/inaccurate | Domestic aerodrome, usual international gateway MBJ; link official aerodrome page in visible FAQ | AAJ |
| `blog-compare-caribbean-islands.html`, family island-choice paragraph | Moon Palace grouped with Montego Bay airport convenience | Wrong base | Keep Montego Bay/Ziva example; identify Moon Palace separately in Ocho Rios | Moon Palace and Hyatt |

All existing internal anchors were preserved. Added official citations are ordinary source links, not affiliate links. Existing paragraph/table/FAQ structure and schema types remain. Unchanged adjacent fees, transfer minutes and hotel availability are not certified by this patch.

## Tourism Data Changes

### Checked Japan statistic

| Field | Before | After | Meaning / evidence |
|---|---|---|---|
| Registry `annualArrivals` | `'31.9M'` | `'36.8699M'` | Millions of international visitor arrivals, national Japan, reference year 2024 |
| Adapter/fallback `annualArrivals` | `31.9` | `36.8699` | Same units retained, so sorting/render calculations remain consistent |
| `trendNote` | Record 31.9M in 2024, up 47% | JNTO 36,869,900 in 2024, up 47.1%, provisional release | Historical year-on-year statistic, not a verified current trend forecast |
| `notes` | 31.9M plus implied causal local crowd conclusions | Correct national total; distinguish it from local density | National arrivals do not directly measure Kyoto/Osaka/Mount Fuji crowding |
| New optional `arrivalsSource` | Absent | Publisher, actual URL, referenceYear, publishedAt, verifiedOn, metric, geographicScope, provisional status | Small additive object on Japan only, carried through adapter and fallback |

Reference year: **2024**. Publication date: **2025-01-15**. Statistic checked: **2026-10-25**. Publisher: JNTO. Status: the cited release's **provisional** estimate, not represented as a final revised series. JNTO's visitor definition is broader than a count of leisure tourists. The renderer therefore says international visitor arrivals rather than treating the number as tourists staying overnight. The release also identifies approximately 31.9M as the 2019 level, explaining the original year/value mismatch.

The card displays **36.9M** after one-decimal rounding, with the 2024 reference year, linked JNTO source, provisional/national scope and publication/check dates. The underlying value retains the release's exact precision in millions. No claim was made that the record's crowd score, budget score or other destinations were checked on that date.

### Remaining 29 figures

Before this patch the page/comment described the set as annual international arrivals, with a 2024 source attribution or a recovery-adjusted baseline, but no supporting per-record definition/year/source existed. The following raw values are retained as **unverified visitor estimates**, with scope/reference year explicitly unconfirmed. This is the least disruptive allowed response: no fabricated replacements, no coverage reduction, no zero substituted for missing data. The former blanket source attribution was removed.

| Destination | Data field | Raw value (millions, unchanged) | Actual category / source year | Status / corrected value |
|---|---|---:|---|---|
| Bali | annualArrivals | 5.8 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Thailand | annualArrivals | 28.2 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Maldives | annualArrivals | 1.9 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Jamaica | annualArrivals | 4.3 | Stopover/cruise/other coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Santorini | annualArrivals | 2.7 | Island/cruise/overnight coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Barcelona | annualArrivals | 12 | City/region/overnight coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Paris | annualArrivals | 40 | City/region/domestic/international coverage unconfirmed | Unverified estimate; no replacement |
| Rome | annualArrivals | 33 | Arrivals/overnights/geographic coverage unconfirmed | Unverified estimate; no replacement |
| Amsterdam | annualArrivals | 9.5 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Prague | annualArrivals | 5.2 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Dubrovnik | annualArrivals | 1.4 | City/Old Town/cruise/overnight coverage unconfirmed | Unverified estimate; no replacement |
| Bora Bora | annualArrivals | 0.22 | Island/French Polynesia coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Fiji | annualArrivals | 0.93 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Cancun | annualArrivals | 10.2 | City/airport/region visitor coverage unconfirmed | Unverified estimate; no replacement |
| Costa Rica | annualArrivals | 2.4 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Vietnam | annualArrivals | 13.5 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Singapore | annualArrivals | 13.6 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| New Zealand | annualArrivals | 3.4 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Iceland | annualArrivals | 2.3 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Portugal | annualArrivals | 26.5 | Domestic/international/overnight coverage unconfirmed | Unverified estimate; no replacement |
| Morocco | annualArrivals | 11.8 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Dominican Republic | annualArrivals | 10.3 | Air/cruise/stopover coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Barbados | annualArrivals | 0.72 | Stopover/cruise coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| St. Lucia | annualArrivals | 0.44 | Stopover/cruise coverage unconfirmed; year unknown | Unverified estimate; no replacement |
| Hawaii | annualArrivals | 9.1 | Domestic/international visitor coverage unconfirmed | Unverified estimate; no replacement |
| Turkey | annualArrivals | 45 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Colombia | annualArrivals | 3.9 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| South Korea | annualArrivals | 11.4 | Unconfirmed definition/year; source not established | Unverified estimate; no replacement |
| Mexico City | annualArrivals | 6.5 | City/airport/domestic/international coverage unconfirmed | Unverified estimate; no replacement |

This table does not assert that any of the unconfirmed categories is the true underlying series. It records which distinction must be established before certification. No tourism-receipt/currency series was verified or converted to arrivals. Embedded numerical growth/visitor statements in other notes remain unverified editorial context; the public methodology explicitly says this. Source acquisition for all 29 is separate work.

### Calculations and provenance

- Arrival conversion still parses strings in millions. Display still uses one decimal in millions or integer thousands. Missing, non-finite or negative values now display unavailable rather than a false zero/NaN or throwing during formatting.
- Arrival sort continues to order stored figures numerically; option labels now explicitly say mixed scope. Such ordering is not a comparable measure of popularity or density. Region/trend/traveler/search filters and reset are unchanged.
- Crowd/budget scores and map aggregation do not calculate their values from annualArrivals. All 50 registry identities, costs, links, score values and seasons remain unchanged outside the four intended Japan statistic/context fields. No new derived score or monthly forecast was introduced.
- `arrivalsSource` separates reference year, source publication and verification date. Baseline assembly date in comments remains June 19, 2026; file edits are not blanket review dates. No claim of quarterly verification or measured 12-18-month trend computation remains in the TDI FAQ.
- Visible FAQs and their structured answers agree. Schema types, metadata and canonical URL are unchanged. The TDI itself, all 30 cards, map, filters, existing related links and sort controls remain available.

## Requirements Data Status

Migration is **not present in this checkout**. `tools.html` still contains and directly reads a 14-record `REQ_DATA`. The separate `data/travel-requirements.json` has 12 destinations, a January 2026 review marker and conflicting values; production HTML/JS searches found no consumer of that JSON. `main.js` directs legacy requirements controls to the full tool rather than loading the JSON. Existing requirements tests inspect the inline object and pass 41 assertions. No requirement was changed or recertified by this phase.

Recommended separate Phase 1B scope: verify current official rules, define U.S.-passport audience and claim-specific source/review dates, map all 14 dropdown choices, and migrate one reviewed dataset without losing two destinations or reviving stale JSON. Include the Canada duration error, source/label accuracy and schema/UI scope consistency in that bounded review. Keep the tool's interactions stable.

## Unresolved Questions

1. GSC's exact lost URLs remain unavailable. The user-supplied 48-to-30 counts cannot be verified from a repository. Current local checks confirm 48 sitemap entries, existing files, indexable self-canonicals and unchanged exclusion policy. The preceding audit's live 200/legacy-404 observations were not re-certified with production requests in this phase; redirect implementation was explicitly excluded.
2. Twenty-nine visitor estimates, their true years/scopes, growth percentages and related historical claims need primary-source research. Editorial scores lack a reproducible measured-density method and remain labeled estimates. Do not treat them as forecasts.
3. Jamaica transfer durations/distances, including the guide's Kingston-to-Montego Bay 2-2.5-hour claim, the repeated Negril 90-minute/55-mile estimate and precise airport proximity claims remain unverified. No replacement duration was invented. Confirm current routes and traffic with authoritative operators before using them for tight connections.
4. Resort opening/reopening dates, room inclusions, childcare, shared-facility access and exact prices need date-specific confirmation. The official Sandals Royal Caribbean URL now identifies Caribbean Cay and future stays; that adjacent naming/availability issue was not substituted into the geographic repair. Some official resort pages display operational notices. This phase corrects location/age grouping, not availability across the island.
5. Negril Aerodrome exists; current charter/scheduled services were not established. No international service or guaranteed connection was promised.
6. Jamaica event calendars, weather/insurance/safety claims and other broad content research flags remain outside this bounded patch. Do not interpret untouched adjacent prose as verified.
7. Existing mobile document overflow remains: TDI 773px and Jamaica guide 430px at a 390px viewport. Baseline and patched widths are equal. TDI card/provenance content itself fits the viewport. A separate responsive-layout patch should investigate off-screen elements, tables and sticky controls.
8. The original Greek `#faq` fragment issue is pre-existing and unchanged; no related article/navigation fix was folded into this patch.

## Files Modified

Application changes:

1. `jamaica-travel-guide.html`
2. `montego-bay-jamaica.html`
3. `montego-bay-vs-negril.html`
4. `negril-jamaica.html`
5. `blog-compare-caribbean-islands.html`
6. `js/dv-destinations.js`
7. `js/tourism-demand-data.js`
8. `js/tourism-demand-index.js`
9. `tourism-demand-index.html`

Added (tests are local and ignored by the existing `tests/` rule):

10. `tests/factual-repair.test.js`
11. `tests/factual-repair-browser.js`
12. `reports/PHASE_1A_FACTUAL_REPAIR_REPORT.md`

Unrelated existing changes retained: `js/email-capture.js`, `privacy.html`. Five existing audit reports retained unchanged. None of the absent matcher modules was created.

## Regression Testing

Commands executed, using Node 22 and the existing Playwright/Chromium installation (no packages installed):

```powershell
node tests/travel-requirements.test.js
node --test --test-reporter=spec tests/factual-repair.test.js
$env:DV_SCREENSHOT_DIR = 'C:\Users\Dwhen\Downloads\Web Dev\reports\dreamvacati-phase1a-screenshots'
$env:DV_BASELINE_ROOT = 'C:\Users\Dwhen\Downloads\FullStackPortfolio\DreamVacati True Travel'
node tests/factual-repair-browser.js
```

The browser baseline path above referred to the untouched repository while testing the staged patch at `C:\Users\Dwhen\Downloads\Web Dev\dreamvacati-phase1a`. Baseline comparisons must use a genuinely unpatched copy to reproduce historical width comparisons. The optional screenshot output stays outside production. Both browser/server close automatically when the test exits.

| Check | Result |
|---|---|
| Baseline existing requirements assertions | 41 passed, 0 failed |
| New focused tests against original source | Expected failure: 2 passed, 6 failed, exposing original facts/provenance gaps |
| New focused tests against patch | 8 passed, 0 failed |
| Generated/fallback TDI | 30 records each, Japan value/source parity; no loss of existing scores/months |
| Registry validation and preservation comparison | 50 records; validation passes; unrelated record values unchanged |
| Syntax | All data JSON and 54 pages' JSON-LD parse; 14 external JS files and 70 inline executable blocks compile |
| Static targets and sitemap | No missing local href/src file target; 48 sitemap URLs retain self-canonicals and indexable policy; existing fragment issue not changed |
| Protected HTML metadata/script/ad/internal anchor comparison | Unchanged in all six affected HTML files; official external source links are the intended additions |
| Local real Chromium at 1440x1000 and 390x844 | TDI cards/source, region/search/sort/reset/no-results, all five edited Jamaica pages and paused forms checked |
| Other local tool smoke checks | Seasonal JSON loads 22 destinations; Jamaica lookup works; Japan/Jamaica comparison and Japan requirements lookup work |
| Local browser runtime/resources | No uncaught page errors or missing local response resources on the exercised paths |
| Mobile baseline comparison | Existing overflow unchanged; source/card text fits; not a clean-site mobile certification |
| Screenshots | Desktop/mobile TDI/Jamaica captures generated; representative desktop TDI and mobile Jamaica captures visually inspected |

Browser requests for ads, analytics, newsletter and backend services were blocked. No POST or service/checkout action was executed. Bootstrap/fonts were permitted for meaningful layout validation; the suite verifies Bootstrap CSS loaded. This tests the local patched frontend, not production tags/consent/reporting or backend availability. Test authoring found and corrected two test expectations (highest visitor record and seasonal result element ID); neither required application behavior changes. No production site, Lighthouse, live GSC, Rich Results eligibility, ad delivery, legal compliance or payment tests were performed in this phase.

Final repository checks: `git status --short`, `git diff --stat`, `git diff --check`; whitespace check passes with LF/CRLF normalization warnings. There are 11 modified tracked files: nine Phase 1A application files plus the two pre-existing modified files. The total tracked diff is 153 insertions and 182 deletions, including that pre-existing work. `reports/` remains untracked. The two new test files are present but ignored by `.gitignore:19` (`tests/`), as are the existing local test suites; `git check-ignore -v` confirms this. No ignore rules were changed and no tests were force-added. A later code-review/commit workflow must explicitly decide whether to version these local tests or retain the repository's existing local-only policy. No staging, commit, push or deployment.

## SEO Impact

The patch makes location/transfer advice more reliable, removes the specific wrong 2024 Japan figure, and limits unsupported measurement/freshness claims. Sources and dates help travelers assess what a statistic actually describes. Preserved URL/canonical/sitemap policy and internal links avoid an incidental acquisition migration. These changes do not identify Google's excluded URLs, prove why indexing fell, or promise ranking/CTR increases.

## Deployment Readiness

**CONDITIONAL**: technically validated for this bounded frontend correction, with the stated baseline mobile issues and unresolved research. Review the complete worktree and existing newsletter-pause changes before any authorized release. Remaining estimates are clearly marked, not independently certified. Phase 1B should address requirements source migration and current-rule verification as a separate bounded patch; indexing/export diagnosis and responsive-layout repair should remain separately scoped. Do not commit, push or deploy without a later explicit instruction.
