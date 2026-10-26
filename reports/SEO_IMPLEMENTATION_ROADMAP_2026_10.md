# DreamVacati implementation roadmap - October 2026

Date: 2026-10-25. Recommendations only; no public-facing changes implemented. Existing local newsletter pause is preserved. Priorities express implementation order, not Google ranking guarantees. Severity is separate from priority. All service/backend, database, payment and checkout architecture remains excluded.

## Priority 0: establish actual index loss and URL recovery

### P0-1. Reconstruct the lost URL cohort

- Files: `reports/SEO_INDEXING_DIAGNOSIS_2026_10.md`, `reports/SEO_PAGE_INVENTORY_2026_10.md`; proposed evidence CSV `reports/gsc-indexing-url-mapping-2026-10.csv` after exports arrive.
- Evidence / severity: user reports 48 -> 30 indexed; identity/cause unknown. HIGH diagnostic priority, not a confirmed sitewide deindexing defect.
- User impact: prevents losing useful landing pages and prevents unnecessary removals of good pages.
- Proposed fix: import current excluded examples, indexed examples/historical cohorts and inspected canonicals; retain original URL/host/scheme/query, map aliases and current repo file, compare cohorts and deployment dates.
- Dependencies: GSC exports detailed in diagnosis; URL Inspection for representative lost guides. No code changes depend on guessed excluded URL identities.
- Validation: explain every supplied URL's response, preferred canonical, index policy and opportunity; explicitly mark sampled/capped lists and unknown historical status.
- Regression risk: overnormalization hides redirect variants; aggregate subtraction misidentifies losses. Preserve raw exports.

### P0-2. Make evidenced legacy redirects work on the actual host

- Files: `_redirects`, `CNAME`; actual edge/hosting configuration is not represented here. If hosting requires a repository file, name it only after the platform is established; do not invent a Netlify config for GitHub deployment.
- Evidence / severity: 23/24 configured redirect sources return live 404; old Greek `.html` returns 200. HIGH for aliases with real links/impressions; medium/low for never-used guesses.
- User impact: users and crawlers following meaningful legacy URLs reach the equivalent guide.
- Proposed fix: inventory valued legacy targets using GSC/backlinks, configure supported permanent path redirects; preserve `best-time-greece.html` as preferred Greek guide. Existing file edit alone cannot deploy an edge rule.
- Dependencies: confirmed deployment/hosting access and authorized implementation; GSC/backlink evidence for prioritization. Do not migrate hosting as an incidental audit task.
- Validation: direct source -> intended 301/308 -> 200, same content intent, no chains/loops; correct canonical; sitemap/internal links retain final URL; nonexistent paths retain 404.
- Regression risk: wildcard redirects, cross-host loops, redirecting private results or all 404s to home. No broad catch-all 200 fallback.

### P0-3. Reconcile intentional exclusions without changing acquisition strategy blindly

- Files: `robots.txt`, `404.html`, `privacy.html`, `saved-trips.html`, `trip-planner.html`, `trip-results.html`, `blog-best-time-greece.html`, `best-time-greece.html`, `sitemap.xml`.
- Evidence / severity: six intentional noindex documents; two also robots-blocked; current sitemap clean. MEDIUM policy clarity, not an established cause of lost guide indexing.
- User impact: personal/utility URLs stay out of organic results; public guides remain discoverable.
- Proposed fix: document intended policy and map actual GSC exclusions. Change robots only if needed to let Google observe noindex, with explicit personal-result URL treatment. Optional removal of 404 timed refresh improves recovery UX.
- Dependencies: P0-1 and review of rendered privacy/noindex behavior; no service inspection needed.
- Validation: all 48 public sitemap URLs stay 200/self-canonical/indexable; six utility/legacy exclusions remain intentional; no new indexing of personal result variants.
- Regression risk: removing noindex indiscriminately, blocking canonical target, or altering intentional Greece setup.

## Priority 1: correct and improve existing demand pages

### P1-1. Repair Jamaica geography and source sensitive planning details

- Files: `jamaica-travel-guide.html`; verify related statements in `montego-bay-jamaica.html`, `negril-jamaica.html`, `montego-bay-vs-negril.html`, `blog-caribbean-family.html`, `jamaica-5-day-itinerary.html`, `best-time-to-visit-jamaica.html`.
- Evidence / severity: Royal Barbados listed in Montego Bay at guide :667; Moon Palace misclassified at :521,676. HIGH factual correctness. Festival/rainfall/transfer/resort-policy claims are research flags.
- User impact: avoids selecting the wrong area/resort and budgeting an unrealistic transfer.
- Proposed fix: correct known locations using primary sources; source/qualify practical prices, transfers, weather, childcare and events; distinguish climate tendencies and forecasts. Preserve useful quick answers.
- Dependencies: official property/transport/weather/organizer research, source dates and scope.
- Validation: facts agree across guide/table/FAQ/schema; descriptive links resolve; no added affiliates or fabricated first-hand claims; title still matches delivered content.
- Regression risk: copying outdated prices or changing one FAQ but not schema. Do not change calculators or tracking during content repair.

