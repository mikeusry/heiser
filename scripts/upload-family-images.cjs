const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'southland-organics',
  api_key: '246196521633339',
  api_secret: 'vQLdl6oOHdhvLgQqC8CnfqAxjAY'
});

const familyImages = [
  {
    url: 'https://cdn.prod.website-files.com/60b80a86a8a100622af4963a/62f17ab24db2ed6585fa9d6d_The-Heiser-Group-Our-Story-Grandpa.webp',
    name: 'The-Heiser-Group-Our-Story-Grandpa'
  },
  {
    url: 'https://cdn.prod.website-files.com/60b80a86a8a100622af4963a/62f17ab25b209fe986d37422_The-Heiser-Group-Our-Story-Father.webp',
    name: 'The-Heiser-Group-Our-Story-Father'
  },
  {
    url: 'https://cdn.prod.website-files.com/60b80a86a8a100622af4963a/62f17ab20897772ad07d1ac3_The-Heiser-Group-Our-Story-David.webp',
    name: 'The-Heiser-Group-Our-Story-David'
  }
];

async function uploadToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'heiser/heiser',
      public_id: publicId,
      overwrite: true,
      resource_type: 'image'
    });

    console.log(`✓ Uploaded: ${publicId}`);
    return {
      originalUrl: imageUrl,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Uploading family images to Cloudinary...\n');

  const results = [];

  for (const image of familyImages) {
    const result = await uploadToCloudinary(image.url, image.name);
    if (result) {
      results.push(result);
    }
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✓ Successfully uploaded ${results.length} images`);

  // Read existing images
  const existingImages = JSON.parse(fs.readFileSync('./src/content/cloudinary-images.json', 'utf8'));

  // Merge with existing images (avoiding duplicates)
  const existingPublicIds = existingImages.map(img => img.publicId);
  const newImages = results.filter(img => !existingPublicIds.includes(img.publicId));

  const allImages = [...existingImages, ...newImages];

  // Save updated results
  fs.writeFileSync('./src/content/cloudinary-images.json', JSON.stringify(allImages, null, 2));
  console.log('\n✓ Updated cloudinary-images.json');
}

main();