/**
 * Centralized testimonials for The Heiser Group
 * Use this file as the single source of truth for all customer testimonials
 */

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title?: string;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "tom-strossner",
    quote: "After major remodeling and renovation in our building, it was a disaster. David came in and assessed the situation and sent his two best guys. In one evening, they cleaned the inside of the building completely.",
    author: "Tom Strossner",
    featured: true,
  },
  {
    id: "sarah-johnson",
    quote: "The Heiser Group is the only company we use for years now. They are thorough, professional, and always deliver exceptional results. Highly recommended!",
    author: "Sarah Johnson",
    featured: true,
  },
  {
    id: "michael-chen",
    quote: "Outstanding service! The team was punctual, detail-oriented, and left our office spotless. We couldn't be happier with the results.",
    author: "Michael Chen",
    featured: true,
  },
  {
    id: "jennifer-m",
    quote: "The Heiser Group has been cleaning our home for over 3 years now. They are always on time, professional, and do an excellent job. Highly recommend!",
    author: "Jennifer M.",
  },
  {
    id: "robert-k",
    quote: "Best cleaning service we've ever used. The team is thorough, trustworthy, and our house always looks amazing after they visit.",
    author: "Robert K.",
  },
  {
    id: "amanda-s",
    quote: "As a real estate agent, I rely on The Heiser Group for all my property turnovers. They never disappoint and always deliver on time.",
    author: "Amanda S.",
    title: "Real Estate Agent",
  },
] as const;

// Featured testimonials (for carousel)
export const featuredTestimonials = testimonials.filter(t => t.featured);

// Additional testimonials (for results page grid)
export const additionalTestimonials = testimonials.filter(t => !t.featured);

// All testimonials
export const allTestimonials = testimonials;

// Get testimonial by ID
export function getTestimonialById(id: string): Testimonial | undefined {
  return testimonials.find(t => t.id === id);
}

// Stats for results page
export const stats = [
  { value: "1000+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  { value: "5★", label: "Average Rating" },
  { value: "100%", label: "Satisfaction Guaranteed" },
] as const;