### P1-2. Establish one reviewed requirements feed and honest UI promises

- Files: `data/travel-requirements.json`, `tools.html`, `main.js`, `tests/travel-requirements.test.js`; possible new `js/travel-requirements.js` if extraction removes actual duplication.
- Evidence / severity: unused January JSON differs from 14-record inline source; Canada unlimited-stay claim; FAQ promises nationality selector absent. HIGH traveler accuracy; medium architecture risk.
- User impact: reliable passport/entry guidance with recognizable official sources.
- Proposed fix: verify live claims at official sources, replace Canada claim, choose one reviewed source with nationality/scope and claim-level URLs/date/version, adapt UI and align FAQ/schema to U.S.-passport audience. Do not reintroduce stale JSON during consolidation.
- Dependencies: verified data mapping including 12 JSON versus 14 UI destinations; definition of fallback/error behavior. No broad backend work.
- Validation: all existing dropdown options render current equivalent data; all official links accurately labeled; per-claim dates distinguish reviewed from inferred; tests cover unknown destination/load failure and source parity.
- Regression risk: loss of two destinations, stale fallback data, universal passport assumptions, misleading health/legal summaries.

### P1-3. Improve the six existing CTR pages using evidence

- Files: `jamaica-travel-guide.html`, `negril-jamaica.html`, `best-time-to-visit-jamaica.html`, `caribbean-travel-guide.html`, `blog-santorini-vs-mykonos.html`, `blog-tokyo-vs-osaka.html`; `sitemap.xml` only for genuine substantive change dates.
- Evidence / severity: titles/quick answers already improved, supplied themes match these pages, practical depth/source gaps persist. MEDIUM search-intent opportunity, unproven ranking cause.
- User impact: better base/island choice, comparable costs and realistic routes.
- Proposed fix: prioritize by page-filtered queries; improve answers/assumptions/sources, align metadata/schema where meaning changes, reconcile visible/schema review dates honestly. Do not mechanically append 2027 or rewrite every title.
- Dependencies: P1-1, GSC page/query export; primary research for cost/ferry comparisons.
- Validation: page/query intent matrix, before/after screenshots at desktop/mobile when implemented, metadata/FAQ parity, links and fragments valid. Compare equal-length performance windows with crawl/deploy annotation; no promised CTR uplift.
- Regression risk: losing existing relevant phrases, adding repetitive word count, cannibalizing hub versus specialist scope.

### P1-4. Correct TDI facts and measured-versus-editorial framing

- Files: `js/dv-destinations.js`, `js/tourism-demand-data.js`, `js/tourism-demand-index.js`, `tourism-demand-index.html`; verify embedded scores/notes in `jamaica-travel-guide.html`, `best-time-greece.html`, `japan-travel-guide.html` and `destination-comparison.html`.
- Evidence / severity: Japan's 2024 arrivals value contradicts JNTO; per-metric sources/year/scope absent; public density language overstates composite method. HIGH correctness, foundational for original insights.
- User impact: users can distinguish observed statistics from editorial advice and avoid false precision.
- Proposed fix: validate source/year/definition for all metrics, fix both registry and fallback, add review/confidence/estimate fields and explanatory limitations; never create monthly crowd measurements from annual labels.
- Dependencies: comparable official data and a documented method. The code can support missing values rather than fabricate them.
- Validation: adapter/fallback parity, no NaN, defined arrival units/geography/reference years, labels match evidence, null Mykonos metric not shown as measured zero.
- Regression risk: breaking sort/map color thresholds or silently mixing city/country definitions; score revision must be versioned and explained.

### P1-5. Preserve and validate the existing newsletter pause

- Files: existing uncommitted `js/email-capture.js`, `privacy.html`; initial static forms only in a separately scoped later patch.
- Evidence / severity: live handler/privacy differ from local pause; HTML still contains forms. MEDIUM operational consistency; no newsletter submission tested.
- User impact: public interaction and privacy wording match actual collection status.
- Proposed fix: review current work separately and include it together in a future authorized release; consider static paused content so no-JS/early-script failure does not show a signup invitation. Do not reactivate collection.
- Dependencies: owner's existing worktree changes and release authorization; this audit did not deploy.
- Validation: browser/network inspection with no submissions sent externally; no newsletter POST/event; paused UI/privacy match with scripts enabled and disabled; keep unrelated changes intact.
- Regression risk: reverting user work, treating HTTP success as proof newsletter operation, leaking data in a no-JS fallback.

