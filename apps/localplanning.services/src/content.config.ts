import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const legalCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastModified: z.date(),
  }),
});

const genericCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/generic" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  legal: legalCollection,
  generic: genericCollection,
};
