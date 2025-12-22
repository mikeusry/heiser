/**
 * Centralized service definitions for The Heiser Group
 * Use this file as the single source of truth for all service information
 */

export interface Service {
  id: string;
  name: string;
  shortName: string;
  url: string;
  description: string;
  shortDescription: string;
  category: 'main' | 'frequency';
}

export const services: Service[] = [
  {
    id: "residential",
    name: "Residential Cleaning",
    shortName: "Residential",
    url: "/residential-cleaning",
    description: "Professional residential cleaning services in Chicago and Lake County Illinois. Hassle-free home cleaning with flat-rate pricing.",
    shortDescription: "Professional home cleaning services with flat-rate pricing",
    category: "main",
  },
  {
    id: "commercial",
    name: "Commercial Cleaning",
    shortName: "Commercial",
    url: "/commercial-cleaning",
    description: "Professional commercial cleaning services in Chicago and Lake County Illinois. Office cleaning, janitorial services, and more.",
    shortDescription: "Office and business cleaning for a professional environment",
    category: "main",
  },
  {
    id: "realty",
    name: "Realty Cleaning",
    shortName: "Realty",
    url: "/realty-cleaning",
    description: "Professional move-in, move-out, and real estate cleaning services in Chicago and Lake County Illinois.",
    shortDescription: "Move-in and move-out cleaning for properties",
    category: "main",
  },
  {
    id: "specialty",
    name: "Specialty Cleaning",
    shortName: "Specialty",
    url: "/specialty-cleaning",
    description: "Carpet cleaning, tile cleaning, and deep cleaning services in Chicago and Lake County Illinois.",
    shortDescription: "Carpet, tile, and deep cleaning services",
    category: "main",
  },
  {
    id: "bi-weekly",
    name: "Bi-Weekly Cleaning",
    shortName: "Bi-Weekly",
    url: "/bi-weekly-cleaning",
    description: "Bi-weekly home cleaning services in Chicago. Our most popular residential cleaning option.",
    shortDescription: "Our most popular option - cleaning every two weeks",
    category: "frequency",
  },
  {
    id: "monthly",
    name: "Monthly Cleaning",
    shortName: "Monthly",
    url: "/monthly-cleaning-service",
    description: "Monthly home cleaning services in Chicago. Perfect for maintaining a tidy home.",
    shortDescription: "Once-a-month deep cleaning service",
    category: "frequency",
  },
] as const;

// Filtered service lists for different contexts
export const mainServices = services.filter(s => s.category === 'main');
export const frequencyServices = services.filter(s => s.category === 'frequency');
export const allServices = services;

// Navigation services (all 6)
export const navServices = services;

// Footer services (main 4 only)
export const footerServices = mainServices;

// Form select options
export const serviceOptions = services.map(s => ({
  value: s.id,
  label: s.name,
}));

// Get service by ID
export function getServiceById(id: string): Service | undefined {
  return services.find(s => s.id === id);
}

// Get service by URL
export function getServiceByUrl(url: string): Service | undefined {
  return services.find(s => s.url === url);
}
