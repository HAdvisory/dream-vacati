# DreamVacati SEO and indexing diagnosis - October 2026

Audit date: 2026-10-25, America/New_York. Frontend repository: `C:\Users\Dwhen\Downloads\FullStackPortfolio\DreamVacati True Travel`. Branch: `master`; HEAD: `23c205a` (Improve frontend SEO, internal linking, and tool analytics).

## Executive summary

The cause of the 48-to-30 indexed URL decline is **not established**. The supplied snapshots measure different URL populations (95 previously, 91 currently), and no category-level URL exports or historical indexed URL lists were supplied. There is no evidence of 18 important guides being removed in this checkout. All 48 current sitemap URLs returned HTTP 200 in this audit, have self-canonicals and indexable HTML directives, and are reachable within two static link hops of the homepage.

There is a confirmed deployment defect: responses identify GitHub hosting, while `_redirects` describes Netlify configuration. Of 24 configured legacy redirect sources, 23 returned 404 and `blog-best-time-greece.html` returned 200 instead of the configured 301. HTTP/www root normalization works. This warrants repair where real historical URLs have demand or links, but does not identify Google's 34 redirect exclusions or prove it caused the 18-URL decline.

Low organic visibility is consistent with broad competitive targeting, limited demonstrable original research, factual errors in priority guides, and utilities whose principal results require JS. This is a reasoned assessment, not a confirmed Google ranking diagnosis. At average position 59.3, titles alone are unlikely to produce substantial traffic. Improve the planning answers and evidence behind the pages already receiving impressions before expanding.

## Evidence boundaries

- User observations, not independently verified account data: latest GSC 5 clicks / 7,020 impressions / 0.1% CTR / position 59.3; earlier 3 / 4,190 / 0.1% / 56.1. Rolling windows overlap and are not exact growth periods. Five divided by 7,020 is about 0.071%, consistent with rounded 0.1%.
- Indexing observations: 48 indexed / 47 excluded previously; 30 / 61 currently. Category counts sum to 61. Net indexed decline of 18 does not identify the 18 individual losses or rule out simultaneous gains.
- Ahrefs observations: health 100, 95 crawled URLs, three redirects, zero broken/blocked, DR 0, 925 referring domains, approximately 1,000 backlinks, zero estimated traffic/keywords. These do not replace Google's impression data. Current live tests can differ by URL sample, crawl date and configuration.
- AdSense observations: $0.02 over seven days, $0.25 month/28 days, 193 pageviews, 33 ad impressions, approximately $0.13 page RPM, zero clicks. No account access or ad changes. Low monetization is secondary; counts alone do not establish an ad implementation defect.
- Repository: all 54 public HTML documents parsed, all JSON-LD blocks parsed as JSON, sitemap XML parsed, static anchor graph built; frontend JS/data dependencies and relevant handlers inspected. Syntax checks passed for all 14 external frontend JS files and 70 inline executable blocks using Node vm.Script without execution. Syntax success does not certify runtime behavior. No backend source, databases, payment systems, Stripe or server-side architecture inspected. No service submissions, newsletter submissions or payment flows executed.
- Live evidence: 86 read-only public GET checks covering 54 HTML paths, 24 legacy paths (one overlaps HTML inventory), root host/scheme variants and selected URL variants, robots/sitemap and one deliberately nonexistent path. HTTP statuses/headers are direct observations, not Search Console indexing status. Asset comparison additionally checked newsletter/analytics JS. Requests performed at the audit session; HTTP Date headers use UTC and may read the next calendar date.
- No rendered browser/mobile audit, Lighthouse, Core Web Vitals, Rich Results Test, live keyword difficulty/volume analysis or verified backlink export. No claim of actual Googlebot rendering or live console-error absence.
- Existing uncommitted files: `js/email-capture.js`, `privacy.html`; preserved. Initial diff: 73 insertions, 133 deletions. These implement the local newsletter pause. Reports are the only new repository material authorized by this audit.

## Inventory and direct technical observations

