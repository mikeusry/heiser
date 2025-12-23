# Design System

## Brand Identity

**Client**: The Heiser Group - Third-generation family-owned cleaning services (Lake County, IL / Kenosha, WI since 1978)

## Colors

| Name | Hex | Usage |
|------|-----|-------|
| Brand Orange | #D1623C | Primary accent |
| Brand Navy | #1A2B3D | Primary dark |
| Brand Cream | #FDF5ED | Backgrounds |

## Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | Zilla Slab | 700 |
| Body | Inter | 400-600 |
| Logo | Playfair Display | - |

**Philosophy**: Modern, bold slab serif typography with clean layouts

## Components

| Component | Purpose |
|-----------|---------|
| Navigation | Orange bg, white logo box, mobile responsive |
| Footer | Navy bg, 4-column layout |
| CoreValues | 4 value cards with icons |
| TestimonialSection | Auto-rotating carousel |
| CTASection | Reusable with props |
| CloudinaryImage | Optimized delivery |

## Cloudinary Integration

- **Cloud**: southland-organics
- **Folder**: heiser/heiser/
- **Images**: 41 total (38 original + 3 family)
- **Transformations**: `c_fill,g_face` for consistent sizing

### Family Photos (About Page)

| Generation | Public ID |
|------------|-----------|
| Grandpa (Founder) | heiser/heiser/The-Heiser-Group-Our-Story-Grandpa |
| Father (2nd Gen) | heiser/heiser/The-Heiser-Group-Our-Story-Father |
| David (3rd Gen) | heiser/heiser/The-Heiser-Group-Our-Story-David |

All sized to 400x600 with `c_fill,g_face` transformation.

## See Also

- `/BRAND-GUIDE.md` - Complete brand guidelines
- `/COMPONENTS.md` - Component documentation
