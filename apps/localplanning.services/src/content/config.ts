import { defineCollection, z } from "astro:content";

const legalCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subheading: z.string(),
    lastModified: z.date(),
  }),
});

const genericCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    subheading: z.string().optional(),
  }),
});

export const collections = {
  legal: legalCollection,
  generic: genericCollection,
};