## Priority 2: topical architecture and contextual navigation

### P2-1. Strengthen Jamaica, Caribbean and Greek-island paths

- Files: `blog.html`, `caribbean-travel-guide.html`, `blog-compare-caribbean-islands.html`, `negril-jamaica.html`, `montego-bay-vs-negril.html`, `best-time-greece.html`, `blog-santorini-vs-mykonos.html`, `best-time.html`, `tourism-demand-index.html`.
- Evidence / severity: all indexable pages reachable in two hops; contextual gaps remain, Greek comparison six inbound sources. MEDIUM navigational value, not orphan emergency.
- User impact: meaningful next decision is one relevant link away.
- Proposed fix: follow content audit's contextual placements; promote cluster structure within existing hub; fix Greek #faq ID; reuse existing good links instead of duplicating them.
- Dependencies: corrected target facts and TDI method; only existing pages as link targets.
- Validation: full static directed graph plus JS-created links; zero broken paths/fragments or links through redirects; check anchor context and mobile nav.
- Regression risk: navigation clutter, multiple near-identical anchors, advertising displacement or accidental canonical change.

### P2-2. Differentiate Japan specialists and comparison scopes

- Files: `blog-is-japan-expensive.html`, `blog-japan-travel-budget.html`, `blog-cheap-eats-japan.html`, `blog-tokyo-food-budget.html`, `blog-japan-travel-essentials.html`, `blog-japan-travel-mistakes.html`, `blog-tokyo-vs-osaka.html`, `destination-comparison.html`; nested headings in the ten files named in inventory evidence.
- Evidence / severity: topic overlap; identical parent/child headings; Santorini labeled Greece. MEDIUM content clarity; actual cannibalization unproven.
- User impact: faster route to an affordability answer, day-by-day budget or transit explanation.
- Proposed fix: assign each page a distinct question, remove redundant heading wrappers without deleting useful content, label island versus country accurately, link detailed pages rather than repeating their tables.
- Dependencies: GSC page/query crosswalk before consolidation; consistent cost definitions.
- Validation: headings/schema reflect content; no unique advice lost; all old useful links remain; ranking/query behavior monitored after deployment.
- Regression risk: unnecessary mergers, loss of long-tail relevance, changes to tool behavior from incidental markup edits.

## Priority 3: original planning utilities and reliable measurement

### P3-1. Add useful static utility answers and prepare CSP safely

- Files: `tourism-demand-index.html`, `best-time.html`, `seasonal-recommendations.html`, `destination-comparison.html`, their existing JS modules, `_headers`; additional inline-heavy pages only in a separately sized migration.
- Evidence / severity: empty initial TDI results, JS-built comparisons/calendars; strict file CSP incompatible with 70 inline blocks/63 event attributes, but no live CSP header. MEDIUM resilience; latent CSP risk.
- User impact: useful facts and guide routes remain when JS/fetch fails; controls remain functional after future security enforcement.
- Proposed fix: provide compact sourced static examples/directory; progressive enhance without duplicate answers; externalize relevant executable JS or use build-managed hashes before enabling restrictive CSP. Establish actual host support first.
- Dependencies: corrected data and source definitions; hosting facts; approved frontend scope.
- Validation: compare initial HTML and rendered output, network failures, JS-disabled guide access, keyboard/touch use and two responsive viewports. Stage CSP in report-only mode where supported; verify all needed hosts and no inline violations before enforcement.
- Regression risk: drift between static and dynamic data, script order faults, blocked inline controls or analytics. No security-policy rollout as a side effect of content edits.

### P3-2. Design and validate cost profiles/shared state before matcher UI

- Reuse: `js/dv-destinations.js`, `data/destinations.json`, `destination-comparison.html`, `seasonal-recommendations.html`, `saved-trips.html`, `tools.html`, `trip-planner.html` frontend only.
- Proposed new files: `data/destination-cost-profiles.json`, `js/trip-state.js`, `js/budget-destination-matcher.js`; all currently absent. Add focused tests only with implementation.
- Evidence / severity: name-based saved shortlist, no shared trip object, Japan 145 versus 185 cost definitions, no origin/traveler/night-aware matcher. MEDIUM readiness gap, not current SEO outage.
- User impact: realistic total budgets and preserved decisions across tools.
- Proposed fix: reviewed component costs, deterministic eligibility/ranking and versioned storage/migration specification; first validate three manual scenarios. Defer UI construction and generative itinerary work.
- Dependencies: P1-2/P1-4, source review, currency/occupancy/flight assumptions, safe migration. Backend changes excluded.
- Validation: total costs respect room nights versus per-person days, airfare origin and budget currency; deterministic ordering and uncertainty; saved shortlist migration preserves existing data; failures do not corrupt storage.
- Regression risk: false cheap-trip promises, counting all-inclusive meals twice, universal passport rules, loss of saved data or unsafe stored HTML.

