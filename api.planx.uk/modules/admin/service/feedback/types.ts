import { ValidatedRequestHandler } from "../../../../shared/middleware/validate";
import { z } from "zod";

export interface Feedback {
  id: number;
  text: string;
  category: string;
  createdAt: string;
  location: string;
  screenshotUrl: string;
  device: Device;
  metadata?: Metadata[];
}

export const METADATA_KEYS = [
  "address",
  "uprn",
  "title",
  "data",
  "service",
  "team",
  "component-metadata",
  "reason",
  "project-type",
  "breadcrumbs",
] as const;

export type MetadataKey = (typeof METADATA_KEYS)[number];

export interface Metadata {
  key: MetadataKey;
  value: string | Record<string, string>;
}

export interface Device {
  client: Client;
  os: Os;
}

export interface Client {
  name: string;
  version: string;
}

export interface Os {
  name: string;
  version: string;
}

export type ParsedFeedback = Feedback & {
  [key in MetadataKey]?: string | Record<string, string>;
};

export const downloadFeedbackCSVSchema = z.object({
  query: z.object({
    cookie: z.string(),
  }),
});

export type DownloadFeedbackCSVController = ValidatedRequestHandler<
  typeof downloadFeedbackCSVSchema,
  NodeJS.ReadableStream
>;
