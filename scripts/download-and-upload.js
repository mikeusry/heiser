import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'southland-organics',
  api_key: process.env.CLOUDINARY_API_KEY || '246196521633339',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'vQLdl6oOHdhvLgQqC8CnfqAxjAY'
});

// Read images from JSON
const imagesFile = path.join(__dirname, '../src/content/images.json');
const images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));

// Filter out the malformed first entry
const validImages = images.slice(1);

// Create downloads directory
const downloadsDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

console.log(`Found ${validImages.length} images to download and upload\n`);

const uploadedImages = [];
let successCount = 0;
let errorCount = 0;

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Upload local file to Cloudinary
async function uploadToCloudinary(filepath, publicId) {
  return await cloudinary.uploader.upload(filepath, {
    public_id: publicId,
    folder: 'heiser',
    overwrite: true,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });
}

// Process single image
async function processImage(imageUrl, index) {
  try {
    // Extract filename from URL
    const urlPath = new URL(imageUrl).pathname;
    const filename = path.basename(urlPath);
    const filenameWithoutExt = filename.split('.')[0];
    const localPath = path.join(downloadsDir, filename);
    const publicId = `heiser/${filenameWithoutExt}`;

    console.log(`[${index + 1}/${validImages.length}] Processing: ${filename}`);

    // Step 1: Download
    console.log(`  ↓ Downloading...`);
    await downloadImage(imageUrl, localPath);
    console.log(`  ✓ Downloaded`);

    // Step 2: Upload to Cloudinary
    console.log(`  ↑ Uploading to Cloudinary...`);
    const result = await uploadToCloudinary(localPath, publicId);
    console.log(`  ✓ Uploaded: ${result.public_id}`);
    console.log(`    URL: ${result.secure_url}\n`);

    // Step 3: Clean up local file
    fs.unlinkSync(localPath);

    uploadedImages.push({
      originalUrl: imageUrl,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });

    successCount++;
    return result;

  } catch (error) {
    console.error(`  ✗ Failed: ${imageUrl}`);
    console.error(`    Error: ${error.message}\n`);
    errorCount++;
    return null;
  }
}

// Process all images
async function processAllImages() {
  console.log('Starting download and upload process...\n');
  console.log('='.repeat(60) + '\n');

  for (let i = 0; i < validImages.length; i++) {
    await processImage(validImages[i], i);

    // Rate limit: wait 1 second between uploads
    if (i < validImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save results
  const resultsFile = path.join(__dirname, '../src/content/cloudinary-images.json');
  fs.writeFileSync(resultsFile, JSON.stringify(uploadedImages, null, 2));

  // Clean up downloads directory if empty
  const remainingFiles = fs.readdirSync(downloadsDir);
  if (remainingFiles.length === 0) {
    fs.rmdirSync(downloadsDir);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Process Complete!');
  console.log('='.repeat(60));
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`📁 Results saved to: ${resultsFile}`);
  console.log('\nCloudinary folder: heiser/');
  console.log(`Dashboard: https://console.cloudinary.com/console/media_library/folders/heiser`);
}

processAllImages().catch(console.error);