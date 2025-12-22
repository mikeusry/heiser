/**
 * Centralized service area information for The Heiser Group
 * Use this file as the single source of truth for all service area references
 */

export const serviceAreas = {
  primary: "Lake County Illinois",
  secondary: "Kenosha, Wisconsin",
  region: "Greater Chicago Area",
  cities: [
    "North Shore",
    "Buffalo Grove",
    "North Chicago",
    "Libertyville",
    "Waukegan",
    "Lake Forest",
    "Kenosha, WI",
    "Highland Park",
    "Deerfield",
  ],
} as const;

// Pre-formatted text strings for common use cases
export const serviceAreaText = {
  // Full list with all cities
  full: `${serviceAreas.primary} including ${serviceAreas.cities.slice(0, 6).join(', ')} and ${serviceAreas.secondary}`,

  // Short version for footers/compact areas
  short: `${serviceAreas.primary} to ${serviceAreas.secondary}`,

  // For hero sections
  hero: `Lake County Illinois including North Shore, Buffalo Grove, North Chicago, Libertyville, Waukegan, Lake Forest and Kenosha WI`,

  // With HTML strong tags
  withEmphasis: `<strong>Lake County Illinois</strong> including North Shore, Buffalo Grove, North Chicago, Libertyville, Waukegan, Lake Forest and <strong>Kenosha, Wisconsin</strong>`,
} as const;

// For grid displays (like on About page)
export const serviceAreaGrid = serviceAreas.cities;
