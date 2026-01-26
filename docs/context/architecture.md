# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro v5.14.1 (Static Site Generator) |
| Styling | Tailwind CSS v4 (@tailwindcss/vite plugin) |
| Language | TypeScript (strict mode) |
| Image CDN | Cloudinary (southland-organics cloud) |
| Fonts | Google Fonts (Zilla Slab, Inter, Playfair Display) |
| Hosting | Cloudflare Pages |
| Forms | Cloudflare Workers + SendGrid |

## Project Structure

```
Heiser/
├── src/
│   ├── components/           # 19 reusable Astro components
│   ├── pages/                # 56 pages total
│   │   ├── blog/             # Blog index + [slug].astro
│   │   ├── service-areas/    # City pages (12 cities)
│   │   └── case-studies/     # Case study pages
│   ├── content/
│   │   ├── pages/            # Blog post JSON files (20)
│   │   └── config.ts         # Content collection schema
│   ├── lib/                  # Data modules
│   │   ├── services.ts
│   │   ├── contact.ts
│   │   └── testimonials.ts
│   └── layouts/
│       └── BaseLayout.astro
├── workers/
│   └── contact-form/         # Cloudflare Worker for forms
├── scripts/                  # Build utilities
├── public/                   # Static assets
├── BRAND-GUIDE.md
└── COMPONENTS.md
```

## Pages (56 total)

| Category | Count | Examples |
|----------|-------|----------|
| Service Pages | 8 | residential, commercial, specialty, realty |
| City Pages | 12 | Libertyville, Highland Park, Lake Forest... |
| Blog Posts | 20 | Dynamic from JSON content |
| Core Pages | 10 | Home, About, Contact, FAQ, Careers... |
| Legal | 2 | Privacy Policy, Terms |
| Utility | 4 | 404, Admin, Thank You, Results |

## Deployment

```bash
# Build
npm run build

# Deploy to Cloudflare Pages (manual)
npx wrangler pages deploy dist --project-name=heiser
```

Note: Cloudflare Pages is not connected to Git. Deploys are manual.

## Environment Variables

```env
PUBLIC_CLOUDINARY_CLOUD_NAME=southland-organics
CLOUDINARY_API_KEY=246196521633339
CLOUDINARY_API_SECRET=vQLdl6oOHdhvLgQqC8CnfqAxjAY
```

## Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Technical Notes

1. **Tailwind v4**: Uses @tailwindcss/vite plugin, not PostCSS
2. **Cloudinary URLs**: Base `https://res.cloudinary.com/southland-organics/`
3. **Content Collections**: Blog posts use JSON loader in `src/content.config.ts`
4. **City Pages**: Data defined in `src/pages/service-areas/[city].astro`

## Git Repository

- **Remote**: https://github.com/mikeusry/heiser.git
- **Branch**: main

---

**Last Updated:** January 2026
