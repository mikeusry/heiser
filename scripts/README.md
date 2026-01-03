# Scripts

Build and migration utilities for Heiser site.

## Files

| Script | Description |
|--------|-------------|
| `parse-crawl-data.js` | Parse Apify crawl data → extract pages and images |
| `upload-to-cloudinary.js` | Upload images from JSON to Cloudinary CDN |
| `download-and-upload.js` | Download images locally then upload to Cloudinary |
| `upload-family-images.js` | Upload family/team photos to Cloudinary |

## Workflow

```
1. Apify crawl → heiser-site.json
2. parse-crawl-data.js → src/content/pages/*.json + images.json
3. upload-to-cloudinary.js → Cloudinary CDN (heiser/ folder)
```

## Cloudinary Config

Uses Southland Organics Cloudinary account:
- Folder: `heiser/`
- Dashboard: https://console.cloudinary.com/console/media_library/folders/heiser

---

**Last Updated:** December 2025
