# Destination Photography — DreamVacati

This folder holds destination photography used in article body content.

## Naming Convention

`{destination-slug}-{scene}.webp`

| Filename | Page | Scene |
|---|---|---|
| `montego-bay-beach.webp` | montego-bay-jamaica.html | Doctor's Cave Beach aerial or beach scene |
| `montego-bay-resort.webp` | montego-bay-jamaica.html | Resort coastline |
| `negril-seven-mile-beach.webp` | negril-jamaica.html | Seven Mile Beach wide shot |
| `negril-west-end-cliffs.webp` | negril-jamaica.html | West End cliff at sunset |
| `negril-ricks-cafe.webp` | negril-jamaica.html | Rick's Cafe cliff bar |
| `jamaica-blue-mountains.webp` | jamaica-travel-guide.html | Blue Mountains landscape |
| `jamaica-dunn-river-falls.webp` | jamaica-5-day-itinerary.html | Dunn's River Falls |
| `jamaica-aerial.webp` | jamaica-travel-guide.html | Aerial coastline |
| `caribbean-aerial.webp` | blog-compare-caribbean-islands.html | Generic Caribbean aerial |

## Technical Specs

- **Format:** WebP (primary), with JPEG fallback in `<picture>` element
- **Max width:** 1200px (displayed at ~800px in article layout)
- **Compression:** Target < 150 KB per image — use Squoosh (squoosh.app)
- **Alt text:** Always descriptive, destination + scene specific
- **Loading:** `loading="lazy"` on all except above-the-fold hero

## HTML Pattern (when images are ready)

```html
<figure style="margin:1.5rem 0;border-radius:12px;overflow:hidden">
  <picture>
    <source srcset="images/destinations/montego-bay-beach.webp" type="image/webp">
    <img src="images/destinations/montego-bay-beach.jpg"
         alt="Doctor's Cave Beach in Montego Bay, Jamaica — calm turquoise water and white sand"
         width="800" height="450" loading="lazy" style="width:100%;height:auto;display:block">
  </picture>
  <figcaption style="padding:.5rem 1rem;font-size:.8rem;color:#64748b;background:#f8fafc">
    Doctor's Cave Beach, Montego Bay
  </figcaption>
</figure>
```

## Sourcing Notes

- License carefully: Unsplash (free), Pexels (free), Shutterstock (paid)
- For Jamaica specifically: Jamaica Tourist Board press kit may have licensed imagery
- Prefer landscape/horizontal orientation (16:9 or 3:2)
- Avoid photos with identifiable people (licensing complexity)
