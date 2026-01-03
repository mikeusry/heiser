# Lib

Centralized TypeScript data modules - single source of truth.

## Files

| File | Description |
|------|-------------|
| `contact.ts` | Company contact info, address, phone, hours |
| `services.ts` | Service definitions (residential, commercial, etc.) |
| `serviceAreas.ts` | Geographic service areas |
| `testimonials.ts` | Customer testimonials |
| `coreValues.ts` | Company core values |
| `images.ts` | Cloudinary image helpers |

## Usage

```typescript
import { contact, company } from '../lib/contact';
import { services, mainServices } from '../lib/services';
```

## Key Exports

### `contact.ts`
- `contact.phone.display` → "(773) 545-5200"
- `contact.address.full` → Full address string
- `company.name` → "The Heiser Group"
- `company.tagline` → "Less Mess. Less Stress."

### `services.ts`
- `services` → All 6 services
- `mainServices` → 4 main services (residential, commercial, realty, specialty)
- `frequencyServices` → 2 frequency options (bi-weekly, monthly)
- `getServiceById(id)` / `getServiceByUrl(url)`

---

**Last Updated:** December 2025
