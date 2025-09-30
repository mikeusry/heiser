import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'southland-organics',
  api_key: process.env.CLOUDINARY_API_KEY || 'de9e65e2e492b57dc1b91ea10449af5c',
  api_secret: process.env.CLOUDINARY_API_SECRET || '9bd0946b8e677ab3b278859ca6daba89'
});

// Read images from JSON
const imagesFile = path.join(__dirname, '../src/content/images.json');
const images = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));

// Filter out the malformed first entry
const validImages = images.slice(1); // Skip the first one with multiple URLs

console.log(`Found ${validImages.length} images to upload to Cloudinary\n`);

const uploadedImages = [];
let successCount = 0;
let errorCount = 0;

// Upload images to Cloudinary
async function uploadImage(imageUrl, index) {
  try {
    // Extract filename from URL
    const urlPath = new URL(imageUrl).pathname;
    const filename = path.basename(urlPath).split('.')[0];
    const publicId = `heiser/${filename}`;

    console.log(`[${index + 1}/${validImages.length}] Uploading: ${filename}`);

    // Upload to Cloudinary using the URL
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'heiser',
      overwrite: false,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log(`✓ Uploaded: ${result.public_id}`);
    console.log(`  URL: ${result.secure_url}\n`);

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
    console.error(`✗ Failed to upload: ${imageUrl}`);
    console.error(`  Error: ${error.message}\n`);
    errorCount++;
    return null;
  }
}

// Upload all images with rate limiting
async function uploadAllImages() {
  console.log('Starting upload to Cloudinary...\n');

  for (let i = 0; i < validImages.length; i++) {
    await uploadImage(validImages[i], i);

    // Rate limit: wait 500ms between uploads
    if (i < validImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Save results
  const resultsFile = path.join(__dirname, '../src/content/cloudinary-images.json');
  fs.writeFileSync(resultsFile, JSON.stringify(uploadedImages, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('Upload Complete!');
  console.log('='.repeat(60));
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`📁 Results saved to: ${resultsFile}`);
  console.log('\nCloudinary folder: heiser/');
  console.log(`Dashboard: https://console.cloudinary.com/console/media_library/folders/heiser`);
}

uploadAllImages().catch(console.error);