| Check | Result | Meaning |
|---|---|---|
| HTML documents | 54 | Full field-level inventory in companion report |
| Sitemap URLs | 48, all live 200 | No broken sitemap targets found |
| Intentional HTML noindex | 6 | Excluded from sitemap |
| Malformed JSON-LD | 0 parse errors | Syntax only, not rich-result eligibility |
| Indexable static orphans | 0 | Does not prove all pages are crawled/indexed |
| Maximum indexable static depth | 2 | No evidence of widespread deep burial |
| Missing local HTML anchor targets | 0 | Static graph only, not all generated links |
| Broken fragment | `best-time-greece.html -> #faq` | Low severity; FAQ has no matching ID |
| Canonical duplicates/chains in current sitemap | None found | Preferred targets exist and returned 200 |
| Missing initial H1 | `trip-planner.html` | Noindex workflow; not a plausible editorial loss cause |
| Inline executable scripts / event attributes | 70 / 63 | Future CSP enforcement compatibility risk |

The complete adjacency lists, per-page metadata, H1s, approximate word counts, schema types, sitemap dates and rendering dependence are in `SEO_PAGE_INVENTORY_2026_10.md`.

## B1. Redirect analysis

`_redirects:1-8` assumes Netlify and primary-domain settings. Live `Server: GitHub.com` and observed behavior demonstrate these rules are not taking effect on the checked deployment. Do not count configuration lines as functioning redirects.

| Sources | Configured destination | Live observation | Classification |
|---|---|---|---|
| `/blog/`, `/tools/`, `/best-time/`, `/book-now/`, `/about/`, `/privacy/` | Matching `.html` pages | All 404 | POTENTIALLY PROBLEMATIC: confirm historical usage |
| `/caribbean/`, `/caribbean-travel-guide/` | `/caribbean-travel-guide.html` | Both 404 | POTENTIALLY PROBLEMATIC |
| `/trip-planner/`, `/trip-results/` | Matching noindex utility | Both 404 | Lower acquisition priority; preserve privacy |
| `/blog-budget-planning/`, `/blog-caribbean-family/`, `/blog-compare-caribbean-islands/`, `/blog-destination-comparison/` | Matching `.html` | All 404 | POTENTIALLY PROBLEMATIC |
| `/blog-santorini-vs-mykonos/`, `/blog-bali-vs-thailand/`, `/blog-maldives-vs-bora-bora/` | Matching `.html` | All 404 | POTENTIALLY PROBLEMATIC |
| `/blog-choose-europe-cities/`, `/blog-hidden-destinations/`, `/blog-best-time-japan/`, `/blog-best-time-maldives/`, `/blog-elmo/` | Matching `.html` | All 404 | POTENTIALLY PROBLEMATIC |
| `/blog-best-time-greece/` | `/best-time-greece.html` | 404 | POTENTIALLY PROBLEMATIC legacy alias |
| `/blog-best-time-greece.html` | `/best-time-greece.html` | 200, noindex, canonical target correct | EXPECTED duplicate suppression works; configured permanent redirect does not |
| `http://dreamvacati.com/` | HTTPS root | 301 directly to HTTPS non-www root, which is 200 | EXPECTED |
| `http://www.dreamvacati.com/`, `https://www.dreamvacati.com/` | HTTPS root | 301 directly to HTTPS non-www root | EXPECTED |
| `/index.html` | Canonical `/` | 200 with root canonical | EXPECTED canonical alias |
| `/tools` | Canonical `/tools.html` | 200 with correct canonical | REQUIRES LIVE VERIFICATION for other extensionless paths |
| `/tools.html/` | No configured rule | 404 | Usually invalid variant; validate external discovery |
| Arbitrary nonexistent path | 404 | Actual HTTP 404, custom error content | EXPECTED |

There are no static internal anchors to the configured legacy redirect sources and no such source URLs in the sitemap. No redirect chain was observed for the three host/scheme roots checked; path-level host normalization and every arbitrary URL variant were not exhaustively tested. A 404 page's `404.html:22` five-second meta refresh to home is a separate client redirect, not a working HTTP 301 for legacy URLs. It can explain confusing browser behavior after a real 404. Direct `/404.html` returns 200/noindex; a nonexistent path correctly returns 404, so this does not establish a sitewide soft-404 defect.

The 34 GSC redirect exclusions may be combinations of scheme, host, old paths, historic responses and discovered variants. They cannot be mapped to the 24 rules or to Ahrefs' three observed redirects without exports. Do not mass-redirect missing URLs to the homepage; use an equivalent destination where one exists, otherwise retain a true 404/410.

