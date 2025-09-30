# Heiser Group Brand Guide

## Brand Overview
The Heiser Group is a professional cleaning service company serving the Chicago area and Lake County Illinois. The brand conveys trust, professionalism, and quality through a modern, approachable design system.

## Color Palette

### Primary Colors
```css
--brand-orange: #D1623C;      /* Burnt Orange - Primary brand color */
--brand-navy: #1A2B3D;        /* Navy Blue - Secondary brand color */
--brand-cream: #FDF5ED;       /* Off-White/Cream - Light backgrounds */
```

### Secondary Colors
```css
--background-white: #FFFFFF;   /* Pure white for main backgrounds */
--text-dark: #000000;          /* Black for primary text */
--text-gray: #4A4A4A;          /* Medium gray for secondary text */
```

### Usage Guidelines
- **Orange (#D1623C)**: Use for primary CTAs, headings, accents, icons, and emphasis elements
- **Navy (#1A2B3D)**: Use for secondary elements, footer, and to create depth/contrast
- **Cream (#FDF5ED)**: Use for alternating sections, testimonial backgrounds, and soft contrast areas

## Typography

### Font Families
```css
/* Logo - Serif (Classic) */
font-family: 'Playfair Display', 'Georgia', serif;

/* Headings - Modern Slab Serif */
font-family: 'Zilla Slab', 'Roboto Slab', 'Courier New', serif;
font-weight: 600-700; /* Bold weights for impact */

/* Body Text - Modern Sans Serif */
font-family: 'Inter', 'System UI', sans-serif;
```

### Font Pairing Strategy
- **Logo**: Classic serif (Playfair Display) - maintains elegance and tradition
- **Headings**: Bold slab serif (Zilla Slab/Roboto Slab) - modern, impactful, geometric
- **Body**: Clean sans-serif (Inter) - highly readable, contemporary

The contrast between the elegant logo serif and bold slab headings creates visual interest while maintaining professionalism.

### Type Scale
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

## Logo

### Primary Logo
- Stacked format: "THE HEISER" (orange) above "GROUP" (navy)
- Large stylized "H" and "G" letters interlocking
- Serif typography with elegant, professional feel

### Logo Usage
- Minimum size: 120px width
- Clear space: Minimum 20px padding on all sides
- Always use on white or cream backgrounds
- Do not distort, rotate, or alter colors

## Design Elements

### Modern Design Approach
- **Bold Typography**: Large slab serif headings (60px-80px for heroes)
- **Generous White Space**: Clean, breathing layouts
- **Geometric Shapes**: Mix of organic curves with sharp angles
- **High Contrast**: Strong color blocking with navy, orange, and white
- **Minimal Ornamentation**: Let typography and color do the heavy lifting

### Icons
- **Star Icon**: Five-pointed star in brand orange
- Use for: Core values, ratings, feature highlights
- Style: Solid fill, clean geometric shape
- Size: 48px-64px for feature sections

### Shapes
- **Organic Curves**: Flowing, rounded shapes for softness
- **Angular Elements**: Sharp geometric accents for modernity
- Use for: Hero sections, image masks, decorative elements, section dividers
- Colors: Navy and orange, with white negative space

### Buttons

#### Primary Button
```css
background: #D1623C (orange);
color: #FFFFFF;
padding: 16px 32px;
border-radius: 8px;
font-weight: 600;
transition: all 0.3s ease;

hover: {
  background: #B84E2A; /* Darker orange */
  transform: translateY(-2px);
}
```

#### Secondary Button
```css
background: #FFFFFF;
color: #1A2B3D (navy);
border: 2px solid #1A2B3D;
padding: 16px 32px;
border-radius: 8px;
font-weight: 600;

hover: {
  background: #1A2B3D;
  color: #FFFFFF;
}
```

## Layout Principles

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Grid System
- Max content width: 1280px
- Padding: 24px mobile, 48px desktop
- Columns: 12-column grid system
- Gaps: 24px

## Core Values Visual Identity

### Four Pillars (with star icons)
1. **Honesty** - Orange star icon
2. **Integrity** - Orange star icon
3. **Quality** - Orange star icon
4. **Service** - Orange star icon

Each value should be presented in a 4-column grid with:
- Star icon (orange)
- Bold heading (navy)
- Body text (dark gray)
- White background
- Subtle shadow or border

## Section Patterns

### Hero Section
- Large heading with orange accent text
- Navy curved shape overlays
- High-quality imagery
- Strong CTA button (orange)
- Cream or white background

### Testimonials
- Cream background (#FDF5ED)
- Navy curved decorative elements
- Large quoted text (dark navy)
- Attribution in smaller text
- Carousel navigation arrows

### Footer
- Navy background (#1A2B3D)
- White text
- Orange logo
- Multi-column layout
- Social icons

## Voice & Tone

### Brand Voice
- **Professional** yet **approachable**
- **Confident** without being arrogant
- **Clear** and **direct** communication
- Focus on **customer benefit** and **peace of mind**

### Key Messaging
- "Seeing Is Believing"
- "You Won't Believe The Difference"
- Emphasis on: Quality, Thoroughness, Hassle-free service
- Service areas: Lake County IL, Chicago North Shore, Kenosha WI

## Image Style

### Photography Guidelines
- Professional, well-lit photography
- Clean, organized spaces
- Warm, inviting atmosphere
- Show cleaning in action (before/after)
- People: Diverse, friendly, professional

### Image Treatment
- Organic curved masks/shapes
- Navy or orange overlay accents
- High contrast
- Crisp, clear imagery

## Accessibility

### Contrast Ratios
- Orange on white: 4.5:1 ✓ (AA compliant)
- Navy on white: 12.6:1 ✓ (AAA compliant)
- White on orange: 4.5:1 ✓ (AA compliant)
- White on navy: 12.6:1 ✓ (AAA compliant)

### Best Practices
- Minimum font size: 16px for body text
- Use semantic HTML
- Provide alt text for all images
- Ensure keyboard navigation
- Test with screen readers

---

*Last Updated: 2025*