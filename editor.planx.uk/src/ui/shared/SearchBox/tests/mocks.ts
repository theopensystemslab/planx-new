import React from "react";
import { vi } from "vitest";

export type MockRecords = {
  name: string;
  slug: string;
};

export const mockRecords: MockRecords[] = [
  {
    name: "Apply for a certificate",
    slug: "apply-for-a-ceritifcate",
  },
  {
    name: "Apply for an article 4 direction",
    slug: "apply-for-an-article-4-direction",
  },
  { name: "Application for something", slug: "application-for-something" },
];

/** This term should return the first two records */
export const mockFirstSearchTerm = "apply";

/** This term should return the last record */
export const mockSecondSearchTerm = "something";

export const mockSetRecords = vi.fn() as React.Dispatch<
  React.SetStateAction<MockRecords[] | null>
>;
