# Heiser Group Component Library

This document describes all reusable components and centralized data files available in the project. **Always use these components and data files when building new pages** to maintain consistency and reduce code duplication.

## Table of Contents

- [Data Files](#data-files)
- [Layout Components](#layout-components)
- [Page Structure Components](#page-structure-components)
- [Content Components](#content-components)
- [Media Components](#media-components)
- [Interactive Components](#interactive-components)
- [Usage Guidelines](#usage-guidelines)

---

## Data Files

All shared data is centralized in `src/lib/`. **Always import from these files instead of hardcoding values.**

### contact.ts

Centralized contact information for the company.

```typescript
import { contact, company } from '../lib/contact';

// Usage
contact.phone.display    // "(773) 545-5200"
contact.phone.href       // "tel:7735455200"
contact.address.street   // "1567 BARCLAY BLVD"
contact.address.full     // "1567 BARCLAY BLVD, BUFFALO GROVE, IL 60089-4518"
contact.hours.days       // "Monday - Friday"
contact.hours.start      // "9:00 AM"
contact.social.facebook  // Facebook URL
contact.social.linkedin  // LinkedIn URL

company.name             // "The Heiser Group"
company.tagline          // "Less Mess. Less Stress."
company.founded          // 1978
company.shortDescription // Company description for footers
```

---

### services.ts

All service definitions with URLs and descriptions.

```typescript
import {
  services,           // All services array
  mainServices,       // Main 4 services (residential, commercial, realty, specialty)
  frequencyServices,  // Frequency services (bi-weekly, monthly)
  navServices,        // Services for navigation (all 6)
  footerServices,     // Services for footer (main 4)
  serviceOptions,     // For form select options [{value, label}]
  getServiceById,     // Get service by ID
  getServiceByUrl     // Get service by URL
} from '../lib/services';

// Usage in pages
const service = getServiceById('residential');
// service.name, service.url, service.description, service.shortDescription
```

**Service Object Structure:**
| Property | Description |
|----------|-------------|
| `id` | Unique identifier (residential, commercial, etc.) |
| `name` | Full display name |
| `shortName` | Abbreviated name |
| `url` | Page URL path |
| `description` | Full SEO description |
| `shortDescription` | Short description for cards |
| `category` | 'main' or 'frequency' |

---

### serviceAreas.ts

Service area information and pre-formatted text.

```typescript
import {
  serviceAreas,      // Raw data object
  serviceAreaText,   // Pre-formatted strings
  serviceAreaGrid    // Array for grid displays
} from '../lib/serviceAreas';

// Usage
serviceAreas.primary      // "Lake County Illinois"
serviceAreas.secondary    // "Kenosha, Wisconsin"
serviceAreas.region       // "Greater Chicago Area"
serviceAreas.cities       // Array of city names

serviceAreaText.full      // Full text with all cities
serviceAreaText.short     // "Lake County Illinois to Kenosha, Wisconsin"
serviceAreaText.withEmphasis // HTML with <strong> tags

serviceAreaGrid           // Cities array for grid layouts
```

---

### testimonials.ts

All testimonials and statistics.

```typescript
import {
  testimonials,           // All testimonials
  featuredTestimonials,   // For carousel (featured: true)
  additionalTestimonials, // For results page grid
  stats,                  // Statistics array
  getTestimonialById
} from '../lib/testimonials';

// Testimonial object
{
  id: "tom-strossner",
  quote: "...",
  author: "Tom Strossner",
  title?: "Optional title",
  featured?: true
}

// Stats array
stats = [
  { value: "1000+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  // ...
]
```

---

### coreValues.ts

Core company values.

```typescript
import { coreValues } from '../lib/coreValues';

// Array of { title, description }
// Used by CoreValues.astro component
```

---

## Layout Components

### BaseLayout

**File:** `src/layouts/BaseLayout.astro`

The main page wrapper that includes Navigation, Footer, and global styles.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page Title" description="SEO description">
  <!-- Page content -->
</BaseLayout>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"The Heiser Group"` | Page title for `<title>` tag |
| `description` | `string` | Default description | Meta description for SEO |

---

### Navigation

**File:** `src/components/Navigation.astro`

Site header with logo, navigation links, and mobile menu. Automatically included via BaseLayout.

**Data Source:** Imports `navServices` from `lib/services.ts` and `contact` from `lib/contact.ts`

**Features:**
- Fixed position header with orange background
- Dropdown menus populated from centralized services data
- Mobile-responsive hamburger menu
- Phone number from centralized contact data

---

### Footer

**File:** `src/components/Footer.astro`

Site footer with navy background. Automatically included via BaseLayout.

**Data Source:** Imports `footerServices` from `lib/services.ts` and `contact`, `company` from `lib/contact.ts`

**Features:**
- 4-column layout (Logo/CTA, Services, Company, Outreach)
- Services links populated from centralized data
- Contact information from centralized data
- Social media links from centralized data

---

## Page Structure Components

### PageHero

**File:** `src/components/PageHero.astro`

Navy background hero section for interior pages.

```astro
---
import PageHero from '../components/PageHero.astro';
---

<!-- Service page style -->
<PageHero
  eyebrow="RESIDENTIAL CLEANING"
  title="Hassle-Free Home Cleaning"
  subtitle="Description text here"
/>

<!-- Centered style (for About, Contact, Results) -->
<PageHero
  title="Our History"
  subtitle="Generations of trust and quality"
  centered
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Main heading (h1) |
| `subtitle` | `string` | - | Description paragraph |
| `eyebrow` | `string` | - | Small uppercase label above title |
| `centered` | `boolean` | `false` | Center-align content |
| `size` | `'default' \| 'large'` | `'default'` | Padding size |

**Slot:** Additional content can be added after the subtitle.

---

### SectionHeader

**File:** `src/components/SectionHeader.astro`

Reusable section heading with optional subtitle.

```astro
---
import SectionHeader from '../components/SectionHeader.astro';
---

<SectionHeader title="What's Included" />

<SectionHeader
  title="Flexible Cleaning Schedules"
  subtitle="Choose the service that fits your lifestyle"
/>

<SectionHeader title="Our Story" centered={false} />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Section heading (h2) |
| `subtitle` | `string` | - | Description below title |
| `centered` | `boolean` | `true` | Center-align content |
| `size` | `'default' \| 'large'` | `'default'` | Heading size |

---

### CTASection

**File:** `src/components/CTASection.astro`

Call-to-action section with orange background.

```astro
---
import CTASection from '../components/CTASection.astro';
---

<CTASection
  title="Ready for a Sparkling Clean Home?"
  subtitle="Book your first cleaning today!"
  buttonText="Get Your Free Quote"
  buttonLink="/contact"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Less Mess. Less Stress."` | Main heading |
| `subtitle` | `string` | Default text | Description |
| `buttonText` | `string` | `"Contact Us"` | CTA button text |
| `buttonLink` | `string` | `"/contact"` | CTA button destination |

---

## Content Components

### FeatureCard

**File:** `src/components/FeatureCard.astro`

Flexible card for displaying features, benefits, or list items.

```astro
---
import FeatureCard from '../components/FeatureCard.astro';
---

<!-- Default variant with icon -->
<FeatureCard
  title="Kitchen Cleaning"
  description="Countertops, sinks, appliances, and more"
  icon="star"
/>

<!-- With different icons -->
<FeatureCard
  title="Flat-Rate Pricing"
  description="Simple, transparent pricing"
  icon="dollar"
/>

<!-- Numbered variant (for steps) -->
<FeatureCard
  title="Thorough & Professional"
  description="Our team follows a comprehensive checklist"
  variant="numbered"
  number={1}
  iconSize="lg"
/>

<!-- Boxed variant (no icon, card style) -->
<FeatureCard
  title="Consistent Cleanliness"
  description="Your home stays clean year-round"
  variant="boxed"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Feature title |
| `description` | `string` | *required* | Feature description |
| `icon` | `string` | `'star'` | Icon name (see below) |
| `variant` | `'default' \| 'numbered' \| 'boxed'` | `'default'` | Display style |
| `number` | `number` | - | Number for numbered variant |
| `iconSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Icon container size |

**Available Icons:** `star`, `check`, `dollar`, `calendar`, `sparkle`, `team`, `shield`, `phone`, `location`, `clock`

---

### ServiceCard

**File:** `src/components/ServiceCard.astro`

Card for displaying service previews with optional image.

```astro
---
import ServiceCard from '../components/ServiceCard.astro';
import { featuredImages } from '../lib/images';
---

<!-- With Cloudinary image -->
<ServiceCard
  title="Residential Cleaning"
  description="Professional home cleaning services"
  href="/residential-cleaning"
  image={{ publicId: featuredImages.biWeeklyCleaning.publicId }}
  linkText="See Options"
/>

<!-- Simple variant (no image) -->
<ServiceCard
  title="Bi-Weekly Cleaning"
  description="Our most popular option"
  href="/bi-weekly-cleaning"
  variant="simple"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Service title |
| `description` | `string` | *required* | Service description |
| `href` | `string` | *required* | Link to service page |
| `image` | `object \| string` | - | Cloudinary image (publicId) |
| `variant` | `'default' \| 'simple'` | `'default'` | With/without image |
| `linkText` | `string` | `'Learn More'` | Custom link text |

---

### StatCard

**File:** `src/components/StatCard.astro`

Display a single statistic with large number and label.

```astro
---
import StatCard from '../components/StatCard.astro';
import { stats } from '../lib/testimonials';
---

<div class="grid md:grid-cols-4 gap-8">
  {stats.map(stat => (
    <StatCard value={stat.value} label={stat.label} />
  ))}
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | *required* | The stat number/value |
| `label` | `string` | *required* | Description label |
| `variant` | `'default' \| 'light'` | `'default'` | Color scheme |

---

### TestimonialCard

**File:** `src/components/TestimonialCard.astro`

Display a single testimonial quote.

```astro
---
import TestimonialCard from '../components/TestimonialCard.astro';
import { additionalTestimonials } from '../lib/testimonials';
---

{additionalTestimonials.map(t => (
  <TestimonialCard quote={t.quote} author={t.author} />
))}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `quote` | `string` | *required* | Testimonial text |
| `author` | `string` | *required* | Person's name |
| `variant` | `'default' \| 'featured'` | `'default'` | Display style |

---

### CoreValues

**File:** `src/components/CoreValues.astro`

Pre-built section displaying the four core values.

**Data Source:** Imports `coreValues` from `lib/coreValues.ts`

```astro
---
import CoreValues from '../components/CoreValues.astro';
---

<CoreValues />
```

**No props** - Self-contained section that loops over centralized values data.

---

### TestimonialSection

**File:** `src/components/TestimonialSection.astro`

Auto-rotating testimonial carousel with cream background.

**Data Source:** Imports `featuredTestimonials` from `lib/testimonials.ts`

```astro
---
import TestimonialSection from '../components/TestimonialSection.astro';
---

<TestimonialSection />
```

**No props** - Self-contained section with auto-rotation using centralized testimonials.

---

## Media Components

### CloudinaryImage

**File:** `src/components/CloudinaryImage.astro`

Optimized image delivery from Cloudinary CDN.

```astro
---
import CloudinaryImage from '../components/CloudinaryImage.astro';
---

<CloudinaryImage
  publicId="heiser/heiser/image-name"
  alt="Descriptive alt text"
  width={800}
  height={600}
  class="rounded-lg shadow-lg"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publicId` | `string` | *required* | Cloudinary public ID |
| `alt` | `string` | *required* | Image alt text |
| `width` | `number` | - | Image width |
| `height` | `number` | - | Image height |
| `class` | `string` | - | CSS classes |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading strategy |
| `quality` | `'auto' \| number` | `'auto'` | Image quality |
| `format` | `'auto' \| 'webp' \| 'jpg' \| 'png'` | `'auto'` | Image format |

---

## Interactive Components

### Button

**File:** `src/components/Button.astro`

Reusable button/link component with consistent styling.

```astro
---
import Button from '../components/Button.astro';
---

<!-- As link -->
<Button href="/contact" variant="primary" size="lg">
  Get Started
</Button>

<!-- As form button -->
<Button type="submit" variant="primary" fullWidth>
  Send Message
</Button>

<!-- Variants -->
<Button href="/services" variant="outline">View Services</Button>
<Button href="/" variant="white">Home</Button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link destination (renders as `<a>`) |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'white'` | `'primary'` | Color scheme |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `fullWidth` | `boolean` | `false` | Full width button |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `class` | `string` | - | Additional CSS classes |

**Variants:**
- `primary` - Orange background, white text
- `secondary` - Navy background, white text
- `outline` - Orange border, transparent background
- `white` - White background, orange text

---

## Usage Guidelines

### Page Template

When creating a new page, follow this structure:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageHero from '../components/PageHero.astro';
import SectionHeader from '../components/SectionHeader.astro';
import CTASection from '../components/CTASection.astro';
import { getServiceById } from '../lib/services';

// Get service data from centralized source
const service = getServiceById('service-id');
---

<BaseLayout
  title={`${service?.name} - The Heiser Group`}
  description={service?.description}
>
  <PageHero
    eyebrow="SERVICE NAME"
    title="Page Title"
    subtitle="Page description"
  />

  <section class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader title="Section Title" />
      <!-- Section content -->
    </div>
  </section>

  <CTASection
    title="Custom CTA Title"
    subtitle="Custom CTA description"
  />
</BaseLayout>
```

### Standard Section Structure

```astro
<section class="py-20 bg-white"> <!-- or bg-gray-50, bg-brand-cream -->
  <div class="max-w-6xl mx-auto px-6">
    <!-- Content -->
  </div>
</section>
```

### Grid Layouts

```astro
<!-- 2 columns -->
<div class="grid md:grid-cols-2 gap-8">

<!-- 3 columns -->
<div class="grid md:grid-cols-3 gap-8">

<!-- 4 columns -->
<div class="grid md:grid-cols-4 gap-8">
```

### Component Import Convention

Always import components and data at the top of your frontmatter:

```astro
---
// Layout (required)
import BaseLayout from '../layouts/BaseLayout.astro';

// Page structure
import PageHero from '../components/PageHero.astro';
import SectionHeader from '../components/SectionHeader.astro';
import CTASection from '../components/CTASection.astro';

// Content components
import FeatureCard from '../components/FeatureCard.astro';
import ServiceCard from '../components/ServiceCard.astro';
import StatCard from '../components/StatCard.astro';
import TestimonialCard from '../components/TestimonialCard.astro';

// Media
import CloudinaryImage from '../components/CloudinaryImage.astro';

// Interactive
import Button from '../components/Button.astro';

// Pre-built sections
import CoreValues from '../components/CoreValues.astro';
import TestimonialSection from '../components/TestimonialSection.astro';

// Data imports
import { contact, company } from '../lib/contact';
import { services, getServiceById } from '../lib/services';
import { serviceAreas, serviceAreaText } from '../lib/serviceAreas';
import { testimonials, stats } from '../lib/testimonials';
---
```

---

## File Inventory

### Components (`src/components/`)

| Component | File | Description |
|-----------|------|-------------|
| BaseLayout | `src/layouts/BaseLayout.astro` | Main page wrapper |
| Navigation | `Navigation.astro` | Site header (uses centralized data) |
| Footer | `Footer.astro` | Site footer (uses centralized data) |
| PageHero | `PageHero.astro` | Navy hero section |
| SectionHeader | `SectionHeader.astro` | Section headings |
| CTASection | `CTASection.astro` | Orange CTA section |
| FeatureCard | `FeatureCard.astro` | Feature/benefit cards |
| ServiceCard | `ServiceCard.astro` | Service preview cards |
| StatCard | `StatCard.astro` | Statistics display |
| TestimonialCard | `TestimonialCard.astro` | Quote cards |
| CoreValues | `CoreValues.astro` | Core values section (uses centralized data) |
| TestimonialSection | `TestimonialSection.astro` | Testimonial carousel (uses centralized data) |
| CloudinaryImage | `CloudinaryImage.astro` | Optimized images |
| Button | `Button.astro` | Buttons/links |

### Data Files (`src/lib/`)

| File | Description |
|------|-------------|
| `contact.ts` | Phone, address, hours, social links |
| `services.ts` | All service definitions and helpers |
| `serviceAreas.ts` | Service area cities and formatted text |
| `testimonials.ts` | Testimonials and statistics |
| `coreValues.ts` | Core company values |
| `images.ts` | Cloudinary image helpers |

---

## Best Practices

1. **Never hardcode contact info** - Always import from `lib/contact.ts`
2. **Never hardcode services** - Always import from `lib/services.ts`
3. **Use PageHero for all interior pages** - Maintains consistent styling
4. **Use SectionHeader for section titles** - Ensures typography consistency
5. **Use FeatureCard for icon+text patterns** - Reduces SVG duplication
6. **Use centralized testimonials** - Single source of truth for quotes
7. **Use getServiceById() in pages** - Gets SEO descriptions automatically

---

*Last Updated: December 2024*
