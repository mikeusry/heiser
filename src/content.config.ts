import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: z.object({
    slug: z.string(),
    url: z.string(),
    title: z.string(),
    description: z.string(),
    markdown: z.string(),
    text: z.string(),
    jsonLd: z.array(z.any()).optional(),
    screenshotUrl: z.string().optional(),
  }),
});

export const collections = { pages };