## B2. Crawled, currently not indexed: inspection candidates

**These are candidate priorities, not Google's actual 12 URLs.** They may be indexed today. Word counts are approximate source text, not quality thresholds. Select by observed content/rendering characteristics and replace this list with GSC URL-level evidence.

| Candidate file | Inspect for | Suggested decision |
|---|---|---|
| `travel-map.html` | About 87 words outside header/footer; personal tracking rather than a search answer | Keep utility; decide acquisition intent before noindex discussion |
| `seasonal-recommendations.html` | About 249 words; recommendations JS-generated; overlap with best-time utility | Differentiate discovery purpose; retain static useful fallback |
| `destination-comparison.html` | About 378 words; pair results JS-generated | Add a meaningful static comparison methodology/example |
| `best-time.html` | Cards/calendars JS-generated; generic timing head term | Static destination directory and concise example |
| `blog-caribbean-family.html` | Roughly 766 words across five resorts; childcare/price claims need primary sources | Research actual inclusions, ages and extra fees |
| `blog-destination-comparison.html` | Meta/editorial discussion of viewer conversations and blog ideas distracts from trip choice | Reposition as practical decision framework |
| `blog-hidden-destinations.html` | 12 destinations in roughly 1,190 words; unsupported savings and broad hidden-gem claims | Fewer useful alternatives, researched access/cost trade-offs |
| `blog-is-japan-expensive.html` | Cost intent overlaps seven-day Japan budget article | Differentiate affordability verdict versus itemized itinerary |
| `blog-japan-travel-essentials.html` | Transit, cash, IC and etiquette overlap other Japan guides | Arrival checklist, with deep links to specialist pages |
| `blog-japan-travel-mistakes.html` | Repeated planning advice; nested identical headings | Focus costly avoidable mistakes with evidence |
| `book-now.html` | Navigational page with booking-oriented slug but planning-guide content | Clarify workflow and page purpose |
| `world-cup-2026-travel-guide.html` | Event has passed; some prose remains prospective despite archive context elsewhere | Preserve historical URL, clearly archive/review tense |

No canonical or robots defect was found on these indexable examples. Do not consolidate or noindex them simply because they appear in this candidate table.

## B3. Discovered, currently not indexed

No indexable static orphan, excessive static crawl depth or massive generated URL population was found. Parameter/filter changes in the inspected utilities generally render client-side rather than creating thousands of static pages. This does not exclude external duplicate discovery.

Relatively fewer static incoming sources make `blog-best-time-maldives.html` (4), `best-time-greece.html` (6), `blog-santorini-vs-mykonos.html` (6), `blog-maldives-vs-bora-bora.html` (6), `world-cup-2026-atlanta.html` (6), `world-cup-2026-travel-budget.html` (6), `negril-jamaica.html` (7), `montego-bay-jamaica.html` (7), and `best-time-to-visit-jamaica.html` (7) sensible inspection candidates **if they occur in the export**. None is proven to belong to Google's ten URLs. Their one/two-hop homepage paths mean weak discovery is not established. Do not manufacture a tenth candidate to match the reported count or diagnose crawl-budget exhaustion from this small site.

Join the actual ten URLs to sitemap membership, first-added dates, Google last crawl/inspection, links and live redirects. If excluded URLs are historical variants, prioritize normalization; if they are real guides, inspect content, deployment date and rendered output. Static link counts include navigation and do not measure link equity.

## B4-B6. Noindex, robots, 404 and canonicals

| File | Current directive / relationship | Recommendation |
|---|---|---|
| `404.html` | noindex,nofollow | Keep error handling; consider removing auto-home refresh in later UX patch |
| `privacy.html` | noindex,follow, self-canonical | Intentional legal page choice; no growth emergency |
| `saved-trips.html` | noindex,nofollow; no canonical | Appropriate for personal browser state |
| `trip-planner.html` | noindex,follow; robots disallow | Keep acquisition exclusion; reconcile crawl/noindex only after deciding privacy/crawl policy |
| `trip-results.html` | noindex,follow; robots disallow | Personal results stay out of sitemap/index; query variants must be included in verification |
| `blog-best-time-greece.html` | noindex,follow; canonical to `best-time-greece.html` | Preserve intended target; implement existing redirect only through supported hosting configuration |

