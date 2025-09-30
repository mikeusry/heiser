import cloudinaryImages from '../content/cloudinary-images.json';

export interface CloudinaryImage {
  originalUrl: string;
  cloudinaryUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// Export all images
export const images: CloudinaryImage[] = cloudinaryImages;

// Helper function to find image by filename
export function getImageByFilename(filename: string): CloudinaryImage | undefined {
  return images.find(img => img.publicId.includes(filename));
}

// Helper to get image by keyword
export function getImagesByKeyword(keyword: string): CloudinaryImage[] {
  return images.filter(img =>
    img.publicId.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Categorized images for easy access
export const imageCategories = {
  commercial: getImagesByKeyword('commercial'),
  residential: getImagesByKeyword('cleaning'),
  carpet: getImagesByKeyword('carpet'),
  tile: getImagesByKeyword('tile'),
  specialty: getImagesByKeyword('specialty'),
  realEstate: getImagesByKeyword('real_estate'),
};

// Quick access to specific images
export const featuredImages = {
  commercialCleaning: getImageByFilename('Commercial_Cleaning1'),
  biWeeklyCleaning: getImageByFilename('Bi_weekly_house_cleaning'),
  carpetCleaning: getImageByFilename('carpet-cleaning-chicago'),
  tileCleaning: getImageByFilename('tile_cleaning-0'),
  realEstate: getImageByFilename('Real_Estate_Cleaning_2'),
};