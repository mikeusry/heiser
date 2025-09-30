import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the crawl data
const crawlData = JSON.parse(fs.readFileSync(path.join(__dirname, '../heiser-site.json'), 'utf8'));

// Create content directory structure
const contentDir = path.join(__dirname, '../src/content');
const pagesDir = path.join(contentDir, 'pages');
const imagesFile = path.join(__dirname, '../src/content/images.json');

// Ensure directories exist
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Extract all unique images from the crawl data
const allImages = new Set();
const imageRegex = /https?:\/\/[^\s"<>]+\.(?:jpg|jpeg|png|gif|svg|webp)/gi;

crawlData.forEach(page => {
  const pageStr = JSON.stringify(page);
  const matches = pageStr.match(imageRegex);
  if (matches) {
    matches.forEach(img => {
      // Filter out Apify screenshot URLs
      if (!img.includes('api.apify.com') && img.includes('cdn.prod.website-files.com')) {
        allImages.add(img);
      }
    });
  }
});

// Save images list
fs.writeFileSync(imagesFile, JSON.stringify(Array.from(allImages), null, 2));
console.log(`✓ Extracted ${allImages.size} unique images to src/content/images.json`);

// Process pages
const pages = crawlData.map(item => {
  const urlPath = new URL(item.url).pathname;
  const slug = urlPath === '/' ? 'home' : urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '-');

  return {
    slug,
    url: item.url,
    title: item.metadata?.title || 'Untitled',
    description: item.metadata?.description || '',
    markdown: item.markdown || '',
    text: item.text || '',
    jsonLd: item.metadata?.jsonLd || [],
    screenshotUrl: item.screenshotUrl || ''
  };
});

// Create individual page files
pages.forEach(page => {
  const filename = `${page.slug}.json`;
  const filepath = path.join(pagesDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(page, null, 2));
});

console.log(`✓ Created ${pages.length} page content files in src/content/pages/`);

// Create index file
const indexData = pages.map(p => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  url: p.url
}));

fs.writeFileSync(
  path.join(contentDir, 'pages-index.json'),
  JSON.stringify(indexData, null, 2)
);

console.log('✓ Created content index at src/content/pages-index.json');
console.log('\nSummary:');
console.log(`- Total pages: ${pages.length}`);
console.log(`- Total images: ${allImages.size}`);
console.log(`- Content directory: ${contentDir}`);