Google reports two noindexed URLs, not necessarily all six repository pages. Crawl history and discovered URLs explain possible differences; exact identities are unknown. Likewise one robots exclusion does not prove only one disallowed path exists. Robots blocking can prevent Google seeing HTML noindex; do not interpret it as guaranteed removal. [Google's Page indexing guidance](https://support.google.com/webmasters/answer/7440203) explains category meanings and why exclusions are not automatically errors.

The one alternate canonical exclusion plausibly corresponds to the old Greek URL or a host/extension alias; this is a hypothesis, not identification. All 48 sitemap canonicals point to their own public URL and returned 200. The old Greek URL points directly to the preferred guide, which self-canonicalizes; no chain found. Three other noindex utilities omit canonical, which does not explain guide loss. URL variants remain possible outside the static inventory. [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) supports aligning internal URLs, sitemaps, canonicals and permanent redirects.

The single GSC 404 cannot be identified without its exported URL. Current sitemap targets and static internal HTML targets are intact. Several live legacy 404s were found, but none is confirmed as that reported URL. `_redirects` comments mention an old nonexistent Starbucks page; it is historical context, not evidence that it is the current GSC exclusion.

## Technical quality and JS visibility

Editorial copy exists in initial HTML on destination guides and comparisons. Major utility results do not: `tourism-demand-index.html:648` is empty before JS; `js/tourism-demand-index.js:159` injects cards. `js/best-time.js:19` fetches seasonal JSON; seasonal finder/comparison results are inline-generated. This creates a rendering dependency, not proof Google cannot render them. Provide concise static answers, sources and real guide links alongside progressive enhancement. [Google's JS SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) describes the rendering stage and crawlable links.

`_headers:14` forbids inline scripts, but the checked live pages have **no CSP response header**. Thus inline/CSP breakage is a latent deployment risk, not a confirmed current outage. The 70 executable inline blocks and 63 event attributes must be migrated or selectively hashed/nonced before enforcing that policy. Static style attributes are permitted by the current file's style policy. Do not weaken CSP blindly or claim it is causing current indexing loss.

JSON-LD syntax passes across all pages. Visible/schema mismatches remain: `tools.html:88,1303` says users select passport country; actual tool is explicitly for U.S. passport holders. Packing FAQs promise trip-length/style controls beyond actual type/season controls. `destination-comparison.html:495` labels the Santorini record as Greece, hiding island/country scope. FAQ markup is not a ranking guarantee, and no new rating, review or personal identity schema is needed.

63 parsed image elements include 42 tracking pixels without alt attributes; the other 21 have alt attributes. Do not classify invisible tracking pixels as 42 missing destination-photo descriptions. There are 21 lazy-loaded image elements and no srcset. Some third-party editorial images lack intrinsic dimensions; examine CSS aspect ratios and mobile layout before calling actual CLS. No measured LCP/CLS/INP scores. Bootstrap/font delivery and 51 inline style blocks merit targeted measurement, not a framework rewrite. Repeated parent/child headings appear in ten Japan pages; they are not evidence of entire duplicated articles. Article schema/visible review dates on priority pages still show May while sitemap records the August CTR change; reconcile meaningful editorial updates, not cosmetic freshness.

## Tracking and newsletter status

`js/dv-analytics.js` now emits `tool_view` from IntersectionObserver and reserves interaction events for handlers. This prior defect has been repaired; do not repeat the earlier page-load tool_start finding. Some events still mix `tool_name` and `event_label`. `js/tourism-demand-index.js:123` still sends `destination_comparison` after initial render, so it is not a clean user comparison metric. No GA4 live reports were inspected. Separate Ads and GA loader URLs do not prove duplicate GA4 pageviews.

Local `js/email-capture.js` replaces forms with a paused notice and performs no collection request; local privacy text reflects this. Live JS still contains the older collection handler, and live privacy still says subscribe. Existing changes are not deployed. Preserve the pause; any future approved release should publish the two files together and confirm no newsletter POSTs, including error/no-JS states. Static initial HTML still contains signup forms; a later approved static pause would avoid reliance on JS. This audit did not submit addresses or call the service. Meta script initializes PageView regardless of the local consent banner's Google-only updates; validate consent behavior separately, without asserting a legal violation or changing tracking/AdSense here.

## Backlink investigation

DR 0 with 925 referring domains is unusual but cannot be explained from these files. Working root normalization should consolidate the checked host/scheme variants; legacy 404 paths may waste real links if any point there. No conclusion that links are spam, bought, valuable, indexed or counted by Ahrefs is justified.

Obtain a full Ahrefs live/lost backlink export with source URL/domain, target URL, followed/nofollow/sponsored/UGC, redirect chain, first/last seen, link status, source HTTP/indexability, anchor/context, referring-page traffic and domain metric. Preserve original target URL, then normalize scheme/host for matching and map path aliases separately. Group by real unique domains and target path; inspect a stratified sample of followed links, dominant hosts, lost links, directory/sitewide links and legacy targets. Test final destinations. Check export filters, property variants and update dates before interpreting DR. Do not recommend disavow without specific evidence and specialist review.

## Exact GSC evidence required

| Export / evidence | Question | Join method | Priority consequence |
|---|---|---|---|
| Current Page Indexing examples for all seven nonzero categories | Which URLs make up 34 redirects, 12 crawled, 10 discovered, 2 noindex, 1 404, 1 alternate, 1 robots? | Preserve raw full URL, category, crawl date; map host/path and query variants to inventory | Separates intended exclusions from lost landing pages |
| Indexed URL examples/list where available, current and previous snapshot | Which URLs actually left/gained index? | Compare exact sets first, then canonical groups; GSC examples may be incomplete | Establishes actual loss cohort instead of subtracting totals |
| URL Inspection for representative excluded and lost priority guides | Google-selected canonical, crawled page, last crawl, robots and rendering? | Join exact inspected URL and preferred canonical | Confirms canonical/JS/response problems |
| Performance by page with dates/clicks/impressions/CTR/position | Which existing pages have actionable demand? | Retain canonical URL; compare equal-length prior periods and YoY where available | Orders six-page content improvements by opportunity |
| Performance by query, plus page-filtered query exports | Which pages compete for same query and intent? | Query + landing page + date; aggregate-only export cannot establish overlap | Changes consolidation and title decisions |
| Performance by country | Is audience origin/language mismatched to advice? | Country/page breakdown with consistent dates | Determines U.S.-origin versus broader budget assumptions |
| Performance by device | Is poor mobile visibility or CTR concentrated? | Device/page/date | Targets mobile rendering/UX validation |
| Sitemap submission status and URL examples | Is current sitemap fetched and processed? | Submitted URL, last read, discovered count, failures | Fix submission/fetching before content expansion |
| Historical indexing timelines and comparable exports | Did a deploy, migration or crawl change precede decline? | Timeline against git/deploy evidence and last successful crawl | Narrows cause; does not prove causation alone |

Use domain-property scope or document URL-prefix scope explicitly. GSC does not always provide a complete indexed URL inventory, exports can be sampled/capped and anonymous query data omitted. Keep original excluded variants rather than normalizing them away before diagnosis. No available export was fabricated.

## Verdicts

| Area | Verdict |
|---|---|
| Technical SEO | NEEDS WORK |
| Indexing health | REQUIRES INVESTIGATION |
| Content quality | MIXED |
| Topical authority | DEVELOPING |
| Internal linking | NEEDS WORK (contextual strength; static discovery is sound) |
| Organic growth readiness | CONDITIONAL |

Before publishing new content: identify actual index losses, repair evidenced legacy URL recovery through the real host, correct Jamaica/TDI accuracy and source governance, preserve the newsletter pause, and resolve utility data consistency. Improve Jamaica/Negril/best-time first, then Caribbean comparisons/family advice and Santorini/Mykonos. Next three investment clusters: Jamaica planning; Caribbean comparisons/value/timing; Greece island choice/timing. Japan is the deepest existing secondary cluster and should be maintained rather than expanded indiscriminately. Next phase: bounded indexing-evidence and factual-repair implementation, followed by a measured improvement of existing impression pages. No promise of ranking recovery or indexing from any single patch.
