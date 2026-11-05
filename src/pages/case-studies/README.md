# Case Studies

Real client work from The Heiser Group. Pages live in this folder and are linked from the home Featured Case Studies section.

## Structure

```
case-studies/
├── highland-park-turnover.astro
├── ace-hardware-strip-wax.astro
├── morgans-bar-floor-scrubbing.astro
├── residential-carpet-4-step.astro
├── apartment-lobby-urine-stains.astro
└── bar-bathroom-floor-scrub.astro
```

## Current Case Studies

### Highland Park Turnover
- **Location:** Highland Park, IL
- **Type:** Move-out deep clean
- **Highlights:** 24-hour turnaround, estate property

### Ace Hardware Strip & Wax
- **Location:** Lake County, IL
- **Type:** Overnight VCT strip and four-coat finish

### Morgan's Bar Quarterly Floor Scrubbing
- **Location:** Libertyville, IL
- **Type:** Recurring tile and grout machine scrub

### Residential Carpet 4-Step
- **Location:** Chicagoland (town not given)
- **Client:** Residential client
- **Type:** Process documentation of the carpet 4-step (vacuuming, treating stains / agitating, shampooing, bonneting)
- **Photos:** stairs (4), bedroom1 (5), bedroom2 (4), bathroom (4) — November 2026, Cloudinary `Heiser/gallery/Heiser/matthew-nov2026/`
- **Note:** Process shots, not labeled before/after pairs

### Apartment Lobby Urine Stains
- **Location:** Chicagoland (building not given)
- **Client:** Apartment lobby
- **Type:** Same 4-step on urine stains
- **Photos:** urine (9)
- **Note:** Process shots, not labeled before/after pairs

### Bar Bathroom Floor Scrub
- **Location:** Chicagoland (bar name not given)
- **Client:** Commercial client
- **Type:** Bathroom floor mid-scrub (true half-and-half in one frame) plus carpet 4-step on a traffic pattern outside a bathroom
- **Photos:** bar-floor (1), traffic (2)
- **Note:** Only the bar-floor frame is labeled as half scrubbed / half not. Traffic photos stay process shots.

## Adding Case Studies

1. Create a new `.astro` file in this directory
2. Use `CaseStudyLayout` and match the existing pages:
   - Hero with client / location / service
   - Challenge or job section
   - Photos (only label before/after when the pairing is confirmed)
   - CTA to contact
3. Add a card on the home Featured Case Studies section (`src/pages/index.astro`)
4. Update this README

## Linking

Case studies are referenced from:
- Home Featured Case Studies (`src/pages/index.astro`)
- Service pages (realty-cleaning, specialty-cleaning, commercial-cleaning)
- City pages (when relevant)

The public Results page is testimonials-only. Job-photo galleries in admin KV are a separate path and are not seeded from these pages.

---

**Case Studies:** 6
**Last Updated:** November 2026
