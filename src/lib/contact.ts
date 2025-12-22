/**
 * Centralized contact information for The Heiser Group
 * Use this file as the single source of truth for all contact details
 */

export const contact = {
  phone: {
    display: "(773) 545-5200",
    href: "tel:7735455200",
    raw: "7735455200",
  },
  address: {
    street: "1567 BARCLAY BLVD",
    city: "BUFFALO GROVE",
    state: "IL",
    zip: "60089-4518",
    full: "1567 BARCLAY BLVD, BUFFALO GROVE, IL 60089-4518",
    multiline: "1567 BARCLAY BLVD\nBUFFALO GROVE, IL 60089-4518",
  },
  hours: {
    days: "Monday - Friday",
    start: "9:00 AM",
    end: "5:00 PM",
    display: "Monday - Friday, 9:00 AM - 5:00 PM",
  },
  social: {
    facebook: "https://www.facebook.com/theheisergroup",
    linkedin: "https://www.linkedin.com/company/the-heiser-group",
  },
  email: "info@theheisergroup.com", // Update when available
} as const;

export const company = {
  name: "The Heiser Group",
  tagline: "Less Mess. Less Stress.",
  founded: 1978,
  description: "Professional cleaning services in Chicago area and Lake County Illinois",
  shortDescription: "The Heiser Group provides Commercial Cleaning Services & Residential Cleaning Services to Lake County, Illinois to Kenosha, Wisconsin.",
} as const;
