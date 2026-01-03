import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'southland-organics',
  api_key: '246196521633339',
  api_secret: 'vQLdl6oOHdhvLgQqC8CnfqAxjAY'
});

async function listFolderContents(folderPath) {
  try {
    console.log(`\nListing contents of: ${folderPath}`);
    console.log('='.repeat(60));

    // Use resources_by_asset_folder instead of search
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 100
    });

    if (!result.resources || result.resources.length === 0) {
      console.log('No images found in this folder.');
      return [];
    }

    console.log(`Found ${result.resources.length} images:\n`);

    const images = result.resources.map((resource, index) => {
      const filename = resource.public_id.split('/').pop();
      console.log(`${index + 1}. ${filename}`);
      console.log(`   Public ID: ${resource.public_id}`);
      console.log(`   Format: ${resource.format}, ${resource.width}x${resource.height}`);
      console.log(`   URL: ${resource.secure_url}\n`);
      return {
        filename,
        publicId: resource.public_id,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        url: resource.secure_url
      };
    });

    return images;
  } catch (error) {
    console.error(`Error listing folder: ${error.message}`);
    return [];
  }
}

async function listSubfolders(folderPath) {
  try {
    console.log(`\nListing subfolders of: ${folderPath}`);
    console.log('='.repeat(60));

    const result = await cloudinary.api.sub_folders(folderPath);

    if (result.folders.length === 0) {
      console.log('No subfolders found.');
      return [];
    }

    console.log(`Found ${result.folders.length} subfolders:\n`);
    result.folders.forEach((folder, i) => {
      console.log(`${i + 1}. ${folder.name} (path: ${folder.path})`);
    });

    return result.folders;
  } catch (error) {
    console.error(`Error listing subfolders: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('Cloudinary Folder Browser');
  console.log('Cloud: southland-organics\n');

  // Check the Job 11.12 folder structure
  await listSubfolders('Heiser/Realty Rachel/Job 11.12');

  // The correct paths (note: plural - Befores/Afters)
  const beforeImages = await listFolderContents('Heiser/Realty Rachel/Job 11.12/Befores');
  const afterImages = await listFolderContents('Heiser/Realty Rachel/Job 11.12/Afters');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Before images: ${beforeImages.length}`);
  console.log(`After images: ${afterImages.length}`);
  console.log(`Total: ${beforeImages.length + afterImages.length}`);

  // Output for case study page
  if (beforeImages.length > 0 || afterImages.length > 0) {
    console.log('\n\nIMAGE PAIRS FOR CASE STUDY:');
    console.log('='.repeat(60));

    const maxPairs = Math.min(beforeImages.length, afterImages.length);
    for (let i = 0; i < maxPairs; i++) {
      console.log(`\nPair ${i + 1}:`);
      console.log(`  Before: ${beforeImages[i].publicId}`);
      console.log(`  After:  ${afterImages[i].publicId}`);
    }
  }
}

main().catch(console.error);
