'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { test } = require('node:test');
const sourceRoot = path.join(__dirname, '..');
const root = process.env.DV_TEST_ROOT || sourceRoot;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = ['blog-japan-transportation-guide.html', 'blog-japan-travel-budget.html',
  'blog-japan-travel-mistakes.html', 'japan-travel-guide.html',
  'blog-best-time-japan.html', 'blog-tokyo-vs-osaka.html'];
const digest = value => createHash('sha256').update(value).digest('hex');
// Public release-source expectations only; no internal reports or Git history needed at runtime.
// Hashes preserve the original normalized markup/schema/file comparisons; claims retain public HTML text.
const baseline = {
  release: "f818d44341fdfd794ff16137608b132bd84d3238",
  pages: {
    "blog-japan-transportation-guide.html": {
      "markup": "3d809547243b669a5e122602a2c98062eae4c8f6218c321bfc3d839d2f90452a",
      "schema": "8bb4ddb1a54feff088f670885ed4e367c4ff2a64d7d9b5b27e2593fe45a2f9f3",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/blog-japan-transportation-guide.html",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "japan-travel-guide.html",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "about.html#affiliate",
        "blog-best-time-japan.html",
        "blog-tokyo-vs-osaka.html",
        "blog-japan-travel-budget.html",
        "blog-japan-travel-mistakes.html",
        "blog-japan-packing-checklist.html",
        "blog-best-areas-tokyo.html",
        "blog-free-things-tokyo.html",
        "blog-tokyo-food-budget.html",
        "blog-cheap-eats-japan.html",
        "blog-japan-cherry-blossom-guide.html",
        "blog-japan-travel-essentials.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-is-japan-expensive.html",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "destination-comparison.html"
      ]
    },
    "blog-japan-travel-budget.html": {
      "markup": "42c7b5ec36863c34a28ffd394595c7b31f560330fc7d62b94ec9ccde746fad0e",
      "schema": "7290727b2192a6aa363e771a8a92f0e781eea768be3598df044d197fa96ad4b7",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/blog-japan-travel-budget.html",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "japan-travel-guide.html",
        "about.html#affiliate",
        "blog-best-time-japan.html",
        "blog-tokyo-vs-osaka.html",
        "blog-japan-travel-mistakes.html",
        "blog-japan-packing-checklist.html",
        "blog-japan-transportation-guide.html",
        "blog-best-areas-tokyo.html",
        "blog-free-things-tokyo.html",
        "blog-tokyo-food-budget.html",
        "blog-cheap-eats-japan.html",
        "blog-japan-cherry-blossom-guide.html",
        "blog-japan-travel-essentials.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-is-japan-expensive.html",
        "blog-bali-vs-thailand.html",
        "blog-budget-planning.html",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "destination-comparison.html"
      ]
    },
    "blog-japan-travel-mistakes.html": {
      "markup": "f16cc13d9dda0e01715227d5846158fe3e98f2b80bb1b5ac87ce06541b0dfa54",
      "schema": "13f46c59a613ff8116f659df6ae0c674bc1d0e03c9062401e8fdfbc316fee22f",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/blog-japan-travel-mistakes.html",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "japan-travel-guide.html",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "about.html#affiliate",
        "blog-best-time-japan.html",
        "blog-tokyo-vs-osaka.html",
        "blog-japan-travel-budget.html",
        "blog-japan-packing-checklist.html",
        "blog-japan-transportation-guide.html",
        "blog-best-areas-tokyo.html",
        "blog-free-things-tokyo.html",
        "blog-tokyo-food-budget.html",
        "blog-cheap-eats-japan.html",
        "blog-japan-cherry-blossom-guide.html",
        "blog-japan-travel-essentials.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-is-japan-expensive.html",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "destination-comparison.html"
      ]
    },
    "japan-travel-guide.html": {
      "markup": "8e0c1a2a3e1224cf74bf8f974de3f88cd4de407f01bc3f3427d328b68264e004",
      "schema": "34d558e728feb77a78e2c522ae5e6d37e65e3a4e14e305dca87d89dd881359c8",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/japan-travel-guide.html",
        "dv-article.css",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "about.html#affiliate",
        "blog-japan-travel-budget.html",
        "blog-bali-vs-thailand.html",
        "tourism-demand-index.html",
        "blog-best-time-japan.html",
        "blog-is-japan-expensive.html",
        "blog-tokyo-vs-osaka.html",
        "blog-best-areas-tokyo.html",
        "blog-japan-transportation-guide.html",
        "blog-cheap-eats-japan.html",
        "blog-tokyo-food-budget.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-free-things-tokyo.html",
        "blog-japan-packing-checklist.html",
        "blog-japan-travel-essentials.html",
        "blog-japan-travel-mistakes.html",
        "tools.html#tool-requirements",
        "blog-japan-cherry-blossom-guide.html",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "destination-comparison.html"
      ]
    },
    "blog-best-time-japan.html": {
      "markup": "d9be12ed791e3b98fdcaef3fb596f943ef0783acd666e2ccf28fd20b96312705",
      "schema": "1b4cbf84b994f964396272153d561625bd9acf4da69fb3163300025cf0ddf6de",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/blog-best-time-japan.html",
        "dv-article.css",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "/about.html#affiliate",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "https://dreamvacati.com/blog-bali-vs-thailand.html",
        "https://dreamvacati.com/blog-budget-planning.html",
        "https://dreamvacati.com/tools.html",
        "tools.html#tool-requirements",
        "japan-travel-guide.html",
        "blog-tokyo-vs-osaka.html",
        "blog-japan-travel-budget.html",
        "blog-japan-travel-mistakes.html",
        "blog-japan-packing-checklist.html",
        "blog-japan-transportation-guide.html",
        "blog-best-areas-tokyo.html",
        "blog-free-things-tokyo.html",
        "blog-tokyo-food-budget.html",
        "blog-cheap-eats-japan.html",
        "blog-japan-cherry-blossom-guide.html",
        "blog-japan-travel-essentials.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-is-japan-expensive.html",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "about.html#affiliate",
        "destination-comparison.html"
      ]
    },
    "blog-tokyo-vs-osaka.html": {
      "markup": "499ff4ea0dc1ff49643c4ca35c7ff74de7a9462339300ef873e1d4f0d4cf82dc",
      "schema": "707f35be9b2cd2e49c1f906fbe3e30b65ba24663512e2377b2870c907bd6c067",
      "links": [
        "/favicon.svg",
        "https://dreamvacati.com/blog-tokyo-vs-osaka.html",
        "footer-global.css",
        "/",
        "blog.html",
        "seasonal-recommendations.html",
        "tools.html",
        "best-time.html",
        "book-now.html",
        "japan-travel-guide.html",
        "blog-japan-travel-budget.html",
        "blog-japan-transportation-guide.html",
        "destination-comparison.html?a=japan&b=thailand",
        "travel-map.html",
        "about.html#affiliate",
        "blog-best-time-japan.html",
        "blog-japan-travel-mistakes.html",
        "blog-japan-packing-checklist.html",
        "blog-best-areas-tokyo.html",
        "blog-free-things-tokyo.html",
        "blog-tokyo-food-budget.html",
        "blog-cheap-eats-japan.html",
        "blog-japan-cherry-blossom-guide.html",
        "blog-japan-travel-essentials.html",
        "blog-tokyo-nightlife-budget.html",
        "blog-is-japan-expensive.html",
        "tools.html#tool-requirements",
        "/privacy.html",
        "jamaica-travel-guide.html",
        "about.html",
        "privacy.html",
        "destination-comparison.html"
      ]
    }
  },
  files: {
    "sitemap.xml": "7b2e60368ff21c5c071700480297f39e77302e4a5f9608c269f8f966e8b83b44",
    "robots.txt": "cc010a032cf1b1357d9e20c674043576c5937b623e8d29b8284b27be2642e573",
    "_headers": "536ca62e166796ae96f7a2f56637a810ef0e14afd9c3ac1c5e2bcdb62e667e25",
    "_redirects": "c7f27759048b15c47a3410df56749f5ac81c042a197b8ce611f92f98601e6642",
    "js/email-capture.js": "346dbf3ea2f922950eaa0ff2b902c0eba53ab8a380d21954f5ab7ee5c587681b",
    "trip-planner.html": "e747840a4169d1440cd4ca0d2f7d625d618ea1be6362e0417d3f766f84770b1a",
    "trip-results.html": "18f3ffa0df3051d10d7110f837063c5010484f9786719a3ee2469603309ab14b"
  },
  // [claim ID, page index, surface, disposition, original public text]
  claims: [
    ["R002",0,"P","RETAIN","The single most important transportation decision for Japan visitors is getting a Suica or PASMO IC card immediately at the airport. These rechargeable cards work on:"],
    ["R003",0,"LI","CORRECT","All subway lines in Tokyo (JR, Tokyo Metro, Toei)"],
    ["R004",0,"LI","QUALIFY","Most trains and subways nationwide"],
    ["R005",0,"P","QUALIFY","You tap in and tap out at fare gates — the correct fare is deducted automatically. No need to figure out ticket prices in advance. Load ¥3,000–5,000 ($20–33) initially and top up at any station machine or convenience store."],
    ["R006",0,"P","CORRECT","Suica vs PASMO: They're essentially identical in function. Suica is issued by JR East; PASMO by the Tokyo metro system. Either works everywhere. Get whichever is available at your arrival gate."],
    ["R007",0,"P","QUALIFY","The Japan Rail Pass gives unlimited travel on most JR lines including Shinkansen for a set period. Prices in 2026:"],
    ["R008",0,"TABLE","CORRECT","Pass TypeCost (per person)Best For 7-day JR Pass~$300Tokyo–Osaka route with 1–2 day trips 14-day JR Pass~$480Full Golden Route + Hiroshima or Kanazawa 21-day JR Pass~$610Extensive multi-region travel"],
    ["R009",0,"P","CORRECT","When the JR Pass pays off: If you do Tokyo–Kyoto–Osaka–Hiroshima (round trip from Tokyo), the Shinkansen fares alone exceed the 7-day pass cost. Add day trips and regional travel and it easily pays back."],
    ["R010",0,"P","RETAIN","When the JR Pass does NOT pay off: Tokyo-only stays. Local exploration within a single city (use IC card). Short trips with limited inter-city travel."],
    ["R011",0,"LI","QUALIFY","Narita Express (N'EX): 53 minutes to Tokyo Station, 90 minutes to Shinjuku. ~¥3,000 ($20). Fast and comfortable."],
    ["R012",0,"LI","UNRESOLVED","Keisei Skyliner: 36 minutes to Ueno. ~¥2,570 ($17). Fastest budget option for central Tokyo."],
    ["R013",0,"LI","UNRESOLVED","Tokyo Monorail: 13–18 minutes to Hamamatsucho. ¥500 ($3.30). Very convenient."],
    ["R014",0,"LI","UNRESOLVED","Keikyu Line: 11–35 minutes to various central stations. ¥300–700 ($2–4.70). Most flexible option."],
    ["R016",0,"LI","CORRECT","Tokyo to Osaka (Nozomi): 2 hours 30 minutes, ~¥14,000 ($93) one-way"],
    ["R017",0,"LI","CORRECT","Tokyo to Kyoto (Nozomi): 2 hours 15 minutes, ~¥13,600 ($91) one-way"],
    ["R018",0,"LI","CORRECT","Tokyo to Hiroshima (Nozomi): 3 hours 45 minutes, ~¥19,000 ($127) one-way"],
    ["R019",0,"P","CORRECT","Note: The fast Nozomi and Mizuho services are NOT covered by the JR Pass — use the Hikari or Sakura instead, which take about 30 minutes longer but are fully covered."],
    ["R020",0,"P","CORRECT","Tokyo has 13 subway lines operated by two companies (Tokyo Metro and Toei) plus JR lines including the busy Yamanote Loop. This sounds complex but in practice you just tap your IC card and follow signs. Google Maps and the Hyperdia app give step-by-step directions for any journey."],
    ["R022",0,"LI","RETAIN","Get your Suica IC card at the airport on arrival — it's the most important transportation item for any Japan trip."],
    ["R023",0,"LI","RETAIN","Calculate JR Pass value based on your actual itinerary before buying — it's not automatically worth it for short trips."],
    ["R024",0,"LI","UNRESOLVED","Use Google Maps for real-time transit directions — it works excellently in Japan and handles all rail operators correctly."],
    ["R025",0,"LI","RETAIN","Keep ¥1,000–2,000 in your IC card at all times and top up at station machines before running low."],
    ["R026",0,"LI","CORRECT","The Nozomi Shinkansen is fastest but NOT covered by the JR Pass — use Hikari for pass travel."],
    ["R027",0,"LI","UNRESOLVED","Luggage forwarding services (takuhaibin, ~$12–18 per bag) let you send bags to your next hotel so you travel hands-free on Shinkansen days."],
    ["R028",0,"DIV","CORRECT","A Suica (or PASMO) is a rechargeable IC card that works on virtually all trains, subways, and buses across Japan, plus convenience stores and vending machines. Get one at Narita or Haneda airport immediately — it's the single most useful transportation item for any Japan trip."],
    ["R029",0,"DIV","CORRECT","Only if you're traveling between multiple cities by Shinkansen. The 7-day pass ($300/person) pays off on a full Tokyo–Kyoto–Osaka route with day trips. It does not pay off for Tokyo-only trips. Calculate your specific route before purchasing."],
    ["R030",0,"DIV","CORRECT","Fastest: Narita Express (N'EX) to Tokyo Station — 53 minutes, ~$20. Cheaper: Keisei Skyliner to Ueno — 36 minutes, ~$17. Both are comfortable and reliable. Avoid taxis for this route — they cost $150-200+."],
    ["R031",0,"DIV","RETAIN","Yes — stations have clear English signage, Google Maps works excellently for directions, and the IC card handles fares automatically. The system looks complex on a map but is intuitive in practice. Most first-time visitors find it much easier than expected after the first few rides."],
    ["R032",0,"JSON-LD","CORRECT","A Suica (or PASMO) is a rechargeable IC card that works on virtually all trains, subways, and buses across Japan. It also works at convenience stores and vending machines. Get one at Narita or Haneda airport immediately on arrival — it eliminates the need to buy individual tickets and is essential for navigating Tokyo efficiently."],
    ["R033",0,"JSON-LD","CORRECT","The JR Pass is worth buying if you're traveling between multiple cities on the Shinkansen (bullet train). The 7-day pass costs $300/person and covers Tokyo-Osaka and similar inter-city routes. It is NOT worth it for Tokyo-only trips. Calculate your specific route before buying."],
    ["R034",0,"JSON-LD","CORRECT","The fastest option is the Narita Express (N'EX) to Tokyo, Shinjuku, or Shibuya stations — takes 53 minutes to Tokyo station. Cost is about ¥3,000 ($20) one-way. Cheaper alternative: Keisei Skyliner to Ueno station (36 minutes, ¥2,570/$17). Budget option: Airport Limousine Bus (90+ minutes, ¥3,200, drops at major hotels). Taxis are expensive ($150-200+)."],
    ["R106",0,"LI","CORRECT","Buses throughout Japan"],
    ["R107",0,"LI","QUALIFY","Osaka to Kyoto (local or Hikari): 15–30 minutes, ¥560–3,000 ($3.70–20)"],
    ["R035",1,"P","CORRECT","Japan has a reputation for being expensive that doesn't match reality for most travelers in 2026. Yes, peak-season accommodation in Kyoto can be stunning, and the JR Pass is a real upfront cost. But everyday spending in Japan — convenience store meals, local ramen shops, subway fares — is extremely reasonable. The total trip cost depends heavily on when you go, where you stay, and how you eat."],
    ["R036",1,"P","CORRECT","The 7-day JR Pass costs $300 per person and covers unlimited travel on most JR Shinkansen and local lines. It pays off on a Tokyo–Kyoto–Osaka route with a day trip or two. It does NOT pay off for Tokyo-only trips. Calculate your specific route before buying: Tokyo–Osaka Shinkansen one-way is ~$95, so a round trip is $190. Add regional travel and the pass earns back its cost quickly on a multi-city itinerary."],
    ["R037",1,"TABLE","CORRECT","Expense Budget Mid-Range Splurge Accommodation (7 nights) $175–350 $490–840 $1,050–2,100+ JR Pass (7-day) $300 (if needed) $300 $300 In-city transport $40–70 $60–100 $80–150 Food (7 days) $140–210 $280–420 $560–1,400+ Activities & entrance fees $50–100 $100–200 $200–500+ Pocket WiFi / SIM $30–50 $30–50 $30–50 7-Day Total (ex-flights) $735–1,080 $1,260–1,910 $2,220–4,500+"],
    ["R038",1,"LI","UNRESOLVED","Public transit: IC card (Suica/PASMO) fares are metered and very reasonable — most in-city trips cost under $2."],
    ["R040",1,"LI","CORRECT","The 7-day JR Pass ($300) pays off if you do Tokyo–Kyoto–Osaka plus one or two regional day trips."],
    ["R041",1,"LI","QUALIFY","Buy your Suica IC card at the airport immediately — use it for trains, buses, and convenience store purchases."],
    ["R042",1,"DIV","QUALIFY","A 7-day Japan trip costs approximately $1,800–3,500 per person all-in (including flights from the US). Budget travelers spending carefully can manage $1,500–2,000 total. Mid-range is $2,500–3,500. Costs vary significantly by season, accommodation type, and whether you buy the JR Pass."],
    ["R043",1,"DIV","CORRECT","The 7-day JR Pass costs $300 per person and covers unlimited JR Shinkansen and local train travel. It pays off if you travel Tokyo–Kyoto–Osaka with a day trip. It does not pay off for Tokyo-only trips. Calculate your specific route before buying."],
    ["R044",1,"JSON-LD","CORRECT","The 7-day JR Pass costs $300 per person. It's worth it if you travel the Tokyo-Kyoto-Osaka route plus a day trip or two. It's not worth it for Tokyo-only trips. Calculate your specific route: two Tokyo-Osaka Shinkansen round trips (~$190) plus regional trains easily exceed $300 with a full Golden Route itinerary."],
    ["R108",1,"JSON-LD","CORRECT","A 7-day Japan trip for one person costs approximately $1,800–$3,500 excluding flights, depending on travel style. Budget travelers spending carefully can manage $1,500–2,000. Mid-range travelers should budget $2,500–3,500. Add round-trip flights from the US ($700–1,800 per person depending on season and booking timing)."],
    ["R109",1,"P","CORRECT","Add round-trip flights ($700–1,800 per person) to get your all-in trip cost. A realistic 7-day Japan trip for one person runs $1,800–3,500 total, depending on season and travel style. Costs vary significantly — these are planning ranges."],
    ["R112",1,"P","CORRECT","If Japan's all-in costs are beyond your current travel budget, Southeast Asia offers compelling alternatives. Our Bali vs. Thailand guide compares two of the region's most popular destinations at significantly lower price points — typical 7-day trips run $800–$1,600 per person versus Japan's $1,800–$3,500."],
    ["R047",2,"P","RETAIN","Japan is easy to travel in, which makes over-scheduling tempting. A common first-time itinerary tries to hit Tokyo, Hakone, Kyoto, Osaka, Nara, Hiroshima, and Kanazawa in 10 days. The result is exhausting and memorable for the wrong reasons. Japan rewards depth over breadth. Spend 3–4 nights in one city rather than 1–2 nights in six. Save Hiroshima and Kanazawa for a second trip."],
    ["R048",2,"P","CORRECT","The JR Pass is worth buying for multi-city itineraries (Tokyo–Kyoto–Osaka–Hiroshima). It is NOT worth it for Tokyo-only trips. The 7-day pass costs $300 per person. Calculate your specific route before purchasing: two Tokyo–Osaka Shinkansen round trips cost about $190 total, but adding regional trains and day trips can easily exceed $300."],
    ["R049",2,"P","QUALIFY","IC cards are rechargeable prepaid cards that work on virtually all trains, subways, and buses in Tokyo, Osaka, and most other cities. They also work at convenience stores and vending machines. Get one immediately at Narita or Haneda airport — it eliminates the need to buy individual tickets and saves significant time and confusion at fare gates."],
    ["R051",2,"P","UNRESOLVED","Japanese taxis are metered and significantly expensive. A 10-minute ride in central Tokyo costs ¥1,000–1,500 ($6.70–10). Any journey a train covers should be done by train — it's cheaper and usually faster given Tokyo's density of stations. The IC card (Suica/PASMO) makes boarding instantaneous. Taxis are appropriate after midnight when trains stop running, for groups of 3–4 splitting the cost, or when you have heavy luggage between a train station and a specific hotel. For all other situations, the train is faster, cheaper, and more reliable."],
    ["R052",2,"LI","QUALIFY","Get your Suica IC card at Narita or Haneda immediately — it works on almost all transit and stores."],
    ["R055",3,"P","QUALIFY","For most first-timers, the answer is both — they're 2.5 hours apart by Shinkansen. The deeper question is where to spend more time. Our Tokyo vs. Osaka comparison covers this thoroughly. The quick version:"],
    ["R057",3,"P","RETAIN","Most first Japan trips follow Tokyo → Kyoto → Osaka. Two weeks gives you 3–4 nights in each plus day trips."],
    ["R059",3,"LI","CORRECT","IC Card (Suica or Pasmo): Buy one at the airport immediately. A rechargeable card that works on all trains, subways, and buses in Tokyo, and at most convenience stores and vending machines. Tap in, tap out — no individual tickets to buy."],
    ["R060",3,"LI","CORRECT","JR Pass: $300/person for 7 days, $480 for 14 days. Worth it if you're doing Tokyo–Kyoto–Osaka plus day trips to Hiroshima or Nikko. Not worth it for Tokyo-only trips. Calculate your specific route before purchasing."],
    ["R061",3,"LI","CORRECT","Shinkansen: Japan's bullet train connects all major cities. Tokyo to Osaka takes about 2.5 hours. The reserved seat experience is immaculate — one of the genuine travel highlights of any Japan trip."],
    ["R062",3,"LI","CORRECT","Airport transfers: Narita Express from Narita Airport to Tokyo Station: about $35 each way, 60 minutes. From Haneda Airport, trains take 25–40 minutes into central Tokyo."],
    ["R065",3,"LI","RETAIN","IC card (Suica): Get this at the airport before you exit the arrivals hall."],
    ["R066",3,"LI","CORRECT","Buying a JR Pass you don't need: Calculate your actual route before purchasing. Tokyo-only trips never recoup a $300 pass."],
    ["R068",3,"LI","QUALIFY","Decide on JR Pass (yes/no) based on your specific route — buy before departure or on arrival"],
    ["R072",3,"DIV","CORRECT","Only if you're traveling between multiple cities. The 7-day JR Pass costs $300 per person and pays off on a Tokyo–Kyoto–Osaka Golden Route itinerary. For Tokyo-only trips, an IC card (Suica or Pasmo) is cheaper. Two Tokyo–Osaka Shinkansen round trips ($190) is roughly the break-even point for the 7-day pass — calculate your specific route before buying."],
    ["R076",3,"JSON-LD","CORRECT","Only if you're traveling between multiple cities. The 7-day JR Pass costs $300 per person and pays off on a Tokyo–Kyoto–Osaka Golden Route itinerary. For Tokyo-only trips, an IC card (Suica or Pasmo) is cheaper. Calculate your specific route: two Tokyo–Osaka Shinkansen round trips ($190) is roughly the break-even point for the 7-day pass."],
    ["R110",3,"TABLE","QUALIFY","Travel Style Daily Budget (ex-flights) 7-Day Total (ex-flights) All-In with Flights Budget $75–110/day $525–770 $1,225–2,570 Mid-Range $150–230/day $1,050–1,610 $1,750–3,410 Comfortable $280–400/day $1,960–2,800 $2,660–4,600"],
    ["R111",3,"P","QUALIFY","Below are realistic per-person budgets for a 7-day Japan trip, excluding international flights. Add $700–1,800 per person for round-trip flights from the US depending on origin city and season. Our dedicated guides on the 7-day Japan cost breakdown and whether Japan is actually expensive go deeper on every line item."],
    ["R081",4,"P","CORRECT","Japan's reputation as \"expensive\" is outdated for most travelers. The yen has been weak against the dollar since 2022, and everyday costs (convenience store meals, local ramen, train travel) are remarkably affordable. What pushes costs up are accommodation in peak season and the Japan Rail Pass. Here's a realistic breakdown using the 40/25/20/15 budget framework:"],
    ["R082",4,"TABLE","CORRECT","Expense Peak (Apr/Nov) Shoulder (May/Oct) Off-Peak (Jan-Feb) Flights (from US, 2 pax) $2,000-3,500 $1,400-2,500 $1,000-1,800 Hotel (per night, mid-range) $150-350 $100-220 $80-170 JR Pass (14-day, per person) $480 $480 $480 Food (per day, 2 pax) $60-120 $50-100 $40-90 Activities & entrance fees $30-80/day $25-60/day $20-50/day 14-night total (2 pax) $7,000-14,000 $5,000-10,000 $3,800-7,500"],
    ["R083",4,"P","CORRECT","Note: The JR Pass is only worth buying if you're traveling between cities (Tokyo-Kyoto-Hiroshima-Osaka route). For Tokyo-only trips, an IC card (Suica) is cheaper. Use the trip planning tools to calculate whether the pass pays off for your specific itinerary."],
    ["R085",4,"P","CORRECT","The JR Pass (7-day: $300/person, 14-day: $480/person, 21-day: $610/person) gives unlimited travel on most JR shinkansen and local trains. It's worth it if you're traveling the Golden Route (Tokyo — Kyoto — Osaka — Hiroshima) or going further to Hiroshima, Kanazawa, or Kyushu."],
    ["R086",4,"P","CORRECT","It's NOT worth it for Tokyo-only trips or if your shinkansen rides are limited. A single Tokyo-Kyoto shinkansen ticket costs about $100 each way — two round trips equal the 7-day pass cost. Calculate your specific route before buying."],
    ["R088",4,"P","CORRECT","IC card (Suica or Pasmo). These rechargeable cards work on all trains, subways, and buses in Tokyo — and now at most convenience stores and vending machines. Get one immediately at the airport."],
    ["R094",5,"P","QUALIFY","The two cities are 2.5 hours apart by Shinkansen. On a 10-14 day Japan trip, visiting both is easy. On a 7-day trip, you'll need to prioritize."],
    ["R095",5,"P","QUALIFY","Tokyo's train and subway network is the world's most extensive. Once you understand the IC card (Suica or PASMO) system, getting around is intuitive and inexpensive. The efficiency of Tokyo's transit is itself part of the experience for many first-time visitors."],
    ["R097",5,"P","CORRECT","Tokyo 4 nights → Overnight Shinkansen or early train → Osaka 2 nights (use as base for Kyoto and Nara day trips). Tight but achievable. Skip the JR Pass calculation — two Tokyo-Osaka Shinkansen tickets (about ¥28,000 total for two people) may cost less than a 7-day pass depending on your in-city transport plans."],
    ["R098",5,"P","CORRECT","Tokyo 4 nights → Kyoto 2 nights → Osaka 3 nights. This is the classic Golden Route and works well for most first-time visitors. Use Osaka as your base for Nara and Kobe day trips. The JR Pass typically pays off on this route."],
    ["R099",5,"LI","CORRECT","Use Osaka as your Kansai base — Kyoto is 15 minutes by Shinkansen or 75 minutes by local train, both cheap."],
    ["R100",5,"LI","QUALIFY","Get a Suica or PASMO IC card at Tokyo station — works in Tokyo and Osaka for trains, buses, and convenience stores."],
    ["R101",5,"DIV","CORRECT","Tokyo to Osaka is about 2.5 hours on the Nozomi Shinkansen service. The fare is roughly ¥14,000 ($95) per person each way. The JR Pass covers this route if you have one — calculate whether it saves you money based on your full itinerary."],
    ["R102",5,"DIV","CORRECT","Staying in Osaka and day-tripping to Kyoto is cheaper and often more practical. Kyoto accommodation during peak season is extremely expensive. Osaka has more nightlife and food options. The Shin-Osaka to Kyoto Shinkansen is 15 minutes; the local train (Hankyu or JR) is about 75 minutes and costs under $5."],
    ["R105",5,"JSON-LD","CORRECT","Tokyo to Osaka is 2.5 hours by Shinkansen (bullet train) on the Nozomi service. The distance is about 510 km. The JR Pass covers this route — check whether the pass pays off based on your full itinerary."]
  ]
};

