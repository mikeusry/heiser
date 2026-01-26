# Service Area (City) Pages

SEO-optimized landing pages for each city served, built per Bipper Media standards.

## Structure

```
service-areas/
├── index.astro      # Service areas overview (lists all cities)
└── [city].astro     # Individual city page template
```

## Cities (12)

| City | Slug | Drive Time |
|------|------|------------|
| Buffalo Grove | buffalo-grove | 0 min (HQ) |
| Vernon Hills | vernon-hills | 5 min |
| Lincolnshire | lincolnshire | 5 min |
| Libertyville | libertyville | 8 min |
| Deerfield | deerfield | 10 min |
| Grayslake | grayslake | 12 min |
| Mundelein | mundelein | 15 min |
| Highland Park | highland-park | 18 min |
| Lake Forest | lake-forest | 20 min |
| Gurnee | gurnee | 20 min |
| Waukegan | waukegan | 22 min |
| Lake Bluff | lake-bluff | 22 min |

## Content Per City (Bipper Media Standards)

Each city page includes:
- **Unique intro** (150+ words) - not templated
- **About section** - population, history, character
- **8 neighborhoods** - specific areas served
- **5 landmarks** - local reference points
- **3 FAQs** - city-specific questions
- **Drive time** - distance from Buffalo Grove office

## Schema

Each city page includes:
- **LocalBusiness** schema
- **BreadcrumbList** schema (Home → Service Areas → City)
- **FAQPage** schema (enables rich snippets)

## Data Location

All city data is defined in `[city].astro` in the `citiesData` array.

## SEO Strategy

Per Bipper Media recommendations:
- Unique content per city (no duplicate text)
- Local keywords ("cleaning + city")
- Neighborhood/landmark references
- Strong CTAs
- FAQ schema for rich snippets

---

**Cities:** 12
**Last Updated:** January 2026
