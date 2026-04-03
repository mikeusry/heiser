import { createAdminConfig } from '@pointdog/admin-core';

export const adminConfig = createAdminConfig({
  siteName: 'Heiser Group',
  siteSlug: 'heiser-group',
  brandId: '93d518a1-723e-4371-be06-0d1e662a2aa5',
  siteUrl: 'https://heisergroup.com',
  modules: {
    dashboard: true,
    siteReview: false,
    contentQueue: false,
    voiceSystem: false,
    seoAudit: true,
    brandGuide: true,
    photoGallery: true,
  },
  colors: {
    primary: '#1A2B3D',      // Navy (brand)
    primaryHover: '#16304d',
    accent: '#D1623C',       // Orange (brand)
    dark: '#0f1f33',
    light: '#FDF5ED',        // Cream (brand)
    primaryText: '#ffffff',
  },
});