const normalize = value => value.replace(/\r\n/g, '\n');
const text = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<').replace(/\s+/g, ' ').trim();
const schemas = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const answers = html => schemas(html).filter(s => s['@type'] === 'FAQPage').flatMap(s => s.mainEntity);
const tables = html => [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)].map(m => m[0]);
const rows = table => [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
  .map(m => [...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => text(c[1])));
const ranges = value => {
  const match = value.replace(/,/g, '').match(/\$(\d+)[\u2013-](\d+)/);
  assert.ok(match, value); return [+match[1], +match[2]];
};
const sum = values => values.reduce((total, pair) => total.map((n, i) => n + pair[i]), [0, 0]);

for (const file of files) {
  test(`${file}: metadata, executable scripts, styles, ads, navigation and schema structure are preserved`, () => {
    const html = read(file), expected = baseline.pages[file];
    const protectedMarkup = source => [...source.matchAll(/<meta\b[^>]*>|<title>[\s\S]*?<\/title>|<link\b[^>]*>|<style\b[^>]*>[\s\S]*?<\/style>|<script\b[^>]*>[\s\S]*?<\/script>|<ins\b[^>]*>[\s\S]*?<\/ins>/g)]
      .map(m => normalize(m[0])).filter(s => !s.includes('application/ld+json'));
    assert.equal(digest(JSON.stringify(protectedMarkup(html))), expected.markup, `${file}: protected markup changed`);
    const stripAnswer = source => JSON.parse(JSON.stringify(schemas(source)), (key, value) => key === 'text' ? undefined : value);
    assert.equal(digest(JSON.stringify(stripAnswer(html))), expected.schema, `${file}: schema structure changed`);
    const links = source => [...source.matchAll(/\bhref="([^"]+)"/g)].map(m => m[1]);
    for (const href of expected.links) assert.ok(links(html).includes(href), `lost link: ${href}`);
    for (const href of links(html).filter(h => !expected.links.includes(h))) {
      const url = new URL(href, `https://dreamvacati.com/${file}`);
      if (url.hostname !== 'dreamvacati.com') continue;
      const target = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
      assert.ok(fs.existsSync(path.join(root, target)), href);
      if (url.hash) assert.ok(read(target).includes(`id="${url.hash.slice(1)}"`), href);
    }
    assert.match(html, /data-dv-newsletter-paused/);
    assert.doesNotMatch(html, /data-dv-signup|name="(?:EMAIL|dv_hp)"/);
  });

  test(`${file}: obsolete pass promises and unsupported transport precision are absent`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /(?:JR Pass|Japan Rail Pass|7-day pass)[^<\n]{0,100}\$(?:300|480|610)\b/i);
    assert.doesNotMatch(html, /two[^.\n]{0,65}round trips[^.\n]{0,65}\$190/i);
    assert.doesNotMatch(html, /JR Pass typically pays off|Overnight Shinkansen or early train|handles all rail operators correctly/);
    assert.doesNotMatch(html, /(?:works on|work on) (?:all|virtually all) trains|Either works everywhere/);
    assert.doesNotMatch(html, /NOT covered by the JR Pass/);
    const forbiddenNew = /Claude|Anthropic|OpenAI|ChatGPT|Co-Authored|AI-generated|Mailchimp|Resend|"@type"\s*:\s*"Person"|founder/i;
    assert.doesNotMatch(html, forbiddenNew);
  });
}

