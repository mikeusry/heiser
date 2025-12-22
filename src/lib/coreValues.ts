/**
 * Core values data for The Heiser Group
 * Used by CoreValues.astro component
 */

export interface CoreValue {
  title: string;
  description: string;
}

export const coreValues: CoreValue[] = [
  {
    title: "Honesty",
    description: "Nothing is better than receiving the service that you expected. The Heiser Group's honest approach has been part of our brand for generations.",
  },
  {
    title: "Integrity",
    description: "The Heiser Group is nothing without their word. Our team will always recommend the best course of action to deliver a clean and efficient experience.",
  },
  {
    title: "Quality",
    description: "With all of our cleaning services, The Heiser Group delivers unparalleled quality. Our team ensures that we're exceeding expectations.",
  },
  {
    title: "Service",
    description: "The Heiser Group takes a customer-first approach. Whether we're communicating through phone, text, or email, we deliver a quick response time.",
  },
] as const;
