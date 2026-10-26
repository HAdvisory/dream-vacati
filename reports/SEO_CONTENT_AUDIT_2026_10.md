# DreamVacati content, clusters and frontend utility audit

Date: 2026-10-25. Read-only frontend review. Evidence labels: CONFIRMED means observed repository or HTTP behavior; HYPOTHESIS means a possible search effect; RESEARCH means a fact or market assumption needs validation. No GSC URL/query export, search volumes or competitor ranking dataset supplied. Primary intent classifications are editorial judgments.

## Search visibility assessment

The supplied average position of 59.3 makes ranking relevance and usefulness a higher priority than another title-only CTR pass. New impressions could reflect more long-tail or lower-ranking exposure, country/device mix changes or broader discovery; aggregate rolling windows cannot distinguish these. Google already shows some pages, so Ahrefs' estimated zero keywords/traffic does not negate Search Console impressions. A technical crawl health score evaluates its tested issues, not the quality or competitiveness of travel advice.

Existing six-page CTR work is present: current titles explicitly address Negril costs/resorts/safety, Jamaica areas/costs/itinerary, Jamaica cheapest months/weather, Santorini versus Mykonos, Tokyo versus Osaka, and Caribbean budget/weather/style. Quick answers and contextual tool links exist. Repeating these changes without page/query evidence would add limited value. Improve the decision evidence behind those promises. [Google's people-first guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) emphasizes useful, reliable content and original value; it does not require publishing a personal identity or increasing word count.

## Priority query/intent review

| Actual page / intended query | Actual focus and distinct value | Support / links / tools | Overlap risk and improvement | Live keyword validation |
|---|---|---|---|---|
| `jamaica-travel-guide.html`: Jamaica travel guide / Jamaica travel | National planning hub, bases, transfers, daily costs, families/couples; useful quick answer | Six-page Jamaica cluster; timing, budget, requirements, TDI | Keep broad hub; correct resort geography and source all practical costs. Link general Caribbean choice rather than duplicating island comparisons | Required: page-filtered queries, origin/device and equal-window performance |
| `negril-jamaica.html`: Negril Jamaica / Negril resorts | Seven Mile Beach versus West End, pace, transfers, practical resort selection | Jamaica, Montego Bay comparison, timing, requirements and tools | Distinguish neighborhood/base decision from generic Jamaica pitch; dated transfer ranges and beach access details | Required: resorts versus destination-guide query mix |
| `montego-bay-jamaica.html`: Montego Bay travel guide | Airport convenience, resorts, beaches and excursions | Jamaica hub, Negril, itinerary, timing | Validate hotels' real locations; add airport-zone versus Rose Hall trade-offs | Required before competing for broad resort booking terms |
| `best-time-to-visit-jamaica.html`: best/cheapest time to visit Jamaica | Month table, weather, hurricane risk, price seasonality, events | Jamaica/Negril/Montego Bay/itinerary; best-time and requirements | Distinguish climate tendencies from guarantees; cite weather normals and current event organizer dates. Safety FAQ currently answers weather, not overall safety | Required: month-specific, hurricane and price demand |
| `caribbean-travel-guide.html`: Caribbean travel guide / vacation planning | Regional island choice by budget, weather and family style | Jamaica, island comparison, family resorts, timing and budget tools | Own regional orientation; delegate numeric comparisons to island-comparison article. Add transit/passport assumptions and explicit excluded costs | Required: broad guide versus less-crowded/value intent |
| `blog-compare-caribbean-islands.html`: compare Caribbean islands | Seven-island budget table, pairwise contrasts including Jamaica | Caribbean and Jamaica guides; budget/entry/packing tools | Own island choice with consistent six-night/seven-day units and sourced examples; avoid duplicating entire regional guide | Required: page/query overlap and specific pairs |
| `blog-caribbean-family.html`: Caribbean family resorts | Five named resorts with childcare and prices | Caribbean/Jamaica; budget and packing | Shallow for commercial research. Verify ages, availability, childcare extra fees, transfers and room occupancy with official properties. No personal experience claims | Required: resort versus family-destination demand |
| `blog-santorini-vs-mykonos.html`: Santorini vs Mykonos / reverse wording | Romance/views versus beach/nightlife, cost table and both-island option | Greece timing, comparison tool, budget, requirements | Strong decision structure; add ferry time/cost/reliability assumptions, constrained 5/7-night choices and dated comparable room baskets | Required: reverse query same intent, budget/honeymoon versus nightlife sub-intents |
| `best-time-greece.html`: best time to visit Greece | National monthly calendar with Athens/Santorini/Mykonos/Crete timing | Island comparison, best-time tool and TDI | Keep national scope; clarify island-specific limits and source weather/seasonal savings. Preserve intentional old blog canonical | Required: national versus island season demand |
| `tourism-demand-index.html`: crowd levels / less-crowded destinations | Editorial scores across 30 destinations plus annual arrivals | Jamaica/Japan and Caribbean comparison links, map and seasonal tools | Useful product potential, but fix provenance and measured-versus-editorial claims before search-led analyses | Required: traveler phrasing may differ from branded Tourism Demand Index |

No actual cannibalization is proven without query-to-page exports. Related topics can coexist if pages solve different decisions. Differentiate Japan affordability overview (`blog-is-japan-expensive.html`) from an itemized seven-day budget (`blog-japan-travel-budget.html`), nationwide cheap meals (`blog-cheap-eats-japan.html`) from Tokyo daily food allocation (`blog-tokyo-food-budget.html`), and arrival essentials from transit/mistakes/packing specialists. Do not consolidate solely because both mention a JR Pass.

## Confirmed accuracy and trust issues

1. `jamaica-travel-guide.html:667` lists Sandals Royal Barbados in Montego Bay. Its [official property page](https://www.sandals.com/royal-barbados/) locates it in Barbados. Correct geography before expanding resort coverage.
2. `jamaica-travel-guide.html:521,676` places Moon Palace among Montego Bay options and describes it as within a short drive of that airport. The [official Moon Palace Jamaica page](https://jamaica.moonpalace.com/) locates it in Ocho Rios. Correct the base classification and research realistic airport transfer timing.
3. `js/dv-destinations.js:513,516` and fallback `js/tourism-demand-data.js:118,121` label 31.9M Japan arrivals as 2024. [JNTO's January 2025 release](https://www.jnto.go.jp/news/press/20250115_monthly.html) reports 36,869,900 for 2024 and 31,882,049 for 2019. This is a year/value mismatch, not merely a stale refresh date.
4. `tools.html:1557` says no time-limit restriction for U.S. passport visitors to Canada. Official [IRCC guidance](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/about-visitor-visa.html) describes most visitor stays as up to six months, with the border officer setting duration. Visa exemption is not unlimited residence. Correct and cite after confirming U.S.-citizen context in official guidance.
5. `data/travel-requirements.json:5,14,21,31` has a January review marker, an older UK fee and a mislabeled visa-application URL, plus old ETIAS pricing. The live UI instead uses the separate 14-destination `REQ_DATA` in `tools.html:1545` with different UK/ETIAS wording. JSON is not referenced by current production HTML/JS. Do not blame unused JSON for live tool output, but remove this drift before using it for future products. Verify all fee/status claims officially at implementation time.
6. `tools.html:88,1303` FAQs promise passport-nationality selection absent from the U.S.-only form; packing FAQs promise controls beyond those available. Align statements with actual controls and schema.
7. `destination-comparison.html:490` Japan cost is 145 while registry `dailyCostMid` is 185. The code deliberately preserves a tool-specific number, so this is a semantic/governance gap rather than proof arithmetic is broken. Define shared units/inclusions and resolve values before budget matching. `:495` uses label Greece for Santorini, a scope mismatch.

Research flags, not independently confirmed errors: Jamaica festival month/venue descriptions (`best-time-to-visit-jamaica.html:657-683`), precise monthly rainfall, automatic insurance coverage claims, airport routing/transfer times, resort childcare inclusions, flight/hotel pricing, large shoulder-season discount percentages, destination safety generalizations and airline/pet requirements. Source these to meteorological agencies, current organizers, airports/operators, properties and official government sources. Distinguish planning estimates from quotations and ordinary risk advice from guarantees. Brand-level research notes and an editorial correction channel can support trust without personal bylines or identity schema.

## All-page editorial dispositions

KEEP means retain useful purpose, not every factual claim is certified. IMPROVE means revise useful existing content. REPOSITION means change emphasis while retaining the URL pending evidence. CONSOLIDATE means preserve an existing intentional preferred target, not automatic deletion. REMOVE CANDIDATE means evaluate only; none is justified solely by this audit.

| File | Decision | Traveler benefit / bounded change |
|---|---|---|
| `404.html` | KEEP | Genuine error navigation; consider removing timed home jump |
| `about.html` | IMPROVE | Make claims about actual research/sources auditable; maintain brand identity |
| `best-time-greece.html` | IMPROVE | Source climate/cost comparisons, fix #faq and ground island timing |
| `best-time-to-visit-jamaica.html` | IMPROVE | Source monthly weather/events and qualify savings/safety |
| `best-time.html` | IMPROVE | Static useful seasonal example/directory; preserve 22-record tool |
| `blog-bali-vs-thailand.html` | IMPROVE | Define comparable route/length/cost assumptions; update practical rules |
| `blog-best-areas-tokyo.html` | IMPROVE | Source lodging ranges and transit trade-offs; remove repeated parent/child headings |
| `blog-best-time-greece.html` | CONSOLIDATE | Existing canonical to best-time-greece is intentional; recover aliases via supported hosting |
| `blog-best-time-japan.html` | IMPROVE | Link current official blossom/transport sources; qualify countrywide seasonality |
| `blog-best-time-maldives.html` | IMPROVE | Separate resort/local islands and transfer costs; source discount/weather assertions |
| `blog-budget-planning.html` | IMPROVE | Explain 40/25/20/15 as optional allocation, not market price prediction |
| `blog-caribbean-family.html` | IMPROVE | Official age/childcare/occupancy comparisons instead of generic resort promotion |
| `blog-cheap-eats-japan.html` | IMPROVE | Current yen-first meal examples, dated conversion; retain national meal focus |
| `blog-choose-europe-cities.html` | IMPROVE | Comparable cost basket and sourced entry rules; no unsupported new country hubs |
| `blog-compare-caribbean-islands.html` | IMPROVE | Standardized budget table and distinct island trade-offs |
| `blog-destination-comparison.html` | REPOSITION | Remove content-creator/blog-ideas angle; make traveler decision worksheet |
| `blog-elmo.html` | IMPROVE | Verify official airline/pet fees and country paperwork; preserve brand, substantiate experience claims |
| `blog-free-things-tokyo.html` | IMPROVE | Verify access/reservation rules and free versus paid areas |
| `blog-hidden-destinations.html` | REPOSITION | Research reachable alternatives and real trade-offs instead of broad hidden-gem claims |
| `blog-is-japan-expensive.html` | IMPROVE | Clear affordability verdict; link seven-day calculation rather than duplicating it |
| `blog-japan-cherry-blossom-guide.html` | IMPROVE | Regional forecasts/uncertainty and booking fallback plans |
| `blog-japan-packing-checklist.html` | IMPROVE | Practical season/route checklist with honest review date |
| `blog-japan-transportation-guide.html` | IMPROVE | Official fares, route-specific pass break-even, realistic station routing |
| `blog-japan-travel-budget.html` | IMPROVE | Auditable seven-day cost basket, room-sharing and airfare exclusions |
| `blog-japan-travel-essentials.html` | REPOSITION | First-48-hours checklist; delegate transport, packing and spending detail |
| `blog-japan-travel-mistakes.html` | IMPROVE | Concrete costly mistakes; avoid repeating general tips |
| `blog-maldives-vs-bora-bora.html` | IMPROVE | Comparable lodging/transfer/flight assumptions and sourced totals |
| `blog-santorini-vs-mykonos.html` | IMPROVE | Dated equivalent stay/route choices with ferry constraints |
| `blog-tokyo-food-budget.html` | IMPROVE | Daily menu scenarios in yen and tax/cover-charge assumptions |
| `blog-tokyo-nightlife-budget.html` | IMPROVE | Verify cover charges, late transport and typical venue examples |
| `blog-tokyo-vs-osaka.html` | IMPROVE | Route-specific split and transfer cost/time; remove nested repeated headings |
| `blog.html` | IMPROVE | Stronger Jamaica/Caribbean/Greece cluster grouping and practical next steps |
| `book-now.html` | REPOSITION | Clarify it is a planning workflow hub, not an inventory booking service |
| `caribbean-travel-guide.html` | IMPROVE | Own regional orientation; link researched island choice and Jamaica depth |
| `destination-comparison.html` | IMPROVE | Scope labels, comparable units and useful initial HTML example |
| `index.html` | IMPROVE | Prioritize durable cluster/utility paths; historical event content should not dominate |
| `jamaica-5-day-itinerary.html` | IMPROVE | Test realistic daily transfer/activity timings; distinguish five days/four nights |
| `jamaica-travel-guide.html` | IMPROVE | Correct resort locations and practical geography first |
| `japan-travel-guide.html` | KEEP | Strong hub and specialist link network; maintain sourced accuracy |
| `montego-bay-jamaica.html` | IMPROVE | Airport-zone/resort/transfer distinctions and verified opening/access detail |
| `montego-bay-vs-negril.html` | KEEP | Useful base comparison; maintain comparable trip costs |
| `negril-jamaica.html` | IMPROVE | Neighborhood choice, beach access, transfers and sourced safety notes |
| `privacy.html` | KEEP | Preserve local newsletter-pause work; release wording alongside script after approval |
| `saved-trips.html` | KEEP | Useful local shortlist; do not promote it as full trip persistence |
| `seasonal-recommendations.html` | IMPROVE | Distinguish categorical seasonal shortlist from total-budget discovery |
| `tools.html` | IMPROVE | Accurate promises and sourced single requirements feed; no calculator redesign |
| `tourism-demand-index.html` | IMPROVE | Provenance, score interpretation and static useful summary |
| `travel-map.html` | KEEP | Private tracking utility; no thin acquisition pages generated |
| `trip-planner.html` | KEEP | Preserve noindex; frontend/shared-state design only after separate approval |
| `trip-results.html` | KEEP | Preserve private noindex workflow; service/payment review excluded |
| `world-cup-2026-atlanta.html` | REPOSITION | Archive event assumptions and preserve useful Atlanta transit context |
| `world-cup-2026-travel-budget.html` | REPOSITION | Historical labeled cost baseline, not current event-price advice |
| `world-cup-2026-travel-guide.html` | REPOSITION | Historical hub; retain links and URL, avoid prospective planning claims |
| `world-cup-trip-cost-calculator.html` | REPOSITION | Label historical assumptions; do not change calculation behavior here |

No automatic removal recommendation. Consolidation needs real overlap, query data, retained unique value, an equivalent destination and redirect support.

## Destination cluster assessment

| Cluster | Existing coverage | Missing traveler decisions / next investment |
|---|---|---|
| Jamaica | `jamaica-travel-guide.html`, `negril-jamaica.html`, `montego-bay-jamaica.html`, `montego-bay-vs-negril.html`, `best-time-to-visit-jamaica.html`, `jamaica-5-day-itinerary.html`; Caribbean/family support, TDI and tools | Strong first investment: verified resort geography, arrival/transfer costs, all-inclusive versus independent budgeting, six-night scenarios |
| Caribbean | Regional guide, island comparison, family resorts, hidden destinations; Jamaica depth; seasonal/TDI | Second: comparable island budgets, family constraints and lower-pressure choices with sources |
| Greece / Santorini / Mykonos | `best-time-greece.html`, `blog-santorini-vs-mykonos.html`, legacy noindex timing duplicate; Europe comparison, registry/timing/TDI | Third: source ferry/logistics and accommodation baskets; develop distinct island timing only where it adds detail beyond national guide |
| Japan | National hub and 14 supporting Japan articles covering timing, city comparison, food/nightlife, neighborhoods, transport, packing, mistakes and cost | Most developed cluster; maintain sources, remove redundant headings and differentiate existing intents before adding articles |
| Italy | Mentions in `blog-choose-europe-cities.html`, Rome registry/TDI and requirements | No standalone Italy/Rome guide. Defer expansion |
| Spain | Barcelona in Europe comparison and registry/TDI; requirements | No standalone Spain/Barcelona guide. Defer expansion |
| Portugal | Lisbon/Portugal in Europe comparison, seasonal data, registry/TDI | No standalone Portugal guide or dedicated Portugal-versus-Spain cost page. Research first |
| Thailand / Bali | `blog-bali-vs-thailand.html`; registry, seasonal and TDI | Comparison coverage, no standalone guides. Maintain rather than broad expansion |
| Dominican Republic | `blog-compare-caribbean-islands.html` and regional mentions, registry/TDI | No standalone guide; promising Caribbean extension only after current island comparisons are reliable |

Data coverage is not editorial coverage. Fifty registry entries, 30 TDI destinations and 22 best-time records do not mean 50 destination guides. No standalone Santorini/Mykonos travel guide exists; a proposed new link must not pretend otherwise.

## Tourism Demand Index findings

CONFIRMED: `js/dv-destinations.js` exposes 50 records. `js/tourism-demand-data.js` derives 30 TDI records through `TDI_META`, with a duplicated hardcoded fallback. Only nine TDI records provide a non-null `internalLink`. TDI uses best-month arrays, crowd/budget integer scores, trend strings and annual arrivals. It is not a live tourism feed and has no monthly crowd measurement series or per-claim confidence/review/source fields.

The data comments attribute broadly to 2024 UNWTO/national estimates and editorial composites, updated June 19, 2026. The public explanation (`tourism-demand-index.html:672,690,721`) describes actual in-person density and a baseline adjusted for 2025-26 recovery, inconsistent with an explicitly sourced, reproducible measured statistic. Arrival geographies mix countries, cities and islands. Raw arrival totals cannot be used as a comparable density measure without area, resident population, visitor nights, day visitors and seasonality definitions. Four small destinations are omitted from the world-scale SVG; public copy discloses this. Country aggregation uses the higher score for multi-destination countries, which is a conservative display choice, not a country-wide measurement.

Opportunity: publish a transparent editorial comparison, not a fabricated proprietary measurement. Add `metric`, `unit`, `geographicScope`, `referenceYear`, `sourceUrl`, `publishedAt`, `lastReviewed`, `confidence`, `estimateType`, method/version and limitations. Preserve separate values for observed arrivals and editorial crowd/budget scores. Add reviewer notes at brand level. A confidence label must reflect evidence availability, not invented statistical precision. Baseline scores plus seasonal advice do not support numerical monthly forecasts. Repair Japan's wrong year/value in both registry and fallback, then investigate every numerical arrival claim before using the series for original articles.

After this work, produce a small useful Caribbean comparison showing observed seasonality evidence, lodging occupancy/arrival sources where available, and qualitative beach/resort context. Jamaica timing can connect climate, public arrival seasonality and cost assumptions. Santorini-versus-Mykonos crowd coverage needs comparable island figures; Mykonos is not one of the 30 TDI entries, so do not invent a score. European lower-pressure advice needs comparable city scope and published caveats. Annual scores alone cannot tell readers which beach will be quiet next Tuesday.

## Budget matcher and shared trip implementation status

`data/destination-cost-profiles.json`, `js/trip-state.js`, `js/budget-destination-matcher.js` are absent. No current HTML references these filenames. This audit did not inspect or restore stashes. Budget discovery is a proposed capability, not a functioning product in this checkout. `data/destinations.json` provides 22 seasonal records; registry `dailyCostMid`, budget labels and comparison costs are seed information, not validated total-trip cost profiles.

`seasonal-recommendations.html:352` and `saved-trips.html:128` use `dv_saved_destinations` for a name-based shortlist with guide link/region/tagline. There is no versioned shared full-trip object. Saved cards interpolate stored values into HTML; malformed/non-array storage and untrusted fields deserve validation before richer state. The planner is a distinct noindex frontend, with categorical budget inputs and step logic. No shared-trip hydration is present. Service/payment actions were excluded and not tested.

Future deterministic pipeline: validate origin/currency/group/nights/month/passport assumptions -> filter eligible destinations -> estimate low/mid total with separate lodging/night, food/day, local transit/day, activities and round-trip airfare/person -> rank by budget fit plus season/interests -> show uncertainty and links -> save/compare using versioned trip state. Entry summaries must depend on nationality/residency/travel route, not an unconditional destination passport flag. Do not reinterpret 40/25/20/15 allocations as sourced market estimates.

Suggested profiles need destination ID/scope/currency, per-room occupancy and night rates, per-person daily costs, origin-region route allowances, season modifiers, sample/source dates, inclusions/exclusions, confidence and lastReviewed. Flight allowances are not live quotes. Six nights and seven spending days are different multipliers. Account for all-inclusive meal overlap, solo room supplements, families/child ages and departure origin before claiming trips under $2,000/$3,000.

Suggested shared state: `{schemaVersion, id, createdAt, updatedAt, origin, travelers, dates:{month,nights,days}, budget:{total,currency}, preferences, shortlist:[{destinationId,estimate,estimateVersion}], selectedDestinationId, requirementsContext, itineraryDraft}`. Use a new namespaced key, validate on read, migrate the existing shortlist conservatively, retain a recoverable backup and support storage failures. A future planner adapter may consume safe destination/duration/budget fields; do not put personal emails, payment state or server IDs into public query strings for SEO. No matcher UI or state changes were built.

## Frontend module review and rendering boundaries

| Actual module | Current role | Audit consequence |
|---|---|---|
| `main.js` | Packing, legacy budget controls, drag/drop itinerary and map fallback | Handler/inline compatibility and mobile alternative need verification; some legacy handlers do not map to current IDs |
| `js/best-time.js` | Fetches 22 seasonal JSON records; filters/renders calendars | Initial result requires fetch/JS; preserve error states and useful static summary |
| `js/dv-destinations.js` | Shared 50-record registry, slug/ISO lookup and validation | Good reusable identity layer; sources and some metric units incomplete |
| `js/tourism-demand-data.js` | TDI adapter and duplicated fallback | Source year/definitions drift; validate both paths |
| `js/tourism-demand-index.js` | Filters/sorts and creates 30 cards | Empty initial results; default rendering still logs comparison event |
| `js/dv-map-highlight.js` | Lazy SVG locator with destination links and keyboard focus | Useful context enhancement; guides must remain accessible without map fetch |
| `js/dv-tdi-map.js` | Score-colored SVG, country aggregation | Scope caveat essential; skipped small islands disclosed |
| `js/dv-wc-map.js` | US/Canada/Mexico host-country highlighting | Correct country-level purpose, not actual stadium markers |
| `js/dv-analytics.js` | Shared events and viewport tool_view | Previous page-load start issue fixed; normalize remaining event meanings |
| `js/email-capture.js` | Local uncommitted collection pause | Preserve; live version is still older collection handler |
| `ga-init.js` | Consent default and GA4 configuration | Live account data not verified; separate loaders do not prove duplication |
| `meta-pixel-init.js` | Pixel load and PageView | Not gated by current Google consent updates; separate validation task |
| `cookie-consent.js` | Banner/localStorage choice, Google storage update | Storage read can throw; no preference-reopen path in inspected module |
| `adsense-push.js` | Pushes uninitialized ad slots | Inspected only to locate dependency; no ad changes proposed in this phase |
| Inline code in tools/finder/comparison/map | Core UI and duplicated local datasets | Extract only as needed for shared data/CSP; preserve existing behavior |
| Inline planner/results code | Personal workflow frontend | Metadata/state integration assessed; backend/payment architecture outside scope |

## Internal link recommendations

Static graph is healthy for basic discovery: all 48 indexable pages within two hops, no broken HTML target, no internal anchor to a configured legacy redirect. Japan's repeated related block supplies many links but is not inherently evidence of richer context. Jamaica hub has 49 unique inbound files largely because it is in global navigation/footer. Negril has seven; Greek island comparison six. Add contextual value, not repeated links for counts.

| Source file / placement | Existing target | Descriptive anchor and purpose |
|---|---|---|
| `negril-jamaica.html`, budget/base decision | `blog-compare-caribbean-islands.html` | Compare Jamaica with other Caribbean islands; regional choice beyond one town |
| `montego-bay-vs-negril.html`, before choosing Jamaica | `caribbean-travel-guide.html` | Plan a Caribbean vacation by island and travel style |
| `caribbean-travel-guide.html`, crowd trade-off | `tourism-demand-index.html` | Compare editorial Caribbean crowd and budget pressure; only after methodology repair |
| `best-time-to-visit-jamaica.html`, timing trade-offs | `tourism-demand-index.html` | Jamaica crowd context and comparison; avoid implying measured monthly scores |
| `blog-santorini-vs-mykonos.html`, choosing dates | `best-time-greece.html` | Greece's month-by-month travel seasons; existing link can be strengthened rather than duplicated |
| `best-time-greece.html`, island choice | `blog-santorini-vs-mykonos.html` | Choose Santorini or Mykonos by beach, views and budget; existing link is useful |
| `best-time.html`, explanatory static example | `tourism-demand-index.html` | Compare seasonal fit with crowd-pressure context |
| `tourism-demand-index.html`, Caribbean card CTAs | `caribbean-travel-guide.html` / `blog-compare-caribbean-islands.html` | Island planning resources for records without dedicated guides; do not invent destination pages |
| `blog-compare-caribbean-islands.html`, budget assumptions | `tools.html#tool-budget` | Allocate your Caribbean vacation budget; explain allocation limits |
| Future budget resource, only when implemented | `book-now.html` / `tools.html#tool-itinerary` | Continue planning a shortlisted trip; shared-state carryover must exist before promising it |

Audit current anchors before adding: several directions are already linked. Static generated-link coverage is not exhaustive; resolve every new target and fragment. Fix `best-time-greece.html`'s existing `#faq` target. Do not direct travelers to absent country guides or absent matcher modules.
