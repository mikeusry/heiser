# Blog Pages

Dynamic blog built from JSON content files.

## Structure

```
blog/
├── index.astro      # Blog listing page
└── [slug].astro     # Individual blog post template
```

## Content Source

Blog posts are stored as JSON in `src/content/pages/blog-*.json`

Each JSON file contains:
- `slug` - URL path
- `title` - Post title
- `description` - Meta description
- `markdown` - Post content (rendered via marked)
- `jsonLd` - Original schema (replaced with enhanced BlogPosting)

## Schema

Each blog post includes:
- **BlogPosting** schema with author, dates, images
- **BreadcrumbList** schema (Home → Blog → Post)

## Adding Posts

1. Create `src/content/pages/blog-{slug}.json`
2. Include required fields (slug, title, description, markdown)
3. Build will auto-generate the page

## Internal Linking

All blog posts include contextual links to relevant service pages:
- `/commercial-cleaning`
- `/residential-cleaning`
- `/specialty-cleaning`
- `/realty-cleaning`
- `/one-time-deep-clean`

---

**Posts:** 20
**Last Updated:** January 2026
