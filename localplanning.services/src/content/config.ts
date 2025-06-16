import { defineCollection, z } from "astro:content";

const legalCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subheading: z.string(),
    lastModified: z.date(),
  }),
});

export const collections = {
  legal: legalCollection,
};