### P3-3. Normalize frontend engagement events and validate consent separately

- Files: `js/dv-analytics.js`, `js/tourism-demand-index.js`, `js/best-time.js`, `main.js`, `tools.html`; separately scoped `ga-init.js`, `meta-pixel-init.js`, `cookie-consent.js` for consent validation.
- Evidence / severity: tool_view repair already present; TDI initial render emits destination_comparison; event parameter inconsistency; Meta PageView not tied to Google banner updates. MEDIUM measurement confidence; no verified legal judgment.
- User impact: prioritization based on real tool use and consistent preference behavior.
- Proposed fix: separate display/filter/action/completion semantics, keep any legacy transition documented, consistent tool_name and no PII; diagnose consent behavior before proposing changes. AdSense and backend/payment events remain excluded.
- Dependencies: agreed taxonomy, GA4 DebugView/Realtime access if available, recorded consent expectations and separate authorization for tracking changes.
- Validation: idle view does not produce interaction/completion; deliberate filter produces one expected action; errors do not count success; no email/trip text in event payload; accept/decline/revisit/storage-failure cases.
- Regression risk: double counting, breaking historical comparisons, changing collection behavior without a reviewed privacy update.

## Priority 4: constrained expansion after evidence and research

### P4-1. Publish only distinct, researched resources

- Files: existing guides first; proposed paths and reuse decisions are in `SEO_CONTENT_OPPORTUNITIES_2026_10.md`. `blog.html` and `sitemap.xml` change only when real pages publish.
- Evidence / severity: 20 scoped opportunities; Jamaica/Caribbean/Greece have existing demand themes, Japan already has substantial depth. MEDIUM growth opportunity.
- User impact: fewer unanswered decisions, not more near-duplicate landing pages.
- Proposed fix: ship one useful resource at a time; test whether an existing section solves the need first; retain source dates, explicit assumptions and useful inbound/contextual links.
- Dependencies: P0 evidence and P1 correctness, clear intent separation, original research and maintenance capacity.
- Validation: unique traveler decision, supported costs/claims, indexable initial HTML, valid metadata/schema/canonical, sources and complete links; GSC comparison after crawl/deployment, not guaranteed indexing.
- Regression risk: thin origin/budget/month pages, cannibalization, unmaintainable claims and dilution of current clusters.

## Top ten immediate actions

1. Obtain exclusion URL exports and historical indexed examples; identify actual lost landing pages.
2. Confirm real host/edge control and repair meaningful legacy paths returning 404.
3. Preserve the six intended exclusions and correct Greek preferred target.
4. Correct Royal Barbados and Moon Palace geography in Jamaica content.
5. Correct Japan TDI arrivals year/value and label editorial metrics honestly.
6. Correct Canada visitor-duration claim and reconcile inline/JSON requirements with official sources.
7. Preserve the local newsletter pause and document that production still has the older script; no reactivation.
8. Improve Jamaica/Negril/timing and Caribbean/island comparison evidence behind existing titles/quick answers.
9. Fix Greek #faq, comparison scope labels and redundant nested Japan headings in bounded patches.
10. Draft source/units/state contracts before total-budget content or matcher integration.

## Implementation order and release gates

Evidence mapping and independently confirmed factual corrections can proceed in parallel once implementation is authorized. Redirect deployment needs actual hosting support. Requirements/TDI governance precedes new derived claims. Contextual links follow correct destinations and facts. Static utility fallback and measurement work follow stable data contracts. Cost profiles/shared state precede matcher UI; researched expansion follows existing-page improvement.

Each release should record exactly which files changed, preserve user edits, run diff checks and focused behavior/link/schema checks, verify production responses after authorized deployment, then compare equivalent GSC windows by page/query/device/country. A rising indexed count alone is not success if only low-value aliases are indexed. More useful clicks and completed planning actions matter. Do not alter AdSense, calculators, analytics or canonical strategy incidentally during factual/content patches.

## Recommended next implementation prompt

> Implement only the verified DreamVacati frontend factual corrections from P1-1 and the Canada duration correction from P1-2. First inspect current git state and preserve the existing newsletter-pause changes. Correct Jamaica resort geography using official property sources and replace the Canada unlimited-stay claim with sourced U.S.-visitor guidance. Update only associated visible/FAQ/schema statements that conflict. Keep existing URLs, schema types, calculators, AdSense, analytics and intentional Greece canonical setup. Do not inspect the separate backend or payment systems, add affiliate links or identity details, reactivate newsletter collection, commit, push or deploy. Report exact files/claims changed, sources, focused validation and remaining research gaps. Treat redirects, TDI-wide data migration and matcher UI as separate reviewed scopes.