test('all 78 inventory blocks are accounted for: 69 changed, nine deliberately retained', () => {
  const dispositions = { CORRECT: 0, QUALIFY: 0, UNRESOLVED: 0, RETAIN: 0 };
  assert.equal(baseline.claims.length, 78);
  assert.equal(new Set(baseline.claims.map(claim => claim[0])).size, 78);
  for (const [id, page, surface, disposition, original] of baseline.claims) {
    const html = read(files[page]);
    const current = surface === 'JSON-LD' ? answers(html).map(a => a.acceptedAnswer.text).join(' ') : text(html);
    if (disposition === 'RETAIN') assert.ok(current.includes(original), id);
    else assert.ok(!current.includes(original), `${id} still unchanged`);
    dispositions[disposition]++;
  }
  assert.deepEqual(dispositions, { CORRECT: 46, QUALIFY: 16, UNRESOLVED: 7, RETAIN: 9 });
});

test('adult Ordinary tariff table distinguishes purchase channels, review date and changing prices', () => {
  const html = read(files[0]), tariff = rows(tables(html)[0]);
  assert.deepEqual(tariff.slice(1), [['7 days','50,000','53,000'],['14 days','80,000','84,000'],['21 days','100,000','105,000']]);
  assert.match(tariff[0][1], /Official online, adult Ordinary \(JPY\/person\)/);
  assert.match(tariff[0][2], /Overseas JR-designated agency/);
  assert.match(html, /checked October 26, 2026/);
  assert.match(html, /online prices may change/);
  assert.match(html, /https:\/\/japanrailpass.net\/en\/purchase\/price\//);
});

test('reference fares remain dated and Nozomi/Mizuho require preboarding additional tickets', () => {
  const html = read(files[0]);
  for (const amount of ['14,520','13,970','19,560']) assert.match(html, new RegExp(`JPY ${amount} per adult, one-way reference`));
  assert.match(html, /table dated April 1, 2025/);
  assert.match(html, /not live travel-date quotes/);
  assert.match(html, /section- and class-specific additional ticket before boarding/);
  assert.match(read(files[5]), /additional pass-holder ticket purchased before boarding/);
});

test('dated reference scenarios and same-service Nozomi comparisons reconcile', () => {
  const a = 13650 + 2670, b = a + 14200, c = 4 * 14200, d = 2 * 18710 + 2 * 10890;
  assert.deepEqual([a,b,c,d], [16320,30520,56800,59200]);
  for (const pass of [50000,53000]) { assert.ok(a < pass && b < pass && c > pass && d > pass); }
  assert.equal(4 * 14520, 58080);
  assert.deepEqual([50000,53000].map(p => p + 4 * 4960), [69840,72840]);
  assert.equal(4 * 95, 380); assert.equal(4 * 100, 400);
  assert.match(read(files[5]), /two individual one-way tickets with two adult passes, not with one pass/);
});

test('seven-day, six-night solo model sums actual component rows with optional rail separate', () => {
  const html = read(files[1]), data = rows(tables(html)[0]);
  assert.match(html, /One adult, seven calendar days, six hotel nights with solo room allocation, and seven daily spending allowances/);
  assert.equal(data.length, 8);
  for (let column = 1; column <= 3; column++) {
    assert.deepEqual(sum(data.slice(1,6).map(row => ranges(row[column]))), ranges(data[6][column]));
  }
  assert.deepEqual(data[6].slice(1), ['$410-730','$890-1,490','$1,770-3,900+']);
  assert.match(data[7][1], /tickets OR applicable pass plus extras/);
  assert.match(html, /retained planning allowances, not current hotel or operator quotes/);
  assert.match(html, /stored-value top-up prepays fares/);
  assert.doesNotMatch(tables(html)[0], /JR Pass \(7-day\)|\$300/);
});

test('fourteen-night two-adult shared-room model sums with fourteen daily party allowances', () => {
  const html = read(files[4]);
  const data = rows(tables(html).find(table => table.includes('Subtotal including flight allowance')));
  assert.match(html, /Two-Week Planning Components: 14 Nights for Two Adults/);
  assert.match(html, /14 hotel nights in one shared room, and 14 daily food\/activity allowances for the pair/);
  for (let column = 1; column <= 3; column++) {
    const components = data.slice(1,5).map((row,i) => ranges(row[column]).map(v => v * (i === 0 ? 1 : 14)));
    assert.deepEqual(sum(components), ranges(data[5][column]));
  }
  assert.deepEqual(data[5].slice(1), ['$5,360-11,200','$3,850-7,820','$2,960-6,140']);
  assert.match(html, /does not mean 14 calendar dates or guarantee that a 14-day pass covers every journey/);
  assert.doesNotMatch(tables(html).find(table => table.includes('Subtotal including flight allowance')), /JR Pass/);
});

test('changed FAQ schema answers match visible answers exactly', () => {
  const expected = new Map([[files[0],[0,1,2]], [files[1],[0,2]], [files[3],[4]], [files[5],[2]]]);
  for (const [file, indexes] of expected) {
    const html = read(file), visible = [...html.matchAll(/<div class="faq-answer">([\s\S]*?)<\/div>/g)].map(m => text(m[1]));
    for (const index of indexes) {
      const answer = answers(html)[index]; assert.ok(answer, `${file}: answer ${index}`);
      assert.ok(visible.includes(text(answer.acceptedAnswer.text)), `${file}: ${answer.name}`);
    }
  }
});

test('unresolved claims use all seven approved non-numeric fallbacks', () => {
  const fallbacks = [
    ['R012', 'Skyliner connects Narita Airport with Nippori and Keisei-Ueno. Check Keisei for the fare and journey time to your actual station.'],
    ['R013', 'Tokyo Monorail connects Haneda Airport with Hamamatsucho. Check the operator for the fare and travel time from your terminal.'],
    ['R014', "Keikyu serves Haneda Airport; route, connections and total fare depend on destination. Check the operator's route search."],
    ['R024', "Check the rail operator's timetable and service notices for your date. A journey-planning app is a convenience, not the fare or timetable authority."],
    ['R027', 'Luggage forwarding can reduce baggage carried on rail journeys. Obtain a carrier quote for your route and bag size.'],
    ['R038', 'Local fares vary by operator and journey. Keep a separate allowance for rides not covered by your selected ticket or pass, without counting the same ride twice.'],
    ['R051', 'Compare train and taxi options for your route, time, luggage and group. Trains can be good value, but late service, luggage and accessibility can change the practical choice. Check route-specific fares.']
  ];
  assert.equal(fallbacks.length, 7);
  const combined = files.map(read).map(text).join(' ');
  for (const [id,copy] of fallbacks) assert.ok(combined.includes(copy), id);
  assert.match(read(files[0]), /do not rely on HyperDia's average-route search/);
  assert.match(read(files[5]), /about 30 minutes from Osaka Station on JR Special Rapid/);
});

test('public inventory remains 102 files; tests/reports excluded; sitemap and policies unchanged', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'deployment/public-files.json'), 'utf8'));
  assert.equal(manifest.files.length, 102);
  assert.ok(manifest.files.every(f => !/^(tests|reports)\//.test(f)));
  const config = JSON.parse(fs.readFileSync(path.join(sourceRoot, '_config.yml'), 'utf8'));
  assert.ok(config.exclude.includes('tests') && config.exclude.includes('reports'));
  for (const file of ['sitemap.xml','robots.txt','_headers','_redirects','js/email-capture.js','trip-planner.html','trip-results.html']) {
    assert.equal(digest(normalize(read(file))), baseline.files[file], file);
  }
  assert.equal((read('best-time-greece.html').match(/\bid="faq"/g) || []).length, 1);
});

test('budget currency scope distinguishes USD allowances from official JPY tariffs', () => {
  const html = read(files[1]);
  assert.doesNotMatch(html, /All prices are in USD/);
  assert.match(html, /Illustrative travel-budget amounts are in USD; official Japan Rail Pass prices are quoted in JPY/);
  assert.match(html, /planning allowances, not live quotes/);
  assert.match(html, /actual costs depend on travel dates, itinerary, and booking conditions/);
  assert.match(html, /JPY 50,000/);
  assert.match(html, /JPY 53,000/);
});
