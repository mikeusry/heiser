# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro v5.14.1 (Static Site Generator) |
| Styling | Tailwind CSS v4 (@tailwindcss/vite plugin) |
| Language | TypeScript (strict mode) |
| Image CDN | Cloudinary (southland-organics cloud) |
| Fonts | Google Fonts (Zilla Slab, Inter, Playfair Display) |

## Project Structure

```
Heiser/
├── src/
│   ├── components/           # Reusable Astro components
│   │   ├── Navigation.astro
│   │   ├── Footer.astro
│   │   ├── CoreValues.astro
│   │   ├── TestimonialSection.astro
│   │   ├── CTASection.astro
│   │   └── CloudinaryImage.astro
│   ├── pages/                # Route pages (12 total)
│   ├── content/
│   │   └── cloudinary-images.json
│   └── styles/
│       └── global.css
├── public/
│   └── logo.svg
├── scripts/                  # Utilities
│   ├── parse-crawl-data.js
│   └── upload-to-cloudinary.js
├── BRAND-GUIDE.md           # Complete brand guidelines
└── COMPONENTS.md            # Component documentation
```

## Pages (12 total)

- Homepage: Hero, services, values, testimonials
- About: Three-generation family story
- Contact: Form and contact info
- Results: Testimonials and stats
- Careers: Job listings
- 6 Service pages (consistent structure)
- 404 page
- Admin page (progress tracking)

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

1. **Tailwind v4 Limitations**: @apply directive not fully compatible - use plain CSS
2. **Cloudinary URLs**: Base `https://res.cloudinary.com/southland-organics/`
3. **Component Imports**: Use `BaseLayout` not `Layout`
4. **CSS Specificity**: Avoid setting colors on base elements in global.css

## Git Repository

- **Remote**: https://github.com/mikeusry/heiser.git
- **Branch**: main
